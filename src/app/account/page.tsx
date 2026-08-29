import Link from "next/link";
import { getUserOrders } from "@/actions/orders";
import { getUserDashboardStats } from "@/lib/account/queries";
import UserStatCard from "@/components/account/UserStatCard";
import UserOrdersList from "@/components/account/UserOrdersList";
import { formatPrice } from "@/lib/products/format";
import { Heart, Package, ShoppingBag, Wallet } from "lucide-react";

export default async function AccountDashboardPage() {
  const [stats, orders] = await Promise.all([
    getUserDashboardStats(),
    getUserOrders(),
  ]);

  const s = stats ?? {
    orderCount: orders.length,
    activeOrders: 0,
    wishlistCount: 0,
    totalSpent: 0,
    recentOrders: orders.slice(0, 5),
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back — manage orders, wishlist and account details.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <UserStatCard
          label="Total orders"
          value={s.orderCount}
          icon={Package}
          hint={`${s.activeOrders} active`}
        />
        <UserStatCard
          label="Total spent"
          value={formatPrice(s.totalSpent)}
          icon={Wallet}
        />
        <UserStatCard
          label="Wishlist"
          value={s.wishlistCount}
          icon={Heart}
        />
        <UserStatCard
          label="Active orders"
          value={s.activeOrders}
          icon={ShoppingBag}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-xl">Recent orders</h2>
            {orders.length > 0 && (
              <Link
                href="/account/orders"
                className="text-[13px] font-medium text-primary hover:underline"
              >
                View all →
              </Link>
            )}
          </div>
          <UserOrdersList orders={s.recentOrders} compact />
        </section>

        <aside className="space-y-3">
          <h2 className="font-serif text-xl">Quick links</h2>
          <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm space-y-2">
            {[
              { href: "/shop", label: "Shop collection" },
              { href: "/account/wishlist", label: "View wishlist" },
              { href: "/account/addresses", label: "Manage addresses" },
              { href: "/track-order", label: "Track an order" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-[13px] text-foreground/80 transition-colors hover:bg-muted/50 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
