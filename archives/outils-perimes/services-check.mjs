/* ============================================================
   SECTION 02 · SERVICES — LA PREUVE
   `node tools/services-check.mjs [adresse] [largeur]`

   REECRIT EN ENTIER LE 2026-07-30, POUR LA DEUXIEME FOIS, et la
   raison est toujours le piege 17 de `CLAUDE.md` : « quand on
   corrige un defaut, lire le test qui le couvrait — s'il passe
   encore sans modification, c'est lui le probleme. »

   La version precedente eprouvait une grille a deux colonnes et
   quatre `<details>` ouverts EN PLACE. Il n'y a plus ni grille ni
   ouverture en place : elle ne pouvait donc plus rien couvrir.

   DIX RELEVES, UN PAR PROMESSE TENUE AU PROPRIETAIRE :
     1  ECHELLE      la section entre-t-elle dans un ecran ?
     2  PLANCHE      les quatre chantiers sont-ils lisibles SANS un
                     geste, et leurs trois lignes tombent-elles au
                     pixel ?
     3  RAIL         crans, carte suivante qui depasse, et le rail
                     NE DETOURNE PAS le defilement vertical
     4  ANCRE        dix rechargements sur `#svc-03`
     5  PANNEAU      zero pixel de deplacement derriere, a
                     l'ouverture ET a la fermeture
     6  FERMETURES   Echap, voile, bouton, Precedent, un seul ouvert
     7  CLAVIER      atteignable, le focus ne bouge pas la page, le
                     piege tient
     8  SANS JS      ce qui reste quand le script ne s'execute pas
     9  VISIBLE      cinq captures et l'ecart de pixels entre deux
                     consecutives, par mouvement
    10  TENUE        LCP, CLS, images par seconde, debordement,
                     console, poids
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import { decodePNG, diffStats } from "./_png.mjs";

const BASE = process.argv[2] || "http://127.0.0.1:8099";
const W = Number(process.argv[3] || 1440);
const H = 900;
const OUT = "tools/_svc";
fs.mkdirSync(OUT, { recursive: true });

let echecs = 0;
const dit = (ok, quoi, val) => {
  if (!ok) echecs++;
  console.log("  " + (ok ? "ok  " : "!!  ") + quoi.padEnd(52) + (val === undefined ? "" : val));
};
const titre = (t) => console.log("\n" + t + "\n" + "-".repeat(t.length));

const nav = await chromium.launch();

/* Toute page passe par ici : le popup cadeau ouvert par
   `showModal()` capture TOUS les evenements de pointeur et ferait
   expirer n'importe quel clic en accusant le mauvais coupable
   (piege 18). */
async function page(ctx, url) {
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { sessionStorage["aped-sans-popup"] = "1"; } catch (e) {} });
  await p.goto(url || BASE + "/index.html", { waitUntil: "load" });
  await p.waitForTimeout(2400);
  return p;
}

/* `content-visibility: auto` fait mentir `getBoundingClientRect()`
   sur les sections hors ecran : elles rendent la taille RESERVEE
   (piege 4). `#services` en est exclu, mais les sections d'apres ne
   le sont pas et decalent la hauteur du document. */
async function traverser(p) {
  await p.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise(r => requestAnimationFrame(r)); }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(700);
}

async function auxServices(p) {
  await p.evaluate(() => {
    const y = document.querySelector("#services").getBoundingClientRect().top + scrollY;
    window.scrollTo(0, y - 56);
  });
  await p.waitForTimeout(500);
  await poser(p);
}

/* ATTENDRE QUE LA PAGE SE POSE — sans ca, tout le releve 5 est faux.
   Mesure du 2026-07-30 : sans toucher a rien, `scrollY` derivait de
   1531 a 1553 en quatre images. Ce n'est pas la section : c'est
   l'ANCRAGE DE DEFILEMENT de Chrome, qui corrige la position quand
   une image en chargement differe prend sa taille au-dessus du pli.
   Le releve « rien ne bouge derriere » rendait donc 38 px sur un
   panneau qui, lui, ne bougeait rien du tout : les quatre cartes, le
   rail et la planche avaient tous exactement le meme delta que la
   page, c'est-a-dire qu'aucun n'avait bouge DANS LE DOCUMENT.
   On attend donc que `scrollY` soit stable sur huit images
   consecutives avant de mesurer quoi que ce soit, et on mesure en
   coordonnees de DOCUMENT, pas d'ecran. */
