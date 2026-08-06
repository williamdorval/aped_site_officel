/* ============================================================
   PLUSIEURS AGENDAS, LA TROISIEME PORTE, ET LE VERROU RESSERRE
   `node tools/agenda-multi-check.mjs`

   POURQUOI CET OUTIL EXISTE.
   Le 2026-08-06, un blocage pose dans Google Agenda ne bloquait
   rien sur le site. Ce n'etait pas un defaut de lecture : le
   blocage etait dans l'agenda PERSONNEL, et le script ne lit que
   celui de l'agence. Le site offrait donc une journee entiere
   deja prise, sans qu'aucun controle ne s'en apercoive — ni ici,
   ni la-bas, ni dans les 41 cas de `creneaux-check.mjs`, qui ne
   posaient jamais qu'un seul agenda.

   TROIS CHANTIERS, TROIS SECTIONS :
     1-3 · plusieurs agendas       — D-736
     4   · la porte de diagnostic  — D-737
     5   · le verrou resserre      — D-738

   IL EXECUTE LE VRAI `google/Code.gs`. Les fonctions appelees
   sont celles qui repondront en production, ligne pour ligne.
   ============================================================ */
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const { gs, gsSansAvance, etat } = await import(pathToFileURL(path.join(ICI, "faux-google.mjs")).href);

const D = gs.DISPONIBILITES;
/* LES DEUX INSTANCES ONT CHACUNE LEUR `DISPONIBILITES`. Elles
   partagent `etat` — memes evenements, meme classeur — parce que les
   bouchons le referment ; elles ne partagent AUCUNE variable de
   `Code.gs`, qui est evalue deux fois. Regler la liste sur l'une et
   interroger l'autre donnait « 42 jours entierement libres » sur un
   agenda illisible : le defaut etait dans l'outil, et il ressemblait
   trait pour trait au defaut qu'on cherche. */
const D2 = gsSansAvance.DISPONIBILITES;
function agendasEnPlus(liste) {
  D.CALENDRIERS_EN_PLUS = liste.slice();
  D2.CALENDRIERS_EN_PLUS = liste.slice();
}
const PERSO = "moi@exemple.ca";
let echecs = 0;
let cas = 0;

function titre(t) { console.log(""); console.log("--- " + t); }

function verifier(nom, obtenu, attendu, note) {
  cas++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) echecs++;
  console.log(
    "  " + (ok ? "OK   " : "ECHEC") + " " + nom
    + "\n         obtenu  : " + obtenu
    + "\n         attendu : " + attendu
    + (note ? "\n         " + note : "")
  );
}

/* LA REMISE A ZERO VIDE AUSSI LE CLASSEUR, et ca a coute un faux
   verdict : sans ca, la ligne d'essai de la section 4 restait la, la
   section 5 en comptait deux, et l'outil accusait `Code.gs` d'ecrire
   en double. L'instrument avait tort. On garde les en-tetes. */
function remise() {
  etat.evenements.length = 0;
  etat.agendasConnus.length = 0;
  etat.agendasConnus.push("primary");
  agendasEnPlus([]);
  etat.courriels.length = 0;
  etat.quota = 100;
  for (const f of etat.feuilles.values()) {
    f.valeurs.length = Math.min(f.valeurs.length, 1);
    f.ecrites.clear();
    f.formules.clear();
    f.formatsTexte.length = 0;
    f.formatApresValeurs = 0;
  }
}

/* La porte des creneaux, telle que le site l'appelle. */
function creneaux() {
  return JSON.parse(gs.doGet({ parameter: { action: "creneaux" } }).getContent());
}
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
  return JSON.parse(gs.doPost({
    postData: { contents: JSON.stringify(charge) }, parameter: {}
  }).getContent());
}

/* UN JOUR FRANCHEMENT DANS LA FENETRE : au-dela du preavis de 24 h,
   bien avant l'horizon. On le prend sur la reponse elle-meme plutot
   que de le calculer — le calculer, c'est reecrire le code teste.

   ON PREND LE PLUS GARNI, PAS LE PREMIER. Le premier jour rendu est
   TOUJOURS rogne par le preavis de 24 h : il n'a qu'une partie de sa
   grille. Compter ses creneaux et conclure « la grille en donne
   dix » etait faux de cinq, et l'outil accusait le reglage. */
