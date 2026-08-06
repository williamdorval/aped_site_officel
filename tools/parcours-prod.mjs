/* ============================================================
   LES SEPT PARCOURS, LUS DANS LE VRAI CLASSEUR
   `node tools/parcours-prod.mjs [--rdv] [--garder]`

   CE QU'IL PROUVE, ET CE QU'IL NE PEUT PAS PROUVER.

   Il prouve que CHAQUE champ de CHAQUE formulaire arrive dans LA
   BONNE COLONNE du vrai classeur — la seule chose qu'on puisse
   relire d'ici. C'est le controle de non-retour du defaut D-756 :
   une ligne qui s'ecrit a moitie n'est visible qu'en relisant la
   colonne la plus a DROITE.

   IL NE PEUT PAS LIRE LES COURRIELS. Les avis partent chez
   apedagence@gmail.com ; les connecteurs de cette session sont sur
   un autre compte. Ce que le service envoie se prouve au banc
   (`formulaires-prod.mjs`), pas ici. Ici on prouve seulement QU'IL
   a envoye, par la baisse du quota.

   COMBIEN IL COUTE, ET POURQUOI SI PEU.  D-744
   Un avis interne part quand la ligne NAIT, deux a la confirmation,
   rien entre les deux. On ouvre donc une session par formulaire
   — 1 courriel — puis on pousse TOUS les champs restants dans une
   etape intermediaire, qui n'en coute aucun. Sept formulaires
   couverts pour sept envois.

   `--rdv` ajoute les deux vraies reservations (telephone et Meet),
   qui posent un evenement au calendrier : +6 envois.

   Sorties : 0 sain · 1 defaut trouve · 2 impossible de conclure.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const AVEC_RDV = process.argv.includes("--rdv");

const env = fs.readFileSync(path.join(RACINE, ".env.local"), "utf8");
const mm = /^APED_WEB_APP_URL=(.+)$/m.exec(env);
if (!mm) { console.error("APED_WEB_APP_URL absent de .env.local"); process.exit(2); }
const SERVICE = mm[1].trim();
const VERSION_MINIMALE = 6;

/* ---- le schema, lu dans Code.gs ---- */
const SRC = fs.readFileSync(path.join(RACINE, "google", "Code.gs"), "utf8");
function bloc(re, nom) {
  const t = re.exec(SRC);
  if (!t) { console.error("Bloc « " + nom + " » introuvable."); process.exit(2); }
  return t[0];
}
const DEFS = new Function("var out={};"
  + bloc(/var ASSOCIES = [\s\S]*?;/, "ASSOCIES")
  + bloc(/var STATUTS = [\s\S]*?;/, "STATUTS")
  + bloc(/var MODES = [\s\S]*?;/, "MODES")
  + bloc(/var COL_SIGNATURE = [\s\S]*?;/, "COL_SIGNATURE")
  + bloc(/var SUIVI = \[[\s\S]*?\n\];/, "SUIVI")
  + bloc(/var TECHNIQUES = \[[\s\S]*?\n\];/, "TECHNIQUES")
  + bloc(/var SCHEMA = \{[\s\S]*?\n\};/, "SCHEMA")
  + "out.SCHEMA=SCHEMA; out.MODES=MODES; return out;")();

/* ---- le service ---- */
async function poster(charge) {
  const t0 = Date.now();
  const r = await fetch(SERVICE, { method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(charge), redirect: "follow" });
  const txt = await r.text();
  try { const j = JSON.parse(txt); j._ms = Date.now() - t0; return j; }
  catch {
    /* LE VERDICT PEUT ETRE DANS UNE PAGE, PAS DANS DU JSON. C'est
       la seule facon dont le refus de validation s'est manifeste le
       2026-08-06.  Piege 90 · 94 */
    const vu = txt.replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ")
      .replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
    return { success: false, _html: true, _statut: r.status,
             _page: vu.slice(0, 260), _ms: Date.now() - t0 };
  }
}
async function lire(q) {
  const r = await fetch(SERVICE + "?" + q, { redirect: "follow" });
  const t = await r.text();
  try { return JSON.parse(t); }
  catch { console.error("La porte « " + q + " » n'a pas rendu de JSON."); process.exit(2); }
}

