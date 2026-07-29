/* ============================================================
   REFERENCE 1 — fullstack-studio : LA REVELATION, mesuree juste.

   PIEGE TROUVE : les ScrollTrigger des titres sont `once`. Ils se
   TUENT apres avoir joue (34 triggers au chargement, 26 apres une
   traversee complete). Toute sonde qui traverse la page avant de
   mesurer photographie donc la fin du mouvement. Une page neuve
   par cible, et on n'approche que celle-la.

   On instrumente aussi gsap AVANT que la page ne s'en serve :
   gsap.to / from / fromTo / timeline sont enveloppes, on enregistre
   les vars declarees. C'est la source, pas une interpretation.
   Usage : node tools/refs-fs-reveal.mjs
   ============================================================ */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const D = join(process.cwd(), "tools", "_refs", "fullstack");
mkdirSync(D, { recursive: true });
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const nb = (n) => String(n).padStart(2, "0");
const URL = "https://fullstack-studio.webflow.io/";

const nav = await chromium.launch();

const SONDE = () => {
  /* --- 1. on enveloppe gsap des qu'il est pose sur window --- */
  window.__appels = [];
  let vrai = null;
  const propre = (v) => {
    if (v == null) return null;
    const o = {};
    for (const [k, x] of Object.entries(v)) {
      if (typeof x === "function") { o[k] = "fn"; continue; }
      if (k === "ease") { o[k] = String(x && x.name ? x.name : x); continue; }
      if (x && typeof x === "object") { try { o[k] = JSON.parse(JSON.stringify(x)); } catch (e) { o[k] = "obj"; } continue; }
      o[k] = x;
    }
    return o;
  };
  const nom = (t) => {
    if (!t) return null;
    const l = Array.isArray(t) ? t : (t.length !== undefined && typeof t !== "string" ? [...t] : [t]);
    const p = l[0];
    if (typeof p === "string") return `sel:${p}×${l.length}`;
    if (p && p.tagName) return `${p.tagName}.${String(p.className).slice(0, 30)}×${l.length}`;
    return `?×${l.length}`;
  };
  const env = (g) => {
    for (const m of ["to", "from", "fromTo"]) {
      const o = g[m].bind(g);
      g[m] = (...a) => {
        try {
          const v = m === "fromTo" ? { de: propre(a[1]), vers: propre(a[2]) } : propre(a[1]);
          window.__appels.push({ m, cible: nom(a[0]), v, t: +performance.now().toFixed(0) });
        } catch (e) { /* rien */ }
        return o(...a);
      };
    }
    const tlo = g.timeline.bind(g);
    g.timeline = (...a) => {
      const tl = tlo(...a);
      for (const m of ["to", "from", "fromTo", "set"]) {
        const o = tl[m].bind(tl);
        tl[m] = (...b) => {
          try {
            const v = m === "fromTo" ? { de: propre(b[1]), vers: propre(b[2]) } : propre(b[1]);
            const pos = m === "fromTo" ? b[3] : b[2];
            window.__appels.push({ m: "tl." + m, cible: nom(b[0]), v, pos: pos === undefined ? null : String(pos), t: +performance.now().toFixed(0) });
          } catch (e) { /* rien */ }
          return o(...b);
        };
      }
      return tl;
    };
    return g;
  };
  Object.defineProperty(window, "gsap", {
    configurable: true,
    get() { return vrai; },
    set(v) { vrai = v && v.to ? env(v) : v; },
  });

  /* --- 2. le releveur 60 Hz --- */
  window.__rec = { ech: [], actif: false, c: [] };
  window.__armer = (sel) => {
    const h = document.querySelector(sel);
    if (!h) return 0;
    window.__rec.c = [...h.querySelectorAll(".text-highlight_line")].map((l) => ({
      l, i: l.querySelector(".text-highlight_inner"), r: l.querySelector(".text-highlight_rect"), x: l.querySelector(".text-highlight_text"),
    }));
    window.__rec.ech = [];
    return window.__rec.c.length;
  };
  window.__demarrer = () => {
    window.__rec.actif = true;
    const t0 = performance.now();
    const tic = () => {
      const c = window.__rec.c.map((o) => {
        const ci = getComputedStyle(o.i), cr = getComputedStyle(o.r);
        const rl = o.l.getBoundingClientRect(), rx = o.x.getBoundingClientRect();
        return {
          io: +ci.opacity, itf: ci.transform, icol: ci.color,
          rcp: cr.clipPath, ro: +cr.opacity, rbg: cr.backgroundColor,
          lw: +rx.width.toFixed(1), lh: +rx.height.toFixed(1), ly: +rl.top.toFixed(1),
        };
      });
      window.__rec.ech.push({ t: +(performance.now() - t0).toFixed(1), s: +window.scrollY, c });
      if (window.__rec.ech.length < 400 && window.__rec.actif) requestAnimationFrame(tic);
    };
    tic();
  };
};

