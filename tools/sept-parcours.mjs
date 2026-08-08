/* ============================================================
   LES SEPT PARCOURS CONTRE LE VRAI GOOGLE
   `node tools/sept-parcours.mjs`

   IL DÉPENSE DU QUOTA. Le coût exact, MESURÉ au banc et non
   estimé (`tools/faux-google.mjs`, 2026-08-07) :

     contact       2   (avis interne + confirmation)
     urgence       2
     lead magnet   1   (avis interne seul)
     projet        3   (1 à la naissance + 2 à la confirmation)
     estimation    3
     référence     3
     réservation   3
     ------------------
     TOTAL        17

   La double réservation sur la même plage coûte 0 : elle est
   refusée avant tout envoi. Le retour en arrière coûte 0 : une
   étape intermédiaire n'envoie rien.

   IL EXIGE UNE MARGE, ET VOICI POURQUOI. Le compteur de Google
   n'est pas un solde (RESERVES.md) : relevé le 2026-08-06, TROIS
   naissances de ligne l'ont fait descendre de CINQ. On applique
   donc le facteur mesuré, arrondi vers le haut, et on refuse de
   partir si la marge n'y est pas — plutôt que de mourir au
   sixième parcours en laissant le classeur à moitié rempli.

   Sorties : 0 tout tient · 1 défaut · 2 impossible de conclure.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const VERSION_MINIMALE = 13;

const COUT = { contact: 2, urgent: 2, cadeau: 1, project: 3,
               estimate: 3, refer: 3, booking: 3 };
const TOTAL_COURRIELS = Object.values(COUT).reduce((a, b) => a + b, 0);
/* 5 unités de compteur pour 3 envois réels, relevé en production. */
const FACTEUR = 5 / 3;
const MARGE_EXIGEE = Math.ceil(TOTAL_COURRIELS * FACTEUR) + 10;

const env = fs.readFileSync(path.join(RACINE, ".env.local"), "utf8");
const m = /^ADEXWEB_WEB_APP_URL=(.+)$/m.exec(env);
if (!m) { console.error("ADEXWEB_WEB_APP_URL absent de .env.local"); process.exit(2); }
const SERVICE = m[1].trim();

let n = 0, ko = 0;
function dire(nom, obtenu, attendu, note) {
  n++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) ko++;
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + nom
    + (ok ? "" : "\n         obtenu  : " + JSON.stringify(obtenu)
             + "\n         attendu : " + JSON.stringify(attendu)
             + (note ? "\n         " + note : "")));
}
function titre(t) { console.log(""); console.log("--- " + t); }

async function lire(q) {
  const r = await fetch(SERVICE + (q ? "?" + q : ""), { redirect: "follow" });
  const t = await r.text();
  try { return JSON.parse(t); } catch { return null; }
}
/* Le service rend parfois 404 : on réessaie, et c'est sans danger —
   `traiter()` cherche la signature avant tout effet de bord. D-730 */
async function poster(charge, essais = 3) {
  for (let i = 1; i <= essais; i++) {
    try {
      const r = await fetch(SERVICE, {
        method: "POST", redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(charge)
      });
      const t = await r.text();
      try { return JSON.parse(t); } catch {}
    } catch (e) {}
    await new Promise((r2) => setTimeout(r2, 1400));
  }
  console.error("ARRET · le service n'a pas rendu de JSON après " + essais + " essais.");
  process.exit(2);
}

const MARQUE = "ZZ7P";
const sid = (p) => (MARQUE + p + Math.random().toString(36).slice(2, 12)).slice(0, 32);
const cell = (l, t) => (l.cellules || []).find((c) => c.titre === t) || {};

async function ligneDe(onglet, marqueur) {
  const d = await lire("action=diag");
  const o = (d.onglets || []).find((x) => x.onglet === onglet);
  if (!o) return null;
  const cand = (o.lignesEssai || []).filter((l) =>
    (l.cellules || []).some((c) => String(c.valeur || "").indexOf(marqueur) !== -1));
  cand.sort((a, b) => a.ligne - b.ligne);
  return cand.length ? cand[0] : null;
}

