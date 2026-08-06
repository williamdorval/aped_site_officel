/* ============================================================
   APED AGENCE — LE SERVICE DES FORMULAIRES
   Web App Apps Script, déployée depuis le compte de l'agence.

   CE FICHIER EST LA SEULE PIÈCE SERVEUR DU SITE. Le site est
   statique : il n'a pas de serveur à lui. Les sept formulaires
   passent tous par `doPost`, qui aiguille vers le bon onglet du
   classeur, écrit la ligne, avertit l'agence, et — pour une
   réservation — crée le rendez-vous au calendrier.

   POURQUOI APPS SCRIPT ET PAS UN SERVICE D'ENVOI. Resend, Postmark
   et les équivalents refusent d'expédier depuis une adresse
   `@gmail.com` : ils exigent un domaine vérifié, que l'agence n'a
   pas encore. Le classeur, le calendrier et la boîte vivent déjà
   dans le même compte Google. Un seul système, aucune clé d'API.

   L'ADRESSE DE L'AGENCE N'EST ÉCRITE NULLE PART ICI. Elle se lit à
   l'exécution par `Session.getEffectiveUser().getEmail()`, parce
   que le script s'exécute EN TANT QUE son propriétaire. Ce dépôt
   est public : une adresse en clair dans ce fichier serait une
   adresse publiée. Voir `notifDest()`.

   ORDRE DE LECTURE :
     0. DISPONIBILITÉS   — VOS HEURES. C'est ici qu'on règle
     1. RÉGLAGES         — les quelques nombres qui se règlent
     2. LE SCHÉMA        — les sept onglets et leurs colonnes
     3. INITIALISATION   — `initialiser()`, à lancer une seule fois
     4. L'ENTRÉE         — `doPost`, `doGet`
     5. VALIDATION       — ce qu'on refuse, et pourquoi
     6. LE CLASSEUR      — écriture en ligne 2, dédoublonnage
     7. LE FUSEAU        — Toronto, changement d'heure compris
     8. LES CRÉNEAUX     — la grille, le calendrier, ce qui reste
     9. LE CALENDRIER    — la réservation, le Meet, le double-emploi
    10. LES COURRIELS    — avis interne, confirmation au visiteur
    11. OUTILS           — helpers
   ============================================================ */


/* ============================================================
   0 · DISPONIBILITÉS — LE SEUL BLOC À MODIFIER POUR CHANGER VOS
       HEURES. Rien d'autre dans ce fichier n'a besoin d'être
       touché.

   IL Y A DEUX COUCHES, ET ELLES NE SE MÉLANGENT PAS.

   COUCHE 1 — LA GRILLE, c'est-à-dire ce bloc-ci. Elle dit quand
   vous travaillez EN GÉNÉRAL : quels jours, de quelle heure à
   quelle heure, par tranches de combien.

   COUCHE 2 — LES EXCEPTIONS, et elles vivent DANS GOOGLE AGENDA,
   pas ici. Tout événement du calendrier de l'agence efface les
   créneaux qu'il chevauche. Bloquer un mardi après-midi ne demande
   aucune modification de code : on crée un événement de 13 h à
   17 h depuis le téléphone, et les créneaux disparaissent du site
   à la requête suivante.

   APRÈS TOUTE MODIFICATION DE CE BLOC : « Déployer → Gérer les
   déploiements → crayon → Nouvelle version ». JAMAIS « Nouveau
   déploiement ». Sinon rien ne change côté site, et rien ne le dit.
   ============================================================ */

var DISPONIBILITES = {

  /* LES JOURS OUVRABLES. 0 = dimanche, 1 = lundi … 6 = samedi.
     [1,2,3,4,5] = du lundi au vendredi.
     Pour ouvrir le samedi : [1,2,3,4,5,6]. */
  JOURS_OUVRABLES: [1, 2, 3, 4, 5],

  /* LA PLAGE DE LA JOURNÉE, en heure de Toronto, format « HH:MM ».
     Le dernier créneau COMMENCE assez tôt pour FINIR avant
     HEURE_FIN : avec une fin à 17:00 et des appels de 30 min,
     rien ne démarre après 16:30. */
  HEURE_DEBUT: "09:00",
  HEURE_FIN:   "17:00",

  /* LES PAUSES. Un créneau qui chevauche l'une d'elles n'existe
     pas. Laisser `[]` pour n'en avoir aucune.
     Ce sont des pauses RÉCURRENTES, tous les jours ouvrables ;
     une pause d'un seul jour se met dans Google Agenda. */
  PAUSES: [
    { debut: "12:00", fin: "13:00" }
  ],

  /* LA DURÉE D'UN APPEL, en minutes. Le site l'annonce : si vous
     la changez ici, changez aussi le texte de `index.html`. */
  DUREE_CRENEAU_MIN: 30,

  /* LE TAMPON ENTRE DEUX APPELS, en minutes. Il agit deux fois :
     il espace les créneaux de la grille (30 + 15 = un départ
     toutes les 45 min), ET il élargit la zone interdite autour de
     chaque événement du calendrier. Un rendez-vous chez le dentiste
     à 14 h emporte donc aussi le créneau qui finirait à 13 h 50.
     Mettre 0 pour coller les appels bout à bout. */
  TAMPON_MIN: 15,

  /* LE PRÉAVIS MINIMUM, en heures. Personne ne peut réserver dans
     les 24 prochaines heures. Vérifié DEUX fois : à l'affichage
     des créneaux et à l'enregistrement. */
  PREAVIS_HEURES: 24,

  /* JUSQU'À QUAND ON PEUT RÉSERVER, en jours à partir
     d'aujourd'hui. 42 = six semaines. */
  HORIZON_JOURS: 42,

  /* QUEL CALENDRIER. Vide = le calendrier principal du compte qui
     exécute le script, c'est-à-dire celui de l'agence. C'est ce
     qu'on veut : un seul calendrier, pas de gestion par associé.
     Pour en viser un autre, coller ici son identifiant (Agenda →
     Paramètres du calendrier → « Intégrer l'agenda » → ID). */
  CALENDRIER_ID: "",

  /* UN ÉVÉNEMENT MARQUÉ « DISPONIBLE » BLOQUE-T-IL ?
     Dans Google Agenda, chaque événement porte une visibilité
     d'occupation : « Occupé » (par défaut) ou « Disponible ».

     `true`  — TOUT événement bloque, y compris « Disponible ».
               C'est le réglage livré : la règle devient « ce qui
               est dans mon agenda n'est pas réservable », sans
               exception à retenir. C'est la seule règle qu'on
               puisse appliquer depuis un téléphone sans se
               tromper.
     `false` — un événement « Disponible » laisse le créneau
               ouvert. Utile si vous vous servez de l'agenda comme
               d'un carnet de notes.

     LE REPLI NE SAIT PAS LIRE CETTE MARQUE. Si le service avancé
     Calendar n'est pas activé, le script retombe sur le service
     ordinaire, qui n'expose pas la visibilité : tout bloque, quel
     que soit ce réglage. Encore une raison d'activer le service
     avancé (étape 2 du guide). */
  DISPONIBLE_BLOQUE: true,

  /* UNE INVITATION QUE VOUS AVEZ REFUSÉE bloque-t-elle ?
     Non, et ça ne se règle pas : un rendez-vous auquel vous avez
     répondu « non » n'est pas un engagement. Il reste affiché dans
     l'agenda, barré ; le compter bloquerait des heures libres. */

  /* COMBIEN DE JOURS AVEC CRÉNEAUX ON RENVOIE AU SITE, au plus.
     Une réponse de 42 jours pleins pèse et n'apporte rien : le
     visiteur ne fait jamais défiler jusque-là. */
  JOURS_RENDUS_MAX: 60
};


/* ============================================================
   1 · RÉGLAGES
   ============================================================ */

var REGLAGES = {
  /* Le fuseau de l'agence. Sert à écrire les horodatages et à
     poser les rendez-vous. Tout le Québec est sur celui-là. */
  FUSEAU: "America/Toronto",

  /* Deux soumissions identiques dans cette fenêtre comptent pour
     une seule : la colonne « Renvois » s'incrémente au lieu de
     créer une ligne. Dix minutes couvre le double-clic, l'aller-
     retour d'un visiteur qui doute, et le renvoi après une
     coupure réseau — sans jamais fusionner deux vraies demandes,
     puisque la signature inclut le contenu. */
  FENETRE_DOUBLON_MIN: 10,

  /* LA DURÉE D'UN APPEL NE SE RÈGLE PAS ICI. Elle vit une seule
     fois, dans `DISPONIBILITES.DUREE_CRENEAU_MIN` : une durée
     écrite à deux endroits finit toujours par diverger, et une
     divergence ici pose des rendez-vous plus longs que les
     créneaux annoncés. */

  /* On ne relit que les lignes récentes pour chercher un doublon :
     le classeur peut grossir sans que `doPost` ralentisse. */
  LIGNES_RELUES: 60,

  /* Au-delà, on n'essaie pas de téléverser les pièces jointes :
     un envoi qui expire est pire qu'un envoi sans fichiers, et le
     site sait déjà réessayer sans eux. En octets, APRÈS base64. */
  PIECES_MAX_OCTETS: 8 * 1024 * 1024,

  /* Nom du dossier Drive où atterrissent les pièces jointes. */
  DOSSIER_PIECES: "APED — pièces jointes des formulaires",

  /* Nom du classeur créé par `initialiser()`. */
  NOM_CLASSEUR: "APED — demandes du site"
};

/* Les trois associés. Sert aux listes déroulantes de suivi. */
var ASSOCIES = ["William", "Alan", "Elie"];

/* Les états d'une demande, du premier coup d'œil à la fermeture. */
var STATUTS = ["Nouveau", "Contacté", "En discussion", "Client", "Fermé"];

