/* ============================================================
   UN REESSAI NE DOIT RIEN CASSER
   `node tools/idempotence-check.mjs`

   POURQUOI CET OUTIL EXISTE.
   Le 2026-08-06, le VRAI deploiement a rendu 2 reponses sur 36 en
   HTTP 404 — le renvoi de `/exec` vers `googleusercontent.com` qui
   tombe. Le site reessaie donc maintenant (D-734). Un reessai n'est
   sur QUE si le service est idempotent, et il ne l'etait pas :

     · une reservation reessayee se refusait elle-meme, parce que le
       premier essai avait deja pose l'evenement au calendrier ;
     · un projet reessaye televersait ses fichiers DEUX fois ;
     · les avis pouvaient partir deux fois.

   `traiter()` cherche desormais la signature AVANT tout effet de
   bord (D-730). Cet outil verifie que c'est vrai, sur le VRAI
   `Code.gs` execute par `tools/faux-google.mjs`.

   IL VERIFIE AUSSI L'INJECTION DE FORMULE (D-731) : qu'une valeur
   du visiteur commencant par `=` soit rangee dans une cellule au
   format TEXTE, donc jamais evaluee.

   CE QU'IL NE PROUVE PAS : que Google Sheets respecte bien le
   format `@` pose avant `setValues`. Le bouchon enregistre l'appel,
   il ne simule pas le moteur de calcul de Sheets. Verification a la
   main, une fois : `RESERVES.md`.
   ============================================================ */
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const { gs, etat } = await import(pathToFileURL(path.join(ICI, "faux-google.mjs")).href);

gs.initialiser();

let n = 0, ko = 0;
function dire(nom, obtenu, attendu) {
  n++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) ko++;
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + nom
    + "\n         obtenu  : " + obtenu
    + "\n         attendu : " + attendu);
}
const poster = (c) => JSON.parse(gs.doPost({ postData: { contents: JSON.stringify(c) }, parameter: {} }).getContent());
const etatDe = () => ({
  courriels: etat.courriels.length,
  evenements: etat.evenements.length,
  fichiers: etat.fichiersDrive.length
});
const lignesDe = (onglet) => {
  const f = etat.feuilles.get(onglet);
  return f ? f.valeurs.slice(1).filter((r) => r.some((c) => c !== "" && c != null)).length : 0;
};

console.log("============================================================");
console.log("UN REESSAI NE DOIT RIEN CASSER");
console.log("============================================================");


/* ============================================================
   1 · UN CONTACT REESSAYE TROIS FOIS
   ============================================================ */
console.log("\n--- 1 · CONTACT, TROIS FOIS LA MEME DEMANDE");
{
  const charge = { _form: "contact", nom: "Ida Contact", email: "ida@exemple.ca",
                   message: "Exactement le meme message." };
  const av = etatDe();
  const a = poster(charge);
  const apres1 = etatDe();
  const b = poster(charge);
  const c = poster(charge);
  const ap = etatDe();

  dire("1er : ligne creee", a.success && a.renvoi === false, true);
  dire("2e : compte comme renvoi", b.renvoi, true);
  dire("3e : renvoi aussi", c.renvoi, true);
  dire("le compteur de renvois monte", b.renvois + "→" + c.renvois, "1→2");
  dire("une seule ligne au total", lignesDe("Contact simple"), 1);
  dire("DEUX courriels au total, pas six",
    ap.courriels - av.courriels, 2);
  dire("le 1er envoi a bien envoye les deux",
    apres1.courriels - av.courriels, 2);
}


/* ============================================================
   2 · UNE RESERVATION REESSAYEE — LE CAS QUI SE REFUSAIT LUI-MEME
   ============================================================ */
