import { getAdminClient } from "@/lib/admin/auth";
import type {
  DbCoupon,
  DbOrder,
  DbPayment,
  DbReview,
  DbContactMessage,
} from "@/lib/database.types";

export async function getDashboardStats() {
  const admin = await getAdminClient();

  const [
    { count: productCount },
    { count: orderCount },
    { count: pendingOrders },
    { data: revenueRows },
    { count: reviewPending },
    { count: messageCount },
  ] = await Promise.all([
    admin.from("products").select("*", { count: "exact", head: true }),
    admin.from("orders").select("*", { count: "exact", head: true }),
    admin
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    admin
      .from("orders")
      .select("total")
      .in("payment_status", ["paid", "cod_pending"]),
    admin
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("approved", false),
    admin.from("contact_messages").select("*", { count: "exact", head: true }),
  ]);

  const revenue =
    revenueRows?.reduce((sum, row) => sum + (row.total ?? 0), 0) ?? 0;

  return {
    productCount: productCount ?? 0,
    orderCount: orderCount ?? 0,
    pendingOrders: pendingOrders ?? 0,
    revenue,
    reviewPending: reviewPending ?? 0,
    messageCount: messageCount ?? 0,
  };
}

export async function getAdminOrders(limit = 50) {
  const admin = await getAdminClient();
  const { data } = await admin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as DbOrder[];
}

export async function getAdminOrder(id: string) {
  const admin = await getAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!order) return null;

  const [{ data: items }, { data: payments }] = await Promise.all([
    admin.from("order_items").select("*").eq("order_id", id),
    admin.from("payments").select("*").eq("order_id", id),
  ]);

  return {
    order: order as DbOrder,
    items: items ?? [],
    payments: (payments ?? []) as DbPayment[],
  };
}

export async function getAdminProducts(page = 1, limit = 20) {
  const admin = await getAdminClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count } = await admin
    .from("products")
    .select("*, categories(slug, name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  return { products: data ?? [], total: count ?? 0, page, limit };
}

export async function getAdminProduct(id: string) {
  const admin = await getAdminClient();
  const { data } = await admin
    .from("products")
    .select("*, categories(slug, name)")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getAdminCategories() {
  const admin = await getAdminClient();
  const { data } = await admin.from("categories").select("*").order("name");
  return data ?? [];
}

export async function getAdminCoupons() {
  const admin = await getAdminClient();
  const { data } = await admin
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as DbCoupon[];
}

export async function getAdminReviews(approved?: boolean) {
  const admin = await getAdminClient();
  let query = admin
    .from("reviews")
    .select("*, products(name), profiles(full_name)")
    .order("created_at", { ascending: false });
  if (approved !== undefined) query = query.eq("approved", approved);
  const { data } = await query;
  return (data ?? []) as DbReview[];
}

export async function getAdminPayments(limit = 50) {
  const admin = await getAdminClient();
  const { data } = await admin
    .from("payments")
    .select("*, orders(order_number, guest_email)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as DbPayment[];
}

export async function getAdminMessages() {
  const admin = await getAdminClient();
  const { data } = await admin
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as DbContactMessage[];
}
