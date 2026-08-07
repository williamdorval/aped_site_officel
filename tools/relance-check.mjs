/* ============================================================
   LA RELANCE AUX ABANDONS — `node tools/relance-check.mjs`

   CE QU'IL GARDE.  D-770

   Un robot d'envoi et une relance se ressemblent beaucoup. Ce qui
   les sépare tient en quatre règles, et chacune a son cas ici :
   une seule par personne · seulement avec une adresse · seulement
   dans une fenêtre · jamais à quelqu'un qui est parti AILLEURS
   CHEZ NOUS.

   LA PLUS IMPORTANTE EST « UNE SEULE ». Elle tient parce que la
   preuve vit dans le CLASSEUR, pas dans une mémoire de script :
   un redéploiement efface la mémoire, il n'efface pas une colonne.
   Le cas qui compte le plus est donc le deuxième passage.

   ET ELLE NE PART PAS SANS ADRESSE DE SITE : un courriel dont le
   bouton ne mène nulle part est pire que pas de courriel.

   Sorties : 0 tout tient · 1 défaut.
   ============================================================ */
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const { gs, etat } = await import(
  pathToFileURL(path.join(ICI, "faux-google.mjs")).href);

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

const SITE = "https://exemple-aped.ca";
const H = 3600000, J = 86400000;

gs.initialiser();

/* Une ligne d'abandon fabriquée de bout en bout, telle que le
   service l'aurait écrite : on passe par `doPost`, jamais en
   posant des cellules à la main — une ligne fabriquée à la main
   ne prouve que la façon dont on l'a fabriquée. */
/* UN `_sid` DE MOINS DE HUIT SIGNES EST REFUSE PAR `valider()`,
   et le refus est une reponse JSON, pas une exception : les
   premieres versions de ces cas ecrivaient « sidA », aucune ligne
   ne naissait, et l'outil mourait trois lignes plus loin sur une
   feuille vide au lieu de dire pourquoi. On fabrique donc un
   identifiant de la meme forme que celui du navigateur. */
const sidDe = (nom) => (nom + "0123456789abcdefghij").slice(0, 24);

function abandon(kind, sid0, champs, ilYAms) {
  const sid = sidDe(sid0);
  const charge = Object.assign({ _form: kind, _sid: sid, _etape: 3, _etapes: 8 }, champs);
  const rep = JSON.parse(gs.doPost({ postData: { contents: JSON.stringify(charge) } }).getContent());
  /* UN REFUS ARRETE L'OUTIL. Sans ca, aucune ligne ne nait, la
     relance rend « 0 envoyee », et « 0 » se lit exactement comme
     une regle qui marche. Pieges 30 · 40 · 62. */
  if (!rep.success) {
    console.error("ARRET · le service a refuse la ligne d'essai « " + kind + " » : " + rep.message);
    process.exit(2);
  }
  const f = etat.feuilles.get(gs.SCHEMA[kind].onglet);
  const titres = f.valeurs[0];
  const iDate = titres.indexOf("Horodatage");
  /* ON RECULE L'HORODATAGE : sans ça toute ligne est « trop
     récente » et la relance ne partirait jamais — le banc rendrait
     « 0 envoyée » et ça ressemblerait à une règle qui marche. */
  if (ilYAms != null) f.valeurs[1][iDate] = new Date(Date.now() - ilYAms);
  return { feuille: f, titres: titres };
}

function colonne(kind, titre2) {
  const f = etat.feuilles.get(gs.SCHEMA[kind].onglet);
  return f.valeurs[0].indexOf(titre2);
}
function valeur(kind, ligne, titre2) {
  const f = etat.feuilles.get(gs.SCHEMA[kind].onglet);
  return f.valeurs[ligne - 1][colonne(kind, titre2)];
}
function remise(avecSite) {
  etat.feuilles.clear();
  etat.courriels.length = 0;
  etat.proprietes = {};
  if (avecSite !== false) etat.proprietes.SITE_URL = SITE;
  etat.quota = 100;
  gs.initialiser();
}

console.log("============================================================");
console.log("LA RELANCE AUX ABANDONS");
console.log("============================================================");

/* ============================================================
   1 · SANS ADRESSE DE SITE, RIEN NE PART
   ============================================================ */
