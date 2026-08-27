import type { OrderStatus, PaymentStatus } from "@/lib/database.types";

const ORDER_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 ring-amber-200",
  confirmed: "bg-blue-100 text-blue-800 ring-blue-200",
  processing: "bg-indigo-100 text-indigo-800 ring-indigo-200",
  shipped: "bg-purple-100 text-purple-800 ring-purple-200",
  delivered: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  cancelled: "bg-rose-100 text-rose-800 ring-rose-200",
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  pending: "bg-slate-100 text-slate-800 ring-slate-200",
  awaiting_payment: "bg-amber-100 text-amber-800 ring-amber-200",
  paid: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  failed: "bg-rose-100 text-rose-800 ring-rose-200",
  refunded: "bg-orange-100 text-orange-800 ring-orange-200",
  cod_pending: "bg-sky-100 text-sky-800 ring-sky-200",
};

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${className}`}
    >
      {children}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge className={ORDER_COLORS[status]}>
      {status.replace("_", " ")}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge className={PAYMENT_COLORS[status]}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
