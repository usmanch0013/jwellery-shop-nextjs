"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import {
  buildGoogleSheetDailyTemplate,
  buildVariationsCsvTemplate,
} from "@/lib/admin/product-csv";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ExportFormat = "zip" | "json";

async function downloadBackup(format: ExportFormat, ids?: string[]) {
  const params = new URLSearchParams({ format });
  if (ids?.length) params.set("ids", JSON.stringify(ids));

  const res = await fetch(`/api/admin/products/backup?${params.toString()}`);
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Export failed");
  }

  const date = new Date().toISOString().slice(0, 10);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;

  if (format === "json") {
    anchor.download = ids?.length
      ? `products-export-${date}.json`
      : `products-backup-${date}.json`;
  } else {
    anchor.download = ids?.length
      ? `products-backup-selected-${date}.zip`
      : `products-backup-${date}.zip`;
  }

  anchor.click();
  URL.revokeObjectURL(url);
}

type ImportResponse = {
  created: number;
  updated: number;
  failed: number;
  errors?: string[];
  error?: string;
};

export default function ProductExportMenu({
  selectedIds = [],
}: {
  selectedIds?: string[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const variationsInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<ExportFormat | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [variationsFile, setVariationsFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  function downloadTextFile(fileName: string, content: string) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleExport(format: ExportFormat, scope: "all" | "selected") {
    const ids = scope === "selected" ? selectedIds : undefined;
    if (scope === "selected" && (!ids || ids.length === 0)) {
      toast.error("Select products first");
      return;
    }

    setLoading(format);
    try {
      await downloadBackup(format, ids);
      toast.success(
        format === "zip"
          ? "Backup downloaded with product images"
          : "Product data exported as JSON"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleImport() {
    if (!importFile) {
      toast.error("Choose a backup file first");
      return;
    }

    if (
      !confirm(
        "Import will create new products or update existing ones (matched by slug). Continue?"
      )
    ) {
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.set("file", importFile);
      if (variationsFile) {
        formData.set("variationsFile", variationsFile);
      }

      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as ImportResponse;
      if (!res.ok) {
        throw new Error(data.error ?? "Import failed");
      }

      const summary = `${data.created} created, ${data.updated} updated${
        data.failed ? `, ${data.failed} failed` : ""
      }`;
      toast.success(`Import complete: ${summary}`);

      if (data.errors?.length) {
        toast.error(data.errors.slice(0, 3).join(" · "));
      }

      setImportFile(null);
      setVariationsFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (variationsInputRef.current) variationsInputRef.current.value = "";
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="inline-flex gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Download className="h-4 w-4" />
        Export / Import
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Export & import products</DialogTitle>
            <DialogDescription>
              Download one Google Sheets template for daily product entry, then
              import the same file when you are ready to publish.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            <div className="space-y-3 rounded-xl border border-[#008060]/20 bg-[#008060]/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[#008060]">
                Google Sheets — daily product sheet
              </p>
              <Button
                type="button"
                className="w-full justify-center gap-2"
                onClick={() =>
                  downloadTextFile(
                    "google-sheets-daily-products.csv",
                    buildGoogleSheetDailyTemplate()
                  )
                }
              >
                <FileSpreadsheet className="h-4 w-4" />
                Download Google Sheets template
              </Button>
              <ol className="list-decimal space-y-1 pl-4 text-[12px] leading-relaxed text-[var(--admin-text-subdued)]">
                <li>Download template and upload to Google Drive</li>
                <li>Open with Google Sheets — roz nayi row add karein</li>
                <li>
                  Jab import karna ho: File → Download → Comma Separated Values
                  (.csv)
                </li>
                <li>Neeche wali import section se CSV upload karein</li>
              </ol>
              <p className="text-[12px] leading-relaxed text-[var(--admin-text-subdued)]">
                Sample rows delete kar sakte hain. Slug khali chhor dein to name
                se auto ban jayega. Image column mein public URL chahiye.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-start gap-2"
                onClick={() =>
                  downloadTextFile(
                    "product-variations-template.csv",
                    buildVariationsCsvTemplate()
                  )
                }
              >
                <FileSpreadsheet className="h-4 w-4" />
                Variations sheet (optional — sizes/colors)
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-subdued)]">
                Export catalog
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  disabled={Boolean(loading) || importing}
                  onClick={() => void handleExport("zip", "all")}
                  className="justify-start gap-2"
                >
                  {loading === "zip" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Backup ZIP + images
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={Boolean(loading) || importing}
                  onClick={() => void handleExport("json", "all")}
                  className="justify-start gap-2"
                >
                  {loading === "json" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Export JSON only
                </Button>
              </div>
            </div>

            {selectedIds.length > 0 && (
              <div className="space-y-2 border-t border-[var(--admin-border)] pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-subdued)]">
                  Export selected ({selectedIds.length})
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={Boolean(loading) || importing}
                    onClick={() => void handleExport("zip", "selected")}
                    className="justify-start gap-2"
                  >
                    {loading === "zip" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Selected ZIP
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={Boolean(loading) || importing}
                    onClick={() => void handleExport("json", "selected")}
                    className="justify-start gap-2"
                  >
                    {loading === "json" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Selected JSON
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3 border-t border-[var(--admin-border)] pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-subdued)]">
                Import file
              </p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="import-file" className="text-[13px]">
                    Products file (.csv, .zip, or .json)
                  </Label>
                  <Input
                    id="import-file"
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.zip,.json,text/csv,application/zip,application/json"
                    disabled={importing}
                    className="text-[13px]"
                    onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variations-file" className="text-[13px]">
                    Variations file (.csv, optional)
                  </Label>
                  <Input
                    id="variations-file"
                    ref={variationsInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    disabled={importing}
                    className="text-[13px]"
                    onChange={(e) =>
                      setVariationsFile(e.target.files?.[0] ?? null)
                    }
                  />
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] leading-relaxed text-amber-950">
                  <strong>Update existing products:</strong> keep the same{" "}
                  <strong>SKU</strong> or <strong>Slug</strong> in your sheet.
                  Import will update that product instead of creating a duplicate.
                  Upload variations CSV with matching <strong>Product SKU</strong>.
                </div>
                <p className="text-[12px] leading-relaxed text-[var(--admin-text-subdued)]">
                  Missing categories and tags are added automatically. ZIP
                  backups can include downloaded images.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                disabled={importing || !importFile}
                className="w-full justify-center gap-2"
                onClick={() => void handleImport()}
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Import products
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
