"use client";

import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaThumb } from "@/components/admin/MediaPickerModal";

type CmsImageFieldProps = {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  onPick: () => void;
  fieldClass?: string;
};

export default function CmsImageField({
  label = "Image",
  value,
  onChange,
  onPick,
  fieldClass = "h-9 rounded-lg border border-[var(--admin-border)] bg-white px-3 text-[13px]",
}: CmsImageFieldProps) {
  return (
    <div className="space-y-2">
      <p className="text-[12px] text-[var(--admin-text-subdued)]">{label}</p>
      {value ? (
        <div className="max-w-[140px]">
          <MediaThumb url={value} onClick={onPick} onRemove={() => onChange("")} />
        </div>
      ) : (
        <button
          type="button"
          onClick={onPick}
          className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[var(--admin-border)] bg-[#fafbfb] text-[12px] text-[var(--admin-text-subdued)] hover:border-[#92003b] hover:text-[#92003b]"
        >
          <ImagePlus className="h-5 w-5" />
          Upload / Select
        </button>
      )}
      <Input
        className={fieldClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste image URL..."
      />
      <Button type="button" variant="outline" size="sm" className="h-8 w-full text-[12px]" onClick={onPick}>
        Choose from library
      </Button>
    </div>
  );
}
