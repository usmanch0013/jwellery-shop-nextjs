"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const gallery = images.length > 0 ? images : ["/placeholder.jpg"];

  return (
    <div className="flex gap-3 lg:gap-4">
      <div className="flex flex-col gap-2.5 shrink-0">
        {gallery.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`relative w-[52px] h-[52px] lg:w-[60px] lg:h-[60px] rounded-md overflow-hidden border transition-all ${
              activeIndex === index
                ? "border-foreground ring-1 ring-foreground"
                : "border-border hover:border-sage"
            }`}
            aria-label={`View image ${index + 1}`}
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="60px"
            />
          </button>
        ))}
      </div>

      <div className="relative flex-1 aspect-[4/5] lg:aspect-[3/4] rounded-xl overflow-hidden bg-muted">
        <Image
          src={gallery[activeIndex]}
          alt={productName}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
        />
      </div>
    </div>
  );
}
