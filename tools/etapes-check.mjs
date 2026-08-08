/* LA PORTE DE DIAGNOSTIC EST FERMEE A CLE DEPUIS D-785 : le banc
   pose la sienne, comme le fera le vrai deploiement. */
const CLE_DIAG_BANC = "ZZ-cle-de-banc";
/* ============================================================
   LA SAUVEGARDE PROGRESSIVE — UNE SEULE LIGNE, QUI SE COMPLETE
   `node tools/etapes-check.mjs`

   POURQUOI CET OUTIL EXISTE.
   Le mecanisme demande a Code.gs de faire deux choses opposees
   avec la meme operation « retrouver une ligne par sa signature » :

     · un REESSAI RESEAU ne doit RIEN reecrire — la demande est
       deja traitee, on rend le meme resultat ;
     · une ETAPE SUIVANTE doit reecrire — c'est le meme visiteur,
       un peu plus loin.

   Les deux se ressemblent trait pour trait. Le seul juge est la
   presence de `_sid`. Se tromper de branche donne soit six lignes
   pour un visiteur, soit une ligne qui n'avance jamais — et les
   deux se voient seulement en relisant le classeur trois jours
   plus tard.

   CE QU'IL PROUVE, cas par cas : le nombre de LIGNES, le nombre de
   COURRIELS, et le contenu des colonnes. Les trois ensemble, parce
   qu'aucun ne suffit : une ligne juste avec six avis internes a
   brule le quota, et un quota intact sur six lignes a perdu le
   client.

   Il execute le VRAI `google/Code.gs`.
   ============================================================ */
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const { gs, etat } = await import(pathToFileURL(path.join(ICI, "faux-google.mjs")).href);

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

gs.initialiser();

function remise() {
  etat.courriels.length = 0;
  etat.evenements.length = 0;
  etat.quota = 100;
  for (const f of etat.feuilles.values()) {
    f.valeurs.length = Math.min(f.valeurs.length, 1);
    f.ecrites.clear(); f.formules.clear(); f.cases.clear();
    f.formatsTexte.length = 0; f.formatApresValeurs = 0;
  }
}


/* LE JETON DE SESSION SE GARDE ENTRE DEUX ENVOIS.  D-786
   C'est ce que fait localStorage dans le navigateur : sans ca le
   banc rejouerait le role de l'attaquant a chaque etape. */
const JETONS_BANC = new Map();
function avecJeton(c) {
  const sid = c && c._sid;
  if (!sid) return c;
  const j = JETONS_BANC.get(sid);
  return (j && c._jeton === undefined) ? Object.assign({}, c, { _jeton: j }) : c;
}
function retenirJeton(c, r) {
  if (c && c._sid && r && r.jeton) JETONS_BANC.set(c._sid, r.jeton);
  return r;
}
function poster(charge) {
  const c = avecJeton(charge);
  return retenirJeton(c, JSON.parse(gs.doPost({
    postData: { contents: JSON.stringify(c) }, parameter: {}
  }).getContent()));
}

const onglet = (nom) => etat.feuilles.get(nom);
function lignes(nom) {
  const f = onglet(nom);
  return f.valeurs.slice(1).filter((l) => (l || []).some((c) => c !== "" && c != null && c !== false));
}
function cellule(nom, ligne, titreCol) {
  const f = onglet(nom);
  const i = f.valeurs[0].indexOf(titreCol);
  return i === -1 ? "(colonne absente)" : String((f.valeurs[ligne] || [])[i] ?? "");
}

/* Un identifiant de session comme le navigateur en fabrique. */
let compteur = 0;
const sid = () => "sess" + String(++compteur).padStart(4, "0") + "abcdefgh";

/* ============================================================
   1 · TROIS ETAPES, UNE SEULE LIGNE
   ============================================================ */
