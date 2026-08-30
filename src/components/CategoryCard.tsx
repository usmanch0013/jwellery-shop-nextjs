import Link from "next/link";
import Image from "next/image";
import { CategoryInfo } from "@/types";

interface CategoryCardProps {
  category: CategoryInfo;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.slug}`} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-[16px] bg-[#f5f5f5]">
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white sm:p-4">
          <p className="mb-0.5 text-[10px] text-white/80 sm:text-[11px]">
            {category.productCount} products
          </p>
          <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs">
            {category.name}
          </h3>
        </div>
      </div>
    </Link>
  );
}
