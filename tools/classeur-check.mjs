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

/* L'ADRESSE PEUT VENIR DE L'ENVIRONNEMENT, ET C'EST CE QUI REND CET
   OUTIL PROUVABLE.  D-778

   Sans elle, on ne peut jamais le voir passer au ROUGE : le seul
   service qu'il sache joindre est le vrai, et casser le vrai
   classeur pour verifier qu'un controle fonctionne n'est pas une
   option. `APED_WEB_APP_URL=http://127.0.0.1:8098 node …` le pointe
   sur `faux-google.mjs`, ou l'on peut poser le defaut a la main.
   `.env.local` reste la source par defaut. */
const env = fs.readFileSync(path.join(RACINE, ".env.local"), "utf8");
const m = /^APED_WEB_APP_URL=(.+)$/m.exec(env);
if (!m && !process.env.APED_WEB_APP_URL) {
  console.error("APED_WEB_APP_URL absent de .env.local"); process.exit(2);
}
const SERVICE = (process.env.APED_WEB_APP_URL || m[1]).trim();

/* 14 DEPUIS D-778 : avant elle, `reparerValeursListes` n'existe pas,
   donc les cellules qui portent encore « Alan » ou « Elie » sont
   toujours la et couperont la prochaine fusion. Juger « sain » un
   deploiement 13 serait exactement le faux verdict du piege 95. */
const VERSION_MINIMALE = 14;

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
  /* `SUIVI_FIN` porte « Notes internes », passee en queue par D-759.
     Sans ce bloc, l'outil mourait sur `SUIVI_FIN is not defined` —
     ce qui est le bon comportement : un outil qui ne connait pas la
     forme attendue doit s'arreter, jamais rendre « sain ». */
  + bloc(/var SUIVI_FIN = \[[\s\S]*?\n\];/, "SUIVI_FIN")
  + bloc(/var TECHNIQUES = \[[\s\S]*?\n\];/, "TECHNIQUES")
  + bloc(/var SCHEMA = \{[\s\S]*?\n\};/, "SCHEMA")
  + "out.SUIVI = SUIVI; out.SUIVI_FIN = SUIVI_FIN; out.TECHNIQUES = TECHNIQUES; out.SCHEMA = SCHEMA;"
  + "out.COL_SIGNATURE = COL_SIGNATURE; out.ASSOCIES = ASSOCIES; out.STATUTS = STATUTS;"
  + "return out;")();

function colonnes(kind) {
  return [].concat(DEFS.SUIVI, DEFS.TECHNIQUES, DEFS.SCHEMA[kind].champs,
    DEFS.SUIVI_FIN, [{ titre: "Renvois" }, { titre: DEFS.COL_SIGNATURE }]);
}

const KINDS = Object.keys(DEFS.SCHEMA);
if (!KINDS.length) { console.error("SCHEMA vide : Code.gs n'a pas ete lu."); process.exit(2); }

/* LES COLONNES FIGEES DOIVENT EXISTER.  D-773

   `COLONNES_FIGEES` est une liste de TITRES, ecrite en toutes
   lettres, que `fusionnerLigne` refuse de reecrire une fois
   remplies : c'est ce qui empeche une etape suivante de rejouer une
   acceptation. Une faute de frappe d'un cote ne casserait rien de
   visible — la colonne se laisserait simplement reecrire, et la
   preuve deviendrait modifiable sans que personne le sache. On
   compare donc les deux listes ici, avant tout appel reseau. */
{
  const mf = /var COLONNES_FIGEES = \[([^\]]*)\]/.exec(SRC);
  if (!mf) { console.error("`COLONNES_FIGEES` introuvable dans Code.gs."); process.exit(2); }
  const figees = mf[1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  if (!figees.length) { console.error("`COLONNES_FIGEES` est vide : l'acceptation serait reecrivable."); process.exit(2); }
  const tousTitres = new Set(KINDS.flatMap((k) => DEFS.SCHEMA[k].champs.map((c) => c.titre)));
  const fantomes = figees.filter((t) => !tousTitres.has(t));
  if (fantomes.length) {
    console.error("ARRET · COLONNES_FIGEES nomme " + fantomes.length
      + " colonne(s) qui n'existe(nt) dans aucun SCHEMA :\n       "
      + fantomes.join(" · ")
      + "\n       Le gel ne s'applique alors a RIEN, et rien ne le dit.");
    process.exit(2);
  }
  console.log("COLONNES FIGEES : " + figees.join(" · ") + "  (toutes presentes au schema)");
}

