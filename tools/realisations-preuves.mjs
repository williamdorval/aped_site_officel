/* ============================================================
   LES PREUVES DE LA SECTION 03 · REALISATIONS
   `node tools/realisations-preuves.mjs [port]`

   Ce fichier ne MESURE rien — `ba-check.mjs` s'en charge et rend un
   verdict. Celui-ci PHOTOGRAPHIE, parce que la regle de ce chantier
   est qu'une image se prouve par une image qu'on ouvre, jamais par
   un test qui passe.

   CE QU'IL SORT, dans `preuves/chantier5-realisations/` :

   · `repos-<id>.png`        le cadre au repos : la page entiere du
                             site, dezoomee, dans son petit ecran
   · `poignee-<id>-p000/050/100.png`  la poignee a gauche, au milieu,
                             a droite
   · `defile-<id>-0..5.png`  six images d'une descente DANS le cadre,
                             avec l'ecart de pixels entre deux
   · `rangee-<largeur>.png`  deux comparaisons completes d'un seul
                             regard, avec l'air autour
   · `avant-<id>.png`        la reconstitution entiere, hors cadre —
                             c'est la qu'on verifie qu'il ne reste
                             aucun rectangle gris
   · `rapport.json`          le releve chiffre qui accompagne tout ca
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { decodePNG, diffStats } from "./_png.mjs";
import { RAPPORTS } from "./demos-rapports.mjs";

const PORT = process.argv[2] || "8123";
const BASE = `http://localhost:${PORT}/index.html`;
const OUT = path.join("preuves", "chantier5-realisations");
const CARTES = ["ba-garage", "ba-design", "ba-restaurant", "ba-renovation"];
const CLES = { "ba-garage": "garage", "ba-design": "design", "ba-restaurant": "restau", "ba-renovation": "deneigement" };

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const lire = (f) => decodePNG(fs.readFileSync(f));
const R = { pris: new Date().toISOString().slice(0, 10), blocs: {}, rangees: {}, gris: {} };

const nav = await chromium.launch();

async function ouvrir(w = 1440, h = 1000) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, colorScheme: "light" });
  await ctx.addInitScript(() => { try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  const p = await ctx.newPage();
  const erreurs = [];
  p.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
  p.on("pageerror", (e) => erreurs.push("pageerror " + e.message));
  await p.goto(BASE, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  return { ctx, p, erreurs };
}

/* ---------- 1 · LE REPOS, LA POIGNEE, LA DESCENTE ---------- */
{
  const { ctx, p, erreurs } = await ouvrir();
  for (const id of CARTES) {
    await p.evaluate((i) => document.getElementById(i).scrollIntoView({ block: "center", behavior: "instant" }), id);
    await p.waitForTimeout(800);
    const cadre = await p.$("#" + id + " .ba-cadre");
    await cadre.screenshot({ path: path.join(OUT, `repos-${id}.png`) });

    const m = await p.evaluate((i) => {
      const v = document.querySelector("#" + i + " [data-ba-vitre]");
      const av = document.querySelector("#" + i + " .ba-vue--avant");
      const ap = document.querySelector("#" + i + " .ba-vue--apres");
      const r = document.querySelector("#" + i + " .ba-cadre").getBoundingClientRect();
      return {
        cadre: `${Math.round(r.width)}x${Math.round(r.height)}`,
        vitre: `${v.clientWidth}x${v.clientHeight}`,
        pile: v.scrollHeight,
        course: v.scrollHeight - v.clientHeight,
        avant: av.querySelector(".ba-page").scrollHeight,
        apres: Math.round(ap.getBoundingClientRect().height)
      };
    }, id);

    /* La poignee, trois positions. On la GLISSE, on ne synthetise
       pas l'evenement : un evenement synthetise valide le clavier et
       le clavier seul (piege 36). */
    const b = await p.evaluate((i) => {
      const r = document.querySelector("#" + i + " .ba-scene").getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    }, id);
    const poses = [];
    for (const k of [0.02, 0.5, 0.98]) {
      await p.mouse.move(b.x + b.w * 0.5, b.y + b.h * 0.5);
      await p.mouse.down();
      await p.mouse.move(b.x + b.w * k, b.y + b.h * 0.5, { steps: 8 });
      await p.mouse.up();
      await p.waitForTimeout(180);
      const v = await p.evaluate((i) => Math.round(+getComputedStyle(document.querySelector("#" + i + " .ba-scene")).getPropertyValue("--ba-p")), id);
      poses.push(v);
      await cadre.screenshot({ path: path.join(OUT, `poignee-${id}-p${String(Math.round(k * 100)).padStart(3, "0")}.png`) });
    }

    /* La descente DANS le cadre, poignee laissee au milieu. */
    await p.evaluate((i) => {
      const c = document.querySelector("#" + i + " [data-ba-curseur]");
      c.value = 50;
      c.dispatchEvent(new Event("input", { bubbles: true }));
      document.querySelector("#" + i + " [data-ba-vitre]").scrollTop = 0;
    }, id);
    await p.waitForTimeout(250);
    const pageAvant = await p.evaluate(() => Math.round(window.scrollY));
    await p.mouse.move(b.x + b.w * 0.5, b.y + b.h * 0.5);
    const fics = [];
    const pas = Math.max(60, Math.round(m.course / 5));
    for (let i = 0; i < 6; i++) {
      const f = path.join(OUT, `defile-${id}-${i}.png`);
      await cadre.screenshot({ path: f });
      fics.push(f);
      await p.mouse.wheel(0, pas);
      await p.waitForTimeout(240);
    }
    const pageApres = await p.evaluate(() => Math.round(window.scrollY));
    const ecarts = [];
    for (let i = 1; i < fics.length; i++) ecarts.push(+diffStats(lire(fics[i - 1]), lire(fics[i]), 8).pct.toFixed(2));

    R.blocs[id] = {
      ...m,
      rapportEcrit: RAPPORTS[CLES[id]],
      rapportLu: +(m.avant / parseInt(m.vitre, 10)).toFixed(3),
      poignee: poses,
      ecartsDescente: ecarts,
      ecartMinimal: Math.min(...ecarts),
      pageDerriere: `${pageAvant} → ${pageApres}`
    };
  }
  R.erreursConsole = erreurs;
  await ctx.close();
}

