// ============================================================================
//  db:push — aplica supabase/schema.sql + supabase/seed.sql a la base de datos
//
//  Uso:
//      npm run db:push
//
//  Requiere en .env.local la cadena de conexión Postgres:
//      POSTGRES_URL_NON_POOLING=postgresql://postgres:...@db.xxx.supabase.co:5432/postgres
//      (o DATABASE_URL / POSTGRES_URL)
//
//  Nota: para DDL se necesita conexión DIRECTA (direct connection o session
//  pooler). El endpoint REST con service role key NO permite ejecutar SQL.
//
//  Es idempotente: ambos .sql usan `if not exists` / `on conflict`.
// ============================================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..");

// ---------------------------------------------------------------------------
//  Carga de .env.local (independiente del cwd, sin depender de dotenv)
// ---------------------------------------------------------------------------
for (const name of [".env", ".env.local"]) {
  const filePath = path.join(PROJECT_ROOT, name);
  if (!fs.existsSync(filePath)) continue;

  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "").trim();
    }
  }
}

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

const CANDIDATES = [
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
];

let connectionString = null;
let sourceKey = null;

for (const key of CANDIDATES) {
  const value = process.env[key];
  if (value && /^postgres(ql)?:\/\//i.test(value)) {
    connectionString = value;
    sourceKey = key;
    break;
  }
}

if (!connectionString) {
  fail(
    "No se encontró una cadena de conexión Postgres en .env.local.\n" +
      "Agregá (Supabase > Project Settings > Database > Connection string > URI, " +
      "pestaña 'Direct connection'):\n\n" +
      "  POSTGRES_URL_NON_POOLING=postgresql://...\n\n" +
      "Alternativa sin cadenas de conexión: pegar supabase/schema.sql y\n" +
      "supabase/seed.sql en el SQL Editor del dashboard de Supabase.",
  );
}

console.log(`Proyecto: ${PROJECT_ROOT}`);
console.log(`Conexión: ${sourceKey} OK (valor oculto)`);

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log("Conectado a Postgres.\n");

for (const file of ["schema.sql", "seed.sql"]) {
  const sqlPath = path.join(PROJECT_ROOT, "supabase", file);
  const sql = fs.readFileSync(sqlPath, "utf8");

  try {
    await client.query(sql);
    console.log(`✔ ${file} aplicado`);
  } catch (error) {
    fail(`${file}: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
//  Verificación de tablas y datos
// ---------------------------------------------------------------------------
console.log("\nEstado de las tablas:");
const TABLES = [
  "organizations",
  "users",
  "customers",
  "categories",
  "products",
  "customer_prices",
  "orders",
  "order_items",
];

for (const table of TABLES) {
  const { rows } = await client.query(
    `select count(*)::int as n from public.${table}`,
  );
  console.log(`  public.${table}: ${rows[0].n} filas`);
}

await client.end();
console.log(
  "\n✔ Esquema y datos listos. Ahora ejecutá:  npm run seed:demo\n",
);
