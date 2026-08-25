import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderNumber = body.pp_TxnRefNo ?? body.orderRef;
    const status = body.pp_ResponseCode ?? body.status;

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

    if (status === "000" || status === "success") {
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