/* ---------- 2 · UNE RANGEE D'UN SEUL REGARD ----------
   « On doit embrasser les deux comparaisons d'une rangee d'un seul
   regard. » Ca ne se mesure pas dans le DOM : on cadre la fenetre
   sur la premiere rangee et on regarde si elle y tient, titres
   compris. */
for (const [w, h] of [[1440, 900], [1920, 1080], [1280, 800]]) {
  const { ctx, p } = await ouvrir(w, h);
  const y = await p.evaluate(() => {
    const g = document.querySelector("#realisations .ba-grille");
    return Math.round(g.getBoundingClientRect().top + window.scrollY);
  });
  /* On defile par pas : un saut casse un pin de ScrollTrigger (piege 5). */
  for (let s = 0; s < y - 40; s += 380) { await p.evaluate((v) => scrollTo(0, v), s); await p.waitForTimeout(60); }
  await p.evaluate((v) => scrollTo(0, v), Math.max(0, y - 40));
  await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(OUT, `rangee-${w}.png`) });
  const t = await p.evaluate(() => {
    const arts = [...document.querySelectorAll("#realisations .ba")].slice(0, 2);
    const bas = Math.max(...arts.map((a) => a.getBoundingClientRect().bottom));
    return { basRangee: Math.round(bas), fenetre: window.innerHeight };
  });
  R.rangees[w] = { ...t, tientDansLaFenetre: t.basRangee <= t.fenetre };
  await ctx.close();
}

/* ---------- 3 · LES RECONSTITUTIONS ENTIERES, HORS CADRE ----------
   C'est la seule facon de verifier qu'il ne reste aucun rectangle
   gris : dans le cadre, on n'en voit qu'une fenetre a la fois. */
{
  const { ctx, p } = await ouvrir(1440, 1000);
  await p.evaluate(() => document.querySelector("#realisations").scrollIntoView({ block: "start", behavior: "instant" }));
  await p.waitForTimeout(900);
  for (const id of CARTES) {
    const gris = await p.evaluate((i) => {
      const av = document.querySelector("#" + i + " .ba-vue--avant");
      let n = 0;
      const restants = [];
      for (const el of av.querySelectorAll("*")) {
        if (el.querySelector("img,svg,canvas,video")) continue;
        if (el.textContent.trim().length) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 20 || r.height < 20) continue;
        const cs = getComputedStyle(el);
        if (/url\(/.test(cs.backgroundImage)) continue;
        if (el.querySelector("*")) continue;
        n++;
        restants.push((el.className || el.tagName).toString().slice(0, 40));
      }
      return { n, restants };
    }, id);
    R.gris[id] = gris;

    await p.evaluate((i) => {
      const a = document.querySelector("#" + i);
      const cadre = a.querySelector(".ba-cadre");
      const scene = a.querySelector(".ba-scene");
      const vitre = a.querySelector("[data-ba-vitre]");
      const avant = a.querySelector(".ba-vue--avant");
      cadre.style.cssText += ";position:fixed;left:0;top:0;z-index:99999;width:760px;height:auto;overflow:visible;";
      scene.style.cssText += ";aspect-ratio:auto;height:auto;overflow:visible;";
      vitre.style.cssText += ";position:static;overflow:visible;height:auto;";
      avant.style.cssText += ";clip-path:none;overflow:visible;";
      a.querySelector(".ba-vue--apres").style.display = "none";
    }, id);
    await p.waitForTimeout(400);
    const box = await p.evaluate((i) => {
      const pg = document.querySelector("#" + i + " .ba-vue--avant .ba-page");
      return { w: Math.round(pg.getBoundingClientRect().width), h: Math.round(pg.scrollHeight) };
    }, id);
    await p.setViewportSize({ width: 820, height: Math.min(box.h + 60, 7800) });
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(OUT, `avant-${id}.png`), clip: { x: 0, y: 0, width: Math.min(box.w, 820), height: Math.min(box.h, 7800) } });
    await p.evaluate((i) => { document.querySelector("#" + i + " .ba-cadre").style.display = "none"; }, id);
    await p.setViewportSize({ width: 1440, height: 1000 });
    await p.waitForTimeout(200);
  }
  await ctx.close();
}

await nav.close();
fs.writeFileSync(path.join(OUT, "rapport.json"), JSON.stringify(R, null, 2));
console.log(JSON.stringify(R, null, 2));
console.log("\npreuves :", OUT);
