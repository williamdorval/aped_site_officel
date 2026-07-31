/* ============================================================
   LA BOUCLE DE VIE DES HUIT PLAQUES
   `node tools/plaques-vie.mjs [port]`

   Neuf relevés, et chacun répond à UNE promesse du brief. Aucun ne
   se contente de vérifier qu'une propriété CSS existe : une
   animation déclarée qu'on ne voit pas ne compte pas, c'est la
   règle qui gouverne ce dépôt.

   1. EXISTE      la classe, l'animation, la durée par plaque
   2. VISIBLE     six captures d'un cadre FIXE + écarts de pixels,
                  plus le déplacement réel de chaque plaque en px
   3. SURVOL      le survol d'UNE plaque arrête les HUIT
   4. FRANC       l'arrêt ne dure pas plus d'une image : on échantillonne
                  image par image après l'entrée du curseur
   5. REPRISE     le retrait du curseur relance, et relance TOUT
   6. HORS-ECRAN  `[data-repos]` et gel effectif quand la bande sort
   7. ONGLET      idem quand l'onglet passe en arrière-plan (CDP)
   8. LISIBLE     aucun chevauchement de plaques, contraste du texte
                  mesuré à douze phases tirées au hasard du cycle
   9. TENUE       images par seconde pendant que la boucle tourne ET
                  qu'on défile en même temps

   DEUX PIEGES D'INSTRUMENT DEJA PAYES AILLEURS DANS CE DEPOT, ET
   EVITES ICI :
   · le cadre d'une suite de captures doit être FIXE, sinon deux
     images de tailles différentes rendent 100 % d'écart, un chiffre
     qui ne veut rien dire ;
   · le popup cadeau capture tous les événements de pointeur dès
     qu'il s'ouvre en `showModal()`, et fait donc expirer n'importe
     quel survol en accusant le mauvais coupable. On le neutralise
     avant la première image.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { decodePNG, diffStats } from "./_png.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PORT = process.argv[2] || "8099";
const BASE = `http://127.0.0.1:${PORT}`;
const SORTIE = path.join(RACINE, "refonte-captures", "plaques-vie");
fs.mkdirSync(SORTIE, { recursive: true });

const rapport = {};
const nb = (n) => String(n).padStart(2, "0");

async function ouvrir(nav, opts = {}) {
  const ctx = await nav.newContext({
    viewport: { width: opts.w || 1440, height: opts.h || 900 },
    reducedMotion: opts.reduit ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  page._erreurs = [];
  page.on("pageerror", (e) => page._erreurs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") page._erreurs.push(m.text()); });
  await page.addInitScript(() => {
    try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {}
  });
  await page.goto(BASE + "/index.html", { waitUntil: "load" });
  /* La vague 2 arrive au premier geste ou a 1,2 s : `est-vivante`
     est posee par `langue.js`, donc il faut l'attendre. */
  await page.waitForTimeout(2200);
  return page;
}

/* ------------------------------------------------------------
   LIRE LA POSE — DEUX PIEGES D'INSTRUMENT, TOUS DEUX PAYES ICI.

   1. `getComputedStyle(el).transform` NE CONTIENT PAS la boucle.
      Premiere version de cette sonde : elle lisait la matrice de
      `transform` et en extrayait l'angle. Resultat : `dangle 0°` sur
      les huit plaques, alors que la rotation tournait bel et bien.
      La raison est dans la conception meme du correctif : la pose de
      repos vit dans `transform`, la boucle dans les proprietes
      INDIVIDUELLES `translate` et `rotate`. Ce sont deux proprietes
      differentes, et `transform` ne sait rien des deux autres.
      Une sonde qui n'aurait rendu que ce chiffre aurait fait
      conclure « la rotation ne marche pas » et fait rechercher un
      defaut qui n'existait pas. On lit donc les deux et on rend
      l'angle TOTAL, qui est le seul que l'oeil voit.

   2. LES COORDONNEES SONT RELATIVES AU DOCUMENT, PAS A LA VUE.
      `getBoundingClientRect()` est relatif a la vue : des que la page
      defile — ou que `content-visibility: auto` remplace la hauteur
      RESERVEE d'une section par sa hauteur reelle — tout se decale.
      Le releve « hors ecran » rendait ainsi 2 078 px d'amplitude sur
      une bande a l'arret : c'etait le document qui se recomposait
      sous elle, pas la plaque qui bougeait. On ajoute donc le
      defilement, et l'amplitude redevient celle de la plaque seule.
   ------------------------------------------------------------ */
