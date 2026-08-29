import type { CmsPage } from "@/lib/cms/types";
import { validatePageSlug } from "@/lib/cms/page-utils";

const MAX_TITLE = 200;
const MAX_TEXT = 10000;
const MAX_SECTIONS = 80;
const MAX_URL = 2048;

function clamp(value: string, max: number): string {
  return value.slice(0, max);
}

/** Strip null bytes and trim */
export function cleanText(value: string, max = MAX_TEXT): string {
  return clamp(value.replace(/\0/g, "").trim(), max);
}

export function cleanOptionalText(
  value: string | null | undefined,
  max = MAX_TEXT
): string | null {
  if (value == null) return null;
  const t = cleanText(value, max);
  return t || null;
}

export function cleanUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const t = clamp(value.trim(), MAX_URL);
  if (!t) return null;
  if (t.startsWith("/")) return t;
  try {
    const u = new URL(t);
    if (u.protocol === "http:" || u.protocol === "https:") return t;
  } catch {
    return null;
  }
  return null;
}

export function validateCmsPagePayload(page: CmsPage): string | null {
  const slugError = validatePageSlug(page.slug);
  if (slugError) return slugError;

  if (!cleanText(page.title, MAX_TITLE)) return "Page title is required.";

  const blocks = page.blocks ?? [];
  if (blocks.length > MAX_SECTIONS) {
    return `Too many sections (max ${MAX_SECTIONS}).`;
  }

  if (page.hero_image && !cleanUrl(page.hero_image)) {
    return "Invalid hero image URL.";
  }

  return null;
}

export function sanitizeCmsPage(page: CmsPage): CmsPage {
  return {
    slug: page.slug,
    title: cleanText(page.title, MAX_TITLE),
    eyebrow: cleanOptionalText(page.eyebrow, 120),
    content: cleanText(page.content),
    seo_title: cleanOptionalText(page.seo_title, MAX_TITLE),
    seo_description: cleanOptionalText(page.seo_description, 320),
    hero_image: cleanUrl(page.hero_image ?? undefined),
    blocks: page.blocks ?? [],
    updated_at: page.updated_at,
  };
}
