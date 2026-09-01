"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
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
  AdminTable,
  AdminTableElement,
  AdminTd,
  AdminTh,
  AdminThead,
} from "@/components/admin/AdminShell";
import type { AdminProductFilters } from "@/lib/admin/queries";
import type { DbCategory, DbProduct } from "@/lib/database.types";
import { formatPrice } from "@/lib/products/format";
import { normalizeSalePrices } from "@/lib/products/sale";
import {
  bulkDeleteProductsAction,
  bulkUpdateProductsAction,
  quickEditProductAction,
  reorderProductsAction,
} from "@/actions/admin/products";
import { cn } from "@/lib/utils";

const selectClass =
  "h-9 rounded-lg border border-[var(--admin-border)] bg-white px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#008060]";

type ProductRow = DbProduct & {
  categories: { name: string; slug: string } | null;
};

type BulkAction =
  | ""
  | "delete"
  | "publish"
  | "draft"
  | "new-on"
  | "new-off"
  | "bestseller-on"
  | "bestseller-off"
  | "sold-out"
  | "in-stock"
  | "quick-edit";

function productPriceDisplay(product: ProductRow) {
  const { price, originalPrice } = normalizeSalePrices(
    product.price,
    product.original_price
  );
  return { price, originalPrice, onSale: Boolean(originalPrice && originalPrice > price) };
}

