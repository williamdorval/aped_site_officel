/* ============================================================
   L'ESTIMATEUR, PARCOURU POUR DE VRAI — `node tools/estimateur-check.mjs`

   CE QUE CET OUTIL REMPLACE, ET POURQUOI IL FALLAIT LE JETER.

   L'ancien `estimateur-check.mjs` ouvrait un navigateur pour ne
   rien en faire : il s'en servait a `fetch("js/main.js")` et
   RE-ANALYSAIT LE TEXTE DU SOURCE — `source.split("var BAREME =
   [")[1]`. Le jour ou le bareme est passe de `{bas, haut}` a
   `{score, texte}` (D-353), `f.bas` et `f.haut` sont devenus
   `undefined` : ses 108 combinaisons rendaient toutes la meme cle
   « undefined-undefined », son verdict « grille non
   reconstituable » passait donc a vide, et il n'avait aucun
   `process.exit`. Piege 4 en entier, pendant quatre jours.

   Son jumeau `estimateur-ui.mjs` visait `#priceLow`, `#priceHigh`
   et `#priceSuite` — trois identifiants qui n'existent nulle part
   dans le depot. Il remplissait six reponses sur neuf ecrans, donc
   `page.fill("#esName")` attendait un champ jamais atteint et
   expirait a 30 s dans un rejet non capture.

   CELUI-CI PARCOURT LE VRAI FORMULAIRE, DANS UN VRAI NAVIGATEUR,
   CONTRE LE VRAI `Code.gs` (par `faux-google.mjs`). Il ne lit
   aucun source et ne connait aucun montant : il clique, et il
   regarde ce qui est ECRIT A L'ECRAN.

   HUIT PASSES :
     1 · les cinq chemins arrivent au bout, et la fourchette parait ;
     2 · le compte « X sur N » dit la verite a chaque ecran ;
     3 · les questions sans objet ne se posent jamais ;
     4 · changer de type en arriere n'emporte pas une reponse morte ;
     5 · le « non » ouvre une porte, et une seule fois ;
     6 · les trois sans prix ne montrent AUCUN chiffre ;
     7 · une seule ligne au classeur par personne ;
     8 · aucune erreur de console sur les cinq chemins.

   Sorties : 0 tout tient · 1 defaut · 2 l'outil n'a pas pu mesurer.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { servir, etat, gs } from "./faux-google.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const SORTIE = path.join(RACINE, "preuves", "estimateur");
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
const ARRET = (m) => { console.error("\nARRET · " + m); process.exit(2); };

/* ---------- le vrai Code.gs, servi en HTTP ---------- */
gs.initialiser();
const GOOGLE = servir(0);
await new Promise((r) => GOOGLE.once("listening", r));
const PORT_GS = GOOGLE.address().port;
const SERVICE = "http://127.0.0.1:" + PORT_GS + "/exec";

/* ---------- le site ---------- */
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png",
  ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif",
  ".pdf": "application/pdf", ".json": "application/json" };
const site = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const f = path.join(RACINE, p);
  if (!f.startsWith(RACINE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404); res.end("non"); return;
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => site.listen(0, r));
const BASE = "http://127.0.0.1:" + site.address().port;

const nav = await chromium.launch();

async function nouvellePage(largeur, hauteur) {
  const ctx = await nav.newContext({ viewport: { width: largeur, height: hauteur } });
  const page = await ctx.newPage();
  page._erreurs = [];
  page.on("pageerror", (e) => page._erreurs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") page._erreurs.push(m.text()); });
  /* ON INTERCEPTE `config.local.js`, ON NE L'ECRIT PAS : ecrire le
     vrai fichier depuis un outil de mesure ecraserait la
     configuration de la personne qui le lance. */
  await page.route("**/js/config.local.js", (r) => r.fulfill({
    status: 200, contentType: "text/javascript; charset=utf-8",
    body: "window.APED_ENVOI = " + JSON.stringify(SERVICE) + ";\n"
  }));
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("aped-sans-popup", "1");
      sessionStorage.setItem("aped-entree-saut", "1");
    } catch (e) {}
  });
  await page.goto(BASE + "/index.html", { waitUntil: "load" });
  /* UNE SONDE LUE AVANT 3 s NE VOIT PAS LA VRAIE PAGE : `data-palier`
     arrive apres, et il change la peinture. Piege 87. */
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-palier"),
    null, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(400);
  return page;
}

