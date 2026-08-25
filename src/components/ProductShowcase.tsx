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
  onQuickView?: (product: Product) => void;
}

export default function ProductShowcase({
  title,
  products,
  categorySlug,
  categoryCount,
  onQuickView,
}: ProductShowcaseProps) {
  const category = categorySlug ? getCategoryInfo(categorySlug) : null;

  if (products.length === 0) return null;

  return (
    <section className="py-8 lg:py-12 bg-background">
      <div className="max-w-[1400px] mx-auto px-4">
        <h2 className="font-serif text-2xl lg:text-[28px] text-center mb-8 text-foreground capitalize">
          {title}
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 lg:gap-2">
          {products.slice(0, 3).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}

          {categorySlug && category && (
            <CategoryShowcaseCard
              slug={categorySlug}
              name={category.name}
              productCount={categoryCount ?? category.productCount}
              image={category.image}
            />
          )}
        </div>
      </div>
    </section>
  );
}
