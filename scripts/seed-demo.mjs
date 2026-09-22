// ============================================================================
//  Distribuidora B2B — Bootstrap de usuarios DEMO (Supabase Auth)
//
//  Crea (o actualiza) los dos usuarios demo usando la Supabase Admin API
//  desde Node. Requiere SUPABASE_SERVICE_ROLE_KEY, que se lee EXCLUSIVAMENTE
//  de variables de entorno del servidor/CLI. NUNCA debe ir en el navegador
//  ni en una variable NEXT_PUBLIC_*.
//
//  Ejecutar DESPUÉS de supabase/schema.sql (y de supabase/seed.sql si querés
//  también los datos de catálogo/pedidos):
//
//      npm run seed:demo
//
//  Idempotente: se puede ejecutar varias veces sin duplicar usuarios.
// ============================================================================

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
//  Carga robusta de .env.local
//  - Resuelto desde la ubicación de ESTE script (no del cwd), así funciona
//    aunque se ejecute desde otra carpeta.
//  - Sin dependencia de dotenv: parser mínimo compatible.
//  - Nunca imprime valores.
// ---------------------------------------------------------------------------
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..");

function loadEnvFile(fileName) {
  const filePath = path.join(PROJECT_ROOT, fileName);
  if (!fs.existsSync(filePath)) return 0;

  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  let loaded = 0;

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    if (!key) continue;

    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1);
    }

    // No pisa variables ya definidas en el entorno real
    if (process.env[key] === undefined) {
      process.env[key] = value;
      loaded += 1;
    }
  }

  return loaded;
}

// `.env.local` tiene precedencia sobre `.env` (convención Next.js)
loadEnvFile(".env");
const fromLocal = loadEnvFile(".env.local");

// ---------------------------------------------------------------------------
//  Configuración
// ---------------------------------------------------------------------------
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SECRET_KEY ??
  "";

const ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL ?? "admin@distribuidora.com";
const CLIENT_EMAIL =
  process.env.DEMO_CLIENT_EMAIL ?? "cliente@almacencentral.com";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "demo1234";

// IDs fijos que usa supabase/seed.sql para organización y clientes demo
const ORG_ID = "11111111-1111-1111-1111-111111111111";
const CUSTOMER_ID = "b0000000-0000-0000-0000-000000000001";

// ---------------------------------------------------------------------------
//  Validación de entorno (errores claros, nunca fallback silencioso)
// ---------------------------------------------------------------------------
function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

console.log(`Proyecto: ${PROJECT_ROOT}`);
console.log(`Variables cargadas de .env.local: ${fromLocal}`);
console.log(
  `NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL ? "OK" : "FALTA"}\n` +
    `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
        ? "OK"
        : "FALTA"
    }\n` +
    `SUPABASE_SERVICE_ROLE_KEY: ${SERVICE_ROLE_KEY ? "OK" : "FALTA"}`,
);

if (!SUPABASE_URL) {
  fail(
    "Falta NEXT_PUBLIC_SUPABASE_URL en .env.local (raíz del proyecto).",
  );
}

const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!ANON_KEY) {
  fail("Falta NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.");
}

