/* ============================================================
   L'AVANT DEBORDE-T-IL A DROITE DE LA POIGNEE ?
   `node tools/ba-deborde.mjs [port]`

   Signale le 2026-07-31 : « le cote AVANT se duplique et deborde
   pendant le defilement lateral ». Une couche a largeur entiere qui
   echappe au rognage deborde exactement comme ca — la piste d'une
   scene epinglee fait 306 cqw dans un cadre qui en fait 100.
   ============================================================ */
/* L'AVANT DEBORDE-T-IL A DROITE DE LA POIGNEE ?
   On ne juge pas a l'oeil : on photographie DEUX FOIS le meme etat —
   une fois tel quel, une fois avec le cote « avant » rendu invisible
   — et on compare la bande situee A DROITE de la coupe. Si les deux
   images y different, c'est que l'avant y peint quelque chose, et
   c'est exactement le defaut signale. */
import { chromium } from "playwright";
import { decodePNG, diffStats } from "./_png.mjs";
import fs from "node:fs";
import path from "node:path";

const PORT = process.argv[2] || "8123";
const OUT = path.join("preuves", "chantier5-realisations", "coupe");
fs.mkdirSync(OUT, { recursive: true });

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => { try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
const p = await ctx.newPage();
await p.goto(`http://localhost:${PORT}/index.html`, { waitUntil: "networkidle" });
await p.waitForTimeout(1400);

const poser = (i, frac) => p.evaluate(({ i, frac }) => {
  const a = document.querySelector("#" + i), v = a.querySelector("[data-ba-vitre]"), s = a.querySelector(".ba-scene");
  const el = a.querySelector(".ba-bande");
  if (!el) { v.scrollTop = frac * (v.scrollHeight - v.clientHeight); return; }
  const d = (el.getAttribute("data-ba-bande") || "").split(/\s+/).map(Number);
  const W = s.clientWidth, fen = (s.clientHeight / W) * 100;
  const hAp = (a.querySelector(".ba-vue--apres .ba-page").scrollHeight / W) * 100;
  const [y, h, course] = d;
  const lb = Math.max(h, course);
  const tot = y + lb + Math.max(0, Math.max(0, hAp - fen) - (y + h));
  v.scrollTop = ((y + frac * lb) / tot) * (v.scrollHeight - v.clientHeight);
}, { i, frac });

const R = [];
for (const id of ["ba-design", "ba-restaurant"]) {
  await p.evaluate((i) => document.getElementById(i).scrollIntoView({ block: "center", behavior: "instant" }), id);
  await p.waitForTimeout(800);
  const scene = await p.$("#" + id + " .ba-scene");
  for (const pg of [25, 50, 75]) {
    await p.evaluate(({ i, v }) => {
      const c = document.querySelector("#" + i + " [data-ba-curseur]");
      c.value = v; c.dispatchEvent(new Event("input", { bubbles: true }));
    }, { i: id, v: pg });
    for (const f of [0, 0.25, 0.5, 0.75, 1]) {
      await poser(id, f);
      await p.waitForTimeout(320);
      const box = await p.evaluate((i) => {
        const r = document.querySelector("#" + i + " .ba-scene").getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      }, id);
      /* La bande a mesurer : de la coupe + 3 px jusqu'au bord droit.
         Les 3 px de marge evitent de compter le filet de la poignee
         lui-meme, qui est legitime. */
      const x0 = Math.round(box.x + box.w * (pg / 100) + 3);
      const larg = Math.round(box.x + box.w - x0);
      if (larg < 20) continue;
      const clip = { x: x0, y: Math.round(box.y), width: larg, height: Math.round(box.h) };

      const a = path.join(OUT, `${id}-p${pg}-f${Math.round(f * 100)}-avec.png`);
      await p.screenshot({ path: a, clip });
      await p.evaluate((i) => { document.querySelector("#" + i + " .ba-vue--avant").style.visibility = "hidden"; }, id);
      await p.waitForTimeout(140);
      const b = path.join(OUT, `${id}-p${pg}-f${Math.round(f * 100)}-sans.png`);
      await p.screenshot({ path: b, clip });
      await p.evaluate((i) => { document.querySelector("#" + i + " .ba-vue--avant").style.visibility = ""; }, id);
      await p.waitForTimeout(140);

      const d = diffStats(decodePNG(fs.readFileSync(a)), decodePNG(fs.readFileSync(b)), 10);
      R.push({ id, poignee: pg + " %", bande: Math.round(f * 100) + " %", largeurMesuree: larg, ecart: +d.pct.toFixed(2) });
    }
  }
}
console.table(R);
const pires = R.filter((x) => x.ecart > 0.5).sort((a, b) => b.ecart - a.ecart);
console.log(pires.length
  ? `\nDEBORDEMENT : ${pires.length} position(s) ou l'avant peint a droite de la coupe. Pire : ${pires[0].id} poignee ${pires[0].poignee} bande ${pires[0].bande} — ${pires[0].ecart} %`
  : "\nAUCUN DEBORDEMENT : l'avant ne peint jamais a droite de la coupe.");
await nav.close();
process.exit(pires.length ? 1 : 0);