console.log("\n--- 2 · RESERVATION, DEUX FOIS LA MEME DEMANDE");
{
  const rep = JSON.parse(gs.doGet({ parameter: { action: "creneaux" } }).getContent());
  const iso = rep.jours[1].creneaux[2].iso;
  const charge = { _form: "booking", nom: "Ida Meet", email: "ida.meet@exemple.ca",
                   telephone: "418 555 0142", mode: "Google Meet", plage_iso: iso };

  const av = etatDe();
  const a = poster(charge);
  const b = poster(charge);
  const ap = etatDe();

  dire("1er : reserve", a.success && a.renvoi === false, true);
  dire("1er : rend un lien Meet", Boolean(a.meet), true);
  dire("2e : SUCCES (pas « plage deja prise »)", b.success, true);
  dire("2e : marque comme renvoi", b.renvoi, true);
  dire("2e : rend LE MEME lien Meet", b.meet, a.meet);
  dire("UN SEUL evenement au calendrier", ap.evenements - av.evenements, 1);
  dire("DEUX courriels, pas quatre", ap.courriels - av.courriels, 2);
  dire("une seule ligne", lignesDe("Réserver un appel"), 1);
}


/* ============================================================
   3 · UN PROJET AVEC FICHIER, REESSAYE
   ============================================================ */
console.log("\n--- 3 · PROJET AVEC PIECE JOINTE, DEUX FOIS");
{
  const charge = {
    _form: "project", nom: "Ida Projet", entreprise: "Ida inc",
    email: "ida.projet@exemple.ca", telephone: "418 555 0142",
    description: "Un projet.",
    /* OBLIGATOIRE DEPUIS D-746. Sans lui la demande est refusee, et
       c'est le comportement voulu : « budget vide » etait la colonne
       la plus souvent vide du classeur. */
    budget: "10 000 $ à 20 000 $",
    _fichiers: [{ nom: "plan.pdf", type: "application/pdf",
                  base64: Buffer.from("un faux pdf").toString("base64") }]
  };
  const av = etatDe();
  const a = poster(charge);
  const b = poster(charge);
  const ap = etatDe();

  dire("1er : ligne creee", a.success && a.renvoi === false, true);
  dire("2e : renvoi", b.renvoi, true);
  dire("UN SEUL fichier sur Drive, pas deux", ap.fichiers - av.fichiers, 1);
  dire("une seule ligne", lignesDe("Démarrer un projet"), 1);
}


/* ============================================================
   4 · DEUX DEMANDES DIFFERENTES NE FUSIONNENT JAMAIS
   Un dedoublonnage trop zele coute deux vrais clients. C'est aussi
   grave qu'un doublon, et beaucoup moins visible.
   ============================================================ */
console.log("\n--- 4 · MEME COURRIEL, DEMANDES DIFFERENTES");
{
  const base = { _form: "contact", nom: "Ida Contact", email: "ida@exemple.ca" };
  const avant = lignesDe("Contact simple");
  const cas = [
    ["message different", { message: "Un message tout autre." }],
    ["casse differente", { message: "EXACTEMENT LE MEME MESSAGE." }],
    ["espaces multiples", { message: "Exactement  le  meme  message." }],
    ["accents", { message: "Exactement le même message." }],
    ["nom different", { nom: "Ida Contact 2", message: "Exactement le meme message." }]
  ];
  for (const [nom, extra] of cas) {
    const r = poster(Object.assign({}, base, extra));
    dire(nom + " : ligne DISTINCTE", r.renvoi === false, true);
  }
  dire("cinq lignes de plus", lignesDe("Contact simple") - avant, 5);
}


/* ============================================================
   5 · L'INJECTION DE FORMULE
   ============================================================ */
