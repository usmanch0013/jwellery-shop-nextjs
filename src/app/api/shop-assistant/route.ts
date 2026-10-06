import { NextRequest, NextResponse } from "next/server";
import { runShopAssistant } from "@/lib/shop-assistant/run";
import type { AssistantHistoryItem } from "@/lib/shop-assistant/types";

export const runtime = "nodejs";

const MAX_MESSAGE = 500;
const MAX_HISTORY = 8;

// Simple per-IP in-memory rate limit: this endpoint calls paid LLM APIs,
// so cap how often a single visitor can use it. In-memory state is per
// server process, which is fine for the single-instance deployment.
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const ipHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (hits.length >= RATE_LIMIT_MAX) {
    ipHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest) {
  if (isRateLimited(clientIp(request))) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

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
