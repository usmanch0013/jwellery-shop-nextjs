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

export interface Product {
  id: string;
  slug?: string;
  legacyId?: string;
  name: string;
  description: string;
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
  soldOut?: boolean;
  stock?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CategoryInfo {
  slug: Category;
  name: string;
  description: string;
  productCount: number;
  image: string;
}
