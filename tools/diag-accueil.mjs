/* ============================================================
   DIAGNOSTIC DE L'ACCUEIL — PHASE 0.

   Trois hypotheses, trois preuves, aucune impression.

   a) LA REVELATION DU TITRE EST-ELLE VISIBLE ?
      On echantillonne a 60 Hz la plaque `::after` de chacun des
      onze pas de `compo-hero` : sa `scaleX` dit exactement quelle
      fraction du texte est encore couverte. Une plaque qui ne
      descend jamais de 1 a 0 n'a jamais joue ; une plaque qui va
      de 1 a 0 mais dont la couleur est celle du fond derriere le
      texte est visible ; une plaque qui ne couvre rien du tout ne
      l'est pas. On capture EN PLUS une sequence d'images reelles
      et on compte les pixels qui bougent entre deux images
      consecutives.

   b) LE VERROU DE SESSION.
      On charge, on RECHARGE cinq fois, et on releve a chaque fois
      les classes de `<html>` et le contenu de `sessionStorage`.
      Puis on rejoue la sequence en CLIQUANT une fois pendant
      l'entree — ce que fait n'importe quel visiteur — et on
      recharge encore.

   c) LES DEUX BOUTONS AU SURVOL.
      `.btn[data-lettres]::before` n'existe que si `langue.js` a
      decoupe le bouton, et il le decoupe PARESSEUSEMENT au
      `pointerenter`. On mesure donc separement le PREMIER survol
      et le SECOND : si l'attribut arrive pendant que `:hover` est
      deja vrai, l'aplat nait deja a `scaleX(1)` et il n'y a
      aucune transition a voir.

   PIEGE D'INSTRUMENT DEJA CONNU, et respecte ici : une capture
   d'ecran est plus lente qu'une transition. Les CHIFFRES viennent
   donc de la page (echantillonnage a 60 Hz) ; les images ne
   servent qu'a montrer.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { decodePNG, diffStats } from "./_png.mjs";

const BASE = process.env.BASE || "http://localhost:8099/";
const SORTIE = path.resolve("refonte-captures/diag");
fs.mkdirSync(SORTIE, { recursive: true });

const LARGEUR = 1440, HAUTEUR = 900;

/* Les onze pas, dans l'ordre du document, avec le retard ecrit
   dans `index.html`. On verifie aussi que le document dit bien ce
   que ce tableau annonce. */
const PAS = [
  { nom: "sur-titre",     sel: ".hero-eyebrow",            e: 560 },
  { nom: "titre L1",      sel: ".hero-claim .ligne:nth-of-type(1)", e: 640 },
  { nom: "titre L2",      sel: ".hero-claim .ligne:nth-of-type(2)", e: 760 },
  { nom: "sous-titre",    sel: ".hero-sub",                e: 880 },
  { nom: "les 2 CTA",     sel: ".hero-cta",                e: 980 },
  { nom: "fiche titre",   sel: ".hero-fiche > .label",     e: 1060 },
  { nom: "fiche r1",      sel: ".fiche-rows li:nth-child(1) a", e: 1140 },
  { nom: "fiche r2",      sel: ".fiche-rows li:nth-child(2) a", e: 1210 },
  { nom: "fiche r3",      sel: ".fiche-rows li:nth-child(3) a", e: 1280 },
  { nom: "fiche r4",      sel: ".fiche-rows li:nth-child(4) a", e: 1350 },
  { nom: "fiche pied",    sel: ".fiche-foot",              e: 1470 },
];

const FILETS = [
  { nom: "filet r1", sel: ".fiche-rows li:nth-child(1) .fiche-rule" },
  { nom: "filet r2", sel: ".fiche-rows li:nth-child(2) .fiche-rule" },
  { nom: "filet pied", sel: ".fiche-foot .fiche-rule" },
];

function scaleXDe(t) {
  if (!t || t === "none") return null;
  const m = t.match(/matrix\(([^)]+)\)/);
  if (m) return +m[1].split(",")[0].trim();
  const m3 = t.match(/matrix3d\(([^)]+)\)/);
  if (m3) return +m3[1].split(",")[0].trim();
  return null;
}

