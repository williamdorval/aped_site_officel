/* ============================================================
   LA REPRISE DE PARCOURS TRAVERSE LE DECOUPAGE EN SEPT PAGES
   `node tools/serve.mjs 8099` puis `node tools/reprise-check.mjs [port]`

   CE QU'IL PROUVE, ET POURQUOI CA NE VA PLUS DE SOI.

   Le courriel de relance porte `<SITE_URL>/?reprendre=<kind>&s=<sid>&e=<n>`
   — il pointe sur la RACINE. Tant que le site tenait dans une seule
   page, la modale visee y etait forcement. Depuis le decoupage,
   l'accueil n'embarque plus de porte vers l'assistant de projet :
   le lien de relance ouvrait donc une page normale, sans un mot,
   et la personne qu'on venait de faire cliquer ne comprenait pas.

   TROIS CHOSES SE VERIFIENT ICI, DANS CET ORDRE :
     1 · trois ecrans remplis laissent un brouillon ET une session
         dans `localStorage` — c'est la sauvegarde progressive ;
     2 · le lien de relance ouvert sur une page SANS la modale
         renvoie vers `contact.html` en gardant ses parametres, et
         la session est reposee AVANT la redirection ;
     3 · a l'arrivee, la modale s'ouvre, les reponses sont la, et
         l'ecran est celui qu'on avait quitte.

   IL S'ARRETE PLUTOT QUE DE RENDRE ZERO. Si l'assistant ne s'ouvre
   pas, si le brouillon est vide, si la redirection n'a pas lieu,
   c'est un ARRET — pas un « 0 defaut ».
   ============================================================ */
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { port as portDe } from "./_adresse.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const PORT = portDe(process.argv[2]);
const BASE = `http://127.0.0.1:${PORT}`;

let n = 0, ko = 0;
function dire(nom, obtenu, attendu) {
  n++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) ko++;
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + nom
    + (ok ? "" : "\n         obtenu  : " + JSON.stringify(obtenu)
             + "\n         attendu : " + JSON.stringify(attendu)));
}
const ARRET = (m) => { console.error("\nARRET · " + m); process.exit(2); };

const nav = await chromium.launch();
/* UN SEUL CONTEXTE : `localStorage` est par ORIGINE et par contexte.
   Deux contextes separes ne partageraient rien, et le test
   prouverait le contraire de ce qu'on veut — a savoir que la
   fermeture de l'ONGLET ne perd pas le brouillon. */