/* Les deux modes d'un rendez-vous. */
var MODES = { TEL: "Appel téléphonique", MEET: "Google Meet" };


/* ============================================================
   2 · LE SCHÉMA — sept onglets, leurs colonnes, leur ordre

   `champ` est le `name` de l'input dans `index.html`. Il ne se
   renomme JAMAIS : c'est le contrat entre le site et ce fichier.
   `titre` est l'en-tête lisible de la colonne.

   Les colonnes de suivi (Renvois, Lu par, Rappelé par, Statut) et
   la signature sont ajoutées à la fin de chaque onglet par
   `colonnes()` : elles sont identiques partout, on ne les répète
   pas sept fois.
   ============================================================ */

var SCHEMA = {
  project: {
    onglet: "Démarrer un projet",
    sujet: "Nouveau projet",
    requis: ["nom", "entreprise", "email"],
    champs: [
      { champ: "nom",             titre: "Nom",                largeur: 150 },
      { champ: "entreprise",      titre: "Entreprise",         largeur: 170 },
      { champ: "ville",           titre: "Ville",              largeur: 120 },
      { champ: "email",           titre: "Courriel",           largeur: 210 },
      { champ: "telephone",       titre: "Téléphone",          largeur: 130 },
      { champ: "moment_contact",  titre: "Moment de contact",  largeur: 140 },
      { champ: "domaine",         titre: "Domaine",            largeur: 150 },
      { champ: "nombre_employes", titre: "Employés",           largeur: 110 },
      { champ: "site_existant",   titre: "A déjà un site",     largeur: 110 },
      { champ: "site_actuel",     titre: "Site actuel",        largeur: 200 },
      { champ: "besoins",         titre: "Besoins",            largeur: 260 },
      { champ: "objectif",        titre: "Objectif",           largeur: 180 },
      { champ: "budget",          titre: "Budget",             largeur: 150 },
      { champ: "echeancier",      titre: "Échéancier",         largeur: 140 },
      { champ: "description",     titre: "Description",        largeur: 340 },
      { champ: "_pieces",         titre: "Pièces jointes",     largeur: 260 }
    ]
  },

  estimate: {
    onglet: "Estimation rapide",
    sujet: "Demande d'estimation",
    requis: ["nom", "email"],
    champs: [
      { champ: "nom",             titre: "Nom",                largeur: 150 },
      { champ: "email",           titre: "Courriel",           largeur: 210 },
      { champ: "type_de_projet",  titre: "Type de projet",     largeur: 150 },
      { champ: "domaine",         titre: "Domaine",            largeur: 150 },
      { champ: "envergure",       titre: "Envergure",          largeur: 130 },
      { champ: "niveau_design",   titre: "Niveau de design",   largeur: 140 },
      { champ: "echeancier",      titre: "Échéancier",         largeur: 140 },
      { champ: "site_existant",   titre: "A déjà un site",     largeur: 110 }
    ]
  },

  urgent: {
    onglet: "Urgence",
    sujet: "URGENCE",
    requis: ["nom", "telephone", "email", "message"],
    champs: [
      { champ: "nom",             titre: "Nom",                largeur: 150 },
      { champ: "telephone",       titre: "Téléphone",          largeur: 130 },
      { champ: "email",           titre: "Courriel",           largeur: 210 },
      { champ: "message",         titre: "L'urgence",          largeur: 420 }
    ]
  },

  refer: {
    onglet: "Référer une entreprise",
    sujet: "Nouvelle référence",
    requis: ["votre_nom", "votre_email", "votre_lien",
             "entreprise_referee", "contact_reference"],
    champs: [
      { champ: "votre_nom",          titre: "Référent",           largeur: 150 },
      { champ: "votre_email",        titre: "Courriel référent",  largeur: 210 },
      { champ: "votre_telephone",    titre: "Tél. référent",      largeur: 130 },
      { champ: "votre_lien",         titre: "Lien avec l'entreprise", largeur: 180 },
      { champ: "entreprise_referee", titre: "Entreprise référée", largeur: 190 },
      { champ: "domaine",            titre: "Domaine",            largeur: 150 },
      { champ: "taille",             titre: "Taille",             largeur: 130 },
      { champ: "besoin",             titre: "Besoin pressenti",   largeur: 180 },
      { champ: "contact_reference",  titre: "Personne à contacter", largeur: 180 },
      { champ: "contexte",           titre: "Contexte",           largeur: 320 }
    ]
  },

  booking: {
    onglet: "Réserver un appel",
    sujet: "Demande de rendez-vous",
    requis: ["nom", "email", "telephone"],
    champs: [
      { champ: "nom",            titre: "Nom",              largeur: 150 },
      { champ: "entreprise",     titre: "Entreprise",       largeur: 170 },
      { champ: "email",          titre: "Courriel",         largeur: 210 },
      { champ: "telephone",      titre: "Téléphone",        largeur: 130 },
      { champ: "mode",           titre: "Mode",             largeur: 150 },
      { champ: "plage_demandee", titre: "Plage demandée",   largeur: 250 },
      { champ: "sujet",          titre: "Sujet de l'appel", largeur: 320 },
      /* Remplies par le serveur, pas par le formulaire. */
      { champ: "_debut",         titre: "Début",            largeur: 150 },
      { champ: "_meet",          titre: "Lien Meet",        largeur: 230 },
      { champ: "_evenement",     titre: "Événement",        largeur: 230 }
    ]
  },

  contact: {
    onglet: "Contact simple",
    sujet: "Message",
    requis: ["nom", "email", "message"],
    champs: [
      { champ: "nom",       titre: "Nom",       largeur: 150 },
      { champ: "telephone", titre: "Téléphone", largeur: 130 },
      { champ: "email",     titre: "Courriel",  largeur: 210 },
      { champ: "message",   titre: "Message",   largeur: 420 }
    ]
  },

  cadeau: {
    onglet: "Lead magnet",
    sujet: "Documents demandés",
    requis: ["email", "telephone"],
    champs: [
      { champ: "email",     titre: "Courriel",  largeur: 210 },
      { champ: "telephone", titre: "Téléphone", largeur: 130 },
      { champ: "documents", titre: "Documents", largeur: 300 },
      { champ: "origine",   titre: "Origine",   largeur: 150 }
    ]
  }
};

/* Les colonnes de suivi, identiques sur les sept onglets. Elles
   sont à la FIN, après les réponses du visiteur : on lit la demande
   d'abord, on la traite ensuite.

   « Notes internes » est un champ libre, sans liste : c'est le seul
   endroit du classeur où trois personnes peuvent écrire une phrase
   sans se marcher dessus, et une liste déroulante le tuerait. */
var SUIVI = [
  { titre: "Renvois",        largeur: 80 },
  { titre: "Lu par",         largeur: 110, liste: ASSOCIES },
  { titre: "Rappelé par",    largeur: 120, liste: ASSOCIES },
  { titre: "Statut",         largeur: 130, liste: STATUTS },
  { titre: "Notes internes", largeur: 340 }
];

/* La signature du dédoublonnage. Colonne masquée : elle sert au
   script, elle n'a rien à dire à un humain. */
var COL_SIGNATURE = "Signature";

/* L'ordre complet des colonnes d'un onglet. */
function colonnes(kind) {
  var out = [{ titre: "Horodatage", largeur: 150 }];
  SCHEMA[kind].champs.forEach(function (c) { out.push(c); });
  SUIVI.forEach(function (c) { out.push(c); });
  out.push({ titre: COL_SIGNATURE, largeur: 120 });
  return out;
}


/* ============================================================
   3 · INITIALISATION

   À LANCER UNE SEULE FOIS, à la main, depuis l'éditeur Apps
   Script. Elle crée le classeur, ses sept onglets, leurs en-têtes,
   les listes déroulantes de suivi, et retient l'identifiant du
   classeur dans les propriétés du script.

   ELLE EST IDEMPOTENTE : relancée, elle ne détruit rien. Elle
   ajoute ce qui manque et laisse en place ce qui existe. C'est ce
   qui permet de la relancer après avoir ajouté une colonne au
   schéma sans perdre les demandes déjà reçues.
   ============================================================ */

function initialiser() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty("CLASSEUR_ID");
  var classeur;

  if (id) {
    try {
      classeur = SpreadsheetApp.openById(id);
    } catch (e) {
      classeur = null;
    }
  }
  if (!classeur) {
    classeur = SpreadsheetApp.create(REGLAGES.NOM_CLASSEUR);
    props.setProperty("CLASSEUR_ID", classeur.getId());
  }
  classeur.setSpreadsheetTimeZone(REGLAGES.FUSEAU);

  Object.keys(SCHEMA).forEach(function (kind) {
    preparerOnglet(classeur, kind);
  });

  /* La feuille « Feuille 1 » que Google crée d'office n'a rien à
     faire là — mais on ne la supprime que si elle est vide et
     qu'il reste autre chose, sinon le classeur n'aurait plus
     aucune feuille et Sheets refuse. */
  var vide = classeur.getSheetByName("Feuille 1") || classeur.getSheetByName("Sheet1");
  if (vide && classeur.getSheets().length > 1 && vide.getLastRow() === 0) {
    classeur.deleteSheet(vide);
  }

  var url = classeur.getUrl();
  Logger.log("Classeur prêt : " + url);
  Logger.log("Identifiant retenu : " + classeur.getId());
  Logger.log("Avis envoyés à : " + notifDest());
  return url;
}

/* Crée l'onglet s'il manque, pose les en-têtes, fige la première
   ligne, règle les largeurs, installe les listes déroulantes. */
