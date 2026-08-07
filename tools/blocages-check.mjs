/* ============================================================
   UN BLOCAGE QUI NE BLOQUE RIEN — `node tools/blocages-check.mjs`

   POURQUOI CET OUTIL EXISTE.  D-762

   Le 2026-08-06, un blocage pose « de 6 h 30 a 7 h 30 » dans
   l'agenda de l'agence n'aurait retire AUCUN creneau : la journee
   n'est offerte qu'entre 9 h et 20 h. Rien ne l'aurait dit. On se
   croit libre de son avant-midi, le site continue d'offrir la
   journee entiere, et on l'apprend en recevant une reservation
   qu'on ne peut pas honorer.

   C'est un defaut SILENCIEUX PAR CONSTRUCTION : il n'y a pas
   d'erreur a lever, pas de ligne fausse a lire, pas de creneau en
   trop a compter. Le systeme fait exactement ce qu'on lui a
   demande, et ce n'est pas ce qu'on voulait.

   CE FICHIER GARDE LA VEILLE QUI LE RATTRAPE. Elle renomme
   l'evenement fautif DANS L'AGENDA — c'est la qu'on a fait
   l'erreur, c'est la qu'on doit la voir — et elle en tient la
   liste dans le classeur.

   IL EXECUTE LE VRAI `google/Code.gs`.
   ============================================================ */
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const { gs, etat } = await import(pathToFileURL(path.join(ICI, "faux-google.mjs")).href);

let n = 0, ko = 0;
function dire(nom, obtenu, attendu, note) {
  n++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) ko++;
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + nom
    + "\n         obtenu  : " + obtenu + "\n         attendu : " + attendu
    + (note ? "\n         " + note : ""));
}
function titre(t) { console.log(""); console.log("--- " + t); }

const D = gs.DISPONIBILITES;

/* UN JOUR OUVRABLE FRANCHEMENT DANS LA FENETRE. On le prend sur la
   reponse de la porte plutot que de le calculer : le calculer, c'est
   reecrire le code teste. */
function jourOffert(rang = 0) {
  etat.decalageHorloge += 120000;
  const r = JSON.parse(gs.doGet({ parameter: { action: "creneaux" } }).getContent());
  const jours = (r.jours || []).slice().sort((a, b) => b.creneaux.length - a.creneaux.length);
  if (jours.length <= rang) { console.error("pas assez de jours offerts"); process.exit(2); }
  return jours[rang];
}
function aLHeure(cleJour, h, min) {
  const [an, mois, jour] = cleJour.split("-").map(Number);
  return gs.instantLocal(an, mois, jour, h, min);
}
function poser(titreEv, cleJour, h0, m0, h1, m1) {
  const ev = {
    id: "EV-" + titreEv.replace(/\W+/g, "-"),
    titre: titreEv,
    debut: aLHeure(cleJour, h0, m0),
    fin: aLHeure(cleJour, h1, m1)
  };
  etat.evenements.push(ev);
  return ev;
}
function remise() {
  etat.evenements.length = 0;
  etat.renommages.length = 0;
  etat.cache = {};
  etat.decalageHorloge = 0;
}

gs.initialiser();

console.log("============================================================");
console.log("UN BLOCAGE QUI NE BLOQUE RIEN");
console.log("Journee offerte : " + D.HEURE_DEBUT + " – " + D.HEURE_FIN);
console.log("============================================================");


/* ============================================================
   1 · LE CAS DU 10 AOUT, REJOUE
   ============================================================ */
titre("1 · CE QUE WILLIAM CROYAIT AVOIR BLOQUE");
{
  remise();
  const j = jourOffert();
  const avant = j.creneaux.length;

  /* 6 h 30 – 7 h 30, ce qu'il voulait poser. */
  poser("pas dispo le matin", j.date, 6, 30, 7, 30);

  etat.decalageHorloge += 120000;
  const apres = JSON.parse(gs.doGet({ parameter: { action: "creneaux" } }).getContent());
  const restants = (apres.jours.find((x) => x.date === j.date) || { creneaux: [] }).creneaux.length;

  dire("un blocage de 6 h 30 a 7 h 30 ne retire AUCUN creneau", restants, avant,
    "c'est le defaut : le systeme obeit, et ce n'est pas ce qu'on voulait");

  const sansEffet = gs.blocagesSansEffet();
  dire("la veille le voit", sansEffet.length, 1);
  dire("et elle dit pourquoi", (sansEffet[0] || {}).pourquoi,
    "hors des heures offertes (" + D.HEURE_DEBUT + " – " + D.HEURE_FIN + ")");
}

/* ============================================================
   2 · CE QUI BLOQUE VRAIMENT N'EST JAMAIS SIGNALE
   ============================================================ */