console.log("\n--- 5 · INJECTION DE FORMULE");
{
  const poisons = ["=1+1", '=IMPORTXML("http://exemple.ca","//a")',
                   "+1+1", "@SUM(A1:A9)", "-1+1"];
  for (const p of poisons) {
    const r = poster({ _form: "contact", nom: "Ida Poison " + p.slice(0, 6),
                       email: "poison@exemple.ca", message: p });
    dire("« " + p.slice(0, 22) + " » accepte", r.success, true);
  }

  const f = etat.feuilles.get("Contact simple");
  const titres = f.valeurs[0];
  const iMsg = titres.indexOf("Message") + 1;
  /* LA VALEUR EST RANGEE TELLE QUELLE — on ne la mutile pas. */
  const rangees = f.valeurs.slice(1).map((r) => r[iMsg - 1]).filter((v) => typeof v === "string");
  dire("les formules sont rangees SANS etre modifiees",
    rangees.filter((v) => poisons.indexOf(v) !== -1).length, poisons.length);

  /* L'ASSERTION QUI MANQUAIT, ET C'EST LA SEULE QUI COMPTE.  D-757

     Ce cas verifiait que la valeur n'est pas MUTILEE. Il ne
     verifiait pas qu'elle n'est pas CALCULEE — c'est-a-dire
     exactement la faille. Le 2026-08-06, le vrai classeur rendait
     `formule = "=IMPORTXML(…)"` sur une cellule au format `@`
     pendant que ce cas passait au vert.

     `getFormulas()` non vide = Sheets a calcule. C'est le seul
     verdict qui vaille : `getValues()` se lit pareil dans les deux
     cas quand la formule rend son propre texte. */
  dire("AUCUNE n'a ete prise pour un calcul", f.formules.size, 0,
    f.formules.size ? "cellules calculees : " + [...f.formules].join(", ") : "");

  /* LE FORMAT TEXTE EST POSE AVANT L'ECRITURE. Il ne protege de
     rien (D-757) mais il reste juste : une colonne de visiteur au
     format nombre afficherait « 4189 » pour un code postal. */
  dire("le format « @ » a ete pose sur les colonnes du visiteur",
    f.formatsTexte && f.formatsTexte.length > 0, true);
  dire("il a ete pose AVANT les valeurs, jamais apres",
    f.formatApresValeurs || 0, 0);
}


/* ============================================================
   6 · LE HONEYPOT N'ECRIT TOUJOURS RIEN
   ============================================================ */
console.log("\n--- 6 · HONEYPOT");
{
  const av = etatDe();
  const avantLignes = lignesDe("Contact simple");
  const r = poster({ _form: "contact", nom: "Robot", email: "robot@exemple.ca",
                     message: "Je suis un robot.", _gotcha: "rempli" });
  dire("succes rendu au robot", r.success, true);
  dire("marque ignore", r.ignore, true);
  dire("aucune ligne ecrite", lignesDe("Contact simple") - avantLignes, 0);
  dire("aucun courriel", etatDe().courriels - av.courriels, 0);
}


/* ============================================================
   7 · LE QUOTA EPUISE NE PERD JAMAIS LA DEMANDE
   ============================================================ */
console.log("\n--- 7 · QUOTA EPUISE");
{
  etat.quota = 0;
  const avantLignes = lignesDe("Urgence");
  const r = poster({ _form: "urgent", nom: "Ida Quota", telephone: "418 555 0142",
                     email: "quota@exemple.ca", message: "Le site est tombe." });
  dire("la demande passe quand meme", r.success, true);
  dire("la ligne est ecrite", lignesDe("Urgence") - avantLignes, 1);

  const f = etat.feuilles.get("Urgence");
  const iNotes = f.valeurs[0].indexOf("Notes internes");
  const note = String(f.valeurs[1][iNotes] || "");
  dire("le classeur PORTE la mention du quota epuise",
    /QUOTA D’ENVOI ÉPUISÉ/.test(note), true);
  console.log("         note : " + note.slice(0, 90));
  etat.quota = 100;
}


/* ============================================================
   8 · REPONDRE A L'AVIS ECRIT AU CLIENT
   ============================================================ */
console.log("\n--- 8 · REPLY-TO SUR L'AVIS INTERNE");
{
  etat.courriels.length = 0;
  poster({ _form: "contact", nom: "Ida ReplyTo", email: "ida.replyto@exemple.ca",
           message: "Une demande pour verifier le Reply-To." });
  const avis = etat.courriels.find((c) => /^\[APED\]/.test(c.subject));
  const conf = etat.courriels.find((c) => !/^\[APED\]/.test(c.subject));
  dire("l'avis interne porte un Reply-To", avis && avis.replyTo, "ida.replyto@exemple.ca");
  dire("il part bien vers la boite de l'agence", avis && avis.to, gs.notifDest());
  dire("le corps annonce que « Repondre » ecrit au client",
    avis && /« Répondre » à ce message écrit directement à/.test(avis.body), true);
  dire("la confirmation au visiteur n'a PAS de Reply-To",
    conf && conf.replyTo === undefined, true);
  dire("l'objet porte l'heure",
    avis && /· \d{1,2} h \d{2}$/.test(avis.subject), true);
  console.log("         objet : " + (avis && avis.subject));
}


