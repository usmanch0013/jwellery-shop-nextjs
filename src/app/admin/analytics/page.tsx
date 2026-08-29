import {
  getDashboardChartData,
  getDashboardStats,
} from "@/lib/admin/queries";
import DashboardCharts from "@/components/admin/DashboardCharts";
import DashboardCommerceOverview from "@/components/admin/DashboardCommerceOverview";
import DashboardPeriodMetrics from "@/components/admin/DashboardPeriodMetrics";
import StatCard from "@/components/admin/StatCard";
import { formatPrice } from "@/lib/products/format";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const [stats, chartData] = await Promise.all([
    getDashboardStats(),
    getDashboardChartData(),
  ]);

  const summary = chartData.summary;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <AdminPageHeader
        title="Analytics"
        description="Sales performance and store metrics"
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total sales"
          value={formatPrice(summary.earnings.total)}
          icon={DollarSign}
          trend={chartData.revenueGrowth}
        />
        <StatCard
          label="Net sales"
          value={formatPrice(summary.earnings.net)}
          icon={TrendingUp}
        />
        <StatCard
          label="Orders"
          value={summary.orders.total}
          icon={ShoppingCart}
          hint={`${stats.soldOutCount} products sold out`}
        />
      </div>

      <DashboardPeriodMetrics periods={chartData.periods} />
      <DashboardCharts data={chartData} />
      <DashboardCommerceOverview summary={summary} />
    </div>
  );
}