async function ouvrirEstimateur(page) {
  await page.evaluate(() => {
    document.querySelectorAll(".modal").forEach((m) => { m.hidden = true; });
    ["project", "estimate", "refer", "booking"].forEach((k) => {
      try { localStorage.removeItem("aped-brouillon-" + k); } catch (e) {}
      try { localStorage.removeItem("aped-sid-" + k); } catch (e) {}
    });
  });
  const b = await page.$('[data-modal-open="modal-estimate"]');
  if (!b) ARRET("rien n'ouvre #modal-estimate");
  await b.evaluate((el) => el.click());
  await page.waitForTimeout(500);
  const vu = await page.evaluate(() => !document.getElementById("modal-estimate").hidden);
  if (!vu) ARRET("la modale ne s'ouvre pas");
}

/* L'ecran visible, son compte, et ce qu'il demande. */
async function etatEcran(page) {
  return page.evaluate(() => {
    const w = document.getElementById("wizard");
    const s = w.querySelector(".step[data-step]:not([hidden])");
    if (!s) return null;
    const groupes = [...s.querySelectorAll(".options[data-key]")]
      .filter((g) => {
        const b = g.closest(".step-second");
        return !b || !b.hidden;
      })
      .map((g) => g.dataset.key);
    return {
      ecran: Number(s.dataset.step),
      question: (s.querySelector(".step-q") || {}).textContent || "",
      groupes: groupes,
      cases: [...s.querySelectorAll('[data-checks] input[type="checkbox"]')].map((c) => c.value),
      compte: (document.getElementById("estimCompte") || {}).textContent || "",
      total: (document.getElementById("estimTotal") || {}).textContent || ""
    };
  });
}

async function choisir(page, cle, valeur) {
  const ok = await page.evaluate(([c, v]) => {
    const w = document.getElementById("wizard");
    const s = w.querySelector(".step[data-step]:not([hidden])");
    const g = s && s.querySelector('.options[data-key="' + c + '"]');
    if (!g) return false;
    const b = [...g.querySelectorAll("button")].find((x) => x.dataset.value === v);
    if (!b) return false;
    b.click();
    return true;
  }, [cle, valeur]);
  if (!ok) ARRET("impossible de choisir « " + valeur + " » pour « " + cle + " »");
  await page.waitForTimeout(220);
}

async function cocher(page, valeurs) {
  const combien = await page.evaluate((vs) => {
    const w = document.getElementById("wizard");
    const s = w.querySelector(".step[data-step]:not([hidden])");
    let k = 0;
    vs.forEach((v) => {
      const c = s.querySelector('input[type="checkbox"][value="' + CSS.escape(v) + '"]');
      if (c) { c.checked = true; c.dispatchEvent(new Event("change", { bubbles: true })); k++; }
    });
    return k;
  }, valeurs);
  if (combien !== valeurs.length) ARRET("cases introuvables : " + valeurs.join(" | "));
  await page.waitForTimeout(150);
}

async function continuer(page) {
  const avant = (await etatEcran(page)).ecran;
  await page.evaluate(() => {
    const w = document.getElementById("wizard");
    const s = w.querySelector(".step[data-step]:not([hidden])");
    const b = s && s.querySelector("[data-esuivant]");
    if (b) b.click();
  });
  await page.waitForTimeout(280);
  return (await etatEcran(page)).ecran !== avant;
}

async function coordonnees(page, nom, courriel) {
  await page.fill("#esName", nom);
  await page.fill("#esEmail", courriel);
  await page.fill("#esPhone", "418 555 0142");
  await page.evaluate(() => {
    document.querySelector('#modal-estimate form[data-form="estimate"] [data-submit]').click();
  });
  await page.waitForTimeout(1400);
}

