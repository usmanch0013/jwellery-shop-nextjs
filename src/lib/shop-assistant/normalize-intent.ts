import type { Category, CategoryInfo } from "@/types";
import type { ProductSearchIntent } from "./types";

const FILTERS = new Set(["new", "bestseller", "sale", "featured"]);
const SORTS = new Set(["newest", "price_asc", "price_desc", "popular"]);

function num(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
}

export function normalizeIntent(
  raw: ProductSearchIntent,
  categories: CategoryInfo[]
): ProductSearchIntent {
  const slugs = new Set(categories.map((c) => c.slug));
  const intent: ProductSearchIntent = {};

  if (typeof raw.reply === "string" && raw.reply.trim()) {
    intent.reply = raw.reply.trim().slice(0, 500);
  }

  if (typeof raw.search === "string" && raw.search.trim()) {
    intent.search = raw.search.trim().slice(0, 120);
  }

  if (raw.filter && FILTERS.has(raw.filter)) {
    intent.filter = raw.filter;
  }

  if (typeof raw.category === "string" && slugs.has(raw.category as Category)) {
    intent.category = raw.category;
  }

  const minPrice = num(raw.minPrice);
  const maxPrice = num(raw.maxPrice);
  if (minPrice != null) intent.minPrice = minPrice;
  if (maxPrice != null) intent.maxPrice = maxPrice;

  if (raw.sort && SORTS.has(raw.sort)) {
    intent.sort = raw.sort;
  }

  return intent;
}
