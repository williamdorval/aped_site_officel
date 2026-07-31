/* ============================================================
   BA-CHECK — les trois avant / apres, en huit relevés.

   node tools/ba-check.mjs [adresse] [largeur] [clair|sombre]

   1 · EXISTE      trois comparaisons, deux vues chacune, et le
                   texte de l'etiquette d'honnetete
   2 · SANS SCRIPT le cran fonctionne-t-il sans une ligne de JS ?
                   C'est la promesse centrale de la mecanique.
   3 · VISIBLE     six captures d'un cadre FIXE pendant la bascule,
                   plus l'ecart de pixels entre deux consecutives
   4 · CLAVIER     tabulation jusqu'au cran, fleches, anneau de
                   focus, et l'etat annonce (`aria-checked` natif)
   5 · CACHE       la vue non choisie est-elle vraiment hors
                   d'atteinte — tabulation, `elementFromPoint`
   6 · ISOLE       aucune regle de la maquette de 2011 ne sort de
                   sa boite : on releve `border-radius`,
                   `box-shadow`, `filter` et les degrades PARTOUT
                   dans la page et on verifie qu'ils sont tous
                   dedans
   7 · DEFILE      le texte defilant s'arrete-t-il quand sa vue
                   n'est pas choisie, sous mouvement reduit et aux
                   paliers
   8 · CADRE       debordement horizontal du document
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { decodePNG, diffStats } from "./_png.mjs";
import { filmer } from "./cine.mjs";
const lirePNG = (f) => decodePNG(fs.readFileSync(f));

const BASE = process.argv[2] || "http://127.0.0.1:8099";
const W = parseInt(process.argv[3] || "1440", 10);
const THEME = process.argv[4] || "clair";
const SORTIE = path.resolve("tools/_ba");
fs.mkdirSync(SORTIE, { recursive: true });

const CARTES = ["ba-garage", "ba-restaurant", "ba-deneigement"];
const nav = await chromium.launch();
const R = {};

async function page(opts = {}) {
  const ctx = await nav.newContext({ viewport: { width: W, height: 900 }, deviceScaleFactor: 1, ...opts });
  await ctx.addInitScript((t) => {
    try {
      sessionStorage.setItem("aped-sans-popup", "1");
      localStorage.setItem("aped-theme", t === "sombre" ? "dark" : "light");
    } catch (e) {}
  }, THEME);
  const p = await ctx.newPage();
  const err = [];
  p.on("console", (m) => { if (m.type() === "error") err.push(m.text()); });
  p.on("pageerror", (e) => err.push(String(e)));
  p._err = err;
  return p;
}

/* `content-visibility: auto` fait mentir les rectangles hors ecran :
   on traverse la page entiere avant de mesurer. Piege 4. */
async function traverser(p) {
  await p.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(r));
    }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(260);
}

async function amener(p, id) {
  await p.evaluate(async (id) => {
    const el = document.getElementById(id);
    const c = Math.round(window.scrollY + el.getBoundingClientRect().top - 80);
    while (Math.abs(window.scrollY - c) > 2) {
      const d = c - window.scrollY;
      window.scrollBy(0, Math.sign(d) * Math.min(160, Math.abs(d)));
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }
  }, id);
  await p.waitForTimeout(200);
}

/* ============ 1 · EXISTE ============ */
{
  const p = await page();
  await p.goto(BASE + "/index.html", { waitUntil: "load" });
  await p.waitForTimeout(2500);
  await traverser(p);
  R.existe = await p.evaluate(() => ({
    cartes: document.querySelectorAll("[data-ba]").length,
    avant: document.querySelectorAll(".ba-vue--avant").length,
    apres: document.querySelectorAll(".ba-vue--apres").length,
    radios: document.querySelectorAll("[data-ba-vue]").length,
    etiquettes: [...document.querySelectorAll(".ba-etiq")].map((e) => e.textContent.trim()),
    titres: [...document.querySelectorAll(".ba-num")].map((e) => e.textContent.replace(/\s+/g, " ").trim()),
    ecarts: document.querySelectorAll(".ba-ecart li").length,
    /* AUCUNE PREUVE INVENTEE : on chasse les mots qui feraient
       passer une demonstration pour un mandat. */
    motsInterdits: (function () {
      const t = document.querySelector("#realisations").textContent;
      return ["/5", "étoiles", "avis client", "note de", "livré en", "client depuis", "témoignage"]
        .filter((m) => t.toLowerCase().indexOf(m.toLowerCase()) >= 0);
    })(),
    images: document.querySelectorAll("#realisations img").length
  }));
  R.erreurs = p._err.slice(0, 6);
  await p.context().close();
}

