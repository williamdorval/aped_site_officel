/* ============================================================
   LES CRENEAUX — CE QUI DISPARAIT QUAND ON BLOQUE, ET CE QUI RESTE
   `node tools/creneaux-check.mjs`

   POURQUOI CET OUTIL EXISTE.
   La promesse faite dans le guide est precise : « creez un
   evenement sur toute la journee depuis votre telephone, et la
   journee disparait du site ». Une promesse pareille ne se verifie
   pas en relisant le code — elle se verifie en posant l'evenement
   et en REGARDANT le creneau partir.

   Il n'y a rien a regarder ici : ce sont des heures, pas des
   pixels. L'arbitre est donc la LISTE, avant et apres, et l'ecart
   entre les deux. Chaque cas imprime combien de creneaux existaient,
   combien il en reste, et lesquels ont bougé.

   IL EXECUTE LE VRAI `google/Code.gs`, pas une reimplementation :
   `tools/faux-google.mjs` le lit et l'evalue avec des services
   Google en memoire. Les fonctions appelees ici — `creneauxLibres`,
   `doPost`, `poserRendezVous` — sont celles qui repondront en
   production, ligne pour ligne.

   CE QU'IL NE PROUVE PAS, ET IL FAUT LE DIRE :
   · que le vrai Google Agenda rend `transparency` et `start.date`
     dans la forme attendue — le bouchon les rend dans la forme
     DOCUMENTEE, ce qui n'est pas la meme chose que la forme
     observee ;
   · qu'un vrai lien Meet se cree ;
   · que le service avance a bien ete active dans le compte.
   Ces trois-la se verifient une fois, a la main, etape 8 du guide.
   ============================================================ */
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const { gs, etat } = await import(pathToFileURL(path.join(ICI, "faux-google.mjs")).href);

gs.initialiser();

const D = gs.DISPONIBILITES;
let echecs = 0;
let cas = 0;

function titre(t) {
  console.log("");
  console.log("--- " + t);
}

/* UN VERDICT NE SE REND PAS SANS SON CHIFFRE. « ok » tout seul ne
   se relit pas dans six mois : on imprime toujours ce qui a ete
   compare, meme quand ca passe. */
function verifier(nom, obtenu, attendu) {
  cas++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) echecs++;
  console.log(
    "    " + (ok ? "OK  " : "ECHEC ") + nom
    + "\n         obtenu   : " + obtenu
    + "\n         attendu  : " + attendu
  );
}

function viderCalendrier() { etat.evenements.length = 0; }

/* LA PORTE REPOND DEPUIS UN CACHE DE 90 s.  D-758

   Chaque cas ci-dessous modifie l'agenda puis relit la porte
   IMMEDIATEMENT : sans avancer l'horloge, les onze premiers cas
   liraient tous la reponse du premier, et le fichier rendrait
   « tout tient » sur un moteur qu'il n'aurait jamais interroge.

   On avance le temps du cache plutot que de vider la cle : c'est
   la meme chose pour l'agenda, et ca prouve au passage que
   l'expiration fonctionne. Le cas 12 prouve l'inverse — que le
   cache SERT vraiment tant qu'il n'a pas expire. */
function creneaux() {
  etat.decalageHorloge += 120000;
  const r = gs.doGet({ parameter: { action: "creneaux" } });
  const d = JSON.parse(r.getContent());
  if (d.success !== true) {
    console.error("La porte des creneaux a refuse : " + d.message);
    process.exit(1);
  }
  return d;
}

/* Les creneaux d'un jour, sous forme de liste d'heures lisibles. */
function heuresDu(rep, cle) {
  const j = (rep.jours || []).find((x) => x.date === cle);
  return j ? j.creneaux.map((c) => c.h) : [];
}

function isoDu(rep, cle, h) {
  const j = (rep.jours || []).find((x) => x.date === cle);
  if (!j) return null;
  const c = j.creneaux.find((x) => x.h === h);
  return c ? c.iso : null;
}

