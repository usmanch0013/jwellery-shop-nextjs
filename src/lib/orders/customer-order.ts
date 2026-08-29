import type { DbInvoice, DbOrder } from "@/lib/database.types";

/** Strip admin-only fields before returning orders to customers. */
export function sanitizeOrderForCustomer(order: DbOrder): DbOrder {
  const { internal_notes: _notes, ...rest } = order;
  return rest;
}

export function sanitizeInvoiceForCustomer(
  invoice: DbInvoice | null
): Pick<DbInvoice, "invoice_number" | "status" | "issued_at"> | null {
  if (!invoice) return null;
  return {
    invoice_number: invoice.invoice_number,
    status: invoice.status,
    issued_at: invoice.issued_at,
  };
}
