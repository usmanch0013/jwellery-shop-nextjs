import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CommerceSummary } from "@/lib/admin/analytics";
import { formatPrice } from "@/lib/products/format";

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-4 py-3 last:border-0 lg:px-5">
      <span className="text-[13px] text-[var(--admin-text-subdued)]">{label}</span>
      <span className="text-[13px] font-semibold">{value}</span>
    </div>
  );
}

export default function DashboardCommerceOverview({
  summary,
}: {
  summary: CommerceSummary;
}) {
  const { earnings, orders } = summary;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="admin-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-4 py-3 lg:px-5">
          <h3 className="text-sm font-semibold">Earnings</h3>
          <Link
            href="/admin/payments"
            className="text-[12px] font-medium text-[#008060] hover:underline"
          >
            View payments
          </Link>
        </div>
        <MetricRow label="Total sales" value={formatPrice(earnings.total)} />
        <MetricRow label="Net sales" value={formatPrice(earnings.net)} />
        <MetricRow label="Gross sales" value={formatPrice(earnings.gross)} />
        <MetricRow
          label="Average order"
          value={formatPrice(earnings.averageOrderValue)}
        />
        <MetricRow
          label="Pending payment"
          value={formatPrice(earnings.pending)}
        />
        <MetricRow label="Refunded" value={formatPrice(earnings.refunded)} />
      </div>

      <div className="admin-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-4 py-3 lg:px-5">
          <h3 className="text-sm font-semibold">Orders</h3>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[#008060] hover:underline"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <MetricRow label="Total" value={orders.total} />
        <MetricRow label="Active" value={orders.active} />
        <MetricRow label="Pending" value={orders.pending} />
        <MetricRow label="In fulfillment" value={orders.inFulfillment} />
        <MetricRow label="Delivered" value={orders.delivered} />
        <MetricRow label="Cancelled" value={orders.cancelled} />
        <MetricRow label="Refunded" value={orders.refunded} />
      </div>
    </div>
  );
}
