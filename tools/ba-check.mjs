/* ============================================================
   BA-CHECK — les quatre comparaisons avant / apres.

   node tools/ba-check.mjs [port]

   1 · LE CURSEUR      trois positions par comparaison (0, 50, 100),
                       capturees, avec l'ecart de pixels entre elles.
                       « Visible, sinon ca ne compte pas. »
   2 · LE CLAVIER      fleches, Home, End — et `aria-valuetext` doit
                       dire autre chose qu'un nombre nu.
   3 · LA BOUCLE       cinq captures de la maquette qui defile, et
                       l'ecart entre deux consecutives.
   4 · L'ARRET         hors du viewport, au survol, sous mouvement
                       reduit et au palier 2.
   5 · SANS SCRIPT     le partage est a 50 % et la poignee ne
                       s'affiche pas — rien d'inerte a glisser.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { decodePNG, diffStats } from "./_png.mjs";

const PORT = process.argv[2] || "8123";
const BASE = `http://127.0.0.1:${PORT}/index.html`;
const OUT = path.join("tools", "_ba");
const CARTES = ["ba-garage", "ba-design", "ba-restaurant", "ba-renovation"];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let echecs = 0;
const dire = (ok, txt) => { if (!ok) echecs++; console.log(`  ${ok ? "OK    " : "ECHEC "} ${txt}`); };
const lire = (f) => decodePNG(fs.readFileSync(f));

const nav = await chromium.launch();

async function page(opts = {}) {
  const ctx = await nav.newContext({
    viewport: { width: opts.w || 1440, height: opts.h || 1000 },
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: opts.reduit ? "reduce" : "no-preference",
    javaScriptEnabled: opts.js !== false,
  });
  await ctx.addInitScript(() => { try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  const p = await ctx.newPage();
  p.on("console", (m) => { if (m.type() === "error") { echecs++; console.log("  ECHEC  console : " + m.text()); } });
  await p.goto(BASE, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  return { ctx, p };
}

/* ---------- 1 · LE CURSEUR, TROIS POSITIONS ---------- */
console.log("1 · LE CURSEUR — trois positions par comparaison");
{
  const { ctx, p } = await page();
  for (const id of CARTES) {
    await p.evaluate((i) => document.getElementById(i).scrollIntoView({ block: "center" }), id);
    /* On fige la boucle : sinon on mesure le defilement, pas le curseur. */
    await p.evaluate((i) => {
      document.querySelectorAll("#" + i + " .ba-page").forEach((e) => {
        e.style.animation = "none";
        e.style.transform = "none";
      });
    }, id);
    await p.waitForTimeout(320);
    const fics = [];
    for (const v of [0, 50, 100]) {
      await p.evaluate(([i, val]) => {
        const c = document.querySelector("#" + i + " [data-ba-curseur]");
        c.value = val;
        c.dispatchEvent(new Event("input", { bubbles: true }));
      }, [id, v]);
      await p.waitForTimeout(240);
      const f = path.join(OUT, `${id}-${String(v).padStart(3, "0")}.png`);
      await (await p.$("#" + id + " .ba-scene")).screenshot({ path: f });
      fics.push(f);
    }
    const a = lire(fics[0]), b = lire(fics[1]), c2 = lire(fics[2]);
    const d1 = diffStats(a, b, 8).pct, d2 = diffStats(b, c2, 8).pct, d3 = diffStats(a, c2, 8).pct;
    dire(d1 > 8 && d2 > 8 && d3 > 40,
      `${id} : 0→50 ${d1.toFixed(1)} % · 50→100 ${d2.toFixed(1)} % · 0→100 ${d3.toFixed(1)} %`);
  }
  await ctx.close();
}

/* ---------- 2 · LE CLAVIER ---------- */
console.log("\n2 · LE CLAVIER");
{
  const { ctx, p } = await page();
  await p.evaluate(() => document.getElementById("ba-garage").scrollIntoView({ block: "center" }));
  await p.waitForTimeout(320);
  const c = await p.$("#ba-garage [data-ba-curseur]");
  await c.focus();
  const lis = () => p.evaluate(() => {
    const e = document.querySelector("#ba-garage [data-ba-curseur]");
    return {
      v: Number(e.value),
      t: e.getAttribute("aria-valuetext"),
      p: getComputedStyle(document.querySelector("#ba-garage .ba-scene")).getPropertyValue("--ba-p").trim(),
    };
  });
  const d = await lis();
  await p.keyboard.press("ArrowRight");
  const r = await lis();
  await p.keyboard.press("ArrowLeft"); await p.keyboard.press("ArrowLeft");
  const g = await lis();
  await p.keyboard.press("Home");
  const h = await lis();
  await p.keyboard.press("End");
  const e2 = await lis();
  dire(r.v > d.v, `fleche droite : ${d.v} → ${r.v}`);
  dire(g.v < r.v, `fleche gauche : ${r.v} → ${g.v}`);
  dire(h.v === 0, `Home : ${h.v}`);
  dire(e2.v === 100, `End : ${e2.v}`);
  dire(String(e2.p) === "100", `la variable suit la touche : --ba-p = ${e2.p}`);
  dire(!!e2.t && /%/.test(e2.t) && e2.t.length > 6, `aria-valuetext dit autre chose qu'un nombre : « ${e2.t} »`);
  const anneau = await p.evaluate(() => {
    const e = document.querySelector("#ba-garage [data-ba-curseur]");
    e.focus();
    const cs = getComputedStyle(e);
    return cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
  });
  dire(anneau, "un anneau de focus existe");
  const tact = await p.evaluate(() => getComputedStyle(document.querySelector("#ba-garage [data-ba-curseur]")).touchAction);
  dire(tact === "pan-y", `touch-action = ${tact} — le doigt garde le defilement vertical`);
  await ctx.close();
}

