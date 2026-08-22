import { Product } from "@/types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  title?: string;
  onQuickView?: (product: Product) => void;
}

export default function ProductGrid({
  products,
  title,
  onQuickView,
}: ProductGridProps) {
  return (
    <section className="py-8 bg-background">
      <div className="max-w-[1400px] mx-auto px-4">
        {title && (
          <h2 className="font-serif text-2xl lg:text-[28px] text-center mb-8 text-foreground capitalize">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
