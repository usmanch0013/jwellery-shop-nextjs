import Link from "next/link";
import { getAdminPayments } from "@/lib/admin/queries";
import { PaymentStatusBadge } from "@/components/admin/StatusBadge";
import { formatPrice } from "@/lib/products/format";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminTable,
  AdminTableElement,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminTr,
} from "@/components/admin/AdminShell";

export default async function AdminPaymentsPage() {
  const payments = await getAdminPayments();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payments"
        description={`${payments.length} payment transactions`}
      />

      {payments.length === 0 ? (
        <AdminEmpty
          title="No payments yet"
          description="Payment records appear when customers checkout."
        />
      ) : (
        <AdminTable>
          <AdminTableElement>
            <AdminThead>
              <tr>
                <AdminTh>Order</AdminTh>
                <AdminTh>Method</AdminTh>
                <AdminTh>Amount</AdminTh>
                <AdminTh>Status</AdminTh>
                <AdminTh>Reference</AdminTh>
                <AdminTh>Date</AdminTh>
              </tr>
            </AdminThead>
            <tbody>
              {payments.map((p) => (
                <AdminTr key={p.id}>
                  <AdminTd>
                    <Link
                      href={`/admin/orders/${p.order_id}`}
                      className="font-medium text-primary hover:text-emerald-dark"
                    >
                      {p.orders?.order_number ?? p.order_id.slice(0, 8)}
                    </Link>
                  </AdminTd>
                  <AdminTd className="capitalize">
                    {p.method.replace("_", " ")}
                  </AdminTd>
                  <AdminTd className="font-medium">
                    {formatPrice(p.amount)}
                  </AdminTd>
                  <AdminTd>
                    <PaymentStatusBadge status={p.status} />
                  </AdminTd>
                  <AdminTd className="text-muted-foreground text-xs">
                    {p.provider_ref ?? "—"}
                  </AdminTd>
                  <AdminTd className="text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString("en-PK")}
                  </AdminTd>
                </AdminTr>
              ))}
            </tbody>
          </AdminTableElement>
        </AdminTable>
      )}
    </div>
  );
}
