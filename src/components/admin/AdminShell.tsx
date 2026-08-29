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
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="mb-2 inline-flex items-center gap-1.5 text-[13px] text-[var(--admin-text-subdued)] hover:text-[#008060]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-[var(--admin-text)] lg:text-2xl">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="mt-1 text-[13px] text-[var(--admin-text-subdued)]">
            {description}
          </p>
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
    <div className={cn("admin-card overflow-hidden", className)}>
      {(title || description) && (
        <div className="border-b border-[var(--admin-border)] px-4 py-3 lg:px-5">
          {title && (
            <h3 className="text-sm font-semibold text-[var(--admin-text)]">{title}</h3>
          )}
          {description && (
            <p className="mt-0.5 text-[13px] text-[var(--admin-text-subdued)]">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={padding ? "p-4 lg:p-5 space-y-1" : undefined}>{children}</div>
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
    <div className={cn("admin-card overflow-hidden", className)}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function AdminTableElement({
  children,
}: {
  children: React.ReactNode;
}) {
  return <table className="w-full text-[13px]">{children}</table>;
}

export function AdminThead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-[var(--admin-border)] bg-[#fafbfb] text-left text-[var(--admin-text-subdued)]">
      {children}
    </thead>
  );
}

export function AdminTh({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide lg:px-5">
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
        "border-b border-[var(--admin-border)] last:border-0 transition-colors hover:bg-[#fafbfb]",
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
  return <td className={cn("px-4 py-3 lg:px-5", className)}>{children}</td>;
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
      <div className="py-16 text-center">
        <p className="font-medium text-[var(--admin-text)]">{title}</p>
        {description && (
          <p className="mt-2 text-[13px] text-[var(--admin-text-subdued)]">
            {description}
          </p>
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
    <div className="flex items-start justify-between gap-4 border-b border-[var(--admin-border)] py-2.5 last:border-0">
      <span className="text-[13px] text-[var(--admin-text-subdued)]">{label}</span>
      <span className="text-[13px] font-medium text-right">{value}</span>
    </div>
  );
}

export function AdminTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-[var(--admin-border)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "shrink-0 border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors",
            active === tab.id
              ? "border-[#008060] text-[var(--admin-text)]"
              : "border-transparent text-[var(--admin-text-subdued)] hover:text-[var(--admin-text)]"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 rounded-full bg-[var(--admin-bg)] px-1.5 py-0.5 text-[11px]">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
