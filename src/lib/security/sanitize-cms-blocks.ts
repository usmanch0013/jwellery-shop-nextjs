import type { CmsPageSection } from "@/lib/cms/page-sections";
import { cleanText, cleanUrl } from "@/lib/cms/sanitize";

const URL_KEYS = new Set([
  "ctaHref",
  "buttonHref",
  "href",
  "src",
  "image",
  "poster",
  "backgroundImage",
  "youtubeUrl",
]);

const YOUTUBE_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
]);

function cleanCssToken(value: unknown, max = 80): string {
  if (typeof value !== "string") return "";
  return value.replace(/[^\w\s-]/g, "").trim().slice(0, max);
}

function cleanEmbedUrl(value: unknown): string {
  const url = cleanUrl(typeof value === "string" ? value : undefined);
  if (!url) return "";
  try {
    const u = new URL(url);
    if (YOUTUBE_HOSTS.has(u.hostname) && u.pathname.includes("/embed/")) {
      return url;
    }
  } catch {
    return "";
  }
  return "";
}

function sanitizeSettings(settings: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(settings)) {
    if (key === "cssId" || key === "cssClass") {
      out[key] = cleanCssToken(value);
      continue;
    }

    if (key === "youtubeUrl") {
      out[key] = cleanEmbedUrl(value);
      continue;
    }

    if (URL_KEYS.has(key) && typeof value === "string") {
      out[key] = cleanUrl(value) ?? "";
      continue;
    }

    if (typeof value === "string") {
      out[key] = cleanText(value, key === "content" ? 20000 : 2000);
      continue;
    }

    if (Array.isArray(value)) {
      out[key] = value.map((item) => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          return sanitizeSettings(item as Record<string, unknown>);
        }
        if (typeof item === "string") return cleanText(item, 500);
        return item;
      });
      continue;
    }

    if (value && typeof value === "object") {
      out[key] = sanitizeSettings(value as Record<string, unknown>);
      continue;
    }

    out[key] = value;
  }

  return out;
}

export function sanitizeCmsSections(sections: CmsPageSection[]): CmsPageSection[] {
  return sections.map((section) => ({
    ...section,
    id: cleanCssToken(section.id, 64) || section.id,
    settings: sanitizeSettings(section.settings ?? {}),
  }));
}
