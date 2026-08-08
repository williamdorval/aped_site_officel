/* ============================================================
   LE POPUP DES GUIDES — `node tools/cadeau-check.mjs`

   POURQUOI CELUI-CI EST NEUF, ET POURQUOI L'ANCIEN EST ARCHIVÉ.
   D-782

   `archives/outils-perimes/cadeau-check-avant-D083.mjs` exigeait,
   comme des qualités : « les deux guides SANS RIEN DONNER »,
   « courriel PAS requis », « un SEUL champ », « la remise vient
   AVANT le formulaire ». C'était juste avant D-083 — et D-083 a
   retourné exactement ça : les coordonnées sont devenues la
   CONDITION, parce que l'ancienne version ne captait rien.

   L'outil est donc devenu un test qui réclame le retour du défaut
   qu'on venait de corriger. Piège 17, à l'envers, et le pire des
   deux sens : il ne rougissait pas, il PLANTAIT — `.cadeau-recu`
   n'existe plus, `querySelector(...).hidden` lève sur `null`. Un
   outil qui plante ne se lit pas comme un défaut, il se lit comme
   un outil cassé, et on passe.

   ET SON FILET RÉSEAU VISAIT `formsubmit.co`, mort depuis que le
   site poste vers Apps Script : le lancer ÉCRIVAIT dans le vrai
   classeur et consommait le quota. Celui-ci intercepte
   `script.google.com`, et il le VÉRIFIE avant de conclure.

   CE QU'IL GARDE AUJOURD'HUI :
     1 · l'échange est annoncé, pas déguisé en cadeau ;
     2 · les deux coordonnées sont bien la condition ;
     3 · ce qui porte la valeur passe devant ce qui porte le coût ;
     4 · après le téléchargement, le plus PETIT pas est le premier ;
     5 · la mémoire : qui a déjà donné ne redonne rien ;
     6 · Échap, focus, zéro erreur console.

   Sorties : 0 tout tient · 1 défaut · 2 l'instrument a dérivé.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const SORTIE = path.join(RACINE, "preuves", "cadeau");
fs.mkdirSync(SORTIE, { recursive: true });

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

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png",
  ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif",
  ".pdf": "application/pdf", ".json": "application/json" };
const serveur = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const f = path.join(RACINE, p);
  if (!f.startsWith(RACINE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404); res.end("non"); return;
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => serveur.listen(0, r));
const BASE = "http://127.0.0.1:" + serveur.address().port;

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const erreurs = [];
page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
page.on("pageerror", (e) => erreurs.push(String(e)));

/* LE FILET, ET LA PREUVE QU'IL A SERVI. Un filet qui vise le
   mauvais hôte ne se voit pas : la requête part pour de vrai, le
   test passe, et le classeur se remplit de lignes d'essai. On
   compte donc les interceptions, et on ARRÊTE s'il y en a zéro. */
let interceptes = 0;
await page.route("**script.google.com/**", (r) => {
  interceptes++;
  r.fulfill({ status: 200, contentType: "application/json", body: '{"success":true}' });
});

await page.goto(BASE, { waitUntil: "load" });

/* ============================================================
   1 · IL PARAIT, ET PAS TROP TOT
   ============================================================ */
titre("1 · IL PARAIT, ET PAS AVANT LE PLANCHER");
const ouvert = () => page.evaluate(() => {
  const d = document.getElementById("cadeau");
  return !!(d && d.open);
});

await page.waitForTimeout(3500);
dire("rien avant 3,5 s", await ouvert(), false, "le plancher est a 4 s");

const t0 = Date.now();
for (let i = 0; i < 40 && !(await ouvert()); i++) await page.waitForTimeout(700);
const paruA = Math.round((Date.now() - t0) / 100) / 10 + 3.5;
dire("il parait", await ouvert(), true, "attendu au plus tard a 20 s");
console.log("         paru vers " + paruA + " s · data-palier "
  + (await page.evaluate(() => document.documentElement.dataset.palier)));
await page.waitForTimeout(900);
await page.screenshot({ path: path.join(SORTIE, "01-popup.png") });

/* ============================================================
   2 · L'ECHANGE EST ANNONCE, PAS DEGUISE
   ============================================================ */
titre("2 · L'ECHANGE EST ANNONCE  (D-083)");
const vu = await page.evaluate(() => {
  const d = document.getElementById("cadeau");
  const txt = (s) => { const e = d.querySelector(s); return e ? e.textContent.trim().replace(/\s+/g, " ") : null; };
  const champs = [...d.querySelectorAll("input")].filter((e) => e.type !== "hidden" && !e.closest(".piege"));
  return {
    accroche: txt(".cadeau-eyebrow"),
    titre: txt("#cadeauTitre"),
    fiche: [...d.querySelectorAll(".cadeau-fiche span")].map((s) => s.textContent.trim().replace(/\s+/g, " ")),
    lead: txt(".cadeau-lead"),
    champs: champs.map((c) => ({ nom: c.name, requis: c.required })),
    couvertures: [...d.querySelectorAll(".cadeau-couv")].map((i) => i.naturalWidth > 0),
    reassurance: txt(".cadeau-fin"),
    sorties: [...d.querySelectorAll("[data-cadeau-non]")].length
  };
});
dire("l'accroche dit que c'est un echange",
  /contre vos coordonn/i.test(vu.accroche || ""), true, JSON.stringify(vu.accroche));
