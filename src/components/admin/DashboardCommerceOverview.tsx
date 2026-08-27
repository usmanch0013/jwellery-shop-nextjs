import Link from "next/link";
import {
  ArrowRight,
  Ban,
  CheckCircle2,
  Clock3,
  PackageCheck,
  RefreshCcw,
  RotateCcw,
  ShoppingBag,
  Truck,
  Wallet,
} from "lucide-react";
import type { CommerceSummary } from "@/lib/admin/analytics";
import { formatPrice } from "@/lib/products/format";

function MetricTile({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "default" | "success" | "warning" | "danger" | "muted";
}) {
  const tones = {
    default: "border-border/60 bg-background/80",
    success: "border-emerald-200 bg-emerald-50/60",
    warning: "border-amber-200 bg-amber-50/60",
    danger: "border-rose-200 bg-rose-50/60",
    muted: "border-border/50 bg-muted/30",
  };

  return (
    <div className={`rounded-xl border px-4 py-3 ${tones[tone]}`}>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-serif text-xl text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function SectionShell({
  title,
  description,
  icon: Icon,
  href,
  children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-white/60 bg-white/70 p-5 shadow-[0_8px_30px_rgba(9,47,41,0.06)] backdrop-blur-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-emerald-dark"
          >
            View
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
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
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <ShoppingBag className="h-4 w-4 text-champagne-dark" />
        <h2 className="font-serif text-xl text-foreground">
          Store performance overview
        </h2>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionShell
          title="Earnings"
          description="Revenue, refunds and order value across your store"
          icon={Wallet}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricTile
              label="Total earning"
              value={formatPrice(earnings.total)}
              sub="Confirmed & paid revenue"
              tone="success"
            />
            <MetricTile
              label="Net earning"
              value={formatPrice(earnings.net)}
              sub="After refunds"
              tone="success"
            />
            <MetricTile
              label="Gross sales"
              value={formatPrice(earnings.gross)}
              sub="All active order value"
            />
            <MetricTile
              label="Average order"
              value={formatPrice(earnings.averageOrderValue)}
              sub="AOV per active order"
            />
            <MetricTile
              label="Pending payment"
              value={formatPrice(earnings.pending)}
              sub={`${orders.pending} pending orders`}
              tone="warning"
            />
            <MetricTile
              label="Refunded"
              value={formatPrice(earnings.refunded)}
              sub={`${orders.refunded} return/refund orders`}
              tone="danger"
            />
          </div>
        </SectionShell>

        <SectionShell
          title="Orders"
          description="Complete order lifecycle from placement to delivery"
          icon={ShoppingBag}
          href="/admin/orders"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricTile
              label="Total orders"
              value={orders.total}
              sub="All orders placed"
            />
            <MetricTile
              label="Active orders"
              value={orders.active}
              sub="Excluding cancelled"
              tone="success"
            />
            <MetricTile
              label="Pending"
              value={orders.pending}
              sub="Awaiting confirmation"
              tone="warning"
            />
            <MetricTile
              label="In fulfillment"
              value={orders.inFulfillment}
              sub="Confirmed to shipped"
            />
            <MetricTile
              label="Delivered"
              value={orders.delivered}
              sub="Completed deliveries"
              tone="success"
            />
            <MetricTile
              label="Cancelled"
              value={orders.cancelled}
              sub={formatPrice(earnings.cancelled)}
              tone="danger"
            />
          </div>
        </SectionShell>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionShell
          title="Fulfillment pipeline"
          description="Where orders are in your workflow"
          icon={Truck}
          href="/admin/orders"
        >
          <div className="space-y-3">
            {[
              { label: "Pending", count: orders.pending, icon: Clock3 },
              { label: "Confirmed", count: orders.confirmed, icon: CheckCircle2 },
              { label: "Processing", count: orders.processing, icon: PackageCheck },
              { label: "Shipped", count: orders.shipped, icon: Truck },
              { label: "Delivered", count: orders.delivered, icon: CheckCircle2 },
            ].map(({ label, count, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3"
              >
                <div className="flex items-center gap-2 text-sm">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {label}
                </div>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          title="Returns & cancellations"
          description="Lost sales and customer returns"
          icon={RotateCcw}
        >
          <div className="grid gap-3">
            <MetricTile
              label="Cancelled orders"
              value={orders.cancelled}
              sub={formatPrice(earnings.cancelled)}
              tone="danger"
            />
            <MetricTile
              label="Refunded orders"
              value={orders.refunded}
              sub={formatPrice(earnings.refunded)}
              tone="danger"
            />
            <MetricTile
              label="Failed payments"
              value={orders.failedPayment}
              sub="Payment could not complete"
              tone="warning"
            />
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-3 text-xs text-rose-800">
              <div className="flex items-center gap-2 font-medium">
                <Ban className="h-3.5 w-3.5" />
                Total loss impact
              </div>
              <p className="mt-1 font-serif text-lg">
                {formatPrice(earnings.cancelled + earnings.refunded)}
              </p>
            </div>
          </div>
        </SectionShell>

        <SectionShell
          title="Quick health"
          description="Key ratios at a glance"
          icon={RefreshCcw}
        >
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
              <span className="text-muted-foreground">Delivery rate</span>
              <span className="font-medium">
                {orders.active > 0
                  ? Math.round((orders.delivered / orders.active) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
              <span className="text-muted-foreground">Cancellation rate</span>
              <span className="font-medium text-rose-700">
                {orders.total > 0
                  ? Math.round((orders.cancelled / orders.total) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
              <span className="text-muted-foreground">Refund rate</span>
              <span className="font-medium text-amber-700">
                {orders.total > 0
                  ? Math.round((orders.refunded / orders.total) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
              <span className="text-muted-foreground">Pending backlog</span>
              <span className="font-medium">
                {orders.active > 0
                  ? Math.round((orders.pending / orders.active) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </SectionShell>
      </div>
    </div>
  );
}
