/* ============================================================
   LES DEUX PORTES DU FORMULAIRE PROJET
   `node tools/portes-check.mjs`

   CE QU'IL GARDE.  D-764

   Le numéro de téléphone faisait SORTIR du parcours : celui qui
   appelle depuis l'étape 3 ne finit pas le formulaire, et on ne
   sait jamais ce qu'il voulait. Deux portes le gardent chez nous,
   et chacune mène à une ligne enregistrée.

   CE QUI DOIT TENIR, ET QUI SE PROUVE PAR L'IMAGE :
   les deux boutons sont VISIBLES à toutes les étapes — pas
   seulement à la première, pas seulement à la dernière. Une sonde
   du DOM ne suffit pas : `hidden` peut être faux pendant qu'un
   ancêtre les rogne. On mesure le rectangle À L'ÉCRAN, et on
   photographie. Pièges 25 · 77 · 83.

   ET CE QUI DOIT TENIR SANS SE VOIR : la bascule ENREGISTRE
   d'abord. On lit le corps de la requête qui part, parce que
   c'est la seule chose qui prouve qu'une ligne existera.

   Sorties : 0 tout tient · 1 défaut.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const SORTIE = path.join(RACINE, "preuves", "portes");
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

/* Un serveur de fichiers, pour ne dépendre d'aucun port occupé. */
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
const page = await nav.newPage({ viewport: { width: 390, height: 844 } });

const erreurs = [];
page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
page.on("pageerror", (e) => erreurs.push(String(e)));

const envois = [];
page.on("request", (r) => {
  if (r.url().indexOf("script.google.com") === -1) return;
  if (r.method() !== "POST") return;
  try { envois.push(r.postData() || ""); } catch (e) {}
});
await page.route("**script.google.com/**", (r) =>
  r.fulfill({ status: 200, contentType: "application/json",
    body: JSON.stringify({ success: true, ligne: 2, session: true, etape: "1 / 8" }) }));

/* Les deux clés, sinon le sas retient la page et la fenêtre des
   guides recouvre tout. Pièges 18 · 3. */
await page.addInitScript(() => {
  try {
    sessionStorage.setItem("aped-sans-popup", "1");
    sessionStorage.setItem("aped-entree-saut", "1");
  } catch (e) {}
});
await page.goto(BASE + "/index.html", { waitUntil: "load" });
await page.waitForTimeout(2800);
/* Toute sonde imprime `data-palier` à côté de son verdict : lue
   avant 3 s, elle ne voit pas la vraie page. Piège 87. */
console.log("data-palier : " + await page.getAttribute("html", "data-palier"));
console.log("largeur     : 390 px (téléphone)");

/* ============================================================
   1 · LE NUMÉRO A QUITTÉ CE FORMULAIRE
   ============================================================ */
console.log("");
console.log("--- 1 · LE NUMÉRO N'EST PLUS DANS « DÉMARRER VOTRE PROJET »");
{
  const reste = await page.evaluate(() =>
    document.querySelectorAll('#projectWizard a[data-appel]').length);
  dire("aucun lien téléphone dans le formulaire projet", reste, 0);

  /* IL RESTE AILLEURS, ET C'EST VOULU. Un site sans aucun chemin
     vers le téléphone serait une régression, pas une amélioration. */
  const ailleurs = await page.evaluate(() =>
    document.querySelectorAll('a[data-appel]').length);
  dire("le numéro reste joignable ailleurs sur le site", ailleurs > 0, true,
    "on retire le numéro d'un parcours, on ne le retire pas du site");
}

/* ============================================================
   2 · LES DEUX PORTES, À CHAQUE ÉTAPE, MESURÉES À L'ÉCRAN
   ============================================================ */
console.log("");
console.log("--- 2 · VISIBLES À TOUTES LES ÉTAPES (rectangle réel)");

