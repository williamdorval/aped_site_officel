/* ============================================================
   BA-CHECK — les quatre comparaisons avant / apres.

   node tools/ba-check.mjs [port]

   1 · LE CURSEUR      trois positions par comparaison (0, 50, 100),
                       capturees, avec l'ecart de pixels entre elles.
                       « Visible, sinon ca ne compte pas. »
   2 · LE CLAVIER      fleches, Home, End — et `aria-valuetext` doit
                       dire autre chose qu'un nombre nu.
   3 · LA VITRE        la molette posee DANS le cadre fait descendre
                       le site qui est dedans — six captures, l'ecart
                       entre deux consecutives, et la page derriere
                       qui ne bouge pas.
   4 · LA COHABITATION defiler ne deplace pas la poignee, glisser la
                       poignee ne deplace pas le cadre. Les deux sens.
   5 · LE DOIGT        le cadre rend le chainage aux pointeurs
                       grossiers : personne ne reste coince.
   6 · LE VERROU       a mi-piste chacun est a mi-course de SA
                       hauteur, au bout chacun est a son pied.
   6bis · LA LOUPE     le MEME cadre, deplace dans le dialogue : la
                       course se recalcule, et en fermant tout est
                       revenu, place dans la page comprise.
   7 · L'ARRET         mouvement reduit, palier 2 — et on peut
                       toujours descendre dans le cadre.
   8 · SANS SCRIPT     le cadre est retire, les quatre titres
                       restent, aucun pave descriptif ne revient.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { decodePNG, diffStats } from "./_png.mjs";
import { RAPPORTS } from "./demos-rapports.mjs";

const PORT = process.argv[2] || "8123";
const BASE = `http://127.0.0.1:${PORT}/index.html`;
const OUT = path.join("tools", "_ba");
const CARTES = ["ba-garage", "ba-design", "ba-restaurant", "ba-renovation"];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let echecs = 0;
const dire = (ok, txt) => { if (!ok) echecs++; console.log(`  ${ok ? "OK    " : "ECHEC "} ${txt}`); };
const lire = (f) => decodePNG(fs.readFileSync(f));

const nav = await chromium.launch();

async function page(opts = {}) {
  const ctx = await nav.newContext({
    viewport: { width: opts.w || 1440, height: opts.h || 1000 },
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: opts.reduit ? "reduce" : "no-preference",
    javaScriptEnabled: opts.js !== false,
  });
  await ctx.addInitScript(() => { try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  const p = await ctx.newPage();
  p.on("console", (m) => { if (m.type() === "error") { echecs++; console.log("  ECHEC  console : " + m.text()); } });
  await p.goto(BASE, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  return { ctx, p };
}

/* ---------- 0 · LA POIGNEE SE GLISSE-T-ELLE ? ----------
   CE TEST MANQUAIT, ET SON ABSENCE A COUTE LE DEFAUT LUI-MEME.
   Tout ce qui suit synthetise un evenement `input` sur le champ :
   ca valide le clavier, et le clavier SEUL. Le 2026-07-31, un vrai
   `mouse.down` suivi de huit `mouse.move` a laisse `--ba-p` a 50 du
   debut a la fin — le glissement etait mort, et ce fichier passait
   au vert. Piege 17 dans sa forme la plus chere : un test qui
   verrouille le defaut qu'il devait attraper.
   On glisse donc pour de vrai, et on exige que la valeur SUIVE le
   curseur — pas seulement qu'elle bouge.  D-593 */
