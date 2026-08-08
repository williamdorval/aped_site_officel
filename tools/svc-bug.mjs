/* ============================================================
   SECTION 02 · LA SONDE DU DEFAUT D'AFFICHAGE
   `node tools/svc-bug.mjs [adresse] [largeur]`

   Ce que `services-check.mjs` ne pouvait pas voir, et pourquoi il
   passait : il defile en SAUTS (piege 5 : un `scrollTo` qui saute
   casse un pin), il ne regarde que le compteur, le nom et la jauge
   — donc il verifie que le tableau de bord dit la verite pendant
   que la mise en page est cassee derriere lui. Il ne demande jamais
   « est-ce qu'un element du hero est peint PAR-DESSUS la section ».

   Six releves :
   1. CONTENANT — tout ancetre de `#svc` qui porte un `transform`,
      un `filter`, un `contain`, une `perspective` ou un
      `will-change`. Un element `position: fixed` — ce que le pin de
      GSAP pose — se positionne par rapport au premier ancetre de ce
      genre, PAS par rapport a l'ecran. C'est le defaut classique du
      pin, et il ne se voit dans aucune capture d'ecran isolee.
   2. TRAVERSEE — on descend PAS A PAS, comme un visiteur, et a
      chaque pas on demande deux choses differentes :
      · le recouvrement geometrique hero x services ;
      · l'OCCULTATION reelle par `elementFromPoint` au centre du
        texte (piege 22 : le rectangle englobant d'un element tourne
        est plus grand que l'element).
   3. RECHARGEMENT sur `#services`, dix fois.
   4. ARRIVEE PAR ANCRE depuis une autre section.
   5. CHANGER DE SERVICE — les quatre boutons, et la position de
      defilement visee comparee a la fin reelle du pin.
   6. COURSE — la mesure de `mesurer()` au moment de l'init contre
      la mesure une fois tout rendu.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const BASE = (process.argv[2] || "http://127.0.0.1:8099").replace(/\/$/, "") + "/";
const LARGEUR = Number(process.argv[3] || 1440);
const SORTIE = path.join(RACINE, "refonte-captures", "svc-bug");
fs.mkdirSync(SORTIE, { recursive: true });

const nav = await chromium.launch();
const THEME = process.argv[4] === "sombre" ? "dark" : "light";
const ctx = await nav.newContext({ viewport: { width: LARGEUR, height: 900 }, colorScheme: THEME });
const page = await ctx.newPage();
const erreurs = [];
page.on("pageerror", (e) => erreurs.push("pageerror: " + String(e)));
page.on("console", (m) => { if (m.type() === "error") erreurs.push("console: " + m.text()); });

/* Piege 18 : un `<dialog>` ouvert par `showModal()` capture tous les
   evenements de pointeur et fait expirer n'importe quel survol. */
