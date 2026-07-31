/* ============================================================
   LA CHAINE DES FORMULAIRES, DE BOUT EN BOUT
   `node tools/formulaires-e2e.mjs [port]`

   POURQUOI CET OUTIL EXISTE. Le 2026-07-29, l'audit de veracite a
   nomme comme risque le plus grave du site une chose qui n'etait
   ecrite dans aucun texte : AUCUN formulaire ne livre. Le point
   d'entree FormSubmit n'a jamais ete active, il repond
   `HTTP 200` avec `{"success":"false"}`, et toutes les promesses de
   delai du site — sept fois « 12 h », « le prochain jour ouvrable »,
   « on confirme la plage par courriel » — reposaient sur un message
   que personne ne recevait.

   CE QUE CET OUTIL VERIFIE, ET CE QU'IL NE PEUT PAS VERIFIER.
   Il ne peut PAS prouver qu'un courriel arrive dans une boite : ca
   demande d'ouvrir cette boite. Il prouve les deux choses qui
   dependent du code :
   1. l'echec est DETECTE — un `200` porteur de `success:"false"` ne
      doit jamais afficher « demande recue » ;
   2. l'echec a une SORTIE qui livre — le repli `mailto:` parait, et
      il contient reellement ce que le visiteur a tape.

   Le second point est ce qui transforme « le site ne livre pas » en
   « le site livre par un autre chemin ». Sans lui, le code etait
   correct et le resultat restait nul.

   ON N'INTERCEPTE RIEN. Le service est appele pour de vrai, et sa
   reponse est relevee telle quelle : c'est la seule facon de savoir
   si l'activation a ete faite depuis. Le jour ou elle l'est, ce meme
   outil rendra « success: true » et les replis cesseront de
   paraitre — sans qu'une ligne change ici.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
import { port as portDe } from "./_adresse.mjs";
const PORT = portDe(process.argv[2]);
const BASE = `http://127.0.0.1:${PORT}`;
const rapport = { service: null, formulaires: [] };

/* --- ce qu'on tape, pour pouvoir le retrouver dans le mailto --- */
const T = {
  nom: "Essai Chaine",
  courriel: "essai.chaine@exemple.ca",
  tel: "418 555 0142",
  entreprise: "Garage Essai inc",
  message: "Verification de la chaine d envoi, relevee automatiquement.",
};

