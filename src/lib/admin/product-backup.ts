import JSZip from "jszip";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DbCategory,
  DbProduct,
  DbProductImage,
  DbProductTag,
  DbProductVariation,
} from "@/lib/database.types";

export type BackupImageRef = {
  localPath: string;
  originalUrl: string;
  downloaded: boolean;
};

export type BackupProductRecord = {
  id: string;
  legacyId: string | null;
  slug: string;
  name: string;
  description: string;
  shortDescription: string | null;
  sku: string | null;
  status: "draft" | "published";
  price: number;
  originalPrice: number | null;
  categorySlug: string | null;
  material: string;
  stock: number;
  sortOrder: number;
  flags: {
    isNew: boolean;
    isBestseller: boolean;
    soldOut: boolean;
  };
  ratingAvg: number;
  reviewCount: number;
  createdAt: string;
  images: {
    featured: BackupImageRef;
    hover: BackupImageRef | null;
    gallery: (BackupImageRef & { sortOrder: number })[];
  };
  tags: string[];
  variations: {
    sku: string | null;
    name: string;
    price: number | null;
    originalPrice: number | null;
    stock: number;
    attributes: Record<string, string>;
    sortOrder: number;
    isDefault: boolean;
    image: BackupImageRef | null;
  }[];
};

export type ProductBackupPayload = {
  version: 1;
  exportedAt: string;
  productCount: number;
  categories: {
    slug: string;
    name: string;
    description: string | null;
    image: string | null;
    productCount: number;
  }[];
  tags: { slug: string; name: string }[];
  products: BackupProductRecord[];
};

type ProductWithCategory = DbProduct & {
  categories: { slug: string; name: string } | null;
};

