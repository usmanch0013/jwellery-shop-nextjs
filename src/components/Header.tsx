"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Menu, Search, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { categories } from "@/data/products";
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
  { label: "Collections", href: "/shop" },
  { label: "Track Order", href: "/account" },
  { label: "Client Reviews", href: "/#reviews" },
];

export default function Header() {
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <TopBar />
      <header className="sticky top-0 z-50 bg-background">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-[140px_1fr_120px] items-center h-[70px] lg:h-[76px]">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden -ml-2 mr-1"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <Logo />
            </div>

            <nav className="hidden lg:flex items-center justify-center gap-4 xl:gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="text-[13px] text-foreground/80 hover:text-primary whitespace-nowrap transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="hover:bg-transparent"
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </Button>
              <Link
                href="/account"
                className="inline-flex items-center justify-center size-9 hover:bg-muted rounded-full"
                aria-label="Account"
              >
                <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCartOpen(true)}
                className="relative hover:bg-transparent"
                aria-label="Cart"
              >
                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
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

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80 overflow-y-auto bg-background">
          <SheetHeader>
            <SheetTitle className="font-serif text-2xl">Lumière</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-0 mt-6">
            {navLinks.map((link) => (
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
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="py-2.5 text-sm text-[#555] hover:text-primary"
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