function jourPlein(rep) {
  const jours = (rep.jours || []).slice().sort((a, b) => b.creneaux.length - a.creneaux.length);
  if (!jours.length) { console.error("aucun jour offert : le banc est mal pose"); process.exit(1); }
  return jours[0];
}

gs.initialiser();

/* ============================================================
   1 · UN BLOCAGE DANS UN AUTRE AGENDA COMPTE
   ============================================================ */
titre("1 · LE BLOCAGE POSE DANS L'AGENDA PERSONNEL");
{
  remise();
  const avant = creneaux();
  const j = jourPlein(avant);
  const nAvant = j.creneaux.length;

  /* LE CAS DU 2026-08-06, REJOUE. On pose la journee entiere dans un
     agenda personnel, et on regarde. */
  etat.evenements.push({ titre: "pas dispo", jour: j.date, agenda: PERSO });
  etat.agendasConnus.push(PERSO);

  const sansListe = creneaux();
  verifier("agenda personnel NON declare : le blocage ne compte pas",
    heuresDu(sansListe, j.date).length, nAvant,
    "c'est le defaut du 2026-08-06, garde ici comme temoin");

  agendasEnPlus([PERSO]);
  const avecListe = creneaux();
  verifier("agenda personnel declare : la journee disparait",
    heuresDu(avecListe, j.date).length, 0);
  verifier("le jour n'est plus rendu du tout",
    (avecListe.jours || []).some((x) => x.date === j.date), false);

  /* ET LES AUTRES JOURS NE BOUGENT PAS — un blocage qui emporterait
     toute la semaine serait aussi faux qu'un blocage qui n'emporte
     rien, et se verrait moins. */
  const autre = (avant.jours || []).find((x) => x.date !== j.date && x.creneaux.length >= 3);
  verifier("les autres jours sont intacts",
    heuresDu(avecListe, autre.date).join(" "), heuresDu(avant, autre.date).join(" "));
}

{
  remise();
  etat.agendasConnus.push(PERSO);
  agendasEnPlus([PERSO]);
  const avant = creneaux();
  const j = jourPlein(avant);
  const h = j.creneaux[1].h;
  const iso = j.creneaux[1].iso;

  /* UN EVENEMENT D'UNE HEURE, pas toute la journee : il ne doit
     emporter que ce qu'il touche, tampon compris. */
  etat.evenements.push({
    titre: "dentiste", agenda: PERSO,
    debut: new Date(iso), fin: new Date(new Date(iso).getTime() + 30 * 60000)
  });
  const apres = creneaux();
  verifier("un evenement partiel emporte SA plage",
    heuresDu(apres, j.date).includes(h), false);
  verifier("il n'emporte pas la journee",
    heuresDu(apres, j.date).length > 0, true,
    "reste : " + heuresDu(apres, j.date).join(" "));
}

/* ============================================================
   2 · ON NE PEUT PAS RESERVER PAR-DESSUS
   ============================================================ */
titre("2 · LA RESERVATION REFUSE CE QUE L'AUTRE AGENDA OCCUPE");
{
  remise();
  etat.agendasConnus.push(PERSO);
  const rep = creneaux();
  const j = jourPlein(rep);
  const iso = j.creneaux[1].iso;

  /* On bloque APRES avoir lu la liste — c'est le cas reel : le
     visiteur a vu la plage, quelqu'un l'a prise entre-temps. */
  etat.evenements.push({
    titre: "deja pris", agenda: PERSO,
    debut: new Date(iso), fin: new Date(new Date(iso).getTime() + 30 * 60000)
  });
  agendasEnPlus([PERSO]);

  const r = poster({
    _form: "booking", nom: "ZZTEST Croise", email: "zztest@exemple.ca",
    telephone: "418 555 0101", mode: "Appel téléphonique",
    plage_iso: iso, sujet: "collision inter-agendas"
  });
  verifier("la reservation est refusee", r.success, false);
  verifier("le message renvoie a un autre choix",
    /vient d’être prise|vient d'être prise/.test(String(r.message)), true,
    "message : « " + r.message + " »");
  verifier("aucun evenement n'a ete cree",
    etat.evenements.filter((e) => String(e.titre).indexOf("Appel APED") === 0).length, 0);
}

/* ============================================================
   3 · UN AGENDA ILLISIBLE FERME LA PORTE, IL NE L'OUVRE PAS
   ============================================================ */
