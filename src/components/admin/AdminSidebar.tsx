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
  ExternalLink,
  LogOut,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/messages", label: "Messages", icon: Mail },
];

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-[#0f1412] text-white min-h-screen flex flex-col">
      <div className="p-5 border-b border-white/10">
        <p className="text-xs uppercase tracking-widest text-white/50">
          Lumière
        </p>
        <h1 className="font-serif text-lg">Admin Panel</h1>
        <p className="text-xs text-white/60 mt-1 truncate">{email}</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-md transition-colors ${
                active
                  ? "bg-primary text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white"
        >
          <ExternalLink className="w-4 h-4" />
          View Store
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
