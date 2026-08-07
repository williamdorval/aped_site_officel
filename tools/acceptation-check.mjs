/* ============================================================
   L'ACCEPTATION DES CONDITIONS — `node tools/acceptation-check.mjs`

   CE QU'IL GARDE.  D-773

   Une case cochee ne protege personne. Ce qui protege, c'est de
   pouvoir dire QUEL TEXTE a ete accepte et QUAND — et de pouvoir
   le dire dans un an, devant quelqu'un qui conteste.

   Quatre regles, et chacune a son cas ici :
     · le SERVEUR refuse, pas seulement le navigateur — celui qui
       forge une requete ne voit jamais la case ;
     · la VERSION doit etre une vraie, c'est-a-dire une archivee ;
     · l'HEURE est celle du serveur, jamais celle qu'on lui donne ;
     · une etape suivante ne REECRIT PAS une acceptation deja posee.

   ET LA CINQUIEME, QUI EST L'INVERSE : une etape INTERMEDIAIRE
   passe sans acceptation. Exiger la case a l'etape 1 ferait perdre
   exactement l'abandon que la sauvegarde progressive existe pour
   capter.

   Sorties : 0 tout tient · 1 defaut.
   ============================================================ */
import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
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

/* LA VERSION SE LIT DANS L'ARCHIVE, PAS DANS CET OUTIL. Une version
   recopiee ici deviendrait fausse a la premiere revision des
   conditions, et le banc jurerait que tout va bien en testant une
   version que plus personne n'affiche. */
const VERSION = fs.readdirSync(path.join(RACINE, "conditions"))
  .map((f) => /^reference-(\d{4}-\d{2}-\d{2})\.md$/.exec(f)).filter(Boolean)
  .map((m) => m[1]).sort().pop();
if (!VERSION) { console.error("ARRET · aucune archive de conditions."); process.exit(2); }

const sidDe = (nom) => (nom + "0123456789abcdefghij").slice(0, 24);
const poste = (charge) =>
  JSON.parse(gs.doPost({ postData: { contents: JSON.stringify(charge) } }).getContent());

function remise() {
  etat.feuilles.clear();
  etat.courriels.length = 0;
  etat.proprietes = {};
  etat.quota = 100;
  gs.initialiser();
}
function colonne(t) {
  const f = etat.feuilles.get(gs.SCHEMA.refer.onglet);
  return f.valeurs[0].indexOf(t);
}
function valeur(ligne, t) {
  const f = etat.feuilles.get(gs.SCHEMA.refer.onglet);
  const i = colonne(t);
  if (i < 0) return "__COLONNE ABSENTE__";
  return String(f.valeurs[ligne - 1][i] == null ? "" : f.valeurs[ligne - 1][i]);
}

/* Le jeu complet, moins ce que chaque cas retire. */
function reference(sid, extra) {
  return Object.assign({
    _form: "refer", _sid: sidDe(sid), _etape: 6, _etapes: 7, _final: true,
    entreprise_referee: "ZZ Garage Tremblay",
    contact_reference: "Marie Lavoie, 418 555 0142",
    votre_nom: "ZZ Referent", votre_email: "zz@exemple.ca",
    votre_lien: "Ami ou famille"
  }, extra || {});
}

console.log("============================================================");
console.log("L'ACCEPTATION DES CONDITIONS · version en vigueur " + VERSION);
console.log("============================================================");

/* ============================================================
   0 · LE TEMOIN POSITIF, ET IL PASSE EN PREMIER

   Sans lui, tous les refus qui suivent pourraient venir d'autre
   chose — un champ requis oublie, un `_sid` mal forme — et l'outil
   dirait « le serveur refuse » d'un serveur qui refuse pour la
   mauvaise raison. Le meme jeu, avec l'acceptation, doit PASSER.
   ============================================================ */
