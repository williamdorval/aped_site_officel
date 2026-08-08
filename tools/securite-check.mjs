/* ============================================================
   CE QUI TIENT LA PORTE — `node tools/securite-check.mjs`

   POURQUOI CET OUTIL EXISTE.

   Le 2026-08-06, l'injection de formule (D-757) a ete trouvee
   OUVERTE contre le vrai Google, apres des mois passes a croire le
   contraire. La lecon n'etait pas « il manquait un correctif » :
   c'est que PERSONNE n'avait jamais ecrit la liste de ce que le
   service est cense refuser. Chaque protection vivait dans un
   commentaire, aucune n'avait de temoin.

   Ce fichier est cette liste. Une ligne par chose qu'un inconnu
   pourrait tenter depuis l'exterieur, et la preuve que le service
   la refuse — ou, quand il l'accepte, la preuve de ce qu'il en
   fait exactement.

   IL EXECUTE LE VRAI `google/Code.gs`. Les fonctions appelees sont
   celles qui repondront en production, ligne pour ligne.

   CE QU'IL NE PROUVE PAS, ET C'EST ECRIT ICI POUR QU'ON NE
   L'OUBLIE PAS : que le vrai Google se comporte comme le bouchon.
   Le banc a deja menti une fois, exactement la-dessus. Les points
   qui touchent au moteur de Sheets se prouvent contre le vrai
   service, par `tools/parcours-prod.mjs`.
   ============================================================ */
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const { gs, etat } = await import(pathToFileURL(path.join(ICI, "faux-google.mjs")).href);

gs.initialiser();

let n = 0, ko = 0;
function dire(nom, obtenu, attendu, note) {
  n++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) ko++;
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + nom
    + "\n         obtenu  : " + obtenu
    + "\n         attendu : " + attendu
    + (note ? "\n         " + note : ""));
}
function titre(t) { console.log(""); console.log("--- " + t); }


/* LE JETON DE SESSION SE GARDE ENTRE DEUX ENVOIS.  D-786
   Le serveur le rend avec chaque reponse de session et l'exige a
   la suivante ; le navigateur le garde en localStorage. Un banc qui
   ne le garde pas ne teste plus la sauvegarde progressive, il
   rejoue le role de l'attaquant a chaque etape.

   Un `_jeton: null` dans une charge veut dire « n'en mets pas » —
   et c'est ce dont les cas d'attaque ont besoin pour rester des
   attaques. */
const JETONS_BANC = new Map();
function avecJeton(c) {
  const sid = c && c._sid;
  if (!sid) return c;
  if (c._jeton === null) { const q = Object.assign({}, c); delete q._jeton; return q; }
  const j = JETONS_BANC.get(sid);
  return (j && c._jeton === undefined) ? Object.assign({}, c, { _jeton: j }) : c;
}
function retenirJeton(c, r) {
  if (c && c._sid && r && r.jeton) JETONS_BANC.set(c._sid, r.jeton);
  return r;
}
const poster = (c) => { const q = avecJeton(c); return retenirJeton(q, JSON.parse(
  gs.doPost({ postData: { contents: JSON.stringify(q) }, parameter: {} }).getContent())); };
const porte = (p) => JSON.parse(gs.doGet({ parameter: p }).getContent());

/* Avancer le temps du cache, sans toucher aux dates du banc. */
const avancer = (s) => { etat.decalageHorloge += s * 1000; };

const lignes = (onglet) => {
  const f = etat.feuilles.get(onglet);
  return f ? f.valeurs.slice(1).filter((r) => r.some((c) => c !== "" && c != null)) : [];
};
const colonne = (kind, titreCol) =>
  gs.colonnes(kind).map((c) => c.titre).indexOf(titreCol);

/* LA REMISE A ZERO NE TOUCHE PAS AU CACHE, ET C'EST VOULU : les
   compteurs de debit doivent pouvoir traverser un cas. Chaque cas
   qui en a besoin vide la cle qui le concerne, et le dit. */
function remise() {
  etat.courriels.length = 0;
  etat.evenements.length = 0;
  etat.fichiersDrive.length = 0;
  etat.quota = 100;
  for (const f of etat.feuilles.values()) {
    f.valeurs.length = Math.min(f.valeurs.length, 1);
    f.formules.clear();
  }
}
function viderDebit() {
  etat.cache = {};
  etat.decalageHorloge = 0;
}

console.log("============================================================");
console.log("CE QUI TIENT LA PORTE");
console.log("============================================================");


/* ============================================================
   1 · LA PORTE DES CRENEAUX NE DIT QUE DES HEURES
   ============================================================ */
