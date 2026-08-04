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
     1. RÉGLAGES         — les quelques nombres qui se règlent
     2. LE SCHÉMA        — les sept onglets et leurs colonnes
     3. INITIALISATION   — `initialiser()`, à lancer une seule fois
     4. L'ENTRÉE         — `doPost`, `doGet`
     5. VALIDATION       — ce qu'on refuse, et pourquoi
     6. LE CLASSEUR      — écriture en ligne 2, dédoublonnage
     7. LE CALENDRIER    — la réservation, le Meet, le double-emploi
     8. LES COURRIELS    — avis interne, confirmation au visiteur
     9. OUTILS           — helpers
   ============================================================ */


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

  /* Durée d'un appel de découverte. Le site annonce 30 minutes. */
  DUREE_APPEL_MIN: 30,

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

/* Les colonnes de suivi, identiques sur les sept onglets. */
var SUIVI = [
  { titre: "Renvois",      largeur: 80 },
  { titre: "Lu par",       largeur: 110, liste: ASSOCIES },
  { titre: "Rappelé par",  largeur: 120, liste: ASSOCIES },
  { titre: "Statut",       largeur: 130, liste: STATUTS }
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

/* `doGet` sert de témoin de vie. `tools/verrou-env.mjs` l'appelle
   pour vérifier que l'adresse du déploiement répond vraiment,
   avant de laisser passer une mise en production. Il n'écrit
   rien et ne révèle rien. */
function doGet(e) {
  return json({
    success: true,
    service: "APED formulaires",
    version: 1,
    calendrier: typeof Calendar !== "undefined"
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
   7 · LE CALENDRIER — la réservation

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
  var fin = new Date(debut.getTime() + REGLAGES.DUREE_APPEL_MIN * 60000);

  /* LE PRÉAVIS DE 24 h EST REVÉRIFIÉ ICI. Le calendrier du site
     l'applique déjà, mais une requête forgée ne passe pas par le
     calendrier du site. */
  if (debut.getTime() < Date.now() + 24 * 3600 * 1000) {
    return { ok: false, message: "Cette plage demande au moins 24 h d’avance. Choisissez-en une autre." };
  }

  /* LE DOUBLE-EMPLOI. On interroge le calendrier, pas le classeur :
     il voit aussi ce qu'un associé a inscrit à la main, ce que le
     classeur ignore. */
  var occupe = false;
  try {
    var deja = CalendarApp.getDefaultCalendar().getEvents(debut, fin);
    occupe = deja.some(function (ev) {
      return ev.getMyStatus() !== CalendarApp.GuestStatus.NO;
    });
  } catch (e) {
    /* Un calendrier illisible ne doit pas empêcher de réserver :
       on laisse passer et l'avis interne le signalera. */
    console.error("lecture du calendrier : " + e);
  }
  if (occupe) {
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
      var cree = Calendar.Events.insert(evenement, "primary", {
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

  var ev = CalendarApp.getDefaultCalendar()
    .createEvent(titre, debut, fin, { description: description });
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
  lignes.push("Le classeur : " + (ecrit.url || classeur().getUrl()));

  var reste = quotaRestant();
  if (reste < 15) {
    lignes.push("");
    lignes.push("— Il reste " + reste + " envois aujourd’hui. Au-delà, "
      + "le classeur continue de se remplir mais les avis s’arrêtent.");
  }

  envoyer(notifDest(), "[APED] " + def.sujet + " · " + (data.nom || data.votre_nom || data.email || ""),
          lignes.join("\n"));
}

/* LA CONFIRMATION AU VISITEUR. Elle ne part pas pour tout : une
   estimation et un lead magnet donnent déjà leur réponse à
   l'écran, et un courriel de plus est un destinataire de moins au
   quota. Elle part là où le site a promis un délai ou un
   rendez-vous, parce que la promesse doit être tenue par écrit. */
function confirmerAuVisiteur(kind, data, extra) {
  var dest = String(data.email || data.votre_email || "").trim();
  if (!dest || !RE_COURRIEL.test(dest)) return;

  var sujet, corps;
  var nom = String(data.nom || data.votre_nom || "").trim();
  var bonjour = nom ? "Bonjour " + nom + "," : "Bonjour,";

  if (kind === "booking") {
    var lignes = [
      bonjour,
      "",
      "Votre rendez-vous est réservé.",
      "",
      "Quand : " + (data.plage_demandee || quand(extra._debut)),
      "Durée : " + REGLAGES.DUREE_APPEL_MIN + " minutes",
      "Mode : " + data.mode
    ];
    if (data.mode === MODES.MEET) {
      lignes.push("");
      if (extra._meet) {
        lignes.push("Le lien pour nous rejoindre :");
        lignes.push(extra._meet);
        lignes.push("");
        lignes.push("L’invitation est aussi partie vers votre calendrier.");
      } else {
        lignes.push("Le lien de la rencontre vous arrive par courriel "
          + "avant l’appel.");
      }
    } else {
      lignes.push("");
      lignes.push("On vous appelle au " + (data.telephone || "") + ".");
    }
    lignes.push("");
    lignes.push("Un empêchement ? Répondez à ce courriel, on replace ça.");
    lignes.push("");
    lignes.push("— APED Agence");
    sujet = "Votre rendez-vous est confirmé";
    corps = lignes.join("\n");

  } else if (kind === "contact" || kind === "urgent" || kind === "project" || kind === "refer") {
    var delai = kind === "urgent"
      ? "On vous revient au plus vite — c’est marqué urgent."
      : "On vous revient en moins de 12 h ouvrables.";
    sujet = "On a bien reçu votre message";
    corps = [
      bonjour,
      "",
      "Votre message est arrivé. " + delai,
      "",
      "Une seule personne suit votre dossier du premier appel à la "
        + "mise en ligne : vous n’aurez pas à tout réexpliquer.",
      "",
      "— APED Agence"
    ].join("\n");

  } else {
    /* `estimate` et `cadeau` : la réponse est déjà à l'écran. */
    return;
  }

  envoyer(dest, sujet, corps);
}


/* ============================================================
   9 · OUTILS
   ============================================================ */

function json(objet) {
  return ContentService
    .createTextOutput(JSON.stringify(objet))
    .setMimeType(ContentService.MimeType.JSON);
}

function quand(d) {
  if (!(d instanceof Date)) return String(d || "");
  return Utilities.formatDate(d, REGLAGES.FUSEAU, "EEEE d MMMM yyyy 'à' HH'h'mm");
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
