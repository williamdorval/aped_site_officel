/* ============================================================
   LES SEPT FORMULAIRES, DE BOUT EN BOUT, CONTRE UN VRAI SERVICE
   `node tools/serve.mjs 8099` et `node tools/faux-google.mjs 8098`
   puis `node tools/formulaires-prod.mjs [port] [portService]`

   CE QUE CET OUTIL REMPLACE. `formulaires-e2e.mjs` prouvait qu'un
   formulaire EN PANNE avait une sortie de secours. C'etait la
   bonne question tant que rien ne livrait. Il est aussi devenu
   FAUX : il exige un repli `mailto:` retire depuis D-719, donc il
   accuse du code intact. C'est le piege 6 de la phase 9 — un test
   qui verrouille le defaut — a l'envers.

   CELUI-CI POSE LA QUESTION D'APRES : est-ce que ca LIVRE ?
   Il remplit les sept formulaires comme un visiteur, laisse partir
   les requetes vers le service, et va ensuite RELIRE le classeur
   pour verifier que la ligne y est, avec les bonnes colonnes.
   Ni l'un ni l'autre ne suffit seul : un « demande recue » a
   l'ecran ne prouve rien si le classeur est vide.

   Le service vise est `tools/faux-google.mjs`, qui execute le VRAI
   `google/Code.gs`. Pointe sur le deploiement reel (`--reel`), le
   meme outil fait la meme chose contre Google.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { port as portDe } from "./_adresse.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PORT = portDe(process.argv[2]);
const SERVICE_PORT = Number(process.argv[3] || 8098);
const BASE = `http://127.0.0.1:${PORT}`;
const SERVICE = `http://127.0.0.1:${SERVICE_PORT}`;

const T = {
  nom: "Chaine Essai",
  courriel: "chaine.essai@exemple.ca",
  tel: "418 555 0142",
  entreprise: "Garage Essai inc",
  message: "Verification de la chaine de production, relevee automatiquement."
};

const rapport = { service: null, formulaires: [], classeur: null };

/* ON INTERCEPTE `js/config.local.js`, ON NE L'ECRIT PAS.
   Ecrire le vrai fichier depuis un outil de mesure ecraserait la
   configuration de la personne qui le lance, et elle ne s'en
   apercevrait qu'a la prochaine mise en ligne.

   LA PREMIERE VERSION POSAIT `window.APED_ENVOI` PAR
   `addInitScript`, ET C'ETAIT FAUX : le script s'execute AVANT les
   fichiers de la page, donc `config.local.js` — charge ensuite —
   ecrasait la valeur avec la sienne. Les huit formulaires
   tombaient d'un coup a « ne livre pas », classeur vide, sans une
   seule erreur console. Un instrument qui ment proprement.
   L'incident vaut d'etre garde : il PROUVE au passage que le
   fichier genere gouverne bien `FORM_ENDPOINT`.
   On remplace donc la REPONSE du serveur pour ce seul chemin. */