titre("1 · LA PORTE PUBLIQUE DES CRENEAUX NE FUIT RIEN");
{
  remise(); viderDebit();

  /* On remplit l'agenda de choses qu'un inconnu aimerait lire. */
  const dans3j = new Date(Date.now() + 3 * 86400000);
  etat.evenements.push({
    titre: "Rachat de la boulangerie Lantagne — 240 000 $",
    description: "offre a 210, plancher 195, ne pas mentionner le vendeur",
    lieu: "3 rue des Erables, Levis",
    invites: ["notaire@exemple.ca", "banquier@exemple.ca"],
    debut: dans3j, fin: new Date(dans3j.getTime() + 3600000)
  });

  avancer(200);
  const brut = JSON.stringify(porte({ action: "creneaux" }));

  dire("aucun titre d'evenement dans la reponse", /Lantagne|boulangerie/i.test(brut), false);
  dire("aucune description", /plancher|ne pas mentionner/i.test(brut), false);
  dire("aucun lieu", /Erables|Levis/i.test(brut), false);
  dire("aucun invite", /notaire|banquier/i.test(brut), false);
  dire("aucune adresse courriel, d'aucune sorte", /@/.test(brut), false);

  /* CE QU'ELLE REND, ET RIEN D'AUTRE. Une porte qui ne rendrait
     rien serait « sure » et inutile : on verifie donc AUSSI qu'elle
     rend bien ce dont le site a besoin. */
  const rep = porte({ action: "creneaux" });
  const clesJour = Object.keys(rep.jours[0]).sort().join(",");
  const clesCreneau = Object.keys(rep.jours[0].creneaux[0]).sort().join(",");
  dire("un jour ne porte que date/libelle/libelleLong/creneaux",
    clesJour, "creneaux,date,libelle,libelleLong");
  dire("un creneau ne porte que l'instant et l'heure lisible", clesCreneau, "h,iso");
}


/* ============================================================
   2 · LA PORTE DES CRENEAUX NE PEUT PLUS ETRE MARTELEE
   ============================================================ */
titre("2 · LE CACHE DES CRENEAUX (D-758)");
{
  remise(); viderDebit();

  const a = porte({ action: "creneaux" });
  const jour = a.jours.slice().sort((x, y) => y.creneaux.length - x.creneaux.length)[0];

  /* ON BLOQUE LA JOURNEE, PUIS ON REDEMANDE TOUT DE SUITE. Si la
     reponse change, c'est que rien n'a ete garde : l'agenda est
     relu a chaque appel, et 1 600 appels tuent le script pour la
     journee — formulaires compris. */
  etat.evenements.push({ titre: "bloque", jour: jour.date });
  const b = porte({ action: "creneaux" });
  dire("deux appels de suite : le second sort du cache",
    JSON.stringify(b) === JSON.stringify(a), true,
    "l'agenda a change entre les deux, la reponse non");

  /* ET IL EXPIRE. Un cache eternel afficherait indefiniment un
     creneau bloque la veille. */
  avancer(120);
  const c = porte({ action: "creneaux" });
  dire("apres 120 s, la porte relit l'agenda",
    (c.jours.find((x) => x.date === jour.date) || { creneaux: [] }).creneaux.length, 0);

  /* ET UNE RESERVATION LE VIDE TOUT DE SUITE. Sans ca, la plage
     prise resterait offerte jusqu'a 90 s, et le visiteur suivant
     remplirait tout le formulaire pour se faire dire non. */
  etat.evenements.length = 0;
  avancer(120);
  const d = porte({ action: "creneaux" });
  const j2 = d.jours.slice().sort((x, y) => y.creneaux.length - x.creneaux.length)[0];
  const iso = j2.creneaux[3].iso;
  const heure = j2.creneaux[3].h;

  const rdv = poster({
    _form: "booking", nom: "ZZTEST Cache", email: "zztest@exemple.ca",
    telephone: "418 555 0188", mode: "Appel téléphonique",
    plage_iso: iso, sujet: "vider le cache"
  });
  dire("la reservation passe", rdv.success, true);

  const e = porte({ action: "creneaux" });
  const restant = (e.jours.find((x) => x.date === j2.date) || { creneaux: [] })
    .creneaux.map((x) => x.h);
  dire("le creneau reserve a disparu SANS attendre l'expiration",
    restant.includes(heure), false,
    "cache vide par oublierCreneaux(), pas par le temps");
}


/* ============================================================
   3 · LE DEBIT D'UNE SESSION
   ============================================================ */
titre("3 · UN _sid NE PEUT PLUS MARTELER (D-758)");
{
  remise(); viderDebit();

  const sid = "ZZTESTdebitsession01";
  const base = {
    _form: "contact", _sid: sid, nom: "ZZTEST Debit",
    email: "zztest@exemple.ca", message: "envoi numero "
  };

  let refuseA = 0;
  for (let i = 1; i <= gs.REGLAGES.DEBIT_SESSION_MAX + 3; i++) {
    const r = poster(Object.assign({}, base, { message: "envoi numero " + i }));
    if (r.success === false && /Trop d’envois/.test(r.message || "")) { refuseA = i; break; }
  }
  dire("le plafond tombe au " + (gs.REGLAGES.DEBIT_SESSION_MAX + 1) + "e envoi",
    refuseA, gs.REGLAGES.DEBIT_SESSION_MAX + 1);

  /* ET IL NE PUNIT QUE CETTE SESSION-LA. Un plafond partage
     laisserait un robot fermer le formulaire a tout le monde. */
  const autre = poster({
    _form: "contact", _sid: "ZZTESTautresession02", nom: "ZZTEST Voisin",
    email: "zztest@exemple.ca", message: "je passe encore"
  });
  dire("une autre session passe toujours", autre.success, true);
}


/* ============================================================
   4 · LE PLAFOND D'AVIS N'EFFACE PAS LA DEMANDE
   ============================================================ */