titre("3 · L'AGENDA QU'ON NE SAIT PAS LIRE");
{
  remise();
  /* Declare mais JAMAIS partage — la faute la plus probable. */
  agendasEnPlus(["jamais-partage@exemple.ca"]);

  const r = creneaux();
  verifier("la porte des creneaux refuse", r.success, false);
  verifier("elle ne rend surtout pas une journee libre",
    (r.jours || []).length, 0,
    "« zero occupation » voudrait dire « tout est libre »");
  verifier("elle ne divulgue pas l'adresse de l'agenda",
    String(r.message).indexOf("@") === -1, true,
    "message : « " + r.message + " »");
}
{
  remise();
  etat.agendasConnus.push(PERSO);
  const bon = creneaux();
  const j = jourPlein(bon);
  const iso = j.creneaux[1].iso;

  agendasEnPlus(["jamais-partage@exemple.ca"]);
  const r = poster({
    _form: "booking", nom: "ZZTEST Aveugle", email: "zztest2@exemple.ca",
    telephone: "418 555 0102", mode: "Appel téléphonique",
    plage_iso: iso, sujet: "agenda illisible"
  });
  verifier("la reservation refuse elle aussi", r.success, false);
  verifier("le message dit qu'on n'a pas pu verifier",
    /vérifier les disponibilités/.test(String(r.message)), true,
    "message : « " + r.message + " »");
}
{
  remise();
  agendasEnPlus(["primary", "primary", ""]);
  const r = creneaux();
  verifier("un doublon dans la liste ne casse rien", r.success, true);
  verifier("il n'est compte qu'une fois",
    JSON.parse(gs.doGet({ parameter: {} }).getContent()).calendriers.join(","), "primary");
}

/* ============================================================
   4 · LA PORTE DE DIAGNOSTIC
   ============================================================ */
titre("4 · LA TROISIEME PORTE — CE QU'ELLE MONTRE ET CE QU'ELLE TAIT");
{
  remise();

  /* Une VRAIE demande de client, qui ne doit jamais ressortir. */
  poster({
    _form: "contact", nom: "Client Reel", email: "client.reel@garage-x.ca",
    telephone: "418 555 0199", message: "Mon site est brise depuis mardi."
  });
  /* Une demande d'essai, qui peut ressortir. */
  poster({
    _form: "contact", nom: "ZZTEST Injection", email: "zztest@exemple.ca",
    telephone: "418 555 0100", message: "=1+1"
  });

  const d = JSON.parse(gs.doGet({ parameter: { action: "diag" } }).getContent());
  const onglet = d.onglets.find((o) => o.onglet === "Contact simple");

  verifier("la porte repond", d.success, true);
  verifier("« Statut » est bien la deuxieme colonne",
    onglet.titres[1], "Statut",
    "en-tetes : " + onglet.titres.join(" | "));
  verifier("la premiere ligne est figee", onglet.figees, 1);
  verifier("elle compte les deux lignes", onglet.lignesTotal, 2);

  verifier("elle ne rend QUE la ligne d'essai", onglet.lignesEssai.length, 1);
  const texteRendu = JSON.stringify(d);
  verifier("le client reel ne sort pas d'ici",
    texteRendu.indexOf("Client Reel") === -1 && texteRendu.indexOf("garage-x") === -1, true,
    "aucun parametre ne choisit ce qui est cherche : la liste est en dur");

  /* LE VERDICT DE L'INJECTION, tel que je le lirai en production. */
  const cellule = onglet.lignesEssai[0].cellules.find((c) => c.titre === "Message");
  verifier("le message est range TEL QUEL", cellule.valeur, "=1+1");
  verifier("Sheets ne l'a PAS pris pour un calcul", cellule.formule, "",
    "une formule non vide ici = faille ouverte");
  verifier("la cellule porte le format texte", cellule.format, "@");

  const regle = onglet.regles[0];
  verifier("une seule regle de couleur", onglet.regles.length, 1);
  verifier("elle vise la colonne « Lu par » vide",
    /\$A2<>""/.test(regle.formule) && /2=""/.test(regle.formule), true,
    "formule : " + regle.formule);
  verifier("les largeurs sont rendues",
    onglet.largeurs.length === onglet.titres.length && onglet.largeurs[1] > 0, true,
    "Statut : " + onglet.largeurs[1] + " px");
}

