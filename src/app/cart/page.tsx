"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Shield } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import {
  calculateOrderTotal,
  calculateShipping,
  FREE_SHIPPING_THRESHOLD,
} from "@/lib/constants/commerce";
import { formatPrice } from "@/lib/products/format";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
        <h1 className="text-3xl font-serif font-semibold mb-4">
          Your Cart is Empty
        </h1>
        <p className="text-muted-foreground mb-8">
          Discover our beautiful collection and find something you love.
        </p>
        <Link
          href="/shop"
          className="site-btn bg-primary px-4 text-white hover:bg-emerald-dark"
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
        </div>
      </div>
    );
  }

  const shipping = calculateShipping(totalPrice);
  const orderTotal = calculateOrderTotal(totalPrice);

  return (
    <div className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Cart" }]} />
        <h1 className="mb-8 font-serif text-2xl font-semibold sm:mb-12 sm:text-3xl lg:text-4xl">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.lineId} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-6 sm:p-6">
                    <div className="relative mx-auto h-24 w-24 shrink-0 overflow-hidden rounded sm:mx-0 sm:h-32 sm:w-32">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link
                          href={`/products/${item.product.slug ?? item.product.id}`}
                          className="font-serif text-lg hover:text-primary transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        {item.product.soldOut && (
                          <p className="mt-1 text-xs font-medium text-destructive">
                            Sold out — remove to continue checkout
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.product.material}
                        </p>
                      </div>
                  <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex w-fit items-center overflow-hidden rounded-[5px] border">
                          <button
                            onClick={() =>
                              updateQuantity(item.lineId, item.quantity - 1)
                            }
                            className="p-2 hover:bg-muted transition-colors"
                            aria-label="Decrease"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.lineId, item.quantity + 1)
                            }
                            className="p-2 hover:bg-muted transition-colors"
                            aria-label="Increase"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.lineId)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <button
              onClick={clearCart}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear Cart
            </button>
          </div>

          <div>
            <Card className="lg:sticky lg:top-28">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-serif">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-base">
                    <span>Total</span>
                    <span className="text-gold">
                      {formatPrice(orderTotal)}
                    </span>
                  </div>
                </div>
                {totalPrice < FREE_SHIPPING_THRESHOLD && (
                  <p className="text-muted-foreground text-xs">
                    Add {formatPrice(FREE_SHIPPING_THRESHOLD - totalPrice)} more for free shipping
                  </p>
                )}
                <Link
                  href="/checkout"
                  className="site-btn w-full bg-primary text-white hover:bg-emerald-dark"
                >
                  Proceed to Checkout
                </Link>
                <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                  <Shield className="w-3.5 h-3.5" />
                  Secure checkout
                </div>
                <Link
                  href="/shop"
                  className="flex h-8 w-full items-center justify-center rounded-[5px] text-sm font-medium hover:bg-muted"
                >
                  Continue Shopping
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
