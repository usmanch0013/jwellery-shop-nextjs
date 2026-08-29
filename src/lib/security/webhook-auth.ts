import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

/** Verify shared webhook secret via Authorization: Bearer or X-Webhook-Secret header. */
export function verifyWebhookSecret(
  request: NextRequest,
  envVar: string
): { ok: true } | { ok: false; status: number; message: string } {
  const secret = process.env[envVar]?.trim();
  if (!secret) {
    return {
      ok: false,
      status: 503,
      message: `Webhook not configured (${envVar})`,
    };
  }

  const auth = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-webhook-secret");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";

  const provided = bearer || headerSecret?.trim() || "";
  if (!provided || !safeEqual(provided, secret)) {
    return { ok: false, status: 401, message: "Unauthorized webhook" };
  }

  return { ok: true };
}
