import type { DbInvoice, DbOrder, DbOrderItem } from "@/lib/database.types";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants/commerce";
import { BRAND } from "@/lib/brand";

export const STORE_INFO = {
  name: BRAND.name,
  tagline: BRAND.promise,
  email: BRAND.email,
  phone: BRAND.phone,
  address: BRAND.address,
  website: BRAND.siteUrl,
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

function toAmount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function toText(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function asRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, string> = {};
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    out[key] = toText(v);
  }
  return out;
}

type RawSnapshotItem = {
  name?: unknown;
  quantity?: unknown;
  price?: unknown;
  line_total?: unknown;
};

function normalizeItems(value: unknown): InvoiceSnapshot["items"] {
  if (!Array.isArray(value)) return [];
  return value.map((raw) => {
    const item = (raw ?? {}) as RawSnapshotItem;
    const quantity = toAmount(item.quantity) || 1;
    const price = toAmount(item.price);
    return {
      name: toText(item.name) || "Item",
      quantity,
      price,
      line_total: item.line_total != null ? toAmount(item.line_total) : price * quantity,
    };
  });
}

/**
 * Fill every field InvoiceDocument renders so a stored snapshot that is
 * missing data (older invoice rows, partial addresses, null totals) still
 * renders gracefully instead of throwing and showing "Something went wrong".
 */
export function normalizeInvoiceSnapshot(
  raw: Partial<InvoiceSnapshot> | Record<string, unknown> | null | undefined
): InvoiceSnapshot {
  const snap = (raw ?? {}) as Partial<InvoiceSnapshot>;
  const items = normalizeItems(snap.items);
  const itemsTotal = items.reduce((sum, item) => sum + item.line_total, 0);
  const storeRaw =
    snap.store && typeof snap.store === "object" ? snap.store : {};

  return {
    order_number: toText(snap.order_number),
    invoice_number: toText(snap.invoice_number),
    issued_at: toText(snap.issued_at) || new Date().toISOString(),
    store: { ...STORE_INFO, ...storeRaw },
    customer: asRecord(snap.customer),
    items,
    subtotal: toAmount(snap.subtotal) || itemsTotal,
    shipping: toAmount(snap.shipping),
    discount: toAmount(snap.discount),
    total: toAmount(snap.total),
    payment_method: toText(snap.payment_method),
    payment_status: toText(snap.payment_status),
    coupon_code: snap.coupon_code ?? null,
    notes: snap.notes ?? null,
  };
}

export function buildInvoiceNumber(orderNumber: string): string {
  return `INV-${orderNumber}`;
}

export function buildInvoiceSnapshot(
  order: DbOrder,
  items: DbOrderItem[],
  invoiceNumber: string
): InvoiceSnapshot {
  const safeItems = Array.isArray(items) ? items : [];
  const itemsTotal = safeItems.reduce(
    (sum, item) => sum + toAmount(item.price) * toAmount(item.quantity),
    0
  );

  return normalizeInvoiceSnapshot({
    order_number: order.order_number,
    invoice_number: invoiceNumber,
    issued_at: new Date().toISOString(),
    store: STORE_INFO,
    customer: asRecord(order.shipping_address),
    items: safeItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      line_total: toAmount(item.price) * toAmount(item.quantity),
    })),
    // Stored subtotal can be 0/stale — fall back to the line-items sum.
    subtotal: toAmount(order.subtotal) || itemsTotal,
    shipping: toAmount(order.shipping),
    discount: toAmount(order.discount),
    total: toAmount(order.total),
    payment_method:
      PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method ?? "",
    payment_status: (order.payment_status ?? "pending").replace(/_/g, " "),
    coupon_code: order.coupon_code ?? null,
    notes: order.notes ?? null,
  });
}

export function snapshotFromInvoice(invoice: DbInvoice): InvoiceSnapshot {
  return normalizeInvoiceSnapshot(
    invoice?.snapshot as Partial<InvoiceSnapshot> | undefined
  );
}
