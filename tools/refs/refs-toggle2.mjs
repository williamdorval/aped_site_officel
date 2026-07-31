/* ============================================================
   REFERENCE 2 — fancy-toggle-753251.framer.app
   La sonde par diff a rendu « 0 reaction propre » : toute la
   composition suit le curseur en parallaxe, donc TOUT bouge pour
   TOUTE position de souris, et le filtre a tout mange.

   On change d'instrument. Un MutationObserver enregistre les
   changements d'ATTRIBUT (class, style) — c'est comme ca qu'un
   composant Framer bascule de variante — pendant qu'on survole
   chaque candidat. Ce que la parallaxe fait, elle le fait par
   transform en ligne sur les memes noeuds a chaque image ; une
   bascule de variante, elle, change une CLASSE. Les deux se
   distinguent.
   Usage : node tools/refs-toggle2.mjs
   ============================================================ */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const D = join(process.cwd(), "tools", "_refs", "toggle");
mkdirSync(D, { recursive: true });
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const nb = (n) => String(n).padStart(2, "0");

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("https://fancy-toggle-753251.framer.app/", { waitUntil: "networkidle", timeout: 90000 });
await attendre(3000);

/* ── inventaire des variantes declarees dans les feuilles ── */
const variantes = await page.evaluate(() => {
  const noms = new Set();
  for (const f of document.styleSheets) {
    let r; try { r = f.cssRules; } catch (e) { continue; }
    for (const g of r) {
      const t = g.selectorText || "";
      const m = t.match(/\.framer-v-[\w-]+/g);
      if (m) m.forEach((x) => noms.add(x));
    }
  }
  return {
    variantesCSS: [...noms].slice(0, 40),
    dansDOM: [...document.querySelectorAll("[class*='framer-v-']")].map((e) => ({
      cls: String(e.className), nom: e.getAttribute("data-framer-name") || "",
      box: (() => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; })(),
      txt: (e.textContent || "").trim().slice(0, 26),
    })),
    /* toute regle de survol declaree */
    reglesSurvol: (() => {
      const out = [];
      for (const f of document.styleSheets) {
        let r; try { r = f.cssRules; } catch (e) { continue; }
        for (const g of r) if (g.selectorText && /:hover|:active/.test(g.selectorText)) out.push({ sel: g.selectorText.slice(0, 110), css: g.style ? g.style.cssText.slice(0, 190) : "" });
      }
      return out.slice(0, 30);
    })(),
  };
});
console.log("═══ variantes Framer declarees ═══");
console.log(" en CSS :", JSON.stringify(variantes.variantesCSS));
console.log(" dans le DOM :"); variantes.dansDOM.forEach((v) => console.log("   ", JSON.stringify(v)));
console.log(" regles :hover / :active :", variantes.reglesSurvol.length);
variantes.reglesSurvol.forEach((r) => console.log("   ", r.sel, "→", r.css));

/* ── l'observateur d'attributs ── */
await page.evaluate(() => {
  window.__mut = [];
  window.__obs = new MutationObserver((l) => {
    for (const m of l) {
      if (m.type !== "attributes") continue;
      const e = m.target;
      if (m.attributeName === "style") {
        /* la parallaxe ecrit transform : on la note mais on la marque */
        const st = e.getAttribute("style") || "";
        window.__mut.push({ t: +performance.now().toFixed(0), a: "style", parallaxe: /translate|transform/.test(st) && !/opacity|background|clip/.test(st), cls: String(e.className).slice(0, 40), nom: e.getAttribute("data-framer-name") || "", av: String(m.oldValue || "").slice(0, 130), ap: st.slice(0, 130) });
      } else {
        window.__mut.push({ t: +performance.now().toFixed(0), a: m.attributeName, cls: String(e.className).slice(0, 60), nom: e.getAttribute("data-framer-name") || "", av: String(m.oldValue || "").slice(0, 110), ap: String(e.getAttribute(m.attributeName) || "").slice(0, 110), txt: (e.textContent || "").trim().slice(0, 24) });
      }
    }
  });
  window.__obs.observe(document.body, { attributes: true, subtree: true, attributeOldValue: true, attributeFilter: ["class", "style", "data-framer-name", "aria-checked", "data-highlight"] });
});

