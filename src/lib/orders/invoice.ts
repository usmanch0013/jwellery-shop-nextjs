import type { DbInvoice, DbOrder, DbOrderItem } from "@/lib/database.types";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants/commerce";

export const STORE_INFO = {
  name: "Lumière Jewellery",
  tagline: "Premium Artificial Jewellery — Pakistan",
  email: "hello@lumiere.pk",
  phone: "+92 300 0000000",
  address: "Lahore, Punjab, Pakistan",
  website: "https://jwelleryshophsp.netlify.app",
};

export interface InvoiceSnapshot {
  order_number: string;
  invoice_number: string;
  issued_at: string;
  store: typeof STORE_INFO;
  customer: Record<string, string>;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    line_total: number;
  }>;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  coupon_code: string | null;
  notes: string | null;
}

export function buildInvoiceNumber(orderNumber: string): string {
  return `INV-${orderNumber}`;
}

export function buildInvoiceSnapshot(
  order: DbOrder,
  items: DbOrderItem[],
  invoiceNumber: string
): InvoiceSnapshot {
  return {
    order_number: order.order_number,
    invoice_number: invoiceNumber,
    issued_at: new Date().toISOString(),
    store: STORE_INFO,
    customer: order.shipping_address,
    items: items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      line_total: item.price * item.quantity,
    })),
    subtotal: order.subtotal,
    shipping: order.shipping,
    discount: order.discount,
    total: order.total,
    payment_method: PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method,
    payment_status: order.payment_status.replace(/_/g, " "),
    coupon_code: order.coupon_code,
    notes: order.notes ?? null,
  };
}

export function snapshotFromInvoice(invoice: DbInvoice): InvoiceSnapshot {
  return invoice.snapshot as unknown as InvoiceSnapshot;
}
