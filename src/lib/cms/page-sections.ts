import type { CmsPage } from "@/lib/cms/types";
import { withSectionLayoutDefaults } from "@/lib/cms/section-style";
import {
  Columns3,
  Grid3x3,
  Heading,
  Image as ImageIcon,
  LayoutTemplate,
  Megaphone,
  MousePointerClick,
  Rows3,
  SeparatorHorizontal,
  Sparkles,
  SquareStack,
  Type,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type CmsSectionType =
  | "hero"
  | "heading_text"
  | "text_image"
  | "features"
  | "cta"
  | "image"
  | "columns"
  | "divider"
  | "button"
  | "video"
  | "gallery"
  | "icon_boxes";

export interface CmsPageSection {
  id: string;
  type: CmsSectionType;
  settings: Record<string, unknown>;
}

export type WidgetCatalogItem = {
  type: CmsSectionType;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const WIDGET_CATEGORIES: Array<{
  name: string;
  widgets: WidgetCatalogItem[];
}> = [
  {
    name: "Layout",
    widgets: [
      { type: "columns", label: "Columns", description: "Multi-column layout", icon: Columns3 },
      { type: "hero", label: "Hero", description: "Full-width banner section", icon: LayoutTemplate },
      { type: "divider", label: "Spacer", description: "Add vertical spacing", icon: SeparatorHorizontal },
    ],
  },
  {
    name: "Basic",
    widgets: [
      { type: "heading_text", label: "Heading", description: "Title and text block", icon: Heading },
      { type: "heading_text", label: "Text Editor", description: "Rich paragraph block", icon: Type },
      { type: "image", label: "Image", description: "Single image", icon: ImageIcon },
      { type: "video", label: "Video", description: "YouTube embed", icon: Video },
      { type: "button", label: "Button", description: "CTA button", icon: MousePointerClick },
      { type: "divider", label: "Divider", description: "Horizontal spacer", icon: SeparatorHorizontal },
    ],
  },
  {
    name: "General",
    widgets: [
      { type: "gallery", label: "Image Gallery", description: "Photo grid", icon: Grid3x3 },
      { type: "text_image", label: "Image Box", description: "Image with text", icon: SquareStack },
      { type: "icon_boxes", label: "Icon Box", description: "Icon + title box", icon: Sparkles },
      { type: "features", label: "Icon List", description: "Feature cards grid", icon: Rows3 },
      { type: "cta", label: "Call to Action", description: "Promo banner", icon: Megaphone },
    ],
  },
];

/** Flat list for backwards compatibility */
export const SECTION_CATALOG = WIDGET_CATEGORIES.flatMap((c) => c.widgets);

function newId() {
  return `sec_${Math.random().toString(36).slice(2, 10)}`;
}

export function createSection(type: CmsSectionType): CmsPageSection {
  const defaults: Record<CmsSectionType, Record<string, unknown>> = {
    hero: {
      eyebrow: "Our Story",
      title: "Crafting Timeless Beauty",
      content: "Write your hero description here.",
      image: "",
      imagePosition: "right",
      ctaLabel: "Shop now",
      ctaHref: "/shop",
      align: "left",
    },
    heading_text: {
      eyebrow: "",
      title: "Section heading",
      content: "Add your paragraph text here.",
      align: "left",
      width: "narrow",
    },
    text_image: {
      eyebrow: "",
      title: "Section title",
      content: "Describe your story or product here.",
      image: "",
      imagePosition: "right",
      bg: "white",
    },
    features: {
      title: "Why choose us",
      subtitle: "",
      columns: 3,
      items: [
        { title: "Premium quality", description: "Crafted with care and detail." },
        { title: "Fast delivery", description: "Nationwide shipping across Pakistan." },
        { title: "Trusted brand", description: "Thousands of happy customers." },
      ],
    },
    cta: {
      title: "Ready to explore?",
      description: "Discover our latest jewellery collections.",
      buttonLabel: "Shop collection",
      buttonHref: "/shop",
      tone: "dark",
    },
    image: {
      src: "",
      alt: "",
      caption: "",
      fullWidth: false,
    },
    columns: {
      items: [
        { title: "Column one", content: "First column content." },
        { title: "Column two", content: "Second column content." },
        { title: "Column three", content: "Third column content." },
      ],
    },
    divider: { size: "md" },
    button: {
      label: "Shop now",
      href: "/shop",
      buttonVariant: "primary",
      align: "center",
      size: "md",
    },
    video: {
      youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      title: "",
      poster: "",
    },
    gallery: {
      title: "",
      columns: 3,
      images: [] as Array<{ src: string; alt: string }>,
    },
    icon_boxes: {
      title: "Our values",
      columns: 3,
      items: [
        { icon: "✦", title: "Quality", description: "Premium finishing on every piece." },
        { icon: "♡", title: "Care", description: "Dedicated customer support." },
        { icon: "★", title: "Trust", description: "Trusted since 2009." },
      ],
    },
  };

  return { id: newId(), type, settings: withSectionLayoutDefaults(defaults[type]) };
}

function isLegacyBlock(
  block: unknown
): block is { title: string; description: string } {
  return (
    !!block &&
    typeof block === "object" &&
    "title" in block &&
    "description" in block &&
    !("type" in block)
  );
}

function isPageSection(block: unknown): block is CmsPageSection {
  return (
    !!block &&
    typeof block === "object" &&
    "id" in block &&
    "type" in block &&
    "settings" in block
  );
}

export function normalizePageSections(page: CmsPage): CmsPageSection[] {
  const raw = page.blocks ?? [];

  if (raw.length > 0 && isPageSection(raw[0])) {
    return raw as CmsPageSection[];
  }

  const sections: CmsPageSection[] = [];

  if (page.title || page.content || page.hero_image || page.eyebrow) {
    sections.push({
      id: newId(),
      type: "hero",
      settings: {
        eyebrow: page.eyebrow ?? "",
        title: page.title,
        content: page.content,
        image: page.hero_image ?? "",
        imagePosition: "right",
        ctaLabel: "",
        ctaHref: "",
        align: "left",
      },
    });
  }

  if (raw.length > 0 && isLegacyBlock(raw[0])) {
    sections.push({
      id: newId(),
      type: "features",
      settings: {
        title: "",
        subtitle: "",
        columns: 3,
        items: (raw as Array<{ title: string; description: string }>).map(
          (item) => ({
            title: item.title,
            description: item.description,
          })
        ),
      },
    });
  }

  if (sections.length === 0) {
    sections.push(createSection("heading_text"));
  }

  return sections;
}

export function pageFromSections(
  page: CmsPage,
  sections: CmsPageSection[]
): CmsPage {
  const hero = sections.find((s) => s.type === "hero");
  const heroSettings = hero?.settings as {
    eyebrow?: string;
    title?: string;
    content?: string;
    image?: string;
  };

  return {
    ...page,
    eyebrow: heroSettings?.eyebrow ?? page.eyebrow,
    content: heroSettings?.content || page.content,
    hero_image: heroSettings?.image || page.hero_image,
    blocks: sections,
  };
}

export function sectionLabel(section: CmsPageSection): string {
  const s = section.settings;
  switch (section.type) {
    case "hero":
      return (s.title as string) || "Hero";
    case "heading_text":
      return (s.title as string) || "Heading";
    case "text_image":
      return (s.title as string) || "Image Box";
    case "features":
      return (s.title as string) || "Icon Boxes";
    case "cta":
      return (s.title as string) || "Call to Action";
    case "image":
      return (s.caption as string) || (s.alt as string) || "Image";
    case "columns":
      return "Columns";
    case "divider":
      return "Spacer";
    case "button":
      return (s.label as string) || "Button";
    case "video":
      return (s.title as string) || "Video";
    case "gallery":
      return (s.title as string) || "Gallery";
    case "icon_boxes":
      return (s.title as string) || "Info boxes";
    default:
      return section.type;
  }
}

export function widgetMeta(type: CmsSectionType): WidgetCatalogItem | undefined {
  return SECTION_CATALOG.find((w) => w.type === type);
}
