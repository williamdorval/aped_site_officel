/* ============================================================
   LE MARKUP DES QUATRE CADRES, ECRIT DEPUIS LE MANIFESTE
   `node tools/demos-markup.mjs [--verifier]`

   POURQUOI UN OUTIL PLUTOT QU'UNE EDITION A LA MAIN.
   Chaque cadre porte maintenant trois choses qui viennent toutes de
   la capture : les dimensions de l'image « apres », la position de
   chaque scene epinglee, et le nombre de vues de sa planche. Ecrire
   ca a la main sur quatre blocs, c'est quatre occasions de poser un
   chiffre qui ne correspond a rien — et un chiffre faux ici ne se
   voit pas : la bande se joue simplement au mauvais endroit.

   CE QU'IL FAIT
   1. deplace `.ba-pile` HORS de `.ba-vitre` — la vitre ne garde que
      sa piste, l'espaceur qui donne la course (D-645) ;
   2. pose une `.ba-bande` par scene epinglee, avec ses mesures ;
   3. remet les dimensions de l'image « apres ».

   LA REGLE DE SURETE.  Piege 31 : un decoupage borne par une balise
   fermante commune coupe tout le document. Ici chaque region est
   trouvee par appariement de PROFONDEUR, et le nombre de `<section>`
   est compte avant et apres. S'il bouge, rien n'est ecrit.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PAGE = path.join(RACINE, "index.html");
const MARQUES = path.join(ICI, "_demos", "_marques.json");
const VERIFIER = process.argv.includes("--verifier");

const CADRES = {
  "ba-garage": "garage",
  "ba-design": "design",
  "ba-restaurant": "restau",
  "ba-renovation": "deneigement"
};

if (!fs.existsSync(MARQUES)) throw new Error("pas de `_marques.json` — lancer `node tools/demos-webp.mjs` d'abord");
const marques = JSON.parse(fs.readFileSync(MARQUES, "utf8"));

/* Apparie `<div …>` et `</div>` par profondeur. Rend l'index qui
   suit la fermeture du div ouvert a `debut`. */
function finDuDiv(html, debut) {
  const re = /<\/?div\b/gi;
  re.lastIndex = debut;
  let prof = 0;
  let m;
  while ((m = re.exec(html))) {
    if (m[0].toLowerCase() === "<div") prof++;
    else {
      prof--;
      if (prof === 0) return html.indexOf(">", m.index) + 1;
    }
  }
  throw new Error("div jamais referme depuis l'index " + debut);
}

let html = fs.readFileSync(PAGE, "utf8");
const sectionsAvant = (html.match(/<section\b/gi) || []).length;
const rapport = [];

