import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('../dist/', import.meta.url);
const banned = ['example.com', 'localhost', 'chrome-extension://'];
let failures = [];
async function walk(dir){
  const out=[];
  for(const name of await readdir(dir)){
    const p=join(dir,name); const s=await stat(p);
    if(s.isDirectory()) out.push(...await walk(p)); else out.push(p);
  }
  return out;
}
try {
  const files=await walk(root.pathname);
  for(const file of files){
    if(!/\.(html|xml|js|json|css|txt)$/i.test(file)) continue;
    const text=await readFile(file,'utf8');
    for(const token of banned) if(text.includes(token)) failures.push(`${relative(root.pathname,file)} mengandung ${token}`);
    if(/sitemap.*\.xml$/i.test(file) && /<lastmod>/i.test(text)) failures.push(`${relative(root.pathname,file)} mengandung lastmod yang tidak diperlukan`);
  }
  if(failures.length){ console.error(failures.join('\n')); process.exit(1); }
  console.log('Audit dist lulus: tidak ada placeholder/URL ilegal; sitemap (jika ada) tidak memuat lastmod buatan.');
} catch (error) { console.error('Audit gagal:', error.message); process.exit(1); }
