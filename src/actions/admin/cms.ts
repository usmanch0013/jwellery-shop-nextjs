"use server";

import { getAdminClient } from "@/lib/admin/auth";
import type {
  CmsFaq,
  CmsHeroSettings,
  CmsHomepageSections,
  CmsNavLink,
  CmsPage,
  CmsSiteSettings,
  CmsTestimonial,
  CmsTrustFeature,
  CmsVideoSettings,
} from "@/lib/cms/types";
import { createSection } from "@/lib/cms/page-sections";
import type { CmsPageSection } from "@/lib/cms/page-sections";
import {
  getPagePublicPath,
  slugifyPage,
  validatePageSlug,
} from "@/lib/cms/page-utils";
import { cleanText, cleanUrl, sanitizeCmsPage, validateCmsPagePayload } from "@/lib/cms/sanitize";
import { sanitizeCmsSections } from "@/lib/security/sanitize-cms-blocks";
import { revalidatePath } from "next/cache";

function revalidateCmsPage(slug: string) {
  revalidatePath("/admin/cms/pages");
  revalidatePath(`/admin/cms/pages/${slug}`);
  revalidatePath(getPagePublicPath(slug));
  revalidatePath("/", "layout");
}

async function upsertSetting(key: string, value: unknown) {
  const admin = await getAdminClient();
  const { error } = await admin.from("cms_settings").upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}

export async function saveCmsSiteAction(settings: CmsSiteSettings) {
  const result = await upsertSetting("site", settings);
  revalidatePath("/admin/cms/site");
  return result;
}

export async function saveCmsHeroAction(hero: CmsHeroSettings) {
  const result = await upsertSetting("homepage.hero", hero);
  revalidatePath("/admin/cms/homepage");
  return result;
}

export async function saveCmsHomepageSectionsAction(sections: CmsHomepageSections) {
  const result = await upsertSetting("homepage.sections", sections);
  revalidatePath("/admin/cms/homepage");
  return result;
}

export async function saveCmsVideoAction(video: CmsVideoSettings) {
  const result = await upsertSetting("homepage.video", video);
  revalidatePath("/admin/cms/homepage");
  return result;
}

export async function saveCmsTrustFeaturesAction(features: CmsTrustFeature[]) {
  const result = await upsertSetting("trust_features", features);
  revalidatePath("/admin/cms/homepage");
  return result;
}