/* ON PILOTE COMME UN VISITEUR, ON NE FORCE PAS `hidden`.

   Premiere version de cet outil : elle posait `hidden = false` sur
   la modale et sur les etapes. Deux cas ont echoue en accusant un
   code sain — `closeModal()` s'appuie sur `activeModal`, que seul
   `openModal` renseigne, et `pStep` n'avance que par `goPStep`. Un
   banc qui court-circuite l'interface ne mesure plus l'interface :
   il mesure sa propre mise en scene. */
async function ouvrirProjet() {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.querySelectorAll(".modal").forEach((m) => { m.hidden = true; });
  });
  const ouvreur = await page.$("[data-modal-open=\"modal-project\"]");
  if (!ouvreur) { console.error("ARRET · aucun bouton n'ouvre le formulaire projet"); process.exit(2); }
  await ouvreur.evaluate((el) => el.click());
  await page.waitForTimeout(500);
}

/* Remplit ce qui est OBLIGATOIRE dans l'etape visible, rien de
   plus : on veut franchir l'etape, pas simuler un vrai client. */
async function remplirEtapeVisible() {
  await page.evaluate(() => {
    const etape = [...document.querySelectorAll("#projectWizard .step[data-pstep]")]
      .find((s) => !s.hidden);
    if (!etape) return;
    /* Les choix en boutons ecrivent dans un `input[type=hidden]` :
       cliquer le bouton est le SEUL chemin qui les renseigne. */
    etape.querySelectorAll(".choices").forEach((g) => {
      const cache = g.parentElement.querySelector('input[type="hidden"]');
      if (cache && !cache.value) { const b = g.querySelector("button"); if (b) b.click(); }
    });
    etape.querySelectorAll(".field").forEach((f) => {
      const cases = f.querySelectorAll('input[type="checkbox"]');
      if (cases.length) {
        if (![...cases].some((c) => c.checked)) {
          cases[0].checked = true;
          cases[0].dispatchEvent(new Event("change", { bubbles: true }));
        }
        return;
      }
      const el = f.querySelector("input, select, textarea");
      if (!el || !el.required || el.type === "hidden" || el.value) return;
      if (el.tagName === "SELECT") {
        const o = [...el.options].find((x) => x.value);
        if (o) { el.value = o.value; el.dispatchEvent(new Event("change", { bubbles: true })); }
        return;
      }
      el.value = el.type === "email" ? "zz@exemple.ca"
               : el.type === "tel" ? "8195230871"
               : el.type === "url" ? "https://exemple.ca"
               : "ZZ " + (el.id || "champ");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
  });
  await page.waitForTimeout(120);
}

/* L'ETAPE SE LIT DANS LA PAGE, elle ne se compte pas de ce cote. */
const etapeVisible = () => page.evaluate(() => {
  const s = [...document.querySelectorAll("#projectWizard .step[data-pstep]")]
    .find((x) => !x.hidden);
  return s ? Number(s.dataset.pstep) : 0;
});

async function allerA(cible) {
  for (let garde = 0; garde < 20; garde++) {
    const ici = await etapeVisible();
    if (ici >= cible) return ici;
    await remplirEtapeVisible();
    await page.click("#projectNext");
    await page.waitForTimeout(320);
    if (await etapeVisible() === ici) {
      console.error("ARRET · l'etape " + ici + " ne se franchit pas — le formulaire est casse");
      process.exit(1);
    }
  }
  return await etapeVisible();
}

await ouvrirProjet();

const ETAPES_VUES = [1, 4, 7];
for (const e of [1, 2, 3, 4, 5, 6, 7]) {
  await allerA(e);
  dire("on est bien rendu a l'etape " + e, await etapeVisible(), e);

  /* LE RECTANGLE, PAS L'ATTRIBUT. `hidden === false` ne dit rien
     d'un ancêtre à `overflow: hidden` ni d'un parent replié :
     `getBoundingClientRect` ignore le rognage d'un ancêtre, alors
     on exige EN PLUS une hauteur et une largeur non nulles et un
     `visibility` calculé. Piège 25. */
  const m = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("#projectWizard [data-porte]").forEach((b) => {
      const r = b.getBoundingClientRect();
      const st = getComputedStyle(b);
      out.push({
        porte: b.dataset.porte,
        w: Math.round(r.width), h: Math.round(r.height),
        vis: st.visibility, op: st.opacity,
        texte: (b.textContent || "").replace(/\s+/g, " ").trim()
      });
    });
    return out;
  });

  dire("étape " + e + " · les deux portes sont là", m.length, 2);
  m.forEach((b) => {
    dire("étape " + e + " · « " + b.texte + " » a une hauteur d'au moins 44 px",
      b.h >= 44, true, "mesuré : " + b.h + " px — cible au pouce");
    dire("étape " + e + " · « " + b.texte + " » est visible",
      b.vis === "visible" && Number(b.op) > 0.9 && b.w > 0, true,
      JSON.stringify(b));
  });

  if (ETAPES_VUES.includes(e)) {
    const bloc = await page.$(".form-portes");
    if (bloc) await bloc.scrollIntoViewIfNeeded();
    await page.waitForTimeout(220);
    const f = path.join(SORTIE, "projet-etape-" + e + ".png");
    await page.screenshot({ path: f });
    console.log("         capture : preuves/portes/projet-etape-" + e + ".png");
  }
}