/* ── inset(a b c d) : b = rogne a DROITE, d = rogne a GAUCHE ── */
const ins = (cp, k) => { const m = String(cp).match(/inset\(\s*([-\d.]+)%\s+([-\d.]+)%\s+([-\d.]+)%\s+([-\d.]+)%/); return m ? Number(m[k]) : null; };

async function mesurer(sel, nom, reculPx, crans) {
  const page = await nav.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(SONDE);
  await page.goto(URL, { waitUntil: "networkidle", timeout: 90000 });
  await attendre(2500);

  const n = await page.evaluate((s) => window.__armer(s), sel);
  if (!n) { console.log("!! absent :", sel); await page.close(); return null; }
  const docY = await page.evaluate((s) => Math.round(document.querySelector(s).getBoundingClientRect().top + window.scrollY), sel);
  const depart = Math.max(0, docY - reculPx);
  await page.evaluate((y) => window.scrollTo(0, y), depart);
  await attendre(1300);
  await page.evaluate(() => window.__demarrer());
  for (let k = 0; k < crans; k++) { await page.mouse.wheel(0, 22); await attendre(16); }
  await attendre(2600);
  const { ech, appels } = await page.evaluate(() => { window.__rec.actif = false; return { ech: window.__rec.ech, appels: window.__appels }; });
  await page.close();

  /* ── analyse ligne par ligne ── */
  const out = [];
  for (let i = 0; i < n; i++) {
    const io = ech.map((s) => s.c[i].io);
    const dr = ech.map((s) => ins(s.c[i].rcp, 2));   /* rogne a droite */
    const ga = ech.map((s) => ins(s.c[i].rcp, 4));   /* rogne a gauche */
    const lw = ech[0].c[i].lw, lh = ech[0].c[i].lh;
    const bougeR = dr.map((v, k) => (k && Number.isFinite(v) && Number.isFinite(dr[k - 1]) ? Math.abs(v - dr[k - 1]) : 0));
    const bougeG = ga.map((v, k) => (k && Number.isFinite(v) && Number.isFinite(ga[k - 1]) ? Math.abs(v - ga[k - 1]) : 0));
    const fen = (b) => { let a = b.findIndex((v) => v > 0.05); let z = b.length - 1; while (z > 0 && b[z] <= 0.05) z--; return a < 0 ? null : [a, z]; };
    const fR = fen(bougeR), fG = fen(bougeG);
    let flip = -1, inter = 0;
    for (let k = 1; k < io.length; k++) { if (io[k] !== io[k - 1] && flip < 0) flip = k; if (io[k] > 0.02 && io[k] < 0.98) inter++; }
    const cnv = (f, arr) => f ? arr.slice(f[0] - 1 < 0 ? 0 : f[0] - 1, f[1] + 1).map((v) => +Number(v).toFixed(1)) : null;
    out.push({
      ligne: i, largeur_px: lw, hauteur_px: lh,
      /* ALLER : le rect se deploie, rogne-droite 100 → 0 */
      aller_debut_ms: fR ? ech[fR[0]].t : null, aller_fin_ms: fR ? ech[fR[1]].t : null,
      aller_duree_ms: fR ? +(ech[fR[1]].t - ech[fR[0]].t).toFixed(1) : null,
      aller_images: fR ? fR[1] - fR[0] + 1 : 0,
      aller_inset: fR ? `${dr[Math.max(0, fR[0] - 1)]}% → ${dr[fR[1]]}%` : null,
      aller_px: fR ? +((dr[Math.max(0, fR[0] - 1)] - dr[fR[1]]) / 100 * lw).toFixed(1) : null,
      /* RETOUR : le rect se retire, rogne-gauche 0 → 100 */
      retour_debut_ms: fG ? ech[fG[0]].t : null, retour_fin_ms: fG ? ech[fG[1]].t : null,
      retour_duree_ms: fG ? +(ech[fG[1]].t - ech[fG[0]].t).toFixed(1) : null,
      retour_images: fG ? fG[1] - fG[0] + 1 : 0,
      retour_inset: fG ? `${ga[Math.max(0, fG[0] - 1)]}% → ${ga[fG[1]]}%` : null,
      /* le texte dessous */
      opaciteTexte: `${io[0]} → ${io[io.length - 1]}`,
      images_opacite_intermediaire: inter,
      bascule_ms: flip > 0 ? ech[flip].t : null,
      bascule_apres_aller_ms: flip > 0 && fR ? +(ech[flip].t - ech[fR[1]].t).toFixed(1) : null,
      couleurTexte: ech[0].c[i].icol, fondRect: ech[0].c[i].rbg,
      translationY_px: +(Math.max(...ech.map((s) => { const m = String(s.c[i].itf).match(/matrix\(([^)]+)\)/); return m ? Number(m[1].split(",")[5]) : 0; })) - Math.min(...ech.map((s) => { const m = String(s.c[i].itf).match(/matrix\(([^)]+)\)/); return m ? Number(m[1].split(",")[5]) : 0; }))).toFixed(1),
      courbe_aller: cnv(fR, dr), courbe_retour: cnv(fG, ga),
    });
  }
  const dA = out.map((o) => o.aller_debut_ms).filter((v) => v != null);
  const decA = dA.slice(1).map((v, i) => +(v - dA[i]).toFixed(1));
  const dB = out.map((o) => o.retour_debut_ms).filter((v) => v != null);
  const decB = dB.slice(1).map((v, i) => +(v - dB[i]).toFixed(1));

  console.log(`\n═════ ${sel} · ${n} lignes · ${ech.length} images relevees ═════`);
  out.forEach((o) => {
    console.log(`  ligne ${o.ligne} (${o.largeur_px}×${o.hauteur_px} px)`);
    console.log(`    ALLER  ${o.aller_inset}  ${o.aller_debut_ms}→${o.aller_fin_ms} ms = ${o.aller_duree_ms} ms sur ${o.aller_images} images  (${o.aller_px} px de course)`);
    console.log(`    RETOUR ${o.retour_inset}  ${o.retour_debut_ms}→${o.retour_fin_ms} ms = ${o.retour_duree_ms} ms sur ${o.retour_images} images`);
    console.log(`    TEXTE  opacite ${o.opaciteTexte} · images intermediaires = ${o.images_opacite_intermediaire} · bascule a ${o.bascule_ms} ms · translationY ${o.translationY_px} px`);
    console.log(`    courbe aller  : ${JSON.stringify(o.courbe_aller)}`);
    console.log(`    courbe retour : ${JSON.stringify(o.courbe_retour)}`);
  });
  console.log(`  DECALAGE entre lignes — aller : ${JSON.stringify(decA)} ms · retour : ${JSON.stringify(decB)} ms`);

  const pertinents = appels.filter((a) => /highlight|line|char|word|split/i.test(String(a.cible)) || (a.v && (a.v.clipPath || a.v.opacity !== undefined)));
  console.log(`  appels gsap enregistres : ${appels.length} · pertinents : ${pertinents.length}`);
  pertinents.slice(0, 16).forEach((a) => console.log("    ·", JSON.stringify(a).slice(0, 340)));

  writeFileSync(join(D, `reveal-${nom}.json`), JSON.stringify({ sel, docY, n, lignes: out, decalage_aller_ms: decA, decalage_retour_ms: decB, appels: appels.slice(0, 400), ech: ech.slice(0, 260) }, null, 2));
  return { out, decA, decB, appels };
}

