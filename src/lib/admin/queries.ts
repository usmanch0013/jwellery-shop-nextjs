import { getAdminClient } from "@/lib/admin/auth";
import { syncProductImagesToMediaLibrary } from "@/lib/admin/media-sync";
import type {
  DbCoupon,
  DbOrder,
  DbPayment,
  DbReview,
  DbContactMessage,
} from "@/lib/database.types";
import {
  buildCommerceSummary,
  buildPaymentMethodBreakdown,
  buildPaymentStatusBreakdown,
  buildPeriodMetrics,
  formatDayLabel,
  sumEarned,
  sumPendingValue,
  type AnalyticsOrderRow,
  type CommerceSummary,
  type DashboardPeriods,
} from "@/lib/admin/analytics";

export {
  countsAsRevenue,
  countsAsPendingPayment,
  countsAsCancelled,
  countsAsRefunded,
  sumEarned,
  sumPendingValue,
  buildCommerceSummary,
} from "@/lib/admin/analytics";

export async function getDashboardStats() {
  const admin = await getAdminClient();

  const [
    { count: productCount },
    { data: allOrders },
    { count: reviewPending },
    { count: messageCount },
    { count: lowStock },
    { count: soldOut },
  ] = await Promise.all([
    admin.from("products").select("*", { count: "exact", head: true }),
    admin
      .from("orders")
      .select("total, status, payment_status, payment_method, created_at"),
    admin
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("approved", false),
    admin.from("contact_messages").select("*", { count: "exact", head: true }),
    admin
      .from("products")
      .select("*", { count: "exact", head: true })
      .lte("stock", 5)
      .gt("stock", 0),
    admin
      .from("products")
      .select("*", { count: "exact", head: true })
      .or("sold_out.eq.true,stock.eq.0"),
  ]);

  const orders = (allOrders ?? []) as AnalyticsOrderRow[];
  const summary = buildCommerceSummary(orders);

  return {
    productCount: productCount ?? 0,
    lowStockCount: lowStock ?? 0,
    soldOutCount: soldOut ?? 0,
    orderCount: summary.orders.total,
    pendingOrders: summary.orders.pending,
    pendingOrderValue: summary.earnings.pending,
    revenue: summary.earnings.total,
    reviewPending: reviewPending ?? 0,
    messageCount: messageCount ?? 0,
    summary,
  };
}

