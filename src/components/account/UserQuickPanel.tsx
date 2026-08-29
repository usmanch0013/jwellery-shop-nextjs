import Link from "next/link";
import { ArrowRight, Heart, MapPin, Search, ShoppingBag } from "lucide-react";

const LINKS = [
  { href: "/shop", label: "Shop collection", icon: ShoppingBag },
  { href: "/account/wishlist", label: "View wishlist", icon: Heart },
  { href: "/account/addresses", label: "Manage addresses", icon: MapPin },
  { href: "/track-order", label: "Track an order", icon: Search },
];

export default function UserQuickPanel() {
  return (
    <div className="user-card divide-y divide-[var(--user-border)]">
      <div className="px-4 py-3 lg:px-5">
        <h3 className="text-sm font-semibold text-[var(--user-text)]">Quick links</h3>
        <p className="mt-0.5 text-[13px] text-[var(--user-text-subdued)]">
          Shortcuts to common actions
        </p>
      </div>
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex items-center justify-between gap-3 px-4 py-3 text-[13px] transition-colors hover:bg-[#fafbfb] lg:px-5"
        >
          <span className="flex items-center gap-2.5 text-[var(--user-text)]">
            <link.icon className="h-4 w-4 text-[var(--user-text-subdued)]" />
            {link.label}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-[var(--user-text-subdued)]" />
        </Link>
      ))}
    </div>
  );
}
