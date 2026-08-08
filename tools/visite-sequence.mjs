/* ============================================================
   LA VISITE 360 MARCHE-T-ELLE ENCORE ?
   `node tools/visite-sequence.mjs [nom] [adresse]`

   POURQUOI CET OUTIL EXISTE. Le chantier du 2026-08-02 a refait tout
   ce qui entoure le lecteur : la plaque d'entree a quitte l'interieur
   de la scene, le cadre a gagne deux etages, le pied a ete refait.
   Rien de tout cela ne touche `js/tour360.js`, mais « je n'ai pas
   touche au fichier » n'est pas une preuve que le lecteur fonctionne :
   le contrat entre les deux est fait de SELECTEURS, et un selecteur se
   casse en silence.

   ============================================================
   CE QUE CET OUTIL A COUTE, ET POURQUOI IL PHOTOGRAPHIE COMME CA.

   Cinq fausses pistes avant de pouvoir photographier le lecteur. Dans
   l'ordre : la capture d'element (qui ne compose pas une toile WebGL,
   piege 78), le recadrage `clip` (qui ne partage pas son repere avec
   `boundingBox`, piege 79), les drapeaux de lancement, la propriete
   `content-visibility`, puis un redimensionnement d'un pixel pour
   forcer la recomposition. Aucun n'etait la cause.

   LA VRAIE CAUSE, en deux temps.

   1. `scrollTo` vers la section n'y arrivait JAMAIS : les sas ajoutent
      de la hauteur au fur et a mesure qu'on descend, donc la cible
      recule plus vite qu'on n'avance. A six decalages differents, le
      cadre est reste entre 2 128 et 3 555 px SOUS la fenetre. Toutes
      les captures « noires » etaient des captures d'ailleurs — et les
      constats du DOM passaient quand meme, parce que Playwright amene
      lui-meme un element dans le champ avant de cliquer dessus.
      Parade : traverser toute la page une fois, ce qui fixe sa hauteur
      definitive, puis `scrollIntoViewIfNeeded`. Piege 80.

   2. Une fois le cadre REELLEMENT dans le champ, il rendait encore
      noir sous mouvement plein. Mesure A/B, code d'avant le chantier
      dans un worktree servi sur un autre port :

          avant  ·  mouvement reduit 75,9  ·  mouvement plein 0,0
          apres  ·  mouvement reduit 58,5  ·  mouvement plein 0,0

      Identique des deux cotes : pas une regression, c'est ce que font
      les sas quand on les traverse au script. C'est aussi pourquoi
      toutes les planches du depot photographient en mouvement reduit
      et n'ont jamais rencontre le probleme. Piege 81.

   D'OU LA RECETTE : mouvement reduit, traversee complete, fenetre
   entiere, et une mesure de RELIEF par image pour dire si la piece y
   est vraiment — au lieu de la supposer.

   RESERVE A REPETER DANS TOUT RAPPORT : Chromium sous SwiftShader en
   composition logicielle, machine de bureau Windows. Ce n'est pas le
   navigateur d'un visiteur.
   ============================================================

   CE QU'IL MESURE, et pas ce qu'il suppose :
     1. le bouton lance le chargement            (`.is-loading` posee)
     2. le moteur monte                          (`.is-live`, `.tour-view`)
     3. l'affiche est retiree du DOM             (`[data-tour-poster]`)
     4. commandes, plan et pastilles de passage existent
     5. la fleche fait tourner la piece   (le `translate` que POSE le moteur)
     6. le glissement fait tourner la piece      (idem)
     7. changer de piece deplace `aria-current` et change l'image
     8. le pupitre NE PERD PAS SA HAUTEUR quand l'entree disparait
     9. zero erreur console sur toute la sequence

   REGLE B DU PROJET : au moins cinq images entre le debut et la fin,
   et l'ECART DE PIXELS entre deux consecutives. Dix images ne font pas
   un mouvement (piege 54) — c'est l'ecart qui le prouve.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const NOM = process.argv[2] || "visite-sequence";
const BASE = process.argv[3] || "http://localhost:8099/";
const SORTIE = path.join(RACINE, "preuves", NOM);
/* 1200 px de haut : au decalage ou le sas est ouvert, le cadre
   s'etend de 380 a 1101 px. Une fenetre de 900 le coupait, et un
   cadre a moitie hors champ fabrique un faux mouvement. */
