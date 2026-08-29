import type { LucideIcon } from "lucide-react";

export default function UserStatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 font-serif text-2xl text-foreground">{value}</p>
          {hint && (
            <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B3D35]/8">
          <Icon className="h-5 w-5 text-[#0B3D35]" />
        </div>
      </div>
    </div>
  );
}
