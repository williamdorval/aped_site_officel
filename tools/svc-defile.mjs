/* ============================================================
   SVC-DEFILE — la section 02 en sept relevés.

   node tools/svc-defile.mjs [adresse] [largeur] [clair|sombre]

   1 · GEOMETRIE   la piste, la scene, la course, le pas — et la
                   section tient-elle la promesse « on traverse sans
                   lutter » (combien d'ecrans ?)
   2 · SEQUENCE    dix captures d'un cadre FIXE le long de la course,
                   avec l'ecart de pixels entre deux consecutives.
                   « Visible, sinon ca ne compte pas. »
   3 · ORIENTATION a chaque pas : quel chantier est marque courant,
                   ce que dit `aria-current`, ou en est la jauge
   4 · RECHARGE    dix rechargements sur `#services` et dix arrivees
                   par ancre : la scene saute-t-elle ?
   5 · CLAVIER     l'index est-il atteignable, les fleches
                   deplacent-elles vraiment, la vitre reste-t-elle a
                   zero
   6 · SANS SCRIPT les quatre chantiers sont-ils lisibles
   7 · TENUE       i/s pendant la traversee, images > 20 ms
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { decodePNG, diffStats } from "./_png.mjs";
const lirePNG = (f) => decodePNG(fs.readFileSync(f));

const BASE = process.argv[2] || "http://127.0.0.1:8099";
const W = parseInt(process.argv[3] || "1440", 10);
const THEME = process.argv[4] || "clair";
const SORTIE = path.resolve("tools/_svc-defile");
fs.mkdirSync(SORTIE, { recursive: true });

const nav = await chromium.launch();

async function page(ctxOpts = {}) {
  const ctx = await nav.newContext({ viewport: { width: W, height: 900 }, deviceScaleFactor: 1, ...ctxOpts });
  await ctx.addInitScript((t) => {
    try {
      sessionStorage.setItem("adexweb-sans-popup", "1");
      localStorage.setItem("adexweb-theme", t === "sombre" ? "dark" : "light");
    } catch (e) {}
  }, THEME);
  const p = await ctx.newPage();
  const erreurs = [];
  p.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
  p.on("pageerror", (e) => erreurs.push(String(e)));
  p._erreurs = erreurs;
  return p;
}

/* Defiler PAR PAS, jamais en sautant : un saut ne laisse pas au
   navigateur le temps de recalculer un `position: sticky`, et la
   sonde photographie alors un etat qui n'existe pas pour un
   visiteur. */
async function defilerVers(p, y) {
  await p.evaluate(async (cible) => {
    const pas = 120;
    while (Math.abs(window.scrollY - cible) > 2) {
      const d = cible - window.scrollY;
      window.scrollBy(0, Math.sign(d) * Math.min(pas, Math.abs(d)));
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (Math.abs(window.scrollY - cible) <= 2) break;
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1 && d > 0) break;
    }
  }, y);
  await p.waitForTimeout(90);
}

const R = {};

/* ============ 1 · GEOMETRIE ============ */
{
  const p = await page();
  await p.goto(BASE + "/index.html", { waitUntil: "load" });
  await p.waitForTimeout(2600);
  /* `content-visibility: auto` fait mentir les rectangles hors
     ecran : on traverse la page entiere avant de mesurer. */
  await p.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(r));
    }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(300);

  R.geo = await p.evaluate(() => {
    const piste = document.querySelector("[data-svc-piste]");
    const scene = document.querySelector("[data-svc-scene]");
    const rail = document.querySelector("[data-svc-rail]");
    const sect = document.querySelector("#services");
    const plans = [...document.querySelectorAll(".svc-plan")];
    const st = getComputedStyle(scene);
    return {
      actif: st.position === "sticky",
      collant: parseFloat(st.top) || 0,
      pisteH: piste.offsetHeight,
      sceneH: scene.offsetHeight,
      course: piste.offsetHeight - scene.offsetHeight,
      pas: plans.length > 1 ? plans[1].offsetLeft - plans[0].offsetLeft : 0,
      largPlan: Math.round(plans[0].getBoundingClientRect().width),
      sectionH: Math.round(sect.getBoundingClientRect().height),
      ecrans: +(sect.getBoundingClientRect().height / window.innerHeight).toFixed(2),
      degage: rail.hasAttribute("data-degage"),
      docLarg: document.documentElement.scrollWidth,
      fenetre: window.innerWidth
    };
  });
  await p.context().close();
}

