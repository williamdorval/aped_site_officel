/* ============================================================
   SONDE 2 — fullstack-studio : la revelation est-elle SCRUBBEE ?
   La sonde 1 n'a rien releve en approchant a 60 Hz : signe que
   l'opacite ne suit pas le TEMPS mais la POSITION de defilement.
   On trace donc opacite = f(scrollY), ligne par ligne.
   ============================================================ */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const d = join(process.cwd(), "tools", "_refs", "accueil", "1-fullstack-studio");
mkdirSync(d, { recursive: true });
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const nb = (n) => String(n).padStart(2, "0");

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://fullstack-studio.webflow.io/", { waitUntil: "networkidle", timeout: 60000 });
await attendre(3000);

/* structure exacte d'un bloc revele */
const struct = await page.evaluate(() => {
  const inner = document.querySelector(".text-highlight_inner");
  if (!inner) return null;
  const out = [];
  let n = inner;
  for (let i = 0; i < 4 && n; i++) {
    const cs = getComputedStyle(n);
    out.unshift({ prof: -i, tag: n.tagName, cls: String(n.className).slice(0, 60), o: cs.opacity, col: cs.color, pos: cs.position, ov: cs.overflow, clip: cs.clipPath, tf: cs.transform, txt: (n.textContent || "").trim().slice(0, 50) });
    n = n.parentElement;
  }
  const par = inner.parentElement;
  [...par.children].forEach((c) => { const cs = getComputedStyle(c); out.push({ prof: 1, tag: c.tagName, cls: String(c.className).slice(0, 60), o: cs.opacity, col: cs.color, pos: cs.position, txt: (c.textContent || "").trim().slice(0, 50) }); });
  return out;
});
console.log("--- structure d'une ligne revelee ---");
console.log(JSON.stringify(struct, null, 1));

/* trace opacite = f(scrollY) sur le premier bloc */
const trace = await page.evaluate(async () => {
  const lignes = [...document.querySelectorAll(".text-highlight_inner")].slice(0, 4);
  const docY = lignes[0].getBoundingClientRect().top + window.scrollY;
  const pts = [];
  for (let y = Math.max(0, docY - 1000); y <= docY + 200; y += 25) {
    window.scrollTo({ top: y, behavior: "instant" });
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    pts.push({ y, o: lignes.map((l) => +getComputedStyle(l).opacity.slice(0, 5)), top: Math.round(lignes[0].getBoundingClientRect().top) });
  }
  return { docY: Math.round(docY), pts, vh: window.innerHeight };
});

console.log("\n--- opacite = f(scrollY), 4 lignes, bloc a docY", trace.docY, "vh", trace.vh, "---");
trace.pts.forEach((p) => { if (p.o.some((v) => v > 0.001 && v < 0.999) || p.o.some((v) => v > 0.999)) console.log(`  scrollY=${p.y}  topEcran=${p.top}  op=[${p.o.join(", ")}]`); });

/* fenetre utile : ou chaque ligne passe de 0 a 1 */
const fenetres = trace.pts[0].o.map((_, i) => {
  const deb = trace.pts.find((p) => p.o[i] > 0.01);
  const fin = trace.pts.find((p) => p.o[i] > 0.99);
  return { ligne: i, debut_scrollY: deb ? deb.y : null, fin_scrollY: fin ? fin.y : null, course_px: deb && fin ? fin.y - deb.y : null, topEcran_debut: deb ? deb.top : null, topEcran_fin: fin ? fin.top : null };
});
console.log("\n--- fenetre de revelation par ligne ---");
fenetres.forEach((f) => console.log("  ", JSON.stringify(f)));
const dec = fenetres.filter((f) => f.debut_scrollY != null).map((f) => f.debut_scrollY);
console.log("  decalage entre lignes (px de defilement) :", dec.slice(1).map((v, i) => v - dec[i]));

/* film de la revelation, 14 images */
const sd = join(d, "film-revelation"); mkdirSync(sd, { recursive: true });
const y0 = fenetres[0].debut_scrollY != null ? fenetres[0].debut_scrollY - 60 : trace.docY - 900;
for (let k = 0; k < 14; k++) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y0 + k * 45);
  await attendre(90);
  await page.screenshot({ path: join(sd, `img-${nb(k)}.png`), clip: { x: 120, y: 120, width: 1200, height: 620 } });
}

/* --- les cartes inclinees : geometrie exacte de l'arc --- */
const arc = await page.evaluate(() => {
  const items = [...document.querySelectorAll(".arc-marquee_item")].slice(0, 14);
  const par = items[0] ? items[0].parentElement : null;
  const csp = par ? getComputedStyle(par) : null;
  return {
    parent: par ? { cls: String(par.className).slice(0, 50), w: Math.round(par.getBoundingClientRect().width), h: Math.round(par.getBoundingClientRect().height), tf: csp.transform, persp: csp.perspective, ov: csp.overflow } : null,
    items: items.map((el) => {
      const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
      const m = String(cs.transform).match(/matrix\(([^)]+)\)/);
      const ang = m ? +(Math.atan2(+m[1].split(",")[1], +m[1].split(",")[0]) * 180 / Math.PI).toFixed(2) : 0;
      return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top), angle: ang, radius: cs.borderRadius, ombre: cs.boxShadow.slice(0, 50), ov: cs.overflow };
    }),
  };
});
console.log("\n--- arc de cartes ---");
console.log(JSON.stringify(arc, null, 1).slice(0, 2600));

writeFileSync(join(d, "revelation2.json"), JSON.stringify({ struct, trace, fenetres, arc }, null, 2));
await nav.close();
console.log("\nrevelation2.json ecrit");
