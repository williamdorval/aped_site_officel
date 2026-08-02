/* ============================================================
   REFERENCE 2 — l'ALLER, propre.

   PIEGE : toute la composition suit le curseur avec ~45 px
   d'amplitude. En posant la souris au coin puis en la jetant sur
   la pastille relevee AU REPOS, la pastille a deja glisse ailleurs
   quand la souris arrive : le survol ne prend pas. C'est pour ca
   que l'aller rendait « 1 nuance » et le retour 14.
   Correctif : on approche depuis un point PROCHE (60 px sous la
   pastille), on laisse la parallaxe se poser, on relit la boite,
   puis on entre. Et on releve la couleur image par image.
   Usage : node tools/refs-toggle4.mjs
   ============================================================ */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const D = join(process.cwd(), "tools", "_refs", "toggle");
mkdirSync(D, { recursive: true });
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const SEL = ".framer-1hk06nd";
const rgb = (s) => { const m = String(s).match(/(\d+(?:\.\d+)?)/g); return m ? m.slice(0, 3).map(Number) : null; };

function bez(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const fx = (t) => ((ax * t + bx) * t + cx) * t, dfx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => { let t = x; for (let i = 0; i < 10; i++) { const e = fx(t) - x; if (Math.abs(e) < 1e-6) break; const d = dfx(t); if (Math.abs(d) < 1e-6) break; t -= e / d; } t = Math.max(0, Math.min(1, t)); return ((ay * t + by) * t + cy) * t; };
}
const CAT = {
  "linear": bez(0, 0, 1, 1), "ease": bez(0.25, 0.1, 0.25, 1), "ease-out": bez(0, 0, 0.58, 1),
  "ease-in": bez(0.42, 0, 1, 1), "ease-in-out": bez(0.42, 0, 0.58, 1),
  "power2.out": bez(0.165, 0.84, 0.44, 1), "power2.inOut": bez(0.455, 0.03, 0.515, 0.955),
  "power3.inOut": bez(0.645, 0.045, 0.355, 1), "expo.out": bez(0.16, 1, 0.3, 1),
  "M3 standard": bez(0.2, 0, 0, 1), "M3 emph. decelerate": bez(0.05, 0.7, 0.1, 1),
  "Carbon std productive": bez(0.2, 0, 0.38, 0.9), "Carbon std expressive": bez(0.4, 0.14, 0.3, 1),
};
const fit = (pts) => pts.length < 5 ? null : Object.entries(CAT).map(([n, f]) => { let s = 0; for (const p of pts) { const d = f(p.x) - p.y; s += d * d; } return { n, e: +Math.sqrt(s / pts.length).toFixed(4) }; }).sort((a, b) => a.e - b.e).slice(0, 3).map((x) => `${x.n} (${x.e})`);

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("https://fancy-toggle-753251.framer.app/", { waitUntil: "networkidle", timeout: 90000 });
await attendre(3000);

await page.evaluate((sel) => {
  window.__c = document.querySelector(sel);
  window.__film = (n) => {
    const p = window.__c.querySelector("p");
    window.__e = []; const t0 = performance.now();
    const tic = () => {
      const cs = getComputedStyle(window.__c), cp = getComputedStyle(p), r = window.__c.getBoundingClientRect();
      window.__e.push({ t: +(performance.now() - t0).toFixed(2), cls: window.__c.className.includes("hover") ? "hover" : "repos", bg: cs.backgroundColor, col: cp.color, x: +r.left.toFixed(2), y: +r.top.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2), tf: cs.transform, tr: cs.translate, sc: cs.scale, o: +cs.opacity, rad: cs.borderRadius });
      if (window.__e.length < n) requestAnimationFrame(tic);
    };
    tic();
  };
}, SEL);

