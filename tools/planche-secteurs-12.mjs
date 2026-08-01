/* ============================================================
   LA PLANCHE DES DOUZE SECTEURS
   `node tools/planche-secteurs-12.mjs [hauteur]`

   POURQUOI.
   Le test qui decide n'est pas une mesure, c'est le COTE-A-COTE :
   « mets ta capture a cote des trois references ; si on voit laquelle
   est la tienne, elle n'est pas finie. » Ce test ne se fait pas en
   ouvrant douze fichiers l'un apres l'autre — il se fait sur UNE
   image ou les douze se regardent.

   L'outil prend le HAUT de chaque capture pleine page — le premier
   ecran, celui qui decide — et les pose en grille de trois colonnes,
   dans l'ordre du panneau, chacune sous son nom et son entreprise.

   Il ne redimensionne pas les captures a des tailles differentes :
   piege 3, deux images de tailles differentes rendent 100 % d'ecart
   et on ne compare plus rien.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const ENTREE = path.join(ICI, "_demos");
const SORTIE = path.join(RACINE, "preuves", "chantier6-secteurs");
fs.mkdirSync(SORTIE, { recursive: true });

const { chromium } = await import(pathToFileURL(path.join(RACINE, "node_modules/playwright/index.mjs")).href);

const HAUT = Number(process.argv[2] || 760);
if (!Number.isFinite(HAUT) || HAUT < 100) throw new Error(`hauteur illisible : ${process.argv[2]}`);

/* L'ordre est celui du panneau de la section Demos, pas l'ordre
   alphabetique : c'est dans cet ordre que le visiteur les rencontre. */
const DOUZE = [
  { f: "restau-ecran.png", n: "01 · Restauration", e: "CENDRE — reference" },
  { f: "garage-ecran.png", n: "02 · Garage et mecanique", e: "MERIDIEN — reference" },
  { f: "deneigement-ecran.png", n: "03 · Paysagement et deneigement", e: "MV Deneigement" },
  { f: "secteur-construction-ecran.png", n: "04 · Construction et renovation", e: "Construction Lattier" },
  { f: "secteur-immobilier-ecran.png", n: "05 · Immobilier", e: "Ancrage Immobilier" },
  { f: "secteur-boutique-ecran.png", n: "06 · Boutique en ligne", e: "Gres du Nord" },
  { f: "secteur-coiffure-ecran.png", n: "07 · Coiffure et esthetique", e: "Salon Brume" },
  { f: "secteur-gym-ecran.png", n: "08 · Gym et entrainement", e: "Fonte Nord" },
  { f: "secteur-hotel-ecran.png", n: "09 · Hebergement et tourisme", e: "Auberge des Caps" },
  { f: "secteur-clinique-ecran.png", n: "10 · Clinique et sante", e: "Clinique du Riverain" },
  { f: "secteur-juridique-ecran.png", n: "11 · Services juridiques", e: "Cabinet Vallieres" },
  { f: "secteur-photo-ecran.png", n: "12 · Photographe et creatif", e: "Atelier Lumen" }
];

const manquants = DOUZE.filter((d) => !fs.existsSync(path.join(ENTREE, d.f)));
if (manquants.length) throw new Error("captures manquantes : " + manquants.map((d) => d.f).join(", "));

const LARG = 1280, COL = 3, ECH = 0.5;
const cw = Math.round(LARG * ECH), ch = Math.round(HAUT * ECH);
const nav = await chromium.launch();

/* DEUX PASSES, ET LA PREMIERE EST OBLIGATOIRE.
   Charger les douze captures entieres en base64 dans une seule page
   TUE LE NAVIGATEUR : ce sont des images de 14 000 a 26 000 px de
   haut, une centaine de megaoctets de source et plusieurs centaines
   une fois decodees. On decoupe donc d'abord le premier ecran de
   chacune, une page par image, et on ne compose qu'ensuite — sur
   douze vignettes de quelques dizaines de kilo-octets. */
const vues = [];
for (const d of DOUZE) {
  const b64 = fs.readFileSync(path.join(ENTREE, d.f)).toString("base64");
  const pg = await nav.newPage({ viewport: { width: cw, height: ch }, deviceScaleFactor: 1 });
  await pg.setContent(
    `<body style="margin:0;overflow:hidden"><img id="i" style="width:${cw}px;display:block"` +
    ` src="data:image/png;base64,${b64}"><script>document.getElementById("i").onload=()=>document.title="pret"</script></body>`
  );
  await pg.waitForFunction(() => document.title === "pret", null, { timeout: 120000 });
  const shot = await pg.screenshot();
  await pg.close();
  vues.push({ ...d, data: "data:image/png;base64," + shot.toString("base64") });
  console.log("  ·", d.n);
}

const p = await nav.newPage({
  viewport: { width: COL * cw + (COL + 1) * 24, height: Math.ceil(DOUZE.length / COL) * (ch + 58) + 96 },
  deviceScaleFactor: 1
});

await p.setContent(`<style>
  body{margin:0;background:#1b1b1b;font:12px/1.3 ui-monospace,Consolas,monospace;color:#dcdcdc;padding:24px}
  h1{font-size:14px;letter-spacing:.16em;text-transform:uppercase;color:#fff;margin:0 0 20px}
  .g{display:grid;grid-template-columns:repeat(${COL},${cw}px);gap:24px}
  figure{margin:0}
  .c{width:${cw}px;height:${ch}px;overflow:hidden;border:1px solid #444;background:#000}
  .c img{width:${cw}px;height:${ch}px;display:block}
  figcaption{padding-top:6px}
  b{display:block;color:#fff;font-weight:400;letter-spacing:.08em}
  span{display:block;color:#8f8f8f}
</style>
<h1>Les douze secteurs — premier ecran, meme largeur, meme echelle</h1>
<div class="g">${vues.map((v) => `<figure>
  <div class="c"><img src="${v.data}"></div>
  <figcaption><b>${v.n}</b><span>${v.e}</span></figcaption>
</figure>`).join("")}</div>`);

await p.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth), null, { timeout: 120000 });
await p.waitForTimeout(600);
const dest = path.join(SORTIE, "planche-douze.png");
await p.screenshot({ path: dest, fullPage: true });
console.log("planche :", path.relative(RACINE, dest), `· ${DOUZE.length} secteurs · premier ecran de ${HAUT} px a l'echelle ${ECH}`);
await nav.close();
