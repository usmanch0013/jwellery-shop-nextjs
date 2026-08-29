"use client";

import { useState } from "react";
import type { CmsPageSection } from "@/lib/cms/page-sections";
import { widgetMeta } from "@/lib/cms/page-sections";
import type { SectionAdvancedSettings, SectionStyleSettings } from "@/lib/cms/section-style";
import { withSectionLayoutDefaults } from "@/lib/cms/section-style";
import SectionContentFields, { type MediaTarget } from "@/components/admin/cms/builder/SectionContentFields";
import SectionStyleFields from "@/components/admin/cms/builder/SectionStyleFields";
import SectionAdvancedFields from "@/components/admin/cms/builder/SectionAdvancedFields";
import { cn } from "@/lib/utils";

type Tab = "content" | "style" | "advanced";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "content", label: "Content" },
  { id: "style", label: "Style" },
  { id: "advanced", label: "Advanced" },
];

export default function SectionProperties({
  section,
  onChange,
  onOpenMedia,
}: {
  section: CmsPageSection;
  onChange: (settings: Record<string, unknown>) => void;
  onOpenMedia: (target: MediaTarget) => void;
}) {
  const [tab, setTab] = useState<Tab>("content");
  const settings = withSectionLayoutDefaults(section.settings);
  const meta = widgetMeta(section.type);

  const update = (patch: Record<string, unknown>) =>
    onChange({ ...settings, ...patch });

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#d5dadf] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6d7882]">
          Edit {meta?.label ?? section.type}
        </p>
      </div>

      <div className="flex border-b border-[#d5dadf]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 py-2.5 text-[11px] font-medium transition-colors",
              tab === t.id
                ? "border-b-2 border-[#d0046e] text-[#d0046e]"
                : "text-[#6d7882] hover:text-[#495157]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "content" && (
          <SectionContentFields
            section={section}
            settings={settings}
            onChange={update}
            onOpenMedia={onOpenMedia}
          />
        )}
        {tab === "style" && (
          <SectionStyleFields
            settings={settings}
            onChange={(style: SectionStyleSettings) => update({ style })}
          />
        )}
        {tab === "advanced" && (
          <SectionAdvancedFields
            settings={settings}
            onChange={(advanced: SectionAdvancedSettings) => update({ advanced })}
          />
        )}
      </div>
    </div>
  );
}

export type { MediaTarget };
