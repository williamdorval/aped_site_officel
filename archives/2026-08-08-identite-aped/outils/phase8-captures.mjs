/* ============================================================
   PHASE 8 — les captures.

   Deux series :
   · AVANT / APRES sur les moments qui ont change, meme largeur,
     meme theme, meme position ;
   · DEBUT / MILIEU / FIN sur chaque animation, pour qu'on puisse
     juger la trajectoire et pas seulement le resultat.

   L'horloge est ETIREE d'un facteur 6 pour les etats de survol :
   un aller-retour de capture coute plus longtemps que la
   transition elle-meme, donc a vitesse reelle on ne photographie
   jamais le milieu. Les proportions sont conservees, seule la
   vitesse change.

   Sortie : refonte-captures/phase8/
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";

const OUT = "refonte-captures/phase8";
fs.mkdirSync(OUT, { recursive: true });
const AVANT = "http://localhost:8097";
const APRES = process.argv[2] || "http://localhost:8099";
const F = 6;

const nav = await chromium.launch();

async function ouvrir(base, { reduit = false, sombre = false, lent = false } = {}) {
  const ctx = await nav.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: sombre ? "dark" : "light",
    reducedMotion: reduit ? "reduce" : "no-preference"
  });
  const page = await ctx.newPage();
  await page.addInitScript((s) => {
    try {
      sessionStorage.setItem("adexweb-entree-saut", "1"); sessionStorage.setItem("adexweb-sans-popup", "1");
      localStorage.setItem("adexweb-theme", s ? "dark" : "light");
    } catch (e) {}
  }, sombre);
  await page.goto(base + "/", { waitUntil: "load" });
  await page.mouse.move(700, 400);
  await page.waitForTimeout(1800);
  if (lent) {
    await page.addStyleTag({
      content: `
        .btn[data-lettres]::before { transition-duration: ${230 * F}ms !important; }
        .btn .l, .btn .icon { transition-delay: calc((1 - var(--p,0)) * ${230 * F}ms) !important; }
        .btn[data-lettres]:hover .l, .btn[data-lettres]:hover .icon,
        .btn[data-lettres]:focus-visible .l, .btn[data-lettres]:focus-visible .icon {
          transition-delay: calc(var(--p,0) * ${230 * F}ms) !important; }
        .btn[data-lettres]:hover .icon,
        .btn[data-lettres]:focus-visible .icon { animation-duration: ${300 * F}ms !important; animation-delay: ${230 * F}ms !important; }
      `
    });
  }
  return page;
}

async function tirer(page, sel, nom, marge = 14) {
  const el = await page.$(sel);
  if (!el) return false;
  await el.scrollIntoViewIfNeeded().catch(() => {});
  const b = await el.boundingBox();
  if (!b) return false;
  const vp = page.viewportSize();
  await page.screenshot({
    path: `${OUT}/${nom}.png`,
    clip: {
      x: Math.max(0, b.x - marge),
      y: Math.max(0, b.y - marge),
      width: Math.min(vp.width - Math.max(0, b.x - marge), b.width + marge * 2),
      height: Math.min(vp.height - Math.max(0, b.y - marge), b.height + marge * 2)
    }
  });
  return true;
}

/* ---------- 1. LE BOUTON : avant, puis debut / milieu / fin ---- */
{
  const a = await ouvrir(AVANT);
  await a.hover(".hero-cta .btn--ghost", { force: true });
  await a.waitForTimeout(400);
  await tirer(a, ".hero-cta .btn--ghost", "01-bouton-AVANT-survol");
  await a.mouse.move(2, 2);
  await a.waitForTimeout(400);
  await tirer(a, ".hero-cta .btn--ghost", "01-bouton-AVANT-repos");
  await a.context().close();

  const p = await ouvrir(APRES, { lent: true });
  await p.hover(".hero-cta .btn--ghost", { force: true });
  await p.waitForTimeout(200);
  await p.mouse.move(2, 2);
  await p.waitForTimeout(230 * F + 400);
  await tirer(p, ".hero-cta .btn--ghost", "01-bouton-APRES-1-repos");
  const el = await p.$(".hero-cta .btn--ghost");
  await el.hover({ force: true });
  await p.waitForTimeout(230 * F * 0.35);
  await tirer(p, ".hero-cta .btn--ghost", "01-bouton-APRES-2-arete-a-mi-course");
  await p.waitForTimeout(230 * F * 0.65);
  await tirer(p, ".hero-cta .btn--ghost", "01-bouton-APRES-3-inverse");
  await p.waitForTimeout(300 * F * 0.5);
  await tirer(p, ".hero-cta .btn--ghost", "01-bouton-APRES-4-fleche-hors-cadre");
  await p.context().close();
}

