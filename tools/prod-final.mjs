/* ============================================================
   LA PASSE FINALE CONTRE LE VRAI GOOGLE
   `node tools/prod-final.mjs [--nettoyer]`

   POURQUOI ELLE EXISTE SEPAREMENT. Le banc execute le vrai
   `Code.gs`, mais avec des services en memoire. Trois choses ne se
   prouvent que la-bas :

     · ce que SHEETS fait d'une chaine qui commence par « = » ;
     · qu'une session retrouve sa ligne dans un VRAI classeur ;
     · qu'un evenement se cree, avec le bon titre et le bon lieu.

   ELLE COMPTE SES COURRIELS. Le compte Gmail plafonne a cent
   destinataires par jour. Chaque cas annonce ce qu'il va couter,
   et l'outil s'ARRETE s'il ne reste pas assez — mieux vaut ne pas
   tester que de tester a moitie et bruler la reserve.

   ELLE LIT AVANT DE NETTOYER. Le 2026-08-06, le verdict de
   l'injection a ete perdu parce que `nettoyerAutotest` etait passe
   avant la lecture. Ici, le nettoyage est une option explicite —
   `--nettoyer` — et il vient toujours APRES le rapport.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const NETTOYER = process.argv.includes("--nettoyer");

const env = fs.readFileSync(path.join(RACINE, ".env.local"), "utf8");
const m = /^ADEXWEB_WEB_APP_URL=(.+)$/m.exec(env);
if (!m) { console.error("ADEXWEB_WEB_APP_URL absent de .env.local"); process.exit(1); }
const SERVICE = m[1].trim();

let echecs = 0, cas = 0;
function titre(t) { console.log(""); console.log("--- " + t); }
function verifier(nom, obtenu, attendu, note) {
  cas++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) echecs++;
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + nom
    + "\n         obtenu  : " + obtenu
    + "\n         attendu : " + attendu
    + (note ? "\n         " + note : ""));
}

async function poster(charge) {
  const t0 = Date.now();
  const r = await fetch(SERVICE, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(charge),
    redirect: "follow"
  });
  const txt = await r.text();
  let j;
  try { j = JSON.parse(txt); } catch (e) { j = { _brut: txt.slice(0, 140), _statut: r.status }; }
  j._ms = Date.now() - t0;
  return j;
}
const lire = async (q) =>
  (await fetch(SERVICE + "?" + q, { redirect: "follow" })).json();

let sidN = 0;
const sid = () => "prodfinal" + Date.now().toString(36) + (++sidN);

/* ---- le quota, avant tout ---- */
const vie = await lire("");
const diag0 = await lire("action=diag");
const QUOTA0 = diag0.quota;
console.log("============================================================");
console.log("VERSION DEPLOYEE : " + vie.version + "   ·   QUOTA : " + QUOTA0 + " / 100");
console.log("============================================================");

/* CE QUE LA PASSE VA COUTER, annonce d'avance. Un avis interne par
   naissance de ligne, deux courriels par demande complete. */
const COUT = 3 /* injection */ * 2 + 3 /* etapes projet */ + 2 * 2 /* deux reservations */ + 2 /* double */;
if (QUOTA0 < COUT + 5) {
  console.error(`\nARRET : il faut ~${COUT} envois et il n'en reste que ${QUOTA0}.`);
  console.error("Tester a moitie brulerait la reserve sans rien prouver.");
  process.exit(2);
}
console.log("Coût annoncé de cette passe : ~" + COUT + " destinataires.\n");

/* ============================================================
   1 · L'INJECTION — ON LIT LE VERDICT, PUIS SEULEMENT PUIS
   ============================================================ */
titre("1 · L'INJECTION DE FORMULE, DANS LE VRAI SHEETS");
const CHARGES = [
  ["=1+1", "le cas d'ecole"],
  ["=IMPORTXML(\"https://exemple.ca/x\",\"//a\")", "celle qui sort du classeur"],
  ["+41855501@42", "le « + » et le « @ », que Sheets lit aussi"]
];
for (const [texte, quoi] of CHARGES) {
  const r = await poster({
    _form: "contact", nom: "ZZTEST Injection", email: "zztest@exemple.ca",
    telephone: "418 555 0143", message: texte, _subject: "ZZTEST injection"
  });
  verifier("acceptee — " + quoi, r.success, true, "« " + texte + " » · " + r._ms + " ms");
}

