import Link from "next/link";

interface LogoProps {
  light?: boolean;
}

export default function Logo({ light = false }: LogoProps) {
  return (
    <Link href="/" className="group flex items-center gap-3">
      <svg
        width="34"
        height="28"
        viewBox="0 0 40 32"
        fill="none"
        aria-hidden
        className={`shrink-0 ${light ? "drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]" : ""}`}
      >
        <path
          d="M20 4C16 10 10 12 6 16c3 2 6 5 10 10 1-1 2-2 4-3 2-3 4-6 4-10 0-4-2-8-4-9z"
          fill="#C9A96E"
        />
        <path
          d="M20 4c4 6 10 8 14 12-3 2-6 5-10 10-1-1-2-2-4-3-2-3-4-6-4-10 0-4 2-8 4-9z"
          fill="#D4BC8A"
        />
        <path
          d="M20 8c-2 3-4 4-6 6 2 1 3 2 6 5 3-3 4-4 6-5-2-2-4-3-6-6z"
          fill="#E8D5A8"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className={`font-serif text-[22px] font-medium tracking-[0.02em] lowercase ${
            light
              ? "text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]"
              : "text-[#1a1a1a]"
          }`}
        >
          lumière
        </span>
        <span
          className={`mt-1 text-[8px] font-medium uppercase tracking-[0.4em] ${
            light
              ? "text-white/80 [text-shadow:0_1px_8px_rgba(0,0,0,0.65)]"
              : "text-[#8a8680]"
          }`}
        >
          Jewellery
        </span>
      </span>
    </Link>
  );
}
