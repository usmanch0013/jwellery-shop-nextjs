import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/blog/queries";
import { formatBlogDate } from "@/lib/blog/format";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  return {
    title: post.seo_title || `${post.title} | Lumière Blog`,
    description: post.seo_description || post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 lg:py-14">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to blog
      </Link>

      <header className="mb-8">
        <div className="mb-3 flex flex-wrap gap-2">
          {post.categories.map((cat) => (
            <span
              key={cat.id}
              className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
            >
              {cat.name}
            </span>
          ))}
        </div>
        <h1 className="font-serif text-3xl leading-tight lg:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {formatBlogDate(post.published_at)}
          {post.author_name ? ` · ${post.author_name}` : ""}
        </p>
      </header>

      {post.featured_image && (
        <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            unoptimized
          />
        </div>
      )}

      <div
        className="blog-content space-y-4 text-[15px] leading-7 text-foreground [&_a]:text-primary [&_a]:underline [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-2xl [&_h3]:mt-6 [&_h3]:font-serif [&_h3]:text-xl [&_li]:ml-5 [&_ol]:list-decimal [&_p]:text-muted-foreground [&_ul]:list-disc"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-border/60 pt-6">
          {post.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
