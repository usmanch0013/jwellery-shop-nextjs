"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShoppingBag,
  Menu,
  Search,
  Heart,
  User,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { categories } from "@/data/products";
import AnnouncementBar from "@/components/AnnouncementBar";
import SearchDialog from "@/components/SearchDialog";
import CartSheet from "@/components/CartSheet";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function Header() {
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            <div className="flex items-center gap-3 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>

            <Link href="/" className="flex items-center gap-2 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
              <span className="text-2xl lg:text-3xl font-serif font-semibold tracking-wide">
                Lumière
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8 flex-1">
              <Link
                href="/shop"
                className="text-sm uppercase tracking-widest text-foreground/70 hover:text-gold transition-colors"
              >
                Shop
              </Link>
              <div
                className="relative"
                onMouseEnter={() => setCategoryOpen(true)}
                onMouseLeave={() => setCategoryOpen(false)}
              >
                <button className="flex items-center gap-1 text-sm uppercase tracking-widest text-foreground/70 hover:text-gold transition-colors">
                  Categories
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {categoryOpen && (
                  <div className="absolute top-full left-0 pt-2">
                    <div className="bg-background border border-border shadow-lg rounded-lg py-2 min-w-[180px]">
                      {categories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/categories/${cat.slug}`}
                          className="block px-4 py-2.5 text-sm hover:bg-muted hover:text-gold transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Link
                href="/about"
                className="text-sm uppercase tracking-widest text-foreground/70 hover:text-gold transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-sm uppercase tracking-widest text-foreground/70 hover:text-gold transition-colors"
              >
                Contact
              </Link>
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
                className="hidden sm:flex"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </Button>
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="hidden sm:inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted relative"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-white text-[10px] rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                href="/account"
                aria-label="Account"
                className="hidden sm:inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted"
              >
                <User className="w-5 h-5" />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCartOpen(true)}
                aria-label="Shopping cart"
                className="relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gold text-white text-xs font-medium rounded-full flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle className="font-serif text-2xl">Lumière</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 mt-8">
            <Link
              href="/shop"
              className="py-3 text-sm uppercase tracking-widest hover:text-gold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="py-3 text-sm uppercase tracking-widest hover:text-gold"
                onClick={() => setMobileMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/about"
              className="py-3 text-sm uppercase tracking-widest hover:text-gold"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="py-3 text-sm uppercase tracking-widest hover:text-gold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/wishlist"
              className="py-3 text-sm uppercase tracking-widest hover:text-gold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Wishlist ({wishlistCount})
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
