import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import CategoryPageClient from "./CategoryPageClient";
import Pagination from "@/components/Pagination";
import {
  getCategoryBySlug,
  getProducts,
} from "@/lib/products/queries";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export const dynamicParams = true;

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const result = await getProducts({
    category: slug,
    page: Number(sp.page) || 1,
    sort: (sp.sort as "newest") || "newest",
  });

  return (
    <div className="py-10 bg-background">
      <div className="max-w-[1400px] mx-auto px-4">
        <Breadcrumbs
          items={[{ label: "Shop", href: "/shop" }, { label: category.name }]}
        />
        <h1 className="font-serif text-2xl lg:text-3xl text-center mb-2 capitalize">
          {category.name}
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-2">
          {result.total} products
        </p>
      </div>

      <CategoryPageClient products={result.products} />
      <Pagination
        basePath={`/categories/${slug}`}
        pagination={result}
        searchParams={sp}
      />
    </div>
  );
}
