import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getProductById, products, formatPrice } from "@/data/products";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) notFound();

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Shop", href: "/shop" },
            {
              label: product.category,
              href: `/categories/${product.category}`,
            },
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              {product.isNew && (
                <Badge className="bg-charcoal text-cream rounded-none uppercase">
                  New
                </Badge>
              )}
              {product.isBestseller && (
                <Badge className="bg-gold text-white rounded-none uppercase">
                  Bestseller
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-gold uppercase tracking-[0.3em] text-sm mb-2 capitalize">
              {product.category}
            </p>
            <h1 className="text-3xl lg:text-4xl font-serif font-semibold mb-4">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-medium">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <Badge variant="secondary" className="text-rose-gold">
                    Save{" "}
                    {Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                        100
                    )}
                    %
                  </Badge>
                </>
              )}
            </div>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8 p-6 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Material
                </p>
                <p className="font-medium">{product.material}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Category
                </p>
                <p className="font-medium capitalize">{product.category}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Shipping
                </p>
                <p className="font-medium">Free over $500</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Warranty
                </p>
                <p className="font-medium">Lifetime</p>
              </div>
            </div>

            <AddToCartButton product={product} />

            <Separator className="my-8" />

            <div className="text-sm text-muted-foreground space-y-2">
              <p>✓ Complimentary gift wrapping</p>
              <p>✓ 30-day hassle-free returns</p>
              <p>✓ Lifetime craftsmanship warranty</p>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl font-serif font-semibold mb-8 text-center">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
