# Build verification status

## Status ringkas

Kode sumber, struktur deployment Workers Static Assets, aset lokal, dan pemeriksaan statis proyek telah diselesaikan. Namun, verifikasi instalasi dependensi dalam lingkungan bersih **belum dapat diselesaikan di sandbox ini** karena sandbox tidak dapat melakukan resolusi DNS ke registry npm.

Karena itu, proyek ini **tidak menyertakan `pnpm-lock.yaml` buatan/manual**. Membuat lockfile tanpa menjalankan pnpm akan berisiko menghasilkan integritas paket yang salah dan justru merusak `--frozen-lockfile`.

## Perintah verifikasi yang telah dicoba

```bash
rm -rf node_modules dist
CI=1 corepack pnpm install --frozen-lockfile
```

Corepack gagal sebelum pnpm dapat dijalankan karena tidak dapat mengambil pnpm 11.22.0 dari `registry.npmjs.org`; error yang diterima adalah `getaddrinfo EAI_AGAIN registry.npmjs.org`. Runtime sandbox yang tersedia juga Node.js 22.16.0, sementara proyek sengaja mem-pin Node.js 24.19.0 untuk lingkungan build/deploy yang sesuai.

Akibat kegagalan jaringan tersebut, `pnpm check` dan `pnpm build` tidak dapat dijalankan secara jujur pada sandbox ini. Tidak ada hasil build palsu yang diklaim.

## Pemeriksaan statis yang sudah lulus

- Tidak ada `pnpm-workspace.yaml`; proyek tetap single-package.
- Semua versi di `package.json` berupa versi exact; tidak ada `latest`, `*`, `^`, atau `~`.
- `packageManager` adalah `pnpm@11.22.0`; `.node-version` dan `engines.node` adalah `24.19.0`.
- `wrangler.jsonc` berada hanya di root dan memuat `name`, `compatibility_date`, serta `assets.directory: "./dist"`; tidak ada salinan di `dist/client`.
- `wrangler.jsonc` valid sebagai JSON murni: tanpa komentar dan tanpa trailing comma.
- Deployment script adalah `wrangler deploy` tanpa ketergantungan pada flag `--assets`.
- Tidak ada referensi gambar lokal yang hilang.
- Dokumen HTML/Astro yang dirender memakai Bahasa Indonesia (`lang="id"`); tidak ada sisa Baguio, `zh-CN`, atau parameter wilayah Jepang pada embed Google Maps.
- Tidak ada `example.com`, `localhost`, atau `chrome-extension://` pada konten situs. String tersebut hanya muncul di skrip audit sebagai pola yang memang harus ditolak.
- Tidak ada sitemap manual atau `lastmod` buatan. Integrasi sitemap hanya aktif jika `site` diisi pada satu lokasi, yaitu `astro.config.mjs`.

## Gerbang final di lingkungan dengan akses npm

Setelah jaringan npm tersedia, buat lockfile asli sekali, lalu jalankan gerbang bersih berikut:

```bash
corepack enable
corepack pnpm install
rm -rf node_modules dist
CI=1 corepack pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm audit
```

Setelah `pnpm-lock.yaml` hasil pnpm tersebut dibuat dan seluruh perintah lulus, commit lockfile bersama `package.json`.
