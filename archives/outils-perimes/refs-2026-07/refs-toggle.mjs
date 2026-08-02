/* ============================================================
   SONDE CIBLEE — fancy-toggle-753251.framer.app
   Le passage precedent a trouve le bon objet mais pas sa mecanique :
   `transition: translate 0.3s ease-out` sur un bloc de 141x33.
   On l'isole, on le survole ET on le clique, et on releve.
   ============================================================ */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const d = join(process.cwd(), "tools", "_refs", "accueil", "2-fancy-toggle");
mkdirSync(d, { recursive: true });
const nb = (n) => String(n).padStart(2, "0");
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("https://fancy-toggle-753251.framer.app/", { waitUntil: "networkidle", timeout: 60000 });
await attendre(2500);

/* --- l'arbre complet autour du toggle --- */
const arbre = await page.evaluate(() => {
  const el = document.querySelector(".framer-1hk06nd") || document.elementFromPoint(460, 332);
  if (!el) return null;
  let racine = el;
  for (let i = 0; i < 3 && racine.parentElement; i++) racine = racine.parentElement;
  const decrire = (n, prof) => {
    const cs = getComputedStyle(n);
    const r = n.getBoundingClientRect();
    return {
      prof, tag: n.tagName, cls: String(n.className).slice(0, 70),
      texte: [...n.childNodes].filter((c) => c.nodeType === 3).map((c) => c.textContent.trim()).join("").slice(0, 30),
      box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
      radius: cs.borderRadius, bg: cs.backgroundColor, col: cs.color,
      translate: cs.translate, transform: cs.transform, opacity: cs.opacity,
      transition: cs.transition.slice(0, 160), ombre: cs.boxShadow.slice(0, 60),
      overflow: cs.overflow, clip: cs.clipPath, mix: cs.mixBlendMode,
    };
  };
  const out = [];
  const parcourir = (n, prof) => { if (prof > 5 || out.length > 45) return; out.push(decrire(n, prof)); [...n.children].forEach((c) => parcourir(c, prof + 1)); };
  parcourir(racine, 0);
  return out;
});
writeFileSync(join(d, "arbre.json"), JSON.stringify(arbre, null, 2));

/* --- releve pendant survol puis sortie --- */
async function scene(nom, avant, apres) {
  const sd = join(d, nom); mkdirSync(sd, { recursive: true });
  await avant();
  await attendre(700);
  const releve = await page.evaluate(async () => {
    const cible = document.querySelector(".framer-1hk06nd") || document.elementFromPoint(460, 332);
    let racine = cible; for (let i = 0; i < 3 && racine.parentElement; i++) racine = racine.parentElement;
    const noeuds = [racine, ...racine.querySelectorAll("*")].slice(0, 30);
    const lire = () => noeuds.map((n) => {
      const cs = getComputedStyle(n); const r = n.getBoundingClientRect();
      return { tr: cs.translate, tf: cs.transform, o: +cs.opacity, bg: cs.backgroundColor, col: cs.color, w: Math.round(r.width), x: Math.round(r.left), cp: cs.clipPath };
    });
    window.__ech = []; window.__t0 = performance.now();
    const tic = () => { window.__ech.push({ t: +(performance.now() - window.__t0).toFixed(1), e: lire() }); if (window.__ech.length < 70) requestAnimationFrame(tic); };
    tic();
    return noeuds.map((n) => ({ tag: n.tagName, cls: String(n.className).slice(0, 50) }));
  });
  await apres();
  await attendre(1400);
  const ech = await page.evaluate(() => window.__ech);
  await page.screenshot({ path: join(sd, "final.png"), clip: { x: 300, y: 240, width: 500, height: 200 } });

  const bouges = [];
  for (let n = 0; n < releve.length; n++) {
    const serie = ech.map((s) => s.e[n]);
    const px = (v) => { const m = String(v.tr).match(/(-?[\d.]+)px/); if (m) return Number(m[1]); const mm = String(v.tf).match(/matrix\(([^)]+)\)/); return mm ? Number(mm[1].split(",")[4]) : 0; };
    const xs = serie.map(px), ops = serie.map((v) => v.o), bgs = serie.map((v) => v.bg), cols = serie.map((v) => v.col), ws = serie.map((v) => v.w);
    const dx = Math.max(...xs) - Math.min(...xs), dop = Math.max(...ops) - Math.min(...ops), dw = Math.max(...ws) - Math.min(...ws);
    const bgN = new Set(bgs).size, colN = new Set(cols).size;
    if (dx < 1 && dop < 0.04 && dw < 2 && bgN < 2 && colN < 2) continue;
    const dernier = (arr) => { let i = arr.length - 1; while (i > 0 && String(arr[i]) === String(arr[i - 1])) i--; return i; };
    const iFin = Math.max(dernier(xs), dernier(ops), dernier(bgs), dernier(cols), dernier(ws));
    const premier = (arr) => { let i = 0; while (i < arr.length - 1 && String(arr[i]) === String(arr[i + 1])) i++; return i; };
    const iDeb = Math.min(...[xs, ops, bgs, cols, ws].map(premier).filter((v) => v < ech.length - 1));
    bouges.push({
      noeud: n, ...releve[n],
      deltaX_px: +dx.toFixed(1), deltaOpacite: +dop.toFixed(3), deltaLargeur_px: dw,
      fonds: [...new Set(bgs)].slice(0, 3), couleurs: [...new Set(cols)].slice(0, 3),
      debut_ms: ech[iDeb] ? ech[iDeb].t : null, fin_ms: ech[iFin] ? ech[iFin].t : null,
      duree_ms: ech[iFin] && ech[iDeb] ? +(ech[iFin].t - ech[iDeb].t).toFixed(1) : null,
      trajectoire: xs.filter((_, i) => i % 3 === 0).map((v) => +v.toFixed(1)),
    });
  }
  writeFileSync(join(d, `${nom}.json`), JSON.stringify({ bouges }, null, 2));
  return bouges;
}

const boite = await page.evaluate(() => {
  const el = document.querySelector(".framer-1hk06nd") || document.elementFromPoint(460, 332);
  const r = el.getBoundingClientRect();
  return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
});

console.log("cible au centre :", boite);
console.log("\n--- SURVOL ---");
const a = await scene("survol", async () => { await page.mouse.move(50, 50); }, async () => { await page.mouse.move(boite.cx, boite.cy, { steps: 4 }); });
a.forEach((b) => console.log(" ", JSON.stringify(b)));

console.log("\n--- SORTIE ---");
const b2 = await scene("sortie", async () => { await page.mouse.move(boite.cx, boite.cy); }, async () => { await page.mouse.move(50, 50, { steps: 4 }); });
b2.forEach((b) => console.log(" ", JSON.stringify(b)));

console.log("\n--- CLIC ---");
const c = await scene("clic", async () => { await page.mouse.move(boite.cx, boite.cy); }, async () => { await page.mouse.click(boite.cx, boite.cy); });
c.forEach((b) => console.log(" ", JSON.stringify(b)));

/* film du survol : 14 images de 40 ms */
const sd = join(d, "film-survol"); mkdirSync(sd, { recursive: true });
await page.mouse.move(50, 50); await attendre(900);
for (let k = 0; k < 14; k++) {
  if (k === 1) await page.mouse.move(boite.cx, boite.cy, { steps: 2 });
  await page.screenshot({ path: join(sd, `img-${nb(k)}.png`), clip: { x: 330, y: 260, width: 440, height: 150 } });
  await attendre(38);
}

await nav.close();
console.log("\narbre.json + survol/sortie/clic.json + film-survol/ dans", d);