titre("1 · TROIS ETAPES, UNE SEULE LIGNE");
{
  remise();
  const S = sid();

  const a = poster({ _form: "project", _sid: S, _etape: 1, _etapes: 6,
                     email: "zztest@exemple.ca", nom: "ZZTEST Marie" });
  verifier("etape 1 : acceptee", a.success, true);
  verifier("une ligne existe", lignes("Démarrer un projet").length, 1);
  verifier("elle dit ou en est le visiteur", cellule("Démarrer un projet", 1, "Étape"), "1 / 6");
  verifier("UN seul courriel : l'avis « quelqu'un a commence »", etat.courriels.length, 1);
  verifier("et il le dit dans son objet",
    /^COMMENCÉ/.test(String(etat.courriels[0].body)) || /commencé/i.test(String(etat.courriels[0].body)), true,
    "objet : " + etat.courriels[0].subject);
  verifier("rien n'est parti au visiteur",
    etat.courriels.filter((c) => c.to === "zztest@exemple.ca").length, 0);

  const b = poster({ _form: "project", _sid: S, _etape: 3, _etapes: 6,
                     email: "zztest@exemple.ca", nom: "ZZTEST Marie",
                     entreprise: "ZZTEST Garage", ville: "Québec" });
  verifier("etape 3 : acceptee", b.success, true);
  verifier("elle a mis a jour, pas insere", b.session, true);
  verifier("TOUJOURS une seule ligne", lignes("Démarrer un projet").length, 1);
  verifier("l'etape a avance", cellule("Démarrer un projet", 1, "Étape"), "3 / 6");
  verifier("l'entreprise est arrivee", cellule("Démarrer un projet", 1, "Entreprise"), "ZZTEST Garage");
  verifier("le nom de l'etape 1 est intact", cellule("Démarrer un projet", 1, "Nom"), "ZZTEST Marie");
  verifier("AUCUN courriel de plus", etat.courriels.length, 1);
}

/* ============================================================
   2 · UNE VALEUR VIDE N'EFFACE RIEN
   ============================================================ */
titre("2 · REVENIR EN ARRIERE N'EFFACE PAS CE QUI EST DEJA LA");
{
  remise();
  const S = sid();
  poster({ _form: "project", _sid: S, _etape: 3, _etapes: 6,
           email: "zztest@exemple.ca", nom: "ZZTEST Luc",
           entreprise: "ZZTEST Toiture", budget: "10 000 $ à 20 000 $" });

  /* Le visiteur recule et renvoie une charge PLUS PAUVRE : le
     navigateur n'envoie que l'etape courante. */
  poster({ _form: "project", _sid: S, _etape: 2, _etapes: 6,
           email: "zztest@exemple.ca", nom: "ZZTEST Luc",
           entreprise: "", budget: "" });

  verifier("une seule ligne", lignes("Démarrer un projet").length, 1);
  verifier("l'entreprise n'a PAS ete effacee",
    cellule("Démarrer un projet", 1, "Entreprise"), "ZZTEST Toiture",
    "une valeur vide ne touche a rien — sinon le classeur se vide a mesure");
  verifier("le budget non plus",
    cellule("Démarrer un projet", 1, "Budget"), "10 000 $ à 20 000 $");
  verifier("l'etape ne RECULE pas", cellule("Démarrer un projet", 1, "Étape"), "3 / 6",
    "reculer pour corriger n'est pas desapprendre");

  /* Mais une valeur NON VIDE ecrase bien. */
  poster({ _form: "project", _sid: S, _etape: 4, _etapes: 6,
           email: "zztest@exemple.ca", entreprise: "ZZTEST Toiture Rive-Sud" });
  verifier("une valeur non vide, elle, ecrase",
    cellule("Démarrer un projet", 1, "Entreprise"), "ZZTEST Toiture Rive-Sud");
}

/* ============================================================
   3 · LA FIN
   ============================================================ */
