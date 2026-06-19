# Static assets

Replace placeholder files before launching a real store.

## File map

| Path | Purpose | Replace with |
|------|---------|--------------|
| [`public/logo.svg`](../public/logo.svg) | Header brand mark | Your logo (SVG or PNG; update `logoUrl` in config if extension changes) |
| [`public/favicon.svg`](../public/favicon.svg) | Browser tab icon | Your favicon (SVG or add `.ico` and update `index.html`) |
| [`public/products/prod-1.svg`](../public/products/prod-1.svg) | Product 1 image | Product photo (JPG/WebP recommended, ~800×600) |
| [`public/products/prod-2.svg`](../public/products/prod-2.svg) | Product 2 image | Product photo |

## Config references

In [`shared/store.config.ts`](../shared/store.config.ts):

```ts
logoUrl: "/logo.svg",
products: [
  {
    id: "prod-1",
    imageUrl: "/products/prod-1.svg",
    // ...
  },
],
```

After replacing files, update `imageUrl` / `logoUrl` if filenames or extensions change.

## Image guidelines

- **Products**: 4:3 or square, at least 600px wide; optimize for web (JPEG/WebP, &lt; 200 KB each)
- **Logo**: SVG preferred for crisp scaling; PNG with transparent background also works
- **Favicon**: 32×32 minimum; SVG works in modern browsers

## Adding more products

1. Add image to `public/products/`
2. Add product entry in `shared/store.config.ts` with unique `id` and localized `name` / `description`
3. Define `variantOptions` with **canonical keys** (e.g. `size`, `color`, `s`, `black`) — not translated prose

## i18n copy

UI strings live in:

- [`src/i18n/locales/es.json`](../src/i18n/locales/es.json)
- [`src/i18n/locales/en.json`](../src/i18n/locales/en.json)

Store-specific marketing copy is in `store.config.ts` (`storeName`, `description`, product names, bank labels).

## Primary color

Set `primaryColor` in config — it is applied as CSS variable `--color-primary` on the app root for buttons and links.