titre("2 · UNE ALERTE QUI CRIE SUR TOUT NE SERT A RIEN");
{
  remise();
  const j = jourOffert();

  poser("vrai rendez-vous", j.date, 14, 0, 16, 0);
  dire("un blocage de 14 h a 16 h n'est PAS signale", gs.blocagesSansEffet().length, 0);

  /* A CHEVAL SUR L'OUVERTURE : il mord sur la journee, donc il agit. */
  remise();
  const j2 = jourOffert();
  poser("depuis l'aube", j2.date, 6, 0, 9, 30);
  dire("un blocage 6 h – 9 h 30 n'est pas signale : il mord sur 9 h",
    gs.blocagesSansEffet().length, 0);

  /* JUSTE APRES LA FERMETURE. Le dernier creneau finit a 20 h ;
     avec le tampon de 15 min, 20 h 15 le touche encore. */
  remise();
  const j3 = jourOffert();
  poser("apres la fermeture", j3.date, 21, 0, 22, 0);
  dire("un blocage de 21 h a 22 h est signale", gs.blocagesSansEffet().length, 1);

  /* UNE JOURNEE ENTIERE : elle bloque, evidemment. */
  remise();
  const j4 = jourOffert();
  etat.evenements.push({ id: "EV-jour", titre: "conges", jour: j4.date });
  dire("une journee entiere n'est pas signalee", gs.blocagesSansEffet().length, 0);
}

/* ============================================================
   3 · LE PASSE ET LES RENDEZ-VOUS DU SITE NE COMPTENT PAS
   ============================================================ */
titre("3 · CE QUE LA VEILLE IGNORE VOLONTAIREMENT");
{
  remise();
  const j = jourOffert();

  /* UN RENDEZ-VOUS POSE PAR LE SITE.

     IL FAUT LE SORTIR DE LA GRILLE POUR QUE LE CAS PROUVE QUELQUE
     CHOSE, et une mutation l'a montre : tant qu'il tombe sur la
     grille, `bloqueAuMoinsUnCreneau` le filtre deja et le garde-fou
     `titreDuSite` ne sert a rien. Retirer le garde-fou ne faisait
     tomber aucun cas.

     Le vrai scenario est celui-la : un appel est reserve a 19 h 30,
     puis on RACCOURCIT les heures d'ouverture. Le rendez-vous
     existe toujours, il ne tombe plus sur aucune grille — et sans
     garde-fou la veille le renommerait « ⚠ NE BLOQUE RIEN · ☎
     Appeler … », ce qui casse `nettoyerRendezVousEssai`, qui
     reconnait les rendez-vous a leur prefixe de titre. */
  const iso = j.creneaux[j.creneaux.length - 1].iso;
  JSON.parse(gs.doPost({ postData: { contents: JSON.stringify({
    _form: "booking", nom: "ZZTEST Veille", email: "zztest@exemple.ca",
    telephone: "418 555 0142", mode: "Appel téléphonique",
    plage_iso: iso, sujet: "veille"
  }) }, parameter: {} }).getContent());
  dire("un rendez-vous pose par le site n'est pas signale", gs.blocagesSansEffet().length, 0);

  const finAvant = D.HEURE_FIN;
  D.HEURE_FIN = "12:00";                    /* on raccourcit la journee */
  dire("meme hors de la nouvelle grille, il n'est pas signale",
    gs.blocagesSansEffet().length, 0,
    "sinon la veille renommerait un rendez-vous, et le nettoyage ne le reconnaitrait plus");
  const ev = etat.evenements[etat.evenements.length - 1];
  gs.veilleBlocages();
  dire("et son titre n'a pas ete touche", /^(☎|▸)/.test(String(ev.titre)), true, ev.titre);
  D.HEURE_FIN = finAvant;

  /* LE PASSE. Signaler un blocage d'hier serait du bruit, et le
     bruit fait ignorer l'alerte.

     LE PREAVIS DOIT TOMBER POUR QUE LE CAS EXISTE. Avec 24 h de
     preavis, la fenetre interrogee commence a « maintenant » : le
     passe n'en sort jamais, et le garde-fou est inatteignable. Une
     mutation qui le retirait survivait. On met le preavis a zero —
     c'est un reglage, il peut changer — et alors seul le garde-fou
     empeche d'alerter sur hier. */
  remise();
  const preavisAvant = D.PREAVIS_HEURES;
  D.PREAVIS_HEURES = 0;
  const hier = new Date(Date.now() - 18 * 3600000);
  etat.evenements.push({ id: "EV-hier", titre: "hier a l'aube",
    debut: hier, fin: new Date(hier.getTime() + 3600000) });
  dire("un blocage deja passe n'est pas signale", gs.blocagesSansEffet().length, 0);
  D.PREAVIS_HEURES = preavisAvant;
}

/* ============================================================
   4 · LA VEILLE ECRIT LA OU ON REGARDE
   ============================================================ */
