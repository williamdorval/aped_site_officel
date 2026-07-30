/* ============================================================
   LE POPUP CADEAU — DECLENCHEMENT, CONTENU, MISE EN SCENE, CLAVIER
   `node tools/cadeau-check.mjs [port]`

   REECRIT LE 2026-07-26. L'ancienne version prouvait le
   comportement d'AVANT — « il ne s'ouvre pas avant douze secondes,
   il ne s'ouvre qu'une fois par personne » — donc elle passait au
   vert sur le defaut qu'on venait de trouver : un marqueur
   permanent pose des la premiere ouverture, qui faisait qu'un
   rechargement ne le remontrait plus JAMAIS. Un test qui verrouille
   le defaut est pire que pas de test.

   SEPT SCENARIOS, CHACUN UNE PREUVE :
   1. il parait tout seul, a chaque chargement, autour de 11 s ;
   2. il parait PLUS TOT sur un engagement fort ;
   3. il ne parait JAMAIS pendant une saisie — il attend ;
   4. il REVIENT a chaque chargement — decision du proprietaire du
      site, 2026-07-26 : « toujours, meme apres le courriel » ;
   5. adresse donnee -> les deux documents sont remis sur place, et
      il revient QUAND MEME au chargement suivant ;
   6. le contenu tient en peu d'objets : un champ, une action, une
      sortie evidente, un visuel ;
   7. Echap, tabulation, focus rendu, et mouvement reduit.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PORT = process.argv[2] || "8099";
const BASE = `http://127.0.0.1:${PORT}/`;
const SORTIE = path.join(RACINE, "refonte-captures", "cadeau");
fs.mkdirSync(SORTIE, { recursive: true });

const nav = await chromium.launch();
const R = { erreurs: [] };

async function neuf(ctx) {
  const p = await ctx.newPage();
  p.on("pageerror", (e) => R.erreurs.push("pageerror: " + String(e)));
  p.on("console", (m) => { if (m.type() === "error") R.erreurs.push("console: " + m.text()); });
  /* On saute la sequence d'entree : ce script mesure un popup. */
  await p.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); } catch (e) {} });
  return p;
}
const ouvert = (p) => p.evaluate(() => { const d = document.getElementById("cadeau"); return !!(d && d.open); });
const attendre = (p, ms) => p.waitForFunction(
  () => { const d = document.getElementById("cadeau"); return d && d.open; }, null, { timeout: ms }
).catch(() => {});