titre("3 · LA DERNIERE ETAPE");
{
  remise();
  const S = sid();
  poster({ _form: "project", _sid: S, _etape: 1, _etapes: 6,
           email: "zztest@exemple.ca", nom: "ZZTEST Fin" });
  etat.courriels.length = 0;

  /* LA CHARGE PORTE DE VRAIES REPONSES DEPUIS LE 2026-08-07.  D-774
     Elle portait `fourchette_vue: "10 000 $ à 20 000 $"` et rien
     d'autre : le navigateur calculait le montant et le serveur le
     recopiait. Il ne le recopie plus — il le CALCULE, a partir des
     reponses. Sans reponses, la colonne reste vide, et c'est juste. */
  const f = poster({ _form: "project", _sid: S, _etape: 6, _etapes: 6, _final: true,
                     email: "zztest@exemple.ca", nom: "ZZTEST Fin",
                     entreprise: "ZZTEST inc", budget: "10 000 $ à 20 000 $",
                     besoins: "Application ou logiciel",
                     ampleur: "Plus de 15 — une plateforme",
                     niveau_design: "Premium — identité forte, animations",
                     contenu: "Prêts — j’ai tout sous la main",
                     fonctions: "Plusieurs — comptes, tableau de bord, connexions",
                     echeancier: "D’ici 1 à 2 mois", nombre_employes: "11 à 50",
                     fourchette_vue: "ZZ-MENTEUR", prix_reaction: "Oui" });
  verifier("acceptee", f.success, true);
  verifier("une seule ligne, toujours", lignes("Démarrer un projet").length, 1);
  verifier("l'etape dit que c'est complet",
    cellule("Démarrer un projet", 1, "Étape"), "✓ complète");
  verifier("DEUX courriels : l'avis et la confirmation", etat.courriels.length, 2);
  verifier("le visiteur en recoit un",
    etat.courriels.filter((c) => c.to === "zztest@exemple.ca").length, 1);
  /* CE CAS VERROUILLAIT LE DEFAUT QU'ON VIENT DE CORRIGER.  D-774
     Il exigeait que le montant ENVOYE PAR LE NAVIGATEUR se retrouve
     au classeur — c'est-a-dire exactement ce qu'une requete forgee
     exploitait pour ecrire « 2 500 $ » sur un projet a 40 000. Il
     verifie maintenant les deux choses qui comptent : une vraie
     fourchette arrive, et ce n'est PAS celle qu'on a soufflee. */
  {
    const vue = String(cellule("Démarrer un projet", 1, "Fourchette vue"));
    verifier("une vraie fourchette est enregistree",
      /^\d[\d\s\u00a0]*\$ à \d[\d\s\u00a0]*\$/.test(vue) ? "une fourchette" : vue || "(vide)",
      "une fourchette");
    verifier("et ce n'est pas celle que le navigateur pretendait",
      vue.indexOf("ZZ-MENTEUR") === -1 ? "non" : "OUI", "non");
    verifier("la reponse la redescend au site",
      f.fourchette && f.fourchette.texte === vue ? "la meme" : "differente", "la meme");
  }
  verifier("sa reaction aussi", cellule("Démarrer un projet", 1, "Ça convient ?"), "Oui");
}

/* ============================================================
   4 · DEUX VISITEURS = DEUX LIGNES
   ============================================================ */
titre("4 · DEUX SESSIONS NE FUSIONNENT JAMAIS");
{
  remise();
  const A = sid(), B = sid();
  poster({ _form: "project", _sid: A, _etape: 1, _etapes: 6, email: "zztest@exemple.ca" });
  poster({ _form: "project", _sid: B, _etape: 1, _etapes: 6, email: "zztest@exemple.ca" });
  verifier("deux lignes", lignes("Démarrer un projet").length, 2,
    "meme courriel, sessions differentes : ce sont deux personnes");
  verifier("deux avis « commence »", etat.courriels.length, 2);
}

/* ============================================================
   5 · UNE SESSION QUI DORT
   ============================================================ */
