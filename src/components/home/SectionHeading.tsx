import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  light?: boolean;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
  light = false,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 lg:mb-10">
      <div className="max-w-2xl">
        {eyebrow && (
          <p
            className={`text-[10px] sm:text-xs font-medium uppercase tracking-[0.32em] mb-2 ${
              light ? "text-champagne" : "text-champagne-dark"
            }`}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className={`font-serif text-2xl lg:text-[2rem] leading-tight ${
            light ? "text-white" : "text-foreground"
          }`}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`mt-2 text-sm leading-relaxed ${
              light ? "text-white/65" : "text-muted-foreground"
            }`}
          >
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className={`inline-flex items-center gap-1.5 text-sm font-medium shrink-0 group ${
            light
              ? "text-champagne hover:text-white"
              : "text-primary hover:text-emerald-dark"
          }`}
        >
          {linkLabel}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
