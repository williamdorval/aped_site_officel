/* ============================================================
   PASSAGES-CINE — nos passages, filmes au protocole DevTools.
   ------------------------------------------------------------
   `page.screenshot()` coute 120 a 950 ms sur cette machine : une
   rafale de captures RATE une transition de 420 ms. Ici chaque
   image est celle que le navigateur a peinte, datee par lui.

   Usage : node tools/passages-cine.mjs [port] [quoi]
   quoi : theme | frontieres | modale | secteur | menu | tout
   ============================================================ */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { filmer, planche, cadence, plancheFenetre } from "./cine.mjs";

/* LE RELEVEUR DE VOILE. Il vit dans la page, il ne coute qu'un
   `querySelector` par image, et il dit exactement QUAND un
   passage a eu lieu. Choisir les images au jugé produit une
   planche d'images d'apres coup — c'est arrive a la premiere
   lecture des douze frontieres, et rien n'y etait visible. */
const RELEVEUR = () => {
  window.__V = [];
  let n = 0;
  const b = () => {
    const k = document.querySelectorAll("canvas.trame-voile").length;
    if (k !== n) { window.__V.push({ t: Math.round(performance.now()), n: k }); n = k; }
    requestAnimationFrame(b);
  };
  requestAnimationFrame(b);
};

const B = "http://localhost:" + (process.argv[2] || 8099);
const QUOI = process.argv[3] || "tout";
const RACINE = join(process.cwd(), "tools", "_nous");
mkdirSync(RACINE, { recursive: true });

const nav = await chromium.launch();
const rapport = {};

async function neuve(opts) {
  const c = await nav.newContext({ viewport: { width: 1440, height: 900 }, ...(opts || {}) });
  const p = await c.newPage();
  const erreurs = [];
  p.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text().slice(0, 140)); });
  p.on("pageerror", (e) => erreurs.push("PAGEERROR " + String(e).slice(0, 140)));
  await p.addInitScript(() => {
    try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {}
    try { localStorage.setItem("aped-cadeau-vu", "1"); } catch (e) {}
  });
  await p.addInitScript(RELEVEUR);
  await p.goto(B + "/", { waitUntil: "load" });
  await p.waitForTimeout(1900);
  const origine = await p.evaluate(() => performance.timeOrigin);
  return { c, p, erreurs, origine };
}

/* La fenetre du dernier passage vu, dans l'horloge de la page. */
async function fenetreVoile(p, depuis) {
  const v = await p.evaluate((d) => window.__V.filter((x) => x.t >= d), depuis);
  if (!v.length) return null;
  const debut = v[0].t;
  const zero = v.filter((x) => x.n === 0 && x.t > debut);
  return [debut, zero.length ? zero[zero.length - 1].t : v[v.length - 1].t];
}

/* --- LA BASCULE DE THEME --- */
if (QUOI === "theme" || QUOI === "tout") {
  const { c, p, erreurs } = await neuve();
  const imgs = await filmer(p, 1100, async () => { await p.click("#themeToggle"); });
  const dos = join(RACINE, "theme");
  rapport.theme = { cadence: cadence(imgs), images: planche(imgs, dos, "th", 14).length, erreurs };
  await c.close();
}