console.log("0 · LA POIGNEE — un vrai glissement de souris");
{
  const { ctx, p } = await page();
  for (const id of CARTES) {
    /* `behavior: "instant"` : la page porte `scroll-behavior: smooth`,
       donc un `scrollIntoView` par defaut DEFILE ENCORE pendant qu'on
       releve le rectangle. On visait alors a cote et le glissement
       semblait ne pas suivre — un faux echec de 69 %. */
    await p.evaluate((i) => document.getElementById(i).scrollIntoView({ block: "center", behavior: "instant" }), id);
    await p.waitForTimeout(800);
    const b = await p.evaluate((i) => {
      const r = document.querySelector("#" + i + " .ba-scene").getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    }, id);
    const lu = () => p.evaluate((i) =>
      Math.round(+getComputedStyle(document.querySelector("#" + i + " .ba-scene"))
        .getPropertyValue("--ba-p").trim()), id);
    const cy = b.y + b.h / 2;
    await p.mouse.move(b.x + b.w * 0.5, cy);
    await p.mouse.down();
    const ecarts = [];
    for (const k of [0.42, 0.28, 0.16, 0.55, 0.84]) {
      await p.mouse.move(b.x + b.w * k, cy, { steps: 5 });
      await p.waitForTimeout(70);
      ecarts.push(Math.abs((await lu()) - Math.round(k * 100)));
    }
    await p.mouse.up();
    const pire = Math.max.apply(null, ecarts);
    dire(pire <= 2, `${id} : ecart maximal a la position du curseur ${pire} %`);
  }
  await ctx.close();
}

/* ---------- 1 · LE CURSEUR, TROIS POSITIONS ---------- */
console.log("1 · LE CURSEUR — trois positions par comparaison");
{
  const { ctx, p } = await page();
  for (const id of CARTES) {
    await p.evaluate((i) => document.getElementById(i).scrollIntoView({ block: "center" }), id);
    /* On fige la boucle : sinon on mesure le defilement, pas le curseur. */
    await p.evaluate((i) => {
      document.querySelectorAll("#" + i + " .ba-page").forEach((e) => {
        e.style.animation = "none";
        e.style.transform = "none";
      });
    }, id);
    await p.waitForTimeout(320);
    const fics = [];
    for (const v of [0, 50, 100]) {
      await p.evaluate(([i, val]) => {
        const c = document.querySelector("#" + i + " [data-ba-curseur]");
        c.value = val;
        c.dispatchEvent(new Event("input", { bubbles: true }));
      }, [id, v]);
      await p.waitForTimeout(240);
      const f = path.join(OUT, `${id}-${String(v).padStart(3, "0")}.png`);
      await (await p.$("#" + id + " .ba-scene")).screenshot({ path: f });
      fics.push(f);
    }
    const a = lire(fics[0]), b = lire(fics[1]), c2 = lire(fics[2]);
    const d1 = diffStats(a, b, 8).pct, d2 = diffStats(b, c2, 8).pct, d3 = diffStats(a, c2, 8).pct;
    dire(d1 > 8 && d2 > 8 && d3 > 40,
      `${id} : 0→50 ${d1.toFixed(1)} % · 50→100 ${d2.toFixed(1)} % · 0→100 ${d3.toFixed(1)} %`);
  }
  await ctx.close();
}

/* ---------- 2 · LE CLAVIER ---------- */
console.log("\n2 · LE CLAVIER");
{
  const { ctx, p } = await page();
  await p.evaluate(() => document.getElementById("ba-garage").scrollIntoView({ block: "center" }));
  await p.waitForTimeout(320);
  const c = await p.$("#ba-garage [data-ba-curseur]");
  await c.focus();
  const lis = () => p.evaluate(() => {
    const e = document.querySelector("#ba-garage [data-ba-curseur]");
    return {
      v: Number(e.value),
      t: e.getAttribute("aria-valuetext"),
      p: getComputedStyle(document.querySelector("#ba-garage .ba-scene")).getPropertyValue("--ba-p").trim(),
    };
  });
  const d = await lis();
  await p.keyboard.press("ArrowRight");
  const r = await lis();
  await p.keyboard.press("ArrowLeft"); await p.keyboard.press("ArrowLeft");
  const g = await lis();
  await p.keyboard.press("Home");
  const h = await lis();
  await p.keyboard.press("End");
  const e2 = await lis();
  dire(r.v > d.v, `fleche droite : ${d.v} → ${r.v}`);
  dire(g.v < r.v, `fleche gauche : ${r.v} → ${g.v}`);
  dire(h.v === 0, `Home : ${h.v}`);
  dire(e2.v === 100, `End : ${e2.v}`);
  dire(String(e2.p) === "100", `la variable suit la touche : --ba-p = ${e2.p}`);
  dire(!!e2.t && /%/.test(e2.t) && e2.t.length > 6, `aria-valuetext dit autre chose qu'un nombre : « ${e2.t} »`);
  const anneau = await p.evaluate(() => {
    const e = document.querySelector("#ba-garage [data-ba-curseur]");
    e.focus();
    const cs = getComputedStyle(e);
    return cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
  });
  dire(anneau, "un anneau de focus existe");
  const tact = await p.evaluate(() => getComputedStyle(document.querySelector("#ba-garage [data-ba-curseur]")).touchAction);
  dire(tact === "pan-y", `touch-action = ${tact} — le doigt garde le defilement vertical`);
  await ctx.close();
}

