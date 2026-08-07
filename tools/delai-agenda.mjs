/* ============================================================
   COMBIEN DE SECONDES ENTRE LE GESTE ET LE SITE
   `node tools/delai-agenda.mjs`

   CE QU'IL MESURE.  D-763
   Le temps réel entre le moment où on touche l'agenda et le moment
   où `?action=creneaux` cesse d'offrir le créneau. C'est le seul
   chiffre que le banc ne peut pas donner : le délai appartient à
   Google, pas au code.

   IL NE PEUT PAS POSER L'ÉVÉNEMENT LUI-MÊME. L'agenda est celui
   d'apedagence ; ce poste parle au service, pas au calendrier. On
   sonde donc en continu, et c'est LE GESTE HUMAIN qui démarre le
   chronomètre — le tour de sonde où le créneau est encore là
   donne la borne basse, celui où il a disparu la borne haute.

   POURQUOI IL DONNE UN INTERVALLE ET PAS UN CHIFFRE ROND :
   entre deux sondes il se passe PAS_MS. Annoncer « 4 s » quand on
   sonde toutes les 2 s serait inventer une précision qu'on n'a
   pas. Il rend « entre 2 et 4 s », et l'écart est le pas.

   IL EST GRATUIT EN COURRIELS. `?action=creneaux` ne poste rien,
   n'écrit rien, n'envoie rien.

   Sorties : 0 mesure prise · 2 impossible de conclure.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");

const env = fs.readFileSync(path.join(RACINE, ".env.local"), "utf8");
const m = /^APED_WEB_APP_URL=(.+)$/m.exec(env);
if (!m) { console.error("APED_WEB_APP_URL absent de .env.local"); process.exit(2); }
const SERVICE = m[1].trim();

const PAS_MS = Number(process.env.PAS_MS || 2000);
const PATIENCE_MS = Number(process.env.PATIENCE_MS || 300000);
const VERSION_MINIMALE = 10;

async function lire(q) {
  const r = await fetch(SERVICE + (q ? "?" + q : ""), { redirect: "follow" });
  const t = await r.text();
  try { return JSON.parse(t); } catch { return null; }
}

/* L'empreinte de ce que le site OFFRE. On compare des ensembles de
   créneaux, pas un compte : un blocage qui en retire un pendant
   qu'un autre s'en libère laisserait le total identique. */
function empreinte(r) {
  const out = new Set();
  (r.jours || []).forEach((j) => (j.creneaux || []).forEach(
    (c) => out.add(j.date + " " + c.h)));
  return out;
}
const hms = () => new Date().toLocaleTimeString("fr-CA");

/* ============================================================ */
const vie = await lire("");
if (!vie) { console.error("Le service n'a pas répondu en JSON."); process.exit(2); }
console.log("VERSION DÉPLOYÉE : " + vie.version + "   (minimum exigé : " + VERSION_MINIMALE + ")");

if (!(Number(vie.version) >= VERSION_MINIMALE)) {
  console.error("\nARRÊT — ce déploiement n'a pas le déclencheur de changement.");
  console.error("Mesurer ici donnerait le délai du CACHE (jusqu'à "
    + "90 s), pas celui du déclencheur, et le chiffre serait un mensonge.");
  process.exit(2);
}

/* LE DÉCLENCHEUR EST-IL SEULEMENT POSÉ ? Sans ce contrôle, l'outil
   mesurerait consciencieusement l'expiration du cache et
   l'appellerait « délai du déclencheur ». */
const d = vie.declencheurs || {};
console.log("DÉCLENCHEURS POSÉS : changement " + d.changement
  + " · filet quotidien " + d.quotidien
  + (d.erreur ? "  (illisibles : " + d.erreur + ")" : ""));
if (!(Number(d.changement) >= 1)) {
  console.error("\nARRÊT — le déclencheur de changement n'est PAS posé.");
  console.error("Lancez `initialiser()` dans l'éditeur Apps Script, puis");
  console.error("acceptez l'autorisation d'agenda qu'il demande.");
  console.error("Sans lui, le délai mesuré serait celui du cache, pas du déclencheur.");
  process.exit(2);
}

