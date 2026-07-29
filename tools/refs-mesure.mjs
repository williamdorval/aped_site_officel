/* ============================================================
   PASSE B — LA MESURE DES SIX REFERENCES
   ------------------------------------------------------------
   Une capture d'ecran est plus lente qu'une transition : la
   photographier ne rend pas un timing, elle rend une impression.
   On releve donc les valeurs DANS la page, a chaque image, et on
   photographie EN PLUS, pour la preuve visuelle.

   De chaque mouvement on tire quatre chiffres et pas un adjectif :
   duree reelle, decalage entre voisins, depassement (y a-t-il un
   rebond ?), et la courbe — identifiee en comparant la progression
   normalisee a un catalogue de cubic-bezier connus.

   Usage : node tools/refs-mesure.mjs [1|2|3|4|5|6|tout]
   ============================================================ */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RACINE = join(process.cwd(), "tools", "_refs");
const dossier = (n, slug) => { const d = join(RACINE, `${n}-${slug}`); mkdirSync(d, { recursive: true }); return d; };

/* ---------- identification de courbe ----------
   Un nom d'easing n'est pas une opinion : on compare la
   progression relevee a des courbes connues et on rend l'ecart. */
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const fx = (t) => ((ax * t + bx) * t + cx) * t;
  const dfx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    let t = x;
    for (let i = 0; i < 8; i++) { const e = fx(t) - x; if (Math.abs(e) < 1e-6) break; const d = dfx(t); if (Math.abs(d) < 1e-6) break; t -= e / d; }
    t = Math.max(0, Math.min(1, t));
    return ((ay * t + by) * t + cy) * t;
  };
}
const CATALOGUE = {
  linear: bezier(0, 0, 1, 1),
  ease: bezier(0.25, 0.1, 0.25, 1),
  "ease-out": bezier(0, 0, 0.58, 1),
  "ease-in-out": bezier(0.42, 0, 0.58, 1),
  "power2.out": bezier(0.165, 0.84, 0.44, 1),
  "power3.out": bezier(0.215, 0.61, 0.355, 1),
  "power4.out": bezier(0.165, 0.84, 0.44, 1),
  "expo.out (0.16,1,0.3,1)": bezier(0.16, 1, 0.3, 1),
  "quint.out (0.22,1,0.36,1)": bezier(0.22, 1, 0.36, 1),
  "framer spring (0.6,1.5,0.5,1)": bezier(0.6, 1.5, 0.5, 1),
  "ease-in-out cubic (0.645,0.045,0.355,1)": bezier(0.645, 0.045, 0.355, 1),
};
function identifier(points) {
  /* points : [{x: 0..1 du temps, y: 0..1 de la progression}] */
  if (points.length < 5) return null;
  const notes = Object.entries(CATALOGUE).map(([nom, f]) => {
    let s = 0; for (const p of points) { const d = f(p.x) - p.y; s += d * d; }
    return { nom, ecart: Math.sqrt(s / points.length) };
  }).sort((a, b) => a.ecart - b.ecart);
  return { meilleur: notes[0].nom, ecart: +notes[0].ecart.toFixed(4), suivants: notes.slice(1, 3).map((n) => n.nom + " " + n.ecart.toFixed(3)) };
}
function depassement(vals) {
  /* Un depassement, c'est une valeur qui sort de l'intervalle
     depart→arrivee. C'est le seul critere qui separe un ressort
     d'un amortissement critique, et c'est ce qu'on refuse ici. */
  if (vals.length < 3) return 0;
  const a = vals[0], b = vals[vals.length - 1], amp = b - a;
  if (Math.abs(amp) < 1e-6) return 0;
  let max = 0;
  for (const v of vals) { const p = (v - a) / amp; if (p > 1) max = Math.max(max, p - 1); if (p < 0) max = Math.max(max, -p); }
  return +(max * 100).toFixed(1);
}
const decomposer = (m) => {
  if (!m || m === "none") return { x: 0, y: 0, sx: 1, sy: 1, rot: 0 };
  const v = m.match(/matrix\(([^)]+)\)/);
  if (!v) return { x: 0, y: 0, sx: 1, sy: 1, rot: 0 };
  const [a, b, c, d, e, f] = v[1].split(",").map(Number);
  return { x: +e.toFixed(2), y: +f.toFixed(2), sx: +Math.hypot(a, b).toFixed(4), sy: +Math.hypot(c, d).toFixed(4), rot: +(Math.atan2(b, a) * 180 / Math.PI).toFixed(2) };
};

