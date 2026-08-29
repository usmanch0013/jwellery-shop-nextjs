"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import AdminSidebar, { AdminTopBar } from "@/components/admin/AdminSidebar";

/** Full-screen Elementor-style editor — no admin sidebar */
const PAGE_EDITOR_PATH = /^\/admin\/cms\/pages\/[^/]+$/;

export default function AdminLayoutClient({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isPageEditor = PAGE_EDITOR_PATH.test(pathname);

  if (isPageEditor) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar
        email={email}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
