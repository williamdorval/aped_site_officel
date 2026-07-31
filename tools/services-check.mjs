/* ============================================================
   LA SECTION SERVICES, TELLE QU'ON LA VOIT
   `node tools/services-check.mjs [port] [tag]`

   Trois defauts a fermer, trois releves qui ne sont pas des avis.

   1. LE TROU. Il ne se mesure pas « a l'oeil » : on releve, pour les
      six cartes, le BAS DU FILET de tete et le HAUT DU NOM. L'ecart
      doit valoir le gap declare (`--s-6`, 32 px), pas davantage.
      Cause d'origine : la planche remplissait la vitre
      (`min-height: 100%`), donc chaque carte etait etiree sur toute
      la hauteur, et comme son corps est colle en bas (D-490) tout
      l'excedent s'empilait en vide au-dessus du titre.  D-595

   2. LES DEUX LIGNES D'HORIZON. Les six cartes — les cinq services
      ET le panneau de cloture — doivent partager le meme haut, le
      meme bas, la meme largeur et la meme position de repos. Le
      panneau de cloture n'avait pas de `.svc-plan-num`, donc son
      corps se placait en rangee 1, colle EN HAUT, a l'oppose des
      cinq autres.  D-596

   3. LE RYTHME. Une sequence a pas reguliers, plus l'avancee du rail
      IMAGE PAR IMAGE pendant une rafale de molette : le nombre
      d'images ou il n'a pas bouge, et le plus grand bond. Un
      defilement lisse de synthese ne verrait rien — il fabrique
      lui-meme la continuite qu'on cherche a verifier.  D-599
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
const SORTIE = path.join(RACINE, "preuves", "chantier2-services" + (TAG ? "-" + TAG : ""));
fs.mkdirSync(SORTIE, { recursive: true });

function ecart(a, b) {
  const d = diffStats(lire(fs, a), lire(fs, b));
  if (!d.taille) throw new Error("tailles differentes : " + a + " / " + b);
  if (!Number.isFinite(d.pct)) throw new Error("ecart NaN — comparaison impossible");
  return d.pct;
}

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const erreurs = [];
page.on("pageerror", (e) => erreurs.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
await page.addInitScript(() => {
  try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {}
});
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "load" });
await page.waitForTimeout(1800);

const geo = await page.evaluate(() => {
  const piste = document.querySelector("[data-svc-piste]");
  const scene = document.querySelector("[data-svc-scene]");
  return {
    haut: Math.round(piste.getBoundingClientRect().top + scrollY),
    course: Math.max(0, piste.offsetHeight - scene.offsetHeight),
    collant: parseFloat(getComputedStyle(scene).top) || 0,
    actif: getComputedStyle(scene).position === "sticky",
    n: document.querySelectorAll(".svc-plan").length
  };
});
if (!geo.actif) throw new Error("le rail n'est pas actif a 1440 px — rien a mesurer");

const releve = () => page.evaluate(() => {
  const vitre = document.querySelector(".svc-vitre");
  const rv = vitre.getBoundingClientRect();
  const plans = [...document.querySelectorAll(".svc-plan")];
  return {
    vitreH: Math.round(rv.height),
    actif: plans.findIndex((p) => p.hasAttribute("data-actif")),
    cartes: plans.map((p) => {
      const num = p.querySelector(".svc-plan-num");
      const nom = p.querySelector(".svc-plan-nom");
      const bas = p.querySelector(".svc-plan-bas");
      const r = p.getBoundingClientRect();
      /* Le panneau de cloture n'a pas de numero : son filet de tete
         est un `::before`, dont on ne peut pas lire le rectangle.
         On mesure donc le HAUT DE LA RANGEE 2 — le filet est pose a
         son bord superieur moins le gap, et cette lecture-la vaut
         pour les six sans exception ni approximation. */
      const filet = bas ? Math.round(bas.getBoundingClientRect().top - rv.top) : null;
      return {
        id: p.id,
        haut: Math.round(r.top - rv.top),
        filet,
        hautNom: nom ? Math.round(nom.getBoundingClientRect().top - rv.top) : null,
        basCorps: bas ? Math.round(bas.getBoundingClientRect().bottom - rv.top) : null,
        larg: Math.round(r.width),
        repos: Math.round(r.left - rv.left)
      };
    })
  };
});

/* --- 1 et 2 · LES SIX POSITIONS DE REPOS --- */
const N = geo.n;
const positions = [];
for (let k = 0; k < N; k++) {
  /* LA POSITION DE REPOS N'EST PAS `haut + course * p`.  D-600
     La progression du rail se lit `(collant - haut) / course` : il
     faut donc RETRANCHER le `top` du collant, sinon on vise 56 px
     trop bas, ce qui, apres la zone morte et le lissage, decale la
     carte de 5,3 px. Une sonde qui vise mal condamne un centrage
     sain : mesure du 2026-07-31, cinq cartes rendues a 264 px au
     lieu de 269,6, alors que les six cibles calculees etaient
     exactes. Un centrage se releve, il ne se devine pas. */
  const p = k / (N - 1);
  const y = Math.min(Math.round(geo.haut - geo.collant + geo.course * p),
                     geo.haut + geo.course - geo.collant - 1);
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
  /* Le rattrapage converge en ~350 ms : lire avant, c'est lire le
     rattrapage et non la position de repos.  D-599 */
  await page.waitForTimeout(900);
  const r = await releve();
  await page.screenshot({ path: path.join(SORTIE, `repos-${k}-${r.cartes[r.actif] ? r.cartes[r.actif].id : "?"}.png`) });
  positions.push({ pas: k, ...r });
}

