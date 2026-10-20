# Menara Pandang Banjarmasin visitor guide

Independent Indonesian visitor information, built with Astro and Cloudflare Worker Static Assets. Eight indexed pages cover the place, admission questions, activities, practical needs, three policy pages and photographic credits; the separate 404 is noindex.

```sh
corepack pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm run audit
```

`astro.config.mjs` sets the HTTPS canonical domain. `src/worker.ts` runs before ASSETS, redirects HTTP/www to HTTPS apex with path/query preserved, and retains real 404 responses with a noindex header. `wrangler.jsonc` targets the verified `siringmenara` Worker and `dist` output. Deployment is a separate coordinator step; local checks do not prove a live release.

Analytics loads only after an explicit saved choice on `/pengaturan-cookie/`. Storage access is guarded. Withdrawal reloads the page if analytics is already active; browser settings can remove existing third-party cookies. There are no accounts, bookings, contact forms or email submission channels. Google Maps is the disclosed external embed; photos are local.

See [public sources](PUBLIC_SOURCES.md) and [photo credits](ASSET_SOURCES.md). Current tower access, lift, fees, market, boats and events require separate confirmation; public pedestrian access does not establish tower entry.

Build output is ignored by default. If committing a deployment snapshot, explicitly include all generated files, including new hashed CSS, 404, robots and sitemaps, and verify references in the committed tree.
