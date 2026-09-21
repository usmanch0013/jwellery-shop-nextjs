"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { BRAND } from "@/lib/brand";
import {
  cartWhatsAppMessage,
  defaultOrderWhatsAppMessage,
  whatsAppUrl,
} from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      />
    </svg>
  );
}

export default function WhatsAppWidget() {
  const pathname = usePathname();
  const { items } = useCart();
  const [labelOpen, setLabelOpen] = useState(false);

  const href = useMemo(() => {
    const onCart = pathname === "/cart" || pathname.startsWith("/checkout");
    const message =
      onCart && items.length > 0
        ? cartWhatsAppMessage(items)
        : defaultOrderWhatsAppMessage();
    return whatsAppUrl(message);
  }, [pathname, items]);

  return (
    <div
      className="fixed z-[45] flex flex-col items-end gap-2"
      style={{
        bottom: "var(--float-bottom)",
        right: "var(--float-right)",
      }}
      onMouseEnter={() => setLabelOpen(true)}
      onMouseLeave={() => setLabelOpen(false)}
    >
      <div
        className={cn(
          "pointer-events-none max-w-[220px] rounded-xl border border-[#0B3D35]/10 bg-white px-3.5 py-2.5 text-right shadow-lg transition-all duration-200",
          labelOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-1 opacity-0 sm:opacity-0"
        )}
        aria-hidden={!labelOpen}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0B3D35]">
          Order on WhatsApp
        </p>
        <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
          Chat with {BRAND.name} for quick orders & delivery help.
        </p>
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full bg-[#25D366] py-2 pl-3 pr-2.5 text-white shadow-[0_8px_28px_rgba(37,211,102,0.45)] ring-2 ring-white/90 transition-transform hover:scale-[1.02] hover:bg-[#20bd5a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:gap-3 sm:pl-5 sm:pr-4 sm:ring-4"
        aria-label={`Order on WhatsApp — ${BRAND.name}`}
        title="Order on WhatsApp"
      >
        <span className="hidden text-[12px] font-semibold uppercase tracking-[0.12em] sm:inline">
          Order
        </span>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center sm:h-11 sm:w-11">
          <WhatsAppGlyph className="h-6 w-6 sm:h-7 sm:w-7" />
        </span>
      </a>
    </div>
  );
}
