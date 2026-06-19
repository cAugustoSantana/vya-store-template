import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

export function loadEnvFile(filePath: string) {
  const full = path.resolve(filePath);
  if (!existsSync(full)) return;
  for (const line of readFileSync(full, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function hasE2eDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function hasE2eBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function uniqueEmail(prefix = "e2e"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

/** Minimal 1×1 PNG for proof upload tests */
export function writeProofPng(targetPath: string) {
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  writeFileSync(targetPath, png);
}
