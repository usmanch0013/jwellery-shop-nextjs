"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { testimonials as defaultTestimonials } from "@/data/site";
import type { CmsTestimonial } from "@/lib/cms/types";
import "jarallax/dist/jarallax.css";

const BG_IMAGE_DEFAULT = "/testimonial-bg-cignet.jpg";
const PARALLAX_SPEED = 0.5; // Cignet ElementsKit: ekit_section_parallax_bg_speed

function Stars({ count = 5 }: { count?: number }) {
  return (
    <ul className="flex items-center">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className={i < count - 1 ? "mr-[5px]" : ""}>
          <Star
            className="h-[18px] w-[18px] fill-white text-white"
            strokeWidth={0}
          />
        </li>
      ))}
    </ul>
  );
}

export default function Testimonials({
  testimonials = defaultTestimonials.map((t, i) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    content: t.content,
    image: t.image,
    rating: t.rating,
    sort_order: i,
    is_published: true,
  })),
  badge = "• TESTIMONIALS",
  title = "Trusted Reviews From Jewellery Style Enthusiasts",
  backgroundImage = BG_IMAGE_DEFAULT,
}: {
  testimonials?: CmsTestimonial[];
  badge?: string;
  title?: string;
  backgroundImage?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);

  const current = testimonials[activeIndex];

  const onSelect = useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) return;
    setActiveIndex(carouselApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  // Jarallax — same library Cignet uses for fixed bg + scroll parallax
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let cancelled = false;

    import("jarallax").then(({ jarallax }) => {
      if (cancelled) return;

      jarallax(section, {
        speed: PARALLAX_SPEED,
        imgSrc: backgroundImage,
        imgSize: "cover",
        imgPosition: "center center",
      });
    });

    return () => {
      cancelled = true;
      import("jarallax").then(({ jarallax }) => {
        jarallax(section, "destroy");
      });
    };
  }, [backgroundImage]);

  return (
    <section
      ref={sectionRef}
      className="jarallax relative z-0 overflow-hidden py-[60px] lg:py-[120px]"
    >
      {/* Jarallax injects background; hidden img satisfies SSR + no-JS fallback */}
      <img
        className="jarallax-img pointer-events-none"
        src={backgroundImage}
        alt=""
        aria-hidden
      />

      {/* Dark left overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-black/85 from-0% via-black/45 via-[45%] to-transparent to-[72%]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-[10px]">
        <div className="flex w-full max-w-[650px] flex-col items-start gap-[15px]">
          {/* Badge */}
          <div className="rounded-full border border-white/20 px-4 py-[7px] lg:px-4">
            <h3 className="text-[14px] font-normal leading-[1.286] text-white">
              {badge}
            </h3>
          </div>

          {/* Heading */}
          <h2 className="text-left font-serif text-[44px] font-normal leading-[1.2] text-white lg:text-[60px]">
            {title}
          </h2>

          {/* Slider block */}
          <div className="relative mt-[30px] w-full lg:mt-[45px]">
            <Carousel
              setApi={setApi}
              opts={{ align: "start", loop: true }}
              className="w-full"
            >
              <CarouselContent>
                {testimonials.map((t) => (
                  <CarouselItem key={t.id} className="basis-full">
                    <div className="text-left">
                      <Stars count={t.rating ?? 5} />
                      <p className="mt-5 text-[18px] font-medium leading-[1.6] text-white">
                        {t.content}
                      </p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Divider + author — Cignet exact */}
            <div className="relative mt-[60px] border-t border-white/20 pt-6">
              <div className="flex items-center gap-3.5">
                <div className="relative h-[50px] w-[50px] shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={current.image ?? "/testimonial-author-1.jpg"}
                    alt={current.name}
                    fill
                    className="object-cover"
                    sizes="50px"
                    unoptimized
                  />
                </div>
                <div className="text-left">
                  <p className="mb-[5px] font-serif text-base font-normal leading-snug text-white">
                    {current.name}
                  </p>
                  <p className="text-sm font-normal text-white/90">
                    {current.role}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => api?.scrollPrev()}
                aria-label="Previous review"
                className="absolute left-[81%] top-1/2 flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center rounded-full bg-[#2f2a26]/90 text-white transition-colors hover:bg-[#c9d85a] hover:text-black sm:h-[50px] sm:w-[50px]"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => api?.scrollNext()}
                aria-label="Next review"
                className="absolute right-0 top-1/2 flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center rounded-full bg-[#2f2a26]/90 text-white transition-colors hover:bg-[#c9d85a] hover:text-black sm:h-[50px] sm:w-[50px]"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
