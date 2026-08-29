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
    <div className="admin-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-4 py-3 lg:px-5">
        <h2 className="text-sm font-semibold">Recent orders</h2>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[#008060] hover:underline"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="border-b border-[var(--admin-border)] bg-[#fafbfb] text-left">
            <tr>
              <th className="px-4 py-2.5 font-semibold text-[var(--admin-text-subdued)] lg:px-5">
                Order
              </th>
              <th className="px-4 py-2.5 font-semibold text-[var(--admin-text-subdued)] lg:px-5">
                Customer
              </th>
              <th className="px-4 py-2.5 font-semibold text-[var(--admin-text-subdued)] lg:px-5">
                Total
              </th>
              <th className="px-4 py-2.5 font-semibold text-[var(--admin-text-subdued)] lg:px-5">
                Status
              </th>
              <th className="px-4 py-2.5 font-semibold text-[var(--admin-text-subdued)] lg:px-5">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-[var(--admin-text-subdued)]"
                >
                  No orders yet. Your first sale will appear here.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[var(--admin-border)] last:border-0 hover:bg-[#fafbfb]"
                >
                  <td className="px-4 py-3 lg:px-5">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-[#008060] hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--admin-text-subdued)] lg:px-5">
                    {order.guest_email ?? order.guest_phone ?? "Guest"}
                  </td>
                  <td className="px-4 py-3 font-medium lg:px-5">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3 lg:px-5">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-[var(--admin-text-subdued)] lg:px-5">
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
