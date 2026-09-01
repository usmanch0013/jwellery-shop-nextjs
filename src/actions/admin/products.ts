"use server";

import { getAdminClient } from "@/lib/admin/auth";
import { refreshCategoryProductCounts } from "@/lib/admin/category-counts";
import { slugify } from "@/lib/products/mappers";
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

  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    shortDescription: formData.get("shortDescription") || "",
    description: formData.get("description"),
    sku: formData.get("sku") || undefined,
    status: formData.get("status") || "published",
    price: formData.get("price"),
    originalPrice: formData.get("originalPrice") || undefined,
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

export async function createProductAction(formData: FormData) {
  const parsed = parseProductForm(formData);
  if (!parsed.success) return { error: "Invalid product data" };

  const admin = await getAdminClient();
  const data = parsed.data;
  const slug = data.slug || slugify(data.name);
  const stock = data.stock;
  const soldOut = data.soldOut || stock <= 0;

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

  return draftSchema.safeParse({
    name: String(formData.get("name") ?? "").trim() || undefined,
    slug: formData.get("slug") || undefined,
    shortDescription: formData.get("shortDescription") || "",
    description: formData.get("description") || "",
    sku: formData.get("sku") || undefined,
    price: priceRaw === "" || priceRaw == null ? 0 : priceRaw,
    originalPrice: originalRaw === "" || originalRaw == null ? undefined : originalRaw,
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
    .insert(row)
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
