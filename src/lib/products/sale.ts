import type { Product } from "@/types";

export function normalizeSalePrices(price: number, originalPrice?: number | null) {
  if (!originalPrice || originalPrice === price) {
    return { price, originalPrice: undefined as number | undefined };
  }
  const selling = Math.min(price, originalPrice);
  const compare = Math.max(price, originalPrice);
  return { price: selling, originalPrice: compare };
}

export function isOnSale(product: Product): boolean {
  const { price, originalPrice } = normalizeSalePrices(
    product.price,
    product.originalPrice
  );
  return Boolean(originalPrice && originalPrice > price);
}

export function discountPercent(product: Product): number {
  const { price, originalPrice } = normalizeSalePrices(
    product.price,
    product.originalPrice
  );
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round((1 - price / originalPrice) * 100);
}
