/* ============================================================
   ACCUEIL — LA PREUVE DU CHANTIER 01

   Sept relevés, chacun avec un chiffre plutot qu'une impression :

   1. CONTENU   les sept plaques, mot pour mot, plus la chasse aux
                enonces retires (« 24 h », « industries déjà
                servies », « gabarit acheté », « secteurs livrés »)
   2. ENTREE    la composition du hero, image par image, avec le
                moment exact ou chaque pas se decouvre
   3. BOUTONS   les deux CTA au survol : duree, couleurs relevees
                DANS la page, contraste a chaque image
   4. PLAQUES   lisibilite a l'arret : contraste du chiffre et de la
                phrase, angle reel, boite reelle, capture de chacune
   5. DERIVE    le mouvement au defilement, borne verifiee
   6. TENUE     i/s pendant la traversee de l'accueil, LCP, CLS
   7. CADRE     debordement horizontal a neuf largeurs, console

   PIEGES D'INSTRUMENT TENUS :
   · on LIT les valeurs dans la page, on ne photographie pas un
     timing — une capture est plus lente qu'une transition ;
   · on defile PAR PAS, jamais d'un saut, sinon un pin casse ;
   · `color-mix()` se calcule en `color(srgb …)`, pas en `rgb()` :
     le lecteur de couleur ci-dessous accepte les deux ;
   · on remesure chaque cible juste avant de la capturer.

   Usage : node tools/serve.mjs 8099   puis
           node tools/accueil-check.mjs [contenu|entree|boutons|
                                         plaques|derive|tenue|cadre]
   ============================================================ */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.APED_BASE || "http://localhost:8099";
const RACINE = join(process.cwd(), "refonte-captures", "accueil");
const dossier = (s) => { const d = join(RACINE, s); mkdirSync(d, { recursive: true }); return d; };
const nb = (n, l = 2) => String(n).padStart(l, "0");
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const rapport = {};

/* ---------- couleur : rgb(), rgba() ET color(srgb …) ---------- */
function lire(c) {
  if (!c) return null;
  let m = String(c).match(/^rgba?\(([^)]+)\)/);
  if (m) {
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r: p[0] / 255, g: p[1] / 255, b: p[2] / 255, a: p.length > 3 ? p[3] : 1 };
  }
  m = String(c).match(/^color\(srgb\s+([^)]+)\)/);
  if (m) {
    const p = m[1].split(/[\s/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  return null;
}
const lin = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
function sur(av, fond) {
  if (av.a >= 0.999) return av;
  return { r: av.r * av.a + fond.r * (1 - av.a), g: av.g * av.a + fond.g * (1 - av.a), b: av.b * av.a + fond.b * (1 - av.a), a: 1 };
}
function ratio(txt, fond) {
  const a = lire(txt), b = lire(fond);
  if (!a || !b) return null;
  const t = sur(a, b);
  const l1 = lum(t), l2 = lum(b);
  return +(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05))).toFixed(2);
}

/* ---------- defilement par pas, comme un visiteur ---------- */
async function descendre(page, cible, pas = 140) {
  let y = await page.evaluate(() => window.scrollY);
  while (y < cible) {
    y = Math.min(cible, y + pas);
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await attendre(28);
  }
  await attendre(280);
}

async function ouvrir(nav, opt = {}) {
  const page = await nav.newPage({
    viewport: opt.viewport || { width: 1440, height: 900 },
    colorScheme: opt.theme || "light",
    reducedMotion: opt.reduced ? "reduce" : "no-preference",
    deviceScaleFactor: 1,
  });
  /* L'INTERRUPTEUR PREVU POUR LES OUTILS DE MESURE.
     `main.js` lit `aped-sans-popup` et n'ouvre alors jamais le
     cadeau. Sans lui, le `<dialog>` s'ouvre entre la 11e et la 20e
     seconde, capture tous les evenements de pointeur de la page, et
     n'importe quel survol de bouton expire en accusant le mauvais
     coupable. Le popup a son propre outil — `cadeau-check.mjs` ;
     ici on mesure autre chose. */
  await page.addInitScript(() => {
    try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {}
  });
  const erreurs = [];
  page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
  page.on("pageerror", (e) => erreurs.push("pageerror: " + e.message));
  page._erreurs = erreurs;
  return page;
}

