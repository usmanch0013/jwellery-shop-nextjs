import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex flex-col items-center leading-none group min-w-[90px]">
      {/* Zeesy-style golden butterfly/wings icon */}
      <svg
        width="40"
        height="32"
        viewBox="0 0 40 32"
        fill="none"
        className="mb-0.5"
        aria-hidden
      >
        <path
          d="M20 4C16 10 10 12 6 16c3 2 6 5 10 10 1-1 2-2 4-3 2-3 4-6 4-10 0-4-2-8-4-9z"
          fill="#c4a052"
        />
        <path
          d="M20 4c4 6 10 8 14 12-3 2-6 5-10 10-1-1-2-2-4-3-2-3-4-6-4-10 0-4 2-8 4-9z"
          fill="#d4b46a"
        />
        <path
          d="M20 8c-2 3-4 4-6 6 2 1 3 2 6 5 3-3 4-4 6-5-2-2-4-3-6-6z"
          fill="#e8d08a"
        />
      </svg>
      <span className="text-[17px] font-bold text-[#1a1a1a] tracking-tight lowercase">
        lumière
      </span>
      <span className="text-[7px] tracking-[0.4em] text-[#666] uppercase mt-1 font-medium">
        Jewellery
      </span>
    </Link>
  );
}
