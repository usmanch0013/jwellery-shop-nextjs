import AccountWishlistClient from "@/components/account/AccountWishlistClient";
import { UserPageHeader } from "@/components/account/UserShell";

export const metadata = { title: "Wishlist | Lumière Jewellery" };

export default function AccountWishlistPage() {
  return (
    <div className="space-y-5">
      <UserPageHeader
        title="Wishlist"
        description="Items you saved for later."
      />
      <AccountWishlistClient />
    </div>
  );
}
