import TrackOrderClient from "@/components/orders/TrackOrderClient";

export const metadata = { title: "Track Order | SHE Collection" };

interface TrackOrderPageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function TrackOrderPage({
  searchParams,
}: TrackOrderPageProps) {
  const { order } = await searchParams;
  return (
    <div className="py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-center font-serif text-2xl sm:text-3xl lg:text-4xl">
          Track Your Order
        </h1>
        <p className="mb-8 text-center text-sm text-muted-foreground sm:text-base">
          Enter your order number and phone to see delivery status.
        </p>
        <TrackOrderClient initialOrder={order} />
      </div>
    </div>
  );
}
