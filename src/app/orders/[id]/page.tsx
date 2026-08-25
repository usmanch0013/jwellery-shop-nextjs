import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/actions/orders";
import { formatPrice } from "@/lib/products/format";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants/commerce";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const data = await getOrderById(id);
  if (!data) notFound();

  const { order, items } = data;
  const address = order.shipping_address as Record<string, string>;

  return (
    <div className="py-10 px-4 max-w-[800px] mx-auto">
      <Link href="/orders" className="text-sm text-primary underline mb-4 inline-block">
        ← Back to orders
      </Link>
      <h1 className="font-serif text-3xl mb-2">{order.order_number}</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Placed on {new Date(order.created_at).toLocaleString()}
      </p>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="border p-4">
          <h2 className="font-medium mb-2">Status</h2>
          <p className="text-sm">{ORDER_STATUS_LABELS[order.status]}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Payment: {PAYMENT_METHOD_LABELS[order.payment_method]} (
            {order.payment_status})
          </p>
        </div>
        <div className="border p-4">
          <h2 className="font-medium mb-2">Shipping Address</h2>
          <p className="text-sm">
            {address.fullName}
            <br />
            {address.line1}
            <br />
            {address.city}, {address.province}
            <br />
            {address.phone}
          </p>
        </div>
      </div>

      <div className="border divide-y">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between p-4 text-sm"
          >
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-1 text-sm text-right">
        <p>Subtotal: {formatPrice(order.subtotal)}</p>
        <p>Shipping: {formatPrice(order.shipping)}</p>
        {order.discount > 0 && <p>Discount: -{formatPrice(order.discount)}</p>}
        <p className="font-medium text-base">
          Total: {formatPrice(order.total)}
        </p>
      </div>
    </div>
  );
}
