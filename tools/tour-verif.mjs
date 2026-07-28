/* ============================================================
   VERIFICATION DE LA VISITE 360
   `node tools/serve.mjs 8099` puis `node tools/tour-verif.mjs [port]`

   Mesure, dans l'ordre :
   1. le POIDS AVANT CLIC — ce que la section coute quand personne
      n'est entre dans la visite. Seule l'affiche doit partir.
   2. le poids apres clic, moteur et panoramas compris.
   3. une capture de CHAQUE piece, en passant par les points de
      passage puis par le plan, pour voir ce que le visiteur voit.
   4. les erreurs de console, sur toute la duree.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PORT = Number(process.argv[2] || 8099);
const BASE = "http://127.0.0.1:" + PORT + "/";
const SORTIE = path.join(RACINE, "tools/_captures-tour");
fs.mkdirSync(SORTIE, { recursive: true });

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

const erreurs = [];
page.on("console", m => { if (m.type() === "error") erreurs.push("[console] " + m.text()); });
page.on("pageerror", e => erreurs.push("[pageerror] " + String(e)));
page.on("requestfailed", r => erreurs.push("[404?] " + r.url() + "  " + (r.failure() || {}).errorText));

/* --- comptage du reseau, par phase --- */
/* `tools/serve.mjs` n'envoie pas de `content-length` : lire l'en-tete
   rendrait zero partout. On pese donc le CORPS REEL de la reponse. */
let phase = "avant";
const recu = { avant: [], apres: [] };
const enVol = [];
page.on("response", r => {
  const u = r.url();
  if (!u.startsWith(BASE)) return;
  const p = phase;
  enVol.push(
    r.body()
      .then(b => recu[p].push({ url: u.slice(BASE.length), o: b.length, st: r.status() }))
      .catch(() => recu[p].push({ url: u.slice(BASE.length), o: 0, st: r.status() }))
  );
});

await page.goto(BASE, { waitUntil: "networkidle" });
/* La section entiere, avant tout clic : c'est ce que le visiteur
   voit vraiment — l'affiche, le nombre de pieces annonce et la
   mention de licence, ensemble. */
/* l'affiche est en lazy : il faut que la section soit visible pour
   qu'elle parte, sinon on mesurerait un zero trompeur. */
await page.locator("#visite").scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);
await page.waitForLoadState("networkidle").catch(() => {});
await page.locator("#visite").screenshot({ path: path.join(SORTIE, "00-section-avant-clic.png") });

await Promise.all(enVol);
const tour = recu.avant.filter(r => /images\/tour\/|pannellum/i.test(r.url));
const poidsTour = tour.reduce((s, r) => s + r.o, 0);
console.log("=== AVANT LE CLIC ===");
for (const r of tour) console.log("   " + String(Math.round(r.o / 1024)).padStart(5) + " Ko  " + r.st + "  " + r.url);
console.log("   TOTAL VISITE AVANT CLIC : " + Math.round(poidsTour / 1024) + " Ko" +
  (poidsTour / 1024 < 80 ? "   OK (< 80 Ko)" : "   !! AU-DESSUS DE 80 Ko"));
console.log("   (page entiere avant clic : " + Math.round(recu.avant.reduce((s, r) => s + r.o, 0) / 1024) + " Ko)");

/* --- on entre --- */
phase = "apres";
await page.locator("[data-tour-start]").click();
await page.waitForSelector(".tour.is-live", { timeout: 45000 });
await page.waitForTimeout(3500);

/* --- les pieces, une par une, par le PLAN --- */
const pieces = await page.$$eval(".tour-map-room", els => els.map(e => e.textContent.trim()));
console.log("\n=== PIECES DU PLAN (" + pieces.length + ") ===");
console.log("   " + pieces.join(" · "));

let i = 0;
for (const nom of pieces) {
  const b = page.locator(".tour-map-room", { hasText: new RegExp("^" + nom.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$") }).first();
  await b.click();
  await page.waitForTimeout(4200);
  const f = path.join(SORTIE, String(++i).padStart(2, "0") + "-" + nom.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-") + ".png");
  await page.locator(".tour-stage").screenshot({ path: f });
  const scene = await page.evaluate(() => document.querySelector(".pnlm-container") ? "ok" : "?");
  console.log("   capture " + path.basename(f) + "   scene " + scene);
}

/* --- les points de passage : on en clique un pour verifier qu'ils marchent --- */
const hs = await page.$$(".tour-hs");
console.log("\n=== POINTS DE PASSAGE VISIBLES DANS LA PIECE COURANTE : " + hs.length + " ===");
for (const h of hs) console.log("   " + JSON.stringify(await h.getAttribute("aria-label")));
if (hs.length) {
  await hs[0].click();
  await page.waitForTimeout(3500);
  await page.locator(".tour-stage").screenshot({ path: path.join(SORTIE, "99-apres-passage.png") });
  console.log("   passage emprunte -> 99-apres-passage.png");
}

/* --- le plan au telephone --- */
/* La carte tombe a 10rem de large sous 30em. La bande « Terrasse »
   n'y fait plus que ~20 px de haut : c'est le cas ou une etiquette
   se coupe. On regarde, on ne suppose pas. */
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(1200);
await page.locator(".tour-map").screenshot({ path: path.join(SORTIE, "90-plan-390.png") });
const coupe = await page.$$eval(".tour-map-room", els => els.map(e => ({
  nom: e.textContent.trim(),
  deborde: e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1,
  h: Math.round(e.getBoundingClientRect().height),
  w: Math.round(e.getBoundingClientRect().width)
})));
console.log("\n=== PLAN A 390 px ===");
for (const c of coupe) console.log("   " + c.nom.padEnd(10) + c.w + "x" + c.h + " px   " + (c.deborde ? "!! TEXTE COUPE" : "texte entier"));
await page.setViewportSize({ width: 1440, height: 900 });

await Promise.all(enVol);
const poidsApres = recu.apres.reduce((s, r) => s + r.o, 0);
console.log("\n=== APRES LE CLIC ===");
console.log("   " + recu.apres.length + " requetes, " + Math.round(poidsApres / 1024) + " Ko");
const gros = recu.apres.filter(r => r.o > 60000).sort((a, b) => b.o - a.o);
for (const r of gros) console.log("   " + String(Math.round(r.o / 1024)).padStart(5) + " Ko  " + r.url);

console.log("\n=== CONSOLE ===");
console.log(erreurs.length ? erreurs.join("\n") : "   0 erreur");

await nav.close();
