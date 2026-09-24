"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import ProductGrid from "@/components/ProductGrid";
import QuickViewDialog from "@/components/QuickViewDialog";
import Breadcrumbs from "@/components/Breadcrumbs";
import ShopDiscoverBar from "@/components/shop/ShopDiscoverBar";
import { SHOP_PRICE_CAP } from "@/components/shop/ShopPriceRangeSlider";
import { Product } from "@/types";
import type { CategoryInfo } from "@/types";
import type { PaginatedProducts } from "@/lib/products/types";
import { applyIntentToSearchParams } from "@/lib/shop-assistant/apply-intent";
import type { ProductSearchIntent } from "@/lib/shop-assistant/types";

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
  const filtersKey = urlParams.toString();

  const activeCategory = searchParams.category ?? "all";
  const activeFilter = searchParams.filter ?? "all";
  const activeSort = searchParams.sort ?? "newest";
  const priceMin = searchParams.min ? Number(searchParams.min) : 0;
  const priceMax = searchParams.max
    ? Number(searchParams.max)
    : SHOP_PRICE_CAP;

  const [products, setProducts] = useState<Product[]>(initialData.products);
  const [page, setPage] = useState(initialData.page);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [loadingMore, setLoadingMore] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );
  const [isFiltering, startFilterTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    setProducts(initialData.products);
    setPage(initialData.page);
    setTotalPages(initialData.totalPages);
    loadingMoreRef.current = false;
    setLoadingMore(false);
  }, [filtersKey, initialData]);

  const hasMore = page < totalPages;

  const loadMore = useCallback(async () => {
    if (
      loadingMoreRef.current ||
      !hasMore ||
      isFiltering ||
      page >= totalPages
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const params = new URLSearchParams(urlParams.toString());
      params.set("page", String(page + 1));
      const res = await fetch(`/api/shop/products?${params.toString()}`);
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as PaginatedProducts;
      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const next = data.products.filter((p) => !seen.has(p.id));
        return [...prev, ...next];
      });
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch {
      /* keep current list */
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, isFiltering, page, totalPages, urlParams]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { root: null, rootMargin: "280px 0px", threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, hasMore, filtersKey]);

  function navigateShop(url: string) {
    startFilterTransition(() => {
      router.push(url);
    });
  }

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(urlParams.toString());
    mutate(params);
    params.delete("page");
    const qs = params.toString();
    navigateShop(qs ? `/shop?${qs}` : "/shop");
  }

  function setCategory(slug: string) {
    pushParams((params) => {
      if (slug === "all") params.delete("category");
      else params.set("category", slug);
    });
  }

  function setFilter(filter: string) {
    pushParams((params) => {
      if (filter === "all") params.delete("filter");
      else params.set("filter", filter);
    });
  }

  function setSort(sort: string) {
    pushParams((params) => {
      params.set("sort", sort);
    });
  }

  function setPriceRange(min: number, max: number) {
    pushParams((params) => {
      if (min <= 0) params.delete("min");
      else params.set("min", String(min));
      if (max >= SHOP_PRICE_CAP) params.delete("max");
      else params.set("max", String(max));
    });
  }

  function clearAllFilters() {
    navigateShop("/shop");
  }

  function applyAssistantIntent(intent: ProductSearchIntent) {
    pushParams((params) => {
      applyIntentToSearchParams(params, intent);
    });
  }

  const showEndMessage = useMemo(
    () => products.length > 0 && !hasMore && !isFiltering,
    [products.length, hasMore, isFiltering]
  );

  return (
    <>
      <div className="bg-white py-8 sm:py-10">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Shop" }]} />
          <h1 className="mb-8 text-center font-serif text-2xl capitalize text-charcoal lg:mb-10 lg:text-3xl">
            Shop All Jewellery
          </h1>

          <ShopDiscoverBar
            categories={categories}
            activeCategory={activeCategory}
            activeFilter={activeFilter}
            activeSort={activeSort}
            priceMin={priceMin}
            priceMax={priceMax}
            onCategory={setCategory}
            onFilter={setFilter}
            onSort={setSort}
            onPriceRange={setPriceRange}
            onClearAll={clearAllFilters}
            onAssistantIntent={applyAssistantIntent}
          />
        </div>
      </div>

      <div className="relative min-h-[320px]">
        {isFiltering && (
          <div
            className="absolute inset-0 z-20 flex items-start justify-center bg-white/80 pt-24 backdrop-blur-[2px] sm:pt-32"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="flex items-center gap-2.5 rounded-[5px] border border-border-warm bg-white px-5 py-3 shadow-md">
              <Loader2
                className="size-5 animate-spin text-emerald"
                strokeWidth={2}
              />
              <span className="text-[13px] font-medium text-ink">
                Updating products…
              </span>
            </div>
          </div>
        )}

        <div
          className={
            isFiltering
              ? "pointer-events-none select-none opacity-50 transition-opacity duration-200"
              : "transition-opacity duration-200"
          }
        >
          <ProductGrid
            products={products}
            onQuickView={setQuickViewProduct}
          />

          <div ref={sentinelRef} className="h-px w-full" aria-hidden />

          {loadingMore && (
            <div className="flex justify-center py-10">
              <div className="flex items-center gap-2 text-[13px] text-ink">
                <Loader2 className="size-5 animate-spin text-emerald" />
                Loading more…
              </div>
            </div>
          )}

          {showEndMessage && (
            <p className="pb-12 text-center text-[12px] text-ink-soft">
              You&apos;ve seen all products in this view
            </p>
          )}
        </div>
      </div>

      <QuickViewDialog
        product={quickViewProduct}
        open={!!quickViewProduct}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />
    </>
  );
}
