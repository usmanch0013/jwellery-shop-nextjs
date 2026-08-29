/**
 * Central registry of all storefront pages.
 *
 * Workflow:
 * - builder: Client edits fully in Elementor-style builder (cms_pages DB)
 * - hybrid: Developer codes layout; client edits sections via builder (same slug in cms_pages)
 * - homepage: Homepage sections via /admin/cms/homepage (not page builder)
 * - coded: Developer-only page; no builder until you add a cms_pages row + switch to hybrid
 * - system: App routes (shop, cart) — listed for reference, not CMS-editable
 */

export type SitePageSource =
  | "builder"
  | "hybrid"
  | "homepage"
  | "coded"
  | "system";

export interface SitePageRegistryEntry {
  slug: string;
  title: string;
  path: string;
  source: SitePageSource;
  /** If true, appears in admin Pages list */
  showInAdmin: boolean;
  description?: string;
}

/** Fixed site pages (not only DB). Builder pages also come from cms_pages. */
export const SITE_PAGE_REGISTRY: SitePageRegistryEntry[] = [
  {
    slug: "home",
    title: "Homepage",
    path: "/",
    source: "homepage",
    showInAdmin: true,
    description: "Hero, sections, video — edit in Website CMS → Homepage",
  },
  {
    slug: "shop",
    title: "Shop",
    path: "/shop",
    source: "system",
    showInAdmin: true,
    description: "Product catalog — managed via Products admin",
  },
  {
    slug: "blog",
    title: "Blog",
    path: "/blog",
    source: "system",
    showInAdmin: true,
    description: "Posts — managed via Marketing → Blog",
  },
  {
    slug: "cart",
    title: "Cart",
    path: "/cart",
    source: "system",
    showInAdmin: false,
  },
  {
    slug: "checkout",
    title: "Checkout",
    path: "/checkout",
    source: "system",
    showInAdmin: false,
  },
  {
    slug: "about",
    title: "About Us",
    path: "/about",
    source: "hybrid",
    showInAdmin: true,
    description: "Builder sections + optional custom coded layout",
  },
  {
    slug: "terms",
    title: "Terms of Service",
    path: "/terms",
    source: "builder",
    showInAdmin: true,
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    path: "/privacy",
    source: "builder",
    showInAdmin: true,
  },
  {
    slug: "refund-policy",
    title: "Refund Policy",
    path: "/refund-policy",
    source: "builder",
    showInAdmin: true,
  },
  {
    slug: "shipping-policy",
    title: "Shipping Policy",
    path: "/shipping-policy",
    source: "builder",
    showInAdmin: true,
  },
  {
    slug: "contact",
    title: "Contact Us",
    path: "/contact",
    source: "hybrid",
    showInAdmin: true,
    description: "Coded contact form + builder sections above it",
  },
];

export function registryEntryForSlug(
  slug: string
): SitePageRegistryEntry | undefined {
  return SITE_PAGE_REGISTRY.find((p) => p.slug === slug);
}

export function adminEditHref(entry: SitePageRegistryEntry): string | null {
  switch (entry.source) {
    case "homepage":
      return "/admin/cms/homepage";
    case "builder":
    case "hybrid":
      return `/admin/cms/pages/${entry.slug}`;
    case "coded":
      return null;
    case "system":
      if (entry.slug === "shop") return "/admin/products";
      if (entry.slug === "blog") return "/admin/blogs";
      return null;
    default:
      return null;
  }
}

export function sourceLabel(source: SitePageSource): string {
  switch (source) {
    case "builder":
      return "Builder";
    case "hybrid":
      return "Hybrid";
    case "homepage":
      return "Homepage CMS";
    case "coded":
      return "Developer";
    case "system":
      return "System";
  }
}

export function sourceBadgeClass(source: SitePageSource): string {
  switch (source) {
    case "builder":
      return "bg-[#e8f5f1] text-[#008060]";
    case "hybrid":
      return "bg-[#fef3e2] text-[#b45309]";
    case "homepage":
      return "bg-[#ede9fe] text-[#6d28d9]";
    case "coded":
      return "bg-[#f3f4f6] text-[#374151]";
    case "system":
      return "bg-[#f6f6f7] text-[#6d7882]";
  }
}