function poster(charge) {
  const r = gs.doPost({ postData: { contents: JSON.stringify(charge) }, parameter: {} });
  return JSON.parse(r.getContent());
}

console.log("============================================================");
console.log("LES CRENEAUX — CE QUE L'AGENDA EFFACE");
console.log("============================================================");
console.log("");
console.log("  fuseau              : " + gs.REGLAGES.FUSEAU);
console.log("  jours ouvrables     : " + D.JOURS_OUVRABLES.join(", ") + "   (0 = dimanche)");
console.log("  plage               : " + D.HEURE_DEBUT + " → " + D.HEURE_FIN);
console.log("  pauses              : " + (D.PAUSES.map((p) => p.debut + "–" + p.fin).join(", ") || "aucune"));
console.log("  duree d'un appel    : " + D.DUREE_CRENEAU_MIN + " min");
console.log("  tampon              : " + D.TAMPON_MIN + " min");
console.log("  preavis             : " + D.PREAVIS_HEURES + " h");
console.log("  horizon             : " + D.HORIZON_JOURS + " jours");
console.log("  « Disponible » bloque : " + D.DISPONIBLE_BLOQUE);


/* ============================================================
   0 · LE JOUR D'ESSAI

   ON NE PREND PAS « DEMAIN ». Le preavis de 24 h ampute le premier
   jour offert : sa liste est partielle, et un cas d'essai bati
   dessus mesurerait le preavis en croyant mesurer un blocage. On
   prend le premier jour COMPLET — celui dont la liste est aussi
   longue que la grille theorique.
   ============================================================ */
titre("0 · LE JOUR D'ESSAI");
viderCalendrier();
const base = creneaux();

if (!base.jours.length) {
  console.error("Aucun creneau du tout : verifiez DISPONIBILITES.");
  process.exit(1);
}

const attenduParJour = Math.max(...base.jours.map((j) => j.creneaux.length));
const jourPlein = base.jours.find((j) => j.creneaux.length === attenduParJour);
const CLE = jourPlein.date;
const HEURES = jourPlein.creneaux.map((c) => c.h);

console.log("    jour retenu         : " + CLE + " (" + jourPlein.libelleLong + ")");
console.log("    creneaux ce jour-la : " + HEURES.length + " → " + HEURES.join("  "));
console.log("    total sur " + base.jours.length + " jours  : " + base.total);

/* Le pas de la grille doit valoir duree + tampon. Si quelqu'un
   change `TAMPON_MIN` sans que la grille suive, ca se voit ici. */
{
  const j = jourPlein.creneaux;
  const ecart = (new Date(j[1].iso) - new Date(j[0].iso)) / 60000;
  verifier("le pas de la grille = duree + tampon",
    ecart + " min", (D.DUREE_CRENEAU_MIN + D.TAMPON_MIN) + " min");
}


/* ============================================================
   1 · UN EVENEMENT SUR TOUTE LA JOURNEE BLOQUE LA JOURNEE ENTIERE

   C'est la promesse du guide, celle qu'on tient depuis un
   telephone : un evenement « Vacances » cree en deux gestes dans
   l'application Agenda, et la journee sort du site.
   ============================================================ */
titre("1 · UN EVENEMENT SUR TOUTE LA JOURNEE");
viderCalendrier();
etat.evenements.push({ titre: "Congé", jour: CLE });
const apresJournee = creneaux();

verifier("le jour bloque n'a plus aucun creneau",
  heuresDu(apresJournee, CLE).length, 0);
verifier("le jour bloque a disparu de la liste des jours",
  apresJournee.jours.some((j) => j.date === CLE), false);

/* ET LES AUTRES JOURS N'ONT PAS BOUGE. Un blocage qui deborde est
   aussi faux qu'un blocage qui ne prend pas — et beaucoup plus
   difficile a remarquer, parce que le site continue d'offrir des
   plages. */
const autre = base.jours.find((j) => j.date !== CLE);
verifier("un autre jour garde exactement ses creneaux",
  heuresDu(apresJournee, autre.date).join(" "),
  heuresDu(base, autre.date).join(" "));
