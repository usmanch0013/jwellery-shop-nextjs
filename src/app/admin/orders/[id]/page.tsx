import { notFound } from "next/navigation";
import { getAdminOrder } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/products/format";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/StatusBadge";
import OrderAdminActions from "@/components/admin/OrderAdminActions";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants/commerce";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAdminOrder(id);
  if (!data) notFound();

  const { order, items, payments } = data;
  const addr = order.shipping_address;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl">{order.order_number}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(order.created_at).toLocaleString("en-PK")}
          </p>
        </div>
        <div className="flex gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.payment_status} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-4 bg-background">
          <h3 className="font-medium mb-2">Shipping</h3>
          <p className="text-sm">{addr?.fullName}</p>
          <p className="text-sm text-muted-foreground">{addr?.line1}</p>
          <p className="text-sm text-muted-foreground">
            {addr?.city}, {addr?.province}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {addr?.phone} · {addr?.email}
          </p>
        </div>
        <div className="border border-border rounded-lg p-4 bg-background">
          <h3 className="font-medium mb-2">Payment</h3>
          <p className="text-sm">
            {PAYMENT_METHOD_LABELS[order.payment_method]}
          </p>
          {addr?.paymentReference && (
            <p className="text-sm text-muted-foreground mt-1">
              Ref: {addr.paymentReference}
            </p>
          )}
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">
                  {formatPrice(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-border px-4 py-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatPrice(order.shipping)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Discount</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-medium pt-1 border-t">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {payments.length > 0 && (
        <div className="border border-border rounded-lg p-4 bg-background text-sm">
          <h3 className="font-medium mb-2">Payment records</h3>
          {payments.map((p) => (
            <p key={p.id} className="text-muted-foreground">
              {p.method} · {p.status} · {p.provider_ref ?? "—"}
            </p>
          ))}
        </div>
      )}

      <OrderAdminActions
        orderId={order.id}
        status={order.status}
        paymentStatus={order.payment_status}
      />
    </div>
  );
}