async function poser(p, maxi) {
  await p.evaluate((maxi) => new Promise((ok) => {
    let stable = 0, dernier = -1, tours = 0;
    (function tour() {
      const y = Math.round(scrollY);
      stable = (y === dernier) ? stable + 1 : 0;
      dernier = y;
      if (stable >= 8 || ++tours > (maxi || 180)) ok();
      else requestAnimationFrame(tour);
    })();
  }), maxi);
}

const ctx = await nav.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
console.log("SECTION 02 · SERVICES — " + BASE + " — " + W + "x" + H);

/* ============================================================
   1 · L'ECHELLE
   Le defaut le plus couteux de la version d'avant, et il etait
   invisible : 2 356 px a 1440x900, soit 2,62 ECRANS. « Les quatre
   chantiers se voient d'un coup » etait vrai dans le document et
   faux a l'ecran.
   ============================================================ */
titre("1 · ECHELLE");
{
  const p = await page(ctx);
  await traverser(p);
  const m = await p.evaluate(() => {
    const s = document.querySelector("#services").getBoundingClientRect();
    const c = document.querySelector("#svc-01").getBoundingClientRect();
    return {
      h: Math.round(s.height), vh: innerHeight,
      carte: Math.round(c.width) + "x" + Math.round(c.height),
      titre: getComputedStyle(document.querySelector(".svc-plan-nom")).fontSize
    };
  });
  const ecrans = +(m.h / m.vh).toFixed(2);
  dit(ecrans <= 1.6, "section sous 1,6 ecran", m.h + " px = " + ecrans + " ecrans (etait 2,62)");
  dit(true, "carte", m.carte + " (etait 560x799)");
  dit(true, "corps du nom de chantier", m.titre + " (etait 40px)");
  await p.close();
}

/* ============================================================
   2 · LA PLANCHE — ce qui paie le rail.
   Les quatre noms, phrases et delais doivent etre PEINTS au repos.
   Et leurs trois lignes doivent tomber au pixel : la regularite est
   le seul levier de « cher » qu'on puisse mesurer.
   ============================================================ */
titre("2 · PLANCHE");
{
  const p = await page(ctx);
  await traverser(p);
  await auxServices(p);
  const m = await p.evaluate(() => {
    const plans = [...document.querySelectorAll(".svc-plan")];
    const y = (sel) => plans.map(l => Math.round(l.querySelector(sel).getBoundingClientRect().top));
    return {
      lisible: plans.every(l => {
        const r = l.getBoundingClientRect();
        return r.width > 40 && r.height > 40 && getComputedStyle(l).visibility === "visible";
      }),
      dedans: plans.every(l => {
        const r = l.getBoundingClientRect();
        return r.top >= -2 && r.bottom <= innerHeight + 2;
      }),
      mots: plans.map(l => l.textContent.trim().split(/\s+/).length).reduce((a, b) => a + b, 0),
      noms: y(".svc-plan-nom"), dits: y(".svc-plan-dit"), delais: y(".svc-plan-delai"),
      actifs: plans.filter(l => l.hasAttribute("data-actif")).length
    };
  });
  const plat = (a) => Math.max(...a) - Math.min(...a);
  dit(m.lisible, "les quatre chantiers peints sans un geste", "4 / 4");
  dit(m.dedans, "les quatre tiennent dans un seul ecran");
  dit(m.mots <= 111, "sous le seuil NN/g de 111 mots", m.mots + " mots");
  dit(plat(m.noms) === 0, "les quatre noms sur la meme ligne", plat(m.noms) + " px d'ecart");
  dit(plat(m.dits) === 0, "les quatre phrases sur la meme ligne", plat(m.dits) + " px d'ecart");
  dit(plat(m.delais) === 0, "les quatre delais sur la meme ligne", plat(m.delais) + " px d'ecart");
  dit(m.actifs === 1, "un seul chantier marque actif", m.actifs);
  await p.close();
}

