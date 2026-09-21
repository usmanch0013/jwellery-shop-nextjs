"use client";

import { useCallback, useMemo, useState } from "react";
import type { Product, ProductVariation } from "@/types";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPurchasePanel from "@/components/product/ProductPurchasePanel";

function buildGalleryImages(product: Product) {
  const fromProduct = [
    product.image,
    product.hoverImage,
    ...(product.images ?? []),
  ].filter((img): img is string => Boolean(img));

  const fromVariations = (product.variations ?? [])
    .map((v) => v.imageUrl)
    .filter((url): url is string => Boolean(url));

  const unique = [...new Set([...fromProduct, ...fromVariations])];
  while (unique.length < 4 && unique.length > 0) {
    unique.push(unique[unique.length % fromProduct.length] || unique[0]);
  }
  return unique.slice(0, 8);
}

function galleryWithFeatured(images: string[], featured?: string | null) {
  if (!featured) return images;
  const rest = images.filter((url) => url !== featured);
  return [featured, ...rest];
}

export default function ProductDetailView({
  product,
  productCode,
}: {
  product: Product;
  productCode: string;
}) {
  const baseGallery = useMemo(() => buildGalleryImages(product), [product]);
  const defaultVariationImage =
    product.variations?.find((v) => v.isDefault)?.imageUrl ??
    product.variations?.[0]?.imageUrl ??
    null;
  const [featuredImage, setFeaturedImage] = useState<string | null>(
    defaultVariationImage
  );

  const galleryImages = useMemo(
    () => galleryWithFeatured(baseGallery, featuredImage),
    [baseGallery, featuredImage]
  );

  const handleVariationChange = useCallback(
    (variation: ProductVariation | null) => {
      const next =
        variation?.imageUrl?.trim() ||
        product.variations?.find((v) => v.id === variation?.id)?.imageUrl ||
        null;
      setFeaturedImage(next);
    },
    [product.variations]
  );

  return (
    <>
      <ProductGallery
        images={galleryImages}
        productName={product.name}
        productCode={productCode}
      />
      <ProductPurchasePanel
        product={product}
        onVariationChange={handleVariationChange}
      />
    </>
  );
}
