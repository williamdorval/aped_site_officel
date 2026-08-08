/* ============================================================
   DECOUPAGE DU CSS — critique / differe
   `node tools/css-critique.mjs`

   Outil de FABRICATION. Il lit `css/app.css` et en tire deux
   fichiers. Il ne tourne jamais chez le visiteur.

   POURQUOI PAS « LES REGLES QUI ONT UNE CIBLE VISIBLE ».
   C'etait la premiere version, et elle a casse la cascade. Une
   regle groupee comme

       .cell--lead .num, .cell--lead p { color: var(--accent-ink); }

   etait promue parce que `.num` figure au premier ecran, tandis que

       .cell p { color: var(--ink-muted); }

   restait en differe. Les deux ont la MEME specificite : c'est
   l'ordre qui les departage, et le decoupage l'avait inverse. Le
   paragraphe de la tuile principale du contact passait donc de
   l'encre d'accent a l'encre attenuee. Trouve par
   `tools/cascade-check.mjs`, pas a l'oeil.

   LA REGLE RETENUE : on promeut par COMPOSANT, sur le SUJET du
   selecteur — sa derniere partie, celle qui designe l'element
   style. Une regle dont tous les sujets appartiennent a un
   composant du premier ecran part en critique ; les autres restent.
   Une regle MIXTE — des sujets des deux cotes — est ecrite dans LES
   DEUX fichiers : dupliquer coute quelques octets, casser une
   cascade coute une couleur fausse quelque part.

   Un composant voyage entier : ses regles gardent leur ordre entre
   elles, donc aucune inversion interne n'est possible.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");

/* Les composants peints au premier ecran, en 1440x900 comme en
   390x844 : la barre, l'index, la plaque du hero, la fiche, la
   bande de specification, le rideau d'entree, plus les primitives
   qu'ils emploient tous. */
const CRITIQUES = [
  "wrap", "grid", "band", "band-tight", "band-loose", "rule-top", "rule-bottom", "rule-left",
  "section-rule", "head", "head-index",
  "nav", "nav-impact", "nav-links", "nav-right", "nav-refer", "nav-refer-num", "nav-cta",
  "wordmark", "wordmark-mark", "burger", "menu", "menu-list", "menu-actions", "menu-foot",
  "rail", "rail-list", "rail-left", "rail-impact", "read-progress",
  "btn", "btn-icon", "theme-toggle", "icon", "label", "num", "skip-link", "sr-only",
  "entree", "hero", "plate-text", "plate-big", "plate-small", "fiche-rows", "fiche-foot", "fiche-rule",
  "spec", "spec-cell", "shell", "focus-group", "opt", "fine",
  /* LA COMPOSITION DU HERO EST CRITIQUE, ET C'EST UN DEFAUT MESURE.
     `html.compo-hero .he::after` tombait en differe, or `differe.css`
     est injecte par JavaScript apres deux `requestAnimationFrame` :
     l'`animation-delay` ne court qu'a partir de l'arrivee de la
     feuille. Releve du 2026-07-29 par `tools/diag-accueil2.mjs` :
     un decalage CONSTANT de +223 ms entre le `--e` ecrit dans le
     document et le moment reel. Le rideau, lui, est dans
     `critique.css` et part a l'heure — les onze pas glissaient donc
     sous sa queue, et les trois premiers (sur-titre, ligne 1, ligne
     2) se jouaient a 0 % de visibilite.
     Une animation de CHARGEMENT ne peut pas vivre dans une feuille
     differee. La regle vaut pour tout ce qu'on ajoutera ensuite. */
  "he", "compo-hero", "compo-attend", "ligne",
  /* Les SAS : leur hauteur de piste doit etre posee au premier
     calcul de mise en page, sinon une arrivee par ancre atterrit
     1 700 px a cote — differe.css arrive APRES l'ancre.  D-582 */
  "sas", "sas--calque", "est-la"
];
const estCritique = (nom) =>
  CRITIQUES.includes(nom) ||
  nom.startsWith("entree-") || nom.startsWith("hero-") || nom.startsWith("nav-") ||
  nom.startsWith("rail-") || nom.startsWith("menu-") || nom.startsWith("btn--") ||
  nom.startsWith("plate-") || nom.startsWith("spec-") || nom.startsWith("fiche-") ||
  nom.startsWith("sas-");

/* Les images-cles qui n'animent QUE des panneaux ouverts au clic.  D-608
   Un `@keyframes` est indivisible, donc l'outil le recopie dans les
   DEUX feuilles pour qu'aucune animation ne se retrouve sans ses
   images. Celles-ci sont l'exception justifiee : le panneau du
   service 02 ne s'ouvre pas sans JavaScript, et c'est ce meme
   JavaScript qui injecte `differe.css`. Les mettre au chemin
   critique, c'etait 0,7 Ko payes par tous les visiteurs pour un
   dessin que la plupart ne verront jamais.
   Liste EXPLICITE, jamais un prefixe : une heuristique ici couterait
   un jour une animation muette qu'aucun test ne verrait passer. */
const KEYFRAMES_DIFFEREES = new Set([
  "svc-auto-court", "svc-auto-soude",
  "svc-fait-1", "svc-fait-2", "svc-fait-3", "svc-fait-4"
]);

/* TOUTES les classes du selecteur, pas seulement celles du sujet.

   Premiere version : on ne regardait que le sujet, et un sujet sans
   classe — `b` dans `.ecr-mrow b` — etait pris pour une primitive
   et promu. Resultat : `critique.css` pesait 92 Ko sur 144, et le
   decoupage ne servait plus a rien.

   Ce qui compte est la CHAINE entiere : `.ecr-mrow b` appartient a
   un ecran de service, donc au differe, meme si son sujet est un
   `b` nu. */