titre("5 · UNE SESSION PEUT DORMIR DEUX JOURS");
{
  remise();
  const S = sid();
  poster({ _form: "project", _sid: S, _etape: 1, _etapes: 6,
           email: "zztest@exemple.ca", nom: "ZZTEST Dormeur" });

  /* On recule l'horodatage bien au-dela de la fenetre de
     dedoublonnage. Un CONDENSE ne se retrouverait plus ; une
     SESSION doit se retrouver quand meme. */
  const f = onglet("Démarrer un projet");
  const iDate = f.valeurs[0].indexOf("Horodatage");
  f.valeurs[1][iDate] = new Date(Date.now() - 3 * 86400000);

  poster({ _form: "project", _sid: S, _etape: 4, _etapes: 6,
           email: "zztest@exemple.ca", ville: "Trois-Rivières" });
  verifier("elle retrouve sa ligne trois jours plus tard",
    lignes("Démarrer un projet").length, 1,
    "la fenetre de dedoublonnage ne s'applique qu'aux condenses");
  verifier("et elle la complete", cellule("Démarrer un projet", 1, "Ville"), "Trois-Rivières");
}

/* ============================================================
   6 · LA RESERVATION EN SESSION
   ============================================================ */
titre("6 · UNE RESERVATION EN ETAPES POSE UN SEUL EVENEMENT");
{
  remise();
  const S = sid();
  const cr = JSON.parse(gs.doGet({ parameter: { action: "creneaux" } }).getContent());
  const jour = cr.jours.slice().sort((a, b) => b.creneaux.length - a.creneaux.length)[0];
  const plage = jour.creneaux[2];

  poster({ _form: "booking", _sid: S, _etape: 1, _etapes: 3,
           email: "zztest@exemple.ca", nom: "ZZTEST RDV", telephone: "418 555 0180" });
  verifier("etape 1 : la ligne existe deja", lignes("Réserver un appel").length, 1);
  verifier("AUCUN evenement pose", etat.evenements.length, 0,
    "on ne bloque pas une plage tant que le visiteur n'a pas confirme");

  etat.courriels.length = 0;
  const fin = poster({ _form: "booking", _sid: S, _etape: 3, _etapes: 3, _final: true,
                       email: "zztest@exemple.ca", nom: "ZZTEST RDV",
                       telephone: "418 555 0180", mode: "Appel téléphonique",
                       plage_iso: plage.iso, sujet: "essai en etapes" });
  verifier("la confirmation passe", fin.success, true, fin.message || "");
  verifier("TOUJOURS une seule ligne", lignes("Réserver un appel").length, 1,
    "c'est ici que le mecanisme pouvait en creer une seconde");
  verifier("UN evenement, et un seul", etat.evenements.length, 1);
  verifier("son titre dit quoi faire",
    /^☎ Appeler /.test(String(etat.evenements[0].titre)), true,
    "titre : " + etat.evenements[0].titre);
  verifier("la ligne porte l'evenement",
    cellule("Réserver un appel", 1, "Événement") !== "", true);
  verifier("deux courriels a la fin", etat.courriels.length, 2);
}

/* ============================================================
   7 · CE QUI DOIT ENCORE ETRE REFUSE
   ============================================================ */
titre("7 · LA SESSION N'OUVRE PAS LA PORTE A N'IMPORTE QUOI");
{
  remise();
  const r1 = poster({ _form: "project", _sid: "x", _etape: 1, _etapes: 6,
                      email: "zztest@exemple.ca" });
  verifier("un identifiant trop court est refuse", r1.success, false, r1.message);

  const r2 = poster({ _form: "project", _sid: "<script>alert(1)</script>aaaa",
                      _etape: 1, _etapes: 6, email: "zztest@exemple.ca" });
  verifier("un identifiant qui n'est pas un identifiant aussi", r2.success, false, r2.message);

  const r3 = poster({ _form: "project", _sid: sid(), _etape: 1, _etapes: 6 });
  verifier("une etape sans le minimum vital est refusee", r3.success, false,
    "sans courriel, on ne pourrait meme pas rappeler : " + r3.message);

  const r4 = poster({ _form: "project", _sid: sid(), _etape: 1, _etapes: 6,
                      email: "zztest@exemple.ca" });
  verifier("mais le minimum vital SUFFIT en cours de route", r4.success, true,
    "c'est tout l'interet : capter l'abandon");

  const r5 = poster({ _form: "project", _sid: sid(), _etape: 6, _etapes: 6, _final: true,
                      email: "zztest@exemple.ca" });
  verifier("a la FIN, le jeu complet est exige", r5.success, false, r5.message);

  /* Le honeypot passe avant tout le reste, session ou pas. */
  const avant = lignes("Démarrer un projet").length;
  const r6 = poster({ _form: "project", _sid: sid(), _etape: 1, _etapes: 6,
                      email: "zztest@exemple.ca", _gotcha: "robot" });
  verifier("le honeypot se jette en silence", r6.ignore, true);
  verifier("et n'ecrit rien", lignes("Démarrer un projet").length, avant);
}

