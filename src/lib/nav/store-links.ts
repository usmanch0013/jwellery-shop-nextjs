export type NavLinkItem = { label: string; href: string };

/** Main header bar (mega on New Arrivals + Collections only). */
export const HEADER_NAV_LINKS: NavLinkItem[] = [
  { label: "Collections", href: "/#collections" },
  { label: "New Arrivals", href: "/shop?filter=new" },
  { label: "Best Sellers", href: "/shop?filter=bestseller" },
  { label: "Blog", href: "/blog" },
  { label: "Track", href: "/track-order" },
  { label: "Reviews", href: "/#reviews" },
];

export const STORE_FOOTER_LINKS: NavLinkItem[] = [
  { label: "Shop", href: "/shop" },
  { label: "Best Sellers", href: "/shop?filter=bestseller" },
  { label: "New Arrivals", href: "/shop?filter=new" },
  { label: "Collections", href: "/#collections" },
  { label: "Blog", href: "/blog" },
  { label: "Track Order", href: "/track-order" },
  { label: "Reviews", href: "/#reviews" },
];
