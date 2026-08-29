"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatPrice, productPath } from "@/lib/products/format";
import { toast } from "sonner";

export default function AccountWishlistClient() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
        <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
        <p className="font-serif text-xl">Your wishlist is empty</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Save your favourite pieces while browsing the shop.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground"
        >
          Explore collection
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
      {items.map((product) => (
        <div key={product.id} className="group relative rounded-2xl border border-border/50 bg-white p-2 shadow-sm">
          <Link href={productPath(product)}>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            </div>
          </Link>
          <button
            type="button"
            onClick={() => {
              removeFromWishlist(product.id);
              toast.info("Removed from wishlist");
            }}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow"
            aria-label="Remove"
          >
            <Heart className="h-4 w-4 fill-rose-gold text-rose-gold" />
          </button>
          <h3 className="mt-3 truncate font-serif text-sm">{product.name}</h3>
          <p className="text-sm font-medium">{formatPrice(product.price)}</p>
          <Button
            size="sm"
            className="mt-2 w-full bg-primary hover:bg-emerald-dark"
            onClick={() => {
              addToCart(product);
              toast.success("Added to cart");
            }}
          >
            <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
            Add to cart
          </Button>
        </div>
      ))}
    </div>
  );
}
