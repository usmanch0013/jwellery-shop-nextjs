"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatPrice, productPath } from "@/lib/products/format";
import { toast } from "sonner";

export default function AccountWishlistClient() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="user-card py-16 text-center">
        <Heart className="mx-auto mb-4 h-12 w-12 text-[var(--user-text-subdued)]/30" />
        <p className="text-base font-semibold text-[var(--user-text)]">
          Your wishlist is empty
        </p>
        <p className="mt-2 text-[13px] text-[var(--user-text-subdued)]">
          Save your favourite pieces while browsing the shop.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-[var(--user-accent)] px-5 text-[13px] font-semibold text-white hover:bg-[#006e52]"
        >
          Explore collection
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
      {items.map((product) => (
        <div
          key={product.id}
          className="user-card group relative p-2 transition-shadow hover:shadow-md"
        >
          <Link href={productPath(product)}>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-[var(--user-bg)]">
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
          <h3 className="mt-3 truncate text-[13px] font-medium text-[var(--user-text)]">
            {product.name}
          </h3>
          <p className="text-[13px] font-semibold">{formatPrice(product.price)}</p>
          <button
            type="button"
            className="mt-2 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--user-accent)] text-[12px] font-semibold text-white hover:bg-[#006e52]"
            onClick={() => {
              addToCart(product);
              toast.success("Added to cart");
            }}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Add to cart
          </button>
        </div>
      ))}
    </div>
  );
}
