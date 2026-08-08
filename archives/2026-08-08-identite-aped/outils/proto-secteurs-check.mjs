/* ------------------------------------------------------------
   MESURE DES TREIZE APERCUS DE SECTEUR.
   Rend des chiffres, pas des impressions :
   - une capture par maquette, par theme, par largeur ;
   - le contraste effectif de CHAQUE noeud de texte, fond composite
     calcule en remontant les ancetres (les lavis d'accent sont
     semi-transparents, un fond lu tel quel serait faux) ;
   - tout debordement horizontal ou vertical dans le cadre ;
   - toute erreur de console.
   Lancer : node tools/serve.mjs 8098   puis   node tools/proto-secteurs-check.mjs
   ------------------------------------------------------------ */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ICI = dirname(fileURLToPath(import.meta.url));
const SORTIE = join(ICI, "_captures-secteurs");
const URLBASE = process.env.PROTO_URL || "http://127.0.0.1:8098/tools/proto-secteurs.html";

const CLES = ["restaurant", "boutique", "coiffure", "gym", "hotel", "garage",
  "construction", "paysagement", "clinique", "immobilier", "juridique", "photo", "atelier"];

mkdirSync(SORTIE, { recursive: true });

const SONDE = () => {
  /* --- couleur --- */
  const lire = (s) => {
    const m = s.match(/[\d.]+/g);
    if (!m) return [0, 0, 0, 1];
    return [+m[0], +m[1], +m[2], m[3] === undefined ? 1 : +m[3]];
  };
  const sur = (h, b) => {
    const a = h[3];
    return [h[0] * a + b[0] * (1 - a), h[1] * a + b[1] * (1 - a), h[2] * a + b[2] * (1 - a), 1];
  };
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  /* Le fond effectif se compose en remontant les ancetres : un lavis
     a 10 % pose sur une surface claire n'est pas le lavis. */
  const fond = (el) => {
    let pile = [];
    let n = el;
    while (n && n.nodeType === 1) {
      const bg = lire(getComputedStyle(n).backgroundColor);
      if (bg[3] > 0) pile.push(bg);
      if (bg[3] >= 0.999) break;
      n = n.parentElement;
    }
    let base = [255, 255, 255, 1];
    for (let i = pile.length - 1; i >= 0; i--) base = sur(pile[i], base);
    return base;
  };

  const res = { textes: [], debords: [], coupes: [] };
  document.querySelectorAll(".proto-cadre").forEach((cadre) => {
    const mock = cadre.querySelector(".mock");
    if (!mock) return;
    const cle = mock.dataset.mock;
    const taille = cadre.classList.contains("proto-cadre--300") ? "300" : "640";
    const rc = cadre.getBoundingClientRect();

    mock.querySelectorAll("*").forEach((el) => {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;

      /* DEUX DEFAUTS DIFFERENTS, deux mesures differentes.

         1. DEBORDEMENT — un bloc sort du cadre et RESTE VISIBLE.
            Le panoramique fait 168 % de son cadre et la pile de la
            galerie 300 % de sa fenetre : ce sont des depassements
            voulus, et un parent les coupe. Un element coupe par un
            ancetre ne peut pas deborder de la maquette, donc on ne
            mesure que les elements qu'AUCUN ancetre ne coupe. */
      let coupePar = null, n = el.parentElement;
      while (n && n !== cadre.parentElement) {
        const c = getComputedStyle(n);
        if (c.overflow !== "visible" || c.overflowX !== "visible" || c.overflowY !== "visible") { coupePar = n; break; }
        n = n.parentElement;
      }
      if (!coupePar && cs.position !== "fixed") {
        const pire = Math.max(r.right - rc.right, r.bottom - rc.bottom, rc.left - r.left, rc.top - r.top);
        if (pire > 0.5) res.debords.push({ cle, taille, sel: el.className || el.tagName, px: +pire.toFixed(1) });
      }

      /*  2. TEXTE COUPE — mesure sur le TEXTE lui-meme, pas sur la
             boite. `scrollWidth` compte aussi les enfants poses en
             absolu : le panoramique a 168 % et le trait du jour, qui
             debordent volontairement, faisaient remonter leur
             conteneur comme « coupe » alors qu'aucune lettre n'etait
             perdue. Un `Range` sur les noeuds de texte propres du
             noeud donne l'encre reellement posee, et rien d'autre.
             `text-overflow: ellipsis` n'excuse rien : une ellipse
             qui se declenche vraiment, c'est du texte perdu. */
      const rogne = cs.overflow !== "visible" || cs.overflowX !== "visible" || cs.overflowY !== "visible";
      if (rogne) {
        let tr = null;
        for (const nd of el.childNodes) {
          if (nd.nodeType !== 3 || !nd.textContent.trim()) continue;
          const rg = document.createRange();
          rg.selectNodeContents(nd);
          const b = rg.getBoundingClientRect();
          if (b.width === 0 && b.height === 0) continue;
          tr = tr ? {
            left: Math.min(tr.left, b.left), top: Math.min(tr.top, b.top),
            right: Math.max(tr.right, b.right), bottom: Math.max(tr.bottom, b.bottom)
          } : { left: b.left, top: b.top, right: b.right, bottom: b.bottom };
        }
        if (tr) {
          const pl = parseFloat(cs.borderLeftWidth), pt = parseFloat(cs.borderTopWidth);
          const boite = {
            left: r.left + pl, top: r.top + pt,
            right: r.left + pl + el.clientWidth, bottom: r.top + pt + el.clientHeight
          };
          const dx = +Math.max(tr.right - boite.right, boite.left - tr.left).toFixed(1);
          const dy = +Math.max(tr.bottom - boite.bottom, boite.top - tr.top).toFixed(1);
          if (dx > 1 || dy > 1) {
            res.coupes.push({
              cle, taille, sel: el.className || el.tagName,
              txt: el.textContent.trim().slice(0, 40), dx, dy
            });
          }
        }
      }

      /* contraste : uniquement les noeuds qui portent du texte propre */
      const propre = Array.from(el.childNodes)
        .filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(" ").trim();
      if (!propre) return;
      const fg0 = lire(cs.color);
      const bg = fond(el);
      const fg = sur(fg0, bg);
      const px = parseFloat(cs.fontSize);
      const gras = parseInt(cs.fontWeight, 10) >= 700;
      const grand = px >= 24 || (px >= 18.66 && gras);
      res.textes.push({
        cle, taille,
        sel: (el.className && typeof el.className === "string" ? el.className : el.tagName),
        txt: propre.slice(0, 34),
        px: +px.toFixed(2),
        ratio: +ratio(fg, bg).toFixed(2),
        seuil: grand ? 3 : 4.5
      });
    });
  });
  return res;
};