titre("4 · AU PLAFOND D'AVIS, LA LIGNE S'ECRIT QUAND MEME (D-758)");
{
  remise(); viderDebit();

  /* On amene le compteur d'avis a son plafond avec des demandes
     completes, chacune neuve. */
  for (let i = 0; i < gs.REGLAGES.DEBIT_AVIS_MAX; i++) {
    poster({ _form: "contact", nom: "ZZTEST Foule " + i,
      email: "zztest@exemple.ca", message: "demande numero " + i });
  }
  const avant = lignes("Contact simple").length;
  const courrielsAvant = etat.courriels.length;

  const debordee = poster({ _form: "contact", nom: "ZZTEST Vraie cliente",
    email: "zztest@exemple.ca", message: "je suis une vraie demande" });

  dire("la demande de trop n'est PAS refusee", debordee.success, true,
    "refuser, c'est offrir a un robot le moyen de fermer le formulaire");
  dire("sa ligne est bel et bien ecrite", lignes("Contact simple").length, avant + 1);
  dire("aucun courriel n'est parti", etat.courriels.length, courrielsAvant);

  const iNotes = colonne("contact", "Notes internes");
  const derniere = lignes("Contact simple")[0];
  dire("le classeur DIT que personne n'a ete prevenu",
    /AUCUN AVIS ENVOYÉ/.test(String(derniere[iNotes] || "")), true,
    "sinon la demande a l'air d'un oubli de rappel");

  /* LE PLAFOND DUR, LUI, REFUSE — mais il est sept fois plus haut. */
  dire("le plafond dur est bien au-dessus du plafond d'avis",
    gs.REGLAGES.DEBIT_LIGNES_MAX > gs.REGLAGES.DEBIT_AVIS_MAX * 3, true,
    gs.REGLAGES.DEBIT_LIGNES_MAX + " contre " + gs.REGLAGES.DEBIT_AVIS_MAX);
}


/* ============================================================
   4bis · LE `_sid` VOLE N'ECRIT PLUS RIEN  (D-786)

   C'ETAIT LA SEULE ECRITURE ARBITRAIRE QUI RESTAIT. `_sid` est
   fabrique par le navigateur et n'etait signe par personne :
   quiconque connaissait celui d'un autre pouvait poster dans SA
   ligne — ecraser son nom, son telephone, son courriel, et
   detourner le rappel vers soi. Aucune lecture n'etait possible et
   les colonnes figees resistaient, mais un lead pouvait etre
   corrompu.

   ET IL ALLAIT FUIR : `lienReprise()` met le `_sid` EN CLAIR dans
   l'URL d'un courriel de relance.
   ============================================================ */
titre("4bis · UN `_sid` VOLE N'ECRIT PLUS RIEN (D-786)");
{
  remise(); viderDebit();
  const SID = "ZZTESTvictime001";

  /* --- la victime commence son formulaire --- */
  const r1 = poster({ _form: "estimate", _sid: SID, _etape: 2, _etapes: 7,
    nom: "ZZTEST Victime", email: "zztest@exemple.ca", telephone: "418 555 0100" });
  dire("la victime ecrit sa premiere etape", r1.success, true);
  dire("et le serveur lui rend un jeton", typeof r1.jeton === "string" && r1.jeton.length > 10, true);
  dire("le jeton n'est PAS le `_sid`", r1.jeton === SID, false);
  dire("ni un prefixe du `_sid`", String(r1.jeton).indexOf(SID) !== -1, false,
    "un jeton qu'on deduit du sid ne protege rien");

  const ligneAvant = JSON.parse(JSON.stringify(
    etat.feuilles.get(gs.SCHEMA.estimate.onglet).valeurs[1]));

  /* --- l'attaquant connait le `_sid`, pas le jeton --- */
  const att = poster({ _form: "estimate", _sid: SID, _etape: 3, _etapes: 7,
    _jeton: null,
    nom: "PIRATE", email: "pirate@evil.ca", telephone: "9999999999" });
  dire("l'attaquant qui connait le `_sid` est REFUSE", att.success, false, att.message);
  dire("le message ne dit pas CE QUI a echoue",
    /jeton|signature|existe/i.test(String(att.message || "")), false,
    "sinon il apprend lesquels de ses sid devines correspondent a une vraie ligne");

  /* --- et un faux jeton ne marche pas mieux --- */
  const faux = poster({ _form: "estimate", _sid: SID, _etape: 3, _etapes: 7,
    _jeton: "n-importe-quoi-de-la-bonne-longueur-ou-presque",
    nom: "PIRATE2", email: "pirate2@evil.ca", telephone: "8888888888" });
  dire("un faux jeton est refuse aussi", faux.success, false);

  const ligneApres = etat.feuilles.get(gs.SCHEMA.estimate.onglet).valeurs[1];
  dire("la ligne de la victime n'a pas bouge d'un caractere",
    JSON.stringify(ligneApres), JSON.stringify(ligneAvant),
    "c'est la seule chose qui compte : ni le nom, ni le telephone, ni le courriel");

  /* --- la victime, elle, continue --- */
  const r2 = poster({ _form: "estimate", _sid: SID, _etape: 4, _etapes: 7, _jeton: r1.jeton,
    nom: "ZZTEST Victime", email: "zztest@exemple.ca", telephone: "418 555 0100",
    type_projet: "Un site web" });
  dire("la victime, avec son jeton, continue normalement", r2.success, true);
  dire("et c'est toujours la MEME ligne", r2.ligne, r1.ligne,
    "un correctif de securite qui casse la sauvegarde progressive est un correctif rate");

  /* --- un `_sid` inconnu cree sa propre ligne, sans jeton ---
     LE COMPTE DE LIGNES EST L'ARBITRE, PAS LE NUMERO RENDU. Un
     premier jet comparait `neuf.ligne` a `r1.ligne` : deux visiteurs
     dont les demandes se dedoublonnent par CONTENU peuvent tomber
     sur la meme ligne pour une raison qui n'a rien a voir avec le
     jeton, et le cas accusait alors un code sain. Ce qui compte est
     qu'une ligne DE PLUS existe, et que celle de la victime n'ait
     pas bouge — ce que le cas d'au-dessus prouve deja. */
  const avantN = lignes(gs.SCHEMA.estimate.onglet).length;
  const neuf = poster({ _form: "estimate", _sid: "ZZTESTinconnu0001", _etape: 2, _etapes: 7,
    _jeton: null, nom: "ZZTEST Neuf", email: "zzautre@exemple.ca", telephone: "418 555 0101" });
  dire("un `_sid` jamais vu ecrit sans jeton, et en recoit un", neuf.success, true);
  dire("et il en recoit un a son tour", typeof neuf.jeton === "string" && neuf.jeton.length > 10, true);
  dire("le sien n'est pas celui de la victime", neuf.jeton === r1.jeton, false);
  dire("une ligne de PLUS existe", lignes(gs.SCHEMA.estimate.onglet).length, avantN + 1);
}


