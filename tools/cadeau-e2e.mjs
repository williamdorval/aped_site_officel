/* ============================================================
   LE POPUP, DE BOUT EN BOUT
   `node tools/cadeau-e2e.mjs [port] [--envoi-reel]`

   Ce script suit le parcours COMPLET d'un visiteur : il ouvre le
   popup, telecharge les deux documents, ouvre les fichiers recus et
   compte leurs pages, puis soumet un courriel et rapporte ce que le
   service d'envoi repond, mot pour mot.

   DEUX MODES, ET LA DIFFERENCE COMPTE :
   · par defaut, la requete d'envoi est INTERCEPTEE : on verifie
     qu'elle part, ou elle va et ce qu'elle transporte, sans qu'un
     courriel reel parte ;
   · avec `--envoi-reel`, la requete part VRAIMENT. Un courriel
     arrive alors dans la boite de l'agence. C'est le seul moyen de
     prouver la derniere etape, et c'est pour ca que ce mode est
     explicite plutot que par defaut.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PORT = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "8099";
const REEL = process.argv.includes("--envoi-reel");
const BASE = `http://127.0.0.1:${PORT}/`;
const SORTIE = path.join(RACINE, "refonte-captures", "cadeau-e2e");
const RECU = path.join(SORTIE, "recu");
fs.mkdirSync(RECU, { recursive: true });

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();

const R = { mode: REEL ? "envoi reel" : "envoi intercepte", erreurs: [], reseau: [] };
page.on("pageerror", (e) => R.erreurs.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") R.erreurs.push(m.text()); });

/* On observe TOUTE requete sortante vers le service d'envoi. */
page.on("request", (req) => {
  if (req.url().includes("formsubmit")) {
    R.reseau.push({ url: req.url(), methode: req.method(), corps: req.postData() });
  }
});
/* CE QUE LE SERVICE REPOND, MOT POUR MOT. La premiere version ne
   regardait que la requete sortante : elle prouvait qu'on avait
   parle, pas qu'on avait ete entendu. Un service d'envoi peut
   repondre 200 en disant « il faut d'abord confirmer l'adresse »,
   et ce message-la est precisement celui qu'il faut lire. */
page.on("response", async (res) => {
  if (!res.url().includes("formsubmit")) return;
  let corps = null;
  try { corps = (await res.text()).slice(0, 600); } catch (e) { corps = "(illisible)"; }
  R.reponse = { statut: res.status(), corps: corps };
});

if (!REEL) {
  /* Interception : on repond a la place du service, avec sa forme de
     reponse documentee, pour verifier le chemin sans envoyer. */
  await page.route("**/formsubmit.co/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: "true", message: "(reponse simulee, aucun courriel envoye)" })
    }));
}

await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); } catch (e) {} });
await page.goto(BASE, { waitUntil: "load" });

/* ---------- 1. le popup parait tout seul ----------
   Le declencheur principal est une ATTENTE de 11 s, a chaque
   chargement. On n'a plus rien a simuler : on attend, comme un
   visiteur. */
await page.waitForFunction(() => {
  const d = document.getElementById("cadeau");
  return d && d.open;
}, null, { timeout: 20000 });
await page.waitForTimeout(900);
R.ouvert = await page.evaluate(() => document.getElementById("cadeau").open);
await page.screenshot({ path: path.join(SORTIE, "01-popup-ouvert.png") });

/* ---------- 2. LE COURRIEL, PUIS LA REMISE ----------
   L'ORDRE A CHANGE, ET C'EST LE POINT DE LA REFONTE. Les deux
   liens ne sont plus offerts AVANT le champ : le popup n'a plus
   qu'une seule action. Ils sont devoiles a la seconde ou l'adresse
   est donnee — y compris si l'envoi echoue. On suit donc le
   parcours dans son vrai ordre. */
/* L'adresse reelle ne vit plus dans le fichier : elle se donne au
   lancement, `APED_COURRIEL=... node tools/cadeau-e2e.mjs --reel`.
   Rien d'autre ne change ici — c'est une valeur, pas un verdict. */
const ADRESSE = REEL ? (process.env.APED_COURRIEL || "test-parcours@aped-verification.ca") : "test-parcours@aped-verification.ca";
await page.fill("#cadeauEmail", ADRESSE);
await page.click(".cadeau-go");
/* Quinze secondes, pas trois : le premier contact avec un service
   d'envoi tiers est le plus lent, et conclure a l'echec au bout de
   trois secondes donnerait un faux negatif. */
