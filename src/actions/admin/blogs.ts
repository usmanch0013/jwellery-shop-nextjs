"use server";

import { getAdminClient } from "@/lib/admin/auth";
import { requireAdmin } from "@/lib/admin/auth";
import { slugify } from "@/lib/products/mappers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sanitizeHtml } from "@/lib/security/sanitize-html";
import { z } from "zod";

const postSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(10),
  featuredImage: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  categoryIds: z.array(z.string().uuid()).default([]),
  tagIds: z.array(z.string().uuid()).default([]),
});

function parsePostForm(formData: FormData) {
  let categoryIds: string[] = [];
  let tagIds: string[] = [];

  try {
    categoryIds = JSON.parse(String(formData.get("categoryIdsJson") || "[]"));
  } catch {
    categoryIds = [];
  }

  try {
    tagIds = JSON.parse(String(formData.get("tagIdsJson") || "[]"));
  } catch {
    tagIds = [];
  }

  return postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    excerpt: formData.get("excerpt") || "",
    content: formData.get("content"),
    featuredImage: formData.get("featuredImage") || undefined,
    status: formData.get("status") || "draft",
    seoTitle: formData.get("seoTitle") || undefined,
    seoDescription: formData.get("seoDescription") || undefined,
    categoryIds,
    tagIds,
  });
}

async function syncPostCategories(
  admin: Awaited<ReturnType<typeof getAdminClient>>,
  postId: string,
  categoryIds: string[]
) {
  await admin.from("blog_post_categories").delete().eq("post_id", postId);
  if (categoryIds.length === 0) return;
  await admin.from("blog_post_categories").insert(
    categoryIds.map((categoryId) => ({ post_id: postId, category_id: categoryId }))
  );
}

async function syncPostTags(
  admin: Awaited<ReturnType<typeof getAdminClient>>,
  postId: string,
  tagIds: string[]
) {
  await admin.from("blog_post_tags").delete().eq("post_id", postId);
  if (tagIds.length === 0) return;
  await admin.from("blog_post_tags").insert(
    tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId }))
  );
}

function revalidateBlogPaths(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath("/admin/blogs");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function createBlogPostAction(formData: FormData) {
  const parsed = parsePostForm(formData);
  if (!parsed.success) return { error: "Invalid blog post data" };

  const user = await requireAdmin();
  const admin = await getAdminClient();
  const data = parsed.data;
  const slug = data.slug || slugify(data.title);
  const now = new Date().toISOString();

  const { data: post, error } = await admin
    .from("blog_posts")
    .insert({
      title: data.title,
      slug,
      excerpt: data.excerpt ?? "",
      content: sanitizeHtml(data.content),
      featured_image: data.featuredImage || null,
      status: data.status,
      author_email: user.email ?? null,
      author_name:
        (user.user_metadata?.full_name as string | undefined) ??
        user.email ??
        "Admin",
      seo_title: data.seoTitle || null,
      seo_description: data.seoDescription || null,
      published_at: data.status === "published" ? now : null,
      updated_at: now,
    })
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "A post with this slug already exists" };
    return { error: error.message };
  }

  await Promise.all([
    syncPostCategories(admin, post.id, data.categoryIds),
    syncPostTags(admin, post.id, data.tagIds),
  ]);

  revalidateBlogPaths(post.slug);
  redirect(`/admin/blogs/${post.id}`);
}

export async function updateBlogPostAction(id: string, formData: FormData) {
  const parsed = parsePostForm(formData);
  if (!parsed.success) return { error: "Invalid blog post data" };

  const admin = await getAdminClient();
  const data = parsed.data;
  const slug = data.slug || slugify(data.title);

  const { data: existing } = await admin
    .from("blog_posts")
    .select("status, published_at")
    .eq("id", id)
    .maybeSingle();

  const publishedAt =
    data.status === "published"
      ? existing?.published_at ?? new Date().toISOString()
      : null;

  const { error } = await admin
    .from("blog_posts")
    .update({
      title: data.title,
      slug,
      excerpt: data.excerpt ?? "",
      content: sanitizeHtml(data.content),
      featured_image: data.featuredImage || null,
      status: data.status,
      seo_title: data.seoTitle || null,
      seo_description: data.seoDescription || null,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "A post with this slug already exists" };
    return { error: error.message };
  }

  await Promise.all([
    syncPostCategories(admin, id, data.categoryIds),
    syncPostTags(admin, id, data.tagIds),
  ]);

  revalidateBlogPaths(slug);
  revalidatePath(`/admin/blogs/${id}`);
  return { success: true };
}

export async function deleteBlogPostAction(id: string) {
  const admin = await getAdminClient();
  const { data: post } = await admin
    .from("blog_posts")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await admin.from("blog_posts").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidateBlogPaths(post?.slug);
  redirect("/admin/blogs");
}

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
});

export async function getBlogCategoriesAction() {
  const admin = await getAdminClient();
  const { data } = await admin
    .from("blog_categories")
    .select("*")
    .order("name");
  return data ?? [];
}

export async function createBlogCategoryAction(formData: FormData) {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: "Invalid category name" };

  const admin = await getAdminClient();
  const slug = parsed.data.slug || slugify(parsed.data.name);
  const { data, error } = await admin
    .from("blog_categories")
    .insert({
      name: parsed.data.name,
      slug,
      description: parsed.data.description ?? null,
    })
    .select("*")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/blogs");
  return { success: true, category: data };
}

export async function deleteBlogCategoryAction(id: string) {
  const admin = await getAdminClient();
  const { error } = await admin.from("blog_categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/blogs");
  return { success: true };
}

const tagSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
});

export async function getBlogTagsAction() {
  const admin = await getAdminClient();
  const { data } = await admin.from("blog_tags").select("*").order("name");
  return data ?? [];
}

export async function createBlogTagAction(formData: FormData) {
  const parsed = tagSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
  });
  if (!parsed.success) return { error: "Invalid tag name" };

  const admin = await getAdminClient();
  const slug = parsed.data.slug || slugify(parsed.data.name);
  const { data, error } = await admin
    .from("blog_tags")
    .insert({ name: parsed.data.name, slug })
    .select("*")
    .single();

  if (error) return { error: error.message };
  return { success: true, tag: data };
}