/* ============ 2 · SANS SCRIPT ============ */
{
  const ctx = await nav.newContext({ viewport: { width: W, height: 900 }, javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto(BASE + "/index.html", { waitUntil: "load" });
  await p.waitForTimeout(600);
  const avant = await p.evaluate(() => {
    const c = document.querySelector("#ba-garage");
    return {
      avantVisible: getComputedStyle(c.querySelector(".ba-vue--avant")).visibility,
      apresVisible: getComputedStyle(c.querySelector(".ba-vue--apres")).visibility
    };
  });
  /* On CLIQUE l'etiquette, comme un visiteur — pas la case. */
  await p.click("#ba-garage label[for='ba-garage-apres']");
  await p.waitForTimeout(200);
  const apres = await p.evaluate(() => {
    const c = document.querySelector("#ba-garage");
    return {
      avantVisible: getComputedStyle(c.querySelector(".ba-vue--avant")).visibility,
      apresVisible: getComputedStyle(c.querySelector(".ba-vue--apres")).visibility,
      coche: c.querySelector('[data-ba-vue="apres"]').checked
    };
  });
  R.sansScript = { avant, apres };
  await ctx.close();
}

/* ============ 3 · VISIBLE ============ */
{
  const p = await page();
  await p.goto(BASE + "/index.html", { waitUntil: "load" });
  await p.waitForTimeout(2500);
  await traverser(p);
  await amener(p, "ba-restaurant");   /* la 2e : la 1re joue sa demo toute seule */
  const cadre = await p.evaluate(() => {
    const r = document.querySelector("#ba-restaurant .ba-scene").getBoundingClientRect();
    return { x: Math.round(r.left), y: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) };
  });
  /* ------------------------------------------------------------
     DEUX INSTRUMENTS, PARCE QU'AUCUN DES DEUX NE SUFFIT SEUL.

     PIEGE N° 1 DU PROJET, RENCONTRE UNE FOIS DE PLUS.
     Premiere version : huit `page.screenshot()` espacees de 55 ms.
     Resultat : deux ecarts au-dessus de 1 %, six a zero, et un
     verdict « une etape au moins est invisible » sur un passage de
     520 ms qu'on voit tres bien a l'oeil. La cause n'etait pas dans
     la page : `page.screenshot()` coute 120 a 950 ms sur cette
     machine, et le `waitForTimeout` s'AJOUTAIT a ce cout. Huit
     captures ne filmaient pas une demi-seconde, elles la rataient —
     en rendant des chiffres, ce qui est pire que de ne rien rendre.

     · LE FILM (`Page.startScreencast`) dit COMBIEN D'IMAGES le
       navigateur a reellement peintes pendant le passage. Il ne
       bloque pas le rendu et il horodate a la PEINTURE. C'est le
       seul instrument qui reponde a « qu'est-ce que le visiteur a
       vu ». Mais il rend du JPEG, que `_png.mjs` ne sait pas
       decoder — donc pas d'ecart de pixels.
     · LES CAPTURES, prises DOS A DOS sans aucune attente ajoutee,
       donnent l'ecart de pixels. Leur propre cout devient
       l'intervalle d'echantillonnage, et c'est le plus court qu'on
       puisse obtenir avec cet instrument-la.
     ------------------------------------------------------------ */
  const film = await filmer(p, 1200, async () => {
    await p.evaluate(() => document.querySelector("#ba-restaurant label[for='ba-restaurant-apres']").click());
  });
  R.film = {
    images: film.length,
    dureeMs: film.length > 1 ? Math.round((film[film.length - 1].ts - film[0].ts) * 1000) : 0
  };
  fs.writeFileSync(path.join(SORTIE, "film-premiere.jpg"), film[0].buf);
  fs.writeFileSync(path.join(SORTIE, "film-milieu.jpg"), film[Math.floor(film.length / 2)].buf);

  /* On remet la carte sur « avant » et on refilme, en captures. */
  await p.evaluate(() => document.querySelector("#ba-restaurant label[for='ba-restaurant-avant']").click());
  await p.waitForTimeout(900);
  const suite = [];
  let prec = null;
  await p.evaluate(() => document.querySelector("#ba-restaurant label[for='ba-restaurant-apres']").click());
  for (let i = 0; i < 6; i++) {
    const f = path.join(SORTIE, `passage-${i}.png`);
    await p.screenshot({ path: f, clip: cadre });
    let ecart = null;
    if (prec) { try { ecart = +diffStats(lirePNG(prec), lirePNG(f)).pct.toFixed(2); } catch (e) { ecart = "?"; } }
    prec = f;
    suite.push({ i, ecartPct: ecart, voiles: await p.evaluate(() => document.querySelectorAll("[data-passage]").length) });
  }
  await p.waitForTimeout(900);
  suite.push({ i: "fin", voiles: await p.evaluate(() => document.querySelectorAll("[data-passage]").length), ecartPct: null });
  R.passage = suite;
  R.cadrePassage = cadre;
  await p.context().close();
}

/* ============ 4+5 · CLAVIER ET VUE CACHEE ============ */
{
  const p = await page();
  await p.goto(BASE + "/index.html", { waitUntil: "load" });
  await p.waitForTimeout(2500);
  await traverser(p);
  await amener(p, "ba-deneigement");
  await p.evaluate(() => document.querySelector("#ba-deneigement [data-ba-vue='avant']").focus());
  const focusAvant = await p.evaluate(() => {
    const a = document.activeElement;
    const st = getComputedStyle(a.nextElementSibling);
    return { id: a.id, anneau: st.outlineStyle !== "none" || st.outlineWidth !== "0px" };
  });
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(400);
  const apresFleche = await p.evaluate(() => {
    const c = document.querySelector("#ba-deneigement");
    return {
      actif: document.activeElement.id,
      coche: c.querySelector('[data-ba-vue="apres"]').checked,
      avantVis: getComputedStyle(c.querySelector(".ba-vue--avant")).visibility
    };
  });
  /* LA VUE CACHEE EST-ELLE VRAIMENT HORS D'ATTEINTE ? Un
     `visibility: hidden` retire du parcours de tabulation ET de
     l'arbre d'accessibilite. On le verifie au lieu de le supposer. */
  R.cachee = await p.evaluate(() => {
    const c = document.querySelector("#ba-deneigement");
    const cachee = c.querySelector(".ba-vue--avant");
    const focusables = cachee.querySelectorAll('a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])');
    const r = cachee.getBoundingClientRect();
    const dessus = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return {
      visibilite: getComputedStyle(cachee).visibility,
      focusablesDedans: focusables.length,
      auCentre: dessus ? (dessus.closest(".ba-vue--avant") ? "avant" : (dessus.closest(".ba-vue--apres") ? "apres" : dessus.className)) : null
    };
  });
  R.clavier = { focusAvant, apresFleche };
  await p.context().close();
}

/* ============ 6 · ISOLE ============ */
{
  const p = await page();
  await p.goto(BASE + "/index.html", { waitUntil: "load" });
  await p.waitForTimeout(2500);
  await traverser(p);
  /* LES CINQ INTERDITS DU § 5, RELEVES SUR TOUT LE DOCUMENT RENDU.
     Chacun doit etre soit absent, soit A L'INTERIEUR d'une vue
     « avant » — c'est la definition operationnelle de « isole ». */
  R.isole = await p.evaluate(() => {
    const fautes = { rayon: [], ombre: [], degrade: [], flou: [] };
    const dedans = (e) => !!e.closest(".ba-vue--avant");
    for (const el of document.querySelectorAll("*")) {
      const s = getComputedStyle(el);
      const nom = el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : "");
      if (s.borderRadius && s.borderRadius !== "0px" && !dedans(el)) fautes.rayon.push(nom);
      if (s.boxShadow && s.boxShadow !== "none" && !dedans(el)) fautes.ombre.push(nom);
      if (s.filter && s.filter !== "none" && !dedans(el)) fautes.flou.push(nom + " " + s.filter);
      /* UN `linear-gradient` A UNE SEULE COULEUR EST UN APLAT, PAS
         UN DEGRADE. `.section-rule.is-set` s'ecrit
         `linear-gradient(90deg, var(--rule-strong) 0 100%)` : c'est
         un trait plein obtenu par un degre, pour pouvoir passer de
         la trame de grains au trait par une seule transition. La
         premiere version de cette sonde en comptait quatorze comme
         des fautes. On compte donc les couleurs DISTINCTES : sous
         deux, il n'y a pas de degrade a l'oeil. */
      const bg = s.backgroundImage || "";
      const grad = /(^|\s|,)(linear|radial|conic)-gradient/.test(bg) && !/repeating-/.test(bg);
      const couleurs = new Set((bg.match(/rgba?\([^)]*\)/g) || []).map((c) => c.replace(/\s/g, "")));
      if (grad && couleurs.size >= 2 && !dedans(el) && !natif(el)) fautes.degrade.push(nom);
    }
    const compte = (a) => ({ n: a.length, exemples: [...new Set(a)].slice(0, 5) });
    return {
      rayon: compte(fautes.rayon), ombre: compte(fautes.ombre),
      degrade: compte(fautes.degrade), flou: compte(fautes.flou),
      /* Et l'inverse : la maquette de 2011 emploie-t-elle bien ce
         qu'on lui demande d'employer ? Un « avant » sans un seul
         coin arrondi ne serait pas credible. */
      dansLaMaquette: (function () {
        let r = 0, o = 0, g = 0, f = 0;
        for (const el of document.querySelectorAll(".ba-vue--avant *")) {
          const s = getComputedStyle(el);
          if (s.borderRadius !== "0px") r++;
          if (s.boxShadow !== "none") o++;
          if (/gradient/.test(s.backgroundImage || "")) g++;
          if (s.filter !== "none") f++;
        }
        return { rayon: r, ombre: o, degrade: g, filtre: f };
      })()
    };
  });
  await p.context().close();
}