titre("4 · LE RENOMMAGE DANS L'AGENDA, ET SON RETRAIT");
{
  remise();
  const j = jourOffert();
  const ev = poser("dentiste", j.date, 6, 30, 7, 30);

  const r = gs.veilleBlocages();
  dire("la veille en trouve un", r.sansEffet, 1);
  dire("elle en renomme un", r.marques, 1);
  dire("le titre porte la marque, dans l'agenda", ev.titre,
    "⚠ NE BLOQUE RIEN · dentiste",
    "c'est la qu'on a fait l'erreur, c'est la qu'on la voit");

  /* DEUX PASSAGES NE DOIVENT PAS EMPILER DEUX MARQUES. */
  const r2 = gs.veilleBlocages();
  dire("un second passage ne renomme rien", r2.marques, 0);
  dire("le titre n'a pas double sa marque", ev.titre, "⚠ NE BLOQUE RIEN · dentiste");

  /* ON LE DEPLACE DANS LA JOURNEE : la marque doit PARTIR. Une
     alerte qui reste apres la correction devient un decor. */
  ev.debut = aLHeure(j.date, 14, 0);
  ev.fin = aLHeure(j.date, 15, 0);
  const r3 = gs.veilleBlocages();
  dire("deplace dans la journee, il n'est plus signale", r3.sansEffet, 0);
  dire("et la marque est retiree", r3.demarques, 1);
  dire("le titre est redevenu le sien", ev.titre, "dentiste");
}

/* ============================================================
   5 · L'ONGLET DU CLASSEUR
   ============================================================ */
titre("5 · CE QUE LE CLASSEUR EN DIT");
{
  remise();
  const j = jourOffert();
  poser("=IMPORTXML(\"http://x\",\"//a\")", j.date, 6, 0, 7, 0);
  poser("cours de guitare", j.date, 21, 0, 22, 0);
  gs.veilleBlocages();

  const f = etat.feuilles.get("⚠ Blocages sans effet");
  dire("l'onglet existe", !!f, true);
  dire("il a son en-tete", (f.valeurs[0] || []).join(" | "),
    "Ce que vous aviez bloqué | Quand, exactement | Pourquoi ça ne bloque rien");
  const lignes = f.valeurs.slice(1).filter((r) => (r || []).some((c) => c));
  dire("il liste les deux blocages, plus la date de verification", lignes.length, 3);

  /* UN TITRE D'EVENEMENT EST DU TEXTE DE VISITEUR COMME UN AUTRE —
     sauf qu'il vient de nous. Il passe quand meme par `texteInerte` :
     un associe qui nomme un evenement « =SOMME... » ne doit pas
     poser une formule dans le classeur de l'agence. */
  dire("un titre commencant par « = » n'est pas devenu une formule",
    f.formules.size, 0,
    f.formules.size ? [...f.formules].join(", ") : "");

  /* QUAND TOUT VA BIEN, L'ONGLET LE DIT AVEC UNE DATE. Un onglet
     vide se lit « rien a signaler » ET « la veille n'a jamais
     tourne » — deux choses tres differentes. */
  remise();
  gs.veilleBlocages();
  const f2 = etat.feuilles.get("⚠ Blocages sans effet");
  dire("sans blocage, il porte quand meme la date de verification",
    /Aucun blocage sans effet — vérifié le /.test(String((f2.valeurs[1] || [])[0] || "")), true,
    String((f2.valeurs[1] || [])[0] || ""));
}

/* ============================================================
   6 · LE DECLENCHEUR
   ============================================================ */
titre("6 · LE FILET QUOTIDIEN");
{
  etat.declencheurs.length = 0;
  gs.poserVeille();
  /* ON CHERCHE LE DECLENCHEUR PAR SON NOM, ON NE PREND PAS LE
     PREMIER DE LA LISTE. D-763 en a pose un second — celui du
     changement d'agenda — et ces trois cas sont tombes en accusant
     un code parfaitement sain : ils avaient « il n'y en a qu'un »
     appris par coeur. Le reste de la veille, lui, n'avait pas bouge.
     Ce que cet outil garde, c'est le FILET ; le declencheur de
     changement se juge dans `declencheur-check.mjs`. */
  const filets = etat.declencheurs.filter(
    (t) => t.getHandlerFunction() === "veilleBlocages");
  dire("il est pose", filets.length, 1);
  dire("il appelle la veille", filets[0] && filets[0].getHandlerFunction(), "veilleBlocages");
  dire("tous les jours", filets[0] && filets[0].jours, 1);

  /* RELANCER `initialiser()` NE DOIT PAS EN EMPILER DOUZE. */
  gs.poserVeille();
  gs.poserVeille();
  dire("trois poses, un seul filet",
    etat.declencheurs.filter((t) => t.getHandlerFunction() === "veilleBlocages").length, 1);
}

console.log("");
console.log("============================================================");
console.log(ko ? ("LA VEILLE NE TIENT PAS : " + ko + " echec(s) sur " + n)
              : ("LA VEILLE TIENT : " + n + " / " + n));
console.log("============================================================");
process.exit(ko ? 1 : 0);
