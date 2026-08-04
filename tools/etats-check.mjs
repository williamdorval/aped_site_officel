/* ============================================================
   PHASE 8 — les micro-etats, un par un.
   Ceux qu'on oublie, et ceux qu'on rencontre le plus souvent :
   survol, focus, presse, desactive, chargement, vide, erreur,
   reussite, ouverture et fermeture de modale, bascule de theme,
   bourgeon, question depliee.
   ============================================================ */
import { chromium } from "playwright";
const B = process.argv[2] || "http://localhost:8099";
const nav = await chromium.launch();
const page = await (await nav.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

/* Le popup parait tout seul a la 11e seconde, a CHAQUE
   chargement. Cet outil mesure autre chose : on le neutralise,
   sinon il mesure une surcouche par-dessus sa cible. */
await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
const err = [];
page.on("pageerror", e => err.push(e.message));
page.on("console", m => { if (m.type() === "error") err.push(m.text()); });
await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree","1"); } catch(e){} });
await page.goto(B + "/", { waitUntil: "load" });
await page.mouse.move(700, 400);
await page.waitForTimeout(1700);

let ko = 0;
const dire = (ok, t) => { console.log((ok ? "  OK   " : "  ECHEC") + "  " + t); if (!ok) ko++; };

/* --- modale : ouverture, focus, fermeture, retour ---

   LA CIBLE SE LIT SUR LE BOUTON, ELLE N'EST PLUS ECRITE ICI.
   Cet outil cliquait `.nav-cta` puis interrogeait `#modal-start`.
   Le bouton a change de cible — il ouvre `modal-project` — et le
   test est reste sur l'ancienne. Resultat : « modale ouverte »
   echouait sur du code intact, ET les quatre assertions suivantes
   PASSAIENT A VIDE, sur une modale que personne n'avait ouverte.
   `hidden` valait bien `true` : elle n'avait jamais bouge.

   Un echec visible vaut mieux que quatre succes creux, mais les
   deux ensemble sont le piege 17 dans sa forme la plus trompeuse.
   On demande donc au bouton ce qu'il ouvre. Le jour ou il changera
   encore, l'outil suivra tout seul. */
const CIBLE = await page.getAttribute(".nav-cta", "data-modal-open");
await page.click(".nav-cta");
await page.waitForTimeout(420);
const ouverte = await page.evaluate((id) => {
  const m = document.getElementById(id);
  const p = m && m.querySelector(".modal-panel");
  return { open: !!m && m.classList.contains("is-open"), clip: p ? getComputedStyle(p).clipPath : "", focus: document.activeElement.tagName };
}, CIBLE);
dire(ouverte.open, `modale ouverte (${CIBLE})`);
dire(ouverte.clip === "none" || /inset\(0px\)/.test(ouverte.clip), `panneau entierement degage apres l'ouverture : ${ouverte.clip}`);
await page.keyboard.press("Escape");
await page.waitForTimeout(500);
const refermee = await page.evaluate((id) => {
  const m = document.getElementById(id);
  const p = m && m.querySelector(".modal-panel");
  return { hidden: m.hidden, clip: p ? getComputedStyle(p).clipPath : "", focus: (document.activeElement.className || document.activeElement.tagName) };
}, CIBLE);
dire(refermee.hidden, "modale refermee et retiree du document");
dire(refermee.clip === "none" || /inset\(0px\)/.test(refermee.clip), `clip-path de sortie nettoye : ${refermee.clip}`);
dire(/nav-cta/.test(refermee.focus), `focus rendu au declencheur : ${refermee.focus}`);

/* --- champ : erreur puis reparation --- */
await page.click('[data-modal-open="modal-refer"]');
await page.waitForTimeout(400);
const champs = await page.$$('#modal-refer form input');
if (champs.length) {
  await page.evaluate(() => {
    const f = document.querySelector("#modal-refer form");
    if (f) f.querySelector('button[type="submit"], .btn--primary').click();
  });
  await page.waitForTimeout(350);
  const enErreur = await page.$$eval("#modal-refer .field.is-invalid", n => n.length);
  dire(enErreur > 0, `champs marques en erreur apres un envoi vide : ${enErreur}`);
  const trame = await page.evaluate(() => {
    const i = document.querySelector("#modal-refer .field.is-invalid input");
    return i ? getComputedStyle(i).backgroundImage : "";
  });
  dire(/repeating-linear-gradient/.test(trame), "le filet d'un champ refuse est une TRAME, pas seulement une couleur");
}
await page.keyboard.press("Escape");
await page.waitForTimeout(450);

/* --- bourgeon --- */
await page.setViewportSize({ width: 900, height: 900 });
await page.waitForTimeout(200);
await page.click("#burger");
await page.waitForTimeout(320);
const burger = await page.evaluate(() => ({
  ouvert: document.querySelector("#burger").getAttribute("aria-expanded"),
  t: getComputedStyle(document.querySelector("#burger i")).transform
}));
dire(burger.ouvert === "true" && burger.t !== "none", `bourgeon bascule en croix : ${burger.t}`);
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
await page.setViewportSize({ width: 1440, height: 900 });

/* --- bascule de theme --- */
const avantTheme = await page.evaluate(() => document.documentElement.dataset.theme);
await page.click("#themeToggle");
await page.waitForTimeout(600);
const apresTheme = await page.evaluate(() => document.documentElement.dataset.theme);
dire(avantTheme !== apresTheme, `bascule de theme : ${avantTheme} -> ${apresTheme}`);
await page.click("#themeToggle");
await page.waitForTimeout(400);

/* --- question depliee --- */
await page.evaluate(() => document.querySelector("#faq").scrollIntoView());
await page.waitForTimeout(600);
await page.click(".faq-item summary");
await page.waitForTimeout(400);
const faq = await page.evaluate(() => {
  const it = document.querySelector(".faq-item");
  return { open: it.open, filet: getComputedStyle(it, "::before").transform };
});
dire(faq.open && /matrix\(1,/.test(faq.filet), `filet de la question depliee trace : ${faq.filet}`);

/* --- bouton desactive --- */
const off = await page.evaluate(() => {
  const b = document.createElement("button");
  b.className = "btn btn--primary";
  b.disabled = true;
  b.textContent = "Test";
  document.body.appendChild(b);
  const t = getComputedStyle(b, "::before").transform;
  b.remove();
  return t;
});
dire(/matrix\(1, 0, 0, 0,/.test(off) || off === "none", `bouton desactive : aucun aplat (${off})`);

dire(err.length === 0, `erreurs de console : ${err.length}${err.length ? " -> " + err.slice(0,3).join(" | ") : ""}`);
await nav.close();
console.log(`\n${ko === 0 ? "TOUT PASSE" : ko + " ECHEC(S)"}\n`);
process.exit(ko ? 1 : 0);
