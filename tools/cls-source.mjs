/* Attribution de CLS. Un chiffre de CLS sans la SOURCE ne sert a
   rien : il dit qu'il y a eu un decalage, pas ou. On enregistre
   donc chaque `layout-shift` avec ses sources et le nom des
   elements deplaces. */
import { chromium } from "playwright";
const B = process.argv[2] || "http://localhost:8099";
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => {
  try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {}
  window.__s = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (e.hadRecentInput) continue;
      window.__s.push({
        v: Number(e.value.toFixed(5)),
        t: Math.round(e.startTime),
        src: (e.sources || []).map((s) => {
          const n = s.node;
          if (!n) return "?";
          const tag = n.tagName || n.nodeName;
          const cls = (n.className && n.className.baseVal !== undefined ? n.className.baseVal : n.className) || "";
          return (tag + "." + String(cls)).slice(0, 60) +
            " [" + Math.round(s.previousRect.top) + "," + Math.round(s.previousRect.height) +
            " -> " + Math.round(s.currentRect.top) + "," + Math.round(s.currentRect.height) + "]";
        })
      });
    }
  }).observe({ type: "layout-shift", buffered: true });
});
await page.goto(B + "/", { waitUntil: "load" });
await page.mouse.move(700, 400);
await page.waitForTimeout(2400);
const h = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
for (let y = 0; y <= h; y += Math.max(1, Math.round(h / 60))) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(28);
}
const s = await page.evaluate(() => window.__s);
const total = s.reduce((a, x) => a + x.v, 0);
console.log(`CLS total ${total.toFixed(4)} sur ${s.length} decalage(s)\n`);
s.sort((a, b) => b.v - a.v).slice(0, 14).forEach((x) => {
  console.log(`  ${String(x.v).padEnd(9)} a ${String(x.t).padStart(6)} ms`);
  x.src.forEach((y) => console.log("             " + y));
});
await nav.close();