function safeSlug(slug: string, fallback: string) {
  const base = slug.trim() || fallback;
  return base.replace(/[^a-z0-9-]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "product";
}

function parseSupabaseStoragePath(url: string): string | null {
  const marker = "/storage/v1/object/public/media/";
  if (!url.includes(marker)) return null;
  return decodeURIComponent(url.split(marker)[1] ?? "");
}

function extensionFromUrl(url: string, mimeType?: string | null) {
  const fromPath = url.split("?")[0]?.split(".").pop()?.toLowerCase();
  if (fromPath && ["jpg", "jpeg", "png", "webp", "gif", "avif", "svg"].includes(fromPath)) {
    return fromPath === "jpeg" ? "jpg" : fromPath;
  }
  if (mimeType?.includes("png")) return "png";
  if (mimeType?.includes("webp")) return "webp";
  if (mimeType?.includes("gif")) return "gif";
  if (mimeType?.includes("avif")) return "avif";
  if (mimeType?.includes("svg")) return "svg";
  return "jpg";
}

async function downloadImageBytes(
  url: string,
  admin: SupabaseClient
): Promise<{ bytes: Buffer; ext: string } | null> {
  if (!url?.trim()) return null;

  const storagePath = parseSupabaseStoragePath(url);
  if (storagePath) {
    const { data, error } = await admin.storage.from("media").download(storagePath);
    if (error || !data) return null;
    const bytes = Buffer.from(await data.arrayBuffer());
    return { bytes, ext: extensionFromUrl(url, data.type) };
  }

  try {
    const absoluteUrl = url.startsWith("/")
      ? `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}${url}`
      : url;
    const res = await fetch(absoluteUrl, { cache: "no-store" });
    if (!res.ok) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    return {
      bytes,
      ext: extensionFromUrl(url, res.headers.get("content-type")),
    };
  } catch {
    return null;
  }
}

async function addImageToZip(
  folder: JSZip,
  localPath: string,
  originalUrl: string,
  admin: SupabaseClient,
  cache: Map<string, boolean>
): Promise<BackupImageRef> {
  if (cache.has(originalUrl)) {
    return {
      localPath,
      originalUrl,
      downloaded: cache.get(originalUrl) ?? false,
    };
  }

  const file = await downloadImageBytes(originalUrl, admin);
  if (file) {
    folder.file(localPath, file.bytes);
    cache.set(originalUrl, true);
    return { localPath, originalUrl, downloaded: true };
  }

  cache.set(originalUrl, false);
  return { localPath, originalUrl, downloaded: false };
}

export async function fetchCatalogForBackup(
  admin: SupabaseClient,
  productIds?: string[]
): Promise<{
  categories: DbCategory[];
  products: ProductWithCategory[];
  galleryByProduct: Map<string, DbProductImage[]>;
  variationsByProduct: Map<string, DbProductVariation[]>;
  tagsByProduct: Map<string, DbProductTag[]>;
  allTags: DbProductTag[];
}> {
  let productsQuery = admin
    .from("products")
    .select("*, categories(slug, name)")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (productIds?.length) {
    productsQuery = productsQuery.in("id", productIds);
  }

  const [
    { data: products },
    { data: categories },
    { data: galleryRows },
    { data: variationRows },
    { data: tagLinks },
    { data: allTags },
  ] = await Promise.all([
    productsQuery,
    admin.from("categories").select("*").order("name"),
    admin.from("product_images").select("*").order("sort_order"),
    admin.from("product_variations").select("*").order("sort_order"),
    admin.from("product_tag_links").select("product_id, tag_id"),
    admin.from("product_tags").select("*").order("name"),
  ]);

  const productList = (products ?? []) as ProductWithCategory[];
  const allowedIds = new Set(productList.map((p) => p.id));

  const galleryByProduct = new Map<string, DbProductImage[]>();
  for (const row of galleryRows ?? []) {
    if (!allowedIds.has(row.product_id)) continue;
    const list = galleryByProduct.get(row.product_id) ?? [];
    list.push(row as DbProductImage);
    galleryByProduct.set(row.product_id, list);
  }

  const variationsByProduct = new Map<string, DbProductVariation[]>();
  for (const row of variationRows ?? []) {
    if (!allowedIds.has(row.product_id)) continue;
    const list = variationsByProduct.get(row.product_id) ?? [];
    list.push(row as DbProductVariation);
    variationsByProduct.set(row.product_id, list);
  }

  const tagMap = new Map((allTags ?? []).map((t) => [t.id, t as DbProductTag]));
  const tagsByProduct = new Map<string, DbProductTag[]>();
  for (const link of tagLinks ?? []) {
    if (!allowedIds.has(link.product_id)) continue;
    const tag = tagMap.get(link.tag_id);
    if (!tag) continue;
    const list = tagsByProduct.get(link.product_id) ?? [];
    list.push(tag);
    tagsByProduct.set(link.product_id, list);
  }

  return {
    categories: (categories ?? []) as DbCategory[],
    products: productList,
    galleryByProduct,
    variationsByProduct,
    tagsByProduct,
    allTags: (allTags ?? []) as DbProductTag[],
  };
}

export async function buildProductBackupZip(
  admin: SupabaseClient,
  productIds?: string[]
): Promise<{ buffer: Buffer; payload: ProductBackupPayload }> {
  const catalog = await fetchCatalogForBackup(admin, productIds);
  const zip = new JSZip();
  const imagesFolder = zip.folder("images");
  if (!imagesFolder) throw new Error("Could not create images folder");

  const downloadCache = new Map<string, boolean>();
  const backupProducts: BackupProductRecord[] = [];

  for (const product of catalog.products) {
    const slug = safeSlug(product.slug, product.id.slice(0, 8));
    const gallery = catalog.galleryByProduct.get(product.id) ?? [];
    const tags = catalog.tagsByProduct.get(product.id) ?? [];
    const variations = catalog.variationsByProduct.get(product.id) ?? [];

    const featured = await addImageToZip(
      imagesFolder,
      `${slug}-featured.${extensionFromUrl(product.image)}`,
      product.image,
      admin,
      downloadCache
    );

    let hover: BackupImageRef | null = null;
    if (product.hover_image) {
      hover = await addImageToZip(
        imagesFolder,
        `${slug}-hover.${extensionFromUrl(product.hover_image)}`,
        product.hover_image,
        admin,
        downloadCache
      );
    }

    const galleryRefs: (BackupImageRef & { sortOrder: number })[] = [];
    for (let i = 0; i < gallery.length; i++) {
      const item = gallery[i];
      const ref = await addImageToZip(
        imagesFolder,
        `${slug}-gallery-${i}.${extensionFromUrl(item.url)}`,
        item.url,
        admin,
        downloadCache
      );
      galleryRefs.push({ ...ref, sortOrder: item.sort_order ?? i });
    }

    const variationRefs = [];
    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];
      let image: BackupImageRef | null = null;
      if (variation.image_url) {
        const suffix = variation.sku?.replace(/[^a-z0-9-]+/gi, "-") || String(i);
        image = await addImageToZip(
          imagesFolder,
          `${slug}-variation-${suffix}.${extensionFromUrl(variation.image_url)}`,
          variation.image_url,
          admin,
          downloadCache
        );
      }
      variationRefs.push({
        sku: variation.sku,
        name: variation.name,
        price: variation.price,
        originalPrice: variation.original_price,
        stock: variation.stock,
        attributes: (variation.attributes ?? {}) as Record<string, string>,
        sortOrder: variation.sort_order ?? i,
        isDefault: variation.is_default,
        image,
      });
    }

    backupProducts.push({
      id: product.id,
      legacyId: product.legacy_id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      shortDescription: product.short_description ?? null,
      sku: product.sku ?? null,
      status: product.status ?? "published",
      price: product.price,
      originalPrice: product.original_price,
      categorySlug: product.categories?.slug ?? null,
      material: product.material,
      stock: product.stock,
      sortOrder: product.sort_order ?? 0,
      flags: {
        isNew: product.is_new,
        isBestseller: product.is_bestseller,
        soldOut: product.sold_out,
      },
      ratingAvg: Number(product.rating_avg) || 0,
      reviewCount: product.review_count,
      createdAt: product.created_at,
      images: {
        featured,
        hover,
        gallery: galleryRefs,
      },
      tags: tags.map((t) => t.slug),
      variations: variationRefs,
    });
  }

  const payload: ProductBackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    productCount: backupProducts.length,
    categories: catalog.categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description ?? null,
      image: c.image ?? null,
      productCount: c.product_count ?? 0,
    })),
    tags: catalog.allTags.map((t) => ({ slug: t.slug, name: t.name })),
    products: backupProducts,
  };

  zip.file("manifest.json", JSON.stringify({
    version: payload.version,
    exportedAt: payload.exportedAt,
    productCount: payload.productCount,
    categoryCount: payload.categories.length,
    tagCount: payload.tags.length,
  }, null, 2));
  zip.file("categories.json", JSON.stringify(payload.categories, null, 2));
  zip.file("product_tags.json", JSON.stringify(payload.tags, null, 2));
  zip.file("products.json", JSON.stringify(backupProducts, null, 2));

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return { buffer, payload };
}

