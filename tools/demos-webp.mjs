/* ============================================================
   LES CAPTURES DES VRAIS SITES, PRETES POUR LA PAGE
   `node tools/demos-webp.mjs [largeur] [qualite]`

   Entree  : `tools/_demos/<cle>-ecran.png` — la capture PLEINE PAGE
             d'un des quatre projets, prise a 1 280 px de large en
             densite 1,5, coordonnees masquees a la prise de vue.
             C'est `demos-capture.mjs --ecran` qui la fabrique.
   Sortie  : `images/realisations/apres-<cle>.webp`

   TROIS DECISIONS, ET AUCUNE N'EST DE CONFORT.

   1. LA LARGEUR DE PRISE DE VUE, 1 280 px.  D-631
      Les versions precedentes photographiaient a 760 px : la largeur
      d'une TABLETTE. Les quatre sites y rendent leur mise en page
      etroite — un titre par ligne, des cartes empilees, une
      typographie de 60 px. Reduit dans un cadre de 460 px, ca ne se
      lit pas comme un site, ca se lit comme un GROS PLAN. C'est le
      defaut principal releve par le proprietaire, et il ne se
      corrigeait pas en recadrant : il fallait rephotographier.

   2. LA HAUTEUR EST CELLE DE LA RECONSTITUTION D'EN FACE.  D-632
      Une comparaison avant / apres n'a de sens que si les deux cotes
      finissent a la meme ligne : sinon la poignee compare, a une
      hauteur donnee, le pied d'un site avec le milieu de l'autre.
      Le rapport hauteur / largeur de chaque reconstitution « avant »
      est releve dans la page (`tools/ba-check.mjs`), pas devine, et
      il est STABLE a 2 % pres de 390 a 1920 px de large.
      Consequence assumee : on ne montre pas les 10 000 px du vrai
      site, on en montre autant que le vieux site en avait. Le
      visiteur DEFILE dedans, ce qu'il ne pouvait pas faire avant.

   3. LE POIDS. Ces images sont differees et vivent loin sous la
      ligne de flottaison, mais elles restent des octets servis
      depuis ce serveur. Elles sortent a 820 px de large — le cadre
      en fait 460 au plus large reglage de la grille — et sont
      encodees en WebP par le navigateur lui-meme : aucune
      dependance nouvelle, et le site continue de ne dependre de
      rien.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RAPPORTS } from "./demos-rapports.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const ENTREE = path.join(ICI, "_demos");
const SORTIE = path.join(RACINE, "images", "realisations");
const LARGEUR = Number(process.argv[2] || 820);
const QUALITE = Number(process.argv[3] || 0.68);
if (!Number.isFinite(LARGEUR) || !Number.isFinite(QUALITE)) {
  throw new Error("largeur ou qualite illisible — un parametre NaN rend n'importe quoi (piege 30)");
}
fs.mkdirSync(SORTIE, { recursive: true });

/* Les rapports vivent dans `demos-rapports.mjs` : la capture et la
   conversion doivent lire le MEME chiffre, sinon les deux cotes ne
   finissent plus a la meme ligne et rien ne le dit.  D-632 */

const sources = fs.readdirSync(ENTREE).filter((f) => f.endsWith("-ecran.png"));
if (!sources.length) throw new Error("aucune capture `-ecran.png` dans tools/_demos — lancer `node tools/demos-capture.mjs --ecran`");

const nav = await chromium.launch();
const page = await nav.newPage();
const R = [];

