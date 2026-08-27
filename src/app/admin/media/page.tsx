import { getAdminMediaLibrary } from "@/lib/admin/queries";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import MediaLibraryClient from "@/components/admin/MediaLibraryClient";
import type { DbMediaAsset } from "@/lib/database.types";

export default async function AdminMediaPage() {
  const items = (await getAdminMediaLibrary()) as DbMediaAsset[];

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <AdminPageHeader
        title="Media"
        description="Manage your image library — use these images for product featured images and galleries"
        backHref="/admin"
      />
      <MediaLibraryClient initialItems={items} />
    </div>
  );
}
