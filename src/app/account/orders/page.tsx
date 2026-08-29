import { getUserOrders } from "@/actions/orders";
import { UserPageHeader } from "@/components/account/UserShell";
import UserOrdersList from "@/components/account/UserOrdersList";

export const metadata = { title: "My Orders | Lumière Jewellery" };

export default async function AccountOrdersPage() {
  const orders = await getUserOrders();

  return (
    <div className="space-y-5">
      <UserPageHeader
        title="My orders"
        description="View status, tracking and order details."
      />
      <UserOrdersList orders={orders} showHeader={false} />
    </div>
  );
}
