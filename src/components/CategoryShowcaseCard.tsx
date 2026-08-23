import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";

interface CategoryShowcaseCardProps {
  slug: string;
  name: string;
  productCount: number;
  image: string;
}

export default function CategoryShowcaseCard({
  slug,
  name,
  productCount,
  image,
}: CategoryShowcaseCardProps) {
  return (
    <Link href={`/categories/${slug}`} className="group block h-full">
      <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-muted">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm">
          <ShoppingBag className="w-4 h-4 text-[#333]" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <p className="text-xs text-white/80 mb-1">{productCount} products</p>
          <p className="text-sm font-medium uppercase tracking-[0.15em]">
            {name}
          </p>
        </div>
      </div>
    </Link>
  );
}
