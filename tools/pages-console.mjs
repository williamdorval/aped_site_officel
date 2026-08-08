/* ============================================================
   ZERO ERREUR SUR LES NEUF PAGES.
   `node tools/serve.mjs 8099` puis `node tools/pages-console.mjs [port]`

   CE QU'IL SURVEILLE, ET POURQUOI TROIS CHOSES PLUTOT QU'UNE :
     · les messages `error` de la console — une exception dans un
       bloc de `main.js` tue TOUS les blocs qui le suivent, et le
       seul temoin est cette ligne-la ;
     · les `pageerror` — une exception non rattrapee n'apparait pas
       toujours comme message de console selon le moteur ;
     · les REQUETES en echec — un `<script src>` ou un `<link href>`
       qui rend 404 ne leve rien du tout : la page a l'air normale
       et il lui manque la moitie de sa logique.

   IL S'ARRETE S'IL NE TROUVE AUCUNE PAGE. Une sonde qui rend « 0
   erreur sur 0 page » est un test vert sur du vide (piege 30).

   `sessionStorage["adexweb-sans-popup"]` EST POSE AVANT CHAQUE
   CHARGEMENT : sans lui le popup des guides parait a 11 s et
   recouvre tout (piege 18).
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { port as portDe } from "./_adresse.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PORT = portDe(process.argv[2]);
const BASE = `http://127.0.0.1:${PORT}`;

const PAGES = [
  "index.html", "services.html", "realisations.html", "automatisation.html",
  "processus.html", "contact.html", "reference.html", "404.html",
  "confidentialite.html"
];

/* Les pages doivent EXISTER sur le disque : viser une adresse qui
   rend 404 donnerait une page vide, donc zero erreur, donc un faux
   succes. */
const manquantes = PAGES.filter((p) => !fs.existsSync(path.join(RACINE, p)));
if (manquantes.length) {
  console.error("ARRET : page(s) absente(s) du depot — " + manquantes.join(", "));
  process.exit(1);
}
if (PAGES.length === 0) {
  console.error("ARRET : aucune page a verifier.");
  process.exit(1);
}

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });

/* AUCUNE REQUETE TIERCE PENDANT LA MESURE. Le point de sortie reel
   est une adresse Google : la laisser partir ferait dependre le
   verdict du reseau, et compterait une requete tierce. On le vide. */
await ctx.route("**/js/config.local.js", (r) =>
  r.fulfill({ status: 200, contentType: "application/javascript",
              body: 'window.ADEXWEB_ENVOI = "";\n' }));

await ctx.addInitScript(() => {
  try { sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {}
});

const rapport = [];
let total = 0;

for (const page of PAGES) {
  const p = await ctx.newPage();
  const erreurs = [];
  const avertis = [];

  p.on("console", (m) => {
    if (m.type() === "error") erreurs.push("console.error · " + m.text());
    else if (m.type() === "warning") avertis.push("console.warn · " + m.text());
  });
  p.on("pageerror", (e) => erreurs.push("exception · " + (e && e.message ? e.message : String(e))));
  p.on("requestfailed", (r) => erreurs.push("requete perdue · " + r.url()));
  p.on("response", (r) => {
    if (r.status() >= 400) erreurs.push("HTTP " + r.status() + " · " + r.url());
  });

  await p.goto(`${BASE}/${page}`, { waitUntil: "load" });
  /* On laisse tourner : les blocs differes, les IntersectionObserver
     et le premier `roiUpdate` n'ont pas encore parle a `load`. */
  await p.waitForTimeout(2500);
  /* Un aller-retour au bas de page reveille tout ce qui observe. */
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(900);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(600);

  /* LA PREUVE QUE `main.js` A TOURNE JUSQU'AU BOUT. Sans elle, une
     page ou le script meurt a la premiere ligne rendrait « 0
     erreur » : le drapeau est pose par le DERNIER bloc du fichier. */
  const vivant = await p.evaluate(() => document.documentElement.hasAttribute("data-main-ok"));

  rapport.push({ page, erreurs, avertis, vivant });
  total += erreurs.length;
  await p.close();
}

/* ============================================================
   LES PORTES INTER-PAGES  D-844 · D-846

   `js/site.js` renvoie vers `contact.html#<id>` toute porte dont la
   modale n'est pas sur la page ou on a clique. Ce renvoi ne vaut que
   si la page d'arrivee OUVRE la modale nommee : sinon on remplace un
   bouton mort par une porte close, ce qui n'est pas mieux.
   ============================================================ */
console.log("\n--- LES PORTES QUI TRAVERSENT LES PAGES");
let portes = 0, portesKo = 0;
for (const [depart, id] of [
  ["404.html", "modal-refer"],
  ["confidentialite.html", "modal-booking"],
  ["404.html", "modal-urgent"]
]) {
  portes++;
  const p = await ctx.newPage();
  await p.goto(`${BASE}/${depart}`, { waitUntil: "load" });
  await p.waitForTimeout(900);
  const present = await p.evaluate((i) => !!document.getElementById(i), id);
  if (present) {
    console.log(`  · ${depart} porte deja ${id} — rien a renvoyer`);
    await p.close();
    continue;
  }
  /* La porte peut ne pas exister sur cette page : on la fabrique,
     parce que ce qu'on mesure est le MECANISME, pas le balisage. */
  await p.evaluate((i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.id = "porte-essai";
    b.setAttribute("data-modal-open", i);
    b.textContent = "essai";
    document.body.appendChild(b);
  }, id);
  await p.click("#porte-essai");
  await p.waitForTimeout(2200);
  const fin = p.url().split("/").pop();
  const ouverte = await p.evaluate((i) => {
    const m = document.getElementById(i);
    return !!m && !m.hidden;
  }, id);
  const ok = fin.indexOf("contact.html") === 0 && ouverte;
  if (!ok) portesKo++;
  console.log(`  ${ok ? "OK   " : "ECHEC"} ${depart} → ${id} · arrivee « ${fin} » · modale ouverte : ${ouverte}`);
  await p.close();
}

await nav.close();

let mortes = 0;
for (const r of rapport) {
  const etat = r.erreurs.length === 0 ? "ok" : `${r.erreurs.length} ERREUR(S)`;
  console.log(`${r.page.padEnd(22)} ${String(etat).padEnd(14)} main.js ${r.vivant ? "au bout" : "N'A PAS FINI"}`);
  for (const e of r.erreurs) console.log(`    ✗ ${e}`);
  for (const a of r.avertis) console.log(`    · ${a}`);
  if (!r.vivant) mortes++;
}

console.log(`\n${rapport.length} pages · ${total} erreur(s) · ${mortes} page(s) ou main.js n'est pas alle au bout.`);
console.log(`${portes} porte(s) inter-pages · ${portesKo} en echec.`);
if (total > 0 || mortes > 0 || portesKo > 0) process.exit(1);