await page.addInitScript(() => { try { sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {} });

/* La vague 2 n'arrive qu'au premier geste ou a 1,2 s. On attend
   vraiment, sinon on mesure une page sans ScrollTrigger. */
async function pret() {
  await page.waitForTimeout(2200);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

/* Descendre PAR PAS, comme un visiteur. Un saut casse le pin. */
async function descendrePasAPas(cible, pas = 60) {
  const depart = await page.evaluate(() => window.scrollY);
  const n = Math.max(1, Math.ceil(Math.abs(cible - depart) / pas));
  for (let i = 1; i <= n; i++) {
    const y = depart + (cible - depart) * (i / n);
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
  }
  await page.waitForTimeout(120);
}

/* ------------------------------------------------------------
   Le releve, cote page. Il rend le recouvrement GEOMETRIQUE et
   l'OCCULTATION reelle, qui ne sont pas la meme chose.
   ------------------------------------------------------------ */
const SONDE = () => {
  const svc = document.getElementById("svc");
  const services = document.getElementById("services");
  const tete = services ? services.querySelector(".head h2") : null;
  const chapo = services ? services.querySelector(".head p") : null;
  /* LE SEUIL EST LA ZONE QUI TOUCHE LE HERO, et c'est celle que la
     premiere version de cette sonde ne regardait pas : elle demarrait
     sa traversee 144 px APRES que le hero ait quitte l'ecran, donc
     apres la seule fenetre ou un recouvrement est possible. */
  const seuil = services ? services.querySelector(".seuil") : null;
  const seuilNom = services ? services.querySelector(".seuil-nom") : null;
  const barre = document.querySelector(".svc-bar");
  const plaques = [...document.querySelectorAll(".plaque")];
  const corps = [...document.querySelectorAll(".plaque-corps")];
  const rr = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), b: Math.round(r.bottom) }; };
  const croise = (a, b) => !!a && !!b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  const rSvc = rr(svc);
  const rTete = rr(tete);
  const rBarre = rr(barre);

  /* OCCULTATION. Ce qui decide n'est pas l'englobant mais ce que le
     navigateur rend a ce point precis. On interroge le centre des
     objets qui portent du texte de la section. */
  const points = [];
  const viser = (nom, el) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const x = Math.min(innerWidth - 2, Math.max(2, r.x + r.width / 2));
    const y = Math.min(innerHeight - 2, Math.max(2, r.y + r.height / 2));
    if (r.bottom < 0 || r.top > innerHeight) return;
    const n = document.elementFromPoint(x, y);
    const dansHero = !!(n && n.closest && n.closest("#top"));
    const dansPlaque = !!(n && n.closest && n.closest(".plaque"));
    points.push({
      nom,
      noeud: n ? (n.tagName.toLowerCase() + (n.className && typeof n.className === "string" ? "." + n.className.trim().split(/\s+/)[0] : "")) : null,
      occulteParHero: dansHero,
      occulteParPlaque: dansPlaque
    });
  };
  viser("seuil-nom", seuilNom);
  viser("titre-section", tete);
  viser("chapo-section", chapo);
  viser("compteur", document.getElementById("svcNum"));
  viser("nom-chantier", document.getElementById("svcNow"));
  const carteOn = document.querySelector(".svc-carte.is-on h3");
  viser("titre-carte-active", carteOn);

  /* Recouvrement geometrique : combien de plaques mordent sur la
     section, et de combien de pixels au maximum. */
  let mordent = 0, mordantMax = 0;
  const morsures = [];
  const zones = [
    { nom: "seuil", r: rr(seuil) }, { nom: "titre", r: rTete }, { nom: "chapo", r: rr(chapo) },
    { nom: "barre", r: rBarre }, { nom: "svc", r: rSvc }
  ].filter((z) => z.r);
  [...plaques, ...corps].forEach((p, k) => {
    const r = rr(p);
    if (!r || r.w < 2) return;
    for (const z of zones) {
      if (croise(r, z.nom === "seuil" ? z.r : z.r)) {
        mordent++;
        const px = Math.round(r.b - z.r.y);
        mordantMax = Math.max(mordantMax, px);
        morsures.push({ plaque: k, cible: z.nom, px, texte: (p.textContent || "").trim().slice(0, 28) });
        break;
      }
    }
  });

  /* Le bas le plus bas atteint par une plaque, contre le haut de la
     section. Une seule valeur signee dit tout : positive = morsure. */
  const basPlaque = Math.max(-99999, ...[...plaques, ...corps].map((p) => p.getBoundingClientRect().bottom));
  const hautSection = services ? services.getBoundingClientRect().top : 99999;

  const cs = svc ? getComputedStyle(svc) : null;
  const spacer = svc && svc.parentElement && svc.parentElement.classList.contains("pin-spacer") ? svc.parentElement : null;

  return {
    scrollY: Math.round(window.scrollY),
    svc: rSvc,
    svcPosition: cs ? cs.position : null,
    svcTop: cs ? cs.top : null,
    svcLeft: cs ? cs.left : null,
    svcTransform: cs && cs.transform !== "none" ? cs.transform : null,
    pinSpacer: spacer ? rr(spacer) : null,
    pinne: svc ? svc.classList.contains("is-pinned") : null,
    /* Le hero est-il encore a l'ecran alors que la scene est
       epinglee ? Les deux ne peuvent pas etre vrais en meme temps. */
    heroVisible: (() => { const r = rr(document.getElementById("top")); return !!r && r.b > 0; })(),
    heroBas: (() => { const r = rr(document.getElementById("top")); return r ? r.b : null; })(),
    plaquesQuiMordent: mordent,
    mordantMaxPx: mordantMax,
    morsures,
    debordSousLeHero: Math.round(basPlaque - hautSection),
    occultation: points,
    num: (document.getElementById("svcNum") || {}).textContent || null,
    railX: (() => { const r = document.getElementById("svcRail"); if (!r) return null; const t = getComputedStyle(r).transform; return t === "none" ? 0 : Math.round(parseFloat(t.split(",")[4] || "0")); })()
  };
};

/* ============ 1 · LE CONTENANT ============ */
await page.goto(BASE, { waitUntil: "load" });
await pret();