await page.waitForTimeout(15000);
R.statutAffiche = await page.evaluate(() => {
  const p = document.querySelector("#cadeauForm .form-status");
  return { texte: p ? p.textContent.trim() : null, classe: p ? p.className : null };
});
R.remise = await page.evaluate(() => {
  const r = document.querySelector(".cadeau-recu");
  return { devoilee: r ? !r.hidden : false, liens: [...document.querySelectorAll(".cadeau-recu a")].map((a) => a.href) };
});
await page.screenshot({ path: path.join(SORTIE, "02-apres-envoi.png") });

/* ---------- 3. le visiteur telecharge les deux documents ---------- */
R.telechargements = [];
for (const cle of ["automatisation", "ia"]) {
  const [dl] = await Promise.all([
    page.waitForEvent("download"),
    page.click(`[data-cadeau-pdf="${cle}"]`)
  ]);
  const dest = path.join(RECU, dl.suggestedFilename());
  await dl.saveAs(dest);
  R.telechargements.push({
    cle,
    nom: dl.suggestedFilename(),
    ko: Math.round(fs.statSync(dest).size / 1024)
  });
}

/* ---------- 3. les fichiers RECUS s'ouvrent-ils vraiment ? ----------
   On ne se contente pas du code 200 : on ouvre chaque fichier
   telecharge, on verifie l'en-tete PDF et on compte les pages dans
   la structure du document. Un fichier servi n'est pas un fichier
   lisible. */
R.documents = R.telechargements.map((d) => {
  const buf = fs.readFileSync(path.join(RECU, d.nom));
  const tete = buf.subarray(0, 5).toString("latin1");
  const texte = buf.toString("latin1");
  /* Le nombre de pages se lit dans les objets `/Type /Page`. */
  const pages = (texte.match(/\/Type\s*\/Page[^s]/g) || []).length;
  return { nom: d.nom, ko: d.ko, entete: tete, estUnPdf: tete === "%PDF-", pages };
});

/* ---------- 5. le popup ne revient plus ----------
   Adresse donnee -> marqueur PERMANENT. Fermer sans donner son
   adresse ne pose que le marqueur de SESSION : ce sont deux
   portees differentes, et les confondre etait le defaut d'origine. */
R.marqueurs = await page.evaluate(() => {
  try {
    return {
      pourToujours: localStorage.getItem("aped-cadeau-donne"),
      pourLaSession: sessionStorage.getItem("aped-cadeau")
    };
  } catch (e) { return { pourToujours: "illisible", pourLaSession: "illisible" }; }
});

await ctx.close();
await nav.close();

R.verdict = {
  popupSOuvre: R.ouvert === true,
  deuxDocumentsRecus: R.documents.length === 2,
  lesDeuxSontDesPdfLisibles: R.documents.every((d) => d.estUnPdf && d.pages > 30),
  requeteDEnvoiPartie: R.reseau.length >= 1,
  destinataire: R.reseau[0] ? R.reseau[0].url : null,
  courrielDansLeCorps: R.reseau[0] ? R.reseau[0].corps.includes(ADRESSE) : false,
  /* CE QUI PART VERS LE VISITEUR : le champ `_autoresponse`, avec
     les DEUX adresses absolues dedans. Un service de formulaire
     sans serveur ne peut pas joindre deux fichiers de deux Mo ; ce
     qu'il peut, c'est renvoyer un message qui les porte. */
  accuseAuVisiteurAvecLesDeuxLiens: R.reseau[0]
    ? /aped-automatisation\.pdf/.test(R.reseau[0].corps || "") && /aped-ia-croissance\.pdf/.test(R.reseau[0].corps || "")
    : false,
  remiseSurPlace: R.remise.devoilee === true && R.remise.liens.length === 2,
  confirmationAffichee: /parti vers|téléchargeables ici/i.test(R.statutAffiche.texte || ""),
  neReviendraPlusDuTout: R.marqueurs.pourToujours === "1",
  aucuneErreurConsole: R.erreurs.length === 0
};

fs.writeFileSync(path.join(SORTIE, `rapport-${REEL ? "reel" : "intercepte"}.json`),
  JSON.stringify(R, null, 2), "utf8");
console.log(JSON.stringify(R, null, 2));
