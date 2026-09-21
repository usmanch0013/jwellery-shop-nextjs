"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, X } from "lucide-react";
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

  useEffect(() => {
    setActiveIndex(0);
    setImageKey((k) => k + 1);
  }, [gallery[0], images.join("|")]);

  const selectImage = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    setImageKey((k) => k + 1);
  };

  const scrollThumbs = (direction: "up" | "down" | "left" | "right") => {
    const el = thumbListRef.current;
    if (!el) return;
    const isHorizontal = el.dataset.layout === "horizontal";
    if (isHorizontal) {
      el.scrollBy({
        left: direction === "left" ? -120 : 120,
        behavior: "smooth",
      });
    } else {
      el.scrollBy({
        top: direction === "up" ? -160 : 160,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[88px_minmax(0,1fr)] lg:items-start lg:gap-5">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="product-zeesy-main-image group relative order-1 aspect-[3/4] w-full min-w-0 cursor-zoom-in overflow-hidden rounded-[16px] bg-[#f2efe3] lg:order-2"
          aria-label="Zoom product image"
        >
          <Image
            key={`${gallery[activeIndex]}-${imageKey}`}
            src={gallery[activeIndex]}
            alt={productName}
            fill
            className="product-zeesy-image-fade object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 42vw"
          />
          <span className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 text-[10px] font-light uppercase tracking-[0.28em] text-white/90 drop-shadow-sm">
            SHE Collection
          </span>
          {productCode && (
            <span className="pointer-events-none absolute bottom-3 left-1/2 max-w-[90%] -translate-x-1/2 truncate text-[9px] tracking-wide text-white/70 drop-shadow-sm">
              {productCode}
            </span>
          )}
        </button>

        <div className="order-2 min-w-0 lg:order-1">
          <div className="flex items-center gap-1 lg:flex-col lg:items-center">
            <button
              type="button"
              onClick={() => scrollThumbs("up")}
              className="mb-0 hidden h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f2efe3] text-[#8a8680] transition-colors hover:bg-[#ebe6d8] hover:text-[#3b3933] lg:mb-2 lg:flex"
              aria-label="Previous images"
            >
              <ChevronUp className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => scrollThumbs("left")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f2efe3] text-[#8a8680] lg:hidden"
              aria-label="Scroll thumbnails left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div
              ref={thumbListRef}
              data-layout="horizontal"
              className="flex min-w-0 flex-1 gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:max-h-[620px] lg:w-full lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0 [&::-webkit-scrollbar]:hidden"
            >
              {gallery.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => selectImage(index)}
                  className={`relative aspect-[3/4] w-[4.25rem] shrink-0 overflow-hidden rounded-[12px] border bg-[#f2efe3] transition-[border-color,opacity] duration-200 sm:w-[4.75rem] lg:w-full lg:rounded-[16px] ${
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
              onClick={() => scrollThumbs("right")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f2efe3] text-[#8a8680] lg:hidden"
              aria-label="Scroll thumbnails right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollThumbs("down")}
              className="mt-0 hidden h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f2efe3] text-[#8a8680] transition-colors hover:bg-[#ebe6d8] hover:text-[#3b3933] lg:mt-2 lg:flex"
              aria-label="Next images"
            >
              <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[92dvh] max-w-[min(92vw,720px)] overflow-y-auto border-none bg-transparent p-0 shadow-none ring-0"
        >
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
