import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

interface LogoProps {
  light?: boolean;
}

export default function Logo({ light = false }: LogoProps) {
  return (
    <Link
      href="/"
      className="group flex min-w-0 items-center gap-2.5 sm:gap-3"
      aria-label={`${BRAND.name} — ${BRAND.domain}`}
    >
      <Image
        src="/logo-mark.svg"
        alt=""
        width={36}
        height={36}
        className={`h-8 w-8 shrink-0 sm:h-9 sm:w-9 ${
          light ? "drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]" : ""
        }`}
        priority
      />
      <span className="flex min-w-0 flex-col leading-none">
        <span className="flex items-baseline gap-1.5">
          <span
            className={`font-serif text-[20px] font-medium tracking-[0.04em] sm:text-[22px] ${
              light
                ? "text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]"
                : "text-[#1a1a1a]"
            }`}
          >
            SHE
          </span>
          <span
            className={`hidden font-serif text-[11px] font-normal tracking-[0.28em] uppercase sm:inline ${
              light ? "text-white/90" : "text-ink-muted"
            }`}
          >
            Collection
          </span>
        </span>
        <span
          className={`mt-0.5 text-[7px] font-semibold uppercase tracking-[0.22em] sm:text-[8px] sm:tracking-[0.35em] max-[380px]:hidden ${
            light
              ? "text-champagne/95 [text-shadow:0_1px_8px_rgba(0,0,0,0.65)]"
              : "text-emerald/80"
          }`}
        >
          {BRAND.domain}
        </span>
      </span>
    </Link>
  );
}