const nav = await chromium.launch();
const rapport = { themes: {}, console: [] };

for (const theme of ["light", "dark"]) {
  const ctx = await nav.newContext({ viewport: { width: 1500, height: 1200 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") rapport.console.push(theme + " · " + m.type() + " · " + m.text()); });
  page.on("pageerror", (e) => rapport.console.push(theme + " · pageerror · " + e.message));

  await page.goto(URLBASE, { waitUntil: "networkidle" });
  await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
  await page.click("#basculeAnim");           // fige les animations a leur etat de repos
  await page.waitForTimeout(450);

  const mesure = await page.evaluate(SONDE);
  rapport.themes[theme] = mesure;

  for (const cle of CLES) {
    for (const taille of ["640", "300"]) {
      const el = page.locator(`.proto-item[data-mock="${cle}"][data-taille="${taille}"] .proto-cadre`);
      if (await el.count()) {
        await el.first().screenshot({ path: join(SORTIE, `${cle}-${taille}-${theme}.png`) });
      }
    }
  }
  /* Une planche d'ensemble : c'est la seule vue qui dit si les
     treize se ressemblent entre elles. */
  await page.locator("#grille640").screenshot({ path: join(SORTIE, `_planche-${theme}.png`) });

  /* LE MOUVEMENT. Une capture figee ne prouve pas qu'une animation
     tourne — elle prouve qu'un etat de repos existe. On degele et
     on prend trois planches a 0,9 / 2,1 / 3,3 s : si les trois sont
     identiques, rien ne bouge ; si une seule montre un ecran a
     moitie construit sans que la boucle y revienne, l'animation est
     mal bornee. */
  if (theme === "light") {
    await page.click("#basculeAnim");
    for (const [i, t] of [900, 1200, 1200].entries()) {
      await page.waitForTimeout(t);
      await page.locator("#grille640").screenshot({ path: join(SORTIE, `_mouvement-${i + 1}.png`) });
    }
  }
  await ctx.close();
}

/* ------------------------------------------------------------
   MOUVEMENT REDUIT. L'etat de repos doit etre la forme FINALE :
   une maquette figee a mi-construction se lirait comme un bogue,
   ce qui est exactement le reproche que ce chantier corrige.
   On verifie aussi ici l'ordre et les identifiants des treize.
   ------------------------------------------------------------ */
{
  const ctx = await nav.newContext({
    viewport: { width: 1500, height: 1200 }, deviceScaleFactor: 2, reducedMotion: "reduce"
  });
  const page = await ctx.newPage();
  await page.goto(URLBASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.locator("#grille640").screenshot({ path: join(SORTIE, "_repos-mouvement-reduit.png") });

  rapport.ordre = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#tplSecteurs")).length
      ? Array.from(document.getElementById("tplSecteurs").content.querySelectorAll(".mock"))
        .map((m) => m.dataset.mock)
      : []);
  rapport.anime = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#grille640 .mock")).map((m) => ({
      cle: m.dataset.mock,
      restants: m.getAnimations({ subtree: true }).length
    })));
  await ctx.close();
}