function preparerOnglet(classeur, kind) {
  var def = SCHEMA[kind];
  var cols = colonnes(kind);
  var feuille = classeur.getSheetByName(def.onglet);
  if (!feuille) feuille = classeur.insertSheet(def.onglet);

  var titres = cols.map(function (c) { return c.titre; });

  /* On réécrit la ligne d'en-tête à chaque passage : c'est ce qui
     fait qu'ajouter une colonne au schéma suffit. Les données
     déjà écrites ne bougent pas — elles sont sous la ligne 1. */
  feuille.getRange(1, 1, 1, titres.length).setValues([titres]);
  feuille.getRange(1, 1, 1, titres.length)
    .setFontWeight("bold")
    .setBackground("#1a1a1a")
    .setFontColor("#ffffff")
    .setVerticalAlignment("middle");
  feuille.setFrozenRows(1);
  feuille.setRowHeight(1, 34);

  cols.forEach(function (c, i) {
    feuille.setColumnWidth(i + 1, c.largeur || 150);
  });

  /* L'horodatage se lit, il ne se déchiffre pas. */
  feuille.getRange(2, 1, Math.max(feuille.getMaxRows() - 1, 1), 1)
    .setNumberFormat("yyyy-mm-dd hh:mm:ss");

  /* Les listes déroulantes du suivi. Posées large, pour que les
     lignes futures les portent déjà. */
  cols.forEach(function (c, i) {
    if (!c.liste) return;
    var regle = SpreadsheetApp.newDataValidation()
      .requireValueInList(c.liste, true)
      .setAllowInvalid(false)
      .build();
    feuille.getRange(2, i + 1, Math.max(feuille.getMaxRows() - 1, 1), 1)
      .setDataValidation(regle);
  });

  /* La signature ne regarde personne. */
  var iSig = titres.indexOf(COL_SIGNATURE);
  if (iSig >= 0) feuille.hideColumns(iSig + 1);

  /* Le texte long revient à la ligne au lieu de déborder sur la
     colonne voisine ; sans ça, un message de 400 signes rend les
     colonnes de suivi illisibles. */
  feuille.getRange(1, 1, feuille.getMaxRows(), titres.length)
    .setVerticalAlignment("top");

  return feuille;
}

/* Ouvre le classeur. Lève si `initialiser()` n'a jamais tourné —
   c'est volontaire : mieux vaut une erreur nette qu'un classeur
   créé en douce à la première soumission, que personne ne
   trouverait ensuite. */
function classeur() {
  var id = PropertiesService.getScriptProperties().getProperty("CLASSEUR_ID");
  if (!id) throw new Error("CLASSEUR_ID absent : lancez `initialiser()` une fois.");
  return SpreadsheetApp.openById(id);
}


/* ============================================================
   4 · L'ENTRÉE
   ============================================================ */

/* LA DEUXIÈME PORTE, ET ELLE EST EN LECTURE SEULE.

   `doPost` écrit ; `doGet` ne fait que répondre « voici ce qui est
   libre ». Les deux vivent dans le MÊME déploiement, donc à la même
   adresse : le site ajoute `?action=creneaux` et rien d'autre. Un
   second déploiement aurait voulu dire une seconde adresse à tenir
   à jour, et une occasion de plus de se tromper de bouton.

   SANS PARAMÈTRE, c'est le témoin de vie : `tools/verrou-env.mjs`
   l'appelle pour vérifier que l'adresse répond vraiment avant de
   laisser passer une mise en production. Il n'écrit rien et ne
   révèle rien — ni adresse, ni identifiant de classeur, ni titre
   d'événement. La porte des créneaux non plus : elle rend des
   heures libres, jamais ce qui occupe les autres. */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "";

  if (action === "creneaux") {
    try {
      return json(creneauxLibres());
    } catch (err) {
      console.error("creneaux : " + (err && err.stack ? err.stack : err));
      return json({ success: false, message: "Les disponibilités sont momentanément illisibles." });
    }
  }

  return json({
    success: true,
    service: "APED formulaires",
    version: 2,
    calendrier: typeof Calendar !== "undefined",
    fuseau: REGLAGES.FUSEAU,
    creneaux: true
  });
}

function doPost(e) {
  /* TOUT CE QUI SUIT EST DANS UN `try`. Une Web App qui lève rend
     une page d'erreur HTML : `res.json()` du site échouerait sur
     du HTML et le visiteur verrait « l'envoi n'a pas passé »
     sans qu'on sache jamais pourquoi. On rend toujours du JSON. */
  try {
    var data = lireCorps(e);
    var kind = String(data._form || "").trim();

    if (!SCHEMA[kind]) {
      return json({ success: false, message: "Formulaire inconnu." });
    }

    /* LE HONEYPOT SE JETTE EN SILENCE. Un robot qui reçoit une
       erreur apprend qu'il a été vu et change de tactique ; un
       robot qui reçoit un succès s'en va content. On ne prévient
       personne et on n'écrit rien. */
    if (String(data._gotcha || "").trim() !== "") {
      return json({ success: true, ignore: true });
    }

    var faute = valider(kind, data);
    if (faute) return json({ success: false, message: faute });

    /* UN SEUL À LA FOIS. Deux soumissions simultanées liraient le
       même « dernier état » du classeur : l'une écraserait la
       ligne 2 de l'autre, et deux personnes pourraient réserver
       la même plage. Le verrou coûte quelques millisecondes et
       ferme les deux trous d'un coup. */
    var verrou = LockService.getScriptLock();
    if (!verrou.tryLock(25000)) {
      return json({ success: false, message: "Le service est occupé. Réessayez dans un instant." });
    }

    try {
      return traiter(kind, data);
    } finally {
      verrou.releaseLock();
    }
  } catch (err) {
    /* On garde la trace complète côté script, on ne rend au site
       qu'une phrase qui ne divulgue rien de l'infrastructure. */
    console.error("doPost : " + (err && err.stack ? err.stack : err));
    return json({ success: false, message: "Le service a rencontré une erreur. Réessayez dans un moment." });
  }
}

/* Le corps arrive en `text/plain` — c'est ce qui évite la requête
   préalable CORS que les Web Apps Apps Script ne savent pas
   traiter. On accepte aussi le formulaire encodé, au cas où. */
function lireCorps(e) {
  if (e && e.postData && e.postData.contents) {
    var brut = e.postData.contents;
    try {
      return JSON.parse(brut);
    } catch (err) {
      /* `application/x-www-form-urlencoded` : Apps Script a déjà
         découpé les paramètres pour nous. */
      if (e.parameter && Object.keys(e.parameter).length) return e.parameter;
      throw new Error("Corps illisible.");
    }
  }
  if (e && e.parameter && Object.keys(e.parameter).length) return e.parameter;
  throw new Error("Corps absent.");
}

/* L'aiguillage. Une réservation passe d'abord par le calendrier,
   parce qu'un refus pour plage déjà prise ne doit RIEN écrire. */
function traiter(kind, data) {
  var extra = {};

  if (kind === "booking") {
    var rdv = poserRendezVous(data);
    if (!rdv.ok) return json({ success: false, message: rdv.message });
    extra._debut = rdv.debut;
    extra._meet = rdv.meet || "";
    extra._evenement = rdv.lien || "";

    /* LA PHRASE DE LA PLAGE SE RÉÉCRIT ICI, ELLE NE SE RECOPIE PAS.
       Le site en envoie une, et elle est juste — mais elle a été
       fabriquée par un navigateur, donc dans le fuseau du visiteur.
       Le classeur, l'avis interne et la confirmation doivent tous
       dire l'heure de Québec, la même que l'événement. On refait
       donc la phrase à partir de l'instant retenu. */
    extra.plage_demandee = libelleComplet(rdv.debut);
    data = Object.assign({}, data, { plage_demandee: extra.plage_demandee });
  }

  if (kind === "project") {
    extra._pieces = rangerPieces(data);
  }

  var ecrit = ecrireLigne(kind, data, extra);

  /* Un renvoi n'avertit pas une seconde fois : c'est tout
     l'intérêt de le détecter. */
  if (!ecrit.doublon) {
    avertirAgence(kind, data, extra, ecrit);
    confirmerAuVisiteur(kind, data, extra);
  }

  return json({
    success: true,
    ligne: ecrit.ligne,
    renvoi: ecrit.doublon || false,
    meet: extra._meet || ""
  });
}


/* ============================================================
   5 · VALIDATION

   ELLE REFLÈTE CELLE DU NAVIGATEUR, ET ELLE NE LUI FAIT PAS
   CONFIANCE. `validate()` dans `js/main.js` peut être contournée
   par n'importe qui : elle sert au visiteur, pas à la sécurité.
   Celle-ci est la seule qui compte.
   ============================================================ */

/* Un courriel plausible. On ne cherche pas à valider la RFC 5322 :
   personne n'y arrive et ça refuse des adresses valides. On refuse
   ce qui ne peut pas être une adresse. */
var RE_COURRIEL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

/* CE QUI A ÉTÉ APPRIS : « 12 » passait comme numéro de téléphone,
   parce que la vérification était « le champ n'est pas vide ». On
   compte les CHIFFRES, pas les signes : « (418) 555-0142 » en a
   dix, « 12 » en a deux. Dix est le minimum nord-américain. */
function chiffres(v) {
  return String(v == null ? "" : v).replace(/\D/g, "");
}

var LONGUEURS = {
  nom: 120, entreprise: 160, ville: 120, email: 254, telephone: 40,
  message: 5000, description: 5000, contexte: 3000, sujet: 2000,
  votre_nom: 120, votre_email: 254, votre_telephone: 40,
  entreprise_referee: 160, contact_reference: 200, domaine: 160,
  site_actuel: 500, besoins: 500, plage_demandee: 200
};

