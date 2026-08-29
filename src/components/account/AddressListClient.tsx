"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteAddressAction } from "@/actions/auth";

type AddressRow = {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  province: string;
  postal_code: string | null;
  is_default: boolean;
};

export default function AddressListClient({ addresses }: { addresses: AddressRow[] }) {
  const router = useRouter();

  async function handleDelete(id: string) {
    await deleteAddressAction(id);
    toast.success("Address removed");
    router.refresh();
  }

  if (addresses.length === 0) {
    return (
      <p className="text-[13px] text-[var(--user-text-subdued)]">
        No saved addresses yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {addresses.map((addr) => (
        <li
          key={addr.id}
          className="flex items-start justify-between gap-3 rounded-lg border border-[var(--user-border)] bg-[#fafbfb] p-4"
        >
          <div className="text-[13px]">
            <p className="font-medium text-[var(--user-text)]">
              {addr.label}
              {addr.is_default && (
                <span className="ml-2 rounded-md bg-[var(--user-accent)]/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--user-accent)]">
                  Default
                </span>
              )}
            </p>
            <p className="mt-1 text-[var(--user-text-subdued)]">
              {addr.line1}
              {addr.line2 ? `, ${addr.line2}` : ""}
              <br />
              {addr.city}, {addr.province}
              {addr.postal_code ? ` ${addr.postal_code}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(addr.id)}
            className="shrink-0 rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
            aria-label="Delete address"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
