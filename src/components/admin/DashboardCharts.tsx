"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardChartData } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/products/format";

interface DashboardChartsProps {
  data: DashboardChartData;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; dataKey?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/60 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} className="mt-1 text-sm font-medium text-foreground">
          {entry.dataKey === "orders"
            ? `${entry.value} orders`
            : entry.dataKey === "pending"
              ? `${formatPrice(entry.value)} pending`
              : formatPrice(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
  const hasRevenue = data.revenueSeries.some((point) => point.revenue > 0);
  const hasStatus = data.ordersByStatus.length > 0;

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <div className="xl:col-span-2 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-[0_8px_30px_rgba(9,47,41,0.06)] backdrop-blur-sm">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Revenue overview
            </p>
            <h3 className="mt-1 font-serif text-xl text-foreground">
              Last 7 days earnings
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Earned: {formatPrice(data.periods.last7Days.earning)} · Pending:{" "}
              {formatPrice(data.periods.last7Days.pending)}
            </p>
          </div>
          <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Live analytics
          </div>
        </div>

        <div className="h-[280px]">
          {hasRevenue ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueSeries}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d4a3f" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0d4a3f" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#e8e2d8" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8b8175", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8b8175", fontSize: 12 }}
                  tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="revenue"
                  stroke="#0d4a3f"
                  strokeWidth={2.5}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 text-sm text-muted-foreground">
              Revenue chart will appear once orders start coming in
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-[0_8px_30px_rgba(9,47,41,0.06)] backdrop-blur-sm">
        <div className="mb-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Order status
          </p>
          <h3 className="mt-1 font-serif text-xl text-foreground">
            Fulfillment mix
          </h3>
        </div>

        <div className="h-[220px]">
          {hasStatus ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.ordersByStatus}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                >
                  {data.ordersByStatus.map((entry) => (
                    <Cell key={entry.status} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 text-sm text-muted-foreground">
              No orders yet
            </div>
          )}
        </div>

        <div className="mt-2 space-y-2">
          {data.ordersByStatus.map((item) => (
            <div key={item.status} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-muted-foreground">{item.status}</span>
              </div>
              <span className="font-medium">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="xl:col-span-2 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-[0_8px_30px_rgba(9,47,41,0.06)] backdrop-blur-sm">
        <div className="mb-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Daily orders
          </p>
          <h3 className="mt-1 font-serif text-xl text-foreground">
            Last 7 days orders
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {data.periods.last7Days.orders} total orders this week
          </p>
        </div>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.revenueSeries}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e8e2d8" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8b8175", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8b8175", fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="orders" fill="#c9a96e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-[0_8px_30px_rgba(9,47,41,0.06)] backdrop-blur-sm">
        <div className="mb-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Payment methods
          </p>
          <h3 className="mt-1 font-serif text-xl text-foreground">
            How customers pay
          </h3>
        </div>
        <div className="space-y-3">
          {data.paymentsByMethod.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment data yet</p>
          ) : (
            data.paymentsByMethod.map((item) => (
              <div
                key={item.method}
                className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-2.5 text-sm"
              >
                <span className="capitalize">{item.method}</span>
                <span className="font-medium">{item.count} orders</span>
              </div>
            ))
          )}
        </div>
        <div className="mt-5 border-t border-border/50 pt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Payment status
          </p>
          <div className="space-y-2">
            {data.paymentsByStatus.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between text-sm"
              >
                <span className="capitalize text-muted-foreground">
                  {item.status}
                </span>
                <span className="font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="xl:col-span-3 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-[0_8px_30px_rgba(9,47,41,0.06)] backdrop-blur-sm">
        <div className="mb-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Top categories
          </p>
          <h3 className="mt-1 font-serif text-xl text-foreground">
            Catalog strength
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {data.topCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet</p>
          ) : (
            data.topCategories.map((category) => {
              const max = Math.max(...data.topCategories.map((c) => c.count), 1);
              const width = Math.max((category.count / max) * 100, 8);
              return (
                <div key={category.name} className="rounded-xl border border-border/60 px-4 py-3">
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-muted-foreground">{category.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/60">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#0d4a3f] to-[#c9a96e]"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
