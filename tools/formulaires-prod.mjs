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

/* `--reel` VISE LE VRAI DEPLOIEMENT.  D-742
   L'en-tete promettait ce drapeau depuis le debut ; il n'existait
   pas. Un commentaire qui decrit une option absente est pire qu'un
   commentaire absent : il fait croire que la chose a ete faite.

   L'adresse vient de `.env.local`, jamais du depot. Aucun secret
   n'est imprime : on n'affiche que les douze premiers caracteres. */
const REEL = process.argv.includes("--reel");
let SERVICE;
if (REEL) {
  const env = fs.readFileSync(path.join(RACINE, ".env.local"), "utf8");
  const m = /^ADEXWEB_WEB_APP_URL=(.+)$/m.exec(env);
  if (!m) {
    console.error("ADEXWEB_WEB_APP_URL absent de .env.local — rien a viser.");
    process.exit(1);
  }
  SERVICE = m[1].trim();
} else {
  SERVICE = `http://127.0.0.1:${Number(process.argv[3] || 8098)}`;
}
const BASE = `http://127.0.0.1:${PORT}`;

/* UN MARQUEUR RECONNAISSABLE, et il doit etre dans
   `MARQUEURS_ESSAI` de `Code.gs` pour que `nettoyerAutotest()`
   sache le retrouver. « ZZTEST » y est. */
