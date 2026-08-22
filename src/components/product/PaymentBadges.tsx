export default function PaymentBadges() {
  return (
    <div className="pt-6 mt-6 border-t border-border">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#888] text-center mb-4">
        Guarantee safe &amp; secure checkout
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Badge label="Visa" color="#1a1f71" />
        <Badge label="MC" color="#eb001b" />
        <Badge label="Amex" color="#006fcf" />
        <Badge label="PayPal" color="#003087" />
        <Badge label="Apple" color="#202321" />
        <Badge label="GPay" color="#4285f4" />
      </div>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center justify-center min-w-[38px] h-[24px] px-2 rounded text-[9px] font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}