for (const [id, cle] of Object.entries(CADRES)) {
  const mk = marques[cle];
  if (!mk) throw new Error(`${cle} : absent du manifeste`);

  const ancre = html.indexOf(`id="${id}"`);
  if (ancre < 0) throw new Error(`${id} : introuvable dans index.html`);
  const dVitre = html.indexOf('<div class="ba-vitre" data-ba-vitre>', ancre);
  const dPile = html.indexOf('<div class="ba-pile">', ancre);
  if (dVitre < 0 || dPile < 0) throw new Error(`${id} : vitre ou pile introuvable`);
  const fVitre = finDuDiv(html, dVitre);
  const fPile = finDuDiv(html, dPile);
  /* DEUX STRUCTURES POSSIBLES, ET L'OUTIL DOIT SAVOIR LAQUELLE.
     Avant D-645, la pile vivait DANS la vitre ; depuis, elle est sa
     SOEUR — la vitre ne garde que sa piste. L'outil se relance sur
     les deux, et refuse tout le reste plutot que de deviner. */
  const dedans = fPile < fVitre;
  if (!dedans && dPile < dVitre) throw new Error(`${id} : la pile precede la vitre — structure inattendue`);
  const finRegion = dedans ? fVitre : fPile;

  let pile = html.slice(dPile, fPile);

  /* --- L'IMAGE « APRES » EST UNE PILE DE TUILES ---  D-648
     Elle etait d'un seul tenant, haute de 4 300 a 7 226 px. Une
     image pareille arrive tout d'un coup ou pas du tout, et pendant
     qu'elle n'est pas la le navigateur peint son TEXTE ALTERNATIF
     dans une boite de 3 863 px de haut. C'est ce que le proprietaire
     a vu, et il l'a lu — a juste titre — comme des images cassees.
     Chaque tuile fait au plus 1 100 px, arrive seule, et le
     chargement differe natif ne demande que celles qui approchent.
     LA DESCRIPTION QUITTE LES IMAGES et passe sur la vue, en
     `role="img"` + `aria-label` — le meme traitement que le cote
     « avant ». Une pile de tuiles n'a pas sept descriptions a
     donner, elle en a une ; et un `alt` vide ne peut plus remplir
     l'ecran de prose. */
  const iShot = pile.indexOf("ba-shot");
  if (iShot < 0) throw new Error(`${id} : pas d'image « apres »`);
  const debutImg = pile.lastIndexOf("<img", iShot);
  const finImg = pile.indexOf("/>", iShot) + 2;
  const ancienne = pile.slice(debutImg, finImg);
  const mAlt = ancienne.match(/alt="([^"]*)"/);
  const description = mAlt ? mAlt[1] : "";
  if (!description) throw new Error(`${id} : pas de description a reprendre sur l'ancienne image`);
  const balise = mk.apres.tuiles.map((t, k) =>
    `<img class="ba-shot" src="${t.fichier}" width="${t.w}" height="${t.h}" alt=""\n` +
    `                         loading="lazy" decoding="async" fetchpriority="low" draggable="false" />` +
    (k < mk.apres.tuiles.length - 1 ? "\n                    " : "")
  ).join("");

  /* --- les bandes, posees juste apres l'image --- */
  const bandes = mk.bandes.map((b, i) => {
    const donnees = `${b.y} ${b.hauteur} ${b.n} ${b.course}`;
    return (
      `\n                    <!-- SCENE EPINGLEE ${i} — ${b.n} vues de sa transition, jouees au defilement  D-644 -->\n` +
      `                    <div class="ba-bande" data-ba-bande="${donnees}" aria-hidden="true"\n` +
      `                         style="--ba-b-y: ${b.y}; --ba-b-h: ${b.hauteur}; --ba-b-n: ${b.n};">\n` +
      `                      <img src="${b.fichier}" width="${b.w}" height="${b.h}" alt=""\n` +
      `                           loading="lazy" decoding="async" fetchpriority="low" draggable="false" />\n` +
      `                    </div>`
    );
  }).join("");

  /* ON RECONSTRUIT LE CORPS DE LA VUE « APRES » AU COMPLET, on ne le
     complete pas : relancer l'outil doit rendre exactement le meme
     document, jamais un site empile deux fois.
     La borne est le `<div class="ba-page ba-page--shot">` et sa
     fermeture, trouvee par appariement de profondeur — jamais par
     une balise fermante partagee (piege 31). */
  const dShot = pile.indexOf('<div class="ba-page ba-page--shot">');
  if (dShot < 0) throw new Error(`${id} : pas de page « apres »`);
  const fShot = finDuDiv(pile, dShot);
  const ouvre = '<div class="ba-page ba-page--shot">';
  const corpsNeuf =
    "\n                    " + balise +
    bandes +
    "\n                  ";
  pile = pile.slice(0, dShot) + ouvre + corpsNeuf + "</div>" + pile.slice(fShot);

  /* LA DESCRIPTION PASSE SUR LA VUE, comme du cote « avant ». Une
     pile de tuiles n'a pas sept descriptions a donner, elle en a
     une — et un `alt` vide ne peut plus remplir l'ecran de prose. */
  const avantVue = pile;
  pile = pile.replace(/<div class="ba-vue ba-vue--apres"[^>]*>/,
    `<div class="ba-vue ba-vue--apres" role="img" aria-label="${description}">`);
  if (pile === avantVue) throw new Error(`${id} : la vue « apres » n'a pas recu sa description`);

  const neuf =
    '<div class="ba-vitre" data-ba-vitre><div class="ba-piste" data-ba-piste></div></div>\n' +
    "              " + pile;

  html = html.slice(0, dVitre) + neuf + html.slice(finRegion);
  rapport.push({ id, cle, apres: `${mk.apres.w}x${mk.apres.h}`, tuiles: mk.apres.tuiles.length, bandes: mk.bandes.length, hauteurPage: mk.hauteurPage });
}

const sectionsApres = (html.match(/<section\b/gi) || []).length;
if (sectionsAvant !== sectionsApres) {
  throw new Error(`le nombre de <section> a bouge : ${sectionsAvant} → ${sectionsApres}. RIEN N'EST ECRIT.`);
}
const nbPiste = (html.match(/data-ba-piste/g) || []).length;
const nbPile = (html.match(/class="ba-pile"/g) || []).length;
const nbBande = (html.match(/class="ba-bande"/g) || []).length;
 const nbTuile = (html.match(/class="ba-shot"/g) || []).length;
 const tuilesAttendues = Object.values(marques).reduce((a, m) => a + m.apres.tuiles.length, 0);
 if (nbTuile !== tuilesAttendues) throw new Error(`${nbTuile} tuiles posees pour ${tuilesAttendues} attendues. RIEN N EST ECRIT.`);
const attendu = Object.values(marques).reduce((a, m) => a + m.bandes.length, 0);
if (nbPiste !== 4 || nbPile !== 4 || nbBande !== attendu) {
  throw new Error(`compte inattendu : ${nbPiste} pistes, ${nbPile} piles, ${nbBande} bandes pour ${attendu} attendues. RIEN N'EST ECRIT.`);
}

if (VERIFIER) {
  console.log("verification seule — rien n'est ecrit");
} else {
  fs.writeFileSync(PAGE, html);
}
console.table(rapport);
console.log(`${sectionsApres} sections · ${nbPiste} pistes · ${nbBande} scenes epinglees`);
