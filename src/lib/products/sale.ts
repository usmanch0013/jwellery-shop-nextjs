import type { Product } from "@/types";

export function isOnSale(product: Product): boolean {
  return Boolean(
    product.originalPrice && product.originalPrice > product.price
  );
}

export function discountPercent(product: Product): number {
  if (!isOnSale(product) || !product.originalPrice) return 0;
  return Math.round((1 - product.price / product.originalPrice) * 100);
}
