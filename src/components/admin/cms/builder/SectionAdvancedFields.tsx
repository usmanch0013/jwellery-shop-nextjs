"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_SECTION_ADVANCED,
  getSectionAdvanced,
  type SectionAdvancedSettings,
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

export default function SectionAdvancedFields({
  settings,
  onChange,
}: {
  settings: Record<string, unknown>;
  onChange: (advanced: SectionAdvancedSettings) => void;
}) {
  const advanced = getSectionAdvanced(settings);
  const set = <K extends keyof SectionAdvancedSettings>(key: K, value: SectionAdvancedSettings[K]) =>
    onChange({ ...DEFAULT_SECTION_ADVANCED, ...advanced, [key]: value });

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#6d7882]">
          Custom CSS
        </p>
        <div className="space-y-3">
          <Field label="CSS ID">
            <Input className={fieldClass} value={advanced.cssId} onChange={(e) => set("cssId", e.target.value)} placeholder="my-section" />
          </Field>
          <Field label="CSS Classes">
            <Input className={fieldClass} value={advanced.cssClass} onChange={(e) => set("cssClass", e.target.value)} placeholder="custom-class another-class" />
          </Field>
          <Field label="Z-Index">
            <Input className={fieldClass} type="number" value={advanced.zIndex} onChange={(e) => set("zIndex", e.target.value)} placeholder="auto" />
          </Field>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#6d7882]">
          Responsive
        </p>
        <div className="space-y-2">
          {([
            ["hideOnDesktop", "Hide on Desktop"],
            ["hideOnTablet", "Hide on Tablet"],
            ["hideOnMobile", "Hide on Mobile"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={advanced[key]}
                onChange={(e) => set(key, e.target.checked)}
                className="rounded border-gray-300"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#6d7882]">
          Motion Effects
        </p>
        <Field label="Entrance animation">
          <select
            className={fieldClass}
            value={advanced.animation}
            onChange={(e) => set("animation", e.target.value as SectionAdvancedSettings["animation"])}
          >
            <option value="none">None</option>
            <option value="fade">Fade In</option>
            <option value="slide-up">Slide Up</option>
          </select>
        </Field>
      </div>
    </div>
  );
}