/* ============================================================ */
const vie = await lire("");
if (!vie) { console.error("Le service n'a pas répondu."); process.exit(2); }
console.log("============================================================");
console.log("LES SEPT PARCOURS · version déployée " + vie.version
  + " (minimum " + VERSION_MINIMALE + ")");
if (!(Number(vie.version) >= VERSION_MINIMALE)) {
  console.error("ARRET — déploiement trop vieux pour être jugé.");
  console.error("Éditeur > Déployer > Gérer les déploiements > crayon > Nouvelle version.");
  process.exit(2);
}
const depart = await lire("action=diag");
console.log("QUOTA AU DÉPART : " + depart.quota);
console.log("COÛT ANNONCÉ    : " + TOTAL_COURRIELS + " courriels");
console.log("MARGE EXIGÉE    : " + MARGE_EXIGEE
  + "   (le compteur de Google n'est pas un solde — RESERVES.md)");
console.log("============================================================");

if (Number(depart.quota) < MARGE_EXIGEE) {
  console.error("");
  console.error("ARRET — il ne reste que " + depart.quota + " au compteur.");
  console.error("Mourir au sixième parcours laisserait le classeur à moitié");
  console.error("rempli et aucune conclusion possible. Le quota se recharge");
  console.error("vers 3 h ; relancez après.");
  process.exit(2);
}

const R = {};   /* ce qui a été envoyé, pour la relecture */

/* ============================================================
   A · LES TROIS FORMULAIRES D'UNE SEULE PAGE
   ============================================================ */
titre("A · CONTACT · URGENCE · GUIDES");
for (const [kind, onglet, charge] of [
  ["contact", "Contact simple", { nom: MARQUE + " Contact", email: "zz@exemple.ca",
    telephone: "819 523-0871", message: "Essai de parcours complet. À supprimer." }],
  ["urgent", "Urgence", { nom: MARQUE + " Urgence", email: "zz@exemple.ca",
    telephone: "819 523-0871", entreprise: MARQUE + " inc", systeme: "Le site",
    gravite: "Complètement bloqué", depuis_quand: "Aujourd’hui",
    message: "Essai de parcours complet. À supprimer.", impact: "Rien" }],
  ["cadeau", "Lead magnet", { email: "zz@exemple.ca", telephone: "819 523-0871",
    documents: "Les deux guides", origine: "Popup guides" }]
]) {
  const r = await poster(Object.assign({ _form: kind, _final: true }, charge));
  dire(kind + " · la demande passe", r.success, true, JSON.stringify(r).slice(0, 200));
  R[kind] = { onglet: onglet, charge: charge };
}

/* ============================================================
   B · LES QUATRE PARCOURS À ÉTAPES
   ============================================================ */
titre("B · PROJET — injection, retour en arrière, prix");
{
  const s = sid("pr");
  const POISON = "=1+1";
  await poster({ _form: "project", _sid: s, _etape: 1, _etapes: 8,
    nom: MARQUE + " Projet", email: "zz@exemple.ca" });

  /* Le poison arrive à l'étape 3… */
  await poster({ _form: "project", _sid: s, _etape: 3, _etapes: 8,
    email: "zz@exemple.ca", entreprise: POISON, ville: "Shawinigan" });

  /* …puis on corrige UN AUTRE champ : c'est ce passage qui
     rallumait la formule avant D-761. */
  const r = await poster({ _form: "project", _sid: s, _etape: 7, _etapes: 8, _final: true,
    nom: MARQUE + " Projet Corrigé", email: "zz@exemple.ca",
    entreprise: "", ville: "",                 /* vides : ne doivent RIEN effacer */
    telephone: "819 523-0871", domaine: "Garage et mécanique",
    nombre_employes: "2 à 10", objectif: "Vendre en ligne",
    besoins: "Site vitrine", site_existant: "Non",
    ampleur: "1 à 5 pages", niveau_design: "Essentiel",
    contenu: "Prêts", fonctions: "Aucune",
    budget: "Je ne sais pas encore", echeancier: "Pas pressé, j’explore",
    description: "Essai de parcours complet. À supprimer.",
    fourchette_vue: "essai" });
  dire("le projet se complète", r.success, true, JSON.stringify(r).slice(0, 200));

  const l = await ligneDe("Démarrer un projet", MARQUE + " Projet Corrigé");
  if (!l) { console.error("ARRET · ligne du projet introuvable"); process.exit(2); }
  console.log("         ligne " + l.ligne + " du classeur");
  dire("le nom corrigé a écrasé", String(cell(l, "Nom").valeur || ""), MARQUE + " Projet Corrigé");
  dire("l'entreprise vide n'a RIEN effacé", String(cell(l, "Entreprise").valeur || ""), POISON);
  dire("et elle ne porte AUCUNE formule", String(cell(l, "Entreprise").formule || ""), "",
    "c'est getFormulas() qui tranche, jamais la valeur affichée");
  dire("la ville vide non plus", String(cell(l, "Ville").valeur || ""), "Shawinigan");
  dire("la ligne est marquée complète",
    String(cell(l, "Étape").valeur || "").indexOf("✓"), 0);
  dire("aucune cellule de la ligne n'est une formule",
    (l.cellules || []).filter((c) => String(c.formule || "") !== "").length, 0);
  dire("le prix vu est dans le classeur",
    String(cell(l, "Fourchette vue").valeur || "").length > 0, true);
}

