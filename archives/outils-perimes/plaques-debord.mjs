/* ============================================================
   LE DEBORDEMENT VERTICAL DES PLAQUES
   `node tools/plaques-debord.mjs [adresse]`

   La sonde du chantier Services a releve que la huitieme plaque —
   « Québec » — sort du hero et mord de 21 a 25 px sur le seuil de la
   section 02. Ce fichier mesure le PIRE moment du cycle, pas un
   instant quelconque.

   PIEGE 24, applique : la fenetre d'observation doit couvrir au
   moins une demi-periode de l'element le plus lent. Les periodes
   sont derivees de `--v` et vont jusqu'a 10,6 s ; on echantillonne
   donc 12 s, a 20 images par seconde, soit 240 releves.

   PIEGE 21, applique : on ne mesure pas une position absolue, qui
   melangerait la boucle, la derive au defilement et la
   recomposition du document. On mesure `bas de la plaque - haut de
   la section suivante`, une seule difference signee.
   ============================================================ */
import { chromium } from "playwright";

const BASE = (process.argv[2] || "http://127.0.0.1:8099").replace(/\/$/, "") + "/";
const LARGEURS = [1920, 1600, 1440, 1280, 1024];

const nav = await chromium.launch();
const resultats = [];

for (const L of LARGEURS) {
  const ctx = await nav.newContext({ viewport: { width: L, height: 900 }, colorScheme: "light" });
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(2400);

  const mesure = await page.evaluate(async () => {
    const bande = document.querySelector("[data-plaques]");
    const services = document.getElementById("services");
    const plaques = [...document.querySelectorAll(".plaque")];
    const corps = [...document.querySelectorAll(".plaque-corps")];
    const pire = plaques.map(() => -99999);
    let global = -99999, quiGlobal = null, quandGlobal = 0;

    const t0 = performance.now();
    /* 12 s a 20 Hz : au-dela d'une demi-periode du plus lent (10,6 s). */
    while (performance.now() - t0 < 12000) {
      const hautSection = services.getBoundingClientRect().top;
      const basBande = bande.getBoundingClientRect().bottom;
      for (let i = 0; i < plaques.length; i++) {
        /* Le corps porte la boucle, la coque porte la derive : on
           prend le plus bas des deux boites. */
        const b = Math.max(plaques[i].getBoundingClientRect().bottom, corps[i].getBoundingClientRect().bottom);
        const d = b - hautSection;
        if (d > pire[i]) pire[i] = d;
        if (d > global) { global = d; quiGlobal = i; quandGlobal = Math.round(performance.now() - t0); }
        /* Deuxieme mesure, independante : de combien la plaque sort
           de SA PROPRE bande. C'est celle qui dit ou corriger. */
        const s = b - basBande;
        if (!plaques[i].__sortie || s > plaques[i].__sortie) plaques[i].__sortie = s;
      }
      await new Promise((r) => setTimeout(r, 50));
    }

    return {
      debordMaxSurLaSection: Math.round(global),
      plaqueFautive: quiGlobal,
      texteFautif: quiGlobal === null ? null : (plaques[quiGlobal].textContent || "").trim().replace(/\s+/g, " ").slice(0, 40),
      auBoutDeMs: quandGlobal,
      parPlaque: pire.map((v) => Math.round(v)),
      sortieDeBandeParPlaque: plaques.map((p) => Math.round(p.__sortie || -99999)),
      remplissageBasDeBande: getComputedStyle(bande).paddingBottom,
      echantillons: 240
    };
  });

  resultats.push({ largeur: L, ...mesure });
  await ctx.close();
}

console.log(JSON.stringify({ adresse: BASE, resultats }, null, 2));
await nav.close();
