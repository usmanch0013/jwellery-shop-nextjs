import Image from "next/image";
import Link from "next/link";
import type { CmsPageSection } from "@/lib/cms/page-sections";
import SectionWrapper from "@/components/cms/SectionWrapper";
import {
  headingClass,
  headingInlineStyle,
  textClass,
  textInlineStyle,
} from "@/lib/cms/section-style";

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function HeroSection({ settings }: { settings: Record<string, unknown> }) {
  const imagePosition = str(settings.imagePosition, "right");
  const hasImage = !!str(settings.image);

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 gap-12 lg:gap-16 items-center ${
            hasImage ? "lg:grid-cols-2" : ""
          }`}
        >
          <div
            className={
              imagePosition === "left" && hasImage ? "lg:order-2" : ""
            }
          >
            {str(settings.eyebrow) && (
              <p className="text-gold uppercase tracking-[0.3em] text-sm mb-4">
                {str(settings.eyebrow)}
              </p>
            )}
            <h1
              className={`${headingClass(settings, "font-semibold mb-6")}`}
              style={headingInlineStyle(settings)}
            >
              {str(settings.title, "Page title")}
            </h1>
            {str(settings.content) && (
              <p
                className={`${textClass(settings, "leading-relaxed whitespace-pre-line")} text-muted-foreground`}
                style={textInlineStyle(settings)}
              >
                {str(settings.content)}
              </p>
            )}
            {str(settings.ctaLabel) && str(settings.ctaHref) && (
              <Link
                href={str(settings.ctaHref)}
                className="inline-flex mt-8 px-6 py-3 bg-primary text-white text-sm uppercase tracking-wider rounded-lg hover:bg-emerald-dark transition-colors"
              >
                {str(settings.ctaLabel)}
              </Link>
            )}
          </div>
          {hasImage && (
            <div
              className={`relative aspect-[4/5] rounded-lg overflow-hidden ${
                imagePosition === "left" ? "lg:order-1" : ""
              }`}
            >
              <Image
                src={str(settings.image)}
                alt={str(settings.title, "Hero image")}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function HeadingTextSection({ settings }: { settings: Record<string, unknown> }) {
  const width = str(settings.width, "narrow");
  const maxClass =
    width === "full"
      ? "max-w-7xl"
      : width === "wide"
        ? "max-w-5xl"
        : "max-w-3xl";
  const align = str(settings.align, "left");
  const alignClass =
    align === "center"
      ? "text-center mx-auto"
      : align === "right"
        ? "text-right ml-auto"
        : "";

  return (
    <section className="py-10 lg:py-14">
      <div className={`${maxClass} mx-auto px-4 sm:px-6 lg:px-8 ${alignClass}`}>
        {str(settings.eyebrow) && (
          <p className="text-gold uppercase tracking-[0.3em] text-sm mb-4">
            {str(settings.eyebrow)}
          </p>
        )}
        {str(settings.title) && (
          <h2
            className={`${headingClass(settings, "font-serif mb-5")}`}
            style={headingInlineStyle(settings)}
          >
            {str(settings.title)}
          </h2>
        )}
        {str(settings.content) && (
          <div
            className={`${textClass(settings, "leading-relaxed whitespace-pre-line")} text-muted-foreground`}
            style={textInlineStyle(settings)}
          >
            {str(settings.content)}
          </div>
        )}
      </div>
    </section>
  );
}

function TextImageSection({ settings }: { settings: Record<string, unknown> }) {
  const imageLeft = str(settings.imagePosition, "right") === "left";
  const bg = str(settings.bg, "white");
  const hasImage = !!str(settings.image);

  return (
    <section
      className={`py-12 lg:py-16 ${bg === "muted" ? "bg-muted/40" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 gap-10 lg:gap-16 items-center ${
            hasImage ? "lg:grid-cols-2" : ""
          }`}
        >
          <div className={imageLeft && hasImage ? "lg:order-2" : ""}>
            {str(settings.eyebrow) && (
              <p className="text-gold uppercase tracking-[0.3em] text-sm mb-3">
                {str(settings.eyebrow)}
              </p>
            )}
            <h2 className="font-serif text-2xl lg:text-3xl mb-4">
              {str(settings.title)}
            </h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {str(settings.content)}
            </p>
          </div>
          {hasImage && (
            <div
              className={`relative aspect-[4/3] rounded-lg overflow-hidden ${
                imageLeft ? "lg:order-1" : ""
              }`}
            >
              <Image
                src={str(settings.image)}
                alt={str(settings.title, "Section image")}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection({ settings }: { settings: Record<string, unknown> }) {
  const items = Array.isArray(settings.items)
    ? (settings.items as Array<{ title: string; description: string }>)
    : [];
  const columns = Number(settings.columns) || 3;
  const gridClass =
    columns === 2
      ? "md:grid-cols-2"
      : columns === 4
        ? "md:grid-cols-2 lg:grid-cols-4"
        : "md:grid-cols-3";

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(str(settings.title) || str(settings.subtitle)) && (
          <div className="text-center mb-10 max-w-2xl mx-auto">
            {str(settings.title) && (
              <h2 className="font-serif text-3xl mb-3">{str(settings.title)}</h2>
            )}
            {str(settings.subtitle) && (
              <p className="text-muted-foreground text-sm">
                {str(settings.subtitle)}
              </p>
            )}
          </div>
        )}
        <div className={`grid grid-cols-1 gap-6 ${gridClass}`}>
          {items.map((item) => (
            <div
              key={item.title}
              className="p-8 border border-border rounded-lg text-center"
            >
              <h3 className="font-serif text-xl mb-3">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection({ settings }: { settings: Record<string, unknown> }) {
  const dark = str(settings.tone, "dark") === "dark";

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`rounded-2xl px-8 py-12 text-center ${
            dark ? "bg-[#1a1a1a] text-white" : "bg-gold/10"
          }`}
        >
          <h2 className="font-serif text-3xl mb-4">{str(settings.title)}</h2>
          {str(settings.description) && (
            <p
              className={`mb-8 max-w-xl mx-auto ${
                dark ? "text-white/80" : "text-muted-foreground"
              }`}
            >
              {str(settings.description)}
            </p>
          )}
          {str(settings.buttonLabel) && str(settings.buttonHref) && (
            <Link
              href={str(settings.buttonHref)}
              className={`inline-flex px-6 py-3 text-sm uppercase tracking-wider rounded-lg transition-colors ${
                dark
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-primary text-white hover:bg-emerald-dark"
              }`}
            >
              {str(settings.buttonLabel)}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function ImageSection({ settings }: { settings: Record<string, unknown> }) {
  if (!str(settings.src)) return null;
  const fullWidth = settings.fullWidth === true;

  return (
    <section className={`py-8 ${fullWidth ? "" : "max-w-5xl mx-auto px-4"}`}>
      <div
        className={`relative overflow-hidden rounded-lg ${
          fullWidth ? "aspect-[21/9]" : "aspect-video"
        }`}
      >
        <Image
          src={str(settings.src)}
          alt={str(settings.alt, "Image")}
          fill
          className="object-cover"
        />
      </div>
      {str(settings.caption) && (
        <p className="text-center text-sm text-muted-foreground mt-3 px-4">
          {str(settings.caption)}
        </p>
      )}
    </section>
  );
}

function ColumnsSection({ settings }: { settings: Record<string, unknown> }) {
  const items = Array.isArray(settings.items)
    ? (settings.items as Array<{ title: string; content: string }>)
    : [];

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.title} className="space-y-3">
              <h3 className="font-serif text-xl">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DividerSection({ settings }: { settings: Record<string, unknown> }) {
  const size = str(settings.size, "md");
  const height =
    size === "sm" ? "h-6" : size === "lg" ? "h-24" : "h-12";
  return <div className={height} aria-hidden />;
}

function ButtonSection({ settings }: { settings: Record<string, unknown> }) {
  const align = str(settings.align, "center");
  const variant = str(settings.buttonVariant, "primary");
  const size = str(settings.size, "md");
  const alignClass =
    align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center";
  const sizeClass = size === "sm" ? "px-4 py-2 text-xs" : size === "lg" ? "px-8 py-4 text-base" : "px-6 py-3 text-sm";
  const styleClass =
    variant === "outline"
      ? "border-2 border-primary text-primary bg-transparent hover:bg-primary/5"
      : variant === "dark"
        ? "bg-[#1a1a1a] text-white hover:bg-black"
        : "bg-primary text-white hover:bg-emerald-dark";

  return (
    <section className={`py-8 ${alignClass}`}>
      <div className="max-w-7xl mx-auto px-4">
        <Link
          href={str(settings.href, "/shop")}
          className={`inline-flex uppercase tracking-wider rounded-lg transition-colors ${sizeClass} ${styleClass}`}
        >
          {str(settings.label, "Button")}
        </Link>
      </div>
    </section>
  );
}

function VideoSection({ settings }: { settings: Record<string, unknown> }) {
  const url = str(settings.youtubeUrl);
  if (!url) return null;
  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-4xl mx-auto px-4">
        {str(settings.title) && (
          <h2 className="font-serif text-3xl text-center mb-8">{str(settings.title)}</h2>
        )}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
          <iframe
            src={url}
            title={str(settings.title, "Video")}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

function GallerySection({ settings }: { settings: Record<string, unknown> }) {
  const images = Array.isArray(settings.images)
    ? (settings.images as Array<{ src: string; alt: string }>)
    : [];
  const columns = Number(settings.columns) || 3;
  const gridClass =
    columns === 2 ? "grid-cols-2" : columns === 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-3";

  if (!images.length) return null;

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4">
        {str(settings.title) && (
          <h2 className="font-serif text-3xl text-center mb-10">{str(settings.title)}</h2>
        )}
        <div className={`grid gap-4 ${gridClass}`}>
          {images.map((img, i) => (
            <div key={`${img.src}-${i}`} className="relative aspect-square rounded-lg overflow-hidden">
              <Image src={img.src} alt={img.alt || "Gallery image"} fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IconBoxesSection({ settings }: { settings: Record<string, unknown> }) {
  const items = Array.isArray(settings.items)
    ? (settings.items as Array<{ icon: string; title: string; description: string }>)
    : [];
  const columns = Number(settings.columns) || 3;
  const gridClass = columns === 2 ? "md:grid-cols-2" : columns === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3";

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4">
        {str(settings.title) && (
          <h2 className="font-serif text-3xl text-center mb-10">{str(settings.title)}</h2>
        )}
        <div className={`grid grid-cols-1 gap-6 ${gridClass}`}>
          {items.map((item) => (
            <div key={item.title} className="text-center p-6 rounded-xl border border-border">
              <div className="text-3xl mb-3 text-gold">{item.icon}</div>
              <h3 className="font-serif text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderSection(section: CmsPageSection) {
  const { settings, type, id } = section;
  let inner: React.ReactNode = null;
  switch (type) {
    case "hero":
      inner = <HeroSection settings={settings} />;
      break;
    case "heading_text":
      inner = <HeadingTextSection settings={settings} />;
      break;
    case "text_image":
      inner = <TextImageSection settings={settings} />;
      break;
    case "features":
      inner = <FeaturesSection settings={settings} />;
      break;
    case "cta":
      inner = <CtaSection settings={settings} />;
      break;
    case "image":
      inner = <ImageSection settings={settings} />;
      break;
    case "columns":
      inner = <ColumnsSection settings={settings} />;
      break;
    case "divider":
      inner = <DividerSection settings={settings} />;
      break;
    case "button":
      inner = <ButtonSection settings={settings} />;
      break;
    case "video":
      inner = <VideoSection settings={settings} />;
      break;
    case "gallery":
      inner = <GallerySection settings={settings} />;
      break;
    case "icon_boxes":
      inner = <IconBoxesSection settings={settings} />;
      break;
    default:
      return null;
  }
  return (
    <SectionWrapper key={id} settings={settings}>
      {inner}
    </SectionWrapper>
  );
}

export default function CmsPageSections({
  sections,
  preview = false,
}: {
  sections: CmsPageSection[];
  preview?: boolean;
}) {
  return (
    <div className={preview ? "pointer-events-none" : ""}>
      {sections.map((section) => renderSection(section))}
    </div>
  );
}
