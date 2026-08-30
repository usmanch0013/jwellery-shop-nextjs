"use client";

import { Product } from "@/types";
import { getCategoryInfo } from "@/data/products";
import ProductCard from "./ProductCard";
import CategoryShowcaseCard from "./CategoryShowcaseCard";

interface ProductShowcaseProps {
  title: string;
  products: Product[];
  categorySlug?: string;
  categoryCount?: number;
  ctaHref?: string;
  ctaName?: string;
  ctaImage?: string;
  ctaCount?: number;
  variant?: "default" | "alt";
  onQuickView?: (product: Product) => void;
}

export default function ProductShowcase({
  title,
  products,
  categorySlug,
  categoryCount,
  ctaHref,
  ctaName,
  ctaImage,
  ctaCount,
  variant = "default",
  onQuickView,
}: ProductShowcaseProps) {
  const category = categorySlug ? getCategoryInfo(categorySlug) : null;
  const showCategoryCard = Boolean(categorySlug && category);
  const showCtaCard = Boolean(!showCategoryCard && ctaHref && ctaName && ctaImage);
  const hasEndCard = showCategoryCard || showCtaCard;

  if (products.length === 0) return null;

  return (
    <section
      className={`py-8 sm:py-10 lg:py-14 ${
        variant === "alt" ? "bg-[#F6F1E8]" : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-center font-serif text-xl capitalize text-foreground sm:mb-8 sm:text-2xl lg:text-[28px]">
          {title}
        </h2>

        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-4">
          {products.slice(0, hasEndCard ? 3 : 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}

          {showCategoryCard && category && (
            <CategoryShowcaseCard
              slug={categorySlug!}
              name={category.name}
              productCount={categoryCount ?? category.productCount}
              image={category.image}
            />
          )}

          {showCtaCard && (
            <CategoryShowcaseCard
              slug="showcase-cta"
              href={ctaHref}
              name={ctaName!}
              productCount={ctaCount ?? products.length}
              image={ctaImage!}
            />
          )}
        </div>
      </div>
    </section>
  );
}
