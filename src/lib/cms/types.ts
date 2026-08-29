import type { CmsPageSection } from "@/lib/cms/page-sections";

export interface CmsSiteSettings {
  brandName: string;
  tagline: string;
  footerDescription: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  seoTitle: string;
  seoDescription: string;
  topBarText: string;
  marqueeText: string;
}

export interface CmsHeroSettings {
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  description: string;
  backgroundImage: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  scrollHint: string;
  sceneHint: string;
}

export interface CmsPromoBanner {
  label: string;
  href: string;
  bgColor: "champagne" | "primary";
}

export interface CmsHomepageSections {
  seoBlock: { title: string; body: string };
  collectionsTitle: string;
  promoBanners: CmsPromoBanner[];
  showcaseTitles: Record<string, string>;
  testimonials: { badge: string; title: string; backgroundImage: string };
  faq: { title: string; subtitle: string };
}

export interface CmsVideoSettings {
  backgroundVideo: string;
  posterImage: string;
  youtubeUrl: string;
  features: Array<{ title: string; icon: string }>;
}

export interface CmsTrustFeature {
  icon: string;
  title: string;
  description: string;
}

export interface CmsTestimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  image: string | null;
  rating: number;
  sort_order: number;
  is_published: boolean;
}

export interface CmsFaq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_published: boolean;
}

export interface CmsNavLink {
  id: string;
  location: "header" | "footer_useful" | "footer_legal";
  label: string;
  href: string;
  sort_order: number;
  is_visible: boolean;
}

export interface CmsPage {
  slug: string;
  title: string;
  eyebrow: string | null;
  content: string;
  seo_title: string | null;
  seo_description: string | null;
  hero_image: string | null;
  blocks: CmsPageSection[] | Array<{ title: string; description: string }>;
  updated_at?: string | null;
}

export interface CmsBundle {
  site: CmsSiteSettings;
  hero: CmsHeroSettings;
  homepage: CmsHomepageSections;
  video: CmsVideoSettings;
  trustFeatures: CmsTrustFeature[];
  testimonials: CmsTestimonial[];
  faqs: CmsFaq[];
  headerNav: CmsNavLink[];
  footerUsefulLinks: CmsNavLink[];
  footerLegalLinks: CmsNavLink[];
}