const T = REEL ? {
  nom: "ZZTEST Chaine",
  courriel: "zztest@exemple.ca",
  tel: "418 555 0142",
  entreprise: "ZZTEST Garage inc",
  message: "ZZTEST — verification de la chaine contre le vrai service."
} : {
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

   LA PREMIERE VERSION POSAIT `window.ADEXWEB_ENVOI` PAR
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
  /* LE FILTRE NE PEUT PAS ETRE « l'url commence par SERVICE ».  D-742
     `/exec` repond par un 302 vers `*.googleusercontent.com`, et
     c'est CETTE reponse-la qui porte le JSON. Filtrer sur l'adresse
     de depart ne retenait que la redirection, corps illisible : les
     huit formulaires rendaient « ne livre pas » avec zero erreur de
     console. On garde les deux, et on jette les redirections. */
  const nôtre = (u) => u.startsWith(SERVICE)
    || u.indexOf("script.google.com") !== -1
    || u.indexOf("googleusercontent.com") !== -1
    || u.startsWith(SERVICE.replace(/\/exec.*$/, ""));
  page.on("response", async (r) => {
    if (!nôtre(r.url())) return;
    if (r.status() >= 300 && r.status() < 400) return;
    let corps = "";
    try { corps = (await r.text()).slice(0, 200); } catch (e) { corps = "(illisible)"; }
    page._reponses.push({ statut: r.status(), corps });
  });
  await page.route("**/js/config.local.js", (route) => route.fulfill({
    status: 200,
    contentType: "text/javascript; charset=utf-8",
    body: `window.ADEXWEB_ENVOI = ${JSON.stringify(SERVICE)};\n`
  }));
  await page.addInitScript(() => {
    /* Le popup cadeau ouvert en `showModal()` capture tous les
       evenements de pointeur : sans ca chaque clic expire et
       accuse le mauvais coupable. */
    try { sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {}
  });
  /* LA PAGE DE DEPART EST `contact.html`, PLUS L'ACCUEIL.
     Le site est passe d'une page a sept : l'accueil ne porte plus de
     porte vers `modal-refer` ni vers `modal-project`, et le
     formulaire de contact n'y est plus du tout.
     `document.querySelector('[data-modal-open="modal-refer"]')` y
     rendait donc `null`, et l'outil accusait un formulaire intact.
     `contact.html` est la SEULE page qui porte les sept portes a la
     fois — c'est ce qui en fait le banc, et c'est aussi ce que
     `js/site.js` vise quand une modale manque ailleurs. */
  await page.goto(BASE + "/contact.html", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  return page;
}

/* ON ATTEND LA REPONSE, ON NE COMPTE PAS JUSQU'A DEUX.  D-742
   2 500 ms suffisaient contre le banc, qui repond en 5 ms. Le vrai
   service met 2 a 8 s, et jusqu'a 30 s une fois sur vingt-cinq :
   l'outil relevait un ecran encore vide et concluait « ne livre
   pas ». Il attend maintenant qu'il se passe QUELQUE CHOSE, et il
   dit combien de temps ca a pris — la mesure vaut le verdict. */
async function attendreReponse(page, portee, max = 45000) {
  const t0 = Date.now();
  try {
    await page.waitForFunction(([s]) => {
      const f = s ? document.querySelector(s) : document;
      if (!f) return false;
      const st = f.querySelector(".form-status");
      if (st && st.textContent.trim()) return true;
      /* Certains formulaires ne parlent pas : ils changent d'etape. */
      return !!document.querySelector(".step.success:not([hidden])");
    }, [portee], { timeout: max, polling: 200 });
  } catch (e) { /* on rendra le temps ecoule et l'ecran tel quel */ }
  return Date.now() - t0;
}

/* CLIQUER SANS SE FAIRE PIEGER PAR LE DEFILEMENT DOUX.  D-754

   `css/base.css` pose `html { scroll-behavior: smooth }`. Quand le
   panneau d'une modale deborde, Playwright fait defiler pour amener
   le bouton dans le champ — et ce defilement-la est ANIME. Il juge
   alors l'element « not stable » a chaque image et son clic expire
   au bout de 30 s, sur un bouton parfaitement fonctionnel, immobile,
   et non recouvert.

   Le diagnostic a coute trois passes : le rectangle etait identique
   a 300 ms d'intervalle, rien n'interceptait le point, la retenue
   etait fermee. C'est `scrollHeight 995 > clientHeight 884` qui a
   dit la verite.

   On amene donc l'element soi-meme, en defilement INSTANTANE, puis
   on clique. */
/* LE DEFILEMENT DOUX SURVIT AU CONTOURNEMENT DE D-754.  D-773

   D-754 amenait l'element soi-meme en defilement INSTANTANE. Ca ne
   suffit pas : Playwright refait SON propre defilement avant de
   cliquer, et celui-la suit `scroll-behavior: smooth`. Mesure du
   2026-08-07 sur l'ecran des textes du formulaire de reference : le
   bouton oscille entre y = 537,57 et 537,61 — QUATRE CENTIEMES de
   pixel — pendant les quarante images observees. Playwright ne
   demande pas « presque immobile », il demande deux images
   identiques : il attend donc pour toujours.

   Un doigt s'en moque : le bouton n'est ni masque, ni desactive, ni
   recouvert. C'est l'instrument qu'on repare.

   TROIS TENTATIVES, PUIS UN CLIC FORCE QUI SE DECLARE. Forcer en
   silence cacherait un vrai recouvrement — on verifie donc
   soi-meme, avec `elementsFromPoint`, que le bouton est bien le
   premier au point de clic, et on ne force que dans ce cas. */
async function stable(page, sel) {
  await page.waitForFunction((s) => {
    const n = document.querySelector(s);
    if (!n) return false;
    const r = n.getBoundingClientRect();
    const cle = [r.x, r.y, r.width, r.height].map(Math.round).join(",");
    const memoire = window.__adexwebStable || (window.__adexwebStable = {});
    const pareil = memoire[s] === cle;
    memoire[s] = cle;
    return pareil;
  }, sel, { timeout: 6000 }).catch(() => {});
}

async function cliquer(page, sel) {
  await page.evaluate((s) => {
    const n = document.querySelector(s);
    if (n) n.scrollIntoView({ block: "center", behavior: "instant" });
  }, sel);
  await page.waitForTimeout(120);
  for (let essai = 1; ; essai++) {
    try { await page.click(sel, { timeout: 6000 }); return; }
    catch (e) {
      if (essai < 3) { await stable(page, sel); await page.waitForTimeout(250); continue; }

      /* DERNIER RECOURS, ET IL DIT CE QU'IL FAIT. Playwright refuse
         de cliquer un element dont la boite oscille, meme de quatre
         centiemes de pixel — un doigt, lui, s'en moque. On regarde
         donc NOUS-MEMES si le bouton est bien le premier element au
         point de clic. S'il l'est, on force et on l'ECRIT ; s'il ne
         l'est pas, c'est un vrai recouvrement et on leve. */
      const vu = await page.evaluate((s) => {
        const n = document.querySelector(s);
        if (!n) return { absent: true };
        const r = n.getBoundingClientRect();
        const pile = document.elementsFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return {
          dessus: pile[0] === n || n.contains(pile[0]),
          quoi: pile[0] ? (pile[0].id || String(pile[0].className || pile[0].tagName)) : "rien"
        };
      }, sel);
      if (!vu.dessus) throw new Error("le bouton " + sel + " est RECOUVERT par « " + vu.quoi + " » — " + String(e).split("\n")[0]);
      console.log("    (clic force sur " + sel + " : boite instable, mais le bouton est bien dessus)");
      await page.click(sel, { force: true, timeout: 4000 });
      return;
    }
  }
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
  console.log("  vise :", REEL ? SERVICE.slice(0, 46) + "…(tronque)" : SERVICE);
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
    /* TROIS CHAMPS OBLIGATOIRES DE PLUS DEPUIS D-751. Sans eux la
       validation refuse — a raison : « ca marche plus » sans le quoi
       ni le depuis quand oblige a rappeler pour comprendre. */
    await p.fill("#urCompany", T.entreprise);
    await p.fill("#urSystem", "monsite-essai.ca");
    await p.selectOption("#urGravite", { index: 1 });
    await p.selectOption("#urDepuis", { index: 1 });
    await p.fill("#urMsg", T.message);
    await p.fill("#urImpact", "Les commandes sont arretees.");
  }]
  /* LA REFERENCE A QUITTE CE LOT : quatre etapes depuis D-752, elle
     a son propre bloc plus bas. */
]) {
  const page = await ouvrir(nav);
  try {
    if (ouvre) {
      await page.evaluate((i) => document.querySelector(`[data-modal-open="${i}"]`).click(), ouvre);
      await page.waitForTimeout(600);
    } else {
      /* La section `#contact` de la page unique n'existe plus : on
         amene le FORMULAIRE, qui est l'ancre du contrat. */
      await page.evaluate(() => {
        var f = document.querySelector('form[data-form="contact"]');
        if (!f) throw new Error("form[data-form=contact] absent de contact.html");
        f.scrollIntoView({ block: "center", behavior: "instant" });
      });
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
   4bis · REFERENCE — sept etapes depuis D-773, la sixieme etant
   l'ACCEPTATION des conditions. Sans la case, le serveur refuse :
   le parcours ne prouverait rien s'il s'arretait avant.
   ============================================================ */
{
  const page = await ouvrir(nav);
  const nom = "RÉFÉRENCE";
  try {
    await page.evaluate(() => document.querySelector('[data-modal-open="modal-refer"]').click());
    /* ON ATTEND QUE `langue.js` AIT FINI DE DECOUPER LES LETTRES.
       Il enveloppe chaque signe des boutons dans un <span class="l">
       pour V4 CRAN. Tant que ce decoupage court, Playwright juge le
       bouton INSTABLE et son clic expire au bout de 30 s — sur un
       formulaire parfaitement fonctionnel. C'etait l'instrument qui
       avait tort, pas le site. */
    await page.waitForFunction(() => {
      const b = document.querySelector("#referNext [data-label]");
      return b && b.querySelector(".l");
    }, null, { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(400);
    /* 1 · l'entreprise referee, SEULE : la ligne nait ici */
    await page.fill("#rfCompany", T.entreprise);
    await cliquer(page, "#referNext");
    await page.waitForTimeout(420);
    /* 2 · ce qu'elle fait */
    await page.fill("#rfIndustry", "Construction");
    await page.selectOption("#rfNeed", { index: 2 });
    await cliquer(page, "#referNext");
    await page.waitForTimeout(420);
    /* 3 · comment on la joint */
    await page.fill("#rfContact", "Marie Tremblay 418 555 0177");
    await page.selectOption("#rfSizeRef", { index: 2 });
    await cliquer(page, "#referNext");
    await page.waitForTimeout(420);
    /* 4 · le referent */
    await page.fill("#rfName", T.nom);
    await page.fill("#rfEmail", T.courriel);
    await page.selectOption("#rfRelation", { index: 1 });
    await cliquer(page, "#referNext");
    await page.waitForTimeout(420);
    /* 5 · ou on lui envoie sa prime */
    await page.selectOption("#rfPay", { index: 1 });
    await cliquer(page, "#referNext");
    await page.waitForTimeout(420);
    /* 6 · ce qu'on doit savoir avant d'appeler */
    await page.fill("#rfPresentation", "Dites que ca vient de moi.");
    await page.fill("#rfMsg", T.message);
    await cliquer(page, "#referNext");
    await page.waitForTimeout(420);

    /* 7 · L'ACCEPTATION. On tente D'ABORD sans cocher : le parcours
       ne prouve rien s'il ne montre pas que la porte est fermee. */
    await cliquer(page, "#referNext");
    await page.waitForTimeout(500);
    const bloque = await page.evaluate(() =>
      !document.querySelector('#modal-refer .step[data-rstep="7"]').hidden
      && !!document.querySelector('#modal-refer .step[data-rstep="7"] .field.is-invalid'));
    console.log("    sans la case cochee, l'envoi est bloque :", bloque ? "oui" : "NON");

    /* Le tiroir des conditions s'ouvre en place, puis on coche. */
    await page.evaluate(() => document.getElementById("rfCondVoir").click());
    await page.waitForTimeout(200);
    await page.evaluate(() => document.getElementById("rfAccept").click());
    await cliquer(page, "#referNext");
    console.log(`    (reponse en ${await attendreReponse(page, "#modal-refer form")} ms)`);
    const vu = await page.evaluate(() => ({
      fini: !document.querySelector('#modal-refer .step[data-rstep="8"]').hidden,
      etat: (document.querySelector("#modal-refer .form-status") || {}).textContent || ""
    }));
    verdict(nom, true, vu.fini && bloque, { etat: vu.etat, reponse: page._reponses.slice(-1)[0] });
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
      await cliquer(page, "#projectNext");
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
    /* HUIT QUESTIONS DEPUIS D-749 — ampleur, fonctions et contenu se
       sont ajoutees. On clique la premiere option de CHAQUE groupe
       present, plutot que de compter jusqu'a un nombre ecrit en
       dur : ce nombre changera encore, et l'outil rendrait « ne
       livre pas » sur un formulaire intact. */
    const groupes = await page.evaluate(() =>
      [...document.querySelectorAll("#modal-estimate .options[data-key]")]
        .map((g) => Number(g.closest(".step").dataset.step)));
    for (const k of groupes) {
      await page.evaluate((s) => {
        const e = document.querySelector(`#modal-estimate .step[data-step="${s}"]`);
        const b = e && e.querySelector(".options button");
        if (b) b.click();
      }, k);
      await page.waitForTimeout(260);
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
  if (REEL) {
    /* CONTRE LE VRAI GOOGLE, `/_etat` N'EXISTE PAS — c'est une
       trappe du banc. La porte `action=diag` la remplace : elle rend
       la structure du classeur et le contenu des SEULES lignes
       d'essai. Elle n'existe qu'a partir de la version deployee le
       2026-08-06 ; sur une version anterieure on le dit, on ne
       fabrique pas un verdict. */
    try {
      const d = await (await fetch(SERVICE + "?action=diag", { redirect: "follow" })).json();
      if (d && d.success && Array.isArray(d.onglets)) {
        for (const o of d.onglets) {
          const n = (o.lignesEssai || []).length;
          console.log(`  ${n ? "✓" : "·"} ${String(o.onglet).padEnd(26)} ${o.lignesTotal} ligne(s) · ${n} d'essai`);
          if (n) {
            const l = o.lignesEssai[o.lignesEssai.length - 1];
            console.log(`      ligne ${l.ligne} · colonne B = « ${o.titres[1]} »`);
            const formules = l.cellules.filter((c) => c.formule);
            console.log(`      cellules prises pour un calcul : ${formules.length}`
              + (formules.length ? " *** " + JSON.stringify(formules.map((c) => c.titre)) : ""));
          }
        }
        console.log(`\n  quota d’envoi restant : ${d.quota} / 100`);
        console.log(`  agendas lus : ${JSON.stringify(d.calendriers)}`);
        console.log(`  grille : ${JSON.stringify(d.disponibilites)}`);
        rapport.diag = d;
      } else {
        console.log("  PORTE DE DIAGNOSTIC ABSENTE de ce deploiement.");
        console.log("  Rien n'est conclu sur le classeur — c'est un ecart, pas un verdict.");
        console.log("  reponse :", JSON.stringify(d).slice(0, 160));
      }
    } catch (e) {
      console.log("  PORTE DE DIAGNOSTIC ABSENTE — le deploiement porte");
      console.log("  une version anterieure. Rien n'est conclu sur le classeur.");
      console.log("  (" + String(e).slice(0, 90) + ")");
    }
    await nav.close();
    fs.mkdirSync(path.join(RACINE, "refonte-captures"), { recursive: true });
    fs.writeFileSync(path.join(RACINE, "refonte-captures", "formulaires-prod.json"),
      JSON.stringify(rapport, null, 2), "utf8");
    const l2 = rapport.formulaires.filter((f) => f.ok).length;
    console.log("\n============================================================");
    console.log(`FORMULAIRES QUI LIVRENT : ${l2} / ${rapport.formulaires.length}`);
    console.log("============================================================");
    process.exit(l2 === rapport.formulaires.length ? 0 : 1);
  }
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
