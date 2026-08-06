/* ============================================================
   LA FORME DU VRAI CLASSEUR — `node tools/classeur-check.mjs`

   CE QU'IL GARDE, ET POURQUOI IL EXISTE.  D-756

   Le 2026-08-06, « Démarrer un projet » a affiché « ✓ complète »
   sur une ligne dont le budget, l'échéancier et la description
   n'étaient jamais arrives. La cause : des listes déroulantes
   restées aux ANCIENNES positions des colonnes de suivi. Une
   validation `setAllowInvalid(false)` refuse la valeur, `setValues`
   leve APRES avoir ecrit les colonnes de gauche, et la ligne reste
   ecrite a moitie sans que rien ne le dise.

   Aucun outil ne pouvait le voir : la porte `?action=diag` rendait
   les en-tetes, les largeurs, les formats et les regles de couleur
   — tout sauf la seule chose capable de REFUSER une ecriture.

   IL S'ARRETE AU LIEU DE RENDRE « 0 ». Un deploiement trop vieux ne
   connait pas `validations` : sans ce garde-fou l'outil rendrait
   « aucune validation perimee » sur un classeur pourri, ce qui est
   exactement le mensonge qu'on cherche a rendre impossible.

   Sorties : 0 sain · 1 defaut trouve · 2 impossible de conclure.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");

const env = fs.readFileSync(path.join(RACINE, ".env.local"), "utf8");
const m = /^APED_WEB_APP_URL=(.+)$/m.exec(env);
if (!m) { console.error("APED_WEB_APP_URL absent de .env.local"); process.exit(2); }
const SERVICE = m[1].trim();

const VERSION_MINIMALE = 8;

/* ---- l'ordre des colonnes, lu dans Code.gs, jamais recopie ---- */
const SRC = fs.readFileSync(path.join(RACINE, "google", "Code.gs"), "utf8");
function bloc(re, nom) {
  const t = re.exec(SRC);
  if (!t) { console.error("Bloc « " + nom + " » introuvable dans Code.gs."); process.exit(2); }
  return t[0];
}
const DEFS = new Function("var out = {};"
  + bloc(/var ASSOCIES = [\s\S]*?;/, "ASSOCIES")
  + bloc(/var STATUTS = [\s\S]*?;/, "STATUTS")
  + bloc(/var COL_SIGNATURE = [\s\S]*?;/, "COL_SIGNATURE")
  + bloc(/var SUIVI = \[[\s\S]*?\n\];/, "SUIVI")
  + bloc(/var TECHNIQUES = \[[\s\S]*?\n\];/, "TECHNIQUES")
  + bloc(/var SCHEMA = \{[\s\S]*?\n\};/, "SCHEMA")
  + "out.SUIVI = SUIVI; out.SUIVI_FIN = SUIVI_FIN; out.TECHNIQUES = TECHNIQUES; out.SCHEMA = SCHEMA;"
  + "out.COL_SIGNATURE = COL_SIGNATURE; return out;")();

function colonnes(kind) {
  return [].concat(DEFS.SUIVI, DEFS.TECHNIQUES, DEFS.SCHEMA[kind].champs,
    DEFS.SUIVI_FIN, [{ titre: "Renvois" }, { titre: DEFS.COL_SIGNATURE }]);
}

const KINDS = Object.keys(DEFS.SCHEMA);
if (!KINDS.length) { console.error("SCHEMA vide : Code.gs n'a pas ete lu."); process.exit(2); }

/* ---- le service ---- */
const lire = async (q) => {
  const r = await fetch(SERVICE + (q ? "?" + q : ""), { redirect: "follow" });
  const t = await r.text();
  try { return JSON.parse(t); }
  catch { console.error("Le service n'a pas rendu de JSON (" + t.length + " octets de HTML).\n"
    + t.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 300)); process.exit(2); }
};

const vie = await lire("");
console.log("VERSION DEPLOYEE : " + vie.version + "   (minimum exige : " + VERSION_MINIMALE + ")");
if (!(Number(vie.version) >= VERSION_MINIMALE)) {
  console.error("\nARRET — le deploiement est trop vieux pour etre juge.");
  console.error("Il ne rend pas les validations : conclure « sain » serait une invention.");
  console.error("Deployez d'abord : editeur > Deployer > Gerer les deploiements > crayon > Nouvelle version.");
  process.exit(2);
}

const d = await lire("action=diag");
if (!d || !Array.isArray(d.onglets) || !d.onglets.length) {
  console.error("La porte de diagnostic n'a rendu aucun onglet."); process.exit(2);
}

let defauts = 0, controles = 0;

