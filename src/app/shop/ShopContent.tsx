"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import QuickViewDialog from "@/components/QuickViewDialog";
import Breadcrumbs from "@/components/Breadcrumbs";
import { products, categories } from "@/data/products";
import { Product } from "@/types";

export default function ShopContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");
  const maxPrice = searchParams.get("max");

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (filter === "new") result = result.filter((p) => p.isNew);
    if (filter === "bestseller") result = result.filter((p) => p.isBestseller);
    if (filter === "sale") result = result.filter((p) => p.originalPrice);
    if (maxPrice) result = result.filter((p) => p.price <= Number(maxPrice));
    return result;
  }, [activeCategory, filter, maxPrice]);

  return (
    <>
      <div className="py-10 bg-background">
        <div className="max-w-[1400px] mx-auto px-4">
          <Breadcrumbs items={[{ label: "Shop" }]} />
          <h1 className="font-serif text-2xl lg:text-3xl text-center mb-8 capitalize">
            Shop All Jewellery
          </h1>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 text-[11px] uppercase tracking-wider border transition-colors ${
                activeCategory === "all"
                  ? "bg-primary text-white border-primary"
                  : "border-[#ddd] text-[#555] hover:border-primary"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-4 py-2 text-[11px] uppercase tracking-wider border transition-colors ${
                  activeCategory === cat.slug
                    ? "bg-primary text-white border-primary"
                    : "border-[#ddd] text-[#555] hover:border-primary"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ProductGrid
        products={filteredProducts}
        onQuickView={setQuickViewProduct}
      />

      <QuickViewDialog
        product={quickViewProduct}
        open={!!quickViewProduct}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />
    </>
  );
}