/* ---------- le sondeur, injecte dans la page ---------- */
const SONDEUR = function (arg) {
  return new Promise((resolve) => {
    const els = [];
    (arg.sels || []).forEach((s) => document.querySelectorAll(s).forEach((e) => els.push(e)));
    const cibles = els.slice(0, arg.max || 60);
    const t0 = performance.now();
    const images = [];
    (function boucle() {
      const t = performance.now() - t0;
      images.push({ t: +t.toFixed(1), v: cibles.map((e) => { const c = getComputedStyle(e); return [c.transform, c.opacity, c.clipPath.slice(0, 40), c.backgroundColor, c.width, c.height]; }) });
      if (t < arg.ms) requestAnimationFrame(boucle); else resolve({ n: cibles.length, images });
    })();
  });
};

async function rafale(page, dos, prefixe, nb, pas) {
  const t = [];
  for (let i = 0; i < nb; i++) {
    const a = Date.now();
    try { await page.screenshot({ path: join(dos, `${prefixe}-${String(i).padStart(2, "0")}.png`), timeout: 12000 }); } catch (e) { t.push("ECHEC " + String(e).slice(0, 60)); break; }
    t.push(Date.now() - a);
    const r = pas - (Date.now() - a); if (r > 0) await page.waitForTimeout(r);
  }
  return t;
}

/* ============================================================
   4 · PIXEL REVEAL — la reference la plus proche de nous.
   Une grille `repeat(25,1fr)` de 400 tuiles en aplat gris, qui
   se retirent une par une. Ce qu'on veut n'est pas « c'est
   joli » : c'est l'ORDRE de retrait — le motif — et le temps
   entre deux tuiles.
   ============================================================ */
async function mesurer4(nav) {
  const dos = dossier(4, "pixel-reveal");
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  /* Le releve doit commencer AVANT le reveal, donc avant tout
     script de la page. Un observateur pose apres coup filme la
     fin d'un mouvement et croit avoir tout vu. */
  await page.addInitScript(() => {
    window.__ETUDE = { debut: performance.now(), grille: null, tuiles: [], journal: [] };
    const chercher = () => {
      const g = [...document.querySelectorAll("div")].find((d) => d.children.length >= 100 && getComputedStyle(d).display === "grid");
      if (!g) return false;
      window.__ETUDE.grille = { colonnes: getComputedStyle(g).gridTemplateColumns.split(" ").length, enfants: g.children.length, tpl: getComputedStyle(g).gridTemplateColumns };
      window.__ETUDE.el = g;
      return true;
    };
    const boucle = () => {
      const e = window.__ETUDE;
      if (!e.el) { if (!chercher()) { requestAnimationFrame(boucle); return; } }
      const t = +(performance.now() - e.debut).toFixed(1);
      const enf = e.el.children;
      /* On enregistre l'etat de chaque tuile en une seule chaine :
         400 valeurs par image, mais une chaine se compare vite. */
      let etat = "";
      for (let i = 0; i < enf.length; i++) {
        const c = getComputedStyle(enf[i]);
        etat += (c.opacity === "0" || c.display === "none" || c.visibility === "hidden") ? "." : "#";
      }
      const prev = e.journal[e.journal.length - 1];
      if (!prev || prev.etat !== etat) e.journal.push({ t, etat, n: enf.length });
      if (t < 6000) requestAnimationFrame(boucle);
    };
    (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(boucle)) : requestAnimationFrame(boucle));
  });

  await page.goto("https://gracious-routine-029598.framer.app/swisspixelreveal", { waitUntil: "commit", timeout: 60000 });
  await page.waitForTimeout(200);
  const rafales = await rafale(page, dos, "R-reveal", 20, 110);
  await page.waitForTimeout(4000);
  const j = await page.evaluate(() => ({ grille: window.__ETUDE?.grille, journal: window.__ETUDE?.journal || [] }));

  /* Reconstruction du motif : a quelle image chaque tuile
     disparait. Un ordre, pas une impression. */
  let analyse = { erreur: "grille jamais vue" };
  if (j.journal.length > 1) {
    const n = j.journal[0].etat.length;
    const tDisparition = new Array(n).fill(null);
    for (const img of j.journal) for (let i = 0; i < n; i++) if (tDisparition[i] === null && img.etat[i] === ".") tDisparition[i] = img.t;
    const vus = tDisparition.filter((x) => x !== null);
    const col = j.grille?.colonnes || 25, lig = Math.round(n / col);
    /* Le motif se lit en rendant la grille en caracteres : le rang
       de disparition, ramene a 0-9. Une planche de texte dit
       instantanement si c'est aleatoire, diagonal ou radial. */
    const tri = [...vus].sort((a, b) => a - b);
    const rang = (t) => t === null ? " " : String(Math.min(9, Math.floor(9 * (tri.indexOf(t) / Math.max(1, tri.length - 1)))));
    const planche = [];
    for (let y = 0; y < lig; y++) planche.push(tDisparition.slice(y * col, (y + 1) * col).map(rang).join(""));
    analyse = {
      tuiles: n, colonnes: col, lignes: lig,
      disparues: vus.length,
      debut: Math.min(...vus), fin: Math.max(...vus),
      duree_totale: +(Math.max(...vus) - Math.min(...vus)).toFixed(0),
      etapes: j.journal.length,
      ecart_median_entre_etats: (() => { const d = []; for (let i = 1; i < j.journal.length; i++) d.push(j.journal[i].t - j.journal[i - 1].t); d.sort((a, b) => a - b); return +(d[Math.floor(d.length / 2)] || 0).toFixed(1); })(),
      planche,
    };
  }
  const rap = { ref: 4, grille: j.grille, rafales, analyse, etats: j.journal.slice(0, 6).map((x) => ({ t: x.t, apercu: x.etat.slice(0, 50) })) };
  writeFileSync(join(dos, "mesure.json"), JSON.stringify(rap, null, 1), "utf8");
  await ctx.close();
  return rap;
}