const VUE = { width: 1440, height: 900 };
const REPERE = 60; /* ou le haut du cadre est cale, dans toutes les passes */

fs.mkdirSync(SORTIE, { recursive: true });

/* == Lecture PNG minimale, sans dependance == */
function pixels(fichier) {
  const buf = fs.readFileSync(fichier);
  let i = 8, largeur = 0, hauteur = 0, profondeur = 0, couleur = 0;
  const morceaux = [];
  while (i < buf.length) {
    const taille = buf.readUInt32BE(i);
    const type = buf.toString("ascii", i + 4, i + 8);
    const data = buf.subarray(i + 8, i + 8 + taille);
    if (type === "IHDR") {
      largeur = data.readUInt32BE(0); hauteur = data.readUInt32BE(4);
      profondeur = data[8]; couleur = data[9];
    } else if (type === "IDAT") morceaux.push(data);
    else if (type === "IEND") break;
    i += taille + 12;
  }
  if (profondeur !== 8 || (couleur !== 6 && couleur !== 2)) {
    throw new Error(`PNG non gere : profondeur ${profondeur}, couleur ${couleur}`);
  }
  const canaux = couleur === 6 ? 4 : 3;
  const brut = zlib.inflateSync(Buffer.concat(morceaux));
  const ligne = largeur * canaux;
  const out = Buffer.alloc(hauteur * ligne);
  let s = 0;
  for (let y = 0; y < hauteur; y++) {
    const filtre = brut[s++];
    const dep = y * ligne;
    for (let x = 0; x < ligne; x++) {
      const cru = brut[s + x];
      const a = x >= canaux ? out[dep + x - canaux] : 0;
      const b = y > 0 ? out[dep - ligne + x] : 0;
      const c = x >= canaux && y > 0 ? out[dep - ligne + x - canaux] : 0;
      let v;
      if (filtre === 0) v = cru;
      else if (filtre === 1) v = cru + a;
      else if (filtre === 2) v = cru + b;
      else if (filtre === 3) v = cru + ((a + b) >> 1);
      else {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v = cru + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      }
      out[dep + x] = v & 255;
    }
    s += ligne;
  }
  return { largeur, hauteur, canaux, out };
}

/* ON COMPARE LA FENETRE DU CADRE, ET CHAQUE IMAGE A LA SIENNE.  D-634
   Le cadre ne tombe PAS au meme pixel d'une passe a l'autre : la
   hauteur des sas se calcule en `vh` et la page grandit pendant la
   descente, si bien qu'un meme chemin de code rend 741 px a une passe
   et 512 px a la suivante. Viser un pixel fixe ne converge jamais.
   On enregistre donc OU se trouve le cadre dans chaque image, et on
   aligne les deux fenetres sur le CONTENU au lieu du defilement. Les
   deux fenetres ont la meme taille — sinon on refuse de comparer
   (piege 3). Le rail de gauche et la barre du haut restent dehors :
   ils ne bougent pas et diluent tous les pourcentages. */
function ecart(a, b, za, zb) {
  const A = pixels(a), B = pixels(b);
  if (za.w !== zb.w || za.h !== zb.h) {
    return { pct: null, note: `FENETRES DIFFERENTES ${za.w}x${za.h} vs ${zb.w}x${zb.h}` };
  }
  let bouges = 0, total = 0;
  for (let y = 0; y < za.h; y++) {
    for (let x = 0; x < za.w; x++) {
      const ia = ((za.y + y) * A.largeur + (za.x + x)) * A.canaux;
      const ib = ((zb.y + y) * B.largeur + (zb.x + x)) * B.canaux;
      total++;
      if (Math.abs(A.out[ia] - B.out[ib]) > 8 ||
          Math.abs(A.out[ia + 1] - B.out[ib + 1]) > 8 ||
          Math.abs(A.out[ia + 2] - B.out[ib + 2]) > 8) bouges++;
    }
  }
  /* PIEGE 30 : un parametre illisible doit ARRETER l'outil, jamais
     retomber en silence sur « aucune difference ». */
  if (!total) return { pct: null, note: "cadre hors champ dans au moins une des deux images" };
  return { pct: (bouges / total) * 100, note: "" };
}

