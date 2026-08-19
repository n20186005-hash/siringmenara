# Panduan Menara Pandang Banjarmasin

Situs informasi wisata independen nirlaba untuk Menara Pandang Banjarmasin. Dibangun sebagai situs statis Astro dan dideploy sebagai **Cloudflare Worker Static Assets**.

> **Catatan verifikasi:** sandbox pembuatan proyek tidak dapat mengakses registry npm, sehingga `pnpm-lock.yaml` asli belum dapat dibuat dan gerbang `pnpm check` / `pnpm build` belum dapat dijalankan. Jangan membuat lockfile manual. Lihat [`BUILD-STATUS.md`](./BUILD-STATUS.md) untuk status dan perintah final di lingkungan yang memiliki akses npm.

## Tumpukan teknologi

- Astro 7.2.3
- Tailwind CSS 4.3.3 melalui `@tailwindcss/vite` 4.3.3
- TypeScript 6.0.3 (`@astrojs/check` 0.9.10 mendukung TypeScript `^5 || ^6`)
- Wrangler 4.123.0
- pnpm 11.22.0
- Node.js 24.19.0 LTS

Semua versi di `package.json` bersifat eksak.

## Domain hanya di satu tempat

Buka `astro.config.mjs` dan isi nilai `SITE`. Saat kosong, build tetap berjalan, tag URL absolut seperti canonical/`og:url` tidak dibuat, URL JSON-LD yang membutuhkan origin dihilangkan, dan integrasi sitemap tidak diaktifkan. Tidak ada domain contoh yang ditulis ke hasil build.

## Menjalankan dan memeriksa

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm audit
```

Pengujian bersih yang diminta:

```bash
rm -rf node_modules
CI=1 corepack pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm audit
```

## Cloudflare Workers Static Assets

`wrangler.jsonc` berada **hanya di root proyek** dan berisi `name`, `compatibility_date`, dan `assets.directory: "./dist"`. Skrip deploy hanya menjalankan `wrangler deploy`; tidak ada parameter `--assets` tersembunyi yang membuat konfigurasi lokal dan CI berbeda.

```bash
pnpm build
pnpm deploy
```

### Mengapa konfigurasi ini menghindari kegagalan Wrangler/Pages yang umum

1. **Tidak ada konfigurasi inti yang hilang** — Worker punya nama, compatibility date, dan sumber deployment static assets.
2. **Bukan Pages CI** — proyek tidak bergantung pada pointer `dist/client/wrangler.json`. Jangan menyalin `wrangler.jsonc` ke `dist/client/` dan jangan menambahkan langkah yang menghapus/menulis pointer Pages.
3. **Tidak ada path ganda** — `./dist` dihitung relatif dari `wrangler.jsonc` di root. Karena config tidak disalin ke output, ia tidak bisa berubah menjadi `dist/client/dist/...`.
4. **CLI dan CI setara** — baik lokal maupun CI dapat menjalankan `wrangler deploy` tanpa argumen tambahan; semua pengaturan assets berada di file config.
5. **JSONC aman** — file root sengaja ditulis sebagai JSON valid tanpa komentar atau trailing comma walau memakai ekstensi `.jsonc`. Tidak ada config hasil salinan di `dist` yang perlu dinormalisasi.

Jika proyek Cloudflare lama masih dikonfigurasi sebagai **Pages**, migrasikan target deployment ke Workers atau buat Worker baru yang terhubung ke repositori ini. Jangan mencoba mempertahankan mekanisme adapter/SSR Pages pada proyek static-assets ini.

## Cookie & GA4

GA4 `G-HXM22WWPKP` tidak dimuat sampai pengguna mengaktifkan Cookie analitik pada `/pengaturan-cookie/`. Pilihan disimpan di `localStorage`. Situs tidak menggunakan iklan atau Cookie pemasaran.

## Foto

Foto pada `public/images/` adalah salinan lokal yang dioptimalkan dari Wikimedia Commons. Kredit dan lisensi disebut di halaman. Jangan menghapus atribusi jika gambar tetap digunakan.
