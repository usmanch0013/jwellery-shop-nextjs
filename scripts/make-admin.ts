#!/usr/bin/env npx tsx
/**
 * Promote a user to admin by email.
 * Usage: npm run db:make-admin -- email@example.com
 */
import { resolve } from "path";

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
  const email = (process.argv[2] ?? process.env.ADMIN_EMAILS?.split(",")[0] ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    console.error("Usage: npm run db:make-admin -- your@email.com");
    process.exit(1);
  }

  const { Client } = await import("pg");
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
      await c.connect();
      client = c;
      break;
    } catch (err) {
      lastError = err as Error;
      await c.end().catch(() => {});
    }
  }

  if (!client) {
    throw lastError ?? new Error("Could not connect to database");
  }

  const { rows: users } = await client.query<{ id: string; email: string }>(
    `SELECT id, email FROM auth.users WHERE lower(email) = $1 LIMIT 1`,
    [email]
  );

  if (!users.length) {
    console.error(`No auth user found for: ${email}`);
    console.error("Register this email on the site first, then run again.");
    await client.end();
    process.exit(1);
  }

  const userId = users[0].id;

  await client.query(
    `INSERT INTO public.profiles (id, role, full_name)
     VALUES ($1, 'admin', $2)
     ON CONFLICT (id) DO UPDATE SET role = 'admin'`,
    [userId, email.split("@")[0]]
  );

  const { rows: check } = await client.query<{ email: string; role: string }>(
    `SELECT u.email, p.role
     FROM auth.users u
     JOIN public.profiles p ON p.id = u.id
     WHERE u.id = $1`,
    [userId]
  );

  await client.end();

  console.log(`✓ Admin granted to ${check[0]?.email ?? email}`);
  console.log(`  Role: ${check[0]?.role ?? "admin"}`);
  console.log("\nThey can now access /admin after signing in.");
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
