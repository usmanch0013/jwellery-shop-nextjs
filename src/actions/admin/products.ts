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
  const stock =
    data.variations.length > 0
      ? data.variations.reduce((sum, v) => sum + v.stock, 0)
      : data.stock;
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
  const stock =
    data.variations.length > 0
      ? data.variations.reduce((sum, v) => sum + v.stock, 0)
      : data.stock;
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
