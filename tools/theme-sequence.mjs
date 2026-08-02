/* ============================================================
   LA BASCULE CLAIR / SOMBRE SACCADE-T-ELLE ?
   `node tools/theme-sequence.mjs [nom] [--base=URL]`

   Ce qu'on mesure, et pas ce qu'on suppose : les intervalles entre
   images PENDANT la bascule. Une bascule propre tient sous 20 ms
   par image ; une bascule qui saute rend des intervalles de 60, 100
   ou 200 ms. On mesure aussi le NOMBRE d'elements qui portent une
   transition au moment du clic — c'est lui qui explique le reste.

   Trois endroits, deux sens, trois allers-retours chacun : une
   bascule sur le hero ne coute pas la meme chose qu'une bascule au
   milieu d'une section a fond sombre.

   On capture aussi une sequence de la bascule : la preuve d'un
   mouvement est une image, jamais une mesure.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const NOM = (process.argv[2] && !process.argv[2].startsWith("--")) ? process.argv[2] : "theme-sequence";
const argBase = process.argv.find((a) => a.startsWith("--base="));
const BASE = argBase ? argBase.slice(7) : "http://localhost:8099/";
const SORTIE = path.join(RACINE, "preuves", NOM);
fs.mkdirSync(SORTIE, { recursive: true });

const OU = ["top", "realisations", "visite", "comparatif", "contact"];

const nav = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--disable-gpu-compositing"] });
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const erreurs = [];
page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
page.on("pageerror", (e) => erreurs.push(String(e)));
await page.addInitScript(() => { try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
await page.goto(BASE, { waitUntil: "load" });
await page.waitForTimeout(1200);
await page.mouse.move(4, 4);
await page.waitForTimeout(1900);

/* piege 80 — la traversee fixe la hauteur definitive. */
let y = 0;
for (let i = 0; i < 400; i++) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  if (y >= h) break;
  y += 450;
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(30);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);

/* Combien d'elements portent une transition au moment du clic ? */
const poseur = await page.evaluate(() => {
  const n = document.querySelectorAll("*").length;
  document.documentElement.classList.add("theme-shifting");
  let avec = 0;
  const tous = document.querySelectorAll("*");
  for (const el of tous) {
    const t = getComputedStyle(el).transitionProperty;
    if (t && t !== "none" && /color|background|fill/.test(t)) avec++;
  }
  document.documentElement.classList.remove("theme-shifting");
  return { total: n, avec };
});
console.log(`elements du document : ${poseur.total}`);
console.log(`elements qui transitionnent une couleur pendant la bascule : ${poseur.avec}\n`);

const lignes = [];

for (const ancre of OU) {
  if (ancre !== "top") {
    const sel = "#" + ancre;
    const existe = await page.evaluate((s) => !!document.querySelector(s), sel);
    if (!existe) continue;
    for (let i = 0; i < 200; i++) {
      const dy = await page.evaluate((s) => {
        const e = document.querySelector(s);
        return e ? Math.round(e.getBoundingClientRect().y - 120) : 0;
      }, sel);
      if (Math.abs(dy) <= 8) break;
      await page.evaluate((d) => window.scrollBy(0, d), Math.max(-700, Math.min(700, dy)));
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(700);
  }

  for (let tour = 0; tour < 3; tour++) {
    for (const sens of ["→sombre", "→clair"]) {
      /* On arme le compteur d'images, on clique, on releve. */
      await page.evaluate(() => {
        window.__img = [];
        window.__t0 = performance.now();
        let last = 0;
        const f = (t) => {
          if (last) window.__img.push(t - last);
          last = t;
          if (t - window.__t0 < 1400) requestAnimationFrame(f);
        };
        requestAnimationFrame(f);
      });
      await page.click("#themeToggle");
      await page.waitForTimeout(1550);
      const m = await page.evaluate(() => {
        const a = window.__img.filter((v) => v > 1 && v < 900).sort((x, z) => x - z);
        if (!a.length) return null;
        return {
          n: a.length,
          med: a[Math.floor(a.length / 2)],
          p95: a[Math.floor(a.length * 0.95)],
          max: a[a.length - 1],
          lourdes: a.filter((v) => v > 20).length,
          theme: document.documentElement.getAttribute("data-theme"),
        };
      });
      if (m) lignes.push({ ancre, tour, sens, ...m });
    }
  }
}

/* La sequence en images, sur le hero — la preuve est visuelle. */
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);
await page.click("#themeToggle");
for (let i = 0; i < 8; i++) {
  await page.screenshot({ path: path.join(SORTIE, `bascule-${String(i + 1).padStart(2, "0")}.png`) });
  await page.waitForTimeout(90);
}
await page.waitForTimeout(900);
await page.screenshot({ path: path.join(SORTIE, "bascule-09-pose.png") });

console.log("endroit".padEnd(14) + "sens".padEnd(10) + "med".padStart(7) + "p95".padStart(8) +
  "max".padStart(8) + "  >20ms");
for (const l of lignes) {
  console.log(
    l.ancre.padEnd(14) + l.sens.padEnd(10) +
    l.med.toFixed(1).padStart(7) + l.p95.toFixed(1).padStart(8) +
    l.max.toFixed(1).padStart(8) + String(l.lourdes).padStart(7)
  );
}

const med = lignes.map((l) => l.med).sort((a, b) => a - b);
const maxs = lignes.map((l) => l.max);
const lourdes = lignes.reduce((a, l) => a + l.lourdes, 0);
console.log(`\nmediane des medianes : ${med[Math.floor(med.length / 2)].toFixed(1)} ms`);
console.log(`pire image           : ${Math.max(...maxs).toFixed(1)} ms`);
console.log(`images > 20 ms       : ${lourdes} sur ${lignes.reduce((a, l) => a + l.n, 0)}`);
console.log(`erreurs console      : ${erreurs.length}`);
erreurs.slice(0, 4).forEach((e) => console.log("  " + e));

await nav.close();
