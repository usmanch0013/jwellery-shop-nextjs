import { BRAND } from "@/lib/brand";
import { formatPrice } from "@/lib/products/format";
import type { CartItem } from "@/types";

export function getWhatsAppDigits(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  if (fromEnv) return fromEnv;
  const fromBrand = BRAND.phone.replace(/\D/g, "");
  return fromBrand || "923000000000";
}

export function whatsAppUrl(message: string): string {
  return `https://wa.me/${getWhatsAppDigits()}?text=${encodeURIComponent(message)}`;
}

export function defaultOrderWhatsAppMessage(): string {
  return `Hi ${BRAND.name}, I'd like to place an order from ${BRAND.domain}. Please help me with product availability and delivery.`;
}

export function cartWhatsAppMessage(items: CartItem[]): string {
  if (items.length === 0) return defaultOrderWhatsAppMessage();
  const lines = items.map((item) => {
    const name = item.variationName
      ? `${item.product.name} (${item.variationName})`
      : item.product.name;
    return `• ${name} × ${item.quantity} — ${formatPrice(item.product.price * item.quantity)}`;
  });
  return `Hi ${BRAND.name}, I want to order:\n\n${lines.join("\n")}\n\nPlease confirm total, payment & delivery. Thank you!`;
}
