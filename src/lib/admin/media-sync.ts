import type { SupabaseClient } from "@supabase/supabase-js";

function fileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const base = pathname.split("/").pop() ?? "image";
    return decodeURIComponent(base.split("?")[0] ?? base);
  } catch {
    return "image";
  }
}

function mimeFromUrl(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes(".png")) return "image/png";
  if (lower.includes(".webp")) return "image/webp";
  if (lower.includes(".gif")) return "image/gif";
  if (lower.includes(".avif")) return "image/avif";
  return "image/jpeg";
}

type MediaInsert = {
  url: string;
  title: string | null;
  file_name: string | null;
  mime_type: string;
};

export async function syncProductImagesToMediaLibrary(
  admin: SupabaseClient
): Promise<number> {
  const pending = new Map<string, MediaInsert>();

  const { data: products } = await admin
    .from("products")
    .select("name, image, hover_image");

  for (const product of products ?? []) {
    if (product.image?.trim()) {
      const url = product.image.trim();
      pending.set(url, {
        url,
        title: product.name,
        file_name: fileNameFromUrl(url),
        mime_type: mimeFromUrl(url),
      });
    }
    if (product.hover_image?.trim()) {
      const url = product.hover_image.trim();
      pending.set(url, {
        url,
        title: `${product.name} (hover)`,
        file_name: fileNameFromUrl(url),
        mime_type: mimeFromUrl(url),
      });
    }
  }

  const { data: galleryRows } = await admin
    .from("product_images")
    .select("url, products(name)");

  for (const row of galleryRows ?? []) {
    if (!row.url?.trim()) continue;
    const url = row.url.trim();
    const productName =
      (row.products as { name?: string } | null)?.name ?? "Product";
    pending.set(url, {
      url,
      title: `${productName} (gallery)`,
      file_name: fileNameFromUrl(url),
      mime_type: mimeFromUrl(url),
    });
  }

  const { data: variations } = await admin
    .from("product_variations")
    .select("name, image_url");

  for (const variation of variations ?? []) {
    if (!variation.image_url?.trim()) continue;
    const url = variation.image_url.trim();
    pending.set(url, {
      url,
      title: variation.name,
      file_name: fileNameFromUrl(url),
      mime_type: mimeFromUrl(url),
    });
  }

  const { data: categories } = await admin
    .from("categories")
    .select("name, image");

  for (const category of categories ?? []) {
    if (!category.image?.trim()) continue;
    const url = category.image.trim();
    pending.set(url, {
      url,
      title: `${category.name} (category)`,
      file_name: fileNameFromUrl(url),
      mime_type: mimeFromUrl(url),
    });
  }

  if (pending.size === 0) return 0;

  // Fetch existing URLs with light, paginated selects of a single column.
  // A single .in("url", ...) filter with hundreds of URLs produces a request
  // URL tens of thousands of characters long, which servers and proxies
  // reject — that is what broke media loading as the catalog grew.
  const existingUrls = new Set<string>();
  const PAGE_SIZE = 1000;
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data: page, error } = await admin
      .from("media_library")
      .select("url")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    for (const row of page ?? []) existingUrls.add(row.url);
    if (!page || page.length < PAGE_SIZE) break;
  }

  const toInsert = [...pending.values()].filter(
    (item) => !existingUrls.has(item.url)
  );

  if (toInsert.length === 0) return 0;

  const CHUNK_SIZE = 200;
  for (let i = 0; i < toInsert.length; i += CHUNK_SIZE) {
    const { error } = await admin
      .from("media_library")
      .insert(toInsert.slice(i, i + CHUNK_SIZE));
    if (error) throw new Error(error.message);
  }

  return toInsert.length;
}
