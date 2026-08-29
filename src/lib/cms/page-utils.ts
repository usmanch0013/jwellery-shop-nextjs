/** Slugs that belong to app routes — CMS pages cannot use these */
export const RESERVED_PAGE_SLUGS = new Set([
  "admin",
  "api",
  "account",
  "blog",
  "cart",
  "categories",
  "checkout",
  "forgot-password",
  "login",
  "orders",
  "products",
  "register",
  "search",
  "shop",
  "track-order",
  "wishlist",
  "_next",
]);

export function slugifyPage(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function validatePageSlug(slug: string, existingSlugs: string[] = []): string | null {
  if (!slug) return "URL slug is required.";
  if (slug.length < 2) return "Slug must be at least 2 characters.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return "Slug can only contain lowercase letters, numbers, and hyphens.";
  }
  if (RESERVED_PAGE_SLUGS.has(slug)) {
    return `"${slug}" is reserved and cannot be used.`;
  }
  return null;
}

export function getPagePublicPath(slug: string): string {
  return `/${slug}`;
}
