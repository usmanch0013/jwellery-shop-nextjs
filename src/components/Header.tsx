"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShoppingBag, Menu, Search, User, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import type { CategoryInfo } from "@/types";
import TopBar from "@/components/TopBar";
import Logo from "@/components/Logo";
import SearchDialog from "@/components/SearchDialog";
import CartSheet from "@/components/CartSheet";
import {
  buildOrderedNav,
  HeaderMegaDropdown,
  HeaderNavTriggers,
  MobileNavMega,
  resolveNavMegaVariant,
} from "@/components/header/HeaderNavMega";
import { HEADER_NAV_LINKS } from "@/lib/nav/store-links";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function shortLabel(label: string) {
  const map: Record<string, string> = {
    "Best selling products": "Best Sellers",
    "Best Selling Products": "Best Sellers",
    "Client Reviews": "Reviews",
    "Track Order": "Track",
  };
  return map[label] ?? label;
}

export default function Header({
  categories,
  headerNav,
  topBarText,
}: {
  categories: CategoryInfo[];
  headerNav?: Array<{ label: string; href: string }>;
  topBarText?: string;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const links = useMemo(() => {
    if (!headerNav?.length) return HEADER_NAV_LINKS;
    return HEADER_NAV_LINKS.map((item) => {
      const fromCms = headerNav.find(
        (c) =>
          resolveNavMegaVariant(c.href, c.label) ===
          resolveNavMegaVariant(item.href, item.label)
      );
      if (!fromCms) return item;
      return { label: shortLabel(fromCms.label), href: fromCms.href };
    });
  }, [headerNav]);

  const navItems = useMemo(() => buildOrderedNav(links), [links]);

  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeMegaId, setActiveMegaId] = useState<string | null>(null);

  const activeItem =
    navItems.find((i) => i.id === activeMegaId && i.mega) ?? null;
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const megaZoneRef = useRef<HTMLDivElement>(null);

  const megaOpen = activeMegaId != null;
  const overHero = isHome && !scrolled && !megaOpen;

  const closeMega = useCallback(() => setActiveMegaId(null), []);

  const scheduleCloseMega = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(closeMega, 200);
  }, [closeMega]);

  const cancelCloseMega = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    closeMega();
  }, [pathname, closeMega]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMega();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMega]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  const iconClass = overHero
    ? "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] hover:text-champagne"
    : "text-[#1a1a1a] hover:text-champagne";

  return (
    <>
      <div
        ref={megaZoneRef}
        className={`z-50 w-full ${isHome ? "fixed top-0 right-0 left-0" : "sticky top-0"}`}
        onMouseLeave={scheduleCloseMega}
        onMouseEnter={cancelCloseMega}
      >
        {!overHero && <TopBar text={topBarText} />}

        <header
          className={`relative w-full transition-[background,box-shadow] duration-300 ${
            overHero
              ? "bg-transparent"
              : "border-b border-black/[0.06] bg-white/98 shadow-[0_1px_0_rgba(201,169,110,0.2)]"
          } ${megaOpen ? "!bg-white" : ""}`}
        >
          <div className="mx-auto max-w-[var(--site-max)] px-[var(--site-px)]">
            <div
              className={`flex items-center justify-between gap-2 sm:gap-4 ${
                overHero ? "h-[4.75rem] lg:h-[5.25rem]" : "h-[var(--nav-height)]"
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center xl:flex-initial">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`-ml-2 mr-1 shrink-0 xl:hidden ${iconClass}`}
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <Logo light={overHero} />
              </div>

              <HeaderNavTriggers
                items={navItems}
                activeId={activeMegaId}
                overHero={overHero}
                pathname={pathname}
                onActivate={(id) => {
                  cancelCloseMega();
                  setActiveMegaId(id);
                }}
                onDeactivate={closeMega}
              />

              <div className="flex shrink-0 items-center justify-end gap-0 sm:gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search"
                  className={`size-8 hover:bg-transparent sm:size-9 ${iconClass}`}
                >
                  <Search className="h-[17px] w-[17px] sm:h-[18px] sm:w-[18px]" strokeWidth={1.6} />
                </Button>
                <Link
                  href="/wishlist"
                  className={`relative inline-flex size-8 items-center justify-center transition-colors sm:size-9 ${iconClass}`}
                  aria-label="Wishlist"
                >
                  <Heart className="h-[18px] w-[18px]" strokeWidth={1.6} />
                  {wishlistItems.length > 0 && (
                    <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] text-white">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/account"
                  className={`inline-flex size-8 items-center justify-center transition-colors sm:size-9 ${iconClass}`}
                  aria-label="Account"
                >
                  <User className="h-[17px] w-[17px] sm:h-[18px] sm:w-[18px]" strokeWidth={1.6} />
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCartOpen(true)}
                  className={`relative size-8 hover:bg-transparent sm:size-9 ${iconClass}`}
                  aria-label="Cart"
                >
                  <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.6} />
                  {totalItems > 0 && (
                    <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] text-white">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <HeaderMegaDropdown
            item={activeItem}
            categories={categories}
            onClose={closeMega}
          />
        </header>
      </div>

      {megaOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 lg:bg-black/20"
          style={{ top: 0 }}
          aria-hidden
          onClick={closeMega}
        />
      )}

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="z-[80] w-[min(100vw-2rem,22rem)] overflow-y-auto bg-white">
          <SheetHeader>
            <SheetTitle className="font-serif text-2xl">SHE Collection</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-0">
            <MobileNavMega
              links={links}
              categories={categories}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
