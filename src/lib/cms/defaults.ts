import type {
  CmsHeroSettings,
  CmsHomepageSections,
  CmsSiteSettings,
  CmsTrustFeature,
  CmsVideoSettings,
} from "@/lib/cms/types";

export const DEFAULT_SITE: CmsSiteSettings = {
  brandName: "Lumière.pk",
  tagline: "Pakistan's award winning artificial jewellery brand",
  footerDescription:
    "Pakistan's award winning artificial jewellery brand. Premium quality pieces for every occasion since 2009.",
  email: "hello@lumiere.pk",
  phone: "+92 300 0000000",
  address: "Lahore, Punjab, Pakistan",
  hours: "Mon–Sat: 10AM – 8PM",
  seoTitle: "Artificial Jewellery in Pakistan | Lumière Jewellery",
  seoDescription:
    "Pakistan's award winning artificial jewellery brand. Shop necklace sets, earrings, bangles, bridal sets and more.",
  topBarText: "Worldwide Shipping",
  marqueeText: "Pakistan's 1st award winning Artificial Jewellery brand",
};

export const DEFAULT_HERO: CmsHeroSettings = {
  eyebrow: "Pakistan's Award Winning Brand",
  headlineLine1: "Jewels That Celebrate",
  headlineLine2: "Togetherness.",
  description:
    "Discover handcrafted artificial jewellery — necklace sets, bridal pieces, earrings & more. Crafted for every celebration.",
  backgroundImage: "/hero-jewellery-poster.jpg",
  backgroundVideo: "/hero-jewellery.mp4",
  primaryCtaLabel: "Shop Collection",
  primaryCtaHref: "/shop",
  secondaryCtaLabel: "New Arrivals",
  secondaryCtaHref: "/shop?filter=new",
  scrollHint: "Scroll",
  sceneHint: "",
};

export const DEFAULT_HOMEPAGE: CmsHomepageSections = {
  seoBlock: {
    title: "Artificial Jewellery in Pakistan",
    body: "We as the growing and customer's favourite Artificial Jewellery Brand in Pakistan have a huge collection of precious jewels made from highest grade of materials and attention to detail.",
  },
  collectionsTitle: "Our Collections",
  promoBanners: [
    { label: "Under 1000", href: "/shop?max=1000", bgColor: "champagne" },
    { label: "Under 2000", href: "/shop?max=2000", bgColor: "primary" },
  ],
  showcaseTitles: {
    "necklace-sets": "Necklace Sets",
    earrings: "Earrings",
    "most-loved": "Our Most Loved Products",
    "best-selling": "Best selling products",
    bracelet: "Bracelet",
    "bridal-sets": "Bridal Jewellery Sets",
    "new-arrivals": "What's New",
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
  backgroundVideo: "/intro-video.mp4",
  posterImage: "/intro-video-poster.png",
  youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  features: [
    { title: "Jewellery Exchanges", icon: "exchange" },
    { title: "The Purity Guarantee", icon: "scale" },
    { title: "Complete Transparent", icon: "diamond" },
    { title: "Lifetime Maintenance", icon: "maintenance" },
  ],
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
  { label: "Best selling products", href: "/shop?filter=bestseller" },
  { label: "New Arrivals", href: "/shop?filter=new" },
  { label: "Collections", href: "/shop" },
  { label: "Track Order", href: "/track-order" },
  { label: "Client Reviews", href: "/#reviews" },
];

export const DEFAULT_FOOTER_USEFUL = [
  { label: "Track Your Order", href: "/track-order" },
  { label: "How To Order?", href: "/shipping-policy" },
  { label: "Shipping Rates", href: "/shipping-policy" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "FAQs", href: "/#faq" },
];

export const DEFAULT_FOOTER_LEGAL = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Shipping Policy", href: "/shipping-policy" },
];

export const DEFAULT_CMS_PAGES = [
  {
    slug: "about",
    title: "About Us",
    eyebrow: "Our Story",
    content: "",
    seo_title: "About Us | Lumière Jewellery",
    seo_description: "Learn about Lumière jewellery.",
    hero_image: null,
    blocks: [],
  },
  {
    slug: "terms",
    title: "Terms of Service",
    eyebrow: null,
    content: "By using Lumière Jewellery website, you agree to these terms.",
    seo_title: "Terms of Service | Lumière Jewellery",
    seo_description: "Terms of service.",
    hero_image: null,
    blocks: [],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    eyebrow: null,
    content: "Lumière Jewellery respects your privacy.",
    seo_title: "Privacy Policy | Lumière Jewellery",
    seo_description: "Privacy policy.",
    hero_image: null,
    blocks: [],
  },
  {
    slug: "refund-policy",
    title: "Refund Policy",
    eyebrow: null,
    content: "Our refund and return policy.",
    seo_title: "Refund Policy | Lumière Jewellery",
    seo_description: "Refund policy.",
    hero_image: null,
    blocks: [],
  },
  {
    slug: "shipping-policy",
    title: "Shipping Policy",
    eyebrow: null,
    content: "Shipping rates and delivery information.",
    seo_title: "Shipping Policy | Lumière Jewellery",
    seo_description: "Shipping policy.",
    hero_image: null,
    blocks: [],
  },
  {
    slug: "contact",
    title: "Contact Us",
    eyebrow: "Get in Touch",
    content: "We would love to hear from you.",
    seo_title: "Contact | Lumière Jewellery",
    seo_description: "Contact support.",
    hero_image: null,
    blocks: [],
  },
] as const;
