/* ============================================================
   PLANCHE DETERMINISTE
   `node tools/captures-fixe.mjs <nom> [adresse]`

   POURQUOI CET OUTIL EXISTE. `theme-check.mjs` photographie une page
   qui bouge. Deux passes du MEME code rendent jusqu'a 1,96 % d'ecart
   sur le hero : la composition d'entree et les apercus de secteur ne
   tombent pas sur la meme image. Une planche pareille ne peut pas
   servir de preuve « rien n'a change » — elle ne distingue pas un
   defaut d'une seconde d'horloge.

   CE QU'IL FAIT A LA PLACE. Il photographie la page en MOUVEMENT
   REDUIT, ou `langue.js` et `motion.js` ne s'executent pas et ou les
   animations CSS du site sont neutralisees par ses propres regles.

   SON PLANCHER DE BRUIT N'EST PAS ZERO. Mesure du 2026-07-30 sur SEPT
   paires de code strictement identique, 130 images : TROIS bougent,
   toutes a `768-sombre` — realisations jusqu'a 2,6 %, contact 1,7 %,
   calculateur 1,29 %. Les 127 autres rendent 0,0000 %.
   Protocole obligatoire : deux passes du meme code AVANT de comparer,
   on retire les images qui bougent entre elles, on conclut sur le
   reste. Voir `PIEGES.md` § 29.

   CE QU'IL NE PROUVE PAS, ET QUI SE PROUVE AILLEURS. Le mouvement.
   Il est couvert par `langue-check`, `frontieres-check`,
   `accueil-check sequences` et `svc-defile`, qui mesurent des ecarts
   de pixels ENTRE deux instants au lieu de les interdire.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const NOM = process.argv[2] || "fixe";
const BASE = process.argv[3] || "http://127.0.0.1:8099/";
const SORTIE = path.join(RACINE, "refonte-captures", NOM);

const VUES = ["top", "services", "realisations", "demos", "visite", "calculateur",
  "comparatif", "processus", "reference", "faq", "contact"];
const LARGEURS = [
  { nom: "390", w: 390, h: 844 },
  { nom: "768", w: 768, h: 1024 },
  { nom: "1280", w: 1280, h: 800 },
  { nom: "1440", w: 1440, h: 900 },
  { nom: "1920", w: 1920, h: 1080 },
];

fs.mkdirSync(SORTIE, { recursive: true });
const nav = await chromium.launch();

for (const L of LARGEURS) {
  for (const theme of ["clair", "sombre"]) {
    const ctx = await nav.newContext({
      viewport: { width: L.w, height: L.h },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
      colorScheme: theme === "sombre" ? "dark" : "light",
    });
    const page = await ctx.newPage();
    /* Le popup cadeau capture tous les evenements de pointeur et fait
       expirer n'importe quelle attente : piege 18. */
    await page.addInitScript(() => {
      try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) { /* navigation privee stricte */ }
    });
    await page.goto(BASE, { waitUntil: "networkidle" });

    /* PIEGE 4. `content-visibility: auto` laisse le navigateur SAUTER le
       rendu d'une section hors ecran et lui donner la hauteur reservee
       par `contain-intrinsic-size`. Releve du 2026-07-30 : deux passes
       du meme code rendaient 84 % d'ecart sur `reference.png` a 768 px
       — la section etait peinte dans l'une, vide dans l'autre. On leve
       donc la propriete AVANT toute capture. Elle ne change aucune
       geometrie : elle decide seulement si le rendu est saute. */
    await page.addStyleTag({
      content: "*, *::before, *::after { content-visibility: visible !important; contain-intrinsic-size: auto !important; }",
    });
    await page.waitForTimeout(700);

    /* `content-visibility: auto` fait mentir la geometrie hors ecran :
       on traverse toute la page avant de mesurer quoi que ce soit. */
    await page.evaluate(async () => {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 200));
    });

    const dossier = path.join(SORTIE, `${L.nom}-${theme}`);
    fs.mkdirSync(dossier, { recursive: true });

    for (const id of VUES) {
      const el = await page.$(`#${id}`);
      if (!el) continue;
      await el.scrollIntoViewIfNeeded();
      /* Les odometres vivent dans `main.js` : ils sont N1 · ORIENTATION
         et ne tombent a AUCUN palier, mouvement reduit compris. Ils
         roulent donc encore ici. A 220 ms le chiffre du calculateur
         etait encore en vol et rendait 1,28 % d'ecart entre deux passes
         identiques ; a 900 ms il est arrive. */
      await page.waitForTimeout(900);
      try {
        await el.screenshot({ path: path.join(dossier, `${id}.png`) });
      } catch (e) {
        /* Une section plus haute que la limite de capture : on prend la
           fenetre a sa place plutot que de perdre la vue entiere. */
        await page.screenshot({ path: path.join(dossier, `${id}.png`) });
      }
    }
    /* Une vue de page entiere en plus : elle attrape ce qui vit ENTRE
       les sections — les seuils, les marges, le pied. */
    await page.screenshot({ path: path.join(dossier, "_page-entiere.png"), fullPage: true });
    await ctx.close();
  }
  console.log(`  ${L.nom} px  fait`);
}

await nav.close();
console.log(`\nplanche : refonte-captures/${NOM}  (${LARGEURS.length} largeurs x 2 themes x ${VUES.length} vues + 2 pages entieres)`);
