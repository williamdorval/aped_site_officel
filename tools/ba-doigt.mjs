/* ============================================================
   LE GLISSEMENT AU DOIGT, UNE COMPARAISON PAR PAGE NEUVE
   `node tools/ba-doigt.mjs [port]`

   POURQUOI CET OUTIL EXISTE A PART.
   `realisations-check.mjs` enchaine plusieurs gestes tactiles sur la
   MEME page. Relevé du 2026-07-31, et vérifié dans les deux sens de
   parcours : **seule la premiere sequence tactile d'une page aboutit**
   — les suivantes s'arretent apres un pas, quelle que soit la
   comparaison, y compris avec un `touchCancel` explicite et une
   seconde d'attente entre deux. En ordre inverse, c'est la
   renovation qui passe et les trois autres qui echouent : le defaut
   suit le RANG, pas la comparaison.

   Ce n'est donc pas la page qui casse, c'est l'injection tactile qui
   ne se remet pas. On ne discute pas avec l'instrument : **une page
   neuve par comparaison, un seul geste chacune.** C'est plus lent et
   c'est vrai.

   RESERVE, et elle est entiere : `hasTouch` sous Chromium n'est pas
   un telephone. Ce qui est prouve ici, c'est qu'un geste tactile pose
   sur la PRISE de la poignee la deplace et la fait suivre. Ce qui ne
   l'est pas, c'est le comportement d'un vrai doigt sur un vrai
   ecran.
   ============================================================ */
import { chromium } from "playwright";

const PORT = process.argv[2] || "8123";
const BASE = `http://localhost:${PORT}/index.html`;
const CARTES = ["ba-garage", "ba-design", "ba-restaurant", "ba-renovation"];

let echecs = 0;
const dire = (ok, txt) => { if (!ok) echecs++; console.log(`  ${ok ? "OK    " : "ECHEC "} ${txt}`); };

const nav = await chromium.launch();
console.log("LE DOIGT SUR LA PRISE — une page neuve par comparaison");

for (const id of CARTES) {
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 1000 }, hasTouch: true, colorScheme: "light" });
  await ctx.addInitScript(() => { try { sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {} });
  const p = await ctx.newPage();
  p.on("console", (m) => { if (m.type() === "error") { echecs++; console.log("  ECHEC  console : " + m.text()); } });
  await p.goto(BASE, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  await p.evaluate((i) => document.querySelector("#" + i).scrollIntoView({ block: "center", behavior: "instant" }), id);
  /* ON LAISSE LA DEMONSTRATION D'OUVERTURE FINIR.  A79
     La premiere comparaison joue toute seule, une fois, 700 ms apres
     son entree et pendant 760 ms : elle va de 100 vers 50 pour dire
     au visiteur que ca se glisse. Un geste lance dedans se superpose
     a elle, et la valeur lue est celle de la SOMME. Premier relevé
     du 2026-07-31 : 40 → 76, 28 → 64, 18 → 55 — un ecart constant de
     36 %, donc pas un blocage, un decalage. Le seul cadre touche
     etait le premier ; les trois autres rendaient 0 %. C'est la
     signature d'une animation, pas d'un defaut de glissement. */
  await p.waitForTimeout(2400);

  const b = await p.evaluate((i) => {
    const r = document.querySelector("#" + i + " .ba-scene").getBoundingClientRect();
    const t = document.querySelector("#" + i + " .ba-trait").getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height, tx: Math.round(t.left + t.width / 2), ty: Math.round(t.top + t.height / 2) };
  }, id);

  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: b.tx, y: b.ty }] });
  const suivis = [];
  for (const k of [0.40, 0.28, 0.18]) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: Math.round(b.x + b.w * k), y: b.ty }] });
    await new Promise((r) => setTimeout(r, 90));
    const v = await p.evaluate((i) => Math.round(+getComputedStyle(document.querySelector("#" + i + " .ba-scene")).getPropertyValue("--ba-p")), id);
    suivis.push({ vise: Math.round(k * 100), lu: v });
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });

  /* ON EXIGE QUE LA VALEUR SUIVE LE DOIGT, pas seulement qu'elle
     bouge : une poignee qui fait un pas puis se fige passait pour
     vivante (piege 36). */
  const pire = Math.max.apply(null, suivis.map((s) => Math.abs(s.lu - s.vise)));
  dire(pire <= 2, `${id} : ${suivis.map((s) => s.vise + "→" + s.lu).join(" · ")} — ecart maximal ${pire} %`);

  /* Et le cadre defile toujours quand le doigt se pose AILLEURS. */
  await p.evaluate((i) => { document.querySelector("#" + i + " [data-ba-vitre]").scrollTop = 0; }, id);
  const loin = Math.round(b.x + b.w * 0.88);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: loin, y: b.y + b.h * 0.75 }] });
  for (const d of [50, 110, 170]) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: loin, y: Math.round(b.y + b.h * 0.75 - d) }] });
    await new Promise((r) => setTimeout(r, 80));
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await p.waitForTimeout(400);
  const apres = await p.evaluate((i) => ({
    dedans: Math.round(document.querySelector("#" + i + " [data-ba-vitre]").scrollTop),
    part: Math.round(+getComputedStyle(document.querySelector("#" + i + " .ba-scene")).getPropertyValue("--ba-p"))
  }), id);
  dire(apres.dedans > 60, `${id} : hors de la prise, le doigt fait descendre le cadre de ${apres.dedans} px`);
  dire(Math.abs(apres.part - suivis[suivis.length - 1].lu) <= 1, `${id} : et il ne deplace pas la poignee (${apres.part} %)`);
  await ctx.close();
}

await nav.close();
console.log(`\n${echecs === 0 ? "TOUT PASSE" : echecs + " ECHEC(S)"}`);
process.exit(echecs === 0 ? 0 : 1);