/* ── on survole chaque candidat et on regarde ce qui CHANGE DE CLASSE ── */
const cibles = await page.evaluate(() => {
  const l = [];
  const push = (sel) => document.querySelectorAll(sel).forEach((e) => {
    const r = e.getBoundingClientRect();
    if (r.width < 20 || r.height < 10) return;
    l.push({ sel, nom: e.getAttribute("data-framer-name") || "", txt: (e.textContent || "").trim().slice(0, 28), box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] });
  });
  push("[data-framer-name='Variant 1']"); push("[data-framer-name='Volatility Row']");
  push("[data-framer-name='Volatility Icon Container']"); push("[data-framer-name='Card 1']");
  push("[data-framer-name='Card 2']"); push("[data-framer-name='Card 3']");
  push("[data-framer-name='Content Container']");
  const vus = new Set();
  return l.filter((o) => { const k = o.box.join(","); if (vus.has(k)) return false; vus.add(k); return true; });
});
console.log(`\n═══ ${cibles.length} candidats survoles, on ne garde que les changements de CLASSE ═══`);

const gagnants = [];
for (const c of cibles) {
  await page.mouse.move(4, 4); await attendre(500);
  await page.evaluate(() => { window.__mut = []; });
  await page.mouse.move(c.box[0] + c.box[2] / 2, c.box[1] + c.box[3] / 2, { steps: 3 });
  await attendre(800);
  const mut = await page.evaluate(() => window.__mut);
  const classes = mut.filter((m) => m.a === "class");
  const styles = mut.filter((m) => m.a === "style" && !m.parallaxe);
  console.log(`  « ${c.txt || c.nom} » ${JSON.stringify(c.box)} → ${mut.length} mutations · classe: ${classes.length} · style non-parallaxe: ${styles.length}`);
  classes.slice(0, 6).forEach((m) => console.log(`      CLASSE ${m.nom || m.cls} « ${m.txt} » : ${m.av} → ${m.ap}`));
  styles.slice(0, 6).forEach((m) => console.log(`      STYLE  ${m.nom || m.cls} : ${m.av} → ${m.ap}`));
  if (classes.length || styles.length) gagnants.push({ c, nClasse: classes.length, nStyle: styles.length, classes: classes.slice(0, 8), styles: styles.slice(0, 8) });
}
writeFileSync(join(D, "mutations.json"), JSON.stringify({ variantes, gagnants }, null, 2));

/* ── mesure fine du candidat retenu ── */
const choix = gagnants.sort((a, b) => (b.nClasse * 10 + b.nStyle) - (a.nClasse * 10 + a.nStyle))[0]
  || { c: cibles.find((x) => x.nom === "Variant 1") || cibles[0] };
const bx = choix.c.box, cx = bx[0] + bx[2] / 2, cy = bx[1] + bx[3] / 2;
console.log(`\n═══ CIBLE MESUREE : « ${choix.c.txt || choix.c.nom} » a (${Math.round(cx)}, ${Math.round(cy)}) ═══`);

await page.evaluate((b) => {
  const el = document.elementFromPoint(b[0] + b[2] / 2, b[1] + b[3] / 2);
  let r = el; for (let i = 0; i < 3 && r.parentElement; i++) r = r.parentElement;
  window.__c = r;
  window.__film = (n) => {
    const noeuds = [r, ...r.querySelectorAll("*")].slice(0, 40);
    window.__e = []; const t0 = performance.now();
    const tic = () => {
      window.__e.push({
        t: +(performance.now() - t0).toFixed(1),
        v: noeuds.map((e) => {
          const cs = getComputedStyle(e), q = e.getBoundingClientRect();
          return { cls: String(e.className).slice(0, 34), nom: e.getAttribute("data-framer-name") || "", txt: (e.textContent || "").trim().slice(0, 18), o: +cs.opacity, tf: cs.transform, tr: cs.translate, bg: cs.backgroundColor, col: cs.color, cp: cs.clipPath, w: +q.width.toFixed(1), h: +q.height.toFixed(1), x: +q.left.toFixed(1), y: +q.top.toFixed(1), td: cs.transitionDuration, tp: cs.transitionProperty.slice(0, 70), te: cs.transitionTimingFunction.slice(0, 60) };
        }),
      });
      if (window.__e.length < n) requestAnimationFrame(tic);
    };
    tic();
  };
}, bx);

