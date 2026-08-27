"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Ticket,
  Star,
  CreditCard,
  Mail,
  Image,
  FileText,
  ExternalLink,
  LogOut,
  Sparkles,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/media", label: "Media", icon: Image },
  { href: "/admin/blogs", label: "Blog", icon: FileText },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/messages", label: "Messages", icon: Mail },
];

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="relative w-[270px] shrink-0 min-h-screen flex flex-col overflow-hidden border-r border-white/10 bg-[#071915] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,169,110,0.16),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(13,74,63,0.35),transparent_45%)]" />

      <div className="relative border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-champagne to-[#8f7140] text-[#071915] shadow-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.28em] text-champagne/80">
              Lumière
            </p>
            <h1 className="font-serif text-lg leading-tight">VIP Admin</h1>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-white/45">
            Signed in as
          </p>
          <p className="truncate text-sm text-white/85">{email}</p>
        </div>
      </div>

      <nav className="relative flex-1 space-y-1 p-4">
        <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.24em] text-white/35">
          Main menu
        </p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${
                active
                  ? "bg-gradient-to-r from-primary to-[#0f5f51] text-white shadow-[0_10px_24px_rgba(13,74,63,0.35)]"
                  : "text-white/65 hover:bg-white/8 hover:text-white"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  active ? "text-champagne" : "text-white/45 group-hover:text-champagne"
                }`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="relative space-y-1 border-t border-white/10 p-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/65 transition-colors hover:bg-white/8 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          View Store
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/65 transition-colors hover:bg-white/8 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