/* LE POPUP CADEAU S'OUVRE TOUT SEUL ET INTERCEPTE LES CLICS.
   Il s'ouvre sur intention de sortie ou apres un delai, et un
   `<dialog>` ouvert par `showModal()` capture TOUS les evenements
   de pointeur de la page : sans ce nettoyage, un survol de bouton
   expire au bout de trente secondes en accusant le mauvais
   coupable. Ce n'est pas un contournement de defaut — c'est le
   comportement voulu du popup, et on mesure autre chose. */
async function fermerPopups(page) {
  await page.evaluate(() => {
    document.querySelectorAll("dialog[open]").forEach((d) => { try { d.close(); } catch (e) { d.removeAttribute("open"); } });
  });
  await attendre(200);
}

/* ============================================================
   1 · CONTENU
   ============================================================ */
async function contenu(nav) {
  const page = await ouvrir(nav);
  await page.goto(BASE + "/index.html", { waitUntil: "networkidle" });
  await attendre(1200);

  const r = await page.evaluate(() => {
    const plaques = [...document.querySelectorAll(".plaque")].map((p) => ({
      chiffre: p.querySelector(".num").textContent.trim(),
      phrase: p.querySelector("span").textContent.trim(),
    }));
    const t = document.body.innerText;
    return {
      plaques,
      /* Les enonces retires ne doivent plus exister NULLE PART dans
         le texte rendu. Un test qui cherche dans la source raterait
         tout ce que `main.js` injecte — les treize apercus, par
         exemple, qui portaient « secteurs livrés ». */
      restes: {
        "24 h": (t.match(/24\s*h/g) || []).length,
        "industries déjà servies": (t.match(/industries d[ée]j[àa] servies/gi) || []).length,
        "gabarit acheté": (t.match(/[Gg]abarit achet[ée]/g) || []).length,
        "secteurs livrés": (t.match(/secteurs livr[ée]s/gi) || []).length,
        "12 h": (t.match(/12\s*h/g) || []).length,
      },
      /* Aucun prix : on cherche tout montant en dollars dans la
         zone accueil. */
      dollars: (document.querySelector("#top").parentNode.innerText.slice(0, 4000).match(/\d[\d\s ]*\$/g) || []),
    };
  });

  /* Les treize apercus de secteurs sont poses par `main.js` a
     l'entree de la section : on y descend avant de conclure. Et on
     lit `textContent` et non `innerText` — `content-visibility:
     auto` retire du second tout ce qui est hors ecran, ce qui
     ferait passer n'importe quel enonce fautif pour absent. */
  const ySect = await page.evaluate(() => Math.round(document.querySelector("#demos").getBoundingClientRect().top + window.scrollY));
  await descendre(page, ySect + 400, 260);
  await attendre(1400);
  const apresSecteurs = await page.evaluate(() => {
    const t = document.body.textContent;
    return {
      apercus: document.querySelectorAll(".mock").length,
      "secteurs livrés": (t.match(/secteurs livr[ée]s/gi) || []).length,
      "secteurs couverts": (t.match(/secteurs couverts/gi) || []).length,
      "24 h partout": (t.match(/24\s*h/g) || []).length,
      "12 h partout": (t.match(/12\s*h/g) || []).length,
    };
  });

  r.apresSecteurs = apresSecteurs;
  r.erreurs = page._erreurs;
  await page.close();
  rapport.contenu = r;
  console.log("\n=== 1 · CONTENU ===");
  r.plaques.forEach((p, i) => console.log(`  ${nb(i + 1)}  ${p.chiffre.padEnd(8)} ${p.phrase}`));
  console.log("  restes :", JSON.stringify(r.restes));
  console.log("  apres chargement des secteurs :", JSON.stringify(apresSecteurs));
  console.log("  montants en dollars dans l'accueil :", r.dollars.length ? r.dollars : "aucun");
  return r;
}

/* ============================================================
   2 · ENTREE — la composition du hero, relevee a 60 Hz
   ============================================================ */