function valider(kind, data) {
  var def = SCHEMA[kind];

  /* 1 · Les champs requis sont présents et non vides. */
  for (var i = 0; i < def.requis.length; i++) {
    var champ = def.requis[i];
    if (String(data[champ] == null ? "" : data[champ]).trim() === "") {
      return "Il manque une réponse obligatoire.";
    }
  }

  /* 2 · Toute adresse fournie est plausible — y compris dans un
     champ facultatif : une adresse fautive dans une colonne est
     un rappel qu'on ne pourra pas faire. */
  var adresses = ["email", "votre_email"];
  for (var a = 0; a < adresses.length; a++) {
    var v = String(data[adresses[a]] == null ? "" : data[adresses[a]]).trim();
    if (v !== "" && !RE_COURRIEL.test(v)) return "L’adresse courriel n’est pas valide.";
  }

  /* 3 · Tout numéro fourni porte au moins dix chiffres. */
  var tels = ["telephone", "votre_telephone", "contact_reference"];
  for (var t = 0; t < tels.length; t++) {
    var brut = String(data[tels[t]] == null ? "" : data[tels[t]]).trim();
    if (brut === "") continue;
    /* `contact_reference` est « une personne à contacter » : un nom
       suivi ou non d'un numéro. On ne le juge que s'il ressemble à
       un numéro, sinon on refuserait « Marie Tremblay ». */
    if (tels[t] === "contact_reference" && chiffres(brut).length === 0) continue;
    if (chiffres(brut).length < 10) return "Le numéro de téléphone est incomplet.";
  }

  /* 4 · Rien d'absurdement long. Un champ de 2 Mo est un abus, pas
     une demande. */
  var cles = Object.keys(data);
  for (var c = 0; c < cles.length; c++) {
    var cle = cles[c];
    if (cle.charAt(0) === "_") continue;
    var max = LONGUEURS[cle] || 2000;
    if (String(data[cle] == null ? "" : data[cle]).length > max) {
      return "Une des réponses est trop longue.";
    }
  }

  /* 5 · Une réservation doit porter une plage lisible par machine. */
  if (kind === "booking") {
    if (!data.plage_iso || isNaN(new Date(data.plage_iso).getTime())) {
      return "La plage choisie n’a pas été transmise. Choisissez-la de nouveau.";
    }
    if (data.mode !== MODES.TEL && data.mode !== MODES.MEET) {
      return "Choisissez le mode de l’appel.";
    }
  }

  return null;
}


/* ============================================================
   6 · LE CLASSEUR
   ============================================================ */

/* LA SIGNATURE DU DÉDOUBLONNAGE. Elle porte le formulaire, le
   courriel, ET le contenu : deux demandes du même visiteur avec un
   message différent sont deux demandes, et elles ne fusionnent
   jamais. Seul un renvoi à l'identique s'additionne.

   Les clés de service (`_form`, `_gotcha`, `_subject`…) sont hors
   signature : elles ne viennent pas du visiteur. */
function signature(kind, data) {
  var cles = Object.keys(data)
    .filter(function (k) { return k.charAt(0) !== "_"; })
    .sort();
  var bout = kind + "|";
  cles.forEach(function (k) {
    bout += k + "=" + String(data[k] == null ? "" : data[k]).trim() + ";";
  });
  var octets = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, bout, Utilities.Charset.UTF_8);
  return octets.map(function (o) {
    return ("0" + (o & 0xff).toString(16)).slice(-2);
  }).join("").slice(0, 32);
}

/* Écrit la demande EN LIGNE 2 : la plus récente est toujours en
   haut, sans avoir à trier. Si la même signature apparaît dans la
   fenêtre, on incrémente « Renvois » sur la ligne existante. */