async function page1(nav) {
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await ctx.newPage();
  page._erreurs = [];
  page._reponses = [];
  page.on("pageerror", (e) => page._erreurs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") page._erreurs.push(m.text()); });
  /* On releve la reponse REELLE du service, sans la modifier. */
  page.on("response", async (r) => {
    if (!r.url().includes("formsubmit")) return;
    let corps = "";
    try { corps = (await r.text()).slice(0, 200); } catch (e) { corps = "(illisible)"; }
    page._reponses.push({ statut: r.status(), corps });
  });
  await page.addInitScript(() => {
    /* Le popup cadeau ouvert en `showModal()` capture TOUS les
       evenements de pointeur : sans ca, chaque clic expire et accuse
       le mauvais coupable. */
    try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {}
  });
  await page.goto(BASE + "/index.html", { waitUntil: "load" });
  await page.waitForTimeout(1400);
  return page;
}

/* Lit le repli s'il existe, et DECODE son `mailto:` — un lien qui
   parait mais qui ne porte pas les reponses du visiteur ne sert a
   rien, et c'est exactement le genre de chose qu'un test qui compte
   les elements laisserait passer. */
async function lireRepli(page, portee) {
  return page.evaluate((sel) => {
    const hote = sel ? document.querySelector(sel) : document;
    if (!hote) return { present: false, raison: "portée introuvable : " + sel };
    const r = hote.querySelector("[data-repli]");
    if (!r) return { present: false };
    const a = r.querySelector("a");
    const href = a ? a.getAttribute("href") : "";
    let sujet = "", corps = "", dest = "";
    try {
      const u = new URL(href);
      dest = decodeURIComponent(u.pathname);
      sujet = decodeURIComponent(new URLSearchParams(u.search).get("subject") || "");
      corps = decodeURIComponent(new URLSearchParams(u.search).get("body") || "");
    } catch (e) { /* href malforme : on rend le brut */ }
    const boite = r.getBoundingClientRect();
    return {
      present: true,
      visible: boite.width > 0 && boite.height > 0,
      libelle: a ? a.textContent.trim() : "",
      protocole: href.slice(0, 7),
      destinataire: dest,
      sujet,
      longueurCorps: corps.length,
      corps,
      focusDessus: !!(a && document.activeElement === a),
      etat: (hote.querySelector(".form-status") || {}).textContent || "",
    };
  }, portee || null);
}

function verdict(nom, repli, attendus, etat) {
  const manquants = attendus.filter((v) => !repli.corps || !repli.corps.includes(v));
  const ok = repli.present && repli.visible && repli.protocole === "mailto:" &&
    repli.destinataire.includes("@") && manquants.length === 0;
  console.log(`\n--- ${nom}`);
  console.log(`    état affiché      : « ${String(etat).trim().slice(0, 90)} »`);
  console.log(`    repli présent     : ${repli.present} · visible : ${repli.visible} · focus dessus : ${repli.focusDessus}`);
  console.log(`    lien              : ${repli.protocole}${repli.destinataire} · sujet « ${repli.sujet} »`);
  console.log(`    corps             : ${repli.longueurCorps} caractères`);
  console.log(`    réponses tapées retrouvées dans le corps : ${attendus.length - manquants.length} / ${attendus.length}` +
              (manquants.length ? ` — MANQUE ${JSON.stringify(manquants)}` : ""));
  console.log(`    VERDICT           : ${ok ? "livre par le repli" : "*** NE LIVRE PAS ***"}`);
  rapport.formulaires.push({ nom, ok, repli: { ...repli, corps: repli.corps ? repli.corps.slice(0, 400) : "" }, manquants, etat: String(etat).trim() });
  return ok;
}

const nav = await chromium.launch();

/* ============================================================
   0 · L'ETAT REEL DU SERVICE — releve, pas suppose.
   ============================================================ */
{
  const page = await page1(nav);
  const r = await page.evaluate(async () => {
    try {
      const res = await fetch("https://formsubmit.co/ajax/dorvalwilliam11@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ _subject: "SONDE APED", sonde: "etat du service", _captcha: "false" }),
      });
      return { statut: res.status, corps: (await res.text()).slice(0, 220) };
    } catch (e) { return { erreur: String(e) }; }
  });
  rapport.service = r;
  console.log("=== 0 · ETAT DU SERVICE D'ENVOI ===");
  console.log("  statut :", r.statut);
  console.log("  corps  :", r.corps || r.erreur);
  const actif = /"success"\s*:\s*(true|"true")/.test(r.corps || "");
  console.log("  VERDICT :", actif
    ? "ACTIVE — les envois partent, les replis ne devraient plus paraitre"
    : "NON ACTIVE — un 200 qui dit success:false. Les replis sont la seule voie de livraison.");
  rapport.serviceActif = actif;
  await page.close();
}

/* ============================================================
   1 · URGENCE  ·  2 · REFERENCE
   Les deux formulaires simples. Meme gestionnaire, deux modales.
   ============================================================ */
