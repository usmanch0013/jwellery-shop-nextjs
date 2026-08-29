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
    <div className="admin-card overflow-hidden">
      <div className="border-b border-[var(--admin-border)] px-4 py-3 lg:px-5">
        <h3 className="text-sm font-semibold">Sales by period</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="border-b border-[var(--admin-border)] bg-[#fafbfb]">
            <tr>
              <th className="px-4 py-2.5 text-left font-semibold text-[var(--admin-text-subdued)] lg:px-5">
                Period
              </th>
              <th className="px-4 py-2.5 text-right font-semibold text-[var(--admin-text-subdued)]">
                Sales
              </th>
              <th className="px-4 py-2.5 text-right font-semibold text-[var(--admin-text-subdued)]">
                Orders
              </th>
              <th className="px-4 py-2.5 text-right font-semibold text-[var(--admin-text-subdued)] lg:px-5">
                Pending
              </th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr
                key={key}
                className="border-b border-[var(--admin-border)] last:border-0"
              >
                <td className="px-4 py-3 font-medium lg:px-5">
                  {periodLabels[key]}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatPrice(periods[key].earning)}
                </td>
                <td className="px-4 py-3 text-right">{periods[key].orders}</td>
                <td className="px-4 py-3 text-right text-[var(--admin-text-subdued)] lg:px-5">
                  {formatPrice(periods[key].pending)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
