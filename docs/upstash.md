# Upstash Redis (rate limiting)

Rate limits protect checkout, admin login failures, and proof uploads. Implementation: [`api/lib/rateLimit.ts`](../api/lib/rateLimit.ts).

## Behavior

| Endpoint | Limit (production) | Window |
|----------|-------------------|--------|
| Checkout | 10 requests | 10 minutes / IP |
| Admin auth failure | 5 failures | 15 minutes / IP |
| Proof upload | 10 requests | 10 minutes / IP |

When `RATE_LIMIT_TEST=1` (CI/E2E), limits are lower and windows are 60 seconds.

## Without Upstash (local dev)

If `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are unset, the app uses an **in-memory** store per serverless instance.

That is fine for local `vercel dev` but **not** reliable in production — each Vercel function instance has its own memory, so limits are inconsistent under load.

## Production setup (recommended)

### 1. Create Upstash database

- Vercel Marketplace → **Upstash Redis**, or [console.upstash.com](https://console.upstash.com)
- Create a Redis database in a region close to your Vercel deployment

### 2. Add env vars to Vercel

```
UPSTASH_REDIS_REST_URL=https://....upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

Vercel Upstash integration can inject these automatically.

### 3. Verify

Place 11 checkout requests from the same IP within 10 minutes — the 11th should return `429` with `error: "rate_limit"`.

## Local development

Upstash is **optional** locally. In-memory fallback works for manual testing.

To test Redis behavior locally, copy Upstash credentials into `.env` after `vercel env pull`.

## CI / E2E

Set in your CI secrets or `.env.test`:

```
RATE_LIMIT_TEST=1
```

This avoids long waits when E2E tests hit rate-limited endpoints.

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Rate limit never triggers in prod | Upstash not configured; using per-instance memory |
| Redis errors in logs | Invalid token/URL; falls back to memory |
| E2E flaky on checkout | Missing `RATE_LIMIT_TEST=1`; prior runs exhausted limit |
