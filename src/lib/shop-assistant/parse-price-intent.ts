import type { ProductSearchIntent } from "./types";

function parseAmount(raw: string): number | undefined {
  const n = Number(raw.replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
}

/** Max price (under / kam / km) from English or Roman Urdu. */
export function extractMaxPriceFromText(text: string): number | undefined {
  const t = text.toLowerCase();

  const patterns = [
    /(?:under|below|less than|upto|up to|max|budget)\s*(?:rs\.?|pkr)?\s*([\d,]+)/i,
    /([\d,]+)\s*(?:rs\.?|pkr)?\s*(?:sy|se)\s*(?:km|kam|kum|se\s*km|se\s*kam)/i,
    /([\d,]+)\s*(?:rs\.?|pkr)?\s*tak\b/i,
    /(?:rs\.?|pkr)\s*([\d,]+)\s*(?:sy|se)?\s*(?:km|kam|kum|tak|se\s*neeche)/i,
    /([\d,]+)\s*(?:sy|se)\s*(?:neeche|niche)/i,
    /(?:price|rate)\s*(?:sy|se)?\s*(?:km|kam|kum)\s*([\d,]+)/i,
    /(?:km|kam|kum)\s*(?:price|rate)?\s*(?:rs\.?|pkr)?\s*([\d,]+)/i,
  ];

  for (const re of patterns) {
    const m = t.match(re);
    if (m?.[1]) {
      const amount = parseAmount(m[1]);
      if (amount != null) return amount;
    }
  }

  if (/sasta|cheap|affordable|low\s*price|kam\s*price/i.test(t)) {
    const onlyNum = t.match(/\b([\d]{3,6})\b/);
    if (onlyNum) return parseAmount(onlyNum[1]);
  }

  return undefined;
}

export function extractMinPriceFromText(text: string): number | undefined {
  const t = text.toLowerCase();
  const patterns = [
    /(?:above|over|more than|min|from)\s*(?:rs\.?|pkr)?\s*([\d,]+)/i,
    /([\d,]+)\s*(?:rs\.?|pkr)?\s*(?:sy|se)\s*(?:zyada|ziyada|upar|above)/i,
  ];
  for (const re of patterns) {
    const m = t.match(re);
    if (m?.[1]) return parseAmount(m[1]);
  }
  return undefined;
}

function extractBetween(text: string): { min?: number; max?: number } {
  const m = text.match(
    /(?:between|from)\s*([\d,]+)\s*(?:and|to|-|–)\s*([\d,]+)/i
  );
  if (!m) return {};
  const a = parseAmount(m[1]);
  const b = parseAmount(m[2]);
  if (a == null || b == null) return {};
  return { min: Math.min(a, b), max: Math.max(a, b) };
}

function looksLikePriceOnlyQuery(message: string): boolean {
  const t = message.toLowerCase();
  if (!/\d{3,6}/.test(t)) return false;
  return /price|budget|kam|km|kum|sasta|rs|pkr|tak|under|below|products?|waly|wali|hn|hain|chahiye|dikhao|show/i.test(
    t
  );
}

/** Merge price signals from the user message; fix mistaken full-text search. */
export function enrichIntentWithMessagePrices(
  message: string,
  intent: ProductSearchIntent
): ProductSearchIntent {
  const next: ProductSearchIntent = { ...intent };
  const trimmed = message.trim();

  const between = extractBetween(trimmed);
  const max =
    next.maxPrice ?? between.max ?? extractMaxPriceFromText(trimmed);
  const min =
    next.minPrice ?? between.min ?? extractMinPriceFromText(trimmed);

  if (max != null) next.maxPrice = max;
  if (min != null) next.minPrice = min;

  const priceLed =
    next.maxPrice != null ||
    next.minPrice != null ||
    looksLikePriceOnlyQuery(trimmed);

  if (priceLed) {
    const search = next.search?.trim();
    if (
      search &&
      (search === trimmed ||
        search.length > 12 ||
        looksLikePriceOnlyQuery(search))
    ) {
      delete next.search;
    }
    if (!next.sort) next.sort = "price_asc";
    const genericSearchReply =
      !!next.reply && /^results for/i.test(next.reply.trim());
    if (!next.reply || genericSearchReply) {
      if (next.maxPrice != null && next.minPrice == null) {
        next.reply = `Pieces under Rs. ${next.maxPrice.toLocaleString("en-PK")} — price filter applied below.`;
      } else if (next.minPrice != null && next.maxPrice == null) {
        next.reply = `Pieces from Rs. ${next.minPrice.toLocaleString("en-PK")} upward.`;
      } else if (next.minPrice != null && next.maxPrice != null) {
        next.reply = `Between Rs. ${next.minPrice.toLocaleString("en-PK")} and Rs. ${next.maxPrice.toLocaleString("en-PK")}.`;
      }
    }
  }

  return next;
}
