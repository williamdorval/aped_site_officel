/* ============================================================
   SECTION 02 · LES ANIMATIONS SONT-ELLES VISIBLES ?
   `node tools/svc-sequences.mjs [adresse] [largeur]`

   REGLE 0.B : « une animation qu'on ne remarque pas n'existe pas ».
   Preuve exigee : au moins CINQ captures entre le debut et la fin,
   et l'ECART DE PIXELS entre deux captures consecutives. Si les cinq
   images se ressemblent, le mouvement est repris — pas explique.

   Trois pieges appliques :
   · piege 3 — le cadre d'une suite doit etre FIXE. Deux images de
     tailles differentes rendent 100 % d'ecart, un chiffre qui ne
     veut rien dire.
   · piege 2 — le cadrage se RELEVE, il ne se devine pas. Chaque
     cible est remesuree juste avant sa suite.
   · piege 1 — une capture est plus lente qu'une transition (30-50 ms
     contre 16,7). L'horloge est donc ETIREE : les durees CSS et GSAP
     sont multipliees pour que chaque capture tombe dans une phase
     distincte au lieu de photographier la fin cinq fois.

   Quatre mouvements a prouver :
   A. l'entree en cascade des quatre cartes — V2 · S'ALIGNER
   B. le survol d'une carte — V1 · DEGAGER (arete franche)
   C. l'ouverture d'une fiche — V2 · S'ALIGNER (les voisines
      glissent) + V1 · DEGAGER (le detail se decouvre)
   D. la fermeture — le chemin inverse
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { decodePNG, diffStats } from "./_png.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const BASE = (process.argv[2] || "http://127.0.0.1:8099").replace(/\/$/, "") + "/";
const LARGEUR = Number(process.argv[3] || 1440);
const SORTIE = path.join(RACINE, "refonte-captures", "svc-sequences");
fs.mkdirSync(SORTIE, { recursive: true });

const nav = await chromium.launch();
const rapport = { adresse: BASE, largeur: LARGEUR, suites: [] };

/* L'HORLOGE ETIREE. On multiplie toutes les durees pour que six
   captures a ~40 ms tombent dans six phases distinctes. Sans ca, une
   animation de 460 ms est finie avant la troisieme image. */
const ETIRE = `
  *, *::before, *::after {
    animation-duration: 4000ms !important;
    transition-duration: 4000ms !important;
  }
`;

async function suite(nom, verbe, prep, geste, cible, n = 6, pas = 420) {
  const ctx = await nav.newContext({ viewport: { width: LARGEUR, height: 900 }, colorScheme: "light" });
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {} });
  await p.goto(BASE, { waitUntil: "load" });
  await p.waitForTimeout(2200);
  await prep(p);
  /* Le cadre se RELEVE ici, une fois la page dans son etat de
     depart, et il ne bouge plus ensuite. */
  const cadre = await p.evaluate(cible);
  if (!cadre) { await ctx.close(); return; }
  await p.addStyleTag({ content: ETIRE });
  await p.waitForTimeout(120);

  const images = [];
  const t0 = Date.now();
  await geste(p);
  for (let i = 0; i < n; i++) {
    const f = path.join(SORTIE, `${nom}-${LARGEUR}-${i}.png`);
    await p.screenshot({ path: f, clip: cadre });
    images.push({ i, ms: Date.now() - t0, f });
    await p.waitForTimeout(pas);
  }

  const ecarts = [];
  for (let i = 1; i < images.length; i++) {
    const a = decodePNG(fs.readFileSync(images[i - 1].f));
    const b = decodePNG(fs.readFileSync(images[i].f));
    const d = diffStats(a, b);
    ecarts.push({ de: i - 1, a: i, pourcent: d.pct, ecartMoyen: d.moy, memeTaille: d.taille });
  }
  /* On compare aussi la PREMIERE a la DERNIERE : un mouvement qui
     revient a son point de depart rendrait six ecarts non nuls et un
     total nul, et ce serait un faux positif. */
  const bout = diffStats(decodePNG(fs.readFileSync(images[0].f)), decodePNG(fs.readFileSync(images[images.length - 1].f)));

  rapport.suites.push({
    nom, verbe, cadre,
    captures: images.length,
    ecartsConsecutifs: ecarts,
    ecartMinPourcent: Math.min(...ecarts.map((e) => e.pourcent)),
    ecartMaxPourcent: Math.max(...ecarts.map((e) => e.pourcent)),
    ecartDebutFinPourcent: bout.pct,
    /* LE VERDICT. Six images qui se ressemblent = mouvement
       invisible. Le seuil de 1 % est celui du projet. */
    visible: Math.max(...ecarts.map((e) => e.pourcent)) > 1 && bout.pct > 1
  });
  await ctx.close();
}