/* ---------- 1. LE DECLENCHEUR PRINCIPAL, ET LE CONTENU ---------- */
{
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await neuf(ctx);
  await p.goto(BASE, { waitUntil: "load" });
  const t0 = Date.now();
  await p.waitForTimeout(8000);
  const a8 = await ouvert(p);
  await attendre(p, 12000);
  R.principal = { ouvertA8s: a8, ouvert: await ouvert(p), paruApresSecondes: Math.round((Date.now() - t0) / 100) / 10 };
  /* On laisse la mise en scene FINIR avant de photographier : sans
     cette attente on capture l'arete a mi-course et on croit que le
     panneau est coupe. */
  await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(SORTIE, "01-principal.png") });

  R.contenu = await p.evaluate(() => {
    const d = document.getElementById("cadeau");
    const txt = (s) => { const e = d.querySelector(s); return e ? e.textContent.trim() : null; };
    const champs = [...d.querySelectorAll("input, textarea, select")].filter((e) => e.type !== "hidden");
    const actions = [...d.querySelectorAll("button, a")].filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && !e.hasAttribute("data-cadeau-non") && !e.closest("[hidden]");
    });
    return {
      accroche: txt(".cadeau-eyebrow"),
      titre: txt("#cadeauTitre"),
      benefice: txt(".cadeau-lead"),
      caracteresDeBenefice: (txt(".cadeau-lead") || "").length,
      champs: champs.map((c) => c.name || c.id),
      nombreDeChamps: champs.length,
      actionsVisibles: actions.map((a) => a.textContent.trim().replace(/\s+/g, " ").slice(0, 40)),
      reassurance: txt(".cadeau-fin"),
      sorties: [...d.querySelectorAll("[data-cadeau-non]")].map((b) => (b.getAttribute("aria-label") || b.textContent.trim())),
      couvertures: [...d.querySelectorAll(".cadeau-couv")].map((i) => ({
        src: i.getAttribute("src"), rendue: i.naturalWidth > 0, l: i.naturalWidth, h: i.naturalHeight
      })),
      motsALire: (d.querySelector(".cadeau-dire") || d).innerText.trim().split(/\s+/).length,
      /* ------------------------------------------------------------
         CE RELEVE S'APPELAIT `remiseCacheeAuDepart`, ET SON NOM ETAIT
         LE DEFAUT.
         Il affirmait, comme une qualite, que les deux guides sont
         VERROUILLES jusqu'a ce qu'on donne une adresse. Or le pied de
         page, Services et le Calculateur offrent LES MEMES deux
         documents « gratuits et sans courriel », liens directs vers
         les PDF. Le popup faisait donc payer d'une adresse ce que la
         page donne trois ecrans plus bas — constat A3 de l'audit du
         2026-07-29, et exactement la faute que le proprietaire venait
         de retirer du hero.
         Le test passait, et il passait PARCE QUE le defaut etait la.
         C'est le piege nommé au § 8 de CLAUDE.md : quand on corrige
         un defaut, il faut relire le test qui le couvrait. On mesure
         donc maintenant l'inverse, et le nom le dit.
         ------------------------------------------------------------ */
      remiseOuverteDesLeDepart: !d.querySelector(".cadeau-recu").hidden,
      remiseAvantLeFormulaire: (() => {
        const blocs = [...d.querySelectorAll(".cadeau-recu, .cadeau-form")];
        return blocs.length === 2 && blocs[0].classList.contains("cadeau-recu");
      })(),
      lienDirectsVersLesPdf: [...d.querySelectorAll(".cadeau-recu a")].map((a) => a.getAttribute("href")),
      courrielRequis: (() => { const c = d.querySelector("#cadeauEmail"); return c ? c.required : null; })()
    };
  });

  /* ---------- 7. CLAVIER ---------- */
  R.clavier = { focusALOuverture: await p.evaluate(() => document.activeElement && document.activeElement.className) };

  /* ============================================================
     LE NOMBRE DE TABULATIONS NE PEUT PAS ETRE UNE CONSTANTE, ET
     C'EST UN DEFAUT D'INSTRUMENT QUI A PRODUIT UN FAUX ECHEC.

     Version precedente : six tabulations, puis « le focus est-il
     encore dans le dialogue ? ». Ca marchait avec quatre elements
     atteignables. Le correctif A3 en a ajoute deux — les deux liens
     de telechargement direct — et la sixieme tabulation est tombee
     pile sur l'etape ou Chromium fait passer le focus par la barre
     du navigateur avant de revenir dans le dialogue. Verdict rendu :
     « le focus s'echappe ». A/B en worktree contre le commit
     precedent : la sequence d'AVANT etait
     `INPUT → BUTTON → BUTTON.cadeau-non → BODY → BUTTON.cadeau-x →
     INPUT`. Le BODY y etait DEJA, au milieu. Le piege fonctionnait
     dans les deux versions ; seul le nombre d'elements avait change.

     CE QU'IL FAUT MESURER N'EST DONC PAS « OU ATTERRIT LA N-IEME
     TABULATION » mais la propriete reelle du piege : aucun element de
     la PAGE derriere la modale ne doit jamais recevoir le focus, et
     le cycle doit revenir dans le dialogue. On compte donc les
     elements atteignables, on fait un tour complet plus deux, et on
     regarde la suite entiere.
     ============================================================ */
  const combien = await p.evaluate(() => {
    const d = document.getElementById("cadeau");
    return [...d.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter((e) => !e.disabled && !e.closest("[hidden]") && e.getBoundingClientRect().width > 0).length;
  });
  const ordre = [];
  for (let i = 0; i < combien + 3; i++) {
    await p.keyboard.press("Tab");
    ordre.push(await p.evaluate(() => {
      const a = document.activeElement;
      if (!a) return { ou: "?", dedans: false };
      const dedans = !!document.getElementById("cadeau").contains(a);
      return {
        ou: a.tagName + "." + String(a.className || "").split(" ")[0],
        dedans,
        /* `body` n'est pas « la page » : c'est l'etape par laquelle
           Chromium fait transiter le focus vers sa propre barre. Ce
           qui serait un vrai defaut, c'est un lien ou un bouton de la
           page derriere la modale. */
        estUnElementDeLaPage: !dedans && a !== document.body && a !== document.documentElement,
      };
    }));
  }
  R.clavier.elementsAtteignables = combien;
  R.clavier.ordreDeTabulation = ordre.map((o) => o.ou);
  R.clavier.aucunElementDeLaPageNAEuLeFocus = ordre.every((o) => !o.estUnElementDeLaPage);
  R.clavier.leCycleRevientDansLeDialogue = ordre.slice(1).some((o, i) => o.dedans && !ordre[i].dedans)
    || ordre.every((o) => o.dedans);
  R.clavier.focusResteDansLeDialogue =
    R.clavier.aucunElementDeLaPageNAEuLeFocus && R.clavier.leCycleRevientDansLeDialogue;
  await p.keyboard.press("Escape");
  await p.waitForTimeout(450);
  R.clavier.echapFerme = !(await ouvert(p));
  R.clavier.focusRendu = await p.evaluate(() => document.activeElement.tagName);
  await p.screenshot({ path: path.join(SORTIE, "02-apres-echap.png") });

  /* ---------- 4. IL REVIENT AU RECHARGEMENT ----------
     CETTE ASSERTION A ETE INVERSEE LE 2026-07-26, ET C'EST DELIBERE.
     Elle affirmait « pas deux fois dans la meme session ». La regle
     de frequence a change — « toujours, meme apres le courriel » —
     donc l'ancienne assertion serait devenue un test qui verrouille
     l'ancien comportement. Le projet a deja paye ca deux fois : un
     test vert sur un defaut est pire que pas de test. */
  await p.reload({ waitUntil: "load" });
  await attendre(p, 16000);
  R.revientAuRechargement = await ouvert(p);
  await p.screenshot({ path: path.join(SORTIE, "08-au-rechargement.png") });
  await ctx.close();
}

