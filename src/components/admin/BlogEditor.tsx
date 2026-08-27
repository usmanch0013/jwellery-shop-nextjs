"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ExternalLink, ImageIcon, Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminCard } from "@/components/admin/AdminShell";
import {
  MediaPickerModal,
  MediaThumb,
} from "@/components/admin/MediaPickerModal";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type {
  AdminBlogPostDetails,
  DbBlogCategory,
  DbBlogTag,
} from "@/lib/database.types";
import {
  createBlogCategoryAction,
  createBlogPostAction,
  createBlogTagAction,
  deleteBlogPostAction,
  updateBlogPostAction,
} from "@/actions/admin/blogs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const inputClass =
  "w-full h-10 rounded-xl border border-border/70 bg-background px-3 text-sm";

type Tab = "content" | "seo";

export default function BlogEditor({
  categories: initialCategories,
  tags: initialTags,
  post,
}: {
  categories: DbBlogCategory[];
  tags: DbBlogTag[];
  post?: AdminBlogPostDetails | null;
}) {
  const isEdit = Boolean(post);
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>("content");
  const [categories, setCategories] = useState(initialCategories);
  const [tags, setTags] = useState(initialTags);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    post?.categories.map((c) => c.id) ?? []
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    post?.tags.map((t) => t.id) ?? []
  );
  const [featuredImage, setFeaturedImage] = useState(post?.featured_image ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [newTagName, setNewTagName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [mediaOpen, setMediaOpen] = useState(false);

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleTag(id: string) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleAddTag() {
    if (!newTagName.trim()) return;
    const formData = new FormData();
    formData.set("name", newTagName.trim());
    const result = await createBlogTagAction(formData);
    if (result.error) return toast.error(result.error);
    if (result.tag) {
      setTags((prev) => [...prev, result.tag as DbBlogTag]);
      setSelectedTagIds((prev) => [...prev, result.tag!.id]);
      setNewTagName("");
    }
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    const formData = new FormData();
    formData.set("name", newCategoryName.trim());
    const result = await createBlogCategoryAction(formData);
    if (result.error) return toast.error(result.error);
    if (result.category) {
      setCategories((prev) => [...prev, result.category as DbBlogCategory]);
      setSelectedCategoryIds((prev) => [...prev, result.category!.id]);
      setNewCategoryName("");
    }
  }

  async function handleSubmit(formData: FormData) {
    formData.set("featuredImage", featuredImage);
    formData.set("content", content);
    formData.set("categoryIdsJson", JSON.stringify(selectedCategoryIds));
    formData.set("tagIdsJson", JSON.stringify(selectedTagIds));

    startTransition(async () => {
      const result = isEdit
        ? await updateBlogPostAction(post!.id, formData)
        : await createBlogPostAction(formData);

      if (result && "error" in result && result.error) {
        toast.error(result.error);
      } else if (isEdit) {
        toast.success("Post saved");
      }
    });
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "content", label: "Content" },
    { id: "seo", label: "SEO" },
  ];

  return (
    <>
      <form
        action={handleSubmit}
        className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_300px]"
      >
        <div className="space-y-6">
          <AdminCard padding={false}>
            <div className="space-y-5 border-b border-border/50 p-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Post title</Label>
                <Input
                  name="title"
                  defaultValue={post?.title}
                  required
                  className="h-12 text-lg font-medium"
                  placeholder="Enter post title"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    name="slug"
                    defaultValue={post?.slug}
                    placeholder="auto-from-title"
                  />
                  <p className="text-xs text-muted-foreground">
                    /blog/{post?.slug ?? "post-slug"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Excerpt</Label>
                  <Input
                    name="excerpt"
                    defaultValue={post?.excerpt ?? ""}
                    placeholder="Short summary for listings"
                  />
                </div>
              </div>
            </div>

            <div className="flex border-b border-border/50">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "border-b-2 px-6 py-3.5 text-sm font-medium transition-colors",
                    tab === t.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {tab === "content" && (
                <RichTextEditor
                  name="content"
                  value={content}
                  onChange={setContent}
                />
              )}
              {tab === "seo" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>SEO title</Label>
                    <Input
                      name="seoTitle"
                      defaultValue={post?.seo_title ?? ""}
                      placeholder="Custom title for search engines"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Meta description</Label>
                    <textarea
                      name="seoDescription"
                      defaultValue={post?.seo_description ?? ""}
                      rows={4}
                      className={`${inputClass} min-h-[100px] py-2.5 resize-y`}
                      placeholder="Brief description for Google and social sharing"
                    />
                  </div>
                </div>
              )}
            </div>
          </AdminCard>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24">
          <AdminCard title="Publish">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  name="status"
                  defaultValue={post?.status ?? "draft"}
                  className={inputClass}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEdit ? (
                  "Update post"
                ) : (
                  "Publish post"
                )}
              </Button>
              <Link
                href="/admin/blogs"
                className={cn(buttonVariants({ variant: "outline" }), "w-full")}
              >
                Back to posts
              </Link>
              {isEdit && post?.status === "published" && (
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full gap-2"
                  )}
                >
                  <ExternalLink className="h-4 w-4" />
                  View post
                </Link>
              )}
              {isEdit && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-red-600"
                  onClick={async () => {
                    if (confirm("Delete this post permanently?")) {
                      await deleteBlogPostAction(post!.id);
                    }
                  }}
                >
                  Delete post
                </Button>
              )}
            </div>
          </AdminCard>

          <AdminCard title="Featured image">
            {featuredImage ? (
              <div className="space-y-3">
                <MediaThumb url={featuredImage} />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setMediaOpen(true)}
                  >
                    Replace
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    onClick={() => setFeaturedImage("")}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setMediaOpen(true)}
                className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/70 py-8 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary"
              >
                <ImageIcon className="mb-2 h-8 w-8 opacity-50" />
                Set featured image
              </button>
            )}
          </AdminCard>

          <AdminCard title="Categories">
            <div className="max-h-36 space-y-2 overflow-y-auto">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category"
                className="h-9"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddCategory}>
                Add
              </Button>
            </div>
          </AdminCard>

          <AdminCard title="Tags">
            <div className="max-h-36 space-y-2 overflow-y-auto">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedTagIds.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="New tag"
                className="h-9"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                Add
              </Button>
            </div>
          </AdminCard>
        </aside>
      </form>

      <MediaPickerModal
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        onSelect={(urls) => setFeaturedImage(urls[0] ?? "")}
        title="Featured image"
      />
    </>
  );
}
