"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, productPath } from "@/lib/products/format";
import { discountPercent, isOnSale } from "@/lib/products/sale";
import {
  productCardImageClass,
  PRODUCT_CARD_THUMB_IMAGE_CLASS,
} from "@/lib/products/card-image";
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
  const showPrimaryLayer = activeImage === primaryImage;

  return (
    <div
      className="group"
      onMouseEnter={() => {
        if (hoverImage) setActiveImage(hoverImage);
      }}
      onMouseLeave={() => setActiveImage(primaryImage)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-[16px] bg-[#f2efe3]">
        <Link
          href={productHref}
          className={cn(
            "absolute inset-x-0 top-0 z-0 block",
            showQuickView ? "bottom-8 lg:bottom-0" : "bottom-0"
          )}
        >
          {thumbnails.map((src) => {
            const visible = src === activeImage;
            return (
              <Image
                key={src}
                src={src}
                alt={src === primaryImage ? product.name : ""}
                fill
                className={cn(
                  productCardImageClass(src, primaryImage),
                  "transition-opacity duration-300",
                  visible ? "opacity-100" : "opacity-0"
                )}
                sizes="(max-width: 1024px) 100vw, 25vw"
              />
            );
          })}
        </Link>

        <div
          className={cn(
            "pointer-events-none absolute left-1/2 top-3 z-[2] -translate-x-1/2 transition-opacity duration-300",
            showPrimaryLayer ? "opacity-100" : "opacity-0"
          )}
        >
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
            "absolute right-3 top-3 z-[2] rounded-[5px] p-1.5 transition-colors",
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

        {showQuickView && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onQuickView?.(product);
            }}
            className={cn(
              "absolute inset-x-0 bottom-0 z-[3] w-full bg-[#6F112B] text-[12px] font-medium leading-8 text-white transition-[transform,opacity] duration-300 ease-out",
              "opacity-100",
              "lg:translate-y-full lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
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
                "relative h-[72px] w-[54px] shrink-0 overflow-hidden rounded-[10px] bg-[#f2efe3] shadow-sm ring-1 transition-all duration-200",
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
                className={PRODUCT_CARD_THUMB_IMAGE_CLASS}
                sizes="54px"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
