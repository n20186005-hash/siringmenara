#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

rm -rf node_modules dist
CI=1 corepack pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm audit

if [[ -f pnpm-workspace.yaml ]]; then
  node - <<'NODE'
const fs = require('fs');
const text = fs.readFileSync('pnpm-workspace.yaml', 'utf8');
if (!/^packages:\s*\n(?:\s*-\s*['\"]?\.['\"]?\s*\n?)+/m.test(text)) {
  console.error('pnpm-workspace.yaml ada, tetapi packages tidak berisi project root (.).');
  process.exit(1);
}
NODE
fi

if grep -RInE 'example\.com|localhost|chrome-extension://' dist; then
  echo 'Ditemukan placeholder/URL ilegal pada hasil build.' >&2
  exit 1
fi

if find dist -iname 'sitemap*.xml' -print -quit | grep -q .; then
  if grep -RIn '<lastmod>' dist/sitemap*.xml; then
    echo 'Sitemap memuat lastmod yang tidak boleh dibuat-buat.' >&2
    exit 1
  fi
fi

echo 'Verifikasi bersih selesai.'
