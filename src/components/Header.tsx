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
  { label: "Best selling products", href: "/shop?filter=bestseller" },
  { label: "New Arrivals", href: "/shop?filter=new" },
  { label: "Collections", href: "/#collections" },
  { label: "Track Order", href: "/track-order" },
  { label: "Client Reviews", href: "/#reviews" },
];

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
    ? headerNav.map((l) => ({ label: l.label, href: l.href }))
    : navLinks;
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const transparent = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const iconClass = transparent
    ? "text-white hover:text-champagne drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]"
    : "text-foreground hover:text-primary";
  const navClass = transparent
    ? "text-white hover:text-champagne font-medium [text-shadow:0_1px_10px_rgba(0,0,0,0.85)]"
    : "text-foreground/80 hover:text-primary font-medium";

  return (
    <>
      <div
        className={`z-50 w-full transition-all duration-300 ${
          isHome ? "fixed top-0 left-0 right-0" : "sticky top-0"
        }`}
      >
        <TopBar transparent={transparent} text={topBarText} />
        <header
          className={`w-full transition-all duration-300 ${
            transparent
              ? "bg-transparent border-b border-white/10"
              : "bg-background/95 backdrop-blur-md border-b border-border/60 shadow-sm"
          }`}
        >
          <div className="max-w-[var(--site-max)] mx-auto px-[var(--site-px)]">
            <div className="flex items-center justify-between gap-6 lg:gap-8 h-[var(--nav-height)]">
              <div className={`flex items-center shrink-0 min-w-[100px] ${transparent ? "drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]" : ""}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`lg:hidden -ml-2 mr-2 ${transparent ? "text-white hover:bg-white/10 drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]" : ""}`}
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <Logo light={transparent} />
              </div>

              <nav className="hidden xl:flex items-center justify-center gap-7 2xl:gap-9 flex-1">
                {links.map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    className={`text-[13px] 2xl:text-[14px] whitespace-nowrap tracking-[0.01em] transition-colors ${navClass}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Compact nav for lg screens */}
              <nav className="hidden lg:flex xl:hidden items-center justify-center gap-5 flex-1">
                {links.slice(0, 5).map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    className={`text-[13px] whitespace-nowrap tracking-[0.01em] transition-colors ${navClass}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center justify-end gap-0.5 shrink-0 min-w-[100px]">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search"
                  className={`hover:bg-transparent ${iconClass}`}
                >
                  <Search className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </Button>
                <Link
                  href="/wishlist"
                  className={`relative inline-flex items-center justify-center size-9 rounded-full transition-colors ${
                    transparent ? "hover:bg-white/10 text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]" : "hover:bg-muted"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className="w-[18px] h-[18px]" strokeWidth={1.75} />
                  {wishlistItems.length > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] rounded-full flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/account"
                  className={`inline-flex items-center justify-center size-9 rounded-full transition-colors ${
                    transparent ? "hover:bg-white/10 text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]" : "hover:bg-muted"
                  }`}
                  aria-label="Account"
                >
                  <User className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCartOpen(true)}
                  className={`relative hover:bg-transparent ${iconClass}`}
                  aria-label="Cart"
                >
                  <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.75} />
                  {totalItems > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary text-white text-[8px] rounded-full flex items-center justify-center">
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
        <SheetContent side="left" className="w-80 overflow-y-auto bg-background">
          <SheetHeader>
            <SheetTitle className="font-serif text-2xl">Lumière</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-0 mt-6">
            {links.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="py-3 text-sm border-b border-border hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 mb-2">
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
