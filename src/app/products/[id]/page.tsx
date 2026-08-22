import { notFound } from "next/navigation";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";
import StarRating from "@/components/StarRating";
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
    <div className="py-10 bg-[#faf7f2]">
      <div className="max-w-[1400px] mx-auto px-4">
        <Breadcrumbs
          items={[
            { label: "Shop", href: "/shop" },
            {
              label: product.category.replace("-", " "),
              href: `/categories/${product.category}`,
            },
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#ece6dc] col-span-2">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {product.hoverImage && (
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#ece6dc]">
                <Image
                  src={product.hoverImage}
                  alt={`${product.name} alternate`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-[10px] text-[#999] uppercase tracking-widest mb-2">
              {product.category.replace("-", " ")}
            </p>
            <h1 className="font-serif text-2xl lg:text-3xl mb-3 text-[#2a2a2a]">
              {product.name}
            </h1>
            <StarRating rating={product.rating ?? 5} reviews={product.reviews} />
            <p className="text-2xl font-medium mt-4 mb-6">
              {formatPrice(product.price)}
            </p>
            <p className="text-sm text-[#666] leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8 p-5 bg-white rounded-xl text-sm border border-[#ece6dc]">
              <div>
                <p className="text-[#999] text-xs uppercase mb-1">Material</p>
                <p>{product.material}</p>
              </div>
              <div>
                <p className="text-[#999] text-xs uppercase mb-1">Category</p>
                <p className="capitalize">
                  {product.category.replace("-", " ")}
                </p>
              </div>
            </div>

            {!product.soldOut && <AddToCartButton product={product} />}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl text-center mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
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