export async function buildProductBackupJson(
  admin: SupabaseClient,
  productIds?: string[]
): Promise<ProductBackupPayload> {
  const catalog = await fetchCatalogForBackup(admin, productIds);

  const products: BackupProductRecord[] = catalog.products.map((product) => {
    const gallery = catalog.galleryByProduct.get(product.id) ?? [];
    const tags = catalog.tagsByProduct.get(product.id) ?? [];
    const variations = catalog.variationsByProduct.get(product.id) ?? [];

    return {
      id: product.id,
      legacyId: product.legacy_id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      shortDescription: product.short_description ?? null,
      sku: product.sku ?? null,
      status: product.status ?? "published",
      price: product.price,
      originalPrice: product.original_price,
      categorySlug: product.categories?.slug ?? null,
      material: product.material,
      stock: product.stock,
      sortOrder: product.sort_order ?? 0,
      flags: {
        isNew: product.is_new,
        isBestseller: product.is_bestseller,
        soldOut: product.sold_out,
      },
      ratingAvg: Number(product.rating_avg) || 0,
      reviewCount: product.review_count,
      createdAt: product.created_at,
      images: {
        featured: {
          localPath: "",
          originalUrl: product.image,
          downloaded: false,
        },
        hover: product.hover_image
          ? { localPath: "", originalUrl: product.hover_image, downloaded: false }
          : null,
        gallery: gallery.map((item, i) => ({
          localPath: "",
          originalUrl: item.url,
          downloaded: false,
          sortOrder: item.sort_order ?? i,
        })),
      },
      tags: tags.map((t) => t.slug),
      variations: variations.map((variation, i) => ({
        sku: variation.sku,
        name: variation.name,
        price: variation.price,
        originalPrice: variation.original_price,
        stock: variation.stock,
        attributes: (variation.attributes ?? {}) as Record<string, string>,
        sortOrder: variation.sort_order ?? i,
        isDefault: variation.is_default,
        image: variation.image_url
          ? { localPath: "", originalUrl: variation.image_url, downloaded: false }
          : null,
      })),
    };
  });

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    productCount: products.length,
    categories: catalog.categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description ?? null,
      image: c.image ?? null,
      productCount: c.product_count ?? 0,
    })),
    tags: catalog.allTags.map((t) => ({ slug: t.slug, name: t.name })),
    products,
  };
}
