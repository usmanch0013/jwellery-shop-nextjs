import Link from "next/link";
import { getAdminOrders } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/products/format";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/StatusBadge";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants/commerce";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders(100);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">Orders</h1>

      <div className="rounded-lg border border-border bg-background overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p>{order.shipping_address?.fullName ?? "Guest"}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.guest_email ?? order.guest_phone}
                  </p>
                </td>
                <td className="px-4 py-3">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <p className="text-xs">
                    {PAYMENT_METHOD_LABELS[order.payment_method]}
                  </p>
                  <PaymentStatusBadge status={order.payment_status} />
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(order.created_at).toLocaleString("en-PK")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
