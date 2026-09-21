/** Shared product-card image framing (main + hover use same box, different focal point). */
export function productCardImageClass(src: string, primaryImage: string) {
  const isPrimary = src === primaryImage;
  return isPrimary
    ? "object-cover object-[50%_22%]"
    : "object-cover object-center";
}

export const PRODUCT_CARD_THUMB_IMAGE_CLASS = "object-cover object-center";
