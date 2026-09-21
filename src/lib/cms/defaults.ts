import type {
  CmsHeroSettings,
  CmsHomepageSections,
  CmsSiteSettings,
  CmsTrustFeature,
  CmsVideoSettings,
  CmsPromoPopup,
} from "@/lib/cms/types";
import { LEGAL_PAGES } from "@/lib/cms/legal-content";
import { ABOUT_PAGE_CONTENT, ABOUT_PAGE_SEO } from "@/lib/cms/about-content";
import { BRAND } from "@/lib/brand";

export const DEFAULT_SITE: CmsSiteSettings = {
  brandName: BRAND.name,
  tagline: BRAND.tagline,
  footerDescription:
    `Contemporary artificial jewellery from Pakistan since ${BRAND.foundedYear}. ${BRAND.promise} Shop at ${BRAND.domain}.`,
  email: BRAND.email,
  phone: BRAND.phone,
  address: BRAND.address,
  hours: "Mon–Sat: 10AM – 8PM",
  seoTitle: `Artificial Jewellery in Pakistan | ${BRAND.name}`,
  seoDescription:
    `Shop sleek artificial jewellery at ${BRAND.domain} — necklace sets, earrings, bangles & occasion wear. ${BRAND.tagline}`,
  topBarText: "Nationwide & International Shipping",
  marqueeText: `${BRAND.name} — Elegant Design · Trusted Quality · Contemporary Art`,
};

export const DEFAULT_HERO: CmsHeroSettings = {
  eyebrow: `${BRAND.name} · Since ${BRAND.foundedYear}`,
  headlineLine1: "Elegant Artificial Jewellery",
  headlineLine2: "For Every Occasion",
  description:
    "Necklace sets, earrings, bangles & bridal pieces with contemporary design and premium finishing — trusted Pakistani style since 2017. Wear Your Art.",
  backgroundImage: "/she-hero-poster.jpg",
  backgroundVideo: "/she-hero.mp4",
  primaryCtaLabel: "Shop Collection",
  primaryCtaHref: "/shop",
  secondaryCtaLabel: "New Arrivals",
  secondaryCtaHref: "/shop?filter=new",
  scrollHint: "Scroll",
  sceneHint: "",
};

export const DEFAULT_HOMEPAGE: CmsHomepageSections = {
  seoBlock: {
    title: "Artificial Jewellery in Pakistan | SHE Collection",
    body: `SHE Collection (${BRAND.domain}) is a trusted Pakistani artificial jewellery brand since ${BRAND.foundedYear}. Explore contemporary necklace sets, earrings, bangles, and statement pieces crafted with high-quality finishing for casual and formal wear.`,
  },
  collectionsTitle: "Our Collections",
  promoBanners: [
    { label: "Under 1000", href: "/shop?max=1000", bgColor: "champagne" },
    { label: "Under 2000", href: "/shop?max=2000", bgColor: "primary" },
  ],
  showcaseTitles: {
    "bridal-sets": "Bridal",
    "necklace-sets": "Necklace",
    bracelet: "Bracelets",
    "new-arrivals": "New Arrivals",
    earrings: "Earrings",
    "best-selling": "Best Selling Products",
    featured: "Featured Products",
  },
  testimonials: {
    badge: "• TESTIMONIALS",
    title: "Trusted Reviews From Jewellery Style Enthusiasts",
    backgroundImage: "/testimonial-bg-cignet.jpg",
  },
  faq: {
    title: "Frequently Asked Question",
    subtitle:
      "Find answers to common questions about our jewellery, shipping, and ordering process.",
  },
};

export const DEFAULT_VIDEO: CmsVideoSettings = {
  backgroundVideo: "/hero-jewellery.mp4",
  posterImage: "/hero-jewellery-poster.jpg",
  youtubeUrl: "",
  features: [
    { title: "Contemporary Designs", icon: "diamond" },
    { title: "Premium Finishing", icon: "scale" },
    { title: "Nationwide Delivery", icon: "exchange" },
    { title: "Trusted Since 2017", icon: "maintenance" },
  ],
};