/* ============ 7 · LE TEXTE DEFILANT ============ */
{
  const p = await page();
  await p.goto(BASE + "/index.html", { waitUntil: "load" });
  await p.waitForTimeout(2500);
  await traverser(p);
  await amener(p, "ba-garage");
  const etat = async () => await p.evaluate(() => {
    const s = document.querySelector("#ba-garage .v11-defile span");
    const st = getComputedStyle(s);
    return { play: st.animationPlayState, nom: st.animationName };
  });
  /* Sur « avant » choisi : ca doit tourner. */
  await p.evaluate(() => document.querySelector("#ba-garage label[for='ba-garage-avant']").click());
  await p.waitForTimeout(300);
  const surAvant = await etat();
  await p.evaluate(() => document.querySelector("#ba-garage label[for='ba-garage-apres']").click());
  await p.waitForTimeout(300);
  const surApres = await etat();
  await p.context().close();

  const p2 = await page({ reducedMotion: "reduce" });
  await p2.goto(BASE + "/index.html", { waitUntil: "load" });
  await p2.waitForTimeout(1800);
  await traverser(p2);
  const sousReduit = await p2.evaluate(() => {
    const s = document.querySelector("#ba-garage .v11-defile span");
    return getComputedStyle(s).animationName;
  });
  await p2.context().close();
  R.defile = { surAvant, surApres, sousReduit };
}