titre("0 · LE MEME ENVOI, AVEC L'ACCEPTATION, PASSE");
{
  remise();
  const r = poste(reference("sidOk", {
    conditions_acceptees: "oui", conditions_version: VERSION
  }));
  dire("il est accepte", r.success, true, r.message || "");
  dire("la ligne est marquee complete", valeur(2, "Étape").indexOf("✓"), 0);
  dire("la colonne dit « oui »", valeur(2, "Conditions acceptées"), "oui");
  dire("la version est rangee", valeur(2, "Version acceptée"), VERSION);
  dire("l'heure est posee", valeur(2, "Acceptées le").length > 0, true);
}

/* ============================================================
   1 · LE REFUS, PAR LE SERVEUR
   ============================================================ */
titre("1 · UNE REQUETE FORGEE SANS ACCEPTATION EST REFUSEE");
{
  remise();
  const r = poste(reference("sidSans"));
  dire("le service refuse", r.success, false,
    "la case du site ne protege que celui qui la voit");
  dire("il dit pourquoi", /accepter les conditions/i.test(String(r.message)), true, r.message);
  dire("aucune ligne n'est nee", etat.feuilles.get(gs.SCHEMA.refer.onglet).valeurs.length, 1);
}

titre("1bis · « non » N'EST PAS « oui »");
{
  remise();
  const r = poste(reference("sidNon", {
    conditions_acceptees: "non", conditions_version: VERSION
  }));
  dire("le service refuse", r.success, false, r.message);
}

titre("1ter · UNE VERSION INVENTEE EST REFUSEE");
{
  remise();
  const r = poste(reference("sidFaux", {
    conditions_acceptees: "oui", conditions_version: "2099-12-31"
  }));
  dire("le service refuse", r.success, false,
    "accepter une version inexistante ne prouve rien : aucun texte ne lui correspond");
  dire("il dit pourquoi", /version des conditions/i.test(String(r.message)), true, r.message);

  /* ET UNE VERSION VIDE NON PLUS. Le cas arrive tout seul : un
     champ cache retire par une extension, un formulaire recopie. */
  const r2 = poste(reference("sidVide", { conditions_acceptees: "oui" }));
  dire("une version absente est refusee aussi", r2.success, false, r2.message);
}

/* ============================================================
   2 · L'HEURE EST CELLE DU SERVEUR
   ============================================================ */
titre("2 · L'HEURE NE VIENT PAS DE CELUI QUI ACCEPTE");
{
  remise();
  poste(reference("sidHeure", {
    conditions_acceptees: "oui", conditions_version: VERSION,
    /* Ce que le forgeur voudrait voir dans la colonne. */
    _conditions_le: "1999-01-01 00:00:00"
  }));
  const lu = valeur(2, "Acceptées le");
  dire("la date fournie n'est pas retenue", lu.indexOf("1999"), -1,
    "une date qu'on se donne a soi-meme ne prouve rien · lu : " + lu);
  dire("le serveur a pose la sienne",
    lu.indexOf(String(new Date().getFullYear())) !== -1, true, "lu : " + lu);
}

/* ============================================================
   3 · UNE ACCEPTATION NE SE REECRIT PAS
   ============================================================ */