async function resultat(page) {
  return page.evaluate(() => {
    const t = (id) => {
      const e = document.getElementById(id);
      return e && !e.hidden ? (e.textContent || "").trim() : "";
    };
    const boite = document.getElementById("esDevis");
    const sans = document.getElementById("esSansPrix");
    const petit = document.getElementById("esPetit");
    return {
      ecran: Number((document.querySelector("#wizard .step[data-step]:not([hidden])") || {})
        .dataset ? document.querySelector("#wizard .step[data-step]:not([hidden])").dataset.step : 0),
      resume: t("estimateResume"),
      devisVisible: !!(boite && !boite.hidden),
      montant: t("esFourchette"),
      sur: t("esFourchetteSur"),
      sansPrix: !!(sans && !sans.hidden),
      raisons: sans ? [...sans.querySelectorAll("li")].map((l) => l.textContent.trim()) : [],
      petitVisible: !!(petit && !petit.hidden),
      petitMontant: t("esPetitMontant"),
      /* TOUT LE TEXTE DE L'ECRAN, pour verifier qu'aucun chiffre ne
         parait la ou il ne doit pas. `innerText` rendrait vide sous
         `content-visibility` : on marche l'arbre. */
      texte: (function () {
        const s = document.querySelector("#wizard .step[data-step]:not([hidden])");
        if (!s) return "";
        const w = document.createTreeWalker(s, NodeFilter.SHOW_TEXT);
        const out = [];
        let x;
        while ((x = w.nextNode())) {
          if (x.parentElement && x.parentElement.closest("[hidden]")) continue;
          out.push(x.nodeValue);
        }
        return out.join(" ").replace(/\s+/g, " ");
      })()
    };
  });
}

const MONTANT = /\d[\d\s  ]*\$/;

/* ============================================================
   0 · AUTO-CONTROLE — la sonde sait-elle voir un montant ?
   ============================================================ */
titre("0 · AUTO-CONTROLE de la sonde");
dire("elle reconnait un montant ecrit", MONTANT.test("6 000 $"), true);
dire("elle ne confond pas un texte sans chiffre", MONTANT.test("Propre et rapide"), false);
{
  /* Si le service ne repond pas, tout le reste passera « a vide ». */
  const essai = await fetch(SERVICE, {
    method: "POST", headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ _form: "estimate", _sid: "ZZTESTsonde01", _etape: 1, _etapes: 6,
      email: "sonde@exemple.ca" })
  }).then((r) => r.json()).catch(() => null);
  if (!essai || essai.success !== true) ARRET("le faux Google ne repond pas : " + JSON.stringify(essai));
  dire("le service repond avant qu'on commence", essai.success, true);
}

/* ============================================================
   1 · LES CINQ CHEMINS
   ============================================================ */
const CHEMINS = [
  { nom: "vitrine", type: "Un site pour présenter mon entreprise",
    ampleur: "6 à 15 pages",
    fonctions: ["Un formulaire de contact", "Une carte du secteur desservi"],
    second: ["contenu", "J’en ai une partie"], ecrans: 6, prix: true },
  { nom: "boutique", type: "Une boutique en ligne",
    ampleur: "25 à 250 produits",
    fonctions: ["Le paiement en ligne", "Le calcul de la livraison"],
    second: ["contenu", "Mes textes et mes photos sont prêts"], ecrans: 6, prix: true },
  { nom: "estimateur", type: "Un outil de soumission ou de calcul",
    ampleur: "Un rendu en 3D",
    fonctions: ["Il s’installe dans mon site"],
    second: ["complexite", "Beaucoup de règles et de contraintes"], ecrans: 6, prix: true },
  { nom: "logiciel", type: "Un logiciel ou une application sur mesure",
    ampleur: "5 à 15 écrans",
    fonctions: ["Des comptes et des permissions", "Des rapports et un tableau de bord"],
    second: ["usagers", "Toute l’entreprise"], ecrans: 6, prix: true },
  { nom: "automatisation", type: "Automatiser des tâches qui me prennent du temps",
    besoin: "Retaper les commandes dans la comptabilité toutes les semaines.",
    ecrans: 4, prix: false }
];

const page = await nouvellePage(1440, 950);
const vus = {};

