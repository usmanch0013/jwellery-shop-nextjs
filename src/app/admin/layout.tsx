import { requireAdmin } from "@/lib/admin/auth";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { adminFont } from "@/lib/fonts/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className={`admin-shell ${adminFont.variable} min-h-screen`}>
      <AdminLayoutClient email={user.email ?? ""}>
        {children}
      </AdminLayoutClient>
    </div>
  );
}
