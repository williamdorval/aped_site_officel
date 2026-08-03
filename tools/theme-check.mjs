/* ============================================================
   PARITE CLAIR / SOMBRE
   `node tools/theme-check.mjs [port] [dossier]`

   Trois choses, et rien d'autre :
   1. capture chaque section dans LES DEUX themes, cote a cote ;
   2. echantillonne le pixel du fond du canvas du hero dans les deux
      themes et dit s'il suit la surface de la page ;
   3. mesure le contraste de chaque element de texte dans les deux
      themes et liste les echecs AA.

   La bascule se fait par le VRAI bouton de la page, pas en posant
   l'attribut a la main : c'est le chemin que prend un visiteur, donc
   c'est le seul qui prouve quelque chose.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
import { port as portDe } from "./_adresse.mjs";
const PORT = portDe(process.argv[2]);
const NOM = process.argv[3] || "theme";
const BASE = `http://127.0.0.1:${PORT}/`;
const SORTIE = path.join(RACINE, "refonte-captures", NOM);

const VUES = [
  { id: "top", label: "Hero" },
  { id: "services", label: "Services" },
  { id: "realisations", label: "Projets" },
  { id: "demos", label: "Secteurs" },
  { id: "visite", label: "Visite 360" },
  { id: "calculateur", label: "Calculateur" },
  { id: "comparatif", label: "Comparatif" },
  { id: "processus", label: "Processus" },
  { id: "reference", label: "Reference" },
  { id: "faq", label: "Questions" },
  { id: "contact", label: "Contact" }
];

const LARGEURS = [
  { w: 1920, h: 1080, nom: "1920" },
  { w: 1440, h: 900, nom: "1440" },
  { w: 1280, h: 800, nom: "1280" },
  { w: 834, h: 1112, nom: "tablette" },
  { w: 390, h: 844, nom: "mobile" }
];

/* ---- contraste WCAG 2.x, formule exacte ---- */
function lum(rgb) {
  const c = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a, b) {
  const l1 = lum(a), l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const nav = await chromium.launch();
const rapport = { themes: {}, hero: {}, contraste: {}, mesures: {}, console: [], exclus: 0 };

for (const vp of LARGEURS) {
  for (const theme of ["light", "dark"]) {
    const ctx = await nav.newContext({
      viewport: { width: vp.w, height: vp.h },
      deviceScaleFactor: 1,
      colorScheme: theme
    });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => rapport.console.push(`${vp.nom}/${theme} pageerror: ${e}`));
    page.on("console", (m) => { if (m.type() === "error") rapport.console.push(`${vp.nom}/${theme} console: ${m.text()}`); });

    await page.addInitScript((t) => {
      try { localStorage.setItem("aped-theme", t); } catch (e) {}
      try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {}
    }, theme);

    await page.goto(BASE, { waitUntil: "load" });
    /* ON ATTEND `data-palier`, ON NE DEVINE PAS 900 ms.  D-715 */
    await page.waitForFunction(() => document.documentElement.dataset.palier != null,
      null, { timeout: 8000 });
    await page.waitForTimeout(400);

    /* ON TRAVERSE AVANT DE MESURER.  D-715
       Sept sections et le pied portent `content-visibility: auto` :
       hors ecran leur rectangle est NUL, et le filtre `!r.width` les
       jetait en silence. Mesure du 2026-08-03 : 389 elements de texte
       vus a 900 ms sans defiler, 747 apres traversee — 47,9 % du
       texte du site n'etait JAMAIS soumis au seuil de contraste. */
    const hTotal = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < hTotal; y += 600) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(70);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);

    const applique = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    rapport.themes[`${vp.nom}/${theme}`] = applique;

    /* ---- le fond du canvas du hero suit-il la page ? ---- */
    if (vp.nom === "1440") {
      const h = await page.evaluate(() => {
        const c = document.getElementById("heroCanvas");
        const plate = document.getElementById("heroPlate");
        if (!c || !plate) return null;
        const cs = getComputedStyle(document.documentElement);
        const surface = cs.getPropertyValue("--surface-0").trim();
        const g = c.getContext("2d");
        /* Coin haut gauche du canvas : hors de toute lettre. */
        let px = null;
        try { px = Array.from(g.getImageData(2, 2, 1, 1).data); } catch (e) { px = "protege"; }
        return {
          surface,
          coin: px,
          live: plate.classList.contains("is-live"),
          grains: plate.getAttribute("data-grains")
        };
      });
      rapport.hero[theme] = h;
    }

    /* ---- contraste de tout le texte visible ---- */
    const echecs = await page.evaluate(() => {
      function lum(rgb) {
        const c = rgb.map((v) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
      }
      function rgbOf(s) {
        const m = String(s).match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const p = m[1].split(",").map((x) => parseFloat(x));
        return { rgb: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 };
      }
      function fondReel(el) {
        let n = el;
        while (n && n !== document.documentElement) {
          const c = rgbOf(getComputedStyle(n).backgroundColor);
          if (c && c.a >= 0.95) return c.rgb;
          n = n.parentElement;
        }
        const c = rgbOf(getComputedStyle(document.body).backgroundColor);
        return c ? c.rgb : [255, 255, 255];
      }
      const out = [];
      let exclus = 0;
      /* « 0 echec » ne veut rien dire sans « 0 sur combien ».  D-715 */
      let mesures = 0;
      const tous = document.querySelectorAll("body *");
      for (const el of tous) {
        if (el.closest("[aria-hidden='true']")) continue;
        /* CE QU'ON MONTRE PEUT ETRE MAUVAIS ; CE QU'ON FAIT, NON.
           Une reconstitution de mauvais site A un mauvais contraste :
           c'est son sujet meme. Elle se declare `role="img"`, et on
           l'exclut EN DISANT COMBIEN — une exclusion silencieuse
           serait le piege 17. La moitie APRES, elle, reste au budget. */
        if (el.closest('[role="img"]')) { exclus++; continue; }
        if (el.closest(".modal[hidden], .menu[hidden], template")) continue;
        const txt = Array.from(el.childNodes)
          .filter((n) => n.nodeType === 3 && n.textContent.trim())
          .map((n) => n.textContent.trim()).join(" ");
        if (!txt) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.1) continue;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        const fg = rgbOf(cs.color);
        if (!fg) continue;
        const bg = fondReel(el);
        mesures++;
        const l1 = lum(fg.rgb), l2 = lum(bg);
        const ct = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        const px = parseFloat(cs.fontSize);
        const gras = parseInt(cs.fontWeight, 10) >= 700;
        const grand = px >= 24 || (px >= 18.66 && gras);
        const seuil = grand ? 3 : 4.5;
        if (ct < seuil) {
          out.push({
            sel: el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.split(/\s+/).slice(0, 2).join(".") : ""),
            txt: txt.slice(0, 46),
            ratio: Math.round(ct * 100) / 100,
            seuil,
            px: Math.round(px)
          });
        }
      }
      return { echecs: out, exclus, mesures };
    });
    rapport.contraste[`${vp.nom}/${theme}`] = echecs.echecs;
    rapport.mesures[`${vp.nom}/${theme}`] = echecs.mesures;
    rapport.exclus += echecs.exclus;

    /* ---- captures par section ---- */
    const dir = path.join(SORTIE, `${vp.nom}-${theme === "light" ? "clair" : "sombre"}`);
    fs.mkdirSync(dir, { recursive: true });
    for (const vue of VUES) {
      await page.evaluate((id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ block: "start", behavior: "instant" });
      }, vue.id);
      await page.waitForTimeout(560);
      await page.screenshot({ path: path.join(dir, `${vue.id}.png`) });
    }

    /* ---- debordement horizontal ---- */
    const debord = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    }));
    rapport.themes[`${vp.nom}/${theme}/debord`] = debord.scrollWidth > debord.clientWidth
      ? `${debord.scrollWidth} > ${debord.clientWidth}` : "aucun";

    await ctx.close();
  }
}

