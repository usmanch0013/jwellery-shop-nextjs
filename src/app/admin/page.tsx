import {
  Ban,
  Clock,
  DollarSign,
  Package,
  RotateCcw,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import {
  getDashboardChartData,
  getDashboardStats,
  getAdminOrders,
} from "@/lib/admin/queries";
import StatCard from "@/components/admin/StatCard";
import DashboardCharts from "@/components/admin/DashboardCharts";
import DashboardCommerceOverview from "@/components/admin/DashboardCommerceOverview";
import DashboardPeriodMetrics from "@/components/admin/DashboardPeriodMetrics";
import DashboardQuickActions from "@/components/admin/DashboardQuickActions";
import RecentOrdersTable from "@/components/admin/RecentOrdersTable";
import { formatPrice } from "@/lib/products/format";

export default async function AdminDashboardPage() {
  const [stats, chartData, recentOrders] = await Promise.all([
    getDashboardStats(),
    getDashboardChartData(),
    getAdminOrders(8),
  ]);

  const summary = chartData.summary;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br from-[#092f29] via-[#0d4a3f] to-[#123f37] px-6 py-7 text-white shadow-[0_20px_50px_rgba(9,47,41,0.22)] lg:px-8 lg:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.22),transparent_35%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-champagne/85">
              E-commerce command center
            </p>
            <h1 className="mt-2 font-serif text-3xl lg:text-[2.6rem] leading-tight">
              Your store at a glance
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
              Total earnings, orders, cancellations, returns, fulfillment and
              payments — everything you need to run Lumière like a pro.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-wider text-white/50">
                Total earning
              </p>
              <p className="mt-1 font-serif text-xl">
                {formatPrice(summary.earnings.total)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-wider text-white/50">
                Total orders
              </p>
              <p className="mt-1 font-serif text-xl">{summary.orders.total}</p>
            </div>
            <div className="rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-wider text-amber-100/80">
                Pending
              </p>
              <p className="mt-1 font-serif text-xl text-amber-50">
                {formatPrice(summary.earnings.pending)}
              </p>
            </div>
            <div className="rounded-2xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-wider text-rose-100/80">
                Cancelled / refunded
              </p>
              <p className="mt-1 font-serif text-xl text-rose-50">
                {summary.orders.cancelled + summary.orders.refunded}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        <StatCard
          label="Total earning"
          value={formatPrice(summary.earnings.total)}
          icon={DollarSign}
          accent="gold"
          hint="Confirmed revenue"
        />
        <StatCard
          label="Net earning"
          value={formatPrice(summary.earnings.net)}
          icon={TrendingUp}
          accent="emerald"
          hint="After refunds"
        />
        <StatCard
          label="Total orders"
          value={summary.orders.total}
          icon={ShoppingCart}
          accent="sky"
          hint={`${summary.orders.active} active`}
        />
        <StatCard
          label="Delivered"
          value={summary.orders.delivered}
          icon={ShoppingCart}
          accent="emerald"
          hint="Completed orders"
        />
        <StatCard
          label="Pending"
          value={summary.orders.pending}
          icon={Clock}
          accent="amber"
          hint={formatPrice(summary.earnings.pending)}
        />
        <StatCard
          label="Cancelled"
          value={summary.orders.cancelled}
          icon={Ban}
          accent="rose"
          hint={formatPrice(summary.earnings.cancelled)}
        />
        <StatCard
          label="Refunded"
          value={summary.orders.refunded}
          icon={RotateCcw}
          accent="violet"
          hint={formatPrice(summary.earnings.refunded)}
        />
        <StatCard
          label="Products"
          value={stats.productCount}
          icon={Package}
          accent="gold"
          hint={`${stats.lowStockCount} low stock · ${stats.soldOutCount} sold out`}
        />
      </section>

      <DashboardCommerceOverview summary={summary} />

      <DashboardPeriodMetrics periods={chartData.periods} />

      <DashboardCharts data={chartData} />

      <section className="grid gap-5 xl:grid-cols-[1.6fr_0.9fr]">
        <RecentOrdersTable orders={recentOrders} />
        <DashboardQuickActions
          pendingReviews={stats.reviewPending}
          unreadMessages={stats.messageCount}
        />
      </section>
    </div>
  );
}