export type DashboardChartData = {
  summary: CommerceSummary;
  periods: DashboardPeriods;
  revenueSeries: {
    label: string;
    revenue: number;
    orders: number;
    pending: number;
    cancelled: number;
  }[];
  ordersByStatus: { status: string; count: number; fill: string }[];
  paymentsByMethod: { method: string; count: number }[];
  paymentsByStatus: { status: string; count: number }[];
  topCategories: { name: string; count: number }[];
  monthRevenue: number;
  monthOrders: number;
  revenueGrowth: number;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#6366f1",
  shipped: "#a855f7",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

export async function getDashboardChartData(): Promise<DashboardChartData> {
  const admin = await getAdminClient();

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const analyticsStart = new Date(
    Math.min(sevenDaysAgo.getTime(), monthStart.getTime(), sixtyDaysAgo.getTime())
  );

  const [
    { data: analyticsOrders },
    { data: allOrders },
    { data: priorMonthOrders },
    { data: statusRows },
    { data: categoryRows },
  ] = await Promise.all([
    admin
      .from("orders")
      .select("total, created_at, status, payment_status, payment_method")
      .gte("created_at", analyticsStart.toISOString())
      .order("created_at", { ascending: true }),
    admin
      .from("orders")
      .select("total, created_at, status, payment_status, payment_method"),
    admin
      .from("orders")
      .select("total, created_at, status, payment_status, payment_method")
      .gte("created_at", sixtyDaysAgo.toISOString())
      .lt("created_at", thirtyDaysAgo.toISOString()),
    admin.from("orders").select("status"),
    admin
      .from("categories")
      .select("name, product_count")
      .order("product_count", { ascending: false })
      .limit(5),
  ]);

  const orders = (analyticsOrders ?? []) as AnalyticsOrderRow[];
  const allOrderRows = (allOrders ?? []) as AnalyticsOrderRow[];
  const summary = buildCommerceSummary(allOrderRows);
  const recentOrders = orders.filter(
    (order) =>
      order.created_at &&
      new Date(order.created_at).getTime() >= sevenDaysAgo.getTime()
  );
  const monthOrdersRows = orders.filter(
    (order) =>
      order.created_at &&
      new Date(order.created_at).getTime() >= monthStart.getTime()
  );

  const periods = buildPeriodMetrics(orders, now);

  const revenueSeries = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(sevenDaysAgo);
    day.setDate(sevenDaysAgo.getDate() + index);
    const dayKey = day.toISOString().slice(0, 10);

    const dayOrders = recentOrders.filter(
      (order) => order.created_at?.slice(0, 10) === dayKey
    );

    return {
      label: formatDayLabel(day),
      revenue: sumEarned(dayOrders),
      pending: sumPendingValue(dayOrders),
      orders: dayOrders.filter((o) => o.status !== "cancelled").length,
      cancelled: dayOrders.filter((o) => o.status === "cancelled").length,
    };
  });

  const statusCounts = new Map<string, number>();
  for (const row of statusRows ?? []) {
    const status = row.status ?? "pending";
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
  }

  const ordersByStatus = Array.from(statusCounts.entries()).map(
    ([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      fill: STATUS_COLORS[status] ?? "#94a3b8",
    })
  );

  const monthOrders = monthOrdersRows.filter((o) => o.status !== "cancelled").length;

  const monthRevenue = sumEarned(monthOrdersRows);

  const currentPeriodRevenue = sumEarned(recentOrders);

  const priorPeriodRevenue = sumEarned(priorMonthOrders);

  const revenueGrowth =
    priorPeriodRevenue > 0
      ? Math.round(
          ((currentPeriodRevenue - priorPeriodRevenue) / priorPeriodRevenue) *
            100
        )
      : currentPeriodRevenue > 0
        ? 100
        : 0;

  return {
    summary,
    periods,
    revenueSeries,
    ordersByStatus,
    paymentsByMethod: buildPaymentMethodBreakdown(allOrderRows),
    paymentsByStatus: buildPaymentStatusBreakdown(allOrderRows),
    topCategories:
      categoryRows?.map((row) => ({
        name: row.name,
        count: row.product_count ?? 0,
      })) ?? [],
    monthRevenue,
    monthOrders,
    revenueGrowth,
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

export async function getAdminProductDetails(id: string) {
  const admin = await getAdminClient();
  const { data: product } = await admin
    .from("products")
    .select("*, categories(slug, name)")
    .eq("id", id)
    .maybeSingle();

  if (!product) return null;

  const [galleryRes, tagLinksRes, variationsRes] = await Promise.all([
    admin
      .from("product_images")
      .select("*")
      .eq("product_id", id)
      .order("sort_order"),
    admin.from("product_tag_links").select("tag_id").eq("product_id", id),
    admin
      .from("product_variations")
      .select("*")
      .eq("product_id", id)
      .order("sort_order"),
  ]);

  const tagIds = (tagLinksRes.data ?? []).map((row) => row.tag_id);
  let tags: { id: string; slug: string; name: string; created_at: string }[] =
    [];

  if (tagIds.length > 0) {
    const { data: tagData } = await admin
      .from("product_tags")
      .select("*")
      .in("id", tagIds);
    tags = tagData ?? [];
  }

  return {
    ...product,
    gallery: galleryRes.data ?? [],
    tags,
    variations: variationsRes.data ?? [],
  };
}

export async function getAdminMediaLibrary() {
  const admin = await getAdminClient();
  await syncProductImagesToMediaLibrary(admin).catch(() => 0);

  const { data } = await admin
    .from("media_library")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
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

export async function getAdminBlogPosts(status?: "draft" | "published") {
  const admin = await getAdminClient();
  let query = admin
    .from("blog_posts")
    .select("*")
    .order("updated_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data } = await query;
  return data ?? [];
}

export async function getAdminBlogPostDetails(id: string) {
  const admin = await getAdminClient();
  const { data: post } = await admin
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!post) return null;

  const [categoryLinks, tagLinks] = await Promise.all([
    admin.from("blog_post_categories").select("category_id").eq("post_id", id),
    admin.from("blog_post_tags").select("tag_id").eq("post_id", id),
  ]);

  const categoryIds = (categoryLinks.data ?? []).map((r) => r.category_id);
  const tagIds = (tagLinks.data ?? []).map((r) => r.tag_id);

  let categories: { id: string; slug: string; name: string; description: string | null; created_at: string }[] = [];
  let tags: { id: string; slug: string; name: string; created_at: string }[] = [];

  if (categoryIds.length > 0) {
    const { data } = await admin
      .from("blog_categories")
      .select("*")
      .in("id", categoryIds);
    categories = data ?? [];
  }

  if (tagIds.length > 0) {
    const { data } = await admin.from("blog_tags").select("*").in("id", tagIds);
    tags = data ?? [];
  }

  return { ...post, categories, tags };
}
