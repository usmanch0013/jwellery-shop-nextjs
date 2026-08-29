"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_SECTION_STYLE,
  getSectionStyle,
  type SectionStyleSettings,
} from "@/lib/cms/section-style";

const fieldClass =
  "h-9 rounded-lg border border-[var(--admin-border)] bg-white px-3 text-[13px]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] text-[var(--admin-text-subdued)]">{label}</Label>
      {children}
    </div>
  );
}

function ColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      <input
        type="color"
        value={value || "#ffffff"}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-10 cursor-pointer rounded border border-[var(--admin-border)] bg-white p-0.5"
      />
      <Input
        className={fieldClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#ffffff or transparent"
      />
    </div>
  );
}

function SpacingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <Input
          className={fieldClass}
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
        />
        <span className="text-[11px] text-[var(--admin-text-subdued)]">px</span>
      </div>
    </Field>
  );
}

export default function SectionStyleFields({
  settings,
  onChange,
}: {
  settings: Record<string, unknown>;
  onChange: (style: SectionStyleSettings) => void;
}) {
  const style = getSectionStyle(settings);
  const set = <K extends keyof SectionStyleSettings>(key: K, value: SectionStyleSettings[K]) =>
    onChange({ ...DEFAULT_SECTION_STYLE, ...style, [key]: value });

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#6d7882]">
          Background
        </p>
        <ColorInput value={style.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#6d7882]">
          Typography
        </p>
        <div className="space-y-3">
          <Field label="Heading color">
            <ColorInput value={style.headingColor} onChange={(v) => set("headingColor", v)} />
          </Field>
          <Field label="Text color">
            <ColorInput value={style.textColor} onChange={(v) => set("textColor", v)} />
          </Field>
          <Field label="Heading size">
            <select className={fieldClass} value={style.headingSize} onChange={(e) => set("headingSize", e.target.value as SectionStyleSettings["headingSize"])}>
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra large</option>
            </select>
          </Field>
          <Field label="Text size">
            <select className={fieldClass} value={style.textSize} onChange={(e) => set("textSize", e.target.value as SectionStyleSettings["textSize"])}>
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </Field>
          <Field label="Font family">
            <select className={fieldClass} value={style.fontFamily} onChange={(e) => set("fontFamily", e.target.value as SectionStyleSettings["fontFamily"])}>
              <option value="default">Default</option>
              <option value="serif">Serif</option>
              <option value="sans">Sans-serif</option>
            </select>
          </Field>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#6d7882]">
          Spacing
        </p>
        <div className="grid grid-cols-2 gap-2">
          <SpacingInput label="Padding top" value={style.paddingTop} onChange={(v) => set("paddingTop", v)} />
          <SpacingInput label="Padding bottom" value={style.paddingBottom} onChange={(v) => set("paddingBottom", v)} />
          <SpacingInput label="Padding left" value={style.paddingLeft} onChange={(v) => set("paddingLeft", v)} />
          <SpacingInput label="Padding right" value={style.paddingRight} onChange={(v) => set("paddingRight", v)} />
          <SpacingInput label="Margin top" value={style.marginTop} onChange={(v) => set("marginTop", v)} />
          <SpacingInput label="Margin bottom" value={style.marginBottom} onChange={(v) => set("marginBottom", v)} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#6d7882]">
          Border
        </p>
        <div className="space-y-3">
          <SpacingInput label="Border width" value={style.borderWidth} onChange={(v) => set("borderWidth", v)} />
          <Field label="Border color">
            <ColorInput value={style.borderColor} onChange={(v) => set("borderColor", v)} />
          </Field>
          <SpacingInput label="Border radius" value={style.borderRadius} onChange={(v) => set("borderRadius", v)} />
        </div>
      </div>
    </div>
  );
}