/* ---------- 2. DECLENCHEMENT ANTICIPE : la section Projets ---------- */
{
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await neuf(ctx);
  await p.goto(BASE, { waitUntil: "load" });
  const t0 = Date.now();
  /* IL FAUT Y ARRIVER VITE, sinon on ne mesure rien.
     La premiere version defilait par pas de 300 px sur
     `requestAnimationFrame` : la scene epinglee des Services rend
     ce trajet long de plus de quarante secondes, donc le
     declencheur principal de 11 s avait deja tout fait et le test
     concluait « pas d'anticipation » alors qu'il n'avait jamais eu
     l'occasion de la voir. On y va en gros pas — un visiteur
     presse, ce qui est justement le cas qu'on veut couvrir. */
  await p.evaluate(async () => {
    const c = document.getElementById("realisations");
    for (let i = 0; i < 40; i++) {
      const y = c.getBoundingClientRect().top + scrollY + 400;
      if (window.scrollY >= y) break;
      window.scrollBy(0, Math.min(1800, y - window.scrollY));
      await new Promise((r) => requestAnimationFrame(r));
    }
  });
  R.anticipeArriveeALaSection = Math.round((Date.now() - t0) / 100) / 10;
  await attendre(p, 12000);
  R.anticipe = {
    ouvert: await ouvert(p),
    paruApresSecondes: Math.round((Date.now() - t0) / 100) / 10,
    avantLes11sPrincipales: (Date.now() - t0) < 10500
  };
  await p.screenshot({ path: path.join(SORTIE, "03-anticipe-projets.png") });
  await ctx.close();
}

/* ---------- 3. IL N'INTERROMPT PAS UNE SAISIE ---------- */
{
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await neuf(ctx);
  await p.goto(BASE, { waitUntil: "load" });
  await p.evaluate(() => {
    const c = document.querySelector("input[type='email'], input[type='text'], #calculateur input[type='range']");
    if (c) c.focus();
  });
  await p.waitForTimeout(13500);
  R.nInterromptPasUneSaisie = { ouvertPendantLaSaisie: await ouvert(p) };
  await p.screenshot({ path: path.join(SORTIE, "04-pendant-saisie.png") });
  await p.evaluate(() => document.activeElement.blur());
  await attendre(p, 5000);
  R.nInterromptPasUneSaisie.paraitUneFoisLaSaisieFinie = await ouvert(p);
  await p.screenshot({ path: path.join(SORTIE, "05-apres-saisie.png") });
  await ctx.close();
}

/* ---------- 5. ADRESSE DONNEE : plus jamais, et remise sur place ---------- */
{
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await neuf(ctx);
  /* On intercepte l'envoi : ce scenario teste la MEMOIRE et la
     REMISE, pas la livraison. `cadeau-e2e.mjs --envoi-reel` teste
     la livraison, et c'est un autre outil. */
  await p.route("**/formsubmit.co/**", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: '{"success":"true"}' }));
  await p.goto(BASE, { waitUntil: "load" });
  await attendre(p, 16000);
  await p.fill("#cadeauEmail", "essai@exemple.ca");
  await p.click(".cadeau-go");
  await p.waitForTimeout(1500);
  R.apresEnvoi = await p.evaluate(() => {
    const d = document.getElementById("cadeau");
    return {
      remiseDevoilee: !d.querySelector(".cadeau-recu").hidden,
      liens: [...d.querySelectorAll(".cadeau-recu a")].map((a) => a.getAttribute("href")),
      message: (d.querySelector(".form-status") || {}).textContent,
      classeMessage: (d.querySelector(".form-status") || {}).className,
      marqueurPourToujours: localStorage.getItem("aped-cadeau-donne"),
      focusSurLaRemise: !!d.querySelector(".cadeau-recu").contains(document.activeElement)
    };
  });
  await p.screenshot({ path: path.join(SORTIE, "06-remise.png") });
  await p.keyboard.press("Escape");
  await p.waitForTimeout(400);
  /* Rechargement APRES avoir donne son adresse : il doit revenir.
     On ne vide RIEN — c'est justement le cas qu'on veut couvrir. */
  await p.reload({ waitUntil: "load" });
  await attendre(p, 16000);
  R.apresEnvoi.revientMemeApresLeCourriel = await ouvert(p);
  R.apresEnvoi.aucuneCleMorteLaissee = await p.evaluate(() => {
    try {
      return localStorage.getItem("aped-cadeau") === null
        && localStorage.getItem("aped-cadeau-donne") === null;
    } catch (e) { return false; }
  });
  await p.screenshot({ path: path.join(SORTIE, "09-revient-apres-courriel.png") });
  await ctx.close();
}

