"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Shield } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
        <h1 className="text-3xl font-serif font-semibold mb-4">
          Your Cart is Empty
        </h1>
        <p className="text-muted-foreground mb-8">
          Discover our beautiful collection and find something you love.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center bg-primary hover:bg-emerald-dark text-white h-9 px-4 rounded-lg text-sm font-medium"
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  const shipping = totalPrice >= 5000 ? 0 : 200;

  return (
    <div className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Cart" }]} />
        <h1 className="text-4xl font-serif font-semibold mb-12">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.product.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex gap-6 p-6">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded overflow-hidden">
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
                          href={`/products/${item.product.id}`}
                          className="font-serif text-lg hover:text-primary transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.product.material}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
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
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="p-2 hover:bg-muted transition-colors"
                            aria-label="Increase"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
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
            <Card className="sticky top-28">
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
                      {formatPrice(totalPrice + shipping)}
                    </span>
                  </div>
                </div>
                {totalPrice < 5000 && (
                  <p className="text-muted-foreground text-xs">
                    Add {formatPrice(5000 - totalPrice)} more for free shipping
                  </p>
                )}
                <Button className="w-full bg-primary hover:bg-emerald-dark text-white h-12 uppercase tracking-wider">
                  Proceed to Checkout
                </Button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                  <Shield className="w-3.5 h-3.5" />
                  Secure checkout
                </div>
                <Link
                  href="/shop"
                  className="flex w-full items-center justify-center h-8 rounded-lg text-sm font-medium hover:bg-muted"
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
