interface MarqueeBarProps {
  variant?: "light" | "dark";
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
    >
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

export default function MarqueeBar({ variant = "light" }: MarqueeBarProps) {
  const text = "Pakistan's 1st award winning Artificial Jewellery brand";
  const items = Array(6).fill(text);
  const isDark = variant === "dark";

  return (
    <div
      className={
        isDark
          ? "overflow-hidden py-4 border-t border-white/10 bg-[#0B3D35]/60 backdrop-blur-sm"
          : "bg-background overflow-hidden py-4 border-t border-border"
      }
    >
      <div className="animate-marquee flex whitespace-nowrap items-center">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-3 mx-6 text-[12px] capitalize tracking-wide ${
              isDark ? "text-white/75" : "text-foreground/80"
            }`}
          >
            <BoxIcon className={isDark ? "text-champagne/80" : "text-sage"} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
