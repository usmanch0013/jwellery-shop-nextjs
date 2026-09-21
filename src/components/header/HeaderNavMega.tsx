"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { CategoryInfo } from "@/types";
import { cn } from "@/lib/utils";

import { STORE_FOOTER_LINKS, type NavLinkItem } from "@/lib/nav/store-links";

export type { NavLinkItem };

export type NavMegaItem = NavLinkItem & {
  id: string;
  variant: MegaVariant;
};

type MegaVariant =
  | "shop"
  | "bestsellers"
  | "new"
  | "collections"
  | "blog"
  | "track"
  | "reviews";

type ShopMegaVariant = "shop" | "bestsellers" | "new" | "collections";

type MegaPanelConfig = {
  title: string;
  subtitle: string;
  cta: string;
  sidebarTitle: string;
  sidebarLinks: { label: string; href: string }[];
  categoriesTitle: string;
  categoryHint: string;
  categoryHref: (slug: string) => string;
  badge?: string;
  layout: "standard" | "collections";
  aside: { title: string; body: string; tone: "green" | "gold" | "rose" };
};

const MEGA_PANEL: Record<ShopMegaVariant, MegaPanelConfig> = {
  shop: {
    title: "Shop all jewellery",
    subtitle: "Full catalogue — necklace sets, earrings, bangles & bridal",
    cta: "View all products",
    sidebarTitle: "Browse the store",
    sidebarLinks: [
      { label: "All products", href: "/shop" },
      { label: "New arrivals", href: "/shop?filter=new" },
      { label: "Best sellers", href: "/shop?filter=bestseller" },
      { label: "Featured", href: "/shop?filter=featured" },
      { label: "On sale", href: "/shop?filter=sale" },
    ],
    categoriesTitle: "Shop by category",
    categoryHint: "View category",
    categoryHref: (slug) => `/categories/${slug}`,
    layout: "standard",
    aside: {
      title: "Wear Your Art",
      body: "Premium artificial jewellery with nationwide delivery.",
      tone: "green",
    },
  },
  bestsellers: {
    title: "Customer favourites",
    subtitle: "Top-rated pieces shoppers buy again and again",
    cta: "Shop all best sellers",
    sidebarTitle: "Popular right now",
    sidebarLinks: [
      { label: "All best sellers", href: "/shop?filter=bestseller" },
      { label: "Best sellers on sale", href: "/shop?filter=sale" },
      { label: "Featured picks", href: "/shop?filter=featured" },
      { label: "New best sellers", href: "/shop?filter=new" },
    ],
    categoriesTitle: "Best sellers in each category",
    categoryHint: "Bestsellers only",
    categoryHref: (slug) => `/shop?category=${slug}&filter=bestseller`,
    badge: "Best seller",
    layout: "standard",
    aside: {
      title: "Loved nationwide",
      body: "These styles earn the highest repeat orders at SHE Collection.",
      tone: "gold",
    },
  },
  new: {
    title: "Just dropped",
    subtitle: "Latest necklace sets, earrings & occasion wear",
    cta: "See all new arrivals",
    sidebarTitle: "Fresh this season",
    sidebarLinks: [
      { label: "All new arrivals", href: "/shop?filter=new" },
      { label: "New + featured", href: "/shop?filter=featured" },
      { label: "New on sale", href: "/shop?filter=sale" },
      { label: "Browse full shop", href: "/shop" },
    ],
    categoriesTitle: "What’s new by category",
    categoryHint: "New in stock",
    categoryHref: (slug) => `/shop?category=${slug}&filter=new`,
    badge: "New",
    layout: "standard",
    aside: {
      title: "New styles weekly",
      body: "Check back often — we add fresh designs for every occasion.",
      tone: "rose",
    },
  },
  collections: {
    title: "Curated collections",
    subtitle: "Editorial picks by style — bridal, party & everyday",
    cta: "See collections on homepage",
    sidebarTitle: "Explore",
    sidebarLinks: [
      { label: "Collections marquee", href: "/#collections" },
      { label: "Bridal & party", href: "/categories/bridal-sets" },
      { label: "Necklace sets", href: "/categories/necklace-sets" },
      { label: "Earrings", href: "/categories/earrings" },
      { label: "Shop everything", href: "/shop" },
    ],
    categoriesTitle: "Shop the collection",
    categoryHint: "Open collection",
    categoryHref: (slug) => `/categories/${slug}`,
    layout: "collections",
    aside: {
      title: "Style stories",
      body: "Each collection is styled for weddings, parties, and daily elegance.",
      tone: "green",
    },
  },
};

