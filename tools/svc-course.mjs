/* ============================================================
   SVC-COURSE — la course du rail, du tout premier ecran au tout
   dernier, en captures ET en chiffres.

   node tools/svc-course.mjs [adresse] [largeur] [clair|sombre] [pas]

   Ce que l'outil repond, et c'est tout ce qu'il repond :

   1 · Y A-T-IL DU VIDE A L'ENTREE ?  On mesure la hauteur de scene
       qui ne porte AUCUN pixel de chantier au premier ecran ou la
       scene est collee. Un vide, c'est un chantier absent — pas une
       impression.
   2 · LE DERNIER SE CALE-T-IL ?  Au dernier pas, le dernier
       chantier est-il ENTIEREMENT dans la vitre, et le rail
       a-t-il fini sa course (scrollLeft == max) ?
   3 · LE MOUVEMENT SE VOIT-IL ?  Ecart de pixels entre deux
       captures consecutives — la regle B du projet.

   Les captures sortent dans `tools/_svc-course/`.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { decodePNG, diffStats } from "./_png.mjs";

const BASE = process.argv[2] || "http://127.0.0.1:8123";
const W = parseInt(process.argv[3] || "1440", 10);
const THEME = process.argv[4] || "clair";
const PAS = parseInt(process.argv[5] || "10", 10);
const OUT = path.join("tools", "_svc-course");

if (!Number.isFinite(W) || !Number.isFinite(PAS) || PAS < 3) {
  console.log("largeur ou pas illisible.");
  process.exit(2);
}
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const nav = await chromium.launch();
const ctx = await nav.newContext({
  viewport: { width: W, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: THEME === "sombre" ? "dark" : "light",
});
/* PIEGE 18 — le popup cadeau bloque tout outil qui clique. */
await ctx.addInitScript(() => {
  try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {}
});
const page = await ctx.newPage();
const erreurs = [];
page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
await page.goto(BASE + "/index.html", { waitUntil: "networkidle" });
await page.waitForTimeout(1400);

/* --- 1 · GEOMETRIE --- */
const geo = await page.evaluate(() => {
  const piste = document.querySelector("[data-svc-piste]");
  const scene = document.querySelector("[data-svc-scene]");
  const vitre = document.querySelector(".svc-vitre");
  if (!piste || !scene || !vitre) return null;
  const st = getComputedStyle(scene);
  return {
    colle: st.position,
    top: parseFloat(st.top) || 0,
    piste: piste.offsetHeight,
    scene: scene.offsetHeight,
    course: Math.max(0, piste.offsetHeight - scene.offsetHeight),
    haut: window.scrollY + piste.getBoundingClientRect().top,
    items: document.querySelectorAll(".svc-plan").length,
    max: vitre.scrollWidth - vitre.clientWidth,
    vitreW: vitre.clientWidth,
  };
});
if (!geo) { console.log("SECTION ABSENTE — rien a mesurer."); await nav.close(); process.exit(1); }

console.log(`SVC-COURSE · ${W} px · ${THEME}`);
console.log(`  scene       : ${geo.colle}, top ${geo.top} px, hauteur ${geo.scene} px`);
console.log(`  piste       : ${geo.piste} px   course ${geo.course} px  (${(geo.course / 900).toFixed(2)} ecrans)`);
console.log(`  items       : ${geo.items}      course laterale max ${Math.round(geo.max)} px`);
if (geo.colle !== "sticky") console.log("  !! LE RAIL N'EST PAS ARME — la suite ne mesure rien.");

/* --- 2 · LA COURSE, PAS A PAS --- */
const lignes = [];
for (let i = 0; i < PAS; i++) {
  const t = i / (PAS - 1);
  const y = Math.round(geo.haut - geo.top + t * geo.course);
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(240);

  const m = await page.evaluate(() => {
    const vitre = document.querySelector(".svc-vitre");
    const plans = [...document.querySelectorAll(".svc-plan")];
    const vb = vitre.getBoundingClientRect();
    const cartes = plans.map((p) => {
      const b = p.getBoundingClientRect();
      const dedans = Math.max(0, Math.min(b.right, vb.right) - Math.max(b.left, vb.left));
      return {
        id: p.id,
        gauche: Math.round(b.left - vb.left),
        largeur: Math.round(b.width),
        part: b.width > 0 ? dedans / b.width : 0,
        actif: p.hasAttribute("data-actif"),
      };
    });
    /* LE VIDE : la bande verticale de la scene ou aucun chantier ne
       pose de pixel. On la mesure sur la VITRE, pas sur la scene :
       la tete et le pied ne sont pas du vide, ils portent du texte. */
    const visibles = cartes.filter((c) => c.part > 0.02);
    const roul = document.querySelector("[data-svc-compte]");
    return {
      scrollLeft: Math.round(vitre.scrollLeft),
      cartes,
      visibles: visibles.length,
      pleines: cartes.filter((c) => c.part > 0.995).length,
      actif: (cartes.find((c) => c.actif) || {}).id || "—",
      compte: roul ? roul.textContent.trim() : "—",
      vitreHaut: Math.round(vitre.getBoundingClientRect().top),
      vitreBas: Math.round(vitre.getBoundingClientRect().bottom),
    };
  });

  const f = path.join(OUT, `${String(i).padStart(2, "0")}.png`);
  await page.screenshot({ path: f });
  lignes.push({ i, t, y, ...m, f });
}