for (const [id, nom, remplir] of [
  ["modal-urgent", "URGENCE", async (page) => {
    await page.fill("#urName", T.nom);
    await page.fill("#urPhone", T.tel);
    await page.fill("#urEmail", T.courriel);
    await page.fill("#urMsg", T.message);
  }],
  ["modal-refer", "REFERENCE", async (page) => {
    await page.fill("#rfName", T.nom);
    await page.fill("#rfEmail", T.courriel);
    await page.selectOption("#rfRelation", { index: 1 });
    await page.fill("#rfCompany", T.entreprise);
    await page.fill("#rfContact", T.tel);
  }],
]) {
  const page = await page1(nav);
  try {
    await page.evaluate((i) => {
      const b = document.querySelector(`[data-modal-open="${i}"]`);
      b.click();
    }, id);
    await page.waitForTimeout(600);
    await remplir(page);
    await page.click(`#${id} [data-submit]`);
    await page.waitForTimeout(4000);
    const repli = await lireRepli(page, `#${id} form`);
    verdict(nom, repli, [T.nom, T.tel], repli.etat);
    console.log("    réponse du service :", JSON.stringify(page._reponses.slice(-1)));
  } catch (e) {
    console.log(`\n--- ${nom}\n    *** ERREUR D'OUTIL : ${String(e).slice(0, 160)}`);
    rapport.formulaires.push({ nom, ok: false, erreur: String(e).slice(0, 300) });
  }
  console.log("    erreurs console :", page._erreurs.length ? page._erreurs : 0);
  await page.close();
}

/* ============================================================
   3 · RESERVATION — calendrier, plage, puis envoi.
   ============================================================ */
{
  const page = await page1(nav);
  const nom = "RESERVATION";
  try {
    await page.evaluate(() => document.querySelector('[data-modal-open="modal-booking"]').click());
    await page.waitForTimeout(700);
    /* ON PARCOURT LES JOURS JUSQU'A EN TROUVER UN QUI OFFRE DES
       PLAGES, ET LE PREMIER N'EN OFFRE PAS.
       Le preavis est de 24 h : le premier jour SELECTIONNABLE est
       demain, mais toutes ses plages vont de 9 h a 16 h 30, donc
       elles tombent avant le plancher des 24 h des qu'on essaie en
       soiree. La premiere version de cet outil cliquait le premier
       jour, ne trouvait aucune plage, n'atteignait jamais l'etape 2 —
       ou vit `#bkName` — et rendait « le formulaire de reservation ne
       livre pas ». C'etait faux : c'etait l'outil qui n'y arrivait
       pas. On ne contourne pas la regle du site, on cherche le
       premier jour qui la satisfait. */
    let jour = null, plage = null;
    for (let essai = 0; essai < 10 && !plage; essai++) {
      jour = await page.evaluate((k) => {
        const dispo = [...document.querySelectorAll("#calDays .cal-day:not(.is-blank):not([disabled])")];
        if (k >= dispo.length) return null;
        dispo[k].click();
        return dispo[k].textContent.trim();
      }, essai);
      if (jour === null) break;
      await page.waitForTimeout(350);
      plage = await page.evaluate(() => {
        const s = [...document.querySelectorAll("#slotsList button:not([disabled])")];
        if (!s.length) return null;
        const t = s[0].textContent.trim();
        s[0].click();
        return t;
      });
      await page.waitForTimeout(350);
    }
    console.log(`\n    (jour retenu ${jour} · plage ${plage})`);
    if (!plage) throw new Error("aucune plage libre trouvée sur dix jours — à regarder à la main");
    /* L'etape 2 doit etre visible : sinon `fill` attend un champ que
       personne ne peut remplir, et c'est l'outil qui expire. */
    await page.waitForSelector('#modal-booking .step[data-bstep="2"] input', { state: "visible", timeout: 5000 });
    await page.fill("#bkName", T.nom);
    await page.fill("#bkEmail", T.courriel);
    const tel = await page.$("#bkPhone");
    if (tel) await tel.fill(T.tel);
    await page.click('#modal-booking [data-submit]');
    await page.waitForTimeout(4000);
    const repli = await lireRepli(page, "#modal-booking form");
    verdict(nom, repli, [T.nom, T.courriel], repli.etat);
    console.log("    réponse du service :", JSON.stringify(page._reponses.slice(-1)));
  } catch (e) {
    console.log(`\n--- ${nom}\n    *** ERREUR D'OUTIL : ${String(e).slice(0, 200)}`);
    rapport.formulaires.push({ nom, ok: false, erreur: String(e).slice(0, 300) });
  }
  console.log("    erreurs console :", page._erreurs.length ? page._erreurs : 0);
  await page.close();
}