titre("C · ESTIMATION — le prix et la réponse du client");
{
  const s = sid("es");
  await poster({ _form: "estimate", _sid: s, _etape: 9, _etapes: 11,
    nom: MARQUE + " Estim", email: "zz@exemple.ca" });
  const r = await poster({ _form: "estimate", _sid: s, _etape: 10, _etapes: 11, _final: true,
    nom: MARQUE + " Estim", email: "zz@exemple.ca", telephone: "819 523-0871",
    type_de_projet: "Site vitrine", domaine: "Garage et mécanique",
    ampleur: "1 à 5 pages", niveau_design: "Essentiel", contenu: "Prêts",
    fonctions: "Aucune", echeancier: "Pas pressé, j’explore", site_existant: "Non",
    fourchette_vue: "essai de fourchette" });
  dire("l'estimation se complète", r.success, true);

  /* La réaction au prix part APRÈS, comme sur le site. Aucun
     courriel : c'est une fusion. */
  await poster({ _form: "estimate", _sid: s, _etape: 10, _etapes: 11,
    email: "zz@exemple.ca",
    prix_reaction: "Non", prix_raison: "Essai — c’est plus que prévu." });

  const l = await ligneDe("Estimation rapide", MARQUE + " Estim");
  if (!l) { console.error("ARRET · ligne d'estimation introuvable"); process.exit(2); }
  dire("le téléphone est là", String(cell(l, "Téléphone").valeur || ""), "819 523-0871");
  dire("LA FOURCHETTE VUE est dans le classeur",
    String(cell(l, "Fourchette vue").valeur || ""), "essai de fourchette");
  dire("LA RÉPONSE du client est là", String(cell(l, "Ça convient ?").valeur || ""), "Non");
  dire("ET SA RAISON aussi",
    String(cell(l, "Pourquoi pas").valeur || "").indexOf("Essai"), 0);
}

titre("D · RÉFÉRENCE — le référent qu'on paie");
{
  const s = sid("rf");
  await poster({ _form: "refer", _sid: s, _etape: 1, _etapes: 5,
    entreprise_referee: MARQUE + " Garage Bilodeau" });
  const r = await poster({ _form: "refer", _sid: s, _etape: 4, _etapes: 5, _final: true,
    entreprise_referee: MARQUE + " Garage Bilodeau",
    contact_reference: "Marie Bilodeau, 418 555 0143",
    domaine: "Garage et mécanique",
    votre_nom: MARQUE + " Referent", votre_email: "zz@exemple.ca",
    votre_entreprise: MARQUE + " Toiture", votre_lien: "Client ou fournisseur" });
  dire("la référence passe SANS téléphone du référent", r.success, true,
    "D-771 l'a rendu optionnel des deux côtés : le site et le service doivent s'accorder");

  const l = await ligneDe("Référer une entreprise", MARQUE + " Garage Bilodeau");
  if (!l) { console.error("ARRET · ligne de référence introuvable"); process.exit(2); }
  dire("son nom est là", String(cell(l, "RÉFÉRENT · nom").valeur || ""), MARQUE + " Referent");
  dire("SON entreprise est là — c'est elle qu'on facture",
    String(cell(l, "RÉFÉRENT · entreprise").valeur || ""), MARQUE + " Toiture");
  dire("l'entreprise référée ne s'y confond pas",
    String(cell(l, "Entreprise référée").valeur || ""), MARQUE + " Garage Bilodeau");
}

