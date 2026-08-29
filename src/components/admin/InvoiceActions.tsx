import Link from "next/link";
import { Printer } from "lucide-react";

export default function InvoiceActions({ invoiceHref }: { invoiceHref: string }) {
  return (
    <Link
      href={invoiceHref}
      target="_blank"
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
    >
      <Printer className="h-4 w-4" />
      View / Print Invoice
    </Link>
  );
}
