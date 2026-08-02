/* ============================================================
   SONDE 3 — fullstack-studio : la revelation A L'ARRIVEE.
   La sonde 2 a trouve la STRUCTURE :
     .text-highlight_line > .text-highlight_text
        > .text-highlight_inner  (le texte)
        > .text-highlight_inner  (le calque)
        > .text-highlight_rect   (position: absolute) ← le masque
   Ce n'est donc pas un fondu, c'est un RECTANGLE qui decouvre.
   Reste a chiffrer : duree, decalage entre lignes, courbe, sens.
   On recharge et on releve a 60 Hz des le premier rendu.
   ============================================================ */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const d = join(process.cwd(), "tools", "_refs", "accueil", "1-fullstack-studio");
mkdirSync(d, { recursive: true });
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const nb = (n) => String(n).padStart(2, "0");

function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const fx = (t) => ((ax * t + bx) * t + cx) * t, dfx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => { let t = x; for (let i = 0; i < 8; i++) { const e = fx(t) - x; if (Math.abs(e) < 1e-6) break; const dd = dfx(t); if (Math.abs(dd) < 1e-6) break; t -= e / dd; } t = Math.max(0, Math.min(1, t)); return ((ay * t + by) * t + cy) * t; };
}
const CAT = { linear: bezier(0, 0, 1, 1), "ease-out": bezier(0, 0, 0.58, 1), "ease-in-out": bezier(0.42, 0, 0.58, 1), "power2.out": bezier(0.165, 0.84, 0.44, 1), "power3.out": bezier(0.215, 0.61, 0.355, 1), "power4.out": bezier(0.165, 0.84, 0.44, 1), "expo.out": bezier(0.16, 1, 0.3, 1), "quint.out": bezier(0.22, 1, 0.36, 1), "spring mou": bezier(0.6, 1.5, 0.5, 1) };
const identifier = (p) => p.length < 5 ? null : Object.entries(CAT).map(([n, f]) => { let s = 0; for (const q of p) { const dd = f(q.x) - q.y; s += dd * dd; } return { n, e: +Math.sqrt(s / p.length).toFixed(4) }; }).sort((a, b) => a.e - b.e).slice(0, 3).map((x) => `${x.n} (${x.e})`);

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 1440, height: 900 } });

/* on injecte AVANT tout script de la page : la sonde demarre au
   premier rendu, sinon on photographie la fin du mouvement */
await page.addInitScript(() => {
  window.__ech = [];
  const demarrer = () => {
    const t0 = performance.now();
    const tic = () => {
      const lignes = [...document.querySelectorAll(".text-highlight_line")].slice(0, 6);
      if (lignes.length) {
        window.__ech.push({
          t: +(performance.now() - t0).toFixed(1),
          l: lignes.map((l) => {
            const texte = l.querySelector(".text-highlight_inner");
            const rect = l.querySelector(".text-highlight_rect");
            const csl = getComputedStyle(l);
            const cst = texte ? getComputedStyle(texte) : null;
            const csr = rect ? getComputedStyle(rect) : null;
            const rr = rect ? rect.getBoundingClientRect() : null;
            const rl = l.getBoundingClientRect();
            return {
              lo: +csl.opacity, ltf: csl.transform, lcp: csl.clipPath,
              to: cst ? +cst.opacity : null, ttf: cst ? cst.transform : null, tcp: cst ? cst.clipPath : null,
              ro: csr ? +csr.opacity : null, rtf: csr ? csr.transform : null,
              rw: rr ? +rr.width.toFixed(1) : null, rx: rr ? +(rr.left - rl.left).toFixed(1) : null,
              rbg: csr ? csr.backgroundColor : null,
            };
          }),
        });
      }
      if (window.__ech.length < 220) requestAnimationFrame(tic);
    };
    tic();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer);
  else demarrer();
});

