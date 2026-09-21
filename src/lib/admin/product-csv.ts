import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/products/mappers";
import { normalizeSalePrices } from "@/lib/products/sale";
import type { BackupProductRecord, ProductBackupPayload } from "@/lib/admin/product-backup";
import { importProductBackup, type ImportResult } from "@/lib/admin/product-import";

/** Daily-entry order: required fields first, optional at the end. */
export const GOOGLE_SHEET_DAILY_HEADERS = [
  "Product Name",
  "SKU",
  "Category",
  "Regular Price (Rs.)",
  "Sale Price (Rs.)",
  "Stock",
  "Featured Image URL",
  "Short Description",
  "Full Description",
  "Material",
  "Status",
  "Tags",
  "Is New",
  "Slug",
  "Hover Image URL",
  "Gallery Image URLs",
  "Is Bestseller",
  "Sold Out",
  "Sort Order",
] as const;

export const PRODUCT_CSV_HEADERS = GOOGLE_SHEET_DAILY_HEADERS;

export const VARIATION_CSV_HEADERS = [
  "Product SKU",
  "Variation Name",
  "Variation SKU",
  "Price (Rs.)",
  "Original Price (Rs.)",
  "Stock",
  "Size",
  "Color",
  "Image URL",
  "Is Default",
] as const;

const PRODUCT_HEADER_MAP: Record<string, keyof ProductCsvRow> = {
  "product name": "name",
  name: "name",
  sku: "sku",
  category: "category",
  "regular price (rs.)": "regularPrice",
  "regular price": "regularPrice",
  "sale price (rs.)": "salePrice",
  "sale price": "salePrice",
  stock: "stock",
  "featured image url": "featuredImage",
  "featured image": "featuredImage",
  image: "featuredImage",
  status: "status",
  slug: "slug",
  "short description": "shortDescription",
  "full description": "description",
  description: "description",
  material: "material",
  "hover image url": "hoverImage",
  "hover image": "hoverImage",
  "gallery image urls": "gallery",
  gallery: "gallery",
  tags: "tags",
  "is new": "isNew",
  "is bestseller": "isBestseller",
  "sold out": "soldOut",
  "sort order": "sortOrder",
};

const VARIATION_HEADER_MAP: Record<string, keyof VariationCsvRow> = {
  "product sku": "productSku",
  "variation name": "name",
  name: "name",
  "variation sku": "sku",
  sku: "sku",
  "price (rs.)": "price",
  price: "price",
  "original price (rs.)": "originalPrice",
  "original price": "originalPrice",
  stock: "stock",
  size: "size",
  color: "color",
  "image url": "imageUrl",
  image: "imageUrl",
  "is default": "isDefault",
};

type ProductCsvRow = {
  name: string;
  sku: string;
  category: string;
  regularPrice: string;
  salePrice: string;
  stock: string;
  featuredImage: string;
  status: string;
  slug: string;
  shortDescription: string;
  description: string;
  material: string;
  hoverImage: string;
  gallery: string;
  tags: string;
  isNew: string;
  isBestseller: string;
  soldOut: string;
  sortOrder: string;
};

type VariationCsvRow = {
  productSku: string;
  name: string;
  sku: string;
  price: string;
  originalPrice: string;
  stock: string;
  size: string;
  color: string;
  imageUrl: string;
  isDefault: string;
};

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseYesNo(value: string | undefined) {
  const v = (value ?? "").trim().toLowerCase();
  return ["yes", "y", "true", "1"].includes(v);
}

