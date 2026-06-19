import { neon } from "@neondatabase/serverless";

let sql: ReturnType<typeof neon> | null = null;

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (!sql) {
    sql = neon(url);
  }
  return sql;
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
