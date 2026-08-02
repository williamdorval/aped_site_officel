/* ============================================================
   LE CÔTÉ-À-CÔTÉ CONTRE LES RÉFÉRENCES
   `node tools/planche-refs.mjs <clé> [largeur-de-case=520]`
   `node tools/planche-refs.mjs --tous [largeur-de-case=420]`

   La SECONDE passe du test du § 0 de `STANDARD.md`, et c'est la plus
   dure : « mets ta capture à côté des trois références ; **si on voit
   laquelle est la tienne**, elle n'est pas finie. »

   L'outil pose notre premier écran au milieu de ses trois références,
   toutes à la même largeur, **sans étiquette au-dessus des cases** —
   la légende est en bas, en petit, pour qu'on regarde avant de lire.
   La nôtre n'est pas mise en évidence : c'est tout l'intérêt.

   Les relevés viennent de `tools/_refs/<clé>-<nom>/0-heros.png`,
   déposés par `refs-releve.mjs` à 1440 px. Les références sont
   photographiées à la hauteur de leur propre fenêtre — 900 px — donc
   toutes les cases ont le même rapport et **piège 3 ne mord pas**.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const REFS = path.join(ICI, "_refs");
const NOTRES = path.join(RACINE, "images", "realisations");
const SORTIE = path.join(RACINE, "preuves", "chantier7-ecrans");
fs.mkdirSync(SORTIE, { recursive: true });

const { chromium } = await import(pathToFileURL(path.join(RACINE, "node_modules/playwright/index.mjs")).href);

/* Les trois références retenues par métier, telles qu'elles sont
   nommées dans `demos-secteurs/plans/<clé>.md`. Le dossier de relevé
   porte le préfixe du métier ; on le retrouve par préfixe pour ne pas
   recopier douze chemins qui périmeront. */
const CHOIX = {
  boutique: ["ombia", "eastfork", "coldpicnic"],
  /* « marco » ne désignait AUCUN dossier : le relevé s'appelle
     `coiffure-ambrosi`, et la recherche par sous-chaîne le manquait en
     silence — la planche sortait donc à deux cases. Les trois retenues
     le 2026-08-01 : brzozowski (l'échelle), alice (le vide et les
     origines de colonne), ambrosi (l'interlignage et le geste serré). */
  coiffure: ["brzozowski", "alice", "ambrosi"],
  /* GYM — `gymbox` sort, `phive` entre, le 2026-08-01.
     `gymbox` n'est pas primée, porte cinq appels à l'action et un
     prix, et sa leçon — « un chiffre qui bouge est le seul mouvement
     visible sur une image arrêtée » — est déjà absorbée : elle est
     devenue le cran et sa trace.
     `phive` est Awwwards SOTD + Developer (05-08-2025) et c'est la
     référence la plus proche de nous au monde : jaune saturé,
     capitales noires géantes coupées par les deux bords. Son relevé
     était inutilisable — premier écran couvert à 60 % par une
     fenêtre Cookiebot — et a été REFAIT, l'absence du dialogue
     vérifiée deux fois dans le DOM avant le déclencheur. */
  gym: ["huella", "phive", "grover"],
  /* HÉBERGEMENT — les trois références ont changé le 2026-08-01.
     Sortent : `nimmo` (mot-marque à 70 px posé PAR-DESSUS le
     bâtiment, cèdre blond — la couleur que la voie interdit),
     `nils` (palette claire, rayon en stade, photographie
     d'intérieur), `eleven` (citation centrée à 56 px : le bon noir
     coloré, mais pas la bonne échelle).
     Entrent : trois références dont le PREMIER ÉCRAN est mesuré et
     tient l'échelle qu'on vise — `tengile` h1 120 px / interlignage
     0,90 / capitales crème sur photographie sombre ; `arcticbath`
     h1 80 px ancré en bas à gauche sous un filet ; `svart`
     capitales de didone ≈ 90 px sur un paysage de nuit bleue. */
  hotel: ["tengile", "arcticbath", "svart"],
  /* CLINIQUE — les trois références ont changé le 2026-08-02.
     `sword`, `headway` et `jane` sont trois interfaces claires à carte
     arrondie : elles avaient produit un tableau de bord SaaS sans
     moment fort. Les trois nouvelles ont en commun ce que la cellule
     09 réclame — un corps humain cadré serré, une typographie
     d'affichage qui LUI PASSE DESSUS, et un seul accent saturé. */
  clinique: ["medwest", "function", "heva"],
  /* Trois références refaites le 2026-08-01, quand l'écran est passé
     en bandes chaudes-saturées. `eleos` (champ ivoire, masque en
     marches) et `crestwood` (dessin au crayon centré) prouvaient une
     voie claire et vide qui n'est plus la nôtre : les garder aurait
     été comparer notre écran à ce qu'on a décidé de ne plus faire.
     `honey` — sable #edccbe + brun #331917, affichage géant sur toute
     la largeur, une bande de couleur puis une bande de photographie ;
     `pakau` — la composition en bandes elle-même, titre à 144 px sur
     un aplat, photographie en boîte en dessous ;
     `ohiggins` — le rapport d'échelle brutal et la photographie
     bornée, sans un mot posé dessus. */
  immobilier: ["honey", "pakau", "ohiggins"],
  /* juridique : hlr et airmail sont sortis le 2026-08-01. La voie
     « une de quotidien » qu'ils portaient était la cause du défaut —
     sept blocs d'information dans la première fenêtre. Les deux
     remplaçants enseignent ce qui manquait : la COULEUR EN MASSE
     pleine bande avec un serif monumental posé dedans (ctype), et
     le TEXTE COMME TEXTURE, un pavé gris régulier où l'accent ne
     touche que des mots isolés (drift). Schillings reste : c'est le
     seul cabinet d'avocats des trois, et le seul à mettre le romain
     et l'italique dans la même phrase à la même taille. */
  juridique: ["ctype", "drift", "schillings"],
  photo: ["spaeth", "klok", "keller"],
  construction: ["haven", "marte", "akt"],
};