/* --- LES DOUZE FRONTIERES, une par une --- */
if (QUOI === "frontieres" || QUOI === "tout") {
  /* DEUX PIEGES QUI SE CONTREDISENT, ET C'EST LE POINT DUR.

     1. `content-visibility: auto` rend la hauteur RESERVEE tant
        qu'on n'est pas passe : mesurer les seuils sur une page
        fraiche donne des positions fausses de milliers de pixels.
        Il FAUT traverser avant de mesurer.
     2. Les frontieres sont declenchees `once: true`. Traverser
        les CONSOMME toutes. La premiere lecture a donc rendu
        « aucun voile » sur les douze — un verdict entierement
        fabrique par l'instrument.

     On separe donc : une page qui MESURE, et une page NEUVE par
     frontiere qui FILME, en descendant par pas jusqu'a s'arreter
     140 px avant le declenchement. */
  const { c: cm, p: pm } = await neuve();
  const H = await pm.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 900) { await pm.evaluate((v) => scrollTo(0, v), y); await pm.waitForTimeout(45); }
  const seuils = await pm.evaluate(() => [...document.querySelectorAll("[data-seuil]")].map((s) => {
    const r = s.getBoundingClientRect();
    return { de: s.dataset.de, vers: s.dataset.vers, verbe: s.dataset.verbe, sens: s.dataset.sens,
      dress: s.dataset.dress, y: Math.round(r.top + scrollY), h: Math.round(r.height) };
  }));
  await cm.close();

  rapport.frontieres = [];
  let erreurs = [];
  for (let i = 0; i < seuils.length; i++) {
    const info = seuils[i];
    const neuf = await neuve();
    const c = neuf.c, p = neuf.p, origine = neuf.origine;
    erreurs = erreurs.concat(neuf.erreurs);
    /* On descend par pas jusqu'a 140 px avant le declenchement.
       Par pas, pas d'un saut : un saut casse un pin et ne
       declenche rien de ce qu'on veut voir. */
    /* ON RECALCULE LA CIBLE A CHAQUE PAS, et on s'arrete des
       qu'on est a 150 px du declenchement. Descendre d'un trait
       vers une position relevee sur une AUTRE page fait depasser :
       les hauteurs derivent, et depasser un `once: true` le
       consomme sans qu'on l'ait filme. Les frontieres 06, 11, 12
       et le pied ont ete perdues exactement comme ca. */
    const viser = () => p.evaluate((k) => {
      const s = document.querySelectorAll("[data-seuil]")[k];
      const cible = s.dataset.verbe === "degager" && s.dataset.cible
        ? (s.closest("section") || s.parentNode).querySelector(s.dataset.cible) : null;
      const el = cible || s;
      const pct = cible ? 0.90 : 0.92;
      return Math.max(0, Math.round(el.getBoundingClientRect().top + scrollY - innerHeight * pct));
    }, i);
    for (let garde = 0; garde < 400; garde++) {
      const but = await viser();
      const ici = await p.evaluate(() => scrollY);
      if (ici >= but - 150) break;
      await p.evaluate((v) => scrollTo(0, v), Math.min(but - 150, ici + 700));
      await p.waitForTimeout(26);
    }
    /* REMESURER ICI, pas avant. Les hauteurs continuent de deriver
       a mesure qu'on descend : la position relevee sur la page de
       mesure vaut a un millier de pixels pres, et un millier de
       pixels d'ecart, c'est un declencheur rate. La frontiere 06
       est passee a cote pour exactement cette raison. */
    /* ET LA REFERENCE N'EST PAS TOUJOURS LE SEUIL. Un « volet »
       est declenche sur la bande elle-meme, a `top 92%` ; un
       « degager » est declenche sur la PREUVE de la section — la
       premiere capture, la premiere question, la tuile — a
       `top 90%`, donc plusieurs centaines de pixels plus bas. Se
       caler sur le seuil dans ce cas, c'est filmer avant que quoi
       que ce soit parte. */
    const vrai = await p.evaluate((k) => {
      const s = document.querySelectorAll("[data-seuil]")[k];
      const cible = s.dataset.verbe === "degager" && s.dataset.cible
        ? (s.closest("section") || s.parentNode).querySelector(s.dataset.cible) : null;
      const el = cible || s;
      return { y: Math.round(el.getBoundingClientRect().top + scrollY), seuilCible: !!cible,
        pct: cible ? 0.90 : 0.92 };
    }, i);
    info.y = vrai.y;
    info.declencheSur = vrai.seuilCible ? "cible" : "seuil";
    info.pct = vrai.pct;
    /* LE CADRAGE EST LE POINT DELICAT. Le declencheur est
       `top 92%` : il part quand le haut du seuil atteint 828 px
       dans une fenetre de 900. Filmer 1,2 s en repartissant dix
       images sur toute la duree rend dix images D'APRES le
       passage — la premiere lecture n'a montre que des bandes
       deja posees. On se cale donc JUSTE au-dessus du seuil de
       declenchement, et le film ne couvre que la fenetre utile. */
    const declenche = Math.max(0, info.y - Math.round(900 * (info.pct || 0.92)));
    const depart = Math.max(0, declenche - 140);
    await p.evaluate((v) => scrollTo(0, v), depart);
    await p.waitForTimeout(500);
    const marque = await p.evaluate(() => performance.now());
    const imgs = await filmer(p, 900, async () => {
      for (let s = depart; s <= declenche + 40; s += 30) { await p.evaluate((v) => scrollTo(0, v), s); await p.waitForTimeout(16); }
    });
    const dos = join(RACINE, "frontieres", `f${String(info.vers).padStart(2, "0")}-${info.verbe}-${info.sens}`);
    const f = await fenetreVoile(p, marque);
    info.palier = await p.evaluate(() => document.documentElement.getAttribute("data-palier"));
    const pl = f
      ? plancheFenetre(imgs, origine, f[0], f[1], dos, "x", 8)
      : { note: "aucun voile — verbe sans trame", ecrites: planche(imgs, dos, "x", 8).length };
    rapport.frontieres.push({ ...info, voile: f ? { debut: f[0], fin: f[1], duree: f[1] - f[0] } : null, planche: pl, cadence: cadence(imgs) });
    await c.close();
  }
  rapport.frontieresErreurs = erreurs;
}

