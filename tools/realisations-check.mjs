/* ============================================================
   LES QUATRE COMPARAISONS AVANT / APRES
   `node tools/realisations-check.mjs [port] [tag]`

   Ce que cet outil prouve, et que `ba-check.mjs` ne pouvait PAS
   prouver : la poignee SE GLISSE.

   `ba-check` synthetisait un evenement `input` sur le champ, ce qui
   valide le clavier et rien d'autre. Le 2026-07-31, un vrai
   `mouse.down` suivi de huit `mouse.move` a laisse `--ba-p` a 50 du
   debut a la fin, souris ET doigt : le glissement etait mort depuis
   toujours et le test passait au vert. Piege 17, dans sa forme la
   plus couteuse.
   Ici on glisse pour de vrai, on suit la valeur a chaque pas, et on
   exige qu'elle SUIVE le curseur — pas seulement qu'elle bouge.

   Le reste du releve :
   · trois positions par comparaison, en captures, avec l'ecart de
     pixels entre elles ;
   · le geste vertical au doigt doit rendre le defilement a la page ;
   · les quatre « avant » et les quatre « apres » en PLEINE hauteur,
     hors de leur fenetre de 313 px — une fenetre ne prouve pas
     qu'une page est complete ;
   · aucun rectangle gris de remplacement nulle part.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { diffStats, lire } from "./_png.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PORT = process.argv[2] || "8099";
const TAG = process.argv[3] || "";
const BASE = `http://127.0.0.1:${PORT}/`;
const SORTIE = path.join(RACINE, "preuves", "chantier4-realisations" + (TAG ? "-" + TAG : ""));
fs.mkdirSync(SORTIE, { recursive: true });
const IDS_BASE = ["ba-garage", "ba-design", "ba-restaurant", "ba-renovation"];
const IDS = process.env.BA_ORDRE === "inverse" ? [...IDS_BASE].reverse() : IDS_BASE;

function ecart(a, b) {
  const d = diffStats(lire(fs, a), lire(fs, b));
  if (!d.taille) throw new Error("tailles differentes : " + a + " / " + b);
  if (!Number.isFinite(d.pct)) throw new Error("ecart NaN");
  return d.pct;
}

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, hasTouch: true });
const page = await ctx.newPage();
const erreurs = [];
page.on("pageerror", (e) => erreurs.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
await page.addInitScript(() => {
  try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {}
});
await page.goto(BASE, { waitUntil: "load" });
await page.waitForTimeout(1600);
await page.evaluate(() => document.getElementById("realisations").scrollIntoView({ block: "start", behavior: "instant" }));
await page.waitForTimeout(1400);
/* La boucle interne des maquettes doit etre figee : elle ferait
   bouger l'image entre deux captures et on lui attribuerait le
   merite du glissement. */
await page.evaluate(() => {
  document.querySelectorAll(".ba-page").forEach((p) => { p.style.animation = "none"; p.style.transform = "none"; });
});

/* UNE SEULE SESSION CDP POUR TOUTE LA PASSE.  D-642
   Elle etait creee DANS la boucle, donc quatre sessions vivantes sur
   la meme page a la fin. C'est de l'hygiene, pas le correctif : la
   session unique n'a rien change au releve. Le vrai constat est
   ecrit plus bas, la ou il porte. */
const cdp = await ctx.newCDPSession(page);
const R = { comparaisons: [], erreurs };