/* ============ 2+3 · SEQUENCE ET ORIENTATION ============ */
{
  const p = await page();
  await p.goto(BASE + "/index.html", { waitUntil: "load" });
  await p.waitForTimeout(2600);
  await p.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(r));
    }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(300);

  /* LE CADRE SE RELEVE, IL NE SE DEVINE PAS — piege 2. On demande a
     la page ou se trouve la scene, une fois collee. */
  const dep = await p.evaluate(() => {
    const piste = document.querySelector("[data-svc-piste]");
    const scene = document.querySelector("[data-svc-scene]");
    const st = getComputedStyle(scene);
    const collant = parseFloat(st.top) || 0;
    return {
      depart: Math.round(window.scrollY + piste.getBoundingClientRect().top - collant),
      course: piste.offsetHeight - scene.offsetHeight,
      collant
    };
  });

  const N = 10;
  const cadre = { x: 0, y: dep.collant, width: W, height: Math.min(760, 900 - dep.collant) };
  const pas = [];
  let precedent = null;
  for (let i = 0; i < N; i++) {
    const y = dep.depart + Math.round((i / (N - 1)) * dep.course);
    await defilerVers(p, y);
    const etat = await p.evaluate(() => {
      const rail = document.querySelector("[data-svc-rail]");
      const jauge = document.querySelector("[data-svc-jauge]");
      const vitre = rail.parentNode;
      const actif = document.querySelector(".svc-plan[data-actif]");
      const cur = document.querySelector('.svc-index a[aria-current="true"]');
      /* LE MOUVEMENT EST PORTE PAR `scrollLeft` DE LA VITRE DEPUIS
         LE 2026-07-30, plus par un `transform` sur le rail — un
         ancetre transforme devenait le bloc conteneur du panneau
         `position: fixed`. On releve donc les DEUX : `x` doit
         rester a zero, et c'est `vitre` qui bouge. Garder l'ancien
         releve est ce qui empeche ce test de passer en ne mesurant
         plus rien. */
      const m = new DOMMatrixReadOnly(getComputedStyle(rail).transform);
      /* La jauge `[data-svc-jauge]` a quitte le document lors de la
         seconde refonte des Services : l'outil DIT qu'elle est
         absente au lieu de crasher — un crash sur cible disparue est
         le cousin bruyant du piege 17. */
      const mj = jauge ? new DOMMatrixReadOnly(getComputedStyle(jauge).transform) : null;
      const vus = [...document.querySelectorAll(".svc-plan[data-vu]")].length;
      return {
        scrollY: Math.round(window.scrollY),
        x: Math.round(m.m41),
        jauge: mj ? +mj.a.toFixed(3) : "absente",
        actif: actif ? actif.id : null,
        ariaCurrent: cur ? cur.textContent.replace(/\s+/g, " ").trim() : null,
        vitreLeft: vitre.scrollLeft,
        vus
      };
    });
    const f = path.join(SORTIE, `seq-${String(i).padStart(2, "0")}.png`);
    await p.screenshot({ path: f, clip: cadre });
    let ecart = null;
    if (precedent) {
      try { ecart = +diffStats(lirePNG(precedent), lirePNG(f)).pct.toFixed(2); } catch (e) { ecart = "?"; }
    }
    precedent = f;
    pas.push({ i, ...etat, ecartPct: ecart });
  }
  R.sequence = pas;
  R.cadre = cadre;
  R.erreurs = p._erreurs.slice(0, 6);
  await p.context().close();
}

