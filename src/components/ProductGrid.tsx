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
    <section className="bg-white py-8 sm:py-10">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 className="mb-6 text-center font-serif text-xl text-foreground capitalize sm:mb-8 sm:text-2xl lg:text-[28px]">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-4">
          {products.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <p className="font-serif text-xl mb-2">No products yet</p>
              <p className="text-sm text-muted-foreground mb-6">
                Add products from the admin dashboard to populate this page.
              </p>
              <a
                href="/shop"
                className="text-sm text-primary underline"
              >
                View all shop
              </a>
            </div>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
