"use server";

import { getAdminClient } from "@/lib/admin/auth";
import { slugify } from "@/lib/products/mappers";
import { z } from "zod";

const tagSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
});

export async function getProductTagsAction() {
  const admin = await getAdminClient();
  const { data } = await admin
    .from("product_tags")
    .select("*")
    .order("name");
  return data ?? [];
}

export async function createProductTagAction(formData: FormData) {
  const parsed = tagSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
  });
  if (!parsed.success) return { error: "Invalid tag name" };

  const admin = await getAdminClient();
  const slug = parsed.data.slug || slugify(parsed.data.name);
  const { data, error } = await admin
    .from("product_tags")
    .insert({ name: parsed.data.name, slug })
    .select("*")
    .single();

  if (error) return { error: error.message };
  return { success: true, tag: data };
}
