import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/products/queries";
import type { ProductSort } from "@/lib/products/types";

export const runtime = "nodejs";

const SORTS = new Set<ProductSort>([
  "newest",
  "price_asc",
  "price_desc",
  "popular",
]);

const FILTERS = new Set(["new", "bestseller", "sale", "featured"]);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const sortRaw = searchParams.get("sort") ?? "newest";
  const sort = SORTS.has(sortRaw as ProductSort)
    ? (sortRaw as ProductSort)
    : "newest";
  const category = searchParams.get("category");
  const filterRaw = searchParams.get("filter");
  const filter =
    filterRaw && FILTERS.has(filterRaw)
      ? (filterRaw as "new" | "bestseller" | "sale" | "featured")
      : undefined;
  const min = searchParams.get("min");
  const max = searchParams.get("max");
  const q = searchParams.get("q")?.trim();

  try {
    const result = await getProducts({
      page,
      sort,
      category: category && category !== "all" ? category : undefined,
      filter,
      minPrice: min ? Number(min) : undefined,
      maxPrice: max ? Number(max) : undefined,
      search: q || undefined,
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error("shop products API:", e);
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
  }
}
