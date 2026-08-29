"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveCmsSiteAction } from "@/actions/admin/cms";
import type { CmsSiteSettings } from "@/lib/cms/types";
import { Save } from "lucide-react";

const fieldClass =
  "h-10 rounded-lg border border-[var(--admin-border)] bg-white px-3 text-[13px]";

export default function CmsSiteForm({ initial }: { initial: CmsSiteSettings }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function set<K extends keyof CmsSiteSettings>(key: K, value: CmsSiteSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const result = await saveCmsSiteAction(form);
    setLoading(false);
    if (result.error) setMessage(result.error);
    else {
      setMessage("Saved successfully.");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="admin-card p-5 space-y-4">
        <h3 className="text-sm font-semibold">Brand</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Brand name</Label>
            <Input className={fieldClass} value={form.brandName} onChange={(e) => set("brandName", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input className={fieldClass} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Footer description</Label>
          <textarea className={`${fieldClass} min-h-[80px] w-full py-2`} value={form.footerDescription} onChange={(e) => set("footerDescription", e.target.value)} />
        </div>
      </div>

      <div className="admin-card p-5 space-y-4">
        <h3 className="text-sm font-semibold">Contact</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Email</Label><Input className={fieldClass} value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input className={fieldClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Address</Label><Input className={fieldClass} value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Business hours</Label><Input className={fieldClass} value={form.hours} onChange={(e) => set("hours", e.target.value)} /></div>
        </div>
      </div>

      <div className="admin-card p-5 space-y-4">
        <h3 className="text-sm font-semibold">SEO & announcements</h3>
        <div className="space-y-2"><Label>Site title (SEO)</Label><Input className={fieldClass} value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} /></div>
        <div className="space-y-2"><Label>Site description (SEO)</Label><textarea className={`${fieldClass} min-h-[80px] w-full py-2`} value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Top bar text</Label><Input className={fieldClass} value={form.topBarText} onChange={(e) => set("topBarText", e.target.value)} /></div>
          <div className="space-y-2"><Label>Marquee text</Label><Input className={fieldClass} value={form.marqueeText} onChange={(e) => set("marqueeText", e.target.value)} /></div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading} className="gap-2 bg-[#008060] hover:bg-[#006e52]">
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save changes"}
        </Button>
        {message && <p className="text-sm text-[#008060]">{message}</p>}
      </div>
    </form>
  );
}
