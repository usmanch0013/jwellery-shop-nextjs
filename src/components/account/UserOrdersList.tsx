import Link from "next/link";
import { formatPrice } from "@/lib/products/format";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants/commerce";
import type { DbOrder } from "@/lib/database.types";
import { ChevronRight } from "lucide-react";

type OrderRow = Pick<
  DbOrder,
  "id" | "order_number" | "status" | "total" | "created_at"
> & {
  payment_method?: DbOrder["payment_method"];
};

export default function UserOrdersList({
  orders,
  compact = false,
}: {
  orders: OrderRow[];
  compact?: boolean;
}) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-white p-8 text-center">
        <p className="text-muted-foreground">No orders yet.</p>
        <Link
          href="/shop"
          className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
        >
          Start shopping →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm">
      {orders.map((order, i) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className={`flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-muted/30 ${
            i > 0 ? "border-t border-border/40" : ""
          }`}
        >
          <div className="min-w-0">
            <p className="font-medium">{order.order_number}</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString("en-PK", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              {!compact && order.payment_method && (
                <> · {PAYMENT_METHOD_LABELS[order.payment_method]}</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="font-medium">{formatPrice(order.total)}</p>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {ORDER_STATUS_LABELS[order.status]}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Link>
      ))}
    </div>
  );
}
