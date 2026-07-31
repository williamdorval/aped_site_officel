/* ============================================================
   REFERENCE 2 — la bascule, mesuree sur le BON objet.

   L'observateur de mutations a tranche : le seul controle de la
   page est la pastille « View insight »
   (.framer-doahd.framer-1hk06nd). Au survol elle prend la classe
   `hover`, et Framer Motion lui REECRIT sa couleur de fond image
   par image en style en ligne — la transition CSS est a 0 s, donc
   ce n'est pas le navigateur qui interpole, c'est du JavaScript.
   Reste a chiffrer : de quelle couleur a quelle couleur, en
   combien d'images, en combien de ms, aller et retour, et si quoi
   que ce soit se DEPLACE.

   On mesure aussi la parallaxe de curseur de la composition, qui
   est l'autre mouvement reel de la page.
   Usage : node tools/refs-toggle3.mjs
   ============================================================ */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const D = join(process.cwd(), "tools", "_refs", "toggle");
mkdirSync(D, { recursive: true });
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const nb = (n) => String(n).padStart(2, "0");
const SEL = ".framer-1hk06nd";

const rgb = (s) => { const m = String(s).match(/(\d+(?:\.\d+)?)/g); return m ? m.slice(0, 3).map(Number) : null; };
const lum = (c) => { const f = c.map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; };
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return +((x + 0.05) / (y + 0.05)).toFixed(2); };

function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const fx = (t) => ((ax * t + bx) * t + cx) * t, dfx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => { let t = x; for (let i = 0; i < 10; i++) { const e = fx(t) - x; if (Math.abs(e) < 1e-6) break; const d = dfx(t); if (Math.abs(d) < 1e-6) break; t -= e / d; } t = Math.max(0, Math.min(1, t)); return ((ay * t + by) * t + cy) * t; };
}
const CAT = {
  "linear": bezier(0, 0, 1, 1), "ease": bezier(0.25, 0.1, 0.25, 1), "ease-out": bezier(0, 0, 0.58, 1),
  "ease-in-out": bezier(0.42, 0, 0.58, 1), "power2.out": bezier(0.165, 0.84, 0.44, 1),
  "power3.out": bezier(0.215, 0.61, 0.355, 1), "expo.out": bezier(0.16, 1, 0.3, 1),
  "M3 standard": bezier(0.2, 0, 0, 1), "M3 decelerate": bezier(0, 0, 0, 1),
  "Carbon entrance": bezier(0, 0, 0.38, 0.9), "Framer easeOut": bezier(0, 0, 0.58, 1),
};
const courbe = (pts) => pts.length < 5 ? null : Object.entries(CAT).map(([n, f]) => { let s = 0; for (const p of pts) { const d = f(p.x) - p.y; s += d * d; } return `${n} (${Math.sqrt(s / pts.length).toFixed(4)})`; }).sort((a, b) => Number(a.match(/\(([\d.]+)\)/)[1]) - Number(b.match(/\(([\d.]+)\)/)[1])).slice(0, 3);

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("https://fancy-toggle-753251.framer.app/", { waitUntil: "networkidle", timeout: 90000 });
await attendre(3000);

