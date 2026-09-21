import { NextRequest, NextResponse } from "next/server";
import { runShopAssistant } from "@/lib/shop-assistant/run";
import type { AssistantHistoryItem } from "@/lib/shop-assistant/types";

export const runtime = "nodejs";

const MAX_MESSAGE = 500;
const MAX_HISTORY = 8;

export async function POST(request: NextRequest) {
  let body: { message?: string; history?: AssistantHistoryItem[] };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > MAX_MESSAGE) {
    return NextResponse.json(
      { error: "Message is required (max 500 characters)." },
      { status: 400 }
    );
  }

  const history = Array.isArray(body.history)
    ? body.history
        .filter(
          (h) =>
            h &&
            (h.role === "user" || h.role === "assistant") &&
            typeof h.content === "string"
        )
        .slice(-MAX_HISTORY)
    : [];

  try {
    const result = await runShopAssistant(message, history);
    return NextResponse.json(result);
  } catch (e) {
    console.error("shop-assistant route error:", e);
    return NextResponse.json(
      { error: "Assistant temporarily unavailable." },
      { status: 500 }
    );
  }
}
