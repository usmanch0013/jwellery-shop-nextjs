import type { ProductSearchIntent } from "./types";

/** Keep in sync with ShopPriceRangeSlider */
const SHOP_PRICE_CAP = 15000;

/** Apply assistant intent to shop URL search params (replaces filter-related keys). */
export function applyIntentToSearchParams(
  params: URLSearchParams,
  intent: ProductSearchIntent
) {
  params.delete("page");

  if (intent.category) params.set("category", intent.category);
  else params.delete("category");

  if (intent.filter) params.set("filter", intent.filter);
  else params.delete("filter");

  if (intent.sort) params.set("sort", intent.sort);
  else params.delete("sort");

  if (intent.minPrice != null && intent.minPrice > 0) {
    params.set("min", String(intent.minPrice));
  } else {
    params.delete("min");
  }

  if (intent.maxPrice != null && intent.maxPrice < SHOP_PRICE_CAP) {
    params.set("max", String(intent.maxPrice));
  } else {
    params.delete("max");
  }

  if (intent.search?.trim()) params.set("q", intent.search.trim());
  else params.delete("q");
}
