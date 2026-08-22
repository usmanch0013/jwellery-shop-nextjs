"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";
import StarRating from "./StarRating";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface QuickViewDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickViewDialog({
  product,
  open,
  onOpenChange,
}: QuickViewDialogProps) {
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product);
    toast.success("Added to cart");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden border-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="relative aspect-square bg-muted">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6 lg:p-8 flex flex-col justify-center bg-background">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
              {product.category.replace("-", " ")}
            </p>
            <h2 className="font-serif text-xl lg:text-2xl mb-3 text-foreground">
              {product.name}
            </h2>
            <StarRating rating={product.rating ?? 5} reviews={product.reviews} />
            <p className="text-xl font-medium mt-4 mb-4">
              {formatPrice(product.price)}
            </p>
            <p className="text-sm text-muted-foreground mb-6 line-clamp-4 leading-relaxed">
              {product.description}
            </p>
            {product.soldOut ? (
              <span className="inline-block bg-black text-white text-xs uppercase tracking-wider px-4 py-3.5 text-center">
                Sold out
              </span>
            ) : (
              <button
                onClick={handleAdd}
                className="flex items-center justify-center gap-2 bg-primary text-white text-sm py-3.5 hover:bg-emerald-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add to cart
              </button>
            )}
            <Link
              href={`/products/${product.id}`}
              onClick={() => onOpenChange(false)}
              className="text-center text-sm text-muted-foreground mt-4 hover:text-primary underline"
            >
              View full details
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