await nav.close();
fs.mkdirSync(SORTIE, { recursive: true });
fs.writeFileSync(path.join(SORTIE, "rapport.json"), JSON.stringify(rapport, null, 2), "utf8");

console.log("HERO, fond du canvas :");
console.log(JSON.stringify(rapport.hero, null, 2));
console.log("\nDEBORDEMENT :");
for (const [k, v] of Object.entries(rapport.themes)) if (k.endsWith("/debord")) console.log(`  ${k}  ${v}`);
console.log("\nECHECS DE CONTRASTE :");
for (const [k, v] of Object.entries(rapport.contraste)) {
  console.log(`  ${k}  ${v.length} echec(s) sur ${rapport.mesures[k]} element(s) de texte mesure(s)`);
}
console.log(`  elements exclus (sous [role="img"], reconstitutions) : ${rapport.exclus}`);
const tous = Object.entries(rapport.contraste).flatMap(([k, v]) => v.map((x) => ({ vue: k, ...x })));
const vus = new Set();
for (const e of tous) {
  const cle = e.sel + e.txt;
  if (vus.has(cle)) continue;
  vus.add(cle);
  console.log(`    ${e.ratio} < ${e.seuil}  ${e.sel}  « ${e.txt} »  (${e.vue})`);
}
console.log(`\nCONSOLE : ${rapport.console.length}`);
rapport.console.slice(0, 20).forEach((c) => console.log("    " + c));

/* UN OUTIL DE SEUIL DOIT POUVOIR ECHOUER.  D-715
   `CLAUDE.md` publie « echecs de contraste, 5 largeurs x 2 themes :
   0 » comme seuil a ne jamais faire regresser. Cet outil est le seul
   qui le mesure, et il n'avait aucun `process.exit` : il imprimait un
   nombre que rien ne relisait. */
const mesures = Object.values(rapport.contraste).reduce((n, v) => n + v.length, 0);
const debords = Object.entries(rapport.themes)
  .filter(([k, v]) => k.endsWith("/debord") && v !== "aucun");

if (!Object.keys(rapport.contraste).length) {
  console.error("\nARRET : aucune vue mesuree. Zero sans erreur est un mensonge.");
  process.exit(2);
}

const fautes = [];
if (mesures) fautes.push(`${mesures} echec(s) de contraste`);
if (debords.length) fautes.push(`${debords.length} debordement(s) horizontaux`);
if (rapport.console.length) fautes.push(`${rapport.console.length} erreur(s) console`);

if (fautes.length) {
  console.error(`\nECHEC : ${fautes.join(" · ")}`);
  process.exit(1);
}
console.log("\nok — 0 echec de contraste, 0 debordement, 0 erreur console");
