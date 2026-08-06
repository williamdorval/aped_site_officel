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
     [0,1,2,3,4,5,6] = sept jours sur sept.
     Pour revenir du lundi au vendredi : [1,2,3,4,5]. */
  JOURS_OUVRABLES: [0, 1, 2, 3, 4, 5, 6],

  /* LA PLAGE DE LA JOURNÉE, en heure de Toronto, format « HH:MM ».
     Le dernier créneau COMMENCE assez tôt pour FINIR avant
     HEURE_FIN : avec une fin à 20:00 et des appels de 30 min,
     rien ne démarre après 19:30. */
  HEURE_DEBUT: "09:00",
  HEURE_FIN:   "20:00",

  /* LES PAUSES. Un créneau qui chevauche l'une d'elles n'existe
     pas. `[]` = aucune pause récurrente, la journée est pleine de
     HEURE_DEBUT à HEURE_FIN.
     Ce sont des pauses RÉCURRENTES, tous les jours ouvrables ;
     une pause d'un seul jour se met dans Google Agenda.
     Pour reprendre l'heure du midi :
       PAUSES: [{ debut: "12:00", fin: "13:00" }] */
  PAUSES: [],

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

  /* LES AUTRES AGENDAS QUI BLOQUENT AUSSI.  D-736

     CE QUE ÇA RÉPARE. Le compte qui exécute ce script est celui de
     l'agence. Un blocage créé depuis un agenda PERSONNEL est donc
     invisible d'ici : il ne bloque rien, et rien ne le dit — le
     créneau reste offert au visiteur, qui réserve par-dessus le
     rendez-vous. Constaté le 2026-08-06 : un « pas dispo » posé sur
     le 12 août dans l'agenda personnel laissait les neuf créneaux
     du 12 août ouverts sur le site.

     Chaque identifiant listé ici est lu EN PLUS du principal, et
     tout ce qui s'y trouve bloque exactement comme dans celui de
     l'agence. Un seul geste à faire avant : dans l'agenda
     personnel, « Paramètres → Partager avec des personnes
     précises → apedagence@gmail.com → Afficher tous les détails ».
     Sans ce partage le script ne peut pas le lire, et il REFUSE de
     rendre des créneaux plutôt que d'en inventer.

     Exemple :  CALENDRIERS_EN_PLUS: ["prenom.nom@gmail.com"] */
  CALENDRIERS_EN_PLUS: [],

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

  /* COMBIEN DE PIÈCES, ET DE QUELLE NATURE.  D-758

     Le poids total était contrôlé, le NOMBRE et le TYPE ne
     l'étaient pas : quatre cents fichiers d'un kilo passaient sous
     les huit mégaoctets et faisaient quatre cents créations Drive
     dans une requête, et un `.exe` renommé atterrissait dans le
     dossier de l'agence sans que rien ne le dise.

     La liste est celle de ce qu'un client envoie VRAIMENT pour un
     site : des images, un PDF, un logo, un document. Tout le reste
     se redemande par courriel, ce qui est plus lent pour nous et
     beaucoup moins grave. */
  PIECES_MAX_NOMBRE: 12,
  PIECES_EXTENSIONS: [
    "pdf", "png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "heic",
    "doc", "docx", "odt", "rtf", "txt", "csv", "xls", "xlsx", "ods",
    "ppt", "pptx", "ai", "eps", "psd", "zip"
  ],

  /* LE DÉBIT.  D-758

     `doPost` n'avait AUCUNE limite. Un robot qui trouve l'adresse
     du service — elle est en clair dans `js/main.js`, elle ne peut
     pas ne pas l'être — remplissait le classeur aussi vite que
     Google acceptait, et chaque ligne NÉE consomme un courriel de
     la réserve quotidienne de cent. Le honeypot n'attrape que les
     robots qui remplissent tous les champs.

     UN PLAFOND UNIQUE SE RETOURNE CONTRE NOUS, et c'est le piège
     de tout ce mécanisme. Refuser les demandes au-delà de N par
     heure, c'est offrir au premier robot venu le moyen de fermer le
     formulaire à tous les vrais clients pour le reste de l'heure.
     Il n'aurait même pas à insister.

     Trois compteurs, donc, et ils ne coupent pas la même chose :

       · par SESSION — un visiteur honnête envoie une fois par
         étape, jamais quarante fois en une heure ;
       · les AVIS — au-delà, la ligne S'ÉCRIT QUAND MÊME, mais on
         n'écrit plus de courriel. Une ligne ne coûte rien et se
         supprime en dix secondes ; un envoi brûlé bloque les
         VRAIES demandes pendant vingt-quatre heures. Le classeur
         le dit dans la colonne « Étape », pour qu'un silence ne
         passe pas pour une absence de demande ;
       · les LIGNES — le plafond dur, très haut, qui n'existe que
         pour empêcher un classeur de cent mille lignes.

     Les fusions ne comptent dans aucun des deux derniers : un
     visiteur qui remplit dix étapes ne pèse qu'un. */
  DEBIT_SESSION_MAX: 40,
  DEBIT_SESSION_FENETRE_S: 3600,
  DEBIT_AVIS_MAX: 40,
  DEBIT_AVIS_FENETRE_S: 3600,
  DEBIT_LIGNES_MAX: 300,
  DEBIT_LIGNES_FENETRE_S: 3600,

  /* LA PORTE DES CRÉNEAUX SE MET EN CACHE.  D-758

     Elle lit six semaines d'agenda à chaque appel — 3,4 s mesurées
     contre le vrai service le 2026-08-06 — et elle est publique et
     sans limite. Le quota d'exécution d'un compte gratuit est de
     90 minutes par jour : environ 1 600 appels suffisaient à
     l'épuiser, et le script mort emporte AUSSI les formulaires.

     Le cache est court, et il est VIDÉ à chaque réservation : un
     créneau qui vient d'être pris disparaît tout de suite. Le seul
     décalage qui reste est celui d'un blocage posé à la main dans
     l'agenda, et il ne dépasse pas cette durée. */
  CRENEAUX_CACHE_S: 90,

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
    /* `requis` NE VAUT QU'À LA DERNIÈRE ÉTAPE.  D-744
       Une étape intermédiaire n'a par définition pas tout rempli :
       exiger le courriel à l'étape 2 ferait échouer la sauvegarde
       progressive, donc perdre l'abandon qu'on cherche à capter.
       `valider()` ne l'applique que si `_final` est vrai. */
    requis: ["nom", "entreprise", "email", "budget"],
    /* Le minimum sans lequel on ne garde même pas une trace. */
    requisPartiel: ["email"],
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
      /* LES QUATRE QUI FONT LA FOURCHETTE.  D-749
         Sans elles, le chiffre montre au visiteur ne serait plus
         explicable trois semaines plus tard : on lirait le montant
         sans les reponses qui l'ont produit. */
      { champ: "ampleur",         titre: "Ampleur",            largeur: 180 },
      { champ: "niveau_design",   titre: "Niveau de design",   largeur: 200 },
      { champ: "fonctions",       titre: "Fonctions",          largeur: 220 },
      { champ: "contenu",         titre: "Contenu",            largeur: 180 },
      { champ: "blocage",         titre: "Ce qui les bloque",  largeur: 300 },
      { champ: "objectif",        titre: "Objectif",           largeur: 180 },
      { champ: "budget",          titre: "Budget",             largeur: 150 },
      { champ: "echeancier",      titre: "Échéancier",         largeur: 140 },
      { champ: "description",     titre: "Description",        largeur: 340 },
      { champ: "connu_par",       titre: "Nous a connus par",  largeur: 160 },
      { champ: "fourchette_vue",  titre: "Fourchette vue",     largeur: 170 },
      { champ: "prix_reaction",   titre: "Ça convient ?",      largeur: 120 },
      { champ: "prix_raison",     titre: "Pourquoi pas",       largeur: 300 },
      { champ: "_pieces",         titre: "Pièces jointes",     largeur: 260 }
    ]
  },

  estimate: {
    onglet: "Estimation rapide",
    sujet: "Demande d'estimation",
    /* LE TÉLÉPHONE EST OBLIGATOIRE ICI, ET IL NE L'ÉTAIT PAS.  D-759
       Une estimation se règle en deux minutes d'appel et jamais en
       trois courriels : la fourchette dépend de choses qu'on ne
       demande pas au formulaire. Sans numéro, le seul lead qu'on
       ait déjà chiffré est celui qu'on ne peut pas rappeler. */
    requis: ["nom", "email", "telephone"],
    requisPartiel: ["email"],
    /* LE PRIX SE LIT AVANT LES HUIT REPONSES QUI L'ONT PRODUIT.
       D-759

       Les trois colonnes du prix fermaient l'onglet, derriere onze
       colonnes de parametres : la seule information qui dit si un
       lead vaut un rappel etait la seule qu'on ne voyait pas sans
       faire glisser le classeur. Elles montent juste apres de quoi
       appeler. Les huit reponses restent, plus loin — elles servent
       a PREPARER l'appel, pas a decider de le passer. */
    champs: [
      { champ: "nom",             titre: "Nom",                largeur: 150 },
      { champ: "telephone",       titre: "Téléphone",          largeur: 140 },
      /* CE QUE LE VISITEUR A VU, PAS CE QU'ON RECALCULE.  D-746
         Une fourchette recalculée après coup n'est pas la même
         preuve : le barème peut changer entre-temps, et c'est
         justement sur le chiffre AFFICHÉ que la personne a réagi. */
      { champ: "fourchette_vue",  titre: "Fourchette vue",     largeur: 170 },
      { champ: "prix_reaction",   titre: "Ça convient ?",      largeur: 120 },
      { champ: "prix_raison",     titre: "Pourquoi pas",       largeur: 300 },
      { champ: "email",           titre: "Courriel",           largeur: 210 },
      { champ: "type_de_projet",  titre: "Type de projet",     largeur: 150 },
      { champ: "domaine",         titre: "Domaine",            largeur: 150 },
      { champ: "envergure",       titre: "Envergure",          largeur: 130 },
      { champ: "ampleur",         titre: "Ampleur",            largeur: 160 },
      { champ: "fonctions",       titre: "Fonctions",          largeur: 160 },
      { champ: "contenu",         titre: "Contenu",            largeur: 160 },
      { champ: "niveau_design",   titre: "Niveau de design",   largeur: 140 },
      { champ: "echeancier",      titre: "Échéancier",         largeur: 140 },
      { champ: "site_existant",   titre: "A déjà un site",     largeur: 110 }
    ]
  },

  urgent: {
    onglet: "Urgence",
    sujet: "URGENCE",
    requis: ["nom", "telephone", "email", "message"],
    requisPartiel: ["telephone"],
    champs: [
      /* L'ORDRE EST CELUI DE LA LECTURE EN PANIQUE. Ce qu'on veut
         savoir en trois secondes : c'est grave comment, depuis
         quand, sur quoi, et qui j'appelle. Le reste après. */
      { champ: "gravite",         titre: "Gravité",            largeur: 150 },
      { champ: "depuis_quand",    titre: "Depuis quand",       largeur: 140 },
      { champ: "systeme",         titre: "Quoi est touché",    largeur: 240 },
      { champ: "nom",             titre: "Nom",                largeur: 150 },
      { champ: "entreprise",      titre: "Entreprise",         largeur: 170 },
      { champ: "telephone",       titre: "Téléphone",          largeur: 130 },
      { champ: "email",           titre: "Courriel",           largeur: 210 },
      { champ: "message",         titre: "L'urgence",          largeur: 420 },
      { champ: "impact",          titre: "Ce que ça bloque",   largeur: 300 }
    ]
  },

  refer: {
    onglet: "Référer une entreprise",
    sujet: "Nouvelle référence",
    /* LE NUMERO DU REFERENT EST OBLIGATOIRE.  D-759
       C'est LUI qu'on rappelle pour lui verser sa commission quand
       le contrat se signe. Une reference sans moyen de joindre
       celui qui l'a faite est une reference qu'on ne peut pas
       honorer, et c'est pire que pas de reference du tout. */
    requis: ["votre_nom", "votre_email", "votre_telephone", "votre_lien",
             "entreprise_referee", "contact_reference"],
    /* LE NOM DE L'ENTREPRISE SUFFIT À OUVRIR UNE LIGNE. C'est le
       minimum vital d'une référence : avec lui on peut chercher, et
       sans lui on n'a rien du tout. */
    requisPartiel: ["entreprise_referee"],
    champs: [
      /* L'ENTREPRISE RÉFÉRÉE D'ABORD. C'est elle le sujet de la
         ligne ; le référent vient après. L'ordre suivait l'ordre du
         formulaire, qui demandait le référent en premier — mais on
         relit ce classeur pour savoir QUI CONTACTER. */
      { champ: "entreprise_referee", titre: "Entreprise référée", largeur: 190 },
      { champ: "contact_reference",  titre: "Personne à contacter", largeur: 180 },
      { champ: "domaine",            titre: "Domaine",            largeur: 150 },
      { champ: "taille",             titre: "Taille",             largeur: 130 },
      { champ: "besoin",             titre: "Besoin pressenti",   largeur: 180 },
      { champ: "contexte",           titre: "Contexte",           largeur: 320 },
      { champ: "presentation",       titre: "Comment se présenter", largeur: 260 },
      /* LE SECOND BLOC : CELUI QU'ON PAIE.  D-759

         Les deux jeux se lisaient dans la meme rangee de colonnes
         sans qu'on sache lequel etait lequel : « Courriel référent »
         voisinait « Personne à contacter », et « Lien avec
         l'entreprise » se lisait comme une adresse web alors que
         c'est un lien de parente. Chaque colonne du referent porte
         maintenant son nom en tete — le classeur se lit de gauche a
         droite sans avoir a se souvenir de rien. */
      { champ: "votre_nom",          titre: "RÉFÉRENT · nom",       largeur: 150 },
      { champ: "votre_telephone",    titre: "RÉFÉRENT · téléphone", largeur: 140 },
      { champ: "votre_email",        titre: "RÉFÉRENT · courriel",  largeur: 210 },
      { champ: "votre_entreprise",   titre: "RÉFÉRENT · entreprise", largeur: 180 },
      { champ: "votre_lien",         titre: "RÉFÉRENT · lien avec elle", largeur: 190 }
    ]
  },

  booking: {
    onglet: "Réserver un appel",
    sujet: "Demande de rendez-vous",
    requis: ["nom", "email", "telephone"],
    /* Le site n'ouvre la session qu'une fois le courriel saisi :
       avant, il n'y a qu'une case de calendrier cliquée, et une
       ligne sans moyen de rappeler ne sert à rien. */
    requisPartiel: ["email"],
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
/* CE QU'ON VOIT SANS FAIRE GLISSER LE CLASSEUR.  D-759

   « Notes internes » est large de 340 px et se lit une fois sur
   vingt. En cinquieme colonne, elle poussait TOUTE la demande
   au-dela du bord de l'ecran : sur 1 440 px, les sept colonnes de
   tete en mangeaient 1 010, et il ne restait la place que du nom.
   Le lundi matin, chaque ligne demandait un glissement lateral
   avant de dire quoi que ce soit.

   Elle passe donc a la FIN, avec les deux colonnes de service. Ce
   qui reste en tete tient en 670 px et repond a « qui, ou il en
   est, quand » — le reste de l'ecran est a la demande elle-meme. */
var SUIVI = [
  { titre: "Vu",             largeur: 50,  case: true },
  { titre: "Lu par",         largeur: 110, liste: ASSOCIES },
  { titre: "Rappelé par",    largeur: 120, liste: ASSOCIES },
  { titre: "Statut",         largeur: 130, liste: STATUTS }
];

/* Les colonnes de suivi qui se lisent APRES la demande. */
var SUIVI_FIN = [
  { titre: "Notes internes", largeur: 340 }
];

/* DEUX COLONNES QUI NE SONT NI DU SUIVI NI DU VISITEUR.  D-743

   Elles se glissent entre les deux, en F et G, et pas au bout. La
   raison est la même que pour « Statut » : ce sont des colonnes
   qu'on LIT à chaque coup d'œil.

   « Étape » est la seule qui dise si une demande est finie. Avec la
   sauvegarde progressive, une ligne peut exister alors que le
   visiteur est parti au tiers du formulaire — c'est même tout
   l'intérêt. La ranger à droite reviendrait à cacher la seule
   information nouvelle du classeur. */
var TECHNIQUES = [
  { titre: "Étape",      largeur: 110 },
  { titre: "Horodatage", largeur: 150 }
];

/* La signature du dédoublonnage. Colonne masquée : elle sert au
   script, elle n'a rien à dire à un humain. */
var COL_SIGNATURE = "Signature";

/* L'ordre complet des colonnes d'un onglet.

   TOUT LE SUIVI PASSE DEVANT.  D-743

   D-738 avait déjà tiré « Statut » de la dix-neuvième colonne vers
   la B, pour la même raison : c'est ce qu'on lit à chaque coup
   d'œil, et le chercher coûtait un défilement horizontal vingt fois
   par matinée. Le reste du suivi le rejoint maintenant, parce qu'il
   se remplit dans le même geste : on coche « Vu », on met son nom,
   on choisit le statut, on écrit une note. Quatre colonnes voisines,
   pas quatre allers-retours.

     A · Vu              une case à cocher, pas une liste
     B · Lu par
     C · Rappelé par
     D · Statut
     E · Notes internes
     F · Étape           où le visiteur s'est arrêté
     G · Horodatage
     H… les réponses du visiteur
     puis Renvois, puis la signature (masquée)

   « Renvois » reste au bout : c'est un compteur de réessais réseau,
   on ne le lit que quand quelque chose cloche. */
function colonnes(kind) {
  var out = [];
  SUIVI.forEach(function (c) { out.push(c); });
  TECHNIQUES.forEach(function (c) { out.push(c); });
  SCHEMA[kind].champs.forEach(function (c) { out.push(c); });
  SUIVI_FIN.forEach(function (c) { out.push(c); });
  out.push({ titre: "Renvois", largeur: 80 });
  out.push({ titre: COL_SIGNATURE, largeur: 120 });
  return out;
}

/* LA COLONNE QUI DIT « CETTE LIGNE EXISTE ».

   C'était `A`, du temps où `A` portait l'horodatage. `A` porte
   maintenant une case à cocher, et une case décochée vaut `FALSE`,
   pas `""` : `$A2<>""` serait vrai sur les mille lignes vides du
   bas de l'onglet, qui deviendraient toutes jaunes. On demande donc
   sa position à `colonnes()`, comme partout ailleurs. */
function colonneExistence(titres) {
  var i = titres.indexOf("Horodatage");
  return colonneLettre((i < 0 ? 0 : i) + 1);
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

  /* CHAQUE AGENDA EST LU ICI, UNE FOIS, POUR DE VRAI.  D-736
     Un agenda mal orthographié ou jamais partagé ne se signale
     autrement qu'en production, sous la forme d'un site qui
     n'affiche plus aucune plage. On le découvre à l'installation,
     dans le journal, avec le nom du fautif. */
  var t0 = new Date();
  var t1 = new Date(t0.getTime() + 86400000);
  listeCalendriers().forEach(function (calId) {
    try {
      occupationsDe(calId, t0, t1);
      Logger.log("Agenda lisible : " + calId);
    } catch (e) {
      Logger.log("*** AGENDA ILLISIBLE : " + calId + " — " + e
        + "\n    Tant qu'il l'est, le site n'affichera AUCUNE plage."
        + "\n    Partagez-le avec le compte de l'agence, ou retirez-le de CALENDRIERS_EN_PLUS.");
    }
  });

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

  /* RÉÉCRIRE LES EN-TÊTES SANS DÉPLACER LES DONNÉES LES DÉCALE.
     D-739

     La version précédente écrivait la ligne 1 et affirmait « les
     données déjà écrites ne bougent pas — elles sont sous la ligne
     1 ». C'est vrai, et c'est précisément le défaut : si l'ordre
     des colonnes CHANGE, les en-têtes bougent et les données non.
     Le courriel d'un client se retrouve sous « Ville », son
     téléphone sous « Courriel », et rien ne le signale — le
     classeur a l'air parfaitement normal.

     Le déplacement de « Statut » en colonne B (D-738) aurait fait
     exactement ça sur un classeur déjà rempli.

     ON MIGRE DONC : on relit les anciens en-têtes, et si l'ordre a
     changé, on redispose chaque ligne existante dans le nouvel
     ordre AVANT de réécrire la ligne 1. Une colonne disparue perd
     sa valeur — c'est le seul cas où quelque chose se perd, et il
     est annoncé dans le journal. */
  /* ON EFFACE TOUTES LES VALIDATIONS AVANT D'EN POSER UNE.  D-756

     C'est le frère jumeau de la règle de couleur empilée (D-755), et
     il coûtait beaucoup plus cher.

     Une liste déroulante se pose sur une COLONNE. Quand l'ordre des
     colonnes change — D-738 a tiré « Statut » en B, D-743 a amené
     tout le suivi en A–E — `migrerColonnes` redispose les VALEURS,
     et personne ne touche aux validations : elles restent sur les
     anciennes positions, qui portent maintenant des réponses de
     visiteur.

     CE QUE ÇA FAIT, ET CE N'EST PAS COSMÉTIQUE. Une validation
     `requireValueInList(["William","Alan","Elie"])` en
     `setAllowInvalid(false)` REFUSE toute autre valeur. `setValues`
     sur la ligne entière lève alors — après avoir écrit les
     colonnes qui précèdent la fautive. La ligne est écrite À MOITIÉ,
     en silence : « Étape » disait « ✓ complète » pendant que le
     budget, l'échéancier et la description n'arrivaient jamais.

     Mesuré le 2026-08-06 contre le vrai service : « Démarrer un
     projet » s'arrêtait net à la colonne 19, « Réserver un appel » à
     la 13 — d'où des réservations sans plage, sans lien Meet et sans
     signature.

     `clearDataValidations` sur TOUTE la largeur de la feuille, pas
     seulement sur les colonnes connues : une validation périmée peut
     très bien se trouver au-delà du dernier en-tête.

     ET AVANT `migrerColonnes`, PAS APRÈS — L'ORDRE PORTE LA
     CORRECTION. La migration réécrit toutes les lignes existantes
     dans le nouvel ordre : c'est le premier `setValues` que les
     validations périmées rencontrent, donc le premier qu'elles font
     lever. Purger ensuite laissait `initialiser()` échouer sur le
     seul classeur qui en avait besoin — celui qui était déjà
     abîmé. Le banc l'a attrapé au cas 10. */
  feuille.getRange(2, 1, Math.max(feuille.getMaxRows() - 1, 1),
                   feuille.getMaxColumns()).clearDataValidations();

  migrerColonnes(feuille, titres);

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

  /* L'horodatage se lit, il ne se déchiffre pas. Sa colonne n'est
     plus la première : on la demande. */
  var iDate = titres.indexOf("Horodatage");
  if (iDate >= 0) {
    feuille.getRange(2, iDate + 1, Math.max(feuille.getMaxRows() - 1, 1), 1)
      .setNumberFormat("yyyy-mm-dd hh:mm:ss");
  }

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

  /* LA CASE À COCHER SE POSE SUR LES LIGNES QUI EXISTENT, PAS SUR
     LA COLONNE ENTIÈRE.  D-743

     Posée sur les mille lignes de l'onglet, elle donnerait mille
     cases vides sous les données — et surtout `A` cesserait d'être
     vide, ce qui casse toute règle qui teste « cette ligne
     existe-t-elle ». `ecrireLigne` en pose une sur chaque nouvelle
     ligne ; ici on rattrape celles qui étaient déjà là. */
  var iVu = titres.indexOf("Vu");
  if (iVu >= 0 && feuille.getLastRow() >= 2) {
    feuille.getRange(2, iVu + 1, feuille.getLastRow() - 1, 1).insertCheckboxes();
  }

  /* La signature ne regarde personne. */
  var iSig = titres.indexOf(COL_SIGNATURE);
  if (iSig >= 0) feuille.hideColumns(iSig + 1);

  /* Le texte long revient à la ligne au lieu de déborder sur la
     colonne voisine ; sans ça, un message de 400 signes rend les
     colonnes de suivi illisibles. */
  feuille.getRange(1, 1, feuille.getMaxRows(), titres.length)
    .setVerticalAlignment("top");

  marquerNonLues(feuille, titres);

  return feuille;
}

/* REDISPOSER LES LIGNES EXISTANTES DANS LE NOUVEL ORDRE.  D-739
   Ne fait rien si l'ordre n'a pas changé — c'est le cas courant. */
function migrerColonnes(feuille, titresVoulus) {
  var dernierC = feuille.getLastColumn();
  var dernierL = feuille.getLastRow();
  if (dernierC < 1 || dernierL < 1) return;

  var anciens = feuille.getRange(1, 1, 1, dernierC).getValues()[0]
    .map(function (t) { return String(t || ""); });
  if (!anciens.join("")) return;                       /* onglet neuf */

  var identique = anciens.length === titresVoulus.length
    && anciens.every(function (t, i) { return t === titresVoulus[i]; });
  if (identique) return;

  Logger.log("Migration de « " + feuille.getName() + " » : l'ordre des colonnes a changé.");
  Logger.log("  avant : " + anciens.join(" | "));
  Logger.log("  après : " + titresVoulus.join(" | "));

  var perdues = anciens.filter(function (t) {
    return t && titresVoulus.indexOf(t) === -1;
  });
  if (perdues.length) Logger.log("  COLONNES SUPPRIMÉES (valeurs perdues) : " + perdues.join(", "));

  if (dernierL < 2) return;                            /* en-têtes seuls */

  var donnees = feuille.getRange(2, 1, dernierL - 1, dernierC).getValues();
  var neuves = donnees.map(function (ligne) {
    return titresVoulus.map(function (t) {
      var i = anciens.indexOf(t);
      return i === -1 ? "" : ligne[i];
    });
  });

  /* On efface la zone avant d'écrire : si le nouvel ordre a moins
     de colonnes, les anciennes valeurs de droite resteraient
     affichées sous aucun en-tête. */
  feuille.getRange(2, 1, dernierL - 1, Math.max(dernierC, titresVoulus.length)).clearContent();
  feuille.getRange(2, 1, neuves.length, titresVoulus.length).setValues(neuves);
  Logger.log("  " + neuves.length + " ligne(s) redisposée(s).");
}

/* UNE DEMANDE NON LUE DOIT SE VOIR SANS ÊTRE CHERCHÉE.  D-740

   « Lu par » vide veut dire que personne ne l'a encore ouverte.
   C'est l'information la plus urgente du classeur, et elle était
   invisible : une colonne vide au milieu de vingt colonnes pleines
   ne saute pas aux yeux un lundi matin.

   Une mise en forme conditionnelle sur la LIGNE ENTIÈRE la rend
   évidente. Le minium du site n'a rien à faire ici — le classeur
   est un outil interne, pas une page. On prend un jaune pâle, qui
   se distingue sur blanc sans fatiguer, et qui disparaît dès que
   quelqu'un met son nom. */
function marquerNonLues(feuille, titres) {
  var iLu = titres.indexOf("Lu par");
  if (iLu < 0) return;
  var colLu = colonneLettre(iLu + 1);
  var colVie = colonneExistence(titres);

  var plage = feuille.getRange(2, 1, Math.max(feuille.getMaxRows() - 1, 1), titres.length);
  var regle = SpreadsheetApp.newConditionalFormatRule()
    /* `$` sur la colonne : la règle juge « Lu par » et colore
       toute la ligne. Sans lui, chaque cellule regarderait sa
       propre colonne et seule celle de « Lu par » se colorerait. */
    .whenFormulaSatisfied('=AND($' + colVie + '2<>"", $' + colLu + '2="")')
    .setBackground("#fff3d6")
    .setRanges([plage])
    .build();

  /* ON REMPLACE LA NÔTRE AU LIEU D'EMPILER, et le filtre ne peut
     pas dépendre de la POSITION de la colonne.  D-755

     Il cherchait `$<lettre de Lu par>2=""`. Le jour où « Lu par »
     a changé de colonne (D-743), l'ancienne règle a cessé d'être
     reconnue : elle est restée, la neuve s'est ajoutée, et le
     classeur a porté DEUX règles par onglet. Relancer
     `initialiser()` en aurait ajouté une de plus à chaque fois.

     On reconnaît maintenant nos règles à leur COULEUR, qui ne
     bouge pas, et à la forme de leur formule. */
  var regles = feuille.getConditionalFormatRules().filter(function (r) {
    try {
      var b = r.getBooleanCondition();
      if (b === null) return true;
      var f = String(b.getCriteriaValues());
      /* La signature d'une règle à nous : un ET entre « la ligne
         existe » et « une colonne de suivi est vide ». */
      if (/^=AND\(\$[A-Z]+2<>"",\s*\$[A-Z]+2=""\)$/.test(f)) return false;
      return f.indexOf('$' + colLu + '2=""') === -1;
    } catch (e) { return true; }
  });
  regles.push(regle);
  feuille.setConditionalFormatRules(regles);
}

/* 1 → A, 27 → AA. */
function colonneLettre(n) {
  var s = "";
  while (n > 0) {
    var r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
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
      /* LA RÉPONSE SORT DU CACHE QUAND ELLE Y EST.  D-758
         On garde le TEXTE déjà sérialisé : la reconstruire coûterait
         la lecture d'agenda qu'on cherche justement à éviter. */
      var cache = CacheService.getScriptCache();
      var pret = cache.get(CLE_CACHE_CRENEAUX);
      if (pret) return texteJson(pret);

      var frais = JSON.stringify(creneauxLibres());
      cache.put(CLE_CACHE_CRENEAUX, frais, REGLAGES.CRENEAUX_CACHE_S);
      return texteJson(frais);
    } catch (err) {
      console.error("creneaux : " + (err && err.stack ? err.stack : err));
      return json({ success: false, message: "Les disponibilités sont momentanément illisibles." });
    }
  }

  if (action === "diag") {
    try {
      return json(diagnostic());
    } catch (err) {
      console.error("diag : " + (err && err.stack ? err.stack : err));
      return json({ success: false, message: String(err) });
    }
  }

  return json({
    success: true,
    service: "APED formulaires",
    version: 8,
    calendrier: typeof Calendar !== "undefined",
    calendriers: listeCalendriers(),
    fuseau: REGLAGES.FUSEAU,
    creneaux: true,
    diag: true
  });
}

