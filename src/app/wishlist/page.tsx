"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";
import { toast } from "sonner";

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <Heart className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
        <h1 className="text-3xl font-serif font-semibold mb-4">
          Your Wishlist is Empty
        </h1>
        <p className="text-muted-foreground mb-8">
          Save your favorite pieces for later.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center bg-primary hover:bg-emerald-dark text-white h-9 px-4 rounded-lg text-sm font-medium"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Wishlist" }]} />
        <h1 className="text-4xl font-serif font-semibold mb-12">
          My Wishlist ({items.length})
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 lg:gap-2">
          {items.map((product) => (
            <div key={product.id} className="group relative">
              <Link href={`/products/${product.id}`}>
                <div className="relative aspect-square overflow-hidden bg-muted rounded-lg mb-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </Link>
              <button
                onClick={() => {
                  removeFromWishlist(product.id);
                  toast.info("Removed from wishlist");
                }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center"
                aria-label="Remove from wishlist"
              >
                <Heart className="w-4 h-4 fill-rose-gold text-rose-gold" />
              </button>
              <h3 className="font-serif text-base mb-1">{product.name}</h3>
              <p className="font-medium mb-3">{formatPrice(product.price)}</p>
              <Button
                size="sm"
                className="w-full bg-primary hover:bg-emerald-dark text-white"
                onClick={() => {
                  addToCart(product);
                  toast.success("Added to cart");
                }}
              >
                <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                Add to Cart
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