function megaPanelConfig(variant: MegaVariant): MegaPanelConfig | null {
  if (variant === "blog" || variant === "track" || variant === "reviews") {
    return null;
  }
  return MEGA_PANEL[variant];
}

export function resolveNavMegaVariant(href: string, label: string): MegaVariant {
  const lower = label.toLowerCase().trim();
  const h = href.toLowerCase();
  // Label first — CMS sometimes uses /shop for multiple items
  if (lower.includes("collection") || h.includes("collection")) return "collections";
  if (h.includes("filter=new") || lower.includes("new arrival")) return "new";
  if (h.includes("bestseller") || lower.includes("best sell")) return "bestsellers";
  if (href === "/shop" || lower === "shop") return "shop";
  if (href.startsWith("/blog") || lower === "blog") return "blog";
  if (href.includes("track") || lower.includes("track")) return "track";
  if (href.includes("review") || lower.includes("review")) return "reviews";
  return "shop";
}

export function filterNavItems(links: NavLinkItem[]) {
  return links.filter(
    (l) => l.href !== "/" && !/^home$/i.test(l.label.trim())
  );
}

export function buildNavMegaItems(links: NavLinkItem[]): NavMegaItem[] {
  return filterNavItems(links).map((l) => ({
    ...l,
    id: `${l.href}-${l.label}`,
    variant: resolveNavMegaVariant(l.href, l.label),
  }));
}

const MEGA_MENU_VARIANTS: MegaVariant[] = ["new", "collections"];

export function hasMegaMenu(variant: MegaVariant) {
  return MEGA_MENU_VARIANTS.includes(variant);
}

export type OrderedNavItem = NavMegaItem & { mega: boolean };

export function buildOrderedNav(links: NavLinkItem[]): OrderedNavItem[] {
  return buildNavMegaItems(links).map((item) => ({
    ...item,
    mega: hasMegaMenu(item.variant),
  }));
}

export { STORE_FOOTER_LINKS };

function AsideCard({
  aside,
}: {
  aside: MegaPanelConfig["aside"];
}) {
  const tones = {
    green: "bg-[#0B3D35] text-white",
    gold: "bg-[#3d3428] text-white",
    rose: "bg-[#6F112B] text-white",
  };
  return (
    <div className={`mt-6 hidden rounded-[5px] p-4 lg:block ${tones[aside.tone]}`}>
      <p className="font-serif text-lg text-champagne">{aside.title}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-white/85">{aside.body}</p>
    </div>
  );
}

