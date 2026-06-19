# Vercel Blob (payment proof uploads)

Customers upload bank transfer screenshots on `/order/payment/:displayId`. Files are stored in Vercel Blob via [`api/lib/blob.ts`](../api/lib/blob.ts).

## Setup

### 1. Enable Blob on your Vercel project

In the Vercel dashboard → **Storage** → **Create Database / Store** → **Blob**.

Connect it to your project. Vercel auto-provisions `BLOB_READ_WRITE_TOKEN`.

### 2. Pull env locally

```bash
vercel env pull
```

Confirm `.env` contains:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

### 3. Path layout

Uploads are stored as:

```
proofs/{displayId}-{timestamp}.png|jpg
```

Example: `proofs/MITIENDA-a7164-1718380800000.jpg`

## Access model

- Blob URLs are stored in Postgres (`orders.payment_proof_url`)
- **Public** blob URLs are not exposed to customers on the payment page
- Admins fetch proof images via `GET /api/admin/proof/:orderId` (JWT required)

## Limits (app-side)

- Allowed types: **PNG** and **JPEG** only
- Validated in [`api/orders/[displayId]/proof.ts`](../api/orders/[displayId]/proof.ts)
- Max size enforced server-side (see route handler)

## Local development

Proof upload requires `BLOB_READ_WRITE_TOKEN`. Without it, checkout and payment page load work, but upload returns an error.

Use `npm start` (not `npm run dev`) so `/api/*` routes and env vars are available.

## Production checklist

- [ ] Blob store connected to Vercel project
- [ ] `BLOB_READ_WRITE_TOKEN` in Production env
- [ ] Test upload on preview deployment before go-live

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Upload fails immediately | Missing `BLOB_READ_WRITE_TOKEN` |
| Admin cannot view proof | Expired admin JWT; re-login at `/admin` |
| 413 / size error | Image too large; compress screenshot |