for (const id of IDS) {
  await page.evaluate((id) => document.querySelector("#" + id).scrollIntoView({ block: "center", behavior: "instant" }), id);
  await page.waitForTimeout(700);
  const boite = await page.evaluate((id) => {
    const r = document.querySelector("#" + id + " .ba-scene").getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }, id);
  const lire2 = () => page.evaluate((id) => {
    const s = document.querySelector("#" + id + " .ba-scene");
    return +getComputedStyle(s).getPropertyValue("--ba-p").trim();
  }, id);

  /* --- LE GLISSEMENT, POUR DE VRAI --- */
  const cy = boite.y + boite.h / 2;
  await page.mouse.move(boite.x + boite.w * 0.5, cy);
  await page.mouse.down();
  const pas = [];
  for (const k of [0.42, 0.30, 0.18, 0.34, 0.62, 0.86]) {
    await page.mouse.move(boite.x + boite.w * k, cy, { steps: 5 });
    await page.waitForTimeout(70);
    pas.push({ vise: Math.round(k * 100), lu: Math.round(await lire2()) });
  }
  await page.mouse.up();
  const suit = pas.every((e) => Math.abs(e.lu - e.vise) <= 2);

  /* --- LE DOIGT : LA PRISE COMPARE, LE RESTE DU CADRE DEFILE ---
     CE QUE CE BLOC MESURAIT AVANT, ET POURQUOI CA NE TIENT PLUS.
     Il partait du MILIEU de la scene et exigeait que le geste
     horizontal compare. C'etait juste tant que la scene ne defilait
     pas : `touch-action: pan-y` n'avait alors rien a faire defiler,
     et le navigateur laissait passer l'horizontale.
     Depuis que le cadre est un ecran dans lequel on descend, la
     vitre defile — et le navigateur REVENDIQUE le geste des le
     premier deplacement : `pointercancel`, poignee figee apres un
     seul pas. Mesure du 2026-07-31 : `--ba-p` va de 50 a 42 et
     s'arrete, sur les quatre.
     Les deux gestes se disputent le meme rectangle et, au doigt, ils
     ne peuvent pas gagner tous les deux. On a tranche par la
     SURFACE (D-640) : la colonne de la poignee compare, tout le
     reste du cadre defile. C'est ce contrat-la qu'on mesure
     maintenant — dans les DEUX sens, sinon on ne prouve que la
     moitie.  D-640 */
  /* a · le doigt POSE SUR LA PRISE compare a l'horizontale.
     SEULE LA PREMIERE SEQUENCE TACTILE D'UNE PAGE ABOUTIT.  D-642
     Constat du 2026-07-31, et il a coute quatre hypotheses fausses
     avant d'etre pris pour ce qu'il est : les gestes tactiles qui
     suivent le premier s'arretent apres un pas. Ce n'est ni la
     comparaison — en ordre inverse, c'est la renovation qui passe et
     les trois autres qui echouent, donc le defaut suit le RANG — ni
     l'empilement des sessions CDP, ni un defilement en vol : ni la
     session unique, ni le `touchCancel`, ni une seconde d'attente
     n'y changent quoi que ce soit. L'injection tactile ne se remet
     pas, voila tout.
     Ce qui est mesure ici vaut donc pour la PREMIERE comparaison. Le
     reste est prouve par `tools/ba-doigt.mjs`, qui rejoue le meme
     geste sur une PAGE NEUVE par comparaison et rend 0 % d'ecart sur
     les quatre. On ne fait pas dire a un instrument ce qu'il ne peut
     pas mesurer. */
  await page.waitForTimeout(700);
  const departPrise = await page.evaluate((id) => {
    const t = document.querySelector("#" + id + " .ba-trait").getBoundingClientRect();
    return { x: Math.round(t.left + t.width / 2), y: Math.round(t.top + t.height / 2) };
  }, id);
  const yAvant = await page.evaluate(() => Math.round(window.scrollY));
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: departPrise.x, y: departPrise.y }] });
  for (const k of [0.42, 0.32, 0.22]) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: boite.x + boite.w * k, y: departPrise.y }] });
    await new Promise((r) => setTimeout(r, 70));
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await new Promise((r) => setTimeout(r, 250));
  const doigtHorizontal = Math.round(await lire2());
  const pageABougePendantLHorizontal = (await page.evaluate(() => Math.round(window.scrollY))) - yAvant;

  /* b · le doigt pose AILLEURS fait descendre le cadre, et ne
     deplace pas la poignee d'un pour cent. */
  await page.evaluate((id) => { document.querySelector("#" + id + " [data-ba-vitre]").scrollTop = 0; }, id);
  await page.waitForTimeout(150);
  const yAvant2 = await page.evaluate(() => Math.round(window.scrollY));
  const loinDeLaPrise = boite.x + boite.w * (doigtHorizontal < 50 ? 0.86 : 0.14);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: loinDeLaPrise, y: cy + boite.h * 0.3 }] });
  for (const d of [40, 90, 150]) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: loinDeLaPrise, y: cy + boite.h * 0.3 - d }] });
    await new Promise((r) => setTimeout(r, 70));
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await new Promise((r) => setTimeout(r, 250));
  await page.waitForTimeout(500);
  const apresVertical = Math.round(await lire2());
  const dedans = await page.evaluate((id) => Math.round(document.querySelector("#" + id + " [data-ba-vitre]").scrollTop), id);
  const verticalNeCompareRien = apresVertical === doigtHorizontal;
  const pageABougePendantLeVertical = (await page.evaluate(() => Math.round(window.scrollY))) - yAvant2;

  /* --- LE CLAVIER --- */
  await page.evaluate((id) => document.querySelector("#" + id + " [data-ba-curseur]").focus(), id);
  const avantClavier = Math.round(await lire2());
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  const apresClavier = Math.round(await lire2());

  /* --- LE CURSEUR CHANGE AU SURVOL --- */
  const curseur = await page.evaluate((id) =>
    getComputedStyle(document.querySelector("#" + id + " .ba-scene")).cursor, id);

  /* --- TROIS POSITIONS, EN IMAGES --- */
  const fich = [];
  for (const v of [0, 50, 100]) {
    await page.evaluate(({ id, v }) => {
      let f = document.getElementById("_ba_force");
      if (!f) { f = document.createElement("style"); f.id = "_ba_force"; document.head.appendChild(f); }
      f.textContent = `#${id} .ba-scene { --ba-p: ${v} !important; }`;
    }, { id, v });
    await page.waitForTimeout(260);
    const f = path.join(SORTIE, `${id}-p${String(v).padStart(3, "0")}.png`);
    await page.locator("#" + id + " .ba-scene").screenshot({ path: f });
    fich.push(f);
  }
  const ecarts = [
    +ecart(fich[0], fich[1]).toFixed(2),
    +ecart(fich[1], fich[2]).toFixed(2),
    +ecart(fich[0], fich[2]).toFixed(2)
  ];

  /* --- LES DEUX COTES, EN PLEINE HAUTEUR --- */
  const hauteurs = {};
  for (const cote of ["avant", "apres"]) {
    await page.evaluate(({ id, cote }) => {
      const f = document.getElementById("_ba_force");
      f.textContent = `#${id} .ba-scene { --ba-p: ${cote === "avant" ? 100 : 0} !important; }`;
      const sc = document.querySelector(`#${id} .ba-scene`);
      sc.style.aspectRatio = "auto"; sc.style.height = "5000px";
    }, { id, cote });
    await page.waitForTimeout(320);
    const h = await page.evaluate(({ id, cote }) =>
      Math.ceil(document.querySelector(`#${id} .ba-vue--${cote}`).firstElementChild.getBoundingClientRect().height),
      { id, cote });
    await page.evaluate(({ id, h }) => { document.querySelector(`#${id} .ba-scene`).style.height = h + "px"; }, { id, h });
    await page.waitForTimeout(320);
    await page.locator("#" + id + " .ba-scene").screenshot({ path: path.join(SORTIE, `${id}-${cote}-pleine.png`) });
    hauteurs[cote] = h;
    await page.evaluate((id) => { const sc = document.querySelector(`#${id} .ba-scene`); sc.style.aspectRatio = ""; sc.style.height = ""; }, id);
  }
  await page.evaluate(() => { const f = document.getElementById("_ba_force"); if (f) f.textContent = ""; });

  R.comparaisons.push({
    id, pas, suitLeCurseur: suit,
    doigt: { horizontal: doigtHorizontal, pageABougePendantLHorizontal, verticalNeCompareRien, defileDansLeCadre: dedans, pageABougePendantLeVertical },
    clavier: { avant: avantClavier, apres: apresClavier, bouge: apresClavier !== avantClavier },
    curseur, ecarts, hauteurs
  });
}

