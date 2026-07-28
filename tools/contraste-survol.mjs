/* ============================================================
   CONTRASTE PENDANT LA TRANSITION DE SURVOL.

   POURQUOI CE SCRIPT EXISTE. Tous les verificateurs de contraste,
   `theme-check.mjs` compris, mesurent des ETATS : au repos, puis au
   survol une fois pose. Un survol ANIME a des etats INTERMEDIAIRES,
   et c'est la qu'un libelle peut disparaitre.

   Mesure du 2026-07-26 : la premiere version de l'aplat d'encre des
   boutons montait du bas pendant que les lettres basculaient en
   cascade de gauche a droite. Les deux mouvements ne peuvent pas se
   rencontrer — l'un couvre toute la largeur d'un coup, l'autre
   avance — et le libelle passait par du ciment sur du ciment,
   1,00:1. Le meme script a ensuite trouve deux autres defauts
   reels : des decalages calcules sur l'INDICE de la lettre au lieu
   de sa POSITION, et des morceaux de libelle imbriques dans un
   `<b>` que le decoupage ne touchait pas.

   COMMENT IL MESURE, ET POURQUOI PAS EN PIXELS.
   Trois versions par capture d'ecran ont ete essayees et jetees.
   Une capture Playwright coute plus de 200 ms alors que la
   transition en dure 230 : la premiere image arrive apres la fin.
   Et une analyse de pixels confond systematiquement trois choses
   avec du texte illisible — l'anticrenelage d'un glyphe effleure,
   l'arete de l'aplat ou deux FONDS se cotoient, et une bande sans
   glyphe du tout.

   Ici on ne regarde pas des pixels : on lit, image par image et
   dans la page, la position exacte de l'arete et la couleur
   calculee de chaque lettre. Le fond sous une lettre est alors
   connu SANS AMBIGUITE — l'encre de l'aplat si son centre est
   derriere l'arete, le fond du bouton sinon. Le ratio WCAG se
   calcule exactement, pour chaque lettre et pour chaque image de la
   transition, sans capture et sans heuristique.
   ============================================================ */
import { chromium } from "playwright";

const B = process.argv[2] || "http://localhost:8099";
const SEUIL = 4.5;
const CIBLES = [
  ".hero-cta .btn--ghost",
  ".hero-cta .btn--primary",
  ".nav-cta",
  ".nav-refer",
  ".sector-pills button",
  ".cell"
];

const nav = await chromium.launch();
const page = await (await nav.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
await page.goto(B + "/", { waitUntil: "load" });
await page.mouse.move(5, 5);
await page.waitForTimeout(1700);

/* Le releveur vit dans la page et echantillonne a chaque image :
   c'est la seule facon d'attraper une transition de 230 ms. */
await page.evaluate(() => {
  const lum = (c) => {
    const m = c.match(/[\d.]+/g).map(Number);
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]);
  };
  const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

  /* Le fond effectif d'un element : on remonte les ancetres jusqu'a
     trouver une couleur opaque. Un bouton fantome est transparent,
     son fond est celui de la page. */
  const fondDe = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const c = getComputedStyle(n).backgroundColor;
      const m = c.match(/[\d.]+/g);
      if (m && (m.length < 4 || Number(m[3]) > 0.92)) return lum(c);
      n = n.parentElement;
    }
    return lum(getComputedStyle(document.body).backgroundColor);
  };

  window.__releve = (sel, ms) => new Promise((resolve) => {
    const btn = document.querySelector(sel);
    const images = [];
    const t0 = performance.now();
    const tic = () => {
      const t = performance.now() - t0;
      const rb = btn.getBoundingClientRect();
      const pre = getComputedStyle(btn, "::before");
      /* Position de l'arete de l'aplat, en pixels depuis la gauche
         du bouton. Aucun aplat -> arete a gauche, rien n'est
         couvert. */
      let arete = 0;
      let encre = null;
      if (pre.content !== "none") {
        const m = new DOMMatrixReadOnly(pre.transform);
        arete = m.a * rb.width;
        encre = lum(pre.backgroundColor);
      }
      const fond = fondDe(btn);
      let pire = 99, coupable = "";
      const parts = btn.querySelectorAll(".l, .icon");
      const cibles = parts.length ? parts : [btn];
      /* Le bouton est `overflow: hidden`. La fleche SORT du cadre
         et revient : pendant sa sortie, ses pixels n'existent pas,
         donc son contraste n'existe pas non plus. Un detecteur qui
         les compte quand meme trouve du ciment sur ciment sur un
         objet invisible — c'est le quatrieme piege d'instrument de
         ce projet, et c'est le meme que le premier : il faut
         distinguer ce qui est rogne EXPRES. */
      const rogne = getComputedStyle(btn).overflow !== "visible";
      cibles.forEach((el) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2 - rb.left;
        if (rogne && (cx < 0 || cx > rb.width)) return;
        const st = getComputedStyle(el);
        /* Une icone en trait porte sa couleur dans `stroke` ou
           herite de `color` ; les deux valent `currentColor` ici. */
        const encreTexte = lum(st.color);
        const dessous = (encre !== null && cx <= arete) ? encre : fond;
        const rr = ratio(encreTexte, dessous);
        if (rr < pire) { pire = rr; coupable = (el.textContent || el.tagName).trim().slice(0, 12); }
      });
      images.push({ t: Math.round(t), pire: Number(pire.toFixed(2)), coupable, arete: Math.round(arete) });
      if (t < ms) requestAnimationFrame(tic);
      else resolve(images);
    };
    requestAnimationFrame(tic);
  });
});

