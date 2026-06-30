/** Resolve env var from direct name or Vercel integration store prefix (e.g. stm_DATABASE_URL). */
export function resolveEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const direct = process.env[name];
    if (direct) return direct;
  }

  for (const name of names) {
    const suffix = `_${name}`;
    for (const [key, value] of Object.entries(process.env)) {
      if (key.endsWith(suffix) && value) return value;
    }
  }

  return undefined;
}

export function requireEnv(...names: string[]): string {
  const value = resolveEnv(...names);
  if (!value) {
    throw new Error(`${names[0]} is not configured`);
  }
  return value;
}
