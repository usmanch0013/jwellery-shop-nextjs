"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { Product } from "@/types";
import { toggleWishlistAction, fetchWishlistItems } from "@/actions/wishlist";

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

const WISHLIST_STORAGE_KEY = "jewelry-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    async function hydrate() {
      try {
        const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
        const localItems: Product[] = stored ? JSON.parse(stored) : [];
        const serverItems = await fetchWishlistItems();

        if (serverItems.length > 0) {
          const merged = [...serverItems];
          for (const item of localItems) {
            if (!merged.some((p) => p.id === item.id)) merged.push(item);
          }
          setItems(merged);
        } else if (localItems.length > 0) {
          setItems(localItems);
        }
      } catch {
        // ignore
      }
      setIsHydrated(true);
    }
    void hydrate();
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addToWishlist = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => items.some((p) => p.id === productId),
    [items]
  );

  const toggleWishlist = useCallback(
    async (product: Product) => {
      const result = await toggleWishlistAction(product.id);
      if (result.error && result.error !== "Please login") {
        return;
      }
      if (result.success) {
        if (result.inWishlist) addToWishlist(product);
        else removeFromWishlist(product.id);
      } else {
        // guest fallback — local only
        if (isInWishlist(product.id)) removeFromWishlist(product.id);
        else addToWishlist(product);
      }
    },
    [addToWishlist, isInWishlist, removeFromWishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context)
    throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
