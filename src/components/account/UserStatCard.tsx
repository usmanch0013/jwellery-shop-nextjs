import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export default function UserStatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn("user-card p-4 lg:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-[var(--user-text-subdued)]">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold leading-none text-[var(--user-text)]">
            {value}
          </p>
          {hint && (
            <p className="mt-1.5 text-[12px] text-[var(--user-text-subdued)]">
              {hint}
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--user-bg)] text-[var(--user-text-subdued)]">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}
