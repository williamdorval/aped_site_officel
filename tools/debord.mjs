/* Qui déborde ? `node tools/debord.mjs [largeur]` */
import { chromium } from "playwright";
const BASE = process.env.ADEXWEB_BASE || "http://localhost:8099";
const W = Number(process.argv[2] || 390);

const browser = await chromium.launch();
for (const w of [320, 360, W, 430, 768]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      const b = el.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) continue;
      if (b.right > vw + 0.5 || b.left < -0.5) {
        out.push({
          sel: el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") +
               (typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : ""),
          left: Math.round(b.left), right: Math.round(b.right), w: Math.round(b.width)
        });
      }
    }
    return { vw, scrollW: document.documentElement.scrollWidth, out: out.slice(0, 14) };
  });
  console.log(`\n--- ${w}px : scrollWidth ${r.scrollW} pour ${r.vw}`);
  r.out.forEach(o => console.log(`    ${o.sel}  [${o.left} → ${o.right}]  l=${o.w}`));
  await ctx.close();
}
await browser.close();