await nav.close();

/* ------------------------------------------------------------ */
const ligne = (s) => console.log(s);
let echecs = 0, mesures = 0;
const pires = new Map();

for (const theme of ["light", "dark"]) {
  const m = rapport.themes[theme];
  for (const t of m.textes) {
    mesures++;
    const k = `${t.cle}`;
    const p = pires.get(k);
    if (!p || t.ratio < p.ratio) pires.set(k, { ...t, theme });
    if (t.ratio < t.seuil) {
      echecs++;
      ligne(`  ECHEC ${theme} ${t.taille} ${t.cle} — ${t.ratio}:1 (seuil ${t.seuil}) « ${t.txt} » [${t.sel}]`);
    }
  }
}

ligne("");
ligne("CONTRASTES — pire mesure de chaque secteur, tous themes confondus");
ligne("secteur        ratio   seuil  theme   texte");
for (const cle of CLES) {
  const p = pires.get(cle);
  if (!p) { ligne(`${cle.padEnd(14)} —      aucun texte mesure`); continue; }
  ligne(`${cle.padEnd(14)} ${String(p.ratio).padEnd(7)} ${String(p.seuil).padEnd(6)} ${p.theme.padEnd(7)} ${p.txt}`);
}

ligne("");
ligne(`Noeuds de texte mesures : ${mesures} — echecs : ${echecs}`);

const deb = [...rapport.themes.light.debords, ...rapport.themes.dark.debords];
ligne(`Debordements : ${deb.length}`);
for (const d of deb.slice(0, 40)) ligne(`  ${d.cle} @${d.taille} — ${d.px} px — ${d.sel}`);

const cut = [...rapport.themes.light.coupes, ...rapport.themes.dark.coupes];
ligne(`Textes coupes : ${cut.length}`);
for (const c of cut.slice(0, 40)) ligne(`  ${c.cle} @${c.taille} — dx ${c.dx} dy ${c.dy} — [${c.sel}] « ${c.txt} »`);

const attendu = CLES.join(",");
const obtenu = (rapport.ordre || []).join(",");
ligne(`Ordre et identifiants des treize : ${obtenu === attendu ? "CONFORME" : "ECART -> " + obtenu}`);
const bougentEncore = (rapport.anime || []).filter((a) => a.restants > 0);
ligne(`Sous mouvement reduit, maquettes qui animent encore : ${bougentEncore.length}`);
for (const a of bougentEncore) ligne(`  ${a.cle} — ${a.restants} animation(s)`);

ligne(`Console : ${rapport.console.length}`);
for (const c of rapport.console.slice(0, 20)) ligne("  " + c);

writeFileSync(join(SORTIE, "rapport.json"), JSON.stringify(rapport, null, 1));
ligne(`\nCaptures et rapport : ${SORTIE}`);
process.exit(echecs || deb.length || cut.length ? 1 : 0);