dire("elle ne dit jamais « gratuit » ni « cadeau »",
  /gratuit|cadeau/i.test([vu.accroche, vu.titre, vu.lead].join(" ")), false);
dire("les DEUX coordonnees sont requises",
  vu.champs.filter((c) => c.requis).map((c) => c.nom).sort().join("|"), "email|telephone",
  JSON.stringify(vu.champs));
dire("la mention legale dit a quoi elles servent",
  /vous envoyer les guides/.test(await page.evaluate(() =>
    (document.querySelector("#cadeauForm .form-legal") || {}).textContent || "")), true);
dire("les deux couvertures se rendent",
  vu.couvertures.length === 2 && vu.couvertures.every(Boolean), true);
dire("il y a plus d'une sortie", vu.sorties >= 2, true);
dire("la reassurance est la", !!vu.reassurance, true);

/* ============================================================
   3 · LA VALEUR DEVANT LE COUT
   ============================================================ */
titre("3 · CE QUI PORTE LA VALEUR PASSE DEVANT  (D-782)");
/* « 91 PAGES » EST UN COUT. Un patron de PME le lit « je ne lirai
   jamais ca ». Le chiffre reste — il dit le serieux du document —
   mais il ne peut pas etre le premier. */
dire("la fiche ouvre sur les taches chiffrees",
  /t[âa]ches chiffr/i.test(vu.fiche[0] || ""), true, JSON.stringify(vu.fiche));
dire("le nombre de pages n'est plus dans l'accroche",
  /\d+\s*pages/i.test(vu.accroche || ""), false, JSON.stringify(vu.accroche));
dire("le nombre de pages est quand meme dit",
  vu.fiche.some((s) => /\d+\s*pages/i.test(s)), true, "il est vrai, il reste");
dire("l'objection du volume recoit une reponse",
  /cherchez la v[ôo]tre/i.test(vu.lead || ""), true,
  "sans elle, « 91 pages » se lit comme un mur");

/* ============================================================
   4 · APRES LE TELECHARGEMENT, LE PLUS PETIT PAS D'ABORD
   ============================================================ */
titre("4 · APRES LE TELECHARGEMENT  (D-782)");
await page.fill("#cadeauEmail", "essai@exemple.ca");
await page.fill("#cadeauTel", "8195550142");
await page.click(".cadeau-go");
await page.waitForTimeout(1800);

/* L'INTERCEPTION SE VERIFIE AVANT LE VERDICT. Zero requete captee
   veut dire que l'envoi est parti pour de vrai — vers le classeur
   du client — et aucune conclusion ne vaut a partir de la. */
if (interceptes === 0) {
  console.error("ARRET  aucune requete vers script.google.com n'a ete interceptee.\n"
    + "       Soit l'envoi ne part pas, soit il part POUR DE VRAI.\n"
    + "       Dans les deux cas, ce qui suit ne prouverait rien.");
  await nav.close(); serveur.close(); process.exit(2);
}
console.log("         " + interceptes + " requete(s) interceptee(s), aucune n'est partie");

const apres = await page.evaluate(() => {
  const d = document.getElementById("cadeau");
  const s = d.querySelector(".cadeau-suite");
  const boutons = s ? [...s.querySelectorAll("button")] : [];
  return {
    suiteOuverte: !!(s && !s.hidden),
    formulaireRange: !!(d.querySelector("#cadeauForm") || {}).hidden,
    argumentaireRange: !!(d.querySelector(".cadeau-avant") || {}).hidden,
    boutons: boutons.map((b) => (b.textContent || "").trim().replace(/\s+/g, " ")),
    premierEstLeRdv: !!(boutons[0] && boutons[0].hasAttribute("data-cadeau-rdv")),
    focusSurLePremier: !!(boutons[0] && document.activeElement === boutons[0]),
    liens: s ? [...s.querySelectorAll("a[href$='.pdf']")].map((a) => a.getAttribute("href")) : [],
    phrase: s ? ((s.querySelector(".cadeau-liens") || {}).textContent || "").trim() : ""
  };
});
dire("le bloc d'apres remplace le formulaire",
  apres.suiteOuverte && apres.formulaireRange, true, JSON.stringify(apres));
/* ON ARRETE DE VENDRE A QUELQU’UN QUI A ACHETE. Le formulaire seul
   etait range : l'accroche, le titre, les trois chiffres et le
   paragraphe de vente restaient AU-DESSUS de « C’est telecharge ».
   Vu sur la capture, jamais par une sonde — c’est pour ca que
   celle-ci existe. */
