# Small E-commerce Order App (template)

Reusable template for a small business storefront: products, checkout, bank-transfer proof of payment, admin order management. Store-specific data lives in config; clone, edit config, set env vars, deploy.

## Tech stack

- **Frontend**: React + Vite (SPA), CSS modules, React Router
- **i18n**: react-i18next; multi-language per deployment (ES + EN shipped)
- **Backend**: Vercel serverless `/api/*`
- **Database**: Vercel Postgres (Neon) — `DATABASE_URL`
- **Proof uploads**: Vercel Blob — `BLOB_READ_WRITE_TOKEN`
- **Email**: Resend — `RESEND_API_KEY`; `email.from` + `contact.ownerEmail` in config
- **Rate limits**: Upstash Redis (prod recommended) or in-memory (dev)
- **Hosting**: Vercel
- **Tests**: Vitest (unit) + Playwright (E2E); GitHub Actions CI on every push/PR

## Design principles

1. **Security** — server-side validation, JWT admin auth, rate limits, honeypot, private proof blobs
2. **Modularity** — `/api/lib/*` helpers; payment provider abstraction; config + i18n JSON
3. **Ease** — manual `db/schema.sql`, `npm start` (full stack), fork README

**Canonical keys in DB/API; localized labels at render.** Order statuses, variant keys, product IDs are machine keys — never Spanish/English prose in Postgres.

## Config (`shared/store.config.ts` or `src/store.config.ts`)

```ts
export const storeConfig = {
  storeSlug: "MITIENDA",
  storeName: { es: "Mi Tienda", en: "My Store" },
  description: { es: "...", en: "..." },
  defaultLocale: "es",
  supportedLocales: ["es", "en"],
  currency: "DOP",
  primaryColor: "#2563eb",
  logoUrl: "/logo.svg",
  phone: { defaultCountryCode: "1", localDigits: 10 },
  email: { from: "Pedidos <pedidos@mitienda.com>" },
  contact: {
    whatsappCountryCode: "1",
    whatsappNumber: "8095551234",
    instagramUrl: "https://www.instagram.com/mystore",
    ownerEmail: "owner@mystore.com",
  },
  payment: {
    provider: "bank_transfer_proof", // future: "stripe" | "azul"
    bankTransfer: {
      bankName: { es: "Banco Ejemplo", en: "Example Bank" },
      accountName: "Mi Tienda SRL",
      accountNumber: "1234567890",
      accountType: { es: "Ahorros", en: "Savings" },
      referenceHint: { es: "Usa tu número de pedido como referencia", en: "Use your order number as reference" },
    },
  },
  orderStatuses: ["payment_confirmation_pending", "confirmed", "in_production", "delivered", "cancelled"],
  defaultOrderStatus: "payment_confirmation_pending",
  products: [
    {
      id: "prod-1",
      name: { es: "Camiseta", en: "T-shirt" },
      description: { es: "...", en: "..." },
      price: 1500,
      imageUrl: "/products/prod-1.svg",
      variantOptions: {
        size: {
          label: { es: "Talla", en: "Size" },
          values: {
            s: { es: "S", en: "S" },
            m: { es: "M", en: "M" },
          },
        },
        color: {
          label: { es: "Color", en: "Color" },
          values: {
            black: { es: "Negro", en: "Black" },
            white: { es: "Blanco", en: "White" },
          },
        },
      },
    },
  ],
};
```

## Customer flow

1. **`/`** — Catalog, cart (variant keys + qty)
2. **`/checkout`** — Name, phone (`+1 849 620 2020`), email (all required), honeypot → `POST /api/checkout`
3. Order created with `estado: payment_confirmation_pending`; owner emailed immediately
4. Redirect to **`/order/payment/:displayId`** — bank details, upload PNG/JPEG proof, or WhatsApp to store
5. Owner verifies proof (upload in admin) or contacts buyer phone → sets `confirmed`

### Mobile-safe payment page