/* ============================================================
   4 · PROJET — sept etapes.
   ============================================================ */
{
  const page = await page1(nav);
  const nom = "PROJET (7 étapes)";
  try {
    await page.evaluate(() => document.querySelector('[data-modal-open="modal-project"]').click());
    await page.waitForTimeout(700);
    /* On avance etape par etape en repondant a ce qui est requis a
       chacune : sauter directement a la fin ne testerait pas le
       parcours reel du visiteur. */
    for (let pas = 1; pas <= 6; pas++) {
      /* `page.evaluate` NE PREND QU'UN SEUL ARGUMENT. La premiere
         version passait `(pas, T)` : le second etait ignore, `v`
         valait `undefined`, et l'outil levait
         « Cannot read properties of undefined (reading 'nom') » —
         faisant passer un formulaire intact pour casse. */
      await page.evaluate(([p, v]) => {
        const etape = document.querySelector(`.step[data-pstep="${p}"]`);
        if (!etape) return;
        etape.querySelectorAll(".field").forEach((f) => {
          if (f.hidden || f.closest("[hidden]")) return;
          const cases = f.querySelectorAll('input[type="checkbox"]');
          if (cases.length) { cases[0].checked = true; return; }
          const e = f.querySelector("input, select, textarea");
          if (!e) return;
          if (e.tagName === "SELECT") { if (e.options.length > 1) e.selectedIndex = 1; return; }
          if (e.value) return;
          e.value = e.type === "email" ? v.courriel : e.type === "tel" ? v.tel
            : e.tagName === "TEXTAREA" ? v.message : v.nom;
          e.dispatchEvent(new Event("input", { bubbles: true }));
        });
        /* Les etapes a choix se repondent par un bouton, pas par un champ. */
        const choix = etape.querySelector(".options button, .choices button");
        if (choix && !etape.querySelector('[aria-pressed="true"]')) choix.click();
      }, [pas, T]);
      await page.waitForTimeout(220);
      await page.click("#projectNext");
      await page.waitForTimeout(400);
    }
    await page.waitForTimeout(4200);
    const repli = await lireRepli(page, "#projectWizard");
    verdict(nom, repli, [T.nom], repli.etat);
    console.log("    réponse du service :", JSON.stringify(page._reponses.slice(-1)));
  } catch (e) {
    console.log(`\n--- ${nom}\n    *** ERREUR D'OUTIL : ${String(e).slice(0, 200)}`);
    rapport.formulaires.push({ nom, ok: false, erreur: String(e).slice(0, 300) });
  }
  console.log("    erreurs console :", page._erreurs.length ? page._erreurs : 0);
  await page.close();
}

/* ============================================================
   5 · ESTIMATION — six questions, puis nom et courriel.
   LE POINT DELICAT : la fourchette DOIT paraitre meme si l'envoi
   echoue, et le repli doit etre visible A L'ETAPE 8, pas a la 7 qui
   vient d'etre cachee.
   ============================================================ */
{
  const page = await page1(nav);
  const nom = "ESTIMATION";
  try {
    await page.evaluate(() => document.querySelector('[data-modal-open="modal-estimate"]').click());
    await page.waitForTimeout(700);
    for (let q = 1; q <= 6; q++) {
      await page.evaluate((k) => {
        const e = document.querySelector(`#modal-estimate .step[data-step="${k}"]`);
        if (!e) return;
        const b = e.querySelector(".options button");
        if (b) b.click();
      }, q);
      await page.waitForTimeout(320);
    }
    await page.fill("#esName", T.nom);
    await page.fill("#esEmail", T.courriel);
    await page.click('#modal-estimate [data-submit]');
    await page.waitForTimeout(4200);
    const vu = await page.evaluate(() => {
      const e8 = document.querySelector('#modal-estimate .step[data-step="8"]');
      return {
        etape8Visible: e8 ? !e8.hidden : false,
        fourchette: (document.querySelector("#priceLow") || {}).textContent + " → " + (document.querySelector("#priceHigh") || {}).textContent,
        replicDansEtape8: !!(e8 && e8.querySelector("[data-repli]")),
        replicVisible: (() => {
          const r = e8 && e8.querySelector("[data-repli]");
          if (!r) return false;
          const b = r.getBoundingClientRect();
          return b.width > 0 && b.height > 0;
        })(),
      };
    });
    console.log("\n    étape 8 visible :", vu.etape8Visible, "· fourchette :", vu.fourchette);
    console.log("    repli dans l'étape 8 :", vu.replicDansEtape8, "· visible :", vu.replicVisible);
    const repli = await lireRepli(page, '#modal-estimate .step[data-step="8"]');
    const etat = await page.evaluate(() => (document.querySelector("#estimateStatus") || {}).textContent || "");
    verdict(nom, repli, [T.nom, T.courriel], etat);
    rapport.estimation = vu;
    console.log("    réponse du service :", JSON.stringify(page._reponses.slice(-1)));
  } catch (e) {
    console.log(`\n--- ${nom}\n    *** ERREUR D'OUTIL : ${String(e).slice(0, 200)}`);
    rapport.formulaires.push({ nom, ok: false, erreur: String(e).slice(0, 300) });
  }
  console.log("    erreurs console :", page._erreurs.length ? page._erreurs : 0);
  await page.close();
}