/* ---------- 2. LE RAIL : ancienne marque contre curseur -------- */
for (const [base, nom] of [[AVANT, "AVANT"], [APRES, "APRES"]]) {
  const page = await ouvrir(base);
  for (const [y, etiq] of [[0.18, "a"], [0.42, "b"], [0.68, "c"]]) {
    await page.evaluate((f) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), y);
    await page.waitForTimeout(700);
    await tirer(page, "#rail", `02-rail-${nom}-${etiq}`);
  }
  await page.context().close();
}

/* ---------- 3. LES SECTEURS : la recomposition ----------------- */
{
  const p = await ouvrir(APRES);
  await p.evaluate(() => document.querySelector("#demos").scrollIntoView());
  await p.waitForTimeout(900);
  await tirer(p, "#sectorPreview", "03-secteurs-1-repos");
  const pills = await p.$$(".sector-pills button");
  await pills[6].hover({ force: true });
  await p.waitForTimeout(90);
  await tirer(p, "#sectorPreview", "03-secteurs-2-dispersion");
  await p.waitForTimeout(160);
  await tirer(p, "#sectorPreview", "03-secteurs-3-reprise");
  await p.waitForTimeout(500);
  await tirer(p, "#sectorPreview", "03-secteurs-4-net");
  await p.context().close();
}

/* ---------- 4. LE VOILE DE GRAINS SUR UNE CAPTURE -------------- */
{
  const p = await ouvrir(APRES);
  await p.evaluate(() => {
    const t = document.querySelector("#realisations .project");
    window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY - innerHeight * 0.92);
  });
  await p.waitForTimeout(60);
  await tirer(p, "#realisations .project .shot", "04-voile-1-trame");
  await p.waitForTimeout(230);
  await tirer(p, "#realisations .project .shot", "04-voile-2-mi-course");
  await p.waitForTimeout(700);
  await tirer(p, "#realisations .project .shot", "04-voile-3-net");
  await p.context().close();
}

/* ---------- 5. LES CHAPOS : encre progressive ------------------ */
for (const [base, nom] of [[AVANT, "AVANT"], [APRES, "APRES"]]) {
  const page = await ouvrir(base);
  await page.evaluate(() => {
    const t = document.querySelector("#processus .head");
    window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY - innerHeight * 0.82);
  });
  await page.waitForTimeout(500);
  await tirer(page, "#processus .head", `05-chapo-${nom}`);
  await page.context().close();
}

/* ---------- 6. MODALE, MOUVEMENT REDUIT, SOMBRE ---------------- */
{
  const p = await ouvrir(APRES);
  await p.click(".nav-cta");
  await p.waitForTimeout(60);
  await tirer(p, "#modal-start .modal-panel", "06-modale-1-degagement");
  await p.waitForTimeout(500);
  await tirer(p, "#modal-start .modal-panel", "06-modale-2-ouverte");
  await p.context().close();

  const s = await ouvrir(APRES, { sombre: true });
  await s.hover(".hero-cta .btn--primary", { force: true });
  await s.waitForTimeout(700);
  await tirer(s, ".hero-cta", "07-sombre-boutons");
  await s.context().close();

  const r = await ouvrir(APRES, { reduit: true });
  await r.waitForTimeout(500);
  await tirer(r, ".hero", "08-mouvement-reduit-hero", 0);
  await r.evaluate(() => document.querySelector("#processus").scrollIntoView());
  await r.waitForTimeout(600);
  await tirer(r, "#rail", "08-mouvement-reduit-rail");
  await r.context().close();
}

await nav.close();
const n = fs.readdirSync(OUT).length;
console.log(`${n} captures dans ${OUT}`);