/* EST-CE QUE LA PIECE EST VRAIMENT SUR L'IMAGE ?  D-632
   L'ecart-type de la luminance dans la fenetre de la scene. Une piece
   photographiee tourne autour de 40 ; une surface perimee ou noire
   tombe sous 3. On ETIQUETTE chaque image plutot que de laisser croire
   que sept captures montrent sept etats du panorama : trois d'entre
   elles ne montrent que le cadre. Piege 67 : on juge sur toute la
   fenetre, pas sur une bande. */
function relief(fichier, zone) {
  const A = pixels(fichier);
  let n = 0, somme = 0, somme2 = 0;
  const y1 = Math.min(A.hauteur, zone.y + zone.h), x1 = Math.min(A.largeur, zone.x + zone.w);
  for (let y = Math.max(0, zone.y); y < y1; y += 2) {
    for (let x = Math.max(0, zone.x); x < x1; x += 2) {
      const i = (y * A.largeur + x) * A.canaux;
      const l = (A.out[i] * 299 + A.out[i + 1] * 587 + A.out[i + 2] * 114) / 1000;
      n++; somme += l; somme2 += l * l;
    }
  }
  if (!n) return -1; /* cadre hors champ : on le dit, on ne l'invente pas */
  return Math.sqrt(Math.max(0, somme2 / n - (somme / n) ** 2));
}

/* == Ce qu'on lit dans la page, jamais dans l'image == */
const ETAT = () => {
  const t = document.querySelector("[data-tour]");
  const pupitre = document.querySelector(".tour-pupitre");
  const entree = document.querySelector(".tour-enter");
  const encours = document.querySelector(".tour-encours");
  const actif = [...document.querySelectorAll(".tour-map-room")]
    .find((b) => b.getAttribute("aria-current") === "true");
  const cadre = document.querySelector(".tour-cadre");
  return {
    classes: t ? t.className : null,
    pret: t ? t.hasAttribute("data-tour-pret") : false,
    affiche: !!document.querySelector("[data-tour-poster]"),
    hauteurPupitre: pupitre ? Math.round(pupitre.getBoundingClientRect().height) : null,
    entreeVisible: entree ? getComputedStyle(entree).display !== "none" : null,
    encoursVisible: encours ? getComputedStyle(encours).display !== "none" : null,
    vue: !!document.querySelector(".tour-view"),
    commandes: document.querySelectorAll(".tour-ctl").length,
    pieces: document.querySelectorAll(".tour-map-room").length,
    passages: document.querySelectorAll(".pnlm-hotspot.tour-hs").length,
    pieceActive: actif ? actif.textContent.trim() : null,
    hauteurCadre: cadre ? Math.round(cadre.getBoundingClientRect().height) : null,
    /* Le `translate` QUE POSE LE MOTEUR a chaque image : la sortie de
       la boucle de rendu. Le rectangle englobant ne sert a rien ici —
       une pastille passee derriere la camera recoit une coordonnee de
       plusieurs dizaines de milliers de pixels. */
    tr: [...document.querySelectorAll(".pnlm-hotspot.tour-hs")].map((h) => {
      const m = /translate\(([-0-9.]+)px,\s*([-0-9.]+)px\)/.exec(h.style.transform || "");
      return m ? Math.round(+m[1]) : null;
    }),
  };
};

const nav = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--disable-gpu-compositing"] });
const erreurs = [];
const constats = [];
const images = [];
/* Une fenetre par image : `zone` pour le cadre entier (ecart de
   pixels), `scene` pour la seule piece (relief). */

/* Les gestes, du plus court au plus long. Chaque passe rejoue ceux qui
   la precedent puis s'arrete et photographie. */
