# Database setup

Schema is applied **manually** once per Neon branch (no migration tool in v1).

## Branches

| Branch | Use |
|--------|-----|
| **dev** | Local `vercel dev` |
| **prod** | Production Vercel deployment |
| **ci** | GitHub Actions E2E (optional separate branch) |

Never point local or preview env at **production** `DATABASE_URL`.

## Apply schema

### Neon console

1. Open your Neon project → **SQL Editor**
2. Select the target branch (dev / prod / ci)
3. Paste and run the contents of [`schema.sql`](./schema.sql)

### psql

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

## Verify

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('orders', 'order_items');
```

Expected: two rows.

## Future changes

Add numbered files under `db/migrations/` (e.g. `002_add_notes.sql`) and document run order in this file. Do not edit `schema.sql` in place after a branch has been initialized — add a migration instead.

## Row shape (reference)

**orders:** `id`, `display_id`, `created_at`, `buyer_name`, `buyer_phone`, `buyer_email`, `estado`, `total`, `locale`, `payment_provider`, `payment_proof_method`, `payment_proof_url`, `payment_verified_at`

**order_items:** `id`, `order_id`, `product_id`, `product_name`, `variants`, `quantity`, `unit_price`

Status values are **canonical keys** from `shared/store.config.ts` (`payment_confirmation_pending`, `confirmed`, …), not translated labels.
