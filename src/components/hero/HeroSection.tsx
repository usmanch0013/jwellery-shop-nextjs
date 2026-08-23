"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import MarqueeBar from "@/components/MarqueeBar";

const HeroScene3D = dynamic(() => import("./HeroScene3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-full bg-white/[0.04] animate-pulse" />
  ),
});

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1920&h=1200&fit=crop&q=90";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 24]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      setScrollProgress(
        Math.min(Math.max(-rect.top / rect.height, 0), 1)
      );
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex w-full min-h-[100dvh] flex-col overflow-hidden"
    >
      {/* Full-bleed background — edge to edge on every screen */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-screen max-w-none -translate-x-1/2">
        <motion.div className="absolute inset-0" style={{ scale: imageScale }}>
          <Image
            src={HERO_IMAGE}
            alt="Luxury necklace jewellery"
            fill
            className="object-cover object-center scale-105"
            priority
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-[#0B3D35]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B3D35]/90 via-[#0B3D35]/75 to-[#0B3D35]/90" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B3D35]/35 via-transparent to-[#0B3D35]/85" />
      </div>

      {/* Content — below transparent header, centred */}
      <div
        className="relative z-10 flex w-full flex-1 flex-col"
        style={{ paddingTop: "var(--header-height)" }}
      >
        <div
          className="flex w-full flex-1 items-center justify-center"
          style={{
            minHeight:
              "calc(100dvh - var(--header-height) - var(--hero-bottom-bar))",
          }}
        >
          <div
            className="w-full max-w-[var(--site-max)] mx-auto px-[var(--hero-px)]"
            style={{
              paddingTop: "var(--hero-v-pad)",
              paddingBottom: "var(--hero-v-pad)",
            }}
          >
            <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-8 xl:gap-12">
              {/* Copy */}
              <motion.div style={{ y: contentY }} className="w-full max-w-[580px]">
                <div
                  className="flex flex-col"
                  style={{ gap: "var(--hero-stack)" }}
                >
                  <div className="space-y-3 sm:space-y-4">
                    <p className="text-champagne text-[10px] sm:text-[11px] md:text-xs font-medium uppercase tracking-[0.32em] sm:tracking-[0.38em]">
                      Pakistan&apos;s Award Winning Brand
                    </p>
                    <div className="h-px w-10 sm:w-12 bg-champagne/60" />
                  </div>

                  <div className="space-y-0.5 sm:space-y-1">
                    <h1 className="font-serif text-[clamp(1.875rem,5vw,3.5rem)] leading-[1.08] text-white">
                      Jewels That Celebrate
                    </h1>
                    <p className="font-script text-[clamp(2.5rem,6.5vw,4.75rem)] leading-[0.95] text-champagne">
                      Togetherness.
                    </p>
                  </div>

                  <p className="max-w-[480px] text-[14px] sm:text-[15px] md:text-base leading-[1.7] sm:leading-[1.75] text-white/70">
                    Discover handcrafted artificial jewellery — necklace sets,
                    bridal pieces, earrings &amp; more. Crafted for every
                    celebration.
                  </p>

                  <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
                    <Link
                      href="/shop"
                      className="inline-flex items-center justify-center gap-2.5 bg-champagne px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-medium text-foreground transition-colors hover:bg-champagne-dark sm:min-w-[168px]"
                    >
                      Shop Collection
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </Link>
                    <Link
                      href="/shop?filter=new"
                      className="inline-flex items-center justify-center border border-white/35 px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:min-w-[148px]"
                    >
                      New Arrivals
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* 3D */}
              <div className="hidden lg:flex w-full max-w-[520px] justify-self-end xl:max-w-[560px]">
                <div className="relative ml-auto w-full max-w-[min(42vw,560px)]">
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-[88%] w-[88%] rounded-full border border-champagne/15" />
                    <div className="absolute h-[72%] w-[72%] rounded-full border border-white/8" />
                  </div>
                  <div className="relative aspect-square w-full">
                    {mounted && <HeroScene3D scrollProgress={scrollProgress} />}
                  </div>
                  <p className="mt-3 xl:mt-4 text-center text-[9px] xl:text-[10px] uppercase tracking-[0.24em] xl:tracking-[0.28em] text-white/40">
                    Auto rotates · drag to explore
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="relative z-10 w-full shrink-0"
        style={{ minHeight: "var(--hero-bottom-bar)" }}
      >
        <motion.div
          className="absolute inset-x-0 top-0 flex justify-center text-white/35"
          style={{ paddingBlock: "var(--hero-scroll-gap)" }}
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.28em] sm:tracking-[0.3em]">
              Scroll
            </span>
            <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 w-full">
          <MarqueeBar variant="dark" />
        </div>
      </div>
    </section>
  );
}
