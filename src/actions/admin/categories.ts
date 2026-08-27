"use server";

import { getAdminClient } from "@/lib/admin/auth";
import { slugify } from "@/lib/products/mappers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional(),
  image: z.string().optional(),
});

export async function createCategoryAction(formData: FormData) {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || slugify(String(formData.get("name") ?? "")),
    description: formData.get("description"),
    image: formData.get("image"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid category data" };
  }

  const admin = await getAdminClient();
  const { error } = await admin.from("categories").insert({
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description ?? null,
    image: parsed.data.image || null,
    product_count: 0,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "A category with this slug already exists" };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: true };
}

export async function updateCategoryAction(id: string, formData: FormData) {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    image: formData.get("image"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid category data" };
  }

  const admin = await getAdminClient();
  const { error } = await admin
    .from("categories")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      image: parsed.data.image || null,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "A category with this slug already exists" };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategoryAction(id: string) {
  const admin = await getAdminClient();

  const { count, error: countError } = await admin
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (countError) return { error: countError.message };

  if ((count ?? 0) > 0) {
    return {
      error: `Cannot delete — ${count} product${count === 1 ? "" : "s"} use this category. Move or delete those products first.`,
    };
  }

  const { error } = await admin.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: true };
}
