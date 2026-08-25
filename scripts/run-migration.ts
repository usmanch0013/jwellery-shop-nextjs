#!/usr/bin/env npx tsx
/**
 * Apply supabase/migrations/001_initial_schema.sql to the linked project.
 * Requires DATABASE_URL or SUPABASE_DB_PASSWORD in .env.local
 *
 * Usage: npm run db:migrate
 */
import { readFileSync } from "fs";
import { resolve } from "path";

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.SUPABASE_PROJECT_REF ?? "ktvzsfydpnnkqydkfuhq";
  const region = process.env.SUPABASE_DB_REGION ?? "ap-northeast-1";
  if (!password) {
    console.error(
      "Missing DATABASE_URL or SUPABASE_DB_PASSWORD in .env.local"
    );
    process.exit(1);
  }

  const encoded = encodeURIComponent(password);
  // Session pooler (IPv4-friendly) — Tokyo region for this project
  return `postgresql://postgres.${ref}:${encoded}@aws-0-${region}.pooler.supabase.com:5432/postgres`;
}

async function connectClient() {
  const { Client } = await import("pg");
  const sqlPath = resolve(
    process.cwd(),
    "supabase/migrations/001_initial_schema.sql"
  );
  const sql = readFileSync(sqlPath, "utf8");

  const urls = [
    getDatabaseUrl(),
    process.env.SUPABASE_DB_PASSWORD
      ? `postgresql://postgres:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@db.${process.env.SUPABASE_PROJECT_REF ?? "ktvzsfydpnnkqydkfuhq"}.supabase.co:5432/postgres`
      : "",
  ].filter(Boolean);

  let lastError: Error | null = null;
  for (const connectionString of urls) {
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
    try {
      console.log("Connecting to Supabase Postgres...");
      await client.connect();
      console.log("Running migration (this may take a minute)...");
      await client.query(sql);
      await client.end();
      console.log("Migration complete.");
      return;
    } catch (err) {
      lastError = err as Error;
      await client.end().catch(() => {});
      console.warn(`Connection failed, trying next... (${lastError.message})`);
    }
  }
  throw lastError ?? new Error("Could not connect to database");
}

async function runExtraMigrations() {
  const { readdirSync, readFileSync: read } = await import("fs");
  const { Client } = await import("pg");
  const dir = resolve(process.cwd(), "supabase/migrations");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql") && f !== "001_initial_schema.sql")
    .sort();

  const client = new Client({
    connectionString: getDatabaseUrl(),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  for (const file of files) {
    const sql = read(resolve(dir, file), "utf8");
    try {
      await client.query(sql);
      console.log(`Applied ${file}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`Skipped ${file}: ${message}`);
    }
  }
  await client.end();
}

async function main() {
  await connectClient();
  await runExtraMigrations();
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
