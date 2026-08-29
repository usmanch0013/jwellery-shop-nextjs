#!/usr/bin/env npx tsx
/**
 * Apply pending migrations 008–011 (orders, CMS, security).
 * Usage: npm run db:migrate:pending
 */
import { readFileSync, readdirSync } from "fs";
import { resolve } from "path";

const PENDING = [
  "008_order_commerce_advanced.sql",
  "009_cms.sql",
  "010_security_hardening.sql",
  "011_security_fixes.sql",
];

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.SUPABASE_PROJECT_REF ?? "ktvzsfydpnnkqydkfuhq";
  const region = process.env.SUPABASE_DB_REGION ?? "ap-northeast-1";
  if (!password) {
    console.error("Missing DATABASE_URL or SUPABASE_DB_PASSWORD in .env.local");
    process.exit(1);
  }

  const encoded = encodeURIComponent(password);
  return `postgresql://postgres.${ref}:${encoded}@aws-0-${region}.pooler.supabase.com:5432/postgres`;
}

async function main() {
  const { Client } = await import("pg");
  const dir = resolve(process.cwd(), "supabase/migrations");

  const urls = [
    getDatabaseUrl(),
    process.env.SUPABASE_DB_PASSWORD
      ? `postgresql://postgres:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@db.${process.env.SUPABASE_PROJECT_REF ?? "ktvzsfydpnnkqydkfuhq"}.supabase.co:5432/postgres`
      : "",
  ].filter(Boolean);

  let client: InstanceType<(typeof import("pg"))["Client"]> | null = null;
  let lastError: Error | null = null;

  for (const connectionString of urls) {
    const c = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
    try {
      console.log("Connecting to Supabase Postgres...");
      await c.connect();
      client = c;
      break;
    } catch (err) {
      lastError = err as Error;
      await c.end().catch(() => {});
      console.warn(`Connection failed: ${lastError.message}`);
    }
  }

  if (!client) {
    throw lastError ?? new Error("Could not connect to database");
  }

  for (const file of PENDING) {
    const path = resolve(dir, file);
    if (!readdirSync(dir).includes(file)) {
      console.warn(`Missing file: ${file}`);
      continue;
    }
    const sql = readFileSync(path, "utf8");
    try {
      await client.query(sql);
      console.log(`✓ Applied ${file}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (
        message.includes("already exists") ||
        message.includes("duplicate") ||
        message.includes("policy") && message.includes("already")
      ) {
        console.log(`~ Skipped ${file} (already applied): ${message.split("\n")[0]}`);
      } else {
        console.error(`✗ Failed ${file}: ${message}`);
        await client.end();
        process.exit(1);
      }
    }
  }

  await client.end();
  console.log("\nDone. Pending migrations processed.");
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
