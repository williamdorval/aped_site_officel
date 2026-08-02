/* ============================================================
   LES PLANCHES D'UNE SECTION — cinq largeurs, deux themes.
   `node tools/plaques.mjs <ancre> <nom> [--reduit]`

   Exemple : `node tools/plaques.mjs visite 2026-08-03-visite/apres`

   POURQUOI ELLE PHOTOGRAPHIE EN MOUVEMENT PLEIN.  D-629
   Toutes les planches du depot photographiaient en mouvement
   REDUIT (piege 81). Or `html.sas-ok` se decide dans le `<head>`
   avec `!prefers-reduced-motion` : en mouvement reduit, la geometrie
   des sas N'EXISTE PAS. Une planche en mouvement reduit ne peut donc
   pas voir un defaut de sas — et il y en avait un qui rendait la
   section Visite entierement noire, pendant que toutes les planches
   la declaraient saine. Par defaut on photographie donc en mouvement
   PLEIN ; `--reduit` reste disponible pour comparer.

   TROIS PIEGES DEJA PAYES, ET LA PARADE.
     · piege 80 — un `scrollTo` vers une section n'y arrive jamais
       quand les sas grandissent la page. On traverse tout une fois
       (ce qui fixe la hauteur), puis on PILOTE au pas en lisant la
       position reelle a chaque tour.
     · piege 44 — `fullPage` ne photographie pas une scene epinglee.
       On capture ecran par ecran, en defilant.
     · piege 67 — une bande plate n'est pas une capture plate. On
       rend le RELIEF (ecart-type de luminance) de chaque ecran :
       c'est lui qui dit si quelque chose est peint, pas le fait
       qu'un fichier existe.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");

const ANCRES = (process.argv[2] || "").split(",").filter(Boolean);
const NOM = process.argv[3];
const REDUIT = process.argv.includes("--reduit");
const argBase = process.argv.find((a) => a.startsWith("--base="));
const BASE = argBase ? argBase.slice(7) : "http://localhost:8099/";
/* `--palier=2` force l'escalade APRES la traversee, ce qui declenche
   la garde de `sas.js`. C'est le seul etat ou le volet du calque
   couvrait la section precedente (D-629), et aucune planche du depot
   ne pouvait le voir : elles photographiaient toutes en mouvement
   reduit, ou `sas-ok` n'est jamais posee. */
const argPalier = process.argv.find((a) => a.startsWith("--palier="));
const PALIER = argPalier ? argPalier.slice(9) : null;

if (!ANCRES.length || !NOM) {
  console.error("usage : node tools/plaques.mjs <ancre[,ancre...]> <nom> [--reduit] [--base=URL]");
  process.exit(2);
}

const SORTIE = path.join(RACINE, "preuves", NOM);
fs.mkdirSync(SORTIE, { recursive: true });

const VUES = [
  { w: 390, h: 844 },
  { w: 768, h: 1024 },
  { w: 1024, h: 768 },
  { w: 1440, h: 900 },
  { w: 1920, h: 1080 },
];
const THEMES = ["light", "dark"];

