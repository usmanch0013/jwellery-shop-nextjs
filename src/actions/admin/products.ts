"use server";

import { getAdminClient } from "@/lib/admin/auth";
import { refreshCategoryProductCounts } from "@/lib/admin/category-counts";
import { slugify } from "@/lib/products/mappers";
import { normalizeSalePrices } from "@/lib/products/sale";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const variationInputSchema = z.object({
  id: z.string().optional(),
  sku: z.string().optional(),
  name: z.string().min(1),
  price: z.number().nullable().optional(),
  originalPrice: z.number().nullable().optional(),
  stock: z.number().int().min(0),
  imageUrl: z.string().optional(),
  attributes: z.record(z.string(), z.string()).optional(),
  isDefault: z.boolean().optional(),
});

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().min(10),
  sku: z.string().optional(),
  status: z.enum(["draft", "published"]).default("published"),
  price: z.coerce.number().positive(),
  originalPrice: z.coerce.number().optional(),
  categoryId: z.string().uuid(),
  material: z.string().min(2),
  stock: z.coerce.number().int().min(0),
  image: z.string().min(1),
  hoverImage: z.string().optional(),
  isNew: z.coerce.boolean().optional(),
  isBestseller: z.coerce.boolean().optional(),
  soldOut: z.coerce.boolean().optional(),
  gallery: z.array(z.string().min(1)).default([]),
  tagIds: z.array(z.string().uuid()).default([]),
  variations: z.array(variationInputSchema).default([]),
});

function parseProductForm(formData: FormData) {
  let gallery: string[] = [];
  let tagIds: string[] = [];
  let variations: z.infer<typeof variationInputSchema>[] = [];

  try {
    const galleryRaw = formData.get("galleryJson");
    if (typeof galleryRaw === "string" && galleryRaw) {
      gallery = JSON.parse(galleryRaw);
    }
  } catch {
    gallery = [];
  }

  try {
    const tagsRaw = formData.get("tagIdsJson");
    if (typeof tagsRaw === "string" && tagsRaw) {
      tagIds = JSON.parse(tagsRaw);
    }
  } catch {
    tagIds = [];
  }

  try {
    const variationsRaw = formData.get("variationsJson");
    if (typeof variationsRaw === "string" && variationsRaw) {
      variations = JSON.parse(variationsRaw);
    }
  } catch {
    variations = [];
  }

  const { price, originalPrice } = normalizeSalePrices(
    Number(formData.get("price") || 0),
    formData.get("originalPrice")
      ? Number(formData.get("originalPrice"))
      : null
  );

  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    shortDescription: formData.get("shortDescription") || "",
    description: formData.get("description"),
    sku: formData.get("sku") || undefined,
    status: formData.get("status") || "published",
    price,
    originalPrice,
    categoryId: formData.get("categoryId"),
    material: formData.get("material"),
    stock: formData.get("stock"),
    image: formData.get("image"),
    hoverImage: formData.get("hoverImage"),
    isNew: formData.get("isNew") === "on",
    isBestseller: formData.get("isBestseller") === "on",
    soldOut: formData.get("soldOut") === "on",
    gallery,
    tagIds,
    variations,
  });
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
  variations: z.infer<typeof variationInputSchema>[]
) {
  await admin.from("product_variations").delete().eq("product_id", productId);
  if (variations.length === 0) return;

  await admin.from("product_variations").insert(
    variations.map((v, index) => ({
      product_id: productId,
      sku: v.sku || null,
      name: v.name,
      price: v.price ?? null,
      original_price: v.originalPrice ?? null,
      stock: v.stock,
      image_url: v.imageUrl || null,
      attributes: v.attributes ?? {},
      sort_order: index,
      is_default: v.isDefault ?? index === 0,
    }))
  );
}

function revalidateProductPaths(slug: string, id?: string) {
  revalidatePath("/");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  if (id) revalidatePath(`/admin/products/${id}`);
}

async function nextProductSortOrder(admin: SupabaseClient) {
  const { data } = await admin
    .from("products")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.sort_order ?? -1) + 1;
}

