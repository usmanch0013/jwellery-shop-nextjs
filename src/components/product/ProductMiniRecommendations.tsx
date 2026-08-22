"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface ProductMiniRecommendationsProps {
  products: Product[];
}

export default function ProductMiniRecommendations({
  products,
}: ProductMiniRecommendationsProps) {
  const { addToCart } = useCart();

  if (products.length === 0) return null;

  return (
    <div className="mt-10 pt-8 border-t border-border">
      <h3 className="text-[15px] font-medium text-foreground mb-5">
        You may also like
      </h3>
      <div className="space-y-4">
        {products.map((item) => (
          <div key={item.id} className="flex gap-3 items-center">
            <Link
              href={`/products/${item.id}`}
              className="relative w-[72px] h-[72px] shrink-0 rounded-lg overflow-hidden bg-muted"
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="72px"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${item.id}`}
                className="text-[13px] text-[#333] leading-snug hover:underline line-clamp-2"
              >
                {item.name}
              </Link>
              <p className="text-[13px] font-medium mt-1">
                {formatPrice(item.price)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                addToCart(item);
                toast.success("Added to cart");
              }}
              className="shrink-0 w-8 h-8 rounded-full border border-[#ddd] flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
              aria-label={`Add ${item.name} to cart`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