/* == Lecture PNG minimale, sans dependance ==  (reprise de visite-sequence) */
function pixels(fichier) {
  const buf = fs.readFileSync(fichier);
  let i = 8, largeur = 0, hauteur = 0, profondeur = 0, couleur = 0;
  const morceaux = [];
  while (i < buf.length) {
    const taille = buf.readUInt32BE(i);
    const type = buf.toString("ascii", i + 4, i + 8);
    const data = buf.subarray(i + 8, i + 8 + taille);
    if (type === "IHDR") {
      largeur = data.readUInt32BE(0); hauteur = data.readUInt32BE(4);
      profondeur = data[8]; couleur = data[9];
    } else if (type === "IDAT") morceaux.push(data);
    else if (type === "IEND") break;
    i += taille + 12;
  }
  if (profondeur !== 8 || (couleur !== 6 && couleur !== 2)) {
    throw new Error(`PNG non gere : profondeur ${profondeur}, couleur ${couleur}`);
  }
  const canaux = couleur === 6 ? 4 : 3;
  const brut = zlib.inflateSync(Buffer.concat(morceaux));
  const ligne = largeur * canaux;
  const out = Buffer.alloc(hauteur * ligne);
  let s = 0;
  for (let y = 0; y < hauteur; y++) {
    const filtre = brut[s++];
    const dep = y * ligne;
    for (let x = 0; x < ligne; x++) {
      const cru = brut[s + x];
      const a = x >= canaux ? out[dep + x - canaux] : 0;
      const b = y > 0 ? out[dep - ligne + x] : 0;
      const c = x >= canaux && y > 0 ? out[dep - ligne + x - canaux] : 0;
      let v;
      if (filtre === 0) v = cru;
      else if (filtre === 1) v = cru + a;
      else if (filtre === 2) v = cru + b;
      else if (filtre === 3) v = cru + ((a + b) >> 1);
      else {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v = cru + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      }
      out[dep + x] = v & 255;
    }
    s += ligne;
  }
  return { largeur, hauteur, canaux, data: out };
}

/* Relief = ecart-type de luminance. Un aplat rend ~0 ; une piece
   photographiee rend 40 a 70. Sous 8, la surface est morte. */
function relief(img, x0, y0, x1, y1) {
  const { largeur, canaux, data } = img;
  let n = 0, s = 0, s2 = 0;
  for (let y = Math.max(0, y0); y < Math.min(img.hauteur, y1); y += 2) {
    for (let x = Math.max(0, x0); x < Math.min(largeur, x1); x += 2) {
      const o = (y * largeur + x) * canaux;
      const l = 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2];
      n++; s += l; s2 += l * l;
    }
  }
  if (!n) return 0;
  const m = s / n;
  return Math.sqrt(Math.max(0, s2 / n - m * m));
}

const nav = await chromium.launch({
  args: ["--enable-unsafe-swiftshader", "--disable-gpu-compositing"],
});

const lignes = [];
let pire = { relief: Infinity, ou: "—" };