for (const c of CHEMINS) {
  titre("1 · LE CHEMIN « " + c.nom + " »");
  await ouvrirEstimateur(page);

  let e = await etatEcran(page);
  dire("on entre a l'ecran 1", e.ecran, 1);
  dire("le compte annonce six ecrans avant tout choix", e.compte + "/" + e.total, "1/6");

  await choisir(page, "type_de_projet", c.type);
  e = await etatEcran(page);
  dire("le total s'ajuste au chemin", e.total, String(c.ecrans));

  if (c.prix) {
    dire("l'ecran d'ampleur est celui du type", e.groupes.join(","), "ampleur");
    await choisir(page, "ampleur", c.ampleur);
    e = await etatEcran(page);
    dire("on arrive aux fonctions", e.cases.length > 0, true);
    await cocher(page, c.fonctions);
    dire("« Continuer » avance", await continuer(page), true);

    e = await etatEcran(page);
    dire("l'ecran du soin pose DEUX questions", e.groupes.length, 2);
    dire("et la seconde est celle du type", e.groupes[1], c.second[0]);
    dire("« Continuer » refuse tant qu'il manque une reponse",
      await continuer(page), false, "les deux groupes sont vides");
    await choisir(page, "niveau_design", "Propre et rapide");
    dire("« Continuer » refuse encore avec une seule des deux",
      await continuer(page), false);
    await choisir(page, c.second[0], c.second[1]);
    dire("et il avance quand les deux sont la", await continuer(page), true);
  } else {
    dire("on saute droit a la question ouverte", e.ecran, 6);
    await page.fill("#esBesoin", c.besoin);
    dire("« Continuer » avance", await continuer(page), true);
    e = await etatEcran(page);
    dire("les ecrans d'ampleur et de fonctions ne se posent jamais",
      e.groupes.indexOf("ampleur") === -1 && e.cases.length === 0, true);
  }

  e = await etatEcran(page);
  dire("l'echeance et la taille sont ensemble", e.groupes.join(","), "echeancier,taille_equipe");
  await choisir(page, "echeancier", "Dans 1 à 3 mois");
  await choisir(page, "taille_equipe", "1 à 5 personnes");
  dire("« Continuer » avance", await continuer(page), true);

  e = await etatEcran(page);
  dire("les coordonnees viennent en dernier, et pas avant",
    e.compte + "/" + e.total, c.ecrans + "/" + c.ecrans);

  await coordonnees(page, "ZZTEST " + c.nom, "zz-" + c.nom + "@exemple.ca");
  const r = await resultat(page);
  vus[c.nom] = r;

  if (c.prix) {
    dire("la fourchette parait", r.devisVisible, true);
    dire("et c'est un montant", MONTANT.test(r.montant), true, "lu : " + JSON.stringify(r.montant));
    dire("la ligne « d'apres » nomme ses raisons", r.sur.indexOf("D’après") === 0, true);
    dire("aucun ecran « sans prix » ne parait", r.sansPrix, false);
    dire("la version allegee reste fermee tant qu'on n'a pas dit non", r.petitVisible, false);
  } else {
    dire("aucune fourchette", r.devisVisible, false);
    dire("l'ecran honnete parait", r.sansPrix, true);
    dire("il nomme trois raisons", r.raisons.length, 3);
    dire("et AUCUN chiffre ne parait a l'ecran", MONTANT.test(r.texte), false,
      "lu : " + JSON.stringify(r.texte.slice(0, 160)));
  }
  dire("aucune erreur de console sur ce chemin", page._erreurs.length, 0,
    page._erreurs.slice(0, 2).join(" | "));
  page._erreurs.length = 0;

  await page.screenshot({ path: path.join(SORTIE, "chemin-" + c.nom + ".png") });
}

/* ============================================================
   2 · LE COMPTE DIT LA VERITE, ECRAN PAR ECRAN
   ============================================================ */
titre("2 · LE COMPTE, ECRAN PAR ECRAN");
{
  await ouvrirEstimateur(page);
  const suite = [];
  await choisir(page, "type_de_projet", "Une boutique en ligne");
  suite.push((await etatEcran(page)).compte);
  await choisir(page, "ampleur", "Moins de 25 produits");
  suite.push((await etatEcran(page)).compte);
  await cocher(page, ["Rien de tout ça"]);
  await continuer(page);
  suite.push((await etatEcran(page)).compte);
  await choisir(page, "niveau_design", "Propre et rapide");
  await choisir(page, "contenu", "Mes textes et mes photos sont prêts");
  await continuer(page);
  suite.push((await etatEcran(page)).compte);
  await choisir(page, "echeancier", "Pas de date fixe");
  await choisir(page, "taille_equipe", "1 à 5 personnes");
  await continuer(page);
  suite.push((await etatEcran(page)).compte);
  dire("les cinq ecrans suivants se comptent 2,3,4,5,6", suite.join(","), "2,3,4,5,6");
}