/* ============================================================
   5 · LE VERROU NE TIENT PLUS PENDANT LES COURRIELS
   ============================================================ */
titre("5 · UN COURRIEL QUI TOMBE NE PERD PLUS LA DEMANDE");
{
  remise();
  /* Le quota a zero : `MailApp.sendEmail` leve. Avant D-738, cette
     levee remontait a `doPost`, qui rendait « le service a rencontre
     une erreur » sur une demande DEJA ECRITE. */
  etat.quota = 0;
  const r = poster({
    _form: "contact", nom: "ZZTEST Quota", email: "zztest@exemple.ca",
    telephone: "418 555 0103", message: "le courrier ne part pas"
  });
  verifier("le visiteur recoit un succes", r.success, true);
  verifier("la ligne porte un numero", r.ligne > 1, true, "ligne " + r.ligne);

  const d = JSON.parse(gs.doGet({ parameter: { action: "diag" } }).getContent());
  const o = d.onglets.find((x) => x.onglet === "Contact simple");
  verifier("la demande est bien au classeur", o.lignesEssai.length, 1);

  const note = o.lignesEssai[0].cellules.find((c) => c.titre === "Notes internes");
  verifier("et le classeur DIT que personne n'a ete prevenu",
    /QUOTA/.test(String(note.valeur)), true,
    "« " + String(note.valeur).slice(0, 60) + " »");
}
{
  remise();
  const r = poster({
    _form: "contact", nom: "ZZTEST Normal", email: "zztest@exemple.ca",
    telephone: "418 555 0104", message: "chemin normal"
  });
  verifier("quota plein : la demande passe", r.success, true);
  verifier("les deux courriels partent quand meme", etat.courriels.length, 2,
    etat.courriels.map((c) => c.to).join(" · "));
  verifier("l'avis interne repond au client",
    etat.courriels.filter((c) => c.replyTo === "zztest@exemple.ca").length, 1);
}

/* ============================================================
   6 · LA GRILLE ELLE-MEME
   ============================================================ */
titre("6 · CE QUE LA GRILLE REGLEE DONNE PAR JOUR");
{
  remise();
  const rep = creneaux();
  const j = jourPlein(rep);
  const pas = D.DUREE_CRENEAU_MIN + D.TAMPON_MIN;
  const [h0, m0] = D.HEURE_DEBUT.split(":").map(Number);
  const [h1, m1] = D.HEURE_FIN.split(":").map(Number);
  const attendu = Math.floor(((h1 * 60 + m1) - (h0 * 60 + m0) - D.DUREE_CRENEAU_MIN) / pas) + 1;

  verifier("creneaux par jour plein", heuresDu(rep, j.date).length, attendu,
    D.HEURE_DEBUT + "–" + D.HEURE_FIN + ", " + D.DUREE_CRENEAU_MIN
    + " min + " + D.TAMPON_MIN + " min de tampon, " + (D.PAUSES || []).length + " pause(s)");
  verifier("aucune pause n'est declaree", (D.PAUSES || []).length, 0);
  verifier("sept jours sur sept", D.JOURS_OUVRABLES.slice().sort().join(","), "0,1,2,3,4,5,6");

  /* LE SAMEDI ET LE DIMANCHE SONT OFFERTS — c'est le changement
     demande, et un tableau `JOURS_OUVRABLES` juste ne prouve rien si
     la porte n'en rend pas la couleur. */
  const jsem = (rep.jours || []).map((x) => new Date(x.creneaux[0].iso).getUTCDay());
  const rendus = new Set((rep.jours || []).map((x) => {
    const p = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", weekday: "short" });
    return p.format(new Date(x.creneaux[0].iso));
  }));
  verifier("la porte rend bien des samedis et des dimanches",
    rendus.has("Sat") && rendus.has("Sun"), true,
    "jours vus : " + [...rendus].join(" "));
  /* Le dernier depart possible = fermeture moins la duree d'un
     appel. On l'ecrit en minutes, pas en cas particuliers. */
  const dernier = (h1 * 60 + m1) - D.DUREE_CRENEAU_MIN;
  verifier("le dernier creneau finit pile a l'heure de fermeture",
    heuresDu(rep, j.date).slice(-1)[0],
    Math.floor(dernier / 60) + " h " + String(dernier % 60).padStart(2, "0"),
    "premier : " + heuresDu(rep, j.date)[0]);
  verifier("le premier creneau part a l'heure d'ouverture",
    heuresDu(rep, j.date)[0], h0 + " h " + String(m0).padStart(2, "0"));
  void jsem;
}

