"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { testimonials } from "@/data/site";
import "swiper/css";

export default function Testimonials() {
  return (
    <section className="py-14 lg:py-20 bg-muted/60 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4">
        <p className="text-xs uppercase tracking-[0.3em] text-center text-muted-foreground mb-2">
          Testimonials
        </p>
        <h2 className="text-2xl font-medium text-center mb-10">
          Our Celebrities Reviews
        </h2>

        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop
          slidesPerView={1}
          spaceBetween={20}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {testimonials.map((t) => (
            <SwiperSlide key={t.id}>
              <div className="bg-background p-6 border border-border h-full">
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={t.image}
                      alt={t.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium">{t.name}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