/* LA HIÉRARCHIE : « Continuer » est en minium plein, les deux
   portes sont en contour. Elle se mesure sur la COULEUR DE FOND,
   pas sur le nom de la classe — une classe peut mentir. */
console.log("");
console.log("--- 3 · LA HIÉRARCHIE SE VOIT SANS SE LIRE");
{
  const h = await page.evaluate(() => {
    const suiv = document.getElementById("projectNext");
    const porte = document.querySelector("#projectWizard [data-porte]");
    const fond = (el) => getComputedStyle(el).backgroundColor;
    const opaque = (c) => !/^rgba\(.*,\s*0\)$/.test(c) && c !== "transparent";
    return { suivant: fond(suiv), porte: fond(porte),
             suivantPlein: opaque(fond(suiv)), portePleine: opaque(fond(porte)) };
  });
  dire("« Continuer » est un aplat", h.suivantPlein, true, h.suivant);
  dire("les portes ne le sont pas", h.portePleine, false, h.porte);
  dire("elles ne portent donc pas le même poids", h.suivant === h.porte, false);
}

/* ============================================================
   4 · LA BASCULE ENREGISTRE AVANT D'OUVRIR
   ============================================================ */
console.log("");
console.log("--- 4 · PARTIR VERS L'ESTIMATION N'EFFACE RIEN");
{
  await ouvrirProjet();
  await page.evaluate(() => {
    const n2 = document.getElementById("prName");
    const c = document.getElementById("prCompany");
    if (n2) { n2.value = "ZZ Porte Nom"; n2.dispatchEvent(new Event("input", { bubbles: true })); }
    if (c) { c.value = "ZZ Porte Entreprise"; c.dispatchEvent(new Event("input", { bubbles: true })); }
  });
  dire("on part bien de l'étape 1", await etapeVisible(), 1);
  envois.length = 0;
  await page.click('#projectWizard [data-porte="estimate"]');
  await page.waitForTimeout(900);

  dire("une requête est partie", envois.length >= 1, true,
    "sans elle, la ligne n'existe pas et le lead est perdu");
  const corps = envois.join("\n");
  let charge = null;
  try { charge = JSON.parse(envois[0] || "{}"); } catch (e) {}

  dire("elle porte le formulaire projet", charge && charge._form, "project");
  dire("elle dit VERS OÙ la personne est partie",
    charge && charge._parti_vers, "estimate",
    "sans ça, la bascule ne se distingue pas d'un abandon");
  dire("elle emporte ce qui était déjà rempli",
    charge && charge.nom, "ZZ Porte Nom");
  dire("elle n'est PAS marquée finale", !!(charge && charge._final), false,
    "une bascule ne complète pas la demande");
  dire("elle porte l'étape où la personne en était",
    charge && String(charge._etape), "1");

  /* LA MODALE D'ARRIVÉE EST OUVERTE, celle de départ fermée. */
  const etat = await page.evaluate(() => ({
    projet: document.getElementById("modal-project").hidden,
    estim: document.getElementById("modal-estimate").hidden
  }));
  dire("le formulaire projet s'est fermé", etat.projet, true);
  dire("l'estimation s'est ouverte", etat.estim, false);
}

