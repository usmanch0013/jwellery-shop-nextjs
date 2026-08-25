"use server";

import { getProducts } from "@/lib/products/queries";

export async function searchProductsQuickAction(query: string) {
  const q = query.trim();
  if (!q) return [];

  const { products } = await getProducts({ search: q, limit: 6 });
  return products;
}