/* ---------- 3 · LA VITRE — ON DEFILE DANS LE CADRE ----------
   CE QUE CETTE SECTION REMPLACE, ET POURQUOI.
   Elle mesurait une BOUCLE automatique : la maquette glissait toute
   seule et on verifiait que ca bougeait. La boucle est partie avec le
   chantier du 2026-07-31 — elle existait pour montrer ce qu'une
   fenetre fixe ne pouvait pas montrer, et la main du visiteur le fait
   mieux. Laisser l'ancienne section en place l'aurait fait echouer
   sur une absence VOULUE, ou pire, aurait pousse a remettre la boucle
   pour faire passer le test. Piege 17.
   Ce qu'on mesure maintenant est ce qu'on veut vraiment : une molette
   posee DANS le cadre fait descendre le site qui est dedans, sans
   que la page derriere bouge d'un pixel. Cinq captures et l'ecart
   entre deux consecutives — regle B, « visible, sinon ca ne compte
   pas ». */
console.log("\n3 · LA VITRE — la molette fait descendre le site DANS le cadre");
{
  const { ctx, p } = await page();
  for (const id of CARTES) {
    await p.evaluate((i) => document.getElementById(i).scrollIntoView({ block: "center", behavior: "instant" }), id);
    await p.waitForTimeout(700);
    const b = await p.evaluate((i) => {
      const r = document.querySelector("#" + i + " .ba-scene").getBoundingClientRect();
      const v = document.querySelector("#" + i + " [data-ba-vitre]");
      return { x: r.left, y: r.top, w: r.width, h: r.height, course: v.scrollHeight - v.clientHeight };
    }, id);
    dire(b.course > 120, `${id} : ${b.course} px a defiler dans le cadre`);

    const pageAvant = await p.evaluate(() => Math.round(window.scrollY));
    await p.mouse.move(b.x + b.w * 0.5, b.y + b.h * 0.5);
    const fics = [];
    const pas = Math.max(60, Math.round(b.course / 5));
    for (let i = 0; i < 6; i++) {
      const f = path.join(OUT, `vitre-${id}-${i}.png`);
      await (await p.$("#" + id + " .ba-scene")).screenshot({ path: f });
      fics.push(f);
      await p.mouse.wheel(0, pas);
      await p.waitForTimeout(220);
    }
    const pageApres = await p.evaluate(() => Math.round(window.scrollY));
    const dedans = await p.evaluate((i) => Math.round(document.querySelector("#" + i + " [data-ba-vitre]").scrollTop), id);

    let mini = 100;
    const ecarts = [];
    for (let i = 1; i < fics.length; i++) {
      const d = diffStats(lire(fics[i - 1]), lire(fics[i]), 8).pct;
      ecarts.push(d.toFixed(2));
      if (d < mini) mini = d;
    }
    console.log(`         ecarts : ${ecarts.join(" · ")} %`);
    dire(mini > 0.8, `${id} : ecart minimal entre deux images ${mini.toFixed(2)} % — la descente se voit`);
    dire(dedans > 100, `${id} : le cadre a descendu de ${dedans} px`);
    /* LA PAGE DERRIERE NE BOUGE PAS. C'est la moitie de la demande :
       « ON PEUT SCROLLER DEDANS SOI-MEME, sans que la page derriere
       bouge ». Une tolerance de 2 px absorbe l'arrondi du defilement
       doux, rien de plus. */
    dire(Math.abs(pageApres - pageAvant) <= 2,
      `${id} : la page derriere n'a pas bouge (${pageAvant} → ${pageApres})`);
  }
  await ctx.close();
}

