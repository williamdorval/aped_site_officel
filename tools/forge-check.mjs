/* ============================================================
   LA FORGE DU SAS, TELLE QU'ON LA VOIT
   `node tools/forge-check.mjs [port] [tag]`

   Le sas de la descente est le moment signature du site. Il ne se
   valide pas par une duree : il se valide par des IMAGES, et par la
   distance entre deux images consecutives.

   QUATRE RELEVES, ET AUCUN N'EST UNE OPINION.

   1. LE FOND SUIT-IL LA CHAMBRE ? — la couleur calculee du volet,
      dans les DEUX themes. Elle doit valoir `--chambre` (#060807)
      des deux cotes. C'etait le defaut : en sombre le volet prenait
      `--surface-inverse`, donc du ciment clair, et la forge se
      jouait sur du blanc.

   2. LA SEQUENCE — treize images reparties sur toute la piste, dont
      SEPT dans la seule fenetre de forge, plus l'ecart de pixels
      entre deux consecutives. Une image identique a la precedente
      au milieu du mouvement est un echec, pas un detail.

   3. LES IMAGES PAR SECONDE PENDANT LA TRAVERSEE DU SAS SEUL — pas
      de la page entiere. Une page qui tient 60 i/s en moyenne peut
      tomber a 30 sur ses deux secondes les plus visibles.

   4. LA SACCADE, ET ELLE SE MESURE A LA MOLETTE.  D-589
      Un defilement lisse de synthese ne peut PAS voir le defaut :
      il fabrique lui-meme la continuite qu'on cherche a verifier.
      Une molette avance par paliers de ~100 px toutes les ~50 ms.
      Ce qu'on releve est le deplacement du volet IMAGE PAR IMAGE
      pendant une rafale : le nombre d'images ou il n'a pas bouge
      du tout, et le plus grand bond entre deux images.
      Releve du 2026-07-31, `scrub: true` contre `scrub: 0.45` :
        images figees   26 / 71  ->   2 / 68
        plus grand bond  44,5 px ->  23,6 px
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { diffStats, lire } from "./_png.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PORT = process.argv[2] || "8099";
const TAG = process.argv[3] || "";
const BASE = `http://127.0.0.1:${PORT}/`;
const SORTIE = path.join(RACINE, "preuves", "chantier1-forge" + (TAG ? "-" + TAG : ""));
fs.mkdirSync(SORTIE, { recursive: true });

/* Sept des treize points tombent dans la fenetre de forge : c'est
   la ou le mouvement se joue, donc c'est la qu'il faut regarder. */
const POINTS = [0, 0.20, 0.36, 0.45, 0.53, 0.61, 0.69, 0.77, 0.85, 0.90, 0.94, 0.97, 1];
const CHAMBRE = "rgb(6, 8, 7)";

function ecart(a, b) {
  const d = diffStats(lire(fs, a), lire(fs, b));
  if (!d.taille) throw new Error("tailles differentes : " + a + " / " + b);
  if (!Number.isFinite(d.pct)) throw new Error("ecart NaN — comparaison impossible");
  return d.pct;
}

const nav = await chromium.launch();
const R = { points: POINTS, themes: {} };

