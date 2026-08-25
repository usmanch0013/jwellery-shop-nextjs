import { getAdminPayments } from "@/lib/admin/queries";
import { PaymentStatusBadge } from "@/components/admin/StatusBadge";
import { formatPrice } from "@/lib/products/format";
import Link from "next/link";

export default async function AdminPaymentsPage() {
  const payments = await getAdminPayments();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">Payments</h1>

      <div className="rounded-lg border border-border bg-background overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${p.order_id}`}
                    className="text-primary hover:underline"
                  >
                    {p.orders?.order_number ?? p.order_id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-4 py-3">{p.method}</td>
                <td className="px-4 py-3">{formatPrice(p.amount)}</td>
                <td className="px-4 py-3">
                  <PaymentStatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {p.provider_ref ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(p.created_at).toLocaleDateString("en-PK")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