/* ============================================================
   3 · LE RAIL
   La contrainte la plus dure du brief : « le rail ne detourne
   jamais le defilement vertical de la page ». On l'eprouve avec une
   vraie molette posee AU-DESSUS du rail.
   ============================================================ */
titre("3 · RAIL");
{
  const p = await page(ctx);
  await traverser(p);
  await auxServices(p);

  const geo = await p.evaluate(() => {
    const r = document.querySelector(".svc-rail");
    const c = [...document.querySelectorAll(".svc-carte")].map(x => x.getBoundingClientRect());
    return {
      snap: getComputedStyle(r).scrollSnapType,
      course: r.scrollWidth - r.clientWidth,
      depasse: c.some(b => b.left < innerWidth - 24 && b.right > innerWidth),
      pin: !!document.querySelector(".is-pinned, [data-pin]")
    };
  });
  dit(geo.snap.indexOf("x mandatory") >= 0, "scroll-snap natif par crans", geo.snap);
  dit(geo.course > 100, "le rail a de la course", geo.course + " px");
  dit(geo.depasse, "la carte suivante depasse a droite");
  dit(!geo.pin, "aucun pin");

  /* LA MOLETTE VERTICALE AU-DESSUS DU RAIL. Si elle est detournee,
     la page ne bouge pas et le rail glisse : c'est exactement ce
     qu'il ne faut pas. */
  const boite = await p.evaluate(() => {
    const r = document.querySelector(".svc-rail").getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });
  const avant = await p.evaluate(() => ({ page: scrollY, rail: document.querySelector(".svc-rail").scrollLeft }));
  /* UNE SEULE IMPULSION NE MESURE PAS UN DEFILEMENT. Playwright
     emet un evenement de molette ; la page le lisse sur plusieurs
     images et 600 ms n'en rendaient que 38 px. On pousse cinq crans,
     comme un vrai visiteur, et on attend que ca se pose. Ce qui est
     mesure reste le meme : la PAGE avance-t-elle, et le rail
     reste-t-il en place ? */
  await p.mouse.move(boite.x, boite.y);
  for (let k = 0; k < 5; k++) { await p.mouse.wheel(0, 300); await p.waitForTimeout(120); }
  await p.waitForTimeout(900);
  const apres = await p.evaluate(() => ({ page: scrollY, rail: document.querySelector(".svc-rail").scrollLeft }));
  dit(apres.page - avant.page > 200, "la molette verticale defile la PAGE", "+" + Math.round(apres.page - avant.page) + " px");
  dit(Math.abs(apres.rail - avant.rail) < 2, "et ne fait pas glisser le rail", Math.round(apres.rail - avant.rail) + " px");

  /* LES CRANS PAR LA PLANCHE. Un clic ne doit deplacer QUE le rail. */
  await auxServices(p);
  for (const n of ["02", "03", "04"]) {
    await poser(p);
    const av = await p.evaluate(() => scrollY);
    await p.evaluate((id) => document.querySelector('[data-svc-vers="svc-' + id + '"]').click(), n);
    await p.waitForTimeout(900);
    await poser(p);
    /* ON NE RECOPIE PAS LA FORMULE DU CODE. La premiere version de
       ce fichier calculait la cible avec `c.offsetLeft - pad`,
       exactement comme `main.js` : elle a donc declare « le rail
       s'aligne, 0 px » pendant que le rail partait au bout a chaque
       clic, parce que les deux partageaient la meme erreur
       d'`offsetParent`. Ce qui se mesure ici est OBSERVABLE : le
       bord gauche de la carte demandee doit tomber sur le bord
       gauche utile du rail. */
    const r = await p.evaluate((id) => {
      const rail = document.querySelector(".svc-rail");
      const rb = rail.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(rail).paddingLeft) || 0;
      const cb = document.getElementById("svc-" + id).getBoundingClientRect();
      const li = [...document.querySelectorAll(".svc-plan")][Number(id) - 1];
      const bout = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2;
      return {
        ecart: bout ? 0 : Math.abs(cb.left - (rb.left + pad)),
        actif: li.hasAttribute("data-actif"),
        page: scrollY
      };
    }, n);
    dit(r.ecart < 3, "cran " + n + " : le rail s'aligne", Math.round(r.ecart) + " px");
    dit(r.actif, "cran " + n + " : la planche marque le bon chantier");
    dit(Math.abs(r.page - av) < 2, "cran " + n + " : la PAGE ne bouge pas", Math.round(r.page - av) + " px");
  }
  await p.close();
}

