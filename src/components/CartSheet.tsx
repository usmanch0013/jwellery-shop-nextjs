"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } =
    useCart();

  const shipping = totalPrice >= 5000 ? 0 : 200;
  const grandTotal = totalPrice + shipping;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[420px] flex flex-col p-0 gap-0 bg-background">
        <SheetHeader className="shrink-0 px-6 py-5 border-b border-border bg-background">
          <SheetTitle className="font-serif text-xl text-foreground pr-8">
            Shopping Bag ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center bg-background">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-6">Your bag is empty</p>
            <Link
              href="/shop"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center justify-center bg-primary hover:bg-emerald-dark text-white px-6 py-3 text-sm font-medium transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-background">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 pb-5 border-b border-border last:border-0 last:pb-0"
                >
                  <Link
                    href={`/products/${item.product.id}`}
                    onClick={() => onOpenChange(false)}
                    className="relative w-[88px] h-[88px] rounded-lg overflow-hidden shrink-0 bg-muted border border-border"
                  >
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="88px"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <Link
                      href={`/products/${item.product.id}`}
                      onClick={() => onOpenChange(false)}
                      className="font-medium text-sm text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm font-medium text-foreground mt-1.5">
                      {formatPrice(item.product.price)}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-3">
                      <div className="flex items-center border border-border rounded-md overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors text-foreground"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center text-sm font-medium text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors text-foreground"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-muted-foreground hover:text-rose transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="shrink-0 border-t border-border bg-background px-6 py-5 shadow-[0_-8px_24px_rgba(32,35,33,0.08)]">
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="font-semibold text-foreground text-base">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => onOpenChange(false)}
                className="flex w-full items-center justify-center bg-primary hover:bg-emerald-dark text-white h-12 text-sm font-medium transition-colors"
              >
                View Cart &amp; Checkout
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