for (const kind of KINDS) {
  const cols = colonnes(kind);
  const titres = cols.map((c) => c.titre);
  const nom = DEFS.SCHEMA[kind].onglet;
  const o = d.onglets.find((x) => x.onglet === nom);

  console.log("\n--- " + nom);
  if (!o || o.absent) { console.log("    ECHEC · onglet absent du classeur"); defauts++; continue; }

  if (!Array.isArray(o.validations)) {
    console.error("    ARRET · cet onglet ne rend pas `validations`."); process.exit(2);
  }

  /* 1 · l'ordre des colonnes */
  controles++;
  const memeOrdre = o.titres.length === titres.length
    && titres.every((t, i) => t === o.titres[i]);
  if (memeOrdre) {
    console.log("    OK    · " + titres.length + " colonnes, dans l'ordre de Code.gs");
  } else {
    defauts++;
    console.log("    ECHEC · l'ordre des colonnes du classeur n'est pas celui de Code.gs");
    for (let i = 0; i < Math.max(titres.length, o.titres.length); i++) {
      if (titres[i] !== o.titres[i]) {
        console.log("            col " + (i + 1) + " · classeur « " + (o.titres[i] || "—")
          + " »  ·  Code.gs « " + (titres[i] || "—") + " »");
      }
    }
    console.log("            → relancez initialiser() dans l'editeur Apps Script.");
  }

  /* 2 · les validations : une par colonne de suivi, et rien d'autre */
  controles++;
  /* LA CASE A COCHER NE SE POSE QUE SUR LES LIGNES QUI EXISTENT.
     D-743

     `preparerOnglet` la refuse volontairement sur la colonne entiere :
     mille cases sous les donnees rendraient `A` non vide, et toute
     regle qui teste « cette ligne existe-t-elle » deviendrait fausse.
     Un onglet encore vide n'a donc AUCUNE case, et c'est correct.

     La porte de diagnostic lit les validations en LIGNE 2. Exiger la
     case sur un onglet vide, c'est juger la ligne 2 d'une feuille qui
     n'en a pas — trois faux verdicts au premier passage. */
  const aDesLignes = Number(o.lignesTotal) >= 1;
  /* PERMISE n'est pas EXIGEE. La case est toujours permise en `Vu` ;
     elle n'est exigee que la ou il y a une ligne pour la porter. */
  const permises = new Map();
  const exigees = new Map();
  cols.forEach((c, i) => {
    if (c.liste) { permises.set(i + 1, "liste " + c.liste.join("/")); exigees.set(i + 1, "liste"); }
    else if (c.case) { permises.set(i + 1, "case a cocher"); if (aDesLignes) exigees.set(i + 1, "case a cocher"); }
  });
  if (!permises.size) { console.error("    ARRET · aucune colonne de suivi reconnue."); process.exit(2); }

  const perimees = o.validations.filter((v) => !permises.has(v.col));
  const manquantes = [...exigees.keys()].filter(
    (c) => !o.validations.some((v) => v.col === c));

  if (!perimees.length && !manquantes.length) {
    console.log("    OK    · " + o.validations.length + " validations, toutes sur le suivi"
      + " (largeur reelle " + o.largeurReelle + ")"
      + (aDesLignes ? "" : " — onglet vide, pas de case a cocher : normal"));
  } else {
    defauts++;
    perimees.forEach((v) => {
      console.log("    ECHEC · validation PERIMEE colonne " + v.col + " « " + v.titre + " »"
        + "\n            " + v.type + " : " + v.valeurs
        + "\n            toute valeur de visiteur y sera REFUSEE, et la ligne"
        + "\n            sera ecrite jusqu'a la colonne " + (v.col - 1) + " puis abandonnee.");
    });
    manquantes.forEach((c) => {
      console.log("    ECHEC · validation ABSENTE colonne " + c + " « " + titres[c - 1]
        + " » (" + permises.get(c) + ")");
    });
    console.log("            → relancez initialiser() : D-756 purge puis repose.");
  }

  /* 3 · une seule regle de couleur par onglet (D-755) */
  controles++;
  if (o.regles.length === 1) {
    console.log("    OK    · une seule regle de couleur");
  } else {
    defauts++;
    console.log("    ECHEC · " + o.regles.length + " regles de couleur empilees (D-755)");
    o.regles.forEach((r) => console.log("            " + r.formule + "  " + r.plages.join(",")));
  }
}

console.log("\n============================================================");
console.log(controles + " controles · " + defauts + " defaut(s)");
if (!controles) { console.error("AUCUN controle n'a tourne."); process.exit(2); }
console.log(defauts ? "VERDICT : le classeur perd des donnees." : "VERDICT : le classeur est sain.");
console.log("============================================================");
process.exit(defauts ? 1 : 0);