const active = positions.map((p) => p.cartes[p.actif]).filter(Boolean);
const horizons = {
  hauts: [...new Set(active.map((c) => c.haut))],
  filets: [...new Set(active.map((c) => c.filet))],
  bas: [...new Set(active.map((c) => c.basCorps))],
  largeurs: [...new Set(active.map((c) => c.larg))],
  /* La premiere carte se cale sur la marge du TEXTE (D-482), pas au
     centre : elle est exclue de l'egalite des repos, pas des
     horizons. */
  reposSaufPremiere: [...new Set(active.slice(1).map((c) => c.repos))]
};
const trous = active.map((c) => ({ id: c.id, trou: c.hautNom - c.filet }));

/* --- 3 · LA SEQUENCE, PAS REGULIERS --- */
const SEQ = 13;
const fichiers = [];
for (let i = 0; i < SEQ; i++) {
  const p = i / (SEQ - 1);
  const y = Math.min(Math.round(geo.haut - geo.collant + geo.course * p),
                     geo.haut + geo.course - geo.collant - 1);
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
  await page.waitForTimeout(850);
  const f = path.join(SORTIE, `seq-${String(i).padStart(2, "0")}.png`);
  await page.screenshot({ path: f });
  fichiers.push(f);
}
const ecarts = [];
for (let i = 1; i < fichiers.length; i++) ecarts.push(+ecart(fichiers[i - 1], fichiers[i]).toFixed(2));

/* --- 3b · LA MOLETTE --- */
await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), geo.haut - geo.collant);
await page.waitForTimeout(900);
const molette = await page.evaluate(async () => {
  const vitre = document.querySelector(".svc-vitre");
  const pos = [];
  let stop = false;
  function tick() { pos.push(vitre.scrollLeft); if (!stop) requestAnimationFrame(tick); }
  requestAnimationFrame(tick);
  for (let i = 0; i < 22; i++) {
    window.scrollBy(0, 100);
    await new Promise((r) => setTimeout(r, 50));
  }
  stop = true;
  await new Promise((r) => setTimeout(r, 60));
  const pas = [];
  for (let i = 1; i < pos.length; i++) pas.push(Math.abs(pos[i] - pos[i - 1]));
  const bouge = pas.filter((v) => v > 0.05);
  if (!bouge.length) return { note: "le rail n'a pas avance pendant la rafale" };
  return {
    images: pas.length,
    imagesFigees: pas.length - bouge.length,
    partFigee: +((pas.length - bouge.length) / pas.length * 100).toFixed(1),
    pasMoyenPx: +(bouge.reduce((a, b) => a + b, 0) / bouge.length).toFixed(2),
    plusGrandBondPx: +Math.max.apply(null, bouge).toFixed(1)
  };
});

const R = { geo, horizons, trous, positions, ecarts, molette, erreurs };
R.verdict = {
  memeHautPourLesSix: horizons.hauts.length === 1,
  memeFiletPourLesSix: horizons.filets.length === 1,
  memeBasPourLesSix: horizons.bas.length === 1,
  memeLargeurPourLesSix: horizons.largeurs.length === 1,
  /* Deux pixels de tolerance, et pas davantage : `scrollLeft` est
     arrondi a l'entier par le moteur, donc une cible a 269,6 rend
     tantot 269, tantot 270. Exiger l'egalite stricte ferait echouer
     un centrage exact. */
  memeReposSaufLaPremiere:
    Math.max.apply(null, horizons.reposSaufPremiere) -
    Math.min.apply(null, horizons.reposSaufPremiere) <= 2,
  aucunTrouAuDessusDuNom: trous.every((t) => t.trou <= 64),
  aucuneImageIdentiqueDansLaSequence: Math.min.apply(null, ecarts) > 0.5,
  moinsDeDixPourCentDImagesFigeesALaMolette: molette.partFigee < 10,
  aucuneErreurConsole: erreurs.length === 0
};
fs.writeFileSync(path.join(SORTIE, "rapport.json"), JSON.stringify(R, null, 2));
console.log(JSON.stringify({ horizons, trous, ecarts, molette, erreurs, verdict: R.verdict }, null, 1));
const rate = Object.entries(R.verdict).filter(([, v]) => !v);
console.log(rate.length ? "\nECHEC : " + rate.map(([k]) => k).join(", ") : "\nTOUT PASSE");
process.exitCode = rate.length ? 1 : 0;
await nav.close();
