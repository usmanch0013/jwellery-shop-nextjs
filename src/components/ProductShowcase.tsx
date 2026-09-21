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

const MOBILE_SECTION_PRODUCT_LIMIT = 5;

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

  const mobileProducts = products.slice(0, MOBILE_SECTION_PRODUCT_LIMIT);

  const sectionBg =
    variant === "alt" ? "bg-[#F6F1E8]" : "bg-white";

  const viewAllButtonClass =
    "site-btn mt-6 w-full gap-2 border border-[#d8d0c0] bg-white text-[#0B3D35] transition-colors hover:border-[#0B3D35] hover:bg-[#0B3D35] hover:text-white";

  return (
    <section className={`py-8 sm:py-10 lg:py-14 ${sectionBg}`}>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Mobile: full grid, no slider */}
        <div className="lg:hidden">
          <h2 className="mb-5 font-serif text-xl capitalize text-foreground sm:text-2xl">
            {title}
          </h2>
          <div className="flex flex-col gap-4">
            {mobileProducts.map((product) => (
              <div key={product.id} className="mx-auto w-full max-w-[320px]">
                <ProductCard
                  product={product}
                  onQuickView={onQuickView}
                />
              </div>
            ))}
          </div>
          <Link href={href} className={viewAllButtonClass}>
            {viewAllLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Desktop: carousel slider */}
        <Carousel
          opts={{ align: "start", containScroll: "trimSnaps", dragFree: false }}
          className="hidden w-full lg:block"
        >
          <div className="mb-8 flex items-center justify-between gap-3">
            <h2 className="min-w-0 font-serif text-[28px] capitalize text-foreground">
              {title}
            </h2>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={href}
                className="mr-1 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.14em] text-[#0B3D35] transition-colors hover:text-champagne"
              >
                {viewAllLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <CarouselPrevious
                variant="outline"
                className="static inset-auto h-8 w-8 translate-x-0 translate-y-0 rounded-[5px] border-[#e8e2d4] bg-white text-[#3b3933] shadow-none disabled:opacity-30"
              />
              <CarouselNext
                variant="outline"
                className="static inset-auto h-8 w-8 translate-x-0 translate-y-0 rounded-[5px] border-[#e8e2d4] bg-white text-[#3b3933] shadow-none disabled:opacity-30"
              />
            </div>
          </div>

          <CarouselContent className="-ml-2.5">
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="basis-1/4 pl-2.5"
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
