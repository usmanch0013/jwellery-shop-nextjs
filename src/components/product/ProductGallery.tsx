"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  productCode?: string;
}

export default function ProductGallery({
  images,
  productName,
  productCode,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const thumbListRef = useRef<HTMLDivElement>(null);
  const gallery = images.length > 0 ? images : ["/placeholder.jpg"];

  const selectImage = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    setImageKey((k) => k + 1);
  };

  const scrollThumbs = (direction: "up" | "down") => {
    thumbListRef.current?.scrollBy({
      top: direction === "up" ? -160 : 160,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="grid grid-cols-[64px_minmax(0,1fr)] items-start gap-[10px] lg:grid-cols-[88px_minmax(0,1fr)] lg:gap-5">
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => scrollThumbs("up")}
            className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#f2efe3] text-[#8a8680] transition-colors hover:bg-[#ebe6d8] hover:text-[#3b3933]"
            aria-label="Previous images"
          >
            <ChevronUp className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <div
            ref={thumbListRef}
            className="flex w-full flex-col gap-2.5 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:max-h-[620px]"
          >
            {gallery.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                onClick={() => selectImage(index)}
                className={`relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-[16px] border bg-[#f2efe3] transition-[border-color,opacity] duration-200 ${
                  activeIndex === index
                    ? "border-[1.5px] border-[#1a1a1a]"
                    : "border border-transparent opacity-90 hover:opacity-100"
                }`}
                aria-label={`View image ${index + 1}`}
                aria-current={activeIndex === index}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="88px"
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollThumbs("down")}
            className="mt-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#f2efe3] text-[#8a8680] transition-colors hover:bg-[#ebe6d8] hover:text-[#3b3933]"
            aria-label="Next images"
          >
            <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="product-zeesy-main-image group relative aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-[16px] bg-[#f2efe3]"
          aria-label="Zoom product image"
        >
          <Image
            key={`${gallery[activeIndex]}-${imageKey}`}
            src={gallery[activeIndex]}
            alt={productName}
            fill
            className="product-zeesy-image-fade object-cover"
            priority
            sizes="(max-width: 1024px) 80vw, 42vw"
          />
          <span className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 text-[10px] font-light uppercase tracking-[0.28em] text-white/90 drop-shadow-sm">
            Lumière
          </span>
          {productCode && (
            <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] tracking-wide text-white/70 drop-shadow-sm">
              {productCode}
            </span>
          )}
        </button>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent showCloseButton={false} className="max-w-[min(92vw,720px)] border-none bg-transparent p-0 shadow-none ring-0">
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#3b3933] shadow-lg"
            aria-label="Close zoom"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[16px] bg-[#f2efe3]">
            <Image
              src={gallery[activeIndex]}
              alt={productName}
              fill
              className="object-cover"
              sizes="90vw"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
