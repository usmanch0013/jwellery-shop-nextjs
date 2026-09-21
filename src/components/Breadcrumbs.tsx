import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-5 flex items-center gap-2 overflow-x-auto text-sm text-muted-foreground sm:mb-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <Link
        href="/"
        className="flex shrink-0 items-center gap-1 transition-colors hover:text-primary"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex min-w-0 shrink-0 items-center gap-2">
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          {item.href ? (
            <Link
              href={item.href}
              className="max-w-[140px] truncate transition-colors hover:text-primary sm:max-w-none"
            >
              {item.label}
            </Link>
          ) : (
            <span className="max-w-[180px] truncate text-foreground sm:max-w-none">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
