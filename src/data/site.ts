// Format nama SEO: "Nama objek + Kota + Panduan Wisata"
export const SITE_NAME = 'Menara Pandang Banjarmasin — Panduan Wisata';

// Judul subhalaman: "<judul spesifik> | <SITE_NAME>"
export const withSiteName = (title: string): string => `${title} | ${SITE_NAME}`;