console.log("\nPAS   p      scrollLeft   visibles  entieres  actif      cartes (gauche/part)");
for (const l of lignes) {
  const det = l.cartes.map((c) => `${c.id.replace("svc-", "")}:${c.gauche}/${(c.part * 100).toFixed(0)}%`).join(" ");
  console.log(
    `${String(l.i).padStart(2)}   ${l.t.toFixed(2)}   ${String(l.scrollLeft).padStart(6)}       ` +
    `${String(l.visibles).padStart(2)}        ${String(l.pleines).padStart(2)}      ${l.actif.padEnd(9)}  ${det}`
  );
}

/* --- 3 · LES DEUX VERDICTS --- */
const p0 = lignes[0], pN = lignes[lignes.length - 1];
const premier = p0.cartes[0];
const dernierSvc = p0.cartes.filter((c) => c.id && c.id !== "svc-fin").pop();
const dernierIdx = p0.cartes.findIndex((c) => c.id === (dernierSvc || {}).id);

console.log("\nVERDICT 1 — L'ENTREE");
console.log(`  au tout premier ecran : ${p0.visibles} carte(s) visible(s), la 01 a ${(premier.part * 100).toFixed(0)} %`);
console.log(`  bord gauche de la 01  : ${premier.gauche} px de la vitre`);
/* La 01 doit etre calee A LA MARGE du rail, pas au bord de la vitre :
   c'est la meme marge que le texte de la page. */
const marge = await page.evaluate(() => {
  const r = document.querySelector(".svc-planche");
  return r ? parseFloat(getComputedStyle(r).paddingLeft) || 0 : 0;
});
const entreeOK = premier.part > 0.98 && Math.abs(premier.gauche - marge) < 8;
console.log(`  ${entreeOK ? "OK — le 01 est en position des l'entree." : "ECHEC — le 01 n'est pas cale a l'entree."}`);

console.log("\nVERDICT 2 — LA SORTIE");
const dc = pN.cartes[dernierIdx];
console.log(`  au tout dernier ecran : scrollLeft ${pN.scrollLeft} / max ${Math.round(geo.max)}`);
console.log(`  le dernier service (${dc.id}) : ${(dc.part * 100).toFixed(0)} % visible`);
const sortieOK = dc.part > 0.98 && Math.abs(pN.scrollLeft - geo.max) < 6;
console.log(`  ${sortieOK ? "OK — la course va au bout et le dernier service est entier." : "ECHEC — la course s'arrete avant, ou le dernier est coupe."}`);

/* --- 4 · LE MOUVEMENT SE VOIT-IL --- */
console.log("\nVERDICT 3 — LE MOUVEMENT (regle B)");
let mini = 100;
for (let i = 1; i < lignes.length; i++) {
  const a = decodePNG(fs.readFileSync(lignes[i - 1].f));
  const b = decodePNG(fs.readFileSync(lignes[i].f));
  const d = a.width === b.width && a.height === b.height ? diffStats(a, b, 8).pct : 100;
  if (d < mini) mini = d;
  console.log(`  ${String(i - 1).padStart(2)} -> ${String(i).padStart(2)} : ${d.toFixed(2)} %`);
}
console.log(`  ecart minimal entre deux images : ${mini.toFixed(2)} %  ${mini >= 0.5 ? "— le mouvement se voit." : "— TROP FAIBLE, il ne se voit pas."}`);

console.log(`\nerreurs console : ${erreurs.length}`);
for (const e of erreurs.slice(0, 6)) console.log("  " + e);
console.log(`captures : ${OUT}`);
await nav.close();
process.exit(entreeOK && sortieOK && erreurs.length === 0 ? 0 : 1);
