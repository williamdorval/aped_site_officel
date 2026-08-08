/* ============================================================
   LE SAS « ESSAYEZ » SE VOIT-IL ENCORE APRES LE RACCOURCI ?
   `node tools/sas-sequence.mjs [nom] [--base=URL]`

   La course est passee de 240vh a 150vh (D-630). Le point
   d'epinglage d'une scene collante vaut 100vh / course : il est
   passe de 0,42 a 0,67. Des bornes de choregraphie ecrites en dur
   pour 0,42 auraient joue toute la forge AVANT l'epinglage — donc
   hors de l'ecran (piege 35), et le sas raccourci n'aurait plus rien
   montre du tout.

   REGLE B DU PROJET : au moins cinq images entre le debut et la fin,
   et l'ECART DE PIXELS entre deux consecutives. Dix images ne font
   pas un mouvement (piege 54).

   Ce que l'outil rend, par image : le RELIEF (ecart-type de
   luminance — un aplat noir rend ~0) et l'ecart avec la precedente.
   Constats : la forge se voit (au moins quatre images de relief
   franc), le mot est la a la fin, et rien ne se joue hors champ.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const NOM = (process.argv[2] && !process.argv[2].startsWith("--")) ? process.argv[2] : "sas-sequence";
const argBase = process.argv.find((a) => a.startsWith("--base="));
const BASE = argBase ? argBase.slice(7) : "http://localhost:8099/";
const SORTIE = path.join(RACINE, "preuves", NOM);
fs.mkdirSync(SORTIE, { recursive: true });
const VUE = { width: 1440, height: 900 };

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

/* La scene occupe la colonne, pas le rail : on mesure a droite de
   296 px, et sous la barre fixe de 56 px. */
const ZONE = { x0: 300, y0: 60, x1: 1436, y1: 896 };

function relief(img) {
  const { largeur, canaux, data } = img;
  let n = 0, s = 0, s2 = 0;
  for (let y = ZONE.y0; y < ZONE.y1; y += 2) {
    for (let x = ZONE.x0; x < ZONE.x1; x += 2) {
      const o = (y * largeur + x) * canaux;
      const l = 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2];
      n++; s += l; s2 += l * l;
    }
  }
  const m = s / n;
  return Math.sqrt(Math.max(0, s2 / n - m * m));
}

function ecart(a, b) {
  const { largeur, canaux, data: da } = a;
  const db = b.data;
  let n = 0, diff = 0;
  for (let y = ZONE.y0; y < ZONE.y1; y += 2) {
    for (let x = ZONE.x0; x < ZONE.x1; x += 2) {
      const o = (y * largeur + x) * canaux;
      const d = Math.abs(da[o] - db[o]) + Math.abs(da[o + 1] - db[o + 1]) + Math.abs(da[o + 2] - db[o + 2]);
      n++; if (d > 24) diff++;
    }
  }
  return (diff / n) * 100;
}

const nav = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--disable-gpu-compositing"] });
const ctx = await nav.newContext({ viewport: VUE });
const page = await ctx.newPage();
const erreurs = [];
page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
await page.addInitScript(() => { try { sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {} });
await page.goto(BASE, { waitUntil: "load" });
await page.waitForTimeout(1100);
await page.mouse.move(4, 4);
await page.waitForTimeout(1700);

/* piege 80 — la traversee fixe la hauteur definitive. */
let y = 0;
for (let i = 0; i < 500; i++) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  if (y >= h) break;
  y += 450;
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(35);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);

/* Ou commence et finit la course du sas de descente ? */
const bornes = await page.evaluate(() => {
  const piste = document.querySelector('.sas[data-sas="descente"] .sas-piste');
  const r = piste.getBoundingClientRect();
  const haut = r.y + scrollY;
  return {
    /* progression 0 : le haut de la piste touche le BAS de la fenetre */
    debut: Math.round(haut - innerHeight),
    /* progression 1 : le bas de la piste touche le bas de la fenetre */
    fin: Math.round(haut + r.height - innerHeight),
    hauteur: Math.round(r.height),
    epingle: +(innerHeight / r.height).toFixed(3),
  };
});
console.log(`piste ${bornes.hauteur} px (${(bornes.hauteur / VUE.height).toFixed(2)} vh) · epinglage a p = ${bornes.epingle}`);
console.log(`course de defilement : ${bornes.debut} → ${bornes.fin}  (${bornes.fin - bornes.debut} px)\n`);

