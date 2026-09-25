import {
  createMediaUploadTargetAction,
  finalizeMediaUploadAction,
  uploadMediaFileAction,
} from "@/actions/admin/media";

function inferContentType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    avif: "image/avif",
  };
  return (ext && map[ext]) || "application/octet-stream";
}

/** Upload via signed URL (preferred on production). Falls back to server action for small files. */
export async function uploadMediaFileClient(
  file: File,
  altText?: string
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const alt = altText?.trim();
  const contentType = inferContentType(file);

  const target = await createMediaUploadTargetAction({
    fileName: file.name,
    contentType,
    fileSize: file.size,
  });

  if (target.error) {
    if (file.size <= 900_000) {
      const formData = new FormData();
      formData.set("file", file);
      if (alt) formData.set("altText", alt);
      const fallback = await uploadMediaFileAction(formData);
      if (fallback.error) return { ok: false, error: fallback.error };
      if (fallback.url) return { ok: true, url: fallback.url };
      return { ok: false, error: "Upload failed" };
    }
    return { ok: false, error: target.error };
  }

  if (!target.success) {
    return { ok: false, error: "Upload could not start" };
  }

  const put = await fetch(target.signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      ...(target.token ? { "x-upsert": "false" } : {}),
    },
    body: file,
  });

  if (!put.ok) {
    const detail = await put.text().catch(() => "");
    return {
      ok: false,
      error: detail
        ? `Storage rejected upload (${put.status})`
        : `Storage upload failed (${put.status})`,
    };
  }

  const done = await finalizeMediaUploadAction({
    path: target.path,
    publicUrl: target.publicUrl,
    fileName: file.name,
    contentType,
    altText: alt,
  });

  if (done.error) return { ok: false, error: done.error };
  return { ok: true, url: target.publicUrl };
}