async function entree(nav) {
  const d = dossier("entree");
  const page = await ouvrir(nav);

  /* La sonde demarre AVANT tout script de la page : sinon on
     photographie la fin du mouvement. */
  await page.addInitScript(() => {
    window.__he = [];
    const demarrer = () => {
      const t0 = performance.now();
      const tic = () => {
        const cibles = [...document.querySelectorAll(".he")];
        if (cibles.length) {
          window.__he.push({
            t: +(performance.now() - t0).toFixed(1),
            e: cibles.map((el) => {
              const cs = getComputedStyle(el, "::after");
              const csr = getComputedStyle(el);
              return { sx: cs.transform, o: +csr.opacity, e: csr.getPropertyValue("--e").trim() };
            }),
            f: [...document.querySelectorAll(".fiche-rule")].map((el) => {
              const cs = getComputedStyle(el);
              return { tf: cs.transform, bg: cs.backgroundImage.slice(0, 34) };
            }),
          });
        }
        if (window.__he.length < 260) requestAnimationFrame(tic);
      };
      tic();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer);
    else demarrer();
  });

  await page.goto(BASE + "/index.html", { waitUntil: "domcontentloaded" });
  await attendre(4500);

  const brut = await page.evaluate(() => ({
    ech: window.__he,
    noms: [...document.querySelectorAll(".he")].map((el) => (el.className + " · " + (el.textContent || "").trim().slice(0, 26))),
  }));

  const pas = [];
  if (brut.ech.length) {
    const n = brut.ech[0].e.length;
    for (let i = 0; i < n; i++) {
      const sx = brut.ech.map((s) => {
        const m = String(s.e[i].sx).match(/matrix\(([^)]+)\)/);
        return m ? Number(m[1].split(",")[0]) : 1;
      });
      /* debut = premiere image ou la plaque commence a se retirer ;
         fin = premiere image ou elle a disparu */
      let iD = 0; while (iD < sx.length - 1 && sx[iD] > 0.995) iD++;
      let iF = iD; while (iF < sx.length - 1 && sx[iF] > 0.005) iF++;
      pas.push({
        pas: i, quoi: brut.noms[i], retard_ecrit_ms: brut.ech[0].e[i].e,
        decouvre_a_ms: brut.ech[iD] ? brut.ech[iD].t : null,
        fini_a_ms: brut.ech[iF] ? brut.ech[iF].t : null,
        duree_ms: brut.ech[iF] && brut.ech[iD] ? +(brut.ech[iF].t - brut.ech[iD].t).toFixed(1) : null,
        /* Zero valeur intermediaire d'OPACITE : la plaque se
           retire, le texte ne fond pas. */
        opacites: [...new Set(brut.ech.map((s) => s.e[i].o))],
      });
    }
  }
  const debuts = pas.map((p) => p.decouvre_a_ms).filter((v) => v != null);
  const decalages = debuts.slice(1).map((v, i) => +(v - debuts[i]).toFixed(1));

  /* les cinq filets : trace puis soudure */
  const filets = [];
  if (brut.ech.length) {
    for (let i = 0; i < brut.ech[0].f.length; i++) {
      const sx = brut.ech.map((s) => { const m = String(s.f[i].tf).match(/matrix\(([^)]+)\)/); return m ? Number(m[1].split(",")[0]) : 1; });
      const bg = brut.ech.map((s) => s.f[i].bg);
      /* LA SONDE DEMARRE AVANT `main.js`, DONC AVANT `compo-hero`.
         Chercher naivement la premiere image ou le filet est plein
         renvoie l'image ZERO — le filet est a son etat de repos,
         l'animation n'est pas encore attachee. On cherche donc
         d'abord l'image ou il RETOMBE a zero, c'est-a-dire ou
         `backwards` prend effet, puis la fin de la trace apres
         elle. C'est le meme piege que « une capture est plus lente
         qu'une transition », a l'envers : ici la sonde est plus
         rapide que la page. */
      let i0 = 0; while (i0 < sx.length - 1 && sx[i0] > 0.005) i0++;
      const attachee = sx[i0] <= 0.005;
      let iD = i0; while (iD < sx.length - 1 && sx[iD] < 0.995) iD++;
      /* Meme piege sur le fond : l'image zero porte le trait plein
         de repos. On part donc de la premiere image EN TRAME. */
      let iT = 0; while (iT < bg.length - 1 && !/repeating/.test(bg[iT])) iT++;
      let iS = iT; while (iS < bg.length - 1 && /repeating/.test(bg[iS])) iS++;
      const jamaisTrame = !bg.some((v) => /repeating/.test(v));
      filets.push({
        filet: i,
        animation_attachee: attachee,
        trace_part_ms: attachee && brut.ech[i0] ? brut.ech[i0].t : null,
        trace_finie_ms: attachee && brut.ech[iD] ? brut.ech[iD].t : null,
        soude_a_ms: jamaisTrame || /repeating/.test(bg[bg.length - 1]) ? null : (brut.ech[iS] ? brut.ech[iS].t : null),
        trames: [...new Set(bg)].length,
      });
    }
  }

  /* film de l'arrivee, 18 images */
  const p2 = await ouvrir(nav);
  p2.goto(BASE + "/index.html", { waitUntil: "commit" }).catch(() => {});
  for (let k = 0; k < 18; k++) {
    await p2.screenshot({ path: join(d, `arrivee-${nb(k)}.png`), clip: { x: 0, y: 0, width: 1440, height: 900 } }).catch(() => {});
    await attendre(95);
  }
  await p2.close();

  /* mouvement reduit : la composition doit etre entiere et immobile */
  const p3 = await ouvrir(nav, { reduced: true });
  await p3.goto(BASE + "/index.html", { waitUntil: "networkidle" });
  await attendre(1600);
  const reduit = await p3.evaluate(() => [...document.querySelectorAll(".he")].map((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el, "::after");
    return { t: (el.textContent || "").trim().slice(0, 24), visible: r.width > 0 && r.height > 0, opacite: +getComputedStyle(el).opacity, plaque: cs.content };
  }));
  await p3.screenshot({ path: join(d, "mouvement-reduit.png") });
  await p3.close();

  const r = { pas, decalages_ms: decalages, filets, mouvementReduit: reduit, erreurs: page._erreurs };
  await page.close();
  rapport.entree = r;
  console.log("\n=== 2 · ENTREE ===");
  pas.forEach((p) => console.log("  ", JSON.stringify(p)));
  console.log("  decalages entre pas (ms) :", decalages);
  console.log("  filets :", JSON.stringify(filets));
  console.log("  mouvement reduit — tous visibles :", reduit.every((x) => x.visible && x.opacite === 1), "· plaques rendues :", reduit.filter((x) => x.plaque !== "none").length);
  return r;
}

