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
const MARQUES = {};

for (const f of sources) {
  const cle = f.replace("-ecran.png", "");
  /* ON NE COUPE PLUS AU RAPPORT DE LA RECONSTITUTION.  D-643
     La regle « les deux cotes finissent a la meme ligne » etait
     juste ; la maniere de la tenir ne l'etait pas. En coupant
     l'« apres », on montrait 14 % du site du garage et 26 % de celui
     du restaurant, et le visiteur se retrouvait bloque au pied du
     site de 2011 avec huit mille pixels de site neuf jamais vus.
     Les deux cotes sont maintenant ENTIERS, et le verrou se fait en
     POURCENTAGE dans la page (D-645). `RAPPORTS` ne sert donc plus a
     decouper : il reste la parce que `ba-check.mjs § 6` s'en sert
     pour dire si une reconstitution a change de hauteur. */
  const rapport = RAPPORTS[cle];
  const brut = fs.readFileSync(path.join(ENTREE, f));
  const b64 = brut.toString("base64");
  const res = await page.evaluate(async ({ b64, LARGEUR, QUALITE, rapport }) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const hSource = img.naturalHeight;
    const h = Math.round((LARGEUR * hSource) / img.naturalWidth);
    /* UNE DIMENSION DE WEBP NE PEUT PAS DEPASSER 16 383 px, et rien
       ne le dit : l'encodeur rend une image tronquee ou vide. On
       arrete l'outil plutot que de livrer un site coupe en deux. */
    if (h > 16383) {
      throw new Error(`${LARGEUR}x${h} : au-dela des 16 383 px qu'un WebP peut porter. Baisser la largeur de sortie.`);
    }
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
    /* == ON DECOUPE EN TUILES, ET C'EST LA CORRECTION DU 2026-07-31. ==  D-648
       Une seule image de 6 916 px de haut ne peut pas arriver
       progressivement : c'est tout ou rien. Pendant le « rien »,
       le navigateur peint le TEXTE ALTERNATIF dans une boite de
       3 863 px — ce que le proprietaire a vu, et pris pour des
       images cassees. Reproduit en bridant le reseau a 400 kbit/s :
       les quatre « apres » restent vides une seconde et demie, puis
       arrivent d'un coup.
       Le cout cache etait pire que le poids : 21 a 23 Mo de bitmap
       DECODE par image, 107 Mo pour la section.
       Decoupees en tuiles de 1 100 px, chaque piece pese 30 a 50 Ko,
       decode 3,6 Mo, et le chargement differe natif ne demande que
       celles qui approchent de la fenetre. Le cadre se remplit du
       haut vers le bas au lieu de rester vide. */
    const TUILE = 1100;
    const tuiles = [];
    for (let y0 = 0; y0 < h; y0 += TUILE) {
      const ht = Math.min(TUILE, h - y0);
      const ct = document.createElement("canvas");
      ct.width = LARGEUR; ct.height = ht;
      ct.getContext("2d").drawImage(c, 0, y0, LARGEUR, ht, 0, 0, LARGEUR, ht);
      const u = ct.toDataURL("image/webp", QUALITE);
      if (u.indexOf("data:image/webp") !== 0) throw new Error("le moteur n'a pas encode en WebP");
      tuiles.push({ url: u, w: LARGEUR, h: ht });
    }
    return { tuiles, w: LARGEUR, h, sourceW: img.naturalWidth, sourceH: img.naturalHeight, coupeA: hSource, tranches };
  }, { b64, LARGEUR, QUALITE, rapport });

  const pire = res.tranches.reduce((a, b) => (b.ec < a.ec ? b : a));
  if (pire.ec < 6) {
    throw new Error(`${cle} : une tranche de la capture est PLATE (ecart-type ${pire.ec}, moyenne ${pire.moy}). ` +
      "C'est une bande vide, pas une page. Reprendre la capture avant de convertir.");
  }
  /* On efface les tuiles d'une passe precedente : un reste plus long
     que la nouvelle serie se retrouverait dans le markup et
     donnerait un site qui se repete. */
  for (const vieux of fs.readdirSync(SORTIE)) {
    if (new RegExp(`^apres-${cle}-t\\d+\\.webp$`).test(vieux)) fs.unlinkSync(path.join(SORTIE, vieux));
  }
  const fichiersTuiles = [];
  let poids = 0;
  for (let t = 0; t < res.tuiles.length; t++) {
    const bin = Buffer.from(res.tuiles[t].url.split(",")[1], "base64");
    const dest = path.join(SORTIE, `apres-${cle}-t${t}.webp`);
    fs.writeFileSync(dest, bin);
    poids += bin.length;
    fichiersTuiles.push({ fichier: `images/realisations/apres-${cle}-t${t}.webp`, w: res.tuiles[t].w, h: res.tuiles[t].h });
  }
  /* L'image d'un seul tenant ne sert plus : on la retire pour qu'un
     markup perime ne puisse pas la ressusciter en silence. */
  const ancien = path.join(SORTIE, `apres-${cle}.webp`);
  if (fs.existsSync(ancien)) fs.unlinkSync(ancien);
  R.push({
    cle,
    source: `${res.sourceW}x${res.sourceH}`,
    rapportAvant: rapport,
    rendu: `${res.w}x${res.h}`,
    tuiles: res.tuiles.length,
    ko: Math.round(poids / 1024),
    pireTuileKo: Math.round(Math.max(...res.tuiles.map((t) => Buffer.from(t.url.split(",")[1], "base64").length)) / 1024),
    ecMin: pire.ec
  });

  /* --- LES PLANCHES DES SCENES EPINGLEES ---  D-644
     Une planche est une pile de N fenetres du meme moment de la
     page, chacune un peu plus avancee dans la transition. Le
     manifeste sort en `cqw` — centiemes de la largeur du cadre —
     parce que c'est l'unite dans laquelle le CSS et `main.js`
     travaillent, et que ca rend le tout independant de la taille
     du cadre. */
  const manif = path.join(ENTREE, `${cle}-bandes.json`);
  const meta = fs.existsSync(manif) ? JSON.parse(fs.readFileSync(manif, "utf8")) : { bandes: [], largeur: 1280 };
  const enCqw = (px) => +((px / meta.largeur) * 100).toFixed(3);
  MARQUES[cle] = {
    apres: { w: res.w, h: res.h, tuiles: fichiersTuiles },
    hauteurPage: meta.hauteurPage,
    bandes: []
  };
  for (const b of meta.bandes) {
    const src = path.join(ENTREE, `${cle}-bande${b.index}.png`);
    if (!fs.existsSync(src)) throw new Error(`${cle} : planche ${b.index} annoncee et absente`);
    const b64b = fs.readFileSync(src).toString("base64");
    const rb = await page.evaluate(async ({ b64b, LARGEUR, QUALITE }) => {
      const img = new Image();
      img.src = "data:image/png;base64," + b64b;
      await img.decode();
      const h = Math.round((LARGEUR * img.naturalHeight) / img.naturalWidth);
      if (h > 16383) throw new Error(`planche ${LARGEUR}x${h} : au-dela des 16 383 px d'un WebP`);
      let cw = img.naturalWidth, ch = img.naturalHeight;
      let s = document.createElement("canvas");
      s.width = cw; s.height = ch;
      s.getContext("2d").drawImage(img, 0, 0);
      while (cw / 2 > LARGEUR) {
        const nw = Math.round(cw / 2), nh = Math.round(ch / 2);
        const c2 = document.createElement("canvas");
        c2.width = nw; c2.height = nh;
        const x2 = c2.getContext("2d");
        x2.imageSmoothingQuality = "high";
        x2.drawImage(s, 0, 0, nw, nh);
        s = c2; cw = nw; ch = nh;
      }
      const c = document.createElement("canvas");
      c.width = LARGEUR; c.height = h;
      const x = c.getContext("2d");
      x.imageSmoothingQuality = "high";
      x.drawImage(s, 0, 0, cw, ch, 0, 0, LARGEUR, h);
      return { url: c.toDataURL("image/webp", QUALITE), w: LARGEUR, h };
    }, { b64b, LARGEUR, QUALITE });
    const destB = path.join(SORTIE, `apres-${cle}-bande${b.index}.webp`);
    const binB = Buffer.from(rb.url.split(",")[1], "base64");
    fs.writeFileSync(destB, binB);
    MARQUES[cle].bandes.push({
      fichier: `images/realisations/apres-${cle}-bande${b.index}.webp`,
      w: rb.w, h: rb.h, n: b.images,
      y: enCqw(b.yImage), hauteur: enCqw(b.hauteur), course: enCqw(b.coursePage),
      cls: b.cls
    });
    R.push({ cle: `${cle} · bande ${b.index}`, source: "-", rapportAvant: "-", rendu: `${rb.w}x${rb.h}`, ko: Math.round(binB.length / 1024), ecMin: "-", fichier: path.relative(RACINE, destB).replace(/\\/g, "/") });
  }
}

await nav.close();
fs.writeFileSync(path.join(ENTREE, "_marques.json"), JSON.stringify(MARQUES, null, 1));
console.table(R);
console.log("TOTAL :", R.reduce((a, b) => a + b.ko, 0), "Ko pour", R.length, "images");
console.log("manifeste :", path.relative(RACINE, path.join(ENTREE, "_marques.json")).replace(/\\/g, "/"));