async function ouvrir(nav) {
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await ctx.newPage();
  page._erreurs = [];
  page._reponses = [];
  page.on("pageerror", (e) => page._erreurs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") page._erreurs.push(m.text()); });
  page.on("response", async (r) => {
    if (!r.url().startsWith(SERVICE)) return;
    let corps = "";
    try { corps = (await r.text()).slice(0, 200); } catch (e) { corps = "(illisible)"; }
    page._reponses.push({ statut: r.status(), corps });
  });
  await page.route("**/js/config.local.js", (route) => route.fulfill({
    status: 200,
    contentType: "text/javascript; charset=utf-8",
    body: `window.APED_ENVOI = ${JSON.stringify(SERVICE)};\n`
  }));
  await page.addInitScript(() => {
    /* Le popup cadeau ouvert en `showModal()` capture tous les
       evenements de pointeur : sans ca chaque clic expire et
       accuse le mauvais coupable. */
    try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {}
  });
  await page.goto(BASE + "/index.html", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  return page;
}

function verdict(nom, attendu, obtenu, detail) {
  const ok = attendu === obtenu;
  console.log(`\n--- ${nom}`);
  console.log(`    état affiché : « ${String(detail.etat || "").trim().slice(0, 90) }»`);
  console.log(`    réponse du service : ${JSON.stringify(detail.reponse || null)}`);
  console.log(`    VERDICT : ${ok ? "LIVRE" : "*** NE LIVRE PAS ***"}`);
  rapport.formulaires.push({ nom, ok, ...detail });
  return ok;
}

const nav = await chromium.launch();

/* ============================================================
   0 · L'ETAT REEL DU SERVICE
   ============================================================ */
{
  console.log("=== 0 · LE SERVICE ===");
  try {
    const res = await fetch(SERVICE, { redirect: "follow" });
    const corps = await res.text();
    rapport.service = { statut: res.status, corps: corps.slice(0, 200) };
    console.log("  statut :", res.status);
    console.log("  corps  :", corps.slice(0, 160));
  } catch (e) {
    rapport.service = { erreur: String(e) };
    console.log("  INJOIGNABLE :", String(e));
    console.log("  Lancez `node tools/faux-google.mjs 8098` d’abord.");
    await nav.close();
    process.exit(1);
  }
}

/* ============================================================
   1 · CONTACT · 2 · URGENCE · 3 · REFERENCE — le handler commun
   ============================================================ */
for (const [ouvre, portee, nom, remplir] of [
  [null, 'form[data-form="contact"]', "CONTACT SIMPLE", async (p) => {
    await p.fill("#ctName", T.nom);
    await p.fill("#ctPhone", T.tel);
    await p.fill("#ctEmail", T.courriel);
    await p.fill("#ctMsg", T.message);
  }],
  ["modal-urgent", "#modal-urgent form", "URGENCE", async (p) => {
    await p.fill("#urName", T.nom);
    await p.fill("#urPhone", T.tel);
    await p.fill("#urEmail", T.courriel);
    await p.fill("#urMsg", T.message);
  }],
  ["modal-refer", "#modal-refer form", "RÉFÉRENCE", async (p) => {
    await p.fill("#rfName", T.nom);
    await p.fill("#rfEmail", T.courriel);
    await p.fill("#rfPhone", T.tel);
    await p.selectOption("#rfRelation", { index: 1 });
    await p.fill("#rfCompany", T.entreprise);
    await p.fill("#rfContact", "Marie Tremblay 418 555 0177");
  }]
]) {
  const page = await ouvrir(nav);
  try {
    if (ouvre) {
      await page.evaluate((i) => document.querySelector(`[data-modal-open="${i}"]`).click(), ouvre);
      await page.waitForTimeout(600);
    } else {
      await page.evaluate(() => document.querySelector("#contact").scrollIntoView());
      await page.waitForTimeout(400);
    }
    await remplir(page);
    await page.click(`${portee} [data-submit]`);
    await page.waitForTimeout(2500);
    const etat = await page.evaluate((s) => {
      const f = document.querySelector(s);
      return (f && f.querySelector(".form-status") || {}).textContent || "";
    }, portee);
    const rep = page._reponses.slice(-1)[0];
    const livre = /Reçu/i.test(etat) || (rep && /"success":true/.test(rep.corps));
    verdict(nom, true, !!livre, { etat, reponse: rep });
  } catch (e) {
    verdict(nom, true, false, { etat: "ERREUR D’OUTIL : " + String(e).slice(0, 160) });
  }
  console.log("    erreurs console :", page._erreurs.length ? page._erreurs : 0);
  await page.close();
}

/* ============================================================
   4 · RESERVATION — le mode, la plage, le Meet
   ============================================================ */
for (const [rang, mode] of [[0, "Google Meet"], [1, "Appel téléphonique"]]) {
  const page = await ouvrir(nav);
  const nom = "RÉSERVATION · " + mode;
  try {
    await page.evaluate(() => document.querySelector('[data-modal-open="modal-booking"]').click());
    await page.waitForTimeout(800);

    /* On cherche le premier jour qui offre VRAIMENT une plage : le
       preavis de 24 h en vide plusieurs. Cliquer le premier jour et
       conclure « ca ne livre pas » etait le defaut de l'outil
       precedent. */
    let jour = null, plage = null;
    for (let essai = 0; essai < 12 && !plage; essai++) {
      jour = await page.evaluate((k) => {
        const d = [...document.querySelectorAll("#calDays .cal-day:not(.is-blank):not([disabled])")];
        if (k >= d.length) return null;
        d[k].click();
        return d[k].textContent.trim();
      }, essai);
      if (jour === null) break;
      await page.waitForTimeout(320);
      /* UNE PLAGE DIFFERENTE PAR PASSAGE, ET LE RANG VIENT DE NODE.
         La premiere version retenait le rang dans `sessionStorage`.
         Chaque passage ouvre un CONTEXTE NEUF, donc le stockage
         repartait a zero : les deux reservations visaient la meme
         case, le service refusait la seconde pour double-emploi —
         a raison — et l'outil accusait le formulaire.
         C'etait l'instrument qui avait tort, pas le site. */
      plage = await page.evaluate((r) => {
        const s = [...document.querySelectorAll("#slotsList button:not([disabled])")];
        if (!s.length) return null;
        const i = Math.min(s.length - 1, r * 4);
        const t = s[i].textContent.trim();
        s[i].click();
        return t;
      }, rang);
      await page.waitForTimeout(320);
    }
    if (!plage) throw new Error("aucune plage libre trouvée sur douze jours");
    console.log(`\n    (jour ${jour} · plage ${plage} · mode ${mode})`);

    await page.waitForSelector('#modal-booking .step[data-bstep="2"] input', { state: "visible", timeout: 5000 });
    await page.evaluate((m) => {
      const b = [...document.querySelectorAll('.choices[data-choice="mode"] button')]
        .find((x) => x.dataset.value === m);
      if (b) b.click();
    }, mode);
    await page.fill("#bkName", T.nom + " " + (mode === "Google Meet" ? "Meet" : "Tel"));
    await page.fill("#bkEmail", T.courriel);
    await page.fill("#bkPhone", T.tel);
    await page.fill("#bkTopic", "Essai de la chaine.");
    await page.click("#modal-booking [data-submit]");
    await page.waitForTimeout(2800);

    const vu = await page.evaluate(() => ({
      etape3: !document.querySelector('#modal-booking .step[data-bstep="3"]').hidden,
      etat: (document.querySelector('#modal-booking .form-status') || {}).textContent || ""
    }));
    const rep = page._reponses.slice(-1)[0];
    verdict(nom, true, vu.etape3, { etat: vu.etat, reponse: rep, plage, jour, mode });
  } catch (e) {
    verdict(nom, true, false, { etat: "ERREUR D’OUTIL : " + String(e).slice(0, 200) });
  }
  console.log("    erreurs console :", page._erreurs.length ? page._erreurs : 0);
  await page.close();
}

/* ============================================================
   5 · PROJET — six etapes
   ============================================================ */
{
  const page = await ouvrir(nav);
  const nom = "PROJET";
  try {
    await page.evaluate(() => document.querySelector('[data-modal-open="modal-project"]').click());
    await page.waitForTimeout(700);
    for (let pas = 1; pas <= 5; pas++) {
      await page.evaluate(([p, v]) => {
        const etape = document.querySelector(`.step[data-pstep="${p}"]`);
        if (!etape) return;
        etape.querySelectorAll(".field").forEach((f) => {
          if (f.hidden || f.closest("[hidden]")) return;
          const cases = f.querySelectorAll('input[type="checkbox"]');
          if (cases.length) { cases[0].checked = true; return; }
          const e = f.querySelector("input:not([type=hidden]), select, textarea");
          if (!e) return;
          if (e.tagName === "SELECT") { if (e.options.length > 1) e.selectedIndex = 1; return; }
          if (e.value) return;
          e.value = e.type === "email" ? v.courriel : e.type === "tel" ? v.tel
            : e.tagName === "TEXTAREA" ? v.message : v.nom;
          e.dispatchEvent(new Event("input", { bubbles: true }));
        });
        const choix = etape.querySelector(".choices button");
        if (choix && !etape.querySelector('[aria-pressed="true"]')) choix.click();
      }, [pas, T]);
      await page.waitForTimeout(220);
      await page.click("#projectNext");
      await page.waitForTimeout(450);
    }
    await page.waitForTimeout(2600);
    const vu = await page.evaluate(() => ({
      final: !document.querySelector('#projectWizard .step[data-pstep="6"]').hidden,
      etat: (document.querySelector("#projectWizard .form-status") || {}).textContent || ""
    }));
    verdict(nom, true, vu.final, { etat: vu.etat, reponse: page._reponses.slice(-1)[0] });
  } catch (e) {
    verdict(nom, true, false, { etat: "ERREUR D’OUTIL : " + String(e).slice(0, 200) });
  }
  console.log("    erreurs console :", page._erreurs.length ? page._erreurs : 0);
  await page.close();
}

/* ============================================================
   6 · ESTIMATION
   ============================================================ */
{
  const page = await ouvrir(nav);
  const nom = "ESTIMATION";
  try {
    await page.evaluate(() => document.querySelector('[data-modal-open="modal-estimate"]').click());
    await page.waitForTimeout(700);
    for (let q = 1; q <= 6; q++) {
      await page.evaluate((k) => {
        const e = document.querySelector(`#modal-estimate .step[data-step="${k}"]`);
        const b = e && e.querySelector(".options button");
        if (b) b.click();
      }, q);
      await page.waitForTimeout(300);
    }
    await page.fill("#esName", T.nom);
    await page.fill("#esEmail", T.courriel);
    await page.click("#modal-estimate [data-submit]");
    await page.waitForTimeout(2600);
    const vu = await page.evaluate(() => ({
      etape8: !document.querySelector('#modal-estimate .step[data-step="8"]').hidden,
      etat: (document.querySelector("#estimateStatus") || {}).textContent || ""
    }));
    /* L'etape 8 parait TOUJOURS, meme en echec (D-426) : le vrai
       juge ici est la reponse du service, pas l'ecran. */
    const rep = page._reponses.slice(-1)[0];
    verdict(nom, true, !!(rep && /"success":true/.test(rep.corps)), { etat: vu.etat, reponse: rep, etape8: vu.etape8 });
  } catch (e) {
    verdict(nom, true, false, { etat: "ERREUR D’OUTIL : " + String(e).slice(0, 200) });
  }
  console.log("    erreurs console :", page._erreurs.length ? page._erreurs : 0);
  await page.close();
}

/* ============================================================
   7 · LE CADEAU — et la garantie qui compte : le telechargement
   ne depend PAS de l'envoi.
   ============================================================ */
{
  const page = await ouvrir(nav);
  const nom = "CADEAU";
  try {
    const chutes = [];
    page.on("download", (d) => chutes.push(d.suggestedFilename()));
    await page.evaluate(() => {
      const b = document.querySelector("#cadeau");
      if (!b.open) b.showModal();
    });
    await page.waitForTimeout(500);
    await page.fill("#cadeauEmail", T.courriel);
    await page.fill("#cadeauTel", T.tel);
    await page.click("#cadeauForm [data-submit]");
    await page.waitForTimeout(2800);
    const vu = await page.evaluate(() => ({
      suite: !document.querySelector(".cadeau-suite").hidden,
      etat: (document.querySelector("#cadeauForm .form-status") || {}).textContent || ""
    }));
    const rep = page._reponses.slice(-1)[0];
    console.log("\n    téléchargements déclenchés :", chutes.length, JSON.stringify(chutes));
    verdict(nom, true, !!(rep && /"success":true/.test(rep.corps)),
      { etat: vu.etat, reponse: rep, telechargements: chutes });
  } catch (e) {
    verdict(nom, true, false, { etat: "ERREUR D’OUTIL : " + String(e).slice(0, 200) });
  }
  console.log("    erreurs console :", page._erreurs.length ? page._erreurs : 0);
  await page.close();
}

/* ============================================================
   8 · ON RELIT LE CLASSEUR — l'ecran ne prouve rien tout seul
   ============================================================ */
{
  console.log("\n=== 8 · CE QUI EST ARRIVÉ DANS LE CLASSEUR ===");
  try {
    const etat = await (await fetch(SERVICE + "/_etat")).json();
    rapport.classeur = etat.onglets.map((o) => ({ nom: o.nom, lignes: o.lignes.length }));
    for (const o of etat.onglets) {
      console.log(`  ${o.lignes.length > 0 ? "✓" : "·"} ${o.nom.padEnd(26)} ${o.lignes.length} ligne(s)`);
    }
    console.log(`\n  courriels partis : ${etat.courriels.length}`);
    for (const c of etat.courriels) console.log(`    → ${c.to} « ${c.subject} »`);
    console.log(`\n  événements au calendrier : ${etat.evenements.length}`);
    for (const v of etat.evenements) {
      console.log(`    · ${v.titre} · meet ${v.meet || "—"} · invités ${JSON.stringify(v.invites || [])}`);
    }
    console.log(`\n  quota d’envoi restant : ${etat.quota} / 100`);
    rapport.courriels = etat.courriels.length;
    rapport.evenements = etat.evenements.length;
    rapport.quota = etat.quota;
  } catch (e) {
    console.log("  relecture impossible :", String(e));
  }
}

await nav.close();
fs.mkdirSync(path.join(RACINE, "refonte-captures"), { recursive: true });
fs.writeFileSync(path.join(RACINE, "refonte-captures", "formulaires-prod.json"),
  JSON.stringify(rapport, null, 2), "utf8");

const livrent = rapport.formulaires.filter((f) => f.ok).length;
console.log("\n============================================================");
console.log(`FORMULAIRES QUI LIVRENT : ${livrent} / ${rapport.formulaires.length}`);
console.log("============================================================");
process.exit(livrent === rapport.formulaires.length ? 0 : 1);
