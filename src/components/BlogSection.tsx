import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { blogPosts } from "@/data/site";

export default function BlogSection() {
  return (
    <section className="py-14 lg:py-20">
      <div className="max-w-[1400px] mx-auto px-4">
        <h2 className="text-2xl font-medium text-center mb-10">Blog posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href="#"
              className="group"
            >
              <div className="relative aspect-[3/2] bg-[#f6f4f2] overflow-hidden mb-4">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-sm font-medium mb-2 group-hover:underline leading-snug">
                {post.title}
              </h3>
              <p className="text-xs text-[#666] mb-3 line-clamp-2">
                {post.excerpt}
              </p>
              <span className="text-xs text-[#999] flex items-center gap-1 group-hover:text-black transition-colors">
                Read more <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