/* ============================================================
   5 · LES PIECES JOINTES
   ============================================================ */
titre("5 · CE QUI ENTRE DANS LE DRIVE DE L'AGENCE (D-758)");
{
  remise(); viderDebit();

  const projet = (pieces, sid) => poster({
    _form: "project", _sid: sid, _final: true,
    nom: "ZZTEST Pieces", email: "zztest@exemple.ca", telephone: "418 555 0177",
    entreprise: "ZZTEST inc", ville: "Levis", budget: "10 000 $ et plus",
    description: "des fichiers",
    _fichiers: pieces
  });

  const b64 = "QUJD";

  projet([{ nom: "devis.pdf", base64: b64, type: "application/pdf" }], "ZZTESTpieces0001");
  dire("un PDF passe", etat.fichiersDrive.length, 1);

  const av = etat.fichiersDrive.length;
  projet([{ nom: "facture.pdf.exe", base64: b64, type: "application/pdf" }], "ZZTESTpieces0002");
  dire("un .exe deguise en PDF est REFUSE", etat.fichiersDrive.length, av,
    "le type annonce par l'appelant ne decide de rien, l'extension du nom si");

  projet([{ nom: "porte.jsp", base64: b64, type: "text/plain" }], "ZZTESTpieces0003");
  dire("un fichier de script est refuse", etat.fichiersDrive.length, av);

  projet([{ nom: "sans-extension", base64: b64, type: "text/plain" }], "ZZTESTpieces0004");
  dire("un fichier sans extension est refuse", etat.fichiersDrive.length, av);

  /* LE NOMBRE. Quatre cents fichiers d'un kilo tenaient sous les
     huit megaoctets et faisaient quatre cents creations Drive. */
  const beaucoup = [];
  for (let i = 0; i < gs.REGLAGES.PIECES_MAX_NOMBRE + 1; i++) {
    beaucoup.push({ nom: "p" + i + ".png", base64: b64, type: "image/png" });
  }
  const avN = etat.fichiersDrive.length;
  projet(beaucoup, "ZZTESTpieces0005");
  dire("au-dela de " + gs.REGLAGES.PIECES_MAX_NOMBRE + " pieces, aucune n'est televersee",
    etat.fichiersDrive.length, avN);

  /* LE NOM. Il finit dans un courriel et dans une cellule. */
  const avNom = etat.fichiersDrive.length;
  projet([{ nom: "logo\n\nBcc: espion@exemple.ca.png", base64: b64, type: "image/png" }],
    "ZZTESTpieces0006");
  dire("un nom a retours de ligne est televerse assaini",
    etat.fichiersDrive.length, avNom + 1);
  const dernier = etat.fichiersDrive[etat.fichiersDrive.length - 1];
  dire("et il ne contient plus aucun retour de ligne",
    /[\r\n]/.test(String(dernier && dernier.nom || "")), false,
    "nom retenu : " + (dernier && dernier.nom));
}


/* ============================================================
   5bis · L'OCTET NUL, LE SVG, ET LA PORTE DE DIAGNOSTIC  (D-785)
   ============================================================ */
