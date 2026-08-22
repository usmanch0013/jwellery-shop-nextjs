"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { products, formatPrice } from "@/data/products";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="sr-only">Search products</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jewelry..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 border-0 shadow-none focus-visible:ring-0 text-base"
              autoFocus
            />
          </div>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto">
          {query && results.length === 0 && (
            <p className="p-6 text-center text-muted-foreground text-sm">
              No products found for &quot;{query}&quot;
            </p>
          )}
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors border-b last:border-0"
            >
              <div className="relative w-14 h-14 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {product.category}
                </p>
              </div>
              <span className="text-sm font-medium text-gold">
                {formatPrice(product.price)}
              </span>
            </Link>
          ))}
          {!query && (
            <p className="p-6 text-center text-muted-foreground text-sm">
              Start typing to search our collection
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
