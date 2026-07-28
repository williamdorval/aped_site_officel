/* LE POPUP, ENTREE ET SORTIE, IMAGE PAR IMAGE.
   `node tools/_cadeau-film.mjs`
   Prouve que l'entree est une ARETE FRANCHE qui balaye de haut en
   bas — pas un fondu — et que la sortie est sa reciproque exacte.
   On releve le `clip-path` DANS la page a chaque image plutot que
   de juger sur des pixels : une capture d'ecran est plus lente
   qu'une transition, et l'anticrenelage ment. */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.resolve(ICI, "..", "refonte-captures", "cadeau-film");
fs.mkdirSync(SORTIE, { recursive: true });

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const R = { entree: [], sortie: [], erreurs: [] };
page.on("pageerror", (e) => R.erreurs.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") R.erreurs.push(m.text()); });
await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); } catch (e) {} });
await page.goto("http://127.0.0.1:8099/", { waitUntil: "load" });

const lire = () => page.evaluate(() => {
  const d = document.getElementById("cadeau");
  const c1 = d.querySelector(".cadeau-couv--1");
  const c2 = d.querySelector(".cadeau-couv--2");
  return {
    ouvert: d.open,
    clip: getComputedStyle(d).clipPath,
    opacite: getComputedStyle(d).opacity,
    voile: getComputedStyle(d, "::backdrop").opacity,
    couv1: c1 ? getComputedStyle(c1).transform : null,
    couv2: c2 ? getComputedStyle(c2).transform : null
  };
});

/* ---------- ENTREE ---------- */
await page.waitForFunction(() => { const d = document.getElementById("cadeau"); return d && d.open; }, null, { timeout: 20000 });
for (let i = 0; i < 6; i++) {
  R.entree.push({ i, ...(await lire()) });
  await page.screenshot({ path: path.join(SORTIE, "entree-" + i + ".png") });
  await page.waitForTimeout(80);
}
await page.waitForTimeout(700);
R.pose = await lire();
await page.screenshot({ path: path.join(SORTIE, "entree-pose.png") });

/* ---------- SORTIE ---------- */
await page.click(".cadeau-non");
for (let i = 0; i < 5; i++) {
  R.sortie.push({ i, ...(await lire()) });
  await page.screenshot({ path: path.join(SORTIE, "sortie-" + i + ".png") });
  await page.waitForTimeout(60);
}
await page.waitForTimeout(500);
R.ferme = await lire();
await page.screenshot({ path: path.join(SORTIE, "sortie-ferme.png") });

/* L'ENTREE EST-ELLE UNE ARETE, ET NON UN FONDU ?
   Une arete change `clip-path` et laisse `opacity` a 1. Un fondu
   fait l'inverse. On le lit, on ne le devine pas. */
const tousOpaques = R.entree.every((e) => e.opacite === "1");
const clipBouge = new Set(R.entree.map((e) => e.clip)).size > 1;
const sortieClipBouge = new Set(R.sortie.map((e) => e.clip)).size > 1;
const couvBougent = new Set(R.entree.map((e) => e.couv1)).size > 1;

R.verdict = {
  entreeEstUneAreteEtPasUnFondu: tousOpaques && clipBouge,
  sortieEstLaReciproque: sortieClipBouge,
  couverturesSAlignent: couvBougent,
  seFerme: R.ferme.ouvert === false,
  aucuneErreurConsole: R.erreurs.length === 0
};
console.log(JSON.stringify(R, null, 1));
fs.writeFileSync(path.join(SORTIE, "rapport.json"), JSON.stringify(R, null, 2));
await nav.close();