titre("1 · UN BOUTON QUI NE MÈNE NULLE PART NE S'ENVOIE PAS");
{
  remise(false);
  abandon("project", "sidA", { email: "zz@exemple.ca", nom: "ZZ Abandon" }, 30 * H);
  const avant = etat.courriels.length;
  const r = gs.relancerAbandons();
  dire("elle refuse de partir", r.envoyees, 0);
  dire("elle dit pourquoi", /SITE_URL/.test(String(r.raison)), true);
  dire("aucun courriel n'est parti", etat.courriels.length, avant);
  dire("et la colonne reste VIDE", String(valeur("project", 2, "Relance") || ""), "",
    "sinon la ligne serait marquée relancée sans l'avoir été");

  /* CE QU'ELLE NE DOIT PAS ENTRAINER DANS SA CHUTE.  D-772
     Le site n'est pas en ligne : `SITE_URL` n'existe pas, et
     `relancerAbandons` sort a sa premiere ligne toutes les quatre
     heures. Ce qui compte alors n'est pas qu'elle echoue — c'est
     que le RESTE continue. Une relance qui leve au lieu de sortir
     ferait echouer son declencheur, et un declencheur en echec
     repete finit par etre desactive par Apps Script : le jour ou
     l'adresse serait posee, plus rien ne tournerait. */
  const avantLigne = etat.feuilles.get(gs.SCHEMA.refer.onglet);
  const rep = JSON.parse(gs.doPost({ postData: { contents: JSON.stringify({
    _form: "refer", _sid: sidDe("sidApres"), _etape: 1, _etapes: 7,
    entreprise_referee: "ZZ Garage Sans Adresse" }) } }).getContent());
  dire("un formulaire passe quand meme", rep.success, true,
    "la relance ne doit rien emporter avec elle");
  dire("et sa ligne s'ecrit", String(valeur("refer", 2, "Entreprise référée") || ""),
    "ZZ Garage Sans Adresse");
  dire("la relance ne leve pas, elle SORT",
    typeof gs.relancerAbandons().raison, "string",
    "une exception ferait echouer le declencheur des quatre heures");
  void avantLigne;
}

/* ============================================================
   1bis · ELLE SE RALLUME SEULE, SANS TOUCHER AU CODE
   ============================================================ */
titre("1bis · LE JOUR OÙ L'ADRESSE EST POSÉE");
{
  remise(false);
  abandon("project", "sidDormant", { email: "dormant@exemple.ca", nom: "ZZ Dormant" }, 30 * H);

  /* Trois passages a vide, comme les trois premieres nuits d'un
     site pas encore en ligne. */
  gs.relancerAbandons(); gs.relancerAbandons(); gs.relancerAbandons();
  dire("après trois passages à vide, la ligne est intacte",
    String(valeur("project", 2, "Relance") || ""), "");
  const avant = etat.courriels.length;

  /* L'adresse se pose dans les proprietes du script, pas dans le
     code : aucun redeploiement, aucune modification de fichier. */
  etat.proprietes.SITE_URL = SITE;

  const r = gs.relancerAbandons();
  dire("le passage suivant part tout seul", r.envoyees, 1,
    "aucune ligne de code n'a change entre les deux");
  dire("et il part à la ligne qui dormait", etat.courriels.length, avant + 1);
  const c = etat.courriels[etat.courriels.length - 1];
  dire("le lien porte enfin l'adresse", c.body.indexOf(SITE), c.body.indexOf("https://"),
    "c'est ce qui manquait, et rien d'autre");
  dire("il ramène à la bonne étape", /[?&]e=3/.test(c.body), true);
}

/* ============================================================
   2 · LE CAS NORMAL
   ============================================================ */
