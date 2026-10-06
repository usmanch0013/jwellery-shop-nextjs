import type { OrderStatus, PaymentStatus } from "@/lib/database.types";

/**
 * Canonical admin money metrics.
 *
 * Dashboard, Analytics and Customers MUST all use these definitions so the
 * same label always shows the same number on every screen:
 *
 * - Total sales:      orders whose payment_status is 'paid' (not cancelled)
 * - Gross sales:      every non-cancelled order
 * - Average order:    gross sales / number of non-cancelled orders
 * - Pending revenue:  non-cancelled orders whose payment is still outstanding
 *                     (pending / awaiting_payment / cod_pending)
 */

export type MetricOrderRow = {
  total?: number | null;
  status?: OrderStatus | null;
  payment_status?: PaymentStatus | null;
};

const UNPAID_PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "awaiting_payment",
  "cod_pending",
];

export function isCancelledOrder(order: MetricOrderRow): boolean {
  return order.status === "cancelled";
}

/** An order counts towards "Total sales" once its payment is received. */
export function isPaidSale(order: MetricOrderRow): boolean {
  return order.payment_status === "paid" && !isCancelledOrder(order);
}

function sumWhere(
  orders: MetricOrderRow[] | null | undefined,
  predicate: (order: MetricOrderRow) => boolean
): number {
  return (
    orders
      ?.filter(predicate)
      .reduce((sum, order) => sum + (order.total ?? 0), 0) ?? 0
  );
}

export function totalSales(
  orders: MetricOrderRow[] | null | undefined
): number {
  return sumWhere(orders, isPaidSale);
}

export function grossSales(
  orders: MetricOrderRow[] | null | undefined
): number {
  return sumWhere(orders, (order) => !isCancelledOrder(order));
}

export function nonCancelledOrderCount(
  orders: MetricOrderRow[] | null | undefined
): number {
  return orders?.filter((order) => !isCancelledOrder(order)).length ?? 0;
}

export function averageOrderValue(
  orders: MetricOrderRow[] | null | undefined
): number {
  const count = nonCancelledOrderCount(orders);
  if (!count) return 0;
  return Math.round(grossSales(orders) / count);
}

export function pendingRevenue(
  orders: MetricOrderRow[] | null | undefined
): number {
  return sumWhere(
    orders,
    (order) =>
      !isCancelledOrder(order) &&
      order.payment_status != null &&
      UNPAID_PAYMENT_STATUSES.includes(order.payment_status)
  );
}