dire("l'argumentaire de vente se range aussi", apres.argumentaireRange, true,
  "continuer de vendre apres l'achat, c'est dire qu'on n'a pas suivi");
dire("le PREMIER bouton est le rendez-vous", apres.premierEstLeRdv, true,
  "huit ecrans de projet ne sont pas le plus petit pas suivant : " + JSON.stringify(apres.boutons));
dire("et il porte le focus", apres.focusSurLePremier, true);
dire("l'assistant de projet reste, en second",
  apres.boutons.length >= 2, true, JSON.stringify(apres.boutons));
/* LES GUIDES NE SONT PLUS TELECHARGEABLES, ET C'EST LE CORRECTIF.
   D-788
   Ils etaient servis en statique — deux `GET` et on les avait sans
   rien donner — pendant que le popup annoncait « contre vos
   coordonnees ». Le serveur les envoie desormais en pieces jointes.
   Ce cas gardait l'ancien comportement : il exigeait deux liens,
   c'est-a-dire exactement la fuite. Il exige maintenant qu'il n'y
   en ait AUCUN. */
dire("aucun lien vers un PDF dans le bloc d'apres", apres.liens.length, 0,
  JSON.stringify(apres.liens));
dire("et il dit que les guides partent par courriel",
  /pi[eè]ces? jointes?/i.test(apres.phrase || ""), true, JSON.stringify(apres.phrase));
await page.screenshot({ path: path.join(SORTIE, "02-apres.png") });

/* ============================================================
   5 · LA MEMOIRE
   ============================================================ */
/* ET NULLE PART AILLEURS DANS LA PAGE.  D-788
   Le bloc d'apres n'est pas le seul endroit ou un lien pouvait
   vivre : le pied en a porte, Services aussi. On regarde le
   document ENTIER, et le source servi avec. */
{
  const partout = await page.evaluate(() =>
    [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"))
      .filter((h) => /\.pdf(\?|$)/i.test(h || "")));
  dire("aucun lien PDF dans TOUTE la page", partout.length, 0, JSON.stringify(partout));

  const src = await page.evaluate(async () => {
    try { return await (await fetch("js/main.js")).text(); } catch (e) { return ""; }
  });
  if (src.length < 10000) { console.error("ARRET · js/main.js n'a pas ete relu"); process.exit(2); }
  dire("et aucune adresse de guide dans le script servi",
    /documents\/adexweb-[a-z-]+\.pdf/.test(src), false,
    "elles y etaient en clair : il suffisait de lire le fichier");
}

titre("5 · QUI A DEJA DONNE NE REDONNE RIEN");
await page.goto(BASE, { waitUntil: "load" });
await page.waitForTimeout(3200);
const memoire = await page.evaluate(() => {
  let marque = null;
  try { marque = localStorage.getItem("adexweb-guides-donnes"); } catch (e) {}
  return { marque: !!marque };
});
dire("la marque du don est posee", memoire.marque, true,
  "sans elle, on redemande a quelqu'un qui a deja donne");

/* ON REOUVRE PAR LA PORTE MANUELLE — le popup ne se represente
   jamais tout seul, et c'est voulu. */
await page.evaluate(() => {
  const b = document.querySelector("[data-cadeau-ouvrir]");
  if (b) b.click();
});
await page.waitForTimeout(900);
const retour = await page.evaluate(() => {
  const d = document.getElementById("cadeau");
  return {
    ouvert: !!(d && d.open),
    dejaVisible: !!(d && d.querySelector(".cadeau-deja") && !d.querySelector(".cadeau-deja").hidden),
    formulaireRange: !!(d && (d.querySelector("#cadeauForm") || {}).hidden),
    liens: d ? [...d.querySelectorAll(".cadeau-deja a[href$='.pdf']")].map((a) => a.getAttribute("href")) : []
  };
});
dire("la porte manuelle rouvre le popup", retour.ouvert, true);
dire("il ne redemande AUCUNE coordonnee", retour.formulaireRange, true, JSON.stringify(retour));
dire("il montre le bloc « vous les avez deja »", retour.dejaVisible, true);
dire("aucun lien vers un PDF non plus", retour.liens.length, 0);
await page.screenshot({ path: path.join(SORTIE, "03-deja.png") });

/* ============================================================
   6 · CLAVIER ET CONSOLE
   ============================================================ */
titre("6 · CLAVIER ET CONSOLE");
await page.keyboard.press("Escape");
await page.waitForTimeout(400);
dire("Echap le ferme", await ouvert(), false);
dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 3).join(" | "));

await nav.close();
serveur.close();
console.log("");
console.log("============================================================");
console.log(ko ? ("LE POPUP NE TIENT PAS : " + ko + " echec(s) sur " + n)
              : ("LE POPUP TIENT : " + n + " / " + n));
console.log("Captures : preuves/cadeau/");
console.log("============================================================");
process.exit(ko ? 1 : 0);
