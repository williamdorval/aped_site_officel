/* ============================================================
   LE POUCE — CE QU'ON PEUT VISER SUR UN TELEPHONE
   `node tools/serve.mjs 8099` puis `node tools/pouce-check.mjs [port]`

   POURQUOI CET OUTIL EXISTE.
   La reserve du 2026-08-06 disait : « cibles tactiles a 320 px,
   35 x 44, sous le seuil ». Elle venait d'une sonde jetable. Une
   reserve qui revient a chaque chantier doit avoir un instrument
   qui la ferme ou la rouvre toute seule.

   CE QU'IL MESURE. `getBoundingClientRect` de chaque cible du
   panneau de reservation, aux trois largeurs qui comptent, et le
   verdict contre les deux seuils de WCAG :
     · 2.5.8 AA  — 24 x 24 px
     · 2.5.5 AAA — 44 x 44 px

   ET IL PHOTOGRAPHIE. Une mesure de rectangle ne voit ni un
   rognage par un ancetre, ni un recouvrement (piege 25 · 77 · 83).
   L'arbitre reste l'image ; les captures partent dans
   `tools/_pouce/`, et il faut les OUVRIR.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { port as portDe } from "./_adresse.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const PORT = portDe(process.argv[2]);
const BASE = `http://127.0.0.1:${PORT}`;
const SORTIE = path.join(ICI, "_pouce");
fs.mkdirSync(SORTIE, { recursive: true });

const AA = 24;
const AAA = 44;
const LARGEURS = [320, 360, 390];

let echecs = 0;
let cas = 0;

function verifier(nom, obtenu, attendu, note) {
  cas++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) echecs++;
  console.log(
    "    " + (ok ? "OK   " : "ECHEC") + " " + nom
    + "\n           obtenu  : " + obtenu
    + "\n           attendu : " + attendu
    + (note ? "\n           " + note : "")
  );
}

const nav = await chromium.launch();

for (const largeur of LARGEURS) {
  console.log("");
  console.log("=== " + largeur + " px ===");

  const ctx = await nav.newContext({
    viewport: { width: largeur, height: 780 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true
  });
  const page = await ctx.newPage();
  const erreurs = [];
  page.on("pageerror", (e) => erreurs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
  await page.addInitScript(() => {
    try { sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {}
  });

  await page.goto(BASE + "/index.html", { waitUntil: "load" });
  /* UNE SONDE LUE AVANT 3 s NE VOIT PAS LA VRAIE PAGE : `data-palier`
     et `data-lettres` arrivent apres, et changent la peinture.
     On l'imprime a cote du verdict.  (piege 87) */
  await page.waitForTimeout(3200);
  const palier = await page.evaluate(() => document.documentElement.getAttribute("data-palier"));

  await page.evaluate(() => document.querySelector('[data-modal-open="modal-booking"]').click());
  await page.waitForTimeout(1400);

  /* ON MESURE AVANT DE CLIQUER. La premiere version de cette sonde
     mesurait un noeud deja detache par le `innerHTML = ""` de
     `renderCalendar()` et rendait « 0 x 0 px » sur les trois
     largeurs. L'instrument avait tort, pas la page. */
  const mesure = await page.evaluate(() => {
    const lire = (sel) => [...document.querySelectorAll(sel)]
      .filter((n) => {
        const r = n.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      })
      .map((n) => {
        const r = n.getBoundingClientRect();
        return { t: (n.textContent || "").trim().slice(0, 22), w: Math.round(r.width), h: Math.round(r.height) };
      });
    const jours = lire("#calDays .cal-day:not(.is-blank):not([disabled])");
    return {
      /* La forme reellement peinte, pas celle qu'on a demandee. */
      colonnes: getComputedStyle(document.getElementById("calDays")).gridTemplateColumns,
      jours: jours,
      largeurPanneau: Math.round(document.querySelector("#modal-booking .modal-panel").getBoundingClientRect().width),
      debordePage: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      exemples: jours.slice(0, 3).map((j) => j.t)
    };
  });

  console.log("    data-palier : " + palier
    + "  ·  panneau " + mesure.largeurPanneau + " px"
    + "  ·  colonnes « " + mesure.colonnes + " »");
  console.log("    trois premiers jours : " + JSON.stringify(mesure.exemples));

  const pireJour = mesure.jours.reduce(
    (p, j) => (Math.min(j.w, j.h) < Math.min(p.w, p.h) ? j : p), mesure.jours[0]);

  verifier("des jours offerts sont affiches", mesure.jours.length > 0, true,
    mesure.jours.length + " cases");
  verifier("la plus petite case de jour passe le seuil AA (24 px)",
    Math.min(pireJour.w, pireJour.h) >= AA, true,
    "la pire : " + pireJour.w + " x " + pireJour.h + " px");
  verifier("elle passe le seuil AAA (44 px)",
    Math.min(pireJour.w, pireJour.h) >= AAA, true,
    "la pire : " + pireJour.w + " x " + pireJour.h + " px");
  verifier("aucun debordement horizontal de la page", mesure.debordePage, false);

  await page.screenshot({ path: path.join(SORTIE, `jours-${largeur}.png`) });

  /* LES PLAGES, une fois un jour choisi. */
  await page.evaluate(() => {
    const d = document.querySelector("#calDays .cal-day:not(.is-blank):not([disabled])");
    if (d) d.click();
  });
  await page.waitForTimeout(900);

  const plages = await page.evaluate(() => {
    const n = [...document.querySelectorAll("#slotsList button")];
    return n.map((b) => {
      const r = b.getBoundingClientRect();
      return { t: b.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height) };
    });
  });

  if (plages.length) {
    const pirePlage = plages.reduce((p, s) => (Math.min(s.w, s.h) < Math.min(p.w, p.h) ? s : p), plages[0]);
    verifier("la plus petite plage passe le seuil AAA (44 px)",
      Math.min(pirePlage.w, pirePlage.h) >= AAA, true,
      plages.length + " plages · la pire : " + pirePlage.w + " x " + pirePlage.h + " px");
  } else {
    verifier("des plages sont affichees apres le choix du jour", plages.length > 0, true);
  }

  await page.screenshot({ path: path.join(SORTIE, `plages-${largeur}.png`) });

  verifier("aucune erreur de console", erreurs.length, 0,
    erreurs.length ? JSON.stringify(erreurs.slice(0, 2)) : "");

  await page.close();
  await ctx.close();
}

await nav.close();

console.log("");
console.log("    captures : tools/_pouce/  — OUVREZ-LES, le rectangle");
console.log("               ne voit ni rognage ni recouvrement.");
console.log("============================================================");
console.log(`LE POUCE : ${cas - echecs} / ${cas}`);
console.log("============================================================");
process.exit(echecs ? 1 : 0);