const POSES = () => [...document.querySelectorAll(".plaque")].map((p, i) => {
  const corps = p.querySelector(".plaque-corps");
  const r = corps.getBoundingClientRect();
  const cs = getComputedStyle(corps);
  const m = new DOMMatrixReadOnly(cs.transform);
  /* La pose de repos, ecrite dans le document, portee par `transform`. */
  const repos = Math.atan2(m.b, m.a) * 180 / Math.PI;
  /* La boucle, portee par la propriete individuelle `rotate`. Elle
     rend « none » hors animation, et « 0.83deg » pendant. */
  const boucle = parseFloat(cs.rotate) || 0;
  /* ----------------------------------------------------------
     3. LA MESURE QUI ISOLE LA BOUCLE EST LOCALE, PAS ABSOLUE.
     Le corps est dans une COQUE, et c'est la coque que GSAP fait
     deriver au defilement. Une position absolue melange donc trois
     choses : la boucle, la derive au defilement, et la recomposition
     du document par `content-visibility`. Le releve « hors ecran »
     rendait ainsi 3 a 6 px d'amplitude alors que l'animation etait
     bel et bien declaree `paused` — deux affirmations contradictoires
     dans le meme relevé, donc au moins une fausse.
     `corps - coque` ne contient QUE ce que la boucle a ecrit. C'est
     cette valeur qui decide, et l'absolue reste rendue comme
     contexte.
     ---------------------------------------------------------- */
  const rc = p.getBoundingClientRect();
  return {
    i,
    x: +(r.left + window.scrollX).toFixed(2),
    y: +(r.top + window.scrollY).toFixed(2),
    lx: +(r.left - rc.left).toFixed(2),
    ly: +(r.top - rc.top).toFixed(2),
    ang: +(repos + boucle).toFixed(3),
    angBoucle: +boucle.toFixed(3),
  };
});

function ecarts(suite) {
  /* Pour chaque plaque, l'amplitude vue sur toute la suite. */
  const n = suite[0].length;
  const out = [];
  for (let i = 0; i < n; i++) {
    const xs = suite.map((s) => s[i].x);
    const ys = suite.map((s) => s[i].y);
    const as = suite.map((s) => s[i].ang);
    const lxs = suite.map((s) => s[i].lx);
    const lys = suite.map((s) => s[i].ly);
    out.push({
      plaque: i + 1,
      dx: +(Math.max(...xs) - Math.min(...xs)).toFixed(2),
      dy: +(Math.max(...ys) - Math.min(...ys)).toFixed(2),
      /* `ldx` / `ldy` : la boucle seule, coque deduite. C'est la
         mesure qui decide « ca bouge » et « c'est gele ». */
      ldx: +(Math.max(...lxs) - Math.min(...lxs)).toFixed(2),
      ldy: +(Math.max(...lys) - Math.min(...lys)).toFixed(2),
      dang: +(Math.max(...as) - Math.min(...as)).toFixed(3),
    });
  }
  return out;
}

/* Echantillonne la pose N fois, toutes les `ms`. */
async function suivre(page, n, ms) {
  const suite = [];
  for (let k = 0; k < n; k++) {
    suite.push(await page.evaluate(POSES));
    if (k < n - 1) await page.waitForTimeout(ms);
  }
  return suite;
}

/* AMENER LA BANDE DANS L'ECRAN, PAR PAS, AVANT DE MESURER QUOI QUE
   CE SOIT.

   A 1440 x 900 la bande des plaques commence exactement au bas de la
   vue : son cadre releve sans defiler rend `height: 0`, et
   `page.screenshot({ clip })` leve. Ce n'est pas un detail de
   cadrage, c'est le piege deja paye deux fois dans ce depot — un
   cadre se RELEVE, il ne se devine pas, et il se releve APRES avoir
   amene la cible.

   On defile par pas et non d'un saut : un `scrollTo` qui saute casse
   un pin de ScrollTrigger, et la derive des plaques est justement
   pilotee par un ScrollTrigger.

   On s'arrete a une position ou la bande est ENTIEREMENT dans la vue
   si elle y tient, sinon on cadre son haut. Et on laisse la derive
   se reposer : le scrub a 0,5 s de retard, donc mesurer trop tot
   melangerait la boucle de vie avec la fin du scrub. */
async function amenerLaBande(page) {
  await page.evaluate(async () => {
    const bande = document.querySelector("[data-plaques]");
    const haut = bande.getBoundingClientRect().top + window.scrollY;
    const h = bande.getBoundingClientRect().height;
    const cible = Math.max(0, Math.round(haut - Math.max(0, (window.innerHeight - h) / 2)));
    const depart = window.scrollY;
    const pas = 240;
    for (let y = depart; y < cible; y += pas) {
      window.scrollTo(0, Math.min(y, cible));
      await new Promise((r) => setTimeout(r, 50));
    }
    window.scrollTo(0, cible);
  });
  /* 1,2 s : le scrub porte 0,5 s de retard, et il faut le laisser
     arriver au repos pour que la seule chose qui bouge ensuite soit
     la boucle de vie. */
  await page.waitForTimeout(1200);
}

