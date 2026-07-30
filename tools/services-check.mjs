/* ============================================================
   SECTION 02 · SERVICES — preuve
   `node tools/services-check.mjs [adresse] [largeur]`

   CE FICHIER A ETE REECRIT EN ENTIER LE 2026-07-30, et la raison
   est le piege 17 de `CLAUDE.md` : « quand on corrige un defaut,
   lire le test qui le couvrait — s'il passe encore sans
   modification, c'est lui le probleme. »

   L'ancienne version passait pendant que la section etait cassee.
   Trois raisons, toutes des pieges deja ecrits :
   · elle defilait en SAUTS (`window.scrollTo`), donc elle cassait
     elle-meme le pin qu'elle etait censee eprouver (piege 5) ;
   · elle ne chargeait JAMAIS la page par `#services`, le seul
     chemin d'arrivee ou le defaut existait ;
   · elle ne demandait jamais si quelque chose etait peint
     par-dessus : elle verifiait que le compteur, le nom et la jauge
     disaient la verite pendant que la mise en page etait cassee
     derriere eux.
   Elle posait aussi `sessionStorage["aped-entree-saut"]`, un drapeau
   supprime du site — une ligne qui ne faisait plus rien.

   LES DIX RELEVES, un par promesse du chantier :
   1. DECOUVRABILITE — les quatre chantiers sont lisibles SANS un
      seul clic, et sans script.
   2. RIEN PAR-DESSUS — traversee pas a pas depuis 0, occultation
      reelle par `elementFromPoint`.
   3. RECHARGEMENT sur `#services`, dix fois : aucun saut.
   4. ARRIVEE PAR ANCRE depuis une autre section.
   5. OUVERTURE / FERMETURE — la carte cliquee ne bouge pas, les
      voisines glissent, rien n'est coupe, plusieurs peuvent etre
      ouvertes.
   6. LA VISITE 360 se lance depuis la carte 03.
   7. CLAVIER — index, resumes, boutons ; ouverture a Entree.
   8. SANS JAVASCRIPT — tout le contenu reste atteignable.
   9. DEBORDEMENT et erreurs console.
   10. IMAGES — chargees, dimensionnees, et etiquetees.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const BASE = (process.argv[2] || "http://127.0.0.1:8099").replace(/\/$/, "") + "/";
const LARGEUR = Number(process.argv[3] || 1440);
const SORTIE = path.join(RACINE, "refonte-captures", "services");
fs.mkdirSync(SORTIE, { recursive: true });

const nav = await chromium.launch();
const rapport = { adresse: BASE, largeur: LARGEUR };
const erreurs = [];

async function page(opts) {
  const ctx = await nav.newContext(Object.assign({ viewport: { width: LARGEUR, height: 900 }, colorScheme: "light" }, opts || {}));
  const p = await ctx.newPage();
  p.on("pageerror", (e) => erreurs.push("pageerror: " + String(e)));
  p.on("console", (m) => { if (m.type() === "error") erreurs.push("console: " + m.text()); });
  /* Piege 18 : un `<dialog>` ouvert capture tous les evenements de
     pointeur et fait expirer n'importe quel clic. */
  await p.addInitScript(() => { try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  return { ctx, p };
}
/* Descendre PAR PAS, comme un visiteur. Un saut ne prouve rien. */
async function descendre(p, cible, pas = 60) {
  const d = await p.evaluate(() => window.scrollY);
  const n = Math.max(1, Math.ceil(Math.abs(cible - d) / pas));
  for (let i = 1; i <= n; i++) {
    await p.evaluate((v) => window.scrollTo(0, v), d + (cible - d) * (i / n));
    await p.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
  }
  await p.waitForTimeout(120);
}
const pret = (p) => p.waitForTimeout(2200);

/* ---------- 1 · DECOUVRABILITE ---------- */
{
  const { ctx, p } = await page();
  await p.goto(BASE, { waitUntil: "load" });
  await pret(p);
  rapport["1_decouvrabilite"] = await p.evaluate(() => {
    const cartes = [...document.querySelectorAll(".svc-carte")];
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && getComputedStyle(e).visibility !== "hidden"; };
    return {
      chantiers: cartes.length,
      /* LE RELEVE QUI DECIDE : combien de noms de chantier sont
         LISIBLES sans qu'on touche a quoi que ce soit. L'ancienne
         section en montrait UN — les trois autres etaient derriere
         une fleche que, selon Runyon, ~1 % des visiteurs touchent. */
      nomsLisiblesSansClic: cartes.filter((c) => { const t = c.querySelector(".svc-corps .label"); return t && vis(t) && t.textContent.trim().length > 3; }).length,
      beneficesLisiblesSansClic: cartes.filter((c) => { const h = c.querySelector("h3"); return h && vis(h); }).length,
      delaisLisiblesSansClic: cartes.filter((c) => { const b = c.querySelector(".svc-pied b"); return b && vis(b); }).length,
      indexNomme: [...document.querySelectorAll(".svc-index a")].map((a) => a.textContent.replace(/\s+/g, " ").trim()),
      reserveDelais: (document.querySelector(".svc-reserve") || {}).textContent || null,
      /* Aucun `<details>` ouvert au depart : la vue d'ensemble est
         l'etat de repos. */
      fichesOuvertesAuDepart: document.querySelectorAll(".svc-detail[open]").length,
      /* Le compteur, la piste et le rail ne doivent plus exister. */
      restesDuCarrousel: ["svcPiste", "svcRail", "svcNum", "svcNow", "svcJauge"].filter((i) => document.getElementById(i)),
      apiRailEncorePresente: typeof window.APED_SVC !== "undefined"
    };
  });
  await ctx.close();
}