/* `--n=` : nombre d'images. `--zone=a,b` : ne parcourir qu'une part
   de la course — la fenetre EPINGLEE est le seul endroit ou la
   forge se joue, et neuf images sur toute la course n'y en mettent
   que trois. */
const argN = process.argv.find((a) => a.startsWith("--n="));
const argZ = process.argv.find((a) => a.startsWith("--zone="));
const N = argN ? +argN.slice(4) : 9;
const [Z0, Z1] = argZ ? argZ.slice(7).split(",").map(Number) : [0, 1];

const images = [];
for (let i = 0; i < N; i++) {
  const p = Z0 + (Z1 - Z0) * (i / (N - 1));
  const cible = Math.round(bornes.debut + (bornes.fin - bornes.debut) * p);
  /* On defile PAR PAS jusqu'a la cible : un saut casse un pin
     ScrollTrigger (piege 5). */
  let cur = await page.evaluate(() => Math.round(scrollY));
  while (Math.abs(cur - cible) > 8) {
    const d = Math.max(-400, Math.min(400, cible - cur));
    await page.evaluate((v) => window.scrollBy(0, v), d);
    await page.waitForTimeout(30);
    cur = await page.evaluate(() => Math.round(scrollY));
  }
  /* Le scrub est LISSE (0,45 s de rattrapage) : il faut le laisser
     converger, sinon on photographie un etat en retard. */
  await page.waitForTimeout(900);

  const etat = await page.evaluate(() => {
    const mot = document.querySelector("[data-sas-mot]");
    const scene = document.querySelector('.sas[data-sas="descente"] .sas-scene');
    const cv = document.querySelector("[data-sas-forge]");
    const r = scene.getBoundingClientRect();
    return {
      motLa: mot.classList.contains("est-la"),
      motVisible: getComputedStyle(mot).visibility === "visible",
      sceneY: Math.round(r.y),
      sceneH: Math.round(r.height),
      canvas: cv ? { w: cv.width, h: cv.height, y: Math.round(cv.getBoundingClientRect().y) } : null,
    };
  });

  const nom = `${String(i + 1).padStart(2, "0")}-p${p.toFixed(2)}.png`;
  const chemin = path.join(SORTIE, nom);
  await page.screenshot({ path: chemin });
  const img = pixels(chemin);
  images.push({ nom, p, img, relief: relief(img), etat, y: cur });
}

console.log("image".padEnd(16) + "relief".padStart(8) + "ecart%".padStart(9) +
  "  scene-y  mot   canvas-y");
let bouge = 0;
for (let i = 0; i < images.length; i++) {
  const a = images[i];
  const e = i ? ecart(images[i - 1].img, a.img) : 0;
  if (i && e > 1) bouge++;
  console.log(
    a.nom.padEnd(16) + a.relief.toFixed(1).padStart(8) +
    (i ? e.toFixed(2) : "—").padStart(9) +
    String(a.etat.sceneY).padStart(9) +
    (a.etat.motVisible ? "  MOT " : "   ·  ") +
    String(a.etat.canvas ? a.etat.canvas.y : "—").padStart(9)
  );
}

const dansLeChamp = images.filter((a) => a.etat.sceneY > -50 && a.etat.sceneY < VUE.height - 50);
const motFinal = images[images.length - 1].etat.motVisible || images[images.length - 2].etat.motVisible;
console.log(`\nimages ou la scene est dans le champ : ${dansLeChamp.length} / ${N}`);
console.log(`paires au-dessus de 1 % de mouvement  : ${bouge} / ${N - 1}`);
console.log(`le mot est la en fin de course        : ${motFinal ? "oui" : "NON"}`);
console.log(`erreurs console                       : ${erreurs.length}`);
erreurs.slice(0, 4).forEach((e) => console.log("  " + e));

await nav.close();
const mal = (dansLeChamp.length < 5) + (bouge < 4) + (!motFinal) + (erreurs.length > 0);
process.exit(mal ? 1 : 0);
