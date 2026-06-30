import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

function loadEnv(path) {
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)="?(.*)"?$/);
    if (m) process.env[m[1]] = m[2].replace(/\\r\\n$/, "").replace(/\\n$/, "");
  }
}

loadEnv(".env.production.local");

const url = process.env.stm_DATABASE_URL;
if (!url) {
  console.error("No stm_DATABASE_URL in .env.production.local");
  process.exit(1);
}

const sql = neon(url);
const files = [
  "db/migrations/006_fix_description_column.sql",
  "db/migrations/005_product_stock.sql",
];

for (const file of files) {
  const text = readFileSync(file, "utf8");
  console.log("Running", file);
  await sql.unsafe(text);
  console.log("OK", file);
}

const cols = await sql`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_name = 'products'
  ORDER BY ordinal_position
`;
console.log("products columns:", cols.map((c) => c.column_name).join(", "));

const count = await sql`SELECT COUNT(*)::int AS n FROM products`;
console.log("product count:", count[0].n);
