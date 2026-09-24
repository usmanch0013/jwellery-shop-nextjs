import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { BlogPostCard } from "@/lib/blog/types";
import { formatBlogDate } from "@/lib/blog/format";

export default function BlogSection({ posts }: { posts: BlogPostCard[] }) {
  return (
    <section id="blog" className="bg-[#F6F1E8] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-3 sm:mb-10 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.28em] text-emerald/70">
              Journal
            </p>
            <h2 className="font-serif text-xl text-foreground sm:text-2xl lg:text-[28px]">
              From the Blog
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Styling ideas, jewellery care, and fresh looks from SHE Collection.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.14em] text-emerald transition-colors hover:text-champagne sm:text-xs"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-border-warm bg-white px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              New stories are on the way. Visit the blog for jewellery tips and inspiration.
            </p>
            <Link
              href="/blog"
              className="site-btn mt-4 bg-emerald px-5 text-white"
            >
              Open blog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-2xl bg-white ring-1 ring-[#efe9dc] transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[3/2] overflow-hidden bg-cream">
                  {post.featured_image ? (
                    <Image
                      src={post.featured_image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-serif text-lg text-[#c9a96e]">
                      SHE
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {formatBlogDate(post.published_at)}
                  </p>
                  <h3 className="mt-1.5 font-serif text-[17px] leading-snug text-ink group-hover:underline">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald">
                    Read more <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
