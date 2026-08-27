"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  ImagePlus,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminCard } from "@/components/admin/AdminShell";
import type { DbMediaAsset } from "@/lib/database.types";
import {
  addMediaAction,
  deleteMediaAction,
  getMediaLibraryAction,
  syncProductMediaAction,
  updateMediaAction,
  uploadMediaFileAction,
} from "@/actions/admin/media";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SOURCE_LABELS: Record<string, string> = {
  product: "From product",
  upload: "Uploaded",
  url: "External URL",
  manual: "Manual",
};

function resolveSource(item: DbMediaAsset): string {
  if (item.source && SOURCE_LABELS[item.source]) {
    return SOURCE_LABELS[item.source];
  }
  if (item.url.includes("/storage/v1/object/public/media/")) return "Uploaded";
  if (
    item.title?.includes("(hover)") ||
    item.title?.includes("(gallery)") ||
    item.title?.includes("(category)")
  ) {
    return "From product";
  }
  return "External URL";
}

export default function MediaLibraryClient({
  initialItems,
}: {
  initialItems: DbMediaAsset[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState(initialItems);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<DbMediaAsset | null>(null);
  const [copied, setCopied] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editAlt, setEditAlt] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const haystack = [
        item.title,
        item.file_name,
        item.url,
        item.alt_text,
        item.source,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, search]);

  async function refreshLibrary() {
    const res = await getMediaLibraryAction();
    if (res.items) setItems(res.items as DbMediaAsset[]);
    if (res.error) setError(res.error);
  }

  async function handleAddUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.set("url", url.trim());
    if (title.trim()) formData.set("title", title.trim());
    const result = await addMediaAction(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setUrl("");
      setTitle("");
      await refreshLibrary();
      toast.success("Image added to library");
    }
    setLoading(false);
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = [...files];
    if (list.length === 0) return;

    setUploading(true);
    setError("");

    let uploaded = 0;
    for (const file of list) {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadMediaFileAction(formData);
      if (result.error) {
        setError(result.error);
        break;
      }
      uploaded += 1;
    }

    if (uploaded > 0) {
      await refreshLibrary();
      toast.success(
        uploaded === 1 ? "Image uploaded" : `${uploaded} images uploaded`
      );
    }

    setUploading(false);
  }

  async function handleSync() {
    setSyncing(true);
    setError("");
    const result = await syncProductMediaAction();
    if (result.error) {
      setError(result.error);
    } else {
      await refreshLibrary();
      toast.success(
        result.imported
          ? `Imported ${result.imported} image${result.imported === 1 ? "" : "s"} from products`
          : "All product images are already in the library"
      );
    }
    setSyncing(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this media item from the library?")) return;
    setDeletingId(id);
    const result = await deleteMediaAction(id);
    if (result.error) {
      setError(result.error);
    } else {
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success("Media deleted");
    }
    setDeletingId(null);
  }

  function openDetails(item: DbMediaAsset) {
    setSelected(item);
    setEditTitle(item.title ?? "");
    setEditAlt(item.alt_text ?? "");
    setCopied(false);
  }

  async function copyUrl(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("URL copied");
    setTimeout(() => setCopied(false), 2000);
  }

  async function saveDetails() {
    if (!selected) return;
    setSavingMeta(true);
    const formData = new FormData();
    formData.set("title", editTitle);
    formData.set("altText", editAlt);
    const result = await updateMediaAction(selected.id, formData);
    if (result.error) {
      setError(result.error);
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === selected.id
            ? { ...item, title: editTitle || null, alt_text: editAlt || null }
            : item
        )
      );
      setSelected((prev) =>
        prev
          ? { ...prev, title: editTitle || null, alt_text: editAlt || null }
          : prev
      );
      toast.success("Details saved");
    }
    setSavingMeta(false);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-6">
        {error && (
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>
        )}

        <AdminCard
          title="Upload files"
          description="Drag & drop images or choose files from your computer (WordPress style)"
        >
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.length) {
                uploadFiles(e.dataTransfer.files);
              }
            }}
            className={cn(
              "rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border/70 bg-muted/20"
            )}
          >
            <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium text-foreground">
              Drop images here to upload
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              JPG, PNG, WebP, GIF, AVIF — up to 10MB each
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="mr-2 h-4 w-4" />
                )}
                Select files
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Sync from products
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) uploadFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
        </AdminCard>

        <AdminCard
          title="Add from URL"
          description="Import an external image link into your media library"
        >
          <form onSubmit={handleAddUrl} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label>Title (optional)</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ring close-up"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={loading || !url.trim()}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Add to library
              </Button>
            </div>
          </form>
        </AdminCard>

        <AdminCard
          title="Media library"
          description={`${filtered.length} of ${items.length} items`}
          padding={false}
        >
          <div className="border-b border-border/50 p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search media..."
                className="pl-9"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              <ImagePlus className="mx-auto mb-3 h-10 w-10 opacity-40" />
              {items.length === 0
                ? "No media yet. Upload files or sync from your existing products."
                : "No media matches your search."}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openDetails(item)}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border bg-muted aspect-square text-left transition-all hover:ring-2 hover:ring-primary/30",
                    selected?.id === item.id
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border/60"
                  )}
                >
                  <Image
                    src={item.url}
                    alt={item.alt_text ?? item.title ?? "Media"}
                    fill
                    className="object-cover"
                    sizes="180px"
                    unoptimized
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="truncate text-xs text-white">
                      {item.title || item.file_name || "Untitled"}
                    </p>
                  </div>
                  <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] text-white">
                    {resolveSource(item)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </AdminCard>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
        <AdminCard title="Attachment details">
          {selected ? (
            <div className="space-y-4">
              <div className="relative mx-auto aspect-square max-w-[220px] overflow-hidden rounded-xl border border-border/60 bg-muted">
                <Image
                  src={selected.url}
                  alt={selected.alt_text ?? selected.title ?? "Selected media"}
                  fill
                  className="object-cover"
                  sizes="220px"
                  unoptimized
                />
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Alt text</Label>
                <Input
                  value={editAlt}
                  onChange={(e) => setEditAlt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>File URL</Label>
                <div className="flex gap-2">
                  <Input value={selected.url} readOnly className="text-xs" />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyUrl(selected.url)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Added{" "}
                {new Date(selected.created_at).toLocaleDateString("en-PK", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>

              <div className="flex flex-col gap-2 pt-2">
                <Button onClick={saveDetails} disabled={savingMeta}>
                  {savingMeta ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save details
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="text-red-600"
                  onClick={() => handleDelete(selected.id)}
                  disabled={deletingId === selected.id}
                >
                  {deletingId === selected.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete permanently
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select an image from the library to view details, copy URL, or edit
              title and alt text.
            </p>
          )}
        </AdminCard>
      </aside>
    </div>
  );
}
