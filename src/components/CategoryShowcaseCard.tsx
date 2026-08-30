import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";

interface CategoryShowcaseCardProps {
  slug: string;
  name: string;
  productCount: number;
  image: string;
  href?: string;
}

export default function CategoryShowcaseCard({
  slug,
  name,
  productCount,
  image,
  href,
}: CategoryShowcaseCardProps) {
  return (
    <Link href={href ?? `/categories/${slug}`} className="group block h-full">
      <div className="relative aspect-[2/3] overflow-hidden rounded-[16px] bg-[#f5f5f5]">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm sm:right-4 sm:top-4 sm:h-9 sm:w-9">
          <ShoppingBag className="h-4 w-4 text-[#333]" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white sm:p-5">
          <p className="mb-1 text-[11px] text-white/80 sm:text-xs">{productCount} products</p>
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] sm:text-sm">
            {name}
          </p>
        </div>
      </div>
    </Link>
  );
}
