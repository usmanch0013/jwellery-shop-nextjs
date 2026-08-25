"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DbCategory, DbProduct } from "@/lib/database.types";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/actions/admin/products";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ProductRow = DbProduct & {
  categories?: { slug: string; name: string } | null;
};

export default function ProductForm({
  categories,
  product,
}: {
  categories: DbCategory[];
  product?: ProductRow | null;
}) {
  const [error, setError] = useState("");
  const isEdit = Boolean(product);

  async function handleSubmit(formData: FormData) {
    setError("");
    const result = isEdit
      ? await updateProductAction(product!.id, formData)
      : await createProductAction(formData);
    if (result && "error" in result && result.error) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit} className="max-w-2xl space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Name</Label>
          <Input name="name" defaultValue={product?.name} required />
        </div>
        <div>
          <Label>Slug (optional)</Label>
          <Input name="slug" defaultValue={product?.slug} />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <textarea
          name="description"
          defaultValue={product?.description}
          required
          rows={4}
          className="w-full border border-input px-3 py-2 text-sm rounded-md"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <Label>Price (Rs.)</Label>
          <Input
            name="price"
            type="number"
            defaultValue={product?.price}
            required
          />
        </div>
        <div>
          <Label>Original price</Label>
          <Input
            name="originalPrice"
            type="number"
            defaultValue={product?.original_price ?? ""}
          />
        </div>
        <div>
          <Label>Stock</Label>
          <Input
            name="stock"
            type="number"
            defaultValue={product?.stock ?? 50}
            required
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <select
            name="categoryId"
            defaultValue={product?.category_id}
            required
            className="w-full h-9 border border-input px-3 text-sm rounded-md"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Material</Label>
          <Input name="material" defaultValue={product?.material} required />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Image URL</Label>
          <Input name="image" defaultValue={product?.image} required />
        </div>
        <div>
          <Label>Hover image URL</Label>
          <Input name="hoverImage" defaultValue={product?.hover_image ?? ""} />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isNew"
            defaultChecked={product?.is_new}
          />
          New arrival
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isBestseller"
            defaultChecked={product?.is_bestseller}
          />
          Bestseller
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="soldOut"
            defaultChecked={product?.sold_out}
          />
          Sold out
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit">{isEdit ? "Save changes" : "Create product"}</Button>
        <Link
          href="/admin/products"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
        {isEdit && (
          <Button
            type="button"
            variant="outline"
            className="text-red-600 ml-auto"
            onClick={async () => {
              if (confirm("Delete this product?")) {
                await deleteProductAction(product!.id);
              }
            }}
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
