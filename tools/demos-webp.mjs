/* ============================================================
   LES CAPTURES DES VRAIS SITES, PRETES POUR LA PAGE
   `node tools/demos-webp.mjs [largeur] [qualite]`

   Entree  : `tools/_demos/<cle>-plein.png` — la capture pleine page
             d'un des quatre projets, prise a 760 px de large en
             densite 2, coordonnees masquees a la prise de vue.
   Sortie  : `images/realisations/apres-<cle>.webp`

   DEUX DECISIONS, ET AUCUNE N'EST DE CONFORT.

   1. LE RECADRAGE. Une capture pleine page fait 32 000 px de haut.
      La fenetre d'une comparaison n'en montre que 62,5 cqw a la
      fois, et la boucle interne avance a 1,41 cqw par seconde
      (48 cqw en 34 s, D-507). Une image de 375 cqw demanderait
      trois minutes et demie pour etre parcourue une fois : personne
      ne la verrait. On garde donc 138 cqw — le heros et l'entree de
      la premiere section — et la boucle passe a 42 s.

   2. LE POIDS. Ces images sont differees et vivent loin sous la
      ligne de flottaison, mais elles restent des octets servis
      depuis ce serveur. On les reduit a 1 140 px de large, ce qui
      reste le double de leur taille d'affichage, et on encode en
      WebP par le navigateur lui-meme — aucune dependance nouvelle,
      et le site continue de ne dependre de rien.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const ENTREE = path.join(ICI, "_demos");
const SORTIE = path.join(RACINE, "images", "realisations");
const LARGEUR = Number(process.argv[2] || 1140);
const QUALITE = Number(process.argv[3] || 0.78);
if (!Number.isFinite(LARGEUR) || !Number.isFinite(QUALITE)) {
  throw new Error("largeur ou qualite illisible — un parametre NaN rend n'importe quoi (piege 30)");
}
fs.mkdirSync(SORTIE, { recursive: true });

/* UNE SEULE FENETRE, CADREE SUR L'IDENTITE.  D-627
   La premiere version gardait 187 cqw de haut et laissait la boucle
   interne parcourir le reste. Vu a l'image : au repos, deux des
   quatre « apres » ne montraient qu'une PHOTO — le nom, la phrase et
   les boutons etaient sous le bord de la fenetre, et la comparaison
   ne comparait rien pendant les premieres secondes.
   La fenetre d'une comparaison fait exactement 62,5 cqw (16/10). On
   cadre donc l'image dessus, une fois pour toutes, sur la zone qui
   porte l'identite : le nom, l'accroche, les boutons. Il n'y a plus
   rien a faire defiler du cote « apres », et c'est mieux ainsi — le
   vieux site est un long defile d'encombrement, le neuf le dit en un
   ecran. Le decalage est releve site par site, en pixels de la
   capture source, et ecrit ici avec sa raison. */
const RAPPORT = 0.625;
const DECALAGE = {
  /* le titre est deja haut dans la capture */
  garage: 0,
  /* la carte du heros vit en bas de la premiere fenetre du site */
  design: 400,
  /* ce site-la a ete photographie sans defiler : son nom en pleine
     masse arrive a 1 080 px sur 1 425 (D-620) */
  restau: 1900,
  /* le titre est a 1 020 px, la capture part de 634 */
  deneigement: 300
};

/* On part de la capture CADREE, pas de la pleine page : le point de
   depart est releve site par site dans `demos-capture.mjs`, parce
   qu'un cadrage commun rendait, pour deux des quatre, une
   photographie sans un mot dessus. */
const sources = fs.readdirSync(ENTREE).filter((f) => f.endsWith("-cadre.png"));
if (!sources.length) throw new Error("aucune capture dans tools/_demos — rien a convertir");

const nav = await chromium.launch();
const page = await nav.newPage();
const R = [];

for (const f of sources) {
  const cle = f.replace("-cadre.png", "");
  const brut = fs.readFileSync(path.join(ENTREE, f));
  const b64 = brut.toString("base64");
  const res = await page.evaluate(async ({ b64, LARGEUR, QUALITE, RAPPORT, DEC }) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const hSource = Math.round(img.naturalWidth * RAPPORT);
    const y0 = Math.max(0, Math.min(DEC, img.naturalHeight - hSource));
    const h = Math.round((LARGEUR * hSource) / img.naturalWidth);
    const c = document.createElement("canvas");
    c.width = LARGEUR; c.height = h;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, y0, img.naturalWidth, hSource, 0, 0, LARGEUR, h);
    /* UNE CAPTURE UNIFORME N'EST PAS UNE CAPTURE.  D-614
       Un des quatre sites a rendu une bande entierement noire —
       5 Ko de WebP, une image vide, et rien dans le rapport pour le
       dire. On mesure donc l'etalement des valeurs : si l'image
       tient dans une poignee de teintes, l'outil s'arrete au lieu de
       livrer du vide en silence. */
    const px = ctx.getImageData(0, 0, LARGEUR, h).data;
    let min = 255, max = 0, somme = 0, n = 0;
    for (let i = 0; i < px.length; i += 4 * 97) {
      const l = (px[i] * 299 + px[i + 1] * 587 + px[i + 2] * 114) / 1000;
      if (l < min) min = l;
      if (l > max) max = l;
      somme += l; n++;
    }
    const moy = somme / n;
    let va = 0;
    for (let i = 0; i < px.length; i += 4 * 97) {
      const l = (px[i] * 299 + px[i + 1] * 587 + px[i + 2] * 114) / 1000;
      va += (l - moy) * (l - moy);
    }
    const ecartType = Math.sqrt(va / n);
    const url = c.toDataURL("image/webp", QUALITE);
    if (url.indexOf("data:image/webp") !== 0) throw new Error("le moteur n'a pas encode en WebP");
    return { url, w: LARGEUR, h, sourceW: img.naturalWidth, sourceH: img.naturalHeight, coupeA: hSource,
             etendue: Math.round(max - min), ecartType: +ecartType.toFixed(1), y0 };
  }, { b64, LARGEUR, QUALITE, RAPPORT, DEC: DECALAGE[cle] || 0 });

  if (res.ecartType < 6) {
    throw new Error(`${cle} : la capture est PLATE (ecart-type de luminance ${res.ecartType}, etendue ${res.etendue}). ` +
      "C'est une image vide, pas une page. Reprendre la capture avant de convertir.");
  }
  const bin = Buffer.from(res.url.split(",")[1], "base64");
  const dest = path.join(SORTIE, `apres-${cle}.webp`);
  fs.writeFileSync(dest, bin);
  R.push({
    cle,
    source: `${res.sourceW}x${res.sourceH}`,
    coupeDe: res.y0, coupeA: res.y0 + res.coupeA,
    rendu: `${res.w}x${res.h}`,
    ko: Math.round(bin.length / 1024),
    ecartType: res.ecartType,
    fichier: path.relative(RACINE, dest).replace(/\\/g, "/")
  });
}

await nav.close();
console.table(R);
console.log("TOTAL :", R.reduce((a, b) => a + b.ko, 0), "Ko pour", R.length, "images");
