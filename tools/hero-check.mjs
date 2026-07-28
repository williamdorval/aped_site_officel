/* Vérification ciblée du hero : la plaque est-elle entière ?
   `node tools/hero-check.mjs` */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.APED_BASE || "http://localhost:8099";
const OUT = path.resolve("refonte-captures/hero");
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

for (const [nom, w, h, theme] of [
  ["1920-clair", 1920, 1080, "light"],
  ["1440-clair", 1440, 900, "light"],
  ["1440-sombre", 1440, 900, "dark"],
  ["1024-clair", 1024, 768, "light"],
  ["390-clair", 390, 844, "light"]
]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", e => errs.push(String(e)));
  page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await page.addInitScript(t => { try { localStorage.setItem("aped-theme", t); } catch (e) {} }, theme);
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(2600);

  const m = await page.evaluate(() => {
    const host = document.getElementById("heroPlate");
    const l = window.__heroLayout ? window.__heroLayout() : null;
    const f = window.__heroField;
    const r = host.getBoundingClientRect();
    let horsCadre = 0, minY = 1e9, maxY = -1e9;
    if (f && f.tgt) {
      for (let i = 0; i < f.n; i++) {
        const y = f.tgt[i * 2 + 1], x = f.tgt[i * 2];
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (y < 0 || x < 0 || y > f.ch - 1 || x > f.cw - 1) horsCadre++;
      }
    }
    return {
      cadre: { w: Math.round(r.width), h: Math.round(r.height) },
      grains: host.getAttribute("data-grains"),
      echelle: l ? Math.round(l.echelle * 1000) / 1000 : null,
      emprise: l ? Math.round(l.emprise) : null,
      blockH: l ? Math.round(l.blockH) : null,
      bigCap: l ? Math.round(l.bigCap) : null,
      smallCap: l ? Math.round(l.smallCap) : null,
      minY: Math.round(minY), maxY: Math.round(maxY),
      horsCadre
    };
  });

  await page.locator("#heroPlate").screenshot({ path: path.join(OUT, "plaque-" + nom + ".png") });
  await page.screenshot({ path: path.join(OUT, "hero-" + nom + ".png") });
  console.log(nom, JSON.stringify(m), errs.length ? "ERREURS: " + errs.join(" | ") : "");
  await ctx.close();
}

await browser.close();