/* ============================================================
   2 · SMOOTH LOADER — ce qui se passe entre la navigation et le
   site. On veut savoir si c'est UN mouvement ou deux animations
   collees, et ou est la couture.
   ============================================================ */
async function mesurer2(nav) {
  const dos = dossier(2, "smooth-loader");
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__E = { t0: performance.now(), j: [] };
    const boucle = () => {
      const t = +(performance.now() - window.__E.t0).toFixed(1);
      /* Tout ce qui couvre plus de la moitie de l'ecran : un voile
         est par definition un objet qui recouvre. */
      const couvrants = [];
      document.querySelectorAll("body *").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < innerWidth * 0.5 || r.height < innerHeight * 0.5) return;
        const c = getComputedStyle(el);
        if (c.position !== "fixed" && c.position !== "absolute" && el.tagName !== "SECTION" && el.tagName !== "DIV") return;
        if (couvrants.length > 8) return;
        couvrants.push({ tag: el.tagName + "." + (typeof el.className === "string" ? el.className.slice(0, 22) : ""), op: c.opacity, tr: c.transform, bg: c.backgroundColor, clip: c.clipPath.slice(0, 30), z: c.zIndex });
      });
      const h1 = document.querySelector("h1");
      window.__E.j.push({ t, couvrants, h1: h1 ? { op: getComputedStyle(h1).opacity, tr: getComputedStyle(h1).transform } : null,
        anims: document.getAnimations().filter((a) => a.playState === "running").length });
      if (t < 5000) requestAnimationFrame(boucle);
    };
    requestAnimationFrame(boucle);
  });
  await page.goto("https://thoughtful-focus-537972.framer.app/", { waitUntil: "commit", timeout: 60000 });
  await page.waitForTimeout(150);
  const rafales = await rafale(page, dos, "L-loader", 24, 110);
  await page.waitForTimeout(3000);
  const j = await page.evaluate(() => window.__E.j);
  /* On garde une image sur cinq : 300 releves ne se lisent pas. */
  const echant = j.filter((_, i) => i % 5 === 0).map((x) => ({ t: x.t, anims: x.anims, h1: x.h1, couvrants: x.couvrants.slice(0, 3) }));
  /* Les lettres du titre : leurs delais SONT la cadence. */
  const lettres = await page.evaluate(() => [...document.querySelectorAll("h1 span")].slice(0, 24).map((s) => {
    const c = getComputedStyle(s);
    return { txt: s.textContent, delai: c.transitionDelay, duree: c.transitionDuration, courbe: c.transitionTimingFunction, prop: c.transitionProperty };
  }));
  const rap = { ref: 2, rafales, lettres, releve: echant.slice(0, 60) };
  writeFileSync(join(dos, "mesure.json"), JSON.stringify(rap, null, 1), "utf8");
  await ctx.close();
  return rap;
}