const brands = await mesurer("h2.brands_heading", "brands", 1120, 34);
const team = await mesurer("h2.team_heading", "team", 1120, 34);
const hero = await mesurer("h1.hero_heading", "hero", 0, 2);

/* ══ le mot-a-mot SCRUBBE de statement_text — l'anti-modele ══ */
const p = await nav.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(URL, { waitUntil: "networkidle", timeout: 90000 });
await attendre(2500);
const scrub = await p.evaluate(async () => {
  const el = document.querySelector("p.statement_text");
  if (!el) return null;
  const mots = [...el.querySelectorAll(".text-fade_word")];
  const docY = Math.round(el.getBoundingClientRect().top + window.scrollY);
  const pts = [];
  for (let y = docY - 900; y < docY + 700; y += 40) {
    window.scrollTo(0, y);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const o = mots.map((m) => +getComputedStyle(m).opacity);
    const inter = o.filter((v) => v > 0.02 && v < 0.98);
    pts.push({
      scrollY: y, topEcran: Math.round(el.getBoundingClientRect().top),
      motsIntermediaires: inter.length,
      opaciteMin: +Math.min(...o).toFixed(3), opaciteMax: +Math.max(...o).toFixed(3),
      opacites: o.map((v) => +v.toFixed(2)).slice(0, 40),
    });
  }
  return { nMots: mots.length, docY, pts };
});
if (scrub) {
  console.log(`\n═════ p.statement_text · ${scrub.nMots} mots · opacite SCRUBBEE ═════`);
  scrub.pts.forEach((q) => console.log(`  scrollY=${q.scrollY} top=${q.topEcran} · mots a opacite intermediaire = ${q.motsIntermediaires} · min=${q.opaciteMin} max=${q.opaciteMax}`));
  writeFileSync(join(D, "scrub-statement.json"), JSON.stringify(scrub, null, 2));
}
await p.close();

