"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, productPath } from "@/lib/products/format";
import { discountPercent, isOnSale } from "@/lib/products/sale";
import { useWishlist } from "@/context/WishlistContext";
import StarRating from "./StarRating";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

function cardThumbnails(product: Product): string[] {
  const unique = [
    product.image,
    product.hoverImage,
    ...(product.images?.filter(Boolean) ?? []),
  ].filter((img, i, arr): img is string => Boolean(img) && arr.indexOf(img) === i);

  if (unique.length === 1) return unique;
  return unique.slice(0, 4);
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const thumbnails = cardThumbnails(product);
  const primaryImage = thumbnails[0] ?? product.image;
  const hoverImage = thumbnails[1] ?? null;
  const [activeImage, setActiveImage] = useState(primaryImage);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const productHref = productPath(product);
  const wished = isInWishlist(product.id);
  const onSale = isOnSale(product);
  const salePercent = discountPercent(product);
  const showQuickView = Boolean(onQuickView && !product.soldOut);
  const showingHover = hoverImage != null && activeImage !== primaryImage;

  return (
    <div
      className="group"
      onMouseEnter={() => {
        if (hoverImage) setActiveImage(hoverImage);
      }}
      onMouseLeave={() => setActiveImage(primaryImage)}
    >
      <div
        className={cn(
          "relative flex aspect-[2/3] flex-col overflow-hidden rounded-[16px] bg-[#f5f5f5]",
          showQuickView && "lg:pb-0"
        )}
      >
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <Link href={productHref} className="absolute inset-0 block">
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className={cn(
                "object-cover object-center transition-opacity duration-300",
                showingHover ? "opacity-0" : "opacity-100"
              )}
              sizes="(max-width: 640px) 50vw, 25vw"
            />
            {hoverImage ? (
              <Image
                src={hoverImage}
                alt=""
                fill
                className={cn(
                  "object-cover object-center transition-opacity duration-300",
                  showingHover && activeImage === hoverImage
                    ? "opacity-100"
                    : "opacity-0"
                )}
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            ) : null}
            {showingHover && activeImage !== hoverImage ? (
              <Image
                key={activeImage}
                src={activeImage}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            ) : null}
          </Link>

          <div className="pointer-events-none absolute left-1/2 top-3 z-[1] -translate-x-1/2">
            <span className="text-[9px] font-light uppercase tracking-[0.24em] text-white/90 drop-shadow-sm">
              SHE Collection
            </span>
          </div>

          <div className="pointer-events-none absolute left-3 top-3 z-[2] flex flex-col gap-1.5">
            {onSale && (
              <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                Sale {salePercent > 0 ? `-${salePercent}%` : ""}
              </span>
            )}
            {product.isNew && !product.soldOut && (
              <span className="rounded-md bg-[#6F112B] px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">
                New
              </span>
            )}
            {product.soldOut && (
              <span className="rounded-md bg-black/75 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">
                Sold out
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              void toggleWishlist(product);
            }}
            className={cn(
              "absolute right-3 top-3 z-[2] rounded-full p-2 transition-colors",
              wished
                ? "bg-rose-500 text-white"
                : "bg-white/90 text-[#3b3933] hover:bg-white"
            )}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className="h-4 w-4"
              fill={wished ? "currentColor" : "none"}
              strokeWidth={1.5}
            />
          </button>
        </div>

        {showQuickView && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onQuickView?.(product);
            }}
            className={cn(
              "z-[2] w-full shrink-0 overflow-hidden bg-[#6F112B] text-[12px] font-medium leading-8 text-white transition-[max-height,opacity] duration-300 ease-out",
              "max-h-8 opacity-100",
              "lg:max-h-0 lg:opacity-0 lg:group-hover:max-h-8 lg:group-hover:opacity-100"
            )}
          >
            Quick view
          </button>
        )}
      </div>

      <div className="relative mt-2.5 min-h-[108px]">
        <Link
          href={productHref}
          className="block px-0.5 text-center transition-all duration-300 lg:group-hover:pointer-events-none lg:group-hover:translate-y-1 lg:group-hover:opacity-0"
        >
          <h3 className="mb-1.5 text-[14px] font-normal leading-snug text-[#3b3933] group-hover:no-underline hover:underline">
            {product.name}
          </h3>
          <div className="flex justify-center">
            <StarRating rating={product.rating ?? 5} reviews={product.reviews} />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2">
            <p className="text-[15px] font-semibold text-[#3b3933]">
              {formatPrice(product.price)}
            </p>
            {onSale && product.originalPrice && (
              <p className="text-[13px] text-[#888] line-through">
                {formatPrice(product.originalPrice)}
              </p>
            )}
            <span className="inline-flex items-center gap-1 rounded border border-[#efebdd] px-1.5 py-0.5 text-[10px] text-[#888]">
              🇵🇰 PKR
            </span>
          </div>
        </Link>

        <div className="pointer-events-none absolute inset-x-0 top-0 hidden translate-y-2 justify-center gap-2 opacity-0 transition-all duration-300 lg:flex lg:group-hover:pointer-events-auto lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
          {thumbnails.map((thumb, i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setActiveImage(thumb)}
              onFocus={() => setActiveImage(thumb)}
              onClick={(e) => {
                e.preventDefault();
                setActiveImage(thumb);
              }}
              className={cn(
                "relative h-[72px] w-[54px] shrink-0 overflow-hidden rounded-[10px] bg-[#f5f5f5] shadow-sm ring-1 transition-all duration-200",
                activeImage === thumb
                  ? "ring-[#3b3933]"
                  : "ring-[#e8e2d4] hover:ring-[#3b3933]/60"
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={thumb}
                alt=""
                fill
                className="object-cover"
                sizes="54px"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
