import { getAddresses } from "@/actions/auth";
import AddressForm from "@/components/account/AddressForm";
import AddressListClient from "@/components/account/AddressListClient";

export const metadata = { title: "Addresses | Lumière Jewellery" };

export default async function AccountAddressesPage() {
  const addresses = await getAddresses();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl">Saved addresses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage delivery addresses for faster checkout.
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm">
          <h2 className="font-medium mb-4">Add new address</h2>
          <AddressForm />
        </div>
        <div>
          <h2 className="font-medium mb-4">Your addresses</h2>
          <AddressListClient addresses={addresses} />
        </div>
      </section>
    </div>
  );
}
