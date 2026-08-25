"use server";

import { getAdminClient } from "@/lib/admin/auth";
import { refreshCategoryProductCounts } from "@/lib/admin/category-counts";
import { slugify } from "@/lib/products/mappers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().min(10),
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
});

export async function createProductAction(formData: FormData) {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description"),
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
  });

  if (!parsed.success) return { error: "Invalid product data" };

  const admin = await getAdminClient();
  const slug = parsed.data.slug || slugify(parsed.data.name);
  const stock = parsed.data.stock;
  const soldOut = parsed.data.soldOut || stock <= 0;

  const { data, error } = await admin
    .from("products")
    .insert({
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      price: parsed.data.price,
      original_price: parsed.data.originalPrice ?? null,
      category_id: parsed.data.categoryId,
      material: parsed.data.material,
      stock,
      image: parsed.data.image,
      hover_image: parsed.data.hoverImage || null,
      is_new: parsed.data.isNew ?? false,
      is_bestseller: parsed.data.isBestseller ?? false,
      sold_out: soldOut,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await refreshCategoryProductCounts(admin);
  revalidatePath("/");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect(`/admin/products/${data.id}`);
}

export async function updateProductAction(id: string, formData: FormData) {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description"),
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
  });

  if (!parsed.success) return { error: "Invalid product data" };

  const admin = await getAdminClient();
  const slug = parsed.data.slug || slugify(parsed.data.name);
  const stock = parsed.data.stock;
  const soldOut = parsed.data.soldOut || stock <= 0;

  const { error } = await admin
    .from("products")
    .update({
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      price: parsed.data.price,
      original_price: parsed.data.originalPrice ?? null,
      category_id: parsed.data.categoryId,
      material: parsed.data.material,
      stock,
      image: parsed.data.image,
      hover_image: parsed.data.hoverImage || null,
      is_new: parsed.data.isNew ?? false,
      is_bestseller: parsed.data.isBestseller ?? false,
      sold_out: soldOut,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  await refreshCategoryProductCounts(admin);
  revalidatePath("/");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/shop");
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
