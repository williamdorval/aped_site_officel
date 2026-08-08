/* ============================================================
   LA PAGE DE CONFIDENTIALITE — CE QU'ELLE DIT, ET CE QU'ELLE NE
   DIT PAS
   `node tools/serve.mjs 8099` puis
   `node tools/confidentialite-check.mjs [port]`

   POURQUOI CET OUTIL EXISTE. Une politique de confidentialite est
   la page du site ou une phrase fausse coute le plus cher : c'est
   la seule qu'on cite en cas de plainte. Les deux facons de se
   tromper sont symetriques —
     · PROMETTRE ce qu'on ne tient pas (une duree de conservation
       que rien n'applique, un chiffrement qu'on n'a pas) ;
     · TAIRE ce qu'on doit dire (que les donnees partent chez
       Google, hors Quebec).
   Cet outil cherche les deux, plus les regles du projet : aucune
   adresse de l'agence, zero requete tierce, zero erreur de
   console, aucun debordement.

   CE QU'IL NE PROUVE PAS : que le texte est juridiquement
   suffisant. Aucun outil ne le peut. Il verifie que ce qui est
   ecrit correspond a ce que le site FAIT.
   ============================================================ */
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { port as portDe } from "./_adresse.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const PORT = portDe(process.argv[2]);
const BASE = `http://127.0.0.1:${PORT}`;

let echecs = 0, cas = 0;
function verifier(nom, obtenu, attendu, note) {
  cas++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) echecs++;
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + nom
    + "\n         obtenu  : " + obtenu
    + "\n         attendu : " + attendu
    + (note ? "\n         " + note : ""));
}
function titre(t) { console.log(""); console.log("--- " + t); }

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1440, height: 950 } });
const page = await ctx.newPage();