for (const vue of VUES) {
  for (const theme of THEMES) {
    const ctx = await nav.newContext({
      viewport: { width: vue.w, height: vue.h },
      reducedMotion: REDUIT ? "reduce" : "no-preference",
    });
    const page = await ctx.newPage();
    const erreurs = [];
    page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
    await page.addInitScript((t) => {
      try {
        localStorage.setItem("aped-theme", t);
        sessionStorage.setItem("aped-sans-popup", "1");
      } catch (e) {}
    }, theme);

    await page.goto(BASE, { waitUntil: "load" });
    await page.waitForTimeout(1100);
    /* Reveil de la vague 2 : premier geste. Le pointeur est pose au
       bord gauche, HORS de toute zone qui porte une etiquette de
       pointe — sinon elle se peint dans la planche. */
    await page.mouse.move(4, 4);
    await page.waitForTimeout(1700);

    /* piege 80 — la traversee fixe la hauteur definitive de la page. */
    let y = 0;
    for (let i = 0; i < 500; i++) {
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      if (y >= h) break;
      y += Math.round(vue.h * 0.5);
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(35);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    if (PALIER) {
      await page.evaluate((p) => document.documentElement.setAttribute("data-palier", p), PALIER);
      await page.waitForTimeout(700);
    }

    /* Une charge de page, une traversee, puis chaque ancre a son
       tour : cinq sections en dix contextes au lieu de cinquante. */
    for (const ancre of ANCRES) {
      const sel = "#" + ancre;
      const existe = await page.evaluate((s) => !!document.querySelector(s), sel);
      if (!existe) { lignes.push({ nom: `${ancre} ABSENTE`, relief: 0, cale: false, erreurs: 0, hauteur: 0 }); continue; }

      let cale = false;
      for (let i = 0; i < 200; i++) {
        const dy = await page.evaluate(
          (s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().y) : 0; }, sel);
        if (Math.abs(dy) <= 6) { cale = true; break; }
        await page.evaluate((d) => window.scrollBy(0, d), Math.max(-700, Math.min(700, dy)));
        await page.waitForTimeout(55);
      }
      await page.waitForTimeout(600);

      /* ON PHOTOGRAPHIE LA SECTION, PAS LE SAS QUI PASSE DESSUS.
         Le volet du calque couvre le haut du Calculateur et se degage
         au defilement : cale pile au sommet de la section, on
         photographie 17 % d'encre. Ce n'est pas un defaut — c'est le
         geste en cours — mais ce n'est pas la section. On avance
         jusqu'a ce que le volet soit passe, sans jamais depasser un
         demi-ecran. */
      for (let i = 0; i < 8; i++) {
        const couvre = await page.evaluate(() => {
          const v = document.querySelector(".sas--calque .sas-volet");
          if (!v) return 0;
          const r = v.getBoundingClientRect();
          return r.bottom > 4 && r.top < innerHeight ? Math.ceil(r.bottom) : 0;
        });
        if (!couvre) break;
        await page.evaluate((d) => window.scrollBy(0, d), Math.min(couvre + 8, Math.round(vue.h / 8)));
        await page.waitForTimeout(120);
      }
      await page.waitForTimeout(400);

      const haut = await page.evaluate((s) => {
        const e = document.querySelector(s);
        return { h: Math.round(e.getBoundingClientRect().height) };
      }, sel);

      /* piege 44 — ecran par ecran, jamais `fullPage`. */
      const ecrans = Math.max(1, Math.min(4, Math.ceil(haut.h / vue.h)));
      for (let n = 0; n < ecrans; n++) {
        if (n > 0) {
          await page.evaluate((d) => window.scrollBy(0, d), vue.h);
          await page.waitForTimeout(450);
        }
        const nom = `${ancre}-${vue.w}-${theme === "light" ? "clair" : "sombre"}-${n + 1}.png`;
        const chemin = path.join(SORTIE, nom);
        await page.screenshot({ path: chemin });
        const img = pixels(chemin);
        const r = relief(img, 0, 0, img.largeur, img.hauteur);
        lignes.push({ nom, relief: r, cale, erreurs: erreurs.length, hauteur: haut.h });
        if (r < pire.relief) pire = { relief: r, ou: nom };
      }
    }
    await ctx.close();
  }
}
await nav.close();

console.log(`\n=== ${NOM} · ${ANCRES.join(" · ")} · mouvement ${REDUIT ? "REDUIT" : "PLEIN"} ===\n`);
console.log("fichier".padEnd(26) + "relief".padStart(8) + "  hauteur".padStart(10) + "  cale  err");
for (const l of lignes) {
  console.log(
    l.nom.padEnd(26) + l.relief.toFixed(1).padStart(8) +
    String(l.hauteur).padStart(10) + "  " + (l.cale ? " oui" : " NON") + "  " + l.erreurs
  );
}
console.log(`\n${lignes.length} images · pire relief ${pire.relief.toFixed(1)} sur ${pire.ou}`);
const morts = lignes.filter((l) => l.relief < 8);
const jamais = lignes.filter((l) => !l.cale);
const bruit = lignes.reduce((a, l) => a + l.erreurs, 0);
console.log(`surfaces mortes (relief < 8) : ${morts.length}`);
console.log(`sections jamais calees        : ${jamais.length}`);
console.log(`erreurs console               : ${bruit}`);
if (morts.length || jamais.length || bruit) {
  morts.forEach((m) => console.log("  MORTE  " + m.nom));
  jamais.forEach((m) => console.log("  PAS CALEE  " + m.nom));
  process.exit(1);
}
console.log("\nok");