/* ============================================================
   LA TROISIÈME PORTE — CE QUE LE CLASSEUR A VRAIMENT L'AIR.  D-737

   POURQUOI ELLE EXISTE. La forme du classeur — l'ordre des
   colonnes, la couleur des non-lues, le format des cellules — ne
   se prouve pas depuis le dépôt. Elle vit chez Google. Une session
   qui n'a pas accès au compte de l'agence ne peut qu'affirmer
   « c'est écrit dans le code, donc c'est bon », et c'est
   exactement le genre de preuve que ce projet refuse.

   POURQUOI ELLE NE FUIT RIEN. La porte est publique comme les deux
   autres. Elle ne rend donc AUCUNE donnée de client :

     · la STRUCTURE (en-têtes, largeurs, lignes figées, règles de
       mise en forme) ne dit rien qu'un formulaire du site ne dise
       déjà — les titres de colonnes sont les libellés des champs ;
     · le CONTENU n'est rendu que pour les lignes qui portent un
       marqueur de `MARQUEURS_ESSAI`. Aucun paramètre ne choisit ce
       qui est cherché : la liste est en dur. Une ligne de vrai
       client ne peut donc pas sortir d'ici, même en la demandant.

   Elle est sans effet de bord, et se retire en supprimant ce bloc
   plus les six lignes de `doGet`.
   ============================================================ */
