/* ============================================================
   L'ESTIMATEUR NE PUBLIE PLUS LA GRILLE
   `node tools/estimateur-check.mjs [port]`

   Deux verifications, et la seconde est celle qui compte :

   1. Le calcul rend une fourchette pour chacune des 108
      combinaisons, et les fourchettes sont bien des BORNES RONDES
      partagees par plusieurs profils.
   2. On joue le concurrent : on epuise les 108 combinaisons et on
      compte combien de valeurs distinctes en sortent. Si le nombre
      de sorties distinctes approche 108, la grille est reconstituable
      et le travail n'a servi a rien. S'il tombe a une poignee, il
      n'y a plus rien a voler.

   On verifie aussi qu'aucun prix de base ni aucun multiplicateur ne
   traine encore dans les fichiers servis.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PORT = process.argv[2] || "8099";

const TYPES = ["vitrine", "ecommerce", "app", "automatisation"];
const ENVERGURES = ["petit", "moyen", "grand"];
const DESIGNS = ["essentiel", "premium", "signature"];
const DELAIS = ["urgent", "normal", "flexible"];

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "load" });
await page.waitForTimeout(1500);

/* On rejoue le bareme tel qu'il est servi, en le lisant dans le
   fichier reellement telecharge : pas de copie dans ce script, sinon
   on testerait notre propre copie. */
const source = await page.evaluate(async () => (await fetch("js/main.js")).text());

const bareme = JSON.parse("[" + source.split("var BAREME = [")[1].split("];")[0]
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/([a-z]+):/g, '"$1":') + "]");
const poidsBrut = source.split("var POIDS = {")[1].split("\n  };")[0];
const POIDS = JSON.parse("{" + poidsBrut.replace(/\/\*[\s\S]*?\*\//g, "").replace(/([a-zA-Z]+):/g, '"$1":') + "}");

const sorties = new Map();
for (const t of TYPES) for (const e of ENVERGURES) for (const d of DESIGNS) for (const l of DELAIS) {
  const score = POIDS.type[t] + POIDS.envergure[e] + POIDS.design[d] + POIDS.delai[l];
  const i = Math.min(bareme.length - 1, Math.floor(score / 2));
  const f = bareme[i];
  const cle = f.haut === null ? `${f.bas}+` : `${f.bas}-${f.haut}`;
  if (!sorties.has(cle)) sorties.set(cle, []);
  sorties.get(cle).push(`${t}/${e}/${d}/${l}`);
}

/* AUCUN PRIX DE BASE NI MULTIPLICATEUR NE DOIT PLUS ETRE SERVI.

   La premiere version cherchait les nombres nus — 2600, 1.35, 2.4 —
   et elle criait sur un delai de 12 000 ms et sur des interlignes de
   1,35. Un detecteur qui rend sept faux positifs sur sept ne se lit
   plus. Ce qu'il faut chercher, c'est la FORME : un objet qui
   associe les quatre types de projet a des nombres. */
const suspects = [];
for (const f of ["js/main.js", "js/motion.js", "js/hero.js", "js/limaille.js",
                 "css/critique.css", "css/differe.css", "css/secteurs.css"]) {
  const txt = fs.readFileSync(path.join(RACINE, f), "utf8");
  const motifs = [
    { re: /\bPRICING\b/, quoi: "la variable PRICING" },
    /* TROIS CHIFFRES AU MINIMUM. Le bareme de score associe lui
       aussi les types de projet a des nombres — `vitrine: 0`,
       `ecommerce: 2` — mais ce sont des POINTS, pas des dollars.
       Un detecteur qui ne fait pas la difference signale le
       remplacement comme s'il etait le probleme. */
    { re: /vitrine\s*:\s*\d{3,}/, quoi: "un prix associe a « vitrine »" },
    { re: /ecommerce\s*:\s*\d{3,}/, quoi: "un prix associe a « ecommerce »" },
    { re: /automatisation\s*:\s*\d{3,}/, quoi: "un prix associe a « automatisation »" },
    { re: /(essentiel|premium|signature)\s*:\s*\d+\.\d/, quoi: "un multiplicateur de niveau de design" },
    { re: /(petit|moyen|grand)\s*:\s*\d+\.\d/, quoi: "un multiplicateur d'envergure" }
  ];
  for (const m of motifs) {
    const t = txt.match(m.re);
    if (!t) continue;
    /* On ignore ce qui est dans un commentaire : le fichier EXPLIQUE
       ce qui a ete retire, et cette explication doit pouvoir citer
       les mots sans declencher l'alarme. */
    const pos = txt.indexOf(t[0]);
    const avant = txt.slice(0, pos);
    const dansCommentaire = avant.lastIndexOf("/*") > avant.lastIndexOf("*/");
    if (dansCommentaire) continue;
    /* LE CONTEXTE, PAS SEULEMENT LA FORME. `grand: 0.1` existe dans
       `js/hero.js` : c'est la densite de grains du grand mot de la
       plaque, et ca n'a rien a voir avec un prix. Un multiplicateur
       de tarification vit forcement a cote d'un type de projet. */
    const autour = txt.slice(Math.max(0, pos - 300), pos + 300);
    if (!/vitrine|ecommerce|automatisation/.test(autour)) continue;
    suspects.push({ fichier: f, ligne: avant.split("\n").length, quoi: m.quoi, extrait: t[0] });
  }
}

await nav.close();

const rapport = {
  combinaisons: TYPES.length * ENVERGURES.length * DESIGNS.length * DELAIS.length,
  fourchettesDistinctes: sorties.size,
  repartition: [...sorties.entries()].map(([k, v]) => ({ fourchette: k, profils: v.length })),
  ancienneGrilleEncorePresente: suspects
};
rapport.verdict = {
  grilleNonReconstituable: sorties.size <= 6,
  chaqueFourchettePartageeParPlusieursProfils: [...sorties.values()].every((v) => v.length > 1),
  aucunAncienCoefficient: suspects.length === 0
};

fs.writeFileSync(path.join(RACINE, "refonte-captures", "estimateur.json"), JSON.stringify(rapport, null, 2), "utf8");
console.log(JSON.stringify(rapport, null, 2));
