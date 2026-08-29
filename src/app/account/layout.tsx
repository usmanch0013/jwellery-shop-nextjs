import { redirect } from "next/navigation";
import { getProfile } from "@/actions/auth";
import UserDashboardLayout from "@/components/account/UserDashboardLayout";
import { adminFont } from "@/lib/fonts/admin";

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
    <div className={`user-shell ${adminFont.variable} min-h-screen`}>
      <UserDashboardLayout
        name={profile.profile?.full_name ?? ""}
        email={profile.user.email ?? ""}
      >
        <div className="mx-auto max-w-[1200px]">{children}</div>
      </UserDashboardLayout>
    </div>
  );
}
