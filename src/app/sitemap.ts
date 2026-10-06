import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/brand";
import { getPublishedBlogPosts } from "@/lib/blog/queries";
import { getCmsPages } from "@/lib/cms/queries";
import { getCategories, getProducts } from "@/lib/products/queries";

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

  // Static entries carry no lastModified: there is no reliable per-page
  // date, and stamping the request time would mislead crawlers.
  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/shop" ? 0.9 : 0.6,
  }));

  try {
    const categories = await getCategories();
    for (const category of categories) {
      entries.push({
        url: absoluteUrl(`/categories/${category.slug}`),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // ignore — static entries still published
  }

  try {
    const pages = await getCmsPages();
    for (const page of pages) {
      const path = `/${page.slug}`;
      if (staticPaths.includes(path)) continue;
      entries.push({
        url: absoluteUrl(path),
        ...(page.updated_at
          ? { lastModified: new Date(page.updated_at) }
          : {}),
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  } catch {
    // ignore — static entries still published
  }

  try {
    const pageSize = 100;
    let page = 1;
    let fetched = 0;
    let total = Number.POSITIVE_INFINITY;
    while (fetched < total && page <= 10) {
      const result = await getPublishedBlogPosts(page, pageSize);
      total = result.total;
      if (result.posts.length === 0) break;
      for (const post of result.posts) {
        entries.push({
          url: absoluteUrl(`/blog/${post.slug}`),
          ...(post.published_at
            ? { lastModified: new Date(post.published_at) }
            : {}),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
      fetched += result.posts.length;
      page += 1;
    }
  } catch {
    // ignore — blog is optional in the sitemap
  }

  try {
    const { products } = await getProducts({ page: 1, limit: 500 });
    for (const product of products) {
      entries.push({
        url: absoluteUrl(`/products/${product.slug ?? product.id}`),
        ...(product.updatedAt
          ? { lastModified: new Date(product.updatedAt) }
          : {}),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // ignore
  }

  return entries;
}
