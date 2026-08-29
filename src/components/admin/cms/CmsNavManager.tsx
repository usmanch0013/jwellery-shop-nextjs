"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteCmsNavLinkAction,
  saveCmsNavLinksAction,
} from "@/actions/admin/cms";
import type { CmsNavLink } from "@/lib/cms/types";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-10 rounded-lg border border-[var(--admin-border)] bg-white px-3 text-[13px]";

function SortableNavRow({
  link,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  link: CmsNavLink;
  index: number;
  total: number;
  onChange: (patch: Partial<CmsNavLink>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "grid gap-2 rounded-lg border border-[var(--admin-border)] bg-white p-3 sm:grid-cols-[auto_1fr_1fr_auto]",
        isDragging && "z-10 opacity-70 shadow-lg",
        !link.is_visible && "opacity-60"
      )}
    >
      <button
        type="button"
        className="flex h-10 w-8 cursor-grab items-center justify-center text-[var(--admin-text-subdued)] active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <Input
        className={fieldClass}
        value={link.label}
        placeholder="Label"
        onChange={(e) => onChange({ label: e.target.value })}
      />
      <Input
        className={fieldClass}
        value={link.href}
        placeholder="/path or https://..."
        onChange={(e) => onChange({ href: e.target.value })}
      />

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          title={link.is_visible ? "Hide link" : "Show link"}
          onClick={() => onChange({ is_visible: !link.is_visible })}
        >
          {link.is_visible ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4 text-[var(--admin-text-subdued)]" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          disabled={index === 0}
          onClick={onMoveUp}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          disabled={index >= total - 1}
          onClick={onMoveDown}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-red-600 hover:text-red-700"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function NavGroup({
  title,
  location,
  links: initial,
}: {
  title: string;
  location: CmsNavLink["location"];
  links: CmsNavLink[];
}) {
  const router = useRouter();
  const [links, setLinks] = useState(initial);
  const [loading, setLoading] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    setLinks(initial);
  }, [initial]);

  function updateLink(id: string, patch: Partial<CmsNavLink>) {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function addLink() {
    setLinks((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        location,
        label: "New link",
        href: "/",
        sort_order: prev.length + 1,
        is_visible: true,
      },
    ]);
  }

  async function removeLink(link: CmsNavLink) {
    if (!link.id.startsWith("new-")) {
      const result = await deleteCmsNavLinkAction(link.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
    }
    setLinks((prev) => prev.filter((l) => l.id !== link.id));
    toast.success("Link removed");
    router.refresh();
  }

  function moveLink(id: string, direction: "up" | "down") {
    setLinks((prev) => {
      const index = prev.findIndex((l) => l.id === id);
      if (index < 0) return prev;
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      return arrayMove(prev, index, nextIndex);
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLinks((prev) => {
      const oldIndex = prev.findIndex((l) => l.id === active.id);
      const newIndex = prev.findIndex((l) => l.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  async function save() {
    setLoading(true);
    const payload = links.map((l, i) => ({
      ...l,
      location,
      sort_order: i + 1,
    }));
    const result = await saveCmsNavLinksAction(payload);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(`${title} saved`);
      router.refresh();
    }
  }

  return (
    <div className="admin-card p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-[11px] text-[var(--admin-text-subdued)]">
            Drag to reorder · toggle visibility · add or remove links
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" className="gap-1 h-8" onClick={addLink}>
            <Plus className="h-3.5 w-3.5" />
            Add link
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={loading}
            onClick={save}
            className="gap-1 h-8 bg-[#008060] hover:bg-[#006e52]"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </div>

      {links.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--admin-border)] p-6 text-center text-[13px] text-[var(--admin-text-subdued)]">
          No links yet. Click &quot;Add link&quot; to create one.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {links.map((link, i) => (
                <SortableNavRow
                  key={link.id}
                  link={link}
                  index={i}
                  total={links.length}
                  onChange={(patch) => updateLink(link.id, patch)}
                  onRemove={() => removeLink(link)}
                  onMoveUp={() => moveLink(link.id, "up")}
                  onMoveDown={() => moveLink(link.id, "down")}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

export default function CmsNavManager({
  header,
  footerUseful,
  footerLegal,
}: {
  header: CmsNavLink[];
  footerUseful: CmsNavLink[];
  footerLegal: CmsNavLink[];
}) {
  return (
    <div className="space-y-4">
      <NavGroup title="Header menu" location="header" links={header} />
      <NavGroup title="Footer useful links" location="footer_useful" links={footerUseful} />
      <NavGroup title="Footer policy links" location="footer_legal" links={footerLegal} />
    </div>
  );
}
