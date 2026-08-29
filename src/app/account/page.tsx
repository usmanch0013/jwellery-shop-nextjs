import Link from "next/link";
import { getUserOrders } from "@/actions/orders";
import { getUserDashboardStats } from "@/lib/account/queries";
import { UserPageHeader } from "@/components/account/UserShell";
import UserStatCard from "@/components/account/UserStatCard";
import UserOrdersList from "@/components/account/UserOrdersList";
import UserQuickPanel from "@/components/account/UserQuickPanel";
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
    <div className="space-y-5">
      <UserPageHeader
        title="Home"
        description="Welcome back — manage orders, wishlist and account details."
        actions={
          <Link
            href="/shop"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--user-accent)] px-4 text-[13px] font-semibold text-white hover:bg-[#006e52]"
          >
            Shop now
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <UserOrdersList orders={s.recentOrders} />
        <UserQuickPanel />
      </div>
    </div>
  );
}
