// Dessine les deux couvertures de guide a la nouvelle identite.
//
//   node tools/couvertures-guides.mjs
//
// Pourquoi ne pas photographier la premiere page du PDF, comme le faisait
// `tools/couvertures.mjs` : les deux sources de `documents/src/` sont encore
// composees a l'ancienne — ciment, minium, Martian Mono. Leur photographier
// la couverture ramenait l'identite supprimee dans une modale du site. On
// dessine donc la vignette, et on remet la photographie du PDF le jour ou les
// deux documents seront recomposes.  D-856
import { chromium } from 'playwright';
import { writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');

const GUIDES = [
  { fichier: 'doc-automatisation.webp', sur: 'Guide · 01',
    titre: 'Ce que votre entreprise pourrait automatiser', pages: '42 pages' },
  { fichier: 'doc-ia.webp', sur: 'Guide · 02',
    titre: 'Comment utiliser l’IA pour faire grossir votre entreprise', pages: '49 pages' },
];

const L = 640, H = 828;   // 1 : 1,294, le rapport des deux vignettes servies

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: L, height: H }, deviceScaleFactor: 1 });

let ecrits = 0;
for (const g of GUIDES) {
  const html = `<!doctype html><meta charset="utf-8">
<style>
  @font-face { font-family:"Newsreader"; src:url("http://127.0.0.1:8099/fonts/newsreader-latin.woff2") format("woff2"); font-weight:380 560; font-display:block }
  @font-face { font-family:"Instrument Sans"; src:url("http://127.0.0.1:8099/fonts/instrument-sans-latin.woff2") format("woff2"); font-weight:400 700; font-display:block }
  *{margin:0;box-sizing:border-box}
  body{width:${L}px;height:${H}px;background:#18213D;color:#FDFFFF;
       font-family:"Instrument Sans",sans-serif;
       display:flex;flex-direction:column;justify-content:space-between;
       padding:56px 48px}
  .haut{display:flex;align-items:center;justify-content:space-between}
  .marque{font-size:17px;font-weight:700;letter-spacing:.19em;color:#FDFFFF}
  .sur{font-size:14px;font-weight:600;letter-spacing:.19em;text-transform:uppercase;color:#D2B68A}
  h1{font-family:"Newsreader",serif;font-weight:440;font-size:52px;line-height:1.08;
     letter-spacing:-.02em;max-width:14ch}
  .filet{width:96px;height:2px;background:#D2B68A;margin:36px 0 28px}
  .bas{display:flex;align-items:baseline;justify-content:space-between;
       border-top:1px solid rgb(253 255 255 / .18);padding-top:22px}
  .pages{font-family:"Newsreader",serif;font-size:30px;letter-spacing:-.01em;color:#E7D7BC}
  .lieu{font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:#E7D7BC}
</style>
<div class="haut"><span class="marque">ADEXWEB</span><span class="sur">${g.sur}</span></div>
<div><div class="filet"></div><h1>${g.titre}</h1></div>
<div class="bas"><span class="pages">${g.pages}</span><span class="lieu">Québec · 2026</span></div>`;

  await page.goto('http://127.0.0.1:8099/index.html');   // pour l'origine des polices
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);

  // Le titre tient-il dans le cadre ? Une couverture dont le texte deborde
  // se photographie sans erreur et se voit une semaine plus tard.
  const deborde = await page.evaluate(() => {
    const h = document.querySelector('h1').getBoundingClientRect();
    return h.bottom > window.innerHeight - 90 || h.right > window.innerWidth;
  });
  if (deborde) { console.error(`ARRET : le titre de ${g.fichier} deborde du cadre.`); process.exit(1); }

  const png = await page.screenshot({ type: 'webp', quality: 88 });
  if (png.length < 3000) { console.error(`ARRET : ${g.fichier} ne fait que ${png.length} octets.`); process.exit(1); }
  writeFileSync(join(RACINE, 'images', g.fichier), png);
  console.log(`images/${g.fichier}   ${(png.length / 1024).toFixed(1)} Ko   ${L} x ${H}`);
  ecrits++;
}

await nav.close();
if (ecrits !== GUIDES.length) { console.error('ARRET : toutes les couvertures n\'ont pas ete ecrites.'); process.exit(1); }
