// Photographie une page locale, section par section, sans passer par le MCP.
// Usage : node refonte-adexweb/voir.mjs <fichier.html> <sortie-prefixe> [largeur]
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve, dirname, basename } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';

const [fichier, prefixe, largeurArg] = process.argv.slice(2);
if (!fichier || !prefixe) {
  console.error('ARRET : usage node voir.mjs <fichier.html> <sortie-prefixe> [largeur]');
  process.exit(1);
}
const abs = resolve(fichier);
if (!existsSync(abs)) { console.error(`ARRET : ${abs} introuvable.`); process.exit(1); }
const largeur = Number(largeurArg ?? 1440);

mkdirSync(dirname(resolve(prefixe)), { recursive: true });

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: largeur, height: 960 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(abs).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);

const sections = await page.locator('section, [data-photo]').all();
if (sections.length === 0) {
  await page.screenshot({ path: `${prefixe}.png`, fullPage: true });
  console.log(`${prefixe}.png (page entiere)`);
} else {
  let i = 0;
  for (const s of sections) {
    const id = (await s.getAttribute('id')) || `s${i}`;
    await s.screenshot({ path: `${prefixe}-${id}.png` });
    console.log(`${prefixe}-${id}.png`);
    i++;
  }
}
await nav.close();
