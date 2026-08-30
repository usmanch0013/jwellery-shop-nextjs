"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
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

  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 20]);

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
      className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-screen max-w-none -translate-x-1/2">
        <motion.div className="absolute inset-0" style={{ scale: mediaScale }}>
          {!videoFailed && !reduceMotion ? (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover object-[82%_center]"
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

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(10,14,12,0.62) 0%, rgba(10,14,12,0.32) 26%, rgba(10,14,12,0.08) 48%, transparent 66%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent" />
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
            className="mx-auto w-full max-w-[var(--site-max)] px-[var(--hero-px)]"
            style={{
              paddingTop: "var(--hero-v-pad)",
              paddingBottom: "var(--hero-v-pad)",
            }}
          >
            <motion.div style={{ y: contentY }} className="w-full max-w-[520px]">
              <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.42em] text-champagne sm:mb-6 sm:text-[11px]">
                {content.eyebrow}
              </p>
              <div className="mb-5 h-px w-8 bg-champagne/70 sm:mb-6" />

              <h1 className="font-serif text-[clamp(2.25rem,5.2vw,3.75rem)] font-normal leading-[1.12] tracking-[-0.01em] text-white">
                {content.headlineLine1}
              </h1>
              <p className="mt-1 font-script text-[clamp(2.75rem,6vw,4.5rem)] leading-[0.95] text-champagne">
                {content.headlineLine2}
              </p>

              <p className="mt-6 max-w-[420px] text-[13px] leading-[1.85] text-white/82 sm:mt-7 sm:text-[14px] sm:leading-[1.9]">
                {content.description}
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
          className="absolute inset-x-0 top-0 flex justify-center text-white/45"
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