/* ── la structure exacte de la pastille ── */
const struct = await page.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const dec = (n, p) => {
    const cs = getComputedStyle(n), r = n.getBoundingClientRect();
    return {
      prof: p, tag: n.tagName, cls: String(n.className).slice(0, 56), nom: n.getAttribute("data-framer-name") || "",
      txt: [...n.childNodes].filter((c) => c.nodeType === 3).map((c) => c.textContent.trim()).join("").slice(0, 24),
      box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
      bg: cs.backgroundColor, col: cs.color, radius: cs.borderRadius, bordure: `${cs.borderWidth} ${cs.borderStyle} ${cs.borderColor}`,
      ombre: cs.boxShadow, filtre: cs.filter, clip: cs.clipPath, overflow: cs.overflow,
      transition: `${cs.transitionProperty} | ${cs.transitionDuration} | ${cs.transitionTimingFunction}`,
      translate: cs.translate, transform: cs.transform, opacity: cs.opacity,
      police: `${cs.fontSize} / ${cs.lineHeight} ${cs.fontWeight}`,
    };
  };
  const out = [dec(el, 0)];
  const rec = (n, p) => { [...n.children].forEach((c) => { out.push(dec(c, p)); rec(c, p + 1); }); };
  rec(el, 1);
  out.push({ prof: -1, ...dec(el.parentElement, -1) });
  return { arbre: out, html: el.outerHTML.slice(0, 700) };
}, SEL);
console.log("═══ STRUCTURE de la pastille ═══");
console.log(struct.html);
struct.arbre.forEach((n) => console.log(`  [${n.prof}] ${n.tag}.${n.cls} « ${n.txt} » ${JSON.stringify(n.box)}`));
console.log("  couches :", struct.arbre.filter((n) => n.prof >= 0).length);
struct.arbre.filter((n) => n.prof >= 0).forEach((n) => console.log(`    prof ${n.prof} · bg ${n.bg} · col ${n.col} · radius ${n.radius} · ombre ${n.ombre} · transition ${n.transition}`));
writeFileSync(join(D, "structure.json"), JSON.stringify(struct, null, 2));

/* ── le releveur ── */
await page.evaluate((sel) => {
  window.__c = document.querySelector(sel);
  window.__film = (n) => {
    const noeuds = [window.__c, ...window.__c.querySelectorAll("*")];
    window.__e = []; const t0 = performance.now();
    const tic = () => {
      window.__e.push({
        t: +(performance.now() - t0).toFixed(2),
        cls: String(window.__c.className),
        v: noeuds.map((e) => {
          const cs = getComputedStyle(e), q = e.getBoundingClientRect();
          return { cls: String(e.className).slice(0, 30), txt: (e.textContent || "").trim().slice(0, 16), bg: cs.backgroundColor, col: cs.color, o: +cs.opacity, tf: cs.transform, tr: cs.translate, sc: cs.scale, w: +q.width.toFixed(2), h: +q.height.toFixed(2), x: +q.left.toFixed(2), y: +q.top.toFixed(2), bd: cs.borderColor, bw: cs.borderWidth, rad: cs.borderRadius, cp: cs.clipPath };
        }),
      });
      if (window.__e.length < n) requestAnimationFrame(tic);
    };
    tic();
  };
}, SEL);

const boite = await page.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, b: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] }; }, SEL);
console.log("\n  pastille au centre :", Math.round(boite.cx), Math.round(boite.cy), "· boite", JSON.stringify(boite.b));

