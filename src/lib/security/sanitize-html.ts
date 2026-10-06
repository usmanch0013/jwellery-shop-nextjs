const BLOCKED_TAGS = /<\/?(?:script|iframe|object|embed|form|meta|link|base|style)[^>]*>/gi;
const EVENT_HANDLERS = /\s(on\w+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_URL = /(?:href|src|xlink:href)\s*=\s*["']?\s*javascript:/gi;
const STYLE_ATTRIBUTE = /\sstyle\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
// Google Docs paste wraps content in tags carrying a docs-internal-guid id
// (e.g. <span id="docs-internal-guid-…">). Drop those wrapper tags but keep
// the content inside them.
const DOCS_WRAPPER_TAG = /<(?:span|b)\b[^>]*docs-internal-guid[^>]*>/gi;

/** Strip dangerous HTML for blog/admin content (defense in depth). */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(DOCS_WRAPPER_TAG, "")
    .replace(BLOCKED_TAGS, "")
    .replace(EVENT_HANDLERS, "")
    .replace(STYLE_ATTRIBUTE, "")
    .replace(JS_URL, 'href="')
    .slice(0, 200_000);
}
