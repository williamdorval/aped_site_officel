/* ============================================================
   LA RETENUE PARLE-T-ELLE DE LA BONNE CHOSE ?
   `node tools/retenue-check.mjs`

   CE QU'IL GARDE.  D-768 · D-769

   Le popup disait la même phrase à tout le monde. Quelqu'un à la
   première étape n'a rien investi ; quelqu'un à la sixième sur sept
   a tout investi. Un texte unique se trompe forcément sur l'un des
   deux, et il se trompe le plus cher sur celui qui a le plus donné.

   ET LA RÉSERVATION N'ARMAIT RIEN DU TOUT. Elle était le seul des
   cinq formulaires suivis à n'écrire aucune ligne avant l'envoi
   final : qui choisissait sa plage puis fermait l'onglet
   disparaissait entièrement. Pas de ligne, pas de retenue, pas de
   relance.

   IL LIT LE TEXTE RENDU À L'ÉCRAN, jamais la table de textes. Une
   table juste qu'on n'accroche pas au bon endroit rendrait le même
   verdict que pas de table du tout.

   Sorties : 0 tout tient · 1 défaut.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const SORTIE = path.join(RACINE, "preuves", "retenue");
fs.mkdirSync(SORTIE, { recursive: true });

let n = 0, ko = 0;
function dire(nom, obtenu, attendu, note) {
  n++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) ko++;
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + nom
    + (ok ? "" : "\n         obtenu  : " + JSON.stringify(obtenu)
             + "\n         attendu : " + JSON.stringify(attendu)
             + (note ? "\n         " + note : "")));
}
function titre(t) { console.log(""); console.log("--- " + t); }

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png",
  ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif",
  ".pdf": "application/pdf", ".json": "application/json" };
const serveur = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const f = path.join(RACINE, p);
  if (!f.startsWith(RACINE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404); res.end("non"); return;
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => serveur.listen(0, r));
const BASE = "http://127.0.0.1:" + serveur.address().port;

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 390, height: 844 } });
const erreurs = [];
page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
page.on("pageerror", (e) => erreurs.push(String(e)));

const envois = [];
page.on("request", (r) => {
  if (r.url().indexOf("script.google.com") === -1) return;
  if (r.method() !== "POST") return;
  try { envois.push(r.postData() || ""); } catch (e) {}
});
/* LA PORTE DES CRENEAUX A BESOIN D'UNE VRAIE REPONSE.

   Premiere version : un seul bouchon rendait `{success:true}` a
   TOUT, `?action=creneaux` compris. La liste des plages restait
   vide, la reservation ne pouvait pas franchir son premier ecran,
   et l'outil s'arretait sur « aucune plage offerte » — en accusant
   le site d'un defaut qui n'appartenait qu'au bouchon. */
function fauxCreneaux() {
  const jours = [];
  const d = new Date();
  d.setDate(d.getDate() + 3);
  for (let j = 0; j < 3; j++) {
    const q = new Date(d.getTime() + j * 86400000);
    const cle = q.toISOString().slice(0, 10);
    const creneaux = [];
    for (const [h, m] of [[9, 0], [9, 45], [10, 30], [13, 0], [14, 30]]) {
      const t = new Date(q); t.setHours(h, m, 0, 0);
      creneaux.push({ iso: t.toISOString(), h: h + " h " + String(m).padStart(2, "0") });
    }
    jours.push({ date: cle, libelle: "essai " + cle, libelleLong: "essai " + cle, creneaux: creneaux });
  }
  return { success: true, fuseau: "America/Toronto", duree: 30, preavisHeures: 24,
           horizonJours: 42, total: jours.length * 5, jours: jours };
}
await page.route("**script.google.com/**", (r) => {
  const url = r.request().url();
  const corps = url.indexOf("action=creneaux") !== -1
    ? fauxCreneaux()
    : { success: true, ligne: 2, session: true };
  r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(corps) });
});

await page.addInitScript(() => {
  try {
    sessionStorage.setItem("aped-sans-popup", "1");
    sessionStorage.setItem("aped-entree-saut", "1");
  } catch (e) {}
});
await page.goto(BASE + "/index.html", { waitUntil: "load" });
await page.waitForTimeout(2800);
console.log("data-palier : " + await page.getAttribute("html", "data-palier"));

/* La retenue ne s'ouvre qu'UNE fois par navigateur : `aped-retenue-vue`
   la verrouille. Chaque cas la deverrouille, sinon seul le premier
   mesure quelque chose et les autres rendent « rien n'a change » —
   ce qui ressemble trait pour trait a une reussite. */
