"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { Product, CartItem } from "@/types";
import { getCartLineId } from "@/lib/products/cart-line";
import { syncCartItem, clearServerCart } from "@/actions/cart";

export type AddToCartOptions = {
  variationId?: string;
  variationName?: string;
};

interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    options?: AddToCartOptions
  ) => void;
  removeFromCart: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "jewelry-cart";

function normalizeCartItem(item: CartItem): CartItem {
  const lineId =
    item.lineId ??
    getCartLineId(item.product.id, item.variationId);
  return { ...item, lineId };
}

function productForCartLine(product: Product, options?: AddToCartOptions): Product {
  if (!options?.variationId || !product.variations?.length) {
    return product;
  }

  const variation = product.variations.find((v) => v.id === options.variationId);
  if (!variation) return product;

  const label = options.variationName ?? variation.name;
  return {
    ...product,
    name: `${product.name} (${label})`,
    price: variation.price ?? product.price,
    originalPrice: variation.originalPrice ?? product.originalPrice,
    stock: variation.stock,
    image: variation.imageUrl || product.image,
    soldOut: variation.stock <= 0,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        setItems(parsed.map(normalizeCartItem));
      }
    } catch {
      // ignore
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const syncServer = useCallback(async (productId: string, quantity: number) => {
    try {
      const result = await syncCartItem(productId, quantity);
      if (!result.success && result.error) {
        console.warn("Cart sync:", result.error);
      }
    } catch {
      // offline / no supabase
    }
  }, []);

  const addToCart = useCallback(
    (product: Product, quantity = 1, options?: AddToCartOptions) => {
      const lineProduct = productForCartLine(product, options);
      if (lineProduct.soldOut) return;

      const lineId = getCartLineId(product.id, options?.variationId);
      const maxQty = lineProduct.stock ?? 50;

      setItems((prev) => {
        const existing = prev.find((item) => item.lineId === lineId);
        const newQty = Math.min(
          maxQty,
          existing ? existing.quantity + quantity : quantity
        );
        void syncServer(product.id, newQty);
        if (existing) {
          return prev.map((item) =>
            item.lineId === lineId ? { ...item, quantity: newQty } : item
          );
        }
        return [
          ...prev,
          {
            product: lineProduct,
            quantity: newQty,
            lineId,
            variationId: options?.variationId,
            variationName: options?.variationName,
          },
        ];
      });
    },
    [syncServer]
  );

  const removeFromCart = useCallback(
    (lineId: string) => {
      const item = items.find((entry) => entry.lineId === lineId);
      if (item) void syncServer(item.product.id, 0);
      setItems((prev) => prev.filter((entry) => entry.lineId !== lineId));
    },
    [items, syncServer]
  );

  const updateQuantity = useCallback(
    (lineId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(lineId);
        return;
      }
      setItems((prev) => {
        const item = prev.find((entry) => entry.lineId === lineId);
        if (!item) return prev;
        const maxQty = item.product.stock ?? 50;
        const capped = Math.min(maxQty, quantity);
        void syncServer(item.product.id, capped);
        return prev.map((entry) =>
          entry.lineId === lineId ? { ...entry, quantity: capped } : entry
        );
      });
    },
    [removeFromCart, syncServer]
  );

  const clearCart = useCallback(() => {
    void clearServerCart();
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