/* ---------- 4 · LA COHABITATION — c'est le vrai risque ----------
   Glisser la poignee et defiler dans le site sont deux gestes sur le
   MEME rectangle. Ils se battent si l'un capte ce qui appartient a
   l'autre — c'est deja arrive une fois : le champ `range`, etire sur
   toute la scene, prenait le pointeur, et la molette cherchait un
   conteneur defilant parmi SES ancetres. Elle n'en trouvait pas et
   remontait a la page : le cadre ne defilait jamais (D-629).
   On exige donc les deux sens : defiler ne deplace pas la poignee, et
   glisser la poignee ne deplace pas le cadre. */
console.log("\n4 · LA COHABITATION — poignee et defilement sur le meme rectangle");
{
  const { ctx, p } = await page();
  for (const id of CARTES) {
    await p.evaluate((i) => document.getElementById(i).scrollIntoView({ block: "center", behavior: "instant" }), id);
    await p.waitForTimeout(700);
    const b = await p.evaluate((i) => {
      const r = document.querySelector("#" + i + " .ba-scene").getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    }, id);
    const lu = () => p.evaluate((i) => ({
      part: Math.round(+getComputedStyle(document.querySelector("#" + i + " .ba-scene")).getPropertyValue("--ba-p").trim()),
      haut: Math.round(document.querySelector("#" + i + " [data-ba-vitre]").scrollTop)
    }), id);

    /* a · on pose la poignee a 20 %, puis on defile : elle ne bouge pas */
    await p.mouse.move(b.x + b.w * 0.5, b.y + b.h * 0.5);
    await p.mouse.down();
    await p.mouse.move(b.x + b.w * 0.20, b.y + b.h * 0.5, { steps: 6 });
    await p.mouse.up();
    await p.waitForTimeout(120);
    const a1 = await lu();
    await p.mouse.wheel(0, 240);
    await p.waitForTimeout(260);
    const a2 = await lu();
    dire(Math.abs(a1.part - 20) <= 2, `${id} : la poignee se pose a ${a1.part} %`);
    dire(a2.haut > a1.haut + 40, `${id} : le cadre descend malgre la poignee deplacee (${a1.haut} → ${a2.haut})`);
    dire(a2.part === a1.part, `${id} : defiler ne deplace pas la poignee (${a1.part} → ${a2.part})`);

    /* b · puis on reglisse la poignee : le cadre ne remonte pas */
    await p.mouse.move(b.x + b.w * 0.20, b.y + b.h * 0.5);
    await p.mouse.down();
    await p.mouse.move(b.x + b.w * 0.78, b.y + b.h * 0.5, { steps: 8 });
    await p.mouse.up();
    await p.waitForTimeout(140);
    const a3 = await lu();
    dire(Math.abs(a3.part - 78) <= 2, `${id} : la poignee glisse encore apres le defilement (${a3.part} %)`);
    dire(Math.abs(a3.haut - a2.haut) <= 4, `${id} : glisser la poignee ne deplace pas le cadre (${a2.haut} → ${a3.haut})`);

    for (const v of [4, 50, 96]) {
      await p.evaluate(([i, val]) => {
        const c = document.querySelector("#" + i + " [data-ba-curseur]");
        c.value = val;
        c.dispatchEvent(new Event("input", { bubbles: true }));
      }, [id, v]);
      await p.waitForTimeout(200);
      await (await p.$("#" + id + " .ba-scene")).screenshot({ path: path.join(OUT, `cohab-${id}-${String(v).padStart(3, "0")}.png`) });
    }
  }
  await ctx.close();
}

/* ---------- 5 · LE DOIGT NE SE FAIT PAS PIEGER ----------
   `overscroll-behavior: contain` est juste a la molette et FAUX au
   doigt : une fois le cadre au bout, le geste ne passe plus a la
   page, et sur un telephone le cadre occupe presque toute la
   largeur. On rend donc le chainage aux pointeurs grossiers.
   RESERVE, et elle est entiere : `pointer: coarse` emule sous
   Chromium n'est pas un telephone. On mesure la PROPRIETE, pas le
   geste — c'est tout ce que ce poste peut prouver. */