for (const f of sources) {
  const cle = f.replace("-ecran.png", "");
  const rapport = RAPPORTS[cle];
  if (!Number.isFinite(rapport)) {
    throw new Error(`${cle} : aucun rapport releve. Un parametre illisible doit ARRETER l'outil (piege 30).`);
  }
  const brut = fs.readFileSync(path.join(ENTREE, f));
  const b64 = brut.toString("base64");
  const res = await page.evaluate(async ({ b64, LARGEUR, QUALITE, rapport }) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    /* La couture arrondit sa hauteur en pixels CSS puis la multiplie
       par la densite ; ici on arrondit apres avoir multiplie. Les
       deux chemins peuvent differer d'un pixel — ce n'est pas une
       capture trop courte, c'est le meme nombre arrondi deux fois.
       Au-dela de quatre pixels, en revanche, la capture ne porte pas
       ce qu'on lui demande et l'outil s'arrete. */
    const voulu = Math.round(img.naturalWidth * rapport);
    if (voulu - img.naturalHeight > 4) {
      throw new Error(`la capture ne fait que ${img.naturalHeight} px : il en faut ${voulu} pour tenir le rapport ${rapport}`);
    }
    const hSource = Math.min(voulu, img.naturalHeight);
    const h = Math.round(LARGEUR * rapport);
    /* UN `drawImage` QUI DIVISE PAR PLUS DE DEUX D'UN COUP ALIASE.
       On reduit par demi-pas successifs, comme `secteurs-photos.mjs`. */
    let cw = img.naturalWidth, ch = hSource;
    let src = document.createElement("canvas");
    src.width = cw; src.height = ch;
    src.getContext("2d").drawImage(img, 0, 0, cw, ch, 0, 0, cw, ch);
    while (cw / 2 > LARGEUR) {
      const nw = Math.round(cw / 2), nh = Math.round(ch / 2);
      const c2 = document.createElement("canvas");
      c2.width = nw; c2.height = nh;
      const x2 = c2.getContext("2d");
      x2.imageSmoothingQuality = "high";
      x2.drawImage(src, 0, 0, nw, nh);
      src = c2; cw = nw; ch = nh;
    }
    const c = document.createElement("canvas");
    c.width = LARGEUR; c.height = h;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(src, 0, 0, cw, ch, 0, 0, LARGEUR, h);

    /* UNE CAPTURE UNIFORME N'EST PAS UNE CAPTURE.  D-614
       Un des quatre sites a rendu une bande entierement noire —
       5 Ko de WebP, une image vide, et rien dans le rapport pour le
       dire. On mesure donc l'etalement des valeurs : si l'image
       tient dans une poignee de teintes, l'outil s'arrete au lieu de
       livrer du vide en silence.
       On mesure AUSSI par tranches : une capture peut etre riche en
       haut et noire en bas, et une moyenne d'ensemble le cache. */
    const lire = (y0, y1) => {
      const px = ctx.getImageData(0, y0, LARGEUR, y1 - y0).data;
      let somme = 0, n = 0;
      const vals = [];
      for (let i = 0; i < px.length; i += 4 * 61) {
        const l = (px[i] * 299 + px[i + 1] * 587 + px[i + 2] * 114) / 1000;
        vals.push(l); somme += l; n++;
      }
      const moy = somme / n;
      let va = 0;
      for (const l of vals) va += (l - moy) * (l - moy);
      return { moy: +moy.toFixed(1), ec: +Math.sqrt(va / n).toFixed(1) };
    };
    const tranches = [];
    const T = 6;
    for (let t = 0; t < T; t++) {
      tranches.push(lire(Math.floor((h * t) / T), Math.floor((h * (t + 1)) / T)));
    }
    const url = c.toDataURL("image/webp", QUALITE);
    if (url.indexOf("data:image/webp") !== 0) throw new Error("le moteur n'a pas encode en WebP");
    return { url, w: LARGEUR, h, sourceW: img.naturalWidth, sourceH: img.naturalHeight, coupeA: hSource, tranches };
  }, { b64, LARGEUR, QUALITE, rapport });

  const pire = res.tranches.reduce((a, b) => (b.ec < a.ec ? b : a));
  if (pire.ec < 6) {
    throw new Error(`${cle} : une tranche de la capture est PLATE (ecart-type ${pire.ec}, moyenne ${pire.moy}). ` +
      "C'est une bande vide, pas une page. Reprendre la capture avant de convertir.");
  }
  const bin = Buffer.from(res.url.split(",")[1], "base64");
  const dest = path.join(SORTIE, `apres-${cle}.webp`);
  fs.writeFileSync(dest, bin);
  R.push({
    cle,
    source: `${res.sourceW}x${res.sourceH}`,
    rapport,
    coupeA: res.coupeA,
    rendu: `${res.w}x${res.h}`,
    ko: Math.round(bin.length / 1024),
    ecMin: pire.ec,
    fichier: path.relative(RACINE, dest).replace(/\\/g, "/")
  });
}

await nav.close();
console.table(R);
console.log("TOTAL :", R.reduce((a, b) => a + b.ko, 0), "Ko pour", R.length, "images");