const contenant = await page.evaluate(() => {
  const out = [];
  let el = document.getElementById("svc");
  while (el && el !== document.documentElement) {
    const c = getComputedStyle(el);
    const causes = [];
    if (c.transform && c.transform !== "none") causes.push("transform=" + c.transform);
    if (c.filter && c.filter !== "none") causes.push("filter=" + c.filter);
    if (c.perspective && c.perspective !== "none") causes.push("perspective=" + c.perspective);
    if (c.contain && c.contain !== "none") causes.push("contain=" + c.contain);
    if (c.willChange && c.willChange !== "auto") causes.push("will-change=" + c.willChange);
    if (c.containerType && c.containerType !== "normal") causes.push("container-type=" + c.containerType);
    if (c.backdropFilter && c.backdropFilter !== "none") causes.push("backdrop-filter=" + c.backdropFilter);
    if (c.position !== "static") causes.push("position=" + c.position);
    if (c.zIndex !== "auto") causes.push("z-index=" + c.zIndex);
    if (c.contentVisibility && c.contentVisibility !== "visible") causes.push("content-visibility=" + c.contentVisibility);
    if (causes.length) out.push({ el: el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : ""), causes });
    el = el.parentElement;
  }
  return out;
});

/* Les plaques du hero : ou vivent-elles, quel z-index, quel
   empilement, et est-ce que le hero les rogne ? */
const heroInfo = await page.evaluate(() => {
  const p = document.querySelector(".plaque");
  const bande = p ? p.closest("[class]") : null;
  const chaine = [];
  let el = p;
  while (el && el !== document.documentElement) {
    const c = getComputedStyle(el);
    chaine.push({
      el: el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : ""),
      position: c.position, zIndex: c.zIndex, overflow: c.overflow,
      transform: c.transform === "none" ? null : c.transform,
      isolation: c.isolation
    });
    el = el.parentElement;
  }
  return { nb: document.querySelectorAll(".plaque").length, bande: bande ? bande.className : null, chaine };
});

/* ============ 6 · LA COURSE ============ */
const course = await page.evaluate(() => {
  const rail = document.getElementById("svcRail");
  const piste = document.getElementById("svcPiste");
  const cartes = [...document.querySelectorAll(".svc-carte")];
  const c = rail.scrollWidth - piste.clientWidth;
  return {
    railScrollWidth: rail.scrollWidth,
    pisteClientWidth: piste.clientWidth,
    course: c,
    decalages: cartes.map((x) => x.offsetLeft),
    /* CE RATIO EST LE COEUR DU DEFAUT « CHANGER DE SERVICE » :
       `motion.js` calcule la position visee comme
       start + (end-start) * (decalage / course). Si un decalage
       depasse la course, le ratio depasse 1 et le defilement va
       AU-DELA de la fin du pin. */
    ratios: cartes.map((x) => Math.round((x.offsetLeft / c) * 1000) / 1000),
    ratioMax: Math.max(...cartes.map((x) => x.offsetLeft / c))
  };
});

/* ============ 2 · LA TRAVERSEE, PAS A PAS ============ */
const svcTop = await page.evaluate(() => document.getElementById("svc").getBoundingClientRect().top + window.scrollY);
const navH = await page.evaluate(() => document.querySelector(".nav").offsetHeight);
const traversee = [];
const fautifs = [];
/* ON PART DE ZERO. La version precedente partait de
   `svcTop - navH - 900`, soit 1044 px, alors que le hero quitte
   l'ecran a 900 px : elle commencait a mesurer APRES la seule
   fenetre ou un recouvrement peut exister, et rendait donc
   « 0 fautif » sur un defaut bien present. Piege 2. */
const debut = 0;
const fin = svcTop - navH + course.course + 400;
const PAS = 60;
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(200);
for (let y = debut; y <= fin; y += PAS) {
  await descendrePasAPas(y, PAS);
  const s = await page.evaluate(SONDE);
  traversee.push(s);
  const casse = s.plaquesQuiMordent > 0 || s.occultation.some((o) => o.occulteParHero || o.occulteParPlaque)
    || (s.pinne && s.svcPosition === "fixed" && s.heroVisible && s.heroBas > navH + 40);
  if (casse && fautifs.length < 8) {
    const f = path.join(SORTIE, `faute-${LARGEUR}-y${Math.round(y)}.png`);
    await page.screenshot({ path: f });
    fautifs.push({ y: Math.round(y), fichier: path.basename(f), ...s });
  }
}