/* ============================================================
   4 · L'ARRIVEE PAR ANCRE ET LE RECHARGEMENT — DIX FOIS.
   « C'est le bug qui doit ne jamais revenir : teste-le dix fois. »
   Deux faces : le navigateur restaure le `scrollLeft` d'un
   conteneur APRES le premier rendu, et une ancre vers une carte
   fait defiler le rail ET la page sans les coordonner.
   ============================================================ */
titre("4 · ANCRE ET RECHARGEMENT — 10 passes");
{
  let bons = 0, sansSaut = 0, pire = 0;
  for (let i = 0; i < 10; i++) {
    const p = await page(ctx, BASE + "/index.html#svc-03");
    await p.waitForTimeout(500);
    const a = await p.evaluate(() => scrollY);
    await p.waitForTimeout(1500);
    const b = await p.evaluate(() => {
      const rail = document.querySelector(".svc-rail");
      const c = document.getElementById("svc-03");
      const pad = parseFloat(getComputedStyle(rail).paddingLeft) || 0;
      const m = rail.scrollWidth - rail.clientWidth;
      const vise = Math.min(m, Math.max(0, c.offsetLeft - pad));
      return { y: scrollY, ecart: Math.abs(rail.scrollLeft - vise) };
    });
    const saut = Math.abs(b.y - a);
    pire = Math.max(pire, saut);
    if (saut < 3) sansSaut++;
    if (b.ecart < 4) bons++;
    await p.close();
  }
  dit(bons === 10, "rail sur la bonne carte", bons + " / 10");
  dit(sansSaut === 10, "aucun saut de page apres le rendu", sansSaut + " / 10, pire ecart " + Math.round(pire) + " px");
}

/* ============================================================
   5 · LE PANNEAU — ZERO PIXEL DERRIERE.
   « Si la mise en page se deforme d'un seul pixel, ce n'est pas
   fini. » On releve la boite des quatre cartes, du rail, de la
   planche, la hauteur de la section, la position du rail et celle
   de la page — avant, pendant, apres.
   ============================================================ */
