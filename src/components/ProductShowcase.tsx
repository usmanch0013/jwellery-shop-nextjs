"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types";
import ProductCard from "./ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductShowcaseProps {
  title: string;
  products: Product[];
  categorySlug?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  variant?: "default" | "alt";
  onQuickView?: (product: Product) => void;
}

export default function ProductShowcase({
  title,
  products,
  categorySlug,
  viewAllHref,
  viewAllLabel = "View all",
  variant = "default",
  onQuickView,
}: ProductShowcaseProps) {
  const href =
    viewAllHref ?? (categorySlug ? `/categories/${categorySlug}` : "/shop");

  if (products.length === 0) return null;

  return (
    <section
      className={`py-8 sm:py-10 lg:py-14 ${
        variant === "alt" ? "bg-[#F6F1E8]" : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <Carousel
          opts={{ align: "start", containScroll: "trimSnaps", dragFree: false }}
          className="w-full"
        >
          <div className="mb-5 flex items-center justify-between gap-3 sm:mb-8">
            <h2 className="min-w-0 font-serif text-xl capitalize text-foreground sm:text-2xl lg:text-[28px]">
              {title}
            </h2>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Link
                href={href}
                className="mr-1 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#0B3D35] transition-colors hover:text-champagne sm:text-xs"
              >
                {viewAllLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <CarouselPrevious
                variant="outline"
                className="static inset-auto h-8 w-8 translate-x-0 translate-y-0 rounded-full border-[#e8e2d4] bg-white text-[#3b3933] shadow-none disabled:opacity-30 sm:h-9 sm:w-9"
              />
              <CarouselNext
                variant="outline"
                className="static inset-auto h-8 w-8 translate-x-0 translate-y-0 rounded-full border-[#e8e2d4] bg-white text-[#3b3933] shadow-none disabled:opacity-30 sm:h-9 sm:w-9"
              />
            </div>
          </div>

          <CarouselContent className="-ml-2 sm:-ml-2.5">
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="basis-[78%] pl-2 sm:basis-1/2 sm:pl-2.5 lg:basis-1/4"
              >
                <ProductCard product={product} onQuickView={onQuickView} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
