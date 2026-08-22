"use client";

import { useState } from "react";
import { Product } from "@/types";
import ProductGrid from "@/components/ProductGrid";
import QuickViewDialog from "@/components/QuickViewDialog";

export default function CategoryPageClient({
  products,
}: {
  products: Product[];
}) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );

  return (
    <>
      <ProductGrid products={products} onQuickView={setQuickViewProduct} />
      <QuickViewDialog
        product={quickViewProduct}
        open={!!quickViewProduct}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />
    </>
  );
}