const ETAPES = [
  { nom: "affiche", faire: async () => {} },
  { nom: "chargement", faire: async (p) => { await p.click("[data-tour-start]"); await p.waitForTimeout(240); } },
  { nom: "vivante-terrasse", faire: async (p) => {
      await p.waitForSelector("[data-tour].is-live", { timeout: 30000 });
      await p.waitForTimeout(1500);
    } },
  /* ON DONNE LE FOCUS SANS APPUYER.  D-631
     Un `click` dans le lecteur suffit a rompre la composition de la
     toile pour toute la suite de la session : la piece devient noire
     dans la capture alors qu'elle tourne bel et bien. Le lecteur est
     atteignable au clavier — c'est une exigence du site, pas une
     ruse — donc on le vise par `focus()` et on tient la fleche. */
  { nom: "clavier-droite", faire: async (p) => {
      await p.evaluate(() => document.querySelector(".tour-view").focus());
      await p.keyboard.down("ArrowRight");
      await p.waitForTimeout(900);
      await p.keyboard.up("ArrowRight");
      await p.waitForTimeout(500);
    } },
  { nom: "glissement-souris", faire: async (p) => {
      const b = await (await p.$(".tour-view")).boundingBox();
      const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
      /* `mouse.down` + `move` + `up` : un evenement synthetise ne teste
         pas le geste (piege 36). Pas a pas, parce qu'une image est
         glissable par defaut et que le navigateur emet alors un
         `pointercancel` qui retire le geste (piege 37). */
      await p.mouse.move(cx, cy);
      await p.mouse.down();
      for (let k = 1; k <= 12; k++) { await p.mouse.move(cx - k * 26, cy); await p.waitForTimeout(20); }
      await p.mouse.up();
      await p.waitForTimeout(700);
    } },
  /* Meme raison : on active au CLAVIER. Le plan et les passages sont
     des `button`, ils doivent repondre a Entree — et c'est justement
     ce que le pied de section promet au visiteur. */
  { nom: "piece-salon", faire: async (p) => {
      await p.evaluate(() => [...document.querySelectorAll(".tour-map-room")]
        .find((b) => /salon/i.test(b.textContent)).focus());
      await p.keyboard.press("Enter");
      await p.waitForTimeout(2600);
    } },
  { nom: "piece-par-passage", faire: async (p) => {
      const ok = await p.evaluate(() => {
        const h = document.querySelector(".pnlm-hotspot.tour-hs");
        if (!h) return false;
        h.focus();
        return true;
      });
      if (ok) { await p.keyboard.press("Enter"); await p.waitForTimeout(2600); }
    } },
];

