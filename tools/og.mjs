/* == OG — la carte de partage, fabriquee depuis le VRAI site ==
   Deux temps : capture de la plaque de limaille reelle (grains au
   repos, deterministes), puis composition d'une carte 1200x630 avec
   les jetons et les polices du projet. Aucune image generee, aucune
   affirmation qui ne soit deja defendue par le socle du hero.
   Usage : node tools/og.mjs [adresse] */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const ADRESSE = process.argv[2] || "http://127.0.0.1:8099";

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  try {
    sessionStorage.setItem("aped-sans-popup", "1");
    sessionStorage.setItem("aped-entree-saut", "1");
  } catch (e) {}
});
await page.goto(ADRESSE, { waitUntil: "networkidle" });
/* Laisse la limaille se poser : au repos la boucle s'arrete seule. */
await page.waitForTimeout(2600);
const plaque = page.locator("#heroPlate");
const plaquePng = path.join(ICI, "_og-plaque.png");
await plaque.screenshot({ path: plaquePng });

/* La carte. Les trois faits sont ceux du socle du hero — deja
   defendus, deja affiches, deja propages. Aucun autre chiffre. */
const b64 = fs.readFileSync(plaquePng).toString("base64");
const gabarit = `<!DOCTYPE html><html lang="fr-CA"><head><meta charset="utf-8">
<style>
@font-face { font-family: "Archivo"; src: url("${ADRESSE}/fonts/archivo-latin.woff2") format("woff2"); font-weight: 100 900; font-stretch: 62% 125%; }
@font-face { font-family: "Martian Mono"; src: url("${ADRESSE}/fonts/martian-latin.woff2") format("woff2"); font-weight: 100 800; font-stretch: 75% 112.5%; }
* { margin: 0; box-sizing: border-box; }
body {
  width: 1200px; height: 630px; background: #dcdedb; color: #101211;
  font-family: "Archivo", sans-serif; overflow: hidden; position: relative;
  padding: 48px 56px;
}
/* Pas d'etiquette « APED » : la plaque EST le nom, une etiquette le
   repeterait. Seul le lieu s'ecrit. */
.haut { display: flex; justify-content: flex-end; }
.haut span { font-family: "Martian Mono", monospace; font-size: 13px; letter-spacing: 0.14em; color: #565a57; }
.plaque { display: block; width: 640px; margin-top: -6px; }
h1 {
  font-size: 64px; font-weight: 800; font-stretch: 118%;
  letter-spacing: -0.03em; line-height: 0.98; margin-top: 10px; max-width: 21ch;
}
.filet { position: absolute; left: 56px; right: 56px; bottom: 118px; height: 2px;
  background: repeating-linear-gradient(90deg, #c8371b 0 2px, transparent 2px 4px); }
.socle { position: absolute; left: 56px; right: 56px; bottom: 48px;
  display: flex; gap: 40px; font-family: "Martian Mono", monospace; font-size: 15px; }
.socle span b { color: #9b2810; font-weight: 700; }
.socle span { color: #101211; }
</style></head><body>
<div class="haut"><span>QUÉBEC, CANADA</span></div>
<img class="plaque" src="data:image/png;base64,${b64}" alt="">
<h1>On code ce qui fait rouler votre entreprise.</h1>
<div class="filet"></div>
<div class="socle">
  <span><b>Réponse en 12 h</b> jours ouvrables</span>
  <span><b>Un seul interlocuteur</b> du premier appel à la mise en ligne</span>
  <span><b>Tout vous appartient</b></span>
</div>
</body></html>`;

const carte = await nav.newPage({ viewport: { width: 1200, height: 630 } });
await carte.setContent(gabarit, { waitUntil: "networkidle" });
await carte.evaluate(() => document.fonts.ready);
await carte.waitForTimeout(300);
await carte.screenshot({ path: path.join(RACINE, "images", "og.png") });
fs.unlinkSync(plaquePng);
console.log("images/og.png ecrit — plaque reelle, faits du socle.");
await nav.close();