/* ============================================================
   3 · CHANGER DE TYPE N'EMPORTE PAS UNE REPONSE MORTE
   ============================================================ */
titre("3 · CHANGER DE TYPE EN COURS DE ROUTE");
{
  await ouvrirEstimateur(page);
  await choisir(page, "type_de_projet", "Une boutique en ligne");
  await choisir(page, "ampleur", "Plus de 250 produits");
  /* On revient a l'ecran 1 et on choisit autre chose. Sans purge,
     « Plus de 250 produits » resterait comme ampleur d'un logiciel :
     un libelle que sa grille ne connait pas, donc AUCUNE fourchette,
     et personne pour s'en apercevoir. */
  await page.evaluate(() => {
    const w = document.getElementById("wizard");
    w.querySelectorAll(".step[data-step]").forEach((s) => {
      s.hidden = Number(s.dataset.step) !== 1;
    });
  });
  await choisir(page, "type_de_projet", "Un logiciel ou une application sur mesure");
  const e = await etatEcran(page);
  dire("on retombe sur l'ampleur du logiciel", e.ecran, 5);
  const reste = await page.evaluate(() => {
    const g = document.querySelector('#wizard .options[data-key="ampleur"]');
    return [...document.querySelectorAll('#wizard .options[data-key="ampleur"] button')]
      .filter((b) => b.getAttribute("aria-pressed") === "true").map((b) => b.dataset.value);
  });
  dire("aucune ampleur d'un autre type ne reste choisie", reste.length, 0,
    "restait : " + JSON.stringify(reste));

  await choisir(page, "ampleur", "Moins de 5 écrans");
  await cocher(page, ["Rien de tout ça"]);
  await continuer(page);
  await choisir(page, "niveau_design", "Propre et rapide");
  await choisir(page, "usagers", "Mon équipe");
  await continuer(page);
  await choisir(page, "echeancier", "Pas de date fixe");
  await choisir(page, "taille_equipe", "1 à 5 personnes");
  await continuer(page);
  await coordonnees(page, "ZZTEST Bascule", "zz-bascule@exemple.ca");
  const r = await resultat(page);
  dire("et la fourchette se calcule quand meme", MONTANT.test(r.montant), true,
    "lu : " + JSON.stringify(r.montant));
}

/* ============================================================
   4 · LE « NON » OUVRE UNE PORTE
   ============================================================ */
