/* ============================================================
   LES CRENEAUX, VUS DEPUIS LE SITE
   `node tools/serve.mjs 8099` et `node tools/faux-google.mjs 8098`
   puis `node tools/creneaux-vue.mjs [8099] [8098]`

   POURQUOI CET OUTIL EXISTE, EN PLUS DE `creneaux-check.mjs`.
   `creneaux-check` prouve que le SERVICE calcule juste. Il ne
   prouve rien de ce que le visiteur voit : que la page appelle
   vraiment la deuxieme porte, que les heures affichees sont celles
   du serveur et pas une grille en dur, et qu'une journee bloquee
   depuis un telephone sort bien du calendrier a l'ecran.

   « Une sonde du DOM ne peut pas voir un defaut de peinture »
   (piege 25). On fait donc les deux : on lit le DOM ET on
   photographie le panneau, avant et apres le blocage. Les images
   sont dans `tools/_creneaux/`, et elles s'ouvrent.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, "_creneaux");
const SITE = `http://127.0.0.1:${Number(process.argv[2] || 8099)}`;
const SERVICE = `http://127.0.0.1:${Number(process.argv[3] || 8098)}`;

fs.mkdirSync(SORTIE, { recursive: true });

let echecs = 0;
let cas = 0;
function verifier(nom, obtenu, attendu) {
  cas++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) echecs++;
  console.log("    " + (ok ? "OK  " : "ECHEC ") + nom
    + "\n         obtenu  : " + obtenu
    + "\n         attendu : " + attendu);
}

async function service(chemin, corps) {
  const opts = corps
    ? { method: "POST", body: JSON.stringify(corps), headers: { "Content-Type": "text/plain" } }
    : {};
  const r = await fetch(SERVICE + chemin, opts);
  return r.json();
}

async function ouvrir(nav) {
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await ctx.newPage();
  page._erreurs = [];
  page._appels = [];
  page.on("pageerror", (e) => page._erreurs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") page._erreurs.push(m.text()); });
  page.on("request", (r) => { if (r.url().startsWith(SERVICE)) page._appels.push(r.url()); });
  /* Meme interception que `formulaires-prod.mjs` : on ne touche pas
     au `js/config.local.js` de la personne qui lance l'outil. */
  await page.route("**/js/config.local.js", (route) => route.fulfill({
    status: 200,
    contentType: "text/javascript; charset=utf-8",
    body: `window.ADEXWEB_ENVOI = ${JSON.stringify(SERVICE)};\n`
  }));
  /* Le popup cadeau capture tous les evenements de pointeur.  (18) */
  await page.addInitScript(() => {
    try { sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {}
  });
  await page.goto(SITE + "/index.html", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  return page;
}

/* Ouvre la modale, attend que la porte ait repondu, et rend ce que
   l'ECRAN montre. */
async function ouvrirReservation(page) {
  await page.evaluate(() => document.querySelector('[data-modal-open="modal-booking"]').click());
  /* On attend la NOTE, pas un delai. Un `waitForTimeout` fixe rend
     l'outil dependant de la vitesse de la machine, et un outil qui
     depend de la machine finit par rendre « 0 » sans erreur. */
  await page.waitForFunction(() => {
    const n = document.querySelector("[data-creneaux-note]");
    return n && !n.classList.contains("is-attente");
  }, null, { timeout: 8000 });
  await page.waitForTimeout(260);
  return page.evaluate(() => {
    const note = document.querySelector("[data-creneaux-note]");
    const jours = [...document.querySelectorAll("#calDays .cal-day:not(.is-blank)")];
    return {
      note: (note && note.textContent.trim()) || "",
      filet: Boolean(note && note.classList.contains("is-filet")),
      ouverts: jours.filter((d) => !d.disabled).map((d) => d.textContent.trim()),
      mois: (document.querySelector("#calMonth") || {}).textContent || ""
    };
  });
}

async function choisirJour(page, numero) {
  return page.evaluate((n) => {
    const d = [...document.querySelectorAll("#calDays .cal-day:not(.is-blank):not([disabled])")]
      .find((x) => x.textContent.trim() === String(n));
    if (!d) return null;
    d.click();
    return true;
  }, numero);
}

async function heuresAffichees(page) {
  await page.waitForTimeout(200);
  return page.evaluate(() =>
    [...document.querySelectorAll("#slotsList .slot")].map((b) => b.textContent.trim()));
}

async function photo(page, nom) {
  const cible = await page.$("#modal-booking .modal-panel");
  const fichier = path.join(SORTIE, nom + ".png");
  await (cible || page).screenshot({ path: fichier });
  console.log("         image   : tools/_creneaux/" + nom + ".png");
  return fichier;
}

console.log("============================================================");
console.log("LES CRENEAUX, VUS DEPUIS LE SITE");
console.log("============================================================");

/* Le service doit repondre AVANT qu'on accuse la page. Un service
   muet ferait passer le filet pour un defaut du site. */
const vie = await service("/");
if (!vie || vie.creneaux !== true) {
  console.error("Le service sur " + SERVICE + " ne rend pas de creneaux.");
  console.error("Lancez `node tools/faux-google.mjs 8098` d’abord.");
  process.exit(1);
}
await service("/_vider-calendrier");

const nav = await chromium.launch();

/* ============================================================
   1 · LE SITE APPELLE VRAIMENT LA DEUXIEME PORTE
   ============================================================ */
console.log("");
console.log("--- 1 · LA PAGE INTERROGE L'AGENDA");
const page1 = await ouvrir(nav);
const vu1 = await ouvrirReservation(page1);

const appelCreneaux = page1._appels.filter((u) => u.indexOf("action=creneaux") !== -1);
verifier("la page a appele ?action=creneaux", appelCreneaux.length >= 1, true);
verifier("elle n'est PAS retombee sur le filet", vu1.filet, false);
console.log("    note affichee : « " + vu1.note + " »");
console.log("    mois          : " + vu1.mois.trim());
console.log("    jours ouverts : " + vu1.ouverts.join(" "));

/* LES HEURES VIENNENT DU SERVEUR, PAS DE `BOOKING.slots`. On
   compare a la reponse de la porte, jour par jour : c'est le seul
   controle qui distingue « affiche des heures » de « affiche LES
   BONNES heures ». */
const porte = await (await fetch(SERVICE + "/?action=creneaux")).json();
const premier = porte.jours[0];
const [, , jourNum] = premier.date.split("-");
await choisirJour(page1, Number(jourNum));
const heures1 = await heuresAffichees(page1);
verifier("les heures affichees sont celles du serveur",
  heures1.join(" "), premier.creneaux.map((c) => c.h).join(" "));
await photo(page1, "1-agenda-libre");
verifier("aucune erreur console", page1._erreurs.length, 0);

/* ============================================================
   2 · UNE JOURNEE BLOQUEE DEPUIS LE TELEPHONE DISPARAIT

   C'est la promesse exacte du guide. On pose l'evenement comme
   l'application Agenda le poserait — une journee entiere, sans
   heure — et on rouvre la modale.
   ============================================================ */
console.log("");
console.log("--- 2 · UNE JOURNEE BLOQUEE DISPARAIT DE L'ECRAN");
const jourABloquer = porte.jours[1];
const numBloque = Number(jourABloquer.date.split("-")[2]);
await service("/_evenement", { titre: "Congé", jour: jourABloquer.date });
console.log("    evenement pose : toute la journee du " + jourABloquer.date);

const page2 = await ouvrir(nav);
const vu2 = await ouvrirReservation(page2);
console.log("    jours ouverts : " + vu2.ouverts.join(" "));
verifier("le jour bloque etait cliquable avant",
  vu1.ouverts.indexOf(String(numBloque)) !== -1, true);
verifier("il ne l'est plus",
  vu2.ouverts.indexOf(String(numBloque)) !== -1, false);
verifier("les autres jours n'ont pas bougé",
  vu2.ouverts.filter((d) => d !== String(numBloque)).join(" "),
  vu1.ouverts.filter((d) => d !== String(numBloque)).join(" "));
await photo(page2, "2-journee-bloquee");
verifier("aucune erreur console", page2._erreurs.length, 0);

/* ============================================================
   3 · UN EVENEMENT PARTIEL NE RETIRE QUE SES HEURES
   ============================================================ */
console.log("");
console.log("--- 3 · UN EVENEMENT DE 14 h A 16 h");
await service("/_vider-calendrier");
const jourPartiel = porte.jours[2];
const [pa, pm, pj] = jourPartiel.date.split("-").map(Number);
/* On pose l'evenement en demandant l'instant au SERVICE, pour ne
   pas refaire ici un calcul de fuseau qui pourrait diverger. */
const bornes = await (await fetch(SERVICE + "/?action=creneaux")).json();
const jourRef = bornes.jours.find((j) => j.date === jourPartiel.date);
const a14 = jourRef.creneaux.find((c) => c.h === "13 h 30") || jourRef.creneaux[4];
const debut = new Date(a14.iso);
const fin = new Date(debut.getTime() + 2 * 3600000);
await service("/_evenement", { titre: "Chantier", debut, fin });
console.log("    evenement pose : " + jourPartiel.date + " de " + a14.h + " sur 2 h");

const page3 = await ouvrir(nav);
await ouvrirReservation(page3);
await choisirJour(page3, pj);
const heures3 = await heuresAffichees(page3);
const avant3 = jourPartiel.creneaux.map((c) => c.h);
console.log("    avant : " + avant3.join("  "));
console.log("    apres : " + (heures3.join("  ") || "(aucune)"));
verifier("la journee reste ouverte", heures3.length > 0, true);
verifier("des heures sont parties", heures3.length < avant3.length, true);
verifier("l'heure de l'evenement n'est plus offerte", heures3.indexOf(a14.h), -1);
await photo(page3, "3-heures-retirees");
verifier("aucune erreur console", page3._erreurs.length, 0);

/* ============================================================
   4 · LE FILET — QUAND L'AGENDA NE REPOND PAS

   On coupe la porte au niveau du reseau. Le calendrier doit rester
   utilisable, et il doit DIRE que les plages ne sont pas
   confirmees. Un calendrier vide sans explication serait pire
   qu'une grille approximative annoncee comme telle.
   ============================================================ */
console.log("");
console.log("--- 4 · L'AGENDA NE REPOND PAS");
await service("/_vider-calendrier");
const ctx4 = await nav.newContext({ viewport: { width: 1440, height: 950 } });
const page4 = await ctx4.newPage();
page4._erreurs = [];
page4.on("pageerror", (e) => page4._erreurs.push(String(e)));
page4.on("console", (m) => { if (m.type() === "error") page4._erreurs.push(m.text()); });
await page4.route("**/js/config.local.js", (route) => route.fulfill({
  status: 200, contentType: "text/javascript; charset=utf-8",
  body: `window.ADEXWEB_ENVOI = ${JSON.stringify(SERVICE)};\n`
}));
await page4.route("**/*action=creneaux*", (route) => route.abort());
await page4.addInitScript(() => {
  try { sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {}
});
await page4.goto(SITE + "/index.html", { waitUntil: "load" });
await page4.waitForTimeout(1500);
const vu4 = await ouvrirReservation(page4);
console.log("    note affichee : « " + vu4.note + " »");
verifier("la note passe en filet", vu4.filet, true);
verifier("elle dit que ce n'est pas une confirmation",
  /pas une confirmation/i.test(vu4.note), true);
verifier("le calendrier reste utilisable", vu4.ouverts.length > 0, true);
const jour4 = vu4.ouverts[0];
await choisirJour(page4, Number(jour4));
const heures4 = await heuresAffichees(page4);
verifier("des plages restent proposees", heures4.length > 0, true);
console.log("    plages du filet : " + heures4.join("  "));
await photo(page4, "4-filet");

/* LA SEULE ERREUR CONSOLE ADMISE DE TOUT LE PROJET, ET ELLE N'EST
   PAS DE NOUS. Quand une requete reseau echoue vraiment, Chrome
   l'ecrit dans la console — « Failed to load resource » — AVANT
   que le `.catch()` du script ait la main. Le code ne peut pas
   l'empecher : elle est emise par le moteur, pas par nous.

   ON NE BAISSE PAS LE SEUIL POUR AUTANT. On nomme cette ligne-la,
   et on exige zero pour tout le reste. Une vraie erreur de script
   dans le repli — c'est le chemin le moins parcouru, donc le plus
   susceptible d'en porter une — serait comptee. */
{
  const bruitReseau = /Failed to load resource|net::ERR_|ERR_FAILED/i;
  const vraies = page4._erreurs.filter((e) => !bruitReseau.test(String(e)));
  console.log("    console : " + page4._erreurs.length + " ligne(s), dont "
    + vraies.length + " hors bruit reseau");
  page4._erreurs.forEach((e) => console.log("         · " + String(e).slice(0, 120)));
  verifier("aucune erreur console autre que l'echec reseau simule", vraies.length, 0);
}

await nav.close();

console.log("");
console.log("============================================================");
console.log(echecs === 0
  ? "L'ECRAN DIT LA VERITE DE L'AGENDA : " + cas + " / " + cas
  : "L'ECRAN NE DIT PAS LA VERITE : " + echecs + " echec(s) sur " + cas);
console.log("Les quatre images : tools/_creneaux/");
console.log("============================================================");
process.exit(echecs === 0 ? 0 : 1);
