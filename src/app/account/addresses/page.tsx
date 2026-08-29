import { getAddresses } from "@/actions/auth";
import AddressForm from "@/components/account/AddressForm";
import AddressListClient from "@/components/account/AddressListClient";
import { UserCard, UserPageHeader } from "@/components/account/UserShell";

export const metadata = { title: "Addresses | Lumière Jewellery" };

export default async function AccountAddressesPage() {
  const addresses = await getAddresses();

  return (
    <div className="space-y-5">
      <UserPageHeader
        title="Saved addresses"
        description="Manage delivery addresses for faster checkout."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <UserCard title="Add new address">
          <AddressForm />
        </UserCard>
        <UserCard title="Your addresses">
          <AddressListClient addresses={addresses} />
        </UserCard>
      </div>
    </div>
  );
}
