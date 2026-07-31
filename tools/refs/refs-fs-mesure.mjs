/* ============================================================
   REFERENCE 1 — fullstack-studio.webflow.io
   MESURE COMPLETE de la revelation de texte et de la derive.

   Le recon a etabli le moteur : GSAP 3.15.0 + ScrollTrigger +
   SplitText, aucun Lenis, aucun IX2. On a donc DEUX sources :
     A. la SOURCE — les vars des tweens, lues dans gsap lui-meme
        (duree, ease, stagger, amplitude declarees) ;
     B. le RENDU — les styles calcules a 60 Hz pendant que la
        page defile pour de vrai (roulette, pas scrollTo).
   Les deux doivent concorder. Si elles divergent, c'est le rendu
   qui fait foi : c'est ce que le visiteur voit.

   Usage : node tools/refs-fs-mesure.mjs
   ============================================================ */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const D = join(process.cwd(), "tools", "_refs", "fullstack");
mkdirSync(D, { recursive: true });
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const nb = (n) => String(n).padStart(2, "0");

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 1440, height: 900 } });

/* ── sonde installee avant tout script de la page ───────────── */
await page.addInitScript(() => {
  window.__rec = { ech: [], actif: false, cibles: [] };

  window.__armer = (sel) => {
    const h = document.querySelector(sel);
    if (!h) return 0;
    const lignes = [...h.querySelectorAll(".text-highlight_line")];
    window.__rec.cibles = lignes.map((l) => ({
      ligne: l,
      inner: l.querySelector(".text-highlight_inner"),
      rect: l.querySelector(".text-highlight_rect"),
      texte: l.querySelector(".text-highlight_text"),
    }));
    window.__rec.ech = [];
    return lignes.length;
  };

  window.__demarrer = () => {
    window.__rec.actif = true;
    const t0 = performance.now();
    const lire = () => {
      const c = window.__rec.cibles.map((c) => {
        const ci = getComputedStyle(c.inner), cr = getComputedStyle(c.rect);
        const rr = c.rect.getBoundingClientRect(), rl = c.ligne.getBoundingClientRect();
        const rt = c.texte.getBoundingClientRect();
        return {
          io: +ci.opacity, itf: ci.transform, icp: ci.clipPath, icol: ci.color,
          ro: +cr.opacity, rcp: cr.clipPath, rtf: cr.transform, rbg: cr.backgroundColor,
          /* largeur VISIBLE du rect = largeur de boite moins ce que l'inset rogne */
          rw: +rr.width.toFixed(2), rx: +(rr.left - rl.left).toFixed(2),
          ly: +rl.top.toFixed(2), ty: +rt.top.toFixed(2),
          ltf: getComputedStyle(c.ligne).transform,
        };
      });
      /* tweens gsap vivants qui visent nos cibles */
      let tw = [];
      try {
        const g = window.gsap;
        if (g) {
          const noeuds = new Set(window.__rec.cibles.flatMap((c) => [c.inner, c.rect, c.ligne, c.texte]));
          tw = g.globalTimeline.getChildren(true, true, true)
            .filter((t) => t.targets && t.targets().some((x) => noeuds.has(x)))
            .slice(0, 24)
            .map((t) => ({
              d: +t.duration().toFixed(4), p: +t.progress().toFixed(3),
              ease: t.vars && t.vars.ease ? String(t.vars.ease.name || t.vars.ease) : null,
              cls: t.targets()[0] ? String(t.targets()[0].className).slice(0, 26) : null,
              vars: t.vars ? JSON.stringify(Object.fromEntries(Object.entries(t.vars).filter(([k, v]) => typeof v !== "function" && k !== "data" && k !== "parent"))).slice(0, 260) : null,
              start: +t.startTime().toFixed(4),
            }));
        }
      } catch (e) { /* rien */ }
      return { t: +(performance.now() - t0).toFixed(1), s: +window.scrollY, c, tw };
    };
    const tic = () => {
      window.__rec.ech.push(lire());
      if (window.__rec.ech.length < 320 && window.__rec.actif) requestAnimationFrame(tic);
    };
    tic();
  };
});

await page.goto("https://fullstack-studio.webflow.io/", { waitUntil: "networkidle", timeout: 90000 });
await attendre(3000);

/* ══ A. LA SOURCE — tous les ScrollTriggers, animation comprise ══ */
/* on traverse d'abord toute la page pour que chaque trigger ait
   cree son animation, sinon .animation est nul (piege phase 9 §4.1) */
