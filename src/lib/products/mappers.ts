import type { Category, CategoryInfo, Product } from "@/types";
import type { DbCategory, DbProduct } from "@/lib/database.types";

import { normalizeSalePrices } from "@/lib/products/sale";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function mapDbProductToProduct(row: DbProduct): Product {
  const categorySlug = (row.categories?.slug ?? "accessories") as Category;
  const { price, originalPrice } = normalizeSalePrices(
    row.price,
    row.original_price
  );
  return {
    id: row.id,
    slug: row.slug,
    legacyId: row.legacy_id ?? undefined,
    name: row.name,
    description: row.description,
    price,
    originalPrice,
    category: categorySlug,
    image: row.image,
    hoverImage: row.hover_image ?? undefined,
    material: row.material,
    reviews: row.review_count,
    rating: Number(row.rating_avg) || undefined,
    isNew: row.is_new,
    isBestseller: row.is_bestseller,
    soldOut: row.sold_out || row.stock <= 0,
    stock: row.stock,
  };
}

export function mapDbCategory(row: DbCategory): CategoryInfo {
  return {
    slug: row.slug as Category,
    name: row.name,
    description: row.description ?? "",
    productCount: row.product_count,
    image: row.image ?? "",
  };
}

export function mapStaticProductToDbShape(
  product: Product,
  categoryId: string
): Omit<DbProduct, "created_at" | "categories"> {
  return {
    id: product.id,
    legacy_id: product.legacyId ?? product.id,
    slug: product.slug ?? slugify(product.name),
    name: product.name,
    description: product.description,
    price: product.price,
    original_price: product.originalPrice ?? null,
    category_id: categoryId,
    material: product.material,
    stock: product.stock ?? (product.soldOut ? 0 : 50),
    is_new: product.isNew ?? false,
    is_bestseller: product.isBestseller ?? false,
    sold_out: product.soldOut ?? false,
    rating_avg: product.rating ?? 0,
    review_count: product.reviews,
    image: product.image,
    hover_image: product.hoverImage ?? null,
  };
}
