import { formatPrice } from "@/lib/products/format";
import type { InvoiceSnapshot } from "@/lib/orders/invoice";

export default function InvoiceDocument({
  snapshot,
  showPrintHint = false,
}: {
  snapshot: InvoiceSnapshot;
  showPrintHint?: boolean;
}) {
  const customer = snapshot.customer;

  return (
    <div className="invoice-document bg-white text-foreground">
      {showPrintHint && (
        <p className="mb-6 rounded-lg border border-dashed border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 print:hidden">
          Use your browser&apos;s Print option (Ctrl+P) to save as PDF or print this invoice.
        </p>
      )}

      <header className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-emerald-700">
            Tax Invoice
          </p>
          <h1 className="mt-2 font-serif text-3xl text-[#092f29]">{snapshot.store.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{snapshot.store.tagline}</p>
          <div className="mt-4 space-y-0.5 text-sm text-muted-foreground">
            <p>{snapshot.store.email}</p>
            <p>{snapshot.store.phone}</p>
            <p>{snapshot.store.address}</p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm text-muted-foreground">Invoice #</p>
          <p className="font-serif text-2xl font-medium">{snapshot.invoice_number}</p>
          <p className="mt-3 text-sm text-muted-foreground">Order #</p>
          <p className="font-medium">{snapshot.order_number}</p>
          <p className="mt-3 text-sm text-muted-foreground">Issued</p>
          <p className="text-sm">
            {new Date(snapshot.issued_at).toLocaleDateString("en-PK", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </header>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Bill to
          </p>
          <div className="mt-2 text-sm leading-relaxed">
            <p className="font-medium">{customer.fullName}</p>
            <p>{customer.line1}</p>
            {customer.line2 && <p>{customer.line2}</p>}
            <p>
              {customer.city}, {customer.province}
              {customer.postalCode ? ` ${customer.postalCode}` : ""}
            </p>
            <p className="mt-2">{customer.phone}</p>
            <p>{customer.email}</p>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Payment
          </p>
          <div className="mt-2 space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Method:</span>{" "}
              {snapshot.payment_method}
            </p>
            <p className="capitalize">
              <span className="text-muted-foreground">Status:</span>{" "}
              {snapshot.payment_status}
            </p>
            {snapshot.coupon_code && (
              <p>
                <span className="text-muted-foreground">Coupon:</span>{" "}
                {snapshot.coupon_code}
              </p>
            )}
          </div>
        </div>
      </div>

      <table className="mt-10 w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="pb-3 font-medium">Item</th>
            <th className="pb-3 font-medium text-center">Qty</th>
            <th className="pb-3 font-medium text-right">Unit price</th>
            <th className="pb-3 font-medium text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {snapshot.items.map((item, i) => (
            <tr key={i} className="border-b border-border/50">
              <td className="py-3 pr-4">{item.name}</td>
              <td className="py-3 text-center">{item.quantity}</td>
              <td className="py-3 text-right">{formatPrice(item.price)}</td>
              <td className="py-3 text-right font-medium">
                {formatPrice(item.line_total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(snapshot.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatPrice(snapshot.shipping)}</span>
          </div>
          {snapshot.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount</span>
              <span>-{formatPrice(snapshot.discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
            <span>Total</span>
            <span className="font-serif text-lg">{formatPrice(snapshot.total)}</span>
          </div>
        </div>
      </div>

      {snapshot.notes && (
        <div className="mt-8 rounded-lg bg-muted/30 px-4 py-3 text-sm">
          <p className="font-medium">Customer notes</p>
          <p className="mt-1 text-muted-foreground">{snapshot.notes}</p>
        </div>
      )}

      <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <p>Thank you for shopping with {snapshot.store.name}.</p>
        <p className="mt-1">{snapshot.store.website}</p>
      </footer>
    </div>
  );
}