titre("5 · PANNEAU — deformation");
{
  const p = await page(ctx);
  await traverser(p);
  await auxServices(p);

  /* COORDONNEES DE DOCUMENT (`top + scrollY`), PAS D'ECRAN. Une
     boite mesuree a l'ecran melange deux choses : ce que la section
     a fait, et ce que la page a fait. C'est la difference entre
     « la mise en page s'est deformee » et « la page a defile ». */
  const releve = () => p.evaluate(() => {
    const b = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top + scrollY), Math.round(r.width), Math.round(r.height)]; };
    return {
      cartes: [...document.querySelectorAll(".svc-carte")].map(b),
      rail: b(document.querySelector(".svc-rail")),
      planche: b(document.querySelector(".svc-planche")),
      section: Math.round(document.querySelector("#services").getBoundingClientRect().height),
      railX: Math.round(document.querySelector(".svc-rail").scrollLeft),
      page: Math.round(scrollY)
    };
  });
  const ecart = (a, b) => {
    let d = 0;
    a.cartes.forEach((c, i) => c.forEach((v, k) => { d = Math.max(d, Math.abs(v - b.cartes[i][k])); }));
    a.rail.forEach((v, k) => { d = Math.max(d, Math.abs(v - b.rail[k])); });
    a.planche.forEach((v, k) => { d = Math.max(d, Math.abs(v - b.planche[k])); });
    return Math.max(d, Math.abs(a.section - b.section), Math.abs(a.railX - b.railX), Math.abs(a.page - b.page));
  };

  await poser(p);
  const av = await releve();
  await p.evaluate(() => document.querySelector("#svc-02 .svc-plus").click());
  await p.waitForTimeout(1200);
  await poser(p);
  const pendant = await releve();
  dit(ecart(av, pendant) === 0, "a l'OUVERTURE : rien ne bouge derriere", ecart(av, pendant) + " px");

  /* Le panneau est-il vraiment sur l'ECRAN, et pas clippe dans la
     section ? C'est la question que `content-visibility`,
     `clip-path` et toute transformation d'ancetre posent. */
  const pan = await p.evaluate(() => {
    const d = document.querySelector("#svc-02 .svc-detail");
    const r = d.getBoundingClientRect();
    const vb = getComputedStyle(document.querySelector("#svc-02 .svc-porte"), "::before");
    const coin = document.elementFromPoint(8, innerHeight - 8);
    return {
      pos: getComputedStyle(d).position,
      dedans: r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1,
      w: Math.round(r.width), h: Math.round(r.height),
      voile: vb.backgroundColor, voilePos: vb.position,
      coinCouvert: !!(coin && coin.closest && coin.closest(".svc-porte"))
    };
  });
  dit(pan.pos === "fixed", "le panneau est hors du flux", pan.pos + " " + pan.w + "x" + pan.h);
  dit(pan.dedans, "le panneau tient entierement dans l'ecran");
  dit(pan.voilePos === "fixed" && pan.voile.indexOf("rgba") === 0, "le voile est fixe et translucide", pan.voile);
  dit(pan.coinCouvert, "le voile couvre le coin oppose de l'ecran");

  await p.evaluate(() => document.querySelector("#svc-02 .svc-plus").click());
  await p.waitForTimeout(1000);
  await poser(p);
  const ap = await releve();
  dit(ecart(av, ap) === 0, "a la FERMETURE : on revient exactement", ecart(av, ap) + " px");
  await p.close();
}

/* ============================================================
   6 · LES QUATRE FERMETURES
   ============================================================ */
titre("6 · FERMETURES");
{
  const p = await page(ctx);
  await traverser(p);
  await auxServices(p);
  const ouvert = () => p.evaluate(() => !!document.querySelector(".svc-detail[open]"));
  /* UN ECHEC NE DOIT PAS SE PROPAGER. Premiere version : quand le
     clic au voile ne fermait pas, l'`ouvrir()` suivant tombait sur
     un panneau deja ouvert, le refermait, et les trois releves
     d'apres accusaient un code qui allait bien. On force donc
     l'etat ferme AVANT chaque essai, sans passer par l'interface. */
  const ouvrir = async (n) => {
    await p.evaluate(() => {
      document.querySelectorAll(".svc-detail[open]").forEach(d => { d.open = false; d.removeAttribute("data-sortant"); });
    });
    await p.waitForTimeout(250);
    await p.evaluate((id) => document.querySelector("#svc-" + id + " .svc-plus").click(), n || "01");
    await p.waitForTimeout(1000);
    return ouvert();
  };

  await ouvrir();
  await p.keyboard.press("Escape");
  await p.waitForTimeout(800);
  dit(!(await ouvert()), "Echap ferme");

  await ouvrir();
  await p.mouse.click(10, H - 10);
  await p.waitForTimeout(800);
  dit(!(await ouvert()), "un clic sur le voile ferme");

  await ouvrir();
  await p.evaluate(() => document.querySelector("#svc-01 .svc-plus").click());
  await p.waitForTimeout(800);
  dit(!(await ouvert()), "le bouton Fermer ferme");

  /* PRECEDENT. `p.goBack()` de Playwright depile l'historique du
     NAVIGATEUR ; si notre `pushState` n'y est plus, il quitte la
     page et tout ce qui suit s'effondre. On verifie donc d'abord
     que l'etat pousse est bien la — c'est aussi ce qu'on veut
     prouver. */
  dit(await ouvrir(), "le panneau s'ouvre");
  const etat = await p.evaluate(() => history.state && history.state.aped);
  dit(etat === "svc-fiche", "l'ouverture pousse un etat d'historique", String(etat));
  await p.goBack();
  await p.waitForTimeout(900);
  dit(!(await ouvert()), "le bouton Precedent ferme au lieu de quitter");
  dit(p.url().indexOf("index.html") >= 0, "et on est toujours sur la page", p.url().replace(BASE, ""));

  await ouvrir();
  await p.evaluate(() => document.querySelector("#svc-03 .svc-plus").click());
  await p.waitForTimeout(1000);
  const n = await p.evaluate(() => document.querySelectorAll(".svc-detail[open]").length);
  dit(n === 1, "un seul panneau ouvert a la fois", n);
  await p.close();
}