/* ============================================================
   3 · BOUTONS — le survol releve DANS la page, image par image
   ============================================================ */
async function boutons(nav) {
  const d = dossier("boutons");
  const out = [];
  for (const theme of ["light", "dark"]) {
    const page = await ouvrir(nav, { theme });
    await page.goto(BASE + "/index.html", { waitUntil: "networkidle" });
    await attendre(1800);
    /* on termine la sequence d'entree avant de mesurer un survol */
    await page.mouse.move(700, 700);
    await attendre(900);
    await fermerPopups(page);

    for (const sel of ['.hero-cta .btn--primary', '.hero-cta .btn--ghost']) {
      const boite = await page.evaluate((s) => {
        const b = document.querySelector(s);
        const r = b.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: Math.round(r.width), h: Math.round(r.height), cran: getComputedStyle(b).getPropertyValue("--cran").trim(), n: b.querySelectorAll(".l").length };
      }, sel);

      await fermerPopups(page);
      await page.mouse.move(40, 620);
      await attendre(700);
      /* on decoupe le bouton avant de mesurer : le decoupage est
         paresseux et sa mise en page fausserait la premiere image */
      await page.evaluate((s) => document.querySelector(s).dispatchEvent(new PointerEvent("pointerenter", { bubbles: true })), sel);
      await attendre(400);

      const releve = await page.evaluate(async (s) => {
        const b = document.querySelector(s);
        const lettres = [...b.querySelectorAll(".l")];
        const lire = () => ({
          plaque: getComputedStyle(b, "::before").transform,
          fond: getComputedStyle(b).backgroundColor,
          cadre: getComputedStyle(b).borderTopColor,
          plaqueFond: getComputedStyle(b, "::before").backgroundColor,
          l: lettres.map((x) => getComputedStyle(x).color),
          icone: b.querySelector(".icon") ? getComputedStyle(b.querySelector(".icon")).color : null,
        });
        window.__b = []; const t0 = performance.now();
        const tic = () => { window.__b.push({ t: +(performance.now() - t0).toFixed(1), e: lire() }); if (window.__b.length < 60) requestAnimationFrame(tic); };
        tic();
        b.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
        b.classList.add("__survol");
        /* `--p` EST LA POSITION REELLE DE LA LETTRE, entre 0 et 1,
           posee par `langue.js`. Modeliser la position par
           `indice / nombre` est faux — les espaces ne comptent pas
           dans l'indice mais comptent dans la largeur, et le libelle
           n'occupe pas tout le bouton. C'est exactement l'erreur qui
           avait produit la fenetre illisible corrigee en phase 8 :
           un outil qui la refait rend des ratios de 1,06:1 sur du
           code intact. */
        return { n: lettres.length, p: lettres.map((x) => parseFloat(getComputedStyle(x).getPropertyValue("--p")) || 0) };
      }, sel);

      await page.hover(sel);
      await attendre(1100);
      const ech = await page.evaluate(() => window.__b);

      /* contraste de CHAQUE lettre a CHAQUE image : la lettre est
         soit devant la plaque, soit devant le fond du bouton. On
         prend le pire des deux, ce qui est la seule lecture
         honnete tant que l'arete n'est pas localisee au pixel. */
      let pire = 99, pireT = null;
      const px = (tf) => { const m = String(tf).match(/matrix\(([^)]+)\)/); return m ? Number(m[1].split(",")[0]) : 1; };
      ech.forEach((s) => {
        const p = px(s.e.plaque);
        s.e.l.forEach((c, i) => {
          const devantPlaque = (releve.p[i] ?? (i + 0.5) / s.e.l.length) <= p;
          const fond = devantPlaque ? s.e.plaqueFond : s.e.fond;
          const rr = ratio(c, fond === "rgba(0, 0, 0, 0)" ? (theme === "dark" ? "rgb(16,18,17)" : "rgb(236,237,234)") : fond);
          if (rr != null && rr < pire) { pire = rr; pireT = s.t; }
        });
      });
      const course = ech.map((s) => px(s.e.plaque));
      let iF = course.length - 1; while (iF > 0 && course[iF] > 0.999 && course[iF - 1] > 0.999) iF--;

      out.push({
        theme, bouton: sel, cran: boite.cran, lettres: releve.n,
        ms_par_lettre: +(parseFloat(boite.cran) / releve.n).toFixed(1),
        course_plaque: `${course[0].toFixed(2)} → ${course[course.length - 1].toFixed(2)}`,
        fin_course_ms: ech[iF] ? ech[iF].t : null,
        fond_plaque: [...new Set(ech.map((s) => s.e.plaqueFond))].slice(0, 3),
        couleurs_lettres: [...new Set(ech.flatMap((s) => s.e.l))].slice(0, 4),
        contraste_min: pire === 99 ? null : pire, contraste_min_a_ms: pireT,
      });

      /* film du survol, 12 images */
      const sd = join(d, `${theme}-${sel.includes("primary") ? "primaire" : "secondaire"}`);
      mkdirSync(sd, { recursive: true });
      await page.mouse.move(40, 620); await attendre(800);
      const clip = await page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: Math.max(0, r.left - 18), y: Math.max(0, r.top - 18), width: r.width + 36, height: r.height + 36 }; }, sel);
      for (let k = 0; k < 12; k++) {
        if (k === 1) await page.hover(sel);
        await page.screenshot({ path: join(sd, `img-${nb(k)}.png`), clip });
        await attendre(46);
      }
      await page.mouse.move(40, 620); await attendre(500);
    }
    await page.close();
  }
  rapport.boutons = out;
  console.log("\n=== 3 · BOUTONS ===");
  out.forEach((o) => console.log("  ", JSON.stringify(o)));
  return out;
}

