"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "@/actions/auth";

interface AccountProfileFormProps {
  fullName: string;
  phone: string;
  email: string;
}

export default function AccountProfileForm({
  fullName: initialName,
  phone: initialPhone,
  email,
}: AccountProfileFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfileAction(new FormData(e.currentTarget));
    setLoading(false);
    if (result.error) toast.error(result.error);
    else toast.success("Profile updated");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Email</Label>
        <Input value={email} disabled className="mt-1 bg-muted" />
      </div>
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={initialName}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          defaultValue={initialPhone}
          className="mt-1"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--user-accent)] px-4 text-[13px] font-semibold text-white hover:bg-[#006e52] disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