/* ---------- MOUVEMENT REDUIT ---------- */
{
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await neuf(ctx);
  await p.goto(BASE, { waitUntil: "load" });
  await attendre(p, 16000);
  R.mouvementReduit = {
    ouvert: await ouvert(p),
    aucuneAnimation: await p.evaluate(() => {
      const d = document.getElementById("cadeau");
      return getComputedStyle(d).animationName === "none"
        && getComputedStyle(d.querySelector(".cadeau-couv")).animationName === "none";
    })
  };
  await p.screenshot({ path: path.join(SORTIE, "07-mouvement-reduit.png") });
  await p.keyboard.press("Escape");
  await p.waitForTimeout(220);
  R.mouvementReduit.echapFermeSansAttendre = !(await ouvert(p));
  await ctx.close();
}

R.verdict = {
  paraitSeulAuBonMoment: R.principal.ouvert === true && R.principal.ouvertA8s === false,
  paraitPlusTotSurEngagement: R.anticipe.ouvert === true && R.anticipe.avantLes11sPrincipales === true,
  nInterromptPasUneSaisie: R.nInterromptPasUneSaisie.ouvertPendantLaSaisie === false
    && R.nInterromptPasUneSaisie.paraitUneFoisLaSaisieFinie === true,
  unSeulChamp: R.contenu.nombreDeChamps === 1 && R.contenu.champs[0] === "email",
  /* `uneSeuleAction: actionsVisibles.length === 1` a ete retire le
     2026-07-29. Il verrouillait le peage : une seule action possible,
     donc forcement celle qui exige l'adresse. Il y en a maintenant
     trois, et c'est la correction — deux telechargements directs plus
     un envoi facultatif. Ce qui compte n'est plus le NOMBRE mais
     l'ORDRE et la GRATUITE, et c'est ce qu'on mesure. */
  lesDeuxGuidesSansRienDonner: R.contenu.remiseOuverteDesLeDepart === true
    && R.contenu.lienDirectsVersLesPdf.length === 2
    && R.contenu.courrielRequis === false,
  laRemiseVientAvantLeFormulaire: R.contenu.remiseAvantLeFormulaire === true,
  /* C5 · un desabonnement suppose un abonnement, et il n'y a pas de
     liste d'envoi — la section Contact promet meme le contraire. */
  aucunePromesseDeDesabonnement: !/d[ée]sabonnement/i.test(R.contenu.reassurance || ""),
  beneficeLeBoutonLeDit: /guide/i.test(R.contenu.actionsVisibles[0] || ""),
  visuelDesDeuxDocuments: R.contenu.couvertures.length === 2 && R.contenu.couvertures.every((c) => c.rendue),
  sortieEvidente: R.contenu.sorties.length >= 2,
  reassurancePresente: !!R.contenu.reassurance,
  revientAuRechargement: R.revientAuRechargement === true,
  revientMemeApresLeCourriel: R.apresEnvoi.revientMemeApresLeCourriel === true,
  aucuneCleMorteLaissee: R.apresEnvoi.aucuneCleMorteLaissee === true,
  lesDeuxDocumentsSontRemis: R.apresEnvoi.remiseDevoilee === true && R.apresEnvoi.liens.length === 2,
  echapFerme: R.clavier.echapFerme === true,
  focusPiege: R.clavier.focusResteDansLeDialogue === true,
  mouvementReduitSansAnimation: R.mouvementReduit.ouvert === true && R.mouvementReduit.aucuneAnimation === true,
  aucuneErreurConsole: R.erreurs.length === 0
};
console.log(JSON.stringify(R, null, 1));
fs.writeFileSync(path.join(SORTIE, "rapport.json"), JSON.stringify(R, null, 2));
await nav.close();
