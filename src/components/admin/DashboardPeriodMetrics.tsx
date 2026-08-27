import { CalendarDays, Clock, ShoppingBag, Wallet } from "lucide-react";
import type { DashboardPeriods } from "@/lib/admin/analytics";
import { formatPrice } from "@/lib/products/format";

type PeriodKey = keyof DashboardPeriods;

const periodLabels: Record<PeriodKey, string> = {
  today: "Today",
  thisWeek: "This week",
  thisMonth: "This month",
  last7Days: "Last 7 days",
};

export default function DashboardPeriodMetrics({
  periods,
}: {
  periods: DashboardPeriods;
}) {
  const keys: PeriodKey[] = ["today", "thisWeek", "thisMonth", "last7Days"];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Wallet className="h-4 w-4 text-champagne-dark" />
        <h2 className="font-serif text-xl text-foreground">
          Period breakdown
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/60 bg-white/50 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Earnings by period
              </p>
              <p className="text-sm text-muted-foreground">
                Earned, pending, cancelled & refunded
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {keys.map((key) => (
              <div
                key={`earn-${key}`}
                className="rounded-xl border border-border/60 bg-background/80 px-4 py-3"
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {periodLabels[key]}
                </p>
                <p className="mt-1 font-serif text-xl">
                  {formatPrice(periods[key].earning)}
                </p>
                <div className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
                  <p>Pending: {formatPrice(periods[key].pending)}</p>
                  <p>Gross: {formatPrice(periods[key].grossSales)}</p>
                  {periods[key].cancelled > 0 && (
                    <p className="text-rose-700">
                      Cancelled: {periods[key].cancelled} (
                      {formatPrice(periods[key].cancelledValue)})
                    </p>
                  )}
                  {periods[key].refunded > 0 && (
                    <p className="text-amber-700">
                      Refunded: {periods[key].refunded} (
                      {formatPrice(periods[key].refundedValue)})
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/60 bg-white/50 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Orders by period
              </p>
              <p className="text-sm text-muted-foreground">
                Placed, cancelled and net active orders
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {keys.map((key) => (
              <div
                key={`ord-${key}`}
                className="rounded-xl border border-border/60 bg-background/80 px-4 py-3"
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {periodLabels[key]}
                </p>
                <p className="mt-1 font-serif text-xl">{periods[key].orders}</p>
                <div className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
                  <p>Active orders</p>
                  {periods[key].cancelled > 0 && (
                    <p className="text-rose-700">
                      {periods[key].cancelled} cancelled
                    </p>
                  )}
                  {periods[key].refunded > 0 && (
                    <p className="text-amber-700">
                      {periods[key].refunded} refunded
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/70 px-3 py-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          This week starts Monday
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/70 px-3 py-1.5">
          <Clock className="h-3.5 w-3.5" />
          Last 7 days is a rolling window
        </span>
      </div>
    </div>
  );
}
