/* ============================================================
   LE BUDGET DE DEGRADATION — verification.

   Un budget qu'on ecrit sans le tester est un commentaire. Ce
   script verifie les trois paliers pour de vrai, chacun par son
   declencheur reel :

   · PALIER 0 — machine de bureau, large, pointeur fin. Tout est la.
   · PALIER 1 — declencheur STATIQUE. Trois cas independants, testes
     separement : ecran etroit, pointeur grossier, et peu de coeurs
     ou peu de memoire (`navigator` est truque a l'initialisation,
     comme le ferait un vrai appareil d'entree de gamme).
   · PALIER 2 — declencheur MESURE. On ne truque rien : on BRIDE LE
     PROCESSEUR par le protocole DevTools, on defile, et on verifie
     que la page s'en apercoit toute seule et retire ce qu'il faut.

   On verifie aussi les deux proprietes qui rendent le budget sur :
   · l'escalade est A SENS UNIQUE — un palier ne redescend jamais,
     sinon la page scintille entre deux etats ;
   · l'ORIENTATION ne tombe a aucun palier. C'est le plancher.
   ============================================================ */
import { chromium } from "playwright";

const B = process.argv[2] || "http://localhost:8099";
const nav = await chromium.launch();

let echecs = 0;
const dire = (ok, t) => { console.log((ok ? "  OK   " : "  ECHEC") + "  " + t); if (!ok) echecs++; };

/* LE TAUX DE BRIDAGE EST UN REGLAGE D'INSTRUMENT, PAS UNE
   SPECIFICATION. Le palier 2 se declenche sous 50 i/s medians.
   A x6, cette machine rendait encore 60 i/s le 2026-07-29 : le test
   ne testait donc RIEN — il rendait « palier 0 » et DEUX echecs qui
   accusaient le code alors que le fautif etait l'instrument, trop
   faible pour atteindre le declencheur. C'est le meme piege qu'un
   detecteur qui n'attend pas assez : l'outil ne dit pas « je n'ai
   pas reussi a declencher », il dit « ca ne se declenche pas ».
   Si une machine future redevient trop rapide, c'est ce nombre
   qu'on monte — jamais le seuil du site. */
const BRIDE = Number(process.env.APED_BRIDE || 20);

