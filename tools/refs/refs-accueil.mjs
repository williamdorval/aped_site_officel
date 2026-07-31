/* ============================================================
   ETUDE DES DEUX REFERENCES DU CHANTIER 01 · ACCUEIL
   ------------------------------------------------------------
   1. fullstack-studio.webflow.io
      · revelation des textes au defilement
      · mise en scene des cartes qui derivent et s'inclinent
   2. fancy-toggle-753251.framer.app
      · mecanique de bascule d'etat

   La regle de `refs-mesure.mjs` tient : on ne photographie pas un
   timing, on le RELEVE dans la page. Une capture d'ecran est plus
   lente qu'une transition. Les images ne servent que de preuve.

   Usage : node tools/refs-accueil.mjs [1|2|tout]
   ============================================================ */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RACINE = join(process.cwd(), "tools", "_refs", "accueil");
const dossier = (slug) => { const d = join(RACINE, slug); mkdirSync(d, { recursive: true }); return d; };
const nb = (n, l = 2) => String(n).padStart(l, "0");

/* ---------- identification de courbe (reprise de refs-mesure) ---------- */
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const fx = (t) => ((ax * t + bx) * t + cx) * t;
  const dfx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    let t = x;
    for (let i = 0; i < 8; i++) { const e = fx(t) - x; if (Math.abs(e) < 1e-6) break; const d = dfx(t); if (Math.abs(d) < 1e-6) break; t -= e / d; }
    t = Math.max(0, Math.min(1, t));
    return ((ay * t + by) * t + cy) * t;
  };
}
const CATALOGUE = {
  linear: bezier(0, 0, 1, 1),
  "ease-out": bezier(0, 0, 0.58, 1),
  "ease-in-out": bezier(0.42, 0, 0.58, 1),
  "power2.out": bezier(0.165, 0.84, 0.44, 1),
  "power3.out": bezier(0.215, 0.61, 0.355, 1),
  "expo.out (0.16,1,0.3,1)": bezier(0.16, 1, 0.3, 1),
  "quint.out (0.22,1,0.36,1)": bezier(0.22, 1, 0.36, 1),
  "spring mou (0.6,1.5,0.5,1)": bezier(0.6, 1.5, 0.5, 1),
};
function identifier(points) {
  if (points.length < 5) return null;
  const notes = Object.entries(CATALOGUE).map(([nom, f]) => {
    let s = 0; for (const p of points) { const d = f(p.x) - p.y; s += d * d; }
    return { nom, ecart: Math.sqrt(s / points.length) };
  }).sort((a, b) => a.ecart - b.ecart);
  return { meilleur: notes[0].nom, ecart: +notes[0].ecart.toFixed(4), suivants: notes.slice(1, 3).map((n) => `${n.nom} ${n.ecart.toFixed(3)}`) };
}
function depassement(vals) {
  if (vals.length < 3) return 0;
  const fin = vals[vals.length - 1];
  const dep = Math.max(...vals.map((v) => Math.abs(v - fin)));
  const amp = Math.abs(vals[0] - fin) || 1;
  /* depassement = a-t-on passe la valeur finale puis fait demi-tour ? */
  let over = 0;
  const sens = Math.sign(fin - vals[0]);
  for (const v of vals) { const d = (v - fin) * sens; if (d > over) over = d; }
  return +((over / amp) * 100).toFixed(1);
}

const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

/* ============================================================
   REFERENCE 1 — fullstack-studio.webflow.io
   ============================================================ */