/* Le cadre de la bande, releve dans la page et jamais devine. Un
   cadre fixe est la condition pour que `diffStats` veuille dire
   quelque chose. */
async function cadreBande(page) {
  return page.evaluate(() => {
    const b = document.querySelector("[data-plaques]");
    const r = b.getBoundingClientRect();
    return {
      x: Math.max(0, Math.round(r.left)),
      y: Math.max(0, Math.round(r.top)),
      width: Math.min(Math.round(r.width), window.innerWidth - Math.max(0, Math.round(r.left))),
      height: Math.min(Math.round(r.height), window.innerHeight - Math.max(0, Math.round(r.top))),
    };
  });
}

const nav = await chromium.launch();

/* ============================================================
   1 · EXISTE
   ============================================================ */
{
  const page = await ouvrir(nav);
  const r = await page.evaluate(() => {
    const bande = document.querySelector("[data-plaques]");
    return {
      palier: document.documentElement.getAttribute("data-palier"),
      estVivante: bande.classList.contains("est-vivante"),
      repos: bande.hasAttribute("data-repos"),
      plaques: [...bande.querySelectorAll(".plaque-corps")].map((c) => {
        const cs = getComputedStyle(c);
        return {
          nom: cs.animationName,
          duree: cs.animationDuration,
          retard: cs.animationDelay,
          etat: cs.animationPlayState,
          courbe: cs.animationTimingFunction,
        };
      }),
    };
  });
  rapport.existe = r;
  console.log("\n=== 1 · EXISTE ===");
  console.log("  palier :", r.palier, "· est-vivante :", r.estVivante, "· data-repos :", r.repos);
  r.plaques.forEach((p, i) =>
    console.log(`  ${nb(i + 1)}  ${p.nom.padEnd(12)} ${p.duree.padEnd(8)} retard ${p.retard.padEnd(8)} ${p.etat}`));
  const toutes = r.plaques.length === 8 && r.plaques.every((p) => p.nom === "plaque-vie" && p.etat === "running");
  console.log("  VERDICT :", toutes ? "les huit tournent" : "*** MANQUE ***");
  console.log("  durées distinctes :", new Set(r.plaques.map((p) => p.duree)).size,
              "· retards distincts :", new Set(r.plaques.map((p) => p.retard)).size);
  rapport.existe.verdict = toutes;
  await page.close();
}

/* ============================================================
   2 · VISIBLE — le seul relevé qui compte vraiment.
   ============================================================ */
{
  const page = await ouvrir(nav);
  await amenerLaBande(page);
  const cadre = await cadreBande(page);
  console.log("\n=== 2 · VISIBLE ===");
  console.log("  cadre relevé dans la page :", JSON.stringify(cadre));

  /* Six captures sur 3,5 s, soit environ la demi-periode de la
     plaque la plus rapide : c'est la fenetre ou la course est
     maximale. */
  const images = [];
  const suite = [];
  for (let k = 0; k < 6; k++) {
    suite.push(await page.evaluate(POSES));
    const f = path.join(SORTIE, `vie-${nb(k)}.png`);
    await page.screenshot({ path: f, clip: cadre });
    images.push(decodePNG(fs.readFileSync(f)));
    if (k < 5) await page.waitForTimeout(700);
  }

  const diffs = [];
  for (let k = 1; k < images.length; k++) diffs.push(diffStats(images[k - 1], images[k]));
  const amp = ecarts(suite);

  console.log("  écarts de pixels entre deux captures consécutives :");
  diffs.forEach((d, k) => console.log(`    ${nb(k)}→${nb(k + 1)}  ${String(d.pct).padStart(6)} %  moyenne ${d.moy}  max ${d.max}`));
  console.log("  déplacement réel mesuré sur les six poses :");
  amp.forEach((a) => console.log(`    plaque ${a.plaque}  boucle seule ldx ${String(a.ldx).padStart(6)} px  ldy ${String(a.ldy).padStart(6)} px  dangle ${String(a.dang).padStart(6)}°   (absolu dx ${a.dx} dy ${a.dy})`));

  const bougentToutes = amp.every((a) => a.ldy >= 3 || a.ldx >= 2 || a.dang >= 0.3);
  const pixelsBougent = diffs.every((d) => d.pct > 0.5);
  console.log("  VERDICT visible :", bougentToutes && pixelsBougent ? "OUI — les huit bougent et les pixels le montrent" : "*** NON ***");
  rapport.visible = { cadre, diffs, amplitudes: amp, verdict: bougentToutes && pixelsBougent };
  await page.close();
}

