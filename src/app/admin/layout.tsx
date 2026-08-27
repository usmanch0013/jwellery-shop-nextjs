import { requireAdmin } from "@/lib/admin/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen flex bg-[#f3eee4]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(13,74,63,0.08),transparent_30%)]" />
      <AdminSidebar email={user.email ?? ""} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-white/60 bg-white/70 px-6 backdrop-blur-xl">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Boutique management
            </p>
            <p className="font-serif text-lg text-foreground">
              Lumière Admin Studio
            </p>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              Live store connected
            </div>
            <div className="rounded-full border border-champagne/40 bg-white px-3 py-1 text-xs text-muted-foreground">
              {new Date().toLocaleDateString("en-PK", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
