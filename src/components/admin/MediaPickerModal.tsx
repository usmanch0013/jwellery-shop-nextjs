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
import { addMediaAction, getMediaLibraryAction } from "@/actions/admin/media";
import { cn } from "@/lib/utils";

type MediaPickerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (urls: string[]) => void;
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelected([]);
    setError("");
    setLoading(true);
    getMediaLibraryAction()
      .then((res) => setItems(res.items as DbMediaAsset[]))
      .finally(() => setLoading(false));
  }, [open]);

  function toggleSelect(url: string) {
    if (multiple) {
      setSelected((prev) =>
        prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
      );
    } else {
      setSelected([url]);
    }
  }

  async function handleAddUrl() {
    if (!newUrl.trim()) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.set("url", newUrl.trim());
    const result = await addMediaAction(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setNewUrl("");
      const res = await getMediaLibraryAction();
      setItems(res.items as DbMediaAsset[]);
    }
    setUploading(false);
  }

  function handleConfirm() {
    if (selected.length === 0) return;
    onSelect(selected);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
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

        <div className="space-y-4 px-6 py-4">
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
        </div>

        <div className="min-h-[300px] flex-1 overflow-y-auto px-6 pb-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-muted-foreground text-sm">
              <ImagePlus className="h-8 w-8 mb-2 opacity-50" />
              No media yet. Add an image URL above.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
              {items.map((item) => {
                const isSelected = selected.includes(item.url);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSelect(item.url)}
                    className={cn(
                      "relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
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

        <div className="flex justify-end gap-2 border-t border-border/50 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={selected.length === 0}
          >
            {multiple ? `Use selected (${selected.length})` : "Set image"}
          </Button>
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
        className="relative block w-full aspect-square rounded-xl overflow-hidden border border-border/70 bg-muted"
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
          className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