/* ============ 4 · RECHARGE ET ANCRE ============ */
{
  const sauts = [];
  for (let k = 0; k < 10; k++) {
    const p = await page();
    await p.goto(BASE + "/index.html#services", { waitUntil: "load" });
    await p.waitForTimeout(2400);
    /* Deux relevés a 400 ms d'intervalle : un saut de mise en page
       se produit APRES le premier rendu, sinon il n'y a rien a
       voir. C'est exactement la fenetre ou le pin se teleportait. */
    const a = await p.evaluate(() => {
      const s = document.querySelector("[data-svc-scene]");
      const r = document.querySelector("[data-svc-rail]");
      const v = r.parentNode;
      const m = new DOMMatrixReadOnly(getComputedStyle(r).transform);
      return { y: Math.round(window.scrollY), top: Math.round(s.getBoundingClientRect().top), x: Math.round(m.m41), vitre: v.scrollLeft };
    });
    await p.waitForTimeout(500);
    const b = await p.evaluate(() => {
      const s = document.querySelector("[data-svc-scene]");
      const r = document.querySelector("[data-svc-rail]");
      const v = r.parentNode;
      const m = new DOMMatrixReadOnly(getComputedStyle(r).transform);
      const actif = document.querySelector(".svc-plan[data-actif]");
      return { y: Math.round(window.scrollY), top: Math.round(s.getBoundingClientRect().top), x: Math.round(m.m41), vitre: v.scrollLeft, actif: actif ? actif.id : null };
    });
    sauts.push({ k, sautScene: b.top - a.top, sautRail: b.x - a.x, vitre: b.vitre, actif: b.actif, y: b.y });
    await p.context().close();
  }
  R.recharge = sauts;

  /* Arrivee par ancre sur un chantier precis, dix fois. */
  const ancres = [];
  for (let k = 0; k < 10; k++) {
    const p = await page();
    await p.goto(BASE + "/index.html#svc-03", { waitUntil: "load" });
    await p.waitForTimeout(2400);
    const a = await p.evaluate(() => {
      const s = document.querySelector("[data-svc-scene]");
      return Math.round(s.getBoundingClientRect().top);
    });
    await p.waitForTimeout(500);
    const b = await p.evaluate(() => {
      const s = document.querySelector("[data-svc-scene]");
      const r = document.querySelector("[data-svc-rail]");
      const actif = document.querySelector(".svc-plan[data-actif]");
      return { top: Math.round(s.getBoundingClientRect().top), vitre: r.parentNode.scrollLeft, actif: actif ? actif.id : null };
    });
    ancres.push({ k, saut: b.top - a, vitre: b.vitre, actif: b.actif });
    await p.context().close();
  }
  R.ancre = ancres;
}

/* ============ 5 · CLAVIER ============ */
{
  const p = await page();
  await p.goto(BASE + "/index.html#svc-01", { waitUntil: "load" });
  await p.waitForTimeout(2600);
  /* `.svc-index` et la navigation aux fleches ont quitte le document
     avec la refonte « cinq services » du 2026-07-31 matin. Une cible
     disparue se DIT — elle ne se crashe pas, elle ne se tait pas. */
  const indexExiste = await p.evaluate(() => !!document.querySelector('.svc-index a[href="#svc-01"]'));
  if (!indexExiste) {
    R.clavier = { note: "CIBLE DISPARUE — .svc-index retire le 2026-07-31 (bb63a36), la navigation aux fleches n'existe plus ; le clavier passe par les liens .svc-plus" };
  } else {
  const av = await p.evaluate(() => window.scrollY);
  await p.evaluate(() => { document.querySelector('.svc-index a[href="#svc-01"]').focus(); });
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(900);
  const ap = await p.evaluate(() => {
    const actif = document.querySelector(".svc-plan[data-actif]");
    const r = document.querySelector("[data-svc-rail]");
    return { y: window.scrollY, actif: actif ? actif.id : null, vitre: r.parentNode.scrollLeft, focus: document.activeElement.getAttribute("href") };
  });
  /* Le bouton « Voir en detail » du chantier 04 est hors cadre : le
     focaliser doit amener la PAGE, jamais faire glisser la vitre. */
  await p.evaluate(() => {
    const b = document.querySelectorAll("#svc-04 summary")[0];
    if (b) b.focus();
  });
  await p.waitForTimeout(600);
  const foc = await p.evaluate(() => {
    const r = document.querySelector("[data-svc-rail]");
    const actif = document.querySelector(".svc-plan[data-actif]");
    const s = document.querySelector("#svc-04 summary").getBoundingClientRect();
    const v = r.parentNode.getBoundingClientRect();
    return { vitre: r.parentNode.scrollLeft, actif: actif ? actif.id : null, dansLaVitre: s.left >= v.left - 2 && s.right <= v.right + 2 };
  });
  R.clavier = { avant: Math.round(av), apresFleche: { ...ap, y: Math.round(ap.y) }, focus04: foc };
  }
  await p.context().close();
}

