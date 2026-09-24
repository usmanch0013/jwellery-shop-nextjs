"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Product, ProductVariation } from "@/types";
import { formatPrice } from "@/lib/products/format";
import { discountPercent, isOnSale, normalizeSalePrices } from "@/lib/products/sale";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { splitDescriptionAndFaq } from "@/lib/products/description-faq";
import { formatShortDescription } from "@/lib/products/short-description";
import { sanitizeHtml } from "@/lib/security/sanitize-html";
import { toast } from "sonner";
import PaymentBadges from "./PaymentBadges";
import { cn } from "@/lib/utils";
import { whatsAppUrl } from "@/lib/whatsapp";
import { BRAND_COLORS } from "@/lib/brand/colors";

interface ProductPurchasePanelProps {
  product: Product;
  onVariationChange?: (variation: ProductVariation | null) => void;
}

const BURGUNDY = BRAND_COLORS.burgundy;

function variationLabel(variation: ProductVariation) {
  const attrs = variation.attributes ?? {};
  const parts = [attrs.size, attrs.color].filter(Boolean);
  if (parts.length > 0) return parts.join(" · ");
  return variation.name;
}

function effectiveProduct(product: Product, variation: ProductVariation | null): Product {
  if (!variation) return product;
  const { price, originalPrice } = normalizeSalePrices(
    variation.price ?? product.price,
    variation.originalPrice ?? product.originalPrice ?? null
  );
  return {
    ...product,
    price,
    originalPrice,
    stock: variation.stock,
    soldOut: variation.stock <= 0,
    image: variation.imageUrl || product.image,
  };
}

