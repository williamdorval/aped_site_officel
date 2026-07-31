/* ============================================================
   SOCLE-CAPTURES — l'accueil AVEC et SANS la ligne de compensation.

   Les huit plaques d'atelier sont sorties de l'accueil le
   2026-07-30. Elles etaient le seul endroit du site qui projetait
   l'image d'une maison etablie ; trois de leurs affirmations sont
   reprises sur une ligne unique, sous un filet, en pied de hero.
   Le proprietaire tranche sur pieces.

   LES DEUX ETATS SONT PRIS DANS LA MEME PASSE, sur la MEME page,
   au MEME instant de vie du document. C'est la seule facon d'avoir
   une comparaison honnete : deux chargements successifs ne donnent
   pas la meme hauteur de nav, ni le meme etat de police, ni la meme
   position de defilement. On capture « avec », on retire le noeud,
   on recapture — rien d'autre ne bouge.

   Rend aussi les CHIFFRES qui decident : hauteur du hero dans les
   deux etats, et donc le cout exact de la ligne en pixels.

   node tools/socle-captures.mjs [adresse]
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:8099";
const SORTIE = path.resolve("tools/_socle");
fs.mkdirSync(SORTIE, { recursive: true });

const LARGEURS = [390, 768, 1280, 1440, 1920];
const THEMES = ["clair", "sombre"];

const rapport = [];

const nav = chromium;
const navigateur = await nav.launch();

for (const theme of THEMES) {
  for (const w of LARGEURS) {
    const ctx = await navigateur.newContext({
      viewport: { width: w, height: 900 },
      deviceScaleFactor: 1
    });
    /* Le popup cadeau capture TOUS les evenements de pointeur des
       qu'il s'ouvre par `showModal()` : tout outil qui clique ou qui
       attend doit le desarmer. Piege 18. */
    await ctx.addInitScript(() => {
      try {
        sessionStorage.setItem("aped-sans-popup", "1");
        localStorage.setItem("aped-theme", window.__apedTheme || "light");
      } catch (e) {}
    });
    const page = await ctx.newPage();
    if (theme === "sombre") {
      await page.addInitScript(() => {
        try { localStorage.setItem("aped-theme", "dark"); } catch (e) {}
      });
    }
    await page.goto(BASE + "/index.html", { waitUntil: "load" });
    /* La sequence d'entree dure jusqu'a 2,5 s depuis la navigation,
       et la composition du hero joue apres. On attend qu'elle soit
       finie, sinon on photographie une plaque a mi-course : une
       capture d'ecran est plus lente qu'une transition, mais elle
       n'est pas plus lente qu'une sequence entiere. */
    await page.waitForTimeout(3200);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(120);

    const mesure = async () => await page.evaluate(() => {
      const hero = document.querySelector("#top");
      const r = hero.getBoundingClientRect();
      const socle = document.querySelector(".hero-socle");
      return {
        heroHaut: Math.round(r.top + window.scrollY),
        heroBas: Math.round(r.bottom + window.scrollY),
        heroHauteur: Math.round(r.height),
        page: Math.round(document.documentElement.scrollHeight),
        socleHauteur: socle ? Math.round(socle.getBoundingClientRect().height) : 0,
        socleTexte: socle ? socle.innerText.replace(/\s+/g, " ").trim() : null,
        /* Le socle depasse-t-il le bas du hero et mord-il sur le
           seuil de la 02 ? C'est exactement le defaut que la
           huitieme plaque avait, mesure a 28-38 px. */
        debordeSousLeHero: socle
          ? Math.round(socle.getBoundingClientRect().bottom - r.bottom)
          : 0
      };
    });

    const avec = await mesure();
    await page.screenshot({ path: path.join(SORTIE, `avec-${theme}-${w}.png`) });

    /* --- ON RETIRE LA LIGNE, ET RIEN D'AUTRE --- */
    await page.evaluate(() => {
      const el = document.querySelector(".hero-socle");
      if (el) el.remove();
    });
    await page.waitForTimeout(160);
    const sans = await mesure();
    await page.screenshot({ path: path.join(SORTIE, `sans-${theme}-${w}.png`) });

    rapport.push({
      theme, largeur: w,
      avec, sans,
      coutEnPixels: avec.heroHauteur - sans.heroHauteur,
      coutSurLaPage: avec.page - sans.page
    });
    await ctx.close();
  }
}

await navigateur.close();

console.log("\n=== SOCLE — le cout de la ligne, en pixels ===\n");
console.log("theme    largeur  hero AVEC  hero SANS  cout  socle  deborde sous le hero");
for (const r of rapport) {
  console.log(
    r.theme.padEnd(8),
    String(r.largeur).padStart(5) + "  ",
    String(r.avec.heroHauteur).padStart(8) + "  ",
    String(r.sans.heroHauteur).padStart(8) + "  ",
    String(r.coutEnPixels).padStart(4),
    String(r.avec.socleHauteur).padStart(6),
    String(r.avec.debordeSousLeHero).padStart(20)
  );
}
console.log("\nTexte releve :", rapport[0].avec.socleTexte);
console.log("\nCaptures :", SORTIE);
fs.writeFileSync(path.join(SORTIE, "rapport.json"), JSON.stringify(rapport, null, 2));