async function scene(nom, avant, apres) {
  await avant(); await attendre(900);
  await page.evaluate(() => window.__film(100));
  await apres(); await attendre(1900);
  const e = await page.evaluate(() => window.__e);
  const n = e[0].v.length, res = [];
  const amp = (a) => Math.max(...a) - Math.min(...a);
  for (let i = 0; i < n; i++) {
    const s = e.map((z) => z.v[i]);
    const ys = s.map((v) => v.y), xs = s.map((v) => v.x), os = s.map((v) => v.o), ws = s.map((v) => v.w), hs = s.map((v) => v.h);
    const bgs = s.map((v) => v.bg), cols = s.map((v) => v.col), cps = s.map((v) => v.cp), cls = s.map((v) => v.cls);
    const dY = amp(ys), dX = amp(xs), dO = amp(os), dW = amp(ws), dH = amp(hs);
    const nBg = new Set(bgs).size, nCol = new Set(cols).size, nCp = new Set(cps).size, nCls = new Set(cls).size;
    if (dY < 0.6 && dX < 0.6 && dO < 0.03 && dW < 1 && dH < 1 && nBg < 2 && nCol < 2 && nCp < 2 && nCls < 2) continue;
    const fen = (arr) => { let a = 0; while (a < arr.length - 1 && String(arr[a + 1]) === String(arr[a])) a++; let z = arr.length - 1; while (z > 0 && String(arr[z]) === String(arr[z - 1])) z--; return [a, z]; };
    const cands = [];
    if (dY > 0.5) cands.push(ys); if (dX > 0.5) cands.push(xs); if (dO > 0.02) cands.push(os);
    if (dW > 0.8) cands.push(ws); if (dH > 0.8) cands.push(hs);
    if (nBg > 1) cands.push(bgs); if (nCol > 1) cands.push(cols); if (nCp > 1) cands.push(cps); if (nCls > 1) cands.push(cls);
    let a0 = 1e9, z0 = -1; cands.forEach((c) => { const [a, z] = fen(c); if (a < a0) a0 = a; if (z > z0) z0 = z; });
    /* images intermediaires sur la couleur de fond : combien de valeurs distinctes ? */
    res.push({
      i, nom: s[0].nom, cls: s[0].cls, txt: s[0].txt,
      deltaY_px: +dY.toFixed(2), deltaX_px: +dX.toFixed(2), deltaLargeur_px: +dW.toFixed(1), deltaHauteur_px: +dH.toFixed(1), deltaOpacite: +dO.toFixed(3),
      nFonds: nBg, fonds: [...new Set(bgs)].slice(0, 4), nCouleurs: nCol, couleurs: [...new Set(cols)].slice(0, 4),
      nClips: nCp, clips: [...new Set(cps)].slice(0, 3), nClasses: nCls, classes: [...new Set(cls)].slice(0, 3),
      debut_ms: e[a0] ? e[a0].t : null, fin_ms: e[z0] ? e[z0].t : null,
      duree_ms: e[a0] && e[z0] ? +(e[z0].t - e[a0].t).toFixed(1) : null, images: z0 - a0 + 1,
      transition: `${s[0].tp} | ${s[0].td} | ${s[0].te}`,
      trajY: ys.filter((_, k) => k % 2 === 0).map((v) => +v.toFixed(1)).slice(0, 26),
      trajO: os.filter((_, k) => k % 2 === 0).map((v) => +v.toFixed(2)).slice(0, 26),
    });
  }
  console.log(`\n  --- ${nom} : ${res.length} objets changent ---`);
  res.slice(0, 14).forEach((r) => console.log("   ", JSON.stringify(r).slice(0, 700)));
  writeFileSync(join(D, `${nom}.json`), JSON.stringify({ res, e: e.slice(0, 100) }, null, 2));
  return res;
}

await scene("A-survol", async () => page.mouse.move(4, 4), async () => page.mouse.move(cx, cy, { steps: 3 }));
await scene("B-sortie", async () => page.mouse.move(cx, cy), async () => page.mouse.move(4, 4, { steps: 3 }));
await scene("C-appui", async () => page.mouse.move(cx, cy), async () => { await page.mouse.down(); await attendre(200); await page.mouse.up(); });

/* ── les images ── */
const clip = { x: Math.max(0, bx[0] - 70), y: Math.max(0, bx[1] - 70), width: Math.min(1280 - Math.max(0, bx[0] - 70), bx[2] + 140), height: Math.min(800 - Math.max(0, bx[1] - 70), bx[3] + 140) };
for (const [nom, aller] of [["sequence-aller", true], ["sequence-retour", false]]) {
  const SD = join(D, nom); mkdirSync(SD, { recursive: true });
  await page.mouse.move(aller ? 4 : cx, aller ? 4 : cy); await attendre(1000);
  for (let k = 0; k < 10; k++) {
    if (k === 1) await page.mouse.move(aller ? cx : 4, aller ? cy : 4, { steps: 2 });
    await page.screenshot({ path: join(SD, `${nom.split("-")[1]}-${nb(k)}.png`), clip }).catch(() => {});
    await attendre(34);
  }
  console.log(`  10 vues → ${SD}`);
}

await nav.close();
console.log("\n→ tools/_refs/toggle/ : mutations.json, A-survol.json, B-sortie.json, C-appui.json, sequence-aller/, sequence-retour/");
