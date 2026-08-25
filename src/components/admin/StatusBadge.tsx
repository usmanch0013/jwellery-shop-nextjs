import type { OrderStatus, PaymentStatus } from "@/lib/database.types";

const ORDER_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  pending: "bg-gray-100 text-gray-800",
  awaiting_payment: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-orange-100 text-orange-800",
  cod_pending: "bg-blue-100 text-blue-800",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${ORDER_COLORS[status]}`}
    >
      {status}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${PAYMENT_COLORS[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
