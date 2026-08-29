import { getUserOrders } from "@/actions/orders";
import UserOrdersList from "@/components/account/UserOrdersList";

export const metadata = { title: "My Orders | Lumière Jewellery" };

export default async function AccountOrdersPage() {
  const orders = await getUserOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl">My Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View status, tracking and order details.
        </p>
      </div>
      <UserOrdersList orders={orders} />
    </div>
  );
}
