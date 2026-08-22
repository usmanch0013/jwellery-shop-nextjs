"use client";

import { useState } from "react";
import { ShoppingBag, Check, Heart } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

export default function AddToCartButton({
  product,
  className = "",
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const wishlisted = isInWishlist(product.id);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    toast.success("Added to cart", { description: product.name });
    setTimeout(() => setAdded(false), 2000);
  };

  const toggleWishlist = () => {
    if (wishlisted) {
      removeFromWishlist(product.id);
      toast.info("Removed from wishlist");
    } else {
      addToWishlist(product);
      toast.success("Added to wishlist");
    }
  };

  return (
    <div className={`flex gap-3 ${className}`}>
      <Button
        onClick={handleAdd}
        disabled={added}
        className="flex-1 bg-gold hover:bg-gold-dark text-white uppercase tracking-widest h-12"
      >
        {added ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Added to Cart
          </>
        ) : (
          <>
            <ShoppingBag className="w-4 h-4 mr-2" />
            Add to Cart
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-12 w-12"
        onClick={toggleWishlist}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={`w-5 h-5 ${wishlisted ? "fill-rose-gold text-rose-gold" : ""}`}
        />
      </Button>
    </div>
  );
}