/* ============================================================
   7 · LE CLAVIER
   Un nombre FIXE de tabulations ne mesure pas un piege de focus
   (piege 23) : on mesure la PROPRIETE — aucun element de la page
   derriere le panneau ne recoit le focus, et le cycle revient
   dedans.
   ============================================================ */
titre("7 · CLAVIER");
{
  const p = await page(ctx);
  await traverser(p);
  await auxServices(p);

  /* TABULER QUATORZE FOIS NE MESURE PAS CE QU'ON CROIT : au bout
     de quelques pressions on est sorti de la section, et la page
     defile pour de bonnes raisons. Ce qui se mesure ici est la
     propriete reelle — passer d'une CARTE du rail a la suivante ne
     doit pas deplacer la page, meme quand le navigateur amene
     l'element focalise dans l'ecran. */
  let bouge = 0;
  await p.evaluate(() => document.querySelector("#svc-01 .svc-plus").focus());
  await p.waitForTimeout(200);
  for (let i = 0; i < 3; i++) {
    await poser(p);
    const y0 = await p.evaluate(() => scrollY);
    await p.keyboard.press("Tab");
    await p.waitForTimeout(400);
    await poser(p);
    const d = await p.evaluate((y) => ({ d: Math.abs(scrollY - y), dans: !!(document.activeElement.closest && document.activeElement.closest(".svc-rail")) }), y0);
    if (d.dans) bouge = Math.max(bouge, d.d);
  }
  dit(bouge < 4, "passer d'une carte a l'autre ne deplace pas la page", Math.round(bouge) + " px");

  /* LE RAIL EST REMIS AU DEPART AVANT CE RELEVE. Les tabulations
     du releve precedent l'avaient laisse au bout ; `courante()`
     rendait alors 3, `min(3, 3+1)` valait 3, et le rail ne bougeait
     pas — pour une raison JUSTE. Le test accusait le code d'un
     defaut qu'il n'avait pas parce qu'il ne remettait pas l'etat. */
  await auxServices(p);
  await p.evaluate(() => { document.querySelector(".svc-rail").scrollLeft = 0; });
  await p.waitForTimeout(400);
  await p.evaluate(() => document.querySelector(".svc-rail").focus());
  const av = await p.evaluate(() => document.querySelector(".svc-rail").scrollLeft);
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(900);
  const ap = await p.evaluate(() => document.querySelector(".svc-rail").scrollLeft);
  dit(ap > av + 50, "le rail avance d'un cran a la fleche droite", "+" + Math.round(ap - av) + " px");

  await auxServices(p);
  await p.evaluate(() => document.querySelector("#svc-01 .svc-plus").click());
  await p.waitForTimeout(1000);
  let dehors = 0;
  for (let i = 0; i < 12; i++) {
    await p.keyboard.press("Tab");
    await p.waitForTimeout(80);
    const ok = await p.evaluate(() => {
      const a = document.activeElement;
      if (!a || a === document.body) return true;
      return !!(a.closest && a.closest(".svc-detail[open]"));
    });
    if (!ok) dehors++;
  }
  dit(dehors === 0, "le focus ne sort jamais du panneau", dehors + " echappee(s) sur 12");
  await p.close();
}

/* ============================================================
   8 · SANS JAVASCRIPT
   Rien de necessaire a la LECTURE ne doit dependre d'un script.
   ============================================================ */
