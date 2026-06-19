import { neon } from "@neondatabase/serverless";
import { loadEnvFile, hasE2eDatabase } from "./helpers";

export default async function globalSetup() {
  loadEnvFile(".env.test.local");
  loadEnvFile(".env.local");

  process.env.RATE_LIMIT_TEST ??= "1";

  if (!hasE2eDatabase()) {
    console.warn(
      "E2E: DATABASE_URL not set — DB-dependent tests will be skipped. Copy .env.test.local.example → .env.test.local",
    );
    return;
  }

  const sql = neon(process.env.DATABASE_URL!);

  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name IN ('orders', 'order_items')
  `;

  if (tables.length < 2) {
    throw new Error(
      "E2E: orders/order_items tables missing — run db/schema.sql on your test Neon branch",
    );
  }

  await sql`DELETE FROM order_items`;
  await sql`DELETE FROM orders`;
}