export const DEFAULT_PROMO_POPUP: CmsPromoPopup = {
  enabled: true,
  version: "1",
  badge: "Limited Sale",
  title: "Today’s Pick",
  subtitle: "Special offer on selected jewellery",
  productName: "Bridal Necklace Set",
  discountText: "15% OFF",
  description:
    "Elegant artificial jewellery with premium finishing — perfect for weddings & parties. Update this popup anytime from Admin → Homepage.",
  imageUrl: "/she-hero-poster.jpg",
  ctaLabel: "Shop this deal",
  ctaHref: "/shop?filter=sale",
  dismissDays: 1,
};

export const DEFAULT_TRUST_FEATURES: CmsTrustFeature[] = [
  {
    icon: "globe",
    title: "SHIPPING WORLDWIDE",
    description: "We are shipping all over the world.",
  },
  {
    icon: "shield",
    title: "100% PREMIUM",
    description: "All of our products are of high quality.",
  },
  {
    icon: "credit-card",
    title: "SECURE PAYMENT",
    description: "All of your payments are secure with us.",
  },
];

export const DEFAULT_HEADER_NAV = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Best Sellers", href: "/shop?filter=bestseller" },
  { label: "New Arrivals", href: "/shop?filter=new" },
  { label: "Collections", href: "/#collections" },
  { label: "Blog", href: "/blog" },
  { label: "Track", href: "/track-order" },
  { label: "Reviews", href: "/#reviews" },
];

export const DEFAULT_FOOTER_USEFUL = [
  { label: "Track Your Order", href: "/track-order" },
  { label: "How To Order?", href: "/shipping-policy" },
  { label: "Shipping Rates", href: "/shipping-policy" },
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
  { label: "FAQs", href: "/#faq" },
];

export const DEFAULT_FOOTER_LEGAL = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
];

export const DEFAULT_CMS_PAGES = [
  {
    slug: "about",
    title: "About SHE Collection",
    eyebrow: "Our Story",
    content: ABOUT_PAGE_CONTENT,
    seo_title: ABOUT_PAGE_SEO.title,
    seo_description: ABOUT_PAGE_SEO.description,
    hero_image: null,
    blocks: [],
  },
  {
    slug: "terms",
    title: LEGAL_PAGES.terms.title,
    eyebrow: LEGAL_PAGES.terms.eyebrow,
    content: LEGAL_PAGES.terms.content,
    seo_title: LEGAL_PAGES.terms.seo_title,
    seo_description: LEGAL_PAGES.terms.seo_description,
    hero_image: null,
    blocks: [],
  },
  {
    slug: "privacy",
    title: LEGAL_PAGES.privacy.title,
    eyebrow: LEGAL_PAGES.privacy.eyebrow,
    content: LEGAL_PAGES.privacy.content,
    seo_title: LEGAL_PAGES.privacy.seo_title,
    seo_description: LEGAL_PAGES.privacy.seo_description,
    hero_image: null,
    blocks: [],
  },
  {
    slug: "refund-policy",
    title: LEGAL_PAGES["refund-policy"].title,
    eyebrow: LEGAL_PAGES["refund-policy"].eyebrow,
    content: LEGAL_PAGES["refund-policy"].content,
    seo_title: LEGAL_PAGES["refund-policy"].seo_title,
    seo_description: LEGAL_PAGES["refund-policy"].seo_description,
    hero_image: null,
    blocks: [],
  },
  {
    slug: "shipping-policy",
    title: LEGAL_PAGES["shipping-policy"].title,
    eyebrow: LEGAL_PAGES["shipping-policy"].eyebrow,
    content: LEGAL_PAGES["shipping-policy"].content,
    seo_title: LEGAL_PAGES["shipping-policy"].seo_title,
    seo_description: LEGAL_PAGES["shipping-policy"].seo_description,
    hero_image: null,
    blocks: [],
  },
  {
    slug: "cookie-policy",
    title: LEGAL_PAGES["cookie-policy"].title,
    eyebrow: LEGAL_PAGES["cookie-policy"].eyebrow,
    content: LEGAL_PAGES["cookie-policy"].content,
    seo_title: LEGAL_PAGES["cookie-policy"].seo_title,
    seo_description: LEGAL_PAGES["cookie-policy"].seo_description,
    hero_image: null,
    blocks: [],
  },
  {
    slug: "contact",
    title: "Contact Us",
    eyebrow: "Get in Touch",
    content: "We would love to hear from you.",
    seo_title: `Contact | ${BRAND.name}`,
    seo_description: `Contact ${BRAND.name} at ${BRAND.email} — orders, shipping, and product questions.`,
    hero_image: null,
    blocks: [],
  },
] as const;
