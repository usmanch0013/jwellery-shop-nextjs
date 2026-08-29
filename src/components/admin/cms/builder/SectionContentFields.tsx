"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CmsImageField from "@/components/admin/cms/builder/CmsImageField";
import type { CmsPageSection } from "@/lib/cms/page-sections";

const fieldClass =
  "h-9 rounded-lg border border-[var(--admin-border)] bg-white px-3 text-[13px]";
const textareaClass = `${fieldClass} min-h-[88px] w-full resize-y py-2`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] text-[var(--admin-text-subdued)]">{label}</Label>
      {children}
    </div>
  );
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

type MediaTarget = { sectionId: string; field: string; galleryIndex?: number };

export default function SectionContentFields({
  section,
  settings,
  onChange,
  onOpenMedia,
}: {
  section: CmsPageSection;
  settings: Record<string, unknown>;
  onChange: (settings: Record<string, unknown>) => void;
  onOpenMedia: (target: MediaTarget) => void;
}) {
  const set = (key: string, value: unknown) => onChange({ ...settings, [key]: value });
  const pick = (field: string, galleryIndex?: number) =>
    onOpenMedia({ sectionId: section.id, field, galleryIndex });

  switch (section.type) {
    case "hero":
      return (
        <div className="space-y-3">
          <Field label="Eyebrow"><Input className={fieldClass} value={str(settings.eyebrow)} onChange={(e) => set("eyebrow", e.target.value)} /></Field>
          <Field label="Title"><Input className={fieldClass} value={str(settings.title)} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Description"><textarea className={textareaClass} value={str(settings.content)} onChange={(e) => set("content", e.target.value)} /></Field>
          <CmsImageField value={str(settings.image)} onChange={(v) => set("image", v)} onPick={() => pick("image")} />
          <Field label="Image position">
            <select className={fieldClass} value={str(settings.imagePosition, "right")} onChange={(e) => set("imagePosition", e.target.value)}>
              <option value="right">Right</option><option value="left">Left</option>
            </select>
          </Field>
          <Field label="Button label"><Input className={fieldClass} value={str(settings.ctaLabel)} onChange={(e) => set("ctaLabel", e.target.value)} /></Field>
          <Field label="Button link"><Input className={fieldClass} value={str(settings.ctaHref)} onChange={(e) => set("ctaHref", e.target.value)} /></Field>
        </div>
      );
    case "heading_text":
      return (
        <div className="space-y-3">
          <Field label="Eyebrow"><Input className={fieldClass} value={str(settings.eyebrow)} onChange={(e) => set("eyebrow", e.target.value)} /></Field>
          <Field label="Heading"><Input className={fieldClass} value={str(settings.title)} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Content"><textarea className={textareaClass} value={str(settings.content)} onChange={(e) => set("content", e.target.value)} /></Field>
          <Field label="Alignment">
            <select className={fieldClass} value={str(settings.align, "left")} onChange={(e) => set("align", e.target.value)}>
              <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
            </select>
          </Field>
          <Field label="Width">
            <select className={fieldClass} value={str(settings.width, "narrow")} onChange={(e) => set("width", e.target.value)}>
              <option value="narrow">Narrow</option><option value="wide">Wide</option><option value="full">Full</option>
            </select>
          </Field>
        </div>
      );
    case "text_image":
      return (
        <div className="space-y-3">
          <Field label="Title"><Input className={fieldClass} value={str(settings.title)} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Content"><textarea className={textareaClass} value={str(settings.content)} onChange={(e) => set("content", e.target.value)} /></Field>
          <CmsImageField value={str(settings.image)} onChange={(v) => set("image", v)} onPick={() => pick("image")} />
          <Field label="Image position">
            <select className={fieldClass} value={str(settings.imagePosition, "right")} onChange={(e) => set("imagePosition", e.target.value)}>
              <option value="right">Right</option><option value="left">Left</option>
            </select>
          </Field>
        </div>
      );
    case "features": {
      const items = Array.isArray(settings.items) ? (settings.items as Array<{ title: string; description: string }>) : [];
      return (
        <div className="space-y-3">
          <Field label="Title"><Input className={fieldClass} value={str(settings.title)} onChange={(e) => set("title", e.target.value)} /></Field>
          {items.map((item, i) => (
            <div key={i} className="rounded-lg border p-3 space-y-2 bg-[#fafbfb]">
              <Input className={fieldClass} value={item.title} onChange={(e) => { const n = [...items]; n[i] = { ...item, title: e.target.value }; set("items", n); }} />
              <textarea className={textareaClass} value={item.description} onChange={(e) => { const n = [...items]; n[i] = { ...item, description: e.target.value }; set("items", n); }} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => set("items", [...items, { title: "New", description: "" }])}>+ Add card</Button>
        </div>
      );
    }
    case "cta":
      return (
        <div className="space-y-3">
          <Field label="Title"><Input className={fieldClass} value={str(settings.title)} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Description"><textarea className={textareaClass} value={str(settings.description)} onChange={(e) => set("description", e.target.value)} /></Field>
          <Field label="Button"><Input className={fieldClass} value={str(settings.buttonLabel)} onChange={(e) => set("buttonLabel", e.target.value)} /></Field>
          <Field label="Link"><Input className={fieldClass} value={str(settings.buttonHref)} onChange={(e) => set("buttonHref", e.target.value)} /></Field>
        </div>
      );
    case "image":
      return (
        <div className="space-y-3">
          <CmsImageField label="Image" value={str(settings.src)} onChange={(v) => set("src", v)} onPick={() => pick("src")} />
          <Field label="Alt"><Input className={fieldClass} value={str(settings.alt)} onChange={(e) => set("alt", e.target.value)} /></Field>
          <Field label="Caption"><Input className={fieldClass} value={str(settings.caption)} onChange={(e) => set("caption", e.target.value)} /></Field>
        </div>
      );
    case "button":
      return (
        <div className="space-y-3">
          <Field label="Label"><Input className={fieldClass} value={str(settings.label)} onChange={(e) => set("label", e.target.value)} /></Field>
          <Field label="Link"><Input className={fieldClass} value={str(settings.href)} onChange={(e) => set("href", e.target.value)} /></Field>
          <Field label="Button style">
            <select className={fieldClass} value={str(settings.buttonVariant, "primary")} onChange={(e) => set("buttonVariant", e.target.value)}>
              <option value="primary">Primary</option><option value="outline">Outline</option><option value="dark">Dark</option>
            </select>
          </Field>
          <Field label="Align">
            <select className={fieldClass} value={str(settings.align, "center")} onChange={(e) => set("align", e.target.value)}>
              <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
            </select>
          </Field>
        </div>
      );
    case "video":
      return (
        <div className="space-y-3">
          <Field label="YouTube embed URL"><Input className={fieldClass} value={str(settings.youtubeUrl)} onChange={(e) => set("youtubeUrl", e.target.value)} /></Field>
          <Field label="Title"><Input className={fieldClass} value={str(settings.title)} onChange={(e) => set("title", e.target.value)} /></Field>
        </div>
      );
    case "gallery": {
      const images = Array.isArray(settings.images) ? (settings.images as Array<{ src: string; alt: string }>) : [];
      return (
        <div className="space-y-3">
          <Field label="Title"><Input className={fieldClass} value={str(settings.title)} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Columns">
            <select className={fieldClass} value={String(settings.columns ?? 3)} onChange={(e) => set("columns", Number(e.target.value))}>
              <option value="2">2</option><option value="3">3</option><option value="4">4</option>
            </select>
          </Field>
          {images.map((img, i) => (
            <CmsImageField key={i} label={`Image ${i + 1}`} value={img.src} onChange={(v) => { const n = [...images]; n[i] = { ...img, src: v }; set("images", n); }} onPick={() => pick("gallery", i)} />
          ))}
          <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => set("images", [...images, { src: "", alt: "" }])}>+ Add image</Button>
        </div>
      );
    }
    case "icon_boxes": {
      const items = Array.isArray(settings.items) ? (settings.items as Array<{ icon: string; title: string; description: string }>) : [];
      return (
        <div className="space-y-3">
          <Field label="Title"><Input className={fieldClass} value={str(settings.title)} onChange={(e) => set("title", e.target.value)} /></Field>
          {items.map((item, i) => (
            <div key={i} className="rounded-lg border p-3 space-y-2 bg-[#fafbfb]">
              <Input className={fieldClass} placeholder="Icon" value={item.icon} onChange={(e) => { const n = [...items]; n[i] = { ...item, icon: e.target.value }; set("items", n); }} />
              <Input className={fieldClass} value={item.title} onChange={(e) => { const n = [...items]; n[i] = { ...item, title: e.target.value }; set("items", n); }} />
              <textarea className={textareaClass} value={item.description} onChange={(e) => { const n = [...items]; n[i] = { ...item, description: e.target.value }; set("items", n); }} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => set("items", [...items, { icon: "✦", title: "New", description: "" }])}>+ Add box</Button>
        </div>
      );
    }
    case "columns": {
      const items = Array.isArray(settings.items) ? (settings.items as Array<{ title: string; content: string }>) : [];
      return (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="rounded-lg border p-3 space-y-2 bg-[#fafbfb]">
              <Input className={fieldClass} value={item.title} onChange={(e) => { const n = [...items]; n[i] = { ...item, title: e.target.value }; set("items", n); }} />
              <textarea className={textareaClass} value={item.content} onChange={(e) => { const n = [...items]; n[i] = { ...item, content: e.target.value }; set("items", n); }} />
            </div>
          ))}
        </div>
      );
    }
    case "divider":
      return (
        <Field label="Spacer size">
          <select className={fieldClass} value={str(settings.size, "md")} onChange={(e) => set("size", e.target.value)}>
            <option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option>
          </select>
        </Field>
      );
    default:
      return null;
  }
}

export type { MediaTarget };