/* LE VERDICT SE LIT MAINTENANT, dans le classeur, avant tout
   nettoyage. `formule` non vide = Sheets a calcule. */
const d1 = await lire("action=diag");
const oContact = d1.onglets.find((o) => o.onglet === "Contact simple");
const injectees = (oContact.lignesEssai || [])
  .map((l) => l.cellules.find((c) => c.titre === "Message"))
  .filter((c) => c && /^[=+]/.test(c.valeur));

console.log("");
console.log("  LIGNES D'INJECTION RELUES DANS LE VRAI CLASSEUR : " + injectees.length);
injectees.forEach((c) => {
  console.log("    valeur  : « " + c.valeur + " »");
  console.log("    formule : « " + c.formule + " »    format : " + c.format);
});
verifier("les trois charges sont au classeur", injectees.length >= 3, true);
verifier("AUCUNE n'a ete prise pour un calcul",
  injectees.filter((c) => c.formule !== "").length, 0,
  "une formule non vide = la faille est ouverte");
verifier("toutes portent le format texte",
  injectees.filter((c) => c.format !== "@").length, 0);

/* ============================================================
   2 · LA SAUVEGARDE PROGRESSIVE, DANS LE VRAI CLASSEUR
   ============================================================ */
titre("2 · UNE ETAPE, UNE PAUSE, LA SUITE — UNE SEULE LIGNE");
{
  const S = sid();
  const avant = (d1.onglets.find((o) => o.onglet === "Démarrer un projet") || {}).lignesTotal || 0;

  const a = poster({ _form: "project", _sid: S, _etape: 1, _etapes: 8,
                     email: "zztest@exemple.ca", nom: "ZZTEST Etapes" });
  const r1 = await a;
  verifier("etape 1 acceptee", r1.success, true, r1.message || (r1._ms + " ms"));

  const r2 = await poster({ _form: "project", _sid: S, _etape: 4, _etapes: 8,
                            email: "zztest@exemple.ca", nom: "ZZTEST Etapes",
                            entreprise: "ZZTEST Toiture", ampleur: "6 à 15 — un vrai site",
                            niveau_design: "Premium — identité forte, animations" });
  verifier("etape 4 met a jour", r2.session, true, "ligne " + r2.ligne);

  const r3 = await poster({ _form: "project", _sid: S, _etape: 7, _etapes: 8, _final: true,
                            email: "zztest@exemple.ca", nom: "ZZTEST Etapes",
                            entreprise: "ZZTEST Toiture", budget: "Une enveloppe est déjà déterminée",
                            fourchette_vue: "10 000 $ à 20 000 $", prix_reaction: "Non",
                            prix_raison: "au-dessus de mon budget" });
  verifier("la confirmation passe", r3.success, true, r3.message || "");

  const d2 = await lire("action=diag");
  const o = d2.onglets.find((x) => x.onglet === "Démarrer un projet");
  verifier("UNE SEULE ligne pour les trois envois",
    o.lignesTotal - avant, 1,
    "avant " + avant + ", apres " + o.lignesTotal);

  const l = (o.lignesEssai || []).find((x) =>
    x.cellules.some((c) => String(c.valeur).indexOf("ZZTEST Etapes") !== -1));
  if (l) {
    const val = (t) => (l.cellules.find((c) => c.titre === t) || {}).valeur;
    console.log("");
    console.log("    Étape          : " + val("Étape"));
    console.log("    Entreprise     : " + val("Entreprise"));
    console.log("    Ampleur        : " + val("Ampleur"));
    console.log("    Niveau design  : " + val("Niveau de design"));
    console.log("    Fourchette vue : " + val("Fourchette vue"));
    console.log("    Ça convient ?  : " + val("Ça convient ?"));
    console.log("    Pourquoi pas   : " + val("Pourquoi pas"));
    verifier("l'etape dit que c'est complet", val("Étape"), "✓ complète");
    verifier("ce qui est arrive a l'etape 4 est toujours la",
      val("Entreprise"), "ZZTEST Toiture");
    verifier("la fourchette vue est enregistree",
      val("Fourchette vue"), "10 000 $ à 20 000 $");
    verifier("la raison du refus aussi", val("Pourquoi pas"), "au-dessus de mon budget");
  } else {
    verifier("la ligne se relit", false, true);
  }
}

