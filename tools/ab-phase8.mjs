/* ============================================================
   A/B — la seule mesure de regression qui veut dire quelque chose.

   Les chiffres d'une phase anterieure ne sont PAS une reference :
   la phase 6 annoncait 112 ms de LCP, le meme code mesure en
   phase 7 sur cette machine en donnait 196. On sert donc les deux
   versions en meme temps, sur la meme machine, dans la meme
   minute, et on alterne les passes pour que la derive thermique
   frappe les deux versions de la meme facon.

   Rend, pour chaque version : LCP median, pire tache longue au
   chargement, CLS, frequence d'images pendant une traversee
   complete, pire tache longue pendant cette traversee.

   Usage : node tools/ab-phase8.mjs [passes]
           avec 8097 = avant, 8099 = apres.
   ============================================================ */
import { chromium } from "playwright";

const PASSES = Number(process.argv[2] || 5);
const VERSIONS = [
  ["avant", "http://localhost:8097"],
  ["apres", "http://localhost:8099"]
];

const nav = await chromium.launch();
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

const res = {};
for (const [nom] of VERSIONS) res[nom] = { lcp: [], tache: [], cls: [], fps: [], tacheScroll: [] };

for (let p = 0; p < PASSES; p++) {
  /* On alterne l'ordre a chaque passe : si la machine chauffe, elle
     chauffe pour les deux, et pas toujours pour la seconde. */
  const ordre = p % 2 ? [...VERSIONS].reverse() : VERSIONS;

  for (const [nom, base] of ordre) {
    const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {}
      window.__m = { lcp: 0, cls: 0, longues: [], f: 0 };
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; })
        .observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.longues.push(Math.round(e.duration)); })
        .observe({ type: "longtask", buffered: true });
      const tic = () => { window.__m.f++; requestAnimationFrame(tic); };
      requestAnimationFrame(tic);
    });

    await page.goto(base + "/", { waitUntil: "load" });
    await page.mouse.move(700, 400);
    await page.waitForTimeout(2400);

    const auChargement = await page.evaluate(() => ({
      lcp: Math.round(window.__m.lcp),
      cls: window.__m.cls,
      pire: Math.max(0, ...window.__m.longues)
    }));
    res[nom].lcp.push(auChargement.lcp);
    res[nom].tache.push(auChargement.pire);

    /* Traversee complete, meme cadence pour les deux. */
    await page.evaluate(() => { window.__m.f = 0; window.__m.longues.length = 0; });
    const t0 = Date.now();
    const h = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const pas = Math.max(1, Math.round(h / 60));
    for (let y = 0; y <= h; y += pas) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(28);
    }
    const duree = Date.now() - t0;
    const fin = await page.evaluate(() => ({
      f: window.__m.f, cls: window.__m.cls, longues: window.__m.longues
    }));
    res[nom].fps.push(Math.round((fin.f / duree) * 1000));
    res[nom].cls.push(Number(fin.cls.toFixed(4)));
    res[nom].tacheScroll.push(Math.max(0, ...fin.longues));

    await ctx.close();
  }
}

await nav.close();

const col = (n) => String(n).padEnd(10);
console.log("");
console.log("                        " + VERSIONS.map(([n]) => col(n)).join(""));
const lignes = [
  ["LCP median (ms)", "lcp"],
  ["pire tache chargement", "tache"],
  ["CLS total", "cls"],
  ["images/s traversee", "fps"],
  ["pire tache traversee", "tacheScroll"]
];
for (const [label, cle] of lignes) {
  console.log(label.padEnd(24) + VERSIONS.map(([n]) => col(med(res[n][cle]))).join(""));
}
console.log("");
for (const [n] of VERSIONS) {
  console.log(`${n}  LCP ${res[n].lcp.join(", ")}  |  taches chargement ${res[n].tache.join(", ")}  |  i/s ${res[n].fps.join(", ")}`);
}
console.log("");