/* ============================================================
   4 · PLAQUES — lisibilite a l'arret
   ============================================================ */
async function plaques(nav) {
  const d = dossier("plaques");
  const out = [];
  for (const theme of ["light", "dark"]) {
    for (const [w, h] of [[1440, 900], [1024, 800], [768, 900], [390, 844]]) {
      const page = await ouvrir(nav, { theme, viewport: { width: w, height: h } });
      await page.goto(BASE + "/index.html", { waitUntil: "networkidle" });
      await attendre(1600);
      const y = await page.evaluate(() => document.querySelector(".plaques").getBoundingClientRect().top + window.scrollY - 120);
      await descendre(page, Math.max(0, Math.round(y)));
      /* On laisse le scrub se stabiliser : un detecteur qui n'attend
         pas assez confond « animation en vol » et « texte echoue ». */
      await attendre(900);

      const lu = await page.evaluate(() => {
        const bande = document.querySelector(".plaques");
        const bandeBg = getComputedStyle(bande).backgroundColor;
        const fondPage = getComputedStyle(document.body).backgroundColor;
        return [...document.querySelectorAll(".plaque")].map((p, i) => {
          const num = p.querySelector(".num"), ph = p.querySelector("span");
          const r = (p.querySelector(".plaque-corps") || p).getBoundingClientRect();
          const corps = p.querySelector(".plaque-corps") || p;
          const cs = getComputedStyle(p);
          const csc = getComputedStyle(corps);
          const m = String(cs.transform).match(/matrix\(([^)]+)\)/);
          const mc = String(csc.transform).match(/matrix\(([^)]+)\)/);
          const rot = mc ? +(Math.atan2(+mc[1].split(",")[1], +mc[1].split(",")[0]) * 180 / Math.PI).toFixed(2) : 0;
          const angleGsap = m ? +(Math.atan2(+m[1].split(",")[1], +m[1].split(",")[0]) * 180 / Math.PI).toFixed(2) : 0;
          return {
            i, chiffre: num.textContent.trim(),
            fond: csc.backgroundColor === "rgba(0, 0, 0, 0)" ? (bandeBg === "rgba(0, 0, 0, 0)" ? fondPage : bandeBg) : csc.backgroundColor,
            couleurNum: getComputedStyle(num).color,
            couleurPhrase: getComputedStyle(ph).color,
            tailleNum: getComputedStyle(num).fontSize,
            angleRepos: rot, angleGsap, angleTotal: +(rot + angleGsap).toFixed(2),
            boite: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
            opacite: +cs.opacity,
            zone: { x: Math.round(r.left) - 14, y: Math.round(r.top) - 14, w: Math.round(r.width) + 28, h: Math.round(r.height) + 28 },
          };
        });
      });

      const sd = join(d, `${theme}-${w}`);
      mkdirSync(sd, { recursive: true });
      for (let i = 0; i < lu.length; i++) {
        const p = lu[i];
        const clip = {
          x: Math.max(0, p.zone.x), y: Math.max(0, p.zone.y),
          width: Math.min(w - Math.max(0, p.zone.x), p.zone.w),
          height: Math.min(h - Math.max(0, p.zone.y), p.zone.h),
        };
        if (clip.width > 4 && clip.height > 4) await page.screenshot({ path: join(sd, `plaque-${nb(i + 1)}.png`), clip });
        out.push({
          theme, largeur: w, plaque: i + 1, chiffre: p.chiffre,
          angleRepos: p.angleRepos, angleDerive: p.angleGsap, angleTotal: p.angleTotal,
          contraste_chiffre: ratio(p.couleurNum, p.fond),
          contraste_phrase: ratio(p.couleurPhrase, p.fond),
          taille: p.tailleNum, opacite: p.opacite, boite: p.boite,
        });
      }
      await page.screenshot({ path: join(sd, "bande.png") });
      await page.close();
    }
  }
  rapport.plaques = out;
  console.log("\n=== 4 · PLAQUES ===");
  const mauvais = out.filter((o) => (o.contraste_chiffre != null && o.contraste_chiffre < 4.5) || (o.contraste_phrase != null && o.contraste_phrase < 4.5) || o.opacite < 0.999);
  console.log(`  ${out.length} relevés · angles [${[...new Set(out.map((o) => o.angleTotal))].sort((a, b) => a - b).slice(0, 3).join(", ")} … ${[...new Set(out.map((o) => o.angleTotal))].sort((a, b) => b - a).slice(0, 1)}]`);
  console.log("  contraste chiffre min :", Math.min(...out.map((o) => o.contraste_chiffre ?? 99)),
    "· phrase min :", Math.min(...out.map((o) => o.contraste_phrase ?? 99)));
  console.log("  sous 4,5:1 ou opacite < 1 :", mauvais.length ? mauvais : "aucun");
  return out;
}