console.log("\n5 · LE DOIGT — le cadre ne piege pas la page");
{
  const ctx = await nav.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
    colorScheme: "light"
  });
  await ctx.addInitScript(() => { try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  await p.evaluate(() => document.getElementById("ba-garage").scrollIntoView({ block: "center", behavior: "instant" }));
  await p.waitForTimeout(600);
  const m = await p.evaluate(() => {
    const v = document.querySelector("#ba-garage [data-ba-vitre]");
    const s = document.querySelector("#ba-garage .ba-scene");
    return {
      chainage: getComputedStyle(v).overscrollBehaviorY,
      tactScene: getComputedStyle(s).touchAction,
      tactChamp: getComputedStyle(document.querySelector("#ba-garage [data-ba-curseur]")).touchAction,
      course: v.scrollHeight - v.clientHeight
    };
  });
  dire(m.chainage === "auto", `pointeur grossier : le chainage revient (${m.chainage})`);
  dire(m.tactScene === "pan-y", `la scene laisse le geste vertical (${m.tactScene})`);
  dire(m.tactChamp === "pan-y", `le champ laisse le geste vertical (${m.tactChamp})`);
  dire(m.course > 60, `il reste ${m.course} px a defiler dans le cadre a 390 px`);
  /* LA PRISE DE LA POIGNEE EST LA SEULE SURFACE QUI REFUSE LE
     DEFILEMENT.  D-640 Sans `touch-action: none` dessus, la vitre
     revendique le geste des le premier deplacement et la poignee se
     fige apres un pas : mesure du 2026-07-31, `--ba-p` 50 → 42. */
  const prise = await p.evaluate(() => {
    const cs = getComputedStyle(document.querySelector("#ba-garage .ba-trait"), "::after");
    const csb = getComputedStyle(document.querySelector("#ba-garage .ba-trait"), "::before");
    return { apres: cs.touchAction, avant: csb.touchAction, larg: cs.width, evAp: cs.pointerEvents };
  });
  dire(prise.apres === "none", `la colonne de prise refuse le defilement (${prise.apres})`);
  dire(prise.avant === "none", `le bouton de la poignee aussi (${prise.avant})`);
  dire(prise.evAp === "auto", `et elle recoit bien le pointeur (${prise.evAp})`);
  await (await p.$("#ba-garage")).screenshot({ path: path.join(OUT, "doigt-390.png") });
  await ctx.close();
}

/* ---------- 6 · LE VERROU EN POURCENTAGE ----------
   CE QUE CETTE SECTION MESURAIT, ET POURQUOI CE N'EST PLUS VRAI.
   Elle exigeait que les deux cotes aient la MEME HAUTEUR : chaque
   « apres » etait decoupe au rapport de la reconstitution d'en face
   (D-632). La regle « les deux cotes finissent a la meme ligne »
   etait juste, la maniere de la tenir ne l'etait pas — on montrait
   14 % du site du garage et le visiteur se bloquait au pied du site
   de 2011 avec huit mille pixels jamais vus.
   Les deux cotes sont maintenant ENTIERS et verrouilles en
   POURCENTAGE (D-645). On mesure donc la propriete qui compte
   vraiment : a mi-piste, chacun est a mi-course DE SA PROPRE
   hauteur ; au bout, chacun est a son pied. Laisser l'ancienne
   assertion en place l'aurait fait echouer sur un correctif, ou
   pousse a re-couper les images pour la faire passer. Piege 17. */
console.log("\n6 · LE VERROU — a mi-chemin d'un cote, a mi-chemin de l'autre");
{
  const { ctx, p } = await page();
  const paires = { "ba-garage": "garage", "ba-design": "design", "ba-restaurant": "restau", "ba-renovation": "deneigement" };
  for (const id of CARTES) {
    await p.evaluate((i) => document.getElementById(i).scrollIntoView({ block: "center", behavior: "instant" }), id);
    await p.waitForTimeout(500);
    const lu = (frac) => p.evaluate(({ i, frac }) => {
      const a = document.querySelector("#" + i);
      const v = a.querySelector("[data-ba-vitre]");
      const s = a.querySelector(".ba-scene");
      const img = a.querySelector(".ba-shot");
      v.scrollTop = (v.scrollHeight - v.clientHeight) * frac;
      return new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => {
        const W = s.clientWidth;
        const fen = (s.clientHeight / W) * 100;
        res({
          yAp: +a.querySelector(".ba-vue--apres .ba-page").style.getPropertyValue("--ba-y") || 0,
          yAv: +a.querySelector(".ba-vue--avant .ba-page").style.getPropertyValue("--ba-y") || 0,
          maxAp: (img.naturalHeight / img.naturalWidth) * 100 - fen,
          maxAv: +getComputedStyle(s).getPropertyValue("--ba-h-avant") || 0
        });
      })));
    }, { i: id, frac });

    const bas = await lu(1);
    /* AU BOUT : chacun a son pied. Une tolerance de 2 % absorbe le
       fait qu'une bande epinglee occupe de la piste sans faire
       avancer l'image. */
    const resteAp = bas.maxAp ? (1 - bas.yAp / bas.maxAp) * 100 : 0;
    const resteAv = bas.maxAv ? (1 - bas.yAv / bas.maxAv) * 100 : 0;
    dire(resteAp < 2, `${id} : au bout, il reste ${resteAp.toFixed(1)} % du site « apres » — le pied de page est atteint`);
    dire(resteAv < 2, `${id} : au bout, il reste ${resteAv.toFixed(1)} % de la reconstitution`);

    const mi = await lu(0.5);
    const pAp = mi.maxAp ? (mi.yAp / mi.maxAp) * 100 : 0;
    const pAv = mi.maxAv ? (mi.yAv / mi.maxAv) * 100 : 0;
    dire(Math.abs(pAv - 50) < 2, `${id} : a mi-piste, la reconstitution est a ${pAv.toFixed(1)} %`);
    /* Le cote « apres » peut s'ecarter de la moitie exacte quand une
       scene epinglee mange de la piste sans faire avancer l'image :
       c'est voulu, et c'est ce que fait le vrai site. On exige donc
       seulement qu'il soit franchement engage, jamais bloque. */
    dire(pAp > 25 && pAp < 75, `${id} : a mi-piste, le site « apres » est a ${pAp.toFixed(1)} %`);

    /* Le rapport de la reconstitution ne sert plus a decouper, mais
       il reste la reference de `demos-rapports.mjs` : s'il derive,
       c'est que la reconstitution a change et que les preuves sont
       a refaire. */
    const m = await p.evaluate((i) => {
      const av = document.querySelector("#" + i + " .ba-vue--avant");
      return { larg: av.getBoundingClientRect().width, avant: av.querySelector(".ba-page").scrollHeight };
    }, id);
    const rapportLu = m.avant / m.larg;
    const derive = Math.abs(rapportLu - RAPPORTS[paires[id]]) / RAPPORTS[paires[id]] * 100;
    dire(derive < 3, `${id} : rapport de la reconstitution ${rapportLu.toFixed(3)} contre ${RAPPORTS[paires[id]]} — derive ${derive.toFixed(1)} %`);
  }
  await ctx.close();
}

