"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";

const NAV_SECTIONS = [
  {
    label: "Account",
    items: [
      { href: "/account", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/account/orders", label: "My orders", icon: Package },
      { href: "/account/wishlist", label: "Wishlist", icon: Heart },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/account/addresses", label: "Addresses", icon: MapPin },
      { href: "/account/profile", label: "Profile", icon: User },
    ],
  },
];

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
  exact,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pathname: string;
  exact?: boolean;
  onNavigate?: () => void;
}) {
  const active = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
        active
          ? "bg-[var(--user-nav-active)] text-[var(--user-text)] shadow-[0_1px_0_rgba(0,0,0,0.05)]"
          : "text-[var(--user-text-subdued)] hover:bg-black/[0.04] hover:text-[var(--user-text)]"
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0 opacity-80" />
      {label}
    </Link>
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
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();

  const content = (
    <>
      <div className="flex h-14 items-center gap-2.5 border-b border-[var(--user-border)] px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--user-primary)] text-xs font-bold text-white">
          L
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--user-text)]">
            {name || "My account"}
          </p>
          <p className="truncate text-[11px] text-[var(--user-text-subdued)]">
            Customer portal
          </p>
        </div>
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-lg p-1.5 text-[var(--user-text-subdued)] hover:bg-black/5 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--user-text-subdued)]">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  pathname={pathname}
                  onNavigate={onMobileClose}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--user-border)] p-3 space-y-0.5">
        <p className="truncate px-3 pb-2 text-[11px] text-[var(--user-text-subdued)]">
          {email}
        </p>
        <Link
          href="/shop"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[var(--user-text-subdued)] hover:bg-black/[0.04]"
        >
          <ShoppingBag className="h-4 w-4" />
          Continue shopping
        </Link>
        <Link
          href="/track-order"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[var(--user-text-subdued)] hover:bg-black/[0.04]"
        >
          <Search className="h-4 w-4" />
          Track order
        </Link>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[var(--user-text-subdued)] hover:bg-black/[0.04]"
        >
          <ExternalLink className="h-4 w-4" />
          View store
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[var(--user-text-subdued)] hover:bg-black/[0.04]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex w-[240px] shrink-0 flex-col border-r border-[var(--user-border)] bg-[var(--user-sidebar)] min-h-screen">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onMobileClose} />
          <aside className="relative flex h-full w-[280px] max-w-[85vw] flex-col bg-[var(--user-sidebar)] shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

export function UserTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-[var(--user-border)] bg-[var(--user-surface)] px-4 lg:px-5">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-[var(--user-text-subdued)] hover:bg-[var(--user-bg)] lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--user-primary)] text-[10px] font-bold text-white lg:hidden">
          L
        </div>
        <p className="truncate text-sm font-semibold text-[var(--user-text)] lg:hidden">
          My account
        </p>
      </div>

      <Link
        href="/shop"
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-[var(--user-text-subdued)] hover:bg-[var(--user-bg)]"
      >
        <ShoppingBag className="h-4 w-4" />
        <span className="hidden sm:inline">Shop</span>
      </Link>
    </header>
  );
}
