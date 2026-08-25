import ProductGrid from "@/components/ProductGrid";
import Pagination from "@/components/Pagination";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getProducts } from "@/lib/products/queries";
import type { ProductSort } from "@/lib/products/types";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    sort?: string;
  }>;
}

export const metadata = { title: "Search | Lumière Jewellery" };

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const page = Number(params.page) || 1;
  const sort = (params.sort as ProductSort) || "newest";

  const result = await getProducts({
    search: q,
    page,
    sort,
  });

  return (
    <div className="py-10 px-4 max-w-[1400px] mx-auto">
      <Breadcrumbs items={[{ label: "Search" }]} />
      <h1 className="font-serif text-2xl lg:text-3xl text-center mb-2">
        Search Results
      </h1>
      {q && (
        <p className="text-center text-muted-foreground mb-8">
          Showing results for &ldquo;{q}&rdquo; ({result.total} items)
        </p>
      )}
      {result.products.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">
          No products found.
        </p>
      ) : (
        <>
          <ProductGrid products={result.products} />
          <Pagination
            basePath="/search"
            pagination={result}
            searchParams={{ q, sort }}
          />
        </>
      )}
    </div>
  );
}