function diagnostic() {
  var cl = classeur();
  var onglets = [];

  Object.keys(SCHEMA).forEach(function (kind) {
    var def = SCHEMA[kind];
    var feuille = cl.getSheetByName(def.onglet);
    if (!feuille) { onglets.push({ onglet: def.onglet, absent: true }); return; }

    var cols = colonnes(kind);
    var nbCol = cols.length;
    var titres = feuille.getRange(1, 1, 1, nbCol).getValues()[0];
    var largeurs = [], formats = [];
    for (var c = 1; c <= nbCol; c++) {
      largeurs.push(feuille.getColumnWidth(c));
      formats.push(feuille.getRange(2, c).getNumberFormat());
    }

    /* LES VALIDATIONS, COLONNE PAR COLONNE.  D-756

       CETTE PORTE NE LES REGARDAIT PAS, ET C'EST POUR ÇA QUE LE
       DÉFAUT A TENU. Elle rendait les en-têtes, les largeurs, les
       formats et les règles de couleur — tout sauf la seule chose
       qui pouvait REFUSER une écriture. Le classeur avait l'air
       parfaitement sain sous l'instrument pendant qu'il perdait la
       moitié droite de chaque ligne.

       On lit toute la largeur RÉELLE de la feuille, pas seulement
       les colonnes connues : une validation périmée survit à la
       colonne qui l'a posée. */
    var largeurReelle = feuille.getMaxColumns();
    var brutes = feuille.getRange(2, 1, 1, largeurReelle).getDataValidations()[0];
    var validations = [];
    for (var w = 0; w < largeurReelle; w++) {
      var dv = brutes[w];
      if (!dv) continue;
      var quoi = "";
      try { quoi = String(dv.getCriteriaType()); } catch (e) { quoi = "?"; }
      var vals = "";
      try { vals = String(dv.getCriteriaValues()[0] || ""); } catch (e) { vals = ""; }
      validations.push({
        col: w + 1,
        titre: String(titres[w] || ""),
        type: quoi,
        valeurs: vals.slice(0, 120)
      });
    }

    /* LES RÈGLES, PAS LEUR NOMBRE SEULEMENT. Deux règles identiques
       empilées et une seule règle rendent le même classeur à l'œil ;
       elles ne rendent pas le même classeur à la relance. */
    var regles = feuille.getConditionalFormatRules().map(function (r) {
      var d = r.getBooleanCondition();
      return {
        formule: d ? (d.getCriteriaValues()[0] || "") : "",
        fond: d && d.getBackgroundObject ? String(d.getBackgroundObject().asRgbColor().asHexString()) : "",
        plages: r.getRanges().map(function (p) { return p.getA1Notation(); })
      };
    });

    /* LES LIGNES D'ESSAI, ET ELLES SEULES. */
    var lignes = [];
    var derniere = feuille.getLastRow();
    if (derniere >= 2) {
      /* PAS DE `getBackgrounds()` ICI, ET C'EST VOLONTAIRE. La
         couleur des non-lues vient d'une mise en forme
         CONDITIONNELLE : elle se peint à l'affichage et ne se range
         nulle part. `getBackgrounds()` rendrait « #ffffff » sur une
         ligne parfaitement jaune à l'écran. La preuve de la couleur,
         c'est la RÈGLE — formule, teinte, plage — rendue plus haut. */
      var plage = feuille.getRange(2, 1, derniere - 1, nbCol);
      var valeurs = plage.getValues();
      var formules = plage.getFormulas();
      var nfs = plage.getNumberFormats();
      for (var r = 0; r < valeurs.length && lignes.length < 40; r++) {
        var texte = valeurs[r].join("|");
        var essai = MARQUEURS_ESSAI.some(function (m) { return texte.indexOf(m) !== -1; });
        if (!essai) continue;
        var cellules = [];
        for (var k = 0; k < nbCol; k++) {
          /* `formule` NON VIDE = Sheets a interprété la saisie comme
             un calcul. C'est le verdict de l'injection, et le seul
             qui vaille : la valeur affichée, elle, se lit pareil
             dans les deux cas quand la formule rend son propre
             texte. */
          cellules.push({
            titre: String(titres[k] || ""),
            valeur: String(valeurs[r][k]),
            formule: String(formules[r][k] || ""),
            format: String(nfs[r][k] || "")
          });
        }
        lignes.push({ ligne: r + 2, cellules: cellules });
      }
    }

    onglets.push({
      onglet: def.onglet,
      titres: titres.map(String),
      largeurs: largeurs,
      formatsLigne2: formats,
      figees: feuille.getFrozenRows(),
      lignesTotal: Math.max(0, derniere - 1),
      largeurReelle: largeurReelle,
      regles: regles,
      validations: validations,
      lignesEssai: lignes
    });
  });

  return {
    success: true,
    fuseau: cl.getSpreadsheetTimeZone(),
    calendriers: listeCalendriers(),
    disponibilites: {
      jours: DISPONIBILITES.JOURS_OUVRABLES,
      debut: DISPONIBILITES.HEURE_DEBUT,
      fin: DISPONIBILITES.HEURE_FIN,
      pauses: DISPONIBILITES.PAUSES,
      duree: DISPONIBILITES.DUREE_CRENEAU_MIN,
      tampon: DISPONIBILITES.TAMPON_MIN
    },
    quota: quotaRestant(),
    onglets: onglets
  };
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

    /* LE DÉBIT D'UNE SESSION.  D-758
       `valider` vient de garantir que `_sid` a la bonne forme, donc
       la clé de cache ne peut pas être fabriquée. Le message reste
       vrai et sans reproche : rien n'accuse le visiteur. */
    if (data._sid && tropVite("sid:" + data._sid,
        REGLAGES.DEBIT_SESSION_MAX, REGLAGES.DEBIT_SESSION_FENETRE_S)) {
      return json({ success: false,
        message: "Trop d’envois coup sur coup. Attendez un moment, vos réponses sont gardées." });
    }

    /* UN SEUL À LA FOIS. Deux soumissions simultanées liraient le
       même « dernier état » du classeur : l'une écraserait la
       ligne 2 de l'autre, et deux personnes pourraient réserver
       la même plage. Le verrou coûte quelques millisecondes et
       ferme les deux trous d'un coup. */
    var verrou = LockService.getScriptLock();
    if (!verrou.tryLock(25000)) {
      return json({ success: false, message: "Le service est occupé. Réessayez dans un instant." });
    }

    /* LE VERROU NE TIENT PLUS PENDANT LES COURRIELS.  D-738

       CE QU'IL PROTÈGE, ET RIEN D'AUTRE : le numéro de ligne, qui
       se lit puis s'écrit, et la plage du calendrier, qui se
       vérifie puis se réserve. Deux courses, deux sections
       critiques, toutes deux dans `traiter()`.

       CE QU'IL PROTÉGEAIT POUR RIEN : les deux `MailApp.sendEmail`,
       qui coûtent une à deux secondes chacun. Mesuré le 2026-08-06
       contre le vrai service : six envois simultanés, 18,4 s pour
       le dernier servi. Les courriels tenaient la file à eux seuls,
       alors que rien de ce qu'ils font ne peut entrer en course.

       ET IL RÉPARE UNE SECONDE CHOSE. Un envoi qui lève — quota
       atteint, adresse refusée — faisait échouer TOUTE la requête,
       alors que la ligne était déjà écrite. Le visiteur lisait
       « le service a rencontré une erreur » sur une demande bel et
       bien reçue, et la renvoyait. Maintenant l'échec d'un courriel
       est journalisé et ne touche plus à la réponse. */
    var suite;
    try {
      suite = traiter(kind, data);
    } finally {
      verrou.releaseLock();
    }

    if (suite.envois) {
      try {
        suite.envois();
      } catch (e) {
        console.error("envois (hors verrou) : " + (e && e.stack ? e.stack : e));
      }
    }
    return json(suite.reponse);
  } catch (err) {
    /* On garde la trace complète côté script, on ne rend au site
       qu'une phrase qui ne divulgue rien de l'infrastructure. */
    console.error("doPost : " + (err && err.stack ? err.stack : err));

    /* SAUF POUR UNE DEMANDE D'ESSAI, ET ÇA A COÛTÉ UNE JOURNÉE.
       D-755

       Le 2026-08-06, toutes les demandes sans session ont échoué en
       production sur « le service a rencontré une erreur ». Depuis
       ici, impossible de savoir laquelle des trente fonctions avait
       levé : le journal Apps Script ne se lit que dans l'éditeur, et
       personne n'y était. Trois passes à deviner.

       Une demande qui porte un marqueur d'essai — `ZZTEST`,
       `@exemple.ca` — reçoit donc la cause. Ce n'est pas une fuite :
       un vrai client ne porte jamais ces marqueurs, et les
       reproduire demande de le vouloir. Le message reste tronqué à
       300 signes, sans pile d'appels. */
    var brut = "";
    try { brut = JSON.stringify(lireCorps(e) || {}); } catch (e2) { brut = ""; }
    var essai = MARQUEURS_ESSAI.some(function (mq) { return brut.indexOf(mq) !== -1; });
    if (essai) {
      return json({
        success: false,
        message: "Le service a rencontré une erreur. Réessayez dans un moment.",
        cause: String(err && err.message ? err.message : err).slice(0, 300)
      });
    }
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

/* L'aiguillage.

   LE DÉDOUBLONNAGE PASSE EN PREMIER, ET C'EST UNE CORRECTION.
   D-730

   Il venait APRÈS les effets de bord — le rendez-vous était posé au
   calendrier, les pièces jointes téléversées sur Drive, PUIS on
   regardait si c'était un renvoi. Trois conséquences, toutes
   observées :

   1. LE VRAI SERVICE REND PARFOIS HTTP 404. Mesuré le 2026-08-06
      contre le déploiement réel : 2 échecs sur 36 appels, avec une
      page HTML au lieu du JSON. C'est le renvoi de `/exec` vers
      `googleusercontent.com` qui tombe, par intermittence. Le site
      RÉESSAIE donc maintenant (`js/main.js`) — et un réessai
      reposait le rendez-vous.

   2. UN RÉESSAI DE RÉSERVATION SE REFUSAIT LUI-MÊME. La première
      tentative créait l'événement ; la seconde voyait cet
      événement, concluait « cette plage vient d'être prise », et
      annonçait au visiteur l'échec de sa PROPRE réservation.

   3. UN RÉESSAI DE PROJET TÉLÉVERSAIT LES FICHIERS DEUX FOIS. La
      ligne était dédoublonnée, les fichiers restaient orphelins
      dans Drive.

   Maintenant : on cherche la signature d'abord. Si la demande est
   déjà là, on incrémente « Renvois » et on rend le MÊME résultat
   qu'à la première fois — lien Meet compris — sans rien recréer.
   Un réessai devient inoffensif, et c'est ce qui autorise le site
   à en faire un. */
function traiter(kind, data) {
  var extra = {};

  /* LA SIGNATURE SE CALCULE ICI, UNE SEULE FOIS, SUR LA DEMANDE
     TELLE QU'ELLE EST ARRIVÉE. Plus bas, une réservation voit sa
     `plage_demandee` réécrite par le serveur : la calculer après
     donnerait une signature différente de celle du premier envoi,
     et le renvoi ne se reconnaîtrait jamais. */
  var sig = signature(kind, data);
  var enSession = !!(data && data._sid);

  /* UNE SESSION EN COURS SE MET À JOUR, ELLE NE SE DÉDOUBLONNE PAS.
     D-744

     Les deux mécanismes se ressemblent — retrouver une ligne par sa
     signature — et font l'inverse l'un de l'autre. Le
     dédoublonnage REFUSE de réécrire : c'est un réessai réseau, la
     demande est déjà traitée. La session, elle, DOIT réécrire :
     c'est le même visiteur, une étape plus loin.

     Le tri se fait sur la présence de `_sid`, pas sur le contenu. */
  var cible = null;
  if (enSession) {
    cible = repererLigne(kind, sig);
    /* UNE RÉSERVATION DE FIN DE PARCOURS DOIT ENCORE POSER SON
       RENDEZ-VOUS. La ligne existe déjà, l'événement non : on laisse
       la demande traverser vers le bloc `booking` plus bas, et c'est
       `cible` qui garantira qu'on FUSIONNE au lieu d'insérer une
       seconde ligne. Sans ce garde-fou, une réservation créait deux
       lignes pour un seul visiteur — précisément ce que tout ce
       mécanisme existe pour empêcher. */
    var traverse = kind === "booking" && data._final && cible && !dejaReserve(cible);
    if (cible && !traverse) {
      var fus = fusionnerLigne(kind, cible, data, {});
      var envoisF = null;
      if (data._final) {
        var dF = data, kF = kind, ligneF = fus;
        envoisF = function () {
          var reste = quotaRestant();
          avertirAgence(kF, dF, {}, ligneF, false);
          confirmerAuVisiteur(kF, dF, {});
          if (reste < 1) noterQuotaEpuise(kF, ligneF.ligne);
        };
      }
      return { envois: envoisF, reponse: {
        success: true,
        ligne: fus.ligne,
        session: true,
        etape: libelleEtape(data),
        champs: fus.touchees
      } };
    }
  } else {
    /* LE RENVOI SE RECONNAÎT AVANT TOUT EFFET DE BORD. */
    var jumelle = chercherJumelle(kind, sig);
    if (jumelle) {
      return { envois: null, reponse: {
        success: true,
        ligne: jumelle.ligne,
        renvoi: true,
        renvois: jumelle.renvois,
        meet: jumelle.meet || ""
      } };
    }
  }

  /* ON NE POSE UN RENDEZ-VOUS QU'À LA CONFIRMATION.  D-744

     À l'étape 1 d'une réservation, le visiteur n'a pas encore
     choisi sa plage : `poserRendezVous` recevait `plage_iso`
     indéfini, échouait, et la demande entière était refusée — donc
     aucune ligne, donc aucun abandon capté sur le seul formulaire
     où l'abandon coûte le plus cher.

     Et il ne FAUT pas bloquer la plage plus tôt : quelqu'un qui
     hésite trois minutes tiendrait un créneau en otage. */
  if (kind === "booking" && (!enSession || data._final)) {
    var rdv = poserRendezVous(data);
    if (!rdv.ok) return { envois: null, reponse: { success: false, message: rdv.message } };
    /* La plage vient d'être prise : la liste en cache la donne encore
       comme libre, et le prochain visiteur remplirait tout pour rien. */
    oublierCreneaux();
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

  /* LES DEUX PLAFONDS DE NAISSANCE, ET ILS SONT ICI EXPRÈS.  D-758

     Plus haut, une session retrouvée est déjà repartie avec sa
     fusion ; un renvoi est déjà reparti avec sa jumelle. Tout ce
     qui arrive à cette ligne va donc créer une LIGNE NEUVE, et
     c'est le seul endroit où compter ne punit pas un visiteur qui
     avance dans son formulaire. */
  var muet = false;
  if (!cible) {
    if (tropVite("lignes", REGLAGES.DEBIT_LIGNES_MAX, REGLAGES.DEBIT_LIGNES_FENETRE_S)) {
      console.error("plafond DUR de lignes atteint — demande « " + kind + " » refusée");
      return { envois: null, reponse: { success: false,
        message: "Le service reçoit beaucoup de demandes à l’instant. Réessayez dans quelques minutes, ou appelez-nous au 819 523-0871." } };
    }
    muet = tropVite("avis", REGLAGES.DEBIT_AVIS_MAX, REGLAGES.DEBIT_AVIS_FENETRE_S);
    if (muet) console.error("plafond d'avis atteint — la ligne s'écrit, aucun courriel ne part");
  }

  if (kind === "project") {
    extra._pieces = rangerPieces(data);
  }

  /* FUSION SI LA LIGNE EXISTE DÉJÀ, INSERTION SINON. Le seul chemin
     qui arrive ici avec une `cible` est la réservation confirmée en
     fin de session : sa ligne a été créée à l'étape 1, et c'est
     maintenant qu'elle reçoit son lien Meet. */
  var ecrit = cible
    ? fusionnerLigne(kind, cible, data, extra)
    : ecrireLigne(kind, data, extra, sig);

  /* LA RÈGLE DES COURRIELS, ET ELLE TIENT EN TROIS LIGNES.  D-744

     Le compte Gmail plafonne à CENT destinataires par jour, toutes
     boîtes confondues. Un formulaire en six étapes qui préviendrait
     à chaque étape brûlerait la réserve en huit visiteurs.

       · un avis interne quand la ligne NAÎT — « quelqu'un a
         commencé », c'est ce qui permet de rappeler un abandon ;
       · un avis interne + la confirmation au visiteur à la FIN ;
       · rien du tout entre les deux.

     La confirmation au visiteur ne part JAMAIS avant la fin : lui
     écrire « c'est reçu » alors qu'il est au tiers du formulaire
     serait faux, et le ferait s'arrêter là. */
  var envois = null;
  if (muet) {
    /* La ligne est écrite, la note dit pourquoi personne n'a été
       prévenu, et `envois` reste nul : rien ne part.  D-758 */
    noterAvisMuet(kind, ecrit.ligne);
  } else if (!ecrit.doublon) {
    var donnees = data;
    var partiel = enSession && !data._final;
    envois = function () {
      /* LE QUOTA SE LIT AVANT D'ESSAYER, PAS APRÈS.  D-733
         `envoyer()` refuse en silence quand la réserve est vide ; sans
         ce relevé, la demande arriverait au classeur sans que rien
         n'indique que personne n'a été prévenu. */
      var avantEnvois = quotaRestant();
      avertirAgence(kind, donnees, extra, ecrit, partiel);
      if (!partiel) confirmerAuVisiteur(kind, donnees, extra);
      if (avantEnvois < 1) noterQuotaEpuise(kind, ecrit.ligne);
    };
  }

  return { envois: envois, reponse: {
    success: true,
    ligne: ecrit.ligne,
    renvoi: ecrit.doublon || false,
    session: enSession,
    etape: libelleEtape(data),
    meet: extra._meet || ""
  } };
}

/* Cette ligne de réservation porte-t-elle déjà son événement ?
   Sert à laisser une session `booking` traverser vers la pose du
   rendez-vous une seule fois, à la confirmation finale. */
function dejaReserve(cible) {
  if (cible.iMeet <= 0) return false;
  var iEv = cible.titres.indexOf("Événement") + 1;
  if (iEv <= 0) return false;
  return String(cible.feuille.getRange(cible.ligne, iEv).getValue() || "") !== "";
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
  votre_nom: 120, votre_email: 254, votre_telephone: 40, votre_entreprise: 160,
  entreprise_referee: 160, contact_reference: 200, domaine: 160,
  site_actuel: 500, besoins: 500, plage_demandee: 200,
  blocage: 2000, connu_par: 160, prix_raison: 2000, fourchette_vue: 120,
  prix_reaction: 40, systeme: 500, depuis_quand: 160, gravite: 80,
  ampleur: 120, fonctions: 160, contenu: 120, niveau_design: 160,
  envergure: 120, objectif: 160, moment_contact: 60, taille: 60, besoin: 120,
  impact: 2000, presentation: 1000, budget: 120
};

function valider(kind, data) {
  var def = SCHEMA[kind];

  /* 1 · Les champs requis sont présents et non vides.

     UNE ÉTAPE INTERMÉDIAIRE N'A PAS À TOUT AVOIR.  D-744
     C'est le point d'équilibre de toute la sauvegarde progressive :
     exiger le jeu complet à l'étape 2 ferait refuser l'écriture,
     donc perdre exactement l'abandon qu'on cherche à capter. Mais
     n'exiger RIEN ouvrirait la porte à des lignes vides fabriquées
     en boucle par un robot.

     On exige donc le MINIMUM VITAL en cours de route
     (`requisPartiel`), et le jeu complet à la confirmation. */
  var enCours = !!(data && data._sid && !data._final);
  var exiges = enCours ? (def.requisPartiel || def.requis) : def.requis;
  for (var i = 0; i < exiges.length; i++) {
    var champ = exiges[i];
    if (String(data[champ] == null ? "" : data[champ]).trim() === "") {
      return enCours
        ? "Il manque ce qui permettrait de vous rappeler."
        : "Il manque une réponse obligatoire.";
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

  /* 5 · Une réservation doit porter une plage lisible par machine.
     Sauf en cours de route : à l'étape 1 le visiteur n'a pas encore
     choisi son mode. */
  if (kind === "booking" && !enCours) {
    if (!data.plage_iso || isNaN(new Date(data.plage_iso).getTime())) {
      return "La plage choisie n’a pas été transmise. Choisissez-la de nouveau.";
    }
    if (data.mode !== MODES.TEL && data.mode !== MODES.MEET) {
      return "Choisissez le mode de l’appel.";
    }
  }

  /* 6 · L'identifiant de session est fabriqué par le navigateur, donc
     il n'est pas de confiance. On ne s'en sert que comme clé de
     recherche, mais une clé de 40 000 signes ferait grossir la
     colonne masquée sans rien apporter. */
  if (data && data._sid) {
    var sid = String(data._sid);
    if (!/^[A-Za-z0-9_-]{8,40}$/.test(sid)) {
      return "La session n’est pas reconnue. Rechargez la page.";
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
  /* UNE SESSION A SA PROPRE IDENTITÉ, ET ELLE PRIME.  D-744

     Avec la sauvegarde progressive, la même personne envoie la même
     demande plusieurs fois de suite, un peu plus remplie à chaque
     fois. Une signature calculée sur le CONTENU changerait à chaque
     étape : on écrirait six lignes pour un seul visiteur, ce qui
     est exactement ce qu'il ne faut pas faire.

     `_sid` est fabriqué par le navigateur à la première étape
     validée et ne bouge plus. Il devient l'identité de la ligne.
     Le préfixe « S: » empêche toute collision avec un condensé. */
  if (data && data._sid) return "S:" + String(data._sid).slice(0, 40);

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

/* CHERCHER UNE DEMANDE IDENTIQUE DÉJÀ REÇUE.  D-730

   Rend la ligne trouvée et incrémente son compteur de renvois, ou
   `null`. Appelée par `traiter()` AVANT tout effet de bord : c'est
   ce qui rend un réessai inoffensif.

   ON NE RELIT QUE LES LIGNES RÉCENTES — le classeur peut grossir
   sans que `doPost` ralentisse. Et on ne fusionne QUE dans la
   fenêtre : deux demandes identiques à trois jours d'écart sont
   deux demandes.

   LA COLONNE « Lien Meet » EST RELUE, ELLE AUSSI. Un réessai de
   réservation doit rendre au visiteur le lien de SA réservation,
   pas une chaîne vide : il en a besoin pour se connecter. */
function chercherJumelle(kind, sig) {
  var t = repererLigne(kind, sig);
  if (!t) return null;

  var cellule = t.feuille.getRange(t.ligne, t.iRenvois);
  var n = Number(cellule.getValue()) || 0;
  cellule.setValue(n + 1);
  return {
    ligne: t.ligne,
    renvois: n + 1,
    meet: t.iMeet > 0 ? String(t.feuille.getRange(t.ligne, t.iMeet).getValue() || "") : ""
  };
}

/* OÙ EST LA LIGNE QUI PORTE CETTE SIGNATURE, si elle existe.

   LA FENÊTRE DE TEMPS NE S'APPLIQUE QU'AUX CONDENSÉS.  D-744
   Deux demandes identiques à trois jours d'écart sont deux
   demandes : la fenêtre est là pour ça. Mais une SESSION peut
   dormir — quelqu'un remplit deux étapes le mardi, ferme son
   portable, revient le jeudi. Sa ligne doit se retrouver, sinon on
   en crée une seconde et on a perdu le seul but de l'exercice. */
function repererLigne(kind, sig) {
  var def = SCHEMA[kind];
  var feuille = classeur().getSheetByName(def.onglet);
  if (!feuille) return null;

  var dernier = feuille.getLastRow();
  if (dernier < 2) return null;

  var cols = colonnes(kind);
  var titres = cols.map(function (c) { return c.titre; });
  var iSig = titres.indexOf(COL_SIGNATURE) + 1;
  var iDate = titres.indexOf("Horodatage") + 1;

  var session = String(sig).indexOf("S:") === 0;
  var combien = Math.min(REGLAGES.LIGNES_RELUES, dernier - 1);
  var sigs = feuille.getRange(2, iSig, combien, 1).getValues();
  var dates = iDate > 0 ? feuille.getRange(2, iDate, combien, 1).getValues() : null;
  var limite = REGLAGES.FENETRE_DOUBLON_MIN * 60 * 1000;
  var maintenant = Date.now();

  for (var r = 0; r < sigs.length; r++) {
    if (String(sigs[r][0]) !== sig) continue;
    if (!session) {
      var quand = dates ? dates[r][0] : null;
      if (!(quand instanceof Date)) continue;
      if (maintenant - quand.getTime() > limite) continue;
    }
    return {
      feuille: feuille,
      ligne: r + 2,
      titres: titres,
      cols: cols,
      iRenvois: titres.indexOf("Renvois") + 1,
      iMeet: titres.indexOf("Lien Meet") + 1,
      iEtape: titres.indexOf("Étape") + 1
    };
  }
  return null;
}

/* METTRE À JOUR LA LIGNE D'UNE SESSION EN COURS.  D-744

   Ce qui arrive à l'étape 4 ne contient pas ce qui a été répondu à
   l'étape 1 : le navigateur n'envoie que ce que le visiteur vient
   de remplir, plus ce qu'il a déjà. La règle est donc :

     UNE VALEUR NON VIDE ÉCRASE. UNE VALEUR VIDE NE TOUCHE À RIEN.

   Sans ça, revenir en arrière et renvoyer effacerait des réponses
   déjà données, et le classeur se viderait à mesure que le visiteur
   avance. C'est le défaut le plus probable de tout ce mécanisme,
   et il ne se verrait qu'en relisant une ligne d'il y a deux jours. */
function fusionnerLigne(kind, cible, data, extra) {
  var feuille = cible.feuille;
  var ligne = cible.ligne;
  var cols = cible.cols;

  var avant = feuille.getRange(ligne, 1, 1, cols.length).getValues()[0];
  var apres = avant.slice();
  var touchees = 0;

  cols.forEach(function (c, i) {
    var nom = c.champ;
    if (!nom) return;
    var v = null;
    if (extra && Object.prototype.hasOwnProperty.call(extra, nom)) v = extra[nom];
    else if (Object.prototype.hasOwnProperty.call(data, nom)) v = data[nom];
    if (v == null) return;
    v = String(v);
    if (v.trim() === "") return;
    /* LA COMPARAISON SE FAIT SUR LE TEXTE NU, L'ÉCRITURE SUR LE
       TEXTE INERTE.  D-757

       `getValues()` rend « =1+1 » sans l'apostrophe : comparer la
       forme préfixée à ce qui est relu ferait croire à un changement
       à chaque envoi, et `champs` compterait une modification qui
       n'a pas eu lieu. */
    if (String(apres[i]) === v) return;
    apres[i] = texteInerte(v);
    touchees++;
  });

  /* L'étape avance, elle ne recule pas : un visiteur qui revient en
     arrière pour corriger l'étape 2 n'a pas « désappris » l'étape 4. */
  if (cible.iEtape > 0) {
    var libelle = libelleEtape(data);
    var actuel = String(apres[cible.iEtape - 1] || "");
    /* `!==` AVANT `>=` : renvoyer deux fois la MÊME étape — un
       réessai réseau — ne doit compter pour aucun changement,
       sinon `champs` rend 1 sur une opération qui n'a rien fait et
       le site croit avoir avancé. */
    if (libelle && libelle !== actuel && rangEtape(libelle) >= rangEtape(actuel)) {
      apres[cible.iEtape - 1] = libelle;
      touchees++;
    }
  }

  if (touchees) {
    /* Le format AVANT les valeurs, ici comme à l'écriture. D-731 */
    formaterTexte(feuille, ligne, kind);
    poserLigne(feuille, ligne, apres, cible.titres);
  }
  return {
    ligne: ligne,
    doublon: false,
    fusion: true,
    touchees: touchees,
    url: lienVersLigne(feuille, ligne)
  };
}

/* « 3 / 6 », ou « ✓ complète ». Une seule façon de l'écrire. */
function libelleEtape(data) {
  if (data && data._final) return "✓ complète";
  var e = Number(data && data._etape);
  var t = Number(data && data._etapes);
  if (!e) return "";
  return t ? (e + " / " + t) : String(e);
}

/* Pour comparer deux libellés d'étape sans les analyser deux fois.
   « ✓ complète » bat tout le reste. */
function rangEtape(libelle) {
  if (!libelle) return -1;
  if (String(libelle).indexOf("✓") === 0) return 9999;
  var m = /^(\d+)/.exec(String(libelle));
  return m ? Number(m[1]) : 0;
}

/* UNE VALEUR DU VISITEUR N'EST JAMAIS UNE FORMULE.  D-731

   `setValues` avec la chaîne « =IMPORTXML("http://…","//a") » ne
   range pas du texte : Sheets en fait une FORMULE, et elle
   s'exécute à l'ouverture du classeur, sous le compte de l'agence.
   `=HYPERLINK`, `=IMAGE`, `=IMPORTDATA` en font autant. C'est la
   voie classique de l'injection par formule, et elle n'a besoin
   d'aucune faille : il suffit d'un champ de texte.

   Le service a accepté les cinq essais du 2026-08-06 sans broncher
   — c'est normal, il n'a rien à refuser. Le refus n'est pas la
   réponse : une entreprise peut légitimement s'appeler « +Design »
   et un message commencer par un tiret.

   CE QUI SUIT ÉTAIT FAUX, ET L'A ÉTÉ PENDANT DES MOIS. D-731
   affirmait qu'une cellule au format `@` range la chaîne telle
   quelle et que « rien ne s'évalue ». **Mesuré le 2026-08-06 dans le
   vrai classeur : format `@` posé avant, et `=1+1` calculé quand
   même.** Le format gouverne la SAISIE HUMAINE ; `setValues` crée
   une formule dès le `=`, quoi que porte la cellule.

   C'est `texteInerte()` qui protège (D-757), pas cette fonction.

   ON GARDE QUAND MÊME LE FORMAT TEXTE, pour une autre raison : un
   code postal, un numéro à zéro de tête ou « 06 » s'afficheraient en
   nombre. Les colonnes de service — horodatage, renvois, suivi —
   gardent le leur : elles ne viennent pas du visiteur. */
function formaterTexte(feuille, ligne, kind) {
  /* LA POSITION SE DÉDUIT, ELLE NE SE SUPPOSE PAS. Cette fonction
     écrivait « la première colonne du visiteur est la 2 » ; le jour
     où « Statut » est passé en colonne B (D-738), elle a formaté
     une colonne de service et laissé le premier champ du visiteur
     sans protection. On demande donc à `colonnes()`, la seule qui
     sache. */
  var cols = colonnes(kind);
  var indices = [];
  cols.forEach(function (c, i) { if (c.champ) indices.push(i + 1); });
  if (!indices.length) return;
  var premiere = Math.min.apply(null, indices);
  var derniere = Math.max.apply(null, indices);
  feuille.getRange(ligne, premiere, 1, derniere - premiere + 1).setNumberFormat("@");
}

/* LE FORMAT TEXTE NE PROTÈGE DE RIEN — MESURÉ, PAS SUPPOSÉ.  D-757

   D-731 posait `setNumberFormat("@")` sur les colonnes du visiteur
   AVANT `setValues`, et tenait l'injection pour réglée. Elle ne
   l'était pas. Relevé le 2026-08-06 dans le vrai classeur, par
   `?action=diag` :

     « Description »        valeur "2"     formule "=1+1"        format @
     « Ce qui les bloque »  valeur "#N/A"  formule "=IMPORTXML…"  format @

   Le format était bien `@`, et Sheets a calculé quand même. Le
   format gouverne ce qu'une SAISIE HUMAINE devient ; `setValues`,
   lui, crée une formule dès que la chaîne commence par `=`, quoi
   que porte la cellule. Le banc modélisait la croyance, pas Sheets :
   il rendait « aucune formule » depuis des mois.

   CE QUE ÇA VALAIT COMME FAILLE. `=IMPORTXML("https://…"&B2,"//a")`
   part sous le compte de l'agence à chaque ouverture du classeur :
   c'est une sortie de données, pas un affichage cassé. Aucune faille
   à exploiter — un champ de texte suffit.

   LE CORRECTIF EST L'APOSTROPHE, celle de Sheets. Une chaîne
   préfixée d'une apostrophe est rangée comme TEXTE ; l'apostrophe ne
   s'affiche pas et `getValues()` rend la chaîne d'origine. Rien
   n'est perdu, rien ne s'évalue.

   ON NE REFUSE TOUJOURS RIEN : une entreprise peut s'appeler
   « +Design », un budget s'écrire « -de 5 k ». On range du texte
   comme du texte ; on ne rejette pas le client. */
function texteInerte(v) {
  if (v == null) return "";
  /* Une date reste une date : elle ne vient pas du visiteur, et la
     changer en chaîne casserait le format de sa colonne. */
  if (v instanceof Date) return v;
  var s = String(v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

/* UNE ÉCRITURE REFUSÉE NE DOIT PAS PASSER POUR UNE ÉCRITURE FAITE.
   D-756

   `setValues` sur une ligne entière n'est pas tout ou rien : quand
   une cellule refuse la valeur — une validation périmée, D-756 —
   Sheets a DÉJÀ écrit les colonnes qui la précèdent, puis lève. La
   ligne reste écrite à moitié, et rien ne le dit.

   On ne peut pas rendre l'opération atomique. On peut refuser de la
   laisser silencieuse : on nomme les colonnes qui portent une
   validation, dans le journal ET dans le message d'erreur, que
   D-755 fait remonter jusqu'à la sonde. */
function poserLigne(feuille, ligne, valeurs, titres) {
  try {
    feuille.getRange(ligne, 1, 1, valeurs.length).setValues([valeurs]);
  } catch (err) {
    var dvs = feuille.getRange(ligne, 1, 1, valeurs.length).getDataValidations()[0];
    var coupables = [];
    for (var i = 0; i < dvs.length; i++) {
      if (dvs[i]) coupables.push(colonneLettre(i + 1) + " « " + (titres[i] || "?") + " »");
    }
    var ou = coupables.length ? coupables.join(", ") : "aucune colonne ne porte de validation";
    console.error("ÉCRITURE REFUSÉE — ligne " + ligne + " de « " + feuille.getName()
      + " » : " + err
      + "\n    Colonnes sous validation : " + ou
      + "\n    La ligne est écrite À MOITIÉ. Relancez initialiser() : D-756 purge les périmées.");
    throw new Error("Le classeur a refusé la ligne — validation sur " + ou + ".");
  }
}

/* Écrit la demande EN LIGNE 2 : la plus récente est toujours en
   haut, sans avoir à trier. Le dédoublonnage a déjà eu lieu dans
   `traiter()` — arriver ici veut dire que c'est une demande neuve. */
function ecrireLigne(kind, data, extra, sig) {
  var def = SCHEMA[kind];
  var feuille = classeur().getSheetByName(def.onglet);
  if (!feuille) feuille = preparerOnglet(classeur(), kind);

  var cols = colonnes(kind);
  var maintenant = new Date();
  if (!sig) sig = signature(kind, data);

  var titres = cols.map(function (c) { return c.titre; });
  var valeurs = cols.map(function (c) {
    if (c.titre === "Horodatage") return maintenant;
    if (c.titre === COL_SIGNATURE) return sig;
    if (c.titre === "Renvois") return 0;
    if (c.titre === "Statut") return STATUTS[0];
    if (c.titre === "Étape") return libelleEtape(data);
    /* Une case à cocher se range comme un booléen, pas comme une
       chaîne vide : `""` la rendrait invalide. */
    if (c.case) return false;
    if (c.titre === "Lu par" || c.titre === "Rappelé par") return "";
    var nom = c.champ;
    if (!nom) return "";
    /* Inerte AVANT d'entrer dans la cellule : une fois la formule
       créée, aucun format ne la défait.  D-757 */
    if (extra && Object.prototype.hasOwnProperty.call(extra, nom)) return texteInerte(extra[nom]);
    return texteInerte(data[nom]);
  });

  feuille.insertRowBefore(2);
  /* LE FORMAT AVANT LES VALEURS. Poser `@` après l'écriture ne
     défait pas une formule déjà créée : elle est déjà là, et le
     changement de format ne fait que l'afficher autrement. */
  formaterTexte(feuille, 2, kind);
  poserLigne(feuille, 2, valeurs, titres);

  var iDate = titres.indexOf("Horodatage");
  if (iDate >= 0) feuille.getRange(2, iDate + 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");

  /* `insertRowBefore` hérite du format de la ligne 1 — l'en-tête
     noir sur blanc. On le défait, sinon chaque demande arrive
     déguisée en titre. */
  feuille.getRange(2, 1, 1, valeurs.length)
    .setFontWeight("normal")
    .setBackground(null)
    .setFontColor(null)
    .setVerticalAlignment("top");

  /* La case à cocher se pose APRÈS les valeurs : `setValues` sur une
     cellule qui en porte une la laisserait sans validation. */
  var iVu = titres.indexOf("Vu");
  if (iVu >= 0) feuille.getRange(2, iVu + 1).insertCheckboxes();

  return { ligne: 2, doublon: false, url: lienVersLigne(feuille, 2) };
}

function lienVersLigne(feuille, ligne) {
  return classeur().getUrl() + "#gid=" + feuille.getSheetId()
    + "&range=A" + (ligne || 2);
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
    /* LE NOMBRE AVANT LE POIDS.  D-758
       Quatre cents fichiers d'un kilo tenaient sous les huit
       mégaoctets et faisaient quatre cents créations Drive dans une
       seule requête : le script mourait sur le temps d'exécution et
       la ligne n'était jamais écrite. */
    if (pieces.length > REGLAGES.PIECES_MAX_NOMBRE) {
      return pieces.length + " fichier(s) — plus que les "
        + REGLAGES.PIECES_MAX_NOMBRE + " acceptés, à redemander au visiteur";
    }

    var total = 0;
    pieces.forEach(function (p) { total += (p.base64 || "").length; });
    if (total > REGLAGES.PIECES_MAX_OCTETS) {
      return pieces.length + " fichier(s) trop volumineux — à redemander au visiteur";
    }

    var dossier = dossierPieces();
    var liens = [];
    var refuses = [];
    pieces.forEach(function (p) {
      if (!p || !p.base64) return;
      /* LE TYPE SE JUGE SUR LE NOM, PAS SUR CE QUE LE NAVIGATEUR
         ANNONCE. `p.type` est fourni par l'appelant : une requête
         forgée écrit « image/png » sur ce qu'elle veut. L'extension
         du nom est fournie par l'appelant elle aussi, mais c'est
         elle qui décidera de ce que Windows fait du fichier quand
         un associé le téléchargera — c'est donc celle-là qu'il faut
         juger. */
      var nom = nomDePiece(p.nom);
      var ext = (nom.split(".").pop() || "").toLowerCase();
      if (nom.indexOf(".") === -1 || REGLAGES.PIECES_EXTENSIONS.indexOf(ext) === -1) {
        refuses.push(nom);
        return;
      }
      var blob = Utilities.newBlob(
        Utilities.base64Decode(p.base64),
        p.type || "application/octet-stream",
        nom);
      var f = dossier.createFile(blob);
      liens.push(f.getName() + " : " + f.getUrl());
    });
    if (refuses.length) {
      liens.push("REFUSÉ, type non accepté — à redemander au visiteur : " + refuses.join(", "));
      console.warn("pièces refusées : " + refuses.join(", "));
    }
    return liens.join("\n");
  } catch (e) {
    console.error("pièces jointes : " + e);
    return pieces.length + " fichier(s) non enregistrés — à redemander au visiteur";
  }
}

/* UN NOM DE FICHIER QUI NE PEUT PLUS RIEN FAIRE D'AUTRE.  D-758

   Drive n'a pas d'arborescence de chemins, donc pas de « ../ » à
   craindre — mais le nom se retrouve dans un courriel et dans une
   colonne du classeur. Un retour à la ligne y casse la mise en
   page, et un nom de 900 signes rend la cellule illisible. */
function nomDePiece(brut) {
  var nom = String(brut == null ? "" : brut)
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[\/\\]/g, "-")
    .trim();
  if (nom.length > 120) {
    var pt = nom.lastIndexOf(".");
    var ext = pt > 0 ? nom.slice(pt) : "";
    nom = nom.slice(0, 120 - ext.length) + ext;
  }
  return nom || "piece-jointe";
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
  var out = [];
  listeCalendriers().forEach(function (calId) {
    occupationsDe(calId, depuis, jusqua).forEach(function (i) { out.push(i); });
  });
  return out;
}

/* LES AGENDAS À LIRE, dans l'ordre : le principal, puis ceux de
   `CALENDRIERS_EN_PLUS`. Les doublons sautent — lister deux fois le
   même agenda doublerait chaque événement sans rien changer au
   résultat, mais ferait deux appels réseau pour rien. */
function listeCalendriers() {
  var out = [DISPONIBILITES.CALENDRIER_ID || "primary"];
  (DISPONIBILITES.CALENDRIERS_EN_PLUS || []).forEach(function (id) {
    var v = String(id || "").trim();
    if (v && out.indexOf(v) === -1) out.push(v);
  });
  return out;
}

/* UN agenda, entre deux instants.

   IL LÈVE PLUTÔT QUE DE RENDRE UNE LISTE VIDE. Un agenda qu'on ne
   sait pas lire — mal orthographié, jamais partagé, partagé en
   « libre/occupé seulement » — rendrait zéro occupation, donc une
   journée entièrement libre. C'est le pire des mensonges possibles
   ici : il ouvre à la réservation des heures déjà prises. On laisse
   donc l'erreur remonter ; `creneauxLibres()` retombe alors sur le
   filet et `poserRendezVous()` refuse. */
function occupationsDe(calId, depuis, jusqua) {
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

  var cal = (calId && calId !== "primary")
    ? CalendarApp.getCalendarById(calId)
    : CalendarApp.getDefaultCalendar();
  /* `getCalendarById` rend `null` sur un agenda inconnu ; l'appeler
     lèverait « cannot read getEvents of null », un message qui
     n'apprend rien. On dit lequel. */
  if (!cal) throw new Error("Agenda illisible : « " + calId + " ». Vérifiez l'identifiant et le partage.");
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
  var tel = String(data.telephone || "").trim();
  var entreprise = String(data.entreprise || "").trim();

  /* LE TITRE DIT CE QU'ON DOIT FAIRE, PAS CE QUI S'EST PASSÉ.
     D-745

     On lit un titre d'agenda dans une liste, en diagonale, souvent
     depuis un téléphone où il est coupé à trente signes. « Appel
     APED (téléphone) · Marie Tremblay » commence par quatre mots
     qui ne servent à rien : tous les événements de cet agenda sont
     des appels APED. Ce qui manque, c'est QUI et QUOI FAIRE.

     Version téléphone :  « ☎ Appeler Marie Tremblay — Garage X »
     Version Meet :       « ▸ Meet · Marie Tremblay — Garage X »

     Le verbe d'abord : c'est la seule différence qui change le
     geste, et elle doit survivre à la troncature. */
  var qui = nom + (entreprise ? " — " + entreprise : "");
  var titre = (meet ? PREFIXE_MEET : PREFIXE_TEL) + qui;

  /* LE NUMÉRO VA DANS `location`, ET C'EST TOUT L'INTÉRÊT.
     Google Agenda rend ce champ CLIQUABLE sur téléphone : une
     tape et l'appel part. Enfoui dans la description, il faut le
     sélectionner à la main. */
  var lieu = meet ? "" : tel;

  var lignes = [];
  if (!meet) {
    lignes.push("À COMPOSER : " + (tel || "— aucun numéro —"));
    lignes.push("C’est NOUS qui appelons.");
    lignes.push("");
  }
  lignes.push("Nom : " + (nom || "—"));
  lignes.push("Entreprise : " + (entreprise || "—"));
  lignes.push("Courriel : " + (data.email || "—"));
  if (meet) lignes.push("Téléphone : " + (tel || "—"));
  lignes.push("");
  lignes.push("Ce dont la personne veut parler :");
  lignes.push(String(data.sujet || "").trim() || "— rien de précisé —");
  lignes.push("");
  lignes.push("Demande reçue par le site APED · 30 minutes.");
  var description = lignes.join("\n");

  /* LE SERVICE AVANCÉ SERT AUX DEUX MODES, PLUS SEULEMENT AU MEET.
     D-745

     La condition était `if (meet && …)` : une réservation
     téléphonique tombait toujours sur `CalendarApp`, qui ne sait
     poser ni `location`, ni invité proprement, ni statut de
     visibilité. L'événement existait et il était nu. Les deux modes
     passent maintenant par le même chemin ; seule la conférence
     Meet est conditionnelle. */
  if (typeof Calendar !== "undefined" && Calendar.Events) {
    try {
      var evenement = {
        summary: titre,
        description: description,
        start: { dateTime: debut.toISOString(), timeZone: REGLAGES.FUSEAU },
        end:   { dateTime: fin.toISOString(),   timeZone: REGLAGES.FUSEAU },
        attendees: [{ email: String(data.email).trim(), displayName: nom }],
        guestsCanModify: false,
        guestsCanInviteOthers: false
      };
      if (lieu) evenement.location = lieu;
      if (meet) {
        evenement.conferenceData = {
          createRequest: {
            /* Doit être unique par requête, sinon Google renvoie la
               conférence déjà créée pour cet identifiant. */
            requestId: Utilities.getUuid(),
            conferenceSolutionKey: { type: "hangoutsMeet" }
          }
        };
      }
      var cree = Calendar.Events.insert(evenement, DISPONIBILITES.CALENDRIER_ID || "primary", {
        conferenceDataVersion: meet ? 1 : 0,
        /* C'est Google qui envoie l'invitation au visiteur — elle
           ne compte pas dans le quota d'envoi du script. Un appel
           téléphonique en profite autant qu'un Meet : la personne
           reçoit un rappel, donc elle décroche. */
        sendUpdates: "all"
      });

      return {
        ok: true,
        debut: debut,
        meet: meet ? (cree.hangoutLink || lienMeet(cree)) : "",
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
  var options = { description: description };
  if (lieu) options.location = lieu;
  var ev = cal.createEvent(titre, debut, fin, options);
  try { ev.addGuest(String(data.email).trim()); } catch (e) { console.error(e); }
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

/* `repondreA` pose l'en-tête `Reply-To`.  D-732

   L'avis interne partait de la boîte de l'agence VERS la boîte de
   l'agence : « Répondre » répondait donc à soi-même. Pour écrire au
   client il fallait retourner au classeur, copier son adresse, et
   ouvrir un nouveau message — trois gestes, vingt fois par semaine.

   Avec `Reply-To` sur l'adresse du visiteur, « Répondre » depuis
   l'avis écrit AU CLIENT, directement, depuis le téléphone, sans
   ouvrir le classeur. C'est la seule ligne de ce fichier qui fasse
   gagner du temps tous les jours. */
function envoyer(dest, sujet, corps, repondreA) {
  if (!dest) return false;
  if (quotaRestant() < 1) {
    console.warn("Quota d'envoi épuisé : « " + sujet + " » non envoyé à " + dest);
    return false;
  }
  try {
    var options = { to: dest, subject: sujet, body: corps, name: "APED Agence" };
    if (repondreA && RE_COURRIEL.test(String(repondreA).trim())) {
      options.replyTo = String(repondreA).trim();
    }
    MailApp.sendEmail(options);
    return true;
  } catch (e) {
    console.error("envoi à " + dest + " : " + e);
    return false;
  }
}

function avertirAgence(kind, data, extra, ecrit, partiel) {
  var def = SCHEMA[kind];
  var lignes = [];

  lignes.push(partiel ? ("COMMENCÉ — " + def.sujet.toUpperCase()) : def.sujet.toUpperCase());
  lignes.push(quand(new Date()));
  lignes.push("");

  /* UN DÉBUT DE FORMULAIRE N'EST PAS UNE DEMANDE, et l'avis doit le
     dire dès la deuxième ligne.  D-744

     Sans ça, un avis « Nouveau projet » qui ne contient qu'un nom et
     un courriel se lit comme un formulaire cassé, pas comme un
     visiteur en train de remplir. La différence change ce qu'on en
     fait : un abandon se rappelle, un bogue se corrige. */
  if (partiel) {
    lignes.push("Cette personne a commencé le formulaire et n’a pas encore fini.");
    lignes.push("Étape atteinte : " + (libelleEtape(data) || "1"));
    lignes.push("Ce qui suit est ce qu’elle a rempli JUSQU’ICI. La même");
    lignes.push("ligne du classeur se complétera toute seule si elle continue.");
    lignes.push("");
    lignes.push("Si rien ne bouge d’ici demain, c’est un abandon : on a de");
    lignes.push("quoi la rappeler.");
    lignes.push("");
  }

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

  /* RÉPONDRE, C'EST ÉCRIRE AU CLIENT. On le dit, parce que
     personne ne devine qu'un `Reply-To` a été posé. */
  var duVisiteur = String(data.email || data.votre_email || "").trim();
  if (duVisiteur && RE_COURRIEL.test(duVisiteur)) {
    lignes.push("");
    lignes.push("→ « Répondre » à ce message écrit directement à "
      + duVisiteur + ".");
  }

  lignes.push("");
  /* LE LIEN VA SUR LA LIGNE, PAS SUR LE CLASSEUR. `lienVersLigne`
     porte le `gid` de l'onglet et `range=A2` : un clic ouvre la
     bonne feuille, curseur sur la demande qui vient d'arriver. Un
     lien vers le classeur nu ouvrirait le premier onglet, et il
     faudrait chercher. */
  lignes.push("La ligne : " + (ecrit.url || classeur().getUrl()));

  if (partiel) {
    lignes.push("");
    lignes.push("Vous ne recevrez plus rien sur cette personne tant qu’elle");
    lignes.push("n’aura pas terminé. C’est voulu : le compte Gmail ne peut");
    lignes.push("envoyer que cent messages par jour.");
  }

  var reste = quotaRestant();
  if (reste < 15) {
    lignes.push("");
    lignes.push("— Il reste " + reste + " envois aujourd’hui. Au-delà, "
      + "le classeur continue de se remplir mais les avis s’arrêtent.");
  }

  envoyer(notifDest(), objetAvis(kind, data, extra), lignes.join("\n"), duVisiteur);
}

/* LE QUOTA QUI SAUTE DOIT SE VOIR DANS LE CLASSEUR.  D-733

   Quand la réserve d'envois est vide, plus aucun avis ne part —
   donc plus rien ne prévient que plus rien ne prévient. Le classeur
   continue de se remplir, et personne ne le regarde puisque
   personne n'a été averti. C'est le silence le plus coûteux du
   système.

   On écrit donc la mention DANS LA LIGNE, colonne « Notes
   internes » : le seul endroit qui sera lu de toute façon, le jour
   où quelqu'un finit par ouvrir le classeur. */
function noterQuotaEpuise(kind, ligne) {
  noterDansLaLigne(kind, ligne, "QUOTA D’ENVOI ÉPUISÉ",
    "⚠ QUOTA D’ENVOI ÉPUISÉ le " + quand(new Date())
    + " — aucun avis n’est parti, ni à nous ni au client. À rappeler à la main.");
}

/* UN SILENCE DOIT SE VOIR DANS LE CLASSEUR.  D-758

   Au-delà du plafond d'avis, la ligne s'écrit et aucun courriel ne
   part. Sans cette note, la demande aurait exactement l'air d'une
   demande normale qu'on aurait oublié de rappeler. */
function noterAvisMuet(kind, ligne) {
  noterDansLaLigne(kind, ligne, "AUCUN AVIS ENVOYÉ",
    "⚠ AUCUN AVIS ENVOYÉ le " + quand(new Date())
    + " — trop de demandes neuves en une heure, la réserve de courriels a été"
    + " protégée. La demande est vraie : à rappeler à la main.");
}

/* Ajoute une note à la ligne, une seule fois par marqueur. */
function noterDansLaLigne(kind, ligne, marqueur, note) {
  try {
    var feuille = classeur().getSheetByName(SCHEMA[kind].onglet);
    if (!feuille) return;
    var titres = colonnes(kind).map(function (c) { return c.titre; });
    var iNotes = titres.indexOf("Notes internes") + 1;
    if (iNotes < 1) return;
    var cellule = feuille.getRange(ligne, iNotes);
    var ancien = String(cellule.getValue() || "");
    if (ancien.indexOf(marqueur) === -1) {
      cellule.setValue(ancien ? ancien + "\n" + note : note);
    }
  } catch (e) {
    console.error("note « " + marqueur + " » : " + e);
  }
}

/* L'OBJET SE LIT DANS UNE LISTE DE MESSAGES, SANS L'OUVRIR.
   Trois choses, dans cet ordre : de quoi il s'agit, qui, et quand.

   L'urgence passe en premier et en majuscules, parce que c'est le
   seul cas où l'ordre de lecture de la boîte doit changer. Une
   réservation porte la plage plutôt que l'heure de la demande : ce
   qui compte, c'est quand a lieu l'appel, pas quand il a été pris. */
function objetAvis(kind, data, extra) {
  var def = SCHEMA[kind];
  /* L'OBJET NE PORTE PAS DE RETOUR À LA LIGNE.  D-758
     Un nom qui en contient — collé depuis un courriel, ou envoyé par
     une requête forgée — coupe l'objet en deux dans la liste de
     Gmail : l'avis n'y dit plus de qui il s'agit, ce qui est
     précisément la seule chose qu'il doit dire au premier coup
     d'œil. On tronque aussi, un objet long est illisible au
     téléphone. */
  var qui = String(data.nom || data.votre_nom || data.email || "")
    .replace(/\s+/g, " ").trim().slice(0, 80);
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
  return texteJson(JSON.stringify(objet));
}

/* Le même en-tête, sur du JSON DÉJÀ écrit. Sert au cache des
   créneaux, qui garde le texte et non l'objet.  D-758 */
function texteJson(texte) {
  return ContentService
    .createTextOutput(texte)
    .setMimeType(ContentService.MimeType.JSON);
}

var CLE_CACHE_CRENEAUX = "creneaux-v1";

/* LE CACHE DES CRÉNEAUX SE VIDE DÈS QU'UNE PLAGE EST PRISE.  D-758

   Sans ça, la plage réservée resterait offerte jusqu'à 90 s au
   visiteur suivant. Elle ne serait pas RÉSERVÉE deux fois — la
   revérification sous verrou de `poserRendezVous` l'interdit — mais
   la deuxième personne remplirait tout le formulaire pour se faire
   dire non à la dernière seconde, ce qui est pire qu'une attente. */
function oublierCreneaux() {
  try { CacheService.getScriptCache().remove(CLE_CACHE_CRENEAUX); }
  catch (e) { console.warn("cache créneaux : " + e); }
}

/* ============================================================
   LE DÉBIT — CE QUI EMPÊCHE UN ROBOT DE VIDER LA RÉSERVE.  D-758

   Apps Script ne donne PAS l'adresse IP de l'appelant : `doPost`
   ne reçoit que le corps. On ne peut donc pas compter par visiteur
   au sens réseau. Les deux compteurs ci-dessous comptent ce qu'on
   peut vraiment compter, et c'est suffisant pour ce qu'on protège.

   LE VRAI ENJEU N'EST PAS LE CLASSEUR, C'EST LE COURRIEL. Mille
   lignes de robot se suppriment en dix secondes ; cent envois
   brûlés bloquent les VRAIES demandes pendant vingt-quatre heures.
   Le plafond des naissances est donc calé sous le quota d'envois.

   `CacheService` est le bon outil et `PropertiesService` ne l'est
   pas : le cache expire tout seul, la propriété resterait à vie et
   il faudrait la nettoyer.
   ============================================================ */

/* Rend `true` si ce compteur vient de dépasser son plafond. */
function tropVite(cle, plafond, fenetreS) {
  try {
    var cache = CacheService.getScriptCache();
    var n = Number(cache.get(cle)) || 0;
    if (n >= plafond) return true;
    /* La fenêtre ne glisse pas : elle repart du premier appel. Une
       fenêtre glissante demanderait de garder la liste des instants,
       et le cache ne garantit pas de la rendre. */
    cache.put(cle, String(n + 1), fenetreS);
    return false;
  } catch (e) {
    /* UN COMPTEUR ILLISIBLE NE BLOQUE PERSONNE. Le cache d'Apps
       Script peut être vidé sans prévenir ; refuser les demandes
       parce qu'on n'a pas su compter coûterait des clients réels
       pour empêcher un abus hypothétique. */
    console.warn("débit « " + cle + " » : " + e);
    return false;
  }
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

    /* LE DÉDOUBLONNAGE NE VIT PLUS DANS `ecrireLigne`.  D-730
       Il est passé dans `traiter()`, AVANT les effets de bord.
       L'autotest doit donc l'appeler là où il est : écrire une
       ligne, puis chercher sa jumelle avec la même signature. */
    var sig = signature(kind, d);
    var un = ecrireLigne(kind, d, {}, sig);
    var deux = chercherJumelle(kind, sig);
    rapport.push(kind + " : ligne " + un.ligne
      + " · renvoi détecté : " + (deux ? "oui (renvois=" + deux.renvois + ")" : "NON — DÉFAUT"));
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

/* LES MARQUEURS D'ESSAI. Toute ligne qui en contient un est du
   jetable — et rien de ce qui vient d'un vrai visiteur ne peut en
   contenir : `exemple.ca` est un domaine réservé à la
   documentation, il n'existe pas.

   `ZZTEST` est le préfixe des sondes lancées contre le VRAI service
   le 2026-08-06. Il est en majuscules et commence par deux Z pour
   qu'aucun nom réel ne le porte, et pour qu'un tri alphabétique les
   rassemble au bout. */
var MARQUEURS_ESSAI = ["essai@exemple.ca", "zztest@exemple.ca", "ZZTEST",
                       "exemple.ca", "@exemple.com"];

/* LES DEUX PRÉFIXES DE TITRE D'ÉVÉNEMENT, EN UN SEUL ENDROIT.  D-745

   Ils sont ce qui distingue un rendez-vous posé par le site d'un
   événement personnel, et c'est `nettoyerRendezVousEssai()` qui s'en
   sert pour savoir ce qu'elle a le droit de supprimer.

   ILS ÉTAIENT ÉCRITS EN DUR À DEUX ENDROITS. Le jour où les titres
   ont changé — « Appel APED · Nom » devenu « ☎ Appeler Nom » —
   la fonction de nettoyage a cessé de reconnaître quoi que ce soit
   et n'a plus rien supprimé, sans une erreur. Une fonction de
   suppression qui rend « 0 » est indiscernable d'une qui n'a rien
   trouvé (piège 30). */
var PREFIXE_TEL  = "☎ Appeler ";
var PREFIXE_MEET = "▸ Meet · ";

/* Ce titre a-t-il été écrit par le site ? On garde l'ancien préfixe :
   les rendez-vous posés avant le 2026-08-06 le portent encore, et
   ils doivent rester nettoyables. */
function titreDuSite(titre) {
  var t = String(titre || "");
  return t.indexOf(PREFIXE_TEL) === 0
      || t.indexOf(PREFIXE_MEET) === 0
      || t.indexOf("Appel APED") === 0;
}

/* Efface les lignes d'essai. Sans argument, cherche tous les
   marqueurs ci-dessus ; on peut en passer un seul.

   ELLE COMPTE ET ELLE NOMME. Une fonction de suppression qui rend
   « 0 » sans rien dire est indiscernable d'une fonction qui n'a
   pas trouvé sa cible. Celle-ci journalise chaque onglet et chaque
   ligne retirée, avec ce qu'elle contenait. */
function nettoyerAutotest(marqueur) {
  var cherches = marqueur ? [marqueur] : MARQUEURS_ESSAI;
  var total = 0;
  var detail = [];

  Object.keys(SCHEMA).forEach(function (kind) {
    var feuille = classeur().getSheetByName(SCHEMA[kind].onglet);
    if (!feuille || feuille.getLastRow() < 2) return;
    var largeur = colonnes(kind).length;
    var lignes = feuille.getRange(2, 1, feuille.getLastRow() - 1, largeur).getValues();
    var n = 0;
    /* À REBOURS : supprimer la ligne 5 fait remonter la 6 à sa
       place. En descendant, on saute une ligne sur deux. */
    for (var r = lignes.length - 1; r >= 0; r--) {
      var texte = lignes[r].join("|");
      var touche = cherches.some(function (m) { return texte.indexOf(m) !== -1; });
      if (!touche) continue;
      feuille.deleteRow(r + 2);
      n++;
      total++;
    }
    if (n) detail.push("  " + SCHEMA[kind].onglet + " : " + n + " ligne(s)");
  });

  var texte = total + " ligne(s) d'essai retirée(s)."
    + (detail.length ? "\n" + detail.join("\n") : "")
    + "\nMarqueurs cherchés : " + cherches.join(", ")
    + "\n\nLes ÉVÉNEMENTS d'essai du calendrier ne sont PAS touchés :"
    + "\nlancez `nettoyerRendezVousEssai()` pour ceux-là.";
  Logger.log(texte);
  return texte;
}

/* Les rendez-vous d'essai vivent au calendrier, pas au classeur, et
   TANT QU'ILS Y SONT ILS BLOQUENT LEURS CRÉNEAUX sur le site. Un
   classeur nettoyé et un agenda qui ne l'est pas, c'est un
   calendrier public plein de trous inexplicables. */
function nettoyerRendezVousEssai() {
  var f = fenetreReservable();
  var cal = DISPONIBILITES.CALENDRIER_ID
    ? CalendarApp.getCalendarById(DISPONIBILITES.CALENDRIER_ID)
    : CalendarApp.getDefaultCalendar();

  var debut = new Date(Date.now() - 7 * 86400000);
  var fin = new Date(f.plafond.getTime() + 86400000);
  var evenements = cal.getEvents(debut, fin);
  var retires = [];

  evenements.forEach(function (ev) {
    var titre = String(ev.getTitle() || "");
    var desc = "";
    try { desc = String(ev.getDescription() || ""); } catch (e) {}
    var touche = MARQUEURS_ESSAI.some(function (m) {
      return titre.indexOf(m) !== -1 || desc.indexOf(m) !== -1;
    });
    /* Un rendez-vous posé par le site porte toujours l'un des
       préfixes connus : on ne touche donc jamais à un événement
       personnel. Les deux conditions sont exigées ensemble. */
    if (!touche || !titreDuSite(titre)) return;
    retires.push(titre + " — " + quand(ev.getStartTime()));
    ev.deleteEvent();
  });

  var texte = retires.length + " rendez-vous d'essai retiré(s)."
    + (retires.length ? "\n  " + retires.join("\n  ") : "")
    + "\n\nSeuls les événements dont le titre commence par « Appel APED »"
    + "\nET qui portent un marqueur d'essai sont touchés.";
  Logger.log(texte);
  return texte;
}
