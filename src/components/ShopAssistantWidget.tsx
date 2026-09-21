"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Loader2,
  Plus,
  ShoppingBag,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { BRAND } from "@/lib/brand";
import { formatPrice, productPath } from "@/lib/products/format";
import {
  ASSISTANT_QUICK_SUGGESTIONS,
  welcomeAssistantMessage,
} from "@/lib/shop-assistant/copy";
import type {
  AssistantHistoryItem,
  AssistantProductPayload,
  ShopAssistantResponse,
} from "@/lib/shop-assistant/types";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: AssistantProductPayload[];
};

function asProduct(p: AssistantProductPayload): Product {
  return {
    ...p,
    description: p.description ?? "",
    reviews: 0,
    slug: p.slug ?? p.id,
  };
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ShopAssistantWidget() {
  const pathname = usePathname();
  const { addToCart, totalItems } = useCart();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([
    ...ASSISTANT_QUICK_SUGGESTIONS,
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);

  useEffect(() => {
    if (!open || seeded.current) return;
    seeded.current = true;
    setMessages([
      {
        id: newId(),
        role: "assistant",
        content: welcomeAssistantMessage(),
      },
    ]);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setInput("");
      const userMsg: ChatMessage = {
        id: newId(),
        role: "user",
        content: trimmed,
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      const history: AssistantHistoryItem[] = [...messages, userMsg].map(
        (m) => ({
          role: m.role,
          content: m.content,
        })
      );

      try {
        const res = await fetch("/api/shop-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, history }),
        });
        const data = (await res.json()) as ShopAssistantResponse & {
          error?: string;
        };

        if (!res.ok) {
          throw new Error(data.error ?? "Request failed");
        }

        setSuggestions(data.suggestions ?? []);
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: "assistant",
            content: data.message,
            products: data.products,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: "assistant",
            content:
              "Sorry, I’m having trouble right now. Try again or message us on WhatsApp.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages]
  );

  if (pathname.startsWith("/admin") || pathname.startsWith("/account")) {
    return null;
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[48] bg-black/40 sm:bg-black/25"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className="fixed z-[49] flex flex-col items-start gap-2"
        style={{
          bottom: "calc(var(--float-bottom) + 3.5rem)",
          left: "var(--float-left)",
        }}
      >
        <div
          className={cn(
            "flex w-[min(100vw-1.25rem,24rem)] flex-col overflow-hidden rounded-[5px] border border-white/10 bg-[#141414] text-white shadow-2xl transition-all duration-200 sm:w-[24rem]",
            open
              ? "pointer-events-auto max-h-[min(78vh,640px)] opacity-100"
              : "pointer-events-none max-h-0 opacity-0"
          )}
          role="dialog"
          aria-label={`${BRAND.name} shopping assistant`}
          aria-hidden={!open}
        >
          <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#0B3D35] text-champagne">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{BRAND.name} AI</p>
              <p className="text-[10px] text-white/55">Personal shopper</p>
            </div>
            <Link
              href="/cart"
              className="relative rounded-[5px] p-2 text-white/80 hover:bg-white/10"
              aria-label="Cart"
              onClick={() => setOpen(false)}
            >
              <ShoppingBag className="size-[18px]" strokeWidth={1.6} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-champagne text-[9px] font-bold text-[#141414]">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              type="button"
              className="rounded-[5px] p-2 text-white/80 hover:bg-white/10"
              aria-label="Close assistant"
              onClick={() => setOpen(false)}
            >
              <X className="size-5" />
            </button>
          </header>

          <div
            ref={scrollRef}
            className="min-h-[220px] flex-1 space-y-4 overflow-y-auto px-4 py-4"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col gap-2",
                  msg.role === "user" ? "items-end" : "items-start"
                )}
              >
                {msg.content ? (
                  <div
                    className={cn(
                      "max-w-[92%] rounded-[5px] px-3 py-2 text-[13px] leading-relaxed",
                      msg.role === "user"
                        ? "bg-[#0B3D35] text-white"
                        : "bg-white/8 text-white/90"
                    )}
                  >
                    {msg.content}
                  </div>
                ) : null}

                {msg.products?.length ? (
                  <div className="w-full space-y-2">
                    {msg.products.map((product) => (
                      <div
                        key={product.id}
                        className="flex gap-3 rounded-[5px] bg-white/6 p-2 ring-1 ring-white/10"
                      >
                        <Link
                          href={productPath(product)}
                          className="relative size-16 shrink-0 overflow-hidden rounded-[5px] bg-[#f2efe3]"
                          onClick={() => setOpen(false)}
                        >
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : null}
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-1">
                          <Link
                            href={productPath(product)}
                            className="line-clamp-2 text-[12px] font-medium text-white hover:text-champagne"
                            onClick={() => setOpen(false)}
                          >
                            {product.name}
                          </Link>
                          <p className="text-[12px] font-semibold text-champagne">
                            {formatPrice(product.price)}
                          </p>
                          <button
                            type="button"
                            disabled={product.soldOut}
                            className="site-btn inline-flex w-full items-center justify-center gap-1 bg-white py-1.5 text-[11px] font-semibold text-[#141414] hover:bg-champagne disabled:opacity-50"
                            onClick={() => addToCart(asProduct(product), 1)}
                          >
                            <Plus className="size-3.5" />
                            {product.soldOut ? "Sold out" : "Add to cart"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-[12px] text-white/50">
                <Loader2 className="size-4 animate-spin" />
                Finding pieces…
              </div>
            )}
          </div>

          {!loading && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-white/10 px-3 py-2">
              {suggestions.slice(0, 4).map((s) => (
                <button
                  key={s}
                  type="button"
                  className="rounded-[5px] border border-white/15 px-2 py-1 text-[10px] text-white/75 hover:border-champagne/50 hover:text-champagne"
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            className="border-t border-white/10 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <div className="flex items-center gap-2 rounded-[5px] bg-white/8 px-3 py-2 ring-1 ring-white/10 focus-within:ring-champagne/40">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message ${BRAND.shortName} AI`}
                className="min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder:text-white/40 outline-none"
                maxLength={500}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-[5px] p-1.5 text-champagne hover:bg-white/10 disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="size-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed z-[49] flex items-center gap-2 rounded-[5px] bg-[#141414] px-3.5 py-2.5 text-white shadow-lg ring-1 ring-white/10 transition hover:bg-[#1f1f1f]",
          open && "ring-champagne/40"
        )}
        style={{
          bottom: "var(--float-bottom)",
          left: "var(--float-left)",
        }}
        aria-expanded={open}
        aria-label={`Open ${BRAND.name} AI assistant`}
      >
        <Sparkles className="size-5 text-champagne" />
        <span className="hidden text-[12px] font-medium sm:inline">
          {BRAND.shortName} AI
        </span>
      </button>
    </>
  );
}
