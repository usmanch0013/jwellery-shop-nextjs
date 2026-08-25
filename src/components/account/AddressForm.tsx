"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PK_PROVINCES } from "@/lib/constants/commerce";
import { saveAddressAction } from "@/actions/auth";

export default function AddressForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await saveAddressAction(new FormData(e.currentTarget));
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Address saved");
      e.currentTarget.reset();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border p-4">
      <div>
        <Label htmlFor="label">Label</Label>
        <Input id="label" name="label" defaultValue="Home" />
      </div>
      <div>
        <Label htmlFor="line1">Address</Label>
        <Input id="line1" name="line1" required />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" required />
        </div>
        <div>
          <Label htmlFor="province">Province</Label>
          <select
            id="province"
            name="province"
            className="w-full h-9 border px-2 text-sm"
            defaultValue={PK_PROVINCES[0]}
          >
            {PK_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>
      <input type="hidden" name="isDefault" value="false" />
      <Button type="submit" size="sm" disabled={loading}>
        Add Address
      </Button>
    </form>
  );
}