/* ============================================================
   3 · SURVOL — une plaque survolée, huit plaques arrêtées.
   4 · FRANC   — l'arrêt tient en une image.
   5 · REPRISE — et ça repart.
   ============================================================ */
{
  const page = await ouvrir(nav);
  await amenerLaBande(page);
  console.log("\n=== 3-4-5 · SURVOL, FRANC, REPRISE ===");

  const boite = await page.evaluate(() => {
    const p = document.querySelectorAll(".plaque")[2];
    const r = p.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });

  /* LA FENETRE D'OBSERVATION DOIT COUVRIR AU MOINS UNE DEMI-PERIODE
     DE LA PLAQUE LA PLUS LENTE. Premiere version : quatre poses a
     250 ms, soit 750 ms. La huitieme plaque, dont l'amplitude
     verticale est la plus faible et la courbe la plus plate pres de
     ses extremums, rendait alors moins de 2 px et le releve
     concluait « 7 / 8 bougent ». Ce n'etait pas un defaut de la
     boucle, c'etait une fenetre trop courte. La plaque la plus lente
     tourne en 10,6 s : cinq poses a 600 ms couvrent 2,4 s, assez
     pour qu'aucune phase ne puisse cacher le mouvement. */
  const avant = await suivre(page, 5, 600);
  const ampAvant = ecarts(avant);

  await page.mouse.move(boite.x, boite.y);
  /* FRANC : cinq poses a 16 ms d'intervalle, soit image par image a
     60 Hz. La premiere peut encore porter la valeur d'avant — une
     image d'ecart est le plancher physique. A partir de la seconde,
     plus rien ne doit bouger. */
  const juste = await suivre(page, 5, 16);
  const ampFranc = ecarts(juste.slice(1));

  const pendant = await suivre(page, 5, 320);
  const ampPendant = ecarts(pendant);
  const etats = await page.evaluate(() =>
    [...document.querySelectorAll(".plaque-corps")].map((c) => getComputedStyle(c).animationPlayState));

  /* On sort la souris hors de la bande, pas seulement hors de la
     plaque : un gap de grille n'est pas un survol de plaque, et
     confondre les deux donnerait un faux verdict. */
  await page.mouse.move(4, 4);
  await page.waitForTimeout(120);
  const apres = await suivre(page, 5, 320);
  const ampApres = ecarts(apres);
  const etatsApres = await page.evaluate(() =>
    [...document.querySelectorAll(".plaque-corps")].map((c) => getComputedStyle(c).animationPlayState));

  const gele = ampPendant.every((a) => a.ldy < 0.6 && a.ldx < 0.6 && a.dang < 0.05);
  const franc = ampFranc.every((a) => a.ldy < 0.6 && a.ldx < 0.6 && a.dang < 0.05);
  const repart = ampApres.filter((a) => a.ldy >= 2 || a.ldx >= 1.5 || a.dang >= 0.2).length;
  const bougeAvant = ampAvant.filter((a) => a.ldy >= 2 || a.ldx >= 1.5 || a.dang >= 0.2).length;

  console.log("  avant survol, plaques qui bougent :", bougeAvant, "/ 8");
  console.log("  états pendant le survol :", [...new Set(etats)].join(", "));
  console.log("  amplitude pendant le survol (doit être ~0) :");
  ampPendant.forEach((a) => console.log(`    plaque ${a.plaque}  ldx ${a.ldx}  ldy ${a.ldy}  dangle ${a.dang}`));
  console.log("  arrêt franc — après la 1re image, amplitude :",
              JSON.stringify(ampFranc.map((a) => a.ldy)));
  console.log("  états après retrait :", [...new Set(etatsApres)].join(", "));
  console.log("  après retrait, plaques qui bougent :", repart, "/ 8");
  console.log("  VERDICT :",
    (gele && franc && repart === 8 && bougeAvant === 8 && etats.every((e) => e === "paused"))
      ? "survol arrête les huit, net, et ça repart" : "*** DEFAUT ***");
  rapport.survol = { bougeAvant, etats: [...new Set(etats)], ampFranc, ampPendant, repart, gele, franc };
  await page.close();
}