function parseList(value: string | undefined, separator: RegExp | string) {
  return (value ?? "")
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumber(value: string | undefined) {
  const cleaned = (value ?? "").replace(/,/g, "").trim();
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function escapeCsvCell(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function stringifyCsv(headers: readonly string[], rows: string[][]): string {
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map((cell) => escapeCsvCell(cell ?? "")).join(",")),
  ];
  return `${lines.join("\r\n")}\r\n`;
}

const SAMPLE_PRODUCT_ROWS: string[][] = [
  [
    "Bridal Red Set",
    "RING-001",
    "Bridal Sets",
    "12000",
    "9999",
    "50",
    "https://example.com/images/bridal-red.jpg",
    "Bridal red color set for new season",
    "Premium bridal red jewelry set with matching earrings and necklace.",
    "Gold plated",
    "published",
    "bridal, red, new",
    "yes",
    "bridal-red-set",
    "https://example.com/images/bridal-red-hover.jpg",
    "https://example.com/images/bridal-red-2.jpg | https://example.com/images/bridal-red-3.jpg",
    "no",
    "no",
    "1",
  ],
  [
    "Gold Hoop Earrings",
    "EAR-002",
    "Earrings",
    "3500",
    "",
    "30",
    "https://example.com/images/gold-hoops.jpg",
    "Classic gold hoop earrings",
    "Lightweight gold plated hoop earrings for daily wear.",
    "Gold plated",
    "published",
    "earrings, gold",
    "no",
    "",
    "",
    "",
    "no",
    "no",
    "2",
  ],
];

/** UTF-8 BOM helps Google Sheets / Excel open Urdu text correctly. */
export function buildGoogleSheetDailyTemplate(): string {
  return `\uFEFF${stringifyCsv(GOOGLE_SHEET_DAILY_HEADERS, SAMPLE_PRODUCT_ROWS)}`;
}

export function buildProductCsvTemplate(): string {
  return buildGoogleSheetDailyTemplate();
}

export function buildVariationsCsvTemplate(): string {
  return stringifyCsv(VARIATION_CSV_HEADERS, [
    [
      "RING-001",
      "Size 7",
      "RING-001-S7",
      "9999",
      "12000",
      "10",
      "7",
      "Red",
      "",
      "yes",
    ],
    [
      "RING-001",
      "Size 8",
      "RING-001-S8",
      "9999",
      "12000",
      "15",
      "8",
      "Red",
      "",
      "no",
    ],
  ]);
}

/** RFC 4180-style CSV parser (supports quoted fields). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char === "\r") {
      // handled by \n
    } else {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function rowsToObjects<T extends string>(
  rows: string[][],
  headerMap: Record<string, T>
): Partial<Record<T, string>>[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);
  const keys = headers.map((header) => headerMap[header] ?? null);

  return rows.slice(1).map((values) => {
    const record: Partial<Record<T, string>> = {};
    keys.forEach((key, index) => {
      if (!key) return;
      record[key] = (values[index] ?? "").trim();
    });
    return record;
  });
}

function parseProductRows(text: string): Partial<ProductCsvRow>[] {
  return rowsToObjects(parseCsv(text), PRODUCT_HEADER_MAP) as Partial<ProductCsvRow>[];
}

function parseVariationRows(text: string): Partial<VariationCsvRow>[] {
  return rowsToObjects(parseCsv(text), VARIATION_HEADER_MAP) as Partial<VariationCsvRow>[];
}

function isVariationCsv(text: string) {
  const firstLine = text.split(/\r?\n/)[0]?.toLowerCase() ?? "";
  return firstLine.includes("product sku") && firstLine.includes("variation name");
}

function isProductCsv(text: string) {
  const firstLine = text.split(/\r?\n/)[0]?.toLowerCase() ?? "";
  return firstLine.includes("product name") || firstLine.includes("featured image");
}

function imageRef(url: string) {
  return {
    localPath: "",
    originalUrl: url,
    downloaded: false,
  };
}

function csvRowToBackupProduct(
  row: Partial<ProductCsvRow>,
  variations: BackupProductRecord["variations"]
): BackupProductRecord | { error: string } {
  const name = row.name?.trim();
  if (!name) {
    return { error: "Product Name is required" };
  }

  const featuredImage = row.featuredImage?.trim();
  if (!featuredImage) {
    return { error: `${name}: Featured Image URL is required` };
  }

  const categorySlug = row.category?.trim();
  if (!categorySlug) {
    return { error: `${name}: Category is required` };
  }

  const regularPrice = parseNumber(row.regularPrice);
  const salePrice = parseNumber(row.salePrice);
  const basePrice = regularPrice ?? salePrice;

  if (!basePrice || basePrice <= 0) {
    return { error: `${name}: Regular Price or Sale Price is required` };
  }

  const { price, originalPrice } = normalizeSalePrices(
    regularPrice ?? salePrice ?? 0,
    salePrice ?? null
  );

  const stock = parseNumber(row.stock) ?? 0;
  const statusRaw = (row.status ?? "published").trim().toLowerCase();
  const status = statusRaw === "draft" ? "draft" : "published";
  const slug = row.slug?.trim() || slugify(name);
  const description =
    row.description?.trim() ||
    row.shortDescription?.trim() ||
    name;

  const galleryUrls = parseList(row.gallery, /\s*\|\s*/);
  const tagSlugs = parseList(row.tags, /,/).map((tag) => slugify(tag) || tag);

  const soldOutFlag = parseYesNo(row.soldOut);

  return {
    id: "",
    legacyId: null,
    slug,
    name,
    description,
    shortDescription: row.shortDescription?.trim() || null,
    sku: row.sku?.trim() || null,
    status,
    price,
    originalPrice: originalPrice ?? null,
    categorySlug: slugify(categorySlug) || categorySlug,
    material: row.material?.trim() || "Mixed",
    stock,
    sortOrder: parseNumber(row.sortOrder) ?? 0,
    flags: {
      isNew: parseYesNo(row.isNew),
      isBestseller: parseYesNo(row.isBestseller),
      soldOut: soldOutFlag || stock <= 0,
    },
    ratingAvg: 0,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
    images: {
      featured: imageRef(featuredImage),
      hover: row.hoverImage?.trim() ? imageRef(row.hoverImage.trim()) : null,
      gallery: galleryUrls.map((url, index) => ({
        ...imageRef(url),
        sortOrder: index,
      })),
    },
    tags: tagSlugs,
    variations,
  };
}

