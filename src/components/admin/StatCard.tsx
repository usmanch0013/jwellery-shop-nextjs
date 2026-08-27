import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: number;
  accent?: "emerald" | "gold" | "rose" | "violet" | "sky" | "amber";
  className?: string;
};

const accentStyles = {
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20",
    glow: "from-emerald-500/10 via-transparent to-transparent",
  },
  gold: {
    icon: "bg-amber-500/10 text-amber-700 ring-amber-500/20",
    glow: "from-amber-500/15 via-transparent to-transparent",
  },
  rose: {
    icon: "bg-rose-500/10 text-rose-600 ring-rose-500/20",
    glow: "from-rose-500/10 via-transparent to-transparent",
  },
  violet: {
    icon: "bg-violet-500/10 text-violet-600 ring-violet-500/20",
    glow: "from-violet-500/10 via-transparent to-transparent",
  },
  sky: {
    icon: "bg-sky-500/10 text-sky-600 ring-sky-500/20",
    glow: "from-sky-500/10 via-transparent to-transparent",
  },
  amber: {
    icon: "bg-orange-500/10 text-orange-600 ring-orange-500/20",
    glow: "from-orange-500/10 via-transparent to-transparent",
  },
};

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  accent = "emerald",
  className,
}: StatCardProps) {
  const styles = accentStyles[accent];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-5 shadow-[0_8px_30px_rgba(9,47,41,0.06)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(9,47,41,0.1)]",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
          styles.glow
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-serif text-2xl lg:text-[1.75rem] leading-none text-foreground">
            {value}
          </p>
          {hint && (
            <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
          )}
          {trend !== undefined && (
            <p
              className={cn(
                "mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                trend >= 0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              )}
            >
              {trend >= 0 ? "+" : ""}
              {trend}% vs last period
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
              styles.icon
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
