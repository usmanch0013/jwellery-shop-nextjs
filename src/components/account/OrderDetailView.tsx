import Link from "next/link";
import { formatPrice } from "@/lib/products/format";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants/commerce";
import { getCarrierLabel } from "@/lib/orders/carriers";
import OrderTimeline from "@/components/orders/OrderTimeline";
import type { DbOrder, DbOrderItem } from "@/lib/database.types";
import type { DbOrderEvent } from "@/lib/orders/events";
import { ExternalLink, Truck } from "lucide-react";

export default function OrderDetailView({
  order,
  items,
  events,
}: {
  order: DbOrder;
  items: DbOrderItem[];
  events: DbOrderEvent[];
}) {
  const address = order.shipping_address as Record<string, string>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Placed {new Date(order.created_at).toLocaleString("en-PK")}
        </p>
        <h1 className="mt-1 font-serif text-2xl sm:text-3xl">{order.order_number}</h1>
      </div>

      <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm">
        <h2 className="font-medium mb-4">Order progress</h2>
        <OrderTimeline events={events} currentStatus={order.status} />
      </div>

      {order.tracking_number && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-5">
          <div className="flex items-start gap-3">
            <Truck className="h-5 w-5 text-sky-700 mt-0.5" />
            <div>
              <h2 className="font-medium text-sky-900">Tracking</h2>
              <p className="text-sm text-sky-800 mt-1">
                {getCarrierLabel(order.carrier)} · {order.tracking_number}
              </p>
              {order.tracking_url && (
                <a
                  href={order.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-sky-700 hover:underline"
                >
                  Track shipment
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm">
          <h2 className="font-medium mb-2">Status</h2>
          <p className="text-sm">{ORDER_STATUS_LABELS[order.status]}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Payment: {PAYMENT_METHOD_LABELS[order.payment_method]} ({order.payment_status})
          </p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm">
          <h2 className="font-medium mb-2">Shipping address</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {address.fullName}
            <br />
            {address.line1}
            <br />
            {address.city}, {address.province}
            <br />
            {address.phone}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm divide-y">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between p-4 text-sm">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm space-y-1 text-sm text-right">
        <p>Subtotal: {formatPrice(order.subtotal)}</p>
        <p>Shipping: {formatPrice(order.shipping)}</p>
        {order.discount > 0 && <p>Discount: -{formatPrice(order.discount)}</p>}
        <p className="font-serif text-lg pt-1">Total: {formatPrice(order.total)}</p>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Need help?{" "}
        <Link href="/track-order" className="text-primary hover:underline">
          Track with phone verification
        </Link>
      </p>
    </div>
  );
}
