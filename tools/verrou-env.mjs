/* ============================================================
   LE VERROU — rien ne part en production sans ces sept preuves
   `node tools/verrou-env.mjs`

   CE QU'UN VERROU DOIT FAIRE, ET CE QU'IL NE DOIT PAS.
   Un verrou qui verifie « la cle existe » ne verifie rien : une
   cle peut exister et pointer sur du vide. Celui-ci APPELLE le
   service et lit sa reponse. Il echoue quand la production
   echouerait, pas avant.

   IL VERIFIE AUSSI LE SENS INVERSE — que les vraies valeurs ne
   TRAINENT PAS dans un fichier suivi par git. Le jour ou quelqu'un
   colle l'adresse directement dans `js/main.js` « juste pour
   essayer », ce verrou le dit avant le commit, pas apres le push.

   Sortie : 0 si tout tient, 1 sinon. Utilisable en pre-commit.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { lireEnv, jugerUrl } from "./config-envoi.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");

const resultats = [];
function verifier(nom, fn) {
  try {
    const detail = fn();
    resultats.push({ nom, ok: true, detail: detail || "" });
  } catch (e) {
    resultats.push({ nom, ok: false, detail: String(e.message || e) });
  }
}

/* Ce qui ressemble a une adresse de deploiement Apps Script. */
const MOTIF_URL = /https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]{20,}\/(exec|dev)/;

const env = lireEnv();
const URL_ENVOI = (env.APED_WEB_APP_URL || "").trim();


/* --- 1 · `.env.local` existe ------------------------------- */
verifier(".env.local existe", () => {
  const f = path.join(RACINE, ".env.local");
  if (!fs.existsSync(f)) {
    throw new Error("absent — `cp .env.local.example .env.local` puis remplissez-le");
  }
  return f;
});

/* --- 2 · l'adresse a la bonne forme ------------------------ */
verifier("APED_WEB_APP_URL est une adresse /exec", () => {
  const faute = jugerUrl(URL_ENVOI);
  if (faute) throw new Error(faute);
  return "… " + URL_ENVOI.slice(-10);
});

/* --- 3 · `.env.local` n'est PAS suivi par git --------------- */
verifier(".env.local n’est pas suivi par git", () => {
  let suivis = "";
  try {
    suivis = execFileSync("git", ["ls-files", ".env.local", ".env", "js/config.local.js"],
      { cwd: RACINE, encoding: "utf8" }).trim();
  } catch (e) {
    return "(hors dépôt git — vérification sautée)";
  }
  if (suivis) {
    throw new Error("CES FICHIERS SONT SUIVIS PAR GIT : " + suivis.split("\n").join(", ")
      + " — `git rm --cached <fichier>` puis recommitez");
  }
  return "aucun";
});

/* --- 4 · aucune adresse en clair dans les fichiers suivis ---
   LA VERIFICATION QUI COMPTE VRAIMENT. On interroge git, pas le
   disque : un fichier ignore peut porter l'adresse, c'est son
   role. Ce qu'on refuse, c'est qu'elle soit SUIVIE. */
verifier("aucune adresse de déploiement dans un fichier suivi", () => {
  let liste = [];
  try {
    liste = execFileSync("git", ["ls-files"], { cwd: RACINE, encoding: "utf8" })
      .split("\n").filter(Boolean);
  } catch (e) {
    return "(hors dépôt git — vérification sautée)";
  }
  const coupables = [];
  for (const rel of liste) {
    if (!/\.(js|mjs|html|css|json|md|gs|txt|yml|yaml)$/i.test(rel)) continue;
    /* Le modele et le guide CITENT la forme de l'adresse pour
       l'expliquer : ce sont des exemples, pas des valeurs. On les
       reconnait a leurs X, pas a leur nom de fichier — sinon il
       suffirait de coller un vrai secret dans le guide. */
    let texte;
    try { texte = fs.readFileSync(path.join(RACINE, rel), "utf8"); } catch (e) { continue; }
    const trouves = texte.match(new RegExp(MOTIF_URL, "g")) || [];
    for (const t of trouves) {
      if (/X{8,}/.test(t)) continue;                 /* exemple assume */
      if (URL_ENVOI && t === URL_ENVOI) { coupables.push(rel + " (l’adresse réelle)"); break; }
      coupables.push(rel);
      break;
    }
  }
  if (coupables.length) {
    throw new Error("adresse en clair dans : " + coupables.join(", "));
  }
  return liste.length + " fichiers relus";
});

