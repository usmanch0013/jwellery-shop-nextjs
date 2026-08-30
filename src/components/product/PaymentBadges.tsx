export default function PaymentBadges() {
  return (
    <div className="mt-8 border-t border-[#e8e2d4] pt-6">
      <p className="mb-4 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-[#9a958c]">
        Guarantee safe &amp; secure checkout
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge label="Visa" color="#1a1f71" />
        <Badge label="MC" color="#eb001b" />
        <Badge label="JazzCash" color="#d32f2f" />
        <Badge label="Easypaisa" color="#21b54b" />
        <Badge label="Bank" color="#006a4e" />
      </div>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex h-[22px] min-w-[42px] items-center justify-center rounded px-1.5 text-[8px] font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}
