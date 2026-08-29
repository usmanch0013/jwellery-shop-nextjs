import { cn } from "@/lib/utils";
import { ORDER_EVENT_LABELS } from "@/lib/constants/commerce";
import type { DbOrderEvent } from "@/lib/orders/events";
import {
  CheckCircle2,
  Circle,
  FileText,
  Package,
  Truck,
  XCircle,
} from "lucide-react";

const EVENT_ICONS: Record<string, typeof Circle> = {
  order_placed: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
  invoice_generated: FileText,
};

const STATUS_STEPS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
] as const;

export default function OrderTimeline({
  events,
  currentStatus,
  className,
}: {
  events: DbOrderEvent[];
  currentStatus: string;
  className?: string;
}) {
  const currentStep = STATUS_STEPS.indexOf(
    currentStatus as (typeof STATUS_STEPS)[number]
  );
  const isCancelled = currentStatus === "cancelled";

  return (
    <div className={cn("space-y-6", className)}>
      {!isCancelled && (
        <div className="flex items-center justify-between gap-1">
          {STATUS_STEPS.map((step, index) => {
            const done = currentStep >= index;
            const active = currentStep === index;
            return (
              <div key={step} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium capitalize transition-colors",
                    done
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-border bg-background text-muted-foreground",
                    active && done && "ring-4 ring-emerald-100"
                  )}
                >
                  {index + 1}
                </div>
                <span
                  className={cn(
                    "hidden text-[10px] uppercase tracking-wide sm:block",
                    done ? "text-emerald-700 font-medium" : "text-muted-foreground"
                  )}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {events.length > 0 && (
        <ol className="relative space-y-0 border-l border-border/70 ml-3">
          {[...events].reverse().map((event, index) => {
            const Icon = EVENT_ICONS[event.event_type] ?? Circle;
            return (
              <li key={event.id} className="relative pb-6 pl-6 last:pb-0">
                <span
                  className={cn(
                    "absolute -left-[9px] flex h-[18px] w-[18px] items-center justify-center rounded-full border bg-background",
                    index === 0 ? "border-emerald-500 text-emerald-600" : "border-border text-muted-foreground"
                  )}
                >
                  <Icon className="h-2.5 w-2.5" />
                </span>
                <div>
                  <p className="text-sm font-medium">
                    {ORDER_EVENT_LABELS[event.event_type] ?? event.event_type}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{event.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground/80">
                    {new Date(event.created_at).toLocaleString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
