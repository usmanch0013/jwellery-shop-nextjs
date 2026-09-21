import type { Metadata } from "next";
import { Suspense } from "react";
import ShopContent from "./ShopContent";
import { getProducts, getCategories } from "@/lib/products/queries";
import type { ProductSort } from "@/lib/products/types";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Shop Artificial Jewellery | ${BRAND.name}`,
  description:
    `Browse necklace sets, earrings, bangles, bridal & everyday artificial jewellery at ${BRAND.domain}. Contemporary Pakistani designs since ${BRAND.foundedYear}.`,
  alternates: { canonical: "/shop" },
};

interface ShopPageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    filter?: string;
    max?: string;
    category?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const sort = (params.sort as ProductSort) || "newest";
  const category = params.category;
  const maxPrice = params.max ? Number(params.max) : undefined;

  const [result, categories] = await Promise.all([
    getProducts({
      page,
      sort,
      category: category && category !== "all" ? category : undefined,
      maxPrice,
      filter: params.filter as "new" | "bestseller" | "sale" | "featured" | undefined,
    }),
    getCategories(),
  ]);

  return (
    <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
      <ShopContent
        initialData={result}
        categories={categories}
        searchParams={params}
      />
    </Suspense>
  );
}
