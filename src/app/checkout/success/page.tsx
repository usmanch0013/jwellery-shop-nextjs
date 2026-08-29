import Link from "next/link";

interface SuccessPageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { order: orderNumber } = await searchParams;

  return (
    <div className="py-20 px-4 max-w-lg mx-auto text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-6 text-2xl">
        ✓
      </div>
      <h1 className="font-serif text-3xl mb-4">Thank You!</h1>
      <p className="text-muted-foreground mb-6">
        Your order has been placed successfully.
      </p>
      {orderNumber && (
        <p className="text-lg font-medium mb-8">
          Order #{orderNumber}
        </p>
      )}
      <p className="text-sm text-muted-foreground mb-8">
        Use your order number and phone on the track order page to view status.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/track-order?order=${orderNumber ?? ""}`}
          className="inline-flex h-9 items-center justify-center bg-primary px-4 text-sm text-primary-foreground"
        >
          Track Order
        </Link>
        <Link
          href="/shop"
          className="inline-flex h-9 items-center justify-center border border-border px-4 text-sm"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