/* --- 5 · `js/config.local.js` existe et porte la bonne adresse */
verifier("js/config.local.js est à jour", () => {
  const f = path.join(RACINE, "js", "config.local.js");
  if (!fs.existsSync(f)) {
    throw new Error("absent — lancez `node tools/config-envoi.mjs`");
  }
  const texte = fs.readFileSync(f, "utf8");
  if (!texte.includes(URL_ENVOI)) {
    throw new Error("il porte une AUTRE adresse que .env.local — relancez "
      + "`node tools/config-envoi.mjs`");
  }
  return "concorde avec .env.local";
});

/* --- 6 · le site le charge avant main.js -------------------- */
verifier("index.html charge config.local.js avant main.js", () => {
  const html = fs.readFileSync(path.join(RACINE, "index.html"), "utf8");
  const iCfg = html.indexOf("js/config.local.js");
  const iMain = html.indexOf("js/main.js");
  if (iCfg < 0) throw new Error("index.html ne charge pas js/config.local.js");
  if (iMain < 0) throw new Error("index.html ne charge pas js/main.js");
  if (iCfg > iMain) throw new Error("config.local.js est chargé APRÈS main.js : "
    + "FORM_ENDPOINT serait lu avant d’être posé");
  return "dans le bon ordre";
});

/* --- 7 · le service repond, pour de vrai -------------------- */
const attendre = (async () => {
  if (!URL_ENVOI || jugerUrl(URL_ENVOI)) {
    resultats.push({ nom: "le service répond", ok: false,
      detail: "sautée — pas d’adresse valide à interroger" });
    return;
  }
  try {
    /* `doGet` est un temoin de vie : il n'ecrit rien et ne revele
       rien. `redirect: follow` est indispensable — une Web App
       Apps Script repond toujours par une redirection vers
       `script.googleusercontent.com`. */
    const res = await fetch(URL_ENVOI, { method: "GET", redirect: "follow" });
    const corps = (await res.text()).slice(0, 300);
    let data = null;
    try { data = JSON.parse(corps); } catch (e) { /* pas du JSON */ }

    if (!data) {
      resultats.push({ nom: "le service répond", ok: false,
        detail: `HTTP ${res.status}, réponse non-JSON : ${corps.slice(0, 120)}` });
      return;
    }
    if (data.success !== true) {
      resultats.push({ nom: "le service répond", ok: false,
        detail: `HTTP ${res.status}, success=${data.success}` });
      return;
    }
    resultats.push({ nom: "le service répond", ok: true,
      detail: `HTTP ${res.status} · service « ${data.service} » · `
        + `Calendar avancé : ${data.calendrier ? "actif" : "ABSENT"}` });

    /* Le service avancé Calendar est ce qui fabrique les liens
       Meet. Absent, les réservations en visioconférence
       tomberaient en événement sans lien. */
    if (!data.calendrier) {
      resultats.push({ nom: "le service avancé Calendar est activé", ok: false,
        detail: "ABSENT — les réservations Google Meet n’auront pas de lien. "
          + "Éditeur Apps Script > Services > + > Calendar API > Ajouter." });
    } else {
      resultats.push({ nom: "le service avancé Calendar est activé", ok: true, detail: "actif" });
    }
  } catch (e) {
    resultats.push({ nom: "le service répond", ok: false,
      detail: "injoignable : " + String(e.message || e) });
  }
})();

await attendre;


/* --- le verdict -------------------------------------------- */
console.log("\n============================================================");
console.log("LE VERROU DE L’ENVOI");
console.log("============================================================\n");
for (const r of resultats) {
  console.log(`  ${r.ok ? "✓" : "✗"} ${r.nom}`);
  if (r.detail) console.log(`      ${r.detail}`);
}
const tombees = resultats.filter((r) => !r.ok);
console.log("\n------------------------------------------------------------");
if (tombees.length) {
  console.log(`VERDICT : ${tombees.length} vérification(s) en échec. `
    + "Le site N’EST PAS prêt à recevoir des formulaires.");
  console.log("Le guide : docs/CONFIGURATION-GOOGLE-APED.md");
  process.exit(1);
}
console.log("VERDICT : les sept tiennent. Les formulaires livrent.");
process.exit(0);
