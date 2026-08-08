/* ============================================================
   SVC-FICHES — les cinq panneaux de detail, ouverts, sur cinq
   largeurs et deux themes.

   node tools/svc-fiches.mjs [adresse]

   Ce que l'outil refuse de laisser passer :
   · un panneau qui DEBORDE du viewport (coupe en haut, en bas, a
     gauche ou a droite) ;
   · un panneau dont le contenu est plus haut que la boite SANS
     que la boite defile (le contenu serait inatteignable) ;
   · un panneau qui laisse la PAGE defiler derriere lui ;
   · une fermeture qui ne rend pas le focus au bouton d'ouverture ;
   · Echap, clic dehors, bouton Fermer : les trois routes.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:8123";
const OUT = path.join("tools", "_svc-fiches");
const LARGEURS = [390, 768, 1024, 1280, 1440];
const THEMES = ["light", "dark"];
const IDS = ["svc-fiche-01", "svc-fiche-02", "svc-fiche-03", "svc-fiche-04", "svc-fiche-05"];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const nav = await chromium.launch();
let echecs = 0, mesures = 0;
const rapport = [];

for (const theme of THEMES) {
  for (const W of LARGEURS) {
    const ctx = await nav.newContext({
      viewport: { width: W, height: 900 },
      deviceScaleFactor: 1,
      colorScheme: theme,
    });
    await ctx.addInitScript(() => {
      try { sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {}
    });
    const page = await ctx.newPage();
    const erreurs = [];
    page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
    await page.goto(BASE + "/index.html", { waitUntil: "networkidle" });
    await page.waitForTimeout(900);

    for (const id of IDS) {
      /* On ouvre PAR LE BOUTON, jamais par script : c'est le chemin
         du visiteur, et c'est le seul qui teste le retour de focus. */
      const ouvert = await page.evaluate((cible) => {
        const a = document.querySelector('[data-svc-ouvre="' + cible + '"]');
        if (!a) return false;
        a.scrollIntoView({ block: "center" });
        a.focus();
        a.click();
        return true;
      }, id);
      if (!ouvert) { console.log(`  ${theme} ${W} ${id} : BOUTON INTROUVABLE`); echecs++; continue; }
      await page.waitForTimeout(700);

      const m = await page.evaluate((cible) => {
        const f = document.getElementById(cible);
        if (!f || !f.hasAttribute("data-ouvert")) return { absent: true };
        const b = f.getBoundingClientRect();
        const inner = f.querySelector(".svc-fiche-in");
        const vh = window.innerHeight, vw = window.innerWidth;
        return {
          top: Math.round(b.top), bas: Math.round(b.bottom),
          gauche: Math.round(b.left), droite: Math.round(b.right),
          vh, vw,
          deborde: b.top < -1 || b.left < -1 || b.bottom > vh + 1 || b.right > vw + 1,
          defileDedans: inner ? inner.scrollHeight > inner.clientHeight + 1 : false,
          peutDefiler: inner ? getComputedStyle(inner).overflowY === "auto" : false,
          corpsBloque: getComputedStyle(document.body).overflow === "hidden",
          role: f.getAttribute("role"),
          modal: f.getAttribute("aria-modal"),
          focusDedans: f.contains(document.activeElement),
          nomAccessible: !!f.getAttribute("aria-labelledby") &&
            !!document.getElementById(f.getAttribute("aria-labelledby")),
        };
      }, id);

      mesures++;
      const nom = `${theme}-${W}-${id}`;
      await page.screenshot({ path: path.join(OUT, nom + ".png") });

      const maux = [];
      if (m.absent) maux.push("NE S'OUVRE PAS");
      else {
        if (m.deborde) maux.push(`DEBORDE (${m.gauche},${m.top} → ${m.droite},${m.bas} dans ${m.vw}×${m.vh})`);
        if (m.defileDedans && !m.peutDefiler) maux.push("CONTENU PLUS HAUT QUE LA BOITE, SANS DEFILEMENT");
        if (!m.corpsBloque) maux.push("LA PAGE DEFILE DERRIERE");
        if (m.role !== "dialog" || m.modal !== "true") maux.push("PAS DECLARE COMME DIALOGUE");
        if (!m.focusDedans) maux.push("LE FOCUS EST RESTE DEHORS");
        if (!m.nomAccessible) maux.push("PAS DE NOM ACCESSIBLE");
      }
      if (maux.length) { echecs += maux.length; rapport.push(`  ${nom} : ${maux.join(" · ")}`); }

      /* Echap ferme, et le focus revient au declencheur. */
      await page.keyboard.press("Escape");
      await page.waitForTimeout(450);
      const apres = await page.evaluate((cible) => {
        const f = document.getElementById(cible);
        const a = document.activeElement;
        return {
          ferme: !f.hasAttribute("data-ouvert"),
          rendu: !!(a && a.getAttribute && a.getAttribute("data-svc-ouvre") === cible),
          debloque: getComputedStyle(document.body).overflow !== "hidden",
        };
      }, id);
      if (!apres.ferme) { echecs++; rapport.push(`  ${nom} : ECHAP NE FERME PAS`); }
      if (!apres.rendu) { echecs++; rapport.push(`  ${nom} : LE FOCUS NE REVIENT PAS AU BOUTON`); }
      if (!apres.debloque) { echecs++; rapport.push(`  ${nom} : LE VERROU DE DEFILEMENT RESTE POSE`); }
    }

    if (erreurs.length) { echecs += erreurs.length; rapport.push(`  ${theme} ${W} : ${erreurs.length} erreur(s) console — ${erreurs[0]}`); }
    await ctx.close();
  }
}

console.log(`SVC-FICHES · ${mesures} ouvertures mesurees sur ${LARGEURS.length} largeurs × ${THEMES.length} themes`);
if (rapport.length) { console.log("\nDEFAUTS :"); for (const l of rapport) console.log(l); }
console.log(`\n${echecs === 0 ? "AUCUN DEFAUT." : echecs + " DEFAUT(S)."}   captures : ${OUT}`);
await nav.close();
process.exit(echecs === 0 ? 0 : 1);