titre("5bis · CE QUI PASSAIT ENCORE (D-785)");
{
  remise(); viderDebit();
  const b64 = "QUJD";
  const projet = (pieces, sid) => poster({
    _form: "project", _sid: sid, _final: true,
    nom: "ZZTEST Nul", email: "zztest@exemple.ca", telephone: "418 555 0177",
    entreprise: "ZZTEST inc", ville: "Levis", budget: "10 000 $ et plus",
    description: "des fichiers", _fichiers: pieces
  });

  /* L'OCTET NUL COUPE LE NOM EN DEUX. L'extension jugee est celle
     d'APRES le NUL — « png » — mais tout consommateur qui tronque a
     \0 lit « evil.svg ». Le filtre etait contourne par un caractere
     invisible. */
  const avNul = etat.fichiersDrive.length;
  projet([{ nom: "evil.svg .png", base64: b64, type: "image/png" }], "ZZTESTnul00001");
  dire("un nom a octet NUL est refuse", etat.fichiersDrive.length, avNul,
    "dernier retenu : " + JSON.stringify((etat.fichiersDrive[etat.fichiersDrive.length - 1] || {}).nom));

  /* ET LES AUTRES CARACTERES DE CONTROLE AVEC LUI. */
  const avEsc = etat.fichiersDrive.length;
  projet([{ nom: "logo[2J.png", base64: b64, type: "image/png" }], "ZZTESTnul00002");
  dire("un nom a caractere d'echappement est refuse", etat.fichiersDrive.length, avEsc);

  /* MAIS PAS LE SAUT DE LIGNE : un nom colle depuis un courriel en
     porte, et le refuser ferait perdre une piece legitime. Il se
     nettoie, comme avant. */
  const avSaut = etat.fichiersDrive.length;
  projet([{ nom: "logo\nBcc: x@y.ca.png", base64: b64, type: "image/png" }], "ZZTESTnul00003");
  dire("un nom a saut de ligne passe, assaini", etat.fichiersDrive.length, avSaut + 1);

  /* LE SVG EST UN DOCUMENT, PAS UNE IMAGE. Il peut porter un
     `<script>` qui s'execute quand Drive en fait l'apercu. */
  const avSvg = etat.fichiersDrive.length;
  projet([{ nom: "logo.svg", base64: b64, type: "image/svg+xml" }], "ZZTESTnul00004");
  dire("un SVG est refuse", etat.fichiersDrive.length, avSvg,
    "il peut contenir un script, et Drive l'ouvre dans un navigateur");
  dire("il n'est plus dans la liste des extensions",
    gs.REGLAGES.PIECES_EXTENSIONS.indexOf("svg"), -1);

  /* ET CE QUI DOIT PASSER PASSE ENCORE. Un correctif de securite
     qui ferme la porte aux clients est un correctif rate. */
  const avOk = etat.fichiersDrive.length;
  projet([{ nom: "logo.png", base64: b64, type: "image/png" }], "ZZTESTnul00005");
  dire("un PNG normal passe toujours", etat.fichiersDrive.length, avOk + 1);
}

/* ============================================================
   5ter · LA PORTE DE DIAGNOSTIC  (D-785)
   ============================================================ */
titre("5ter · LA PORTE DE DIAGNOSTIC EST FERMEE A CLE (D-785)");
{
  const lire = (p) => {
    const r = gs.doGet({ parameter: p });
    try { return JSON.parse(r.getContent()); } catch (e) { return { erreurLecture: String(e) }; }
  };

  /* SANS CLE POSEE, ELLE REFUSE — et elle ne rend pas une version
     allegee : un diagnostic partiel qu'un outil prendrait pour un
     diagnostic complet est le « vert sur du vide » qu'on chasse. */
  delete etat.proprietes.DIAG_CLE;
  const sans = lire({ action: "diag" });
  dire("sans cle posee, elle refuse", sans.success, false);
  dire("et elle dit comment en poser une", /DIAG_CLE/.test(sans.message || ""), true);
  dire("elle ne rend NI quota NI onglets", "quota" in sans || "onglets" in sans, false,
    JSON.stringify(Object.keys(sans)));

  etat.proprietes.DIAG_CLE = "ZZ-cle-d-essai";
  const fausse = lire({ action: "diag", cle: "pas-la-bonne" });
  dire("avec une mauvaise cle, elle refuse", fausse.success, false);
  dire("et elle ne fuit toujours rien", "quota" in fausse || "onglets" in fausse, false);

  const sansCle = lire({ action: "diag" });
  dire("cle posee mais absente de la requete, elle refuse", sansCle.success, false);

  const bonne = lire({ action: "diag", cle: "ZZ-cle-d-essai" });
  dire("avec la bonne cle, elle repond", bonne.success, true);
  dire("et elle rend bien les onglets", Array.isArray(bonne.onglets), true);

  /* LA PORTE DES CRENEAUX, ELLE, RESTE OUVERTE — le site en a
     besoin a chaque visite, et elle ne rend que des heures libres. */
  const cr = gs.doGet({ parameter: { action: "creneaux" } });
  dire("la porte des creneaux reste ouverte", !!cr.getContent(), true);
}


/* ============================================================
   6 · UNE RESERVATION FORGEE
   ============================================================ */
