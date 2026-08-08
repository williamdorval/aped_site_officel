/* ============================================================
   LA CASCADE — captures sequencees, 230 ms contre 520 ms.

   COMMENT COMPARER HONNETEMENT DEUX DUREES.
   Une capture Playwright coute plus de 200 ms ; la cascade courte
   en dure 230. A vitesse reelle, on ne photographie donc jamais
   son milieu. On ETIRE l'horloge d'un facteur 8 — les deux
   variantes du MEME facteur — et on echantillonne aux MEMES
   instants absolus.

   C'est ce qui rend la comparaison juste. Etirer puis
   echantillonner « au quart, a la moitie, aux trois quarts » de
   chaque variante donnerait deux series identiques : la geometrie
   est la meme, c'est le TEMPS qui change. En echantillonnant aux
   memes instants, on voit exactement ce que voit l'oeil : a
   l'instant ou la variante courte a fini, la longue en est a un
   peu moins de la moitie.

   Sortie : refonte-captures/cascade/
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";

const OUT = "refonte-captures/cascade";
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const B = process.argv[2] || "http://localhost:8099";
const F = 8;
/* Huit instants, en millisecondes d'horloge etiree. 1840 ms est la
   fin exacte de la variante courte (230 x 8). */
const INSTANTS = [0, 230, 460, 690, 920, 1380, 1840, 2760];

const nav = await chromium.launch();

for (const cran of [230, 520]) {
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { sessionStorage.setItem("adexweb-entree-saut", "1"); sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {} });
  await page.goto(B + "/", { waitUntil: "load" });
  await page.mouse.move(5, 5);
  await page.waitForTimeout(2200);

  const sel = ".nav-cta";
  const el = await page.$(sel);
  const box = await el.boundingBox();

  /* Un survol d'amorce pour que le decoupage soit fait et `--p`
     mesure, puis on repart de zero. */
  await el.hover({ force: true });
  await page.waitForTimeout(400);
  await page.mouse.move(5, 5);
  await page.waitForTimeout(600);

  await page.evaluate(([s, v, f]) => {
    document.querySelector(s).style.setProperty("--cran", v * f + "ms");
    const st = document.createElement("style");
    /* La fleche est retiree des captures : elle sort du cadre, donc
       elle raconte autre chose que la cascade. */
    st.textContent = ".btn:hover .icon, .btn:focus-visible .icon { animation: none !important; }";
    document.head.appendChild(st);
  }, [sel, cran, F]);

  const marge = 10;
  const clip = {
    x: Math.max(0, box.x - marge), y: Math.max(0, box.y - marge),
    width: box.width + marge * 2, height: box.height + marge * 2
  };

  await el.hover({ force: true });
  const t0 = Date.now();
  for (let i = 0; i < INSTANTS.length; i++) {
    const cible = INSTANTS[i];
    while (Date.now() - t0 < cible) { /* attente active courte */ }
    const reel = Math.round((Date.now() - t0) / F);
    await page.screenshot({
      path: `${OUT}/${cran}ms-${String(i + 1).padStart(2, "0")}-a-${String(reel).padStart(4, "0")}ms.png`,
      clip
    });
  }
  await ctx.close();
  console.log(`${cran} ms : ${INSTANTS.length} captures`);
}

await nav.close();
console.log(`\n${fs.readdirSync(OUT).length} captures dans ${OUT}`);
console.log("Les noms portent l'instant EN TEMPS REEL, horloge desetiree.");
