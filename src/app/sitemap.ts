import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/brand";
import { getCmsPages } from "@/lib/cms/queries";
import { getProducts } from "@/lib/products/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "/",
    "/shop",
    "/blog",
    "/about",
    "/contact",
    "/terms",
    "/privacy",
    "/refund-policy",
    "/shipping-policy",
    "/cookie-policy",
    "/track-order",
    "/search",
  ];

  const now = new Date();
  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/shop" ? 0.9 : 0.6,
  }));

  try {
    const pages = await getCmsPages();
    for (const page of pages) {
      const path = `/${page.slug}`;
      if (staticPaths.includes(path)) continue;
      entries.push({
        url: absoluteUrl(path),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  } catch {
    // ignore — static entries still published
  }

  try {
    const { products } = await getProducts({ page: 1, limit: 500 });
    for (const product of products) {
      entries.push({
        url: absoluteUrl(`/products/${product.id}`),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // ignore
  }

  return entries;
}
