"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type EditorMode = "visual" | "text";

function wrapTextareaSelection(
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
  label = "Content",
  defaultValue = "",
  value,
  onChange,
  className,
  rows = 16,
  placeholder,
  required = false,
  showHelper = true,
}: {
  name: string;
  label?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  showHelper?: boolean;
}) {
  const visualRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<EditorMode>("visual");
  const [html, setHtml] = useState(value ?? defaultValue);
  const minHeight = Math.max(160, rows * 22);

  const commitHtml = useCallback(
    (next: string) => {
      setHtml(next);
      onChange?.(next);
    },
    [onChange]
  );

  useEffect(() => {
    if (value !== undefined && value !== html) {
      setHtml(value);
    }
  }, [value, html]);

  useEffect(() => {
    if (mode !== "visual" || !visualRef.current) return;
    if (visualRef.current.innerHTML !== html) {
      visualRef.current.innerHTML = html || "";
    }
  }, [mode, html]);

  function syncFromVisual() {
    if (!visualRef.current) return;
    commitHtml(visualRef.current.innerHTML);
  }

  function runVisualCommand(command: string, commandValue?: string) {
    visualRef.current?.focus();
    document.execCommand(command, false, commandValue);
    syncFromVisual();
  }

  function applyTextFormat(before: string, after: string) {
    const textarea = textRef.current;
    if (!textarea) return;
    const { next, cursor } = wrapTextareaSelection(textarea, before, after);
    commitHtml(next);
    textarea.value = next;
    textarea.focus();
    textarea.setSelectionRange(cursor, cursor);
  }

  function insertLink() {
    const url = window.prompt("Enter URL", "https://");
    if (!url) return;
    if (mode === "visual") {
      runVisualCommand("createLink", url);
      return;
    }
    applyTextFormat(`<a href="${url}">`, "</a>");
  }

  const tools = [
    {
      icon: Bold,
      label: "Bold",
      action: () =>
        mode === "visual"
          ? runVisualCommand("bold")
          : applyTextFormat("<strong>", "</strong>"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () =>
        mode === "visual"
          ? runVisualCommand("italic")
          : applyTextFormat("<em>", "</em>"),
    },
    {
      icon: Underline,
      label: "Underline",
      action: () =>
        mode === "visual"
          ? runVisualCommand("underline")
          : applyTextFormat("<u>", "</u>"),
    },
    {
      icon: Strikethrough,
      label: "Strikethrough",
      action: () =>
        mode === "visual"
          ? runVisualCommand("strikeThrough")
          : applyTextFormat("<s>", "</s>"),
    },
    {
      icon: Pilcrow,
      label: "Paragraph",
      action: () =>
        mode === "visual"
          ? runVisualCommand("formatBlock", "p")
          : applyTextFormat("<p>", "</p>"),
    },
    {
      icon: Heading2,
      label: "Heading 2",
      action: () =>
        mode === "visual"
          ? runVisualCommand("formatBlock", "h2")
          : applyTextFormat("<h2>", "</h2>"),
    },
    {
      icon: Heading3,
      label: "Heading 3",
      action: () =>
        mode === "visual"
          ? runVisualCommand("formatBlock", "h3")
          : applyTextFormat("<h3>", "</h3>"),
    },
    {
      icon: Quote,
      label: "Quote",
      action: () =>
        mode === "visual"
          ? runVisualCommand("formatBlock", "blockquote")
          : applyTextFormat("<blockquote>", "</blockquote>"),
    },
    {
      icon: List,
      label: "Bullet list",
      action: () =>
        mode === "visual"
          ? runVisualCommand("insertUnorderedList")
          : applyTextFormat("<ul><li>", "</li></ul>"),
    },
    {
      icon: ListOrdered,
      label: "Numbered list",
      action: () =>
        mode === "visual"
          ? runVisualCommand("insertOrderedList")
          : applyTextFormat("<ol><li>", "</li></ol>"),
    },
    {
      icon: Link2,
      label: "Link",
      action: insertLink,
    },
    {
      icon: Undo2,
      label: "Undo",
      action: () => mode === "visual" && runVisualCommand("undo"),
      visualOnly: true,
    },
    {
      icon: Redo2,
      label: "Redo",
      action: () => mode === "visual" && runVisualCommand("redo"),
      visualOnly: true,
    },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <input type="hidden" name={name} value={html} required={required} />
      <div className="overflow-hidden rounded-xl border border-border/70 bg-background shadow-sm">
        <div className="flex flex-col gap-2 border-b border-border/50 bg-muted/30 px-2 py-1.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex max-w-full flex-wrap gap-0.5 overflow-x-auto">
            {tools.map(({ icon: Icon, label: toolLabel, action, visualOnly }) => (
              <Button
                key={toolLabel}
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 px-0"
                onClick={action}
                disabled={visualOnly && mode !== "visual"}
                title={toolLabel}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
          <div className="flex shrink-0 overflow-hidden rounded-lg border border-border/60 bg-background text-xs font-medium">
            <button
              type="button"
              className={cn(
                "px-3 py-1.5 transition-colors",
                mode === "visual"
                  ? "bg-[#1a4d3e] text-white"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
              onClick={() => setMode("visual")}
            >
              Visual
            </button>
            <button
              type="button"
              className={cn(
                "border-l border-border/60 px-3 py-1.5 transition-colors",
                mode === "text"
                  ? "bg-[#1a4d3e] text-white"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
              onClick={() => {
                if (mode === "visual") syncFromVisual();
                setMode("text");
              }}
            >
              Text
            </button>
          </div>
        </div>

        {mode === "visual" ? (
          <div
            ref={visualRef}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline
            data-placeholder={placeholder}
            onInput={syncFromVisual}
            onBlur={syncFromVisual}
            className={cn(
              "rte-visual prose prose-sm max-w-none px-4 py-3 text-sm text-foreground outline-none",
              "min-h-[var(--rte-min-h)] empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]",
              "[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold",
              "[&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold",
              "[&_p]:my-2 [&_blockquote]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic",
              "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6",
              "[&_a]:text-[#1a4d3e] [&_a]:underline"
            )}
            style={{ "--rte-min-h": `${minHeight}px` } as React.CSSProperties}
          />
        ) : (
          <textarea
            ref={textRef}
            value={html}
            onChange={(e) => commitHtml(e.target.value)}
            rows={rows}
            className="w-full resize-y border-0 bg-transparent px-4 py-3 font-mono text-[13px] leading-relaxed outline-none"
            style={{ minHeight }}
            placeholder={placeholder ?? "HTML content..."}
          />
        )}
      </div>
      {showHelper && (
        <p className="text-xs text-muted-foreground">
          <strong>Visual</strong> for formatted editing · <strong>Text</strong>{" "}
          for raw HTML (WordPress style). Toolbar works in both modes.
        </p>
      )}
    </div>
  );
}
