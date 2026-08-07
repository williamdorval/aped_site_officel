/* ============================================================
   LES QUESTIONS CONDITIONNELLES — `node tools/conditionnelles-check.mjs`

   CE QU'IL GARDE.  D-771

   Une question sans objet n'est pas neutre : elle coûte le même
   temps qu'une vraie et elle apprend au visiteur que le formulaire
   ne l'écoute pas. Demander « combien de pages » à quelqu'un qui
   veut automatiser sa facturation prouve qu'on n'a pas lu sa
   réponse d'avant.

   LE DANGER DE CE CHANTIER, ET C'EST LUI QU'ON MESURE : sauter des
   écrans fait BAISSER le nombre de réponses notées, et sous trois
   `fourchetteDe` rend `null` — la fourchette disparaît, en
   silence, sans erreur. C'est le piège 4 en entier : un outil qui
   rend « 0 » sans erreur ment. Chaque saut est donc suivi d'une
   vérification que le chiffre paraît encore.

   ET LA MENTION LÉGALE : elle annonçait Google Meet à quelqu'un
   qui a coché « Téléphone ». Une phrase légale fausse est plus
   grave qu'une phrase de vente fausse — elle prétend décrire ce
   qu'on fait de leurs données.

   Sorties : 0 tout tient · 1 défaut.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const SORTIE = path.join(RACINE, "preuves", "conditionnelles");
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
function fauxCreneaux() {
  const jours = [];
  const d = new Date(); d.setDate(d.getDate() + 3);
  for (let j = 0; j < 3; j++) {
    const q = new Date(d.getTime() + j * 86400000);
    const creneaux = [];
    for (const [h, mm] of [[9, 0], [10, 30], [14, 0]]) {
      const t = new Date(q); t.setHours(h, mm, 0, 0);
      creneaux.push({ iso: t.toISOString(), h: h + " h " + String(mm).padStart(2, "0") });
    }
    jours.push({ date: q.toISOString().slice(0, 10), libelle: "essai",
                 libelleLong: "essai", creneaux: creneaux });
  }
  return { success: true, fuseau: "America/Toronto", duree: 30, preavisHeures: 24,
           horizonJours: 42, total: 9, jours: jours };
}
await page.route("**script.google.com/**", (r) => {
  const corps = r.request().url().indexOf("action=creneaux") !== -1
    ? fauxCreneaux() : { success: true, ligne: 2, session: true };
  r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(corps) });
});
await page.addInitScript(() => {
  try {
    sessionStorage.setItem("aped-sans-popup", "1");
    sessionStorage.setItem("aped-entree-saut", "1");
  } catch (e) {}
});
await page.goto(BASE + "/index.html", { waitUntil: "load" });
await page.waitForTimeout(2800);
console.log("data-palier : " + await page.getAttribute("html", "data-palier"));

async function ouvrir(id) {
  await page.evaluate(() => {
    document.querySelectorAll(".modal").forEach((m) => { m.hidden = true; });
    ["project", "estimate", "refer", "booking"].forEach((k) => {
      try { localStorage.removeItem("aped-brouillon-" + k); } catch (e) {}
      try { localStorage.removeItem("aped-sid-" + k); } catch (e) {}
    });
  });
  const b = await page.$('[data-modal-open="' + id + '"]');
  if (!b) { console.error("ARRET · rien n'ouvre " + id); process.exit(2); }
  await b.evaluate((el) => el.click());
  await page.waitForTimeout(600);
}
const visible = (sel, attr) => page.evaluate(([s, a]) => {
  const x = [...document.querySelectorAll(s + " .step[" + a + "]")].find((e) => !e.hidden);
  return x ? Number(x.getAttribute(a)) : 0;
}, [sel, attr]);
/* LE RECTANGLE, PAS L'ATTRIBUT : `hidden` peut être faux pendant
   qu'un ancêtre masque. Piège 25. */
const affiche = (id) => page.evaluate((i) => {
  const el = document.getElementById(i);
  if (!el) return null;
  const c = el.closest(".field") || el;
  const r = c.getBoundingClientRect();
  return !c.hidden && r.width > 0 && r.height > 0;
}, id);

/* ============================================================
   1 · LA MENTION LÉGALE SUIT LE MODE
   ============================================================ */