/* ON PILOTE LES VRAIS FORMULAIRES.

   Premiere version : elle envoyait un evenement `aped:test-retenue`
   qui n'existe nulle part, et il aurait fallu poser un crochet dans
   le code de production pour qu'il existe. Un banc qui se fait
   ouvrir une porte derobee ne mesure plus le site, il mesure la
   porte derobee — et `retenuePossible` n'est appelee QUE depuis
   `enregistrerDiscret`. C'est ce chemin-la qu'il faut emprunter,
   parce que c'est le seul que le visiteur emprunte. */

const OUVREURS = {
  project: "modal-project", estimate: "modal-estimate",
  refer: "modal-refer", booking: "modal-booking"
};

async function fermerTout() {
  await page.evaluate(() => {
    try { localStorage.removeItem("aped-retenue-vue"); } catch (e) {}
    const r = document.getElementById("retenue");
    if (r) r.hidden = true;
    document.querySelectorAll(".modal").forEach((m) => {
      m.hidden = true; m.classList.remove("is-open");
    });
  });
  await page.waitForTimeout(120);
}

async function ouvrir(kind) {
  await fermerTout();
  const b = await page.$('[data-modal-open="' + OUVREURS[kind] + '"]');
  if (!b) { console.error("ARRET · rien n'ouvre " + kind); process.exit(2); }
  await b.evaluate((el) => el.click());
  await page.waitForTimeout(600);
}