/* ---------- 6bis · LA LOUPE ----------  D-647
   On ne verifie pas qu'un dialogue s'ouvre : on verifie que c'est LE
   MEME cadre qui s'y trouve, que la course s'est recalculee, et
   qu'en fermant tout est revenu — y compris la place dans la page.
   Un cadre agrandi qui serait une COPIE passerait les trois
   premieres questions et raterait la quatrieme. */
console.log("\n6bis · LA LOUPE — le meme cadre, en grand");
{
  const { ctx, p } = await page();
  for (const id of CARTES) {
    await p.evaluate((i) => document.getElementById(i).scrollIntoView({ block: "center", behavior: "instant" }), id);
    await p.waitForTimeout(600);
    const avant = await p.evaluate((i) => {
      const s = document.querySelector("#" + i + " .ba-scene");
      const b = document.querySelector("#" + i + " [data-ba-ouvrir]");
      const cs = b ? getComputedStyle(b) : null;
      return {
        h: s.clientHeight,
        y: Math.round(window.scrollY),
        bouton: !!b,
        visible: cs ? cs.display !== "none" && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.5 : false,
        nom: b ? (b.textContent || "").trim().slice(0, 40) : ""
      };
    }, id);
    dire(avant.bouton && avant.visible, `${id} : le bouton d'agrandissement est visible en permanence`);
    dire(/Agrandir/.test(avant.nom), `${id} : et il porte un nom lisible — « ${avant.nom} »`);

    await p.click(`#${id} [data-ba-ouvrir]`);
    await p.waitForTimeout(700);
    const dedans = await p.evaluate((i) => {
      const d = document.getElementById("ba-loupe");
      const c = d.querySelector(".ba-cadre");
      const s = d.querySelector(".ba-scene");
      const v = d.querySelector("[data-ba-vitre]");
      return {
        ouverte: d.open,
        leMeme: !!(c && c.querySelector(".ba-shot")) && !document.querySelector("#" + i + " .ba-cadre"),
        h: s.clientHeight,
        course: v.scrollHeight - v.clientHeight,
        trou: !!document.querySelector(".ba-trou")
      };
    }, id);
    /* L'ANNEAU SE MESURE AU CLAVIER, PAS AU `focus()`.
       `:focus-visible` ne s'arme pas sur un focus pose par script :
       le navigateur ne le juge « visible » que quand il vient d'un
       geste clavier. Une premiere version appelait `f.focus()` et
       lisait le style — quatre faux echecs sur quatre, sur un anneau
       qui existe. On tabule donc, comme un visiteur. */
    await p.keyboard.press("Tab");
    await p.waitForTimeout(120);
    const anneau = await p.evaluate(() => {
      const a = document.activeElement;
      if (!a) return { ok: false, quoi: "aucun" };
      const cs = getComputedStyle(a);
      return {
        ok: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0,
        quoi: (a.className || a.tagName).toString().slice(0, 30)
      };
    });
    dedans.anneau = anneau.ok;
    dedans.focus = anneau.quoi;
    dire(dedans.ouverte, `${id} : la loupe s'ouvre`);
    dire(dedans.leMeme, `${id} : c'est LE MEME cadre — il n'est plus a sa place dans la grille`);
    dire(dedans.h > avant.h * 1.8, `${id} : la scene passe de ${avant.h} a ${dedans.h} px de haut`);
    dire(dedans.course > 1000, `${id} : la course s'est recalculee — ${dedans.course} px`);
    dire(dedans.trou, `${id} : un trou de la meme hauteur garde la place dans la grille`);
    dire(dedans.anneau, `${id} : au clavier, l element atteint porte un anneau — ${dedans.focus}`);

    await p.keyboard.press("Escape");
    await p.waitForTimeout(600);
    const apres = await p.evaluate((i) => ({
      fermee: !document.getElementById("ba-loupe").open,
      revenu: !!document.querySelector("#" + i + " .ba-cadre"),
      trou: !!document.querySelector(".ba-trou"),
      y: Math.round(window.scrollY)
    }), id);
    dire(apres.fermee && apres.revenu && !apres.trou, `${id} : Echap ferme, le cadre est revenu, le trou est retire`);
    dire(apres.y === avant.y, `${id} : on revient exactement ou on etait (${avant.y} → ${apres.y})`);
  }
  await ctx.close();
}

