/* ============================================================
   LA CAUSE, PROUVEE
   `node tools/svc-cause.mjs [adresse] [largeur] [n]`

   Ce que les deux sondes precedentes ont manque, chacune pour une
   raison differente et instructive :

   · `svc-bug.mjs` traverse une page chargee SANS ancre. Le `start`
     du pin y vaut 1944 et il est juste. Aucune faute a trouver.
   · le meme fichier rechargeait bien sur `#services`, mais ne
     descendait que de 180 px depuis 532. Le pin s'arme a 1412 : il
     s'arretait 700 px avant la faute.

   Ici on recharge sur `#services` PUIS on descend pas a pas jusqu'a
   2200, en traversant la position ou le pin s'arme. A chaque pas on
   releve la position calculee de la scene, le bas du hero, et
   l'occultation reelle par `elementFromPoint`.

   La question a laquelle ce fichier repond, et qui est la seule qui
   compte : « la scene epinglee se pose-t-elle sur une bande de
   l'ecran ou le hero est encore peint ? »
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const BASE = (process.argv[2] || "http://127.0.0.1:8099").replace(/\/$/, "") + "/";
const LARGEUR = Number(process.argv[3] || 1440);
const N = Number(process.argv[4] || 10);
const SORTIE = path.join(RACINE, "refonte-captures", "svc-cause");
fs.mkdirSync(SORTIE, { recursive: true });

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: LARGEUR, height: 900 }, colorScheme: "light" });
const page = await ctx.newPage();
const erreurs = [];
page.on("pageerror", (e) => erreurs.push(String(e)));
await page.addInitScript(() => { try { sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {} });

const RELEVE = () => {
  const svc = document.getElementById("svc");
  const top = document.getElementById("top");
  const cs = getComputedStyle(svc);
  const r = svc.getBoundingClientRect();
  const rt = top.getBoundingClientRect();
  const st = window.ScrollTrigger ? ScrollTrigger.getAll().find((t) => t.pin && t.trigger && t.trigger.id === "svc") : null;

  /* OCCULTATION : on interrogera le point qui est au centre du
     premier titre de carte, et un point au tiers haut de la scene.
     Piege 22 : ce qui decide est ce que le navigateur rend a ce
     point, pas un englobant. */
  const pts = [];
  const viser = (nom, x, y) => {
    if (x < 2 || y < 2 || x > innerWidth - 2 || y > innerHeight - 2) return;
    const n = document.elementFromPoint(x, y);
    if (!n) return;
    pts.push({
      nom,
      noeud: n.tagName.toLowerCase() + (typeof n.className === "string" && n.className ? "." + n.className.trim().split(/\s+/)[0] : ""),
      dansHero: !!n.closest("#top"),
      dansPlaque: !!n.closest(".plaque"),
      dansSvc: !!n.closest("#svc")
    });
  };
  const h3 = document.querySelector(".svc-carte.is-on h3");
  if (h3) { const q = h3.getBoundingClientRect(); viser("titre-carte", q.x + q.width / 2, q.y + q.height / 2); }
  viser("scene-tiers-haut", r.x + r.width / 2, r.y + r.height * 0.18);
  viser("barre-compteur", r.x + 40, r.y + 14);

  /* LA MESURE QUI DECIDE. Deux bandes de l'ecran occupees en meme
     temps par le hero et par la scene = recouvrement. */
  const hautCommun = Math.max(r.top, rt.top);
  const basCommun = Math.min(r.bottom, rt.bottom);
  const bandePartagee = Math.max(0, Math.round(basCommun - hautCommun));

  return {
    scrollY: Math.round(scrollY),
    position: cs.position,
    svcY: Math.round(r.y), svcBas: Math.round(r.bottom),
    heroY: Math.round(rt.y), heroBas: Math.round(rt.bottom),
    bandePartagee,
    stStart: st ? Math.round(st.start) : null,
    stEnd: st ? Math.round(st.end) : null,
    stActif: st ? st.isActive : null,
    occultation: pts,
    /* Un saut de la scene d'une image a l'autre est la signature du
       defaut : le visiteur voit le bloc se teleporter. */
    marque: svc.getAttribute("data-marque") || null
  };
};

const passes = [];
for (let k = 0; k < N; k++) {
  await page.goto(BASE + "#services", { waitUntil: "load" });
  await page.waitForTimeout(2400);

  const depart = await page.evaluate(RELEVE);
  const suite = [depart];
  let sautMax = 0, sautOu = null;

  for (let y = depart.scrollY; y <= 2260; y += 60) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
    const s = await page.evaluate(RELEVE);
    const prec = suite[suite.length - 1];
    /* Le saut se mesure en position d'ECRAN corrigee du defilement :
       entre deux pas de 60 px, la scene doit remonter de 60 px et pas
       d'un pixel de plus. Tout ecart est un deplacement que le
       visiteur n'a pas demande. */
    const attendu = prec.svcY - (s.scrollY - prec.scrollY);
    const ecart = Math.abs(s.svcY - attendu);
    if (ecart > sautMax) { sautMax = Math.round(ecart); sautOu = s.scrollY; }
    suite.push(s);
    if (k === 0 && (ecart > 40 || s.bandePartagee > 0)) {
      await page.screenshot({ path: path.join(SORTIE, `cause-${LARGEUR}-y${s.scrollY}.png`) });
    }
  }

  const recouvre = suite.filter((s) => s.bandePartagee > 0);
  const occulte = suite.filter((s) => s.occultation.some((o) => o.dansHero || o.dansPlaque));
  passes.push({
    passe: k,
    stStart: depart.stStart, stEnd: depart.stEnd,
    scrollYaLArrivee: depart.scrollY,
    /* LA VALEUR QUI PROUVE TOUT : l'ecart entre le start calcule et
       le start vrai, qui vaut 1944 quand la page est chargee par le
       haut. */
    sautDeLaScenePx: sautMax, sautA: sautOu,
    relevesAvecBandePartagee: recouvre.length,
    bandePartageeMaxPx: Math.max(0, ...suite.map((s) => s.bandePartagee)),
    relevesAvecOccultationHero: occulte.length,
    pas: suite.length
  });
}

/* Reference : la meme page chargee par le HAUT, pour opposer les
   deux `start`. Une seule valeur ne prouve rien ; c'est l'ecart
   entre les deux chemins d'arrivee qui est la preuve. */
await page.goto(BASE, { waitUntil: "load" });
await page.waitForTimeout(2400);
const parLeHaut = await page.evaluate(() => {
  const st = ScrollTrigger.getAll().find((t) => t.pin && t.trigger && t.trigger.id === "svc");
  const svc = document.getElementById("svc");
  return {
    stStart: st ? Math.round(st.start) : null,
    stEnd: st ? Math.round(st.end) : null,
    positionVraieDuHautDeScene: Math.round(svc.getBoundingClientRect().top + scrollY),
    hauteurNav: document.querySelector(".nav").offsetHeight
  };
});

const rapport = {
  adresse: BASE, largeur: LARGEUR,
  reference_chargee_par_le_haut: parLeHaut,
  start_attendu: parLeHaut.positionVraieDuHautDeScene - parLeHaut.hauteurNav,
  passes_rechargees_sur_services: passes,
  ecart_de_start_px: passes.length ? parLeHaut.stStart - passes[0].stStart : null,
  erreurs
};
fs.writeFileSync(path.join(SORTIE, `rapport-${LARGEUR}.json`), JSON.stringify(rapport, null, 2), "utf8");
console.log(JSON.stringify(rapport, null, 2));

await ctx.close();
await nav.close();