/* ============================================================
   7 · LE REPLI — LE SERVICE AVANCE N'EST PAS ACTIVE

   C'EST L'ETAT PAR DEFAUT DE TOUTE NOUVELLE INSTALLATION, et il
   n'avait jamais ete exerce : le banc fournissait toujours
   `Calendar`, donc les 41 cas de `creneaux-check.mjs` passaient
   tous par la branche d'a cote. Une mutation l'a montre le
   2026-08-06 — casser le repli ne faisait tomber aucun cas.
   ============================================================ */
titre("7 · LE REPLI CalendarApp, SANS SERVICE AVANCE");
{
  remise();
  const sansAvance = (p) => JSON.parse(gsSansAvance.doGet({ parameter: p }).getContent());

  const r = sansAvance({ action: "creneaux" });
  verifier("le repli rend quand meme des creneaux", r.success, true);
  const j = jourPlein(r);
  verifier("la grille est la meme qu'avec le service avance",
    j.creneaux.length, 15);

  /* UN BLOCAGE COMPTE AUSSI PAR LE REPLI. */
  etat.evenements.push({ titre: "bloque", jour: j.date });
  const apres = sansAvance({ action: "creneaux" });
  verifier("une journee bloquee disparait aussi sans service avance",
    heuresDu(apres, j.date).length, 0);

  /* LE REPLI NE SAIT PAS LIRE « Disponible » — il bloque tout, et
     le bloc DISPONIBILITES le dit deja. On le PROUVE ici. */
  etat.evenements.length = 0;
  const j2 = jourPlein(sansAvance({ action: "creneaux" }));
  etat.evenements.push({ titre: "note", jour: j2.date, disponible: true });
  verifier("« Disponible » bloque aussi par le repli (il ne sait pas lire la marque)",
    heuresDu(sansAvance({ action: "creneaux" }), j2.date).length, 0);

  /* ET UN AGENDA ILLISIBLE FERME LA PORTE PAR CE CHEMIN AUSSI —
     c'est ce que la mutation du 2026-08-06 a montre non couvert. */
  etat.evenements.length = 0;
  agendasEnPlus(["jamais-partage@exemple.ca"]);
  const bloque = sansAvance({ action: "creneaux" });
  verifier("agenda illisible : le repli refuse lui aussi", bloque.success, false);
  verifier("il ne rend pas une journee libre", (bloque.jours || []).length, 0);
}
{
  remise();
  /* LA RESERVATION PAR LE REPLI : l'evenement se cree, sans Meet. */
  const r0 = JSON.parse(gsSansAvance.doGet({ parameter: { action: "creneaux" } }).getContent());
  const j = jourPlein(r0);
  const iso = j.creneaux[2].iso;
  const rep = JSON.parse(gsSansAvance.doPost({
    postData: { contents: JSON.stringify({
      _form: "booking", nom: "ZZTEST Repli", email: "zztest@exemple.ca",
      telephone: "418 555 0105", mode: "Google Meet",
      plage_iso: iso, sujet: "sans service avance"
    }) }, parameter: {}
  }).getContent());

  verifier("la reservation passe par le repli", rep.success, true);
  const pose = etat.evenements.filter((e) => String(e.titre).indexOf("Appel APED") === 0);
  verifier("l'evenement est bien cree", pose.length, 1, pose[0] && pose[0].titre);
  verifier("mais SANS lien Meet — le repli ne sait pas en faire",
    rep.meet || "", "",
    "c'est pour ca que le guide fait activer le service avance");
  verifier("et le creneau disparait de l'affichage",
    heuresDu(JSON.parse(gsSansAvance.doGet({ parameter: { action: "creneaux" } }).getContent()),
             j.date).includes(j.creneaux[2].h), false);
}

console.log("");
console.log("============================================================");
console.log(`AGENDAS, DIAGNOSTIC, VERROU : ${cas - echecs} / ${cas}`);
console.log("============================================================");
process.exit(echecs ? 1 : 0);