async function ref1(navigateur) {
  const d = dossier("1-fullstack-studio");
  const page = await navigateur.newPage({ viewport: { width: 1440, height: 900 } });
  const rapport = { url: "https://fullstack-studio.webflow.io/", vues: [], mouvements: [] };

  await page.goto("https://fullstack-studio.webflow.io/", { waitUntil: "networkidle", timeout: 60000 });
  await attendre(2500);

  const hauteur = await page.evaluate(() => document.documentElement.scrollHeight);
  rapport.hauteurPage = hauteur;

  /* --- 1A. structure : qu'est-ce qui bouge, et comment --- */
  rapport.structure = await page.evaluate(() => {
    const out = { transformes: [], masques: [], sections: [] };
    document.querySelectorAll("section, [class*='section']").forEach((s, i) => {
      if (i > 24) return;
      const r = s.getBoundingClientRect();
      out.sections.push({ cls: s.className.slice(0, 60), h: Math.round(r.height) });
    });
    document.querySelectorAll("*").forEach((el) => {
      const cs = getComputedStyle(el);
      if (cs.transform && cs.transform !== "none" && out.transformes.length < 40) {
        out.transformes.push({ tag: el.tagName, cls: String(el.className).slice(0, 50), t: cs.transform, o: cs.opacity });
      }
      if ((cs.clipPath && cs.clipPath !== "none") || cs.overflow === "hidden" && el.children.length === 1) {
        if (out.masques.length < 25) out.masques.push({ tag: el.tagName, cls: String(el.className).slice(0, 50), clip: cs.clipPath, ov: cs.overflow });
      }
    });
    return out;
  });

  /* --- 1B. traversee lente, 24 vues, avec relevé à chaque pas --- */
  const PAS = 24;
  for (let i = 0; i < PAS; i++) {
    const y = Math.round((hauteur - 900) * (i / (PAS - 1)));
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
    await attendre(420);
    await page.screenshot({ path: join(d, `vue-${nb(i)}.png`) });
    const etat = await page.evaluate(() => {
      const rot = [];
      document.querySelectorAll("*").forEach((el) => {
        const cs = getComputedStyle(el);
        const t = cs.transform;
        if (!t || t === "none") return;
        const m = t.match(/matrix\(([^)]+)\)/);
        if (!m) return;
        const [a, b] = m[1].split(",").map(Number);
        const ang = Math.atan2(b, a) * 180 / Math.PI;
        if (Math.abs(ang) > 0.4 && rot.length < 14) {
          const r = el.getBoundingClientRect();
          rot.push({ cls: String(el.className).slice(0, 44), angle: +ang.toFixed(2), y: Math.round(r.top), h: Math.round(r.height), op: +cs.opacity });
        }
      });
      return { scrollY: Math.round(window.scrollY), inclines: rot };
    });
    rapport.vues.push(etat);
  }

  /* --- 1C. la revelation d'un texte, image par image --- */
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await attendre(1200);
  /* on cherche un bloc de texte encore non revele plus bas, puis on
     approche par PAS COURTS comme un visiteur, en relevant à 60 Hz */
  const suivi = await page.evaluate(async () => {
    const echantillons = [];
    const cibles = [...document.querySelectorAll("h1, h2, h3, p, [class*='heading'], [class*='title']")]
      .filter((el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return r.height > 12 && r.top > window.innerHeight * 0.9 && r.top < window.innerHeight * 3;
      }).slice(0, 8);
    if (!cibles.length) return { vide: true };
    const depart = performance.now();
    const cible = () => cibles.map((el) => {
      const cs = getComputedStyle(el);
      return { o: +cs.opacity, t: cs.transform, clip: cs.clipPath, y: Math.round(el.getBoundingClientRect().top) };
    });
    /* defilement par petits pas, 16 ms entre chaque */
    for (let k = 0; k < 90; k++) {
      window.scrollBy(0, 14);
      await new Promise((r) => requestAnimationFrame(r));
      echantillons.push({ t: +(performance.now() - depart).toFixed(1), e: cible() });
    }
    return { classes: cibles.map((c) => String(c.className).slice(0, 50) + " / " + c.tagName), echantillons };
  });
  rapport.revelationTexte = suivi;

  /* --- 1D. courbe d'opacite et de translation du premier element revele --- */
  if (suivi && suivi.echantillons) {
    const n = suivi.echantillons[0].e.length;
    for (let idx = 0; idx < n; idx++) {
      const ops = suivi.echantillons.map((s) => s.e[idx].o);
      const ty = suivi.echantillons.map((s) => {
        const m = String(s.e[idx].t).match(/matrix\(([^)]+)\)/);
        return m ? Number(m[1].split(",")[5]) : 0;
      });
      const bouge = Math.max(...ops) - Math.min(...ops) > 0.05 || Math.max(...ty) - Math.min(...ty) > 2;
      if (!bouge) continue;
      const i0 = ops.findIndex((v) => v > 0.02);
      const i1 = ops.findIndex((v) => v > 0.98);
      const seg = suivi.echantillons.slice(Math.max(0, i0), i1 > i0 ? i1 + 1 : suivi.echantillons.length);
      if (seg.length < 5) continue;
      const t0 = seg[0].t, t1 = seg[seg.length - 1].t;
      const pts = seg.map((s) => ({ x: (s.t - t0) / (t1 - t0 || 1), y: s.e[idx].o }));
      rapport.mouvements.push({
        element: suivi.classes[idx],
        dureeOpacite_ms: +(t1 - t0).toFixed(1),
        courbe: identifier(pts),
        translationY_px: +(Math.max(...ty) - Math.min(...ty)).toFixed(1),
        depassementY_pct: depassement(ty),
        clip: seg[0].e[idx].clip,
      });
    }
  }

  await page.close();
  writeFileSync(join(d, "rapport.json"), JSON.stringify(rapport, null, 2));
  return rapport;
}

