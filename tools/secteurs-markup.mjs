/* ============================================================
   LES APERÇUS DE SECTEUR — UN PREMIER ÉCRAN, ARRÊTÉ
   `node tools/secteurs-markup.mjs [clé…] [--verifier]`

   POURQUOI CE FICHIER A CHANGÉ DE MÉTIER.  D-681
   Il empilait des TUILES : chaque secteur montrait son site entier,
   photographié par morceaux de 1 100 px et cousu dans un conteneur
   défilant. C'était la réponse à la bonne question — « un patron de
   garage ne juge pas sur une carte dessinée » — mais à la mauvaise
   échelle : personne ne descend dans un panneau de 421 px, et
   l'effort partait dans des sections qu'on ne verrait jamais.

   Un secteur = **un** `<img>`, le premier écran, photographié à
   1440 × 900 par `tools/ecrans-secteurs.mjs`. Rien à défiler, rien à
   coudre, rien à piloter.

   LA BARRE D'ADRESSE EST SORTIE DES MAQUETTES, et ce n'est pas
   cosmétique : tant qu'elle vivait DANS chaque `.mock`, la scène ne
   pouvait pas porter le rapport 1440/900 — il aurait fallu retrancher
   la hauteur de la barre, qui change avec la largeur de la fenêtre, et
   l'image se serait fait rogner de 2 à 3 % du bas. Or c'est en bas que
   les écrans posent leur bandeau, leur cartouche et leur plaque. Une
   seule barre, au-dessus de la scène, et la scène est exacte.

   LA RÈGLE DE SÛRETÉ. Piège 31 : une découpe bornée par une balise
   fermante commune coupe tout le document. Chaque `.mock` est trouvé
   par appariement de PROFONDEUR, et le nombre de `.mock` comme celui
   des `<section>` est compté avant et après. S'il bouge, rien n'est
   écrit.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PAGE = path.join(RACINE, "index.html");
const VERIFIER = process.argv.includes("--verifier");

/* Le domaine et l'étiquette de chaque aperçu.

   « un site que nous avons codé », et rien de plus : neuf des douze
   sont des démonstrations, trois sont des projets. Une formule qui
   reste vraie pour les douze vaut mieux qu'une formule flatteuse
   qu'il faudrait défendre au téléphone. Règle A. */
const SECTEURS = {
  restaurant: { domaine: "bistro-nordet.ca", etiquette: "Restauration", metier: "un restaurant" },
  boutique: { domaine: "gres-saulnier.ca", etiquette: "Boutique en ligne", metier: "une boutique en ligne" },
  coiffure: { domaine: "salon-brume.ca", etiquette: "Coiffure et esthétique", metier: "un salon de coiffure" },
  gym: { domaine: "fonte-nord.ca", etiquette: "Gym et entraînement", metier: "une salle d'entraînement" },
  hotel: { domaine: "anse-a-givre.ca", etiquette: "Hébergement et tourisme", metier: "une auberge" },
  garage: { domaine: "atelier-meridien.ca", etiquette: "Garage et mécanique", metier: "un garage" },
  construction: { domaine: "construction-lattier.ca", etiquette: "Construction et rénovation", metier: "un entrepreneur général" },
  paysagement: { domaine: "mv-deneigement.ca", etiquette: "Paysagement et déneigement", metier: "un déneigeur" },
  clinique: { domaine: "clinique-riverain.ca", etiquette: "Clinique et santé", metier: "une clinique" },
  immobilier: { domaine: "arpent-immobilier.ca", etiquette: "Immobilier", metier: "un courtier immobilier" },
  juridique: { domaine: "cabinet-vallieres.ca", etiquette: "Services juridiques", metier: "un cabinet d'avocats" },
  photo: { domaine: "atelier-lumen.ca", etiquette: "Photographe et créatif", metier: "un photographe" },
};

function finDuDiv(html, debut) {
  const re = /<\/?div\b/gi;
  re.lastIndex = debut;
  let prof = 0, m;
  while ((m = re.exec(html))) {
    if (m[0].toLowerCase() === "<div") prof++;
    else { prof--; if (prof === 0) return html.indexOf(">", m.index) + 1; }
  }
  throw new Error("div jamais refermé depuis " + debut);
}

const demandes = process.argv.slice(2).filter((a) => SECTEURS[a]);
const aFaire = demandes.length ? demandes : Object.keys(SECTEURS);

let html = fs.readFileSync(PAGE, "utf8");
const sectionsAvant = (html.match(/<section\b/gi) || []).length;
const mocksAvant = (html.match(/class="mock[^"]*" data-mock=/g) || []).length;
const rapport = [];
const manquantes = [];

for (const cle of aFaire) {
  const s = SECTEURS[cle];
  const rel = `images/realisations/ecran-${cle}.webp`;
  if (!fs.existsSync(path.join(RACINE, rel))) { manquantes.push(cle); continue; }

  const re = new RegExp(`<div class="mock[^"]*" data-mock="${cle}"`);
  const m = re.exec(html);
  if (!m) throw new Error(`${cle} : mock introuvable`);
  const debut = m.index;
  const fin = finDuDiv(html, debut);
  const garderOn = /is-on/.test(html.slice(debut, debut + 120));

  /* `width` et `height` aux dimensions RÉELLES du fichier : c'est ce
     qui tient le CLS à zéro. */
  const neuf =
    `<div class="mock mock--ecran${garderOn ? " is-on" : ""}" data-mock="${cle}"\n` +
    `       data-hote="${s.domaine}" data-metier="${s.etiquette}">\n` +
    `    <img src="${rel}" width="1440" height="900"\n` +
    `         alt="Premier écran d'un site que nous avons codé pour ${s.metier}."\n` +
    `         loading="lazy" decoding="async" fetchpriority="low" draggable="false" />\n` +
    `  </div>`;

  html = html.slice(0, debut) + neuf + html.slice(fin);
  const ko = Math.round(fs.statSync(path.join(RACINE, rel)).size / 1024);
  rapport.push({ secteur: cle, domaine: s.domaine, ko });
}

const sectionsApres = (html.match(/<section\b/gi) || []).length;
const mocksApres = (html.match(/class="mock[^"]*" data-mock=/g) || []).length;
if (sectionsAvant !== sectionsApres) throw new Error(`<section> : ${sectionsAvant} → ${sectionsApres}. RIEN N'EST ÉCRIT.`);
if (mocksAvant !== mocksApres) throw new Error(`.mock : ${mocksAvant} → ${mocksApres}. RIEN N'EST ÉCRIT.`);

if (VERIFIER) console.log("vérification seule — rien n'est écrit");
else fs.writeFileSync(PAGE, html);
if (rapport.length) console.table(rapport);
if (manquantes.length) console.log(`⚠ pas encore de capture : ${manquantes.join(" ")} — lancer \`node tools/ecrans-secteurs.mjs ${manquantes.join(" ")}\``);
console.log(`${sectionsApres} sections · ${mocksApres} aperçus, dont ${(html.match(/mock--ecran/g) || []).length} en premier écran`);