/* ---------- 2 · RIEN PAR-DESSUS ---------- */
{
  const { ctx, p } = await page();
  await p.goto(BASE, { waitUntil: "load" });
  await pret(p);
  const SONDE = () => {
    const svc = document.getElementById("svc");
    const services = document.getElementById("services");
    const pts = [];
    const viser = (nom, el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.bottom < 0 || r.top > innerHeight) return;
      const n = document.elementFromPoint(Math.min(innerWidth - 2, r.x + r.width / 2), Math.min(innerHeight - 2, Math.max(2, r.y + r.height / 2)));
      if (!n) return;
      pts.push({ nom, hero: !!n.closest("#top"), plaque: !!n.closest(".plaque"), dedans: !!n.closest("#services") });
    };
    viser("seuil", services && services.querySelector(".seuil-nom"));
    viser("titre", services && services.querySelector(".head h2"));
    viser("index", document.querySelector(".svc-index a"));
    [...document.querySelectorAll(".svc-carte h3")].forEach((h, i) => viser("titre-carte-" + (i + 1), h));
    const rs = svc.getBoundingClientRect(), rt = document.getElementById("top").getBoundingClientRect();
    return {
      y: Math.round(scrollY),
      bandePartagee: Math.max(0, Math.round(Math.min(rs.bottom, rt.bottom) - Math.max(rs.top, rt.top))),
      occulteParHero: pts.filter((x) => x.hero || x.plaque).length,
      svcPosition: getComputedStyle(svc).position,
      svcY: Math.round(rs.y)
    };
  };
  const suite = [];
  let sautMax = 0;
  const fin = await p.evaluate(() => document.getElementById("services").getBoundingClientRect().bottom + scrollY);
  for (let y = 0; y <= fin; y += 60) {
    await descendre(p, y);
    const s = await p.evaluate(SONDE);
    const prec = suite[suite.length - 1];
    if (prec) {
      const attendu = prec.svcY - (s.y - prec.y);
      sautMax = Math.max(sautMax, Math.round(Math.abs(s.svcY - attendu)));
    }
    suite.push(s);
  }
  rapport["2_rien_par_dessus"] = {
    releves: suite.length,
    relevesAvecOccultation: suite.filter((s) => s.occulteParHero > 0).length,
    bandePartageeMaxPx: Math.max(...suite.map((s) => s.bandePartagee)),
    sautDeLaSceneMaxPx: sautMax,
    positionsRencontrees: [...new Set(suite.map((s) => s.svcPosition))]
  };
  await ctx.close();
}