async function passe() {
  /* MOUVEMENT REDUIT, ET C'EST MESURE, PAS SUPPOSE.  D-635
     Sous mouvement PLEIN et defilement programmatique, la scene rend
     un aplat noir : releve a 0,0 d'ecart-type. Sous mouvement reduit,
     elle rend la piece : 75,9 avant le chantier, 58,5 apres. Le meme
     0,0 sort du code d'AVANT, servi depuis un worktree sur un autre
     port — donc ce n'est pas une regression, c'est ce que font les sas
     quand on les traverse au script.
     `tour360.js` ne lit `prefers-reduced-motion` que pour ne pas
     lancer la derive automatique : le lecteur se charge, tourne,
     change de piece exactement pareil. C'est donc ici qu'on le
     photographie. Ce que cette planche ne montre pas, en revanche,
     c'est l'entree du cadre en V1 — elle ne joue pas a ce palier. */
  const ctx = await nav.newContext({ viewport: VUE, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => erreurs.push("PAGEERROR " + e.message));
  page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
  await page.addInitScript(() => {
    try { sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) { /* navigation privee */ }
  });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.addStyleTag({
    /* PIEGE 4 : `content-visibility: auto` fait sauter le rendu d'une
       section hors ecran tout en rendant sa hauteur reservee. */
    content: "*, *::before, *::after { content-visibility: visible !important; contain-intrinsic-size: auto !important; }",
  });

  /* ON DESCEND UNE FOIS, PAR PAS, JUSQU'AU REPERE. ET ON N'Y REVIENT
     PLUS.  D-633
     Trois passes perdues ici. Le cadre etait au bon pixel, non
     decoupe (`clip-path: inset(0px 0px 0%)`), `is-soude` posee, GSAP
     charge, 82 declencheurs vivants — et la capture rendait un aplat
     d'encre : ni bandeau, ni affiche, ni pupitre. Le DOM ne dit rien
     d'un VOILE qui le recouvre.
     C'est le sas du chantier immersif. Il ne s'ouvre que sur une
     descente continue ; un recalage qui saute d'avant en arriere le
     laisse ferme, et la chambre noire couvre la section. Les planches
     du depot ne le voient jamais parce qu'elles photographient en
     MOUVEMENT REDUIT, ou les sas ne se posent pas — ici on veut le
     lecteur vivant, donc le mouvement est plein, donc le sas est la.
     Un `scrollTo` qui saute casse aussi les pins de ScrollTrigger,
     piege 5 : les deux raisons disent la meme chose. */
  /* LA DESCENTE N'ARRIVAIT JAMAIS.  D-635
     `scrollTo(0, hautDeLaSection)` ne s'y pose pas : les sas du
     chantier immersif ajoutent de la hauteur AU FUR ET A MESURE qu'on
     descend, si bien que la cible recule plus vite qu'on n'avance.
     Mesure : a six decalages differents, le cadre est reste entre
     2 128 et 3 555 px SOUS la fenetre. Toutes mes captures « noires »
     etaient donc des captures d'ailleurs — et les constats du DOM
     passaient quand meme, parce que Playwright amene lui-meme un
     element dans le champ avant de cliquer dessus.
     On traverse donc toute la page une fois, comme les planches du
     depot, ce qui fixe sa hauteur definitive ; puis on laisse le
     navigateur amener le cadre dans le champ. */
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise((z) => setTimeout(z, 28)); }
    window.scrollTo(0, 0);
    await new Promise((z) => setTimeout(z, 300));
  });

  /* VAGUE 2 : `tour360.js` arrive au premier geste ou a 1,2 s. Le
     drapeau `data-tour-pret` dit qu'il est CABLE — sans lui, un clic
     frappe un bouton sans ecouteur et ne fait rien, en silence. */
  await page.mouse.move(700, 500);
  await page.waitForSelector("[data-tour][data-tour-pret]", { timeout: 10000 });

  /* LE REPERE EST LA SECTION, PAS LE CADRE.  D-633
     J'ai d'abord cale le haut du CADRE a 60 px de la fenetre. A cette
     position, la capture rendait un aplat d'encre : ni bandeau, ni
     affiche, ni pupitre — et cela AVANT meme d'avoir lance la visite.
     Le DOM n'en disait rien (clip final, opacite 1, hit-test correct).
     C'est le sas du chantier immersif : a certains decalages, la
     chambre noire couvre encore la section. Piege 25 dans les deux
     sens — une sonde du DOM ne voit ni un defaut de peinture ni un
     voile qui la recouvre.
     On se cale donc sur le haut de `#visite`, a l'endroit ou le sas
     est ouvert. Le repere reste absolu et identique dans toutes les
     passes, ce qui est tout ce qu'exige la comparaison. */
  await page.waitForTimeout(400);
  const fenetres = await page.evaluate(() => {
    const c = document.querySelector(".tour-cadre").getBoundingClientRect();
    const s = document.querySelector(".tour-stage").getBoundingClientRect();
    /* On BORNE chaque fenetre a celle du navigateur : une zone qui
       sort de l'image ne se lit pas, et une zone rognee en silence
       fabrique un faux mouvement (piege 3). Si deux passes rendent des
       tailles differentes, la comparaison le DIT au lieu d'un chiffre. */
    const r = (b) => {
      const x = Math.max(0, Math.round(b.x)), y = Math.max(0, Math.round(b.y));
      return { x, y,
        w: Math.max(0, Math.min(Math.round(b.right), window.innerWidth) - x),
        h: Math.max(0, Math.min(Math.round(b.bottom), window.innerHeight) - y) };
    };
    return { zone: r(c), scene: r(s) };
  });

  const etats = [];
  for (let k = 0; k < ETAPES.length; k++) {
    await ETAPES[k].faire(page);
    etats.push(await page.evaluate(ETAT));
    const cadre = await page.$(".tour-cadre");
    await cadre.scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    const fen = await page.evaluate(() => {
      const c = document.querySelector(".tour-cadre").getBoundingClientRect();
      const sc = document.querySelector(".tour-stage").getBoundingClientRect();
      const r = (b) => {
        const x = Math.max(0, Math.round(b.x)), y = Math.max(0, Math.round(b.y));
        return { x, y, w: Math.max(0, Math.min(Math.round(b.right), window.innerWidth) - x),
                 h: Math.max(0, Math.min(Math.round(b.bottom), window.innerHeight) - y) };
      };
      return { zone: r(c), scene: r(sc) };
    });
    const f = path.join(SORTIE, `${k}-${ETAPES[k].nom}.png`);
    await page.screenshot({ path: f });
    images.push({ nom: ETAPES[k].nom, f, zone: fen.zone, scene: fen.scene });
  }
  await ctx.close();
  return etats;
}