const H = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < H; y += 700) {
  await page.mouse.wheel(0, 700);
  await attendre(60);
}
await attendre(1200);

const source = await page.evaluate(() => {
  const st = window.ScrollTrigger;
  const propre = (v) => {
    if (v == null) return null;
    try { return JSON.parse(JSON.stringify(Object.fromEntries(Object.entries(v).filter(([k, x]) => typeof x !== "function" && typeof x !== "object" || x === null || Array.isArray(x))))); }
    catch (e) { return String(v).slice(0, 120); }
  };
  const dec = (t) => ({
    d: +t.duration().toFixed(4),
    delay: t.vars ? (t.vars.delay ?? 0) : 0,
    start: +t.startTime().toFixed(4),
    ease: t.vars && t.vars.ease ? String(t.vars.ease.name || t.vars.ease) : null,
    cible: t.targets && t.targets()[0] ? t.targets()[0].tagName + "." + String(t.targets()[0].className).slice(0, 30) : null,
    n: t.targets ? t.targets().length : 0,
    stagger: t.vars && t.vars.stagger != null ? (typeof t.vars.stagger === "object" ? JSON.stringify(propre(t.vars.stagger)) : String(t.vars.stagger)) : null,
    vars: propre(t.vars),
    startAt: t.vars && t.vars.startAt ? propre(t.vars.startAt) : null,
  });
  return st.getAll().map((t, i) => {
    const a = t.animation;
    let enf = null;
    if (a && a.getChildren) enf = a.getChildren(true, true, true).slice(0, 14).map(dec);
    return {
      i, trigger: t.trigger ? t.trigger.tagName + "." + String(t.trigger.className).slice(0, 42) : null,
      start: t.vars.start, end: t.vars.end, scrub: t.vars.scrub ?? false, once: t.vars.once ?? false,
      startPx: Math.round(t.start), endPx: Math.round(t.end), course_px: Math.round(t.end - t.start),
      anim: a ? { d: +a.duration().toFixed(4), ease: a.vars && a.vars.ease ? String(a.vars.ease.name || a.vars.ease) : null, ...(a.getChildren ? {} : dec(a)) } : null,
      enfants: enf,
    };
  });
});
writeFileSync(join(D, "source-scrolltriggers.json"), JSON.stringify(source, null, 2));

console.log("═══ A · LA SOURCE — ScrollTriggers avec animation ═══");
console.log("total triggers :", source.length);
for (const t of source) {
  if (!t.anim && !t.enfants) continue;
  console.log(`\n[${t.i}] ${t.trigger}`);
  console.log(`    start=${t.start} end=${t.end} scrub=${t.scrub} course=${t.course_px}px`);
  if (t.anim) console.log(`    anim : ${JSON.stringify(t.anim).slice(0, 300)}`);
  if (t.enfants) t.enfants.forEach((e) => console.log(`      · ${JSON.stringify(e).slice(0, 420)}`));
}

/* ══ B. LE RENDU — approche reelle d'un H2, releve a 60 Hz ══ */
async function filmer(sel, nom, reculPx) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await attendre(900);
  const n = await page.evaluate((s) => window.__armer(s), sel);
  if (!n) { console.log("!! cible absente :", sel); return null; }
  const docY = await page.evaluate((s) => {
    const e = document.querySelector(s);
    return Math.round(e.getBoundingClientRect().top + window.scrollY);
  }, sel);
  /* on se place SOUS le declencheur puis on remonte comme un visiteur */
  await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, docY - reculPx));
  await attendre(1400);
  await page.evaluate(() => window.__demarrer());
  /* roulette reelle, 24 px par cran, 30 crans = 720 px */
  for (let k = 0; k < 30; k++) { await page.mouse.wheel(0, 24); await attendre(16); }
  await attendre(2200);
  const ech = await page.evaluate(() => { window.__rec.actif = false; return window.__rec.ech; });
  writeFileSync(join(D, `rendu-${nom}.json`), JSON.stringify({ sel, docY, lignes: n, ech }, null, 2));
  return { sel, docY, lignes: n, ech };
}

