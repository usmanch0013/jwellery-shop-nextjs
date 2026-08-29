"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ExternalLink,
  FileText,
  Image,
  Layout,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Tags,
  Ticket,
  Users,
  Warehouse,
  X,
  CreditCard,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    label: "Home",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/payments", label: "Payments", icon: CreditCard },
    ],
  },
  {
    label: "Products",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
      { href: "/admin/categories", label: "Categories", icon: Tags },
      { href: "/admin/media", label: "Media", icon: Image },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/coupons", label: "Discounts", icon: Ticket },
      { href: "/admin/blogs", label: "Blog", icon: FileText },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    label: "Store",
    items: [
      { href: "/admin/cms/pages", label: "Pages", icon: FileText },
      { href: "/admin/cms", label: "Website CMS", icon: Layout },
      { href: "/admin/messages", label: "Inbox", icon: Mail },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active =
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
        active
          ? "bg-[var(--admin-nav-active)] text-[var(--admin-text)] shadow-[0_1px_0_rgba(0,0,0,0.05)]"
          : "text-[var(--admin-text-subdued)] hover:bg-black/[0.04] hover:text-[var(--admin-text)]"
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0 opacity-80" />
      {label}
    </Link>
  );
}

export default function AdminSidebar({
  email,
  mobileOpen,
  onMobileClose,
}: {
  email: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();

  const content = (
    <>
      <div className="flex h-14 items-center gap-2.5 border-b border-[var(--admin-border)] px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#008060] text-xs font-bold text-white">
          L
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--admin-text)]">
            Lumière
          </p>
          <p className="truncate text-[11px] text-[var(--admin-text-subdued)]">
            Admin
          </p>
        </div>
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-lg p-1.5 text-[var(--admin-text-subdued)] hover:bg-black/5 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-text-subdued)]">
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

      <div className="border-t border-[var(--admin-border)] p-3 space-y-0.5">
        <p className="truncate px-3 pb-2 text-[11px] text-[var(--admin-text-subdued)]">
          {email}
        </p>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[var(--admin-text-subdued)] hover:bg-black/[0.04]"
        >
          <ExternalLink className="h-4 w-4" />
          View online store
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[var(--admin-text-subdued)] hover:bg-black/[0.04]"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[240px] shrink-0 flex-col border-r border-[var(--admin-border)] bg-[var(--admin-sidebar)] min-h-screen">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onMobileClose}
          />
          <aside className="relative flex h-full w-[280px] max-w-[85vw] flex-col bg-[var(--admin-sidebar)] shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

export function AdminTopBar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const router = useRouter();

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get("q") ?? "").trim();
    if (q) router.push(`/admin/orders?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 lg:px-5">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-[var(--admin-text-subdued)] hover:bg-[var(--admin-bg)] lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <form onSubmit={handleSearch} className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-subdued)]" />
        <input
          name="q"
          placeholder="Search orders, customers..."
          className="h-9 w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] pl-9 pr-3 text-sm outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060]"
        />
      </form>

      <Link
        href="/admin/analytics"
        className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-[var(--admin-text-subdued)] hover:bg-[var(--admin-bg)]"
      >
        <BarChart3 className="h-4 w-4" />
        Analytics
      </Link>
    </header>
  );
}
