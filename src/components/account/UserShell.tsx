import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserPageHeader({
  title,
  description,
  backHref,
  actions,
}: {
  title: string;
  description?: string;
  backHref?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="mb-2 inline-flex items-center gap-1.5 text-[13px] text-[var(--user-text-subdued)] hover:text-[var(--user-accent)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        )}
        <h1 className="text-xl font-semibold text-[var(--user-text)] lg:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-[13px] text-[var(--user-text-subdued)]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function UserCard({
  title,
  description,
  children,
  className,
  headerAction,
  padding = true,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  padding?: boolean;
}) {
  return (
    <div className={cn("user-card overflow-hidden", className)}>
      {(title || description || headerAction) && (
        <div className="flex items-start justify-between gap-3 border-b border-[var(--user-border)] px-4 py-3 lg:px-5">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-[var(--user-text)]">{title}</h3>
            )}
            {description && (
              <p className="mt-0.5 text-[13px] text-[var(--user-text-subdued)]">
                {description}
              </p>
            )}
          </div>
          {headerAction}
        </div>
      )}
      <div className={padding ? "p-4 lg:p-5" : undefined}>{children}</div>
    </div>
  );
}
