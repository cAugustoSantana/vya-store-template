# GitHub Actions CI

Workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

Runs on every **push to `main`** and every **pull request**.

## Pipeline

1. `npm ci`
2. `npm run test:unit` — Vitest (47 tests)
3. `npm run build` — Typecheck + Vite production build
4. `npx playwright install --with-deps chromium`
5. `npm run test:e2e` — Playwright (Vite-only or full stack)

Failed E2E runs upload `playwright-report/` and `test-results/` as artifacts (7-day retention).

## Without secrets (forks / new repos)

CI stays **green** with:

- Unit tests + build
- E2E storefront, i18n, and checkout validation (6 tests)

DB-dependent E2E specs are **skipped** when `DATABASE_URL` is unset.

## Full E2E in CI (recommended for production)

Add these **GitHub repository secrets**:

| Secret | Purpose |
|--------|---------|
| `DATABASE_URL` | Neon **CI/test** branch (never production) |
| `ADMIN_PASSWORD` | E2E admin login |
| `ADMIN_SECRET` | JWT signing (32+ chars) |
| `BLOB_READ_WRITE_TOKEN` | Proof upload E2E |
| `RESEND_API_KEY` | Dummy value is fine (`re_test_dummy`) |
| `VERCEL_TOKEN` | Vercel API token for `vercel dev` in CI |
| `VERCEL_ORG_ID` | Team/user ID |
| `VERCEL_PROJECT_ID` | Linked Vercel project |

When `DATABASE_URL` is set, Playwright auto-enables `E2E_STACK=1` and starts `vercel dev` for API routes.

### One-time setup

1. Create a Neon **ci** branch; run [`db/schema.sql`](../db/schema.sql)
2. Create a Vercel project linked to this repo
3. Add secrets in GitHub → Settings → Secrets and variables → Actions
4. Enable branch protection on `main`: require status check **`ci`**

## Local mirror

```bash
npm run test:ci
```

Matches CI order: unit → build → e2e.

## Vercel deploy gate

- Vercel **build** stays `npm run build` only (no tests in Vercel build)
- Require GitHub **`ci`** check before merging to `main`
- Preview deployments inherit the same gate via branch protection on PRs
