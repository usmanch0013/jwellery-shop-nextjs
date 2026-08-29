import Link from "next/link";
import { ArrowRight, Package, ShoppingCart, Wallet } from "lucide-react";
import type { CommerceSummary } from "@/lib/admin/analytics";
import { formatPrice } from "@/lib/products/format";

export default function DashboardHomeSummary({
  summary,
  lowStockCount,
}: {
  summary: CommerceSummary;
  lowStockCount: number;
}) {
  const { earnings, orders } = summary;
  const toFulfill = orders.pending + orders.confirmed + orders.processing;

  const tasks = [
    {
      href: "/admin/orders?status=pending",
      label: "Orders to fulfill",
      count: toFulfill,
      show: toFulfill > 0,
    },
    {
      href: "/admin/orders",
      label: "Payment to capture",
      count: orders.pending,
      show: earnings.pending > 0,
    },
    {
      href: "/admin/inventory",
      label: "Low stock items",
      count: lowStockCount,
      show: lowStockCount > 0,
    },
  ].filter((t) => t.show);

  return (
    <div className="space-y-4">
      <div className="admin-card divide-y divide-[var(--admin-border)]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Wallet className="h-4 w-4 text-[var(--admin-text-subdued)]" />
            <span className="text-[13px] text-[var(--admin-text-subdued)]">
              Total sales
            </span>
          </div>
          <span className="text-sm font-semibold">
            {formatPrice(earnings.total)}
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="h-4 w-4 text-[var(--admin-text-subdued)]" />
            <span className="text-[13px] text-[var(--admin-text-subdued)]">
              Orders
            </span>
          </div>
          <span className="text-sm font-semibold">{orders.total}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Package className="h-4 w-4 text-[var(--admin-text-subdued)]" />
            <span className="text-[13px] text-[var(--admin-text-subdued)]">
              Avg. order value
            </span>
          </div>
          <span className="text-sm font-semibold">
            {formatPrice(earnings.averageOrderValue)}
          </span>
        </div>
      </div>

      {tasks.length > 0 ? (
        <div className="admin-card p-4">
          <h3 className="text-sm font-semibold">Things to do</h3>
          <ul className="mt-3 space-y-1">
            {tasks.map((task) => (
              <li key={task.href}>
                <Link
                  href={task.href}
                  className="flex items-center justify-between rounded-lg px-2 py-2 text-[13px] hover:bg-[var(--admin-bg)]"
                >
                  <span>
                    {task.label}{" "}
                    <span className="font-semibold text-[#008060]">
                      ({task.count})
                    </span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--admin-text-subdued)]" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="admin-card p-4">
          <h3 className="text-sm font-semibold">All caught up</h3>
          <p className="mt-1 text-[12px] text-[var(--admin-text-subdued)]">
            No urgent tasks right now.
          </p>
        </div>
      )}

      <div className="admin-card p-4">
        <h3 className="text-sm font-semibold">Quick links</h3>
        <div className="mt-2 space-y-0.5">
          {[
            { href: "/admin/products/new", label: "Add product" },
            { href: "/admin/cms/pages", label: "Edit website pages" },
            { href: "/admin/cms/homepage", label: "Edit homepage" },
            { href: "/admin/orders", label: "View all orders" },
            { href: "/admin/analytics", label: "View analytics" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between rounded-lg px-2 py-2 text-[13px] text-[#008060] hover:bg-[var(--admin-bg)]"
            >
              {link.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
