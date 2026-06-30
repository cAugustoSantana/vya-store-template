import { neon } from "@neondatabase/serverless";
import { requireEnv, resolveEnv } from "./env.js";

let sql: ReturnType<typeof neon> | null = null;

export function getSql() {
  const url = requireEnv("DATABASE_URL", "POSTGRES_URL");
  if (!sql) {
    sql = neon(url);
  }
  return sql;
}

export function hasDatabase(): boolean {
  return Boolean(resolveEnv("DATABASE_URL", "POSTGRES_URL"));
}