titre("3 · UNE ETAPE SUIVANTE NE REJOUE PAS L'ACCEPTATION");
{
  remise();
  poste(reference("sidGel", {
    conditions_acceptees: "oui", conditions_version: VERSION
  }));
  dire("l'acceptation est posee", valeur(2, "Conditions acceptées"), "oui");

  /* ON MARQUE LES TROIS CELLULES, ET C'EST CE QUI REND LE CAS
     PROBANT. Le serveur reecrirait « oui », la version en vigueur
     et l'heure courante — c'est-a-dire exactement ce qui s'y
     trouve deja. Comparer deux valeurs identiques ne prouverait
     RIEN : le gel pourrait avoir disparu sans que le cas bronche.
     On y met donc des valeurs qu'aucune reecriture ne produirait,
     et on regarde si elles survivent. */
  const f = etat.feuilles.get(gs.SCHEMA.refer.onglet);
  const MARQUES = {
    "Conditions acceptées": "oui · marque",
    "Acceptées le": "mardi 1 janvier 1990 à 0 h 00",
    "Version acceptée": "1990-01-01"
  };
  Object.keys(MARQUES).forEach(function (t) { f.valeurs[1][colonne(t)] = MARQUES[t]; });

  /* La meme session revient — reessai reseau, retour en arriere, ou
     requete fabriquee — avec une acceptation parfaitement valide et
     un nom corrige. */
  const r = poste(Object.assign(reference("sidGel", {
    conditions_acceptees: "oui",
    conditions_version: VERSION,
    _conditions_le: "1999-01-01 00:00:00"
  }), { votre_nom: "ZZ Referent corrige" }));
  dire("la seconde requete passe", r.success, true, r.message || "");
  Object.keys(MARQUES).forEach(function (t) {
    dire("« " + t + " » n'a pas bouge", valeur(2, t), MARQUES[t],
      "une preuve qui se reecrit n'est pas une preuve");
  });
  dire("et le reste de la ligne se corrige quand meme",
    valeur(2, "RÉFÉRENT · nom"), "ZZ Referent corrige",
    "geler la preuve ne doit pas geler la demande");
}

titre("3bis · UN RENVOI QUI DIT « NON » N'ARRIVE MEME PAS A LA LIGNE");
{
  const r = poste(reference("sidGel", {
    conditions_acceptees: "non", conditions_version: VERSION,
    votre_nom: "ZZ Efface"
  }));
  dire("le service refuse avant d'ecrire", r.success, false, r.message);
  dire("et la ligne n'a pas bouge", valeur(2, "RÉFÉRENT · nom"), "ZZ Referent corrige");
}

/* ============================================================
   4 · L'INVERSE : UNE ETAPE INTERMEDIAIRE N'EXIGE RIEN
   ============================================================ */
titre("4 · L'ETAPE 1 PASSE SANS ACCEPTATION");
{
  remise();
  const r = poste({
    _form: "refer", _sid: sidDe("sidPart"), _etape: 1, _etapes: 7,
    entreprise_referee: "ZZ Boulangerie"
  });
  dire("la ligne nait", r.success, true, r.message || "");
  dire("elle porte le nom", valeur(2, "Entreprise référée"), "ZZ Boulangerie");
  dire("et l'acceptation reste vide", valeur(2, "Conditions acceptées"), "");
  dire("l'etape n'est pas marquee complete",
    valeur(2, "Étape").indexOf("✓"), -1);

  /* Puis la meme session finit, avec la case. Une seule ligne. */
  const r2 = poste(reference("sidPart", {
    conditions_acceptees: "oui", conditions_version: VERSION,
    entreprise_referee: "ZZ Boulangerie"
  }));
  dire("la fin passe", r2.success, true, r2.message || "");
  dire("toujours une seule ligne",
    etat.feuilles.get(gs.SCHEMA.refer.onglet).valeurs.length, 2);
  dire("et l'acceptation s'y est posee", valeur(2, "Conditions acceptées"), "oui");
}

/* ============================================================
   5 · LE PIEGE A ROBOTS PASSE AVANT TOUT LE RESTE
   ============================================================ */
titre("5 · UN ROBOT QUI COCHE TOUT N'ECRIT RIEN");
{
  remise();
  const r = poste(reference("sidBot", {
    conditions_acceptees: "oui", conditions_version: VERSION,
    _gotcha: "http://spam.example"
  }));
  dire("il repart content", r.success, true,
    "repondre « refuse » lui apprendrait qu'il a ete vu");
  dire("mais rien n'est ecrit",
    etat.feuilles.get(gs.SCHEMA.refer.onglet).valeurs.length, 1);
}

console.log("");
console.log("============================================================");
console.log(ko ? ("L'ACCEPTATION NE TIENT PAS : " + ko + " echec(s) sur " + n)
              : ("L'ACCEPTATION TIENT : " + n + " / " + n));
console.log("============================================================");
process.exit(ko ? 1 : 0);
