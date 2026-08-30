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
  const galleryImages = getGalleryImages(product);
  const productCode = (product.legacyId ?? product.id).slice(0, 22).toUpperCase();

  return (
    <div className="product-zeesy bg-white">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
        <div className="py-6 lg:py-10">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 xl:gap-14">
            <ProductGallery
              images={galleryImages}
              productName={product.name}
              productCode={productCode}
            />
            <ProductPurchasePanel product={product} />
          </div>
        </div>

        <CustomerReviews productId={product.id} />

        {relatedProducts.length > 0 && (
          <section className="pb-16 lg:pb-20">
            <h2 className="mb-10 text-center font-sans text-[22px] font-medium text-[#3b3933] lg:mb-12 lg:text-[24px]">
              You may also like
            </h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
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