/* ============================================================
   6 · CALCUL PAR COURRIEL — le formulaire du calculateur.
   ============================================================ */
{
  const page = await page1(nav);
  const nom = "CALCUL PAR COURRIEL";
  try {
    await page.evaluate(async () => {
      const y = document.querySelector("#calculateur").getBoundingClientRect().top + window.scrollY;
      for (let k = 0; k < y; k += 500) { window.scrollTo(0, k); await new Promise((r) => setTimeout(r, 50)); }
      window.scrollTo(0, y);
    });
    await page.waitForTimeout(900);
    await page.fill("#roiEmail", T.courriel);
    await page.evaluate(() => document.querySelector("#roiMailForm button[type=submit]").click());
    await page.waitForTimeout(4200);
    const repli = await lireRepli(page, "#roiMailForm");
    verdict(nom, repli, [T.courriel], repli.etat);
    /* Et l'accuse ne doit plus citer les deux postes retires du
       calcul : `undefined` dans un courriel envoye au visiteur. */
    const charge = await page.evaluate(() => JSON.stringify(window.__derniereChargeRoi || null));
    console.log("    corps du repli contient « undefined » :", /undefined/.test(repli.corps || "") ? "*** OUI ***" : "non");
    rapport.roiCharge = charge;
    console.log("    réponse du service :", JSON.stringify(page._reponses.slice(-1)));
  } catch (e) {
    console.log(`\n--- ${nom}\n    *** ERREUR D'OUTIL : ${String(e).slice(0, 200)}`);
    rapport.formulaires.push({ nom, ok: false, erreur: String(e).slice(0, 300) });
  }
  console.log("    erreurs console :", page._erreurs.length ? page._erreurs : 0);
  await page.close();
}