async function scene(nom, avant, apres, images) {
  await avant(); await attendre(1000);
  await page.evaluate((n) => window.__film(n), images || 120);
  await apres(); await attendre(2400);
  const e = await page.evaluate(() => window.__e);
  const n = e[0].v.length, res = [];
  const amp = (a) => Math.max(...a) - Math.min(...a);
  for (let i = 0; i < n; i++) {
    const s = e.map((z) => z.v[i]);
    const bgs = s.map((v) => v.bg), cols = s.map((v) => v.col);
    const ys = s.map((v) => v.y), xs = s.map((v) => v.x), ws = s.map((v) => v.w), hs = s.map((v) => v.h), os = s.map((v) => v.o);
    const tfs = s.map((v) => v.tf), trs = s.map((v) => v.tr), scs = s.map((v) => v.sc);
    const uBg = [...new Set(bgs)], uCol = [...new Set(cols)];
    const dY = amp(ys), dX = amp(xs), dW = amp(ws), dH = amp(hs), dO = amp(os);
    if (uBg.length < 2 && uCol.length < 2 && dY < 0.4 && dX < 0.4 && dW < 0.4 && dH < 0.4 && dO < 0.02 && new Set(tfs).size < 2 && new Set(trs).size < 2 && new Set(scs).size < 2) continue;

    /* fenetre du changement de fond */
    let a0 = 0; while (a0 < bgs.length - 1 && bgs[a0 + 1] === bgs[a0]) a0++;
    let z0 = bgs.length - 1; while (z0 > 0 && bgs[z0] === bgs[z0 - 1]) z0--;
    const c0 = rgb(bgs[a0]), c1 = rgb(bgs[z0]);
    let pts = null, prog = null;
    if (c0 && c1 && uBg.length > 2) {
      const d = Math.hypot(c1[0] - c0[0], c1[1] - c0[1], c1[2] - c0[2]) || 1;
      prog = e.slice(a0, z0 + 1).map((z) => { const c = rgb(z.v[i].bg); return +(Math.hypot(c[0] - c0[0], c[1] - c0[1], c[2] - c0[2]) / d).toFixed(3); });
      const T = e[z0].t - e[a0].t || 1;
      pts = e.slice(a0, z0 + 1).map((z, k) => ({ x: (z.t - e[a0].t) / T, y: prog[k] }));
    }
    res.push({
      i, cls: s[0].cls, txt: s[0].txt,
      fond: uBg.length > 1 ? `${bgs[a0]} → ${bgs[z0]}` : bgs[0],
      nuances_de_fond: uBg.length,
      fond_debut_ms: e[a0].t, fond_fin_ms: e[z0].t, fond_duree_ms: +(e[z0].t - e[a0].t).toFixed(1), fond_images: z0 - a0 + 1,
      couleurTexte: uCol.length > 1 ? `${cols[0]} → ${cols[cols.length - 1]}` : cols[0], nuances_de_texte: uCol.length,
      deplacement_px: { y: +dY.toFixed(2), x: +dX.toFixed(2), largeur: +dW.toFixed(2), hauteur: +dH.toFixed(2) },
      transform_change: new Set(tfs).size > 1, translate_change: new Set(trs).size > 1, scale_change: new Set(scs).size > 1,
      opacite: dO > 0.02 ? `${os[0]} → ${os[os.length - 1]}` : `${os[0]} (fixe)`,
      bordure: [...new Set(s.map((v) => `${v.bw} ${v.bd}`))].slice(0, 3), radius: [...new Set(s.map((v) => v.rad))].slice(0, 2), clip: [...new Set(s.map((v) => v.cp))].slice(0, 2),
      progression: prog ? prog.filter((_, k) => k % 2 === 0) : null,
      courbe: pts ? courbe(pts) : null,
      contraste_texte_debut: (() => { const b = rgb(bgs[a0]), t = rgb(cols[0]); return b && t ? contraste(b, t) : null; })(),
      contraste_texte_fin: (() => { const b = rgb(bgs[z0]), t = rgb(cols[cols.length - 1]); return b && t ? contraste(b, t) : null; })(),
    });
  }
  const cls = [...new Set(e.map((z) => z.cls))];
  console.log(`\n  ════ ${nom} ════  (${e.length} images relevees a 60 Hz)`);
  console.log(`   classes traversees : ${JSON.stringify(cls)}`);
  const iCls = e.findIndex((z) => z.cls !== e[0].cls);
  if (iCls > 0) console.log(`   la classe bascule a ${e[iCls].t} ms`);
  res.forEach((r) => {
    console.log(`   · ${r.cls} « ${r.txt} »`);
    console.log(`       FOND    ${r.fond}`);
    console.log(`       ${r.nuances_de_fond} nuances · ${r.fond_debut_ms} → ${r.fond_fin_ms} ms = ${r.fond_duree_ms} ms sur ${r.fond_images} images`);
    console.log(`       TEXTE   ${r.couleurTexte} (${r.nuances_de_texte} nuance(s))`);
    console.log(`       MATIERE deplacement y=${r.deplacement_px.y} x=${r.deplacement_px.x} l=${r.deplacement_px.largeur} h=${r.deplacement_px.hauteur} px · transform change: ${r.transform_change} · scale: ${r.scale_change}`);
    console.log(`       opacite ${r.opacite} · bordure ${JSON.stringify(r.bordure)} · radius ${JSON.stringify(r.radius)} · clip ${JSON.stringify(r.clip)}`);
    console.log(`       contraste texte/fond : ${r.contraste_texte_debut} → ${r.contraste_texte_fin}`);
    if (r.progression) console.log(`       progression : ${JSON.stringify(r.progression)}`);
    if (r.courbe) console.log(`       courbe la plus proche : ${JSON.stringify(r.courbe)}`);
  });
  writeFileSync(join(D, `M-${nom}.json`), JSON.stringify({ res, classes: cls, e: e.slice(0, 120) }, null, 2));
  return res;
}

