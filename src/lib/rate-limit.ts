const hits = new Map<string, { count: number; resetAt: number }>();

export async function rateLimitKey(prefix: string) {
  const { headers } = await import("next/headers");
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown";
  return `${prefix}:${ip}`;
}

export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000
): { ok: boolean } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (entry.count >= limit) return { ok: false };
  entry.count += 1;
  return { ok: true };
}
