/* ============================================================
   LE NUMERO, DANS CHAQUE FORMULAIRE — `node tools/appel-check.mjs`

   POURQUOI CET OUTIL EXISTE.  D-760

   Le numero ne servait que dans la modale d'urgence. Partout
   ailleurs, quelqu'un qui prefere parler devait fermer le
   formulaire, revenir a la page, et chercher. Beaucoup ne le font
   pas : ils ferment, et on ne sait meme pas qu'ils sont passes.

   IL EXIGE TROIS CHOSES, ET LA TROISIEME EST LA PLUS FRAGILE :
     · le lien EXISTE dans chaque formulaire et pointe sur `tel:` ;
     · il fait 44 px de haut, sinon il ne se touche pas au pouce ;
     · un clic FAIT VRAIMENT PARTIR une balise vers notre service.
       Une sonde du DOM ne peut pas le voir — on ecoute le reseau.

   Images : `preuves/appel/`.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const SORTIE = path.join(RACINE, "preuves", "appel");
const BASE = process.env.APED_BASE || "http://127.0.0.1:8099";
fs.mkdirSync(SORTIE, { recursive: true });

let n = 0, ko = 0;
function dire(nom, obtenu, attendu, note) {
  n++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) ko++;
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + nom
    + "\n         obtenu  : " + obtenu + "\n         attendu : " + attendu
    + (note ? "\n         " + note : ""));
}

/* Les six portes, et la modale ou chacune vit. */
const PORTES = [
  /* LE CONTACT VIT DANS LA PAGE, PAS DANS UNE MODALE : il faut
     descendre jusqu'a lui, et un seul `scrollIntoView` n'y arrive
     pas — les sas grandissent la page a mesure. Piege 3. */
  { origine: "contact",  page: true },
  { origine: "booking",  modale: "modal-booking" },
  { origine: "project",  modale: "modal-project" },
  { origine: "refer",    modale: "modal-refer" },
  { origine: "estimate", modale: "modal-estimate" },
  { origine: "urgent",   modale: "modal-urgent" }
];

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 420, height: 900 },
  isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

const erreurs = [];
page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
page.on("pageerror", (e) => erreurs.push("pageerror: " + String(e)));

/* CE QUI PART VERS NOTRE SERVICE, corps compris. C'est la seule
   facon de prouver qu'un clic compte : le DOM ne le dit pas. */
const balises = [];
page.on("request", (r) => {
  if (r.url().indexOf("script.google.com") === -1) return;
  if (r.method() !== "POST") return;
  let corps = "";
  try { corps = r.postData() || ""; } catch (e) {}
  balises.push(corps);
});
/* Le service ne doit pas repondre pour de vrai : on ne veut ni
   ecrire dans le classeur de production, ni attendre 3 s. */
await page.route("**script.google.com/**", (r) =>
  r.fulfill({ status: 200, contentType: "application/json",
    body: JSON.stringify({ success: true, compte: true }) }));

/* DEUX CLES, PAS UNE. `aped-sans-popup` empeche la fenetre des
   guides ; `aped-entree-saut` saute le sas d'entree. Sans la
   seconde, la page reste verrouillee et la traversee n'avance
   pas — l'outil rendait alors « quelque chose recouvre le lien »
   sur un lien que rien ne recouvre. Piege 18. */
await page.addInitScript(() => {
  try {
    sessionStorage.setItem("aped-sans-popup", "1");
    sessionStorage.setItem("aped-entree-saut", "1");
  } catch (e) {}
});
await page.goto(BASE + "/index.html", { waitUntil: "load" });
await page.waitForTimeout(2600);
console.log("data-palier : " + await page.getAttribute("html", "data-palier"));

console.log("");
console.log("--- LE LIEN, FORMULAIRE PAR FORMULAIRE");