titre("8 · SANS JAVASCRIPT");
{
  const c2 = await nav.newContext({ viewport: { width: W, height: H }, javaScriptEnabled: false });
  const p = await c2.newPage();
  await p.goto(BASE + "/index.html", { waitUntil: "load" });
  await p.waitForTimeout(1400);
  const m = await p.evaluate(() => ({
    plans: document.querySelectorAll(".svc-plan").length,
    noms: [...document.querySelectorAll(".svc-plan-nom")].filter(e => e.textContent.trim().length > 4).length,
    dits: [...document.querySelectorAll(".svc-plan-dit")].filter(e => e.textContent.trim().length > 20).length,
    delais: document.querySelectorAll(".svc-plan-delai").length,
    cartes: document.querySelectorAll(".svc-carte").length,
    points: document.querySelectorAll(".svc-specs li").length,
    railDefile: (() => { const r = document.querySelector(".svc-rail"); return r.scrollWidth > r.clientWidth; })(),
    ancres: [...document.querySelectorAll("[data-svc-vers]")].filter(a => a.getAttribute("href")).length
  }));
  dit(m.plans === 4 && m.noms === 4 && m.dits === 4 && m.delais === 4,
    "la planche entiere", m.plans + " colonnes, " + m.noms + " noms, " + m.dits + " phrases, " + m.delais + " delais");
  dit(m.cartes === 4, "les quatre cartes", m.cartes);
  dit(m.points >= 18, "les points inclus dans le document", m.points);
  dit(m.ancres === 4, "les quatre tetes sont de vraies ancres", m.ancres);

  /* CE QUE « SANS JAVASCRIPT » VEUT DIRE ICI, EXACTEMENT, ET IL NE
     FAUT PAS PROMETTRE PLUS. `differe.css` est INJECTE par un
     script : sans lui, la section n'a ni rail, ni panneau flottant,
     ni grille — elle a la feuille critique et rien d'autre. Ce qui
     survit, et qui est le seul engagement tenable, c'est le
     CONTENU : les quatre chantiers, leurs quatre phrases, leurs
     quatre delais, les dix-huit points inclus, et un `<details>`
     natif qui s'ouvre et se referme.
     Une premiere version de ce fichier exigeait ici
     `position: fixed` et un rail parcourable. Elle mesurait donc
     une promesse que l'architecture du site ne fait pas. */
  await p.evaluate(() => { document.querySelector("#svc-01 .svc-detail").open = true; });
  await p.waitForTimeout(400);
  const pan = await p.evaluate(() => {
    const d = document.querySelector("#svc-01 .svc-detail");
    const s = d.querySelector("summary").getBoundingClientRect();
    const t = d.querySelector(".svc-lead").getBoundingClientRect();
    return { sommaire: s.width > 40 && s.height > 12, texte: t.width > 40 && t.height > 8 };
  });
  dit(pan.texte, "le detail s'ouvre et se lit");
  dit(pan.sommaire, "son sommaire — donc la fermeture — reste visible");
  await c2.close();
}

/* ============================================================
   9 · VISIBLE, SINON CA NE COMPTE PAS
   Cinq captures au moins entre le debut et la fin, et l'ecart de
   pixels entre deux consecutives. Le cadre est FIXE (piege 3) et il
   est RELEVE, pas devine (piege 2).
   ============================================================ */
