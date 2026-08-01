/* RELEVER UNE RÉFÉRENCE — pas la regarder de loin, la MESURER.
   node tools/_ref.mjs <url> <clé> [largeur=1440]

   Dépose dans `tools/_refs/<clé>/` :
     · `0-heros.png`     le premier écran
     · `1..6-*.png`      une capture tous les 0,8 écran, en défilant à
                         la molette — les révélations se jouent donc
     · `plein.png`       la page entière, réduite pour être regardée
     · `releve.json`     ce qui se mesure : familles de polices,
                         taille et interlignage du h1, tailles de
                         section, couleurs dominantes, bibliothèques
                         d'animation détectées, hauteur de page

   ON DÉFILE À LA MOLETTE, jamais par `scrollTo` : la moitié des sites
   primés pilotent leur défilement (Lenis, Locomotive) et translatent
   le contenu eux-mêmes. Piège 5 / D-615. */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const [url, cle, largeur = "1440"] = process.argv.slice(2);
if (!url || !cle) throw new Error("node tools/_ref.mjs <url> <clé> [largeur]");
const L = Number(largeur);
if (!Number.isInteger(L) || L < 320 || L > 2560) throw new Error(`largeur illisible : ${largeur}`);

const SORTIE = path.join(ICI, "_refs", cle.replace(/[^a-z0-9-]/gi, "-"));
fs.mkdirSync(SORTIE, { recursive: true });

const nav = await chromium.launch();
const p = await nav.newPage({
  viewport: { width: L, height: 900 },
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
});
await p.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await p.waitForTimeout(2600);
/* Les bandeaux de témoins couvrent le héros de la moitié des
   références. On clique ce qui ressemble à un accord, une fois.

   SEULEMENT DES `<button>`, ET ON VÉRIFIE QU'ON N'A PAS NAVIGUÉ.
   La première version acceptait aussi les `<a>` : sur un salon
   primé, elle a cliqué le lien « Cookie » du pied de page et relevé
   la typographie de la POLITIQUE DE TÉMOINS. Le relevé était juste,
   il ne portait simplement pas sur la page qu'on croyait. */
const depart = p.url();
for (const t of ["Tout accepter", "Accepter", "J'accepte", "Accept all", "Accept", "Agree", "Got it", "Allow all"]) {
  const b = p.locator(`button:has-text("${t}"), [role="button"]:has-text("${t}")`).first();
  if (await b.count().catch(() => 0)) { await b.click({ timeout: 1500 }).catch(() => {}); await p.waitForTimeout(700); break; }
}
if (p.url() !== depart) {
  await p.goto(depart, { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForTimeout(2200);
}
await p.waitForTimeout(900);
await p.screenshot({ path: path.join(SORTIE, "0-heros.png") });

const releve = await p.evaluate(() => {
  const cs = (el) => getComputedStyle(el);
  const h1 = document.querySelector("h1") || document.querySelector("h2");
  const fam = new Set();
  for (const el of [...document.querySelectorAll("body *")].slice(0, 900)) {
    const f = cs(el).fontFamily;
    if (f) fam.add(f.split(",")[0].replace(/["']/g, "").trim());
  }
  const couleurs = {};
  for (const el of [...document.querySelectorAll("body *")].slice(0, 700)) {
    const b = cs(el).backgroundColor;
    if (b && !/rgba\(0, 0, 0, 0\)/.test(b)) couleurs[b] = (couleurs[b] || 0) + 1;
  }
  const sections = [...document.querySelectorAll("section, main > div")].slice(0, 14).map((s) => {
    const c = cs(s);
    return { h: Math.round(s.getBoundingClientRect().height), pt: c.paddingTop, pb: c.paddingBottom, bg: c.backgroundColor };
  });
  return {
    titre: document.title,
    h1: h1 ? {
      texte: h1.textContent.trim().slice(0, 70),
      px: Math.round(parseFloat(cs(h1).fontSize)),
      ligne: cs(h1).lineHeight,
      chasse: cs(h1).letterSpacing,
      graisse: cs(h1).fontWeight,
      famille: cs(h1).fontFamily.split(",")[0].replace(/["']/g, ""),
      couleur: cs(h1).color,
      casse: cs(h1).textTransform,
    } : null,
    corps: { px: Math.round(parseFloat(cs(document.body).fontSize)), famille: cs(document.body).fontFamily.split(",")[0].replace(/["']/g, ""), fond: cs(document.body).backgroundColor },
    familles: [...fam].slice(0, 12),
    fondsFrequents: Object.entries(couleurs).sort((a, b) => b[1] - a[1]).slice(0, 8),
    sections,
    hauteur: document.documentElement.scrollHeight,
    images: document.images.length,
    grandesImages: [...document.images].filter((i) => i.getBoundingClientRect().height > 380).length,
    bibliotheques: {
      gsap: !!window.gsap, scrollTrigger: !!(window.ScrollTrigger || window.gsap?.ScrollTrigger),
      lenis: !!(window.Lenis || window.lenis), locomotive: !!window.LocomotiveScroll,
      three: !!window.THREE, framer: !!document.querySelector("[data-framer-name]"),
      swiper: !!window.Swiper, barba: !!window.barba,
      scrollDrivenCSS: [...document.styleSheets].some((s) => { try { return [...s.cssRules].some((r) => /animation-timeline/.test(r.cssText)); } catch (e) { return false; } }),
    },
  };
});

const H = releve.hauteur;
const pas = Math.round(900 * 0.8);
let n = 1;
for (let cible = pas; cible < Math.min(H - 900, pas * 7); cible += pas) {
  for (let i = 0; i < 60; i++) {
    const cur = await p.evaluate(() => Math.round(window.scrollY));
    const d = cible - cur;
    if (Math.abs(d) < 20) break;
    await p.mouse.wheel(0, Math.max(-420, Math.min(420, d)));
    await p.waitForTimeout(70);
  }
  await p.waitForTimeout(1100);
  await p.screenshot({ path: path.join(SORTIE, `${n}-y${cible}.png`) });
  n++;
}

/* La page entière, réduite : c'est elle qu'on met à côté de la sienne. */
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(700);
await p.screenshot({ path: path.join(SORTIE, "plein-brut.png"), fullPage: true }).catch(() => {});

fs.writeFileSync(path.join(SORTIE, "releve.json"), JSON.stringify({ url, ...releve }, null, 1));
console.log(SORTIE);
console.log(JSON.stringify({ titre: releve.titre, h1: releve.h1, corps: releve.corps, bibliotheques: releve.bibliotheques, hauteur: releve.hauteur, grandesImages: releve.grandesImages }, null, 1));
await nav.close();