for (const p of PORTES) {
  await page.evaluate(() => {
    document.querySelectorAll(".modal").forEach((m) => { m.hidden = true; });
  });
  if (p.page) {
    /* ON TRAVERSE, AU PAS. Un saut direct atterrit a cote : la
       hauteur du document change en chemin. */
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    /* 120 PAS, ET CE N'EST PAS DU LUXE. Le document GRANDIT a
       mesure qu'on descend — les sas s'ouvrent. Mesure : partant de
       16 800 px, il en faisait 5 000 de plus arrive en bas. Une
       boucle de 40 pas s'arretait a mi-chemin et l'outil concluait
       « quelque chose recouvre le lien » sur un point hors de la
       fenetre. Piege 3. */
    for (let y = 0; y < 120; y++) {
      const fini = await page.evaluate(() => {
        window.scrollBy(0, Math.round(innerHeight * 0.8));
        const a = document.querySelector('a[data-appel="contact"]');
        const r = a.getBoundingClientRect();
        return r.top > 0 && r.bottom < innerHeight;
      });
      await page.waitForTimeout(120);
      if (fini) break;
    }
  } else {
    await page.evaluate((id) => {
      const b = document.querySelector('[data-modal-open="' + id + '"]');
      if (b) b.click();
    }, p.modale);
    await page.waitForTimeout(450);
  }

  /* ON DEFILE JUSQU'A LUI AVANT DE MESURER. Une modale defile :
     mesurer sans defiler rend 0 px pour un lien parfaitement sain,
     et « rien ne le recouvre » devient faux parce qu'on interroge un
     point hors de la fenetre. L'outil aurait accuse le site. */
  if (!p.page) {
    await page.evaluate((o) => {
      const a = document.querySelector('a[data-appel="' + o + '"]');
      if (a) a.scrollIntoView({ block: "center" });
    }, p.origine);
    await page.waitForTimeout(250);
  }

  const vu = await page.evaluate((o) => {
    const a = document.querySelector('a[data-appel="' + o + '"]');
    if (!a) return { absent: true };
    const r = a.getBoundingClientRect();
    /* `elementFromPoint` NE VOIT PAS UN RECOUVREMENT en
       `pointer-events: none`, piege 25 — mais il voit tres bien un
       panneau opaque pose par-dessus, qui est le risque ici. */
    const centre = document.elementFromPoint(
      Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
    return {
      href: a.getAttribute("href"),
      hauteur: Math.round(r.height),
      largeur: Math.round(r.width),
      dansLaFenetre: r.top >= 0 && r.bottom <= innerHeight + r.height,
      atteignable: !!(centre && (centre === a || a.contains(centre))),
      texte: a.textContent.replace(/\s+/g, " ").trim()
    };
  }, p.origine);

  console.log("");
  console.log("  · " + p.origine);
  dire("le lien existe", !vu.absent, true);
  if (vu.absent) continue;
  dire("il appelle vraiment", vu.href, "tel:+18195230871");
  dire("il affiche le numero", vu.texte, "819 523-0871");
  dire("44 px de haut, au pouce", vu.hauteur >= 44, true, vu.hauteur + " px");
  dire("rien ne le recouvre", vu.atteignable, true);
}

/* ============================================================
   LE CLIC PART-IL VRAIMENT ?
   ============================================================ */
console.log("");
console.log("--- LA BALISE");
{
  balises.length = 0;
  await page.evaluate(() => {
    const a = document.querySelector('a[data-appel="estimate"]');
    /* On neutralise la navigation `tel:` — le but est la balise,
       pas d'ouvrir une application telephone dans un banc. */
    a.addEventListener("click", (e) => e.preventDefault(), { once: true });
    a.click();
  });
  await page.waitForTimeout(700);

  dire("un clic envoie une balise", balises.length >= 1, true, balises.length + " envoi(s)");
  const corps = balises.length ? JSON.parse(balises[balises.length - 1]) : {};
  dire("elle dit que c'est un appel", corps._form, "appel");
  dire("elle dit d'ou", corps.origine, "estimate");
  dire("elle dit l'appareil", corps.appareil, "mobile");
  dire("elle ne dit RIEN d'autre", Object.keys(corps).sort().join(","),
    "_form,appareil,origine",
    "ni adresse, ni identifiant, ni page — trois mots, c'est tout");
}

/* LA CAPTURE : le bas du formulaire d'estimation, tel qu'on le voit
   au telephone. */
await page.evaluate(() => {
  document.querySelectorAll(".modal").forEach((m) => { m.hidden = true; });
  const b = document.querySelector('[data-modal-open="modal-estimate"]');
  if (b) b.click();
});
await page.waitForTimeout(500);
await page.evaluate(() => {
  const a = document.querySelector('a[data-appel="estimate"]');
  if (a) a.scrollIntoView({ block: "center" });
});
await page.waitForTimeout(350);
const boite = await page.evaluate(() => {
  const a = document.querySelector('a[data-appel="estimate"]');
  const r = a.getBoundingClientRect();
  return { x: 0, y: Math.max(0, Math.round(r.top) - 190),
    width: Math.round(innerWidth), height: 300 };
});
await page.screenshot({ path: path.join(SORTIE, "estimation-telephone.png"), clip: boite });
console.log("");
console.log("  image : preuves/appel/estimation-telephone.png");

dire("aucune erreur de console", erreurs.length, 0, erreurs.slice(0, 3).join(" | "));

await nav.close();
console.log("");
console.log("============================================================");
console.log(ko ? ("LE NUMERO NE TIENT PAS : " + ko + " echec(s) sur " + n)
              : ("LE NUMERO TIENT : " + n + " / " + n));
console.log("============================================================");
process.exit(ko ? 1 : 0);