let echecs = 0, cas = 0;
function verifier(nom, obtenu, attendu, note) {
  cas++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) echecs++;
  console.log("    " + (ok ? "OK   " : "ECHEC") + " " + nom
    + (ok ? "  ·  " + String(obtenu).slice(0, 46)
          : "\n           obtenu  : " + obtenu + "\n           attendu : " + attendu)
    + (note ? "\n           " + note : ""));
}

/* ---- une valeur d'essai plausible par champ ---- */
const MAIL = "zztest@exemple.ca";
function valeur(champ) {
  if (champ === "email" || champ === "votre_email") return MAIL;
  if (champ === "telephone" || champ === "votre_telephone") return "418 555 0177";
  if (champ === "contact_reference") return "ZZ Marie Tremblay 418 555 0188";
  if (champ === "prix_reaction") return "Non";
  return "ZZ-" + champ;
}

/* ---- l'etat de depart ---- */
const vie = await lire("");
console.log("============================================================");
console.log("VERSION DEPLOYEE : " + vie.version);
if (!(Number(vie.version) >= VERSION_MINIMALE)) {
  console.error("ARRET — deploiement trop vieux pour etre juge."); process.exit(2);
}
const d0 = await lire("action=diag");
const QUOTA0 = d0.quota;
const KINDS = Object.keys(DEFS.SCHEMA);
const COUT = KINDS.length + (AVEC_RDV ? 6 : 0);
console.log("QUOTA : " + QUOTA0 + " / 100   ·   cout annonce : ~" + COUT + " envois");
console.log("============================================================");
if (QUOTA0 < COUT + 4) {
  console.error("\nARRET : il faut ~" + COUT + " envois, il en reste " + QUOTA0 + ".");
  console.error("Tester a moitie brulerait la reserve sans rien prouver.");
  process.exit(2);
}

const SESSIONS = {};
const horodatage = Date.now().toString(36);

/* ============================================================
   LES SEPT ONGLETS — chaque champ, dans sa colonne
   ============================================================ */
