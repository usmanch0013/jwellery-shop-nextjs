import {
  getDashboardChartData,
  getDashboardStats,
  getAdminOrders,
} from "@/lib/admin/queries";
import StatCard from "@/components/admin/StatCard";
import DashboardCharts from "@/components/admin/DashboardCharts";
import DashboardHomeSummary from "@/components/admin/DashboardHomeSummary";
import DashboardCmsPanel from "@/components/admin/DashboardCmsPanel";
import RecentOrdersTable from "@/components/admin/RecentOrdersTable";
import { formatPrice } from "@/lib/products/format";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { Clock, Package, ShoppingCart, TrendingUp } from "lucide-react";

export default async function AdminDashboardPage() {
  const [stats, chartData, recentOrders] = await Promise.all([
    getDashboardStats(),
    getDashboardChartData(),
    getAdminOrders(5),
  ]);

  const summary = chartData.summary;

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <AdminPageHeader title="Home" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total sales"
          value={formatPrice(summary.earnings.total)}
          icon={TrendingUp}
        />
        <StatCard
          label="Orders"
          value={summary.orders.total}
          icon={ShoppingCart}
          hint={`${summary.orders.delivered} delivered`}
        />
        <StatCard
          label="To fulfill"
          value={summary.orders.pending + summary.orders.confirmed}
          icon={Clock}
        />
        <StatCard
          label="Products"
          value={stats.productCount}
          icon={Package}
          hint={`${stats.lowStockCount} low stock`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <DashboardCharts data={chartData} />
        <DashboardHomeSummary
          summary={summary}
          lowStockCount={stats.lowStockCount}
        />
      </div>

      <RecentOrdersTable orders={recentOrders} />

      <DashboardCmsPanel />
    </div>
  );
}
