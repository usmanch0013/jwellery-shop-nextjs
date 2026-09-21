import JSZip from "jszip";
import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/products/mappers";
import { refreshCategoryProductCounts } from "@/lib/admin/category-counts";
import type {
  BackupImageRef,
  BackupProductRecord,
  ProductBackupPayload,
} from "@/lib/admin/product-backup";

export type ImportResult = {
  created: number;
  updated: number;
  failed: number;
  errors: string[];
};

function mimeFromExtension(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "avif":
      return "image/avif";
    case "svg":
      return "image/svg+xml";
    default:
      return "image/jpeg";
  }
}

async function uniqueProductSlug(
  admin: SupabaseClient,
  base: string,
  excludeId?: string
) {
  const root = slugify(base) || `product-${Date.now()}`;
  let slug = root;
  let n = 2;
  while (true) {
    const { data } = await admin
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data || data.id === excludeId) return slug;
    slug = `${root}-${n++}`;
  }
}

async function uploadImageBytes(
  admin: SupabaseClient,
  bytes: Buffer,
  fileName: string
): Promise<string> {
  const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const path = `uploads/import-${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await admin.storage.from("media").upload(path, bytes, {
    contentType: mimeFromExtension(fileName),
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = admin.storage.from("media").getPublicUrl(path);
  return publicUrl;
}

async function resolveImageRef(
  ref: BackupImageRef | null | undefined,
  imageFiles: Map<string, Buffer> | undefined,
  admin: SupabaseClient,
  uploadCache: Map<string, string>
): Promise<string | null> {
  if (!ref) return null;

  const cacheKey = ref.localPath || ref.originalUrl;
  if (cacheKey && uploadCache.has(cacheKey)) {
    return uploadCache.get(cacheKey) ?? null;
  }

  if (ref.localPath && imageFiles) {
    const bytes =
      imageFiles.get(ref.localPath) ??
      imageFiles.get(ref.localPath.replace(/^images\//, ""));
    if (bytes) {
      const url = await uploadImageBytes(admin, bytes, ref.localPath);
      uploadCache.set(cacheKey, url);
      return url;
    }
  }

  if (ref.originalUrl?.trim()) {
    uploadCache.set(cacheKey, ref.originalUrl);
    return ref.originalUrl;
  }

  return null;
}

export function parseBackupJson(text: string): ProductBackupPayload {
  const data = JSON.parse(text) as unknown;

  if (Array.isArray(data)) {
    return {
      version: 1,
      exportedAt: "",
      productCount: data.length,
      categories: [],
      tags: [],
      products: data as BackupProductRecord[],
    };
  }

  if (
    data &&
    typeof data === "object" &&
    "products" in data &&
    Array.isArray((data as ProductBackupPayload).products)
  ) {
    return data as ProductBackupPayload;
  }

  throw new Error("Invalid backup JSON format");
}

export async function parseBackupZip(buffer: Buffer): Promise<{
  payload: ProductBackupPayload;
  imageFiles: Map<string, Buffer>;
}> {
  const zip = await JSZip.loadAsync(buffer);
  const productsRaw = await zip.file("products.json")?.async("string");
  if (!productsRaw) {
    throw new Error("Invalid backup ZIP: products.json not found");
  }

  const products = JSON.parse(productsRaw) as BackupProductRecord[];
  const categories = JSON.parse(
    (await zip.file("categories.json")?.async("string")) ?? "[]"
  ) as ProductBackupPayload["categories"];
  const tags = JSON.parse(
    (await zip.file("product_tags.json")?.async("string")) ?? "[]"
  ) as ProductBackupPayload["tags"];
  const manifest = JSON.parse(
    (await zip.file("manifest.json")?.async("string")) ?? "{}"
  ) as { version?: number; exportedAt?: string };

  const imageFiles = new Map<string, Buffer>();
  for (const [path, file] of Object.entries(zip.files)) {
    if (!path.startsWith("images/") || file.dir) continue;
    const bytes = Buffer.from(await file.async("nodebuffer"));
    imageFiles.set(path.replace(/^images\//, ""), bytes);
  }

  return {
    payload: {
      version: 1,
      exportedAt: manifest.exportedAt ?? "",
      productCount: products.length,
      categories,
      tags,
      products,
    },
    imageFiles,
  };
}

async function ensureCategories(
  admin: SupabaseClient,
  categories: ProductBackupPayload["categories"]
) {
  const { data: existing } = await admin.from("categories").select("id, slug");
  const bySlug = new Map((existing ?? []).map((c) => [c.slug, c.id]));

  for (const category of categories) {
    if (!category.slug || bySlug.has(category.slug)) continue;
    const { data, error } = await admin
      .from("categories")
      .insert({
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        product_count: 0,
      })
      .select("id, slug")
      .single();
    if (!error && data) bySlug.set(data.slug, data.id);
  }

  return bySlug;
}

async function ensureTags(
  admin: SupabaseClient,
  tags: ProductBackupPayload["tags"]
) {
  const { data: existing } = await admin.from("product_tags").select("id, slug");
  const bySlug = new Map((existing ?? []).map((t) => [t.slug, t.id]));

  for (const tag of tags) {
    if (!tag.slug || bySlug.has(tag.slug)) continue;
    const { data, error } = await admin
      .from("product_tags")
      .insert({ name: tag.name, slug: tag.slug })
      .select("id, slug")
      .single();
    if (!error && data) bySlug.set(data.slug, data.id);
  }

  return bySlug;
}

async function syncGallery(
  admin: SupabaseClient,
  productId: string,
  urls: string[]
) {
  await admin.from("product_images").delete().eq("product_id", productId);
  if (urls.length === 0) return;
  await admin.from("product_images").insert(
    urls.map((url, index) => ({
      product_id: productId,
      url,
      sort_order: index,
    }))
  );
}

async function syncTags(
  admin: SupabaseClient,
  productId: string,
  tagIds: string[]
) {
  await admin.from("product_tag_links").delete().eq("product_id", productId);
  if (tagIds.length === 0) return;
  await admin.from("product_tag_links").insert(
    tagIds.map((tagId) => ({
      product_id: productId,
      tag_id: tagId,
    }))
  );
}

async function syncVariations(
  admin: SupabaseClient,
  productId: string,
  variations: BackupProductRecord["variations"],
  imageFiles: Map<string, Buffer> | undefined,
  uploadCache: Map<string, string>
) {
  await admin.from("product_variations").delete().eq("product_id", productId);
  if (variations.length === 0) return;

  const rows = [];
  for (let i = 0; i < variations.length; i++) {
    const variation = variations[i];
    const imageUrl = await resolveImageRef(
      variation.image,
      imageFiles,
      admin,
      uploadCache
    );
    rows.push({
      product_id: productId,
      sku: variation.sku || null,
      name: variation.name,
      price: variation.price ?? null,
      original_price: variation.originalPrice ?? null,
      stock: variation.stock,
      image_url: imageUrl,
      attributes: variation.attributes ?? {},
      sort_order: variation.sortOrder ?? i,
      is_default: variation.isDefault ?? i === 0,
    });
  }

  await admin.from("product_variations").insert(rows);
}

export async function importProductBackup(
  admin: SupabaseClient,
  payload: ProductBackupPayload,
  imageFiles?: Map<string, Buffer>
): Promise<ImportResult> {
  const result: ImportResult = {
    created: 0,
    updated: 0,
    failed: 0,
    errors: [],
  };

  if (!payload.products.length) {
    return result;
  }

  const categoryBySlug = await ensureCategories(admin, payload.categories);
  const tagBySlug = await ensureTags(admin, payload.tags);

  const { data: allCategories } = await admin.from("categories").select("id, slug, name");
  const categoryByName = new Map<string, string>();
  for (const c of allCategories ?? []) {
    categoryBySlug.set(c.slug, c.id);
    categoryByName.set(c.name.trim().toLowerCase(), c.id);
  }

  const { data: allTags } = await admin.from("product_tags").select("id, slug");
  for (const t of allTags ?? []) {
    tagBySlug.set(t.slug, t.id);
  }

  const fallbackCategoryId =
    [...categoryBySlug.values()][0] ??
    (await admin.from("categories").select("id").limit(1).maybeSingle()).data?.id;

  if (!fallbackCategoryId) {
    throw new Error("No categories found. Add at least one category before import.");
  }

  const uploadCache = new Map<string, string>();

  for (const product of payload.products) {
    try {
      const featuredUrl = await resolveImageRef(
        product.images.featured,
        imageFiles,
        admin,
        uploadCache
      );
      if (!featuredUrl) {
        throw new Error("Featured image missing");
      }

      const hoverUrl = await resolveImageRef(
        product.images.hover,
        imageFiles,
        admin,
        uploadCache
      );

      const galleryUrls: string[] = [];
      for (const item of product.images.gallery) {
        const url = await resolveImageRef(item, imageFiles, admin, uploadCache);
        if (url) galleryUrls.push(url);
      }

      const categoryFromPayload = payload.categories.find(
        (c) => c.slug === product.categorySlug
      );
      const categoryId =
        (product.categorySlug && categoryBySlug.get(product.categorySlug)) ||
        (categoryFromPayload?.name &&
          categoryByName.get(categoryFromPayload.name.trim().toLowerCase())) ||
        fallbackCategoryId;

      const tagIds = product.tags
        .map((slug) => tagBySlug.get(slug))
        .filter((id): id is string => Boolean(id));

      const slugBase = product.slug || slugify(product.name);
      let existing: { id: string; slug: string } | null = null;

      if (product.sku?.trim()) {
        const { data } = await admin
          .from("products")
          .select("id, slug")
          .eq("sku", product.sku.trim())
          .maybeSingle();
        existing = data;
      }

      if (!existing) {
        const { data } = await admin
          .from("products")
          .select("id, slug")
          .eq("slug", slugBase)
          .maybeSingle();
        existing = data;
      }

      const stock = product.stock ?? 0;
      const soldOut = product.flags.soldOut || stock <= 0;

      const row = {
        name: product.name,
        slug: existing?.slug ?? (await uniqueProductSlug(admin, slugBase)),
        short_description: product.shortDescription ?? "",
        sku: product.sku,
        status: product.status ?? "published",
        description: product.description || product.name,
        price: product.price,
        original_price: product.originalPrice,
        category_id: categoryId,
        material: product.material || "Mixed",
        stock,
        image: featuredUrl,
        hover_image: hoverUrl,
        is_new: product.flags.isNew ?? false,
        is_bestseller: product.flags.isBestseller ?? false,
        sold_out: soldOut,
        rating_avg: product.ratingAvg ?? 0,
        review_count: product.reviewCount ?? 0,
        sort_order: product.sortOrder ?? 0,
        updated_at: new Date().toISOString(),
      };

      const createRow = existing
        ? row
        : { ...row, legacy_id: product.legacyId ?? null };

      let productId: string;

      if (existing) {
        const { error } = await admin
          .from("products")
          .update(row)
          .eq("id", existing.id);
        if (error) throw new Error(error.message);
        productId = existing.id;
        result.updated++;
      } else {
        const { data: created, error } = await admin
          .from("products")
          .insert(createRow)
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        productId = created.id;
        result.created++;
      }

      await Promise.all([
        syncGallery(admin, productId, galleryUrls),
        syncTags(admin, productId, tagIds),
        syncVariations(admin, productId, product.variations, imageFiles, uploadCache),
      ]);
    } catch (err) {
      result.failed++;
      const message = err instanceof Error ? err.message : "Import failed";
      result.errors.push(`${product.name}: ${message}`);
    }
  }

  await refreshCategoryProductCounts(admin);
  return result;
}
