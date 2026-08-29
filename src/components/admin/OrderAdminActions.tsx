"use client";

import type { OrderStatus, PaymentStatus } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  updateOrderStatusAction,
  updatePaymentStatusAction,
} from "@/actions/admin/orders";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminCard } from "@/components/admin/AdminShell";
import { Save } from "lucide-react";
import {
  ORDER_STATUS_LABELS,
} from "@/lib/constants/commerce";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "awaiting_payment",
  "paid",
  "failed",
  "refunded",
  "cod_pending",
];

const selectClass =
  "w-full h-10 rounded-xl border border-border/70 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20";

export default function OrderAdminActions({
  orderId,
  status,
  paymentStatus,
}: {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function save(formData: FormData) {
    setLoading(true);
    const newStatus = formData.get("status") as OrderStatus;
    const newPayment = formData.get("paymentStatus") as PaymentStatus;

    if (newStatus !== status) {
      await updateOrderStatusAction(orderId, newStatus, status);
    }
    if (newPayment !== paymentStatus) {
      await updatePaymentStatusAction(orderId, newPayment, paymentStatus);
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <AdminCard
      title="Update order"
      description="Change fulfillment and payment status"
    >
      <form action={save} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Order status</Label>
            <select name="status" defaultValue={status} className={selectClass}>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_LABELS[s] ?? s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Payment status</Label>
            <select
              name="paymentStatus"
              defaultValue={paymentStatus}
              className={selectClass}
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button type="submit" disabled={loading} className="gap-2">
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </AdminCard>
  );
}