const base = await lire("action=creneaux");
if (!base || !base.success) { console.error("La porte des créneaux n'a rien rendu."); process.exit(2); }
const avant = empreinte(base);
if (!avant.size) { console.error("Aucun créneau offert : rien à voir disparaître."); process.exit(2); }

console.log("");
console.log("============================================================");
console.log(avant.size + " créneaux offerts à " + hms() + ".");
console.log("");
console.log("  MAINTENANT : dans l'agenda d'apedagence, posez un");
console.log("  événement sur une plage ouvrable (9 h – 20 h), un jour");
console.log("  ouvré, au moins 24 h à l'avance. Notez l'heure exacte");
console.log("  où vous appuyez sur « Enregistrer ».");
console.log("");
console.log("  Je sonde toutes les " + (PAS_MS / 1000) + " s pendant "
  + (PATIENCE_MS / 60000) + " min.");
console.log("============================================================");
console.log("");

const t0 = Date.now();
let precedent = t0;
let tours = 0;

while (Date.now() - t0 < PATIENCE_MS) {
  await new Promise((r) => setTimeout(r, PAS_MS));
  tours++;
  const r = await lire("action=creneaux");
  if (!r || !r.success) { console.log("  " + hms() + " · le service n'a pas répondu, je continue"); continue; }
  const apres = empreinte(r);

  const partis = [...avant].filter((x) => !apres.has(x));
  const venus = [...apres].filter((x) => !avant.has(x));
  const vu = Date.now();

  if (!partis.length && !venus.length) {
    if (tours % 5 === 0) {
      console.log("  " + hms() + " · rien n'a bougé (" + apres.size + " créneaux)");
    }
    precedent = vu;
    continue;
  }

  const bas = Math.round((precedent - t0) / 100) / 10;
  const haut = Math.round((vu - t0) / 100) / 10;

  console.log("");
  console.log("============================================================");
  console.log("CHANGEMENT VU À " + hms());
  if (partis.length) {
    console.log("  " + partis.length + " créneau(x) ONT DISPARU :");
    partis.slice(0, 8).forEach((x) => console.log("      " + x));
    if (partis.length > 8) console.log("      … et " + (partis.length - 8) + " autres");
  }
  if (venus.length) {
    console.log("  " + venus.length + " créneau(x) sont APPARUS :");
    venus.slice(0, 8).forEach((x) => console.log("      " + x));
  }
  console.log("");
  console.log("  DÉLAI DEPUIS LE DÉBUT DE LA SONDE : entre " + bas + " s et " + haut + " s");
  console.log("  (le pas de sonde est de " + (PAS_MS / 1000) + " s ; l'écart, c'est lui)");
  console.log("");
  console.log("  CE CHIFFRE COMPTE À PARTIR DU DÉBUT DE LA SONDE, PAS");
  console.log("  DE VOTRE CLIC. Retirez le temps que vous avez mis à");
  console.log("  poser l'événement — c'est ce qui reste qui est le");
  console.log("  délai de Google.");
  console.log("");
  console.log("  Le cache seul aurait mis jusqu'à 90 s. Sous 90 s,");
  console.log("  c'est le déclencheur qui a parlé.");
  console.log("============================================================");
  process.exit(0);
}

console.log("");
console.log("============================================================");
console.log("RIEN N'A BOUGÉ EN " + (PATIENCE_MS / 60000) + " MINUTES.");
console.log("");
console.log("Ça ne dit PAS que le déclencheur est mort. Ça dit que le");
console.log("site offre les mêmes créneaux. Trois causes possibles :");
console.log("  · l'événement est tombé HORS de 9 h – 20 h — il ne bloque");
console.log("    rien, et c'est exactement ce que la veille signale ;");
console.log("  · il est à moins de 24 h — la plage n'était déjà plus offerte ;");
console.log("  · il est posé dans un agenda que le compte de l'agence ne lit pas.");
console.log("");
console.log("Regardez l'onglet « ⚠ Blocages sans effet » du classeur.");
console.log("============================================================");
process.exit(2);
