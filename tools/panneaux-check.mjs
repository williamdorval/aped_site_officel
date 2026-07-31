/* ============================================================
   LES CINQ PANNEAUX « VOIR EN DETAIL »
   `node tools/panneaux-check.mjs [port] [tag]`

   Le critere n'est pas « le code est en place » : c'est qu'un
   observateur mis devant les cinq captures ne puisse pas dire lequel
   a ete fait en premier. On photographie donc les cinq, et on releve
   ce qui se compte : la hauteur de contenu, la presence d'un visuel,
   et le fait que chaque renvoi ATTERRIT.

   Les deux renvois nouveaux sont testes DIX FOIS chacun, parce
   qu'une arrivee par ancre sur ce site depend d'une re-visee qui
   repasse jusqu'a 900 ms apres le saut (D-583) et d'un fichier
   charge en vague 2 (D-607). Un essai unique ne prouve rien.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PORT = process.argv[2] || "8099";
const TAG = process.argv[3] || "";
const BASE = `http://127.0.0.1:${PORT}/`;
const SORTIE = path.join(RACINE, "preuves", "chantier3-panneaux" + (TAG ? "-" + TAG : ""));
fs.mkdirSync(SORTIE, { recursive: true });

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const erreurs = [];
page.on("pageerror", (e) => erreurs.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
await page.addInitScript(() => {
  try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {}
});
await page.goto(BASE, { waitUntil: "load" });
await page.waitForTimeout(1600);

const R = { panneaux: [], renvois: {}, erreurs };

/* --- 1 · LES CINQ PANNEAUX, OUVERTS ET PHOTOGRAPHIES --- */
for (const k of ["01", "02", "03", "04", "05"]) {
  await page.evaluate((k) => {
    const f = document.getElementById("svc-fiche-" + k);
    const a = document.querySelector('[data-svc-ouvre="svc-fiche-' + k + '"]');
    if (a) a.click(); else f.setAttribute("data-ouvert", "");
  }, k);
  await page.waitForTimeout(700);
  const m = await page.evaluate((k) => {
    const f = document.getElementById("svc-fiche-" + k);
    const dit = f.querySelector(".svc-fiche-dit");
    const inn = f.querySelector(".svc-fiche-in");
    const r = f.getBoundingClientRect();
    const visuels = f.querySelectorAll("svg[role=img], img, figure").length;
    const anim = [...f.querySelectorAll("*")].filter((e) => getComputedStyle(e).animationName !== "none").length;
    return {
      id: "svc-fiche-" + k,
      ouvert: f.hasAttribute("data-ouvert"),
      role: f.getAttribute("role"),
      hauteurPanneau: Math.round(r.height),
      hauteurContenu: Math.round(dit.scrollHeight),
      defileInterne: Math.round(inn.scrollHeight - inn.clientHeight),
      debordeFenetre: Math.round(Math.max(0, r.bottom - innerHeight) + Math.max(0, -r.top)),
      visuels,
      elementsAnimes: anim,
      liensSortants: [...f.querySelectorAll("[data-svc-ferme-vers]")].map((a) => a.getAttribute("href"))
    };
  }, k);
  await page.locator("#svc-fiche-" + k).screenshot({ path: path.join(SORTIE, `panneau-${k}.png`) });
  R.panneaux.push(m);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
}

/* --- 2 · LE RENVOI 01 VERS #realisations, DIX FOIS --- */
R.renvois.realisations = [];
for (let i = 0; i < 10; i++) {
  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(1300);
  await page.evaluate(() => document.querySelector('[data-svc-ouvre="svc-fiche-01"]').click());
  await page.waitForTimeout(600);
  await page.evaluate(() => document.querySelector('#svc-fiche-01 .svc-renvoi a[href="#realisations"]').click());
  await page.waitForTimeout(2400);
  R.renvois.realisations.push(await page.evaluate(() => {
    const s = document.getElementById("realisations");
    return {
      panneauFerme: !document.querySelector(".svc-fiche[data-ouvert]"),
      hash: location.hash,
      ecartAuHaut: Math.round(s.getBoundingClientRect().top),
      defilementRendu: getComputedStyle(document.body).overflow !== "hidden"
    };
  }));
}

/* --- 3 · LE RENVOI 03 VERS #visite QUI LANCE LA VISITE, DIX FOIS --- */
R.renvois.visite = [];
for (let i = 0; i < 10; i++) {
  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(1300);
  await page.evaluate(() => document.querySelector('[data-svc-ouvre="svc-fiche-03"]').click());
  await page.waitForTimeout(600);
  await page.evaluate(() => document.querySelector("#svc-fiche-03 [data-lance-visite]").click());
  /* Le lecteur charge son moteur : on lui laisse de quoi arriver. */
  await page.waitForTimeout(5000);
  R.renvois.visite.push(await page.evaluate(() => {
    const s = document.getElementById("visite");
    const bloc = document.querySelector("[data-tour]");
    const scene = document.querySelector("[data-tour-stage]");
    return {
      panneauFerme: !document.querySelector(".svc-fiche[data-ouvert]"),
      hash: location.hash,
      ecartAuHaut: Math.round(s.getBoundingClientRect().top),
      tourPret: bloc ? bloc.hasAttribute("data-tour-pret") : null,
      /* Le lecteur a demarre s'il charge, ou s'il a deja monte sa
         vue : les deux comptent, pas seulement la seconde. */
      lecteurLance: !!(bloc && (bloc.classList.contains("is-loading") ||
        scene.querySelector(".pnlm-container, canvas") ||
        scene.getAttribute("aria-busy") === "true")),
      etat: bloc ? bloc.className : null
    };
  }));
}

await page.screenshot({ path: path.join(SORTIE, "visite-lancee.png") });

const tousOuverts = R.panneaux.every((p) => p.ouvert);
const tousUnVisuel = R.panneaux.every((p) => p.visuels >= 1);
const reaOk = R.renvois.realisations.filter((r) => r.panneauFerme && Math.abs(r.ecartAuHaut) <= 96 && r.defilementRendu).length;
const visOk = R.renvois.visite.filter((r) => r.panneauFerme && Math.abs(r.ecartAuHaut) <= 96 && r.lecteurLance).length;

R.verdict = {
  lesCinqSOuvrent: tousOuverts,
  lesCinqOntUnVisuel: tousUnVisuel,
  aucunNeDebordeLaFenetre: R.panneaux.every((p) => p.debordeFenetre === 0),
  leDeuxEstAnime: (R.panneaux.find((p) => p.id === "svc-fiche-02") || {}).elementsAnimes > 0,
  renvoiRealisationsDixSurDix: reaOk === 10,
  renvoiVisiteDixSurDix: visOk === 10,
  aucuneErreurConsole: erreurs.length === 0
};
R.compte = { realisations: reaOk + "/10", visite: visOk + "/10" };
fs.writeFileSync(path.join(SORTIE, "rapport.json"), JSON.stringify(R, null, 2));
console.log(JSON.stringify({ panneaux: R.panneaux, compte: R.compte, erreurs, verdict: R.verdict }, null, 1));
const rate = Object.entries(R.verdict).filter(([, v]) => !v);
console.log(rate.length ? "\nECHEC : " + rate.map(([k]) => k).join(", ") : "\nTOUT PASSE");
process.exitCode = rate.length ? 1 : 0;
await nav.close();
