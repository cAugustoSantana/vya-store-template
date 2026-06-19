# Resend (transactional email)

Checkout sends two emails after an order is saved:

1. **Customer** — order confirmation with payment page link
2. **Owner** — new order notification with buyer contact info

If `RESEND_API_KEY` is missing, orders still succeed; email is skipped and a warning is logged.

## Setup

### 1. Create a Resend account

Sign up at [resend.com](https://resend.com) and create an API key with **Sending access**.

Add it to Vercel (and `.env` locally):

```
RESEND_API_KEY=re_...
```

### 2. Verify your sending domain

In Resend → **Domains**, add your domain (e.g. `mitienda.com`) and add the DNS records Resend provides (SPF, DKIM, etc.).

Until the domain is verified, you can only send to your own Resend account email (sandbox mode).

### 3. Set `email.from` in config

Edit [`shared/store.config.ts`](../shared/store.config.ts):

```ts
email: { from: "Pedidos Mi Tienda <pedidos@mitienda.com>" },
```

The address must use a **verified domain** in Resend.

### 4. Set owner notification recipient

```ts
contact: {
  ownerEmail: "owner@mitienda.com",
  // ...
},
```

Owner emails go to `contact.ownerEmail`. Customer emails go to the buyer address from checkout.

## Local development

- Pull env with `vercel env pull`
- Without a verified domain, test by placing orders with **your Resend account email** as the buyer
- Owner emails also require a verified `from` domain or will fail silently (logged)

## Production checklist

- [ ] Domain verified in Resend
- [ ] `email.from` uses verified domain
- [ ] `contact.ownerEmail` is correct
- [ ] `RESEND_API_KEY` set in Vercel **Production** (and Preview if testing there)

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Order created, no email | Missing `RESEND_API_KEY` or unverified `from` domain |
| Customer email only | Owner address wrong or blocked |
| 200 on checkout, no email in Resend dashboard | Check server logs for `email_skipped_no_resend_key` |

Email failure after the order is saved does **not** fail checkout — the API returns 200 so customers are not blocked.
