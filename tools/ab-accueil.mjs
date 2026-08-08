/* ============================================================
   A/B DE L'ACCUEIL — AVANT (port 8098) CONTRE APRES (port 8099)

   LES DEUX REGLES DE MESURE DU PROJET, TENUES ICI :

   1. NE JAMAIS COMPARER DEUX MEDIANES CALCULEES SUR UNE SERIE QUI
      DERIVE. La machine derive d'un facteur six entre la premiere
      passe et la neuvieme — releve du 2026-07-26, code inchange.
      On mesure donc les deux versions DANS LA MEME PASSE, en
      alternant l'ordre a chaque tour pour que la derive ne se
      colle pas toujours a la meme, et on prend la mediane des
      DIFFERENCES. La derive s'annule d'elle-meme.

   2. NE JAMAIS CONCLURE SUR UN MAXIMUM. « La pire tache » est la
      statistique la plus instable qui soit. On rend le TOTAL et le
      NOMBRE, qui s'additionnent au lieu de se remplacer.

   Usage : node tools/serve.mjs 8099
           git worktree add ../_adexweb-avant HEAD --detach
           node tools/serve.mjs 8098   (depuis ../_adexweb-avant)
           node tools/ab-accueil.mjs [passes]
   ============================================================ */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const AVANT = "http://localhost:8098";
const APRES = "http://localhost:8099";
const PASSES = Number(process.argv[2] || 7);
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const med = (a) => { const t = a.slice().sort((x, y) => x - y); return t.length % 2 ? t[(t.length - 1) / 2] : (t[t.length / 2 - 1] + t[t.length / 2]) / 2; };

async function mesurer(nav, base) {
  const page = await nav.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "light", deviceScaleFactor: 1 });
  await page.addInitScript(() => {
    try { sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {}
    window.__lcp = 0; window.__lcpEl = ""; window.__cls = 0; window.__long = [];
    new PerformanceObserver((l) => { const e = l.getEntries(); const d = e[e.length - 1]; window.__lcp = d.startTime; window.__lcpEl = d.element ? (d.element.tagName + "." + String(d.element.className).slice(0, 30)) : ""; }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long.push(e.duration); }).observe({ type: "longtask", buffered: true });
  });
  await page.goto(base + "/index.html", { waitUntil: "networkidle" });
  await attendre(3000);

  /* traversee de l'accueil, par pas de visiteur */
  const fps = await page.evaluate(async () => {
    const ecarts = []; let dernier = performance.now(); let stop = false;
    const boucle = (t) => { ecarts.push(t - dernier); dernier = t; if (!stop) requestAnimationFrame(boucle); };
    requestAnimationFrame(boucle);
    const bande = document.querySelector(".plaques") || document.querySelector(".spec");
    const fin = bande.getBoundingClientRect().bottom + window.scrollY + 400;
    for (let y = 0; y < fin; y += 36) { window.scrollTo(0, y); await new Promise((r) => requestAnimationFrame(r)); }
    stop = true;
    const t = ecarts.slice(6).sort((a, b) => a - b);
    const q = (p) => t[Math.min(t.length - 1, Math.floor(t.length * p))];
    return { images: t.length, mediane: +q(0.5).toFixed(2), c95: +q(0.95).toFixed(2), sup20: t.filter((x) => x > 20).length };
  });

  const w = await page.evaluate(() => ({
    lcp: Math.round(window.__lcp), lcpEl: window.__lcpEl, cls: +window.__cls.toFixed(4),
    /* TOTAL et NOMBRE, jamais le maximum. */
    tacheTotal: Math.round(window.__long.reduce((a, b) => a + b, 0)), tacheN: window.__long.length,
  }));
  await page.close();
  return { ...w, fps };
}

const nav = await chromium.launch();
const paires = [];
for (let i = 0; i < PASSES; i++) {
  /* ORDRE ALTERNE : sinon la derive de la machine se colle toujours
     a la meme version et on mesure l'ordre, pas le code. */
  const premier = i % 2 === 0 ? AVANT : APRES;
  const second = i % 2 === 0 ? APRES : AVANT;
  const a = await mesurer(nav, premier);
  const b = await mesurer(nav, second);
  const avant = premier === AVANT ? a : b;
  const apres = premier === AVANT ? b : a;
  paires.push({ passe: i, ordre: premier === AVANT ? "avant→apres" : "apres→avant", avant, apres });
  console.log(`passe ${i} (${paires[i].ordre})  LCP ${avant.lcp} → ${apres.lcp}  · CLS ${avant.cls} → ${apres.cls}  · i/s ${(1000 / avant.fps.mediane).toFixed(1)} → ${(1000 / apres.fps.mediane).toFixed(1)}  · tache totale ${avant.tacheTotal} → ${apres.tacheTotal} ms (${avant.tacheN} → ${apres.tacheN})`);
}
await nav.close();

const d = (f) => med(paires.map((p) => f(p.apres) - f(p.avant)));
const bilan = {
  passes: PASSES,
  lcp_delta_median_ms: d((x) => x.lcp),
  cls_delta_median: +d((x) => x.cls).toFixed(4),
  image_delta_median_ms: +d((x) => x.fps.mediane).toFixed(2),
  images_sup20_delta_median: d((x) => x.fps.sup20),
  tache_totale_delta_median_ms: d((x) => x.tacheTotal),
  tache_nombre_delta_median: d((x) => x.tacheN),
  lcp_avant: paires.map((p) => p.avant.lcp), lcp_apres: paires.map((p) => p.apres.lcp),
  lcpEl_avant: [...new Set(paires.map((p) => p.avant.lcpEl))],
  lcpEl_apres: [...new Set(paires.map((p) => p.apres.lcpEl))],
};
console.log("\n=== MEDIANE DES DIFFERENCES (apres - avant), signe negatif = mieux ===");
console.log(JSON.stringify(bilan, null, 1));
mkdirSync(join(process.cwd(), "refonte-captures", "accueil"), { recursive: true });
writeFileSync(join(process.cwd(), "refonte-captures", "accueil", "ab.json"), JSON.stringify({ bilan, paires }, null, 2));