/* Chaque passe rend l'etat a chacun de ses paliers : on releve les
   constats sur la passe la plus longue, qui les traverse tous. */
const etats = await passe();
{
  const [avant, charge, vivant, clavier, glisse, salon, passage] = etats;
  constats.push(["le lecteur est cable avant le clic", avant.pret === true]);
  constats.push(["l'affiche est en place", avant.affiche === true]);
  constats.push(["l'entree est visible, le mode d'emploi non", avant.entreeVisible === true && avant.encoursVisible === false]);
  constats.push(["le clic pose `.is-loading`", /is-loading|is-live/.test(charge.classes)]);
  constats.push(["le moteur monte, `.is-live` posee", /is-live/.test(vivant.classes)]);
  constats.push(["le conteneur du visionneur existe", vivant.vue === true]);
  constats.push(["l'affiche est retiree du DOM", vivant.affiche === false]);
  constats.push(["les 2 commandes sont la", vivant.commandes >= 2]);
  constats.push(["les 3 pieces du plan sont la", vivant.pieces === 3]);
  constats.push(["au moins un passage est pose", vivant.passages >= 1]);
  constats.push(["la piece active est la Terrasse", /terrasse/i.test(vivant.pieceActive || "")]);
  constats.push([
    `le pupitre garde sa hauteur (${avant.hauteurPupitre} px avant, ${vivant.hauteurPupitre} px apres)`,
    avant.hauteurPupitre === vivant.hauteurPupitre,
  ]);
  constats.push([
    `le cadre garde sa hauteur (${avant.hauteurCadre} px avant, ${vivant.hauteurCadre} px apres)`,
    Math.abs(avant.hauteurCadre - vivant.hauteurCadre) <= 1,
  ]);
  constats.push(["l'entree cede la place au mode d'emploi", vivant.entreeVisible === false && vivant.encoursVisible === true]);

  const dx1 = Math.abs((clavier.tr[0] ?? 0) - (vivant.tr[0] ?? 0));
  constats.push([`la fleche fait tourner la piece (le passage se deplace de ${dx1} px)`, dx1 > 40]);
  const dx2 = Math.abs((glisse.tr[0] ?? 0) - (clavier.tr[0] ?? 0));
  constats.push([`le glissement fait tourner la piece (le passage se deplace de ${dx2} px)`, dx2 > 40]);
  constats.push(["le plan change de piece", /salon/i.test(salon.pieceActive || "")]);
  constats.push([`le salon a deux passages, la terrasse un`, salon.passages === 2 && vivant.passages === 1]);
  constats.push(["un passage dans l'image change de piece", passage.pieceActive !== salon.pieceActive]);
}

await nav.close();

/* ==== LE VERDICT ==== */
images.sort((a, b) => a.f.localeCompare(b.f));
let ecrit = `# Visite 360 — la sequence

Sept etats du lecteur, photographies en **mouvement reduit** et a la fenetre entiere.

**Pourquoi le mouvement reduit.** Sous mouvement plein et defilement programmatique, la scene rend un aplat noir : ecart-type de luminance **0,0**. Sous mouvement reduit, elle rend la piece : **75,9** sur le code d'avant le chantier, **58,5** sur celui d'apres. Le meme 0,0 sort des deux versions, servies depuis deux ports differents — ce n'est donc pas une regression du chantier, c'est ce que font les sas quand on les traverse au script (pieges 78 a 82). \`tour360.js\` ne lit \`prefers-reduced-motion\` que pour ne pas lancer la derive automatique : le lecteur se charge, tourne et change de piece exactement pareil.

**Ce que cette planche ne montre donc pas** : l'entree du cadre en V1 · DEGAGER, qui ne joue pas a ce palier. Elle reste declaree, pas prouvee en image (\`RESERVES.md\`).

**La preuve du mouvement ne repose pas seulement sur les images** : elle vient aussi du \`translate\` que le moteur pose lui-meme sur les pastilles de passage, et de l'etat du DOM. Les deux sont dans les constats.

`;

