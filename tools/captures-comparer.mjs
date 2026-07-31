/* ============================================================
   COMPARAISON DE PLANCHES DE CAPTURES
   `node tools/captures-comparer.mjs <A> <B> [seuil]`
   `node tools/captures-comparer.mjs --avant A1,A2 --apres B1,B2`

   FORME SIMPLE : apparie les PNG de deux planches par chemin relatif
   et rend, pour chacun, le pourcentage de pixels qui different de
   plus de `seuil`. Un fichier present d'un seul cote est compte comme
   une difference.

   FORME A DEUX GROUPES — LA SEULE QUI RENDE UN VERDICT.
   Une planche de captures a un PLANCHER DE BRUIT : des images
   bougent d'une passe a l'autre sans qu'une ligne de code ait change.
   Mesure du 2026-07-30 avec `captures-fixe.mjs` : 3 images sur 130,
   toutes a `768-sombre`. Comparer une passe « avant » a une passe
   « apres » sans soustraire ce bruit, c'est appeler defaut ce qui
   n'est qu'une seconde d'horloge.

   Avec deux passes de chaque cote, l'outil fait la soustraction
   lui-meme : il declare BRUIT toute image qui bouge a l'interieur
   d'un groupe, puis ne rend son verdict que sur les autres.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { diffStats, lire } from "./_png.mjs";

const args = process.argv.slice(2);
const GROUPES = args.includes("--avant") && args.includes("--apres");
const A = GROUPES ? null : args[0];
const B = GROUPES ? null : args[1];
/* PIEGE. `Number("--avant")` rend NaN, et toute comparaison avec NaN est
   FAUSSE : `diffStats` ne compte alors plus aucun pixel et l'outil rend
   « aucune difference » sur n'importe quoi. Un seuil illisible doit
   arreter l'outil, jamais retomber sur une valeur silencieuse. */
const brut = GROUPES
  ? (args.includes("--seuil") ? args[args.indexOf("--seuil") + 1] : "8")
  : (args[2] !== undefined ? args[2] : "8");
const SEUIL = Number(brut);
if (!Number.isFinite(SEUIL) || SEUIL < 0) {
  console.log(`seuil illisible : « ${brut} ». Attendu un entier 0-255.`);
  process.exit(2);
}

function pngs(racine, base = "") {
  const res = [];
  for (const e of fs.readdirSync(path.join(racine, base), { withFileTypes: true })) {
    const rel = base ? path.join(base, e.name) : e.name;
    if (e.isDirectory()) res.push(...pngs(racine, rel));
    else if (e.name.toLowerCase().endsWith(".png")) res.push(rel.replace(/\\/g, "/"));
  }
  return res;
}

function ecart(a, b, f) {
  const x = lire(fs, path.join(a, f)), y = lire(fs, path.join(b, f));
  if (x.width !== y.width || x.height !== y.height) return { taille: false, pct: 100 };
  return { taille: true, pct: diffStats(x, y, SEUIL).pct };
}

if (GROUPES) {
  const av = args[args.indexOf("--avant") + 1].split(",");
  const ap = args[args.indexOf("--apres") + 1].split(",");
  if (av.length < 2 || ap.length < 2) {
    console.log("Il faut AU MOINS DEUX passes de chaque cote : c'est ce qui mesure le bruit.");
    process.exit(2);
  }
  const liste = pngs(av[0]);
  const paires = [];
  for (const g of [av, ap]) for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) paires.push([g[i], g[j]]);

  const bruit = new Map();
  for (const f of liste) {
    let pire = 0;
    for (const [x, y] of paires) { try { const d = ecart(x, y, f); if (d.pct > pire) pire = d.pct; } catch (e) { /* planche incomplete */ } }
    if (pire > 0) bruit.set(f, pire);
  }

  let bougent = 0, pire = 0, nom = "";
  const detail = [];
  for (const f of liste) {
    if (bruit.has(f)) continue;
    const d = ecart(av[0], ap[0], f);
    if (d.pct > 0) { bougent++; detail.push(`  ${f}  ${d.pct.toFixed(4)} %`); if (d.pct > pire) { pire = d.pct; nom = f; } }
  }

  console.log(`seuil par canal : ${SEUIL}/255   paires de controle : ${paires.length}\n`);
  console.log(`PLANCHER DE BRUIT — images qui bougent a code IDENTIQUE : ${bruit.size} / ${liste.length}`);
  for (const [f, p] of [...bruit].sort((x, y) => y[1] - x[1])) console.log(`  ${f.padEnd(34)} jusqu'a ${p} %`);
  console.log(`\nVERDICT, sur les ${liste.length - bruit.size} images STABLES :`);
  console.log(`  images qui different : ${bougent}`);
  console.log(`  pire : ${pire.toFixed(4)} % ${nom || "—"}`);
  if (detail.length) console.log(detail.slice(0, 30).join("\n"));
  console.log(`\n${bougent === 0 ? "AUCUNE DIFFERENCE VISIBLE" : "DIFFERENCES — a expliquer une par une"}`);
  process.exit(bougent === 0 ? 0 : 1);
}

const la = new Set(pngs(A));
const lb = new Set(pngs(B));
const communs = [...la].filter((f) => lb.has(f)).sort();
const seulA = [...la].filter((f) => !lb.has(f));
const seulB = [...lb].filter((f) => !la.has(f));

let differents = 0, pire = 0, pireNom = "", tailleDiff = 0;
const details = [];

for (const f of communs) {
  const a = lire(fs, path.join(A, f));
  const b = lire(fs, path.join(B, f));
  if (a.width !== b.width || a.height !== b.height) {
    tailleDiff++;
    details.push(`  ${f}  TAILLE  ${a.width}x${a.height} contre ${b.width}x${b.height}`);
    continue;
  }
  const d = diffStats(a, b, SEUIL);
  const pct = d.pct !== undefined ? d.pct : (d.differents / d.total * 100);
  if (pct > 0) {
    differents++;
    details.push(`  ${f}  ${pct.toFixed(4)} %`);
  }
  if (pct > pire) { pire = pct; pireNom = f; }
}

console.log(`PLANCHES : ${A}  contre  ${B}`);
console.log(`seuil de difference par canal : ${SEUIL}/255\n`);
console.log(`images appariees            : ${communs.length}`);
console.log(`images de taille differente : ${tailleDiff}`);
console.log(`images qui different        : ${differents}`);
console.log(`pire image                  : ${pire.toFixed(4)} %  ${pireNom || "—"}`);
if (seulA.length) console.log(`\nseulement dans ${A} : ${seulA.length}\n  ${seulA.slice(0, 12).join("\n  ")}`);
if (seulB.length) console.log(`\nseulement dans ${B} : ${seulB.length}\n  ${seulB.slice(0, 12).join("\n  ")}`);
if (details.length) { console.log(`\nDETAIL :`); console.log(details.slice(0, 40).join("\n")); }
console.log(`\nVERDICT : ${differents === 0 && tailleDiff === 0 && !seulA.length && !seulB.length ? "AUCUNE DIFFERENCE VISIBLE" : "DIFFERENCES — a expliquer une par une"}`);
process.exit(differents === 0 && tailleDiff === 0 ? 0 : 1);
