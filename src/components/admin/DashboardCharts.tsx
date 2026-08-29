"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardChartData } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/products/format";

const SHOPIFY_GREEN = "#008060";

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-card p-4 lg:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--admin-text)]">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-[12px] text-[var(--admin-text-subdued)]">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

export default function DashboardCharts({ data }: { data: DashboardChartData }) {
  const hasRevenue = data.revenueSeries.some((p) => p.revenue > 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard
        title="Total sales"
        subtitle={`Last 7 days · ${formatPrice(data.periods.last7Days.earning)} earned`}
      >
        <div className="h-[220px]">
          {hasRevenue ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueSeries}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SHOPIFY_GREEN} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={SHOPIFY_GREEN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e1e3e5" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#616161", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#616161", fontSize: 11 }}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #e1e3e5",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value) => [
                    formatPrice(Number(value ?? 0)),
                    "Sales",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={SHOPIFY_GREEN}
                  strokeWidth={2}
                  fill="url(#salesFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-bg)] text-center">
              <p className="text-[13px] font-medium text-[var(--admin-text)]">
                No sales yet
              </p>
              <p className="mt-1 max-w-[200px] text-[12px] text-[var(--admin-text-subdued)]">
                Sales will show here once orders are confirmed or paid.
              </p>
            </div>
          )}
        </div>
      </ChartCard>

      <ChartCard
        title="Orders"
        subtitle={`${data.periods.last7Days.orders} orders in the last 7 days`}
      >
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.revenueSeries}>
              <CartesianGrid stroke="#e1e3e5" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#616161", fontSize: 11 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#616161", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  border: "1px solid #e1e3e5",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="orders" fill={SHOPIFY_GREEN} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}