function ecrireLigne(kind, data, extra) {
  var def = SCHEMA[kind];
  var feuille = classeur().getSheetByName(def.onglet);
  if (!feuille) feuille = preparerOnglet(classeur(), kind);

  var cols = colonnes(kind);
  var titres = cols.map(function (c) { return c.titre; });
  var iSig = titres.indexOf(COL_SIGNATURE) + 1;
  var iRenvois = titres.indexOf("Renvois") + 1;
  var sig = signature(kind, data);
  var maintenant = new Date();

  /* --- le doublon --- */
  var dernier = feuille.getLastRow();
  if (dernier >= 2) {
    var combien = Math.min(REGLAGES.LIGNES_RELUES, dernier - 1);
    var sigs = feuille.getRange(2, iSig, combien, 1).getValues();
    var dates = feuille.getRange(2, 1, combien, 1).getValues();
    var limite = REGLAGES.FENETRE_DOUBLON_MIN * 60 * 1000;

    for (var r = 0; r < sigs.length; r++) {
      if (String(sigs[r][0]) !== sig) continue;
      var quand = dates[r][0];
      if (!(quand instanceof Date)) continue;
      if (maintenant.getTime() - quand.getTime() > limite) continue;

      var cellule = feuille.getRange(r + 2, iRenvois);
      var n = Number(cellule.getValue()) || 0;
      cellule.setValue(n + 1);
      return { ligne: r + 2, doublon: true, renvois: n + 1 };
    }
  }

  /* --- la nouvelle ligne --- */
  var valeurs = cols.map(function (c) {
    if (c.titre === "Horodatage") return maintenant;
    if (c.titre === COL_SIGNATURE) return sig;
    if (c.titre === "Renvois") return 0;
    if (c.titre === "Statut") return STATUTS[0];
    if (c.titre === "Lu par" || c.titre === "Rappelé par") return "";
    var nom = c.champ;
    if (!nom) return "";
    if (extra && Object.prototype.hasOwnProperty.call(extra, nom)) return extra[nom];
    var v = data[nom];
    return v == null ? "" : String(v);
  });

  feuille.insertRowBefore(2);
  feuille.getRange(2, 1, 1, valeurs.length).setValues([valeurs]);
  feuille.getRange(2, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");

  /* `insertRowBefore` hérite du format de la ligne 1 — l'en-tête
     noir sur blanc. On le défait, sinon chaque demande arrive
     déguisée en titre. */
  feuille.getRange(2, 1, 1, valeurs.length)
    .setFontWeight("normal")
    .setBackground(null)
    .setFontColor(null)
    .setVerticalAlignment("top");

  return { ligne: 2, doublon: false, url: lienVersLigne(feuille) };
}

function lienVersLigne(feuille) {
  return classeur().getUrl() + "#gid=" + feuille.getSheetId() + "&range=A2";
}

/* Les pièces jointes du formulaire de projet. Elles arrivent en
   base64 dans le JSON — Apps Script ne sait pas reconstruire un
   `multipart/form-data`, donc le site les encode avant d'envoyer.

   ON N'ÉCHOUE JAMAIS SUR UNE PIÈCE JOINTE. Un fichier trop gros ou
   un Drive qui refuse rend une note dans la colonne, pas une
   erreur : la demande vaut plus que ses annexes. */
function rangerPieces(data) {
  var pieces = data._fichiers;
  if (!pieces || !pieces.length) return "";

  try {
    var total = 0;
    pieces.forEach(function (p) { total += (p.base64 || "").length; });
    if (total > REGLAGES.PIECES_MAX_OCTETS) {
      return pieces.length + " fichier(s) trop volumineux — à redemander au visiteur";
    }

    var dossier = dossierPieces();
    var liens = [];
    pieces.forEach(function (p) {
      if (!p || !p.base64) return;
      var blob = Utilities.newBlob(
        Utilities.base64Decode(p.base64),
        p.type || "application/octet-stream",
        p.nom || "piece-jointe");
      var f = dossier.createFile(blob);
      liens.push(f.getName() + " : " + f.getUrl());
    });
    return liens.join("\n");
  } catch (e) {
    console.error("pièces jointes : " + e);
    return pieces.length + " fichier(s) non enregistrés — à redemander au visiteur";
  }
}

function dossierPieces() {
  var it = DriveApp.getFoldersByName(REGLAGES.DOSSIER_PIECES);
  return it.hasNext() ? it.next() : DriveApp.createFolder(REGLAGES.DOSSIER_PIECES);
}


/* ============================================================
   7 · LE FUSEAU — America/Toronto, sans jamais l'écrire en dur

   UN CRÉNEAU AFFICHÉ DANS LE MAUVAIS FUSEAU EST UN APPEL MANQUÉ.
   C'est la panne la plus discrète de tout ce fichier : rien ne
   lève, rien ne s'affiche en rouge, et deux personnes attendent
   à des heures différentes.

   TROIS PIÈGES, ET ILS SE CUMULENT :

   1. Le décalage de Toronto n'est pas une constante. Il vaut
      −5 h l'hiver et −4 h l'été. On ne l'écrit donc nulle part :
      on le DEMANDE, pour l'instant précis dont on parle.

   2. `new Date(2026, 7, 10, 9, 0)` construit 9 h dans le fuseau du
      SCRIPT. Si le projet Apps Script a été créé sous un autre
      fuseau — c'est un simple menu déroulant, personne ne le
      vérifie — tous les rendez-vous partent décalés. `instantLocal`
      ne fait jamais confiance au fuseau du script.

   3. Le visiteur peut être ailleurs. C'est pour ça que le serveur
      renvoie au site l'heure DÉJÀ MISE EN FRANÇAIS et déjà calculée
      à Toronto : le navigateur n'a aucune heure à formater, donc
      aucune occasion de la formater dans son propre fuseau.
   ============================================================ */

/* Le décalage du fuseau de l'agence, en minutes, À CET INSTANT-LÀ.
   `formatDate(..., "Z")` rend « -0400 » ou « -0500 » selon la date :
   c'est Java qui connaît le calendrier des changements d'heure, et
   il le connaît mieux que nous. */
function decalageMin(instant) {
  var z = Utilities.formatDate(instant, REGLAGES.FUSEAU, "Z");
  var signe = z.charAt(0) === "-" ? -1 : 1;
  return signe * (Number(z.substring(1, 3)) * 60 + Number(z.substring(3, 5)));
}

/* L'INSTANT EXACT qui, à Toronto, se lit « le J/M/A à H h MM ».

   DEUX PASSES, ET C'EST LE CHANGEMENT D'HEURE QUI LES EXIGE. On
   part d'une supposition en UTC pour obtenir un décalage, on
   corrige, puis on redemande le décalage à l'instant corrigé. Les
   deux dimanches par an où la correction fait traverser la bascule,
   la première réponse est fausse et la seconde la rattrape. Le
   reste de l'année, les deux sont identiques et la seconde passe ne
   coûte rien. */
function instantLocal(an, mois, jour, h, min) {
  var suppose = new Date(Date.UTC(an, mois - 1, jour, h, min, 0, 0));
  var d1 = decalageMin(suppose);
  var essai = new Date(suppose.getTime() - d1 * 60000);
  var d2 = decalageMin(essai);
  if (d2 !== d1) essai = new Date(suppose.getTime() - d2 * 60000);
  return essai;
}

/* L'inverse : comment cet instant se lit à Toronto. */
function partsLocal(instant) {
  var s = Utilities.formatDate(instant, REGLAGES.FUSEAU, "yyyy MM dd HH mm").split(" ");
  var an = Number(s[0]), mois = Number(s[1]), jour = Number(s[2]);
  return {
    an: an, mois: mois, jour: jour,
    h: Number(s[3]), min: Number(s[4]),
    /* LE JOUR DE LA SEMAINE SE CALCULE, IL NE SE DEMANDE PAS.
       `EEE` dépendrait de la langue du script et « lun. » ne se
       compare à rien. Une date UTC pure rend un chiffre, toujours
       le même, dans tous les fuseaux. */
    jsem: new Date(Date.UTC(an, mois - 1, jour)).getUTCDay(),
    cle: s[0] + "-" + s[1] + "-" + s[2]
  };
}

/* Minuit, heure de Toronto, du jour où tombe cet instant. */
function minuitLocal(instant) {
  var p = partsLocal(instant);
  return instantLocal(p.an, p.mois, p.jour, 0, 0);
}

/* Le lendemain. On saute de 26 h AVANT de retomber sur minuit :
   un jour de changement d'heure dure 23 h ou 25 h, et « +24 h »
   ramènerait au même jour l'une des deux fois. */
function jourSuivant(minuit) {
  return minuitLocal(new Date(minuit.getTime() + 26 * 3600000));
}

/* « 09:30 » → 570. */
function enMinutes(hhmm) {
  var p = String(hhmm).split(":");
  return Number(p[0]) * 60 + Number(p[1] || 0);
}

/* Les jours et les mois en toutes lettres. On ne s'en remet pas à
   `formatDate` : sa langue est celle du projet Apps Script, réglée
   dans un menu que personne ne regarde, et un « Monday » au milieu
   d'un site français serait le genre de détail qui fait douter de
   tout le reste. */
var JOURS_FR = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
var MOIS_FR = ["janvier", "février", "mars", "avril", "mai", "juin",
               "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function libelleJour(p) {
  return JOURS_FR[p.jsem] + " " + p.jour + " " + MOIS_FR[p.mois - 1];
}

/* « 9 h 00 », « 13 h 30 » — la façon dont on écrit une heure au
   Québec. Calculée à Toronto, envoyée telle quelle au site. */
function libelleHeure(instant) {
  var p = partsLocal(instant);
  return p.h + " h " + (p.min < 10 ? "0" : "") + p.min;
}

function libelleComplet(instant) {
  var p = partsLocal(instant);
  return libelleJour(p) + " " + p.an + " à " + libelleHeure(instant);
}


/* ============================================================
   8 · LES CRÉNEAUX — la grille, puis ce que l'agenda en laisse

   LA GRILLE seule ne dit rien de vrai : elle décrit une semaine
   idéale. Ce qu'on affiche, c'est la grille MOINS l'agenda.

   TOUT ÉVÉNEMENT DU CALENDRIER EFFACE CE QU'IL CHEVAUCHE. C'est
   la règle entière. Pas de liste d'exceptions à tenir à jour, pas
   d'écran d'administration à construire : William bloque son mardi
   depuis l'application Agenda de son téléphone, et le créneau
   disparaît du site à la requête suivante.

   Un rendez-vous que le site vient de poser est, lui aussi, un
   événement du calendrier. Il bloque donc sa propre plage pour le
   visiteur suivant sans qu'on ait rien à écrire de plus.
   ============================================================ */

/* Deux intervalles se touchent-ils ? Les bornes qui coïncident ne
   comptent PAS : un appel de 9 h à 9 h 30 et un autre de 9 h 30 à
   10 h ne se chevauchent pas, ils s'enchaînent. */
function chevauche(aDebut, aFin, bDebut, bFin) {
  return aDebut.getTime() < bFin.getTime() && aFin.getTime() > bDebut.getTime();
}

/* CE QUI OCCUPE LE CALENDRIER ENTRE DEUX INSTANTS.

   On passe par le service avancé quand il est là. Il est le seul à
   dire deux choses que le service ordinaire tait :
     · `transparency` — « Occupé » ou « Disponible » ;
     · la forme exacte d'un événement sur toute la journée
       (`start.date` sans heure), qu'il faut étendre à la journée
       ENTIÈRE en heure de Toronto.

   Le repli sur `CalendarApp` existe pour le jour où le service
   avancé n'a pas été activé : il bloque alors TOUT, sans nuance.
   Trop prudent vaut mieux qu'un double-emploi. */
function occupations(depuis, jusqua) {
  var calId = DISPONIBILITES.CALENDRIER_ID || "primary";
  var out = [];

  if (typeof Calendar !== "undefined" && Calendar.Events && Calendar.Events.list) {
    var jeton = null, tours = 0;
    do {
      var params = {
        timeMin: depuis.toISOString(),
        timeMax: jusqua.toISOString(),
        /* `singleEvents` déplie les séries : sans lui, un « tous les
           mardis » ne rendrait qu'UNE occurrence, celle d'origine,
           et les 51 autres mardis resteraient offerts. */
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 250
      };
      if (jeton) params.pageToken = jeton;
      var lot = Calendar.Events.list(calId, params);
      (lot.items || []).forEach(function (ev) {
        var i = intervalleEvenement(ev);
        if (i) out.push(i);
      });
      jeton = lot.nextPageToken;
      tours++;
    } while (jeton && tours < 20);
    return out;
  }

  var cal = DISPONIBILITES.CALENDRIER_ID
    ? CalendarApp.getCalendarById(DISPONIBILITES.CALENDRIER_ID)
    : CalendarApp.getDefaultCalendar();
  cal.getEvents(depuis, jusqua).forEach(function (ev) {
    try {
      if (ev.getMyStatus() === CalendarApp.GuestStatus.NO) return;
    } catch (e) { /* un événement sans invités n'a pas de statut */ }
    var toutLeJour = false;
    try { toutLeJour = ev.isAllDayEvent(); } catch (e) {}
    if (toutLeJour) {
      var d0 = minuitLocal(ev.getAllDayStartDate());
      var d1 = minuitLocal(ev.getAllDayEndDate());
      if (d1.getTime() <= d0.getTime()) d1 = jourSuivant(d0);
      out.push({ debut: d0, fin: d1 });
    } else {
      out.push({ debut: ev.getStartTime(), fin: ev.getEndTime() });
    }
  });
  return out;
}

/* Un événement du service avancé → l'intervalle qu'il interdit, ou
   `null` s'il n'interdit rien. */
function intervalleEvenement(ev) {
  if (!ev) return null;

  /* Un événement annulé reste dans la réponse quand on déplie une
     série : c'est justement comme ça qu'une occurrence supprimée se
     signale. Il ne bloque rien. */
  if (ev.status === "cancelled") return null;

  /* UNE INVITATION REFUSÉE N'EST PAS UN ENGAGEMENT. Elle reste
     visible, barrée, dans l'agenda ; la compter volerait des heures
     réellement libres. */
  var attendees = ev.attendees || [];
  for (var i = 0; i < attendees.length; i++) {
    if (attendees[i].self && attendees[i].responseStatus === "declined") return null;
  }

  /* « Disponible » plutôt que « Occupé ». Voir
     `DISPONIBILITES.DISPONIBLE_BLOQUE`. */
  if (ev.transparency === "transparent" && !DISPONIBILITES.DISPONIBLE_BLOQUE) return null;

  /* SUR TOUTE LA JOURNÉE. Google rend `start.date` et `end.date`
     sans heure, et `end.date` est EXCLUSIVE : un événement d'un seul
     jour le 10 se lit « du 10 au 11 ». On étend à la journée entière
     EN HEURE DE TORONTO — pas en UTC, sinon la journée bloquée
     glisserait de quatre ou cinq heures. */
  if (ev.start && ev.start.date) {
    var a = String(ev.start.date).split("-");
    var b = String((ev.end && ev.end.date) || ev.start.date).split("-");
    var d0 = instantLocal(Number(a[0]), Number(a[1]), Number(a[2]), 0, 0);
    var d1 = instantLocal(Number(b[0]), Number(b[1]), Number(b[2]), 0, 0);
    if (d1.getTime() <= d0.getTime()) d1 = jourSuivant(d0);
    return { debut: d0, fin: d1 };
  }

  if (ev.start && ev.start.dateTime && ev.end && ev.end.dateTime) {
    return { debut: new Date(ev.start.dateTime), fin: new Date(ev.end.dateTime) };
  }
  return null;
}

/* LA GRILLE D'UN JOUR — la couche 1, l'agenda pas encore consulté.
   Rend les instants de DÉBUT des créneaux théoriques de ce jour. */
function grilleDuJour(p) {
  if (DISPONIBILITES.JOURS_OUVRABLES.indexOf(p.jsem) === -1) return [];

  var duree = DISPONIBILITES.DUREE_CRENEAU_MIN;
  var pas = duree + DISPONIBILITES.TAMPON_MIN;
  var ouvre = enMinutes(DISPONIBILITES.HEURE_DEBUT);
  var ferme = enMinutes(DISPONIBILITES.HEURE_FIN);
  var pauses = (DISPONIBILITES.PAUSES || []).map(function (z) {
    return { d: enMinutes(z.debut), f: enMinutes(z.fin) };
  });

  var out = [];
  /* `m + duree <= ferme` : le dernier créneau FINIT à l'heure de
     fermeture, il ne la dépasse pas. */
  for (var m = ouvre; m + duree <= ferme; m += pas) {
    var fin = m + duree;
    var dansPause = pauses.some(function (z) { return m < z.f && fin > z.d; });
    if (dansPause) continue;
    out.push(instantLocal(p.an, p.mois, p.jour, Math.floor(m / 60), m % 60));
  }
  return out;
}

/* CE CRÉNEAU TIENT-IL, CONTRE CETTE LISTE D'OCCUPATIONS ?
   Le tampon élargit le créneau DES DEUX CÔTÉS : un appel qui finit
   à 13 h 30 et un événement qui commence à 13 h 40 ne laissent pas
   dix minutes pour souffler, donc ce créneau-là ne s'offre pas. */
function creneauTient(debut, occ) {
  var fin = new Date(debut.getTime() + DISPONIBILITES.DUREE_CRENEAU_MIN * 60000);
  var marge = DISPONIBILITES.TAMPON_MIN * 60000;
  var zoneD = new Date(debut.getTime() - marge);
  var zoneF = new Date(fin.getTime() + marge);
  for (var i = 0; i < occ.length; i++) {
    if (chevauche(zoneD, zoneF, occ[i].debut, occ[i].fin)) return false;
  }
  return true;
}

/* La fenêtre réservable : pas avant le préavis, pas après
   l'horizon. Calculée à chaque appel — « dans 24 h » recule d'une
   seconde par seconde. */
function fenetreReservable() {
  var maintenant = new Date();
  return {
    plancher: new Date(maintenant.getTime() + DISPONIBILITES.PREAVIS_HEURES * 3600000),
    plafond: new Date(maintenant.getTime() + DISPONIBILITES.HORIZON_JOURS * 86400000)
  };
}

/* CE CRÉNEAU EST-IL SUR LA GRILLE ? Le site n'envoie que des
   instants qu'il a reçus d'ici, mais une requête forgée peut
   proposer n'importe quoi — 3 h du matin, un dimanche, ou 9 h 07.
   On refuse tout ce qui n'est pas un départ prévu. */
function surLaGrille(debut) {
  var grille = grilleDuJour(partsLocal(debut));
  for (var i = 0; i < grille.length; i++) {
    if (grille[i].getTime() === debut.getTime()) return true;
  }
  return false;
}

/* LA RÉPONSE DE LA DEUXIÈME PORTE.

   Les heures partent DÉJÀ ÉCRITES EN FRANÇAIS et déjà calculées à
   Toronto : le site n'a pas une seule date à formater, donc pas une
   seule occasion de la rendre dans le fuseau du visiteur. Il reçoit
   aussi l'instant ISO, qu'il ne fait que renvoyer tel quel à la
   réservation. */
function creneauxLibres() {
  var f = fenetreReservable();

  /* On interroge le calendrier UNE SEULE FOIS pour toute la
     période. Une requête par jour, c'est 42 allers-retours et un
     dépassement du temps d'exécution. La marge d'une journée de
     chaque côté attrape les événements qui débordent. */
  var occ = occupations(
    new Date(f.plancher.getTime() - 86400000),
    new Date(f.plafond.getTime() + 86400000)
  );

  var jours = [];
  var total = 0;
  var curseur = minuitLocal(f.plancher);
  var derniere = minuitLocal(f.plafond);

  /* La borne de la boucle est le NOMBRE DE JOURS, pas une condition
     sur les dates : une comparaison qui n'avance pas — et il en
     existe, au changement d'heure — tournerait sans fin et le
     script mourrait sur le temps d'exécution, sans rien rendre. */
  for (var n = 0; n <= DISPONIBILITES.HORIZON_JOURS + 1; n++) {
    if (curseur.getTime() > derniere.getTime()) break;
    var p = partsLocal(curseur);

    var libres = grilleDuJour(p).filter(function (t) {
      if (t.getTime() < f.plancher.getTime()) return false;
      if (t.getTime() > f.plafond.getTime()) return false;
      return creneauTient(t, occ);
    });

    if (libres.length) {
      jours.push({
        date: p.cle,
        libelle: libelleJour(p),
        /* Avec l'année, pour le récapitulatif juste avant la
           confirmation : c'est le seul endroit où quelqu'un relit la
           date pour de bon, et c'est là qu'une année manquante
           inquiète. */
        libelleLong: libelleJour(p) + " " + p.an,
        creneaux: libres.map(function (t) {
          return { iso: t.toISOString(), h: libelleHeure(t) };
        })
      });
      total += libres.length;
      if (jours.length >= DISPONIBILITES.JOURS_RENDUS_MAX) break;
    }
    curseur = jourSuivant(curseur);
  }

  return {
    success: true,
    fuseau: REGLAGES.FUSEAU,
    duree: DISPONIBILITES.DUREE_CRENEAU_MIN,
    preavisHeures: DISPONIBILITES.PREAVIS_HEURES,
    horizonJours: DISPONIBILITES.HORIZON_JOURS,
    total: total,
    jours: jours
  };
}


/* ============================================================
   9 · LE CALENDRIER — la réservation

   DEUX MODES, UN SEUL ÉVÉNEMENT. Téléphone comme Meet, le
   rendez-vous entre au calendrier de l'agence : c'est lui qui dit
   à trois associés que la case est prise. Ce qui change, c'est le
   Meet et l'invitation.

   · Téléphone — l'événement porte le numéro dans son titre. Le
     visiteur n'est PAS invité : on l'appelle, il n'a pas à gérer
     une invitation. Il reçoit notre confirmation par courriel.

   · Google Meet — `conferenceData.createRequest` fabrique le lien,
     et le visiteur est ajouté comme INVITÉ. Google lui envoie
     l'invitation ; l'événement et le lien apparaissent des deux
     côtés sans qu'on ait rien à recopier.
   ============================================================ */

function poserRendezVous(data) {
  var debut = new Date(data.plage_iso);
  var fin = new Date(debut.getTime() + DISPONIBILITES.DUREE_CRENEAU_MIN * 60000);
  var f = fenetreReservable();

  /* LE PRÉAVIS EST REVÉRIFIÉ ICI. Le site l'applique déjà, mais une
     requête forgée ne passe pas par le site. */
  if (debut.getTime() < f.plancher.getTime()) {
    return { ok: false, message: "Cette plage demande au moins "
      + DISPONIBILITES.PREAVIS_HEURES + " h d’avance. Choisissez-en une autre." };
  }
  if (debut.getTime() > f.plafond.getTime()) {
    return { ok: false, message: "Cette plage est trop lointaine. Choisissez-en une autre." };
  }

  /* ET ELLE DOIT ÊTRE SUR LA GRILLE. Sans ce contrôle, on pourrait
     poser un rendez-vous à 3 h du matin un dimanche : le calendrier
     serait libre, donc le test de double-emploi dirait oui. */
  if (!surLaGrille(debut)) {
    return { ok: false, message: "Cette plage n’est pas offerte. Choisissez-en une autre." };
  }

  /* LE DOUBLE-EMPLOI, ET C'EST ICI QU'IL SE JOUE.

     Entre le moment où le visiteur a VU la liste des créneaux et
     celui où il confirme, il s'écoule le temps de remplir un
     formulaire. Quelqu'un d'autre a pu prendre la place ; un associé
     a pu bloquer l'après-midi depuis son téléphone. Revérifier à
     l'affichage seulement, c'est promettre une plage qu'on n'a plus.

     ON APPELLE EXACTEMENT LES MÊMES FONCTIONS QUE LA PORTE DES
     CRÉNEAUX. Deux calculs de disponibilité écrits séparément
     finissent toujours par diverger, et la divergence s'appelle
     « deux personnes au même rendez-vous ».

     `doPost` tient déjà le verrou de script quand on arrive ici :
     deux confirmations simultanées sur la même plage sont
     sérialisées, et la seconde voit l'événement que la première
     vient de créer. */
  var lisible = true;
  var occ = [];
  try {
    var marge = DISPONIBILITES.TAMPON_MIN * 60000 + 60000;
    occ = occupations(new Date(debut.getTime() - marge - 86400000),
                      new Date(fin.getTime() + marge + 86400000));
  } catch (e) {
    /* UN CALENDRIER ILLISIBLE NE LAISSE PLUS PASSER. C'était le
       choix inverse avant, et il était mauvais : « on n'a pas pu
       vérifier, alors on accepte » produit précisément le
       double-emploi qu'on essaie d'empêcher, et le visiteur repart
       en croyant sa place réservée. */
    console.error("lecture du calendrier : " + (e && e.stack ? e.stack : e));
    lisible = false;
  }
  if (!lisible) {
    return { ok: false, message: "Impossible de vérifier les disponibilités à l’instant. Réessayez dans un moment." };
  }
  if (!creneauTient(debut, occ)) {
    return { ok: false, message: "Cette plage vient d’être prise. Choisissez-en une autre." };
  }

  var meet = data.mode === MODES.MEET;
  var nom = String(data.nom || "").trim();
  var titre = (meet ? "Appel APED · " : "Appel APED (téléphone) · ") + nom;

  var lignes = [
    "Demande reçue par le site APED.",
    "",
    "Nom : " + nom,
    "Entreprise : " + (data.entreprise || "—"),
    "Courriel : " + (data.email || "—"),
    "Téléphone : " + (data.telephone || "—"),
    "Mode : " + data.mode,
    "",
    "Sujet : " + (data.sujet || "—")
  ];
  if (!meet) {
    lignes.splice(1, 0, "", "À APPELER au " + (data.telephone || "—") + ".");
  }
  var description = lignes.join("\n");

  /* On passe par le service avancé quand il est là — c'est le seul
     chemin qui crée un lien Meet. Sinon on retombe sur le service
     ordinaire : l'événement existe, sans Meet, et l'avis interne
     le dit clairement. */
  if (meet && typeof Calendar !== "undefined" && Calendar.Events) {
    try {
      var evenement = {
        summary: titre,
        description: description,
        start: { dateTime: debut.toISOString(), timeZone: REGLAGES.FUSEAU },
        end:   { dateTime: fin.toISOString(),   timeZone: REGLAGES.FUSEAU },
        attendees: [{ email: String(data.email).trim(), displayName: nom }],
        guestsCanModify: false,
        guestsCanInviteOthers: false,
        conferenceData: {
          createRequest: {
            /* Doit être unique par requête, sinon Google renvoie la
               conférence déjà créée pour cet identifiant. */
            requestId: Utilities.getUuid(),
            conferenceSolutionKey: { type: "hangoutsMeet" }
          }
        }
      };
      var cree = Calendar.Events.insert(evenement, DISPONIBILITES.CALENDRIER_ID || "primary", {
        conferenceDataVersion: 1,
        /* C'est Google qui envoie l'invitation au visiteur — elle
           ne compte pas dans le quota d'envoi du script. */
        sendUpdates: "all"
      });

      return {
        ok: true,
        debut: debut,
        meet: cree.hangoutLink || lienMeet(cree),
        lien: cree.htmlLink || ""
      };
    } catch (e) {
      console.error("Calendar avancé : " + e);
      /* On continue sur le service ordinaire plutôt que d'échouer :
         un rendez-vous sans Meet vaut mieux qu'aucun rendez-vous,
         et l'avis interne portera la mention. */
    }
  }

  var cal = DISPONIBILITES.CALENDRIER_ID
    ? CalendarApp.getCalendarById(DISPONIBILITES.CALENDRIER_ID)
    : CalendarApp.getDefaultCalendar();
  var ev = cal.createEvent(titre, debut, fin, { description: description });
  if (meet) {
    try { ev.addGuest(String(data.email).trim()); } catch (e) { console.error(e); }
  }
  return { ok: true, debut: debut, meet: "", lien: "" };
}

function lienMeet(ev) {
  var d = ev && ev.conferenceData;
  if (!d || !d.entryPoints) return "";
  for (var i = 0; i < d.entryPoints.length; i++) {
    if (d.entryPoints[i].entryPointType === "video") return d.entryPoints[i].uri || "";
  }
  return "";
}


/* ============================================================
   8 · LES COURRIELS

   LE QUOTA COMMANDE LA FORME. Un compte Google gratuit peut
   écrire à 100 DESTINATAIRES par jour, tous envois confondus. Le
   compte, pas la boîte : `MailApp` et `GmailApp` partagent la même
   réserve, qui se libère 24 h après le premier envoi, pas à
   minuit.

   D'où UNE SEULE adresse d'avis interne, celle de l'agence, que
   les trois associés consultent. Avertir William, Alan et Elie
   séparément coûterait trois destinataires par demande et
   ramènerait la capacité à 33 demandes par jour, confirmation au
   visiteur comprise — soit moins que rien.

   QUAND LE QUOTA TOMBE À ZÉRO, LE CLASSEUR CONTINUE. L'écriture
   au Sheet et la création du rendez-vous ne dépendent pas du
   courrier : seuls les avis s'arrêtent. On ne lève pas, on note.
   ============================================================ */

/* L'adresse de l'agence, jamais écrite dans ce dépôt : le script
   s'exécute en tant que son propriétaire, on la lui demande. Une
   propriété de script peut la remplacer si l'avis doit partir
   ailleurs, sans toucher au code. */
function notifDest() {
  var forcee = PropertiesService.getScriptProperties().getProperty("NOTIF_DEST");
  if (forcee) return forcee;
  return Session.getEffectiveUser().getEmail();
}

/* Reste-t-il de quoi écrire ? Deux destinataires par demande au
   plus : l'avis interne et la confirmation. */
function quotaRestant() {
  try { return MailApp.getRemainingDailyQuota(); } catch (e) { return 0; }
}

function envoyer(dest, sujet, corps) {
  if (!dest) return false;
  if (quotaRestant() < 1) {
    console.warn("Quota d'envoi épuisé : « " + sujet + " » non envoyé à " + dest);
    return false;
  }
  try {
    MailApp.sendEmail({ to: dest, subject: sujet, body: corps, name: "APED Agence" });
    return true;
  } catch (e) {
    console.error("envoi à " + dest + " : " + e);
    return false;
  }
}

function avertirAgence(kind, data, extra, ecrit) {
  var def = SCHEMA[kind];
  var lignes = [];

  lignes.push(def.sujet.toUpperCase());
  lignes.push(quand(new Date()));
  lignes.push("");

  def.champs.forEach(function (c) {
    var v = Object.prototype.hasOwnProperty.call(extra, c.champ)
      ? extra[c.champ] : data[c.champ];
    if (v == null || String(v).trim() === "") return;
    if (v instanceof Date) v = quand(v);
    lignes.push(c.titre + " : " + v);
  });

  if (kind === "booking") {
    lignes.push("");
    if (extra._meet) {
      lignes.push("Lien Meet : " + extra._meet);
    } else if (data.mode === MODES.MEET) {
      lignes.push("ATTENTION : le lien Meet n’a pas pu être créé. "
        + "L’événement est au calendrier ; envoyez le lien à la main.");
    } else {
      lignes.push("Appel TÉLÉPHONIQUE : c’est nous qui composons le "
        + (data.telephone || "—") + ".");
    }
    if (extra._evenement) lignes.push("Événement : " + extra._evenement);
  }

  lignes.push("");
  /* LE LIEN VA SUR LA LIGNE, PAS SUR LE CLASSEUR. `lienVersLigne`
     porte le `gid` de l'onglet et `range=A2` : un clic ouvre la
     bonne feuille, curseur sur la demande qui vient d'arriver. Un
     lien vers le classeur nu ouvrirait le premier onglet, et il
     faudrait chercher. */
  lignes.push("La ligne : " + (ecrit.url || classeur().getUrl()));

  var reste = quotaRestant();
  if (reste < 15) {
    lignes.push("");
    lignes.push("— Il reste " + reste + " envois aujourd’hui. Au-delà, "
      + "le classeur continue de se remplir mais les avis s’arrêtent.");
  }

  envoyer(notifDest(), objetAvis(kind, data, extra), lignes.join("\n"));
}

/* L'OBJET SE LIT DANS UNE LISTE DE MESSAGES, SANS L'OUVRIR.
   Trois choses, dans cet ordre : de quoi il s'agit, qui, et quand.

   L'urgence passe en premier et en majuscules, parce que c'est le
   seul cas où l'ordre de lecture de la boîte doit changer. Une
   réservation porte la plage plutôt que l'heure de la demande : ce
   qui compte, c'est quand a lieu l'appel, pas quand il a été pris. */
function objetAvis(kind, data, extra) {
  var def = SCHEMA[kind];
  var qui = String(data.nom || data.votre_nom || data.email || "").trim();
  var tete = kind === "urgent" ? "URGENCE" : def.sujet;

  var repere;
  if (kind === "booking" && extra && (extra.plage_demandee || extra._debut)) {
    repere = extra.plage_demandee || libelleComplet(extra._debut);
  } else {
    repere = libelleHeure(new Date());
  }

  return "[APED] " + tete + (qui ? " · " + qui : "") + " · " + repere;
}

/* LA CONFIRMATION AU VISITEUR — UNE PAR FORMULAIRE.

   UN SEUL GABARIT POUR SEPT DEMANDES, C'EST SIX RÉPONSES À CÔTÉ.
   « On a bien reçu votre message » après une réservation ne dit ni
   la date, ni l'heure, ni comment on se parle — et la personne
   rouvre le site pour vérifier ce qu'elle a réservé. Après une
   référence, ça ne dit pas ce qui arrive à l'entreprise présentée.
   Chaque texte ci-dessous répond à ce que la personne vient
   RÉELLEMENT de faire.

   LE DÉLAI ANNONCÉ EST CELUI DU SITE, AU MOT PRÈS. `index.html`
   promet « 12 h ouvrables » sous la FAQ et à la fin du formulaire
   de projet ; l'urgence promet « vous passez devant ». Un courriel
   qui annoncerait autre chose ferait mentir la page.

   `cadeau` NE REÇOIT RIEN : les guides se téléchargent à l'écran,
   il n'y a rien à confirmer, et un envoi de plus est un
   destinataire de moins au quota des 100. */

function texteVisiteur(kind, data, extra) {
  var nom = String(data.nom || data.votre_nom || "").trim();
  var bonjour = nom ? "Bonjour " + nom + "," : "Bonjour,";
  var signature = ["", "— APED Agence", "Trois personnes, à Québec."];

  if (kind === "booking") {
    var l = [
      bonjour,
      "",
      "C’est réservé. Voici les détails :",
      "",
      "  Quand  : " + (extra.plage_demandee || libelleComplet(extra._debut)),
      "  Durée  : " + DISPONIBILITES.DUREE_CRENEAU_MIN + " minutes",
      "  Mode   : " + data.mode,
      ""
    ];
    if (data.mode === MODES.MEET) {
      if (extra._meet) {
        l.push("Le lien pour nous rejoindre le moment venu :");
        l.push("");
        l.push("  " + extra._meet);
        l.push("");
        /* LE LIEN EST DONNÉ DEUX FOIS, ET C'EST VOULU. Google envoie
           sa propre invitation, avec le même lien — elle atterrit
           parfois dans les indésirables. Ce courriel-ci, envoyé
           depuis la boîte de l'agence en réponse à un geste du
           visiteur, y atterrit beaucoup moins. */
        l.push("Vous avez aussi reçu l’invitation Google : elle place");
        l.push("le rendez-vous dans votre calendrier. Si vous ne la");
        l.push("trouvez pas, le lien ci-dessus suffit.");
      } else {
        l.push("Le lien de la rencontre vous arrive par courriel avant l’appel.");
      }
    } else {
      l.push("C’est nous qui appelons, au " + (data.telephone || "") + ".");
      l.push("Rien à préparer.");
    }
    l.push("");
    l.push("Un empêchement ? Répondez à ce courriel, on replace ça.");
    return { sujet: "C’est réservé — " + (extra.plage_demandee || ""), corps: l.concat(signature).join("\n") };
  }

  if (kind === "project") {
    return {
      sujet: "On a votre projet",
      corps: [
        bonjour,
        "",
        "Merci d’avoir pris le temps de décrire votre projet — c’est",
        "le formulaire le plus long du site, et ce que vous y avez mis",
        "nous évite trois appels.",
        "",
        "On le regarde et on revient vers vous en moins de 12 h",
        "ouvrables avec la suite : ce qu’on ferait, dans quel ordre,",
        "et ce que ça demande de votre côté.",
        "",
        "Une seule personne suivra votre dossier du premier appel à la",
        "mise en ligne. Vous n’aurez pas à tout réexpliquer."
      ].concat(signature).join("\n")
    };
  }

  if (kind === "estimate") {
    return {
      sujet: "Votre estimation est en préparation",
      corps: [
        bonjour,
        "",
        "Vos six réponses sont arrivées. On s’en sert pour préparer un",
        "prix ferme — pas une fourchette : le montant qu’on vous dira",
        "au téléphone est celui de la facture.",
        "",
        "On vous rappelle en moins de 12 h ouvrables.",
        "",
        "Si vous préférez choisir vous-même le moment, le site permet",
        "de réserver un appel de 30 minutes à l’heure qui vous arrange."
      ].concat(signature).join("\n")
    };
  }

  if (kind === "urgent") {
    return {
      sujet: "Votre urgence est reçue — vous passez devant",
      corps: [
        bonjour,
        "",
        "C’est reçu, et c’est marqué urgent : votre demande passe",
        "devant les autres.",
        "",
        "On vous rappelle au " + (data.telephone || "numéro que vous avez laissé") + ".",
        "",
        "Si la situation change d’ici là — le site est revenu, le",
        "problème s’est déplacé — répondez à ce courriel, ça nous fait",
        "gagner du temps au moment de l’appel."
      ].concat(signature).join("\n")
    };
  }

  if (kind === "refer") {
    return {
      sujet: "Merci pour la référence",
      corps: [
        bonjour,
        "",
        "Merci d’avoir pensé à nous pour "
          + (String(data.entreprise_referee || "").trim() || "cette entreprise") + ".",
        "",
        "Voici comment la suite fonctionne :",
        "",
        "  1. On prend contact avec "
          + (String(data.contact_reference || "").trim() || "la personne indiquée") + ".",
        "  2. On vous dit où ça en est — vous n’avez rien à relancer.",
        "  3. Si un contrat est signé, votre commission part.",
        "",
        "On ne dira jamais que vous nous avez « donné un nom » : on dit",
        "que vous nous avez recommandés. La différence compte."
      ].concat(signature).join("\n")
    };
  }

  if (kind === "contact") {
    return {
      sujet: "On a bien reçu votre message",
      corps: [
        bonjour,
        "",
        "Votre message est arrivé. On vous revient en moins de 12 h",
        "ouvrables — c’est le délai affiché sur le site, et on le tient.",
        "",
        "Si c’est pressant, le site a un formulaire d’urgence qui passe",
        "devant tout le reste."
      ].concat(signature).join("\n")
    };
  }

  /* `cadeau` : les guides sont déjà téléchargés. Rien à confirmer. */
  return null;
}

function confirmerAuVisiteur(kind, data, extra) {
  var dest = String(data.email || data.votre_email || "").trim();
  if (!dest || !RE_COURRIEL.test(dest)) return;

  var t;
  try {
    t = texteVisiteur(kind, data, extra || {});
  } catch (e) {
    /* UN GABARIT QUI LÈVE NE DOIT PAS EMPORTER LA DEMANDE. Elle est
       déjà écrite au classeur quand on arrive ici ; perdre la
       confirmation est ennuyeux, perdre la demande serait grave. */
    console.error("gabarit " + kind + " : " + (e && e.stack ? e.stack : e));
    return;
  }
  if (!t) return;

  envoyer(dest, t.sujet, t.corps);
}


/* ============================================================
   9 · OUTILS
   ============================================================ */

function json(objet) {
  return ContentService
    .createTextOutput(JSON.stringify(objet))
    .setMimeType(ContentService.MimeType.JSON);
}

/* UNE DATE EN TOUTES LETTRES, EN FRANÇAIS, HEURE DE QUÉBEC.
   `formatDate` avec « EEEE MMMM » rendrait la langue du PROJET Apps
   Script — un menu déroulant que personne ne regarde, et un
   « Monday 10 August » au milieu d'un avis français. `libelleComplet`
   n'a pas de langue à deviner : la liste des jours et des mois est
   écrite dans ce fichier. */
function quand(d) {
  if (!(d instanceof Date)) return String(d || "");
  return libelleComplet(d);
}


/* ============================================================
   10 · VÉRIFICATION — à lancer depuis l'éditeur, pas par le web

   `autotest()` écrit une demande d'essai dans chacun des sept
   onglets, sans passer par le réseau. Il prouve que le classeur
   existe, que les colonnes correspondent, que le dédoublonnage
   compte, et que la validation mord. Il n'envoie AUCUN courriel et
   ne pose AUCUN rendez-vous : les deux coûtent du quota et le but
   ici est la plomberie.
   ============================================================ */

function autotest() {
  var essais = {
    project:  { nom: "Essai", entreprise: "Essai inc", email: "essai@exemple.ca", telephone: "418 555 0142" },
    estimate: { nom: "Essai", email: "essai@exemple.ca" },
    urgent:   { nom: "Essai", telephone: "418 555 0142", email: "essai@exemple.ca", message: "Essai." },
    refer:    { votre_nom: "Essai", votre_email: "essai@exemple.ca", votre_lien: "Ami ou famille",
                entreprise_referee: "Essai inc", contact_reference: "Marie Tremblay" },
    booking:  null,   /* poserait un vrai rendez-vous : hors autotest */
    contact:  { nom: "Essai", email: "essai@exemple.ca", message: "Essai." },
    cadeau:   { email: "essai@exemple.ca", telephone: "418 555 0142" }
  };

  var rapport = [];
  Object.keys(essais).forEach(function (kind) {
    var d = essais[kind];
    if (!d) { rapport.push(kind + " : ignoré (poserait un vrai rendez-vous)"); return; }

    var faute = valider(kind, d);
    if (faute) { rapport.push(kind + " : VALIDATION REFUSE — " + faute); return; }

    var un = ecrireLigne(kind, d, {});
    var deux = ecrireLigne(kind, d, {});   /* le même, tout de suite : doublon attendu */
    rapport.push(kind + " : ligne " + un.ligne
      + " · renvoi détecté : " + (deux.doublon ? "oui" : "NON — DÉFAUT"));
  });

  /* La validation doit mordre là où elle a déjà laissé passer. */
  var douze = valider("urgent", { nom: "X", telephone: "12", email: "x@y.ca", message: "m" });
  rapport.push('téléphone « 12 » : ' + (douze ? "refusé — " + douze : "ACCEPTÉ — DÉFAUT"));

  var vide = valider("contact", { nom: "X", email: "pas-une-adresse", message: "m" });
  rapport.push('courriel « pas-une-adresse » : ' + (vide ? "refusé" : "ACCEPTÉ — DÉFAUT"));

  rapport.push("quota d'envoi restant : " + quotaRestant());
  rapport.push("avis destinés à : " + notifDest());
  rapport.push("service Calendar avancé : " + (typeof Calendar !== "undefined" ? "actif" : "ABSENT"));

  var texte = rapport.join("\n");
  Logger.log(texte);
  return texte;
}

/* Efface les lignes d'essai laissées par `autotest()`. */
function nettoyerAutotest() {
  var n = 0;
  Object.keys(SCHEMA).forEach(function (kind) {
    var feuille = classeur().getSheetByName(SCHEMA[kind].onglet);
    if (!feuille || feuille.getLastRow() < 2) return;
    var cols = colonnes(kind).map(function (c) { return c.titre; });
    var largeur = cols.length;
    var lignes = feuille.getRange(2, 1, feuille.getLastRow() - 1, largeur).getValues();
    for (var r = lignes.length - 1; r >= 0; r--) {
      if (lignes[r].join("|").indexOf("essai@exemple.ca") !== -1) {
        feuille.deleteRow(r + 2);
        n++;
      }
    }
  });
  Logger.log(n + " ligne(s) d'essai retirée(s).");
  return n;
}