titre("E · RÉSERVATION — l'heure identique partout, et la plage prise");
{
  const c = await lire("action=creneaux");
  if (!c || !c.success) { console.error("ARRET · la porte des créneaux n'a rien rendu"); process.exit(2); }
  const jour = (c.jours || []).find((j) => (j.creneaux || []).length);
  if (!jour) { console.error("ARRET · aucun créneau offert : rien à réserver"); process.exit(2); }
  const plage = jour.creneaux[0];
  console.log("         plage visée : " + jour.libelleLong + " · " + plage.h);

  const s = sid("bk");
  await poster({ _form: "booking", _sid: s, _etape: 2, _etapes: 3,
    nom: MARQUE + " Rdv", email: "zz@exemple.ca" });

  const r = await poster({ _form: "booking", _sid: s, _etape: 2, _etapes: 3, _final: true,
    nom: MARQUE + " Rdv", email: "zz@exemple.ca", telephone: "819 523-0871",
    entreprise: MARQUE + " inc", mode: "Appel téléphonique",
    sujet: "Essai de parcours complet",
    plage_demandee: jour.libelleLong + " · " + plage.h, plage_iso: plage.iso });
  dire("la réservation passe", r.success, true, JSON.stringify(r).slice(0, 240));

  /* DEUX RÉSERVATIONS SUR LA MÊME PLAGE. La seconde doit être
     refusée AVANT tout envoi : c'est ce qui la rend gratuite. */
  const r2 = await poster({ _form: "booking", _sid: sid("bk2"), _etape: 2, _etapes: 3, _final: true,
    nom: MARQUE + " Rdv Second", email: "zz@exemple.ca", telephone: "819 523-0872",
    mode: "Appel téléphonique",
    plage_demandee: jour.libelleLong + " · " + plage.h, plage_iso: plage.iso });
  dire("la MÊME plage est refusée la seconde fois", r2.success, false,
    "message rendu : " + JSON.stringify(r2.message));
  dire("et le refus explique quoi faire",
    /prise|autre|choisis/i.test(String(r2.message || "")), true);

  const l = await ligneDe("Réserver un appel", MARQUE + " Rdv");
  if (!l) { console.error("ARRET · ligne de réservation introuvable"); process.exit(2); }
  const vue = String(cell(l, "Plage demandée").valeur || "");
  dire("L'HEURE DU CLASSEUR est celle de l'écran", vue, jour.libelleLong + " · " + plage.h);
  dire("le mode est retenu", String(cell(l, "Mode").valeur || ""), "Appel téléphonique");

  /* LA PLAGE A VRAIMENT DISPARU DE LA PORTE. Le cache est vidé par
     `oublierCreneaux` juste après la pose : si elle est encore
     offerte, c'est que l'invalidation n'a pas eu lieu. */
  const c2 = await lire("action=creneaux");
  const encore = (c2.jours || []).some((j) =>
    (j.creneaux || []).some((x) => x.iso === plage.iso));
  dire("la plage n'est plus offerte", encore, false,
    "sinon deux clients la choisiraient, et le second serait refusé après avoir tout rempli");
}

/* ============================================================ */
const fin = await lire("action=diag");
console.log("");
console.log("============================================================");
console.log("QUOTA : " + depart.quota + " → " + fin.quota
  + "   (annoncé " + TOTAL_COURRIELS + " courriels)");
console.log("");
console.log("À NETTOYER, APRÈS AVOIR LU CE QUI PRÉCÈDE :");
console.log("  · dans l'éditeur Apps Script : nettoyerAutotest(\"" + MARQUE + "\")");
console.log("  · puis nettoyerRendezVousEssai() pour l'événement d'agenda");
console.log("============================================================");
console.log(ko ? ("UN PARCOURS NE TIENT PAS : " + ko + " échec(s) sur " + n)
              : ("LES SEPT PARCOURS TIENNENT : " + n + " / " + n));
console.log("============================================================");
process.exit(ko ? 1 : 0);
