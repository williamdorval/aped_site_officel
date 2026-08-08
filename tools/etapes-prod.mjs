/* ============================================================
   LE PARCOURS EN ETAPES, LU DANS LE VRAI CLASSEUR
   `node tools/etapes-prod.mjs [--garder]`

   POURQUOI IL EXISTE SEPAREMENT DU BANC.  D-756

   Le banc rendait 63/63 pendant que le vrai classeur perdait la
   moitie droite de chaque ligne. Il ne mentait pas sur la logique —
   il ne modelisait pas ce qui pouvait REFUSER une ecriture.

   Cet outil ne juge rien depuis le depot : il envoie un parcours
   reel, puis RELIT le classeur apres CHAQUE etape par
   `?action=diag`. Une valeur qui n'apparait pas est une valeur
   perdue, peu importe ce que la reponse HTTP a dit.

   IL LIT LE CORPS MEME QUAND CE N'EST PAS DU JSON. La panne du
   2026-08-06 se lisait uniquement dans une page d'erreur HTML :
   « Les données que vous avez saisies dans la cellule S2 ne
   respectent pas les règles de validation ». Un outil qui ne
   regarde que `r.success` ne la voit jamais.  (Piege 90 · 94)

   IL COMPTE SES COURRIELS : une naissance de ligne + deux a la
   confirmation = 3 destinataires. Il s'arrete s'il n'en reste pas
   assez plutot que de tester a moitie.

   Sorties : 0 sain · 1 defaut trouve · 2 impossible de conclure.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const GARDER = process.argv.includes("--garder");

const env = fs.readFileSync(path.join(RACINE, ".env.local"), "utf8");
const m = /^ADEXWEB_WEB_APP_URL=(.+)$/m.exec(env);
if (!m) { console.error("ADEXWEB_WEB_APP_URL absent de .env.local"); process.exit(2); }
const SERVICE = m[1].trim();

const COUT = 3;
const ONGLET = "Démarrer un projet";
const MAIL = "zztest@exemple.ca";
const S = "etapesprod" + Date.now().toString(36);

let echecs = 0, cas = 0;
function verifier(nom, obtenu, attendu, note) {
  cas++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) echecs++;
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + nom
    + "\n         obtenu  : " + obtenu
    + "\n         attendu : " + attendu
    + (note ? "\n         " + note : ""));
}

/* LE CORPS SE LIT TOUJOURS, MEME EN HTML. */
async function poster(charge) {
  const t0 = Date.now();
  const r = await fetch(SERVICE, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(charge),
    redirect: "follow"
  });
  const txt = await r.text();
  try { const j = JSON.parse(txt); j._ms = Date.now() - t0; return j; }
  catch {
    const visible = txt.replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<style[\s\S]*?<\/style>/g, " ")
      .replace(/<[^>]+>/g, " ").replace(/&#39;/g, "'").replace(/&amp;/g, "&")
      .replace(/\s+/g, " ").trim();
    return { success: false, _html: true, _statut: r.status,
             _page: visible.slice(0, 300), _ms: Date.now() - t0 };
  }
}
async function lire(q) {
  const r = await fetch(SERVICE + "?" + q, { redirect: "follow" });
  const t = await r.text();
  try { return JSON.parse(t); }
  catch { console.error("La porte « " + q + " » n'a pas rendu de JSON."); process.exit(2); }
}

/* ---- l'etat avant ---- */
const vie = await lire("");
const d0 = await lire("action=diag");
console.log("============================================================");
console.log("VERSION DEPLOYEE : " + vie.version + "   ·   QUOTA : " + d0.quota + " / 100");
console.log("SESSION D'ESSAI  : " + S);
console.log("============================================================");
if (d0.quota < COUT + 3) {
  console.error("\nARRET : il faut " + COUT + " envois, il en reste " + d0.quota + ".");
  process.exit(2);
}
const avantLignes = (d0.onglets.find((o) => o.onglet === ONGLET) || {}).lignesTotal;
if (avantLignes == null) { console.error("Onglet « " + ONGLET + " » absent."); process.exit(2); }

