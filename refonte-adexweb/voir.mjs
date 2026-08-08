// Photographie une page locale, section par section.
//
//   node refonte-adexweb/voir.mjs <fichier.html> <sortie-prefixe> [largeur] [--repos]
//
// La page est TRAVERSEE AU PAS avant la premiere image : sans ca, les
// observateurs d'entree n'ont pas encore declenche et l'outil photographie
// des blocs a opacite 0 — il rend une planche vide et ca se lit comme un
// defaut de mise en page. Piege 25 : l'arbitre est l'image, mais encore
// faut-il que l'image montre l'etat de repos.
//
// `--repos` force `prefers-reduced-motion` : utile pour juger la COMPOSITION,
// jamais pour juger un MOUVEMENT.
import { chromium } from 'playwright';

import { resolve, dirname } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';

const args = process.argv.slice(2);
const repos = args.includes('--repos');
const [fichier, prefixe, largeurArg] = args.filter((a) => !a.startsWith('--'));

if (!fichier || !prefixe) {
  console.error('ARRET : usage node voir.mjs <fichier.html> <sortie-prefixe> [largeur] [--repos]');
  process.exit(1);
}
const abs = resolve(fichier);
if (!existsSync(abs)) { console.error(`ARRET : ${abs} introuvable.`); process.exit(1); }
const largeur = Number(largeurArg ?? 1440);

// La page se sert en HTTP, jamais en `file://` : un `preload` de police avec
// `crossorigin` y est refuse par la politique d'origine, et l'outil rendrait
// deux erreurs de console qui n'existent pas en production.  D-838
const PORT = Number(process.env.ADEXWEB_PORT ?? 8099);
const adresse = `http://127.0.0.1:${PORT}/${fichier.replace(/\\/g, '/')}`;
mkdirSync(dirname(resolve(prefixe)), { recursive: true });

const nav = await chromium.launch();
const page = await nav.newPage({
  viewport: { width: largeur, height: 960 },
  deviceScaleFactor: 2,
  reducedMotion: repos ? 'reduce' : 'no-preference',
});

const erreurs = [];
page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
page.on('pageerror', (e) => erreurs.push(String(e)));

const reponse = await page.goto(adresse, { waitUntil: 'load' });
if (!reponse || reponse.status() !== 200) {
  console.error(`ARRET : ${adresse} rend ${reponse ? reponse.status() : 'rien'}.`);
  console.error('Le serveur tourne-t-il ?  node tools/serve.mjs 8099');
  process.exit(1);
}
await page.evaluate(() => document.fonts.ready);

// Traversee au pas : un demi-ecran a la fois, pour ne sauter aucun seuil.
// On NE REMONTE PAS en haut apres : Chromium GELE la transition d'un element
// hors ecran, et une sonde d'opacite lue depuis le haut de la page rendait
// « 4 blocs jamais visibles » alors qu'ils etaient a 0,98 et simplement
// suspendus. Le contrat qui se lit de loin, c'est `data-vu` ; l'opacite ne
// se juge que quand l'element est A L'ECRAN.  D-839
await page.evaluate(async () => {
  const pas = Math.round(window.innerHeight * 0.5);
  for (let y = 0; y < document.body.scrollHeight; y += pas) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 90));
  }
});
await page.waitForTimeout(700);

const fantomes = await page.evaluate(() =>
  Array.from(document.querySelectorAll('.entre'))
    .filter((el) => !el.hasAttribute('data-vu'))
    .map((el) => el.className + ' · ' + (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)));

const hauteur = await page.evaluate(() => document.body.scrollHeight);
const debord = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

const sections = await page.locator('main > section, [data-photo]').all();
if (sections.length === 0) {
  await page.screenshot({ path: `${prefixe}.png`, fullPage: true });
  console.log(`${prefixe}.png (page entiere)`);
} else {
  let i = 0;
  const tardifs = [];
  for (const s of sections) {
    const id = (await s.getAttribute('aria-labelledby')) || (await s.getAttribute('id')) || `s${i}`;
    await s.scrollIntoViewIfNeeded();
    // La transition reprend des que l'element revient a l'ecran : on attend
    // qu'elle FINISSE, sinon la planche montre un etat intermediaire et on
    // juge une composition sur une image a moitie peinte.
    const opaque = await s.evaluate(async (el) => {
      const blocs = Array.from(el.querySelectorAll('.entre'));
      if (el.matches('.entre')) blocs.push(el);
      const limite = Date.now() + 3000;
      while (Date.now() < limite) {
        if (blocs.every((b) => Number(getComputedStyle(b).opacity) > 0.999)) return true;
        await new Promise((r) => setTimeout(r, 60));
      }
      return false;
    });
    if (!opaque) tardifs.push(id);
    await s.screenshot({ path: `${prefixe}-${String(i).padStart(2, '0')}-${id}.png` });
    console.log(`${prefixe}-${String(i).padStart(2, '0')}-${id}.png`);
    i++;
  }
  if (tardifs.length) console.log(`\nsections photographiees AVANT la fin de leur entree : ${tardifs.join(', ')}`);
}
await nav.close();

console.log(`\nhauteur de page  ${hauteur} px   (visee : 4000)`);
console.log(`debord lateral   ${debord} px   (exige : 0)`);
console.log(`erreurs console  ${erreurs.length}`);
for (const e of erreurs.slice(0, 6)) console.log(`  · ${e}`);
if (fantomes.length) {
  console.log(`\n${fantomes.length} bloc(s) TOUJOURS INVISIBLES apres la traversee :`);
  for (const f of fantomes) console.log(`  · ${f}`);
  process.exit(1);
}