/* ---------- 7 · L'ARRET — mouvement reduit et palier 2 ----------
   Il n'y a plus de boucle a arreter : le mouvement est celui du
   visiteur, et un mouvement demande ne se coupe pas sous
   `prefers-reduced-motion`. Ce qu'on verifie, c'est qu'il ne reste
   AUCUNE animation en vol dans le cadre, et que le texte defilant de
   la maquette de 2011 — lui, une vraie animation permanente —
   s'arrete en restant lisible. */
console.log("\n7 · L'ARRET — mouvement reduit, palier 2");
{
  const { ctx, p } = await page({ reduit: true });
  await p.evaluate(() => document.getElementById("ba-garage").scrollIntoView({ block: "center", behavior: "instant" }));
  await p.waitForTimeout(700);
  const m = await p.evaluate(() => {
    const df = document.querySelector("#ba-garage .v11-defile span");
    const enVol = [...document.querySelectorAll("#ba-garage *")]
      .filter((e) => getComputedStyle(e).animationName !== "none").length;
    return {
      enVol,
      defile: df ? getComputedStyle(df).animationName : "—",
      pad: df ? getComputedStyle(df).paddingLeft : "—",
      partage: getComputedStyle(document.querySelector("#ba-garage .ba-scene")).getPropertyValue("--ba-p").trim(),
      course: (() => { const v = document.querySelector("#ba-garage [data-ba-vitre]"); return v.scrollHeight - v.clientHeight; })()
    };
  });
  dire(m.enVol === 0, `aucune animation en vol dans le cadre (${m.enVol})`);
  dire(m.defile === "none", `le texte defilant s'arrete (${m.defile})`);
  dire(m.pad === "0px", `et il reste LISIBLE a l'arret : padding-left = ${m.pad}`);
  dire(m.partage === "50", `le partage reste a 50 : ${m.partage}`);
  /* L'INFORMATION NE DEPEND JAMAIS DE L'ANIMATION : sous mouvement
     reduit on peut toujours descendre dans le cadre, a la molette
     comme au clavier. */
  dire(m.course > 120, `on peut toujours descendre dans le cadre : ${m.course} px`);
  await ctx.close();

  const { ctx: c2, p: p2 } = await page();
  await p2.evaluate(() => document.documentElement.setAttribute("data-palier", "2"));
  await p2.evaluate(() => document.getElementById("ba-garage").scrollIntoView({ block: "center", behavior: "instant" }));
  await p2.waitForTimeout(520);
  const n = await p2.evaluate(() => {
    const v = document.querySelector("#ba-garage [data-ba-vitre]");
    return { course: v.scrollHeight - v.clientHeight };
  });
  dire(n.course > 120, `palier 2 : le cadre defile toujours (${n.course} px)`);
  await c2.close();
}

