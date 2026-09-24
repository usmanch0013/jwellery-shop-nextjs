import { sanitizeHtml } from "@/lib/security/sanitize-html";

const HTML_ENTITY: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

function decodeEntities(text: string): string {
  return text.replace(
    /&(?:nbsp|amp|lt|gt|quot|#39);/gi,
    (m) => HTML_ENTITY[m.toLowerCase()] ?? m
  );
}

/** Google Docs / pasted HTML → clean plain text for the PDP subtitle. */
export function htmlToPlainText(html: string): string {
  return decodeEntities(
    html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<[^>]+>/g, "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim()
  );
}

export function formatShortDescription(raw?: string | null): string {
  if (!raw?.trim()) return "";
  const sanitized = sanitizeHtml(raw);
  if (!/<[a-z][\s\S]*>/i.test(sanitized)) {
    return sanitized.trim();
  }
  return htmlToPlainText(sanitized);
}