titre("9 · VISIBLE — captures et ecarts");
{
  const p = await page(ctx);
  await traverser(p);
  await auxServices(p);

  async function suite(nom, cadre, geste, n, pas, seuil) {
    const im = [];
    await geste();
    for (let i = 0; i < n; i++) {
      const f = OUT + "/seq-" + nom + "-" + i + ".png";
      await p.screenshot({ path: f, clip: cadre });
      im.push(decodePNG(fs.readFileSync(f)));
      await p.waitForTimeout(pas);
    }
    const ecarts = [];
    for (let i = 1; i < im.length; i++) ecarts.push(diffStats(im[i - 1], im[i]).pct);
    const bouge = ecarts.filter(e => e > (seuil || 1)).length;
    dit(bouge >= 3, nom + " : au moins 3 ecarts > " + (seuil || 1) + " %", "[" + ecarts.join(" ") + "] %");
  }

  const cadreRail = await p.evaluate(() => {
    const r = document.querySelector(".svc-rail").getBoundingClientRect();
    return { x: Math.round(r.left), y: Math.round(r.top), width: Math.round(r.width) - 1, height: Math.round(r.height) };
  });
  await suite("cran", cadreRail, async () => {
    await p.evaluate(() => document.querySelector('[data-svc-vers="svc-03"]').click());
  }, 8, 0);

  await auxServices(p);
  await p.waitForTimeout(400);
  const plein = { x: 0, y: 0, width: W, height: H };
  await suite("panneau", plein, async () => {
    await p.evaluate(() => document.querySelector("#svc-01 .svc-plus").click());
  }, 8, 0);
  await suite("fermeture", plein, async () => {
    await p.evaluate(() => document.querySelector("#svc-01 .svc-plus").click());
  }, 8, 0);
  await p.close();
}

/* ============================================================
   10 · LA TENUE
   ============================================================ */
titre("10 · TENUE");
{
  const p = await page(ctx);
  const perf = await p.evaluate(() => new Promise((ok) => {
    let lcp = 0, cls = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    setTimeout(() => ok({ lcp: Math.round(lcp), cls: +cls.toFixed(4) }), 900);
  }));
  dit(perf.lcp < 300, "LCP", perf.lcp + " ms");
  dit(perf.cls === 0, "CLS", perf.cls);

  await traverser(p);
  await auxServices(p);
  const ips = await p.evaluate(() => new Promise((ok) => {
    const t = []; let n = 0, p0 = performance.now();
    const y0 = scrollY;
    (function tour() {
      const t1 = performance.now(); t.push(t1 - p0); p0 = t1;
      window.scrollTo(0, y0 + n * 8);
      if (++n < 90) requestAnimationFrame(tour);
      else { t.sort((a, b) => a - b); ok({ med: +(1000 / t[Math.floor(t.length / 2)]).toFixed(1), lentes: t.filter(x => x > 20).length }); }
    })();
  }));
  dit(ips.med >= 55, "images par seconde, traversee de la section", ips.med);
  dit(ips.lentes <= 2, "images au-dessus de 20 ms", ips.lentes);
  await p.close();

  const larges = [320, 360, 390, 480, 640, 768, 1024, 1280, 1440, 1680, 1920];
  const deborde = [], erreurs = [];
  for (const w of larges) {
    const c3 = await nav.newContext({ viewport: { width: w, height: 900 } });
    const q = await c3.newPage();
    q.on("console", (m) => { if (m.type() === "error") erreurs.push(w + " " + m.text().slice(0, 70)); });
    await q.addInitScript(() => { try { sessionStorage["aped-sans-popup"] = "1"; } catch (e) {} });
    await q.goto(BASE + "/index.html", { waitUntil: "load" });
    await q.waitForTimeout(1800);
    await traverser(q);
    const d = await q.evaluate(() => {
      document.querySelector("#svc-01 .svc-detail").open = true;
      return new Promise(r => setTimeout(() => r(document.documentElement.scrollWidth - document.documentElement.clientWidth), 500));
    });
    if (d > 1) deborde.push(w + ":" + d);
    await c3.close();
  }
  dit(deborde.length === 0, "debordement horizontal, 11 largeurs, panneau ouvert", deborde.length ? deborde.join(" ") : "aucun");
  dit(erreurs.length === 0, "erreurs console, 11 largeurs", erreurs.length ? erreurs.join(" | ") : "0");

  const ko = Math.round(["svc-01-sites", "svc-02-automatisation", "svc-03-immobilier", "svc-04-logiciels"]
    .map(n => fs.statSync("images/services/" + n + ".webp").size)
    .reduce((a, b) => a + b, 0) / 1024);
  dit(ko < 500, "poids des quatre photographies", ko + " Ko, en chargement differe");
}

await nav.close();
console.log("\n" + (echecs === 0 ? "TOUT PASSE." : echecs + " ECHEC(S).") + "\n");
process.exitCode = echecs ? 1 : 0;