/* ---------- 3 · RECHARGEMENT sur #services, DIX FOIS ---------- */
{
  const { ctx, p } = await page();
  const passes = [];
  for (let k = 0; k < 10; k++) {
    await p.goto(BASE + "#services", { waitUntil: "load" });
    await pret(p);
    const depart = await p.evaluate(() => window.scrollY);
    let sautMax = 0, prec = null;
    for (let y = depart; y <= depart + 900; y += 60) {
      await descendre(p, y);
      const s = await p.evaluate(() => {
        const svc = document.getElementById("svc");
        return { y: Math.round(scrollY), svcY: Math.round(svc.getBoundingClientRect().y), pos: getComputedStyle(svc).position };
      });
      if (prec) sautMax = Math.max(sautMax, Math.round(Math.abs(s.svcY - (prec.svcY - (s.y - prec.y)))));
      prec = s;
    }
    passes.push({ passe: k, arrivee: depart, sautMaxPx: sautMax, position: prec.pos });
  }
  rapport["3_rechargement"] = { passes: passes.length, sautMaxPxToutesPasses: Math.max(...passes.map((x) => x.sautMaxPx)), detail: passes };
  await ctx.close();
}

/* ---------- 4 · ARRIVEE PAR ANCRE ---------- */
{
  const { ctx, p } = await page();
  await p.goto(BASE, { waitUntil: "load" });
  await pret(p);
  await descendre(p, await p.evaluate(() => (document.getElementById("contact") || document.body).getBoundingClientRect().top + scrollY), 400);
  await p.evaluate(() => { location.hash = "#services"; });
  await p.waitForTimeout(900);
  const a = await p.evaluate(() => {
    const svc = document.getElementById("svc");
    return { svcY: Math.round(svc.getBoundingClientRect().y), pos: getComputedStyle(svc).position, cartesVisibles: [...document.querySelectorAll(".svc-carte")].filter((c) => { const r = c.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }).length };
  });
  await descendre(p, await p.evaluate(() => scrollY + 240));
  const b = await p.evaluate(() => ({ svcY: Math.round(document.getElementById("svc").getBoundingClientRect().y) }));
  rapport["4_ancre"] = { justeApres: a, apresQuatrePas: b, sautPx: Math.round(Math.abs(b.svcY - (a.svcY - 240))) };
  await ctx.close();
}

/* ---------- 5 · OUVERTURE / FERMETURE ---------- */
{
  const { ctx, p } = await page();
  await p.goto(BASE, { waitUntil: "load" });
  await pret(p);
  await descendre(p, await p.evaluate(() => document.querySelector(".svc-grille").getBoundingClientRect().top + scrollY - 80), 200);
  const geste = [];
  for (const id of ["svc-01", "svc-02", "svc-03", "svc-04"]) {
    const avant = await p.evaluate((i) => {
      const c = document.getElementById(i);
      return { cible: Math.round(c.getBoundingClientRect().y), y: Math.round(scrollY) };
    }, id);
    await p.click("#" + id + " .svc-plus");
    await p.waitForTimeout(900);
    const apres = await p.evaluate((i) => {
      const c = document.getElementById(i);
      const d = c.querySelector(".svc-detail");
      const dedans = c.querySelector(".svc-detail-in");
      const pg = c.querySelector(".ecr-page");
      return {
        cible: Math.round(c.getBoundingClientRect().y), y: Math.round(scrollY),
        ouverte: d.open, largeur: Math.round(c.getBoundingClientRect().width),
        detailVisible: !!dedans && dedans.getBoundingClientRect().height > 20,
        coupeDansLaMaquette: pg ? pg.scrollHeight - pg.clientHeight : 0,
        totalOuvertes: document.querySelectorAll(".svc-detail[open]").length
      };
    }, id);
    geste.push({ carte: id, ouverte: apres.ouverte, detailVisible: apres.detailVisible, largeur: apres.largeur, totalOuvertes: apres.totalOuvertes, coupe: apres.coupeDansLaMaquette, deplacementDeLaCarteCliqueePx: Math.round(Math.abs((apres.cible - avant.cible) - (avant.y - apres.y))) });
    await p.screenshot({ path: path.join(SORTIE, `ouvert-${LARGEUR}-${id}.png`) });
  }
  /* Fermeture : on referme les quatre, on doit retrouver la grille. */
  for (const id of ["svc-01", "svc-02", "svc-03", "svc-04"]) { await p.click("#" + id + " .svc-plus"); await p.waitForTimeout(400); }
  const apresFermeture = await p.evaluate(() => ({
    ouvertes: document.querySelectorAll(".svc-detail[open]").length,
    largeurs: [...document.querySelectorAll(".svc-carte")].map((c) => Math.round(c.getBoundingClientRect().width))
  }));
  rapport["5_ouverture"] = { geste, apresFermeture, plusieursOuvertesPossible: geste[geste.length - 1].totalOuvertes === 4 };
  await ctx.close();
}