titre("6 · CE QU'UNE REQUETE FORGEE NE PEUT PAS RESERVER");
{
  remise(); viderDebit();
  avancer(200);

  /* SANS `_sid`, ET C'EST LE POINT. Une reservation en cours de
     session ne pose son evenement qu'a la confirmation : envoyer un
     `_sid` sans `_final` ferait ecrire une ligne sans jamais
     toucher au calendrier, et les quatre cas ci-dessous
     passeraient tous en ne prouvant rien. */
  const rdv = (iso, quoi) => poster({
    _form: "booking", nom: "ZZTEST Forge " + quoi, email: "zztest@exemple.ca",
    telephone: "418 555 0199", mode: "Appel téléphonique",
    plage_iso: iso, sujet: "forge " + quoi
  });

  const hier = new Date(Date.now() - 86400000).toISOString();
  dire("une plage dans le PASSE est refusee", rdv(hier, "passe").success, false);

  const dansDixAns = new Date(Date.now() + 3650 * 86400000).toISOString();
  dire("une plage dans dix ans est refusee", rdv(dansDixAns, "loin").success, false);

  /* HORS GRILLE : dans la fenetre, mais a une heure jamais offerte. */
  const rep = porte({ action: "creneaux" });
  const jour = rep.jours.slice().sort((x, y) => y.creneaux.length - x.creneaux.length)[0];
  const bon = new Date(jour.creneaux[2].iso);
  const decale = new Date(bon.getTime() + 7 * 60000).toISOString();
  dire("une plage a 9 h 07 est refusee", rdv(decale, "decale").success, false,
    "le calendrier est libre a cette minute-la : seule la grille l'interdit");

  const nuit = new Date(bon.getTime() - 8 * 3600000).toISOString();
  dire("une plage en pleine nuit est refusee", rdv(nuit, "nuit").success, false);

  /* LE MEME CRENEAU DEUX FOIS : le second doit tomber. */
  const iso = jour.creneaux[5].iso;
  dire("le creneau se prend une premiere fois", rdv(iso, "premier").success, true);
  dire("le MEME creneau, autre session, est refuse", rdv(iso, "second").success, false);
}


/* ============================================================
   7 · CE QU'UN _sid PERMET, ET CE QU'IL NE PERMET PAS
   ============================================================ */
titre("7 · L'IDENTIFIANT DE SESSION");
{
  remise(); viderDebit();

  const sid = "ZZTESTsessionvictime";
  poster({ _form: "contact", _sid: sid, nom: "ZZTEST Victime",
    email: "zztest@exemple.ca", message: "ma demande a moi" });

  /* LE MEME _sid SUR UN AUTRE FORMULAIRE. La recherche se fait dans
     l'onglet du `kind` : on ne peut pas toucher a la ligne d'un
     autre onglet, meme en connaissant l'identifiant. */
  const avantContact = lignes("Contact simple").length;
  const r = poster({ _form: "urgent", _sid: sid, nom: "ZZTEST Intrus",
    email: "zztest@exemple.ca", telephone: "418 555 0111",
    message: "tout est arrete depuis ce matin" });
  dire("le meme _sid sur un autre formulaire ecrit dans SON onglet", r.success, true);
  dire("il n'a pas touche a la ligne de l'autre onglet",
    lignes("Contact simple").length, avantContact);

  /* LA REPONSE NE REND JAMAIS LE CONTENU DE LA LIGNE. Meme avec le
     bon `_sid`, on n'apprend rien de ce qu'elle contient. */
  const suite = poster({ _form: "contact", _sid: sid, nom: "ZZTEST Victime",
    email: "zztest@exemple.ca", message: "ma demande a moi, suite" });
  const cles = Object.keys(suite).sort().join(",");
  /* `jeton` A REJOINT LA LISTE LE 2026-08-07.  D-786
     C'est une metadonnee de session, pas une donnee de visiteur :
     le serveur la rend pour que le navigateur la represente. Elle
     est verifiee juste apres — un jeton qui serait le `_sid` lui
     meme, ou qui s'en deduirait, ne protegerait rien. */
  dire("la reponse ne rend que des metadonnees", cles, "champs,etape,jeton,ligne,session,success",
    "aucun champ du visiteur ne revient par la porte");

  /* UN _sid MAL FORME EST REFUSE AVANT TOUT LE RESTE. */
  const sale = poster({ _form: "contact", _sid: "'; DROP TABLE --",
    nom: "ZZTEST Sale", email: "zztest@exemple.ca", message: "x" });
  dire("un _sid hors [A-Za-z0-9_-]{8,40} est refuse", sale.success, false);
}


/* ============================================================
   8 · L'OBJET DE L'AVIS INTERNE
   ============================================================ */
titre("8 · L'AVIS INTERNE NE SE CASSE PAS SUR UN CHAMP TORDU");
{
  remise(); viderDebit();

  poster({ _form: "contact",
    nom: "ZZTEST Ligne\r\nBcc: espion@exemple.ca\r\nSubject: autre chose",
    email: "zztest@exemple.ca", message: "message ordinaire" });

  const av = etat.courriels.find((c) => /APED/.test(c.subject || c.sujet || ""));
  const objet = String(av ? (av.subject || av.sujet) : "");
  dire("un avis est parti", !!av, true);
  dire("l'objet ne porte aucun retour de ligne", /[\r\n]/.test(objet), false,
    "objet : " + objet);
  dire("l'objet dit quand meme de qui il s'agit", /ZZTEST Ligne/.test(objet), true);

  /* LE CORPS EST DU TEXTE BRUT, PAS DU HTML. Rien a echapper, donc
     rien a casser — et on le PROUVE plutot que de le supposer. */
  const corps = String(av ? (av.body || av.corps || "") : "");
  dire("le courriel n'est pas envoye en HTML",
    !!(av && (av.htmlBody || av.corpsHtml)), false,
    "un corps texte ne peut porter ni balise ni lien deguise");
  dire("le corps contient bien la demande", /message ordinaire/.test(corps), true);
}


