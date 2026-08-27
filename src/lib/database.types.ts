export type PaymentMethod =
  | "cod"
  | "bank_transfer"
  | "jazzcash"
  | "easypaisa"
  | "stripe";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "awaiting_payment"
  | "paid"
  | "failed"
  | "refunded"
  | "cod_pending";

export interface DbCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  product_count: number;
}

export interface DbProduct {
  id: string;
  legacy_id: string | null;
  slug: string;
  name: string;
  description: string;
  short_description?: string;
  sku?: string | null;
  status?: "draft" | "published";
  price: number;
  original_price: number | null;
  category_id: string;
  material: string;
  stock: number;
  is_new: boolean;
  is_bestseller: boolean;
  sold_out: boolean;
  rating_avg: number;
  review_count: number;
  image: string;
  hover_image: string | null;
  created_at: string;
  categories?: DbCategory | null;
}

export interface DbMediaAsset {
  id: string;
  url: string;
  alt_text: string | null;
  title: string | null;
  file_name: string | null;
  mime_type: string | null;
  source?: string | null;
  created_at: string;
}

export interface DbProductTag {
  id: string;
  slug: string;
  name: string;
  created_at: string;
}

export interface DbProductImage {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
}

export interface DbProductVariation {
  id: string;
  product_id: string;
  sku: string | null;
  name: string;
  price: number | null;
  original_price: number | null;
  stock: number;
  image_url: string | null;
  attributes: Record<string, string>;
  sort_order: number;
  is_default: boolean;
  created_at: string;
}

export interface AdminProductDetails extends DbProduct {
  gallery: DbProductImage[];
  tags: DbProductTag[];
  variations: DbProductVariation[];
}

export interface DbOrder {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  shipping_address: Record<string, string>;
  coupon_code: string | null;
  created_at: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  price: number;
  quantity: number;
}

export interface DbAddress {
  id: string;
  user_id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  province: string;
  postal_code: string | null;
  is_default: boolean;
}

export interface DbReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  created_at: string;
  profiles?: { full_name: string | null } | null;
  products?: { name: string } | null;
}

export interface DbCoupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_order: number;
  usage_limit: number | null;
  usage_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DbPayment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  provider_ref: string | null;
  amount: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  orders?: { order_number: string; guest_email: string | null } | null;
}

export interface DbContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
}

export interface DbBlogCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface DbBlogTag {
  id: string;
  slug: string;
  name: string;
  created_at: string;
}

export interface DbBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  status: "draft" | "published";
  author_email: string | null;
  author_name: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminBlogPostDetails extends DbBlogPost {
  categories: DbBlogCategory[];
  tags: DbBlogTag[];
}

export interface DbProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
  created_at: string;
}
