import Link from "next/link";
import { getAdminOrders } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/products/format";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/StatusBadge";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants/commerce";
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

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders(100);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description={`${orders.length} orders in your store`}
      />

      {orders.length === 0 ? (
        <AdminEmpty
          title="No orders yet"
          description="Customer orders will appear here once placed."
        />
      ) : (
        <AdminTable>
          <AdminTableElement>
            <AdminThead>
              <tr>
                <AdminTh>Order #</AdminTh>
                <AdminTh>Customer</AdminTh>
                <AdminTh>Total</AdminTh>
                <AdminTh>Payment</AdminTh>
                <AdminTh>Status</AdminTh>
                <AdminTh>Date</AdminTh>
              </tr>
            </AdminThead>
            <tbody>
              {orders.map((order) => (
                <AdminTr key={order.id}>
                  <AdminTd>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-primary hover:text-emerald-dark"
                    >
                      {order.order_number}
                    </Link>
                  </AdminTd>
                  <AdminTd>
                    <p className="font-medium">
                      {order.shipping_address?.fullName ?? "Guest"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.guest_email ?? order.guest_phone}
                    </p>
                  </AdminTd>
                  <AdminTd className="font-medium">
                    {formatPrice(order.total)}
                  </AdminTd>
                  <AdminTd>
                    <p className="text-xs mb-1">
                      {PAYMENT_METHOD_LABELS[order.payment_method]}
                    </p>
                    <PaymentStatusBadge status={order.payment_status} />
                  </AdminTd>
                  <AdminTd>
                    <OrderStatusBadge status={order.status} />
                  </AdminTd>
                  <AdminTd className="text-muted-foreground">
                    {new Date(order.created_at).toLocaleString("en-PK")}
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