export default function ProductPurchasePanel({
  product,
  onVariationChange,
}: ProductPurchasePanelProps) {
  const variations = product.variations ?? [];
  const hasVariations = variations.length > 0;
  const defaultVariation =
    variations.find((v) => v.isDefault) ?? variations[0] ?? null;

  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(
    defaultVariation?.id ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [descOpen, setDescOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const router = useRouter();
  const wished = isInWishlist(product.id);

  const selectedVariation = useMemo(
    () => variations.find((v) => v.id === selectedVariationId) ?? null,
    [variations, selectedVariationId]
  );

  const displayProduct = effectiveProduct(product, selectedVariation);
  const stockCount = displayProduct.soldOut ? 0 : (displayProduct.stock ?? 0);

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariationId]);

  useEffect(() => {
    setOpenFaqIndex(null);
    setDescOpen(false);
  }, [product.id]);

  useEffect(() => {
    onVariationChange?.(selectedVariation);
  }, [selectedVariation, onVariationChange]);

  const cartOptions =
    selectedVariation
      ? {
          variationId: selectedVariation.id,
          variationName: variationLabel(selectedVariation),
        }
      : undefined;

  const handleAddToCart = () => {
    if (hasVariations && !selectedVariation) {
      toast.error("Please choose an option first");
      return;
    }
    if (selectedVariation && selectedVariation.stock <= 0) {
      toast.error("This option is out of stock");
      return;
    }
    addToCart(product, quantity, cartOptions);
    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    if (hasVariations && !selectedVariation) {
      toast.error("Please choose an option first");
      return;
    }
    addToCart(product, quantity, cartOptions);
    router.push("/checkout");
  };

  const whatsappHref = whatsAppUrl(
    `Hi, I want to order:\n${product.name}${
      selectedVariation ? ` (${variationLabel(selectedVariation)})` : ""
    }\n${formatPrice(displayProduct.price)}\nQty: ${quantity}`
  );

  const onSale = isOnSale(displayProduct);
  const salePercent = discountPercent(displayProduct);
  const { descriptionHtml: rawDescriptionHtml, faqs: productFaqs } = useMemo(
    () => splitDescriptionAndFaq(product.description),
    [product.description]
  );
  const descriptionHtml = sanitizeHtml(rawDescriptionHtml);
  const shortDescriptionText = useMemo(
    () => formatShortDescription(product.shortDescription),
    [product.shortDescription]
  );

  return (
    <div className="w-full font-sans text-ink">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-sans text-[20px] font-semibold leading-[1.3] tracking-[-0.02em] text-ink sm:text-[24px] lg:text-[26px]">
            {product.name}
          </h1>
          {shortDescriptionText && (
            <p className="mt-2 max-w-[52ch] text-[14px] leading-[1.65] text-ink-muted">
              {shortDescriptionText}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void toggleWishlist(product)}
          className={cn(
            "mt-1 shrink-0 rounded-[5px] p-2 transition-colors",
            wished
              ? "bg-rose-500 text-white"
              : "border border-border-warm text-ink hover:border-[#3b3933]"
          )}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className="h-5 w-5"
            fill={wished ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <p className="font-sans text-[20px] font-medium leading-none text-ink lg:text-[22px]">
          {formatPrice(displayProduct.price)}
        </p>
        {onSale && displayProduct.originalPrice && (
          <>
            <p className="text-[16px] text-ink-soft line-through">
              {formatPrice(displayProduct.originalPrice)}
            </p>
            {salePercent > 0 && (
              <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
                Sale -{salePercent}%
              </span>
            )}
          </>
        )}
      </div>

      {hasVariations && (
        <div className="mt-6 space-y-2.5">
          <p className="text-[14px] font-semibold text-ink">Options</p>
          <div className="flex flex-wrap gap-2">
            {variations.map((variation) => {
              const active = variation.id === selectedVariationId;
              const outOfStock = variation.stock <= 0;
              return (
                <button
                  key={variation.id}
                  type="button"
                  disabled={outOfStock}
                  onClick={() => setSelectedVariationId(variation.id)}
                  className={cn(
                    "rounded-[5px] border px-3 py-1.5 text-[12px] font-medium transition-colors",
                    active
                      ? "border-burgundy bg-burgundy text-white"
                      : "border-border-warm bg-white text-ink hover:border-burgundy/40",
                    outOfStock && "cursor-not-allowed opacity-40"
                  )}
                >
                  {variationLabel(variation)}
                  {outOfStock ? " (Out of stock)" : ""}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!displayProduct.soldOut && stockCount > 0 && (
        <div className="mt-3.5 flex items-center gap-2">
          <span className="h-[8px] w-[8px] shrink-0 rounded-full bg-[#22c55e]" />
          <span className="text-[13px] leading-none text-[#3d8b4a]">
            {stockCount} item{stockCount > 1 ? "s" : ""} in stock
          </span>
        </div>
      )}

      {displayProduct.soldOut && (
        <p className="mt-3.5 text-[13px] text-[#e53935]">Sold out</p>
      )}

      <div className="mt-7 border-y border-border-warm">
        <button
          type="button"
          onClick={() => setDescOpen((o) => !o)}
          className="flex w-full items-center justify-between py-[18px] text-left"
        >
          <span className="text-[14px] font-medium text-ink">
            Description
          </span>
          <span className="relative flex h-3.5 w-3.5 items-center justify-center">
            <span className="absolute h-px w-3.5 bg-[#3b3933]" />
            <span
              className={`absolute h-3.5 w-px bg-[#3b3933] transition-transform duration-200 ease-out ${
                descOpen ? "scale-y-0" : "scale-y-100"
              }`}
            />
          </span>
        </button>

        <div className="product-zeesy-accordion" data-open={descOpen}>
          <div className="overflow-hidden">
            <div
              className="prose prose-sm max-w-none pb-5 text-[14px] leading-[1.7] text-ink-muted"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
            {product.material && (
              <p className="pb-5 text-[#8a8680]">Material: {product.material}</p>
            )}
          </div>
        </div>
      </div>

      {productFaqs.length > 0 && (
        <div className="border-b border-border-warm">
          <p className="py-[18px] text-[14px] font-medium text-ink">
            Frequently Asked Questions
          </p>
          <div className="divide-y divide-[#e8e2d4] border-t border-border-warm">
            {productFaqs.map((faq, index) => {
              const open = openFaqIndex === index;
              return (
                <div key={`${index}-${faq.question.slice(0, 24)}`}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaqIndex(open ? null : index)
                    }
                    className="flex w-full items-center justify-between gap-3 py-4 text-left"
                  >
                    <span className="text-[13px] font-medium leading-snug text-ink">
                      {faq.question}
                    </span>
                    <span className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                      <span className="absolute h-px w-3.5 bg-[#3b3933]" />
                      <span
                        className={`absolute h-3.5 w-px bg-[#3b3933] transition-transform duration-200 ease-out ${
                          open ? "scale-y-0" : "scale-y-100"
                        }`}
                      />
                    </span>
                  </button>
                  <div className="product-zeesy-accordion" data-open={open}>
                    <div className="overflow-hidden">
                      <p className="pb-4 text-[13px] leading-[1.7] text-ink-muted">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!displayProduct.soldOut && (
        <div className="mt-7">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-ink">
              Quantity
            </span>
            <div className="flex h-9 w-[100px] items-center justify-between rounded-[5px] border border-border-warm bg-[#fffdf5]">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-8 items-center justify-center text-ink transition-opacity hover:opacity-60 disabled:opacity-30"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
              <span className="min-w-[20px] text-center text-[14px] font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => Math.min(stockCount, q + 1))
                }
                className="flex h-9 w-8 items-center justify-center text-ink transition-opacity hover:opacity-60 disabled:opacity-30"
                disabled={quantity >= stockCount}
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex h-10 w-full items-center justify-center rounded-[5px] text-[13px] font-medium text-[#fffdf5] transition-opacity duration-200 hover:opacity-90"
              style={{ backgroundColor: BURGUNDY }}
            >
              Add to cart
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="flex h-10 w-full items-center justify-center rounded-[5px] border bg-transparent text-[13px] font-medium transition-colors duration-200 hover:bg-burgundy/5"
              style={{ borderColor: BURGUNDY, color: BURGUNDY }}
            >
              Buy it now
            </button>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-[5px] bg-[#25D366] text-[13px] font-medium text-white transition-colors duration-200 hover:bg-[#20bd5a]"
            >
              <WhatsAppIcon />
              Order on WhatsApp
            </a>
          </div>

          <PaymentBadges />
        </div>
      )}
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
