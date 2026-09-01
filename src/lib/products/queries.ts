import type { Product } from "@/types";
import {
  categories as staticCategories,
  products as staticProducts,
} from "@/data/products";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { mapDbCategory, mapDbProductToProduct } from "@/lib/products/mappers";
import type { DbProduct } from "@/lib/database.types";
import { isOnSale } from "@/lib/products/sale";
import { PRODUCTS_PER_PAGE } from "@/lib/constants/commerce";
import type {
  PaginatedProducts,
  ProductQueryParams,
  ProductSort,
} from "@/lib/products/types";

export type { PaginatedProducts, ProductQueryParams, ProductSort };

const emptyPage = (page: number, limit: number): PaginatedProducts => ({
  products: [],
  total: 0,
  page,
  totalPages: 1,
});

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function productLookupFilter(identifier: string): string {
  const filters = [
    `slug.eq.${identifier}`,
    `legacy_id.eq.${identifier}`,
  ];
  if (isUuid(identifier)) {
    filters.push(`id.eq.${identifier}`);
  }
  return filters.join(",");
}

function filterStaticProducts(params: ProductQueryParams): PaginatedProducts {
  const page = params.page ?? 1;
  const limit = params.limit ?? PRODUCTS_PER_PAGE;
  let filtered = [...staticProducts];

  if (params.category) {
    filtered = filtered.filter((p) => p.category === params.category);
  }
  if (params.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= params.minPrice!);
  }
  if (params.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= params.maxPrice!);
  }
  if (params.filter === "new") filtered = filtered.filter((p) => p.isNew);
  if (params.filter === "bestseller")
    filtered = filtered.filter((p) => p.isBestseller);
  if (params.filter === "sale")
    filtered = filtered.filter((p) => isOnSale(p));
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.category.includes(q)
    );
  }

  switch (params.sort) {
    case "price_asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "popular":
      filtered.sort((a, b) => b.reviews - a.reviews);
      break;
    default:
      filtered.sort((a, b) => Number(b.isNew) - Number(a.isNew));
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const products = filtered.slice(start, start + limit).map((p) => ({
    ...p,
    stock: p.stock ?? 50,
    slug: p.slug ?? p.id,
  }));

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getProducts(
  params: ProductQueryParams = {}
): Promise<PaginatedProducts> {
  if (!isSupabaseConfigured()) {
    return filterStaticProducts(params);
  }

  const supabase = await createClient();
  const page = params.page ?? 1;
  const limit = params.limit ?? PRODUCTS_PER_PAGE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("products")
    .select("*, categories!inner(slug, name)", { count: "exact" })
    .eq("status", "published");

  if (params.category) {
    query = query.eq("categories.slug", params.category);
  }
  if (params.minPrice !== undefined) query = query.gte("price", params.minPrice);
  if (params.maxPrice !== undefined) query = query.lte("price", params.maxPrice);
  if (params.filter === "new") query = query.eq("is_new", true);
  if (params.filter === "bestseller") query = query.eq("is_bestseller", true);
  if (params.filter === "sale") query = query.not("original_price", "is", null);
  if (params.search) {
    query = query.textSearch("search_vector", params.search, {
      type: "websearch",
    });
  }

  switch (params.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "popular":
      query = query.order("review_count", { ascending: false });
      break;
    default:
      query = query
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
  }

  const { data, count, error } = await query.range(from, to);
  if (error) {
    console.error("getProducts error:", error.message);
    return emptyPage(page, limit);
  }

  const products = (data as DbProduct[]).map(mapDbProductToProduct);
  const total = count ?? 0;

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function resolveCanonicalProductId(
  idOrSlug: string
): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    const p = staticProducts.find(
      (x) => x.id === idOrSlug || x.slug === idOrSlug
    );
    return p?.id ?? null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id")
    .or(productLookupFilter(idOrSlug))
    .maybeSingle();

  return data?.id ?? null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    const p =
      staticProducts.find((x) => x.slug === slug || x.id === slug) ?? null;
    return p ? { ...p, stock: p.stock ?? 50, slug: p.slug ?? p.id } : null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(slug, name)")
    .or(productLookupFilter(slug))
    .maybeSingle();

  if (error) {
    console.error("getProductBySlug error:", error.message, slug);
    return null;
  }

  if (!data) {
    return null;
  }

  return mapDbProductToProduct(data as DbProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  return getProductBySlug(id);
}

export async function getCategories() {
  if (!isSupabaseConfigured()) {
    return staticCategories;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("name");

  if (error || !data?.length) return [];

  return data.map((row) => {
    const countRow = row.products as { count: number }[] | null;
    const productCount = countRow?.[0]?.count ?? 0;
    return {
      ...mapDbCategory(row),
      productCount,
    };
  });
}

export async function getCategoryBySlug(slug: string) {
  const cats = await getCategories();
  return cats.find((c) => c.slug === slug);
}

export async function getRelatedProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const { products } = await getProducts({
    category: product.category,
    limit: limit + 1,
  });
  return products.filter((p) => p.id !== product.id).slice(0, limit);
}

export async function getFeaturedProducts(options: {
  bestseller?: boolean;
  isNew?: boolean;
  limit?: number;
}): Promise<Product[]> {
  const params: ProductQueryParams = {
    limit: options.limit ?? 4,
    sort: options.bestseller ? "popular" : "newest",
    filter: options.bestseller
      ? "bestseller"
      : options.isNew
        ? "new"
        : undefined,
  };
  const { products } = await getProducts(params);
  return products;
}

export type HomepageCategorySection = {
  category: Awaited<ReturnType<typeof getCategories>>[number];
  products: Product[];
};

export async function getHomepageData() {
  const categories = await getCategories();
  const activeCategories = categories.filter((c) => c.productCount > 0);

  const categorySections: HomepageCategorySection[] = (
    await Promise.all(
      activeCategories.slice(0, 4).map(async (category) => {
        const { products } = await getProducts({
          category: category.slug,
          limit: 4,
        });
        return { category, products };
      })
    )
  ).filter((section) => section.products.length > 0);

  const [bestSelling, newArrivals, latest, sale] = await Promise.all([
    getFeaturedProducts({ bestseller: true, limit: 8 }),
    getFeaturedProducts({ isNew: true, limit: 8 }),
    getProducts({ limit: 8, sort: "newest" }),
    getProducts({ filter: "sale", limit: 12, sort: "popular" }),
  ]);

  const saleProducts = sale.products.filter((p) => isOnSale(p)).slice(0, 8);

  return {
    categories,
    activeCategories,
    categorySections,
    bestSelling,
    newArrivals,
    latestProducts: latest.products,
    saleProducts,
    totalProducts: latest.total,
  };
}
