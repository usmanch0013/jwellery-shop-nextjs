import AccountWishlistClient from "@/components/account/AccountWishlistClient";

export const metadata = { title: "Wishlist | Lumière Jewellery" };

export default function AccountWishlistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl">Wishlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Items you saved for later.
        </p>
      </div>
      <AccountWishlistClient />
    </div>
  );
}
