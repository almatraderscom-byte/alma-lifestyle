// Generates a self-contained ApeChain-style landing page for Alma Lifestyle,
// embedding product images as base64 data URIs so it renders anywhere.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const b64 = (p) => 'data:image/jpeg;base64,' + readFileSync(resolve(root, p)).toString('base64');

const IMG = {
  jGreen: b64('public/products/islamic/jaynamaz-green.jpg'),
  jBlack: b64('public/products/islamic/jaynamaz-black.jpg'),
  jCream: b64('public/products/islamic/jaynamaz-cream.jpg'),
  jWhite: b64('public/products/islamic/jaynamaz-white.jpg'),
  jAsh:   b64('public/products/islamic/jaynamaz-ash.jpg'),
  jJ2:    b64('public/products/islamic/jaynamaz-j2.jpg'),
  jJ5:    b64('public/products/islamic/jaynamaz-j5.jpg'),
  books:  b64('public/products/islamic/islamic-7-books.jpg'),
  mosBlk: b64('public/products/murda-moshari/hero-black.jpg'),
  mosUse: b64('public/products/murda-moshari/in-use.jpg'),
  mosRev: b64('public/products/murda-moshari/review-1.jpg'),
  // Real Panjabi + accessory photographs pulled from the live almatraders.com
  // Supabase catalog (optimised copies under scripts/live-images/opt).
  pnjWhite:    b64('scripts/live-images/opt/pnjWhite.jpg'),
  pnjBlack:    b64('scripts/live-images/opt/pnjBlack.jpg'),
  pnjNavy:     b64('scripts/live-images/opt/pnjNavy.jpg'),
  pnjMaroon:   b64('scripts/live-images/opt/pnjMaroon.jpg'),
  pnjSeaGreen: b64('scripts/live-images/opt/pnjSeaGreen.jpg'),
  pnjCream:    b64('scripts/live-images/opt/pnjCream.jpg'),
  pnjOrange:   b64('scripts/live-images/opt/pnjOrange.jpg'),
  pnjAsh:      b64('scripts/live-images/opt/pnjAsh.jpg'),
  pnjFiroza:   b64('scripts/live-images/opt/pnjFiroza.jpg'),
  accWatch:    b64('scripts/live-images/opt/accWatch.jpg'),
  accBag:      b64('scripts/live-images/opt/accBag.jpg'),
  accKitchen:  b64('scripts/live-images/opt/accKitchen.jpg'),
  accFan:      b64('scripts/live-images/opt/accFan.jpg'),
};

const raw = (p) => readFileSync(resolve(__dirname, p), 'utf8');
const LIB = {
  GSAP: raw('vendor/gsap.min.js'),
  SCROLLTRIGGER: raw('vendor/ScrollTrigger.min.js'),
  LENIS: raw('vendor/lenis.min.js'),
  THREE: raw('vendor/three.min.js'),
};

const tpl = readFileSync(resolve(__dirname, 'apechain-demo.template.html'), 'utf8');
const out = tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => LIB[k] ?? IMG[k] ?? '');
const dest = resolve(root, 'public/apechain-clone/index.html');
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, out);
console.log('Wrote', dest, '(' + (out.length / 1024 / 1024).toFixed(2) + ' MB)');
