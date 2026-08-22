"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { heroSlides } from "@/data/site";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function HeroSlider() {
  return (
    <section className="relative">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="h-[70vh] min-h-[500px] max-h-[800px] [&_.swiper-pagination-bullet]:bg-white/50 [&_.swiper-pagination-bullet-active]:bg-gold [&_.swiper-pagination-bullet]:w-2 [&_.swiper-pagination-bullet]:h-2"
      >
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={slide.id === "1"}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/50 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-xl"
                  >
                    <p className="text-gold uppercase tracking-[0.3em] text-sm mb-4">
                      {slide.subtitle}
                    </p>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-semibold text-cream leading-tight mb-6">
                      {slide.title}
                    </h1>
                    <p className="text-cream/80 text-lg mb-8 leading-relaxed">
                      {slide.description}
                    </p>
                    <Link
                      href={slide.href}
                      className="inline-flex items-center justify-center bg-gold hover:bg-gold-dark text-white uppercase tracking-widest h-12 px-8 rounded-lg text-sm font-medium"
                    >
                      {slide.cta}
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
