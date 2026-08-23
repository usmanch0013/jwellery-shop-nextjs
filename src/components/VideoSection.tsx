"use client";

import { useState } from "react";
import { Play, RefreshCw, Scale, Gem, HeartHandshake } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { videoFeatures } from "@/data/site";

const VIDEO_SRC = "/intro-video.mp4";
const POSTER_SRC = "/intro-video-poster.png";
const YOUTUBE_EMBED =
  "https://www.youtube.com/embed/Y-x0efG1seA?autoplay=1&rel=0";

const iconMap = {
  exchange: RefreshCw,
  scale: Scale,
  diamond: Gem,
  maintenance: HeartHandshake,
} as const;

export default function VideoSection() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <>
      <section
        aria-label="Brand video showcase"
        className="relative left-1/2 w-screen max-w-none -translate-x-1/2 overflow-hidden"
      >
        <div className="relative flex min-h-[clamp(520px,82vh,780px)] flex-col">
          {/* Background video */}
          <video
            className="absolute inset-0 h-full w-full object-cover object-center"
            autoPlay
            muted
            loop
            playsInline
            poster={POSTER_SRC}
            aria-hidden
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>

          {/* Layered overlays for readability */}
          <div
            className="pointer-events-none absolute inset-0 bg-black/25"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/75"
            aria-hidden
          />

          {/* Play button — vertically centered */}
          <div className="relative z-10 flex flex-1 items-center justify-center px-[var(--site-px)]">
            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              aria-label="Play brand video"
              className="video-play-btn group flex h-[72px] w-[72px] items-center justify-center rounded-full border border-white/25 bg-champagne text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-105 hover:border-white/50 hover:bg-white hover:text-charcoal lg:h-[85px] lg:w-[85px]"
            >
              <Play
                className="ml-1 h-7 w-7 fill-current lg:h-8 lg:w-8"
                strokeWidth={0}
              />
            </button>
          </div>

          {/* Features bar */}
          <div className="relative z-10 border-t border-white/15 bg-black/20 backdrop-blur-[2px]">
            <div className="mx-auto w-full max-w-[var(--site-max)] px-[var(--site-px)] py-10 lg:py-12">
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-y-0">
                {videoFeatures.map((feature, index) => {
                  const Icon = iconMap[feature.icon];
                  const isLast = index === videoFeatures.length - 1;
                  const isSecondCol = index === 1;

                  return (
                    <div
                      key={feature.title}
                      className={[
                        "group flex flex-col items-center px-3 text-center sm:px-5",
                        !isLast && "lg:border-r lg:border-white/20",
                        isSecondCol &&
                          "max-lg:border-r max-lg:border-white/15",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors duration-300 group-hover:border-white/25 group-hover:bg-white/10 lg:mb-5 lg:h-16 lg:w-16">
                        <Icon
                          className="h-7 w-7 text-white/90 transition-colors duration-300 group-hover:text-white lg:h-8 lg:w-8"
                          strokeWidth={1.25}
                        />
                      </div>
                      <h3 className="max-w-[11rem] font-serif text-[15px] font-normal leading-snug text-white/95 lg:max-w-none lg:text-[20px] lg:leading-[1.35]">
                        {feature.title}
                      </h3>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent
          showCloseButton
          className="max-w-[min(960px,calc(100vw-2rem))] gap-0 overflow-hidden border-0 bg-black p-0 sm:max-w-[min(960px,calc(100vw-2rem))]"
        >
          <div className="aspect-video w-full">
            {videoOpen && (
              <iframe
                src={YOUTUBE_EMBED}
                title="Lumière Jewellery"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
