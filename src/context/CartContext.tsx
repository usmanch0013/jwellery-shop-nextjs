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
import { syncCartItem, clearServerCart } from "@/actions/cart";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "jewelry-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
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
      await syncCartItem(productId, quantity);
    } catch {
      // offline / no supabase
    }
  }, []);

  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      if (product.soldOut) return;
      setItems((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        const newQty = existing ? existing.quantity + quantity : quantity;
        void syncServer(product.id, newQty);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: newQty }
              : item
          );
        }
        return [...prev, { product, quantity }];
      });
    },
    [syncServer]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      void syncServer(productId, 0);
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
    },
    [syncServer]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      void syncServer(productId, quantity);
      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
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
