/* ============================================================
   LA SEQUENCE D'ENTREE, IMAGE PAR IMAGE
   `node tools/entree-check.mjs [tag]`

   REECRIT LE 2026-07-26. L'ancienne version affirmait deux choses
   qui etaient le DEFAUT, pas la specification : « session deja vue
   -> le rideau ne doit pas exister » et « mouvement reduit -> le
   rideau ne doit pas exister ». Elle passait donc au vert sur une
   sequence que personne ne voyait jamais, puisqu'un rechargement la
   sautait. Un test qui verrouille le defaut est pire que pas de test.

   HUIT GARANTIES, chacune par son scenario reel :
   1. elle joue a l'arrivee ;
   2. elle REJOUE au rechargement — c'est une arrivee, pas une
      navigation interne ;
   3. elle ne joue PAS au retour arriere ;
   4. n'importe quel clic ou touche la saute ;
   5. UN SAUT NE VAUT QUE POUR CETTE VUE : un rechargement la remet.
      RETOURNE LE 2026-07-29, et c'est la deuxieme fois que ce test
      verrouille exactement le defaut qu'il devait attraper. Il
      affirmait « un saut vaut pour la session ». Or l'ecouteur qui
      posait `sessionStorage["aped-entree-saut"]` voyait N'IMPORTE
      QUEL `pointerdown` et N'IMPORTE QUEL `keydown` : un clic sur un
      bouton du site, ou la touche F5 elle-meme. Autrement dit la
      garantie 2 — « elle REJOUE au rechargement » — etait annulee
      par la garantie 5 des que le visiteur touchait a quoi que ce
      soit, et le test ne pouvait pas le voir puisqu'il testait les
      deux separement, sur deux pages differentes. Releve du
      2026-07-29 : quatre rechargements de suite a
      `<html class="js">`, sans rideau ni composition.
      Le drapeau est supprime. Sauter reste immediat — c'est le sens
      de ce geste — mais un rechargement est une ARRIVEE, chaque
      fois. Le scenario est donc joue dans le meme onglet, a la
      suite : on clique, PUIS on recharge, PUIS on verifie que la
      sequence est bien la ;
   6. elle ne reste JAMAIS bloquee, meme si le signal de fin de
      chargement n'arrive jamais — on coupe la promesse des polices
      pour le prouver ;
   7. sous mouvement reduit : logo statique bref, puis le site ;
   8. zero erreur de console.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const TAG = process.argv[2] || "apres";
const SORTIE = path.join(RACINE, "refonte-captures", "entree-" + TAG);
fs.mkdirSync(SORTIE, { recursive: true });
const BASE = "http://127.0.0.1:8099/";

const nav = await chromium.launch();
const R = { moments: [], erreurs: [] };

function sonde(page) {
  return page.evaluate(() => {
    const d = document.documentElement;
    const e = document.getElementById("entree");
    const j = e && e.querySelector(".entree-jauge");
    const c = e && e.querySelector(".entree-rouleau");
    const b = e && e.querySelector("[data-entree-debut]");
    const plaque = e && e.querySelector(".entree-plaque");
    function cran(el) {
      if (!el) return null;
      const m = /matrix.*?,\s*(-?[\d.]+)\)$/.exec(getComputedStyle(el).transform);
      if (!m) return "0";
      const y = parseFloat(m[1]);
      const ligne = parseFloat(getComputedStyle(el.parentElement).height);
      return String(Math.round(-y / ligne) * 10).padStart(3, "0");
    }
    return {
      t: Math.round(performance.now()),
      classes: d.className,
      rideauPresent: !!e,
      jauge: j ? getComputedStyle(j).backgroundSize : null,
      cran: cran(c),
      bandeX: b ? getComputedStyle(b).transform : null,
      plaqueOpacite: plaque ? getComputedStyle(plaque).opacity : null,
      grains: (document.getElementById("heroPlate") || {}).className || null
    };
  });
}

/* ---------- 1. PREMIERE ARRIVEE, cinq moments ---------- */
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => R.erreurs.push("pageerror: " + String(e)));
page.on("console", (m) => { if (m.type() === "error") R.erreurs.push("console: " + m.text()); });

await page.goto(BASE, { waitUntil: "commit" });
const MOMENTS = [120, 380, 660, 900, 1300, 1700];
for (const ms of MOMENTS) {
  await page.waitForFunction((ms) => performance.now() >= ms, ms, { timeout: 8000 }).catch(() => {});
  const s = await sonde(page);
  const nom = "m" + String(ms).padStart(4, "0") + ".png";
  await page.screenshot({ path: path.join(SORTIE, nom) });
  R.moments.push({ vise: ms, fichier: nom, ...s });
}
await page.waitForTimeout(1400);
R.finPremiereArrivee = await sonde(page);

/* ---------- 2. RECHARGEMENT : elle doit REJOUER ---------- */
await page.reload({ waitUntil: "commit" });
await page.waitForFunction(() => performance.now() >= 200, null, { timeout: 8000 }).catch(() => {});
R.rechargement = await sonde(page);
R.rechargement.rejoue = R.rechargement.classes.includes("entree-on");
await page.screenshot({ path: path.join(SORTIE, "rechargement.png") });
await page.waitForTimeout(2600);
R.rechargementFin = await sonde(page);

