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
}
