export type ProductSort = "newest" | "price_asc" | "price_desc" | "popular";

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  sort?: ProductSort;
  minPrice?: number;
  maxPrice?: number;
  filter?: "new" | "bestseller" | "sale";
  search?: string;
}

export interface PaginatedProducts {
  products: import("@/types").Product[];
  total: number;
  page: number;
  totalPages: number;
}