verifier("le total a baisse d'exactement une journee pleine",
  base.total - apresJournee.total, HEURES.length);


/* ============================================================
   2 · UN EVENEMENT PARTIEL NE BLOQUE QUE SES HEURES

   Deux heures prises n'emportent pas la journee. Le tampon les
   elargit de `TAMPON_MIN` de chaque cote — c'est voulu, et c'est
   ici qu'on le voit.
   ============================================================ */
titre("2 · UN EVENEMENT DE 14 h A 16 h");
viderCalendrier();
const [an, mois, jour] = CLE.split("-").map(Number);
const debut14 = gs.instantLocal(an, mois, jour, 14, 0);
const fin16 = gs.instantLocal(an, mois, jour, 16, 0);
etat.evenements.push({ titre: "Chantier client", debut: debut14, fin: fin16 });

const apresPartiel = creneaux();
const restantes = heuresDu(apresPartiel, CLE);
const parties = HEURES.filter((h) => restantes.indexOf(h) === -1);

console.log("    avant  : " + HEURES.join("  "));
console.log("    apres  : " + (restantes.join("  ") || "(aucune)"));
console.log("    parties: " + (parties.join("  ") || "(aucune)"));

verifier("la journee n'est PAS entierement bloquee", restantes.length > 0, true);
verifier("au moins un creneau est parti", parties.length > 0, true);

/* CHAQUE CRENEAU PARTI DOIT TOUCHER LA ZONE INTERDITE, ET CHAQUE
   CRENEAU RESTANT DOIT L'EVITER. C'est le seul controle qui prouve
   que le tampon fait ce qu'il dit au lieu de rogner au hasard. */
{
  const marge = D.TAMPON_MIN * 60000;
  const zoneD = debut14.getTime() - marge;
  const zoneF = fin16.getTime() + marge;
  const touche = (iso) => {
    const d = new Date(iso).getTime();
    const f = d + D.DUREE_CRENEAU_MIN * 60000;
    return d - marge < zoneF && f + marge > zoneD;
  };
  const partiesQuiNeTouchentPas = parties.filter((h) => !touche(isoDu(base, CLE, h)));
  const restantesQuiTouchent = restantes.filter((h) => touche(isoDu(base, CLE, h)));
  verifier("aucun creneau parti hors de la zone interdite",
    partiesQuiNeTouchentPas.join(" ") || "aucun", "aucun");
  verifier("aucun creneau restant dans la zone interdite",
    restantesQuiTouchent.join(" ") || "aucun", "aucun");
}


/* ============================================================
   3 · UN RENDEZ-VOUS FRAICHEMENT PRIS BLOQUE SON CRENEAU

   Le visiteur suivant ne doit pas voir la place qui vient d'etre
   prise. Rien de special n'est ecrit pour ca : le rendez-vous
   devient un evenement du calendrier, et la regle du dessus
   s'applique toute seule. C'est justement ce qu'on verifie.
   ============================================================ */
titre("3 · UNE RESERVATION FRAICHE");
viderCalendrier();
const avantResa = creneaux();
const heureVisee = HEURES[Math.floor(HEURES.length / 2)];
const isoVise = isoDu(avantResa, CLE, heureVisee);

const rep1 = poster({
  _form: "booking", nom: "Premiere Personne", email: "premiere@exemple.ca",
  telephone: "418 555 0142", mode: "Google Meet", plage_iso: isoVise,
  plage_demandee: "peu importe, le serveur la reecrit"
});
console.log("    reservation de " + heureVisee + " : " + JSON.stringify(rep1));
verifier("la reservation passe", rep1.success, true);
verifier("un lien Meet est rendu", Boolean(rep1.meet), true);

const apresResa = creneaux();
const resteApres = heuresDu(apresResa, CLE);
console.log("    apres  : " + resteApres.join("  "));
verifier("le creneau reserve a disparu", resteApres.indexOf(heureVisee), -1);
verifier("les autres creneaux du jour sont toujours la",
  resteApres.length, heuresDu(avantResa, CLE).length - 1 - compterVoisinsManquants(avantResa, apresResa, CLE, heureVisee));