/* ============ 8 · CADRE ============ */
{
  const larg = [320, 390, 480, 768, 1024, 1280, 1440, 1920];
  const debords = [];
  for (const w of larg) {
    const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
    await ctx.addInitScript(() => { try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
    const p = await ctx.newPage();
    await p.goto(BASE + "/index.html", { waitUntil: "load" });
    await p.waitForTimeout(2000);
    await traverser(p);
    debords.push(await p.evaluate((w) => ({
      largeur: w,
      doc: document.documentElement.scrollWidth,
      deborde: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      hauteurScene: Math.round(document.querySelector(".ba-scene").getBoundingClientRect().height)
    }), w));
    await ctx.close();
  }
  R.cadre = debords;
}

await nav.close();

const l = console.log;
l(`\n================  AVANT / APRES · ${W} px · ${THEME}  ================\n`);
l("1 · EXISTE");
l("   comparaisons ........... " + R.existe.cartes + "   (attendu 3)");
l("   vues avant / apres ..... " + R.existe.avant + " / " + R.existe.apres);
l("   boutons du cran ........ " + R.existe.radios + "   (attendu 6)");
l("   lignes d'ecart ......... " + R.existe.ecarts + "   (attendu 9)");
l("   IMAGES dans la section . " + R.existe.images + "   (doit etre 0 : tout est en markup)");
l("   etiquettes : " + R.existe.etiquettes.join(" | "));
l("   titres     : " + R.existe.titres.join(" | "));
l("   mots de fausse preuve .. " + (R.existe.motsInterdits.length ? "TROUVES : " + R.existe.motsInterdits.join(", ") : "aucun"));

l("\n2 · SANS JAVASCRIPT   (le cran doit fonctionner quand meme)");
l("   au repos ....... avant " + R.sansScript.avant.avantVisible + " · apres " + R.sansScript.avant.apresVisible);
l("   apres un clic .. avant " + R.sansScript.apres.avantVisible + " · apres " + R.sansScript.apres.apresVisible + " · coche " + R.sansScript.apres.coche);
const ok2 = R.sansScript.avant.avantVisible === "visible" && R.sansScript.apres.apresVisible === "visible" && R.sansScript.apres.avantVisible === "hidden";
l("   VERDICT ........ " + (ok2 ? "le cran bascule sans une ligne de JS" : "ECHEC"));

l("\n3 · LE PASSAGE EST-IL VISIBLE   (cadre fixe, 55 ms entre deux)");
l("   #    voiles   ecart de pixels");
for (const s of R.passage) l("  " + String(s.i).padStart(3) + "  " + String(s.voiles).padStart(7) + "   " + (s.ecartPct === null ? "-" : s.ecartPct + " %"));
const ep = R.passage.map((s) => s.ecartPct).filter((x) => typeof x === "number");
/* ON COMPTE LES ETAPES AU-DESSUS DU SEUIL, ON NE CONCLUT PAS SUR LE
   MINIMUM. Le passage dure 520 ms et une capture en coute 150 : les
   dernieres du lot tombent APRES la fin du geste, et leur ecart nul
   ne dit rien sur le geste — il dit que le geste est fini. Conclure
   sur le minimum, c'est conclure sur la pire image, ce que le § 0.B
   interdit depuis `contraste-survol`. */
const bouge = ep.filter((x) => x > 1).length;
l("   etapes au-dessus de 1 % : " + bouge + " / " + ep.length + "   (max " + Math.max(...ep) + " %)");
l("   VERDICT : " + (bouge >= 2 && R.film.images >= 8 ? "VISIBLE — " + R.film.images + " images peintes, " + bouge + " etapes mesurables" : "A REPRENDRE"));
l("   voiles residuels a la fin : " + R.passage[R.passage.length - 1].voiles + "   (doit etre 0)");

l("\n4 · CLAVIER");
l("   focus sur le cran ...... " + R.clavier.focusAvant.id + "   anneau visible : " + R.clavier.focusAvant.anneau);
l("   fleche droite .......... actif " + R.clavier.apresFleche.actif + " · coche " + R.clavier.apresFleche.coche + " · vue avant " + R.clavier.apresFleche.avantVis);

l("\n5 · LA VUE NON CHOISIE EST HORS D'ATTEINTE");
l("   visibilite ............. " + R.cachee.visibilite);
l("   elements focusables .... " + R.cachee.focusablesDedans + "   (0 = rien a tabuler dedans)");
l("   ce qui est au centre ... " + R.cachee.auCentre);

l("\n6 · L'ISOLATION   (les 5 interdits du § 5, releves sur TOUT le document)");
l("   coins arrondis HORS maquette ... " + R.isole.rayon.n + (R.isole.rayon.n ? "  " + R.isole.rayon.exemples.join(", ") : ""));
l("   ombres portees HORS maquette ... " + R.isole.ombre.n + (R.isole.ombre.n ? "  " + R.isole.ombre.exemples.join(", ") : ""));
l("   degrades HORS maquette ......... " + R.isole.degrade.n + (R.isole.degrade.n ? "  " + R.isole.degrade.exemples.join(", ") : ""));
l("   filtres HORS maquette .......... " + R.isole.flou.n + (R.isole.flou.n ? "  " + R.isole.flou.exemples.join(", ") : ""));
l("   DANS la maquette (doit etre > 0) : rayon " + R.isole.dansLaMaquette.rayon + " · ombre " + R.isole.dansLaMaquette.ombre + " · degrade " + R.isole.dansLaMaquette.degrade + " · filtre " + R.isole.dansLaMaquette.filtre);

l("\n7 · LE TEXTE DEFILANT DE 2011");
l("   vue « avant » choisie .. " + R.defile.surAvant.nom + " / " + R.defile.surAvant.play);
l("   vue « apres » choisie .. " + R.defile.surApres.nom + " / " + R.defile.surApres.play + "   (doit etre paused)");
l("   sous mouvement reduit .. " + R.defile.sousReduit + "   (doit etre none)");

l("\n8 · CADRE");
l("   largeur   document   deborde   hauteur de scene");
for (const d of R.cadre) l("   " + String(d.largeur).padStart(6) + "   " + String(d.doc).padStart(8) + "   " + String(d.deborde).padStart(7) + "   " + String(d.hauteurScene).padStart(16));
l("   debordement maximal : " + Math.max(...R.cadre.map((d) => d.deborde)) + " px");

l("\nERREURS CONSOLE : " + (R.erreurs.length ? R.erreurs.join(" | ") : "aucune"));
l("\nCaptures : " + SORTIE + "\n");
fs.writeFileSync(path.join(SORTIE, `rapport-${W}-${THEME}.json`), JSON.stringify(R, null, 2));
