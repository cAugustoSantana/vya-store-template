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

For **existing** branches created before the products catalog was added, run [`migrations/002_products.sql`](./migrations/002_products.sql) instead of re-running the full schema.

### psql

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

Existing branch (products only):

```bash
psql "$DATABASE_URL" -f db/migrations/002_products.sql
psql "$DATABASE_URL" -f db/seed/products.sql
```

## Seed demo products

After the `products` table exists, load the demo catalog (required for E2E and local storefront):

```bash
psql "$DATABASE_URL" -f db/seed/products.sql
```

Greenfield installs: `schema.sql` includes the `products` table definition but **not** seed rows — run the seed file above on dev/ci branches.

## Verify

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('orders', 'order_items', 'products');
```

Expected: three rows.

```sql
SELECT id, active FROM products ORDER BY sort_order;
```

Expected: `prod-1`, `prod-2` when seed has been applied.

## Migrations

| File | Purpose |
|------|---------|
| [`schema.sql`](./schema.sql) | Full schema for new branches |
| [`migrations/002_products.sql`](./migrations/002_products.sql) | Add `products` table to existing branches |
| [`migrations/003_orders_shipping.sql`](./migrations/003_orders_shipping.sql) | Add shipping fields to `orders` |
| [`seed/products.sql`](./seed/products.sql) | Demo catalog (`prod-1`, `prod-2`) |

Add numbered files under `db/migrations/` for future changes. Do not edit `schema.sql` in place after a branch has been initialized — add a migration instead.

## Row shape (reference)

**orders:** `id`, `display_id`, `created_at`, `buyer_name`, `buyer_phone`, `buyer_email`, `estado`, `total`, `locale`, `payment_provider`, `payment_proof_method`, `payment_proof_url`, `payment_verified_at`, `shipping_address`, `shipping_city`, `shipping_postal_code`

**order_items:** `id`, `order_id`, `product_id`, `product_name`, `variants`, `quantity`, `unit_price`

**products:** `id`, `name`, `description`, `price`, `image_url`, `variant_options`, `active`, `sort_order`, `created_at`, `updated_at`

Status values are **canonical keys** from `shared/store.config.ts` (`payment_confirmation_pending`, `confirmed`, …), not translated labels.