/* LA PORTE DE DIAGNOSTIC EST FERMEE A CLE DEPUIS D-785.
   Elle rendait le quota d'envoi et les prenoms des associes a qui
   voulait. La cle vit dans les proprietes du script cote Google, et
   dans `.env.local` ici — jamais dans le depot. */
const mCle = /^APED_DIAG_CLE=(.+)$/m.exec(env);
const DIAG_CLE = (process.env.APED_DIAG_CLE || (mCle && mCle[1]) || "").trim();

/* ---- le service ---- */
const lire = async (q) => {
  const url = SERVICE + (q ? "?" + q + (DIAG_CLE ? "&cle=" + encodeURIComponent(DIAG_CLE) : "") : "");
  const r = await fetch(url, { redirect: "follow" });
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
/* UNE PORTE FERMEE N'EST PAS UN CLASSEUR SAIN.  D-785
   Sans ce garde-fou, `d.onglets` serait `undefined`, la boucle ne
   tournerait sur rien, et l'outil rendrait « 0 defaut » sur un
   classeur qu'il n'a jamais vu — exactement le piege 30. */
if (d && d.ferme) {
  console.error("\nARRET — la porte de diagnostic a refuse.");
  console.error("  " + (d.message || ""));
  console.error(DIAG_CLE
    ? "  La cle d'`.env.local` ne correspond pas a `DIAG_CLE` cote Google."
    : "  Aucune cle dans `.env.local` : ajoutez-y `APED_DIAG_CLE=...`.");
  process.exit(2);
}
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

  /* 2b · ET CE QU'ELLES CONTIENNENT.  D-778

     LE CONTROLE CI-DESSUS PASSERAIT AU VERT SUR LE DEFAUT QU'IL EST
     CENSE VOIR. Il juge la COLONNE — « une liste est bien posee en
     B » — jamais les VALEURS. Le 2026-08-07, « Alan » est devenu
     « Allen » et « Elie » est devenu « Eli » : une liste restee sur
     l'ancienne graphie est toujours « une liste sur la bonne
     colonne », donc toujours OK, pendant qu'elle refuse le nom que
     le code pose desormais.

     `getCriteriaValues()[0]` est le TABLEAU des valeurs permises ;
     `String()` le rend « a,b,c ». On compare a la lettre. */
  controles++;
  const mauvaises = [];
  cols.forEach((c, i) => {
    if (!c.liste) return;
    const v = o.validations.find((x) => x.col === i + 1);
    if (!v) return;                       /* deja compte en « manquantes » */
    if (String(v.valeurs) !== c.liste.join(",")) {
      mauvaises.push({ col: i + 1, titre: c.titre, lue: v.valeurs, voulue: c.liste.join(",") });
    }
  });
  if (!mauvaises.length) {
    console.log("    OK    · chaque liste porte exactement les valeurs du code"
      + " (associes : " + DEFS.ASSOCIES.join(", ") + ")");
  } else {
    defauts++;
    mauvaises.forEach((m) => {
      console.log("    ECHEC · la liste de la colonne " + m.col + " « " + m.titre + " » est PERIMEE"
        + "\n            au classeur : " + m.lue
        + "\n            au code     : " + m.voulue
        + "\n            toute valeur neuve y sera REFUSEE, et les cellules deja"
        + "\n            remplies avec l'ancienne graphie couperont la FUSION.");
    });
    console.log("            → relancez initialiser() : D-778 repare les valeurs, puis repose la liste.");
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