titre("4 · LE « NON », ET CE QU'IL OUVRE");
{
  await ouvrirEstimateur(page);
  await choisir(page, "type_de_projet", "Une boutique en ligne");
  await choisir(page, "ampleur", "25 à 250 produits");
  await cocher(page, ["Le paiement en ligne", "Le calcul de la livraison",
                      "Un panneau pour gérer mes produits"]);
  await continuer(page);
  await choisir(page, "niveau_design", "Une signature visuelle complète");
  await choisir(page, "contenu", "Tout est à faire");
  await continuer(page);
  await choisir(page, "echeancier", "Dans le mois");
  await choisir(page, "taille_equipe", "6 à 25 personnes");
  await continuer(page);
  await coordonnees(page, "ZZTEST Trop cher", "zz-cher@exemple.ca");

  const avant = await resultat(page);
  dire("le grand chiffre est la", MONTANT.test(avant.montant), true);

  await page.evaluate(() => {
    document.querySelector('#esDevisQuestion .choices button[data-value="Non"]').click();
  });
  await page.waitForTimeout(500);
  const motifs = await page.evaluate(() =>
    [...document.querySelectorAll('.choices[data-choice="prix_pourquoi"] button')]
      .map((b) => b.dataset.value));
  dire("on demande pourquoi, en trois motifs", motifs.length, 3);

  /* « je compare » n'ouvre PAS la version allegee : quelqu'un qui
     compare n'a pas de probleme de portee, et lui offrir moins
     serait a cote de sa question. */
  await page.evaluate(() => {
    document.querySelector('.choices[data-choice="prix_pourquoi"] button[data-value="Je compare avec d’autres"]').click();
  });
  await page.waitForTimeout(500);
  let r = await resultat(page);
  dire("« je compare » n'ouvre pas la version allegee", r.petitVisible, false);

  await page.evaluate(() => {
    document.querySelector('.choices[data-choice="prix_pourquoi"] button[data-value="C’est au-dessus de mon budget"]').click();
  });
  await page.waitForTimeout(500);
  r = await resultat(page);
  dire("« au-dessus de mon budget » ouvre la version allegee", r.petitVisible, true);
  dire("elle porte son propre montant", MONTANT.test(r.petitMontant), true,
    "lu : " + JSON.stringify(r.petitMontant));
  dire("le grand chiffre reste a l'ecran", MONTANT.test(r.montant), true,
    "c'est lui qui rend le petit raisonnable");
  const retires = await page.evaluate(() =>
    [...document.querySelectorAll("#esPetitRetire li")].map((l) => l.textContent.trim()));
  dire("ce qui sort est nomme, un par un", retires.length >= 3, true,
    JSON.stringify(retires));
  dire("et AUCUN montant ne parait dans cette liste",
    retires.some((x) => MONTANT.test(x)), false,
    "un module chiffre publierait la grille");

  /* LA PORTE DE SORTIE DOIT VENIR AVANT LE CHAMP LIBRE ET AVANT LE
     BOUTON D'ENVOI. Elle etait posee apres les deux, donc sous la
     ligne de flottaison : quelqu'un qui vient de dire « c'est trop
     cher » devait defiler pour trouver ce qu'on lui propose. On
     mesure l'ORDRE dans le document, pas la position a l'ecran :
     une position depend de la hauteur de la fenetre, l'ordre non. */
  const ordre = await page.evaluate(() => {
    const p = document.getElementById("esPetit");
    const c = document.getElementById("esPrixRaison");
    const b = document.getElementById("esPrixEnvoi");
    if (!p || !c || !b) return "manquant";
    const avantChamp = p.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING;
    const avantBouton = p.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;
    return avantChamp && avantBouton ? "avant" : "apres";
  });
  dire("la porte de sortie vient AVANT le champ libre et l'envoi", ordre, "avant");

  dire("le motif ne se recopie pas dans le champ « autre chose »",
    await page.evaluate(() => document.getElementById("esPrixRaison").value), "");

  /* LE MOTIF ET LE TEXTE LIBRE SE CUMULENT. On tape deux mots, on
     envoie, et on relit ce que le CLASSEUR a garde — pas ce que
     l'ecran affiche. */
  await page.fill("#esPrixRaison", "on a un devis a 12k");
  await page.evaluate(() => document.getElementById("esPrixEnvoi").click());
  await page.waitForTimeout(1200);
  {
    const f = etat.feuilles.get("Estimation rapide");
    const e = f.valeurs[0];
    const l = f.valeurs.slice(1).find((r) => r[e.indexOf("Courriel")] === "zz-cher@exemple.ca");
    dire("le classeur porte le motif ET le texte libre",
      l ? String(l[e.indexOf("Pourquoi pas")]) : "(ligne absente)",
      "C’est au-dessus de mon budget — on a un devis a 12k");
    dire("et le montant du classeur est celui de la PREMIERE fourchette",
      l ? String(l[e.indexOf("Fourchette vue")]) : "", avant.montant,
      "la colonne est figee : un « non » ne doit pas reecrire le prix qu'on a montre");
  }

  /* LE PETIT MONTANT N'EST PAS EN MINIUM. Le minium marque l'endroit
     ou le visiteur peut AGIR, et l'action reste le grand chiffre.
     Deux montants de la meme couleur se disputent l'oeil — c'est
     arrive, et seule l'image l'a dit. */
  const couleurs = await page.evaluate(() => ({
    grand: getComputedStyle(document.getElementById("esFourchette")).color,
    petit: getComputedStyle(document.getElementById("esPetitMontant")).color
  }));
  dire("le petit montant n'a pas la couleur du grand",
    couleurs.petit === couleurs.grand ? "la meme" : "differente", "differente",
    JSON.stringify(couleurs));

  dire("la barre de progression a disparu de l'ecran du prix",
    await page.evaluate(() => {
      const l = document.querySelector("#modal-estimate .progress-ligne");
      return !l || l.hidden ? "cachee" : "encore la";
    }), "cachee");

  /* On amene la porte de sortie dans le cadre avant de la
     photographier : une capture qui s'arrete a la ligne de
     flottaison ne prouve pas ce qu'il y a en dessous. */
  await page.evaluate(() => {
    document.getElementById("esPetit").scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SORTIE, "non-plus-petit.png") });
}

