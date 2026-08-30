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

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [activeImage, setActiveImage] = useState(product.image);
  const [isHovered, setIsHovered] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const productHref = productPath(product);
  const wished = isInWishlist(product.id);
  const onSale = isOnSale(product);
  const salePercent = discountPercent(product);

  const hoverImg = product.hoverImage ?? product.image;
  const thumbnails = [product.image, hoverImg].filter(
    (img, i, arr) => arr.indexOf(img) === i
  );

  return (
    <div
      className="group"
      onMouseEnter={() => {
        setIsHovered(true);
        setActiveImage(product.hoverImage ?? product.image);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveImage(product.image);
      }}
    >
      <div className="relative mb-2 aspect-[2/3] overflow-hidden rounded-[16px] bg-[#f5f5f5]">
        <Link href={productHref} className="absolute inset-0 block">
          <Image
            src={activeImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        </Link>

        <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2">
          <span className="text-[9px] font-light uppercase tracking-[0.24em] text-white/90 drop-shadow-sm">
            Lumière
          </span>
        </div>

        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-1.5">
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
          className={`absolute right-3 top-3 z-10 rounded-full p-2 transition-colors ${
            wished
              ? "bg-rose-500 text-white"
              : "bg-white/85 text-[#3b3933] hover:bg-white"
          }`}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className="h-4 w-4"
            fill={wished ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        </button>

        {onQuickView && !product.soldOut && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product);
            }}
            className="pointer-events-none absolute inset-x-2.5 bottom-2 z-10 h-6 translate-y-2 rounded-md bg-[#6F112B] text-[11px] font-medium leading-6 text-white opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100"
          >
            Quick view
          </button>
        )}
      </div>

      {thumbnails.length > 1 && (
        <div
          className={`grid transition-all duration-300 ${
            isHovered
              ? "mb-2 grid-rows-[1fr] opacity-100"
              : "mb-0 grid-rows-[0fr] opacity-0 pointer-events-none"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="flex gap-1.5 px-0.5">
              {thumbnails.map((thumb, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setActiveImage(thumb)}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveImage(thumb);
                  }}
                  className={`relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 transition-colors ${
                    activeImage === thumb
                      ? "border-[#3b3933]"
                      : "border-white ring-1 ring-[#ddd]"
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <Image
                    src={thumb}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Link href={productHref} className="block px-0.5">
        <h3 className="mb-1.5 text-[14px] font-normal leading-snug text-[#3b3933] hover:underline">
          {product.name}
        </h3>
        <StarRating rating={product.rating ?? 5} reviews={product.reviews} />
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
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
    </div>
  );
}
