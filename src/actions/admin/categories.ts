"use server";

import { getAdminClient } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  image: z.string().optional(),
});

export async function updateCategoryAction(
  id: string,
  formData: FormData
): Promise<void> {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    image: formData.get("image"),
  });

  if (!parsed.success) return;

  const admin = await getAdminClient();
  await admin
    .from("categories")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      image: parsed.data.image || null,
    })
    .eq("id", id);

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}
