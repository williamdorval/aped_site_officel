/* LES DOUZE FRONTIERES, AVANT / PENDANT / APRES.
   `node tools/_frontieres.mjs [tag]`

   PIEGE D'INSTRUMENT CORRIGE : les hauteurs de section sont
   ESTIMEES tant que `content-visibility: auto` n'a pas laisse le
   navigateur les mettre en page. Mesurer les jointures sur une page
   fraiche donne des positions fausses de plusieurs milliers de
   pixels — la premiere version de ce script capturait la section 03
   en croyant capturer la 06. On traverse donc la page ENTIEREMENT
   une fois avant de mesurer quoi que ce soit.
*/
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const TAG = process.argv[2] || "apres";
const SORTIE = path.join(RACINE, "refonte-captures", "frontieres-" + TAG);
fs.mkdirSync(SORTIE, { recursive: true });

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const erreurs = [];
page.on("pageerror", (e) => erreurs.push("pageerror: " + String(e)));
page.on("console", (m) => { if (m.type() === "error") erreurs.push("console: " + m.text()); });

/* Le popup cadeau se declenche pendant la traversee et masque les
   frontieres. Ce script mesure des frontieres : on le neutralise. */
await page.addInitScript(() => {
  try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {}
});
await page.goto("http://127.0.0.1:8099/", { waitUntil: "load" });
/* On saute la sequence d'entree : ce script mesure des frontieres. */
await page.mouse.click(10, 10);
await page.waitForTimeout(500);

/* Traversee de mise en page : indispensable avant toute mesure. */
await page.evaluate(async () => {
  const pas = window.innerHeight * 0.8;
  for (let y = 0; y < document.documentElement.scrollHeight; y += pas) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 40));
  }
  window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 300));
});

const seuils = await page.evaluate(() => {
  return [...document.querySelectorAll("[data-seuil]")].map((s, i) => ({
    n: i + 1,
    de: s.dataset.de, vers: s.dataset.vers,
    dress: s.dataset.dress, verbe: s.dataset.verbe, sens: s.dataset.sens,
    nom: (s.querySelector(".seuil-nom") || {}).textContent || "",
    top: Math.round(s.getBoundingClientRect().top + scrollY),
    h: Math.round(s.getBoundingClientRect().height)
  }));
});

async function defiler(page, cible) {
  await page.evaluate(async (c) => {
    c = Math.max(0, c);
    const pas = 240;
    let garde = 0;
    while (Math.abs(window.scrollY - c) > pas && garde++ < 400) {
      window.scrollBy(0, window.scrollY < c ? pas : -pas);
      await new Promise((r) => requestAnimationFrame(r));
    }
    window.scrollTo(0, c);
  }, cible);
}

const rapport = [];
for (const s of seuils) {
  const nom = String(s.n).padStart(2, "0") + "-" + s.de + "_vers_" + s.vers;
  /* AVANT : le seuil est encore sous le pli, a une image de sa
     ligne de declenchement. PENDANT : il vient de la franchir.
     APRES : tout est retombe. */
  /* SECOND PIEGE D'INSTRUMENT : un `scrollTo` qui saute casse un
     pin de ScrollTrigger — la scene epinglee des Services se
     retrouvait a des milliers de pixels de sa place et la capture
     montrait un empilement qui n'existe pas. On defile donc par
     pas, comme un visiteur. */
  /* TROISIEME PIEGE : les hauteurs changent ENCORE a mesure qu'on
     descend, parce que chaque section qu'on traverse se met en page
     pour de bon. Une liste de positions relevee une fois au depart
     derive donc de plusieurs milliers de pixels en bas de page — la
     capture de la frontiere 09 montrait la 11. On remesure le seuil
     JUSTE AVANT de le capturer. */
  s.top = await page.evaluate((i) => Math.round(
    document.querySelectorAll("[data-seuil]")[i].getBoundingClientRect().top + scrollY), s.n - 1);
  await defiler(page, s.top - 940);
  s.top = await page.evaluate((i) => Math.round(
    document.querySelectorAll("[data-seuil]")[i].getBoundingClientRect().top + scrollY), s.n - 1);
  await page.waitForTimeout(650);
  await page.screenshot({ path: path.join(SORTIE, nom + "-a-avant.png") });

  await defiler(page, s.top - 700);
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(SORTIE, nom + "-b-pendant.png") });

  await defiler(page, s.top - 240);
  await page.waitForTimeout(950);
  await page.screenshot({ path: path.join(SORTIE, nom + "-c-apres.png") });

  const etat = await page.evaluate((sel) => {
    const el = document.querySelectorAll("[data-seuil]")[sel];
    const f = el.querySelector(".seuil-filet");
    const r = el.querySelector(".seuil-roul");
    const n = el.querySelector(".seuil-nom");
    const cs = getComputedStyle(el);
    return {
      cran: el.getAttribute("data-cran"),
      roul: r ? getComputedStyle(r).transform : null,
      filetSoude: f ? f.classList.contains("is-set") : null,
      filetCourant: f ? f.classList.contains("is-current") : null,
      nomClip: n ? getComputedStyle(n).clipPath : null,
      seuilClip: cs.clipPath,
      fond: cs.backgroundColor
    };
  }, s.n - 1);
  rapport.push({ ...s, etat });
}

/* Le fond de part et d'autre des quatre bandes d'encre : la
   decoupe doit etre NETTE, donc les deux fonds doivent differer. */
console.log(JSON.stringify({ seuils: rapport, erreurs }, null, 1));
fs.writeFileSync(path.join(SORTIE, "rapport.json"), JSON.stringify({ seuils: rapport, erreurs }, null, 2));
await nav.close();
