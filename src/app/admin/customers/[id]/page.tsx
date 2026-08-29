import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCustomer } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/products/format";
import {
  AdminCard,
  AdminInfoRow,
  AdminPageHeader,
  AdminTable,
  AdminTableElement,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminTr,
} from "@/components/admin/AdminShell";
import { OrderStatusBadge } from "@/components/admin/StatusBadge";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAdminCustomer(decodeURIComponent(id));
  if (!data) notFound();

  const { customer, orders } = data;

  return (
    <div className="mx-auto max-w-[1000px] space-y-5">
      <AdminPageHeader
        title={customer.name}
        description={`${customer.ordersCount} orders · ${formatPrice(customer.totalSpent)} lifetime value`}
        backHref="/admin/customers"
        badge={
          <span className="rounded-md bg-[var(--admin-bg)] px-2 py-0.5 text-[11px] font-medium capitalize">
            {customer.type}
          </span>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <AdminCard title="Contact">
          <AdminInfoRow label="Email" value={customer.email ?? "—"} />
          <AdminInfoRow label="Phone" value={customer.phone ?? "—"} />
          <AdminInfoRow
            label="Last order"
            value={
              customer.lastOrderAt
                ? new Date(customer.lastOrderAt).toLocaleString("en-PK")
                : "—"
            }
          />
        </AdminCard>
        <AdminCard title="Summary">
          <AdminInfoRow label="Total orders" value={customer.ordersCount} />
          <AdminInfoRow
            label="Total spent"
            value={formatPrice(customer.totalSpent)}
          />
          <AdminInfoRow
            label="Average order"
            value={
              customer.ordersCount > 0
                ? formatPrice(Math.round(customer.totalSpent / customer.ordersCount))
                : "—"
            }
          />
        </AdminCard>
      </div>

      <AdminCard title="Order history" padding={false}>
        {orders.length === 0 ? (
          <p className="p-5 text-[13px] text-[var(--admin-text-subdued)]">
            No orders yet.
          </p>
        ) : (
          <AdminTableElement>
            <AdminThead>
              <tr>
                <AdminTh>Order</AdminTh>
                <AdminTh>Status</AdminTh>
                <AdminTh>Total</AdminTh>
                <AdminTh>Date</AdminTh>
              </tr>
            </AdminThead>
            <tbody>
              {orders.map((order) => (
                <AdminTr key={order.id}>
                  <AdminTd>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-[#008060] hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </AdminTd>
                  <AdminTd>
                    <OrderStatusBadge status={order.status} />
                  </AdminTd>
                  <AdminTd className="font-medium">
                    {formatPrice(order.total)}
                  </AdminTd>
                  <AdminTd className="text-[var(--admin-text-subdued)]">
                    {new Date(order.created_at).toLocaleDateString("en-PK")}
                  </AdminTd>
                </AdminTr>
              ))}
            </tbody>
          </AdminTableElement>
        )}
      </AdminCard>
    </div>
  );
}
