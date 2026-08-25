import Link from "next/link";
import { getUserOrders } from "@/actions/orders";
import { formatPrice } from "@/lib/products/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants/commerce";

export const metadata = { title: "My Orders | Lumière Jewellery" };

export default async function OrdersPage() {
  const orders = await getUserOrders();

  return (
    <div className="py-10 px-4 max-w-[900px] mx-auto">
      <h1 className="font-serif text-3xl mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">
          No orders yet.{" "}
          <Link href="/shop" className="text-primary underline">
            Start shopping
          </Link>
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block border p-4 hover:bg-muted/50"
            >
              <div className="flex justify-between">
                <span className="font-medium">{order.order_number}</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(order.created_at).toLocaleString()} ·{" "}
                {ORDER_STATUS_LABELS[order.status]}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
