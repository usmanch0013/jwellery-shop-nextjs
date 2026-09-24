"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import MarqueeBar from "@/components/MarqueeBar";
import type { CmsHeroSettings } from "@/lib/cms/types";
import { DEFAULT_HERO } from "@/lib/cms/defaults";
import { BRAND } from "@/lib/brand";

const HERO_VIDEO_FALLBACK = DEFAULT_HERO.backgroundVideo;
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
  const [videoPlaying, setVideoPlaying] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 24]);
  const mediaOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.92]);

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
    setVideoPlaying(false);
    const video = videoRef.current;
    if (!video || videoFailed || reduceMotion) return;

    video.muted = true;
    video.defaultMuted = true;

    const tryPlay = () => {
      video.play().catch(() => {
        /* retry once after canplay */
      });
    };

    tryPlay();
    video.addEventListener("canplay", tryPlay, { once: true });
    return () => video.removeEventListener("canplay", tryPlay);
  }, [videoSrc, videoFailed, reduceMotion]);

  const showVideo = !videoFailed && !reduceMotion;

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-[#0a1210]"
      aria-label={`${BRAND.name} homepage hero`}
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ scale: mediaScale, opacity: mediaOpacity }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center sm:bg-[72%_center]"
            style={{ backgroundImage: `url(${posterSrc})` }}
            aria-hidden
          />

          {showVideo && (
            <video
              ref={videoRef}
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 sm:object-[72%_center] ${
                videoPlaying ? "opacity-100" : "opacity-0"
              }`}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              disablePictureInPicture
              aria-hidden
              onPlaying={() => setVideoPlaying(true)}
              onError={() => setVideoFailed(true)}
            >
              <source src={`${videoSrc}?v=she-hero-2`} type="video/mp4" />
            </video>
          )}
        </motion.div>

        <div
          className="absolute inset-0 bg-emerald/20 mix-blend-multiply"
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(8,18,15,0.9) 0%, rgba(8,18,15,0.75) 24%, rgba(8,18,15,0.4) 44%, rgba(8,18,15,0.1) 60%, transparent 74%)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-emerald/90 via-emerald/40 to-transparent" />
      </div>

      <div
        className="relative z-10 flex w-full flex-1 flex-col"
        style={{ paddingTop: "var(--nav-height)" }}
      >
        <div
          className="flex w-full flex-1 items-center justify-center lg:justify-start"
          style={{
            minHeight:
              "calc(100dvh - var(--header-height) - var(--hero-bottom-bar))",
          }}
        >
          <div
            className="mx-auto w-full max-w-[var(--site-max)] px-[var(--hero-px)]"
            style={{
              paddingTop: "var(--hero-v-pad)",
              paddingBottom: "var(--hero-v-pad)",
            }}
          >
            <motion.div
              style={{ y: contentY }}
              className="mx-auto w-full max-w-[580px] text-center lg:mx-0 lg:text-left"
            >
              <p
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[9px] font-medium uppercase tracking-[0.28em] text-champagne backdrop-blur-sm sm:mb-5 sm:text-[10px] sm:tracking-[0.32em]"
              >
                <span className="h-1 w-1 rounded-full bg-champagne" aria-hidden />
                {content.eyebrow}
              </p>

              <h1
                className="font-serif text-[clamp(1.85rem,4.8vw,3.35rem)] font-medium leading-[1.14] tracking-[-0.02em] text-white [text-shadow:0_4px_28px_rgba(0,0,0,0.5)] sm:text-[clamp(2.1rem,5.2vw,3.5rem)]"
              >
                <span className="block">{content.headlineLine1}</span>
                <span className="mt-1 block font-script text-[clamp(2.35rem,6.5vw,4rem)] font-normal leading-[0.95] text-champagne">
                  {content.headlineLine2}
                </span>
              </h1>

              <p className="mt-2 font-serif text-[13px] italic tracking-wide text-white/70 sm:text-sm">
                {BRAND.tagline}
              </p>

              <p className="mx-auto mt-5 max-w-[460px] text-[13px] leading-[1.85] text-white/88 sm:mt-6 sm:text-[14px] sm:leading-[1.9] lg:mx-0">
                {content.description}
              </p>

              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-9 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
                <Link
                  href={content.primaryCtaHref ?? "/shop"}
                  className="site-btn bg-champagne px-5 text-charcoal shadow-[0_6px_24px_rgba(201,169,110,0.35)] transition-opacity hover:opacity-95"
                >
                  {content.primaryCtaLabel ?? "Shop Collection"}
                </Link>
                <Link
                  href={content.secondaryCtaHref ?? "/shop?filter=new"}
                  className="site-btn border border-white/35 bg-white/8 px-5 font-medium text-white backdrop-blur-md transition-colors hover:border-champagne/50 hover:bg-white/14"
                >
                  {content.secondaryCtaLabel ?? "New Arrivals"}
                </Link>
              </div>

              <p className="mt-6 hidden text-[10px] uppercase tracking-[0.28em] text-white/45 lg:block">
                {BRAND.promise}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div
        className="relative z-10 w-full shrink-0"
        style={{ minHeight: "var(--hero-bottom-bar)" }}
      >
        <motion.div
          className="absolute inset-x-0 top-0 flex justify-center text-white/50"
          style={{ paddingBlock: "var(--hero-scroll-gap)" }}
          animate={reduceMotion ? undefined : { y: [0, 5, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-[0.36em]">
              {content.scrollHint}
            </span>
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.25} />
          </div>
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 w-full">
          <MarqueeBar variant="dark" text={marqueeText} />
        </div>
      </div>
    </section>
  );
}