async function sonder(nom, opts = {}) {
  const ctx = await nav.newContext({
    viewport: opts.viewport || { width: 1440, height: 900 },
    hasTouch: !!opts.tactile,
    isMobile: !!opts.tactile,
    deviceScaleFactor: 1
  });
  const page = await ctx.newPage();

  if (opts.faible) {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 4 });
      Object.defineProperty(navigator, "deviceMemory", { get: () => 4 });
    });
  }
  /* `aped-entree-saut` n'existe plus : le drapeau qui memorisait un
     saut a ete supprime le 2026-07-29, parce que n'importe quel clic
     le posait et tuait la composition du hero pour tout l'onglet.
     La sequence joue donc ici comme chez un visiteur.
     `aped-sans-popup`, lui, reste indispensable : un `<dialog>`
     ouvert capture tous les evenements de pointeur. */
  await page.addInitScript(() => { try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });

  let cdp = null;
  if (opts.bride) {
    cdp = await ctx.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: opts.bride });
  }

  await page.goto(B + "/", { waitUntil: "load" });
  await page.mouse.move(700, 400);
  await page.waitForTimeout(opts.bride ? 4500 : 2000);

  /* Un defilement REEL : c'est la seule chose qui alimente la
     mesure de frequence d'images. */
  const h = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let i = 0; i < 40; i++) {
    await page.evaluate((v) => window.scrollBy(0, v), Math.round(h / 60));
    await page.waitForTimeout(opts.bride ? 60 : 30);
  }
  await page.waitForTimeout(opts.bride ? 1200 : 500);

  const r = await page.evaluate(() => {
    const html = document.documentElement;
    /* `.nav-cta` ouvre `modal-start` : c'est un CTA PRIMAIRE, donc
       520 ms.

       LE BOUTON SECONDAIRE DE REFERENCE A CHANGE, ET CE TEST
       VERROUILLAIT UN DEFAUT. Il prenait « Estimation en 60
       secondes » — `[data-modal-open="modal-estimate"]` — comme
       exemple de bouton a 230 ms. Or ce bouton a vingt-deux
       lettres : 230 ms font 10,5 ms par lettre, c'est-a-dire une
       cascade que l'oeil ne peut pas lire. Le chantier 01 a fait
       passer les DEUX boutons du hero a 520 ms pour cette raison
       precise. Le test affirmait donc que le second CTA le plus
       important du site devait garder un effet invisible.

       La reference est maintenant un vrai bouton secondaire, hors
       hero : le telechargement du document, dans l'appat du
       calculateur. Et on verifie EN PLUS que le fantome du hero est
       bien monte a 520 ms — sinon rien ne garderait la correction. */
    const btn = document.querySelector(".appat .btn");
    const cta = document.querySelector(".nav-cta");
    const ghost = document.querySelector(".hero-cta .btn--ghost");
    return {
      palier: html.getAttribute("data-palier"),
      images: html.getAttribute("data-images"),
      mots: document.querySelectorAll(".mot-encre").length,
      etiquette: !!document.querySelector(".pointe-mot"),
      cran: btn ? getComputedStyle(btn).getPropertyValue("--cran").trim() : "",
      cranCta: cta ? getComputedStyle(cta).getPropertyValue("--cran").trim() : "",
      cranGhost: ghost ? getComputedStyle(ghost).getPropertyValue("--cran").trim() : "",
      /* L'ORIENTATION — le plancher. */
      reste: (document.getElementById("railLeftNum") || {}).textContent || "",
      etape: (document.getElementById("parcNum") || {}).textContent || "",
      chantier: (document.getElementById("svcNum") || {}).textContent || "",
      curseur: !!document.querySelector(".rail-curseur.is-on"),
      /* LES DOUZE FRONTIERES. Le CRAN du seuil est du N1 : il vit
         dans `main.js` et ne tombe a aucun palier. Le geste propre
         a chaque frontiere (G4), lui, tombe au palier 2. */
      seuilsCrantes: document.querySelectorAll('[data-seuil][data-cran="fait"]').length,
      seuilsTotal: document.querySelectorAll("[data-seuil]").length,
      seuilNumeroJuste: (() => {
        const s = [...document.querySelectorAll("[data-seuil]")].find((e) => {
          const r = e.getBoundingClientRect();
          return r.top < innerHeight && r.bottom > 0;
        });
        if (!s) return null;
        const r = s.querySelector(".seuil-roul");
        const cells = [...r.children].map((c) => c.textContent);
        const m = /matrix.*?,\s*(-?[\d.]+)\)$/.exec(getComputedStyle(r).transform);
        const em = parseFloat(getComputedStyle(s.querySelector(".seuil-num")).height);
        const i = m ? Math.round(-parseFloat(m[1]) / em) : 0;
        return { montre: cells[i], attendu: s.dataset.vers, juste: cells[i] === s.dataset.vers };
      })(),
      lecture: (document.getElementById("readBar") || { style: {} }).style.getPropertyValue("--read")
    };
  });

  await ctx.close();
  return { nom, ...r };
}

console.log("\nPALIER 0 — bureau, large, pointeur fin");
{
  const r = await sonder("plein");
  dire(r.palier === "0", `data-palier = ${r.palier}`);
  dire(r.mots > 100, `mots d'encre poses : ${r.mots}`);
  dire(r.cran === "230ms", `--cran d'un bouton secondaire : ${r.cran}`);
  dire(r.cranCta === "520ms", `--cran d'un CTA primaire : ${r.cranCta}`);
  /* LA CORRECTION DU CHANTIER 01, GARDEE ICI. Sans cette ligne,
     rien n'empecherait le fantome du hero de retomber a 230 ms —
     c'est-a-dire 10,5 ms par lettre sur vingt-deux lettres, une
     cascade que personne ne voit. */
  dire(r.cranGhost === "520ms", `--cran du fantome du hero : ${r.cranGhost}`);
}

