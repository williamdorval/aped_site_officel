import { chromium } from "playwright";
const B = "http://localhost:8099";
const N = Number(process.argv[2] || 5);
const b = await chromium.launch();
const med = a => { const s=[...a].sort((x,y)=>x-y); return s[Math.floor(s.length/2)]; };
for (const rideau of [true, false]) {
  const lcps = [], pires = [];
  let el = "";
  for (let i = 0; i < N; i++) {
    const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.addInitScript(r => {
      if (!r) { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} }
      window.__p = { lcp: 0, el: "", longues: [] };
      new PerformanceObserver(l => { for (const e of l.getEntries()) {
        window.__p.lcp = e.startTime;
        window.__p.el = e.element ? e.element.tagName + "." + (e.element.className || "") : "?"; } })
        .observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver(l => { for (const e of l.getEntries()) window.__p.longues.push(Math.round(e.duration)); })
        .observe({ type: "longtask", buffered: true });
    }, rideau);
    await p.goto(B + "/", { waitUntil: "load" });
    await p.waitForTimeout(2600);
    const r = await p.evaluate(() => window.__p);
    lcps.push(Math.round(r.lcp)); pires.push(Math.max(0, ...r.longues)); el = r.el;
    await c.close();
  }
  console.log(`rideau=${rideau}  LCP median ${med(lcps)} ms  (${lcps.join(", ")})  element ${el}  |  tache la plus longue, median ${med(pires)} ms (${pires.join(", ")})`);
}
await b.close();
