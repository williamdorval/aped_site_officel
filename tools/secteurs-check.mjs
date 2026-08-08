/* Les treize aperçus, un par un. `node tools/secteurs-check.mjs` */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.ADEXWEB_BASE || "http://localhost:8099";
const OUT = path.resolve("refonte-captures/secteurs");
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
const page = await ctx.newPage();
/* L'INTERRUPTEUR PREVU POUR LES OUTILS DE MESURE. Sans lui, le
   popup cadeau s'ouvre entre la 11e et la 20e seconde ; un
   `<dialog>` ouvert par `showModal()` capture TOUS les evenements
   de pointeur, et le survol d'une pastille de secteur expire au
   bout de trente secondes en accusant le mauvais coupable. Le
   popup a son propre outil, `cadeau-check.mjs`. */
await page.addInitScript(() => {
  try { sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {}
});
const errs = [];
page.on("pageerror", e => errs.push(String(e)));
page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
await page.goto(BASE + "/", { waitUntil: "load" });
await page.waitForTimeout(1200);
await page.evaluate(() => document.getElementById("demos").scrollIntoView({ block: "start", behavior: "instant" }));
await page.waitForTimeout(900);

const pills = await page.$$(".sector-pills button");
console.log("pastilles :", pills.length);
let i = 0;
for (const pill of pills) {
  const key = await pill.getAttribute("data-sector");
  await pill.hover();
  await page.waitForTimeout(700);
  const etat = await page.evaluate(() => {
    const on = document.querySelector(".mock.is-on");
    const cap = document.getElementById("sectorCaption");
    const r = document.getElementById("sectorPreview").getBoundingClientRect();
    return {
      actif: on ? on.dataset.mock : null,
      legende: cap.textContent.trim(),
      cadre: Math.round(r.width) + "x" + Math.round(r.height)
    };
  });
  await page.locator("#sectorPreview").screenshot({ path: path.join(OUT, String(++i).padStart(2, "0") + "-" + key + ".png") });
  console.log(String(i).padStart(2, "0"), key, "->", JSON.stringify(etat));
}
await page.screenshot({ path: path.join(OUT, "section-1440.png") });
console.log(errs.length ? "ERREURS: " + errs.join(" | ") : "console propre");
await browser.close();
