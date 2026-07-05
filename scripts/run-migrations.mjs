#!/usr/bin/env node
// Aplica los archivos .sql de supabase/migrations/ contra la base real,
// en orden, una sola vez cada uno (lleva registro en public.schema_migrations).
//
// Uso: node scripts/run-migrations.mjs
// Requiere SUPABASE_DB_URL en .env.local (Project Settings -> Database -> Connection string).

import fs from "node:fs";
import path from "node:path";
import pg from "pg";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error(
      "No se encontró .env.local. Copiá .env.local.example a .env.local y completá los valores primero."
    );
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();

  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    console.error(
      "Falta SUPABASE_DB_URL en .env.local (Project Settings -> Database -> Connection string)."
    );
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    await client.query(`
      create table if not exists public.schema_migrations (
        filename text primary key,
        applied_at timestamptz not null default now()
      );
    `);

    const dir = path.resolve(process.cwd(), "supabase/migrations");
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const { rows } = await client.query(
        "select 1 from public.schema_migrations where filename = $1",
        [file]
      );

      if (rows.length > 0) {
        console.log(`- ${file}: ya aplicada, se omite.`);
        continue;
      }

      const sql = fs.readFileSync(path.join(dir, file), "utf8");
      console.log(`- ${file}: aplicando...`);

      await client.query("begin");
      try {
        await client.query(sql);
        await client.query(
          "insert into public.schema_migrations (filename) values ($1)",
          [file]
        );
        await client.query("commit");
        console.log("  OK");
      } catch (err) {
        await client.query("rollback");
        console.error("  ERROR:", err instanceof Error ? err.message : err);
        process.exit(1);
      }
    }

    console.log("Listo.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
