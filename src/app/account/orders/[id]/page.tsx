import { notFound } from "next/navigation";
import { getOrderById } from "@/actions/orders";
import OrderDetailView from "@/components/account/OrderDetailView";
import type { DbOrderEvent } from "@/lib/orders/events";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getOrderById(id);
  return {
    title: data
      ? `${data.order.order_number} | My Orders`
      : "Order | Lumière Jewellery",
  };
}

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getOrderById(id);
  if (!data) notFound();

  return (
    <OrderDetailView
      order={data.order}
      items={data.items}
      events={(data.events ?? []) as DbOrderEvent[]}
    />
  );
}