/* ============ 6 · SANS SCRIPT ============ */
{
  const ctx = await nav.newContext({ viewport: { width: W, height: 900 }, javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto(BASE + "/index.html", { waitUntil: "load" });
  await p.waitForTimeout(600);
  R.sansScript = await p.evaluate(() => {
    const plans = [...document.querySelectorAll(".svc-plan")];
    const vis = plans.filter((e) => e.getBoundingClientRect().height > 40).length;
    return {
      chantiers: plans.length,
      visibles: vis,
      noms: [...document.querySelectorAll(".svc-plan-nom")].map((h) => h.textContent.trim()),
      points: document.querySelectorAll(".svc-specs li").length,
      recus: document.querySelectorAll(".svc-recu li").length,
      scenesCollantes: [...document.querySelectorAll("[data-svc-scene]")].filter((e) => getComputedStyle(e).position === "sticky").length
    };
  });
  await ctx.close();
}

/* ============ 7 · TENUE ============ */
{
  const p = await page();
  await p.goto(BASE + "/index.html", { waitUntil: "load" });
  await p.waitForTimeout(2600);
  const cible = await p.evaluate(() => {
    const piste = document.querySelector("[data-svc-piste]");
    return Math.round(window.scrollY + piste.getBoundingClientRect().top - 200);
  });
  await defilerVers(p, cible);
  R.tenue = await p.evaluate(async () => {
    const t = [];
    let dernier = performance.now();
    let fini = false;
    function tour(n) {
      t.push(n - dernier); dernier = n;
      if (!fini) requestAnimationFrame(tour);
    }
    requestAnimationFrame(tour);
    const debut = window.scrollY;
    const fin = debut + 2400;
    while (window.scrollY < fin) {
      window.scrollBy(0, 26);
      await new Promise((r) => requestAnimationFrame(r));
    }
    fini = true;
    await new Promise((r) => setTimeout(r, 60));
    const v = t.slice(3).sort((a, b) => a - b);
    return {
      images: v.length,
      medianeMs: +v[Math.floor(v.length / 2)].toFixed(2),
      ips: +(1000 / v[Math.floor(v.length / 2)]).toFixed(1),
      plusDe20ms: v.filter((x) => x > 20).length
    };
  });
  await p.context().close();
}

await nav.close();

/* ============ RAPPORT ============ */
const l = console.log;
l(`\n================  SERVICES · ${W} px · ${THEME}  ================\n`);
l("1 · GEOMETRIE");
l("   rail actif ............ " + R.geo.actif + "   voile des noms rendu : " + R.geo.degage);
l("   piste ................. " + R.geo.pisteH + " px");
l("   scene ................. " + R.geo.sceneH + " px   (collant a " + R.geo.collant + ")");
l("   course ................ " + R.geo.course + " px");
l("   pas horizontal ........ " + R.geo.pas + " px   (chantier large de " + R.geo.largPlan + ")");
l("   section entiere ....... " + R.geo.sectionH + " px = " + R.geo.ecrans + " ecrans");
l("   debordement du document " + (R.geo.docLarg > R.geo.fenetre ? "OUI  " + R.geo.docLarg + " > " + R.geo.fenetre : "aucun"));

l("\n2+3 · SEQUENCE ET ORIENTATION   (cadre fixe releve dans la page)");
l("   #   scrollY  transf   jauge   actif    aria-current                 scrollLeft  vus  ecart px");
for (const s of R.sequence) {
  l("  " + String(s.i).padStart(2) + "  " + String(s.scrollY).padStart(7) + "  " +
    String(s.x).padStart(6) + "  " + String(s.jauge).padStart(5) + "   " +
    String(s.actif || "-").padEnd(8) + " " + String(s.ariaCurrent || "-").padEnd(32) +
    String(s.vitreLeft).padStart(4) + "  " + String(s.vus).padStart(3) + "  " +
    (s.ecartPct === null ? "   -" : String(s.ecartPct).padStart(6) + " %"));
}
const ec = R.sequence.map((s) => s.ecartPct).filter((x) => typeof x === "number");
l("   ecart de pixels : min " + Math.min(...ec) + " %  max " + Math.max(...ec) + " %   " +
  (Math.min(...ec) > 1 ? "-> VISIBLE" : "-> AU MOINS UNE ETAPE INVISIBLE"));

l("\n4 · RECHARGEMENT SUR #services, dix fois");
l("   #  saut scene  saut rail  vitre  actif");
for (const s of R.recharge) l("  " + String(s.k).padStart(2) + "  " + String(s.sautScene).padStart(10) + "  " + String(s.sautRail).padStart(9) + "  " + String(s.vitre).padStart(5) + "  " + s.actif);
l("   saut de scene maximal : " + Math.max(...R.recharge.map((s) => Math.abs(s.sautScene))) + " px");
l("   transformations residuelles sur le rail : " + R.sequence.filter((s) => s.x !== 0).length + " / 10   (doit etre 0)");

l("\n   ARRIVEE PAR ANCRE #svc-03, dix fois");
l("   #  saut  vitre  actif");
for (const s of R.ancre) l("  " + String(s.k).padStart(2) + "  " + String(s.saut).padStart(4) + "  " + String(s.vitre).padStart(5) + "  " + s.actif);
l("   saut maximal : " + Math.max(...R.ancre.map((s) => Math.abs(s.saut))) + " px" +
  "   |  chantier vise atteint : " + R.ancre.filter((s) => s.actif === "svc-03").length + " / 10");

l("\n5 · CLAVIER");
if (R.clavier.note) {
  l("   " + R.clavier.note);
} else {
  l("   fleche droite depuis l'index : scrollY " + R.clavier.avant + " -> " + R.clavier.apresFleche.y +
    "   actif " + R.clavier.apresFleche.actif + "   vitre " + R.clavier.apresFleche.vitre);
  l("   focus sur « Voir en detail » du 04 : actif " + R.clavier.focus04.actif +
    "   vitre " + R.clavier.focus04.vitre + "   bouton dans la vitre : " + R.clavier.focus04.dansLaVitre);
}

l("\n6 · SANS JAVASCRIPT");
l("   chantiers dans le document ... " + R.sansScript.chantiers);
l("   chantiers VISIBLES ........... " + R.sansScript.visibles);
l("   scenes collantes ............. " + R.sansScript.scenesCollantes + "   (doit etre 0)");
l("   points « compris » ........... " + R.sansScript.points);
l("   points « ce que vous recevez » " + R.sansScript.recus);
l("   noms : " + R.sansScript.noms.join(" · "));

l("\n7 · TENUE PENDANT LA TRAVERSEE");
l("   i/s mediane .......... " + R.tenue.ips + "   (" + R.tenue.medianeMs + " ms)");
l("   images > 20 ms ....... " + R.tenue.plusDe20ms + " / " + R.tenue.images);

l("\nERREURS CONSOLE : " + (R.erreurs.length ? R.erreurs.join(" | ") : "aucune"));
l("\nCaptures : " + SORTIE + "\n");
fs.writeFileSync(path.join(SORTIE, `rapport-${W}-${THEME}.json`), JSON.stringify(R, null, 2));