export async function saveCmsPageAction(page: CmsPage) {
  const validationError = validateCmsPagePayload(page);
  if (validationError) return { error: validationError };

  const safe = sanitizeCmsPage(page);
  const safeBlocks = sanitizeCmsSections(
    (safe.blocks ?? []) as CmsPageSection[]
  );
  const admin = await getAdminClient();
  const { error } = await admin.from("cms_pages").upsert({
    slug: safe.slug,
    title: safe.title,
    eyebrow: safe.eyebrow,
    content: safe.content,
    seo_title: safe.seo_title,
    seo_description: safe.seo_description,
    hero_image: safe.hero_image,
    blocks: safeBlocks,
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: error.message };
  revalidateCmsPage(safe.slug);
  return { success: true };
}

export async function createCmsPageAction(title: string, slugInput?: string) {
  const admin = await getAdminClient();
  const titleTrim = title.trim();
  if (!titleTrim) return { error: "Page title is required." };

  const slug = slugifyPage(slugInput || titleTrim);
  const slugError = validatePageSlug(slug);
  if (slugError) return { error: slugError };

  const { data: existing } = await admin
    .from("cms_pages")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return { error: "A page with this URL already exists." };

  const section = createSection("heading_text");
  section.settings.title = titleTrim;
  section.settings.content = "";

  const { error } = await admin.from("cms_pages").insert({
    slug,
    title: titleTrim,
    eyebrow: null,
    content: "",
    seo_title: `${titleTrim} | Lumière Jewellery`,
    seo_description: "",
    hero_image: null,
    blocks: [section],
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  revalidateCmsPage(slug);
  return { success: true, slug };
}

export async function updateCmsPageMetaAction(
  oldSlug: string,
  data: { title: string; slug: string; seo_title?: string; seo_description?: string }
) {
  const admin = await getAdminClient();
  const title = data.title.trim();
  if (!title) return { error: "Page title is required." };

  const newSlug = slugifyPage(data.slug);
  const slugError = validatePageSlug(newSlug);
  if (slugError) return { error: slugError };

  const { data: page, error: fetchError } = await admin
    .from("cms_pages")
    .select("*")
    .eq("slug", oldSlug)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };
  if (!page) return { error: "Page not found." };

  if (newSlug !== oldSlug) {
    const { data: conflict } = await admin
      .from("cms_pages")
      .select("slug")
      .eq("slug", newSlug)
      .maybeSingle();
    if (conflict) return { error: "A page with this URL already exists." };

    const { error: insertError } = await admin.from("cms_pages").insert({
      slug: newSlug,
      title,
      eyebrow: page.eyebrow,
      content: page.content,
      seo_title: data.seo_title ?? page.seo_title,
      seo_description: data.seo_description ?? page.seo_description,
      hero_image: page.hero_image,
      blocks: page.blocks,
      updated_at: new Date().toISOString(),
    });
    if (insertError) return { error: insertError.message };

    const { error: deleteError } = await admin
      .from("cms_pages")
      .delete()
      .eq("slug", oldSlug);
    if (deleteError) return { error: deleteError.message };

    revalidatePath(`/admin/cms/pages/${oldSlug}`);
    revalidateCmsPage(newSlug);
    return { success: true, slug: newSlug };
  }

  const { error } = await admin
    .from("cms_pages")
    .update({
      title,
      seo_title: data.seo_title ?? page.seo_title,
      seo_description: data.seo_description ?? page.seo_description,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", oldSlug);

  if (error) return { error: error.message };
  revalidateCmsPage(oldSlug);
  return { success: true, slug: oldSlug };
}

export async function deleteCmsPageAction(slug: string) {
  const slugError = validatePageSlug(slug);
  if (slugError) return { error: slugError };

  const admin = await getAdminClient();
  const { error } = await admin.from("cms_pages").delete().eq("slug", slug);
  if (error) return { error: error.message };
  revalidatePath("/admin/cms/pages");
  revalidatePath(getPagePublicPath(slug));
  revalidatePath("/", "layout");
  return { success: true };
}

export async function getCmsPageForEditAction(slug: string) {
  const admin = await getAdminClient();
  const { data, error } = await admin
    .from("cms_pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return { error: error.message, page: null };
  return { page: (data as CmsPage | null) ?? null };
}

export async function saveCmsTestimonialAction(
  testimonial: Omit<CmsTestimonial, "id"> & { id?: string }
) {
  const admin = await getAdminClient();
  const payload = {
    name: testimonial.name,
    role: testimonial.role,
    content: testimonial.content,
    image: testimonial.image,
    rating: testimonial.rating,
    sort_order: testimonial.sort_order,
    is_published: testimonial.is_published,
  };
  const { error } = testimonial.id
    ? await admin.from("cms_testimonials").update(payload).eq("id", testimonial.id)
    : await admin.from("cms_testimonials").insert(payload);
  if (error) return { error: error.message };
  revalidatePath("/admin/cms/testimonials");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCmsTestimonialAction(id: string) {
  const admin = await getAdminClient();
  const { error } = await admin.from("cms_testimonials").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/cms/testimonials");
  revalidatePath("/");
  return { success: true };
}

export async function saveCmsFaqAction(faq: Omit<CmsFaq, "id"> & { id?: string }) {
  const admin = await getAdminClient();
  const payload = {
    question: faq.question,
    answer: faq.answer,
    sort_order: faq.sort_order,
    is_published: faq.is_published,
  };
  const { error } = faq.id
    ? await admin.from("cms_faqs").update(payload).eq("id", faq.id)
    : await admin.from("cms_faqs").insert(payload);
  if (error) return { error: error.message };
  revalidatePath("/admin/cms/faqs");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCmsFaqAction(id: string) {
  const admin = await getAdminClient();
  const { error } = await admin.from("cms_faqs").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/cms/faqs");
  revalidatePath("/");
  return { success: true };
}

export async function saveCmsNavLinksAction(links: CmsNavLink[]) {
  const admin = await getAdminClient();
  for (const link of links) {
    const href = cleanUrl(link.href) ?? link.href.trim();
    if (!href.startsWith("/") && !href.startsWith("http")) {
      return { error: `Invalid link URL: ${link.label}` };
    }
    const { error } = await admin.from("cms_nav_links").upsert({
      id: link.id.startsWith("new-") ? undefined : link.id,
      location: link.location,
      label: cleanText(link.label, 120),
      href,
      sort_order: link.sort_order,
      is_visible: link.is_visible,
    });
    if (error) return { error: error.message };
  }
  revalidatePath("/admin/cms/navigation");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteCmsNavLinkAction(id: string) {
  const admin = await getAdminClient();
  const { error } = await admin.from("cms_nav_links").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/cms/navigation");
  revalidatePath("/", "layout");
  return { success: true };
}
