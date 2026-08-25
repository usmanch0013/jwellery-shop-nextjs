import Link from "next/link";

export const metadata = { title: "Terms of Service | Lumière Jewellery" };

export default function TermsPage() {
  return (
    <div className="py-16 px-4 max-w-3xl mx-auto">
      <h1 className="font-serif text-3xl mb-6">Terms of Service</h1>
      <p className="text-muted-foreground leading-relaxed mb-4">
        By using Lumière Jewellery website, you agree to these terms. All
        products are artificial jewellery unless stated otherwise. Prices are in
        PKR and subject to change without notice.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        See also our{" "}
        <Link href="/refund-policy" className="text-primary underline">
          Refund Policy
        </Link>{" "}
        and{" "}
        <Link href="/shipping-policy" className="text-primary underline">
          Shipping Policy
        </Link>
        .
      </p>
    </div>
  );
}