- URL-backed (`/order/payment/MITIENDA-a7164`), loads from `GET /api/orders/public/:displayId`
- `localStorage.activeOrderDisplayId` + resume banner on `/`
- Checkout email includes payment page deep link
- Gallery file input for bank screenshots; safe to leave browser for bank app

### Order IDs

- Internal: UUID
- Display: `{storeSlug}-{last5}` (e.g. `MITIENDA-a7164`)

### Phone validation

Normalize to digits; prepend country code for local length; 10–15 digits; no strict DR area codes.

## Admin (`/admin`)

- Login → `POST /api/admin/auth` → JWT (8h, `ADMIN_SECRET`) in sessionStorage
- Orders table: buyer, items, proof, status, dates; auto-poll 30s when tab visible
- Proof viewer or “contact buyer via WhatsApp”; confirm payment → `confirmed`
- `GET /api/admin/orders`, `POST /api/admin/status`, `GET /api/admin/proof/:orderId`

## API routes

| Route | Purpose |
|-------|---------|
| `POST /api/checkout` | Create order + emails; return displayId |
| `GET /api/orders/public/:displayId` | Payment page data (no auth) |
| `POST /api/orders/:displayId/proof` | Upload proof image |
| `POST /api/orders/:displayId/proof-method` | Record WhatsApp path |
| `POST /api/admin/auth` | Admin login |
| `GET /api/admin/orders` | List orders (auth) |
| `POST /api/admin/status` | Update status (auth) |
| `GET /api/admin/proof/:orderId` | Signed proof URL (auth) |

## Data model

```
orders: id, display_id, created_at, buyer_name, buyer_phone, buyer_email,
        estado, total, locale, payment_provider, payment_proof_method,
        payment_proof_url, payment_verified_at

order_items: id, order_id, product_id, product_name, variants (json keys),
             quantity, unit_price
```

See `db/schema.sql`.

## Payment providers (`/api/lib/payments/`)

- **v1**: `bank_transfer_proof` — instructions + proof upload/WhatsApp
- **Stubs**: `stripe`, `azul` — implement per clone when needed

## Security

- JWT admin auth (not password on every request)
- Rate limit: checkout 10/10min IP; auth failures 5/15min IP
- Honeypot on checkout; server-side price recompute from config
- Private Blob for proofs; validate file type/size
- Email failure after DB save → still 200 + log

## Env vars (`.env.example`)

```
DATABASE_URL=
ADMIN_PASSWORD=
ADMIN_SECRET=
RESEND_API_KEY=
BLOB_READ_WRITE_TOKEN=
UPSTASH_REDIS_REST_URL=   # optional; recommended production
UPSTASH_REDIS_REST_TOKEN=
RATE_LIMIT_TEST=           # optional; lower limits in CI
```

## Local dev

1. `vercel link` → `vercel env pull`
2. Neon **dev branch** (never prod); run `db/schema.sql` once
3. `npm start` — full stack at http://localhost:3000 (`vercel dev` + API)

`npm run dev` is Vite-only on `:5173` (proxies `/api` → `:3000` when `npm start` is running). Do not put `vercel dev` in the `dev` script — Vercel forbids recursive invocation.

## Testing & CI

- `npm run test:unit` — Vitest
- `npm run test:e2e` — Playwright (test Neon branch + Blob token)
- `npm run test:ci` — unit + build + E2E
- GitHub Actions `ci` workflow gates deploy

## Repo structure

```
/shared/store.config.ts
/src — React app, i18n, components
/api — Vercel functions + lib
/db/schema.sql
/e2e — Playwright specs
/public — logo, products
```

## Fork checklist

1. Edit `store.config.ts`, locale JSON, product images
2. Attach Vercel Postgres, Blob, env vars
3. Run `db/schema.sql` on Neon
4. Verify Resend domain; set `email.from`
5. Enable Upstash for production rate limits
6. Deploy; enable GitHub required check `ci`