/* ============================================================
   9 · LE FORMULAIRE INCONNU, LE HONEYPOT, LE CORPS ILLISIBLE
   ============================================================ */
titre("9 · LES TROIS REFUS D'ENTREE");
{
  remise(); viderDebit();

  const inconnu = poster({ _form: "adminPanel", nom: "ZZTEST", email: "zztest@exemple.ca" });
  dire("un formulaire inconnu est refuse", inconnu.message, "Formulaire inconnu.");

  const av = etat.courriels.length;
  const robot = poster({ _form: "contact", _gotcha: "http://spam",
    nom: "ZZTEST Robot", email: "zztest@exemple.ca", message: "achetez" });
  dire("le honeypot rend un faux succes", robot.success, true);
  dire("le honeypot n'ecrit rien", robot.ligne, undefined);
  dire("le honeypot n'envoie rien", etat.courriels.length, av);

  const vide = JSON.parse(gs.doPost({ parameter: {} }).getContent());
  dire("un corps absent ne fait pas tomber le service", vide.success, false);
}


/* ============================================================
   10 · LA LONGUEUR ET LES CHAMPS INCONNUS
   ============================================================ */
titre("10 · CE QU'ON REFUSE D'ECRIRE");
{
  remise(); viderDebit();

  const enorme = poster({ _form: "contact", nom: "ZZTEST Long",
    email: "zztest@exemple.ca", message: "x".repeat(6000) });
  dire("un message de 6 000 signes est refuse", enorme.success, false);

  /* UN CHAMP QUI N'EST PAS AU SCHEMA N'ATTEINT AUCUNE COLONNE. */
  const avant = lignes("Contact simple").length;
  const parasite = poster({ _form: "contact", nom: "ZZTEST Parasite",
    email: "zztest@exemple.ca", message: "ordinaire",
    Statut: "Client", "Notes internes": "deja rappele", "Rappelé par": "William" });
  dire("une requete qui vise les colonnes de suivi passe", parasite.success, true);
  const ligne = lignes("Contact simple")[0];
  /* « Statut » PORTE SA VALEUR SYSTEME, pas celle de la requete.
     Attendre une cellule VIDE etait faux : `ecrireLigne` y pose
     « Nouveau ». Ce qu'on prouve, c'est que la requete n'a pas
     reussi a y ecrire « Client ». */
  dire("« Statut » garde sa valeur systeme, pas celle de la requete",
    String(ligne[colonne("contact", "Statut")] || ""), "Nouveau",
    "ecrireLigne ne lit que les champs du SCHEMA");
  dire("ni dans « Notes internes »",
    String(ligne[colonne("contact", "Notes internes")] || ""), "");
  dire("la ligne est quand meme la", lignes("Contact simple").length, avant + 1);
}


/* ============================================================
   12 · UNE FUSION NE DOIT PAS RALLUMER LE POISON
   ============================================================ */
titre("12 · LA FUSION NE RECREE PAS LA FORMULE (D-761)");
{
  remise(); viderDebit();

  /* CE CAS VIENT DE LA PRODUCTION, PAS DU BANC. Le 2026-08-06,
     `tools/verite-prod.mjs` a lu le vrai classeur apres un retour en
     arriere : « Entreprise » valait 2 et « Description » valait
     #N/A. La PREMIERE ecriture etait bien inerte — D-757 tient — et
     la SECONDE la rallumait.

     La cause : `fusionnerLigne` relit la ligne avec `getValues()`,
     qui rend « =1+1 » SANS l'apostrophe, puis reecrit la ligne
     entiere. Les cellules qu'on ne touche pas repartent donc en
     `setValues` sous leur forme nue, et Sheets les recalcule. Le
     poison n'avait pas besoin d'etre renvoye : il suffisait qu'une
     etape suivante touche N'IMPORTE QUEL autre champ.

     Aucun cas ne pouvait le voir : tous ecrivaient une fois. */
  const S = "ZZTESTfusionpoison01";
  poster({ _form: "project", _sid: S, _etape: 1, _etapes: 6,
    email: "zztest@exemple.ca", nom: "ZZTEST Poison" });
  poster({ _form: "project", _sid: S, _etape: 2, _etapes: 6,
    email: "zztest@exemple.ca",
    entreprise: "=1+1",
    description: '=IMPORTXML("https://exemple.ca/x","//a")',
    ville: "+41855501@42" });

  const f = etat.feuilles.get("Démarrer un projet");
  dire("apres la PREMIERE ecriture, aucune cellule calculee", f.formules.size, 0);

  /* UNE ETAPE QUI NE TOUCHE MEME PAS AUX CHAMPS EMPOISONNES. */
  poster({ _form: "project", _sid: S, _etape: 3, _etapes: 6,
    email: "zztest@exemple.ca", telephone: "418 555 0164",
    budget: "10 000 $ et plus" });

  dire("apres la FUSION, toujours aucune cellule calculee", f.formules.size, 0,
    f.formules.size ? "cellules rallumees : " + [...f.formules].join(", ") : "");

  const titres = gs.colonnes("project").map((c) => c.titre);
  const l = lignes("Démarrer un projet")[0] || [];
  dire("et le texte est intact", String(l[titres.indexOf("Entreprise")] || ""), "=1+1");
  dire("le second aussi",
    String(l[titres.indexOf("Description")] || ""),
    '=IMPORTXML("https://exemple.ca/x","//a")');

  /* LA CASE A COCHER SURVIT AU PASSAGE. `texteInerte` traverse
     maintenant la ligne ENTIERE, colonnes de suivi comprises : si
     elle rendait « false » au lieu du booleen, la case deviendrait
     du texte et la regle de couleur des non-lues mourrait. */
  const vu = l[titres.indexOf("Vu")];
  dire("« Vu » est resté une case à cocher, pas le texte « false »",
    typeof vu, "boolean", "valeur : " + JSON.stringify(vu));
  dire("« Statut » n'a pas bouge non plus",
    String(l[titres.indexOf("Statut")] || ""), "Nouveau");
}


