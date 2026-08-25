"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getProductById } from "@/lib/products/queries";
import type { Product } from "@/types";
import { revalidatePath } from "next/cache";

export async function fetchWishlistItems(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", user.id);

  const products: Product[] = [];
  for (const row of data ?? []) {
    const p = await getProductById(row.product_id);
    if (p) products.push(p);
  }
  return products;
}

export async function toggleWishlistAction(
  productId: string
): Promise<{ success: boolean; inWishlist: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, inWishlist: false, error: "Login required" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, inWishlist: false, error: "Please login" };

  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase.from("wishlist_items").delete().eq("id", existing.id);
    revalidatePath("/wishlist");
    return { success: true, inWishlist: false };
  }

  await supabase
    .from("wishlist_items")
    .insert({ user_id: user.id, product_id: productId });
  revalidatePath("/wishlist");
  return { success: true, inWishlist: true };
}

export async function removeFromWishlistAction(productId: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("wishlist_items")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);
  revalidatePath("/wishlist");
}