/* --- AUCUN RECTANGLE DE REMPLACEMENT DU COTE « APRES » ---
   La distinction n'est pas de confort. Dans l'APRES, un rectangle
   gris est un placeholder : c'est un defaut de production, et c'en
   etait un — les quatre maquettes redessinees en portaient jusqu'a
   sept chacune. Dans l'AVANT, c'est du CONTENU : un site de 2011 et
   un gabarit achete ont des blocs photo generiques, et les
   reconstituer sans eux serait les flatter. On compte donc les deux
   separement, et on ne juge que le premier. */
const remplacements = await page.evaluate(() => {
  const vides = [];
  for (const el of document.querySelectorAll("#realisations .ba-vue--apres *")) {
    if (el.children.length || (el.textContent || "").trim()) continue;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width < 24 || r.height < 24) continue;
    const f = cs.backgroundColor;
    if (f === "rgba(0, 0, 0, 0)" || f === "transparent") continue;
    if (el.tagName === "IMG" || el.querySelector("img")) continue;
    vides.push(el.className.toString().slice(0, 40) + " " + Math.round(r.width) + "x" + Math.round(r.height) + " " + f);
  }
  return vides;
});
R.rectanglesVidesDansLApres = remplacements.length;
R.rectanglesVidesDetail = remplacements.slice(0, 12);
R.blocsPhotoDansLAvant = await page.evaluate(() => {
  let n = 0;
  for (const el of document.querySelectorAll("#realisations .ba-vue--avant *")) {
    if (el.children.length || (el.textContent || "").trim()) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 24 || r.height < 24) continue;
    const f = getComputedStyle(el).backgroundColor;
    if (f === "rgba(0, 0, 0, 0)" || f === "transparent") continue;
    n++;
  }
  return n;
});

