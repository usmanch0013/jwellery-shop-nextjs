import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { BlogPostCard } from "@/lib/blog/types";
import { formatBlogDate } from "@/lib/blog/format";

export default function BlogSection({ posts }: { posts: BlogPostCard[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <h2 className="text-xl font-medium sm:text-2xl">Blog</h2>
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <div className="relative mb-4 aspect-[3/2] overflow-hidden bg-muted">
                {post.featured_image ? (
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatBlogDate(post.published_at)}
              </p>
              <h3 className="mb-2 text-sm font-medium leading-snug group-hover:underline">
                {post.title}
              </h3>
              <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
                {post.excerpt}
              </p>
              <span className="flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-primary">
                Read more <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