async function passe(nom, entrer) {
  /* on se pose PRES de la pastille pour que la parallaxe soit deja
     a peu pres a sa position finale, puis on relit la boite */
  const b0 = await page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; }, SEL);
  const proche = { x: b0.cx, y: b0.cy + 70 };
  if (entrer) { await page.mouse.move(proche.x, proche.y, { steps: 6 }); await attendre(1600); }
  else { await page.mouse.move(b0.cx, b0.cy, { steps: 6 }); await attendre(900); const b1 = await page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; }, SEL); await page.mouse.move(b1.cx, b1.cy); await attendre(1200); }
  const b = await page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; }, SEL);
  await page.evaluate(() => window.__film(110));
  if (entrer) await page.mouse.move(b.cx, b.cy, { steps: 2 });
  else await page.mouse.move(b.cx, b.cy + 90, { steps: 2 });
  await attendre(2000);
  const e = await page.evaluate(() => window.__e);

  const bgs = e.map((z) => z.bg), cols = e.map((z) => z.col);
  let a = 0; while (a < bgs.length - 1 && bgs[a + 1] === bgs[a]) a++;
  let z = bgs.length - 1; while (z > 0 && bgs[z] === bgs[z - 1]) z--;
  const c0 = rgb(bgs[a]), c1 = rgb(bgs[z]);
  const dist = c0 && c1 ? Math.hypot(c1[0] - c0[0], c1[1] - c0[1], c1[2] - c0[2]) : 0;
  const seg = e.slice(a, z + 1);
  const prog = dist ? seg.map((s) => { const c = rgb(s.bg); return +(Math.hypot(c[0] - c0[0], c[1] - c0[1], c[2] - c0[2]) / dist).toFixed(4); }) : [];
  const T = seg.length > 1 ? seg[seg.length - 1].t - seg[0].t : 1;
  const pts = seg.map((s, k) => ({ x: (s.t - seg[0].t) / T, y: prog[k] }));
  const iCls = e.findIndex((s) => s.cls !== e[0].cls);
  const amp = (arr) => Math.max(...arr) - Math.min(...arr);

  console.log(`\n════════ ${nom} ════════`);
  console.log(`  classe : ${e[0].cls} → ${e[e.length - 1].cls}${iCls > 0 ? ` (bascule a ${e[iCls].t} ms)` : ""}`);
  console.log(`  FOND        ${bgs[a]}  →  ${bgs[z]}`);
  console.log(`  TEXTE       ${cols[0]}  →  ${cols[cols.length - 1]}`);
  console.log(`  DUREE       ${seg[0].t} → ${seg[seg.length - 1].t} ms = ${T.toFixed(1)} ms`);
  console.log(`  IMAGES      ${seg.length} images a 60 Hz · ${new Set(bgs).size} nuances distinctes`);
  console.log(`  MATIERE     deplacement x=${amp(e.map((s) => s.x)).toFixed(2)} px · y=${amp(e.map((s) => s.y)).toFixed(2)} px · largeur=${amp(e.map((s) => s.w)).toFixed(2)} px · hauteur=${amp(e.map((s) => s.h)).toFixed(2)} px`);
  console.log(`              transform ${[...new Set(e.map((s) => s.tf))].join(" / ")} · scale ${[...new Set(e.map((s) => s.sc))].join(" / ")} · opacite ${[...new Set(e.map((s) => s.o))].join(" / ")} · radius ${[...new Set(e.map((s) => s.rad))].join(" / ")}`);
  console.log(`  COULEURS image par image :`);
  seg.forEach((s, k) => console.log(`     ${String(k).padStart(2)}  t=${String(s.t).padStart(7)} ms   ${s.bg.padEnd(22)} texte ${s.col.padEnd(20)} progression ${prog[k]}`));
  console.log(`  courbe la plus proche : ${JSON.stringify(fit(pts))}`);
  writeFileSync(join(D, `F-${nom}.json`), JSON.stringify({ seg, prog, T, courbe: fit(pts), e }, null, 2));
  return { T, n: seg.length, nuances: new Set(bgs).size, de: bgs[a], vers: bgs[z], texte: [cols[0], cols[cols.length - 1]] };
}

const A = await passe("ALLER-survol", true);
const R = await passe("RETOUR-sortie", false);

console.log("\n════════ RESUME ════════");
console.log(`  aller  : ${A.de} → ${A.vers} · ${A.T.toFixed(1)} ms · ${A.n} images · ${A.nuances} nuances`);
console.log(`  retour : ${R.de} → ${R.vers} · ${R.T.toFixed(1)} ms · ${R.n} images · ${R.nuances} nuances`);
console.log(`  rapport retour/aller : ${(R.T / A.T).toFixed(2)}`);

await nav.close();
