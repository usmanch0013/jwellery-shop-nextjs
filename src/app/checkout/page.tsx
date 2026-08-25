import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata = { title: "Checkout | Lumière Jewellery" };

export default function CheckoutPage() {
  return (
    <div className="py-10 px-4 max-w-[1200px] mx-auto">
      <h1 className="font-serif text-3xl mb-8">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