const args = process.argv.slice(2);
const TOUS = args.includes("--tous");
const cles = TOUS ? Object.keys(CHOIX) : args.filter((a) => CHOIX[a]);
if (!cles.length) throw new Error(`clé inconnue.\nconnues : ${Object.keys(CHOIX).join(" ")}\nou --tous`);
const brut = args.filter((a) => !a.startsWith("--") && !CHOIX[a])[0];
const CASE_L = Number(brut ?? (TOUS ? 420 : 520));
if (!Number.isFinite(CASE_L) || CASE_L < 160) throw new Error(`largeur de case illisible : ${JSON.stringify(brut)}`);
const CASE_H = Math.round((CASE_L * 900) / 1440);

const dossiers = fs.readdirSync(REFS).filter((d) => fs.statSync(path.join(REFS, d)).isDirectory());
const b64 = (f) => "data:image/" + (f.endsWith(".webp") ? "webp" : "png") + ";base64," + fs.readFileSync(f).toString("base64");

const nav = await chromium.launch();
const manquants = [];

for (const cle of cles) {
  const notre = path.join(NOTRES, `ecran-${cle}.webp`);
  if (!fs.existsSync(notre)) { manquants.push(`${cle} : pas de capture`); continue; }

  const cases = [];
  for (const nom of CHOIX[cle]) {
    const d = dossiers.find((x) => x.startsWith(cle + "-") && x.includes(nom));
    const f = d && path.join(REFS, d, "0-heros.png");
    if (f && fs.existsSync(f)) cases.push({ u: b64(f), n: d.replace(cle + "-", ""), notre: false });
    else manquants.push(`${cle} : relevé « ${nom} » introuvable`);
  }
  /* La nôtre au MILIEU, jamais en tête : en première position, l'œil
     la prend pour la référence et compare les autres à elle. */
  cases.splice(Math.min(2, cases.length), 0, { u: b64(notre), n: "◆ la nôtre", notre: true });

  const COL = cases.length;
  const L = COL * CASE_L + (COL + 1) * 14;
  const H = CASE_H + 66;
  const page = await nav.newPage({ viewport: { width: L, height: H }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#15161a;color:#e9eaec;font:11px/1.3 -apple-system,Segoe UI,system-ui,sans-serif;padding:14px}
    h1{font-size:13px;font-weight:600;margin:0 0 10px 2px;color:#fff}
    h1 b{color:#8d949d;font-weight:400}
    .g{display:flex;gap:14px}
    figure{width:${CASE_L}px}
    img{display:block;width:${CASE_L}px;height:${CASE_H}px;object-fit:cover;background:#000}
    figcaption{padding-top:6px;font-size:10px;letter-spacing:.03em;color:#767d86}
    .n figcaption{color:#e9eaec}
  </style>
  <h1>${cle.toUpperCase()} — notre premier écran au milieu de ses trois références &nbsp;<b>toutes à 1440 × 900. Si on voit laquelle est la nôtre, elle n'est pas finie.</b></h1>
  <div class="g">${cases.map((c) => `<figure class="${c.notre ? "n" : ""}"><img src="${c.u}" alt=""><figcaption>${c.n}</figcaption></figure>`).join("")}</div>`);

  await page.evaluate(async () => {
    await Promise.all([...document.images].map((i) => (i.complete && i.naturalWidth > 0)
      ? Promise.resolve()
      : new Promise((r) => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); })));
  });
  const ratees = await page.evaluate(() => [...document.images].filter((i) => !(i.complete && i.naturalWidth > 0)).length);
  if (ratees) throw new Error(`${cle} : ${ratees} image(s) jamais chargée(s) — la planche mentirait`);

  const f = path.join(SORTIE, `refs-${cle}.png`);
  await page.screenshot({ path: f, fullPage: true });
  await page.close();
  console.log(`✓ ${cle.padEnd(13)} ${cases.length} cases de ${CASE_L}×${CASE_H} · ${path.relative(RACINE, f)}`);
}

await nav.close();
/* AUCUN CAP SILENCIEUX : ce qui manque se DIT. */
if (manquants.length) { console.log(`\n⚠ ${manquants.length} manque(s) :`); for (const m of manquants) console.log(`  · ${m}`); }
