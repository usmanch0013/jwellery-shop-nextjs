import { z } from "zod";
import { PK_PROVINCES } from "@/lib/constants/commerce";

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Valid email required"),
  line1: z.string().min(5, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  province: z.enum(PK_PROVINCES),
  postalCode: z.string().optional(),
});

export const paymentMethodSchema = z.enum([
  "cod",
  "bank_transfer",
  "jazzcash",
  "easypaisa",
  "stripe",
]);

export const checkoutSchema = z.object({
  shipping: shippingAddressSchema,
  paymentMethod: paymentMethodSchema,
  couponCode: z.string().optional(),
  paymentReference: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(10),
});

export const trackOrderSchema = z.object({
  orderNumber: z.string().min(5),
  phone: z.string().min(10),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(1000),
});

export const addressSchema = z.object({
  label: z.string().default("Home"),
  line1: z.string().min(5),
  line2: z.string().optional(),
  city: z.string().min(2),
  province: z.enum(PK_PROVINCES),
  postalCode: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
