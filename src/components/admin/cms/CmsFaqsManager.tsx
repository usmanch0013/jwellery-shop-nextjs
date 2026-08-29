"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteCmsFaqAction, saveCmsFaqAction } from "@/actions/admin/cms";
import type { CmsFaq } from "@/lib/cms/types";
import { Plus, Save, Trash2 } from "lucide-react";

const fieldClass =
  "h-10 rounded-lg border border-[var(--admin-border)] bg-white px-3 text-[13px]";

export default function CmsFaqsManager({ faqs }: { faqs: CmsFaq[] }) {
  const router = useRouter();
  const [items, setItems] = useState(faqs);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function addNew() {
    setItems([
      ...items,
      {
        id: `new-${Date.now()}`,
        question: "",
        answer: "",
        sort_order: items.length + 1,
        is_published: true,
      },
    ]);
  }

  async function saveItem(item: CmsFaq) {
    setLoadingId(item.id);
    await saveCmsFaqAction({
      id: item.id.startsWith("new-") ? undefined : item.id,
      question: item.question,
      answer: item.answer,
      sort_order: item.sort_order,
      is_published: item.is_published,
    });
    setLoadingId(null);
    router.refresh();
  }

  async function removeItem(id: string) {
    if (!id.startsWith("new-")) await deleteCmsFaqAction(id);
    setItems(items.filter((i) => i.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="admin-card space-y-3 p-4">
          <div className="space-y-2"><Label>Question</Label><Input className={fieldClass} value={item.question} onChange={(e) => { const next = [...items]; next[index] = { ...item, question: e.target.value }; setItems(next); }} /></div>
          <div className="space-y-2"><Label>Answer</Label><textarea className={`${fieldClass} min-h-[80px] w-full py-2`} value={item.answer} onChange={(e) => { const next = [...items]; next[index] = { ...item, answer: e.target.value }; setItems(next); }} /></div>
          <div className="flex gap-2">
            <Button type="button" size="sm" disabled={loadingId === item.id} onClick={() => saveItem(item)} className="gap-1 bg-[#008060] hover:bg-[#006e52]"><Save className="h-3.5 w-3.5" />Save</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => removeItem(item.id)} className="gap-1"><Trash2 className="h-3.5 w-3.5" />Delete</Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addNew} className="gap-2"><Plus className="h-4 w-4" />Add FAQ</Button>
    </div>
  );
}
