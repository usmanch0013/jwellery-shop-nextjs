"use server";

import { getAdminClient } from "@/lib/admin/auth";
import type { OrderStatus, PaymentStatus } from "@/lib/database.types";
import { buildCarrierTrackingUrl } from "@/lib/orders/carriers";
import {
  getStatusChangeMessage,
  logOrderEvent,
} from "@/lib/orders/events";
import {
  buildInvoiceNumber,
  buildInvoiceSnapshot,
} from "@/lib/orders/invoice";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  previousStatus?: OrderStatus
) {
  const admin = await getAdminClient();

  const updates: Record<string, string> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === "shipped") updates.shipped_at = new Date().toISOString();
  if (status === "delivered") updates.delivered_at = new Date().toISOString();

  const { error } = await admin.from("orders").update(updates).eq("id", orderId);

  if (error) return { error: error.message };

  const eventType =
    status === "cancelled"
      ? "cancelled"
      : status === "shipped"
        ? "shipped"
        : status === "delivered"
          ? "delivered"
          : "status_changed";

  await logOrderEvent(admin, orderId, eventType, getStatusChangeMessage(status), {
    from: previousStatus,
    to: status,
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/track-order");
  return { success: true };
}

export async function updatePaymentStatusAction(
  orderId: string,
  paymentStatus: PaymentStatus,
  previousStatus?: PaymentStatus
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

  await logOrderEvent(
    admin,
    orderId,
    "payment_updated",
    `Payment status updated to ${paymentStatus.replace(/_/g, " ")}`,
    { from: previousStatus, to: paymentStatus }
  );

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/payments");
  return { success: true };
}

export async function updateShippingAction(
  orderId: string,
  input: {
    carrier: string;
    trackingNumber: string;
    trackingUrl?: string;
    markShipped?: boolean;
  }
) {
  const admin = await getAdminClient();
  const trackingUrl =
    input.trackingUrl?.trim() ||
    buildCarrierTrackingUrl(input.carrier, input.trackingNumber) ||
    null;

  const updates: Record<string, string | null> = {
    carrier: input.carrier || null,
    tracking_number: input.trackingNumber.trim() || null,
    tracking_url: trackingUrl,
    updated_at: new Date().toISOString(),
  };

  if (input.markShipped) {
    updates.status = "shipped";
    updates.shipped_at = new Date().toISOString();
  }

  const { error } = await admin.from("orders").update(updates).eq("id", orderId);
  if (error) return { error: error.message };

  const message = input.trackingNumber
    ? `Tracking added: ${input.trackingNumber}`
    : "Shipping details updated";

  await logOrderEvent(admin, orderId, "tracking_added", message, {
    carrier: input.carrier,
    tracking_number: input.trackingNumber,
    tracking_url: trackingUrl,
    marked_shipped: input.markShipped ?? false,
  });

  if (input.markShipped) {
    await logOrderEvent(
      admin,
      orderId,
      "shipped",
      "Order has been shipped",
      { tracking_number: input.trackingNumber }
    );
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/track-order");
  return { success: true };
}

export async function addInternalNoteAction(orderId: string, note: string) {
  const admin = await getAdminClient();
  const trimmed = note.trim();
  if (!trimmed) return { error: "Note cannot be empty" };

  const { data: order } = await admin
    .from("orders")
    .select("internal_notes")
    .eq("id", orderId)
    .maybeSingle();

  const existing = (order?.internal_notes as string | null) ?? "";
  const timestamp = new Date().toLocaleString("en-PK");
  const combined = existing
    ? `${existing}\n\n[${timestamp}] ${trimmed}`
    : `[${timestamp}] ${trimmed}`;

  const { error } = await admin
    .from("orders")
    .update({ internal_notes: combined, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) return { error: error.message };

  await logOrderEvent(admin, orderId, "note_added", "Internal note added by admin");

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function generateInvoiceAction(orderId: string) {
  const admin = await getAdminClient();

  const { data: existing } = await admin
    .from("invoices")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (existing) {
    return {
      success: true,
      invoiceId: existing.id,
      invoiceNumber: existing.invoice_number,
      persisted: true,
    };
  }

  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { error: "Order not found" };

  const { data: items } = await admin
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  const invoiceNumber = buildInvoiceNumber(order.order_number);
  const snapshot = buildInvoiceSnapshot(order, items ?? [], invoiceNumber);

  const { data: invoice, error } = await admin
    .from("invoices")
    .insert({
      order_id: orderId,
      invoice_number: invoiceNumber,
      status: order.payment_status === "paid" ? "paid" : "issued",
      snapshot,
    })
    .select("id, invoice_number")
    .single();

  if (error) {
    // Table may not exist yet (migration 008) — still allow viewing/printing
    return {
      success: true,
      invoiceId: null,
      invoiceNumber,
      persisted: false,
      warning: error.message,
    };
  }

  try {
    await logOrderEvent(
      admin,
      orderId,
      "invoice_generated",
      `Invoice ${invoiceNumber} generated`
    );
  } catch {
    // order_events table optional until migration runs
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}/invoice`);
  return {
    success: true,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoice_number,
    persisted: true,
  };
}