/* ============================================================
   5 · DERIVE — bornee, et verifiee bornee
   ============================================================ */
async function derive(nav) {
  const page = await ouvrir(nav);
  await page.goto(BASE + "/index.html", { waitUntil: "networkidle" });
  await attendre(1600);
  const cible = await page.evaluate(() => Math.round(document.querySelector(".plaques").getBoundingClientRect().top + window.scrollY));

  const suivi = [];
  for (let y = Math.max(0, cible - 900); y <= cible + 900; y += 90) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await attendre(80);
    suivi.push(await page.evaluate((yy) => ({
      y: yy,
      p: [...document.querySelectorAll(".plaque")].map((p) => {
        const cs = getComputedStyle(p);
        const m = String(cs.transform).match(/matrix\(([^)]+)\)/);
        if (!m) return { ty: 0, rot: 0 };
        const v = m[1].split(",").map(Number);
        return { ty: +v[5].toFixed(2), rot: +(Math.atan2(v[1], v[0]) * 180 / Math.PI).toFixed(2) };
      }),
    }), y));
  }

  const n = suivi[0].p.length;
  const bilan = [];
  for (let i = 0; i < n; i++) {
    const ty = suivi.map((s) => s.p[i].ty), rot = suivi.map((s) => s.p[i].rot);
    bilan.push({
      plaque: i + 1,
      derive_y_px: `${Math.min(...ty).toFixed(1)} → ${Math.max(...ty).toFixed(1)}`,
      amplitude_y_px: +(Math.max(...ty) - Math.min(...ty)).toFixed(1),
      rotation_ajoutee_deg: `${Math.min(...rot).toFixed(2)} → ${Math.max(...rot).toFixed(2)}`,
    });
  }
  const r = { bilan, erreurs: page._erreurs };
  await page.close();
  rapport.derive = r;
  console.log("\n=== 5 · DERIVE ===");
  bilan.forEach((b) => console.log("  ", JSON.stringify(b)));
  console.log("  amplitude Y max :", Math.max(...bilan.map((b) => b.amplitude_y_px)), "px");
  return r;
}