/* Ce qu'on envoie, etape par etape, et la colonne que ca doit remplir. */
const ETAPES = [
  { rang: 1, charge: { email: MAIL, nom: "ZZTEST Etapes prod" },
    attendu: { "Nom": "ZZTEST Etapes prod", "Courriel": MAIL } },
  { rang: 2, charge: { email: MAIL, entreprise: "ZZTEST Toiture", ville: "ZZTEST Ville",
                       telephone: "418 555 0177", domaine: "ZZ-domaine",
                       besoins: "ZZ-besoins" },
    attendu: { "Entreprise": "ZZTEST Toiture", "Ville": "ZZTEST Ville",
               "Téléphone": "418 555 0177", "Domaine": "ZZ-domaine",
               "Besoins": "ZZ-besoins" } },
  /* LES COLONNES DE DROITE, CELLES QUI SE PERDAIENT. */
  { rang: 3, final: true,
    charge: { email: MAIL, nom: "ZZTEST Etapes prod", entreprise: "ZZTEST Toiture",
              ampleur: "ZZ-ampleur", niveau_design: "ZZ-design",
              fonctions: "ZZ-fonctions", contenu: "ZZ-contenu",
              blocage: "ZZ-blocage", objectif: "ZZ-objectif",
              budget: "ZZ-budget", echeancier: "ZZ-echeancier",
              description: "ZZ-description", connu_par: "ZZ-connu",
              fourchette_vue: "ZZ-fourchette", prix_reaction: "Non",
              prix_raison: "ZZ-raison" },
    attendu: { "Ampleur": "ZZ-ampleur", "Niveau de design": "ZZ-design",
               "Fonctions": "ZZ-fonctions", "Contenu": "ZZ-contenu",
               "Ce qui les bloque": "ZZ-blocage", "Objectif": "ZZ-objectif",
               "Budget": "ZZ-budget", "Échéancier": "ZZ-echeancier",
               "Description": "ZZ-description", "Nous a connus par": "ZZ-connu",
               "Fourchette vue": "ZZ-fourchette", "Ça convient ?": "Non",
               "Pourquoi pas": "ZZ-raison" } }
];

async function ligneDuClasseur() {
  const d = await lire("action=diag");
  const o = d.onglets.find((x) => x.onglet === ONGLET);
  const l = (o.lignesEssai || []).find((x) =>
    x.cellules.some((c) => c.titre === "Signature" && c.valeur === "S:" + S));
  return { d, o, l };
}

/* ---- le parcours ---- */
let acquis = {};
for (const e of ETAPES) {
  console.log("\n--- ETAPE " + e.rang + " / " + ETAPES.length
    + (e.final ? "  (confirmation)" : ""));
  const r = await poster(Object.assign(
    { _form: "project", _sid: S, _etape: e.rang, _etapes: ETAPES.length },
    e.final ? { _final: true } : {}, e.charge));

  if (r._html) {
    console.log("         LE SERVICE A RENDU UNE PAGE, PAS DU JSON (HTTP " + r._statut + ")");
    console.log("         « " + r._page + " »");
  }
  verifier("l'etape " + e.rang + " est acceptee", r.success, true,
    r._page || r.cause || r.message || (r._ms + " ms"));

  const { l } = await ligneDuClasseur();
  if (!l) { verifier("la ligne existe au classeur", "absente", "presente"); break; }

  Object.assign(acquis, e.attendu);
  const val = (t) => {
    const c = l.cellules.find((x) => x.titre === t);
    return c === undefined ? "-- COLONNE ABSENTE --" : (String(c.valeur).trim() === "" ? "-- VIDE --" : c.valeur);
  };
  /* TOUT CE QUI EST DEJA ARRIVE DOIT ENCORE ETRE LA. C'est la regle
     « une valeur vide ne touche a rien », verifiee sur le vrai
     classeur et pas sur une intention. */
  for (const t of Object.keys(acquis)) verifier("« " + t + " »", val(t), acquis[t]);
  verifier("« Étape »", val("Étape"),
    e.final ? "✓ complète" : e.rang + " / " + ETAPES.length);
}

/* ---- une seule ligne pour tout le parcours ---- */
const { d, o } = await ligneDuClasseur();
verifier("UNE SEULE ligne pour les " + ETAPES.length + " envois",
  o.lignesTotal - avantLignes, 1, "avant " + avantLignes + ", apres " + o.lignesTotal);
console.log("\n  quota restant : " + d.quota + " / 100");

/* ---- le nettoyage vient APRES la lecture, jamais avant ---- */
if (!GARDER) {
  console.log("\n  (la ligne d'essai reste au classeur — `nettoyerAutotest` la retire)");
}

console.log("\n============================================================");
console.log(echecs === 0 ? "LE PARCOURS ARRIVE ENTIER : " + cas + " / " + cas
                         : "DEFAUTS : " + echecs + " sur " + cas);
console.log("============================================================");
process.exit(echecs === 0 ? 0 : 1);
