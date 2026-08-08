/* ============================================================
   LES SEPT PARCOURS CONTRE LE VRAI SERVICE
   `node tools/prod-parcours.mjs <parcours> [...]`
   `node tools/prod-parcours.mjs --etat`      — quota, lignes, rien d'autre
   `node tools/prod-parcours.mjs --nettoyer`  — retire les lignes d'essai

   CE QU'IL PROUVE, ET CE QU'IL NE PROUVE PAS.  D-790

   IL PARLE AU VRAI GOOGLE. Chaque envoi ecrit une vraie ligne, part
   d'un vrai courriel, et consomme le quota des cent par jour. C'est
   le seul moyen de savoir si le banc disait vrai — il a deja menti
   une fois, sur l'injection de formule (D-757).

   IL NE SAIT PAS LIRE UNE BOITE DE COURRIEL. Ce qu'il peut affirmer
   d'un envoi, c'est qu'il est PARTI : le quota descend, et de
   combien. L'objet, le corps, le « Repondre a » et les pieces
   jointes se verifient dans la boite de l'agence, par un humain.
   Tout ce que cet outil ecrit sur un courriel est donc soit un
   COMPTE, soit une lecture de `Code.gs` — jamais « le courriel dit
   ceci ». Ne lui fais pas dire autre chose.

   LES LIGNES SONT MARQUEES. Toutes portent une adresse en
   `@exemple.ca` : `diagnostic()` les rend en clair — une vraie ligne
   de client ne sortirait jamais par cette porte — et
   `nettoyerAutotest()` les retire.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const env = fs.readFileSync(path.join(RACINE, ".env.local"), "utf8");
const URL_SERVICE = (/^APED_WEB_APP_URL=(.+)$/m.exec(env) || [])[1];
const CLE = ((/^APED_DIAG_CLE=(.+)$/m.exec(env) || [])[1] || "").trim();
if (!URL_SERVICE) { console.error("APED_WEB_APP_URL absent de .env.local"); process.exit(2); }
if (!CLE) { console.error("APED_DIAG_CLE absent de .env.local"); process.exit(2); }
const SERVICE = URL_SERVICE.trim();

let n = 0, ko = 0;
export function dire(nom, obtenu, attendu, note) {
  n++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) ko++;
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + nom
    + (ok ? "" : "\n         obtenu  : " + JSON.stringify(obtenu)
             + "\n         attendu : " + JSON.stringify(attendu))
    + (note ? "\n         " + note : ""));
}
const titre = (t) => { console.log(""); console.log("--- " + t); };

/* Le jeton de session, comme le navigateur le garde. */
const JETONS = new Map();

async function poster(charge) {
  const c = Object.assign({}, charge);
  if (c._sid && c._jeton === undefined && JETONS.has(c._sid)) c._jeton = JETONS.get(c._sid);
  if (c._jeton === null) delete c._jeton;
  const r = await fetch(SERVICE, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(c)
  });
  const t = await r.text();
  let rep;
  try { rep = JSON.parse(t); }
  catch { rep = { success: false, brut: t.slice(0, 200) }; }
  if (c._sid && rep && rep.jeton) JETONS.set(c._sid, rep.jeton);
  return rep;
}

async function diag() {
  const r = await fetch(SERVICE + "?action=diag&cle=" + encodeURIComponent(CLE), { redirect: "follow" });
  const t = await r.text();
  try { return JSON.parse(t); }
  catch { console.error("diag n'a pas rendu de JSON : " + t.slice(0, 200)); process.exit(2); }
}

/* LA LIGNE TELLE QUE LE CLASSEUR LA PORTE. On relit le VRAI
   classeur, jamais ce que la reponse a bien voulu dire. */
export async function ligneDe(onglet, marqueur) {
  const d = await diag();
  const o = (d.onglets || []).find((x) => x.onglet === onglet);
  if (!o) { console.error("Onglet « " + onglet + " » absent du diagnostic."); process.exit(2); }
  const lignes = (o.lignesEssai || []).filter((l) =>
    (l.cellules || []).some((c) => String(c.valeur || "").indexOf(marqueur) !== -1));
  return lignes.length ? lignes[lignes.length - 1] : null;
}
export const val = (ligne, titreCol) => {
  if (!ligne) return "(aucune ligne)";
  const c = (ligne.cellules || []).find((x) => x.titre === titreCol);
  return c ? String(c.valeur == null ? "" : c.valeur) : "(colonne absente)";
};
export const formuleDe = (ligne, titreCol) => {
  if (!ligne) return "(aucune ligne)";
  const c = (ligne.cellules || []).find((x) => x.titre === titreCol);
  return c ? String(c.formule == null ? "" : c.formule) : "(colonne absente)";
};

export async function quota() { return (await diag()).quota; }
export { poster, diag, titre };

/* ------------------------------------------------------------
   L'ETAT, ET LE GARDE-FOU DU QUOTA
   ------------------------------------------------------------ */
export async function etat(quoi) {
  const d = await diag();
  console.log((quoi || "ETAT") + " · quota " + d.quota + " · lignes "
    + (d.onglets || []).map((o) => o.onglet.slice(0, 12) + ":" + o.lignesTotal).join("  "));
  if (d.quota <= 15) {
    console.error("\nARRET — quota d'envoi a " + d.quota + ". Seuil d'alerte : 15.");
    process.exit(3);
  }
  return d;
}

export function bilan(nom) {
  console.log("");
  console.log("============================================================");
  console.log(ko ? (nom + " : " + ko + " echec(s) sur " + n) : (nom + " : " + n + " / " + n));
  console.log("============================================================");
  return ko;
}
