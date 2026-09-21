import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminUser } from "@/lib/admin/auth";
import {
  buildProductBackupJson,
  buildProductBackupZip,
} from "@/lib/admin/product-backup";

export const maxDuration = 120;

async function authorizeAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdminUser(user))) {
    return null;
  }
  return user;
}

function parseProductIds(searchParams: URLSearchParams): string[] | undefined {
  const idsParam = searchParams.get("ids");
  if (!idsParam) return undefined;
  try {
    const parsed = JSON.parse(idsParam) as unknown;
    if (!Array.isArray(parsed)) return undefined;
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  const user = await authorizeAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "json" ? "json" : "zip";
  const productIds = parseProductIds(searchParams);
  const date = new Date().toISOString().slice(0, 10);

  try {
    const admin = createAdminClient();

    if (format === "json") {
      const payload = await buildProductBackupJson(admin, productIds);
      const filename =
        productIds?.length && productIds.length > 0
          ? `products-export-${date}.json`
          : `products-backup-${date}.json`;

      return new NextResponse(JSON.stringify(payload, null, 2), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    const { buffer, payload } = await buildProductBackupZip(admin, productIds);
    const filename =
      productIds?.length && productIds.length > 0
        ? `products-backup-selected-${date}.zip`
        : `products-backup-${date}.zip`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Product-Count": String(payload.productCount),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
