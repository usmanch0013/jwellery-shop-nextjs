"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import MarqueeBar from "@/components/MarqueeBar";
import type { CmsHeroSettings } from "@/lib/cms/types";
import { DEFAULT_HERO } from "@/lib/cms/defaults";

const HERO_VIDEO_FALLBACK = "/hero-jewellery.mp4";
const HERO_POSTER_FALLBACK = DEFAULT_HERO.backgroundImage;

export default function HeroSection({
  hero,
  marqueeText,
}: {
  hero?: CmsHeroSettings;
  marqueeText?: string;
}) {
  const content = hero ?? DEFAULT_HERO;
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 28]);

  const videoSrc = content.backgroundVideo || HERO_VIDEO_FALLBACK;
  const posterSrc = content.backgroundImage || HERO_POSTER_FALLBACK;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoFailed || reduceMotion) return;
    video.play().catch(() => setVideoFailed(true));
  }, [videoSrc, videoFailed, reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative flex w-full min-h-[100dvh] flex-col overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-screen max-w-none -translate-x-1/2">
        <motion.div className="absolute inset-0" style={{ scale: mediaScale }}>
          {!videoFailed && !reduceMotion ? (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover object-[72%_center] [filter:brightness(1.04)_contrast(1.08)_saturate(1.08)]"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={posterSrc}
              aria-hidden
              onError={() => setVideoFailed(true)}
            >
              <source src={`${videoSrc}?v=4`} type="video/mp4" />
            </video>
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${posterSrc})` }}
            />
          )}
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-r from-[#0B3D35]/80 via-[#0B3D35]/22 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B3D35]/55 via-transparent to-transparent" />
        <div className="absolute inset-x-0 top-0 h-[var(--header-height)] bg-gradient-to-b from-black/65 via-black/35 to-transparent" />
      </div>

      <div
        className="relative z-10 flex w-full flex-1 flex-col"
        style={{ paddingTop: "var(--header-height)" }}
      >
        <div
          className="flex w-full flex-1 items-center"
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
            <motion.div
              style={{ y: contentY }}
              className="w-full max-w-[640px]"
            >
              <div
                className="flex flex-col"
                style={{ gap: "var(--hero-stack)" }}
              >
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-champagne text-[10px] sm:text-[11px] md:text-xs font-medium uppercase tracking-[0.32em] sm:tracking-[0.38em]">
                    {content.eyebrow}
                  </p>
                  <div className="h-px w-10 sm:w-12 bg-champagne/60" />
                </div>

                <div className="space-y-0.5 sm:space-y-1">
                  <h1 className="font-serif text-[clamp(1.875rem,5vw,3.5rem)] leading-[1.08] text-white">
                    {content.headlineLine1}
                  </h1>
                  <p className="font-script text-[clamp(2.5rem,6.5vw,4.75rem)] leading-[0.95] text-champagne">
                    {content.headlineLine2}
                  </p>
                </div>

                <p className="max-w-[480px] text-[14px] sm:text-[15px] md:text-base leading-[1.7] sm:leading-[1.75] text-white/75">
                  {content.description}
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
                  <Link
                    href={content.primaryCtaHref}
                    className="inline-flex items-center justify-center gap-2.5 bg-champagne px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-medium text-foreground transition-colors hover:bg-champagne-dark sm:min-w-[168px]"
                  >
                    {content.primaryCtaLabel}
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </Link>
                  <Link
                    href={content.secondaryCtaHref}
                    className="inline-flex items-center justify-center border border-white/35 px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:min-w-[148px]"
                  >
                    {content.secondaryCtaLabel}
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

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
              {content.scrollHint}
            </span>
            <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 w-full">
          <MarqueeBar variant="dark" text={marqueeText} />
        </div>
      </div>
    </section>
  );
}