/* --- UNE MODALE --- */
if (QUOI === "modale" || QUOI === "tout") {
  const { c, p, erreurs } = await neuve();
  const imgs = await filmer(p, 900, async () => {
    await p.evaluate(() => { const b = document.querySelector("[data-modal-open]"); if (b) b.click(); });
  });
  rapport.modale = { cadence: cadence(imgs), images: planche(imgs, join(RACINE, "modale"), "mo", 10).length, erreurs };
  await c.close();
}

/* --- L'APERCU DES SECTEURS, d'un metier a l'autre --- */
if (QUOI === "secteur" || QUOI === "tout") {
  const { c, p, erreurs } = await neuve();
  await p.evaluate(() => {
    const s = document.querySelector("#sectorPreview");
    if (s) s.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await p.waitForTimeout(900);
  const imgs = await filmer(p, 1000, async () => {
    const b = await p.$$(".sector-pills button");
    if (b[6]) await b[6].hover();
  });
  rapport.secteur = { cadence: cadence(imgs), images: planche(imgs, join(RACINE, "secteur"), "se", 10).length, erreurs };
  await c.close();
}

/* --- LE MENU PLEIN ECRAN --- */
if (QUOI === "menu" || QUOI === "tout") {
  const c = await nav.newContext({ viewport: { width: 430, height: 860 }, isMobile: true, hasTouch: true });
  const p = await c.newPage();
  const erreurs = [];
  p.on("pageerror", (e) => erreurs.push(String(e).slice(0, 140)));
  await p.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); localStorage.setItem("aped-cadeau-vu", "1"); } catch (e) {} });
  await p.goto(B + "/", { waitUntil: "load" });
  await p.waitForTimeout(1900);
  const imgs = await filmer(p, 900, async () => { await p.click("#burger"); });
  rapport.menu = { cadence: cadence(imgs), images: planche(imgs, join(RACINE, "menu"), "me", 10).length, erreurs };
  await c.close();
}

await nav.close();
writeFileSync(join(RACINE, "passages.json"), JSON.stringify(rapport, null, 1), "utf8");
console.log(JSON.stringify(rapport, null, 1).slice(0, 4000));
