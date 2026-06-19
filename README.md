# E-commerce Order Template

Small-store order app: product catalog, checkout, bank-transfer proof of payment, admin order management. Fork it, edit config, connect services, deploy on Vercel.

Full architecture spec: [CURSOR_PROMPT.md](CURSOR_PROMPT.md)

## What you get

| Area | Details |
|------|---------|
| **Storefront** | Catalog, cart, variant selects, ES/EN i18n |
| **Checkout** | Contact form → order created → redirect to payment page |
| **Payment** | Bank details, proof upload (PNG/JPEG), WhatsApp CTA, mobile resume banner |
| **Admin** | Login, orders table, proof viewer, status updates, 30s polling |
| **API** | Vercel serverless `/api/*` with validation, JWT auth, rate limits |
| **Database** | Neon Postgres — manual `db/schema.sql` |

Payment v1 is **bank transfer + proof**. Stripe/Azul stubs exist under `api/lib/payments/` for future clones.

---

## Fork checklist (new store)

Use this when cloning the template for a real business.

### 1. Store config

Edit [`shared/store.config.ts`](shared/store.config.ts):

- [ ] `storeSlug`, `storeName`, `description`
- [ ] `currency`, `primaryColor`
- [ ] `contact` — WhatsApp, Instagram, `ownerEmail`
- [ ] `email.from` — must match verified Resend domain (see [docs/resend.md](docs/resend.md))
- [ ] `payment.bankTransfer` — real bank account details
- [ ] `products` — IDs, prices, variants (canonical keys, not translated prose in DB)

### 2. Assets

Replace placeholders — see [docs/assets.md](docs/assets.md):

- [ ] `public/logo.svg` (or update `logoUrl`)
- [ ] `public/favicon.svg`
- [ ] `public/products/*` product images

### 3. i18n (optional)

- [ ] Adjust copy in [`src/i18n/locales/es.json`](src/i18n/locales/es.json) and [`en.json`](src/i18n/locales/en.json)
- [ ] Add locales: extend `supportedLocales` in config + new JSON files

### 4. Vercel project