/* Remplit l'obligatoire de l'ecran visible d'un assistant. */
async function remplirVisible(racine, attr) {
  await page.evaluate(([sel, a]) => {
    const etape = [...document.querySelectorAll(sel + " .step[" + a + "]")]
      .find((s) => !s.hidden);
    if (!etape) return;
    etape.querySelectorAll(".choices").forEach((g) => {
      const cache = g.parentElement.querySelector('input[type="hidden"]');
      if (cache && !cache.value) { const b = g.querySelector("button"); if (b) b.click(); }
    });
    etape.querySelectorAll(".field").forEach((f) => {
      const cases = f.querySelectorAll('input[type="checkbox"]');
      if (cases.length) {
        if (![...cases].some((c) => c.checked)) {
          cases[0].checked = true;
          cases[0].dispatchEvent(new Event("change", { bubbles: true }));
        }
        return;
      }
      const el = f.querySelector("input, select, textarea");
      if (!el || !el.required || el.type === "hidden" || el.value) return;
      if (el.tagName === "SELECT") {
        const o = [...el.options].find((x) => x.value);
        if (o) { el.value = o.value; el.dispatchEvent(new Event("change", { bubbles: true })); }
        return;
      }
      el.value = el.type === "email" ? "zz@exemple.ca"
               : el.type === "tel" ? "8195230871"
               : el.type === "url" ? "https://exemple.ca" : "ZZ essai";
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }, [racine, attr]);
  await page.waitForTimeout(110);
}

const visible = (racine, attr) => page.evaluate(([sel, a]) => {
  const s = [...document.querySelectorAll(sel + " .step[" + a + "]")].find((x) => !x.hidden);
  return s ? Number(s.getAttribute(a)) : 0;
}, [racine, attr]);

/* Amene le formulaire `kind` a l'etape `cible`, par ses boutons. */
async function menerA(kind, cible) {
  await ouvrir(kind);
  if (kind === "booking") {
    /* LA MODALE S'OUVRE SUR LE CALENDRIER, PAS SUR LES CHAMPS.
       Premiere version : elle tapait dans `#bkName` et expirait au
       bout de 30 s sur « element is not visible ». Le formulaire
       vit a l'ecran 2 ; on y arrive en CHOISISSANT UNE PLAGE, et
       c'est justement le geste qui donne de la valeur a ce qu'on
       s'apprete a perdre. */
    await page.waitForTimeout(1600);
    /* LE JOUR D'ABORD, LA PLAGE ENSUITE. `renderSlots` ne peint
       rien tant qu'aucune date n'est choisie : chercher un bouton
       de plage avant d'avoir clique un jour, c'est chercher dans
       une liste que le code n'a pas encore de raison de remplir. */
    const jourPris = await page.evaluate(() => {
      const j = document.querySelector(".cal-day:not(.is-blank):not([disabled])");
      if (!j) return false;
      j.click(); return true;
    });
    if (!jourPris) { console.error("ARRET · aucun jour ouvrable offert"); process.exit(2); }
    await page.waitForTimeout(500);
    const pris = await page.evaluate(() => {
      const b = document.querySelector("#slotsList button:not([disabled])");
      if (!b) return false;
      b.click(); return true;
    });
    if (!pris) { console.error("ARRET · aucune plage offerte : rien a mesurer"); process.exit(2); }
    await page.waitForTimeout(600);
    /* Un seul ecran de champs : l'etape se franchit en donnant
       l'adresse, c'est elle qui declenche l'ecriture. */
    await page.fill("#bkName", "ZZ Retenue");
    await page.fill("#bkEmail", "zz@exemple.ca");
    await page.evaluate(() => document.getElementById("bkEmail").blur());
    await page.waitForTimeout(500);
    return 2;
  }
  if (kind === "estimate") {
    for (let g = 0; g < 14; g++) {
      const ici = await visible("#wizard", "data-step");
      if (ici >= cible || ici >= 10) return ici;
      const ok = await page.evaluate(() => {
        const e = [...document.querySelectorAll("#wizard .step[data-step]")].find((s) => !s.hidden);
        const b = e && e.querySelector(".options button");
        if (b) { b.click(); return true; }
        return false;
      });
      if (!ok) return await visible("#wizard", "data-step");
      await page.waitForTimeout(320);
    }
    return await visible("#wizard", "data-step");
  }
  const racine = kind === "project" ? "#projectWizard" : 'form[data-form="refer"]';
  const attr = kind === "project" ? "data-pstep" : "data-rstep";
  const suivant = kind === "project" ? "#projectNext" : "#referNext";
  for (let g = 0; g < 14; g++) {
    const ici = await visible(racine, attr);
    if (ici >= cible) return ici;
    await remplirVisible(racine, attr);
    await page.click(suivant);
    await page.waitForTimeout(340);
    if (await visible(racine, attr) === ici) return ici;
  }
  return await visible(racine, attr);
}

/* LE DECLENCHEUR REEL : on ferme la modale. `closeModal` programme
   `ouvrirRetenue`. C'est le geste que fait un visiteur qui part. */
async function provoquer() {
  await page.evaluate(() => {
    const b = document.querySelector(".modal:not([hidden]) [data-modal-close]");
    if (b) b.click();
    else document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  });
  await page.waitForTimeout(900);
}

async function armer(kind, etape) {
  await page.evaluate(() => {
    try { localStorage.removeItem("aped-retenue-vue"); } catch (e) {}
    const r = document.getElementById("retenue");
    if (r) r.hidden = true;
  });
  return await menerA(kind, etape);
}

const lu = () => page.evaluate(() => {
  const t = (s) => { const e = document.querySelector(s); return e ? e.textContent.trim() : null; };
  const r = document.getElementById("retenue");
  return {
    ouvert: r ? r.hidden === false : null,
    quoi: t("#retenueQuoi"), titre: t("#retenueTitre"),
    texte: t("#retenueTexte"), bouton: t("#retenueEnvoi [data-label]")
  };
});

/* ============================================================
   1 · LE TEXTE CHANGE AVEC L'ÉTAPE
   ============================================================ */
titre("1 · TROIS ARGUMENTS, PAS UN");
const vus = {};
const RETENUE_GENERIQUE = "On garde votre place ?";
for (const [kind, total, cibles] of [
  /* ON MESURE APRES UNE ETAPE FRANCHIE, JAMAIS A L'ARRIVEE SUR LA
     PREMIERE. `retenuePossible` n'est appelee que par
     `enregistrerDiscret`, donc quand on QUITTE un ecran. Arriver a
     l'ecran 1 n'a rien fait perdre a personne — et la retenue a
     raison de se taire. Le premier cas demandait « ouvre-toi »
     alors qu'il n'y avait rien a retenir. */
  ["project", 8, [2, 4, 7]], ["estimate", 11, [2, 5, 9]],
  ["refer", 5, [2, 3, 4]], ["booking", 3, [2, 2, 2]]
]) {
  vus[kind] = [];
  const noms = ["début", "milieu", "fin"];
  for (let i = 0; i < 3; i++) {
    const atteinte = await armer(kind, cibles[i]);
    await provoquer();
    const v = await lu();
    dire(kind + " · " + noms[i] + " (étape " + atteinte + "/" + total + ") · la retenue s'ouvre",
      v.ouvert, true);
    vus[kind].push(v);
  }
  /* LA RESERVATION N'A QU'UN SEUL ECRAN DE CHAMPS. Exiger trois
     textes differents d'elle, c'est exiger qu'elle mente : ses
     trois mesures tombent forcement au meme endroit du parcours.
     On verifie donc qu'elle a UN texte a elle, pas qu'elle en a
     trois. Le sien se juge en section 2, sur ce qu'il promet. */
  if (kind === "booking") {
    dire(kind + " · elle a un texte à elle",
      vus[kind][0].titre !== RETENUE_GENERIQUE, true,
      "titre lu : " + JSON.stringify(vus[kind][0].titre));
  } else {
    const t3 = vus[kind].map((v) => v.titre);
    dire(kind + " · les trois titres sont DIFFÉRENTS",
      new Set(t3).size, 3, JSON.stringify(t3));
    const x3 = vus[kind].map((v) => v.texte);
    dire(kind + " · les trois textes aussi", new Set(x3).size, 3);
    const b3 = vus[kind].map((v) => v.bouton);
    dire(kind + " · le bouton suit", new Set(b3).size >= 2, true, JSON.stringify(b3));
  }
}

/* ============================================================
   2 · CE QU'ON N'A PAS LE DROIT DE DIRE
   ============================================================ */
titre("2 · LA VÉRACITÉ DES PHRASES");
{
  /* `poserRendezVous` ne tourne qu'a l'envoi final : promettre une
     plage gardee serait faux, et le visiteur le decouvrirait en
     revenant sur un creneau pris. */
  const tousBooking = vus.booking.map((v) => (v.texte + " " + v.titre).toLowerCase()).join(" ");
  dire("la réservation ne promet JAMAIS de garder la plage",
    /garde\w* (votre|la) plage|plage (est )?(bloquée|réservée|retenue)/.test(tousBooking),
    false, tousBooking.slice(0, 200));
  dire("elle dit qu'elle n'est pas encore bloquée",
    /pas encore (bloquée|confirmée)/.test(tousBooking), true);

  /* AUCUNE CULPABILISATION, nulle part : c'est la consigne. */
  const tout = Object.values(vus).flat()
    .map((v) => [v.quoi, v.titre, v.texte].join(" ")).join(" ").toLowerCase();
  dire("aucun « vous n’avez pas terminé »",
    /vous n’avez pas|vous n'avez pas|vous avez oublié|il ne fallait/.test(tout), false);
  dire("aucun compte à rebours ni rareté inventée",
    /dépêchez|vite|dernière chance|plus que \d|expire/.test(tout), false);
  /* « ENREGISTRE » N'EST PAS LE SEUL MOT JUSTE, et l'exiger
     partout forcerait un mensonge. La reservation dit « votre plage
     est notee, pas encore confirmee » : ecrire « enregistree » la
     ferait sonner comme une plage tenue, ce qu'elle n'est pas tant
     que `poserRendezVous` n'a pas tourne. Ce qui doit tenir n'est
     pas le mot, c'est la PROMESSE — que rien n'est perdu. */
  const perdu = Object.values(vus).flat()
    .filter((v) => !/enregistr|not(é|ee|ée)|gard/.test(v.texte.toLowerCase()));
  dire("chaque texte dit que rien n’est perdu", perdu.length, 0,
    JSON.stringify(perdu.map((v) => v.texte)));
}

/* ============================================================
   3 · LE RETOUR EN ARRIÈRE NE FAIT PAS RECULER L'ARGUMENT
   ============================================================ */
titre("3 · REVENIR CORRIGER NE DÉGRADE PAS LE TEXTE");
{
  await armer("project", 7);
  /* IL REVIENT CORRIGER. On recule par le bouton « Retour », donc
     `pStep` recule pour de vrai — c'est le geste qu'on veut juger. */
  for (let i = 0; i < 5; i++) {
    await page.click("#projectBack");
    await page.waitForTimeout(220);
  }
  await page.evaluate(() => { try { localStorage.removeItem("aped-retenue-vue"); } catch (e) {} });
  await provoquer();
  const v = await lu();
  dire("on lui parle encore de ce qu'il a VRAIMENT rempli",
    v.titre, vus.project[2].titre,
    "sinon on dit « vous commencez à peine » à quelqu'un qui a tout rempli");
}

/* ============================================================
   4 · LA RÉSERVATION LAISSE ENFIN UNE TRACE
   ============================================================ */
titre("4 · LA RÉSERVATION ENREGISTRE EN CHEMIN  (D-769)");
{
  await page.evaluate(() => {
    document.querySelectorAll(".modal").forEach((m) => { m.hidden = true; });
    try { localStorage.removeItem("aped-sid-booking"); } catch (e) {}
  });
  /* MEME CHEMIN QU'EN SECTION 1 : jour, puis plage, puis champs.
     Une deuxieme version du meme parcours ecrite a la main finit
     toujours par diverger de la premiere. */
  await ouvrir("booking");
  await page.waitForTimeout(1600);
  await page.evaluate(() => {
    const j = document.querySelector(".cal-day:not(.is-blank):not([disabled])");
    if (j) j.click();
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const b = document.querySelector("#slotsList button:not([disabled])");
    if (b) b.click();
  });
  await page.waitForTimeout(600);

  envois.length = 0;
  /* Sans adresse, RIEN ne part : `requisPartiel` exige `email`, et
     une ligne refusee le serait en silence. */
  await page.fill("#bkName", "ZZ Retenue Nom");
  await page.evaluate(() => document.getElementById("bkName").blur());
  await page.waitForTimeout(500);
  dire("sans adresse, rien n'est envoyé", envois.length, 0,
    "le service exige `email` en cours de route : écrire plus tôt serait refusé en silence");

  await page.fill("#bkEmail", "zz@exemple.ca");
  await page.evaluate(() => document.getElementById("bkEmail").blur());
  await page.waitForTimeout(700);
  dire("dès que l'adresse est là, la ligne s'écrit", envois.length >= 1, true);

  let c = null;
  try { c = JSON.parse(envois[0] || "{}"); } catch (e) {}
  dire("c'est bien une réservation", c && c._form, "booking");
  dire("elle porte une session", !!(c && c._sid), true);
  dire("elle n'est PAS finale", !!(c && c._final), false,
    "une étape en chemin ne doit ni confirmer ni poser de rendez-vous");
  dire("elle emporte le nom déjà tapé", c && c.nom, "ZZ Retenue Nom");
}

/* L'ENVOI FINAL COMPLÈTE CETTE LIGNE, IL N'EN OUVRE PAS UNE
   SECONDE. Sans `_sid`, deux lignes pour un client — dont une
   qu'on relancerait pour un rendez-vous déjà pris. */
titre("5 · L'ENVOI FINAL COMPLÈTE LA MÊME LIGNE");
{
  const sidEtape = await page.evaluate(() => {
    try { return localStorage.getItem("aped-sid-booking"); } catch (e) { return null; }
  });
  dire("la session est retenue entre les deux", !!sidEtape, true);

  envois.length = 0;
  await page.fill("#bkPhone", "8195230871");
  await page.evaluate(() => {
    const f = document.querySelector('form[data-form="booking"]');
    const m = f.querySelector('input[name="mode"]');
    if (m && !m.value) {
      const b = document.querySelector('.choices[data-choice="mode"] button');
      if (b) b.click();
    }
    f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event("submit", { cancelable: true }));
  });
  await page.waitForTimeout(900);

  const finaux = envois.map((e) => { try { return JSON.parse(e); } catch (x) { return {}; } })
    .filter((c) => c._final);
  dire("un envoi final est parti", finaux.length >= 1, true,
    JSON.stringify(envois).slice(0, 300));
  if (finaux.length) {
    dire("il porte LA MÊME session que les étapes", finaux[0]._sid, sidEtape,
      "sans ça : deux lignes pour un seul client");
    dire("il porte la plage choisie", !!finaux[0].plage_iso, true);
  }
}

titre("6 · CE QUE ÇA DONNE À L'ÉCRAN");
{
  await page.evaluate(() => {
    document.querySelectorAll(".modal").forEach((m) => { m.hidden = true; });
  });
  for (const [kind, etape, nom] of [
    ["project", 1, "projet-debut"],
    ["project", 7, "projet-fin"],
    ["booking", 2, "reservation-fin"]
  ]) {
    await armer(kind, etape);
    await provoquer();
    await page.waitForTimeout(240);
    const f = path.join(SORTIE, nom + ".png");
    await page.screenshot({ path: f });
    console.log("         capture : preuves/retenue/" + nom + ".png");
  }
}

console.log("");
dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 3).join(" | "));

await nav.close();
serveur.close();
console.log("");
console.log("============================================================");
console.log(ko ? ("LA RETENUE NE TIENT PAS : " + ko + " échec(s) sur " + n)
              : ("LA RETENUE TIENT : " + n + " / " + n));
console.log("Captures : preuves/retenue/");
console.log("============================================================");
process.exit(ko ? 1 : 0);