titre("1 · UNE PHRASE LÉGALE QUI DÉCRIT LA RÉALITÉ");
{
  await ouvrir("modal-booking");
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const j = document.querySelector(".cal-day:not(.is-blank):not([disabled])");
    if (j) j.click();
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const b = document.querySelector("#slotsList button:not([disabled])");
    if (b) b.click();
  });
  await page.waitForTimeout(500);

  const clic = (v) => page.evaluate((val) => {
    const b = [...document.querySelectorAll('.choices[data-choice="mode"] button')]
      .find((x) => x.dataset.value === val);
    if (b) b.click();
  }, v);
  const legal = () => page.evaluate(() =>
    (document.getElementById("bkLegal") || {}).textContent || "");

  await clic("Appel téléphonique");
  await page.waitForTimeout(200);
  const tel = await legal();
  dire("un appel téléphonique ne promet PAS de Meet",
    /Google Meet/.test(tel), false, tel);
  dire("il nomme quand même Google Agenda", /Google Agenda/.test(tel), true);
  dire("le lien vers la politique survit à la réécriture",
    await page.evaluate(() => !!document.querySelector("#bkLegal a")), true,
    "réécrire textContent efface les enfants : le lien doit être remis");
  dire("le numéro devient obligatoire",
    await page.evaluate(() => document.getElementById("bkPhone").required), true);
  dire("et son libellé le dit",
    await page.evaluate(() =>
      document.querySelector('label[for="bkPhone"]').textContent.trim()),
    "Le numéro qu’on compose");

  await clic("Google Meet");
  await page.waitForTimeout(200);
  const meet = await legal();
  dire("un Meet, lui, l'annonce", /Google Meet/.test(meet), true, meet);
  dire("le numéro n'est plus obligatoire",
    await page.evaluate(() => document.getElementById("bkPhone").required), false,
    "l'exiger au moment du plus grand engagement fait perdre la réservation");
  dire("le lien est toujours là",
    await page.evaluate(() => !!document.querySelector("#bkLegal a")), true);
}

/* ============================================================
   2 · LE PROJET N'EN DEMANDE PAS PLUS QU'IL N'EN FAUT
   ============================================================ */
