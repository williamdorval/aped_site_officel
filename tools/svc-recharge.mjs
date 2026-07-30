/* ============================================================
   `node tools/svc-recharge.mjs [adresse] [largeur]`

   UNE SEULE QUESTION, posee proprement : apres un rechargement
   direct sur `#services`, la page defile-t-elle, et par quel
   mecanisme les quatre chantiers sont-ils atteignables ?

   La sonde precedente rendait « scrollY inchange » dix fois de
   suite. Une valeur qui ne bouge pas peut venir de la page comme de
   l'instrument : on separe donc les deux. On demande a la page de
   defiler, on relit immediatement, on relit encore apres deux
   images, et on note QUI a repris la main.
   ============================================================ */
import { chromium } from "playwright";

const BASE = (process.argv[2] || "http://127.0.0.1:8099").replace(/\/$/, "") + "/";
const LARGEUR = Number(process.argv[3] || 1440);

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: LARGEUR, height: 900 }, colorScheme: "light" });
const page = await ctx.newPage();
await page.addInitScript(() => { try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });

const out = [];
for (const cas of ["direct-hash", "sans-hash-puis-descente"]) {
  await page.goto(cas === "direct-hash" ? BASE + "#services" : BASE, { waitUntil: "load" });
  await page.waitForTimeout(2400);

  if (cas === "sans-hash-puis-descente") {
    /* Descente pas a pas jusqu'au debut de la scene, en visiteur. */
    const cible = await page.evaluate(() => document.getElementById("svc").getBoundingClientRect().top + window.scrollY - 60);
    for (let i = 0; i < 60; i++) {
      await page.evaluate((v) => window.scrollBy(0, v), cible / 60);
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
    }
    await page.waitForTimeout(200);
  }

  const etat = await page.evaluate(() => {
    const svc = document.getElementById("svc");
    const piste = document.getElementById("svcPiste");
    const cs = getComputedStyle(svc);
    const csp = getComputedStyle(piste);
    const stg = window.ScrollTrigger ? ScrollTrigger.getAll().filter((t) => t.pin) : [];
    const mien = stg.find((t) => t.trigger && t.trigger.id === "svc") || null;
    return {
      scrollY: Math.round(scrollY),
      classePinned: svc.classList.contains("is-pinned"),
      positionCalculee: cs.position,
      pisteOverflowX: csp.overflowX,
      pisteScrollSnap: csp.scrollSnapType,
      pisteScrollLeft: piste.scrollLeft,
      pisteScrollWidth: piste.scrollWidth,
      pisteClientWidth: piste.clientWidth,
      /* Le seul mecanisme natif restant : peut-on encore faire
         defiler la piste lateralement ? */
      pisteDefilable: piste.scrollWidth - piste.clientWidth > 4 && csp.overflowX !== "hidden",
      st: mien ? { start: Math.round(mien.start), end: Math.round(mien.end), progress: Math.round(mien.progress * 1000) / 1000, actif: mien.isActive } : null,
      railX: (() => { const t = getComputedStyle(document.getElementById("svcRail")).transform; return t === "none" ? 0 : Math.round(parseFloat(t.split(",")[4] || "0")); })(),
      num: document.getElementById("svcNum").textContent
    };
  });

  /* On tente reellement de faire defiler la piste au clavier et a la
     main, et on regarde si quelque chose bouge. */
  const tentative = await page.evaluate(async () => {
    const piste = document.getElementById("svcPiste");
    const avant = piste.scrollLeft;
    piste.scrollLeft = 800;
    await new Promise((r) => requestAnimationFrame(r));
    const apres = piste.scrollLeft;
    piste.scrollLeft = avant;
    const yAvant = Math.round(scrollY);
    window.scrollBy(0, 200);
    await new Promise((r) => requestAnimationFrame(r));
    const y1 = Math.round(scrollY);
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    const y2 = Math.round(scrollY);
    return { pisteAvant: avant, pisteForceeA800: apres, pisteBouge: apres > avant + 4, yAvant, yApres1image: y1, yApres3images: y2, pageBouge: y2 > yAvant + 4 };
  });

  out.push({ cas, ...etat, tentative });
}

console.log(JSON.stringify({ adresse: BASE, largeur: LARGEUR, releves: out }, null, 2));
await ctx.close();
await nav.close();