/* Le tampon peut emporter les voisins immediats : c'est correct, et
   il faut le compter au lieu de faire semblant que non. */
function compterVoisinsManquants(avant, apres, cle, sauf) {
  const a = heuresDu(avant, cle).filter((h) => h !== sauf);
  const b = heuresDu(apres, cle);
  return a.filter((h) => b.indexOf(h) === -1).length;
}


/* ============================================================
   4 · LA DOUBLE RESERVATION — LE VRAI RISQUE

   Entre l'affichage et la confirmation, quelqu'un d'autre peut
   avoir pris la place. Le site ne peut rien y faire : c'est au
   serveur de revoir la disponibilite au moment d'ecrire.
   ============================================================ */
titre("4 · DEUX PERSONNES SUR LA MEME PLAGE");
const rep2 = poster({
  _form: "booking", nom: "Deuxieme Personne", email: "deuxieme@exemple.ca",
  telephone: "418 555 0199", mode: "Appel téléphonique", plage_iso: isoVise
});
console.log("    seconde tentative : " + JSON.stringify(rep2));
verifier("la seconde est refusee", rep2.success, false);
verifier("le message renvoie au choix des plages",
  /prise/i.test(rep2.message || ""), true);


/* ============================================================
   5 · CE QUI N'EST PAS SUR LA GRILLE NE SE RESERVE PAS

   Le site n'envoie que des instants qu'il a recus de la porte des
   creneaux. Une requete forgee, elle, envoie ce qu'elle veut : 3 h
   du matin un dimanche, ou 9 h 07. Le calendrier serait libre, donc
   le seul controle du double-emploi dirait oui.
   ============================================================ */
titre("5 · UNE PLAGE FORGEE");
viderCalendrier();

/* 3 h du matin, le meme jour. */
const nuit = gs.instantLocal(an, mois, jour, 3, 0);
const repNuit = poster({
  _form: "booking", nom: "Robot", email: "robot@exemple.ca",
  telephone: "418 555 0100", mode: "Appel téléphonique", plage_iso: nuit.toISOString()
});
verifier("3 h du matin est refuse", repNuit.success, false);
console.log("         message : " + repNuit.message);

/* Une heure en plein milieu de la grille, mais decalee de 7 min. */
const decale = new Date(new Date(isoVise).getTime() + 7 * 60000);
const repDecale = poster({
  _form: "booking", nom: "Robot", email: "robot@exemple.ca",
  telephone: "418 555 0100", mode: "Appel téléphonique", plage_iso: decale.toISOString()
});
verifier("un depart decale de 7 min est refuse", repDecale.success, false);

/* Dans moins de 24 h. */
const bientot = new Date(Date.now() + 2 * 3600000);
const repBientot = poster({
  _form: "booking", nom: "Robot", email: "robot@exemple.ca",
  telephone: "418 555 0100", mode: "Appel téléphonique", plage_iso: bientot.toISOString()
});
verifier("dans 2 h est refuse (preavis)", repBientot.success, false);
console.log("         message : " + repBientot.message);


/* ============================================================
   6 · « DISPONIBLE » PLUTOT QU'« OCCUPE »

   Google Agenda laisse marquer un evenement « Disponible ». Le
   reglage livre dit que TOUT bloque, sans exception : c'est la
   seule regle qu'on puisse appliquer depuis un telephone sans se
   tromper. Le reglage inverse existe, et il doit marcher aussi.
   ============================================================ */
titre("6 · UN EVENEMENT MARQUE « DISPONIBLE »");
viderCalendrier();
etat.evenements.push({ titre: "Note perso", jour: CLE, disponible: true });

const avecDispo = creneaux();
verifier("avec DISPONIBLE_BLOQUE = true, il bloque",
  heuresDu(avecDispo, CLE).length, 0);

