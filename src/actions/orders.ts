"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { checkoutSchema } from "@/lib/validations/commerce";
import { clearServerCart } from "@/actions/cart";
import { fetchCartItems } from "@/actions/cart";
import { revalidatePath } from "next/cache";
import type { DbOrder, DbOrderItem } from "@/lib/database.types";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";

async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string,
  total: number
) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to: email,
      subject: `Order Confirmed — ${orderNumber}`,
      text: `Thank you for your order!\n\nOrder: ${orderNumber}\nTotal: Rs. ${total.toLocaleString("en-PK")}\n\nTrack: ${process.env.NEXT_PUBLIC_APP_URL}/track-order?order=${orderNumber}`,
    });
  } catch {
    // non-blocking
  }
}

function getStripe() {
  const Stripe = require("stripe") as typeof import("stripe").default;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe not configured");
  return new Stripe(key);
}

export async function validateCoupon(code: string, subtotal: number) {
  if (!isSupabaseConfigured() || !code)
    return { valid: false, discount: 0 };

  const admin = createAdminClient();
  const { data } = await admin
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .maybeSingle();

  if (!data) return { valid: false, discount: 0 };
  if (data.expires_at && new Date(data.expires_at) < new Date())
    return { valid: false, discount: 0 };
  if (data.usage_limit && data.usage_count >= data.usage_limit)
    return { valid: false, discount: 0 };
  if (subtotal < data.min_order) return { valid: false, discount: 0 };

  const discount =
    data.type === "percent"
      ? Math.floor(subtotal * data.value / 100)
      : data.value;

  return { valid: true, discount, code: data.code };
}

export async function placeOrderAction(input: unknown) {
  const rl = rateLimit(await rateLimitKey("place-order"), 5, 60_000);
  if (!rl.ok) {
    return { success: false, error: "Too many orders. Please wait a moment." };
  }

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid checkout data" };
  }

  const { shipping, paymentMethod, couponCode, paymentReference, notes } =
    parsed.data;

  const cartItems = await fetchCartItems();
  if (!cartItems.length) {
    return { success: false, error: "Your cart is empty" };
  }

  const items = cartItems.map((i) => ({
    product_id: i.product.id,
    quantity: i.quantity,
  }));

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Store database not configured. Add Supabase credentials.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("place_order", {
    p_user_id: user?.id ?? null,
    p_guest_email: shipping.email,
    p_guest_phone: shipping.phone,
    p_payment_method: paymentMethod,
    p_shipping_address: {
      fullName: shipping.fullName,
      phone: shipping.phone,
      email: shipping.email,
      line1: shipping.line1,
      line2: shipping.line2 ?? "",
      city: shipping.city,
      province: shipping.province,
      postalCode: shipping.postalCode ?? "",
      notes: notes ?? "",
      paymentReference: paymentReference ?? "",
    },
    p_coupon_code: couponCode ?? null,
    p_items: items,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const result = data as {
    order_id: string;
    order_number: string;
    total: number;
  };

  if (paymentMethod === "stripe" && process.env.STRIPE_SECRET_KEY) {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "pkr",
            product_data: { name: `Order ${result.order_number}` },
            unit_amount: result.total * 100,
          },
          quantity: 1,
        },
      ],
      metadata: { order_id: result.order_id, order_number: result.order_number },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${result.order_number}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=1`,
      customer_email: shipping.email,
    });

    await admin
      .from("payments")
      .update({ provider_ref: session.id, metadata: { session_url: session.url } })
      .eq("order_id", result.order_id);

    await clearServerCart();
    return {
      success: true,
      orderNumber: result.order_number,
      redirectUrl: session.url,
    };
  }

  await clearServerCart();
  revalidatePath("/orders");

  void sendOrderConfirmationEmail(
    shipping.email,
    result.order_number,
    result.total
  );

  return {
    success: true,
    orderNumber: result.order_number,
    orderId: result.order_id,
  };
}

export async function getUserOrders() {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as DbOrder[];
}

export async function getOrderById(orderId: string) {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase.from("orders").select("*").eq("id", orderId);
  if (user) query = query.eq("user_id", user.id);

  const { data: order } = await query.maybeSingle();
  if (!order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  return { order: order as DbOrder, items: (items ?? []) as DbOrderItem[] };
}

export async function trackOrderAction(orderNumber: string, phone: string) {
  if (!isSupabaseConfigured()) return null;

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber.toUpperCase())
    .maybeSingle();

  if (!order) return null;
  const addr = order.shipping_address as { phone?: string };
  if (addr?.phone?.replace(/\D/g, "") !== phone.replace(/\D/g, "")) return null;

  const { data: items } = await admin
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  return { order: order as DbOrder, items: (items ?? []) as DbOrderItem[] };
}

export async function getOrderByNumber(orderNumber: string) {
  if (!isSupabaseConfigured()) return null;
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (!order) return null;

  const { data: items } = await admin
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  return { order: order as DbOrder, items: (items ?? []) as DbOrderItem[] };
}
