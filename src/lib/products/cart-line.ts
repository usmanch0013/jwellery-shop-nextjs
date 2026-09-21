export function getCartLineId(productId: string, variationId?: string) {
  return variationId ? `${productId}::${variationId}` : productId;
}
