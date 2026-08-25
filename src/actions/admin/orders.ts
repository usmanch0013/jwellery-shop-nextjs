"use server";

import { getAdminClient } from "@/lib/admin/auth";
import type { OrderStatus, PaymentStatus } from "@/lib/database.types";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus
) {
  const admin = await getAdminClient();
  const { error } = await admin
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) return { error: error.message };
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function updatePaymentStatusAction(
  orderId: string,
  paymentStatus: PaymentStatus
) {
  const admin = await getAdminClient();
  const { error: orderError } = await admin
    .from("orders")
    .update({
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (orderError) return { error: orderError.message };

  await admin
    .from("payments")
    .update({ status: paymentStatus })
    .eq("order_id", orderId);

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/payments");
  return { success: true };
}