const rectDe = (sel) => new Function("", `
  const e = document.querySelector(${JSON.stringify(sel)});
  if (!e) return null;
  const r = e.getBoundingClientRect();
  return { x: Math.max(0, Math.round(r.x)), y: Math.max(0, Math.round(r.y)),
           width: Math.min(innerWidth, Math.round(r.width)), height: Math.min(innerHeight - Math.max(0, Math.round(r.y)), Math.round(r.height)) };
`);

/* Descendre par pas jusqu'a une cible, comme un visiteur. */
const versGrille = async (p, marge = 90) => {
  const y = await p.evaluate(() => document.querySelector(".svc-grille").getBoundingClientRect().top + scrollY);
  const d = await p.evaluate(() => scrollY);
  for (let i = 1; i <= 30; i++) { await p.evaluate((v) => scrollTo(0, v), d + (y - marge - d) * (i / 30)); await p.evaluate(() => new Promise((r) => requestAnimationFrame(r))); }
  await p.waitForTimeout(200);
};

/* --- A · L'ENTREE EN CASCADE — V2 · S'ALIGNER ---
   Le declencheur est `once: true` : il faut donc s'arreter AVANT
   qu'il parte, poser l'horloge etiree, puis franchir le seuil.
   Piege 12 : une sonde qui traverse la page avant de mesurer
   photographie la fin. */
await suite("A-entree", "V2 · S'ALIGNER",
  async (p) => {
    const y = await p.evaluate(() => document.querySelector(".svc-grille").getBoundingClientRect().top + scrollY);
    const d = await p.evaluate(() => scrollY);
    /* On s'arrete 1 100 px au-dessus du seuil `top 84%`. */
    for (let i = 1; i <= 24; i++) { await p.evaluate((v) => scrollTo(0, v), d + (y - 1100 - d) * (i / 24)); await p.evaluate(() => new Promise((r) => requestAnimationFrame(r))); }
    await p.waitForTimeout(300);
    /* L'HORLOGE DE GSAP N'EST PAS CELLE DU CSS, et c'est un faux
       verdict paye ici meme. La feuille `ETIRE` multiplie
       `animation-duration` et `transition-duration` : elle ralentit
       le survol, qui est une transition CSS, et elle ne touche RIEN
       du tout a une timeline GSAP, qui est pilotee en JavaScript.
       Premiere passe : la cascade d'entree a rendu 0,00 % d'ecart
       sur les six captures — non pas parce qu'elle est invisible,
       mais parce qu'elle etait FINIE avant la premiere image.
       On ralentit donc la bonne horloge. */
    await p.evaluate(() => { if (window.gsap) gsap.globalTimeline.timeScale(0.08); });
  },
  async (p) => {
    const y = await p.evaluate(() => document.querySelector(".svc-grille").getBoundingClientRect().top + scrollY);
    /* Le franchissement doit etre RAPIDE : chaque pas coute une
       image, et tout ce qui est consomme ici est du mouvement qu'on
       ne photographie pas. */
    for (let i = 1; i <= 5; i++) { await p.evaluate((v) => scrollTo(0, v), y - 1100 + (1010 * i / 5)); await p.evaluate(() => new Promise((r) => requestAnimationFrame(r))); }
  },
  () => ({ x: 0, y: 90, width: Math.min(1440, innerWidth), height: 800 }), 6, 900);

/* --- B · LE SURVOL D'UNE CARTE — V1 · DEGAGER --- */
await suite("B-survol", "V1 · DEGAGER",
  versGrille,
  async (p) => { await p.hover("#svc-01 .svc-corps h3"); },
  rectDe("#svc-01"), 6, 380);

/* --- C · L'OUVERTURE D'UNE FICHE — V2 puis V1 --- */
await suite("C-ouverture", "V2 · S'ALIGNER + V1 · DEGAGER",
  versGrille,
  async (p) => { await p.click("#svc-01 .svc-plus", { force: true }); },
  () => ({ x: 0, y: 0, width: Math.min(1440, innerWidth), height: 900 }), 6, 380);

/* --- D · LA FERMETURE — le chemin inverse --- */
await suite("D-fermeture", "V2 · S'ALIGNER",
  async (p) => {
    await versGrille(p);
    await p.click("#svc-01 .svc-plus", { force: true });
    await p.waitForTimeout(1200);
  },
  async (p) => { await p.click("#svc-01 .svc-plus", { force: true }); },
  () => ({ x: 0, y: 0, width: Math.min(1440, innerWidth), height: 900 }), 6, 380);

rapport.toutesVisibles = rapport.suites.every((s) => s.visible);
fs.writeFileSync(path.join(SORTIE, `rapport-${LARGEUR}.json`), JSON.stringify(rapport, null, 2), "utf8");
console.log(JSON.stringify(rapport, null, 2));
await nav.close();
