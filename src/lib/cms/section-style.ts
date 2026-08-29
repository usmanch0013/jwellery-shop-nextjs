import type { CSSProperties } from "react";

export interface SectionStyleSettings {
  backgroundColor: string;
  textColor: string;
  headingColor: string;
  headingSize: "sm" | "md" | "lg" | "xl";
  textSize: "sm" | "md" | "lg";
  fontFamily: "default" | "serif" | "sans";
  paddingTop: string;
  paddingBottom: string;
  paddingLeft: string;
  paddingRight: string;
  marginTop: string;
  marginBottom: string;
  borderWidth: string;
  borderColor: string;
  borderRadius: string;
}

export interface SectionAdvancedSettings {
  cssId: string;
  cssClass: string;
  zIndex: string;
  hideOnDesktop: boolean;
  hideOnTablet: boolean;
  hideOnMobile: boolean;
  animation: "none" | "fade" | "slide-up";
}

export const DEFAULT_SECTION_STYLE: SectionStyleSettings = {
  backgroundColor: "",
  textColor: "",
  headingColor: "",
  headingSize: "md",
  textSize: "md",
  fontFamily: "default",
  paddingTop: "",
  paddingBottom: "",
  paddingLeft: "",
  paddingRight: "",
  marginTop: "",
  marginBottom: "",
  borderWidth: "",
  borderColor: "#e5e7eb",
  borderRadius: "",
};

export const DEFAULT_SECTION_ADVANCED: SectionAdvancedSettings = {
  cssId: "",
  cssClass: "",
  zIndex: "",
  hideOnDesktop: false,
  hideOnTablet: false,
  hideOnMobile: false,
  animation: "none",
};

export function withSectionLayoutDefaults(
  settings: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...settings,
    style: {
      ...DEFAULT_SECTION_STYLE,
      ...((settings.style as object) ?? {}),
    },
    advanced: {
      ...DEFAULT_SECTION_ADVANCED,
      ...((settings.advanced as object) ?? {}),
    },
  };
}

export function getSectionStyle(
  settings: Record<string, unknown>
): SectionStyleSettings {
  return {
    ...DEFAULT_SECTION_STYLE,
    ...((settings.style as Partial<SectionStyleSettings>) ?? {}),
  };
}

export function getSectionAdvanced(
  settings: Record<string, unknown>
): SectionAdvancedSettings {
  return {
    ...DEFAULT_SECTION_ADVANCED,
    ...((settings.advanced as Partial<SectionAdvancedSettings>) ?? {}),
  };
}

function px(value: string): string | undefined {
  if (!value || value === "0") return undefined;
  return `${value}px`;
}

const HEADING_SIZE_CLASS: Record<SectionStyleSettings["headingSize"], string> = {
  sm: "text-2xl lg:text-3xl",
  md: "text-3xl lg:text-4xl",
  lg: "text-4xl lg:text-5xl",
  xl: "text-5xl lg:text-6xl",
};

const TEXT_SIZE_CLASS: Record<SectionStyleSettings["textSize"], string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

const FONT_FAMILY_CLASS: Record<SectionStyleSettings["fontFamily"], string> = {
  default: "",
  serif: "font-serif",
  sans: "font-sans",
};

export function sectionWrapperStyle(
  settings: Record<string, unknown>
): CSSProperties {
  const s = getSectionStyle(settings);
  const a = getSectionAdvanced(settings);
  return {
    backgroundColor: s.backgroundColor || undefined,
    color: s.textColor || undefined,
    paddingTop: px(s.paddingTop),
    paddingBottom: px(s.paddingBottom),
    paddingLeft: px(s.paddingLeft),
    paddingRight: px(s.paddingRight),
    marginTop: px(s.marginTop),
    marginBottom: px(s.marginBottom),
    borderWidth: s.borderWidth ? `${s.borderWidth}px` : undefined,
    borderColor: s.borderColor || undefined,
    borderStyle: s.borderWidth ? "solid" : undefined,
    borderRadius: px(s.borderRadius),
    zIndex: a.zIndex ? Number(a.zIndex) : undefined,
  };
}

export function sectionWrapperClass(settings: Record<string, unknown>): string {
  const a = getSectionAdvanced(settings);
  const parts: string[] = [];
  if (a.cssClass) parts.push(a.cssClass);
  if (a.hideOnMobile) parts.push("hidden md:block");
  if (a.hideOnTablet) parts.push("block md:hidden lg:block");
  if (a.hideOnDesktop) parts.push("lg:hidden");
  if (a.animation === "fade") parts.push("animate-in fade-in duration-700");
  if (a.animation === "slide-up") parts.push("animate-in slide-in-from-bottom-4 duration-700");
  return parts.filter(Boolean).join(" ");
}

export function headingClass(settings: Record<string, unknown>, extra = ""): string {
  const s = getSectionStyle(settings);
  return [
    HEADING_SIZE_CLASS[s.headingSize],
    FONT_FAMILY_CLASS[s.fontFamily],
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

export function textClass(settings: Record<string, unknown>, extra = ""): string {
  const s = getSectionStyle(settings);
  return [TEXT_SIZE_CLASS[s.textSize], extra].filter(Boolean).join(" ");
}

export function headingInlineStyle(settings: Record<string, unknown>): CSSProperties {
  const s = getSectionStyle(settings);
  return s.headingColor ? { color: s.headingColor } : {};
}

export function textInlineStyle(settings: Record<string, unknown>): CSSProperties {
  const s = getSectionStyle(settings);
  return s.textColor ? { color: s.textColor } : {};
}
