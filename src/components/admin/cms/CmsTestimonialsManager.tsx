"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteCmsTestimonialAction,
  saveCmsTestimonialAction,
} from "@/actions/admin/cms";
import type { CmsTestimonial } from "@/lib/cms/types";
import { Plus, Save, Trash2 } from "lucide-react";

const fieldClass =
  "h-10 rounded-lg border border-[var(--admin-border)] bg-white px-3 text-[13px]";

export default function CmsTestimonialsManager({
  testimonials,
}: {
  testimonials: CmsTestimonial[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(testimonials);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function addNew() {
    setItems([
      ...items,
      {
        id: `new-${Date.now()}`,
        name: "",
        role: "",
        content: "",
        image: "",
        rating: 5,
        sort_order: items.length + 1,
        is_published: true,
      },
    ]);
  }

  async function saveItem(item: CmsTestimonial) {
    setLoadingId(item.id);
    await saveCmsTestimonialAction({
      id: item.id.startsWith("new-") ? undefined : item.id,
      name: item.name,
      role: item.role,
      content: item.content,
      image: item.image,
      rating: item.rating,
      sort_order: item.sort_order,
      is_published: item.is_published,
    });
    setLoadingId(null);
    router.refresh();
  }

  async function removeItem(id: string) {
    if (!id.startsWith("new-")) await deleteCmsTestimonialAction(id);
    setItems(items.filter((i) => i.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="admin-card space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2"><Label>Name</Label><Input className={fieldClass} value={item.name} onChange={(e) => { const next = [...items]; next[index] = { ...item, name: e.target.value }; setItems(next); }} /></div>
            <div className="space-y-2"><Label>Role</Label><Input className={fieldClass} value={item.role ?? ""} onChange={(e) => { const next = [...items]; next[index] = { ...item, role: e.target.value }; setItems(next); }} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Image URL</Label><Input className={fieldClass} value={item.image ?? ""} onChange={(e) => { const next = [...items]; next[index] = { ...item, image: e.target.value }; setItems(next); }} /></div>
          </div>
          <div className="space-y-2"><Label>Review</Label><textarea className={`${fieldClass} min-h-[80px] w-full py-2`} value={item.content} onChange={(e) => { const next = [...items]; next[index] = { ...item, content: e.target.value }; setItems(next); }} /></div>
          <div className="flex gap-2">
            <Button type="button" size="sm" disabled={loadingId === item.id} onClick={() => saveItem(item)} className="gap-1 bg-[#008060] hover:bg-[#006e52]"><Save className="h-3.5 w-3.5" />Save</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => removeItem(item.id)} className="gap-1"><Trash2 className="h-3.5 w-3.5" />Delete</Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addNew} className="gap-2"><Plus className="h-4 w-4" />Add testimonial</Button>
    </div>
  );
}