- [ ] Create Vercel project from this repo
- [ ] Connect **Neon Postgres** (Storage → Postgres) — creates `DATABASE_URL`
- [ ] Connect **Vercel Blob** — creates `BLOB_READ_WRITE_TOKEN` ([docs/blob.md](docs/blob.md))
- [ ] Set env vars (see [Environment variables](#environment-variables))
- [ ] **Preview deployments:** use a dev/test Neon branch — never production `DATABASE_URL`

### 5. Database

- [ ] Run [`db/schema.sql`](db/schema.sql) on Neon **dev** branch (local)
- [ ] Run same schema on Neon **prod** branch before first production deploy
- [ ] Optional: separate **ci** branch for E2E — see [db/README.md](db/README.md)

### 6. Email (Resend)

- [ ] Verify sending domain in Resend
- [ ] Set `RESEND_API_KEY` in Vercel
- [ ] Match `email.from` in config to verified domain
- [ ] Test checkout with a real email address

Details: [docs/resend.md](docs/resend.md)

### 7. Rate limits (Upstash)

- [ ] Connect Upstash Redis in production ([docs/upstash.md](docs/upstash.md))
- [ ] Set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
- [ ] Optional locally — in-memory fallback works for `vercel dev`

### 8. Admin access

- [ ] Set strong `ADMIN_PASSWORD` and random `ADMIN_SECRET` (32+ chars)
- [ ] Share `/admin` URL only with store owner

### 9. Deploy & verify

- [ ] Deploy to Vercel
- [ ] Full flow: add to cart → checkout → payment page → upload proof → admin confirm
- [ ] Enable GitHub required check `ci` before production deploys (Phase 9)

---

## Environment variables

Copy [`.env.example`](.env.example) to `.env.local` or pull from Vercel:

```bash
vercel link
vercel env pull
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `ADMIN_PASSWORD` | Yes | Admin panel login |
| `ADMIN_SECRET` | Yes | JWT signing secret (8h sessions) |
| `RESEND_API_KEY` | Yes (prod) | Transactional email |
| `BLOB_READ_WRITE_TOKEN` | Yes (prod) | Payment proof uploads |
| `UPSTASH_REDIS_REST_URL` | Prod recommended | Distributed rate limits |
| `UPSTASH_REDIS_REST_TOKEN` | Prod recommended | Distributed rate limits |
| `RATE_LIMIT_TEST` | CI only | Shorter limits for tests (`1`) |

---

## Local development

```bash
npm install
vercel link
vercel env pull
# Run db/schema.sql on your Neon dev branch (see db/README.md)
npm start              # full stack at http://localhost:3000 (API + frontend)
```

**Checkout requires the API.** Run `npm start` and open **http://localhost:3000**.

`npm run dev` is Vite-only on `:5173` (proxies `/api` → `:3000` when `npm start` is also running).

### Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Full stack at http://localhost:3000 (`vercel dev` + API) |
| `npm run dev` | Vite only on :5173 (proxies `/api` → :3000 if `npm start` is running) |
| `npm run dev:stack` | Alias for `npm start` |
| `npm run build` | Typecheck + production build |
| `npm run test:unit` | Vitest |
| `npm run test:e2e` | Playwright (needs running server + env) |
| `npm run test:ci` | unit + build + e2e |

---

## Project structure

```
shared/store.config.ts   Store config (products, bank, contact)
shared/types.ts          Shared TypeScript types
shared/db.types.ts       Database row types
src/                     React SPA (pages, components, i18n, hooks)
api/                     Vercel serverless routes + lib/
db/schema.sql            Postgres schema (run manually)
docs/                    Setup guides (Resend, Blob, Upstash, assets)
public/                  Logo, favicon, product images
e2e/                     Playwright specs
```

---

## Customer flow

1. **`/`** — Browse catalog, add items to cart
2. **`/checkout`** — Name, phone, email → `POST /api/checkout`
3. Order created with `payment_confirmation_pending`; owner emailed
4. **`/order/payment/:displayId`** — Bank details, upload proof or WhatsApp
5. Owner verifies in **`/admin`** → sets `confirmed`

Mobile-safe: payment URL is bookmarkable; `localStorage` resume banner; email deep link.

---

## Admin

- URL: `/admin`
- Login with `ADMIN_PASSWORD` → JWT in `sessionStorage` (8h)
- Orders auto-refresh every 30s when tab is visible
- View proof images, update status, quick “Confirm payment”

---

## Integrations

| Service | Doc |
|---------|-----|
| Resend (email) | [docs/resend.md](docs/resend.md) |
| Vercel Blob (proofs) | [docs/blob.md](docs/blob.md) |
| Upstash (rate limits) | [docs/upstash.md](docs/upstash.md) |
| Static assets | [docs/assets.md](docs/assets.md) |
| Neon database | [db/README.md](db/README.md) |

---

## Testing

```bash
npm run test:unit     # 47 unit tests (api/lib, helpers, hooks, components)
npx playwright install chromium   # first-time browser setup
npm run test:e2e      # Playwright — storefront/i18n without DB; full suite with .env.test.local
npm run test:ci       # Full CI pipeline locally
```

### E2E setup

1. Copy [`.env.test.local.example`](.env.test.local.example) → `.env.test.local`
2. Set `DATABASE_URL` (Neon **test** branch), `ADMIN_PASSWORD`, `ADMIN_SECRET`, `BLOB_READ_WRITE_TOKEN`
3. Run `db/schema.sql` on the test branch
4. `npm run test:e2e` — when `DATABASE_URL` is set, Playwright auto-starts `vercel dev` (full stack)

Without `.env.test.local`, storefront and i18n specs run against Vite only; checkout/payment/admin specs skip.

### GitHub Actions

CI runs on every push to `main` and every PR. See [docs/ci.md](docs/ci.md) for secrets and branch protection setup.

```bash
npm run test:ci   # local mirror: unit → build → e2e
```

---

## Security notes

- Prices recomputed server-side from config (never trust client totals)
- Honeypot field on checkout
- Rate limits on checkout, auth, proof upload
- Proof blobs served to admin only via authenticated API
- Email failure after DB save does not block checkout (logged server-side)

---

## License

Use as a template for client projects. Customize config and branding per store.