/* ============================================================
   REFERENCE 2 — fancy-toggle-753251.framer.app
   ============================================================ */
async function ref2(navigateur) {
  const d = dossier("2-fancy-toggle");
  const page = await navigateur.newPage({ viewport: { width: 1280, height: 800 } });
  const rapport = { url: "https://fancy-toggle-753251.framer.app/", bascules: [] };

  await page.goto("https://fancy-toggle-753251.framer.app/", { waitUntil: "networkidle", timeout: 60000 });
  await attendre(2500);
  await page.screenshot({ path: join(d, "repos.png"), fullPage: true });

  rapport.structure = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("*").forEach((el) => {
      if (out.length > 60) return;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width < 30 || r.height < 18 || r.width > 900) return;
      const cliquable = el.tagName === "BUTTON" || el.getAttribute("role") === "button" ||
        cs.cursor === "pointer" || el.tagName === "A";
      if (!cliquable) return;
      out.push({
        tag: el.tagName, cls: String(el.className).slice(0, 60),
        texte: (el.textContent || "").trim().slice(0, 40),
        w: Math.round(r.width), h: Math.round(r.height),
        x: Math.round(r.left), y: Math.round(r.top),
        radius: cs.borderRadius, bg: cs.backgroundColor, col: cs.color,
        transition: cs.transition.slice(0, 120), ombre: cs.boxShadow.slice(0, 80),
      });
    });
    return out;
  });

  /* --- 2A. la bascule, relevee image par image --- */
  const candidats = rapport.structure.filter((c) => c.w > 40 && c.h > 24).slice(0, 6);
  for (let i = 0; i < candidats.length; i++) {
    const c = candidats[i];
    const sousDossier = join(d, `bascule-${nb(i)}`);
    mkdirSync(sousDossier, { recursive: true });

    /* releve DANS la page pendant le clic */
    const releve = await page.evaluate(async ({ x, y, w, h }) => {
      const el = document.elementFromPoint(x + w / 2, y + h / 2);
      if (!el) return { vide: true };
      const racine = el.closest("[class]") || el;
      const noeuds = [racine, ...racine.querySelectorAll("*")].slice(0, 20);
      const lire = () => noeuds.map((n) => {
        const cs = getComputedStyle(n);
        return { t: cs.transform, o: +cs.opacity, bg: cs.backgroundColor, col: cs.color, w: cs.width, cp: cs.clipPath };
      });
      const ech = [];
      const t0 = performance.now();
      const boucle = () => { ech.push({ t: +(performance.now() - t0).toFixed(1), e: lire() }); };
      boucle();
      racine.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      racine.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
      racine.click();
      for (let k = 0; k < 75; k++) { await new Promise((r) => requestAnimationFrame(r)); boucle(); }
      return { nb: noeuds.length, cls: String(racine.className).slice(0, 60), ech };
    }, c);

    if (releve.vide) continue;

    /* analyse : quels noeuds ont bouge, sur quelle duree, avec quel depassement */
    const bouges = [];
    for (let n = 0; n < releve.nb; n++) {
      const tx = releve.ech.map((s) => {
        const m = String(s.e[n].t).match(/matrix\(([^)]+)\)/);
        return m ? Number(m[1].split(",")[4]) : 0;
      });
      const ops = releve.ech.map((s) => s.e[n].o);
      const bg = releve.ech.map((s) => s.e[n].bg);
      const dx = Math.max(...tx) - Math.min(...tx);
      const dop = Math.max(...ops) - Math.min(...ops);
      const bgChange = new Set(bg).size > 1;
      if (dx < 1.5 && dop < 0.05 && !bgChange) continue;
      /* duree = du premier changement au dernier */
      const stable = (arr) => { let last = arr.length - 1; while (last > 0 && String(arr[last]) === String(arr[last - 1])) last--; return last; };
      const finT = releve.ech[Math.max(stable(tx), stable(ops), stable(bg))].t;
      const pts = releve.ech.filter((s) => s.t <= finT).map((s, k, a) => ({
        x: s.t / (finT || 1),
        y: dx > 1.5 ? (Number((String(s.e[n].t).match(/matrix\(([^)]+)\)/) || [0, ",,,,0"])[1].split(",")[4]) - tx[0]) / (tx[tx.length - 1] - tx[0] || 1) : (s.e[n].o - ops[0]) / (ops[ops.length - 1] - ops[0] || 1),
      }));
      bouges.push({
        noeud: n, deltaX_px: +dx.toFixed(1), deltaOpacite: +dop.toFixed(3),
        fondChange: bgChange, fonds: [...new Set(bg)].slice(0, 4),
        duree_ms: +finT.toFixed(1),
        depassementX_pct: depassement(tx),
        courbe: identifier(pts),
      });
    }
    rapport.bascules.push({ cible: c, cls: releve.cls, bouges });

    /* preuve visuelle : 10 images pendant une seconde bascule */
    for (let k = 0; k < 10; k++) {
      if (k === 1) await page.mouse.click(c.x + c.w / 2, c.y + c.h / 2);
      await page.screenshot({ path: join(sousDossier, `img-${nb(k)}.png`), clip: { x: Math.max(0, c.x - 40), y: Math.max(0, c.y - 40), width: Math.min(1280, c.w + 80), height: Math.min(800, c.h + 80) } });
      await attendre(45);
    }
  }

  await page.close();
  writeFileSync(join(d, "rapport.json"), JSON.stringify(rapport, null, 2));
  return rapport;
}

