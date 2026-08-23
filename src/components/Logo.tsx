import Link from "next/link";

interface LogoProps {
  light?: boolean;
}

export default function Logo({ light = false }: LogoProps) {
  return (
    <Link href="/" className="flex flex-col items-center leading-none group min-w-[84px]">
      <svg
        width="34"
        height="28"
        viewBox="0 0 40 32"
        fill="none"
        className="mb-0.5"
        aria-hidden
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
      <span
        className={`text-[15px] font-bold tracking-tight lowercase ${
          light ? "text-white" : "text-foreground"
        }`}
      >
        lumière
      </span>
      <span
        className={`text-[6px] tracking-[0.38em] uppercase mt-0.5 font-medium ${
          light ? "text-white/70" : "text-muted-foreground"
        }`}
      >
        Jewellery
      </span>
    </Link>
  );
}
