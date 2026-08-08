/* ============================================================
   LA PLANCHE DE L'ESTIMATEUR — `node tools/estimateur-vue.mjs`

   CE QU'IL FAIT : il photographie chaque ecran du questionnaire,
   sur les cinq chemins, en deux largeurs et deux themes. Rien
   d'autre. Aucun verdict — c'est une planche a REGARDER, et c'est
   le seul arbitre d'une question de peinture (piege 25 · 77 · 83 :
   une sonde du DOM ne peut pas voir un defaut de peinture).

   DEUX PRECAUTIONS PAYEES CHER AILLEURS :

     · CAPTURE DE FENETRE, JAMAIS `fullPage` NI D'ELEMENT. La
       modale vit dans le flux d'une page de 16 000 px : `fullPage`
       rend une image ou le formulaire fait trois millimetres. Et
       une capture d'ELEMENT peint une barre collante a sa position
       collee — elle invente un recouvrement qui n'existe pas.

     · ON ATTEND `data-palier`, PAS UN DELAI FIXE. Une sonde lue
       avant que l'attribut arrive ne voit pas la vraie page : il
       change la peinture. Piege 87. Le nom du fichier le porte.

   Sortie : 0 toujours. Cet outil ne juge rien, il montre.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { servir, gs } from "./faux-google.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const SORTIE = path.join(RACINE, "preuves", "estimateur-vue");
fs.mkdirSync(SORTIE, { recursive: true });
for (const f of fs.readdirSync(SORTIE)) fs.unlinkSync(path.join(SORTIE, f));

const ARRET = (m) => { console.error("\nARRET · " + m); process.exit(2); };

gs.initialiser();
const GOOGLE = servir(0);
await new Promise((r) => GOOGLE.once("listening", r));
const SERVICE = "http://127.0.0.1:" + GOOGLE.address().port + "/exec";

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png",
  ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif",
  ".pdf": "application/pdf", ".json": "application/json" };
const site = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const f = path.join(RACINE, p);
  if (!f.startsWith(RACINE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404); res.end("non"); return;
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => site.listen(0, r));
const BASE = "http://127.0.0.1:" + site.address().port;

const nav = await chromium.launch();
let images = 0;

async function page(l, h, theme) {
  const ctx = await nav.newContext({ viewport: { width: l, height: h },
    colorScheme: theme === "sombre" ? "dark" : "light" });
  const p = await ctx.newPage();
  await p.route("**/js/config.local.js", (r) => r.fulfill({
    status: 200, contentType: "text/javascript; charset=utf-8",
    body: "window.ADEXWEB_ENVOI = " + JSON.stringify(SERVICE) + ";\n" }));
  await p.addInitScript(() => {
    try {
      sessionStorage.setItem("adexweb-sans-popup", "1");
      sessionStorage.setItem("adexweb-entree-saut", "1");
    } catch (e) {}
  });
  await p.goto(BASE + "/index.html", { waitUntil: "load" });
  await p.waitForFunction(() => document.documentElement.hasAttribute("data-palier"),
    null, { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(400);
  return p;
}

async function ouvrir(p) {
  await p.evaluate(() => {
    document.querySelectorAll(".modal").forEach((m) => { m.hidden = true; });
    ["project", "estimate", "refer", "booking"].forEach((k) => {
      try { localStorage.removeItem("adexweb-brouillon-" + k); } catch (e) {}
      try { localStorage.removeItem("adexweb-sid-" + k); } catch (e) {}
    });
  });
  const b = await p.$('[data-modal-open="modal-estimate"]');
  if (!b) ARRET("rien n'ouvre l'estimateur");
  await b.evaluate((el) => el.click());
  await p.waitForTimeout(450);
}

async function tirer(p, nom, palier) {
  const f = path.join(SORTIE, nom + "--palier" + palier + ".png");
  await p.screenshot({ path: f });
  images++;
  return f;
}

async function choisir(p, cle, v) {
  const ok = await p.evaluate(([c, val]) => {
    const s = document.querySelector("#wizard .step[data-step]:not([hidden])");
    const g = s && s.querySelector('.options[data-key="' + c + '"]');
    const b = g && [...g.querySelectorAll("button")].find((x) => x.dataset.value === val);
    if (!b) return false;
    b.click(); return true;
  }, [cle, v]);
  if (!ok) ARRET("choix impossible : " + cle + " = " + v);
  await p.waitForTimeout(240);
}
async function cocher(p, vs) {
  await p.evaluate((valeurs) => {
    const s = document.querySelector("#wizard .step[data-step]:not([hidden])");
    valeurs.forEach((v) => {
      const c = s.querySelector('input[type="checkbox"][value="' + CSS.escape(v) + '"]');
      if (c) { c.checked = true; c.dispatchEvent(new Event("change", { bubbles: true })); }
    });
  }, vs);
  await p.waitForTimeout(160);
}
async function suivant(p) {
  await p.evaluate(() => {
    const s = document.querySelector("#wizard .step[data-step]:not([hidden])");
    const b = s && s.querySelector("[data-esuivant]");
    if (b) b.click();
  });
  await p.waitForTimeout(300);
}

const CHEMINS = [
  { nom: "vitrine", type: "Un site pour présenter mon entreprise",
    ampleur: "6 à 15 pages",
    fonctions: ["Un formulaire de contact", "La prise de rendez-vous en ligne"],
    second: ["contenu", "Tout est à faire"] },
  { nom: "boutique", type: "Une boutique en ligne", ampleur: "25 à 250 produits",
    fonctions: ["Le paiement en ligne", "Le calcul de la livraison",
                "Un panneau pour gérer mes produits"],
    second: ["contenu", "J’en ai une partie"] },
  { nom: "outil", type: "Un outil de soumission ou de calcul", ampleur: "Un rendu en 3D",
    fonctions: ["Il s’installe dans mon site", "Un tableau des soumissions reçues"],
    second: ["complexite", "Beaucoup de règles et de contraintes"] },
  { nom: "logiciel", type: "Un logiciel ou une application sur mesure",
    ampleur: "Plus de 15 écrans",
    fonctions: ["Des comptes et des permissions", "Une application mobile"],
    second: ["usagers", "Mes clients aussi"] },
  { nom: "auto", type: "Automatiser des tâches qui me prennent du temps", sansPrix: true }
];

for (const [l, h, tag] of [[1440, 950, "1440"], [390, 844, "390"]]) {
  for (const theme of ["clair", "sombre"]) {
    const p = await page(l, h, theme);
    const palier = await p.getAttribute("html", "data-palier");

    /* --- l'ecran 1, une fois par largeur et par theme --- */
    await ouvrir(p);
    await tirer(p, tag + "-" + theme + "-01-type", palier);

    for (const c of CHEMINS) {
      /* Sur telephone et en sombre on ne refait que deux chemins :
         quatre-vingts images se regardent, deux cents non. */
      if (tag === "390" && ["outil", "logiciel"].indexOf(c.nom) !== -1) continue;
      if (theme === "sombre" && ["outil", "logiciel"].indexOf(c.nom) !== -1) continue;

      await ouvrir(p);
      await choisir(p, "type_de_projet", c.type);
      await tirer(p, tag + "-" + theme + "-" + c.nom + "-02-ampleur", palier);

      if (c.sansPrix) {
        await p.fill("#esBesoin", "Retaper chaque commande dans la comptabilité, "
          + "et répondre trente fois par semaine à la même question de prix.");
        await tirer(p, tag + "-" + theme + "-" + c.nom + "-03-besoin", palier);
        await suivant(p);
      } else {
        await choisir(p, "ampleur", c.ampleur);
        await tirer(p, tag + "-" + theme + "-" + c.nom + "-03-fonctions", palier);
        await cocher(p, c.fonctions);
        await tirer(p, tag + "-" + theme + "-" + c.nom + "-04-fonctions-cochees", palier);
        await suivant(p);
        await tirer(p, tag + "-" + theme + "-" + c.nom + "-05-soin", palier);
        await choisir(p, "niveau_design", "Marqué, avec des animations");
        await choisir(p, c.second[0], c.second[1]);
        await tirer(p, tag + "-" + theme + "-" + c.nom + "-06-soin-repondu", palier);
        await suivant(p);
      }

      await tirer(p, tag + "-" + theme + "-" + c.nom + "-07-echeance", palier);
      await choisir(p, "echeancier", "Dans 1 à 3 mois");
      await choisir(p, "taille_equipe", "6 à 25 personnes");
      await suivant(p);
      await tirer(p, tag + "-" + theme + "-" + c.nom + "-08-coordonnees", palier);

      await p.fill("#esName", "Réal Bélanger");
      await p.fill("#esEmail", "real@garage-belanger.ca");
      await p.fill("#esPhone", "418 555 0142");
      await p.evaluate(() => {
        document.querySelector('#modal-estimate form[data-form="estimate"] [data-submit]').click();
      });
      await p.waitForTimeout(1500);
      await tirer(p, tag + "-" + theme + "-" + c.nom + "-09-prix", palier);

      if (!c.sansPrix) {
        /* Le « oui », puis le « non » et sa porte de sortie. */
        await p.evaluate(() => {
          document.querySelector('#esDevisQuestion .choices button[data-value="Oui"]').click();
        });
        await p.waitForTimeout(450);
        await tirer(p, tag + "-" + theme + "-" + c.nom + "-10-oui", palier);

        await p.evaluate(() => {
          document.getElementById("esDevisOui").hidden = true;
          document.getElementById("esDevisQuestion").hidden = false;
          document.querySelector('#esDevisQuestion .choices button[data-value="Non"]').click();
        });
        await p.waitForTimeout(450);
        await tirer(p, tag + "-" + theme + "-" + c.nom + "-11-non", palier);

        await p.evaluate(() => {
          document.querySelector('.choices[data-choice="prix_pourquoi"] button[data-value="C’est au-dessus de mon budget"]').click();
        });
        await p.waitForTimeout(500);
        await p.evaluate(() => {
          const e = document.getElementById("esPetit");
          if (e && !e.hidden) e.scrollIntoView({ block: "center" });
        });
        await p.waitForTimeout(300);
        await tirer(p, tag + "-" + theme + "-" + c.nom + "-12-plus-petit", palier);
      }
    }
    await p.context().close();
  }
}

await nav.close();
site.close();
GOOGLE.close();

if (images < 40) ARRET("seulement " + images + " images — la planche est incomplete");
console.log("");
console.log("============================================================");
console.log(images + " images dans preuves/estimateur-vue/");
console.log("Rien n'est juge ici : cette planche se REGARDE.");
console.log("============================================================");
