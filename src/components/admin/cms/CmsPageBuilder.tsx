"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Eye,
  GripVertical,
  History,
  Layers,
  Monitor,
  PanelLeft,
  Plus,
  Redo2,
  Save,
  Search,
  Settings,
  Smartphone,
  Tablet,
  Trash2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveCmsPageAction } from "@/actions/admin/cms";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import CmsPageSections from "@/components/cms/CmsPageSections";
import SectionProperties, {
  type MediaTarget,
} from "@/components/admin/cms/builder/SectionProperties";
import type { CmsPage } from "@/lib/cms/types";
import {
  WIDGET_CATEGORIES,
  createSection,
  normalizePageSections,
  pageFromSections,
  sectionLabel,
  widgetMeta,
  type CmsPageSection,
  type CmsSectionType,
  type WidgetCatalogItem,
} from "@/lib/cms/page-sections";
import { getPagePublicPath } from "@/lib/cms/page-utils";
import { CmsPageFormModal } from "@/components/admin/cms/CmsPageFormModal";
import { cn } from "@/lib/utils";

type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORT_WIDTH: Record<Viewport, string> = {
  desktop: "max-w-full",
  tablet: "max-w-[768px]",
  mobile: "max-w-[375px]",
};

const fieldClass =
  "h-9 rounded-lg border border-[var(--admin-border)] bg-white px-3 text-[13px]";

function widgetDragId(widget: WidgetCatalogItem) {
  return `widget-${widget.type}-${widget.label.replace(/\s+/g, "-").toLowerCase()}`;
}

