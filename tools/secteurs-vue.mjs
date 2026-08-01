/* ============================================================
   LES APERCUS DE SECTEUR, EN IMAGES
   `node tools/secteurs-vue.mjs [port] [cle...]`

   Survole chaque secteur demande, photographie son apercu au repos
   et une fois descendu dedans, et releve ce qui compte : la course
   disponible, le nombre de tuiles, celles qui ont charge.

   « La preuve est une capture, pas une mesure. » Les chiffres ne
   sont la que pour dire ou regarder.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const PORT = process.argv[2] || "8123";
const cles = process.argv.slice(3);
const OUT = path.join("preuves", "chantier6-secteurs");
fs.mkdirSync(OUT, { recursive: true });

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => { try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
const p = await ctx.newPage();
const err = [];
p.on("console", (m) => { if (m.type() === "error") err.push(m.text()); });
p.on("pageerror", (e) => err.push("PE " + e.message));
await p.goto(`http://localhost:${PORT}/index.html`, { waitUntil: "networkidle" });
await p.evaluate(() => document.getElementById("demos").scrollIntoView({ block: "center", behavior: "instant" }));
await p.waitForTimeout(1600);

const R = [];
const tous = cles.length ? cles : await p.evaluate(() => [...document.querySelectorAll("[data-sector]")].map((b) => b.dataset.sector));
for (const cle of tous) {
  await p.hover(`[data-sector="${cle}"]`);
  await p.waitForTimeout(1100);
  const g = await p.evaluate((k) => {
    const m = document.querySelector(`.mock[data-mock="${k}"]`);
    if (!m) return { absent: true };
    const v = m.querySelector(".sec-vitre");
    if (!v) return { site: false, actif: m.classList.contains("is-on") };
    const imgs = [...v.querySelectorAll("img")];
    return {
      site: true, actif: m.classList.contains("is-on"),
      course: v.scrollHeight - v.clientHeight,
      tuiles: imgs.length,
      chargees: imgs.filter((i) => i.complete && i.naturalWidth).length
    };
  }, cle);
  const st = await p.$("#mockStage");
  await st.screenshot({ path: path.join(OUT, `${cle}.png`) });
  if (g.site) {
    await p.evaluate((k) => { document.querySelector(`.mock[data-mock="${k}"] .sec-vitre`).scrollTop = 1500; }, cle);
    await p.waitForTimeout(700);
    await st.screenshot({ path: path.join(OUT, `${cle}-bas.png`) });
    await p.evaluate((k) => { document.querySelector(`.mock[data-mock="${k}"] .sec-vitre`).scrollTop = 0; }, cle);
  }
  R.push({ secteur: cle, ...g });
}
console.table(R);
const sites = R.filter((x) => x.site);
const manquantes = sites.filter((x) => x.chargees < x.tuiles);
console.log(`${sites.length} secteur(s) en site complet sur ${R.length}`);
if (manquantes.length) console.log("tuiles pas encore demandees (chargement differe) :", manquantes.map((x) => `${x.secteur} ${x.chargees}/${x.tuiles}`).join(" · "));
console.log("erreurs console :", err.length ? err.slice(0, 3) : "aucune");
fs.writeFileSync(path.join(OUT, "rapport.json"), JSON.stringify({ secteurs: R, erreurs: err }, null, 2));
await nav.close();
