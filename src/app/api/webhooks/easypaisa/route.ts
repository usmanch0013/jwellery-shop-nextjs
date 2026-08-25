import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
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
      .select("id")
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
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