/* ============================================================
   8 · UN REESSAI RESEAU N'EST PAS UNE ETAPE
   ============================================================ */
titre("8 · LE MEME ENVOI DEUX FOIS N'AVANCE RIEN");
{
  remise();
  const S = sid();
  const charge = { _form: "project", _sid: S, _etape: 2, _etapes: 6,
                   email: "zztest@exemple.ca", nom: "ZZTEST Double" };
  poster(charge);
  const deux = poster(charge);
  verifier("une seule ligne", lignes("Démarrer un projet").length, 1);
  verifier("l'etape n'a pas bouge", cellule("Démarrer un projet", 1, "Étape"), "2 / 6");
  verifier("aucun champ n'a change", deux.champs, 0);
  verifier("un seul avis interne", etat.courriels.length, 1,
    "un reessai ne re-avertit pas");
}

/* ============================================================
   9 · SANS `_sid`, RIEN NE CHANGE
   ============================================================ */
titre("9 · LES FORMULAIRES SANS ETAPES SE COMPORTENT COMME AVANT");
{
  remise();
  const c = { _form: "contact", nom: "ZZTEST Simple", email: "zztest@exemple.ca",
              telephone: "418 555 0190", message: "un message" };
  poster(c);
  verifier("une ligne", lignes("Contact simple").length, 1);
  verifier("deux courriels tout de suite", etat.courriels.length, 2,
    "pas d'etapes, donc pas d'attente : avis + confirmation");
  verifier("la colonne Étape reste vide", cellule("Contact simple", 1, "Étape"), "");

  const r = poster(c);
  verifier("le renvoi est toujours reconnu", r.renvoi, true);
  verifier("toujours une ligne", lignes("Contact simple").length, 1);
  verifier("et toujours deux courriels", etat.courriels.length, 2);
}

/* ============================================================
   10 · LE CLASSEUR RESTE LISIBLE
   ============================================================ */
titre("10 · CE QU'ON VOIT EN OUVRANT L'ONGLET");
{
  remise();
  const S = sid();
  poster({ _form: "project", _sid: S, _etape: 2, _etapes: 6,
           email: "zztest@exemple.ca", nom: "ZZTEST Vue" });

  const d = JSON.parse((etat.proprietes.DIAG_CLE = CLE_DIAG_BANC, gs.doGet({ parameter: { action: "diag", cle: CLE_DIAG_BANC } })).getContent());
  const o = d.onglets.find((x) => x.onglet === "Démarrer un projet");
  /* « Notes internes » A QUITTE LA TETE.  D-759
     Elle etait cinquieme et large de 340 px : les six colonnes de
     tete en mangeaient 1 010 sur les 1 440 d'un ecran, et il ne
     restait la place que du nom. Elle ferme maintenant la demande. */
  verifier("les quatre colonnes de suivi ouvrent l'onglet",
    o.titres.slice(0, 4).join("|"), "Vu|Lu par|Rappelé par|Statut");
  /* LES COLONNES DE SERVICE SE LISENT, ELLES NE SE COMPTENT PAS.
     « Étape en E » et « Horodatage en F » etaient des positions
     apprises par coeur : D-764 en a insere deux entre les deux, et
     les cas ont accuse un classeur parfaitement conforme. Ce qui
     doit tenir, c'est l'ORDRE — l'etape ouvre, l'horodatage ferme. */
  const iEtape = o.titres.indexOf("Étape");
  const iHoro = o.titres.indexOf("Horodatage");
  verifier("« Étape » ouvre les colonnes de service", iEtape, 4);
  verifier("« Horodatage » les ferme", iHoro > iEtape, true);
  verifier("la demande commence juste apres", o.titres[iHoro + 1], "Nom");
  verifier("« Notes internes » ferme la demande",
    o.titres.slice(-3).join("|"), "Notes internes|Renvois|Signature");

  const l = o.lignesEssai[0];
  const vu = l.cellules[0];
  verifier("« Vu » est une case, pas du texte", vu.valeur, "false",
    "une case decochee vaut FALSE — c'est pour ca que la regle de couleur ne peut plus tester A");
  verifier("le statut est pose d'office",
    l.cellules.find((c) => c.titre === "Statut").valeur, "Nouveau");
  /* LA LETTRE SE CALCULE, ELLE NE S'ECRIT PAS.  D-759
     Elle etait ecrite « G » en dur. Deplacer une colonne de suivi a
     donc fait tomber ce cas alors que le code, lui, avait raison :
     `colonneExistence` lit la position d'« Horodatage ». Un test qui
     connait la reponse par coeur accuse le code a chaque
     reorganisation, et finit par etre desactive. */
  const lettreHoro = String.fromCharCode(65 + o.titres.indexOf("Horodatage"));
  verifier("la regle de couleur teste la colonne de l'horodatage (" + lettreHoro + ")",
    new RegExp("\\$" + lettreHoro + "2<>\"\"").test(o.regles[0].formule), true,
    "formule : " + o.regles[0].formule);
}

