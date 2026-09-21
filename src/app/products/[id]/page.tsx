import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRAND, absoluteUrl } from "@/lib/brand";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import CustomerReviews from "@/components/product/CustomerReviews";
import ProductDetailView from "@/components/product/ProductDetailView";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products/queries";

export const revalidate = 3600;
export const dynamicParams = true;

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductBySlug(id);
  if (!product) return { title: "Product not found" };

  const title = `${product.name} | ${BRAND.name}`;
  const description =
    product.description?.replace(/<[^>]+>/g, " ").slice(0, 160).trim() ||
    `Buy ${product.name} — artificial jewellery from ${BRAND.name}. Shop at ${BRAND.domain}.`;

  return {
    title,
    description,
    alternates: { canonical: `/products/${id}` },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/products/${id}`),
      images: product.image ? [{ url: product.image }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductBySlug(id);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product, 4);
  const productCode = (product.legacyId ?? product.id).slice(0, 22).toUpperCase();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image ? [product.image] : undefined,
    description: product.description?.slice(0, 500),
    sku: product.sku ?? productCode,
    brand: { "@type": "Brand", name: BRAND.name },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/products/${id}`),
      priceCurrency: "PKR",
      price: product.price,
      availability:
        !product.soldOut && (product.stock ?? 1) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="product-zeesy bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="py-6 lg:py-10">
          <Breadcrumbs
            items={[
              { label: "Shop", href: "/shop" },
              {
                label: product.category.replace(/-/g, " "),
                href: `/categories/${product.category}`,
              },
              { label: product.name },
            ]}
          />
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 xl:gap-14">
            <ProductDetailView product={product} productCode={productCode} />
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