/* ---------- l'enregistreur, pose AVANT tout script de la page ---------- */
function poserEnregistreur(pas, filets) {
  const cibles = pas.map((p) => ({ nom: p.nom, sel: p.sel, pseudo: "::after" }))
    .concat(filets.map((f) => ({ nom: f.nom, sel: f.sel, pseudo: null })));
  window.__diag = { t0: performance.now(), ech: [], nav: null };
  try {
    const n = performance.getEntriesByType("navigation")[0];
    window.__diag.nav = n ? n.type : null;
  } catch (e) {}
  const cache = {};
  function tour() {
    const t = performance.now();
    const ligne = { t: +t.toFixed(1), cls: document.documentElement.className, v: {} };
    for (const c of cibles) {
      let el = cache[c.nom];
      if (!el || !el.isConnected) { el = cache[c.nom] = document.querySelector(c.sel); }
      if (!el) { ligne.v[c.nom] = null; continue; }
      const s = getComputedStyle(el, c.pseudo);
      ligne.v[c.nom] = {
        tr: s.transform,
        op: s.opacity,
        bg: c.pseudo ? s.backgroundColor : (s.backgroundImage || "").slice(0, 60),
        ct: c.pseudo ? s.content : null,
      };
    }
    window.__diag.ech.push(ligne);
    if (t < 4000) requestAnimationFrame(tour);
  }
  requestAnimationFrame(tour);
}