/* ============================================================
   9 · LE CLASSEUR VU UN LUNDI MATIN
   ============================================================ */
console.log("\n--- 9 · L'ORDRE DES COLONNES ET LA MISE EN FORME");
{
  const cols = gs.colonnes("project").map((c) => c.titre);
  /* LE SUIVI PASSE DEVANT, SAUF CE QUI EST LARGE.  D-743 puis D-759
     A Vu (case a cocher) · B Lu par · C Rappele par · D Statut ·
     E Etape · F Horodatage · G+ le visiteur.

     « Notes internes » etait en E et pesait 340 px : les six
     colonnes de tete en mangeaient 1 010 sur les 1 440 d'un ecran,
     et il ne restait la place que du nom. Elle est passee a la fin,
     avec « Renvois » et la signature. Ce qui ouvre le classeur
     tient maintenant en 670 px et repond a « qui, ou il en est,
     quand » ; le reste de l'ecran est a la demande. */
  dire("les quatre colonnes de suivi ouvrent le classeur",
    cols.slice(0, 4).join("|"), "Vu|Lu par|Rappelé par|Statut");
  /* LES COLONNES DE SERVICE SE LISENT DANS `TECHNIQUES`, ELLES NE
     S'ENUMERENT PAS. Ce cas disait « Étape|Horodatage » et « le
     visiteur commence en G » : D-764 a ajoute « Parti vers » et
     « Relance », et les deux ont accuse un code sain. Ce qui compte
     n'est pas COMBIEN il y en a — c'est qu'elles soient toutes
     groupees apres le suivi, et que la demande vienne juste apres. */
  const TECH = cols.slice(4, cols.indexOf("Nom"));
  dire("l'etape ouvre les colonnes de service", TECH[0], "Étape");
  dire("l'horodatage les ferme", TECH[TECH.length - 1], "Horodatage");
  dire("la demande commence juste apres elles",
    cols[4 + TECH.length], "Nom");
  dire("« Notes internes » ferme la demande, avant les deux colonnes de service",
    cols.slice(-3).join("|"), "Notes internes|Renvois|Signature");
  /* LA LARGEUR DE TETE SE MESURE, ELLE NE SE SUPPOSE PAS. Un seul
     elargissement de colonne suffit a repousser la demande hors de
     l'ecran, et personne ne s'en apercevrait avant un lundi matin. */
  const tete = gs.colonnes("project").slice(0, 6)
    .reduce((n, c) => n + (c.largeur || 0), 0);
  dire("les six colonnes de tete tiennent sous 700 px (" + tete + " px)",
    tete <= 700, true);
  console.log("         ordre : " + cols.slice(0, 6).join(" | ") + " | … | "
    + cols.slice(-4).join(" | "));

  const f = etat.feuilles.get("Démarrer un projet");
  dire("une regle de mise en forme est posee", f.regles.length, 1);
  const r = f.regles[0];
  const iLu = f.valeurs[0].indexOf("Lu par") + 1;
  const lettre = gs.colonneLettre(iLu);
  dire("elle juge bien la colonne « Lu par »",
    r.formule.indexOf("$" + lettre + '2=""') !== -1, true);
  /* LE TEST « CETTE LIGNE EXISTE » NE PEUT PLUS VISER A.  D-743
     A porte une case a cocher, et une case decochee vaut FALSE, pas
     "" : `$A2<>""` serait vrai sur les mille lignes vides du bas
     et les peindrait toutes en jaune. Il vise l'horodatage. */
  const iDate = f.valeurs[0].indexOf("Horodatage") + 1;
  const lettreDate = gs.colonneLettre(iDate);
  dire("elle ne colore que les lignes qui EXISTENT",
    r.formule.indexOf("$" + lettreDate + '2<>""') !== -1, true);
  dire("et elle ne teste PAS la case a cocher",
    r.formule.indexOf('$A2<>""') === -1, true);
  console.log("         formule : " + r.formule);

  /* RELANCER `initialiser()` NE DOIT PAS EMPILER LES REGLES. */
  gs.initialiser();
  gs.initialiser();
  dire("trois passages d'initialiser() = toujours UNE regle",
    etat.feuilles.get("Démarrer un projet").regles.length, 1);
}