function ElementorDropZone({
  index,
  active,
  large = false,
  onQuickAdd,
}: {
  index: number;
  active: boolean;
  large?: boolean;
  onQuickAdd?: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-${index}`,
    data: { kind: "dropzone", index },
  });

  if (large) {
    return (
      <div ref={setNodeRef} className="p-6">
        <div
          className={cn(
            "flex min-h-[280px] flex-col items-center justify-center rounded border-2 border-dashed transition-all",
            isOver
              ? "border-[#d0046e] bg-[#d0046e]/5"
              : active
                ? "border-[#d0046e]/50 bg-[#fafafa]"
                : "border-[#d5dadf] bg-[#fafafa]"
          )}
        >
          <div className="mb-4 flex gap-3">
            {["#a4afb7", "#c2cbd2", "#d0046e", "#93003f"].map((color) => (
              <div
                key={color}
                className="h-10 w-10 rounded-full shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <p className="text-[15px] text-[#6d7882]">
            {isOver ? "Release to add element" : "Drag widget here"}
          </p>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onQuickAdd}
              className="flex h-9 w-9 items-center justify-center rounded bg-[#d0046e] text-white shadow hover:bg-[#b0045f]"
              title="Add heading block"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} className={cn("transition-all", isOver ? "py-4" : "py-0.5")}>
      <div
        className={cn(
          "mx-2 rounded border-2 border-dashed transition-colors",
          isOver ? "border-[#d0046e] bg-[#d0046e]/10 py-3" : "border-transparent"
        )}
      >
        {isOver && (
          <p className="text-center text-[11px] font-medium text-[#d0046e]">
            Drop here
          </p>
        )}
      </div>
    </div>
  );
}

function ElementorWidget({
  widget,
  onAdd,
}: {
  widget: WidgetCatalogItem;
  onAdd: () => void;
}) {
  const dragId = widgetDragId(widget);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: { kind: "widget", sectionType: widget.type },
  });
  const Icon = widget.icon;

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      onClick={onAdd}
      className={cn(
        "group flex flex-col items-center gap-2 rounded p-2 text-center transition-colors hover:bg-[#3f4448] cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40"
      )}
    >
      <div className="flex h-[45px] w-full items-center justify-center rounded bg-[#34383c] group-hover:bg-[#3f4448]">
        <Icon className="h-5 w-5 text-[#b0b7be]" strokeWidth={1.5} />
      </div>
      <span className="text-[11px] leading-tight text-[#b0b7be]">{widget.label}</span>
    </button>
  );
}

function SortableCanvasSection({
  section,
  selected,
  onSelect,
  onDuplicate,
  onRemove,
  canRemove,
}: {
  section: CmsPageSection;
  selected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id, data: { kind: "section", section } });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const meta = widgetMeta(section.type);

  return (
    <div ref={setNodeRef} style={style} className={cn("group relative", isDragging && "z-50 opacity-60")}>
      <div
        onClick={onSelect}
        className={cn(
          "relative cursor-pointer",
          selected && "outline outline-2 outline-[#d0046e] outline-offset-[-2px] z-10"
        )}
      >
        <div
          className={cn(
            "absolute left-1/2 top-0 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 rounded bg-[#d0046e] px-1 py-0.5 text-white shadow-lg opacity-0 transition-opacity group-hover:opacity-100",
            selected && "opacity-100"
          )}
        >
          <button type="button" className="cursor-grab p-1" {...attributes} {...listeners} onClick={(e) => e.stopPropagation()}>
            <GripVertical className="h-3 w-3" />
          </button>
          <span className="px-1 text-[10px]">{meta?.label}</span>
          <button type="button" className="p-1 hover:bg-white/20" onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
            <Copy className="h-3 w-3" />
          </button>
          <button type="button" className="p-1 hover:bg-white/20 disabled:opacity-30" disabled={!canRemove} onClick={(e) => { e.stopPropagation(); onRemove(); }}>
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
        <CmsPageSections sections={[section]} preview />
      </div>
    </div>
  );
}

export default function CmsPageBuilder({ page }: { page: CmsPage }) {
  const router = useRouter();
  const initialSections = useMemo(() => normalizePageSections(page), [page]);
  const [sections, setSections] = useState<CmsPageSection[]>(initialSections);
  const [history, setHistory] = useState<CmsPageSection[][]>([initialSections]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(initialSections[0]?.id ?? null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftTab, setLeftTab] = useState<"elements" | "navigator">("elements");
  const [widgetSearch, setWidgetSearch] = useState("");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [seo, setSeo] = useState({ seo_title: page.seo_title ?? "", seo_description: page.seo_description ?? "" });
  const [showSeo, setShowSeo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<MediaTarget | null>(null);
  const [pageSettingsOpen, setPageSettingsOpen] = useState(false);
  const [draftPreview, setDraftPreview] = useState(false);
  const [pageTitle, setPageTitle] = useState(page.title);
  const [savedFingerprint, setSavedFingerprint] = useState("");
  const [activeDrag, setActiveDrag] = useState<{ kind: "widget" | "section"; label?: string } | null>(null);

  const contentFingerprint = useMemo(
    () => JSON.stringify({ sections, seo, pageTitle }),
    [sections, seo, pageTitle]
  );
  const isDirty = savedFingerprint !== "" && contentFingerprint !== savedFingerprint;

  useEffect(() => {
    const next = normalizePageSections(page);
    setSections(next);
    setHistory([next]);
    setHistoryIndex(0);
    setPageTitle(page.title);
    setSeo({ seo_title: page.seo_title ?? "", seo_description: page.seo_description ?? "" });
    setSavedFingerprint(
      JSON.stringify({
        sections: next,
        seo: { seo_title: page.seo_title ?? "", seo_description: page.seo_description ?? "" },
        pageTitle: page.title,
      })
    );
  }, [page]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const selected = sections.find((s) => s.id === selectedId) ?? null;
  const previewPath = getPagePublicPath(page.slug);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const filteredCategories = useMemo(() => {
    const q = widgetSearch.trim().toLowerCase();
    if (!q) return WIDGET_CATEGORIES;
    return WIDGET_CATEGORIES.map((cat) => ({
      ...cat,
      widgets: cat.widgets.filter((w) => w.label.toLowerCase().includes(q)),
    })).filter((cat) => cat.widgets.length > 0);
  }, [widgetSearch]);

  function pushHistory(next: CmsPageSection[]) {
    const trimmed = history.slice(0, historyIndex + 1);
    setHistory([...trimmed, next]);
    setHistoryIndex(trimmed.length);
    setSections(next);
  }

  function undo() {
    if (historyIndex <= 0) return;
    const idx = historyIndex - 1;
    setHistoryIndex(idx);
    setSections(history[idx]);
  }

  function redo() {
    if (historyIndex >= history.length - 1) return;
    const idx = historyIndex + 1;
    setHistoryIndex(idx);
    setSections(history[idx]);
  }

  function updateSection(id: string, patch: Partial<CmsPageSection>) {
    pushHistory(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function insertSection(type: CmsSectionType, index: number) {
    const section = createSection(type);
    const copy = [...sections];
    copy.splice(index, 0, section);
    pushHistory(copy);
    setSelectedId(section.id);
  }

  function duplicateSection(id: string) {
    const source = sections.find((s) => s.id === id);
    if (!source) return;
    const copy: CmsPageSection = {
      ...source,
      id: `sec_${Math.random().toString(36).slice(2, 10)}`,
      settings: { ...source.settings },
    };
    const idx = sections.findIndex((s) => s.id === id);
    const next = [...sections];
    next.splice(idx + 1, 0, copy);
    pushHistory(next);
    setSelectedId(copy.id);
  }

  function removeSection(id: string) {
    if (sections.length <= 1) return;
    const next = sections.filter((s) => s.id !== id);
    pushHistory(next);
    if (selectedId === id) setSelectedId(next[0]?.id ?? null);
  }

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as { kind: string; sectionType?: CmsSectionType };
    if (data?.kind === "widget" && data.sectionType) {
      const meta = widgetMeta(data.sectionType);
      setActiveDrag({ kind: "widget", label: meta?.label });
    } else setActiveDrag({ kind: "section" });
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;
    const activeData = active.data.current as { kind: string; sectionType?: CmsSectionType };
    const overData = over.data.current as { kind: string; index?: number };

    if (activeData?.kind === "widget" && activeData.sectionType) {
      let insertIndex = sections.length;
      if (overData?.kind === "dropzone" && typeof overData.index === "number") {
        insertIndex = overData.index;
      } else {
        const idx = sections.findIndex((s) => s.id === over.id);
        if (idx >= 0) insertIndex = idx + 1;
      }
      insertSection(activeData.sectionType, insertIndex);
      return;
    }

    if (activeData?.kind === "section" && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      if (oldIndex >= 0 && newIndex >= 0) pushHistory(arrayMove(sections, oldIndex, newIndex));
    }
  }

  function handleMediaSelect(urls: string[]) {
    if (!mediaTarget || !urls[0] || !selected) return;
    const settings = { ...selected.settings };
    if (mediaTarget.field === "gallery" && typeof mediaTarget.galleryIndex === "number") {
      const images = Array.isArray(settings.images) ? [...(settings.images as Array<{ src: string; alt: string }>)] : [];
      images[mediaTarget.galleryIndex] = { ...images[mediaTarget.galleryIndex], src: urls[0] };
      settings.images = images;
    } else settings[mediaTarget.field] = urls[0];
    updateSection(mediaTarget.sectionId, { settings });
    setMediaOpen(false);
    setMediaTarget(null);
  }

  async function handleSave() {
    setLoading(true);
    const result = await saveCmsPageAction(
      pageFromSections({ ...page, title: pageTitle, ...seo }, sections)
    );
    setLoading(false);
    if (result.error) {
      setMessage(result.error);
      toast.error(result.error);
      return;
    }
    setMessage("");
    setSavedFingerprint(contentFingerprint);
    toast.success("Page published");
    router.refresh();
  }

  const showEmptyCanvas = sections.length === 0;

  return (
    <div className="fixed inset-0 z-[200] flex h-screen flex-col bg-[#e6e9ec]">
      {/* Elementor top bar */}
      <header className="flex h-[42px] shrink-0 items-center justify-between bg-[#495157] px-2 text-white">
        <div className="flex items-center gap-1">
          <Link href="/admin/cms/pages" className="flex h-8 w-8 items-center justify-center rounded hover:bg-white/10" title="All Pages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <button type="button" onClick={() => setLeftOpen((v) => !v)} disabled={draftPreview} className="flex h-8 w-8 items-center justify-center rounded hover:bg-white/10 disabled:opacity-30" title="Toggle panel">
            <PanelLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => insertSection("heading_text", sections.length)} className="flex h-8 w-8 items-center justify-center rounded hover:bg-white/10" title="Add section">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 rounded bg-[#3f4448] px-2 py-1 text-[12px]">
          <button type="button" onClick={() => setPageSettingsOpen(true)} className="flex max-w-[140px] items-center gap-1 truncate hover:text-[#d0046e]" title="Page settings">
            <span className="truncate">{pageTitle}</span>
            <Settings className="h-3 w-3 shrink-0" />
          </button>
        </div>

        <div className="flex items-center gap-0.5 rounded bg-[#3f4448] p-0.5">
          {([
            ["desktop", Monitor],
            ["tablet", Tablet],
            ["mobile", Smartphone],
          ] as const).map(([vp, Icon]) => (
            <button
              key={vp}
              type="button"
              onClick={() => setViewport(vp)}
              className={cn(
                "flex h-7 w-8 items-center justify-center rounded",
                viewport === vp ? "bg-[#6d7882] text-white" : "text-[#b0b7be] hover:text-white"
              )}
              title={vp}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button type="button" onClick={undo} disabled={historyIndex <= 0} className="flex h-8 w-8 items-center justify-center rounded hover:bg-white/10 disabled:opacity-30" title="Undo">
            <Undo2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={redo} disabled={historyIndex >= history.length - 1} className="flex h-8 w-8 items-center justify-center rounded hover:bg-white/10 disabled:opacity-30" title="Redo">
            <Redo2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setLeftTab("navigator")} className="flex h-8 w-8 items-center justify-center rounded hover:bg-white/10" title="Navigator">
            <Layers className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setLeftOpen(true);
              setLeftTab("navigator");
            }}
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-white/10"
            title="Section navigator"
          >
            <History className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDraftPreview((v) => !v)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded hover:bg-white/10",
              draftPreview && "bg-[#d0046e] text-white"
            )}
            title={draftPreview ? "Exit draft preview" : "Preview draft (unsaved changes included)"}
          >
            <Eye className="h-4 w-4" />
          </button>
          <Link
            href={previewPath}
            target="_blank"
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-white/10"
            title="View live published page"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
          <button type="button" onClick={() => setShowSeo((v) => !v)} className="rounded px-2 py-1 text-[11px] hover:bg-white/10">SEO</button>
          <Button type="button" size="sm" className="h-8 rounded bg-[#d0046e] px-4 text-[12px] font-semibold hover:bg-[#b0045f]" disabled={loading} onClick={handleSave}>
            {loading ? "..." : "Publish"}
          </Button>
        </div>
      </header>

      {draftPreview && (
        <div className="shrink-0 border-b border-[#d0046e]/30 bg-[#fff0f7] px-4 py-2 text-center text-[12px] text-[#93003f]">
          Draft preview — showing unsaved changes. Click <strong>Publish</strong> to go live, or the{" "}
          <ExternalLink className="inline h-3 w-3" /> icon to view the published page.
        </div>
      )}

      {showSeo && !draftPreview && (
        <div className="shrink-0 border-b bg-white px-4 py-2">
          <div className="mx-auto grid max-w-3xl gap-2 sm:grid-cols-2">
            <Input className={fieldClass} placeholder="SEO title" value={seo.seo_title} onChange={(e) => setSeo({ ...seo, seo_title: e.target.value })} />
            <Input className={fieldClass} placeholder="SEO description" value={seo.seo_description} onChange={(e) => setSeo({ ...seo, seo_description: e.target.value })} />
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex min-h-0 flex-1">
          {/* Left — Elementor dark widget panel */}
          {leftOpen && !draftPreview && (
            <aside className="flex w-[280px] shrink-0 flex-col bg-[#26292c] text-white">
              <div className="flex border-b border-[#3f4448]">
                <button type="button" onClick={() => setLeftTab("elements")} className={cn("flex-1 py-2.5 text-[11px] font-medium", leftTab === "elements" ? "border-b-2 border-[#d0046e] text-white" : "text-[#b0b7be]")}>
                  Elements
                </button>
                <button type="button" onClick={() => setLeftTab("navigator")} className={cn("flex-1 py-2.5 text-[11px] font-medium", leftTab === "navigator" ? "border-b-2 border-[#d0046e] text-white" : "text-[#b0b7be]")}>
                  Navigator
                </button>
              </div>

              {leftTab === "elements" ? (
                <>
                  <div className="border-b border-[#3f4448] p-3">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6d7882]" />
                      <input
                        value={widgetSearch}
                        onChange={(e) => setWidgetSearch(e.target.value)}
                        placeholder="Search Widget..."
                        className="h-8 w-full rounded bg-[#34383c] pl-8 pr-3 text-[12px] text-white placeholder:text-[#6d7882] outline-none focus:ring-1 focus:ring-[#d0046e]"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2">
                    {filteredCategories.map((cat) => (
                      <div key={cat.name} className="mb-4">
                        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-[#6d7882]">
                          {cat.name}
                        </p>
                        <div className="grid grid-cols-3 gap-1">
                          {cat.widgets.map((widget) => (
                            <ElementorWidget
                              key={widgetDragId(widget)}
                              widget={widget}
                              onAdd={() => insertSection(widget.type, sections.length)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                    {sections.map((section, i) => (
                      <NavigatorItem key={section.id} section={section} index={i} selected={selectedId === section.id} onSelect={() => { setSelectedId(section.id); setRightOpen(true); }} />
                    ))}
                  </div>
                </SortableContext>
              )}
            </aside>
          )}

          {/* Canvas */}
          <main className={cn("flex-1 overflow-y-auto bg-[#e6e9ec]", draftPreview ? "p-0" : "p-4")}>
            <div
              className={cn(
                "mx-auto transition-all duration-300",
                draftPreview ? "max-w-full" : VIEWPORT_WIDTH[viewport]
              )}
            >
              <div
                className={cn(
                  "overflow-hidden bg-white",
                  draftPreview
                    ? "min-h-full shadow-none"
                    : "rounded-sm shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                )}
              >
                {draftPreview ? (
                  <div className="min-h-[calc(100vh-42px)]">
                    <CmsPageSections sections={sections} />
                  </div>
                ) : showEmptyCanvas ? (
                  <ElementorDropZone
                    index={0}
                    active={activeDrag?.kind === "widget"}
                    large
                    onQuickAdd={() => insertSection("heading_text", 0)}
                  />
                ) : (
                  <>
                    <ElementorDropZone index={0} active={activeDrag?.kind === "widget"} />
                    <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                      {sections.map((section, index) => (
                        <div key={section.id}>
                          <SortableCanvasSection
                            section={section}
                            selected={selectedId === section.id}
                            onSelect={() => { setSelectedId(section.id); setRightOpen(true); }}
                            onDuplicate={() => duplicateSection(section.id)}
                            onRemove={() => removeSection(section.id)}
                            canRemove={sections.length > 1}
                          />
                          <ElementorDropZone index={index + 1} active={activeDrag?.kind === "widget"} />
                        </div>
                      ))}
                    </SortableContext>
                  </>
                )}
              </div>
            </div>
            {!draftPreview && message && (
              <p className="mt-2 text-center text-sm text-[#d0046e]">{message}</p>
            )}
          </main>

          {/* Right — Edit panel (Elementor style) */}
          {rightOpen && selected && !draftPreview && (
            <aside className="flex w-[300px] shrink-0 flex-col overflow-hidden bg-white border-l border-[#d5dadf]">
              <div className="flex items-center justify-end border-b border-[#d5dadf] px-3 py-2">
                <button type="button" onClick={() => setRightOpen(false)} className="text-[#6d7882] hover:text-[#495157] text-lg leading-none px-1" title="Close panel">×</button>
              </div>
              <div className="flex min-h-0 flex-1 flex-col">
                <SectionProperties
                  section={selected}
                  onChange={(settings) => updateSection(selected.id, { settings })}
                  onOpenMedia={(target) => { setMediaTarget(target); setMediaOpen(true); }}
                />
              </div>
            </aside>
          )}
        </div>

        <DragOverlay>
          {activeDrag?.kind === "widget" && activeDrag.label && (
            <div className="rounded bg-[#34383c] px-4 py-3 text-[12px] text-white shadow-2xl border border-[#d0046e]">
              {activeDrag.label}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <MediaPickerModal open={mediaOpen} onOpenChange={setMediaOpen} onSelect={handleMediaSelect} title="Choose or upload image" />

      <CmsPageFormModal
        open={pageSettingsOpen}
        onOpenChange={setPageSettingsOpen}
        mode="edit"
        page={page}
        onSuccess={({ slug, title }) => {
          setPageTitle(title);
          setSavedFingerprint(
            JSON.stringify({
              sections,
              seo,
              pageTitle: title,
            })
          );
          router.refresh();
          if (slug !== page.slug) {
            router.replace(`/admin/cms/pages/${slug}`);
          }
        }}
      />
    </div>
  );
}

function NavigatorItem({ section, index, selected, onSelect }: { section: CmsPageSection; index: number; selected: boolean; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id, data: { kind: "section", section } });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const meta = widgetMeta(section.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-[12px] hover:bg-[#3f4448]",
        selected && "bg-[#3f4448] text-[#d0046e]"
      )}
    >
      <button type="button" className="cursor-grab p-0.5 text-[#6d7882]" {...attributes} {...listeners} onClick={(e) => e.stopPropagation()}>
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <span className="text-[#6d7882] w-4">{index + 1}</span>
      <span className="flex-1 truncate text-[#b0b7be]">{sectionLabel(section)}</span>
      <span className="text-[10px] text-[#6d7882]">{meta?.label}</span>
    </div>
  );
}