console.log("");
console.log("--- 5 · L'AUTRE PORTE MÈNE À LA RÉSERVATION");
{
  await ouvrirProjet();
  await allerA(3);
  dire("on est rendu à l'étape 3", await etapeVisible(), 3);
  envois.length = 0;
  await page.click('#projectWizard [data-porte="booking"]');
  await page.waitForTimeout(900);
  let charge = null;
  try { charge = JSON.parse(envois[0] || "{}"); } catch (e) {}
  dire("elle dit « booking »", charge && charge._parti_vers, "booking");
  dire("et l'étape 3, pas l'étape 1", charge && String(charge._etape), "3");
  const ouvert = await page.evaluate(() =>
    document.getElementById("modal-booking").hidden);
  dire("la réservation s'est ouverte", ouvert, false);
}

/* ============================================================
   6 · LE NUMÉRO SE MET EN FORME PENDANT LA FRAPPE
   ============================================================ */
console.log("");
console.log("--- 6 · LE FORMAT DU TÉLÉPHONE  (D-766)");
{
  await page.evaluate(() => {
    document.querySelectorAll(".modal").forEach((m) => { m.hidden = true; });
    document.getElementById("modal-urgent").hidden = false;
  });
  await page.waitForTimeout(300);

  const champ = "#urPhone";
  await page.fill(champ, "");
  await page.type(champ, "8195230871", { delay: 12 });
  dire("dix chiffres tapés deviennent lisibles",
    await page.inputValue(champ), "819 523-0871");

  await page.fill(champ, "");
  await page.type(champ, "819", { delay: 12 });
  dire("trois chiffres restent nus", await page.inputValue(champ), "819");
  await page.type(champ, "5", { delay: 12 });
  dire("le quatrième pose l'espace", await page.inputValue(champ), "819 5");

  /* UN COLLAGE DÉJÀ MIS EN FORME NE DOIT PAS SE DÉFORMER. */
  await page.fill(champ, "(418) 555-0142");
  await page.evaluate((s) => document.querySelector(s).blur(), champ);
  await page.waitForTimeout(120);
  dire("un collage entre parenthèses se range",
    await page.inputValue(champ), "418 555-0142");

  /* LE CLAVIER DU TÉLÉPHONE. */
  const clavier = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('input[type="tel"]').forEach((i) => {
      out.push(i.getAttribute("inputmode") + "/" + i.getAttribute("autocomplete"));
    });
    return out;
  });
  dire("tous les champs tel demandent le clavier numérique",
    clavier.every((c) => c === "tel/tel"), true, JSON.stringify(clavier));

  /* ON N'A PAS CASSÉ LA VALIDATION : dix chiffres passent. */
  const valide = await page.evaluate(() => {
    const i = document.getElementById("urPhone");
    return String(i.value).replace(/\D/g, "").length >= 10;
  });
  dire("le numéro mis en forme reste valide", valide, true);
}

console.log("");
dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 3).join(" | "));

await nav.close();
serveur.close();

console.log("");
console.log("============================================================");
console.log(ko ? ("LES PORTES NE TIENNENT PAS : " + ko + " échec(s) sur " + n)
              : ("LES DEUX PORTES TIENNENT : " + n + " / " + n));
console.log("Captures : preuves/portes/");
console.log("============================================================");
process.exit(ko ? 1 : 0);
