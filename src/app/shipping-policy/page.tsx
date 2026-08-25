import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
} from "@/lib/constants/commerce";

export const metadata = { title: "Shipping Policy | Lumière Jewellery" };

export default function ShippingPolicyPage() {
  return (
    <div className="py-16 px-4 max-w-3xl mx-auto">
      <h1 className="font-serif text-3xl mb-6">Shipping Policy</h1>
      <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
        <p>
          We ship across Pakistan. Standard delivery takes 3–7 business days
          depending on your city.
        </p>
        <p>
          Shipping fee: Rs. {STANDARD_SHIPPING_FEE.toLocaleString()} for orders
          under Rs. {FREE_SHIPPING_THRESHOLD.toLocaleString()}. Free shipping on
          orders above Rs. {FREE_SHIPPING_THRESHOLD.toLocaleString()}.
        </p>
        <p>International shipping available on request.</p>
      </div>
    </div>
  );
}
