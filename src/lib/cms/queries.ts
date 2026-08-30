import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  getPublicCmsClient,
  getCmsAdminReadClient,
} from "@/lib/cms/public-client";
import {
  DEFAULT_CMS_PAGES,
  DEFAULT_FOOTER_LEGAL,
  DEFAULT_FOOTER_USEFUL,
  DEFAULT_HEADER_NAV,
  DEFAULT_HERO,
  DEFAULT_HOMEPAGE,
  DEFAULT_SITE,
  DEFAULT_TRUST_FEATURES,
  DEFAULT_VIDEO,
} from "@/lib/cms/defaults";
import type {
  CmsBundle,
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
import {
  SITE_PAGE_REGISTRY,
  adminEditHref,
  registryEntryForSlug,
  type SitePageSource,
} from "@/lib/cms/page-registry";
import { getPagePublicPath } from "@/lib/cms/page-utils";
import { faqs as defaultFaqs, testimonials as defaultTestimonials } from "@/data/site";

export interface AdminSitePageRow {
  slug: string;
  title: string;
  path: string;
  source: SitePageSource;
  updated_at: string | null;
  canUseBuilder: boolean;
  canDelete: boolean;
  editHref: string | null;
  description?: string;
}

function merge<T>(defaults: T, value: unknown): T {
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaults;
  return { ...defaults, ...(value as Partial<T>) };
}

async function getSetting<T>(key: string, defaults: T): Promise<T> {
  if (!isSupabaseConfigured()) return defaults;
  try {
    const client = (await getPublicCmsClient()) ?? getCmsAdminReadClient();
    if (!client) return defaults;
    const { data } = await client
      .from("cms_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    return merge(defaults, data?.value);
  } catch {
    return defaults;
  }
}

export async function getCmsSiteSettings(): Promise<CmsSiteSettings> {
  return getSetting("site", DEFAULT_SITE);
}

export async function getCmsHero(): Promise<CmsHeroSettings> {
  return getSetting("homepage.hero", DEFAULT_HERO);
}

export async function getCmsHomepageSections(): Promise<CmsHomepageSections> {
  const saved = await getSetting("homepage.sections", DEFAULT_HOMEPAGE);
  return {
    ...DEFAULT_HOMEPAGE,
    ...saved,
    seoBlock: { ...DEFAULT_HOMEPAGE.seoBlock, ...saved.seoBlock },
    showcaseTitles: {
      ...saved.showcaseTitles,
      ...DEFAULT_HOMEPAGE.showcaseTitles,
    },
    testimonials: { ...DEFAULT_HOMEPAGE.testimonials, ...saved.testimonials },
    faq: { ...DEFAULT_HOMEPAGE.faq, ...saved.faq },
  };
}

export async function getCmsVideo(): Promise<CmsVideoSettings> {
  return getSetting("homepage.video", DEFAULT_VIDEO);
}

export async function getCmsTrustFeatures(): Promise<CmsTrustFeature[]> {
  const value = await getSetting("trust_features", DEFAULT_TRUST_FEATURES);
  return Array.isArray(value) ? value : DEFAULT_TRUST_FEATURES;
}

export async function getCmsTestimonials(): Promise<CmsTestimonial[]> {
  if (!isSupabaseConfigured()) {
    return defaultTestimonials.map((t, i) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      content: t.content,
      image: t.image,
      rating: t.rating,
      sort_order: i + 1,
      is_published: true,
    }));
  }
  try {
    const client = (await getPublicCmsClient()) ?? getCmsAdminReadClient();
    if (!client) throw new Error("no client");
    const { data } = await client
      .from("cms_testimonials")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!data?.length) {
      return defaultTestimonials.map((t, i) => ({
        id: t.id,
        name: t.name,
        role: t.role,
        content: t.content,
        image: t.image,
        rating: t.rating,
        sort_order: i + 1,
        is_published: true,
      }));
    }
    return data as CmsTestimonial[];
  } catch {
    return defaultTestimonials.map((t, i) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      content: t.content,
      image: t.image,
      rating: t.rating,
      sort_order: i + 1,
      is_published: true,
    }));
  }
}

export async function getCmsFaqs(): Promise<CmsFaq[]> {
  if (!isSupabaseConfigured()) {
    return defaultFaqs.map((f, i) => ({
      id: String(i),
      question: f.q,
      answer: f.a,
      sort_order: i + 1,
      is_published: true,
    }));
  }
  try {
    const client = (await getPublicCmsClient()) ?? getCmsAdminReadClient();
    if (!client) throw new Error("no client");
    const { data } = await client
      .from("cms_faqs")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!data?.length) {
      return defaultFaqs.map((f, i) => ({
        id: String(i),
        question: f.q,
        answer: f.a,
        sort_order: i + 1,
        is_published: true,
      }));
    }
    return data as CmsFaq[];
  } catch {
    return defaultFaqs.map((f, i) => ({
      id: String(i),
      question: f.q,
      answer: f.a,
      sort_order: i + 1,
      is_published: true,
    }));
  }
}

export async function getCmsNavLinks(
  location: CmsNavLink["location"]
): Promise<CmsNavLink[]> {
  const fallback =
    location === "header"
      ? DEFAULT_HEADER_NAV
      : location === "footer_useful"
        ? DEFAULT_FOOTER_USEFUL
        : DEFAULT_FOOTER_LEGAL;

  if (!isSupabaseConfigured()) {
    return fallback.map((l, i) => ({
      id: `${location}-${i}`,
      location,
      label: l.label,
      href: l.href,
      sort_order: i + 1,
      is_visible: true,
    }));
  }
  try {
    const client = (await getPublicCmsClient()) ?? getCmsAdminReadClient();
    if (!client) throw new Error("no client");
    const { data } = await client
      .from("cms_nav_links")
      .select("*")
      .eq("location", location)
      .eq("is_visible", true)
      .order("sort_order", { ascending: true });
    if (!data?.length) {
      return fallback.map((l, i) => ({
        id: `${location}-${i}`,
        location,
        label: l.label,
        href: l.href,
        sort_order: i + 1,
        is_visible: true,
      }));
    }
    return data as CmsNavLink[];
  } catch {
    return fallback.map((l, i) => ({
      id: `${location}-${i}`,
      location,
      label: l.label,
      href: l.href,
      sort_order: i + 1,
      is_visible: true,
    }));
  }
}

