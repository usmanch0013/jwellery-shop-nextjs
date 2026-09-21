import Breadcrumbs from "@/components/Breadcrumbs";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata = { title: "Checkout | SHE Collection" };

export default function CheckoutPage() {
  return (
    <div className="py-10 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Cart", href: "/cart" },
            { label: "Checkout" },
          ]}
        />
        <h1 className="mb-6 font-serif text-2xl sm:mb-8 sm:text-3xl lg:text-4xl">
          Checkout
        </h1>
        <CheckoutForm />
      </div>
    </div>
  );
}
