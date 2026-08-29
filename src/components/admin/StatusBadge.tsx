import type { OrderStatus, PaymentStatus } from "@/lib/database.types";

const ORDER_COLORS: Record<OrderStatus, string> = {
  pending: "bg-[#fff4e5] text-[#b98900]",
  confirmed: "bg-[#e3f1ff] text-[#0066cc]",
  processing: "bg-[#ede9fe] text-[#5b21b6]",
  shipped: "bg-[#e0f5f0] text-[#008060]",
  delivered: "bg-[#e3f5ef] text-[#007a5c]",
  cancelled: "bg-[#fde8e8] text-[#c5280c]",
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  pending: "bg-[#f1f2f4] text-[#616161]",
  awaiting_payment: "bg-[#fff4e5] text-[#b98900]",
  paid: "bg-[#e3f5ef] text-[#007a5c]",
  failed: "bg-[#fde8e8] text-[#c5280c]",
  refunded: "bg-[#fde8e8] text-[#c5280c]",
  cod_pending: "bg-[#fff4e5] text-[#b98900]",
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
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium capitalize ${className}`}
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