for (const theme of ["light", "dark"]) {
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const erreurs = [];
  page.on("pageerror", (e) => erreurs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
  await page.addInitScript((t) => {
    try {
      sessionStorage.setItem("aped-entree-saut", "1");
      sessionStorage.setItem("aped-sans-popup", "1");
      localStorage.setItem("aped-theme", t);
    } catch (e) {}
  }, theme);
  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(1800);

  const etat = await page.evaluate(() => {
    const sas = document.querySelector('.sas[data-sas="descente"]');
    if (!sas) return { absent: true };
    const piste = sas.querySelector(".sas-piste");
    const volet = sas.querySelector("[data-sas-volet]");
    const mot = sas.querySelector("[data-sas-mot]");
    const r = mot.getBoundingClientRect();
    return {
      theme: document.documentElement.getAttribute("data-theme"),
      sasOk: document.documentElement.classList.contains("sas-ok"),
      actif: sas.classList.contains("sas-actif"),
      palier: document.documentElement.getAttribute("data-palier"),
      fondVolet: getComputedStyle(volet).backgroundColor,
      couleurMot: getComputedStyle(mot).color,
      motLargeur: Math.round(r.width),
      motDeborde: Math.round(r.right - innerWidth),
      hautPiste: Math.round(piste.getBoundingClientRect().top + scrollY),
      hauteurPiste: Math.round(piste.getBoundingClientRect().height)
    };
  });
  if (etat.absent) throw new Error("le sas de la descente est introuvable");

  /* p = 0 quand le haut de la piste touche le bas de l'ecran ;
     p = 1 quand son bas y touche. Meme convention que sas.js. */
  const yDe = (p) => Math.round(etat.hautPiste - 900 + p * etat.hauteurPiste);

  const fichiers = [];
  for (let i = 0; i < POINTS.length; i++) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), yDe(POINTS[i]));
    /* Le lissage converge en ~450 ms. Capturer avant, c'est
       photographier le rattrapage et non l'etat de cette position. */
    await page.waitForTimeout(950);
    const f = path.join(SORTIE, `${theme}-${String(i).padStart(2, "0")}-p${String(Math.round(POINTS[i] * 100)).padStart(3, "0")}.png`);
    await page.screenshot({ path: f });
    fichiers.push(f);
  }
  const ecarts = [];
  for (let i = 1; i < fichiers.length; i++) {
    ecarts.push({
      de: POINTS[i - 1], a: POINTS[i],
      pct: +ecart(fichiers[i - 1], fichiers[i]).toFixed(2)
    });
  }
  /* La forge occupe p 0,40 a 0,84. Deux images voisines DANS cette
     fenetre qui ne different pas veulent dire que rien ne bouge. */
  const dansLaForge = ecarts.filter((e) => e.de >= 0.36 && e.a <= 0.90);
  const plusFaible = dansLaForge.reduce((m, e) => (e.pct < m.pct ? e : m), dansLaForge[0]);

  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), yDe(0));
  await page.waitForTimeout(900);
  const fps = await page.evaluate(async ({ y0, y1 }) => {
    const dts = [];
    let last = performance.now(), stop = false;
    function tick(t) { dts.push(t - last); last = t; if (!stop) requestAnimationFrame(tick); }
    requestAnimationFrame(tick);
    const t0 = performance.now(), duree = 2600;
    await new Promise((res) => {
      function pas(now) {
        const k = Math.min(1, (now - t0) / duree);
        window.scrollTo({ top: y0 + (y1 - y0) * k, behavior: "instant" });
        if (k < 1) requestAnimationFrame(pas); else res();
      }
      requestAnimationFrame(pas);
    });
    stop = true;
    const p = dts.slice(2).sort((a, b) => a - b);
    return {
      images: p.length,
      isMediane: +(1000 / p[Math.floor(p.length / 2)]).toFixed(1),
      auDessusDe20ms: p.filter((v) => v > 20).length,
      auDessusDe33ms: p.filter((v) => v > 33).length
    };
  }, { y0: yDe(0), y1: yDe(1) });

  /* On releve la PROGRESSION du declencheur, pas le volet : depuis
     que la plaque ne balaye plus, le volet ne bouge par definition
     jamais, et une sonde qui vise un objet immobile rend « aucune
     saccade » sur n'importe quoi. C'est la progression qui pilote la
     limaille, donc c'est elle qui doit avancer d'un pas regulier. */
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), yDe(0.42));
  await page.waitForTimeout(900);
  const molette = await page.evaluate(async () => {
    const piste = document.querySelector('.sas[data-sas="descente"] .sas-piste');
    const st = window.ScrollTrigger.getAll().filter((s) => s.vars && s.vars.trigger === piste && s.vars.onUpdate)[0];
    if (!st) return { note: "declencheur de la forge introuvable" };
    const ty = () => st.progress * 1000;
    const pos = [];
    let stop = false;
    function tick() { pos.push(ty()); if (!stop) requestAnimationFrame(tick); }
    requestAnimationFrame(tick);
    for (let i = 0; i < 22; i++) {
      window.scrollBy(0, 100);
      await new Promise((r) => setTimeout(r, 50));
    }
    stop = true;
    await new Promise((r) => setTimeout(r, 60));
    const pas = [];
    for (let i = 1; i < pos.length; i++) pas.push(Math.abs(pos[i] - pos[i - 1]));
    const bouge = pas.filter((v) => v > 0.005);
    if (!bouge.length) return { note: "la progression n'a pas avance pendant la rafale" };
    return {
      images: pas.length,
      imagesFigees: pas.length - bouge.length,
      partFigee: +((pas.length - bouge.length) / pas.length * 100).toFixed(1),
      pasMoyenMillieme: +(bouge.reduce((a, b) => a + b, 0) / bouge.length).toFixed(2),
      plusGrandBondMillieme: +Math.max.apply(null, bouge).toFixed(1)
    };
  });

  R.themes[theme] = { etat, ecarts, plusFaibleDansLaForge: plusFaible, fps, molette, erreurs };
  await ctx.close();
}

await nav.close();

const c = R.themes.light, s = R.themes.dark;
R.verdict = {
  fondSuitLaChambreEnClair: c.etat.fondVolet === CHAMBRE,
  fondSuitLaChambreEnSombre: s.etat.fondVolet === CHAMBRE,
  motNeDebordePas: c.etat.motDeborde < 0 && s.etat.motDeborde < 0,
  aucuneImageIdentiqueDansLaForge:
    c.plusFaibleDansLaForge.pct > 0.5 && s.plusFaibleDansLaForge.pct > 0.5,
  soixanteImagesParSeconde: c.fps.isMediane >= 58 && s.fps.isMediane >= 58,
  aucuneImageAuDessusDe20ms: c.fps.auDessusDe20ms === 0 && s.fps.auDessusDe20ms === 0,
  moinsDeCinqPourCentDImagesFigeesALaMolette:
    c.molette.partFigee < 5 && s.molette.partFigee < 5,
  aucuneErreurConsole: c.erreurs.length === 0 && s.erreurs.length === 0
};
fs.writeFileSync(path.join(SORTIE, "rapport.json"), JSON.stringify(R, null, 2));
console.log(JSON.stringify(R, null, 1));
const rate = Object.entries(R.verdict).filter(([, v]) => !v);
console.log(rate.length ? "\nECHEC : " + rate.map(([k]) => k).join(", ") : "\nTOUT PASSE");
process.exitCode = rate.length ? 1 : 0;
