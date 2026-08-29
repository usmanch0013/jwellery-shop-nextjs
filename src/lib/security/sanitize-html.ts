const BLOCKED_TAGS = /<\/?(?:script|iframe|object|embed|form|meta|link|base|style)[^>]*>/gi;
const EVENT_HANDLERS = /\s(on\w+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_URL = /(?:href|src|xlink:href)\s*=\s*["']?\s*javascript:/gi;

/** Strip dangerous HTML for blog/admin content (defense in depth). */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(BLOCKED_TAGS, "")
    .replace(EVENT_HANDLERS, "")
    .replace(JS_URL, 'href="')
    .slice(0, 200_000);
}
