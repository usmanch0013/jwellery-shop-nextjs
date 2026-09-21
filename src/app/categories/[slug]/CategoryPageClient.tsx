"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Product } from "@/types";
import ProductGrid from "@/components/ProductGrid";
import QuickViewDialog from "@/components/QuickViewDialog";

export default function CategoryPageClient({
  products,
  slug,
  sort = "newest",
}: {
  products: Product[];
  slug: string;
  sort?: string;
}) {
  const router = useRouter();
  const urlParams = useSearchParams();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );

  function setSort(nextSort: string) {
    const params = new URLSearchParams(urlParams.toString());
    params.set("sort", nextSort);
    params.delete("page");
    router.push(`/categories/${slug}?${params.toString()}`);
  }

  return (
    <>
      <div className="mx-auto mb-8 flex max-w-[1400px] justify-center px-4 sm:px-6 lg:px-8">
        <select
          className="rounded-[5px] border px-3 py-1.5 text-[10px] uppercase tracking-wider"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort products"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>
      <ProductGrid products={products} onQuickView={setQuickViewProduct} />
      <QuickViewDialog
        product={quickViewProduct}
        open={!!quickViewProduct}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />
    </>
  );
}
