/* Capture ciblée d'une section. `node tools/vue.mjs #contact [largeur] [theme] [decalage]` */
import { chromium } from "playwright";
import path from "node:path";
const BASE = "http://localhost:8099";
const sel = process.argv[2];
const W = Number(process.argv[3] || 1440);
const theme = process.argv[4] || "light";
const dy = Number(process.argv[5] || 0);
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: W, height: Math.round(W * 0.625) }, colorScheme: theme });
const p = await c.newPage();
await p.addInitScript(t => { try { localStorage.setItem("adexweb-theme", t); } catch (e) {} }, theme);
await p.goto(BASE + "/", { waitUntil: "load" });
await p.waitForTimeout(1500);
await p.evaluate(([s, d]) => {
  const el = document.querySelector(s);
  const y = el.getBoundingClientRect().top + window.scrollY + d;
  window.scrollTo(0, y - 20);
}, [sel, dy]);
await p.waitForTimeout(1400);
const nom = "refonte-captures/vue/" + sel.replace(/[^a-z0-9]/gi, "") + "-" + W + "-" + theme + (dy ? "-" + dy : "") + ".png";
await p.screenshot({ path: path.resolve(nom) });
console.log(nom);
await b.close();