/* ══ SEQUENCE D'IMAGES — 16 vues serrees sur la revelation ══ */
const SD = join(D, "sequence-revelation"); mkdirSync(SD, { recursive: true });
{
  const pg = await nav.newPage({ viewport: { width: 1440, height: 900 } });
  await pg.goto(URL, { waitUntil: "networkidle", timeout: 90000 });
  await attendre(2500);
  const docY = await pg.evaluate(() => Math.round(document.querySelector("h2.brands_heading").getBoundingClientRect().top + window.scrollY));
  await pg.evaluate((y) => window.scrollTo(0, y), Math.max(0, docY - 1000));
  await attendre(1400);
  await pg.evaluate(() => window.scrollTo(0, window.scrollY + 700));
  for (let k = 0; k < 16; k++) {
    const r = await pg.evaluate(() => { const e = document.querySelector("h2.brands_heading").getBoundingClientRect(); return { x: Math.round(e.left), y: Math.round(e.top), w: Math.round(e.width), h: Math.round(e.height) }; });
    const y = Math.max(0, Math.min(870, r.y - 24));
    await pg.screenshot({ path: join(SD, `rev-${nb(k)}.png`), clip: { x: Math.max(0, r.x - 16), y, width: Math.min(1440 - Math.max(0, r.x - 16), r.w + 32), height: Math.max(30, Math.min(900 - y, r.h + 48)) } }).catch((e) => console.log("  (vue", k, "ratee)"));
    await attendre(42);
  }
  await pg.close();
  console.log(`\n16 vues ecrites dans ${SD}`);
}

await nav.close();
console.log("\n→ reveal-brands.json · reveal-team.json · reveal-hero.json · scrub-statement.json · sequence-revelation/");
