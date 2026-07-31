/* ============================================================
   SONDE CIBLEE — fullstack-studio.webflow.io
   La passe large a rendu 0 mouvement de texte : elle sondait le
   haut de page, ou rien n'attendait. On procede autrement.

   1. On repere TOUS les blocs de texte de la page et on note leur
      etat AVANT d'etre atteints (opacite, transform, clip).
   2. On approche chaque bloc par pas de visiteur et on releve a
      60 Hz jusqu'a stabilisation.
   3. On rend duree, decalage entre voisins, depassement, courbe.

   Usage : node tools/refs-reveal.mjs
   ============================================================ */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const d = join(process.cwd(), "tools", "_refs", "accueil", "1-fullstack-studio");
mkdirSync(d, { recursive: true });
const nb = (n) => String(n).padStart(2, "0");
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const fx = (t) => ((ax * t + bx) * t + cx) * t, dfx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => { let t = x; for (let i = 0; i < 8; i++) { const e = fx(t) - x; if (Math.abs(e) < 1e-6) break; const dd = dfx(t); if (Math.abs(dd) < 1e-6) break; t -= e / dd; } t = Math.max(0, Math.min(1, t)); return ((ay * t + by) * t + cy) * t; };
}
const CAT = { linear: bezier(0, 0, 1, 1), "ease-out": bezier(0, 0, 0.58, 1), "ease-in-out": bezier(0.42, 0, 0.58, 1), "power2.out": bezier(0.165, 0.84, 0.44, 1), "power3.out": bezier(0.215, 0.61, 0.355, 1), "expo.out": bezier(0.16, 1, 0.3, 1), "quint.out": bezier(0.22, 1, 0.36, 1), "spring mou": bezier(0.6, 1.5, 0.5, 1) };
const identifier = (p) => p.length < 5 ? null : Object.entries(CAT).map(([n, f]) => { let s = 0; for (const q of p) { const dd = f(q.x) - q.y; s += dd * dd; } return { n, e: +Math.sqrt(s / p.length).toFixed(4) }; }).sort((a, b) => a.e - b.e).slice(0, 3);

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://fullstack-studio.webflow.io/", { waitUntil: "networkidle", timeout: 60000 });
await attendre(3000);

/* --- 1. inventaire de l'etat AVANT --- */
const inventaire = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll("h1,h2,h3,h4,p,span,[class*='head'],[class*='title'],[class*='text']").forEach((el, i) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const t = (el.textContent || "").trim();
    if (!t || t.length < 3 || r.height < 8) return;
    const cache = +cs.opacity < 0.99 || (cs.transform !== "none" && !/matrix\(1, 0, 0, 1, 0, 0\)/.test(cs.transform)) || (cs.clipPath && cs.clipPath !== "none");
    if (!cache) return;
    el.setAttribute("data-sonde", String(out.length));
    out.push({ i: out.length, tag: el.tagName, cls: String(el.className).slice(0, 46), texte: t.slice(0, 34), docY: Math.round(r.top + window.scrollY), o: +cs.opacity, tf: cs.transform, clip: cs.clipPath, mask: cs.maskImage ? cs.maskImage.slice(0, 40) : "" });
  });
  return out;
});
console.log("blocs de texte encore caches :", inventaire.length);
console.log(JSON.stringify(inventaire.slice(0, 14), null, 1));

/* --- 2. approche d'un groupe, releve a 60 Hz --- */
const groupes = [];
const vus = new Set();
for (const b of inventaire) {
  const cle = Math.round(b.docY / 400);
  if (vus.has(cle) || groupes.length >= 4) continue;
  vus.add(cle);
  groupes.push(b);
}

