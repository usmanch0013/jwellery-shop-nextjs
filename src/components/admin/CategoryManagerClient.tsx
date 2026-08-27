"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageIcon, Loader2, Plus, Tags, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminShell";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import type { DbCategory } from "@/lib/database.types";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/actions/admin/categories";
import { toast } from "sonner";

const inputClass =
  "w-full h-10 rounded-xl border border-border/70 bg-background px-3 text-sm";

function CategoryForm({
  category,
  onDelete,
}: {
  category: DbCategory;
  onDelete: (id: string) => void;
}) {
  const [image, setImage] = useState(category.image ?? "");
  const [mediaOpen, setMediaOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    formData.set("image", image);
    const result = await updateCategoryAction(category.id, formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`"${formData.get("name")}" saved`);
    }
    setSaving(false);
  }

  async function handleDelete() {
    const message =
      category.product_count > 0
        ? `This category has ${category.product_count} product(s). You must move or delete them before removing the category.`
        : `Delete category "${category.name}"? This cannot be undone.`;

    if (!confirm(message)) return;
    if (category.product_count > 0) return;

    setDeleting(true);
    const result = await deleteCategoryAction(category.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Category deleted");
      onDelete(category.id);
    }
    setDeleting(false);
  }

  return (
    <>
      <AdminCard padding>
        <form action={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-100 text-emerald-700">
                {image ? (
                  <Image
                    src={image}
                    alt={category.name}
                    width={44}
                    height={44}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <Tags className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="font-medium">{category.name}</p>
                <p className="text-xs text-muted-foreground">
                  {category.product_count} product
                  {category.product_count === 1 ? "" : "s"} · /{category.slug}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save changes"
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-red-600"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input name="name" defaultValue={category.name} required />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input name="slug" defaultValue={category.slug} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Input
                name="description"
                defaultValue={category.description ?? ""}
                placeholder="Short category description"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Category image</Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                {image ? (
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border/60">
                    <Image
                      src={image}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                      unoptimized
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col gap-2">
                  <Input
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Image URL or pick from media library"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMediaOpen(true)}
                    >
                      <ImageIcon className="mr-1 h-4 w-4" />
                      Media library
                    </Button>
                    {image && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => setImage("")}
                      >
                        Remove image
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </AdminCard>

      <MediaPickerModal
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        onSelect={(urls) => setImage(urls[0] ?? "")}
        title="Category image"
      />
    </>
  );
}

export default function CategoryManagerClient({
  initialCategories,
}: {
  initialCategories: DbCategory[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [showAdd, setShowAdd] = useState(false);
  const [newImage, setNewImage] = useState("");
  const [mediaOpen, setMediaOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  async function handleCreate(formData: FormData) {
    setCreating(true);
    formData.set("image", newImage);
    const result = await createCategoryAction(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Category created");
      setShowAdd(false);
      setNewImage("");
      window.location.reload();
    }
    setCreating(false);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories"
        description={`${categories.length} product categories`}
        actions={
          <Button onClick={() => setShowAdd((v) => !v)}>
            <Plus className="mr-1 h-4 w-4" />
            Add category
          </Button>
        }
      />

      {showAdd && (
        <AdminCard title="New category" description="Create a product category">
          <form action={handleCreate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input name="name" required placeholder="E.g. Necklaces" />
              </div>
              <div className="space-y-2">
                <Label>Slug (optional)</Label>
                <Input name="slug" placeholder="auto-from-name" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Input name="description" placeholder="Category description" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Image</Label>
                <div className="flex gap-2">
                  <Input
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="Image URL"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMediaOpen(true)}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={creating}>
                {creating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create category
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </AdminCard>
      )}

      <div className="grid gap-4">
        {categories.map((cat) => (
          <CategoryForm
            key={cat.id}
            category={cat}
            onDelete={(id) =>
              setCategories((prev) => prev.filter((c) => c.id !== id))
            }
          />
        ))}
      </div>

      <MediaPickerModal
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        onSelect={(urls) => setNewImage(urls[0] ?? "")}
        title="Category image"
      />
    </div>
  );
}
