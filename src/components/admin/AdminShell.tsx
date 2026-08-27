import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  backHref,
  badge,
  actions,
}: {
  title: string;
  description?: string;
  backHref?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-2xl lg:text-[1.75rem] text-foreground">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function AdminCard({
  title,
  description,
  children,
  className,
  padding = true,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/60 bg-white/80 shadow-[0_8px_30px_rgba(9,47,41,0.06)] backdrop-blur-sm overflow-hidden",
        className
      )}
    >
      {(title || description) && (
        <div className="border-b border-border/50 px-5 py-4">
          {title && <h3 className="font-medium text-foreground">{title}</h3>}
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className={padding ? "p-5 space-y-1" : undefined}>{children}</div>
    </div>
  );
}

export function AdminTable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/60 bg-white/80 shadow-[0_8px_30px_rgba(9,47,41,0.06)] backdrop-blur-sm overflow-hidden",
        className
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function AdminTableElement({
  children,
}: {
  children: React.ReactNode;
}) {
  return <table className="w-full text-sm">{children}</table>;
}

export function AdminThead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-[#f8f4ec]/90 text-left text-muted-foreground">
      {children}
    </thead>
  );
}

export function AdminTh({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider">
      {children}
    </th>
  );
}

export function AdminTr({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={cn(
        "border-t border-border/50 transition-colors hover:bg-muted/20",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function AdminTd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-5 py-4", className)}>{children}</td>;
}

export function AdminEmpty({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <AdminCard>
      <div className="py-12 text-center">
        <p className="font-medium text-foreground">{title}</p>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </AdminCard>
  );
}

export function AdminInfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/40 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