/* ============================================================
   6 · HORS-ECRAN
   ============================================================ */
{
  const page = await ouvrir(nav);
  console.log("\n=== 6 · HORS-ECRAN ===");
  /* On defile PAR PAS, comme un visiteur : un `scrollTo` qui saute
     casse un pin de ScrollTrigger. */
  await page.evaluate(async () => {
    const cible = document.querySelector("#comparatif").getBoundingClientRect().top + window.scrollY;
    for (let y = 0; y < cible; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
  });
  /* ON ATTEND QUE LE DOCUMENT SE SOIT REPOSE, et on le VERIFIE.
     `content-visibility: auto` remplace la hauteur reservee d'une
     section par sa hauteur reelle des qu'elle approche : la page
     continue donc de se recomposer plusieurs centaines de
     millisecondes apres le dernier pas de defilement. Mesurer
     pendant, c'est mesurer la recomposition et l'appeler
     « la boucle tourne encore ». */
  let hauteur = 0;
  for (let essai = 0; essai < 12; essai++) {
    await page.waitForTimeout(200);
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    if (h === hauteur) break;
    hauteur = h;
  }
  const etat = await page.evaluate(() => {
    const b = document.querySelector("[data-plaques]");
    return {
      repos: b.hasAttribute("data-repos"),
      etats: [...new Set([...b.querySelectorAll(".plaque-corps")].map((c) => getComputedStyle(c).animationPlayState))],
      dansEcran: b.getBoundingClientRect().bottom > 0,
    };
  });
  const suite = await suivre(page, 4, 400);
  const amp = ecarts(suite);
  const gele = amp.every((a) => a.ldy < 0.6 && a.ldx < 0.6 && a.dang < 0.05);
  console.log("  bande dans l'écran :", etat.dansEcran, "· data-repos :", etat.repos, "· états :", etat.etats.join(","));
  console.log("  amplitude de la boucle hors écran, coque déduite :", JSON.stringify(amp.map((a) => a.ldy)),
              "· absolue, document compris :", JSON.stringify(amp.map((a) => a.dy)));
  console.log("  VERDICT :", (etat.repos && gele) ? "en pause hors écran" : "*** TOURNE ENCORE ***");
  rapport.horsEcran = { ...etat, amp, gele };
  await page.close();
}

/* ============================================================
   7 · ONGLET CACHE — par le protocole DevTools, seul moyen réel.
   ============================================================ */
{
  const page = await ouvrir(nav);
  console.log("\n=== 7 · ONGLET CACHE ===");
  /* ------------------------------------------------------------
     IL N'Y A PAS DE COMMANDE « CACHE-CET-ONGLET » DANS LE PROTOCOLE.
     `Page.setWebLifecycleState` n'accepte que `frozen` et `active` —
     elle rejette `hidden` avec « Unidentified lifecycle state ».
     Ce qui, LUI, cache vraiment un onglet, c'est qu'un AUTRE onglet
     du meme contexte passe devant : `document.hidden` bascule alors
     pour de vrai, et l'evenement `visibilitychange` part du
     navigateur et non de la sonde.
     C'est la seule mesure qui prouve quelque chose. Si elle echoue
     sur cette plateforme, on le DIT au lieu de se rabattre en
     silence sur un evenement fabrique — un evenement qu'on emet
     soi-meme ne teste que sa propre existence.
     ------------------------------------------------------------ */
  /* ============================================================
     DEUX PARTIES, ET LA DIFFERENCE ENTRE ELLES EST TOUT L'INTERET.

     A · LA PLATEFORME. On essaie de cacher l'onglet pour de vrai, en
         mettant un second onglet du meme contexte au premier plan.
         Releve du 2026-07-29, Chromium pilote par Playwright, teste
         AVEC et SANS tete, plus `Page.setWebLifecycleState` en
         `frozen` : `document.hidden` reste `false` dans les TROIS
         cas. Chromium sous automatisation ne modelise pas la
         visibilite d'onglet. Ce n'est donc pas prouvable ici, et on
         l'ecrit au lieu de le maquiller.

     B · LE BRANCHEMENT. On force `document.hidden` a `true` et on
         emet `visibilitychange`. Ce releve prouve que NOTRE code
         reagit correctement a un onglet cache : l'attribut se pose,
         les huit animations passent en pause, et le gel est verifie
         au pixel. Il ne prouve PAS que le navigateur emet
         l'evenement — mais ca, c'est le contrat de la plateforme, pas
         notre code, et c'est un contrat que tous les moteurs tiennent
         depuis dix ans.

     Melanger A et B en un seul verdict « ca marche » serait
     exactement le genre de test qui verrouille son defaut. Les deux
     sont donc rendus separement, avec leur portee.
     ============================================================ */
  const dit = { A_plateforme: {}, B_branchement: {} };

  try {
    const seconde = await page.context().newPage();
    await seconde.goto("about:blank");
    await seconde.bringToFront();
    await page.waitForTimeout(500);
    dit.A_plateforme = await page.evaluate(() => ({
      hidden: document.hidden,
      repos: document.querySelector("[data-plaques]").hasAttribute("data-repos"),
    }));
    await page.bringToFront();
    await seconde.close();
    await page.waitForTimeout(300);
  } catch (e) {
    dit.A_plateforme.erreur = String(e).slice(0, 120);
  }

  try {
    /* `document.hidden` est en lecture seule : on la redefinit sur le
       PROTOTYPE, ce qui est le seul point ou une propriete de
       document se laisse remplacer. On la remet apres, sinon tout
       relevé suivant heriterait d'un document qui se croit cache. */
    dit.B_branchement.pendant = await page.evaluate(async () => {
      const proto = Object.getPrototypeOf(document);
      const vrai = Object.getOwnPropertyDescriptor(proto, "hidden") ||
                   Object.getOwnPropertyDescriptor(Document.prototype, "hidden");
      Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
      document.dispatchEvent(new Event("visibilitychange"));
      await new Promise((r) => setTimeout(r, 120));
      const b = document.querySelector("[data-plaques]");
      window.__vrai_hidden = vrai;
      return {
        hidden_vu_par_la_page: document.hidden,
        repos: b.hasAttribute("data-repos"),
        etats: [...new Set([...b.querySelectorAll(".plaque-corps")].map((c) => getComputedStyle(c).animationPlayState))],
      };
    });
    const suiteCachee = await suivre(page, 3, 400);
    dit.B_branchement.ampCachee = ecarts(suiteCachee).map((a) => a.ldy);

    dit.B_branchement.apresRetour = await page.evaluate(async () => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
      document.dispatchEvent(new Event("visibilitychange"));
      await new Promise((r) => setTimeout(r, 120));
      delete document.hidden;
      const b = document.querySelector("[data-plaques]");
      return {
        repos: b.hasAttribute("data-repos"),
        etats: [...new Set([...b.querySelectorAll(".plaque-corps")].map((c) => getComputedStyle(c).animationPlayState))],
      };
    });
    const suiteRevenue = await suivre(page, 4, 500);
    dit.B_branchement.ampRevenue = ecarts(suiteRevenue).map((a) => a.ldy);
  } catch (e) {
    dit.B_branchement.erreur = String(e).slice(0, 200);
  }

  const A = dit.A_plateforme;
  const B = dit.B_branchement;
  console.log("  A · la plateforme cache-t-elle vraiment l'onglet ? ", JSON.stringify(A));
  console.log("     →", A.hidden === true
    ? "oui, et data-repos = " + A.repos
    : "NON — Chromium sous Playwright ne modélise pas la visibilité d'onglet.\n       Ce verrou n'est donc PAS prouvé sur un vrai navigateur. À reprendre à la main.");
  console.log("  B · notre code réagit-il à un onglet caché ?      ", JSON.stringify(B.pendant));
  console.log("     amplitude pendant :", JSON.stringify(B.ampCachee),
              "· après retour :", JSON.stringify(B.ampRevenue));
  const okB = B.pendant && B.pendant.repos === true &&
    (B.pendant.etats || []).every((e) => e === "paused") &&
    Array.isArray(B.ampCachee) && B.ampCachee.every((d) => d < 0.6) &&
    B.apresRetour && B.apresRetour.repos === false &&
    Array.isArray(B.ampRevenue) && B.ampRevenue.filter((d) => d >= 2).length === 8;
  console.log("     →", okB
    ? "oui : attribut posé, huit animations en pause, gel vérifié au pixel, reprise au retour"
    : "*** DEFAUT DE BRANCHEMENT ***");
  console.log("  VERDICT : branchement", okB ? "prouvé" : "EN DEFAUT",
              "· plateforme", A.hidden === true ? "prouvée" : "NON PROUVABLE ICI");
  rapport.ongletCache = { ...dit, verdictBranchement: okB, plateformeProuvee: A.hidden === true };
  await page.close();
}

