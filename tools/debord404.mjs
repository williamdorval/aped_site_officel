import { chromium } from "playwright";
const b = await chromium.launch();
for (const [w,h] of [[320,844],[390,844],[1440,900],[1920,1080]]) {
  const c = await b.newContext({ viewport: { width: w, height: h } });
  const p = await c.newPage();
  const errs = [];
  p.on("pageerror", e => errs.push(String(e)));
  await p.goto("http://localhost:8099/nexiste-pas", { waitUntil: "load" });
  await p.waitForTimeout(1200);
  const r = await p.evaluate(() => {
    const vw = document.documentElement.clientWidth, out = [];
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height) continue;
      if (b.right > vw + 0.5 || b.left < -0.5)
        out.push(el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/)[0] : "") + ` [${Math.round(b.left)}→${Math.round(b.right)}]`);
    }
    return { vw, sw: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight, out: out.slice(0, 8) };
  });
  console.log(w, JSON.stringify(r), errs.length ? "ERR " + errs.join("|") : "");
  await c.close();
}
await b.close();
