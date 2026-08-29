"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ORDER_STATUS_LABELS } from "@/lib/constants/commerce";

const selectClass =
  "h-10 rounded-xl border border-border/70 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20";

export default function AdminOrdersToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "all";
  const search = searchParams.get("q") ?? "";

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    router.push(`/admin/orders?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          defaultValue={search}
          placeholder="Search order #, email, phone..."
          className="pl-9"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParams("q", (e.target as HTMLInputElement).value);
            }
          }}
        />
      </div>
      <select
        value={status}
        onChange={(e) => updateParams("status", e.target.value)}
        className={selectClass}
      >
        <option value="all">All statuses</option>
        {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