/* ============================================================
   11 · LE NETTOYAGE RECONNAIT CE QUE LE SITE A POSE

   AUCUN TEST NE COUVRAIT CETTE FONCTION, et une mutation l'a
   montre le 2026-08-06 : changer les titres d'evenement de
   « Appel ADEXWEB · Nom » a « ☎ Appeler Nom » faisait cesser
   `nettoyerRendezVousEssai` de reconnaitre quoi que ce soit. Elle
   rendait « 0 evenement retire » sans une erreur — indiscernable
   d'un agenda deja propre (piege 30).
   ============================================================ */
titre("11 · LE NETTOYAGE DES EVENEMENTS D'ESSAI");
{
  remise();
  const cr = JSON.parse(gs.doGet({ parameter: { action: "creneaux" } }).getContent());
  const jour = cr.jours.slice().sort((a, b) => b.creneaux.length - a.creneaux.length)[0];

  /* Deux rendez-vous d'essai, un par mode — ce sont les deux
     formes de titre. */
  poster({ _form: "booking", nom: "ZZTEST Tel", email: "zztest@exemple.ca",
           telephone: "418 555 0191", mode: "Appel téléphonique",
           plage_iso: jour.creneaux[0].iso, sujet: "essai" });
  poster({ _form: "booking", nom: "ZZTEST Meet", email: "zztest@exemple.ca",
           telephone: "418 555 0192", mode: "Google Meet",
           plage_iso: jour.creneaux[2].iso, sujet: "essai" });

  /* ET UN EVENEMENT PERSONNEL, qui porte lui aussi un marqueur
     d'essai. Il ne doit PAS etre touche : c'est la double condition
     — marqueur ET titre du site — qui protege l'agenda. */
  etat.evenements.push({
    titre: "Dentiste (ZZTEST)", debut: new Date(jour.creneaux[6].iso),
    fin: new Date(new Date(jour.creneaux[6].iso).getTime() + 1800000)
  });

  verifier("trois evenements au calendrier", etat.evenements.length, 3);
  const rapport = gs.nettoyerRendezVousEssai();
  verifier("les DEUX rendez-vous du site sont retires",
    etat.evenements.length, 1,
    String(rapport).split("\n")[0]);
  verifier("l'evenement personnel est intact",
    String(etat.evenements[0].titre), "Dentiste (ZZTEST)",
    "marqueur ET titre du site : les deux sont exiges");
}

console.log("");
console.log("============================================================");
console.log(`LES ETAPES : ${cas - echecs} / ${cas}`);
console.log("============================================================");
process.exit(echecs ? 1 : 0);