/* ---------- 3 · LA BOUCLE DE DEFILEMENT ---------- */
console.log("\n3 · LA BOUCLE — cinq captures et l'ecart entre deux consecutives");
{
  const { ctx, p } = await page();
  await p.evaluate(() => document.getElementById("ba-garage").scrollIntoView({ block: "center" }));
  await p.waitForTimeout(600);
  const vif = await p.evaluate(() => document.querySelector("#ba-garage .ba-scene").hasAttribute("data-vif"));
  dire(vif, "la scene visible porte `data-vif`");
  const fics = [];
  for (let i = 0; i < 5; i++) {
    const f = path.join(OUT, `boucle-${i}.png`);
    await (await p.$("#ba-garage .ba-scene")).screenshot({ path: f });
    fics.push(f);
    await p.waitForTimeout(2400);
  }
  let mini = 100;
  for (let i = 1; i < fics.length; i++) {
    const d = diffStats(lire(fics[i - 1]), lire(fics[i]), 8).pct;
    if (d < mini) mini = d;
    console.log(`         ${i - 1} → ${i} : ${d.toFixed(2)} %`);
  }
  dire(mini > 0.4, `ecart minimal entre deux images : ${mini.toFixed(2)} % — le mouvement se voit`);

  await p.hover("#ba-garage .ba-scene");
  await p.waitForTimeout(420);
  const t1 = await p.evaluate(() => getComputedStyle(document.querySelector("#ba-garage .ba-page")).animationPlayState);
  dire(t1 === "paused", `au survol : animation-play-state = ${t1}`);

  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(800);
  const t2 = await p.evaluate(() => document.querySelector("#ba-garage .ba-scene").hasAttribute("data-vif"));
  dire(!t2, "hors du viewport : `data-vif` retire");
  await ctx.close();
}

/* ---------- 4 · MOUVEMENT REDUIT ET PALIER 2 ---------- */
console.log("\n4 · L'ARRET — mouvement reduit, palier 2");
{
  const { ctx, p } = await page({ reduit: true });
  await p.evaluate(() => document.getElementById("ba-garage").scrollIntoView({ block: "center" }));
  await p.waitForTimeout(700);
  const m = await p.evaluate(() => {
    const pg = document.querySelector("#ba-garage .ba-page");
    const df = document.querySelector("#ba-garage .v11-defile span");
    return {
      page: getComputedStyle(pg).animationName,
      defile: df ? getComputedStyle(df).animationName : "—",
      pad: df ? getComputedStyle(df).paddingLeft : "—",
      partage: getComputedStyle(document.querySelector("#ba-garage .ba-scene")).getPropertyValue("--ba-p").trim(),
    };
  });
  dire(m.page === "none", `la page ne defile plus (${m.page})`);
  dire(m.defile === "none", `le texte defilant s'arrete (${m.defile})`);
  dire(m.pad === "0px", `et il reste LISIBLE a l'arret : padding-left = ${m.pad}`);
  dire(m.partage === "50", `le partage reste a 50 : ${m.partage}`);
  await ctx.close();

  const { ctx: c2, p: p2 } = await page();
  await p2.evaluate(() => document.documentElement.setAttribute("data-palier", "2"));
  await p2.evaluate(() => document.getElementById("ba-garage").scrollIntoView({ block: "center" }));
  await p2.waitForTimeout(520);
  const n = await p2.evaluate(() => getComputedStyle(document.querySelector("#ba-garage .ba-page")).animationName);
  dire(n === "none", `palier 2 : la boucle tombe (${n})`);
  await c2.close();
}

/* ---------- 5 · SANS SCRIPT ---------- */
console.log("\n5 · SANS SCRIPT");
{
  const { ctx, p } = await page({ js: false });
  const s = await p.evaluate(() => ({
    cadre: getComputedStyle(document.querySelector("#ba-garage .ba-cadre")).display,
    note: getComputedStyle(document.querySelector(".ba-sans")).display,
    legendes: document.querySelectorAll(".ba-dit").length,
    avant: !!document.querySelector("#ba-garage .ba-vue--avant"),
    apres: !!document.querySelector("#ba-garage .ba-vue--apres"),
  }));
  /* Sans script, `differe.css` n'est jamais injecte : les maquettes
     n'auraient AUCUN style. On verifie qu'elles sont retirees et que
     ce qu'elles disent reste lisible en mots. */
  dire(s.cadre === "none", `le cadre est retire (${s.cadre})`);
  dire(s.note === "block", `la ligne de repli s'affiche (${s.note})`);
  dire(s.legendes === 4, `les quatre legendes restent lues : ${s.legendes}`);
  dire(s.avant && s.apres, "les deux maquettes restent dans le document");
  await (await p.$(".ba-grille")).screenshot({ path: path.join(OUT, "sans-script.png") });
  await ctx.close();
}

console.log(`\n${echecs === 0 ? "TOUT PASSE" : echecs + " ECHEC(S)"}   captures : ${OUT}`);
await nav.close();
process.exit(echecs === 0 ? 0 : 1);