async function nouveauContexte(navigateur, opts = {}) {
  const ctx = await navigateur.newContext({
    viewport: { width: LARGEUR, height: HAUTEUR },
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: "no-preference",
  });
  /* Le popup cadeau bloque les outils : on le neutralise partout. */
  await ctx.addInitScript(() => {
    try { sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {}
    try { localStorage.setItem("adexweb-theme", "light"); } catch (e) {}
  });
  if (opts.enregistreur) {
    await ctx.addInitScript(opts.enregistreur.fn, opts.enregistreur.arg);
  }
  return ctx;
}

const rapport = { date: new Date().toISOString(), base: BASE, a: {}, b: {}, c: {} };

const nav = await chromium.launch();

/* ==========================================================
   A · LA REVELATION DU TITRE, CHIFFRES PUIS IMAGES
   ========================================================== */
{
  const ctx = await nouveauContexte(nav, {
    enregistreur: {
      fn: ([p, f]) => {
        const cibles = p.map((x) => ({ nom: x.nom, sel: x.sel, pseudo: "::after" }))
          .concat(f.map((x) => ({ nom: x.nom, sel: x.sel, pseudo: null })));
        window.__diag = { ech: [], nav: null };
        try {
          const n = performance.getEntriesByType("navigation")[0];
          window.__diag.nav = n ? n.type : null;
        } catch (e) {}
        const cache = {};
        (function tour() {
          const t = performance.now();
          const ligne = { t: +t.toFixed(1), cls: document.documentElement.className, v: {} };
          for (const c of cibles) {
            let el = cache[c.nom];
            if (!el || !el.isConnected) { el = cache[c.nom] = document.querySelector(c.sel); }
            if (!el) { ligne.v[c.nom] = null; continue; }
            const s = getComputedStyle(el, c.pseudo);
            ligne.v[c.nom] = {
              tr: s.transform,
              op: s.opacity,
              bg: c.pseudo ? s.backgroundColor : (s.backgroundImage || "").slice(0, 70),
              ct: c.pseudo ? s.content : null,
            };
          }
          window.__diag.ech.push(ligne);
          if (t < 4000) requestAnimationFrame(tour);
        })();
      },
      arg: [PAS, FILETS],
    },
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "#top", { waitUntil: "load" });
  await page.waitForTimeout(4200);
  const d = await page.evaluate(() => window.__diag);

  rapport.a.navigation = d.nav;
  rapport.a.classesVues = [...new Set(d.ech.map((l) => l.cls))];
  rapport.a.echantillons = d.ech.length;
  rapport.a.pas = {};

  for (const p of PAS.concat(FILETS)) {
    const serie = d.ech
      .map((l) => ({ t: l.t, x: l.v[p.nom] ? scaleXDe(l.v[p.nom].tr) : null,
                     ct: l.v[p.nom] ? l.v[p.nom].ct : null,
                     bg: l.v[p.nom] ? l.v[p.nom].bg : null }))
      .filter((s) => s.x !== null);
    if (!serie.length) { rapport.a.pas[p.nom] = { etat: "AUCUN pseudo-element / aucune transformation" }; continue; }
    const xs = serie.map((s) => s.x);
    const min = Math.min(...xs), max = Math.max(...xs);
    const bouge = max - min > 0.02;
    let debut = null, fin = null;
    if (bouge) {
      for (const s of serie) { if (s.x < 0.99 && debut === null) debut = s.t; }
      for (const s of serie) { if (s.x < 0.01 && fin === null) fin = s.t; }
    }
    rapport.a.pas[p.nom] = {
      etat: bouge ? "JOUE" : "IMMOBILE",
      scaleXmin: +min.toFixed(3), scaleXmax: +max.toFixed(3),
      debutMs: debut, finMs: fin,
      dureeMs: debut !== null && fin !== null ? +(fin - debut).toFixed(0) : null,
      contenu: serie[0].ct, fond: serie[0].bg,
    };
  }
  await ctx.close();
}

/* ---------- A2 · les images reelles, en temps reel ---------- */
{
  const ctx = await nouveauContexte(nav);
  const page = await ctx.newPage();
  const dossier = path.join(SORTIE, "a-titre-temps-reel");
  fs.mkdirSync(dossier, { recursive: true });
  const clip = { x: 0, y: 60, width: 940, height: 620 };
  const nav0 = Date.now();
  await page.goto(BASE + "#top", { waitUntil: "commit" });
  const images = [];
  for (let i = 0; i < 34; i++) {
    const t = Date.now() - nav0;
    let buf;
    try { buf = await page.screenshot({ clip }); } catch (e) { continue; }
    const f = path.join(dossier, String(i).padStart(2, "0") + "-" + t + "ms.png");
    fs.writeFileSync(f, buf);
    images.push({ i, t, f, buf });
    if (t > 3200) break;
  }
  const diffs = [];
  for (let i = 1; i < images.length; i++) {
    const a = decodePNG(images[i - 1].buf), b = decodePNG(images[i].buf);
    const s = diffStats(a, b);
    diffs.push({ de: images[i - 1].t, a: images[i].t, ...s });
    delete images[i - 1].buf;
  }
  rapport.a.imagesTempsReel = {
    dossier, nb: images.length,
    ecartMax: diffs.length ? Math.max(...diffs.map((d) => d.pct)) : 0,
    imagesQuiBougent: diffs.filter((d) => d.pct > 1).length,
    detail: diffs,
  };
  await ctx.close();
}

/* ==========================================================
   B · LE VERROU DE SESSION
   ========================================================== */
{
  const releve = async (page) =>
    page.evaluate(() => ({
      cls: document.documentElement.className,
      rideau: !!document.getElementById("entree"),
      saut: (() => { try { return sessionStorage.getItem("adexweb-entree-saut"); } catch (e) { return "?"; } })(),
      navType: (() => { try { const n = performance.getEntriesByType("navigation")[0]; return n ? n.type : null; } catch (e) { return null; } })(),
    }));

  /* B1 — visiteur SAGE : il ne touche a rien. */
  const ctx1 = await nouveauContexte(nav);
  const p1 = await ctx1.newPage();
  const sage = [];
  await p1.goto(BASE + "#top", { waitUntil: "commit" });
  await p1.waitForTimeout(250);
  sage.push({ passe: "1er chargement", ...(await releve(p1)) });
  for (let i = 2; i <= 6; i++) {
    await p1.waitForTimeout(1600);
    await p1.reload({ waitUntil: "commit" });
    await p1.waitForTimeout(250);
    sage.push({ passe: "rechargement " + (i - 1), ...(await releve(p1)) });
  }
  rapport.b.sage = sage;
  await ctx1.close();

  /* B2 — visiteur NORMAL : il clique une fois pendant l'entree.
     C'est le cas reel : on arrive, on clique, on recharge. */
  const ctx2 = await nouveauContexte(nav);
  const p2 = await ctx2.newPage();
  const clic = [];
  await p2.goto(BASE + "#top", { waitUntil: "commit" });
  await p2.waitForTimeout(300);
  await p2.mouse.click(720, 820);           // un clic pendant la sequence
  await p2.waitForTimeout(300);
  clic.push({ passe: "1er chargement + 1 clic", ...(await releve(p2)) });
  for (let i = 2; i <= 5; i++) {
    await p2.waitForTimeout(1200);
    await p2.reload({ waitUntil: "commit" });
    await p2.waitForTimeout(300);
    clic.push({ passe: "rechargement " + (i - 1), ...(await releve(p2)) });
  }
  rapport.b.apresUnClic = clic;
  await ctx2.close();

  /* B3 — mouvement reduit, pour memoire. */
  const ctx3 = await nav.newContext({
    viewport: { width: LARGEUR, height: HAUTEUR }, reducedMotion: "reduce",
  });
  await ctx3.addInitScript(() => { try { sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {} });
  const p3 = await ctx3.newPage();
  await p3.goto(BASE + "#top", { waitUntil: "commit" });
  await p3.waitForTimeout(400);
  rapport.b.mouvementReduit = await releve(p3);
  await ctx3.close();
}

/* ==========================================================
   C · LES DEUX BOUTONS AU SURVOL
   ========================================================== */
{
  const ctx = await nouveauContexte(nav);
  const page = await ctx.newPage();
  await page.goto(BASE + "#top", { waitUntil: "load" });
  /* La vague 2 part au premier geste OU a 1,2 s. Un `pointermove`
     suffit et ne declenche PAS le saut de la sequence (qui
     n'ecoute que `pointerdown` et `keydown`). */
  await page.mouse.move(20, 20);
  await page.waitForFunction(
    () => !!document.querySelector('script[src*="langue.js"]'),
    null, { timeout: 6000 }
  ).catch(() => {});
  await page.waitForTimeout(2600);   // que la composition soit finie

  const boutons = [
    { nom: "primaire",   sel: '.hero-cta .btn--primary' },
    { nom: "secondaire", sel: '.hero-cta .btn--ghost' },
  ];

  rapport.c.boutons = {};
  for (const b of boutons) {
    const el = page.locator(b.sel);
    const avant = await page.evaluate((sel) => {
      const n = document.querySelector(sel);
      const s = getComputedStyle(n, "::before");
      return {
        dataLettres: n.hasAttribute("data-lettres"),
        cran: getComputedStyle(n).getPropertyValue("--cran").trim(),
        avantContenu: s.content, avantTr: s.transform, avantBg: s.backgroundColor,
        nbLettres: n.querySelectorAll(".l").length,
        palier: document.documentElement.getAttribute("data-palier"),
      };
    }, b.sel);

    /* Premier survol : on lance l'echantillonnage AVANT de bouger
       la souris, sinon on rate la premiere image — qui est
       justement celle qui compte. */
    const mesure = async (etiquette) => {
      await page.evaluate((sel) => {
        window.__h = [];
        const n = document.querySelector(sel);
        const t0 = performance.now();
        (function tour() {
          const t = performance.now() - t0;
          const sb = getComputedStyle(n, "::before");
          const l = n.querySelector(".l");
          window.__h.push({
            t: +t.toFixed(1),
            tr: sb.transform, bg: sb.backgroundColor, ct: sb.content,
            attr: n.hasAttribute("data-lettres"),
            coul: l ? getComputedStyle(l).color : getComputedStyle(n).color,
            bord: getComputedStyle(n).borderColor,
          });
          if (t < 1000) requestAnimationFrame(tour);
        })();
      }, b.sel);
      const bo = await el.boundingBox();
      await page.mouse.move(bo.x + bo.width / 2, bo.y + bo.height / 2);
      await page.waitForTimeout(1100);
      const h = await page.evaluate(() => window.__h);
      return { etiquette, h };
    };

    await page.mouse.move(20, 20);
    await page.waitForTimeout(400);
    const s1 = await mesure("survol 1");
    await page.mouse.move(20, 20);
    await page.waitForTimeout(900);
    const s2 = await mesure("survol 2");

    const resume = (s) => {
      const xs = s.h.map((e) => ({ t: e.t, x: scaleXDe(e.tr), attr: e.attr, coul: e.coul, bg: e.bg }));
      const dispo = xs.filter((e) => e.x !== null);
      if (!dispo.length) return { etat: "AUCUN ::before" };
      const min = Math.min(...dispo.map((e) => e.x)), max = Math.max(...dispo.map((e) => e.x));
      const inter = dispo.filter((e) => e.x > 0.02 && e.x < 0.98).length;
      const couleurs = [...new Set(s.h.map((e) => e.coul))];
      return {
        etat: max - min > 0.02 ? "BALAYAGE VU" : (max > 0.98 ? "APLAT DEJA PLEIN (pas de transition)" : "IMMOBILE"),
        scaleXmin: +min.toFixed(3), scaleXmax: +max.toFixed(3),
        imagesIntermediaires: inter,
        premierEch: dispo[0], dernierEch: dispo[dispo.length - 1],
        couleursDeLettre: couleurs,
        attrAuDepart: s.h[0].attr,
      };
    };
    rapport.c.boutons[b.nom] = { avant, survol1: resume(s1), survol2: resume(s2) };

    /* Les images : sur le survol qui compte, le second. */
    const dossier = path.join(SORTIE, "c-survol-" + b.nom);
    fs.mkdirSync(dossier, { recursive: true });
    const bo = await el.boundingBox();
    const clip = {
      x: Math.max(0, bo.x - 12), y: Math.max(0, bo.y - 12),
      width: Math.min(LARGEUR - bo.x + 12, bo.width + 24), height: bo.height + 24,
    };
    await page.mouse.move(20, 20);
    await page.waitForTimeout(900);
    const suite = [];
    fs.writeFileSync(path.join(dossier, "00-repos.png"), await page.screenshot({ clip }));
    const t0 = Date.now();
    await page.mouse.move(bo.x + bo.width / 2, bo.y + bo.height / 2);
    for (let i = 1; i <= 12; i++) {
      const buf = await page.screenshot({ clip });
      const t = Date.now() - t0;
      const f = path.join(dossier, String(i).padStart(2, "0") + "-" + t + "ms.png");
      fs.writeFileSync(f, buf);
      suite.push({ t, buf });
      if (t > 900) break;
    }
    const dif = [];
    for (let i = 1; i < suite.length; i++) {
      dif.push({ de: suite[i - 1].t, a: suite[i].t, ...diffStats(decodePNG(suite[i - 1].buf), decodePNG(suite[i].buf)) });
    }
    rapport.c.boutons[b.nom].images = { dossier, ecarts: dif };
  }
  await ctx.close();
}

await nav.close();

fs.writeFileSync(path.join(SORTIE, "diag.json"), JSON.stringify(rapport, null, 2));

/* ---------------- SORTIE LISIBLE ---------------- */
const L = console.log;
L("\n=========== A · LA REVELATION DU TITRE ===========");
L("navigation :", rapport.a.navigation, "| classes vues sur <html> :", rapport.a.classesVues.join(" || "));
L("echantillons a 60 Hz :", rapport.a.echantillons);
L("");
L("pas".padEnd(14), "etat".padEnd(12), "scaleX".padEnd(16), "debut".padEnd(9), "fin".padEnd(9), "duree");
for (const [nom, v] of Object.entries(rapport.a.pas)) {
  L(nom.padEnd(14), String(v.etat).padEnd(12),
    (v.scaleXmax !== undefined ? v.scaleXmax + " -> " + v.scaleXmin : "-").padEnd(16),
    String(v.debutMs ?? "-").padEnd(9), String(v.finMs ?? "-").padEnd(9), String(v.dureeMs ?? "-"));
}
const ir = rapport.a.imagesTempsReel;
L("\nimages reelles :", ir.nb, "| ecart max entre deux images :", ir.ecartMax + " % de pixels",
  "| images qui bougent (>1 %) :", ir.imagesQuiBougent);

L("\n=========== B · LE VERROU DE SESSION ===========");
L("-- visiteur qui ne touche a rien --");
for (const r of rapport.b.sage) L(" ", r.passe.padEnd(22), "nav=" + String(r.navType).padEnd(12), "saut=" + String(r.saut).padEnd(6), "rideau=" + r.rideau, "|", r.cls);
L("-- visiteur qui clique une fois --");
for (const r of rapport.b.apresUnClic) L(" ", r.passe.padEnd(22), "nav=" + String(r.navType).padEnd(12), "saut=" + String(r.saut).padEnd(6), "rideau=" + r.rideau, "|", r.cls);
L("-- mouvement reduit --");
L("  ", JSON.stringify(rapport.b.mouvementReduit));

L("\n=========== C · LES DEUX BOUTONS ===========");
for (const [nom, v] of Object.entries(rapport.c.boutons)) {
  L("\n[" + nom + "]  --cran =", v.avant.cran, "| data-lettres au repos :", v.avant.dataLettres,
    "| lettres decoupees :", v.avant.nbLettres, "| palier :", v.avant.palier);
  L("   ::before au repos  contenu =", v.avant.avantContenu, " transform =", v.avant.avantTr, " fond =", v.avant.avantBg);
  L("   survol 1 :", JSON.stringify(v.survol1));
  L("   survol 2 :", JSON.stringify(v.survol2));
  const e = v.images.ecarts;
  L("   images    :", e.map((d) => d.a + "ms:" + d.pct + "%").join("  "));
}
L("\nJSON complet :", path.join(SORTIE, "diag.json"));