let echecs = 0;
for (const sel of CIBLES) {
  const el = await page.$(sel);
  if (!el) { console.log(`  --     ${sel} absent`); continue; }
  await el.scrollIntoViewIfNeeded();
  const box = await el.boundingBox();
  if (!box || box.width < 30) { console.log(`  --     ${sel} hors ecran`); continue; }

  /* Un premier survol declenche le decoupage paresseux ; on repart
     ensuite de zero pour mesurer la transition, pas le decoupage. */
  await el.hover({ force: true });
  await page.waitForTimeout(500);
  await page.mouse.move(2, 2);
  await page.waitForTimeout(700);

  const promesse = page.evaluate((s) => window.__releve(s, 700), sel);
  await el.hover({ force: true });
  const images = await promesse;

  const min = images.reduce((a, x) => (x.pire < a.pire ? x : a), images[0]);
  const ok = min.pire >= SEUIL;
  if (!ok) echecs++;
  console.log(`${ok ? "  OK   " : "  ECHEC"}  ${sel.padEnd(26)} pire ${min.pire.toFixed(2)}:1 a ${min.t} ms  (« ${min.coupable} », arete ${min.arete} px)  sur ${images.length} images`);
}

/* Le retour au repos compte autant que l'aller : c'est la que
   l'arete recule et que les lettres doivent rebasculer dans
   l'ordre inverse. */
console.log("");
for (const sel of CIBLES.slice(0, 4)) {
  const el = await page.$(sel);
  if (!el) continue;
  await el.scrollIntoViewIfNeeded();
  await el.hover({ force: true });
  await page.waitForTimeout(700);
  const promesse = page.evaluate((s) => window.__releve(s, 700), sel);
  await page.mouse.move(2, 2);
  const images = await promesse;
  const min = images.reduce((a, x) => (x.pire < a.pire ? x : a), images[0]);
  const ok = min.pire >= SEUIL;
  if (!ok) echecs++;
  console.log(`${ok ? "  OK   " : "  ECHEC"}  ${(sel + " (retour)").padEnd(26)} pire ${min.pire.toFixed(2)}:1 a ${min.t} ms  (« ${min.coupable} »)`);
}

await nav.close();
console.log(`\n${echecs === 0 ? "AUCUNE FENETRE ILLISIBLE, ALLER ET RETOUR" : echecs + " ETAT(S) SOUS " + SEUIL + ":1 EN TRANSITION"}\n`);
process.exit(echecs ? 1 : 0);
