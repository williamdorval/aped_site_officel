/* == SAS-CHECK — la preuve des trois sas ==
   Rend : activation et geometrie des pistes · le verbe absorbe ·
   sequence de captures a travers chaque sas avec l'ecart de pixels
   entre deux images consecutives (regle « visible, sinon ca ne
   compte pas ») · arrivee par ancre APRES le sas · erreurs console.
   Usage : node tools/sas-check.mjs [adresse] */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { diffStats, lire } from "./_png.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const ADRESSE = process.argv[2] || "http://127.0.0.1:8099";
const DOSSIER = path.join(ICI, "..", "refonte-captures", "sas");
fs.mkdirSync(DOSSIER, { recursive: true });

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 1440, height: 900 } });
/* Piege 18 : le popup cadeau bloque tout outil qui defile. */
await page.addInitScript(() => {
  try {
    sessionStorage.setItem("aped-sans-popup", "1");
    sessionStorage.setItem("aped-entree-saut", "1");
  } catch (e) {}
});

const erreurs = [];
page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
page.on("pageerror", (e) => erreurs.push(String(e)));

await page.goto(ADRESSE, { waitUntil: "networkidle" });
await page.mouse.wheel(0, 10);
await page.waitForTimeout(1800);

/* Piege 4 : hors ecran, une section `content-visibility` rend sa
   hauteur RESERVEE — meme apres une traverse, puisqu'elle ressaute
   des qu'elle ressort de l'ecran. Chaque hauteur se mesure donc
   PENDANT que la section est visible, en s'arretant dessus. */
const reels = await page.evaluate(async () => {
  const cibles = ["visite", "calculateur", "comparatif", "processus",
    "apropos", "reference", "faq", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const f = document.querySelector(".footer");
  if (f) cibles.push(f);
  const r = {};
  for (const el of cibles) {
    el.scrollIntoView({ block: "start" });
    await new Promise((res) => setTimeout(res, 260));
    r[el.id || "footer"] = Math.round(el.getBoundingClientRect().height);
  }
  scrollTo(0, 0);
  await new Promise((res) => setTimeout(res, 400));
  return r;
});
console.log("HAUTEURS REELLES (mesurees a l'ecran):", JSON.stringify(reels));

const etat = await page.evaluate(() => {
  const r = {};
  r.palier = document.documentElement.getAttribute("data-palier");
  r.sas = [...document.querySelectorAll(".sas[data-sas]")].map((s) => {
    const boite = s.querySelector(".sas-piste") || s;
    return {
      genre: s.getAttribute("data-sas"),
      actif: s.classList.contains("sas-actif"),
      haut: Math.round(boite.getBoundingClientRect().height),
      verbeSeuil: s.querySelector("[data-seuil]")?.getAttribute("data-verbe") ?? null,
      top: Math.round(boite.getBoundingClientRect().top + scrollY),
    };
  });
  r.visiteFond = getComputedStyle(document.getElementById("visite")).backgroundColor;
  r.hauteurPage = Math.round(document.documentElement.scrollHeight);
  return r;
});
console.log(JSON.stringify(etat, null, 1));

for (const s of etat.sas) {
  const dossier = path.join(DOSSIER, s.genre);
  fs.mkdirSync(dossier, { recursive: true });
  /* Le top se relit SUR PLACE : mesure prise de loin, il serait
     fausse par les hauteurs reservees des sections traversees. */
  const local = await page.evaluate(async (genre) => {
    const el = document.querySelector('.sas[data-sas="' + genre + '"]');
    const boite = el.querySelector(".sas-piste") || el;
    boite.scrollIntoView({ block: "start" });
    await new Promise((r) => setTimeout(r, 300));
    const rect = boite.getBoundingClientRect();
    return { top: Math.round(rect.top + scrollY), haut: Math.round(rect.height) };
  }, s.genre);
  const debut = Math.max(0, local.top - 900);
  const fin = local.top + Math.max(local.haut, 900);
  const pas = Math.round((fin - debut) / 10);
  let precedent = null;
  const ecarts = [];
  for (let i = 0; i <= 10; i++) {
    const y = debut + i * pas;
    await page.evaluate((yy) => scrollTo(0, yy), y);
    await page.waitForTimeout(320);
    const fichier = path.join(dossier, String(i).padStart(2, "0") + "-y" + y + ".png");
    await page.screenshot({ path: fichier });
    if (precedent) {
      const d = diffStats(lire(fs, precedent), lire(fs, fichier));
      /* Piege 30 : une comparaison qui rend NaN doit ARRETER l'outil,
         jamais retomber en silence. */
      if (typeof d.pct !== "number" || Number.isNaN(d.pct)) {
        throw new Error("diffStats a rendu autre chose qu'un nombre : " + JSON.stringify(d));
      }
      ecarts.push(d.pct);
    }
    precedent = fichier;
  }
  console.log("SEQ", s.genre,
    "ecarts:", ecarts.map((e) => e.toFixed(2) + "%").join(" · "));
}

for (const ancre of ["#visite", "#calculateur"]) {
  await page.goto(ADRESSE + "/" + ancre, { waitUntil: "load" });
  /* La re-visee de main.js repasse jusqu'a 900 ms apres `load` :
     mesurer avant elle, c'est mesurer le navigateur, pas le site. */
  await page.waitForTimeout(2200);
  const m = await page.evaluate((a) => {
    const el = document.querySelector(a);
    return { cible: a, topVisible: Math.round(el.getBoundingClientRect().top), scrollY: Math.round(scrollY) };
  }, ancre);
  console.log("ANCRE", JSON.stringify(m));
}

console.log("ERREURS CONSOLE:", erreurs.length ? JSON.stringify(erreurs) : "aucune");
await nav.close();