function analyser(r, nom) {
  if (!r || !r.ech.length) return null;
  const { ech } = r;
  const out = [];
  const insetDroite = (cp) => { const m = String(cp).match(/inset\(([\d.]+)%?\s+([\d.]+)%/); return m ? Number(m[2]) : null; };
  const insetGauche = (cp) => { const m = String(cp).match(/inset\(([\d.]+)%?\s+([\d.]+)%\s+([\d.]+)%\s+([\d.]+)%/); return m ? Number(m[4]) : null; };
  for (let n = 0; n < r.lignes; n++) {
    const io = ech.map((s) => s.c[n].io);
    const dr = ech.map((s) => insetDroite(s.c[n].rcp));
    const ga = ech.map((s) => insetGauche(s.c[n].rcp));
    const ty = ech.map((s) => { const m = String(s.c[n].itf).match(/matrix\(([^)]+)\)/); return m ? Number(m[1].split(",")[5]) : 0; });
    const bouge = (a) => { const f = a.filter(Number.isFinite); return f.length ? Math.max(...f) - Math.min(...f) : 0; };
    /* instant du basculement d'opacite du texte */
    let iFlip = -1, nInter = 0;
    for (let k = 1; k < io.length; k++) {
      if (io[k] !== io[k - 1] && iFlip < 0) iFlip = k;
      if (io[k] > 0.02 && io[k] < 0.98) nInter++;
    }
    /* fenetre ou le rect bouge */
    const bougeRect = dr.map((v, k) => (k ? Math.abs((v ?? 0) - (dr[k - 1] ?? 0)) + Math.abs((ga[k] ?? 0) - (ga[k - 1] ?? 0)) : 0));
    let i0 = bougeRect.findIndex((v) => v > 0.1);
    let i1 = bougeRect.length - 1; while (i1 > 0 && bougeRect[i1] <= 0.1) i1--;
    out.push({
      ligne: n,
      opaciteTexte: `${io[0]} → ${io[io.length - 1]}`,
      images_opacite_intermediaire: nInter,
      basculeOpacite_ms: iFlip > 0 ? ech[iFlip].t : null,
      basculeOpacite_scrollY: iFlip > 0 ? ech[iFlip].s : null,
      rect_inset_droite: `${dr[i0 > 0 ? i0 - 1 : 0]}% → ${dr[i1]}%`,
      rect_inset_gauche: `${ga[i0 > 0 ? i0 - 1 : 0]}% → ${ga[i1]}%`,
      rect_debut_ms: i0 >= 0 ? ech[i0].t : null,
      rect_fin_ms: i1 >= 0 ? ech[i1].t : null,
      rect_duree_ms: i0 >= 0 && i1 >= 0 ? +(ech[i1].t - ech[i0].t).toFixed(1) : null,
      rect_images: i1 - i0 + 1,
      translationY_texte_px: +bouge(ty).toFixed(2),
      fondRect: ech[0].c[n].rbg, couleurTexte: ech[0].c[n].icol,
      /* courbe : progression de l'inset droite */
      courbeDroite: i0 >= 0 ? ech.slice(i0, i1 + 1).filter((_, k) => k % 2 === 0).map((s) => insetDroite(s.c[n].rcp)) : null,
      courbeGauche: i0 >= 0 ? ech.slice(i0, i1 + 1).filter((_, k) => k % 2 === 0).map((s) => insetGauche(s.c[n].rcp)) : null,
    });
  }
  const deb = out.map((o) => o.rect_debut_ms).filter((v) => v != null);
  const dec = deb.slice(1).map((v, i) => +(v - deb[i]).toFixed(1));
  console.log(`\n═══ B · LE RENDU — ${nom} (${r.lignes} lignes, ${r.ech.length} images) ═══`);
  out.forEach((o) => console.log("  ", JSON.stringify(o).slice(0, 700)));
  console.log("   DECALAGE entre lignes consecutives (ms) :", dec);
  /* tweens vus en vol */
  const vus = new Map();
  r.ech.forEach((s) => s.tw.forEach((t) => { if (!vus.has(t.vars)) vus.set(t.vars, t); }));
  console.log("   tweens gsap surpris en vol :");
  [...vus.values()].slice(0, 10).forEach((t) => console.log("     ·", JSON.stringify(t).slice(0, 420)));
  return { lignes: out, decalages_ms: dec, tweens: [...vus.values()].slice(0, 12) };
}

const r1 = await filmer("h2.brands_heading", "brands", 1150);
const a1 = analyser(r1, "h2.brands_heading");
const r2 = await filmer("h2.team_heading", "team", 1150);
const a2 = analyser(r2, "h2.team_heading");

/* ══ C. LA SEQUENCE D'IMAGES — 14 vues pendant la revelation ══ */
const SD = join(D, "sequence-revelation"); mkdirSync(SD, { recursive: true });
{
  const docY = await page.evaluate(() => {
    const e = document.querySelector("h2.brands_heading");
    return Math.round(e.getBoundingClientRect().top + window.scrollY);
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await attendre(1000);
  await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, docY - 1150));
  await attendre(1500);
  const boite = await page.evaluate(() => {
    const r = document.querySelector("h2.brands_heading").getBoundingClientRect();
    return { x: Math.max(0, Math.round(r.left) - 20), w: Math.min(1400, Math.round(r.width) + 40) };
  });
  /* un cran de roulette, puis 14 vues de 45 ms */
  await page.mouse.wheel(0, 620);
  for (let k = 0; k < 14; k++) {
    const r = await page.evaluate(() => {
      const e = document.querySelector("h2.brands_heading").getBoundingClientRect();
      return { y: Math.round(e.top), h: Math.round(e.height) };
    });
    const y = Math.max(0, Math.min(880, r.y - 30));
    await page.screenshot({ path: join(SD, `rev-${nb(k)}.png`), clip: { x: boite.x, y, width: boite.w, height: Math.min(900 - y, r.h + 70) } }).catch(() => {});
    await attendre(45);
  }
}

/* ══ D. LA DERIVE ET L'INCLINAISON ══ */
const derive = await page.evaluate(async () => {
  const out = { cartes: [], arc: [], statement: null };
  /* les fiches works_card : y / scale / rotationX scrubbes */
  const cartes = [...document.querySelectorAll("a.works_card")];
  const docY = (e) => Math.round(e.getBoundingClientRect().top + window.scrollY);
  if (cartes.length) {
    const c = cartes[1];
    const cible = docY(c);
    const releve = [];
    for (let y = cible - 1000; y < cible + 400; y += 50) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const cs = getComputedStyle(c);
      const m = String(cs.transform).match(/matrix3d\(([^)]+)\)|matrix\(([^)]+)\)/);
      let ty = 0, sc = 1, rx = 0;
      if (m) {
        const v = (m[1] || m[2]).split(",").map(Number);
        if (m[1]) { ty = v[13]; sc = Math.hypot(v[0], v[1]); rx = Math.round(Math.atan2(-v[9], v[10]) * 180 / Math.PI * 100) / 100; }
        else { ty = v[5]; sc = Math.hypot(v[0], v[1]); }
      }
      releve.push({ scrollY: y, ty: +ty.toFixed(2), scale: +sc.toFixed(4), rotationX: rx, top: Math.round(c.getBoundingClientRect().top) });
    }
    out.cartes = releve;
  }
  /* l'arc incline : angle de chaque vignette */
  out.arc = [...document.querySelectorAll(".arc-marquee_item")].slice(0, 12).map((e) => {
    const cs = getComputedStyle(e), r = e.getBoundingClientRect();
    const m = String(cs.transform).match(/matrix\(([^)]+)\)/);
    let ang = 0;
    if (m) { const v = m[1].split(",").map(Number); ang = +(Math.atan2(v[1], v[0]) * 180 / Math.PI).toFixed(2); }
    return { w: Math.round(r.width), h: Math.round(r.height), angle: ang, radius: cs.borderRadius, ombre: cs.boxShadow.slice(0, 30) };
  });
  return out;
});
writeFileSync(join(D, "derive.json"), JSON.stringify(derive, null, 2));
console.log("\n═══ D · DERIVE DES FICHES (scrub) ═══");
derive.cartes.forEach((c) => console.log("  ", JSON.stringify(c)));
console.log("   amplitude ty :", (() => { const t = derive.cartes.map((c) => c.ty); return `${Math.min(...t)} → ${Math.max(...t)} = ${(Math.max(...t) - Math.min(...t)).toFixed(1)} px`; })());
console.log("   amplitude scale :", (() => { const t = derive.cartes.map((c) => c.scale); return `${Math.min(...t)} → ${Math.max(...t)}`; })());
console.log("   amplitude rotationX :", (() => { const t = derive.cartes.map((c) => c.rotationX); return `${Math.min(...t)}° → ${Math.max(...t)}°`; })());
console.log("   angles de l'arc :", derive.arc.map((a) => a.angle).join(", "));

writeFileSync(join(D, "analyse.json"), JSON.stringify({ brands: a1, team: a2, derive: { cartes: derive.cartes, arc: derive.arc } }, null, 2));
await nav.close();
console.log("\n→ tools/_refs/fullstack/ : source-scrolltriggers.json, rendu-*.json, analyse.json, derive.json, sequence-revelation/");
