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
import { decodePNG, diffStats } from "./_png.mjs";

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
    /* `textContent` ET NON `innerText`, ET C'EST UN DEFAUT
       D'INSTRUMENT CORRIGE. Les onze reponses de la FAQ vivent dans
       des `<details>` REPLIES ; `innerText` ne rend que ce qui est
       rendu, donc il ne les voit pas. Une chasse aux enonces retires
       qui lit `innerText` declare donc « absent » tout ce qui se
       cache dans la FAQ — c'est-a-dire l'endroit ou une faussete
       fait le plus de degats, puisque celui qui ouvre la FAQ est un
       prospect serieux. Meme raison pour `content-visibility: auto`,
       deja notee plus bas. */
    const t = document.body.textContent;
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
      /* LES QUATRE ENONCES SUPPRIMES LE 2026-07-29, plus les deux
         faussetes qui vivaient AILLEURS que dans le hero. Chacun
         doit rendre ZERO. Le compte ne suffit pas a dire lequel
         manque — on rend donc aussi les extraits trouves. */
      retires2607: (() => {
        const motifs = {
          "sans donner votre courriel": /sans donner votre courriel/gi,
          "formation incluse": /formation (est )?incluse/gi,
          "heure de formation": /(une )?heure de formation/gi,
          "abonnement obligatoire": /abonnement obligatoire/gi,
          "100 % du code vous appartient": /100\s*%[^.]{0,40}code vous appartient/gi,
          "sous-traitance (plaque)": /Sous-traitance\.\s*Vous parlez/gi,
        };
        const out = {};
        for (const [nom, re] of Object.entries(motifs)) {
          const m = t.match(re) || [];
          out[nom] = { n: m.length, extraits: m.slice(0, 3) };
        }
        return out;
      })(),
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
  const survivants = Object.entries(r.retires2607).filter(([, v]) => v.n > 0);
  console.log("  ENONCES RETIRES QUI SURVIVENT :", survivants.length === 0 ? "aucun" : JSON.stringify(Object.fromEntries(survivants)));
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
            /* LE RIDEAU EST DANS LE RELEVE, ET C'EST LA CORRECTION
               LA PLUS IMPORTANTE DE CET OUTIL.
               Cette sonde mesurait des durees et rendait « tout
               joue » pendant que les trois premiers pas se jouaient
               DERRIERE un aplat opaque plein ecran. Une duree juste
               sous un rideau ferme est un faux verdict, et c'est
               exactement le genre de test qui verrouille un defaut
               au lieu de l'attraper. On note donc, a chaque image,
               si le rideau est encore la. */
            r: !!document.getElementById("entree"),
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

  /* L'instant ou le rideau n'est plus dans le document. Tout ce qui
     se termine avant lui n'a jamais ete vu par personne. */
  const iRideau = brut.ech.findIndex((s) => !s.r);
  const rideauPartiA = iRideau >= 0 ? brut.ech[iRideau].t : null;

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
      const tD = brut.ech[iD] ? brut.ech[iD].t : null;
      const tF = brut.ech[iF] ? brut.ech[iF].t : null;
      /* LE SEUL CHIFFRE QUI COMPTE : la part du geste qui se joue
         alors que le rideau n'est plus la. « Visible, sinon ca ne
         compte pas. » */
      let vu = null;
      if (tD != null && tF != null && rideauPartiA != null && tF > tD) {
        vu = Math.round(Math.max(0, tF - Math.max(tD, rideauPartiA)) / (tF - tD) * 100);
      }
      pas.push({
        pas: i, quoi: brut.noms[i], retard_ecrit_ms: brut.ech[0].e[i].e,
        decouvre_a_ms: tD,
        fini_a_ms: tF,
        duree_ms: tF != null && tD != null ? +(tF - tD).toFixed(1) : null,
        pourcent_vu: vu,
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

  /* FILM DE L'ARRIVEE. 40 images et non 18 : la composition ne part
     plus a 560 ms depuis la navigation mais a l'ouverture du rideau,
     et elle court jusqu'a environ 3,4 s. Un film de 1,7 s s'arretait
     avant la moitie. On mesure aussi l'ecart de pixels entre deux
     images consecutives : c'est le seul critere qui dise « ca se
     voit », par opposition a une duree qui dit seulement « ca
     joue ». */
  const p2 = await ouvrir(nav);
  p2.goto(BASE + "/index.html", { waitUntil: "commit" }).catch(() => {});
  const film = [];
  for (let k = 0; k < 40; k++) {
    const buf = await p2.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 900 } }).catch(() => null);
    if (buf) {
      writeFileSync(join(d, `arrivee-${nb(k)}.png`), buf);
      film.push(buf);
    }
    await attendre(60);
  }
  await p2.close();
  const ecarts = [];
  for (let k = 1; k < film.length; k++) {
    try { ecarts.push(diffStats(decodePNG(film[k - 1]), decodePNG(film[k])).pct); } catch (e) {}
  }

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

  const caches = pas.filter((p) => p.pourcent_vu !== null && p.pourcent_vu < 100);
  const r = {
    rideau_parti_a_ms: rideauPartiA, pas, decalages_ms: decalages, filets,
    pas_partiellement_caches: caches.map((p) => p.quoi + " (" + p.pourcent_vu + " %)"),
    film_ecarts_pct: ecarts,
    film_images_qui_bougent: ecarts.filter((v) => v > 1).length,
    mouvementReduit: reduit, erreurs: page._erreurs,
  };
  await page.close();
  rapport.entree = r;
  console.log("\n=== 2 · ENTREE ===");
  console.log("  rideau parti a :", rideauPartiA, "ms");
  pas.forEach((p) => console.log("  ", JSON.stringify(p)));
  console.log("  decalages entre pas (ms) :", decalages);
  console.log("  filets :", JSON.stringify(filets));
  /* LE VERDICT. Un pas qui finit avant que le rideau parte n'a pas
     ete vu, quelle que soit sa duree. */
  console.log("  PAS CACHES PAR LE RIDEAU :", caches.length, caches.length ? JSON.stringify(r.pas_partiellement_caches) : "— aucun");
  console.log("  film : ", ecarts.length + 1, "images ·", r.film_images_qui_bougent, "ecarts > 1 % · ecart max", Math.max(0, ...ecarts) + " %");
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
        const ang = (el) => {
          const m = String(getComputedStyle(el).transform).match(/matrix\(([^)]+)\)/);
          if (!m) return { ty: 0, rot: 0 };
          const v = m[1].split(",").map(Number);
          return { ty: +v[5].toFixed(2), rot: +(Math.atan2(v[1], v[0]) * 180 / Math.PI).toFixed(2) };
        };
        const coque = ang(p);
        /* L'ANGLE QU'ON VOIT EST LA SOMME DES DEUX BOITES. La coque
           porte ce que GSAP ecrit, le corps porte l'inclinaison de
           repos. Ne relever que la coque, c'est mesurer la moitie du
           geste et croire qu'une plaque se redresse alors qu'elle
           garde 45 % de sa pente — defaut du 2026-07-29. */
        const corps = p.querySelector(".plaque-corps");
        const c = corps ? ang(corps) : { rot: 0 };
        return { ty: coque.ty, rot: coque.rot, net: +(coque.rot + c.rot).toFixed(2) };
      }),
    }), y));
  }

  const n = suivi[0].p.length;
  const bilan = [];
  for (let i = 0; i < n; i++) {
    const ty = suivi.map((s) => s.p[i].ty), rot = suivi.map((s) => s.p[i].rot);
    const net = suivi.map((s) => s.p[i].net);
    bilan.push({
      plaque: i + 1,
      derive_y_px: `${Math.min(...ty).toFixed(1)} → ${Math.max(...ty).toFixed(1)}`,
      amplitude_y_px: +(Math.max(...ty) - Math.min(...ty)).toFixed(1),
      rotation_ajoutee_deg: `${Math.min(...rot).toFixed(2)} → ${Math.max(...rot).toFixed(2)}`,
      /* L'angle VU, coque + corps. Il doit passer par ~0 quelque
         part au milieu de la course : c'est le redressement. */
      angle_vu_deg: `${Math.min(...net).toFixed(2)} → ${Math.max(...net).toFixed(2)}`,
      se_redresse: Math.min(...net.map((v) => Math.abs(v))) < 0.35,
      amplitude_angle_deg: +(Math.max(...net) - Math.min(...net)).toFixed(2),
    });
  }
  const r = { bilan, erreurs: page._erreurs };
  await page.close();
  rapport.derive = r;
  console.log("\n=== 5 · DERIVE ===");
  bilan.forEach((b) => console.log("  ", JSON.stringify(b)));
  console.log("  amplitude Y max :", Math.max(...bilan.map((b) => b.amplitude_y_px)), "px");
  console.log("  plaques qui se redressent vraiment :", bilan.filter((b) => b.se_redresse).length, "/", n);
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
/* ============================================================
   8 · SEQUENCES — « VISIBLE, SINON CA NE COMPTE PAS »

   Le critere de ce chantier n'est pas une duree, c'est une suite
   d'images qui NE SE RESSEMBLENT PAS. Chaque geste rend donc au
   moins cinq vues et l'ecart de pixels entre deux vues
   consecutives. Une suite dont tous les ecarts sont sous 1 % est
   une animation qui n'existe pas, meme si la sonde dit qu'elle
   joue.

   Une capture d'ecran coute 30 a 50 ms : elle ne peut pas suivre
   une transition de 420 ms image par image. Ce n'est pas un
   probleme ici — on ne cherche pas la courbe, qui est relevee dans
   la page par les autres blocs, mais la PREUVE QU'ON VOIT QUELQUE
   CHOSE.
   ============================================================ */