/* ============================================================
   3 · LES DEUX MODES DE RESERVATION
   ============================================================ */
titre("3 · RESERVATION — TELEPHONE PUIS MEET");
{
  const c = await lire("action=creneaux");
  const j = c.jours.slice().sort((a, b) => b.creneaux.length - a.creneaux.length)[0];
  console.log("  jour vise : " + j.libelle + "  (" + j.creneaux.length + " plages)");

  for (const [mode, rang] of [["Appel téléphonique", 1], ["Google Meet", 3]]) {
    const p = j.creneaux[rang];
    const r = await poster({
      _form: "booking", nom: "ZZTEST " + (rang === 1 ? "Tel" : "Meet"),
      email: "zztest@exemple.ca", telephone: "418 555 0181",
      entreprise: "ZZTEST Garage", mode: mode, plage_iso: p.iso,
      sujet: "essai de la chaine, mode " + mode
    });
    verifier(mode + " : la reservation passe", r.success, true, r.message || (r._ms + " ms"));
    if (mode === "Google Meet") {
      verifier("un vrai lien Meet est rendu", /^https:\/\/meet\.google\.com\//.test(r.meet || ""), true,
        r.meet || "(vide)");
    } else {
      verifier("aucun lien Meet pour un appel telephonique", r.meet || "", "");
    }
    console.log("         plage : " + p.h + "   iso : " + p.iso);
  }

  /* L'HEURE, DES DEUX COTES QU'ON PEUT VOIR D'ICI : l'ecran et le
     classeur. L'agenda et le courriel se verifient a la main. */
  const d3 = await lire("action=diag");
  const o = d3.onglets.find((x) => x.onglet === "Réserver un appel");
  (o.lignesEssai || []).slice(0, 2).forEach((l) => {
    const v = (t) => (l.cellules.find((c) => c.titre === t) || {}).valeur;
    console.log("");
    console.log("    ligne " + l.ligne + " · " + v("Mode"));
    console.log("      Plage demandée : " + v("Plage demandée"));
    console.log("      Lien Meet      : " + (v("Lien Meet") || "—"));
    console.log("      Événement      : " + (v("Événement") ? "oui" : "—"));
  });
  verifier("les deux reservations sont au classeur",
    (o.lignesEssai || []).length >= 2, true);
}

/* ============================================================
   4 · DEUX RESERVATIONS SIMULTANEES
   ============================================================ */
titre("4 · MEME PLAGE, DEUX PERSONNES, EN MEME TEMPS");
{
  const c = await lire("action=creneaux");
  const j = c.jours[c.jours.length - 2];
  const p = j.creneaux[j.creneaux.length - 1];
  const base = { _form: "booking", telephone: "418 555 0182",
                 mode: "Appel téléphonique", plage_iso: p.iso, sujet: "ZZTEST simultane" };
  const [a, b] = await Promise.all([
    poster(Object.assign({}, base, { nom: "ZZTEST Alpha", email: "zztest@exemple.ca" })),
    poster(Object.assign({}, base, { nom: "ZZTEST Beta", email: "zztest2@exemple.ca" }))
  ]);
  verifier("une seule passe", [a, b].filter((x) => x.success).length, 1);
  const refus = [a, b].find((x) => !x.success);
  verifier("l'autre recoit un refus clair",
    /vient d’être prise|vient d'être prise/.test(String(refus && refus.message)), true,
    "« " + (refus && refus.message) + " »");
}