for (const kind of KINDS) {
  const def = DEFS.SCHEMA[kind];
  console.log("\n--- " + def.onglet + "   (" + kind + ")");

  /* Les champs du visiteur : ceux qui commencent par `_` sont
     remplis par le serveur, jamais par le formulaire. */
  const champs = def.champs.map((c) => c.champ).filter((c) => c.charAt(0) !== "_");
  const S = "pp" + horodatage + kind.slice(0, 4);
  SESSIONS[kind] = S;

  /* 1 · la naissance — le minimum vital, 1 courriel */
  const mini = {};
  (def.requisPartiel || def.requis).forEach((c) => { mini[c] = valeur(c); });
  /* Une reservation ne peut pas naitre sans sa plage a l'etape 1 :
     `valider` ne l'exige qu'a la confirmation. */
  const r1 = await poster(Object.assign(
    { _form: kind, _sid: S, _etape: 1, _etapes: 2 }, mini));
  verifier("l'ouverture est acceptee", r1.success, true,
    r1._page || r1.cause || r1.message || (r1._ms + " ms"));
  if (!r1.success) { console.log("           (on passe la suite de cet onglet)"); continue; }

  /* 2 · TOUS les autres champs, en etape intermediaire — 0 courriel */
  const reste = { _form: kind, _sid: S, _etape: 2, _etapes: 2 };
  champs.forEach((c) => { reste[c] = valeur(c); });
  /* `mode` n'accepte que deux libelles ; `plage_iso` n'est exige
     qu'a la confirmation, qu'on ne fait pas ici. */
  if (kind === "booking") reste.mode = DEFS.MODES.TEL;
  const r2 = await poster(reste);
  verifier("l'etape suivante est acceptee", r2.success, true,
    r2._page || r2.cause || r2.message || (r2._ms + " ms"));

  /* 3 · ON RELIT LE VRAI CLASSEUR, colonne par colonne */
  const d = await lire("action=diag");
  const o = d.onglets.find((x) => x.onglet === def.onglet);
  const l = (o.lignesEssai || []).find((x) =>
    x.cellules.some((c) => c.titre === "Signature" && c.valeur === "S:" + S));
  if (!l) { verifier("la ligne se relit au classeur", "absente", "presente"); continue; }

  const parTitre = {};
  l.cellules.forEach((c) => { parTitre[c.titre] = c; });
  let manquants = [], formules = [], horsTexte = [];
  def.champs.forEach((c) => {
    if (c.champ.charAt(0) === "_") return;
    const attendu = kind === "booking" && c.champ === "mode" ? DEFS.MODES.TEL : valeur(c.champ);
    const cel = parTitre[c.titre];
    if (!cel) { manquants.push(c.titre + " (colonne absente)"); return; }
    if (String(cel.valeur) !== attendu) manquants.push(c.titre + " = « " + cel.valeur + " »");
    if (String(cel.formule || "") !== "") formules.push(c.titre);
    if (String(cel.format) !== "@") horsTexte.push(c.titre + ":" + cel.format);
  });
  verifier("les " + champs.length + " champs sont dans leur colonne",
    manquants.length ? manquants.join(" | ") : "tous", "tous");
  /* LA COLONNE LA PLUS A DROITE EST LE TEMOIN DU DEFAUT D-756. */
  const dernier = def.champs[def.champs.length - 1];
  verifier("la DERNIERE colonne du visiteur est ecrite",
    parTitre[dernier.titre] ? (String(parTitre[dernier.titre].valeur).trim() || "-- VIDE --") : "absente",
    dernier.champ.charAt(0) === "_" ? "-- VIDE --" : valeur(dernier.champ),
    "temoin de la troncature (D-756)");
  verifier("aucune valeur n'a ete prise pour un calcul",
    formules.length ? formules.join(", ") : "aucune", "aucune");
  verifier("toutes les colonnes du visiteur sont au format texte",
    horsTexte.length ? horsTexte.join(", ") : "toutes", "toutes");
  verifier("une seule ligne porte cette session",
    (o.lignesEssai || []).filter((x) => x.cellules.some(
      (c) => c.titre === "Signature" && c.valeur === "S:" + S)).length, 1);
  verifier("l'etape dit ou la personne s'est arretee",
    (parTitre["Étape"] || {}).valeur, "2 / 2");
}

/* ============================================================
   L'INJECTION DE FORMULE — dans une session deja ouverte, 0 courriel
   ============================================================ */
console.log("\n--- L'INJECTION DE FORMULE, DANS LE VRAI SHEETS");
{
  const S = SESSIONS.project;
  const CHARGES = [
    ["=1+1", "description"],
    ["=IMPORTXML(\"https://exemple.ca/x\",\"//a\")", "blocage"],
    ["+41855501@42", "objectif"]
  ];
  const charge = { _form: "project", _sid: S, _etape: 2, _etapes: 2, email: MAIL };
  CHARGES.forEach(([txt, champ]) => { charge[champ] = txt; });
  const r = await poster(charge);
  verifier("les trois charges sont acceptees", r.success, true,
    r._page || r.cause || r.message || "");

  const d = await lire("action=diag");
  const o = d.onglets.find((x) => x.onglet === DEFS.SCHEMA.project.onglet);
  const l = (o.lignesEssai || []).find((x) =>
    x.cellules.some((c) => c.titre === "Signature" && c.valeur === "S:" + S));
  const COLS = { description: "Description", blocage: "Ce qui les bloque", objectif: "Objectif" };
  CHARGES.forEach(([txt, champ]) => {
    const c = (l ? l.cellules : []).find((x) => x.titre === COLS[champ]);
    if (!c) { verifier("« " + COLS[champ] + " » se relit", "absente", "presente"); return; }
    console.log("      « " + COLS[champ] + " »  valeur=" + JSON.stringify(c.valeur)
      + "  formule=" + JSON.stringify(c.formule) + "  format=" + c.format);
    verifier("« " + COLS[champ] + " » est rangee TELLE QUELLE", c.valeur, txt);
    verifier("« " + COLS[champ] + " » n'est PAS un calcul", c.formule || "aucune", "aucune",
      "formule non vide = la faille est ouverte");
  });
}

