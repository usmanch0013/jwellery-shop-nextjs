"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/data/products";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const wishlisted = isInWishlist(product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (wishlisted) {
      removeFromWishlist(product.id);
      toast.info("Removed from wishlist");
    } else {
      addToWishlist(product);
      toast.success("Added to wishlist");
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success("Added to cart", {
      description: product.name,
    });
  };

  return (
    <div className="group relative">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted rounded-lg mb-4">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNew && (
              <Badge className="bg-charcoal text-cream rounded-none uppercase text-[10px] tracking-wider">
                New
              </Badge>
            )}
            {product.isBestseller && (
              <Badge className="bg-gold text-white rounded-none uppercase text-[10px] tracking-wider">
                Bestseller
              </Badge>
            )}
          </div>
          {product.originalPrice && (
            <Badge className="absolute top-3 right-3 bg-rose-gold text-white rounded-none uppercase text-[10px] tracking-wider">
              Sale
            </Badge>
          )}

          <div className="absolute inset-x-0 bottom-0 p-4 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button
              size="sm"
              className="flex-1 bg-gold hover:bg-gold-dark text-white uppercase text-xs tracking-wider h-9"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
              Add to Cart
            </Button>
            <Link
              href={`/products/${product.id}`}
              className="inline-flex items-center justify-center h-9 w-9 bg-white/90 hover:bg-white rounded-lg"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Link>

      <button
        onClick={toggleWishlist}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={`w-4 h-4 ${wishlisted ? "fill-rose-gold text-rose-gold" : "text-charcoal"}`}
        />
      </button>

      <Link href={`/products/${product.id}`} className="block space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {product.material}
        </p>
        <h3 className="font-serif text-base text-foreground group-hover:text-gold transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-medium">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-muted-foreground line-through text-sm">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