async function ecarts(images) {
  const out = [];
  for (let i = 1; i < images.length; i++) {
    try { out.push(+diffStats(decodePNG(images[i - 1].buf), decodePNG(images[i].buf)).pct.toFixed(2)); }
    catch (e) { out.push(null); }
  }
  return out;
}

async function sequences(nav) {
  const res = {};

  /* --- les trois gestes du chargement, un chargement par cadrage --- */
  /* LES CADRAGES SONT RELEVES, PAS DEVINES. Premiere version : le
     cadre du « titre » etait pose a y=300 et photographiait la
     plaque de limaille, 180 px trop haut. Un cadrage faux rend une
     suite d'images qui bougent — mais pas celles qu'on croit. */
  const cadrages = [
    { nom: "titre", cible: ".hero-claim", marge: 22, de: 1150, a: 2250 },
    { nom: "sous-titre-et-cta", cible: ".hero-sub", bas: ".hero-cta", marge: 18, de: 1600, a: 2800 },
    { nom: "fiche", cible: ".hero-fiche", marge: 14, de: 2050, a: 3600 },
  ];
  for (const c of cadrages) {
    const d = dossier(join("sequences", c.nom));
    /* On releve le cadre sur une page DEJA POSEE, puis on recharge
       pour filmer : la boite d'un element en cours d'animation ne
       vaut rien, et `content-visibility: auto` fait mentir une
       boite relevee hors ecran. */
    const repere = await ouvrir(nav);
    await repere.goto(BASE + "/index.html", { waitUntil: "load" });
    await attendre(4200);
    const clip = await repere.evaluate(([sel, bas, m]) => {
      const a = document.querySelector(sel).getBoundingClientRect();
      const b = bas ? document.querySelector(bas).getBoundingClientRect() : a;
      const y = Math.max(0, Math.round(a.top - m));
      return {
        x: Math.max(0, Math.round(a.left - m)),
        y,
        width: Math.min(1440 - Math.max(0, Math.round(a.left - m)), Math.round(Math.max(a.width, b.width) + m * 2)),
        height: Math.min(900 - y, Math.round(b.bottom - a.top + m * 2)),
      };
    }, [c.cible, c.bas || null, c.marge]);
    await repere.close();

    const page = await ouvrir(nav);
    const t0 = Date.now();
    page.goto(BASE + "/index.html", { waitUntil: "commit" }).catch(() => {});
    const vues = [];
    while (Date.now() - t0 < c.a) {
      if (Date.now() - t0 < c.de) { await attendre(20); continue; }
      const buf = await page.screenshot({ clip }).catch(() => null);
      if (!buf) continue;
      const t = Date.now() - t0;
      writeFileSync(join(d, `${nb(vues.length)}-${t}ms.png`), buf);
      vues.push({ t, buf });
    }
    await page.close();
    const e = await ecarts(vues);
    res[c.nom] = {
      dossier: d, cadre: clip, vues: vues.length, instants_ms: vues.map((v) => v.t),
      ecarts_pct: e, vues_qui_bougent: e.filter((v) => v > 1).length, ecart_max_pct: Math.max(0, ...e.filter((v) => v != null)),
    };
  }

  /* --- les deux boutons au survol --- */
  for (const [nom, sel] of [["survol-primaire", ".hero-cta .btn--primary"], ["survol-secondaire", ".hero-cta .btn--ghost"]]) {
    const d = dossier(join("sequences", nom));
    const page = await ouvrir(nav);
    await page.goto(BASE + "/index.html", { waitUntil: "load" });
    await page.mouse.move(20, 20);
    await attendre(2600);
    await fermerPopups(page);
    const bo = await page.locator(sel).boundingBox();
    const clip = { x: Math.max(0, bo.x - 10), y: Math.max(0, bo.y - 10), width: bo.width + 20, height: bo.height + 20 };
    const vues = [];
    const buf0 = await page.screenshot({ clip });
    writeFileSync(join(d, "00-repos.png"), buf0);
    vues.push({ t: 0, buf: buf0 });
    const t0 = Date.now();
    await page.mouse.move(bo.x + bo.width / 2, bo.y + bo.height / 2);
    while (Date.now() - t0 < 700) {
      const buf = await page.screenshot({ clip }).catch(() => null);
      if (!buf) break;
      const t = Date.now() - t0;
      writeFileSync(join(d, `${nb(vues.length)}-${t}ms.png`), buf);
      vues.push({ t, buf });
    }
    /* Le retour compte autant : c'est la moitie du geste. */
    const t1 = Date.now();
    await page.mouse.move(20, 20);
    const retour = [];
    while (Date.now() - t1 < 700) {
      const buf = await page.screenshot({ clip }).catch(() => null);
      if (!buf) break;
      const t = Date.now() - t1;
      writeFileSync(join(d, `r${nb(retour.length)}-${t}ms.png`), buf);
      retour.push({ t, buf });
    }
    await page.close();
    const e = await ecarts(vues), er = await ecarts(retour);
    res[nom] = {
      dossier: d, vues_aller: vues.length, ecarts_aller_pct: e, ecart_max_aller: Math.max(0, ...e.filter((v) => v != null)),
      vues_retour: retour.length, ecarts_retour_pct: er, ecart_max_retour: Math.max(0, ...er.filter((v) => v != null)),
    };
  }

  /* --- les sept plaques pendant le defilement --- */
  {
    const d = dossier(join("sequences", "plaques-defilement"));
    const page = await ouvrir(nav);
    await page.goto(BASE + "/index.html", { waitUntil: "load" });
    await attendre(2200);
    await fermerPopups(page);
    const cible = await page.evaluate(() => Math.round(document.querySelector(".plaques").getBoundingClientRect().top + window.scrollY));
    const vues = [];
    /* On defile PAR PAS, jamais d'un saut : un `scrollTo` qui saute
       casse un pin de ScrollTrigger. */
    for (let k = 0; k < 12; k++) {
      const y = Math.max(0, cible - 820) + k * 150;
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await attendre(260);
      /* On remesure la cible juste avant de la photographier :
         `content-visibility: auto` fait mentir une boite relevee
         plus tot. */
      /* CADRE FIXE, et c'est une correction. Un cadre calcule sur
         la boite de la bande change de taille d'une vue a l'autre,
         et deux images de tailles differentes rendent 100 % d'ecart
         — un chiffre qui ne veut rien dire. Le cadre est donc la
         fenetre du visiteur, qui ne bouge pas ; ce qui bouge dedans
         est exactement ce qu'il voit bouger. */
      const buf = await page.screenshot({ clip: { x: 0, y: 140, width: 1440, height: 700 } }).catch(() => null);
      if (!buf) continue;
      writeFileSync(join(d, `${nb(k)}-y${y}.png`), buf);
      vues.push({ t: y, buf });
    }
    await page.close();
    const e = await ecarts(vues);
    res["plaques-defilement"] = { dossier: d, vues: vues.length, ecarts_pct: e, ecart_max_pct: Math.max(0, ...e.filter((v) => v != null)) };
  }

  /* --- CINQ RECHARGEMENTS : la sequence doit rejouer a chaque fois.
         C'est le defaut qui a ouvert ce chantier — un seul clic
         posait `aped-entree-saut` et la composition ne revenait
         jamais. On clique EXPRES au premier chargement. --- */
  {
    const page = await ouvrir(nav);
    const releve = () => page.evaluate(() => ({
      cls: document.documentElement.className,
      rideau: !!document.getElementById("entree"),
      saut: (() => { try { return sessionStorage.getItem("aped-entree-saut"); } catch (e) { return "?"; } })(),
    }));
    const passes = [];
    await page.goto(BASE + "/index.html", { waitUntil: "commit" });
    await attendre(300);
    await page.mouse.click(700, 840);
    await attendre(200);
    passes.push({ passe: "1er chargement + 1 clic", ...(await releve()) });
    for (let i = 1; i <= 5; i++) {
      await attendre(1400);
      await page.reload({ waitUntil: "commit" });
      await attendre(300);
      const r0 = await releve();
      /* La composition doit non seulement etre declaree, mais
         JOUER : on attend la disparition du rideau et on verifie
         que `compo-hero` est bien la a ce moment. */
      await attendre(1300);
      const r1 = await page.evaluate(() => ({ compo: document.documentElement.className.includes("compo-hero"), rideau: !!document.getElementById("entree") }));
      passes.push({ passe: "rechargement " + i, ...r0, apres_rideau: r1 });
    }
    await page.close();
    res.rechargements = passes;
  }

  rapport.sequences = res;
  console.log("\n=== 8 · SEQUENCES ===");
  for (const [nom, v] of Object.entries(res)) {
    if (nom === "rechargements") continue;
    if (v.ecarts_pct) {
      console.log("  " + nom.padEnd(20), v.vues + " vues ·", "ecart max " + v.ecart_max_pct + " %", "· ecarts :", JSON.stringify(v.ecarts_pct));
    } else {
      console.log("  " + nom.padEnd(20), v.vues_aller + " aller / " + v.vues_retour + " retour ·",
        "max aller " + v.ecart_max_aller + " % · max retour " + v.ecart_max_retour + " %");
      console.log("     aller :", JSON.stringify(v.ecarts_aller_pct), " retour :", JSON.stringify(v.ecarts_retour_pct));
    }
  }
  console.log("  -- cinq rechargements apres un clic --");
  res.rechargements.forEach((p) => console.log("    ", p.passe.padEnd(24), "saut=" + p.saut, "| " + p.cls, p.apres_rideau ? "| apres rideau : compo-hero=" + p.apres_rideau.compo : ""));
  return res;
}

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
  if (quoi === "tout" || quoi === "sequences") await sequences(nav);
} finally {
  await nav.close();
}
mkdirSync(RACINE, { recursive: true });
writeFileSync(join(RACINE, "rapport.json"), JSON.stringify(rapport, null, 2));
console.log("\nrapport.json + captures dans refonte-captures/accueil/");
