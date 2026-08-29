"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";

const NAV = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/profile", label: "Profile", icon: User },
];

export function UserTopBar({
  onMenuClick,
  title,
}: {
  onMenuClick: () => void;
  title?: string;
}) {
  return (
    <header className="sticky top-[var(--header-height)] z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/95 px-4 backdrop-blur-md lg:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60"
        aria-label="Open menu"
      >
        <LayoutDashboard className="h-4 w-4" />
      </button>
      <p className="font-serif text-lg">{title ?? "My Account"}</p>
    </header>
  );
}

export default function UserSidebar({
  name,
  email,
  mobileOpen,
  onMobileClose,
}: {
  name: string;
  email: string;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const sidebar = (
    <aside className="flex h-full flex-col bg-[#0B3D35] text-white">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-serif text-lg">{name || "Welcome"}</p>
            <p className="truncate text-[12px] text-white/60">{email}</p>
          </div>
          <button
            type="button"
            onClick={onMobileClose}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors",
                active
                  ? "bg-champagne/20 text-champagne"
                  : "text-white/75 hover:bg-white/8 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-0.5 border-t border-white/10 p-3">
        <Link
          href="/shop"
          onClick={onMobileClose}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-white/75 hover:bg-white/8 hover:text-white"
        >
          <ShoppingBag className="h-4 w-4" />
          Continue shopping
        </Link>
        <Link
          href="/track-order"
          onClick={onMobileClose}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-white/75 hover:bg-white/8 hover:text-white"
        >
          <Search className="h-4 w-4" />
          Track order
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-white/75 hover:bg-white/8 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 lg:hidden",
          mobileOpen ? "block" : "hidden"
        )}
        onClick={onMobileClose}
        aria-hidden
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] transition-transform lg:static lg:z-0 lg:translate-x-0 lg:shrink-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebar}
      </div>
    </>
  );
}
