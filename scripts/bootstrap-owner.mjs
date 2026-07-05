#!/usr/bin/env node
// Crea la cuenta inicial del Dueño (rol "owner") en el proyecto real de
// Supabase. Se corre UNA sola vez, después de completar .env.local y de
// haber aplicado supabase/migrations/0001_init.sql.
//
// Uso:
//   node scripts/bootstrap-owner.mjs [correo] ["Nombre Completo"]
//
// Si no se pasan argumentos, usa sebas.pesce.m@gmail.com / "Sebastián Pesce".

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

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

function stripAccents(value) {
  return value.normalize("NFD").replace(new RegExp("[\\u0300-\\u036f]", "g"), "");
}

function baseUsername(fullName) {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const [firstName, ...lastNameParts] = words;
  const lastName = lastNameParts.join("");
  const raw = `${firstName[0]}${lastName}`;
  return stripAccents(raw).toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function generateUniqueUsername(admin, fullName) {
  const base = baseUsername(fullName);
  let candidate = base;
  let suffix = 2;

  for (;;) {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("username", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${base}${suffix}`;
    suffix += 1;
  }
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!url || !serviceRoleKey) {
    console.error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local."
    );
    process.exit(1);
  }

  const email = process.argv[2] ?? "sebas.pesce.m@gmail.com";
  const fullName = process.argv[3] ?? "Sebastián Pesce";

  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existingProfile, error: lookupError } = await admin
    .from("profiles")
    .select("id, username, role")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    console.error(
      "No se pudo consultar la tabla 'profiles'. ¿Corriste supabase/migrations/0001_init.sql en este proyecto?",
      lookupError.message
    );
    process.exit(1);
  }

  if (existingProfile) {
    console.log(
      `Ya existe una cuenta para ${email} (usuario: ${existingProfile.username}, rol: ${existingProfile.role}). No se creó nada.`
    );
    return;
  }

  const username = await generateUniqueUsername(admin, fullName);

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    email,
    {
      redirectTo: `${siteUrl}/auth/callback?next=/set-password`,
      data: { username, full_name: fullName },
    }
  );

  if (inviteError || !invited?.user) {
    console.error("No se pudo invitar al dueño:", inviteError?.message ?? "error desconocido");
    process.exit(1);
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: invited.user.id,
    username,
    email,
    full_name: fullName,
    role: "owner",
  });

  if (profileError) {
    console.error("No se pudo crear el perfil del dueño:", profileError.message);
    process.exit(1);
  }

  console.log(`Cuenta de dueño creada: usuario "${username}", correo ${email}.`);
  console.log("Revisá esa casilla de correo para definir la contraseña y entrar a la app.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
