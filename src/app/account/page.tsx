import Link from "next/link";
import { logoutAction, getProfile, getAddresses } from "@/actions/auth";
import { getUserOrders } from "@/actions/orders";
import { formatPrice } from "@/lib/products/format";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants/commerce";
import { Button } from "@/components/ui/button";
import AccountProfileForm from "@/components/account/AccountProfileForm";
import AddressForm from "@/components/account/AddressForm";

export const metadata = { title: "My Account | Lumière Jewellery" };

export default async function AccountPage() {
  const profile = await getProfile();
  const orders = await getUserOrders();
  const addresses = await getAddresses();

  if (!profile) {
    return (
      <div className="py-20 text-center px-4">
        <h1 className="font-serif text-3xl mb-4">My Account</h1>
        <p className="text-muted-foreground mb-6">
          Please sign in to view your account.
        </p>
        <Link
          href="/login"
          className="inline-flex h-9 items-center justify-center bg-primary px-4 text-sm text-primary-foreground"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl">My Account</h1>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            Sign Out
          </Button>
        </form>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <section>
          <h2 className="font-serif text-xl mb-4">Profile</h2>
          <AccountProfileForm
            fullName={profile.profile?.full_name ?? ""}
            phone={profile.profile?.phone ?? ""}
            email={profile.user.email ?? ""}
          />
        </section>

        <section>
          <h2 className="font-serif text-xl mb-4">Saved Addresses</h2>
          <AddressForm />
          {addresses.length > 0 && (
            <ul className="mt-4 space-y-3">
              {addresses.map((addr) => (
                <li key={addr.id} className="border p-3 text-sm">
                  <p className="font-medium">{addr.label}</p>
                  <p>
                    {addr.line1}, {addr.city}, {addr.province}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-12">
        <h2 className="font-serif text-xl mb-4">Order History</h2>
        {orders.length === 0 ? (
          <p className="text-muted-foreground text-sm">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-2 border p-4 hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()} ·{" "}
                    {PAYMENT_METHOD_LABELS[order.payment_method]}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPrice(order.total)}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {ORDER_STATUS_LABELS[order.status]}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
