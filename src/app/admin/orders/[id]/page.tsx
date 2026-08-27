import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CreditCard,
  MapPin,
  Package,
  Receipt,
  Truck,
} from "lucide-react";
import { getAdminOrder } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/products/format";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/StatusBadge";
import OrderAdminActions from "@/components/admin/OrderAdminActions";
import {
  AdminCard,
  AdminInfoRow,
  AdminPageHeader,
  AdminTable,
  AdminTableElement,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminTr,
} from "@/components/admin/AdminShell";
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
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title={order.order_number}
        description={new Date(order.created_at).toLocaleString("en-PK", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
        backHref="/admin/orders"
        badge={
          <div className="flex flex-wrap gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.payment_status} />
          </div>
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        <AdminCard
          title="Order total"
          className="md:col-span-1 bg-gradient-to-br from-[#092f29] to-[#0d4a3f] text-white border-0"
          padding
        >
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
              Grand total
            </p>
            <p className="font-serif text-3xl text-champagne">
              {formatPrice(order.total)}
            </p>
            <p className="pt-3 text-sm text-white/70">
              {items.length} item{items.length !== 1 ? "s" : ""} ·{" "}
              {PAYMENT_METHOD_LABELS[order.payment_method]}
            </p>
          </div>
        </AdminCard>

        <AdminCard title="Customer & shipping" className="md:col-span-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium">{addr?.fullName ?? "Guest customer"}</p>
              <p className="text-sm text-muted-foreground">{addr?.line1}</p>
              {addr?.line2 && (
                <p className="text-sm text-muted-foreground">{addr.line2}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {addr?.city}, {addr?.province}
                {addr?.postalCode ? ` · ${addr.postalCode}` : ""}
              </p>
              <p className="pt-2 text-sm">
                <span className="text-muted-foreground">Phone:</span> {addr?.phone}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Email:</span> {addr?.email}
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <AdminCard title="Payment details">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <CreditCard className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-2">
              <AdminInfoRow
                label="Method"
                value={PAYMENT_METHOD_LABELS[order.payment_method]}
              />
              <AdminInfoRow
                label="Payment status"
                value={<PaymentStatusBadge status={order.payment_status} />}
              />
              {addr?.paymentReference && (
                <AdminInfoRow label="Reference" value={addr.paymentReference} />
              )}
              {order.coupon_code && (
                <AdminInfoRow label="Coupon" value={order.coupon_code} />
              )}
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Fulfillment">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Truck className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-2">
              <AdminInfoRow
                label="Order status"
                value={<OrderStatusBadge status={order.status} />}
              />
              <AdminInfoRow label="Shipping fee" value={formatPrice(order.shipping)} />
              {order.notes && (
                <AdminInfoRow label="Customer notes" value={order.notes} />
              )}
            </div>
          </div>
        </AdminCard>
      </div>

      <AdminTable>
        <AdminTableElement>
          <AdminThead>
            <tr>
              <AdminTh>Item</AdminTh>
              <AdminTh>Qty</AdminTh>
              <AdminTh>Unit price</AdminTh>
              <AdminTh>Line total</AdminTh>
            </tr>
          </AdminThead>
          <tbody>
            {items.map((item) => (
              <AdminTr key={item.id}>
                <AdminTd>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                </AdminTd>
                <AdminTd>{item.quantity}</AdminTd>
                <AdminTd>{formatPrice(item.price)}</AdminTd>
                <AdminTd className="font-medium">
                  {formatPrice(item.price * item.quantity)}
                </AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </AdminTableElement>
        <div className="border-t border-border/50 bg-[#f8f4ec]/40 px-5 py-4">
          <div className="ml-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatPrice(order.shipping)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border/50 pt-2 text-base font-semibold">
              <span>Total</span>
              <span className="font-serif text-lg">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </AdminTable>

      {payments.length > 0 && (
        <AdminCard title="Payment records" description="Transaction history">
          <div className="space-y-3">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {p.method.replace("_", " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.provider_ref ?? "No reference"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{formatPrice(p.amount)}</span>
                  <PaymentStatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      )}

      <OrderAdminActions
        orderId={order.id}
        status={order.status}
        paymentStatus={order.payment_status}
      />
    </div>
  );
}
