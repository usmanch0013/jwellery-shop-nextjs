import { redirect } from "next/navigation";
import { getProfile } from "@/actions/auth";
import UserDashboardLayout from "@/components/account/UserDashboardLayout";

export const metadata = { title: "My Account | Lumière Jewellery" };

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) {
    redirect("/login?redirect=/account");
  }

  return (
    <UserDashboardLayout
      name={profile.profile?.full_name ?? ""}
      email={profile.user.email ?? ""}
    >
      {children}
    </UserDashboardLayout>
  );
}
