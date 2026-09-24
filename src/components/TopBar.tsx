export default function TopBar({
  transparent = false,
  text = "Worldwide Shipping",
}: {
  transparent?: boolean;
  text?: string;
}) {
  return (
    <div
      className={`relative w-full ${
        transparent ? "bg-transparent text-white" : "bg-emerald text-white"
      }`}
    >
      <div className="mx-auto flex h-[var(--topbar-height)] max-w-[var(--site-max)] items-center justify-center px-[var(--site-px)] sm:justify-between">
        <p
          className={`max-w-full truncate text-center text-[9px] font-medium uppercase tracking-[0.2em] sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:text-[10px] sm:tracking-[0.32em] ${
            transparent
              ? "text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.65)]"
              : "text-white/90"
          }`}
        >
          {text}
        </p>

        <p
          className={`hidden text-[10px] uppercase tracking-[0.22em] lg:block ${
            transparent
              ? "text-champagne [text-shadow:0_1px_8px_rgba(0,0,0,0.65)]"
              : "text-champagne/90"
          }`}
        >
          Complimentary shipping
        </p>
      </div>
    </div>
  );
}