/* ============================================================ */
const quoi = process.argv[2] || "tout";
const navigateur = await chromium.launch();
try {
  if (quoi === "1" || quoi === "tout") {
    const r = await ref1(navigateur);
    console.log("\n=== 1 · fullstack-studio ===");
    console.log("hauteur page :", r.hauteurPage);
    console.log("mouvements de texte releves :", r.mouvements.length);
    r.mouvements.slice(0, 10).forEach((m) => console.log("  ", JSON.stringify(m)));
    const angles = new Set();
    r.vues.forEach((v) => v.inclines.forEach((i) => angles.add(`${i.cls}|${i.angle}`)));
    console.log("elements inclines (classe|angle) :", [...angles].slice(0, 30));
  }
  if (quoi === "2" || quoi === "tout") {
    const r = await ref2(navigateur);
    console.log("\n=== 2 · fancy-toggle ===");
    console.log("cliquables :", r.structure.length);
    r.structure.slice(0, 10).forEach((s) => console.log("  ", JSON.stringify(s)));
    r.bascules.forEach((b) => {
      console.log("\n  bascule", b.cls, "-", b.cible.texte);
      b.bouges.slice(0, 8).forEach((x) => console.log("    ", JSON.stringify(x)));
    });
  }
} finally {
  await navigateur.close();
}
console.log("\nSorties dans tools/_refs/accueil/");