/** Admin navigation editor — includes hidden links */
export async function getAdminCmsNavLinks(
  location: CmsNavLink["location"]
): Promise<CmsNavLink[]> {
  const visible = await getCmsNavLinks(location);
  if (!isSupabaseConfigured()) return visible;

  try {
    const admin = getCmsAdminReadClient();
    if (!admin) return visible;
    const { data } = await admin
      .from("cms_nav_links")
      .select("*")
      .eq("location", location)
      .order("sort_order", { ascending: true });
    if (!data?.length) return visible;
    return data as CmsNavLink[];
  } catch {
    return visible;
  }
}

export async function getCmsPage(slug: string): Promise<CmsPage | null> {
  if (!isSupabaseConfigured()) {
    const fallback = DEFAULT_CMS_PAGES.find((p) => p.slug === slug);
    return fallback ? ({ ...fallback, blocks: [...fallback.blocks] } as CmsPage) : null;
  }
  try {
    const client = (await getPublicCmsClient()) ?? getCmsAdminReadClient();
    if (!client) return null;
    const { data } = await client
      .from("cms_pages")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (data) return data as CmsPage;
    const fallback = DEFAULT_CMS_PAGES.find((p) => p.slug === slug);
    return fallback ? ({ ...fallback, blocks: [...fallback.blocks] } as CmsPage) : null;
  } catch {
    const fallback = DEFAULT_CMS_PAGES.find((p) => p.slug === slug);
    return fallback ? ({ ...fallback, blocks: [...fallback.blocks] } as CmsPage) : null;
  }
}

export async function getCmsPages(): Promise<CmsPage[]> {
  if (!isSupabaseConfigured()) {
    return [...DEFAULT_CMS_PAGES] as unknown as CmsPage[];
  }
  try {
    const client = (await getPublicCmsClient()) ?? getCmsAdminReadClient();
    if (!client) return [...DEFAULT_CMS_PAGES] as unknown as CmsPage[];
    const { data } = await client
      .from("cms_pages")
      .select("*")
      .order("updated_at", { ascending: false });
    if (!data?.length) {
      return [...DEFAULT_CMS_PAGES] as unknown as CmsPage[];
    }
    return data as CmsPage[];
  } catch {
    return [...DEFAULT_CMS_PAGES] as unknown as CmsPage[];
  }
}

export async function getAdminSitePagesList(): Promise<AdminSitePageRow[]> {
  const cmsPages = await getCmsPages();
  const cmsBySlug = new Map(cmsPages.map((p) => [p.slug, p]));
  const rows: AdminSitePageRow[] = [];
  const seen = new Set<string>();

  for (const entry of SITE_PAGE_REGISTRY) {
    if (!entry.showInAdmin) continue;
    seen.add(entry.slug);
    const cms = cmsBySlug.get(entry.slug);
    rows.push({
      slug: entry.slug,
      title: cms?.title ?? entry.title,
      path: entry.path,
      source: entry.source,
      updated_at: cms?.updated_at ?? null,
      canUseBuilder: entry.source === "builder" || entry.source === "hybrid",
      canDelete: false,
      editHref: adminEditHref(entry),
      description: entry.description,
    });
  }

  for (const page of cmsPages) {
    if (seen.has(page.slug)) continue;
    const reg = registryEntryForSlug(page.slug);
    const source: SitePageSource = reg?.source ?? "builder";
    rows.push({
      slug: page.slug,
      title: page.title,
      path: getPagePublicPath(page.slug),
      source,
      updated_at: page.updated_at ?? null,
      canUseBuilder: source === "builder" || source === "hybrid",
      canDelete: source === "builder",
      editHref: `/admin/cms/pages/${page.slug}`,
      description: reg?.description,
    });
    seen.add(page.slug);
  }

  rows.sort((a, b) => {
    const order: Record<SitePageSource, number> = {
      homepage: 0,
      hybrid: 1,
      builder: 2,
      coded: 3,
      system: 4,
    };
    const diff = order[a.source] - order[b.source];
    if (diff !== 0) return diff;
    return a.title.localeCompare(b.title);
  });

  return rows;
}

export async function getCmsBundle(): Promise<CmsBundle> {
  const [
    site,
    hero,
    homepage,
    video,
    trustFeatures,
    testimonials,
    faqs,
    headerNav,
    footerUsefulLinks,
    footerLegalLinks,
  ] = await Promise.all([
    getCmsSiteSettings(),
    getCmsHero(),
    getCmsHomepageSections(),
    getCmsVideo(),
    getCmsTrustFeatures(),
    getCmsTestimonials(),
    getCmsFaqs(),
    getCmsNavLinks("header"),
    getCmsNavLinks("footer_useful"),
    getCmsNavLinks("footer_legal"),
  ]);

  return {
    site,
    hero,
    homepage,
    video,
    trustFeatures,
    testimonials: testimonials.filter((t) => t.is_published),
    faqs: faqs.filter((f) => f.is_published),
    headerNav,
    footerUsefulLinks,
    footerLegalLinks,
  };
}