await page.goto("https://fullstack-studio.webflow.io/", { waitUntil: "domcontentloaded", timeout: 60000 });
await attendre(6000);
const ech = await page.evaluate(() => window.__ech);
console.log("echantillons :", ech.length, "· lignes suivies :", ech.length ? ech[0].l.length : 0);

const analyse = [];
if (ech.length) {
  for (let n = 0; n < ech[0].l.length; n++) {
    const lo = ech.map((s) => s.l[n].lo), to = ech.map((s) => s.l[n].to);
    const rw = ech.map((s) => s.l[n].rw), rx = ech.map((s) => s.l[n].rx);
    const ty = ech.map((s) => { const m = String(s.l[n].ttf).match(/matrix\(([^)]+)\)/); return m ? Number(m[1].split(",")[5]) : 0; });
    const bouge = (a) => Math.max(...a.filter(Number.isFinite)) - Math.min(...a.filter(Number.isFinite));
    const dTo = bouge(to), dRw = bouge(rw), dRx = bouge(rx), dTy = bouge(ty);
    if (dTo < 0.05 && dRw < 2 && dRx < 2 && dTy < 2) { analyse.push({ ligne: n, immobile: true }); continue; }
    const suivi = dTo > 0.05 ? to : (dRw > 2 ? rw : (dRx > 2 ? rx : ty));
    let i0 = 0; while (i0 < suivi.length - 1 && Math.abs(suivi[i0 + 1] - suivi[i0]) < 0.002 * (bouge(suivi) || 1)) i0++;
    let i1 = suivi.length - 1; while (i1 > 0 && Math.abs(suivi[i1] - suivi[i1 - 1]) < 0.002 * (bouge(suivi) || 1)) i1--;
    const seg = ech.slice(i0, i1 + 1);
    if (seg.length < 4) { analyse.push({ ligne: n, trop_court: true }); continue; }
    const t0 = seg[0].t, t1 = seg[seg.length - 1].t;
    const v0 = suivi[i0], v1 = suivi[i1];
    const pts = seg.map((s, k) => ({ x: (s.t - t0) / (t1 - t0 || 1), y: (suivi[i0 + k] - v0) / ((v1 - v0) || 1) }));
    let over = 0; const sens = Math.sign(v1 - v0); for (let k = i0; k <= i1; k++) { const dd = (suivi[k] - v1) * sens; if (dd > over) over = dd; }
    analyse.push({
      ligne: n, debut_ms: +t0.toFixed(1), fin_ms: +t1.toFixed(1), duree_ms: +(t1 - t0).toFixed(1),
      opaciteTexte: `${to[i0]} → ${to[i1]}`, largeurRect_px: `${rw[i0]} → ${rw[i1]}`, decalageRect_px: `${rx[i0]} → ${rx[i1]}`,
      translationY_px: +dTy.toFixed(1), depassement: +over.toFixed(2),
      fondRect: ech[i0].l[n].rbg, clipTexte: ech[i0].l[n].tcp,
      courbe: identifier(pts),
    });
  }
}
console.log("\n--- revelation ligne par ligne, a l'arrivee ---");
analyse.forEach((a) => console.log("  ", JSON.stringify(a)));
const deb = analyse.filter((a) => a.debut_ms != null).map((a) => a.debut_ms);
console.log("\n  decalage entre lignes (ms) :", deb.slice(1).map((v, i) => +(v - deb[i]).toFixed(1)));

/* film de l'arrivee */
const sd = join(d, "film-arrivee"); mkdirSync(sd, { recursive: true });
const p2 = await nav.newPage({ viewport: { width: 1440, height: 900 } });
p2.goto("https://fullstack-studio.webflow.io/", { waitUntil: "commit" }).catch(() => {});
for (let k = 0; k < 16; k++) { await p2.screenshot({ path: join(sd, `img-${nb(k)}.png`) }).catch(() => {}); await attendre(110); }

writeFileSync(join(d, "revelation3.json"), JSON.stringify({ analyse, ech: ech.slice(0, 120) }, null, 2));
await nav.close();
console.log("\nrevelation3.json + film-arrivee/ ecrits");