/* ============================================================
   10 · LA MIGRATION NE DECALE PAS LES DONNEES
   On simule un classeur d'AVANT le deplacement de « Statut » :
   en-tetes dans l'ancien ordre, une ligne dessous. `initialiser()`
   doit redisposer la ligne, pas la laisser glisser.
   ============================================================ */
console.log("\n--- 10 · MIGRATION D'UN CLASSEUR DEJA REMPLI");
{
  const nom = "Contact simple";
  const f = etat.feuilles.get(nom);
  const voulus = gs.colonnes("contact").map((c) => c.titre);
  /* L'ANCIEN ORDRE, celui d'avant D-743 : Horodatage en A, Statut
     en B, le reste du suivi rejete au bout. « Vu » et « Etape »
     n'existaient pas — elles arriveront vides, c'est normal, et le
     controle ci-dessous les exclut explicitement plutot que de les
     laisser passer en silence. */
  const neuves = ["Vu", "Étape"];
  const anciens = ["Horodatage", "Statut"].concat(
    voulus.filter((t) => ["Horodatage", "Statut", "Signature"].indexOf(t) === -1
                      && neuves.indexOf(t) === -1),
    ["Signature"]);

  /* UNE COLONNE A LISTE NE PEUT PAS PORTER UN MARQUEUR INVENTE.
     D-778

     « val:Lu par » n'est dans aucune liste : `reparerValeursListes`
     le vide — c'est son travail, et il a raison. Le marqueur d'une
     colonne a liste est donc une VRAIE valeur de sa liste, prise a
     un rang different pour chaque colonne : deux colonnes qui
     s'echangeraient leur contenu se verraient quand meme. */
  const marqueur = new Map();
  gs.colonnes("contact").forEach(function (c) {
    if (c.liste) marqueur.set(c.titre, c.liste[anciens.indexOf(c.titre) % c.liste.length]);
  });
  const attendu = (t) => (marqueur.has(t) ? marqueur.get(t) : "val:" + t);

  f.valeurs.length = 0;
  f.valeurs.push(anciens.slice());
  const ligne = anciens.map(attendu);
  f.valeurs.push(ligne);

  gs.initialiser();

  const apres = f.valeurs[0];
  const donnees = f.valeurs[1];
  dire("les en-tetes sont dans le nouvel ordre", apres.join("|"), voulus.join("|"));
  /* Les colonnes qui n'existaient PAS avant ne peuvent pas porter
     de valeur : on ne les compte pas comme decalees, on verifie
     seulement qu'elles sont vides. */
  const decalees = voulus.filter((t, i) =>
    neuves.indexOf(t) === -1 && donnees[i] !== attendu(t));
  dire("chaque valeur a suivi son en-tete",
    decalees.length ? decalees.join(", ") : "aucune decalee", "aucune decalee");
  const pleines = neuves.filter((t) => String(donnees[voulus.indexOf(t)] || "") !== "");
  dire("les colonnes neuves arrivent vides, pas remplies au hasard",
    pleines.length ? pleines.join(", ") : "aucune", "aucune");
  const iStatut = voulus.indexOf("Statut");
  console.log("         ex. : « Statut » (col " + gs.colonneLettre(iStatut + 1)
    + ") porte « " + donnees[iStatut] + " »");
}

/* ============================================================
   11 · UNE VALIDATION PERIMEE NE DOIT PLUS TRONQUER LA LIGNE
   ============================================================
   LE DEFAUT QUE CE CAS REJOUE, ET CE QU'IL A COUTE.  D-756

   Le 2026-08-06, « Démarrer un projet » affichait « ✓ complète »
   sur une ligne dont le budget, l'echeancier, la description et la
   fourchette n'etaient JAMAIS arrives. Une liste deroulante
   « William, Allen, Eli » etait restee sur la colonne 19 — la ou
   « Lu par » vivait avant D-743. Sheets refusait la valeur,
   `setValues` levait APRES avoir pose les colonnes de gauche, et la
   ligne restait ecrite a moitie sans que rien ne le dise.

   AUCUN OUTIL NE POUVAIT LE VOIR. Le banc posait des validations et
   n'en tirait aucune consequence ; la porte `?action=diag` ne les
   rendait pas. 63/63 sur un classeur qui perdait la moitie droite
   de chaque ligne.

   Ce cas prouve les trois temps : ca casse, on purge, ca tient. */