export async function createProductAction(formData: FormData) {
  const parsed = parseProductForm(formData);
  if (!parsed.success) return { error: "Invalid product data" };

  const admin = await getAdminClient();
  const data = parsed.data;
  const slug = data.slug || slugify(data.name);
  const stock = data.stock;
  const soldOut = data.soldOut || stock <= 0;
  const sortOrder = await nextProductSortOrder(admin);

  const { data: product, error } = await admin
    .from("products")
    .insert({
      name: data.name,
      slug,
      short_description: data.shortDescription ?? "",
      sku: data.sku || null,
      status: data.status,
      description: data.description,
      price: data.price,
      original_price: data.originalPrice ?? null,
      category_id: data.categoryId,
      material: data.material,
      stock,
      image: data.image,
      hover_image: data.hoverImage || null,
      is_new: data.isNew ?? false,
      is_bestseller: data.isBestseller ?? false,
      sold_out: soldOut,
      sort_order: sortOrder,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await Promise.all([
    syncGallery(admin, product.id, data.gallery),
    syncTags(admin, product.id, data.tagIds),
    syncVariations(admin, product.id, data.variations),
  ]);

  await refreshCategoryProductCounts(admin);
  revalidateProductPaths(slug, product.id);
  redirect(`/admin/products/${product.id}`);
}

export async function updateProductAction(id: string, formData: FormData) {
  const parsed = parseProductForm(formData);
  if (!parsed.success) return { error: "Invalid product data" };

  const admin = await getAdminClient();
  const data = parsed.data;
  const slug = data.slug || slugify(data.name);
  const stock = data.stock;
  const soldOut = data.soldOut || stock <= 0;

  const { error } = await admin
    .from("products")
    .update({
      name: data.name,
      slug,
      short_description: data.shortDescription ?? "",
      sku: data.sku || null,
      status: data.status,
      description: data.description,
      price: data.price,
      original_price: data.originalPrice ?? null,
      category_id: data.categoryId,
      material: data.material,
      stock,
      image: data.image,
      hover_image: data.hoverImage || null,
      is_new: data.isNew ?? false,
      is_bestseller: data.isBestseller ?? false,
      sold_out: soldOut,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  await Promise.all([
    syncGallery(admin, id, data.gallery),
    syncTags(admin, id, data.tagIds),
    syncVariations(admin, id, data.variations),
  ]);

  await refreshCategoryProductCounts(admin);
  revalidateProductPaths(slug, id);
  return { success: true };
}

async function uniqueProductSlug(
  admin: SupabaseClient,
  base: string,
  excludeId?: string
) {
  const root = slugify(base) || `draft-${Date.now()}`;
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

const draftSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.coerce.number().min(0).optional(),
  originalPrice: z.coerce.number().optional(),
  categoryId: z.string().uuid().optional(),
  material: z.string().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  image: z.string().optional(),
  hoverImage: z.string().optional(),
  isNew: z.coerce.boolean().optional(),
  isBestseller: z.coerce.boolean().optional(),
  soldOut: z.coerce.boolean().optional(),
  gallery: z.array(z.string()).default([]),
  tagIds: z.array(z.string().uuid()).default([]),
  variations: z.array(variationInputSchema).default([]),
});

function parseDraftForm(formData: FormData) {
  const parsed = parseProductForm(formData);
  if (parsed.success) {
    return { success: true as const, data: { ...parsed.data, status: "draft" as const } };
  }

  let gallery: string[] = [];
  let tagIds: string[] = [];
  let variations: z.infer<typeof variationInputSchema>[] = [];
  try {
    const galleryRaw = formData.get("galleryJson");
    if (typeof galleryRaw === "string" && galleryRaw) gallery = JSON.parse(galleryRaw);
  } catch {
    gallery = [];
  }
  try {
    const tagsRaw = formData.get("tagIdsJson");
    if (typeof tagsRaw === "string" && tagsRaw) tagIds = JSON.parse(tagsRaw);
  } catch {
    tagIds = [];
  }
  try {
    const variationsRaw = formData.get("variationsJson");
    if (typeof variationsRaw === "string" && variationsRaw) {
      variations = JSON.parse(variationsRaw);
    }
  } catch {
    variations = [];
  }

  const priceRaw = formData.get("price");
  const stockRaw = formData.get("stock");
  const originalRaw = formData.get("originalPrice");

  const { price, originalPrice } = normalizeSalePrices(
    Number(priceRaw || 0),
    originalRaw === "" || originalRaw == null ? null : Number(originalRaw)
  );

  return draftSchema.safeParse({
    name: String(formData.get("name") ?? "").trim() || undefined,
    slug: formData.get("slug") || undefined,
    shortDescription: formData.get("shortDescription") || "",
    description: formData.get("description") || "",
    sku: formData.get("sku") || undefined,
    price,
    originalPrice,
    categoryId: formData.get("categoryId") || undefined,
    material: formData.get("material") || "",
    stock: stockRaw === "" || stockRaw == null ? 0 : stockRaw,
    image: formData.get("image") || "",
    hoverImage: formData.get("hoverImage") || undefined,
    isNew: formData.get("isNew") === "on",
    isBestseller: formData.get("isBestseller") === "on",
    soldOut: formData.get("soldOut") === "on",
    gallery,
    tagIds,
    variations: variations.filter((v) => v.name?.trim()),
  });
}

export async function saveProductDraftAction(
  productId: string | null,
  formData: FormData
) {
  const parsed = parseDraftForm(formData);
  if (!parsed.success) {
    return { error: "Could not save draft. Add a product name and try again." };
  }

  const admin = await getAdminClient();
  const data = parsed.data;
  const name = (data.name?.trim() || "Auto draft").slice(0, 200);
  const categoryId = data.categoryId;

  if (!categoryId) {
    return { error: "Choose a category before saving a draft." };
  }

  const slug = await uniqueProductSlug(
    admin,
    data.slug || name,
    productId ?? undefined
  );
  const variations = "variations" in data ? data.variations : [];
  const stock = data.stock ?? 0;
  const image = data.image?.trim() || "/window.svg";

  const row = {
    name,
    slug,
    short_description: data.shortDescription ?? "",
    sku: data.sku || null,
    status: "draft" as const,
    description: data.description ?? "",
    price: data.price ?? 0,
    original_price: data.originalPrice ?? null,
    category_id: categoryId,
    material: data.material ?? "",
    stock,
    image,
    hover_image: data.hoverImage || null,
    is_new: data.isNew ?? false,
    is_bestseller: data.isBestseller ?? false,
    sold_out: data.soldOut || stock <= 0,
    updated_at: new Date().toISOString(),
  };

  if (productId) {
    const { error } = await admin.from("products").update(row).eq("id", productId);
    if (error) return { error: error.message };
    await Promise.all([
      syncGallery(admin, productId, data.gallery ?? []),
      syncTags(admin, productId, data.tagIds ?? []),
      syncVariations(admin, productId, variations),
    ]);
    await refreshCategoryProductCounts(admin);
    revalidateProductPaths(slug, productId);
    return { success: true, id: productId, slug };
  }

  const { data: product, error } = await admin
    .from("products")
    .insert({
      ...row,
      sort_order: await nextProductSortOrder(admin),
    })
    .select("id")
    .single();

  if (error || !product) return { error: error?.message ?? "Could not create draft" };

  await Promise.all([
    syncGallery(admin, product.id, data.gallery ?? []),
    syncTags(admin, product.id, data.tagIds ?? []),
    syncVariations(admin, product.id, variations),
  ]);
  await refreshCategoryProductCounts(admin);
  revalidateProductPaths(slug, product.id);
  return { success: true, id: product.id, slug };
}

export async function deleteProductAction(id: string) {
  const admin = await getAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  await refreshCategoryProductCounts(admin);
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

const bulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  status: z.enum(["draft", "published"]).optional(),
  categoryId: z.string().uuid().optional(),
  isNew: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  soldOut: z.boolean().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  regularPrice: z.coerce.number().positive().optional(),
  salePrice: z.coerce.number().positive().optional(),
});

function revalidateAllProductPaths() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function bulkDeleteProductsAction(ids: string[]) {
  if (ids.length === 0) return { error: "Select at least one product" };

  const admin = await getAdminClient();
  const { error } = await admin.from("products").delete().in("id", ids);
  if (error) return { error: error.message };

  await refreshCategoryProductCounts(admin);
  revalidateAllProductPaths();
  return { success: true, deleted: ids.length };
}

export async function bulkUpdateProductsAction(formData: FormData) {
  let ids: string[] = [];
  try {
    const raw = formData.get("ids");
    if (typeof raw === "string") ids = JSON.parse(raw);
  } catch {
    return { error: "Invalid product selection" };
  }

  const regularRaw = formData.get("regularPrice");
  const saleRaw = formData.get("salePrice");
  const stockRaw = formData.get("stock");
  const statusRaw = formData.get("status");
  const categoryRaw = formData.get("categoryId");

  const parsed = bulkUpdateSchema.safeParse({
    ids,
    status:
      statusRaw === "draft" || statusRaw === "published"
        ? statusRaw
        : undefined,
    categoryId: categoryRaw ? String(categoryRaw) : undefined,
    isNew:
      formData.get("isNew") === "true"
        ? true
        : formData.get("isNew") === "false"
          ? false
          : undefined,
    isBestseller:
      formData.get("isBestseller") === "true"
        ? true
        : formData.get("isBestseller") === "false"
          ? false
          : undefined,
    soldOut:
      formData.get("soldOut") === "true"
        ? true
        : formData.get("soldOut") === "false"
          ? false
          : undefined,
    stock: stockRaw === "" || stockRaw == null ? undefined : stockRaw,
    regularPrice:
      regularRaw === "" || regularRaw == null ? undefined : regularRaw,
    salePrice: saleRaw === "" || saleRaw == null ? undefined : saleRaw,
  });

  if (!parsed.success) return { error: "Invalid update data" };

  const { ids: productIds, regularPrice, salePrice, ...rest } = parsed.data;
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (rest.status) patch.status = rest.status;
  if (rest.categoryId) patch.category_id = rest.categoryId;
  if (rest.isNew !== undefined) patch.is_new = rest.isNew;
  if (rest.isBestseller !== undefined) patch.is_bestseller = rest.isBestseller;
  if (rest.soldOut !== undefined) patch.sold_out = rest.soldOut;
  if (rest.stock !== undefined) patch.stock = rest.stock;

  if (regularPrice !== undefined || salePrice !== undefined) {
    const admin = await getAdminClient();
    const { data: rows } = await admin
      .from("products")
      .select("id, price, original_price")
      .in("id", productIds);

    for (const row of rows ?? []) {
      const currentRegular =
        row.original_price && row.original_price > row.price
          ? row.original_price
          : row.price;
      const currentSale =
        row.original_price && row.original_price > row.price
          ? row.price
          : undefined;

      const { price, originalPrice } = normalizeSalePrices(
        regularPrice ?? currentRegular,
        salePrice !== undefined ? salePrice : currentSale ?? null
      );

      await admin
        .from("products")
        .update({
          price,
          original_price: originalPrice ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);
    }
  }

  const admin = await getAdminClient();
  if (Object.keys(patch).length > 1) {
    const { error } = await admin.from("products").update(patch).in("id", productIds);
    if (error) return { error: error.message };
  }

  await refreshCategoryProductCounts(admin);
  revalidateAllProductPaths();
  return { success: true, updated: productIds.length };
}

export async function quickEditProductAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Product not found" };

  formData.set("ids", JSON.stringify([id]));
  return bulkUpdateProductsAction(formData);
}

export async function reorderProductsAction(
  updates: { id: string; sort_order: number }[]
) {
  if (updates.length === 0) return { error: "Nothing to reorder" };

  const admin = await getAdminClient();
  const results = await Promise.all(
    updates.map(({ id, sort_order }) =>
      admin.from("products").update({ sort_order }).eq("id", id)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidateAllProductPaths();
  return { success: true };
}
