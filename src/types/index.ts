export type Category =
  | "necklace-sets"
  | "earrings"
  | "bangles"
  | "finger-ring"
  | "bracelet"
  | "bridal-sets"
  | "chains"
  | "anklets"
  | "bindiya-jhumar"
  | "matha-pati"
  | "nose-ring"
  | "accessories";

export interface ProductVariation {
  id: string;
  name: string;
  sku?: string | null;
  price?: number | null;
  originalPrice?: number | null;
  stock: number;
  imageUrl?: string | null;
  attributes?: Record<string, string>;
  isDefault?: boolean;
}

export interface Product {
  id: string;
  slug?: string;
  legacyId?: string;
  sku?: string | null;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  category: Category;
  image: string;
  hoverImage?: string;
  images?: string[];
  material: string;
  reviews: number;
  rating?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  soldOut?: boolean;
  stock?: number;
  variations?: ProductVariation[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  /** Unique cart line (product id, or product+variation). */
  lineId: string;
  variationId?: string;
  variationName?: string;
}

export interface CategoryInfo {
  slug: Category;
  name: string;
  description: string;
  productCount: number;
  image: string;
}