/* ============================================================
   5 · UNE SEULE LIGNE PAR PERSONNE
   ============================================================ */
titre("5 · LE CLASSEUR");
{
  const f = etat.feuilles.get("Estimation rapide");
  if (!f) ARRET("l'onglet « Estimation rapide » n'existe pas");
  const entetes = f.valeurs[0];
  const lignes = f.valeurs.slice(1);
  const iMail = entetes.indexOf("Courriel");
  const iVue = entetes.indexOf("Fourchette vue");
  if (iMail < 0 || iVue < 0) ARRET("colonnes introuvables au classeur");
  if (!lignes.length) ARRET("aucune ligne au classeur — les parcours n'ont rien ecrit");

  const parMail = {};
  lignes.forEach((l) => {
    const m = String(l[iMail] || "");
    parMail[m] = (parMail[m] || 0) + 1;
  });
  const doubles = Object.keys(parMail).filter((m) => parMail[m] > 1);
  dire("une seule ligne par courriel", doubles.length, 0, JSON.stringify(doubles));

  const vitrine = lignes.find((l) => l[iMail] === "zz-vitrine@exemple.ca");
  dire("la ligne du chemin vitrine existe", !!vitrine, true);
  if (vitrine) {
    dire("elle porte la fourchette que l'ecran a montree",
      String(vitrine[iVue]), vus.vitrine.montant);
  }
  const auto = lignes.find((l) => l[iMail] === "zz-automatisation@exemple.ca");
  dire("le chemin sans prix a sa ligne", !!auto, true);
  if (auto) {
    dire("et sa colonne dit qu'il n'y a pas de prix automatique",
      String(auto[iVue]), "Sans prix automatique");
  }
}

/* ============================================================
   6 · SUR TELEPHONE
   ============================================================ */
titre("6 · SUR TELEPHONE — 390 px");
{
  const p2 = await nouvellePage(390, 844);
  await ouvrirEstimateur(p2);
  const petites = await p2.evaluate(() => {
    const s = document.querySelector("#wizard .step[data-step]:not([hidden])");
    return [...s.querySelectorAll("button")]
      .map((b) => { const r = b.getBoundingClientRect(); return { t: (b.textContent || "").trim().slice(0, 30), h: Math.round(r.height), w: Math.round(r.width) }; })
      .filter((x) => x.h < 44 || x.w < 44);
  });
  dire("aucune cible sous 44 px a l'ecran 1", petites.length, 0, JSON.stringify(petites));

  const deborde = await p2.evaluate(() => {
    const p = document.querySelector("#modal-estimate .modal-panel");
    return p.scrollWidth > p.clientWidth + 1;
  });
  dire("le panneau ne deborde pas horizontalement", deborde, false);

  await choisir(p2, "type_de_projet", "Une boutique en ligne");
  await choisir(p2, "ampleur", "25 à 250 produits");
  const casesPetites = await p2.evaluate(() => {
    const s = document.querySelector("#wizard .step[data-step]:not([hidden])");
    return [...s.querySelectorAll(".check")]
      .map((b) => { const r = b.getBoundingClientRect(); return { t: (b.textContent || "").trim().slice(0, 26), h: Math.round(r.height) }; })
      .filter((x) => x.h < 44);
  });
  dire("aucune case de fonction sous 44 px", casesPetites.length, 0, JSON.stringify(casesPetites));
    /* CAPTURE DE FENETRE, JAMAIS . La modale vit dans le
     flux de la page :  a photographie 16 745 px de site
     avec le formulaire haut de trois millimetres dedans. Une image
     illisible ne prouve rien. */
  await p2.screenshot({ path: path.join(SORTIE, "telephone-fonctions.png") });
  await p2.context().close();
}

await nav.close();
site.close();
if (GOOGLE && GOOGLE.close) GOOGLE.close();

console.log("");
console.log("============================================================");
console.log(ko === 0 ? "L'ESTIMATEUR TIENT : " + n + " / " + n : "DEFAUTS : " + ko + " sur " + n);
console.log("Captures : preuves/estimateur/");
console.log("============================================================");
process.exit(ko === 0 ? 0 : 1);
