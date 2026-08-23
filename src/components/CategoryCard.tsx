import Link from "next/link";
import Image from "next/image";
import { CategoryInfo } from "@/types";

interface CategoryCardProps {
  category: CategoryInfo;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.slug}`} className="group block">
      <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-muted">
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 640px) 50vw, 16vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="text-[10px] text-white/70 mb-0.5">
            {category.productCount} products
          </p>
          <h3 className="text-xs font-medium uppercase tracking-[0.12em]">
            {category.name}
          </h3>
        </div>
      </div>
    </Link>
  );
}
