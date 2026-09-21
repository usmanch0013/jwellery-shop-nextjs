import type { Product } from "@/types";

export type AssistantChatRole = "user" | "assistant";

export type AssistantHistoryItem = {
  role: AssistantChatRole;
  content: string;
};

export type AssistantProductPayload = Pick<
  Product,
  | "id"
  | "slug"
  | "name"
  | "price"
  | "originalPrice"
  | "image"
  | "category"
  | "material"
  | "description"
  | "stock"
  | "soldOut"
  | "variations"
>;

export type ShopAssistantResponse = {
  message: string;
  products: AssistantProductPayload[];
  suggestions: string[];
  /** Which backend answered (for debugging / transparency). */
  engine: "rules" | "openai";
};

export type ProductSearchIntent = {
  reply?: string;
  search?: string;
  filter?: "new" | "bestseller" | "sale" | "featured";
  category?: string;
  maxPrice?: number;
  minPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "popular";
};
