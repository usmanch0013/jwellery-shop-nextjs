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
      <div className="relative mb-2.5 aspect-[2/3] overflow-hidden rounded-[16px] bg-[#f5f5f5]">
        <Link href={productHref} className="absolute inset-0 block">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={`object-cover transition-opacity duration-500 ${
              isHovered ? "opacity-0" : "opacity-100"
            }`}
            sizes="(max-width: 640px) 50vw, 25vw"
          />
          <Image
            src={hoverImg}
            alt={`${product.name} alternate view`}
            fill
            className={`object-cover transition-opacity duration-500 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
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
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product);
            }}
            className={`absolute bottom-0 left-0 right-0 bg-[#6F112B] py-3.5 text-sm text-white transition-all duration-300 ${
              isHovered
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0"
            }`}
          >
            Quick view
          </button>
        )}

        {isHovered && thumbnails.length > 1 && (
          <div className="absolute bottom-14 left-1/2 flex -translate-x-1/2 gap-2">
            {thumbnails.map((thumb, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveImage(thumb);
                }}
                className={`h-8 w-8 overflow-hidden rounded-full border-2 transition-all ${
                  activeImage === thumb
                    ? "scale-110 border-white"
                    : "border-white/50 opacity-70"
                }`}
              >
                <Image
                  src={thumb}
                  alt=""
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

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
