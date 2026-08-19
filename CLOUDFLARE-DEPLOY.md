# Cloudflare Workers Static Assets — catatan deployment

Proyek ini memakai **Workers Static Assets**, bukan Astro SSR adapter dan bukan mekanisme Pages yang menulis konfigurasi hasil build ke `dist/client/`.

## Struktur yang benar

```text
/
├─ astro.config.mjs
├─ package.json
├─ wrangler.jsonc       # satu-satunya Wrangler config
├─ src/
├─ public/
└─ dist/                # dibuat oleh `astro build`
```

`wrangler.jsonc` di root:

```json
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "menara-pandang-banjarmasin-guide",
  "compatibility_date": "2026-08-19",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  }
}
```

## Lima sumber kegagalan yang sudah dihindari

1. **Konfigurasi inti lengkap.** Ada `name`, `compatibility_date`, dan deployment source melalui `assets.directory`. Static-only Worker tidak memerlukan `main`. `not_found_handling: "404-page"` membuat halaman `dist/404.html` dipakai untuk rute yang tidak ditemukan.
2. **Tidak memakai pointer Pages CI.** Build tidak menyalin atau membuat `dist/client/wrangler.json`, sehingga tidak ada file target redirect Pages yang dapat terhapus oleh skrip pasca-build.
3. **Tidak ada path relatif yang terlipat.** `assets.directory` dihitung relatif terhadap file konfigurasi. Karena config tetap di root, `./dist` selalu menunjuk ke `<project>/dist`, bukan `dist/client/dist/client`.
4. **CLI dan CI sama.** `package.json` menjalankan `wrangler deploy` tanpa `--assets`; seluruh sumber deployment sudah ada di `wrangler.jsonc`, sehingga CI yang menjalankan `npx wrangler deploy`/`pnpm exec wrangler deploy` membaca konfigurasi yang sama.
5. **JSONC aman.** Walau berekstensi `.jsonc`, file ditulis sebagai JSON murni tanpa komentar/trailing comma. Tidak ada konfigurasi hasil salinan di `dist` yang perlu dibersihkan.

## Build dan deploy

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm audit
pnpm deploy
```

Untuk dashboard Cloudflare, pilih **Workers**, bukan Pages, dan gunakan build command `pnpm build`. Deployment command dapat menggunakan `pnpm deploy` atau `pnpm exec wrangler deploy`.

## Jika repositori lama masih terhubung ke Pages

Jangan mencoba mempertahankan konfigurasi Pages lama yang menunjuk ke `dist/client/wrangler.json`. Buat/migrasikan deployment ke Workers Static Assets. Menyalin root `wrangler.jsonc` ke `dist/client/` justru akan mengubah basis path relatif dan berpotensi memunculkan path ganda.
