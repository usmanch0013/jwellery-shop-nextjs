import Link from "next/link";
import { getDashboardStats, getAdminOrders } from "@/lib/admin/queries";
import StatCard from "@/components/admin/StatCard";
import { formatPrice } from "@/lib/products/format";
import { OrderStatusBadge } from "@/components/admin/StatusBadge";

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([
    getDashboardStats(),
    getAdminOrders(8),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your store performance
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Products" value={stats.productCount} />
        <StatCard label="Total orders" value={stats.orderCount} />
        <StatCard label="Pending orders" value={stats.pendingOrders} />
        <StatCard label="Revenue" value={formatPrice(stats.revenue)} />
        <StatCard label="Reviews pending" value={stats.reviewPending} />
        <StatCard label="Messages" value={stats.messageCount} />
      </div>

      <div className="rounded-lg border border-border bg-background overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-medium">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-t border-border">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {order.guest_email ?? order.guest_phone ?? "—"}
                    </td>
                    <td className="px-5 py-3">{formatPrice(order.total)}</td>
                    <td className="px-5 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-PK")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
