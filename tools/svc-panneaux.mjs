/* ============================================================
   SVC-PANNEAUX — les quatre panneaux de detail, fermes et ouverts.

   node tools/svc-panneaux.mjs [adresse] [largeur] [clair|sombre]

   Rend pour chacun : la hauteur du panneau, s'il DEBORDE son propre
   cadre (donc s'il defile a l'interieur de lui-meme des
   l'ouverture), le deplacement de la page a l'ouverture ET a la
   fermeture — la promesse « rien ne bouge derriere » — et les
   captures.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:8099";
const W = parseInt(process.argv[3] || "1440", 10);
const THEME = process.argv[4] || "clair";
const SORTIE = path.resolve("tools/_svc-panneaux");
fs.mkdirSync(SORTIE, { recursive: true });

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: W, height: 900 }, deviceScaleFactor: 1 });
await ctx.addInitScript((t) => {
  try {
    sessionStorage.setItem("adexweb-sans-popup", "1");
    localStorage.setItem("adexweb-theme", t === "sombre" ? "dark" : "light");
  } catch (e) {}
}, THEME);
const p = await ctx.newPage();
const err = [];
p.on("console", (m) => { if (m.type() === "error") err.push(m.text()); });
p.on("pageerror", (e) => err.push(String(e)));

await p.goto(BASE + "/index.html", { waitUntil: "load" });
await p.waitForTimeout(2500);
await p.evaluate(async () => {
  for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => requestAnimationFrame(r)); }
  window.scrollTo(0, 0);
});
await p.waitForTimeout(300);

const R = [];
for (const id of ["svc-01", "svc-02", "svc-03", "svc-04"]) {
  /* On amene le chantier par son ANCRE, comme un visiteur qui clique
     l'index — c'est aussi ce qui exerce `viser()`. */
  await p.evaluate((id) => { document.querySelector('.svc-index a[href="#' + id + '"]').click(); }, id);
  await p.waitForTimeout(1100);
  await p.screenshot({ path: path.join(SORTIE, `${id}-ferme-${W}-${THEME}.png`) });
  const avant = await p.evaluate(() => window.scrollY);
  await p.evaluate((id) => { document.querySelector("#" + id + " summary").click(); }, id);
  await p.waitForTimeout(800);
  const etat = await p.evaluate((id) => {
    const d = document.querySelector("#" + id + " .svc-detail");
    const inn = d.querySelector(".svc-detail-in");
    const r = d.getBoundingClientRect();
    return {
      ouvert: d.open,
      hauteur: Math.round(r.height),
      largeur: Math.round(r.width),
      /* Le panneau defile-t-il a l'interieur de lui-meme ? */
      defileDedans: inn.scrollHeight - inn.clientHeight,
      y: window.scrollY,
      voile: !!document.querySelector(".svc-porte")
    };
  }, id);
  await p.screenshot({ path: path.join(SORTIE, `${id}-ouvert-${W}-${THEME}.png`) });
  await p.keyboard.press("Escape");
  await p.waitForTimeout(700);
  const apres = await p.evaluate(() => ({ y: window.scrollY, ouverts: document.querySelectorAll(".svc-detail[open]").length }));
  R.push({ id, ...etat, bougeOuverture: etat.y - avant, bougeFermeture: apres.y - avant, ouvertsApres: apres.ouverts });
}
await nav.close();

const l = console.log;
l(`\n=========  PANNEAUX DE DETAIL · ${W} px · ${THEME}  =========\n`);
l("  id       ouvert  largeur  hauteur  defile dedans  page a l'ouverture  a la fermeture  restes ouverts");
for (const r of R) {
  l("  " + r.id.padEnd(8) + " " + String(r.ouvert).padEnd(7) +
    String(r.largeur).padStart(7) + "  " + String(r.hauteur).padStart(7) + "  " +
    String(r.defileDedans).padStart(13) + "  " + String(r.bougeOuverture).padStart(18) + "  " +
    String(r.bougeFermeture).padStart(14) + "  " + String(r.ouvertsApres).padStart(14));
}
l("\n  deplacement maximal de la page : " + Math.max(...R.map((r) => Math.max(Math.abs(r.bougeOuverture), Math.abs(r.bougeFermeture)))) + " px   (promesse : 0)");
l("  panneaux qui defilent a l'interieur d'eux-memes : " + R.filter((r) => r.defileDedans > 0).length + " / 4");
l("\nERREURS CONSOLE : " + (err.length ? err.join(" | ") : "aucune"));
l("Captures : " + SORTIE + "\n");