/* ============================================================
   7 · LE CADEAU — les deux guides SANS donner de courriel.
   C'est la correction A3 : le popup exigeait une adresse pour ce que
   le pied de page donne directement. On verifie donc l'inverse de ce
   que l'ancien test verifiait — et c'est exactement pour ca qu'il
   fallait relire l'ancien test avant d'ecrire celui-ci.
   ============================================================ */
{
  const page = await page1(nav);
  console.log("\n=== 7 · LE CADEAU, SANS COURRIEL ===");
  const r = await page.evaluate(async () => {
    const boite = document.querySelector("#cadeau");
    if (!boite.open) boite.showModal();
    await new Promise((r2) => setTimeout(r2, 300));
    const recu = boite.querySelector(".cadeau-recu");
    const liens = [...recu.querySelectorAll("a")];
    const champ = boite.querySelector("#cadeauEmail");
    const b = recu.getBoundingClientRect();
    const ordre = [...boite.querySelectorAll(".cadeau-recu, .cadeau-form")].map((e) => e.className.split(" ")[0]);
    return {
      remiseCachee: recu.hidden,
      remiseVisible: b.width > 0 && b.height > 0,
      liens: liens.map((a) => a.getAttribute("href")),
      courrielRequis: champ ? champ.required : null,
      ordreDesBlocs: ordre,
      reassurance: (boite.querySelector(".cadeau-fin") || {}).textContent || "",
      libelleEnvoi: (boite.querySelector(".cadeau-go [data-label]") || {}).textContent || "",
    };
  });
  console.log("  remise cachée au départ :", r.remiseCachee, "· visible :", r.remiseVisible);
  console.log("  liens directs vers les PDF :", JSON.stringify(r.liens));
  console.log("  le champ courriel est-il requis :", r.courrielRequis);
  console.log("  ordre des blocs :", r.ordreDesBlocs.join(" puis "));
  console.log("  réassurance :", r.reassurance.trim());
  console.log("  libellé du bouton d'envoi :", r.libelleEnvoi.trim());
  /* Les deux PDF doivent repondre 200 : un lien direct qui rend 404
     serait pire que le peage qu'on vient de retirer. */
  const codes = [];
  for (const h of r.liens) {
    const res = await page.request.get(new URL(h, BASE + "/").href);
    codes.push({ h, statut: res.status(), type: res.headers()["content-type"] });
  }
  console.log("  les deux fichiers répondent :", JSON.stringify(codes));
  const ok = r.remiseCachee === false && r.remiseVisible && r.liens.length === 2 &&
    r.courrielRequis === false && codes.every((c) => c.statut === 200) &&
    !/[Dd]ésabonnement/.test(r.reassurance) &&
    r.ordreDesBlocs[0] === "cadeau-recu";
  console.log("  VERDICT :", ok
    ? "les deux guides s'obtiennent sans rien donner, la remise vient avant le formulaire, plus de promesse de désabonnement"
    : "*** DEFAUT ***");

  /* Et le courriel FACULTATIF doit quand meme etre valide s'il est
     rempli : le champ n'est plus `required`, donc `validate()` ne
     peut plus le juger — c'est le piege exact de ce correctif. */
  const vide = await page.evaluate(async () => {
    const f = document.querySelector("#cadeauForm");
    f.querySelector("#cadeauEmail").value = "";
    f.querySelector("button[type=submit]").click();
    await new Promise((r2) => setTimeout(r2, 300));
    return (f.querySelector(".form-status") || {}).textContent || "";
  });
  const malforme = await page.evaluate(async () => {
    const f = document.querySelector("#cadeauForm");
    f.querySelector("#cadeauEmail").value = "pas-une-adresse";
    f.querySelector("button[type=submit]").click();
    await new Promise((r2) => setTimeout(r2, 300));
    return (f.querySelector(".form-status") || {}).textContent || "";
  });
  console.log("  soumis à vide     :", JSON.stringify(vide.trim().slice(0, 100)));
  console.log("  soumis malformé   :", JSON.stringify(malforme.trim().slice(0, 100)));
  const garde = /adresse/i.test(vide) && /valide/i.test(malforme);
  console.log("  VERDICT garde-fou du champ facultatif :", garde ? "il juge encore" : "*** IL NE JUGE PLUS ***");
  rapport.cadeau = { ...r, codes, ok, vide: vide.trim(), malforme: malforme.trim(), garde };
  console.log("  erreurs console :", page._erreurs.length ? page._erreurs : 0);
  await page.close();
}

await nav.close();
fs.mkdirSync(path.join(RACINE, "refonte-captures"), { recursive: true });
fs.writeFileSync(path.join(RACINE, "refonte-captures", "formulaires-e2e.json"),
  JSON.stringify(rapport, null, 2), "utf8");

const livrent = rapport.formulaires.filter((f) => f.ok).length;
console.log("\n============================================================");
console.log(`FORMULAIRES QUI LIVRENT PAR LE REPLI : ${livrent} / ${rapport.formulaires.length}`);
console.log(`SERVICE D'ENVOI : ${rapport.serviceActif ? "activé" : "TOUJOURS PAS ACTIVÉ"}`);
console.log("============================================================");
