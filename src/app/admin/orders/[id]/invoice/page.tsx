import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminOrder } from "@/lib/admin/queries";
import { generateInvoiceAction } from "@/actions/admin/orders";
import InvoiceDocument from "@/components/orders/InvoiceDocument";
import PrintInvoiceButton from "@/components/admin/PrintInvoiceButton";
import {
  buildInvoiceNumber,
  buildInvoiceSnapshot,
  snapshotFromInvoice,
  type InvoiceSnapshot,
} from "@/lib/orders/invoice";
import type { DbOrderItem } from "@/lib/database.types";

export default async function AdminInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAdminOrder(id);
  if (!data) notFound();

  let snapshot: InvoiceSnapshot;
  let migrationHint = false;

  if (data.invoice) {
    snapshot = snapshotFromInvoice(data.invoice);
  } else {
    const result = await generateInvoiceAction(id);
    const invoiceNumber =
      result.invoiceNumber ?? buildInvoiceNumber(data.order.order_number);
    snapshot = buildInvoiceSnapshot(
      data.order,
      data.items as DbOrderItem[],
      invoiceNumber
    );
    migrationHint = result.persisted === false;
  }

  return (
    <div className="min-h-screen bg-[#f8f4ec] print:bg-white">
      <div className="mx-auto max-w-4xl px-4 py-8 print:max-w-none print:p-0">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link
            href={`/admin/orders/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to order
          </Link>
        </div>
        {migrationHint && (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 print:hidden">
            Invoice is shown from order data. Run migration{" "}
            <code className="text-xs">008_order_commerce_advanced.sql</code> in
            Supabase to save invoices permanently.
          </p>
        )}
        <PrintInvoiceButton />
        <div className="rounded-2xl border border-border/60 bg-white p-8 shadow-sm print:border-0 print:shadow-none print:p-0">
          <InvoiceDocument snapshot={snapshot} showPrintHint />
        </div>
      </div>
    </div>
  );
}