if (!SERVICE_ROLE_KEY) {
  fail(
    "Falta SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Esta clave se usa SOLO para este script de seed (nunca en el cliente,\n" +
      "nunca con prefijo NEXT_PUBLIC_).\n" +
      "La encontrás en Supabase > Project Settings > API.",
  );
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const log = (message) => console.log(`  ${message}`);


// ---------------------------------------------------------------------------
//  1) Organización y clientes demo (idempotente, igual que seed.sql)
// ---------------------------------------------------------------------------
async function ensureOrgAndCustomers() {
  log("Organización y clientes demo…");

  const { error: orgError } = await admin.from("organizations").upsert(
    { id: ORG_ID, name: "Distribuidora Central", slug: "distribuidora-central" },
    { onConflict: "id" },
  );
  if (orgError) {
    fail(`No se pudo crear la organización: ${orgError.message}`);
  }

  const { error: customersError } = await admin
    .from("customers")
    .upsert(
      [
        {
          id: CUSTOMER_ID,
          organization_id: ORG_ID,
          name: "Almacén Central",
          company: "Almacén Central SRL",
          email: "compras@almacencentral.com",
          phone: "+54 11 4555-1200",
          address: "Av. Rivadavia 4520, CABA",
          active: true,
        },
      ],
      { onConflict: "id" },
    );
  if (customersError) {
    fail(`No se pudo crear el cliente demo: ${customersError.message}`);
  }

  log("  organización 'Distribuidora Central' y cliente 'Almacén Central' listos");
}

// ---------------------------------------------------------------------------
//  2) Usuarios demo en Supabase Auth (Admin API, idempotente)
// ---------------------------------------------------------------------------
async function upsertAuthUser({ email, fullName }) {
  // ¿Ya existe? (listUsers paginado; con los pocos usuarios de la demo alcanza)
  let existing = null;
  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      fail(`No se pudo consultar Supabase Auth: ${error.message}`);
    }

    existing = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );
    if (existing || data.users.length < perPage) break;
    page += 1;
  }

  if (existing) {
    // Ya existe: actualizar password + confirmar email (regla del brief)
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) {
      fail(`No se pudo actualizar ${email}: ${error.message}`);
    }
    log(`Auth actualizado: ${email} (password refrescado, email confirmado)`);
    return existing.id;
  }

  // No existe: crear usuario confirmado
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error || !data.user) {
    fail(`No se pudo crear ${email}: ${error?.message ?? "sin usuario"}`);
  }

  log(`Auth creado: ${email}`);
  return data.user.id;
}

// ---------------------------------------------------------------------------
//  3) Perfiles en public.users (rol + organización + cliente asociado)
// ---------------------------------------------------------------------------
async function ensureProfile({ userId, email, fullName, role, customerId }) {
  const { error } = await admin.from("users").upsert(
    {
      id: userId,
      organization_id: ORG_ID,
      customer_id: customerId,
      email,
      full_name: fullName,
      role,
    },
    { onConflict: "id" },
  );

  if (error) {
    fail(`No se pudo crear el perfil de ${email}: ${error.message}`);
  }

  log(`Perfil ${role}: ${email}`);
}

// ---------------------------------------------------------------------------
//  Ejecución
// ---------------------------------------------------------------------------
console.log("\nSeed de usuarios demo (Supabase Auth)\n");

await ensureOrgAndCustomers();

const adminUserId = await upsertAuthUser({
  email: ADMIN_EMAIL,
  fullName: "Sofía Administradora",
});

const clientUserId = await upsertAuthUser({
  email: CLIENT_EMAIL,
  fullName: "Martín Almacén Central",
  customerId: CUSTOMER_ID,
});

await ensureProfile({
  userId: adminUserId,
  email: ADMIN_EMAIL,
  fullName: "Sofía Administradora",
  role: "ADMIN",
  customerId: null,
});

await ensureProfile({
  userId: clientUserId,
  email: CLIENT_EMAIL,
  fullName: "Martín Almacén Central",
  role: "CLIENT",
  customerId: CUSTOMER_ID,
});

// Verificación final: probar credenciales reales con la API pública de Auth
const { error: checkError } = await admin.auth.signInWithPassword({
  email: ADMIN_EMAIL,
  password: DEMO_PASSWORD,
});
const { error: checkError2 } = await admin.auth.signInWithPassword({
  email: CLIENT_EMAIL,
  password: DEMO_PASSWORD,
});

if (checkError || checkError2) {
  fail(
    `Verificación fallida: ${checkError?.message ?? checkError2?.message}`,
  );
}

console.log("\n✔ Usuarios demo listos. Podés entrar con:\n");
console.log(`  Admin   ${ADMIN_EMAIL} / ${DEMO_PASSWORD}`);
console.log(`  Cliente ${CLIENT_EMAIL} / ${DEMO_PASSWORD}\n`);

