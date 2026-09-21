import Link from "next/link";

interface SuccessPageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { order: orderNumber } = await searchParams;

  return (
    <div className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
          ✓
        </div>
        <h1 className="mb-4 font-serif text-2xl sm:text-3xl">Thank You!</h1>
        <p className="mb-6 text-muted-foreground">
          Your order has been placed successfully.
        </p>
        {orderNumber && (
          <p className="mb-8 text-lg font-medium">Order #{orderNumber}</p>
        )}
        <p className="mb-8 text-sm text-muted-foreground">
          Use your order number and phone on the track order page to view status.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          {orderNumber ? (
            <Link
              href={`/track-order?order=${encodeURIComponent(orderNumber)}`}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground"
            >
              Track Order
            </Link>
          ) : null}
          <Link
            href="/shop"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 text-sm font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