function variationRowToBackup(
  row: Partial<VariationCsvRow>,
  sortOrder: number
): BackupProductRecord["variations"][number] {
  const variationPrice = parseNumber(row.price);
  const variationOriginal = parseNumber(row.originalPrice);
  const normalized =
    variationPrice != null || variationOriginal != null
      ? normalizeSalePrices(
          variationOriginal ?? variationPrice ?? 0,
          variationPrice ?? null
        )
      : { price: null as number | null, originalPrice: undefined as number | undefined };

  const attributes: Record<string, string> = {};
  if (row.size?.trim()) attributes.size = row.size.trim();
  if (row.color?.trim()) attributes.color = row.color.trim();

  return {
    sku: row.sku?.trim() || null,
    name: row.name!.trim(),
    price: normalized.price,
    originalPrice: normalized.originalPrice ?? null,
    stock: parseNumber(row.stock) ?? 0,
    attributes,
    sortOrder,
    isDefault: parseYesNo(row.isDefault),
    image: row.imageUrl?.trim() ? imageRef(row.imageUrl.trim()) : null,
  };
}

function attachVariations(
  products: BackupProductRecord[],
  variationRows: Partial<VariationCsvRow>[]
) {
  const grouped = new Map<string, BackupProductRecord["variations"]>();

  variationRows
    .filter((row) => row.productSku?.trim() && row.name?.trim())
    .forEach((row, index) => {
      const key = row.productSku!.trim().toLowerCase();
      const list = grouped.get(key) ?? [];
      list.push(variationRowToBackup(row, index));
      grouped.set(key, list);
    });

  for (const product of products) {
    const skuKey = product.sku?.trim().toLowerCase();
    const slugKey = product.slug.trim().toLowerCase();
    const variations =
      (skuKey && grouped.get(skuKey)) ||
      grouped.get(slugKey) ||
      [];

    product.variations = variations;

    if (product.variations.length > 0 && !product.variations.some((v) => v.isDefault)) {
      product.variations[0].isDefault = true;
    }

    if (product.variations.length > 0) {
      product.stock = product.variations.reduce((sum, v) => sum + v.stock, 0);
    }
  }
}

export function csvToBackupPayload(
  productsCsv: string,
  variationsCsv?: string
): ProductBackupPayload {
  const productRows = parseProductRows(productsCsv);
  const variationRows = variationsCsv ? parseVariationRows(variationsCsv) : [];

  const products: BackupProductRecord[] = [];
  const categories = new Map<string, { slug: string; name: string }>();
  const tags = new Map<string, { slug: string; name: string }>();
  const errors: string[] = [];

  for (const row of productRows) {
    const result = csvRowToBackupProduct(row, []);
    if ("error" in result) {
      errors.push(result.error);
      continue;
    }

    const categoryName = row.category!.trim();
    const categorySlug = slugify(categoryName) || categoryName;
    categories.set(categorySlug, { slug: categorySlug, name: categoryName });

    for (const tagSlug of result.tags) {
      if (!tags.has(tagSlug)) {
        tags.set(tagSlug, {
          slug: tagSlug,
          name: tagSlug.replace(/-/g, " "),
        });
      }
    }

    products.push(result);
  }

  if (errors.length > 0 && products.length === 0) {
    throw new Error(errors.slice(0, 5).join(" · "));
  }

  attachVariations(products, variationRows);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    productCount: products.length,
    categories: [...categories.values()].map((c) => ({
      slug: c.slug,
      name: c.name,
      description: null,
      image: null,
      productCount: 0,
    })),
    tags: [...tags.values()],
    products,
  };
}

export function detectCsvKind(text: string, fileName?: string) {
  const lowerName = (fileName ?? "").toLowerCase();
  if (lowerName.includes("variation")) return "variations" as const;
  if (isVariationCsv(text)) return "variations" as const;
  if (isProductCsv(text)) return "products" as const;
  return "unknown" as const;
}

export async function importProductCsv(
  admin: SupabaseClient,
  productsCsv: string,
  variationsCsv?: string
): Promise<ImportResult & { csvErrors?: string[] }> {
  const payload = csvToBackupPayload(productsCsv, variationsCsv);
  const result = await importProductBackup(admin, payload);
  return result;
}