/* ============================================================
   11 · LE COMPTE DES APPELS — UNE PORTE PUBLIQUE DE PLUS
   ============================================================ */
titre("11 · LE COMPTE DES APPELS N'OUVRE RIEN D'AUTRE (D-760)");
{
  remise(); viderDebit();

  const av = etat.courriels.length;
  const r = poster({ _form: "appel", origine: "estimate", appareil: "mobile" });
  dire("le clic est compte", r.success && r.compte === true, true);
  dire("aucun courriel ne part", etat.courriels.length, av,
    "un clic n'est pas une demande, et cent clics ne doivent pas vider la reserve");

  const f = etat.feuilles.get("Appels au numéro");
  dire("l'onglet s'est cree tout seul", !!f, true);
  const ligne = f.valeurs[1] || [];
  dire("il ecrit trois colonnes, pas quatre", ligne.filter((c) => c !== "" && c != null).length, 3);
  dire("la provenance est retenue", ligne[1], "estimate");
  dire("l'appareil est retenu", ligne[2], "téléphone");

  /* AUCUNE LIGNE DE DEMANDE. Un clic ne doit pas ressembler a un
     lead : il polluerait le classeur et fausserait le compte. */
  dire("aucune ligne dans les sept onglets de demande",
    Object.keys(gs.SCHEMA).reduce((s2, k) => s2 + lignes(gs.SCHEMA[k].onglet).length, 0), 0);

  /* LA PROVENANCE EST BORNEE PAR NOUS. Une requete forgee ne peut
     pas ecrire ce qu'elle veut dans une colonne. */
  poster({ _form: "appel", origine: "=IMPORTXML(\"http://x\",\"//a\")", appareil: "mobile" });
  dire("une provenance inventee retombe sur « ailleurs »",
    (f.valeurs[2] || [])[1], "ailleurs");

  poster({ _form: "appel", origine: "contact", appareil: "n'importe quoi" });
  dire("un appareil inconnu retombe sur « ordinateur »",
    (f.valeurs[3] || [])[2], "ordinateur");

  /* ET IL A SON PROPRE PLAFOND, QUI DOIT VRAIMENT ARRETER.

     UNE PREMIERE VERSION DE CE CAS NE PROUVAIT RIEN, et la mutation
     l'a montre : elle verifiait que 260 clics ne fermaient pas le
     formulaire de contact. Ils ne l'auraient jamais ferme, plafond
     ou pas — `compterAppel` ne passe pas par `traiter()`, donc il
     ne touche jamais au compteur des lignes de demande. Le cas
     passait dans les deux sens.

     Ce qu'il faut mesurer, c'est l'onglet des appels lui-meme : au
     plafond, il cesse de grossir. */
  const avantRafale = f.valeurs.filter((r) => (r || []).some((c) => c !== "" && c != null)).length;
  for (let i = 0; i < 260; i++) poster({ _form: "appel", origine: "page" });
  const apresRafale = f.valeurs.filter((r) => (r || []).some((c) => c !== "" && c != null)).length;
  dire("260 clics n'ecrivent pas 260 lignes", apresRafale - avantRafale < 260, true,
    (apresRafale - avantRafale) + " lignes ecrites, plafond 200/h");

  /* ET LE FORMULAIRE RESTE OUVERT — les deux compteurs sont bien
     separes, un robot sur le numero ne ferme pas le contact. */
  const avantDemande = lignes("Contact simple").length;
  const quandMeme = poster({ _form: "contact", nom: "ZZTEST Apres la rafale",
    email: "zztest@exemple.ca", message: "je passe encore" });
  dire("le formulaire de contact reste ouvert", quandMeme.success, true);
  dire("et la demande s'ecrit", lignes("Contact simple").length, avantDemande + 1);
}


console.log("");
console.log("============================================================");
console.log(ko ? ("LA PORTE NE TIENT PAS : " + ko + " echec(s) sur " + n)
              : ("CE QUI TIENT LA PORTE : " + n + " / " + n));
console.log("============================================================");
process.exit(ko ? 1 : 0);
