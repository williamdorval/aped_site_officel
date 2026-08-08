/* ============================================================
   L'APERÇU VIVANT DU PANNEAU — la preuve qu'il bouge vraiment
   `node tools/panneau-vivant-check.mjs [port]`

   Une sonde du DOM ne peut pas dire si un aperçu bouge : elle voit un
   `<iframe>` présent et conclut. Cet outil relève la POSITION DE
   DÉFILEMENT DU DOCUMENT EMBARQUÉ, quatre fois en quatre secondes,
   et exige qu'elle avance. Puis il photographie trois instants du
   même survol : si les trois images se ressemblent, le mouvement est
   repris, pas prouvé.

   Il vérifie aussi ce qui coûte : combien de cadres vivent en même
   temps, ce qui est demandé au réseau, et que rien ne sort du dépôt.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2] || 8099);
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error(`${process.argv[2]} : ce n'est pas un numéro de port.`);
}
const SORTIE = path.join(ICI, "_voir");
fs.mkdirSync(SORTIE, { recursive: true });

const nav = await chromium.launch();
const p = await nav.newPage({ viewport: { width: 1440, height: 900 } });
await p.addInitScript(() => { try { sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {} });

const erreurs = [];
const tierces = [];
p.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
p.on("pageerror", (e) => erreurs.push(String(e)));
p.on("request", (r) => { const u = r.url(); if (!u.startsWith(`http://localhost:${PORT}/`) && !u.startsWith("data:") && !u.startsWith("about:")) tierces.push(u); });

await p.goto(`http://localhost:${PORT}/index.html`, { waitUntil: "networkidle", timeout: 60000 });

/* On descend À LA MOLETTE jusqu'au panneau : c'est le chemin du
   visiteur, et c'est le seul qui traverse les mêmes déclencheurs. */
const y = await p.evaluate(() => document.querySelector("#demos").getBoundingClientRect().top + window.scrollY);
for (let i = 0; i < 400; i++) {
  const cur = await p.evaluate(() => Math.round(window.scrollY));
  const d = y + 300 - cur;
  if (Math.abs(d) < 14) break;
  await p.mouse.wheel(0, Math.max(-520, Math.min(520, d)));
  await p.waitForTimeout(45);
}
await p.waitForTimeout(1400);

const R = [];
for (const cle of ["boutique", "gym", "clinique", "juridique", "photo", "restaurant"]) {
  const pastille = p.locator(`[data-sector="${cle}"]`).first();
  await pastille.hover();
  await p.waitForTimeout(2200);

  const suite = [];
  for (let i = 0; i < 4; i++) {
    suite.push(await p.evaluate(() => {
      const f = document.querySelector(".sec-live-cadre");
      if (!f) return null;
      try { return Math.round(f.contentDocument.scrollingElement.scrollTop); } catch (e) { return -1; }
    }));
    await p.waitForTimeout(1000);
  }

  const etat = await p.evaluate(() => {
    const l = document.querySelector(".sec-live");
    const f = document.querySelector(".sec-live-cadre");
    return {
      cadres: document.querySelectorAll("iframe").length,
      pret: !!(l && l.classList.contains("is-pret") && !l.hidden),
      inerte: !!(l && l.hasAttribute("inert")),
      src: f ? (f.getAttribute("src") || "—") : "—",
      hauteurEmbarquee: (() => { try { return f.contentDocument.documentElement.scrollHeight; } catch (e) { return -1; } })(),
    };
  });

  const avance = suite.every((v) => typeof v === "number") && suite[3] > suite[0];
  R.push({
    secteur: cle,
    vivant: etat.pret ? "oui" : "non (planche)",
    src: etat.src.replace("demos-secteurs/", "").replace("/index.html", ""),
    cadres: etat.cadres,
    inerte: etat.inerte ? "oui" : "NON",
    defilement: suite.join(" → "),
    avance: etat.pret ? (avance ? "oui" : "NON") : "—",
  });

  if (cle === "gym" && etat.pret) {
    for (let i = 0; i < 3; i++) {
      await p.screenshot({ path: path.join(SORTIE, `panneau-vivant-${i}.png`), clip: await p.locator("#sectorPreview").boundingBox() });
      await p.waitForTimeout(1500);
    }
  }
}

/* On sort du panneau : le cadre doit être LIBÉRÉ, pas laissé en vie. */
await p.mouse.move(20, 20);
await p.waitForTimeout(900);
const apres = await p.evaluate(() => {
  const f = document.querySelector(".sec-live-cadre");
  return { src: f ? (f.getAttribute("src") || "—") : "aucun cadre", cache: !!(document.querySelector(".sec-live") || {}).hidden };
});

await nav.close();
console.table(R);
console.log(`\naprès la sortie du panneau : src = « ${apres.src} », caché = ${apres.cache}`);
console.log(`erreurs console : ${erreurs.length}${erreurs.length ? " — " + erreurs[0].slice(0, 120) : ""}`);
console.log(`requêtes tierces : ${tierces.length}${tierces.length ? " — " + tierces.slice(0, 2).join(" ") : ""}`);
console.log(`captures : ${path.join(SORTIE, "panneau-vivant-0..2.png")}`);

const rates = R.filter((r) => r.vivant === "oui" && r.avance !== "oui");
if (erreurs.length || tierces.length || rates.length || apres.src !== "—") {
  console.error("\nÉCHEC : " + [
    erreurs.length ? `${erreurs.length} erreur(s) console` : "",
    tierces.length ? `${tierces.length} requête(s) tierce(s)` : "",
    rates.length ? `${rates.length} aperçu(s) vivant(s) qui n'avancent pas` : "",
    apres.src !== "—" ? "le cadre n'est pas libéré à la sortie" : "",
  ].filter(Boolean).join(" · "));
  process.exitCode = 1;
}