const ctx = await nav.newContext({ viewport: { width: 1440, height: 950 } });
await ctx.route("**/js/config.local.js", (r) => r.fulfill({
  status: 200, contentType: "text/javascript; charset=utf-8",
  /* Une adresse bidon, interceptee juste apres : la sauvegarde
     progressive doit ecrire son brouillon LOCAL meme quand le
     service ne repond rien d'utile. */
  body: 'window.ADEXWEB_ENVOI = "https://script.google.com/macros/s/BANC/exec";\n'
}));
await ctx.route("**script.google.com/**", (r) => r.fulfill({
  status: 200, contentType: "application/json",
  body: JSON.stringify({ success: true, ligne: 2, session: true })
}));
await ctx.addInitScript(() => {
  try { sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {}
});

/* ---------- 1 · TROIS ECRANS, PUIS L'ONGLET SE FERME ---------- */
console.log("\n--- 1 · TROIS ECRANS REMPLIS, PUIS L'ONGLET SE FERME");
const a = await ctx.newPage();
a.on("pageerror", (e) => console.log("    PAGEERROR " + e));
/* `services.html` porte une porte vers l'assistant de projet ;
   l'accueil n'en a pas. C'est deja le decoupage a l'oeuvre. */
await a.goto(BASE + "/services.html", { waitUntil: "load" });
await a.waitForTimeout(1600);
if (!(await a.evaluate(() => document.documentElement.hasAttribute("data-main-ok")))) {
  ARRET("main.js n'est pas alle au bout sur services.html");
}
const porte = await a.$('[data-modal-open="modal-project"]');
if (!porte) ARRET("aucune porte vers modal-project sur services.html");
await porte.evaluate((el) => el.click());
await a.waitForTimeout(700);

const NOM = "Reprise Essai";
const ENTREPRISE = "Atelier Reprise inc";
const COURRIEL = "reprise.essai@exemple.ca";

for (let tour = 0; tour < 3; tour++) {
  const ici = await a.evaluate(() => {
    const v = [...document.querySelectorAll('#projectWizard .step[data-pstep]')].find((s) => !s.hidden);
    return v ? Number(v.dataset.pstep) : 0;
  });
  if (!ici) ARRET("aucun ecran visible dans l'assistant de projet");
  await a.evaluate(([p, v]) => {
    const etape = document.querySelector(`.step[data-pstep="${p}"]`);
    if (!etape) return;
    etape.querySelectorAll(".field").forEach((f) => {
      if (f.hidden || f.closest("[hidden]")) return;
      const cases = f.querySelectorAll('input[type="checkbox"]');
      if (cases.length) {
        cases[0].checked = true;
        cases[0].dispatchEvent(new Event("change", { bubbles: true }));
        return;
      }
      const e = f.querySelector("input:not([type=hidden]):not([type=file]), select, textarea");
      if (!e) return;
      if (e.tagName === "SELECT") {
        if (e.options.length > 1) { e.selectedIndex = 1; e.dispatchEvent(new Event("change", { bubbles: true })); }
        return;
      }
      if (e.value) return;
      e.value = e.type === "email" ? v.courriel
        : e.type === "tel" ? "418 555 0142"
        : /entreprise|company/i.test(e.id) ? v.entreprise
        : e.tagName === "TEXTAREA" ? "Un projet d'essai." : v.nom;
      e.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const choix = etape.querySelector(".choices button");
    if (choix && !etape.querySelector('[aria-pressed="true"]')) choix.click();
  }, [ici, { nom: NOM, entreprise: ENTREPRISE, courriel: COURRIEL }]);
  await a.waitForTimeout(200);
  await a.evaluate(() => {
    const b = document.getElementById("projectNext");
    if (b) { b.scrollIntoView({ block: "center", behavior: "instant" }); b.click(); }
  });
  await a.waitForTimeout(500);
}

const memoire = await a.evaluate(() => ({
  sid: localStorage.getItem("adexweb-sid-project") || "",
  brouillon: localStorage.getItem("adexweb-brouillon-project") || ""
}));
dire("une session est ouverte", /^[A-Za-z0-9_-]{8,40}$/.test(memoire.sid), true);
dire("un brouillon est garde", memoire.brouillon.length > 20, true);
let champs = {};
try { champs = JSON.parse(memoire.brouillon).champs || {}; } catch (e) {}
dire("il porte le nom tape", champs.nom || "", NOM);
dire("il porte l'entreprise tapee", champs.entreprise || "", ENTREPRISE);
if (!memoire.sid || !Object.keys(champs).length) ARRET("rien a reprendre : la sauvegarde progressive n'a rien laisse");

/* L'ONGLET SE FERME POUR DE VRAI. */
await a.close();

/* ---------- 2 · LE RENVOI, QUAND LA MODALE N'EST PAS LA ----------
   Les sept pages de contenu embarquent toutes `partiels/modales.html`
   — le renvoi ne se declenche donc que sur les deux qui s'en passent,
   la 404 et la confidentialite. C'est PEU, et c'est justement pour ca
   qu'il faut le mesurer : personne n'ira le voir a la main, et une
   404 est exactement ce qu'un lien de courriel finit par atteindre le
   jour ou une adresse change. */
console.log("\n--- 2 · SUR UNE PAGE SANS LA MODALE, LE LIEN RENVOIE AU CONTACT");
{
  const t = await ctx.newPage();
  await t.goto(BASE + "/404.html", { waitUntil: "load" });
  dire("la 404 n'embarque pas l'assistant",
    await t.evaluate(() => !!document.getElementById("modal-project")), false);
  /* ON RELEVE LES ADRESSES AU VOL. A l'arrivee, `reprendreParcours`
     consomme les parametres et NETTOIE la barre d'adresse tout de
     suite : lire `page.url()` une seconde plus tard ne montrerait
     qu'une page de contact nue, et on conclurait que les parametres
     se sont perdus alors qu'ils ont fait leur travail. */
  const passages = [];
  t.on("framenavigated", (f) => { if (f === t.mainFrame()) passages.push(f.url()); });
  await t.goto(`${BASE}/404.html?reprendre=project&s=${encodeURIComponent(memoire.sid)}&e=3`,
    { waitUntil: "load" });
  await t.waitForTimeout(2800);
  const renvoi = new URL(t.url());
  dire("on est renvoye sur la page de contact", renvoi.pathname.split("/").pop(), "contact.html");
  const porteur = passages.find((u) => u.indexOf("contact.html?") !== -1) || "";
  const q = porteur ? new URL(porteur).searchParams : new URLSearchParams();
  dire("le formulaire vise voyage avec", q.get("reprendre"), "project");
  dire("la session voyage avec", q.get("s"), memoire.sid);
  dire("l'etape voyage avec", q.get("e"), "3");
  dire("et la session est reposee AVANT le renvoi",
    await t.evaluate(() => localStorage.getItem("adexweb-sid-project")), memoire.sid);
  /* LA PREUVE QUE LE RENVOI SERT A QUELQUE CHOSE : le formulaire
     s'ouvre a l'arrivee, rempli. Un renvoi qui deposerait la
     personne devant une page fermee ne vaudrait pas mieux qu'un
     bouton mort. */
  const apres = await t.evaluate(() => {
    const m = document.getElementById("modal-project");
    const e = document.getElementById("prName");
    return { ouverte: !!m && !m.hidden, nom: e ? e.value : "(absent)" };
  });
  dire("l'assistant s'ouvre a l'arrivee du renvoi", apres.ouverte, true);
  dire("et il porte les reponses deja tapees", apres.nom, NOM);
  await t.close();
}

/* ---------- 3 · A L'ARRIVEE, LE BROUILLON EST REJOUE ---------- */
console.log("\n--- 3 · A L'ARRIVEE, ON RETROUVE SES REPONSES");
const b = await ctx.newPage();
b.on("pageerror", (e) => console.log("    PAGEERROR " + e));
await b.goto(`${BASE}/index.html?reprendre=project&s=${encodeURIComponent(memoire.sid)}&e=3`,
  { waitUntil: "load" });
await b.waitForTimeout(1200);
/* `reprendreParcours` attend 1 400 ms avant d'ouvrir. */
await b.waitForTimeout(2600);
const vu = await b.evaluate(() => {
  const m = document.getElementById("modal-project");
  const etape = [...document.querySelectorAll('#projectWizard .step[data-pstep]')].find((s) => !s.hidden);
  const val = (id) => { const e = document.getElementById(id); return e ? e.value : "(absent)"; };
  return {
    ouverte: !!m && !m.hidden,
    ecran: etape ? Number(etape.dataset.pstep) : 0,
    nom: val("prName"),
    entreprise: val("prCompany"),
    adresse: (location.search || "") + (location.hash || "")
  };
});
dire("l'assistant de projet est ouvert", vu.ouverte, true);
dire("le nom est revenu", vu.nom, NOM);
dire("l'entreprise est revenue", vu.entreprise, ENTREPRISE);
dire("on repart d'un ecran deja franchi, pas du premier", vu.ecran >= 2, true);
dire("et l'adresse est nettoyee du `_sid`", vu.adresse.indexOf("reprendre") === -1, true);

const erreurs = [];
b.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
await b.waitForTimeout(400);
dire("aucune erreur console a l'arrivee", erreurs.length, 0);

await nav.close();

console.log("\n============================================================");
console.log(`LA REPRISE TIENT : ${n - ko} / ${n}`);
console.log("============================================================");
process.exit(ko ? 1 : 0);
