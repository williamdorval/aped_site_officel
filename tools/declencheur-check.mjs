/* ============================================================
   LE SITE SUIT L'AGENDA — `node tools/declencheur-check.mjs`

   CE QU'IL GARDE.  D-763

   Le cache des créneaux de D-758 protégeait des robots, mais il
   faisait mentir la page pendant 90 secondes après chaque blocage
   posé au téléphone. Le déclencheur `onEventUpdated` le vide dès
   que l'agenda bouge — et le vidage doit survivre à tout ce qui
   peut mal tourner dans la veille qui le suit.

   CE QU'IL NE PEUT PAS PROUVER, ET QUI SE MESURE AILLEURS :
   le DÉLAI réel entre le geste et le vidage. Google ne promet
   rien de mieux que « au mieux-effort ». Seul un chronomètre
   contre le vrai service donne un chiffre, et c'est
   `tools/delai-agenda.mjs` qui le prend.

   Sorties : 0 tout tient · 1 défaut.
   ============================================================ */
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const { gs, etat, services } = await import(
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

/* LE CACHE SE LIT DANS LE BOUCHON, PAS PAR LA PORTE — passer par
   la porte le regarnirait, et la mesure detruirait ce qu'elle
   mesure. */
const CLE = "creneaux-v1";
const garni = () => Object.prototype.hasOwnProperty.call(etat.cache, CLE);
/* L'HORLOGE AVANCE ENTRE DEUX LECTURES. Le cache du banc a une
   vraie expiration ; sans ce pas, deux appels de suite liraient la
   meme reponse et le test ne verrait jamais un vidage.  D-758 */
function garnir() {
  etat.decalageHorloge += 120000;
  gs.doGet({ parameter: { action: "creneaux" } });
}
function remise() {
  etat.evenements.length = 0;
  etat.renommages.length = 0;
  etat.declencheurs.length = 0;
  etat.cache = {};
  etat.decalageHorloge = 0;
}

console.log("============================================================");
console.log("LE SITE SUIT L'AGENDA");
console.log("============================================================");

/* ============================================================
   1 · LE VIDAGE — le seul geste que le visiteur voit
   ============================================================ */
titre("1 · LE CACHE TOMBE QUAND L'AGENDA BOUGE");
{
  remise();
  garnir();
  dire("la porte des créneaux garnit le cache", garni(), true);
  gs.surChangementAgenda({});
  dire("un changement d'agenda le vide", garni(), false,
    "sans ça le site montre un créneau déjà bloqué");
}

/* LA RAISON D'ÊTRE DE L'ORDRE DES DEUX GESTES. On casse la veille
   — c'est elle qui parle au calendrier, donc elle qui peut mourir
   — et on vérifie que le cache tombe quand même. Si le vidage
   passait après, ou dans le même `try`, une veille en échec
   laisserait le site en retard sans que rien ne le dise. */
titre("2 · UNE VEILLE QUI MEURT NE RETIENT PAS LE VIDAGE");
{
  remise();
  garnir();
  const vrai = services.Calendar.Events.list;
  services.Calendar.Events.list = () => { throw new Error("agenda injoignable"); };
  let leve = false;
  try { gs.surChangementAgenda({}); } catch (e) { leve = true; }
  services.Calendar.Events.list = vrai;

  dire("le déclencheur ne laisse pas fuir l'erreur", leve, false,
    "Google désactive un déclencheur qui lève trop souvent");
  dire("le cache est vidé quand même", garni(), false,
    "c'est pour ça que le vidage est AVANT le try, pas dedans");
}

/* ============================================================
   3 · LA SOUPAPE — sans jamais sacrifier le vidage
   ============================================================ */
titre("3 · LA SOUPAPE LÂCHE LA VEILLE, JAMAIS LE VIDAGE");
{
  remise();
  const plafond = gs.REGLAGES.VEILLE_REVEILS_MAX;
  dire("le plafond est réglable, pas écrit en dur", typeof plafond, "number");

  /* ON COMPTE LES APPELS AU CALENDRIER, PAS LES RENOMMAGES.
     Compter les renommages ne prouvait RIEN : `veilleBlocages` est
     idempotente — une fois l'événement marqué elle ne le renomme
     plus — et sur un agenda vide elle n'en fait aucun. Le compteur
     restait a zero que la soupape marche ou pas, et la mutation
     « soupape retiree » survivait. Ce qui distingue les deux etats,
     c'est qu'une veille qui tourne PARLE au calendrier. */
  const vrai = services.Calendar.Events.list;
  let appels = 0;
  services.Calendar.Events.list = function () {
    appels++; return vrai.apply(this, arguments);
  };

  gs.surChangementAgenda({});
  const parReveil = appels;
  dire("une veille qui tourne interroge le calendrier", parReveil > 0, true);

  for (let i = 0; i < plafond + 5; i++) gs.surChangementAgenda({});
  const avant = appels;
  gs.surChangementAgenda({});
  dire("passé le plafond, la veille ne tourne plus", appels, avant,
    "sinon la soupape ne protège rien");

  garnir();
  dire("le cache se regarnit entre deux réveils", garni(), true);
  gs.surChangementAgenda({});
  dire("...mais le cache tombe TOUJOURS", garni(), false,
    "la soupape protège le quota, elle ne doit pas rendre le site faux");

  services.Calendar.Events.list = vrai;
}

/* ============================================================
   4 · CE QUE `poserVeille` POSE VRAIMENT
   ============================================================ */
titre("4 · LES DEUX DÉCLENCHEURS");
{
  remise();
  const e = gs.poserVeille();
  const h = etat.declencheurs.map((t) => t.getHandlerFunction());

  dire("le déclencheur de changement est posé",
    h.filter((x) => x === "surChangementAgenda").length, 1);
  dire("le filet quotidien aussi",
    h.filter((x) => x === "veilleBlocages").length, 1);
  dire("il rend ce qu'il a posé, il ne l'affirme pas", e.changement, true);
  dire("le filet est bien à 7 h",
    etat.declencheurs.find((t) => t.getHandlerFunction() === "veilleBlocages").heure, 7);

  /* LE DÉCLENCHEUR VISE UNE ADRESSE, PAS « primary ». Le vrai
     Google lève sur « primary » ; le banc aussi, exprès. */
  const d = etat.declencheurs.find((t) => t.getHandlerFunction() === "surChangementAgenda");
  dire("il vise une adresse d'agenda", /@/.test(String(d.agenda)), true,
    "forUserCalendar(« primary ») lève chez Google");
  dire("il écoute bien les événements", d.sur, "evenement");

  /* RELANCER `initialiser()` NE DOIT PAS EN EMPILER DOUZE. */
  gs.poserVeille();
  gs.poserVeille();
  const h2 = etat.declencheurs.map((t) => t.getHandlerFunction());
  dire("trois passages, toujours un seul de chaque",
    h2.filter((x) => x === "surChangementAgenda").length + "/"
    + h2.filter((x) => x === "veilleBlocages").length, "1/1");
}

titre("5 · CE QUI EST POSÉ SE LIT DEPUIS LA PORTE");
{
  remise();
  const vide = gs.declencheursPoses();
  dire("aucun déclencheur : la porte le dit", vide.changement + "/" + vide.quotidien, "0/0");
  gs.poserVeille();
  const plein = gs.declencheursPoses();
  dire("après la pose, elle les compte", plein.changement + "/" + plein.quotidien, "1/1");

  const vie = JSON.parse(gs.doGet({ parameter: {} }).getContent());
  dire("et `/exec` les rend, pour qu'on n'ait pas à croire",
    vie.declencheurs.changement, 1);
  dire("la version est montée", vie.version >= 10, true);
}

/* UN ÉCHEC DE POSE NE DOIT PAS PASSER POUR UNE RÉUSSITE. */
titre("6 · UN DÉCLENCHEUR QU'ON NE PEUT PAS POSER SE DIT");
{
  remise();
  const vrai = services.ScriptApp.newTrigger;
  services.ScriptApp.newTrigger = (nom) => {
    if (nom === "surChangementAgenda") throw new Error("autorisation refusée");
    return vrai(nom);
  };
  let e, leve = false;
  try { e = gs.poserVeille(); } catch (err) { leve = true; }
  services.ScriptApp.newTrigger = vrai;

  dire("`poserVeille` ne meurt pas pour autant", leve, false);
  dire("il DIT que le changement n'est pas posé", e && e.changement, false,
    "un déclencheur qu'on croit posé est pire que pas de déclencheur");
  dire("il en donne la raison", /autorisation/.test(String(e && e.pourquoi)), true);
  dire("et le filet quotidien est posé quand même", e && e.quotidien, true,
    "c'est justement le cas où le filet sert");
}

/* ============================================================
   7 · LA VEILLE TOURNE VRAIMENT AU CHANGEMENT
   ============================================================ */
titre("7 · UN BLOCAGE INERTE EST MARQUÉ SANS ATTENDRE DEMAIN");
{
  remise();
  /* On prend un jour que la porte OFFRE, plutot que de le calculer :
     le calculer, c'est reecrire le code teste. */
  etat.decalageHorloge += 120000;
  const r = JSON.parse(gs.doGet({ parameter: { action: "creneaux" } }).getContent());
  const jour = (r.jours || []).find((j) => j.creneaux.length > 0);
  if (!jour) { console.error("aucun jour offert — le banc n'est pas jugeable"); process.exit(2); }
  const [an, mois, j0] = jour.date.split("-").map(Number);

  /* 6 h 30, hors de la plage 9 h - 20 h : ne bloque rien. C'est
     exactement l'erreur du 10 aout. */
  etat.evenements.push({
    id: "EV-aube", titre: "dentiste", calId: "primary",
    debut: gs.instantLocal(an, mois, j0, 6, 30),
    fin: gs.instantLocal(an, mois, j0, 7, 30)
  });

  gs.surChangementAgenda({});
  const marque = etat.renommages.filter((x) => /NE BLOQUE RIEN/.test(x.titre || x.summary || ""));
  dire("le blocage inerte est marqué tout de suite", marque.length >= 1, true,
    "renommages vus : " + JSON.stringify(etat.renommages));
}

console.log("");
console.log("============================================================");
console.log(ko ? ("LE DÉCLENCHEUR NE TIENT PAS : " + ko + " échec(s) sur " + n)
              : ("LE SITE SUIT L'AGENDA : " + n + " / " + n));
console.log("============================================================");
process.exit(ko ? 1 : 0);