/* ---------- 6 · LA VISITE 360 ---------- */
{
  const { ctx, p } = await page();
  await p.goto(BASE, { waitUntil: "load" });
  await pret(p);
  await descendre(p, await p.evaluate(() => document.getElementById("svc-03").getBoundingClientRect().top + scrollY - 120), 200);
  const avant = await p.evaluate(() => ({ y: Math.round(scrollY), tourLance: !!document.querySelector("[data-tour].is-live, [data-tour].is-loading") }));
  await p.click("[data-svc-tour]");
  await p.waitForTimeout(4200);
  const apres = await p.evaluate(() => {
    const bloc = document.querySelector("[data-tour]");
    const visite = document.getElementById("visite");
    return {
      y: Math.round(scrollY),
      visiteALEcran: (() => { const r = visite.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; })(),
      classes: bloc ? bloc.className : null,
      lecteurMonte: !!document.querySelector("[data-tour-stage] .pnlm-container, [data-tour-stage] canvas"),
      /* Un seul lecteur, jamais deux : la carte ne doit pas avoir
         construit sa propre instance. */
      nbLecteurs: document.querySelectorAll(".pnlm-container").length,
      posterRetire: !document.querySelector("[data-tour-poster]")
    };
  });
  await p.screenshot({ path: path.join(SORTIE, `tour-${LARGEUR}.png`) });
  rapport["6_visite_360"] = { avant, apres, aDefile: apres.y > avant.y + 200 };
  await ctx.close();
}

/* ---------- 7 · CLAVIER ---------- */
{
  const { ctx, p } = await page();
  await p.goto(BASE, { waitUntil: "load" });
  await pret(p);
  await descendre(p, await p.evaluate(() => document.querySelector(".svc-index").getBoundingClientRect().top + scrollY - 120), 200);
  await p.evaluate(() => document.querySelector(".svc-index a").focus());
  const atteints = [];
  for (let i = 0; i < 26; i++) {
    const q = await p.evaluate(() => {
      const a = document.activeElement;
      if (!a) return null;
      return { tag: a.tagName.toLowerCase(), cls: typeof a.className === "string" ? a.className : "", txt: (a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 32), anneau: getComputedStyle(a).outlineStyle !== "none" || getComputedStyle(a).outlineWidth !== "0px" };
    });
    if (q) atteints.push(q);
    await p.keyboard.press("Tab");
  }
  /* Entree sur un `<summary>` doit ouvrir la fiche : c'est le
     comportement natif, et c'est la raison d'avoir choisi `<details>`
     plutot qu'un bouton maison. */
  await p.evaluate(() => document.querySelector("#svc-01 .svc-plus").focus());
  await p.keyboard.press("Enter");
  await p.waitForTimeout(500);
  rapport["7_clavier"] = {
    ancresIndexAtteintes: atteints.filter((a) => a.cls.includes("svc-index") || (a.tag === "a" && a.txt.match(/^0[1-4]/))).length,
    resumesAtteints: atteints.filter((a) => a.tag === "summary").length,
    sansAnneau: atteints.filter((a) => !a.anneau).length,
    entreeOuvreLaFiche: await p.evaluate(() => document.querySelector("#svc-01 .svc-detail").open)
  };
  await ctx.close();
}