R.verdict = {
  laPoigneeSuitLeCurseurSurLesQuatre: R.comparaisons.every((c) => c.suitLeCurseur),
  /* LE GLISSEMENT AU DOIGT N EST PLUS JUGE ICI, ET C EST L OUTIL
     QUI A TORT, PAS LA PAGE.  D-642
     Cette passe enchaine plusieurs gestes tactiles sur la MEME page.
     Releve du 2026-07-31, verifie dans les deux sens de parcours :
     seule la PREMIERE sequence tactile d une page aboutit — les
     suivantes s arretent apres un pas, quelle que soit la
     comparaison. En ordre inverse, c'est la renovation qui passe et
     les trois autres qui echouent : le defaut suit le RANG, pas la
     comparaison. Un `touchCancel` explicite et une seconde d'attente
     n'y changent rien.
     On ne fait donc plus dire a cet outil ce qu'il ne peut pas
     mesurer. `tools/ba-doigt.mjs` rejoue le meme geste sur une PAGE
     NEUVE par comparaison, et rend 0 % d'ecart sur les quatre.
     On garde ici la premiere, qui elle est fiable. */
  leDoigtCompareALHorizontale: R.comparaisons[0].doigt.horizontal <= 40,
  leDoigtNeBloqueJamaisLeDefilement: R.comparaisons.every((c) => c.doigt.pageABougePendantLHorizontal === 0),
  leGesteVerticalNeCompareRien: R.comparaisons[0].doigt.verticalNeCompareRien,
  leDoigtHorsPriseFaitDescendreLeCadre: R.comparaisons.every((c) => c.doigt.defileDansLeCadre > 60),
  leClavierBouge: R.comparaisons.every((c) => c.clavier.bouge),
  leCurseurChange: R.comparaisons.every((c) => c.curseur === "ew-resize"),
  lesTroisPositionsDifferent: R.comparaisons.every((c) => c.ecarts[0] > 8 && c.ecarts[1] > 8 && c.ecarts[2] > 40),
  /* LES DEUX COTES N'ONT PAS LA MEME MESURE, ET C'EST VOULU.  D-627
     L'AVANT est une reconstitution de page entiere : il doit
     depasser largement la fenetre, sinon c'est un fragment et le
     reproche « les avant ne sont pas terminés » tient encore.
     L'APRES est une capture cadree sur UNE fenetre : exiger de lui
     une hauteur de page reviendrait a redemander la boucle qu'on
     vient de retirer. On lui demande donc de remplir sa fenetre,
     ni plus ni moins. */
  lesQuatreAvantSontDesPagesEntieres: R.comparaisons.every((c) => c.hauteurs.avant > 500),
  lesQuatreApresRemplissentLeurFenetre: R.comparaisons.every((c) => c.hauteurs.apres >= 300),
  aucunPlaceholderDansLApres: remplacements.length === 0,
  aucuneErreurConsole: erreurs.length === 0
};
fs.writeFileSync(path.join(SORTIE, "rapport.json"), JSON.stringify(R, null, 2));
console.log(JSON.stringify({
  comparaisons: R.comparaisons.map((c) => ({ id: c.id, suit: c.suitLeCurseur, pas: c.pas, ecarts: c.ecarts, hauteurs: c.hauteurs })),
  rectanglesVidesDansLApres: R.rectanglesVidesDansLApres,
  blocsPhotoDansLAvant: R.blocsPhotoDansLAvant,
  erreurs, verdict: R.verdict
}, null, 1));
const rate = Object.entries(R.verdict).filter(([, v]) => !v);
console.log(rate.length ? "\nECHEC : " + rate.map(([k]) => k).join(", ") : "\nTOUT PASSE");
process.exitCode = rate.length ? 1 : 0;
await nav.close();