/* ============================================================
   1 · PILE DE CARTES — l'eventail au survol. On veut l'ecart
   entre deux cartes, la duree, et surtout LE DEPASSEMENT : la
   courbe declaree est cubic-bezier(0.6, 1.5, 0.5, 1), donc un
   ressort. C'est exactement ce qu'on devra traduire.
   ============================================================ */
async function mesurer1(nav) {
  const dos = dossier(1, "hover-cartes");
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("https://elated-convention-516854.framer.app/", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2500);
  const boite = await page.evaluate(() => {
    const cartes = [...document.querySelectorAll("div")].filter((d) => { const r = d.getBoundingClientRect(); return Math.round(r.width) === 320 && Math.round(r.height) === 200; });
    cartes.forEach((c, i) => c.setAttribute("data-carte", i));
    const p = cartes[0]?.parentElement; if (p) p.setAttribute("data-pile", "1");
    const r = (p || document.body).getBoundingClientRect();
    return { n: cartes.length, cx: Math.round(r.x + r.width / 2), cy: Math.round(r.y + r.height / 2),
      avant: cartes.map((c) => { const s = getComputedStyle(c); return { tr: s.transform, op: s.opacity, tn: s.transition.slice(0, 120), z: s.zIndex, r: c.getBoundingClientRect().top + "," + c.getBoundingClientRect().left }; }) };
  });
  await page.screenshot({ path: join(dos, "H-0-repos.png"), timeout: 12000 }).catch(() => {});
  const sonde = page.evaluate(SONDEUR, { sels: ["[data-carte]", "[data-pile]"], ms: 1400, max: 12 });
  await page.mouse.move(boite.cx, boite.cy);
  const releve = await sonde;
  await rafale(page, dos, "H-1-survol", 8, 110);
  await page.mouse.move(5, 5);
  const sonde2 = page.evaluate(SONDEUR, { sels: ["[data-carte]", "[data-pile]"], ms: 1200, max: 12 });
  const releve2 = await sonde2;
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(dos, "H-3-retour.png"), timeout: 12000 }).catch(() => {});

  const piste = (rel, k) => rel.images.map((im) => ({ t: im.t, ...decomposer(im.v[k]?.[0]), op: +im.v[k]?.[1], w: im.v[k]?.[4], h: im.v[k]?.[5] }));
  const analyse = [];
  for (let k = 0; k < Math.min(boite.n, releve.n); k++) {
    const p = piste(releve, k);
    const dy = p.map((q) => q.y), dx = p.map((q) => q.x), dr = p.map((q) => q.rot);
    const bouge = (a) => Math.abs(a[a.length - 1] - a[0]) > 0.5;
    const axe = bouge(dy) ? dy : bouge(dx) ? dx : bouge(dr) ? dr : null;
    if (!axe) { analyse.push({ carte: k, immobile: true }); continue; }
    const a = axe[0], b = axe[axe.length - 1];
    const iFin = axe.findIndex((v, i) => i > 2 && Math.abs(v - b) < Math.abs(b - a) * 0.01);
    const T = iFin > 0 ? p[iFin].t : p[p.length - 1].t;
    const pts = p.filter((q) => q.t <= T && T > 0).map((q, i) => ({ x: q.t / T, y: (axe[i] - a) / (b - a) }));
    analyse.push({ carte: k, de: +a.toFixed(2), vers: +b.toFixed(2), duree_ms: +T.toFixed(0), depassement_pct: depassement(axe), courbe: identifier(pts) });
  }
  const rap = { ref: 1, pile: boite.n, transitionDeclaree: boite.avant[0]?.tn, analyse_survol: analyse,
    retour: (() => { const p = piste(releve2, 0); return { de: p[0], vers: p[p.length - 1], depassement_pct: depassement(p.map((q) => q.y || q.x)) }; })() };
  writeFileSync(join(dos, "mesure.json"), JSON.stringify(rap, null, 1), "utf8");
  await ctx.close();
  return rap;
}

/* ============================================================
   6 · LE TOGGLE — une bascule d'etat. On veut savoir si l'etat
   FOND dans l'autre ou s'il ROULE, et en combien de temps.
   ============================================================ */
