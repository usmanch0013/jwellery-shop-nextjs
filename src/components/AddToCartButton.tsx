"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
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
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    toast.success("Added to cart");
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={added || product.soldOut}
      className={`flex items-center justify-center gap-2 w-full bg-[#6d2135] text-white text-sm py-3.5 hover:bg-[#5a1b2c] transition-colors disabled:opacity-70 ${className}`}
    >
      <Plus className="w-4 h-4" />
      {added ? "Added to Cart" : "Add to Cart"}
    </button>
  );
}