/* ============================================================
   6 · TENUE — i/s, LCP, CLS
   ============================================================ */
async function tenue(nav) {
  const out = {};
  for (const theme of ["light"]) {
    const page = await ouvrir(nav, { theme });
    await page.addInitScript(() => {
      window.__lcp = 0; window.__cls = 0; window.__lcpEl = "";
      new PerformanceObserver((l) => { const e = l.getEntries(); const d = e[e.length - 1]; window.__lcp = d.startTime; window.__lcpEl = d.element ? (d.element.tagName + "." + String(d.element.className).slice(0, 40)) : ""; }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(BASE + "/index.html", { waitUntil: "networkidle" });
    await attendre(3200);

    /* i/s pendant la traversee de l'accueil, pas par pas */
    const fps = await page.evaluate(async () => {
      const ecarts = []; let dernier = performance.now(); let stop = false;
      const boucle = (t) => { ecarts.push(t - dernier); dernier = t; if (!stop) requestAnimationFrame(boucle); };
      requestAnimationFrame(boucle);
      const fin = document.querySelector(".plaques").getBoundingClientRect().bottom + window.scrollY + 300;
      for (let y = 0; y < fin; y += 42) { window.scrollTo(0, y); await new Promise((r) => requestAnimationFrame(r)); }
      stop = true;
      const t = ecarts.slice(6).sort((a, b) => a - b);
      const q = (p) => t[Math.min(t.length - 1, Math.floor(t.length * p))];
      return { images: t.length, mediane_ms: +q(0.5).toFixed(2), c95_ms: +q(0.95).toFixed(2), sup20ms: t.filter((x) => x > 20).length, ips_median: +(1000 / q(0.5)).toFixed(1) };
    });

    const web = await page.evaluate(() => ({ lcp: Math.round(window.__lcp), lcpEl: window.__lcpEl, cls: +window.__cls.toFixed(4) }));
    out[theme] = { ...web, fps, erreurs: page._erreurs };
    await page.close();
  }
  rapport.tenue = out;
  console.log("\n=== 6 · TENUE ===");
  console.log("  ", JSON.stringify(out));
  return out;
}

/* ============================================================
   7 · CADRE — debordement horizontal, console, planche
   ============================================================ */
async function cadre(nav) {
  const d = dossier("planche");
  const out = [];
  const largeurs = [320, 360, 390, 414, 480, 640, 768, 1024, 1280, 1440, 1920];
  for (const w of largeurs) {
    const page = await ouvrir(nav, { viewport: { width: w, height: 900 } });
    await page.goto(BASE + "/index.html", { waitUntil: "networkidle" });
    await attendre(1500);
    const y = await page.evaluate(() => Math.round(document.querySelector(".plaques").getBoundingClientRect().top + window.scrollY - 80));
    await descendre(page, Math.max(0, y));
    const m = await page.evaluate(() => ({
      docW: document.documentElement.scrollWidth,
      vw: window.innerWidth,
      deborde: document.documentElement.scrollWidth > window.innerWidth + 1,
      /* qui deborde, precisement */
      coupables: [...document.querySelectorAll(".plaques *, .plaques")].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.right > window.innerWidth + 1 || r.left < -1;
      }).map((el) => ({ cls: String(el.className).slice(0, 30), l: Math.round(el.getBoundingClientRect().left), r: Math.round(el.getBoundingClientRect().right) })).slice(0, 6),
    }));
    out.push({ largeur: w, ...m, erreurs: page._erreurs.length, messages: page._erreurs.slice(0, 3) });
    await page.close();
  }

  /* planche complete de l'accueil, deux themes, cinq largeurs */
  for (const theme of ["light", "dark"]) {
    for (const w of [390, 768, 1024, 1440, 1920]) {
      const page = await ouvrir(nav, { theme, viewport: { width: w, height: 1000 } });
      await page.goto(BASE + "/index.html", { waitUntil: "networkidle" });
      await attendre(2600);
      const h = await page.evaluate(() => Math.ceil(document.querySelector(".plaques").getBoundingClientRect().bottom + window.scrollY + 40));
      await page.setViewportSize({ width: w, height: Math.min(3400, h) });
      await attendre(700);
      await page.screenshot({ path: join(d, `accueil-${theme}-${w}.png`) });
      await page.close();
    }
  }

  rapport.cadre = out;
  console.log("\n=== 7 · CADRE ===");
  out.forEach((o) => console.log(`  ${nb(o.largeur, 4)} px  doc ${o.docW} / vue ${o.vw}  ${o.deborde ? "DEBORDE " + JSON.stringify(o.coupables) : "ok"}  · erreurs console ${o.erreurs}${o.erreurs ? " " + JSON.stringify(o.messages) : ""}`));
  return out;
}

/* ============================================================ */
const quoi = (process.argv[2] || "tout").toLowerCase();
const nav = await chromium.launch();
try {
  if (quoi === "tout" || quoi === "contenu") await contenu(nav);
  if (quoi === "tout" || quoi === "entree") await entree(nav);
  if (quoi === "tout" || quoi === "boutons") await boutons(nav);
  if (quoi === "tout" || quoi === "plaques") await plaques(nav);
  if (quoi === "tout" || quoi === "derive") await derive(nav);
  if (quoi === "tout" || quoi === "tenue") await tenue(nav);
  if (quoi === "tout" || quoi === "cadre") await cadre(nav);
} finally {
  await nav.close();
}
mkdirSync(RACINE, { recursive: true });
writeFileSync(join(RACINE, "rapport.json"), JSON.stringify(rapport, null, 2));
console.log("\nrapport.json + captures dans refonte-captures/accueil/");