async function mesurer6(nav) {
  const dos = dossier(6, "fancy-toggle");
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("https://fancy-toggle-753251.framer.app/", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: join(dos, "T-0-avant.png"), timeout: 12000 }).catch(() => {});
  const cibles = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("*").forEach((el) => {
      const s = getComputedStyle(el); const r = el.getBoundingClientRect();
      if (r.width < 30 || r.height < 16) return;
      if (!/translate|transform|opacity|all/.test(s.transition) || s.transition.startsWith("all 0s")) return;
      el.setAttribute("data-t", out.length);
      out.push({ i: out.length, sel: el.tagName + "." + (typeof el.className === "string" ? el.className.split(" ")[0] : ""), tn: s.transition.slice(0, 90),
        box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], txt: (el.innerText || "").slice(0, 26).replace(/\s+/g, " ") });
    });
    return out.slice(0, 20);
  });
  /* On clique au centre de la scene : c'est une demo, la bascule
     est l'objet principal. */
  const c = cibles.find((x) => x.box[2] < 200 && x.box[3] < 90) || cibles[0];
  const sonde = page.evaluate(SONDEUR, { sels: ["[data-t]"], ms: 1500, max: 20 });
  if (c) await page.mouse.click(c.box[0] + c.box[2] / 2, c.box[1] + c.box[3] / 2);
  const rel = await sonde;
  await rafale(page, dos, "T-1-bascule", 8, 110);
  const bouges = [];
  for (let k = 0; k < rel.n; k++) {
    const serie = rel.images.map((im) => ({ t: im.t, ...decomposer(im.v[k][0]), op: +im.v[k][1], bg: im.v[k][3] }));
    const dy = serie.map((s) => s.y), dx = serie.map((s) => s.x), op = serie.map((s) => s.op);
    const amp = (a) => Math.abs(a[a.length - 1] - a[0]);
    if (amp(dy) < 0.5 && amp(dx) < 0.5 && amp(op) < 0.02) continue;
    const axe = amp(dy) > amp(dx) ? dy : dx;
    const util = amp(axe) > 0.5 ? axe : op;
    const a = util[0], b = util[util.length - 1];
    const iFin = util.findIndex((v, i) => i > 2 && Math.abs(v - b) < Math.abs(b - a) * 0.01);
    const T = iFin > 0 ? serie[iFin].t : serie[serie.length - 1].t;
    bouges.push({ el: cibles[k]?.sel, tn: cibles[k]?.tn, de: +a.toFixed(3), vers: +b.toFixed(3), duree_ms: +T.toFixed(0),
      depassement_pct: depassement(util), bgAvant: serie[0].bg, bgApres: serie[serie.length - 1].bg,
      courbe: T > 0 ? identifier(serie.filter((s) => s.t <= T).map((s, i) => ({ x: s.t / T, y: (util[i] - a) / (b - a || 1) }))) : null });
  }
  const rap = { ref: 6, cibles: cibles.slice(0, 12), clique: c, bouges };
  writeFileSync(join(dos, "mesure.json"), JSON.stringify(rap, null, 1), "utf8");
  await ctx.close();
  return rap;
}

/* ============================================================
   3 · SPHERE DE PARTICULES — on n'en prend PAS l'objet. On en
   prend la mecanique : dispersion puis recomposition. Ce qui se
   mesure ici, c'est le temps de retour a la forme apres une
   perturbation, et s'il y a un rebond.
   ============================================================ */
async function mesurer3(nav) {
  const dos = dossier(3, "sphere-particules");
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("https://3dparticlesphere.framer.website/", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: join(dos, "P-0-repos.png"), timeout: 12000 }).catch(() => {});
  /* On perturbe comme le fait l'etiquette de la page : glisser. */
  await page.mouse.move(720, 450);
  await page.mouse.down();
  const frames = [];
  for (let i = 0; i < 10; i++) {
    await page.mouse.move(720 + i * 34, 450 - i * 12);
    await page.screenshot({ path: join(dos, `P-1-glisse-${String(i).padStart(2, "0")}.png`), timeout: 12000 }).catch(() => {});
    frames.push(i);
  }
  await page.mouse.up();
  await rafale(page, dos, "P-2-reprise", 10, 110);
  const info = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    if (!c) return null;
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    return { taille: c.width + "x" + c.height, webgl: !!gl,
      /* Le nombre de points est dans le buffer, pas dans le DOM.
         On ne peut pas le lire honnetement : on ne l'invente pas. */
      note: "nombre de particules non lisible depuis le DOM — non estime" };
  });
  const rap = { ref: 3, canvas: info, glissees: frames.length };
  writeFileSync(join(dos, "mesure.json"), JSON.stringify(rap, null, 1), "utf8");
  await ctx.close();
  return rap;
}