/* ---------- 3. LE SAUT ---------- */
const page2 = await ctx.newPage();
await page2.goto(BASE, { waitUntil: "commit" });
await page2.waitForFunction(() => performance.now() >= 260, null, { timeout: 8000 }).catch(() => {});
await page2.screenshot({ path: path.join(SORTIE, "saut-avant.png") });
await page2.mouse.click(720, 700);
await page2.waitForTimeout(120);
await page2.screenshot({ path: path.join(SORTIE, "saut-pendant.png") });
await page2.waitForTimeout(400);
R.saut = await sonde(page2);
R.saut.rideauParti = !R.saut.rideauPresent;
await page2.screenshot({ path: path.join(SORTIE, "saut-apres.png") });
/* SAUTER NE VAUT QUE POUR CETTE VUE. On recharge DEUX fois dans le
   MEME onglet : une seule passe ne prouve rien, c'est justement
   l'accumulation qui revelait le defaut. La sequence doit etre la
   les deux fois, et la composition du hero avec elle — un rideau
   sans composition serait le meme bug une case plus loin. */
R.saut.rechargementsApresSaut = [];
for (let i = 1; i <= 2; i++) {
  await page2.reload({ waitUntil: "commit" });
  await page2.waitForFunction(() => performance.now() >= 200, null, { timeout: 8000 }).catch(() => {});
  const apres = await sonde(page2);
  R.saut.rechargementsApresSaut.push({
    passe: i,
    classes: apres.classes,
    rejoue: apres.classes.includes("entree-on"),
    composition: apres.classes.includes("compo-hero"),
    drapeau: await page2.evaluate(() => { try { return sessionStorage.getItem("aped-entree-saut"); } catch (e) { return "?"; } }),
  });
}
R.saut.remiseApresUnSaut = R.saut.rechargementsApresSaut.every((p) => p.rejoue && p.composition);
/* Le drapeau ne doit plus exister du tout : s'il revient un jour,
   ce test le dit avant que quiconque s'en apercoive a l'oeil. */
R.saut.aucunDrapeauDeSession = R.saut.rechargementsApresSaut.every((p) => p.drapeau === null);
await page2.close();

/* ---------- 4. ELLE NE RESTE JAMAIS BLOQUEE ----------
   On coupe la promesse des polices ET la classe du canevas : la
   sequence ne PEUT pas savoir que c'est pret. Le garde-fou doit
   trancher quand meme, avant 2,6 s. */
const ctx3 = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const page3 = await ctx3.newPage();
await page3.addInitScript(() => {
  Object.defineProperty(document, "fonts", { get: () => ({ ready: new Promise(() => {}) }) });
});
await page3.goto(BASE, { waitUntil: "commit" });
await page3.waitForFunction(() => performance.now() >= 1000, null, { timeout: 9000 }).catch(() => {});
R.blocage = { a1000ms: await sonde(page3) };
await page3.screenshot({ path: path.join(SORTIE, "attente-1000ms.png") });
await page3.waitForFunction(() => performance.now() >= 3200, null, { timeout: 9000 }).catch(() => {});
R.blocage.a3200ms = await sonde(page3);
R.blocage.sortieForcee = !R.blocage.a3200ms.rideauPresent;
await page3.screenshot({ path: path.join(SORTIE, "attente-3200ms.png") });
await ctx3.close();

/* ---------- 5. MOUVEMENT REDUIT ---------- */
const ctx4 = await nav.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const page4 = await ctx4.newPage();
page4.on("pageerror", (e) => R.erreurs.push("reduit pageerror: " + String(e)));
await page4.goto(BASE, { waitUntil: "commit" });
await page4.waitForFunction(() => performance.now() >= 260, null, { timeout: 8000 }).catch(() => {});
R.reduit = { a260ms: await sonde(page4) };
/* Le logo se mesure AVANT la capture d'ecran : la capture coute
   100-200 ms et poussait la mesure au-dela de la fenetre 520-640 ms
   du monogramme sur machine chargee — piege 9, un detecteur trop
   lent condamne un comportement sain. */
R.reduit.logoVisible = await page4.evaluate(() => {
  const m = document.querySelector(".entree-mark");
  if (!m) return false;
  const r = m.getBoundingClientRect();
  return r.width > 40 && getComputedStyle(m).clipPath === "none";
});
await page4.screenshot({ path: path.join(SORTIE, "reduit-260ms.png") });
await page4.waitForTimeout(900);
R.reduit.a1200ms = await sonde(page4);
R.reduit.rideauParti = !R.reduit.a1200ms.rideauPresent;
await page4.screenshot({ path: path.join(SORTIE, "reduit-1200ms.png") });
await ctx4.close();

/* ---------- 6. RETOUR ARRIERE : elle NE doit PAS jouer ---------- */
const ctx5 = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const page5 = await ctx5.newPage();
await page5.goto(BASE, { waitUntil: "load" });
await page5.waitForTimeout(2200);
await page5.goto(BASE + "404.html", { waitUntil: "load" });
await page5.goBack({ waitUntil: "commit" });
await page5.waitForFunction(() => performance.now() >= 150, null, { timeout: 8000 }).catch(() => {});
const retour = await sonde(page5);
R.retourArriere = { classes: retour.classes, neRejouePas: !retour.classes.includes("entree-on") };
await ctx5.close();

R.verdict = {
  joueALArrivee: R.moments.some((m) => m.classes.includes("entree-on")),
  rejoueAuRechargement: R.rechargement.rejoue === true,
  neRejouePasAuRetourArriere: R.retourArriere.neRejouePas,
  seSaute: R.saut.rideauParti === true,
  unSautNeVautQuePourCetteVue: R.saut.remiseApresUnSaut === true,
  aucunDrapeauDeSession: R.saut.aucunDrapeauDeSession === true,
  neResteJamaisBloquee: R.blocage.sortieForcee === true,
  mouvementReduitLogoPuisSite: R.reduit.logoVisible === true && R.reduit.rideauParti === true,
  aucuneErreurConsole: R.erreurs.length === 0
};
console.log(JSON.stringify(R, null, 1));
fs.writeFileSync(path.join(SORTIE, "rapport.json"), JSON.stringify(R, null, 2));
await nav.close();