titre("2 · LES ÉCRANS SANS OBJET SE SAUTENT");
{
  await ouvrir("modal-project");
  /* Écran 1 · 2 · puis on ne coche QUE « Automatisation et IA ». */
  await page.evaluate(() => {
    const p = (id, v) => { const e = document.getElementById(id); if (e) { e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); } };
    p("prName", "ZZ Cond"); p("prCompany", "ZZ inc");
  });
  await page.click("#projectNext"); await page.waitForTimeout(320);
  await page.evaluate(() => {
    const i = document.getElementById("prIndustry");
    i.value = "Garage"; i.dispatchEvent(new Event("input", { bubbles: true }));
    const s = document.getElementById("prSize");
    s.value = [...s.options].find((o) => o.value).value;
    s.dispatchEvent(new Event("change", { bubbles: true }));
    const b = document.querySelector('.choices[data-choice="site_existant"] button');
    if (b) b.click();
  });
  await page.click("#projectNext"); await page.waitForTimeout(320);
  dire("on est à l'écran des besoins", await visible("#projectWizard", "data-pstep"), 3);

  await page.evaluate(() => {
    document.querySelectorAll('#projectWizard input[name="besoins"]').forEach((c) => {
      c.checked = c.value === "Automatisation et IA";
      c.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const g = document.getElementById("prGoal");
    if (g) { g.value = [...g.options].find((o) => o.value).value; g.dispatchEvent(new Event("change", { bubbles: true })); }
  });
  await page.waitForTimeout(200);

  /* ON MESURE SUR L'ECRAN QUI PORTE LE CHAMP, PAS DEPUIS L'ECRAN
     D'AVANT. Premiere version : les quatre mesures se prenaient a
     l'ecran 3, alors que ces champs vivent aux ecrans 4 et 5 —
     masques, donc de rectangle nul. Les deux qui attendaient
     « masque » passaient par accident, et les deux qui attendaient
     « visible » accusaient un code sain. Une mesure prise au
     mauvais endroit ne vaut pas mieux que pas de mesure : elle
     vaut moins, parce qu'elle a l'air d'en etre une. */
  /* ON REMPLIT CE QUI RESTE VISIBLE AVANT DE POUSSER. Le champ
     masque ne bloque pas, mais celui qui reste, lui, bloque — et
     c'est exactement ce qu'on veut : la conditionnelle allege le
     formulaire, elle ne desarme pas sa validation. */
  const remplirVisibles = () => page.evaluate(() => {
    const e = [...document.querySelectorAll("#projectWizard .step[data-pstep]")]
      .find((s) => !s.hidden);
    if (!e) return;
    e.querySelectorAll(".field").forEach((f) => {
      if (f.hidden) return;
      const el = f.querySelector("input, select, textarea");
      if (!el || !el.required || el.type === "hidden" || el.value) return;
      if (el.tagName === "SELECT") {
        const o = [...el.options].find((x) => x.value);
        if (o) { el.value = o.value; el.dispatchEvent(new Event("change", { bubbles: true })); }
        return;
      }
      el.value = el.type === "email" ? "zz@exemple.ca" : "ZZ";
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
  });

  await page.click("#projectNext"); await page.waitForTimeout(340);
  dire("on est passe a l'ecran 4", await visible("#projectWizard", "data-pstep"), 4);
  dire("« combien de pages » y est masque", await affiche("prAmpleur"), false,
    "on n'a pas de pages quand on automatise une facturation");
  dire("mais le design y reste demande", await affiche("prDesign"), true,
    "une automatisation a quand meme une interface");

  await remplirVisibles();
  await page.click("#projectNext"); await page.waitForTimeout(340);
  dire("on est passe a l'ecran 5", await visible("#projectWizard", "data-pstep"), 5);
  dire("« vos textes et vos photos » y est masque", await affiche("prContenu"), false);
  dire("et les fonctions y restent", await affiche("prFonctions"), true);

  /* UN CHAMP MASQUE NE DOIT RETENIR PERSONNE. `validate()` saute
     les `.field` masques ; si ce n'etait pas vrai, le visiteur
     resterait bloque sur un champ qu'il ne voit pas — le pire
     defaut qu'une conditionnelle puisse produire. */
  await remplirVisibles();
  await page.click("#projectNext"); await page.waitForTimeout(360);
  dire("un champ masque ne bloque pas l'avancee",
    await visible("#projectWizard", "data-pstep") > 5, true,
    "sinon on reste coince sur un champ invisible");
}

/* LE CONTRÔLE QUI COMPTE LE PLUS. */
titre("3 · LA FOURCHETTE SURVIT AUX SAUTS");
{
  /* LE PLANCHER EST DE TROIS REPONSES NOTEES (`js/main.js`,
     `if (vus < 3) return null`). En sauter deux fait baisser ce
     compte, et sous le plancher la fourchette DISPARAIT — sans
     erreur, sans console, sans rien. C'est le piege 4 en entier :
     un resultat vide qui ressemble a un resultat. On compte donc
     ce qui reste, sur la charge REELLE du formulaire. */
  const NOTEES = ["type_de_projet", "besoins", "ampleur", "niveau_design",
                  "fonctions", "contenu", "echeancier", "site_existant"];
  const d = await page.evaluate(() => {
    const f2 = document.querySelector("#projectWizard");
    const o = {};
    new FormData(f2).forEach((v, k) => { o[k] = o[k] ? o[k] + ", " + v : v; });
    return o;
  });
  const restantes = NOTEES.filter((k) => d[k] && String(d[k]).trim());
  console.log("         reponses notees restantes : " + restantes.join(", "));
  dire("il reste au moins trois reponses notees", restantes.length >= 3, true,
    "sous trois, `fourchetteDe` rend null et le formulaire perd sa seule recompense");
  dire("les deux sautees sont bien absentes",
    !d.ampleur && !d.contenu, true,
    "ampleur=" + JSON.stringify(d.ampleur) + " contenu=" + JSON.stringify(d.contenu));
}

/* ============================================================
   4 · LES CHAMPS QUI S'EFFACENT QUAND ILS N'ONT PLUS DE SENS
   ============================================================ */
titre("4 · « QUAND VOUS APPELER » SANS NUMÉRO");
{
  await ouvrir("modal-project");
  await page.evaluate(() => {
    const p = (id, v) => { const e = document.getElementById(id); if (e) { e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); } };
    p("prName", "ZZ Cond"); p("prCompany", "ZZ inc");
  });
  /* On saute directement à l'écran des coordonnées en remplissant
     ce qu'il faut à chaque passage. */
  for (let i = 0; i < 8; i++) {
    const ici = await visible("#projectWizard", "data-pstep");
    if (ici >= 7) break;
    await page.evaluate(() => {
      const e = [...document.querySelectorAll("#projectWizard .step[data-pstep]")].find((s) => !s.hidden);
      e.querySelectorAll(".choices").forEach((g) => {
        const c = g.parentElement.querySelector('input[type="hidden"]');
        if (c && !c.value) { const b = g.querySelector("button"); if (b) b.click(); }
      });
      e.querySelectorAll(".field").forEach((f) => {
        if (f.hidden) return;
        const cs = f.querySelectorAll('input[type="checkbox"]');
        if (cs.length) { if (![...cs].some((c) => c.checked)) { cs[0].checked = true; cs[0].dispatchEvent(new Event("change", { bubbles: true })); } return; }
        const el = f.querySelector("input, select, textarea");
        if (!el || !el.required || el.type === "hidden" || el.value) return;
        if (el.tagName === "SELECT") { const o = [...el.options].find((x) => x.value); if (o) { el.value = o.value; el.dispatchEvent(new Event("change", { bubbles: true })); } return; }
        el.value = el.type === "email" ? "zz@exemple.ca" : "ZZ";
        el.dispatchEvent(new Event("input", { bubbles: true }));
      });
    });
    await page.click("#projectNext");
    await page.waitForTimeout(300);
  }
  dire("on est à l'écran des coordonnées",
    await visible("#projectWizard", "data-pstep"), 7);
  dire("sans numéro, on ne demande pas QUAND appeler",
    await affiche("prContactPref"), false,
    "la question n'a pas d'objet, et son menu partait rempli par défaut");

  await page.fill("#prPhone", "8195230871");
  await page.waitForTimeout(250);
  dire("dès qu'un numéro est là, la question revient",
    await affiche("prContactPref"), true);
  const f = path.join(SORTIE, "projet-coordonnees.png");
  await page.screenshot({ path: f });
  console.log("         capture : preuves/conditionnelles/projet-coordonnees.png");
}

titre("5 · « JUSTE MOI » N'A PAS DE RAISON SOCIALE");
{
  await ouvrir("modal-project");
  await page.evaluate(() => {
    const s = document.getElementById("prSize");
    /* Le menu vit à l'écran 2 : on le renseigne sans y aller, ce
       qui est exactement ce que fait un retour en arrière. */
    const o = [...s.options].find((x) => /juste moi/i.test(x.textContent));
    if (o) { s.value = o.value; s.dispatchEvent(new Event("change", { bubbles: true })); }
  });
  await page.waitForTimeout(220);
  dire("l'entreprise n'est plus obligatoire",
    await page.evaluate(() => document.getElementById("prCompany").required), false,
    "un travailleur autonome restait bloqué sur un champ qu'il ne peut pas remplir");
  dire("et le libellé le dit",
    await page.evaluate(() =>
      /optionnel|si vous en avez/.test(document.querySelector('label[for="prCompany"]').textContent)),
    true);
}

/* ============================================================
   6 · CE QUI NE DOIT PAS AVOIR CHANGÉ
   ============================================================ */
titre("6 · LE RÉFÉRENT NE PAIE PLUS LE CHAMP LE PLUS CHER");
{
  await ouvrir("modal-refer");
  dire("son téléphone est optionnel",
    await page.evaluate(() => document.getElementById("rfPhone").required), false);
  dire("le libellé le dit",
    await page.evaluate(() =>
      /optionnel/.test(document.querySelector('label[for="rfPhone"]').textContent)), true);
  dire("son courriel, lui, reste exigé",
    await page.evaluate(() => document.getElementById("rfEmail").required), true,
    "sans lui on ne peut ni le joindre ni le payer");
}

console.log("");
dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 3).join(" | "));

await nav.close();
serveur.close();
console.log("");
console.log("============================================================");
console.log(ko ? ("LES CONDITIONNELLES NE TIENNENT PAS : " + ko + " échec(s) sur " + n)
              : ("LES CONDITIONNELLES TIENNENT : " + n + " / " + n));
console.log("============================================================");
process.exit(ko ? 1 : 0);
