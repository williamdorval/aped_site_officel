/* ============================================================
   L'ESTIMATEUR, DANS L'INTERFACE
   `node tools/estimateur-ui.mjs [port]`

   Le calcul est verifie ailleurs. Ici on joue le parcours d'un
   visiteur : six questions, un courriel, et on lit ce qui s'affiche
   vraiment a l'ecran — y compris le cas « sur devis », ou la borne
   haute n'existe pas et ou un plafond invente serait un chiffre faux
   affiche avec aplomb.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PORT = process.argv[2] || "8099";
const SORTIE = path.join(RACINE, "refonte-captures", "estimateur");
fs.mkdirSync(SORTIE, { recursive: true });

/* Deux profils opposes : le plus petit chantier possible, et le plus
   gros — celui qui doit tomber « sur devis ». */
const PROFILS = [
  { nom: "minimal", rep: ["vitrine", "restauration", "petit", "essentiel", "flexible", "non"] },
  { nom: "maximal", rep: ["app", "immobilier", "grand", "signature", "urgent", "oui"] }
];

const nav = await chromium.launch();
const R = { profils: [], erreurs: [] };

for (const profil of PROFILS) {
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => R.erreurs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") R.erreurs.push(m.text()); });
  /* On intercepte l'envoi : ce test ne doit pas remplir la boite. */
  await page.route("**/formsubmit.co/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: "true" }) }));
  await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "load" });
  await page.waitForTimeout(1200);

  await page.click('[data-modal-open="modal-estimate"]');
  await page.waitForTimeout(500);

  for (const valeur of profil.rep) {
    await page.click(`#wizard .step:not([hidden]) [data-value="${valeur}"]`);
    await page.waitForTimeout(320);
  }
  await page.fill("#esName", "Essai");
  await page.fill("#esEmail", "essai@aped-verification.ca");
  await page.click('form[data-form="estimate"] [data-submit]');
  await page.waitForTimeout(2200);

  const vu = await page.evaluate(() => {
    const l = document.getElementById("priceLow");
    const h = document.getElementById("priceHigh");
    const s = document.getElementById("priceSuite");
    const bloc = document.querySelector('#wizard .step[data-step="8"]');
    return {
      visible: bloc && !bloc.hasAttribute("hidden"),
      bas: l ? l.textContent : null,
      haut: h ? (h.hidden ? "(masque)" : h.textContent) : null,
      suite: s ? s.textContent : null,
      ligne: bloc ? bloc.querySelector("p.num").textContent.replace(/\s+/g, " ").trim() : null
    };
  });
  R.profils.push({ nom: profil.nom, reponses: profil.rep, affiche: vu });
  await page.screenshot({ path: path.join(SORTIE, `${profil.nom}.png`) });
  await ctx.close();
}

await nav.close();

R.verdict = {
  lesDeuxAffichent: R.profils.every((p) => p.affiche.visible),
  minimalABorneHaute: R.profils[0].affiche.haut !== "(masque)",
  maximalEstSurDevis: R.profils[1].affiche.haut === "(masque)" &&
    /sur devis/.test(R.profils[1].affiche.suite || ""),
  aucuneErreur: R.erreurs.length === 0
};
fs.writeFileSync(path.join(SORTIE, "rapport.json"), JSON.stringify(R, null, 2), "utf8");
console.log(JSON.stringify(R, null, 2));
