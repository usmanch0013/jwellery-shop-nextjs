import { getProfile } from "@/actions/auth";
import AccountProfileForm from "@/components/account/AccountProfileForm";

export const metadata = { title: "Profile | Lumière Jewellery" };

export default async function AccountProfilePage() {
  const profile = await getProfile();
  if (!profile) return null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your name and contact details.
        </p>
      </div>
      <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm">
        <AccountProfileForm
          fullName={profile.profile?.full_name ?? ""}
          phone={profile.profile?.phone ?? ""}
          email={profile.user.email ?? ""}
        />
      </div>
    </div>
  );
}