/* ---------- 8 · SANS JAVASCRIPT ---------- */
{
  const ctx = await nav.newContext({ viewport: { width: LARGEUR, height: 900 }, colorScheme: "light", javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: "load" });
  await p.waitForTimeout(800);
  rapport["8_sans_javascript"] = await p.evaluate(() => {
    const cartes = [...document.querySelectorAll(".svc-carte")];
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2; };
    return {
      chantiersVisibles: cartes.filter(vis).length,
      titresLisibles: cartes.filter((c) => c.querySelector("h3") && vis(c.querySelector("h3"))).length,
      ancresIndex: document.querySelectorAll(".svc-index a[href^='#svc-']").length,
      /* Le detail est un `<details>` : son contenu est dans le
         document, atteignable au clavier et par Ctrl+F, sans script. */
      fichesDepliables: document.querySelectorAll(".svc-detail > summary").length,
      pointsDansLeDocument: document.querySelectorAll(".svc-specs li").length,
      imagesChargees: [...document.querySelectorAll(".svc-carte img")].filter((i) => i.complete && i.naturalWidth > 0).length
    };
  });
  await ctx.close();
}

/* ---------- 9 · DEBORDEMENT ET CONSOLE ---------- */
{
  const debords = [];
  for (const L of [1920, 1600, 1440, 1280, 1024, 900, 768, 600, 480, 390, 320]) {
    const ctx = await nav.newContext({ viewport: { width: L, height: 900 } });
    const p = await ctx.newPage();
    p.on("pageerror", (e) => erreurs.push(`pageerror@${L}: ` + String(e)));
    p.on("console", (m) => { if (m.type() === "error") erreurs.push(`console@${L}: ` + m.text()); });
    await p.addInitScript(() => { try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
    await p.goto(BASE, { waitUntil: "load" });
    await p.waitForTimeout(1600);
    await p.evaluate(() => document.querySelectorAll(".svc-detail").forEach((d) => (d.open = true)));
    await p.waitForTimeout(400);
    debords.push({ largeur: L, debordH: await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) });
    await ctx.close();
  }
  rapport["9_debordement"] = { parLargeur: debords, aucunDebord: debords.every((d) => d.debordH <= 0) };
}

/* ---------- 10 · IMAGES ---------- */
{
  const { ctx, p } = await page();
  await p.goto(BASE, { waitUntil: "load" });
  await pret(p);
  rapport["10_images"] = await p.evaluate(() => ({
    images: [...document.querySelectorAll(".svc-carte img")].map((i) => ({
      src: i.getAttribute("src"),
      chargee: i.complete && i.naturalWidth > 0,
      largeurDeclaree: i.getAttribute("width"), hauteurDeclaree: i.getAttribute("height"),
      differee: i.getAttribute("loading") === "lazy",
      alt: i.getAttribute("alt")
    })),
    /* Chaque vue porte son etiquette d'honnetete, et elle est SOUS
       le cadre : elle ne peut rien recouvrir. */
    etiquettes: [...document.querySelectorAll(".svc-vue-note")].map((e) => e.textContent.trim()),
    /* Zero requete tierce : aucune adresse externe dans la section. */
    adressesExternes: [...document.querySelectorAll("#services [src], #services [href]")]
      .map((e) => e.getAttribute("src") || e.getAttribute("href"))
      .filter((u) => u && /^https?:\/\//.test(u) && !u.startsWith(location.origin))
  }));
  await ctx.close();
}

rapport.erreursConsole = erreurs;
fs.writeFileSync(path.join(SORTIE, `rapport-${LARGEUR}.json`), JSON.stringify(rapport, null, 2), "utf8");
console.log(JSON.stringify(rapport, null, 2));
await nav.close();