const erreurs = [];
const tierces = [];
page.on("pageerror", (e) => erreurs.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
page.on("request", (r) => {
  const u = r.url();
  if (u.startsWith(BASE) || u.startsWith("data:") || u.startsWith("blob:")) return;
  tierces.push(u);
});

await page.goto(BASE + "/confidentialite.html", { waitUntil: "load" });
await page.waitForTimeout(1200);

const texte = await page.evaluate(() => document.body.innerText);

titre("CE QUE LA PAGE DOIT DIRE");
/* Chaque exigence porte SA raison : une liste de mots-cles sans
   pourquoi ne se relit pas dans six mois. */
const EXIGE = [
  [/aucun temoin|ne pose aucun t[ée]moin/i, "qu'aucun temoin n'est pose — c'est le fait qui dispense de bandeau"],
  [/hors Qu[ée]bec|ext[ée]rieur du Qu[ée]bec/i, "que les donnees sortent du Quebec (art. 8, al. 3)"],
  [/Google/, "chez qui elles vont, nommement"],
  [/30\s*jours/, "le delai de reponse a une demande de retrait"],
  [/rectif/i, "le droit de rectification"],
  [/retirer votre consentement|retrait/i, "le droit de retirer son consentement"],
  [/Commission d’acc[èe]s|Commission d'acc[èe]s/i, "le recours a la CAI"],
  /* UN NOM, PAS UNE FONCTION.  D-789
     Le motif cherchait « la personne exercant la plus haute
     autorite » — la formule par defaut de la Loi 25 quand personne
     n'a ete designe. Elle est valable et inutile : le visiteur ne
     sait pas a qui il parle. Le motif cherche donc un NOM, ce qui
     interdit de revenir a la formule generique sans que l'outil le
     dise. */
  /* LE MOTIF LIT DU TEXTE RENDU, PAS DU BALISAGE. Un premier jet
     cherchait `<b>` : `innerText` n'en contient jamais, et l'outil
     accusait une page juste. Il exige donc DEUX MOTS CAPITALISES
     apres « est » — un prenom et un nom. */
  [/responsable de la protection[\s\S]{0,90}?est\s+[A-ZÀ-Þ][\wÀ-ÿ'’-]+\s+[A-ZÀ-Þ][\wÀ-ÿ'’-]+/u,
    "qui est responsable, par son nom"],
  [/Derni[èe]re mise à jour/i, "quand elle a ete modifiee"],
  [/vendre?|vend/i, "qu'on ne vend rien"]
];
for (const [re, quoi] of EXIGE) {
  verifier("elle dit " + quoi, re.test(texte), true);
}

titre("CE QU'ELLE NE DOIT PAS DIRE");
/* CE SONT LES PROMESSES QU'ON NE TIENT PAS. Aucune de ces mesures
   n'est en place : les ecrire serait faux, et c'est precisement
   sur ce genre de phrase qu'un client conteste. */
const INTERDIT = [
  /* « CHIFFRER » VEUT DIRE « DEVISER » AU QUEBEC. Le motif large
     `/chiffr[ée]/i` accusait « chiffrer votre projet », qui ne
     promet aucun chiffrement. On vise la promesse technique, pas
     la racine du mot. */
  [/chiffrement|chiffr[ée]es? (de bout|en transit|au repos)|crypt[ée]/i,
   "un chiffrement qu'on n'a pas mis en place"],
  [/RGPD|GDPR/i, "le RGPD, qui ne s'applique pas ici"],
  [/certifi[ée]+e?s?\b|conforme ISO|SOC ?2/i, "une certification qu'on n'a pas"],
  /* LES ACCORDS. `[ée]s?` ne couvre pas « supprimées » : la classe
     prend UN caractere, puis attend un « s » et trouve un « e ».
     Deux motifs sur quatre ne mordaient pas pour cette seule
     raison — un controle qui ne mord pas est un controle absent. */
  [/(supprim|effac|d[ée]truit)[a-zéèê]*\s+automatiquement/i,
   "un effacement automatique que rien n'execute"],
  [/conserv[a-zéèê]*\s+(pendant|durant)\s+\d+/i,
   "une duree de conservation fixe que rien n'applique"],
  [/nous ne conservons aucune/i, "qu'on ne conserve rien, ce qui est faux"],
  /* Les mots peuvent etre separes : « serveurs SONT SITUES au
     Quebec » passait a travers un motif qui exigeait « serveurs
     situes au Quebec ». */
  [/(serveurs?|h[ée]berg[a-zéèê]*|donn[ée]es)[^.]{0,40}\bau Qu[ée]bec\b/i,
   "un hebergement au Quebec"]
];
for (const [re, quoi] of INTERDIT) {
  verifier("elle ne promet pas " + quoi, re.test(texte), false);
}

titre("LES REGLES DU PROJET");
verifier("aucune adresse de l'agence dans le rendu",
  /apedagence/i.test(await page.content()), false);
verifier("aucune requete tierce", tierces.length, 0,
  tierces.length ? JSON.stringify(tierces.slice(0, 3)) : "");
verifier("aucune erreur de console", erreurs.length, 0,
  erreurs.length ? JSON.stringify(erreurs.slice(0, 2)) : "");

const forme = await page.evaluate(() => {
  const mauvais = { rayons: [], ombres: [], degrades: [], flous: [] };
  document.querySelectorAll("main *").forEach((n) => {
    const s = getComputedStyle(n);
    if (parseFloat(s.borderTopLeftRadius) > 0) mauvais.rayons.push(n.className || n.tagName);
    if (s.boxShadow && s.boxShadow !== "none") mauvais.ombres.push(n.className || n.tagName);
    /* Les trames `repeating-linear-gradient` sont des grains, pas
       un fondu : elles sont admises par la loi du projet. */
    if (/(^|[^-])linear-gradient/.test(s.backgroundImage) && !/repeating-/.test(s.backgroundImage)) {
      mauvais.degrades.push(n.className || n.tagName);
    }
    if (s.filter && /blur/.test(s.filter)) mauvais.flous.push(n.className || n.tagName);
    if (s.backdropFilter && s.backdropFilter !== "none") mauvais.flous.push(n.className || n.tagName);
  });
  return mauvais;
});
verifier("rayon 0 partout", forme.rayons.length, 0, JSON.stringify(forme.rayons.slice(0, 3)));
verifier("aucune ombre portee", forme.ombres.length, 0, JSON.stringify(forme.ombres.slice(0, 3)));
verifier("aucun degrade", forme.degrades.length, 0, JSON.stringify(forme.degrades.slice(0, 3)));
verifier("aucun flou", forme.flous.length, 0, JSON.stringify(forme.flous.slice(0, 3)));

titre("ELLE TIENT SUR UN TELEPHONE");
for (const largeur of [320, 390, 1440]) {
  await page.setViewportSize({ width: largeur, height: 900 });
  await page.waitForTimeout(300);
  const d = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth);
  verifier("aucun debordement horizontal a " + largeur + " px", d, false);
}

titre("ON Y ARRIVE DEPUIS LE SITE");
await page.setViewportSize({ width: 1440, height: 950 });
await page.goto(BASE + "/index.html", { waitUntil: "load" });
await page.waitForTimeout(2400);
const liens = await page.evaluate(() =>
  [...document.querySelectorAll('a[href="confidentialite.html"]')].length);
verifier("l'accueil y renvoie", liens > 0, true, liens + " lien(s)");

/* UNE MENTION PAR FORMULAIRE, rattachee au <form> qui l'ouvre —
   compter les occurrences ne dirait pas si sept mentions sont dans
   le meme formulaire. */
const rattachees = await page.evaluate(() => {
  const out = {};
  document.querySelectorAll(".form-legal").forEach((p) => {
    const f = p.closest("form, dialog");
    const cle = (f && (f.id || f.dataset.form)) || "?";
    out[cle] = (out[cle] || 0) + 1;
  });
  return out;
});
const noms = Object.keys(rattachees);
verifier("sept formulaires distincts portent une mention", noms.length, 7,
  JSON.stringify(rattachees));
verifier("aucun n'en porte deux",
  Object.values(rattachees).filter((n) => n !== 1).length, 0);

await nav.close();
console.log("");
console.log("============================================================");
console.log(`LA CONFIDENTIALITE : ${cas - echecs} / ${cas}`);
console.log("============================================================");
process.exit(echecs ? 1 : 0);
