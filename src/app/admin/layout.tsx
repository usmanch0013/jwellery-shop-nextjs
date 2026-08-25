import { requireAdmin } from "@/lib/admin/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen flex bg-muted/30">
      <AdminSidebar email={user.email ?? ""} />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-border bg-background px-6 flex items-center justify-between shrink-0">
          <p className="text-sm text-muted-foreground">
            Store management dashboard
          </p>
        </header>
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