/* ============================================================
   5 · LES CAS TORDUS — GRATUITS, ILS N'ECRIVENT RIEN
   ============================================================ */
titre("5 · CE QUI DOIT ETRE REFUSE (aucun courriel consomme)");
{
  const t = [
    ["champs vides", { _form: "contact" }],
    ["courriel absurde", { _form: "contact", nom: "ZZTEST", email: "pas-une-adresse", message: "x" }],
    ["telephone a deux chiffres", { _form: "urgent", nom: "ZZTEST", telephone: "12",
                                    email: "zztest@exemple.ca", message: "x" }],
    ["texte absurdement long", { _form: "contact", nom: "ZZTEST", email: "zztest@exemple.ca",
                                 message: "x".repeat(9000) }],
    ["formulaire inconnu", { _form: "nimporte_quoi", email: "zztest@exemple.ca" }],
    ["plage forgee a 3 h du matin", { _form: "booking", nom: "ZZTEST", email: "zztest@exemple.ca",
                                      telephone: "418 555 0183", mode: "Appel téléphonique",
                                      plage_iso: "2026-09-01T07:00:00.000Z", sujet: "x" }],
    ["session forgee", { _form: "project", _sid: "../../etc/passwd", _etape: 1, _etapes: 8,
                         email: "zztest@exemple.ca" }]
  ];
  for (const [quoi, charge] of t) {
    const r = await poster(charge);
    verifier(quoi + " : refuse", r.success, false, "« " + String(r.message || r._brut) + " »");
  }

  /* Le honeypot rend un SUCCES et n'ecrit rien : repondre « refuse »
     apprendrait au robot qu'il a ete vu. */
  const avant = (await lire("action=diag")).onglets.find((o) => o.onglet === "Contact simple").lignesTotal;
  const h = await poster({ _form: "contact", nom: "ZZTEST Robot", email: "zztest@exemple.ca",
                           message: "x", _gotcha: "je suis un robot" });
  verifier("le honeypot rend un succes", h.success, true);
  verifier("il le jette en silence", h.ignore, true);
  const apres = (await lire("action=diag")).onglets.find((o) => o.onglet === "Contact simple").lignesTotal;
  verifier("et n'ecrit rien", apres - avant, 0);

  /* CARACTERES SPECIAUX ET ACCENTS — ceux-la doivent PASSER. */
  const s = await poster({ _form: "contact", nom: "ZZTEST Éric Côté-Lévesque",
                           email: "zztest@exemple.ca", telephone: "418 555 0184",
                           message: "Ça va très bien — «guillemets», émojis 🔧🇨🇦, <script>alert(1)</script>" });
  verifier("accents, emojis et balises passent", s.success, true);
}

/* ============================================================
   6 · CE QUE CA A COUTE
   ============================================================ */
const fin = await lire("action=diag");
titre("6 · LE QUOTA");
console.log("  avant : " + QUOTA0 + " / 100");
console.log("  apres : " + fin.quota + " / 100");
console.log("  consomme par cette passe : " + (QUOTA0 - fin.quota));

console.log("");
console.log("  LIGNES D'ESSAI LAISSEES DANS LE CLASSEUR :");
fin.onglets.forEach((o) => {
  const n = (o.lignesEssai || []).length;
  if (n) console.log("    " + o.onglet.padEnd(26) + n + " ligne(s) d'essai sur " + o.lignesTotal);
});

if (NETTOYER) {
  console.log("");
  console.log("  *** Le nettoyage NE SE FAIT PAS d'ici : `nettoyerAutotest` et");
  console.log("      `nettoyerRendezVousEssai` se lancent depuis l'editeur Apps");
  console.log("      Script. Aucune porte publique ne doit pouvoir vider un");
  console.log("      classeur — ce serait une porte de destruction ouverte a");
  console.log("      tout le monde.");
}

console.log("");
console.log("============================================================");
console.log(`LA PASSE FINALE : ${cas - echecs} / ${cas}`);
console.log("============================================================");
process.exit(echecs ? 1 : 0);
