"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, productPath } from "@/lib/products/format";
import { discountPercent, isOnSale } from "@/lib/products/sale";
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

  const onSale = isOnSale(product);
  const salePercent = discountPercent(product);

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
          <div className="relative aspect-[2/3] overflow-hidden rounded-[1.6rem] bg-[#f2efe3] sm:rounded-none">
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
            <div className="flex flex-wrap items-center gap-2 mt-4 mb-4">
              <p className="text-xl font-medium">{formatPrice(product.price)}</p>
              {onSale && product.originalPrice && (
                <p className="text-base text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </p>
              )}
              {onSale && (
                <span className="bg-rose-600 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                  Sale {salePercent > 0 ? `-${salePercent}%` : ""}
                </span>
              )}
            </div>
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
                className="flex items-center justify-center gap-2 rounded-[1.6rem] bg-[#6F112B] py-3.5 text-sm text-[#fffdf5] transition-colors hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
                Add to cart
              </button>
            )}
            <Link
              href={productPath(product)}
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