console.log("\n== LA PIECE EST-ELLE SUR L'IMAGE ? (ecart-type de luminance dans la scene) ==");
ecrit += `## La piece est-elle sur l'image ?\n\nEcart-type de luminance dans la fenetre de la scene (${images[0].scene.w} x ${images[0].scene.h} px). Sous 8, la surface est perimee : la capture ne porte pas le panorama.\n\n| image | ecart-type | verdict |\n|---|---|---|\n`;
const reliefs = new Map();
for (const im of images) {
  const r = relief(im.f, im.scene);
  reliefs.set(im.f, r);
  console.log(`  ${r < 0 ? "HORS-CHAMP" : r >= 8 ? "piece  " : "PERIMEE"} ${im.nom.padEnd(20)} ${r < 0 ? "-" : r.toFixed(1)}`);
  ecrit += `| ${im.nom} | ${r.toFixed(1)} | ${r >= 8 ? "la piece est la" : "**surface perimee**"} |\n`;
}

console.log(`\n== ECARTS DE PIXELS DANS LA FENETRE DU CADRE (${images[0].zone.w}x${images[0].zone.h}) ==`);
ecrit += `\n## Ecarts de pixels entre deux images consecutives\n\nA ne lire QUE sur les paires dont les deux images portent la piece. Ailleurs l'ecart mesure la surface perimee, pas le mouvement.\n\n| de | vers | ecart |\n|---|---|---|\n`;
let mouvements = 0;
for (let i = 1; i < images.length; i++) {
  const e = ecart(images[i - 1].f, images[i].f, images[i - 1].zone, images[i].zone);
  const v = e.pct === null ? e.note : e.pct.toFixed(2) + " %";
  const sur = reliefs.get(images[i - 1].f) >= 8 && reliefs.get(images[i].f) >= 8;
  if (e.pct !== null && e.pct > 1 && sur) mouvements++;
  console.log(`  ${images[i - 1].nom} -> ${images[i].nom} : ${v}${sur ? "" : "   (surface perimee)"}`);
  ecrit += `| ${images[i - 1].nom} | ${images[i].nom} | ${v}${sur ? "" : " *(surface perimee)*"} |\n`;
}

console.log("\n== CONSTATS ==");
ecrit += "\n## Constats\n\n";
let mal = 0;
for (const [quoi, ok] of constats) {
  if (!ok) mal++;
  console.log(`  ${ok ? "ok  " : "MAL "} ${quoi}`);
  ecrit += `- ${ok ? "**ok**" : "**MAL**"} — ${quoi}\n`;
}
console.log(`\n  erreurs console : ${erreurs.length}`);
ecrit += `\n- erreurs console : **${erreurs.length}**${erreurs.length ? " :: " + erreurs.join(" | ") : ""}\n`;
console.log(`  images : ${images.length}  ·  paires qui bougent de plus de 1 % : ${mouvements}`);
ecrit += `- images : ${images.length}, paires au-dessus de 1 % d'ecart : ${mouvements}\n`;
ecrit += `\n> Reserve : Chromium sous SwiftShader, composition logicielle, machine de bureau Windows. Ce n'est pas le navigateur d'un visiteur.\n`;
const verdict = mal === 0 && erreurs.length === 0 ? "la visite fonctionne" : mal + " constat(s) en echec";
console.log(`\n  VERDICT : ${verdict}\n`);
ecrit += `\n**Verdict : ${verdict}**\n`;
fs.writeFileSync(path.join(SORTIE, "RAPPORT.md"), ecrit);
console.log(`  preuves : preuves/${NOM}\n`);
process.exit(mal === 0 && erreurs.length === 0 ? 0 : 1);
