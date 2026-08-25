import TrackOrderClient from "@/components/orders/TrackOrderClient";

export const metadata = { title: "Track Order | Lumière Jewellery" };

interface TrackOrderPageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function TrackOrderPage({
  searchParams,
}: TrackOrderPageProps) {
  const { order } = await searchParams;
  return (
    <div className="py-16 px-4">
      <h1 className="font-serif text-3xl text-center mb-8">Track Your Order</h1>
      <TrackOrderClient initialOrder={order} />
    </div>
  );
}