console.log("\n--- 11 · UNE VALIDATION PERIMEE NE TRONQUE PLUS LA LIGNE  (D-756)");
{
  const nom = "Démarrer un projet";
  const f = etat.feuilles.get(nom);
  const titres = gs.colonnes("project").map((c) => c.titre);
  /* LA COLONNE SE CALCULE, ELLE NE SE CODE PAS EN DUR. En production
     c'etait la 19 ; le jour ou D-749 a ajoute quatre colonnes, la 19
     est devenue « Ampleur » et le cas ne prouvait plus rien en
     silence. On vise la premiere colonne que la charge d'essai
     remplit vraiment. */
  const PERIMEE = titres.indexOf("Ce qui les bloque") + 1;
  if (PERIMEE < 2) { console.error("colonne repere introuvable"); process.exit(2); }

  const pose = () => {
    f.validations[PERIMEE] = {
      valeurs: ["William", "Allen", "Eli"], autoriseInvalide: false,
      type: "VALUE_IN_LIST", depuis: 2, jusqua: 1000
    };
  };
  const iSig = titres.indexOf("Signature");
  /* « FOURCHETTE VUE » A QUITTE CETTE LISTE LE 2026-08-07.  D-774
     Elle y etait marquee « ZZ-fourchette_vue » depuis le site : le
     navigateur portait la grille et calculait le montant lui-meme.
     Il ne l'a plus. Le cas se dedouble donc plus bas — une fois pour
     prouver qu'un montant venu du navigateur est JETE, une fois pour
     prouver que celui du serveur arrive quand meme jusqu'ici. */
  const APRES = ["Ce qui les bloque", "Objectif", "Budget", "Échéancier",
                 "Description"];
  const CHAMPS = { "Ce qui les bloque": "blocage", "Objectif": "objectif",
                   "Budget": "budget", "Échéancier": "echeancier",
                   "Description": "description" };
  const finale = (S) => ({ _form: "project", _sid: S, _etape: 3, _etapes: 3, _final: true,
    email: "zztest@exemple.ca", nom: "ZZTEST D756", entreprise: "ZZTEST Inc",
    blocage: "ZZ-blocage", objectif: "ZZ-objectif", budget: "ZZ-budget",
    echeancier: "ZZ-echeancier", description: "ZZ-description",
    fourchette_vue: "ZZ-fourchette_vue" });
  const trouver = (S) => f.valeurs.find((r) => String((r || [])[iSig] || "") === "S:" + S);
  const lire1 = (ligne, t) => String((ligne || [])[titres.indexOf(t)] || "");

  /* --- a · AVEC la perimee : le parcours reel se coupe en deux --- */
  pose();
  const S1 = "sondeD756avant";
  poster({ _form: "project", _sid: S1, _etape: 1, _etapes: 3,
    email: "zztest@exemple.ca", nom: "ZZTEST D756" });
  const rA = poster(finale(S1));
  const ligneA = trouver(S1);
  dire("la demande finale est REFUSEE au lieu de mentir", rA.success, false,
    String(rA.cause || rA.message || "").slice(0, 100));
  dire("« Étape » a quand meme avance — la ligne est ecrite a moitie",
    lire1(ligneA, "Étape"), "✓ complète");
  const perdues = APRES.filter((t) => lire1(ligneA, t) === "");
  dire("et les " + APRES.length + " colonnes d'apres la " + PERIMEE + " sont PERDUES",
    perdues.length, APRES.length, "c'est exactement ce que le classeur montrait");

  /* --- b · initialiser() purge la perimee --- */
  gs.initialiser();
  dire("initialiser() a retire la validation perimee",
    f.validations[PERIMEE] ? "encore la" : "partie", "partie");

  /* --- c · le meme parcours arrive maintenant entier --- */
  const S = "sondeD756apres";
  poster({ _form: "project", _sid: S, _etape: 1, _etapes: 3,
    email: "zztest@exemple.ca", nom: "ZZTEST D756" });
  const rC = poster(finale(S));
  dire("la demande finale passe", rC.success, true);
  const ligne = trouver(S);
  const val = (t) => lire1(ligne, t);
  dire("la ligne du parcours se retrouve", ligne ? "oui" : "non", "oui");
  APRES.forEach((t) => dire("« " + t + " » est arrivee",
    val(t) === "" ? "-- VIDE --" : val(t), "ZZ-" + CHAMPS[t]));
  dire("et l'etape dit bien que c'est complet", val("Étape"), "✓ complète");

  /* --- d · le montant du navigateur est jete --- */
  /* La charge ci-dessus porte « ZZ-fourchette_vue » ET un echeancier
     que la grille ne connait pas : le serveur ne peut donc rien
     calculer, et il ne recopie pas ce qu'on lui souffle. La colonne
     doit rester VIDE — un « ZZ- » ici voudrait dire que n'importe
     qui peut ecrire n'importe quel prix dans le classeur. */
  dire("le montant envoye par le navigateur ne se rend pas",
    val("Fourchette vue") === "" ? "-- VIDE --" : val("Fourchette vue"), "-- VIDE --");

  /* --- e · celui du serveur, lui, arrive --- */
  const S2 = "sondeD774serveur";
  poster({ _form: "project", _sid: S2, _etape: 1, _etapes: 3,
    email: "zztest@exemple.ca", nom: "ZZTEST D774" });
  const rE = poster({ _form: "project", _sid: S2, _etape: 3, _etapes: 3, _final: true,
    email: "zztest@exemple.ca", nom: "ZZTEST D774", entreprise: "ZZTEST Inc",
    besoins: "Boutique en ligne",
    ampleur: "6 à 15 — un vrai site",
    niveau_design: "Essentiel — propre, rapide, efficace",
    contenu: "Prêts — j’ai tout sous la main",
    fonctions: "Aucune — un site qui présente",
    echeancier: "D’ici 1 à 2 mois", nombre_employes: "2 à 10",
    budget: "J’ai un ordre de grandeur en tête, à valider",
    fourchette_vue: "ZZ-menteur" });
  dire("la demande passe", rE.success, true);
  const ligneE = trouver(S2);
  const vueE = lire1(ligneE, "Fourchette vue");
  dire("le serveur a ecrit une vraie fourchette",
    /^\d[\d\s\u00a0]*\$ à \d[\d\s\u00a0]*\$/.test(vueE) ? "une fourchette" : (vueE || "-- VIDE --"),
    "une fourchette", vueE);
  dire("et ce n'est pas celle que le navigateur pretendait",
    vueE.indexOf("ZZ-menteur") === -1 ? "non" : "OUI", "non");
  dire("la reponse la redescend au site",
    rE.fourchette && rE.fourchette.texte === vueE ? "la meme" : "differente", "la meme");
}