D.DISPONIBLE_BLOQUE = false;
const sansDispo = creneaux();
verifier("avec DISPONIBLE_BLOQUE = false, il ne bloque pas",
  heuresDu(sansDispo, CLE).length, HEURES.length);
D.DISPONIBLE_BLOQUE = true;


/* ============================================================
   7 · UNE INVITATION REFUSEE NE BLOQUE PAS

   Elle reste affichee, barree, dans l'agenda. La compter volerait
   des heures reellement libres.
   ============================================================ */
titre("7 · UNE INVITATION REFUSEE");
viderCalendrier();
etat.evenements.push({ titre: "Réunion déclinée", debut: debut14, fin: fin16, refuse: true });
const avecRefus = creneaux();
verifier("un « non » ne retire aucun creneau",
  heuresDu(avecRefus, CLE).join(" "), HEURES.join(" "));

/* Et une occurrence supprimee d'une serie non plus. */
viderCalendrier();
etat.evenements.push({ titre: "Série annulée", debut: debut14, fin: fin16, annule: true });
verifier("une occurrence annulee ne retire aucun creneau",
  heuresDu(creneaux(), CLE).join(" "), HEURES.join(" "));


/* ============================================================
   8 · LE FUSEAU, ET LES DEUX DIMANCHES QUI COMPTENT

   Un creneau affiche dans le mauvais fuseau est un appel manque.
   On verifie l'instant EXACT, en UTC, de 9 h a Toronto : −4 h
   l'ete, −5 h l'hiver. Puis on traverse les deux bascules.
   ============================================================ */
titre("8 · LE FUSEAU ET LE CHANGEMENT D'HEURE");

verifier("9 h le 10 aout 2026 (heure avancee, −4)",
  gs.instantLocal(2026, 8, 10, 9, 0).toISOString(), "2026-08-10T13:00:00.000Z");
verifier("9 h le 15 janvier 2027 (heure normale, −5)",
  gs.instantLocal(2027, 1, 15, 9, 0).toISOString(), "2027-01-15T14:00:00.000Z");

/* Le dimanche du printemps : 2 h saute a 3 h. Le lundi qui suit est
   deja a −4. */
verifier("9 h le lundi 9 mars 2026 (lendemain du saut)",
  gs.instantLocal(2026, 3, 9, 9, 0).toISOString(), "2026-03-09T13:00:00.000Z");
verifier("9 h le vendredi 6 mars 2026 (veille du saut)",
  gs.instantLocal(2026, 3, 6, 9, 0).toISOString(), "2026-03-06T14:00:00.000Z");

/* Le dimanche de l'automne : 2 h revient a 1 h. */
verifier("9 h le vendredi 30 octobre 2026 (avant le retour)",
  gs.instantLocal(2026, 10, 30, 9, 0).toISOString(), "2026-10-30T13:00:00.000Z");
verifier("9 h le lundi 2 novembre 2026 (apres le retour)",
  gs.instantLocal(2026, 11, 2, 9, 0).toISOString(), "2026-11-02T14:00:00.000Z");

/* ET L'ETIQUETTE DOIT SUIVRE L'INSTANT. Un instant juste affiche
   sous une mauvaise etiquette est exactement aussi faux qu'un
   instant faux. */
verifier("l'etiquette de 13 h 30 le 10 aout 2026",
  gs.libelleComplet(gs.instantLocal(2026, 8, 10, 13, 30)),
  "lundi 10 août 2026 à 13 h 30");
verifier("l'etiquette de 9 h le 15 janvier 2027",
  gs.libelleComplet(gs.instantLocal(2027, 1, 15, 9, 0)),
  "vendredi 15 janvier 2027 à 9 h 00");

/* Le jour de la semaine, calcule et pas demande. */
verifier("le 10 aout 2026 est un lundi", gs.partsLocal(gs.instantLocal(2026, 8, 10, 9, 0)).jsem, 1);
verifier("le 8 aout 2026 est un samedi", gs.partsLocal(gs.instantLocal(2026, 8, 8, 9, 0)).jsem, 6);

