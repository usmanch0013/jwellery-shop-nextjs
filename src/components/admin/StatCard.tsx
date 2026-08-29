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

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div className={cn("admin-card p-4 lg:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-[var(--admin-text-subdued)]">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold leading-none text-[var(--admin-text)]">
            {value}
          </p>
          {hint && (
            <p className="mt-1.5 text-[12px] text-[var(--admin-text-subdued)]">
              {hint}
            </p>
          )}
          {trend !== undefined && (
            <p
              className={cn(
                "mt-2 inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                trend >= 0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              )}
            >
              {trend >= 0 ? "+" : ""}
              {trend}% vs last month
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-bg)] text-[var(--admin-text-subdued)]">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}
