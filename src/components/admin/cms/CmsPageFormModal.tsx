"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createCmsPageAction,
  deleteCmsPageAction,
  updateCmsPageMetaAction,
} from "@/actions/admin/cms";
import type { CmsPage } from "@/lib/cms/types";
import { getPagePublicPath, slugifyPage } from "@/lib/cms/page-utils";

type PageFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  page?: CmsPage;
  onSuccess?: (result: { slug: string; title: string }) => void;
};

export function CmsPageFormModal({
  open,
  onOpenChange,
  mode,
  page,
  onSuccess,
}: PageFormModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setSlugTouched(false);
    if (mode === "edit" && page) {
      setTitle(page.title);
      setSlug(page.slug);
      setSeoTitle(page.seo_title ?? "");
      setSeoDescription(page.seo_description ?? "");
    } else {
      setTitle("");
      setSlug("");
      setSeoTitle("");
      setSeoDescription("");
    }
  }, [open, mode, page]);

  useEffect(() => {
    if (mode === "create" && !slugTouched && title) {
      setSlug(slugifyPage(title));
    }
  }, [title, mode, slugTouched]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "create") {
      const result = await createCmsPageAction(title, slug);
      setLoading(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      onSuccess?.({ slug: result.slug!, title: title.trim() });
      router.push(`/admin/cms/pages/${result.slug}`);
      router.refresh();
      return;
    }

    if (!page) return;
    const result = await updateCmsPageMetaAction(page.slug, {
      title,
      slug,
      seo_title: seoTitle,
      seo_description: seoDescription,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onOpenChange(false);
    onSuccess?.({ slug: result.slug!, title: title.trim() });
    if (result.slug !== page.slug) {
      router.replace(`/admin/cms/pages/${result.slug}`);
    }
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Page" : "Page Settings"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Page title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. About Us"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>URL slug</Label>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>/</span>
              <Input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugifyPage(e.target.value));
                }}
                placeholder="about-us"
                required
              />
            </div>
            {slug && (
              <p className="text-[11px] text-muted-foreground">
                Live URL: {getPagePublicPath(slug)}
              </p>
            )}
          </div>
          {mode === "edit" && (
            <>
              <div className="space-y-2">
                <Label>SEO title</Label>
                <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>SEO description</Label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="flex min-h-[72px] w-full rounded-lg border border-input px-2.5 py-2 text-sm"
                />
              </div>
            </>
          )}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#2271b1] hover:bg-[#135e96]">
              {loading ? "Saving..." : mode === "create" ? "Create Page" : "Save Settings"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CmsPageDeleteDialog({
  open,
  onOpenChange,
  page,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: CmsPage | null;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!page) return;
    setLoading(true);
    setError("");
    const result = await deleteCmsPageAction(page.slug);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onOpenChange(false);
    onDeleted?.();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete page?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          <strong>{page?.title}</strong> will be permanently deleted. This cannot be undone.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={loading} onClick={handleDelete}>
            {loading ? "Deleting..." : "Delete Page"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
