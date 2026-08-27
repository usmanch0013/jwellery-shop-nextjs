import Link from "next/link";
import type { DbOrder } from "@/lib/database.types";
import { formatPrice } from "@/lib/products/format";
import { OrderStatusBadge } from "@/components/admin/StatusBadge";
import { ArrowRight } from "lucide-react";

export default function RecentOrdersTable({
  orders,
}: {
  orders: DbOrder[];
}) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 shadow-[0_8px_30px_rgba(9,47,41,0.06)] backdrop-blur-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Recent activity
          </p>
          <h2 className="mt-1 font-serif text-xl text-foreground">
            Latest orders
          </h2>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-emerald-dark"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f8f4ec]/80 text-left">
            <tr>
              <th className="px-5 py-3 font-medium text-muted-foreground">Order</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Customer</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Total</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-muted-foreground"
                >
                  No orders yet. Your first sale will appear here.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-border/50 transition-colors hover:bg-muted/20"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-primary hover:text-emerald-dark"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {order.guest_email ?? order.guest_phone ?? "Guest customer"}
                  </td>
                  <td className="px-5 py-4 font-medium">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-5 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