/* AUCUN CRENEAU RENDU NE DOIT TOMBER HORS DES HEURES OUVRABLES,
   PEU IMPORTE LA SAISON. C'est le controle qui attraperait un
   decalage d'une heure introduit par une bascule mal traitee. */
viderCalendrier();
{
  const rep = creneaux();
  const ouvre = Number(D.HEURE_DEBUT.split(":")[0]) * 60 + Number(D.HEURE_DEBUT.split(":")[1]);
  const ferme = Number(D.HEURE_FIN.split(":")[0]) * 60 + Number(D.HEURE_FIN.split(":")[1]);
  let hors = [];
  let mauvaisJour = [];
  rep.jours.forEach((j) => {
    j.creneaux.forEach((c) => {
      const p = gs.partsLocal(new Date(c.iso));
      const m = p.h * 60 + p.min;
      if (m < ouvre || m + D.DUREE_CRENEAU_MIN > ferme) hors.push(j.date + " " + c.h);
      if (D.JOURS_OUVRABLES.indexOf(p.jsem) === -1) mauvaisJour.push(j.date + " " + c.h);
    });
  });
  console.log("    " + rep.total + " creneaux relus sur " + rep.jours.length + " jours");
  verifier("aucun creneau hors des heures ouvrables", hors.join(" ") || "aucun", "aucun");
  verifier("aucun creneau un jour non ouvrable", mauvaisJour.join(" ") || "aucun", "aucun");
}


/* ============================================================
   9 · LA PAUSE

   Un creneau qui chevauche une pause n'existe pas. Sans ce
   controle, une pause mal lue passerait inapercue : la liste
   resterait plausible, avec un appel en plein diner.
   ============================================================ */
titre("9 · LES PAUSES");
{
  const rep = creneaux();
  let dedans = [];
  (D.PAUSES || []).forEach((z) => {
    const zd = Number(z.debut.split(":")[0]) * 60 + Number(z.debut.split(":")[1]);
    const zf = Number(z.fin.split(":")[0]) * 60 + Number(z.fin.split(":")[1]);
    rep.jours.forEach((j) => j.creneaux.forEach((c) => {
      const p = gs.partsLocal(new Date(c.iso));
      const m = p.h * 60 + p.min;
      if (m < zf && m + D.DUREE_CRENEAU_MIN > zd) dedans.push(j.date + " " + c.h);
    }));
  });
  verifier("aucun creneau ne mord sur une pause", dedans.join(" ") || "aucun", "aucun");
}


/* ============================================================
   10 · LA PORTE RESTE UN TEMOIN DE VIE

   `tools/verrou-env.mjs` appelle `doGet` sans parametre pour
   verifier qu'un deploiement repond. Ajouter une seconde porte ne
   doit pas casser la premiere.
   ============================================================ */
titre("10 · LES DEUX PORTES");
{
  const vie = JSON.parse(gs.doGet({}).getContent());
  verifier("doGet sans parametre reste le temoin de vie", vie.service, "ADEXWEB formulaires");
  verifier("il annonce savoir rendre des creneaux", vie.creneaux, true);
  verifier("il ne divulgue aucune adresse",
    JSON.stringify(vie).indexOf("@"), -1);

  const porte = JSON.parse(gs.doGet({ parameter: { action: "creneaux" } }).getContent());
  verifier("la porte des creneaux ne divulgue aucun titre d'evenement",
    JSON.stringify(porte).toLowerCase().indexOf("congé"), -1);
  verifier("elle annonce le fuseau", porte.fuseau, "America/Toronto");
  verifier("elle annonce la duree", porte.duree, D.DUREE_CRENEAU_MIN);
}


/* ============================================================
   VERDICT
   ============================================================ */
console.log("");
console.log("============================================================");
if (echecs === 0) {
  console.log("LES CRENEAUX TIENNENT : " + cas + " / " + cas);
} else {
  console.log("LES CRENEAUX NE TIENNENT PAS : " + echecs + " echec(s) sur " + cas);
}
console.log("============================================================");
process.exit(echecs === 0 ? 0 : 1);
