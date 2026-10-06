import type { SupabaseClient } from "@supabase/supabase-js";

/** Sync categories.product_count from live product rows. */
export async function refreshCategoryProductCounts(
  admin: SupabaseClient
): Promise<void> {
  const { data: categories } = await admin.from("categories").select("id");
  if (!categories?.length) return;

  for (const category of categories) {
    const { count } = await admin
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", category.id)
      // Storefront counts must reflect what visitors can actually buy —
      // drafts are not live products.
      .eq("status", "published");

    await admin
      .from("categories")
      .update({ product_count: count ?? 0 })
      .eq("id", category.id);
  }
}
