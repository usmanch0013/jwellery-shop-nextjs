"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getGuestSessionId, readGuestSessionId } from "@/lib/cart/session";
import { getProductById } from "@/lib/products/queries";
import type { CartItem, Product } from "@/types";
import { revalidatePath } from "next/cache";

async function getOrCreateCartId(
  userId: string | null,
  guestSessionId: string | null
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const admin = createAdminClient();

  if (userId) {
    const { data: existing } = await admin
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) return existing.id;

    const { data: created } = await admin
      .from("carts")
      .insert({ user_id: userId })
      .select("id")
      .single();
    return created?.id ?? null;
  }

  if (guestSessionId) {
    const { data: existing } = await admin
      .from("carts")
      .select("id")
      .eq("guest_session_id", guestSessionId)
      .maybeSingle();

    if (existing) return existing.id;

    const { data: created } = await admin
      .from("carts")
      .insert({ guest_session_id: guestSessionId })
      .select("id")
      .single();
    return created?.id ?? null;
  }

  return null;
}

export async function fetchCartItems(): Promise<CartItem[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const guestId = user ? null : await readGuestSessionId();
  const cartId = await getOrCreateCartId(user?.id ?? null, guestId);
  if (!cartId) return [];

  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("cart_items")
    .select("quantity, product_id")
    .eq("cart_id", cartId);

  if (!rows?.length) return [];

  const items: CartItem[] = [];
  for (const row of rows) {
    const product = await getProductById(row.product_id);
    if (product && !product.soldOut) {
      items.push({ product, quantity: row.quantity });
    }
  }
  return items;
}

export async function syncCartItem(
  productId: string,
  quantity: number
): Promise<{ success: boolean; error?: string }> {
  const product = await getProductById(productId);
  if (!product) return { success: false, error: "Product not found" };
  if (product.soldOut) return { success: false, error: "Product is sold out" };
  if (quantity > (product.stock ?? 0))
    return { success: false, error: "Not enough stock" };

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const guestId = user ? null : await getGuestSessionId();
  const cartId = await getOrCreateCartId(user?.id ?? null, guestId);
  if (!cartId) return { success: false, error: "Could not create cart" };

  const admin = createAdminClient();

  if (quantity <= 0) {
    await admin
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId)
      .eq("product_id", productId);
  } else {
    await admin.from("cart_items").upsert(
      { cart_id: cartId, product_id: productId, quantity },
      { onConflict: "cart_id,product_id" }
    );
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function clearServerCart(): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const guestId = user ? null : await readGuestSessionId();
  const cartId = await getOrCreateCartId(user?.id ?? null, guestId);
  if (!cartId) return;

  const admin = createAdminClient();
  await admin.from("cart_items").delete().eq("cart_id", cartId);
  revalidatePath("/cart");
}

export async function mergeGuestCartOnLogin(): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const guestId = await readGuestSessionId();
  if (!guestId) return;

  const admin = createAdminClient();
  const { data: guestCart } = await admin
    .from("carts")
    .select("id")
    .eq("guest_session_id", guestId)
    .maybeSingle();

  if (!guestCart) return;

  const userCartId = await getOrCreateCartId(user.id, null);
  if (!userCartId) return;

  const { data: guestItems } = await admin
    .from("cart_items")
    .select("*")
    .eq("cart_id", guestCart.id);

  for (const item of guestItems ?? []) {
    const { data: existing } = await admin
      .from("cart_items")
      .select("quantity")
      .eq("cart_id", userCartId)
      .eq("product_id", item.product_id)
      .maybeSingle();

    const qty = (existing?.quantity ?? 0) + item.quantity;
    await admin.from("cart_items").upsert(
      { cart_id: userCartId, product_id: item.product_id, quantity: qty },
      { onConflict: "cart_id,product_id" }
    );
  }

  await admin.from("cart_items").delete().eq("cart_id", guestCart.id);
  await admin.from("carts").delete().eq("id", guestCart.id);
}

export async function addToCartAction(
  productId: string,
  quantity = 1
): Promise<{ success: boolean; error?: string; product?: Product }> {
  const product = await getProductById(productId);
  if (!product) return { success: false, error: "Product not found" };
  if (product.soldOut) return { success: false, error: "Sold out" };

  const result = await syncCartItem(productId, quantity);
  return { ...result, product };
}
