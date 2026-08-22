import Image from "next/image";
import { ChevronDown } from "lucide-react";

// Couple with ring / romantic formal - similar to Zeesy hero
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1920&h=900&fit=crop&q=85";

export default function HeroSection() {
  return (
    <section className="bg-background px-4 lg:px-8 pt-1 pb-3">
      <div className="max-w-[1400px] mx-auto">
        <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[500px] rounded-[18px] lg:rounded-[22px] overflow-hidden">
          <Image
            src={HERO_IMAGE}
            alt="Jewels That Celebrate Togetherness"
            fill
            className="object-cover object-[70%_center]"
            priority
            sizes="(max-width: 1400px) 100vw, 1400px"
          />

          {/* Dark overlay on left for text */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />

          {/* Text - left side, vertically centered-lower like Zeesy */}
          <div className="absolute left-6 sm:left-10 lg:left-14 top-1/2 -translate-y-[10%] z-10 max-w-[55%]">
            <h1 className="font-serif text-[28px] sm:text-[36px] lg:text-[44px] xl:text-[50px] text-white leading-[1.15] font-normal">
              Jewels That Celebrate
            </h1>
            <p className="font-script text-[36px] sm:text-[48px] lg:text-[58px] xl:text-[64px] text-champagne leading-[0.95] -mt-1 ml-0">
              Togetherness.
            </p>
          </div>

          {/* PK flag selector - bottom left corner */}
          <button
            type="button"
            className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex items-center gap-1 bg-white rounded-[4px] px-2 py-1 shadow-sm z-10"
            aria-label="Select country"
          >
            <span className="text-sm leading-none">🇵🇰</span>
            <ChevronDown className="w-3 h-3 text-[#555]" strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}
