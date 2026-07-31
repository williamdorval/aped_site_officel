/* ============================================================
   A/B APPARIE — avant / apres le chantier de structure
   `node tools/ab-structure.mjs <adresseAvant> <adresseApres> [passes]`

   POURQUOI APPARIE. Relevé du 2026-07-26, code inchangé, neuf passes :
   167, 0, 0, 0, 108, 942, 962, 981, 658 ms. La machine derive d'un
   facteur six entre la premiere passe et la derniere. Comparer deux
   medianes prises a dix minutes d'intervalle ne mesure donc pas le
   code, ca mesure l'humeur de la machine.

   On alterne A, B, A, B… dans la MEME passe, et on prend la mediane
   des DIFFERENCES. La derive s'annule d'elle-meme.

   Rend aussi le poids reellement transfere sur le chemin critique,
   qui lui n'a aucune variance.
   ============================================================ */
import { chromium } from "playwright";

const AVANT = process.argv[2] || "http://127.0.0.1:8077/";
const APRES = process.argv[3] || "http://127.0.0.1:8099/";
const PASSES = Number(process.argv[4] || 7);

async function mesure(nav, base) {
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__lcp = 0; window.__cls = 0; window.__el = "";
    new PerformanceObserver((l) => {
      const e = l.getEntries(); const d = e[e.length - 1];
      window.__lcp = d.startTime;
      window.__el = d.element ? d.element.tagName + "." + String(d.element.className).slice(0, 30) : "";
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  });
  const octets = { critique: 0, total: 0, avantPeinture: 0 };
  page.on("response", async (r) => {
    try {
      const u = r.url();
      const t = Number(r.headers()["content-length"] || 0) || (await r.body().catch(() => Buffer.alloc(0))).length;
      octets.total += t;
      if (/tokens\.css|base\.css|critique\.css|index\.html$|\/$/.test(u)) octets.critique += t;
    } catch (e) { /* reponse deja consommee */ }
  });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(2600);
  const d = await page.evaluate(() => ({ lcp: Math.round(window.__lcp), cls: +window.__cls.toFixed(4), el: window.__el }));
  d.octetsCritique = octets.critique;
  d.octetsTotal = octets.total;
  await ctx.close();
  return d;
}

const nav = await chromium.launch();
const A = [], B = [], D = [];
let elA = "", elB = "", clsA = 0, clsB = 0, koA = 0, koB = 0;

for (let i = 0; i < PASSES; i++) {
  /* on alterne l'ORDRE a chaque passe : sinon le second mesure
     toujours une machine deja chauffee par le premier. */
  const premier = i % 2 === 0;
  const a = premier ? await mesure(nav, AVANT) : null;
  const b = await mesure(nav, APRES);
  const a2 = premier ? a : await mesure(nav, AVANT);
  A.push(a2.lcp); B.push(b.lcp); D.push(b.lcp - a2.lcp);
  elA = a2.el; elB = b.el; clsA = Math.max(clsA, a2.cls); clsB = Math.max(clsB, b.cls);
  koA = a2.octetsCritique; koB = b.octetsCritique;
  console.log(`  passe ${i + 1} : avant ${String(a2.lcp).padStart(4)} ms · apres ${String(b.lcp).padStart(4)} ms · ecart ${(b.lcp - a2.lcp > 0 ? "+" : "") + (b.lcp - a2.lcp)}`);
}
await nav.close();

const med = (t) => { const x = [...t].sort((p, q) => p - q); return x[Math.floor(x.length / 2)]; };

console.log(`\nLCP mediane   avant ${med(A)} ms   apres ${med(B)} ms`);
console.log(`MEDIANE DES DIFFERENCES : ${med(D) > 0 ? "+" : ""}${med(D)} ms   ← c'est le seul chiffre qui mesure le CODE`);
console.log(`ecarts : ${JSON.stringify(D)}`);
console.log(`\nelement LCP   avant ${elA}   apres ${elB}`);
console.log(`CLS max       avant ${clsA}   apres ${clsB}`);
console.log(`chemin critique transfere   avant ${(koA / 1024).toFixed(1)} Ko   apres ${(koB / 1024).toFixed(1)} Ko   (${(((koB - koA) / koA) * 100).toFixed(1)} %)`);
