"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { formatPrice } from "@/data/products";
import StarRating from "./StarRating";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [activeImage, setActiveImage] = useState(product.image);
  const [isHovered, setIsHovered] = useState(false);

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
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#ece6dc] mb-3">
        <Link href={`/products/${product.id}`} className="block absolute inset-0">
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

        {/* Brand watermark */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="text-[9px] tracking-[0.2em] text-white/90 uppercase font-light drop-shadow">
            Lumière
          </span>
        </div>

        {product.soldOut && (
          <span className="absolute top-3 left-3 bg-black/70 text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded">
            Sold out
          </span>
        )}

        {/* Quick view button - maroon like Zeesy */}
        {onQuickView && !product.soldOut && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product);
            }}
            className={`absolute bottom-0 left-0 right-0 bg-[#6d2135] text-white text-sm py-3.5 transition-all duration-300 ${
              isHovered
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-full"
            }`}
          >
            Quick view
          </button>
        )}

        {/* Thumbnail dots on hover */}
        {isHovered && thumbnails.length > 1 && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-2">
            {thumbnails.map((thumb, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveImage(thumb);
                }}
                className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                  activeImage === thumb
                    ? "border-white scale-110"
                    : "border-white/50 opacity-70"
                }`}
              >
                <Image
                  src={thumb}
                  alt=""
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <Link href={`/products/${product.id}`} className="block px-1">
        <h3 className="text-[15px] text-[#1a1a1a] leading-snug mb-2 font-normal hover:underline">
          {product.name}
        </h3>
        <StarRating rating={product.rating ?? 5} reviews={product.reviews} />
        <div className="flex items-center gap-2 mt-2">
          <p className="text-[15px] font-medium text-[#1a1a1a]">
            {formatPrice(product.price)}
          </p>
          <span className="inline-flex items-center gap-1 text-[10px] text-[#888] border border-[#ddd] rounded px-1.5 py-0.5">
            🇵🇰 PKR
          </span>
        </div>
      </Link>
    </div>
  );
}
