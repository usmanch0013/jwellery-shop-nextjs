export type ProductSort = "newest" | "price_asc" | "price_desc" | "popular";

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  sort?: ProductSort;
  minPrice?: number;
  maxPrice?: number;
  filter?: "new" | "bestseller" | "sale" | "featured";
  search?: string;
  /**
   * "card" fetches only the columns a product card renders (no long
   * description / search vector), which keeps listing payloads small.
   * Default keeps the full row.
   */
  fields?: "full" | "card";
}

export interface PaginatedProducts {
  products: import("@/types").Product[];
  total: number;
  page: number;
  totalPages: number;
}
