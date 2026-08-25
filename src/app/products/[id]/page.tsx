import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import CustomerReviews from "@/components/product/CustomerReviews";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPurchasePanel from "@/components/product/ProductPurchasePanel";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products/queries";

export const revalidate = 3600;
export const dynamicParams = true;

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

function getGalleryImages(product: {
  image: string;
  hoverImage?: string;
  images?: string[];
}) {
  const fromProduct = [
    product.image,
    product.hoverImage,
    ...(product.images ?? []),
  ].filter((img): img is string => Boolean(img));

  const unique = [...new Set(fromProduct)];
  while (unique.length < 4 && unique.length > 0) {
    unique.push(unique[unique.length % fromProduct.length]);
  }
  return unique.slice(0, 5);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductBySlug(id);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product, 4);
  const miniRecommendations = relatedProducts.slice(0, 2);
  const galleryImages = getGalleryImages(product);

  return (
    <div className="bg-background">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
        <div className="py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 xl:gap-20 items-start">
            <ProductGallery images={galleryImages} productName={product.name} />
            <ProductPurchasePanel
              product={product}
              miniRecommendations={miniRecommendations}
            />
          </div>
        </div>

        <CustomerReviews productId={product.id} />

        {relatedProducts.length > 0 && (
          <section className="pb-16 lg:pb-20">
            <h2 className="text-[22px] lg:text-[26px] font-medium text-foreground text-center mb-10 lg:mb-12">
              You may also like
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 lg:gap-2">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
