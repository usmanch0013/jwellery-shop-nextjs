import type { Category, CategoryInfo, Product, ProductVariation } from "@/types";
import type {
  DbCategory,
  DbProduct,
  DbProductImage,
  DbProductVariation,
} from "@/lib/database.types";

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
    sku: row.sku ?? undefined,
    name: row.name,
    description: row.description,
    shortDescription: row.short_description ?? undefined,
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
    isFeatured: row.is_featured,
    soldOut: row.sold_out || row.stock <= 0,
    stock: row.stock,
  };
}

export function mapDbVariation(row: DbProductVariation): ProductVariation {
  const normalized =
    row.price != null || row.original_price != null
      ? normalizeSalePrices(
          row.price ?? row.original_price ?? 0,
          row.original_price
        )
      : null;
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    price: normalized?.price ?? null,
    originalPrice: normalized?.originalPrice ?? null,
    stock: row.stock,
    imageUrl: row.image_url,
    attributes: (row.attributes ?? {}) as Record<string, string>,
    isDefault: row.is_default,
  };
}

export function attachProductDetail(
  product: Product,
  gallery: DbProductImage[],
  variations: DbProductVariation[]
): Product {
  const galleryUrls = gallery.map((g) => g.url).filter(Boolean);
  const mappedVariations = variations.map(mapDbVariation);
  const variationStock = mappedVariations.reduce((sum, v) => sum + v.stock, 0);
  const usesVariationStock = mappedVariations.some((v) => v.stock > 0);

  return {
    ...product,
    images: galleryUrls.length > 0 ? galleryUrls : product.images,
    variations: mappedVariations,
    stock: usesVariationStock ? variationStock : product.stock,
    soldOut:
      product.soldOut ||
      (usesVariationStock
        ? variationStock <= 0
        : (product.stock ?? 0) <= 0),
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
    is_featured: product.isFeatured ?? false,
    sold_out: product.soldOut ?? false,
    rating_avg: product.rating ?? 0,
    review_count: product.reviews,
    image: product.image,
    hover_image: product.hoverImage ?? null,
  };
}
