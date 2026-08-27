import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { DbBlogCategory, DbBlogPost, DbBlogTag } from "@/lib/database.types";
import type { BlogPostCard } from "@/lib/blog/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickCategory(value: unknown): DbBlogCategory | null {
  if (!isRecord(value) || typeof value.id !== "string") return null;
  return value as unknown as DbBlogCategory;
}

function pickTag(value: unknown): DbBlogTag | null {
  if (!isRecord(value) || typeof value.id !== "string") return null;
  return value as unknown as DbBlogTag;
}

function mapPostCard(
  post: DbBlogPost & {
    blog_post_categories?: {
      blog_categories: Pick<DbBlogCategory, "slug" | "name"> | null;
    }[];
  }
): BlogPostCard {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    featured_image: post.featured_image,
    published_at: post.published_at,
    author_name: post.author_name,
    categories:
      post.blog_post_categories
        ?.map((row) => row.blog_categories)
        .filter(Boolean) as Pick<DbBlogCategory, "slug" | "name">[] ?? [],
  };
}

export async function getPublishedBlogPosts(page = 1, limit = 9) {
  if (!isSupabaseConfigured()) return { posts: [], total: 0, page, limit };

  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, featured_image, published_at, author_name, blog_post_categories(blog_categories(slug, name))",
      { count: "exact" }
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) return { posts: [], total: 0, page, limit };

  return {
    posts: (data ?? []).map((post) => mapPostCard(post as never)),
    total: count ?? 0,
    page,
    limit,
  };
}

export async function getLatestBlogPosts(limit = 3) {
  const { posts } = await getPublishedBlogPosts(1, limit);
  return posts;
}

export async function getBlogPostBySlug(slug: string) {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!post) return null;

  const [categoriesRes, tagsRes] = await Promise.all([
    supabase
      .from("blog_post_categories")
      .select("blog_categories(*)")
      .eq("post_id", post.id),
    supabase
      .from("blog_post_tags")
      .select("blog_tags(*)")
      .eq("post_id", post.id),
  ]);

  return {
    ...(post as DbBlogPost),
    categories: (categoriesRes.data ?? [])
      .map((row) => pickCategory(row.blog_categories))
      .filter((c): c is DbBlogCategory => c !== null),
    tags: (tagsRes.data ?? [])
      .map((row) => pickTag(row.blog_tags))
      .filter((t): t is DbBlogTag => t !== null),
  };
}
