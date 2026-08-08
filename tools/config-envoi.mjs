/* ============================================================
   FABRIQUE `js/config.local.js` A PARTIR DE `.env.local`
   `node tools/config-envoi.mjs`

   POURQUOI CE DETOUR. Le site est statique : pas de build, pas de
   serveur, donc rien qui puisse lire une variable d'environnement
   au moment de servir la page. Le navigateur ne connait que des
   fichiers. Il faut donc en ECRIRE un — mais un fichier que git ne
   suit pas, pour que l'adresse du deploiement ne parte pas dans un
   depot public.

   CE QUE CE FICHIER NE PRETEND PAS FAIRE. L'adresse finit dans le
   navigateur du visiteur ; elle est lisible dans l'onglet reseau.
   Ce n'est pas un secret au sens fort et il ne faut pas se
   raconter le contraire. Ce qu'on protege ici, c'est le DEPOT et
   son historique — pas la requete. La defense du service est
   ailleurs : le honeypot, la validation serveur, le verrou.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const ENV = path.join(RACINE, ".env.local");
const SORTIE = path.join(RACINE, "js", "config.local.js");

/* Un lecteur de `.env` minimal : `CLE=valeur`, les lignes vides et
   les `#` sautes, les guillemets retires. On n'ajoute pas une
   dependance pour douze lignes. */
export function lireEnv(fichier = ENV) {
  if (!fs.existsSync(fichier)) return {};
  const out = {};
  for (const ligne of fs.readFileSync(fichier, "utf8").split(/\r?\n/)) {
    const t = ligne.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    const cle = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[cle] = val;
  }
  return out;
}

/* L'adresse doit etre une Web App Apps Script DEPLOYEE. Une `/dev`
   exige d'etre connecte au compte proprietaire : elle repondrait au
   developpeur et a personne d'autre, et le defaut ne se verrait
   qu'en production. */
export function jugerUrl(url) {
  if (!url) return "ADEXWEB_WEB_APP_URL est vide dans .env.local.";
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(url)) {
    if (url.endsWith("/dev")) {
      return "L’adresse se termine par /dev. Seule une adresse /exec "
        + "repond aux visiteurs : /dev exige d’être connecté au compte "
        + "propriétaire.";
    }
    return "L’adresse n’a pas la forme attendue "
      + "https://script.google.com/macros/s/…/exec";
  }
  return null;
}

/* `JSON.stringify` et pas des guillemets a la main : une adresse
   porteuse d'un guillemet casserait le fichier genere, et c'est le
   genre de panne qu'on ne comprend qu'apres une heure. */
function ecrire(url) {
  const contenu = `/* FABRIQUE — NE PAS MODIFIER, NE PAS COMMITER.
   Genere par \`node tools/config-envoi.mjs\` depuis \`.env.local\`.
   Ce fichier est dans le .gitignore : le regenerer suffit toujours.
   Charge en tete de la vague 1, donc avant \`main.js\` qui le lit.
   Vide = rien n'est branche, et les formulaires echouent franchement. */
window.ADEXWEB_ENVOI = ${JSON.stringify(url || "")};
`;
  fs.mkdirSync(path.dirname(SORTIE), { recursive: true });
  fs.writeFileSync(SORTIE, contenu, "utf8");
}

function principal() {
  const env = lireEnv();
  const url = (env.ADEXWEB_WEB_APP_URL || "").trim();
  const faute = jugerUrl(url);

  /* PAS D'ADRESSE ? ON ECRIT QUAND MEME, MAIS VIDE.
     La premiere version sortait en erreur sans rien ecrire. Le
     fichier restait absent, l'injecteur le demandait quand meme, et
     CHAQUE chargement de page portait un 404 dans la console. Or
     plusieurs outils du depot — `verif.mjs`, `formulaires-prod.mjs`
     — exigent zero erreur console : un depot fraichement clone les
     faisait tous echouer sur du bruit.
     Un fichier neutre coute quatre lignes et rend le defaut
     silencieux, sans rien brancher : `FORM_ENDPOINT` vaut "", donc
     `sansPoint()` rend exactement l'echec franc d'avant.
     `--strict` remet l'echec dur, pour une chaine de mise en
     production qui doit refuser de continuer. */
  if (faute) {
    ecrire("");
    console.warn("⚠ " + faute);
    console.warn("  js/config.local.js écrit À VIDE : les formulaires n’enverront rien.");
    console.warn("");
    console.warn("  1. cp .env.local.example .env.local");
    console.warn("  2. collez l’adresse du déploiement dans ADEXWEB_WEB_APP_URL");
    console.warn("  3. relancez `node tools/config-envoi.mjs`");
    console.warn("");
    console.warn("  Le guide complet : docs/CONFIGURATION-GOOGLE.md");
    process.exit(process.argv.includes("--strict") ? 1 : 0);
  }

  ecrire(url);

  /* On n'affiche pas l'adresse entiere : ce journal finit dans des
     copies d'ecran et des rapports. L'empreinte suffit a verifier
     qu'on a bien pose celle qu'on croyait. */
  const empreinte = url.slice(-10);
  console.log("✓ js/config.local.js écrit.");
  console.log("  adresse /exec se terminant par … " + empreinte);
  console.log("  Vérifiez avec : node tools/verrou-env.mjs");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) principal();
