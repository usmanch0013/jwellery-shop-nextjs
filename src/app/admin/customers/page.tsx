import Link from "next/link";
import { getAdminCustomers } from "@/lib/admin/queries";
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

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <AdminPageHeader
        title="Customers"
        description={`${customers.length} customers`}
      />

      {customers.length === 0 ? (
        <AdminEmpty
          title="No customers yet"
          description="Customers appear when orders are placed."
        />
      ) : (
        <AdminTable>
          <AdminTableElement>
            <AdminThead>
              <tr>
                <AdminTh>Customer</AdminTh>
                <AdminTh>Contact</AdminTh>
                <AdminTh>Orders</AdminTh>
                <AdminTh>Total spent</AdminTh>
                <AdminTh>Last order</AdminTh>
                <AdminTh>Type</AdminTh>
              </tr>
            </AdminThead>
            <tbody>
              {customers.map((customer) => (
                <AdminTr key={customer.id}>
                  <AdminTd>
                    <Link
                      href={`/admin/customers/${encodeURIComponent(customer.id)}`}
                      className="font-medium text-[#008060] hover:underline"
                    >
                      {customer.name}
                    </Link>
                  </AdminTd>
                  <AdminTd>
                    <p className="text-[13px]">{customer.email ?? "—"}</p>
                    <p className="text-[12px] text-[var(--admin-text-subdued)]">
                      {customer.phone ?? "—"}
                    </p>
                  </AdminTd>
                  <AdminTd>{customer.ordersCount}</AdminTd>
                  <AdminTd className="font-medium">
                    {formatPrice(customer.totalSpent)}
                  </AdminTd>
                  <AdminTd className="text-[var(--admin-text-subdued)]">
                    {customer.lastOrderAt
                      ? new Date(customer.lastOrderAt).toLocaleDateString("en-PK")
                      : "—"}
                  </AdminTd>
                  <AdminTd>
                    <span className="rounded-md bg-[var(--admin-bg)] px-2 py-0.5 text-[11px] font-medium capitalize">
                      {customer.type}
                    </span>
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