/* ============================================================
   12 · UN NOM D'ASSOCIE RENOMME NE DOIT PLUS TRONQUER LA LIGNE
   ============================================================
   LE DEFAUT QUE CE CAS DEVANCE.  D-778

   Le 2026-08-07, « Alan » est devenu « Allen » et « Elie » est
   devenu « Eli ». Changer le contenu d'une liste deroulante ne
   touche PAS les cellules deja remplies : Sheets les garde et les
   marque invalides. Le jour ou `fusionnerLigne` fait repasser la
   LIGNE ENTIERE par `setValues` — c'est-a-dire des qu'une sauvegarde
   progressive devient une demande complete — la cellule refuse, et
   D-756 se rejoue mot pour mot : la ligne est ecrite a moitie.

   Ce cas prouve les trois temps, comme le 11 : ca casse, on repare,
   ca tient. Il empoisonne l'etat du banc DIRECTEMENT plutot que par
   `setValues` — une ligne ecrite avant le renommage n'est pas passee
   par la validation neuve, et ne le pouvait pas. */
console.log("\n--- 12 · UN NOM D'ASSOCIE RENOMME NE TRONQUE PLUS LA LIGNE  (D-778)");
{
  const f = etat.feuilles.get("Démarrer un projet");
  const titres = gs.colonnes("project").map((c) => c.titre);
  const iLu = titres.indexOf("Lu par");
  const iRap = titres.indexOf("Rappelé par");
  const iSig = titres.indexOf("Signature");
  if (iLu < 1 || iRap < 1) { console.error("colonnes de suivi introuvables"); process.exit(2); }

  const trouver = (S) => f.valeurs.find((r) => String((r || [])[iSig] || "") === "S:" + S);
  const lire = (ligne, t) => String((ligne || [])[titres.indexOf(t)] || "");
  const commencer = (S) => poster({ _form: "project", _sid: S, _etape: 1, _etapes: 3,
    email: "zztest@exemple.ca", nom: "ZZTEST D775" });
  const finir = (S) => poster({ _form: "project", _sid: S, _etape: 3, _etapes: 3, _final: true,
    email: "zztest@exemple.ca", nom: "ZZTEST D775", entreprise: "ZZTEST Inc",
    blocage: "ZZ-blocage", objectif: "ZZ-objectif", budget: "ZZ-budget",
    echeancier: "ZZ-echeancier", description: "ZZ-description" });

  dire("la liste ne porte que les trois bonnes graphies",
    gs.ASSOCIES.join("|"), "William|Allen|Eli");

  /* --- a · une ligne d'avant le renommage coupe la fusion --- */
  const SA = "sondeD775avant";
  commencer(SA);
  const ligneA = trouver(SA);
  ligneA[iLu] = "Alan";                    /* graphie d'avant le 2026-08-07 */
  const rA = finir(SA);
  dire("la demande finale est REFUSEE au lieu de mentir", rA.success, false,
    String(rA.cause || rA.message || "").slice(0, 100));
  dire("et « Description » n'est jamais arrivee",
    lire(trouver(SA), "Description") === "" ? "-- VIDE --" : lire(trouver(SA), "Description"),
    "-- VIDE --");

  /* --- b · initialiser() remet les valeurs d'accord avec la liste --- */
  const SB = "sondeD775inconnu";
  commencer(SB);
  const ligneB = trouver(SB);
  ligneB[iLu] = "Elie";
  ligneB[iRap] = "Zorglub";                /* aucune graphie connue */
  const avantJournal = etat.journal.length;
  gs.initialiser();

  dire("« Alan » est devenu « Allen »", lire(trouver(SA), "Lu par"), "Allen");
  dire("« Elie » est devenu « Eli »", lire(trouver(SB), "Lu par"), "Eli");
  dire("un nom qu'aucune graphie ne rattrape est VIDE, pas laisse en place",
    lire(trouver(SB), "Rappelé par") === "" ? "-- VIDE --" : lire(trouver(SB), "Rappelé par"),
    "-- VIDE --");
  /* UN VIDAGE SILENCIEUX SERAIT PIRE QUE LE DEFAUT. La valeur exacte
     et sa cellule partent au journal, sinon personne ne saura jamais
     ce qui a ete efface. */
  const dit = etat.journal.slice(avantJournal).join("\n");
  dire("le journal nomme la valeur effacee et sa cellule",
    /Zorglub/.test(dit) && /VIDÉE/.test(dit) ? "oui" : "non", "oui");
  dire("le journal nomme aussi les deux reecritures",
    /« Alan » → « Allen »/.test(dit) && /« Elie » → « Eli »/.test(dit) ? "oui" : "non", "oui");

  /* --- c · la meme fusion arrive maintenant entiere --- */
  const SC = "sondeD775apres";
  commencer(SC);
  const ligneC = trouver(SC);
  ligneC[iLu] = "Alan";
  gs.initialiser();
  const rC = finir(SC);
  dire("la demande finale passe", rC.success, true);
  dire("« Description » est arrivee", lire(trouver(SC), "Description"), "ZZ-description");
  dire("et le nom du lecteur a suivi, il n'a pas ete perdu",
    lire(trouver(SC), "Lu par"), "Allen");
}

console.log("\n============================================================");
console.log(ko === 0 ? "TOUT TIENT : " + n + " / " + n : "DEFAUTS : " + ko + " sur " + n);
console.log("============================================================");
process.exit(ko === 0 ? 0 : 1);
