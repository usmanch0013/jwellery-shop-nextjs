import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { DbOrder } from "@/lib/database.types";

export interface UserDashboardStats {
  orderCount: number;
  activeOrders: number;
  wishlistCount: number;
  totalSpent: number;
  recentOrders: Pick<
    DbOrder,
    "id" | "order_number" | "status" | "total" | "created_at" | "payment_status"
  >[];
}

export async function getUserDashboardStats(): Promise<UserDashboardStats | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [ordersRes, wishlistRes] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_number, status, total, created_at, payment_status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("wishlist_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const orders = ordersRes.data ?? [];
  const activeOrders = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status)
  ).length;
  const totalSpent = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + o.total, 0);

  return {
    orderCount: orders.length,
    activeOrders,
    wishlistCount: wishlistRes.count ?? 0,
    totalSpent,
    recentOrders: orders.slice(0, 5),
  };
}
