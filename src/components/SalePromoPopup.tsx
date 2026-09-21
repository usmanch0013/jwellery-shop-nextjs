"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CmsPromoPopup } from "@/lib/cms/types";
import { BRAND } from "@/lib/brand";

const STORAGE_PREFIX = "sheco-promo-dismissed";

function storageKey(version: string) {
  return `${STORAGE_PREFIX}-${version}`;
}

function isDismissed(popup: CmsPromoPopup): boolean {
  try {
    const raw = localStorage.getItem(storageKey(popup.version));
    if (!raw) return false;
    const until = Number(raw);
    return Number.isFinite(until) && Date.now() < until;
  } catch {
    return false;
  }
}

function dismiss(popup: CmsPromoPopup) {
  const days = Math.max(1, popup.dismissDays || 1);
  const until = Date.now() + days * 24 * 60 * 60 * 1000;
  try {
    localStorage.setItem(storageKey(popup.version), String(until));
  } catch {
    /* ignore */
  }
}

export default function SalePromoPopup({ popup }: { popup: CmsPromoPopup }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!popup.enabled) return;
    if (isDismissed(popup)) return;

    const timer = window.setTimeout(() => setOpen(true), 2200);
    return () => window.clearTimeout(timer);
  }, [popup]);

  function handleClose() {
    dismiss(popup);
    setOpen(false);
  }

  if (!popup.enabled) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[min(92dvh,720px)] max-w-[calc(100%-1rem)] overflow-y-auto border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-[min(920px,calc(100%-2rem))]"
      >
        <DialogTitle className="sr-only">
          {popup.title} — {popup.productName}
        </DialogTitle>

        <div className="relative overflow-hidden rounded-2xl bg-[#0B3D35] shadow-2xl ring-1 ring-white/10">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-[5px] bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
            aria-label="Close offer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="grid md:grid-cols-[1.05fr_1fr]">
            <div className="relative min-h-[180px] sm:min-h-[220px] md:min-h-[340px]">
              <Image
                src={popup.imageUrl || "/she-hero-poster.jpg"}
                alt={popup.productName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B3D35]/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#0B3D35]/20" />
              <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-champagne px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-charcoal">
                  <Sparkles className="h-3 w-3" aria-hidden />
                  {popup.badge}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center px-5 py-6 text-white sm:px-8 sm:py-9">
              <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-champagne/90">
                {BRAND.name}
              </p>
              <h2 className="mt-2 font-serif text-[clamp(1.65rem,4vw,2.25rem)] leading-tight">
                {popup.title}
              </h2>
              <p className="mt-1 text-sm text-white/75">{popup.subtitle}</p>

              <div className="mt-5 rounded-xl border border-white/12 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <p className="font-medium text-white">{popup.productName}</p>
                <p className="mt-1 font-serif text-2xl text-champagne">
                  {popup.discountText}
                </p>
              </div>

              <p className="mt-4 text-[13px] leading-relaxed text-white/80">
                {popup.description}
              </p>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
                <Link
                  href={popup.ctaHref || "/shop"}
                  onClick={handleClose}
                  className="site-btn bg-champagne px-5 text-charcoal transition-opacity hover:opacity-90"
                >
                  {popup.ctaLabel || "Shop now"}
                </Link>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-[12px] text-white/55 underline-offset-2 hover:text-white/80 hover:underline"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