/* ============================================================
   8 · LISIBLE — chevauchement et contraste à douze phases.

   LE VRAI RISQUE N'EST PAS LE CONTRASTE, C'EST LE CHEVAUCHEMENT.
   Une animation de `translate` ne change aucune couleur : le
   contraste ne peut bouger que si deux plaques se montent l'une sur
   l'autre. On mesure donc les deux, et on nomme celle qui compte.

   `color-mix()` calcule en `color(srgb …)` et non en `rgb()` : lu
   comme du 0-255, tout texte en `color-mix` ressort a 1,11:1. La
   lecture ci-dessous accepte les deux notations.
   ============================================================ */
{
  const page = await ouvrir(nav);
  await amenerLaBande(page);
  console.log("\n=== 8 · LISIBLE ===");
  const releves = [];
  for (let k = 0; k < 12; k++) {
    /* On laisse courir un temps IRREGULIER : douze pas egaux dans une
       boucle periodique risqueraient de tomber douze fois sur la meme
       phase. */
    await page.waitForTimeout(230 + k * 137);
    releves.push(await page.evaluate(() => {
      const lire = (s) => {
        const m = s.match(/rgba?\(([^)]+)\)/);
        if (m) {
          const p = m[1].split(/[,\s/]+/).map(Number);
          return [p[0], p[1], p[2]];
        }
        const c = s.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
        if (c) return [c[1] * 255, c[2] * 255, c[3] * 255];
        return null;
      };
      const lum = (v) => {
        const f = v.map((x) => { const s = x / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); });
        return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
      };
      const ratio = (a, b) => {
        const la = lum(a), lb = lum(b);
        return +((Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)).toFixed(2);
      };

      const corps = [...document.querySelectorAll(".plaque-corps")];

      /* ----------------------------------------------------------
         DEUX MESURES DE CHEVAUCHEMENT, ET UNE SEULE DECIDE.

         `getBoundingClientRect()` d'un element TOURNE rend son
         rectangle ENGLOBANT aligne sur les axes, qui est plus grand
         que la plaque reelle. Deux plaques inclinees de 4° dont les
         englobants se croisent de quelques pixels ne se touchent pas
         a l'ecran. Compter les englobants, c'est donc compter des
         chevauchements qui n'existent pas — exactement le genre de
         faux verdict que ce depot a deja paye.

         La mesure qui DECIDE est l'occultation : au centre du texte
         de chaque plaque, `elementFromPoint` doit rendre un noeud de
         CETTE plaque. S'il rend un noeud d'une autre, du texte est
         reellement recouvert, et c'est le seul defaut qui compte.
         L'englobant reste rendu, mais comme indicateur, et compare a
         sa valeur AU REPOS : la composition de repos decale deja
         certaines plaques de 48 px dans la colonne voisine, donc un
         chevauchement d'englobants existe avant toute boucle.
         ---------------------------------------------------------- */
      const boites = corps.map((c) => c.getBoundingClientRect());
      let englobants = 0;
      for (let i = 0; i < boites.length; i++) {
        for (let j = i + 1; j < boites.length; j++) {
          const a = boites[i], b = boites[j];
          const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (w > 4 && h > 4) englobants++;
        }
      }

      let chevauche = 0;
      const occultees = [];
      corps.forEach((c, i) => {
        [c.querySelector(".num"), c.querySelector("span")].forEach((cible) => {
          if (!cible) return;
          const r = cible.getBoundingClientRect();
          if (r.width < 2 || r.height < 2) return;
          /* Trois points par cible : gauche, centre, droite. Un seul
             point au centre raterait un recouvrement par le bord. */
          [0.12, 0.5, 0.88].forEach((f) => {
            const x = r.left + r.width * f;
            const y = r.top + r.height / 2;
            if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return;
            const dessus = document.elementFromPoint(x, y);
            if (!dessus) return;
            if (!c.contains(dessus) && dessus !== c) {
              chevauche++;
              occultees.push({ plaque: i + 1, par: dessus.className || dessus.tagName });
            }
          });
        });
      });

      const fond = lire(getComputedStyle(corps[0]).backgroundColor);
      const contrastes = corps.map((c) => {
        const sp = c.querySelector("span");
        const num = c.querySelector(".num");
        return {
          phrase: ratio(lire(getComputedStyle(sp).color), fond),
          chiffre: ratio(lire(getComputedStyle(num).color), fond),
        };
      });

      return {
        chevauche,
        englobants,
        occultees,
        debordeH: document.documentElement.scrollWidth > window.innerWidth
          ? document.documentElement.scrollWidth + " > " + window.innerWidth : null,
        piremin: Math.min(...contrastes.map((c) => Math.min(c.phrase, c.chiffre))),
        opacites: [...new Set(corps.map((c) => getComputedStyle(c).opacity))],
      };
    }));
  }

  /* LA BASE DE COMPARAISON. On arrete la boucle et on remesure : tout
     chevauchement d'englobants qui existe deja ici n'est pas
     imputable a la boucle. Sans cette ligne, on attribuerait a
     l'ajout d'aujourd'hui une composition decidee il y a deux jours. */
  const repos = await page.evaluate(() => {
    document.querySelector("[data-plaques]").classList.remove("est-vivante");
    const corps = [...document.querySelectorAll(".plaque-corps")];
    const b = corps.map((c) => c.getBoundingClientRect());
    let englobants = 0;
    for (let i = 0; i < b.length; i++) {
      for (let j = i + 1; j < b.length; j++) {
        const w = Math.min(b[i].right, b[j].right) - Math.max(b[i].left, b[j].left);
        const h = Math.min(b[i].bottom, b[j].bottom) - Math.max(b[i].top, b[j].top);
        if (w > 4 && h > 4) englobants++;
      }
    }
    return { englobants };
  });

  const pireContraste = Math.min(...releves.map((r) => r.piremin));
  const chev = releves.reduce((a, r) => a + r.chevauche, 0);
  const eng = Math.max(...releves.map((r) => r.englobants));
  const debord = releves.filter((r) => r.debordeH).map((r) => r.debordeH);
  console.log("  TEXTE REELLEMENT RECOUVERT, cumulé sur 12 phases :", chev,
              chev ? JSON.stringify(releves.flatMap((r) => r.occultees).slice(0, 5)) : "");
  console.log("  englobants qui se croisent — indicateur, pas verdict :",
              "boucle max", eng, "· au repos", repos.englobants,
              eng > repos.englobants ? "(+" + (eng - repos.englobants) + " imputable à la boucle)" : "(aucun de plus)");
  console.log("  pire contraste texte/plaque sur 12 phases :", pireContraste, ": 1");
  console.log("  opacités rencontrées :", [...new Set(releves.flatMap((r) => r.opacites))].join(","));
  console.log("  débordement horizontal :", debord.length ? debord.join(" · ") : "aucun");
  console.log("  VERDICT :", (chev === 0 && pireContraste >= 4.5 && !debord.length) ? "lisible en permanence" : "*** DEFAUT ***");
  rapport.lisible = { texteRecouvert: chev, englobantsBoucle: eng, englobantsRepos: repos.englobants, pireContraste, debordements: debord, releves };
  await page.close();
}