function QuickEditPanel({
  product,
  categories,
  onCancel,
  onSaved,
}: {
  product: ProductRow;
  categories: DbCategory[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { price, originalPrice } = productPriceDisplay(product);
  const [isNew, setIsNew] = useState(product.is_new);
  const [isBestseller, setIsBestseller] = useState(product.is_bestseller);
  const [soldOut, setSoldOut] = useState(product.sold_out);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("id", product.id);
    formData.set("isNew", isNew ? "true" : "false");
    formData.set("isBestseller", isBestseller ? "true" : "false");
    formData.set("soldOut", soldOut ? "true" : "false");
    const result = await quickEditProductAction(formData);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Product updated");
    onSaved();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-xl border border-[var(--admin-border)] bg-[#fafbfb] p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
        <Label className="text-xs">Status</Label>
        <select
          name="status"
          defaultValue={product.status ?? "published"}
          className={selectClass}
        >
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Regular price (Rs.)</Label>
        <Input
          name="regularPrice"
          type="number"
          min={0}
          defaultValue={originalPrice ?? price}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Sale price (Rs.)</Label>
        <Input
          name="salePrice"
          type="number"
          min={0}
          defaultValue={originalPrice ? price : ""}
          placeholder="Optional"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Stock</Label>
        <Input name="stock" type="number" min={0} defaultValue={product.stock} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Category</Label>
        <select
          name="categoryId"
          defaultValue={product.category_id}
          className={selectClass}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2 lg:col-span-4">
        <label className="flex items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            checked={isNew}
            onChange={(e) => setIsNew(e.target.checked)}
          />
          New arrival
        </label>
        <label className="flex items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            checked={isBestseller}
            onChange={(e) => setIsBestseller(e.target.checked)}
          />
          Bestseller
        </label>
        <label className="flex items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            checked={soldOut}
            onChange={(e) => setSoldOut(e.target.checked)}
          />
          Sold out
        </label>
      </div>
      <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
        <Button type="submit" size="sm" disabled={loading} className="bg-[#008060] hover:bg-[#006e52]">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function buildFilterUrl(filters: AdminProductFilters, page = 1) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (filters.q) params.set("q", filters.q);
  if (filters.categoryId) params.set("category", filters.categoryId);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.flag && filters.flag !== "all") params.set("flag", filters.flag);
  if (filters.sort && filters.sort !== "manual") params.set("sort", filters.sort);
  const qs = params.toString();
  return qs ? `/admin/products?${qs}` : "/admin/products";
}

function SortableProductRow({
  product,
  dragEnabled,
  selected,
  onToggleSelect,
  quickEditId,
  onToggleQuickEdit,
  categories,
  onQuickEditSaved,
}: {
  product: ProductRow;
  dragEnabled: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  quickEditId: string | null;
  onToggleQuickEdit: () => void;
  categories: DbCategory[];
  onQuickEditSaved: () => void;
}) {
  const { price, originalPrice, onSale } = productPriceDisplay(product);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.id, disabled: !dragEnabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <tr
        ref={setNodeRef}
        style={style}
        className={cn(
          "border-b border-[var(--admin-border)] last:border-0 transition-colors hover:bg-[#fafbfb]",
          isDragging && "relative z-10 bg-white opacity-80 shadow-md"
        )}
      >
        <AdminTd className="w-10">
          {dragEnabled ? (
            <button
              type="button"
              className="flex h-8 w-8 cursor-grab items-center justify-center text-[var(--admin-text-subdued)] active:cursor-grabbing"
              {...attributes}
              {...listeners}
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          ) : (
            <span className="inline-block w-8" />
          )}
        </AdminTd>
        <AdminTd>
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="rounded"
            aria-label={`Select ${product.name}`}
          />
        </AdminTd>
        <AdminTd>
          <Link
            href={`/admin/products/${product.id}`}
            className="font-medium hover:text-[#008060]"
          >
            {product.name}
          </Link>
          <p className="text-xs text-muted-foreground">{product.slug}</p>
          {product.sku && (
            <p className="text-[11px] text-muted-foreground">SKU: {product.sku}</p>
          )}
        </AdminTd>
        <AdminTd className="text-muted-foreground">
          {product.categories?.name ?? "—"}
        </AdminTd>
        <AdminTd>
          <span className="font-medium">{formatPrice(price)}</span>
          {onSale && originalPrice && (
            <span className="ml-1.5 text-xs text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </AdminTd>
        <AdminTd>
          <span
            className={
              product.stock <= 5
                ? "font-medium text-amber-700"
                : "text-foreground"
            }
          >
            {product.stock}
          </span>
        </AdminTd>
        <AdminTd>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
              product.status === "draft"
                ? "bg-slate-100 text-slate-700"
                : "bg-emerald-100 text-emerald-800"
            )}
          >
            {product.status ?? "published"}
          </span>
        </AdminTd>
        <AdminTd>
          <div className="flex flex-wrap gap-1">
            {product.is_new && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                New
              </span>
            )}
            {product.is_bestseller && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                Bestseller
              </span>
            )}
            {product.sold_out && (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-800">
                Sold out
              </span>
            )}
          </div>
        </AdminTd>
        <AdminTd>
          <div className="flex flex-col gap-1 text-[12px]">
            <button
              type="button"
              className="text-left text-[#008060] hover:underline"
              onClick={onToggleQuickEdit}
            >
              {quickEditId === product.id ? "Close" : "Quick edit"}
            </button>
            <Link
              href={`/admin/products/${product.id}`}
              className="text-[var(--admin-text-subdued)] hover:text-[#008060] hover:underline"
            >
              Edit
            </Link>
          </div>
        </AdminTd>
      </tr>
      {quickEditId === product.id && (
        <tr className="border-b border-[var(--admin-border)] bg-[#fafbfb]">
          <td colSpan={9} className="px-4 py-4 lg:px-5">
            <QuickEditPanel
              product={product}
              categories={categories}
              onCancel={onToggleQuickEdit}
              onSaved={onQuickEditSaved}
            />
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminProductsClient({
  products: initialProducts,
  categories,
  total,
  page,
  totalPages,
  filters,
}: {
  products: ProductRow[];
  categories: DbCategory[];
  total: number;
  page: number;
  totalPages: number;
  filters: AdminProductFilters;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialProducts);
  const [searchInput, setSearchInput] = useState(filters.q ?? "");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<BulkAction>("");
  const [applying, setApplying] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);

  const dragEnabled = filters.sort === "manual";
  const hasActiveFilters = Boolean(
    filters.q ||
      filters.categoryId ||
      (filters.status && filters.status !== "all") ||
      (filters.flag && filters.flag !== "all")
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  useEffect(() => {
    setItems(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    setSearchInput(filters.q ?? "");
  }, [filters.q]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const q = searchInput.trim();
      if (q === (filters.q ?? "")) return;
      router.push(
        buildFilterUrl({ ...filters, q: q || undefined, page: undefined })
      );
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce search only
  }, [searchInput]);

  const allSelected = items.length > 0 && items.every((p) => selected.has(p.id));
  const productIds = useMemo(() => items.map((p) => p.id), [items]);

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(items.map((p) => p.id)));
  }

  function refresh() {
    setSelected(new Set());
    setBulkAction("");
    setQuickEditId(null);
    router.refresh();
  }

  function updateFilter(patch: Partial<AdminProductFilters>) {
    router.push(buildFilterUrl({ ...filters, ...patch, page: undefined }));
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((p) => p.id === active.id);
    const newIndex = items.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const moved = arrayMove(items, oldIndex, newIndex);
    const sortValues = [...items]
      .map((p) => p.sort_order ?? 0)
      .sort((a, b) => a - b);
    const updates = moved.map((p, i) => ({
      id: p.id,
      sort_order: sortValues[i] ?? i,
    }));

    setItems(moved.map((p, i) => ({ ...p, sort_order: sortValues[i] ?? i })));
    setReordering(true);
    const result = await reorderProductsAction(updates);
    setReordering(false);

    if (result.error) {
      toast.error(result.error);
      setItems(initialProducts);
      return;
    }
    toast.success("Order saved");
    router.refresh();
  }

  async function runBulkPatch(patch: Record<string, string>) {
    const ids = [...selected];
    const formData = new FormData();
    formData.set("ids", JSON.stringify(ids));
    for (const [key, value] of Object.entries(patch)) {
      formData.set(key, value);
    }
    const result = await bulkUpdateProductsAction(formData);
    if (result.error) {
      toast.error(result.error);
      return false;
    }
    toast.success(`Updated ${result.updated} product${result.updated === 1 ? "" : "s"}`);
    refresh();
    return true;
  }

  async function handleBulkApply() {
    if (!bulkAction || selected.size === 0) return;

    if (bulkAction === "quick-edit") {
      setBulkEditOpen(true);
      return;
    }

    if (bulkAction === "delete") {
      if (
        !confirm(
          `Delete ${selected.size} product${selected.size === 1 ? "" : "s"} permanently?`
        )
      ) {
        return;
      }
      setApplying(true);
      const result = await bulkDeleteProductsAction([...selected]);
      setApplying(false);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Deleted ${result.deleted} product${result.deleted === 1 ? "" : "s"}`);
      refresh();
      return;
    }

    const patchMap: Record<BulkAction, Record<string, string> | null> = {
      "": null,
      delete: null,
      publish: { status: "published" },
      draft: { status: "draft" },
      "new-on": { isNew: "true" },
      "new-off": { isNew: "false" },
      "bestseller-on": { isBestseller: "true" },
      "bestseller-off": { isBestseller: "false" },
      "sold-out": { soldOut: "true" },
      "in-stock": { soldOut: "false" },
      "quick-edit": null,
    };

    const patch = patchMap[bulkAction];
    if (!patch) return;

    setApplying(true);
    await runBulkPatch(patch);
    setApplying(false);
  }

  async function handleBulkEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setApplying(true);
    const formData = new FormData(e.currentTarget);
    formData.set("ids", JSON.stringify([...selected]));
    const result = await bulkUpdateProductsAction(formData);
    setApplying(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Updated ${result.updated} products`);
    setBulkEditOpen(false);
    refresh();
  }

  return (
    <>
      <AdminTable>
        <div className="space-y-3 border-b border-[var(--admin-border)] px-4 py-3 lg:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-subdued)]" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, slug, or SKU..."
                className="h-9 pl-9 text-[13px]"
              />
            </div>
            <select
              value={filters.categoryId ?? ""}
              onChange={(e) =>
                updateFilter({ categoryId: e.target.value || undefined })
              }
              className={cn(selectClass, "min-w-[160px]")}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={filters.status ?? "all"}
              onChange={(e) =>
                updateFilter({
                  status: e.target.value as AdminProductFilters["status"],
                })
              }
              className={cn(selectClass, "min-w-[130px]")}
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <select
              value={filters.flag ?? "all"}
              onChange={(e) =>
                updateFilter({
                  flag: e.target.value as AdminProductFilters["flag"],
                })
              }
              className={cn(selectClass, "min-w-[140px]")}
            >
              <option value="all">All products</option>
              <option value="new">New arrivals</option>
              <option value="bestseller">Bestsellers</option>
              <option value="sale">On sale</option>
              <option value="sold_out">Sold out</option>
              <option value="low_stock">Low stock (≤5)</option>
            </select>
            <select
              value={filters.sort ?? "manual"}
              onChange={(e) =>
                updateFilter({
                  sort: e.target.value as AdminProductFilters["sort"],
                })
              }
              className={cn(selectClass, "min-w-[150px]")}
            >
              <option value="manual">Manual order</option>
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="name">Name A–Z</option>
            </select>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-1"
                onClick={() => router.push("/admin/products")}
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[12px] text-[var(--admin-text-subdued)]">
              Showing {items.length} of {total}
              {dragEnabled && " · Drag rows to reorder"}
              {reordering && " · Saving order…"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--admin-border)] px-4 py-3 lg:px-5">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value as BulkAction)}
            className={cn(selectClass, "min-w-[180px]")}
          >
            <option value="">Bulk actions</option>
            <option value="publish">Publish</option>
            <option value="draft">Move to draft</option>
            <option value="quick-edit">Quick edit</option>
            <option value="new-on">Mark as new arrival</option>
            <option value="new-off">Remove new arrival</option>
            <option value="bestseller-on">Mark as bestseller</option>
            <option value="bestseller-off">Remove bestseller</option>
            <option value="sold-out">Mark sold out</option>
            <option value="in-stock">Mark in stock</option>
            <option value="delete">Delete permanently</option>
          </select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!bulkAction || selected.size === 0 || applying}
            onClick={() => void handleBulkApply()}
          >
            {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
          </Button>
          {selected.size > 0 && (
            <span className="text-[13px] text-[var(--admin-text-subdued)]">
              {selected.size} selected{" "}
              <button
                type="button"
                className="text-[#008060] hover:underline"
                onClick={() => setSelected(new Set())}
              >
                Clear
              </button>
            </span>
          )}
        </div>

        <AdminTableElement>
          <AdminThead>
            <tr>
              <AdminTh>
                <span className="sr-only">Reorder</span>
              </AdminTh>
              <AdminTh>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded"
                  aria-label="Select all products"
                />
              </AdminTh>
              <AdminTh>Product</AdminTh>
              <AdminTh>Category</AdminTh>
              <AdminTh>Price</AdminTh>
              <AdminTh>Stock</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Flags</AdminTh>
              <AdminTh>Actions</AdminTh>
            </tr>
          </AdminThead>
          {items.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-[13px] text-muted-foreground">
                  No products match your filters.
                </td>
              </tr>
            </tbody>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => void handleDragEnd(e)}
            >
              <SortableContext items={productIds} strategy={verticalListSortingStrategy}>
                <tbody>
                  {items.map((p) => (
                    <SortableProductRow
                      key={p.id}
                      product={p}
                      dragEnabled={dragEnabled}
                      selected={selected.has(p.id)}
                      onToggleSelect={() => {
                        const next = new Set(selected);
                        if (next.has(p.id)) next.delete(p.id);
                        else next.add(p.id);
                        setSelected(next);
                      }}
                      quickEditId={quickEditId}
                      onToggleQuickEdit={() =>
                        setQuickEditId((id) => (id === p.id ? null : p.id))
                      }
                      categories={categories}
                      onQuickEditSaved={() => {
                        setQuickEditId(null);
                        refresh();
                      }}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          )}
        </AdminTableElement>
      </AdminTable>

      <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
        <DialogContent className="max-w-lg sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Bulk quick edit ({selected.size} product
              {selected.size === 1 ? "" : "s"})
            </DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-muted-foreground">
            Leave fields empty to keep existing values. Changes apply to all
            selected products.
          </p>
          <form onSubmit={(e) => void handleBulkEditSubmit(e)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <select name="status" defaultValue="" className={selectClass}>
                <option value="">— No change —</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Regular price (Rs.)</Label>
                <Input name="regularPrice" type="number" min={0} placeholder="No change" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Sale price (Rs.)</Label>
                <Input name="salePrice" type="number" min={0} placeholder="No change" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Stock</Label>
                <Input name="stock" type="number" min={0} placeholder="No change" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <select name="categoryId" defaultValue="" className={selectClass}>
                  <option value="">— No change —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-[13px]">
                <input type="checkbox" name="isNew" value="true" />
                Mark new arrival
              </label>
              <label className="flex items-center gap-2 text-[13px]">
                <input type="checkbox" name="isBestseller" value="true" />
                Mark bestseller
              </label>
              <label className="flex items-center gap-2 text-[13px]">
                <input type="checkbox" name="soldOut" value="true" />
                Mark sold out
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBulkEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={applying} className="bg-[#008060] hover:bg-[#006e52]">
                {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update products"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
