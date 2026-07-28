/* ============================================================
   LE RAIL DES SERVICES — preuve
   `node tools/services-check.mjs [port] [largeur]`

   1. Traverse la section epinglee et capture chaque quart.
   2. Verifie que le compteur, le nom et la jauge SUIVENT vraiment
      (une barre qui ment est pire que pas de barre).
   3. Verifie que la scene tient dans un ecran.
   4. Verifie l'acces clavier : la piste prend le focus, les fleches
      changent de carte.
   5. Mesure les images par seconde pendant la traversee.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PORT = process.argv[2] || "8099";
const LARGEUR = Number(process.argv[3] || 1440);
const BASE = `http://127.0.0.1:${PORT}/`;
const SORTIE = path.join(RACINE, "refonte-captures", "services");
fs.mkdirSync(SORTIE, { recursive: true });

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: LARGEUR, height: 900 }, colorScheme: "light" });
const page = await ctx.newPage();
const erreurs = [];
page.on("pageerror", (e) => erreurs.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });

await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
await page.goto(BASE, { waitUntil: "load" });
await page.waitForTimeout(900);

const geo = await page.evaluate(() => {
  const svc = document.getElementById("svc");
  const piste = document.getElementById("svcPiste");
  const rail = document.getElementById("svcRail");
  const carte = document.querySelector(".svc-carte");
  const r = svc.getBoundingClientRect();
  return {
    pinne: svc.classList.contains("is-pinned"),
    hauteurScene: Math.round(r.height),
    hauteurEcran: window.innerHeight,
    hauteurNav: Math.round(document.querySelector(".nav").offsetHeight),
    largeurPiste: piste.clientWidth,
    largeurRail: rail.scrollWidth,
    largeurCarte: carte.offsetWidth,
    /* Ce qui reste visible de la carte suivante : l'affordance
       « il y en a d'autres » la mieux mesuree. */
    tranche: piste.clientWidth - carte.offsetWidth,
    course: rail.scrollWidth - piste.clientWidth,
    hauteurPage: document.documentElement.scrollHeight
  };
});

/* --- traversee, capture et relevé a chaque quart --- */
const svcTop = await page.evaluate(() => {
  const svc = document.getElementById("svc");
  return svc.getBoundingClientRect().top + window.scrollY;
});
const etats = [];
const PAS = [0, 0.25, 0.5, 0.75, 1];
for (const p of PAS) {
  const y = svcTop - geo.hauteurNav + geo.course * p;
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(700);
  const e = await page.evaluate(() => {
    const j = document.getElementById("svcJauge");
    const t = getComputedStyle(j).transform;
    const m = t === "none" ? 1 : parseFloat(t.split("(")[1].split(",")[0]);
    const active = document.querySelector(".svc-carte.is-on");
    const cartes = [...document.querySelectorAll(".svc-carte")];
    return {
      num: document.getElementById("svcNum").textContent,
      nom: document.getElementById("svcNow").textContent,
      jauge: Math.round(m * 100) / 100,
      indexActif: cartes.indexOf(active),
      cartesActives: cartes.filter((c) => c.classList.contains("is-on")).length
    };
  });
  etats.push({ p, ...e });
  await page.screenshot({ path: path.join(SORTIE, `${LARGEUR}-p${String(Math.round(p * 100)).padStart(3, "0")}.png`) });
}

/* --- images par seconde pendant la traversee --- */
await page.evaluate((v) => window.scrollTo(0, v), svcTop - geo.hauteurNav);
await page.waitForTimeout(400);
const fps = await page.evaluate(async (course) => {
  const depart = window.scrollY;
  let images = 0;
  let fini = false;
  const t0 = performance.now();
  const compter = () => { images++; if (!fini) requestAnimationFrame(compter); };
  requestAnimationFrame(compter);
  const pas = course / 60;
  for (let i = 0; i < 60; i++) {
    window.scrollTo(0, depart + pas * i);
    await new Promise((r) => requestAnimationFrame(r));
  }
  fini = true;
  const dt = performance.now() - t0;
  return Math.round((images / dt) * 1000);
}, geo.course);

/* --- clavier --- */
await page.evaluate((v) => window.scrollTo(0, v), svcTop - geo.hauteurNav);
await page.waitForTimeout(500);
await page.focus("#svcPiste");
const focusOk = await page.evaluate(() => document.activeElement && document.activeElement.id === "svcPiste");
await page.keyboard.press("ArrowRight");
await page.waitForTimeout(900);
const apresDroite = await page.evaluate(() => document.getElementById("svcNum").textContent);
await page.keyboard.press("End");
await page.waitForTimeout(1100);
const apresFin = await page.evaluate(() => document.getElementById("svcNum").textContent);

/* --- boutons --- */
await page.evaluate((v) => window.scrollTo(0, v), svcTop - geo.hauteurNav);
await page.waitForTimeout(500);
await page.click('[data-svc="1"]');
await page.waitForTimeout(900);
const apresBouton = await page.evaluate(() => document.getElementById("svcNum").textContent);

const rapport = {
  geometrie: geo,
  sceneTientDansUnEcran: geo.hauteurScene <= geo.hauteurEcran - geo.hauteurNav + 2,
  etats,
  fps,
  clavier: { pisteFocalisable: focusOk, apresFlecheDroite: apresDroite, apresFin: apresFin },
  boutonSuivant: apresBouton,
  erreurs
};
fs.writeFileSync(path.join(SORTIE, `rapport-${LARGEUR}.json`), JSON.stringify(rapport, null, 2), "utf8");
console.log(JSON.stringify(rapport, null, 2));

await ctx.close();
await nav.close();