titre("2 · UN ABANDON DE 30 H AVEC UNE ADRESSE");
{
  remise();
  abandon("project", "sidB", { email: "zz@exemple.ca", nom: "ZZ Abandon" }, 30 * H);
  const r = gs.relancerAbandons();
  dire("une relance part", r.envoyees, 1);

  const c = etat.courriels[etat.courriels.length - 1];
  dire("elle va à la bonne adresse", c.to, "zz@exemple.ca");
  dire("le sujet ne culpabilise pas",
    /pas terminé|oublié|incomplet/i.test(c.subject), false, c.subject);
  dire("le corps porte un lien", /https:\/\//.test(c.body), true);
  dire("le lien pointe le bon formulaire",
    /reprendre=project/.test(c.body), true);
  dire("il porte la session", c.body.indexOf("s=" + sidDe("sidB")) !== -1, true,
    "sans elle, la reprise ouvrirait une SECONDE ligne");
  dire("il porte l'étape laissée", /[?&]e=3/.test(c.body), true);
  dire("il donne une sortie",
    /non merci|efface tout|n’insiste plus|ne vous réécrit pas/.test(c.body), true);
  dire("aucun compte à rebours",
    /dépêchez|dernière chance|expire|plus que/i.test(c.body), false);

  dire("la colonne « Relance » porte la date",
    String(valeur("project", 2, "Relance") || "").length > 0, true);
}

/* LE CAS QUI COMPTE LE PLUS. */
titre("3 · LE DEUXIÈME PASSAGE N'ÉCRIT PAS DEUX FOIS");
{
  const avant = etat.courriels.length;
  const r2 = gs.relancerAbandons();
  dire("aucune deuxième relance", r2.envoyees, 0);
  dire("aucun courriel de plus", etat.courriels.length, avant,
    "c'est la seule faute que cette fonction n'a pas le droit de commettre");
  const r3 = gs.relancerAbandons();
  dire("ni au troisième passage", etat.courriels.length, avant);
}

/* ============================================================
   4 · CE QU'ELLE LAISSE TRANQUILLE
   ============================================================ */
titre("4 · LES QUATRE REFUS");
{
  remise();
  /* a · trop récent */
  abandon("project", "sidTrop", { email: "a@exemple.ca", nom: "ZZ Recent" }, 2 * H);
  dire("un abandon de 2 h est trop frais", gs.relancerAbandons().envoyees, 0,
    "écrire à vingt minutes serait du harcèlement");

  /* b · trop vieux */
  remise();
  abandon("project", "sidVieux", { email: "b@exemple.ca", nom: "ZZ Vieux" }, 30 * J);
  dire("un abandon de 30 jours est trop vieux", gs.relancerAbandons().envoyees, 0,
    "ce n'est plus une relance, c'est une sollicitation");

  /* c · pas d'adresse */
  remise();
  abandon("refer", "sidSansMail",
    { entreprise_referee: "ZZ Garage" }, 30 * H);
  dire("sans adresse, on ne peut pas écrire", gs.relancerAbandons().envoyees, 0);
  /* ET SURTOUT : la ligne ne doit pas etre MARQUEE. La marquer la
     grillerait pour toujours — la personne qui revient donner son
     adresse ne serait jamais relancee, et rien ne dirait pourquoi.
     Sans ce cas, retirer le garde d'adresse ne cassait rien :
     `envoyer("")` rend `false` en silence et `envoyees` restait a 0. */
  dire("et sa ligne reste relançable",
    String(valeur("refer", 2, "Relance") || ""), "",
    "une ligne marquee sans envoi est un lead perdu sans trace");

  /* d · parti vers un autre parcours de CHEZ NOUS */
  remise();
  abandon("project", "sidParti", { email: "d@exemple.ca", nom: "ZZ Parti" }, 30 * H);
  gs.doPost({ postData: { contents: JSON.stringify({
    _form: "project", _sid: sidDe("sidParti"), _etape: 3, _etapes: 8,
    _parti_vers: "estimate", email: "d@exemple.ca" }) } });
  dire("la colonne « Parti vers » est bien posée",
    String(valeur("project", 2, "Parti vers") || ""), "Estimation");
  dire("on ne relance pas quelqu'un qui remplit ailleurs chez nous",
    gs.relancerAbandons().envoyees, 0,
    "ce serait lui courir après pendant qu'il vient");

  /* e · demande complète */
  /* LE FORMULAIRE DOIT ETRE UN DE CEUX QU'ON RELANCE. La premiere
     version prenait « contact », qui n'est pas dans `RELANCES` : il
     n'etait jamais examine, et le cas passait meme en retirant le
     garde « demande complete ». Il faut un formulaire suivi, une
     ligne ancienne, une adresse — tout sauf l'abandon. */
  remise();
  const fini = abandon("project", "sidFini",
    { email: "e@exemple.ca", nom: "ZZ Fini" }, 30 * H);
  gs.doPost({ postData: { contents: JSON.stringify({
    _form: "project", _sid: sidDe("sidFini"), _etape: 7, _etapes: 8, _final: true,
    nom: "ZZ Fini", email: "e@exemple.ca", entreprise: "ZZ inc",
    domaine: "Garage", nombre_employes: "Juste moi", objectif: "Vendre",
    ampleur: "1 à 5 pages", niveau_design: "Essentiel", contenu: "Prêts",
    fonctions: "Aucune", budget: "À voir", echeancier: "Pas pressé" }) } });
  dire("la ligne est bien marquée complète",
    String(valeur("project", 2, "Étape") || "").indexOf("✓"), 0);
  dire("une demande complète ne se relance pas", gs.relancerAbandons().envoyees, 0);
  dire("et sa colonne reste vide",
    String(valeur("project", 2, "Relance") || ""), "");
}

/* UNE LIGNE SANS SESSION NE PEUT PAS ETRE RAMENEE QUELQUE PART.

   Cet etat n'est plus atteignable depuis le site : `_sid` est pose
   des la premiere etape validee. Il existe pourtant dans le vrai
   classeur — toutes les lignes d'AVANT D-744 portent un condense
   de contenu, pas une session. Leur envoyer un lien de reprise,
   c'est envoyer un lien qui ouvre un formulaire vide en pretendant
   ramener quelqu'un ou il en etait.

   On fabrique donc cet etat en effacant la signature, ce qui est
   exactement ce que le classeur contient pour ces lignes-la. */
titre("4bis · UNE LIGNE SANS SESSION NE SE RELANCE PAS");
{
  remise();
  abandon("project", "sidVieille", { email: "v@exemple.ca", nom: "ZZ Ancienne" }, 30 * H);
  const f = etat.feuilles.get(gs.SCHEMA.project.onglet);
  const iSig = f.valeurs[0].indexOf(gs.SCHEMA.project.onglet ? "Signature" : "");
  f.valeurs[1][iSig] = "a1b2c3d4e5f6";   /* un condense, pas « S:… » */
  dire("la ligne ne porte plus de session",
    String(f.valeurs[1][iSig]).indexOf("S:"), -1);
  dire("on ne lui envoie pas un lien qui ne la ramène nulle part",
    gs.relancerAbandons().envoyees, 0);
  dire("et sa ligne reste vierge de toute marque",
    String(valeur("project", 2, "Relance") || ""), "");
}

/* ============================================================
   5 · LE PLAFOND, ET CE QU'IL PROTÈGE
   ============================================================ */
titre("5 · LE PLAFOND PAR PASSE");
{
  remise();
  const max = gs.REGLAGES.RELANCE_MAX_PAR_PASSE;
  for (let i = 0; i < max + 6; i++) {
    abandon("project", "sidLot" + i,
      { email: "lot" + i + "@exemple.ca", nom: "ZZ Lot " + i }, 30 * H);
  }
  const r = gs.relancerAbandons();
  dire("elle s'arrête au plafond", r.envoyees, max,
    "le quota est partagé avec les confirmations, qui rapportent");
  dire("le reste attend le passage suivant",
    gs.relancerAbandons().envoyees > 0, true,
    "un plafond qui oublie les autres n'est pas un plafond, c'est une perte");
}

/* ============================================================
   6 · UN ENVOI QUI ÉCHOUE NE MENT PAS
   ============================================================ */
titre("6 · QUAND LE QUOTA EST ÉPUISÉ");
{
  remise();
  abandon("project", "sidQuota", { email: "q@exemple.ca", nom: "ZZ Quota" }, 30 * H);
  etat.quota = 0;
  const r = gs.relancerAbandons();
  etat.quota = 100;
  dire("rien ne part", r.envoyees, 0);
  const marque = String(valeur("project", 2, "Relance") || "");
  dire("la colonne DIT que l'envoi a été refusé",
    /refusé/.test(marque), true,
    "une date seule ferait croire que la personne a reçu quelque chose · lu : " + marque);
}

/* ============================================================
   7 · LE JOURNAL, ET LES DÉCLENCHEURS
   ============================================================ */
titre("7 · CE QUI SE VOIT DANS LE CLASSEUR");
{
  remise();
  abandon("booking", "sidJ", { email: "j@exemple.ca", nom: "ZZ J" }, 30 * H);
  gs.relancerAbandons();
  const f = etat.feuilles.get("Relances envoyées");
  dire("un onglet garde la trace", !!f, true);
  if (f) {
    dire("il porte des en-têtes", f.valeurs[0][0], "Quand");
    dire("et la ligne envoyée", String(f.valeurs[1][2]), "j@exemple.ca");
  }
}

titre("8 · LE DÉCLENCHEUR EST POSÉ");
{
  etat.declencheurs.length = 0;
  const e = gs.poserVeille();
  dire("`initialiser()` pose la relance", e.relance, true);
  const p = gs.declencheursPoses();
  dire("et la porte le rend", p.relance, 1);
  gs.poserVeille();
  dire("trois poses, un seul déclencheur",
    etat.declencheurs.filter((t) => t.getHandlerFunction() === "relancerAbandons").length, 1);
}

console.log("");
console.log("============================================================");
console.log(ko ? ("LA RELANCE NE TIENT PAS : " + ko + " échec(s) sur " + n)
              : ("LA RELANCE TIENT : " + n + " / " + n));
console.log("============================================================");
process.exit(ko ? 1 : 0);