function classesDuSelecteur(sel) {
  const propre = sel
    .replace(/::?[a-z-]+(\([^)]*\))?/g, "")   /* pseudo-classes et pseudo-elements */
    .replace(/\[[^\]]*\]/g, "")               /* attributs */
    .trim();
  return (propre.match(/\.([A-Za-z0-9_-]+)/g) || []).map((c) => c.slice(1));
}

/* Un selecteur est critique si toutes ses classes le sont. Une
   seule classe etrangere suffit a le renvoyer au differe : on
   prefere differer une regle utile que promouvoir tout un
   composant par contagion. */
function verdict(selecteurText) {
  const sels = selecteurText.split(",").map((s) => s.trim()).filter(Boolean);
  let oui = 0, non = 0;
  for (const s of sels) {
    const cls = classesDuSelecteur(s);
    /* Aucune classe — `html`, `body`, `*`, `a:focus-visible` : ce
       sont les primitives du document, minuscules, et tout en
       depend. */
    if (!cls.length) { oui++; continue; }
    if (cls.every(estCritique)) oui++; else non++;
  }
  if (oui && non) return "mixte";
  return oui ? "critique" : "differe";
}

/* ------------------------------------------------------------
   Decoupage du fichier. On travaille sur le TEXTE, pas sur le
   modele objet du navigateur : les commentaires, les `@font-face`
   et l'ordre exact sont ainsi conserves tels quels.
   ------------------------------------------------------------ */
const src = fs.readFileSync(path.join(RACINE, "css/app.css"), "utf8");

function decouper(texte, profondeur) {
  const critique = [];
  const differe = [];
  /* Les commentaires attendent : ils partent avec la regle qu'ils
     documentent, pas dans les deux fichiers. Les dupliquer ajoutait
     28 Ko de prose au chemin critique. */
  let enAttente = [];
  const vider = (cible) => { for (const c of enAttente) cible.push(c); enAttente = []; };
  let i = 0;
  while (i < texte.length) {
    if (texte.startsWith("/*", i)) {
      const f = texte.indexOf("*/", i + 2);
      enAttente.push(texte.slice(i, f + 2));
      i = f + 2;
      continue;
    }
    if (/\s/.test(texte[i])) { i++; continue; }

    /* On lit jusqu'a l'accolade ouvrante. */
    const ouvre = texte.indexOf("{", i);
    if (ouvre < 0) break;
    const tete = texte.slice(i, ouvre).trim();

    /* On trouve l'accolade fermante correspondante. */
    let n = 1, j = ouvre + 1;
    while (j < texte.length && n > 0) {
      if (texte[j] === "{") n++;
      else if (texte[j] === "}") n--;
      j++;
    }
    const corps = texte.slice(ouvre + 1, j - 1);
    const regle = texte.slice(i, j);
    i = j;

    if (/^@(media|supports)/.test(tete)) {
      /* On descend DANS la requete : elle contient des regles des
         deux familles. */
      const dedans = decouper(corps, profondeur + 1);
      if (dedans.critique.trim()) { vider(critique); critique.push(`${tete} {\n${dedans.critique}\n}`); }
      if (dedans.differe.trim()) { differe.push(`${tete} {\n${dedans.differe}\n}`); }
      enAttente = [];
      continue;
    }
    if (tete.startsWith("@")) {
      /* `@font-face`, `@keyframes`, `@page` : indivisibles, et une
         image-cle absente casse une animation. Dans les deux —
         SAUF celles nommees ci-dessous, qui n'animent QUE des
         panneaux ouverts au clic. Un panneau ne s'ouvre pas sans
         JavaScript, et `differe.css` est injecte par le meme
         JavaScript : leur image-cle ne peut pas manquer au moment
         ou elle sert. La liste est explicite, jamais deduite d'un
         prefixe — une heuristique ici couterait une animation
         muette qu'aucun test ne verrait. */
      const nomIm = /^@keyframes\s+([A-Za-z0-9_-]+)/.exec(tete);
      if (nomIm && KEYFRAMES_DIFFEREES.has(nomIm[1])) {
        vider(differe); differe.push(regle);
        continue;
      }
      vider(critique); critique.push(regle);
      differe.push(regle);
      continue;
    }

    const v = verdict(tete);
    if (v === "critique") { vider(critique); critique.push(regle); }
    else if (v === "differe") { vider(differe); differe.push(regle); }
    else { vider(critique); critique.push(regle); differe.push(regle); }
  }
  return { critique: critique.join("\n"), differe: differe.join("\n") };
}

const { critique, differe } = decouper(src, 0);

const enTete = (nom, quoi) => `/* ============================================================
   ADEXWEB — ${nom}
   ${quoi}
   FABRIQUE PAR \`node tools/css-critique.mjs\` a partir de
   \`css/app.css\`, qui reste la seule source. Ne pas modifier a la
   main : editer \`app.css\` puis relancer l'outil, et verifier avec
   \`node tools/cascade-check.mjs\`.
   ============================================================ */\n\n`;

fs.writeFileSync(path.join(RACINE, "css/critique.css"),
  enTete("CSS CRITIQUE", "Les composants peints au PREMIER ECRAN.") + critique + "\n", "utf8");
fs.writeFileSync(path.join(RACINE, "css/differe.css"),
  enTete("CSS DIFFERE", "Tout le reste, injecte apres la premiere peinture.") + differe + "\n", "utf8");

console.log(`app.css      ${Math.round(src.length / 1024)} Ko`);
console.log(`critique.css ${Math.round(critique.length / 1024)} Ko`);
console.log(`differe.css  ${Math.round(differe.length / 1024)} Ko`);
