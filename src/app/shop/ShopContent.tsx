"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import QuickViewDialog from "@/components/QuickViewDialog";
import Pagination from "@/components/Pagination";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Product } from "@/types";
import type { CategoryInfo } from "@/types";
import type { PaginatedProducts } from "@/lib/products/types";

interface ShopContentProps {
  initialData: PaginatedProducts;
  categories: CategoryInfo[];
  searchParams: Record<string, string | undefined>;
}

export default function ShopContent({
  initialData,
  categories,
  searchParams,
}: ShopContentProps) {
  const router = useRouter();
  const urlParams = useSearchParams();
  const activeCategory = searchParams.category ?? "all";

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );

  function setCategory(slug: string) {
    const params = new URLSearchParams(urlParams.toString());
    if (slug === "all") params.delete("category");
    else params.set("category", slug);
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  }

  function setSort(sort: string) {
    const params = new URLSearchParams(urlParams.toString());
    params.set("sort", sort);
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  }

  return (
    <>
      <div className="bg-white py-8 sm:py-10">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Shop" }]} />
          <h1 className="font-serif text-2xl lg:text-3xl text-center mb-4 capitalize">
            Shop All Jewellery
          </h1>
          <p className="text-center text-sm text-muted-foreground mb-6">
            {initialData.total} products
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <select
              className="border px-3 py-2 text-xs uppercase tracking-wider"
              value={searchParams.sort ?? "newest"}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setCategory("all")}
              className={`px-4 py-2 text-[11px] uppercase tracking-wider border transition-colors ${
                activeCategory === "all"
                  ? "bg-primary text-white border-primary"
                  : "border-[#ddd] text-[#555] hover:border-primary"
              }`}
            >
              All
            </button>
            {categories
              .filter((cat) => cat.productCount > 0)
              .map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setCategory(cat.slug)}
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
        products={initialData.products}
        onQuickView={setQuickViewProduct}
      />

      <Pagination
        basePath="/shop"
        pagination={initialData}
        searchParams={searchParams}
      />

      <QuickViewDialog
        product={quickViewProduct}
        open={!!quickViewProduct}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />
    </>
  );
}
