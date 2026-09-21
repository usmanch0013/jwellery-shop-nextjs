"use client";

import { useMemo, useState } from "react";
import { Play, RefreshCw, Scale, Gem, HeartHandshake } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DEFAULT_VIDEO } from "@/lib/cms/defaults";
import type { CmsVideoSettings } from "@/lib/cms/types";
import { BRAND } from "@/lib/brand";

const iconMap = {
  exchange: RefreshCw,
  scale: Scale,
  diamond: Gem,
  maintenance: HeartHandshake,
} as const;

function isValidYoutubeEmbed(url: string): boolean {
  const u = url.trim();
  if (!u) return false;
  if (u.includes("dQw4w9WgXcQ")) return false;
  return (
    u.includes("youtube.com/embed") ||
    u.includes("youtube-nocookie.com/embed") ||
    u.includes("youtu.be/")
  );
}

function toYoutubeEmbed(url: string): string {
  const u = url.trim();
  if (u.includes("/embed/")) return u;
  const short = u.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  const watch = u.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  return u;
}

export default function VideoSection({
  video = DEFAULT_VIDEO,
}: {
  video?: CmsVideoSettings;
}) {
  const [videoOpen, setVideoOpen] = useState(false);
  const features = video.features;

  const youtubeEmbed = useMemo(() => {
    if (!isValidYoutubeEmbed(video.youtubeUrl ?? "")) return null;
    return toYoutubeEmbed(video.youtubeUrl);
  }, [video.youtubeUrl]);

  const mp4Src = video.backgroundVideo?.trim() || DEFAULT_VIDEO.backgroundVideo;
  const showPlayButton = Boolean(youtubeEmbed || mp4Src);

  return (
    <>
      <section
        aria-label="Brand video showcase"
        className="relative w-full overflow-hidden"
      >
        <div className="relative flex min-h-[clamp(420px,72vh,780px)] flex-col sm:min-h-[clamp(520px,82vh,780px)]">
          <video
            className="absolute inset-0 h-full w-full object-cover object-center"
            autoPlay
            muted
            loop
            playsInline
            poster={video.posterImage}
            aria-hidden
          >
            <source src={mp4Src} type="video/mp4" />
          </video>

          <div
            className="pointer-events-none absolute inset-0 bg-black/25"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/75"
            aria-hidden
          />

          {showPlayButton ? (
            <div className="relative z-10 flex flex-1 items-center justify-center px-[var(--site-px)]">
              <button
                type="button"
                onClick={() => setVideoOpen(true)}
                aria-label="Play brand video"
                className="video-play-btn group flex h-14 w-14 items-center justify-center rounded-[5px] border border-white/30 bg-champagne text-charcoal shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-105 hover:border-white/60 hover:bg-white lg:h-16 lg:w-16"
              >
                <Play
                  className="ml-1 h-7 w-7 fill-current lg:h-8 lg:w-8"
                  strokeWidth={0}
                />
              </button>
            </div>
          ) : (
            <div className="relative z-10 flex-1" aria-hidden />
          )}

          <div className="relative z-10 border-t border-white/15 bg-black/20 backdrop-blur-[2px]">
            <div className="mx-auto w-full max-w-[var(--site-max)] px-[var(--site-px)] py-8 sm:py-10 lg:py-12">
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-y-10 lg:grid-cols-4 lg:gap-y-0">
                {features.map((feature, index) => {
                  const Icon = iconMap[feature.icon as keyof typeof iconMap];
                  const isLast = index === features.length - 1;
                  const isSecondCol = index === 1;

                  return (
                    <div
                      key={feature.title}
                      className={[
                        "group flex flex-col items-center px-2 text-center sm:px-5",
                        !isLast && "lg:border-r lg:border-white/20",
                        isSecondCol &&
                          "max-lg:border-r max-lg:border-white/15",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors duration-300 group-hover:border-white/25 group-hover:bg-white/10 sm:mb-4 sm:h-14 sm:w-14 lg:mb-5 lg:h-16 lg:w-16">
                        <Icon
                          className="h-6 w-6 text-white/90 transition-colors duration-300 group-hover:text-white sm:h-7 sm:w-7 lg:h-8 lg:w-8"
                          strokeWidth={1.25}
                        />
                      </div>
                      <h3 className="max-w-[10rem] font-serif text-[13px] font-normal leading-snug text-white/95 sm:max-w-[11rem] sm:text-[15px] lg:max-w-none lg:text-[20px] lg:leading-[1.35]">
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
          <div className="aspect-video w-full bg-black">
            {videoOpen && youtubeEmbed ? (
              <iframe
                src={`${youtubeEmbed}${youtubeEmbed.includes("?") ? "&" : "?"}autoplay=1`}
                title={`${BRAND.name} brand video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            ) : videoOpen && mp4Src ? (
              <video
                className="h-full w-full object-contain"
                controls
                autoPlay
                playsInline
                poster={video.posterImage}
              >
                <source src={mp4Src} type="video/mp4" />
              </video>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
