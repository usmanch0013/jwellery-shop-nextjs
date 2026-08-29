import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrderStatus } from "@/lib/database.types";

export type OrderEventType =
  | "order_placed"
  | "status_changed"
  | "payment_updated"
  | "shipped"
  | "delivered"
  | "tracking_added"
  | "note_added"
  | "invoice_generated"
  | "cancelled";

export interface DbOrderEvent {
  id: string;
  order_id: string;
  event_type: OrderEventType | string;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

const STATUS_MESSAGES: Partial<Record<OrderStatus, string>> = {
  confirmed: "Order confirmed — we're preparing your items",
  processing: "Order is being processed in our warehouse",
  shipped: "Order has been shipped",
  delivered: "Order delivered successfully",
  cancelled: "Order was cancelled",
};

export function getStatusChangeMessage(status: OrderStatus): string {
  return STATUS_MESSAGES[status] ?? `Order status updated to ${status}`;
}

export async function logOrderEvent(
  admin: SupabaseClient,
  orderId: string,
  eventType: OrderEventType,
  message: string,
  metadata: Record<string, unknown> = {}
) {
  await admin.from("order_events").insert({
    order_id: orderId,
    event_type: eventType,
    message,
    metadata,
  });
}

export async function getOrderEvents(
  admin: SupabaseClient,
  orderId: string
): Promise<DbOrderEvent[]> {
  const { data } = await admin
    .from("order_events")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  return (data ?? []) as DbOrderEvent[];
}
