"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ExternalLink, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DbMediaAsset } from "@/lib/database.types";
import {
  addMediaAction,
  getMediaLibraryAction,
  updateMediaAction,
  uploadMediaFileAction,
} from "@/actions/admin/media";
import { cn } from "@/lib/utils";

export type MediaPick = { url: string; altText?: string | null; id?: string };

type MediaPickerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (urls: string[], picks?: MediaPick[]) => void;
  multiple?: boolean;
  title?: string;
};

export function MediaPickerModal({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  title = "Media library",
}: MediaPickerModalProps) {
  const [items, setItems] = useState<DbMediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [uploadAlt, setUploadAlt] = useState("");
  const [selectedAlt, setSelectedAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState("");

  const selectedItem = items.find((item) => item.url === selected[0]);

  useEffect(() => {
    if (!open) return;
    setSelected([]);
    setSelectedAlt("");
    setUploadAlt("");
    setError("");
    setLoading(true);
    getMediaLibraryAction()
      .then((res) => setItems(res.items as DbMediaAsset[]))
      .finally(() => setLoading(false));
  }, [open]);

  function toggleSelect(item: DbMediaAsset) {
    if (multiple) {
      setSelected((prev) =>
        prev.includes(item.url)
          ? prev.filter((u) => u !== item.url)
          : [...prev, item.url]
      );
    } else {
      setSelected([item.url]);
      setSelectedAlt(item.alt_text ?? item.title ?? "");
    }
  }

  async function handleAddUrl() {
    if (!newUrl.trim()) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.set("url", newUrl.trim());
    if (uploadAlt.trim()) formData.set("altText", uploadAlt.trim());
    const result = await addMediaAction(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setNewUrl("");
      const res = await getMediaLibraryAction();
      setItems(res.items as DbMediaAsset[]);
      if (res.items[0]) {
        setSelected([res.items[0].url]);
        setSelectedAlt(res.items[0].alt_text ?? uploadAlt);
      }
    }
    setUploading(false);
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = [...files];
    if (list.length === 0) return;
    setUploadingFile(true);
    setError("");
    let uploaded = 0;
    for (const file of list) {
      const formData = new FormData();
      formData.set("file", file);
      if (uploadAlt.trim()) formData.set("altText", uploadAlt.trim());
      const result = await uploadMediaFileAction(formData);
      if (result.error) {
        setError(result.error);
        break;
      }
      uploaded += 1;
    }
    if (uploaded > 0) {
      const res = await getMediaLibraryAction();
      setItems(res.items as DbMediaAsset[]);
      if (!multiple && res.items[0]) {
        setSelected([res.items[0].url]);
        setSelectedAlt(res.items[0].alt_text ?? uploadAlt);
      }
    }
    setUploadingFile(false);
  }

  async function handleConfirm(urls = selected, alt = selectedAlt) {
    if (urls.length === 0) return;

    const primary = items.find((item) => item.url === urls[0]);
    if (!multiple && primary && alt !== (primary.alt_text ?? "")) {
      const formData = new FormData();
      formData.set("title", primary.title ?? "");
      formData.set("altText", alt.trim());
      await updateMediaAction(primary.id, formData);
    }

    const picks: MediaPick[] = urls.map((url) => {
      const item = items.find((i) => i.url === url);
      return {
        url,
        id: item?.id,
        altText: url === urls[0] ? alt.trim() : item?.alt_text,
      };
    });

    onSelect(urls, picks);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(90vh,760px)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between gap-3 pr-8">
            <DialogTitle>{title}</DialogTitle>
            <Link
              href="/admin/media"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5"
              )}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Media library
            </Link>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
              }}
              className="rounded-xl border-2 border-dashed border-border/70 bg-muted/20 p-4 text-center"
            >
              <Upload className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
              <p className="text-sm font-medium">Drop images here or upload</p>
              <p className="mt-1 text-xs text-muted-foreground">
                JPG, PNG, WebP, GIF — up to 10MB
              </p>
              <div className="mx-auto mt-3 max-w-md space-y-2 text-left">
                <Label className="text-xs">Alt text (optional)</Label>
                <Input
                  value={uploadAlt}
                  onChange={(e) => setUploadAlt(e.target.value)}
                  placeholder="Describe the image for SEO and accessibility"
                />
              </div>
              <label className="mt-3 inline-block">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  multiple={multiple}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) uploadFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <span
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "mt-1 inline-flex cursor-pointer"
                  )}
                >
                  {uploadingFile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                  Browse files
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label className="text-sm">Add image by URL</Label>
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddUrl}
                disabled={uploading || !newUrl.trim()}
                className="shrink-0"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Add to library
              </Button>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            {loading ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-sm text-muted-foreground">
                <ImagePlus className="mb-2 h-8 w-8 opacity-50" />
                No media yet. Upload an image or add a URL.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {items.map((item) => {
                  const isSelected = selected.includes(item.url);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleSelect(item)}
                      onDoubleClick={() => {
                        const urls = multiple
                          ? selected.includes(item.url)
                            ? selected
                            : [...selected, item.url]
                          : [item.url];
                        const alt = item.alt_text ?? item.title ?? "";
                        setSelected(urls);
                        setSelectedAlt(alt);
                        void handleConfirm(urls, alt);
                      }}
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-xl border-2 transition-all",
                        isSelected
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-transparent hover:border-border"
                      )}
                    >
                      <Image
                        src={item.url}
                        alt={item.alt_text ?? item.title ?? "Media"}
                        fill
                        className="object-cover"
                        sizes="120px"
                        unoptimized
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 space-y-3 border-t border-border/50 bg-background px-6 py-4">
          {selectedItem && !multiple && (
            <div className="space-y-1.5">
              <Label className="text-xs">Alt text for selected image</Label>
              <Input
                value={selectedAlt}
                onChange={(e) => setSelectedAlt(e.target.value)}
                placeholder="Gold necklace on model"
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={selected.length === 0}
            >
              {multiple ? `Use selected (${selected.length})` : "Set image"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type MediaThumbProps = {
  url: string;
  onRemove?: () => void;
  onClick?: () => void;
  label?: string;
};

export function MediaThumb({ url, onRemove, onClick, label }: MediaThumbProps) {
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        className="relative block aspect-square w-full overflow-hidden rounded-xl border border-border/70 bg-muted"
      >
        <Image
          src={url}
          alt={label ?? "Product image"}
          fill
          className="object-cover"
          sizes="120px"
          unoptimized
        />
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