/* ============================================================
   9 · TENUE — boucle ET défilement en même temps.
   ============================================================ */
{
  const page = await ouvrir(nav);
  console.log("\n=== 9 · TENUE ===");
  const r = await page.evaluate(async () => {
    /* On n'echantillonne QUE pendant un defilement reel : hors
       defilement, le navigateur ralentit lui-meme `rAF` et rendrait
       un verdict faux. */
    const t = [];
    let dernier = performance.now();
    let fini = false;
    const boucle = () => {
      const m = performance.now();
      t.push(m - dernier);
      dernier = m;
      if (!fini) requestAnimationFrame(boucle);
    };
    requestAnimationFrame(boucle);
    const haut = document.querySelector("[data-plaques]").getBoundingClientRect().top + window.scrollY;
    for (let k = 0; k < 90; k++) {
      window.scrollTo(0, Math.max(0, haut - 400 + Math.sin(k / 8) * 380));
      await new Promise((rq) => requestAnimationFrame(rq));
    }
    fini = true;
    const s = t.slice(5).sort((a, b) => a - b);
    return {
      images: s.length,
      median: +s[Math.floor(s.length / 2)].toFixed(2),
      ips: +(1000 / s[Math.floor(s.length / 2)]).toFixed(1),
      au_dessus_de_20ms: s.filter((x) => x > 20).length,
      pire: +s[s.length - 1].toFixed(2),
    };
  });
  console.log(" ", JSON.stringify(r));
  console.log("  VERDICT :", (r.ips >= 55 && r.au_dessus_de_20ms <= 3) ? "tient pendant boucle + défilement" : "*** A REGARDER ***");
  console.log("  erreurs console :", page._erreurs.length ? page._erreurs : 0);
  rapport.tenue = { ...r, erreurs: page._erreurs };
  await page.close();
}