/* ============================================================
   LES DEUX RESERVATIONS REELLES  (--rdv)
   ============================================================ */
if (AVEC_RDV) {
  const c = await lire("action=creneaux");
  if (!c.jours || !c.jours.length) { console.error("Aucun creneau rendu."); process.exit(2); }
  const j = c.jours.slice().sort((a, b) => b.creneaux.length - a.creneaux.length)[0];
  console.log("\n--- RESERVATIONS REELLES · jour vise : " + j.libelle
    + " (" + j.creneaux.length + " plages)");

  for (const [mode, rang] of [[DEFS.MODES.TEL, 1], [DEFS.MODES.MEET, 3]]) {
    const p = j.creneaux[rang];
    if (!p) { verifier("une plage libre existe", "aucune", "au moins " + (rang + 1)); continue; }
    const S = "pp" + horodatage + "rdv" + (mode === DEFS.MODES.TEL ? "tel" : "meet");
    console.log("\n  · " + mode + "  ·  " + p.libelle);

    await poster({ _form: "booking", _sid: S, _etape: 1, _etapes: 2,
      email: MAIL, nom: "ZZTEST RDV", telephone: "418 555 0177" });
    const f = await poster({ _form: "booking", _sid: S, _etape: 2, _etapes: 2, _final: true,
      email: MAIL, nom: "ZZTEST RDV", entreprise: "ZZTEST Garage",
      telephone: "418 555 0177", mode: mode, plage_iso: p.iso,
      sujet: "ZZ-sujet de l'appel" });
    verifier("la reservation passe", f.success, true, f._page || f.cause || f.message || "");

    const d = await lire("action=diag");
    const o = d.onglets.find((x) => x.onglet === "Réserver un appel");
    const l = (o.lignesEssai || []).find((x) =>
      x.cellules.some((y) => y.titre === "Signature" && y.valeur === "S:" + S));
    const v = (t) => { const x = (l ? l.cellules : []).find((y) => y.titre === t);
      return x ? (String(x.valeur).trim() || "-- VIDE --") : "-- COLONNE ABSENTE --"; };
    verifier("« Mode »", v("Mode"), mode);
    /* LES TROIS COLONNES DU BOUT — celles que D-756 mangeait. */
    verifier("« Plage demandée » est ecrite par le serveur",
      v("Plage demandée") !== "-- VIDE --", true, v("Plage demandée"));
    verifier("« Début » est ecrit", v("Début") !== "-- VIDE --", true, v("Début"));
    verifier("« Événement » est ecrit", v("Événement") !== "-- VIDE --", true, v("Événement"));
    verifier("« Sujet de l'appel »", v("Sujet de l'appel"), "ZZ-sujet de l'appel");
    verifier("« Signature » est posee", v("Signature"), "S:" + S);
    if (mode === DEFS.MODES.MEET) {
      verifier("un lien Meet est rendu au visiteur", /meet\.google\.com/.test(String(f.meet || "")),
        true, String(f.meet || "(aucun)"));
      verifier("et il est au classeur", /meet\.google\.com/.test(v("Lien Meet")), true, v("Lien Meet"));
    } else {
      verifier("un appel telephonique n'invente pas de Meet", v("Lien Meet"), "-- VIDE --");
    }

    /* LA PLAGE DISPARAIT POUR LE SUIVANT. */
    const c2 = await lire("action=creneaux");
    const j2 = (c2.jours || []).find((x) => x.libelle === j.libelle);
    verifier("la plage reservee a disparu des creneaux libres",
      (j2 ? j2.creneaux : []).some((x) => x.iso === p.iso), false, p.libelle);
  }
}

/* ---- le compte ---- */
const dF = await lire("action=diag");
console.log("\n============================================================");
console.log("COURRIELS : " + QUOTA0 + " → " + dF.quota + "   (" + (QUOTA0 - dF.quota) + " depenses)");
console.log(echecs === 0 ? "LES PARCOURS ARRIVENT ENTIERS : " + cas + " / " + cas
                         : "DEFAUTS : " + echecs + " sur " + cas);
console.log("============================================================");
process.exit(echecs === 0 ? 0 : 1);
