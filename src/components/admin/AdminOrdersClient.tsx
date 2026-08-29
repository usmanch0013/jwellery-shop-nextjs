"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Download, Search } from "lucide-react";
import type { DbOrder, OrderStatus, PaymentStatus } from "@/lib/database.types";
import { formatPrice } from "@/lib/products/format";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants/commerce";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/StatusBadge";
import {
  AdminPageHeader,
  AdminTableElement,
  AdminTabs,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminTr,
} from "@/components/admin/AdminShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCarrierLabel } from "@/lib/orders/carriers";

const selectClass =
  "h-9 rounded-lg border border-[var(--admin-border)] bg-white px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#008060]";

type ViewTab = "all" | "unfulfilled" | "unpaid" | "open" | "closed";

function exportCsv(orders: DbOrder[]) {
  const headers = [
    "Order #",
    "Customer",
    "Email",
    "Phone",
    "Total",
    "Status",
    "Payment",
    "Payment status",
    "Carrier",
    "Tracking",
    "Date",
  ];
  const rows = orders.map((o) => [
    o.order_number,
    o.shipping_address?.fullName ?? "",
    o.guest_email ?? o.shipping_address?.email ?? "",
    o.guest_phone ?? o.shipping_address?.phone ?? "",
    o.total,
    o.status,
    o.payment_method,
    o.payment_status,
    getCarrierLabel(o.carrier),
    o.tracking_number ?? "",
    new Date(o.created_at).toISOString(),
  ]);
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function matchesViewTab(order: DbOrder, tab: ViewTab): boolean {
  switch (tab) {
    case "unfulfilled":
      return ["pending", "confirmed", "processing"].includes(order.status);
    case "unpaid":
      return !["paid"].includes(order.payment_status);
    case "open":
      return !["delivered", "cancelled"].includes(order.status);
    case "closed":
      return ["delivered", "cancelled"].includes(order.status);
    default:
      return true;
  }
}

export default function AdminOrdersClient({ orders }: { orders: DbOrder[] }) {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [search, setSearch] = useState(initialQ);
  const [viewTab, setViewTab] = useState<ViewTab>("all");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">(
    "all"
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const tabCounts = useMemo(
    () => ({
      all: orders.length,
      unfulfilled: orders.filter((o) => matchesViewTab(o, "unfulfilled")).length,
      unpaid: orders.filter((o) => matchesViewTab(o, "unpaid")).length,
      open: orders.filter((o) => matchesViewTab(o, "open")).length,
      closed: orders.filter((o) => matchesViewTab(o, "closed")).length,
    }),
    [orders]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (!matchesViewTab(order, viewTab)) return false;
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (paymentFilter !== "all" && order.payment_status !== paymentFilter) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        order.order_number,
        order.guest_email,
        order.guest_phone,
        order.shipping_address?.fullName,
        order.shipping_address?.phone,
        order.tracking_number,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [orders, search, statusFilter, paymentFilter, viewTab]);

  const allSelected =
    filtered.length > 0 && filtered.every((o) => selected.has(o.id));

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((o) => o.id)));
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <AdminPageHeader
        title="Orders"
        description={`${orders.length} orders`}
        actions={
          <Button
            type="button"
            className="h-9 bg-[#008060] hover:bg-[#006e52] text-white text-[13px]"
            onClick={() => exportCsv(filtered)}
          >
            <Download className="mr-1.5 h-4 w-4" />
            Export
          </Button>
        }
      />

      <div className="admin-card overflow-hidden">
        <AdminTabs
          tabs={[
            { id: "all", label: "All", count: tabCounts.all },
            { id: "unfulfilled", label: "Unfulfilled", count: tabCounts.unfulfilled },
            { id: "unpaid", label: "Unpaid", count: tabCounts.unpaid },
            { id: "open", label: "Open", count: tabCounts.open },
            { id: "closed", label: "Closed", count: tabCounts.closed },
          ]}
          active={viewTab}
          onChange={(id) => setViewTab(id as ViewTab)}
        />

        <div className="flex flex-col gap-3 border-b border-[var(--admin-border)] p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-subdued)]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter orders"
              className="h-9 border-[var(--admin-border)] pl-9 text-[13px]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as OrderStatus | "all")
            }
            className={selectClass}
          >
            <option value="all">All statuses</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select
            value={paymentFilter}
            onChange={(e) =>
              setPaymentFilter(e.target.value as PaymentStatus | "all")
            }
            className={selectClass}
          >
            <option value="all">All payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="cod_pending">COD pending</option>
            <option value="awaiting_payment">Awaiting payment</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-3 border-b border-[var(--admin-border)] bg-[#f0fdf8] px-4 py-2 text-[13px]">
            <span className="font-medium">{selected.size} selected</span>
            <button
              type="button"
              className="text-[#008060] hover:underline"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-medium">No orders found</p>
            <p className="mt-1 text-[13px] text-[var(--admin-text-subdued)]">
              Try adjusting your filters.
            </p>
          </div>
        ) : (
          <AdminTableElement>
            <AdminThead>
              <tr>
                <AdminTh>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </AdminTh>
                <AdminTh>Order</AdminTh>
                <AdminTh>Customer</AdminTh>
                <AdminTh>Total</AdminTh>
                <AdminTh>Payment</AdminTh>
                <AdminTh>Fulfillment</AdminTh>
                <AdminTh>Date</AdminTh>
              </tr>
            </AdminThead>
            <tbody>
              {filtered.map((order) => (
                <AdminTr key={order.id}>
                  <AdminTd>
                    <input
                      type="checkbox"
                      checked={selected.has(order.id)}
                      onChange={() => {
                        const next = new Set(selected);
                        if (next.has(order.id)) next.delete(order.id);
                        else next.add(order.id);
                        setSelected(next);
                      }}
                      className="rounded"
                    />
                  </AdminTd>
                  <AdminTd>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-[#008060] hover:underline"
                    >
                      {order.order_number}
                    </Link>
                    {order.tracking_number && (
                      <p className="mt-0.5 text-[11px] text-[var(--admin-text-subdued)]">
                        {order.tracking_number}
                      </p>
                    )}
                  </AdminTd>
                  <AdminTd>
                    <p className="font-medium">
                      {order.shipping_address?.fullName ?? "Guest"}
                    </p>
                    <p className="text-[12px] text-[var(--admin-text-subdued)]">
                      {order.guest_email ?? order.guest_phone}
                    </p>
                  </AdminTd>
                  <AdminTd className="font-medium">
                    {formatPrice(order.total)}
                  </AdminTd>
                  <AdminTd>
                    <p className="text-[12px] mb-1">
                      {PAYMENT_METHOD_LABELS[order.payment_method]}
                    </p>
                    <PaymentStatusBadge status={order.payment_status} />
                  </AdminTd>
                  <AdminTd>
                    <OrderStatusBadge status={order.status} />
                  </AdminTd>
                  <AdminTd className="text-[var(--admin-text-subdued)]">
                    {new Date(order.created_at).toLocaleString("en-PK")}
                  </AdminTd>
                </AdminTr>
              ))}
            </tbody>
          </AdminTableElement>
        )}
      </div>
    </div>
  );
}
