import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminUser } from "@/lib/admin/auth";
import {
  importProductBackup,
  parseBackupJson,
  parseBackupZip,
} from "@/lib/admin/product-import";
import {
  detectCsvKind,
  importProductCsv,
} from "@/lib/admin/product-csv";

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

export async function POST(request: NextRequest) {
  const user = await authorizeAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const variationsFile = formData.get("variationsFile");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Please choose a file to import" }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    const admin = createAdminClient();

    let result;
    if (name.endsWith(".zip")) {
      const { payload, imageFiles } = await parseBackupZip(buffer);
      result = await importProductBackup(admin, payload, imageFiles);
    } else if (name.endsWith(".json")) {
      const payload = parseBackupJson(buffer.toString("utf-8"));
      result = await importProductBackup(admin, payload);
    } else if (name.endsWith(".csv")) {
      const productsCsv = buffer.toString("utf-8");
      const csvKind = detectCsvKind(productsCsv, file.name);

      if (csvKind === "variations" && !(variationsFile instanceof File)) {
        return NextResponse.json(
          { error: "Upload the products CSV first, then add the variations CSV." },
          { status: 400 }
        );
      }

      let variationsCsv: string | undefined;
      if (variationsFile instanceof File && variationsFile.size > 0) {
        variationsCsv = Buffer.from(await variationsFile.arrayBuffer()).toString("utf-8");
      }

      if (csvKind === "variations") {
        return NextResponse.json(
          { error: "Upload products CSV in the first field. Variations go in the second field." },
          { status: 400 }
        );
      }

      result = await importProductCsv(admin, productsCsv, variationsCsv);
    } else {
      return NextResponse.json(
        { error: "Upload a .csv, .zip, or .json file" },
        { status: 400 }
      );
    }

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      created: result.created,
      updated: result.updated,
      failed: result.failed,
      errors: result.errors.slice(0, 20),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