/* ---------- 8 · SANS SCRIPT ---------- */
console.log("\n8 · SANS SCRIPT");
{
  const { ctx, p } = await page({ js: false });
  const s = await p.evaluate(() => ({
    cadre: getComputedStyle(document.querySelector("#ba-garage .ba-cadre")).display,
    note: getComputedStyle(document.querySelector(".ba-sans")).display,
    tetes: document.querySelectorAll("#realisations .ba-tete").length,
    pavés: document.querySelectorAll("#realisations .ba-dit, #realisations .ba-fin").length,
    avant: !!document.querySelector("#ba-garage .ba-vue--avant"),
    apres: !!document.querySelector("#ba-garage .ba-vue--apres"),
  }));
  /* Sans script, `differe.css` n'est jamais injecte : les maquettes
     n'auraient AUCUN style. On verifie qu'elles sont retirees et que
     ce qu'elles disent reste lisible en mots. */
  dire(s.cadre === "none", `le cadre est retire (${s.cadre})`);
  dire(s.note === "block", `la ligne de repli s'affiche (${s.note})`);
  dire(s.tetes === 4, `les quatre titres de comparaison restent lus : ${s.tetes}`);
  /* LES PAVES DESCRIPTIFS SONT PARTIS, ET CE TEST LES EMPECHE DE
     REVENIR. « Les gens ne lisent pas, ils regardent » — arbitrage du
     proprietaire, 2026-07-31. Le sous-titre de section porte deja la
     seule mention necessaire : entreprises fictives, pas des mandats. */
  dire(s.pavés === 0, `aucun pave descriptif sous les comparaisons : ${s.pavés}`);
  dire(s.avant && s.apres, "les deux maquettes restent dans le document");
  await (await p.$(".ba-grille")).screenshot({ path: path.join(OUT, "sans-script.png") });
  await ctx.close();
}

console.log(`\n${echecs === 0 ? "TOUT PASSE" : echecs + " ECHEC(S)"}   captures : ${OUT}`);
await nav.close();
process.exit(echecs === 0 ? 0 : 1);