await scene("aller-survol", async () => page.mouse.move(4, 4), async () => page.mouse.move(boite.cx, boite.cy, { steps: 3 }));
await scene("retour-sortie", async () => page.mouse.move(boite.cx, boite.cy), async () => page.mouse.move(4, 4, { steps: 3 }));
await scene("appui-clic", async () => page.mouse.move(boite.cx, boite.cy), async () => { await page.mouse.down(); await attendre(220); await page.mouse.up(); }, 140);

/* ── la parallaxe de curseur : l'autre mouvement de la page ── */
const par = await page.evaluate(async () => {
  const carte = document.querySelector("[data-framer-name='Card 1']");
  const suiveur = carte ? carte.closest("div[style*='transform']") || carte.parentElement : null;
  if (!carte) return null;
  const lire = () => { const r = carte.getBoundingClientRect(); return { x: +r.left.toFixed(2), y: +r.top.toFixed(2) }; };
  const env = (x, y) => window.dispatchEvent(new MouseEvent("mousemove", { clientX: x, clientY: y, bubbles: true })) || document.dispatchEvent(new MouseEvent("mousemove", { clientX: x, clientY: y, bubbles: true }));
  const pts = [];
  env(20, 20); await new Promise((r) => setTimeout(r, 1400));
  const a = lire();
  env(1260, 780);
  const t0 = performance.now();
  for (let k = 0; k < 110; k++) { await new Promise((r) => requestAnimationFrame(r)); pts.push({ t: +(performance.now() - t0).toFixed(1), ...lire() }); }
  const b = lire();
  return { coin_a: a, coin_b: b, amplitudeX: +(b.x - a.x).toFixed(2), amplitudeY: +(b.y - a.y).toFixed(2), pts: pts.filter((_, i) => i % 3 === 0) };
});
if (par) {
  console.log("\n  ════ parallaxe de curseur (coin haut-gauche → coin bas-droit) ════");
  console.log(`   amplitude : x ${par.amplitudeX} px · y ${par.amplitudeY} px`);
  const d = par.pts.map((p) => +(Math.hypot(p.x - par.coin_a.x, p.y - par.coin_a.y)).toFixed(1));
  console.log(`   distance parcourue image par image : ${JSON.stringify(d.slice(0, 26))}`);
  const fin = d[d.length - 1] || 1;
  let i90 = d.findIndex((v) => v >= 0.9 * fin);
  console.log(`   90 % du trajet atteint a ${i90 >= 0 ? par.pts[i90].t : "?"} ms · depassement : ${(Math.max(...d) - fin).toFixed(2)} px`);
  writeFileSync(join(D, "parallaxe.json"), JSON.stringify(par, null, 2));
}

/* ── les images : 10 aller, 10 retour, serrees sur la pastille ── */
const clip = { x: Math.max(0, boite.b[0] - 24), y: Math.max(0, boite.b[1] - 24), width: boite.b[2] + 48, height: boite.b[3] + 48 };
for (const [dossier, aller] of [["sequence-aller", true], ["sequence-retour", false]]) {
  const SD = join(D, dossier); mkdirSync(SD, { recursive: true });
  await page.mouse.move(aller ? 4 : boite.cx, aller ? 4 : boite.cy); await attendre(1100);
  for (let k = 0; k < 10; k++) {
    if (k === 1) await page.mouse.move(aller ? boite.cx : 4, aller ? boite.cy : 4, { steps: 2 });
    await page.screenshot({ path: join(SD, `${aller ? "aller" : "retour"}-${nb(k)}.png`), clip }).catch(() => {});
    await attendre(30);
  }
  console.log(`  10 vues → ${SD}`);
}

await nav.close();
console.log("\n→ tools/_refs/toggle/ : structure.json, M-aller-survol.json, M-retour-sortie.json, M-appui-clic.json, parallaxe.json, sequence-*/");
