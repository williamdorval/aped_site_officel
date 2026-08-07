/* ============================================================
   LE PROGRAMME DE REFERENCE, EN IMAGES
   `node tools/reference-vue.mjs [port] [--sombre]`

   CE QU'IL FAIT. Il photographie ce qu'un visiteur VOIT : la section
   fermee, le panneau ouvert, et les sept ecrans du formulaire, en
   1440x900 et en 390x844. Rien d'autre. Aucun verdict — l'arbitre
   est l'image, et c'est un humain qui la regarde.

   POURQUOI UN OUTIL PLUTOT QU'UNE PASSE A LA MAIN. Une planche
   refaite a la main n'est jamais deux fois la meme : on n'ouvre pas
   au meme endroit, la fenetre n'a pas la meme taille, et la
   comparaison d'un jour a l'autre ne veut plus rien dire.

   Sortie : `preuves/reference/`.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { port as portDe } from "./_adresse.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PORT = portDe(process.argv[2]);
const SOMBRE = process.argv.includes("--sombre");
const SORTIE = path.join(RACINE, "preuves", "reference");
fs.mkdirSync(SORTIE, { recursive: true });

const ECRANS = [
  { cle: "bureau", w: 1440, h: 900 },
  { cle: "pouce", w: 390, h: 844 }
];

const nav = await chromium.launch();
const faits = [];

for (const e of ECRANS) {
  const ctx = await nav.newContext({
    viewport: { width: e.w, height: e.h },
    deviceScaleFactor: 2,
    colorScheme: SOMBRE ? "dark" : "light"
  });
  const page = await ctx.newPage();
  const erreurs = [];
  page.on("pageerror", (x) => erreurs.push(String(x)));
  page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("aped-entree-saut", "1");
      sessionStorage.setItem("aped-sans-popup", "1");
      localStorage.setItem("aped-retenue-vue", "1");
    } catch (x) {}
  });
  await page.goto("http://127.0.0.1:" + PORT + "/", { waitUntil: "load" });
  /* TROIS SECONDES, PAS UNE DE MOINS. `data-palier` et `data-lettres`
     arrivent apres, et ils changent la peinture. Piege 87. */
  /* LA SONDE ATTEND QUE `data-palier` SOIT LA, elle ne suppose pas
     qu'il l'est. Piege 87 : il arrive apres le premier rendu et il
     change la peinture. La premiere version lisait apres une attente
     fixe et imprimait « palier null » — la valeur etait pourtant
     posee a 2 000 ms. Une attente fixe qui tombe du mauvais cote
     rend une sonde qui MENT sur ce qu'elle a photographie. */
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-palier"),
    null, { timeout: 12000 }).catch(() => {});
  await page.waitForTimeout(1200);
  const palier = await page.getAttribute("html", "data-palier");

  const prendre = async (nom, cible) => {
    const f = path.join(SORTIE, e.cle + "-" + nom + (SOMBRE ? "-sombre" : "") + ".png");
    if (cible) {
      const el = await page.$(cible);
      if (!el) { console.log("  ABSENT · " + cible); return; }
      await el.screenshot({ path: f });
    } else {
      await page.screenshot({ path: f });
    }
    faits.push(path.relative(RACINE, f).replace(/\\/g, "/"));
    console.log("  " + path.relative(RACINE, f).replace(/\\/g, "/"));
  };

  console.log("\n=== " + e.cle + " " + e.w + "x" + e.h + " · palier " + palier
    + (SOMBRE ? " · sombre" : " · clair"));

  /* --- la section, fermee --- */
  /* UN `scrollTo` VERS UNE SECTION N'Y ARRIVE JAMAIS quand des sas
     grandissent la page : on traverse au pas, puis on VERIFIE ou est
     l'objet dans l'image. Piege 80. */
  for (let y = 0; y < 40; y++) {
    const fini = await page.evaluate(() => {
      const s = document.getElementById("reference");
      const r = s.getBoundingClientRect();
      if (r.top <= 120 && r.top > -40) return true;
      window.scrollBy(0, Math.max(120, Math.min(900, r.top - 60)));
      return false;
    });
    await page.waitForTimeout(140);
    if (fini) break;
  }
  await page.waitForTimeout(700);
  await prendre("01-section-fermee", ".referral");

  /* --- le panneau, ouvert ---
     ON PHOTOGRAPHIE LA PLAQUE ENTIERE, PAS LE SEUL PANNEAU. Une
     capture d'element rend le rectangle de l'element, et celui-ci
     naissait `hidden` : son rectangle porte encore la geometrie
     d'avant l'ouverture, et l'image sortait decadree de plusieurs
     milliers de pixels avec la grille rognee a droite. La plaque,
     elle, est stable — et c'est de toute facon ce qu'un visiteur
     voit : l'accroche AVEC le panneau dessous. */
  await page.evaluate(() => document.getElementById("refVoir").click());
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const p = document.getElementById("refPanneau");
    if (p) p.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await page.waitForTimeout(500);
  await prendre("02-panneau-ouvert", ".referral");

  /* --- le formulaire, ecran par ecran --- */
  await page.evaluate(() => {
    document.getElementById("refVoir").click();
    document.querySelector('.referral-foot [data-modal-open="modal-refer"]').click();
  });
  await page.waitForTimeout(900);

  const REMPLIR = [
    () => page.fill("#rfCompany", "Garage Tremblay"),
    async () => { await page.fill("#rfIndustry", "Mécanique automobile"); await page.selectOption("#rfNeed", { index: 2 }); },
    async () => { await page.fill("#rfContact", "Marie Lavoie, 418 555 0142"); await page.selectOption("#rfSizeRef", { index: 3 }); },
    async () => {
      await page.fill("#rfName", "Réjean Bouchard");
      await page.fill("#rfEmail", "rejean@exemple.ca");
      await page.selectOption("#rfRelation", { index: 2 });
    },
    async () => { await page.fill("#rfOwnCompany", "Bouchard Excavation"); await page.selectOption("#rfPay", { index: 1 }); },
    async () => {
      await page.fill("#rfPresentation", "Dites que c’est Réjean qui vous envoie.");
      await page.fill("#rfMsg", "Leur site date de 2009 et ils perdent des appels.");
    },
    async () => {}
  ];

  /* ON PHOTOGRAPHIE LA FENETRE, PAS L'ELEMENT.  D-773

     UNE CAPTURE D'ELEMENT MENT SUR UNE BARRE COLLANTE. `.step-nav`
     est en `position: sticky` : dans une capture d'element, elle se
     peint a sa position COLLEE — au milieu de l'image — par-dessus
     un contenu qui, a l'ecran, serait au-dessus d'elle. La premiere
     planche montrait ainsi la case a cocher recouverte par la
     barre : un defaut qui n'existait que dans l'instrument.

     Ce qu'un pouce voit, c'est la FENETRE. On prend donc la fenetre,
     et pour un ecran plus haut qu'elle, on la prend deux fois :
     en haut, puis descendu jusqu'au bout. */
  const fenetre = async (nom) => {
    await prendre(nom, null);
    const deborde = await page.evaluate(() => {
      const p = document.querySelector("#modal-refer .modal-panel");
      if (!p || p.scrollHeight <= p.clientHeight + 8) return false;
      p.scrollTop = p.scrollHeight;
      return true;
    });
    if (deborde) {
      await page.waitForTimeout(300);
      await prendre(nom + "-bas", null);
      await page.evaluate(() => {
        const p = document.querySelector("#modal-refer .modal-panel");
        if (p) p.scrollTop = 0;
      });
    }
  };

  for (let i = 1; i <= 7; i++) {
    await page.waitForTimeout(300);
    await fenetre("03-formulaire-" + String(i).padStart(2, "0"));
    if (i === 7) break;
    await REMPLIR[i - 1]();
    await page.evaluate(() => document.getElementById("referNext").click());
    await page.waitForTimeout(420);
  }

  /* L'ecran des conditions, TIROIR OUVERT : c'est ce que voit celui
     qui veut lire avant de cocher. */
  await page.evaluate(() => document.getElementById("rfCondVoir").click());
  await page.waitForTimeout(400);
  await fenetre("04-conditions-tiroir");

  /* Et le refus, quand la case n'est pas cochee. On REFERME le
     tiroir d'abord : ce qui compte est de voir si le refus se
     REMARQUE, et un pave de mille mots entre la case et le bouton
     n'est pas le cas ordinaire. */
  await page.evaluate(() => document.getElementById("rfCondVoir").click());
  await page.waitForTimeout(300);
  await page.evaluate(() => document.getElementById("referNext").click());
  await page.waitForTimeout(600);
  await fenetre("05-refus-sans-case");

  console.log("  erreurs console : " + (erreurs.length ? erreurs.slice(0, 3).join(" | ") : 0));
  await ctx.close();
}

await nav.close();
console.log("\n" + faits.length + " image(s) dans preuves/reference/");
