"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import UserSidebar, { UserTopBar } from "@/components/account/UserSidebar";

const PAGE_TITLES: Record<string, string> = {
  "/account": "Dashboard",
  "/account/orders": "My Orders",
  "/account/wishlist": "Wishlist",
  "/account/addresses": "Addresses",
  "/account/profile": "Profile",
};

function pageTitle(pathname: string): string {
  if (pathname.startsWith("/account/orders/")) return "Order details";
  return PAGE_TITLES[pathname] ?? "My Account";
}

export default function UserDashboardLayout({
  name,
  email,
  children,
}: {
  name: string;
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="user-dashboard min-h-[calc(100dvh-var(--header-height))] bg-[#faf9f7]">
      <div className="mx-auto flex max-w-[1200px]">
        <UserSidebar
          name={name}
          email={email}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="min-w-0 flex-1">
          <UserTopBar
            onMenuClick={() => setMobileOpen(true)}
            title={pageTitle(pathname)}
          />
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