/* ============================================================
   5 · MICRO-INTERACTIONS — un site d'agence complet, 12 268 px.
   C'est la source du catalogue : entrees de bloc, survols, nav.
   ============================================================ */
async function mesurer5(nav) {
  const dos = dossier(5, "micro-interactions");
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("https://fullstack-studio.webflow.io/", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2500);

  /* Traversee par pas — un scrollTo qui saute ne declenche rien
     et photographie une page morte. */
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const vues = [];
  const pas = 700;
  for (let y = 0, i = 0; y < h - 900 && i < 18; y += pas, i++) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "auto" }), y);
    await page.waitForTimeout(60);
    await page.screenshot({ path: join(dos, `S-${String(i).padStart(2, "0")}a.png`), timeout: 12000 }).catch(() => {});
    const enVol = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").map((a) => {
      const t = a.effect?.getTiming?.() || {}; const c = a.effect?.target;
      return { cible: c ? c.tagName + "." + (typeof c.className === "string" ? c.className.split(" ")[0] : "") : null, duree: t.duration, easing: t.easing, delai: t.delay };
    }).slice(0, 8));
    await page.waitForTimeout(750);
    await page.screenshot({ path: join(dos, `S-${String(i).padStart(2, "0")}b.png`), timeout: 12000 }).catch(() => {});
    vues.push({ y, enVol });
  }

  /* Survols : on lit les valeurs, on ne photographie pas — une
     capture est plus lente qu'une transition de survol. */
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  const cibles = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("a, button, [class*=card], [class*=btn], [class*=link], [class*=item]").forEach((el) => {
      const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
      if (r.width < 60 || r.height < 24 || r.top < 0 || r.top > innerHeight - 60) return;
      el.setAttribute("data-h", out.length);
      out.push({ i: out.length, sel: el.tagName + "." + (typeof el.className === "string" ? el.className.split(" ")[0] : ""),
        cx: Math.round(r.x + r.width / 2), cy: Math.round(r.y + r.height / 2), tn: s.transition.slice(0, 100), txt: (el.innerText || "").slice(0, 30).replace(/\s+/g, " ") });
    });
    return out.slice(0, 8);
  });
  const survols = [];
  for (const c of cibles) {
    const sonde = page.evaluate(SONDEUR, { sels: [`[data-h="${c.i}"]`, `[data-h="${c.i}"] *`], ms: 900, max: 8 });
    await page.mouse.move(c.cx, c.cy);
    const rel = await sonde;
    await page.mouse.move(2, 2); await page.waitForTimeout(500);
    const serie = rel.images.map((im) => ({ t: im.t, ...decomposer(im.v[0]?.[0]), op: +im.v[0]?.[1], bg: im.v[0]?.[3], clip: im.v[0]?.[2] }));
    const dy = serie.map((s) => s.y), op = serie.map((s) => s.op), sx = serie.map((s) => s.sx);
    const amp = (a) => Math.abs(a[a.length - 1] - a[0]);
    survols.push({ ...c, bougeY: +amp(dy).toFixed(2), bougeOpacite: +amp(op).toFixed(3), bougeEchelle: +amp(sx).toFixed(4),
      clipDebut: serie[0]?.clip, clipFin: serie[serie.length - 1]?.clip,
      bgDebut: serie[0]?.bg, bgFin: serie[serie.length - 1]?.bg,
      depassementY: depassement(dy) });
  }
  const rap = { ref: 5, hauteur: h, vues, survols };
  writeFileSync(join(dos, "mesure.json"), JSON.stringify(rap, null, 1), "utf8");
  await ctx.close();
  return rap;
}

const QUOI = process.argv[2] || "tout";
const nav = await chromium.launch({ headless: true });
const table = { 1: mesurer1, 2: mesurer2, 3: mesurer3, 4: mesurer4, 5: mesurer5, 6: mesurer6 };
const liste = QUOI === "tout" ? ["4", "2", "1", "6", "5", "3"] : [QUOI];
for (const k of liste) {
  process.stdout.write(`\n=== ref ${k} … `);
  try { const r = await table[k](nav); process.stdout.write("ok"); console.log("\n" + JSON.stringify(r).slice(0, 400)); }
  catch (e) { console.log("ECHEC " + String(e).slice(0, 300)); }
}
await nav.close();
console.log("\n→ tools/_refs/*/mesure.json");
