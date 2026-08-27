import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/lib/database.types";

export type AnalyticsOrderRow = {
  total?: number | null;
  created_at?: string;
  status?: OrderStatus | null;
  payment_status?: PaymentStatus | null;
  payment_method?: PaymentMethod | null;
};

const ACTIVE_STATUSES: OrderStatus[] = [
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

/** Revenue counts only after payment is received or COD order is confirmed+. */
export function countsAsRevenue(order: AnalyticsOrderRow): boolean {
  if (order.status === "cancelled") return false;
  if (order.payment_status === "refunded") return false;
  if (order.payment_status === "paid") return true;
  if (order.payment_status === "cod_pending") {
    return (
      order.status !== "pending" &&
      order.status !== undefined &&
      order.status !== null
    );
  }
  return false;
}

export function countsAsPendingPayment(order: AnalyticsOrderRow): boolean {
  return order.status === "pending";
}

export function countsAsCancelled(order: AnalyticsOrderRow): boolean {
  return order.status === "cancelled";
}

export function countsAsRefunded(order: AnalyticsOrderRow): boolean {
  return order.payment_status === "refunded";
}

export function countsAsFailedPayment(order: AnalyticsOrderRow): boolean {
  return order.payment_status === "failed";
}

export function countsAsDelivered(order: AnalyticsOrderRow): boolean {
  return order.status === "delivered";
}

export function countsAsActiveOrder(order: AnalyticsOrderRow): boolean {
  return (
    order.status !== "cancelled" &&
    order.status !== undefined &&
    order.status !== null
  );
}

function sumBy(
  orders: AnalyticsOrderRow[] | null | undefined,
  predicate: (order: AnalyticsOrderRow) => boolean
): number {
  return (
    orders
      ?.filter(predicate)
      .reduce((sum, order) => sum + (order.total ?? 0), 0) ?? 0
  );
}

function countBy(
  orders: AnalyticsOrderRow[] | null | undefined,
  predicate: (order: AnalyticsOrderRow) => boolean
): number {
  return orders?.filter(predicate).length ?? 0;
}

export function sumEarned(
  orders: AnalyticsOrderRow[] | null | undefined
): number {
  return sumBy(orders, countsAsRevenue);
}

export function sumPendingValue(
  orders: AnalyticsOrderRow[] | null | undefined
): number {
  return sumBy(orders, countsAsPendingPayment);
}

export function sumCancelledValue(
  orders: AnalyticsOrderRow[] | null | undefined
): number {
  return sumBy(orders, countsAsCancelled);
}

export function sumRefundedValue(
  orders: AnalyticsOrderRow[] | null | undefined
): number {
  return sumBy(orders, countsAsRefunded);
}

export function sumGrossSales(
  orders: AnalyticsOrderRow[] | null | undefined
): number {
  return sumBy(orders, countsAsActiveOrder);
}

export function countOrders(
  orders: AnalyticsOrderRow[] | null | undefined
): number {
  return countBy(orders, countsAsActiveOrder);
}

export function countTotalOrders(
  orders: AnalyticsOrderRow[] | null | undefined
): number {
  return orders?.length ?? 0;
}

export function countByStatus(
  orders: AnalyticsOrderRow[],
  status: OrderStatus
): number {
  return countBy(orders, (order) => order.status === status);
}

export function averageOrderValue(
  orders: AnalyticsOrderRow[] | null | undefined
): number {
  const active = orders?.filter(countsAsActiveOrder) ?? [];
  if (!active.length) return 0;
  return Math.round(sumGrossSales(active) / active.length);
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function filterFromDate(
  orders: AnalyticsOrderRow[],
  from: Date
): AnalyticsOrderRow[] {
  const fromTime = from.getTime();
  return orders.filter(
    (order) =>
      order.created_at && new Date(order.created_at).getTime() >= fromTime
  );
}

export type PeriodSnapshot = {
  earning: number;
  pending: number;
  orders: number;
  cancelled: number;
  cancelledValue: number;
  refunded: number;
  refundedValue: number;
  grossSales: number;
};

export type DashboardPeriods = {
  today: PeriodSnapshot;
  thisWeek: PeriodSnapshot;
  thisMonth: PeriodSnapshot;
  last7Days: PeriodSnapshot;
};

export type CommerceSummary = {
  earnings: {
    total: number;
    net: number;
    gross: number;
    pending: number;
    refunded: number;
    cancelled: number;
    averageOrderValue: number;
  };
  orders: {
    total: number;
    active: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    refunded: number;
    failedPayment: number;
    inFulfillment: number;
  };
};

export function buildCommerceSummary(
  orders: AnalyticsOrderRow[]
): CommerceSummary {
  const totalEarning = sumEarned(orders);
  const refunded = sumRefundedValue(orders);
  const gross = sumGrossSales(orders);

  return {
    earnings: {
      total: totalEarning,
      net: Math.max(0, totalEarning - refunded),
      gross,
      pending: sumPendingValue(orders),
      refunded,
      cancelled: sumCancelledValue(orders),
      averageOrderValue: averageOrderValue(orders),
    },
    orders: {
      total: countTotalOrders(orders),
      active: countOrders(orders),
      pending: countByStatus(orders, "pending"),
      confirmed: countByStatus(orders, "confirmed"),
      processing: countByStatus(orders, "processing"),
      shipped: countByStatus(orders, "shipped"),
      delivered: countByStatus(orders, "delivered"),
      cancelled: countByStatus(orders, "cancelled"),
      refunded: countBy(orders, countsAsRefunded),
      failedPayment: countBy(orders, countsAsFailedPayment),
      inFulfillment: countBy(
        orders,
        (order) =>
          ACTIVE_STATUSES.includes(order.status as OrderStatus) &&
          order.status !== "delivered"
      ),
    },
  };
}

export function buildPeriodMetrics(
  orders: AnalyticsOrderRow[],
  now = new Date()
): DashboardPeriods {
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const last7Start = new Date(todayStart);
  last7Start.setDate(last7Start.getDate() - 6);

  const snapshot = (subset: AnalyticsOrderRow[]): PeriodSnapshot => ({
    earning: sumEarned(subset),
    pending: sumPendingValue(subset),
    orders: countOrders(subset),
    cancelled: countBy(subset, countsAsCancelled),
    cancelledValue: sumCancelledValue(subset),
    refunded: countBy(subset, countsAsRefunded),
    refundedValue: sumRefundedValue(subset),
    grossSales: sumGrossSales(subset),
  });

  return {
    today: snapshot(filterFromDate(orders, todayStart)),
    thisWeek: snapshot(filterFromDate(orders, weekStart)),
    thisMonth: snapshot(filterFromDate(orders, monthStart)),
    last7Days: snapshot(filterFromDate(orders, last7Start)),
  };
}

export function buildPaymentMethodBreakdown(orders: AnalyticsOrderRow[]) {
  const counts = new Map<string, number>();
  for (const order of orders.filter(countsAsActiveOrder)) {
    const method = order.payment_method ?? "unknown";
    counts.set(method, (counts.get(method) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([method, count]) => ({
    method: method.replace("_", " "),
    count,
  }));
}

export function buildPaymentStatusBreakdown(orders: AnalyticsOrderRow[]) {
  const counts = new Map<string, number>();
  for (const order of orders) {
    const status = order.payment_status ?? "pending";
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([status, count]) => ({
    status: status.replace("_", " "),
    count,
  }));
}

export function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("en-PK", { weekday: "short" });
}
