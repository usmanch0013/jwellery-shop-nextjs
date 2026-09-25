"use server";

import { getAdminClient } from "@/lib/admin/auth";
import { syncProductImagesToMediaLibrary } from "@/lib/admin/media-sync";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const mediaSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  altText: z.string().optional(),
  fileName: z.string().optional(),
});

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const MAX_BYTES = 10 * 1024 * 1024;

async function listMedia() {
  const admin = await getAdminClient();
  await syncProductImagesToMediaLibrary(admin).catch(() => 0);

  const { data, error } = await admin
    .from("media_library")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { items: [], error: error.message };
  return { items: data ?? [] };
}

async function insertMediaRecord(
  row: {
    url: string;
    title?: string | null;
    alt_text?: string | null;
    file_name?: string | null;
    mime_type?: string | null;
  }
) {
  const admin = await getAdminClient();
  const { data: existing } = await admin
    .from("media_library")
    .select("id")
    .eq("url", row.url)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from("media_library")
      .update({
        title: row.title ?? null,
        alt_text: row.alt_text ?? null,
        file_name: row.file_name ?? null,
        mime_type: row.mime_type ?? null,
      })
      .eq("id", existing.id);
    if (error) return { error: error.message };
    return { success: true, url: row.url };
  }

  const { error } = await admin.from("media_library").insert(row);
  if (error) return { error: error.message };
  return { success: true, url: row.url };
}

export async function getMediaLibraryAction() {
  return listMedia();
}

export async function syncProductMediaAction() {
  const admin = await getAdminClient();
  try {
    const imported = await syncProductImagesToMediaLibrary(admin);
    revalidatePath("/admin/media");
    return { success: true, imported };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return { error: message };
  }
}

export async function addMediaAction(formData: FormData) {
  const parsed = mediaSchema.safeParse({
    url: formData.get("url"),
    title: formData.get("title") || undefined,
    altText: formData.get("altText") || undefined,
    fileName: formData.get("fileName") || undefined,
  });

  if (!parsed.success) return { error: "Invalid media URL" };

  const result = await insertMediaRecord({
    url: parsed.data.url,
    title: parsed.data.title ?? null,
    alt_text: parsed.data.altText ?? null,
    file_name: parsed.data.fileName ?? null,
  });

  if (result.error) return { error: result.error };
  revalidatePath("/admin/media");
  return { success: true };
}

function validateImageUpload(fileName: string, contentType: string, fileSize: number) {
  if (!fileSize) return "Please choose an image file";
  if (!ALLOWED_TYPES.includes(contentType)) {
    return "Only JPG, PNG, WebP, GIF, or AVIF images are allowed";
  }
  if (fileSize > MAX_BYTES) {
    return "Image must be 10MB or smaller";
  }
  if (!fileName.trim()) return "Invalid file name";
  return null;
}

function storagePathForFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  return `uploads/${Date.now()}-${crypto.randomUUID()}.${extension}`;
}

function mapStorageError(message: string) {
  if (message.includes("Bucket not found")) {
    return "Supabase storage bucket “media” is missing. Run migration 005_media_storage.sql in Supabase SQL editor.";
  }
  if (/row-level security|policy/i.test(message)) {
    return "Storage permission error. Ensure SUPABASE_SERVICE_ROLE_KEY is set on Netlify and migrations are applied.";
  }
  return message;
}

/** Signed URL upload — file goes browser → Supabase (avoids Next.js body size limits). */
export async function createMediaUploadTargetAction(input: {
  fileName: string;
  contentType: string;
  fileSize: number;
}) {
  const validation = validateImageUpload(
    input.fileName,
    input.contentType,
    input.fileSize
  );
  if (validation) return { error: validation };

  try {
    const admin = await getAdminClient();
    const path = storagePathForFileName(input.fileName);
    const { data, error } = await admin.storage
      .from("media")
      .createSignedUploadUrl(path);

    if (error || !data?.signedUrl) {
      return {
        error: mapStorageError(error?.message ?? "Could not start upload"),
      };
    }

    const {
      data: { publicUrl },
    } = admin.storage.from("media").getPublicUrl(path);

    return {
      success: true as const,
      signedUrl: data.signedUrl,
      path,
      publicUrl,
      token: data.token ?? "",
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Upload could not start";
    if (message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return {
        error:
          "Server missing SUPABASE_SERVICE_ROLE_KEY. Add it in Netlify → Environment variables.",
      };
    }
    return { error: message };
  }
}

export async function finalizeMediaUploadAction(input: {
  path: string;
  publicUrl: string;
  fileName: string;
  contentType: string;
  altText?: string;
}) {
  if (!input.path || !input.publicUrl) {
    return { error: "Upload incomplete" };
  }

  try {
    await getAdminClient();
    const title = input.fileName.replace(/\.[^.]+$/, "");
    const result = await insertMediaRecord({
      url: input.publicUrl,
      title,
      alt_text: input.altText?.trim() || null,
      file_name: input.fileName,
      mime_type: input.contentType,
    });

    if (result.error) return { error: result.error };

    revalidatePath("/admin/media");
    return { success: true as const, url: input.publicUrl };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not save image to library";
    return { error: message };
  }
}

export async function uploadMediaFileAction(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose an image file" };
  }

  const validation = validateImageUpload(file.name, file.type, file.size);
  if (validation) return { error: validation };

  try {
    const admin = await getAdminClient();
    const path = storagePathForFileName(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from("media")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: mapStorageError(uploadError.message) };
    }

    const {
      data: { publicUrl },
    } = admin.storage.from("media").getPublicUrl(path);

    const title = file.name.replace(/\.[^.]+$/, "");
    const altText = String(formData.get("altText") ?? "").trim();
    const result = await insertMediaRecord({
      url: publicUrl,
      title,
      alt_text: altText || null,
      file_name: file.name,
      mime_type: file.type,
    });

    if (result.error) return { error: result.error };

    revalidatePath("/admin/media");
    return { success: true, url: publicUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    if (message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return {
        error:
          "Server missing SUPABASE_SERVICE_ROLE_KEY. Add it in Netlify → Environment variables.",
      };
    }
    return { error: message };
  }
}

export async function updateMediaAction(id: string, formData: FormData) {
  const patch: { title?: string | null; alt_text?: string | null } = {};
  if (formData.has("title")) {
    patch.title = String(formData.get("title") ?? "").trim() || null;
  }
  if (formData.has("altText")) {
    patch.alt_text = String(formData.get("altText") ?? "").trim() || null;
  }

  if (Object.keys(patch).length === 0) return { success: true };

  const admin = await getAdminClient();
  const { error } = await admin.from("media_library").update(patch).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/media");
  return { success: true };
}

export async function deleteMediaAction(id: string) {
  const admin = await getAdminClient();

  const { data: item } = await admin
    .from("media_library")
    .select("url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await admin.from("media_library").delete().eq("id", id);
  if (error) return { error: error.message };

  if (item?.url.includes("/storage/v1/object/public/media/")) {
    const marker = "/storage/v1/object/public/media/";
    const storagePath = item.url.split(marker)[1];
    if (storagePath) {
      await admin.storage.from("media").remove([storagePath]);
    }
  }

  revalidatePath("/admin/media");
  return { success: true };
}
