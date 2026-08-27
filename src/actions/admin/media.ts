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

export async function uploadMediaFileAction(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose an image file" };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Only JPG, PNG, WebP, GIF, or AVIF images are allowed" };
  }

  if (file.size > MAX_BYTES) {
    return { error: "Image must be 10MB or smaller" };
  }

  const admin = await getAdminClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `uploads/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from("media")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return {
      error:
        uploadError.message.includes("Bucket not found")
          ? "Storage bucket not ready. Use “Sync from products” or add images by URL for now."
          : uploadError.message,
    };
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("media").getPublicUrl(path);

  const title = file.name.replace(/\.[^.]+$/, "");
  const result = await insertMediaRecord({
    url: publicUrl,
    title,
    file_name: file.name,
    mime_type: file.type,
  });

  if (result.error) return { error: result.error };

  revalidatePath("/admin/media");
  return { success: true, url: publicUrl };
}

export async function updateMediaAction(id: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const altText = String(formData.get("altText") ?? "").trim();

  const admin = await getAdminClient();
  const { error } = await admin
    .from("media_library")
    .update({
      title: title || null,
      alt_text: altText || null,
    })
    .eq("id", id);

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