/* ============================================================
   10 · MOUVEMENT REDUIT — aucune boucle, et tout reste lisible.
   ============================================================ */
{
  const page = await ouvrir(nav, { reduit: true });
  await amenerLaBande(page);
  console.log("\n=== 10 · MOUVEMENT REDUIT ===");
  const r = await page.evaluate(() => {
    const b = document.querySelector("[data-plaques]");
    return {
      estVivante: b.classList.contains("est-vivante"),
      animations: [...new Set([...b.querySelectorAll(".plaque-corps")].map((c) => getComputedStyle(c).animationName))],
      tousVisibles: [...b.querySelectorAll(".plaque-corps")].every((c) => {
        const r2 = c.getBoundingClientRect();
        return r2.width > 0 && r2.height > 0 && getComputedStyle(c).opacity === "1";
      }),
      inclinees: [...b.querySelectorAll(".plaque-corps")].filter((c) => {
        const m = new DOMMatrixReadOnly(getComputedStyle(c).transform);
        return Math.abs(Math.atan2(m.b, m.a) * 180 / Math.PI) > 1.5;
      }).length,
    };
  });
  const suite = await suivre(page, 4, 500);
  const amp = ecarts(suite);
  const immobile = amp.every((a) => a.ldy < 0.4 && a.ldx < 0.4 && a.dang < 0.02);
  console.log(" ", JSON.stringify(r));
  console.log("  immobiles :", immobile, "· amplitude, coque déduite :", JSON.stringify(amp.map((a) => a.ldy)));
  console.log("  VERDICT :",
    (!r.estVivante && r.animations.every((a) => a === "none") && r.tousVisibles && r.inclinees === 8 && immobile)
      ? "aucune boucle, huit plaques inclinées et lisibles" : "*** DEFAUT ***");
  rapport.reduit = { ...r, immobile, amp };
  await page.close();
}

await nav.close();
fs.writeFileSync(path.join(SORTIE, "rapport.json"), JSON.stringify(rapport, null, 2));
console.log("\nCaptures et rapport :", path.relative(RACINE, SORTIE));
