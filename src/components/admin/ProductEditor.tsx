"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  GripVertical,
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminCard } from "@/components/admin/AdminShell";
import {
  MediaPickerModal,
  MediaThumb,
  type MediaPick,
} from "@/components/admin/MediaPickerModal";
import type {
  AdminProductDetails,
  DbCategory,
  DbProductTag,
} from "@/lib/database.types";
import {
  createProductAction,
  deleteProductAction,
  saveProductDraftAction,
  updateProductAction,
} from "@/actions/admin/products";
import { updateMediaAction } from "@/actions/admin/media";
import { createProductTagAction } from "@/actions/admin/tags";
import { cn } from "@/lib/utils";
import { normalizeSalePrices } from "@/lib/products/sale";
import RichTextEditor from "@/components/admin/RichTextEditor";

const inputClass =
  "w-full h-10 rounded-xl border border-border/70 bg-background px-3 text-sm";

const UNSAVED_LEAVE_MESSAGE =
  "You have unsaved changes. If you leave this page, your changes will be lost.";

function FormField({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        {hint && (
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
      {children}
    </div>
  );
}

type VariationRow = {
  id?: string;
  sku: string;
  name: string;
  price: string;
  originalPrice: string;
  stock: string;
  imageUrl: string;
  size: string;
  color: string;
  isDefault: boolean;
};

type Tab = "general" | "inventory" | "variations" | "gallery";

function emptyVariation(): VariationRow {
  return {
    sku: "",
    name: "",
    price: "",
    originalPrice: "",
    stock: "",
    imageUrl: "",
    size: "",
    color: "",
    isDefault: false,
  };
}

function variationsManageStock(rows: VariationRow[]) {
  return rows.some((v) => v.name.trim());
}

function variationStockTotal(rows: VariationRow[]) {
  return rows.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
}

function adminPriceDefaults(product?: AdminProductDetails | null) {
  if (!product) return { regular: "", sale: "" };
  const { price, originalPrice } = normalizeSalePrices(
    product.price,
    product.original_price
  );
  if (originalPrice && originalPrice > price) {
    return { regular: String(originalPrice), sale: String(price) };
  }
  return { regular: product.price ? String(product.price) : "", sale: "" };
}

function variationAdminPriceDefaults(
  v: AdminProductDetails["variations"][number]
) {
  const { price, originalPrice } = normalizeSalePrices(
    v.price ?? 0,
    v.original_price
  );
  if (originalPrice && originalPrice > price) {
    return { regular: String(originalPrice), sale: String(price) };
  }
  if (v.price != null) {
    return { regular: String(v.price), sale: "" };
  }
  return { regular: "", sale: "" };
}

function mapVariation(
  v: AdminProductDetails["variations"][number]
): VariationRow {
  const attrs = (v.attributes ?? {}) as Record<string, string>;
  const prices = variationAdminPriceDefaults(v);
  return {
    id: v.id,
    sku: v.sku ?? "",
    name: v.name,
    price: prices.regular,
    originalPrice: prices.sale,
    stock: String(v.stock),
    imageUrl: v.image_url ?? "",
    size: attrs.size ?? "",
    color: attrs.color ?? "",
    isDefault: v.is_default,
  };
}

function plainTextLength(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

export default function ProductEditor({
  categories,
  tags: allTags,
  product,
}: {
  categories: DbCategory[];
  tags: DbProductTag[];
  product?: AdminProductDetails | null;
}) {
  const isEdit = Boolean(product);
  const priceDefaults = adminPriceDefaults(product);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const skipLeaveSave = useRef(false);
  const persistDraftRef = useRef<() => Promise<string | null>>(async () => null);
  const draftIdRef = useRef<string | null>(product?.id ?? null);
  const savedSnapshotRef = useRef<string>("");
  const [isPending, startTransition] = useTransition();
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftId, setDraftId] = useState(product?.id ?? null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tab, setTab] = useState<Tab>("general");
  const [tags, setTags] = useState<DbProductTag[]>(allTags);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    product?.tags.map((t) => t.id) ?? []
  );
  const [newTagName, setNewTagName] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [featuredImage, setFeaturedImage] = useState(
    product?.image && product.image !== "/window.svg" ? product.image : ""
  );
  const [stockQty, setStockQty] = useState(String(product?.stock ?? 0));
  const [featuredAlt, setFeaturedAlt] = useState("");
  const [featuredMediaId, setFeaturedMediaId] = useState<string | null>(null);
  const [hoverImage, setHoverImage] = useState(product?.hover_image ?? "");
  const [gallery, setGallery] = useState<string[]>(
    product?.gallery.map((g) => g.url) ?? []
  );
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [variations, setVariations] = useState<VariationRow[]>(() => {
    const rows = product?.variations ?? [];
    if (rows.length === 0) return [];
    return rows.map((v) => mapVariation(v));
  });
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaMode, setMediaMode] = useState<
    "featured" | "hover" | "gallery" | "variation"
  >("featured");
  const [variationImageIndex, setVariationImageIndex] = useState<number | null>(
    null
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const slugPreview = product?.slug ?? "product-slug";
  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  function openMedia(
    mode: typeof mediaMode,
    variationIndex: number | null = null
  ) {
    setMediaMode(mode);
    setVariationImageIndex(variationIndex);
    setMediaOpen(true);
  }

  function handleMediaSelect(urls: string[], picks?: MediaPick[]) {
    if (mediaMode === "featured") {
      setFeaturedImage(urls[0] ?? "");
      setFeaturedAlt(picks?.[0]?.altText ?? "");
      setFeaturedMediaId(picks?.[0]?.id ?? null);
    } else if (mediaMode === "hover") {
      setHoverImage(urls[0] ?? "");
    } else if (mediaMode === "gallery") {
      setGallery((prev) => [...prev, ...urls.filter((u) => !prev.includes(u))]);
    } else if (mediaMode === "variation" && variationImageIndex != null) {
      setVariations((prev) =>
        prev.map((v, i) =>
          i === variationImageIndex ? { ...v, imageUrl: urls[0] ?? "" } : v
        )
      );
    }
  }

  const usesVariationStock = variationsManageStock(variations);

  const captureSnapshot = useCallback(() => {
    const form = formRef.current;
    if (!form) return "";

    const fd = new FormData(form);
    const variationRows = variations
      .filter((v) => v.name.trim())
      .map((v) => ({
        id: v.id ?? "",
        sku: v.sku,
        name: v.name,
        price: v.price,
        originalPrice: v.originalPrice,
        stock: v.stock,
        imageUrl: v.imageUrl,
        size: v.size,
        color: v.color,
        isDefault: v.isDefault,
      }));

    return JSON.stringify({
      name: String(fd.get("name") ?? "").trim(),
      slug: String(fd.get("slug") ?? "").trim(),
      sku: String(fd.get("sku") ?? "").trim(),
      shortDescription: String(fd.get("shortDescription") ?? ""),
      description: String(fd.get("description") ?? ""),
      price: String(fd.get("price") ?? ""),
      originalPrice: String(fd.get("originalPrice") ?? ""),
      material: String(fd.get("material") ?? "").trim(),
      status: String(fd.get("status") ?? ""),
      categoryId: String(fd.get("categoryId") ?? ""),
      isNew: fd.get("isNew") === "on",
      isBestseller: fd.get("isBestseller") === "on",
      soldOut: fd.get("soldOut") === "on",
      featuredImage,
      hoverImage,
      stockQty,
      gallery,
      selectedTagIds: [...selectedTagIds].sort(),
      variations: variationRows,
    });
  }, [
    featuredImage,
    hoverImage,
    stockQty,
    gallery,
    selectedTagIds,
    variations,
  ]);

  const isDirty = useCallback(() => {
    if (!savedSnapshotRef.current) return false;
    return captureSnapshot() !== savedSnapshotRef.current;
  }, [captureSnapshot]);

  const markSaved = useCallback(() => {
    savedSnapshotRef.current = captureSnapshot();
  }, [captureSnapshot]);

  function applyEditorFields(formData: FormData) {
    formData.set("image", featuredImage);
    formData.set("hoverImage", hoverImage);
    formData.set(
      "stock",
      String(usesVariationStock ? variationStockTotal(variations) : Number(stockQty) || 0)
    );
    formData.set("galleryJson", JSON.stringify(gallery));
    formData.set("tagIdsJson", JSON.stringify(selectedTagIds));
    const variationRows = variations.filter((v) => v.name.trim());
    const defaultIndex = Math.max(
      0,
      variationRows.findIndex((v) => v.isDefault)
    );

    formData.set(
      "variationsJson",
      JSON.stringify(
        variationRows.map((v, index) => {
          const regular = v.price.trim() ? Number(v.price) : null;
          const sale = v.originalPrice.trim() ? Number(v.originalPrice) : null;
          const normalized = normalizeSalePrices(
            regular ?? sale ?? 0,
            sale
          );
          return {
          id: v.id,
          sku: v.sku || undefined,
          name: v.name.trim(),
          price:
            regular != null || sale != null ? normalized.price : null,
          originalPrice: normalized.originalPrice ?? null,
          stock: Number(v.stock) || 0,
          imageUrl: v.imageUrl || undefined,
          attributes: {
            ...(v.size ? { size: v.size } : {}),
            ...(v.color ? { color: v.color } : {}),
          },
          isDefault: index === defaultIndex,
        };
        })
      )
    );
  }

  async function persistDraft() {
    if (!formRef.current) return null;
    const current = new FormData(formRef.current);
    const name = String(current.get("name") ?? "").trim();
    const hasContent =
      name.length > 0 || Boolean(featuredImage) || gallery.length > 0;
    if (!hasContent && !draftId) return null;

    setSavingDraft(true);
    const formData = new FormData(formRef.current);
    applyEditorFields(formData);
    formData.set("status", "draft");
    const result = await saveProductDraftAction(draftId, formData);
    setSavingDraft(false);

    if (result.error) {
      setError(result.error);
      return null;
    }

    if (result.id) {
      setDraftId(result.id);
      draftIdRef.current = result.id;
      if (!product) {
        window.history.replaceState(null, "", `/admin/products/${result.id}`);
      }
      setSuccess("Draft saved.");
      markSaved();
    }
    return result.id ?? null;
  }

  useEffect(() => {
    persistDraftRef.current = persistDraft;
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      markSaved();
      setHasUnsavedChanges(false);
    }, 150);
    return () => window.clearTimeout(timer);
  }, [product?.id, markSaved]);

  useEffect(() => {
    const syncDirty = () => {
      setHasUnsavedChanges(isDirty());
    };
    syncDirty();
    const form = formRef.current;
    if (!form) return;
    form.addEventListener("input", syncDirty);
    form.addEventListener("change", syncDirty);
    const interval = window.setInterval(syncDirty, 800);
    return () => {
      form.removeEventListener("input", syncDirty);
      form.removeEventListener("change", syncDirty);
      window.clearInterval(interval);
    };
  }, [isDirty, product?.id, featuredImage, gallery, variations, selectedTagIds]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (skipLeaveSave.current || !isDirty()) return;
      event.preventDefault();
      event.returnValue = UNSAVED_LEAVE_MESSAGE;
    };

    const onDocumentClick = (event: MouseEvent) => {
      if (skipLeaveSave.current || !isDirty()) return;

      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor || anchor.target === "_blank") return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (anchor.hasAttribute("download")) return;

      if (
        !window.confirm(`${UNSAVED_LEAVE_MESSAGE}\n\nLeave this page?`)
      ) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      skipLeaveSave.current = true;
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onDocumentClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onDocumentClick, true);
    };
  }, [isDirty]);

  function addGalleryUrl() {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (!gallery.includes(url)) {
      setGallery((prev) => [...prev, url]);
    }
    setImageUrlInput("");
  }

  function moveGalleryItem(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= gallery.length) return;
    setGallery((prev) => {
      const copy = [...prev];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
  }

  async function handleAddTag() {
    if (!newTagName.trim()) return;
    const formData = new FormData();
    formData.set("name", newTagName.trim());
    const result = await createProductTagAction(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.tag) {
      setTags((prev) => [...prev, result.tag as DbProductTag]);
      setSelectedTagIds((prev) => [...prev, result.tag!.id]);
      setNewTagName("");
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }

  function addVariation() {
    setVariations((prev) => [...prev, emptyVariation()]);
    setTab("variations");
  }

  function updateVariation(index: number, patch: Partial<VariationRow>) {
    setVariations((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...patch } : v))
    );
  }

  function removeVariation(index: number) {
    setVariations((prev) => prev.filter((_, i) => i !== index));
  }

  function setDefaultVariation(index: number) {
    setVariations((prev) =>
      prev.map((v, i) => ({ ...v, isDefault: i === index }))
    );
  }

  async function handleSubmit(formData: FormData) {
    setError("");
    setSuccess("");

    if (!featuredImage.trim()) {
      setError("Featured image is required. Add one in the Gallery tab.");
      setTab("gallery");
      return;
    }

    const status = String(formData.get("status") ?? "published").trim();
    const description = String(formData.get("description") ?? "").trim();
    const material = String(formData.get("material") ?? "").trim();
    const price = Number(formData.get("price"));
    const namedVariations = variations.filter((v) => v.name.trim());

    if (status === "published") {
      if (plainTextLength(description) < 10) {
        setError(
          "Add a full description (at least 10 characters) before publishing."
        );
        setTab("general");
        return;
      }
      if (!Number.isFinite(price) || price <= 0) {
        setError("Add a price before publishing.");
        setTab("inventory");
        return;
      }
      if (material.length < 2) {
        setError("Add a material before publishing.");
        setTab("inventory");
        return;
      }
      if (namedVariations.length > 0) {
        const invalidVariation = namedVariations.find(
          (v) => Number(v.stock) < 0 || !v.name.trim()
        );
        if (invalidVariation) {
          setError("Check variation names and stock in the Variations tab.");
          setTab("variations");
          return;
        }
      }
    }

    formData.set("status", status);
    applyEditorFields(formData);

    startTransition(async () => {
      skipLeaveSave.current = true;
      const id = draftId ?? product?.id;
      const result = id
        ? await updateProductAction(id, formData)
        : await createProductAction(formData);

      if (result && "error" in result && result.error) {
        skipLeaveSave.current = false;
        setError(result.error);
        return;
      }

      const isPublishing =
        status === "published" && product?.status !== "published";

      const createdId =
        result &&
        typeof result === "object" &&
        "id" in result &&
        typeof result.id === "string"
          ? result.id
          : null;

      if (createdId && !id) {
        setDraftId(createdId);
        draftIdRef.current = createdId;
        window.history.replaceState(null, "", `/admin/products/${createdId}`);
      }

      markSaved();
      setHasUnsavedChanges(false);

      if (isPublishing) {
        router.push("/admin/products");
      } else {
        skipLeaveSave.current = false;
        setSuccess(
          product?.status === "published"
            ? "Product updated."
            : status === "published"
              ? "Product published."
              : "Product saved."
        );
      }
      router.refresh();
    });
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "general", label: "General" },
    { id: "inventory", label: "Inventory & pricing" },
    { id: "variations", label: "Variations" },
    { id: "gallery", label: "Gallery & media" },
  ];

  return (
    <>
      <form
        ref={formRef}
        action={handleSubmit}
        className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_320px]"
      >
        <div className="min-w-0 space-y-6">
          {(isEdit || draftId) && (
            <div className="flex flex-col gap-3 rounded-xl border border-[#008060]/25 bg-[#008060]/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#004c3f]">
                  {isEdit ? "Update product" : "New product"}
                </p>
                <p className="text-[13px] text-[#5c5852]">
                  {hasUnsavedChanges
                    ? "You have unsaved changes — save before leaving this page."
                    : "All changes saved. Status is set in the panel on the right."}
                </p>
              </div>
              <Button type="submit" disabled={isPending} className="shrink-0">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          )}
          {error && (
            <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
              {success}
            </p>
          )}

          <AdminCard padding={false}>
            <div className="space-y-6 border-b border-border/50 p-6">
              <FormField label="Product name">
                <Input
                  name="name"
                  defaultValue={product?.name === "Auto draft" ? "" : product?.name}
                  required
                  className="h-12 text-lg font-medium"
                  placeholder="Product title"
                  onBlur={() => {
                    if (!product || product.status === "draft") {
                      void persistDraft();
                    }
                  }}
                />
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Slug"
                  hint="Used in the product URL"
                >
                  <Input
                    name="slug"
                    defaultValue={product?.slug}
                    placeholder="auto-generated-from-name"
                  />
                  <p className="text-xs text-muted-foreground pt-1">
                    /products/
                    <span className="text-foreground">{slugPreview}</span>
                  </p>
                </FormField>
                <FormField label="SKU" hint="Unique product code">
                  <Input
                    name="sku"
                    defaultValue={product?.sku ?? ""}
                    placeholder="RING-001"
                  />
                </FormField>
              </div>

              <RichTextEditor
                name="shortDescription"
                label="Short description"
                defaultValue={product?.short_description ?? ""}
                rows={5}
                placeholder="Brief summary for listings and product page"
                showHelper
              />
            </div>

            <div className="flex overflow-x-auto border-b border-border/50">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "whitespace-nowrap border-b-2 px-6 py-3.5 text-sm font-medium transition-colors",
                    tab === t.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                  {t.id === "gallery" && !featuredImage && (
                    <span className="ml-1.5 text-red-500">*</span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-6">
              <div hidden={tab !== "general"}>
                <RichTextEditor
                  name="description"
                  label="Full description"
                  defaultValue={product?.description ?? ""}
                  rows={14}
                  placeholder="Detailed product information for the product page"
                  showHelper
                />
              </div>

              <div hidden={tab !== "inventory"} className="space-y-6">
                  <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField
                      label="Regular price (Rs.)"
                      hint="Price before discount"
                    >
                      <Input
                        name="price"
                        type="number"
                        min={0}
                        defaultValue={priceDefaults.regular}
                      />
                    </FormField>
                    <FormField
                      label="Sale price (Rs.)"
                      hint="Customer pays this. Leave empty if not on sale."
                    >
                      <Input
                        name="originalPrice"
                        type="number"
                        min={0}
                        defaultValue={priceDefaults.sale}
                        placeholder="Optional"
                      />
                    </FormField>
                    <FormField
                      label="Stock quantity"
                      hint={
                        usesVariationStock
                          ? "Locked while variations have stock. Clear variation stock to edit here."
                          : undefined
                      }
                    >
                      <Input
                        name="stock"
                        type="number"
                        min={0}
                        value={
                          usesVariationStock
                            ? String(variationStockTotal(variations))
                            : stockQty
                        }
                        onChange={(e) => setStockQty(e.target.value)}
                        readOnly={usesVariationStock}
                        className={usesVariationStock ? "bg-muted" : undefined}
                      />
                    </FormField>
                  </div>
                  <FormField label="Material">
                    <Input
                      name="material"
                      defaultValue={product?.material}
                      placeholder="Gold plated, Sterling silver..."
                    />
                  </FormField>
              </div>

              <div hidden={tab !== "variations"} className="space-y-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      Add size, color, or other options with individual pricing
                      and stock.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVariation}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add variation
                    </Button>
                  </div>

                  {variations.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
                      No variations yet. Use simple pricing in Inventory, or add
                      variations here for sizes and colors.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {variations.map((v, index) => (
                        <div
                          key={v.id ?? index}
                          className="space-y-4 rounded-xl border border-border/60 bg-muted/15 p-5"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              Variation {index + 1}
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 text-xs">
                                <input
                                  type="radio"
                                  name="defaultVariation"
                                  checked={v.isDefault}
                                  onChange={() => setDefaultVariation(index)}
                                />
                                Default
                              </label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-red-600"
                                onClick={() => removeVariation(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <FormField label="Name">
                              <Input
                                value={v.name}
                                onChange={(e) =>
                                  updateVariation(index, {
                                    name: e.target.value,
                                  })
                                }
                                placeholder="Gold / Size 7"
                              />
                            </FormField>
                            <FormField label="SKU">
                              <Input
                                value={v.sku}
                                onChange={(e) =>
                                  updateVariation(index, { sku: e.target.value })
                                }
                                placeholder="SKU-001"
                              />
                            </FormField>
                            <FormField
                              label="Regular price (Rs.)"
                              hint="MRP for this option"
                            >
                              <Input
                                type="number"
                                min={0}
                                value={v.price}
                                onChange={(e) =>
                                  updateVariation(index, {
                                    price: e.target.value,
                                  })
                                }
                                placeholder="Optional — uses product price"
                              />
                            </FormField>
                            <FormField
                              label="Sale price (Rs.)"
                              hint="Customer pays this"
                            >
                              <Input
                                type="number"
                                min={0}
                                value={v.originalPrice}
                                onChange={(e) =>
                                  updateVariation(index, {
                                    originalPrice: e.target.value,
                                  })
                                }
                                placeholder="Optional"
                              />
                            </FormField>
                            <FormField label="Stock">
                              <Input
                                type="number"
                                min={0}
                                value={v.stock}
                                onChange={(e) =>
                                  updateVariation(index, {
                                    stock: e.target.value,
                                  })
                                }
                                placeholder="—"
                              />
                            </FormField>
                            <FormField label="Size">
                              <Input
                                value={v.size}
                                onChange={(e) =>
                                  updateVariation(index, { size: e.target.value })
                                }
                                placeholder="7, Medium..."
                              />
                            </FormField>
                            <FormField label="Color">
                              <Input
                                value={v.color}
                                onChange={(e) =>
                                  updateVariation(index, {
                                    color: e.target.value,
                                  })
                                }
                                placeholder="Gold, Rose..."
                              />
                            </FormField>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            {v.imageUrl ? (
                              <div className="w-20">
                                <MediaThumb
                                  url={v.imageUrl}
                                  onRemove={() =>
                                    updateVariation(index, { imageUrl: "" })
                                  }
                                  onClick={() =>
                                    openMedia("variation", index)
                                  }
                                />
                              </div>
                            ) : null}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openMedia("variation", index)}
                            >
                              <ImageIcon className="mr-1 h-4 w-4" />
                              {v.imageUrl ? "Change image" : "Variation image"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              <div hidden={tab !== "gallery"} className="space-y-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">
                        Product images
                      </h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Pick from your media library or paste image URLs.
                      </p>
                    </div>
                    <Link
                      href="/admin/media"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" })
                      )}
                    >
                      Open media library
                    </Link>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4 rounded-xl border border-border/60 p-5">
                      <FormField
                        label="Featured image"
                        hint="Main product image shown in shop and listings"
                      >
                        {featuredImage ? (
                          <div className="space-y-3">
                            <div className="mx-auto max-w-[200px]">
                              <MediaThumb
                                url={featuredImage}
                                label={featuredAlt || "Featured image"}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Alt text</Label>
                              <Input
                                value={featuredAlt}
                                onChange={(e) => setFeaturedAlt(e.target.value)}
                                onBlur={async () => {
                                  if (!featuredMediaId) return;
                                  const fd = new FormData();
                                  fd.set("altText", featuredAlt);
                                  await updateMediaAction(featuredMediaId, fd);
                                }}
                                placeholder="Describe this image"
                              />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => openMedia("featured")}
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
                            onClick={() => openMedia("featured")}
                            className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/70 py-10 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                          >
                            <ImageIcon className="mb-2 h-9 w-9 opacity-50" />
                            Set featured image
                          </button>
                        )}
                      </FormField>
                    </div>

                    <div className="space-y-4 rounded-xl border border-border/60 p-5">
                      <FormField
                        label="Hover image"
                        hint="Optional second image on product card hover"
                      >
                        {hoverImage ? (
                          <div className="space-y-3">
                            <div className="mx-auto max-w-[200px]">
                              <MediaThumb url={hoverImage} />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => openMedia("hover")}
                              >
                                Replace
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                onClick={() => setHoverImage("")}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openMedia("hover")}
                            className="w-full rounded-xl border border-dashed border-border/70 py-8 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                          >
                            Add hover image (optional)
                          </button>
                        )}
                      </FormField>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-xl border border-border/60 p-5">
                    <FormField
                      label="Product gallery"
                      hint="Additional images shown on the product detail page"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Input
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          placeholder="Paste image URL and press Add"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addGalleryUrl}
                          disabled={!imageUrlInput.trim()}
                        >
                          Add URL
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => openMedia("gallery")}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          From library
                        </Button>
                      </div>

                      {gallery.length === 0 ? (
                        <div className="mt-4 rounded-xl border border-dashed border-border/70 py-8 text-center text-sm text-muted-foreground">
                          No gallery images yet.
                        </div>
                      ) : (
                        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                          {gallery.map((url, i) => (
                            <div key={`${url}-${i}`} className="space-y-2">
                              <MediaThumb
                                url={url}
                                onRemove={() =>
                                  setGallery((prev) =>
                                    prev.filter((_, idx) => idx !== i)
                                  )
                                }
                              />
                              <div className="flex justify-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  disabled={i === 0}
                                  onClick={() => moveGalleryItem(i, -1)}
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  disabled={i === gallery.length - 1}
                                  onClick={() => moveGalleryItem(i, 1)}
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </FormField>
                  </div>
              </div>
            </div>
          </AdminCard>
        </div>

        <aside className="space-y-5 lg:max-w-none xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
          <AdminCard title={isEdit ? "Save & status" : "Publish"}>
            <div className="space-y-4">
              <FormField label="Status">
                <select
                  name="status"
                  defaultValue={product?.status ?? "draft"}
                  className={inputClass}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </FormField>

              <div className="flex flex-col gap-2.5">
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : isEdit ? (
                    "Save changes"
                  ) : (
                    "Publish product"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={savingDraft || isPending}
                  className="w-full"
                  onClick={async () => {
                    setError("");
                    const id = await persistDraft();
                    if (id) setSuccess("Draft saved.");
                  }}
                >
                  {savingDraft ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving draft...
                    </>
                  ) : (
                    "Save draft"
                  )}
                </Button>
                <Link
                  href="/admin/products"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full"
                  )}
                >
                  Back to products
                </Link>
                {isEdit && product?.slug && (
                  <Link
                    href={`/products/${product.slug}`}
                    target="_blank"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full gap-2"
                    )}
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on store
                  </Link>
                )}
              </div>

              {isEdit && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-red-600"
                  onClick={async () => {
                    if (confirm("Delete this product permanently?")) {
                      await deleteProductAction(product!.id);
                    }
                  }}
                >
                  Delete product
                </Button>
              )}
            </div>
          </AdminCard>

          <AdminCard title="Product category">
            <FormField label="Category">
              <select
                name="categoryId"
                defaultValue={product?.category_id ?? categories[0]?.id}
                required
                className={inputClass}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FormField>
          </AdminCard>

          <AdminCard title="Product tags">
            <div className="space-y-4">
              {tags.length > 5 && (
                <Input
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  placeholder="Search tags..."
                  className="h-9"
                />
              )}
              <div className="max-h-44 space-y-2.5 overflow-y-auto pr-1">
                {filteredTags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {tags.length === 0 ? "No tags yet." : "No matching tags."}
                  </p>
                ) : (
                  filteredTags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex cursor-pointer items-center gap-2.5 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTagIds.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                        className="rounded"
                      />
                      {tag.name}
                    </label>
                  ))
                )}
              </div>
              <div className="flex flex-col gap-2 border-t border-border/50 pt-4 sm:flex-row">
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="New tag name"
                  className="h-9 min-w-0 flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                >
                  Add
                </Button>
              </div>
              {selectedTagIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedTagIds.length} tag
                  {selectedTagIds.length === 1 ? "" : "s"} selected
                </p>
              )}
            </div>
          </AdminCard>

          <AdminCard title="Product flags">
            <div className="space-y-3 text-sm">
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  name="isNew"
                  defaultChecked={product?.is_new}
                />
                New arrival
              </label>
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  name="isBestseller"
                  defaultChecked={product?.is_bestseller}
                />
                Bestseller
              </label>
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  name="isFeatured"
                  defaultChecked={product?.is_featured}
                />
                Featured on homepage
              </label>
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  name="soldOut"
                  defaultChecked={product?.sold_out}
                />
                Mark as sold out
              </label>
            </div>
          </AdminCard>

          {featuredImage && (
            <AdminCard title="Image preview">
              <div className="mx-auto max-w-[140px]">
                <MediaThumb url={featuredImage} />
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Featured image
              </p>
            </AdminCard>
          )}
        </aside>
      </form>

      <MediaPickerModal
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        onSelect={handleMediaSelect}
        multiple={mediaMode === "gallery"}
        title={
          mediaMode === "gallery"
            ? "Add to gallery"
            : mediaMode === "featured"
              ? "Featured image"
              : "Select image"
        }
      />
    </>
  );
}
