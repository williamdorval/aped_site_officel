/* ============================================================
   CADRES DE PROJET — preuve que le site client NE DEFILE PAS TOUT
   SEUL, et qu'il defile bien quand on le demande.
   `node tools/projets-check.mjs [port]`
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PORT = process.argv[2] || "8099";
const BASE = `http://127.0.0.1:${PORT}/`;
const SORTIE = path.join(RACINE, "refonte-captures", "projets");
fs.mkdirSync(SORTIE, { recursive: true });

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const erreurs = [];
page.on("pageerror", (e) => erreurs.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
await page.goto(BASE, { waitUntil: "load" });
await page.waitForTimeout(800);

const lire = () => page.evaluate(() => {
  const v = document.querySelector(".shot-vue");
  const s = v.closest(".shot");
  return {
    scrollTop: Math.round(v.scrollTop),
    parcours: s.classList.contains("is-parcours"),
    mot: s.querySelector("[data-shot-mot]").textContent,
    jauge: getComputedStyle(s.querySelector(".shot-jauge b")).transform
  };
});

/* --- 1. DEFILEMENT DE LA PAGE : le cadre ne doit PAS bouger --- */
await page.evaluate(() => document.getElementById("realisations").scrollIntoView());
await page.waitForTimeout(600);
const avantDefil = await lire();
await page.evaluate(async () => {
  const y = window.scrollY;
  for (let i = 1; i <= 30; i++) {
    window.scrollTo(0, y + i * 22);
    await new Promise((r) => requestAnimationFrame(r));
  }
});
await page.waitForTimeout(500);
const apresDefil = await lire();

/* On revient sur le cadre --- */
await page.evaluate(() => document.getElementById("realisations").scrollIntoView());
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(SORTIE, "01-repos.png") });

/* --- 2. SURVOL BREF : rien ne doit se declencher --- */
const boite = await page.locator(".shot").first().boundingBox();
await page.mouse.move(boite.x + boite.width / 2, boite.y + boite.height / 2);
await page.waitForTimeout(220);
const survolBref = await lire();
await page.mouse.move(10, 10);
await page.waitForTimeout(400);

/* --- 3. SURVOL PROLONGE : la lecture demarre --- */
await page.mouse.move(boite.x + boite.width / 2, boite.y + boite.height / 2);
await page.waitForTimeout(700);
const survolLong = await lire();
await page.waitForTimeout(1400);
const apresLecture = await lire();
await page.screenshot({ path: path.join(SORTIE, "02-parcours.png") });

/* --- 4. LE VISITEUR PREND LA MAIN a la molette --- */
await page.mouse.wheel(0, 260);
await page.waitForTimeout(400);
const apresMolette = await lire();
await page.screenshot({ path: path.join(SORTIE, "03-molette.png") });

/* --- 5. ON SORT : retour en haut --- */
await page.mouse.move(10, 10);
await page.waitForTimeout(900);
const apresSortie = await lire();
await page.screenshot({ path: path.join(SORTIE, "04-retour.png") });

/* --- 6. CLAVIER --- */
await page.focus(".shot-vue");
await page.waitForTimeout(400);
const auFocus = await lire();
await page.keyboard.press("ArrowDown");
await page.keyboard.press("ArrowDown");
await page.waitForTimeout(400);
const apresFleches = await lire();

/* --- 7. le cadre ne retient pas la page : on va jusqu'au bout puis
       la page doit reprendre le defilement --- */
await page.evaluate(() => { const v = document.querySelector(".shot-vue"); v.scrollTop = v.scrollHeight; });
const yAvant = await page.evaluate(() => window.scrollY);
await page.mouse.move(boite.x + boite.width / 2, boite.y + boite.height / 2);
await page.mouse.wheel(0, 400);
await page.waitForTimeout(500);
const yApres = await page.evaluate(() => window.scrollY);

const rapport = {
  aucunDefilementImpose: avantDefil.scrollTop === apresDefil.scrollTop && apresDefil.scrollTop === 0,
  avantDefil, apresDefil,
  survolBref,
  survolLong,
  apresLecture,
  lectureDemarre: apresLecture.scrollTop > survolLong.scrollTop,
  apresMolette,
  moletteReprend: apresMolette.mot.indexOf("À vous") === 0,
  apresSortie,
  retourEnHaut: apresSortie.scrollTop === 0 && apresSortie.parcours === false,
  auFocus,
  apresFleches,
  clavierDeplace: apresFleches.scrollTop > auFocus.scrollTop,
  pageReprendAuBout: yApres > yAvant,
  yAvant, yApres,
  erreurs
};
fs.writeFileSync(path.join(SORTIE, "rapport.json"), JSON.stringify(rapport, null, 2), "utf8");
console.log(JSON.stringify(rapport, null, 2));

await ctx.close();
await nav.close();
