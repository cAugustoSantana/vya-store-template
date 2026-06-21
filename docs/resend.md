# Resend transactional email

## Setup

1. Create a [Resend](https://resend.com) account and verify your sending domain.
2. Add `RESEND_API_KEY` to your Vercel project and local `.env`.
3. In **Admin → Settings**, set:
   - **Email from** — e.g. `Pedidos Mi Tienda <pedidos@tudominio.com>`
   - **Owner email** — receives new-order and proof-uploaded notifications.

Optional: set `SITE_URL` (e.g. `https://mitienda.com`) so email logos, payment links, and admin links use a stable origin instead of the deployment URL.

## Events

| Trigger | Customer | Owner |
|---------|----------|-------|
| Checkout | Order received + payment link | New order |
| Admin → `confirmed` | Payment confirmed | Payment confirmed |
| Admin → `out_for_delivery` | On the way + shipping | — |
| Proof uploaded | — | Proof uploaded |

If `RESEND_API_KEY` is missing, emails are skipped gracefully (logged as `email_skipped_no_resend_key`).

## Design

Templates in `api/lib/emailTemplates.ts` mirror the storefront UI:

- Gray page background (`#f9fafb`)
- White rounded card with subtle border/shadow
- Header with store logo (`/api/settings/logo` absolute URL)
- Brand-colored badge and callouts; green callout for confirmations
- Order summary table and shipping block
- CTA buttons using the store `primaryColor` from settings

All user-provided text is passed through `escapeHtml()`.

Owner emails link to `/admin/orders/{displayId}`.
