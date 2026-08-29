import Link from "next/link";
import {
  ArrowRight,
  FileText,
  MessageSquare,
  Package,
  Plus,
  ShoppingBag,
  Star,
  Ticket,
  Truck,
} from "lucide-react";

const actions = [
  {
    href: "/admin/products/new",
    label: "Add product",
    description: "Launch a new jewellery piece",
    icon: Plus,
    accent: "bg-emerald-600 text-white",
  },
  {
    href: "/admin/orders?status=pending",
    label: "Pending orders",
    description: "Review and confirm new orders",
    icon: ShoppingBag,
    accent: "bg-amber-500 text-white",
  },
  {
    href: "/admin/orders?status=processing",
    label: "Fulfill orders",
    description: "Add tracking & mark as shipped",
    icon: Truck,
    accent: "bg-white text-foreground ring-1 ring-border",
  },
  {
    href: "/admin/orders",
    label: "Generate invoices",
    description: "Print PDF invoices for any order",
    icon: FileText,
    accent: "bg-white text-foreground ring-1 ring-border",
  },
  {
    href: "/admin/coupons",
    label: "Create coupon",
    description: "Run a limited-time promotion",
    icon: Ticket,
    accent: "bg-white text-foreground ring-1 ring-border",
  },
];

export default function DashboardQuickActions({
  pendingReviews,
  unreadMessages,
}: {
  pendingReviews: number;
  unreadMessages: number;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-[#092f29] via-[#0d4a3f] to-[#134e44] p-5 text-white shadow-[0_16px_40px_rgba(9,47,41,0.18)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-champagne/80">
          VIP Control Center
        </p>
        <h3 className="mt-2 font-serif text-2xl">Quick actions</h3>
        <p className="mt-2 text-sm text-white/70">
          Manage your boutique in a few clicks with premium shortcuts.
        </p>
        <div className="mt-5 space-y-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-transform hover:-translate-y-0.5 ${action.accent}`}
            >
              <action.icon className="h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{action.label}</p>
                <p className="text-xs opacity-70">{action.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 opacity-70" />
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-[0_8px_30px_rgba(9,47,41,0.06)] backdrop-blur-sm">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Needs attention
        </p>
        <div className="mt-4 space-y-3">
          <Link
            href="/admin/reviews"
            className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3 hover:bg-muted/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Star className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Pending reviews</p>
                <p className="text-xs text-muted-foreground">Approve customer feedback</p>
              </div>
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
              {pendingReviews}
            </span>
          </Link>

          <Link
            href="/admin/messages"
            className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3 hover:bg-muted/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Customer messages</p>
                <p className="text-xs text-muted-foreground">Reply to inquiries</p>
              </div>
            </div>
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">
              {unreadMessages}
            </span>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3 hover:bg-muted/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Package className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Catalog manager</p>
                <p className="text-xs text-muted-foreground">Update stock and pricing</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
}