console.log("\nPALIER 1 — trois declencheurs statiques, testes separement");
for (const [nom, opts] of [
  ["ecran etroit (390 px)", { viewport: { width: 390, height: 844 } }],
  ["pointeur grossier", { tactile: true, viewport: { width: 1440, height: 900 } }],
  ["4 coeurs / 4 Go", { faible: true }]
]) {
  const r = await sonder(nom, opts);
  dire(r.palier === "1", `${nom.padEnd(24)} -> data-palier = ${r.palier}`);
  dire(r.mots === 0, `${nom.padEnd(24)} -> chapos NON decoupes (${r.mots} spans)`);
  dire(!r.etiquette, `${nom.padEnd(24)} -> etiquette de pointe absente`);
}

console.log("\nPALIER 2 — declencheur mesure, processeur bride x" + BRIDE + "");
{
  const r = await sonder("bride", { bride: BRIDE });
  dire(r.palier === "2", `data-palier = ${r.palier} (mesure : ${r.images} i/s)`);
  dire(r.cran === "0ms" && r.cranCta === "0ms" && r.cranGhost === "0ms",
    `--cran ramene a ${r.cran} / ${r.cranCta} / ${r.cranGhost} : tous les boutons basculent d'un bloc`);
  console.log(`         frequence relevee par la page elle-meme : ${r.images} i/s`);
}

console.log("\nL'ORIENTATION NE TOMBE A AUCUN PALIER");
for (const [nom, opts] of [
  ["palier 0", {}],
  ["palier 1", { viewport: { width: 390, height: 844 } }],
  ["palier 2", { bride: BRIDE }]
]) {
  const r = await sonder(nom, opts);
  const ok = r.reste.trim() !== "" && r.etape.trim() !== "" &&
             r.chantier.trim() !== "" && r.curseur;
  dire(ok, `${nom} -> restantes « ${r.reste.trim()} », etape « ${r.etape.trim()} », chantier « ${r.chantier.trim()} », curseur ${r.curseur ? "pose" : "ABSENT"}`);
  /* Le numero du seuil dit lui aussi « ou on est ». Il doit donc
     etre JUSTE a tous les paliers, y compris quand plus rien ne
     roule : au repos la bande montre deja la bonne valeur. */
  dire(r.seuilsCrantes > 0, `${nom} -> seuils crantes : ${r.seuilsCrantes} / ${r.seuilsTotal}`);
  dire(!r.seuilNumeroJuste || r.seuilNumeroJuste.juste,
    `${nom} -> numero du seuil a l'ecran : « ${r.seuilNumeroJuste ? r.seuilNumeroJuste.montre : "(hors ecran)"} »`);
}

console.log("\nL'ESCALADE EST A SENS UNIQUE");
{
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  /* `aped-entree-saut` n'existe plus : le drapeau qui memorisait un
     saut a ete supprime le 2026-07-29, parce que n'importe quel clic
     le posait et tuait la composition du hero pour tout l'onglet.
     La sequence joue donc ici comme chez un visiteur.
     `aped-sans-popup`, lui, reste indispensable : un `<dialog>`
     ouvert capture tous les evenements de pointeur. */
  await page.addInitScript(() => { try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: BRIDE });
  await page.goto(B + "/", { waitUntil: "load" });
  await page.mouse.move(700, 400);
  await page.waitForTimeout(4500);
  const h = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let i = 0; i < 40; i++) {
    await page.evaluate((v) => window.scrollBy(0, v), Math.round(h / 60));
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(1200);
  const monte = await page.evaluate(() => document.documentElement.getAttribute("data-palier"));

  /* La machine « respire » : on retire le bridage et on redefile. */
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  for (let i = 0; i < 40; i++) {
    await page.evaluate((v) => window.scrollBy(0, -v), Math.round(h / 60));
    await page.waitForTimeout(20);
  }
  await page.waitForTimeout(1500);
  const apres = await page.evaluate(() => document.documentElement.getAttribute("data-palier"));
  dire(monte === "2" && apres === "2",
    `bride -> palier ${monte}, puis debride -> palier ${apres} (doit rester ${monte})`);
  await ctx.close();
}

await nav.close();
console.log(`\n${echecs === 0 ? "LE BUDGET DE DEGRADATION TIENT" : echecs + " ECHEC(S)"}\n`);
process.exit(echecs ? 1 : 0);
