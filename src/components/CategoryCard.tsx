import Link from "next/link";
import Image from "next/image";

interface CategoryCardProps {
  slug: string;
  name: string;
  description: string;
  image: string;
}

export default function CategoryCard({
  slug,
  name,
  description,
  image,
}: CategoryCardProps) {
  return (
    <Link href={`/categories/${slug}`} className="group relative block">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-2xl font-serif text-cream mb-1">{name}</h3>
          <p className="text-cream/70 text-sm">{description}</p>
          <span className="inline-block mt-3 text-gold text-sm uppercase tracking-wider group-hover:underline">
            Shop Now →
          </span>
        </div>
      </div>
    </Link>
  );
}
