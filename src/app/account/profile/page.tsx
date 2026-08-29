import { getProfile } from "@/actions/auth";
import AccountProfileForm from "@/components/account/AccountProfileForm";
import { UserCard, UserPageHeader } from "@/components/account/UserShell";

export const metadata = { title: "Profile | Lumière Jewellery" };

export default async function AccountProfilePage() {
  const profile = await getProfile();
  if (!profile) return null;

  return (
    <div className="space-y-5">
      <UserPageHeader
        title="Profile"
        description="Update your name and contact details."
      />
      <UserCard title="Personal information" className="max-w-lg">
        <AccountProfileForm
          fullName={profile.profile?.full_name ?? ""}
          phone={profile.profile?.phone ?? ""}
          email={profile.user.email ?? ""}
        />
      </UserCard>
    </div>
  );
}
