import Link from "next/link";
import { formatPrice } from "@/lib/products/format";
import {
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants/commerce";
import { getCarrierLabel } from "@/lib/orders/carriers";
import OrderTimeline from "@/components/orders/OrderTimeline";
import { OrderStatusBadge } from "@/components/admin/StatusBadge";
import { UserCard, UserPageHeader } from "@/components/account/UserShell";
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
    <div className="space-y-4">
      <UserPageHeader
        title={order.order_number}
        description={`Placed ${new Date(order.created_at).toLocaleString("en-PK")}`}
        backHref="/account/orders"
        actions={<OrderStatusBadge status={order.status} />}
      />

      <UserCard title="Order progress" padding={false}>
        <div className="p-4 lg:p-5">
          <OrderTimeline events={events} currentStatus={order.status} />
        </div>
      </UserCard>

      {order.tracking_number && (
        <div className="user-card border-sky-200 bg-sky-50/60 p-4 lg:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100">
              <Truck className="h-4 w-4 text-sky-700" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-sky-900">Tracking</h2>
              <p className="mt-1 text-[13px] text-sky-800">
                {getCarrierLabel(order.carrier)} · {order.tracking_number}
              </p>
              {order.tracking_url && (
                <a
                  href={order.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-sky-700 hover:underline"
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
        <UserCard title="Payment">
          <p className="text-[13px] text-[var(--user-text)]">
            {PAYMENT_METHOD_LABELS[order.payment_method]}
          </p>
          <p className="mt-1 text-[13px] capitalize text-[var(--user-text-subdued)]">
            {order.payment_status}
          </p>
        </UserCard>
        <UserCard title="Shipping address">
          <p className="text-[13px] leading-relaxed text-[var(--user-text-subdued)]">
            {address.fullName}
            <br />
            {address.line1}
            <br />
            {address.city}, {address.province}
            <br />
            {address.phone}
          </p>
        </UserCard>
      </div>

      <UserCard title="Items" padding={false}>
        <div className="divide-y divide-[var(--user-border)]">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between px-4 py-3 text-[13px] lg:px-5"
            >
              <span className="text-[var(--user-text)]">
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </UserCard>

      <UserCard>
        <div className="space-y-1 text-right text-[13px]">
          <p className="text-[var(--user-text-subdued)]">
            Subtotal: {formatPrice(order.subtotal)}
          </p>
          <p className="text-[var(--user-text-subdued)]">
            Shipping: {formatPrice(order.shipping)}
          </p>
          {order.discount > 0 && (
            <p className="text-[var(--user-text-subdued)]">
              Discount: -{formatPrice(order.discount)}
            </p>
          )}
          <p className="pt-1 text-base font-semibold text-[var(--user-text)]">
            Total: {formatPrice(order.total)}
          </p>
        </div>
      </UserCard>

      <p className="text-center text-[13px] text-[var(--user-text-subdued)]">
        Need help?{" "}
        <Link
          href="/track-order"
          className="font-medium text-[var(--user-accent)] hover:underline"
        >
          Track with phone verification
        </Link>
      </p>
    </div>
  );
}
