"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingBag, Menu, Search, User, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import type { CategoryInfo } from "@/types";
import TopBar from "@/components/TopBar";
import Logo from "@/components/Logo";
import SearchDialog from "@/components/SearchDialog";
import CartSheet from "@/components/CartSheet";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Best Sellers", href: "/shop?filter=bestseller" },
  { label: "New Arrivals", href: "/shop?filter=new" },
  { label: "Collections", href: "/#collections" },
  { label: "Track", href: "/track-order" },
  { label: "Reviews", href: "/#reviews" },
];

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
  const links = headerNav?.length
    ? headerNav.map((l) => ({ label: shortLabel(l.label), href: l.href }))
    : navLinks;
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const overHero = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return (
    <>
      <div
        className={`z-50 w-full ${isHome ? "fixed top-0 right-0 left-0" : "sticky top-0"}`}
      >
        <TopBar transparent={overHero} text={topBarText} />
        <header
          className={`w-full transition-all duration-300 ${
            overHero
              ? "bg-transparent"
              : "border-b border-black/[0.06] bg-white/95 shadow-[0_1px_0_rgba(201,169,110,0.25)] backdrop-blur-md"
          }`}
        >
          <div className="mx-auto max-w-[var(--site-max)] px-[var(--site-px)]">
            <div className="flex h-[var(--nav-height)] items-center justify-between gap-6">
              <div className="flex min-w-[160px] shrink-0 items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`-ml-2 mr-1 lg:hidden hover:bg-white/10 ${
                    overHero ? "text-white" : "text-[#1a1a1a] hover:bg-black/5"
                  }`}
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <Logo light={overHero} />
              </div>

              <nav className="hidden flex-1 items-center justify-center gap-7 xl:flex 2xl:gap-9">
                {links.map((link) => {
                  const active =
                    link.href === "/"
                      ? pathname === "/"
                      : !link.href.includes("?") &&
                        !link.href.includes("#") &&
                        pathname === link.href;
                  return (
                    <Link
                      key={link.href + link.label}
                      href={link.href}
                      className={`relative pb-1 text-[12px] tracking-[0.14em] uppercase transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:bg-champagne after:transition-all after:duration-300 hover:after:w-full ${
                        overHero
                          ? "text-white/90 hover:text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.55)]"
                          : "hover:text-[#0B3D35]"
                      } ${
                        active
                          ? overHero
                            ? "text-white after:w-full"
                            : "text-[#0B3D35] after:w-full"
                          : "after:w-0 " + (overHero ? "" : "text-[#2a2a2a]/75")
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <nav className="hidden flex-1 items-center justify-center gap-5 lg:flex xl:hidden">
                {links.slice(0, 5).map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    className={`text-[11px] tracking-[0.12em] uppercase transition-colors ${
                      overHero
                        ? "text-white/90 hover:text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.55)]"
                        : "text-[#2a2a2a]/75 hover:text-[#0B3D35]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex min-w-[160px] shrink-0 items-center justify-end gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search"
                  className={`hover:bg-transparent hover:text-champagne ${
                    overHero ? "text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]" : "text-[#1a1a1a]"
                  }`}
                >
                  <Search className="h-4 w-4" strokeWidth={1.4} />
                </Button>
                <Link
                  href="/wishlist"
                  className={`relative inline-flex size-9 items-center justify-center transition-colors hover:text-champagne ${
                    overHero ? "text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]" : "text-[#1a1a1a]"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className="h-4 w-4" strokeWidth={1.4} />
                  {wishlistItems.length > 0 && (
                    <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] text-white">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/account"
                  className={`inline-flex size-9 items-center justify-center transition-colors hover:text-champagne ${
                    overHero ? "text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]" : "text-[#1a1a1a]"
                  }`}
                  aria-label="Account"
                >
                  <User className="h-4 w-4" strokeWidth={1.4} />
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCartOpen(true)}
                  className={`relative hover:bg-transparent hover:text-champagne ${
                    overHero ? "text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]" : "text-[#1a1a1a]"
                  }`}
                  aria-label="Cart"
                >
                  <ShoppingBag className="h-4 w-4" strokeWidth={1.4} />
                  {totalItems > 0 && (
                    <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] text-white">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80 overflow-y-auto bg-white">
          <SheetHeader>
            <SheetTitle className="font-serif text-2xl">Lumière</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-0">
            {links.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="border-b border-border py-3 text-sm hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <p className="mt-4 mb-2 text-[10px] tracking-widest uppercase text-muted-foreground">
              Categories
            </p>
            {categories
              .filter((cat) => cat.productCount > 0)
              .map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="py-2.5 text-sm text-muted-foreground hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