function CategoryTiles({
  categories,
  config,
  onClose,
  compact,
}: {
  categories: CategoryInfo[];
  config: MegaPanelConfig;
  onClose: () => void;
  compact?: boolean;
}) {
  const visible = categories.filter((c) => c.productCount > 0);
  return (
    <div
      className={cn(
        "grid gap-3",
        compact
          ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
          : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      )}
    >
      {visible.map((cat) => (
        <Link
          key={cat.slug}
          href={config.categoryHref(cat.slug)}
          className="group overflow-hidden rounded-[5px] bg-white ring-1 ring-[#e8e2d4] transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md hover:ring-[#c9a96e]/50"
          onClick={onClose}
        >
          <div className="relative aspect-[4/5] bg-[#f2efe3]">
            {config.badge ? (
              <span className="absolute top-2 left-2 z-[1] rounded-[5px] bg-[#6F112B] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-white">
                {config.badge}
              </span>
            ) : null}
            {cat.image ? (
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1280px) 20vw, 180px"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-2 text-center text-[11px] text-[#888]">
                {cat.name}
              </div>
            )}
          </div>
          <div className="px-2.5 py-2.5">
            <p className="text-[12px] font-medium text-[#2c2c2c] group-hover:text-[#0B3D35]">
              {cat.name}
            </p>
            <p className="text-[10px] text-[#888]">
              {config.categoryHint} · {cat.productCount} items
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function CollectionMegaGrid({
  categories,
  config,
  onClose,
}: {
  categories: CategoryInfo[];
  config: MegaPanelConfig;
  onClose: () => void;
}) {
  const visible = categories.filter((c) => c.productCount > 0);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((cat) => (
        <Link
          key={cat.slug}
          href={config.categoryHref(cat.slug)}
          className="group relative flex min-h-[200px] overflow-hidden rounded-[5px] bg-[#f2efe3] ring-1 ring-[#e8e2d4] transition-shadow hover:shadow-lg lg:min-h-[240px]"
          onClick={onClose}
        >
          {cat.image ? (
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 50vw, 33vw"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
          <div className="relative mt-auto p-5 text-white">
            <p className="text-[10px] uppercase tracking-[0.2em] text-champagne/90">
              Collection
            </p>
            <p className="mt-1 font-serif text-xl">{cat.name}</p>
            {cat.description ? (
              <p className="mt-1 line-clamp-2 text-[12px] text-white/80">
                {cat.description}
              </p>
            ) : null}
            <p className="mt-2 text-[11px] text-white/70">{cat.productCount} pieces</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function HeaderMegaDropdown({
  item,
  categories,
  onClose,
}: {
  item: NavMegaItem | null;
  categories: CategoryInfo[];
  onClose: () => void;
}) {
  if (!item) return null;

  const config = megaPanelConfig(item.variant);
  if (!config) return null;

  return (
    <div
      className="absolute right-0 left-0 top-full z-[70] border-t-2 border-champagne bg-white shadow-[0_20px_50px_rgba(11,61,53,0.15)]"
      role="dialog"
      aria-label={`${item.label} menu`}
    >
      <div className="mx-auto max-w-[var(--site-max)] px-[var(--site-px)] py-8 lg:py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#efe9dc] pb-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0B3D35]">
              {item.label}
            </p>
            <h3 className="mt-1 font-serif text-2xl text-[#2c2c2c] lg:text-[1.75rem]">
              {config.title}
            </h3>
            <p className="mt-1 max-w-xl text-[13px] text-[#666]">{config.subtitle}</p>
          </div>
          <Link
            href={item.href}
            className="site-btn inline-flex shrink-0 gap-1.5 bg-[#0B3D35] px-6 text-white hover:bg-[#092f29]"
            onClick={onClose}
          >
            {config.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#888]">
              {config.sidebarTitle}
            </p>
            <ul className="space-y-1">
              {config.sidebarLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between rounded-[5px] py-2 text-[13px] text-[#444] transition-colors hover:text-[#0B3D35]"
                    onClick={onClose}
                  >
                    {link.label}
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
            <AsideCard aside={config.aside} />
          </aside>

          <div className="min-w-0">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#888]">
              {config.categoriesTitle}
            </p>
            <div className="max-h-[min(58vh,560px)] overflow-y-auto pr-1">
              {config.layout === "collections" ? (
                <CollectionMegaGrid
                  categories={categories}
                  config={config}
                  onClose={onClose}
                />
              ) : (
                <CategoryTiles
                  categories={categories}
                  config={config}
                  onClose={onClose}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeaderNavTriggers({
  items,
  activeId,
  overHero,
  pathname,
  onActivate,
  onDeactivate,
}: {
  items: OrderedNavItem[];
  activeId: string | null;
  overHero: boolean;
  pathname: string;
  onActivate: (id: string) => void;
  onDeactivate: () => void;
}) {
  const navClass = (highlight: boolean) =>
    cn(
      "inline-flex items-center gap-1 px-1 py-2 text-[12px] font-medium tracking-[0.04em] transition-colors xl:text-[13px]",
      "border-b-2 border-transparent",
      overHero && !activeId
        ? "text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.65)] hover:border-champagne/80 hover:text-champagne"
        : "text-[#2c2c2c]/85 hover:border-[#0B3D35]/40 hover:text-[#0B3D35]",
      highlight && "border-champagne text-champagne"
    );

  function linkActive(href: string) {
    if (href === "/blog") return pathname === "/blog" || pathname.startsWith("/blog/");
    if (href.includes("#")) return false;
    if (href.includes("?")) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="hidden flex-1 items-center justify-center gap-4 xl:flex 2xl:gap-6">
      {items.map((item) => {
        if (!item.mega) {
          return (
            <Link
              key={item.id}
              href={item.href}
              className={navClass(linkActive(item.href))}
            >
              {item.label}
            </Link>
          );
        }

        const open = activeId === item.id;
        const highlight = open || linkActive(item.href);
        return (
          <button
            key={item.id}
            type="button"
            className={navClass(highlight)}
            aria-expanded={open}
            onMouseEnter={() => onActivate(item.id)}
            onFocus={() => onActivate(item.id)}
            onClick={() => {
              if (open) onDeactivate();
              else onActivate(item.id);
            }}
          >
            {item.label}
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
            />
          </button>
        );
      })}
    </nav>
  );
}

export function MobileNavMega({
  links,
  categories,
  onNavigate,
}: {
  links: NavLinkItem[];
  categories: CategoryInfo[];
  onNavigate: () => void;
}) {
  const items = useMemo(() => buildOrderedNav(links), [links]);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <>
      {items.map((item) => {
        if (!item.mega) {
          return (
            <Link
              key={item.id}
              href={item.href}
              className="block border-b border-border py-3 text-sm hover:text-primary"
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          );
        }

        const expanded = openId === item.id;
        const config = megaPanelConfig(item.variant);
        return (
          <div key={item.id} className="border-b border-border">
            <button
              type="button"
              className="flex w-full items-center justify-between py-3 text-left text-sm font-medium"
              onClick={() => setOpenId(expanded ? null : item.id)}
              aria-expanded={expanded}
            >
              {item.label}
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
              />
            </button>
            {expanded && config && (
              <div className="space-y-3 pb-4">
                <p className="text-[12px] font-medium text-[#0B3D35]">{config.title}</p>
                <p className="text-[12px] text-muted-foreground">{config.subtitle}</p>
                <Link
                  href={item.href}
                  className="site-btn inline-flex bg-[#0B3D35] px-4 text-white"
                  onClick={onNavigate}
                >
                  {config.cta}
                </Link>
                <div className="flex flex-wrap gap-2">
                  {config.sidebarLinks.slice(0, 4).map((link) => (
                    <Link
                      key={link.href + link.label}
                      href={link.href}
                      className="rounded-[5px] border border-border px-2 py-1 text-[10px]"
                      onClick={onNavigate}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {categories
                    .filter((c) => c.productCount > 0)
                    .map((cat) => (
                      <Link
                        key={cat.slug}
                        href={config.categoryHref(cat.slug)}
                        className="rounded-[5px] bg-[#faf8f3] px-2 py-2 text-[11px]"
                        onClick={onNavigate}
                      >
                        {cat.name}
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      <Link
        href="/shop"
        className="mt-2 block border-b border-border py-3 text-sm font-medium hover:text-primary"
        onClick={onNavigate}
      >
        Shop all products
      </Link>
    </>
  );
}
