/* Les titres de section : coupés ou pas, à mi-animation et à la fin. */
import { chromium } from "playwright";
import fs from "node:fs"; import path from "node:path";
const OUT = path.resolve("refonte-captures/titres"); fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
for (const [w,h] of [[1440,900],[390,844]]) {
  const c = await b.newContext({ viewport: { width: w, height: h } });
  const p = await c.newPage();
  await p.goto("http://localhost:8099/", { waitUntil: "load" });
  await p.waitForTimeout(1500);
  const ids = ["services","realisations","demos","calculateur","comparatif","processus","contact"];
  const res = [];
  for (const id of ids) {
    await p.evaluate(i => { const e = document.getElementById(i); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 40); }, id);
    await p.waitForTimeout(1400);
    res.push(await p.evaluate(i => {
      const h2 = document.querySelector("#" + i + " .head h2");
      if (!h2) return { id: i, absent: true };
      const lignes = [...h2.querySelectorAll(".ligne")];
      const coupe = lignes.some(l => getComputedStyle(l).clipPath !== "none" &&
        !/inset\(0(px)? 0(px)? 0(px)? 0(px)?\)|none/.test(getComputedStyle(l).clipPath));
      return { id: i, texte: h2.textContent.replace(/\s+/g," ").trim(), lignes: lignes.length,
        clip: lignes.map(l => getComputedStyle(l).clipPath).join(" | "), coupe,
        deborde: h2.scrollWidth > h2.clientWidth + 1 };
    }, id));
  }
  console.log(w + "px", JSON.stringify(res, null, 1));
  await p.evaluate(() => document.getElementById("demos").scrollIntoView());
  await p.waitForTimeout(1400);
  await p.screenshot({ path: path.join(OUT, "titres-" + w + ".png") });
  await c.close();
}
await b.close();
