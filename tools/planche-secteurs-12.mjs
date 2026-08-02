/* ============================================================
   LA PLANCHE DES DOUZE PREMIERS ÉCRANS
   `node tools/planche-secteurs-12.mjs [largeur-de-case=480]`

   POURQUOI.
   Le test qui décide n'est pas une mesure, c'est le CÔTE-À-CÔTE :
   « mets ta capture à côté des trois références ; si on voit laquelle
   est la tienne, elle n'est pas finie. » Et sa seconde passe :
   « mets les douze côte à côte ; on ne doit pas pouvoir deviner
   qu'elles viennent du même studio. »

   Ce test ne se fait pas en ouvrant douze fichiers l'un après
   l'autre. Il se fait sur UNE image où les douze se regardent.

   CE QUI A CHANGÉ DEPUIS LA VERSION PRÉCÉDENTE.  D-681
   Elle découpait le premier écran de douze captures pleine page de
   14 000 à 26 000 px — d'où deux passes, une page par image, pour ne
   pas tuer le navigateur. Il n'y a plus de page longue : les douze
   entrées sont douze `ecran-<clé>.webp` de 1440 × 900. Une seule
   passe, et **toutes les cases ont exactement la même taille** —
   piège 3, deux images de tailles différentes rendent 100 % d'écart
   et on ne compare plus rien.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const ENTREE = path.join(RACINE, "images", "realisations");
const SORTIE = path.join(RACINE, "preuves", "chantier7-ecrans");
fs.mkdirSync(SORTIE, { recursive: true });

const { chromium } = await import(pathToFileURL(path.join(RACINE, "node_modules/playwright/index.mjs")).href);

/* Un paramètre illisible ARRÊTE l'outil : `Number("grand")` vaut
   `NaN`, et une planche de `NaN` px de large sort vide sans une
   plainte. Piège 30. */
const CASE_L = Number(process.argv[2] || 480);
if (!Number.isFinite(CASE_L) || CASE_L < 160 || CASE_L > 1440) {
  throw new Error(`largeur de case illisible : ${JSON.stringify(process.argv[2])}`);
}
const CASE_H = Math.round((CASE_L * 900) / 1440);
const COL = 4;

/* L'ordre est celui du panneau, pas l'ordre alphabétique : c'est dans
   cet ordre que le visiteur les rencontre. */
const DOUZE = [
  { c: "restaurant", n: "01 · Restauration", e: "projet" },
  { c: "boutique", n: "02 · Boutique en ligne", e: "démonstration" },
  { c: "coiffure", n: "03 · Coiffure et esthétique", e: "démonstration" },
  { c: "gym", n: "04 · Gym et entraînement", e: "démonstration" },
  { c: "hotel", n: "05 · Hébergement et tourisme", e: "démonstration" },
  { c: "garage", n: "06 · Garage et mécanique", e: "projet" },
  { c: "construction", n: "07 · Construction et rénovation", e: "démonstration" },
  { c: "paysagement", n: "08 · Paysagement et déneigement", e: "projet" },
  { c: "clinique", n: "09 · Clinique et santé", e: "démonstration" },
  { c: "immobilier", n: "10 · Immobilier", e: "démonstration" },
  { c: "juridique", n: "11 · Services juridiques", e: "démonstration" },
  { c: "photo", n: "12 · Photographe et créatif", e: "démonstration" },
];

const present = DOUZE.filter((d) => fs.existsSync(path.join(ENTREE, `ecran-${d.c}.webp`)));
const absent = DOUZE.filter((d) => !present.includes(d));
if (!present.length) throw new Error("aucune capture — lancer `node tools/ecrans-secteurs.mjs`");
/* AUCUN CAP SILENCIEUX : ce qui manque se DIT, sinon une planche de
   neuf cases se lit comme « les douze sont là ». */
if (absent.length) console.log(`⚠ ${absent.length} écran(s) pas encore capturé(s) : ${absent.map((d) => d.c).join(" ")}`);

const nav = await chromium.launch();
const rangs = Math.ceil(present.length / COL);
const L = COL * CASE_L + (COL + 1) * 16;
const H = rangs * (CASE_H + 30) + 16 * (rangs + 1) + 54;

const page = await nav.newPage({ viewport: { width: L, height: H }, deviceScaleFactor: 1 });
const cases = present.map((d) => {
  const b64 = fs.readFileSync(path.join(ENTREE, `ecran-${d.c}.webp`)).toString("base64");
  return { ...d, u: "data:image/webp;base64," + b64 };
});

await page.setContent(`<!doctype html><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#15161a;color:#e9eaec;font:12px/1.3 -apple-system,Segoe UI,system-ui,sans-serif;padding:16px}
  h1{font-size:15px;font-weight:600;letter-spacing:.02em;margin:0 0 14px 2px;color:#fff}
  h1 b{color:#8d949d;font-weight:400}
  .g{display:grid;grid-template-columns:repeat(${COL},${CASE_L}px);gap:16px}
  figure{width:${CASE_L}px}
  img{display:block;width:${CASE_L}px;height:${CASE_H}px;object-fit:cover;background:#000}
  figcaption{height:30px;display:flex;align-items:center;gap:6px;font-size:11px;letter-spacing:.02em;padding-top:7px;color:#c3c8ce}
  figcaption em{font-style:normal;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#767d86}
</style>
<h1>Les douze premiers écrans — 1440 × 900, même échelle &nbsp;<b>${present.length}/12${absent.length ? " · manquants : " + absent.map((d) => d.c).join(", ") : ""}</b></h1>
<div class="g">${cases.map((d) => `<figure><img src="${d.u}" alt=""><figcaption>${d.n} <em>${d.e}</em></figcaption></figure>`).join("")}</div>`);

await page.evaluate(async () => {
  await Promise.all([...document.images].map((i) => (i.complete && i.naturalWidth > 0)
    ? Promise.resolve()
    : new Promise((r) => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); })));
  await document.fonts.ready;
});
const manquees = await page.evaluate(() => [...document.images].filter((i) => !(i.complete && i.naturalWidth > 0)).length);
if (manquees) throw new Error(`${manquees} image(s) jamais chargée(s) — la planche mentirait`);

const f = path.join(SORTIE, `planche-douze-${CASE_L}.png`);
await page.screenshot({ path: f, fullPage: true });
await nav.close();
console.log(`${present.length} écran(s) · cases de ${CASE_L}×${CASE_H} · ${path.relative(RACINE, f)}`);
