/* ============================================================
   LES APERCUS DE SECTEUR — DE VRAIS SITES, PAS DES MAQUETTES
   `node tools/secteurs-markup.mjs [cle...] [--verifier]`

   POURQUOI.
   Au survol d'un secteur, le panneau montrait une carte dessinee a la
   main : un fragment, une fonction isolee, jolie et abstraite. Un
   patron de garage ne peut pas juger sur ca. Chaque secteur montre
   maintenant un VRAI SITE COMPLET, photographie, dans lequel on
   descend — la meme chaine que les « apres » de la section 03.

   CE QU'IL FAIT
   Remplace le contenu d'un `.mock[data-mock=<cle>]` du
   `<template id="tplSecteurs">` par une barre d'adresse et un ecran
   defilant qui empile les tuiles du site.

   PAS DE PILOTE, ET C'EST VOULU.  D-655
   La section 03 verrouille DEUX pages en pourcentage : il lui faut du
   JavaScript. Ici il n'y a qu'une page. Un conteneur en
   `overflow-y: auto` la fait defiler nativement — donc sur le
   compositeur, donc sans la moindre image de retard (D-654), et sans
   une ligne de script.

   LA REGLE DE SURETE.  Piege 31 : un decoupage borne par une balise
   fermante commune coupe tout le document. Chaque `.mock` est trouve
   par appariement de PROFONDEUR, et le nombre de `.mock` comme celui
   des `<section>` est compte avant et apres. S'il bouge, rien n'est
   ecrit.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PAGE = path.join(RACINE, "index.html");
const MARQUES = path.join(ICI, "_demos", "_marques.json");
const VERIFIER = process.argv.includes("--verifier");

/* Quel site montre quel secteur, et sous quel domaine.
   Trois secteurs reutilisent un « apres » de la section 03 : le site
   existe, il est deja photographie, il n'y a rien a refaire. */
const SECTEURS = {
  restaurant: { source: "restau", domaine: "bistro-nordet.ca", etiquette: "Restauration" },
  garage: { source: "garage", domaine: "atelier-meridien.ca", etiquette: "Garage et mecanique" },
  paysagement: { source: "deneigement", domaine: "mv-deneigement.ca", etiquette: "Paysagement et deneigement" },
  construction: { source: "secteur-construction", domaine: "construction-lattier.ca", etiquette: "Construction et renovation" },
  immobilier: { source: "secteur-immobilier", domaine: "ancrage-immobilier.ca", etiquette: "Immobilier" }
};

function finDuDiv(html, debut) {
  const re = /<\/?div\b/gi;
  re.lastIndex = debut;
  let prof = 0, m;
  while ((m = re.exec(html))) {
    if (m[0].toLowerCase() === "<div") prof++;
    else { prof--; if (prof === 0) return html.indexOf(">", m.index) + 1; }
  }
  throw new Error("div jamais referme depuis " + debut);
}

if (!fs.existsSync(MARQUES)) throw new Error("pas de `_marques.json` — lancer `node tools/demos-webp.mjs`");
const marques = JSON.parse(fs.readFileSync(MARQUES, "utf8"));

const demandes = process.argv.slice(2).filter((a) => SECTEURS[a]);
const aFaire = demandes.length ? demandes : Object.keys(SECTEURS);

let html = fs.readFileSync(PAGE, "utf8");
const sectionsAvant = (html.match(/<section\b/gi) || []).length;
const mocksAvant = (html.match(/class="mock[^"]*" data-mock=/g) || []).length;
const rapport = [];

for (const cle of aFaire) {
  const s = SECTEURS[cle];
  const mk = marques[s.source];
  if (!mk) { console.log(`· ${cle} : ${s.source} absent du manifeste — on passe`); continue; }

  const re = new RegExp(`<div class="mock[^"]*" data-mock="${cle}">`);
  const m = re.exec(html);
  if (!m) throw new Error(`${cle} : mock introuvable`);
  const debut = m.index;
  const fin = finDuDiv(html, debut);

  const garderOn = /is-on/.test(m[0]);
  const tuiles = mk.apres.tuiles.map((t, k) =>
    `        <img src="${t.fichier}" width="${t.w}" height="${t.h}" alt=""\n` +
    `             loading="lazy" decoding="async" fetchpriority="low" draggable="false" />` +
    (k < mk.apres.tuiles.length - 1 ? "\n" : "")
  ).join("");

  const neuf =
    `<div class="mock mock--site${garderOn ? " is-on" : ""}" data-mock="${cle}">\n` +
    `    <div class="sec-chrome"><i></i><i></i><span>${s.domaine}</span><em>${s.etiquette}</em></div>\n` +
    `    <div class="sec-vitre" tabindex="0" role="img"\n` +
    `         aria-label="Site complet que nous avons codé pour un ${s.etiquette.toLowerCase()} — on descend dedans pour le parcourir.">\n` +
    `${tuiles}\n` +
    `    </div>\n` +
    `  </div>`;

  html = html.slice(0, debut) + neuf + html.slice(fin);
  rapport.push({ secteur: cle, source: s.source, tuiles: mk.apres.tuiles.length, hauteur: mk.apres.h + " px", domaine: s.domaine });
}

const sectionsApres = (html.match(/<section\b/gi) || []).length;
const mocksApres = (html.match(/class="mock[^"]*" data-mock=/g) || []).length;
if (sectionsAvant !== sectionsApres) throw new Error(`<section> : ${sectionsAvant} → ${sectionsApres}. RIEN N'EST ECRIT.`);
if (mocksAvant !== mocksApres) throw new Error(`.mock : ${mocksAvant} → ${mocksApres}. RIEN N'EST ECRIT.`);

if (VERIFIER) console.log("verification seule — rien n'est ecrit");
else fs.writeFileSync(PAGE, html);
console.table(rapport);
console.log(`${sectionsApres} sections · ${mocksApres} apercus, dont ${(html.match(/mock--site/g) || []).length} en site complet`);
