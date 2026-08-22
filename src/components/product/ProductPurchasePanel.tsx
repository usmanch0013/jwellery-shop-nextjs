"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import PaymentBadges from "./PaymentBadges";
import ProductMiniRecommendations from "./ProductMiniRecommendations";

interface ProductPurchasePanelProps {
  product: Product;
  miniRecommendations: Product[];
}

const WHATSAPP_NUMBER = "923001234567";

export default function ProductPurchasePanel({
  product,
  miniRecommendations,
}: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [descOpen, setDescOpen] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();

  const stockCount = product.soldOut ? 0 : 1;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push("/cart");
  };

  const whatsappMessage = encodeURIComponent(
    `Hi, I want to order:\n${product.name}\n${formatPrice(product.price)}\nQty: ${quantity}`
  );

  return (
    <div className="lg:pl-4 xl:pl-8">
      <h1 className="text-[22px] lg:text-[26px] font-medium text-foreground leading-snug mb-4">
        {product.name}
      </h1>

      <p className="text-[20px] lg:text-[22px] font-medium text-foreground mb-5">
        {formatPrice(product.price)}
      </p>

      {!product.soldOut && stockCount > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#e53935]" />
          <span className="text-sm text-[#555]">
            {stockCount} item{stockCount > 1 ? "s" : ""} in stock
          </span>
        </div>
      )}

      {product.soldOut && (
        <p className="text-sm text-[#e53935] mb-6">Sold out</p>
      )}

      <div className="border-t border-border">
        <button
          type="button"
          onClick={() => setDescOpen((o) => !o)}
          className="flex items-center justify-between w-full py-4 text-left"
        >
          <span className="text-[15px] font-medium text-foreground">
            Description
          </span>
          <Plus
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              descOpen ? "rotate-45" : ""
            }`}
          />
        </button>
        {descOpen && (
          <div className="pb-5 text-sm text-muted-foreground leading-relaxed">
            <p>{product.description}</p>
            <p className="mt-3 text-[#888]">
              Material: {product.material}
            </p>
          </div>
        )}
      </div>

      {!product.soldOut && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center border border-[#ddd] w-fit rounded overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-11 h-11 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center text-sm font-medium">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-11 h-11 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="col-span-1 bg-primary text-white text-sm py-3.5 hover:bg-emerald-dark transition-colors"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="col-span-1 border border-primary text-primary text-sm py-3.5 hover:bg-primary/5 transition-colors"
            >
              Buy it now
            </button>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white text-sm py-3.5 hover:bg-[#20bd5a] transition-colors"
          >
            <WhatsAppIcon />
            Order on WhatsApp
          </a>

          <PaymentBadges />
        </div>
      )}

      <ProductMiniRecommendations products={miniRecommendations} />
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
