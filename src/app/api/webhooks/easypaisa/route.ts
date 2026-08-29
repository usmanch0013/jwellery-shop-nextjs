import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSecret } from "@/lib/security/webhook-auth";

export async function POST(request: NextRequest) {
  const auth = verifyWebhookSecret(request, "EASYPAISA_WEBHOOK_SECRET");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const orderNumber = body.orderId ?? body.orderRefNum;
    const status = body.transactionStatus ?? body.status;

    if (!orderNumber) {
      return NextResponse.json({ error: "Missing order reference" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: order } = await admin
      .from("orders")
      .select("id, payment_status")
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.payment_status === "paid") {
      return NextResponse.json({ received: true, skipped: "already_paid" });
    }

    if (status === "PAID" || status === "success") {
      await admin
        .from("orders")
        .update({ payment_status: "paid", status: "confirmed" })
        .eq("id", order.id);
      await admin
        .from("payments")
        .update({ status: "paid" })
        .eq("order_id", order.id);
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
