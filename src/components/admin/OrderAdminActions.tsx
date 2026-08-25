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
    await updateOrderStatusAction(orderId, newStatus);
    await updatePaymentStatusAction(orderId, newPayment);
    setLoading(false);
    router.refresh();
  }

  return (
    <form action={save} className="space-y-4 border border-border rounded-lg p-4 bg-background">
      <h3 className="font-medium">Update order</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Order status</Label>
          <select
            name="status"
            defaultValue={status}
            className="w-full h-9 border border-input px-3 text-sm rounded-md"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Payment status</Label>
          <select
            name="paymentStatus"
            defaultValue={paymentStatus}
            className="w-full h-9 border border-input px-3 text-sm rounded-md"
          >
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