/* ============ 3 · RECHARGEMENT SUR #services, DIX FOIS ============ */
const rechargements = [];
for (let i = 0; i < 10; i++) {
  await page.goto(BASE + "#services", { waitUntil: "load" });
  await pret();
  /* On bouge de trois pas seulement : c'est la ou le pin se
     reveille avec des positions calculees sur un autre etat. */
  await descendrePasAPas(await page.evaluate(() => window.scrollY + 180), 60);
  const s = await page.evaluate(SONDE);
  const casse = s.plaquesQuiMordent > 0 || s.occultation.some((o) => o.occulteParHero || o.occulteParPlaque);
  rechargements.push({ i, casse, scrollY: s.scrollY, svcPosition: s.svcPosition, svcY: s.svc && s.svc.y, pinne: s.pinne, heroBas: s.heroBas, mordent: s.plaquesQuiMordent, num: s.num, railX: s.railX });
  if (casse && i < 3) await page.screenshot({ path: path.join(SORTIE, `recharge-${LARGEUR}-${i}.png`) });
}

/* ============ 4 · ARRIVEE PAR ANCRE ============ */
await page.goto(BASE, { waitUntil: "load" });
await pret();
await descendrePasAPas(await page.evaluate(() => document.getElementById("contact") ? document.getElementById("contact").getBoundingClientRect().top + window.scrollY : 6000), 400);
await page.waitForTimeout(300);
const ancre = {};
await page.evaluate(() => { location.hash = "#services"; });
await page.waitForTimeout(900);
ancre.justeApres = await page.evaluate(SONDE);
await descendrePasAPas(await page.evaluate(() => window.scrollY + 240), 60);
ancre.apresTroisPas = await page.evaluate(SONDE);
await page.screenshot({ path: path.join(SORTIE, `ancre-${LARGEUR}.png`) });

/* ============ 5 · CHANGER DE SERVICE ============ */
await page.goto(BASE, { waitUntil: "load" });
await pret();
await descendrePasAPas(svcTop - navH, 80);
const changer = [];
for (let k = 0; k < 4; k++) {
  const avant = await page.evaluate(SONDE);
  await page.click('[data-svc="1"]');
  await page.waitForTimeout(1400);
  const apres = await page.evaluate(SONDE);
  const bornes = await page.evaluate(() => {
    const s = (window.ScrollTrigger && ScrollTrigger.getAll().find((t) => t.pin && t.trigger && t.trigger.id === "svc")) || null;
    return s ? { start: Math.round(s.start), end: Math.round(s.end), progress: Math.round(s.progress * 1000) / 1000 } : null;
  });
  changer.push({
    clic: k + 1,
    numAvant: avant.num, numApres: apres.num,
    scrollAvant: avant.scrollY, scrollApres: apres.scrollY,
    bornes,
    depasseLaFin: bornes ? apres.scrollY > bornes.end + 2 : null,
    pinneApres: apres.pinne, positionApres: apres.svcPosition,
    svcVisibleApres: apres.svc && apres.svc.b > 0 && apres.svc.y < 900,
    mordent: apres.plaquesQuiMordent
  });
  await page.screenshot({ path: path.join(SORTIE, `changer-${LARGEUR}-${k + 1}.png`) });
}

const pires = traversee.filter((t) => t.plaquesQuiMordent > 0 || t.occultation.some((o) => o.occulteParHero || o.occulteParPlaque));
const rapport = {
  adresse: BASE, largeur: LARGEUR,
  "1_contenant_de_bloc": contenant,
  "1b_chaine_des_plaques": heroInfo,
  "6_course": course,
  "2_traversee": {
    pas: PAS, de: debut, a: Math.round(fin), releves: traversee.length,
    relevesFautifs: pires.length,
    mordantMaxPx: Math.max(0, ...traversee.map((t) => t.mordantMaxPx)),
    debordSousLeHeroMax: Math.max(...traversee.map((t) => t.debordSousLeHero)),
    morsuresParCible: (() => {
      const m = {};
      traversee.forEach((t) => (t.morsures || []).forEach((x) => { m[x.cible] = (m[x.cible] || 0) + 1; }));
      return m;
    })(),
    fautifs
  },
  "3_rechargement_services": { casses: rechargements.filter((r) => r.casse).length, sur: rechargements.length, detail: rechargements },
  "4_ancre": ancre,
  "5_changer_de_service": changer,
  erreurs
};
fs.writeFileSync(path.join(SORTIE, `rapport-${LARGEUR}.json`), JSON.stringify(rapport, null, 2), "utf8");
console.log(JSON.stringify(rapport, null, 2));

await ctx.close();
await nav.close();
