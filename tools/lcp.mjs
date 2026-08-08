// Mesure le LCP et le FCP de CHAQUE page, N passes, et rend la MEDIANE.
//
//   node tools/lcp.mjs [passes=7] [--port 8099]
//
// La mediane, pas la moyenne : une passe ou le systeme d'exploitation part
// indexer un disque tire la moyenne et ne dit rien de ce que voit un visiteur.
// On rend aussi le minimum : c'est le plancher de la machine, et il dit si le
// seuil qu'on s'impose est atteignable ou si c'est un test vert sur du vide.
import { chromium } from 'playwright';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const iPort = process.argv.indexOf('--port');
const PORT = Number(iPort > -1 ? process.argv[iPort + 1] : (process.env.ADEXWEB_PORT ?? 8099));
const N = Number(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 7);

const PAGES = readdirSync(RACINE).filter((f) => f.endsWith('.html')).sort();
if (PAGES.length === 0) { console.error('ARRET : aucune page.'); process.exit(1); }

const mediane = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

const nav = await chromium.launch();
console.log(`${N} passes par page, machine au repos exigee.\n`);
console.log('page                     LCP med   LCP min   FCP med   element                        poids');
console.log('-'.repeat(96));

let pire = 0;
let pirePage = '';

for (const page of PAGES) {
  const lcps = [], fcps = [];
  let el = '?';
  let poids = 0;

  for (let i = 0; i < N; i++) {
    const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    let octets = 0;
    p.on('response', async (r) => {
      try { const b = await r.body(); octets += b.length; } catch (e) {}
    });
    await p.addInitScript(() => {
      try { sessionStorage.setItem('adexweb-sans-popup', '1'); } catch (e) {}
      window.__m = { lcp: 0, el: '?' };
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) {
          window.__m.lcp = e.startTime;
          window.__m.el = e.element ? (e.element.tagName + (e.element.className ? '.' + String(e.element.className).split(' ')[0] : '')) : '?';
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    const rep = await p.goto(`http://127.0.0.1:${PORT}/${page}`, { waitUntil: 'load' });
    if (!rep || rep.status() !== 200) {
      console.error(`ARRET : ${page} rend ${rep ? rep.status() : 'rien'}.`);
      process.exit(1);
    }
    await p.waitForTimeout(700);
    const m = await p.evaluate(() => {
      const f = performance.getEntriesByName('first-contentful-paint')[0];
      return { lcp: window.__m.lcp, el: window.__m.el, fcp: f ? f.startTime : 0 };
    });
    if (m.lcp > 0) { lcps.push(m.lcp); el = m.el; }
    if (m.fcp > 0) fcps.push(m.fcp);
    if (i === N - 1) poids = octets;
    await ctx.close();
  }

  if (lcps.length === 0) {
    console.error(`\nARRET : aucun LCP releve sur ${page}. Une mesure absente n'est pas une mesure bonne.`);
    process.exit(1);
  }
  const med = Math.round(mediane(lcps));
  if (med > pire) { pire = med; pirePage = page; }
  console.log(
    `${page.padEnd(24)} ${String(med).padStart(6)} ms ${String(Math.round(Math.min(...lcps))).padStart(7)} ms `
    + `${String(Math.round(mediane(fcps) || 0)).padStart(7)} ms   ${el.slice(0, 28).padEnd(30)} ${(poids / 1024).toFixed(0)} Ko`);
}

await nav.close();
console.log('-'.repeat(96));
console.log(`\nLa pire page : ${pirePage} a ${pire} ms.  Seuil que le projet s'impose : 400 ms.`);
if (pire > 400) process.exit(1);
