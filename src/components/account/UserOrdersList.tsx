import Link from "next/link";
import { formatPrice } from "@/lib/products/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants/commerce";
import type { DbOrder } from "@/lib/database.types";
import { OrderStatusBadge } from "@/components/admin/StatusBadge";
import { ArrowRight } from "lucide-react";

type OrderRow = Pick<
  DbOrder,
  "id" | "order_number" | "status" | "total" | "created_at"
>;

export default function UserOrdersList({
  orders,
  showHeader = true,
}: {
  orders: OrderRow[];
  showHeader?: boolean;
}) {
  if (orders.length === 0) {
    return (
      <div className="user-card">
        <div className="py-16 text-center">
          <p className="font-medium text-[var(--user-text)]">No orders yet</p>
          <p className="mt-2 text-[13px] text-[var(--user-text-subdued)]">
            When you place an order, it will appear here.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-flex text-[13px] font-medium text-[var(--user-accent)] hover:underline"
          >
            Start shopping →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="user-card overflow-hidden">
      {showHeader && (
        <div className="flex items-center justify-between border-b border-[var(--user-border)] px-4 py-3 lg:px-5">
          <h2 className="text-sm font-semibold">Recent orders</h2>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--user-accent)] hover:underline"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="border-b border-[var(--user-border)] bg-[#fafbfb] text-left">
            <tr>
              <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--user-text-subdued)] lg:px-5">
                Order
              </th>
              <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--user-text-subdued)] lg:px-5">
                Total
              </th>
              <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--user-text-subdued)] lg:px-5">
                Status
              </th>
              <th className="hidden px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--user-text-subdued)] sm:table-cell lg:px-5">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-[var(--user-border)] last:border-0 hover:bg-[#fafbfb]"
              >
                <td className="px-4 py-3 lg:px-5">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="font-medium text-[var(--user-accent)] hover:underline"
                  >
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3 font-medium lg:px-5">
                  {formatPrice(order.total)}
                </td>
                <td className="px-4 py-3 lg:px-5">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="hidden px-4 py-3 text-[var(--user-text-subdued)] sm:table-cell lg:px-5">
                  {new Date(order.created_at).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
