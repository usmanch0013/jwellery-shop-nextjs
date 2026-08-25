export function formatPrice(price: number): string {
  return `Rs. ${price.toLocaleString("en-PK")}`;
}

export function productPath(product: { id: string; slug?: string }): string {
  return `/products/${product.slug ?? product.id}`;
}