const resultats = [];
for (let g = 0; g < groupes.length; g++) {
  const cible = groupes[g];
  const depart = Math.max(0, cible.docY - 1250);
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), depart);
  await attendre(1400);

  const releve = await page.evaluate(async (docY) => {
    const els = [...document.querySelectorAll("[data-sonde]")].filter((e) => {
      const y = e.getBoundingClientRect().top + window.scrollY;
      return Math.abs(y - docY) < 460;
    }).slice(0, 12);
    if (!els.length) return null;
    const lire = () => els.map((e) => { const cs = getComputedStyle(e); return { o: +cs.opacity, tf: cs.transform, cp: cs.clipPath, y: Math.round(e.getBoundingClientRect().top) }; });
    const ech = []; const t0 = performance.now();
    /* approche comme un visiteur : 26 px par image pendant 30 images,
       puis on laisse finir sans plus toucher au defilement */
    for (let k = 0; k < 30; k++) { window.scrollBy(0, 26); await new Promise((r) => requestAnimationFrame(r)); ech.push({ t: +(performance.now() - t0).toFixed(1), s: +window.scrollY, e: lire() }); }
    for (let k = 0; k < 80; k++) { await new Promise((r) => requestAnimationFrame(r)); ech.push({ t: +(performance.now() - t0).toFixed(1), s: +window.scrollY, e: lire() }); }
    return { infos: els.map((e) => ({ tag: e.tagName, cls: String(e.className).slice(0, 44), txt: (e.textContent || "").trim().slice(0, 34) })), ech };
  }, cible.docY);

  if (!releve) continue;
  const analyse = [];
  for (let n = 0; n < releve.infos.length; n++) {
    const ops = releve.ech.map((s) => s.e[n].o);
    const ty = releve.ech.map((s) => { const m = String(s.e[n].tf).match(/matrix\(([^)]+)\)/); return m ? Number(m[1].split(",")[5]) : 0; });
    const clips = releve.ech.map((s) => s.e[n].cp);
    const dop = Math.max(...ops) - Math.min(...ops), dty = Math.max(...ty) - Math.min(...ty), nclip = new Set(clips).size;
    if (dop < 0.05 && dty < 2 && nclip < 2) continue;
    const i0 = ops.findIndex((v, k) => k > 0 && Math.abs(v - ops[0]) > 0.02);
    let i1 = ops.length - 1; while (i1 > 0 && Math.abs(ops[i1] - ops[i1 - 1]) < 0.004 && Math.abs(ty[i1] - ty[i1 - 1]) < 0.3) i1--;
    const seg = releve.ech.slice(Math.max(0, i0 < 0 ? 0 : i0), i1 + 1);
    if (seg.length < 5) continue;
    const t0 = seg[0].t, t1 = seg[seg.length - 1].t;
    const oDeb = seg[0].e[n].o, oFin = seg[seg.length - 1].e[n].o;
    const pts = seg.map((s) => ({ x: (s.t - t0) / (t1 - t0 || 1), y: (s.e[n].o - oDeb) / ((oFin - oDeb) || 1) }));
    const yFin = ty[ty.length - 1];
    let over = 0; const sens = Math.sign(yFin - ty[0]); for (const v of ty) { const dd = (v - yFin) * sens; if (dd > over) over = dd; }
    analyse.push({ ...releve.infos[n], debut_ms: +t0.toFixed(1), duree_ms: +(t1 - t0).toFixed(1), opacite: `${oDeb.toFixed(2)} → ${oFin.toFixed(2)}`, translationY_px: +dty.toFixed(1), depassement_px: +over.toFixed(2), clips: [...new Set(clips)].slice(0, 3), courbe: identifier(pts) });
  }
  /* decalage entre voisins */
  const debuts = analyse.map((a) => a.debut_ms).sort((a, b) => a - b);
  const ecarts = debuts.slice(1).map((v, i) => +(v - debuts[i]).toFixed(1));
  resultats.push({ groupe: g, ancre: cible.texte, elements: analyse, decalages_ms: ecarts });
  console.log(`\n--- groupe ${g} « ${cible.texte} » ---`);
  analyse.forEach((a) => console.log("  ", JSON.stringify(a)));
  console.log("   decalages entre voisins (ms) :", ecarts);

  /* film : 12 images de 40 ms pendant la revelation */
  const sd = join(d, `film-groupe-${nb(g)}`); mkdirSync(sd, { recursive: true });
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), depart);
  await attendre(1300);
  for (let k = 0; k < 12; k++) {
    if (k === 1) await page.evaluate(() => window.scrollBy(0, 780));
    await page.screenshot({ path: join(sd, `img-${nb(k)}.png`) });
    await attendre(38);
  }
}

writeFileSync(join(d, "revelation.json"), JSON.stringify({ inventaire, resultats }, null, 2));
await nav.close();
console.log("\nrevelation.json + films dans", d);
