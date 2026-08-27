"use client";

import { useRef } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end);
  const replacement = `${before}${selected || "text"}${after}`;
  const next =
    textarea.value.slice(0, start) + replacement + textarea.value.slice(end);
  return { next, cursor: start + before.length + (selected || "text").length };
}

export default function RichTextEditor({
  name,
  defaultValue = "",
  value,
  onChange,
  className,
}: {
  name: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function applyFormat(before: string, after: string) {
    const textarea = ref.current;
    if (!textarea) return;
    const { next, cursor } = wrapSelection(textarea, before, after);
    onChange?.(next);
    textarea.value = next;
    textarea.focus();
    textarea.setSelectionRange(cursor, cursor);
  }

  function insertLink() {
    const url = window.prompt("Enter URL", "https://");
    if (!url) return;
    applyFormat(`<a href="${url}">`, "</a>");
  }

  const tools = [
    { icon: Bold, label: "Bold", action: () => applyFormat("<strong>", "</strong>") },
    { icon: Italic, label: "Italic", action: () => applyFormat("<em>", "</em>") },
    { icon: Heading2, label: "Heading 2", action: () => applyFormat("<h2>", "</h2>") },
    { icon: Heading3, label: "Heading 3", action: () => applyFormat("<h3>", "</h3>") },
    { icon: Pilcrow, label: "Paragraph", action: () => applyFormat("<p>", "</p>") },
    { icon: List, label: "Bullet list", action: () => applyFormat("<ul><li>", "</li></ul>") },
    { icon: ListOrdered, label: "Numbered list", action: () => applyFormat("<ol><li>", "</li></ol>") },
    { icon: Link2, label: "Link", action: insertLink },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <Label>Content</Label>
      <div className="overflow-hidden rounded-xl border border-border/70 bg-background">
        <div className="flex flex-wrap gap-1 border-b border-border/50 bg-muted/30 p-2">
          {tools.map(({ icon: Icon, label, action }) => (
            <Button
              key={label}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={action}
              title={label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
        <textarea
          ref={ref}
          name={name}
          defaultValue={defaultValue}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          rows={16}
          required
          className="min-h-[320px] w-full resize-y border-0 bg-transparent px-4 py-3 text-sm outline-none"
          placeholder="Write your blog post content here..."
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Use the toolbar for basic formatting. HTML is supported.
      </p>
    </div>
  );
}
