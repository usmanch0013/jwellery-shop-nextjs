"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {addresses.map((addr) => (
        <li
          key={addr.id}
          className="flex items-start justify-between gap-3 rounded-xl border border-border/50 bg-white p-4"
        >
          <div className="text-sm">
            <p className="font-medium">
              {addr.label}
              {addr.is_default && (
                <span className="ml-2 text-[11px] uppercase tracking-wide text-primary">
                  Default
                </span>
              )}
            </p>
            <p className="mt-1 text-muted-foreground">
              {addr.line1}
              {addr.line2 ? `, ${addr.line2}` : ""}
              <br />
              {addr.city}, {addr.province}
              {addr.postal_code ? ` ${addr.postal_code}` : ""}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-red-600 hover:text-red-700"
            onClick={() => handleDelete(addr.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
