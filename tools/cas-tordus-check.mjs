/* ============================================================
   LES CAS TORDUS ET LES MESURES — `node tools/cas-tordus-check.mjs`

   CE QU'IL GARDE.  D-772

   Un formulaire ne casse jamais sur le parcours qu'on a dessiné.
   Il casse sur le double clic, la connexion qui tombe au mauvais
   moment, le texte de 8 000 signes collé depuis un courriel, les
   deux onglets ouverts sur la même chose, et le bouton « page
   précédente » du navigateur.

   IL MESURE AUSSI. LCP, CLS, requêtes tierces, erreurs console —
   les seuils de CLAUDE.md, pris ici et non supposés.

   RÉSERVE, ET ELLE VAUT POUR TOUT CE FICHIER : Chromium sous
   Playwright sur une machine de bureau Windows. Aucun de ces
   chiffres ne vient d'un appareil réel, y compris ceux relevés en
   390 px de large.

   Sorties : 0 tout tient · 1 défaut.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");

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
function mesure(nom, valeur, seuil, unite) {
  n++;
  const ok = valeur <= seuil;
  if (!ok) ko++;
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + nom
    + " : " + valeur + unite + "   (seuil " + seuil + unite + ")");
}
function titre(t) { console.log(""); console.log("--- " + t); }

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png",
  ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif",
  ".pdf": "application/pdf", ".json": "application/json", ".ico": "image/x-icon" };
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

/* Un contexte neuf par famille de cas : le `localStorage` d'un cas
   ne doit pas décider du suivant. */
async function neuve(largeur = 390) {
  const ctx = await nav.newContext({ viewport: { width: largeur, height: 844 } });
  const page = await ctx.newPage();
  /* DEUX SEAUX, PAS UN.

     Couper le reseau exprès fait ecrire « net::ERR_FAILED » par le
     navigateur : c'est MOI qui l'ai provoque, pas un defaut du
     site. Les melanger faisait echouer le cas de la coupure sur sa
     propre mise en scene. Ce qui doit rester a zero en toutes
     circonstances, c'est l'exception JS non rattrapee — elle, elle
     appartient au code. */
  const erreurs = [];      /* exceptions JS : toujours zero */
  const reseau = [];       /* echecs de requete : attendus quand on coupe */
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    (/ERR_|Failed to load resource|net::/.test(m.text()) ? reseau : erreurs).push(m.text());
  });
  page.on("pageerror", (e) => erreurs.push(String(e)));
  const envois = [];
  page.on("request", (r) => {
    if (r.url().indexOf("script.google.com") === -1) return;
    if (r.method() !== "POST") return;
    try { envois.push(r.postData() || ""); } catch (e) {}
  });
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("aped-sans-popup", "1");
      sessionStorage.setItem("aped-entree-saut", "1");
    } catch (e) {}
  });
  return { ctx, page, erreurs, reseau, envois };
}
const fauxJson = { success: true, ligne: 2, session: true, etape: "1 / 8" };
async function bouchon(page, options) {
  await page.route("**script.google.com/**", (r) => {
    if (options && options.mort) return r.abort("failed");
    if (options && options.lent) {
      return setTimeout(() => r.fulfill({ status: 200, contentType: "application/json",
        body: JSON.stringify(fauxJson) }), options.lent);
    }
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fauxJson) });
  });
}
async function ouvrirProjet(page) {
  await page.evaluate(() => {
    document.querySelectorAll(".modal").forEach((m) => { m.hidden = true; });
  });
  const b = await page.$('[data-modal-open="modal-project"]');
  await b.evaluate((el) => el.click());
  await page.waitForTimeout(500);
}

console.log("============================================================");
console.log("LES CAS TORDUS");
console.log("Chromium sous Playwright, bureau Windows. AUCUN appareil réel.");
console.log("============================================================");

/* ============================================================
   1 · LE DOUBLE CLIC
   ============================================================ */
titre("1 · DEUX CLICS SUR « CONTINUER » N'AVANCENT PAS DE DEUX");
{
  const { ctx, page, erreurs } = await neuve();
  await bouchon(page);
  await page.goto(BASE + "/index.html", { waitUntil: "load" });
  await page.waitForTimeout(2600);
  await ouvrirProjet(page);
  await page.evaluate(() => {
    const p = (i, v) => { const e = document.getElementById(i); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
    p("prName", "ZZ Double"); p("prCompany", "ZZ inc");
  });
  /* Deux clics dans la même frame : c'est le geste d'un pouce
     nerveux sur un téléphone lent. */
  await page.evaluate(() => {
    const b = document.getElementById("projectNext");
    b.click(); b.click();
  });
  await page.waitForTimeout(500);
  const ou = await page.evaluate(() => {
    const s = [...document.querySelectorAll("#projectWizard .step[data-pstep]")].find((x) => !x.hidden);
    return s ? Number(s.dataset.pstep) : 0;
  });
  dire("on avance d'UNE étape, pas de deux", ou, 2,
    "le second clic tombe sur l'écran suivant, dont les champs sont vides : il doit être refusé");
  dire("aucune erreur console", erreurs.length, 0, erreurs.join(" | "));
  await ctx.close();
}

/* ============================================================
   2 · LA CONNEXION QUI TOMBE
   ============================================================ */
titre("2 · L'ENVOI QUI N'ABOUTIT PAS");
{
  const { ctx, page, erreurs, reseau } = await neuve();
  await bouchon(page, { mort: true });
  await page.goto(BASE + "/index.html", { waitUntil: "load" });
  await page.waitForTimeout(2600);

  /* Le formulaire de contact : une seule page, donc l'échec se voit
     tout de suite. */
  await page.evaluate(() => {
    const p = (i, v) => { const e = document.getElementById(i); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
    p("ctName", "ZZ Coupure"); p("ctEmail", "zz@exemple.ca"); p("ctMsg", "Bonjour, ceci est un essai.");
    document.querySelector('form[data-form="contact"]').requestSubmit();
  });
  await page.waitForTimeout(3000);

  const etat = await page.evaluate(() => {
    const f = document.querySelector('form[data-form="contact"]');
    return {
      message: (f.querySelector(".form-status") || {}).textContent || "",
      nom: document.getElementById("ctName").value,
      texte: document.getElementById("ctMsg").value,
      bouton: (f.querySelector("[data-submit]") || {}).className || ""
    };
  });
  dire("le visiteur est prévenu", etat.message.trim().length > 0, true, JSON.stringify(etat.message));
  dire("le message ne dit pas « envoyé »", /envoyé|reçu|merci/i.test(etat.message), false, etat.message);
  dire("CE QU'IL A ÉCRIT EST TOUJOURS LÀ", etat.texte, "Bonjour, ceci est un essai.",
    "perdre le texte d'un visiteur sur une coupure réseau, c'est le perdre lui");
  dire("son nom aussi", etat.nom, "ZZ Coupure");
  dire("le bouton n'est pas resté en chargement",
    /is-loading/.test(etat.bouton), false,
    "un bouton qui tourne pour toujours est un formulaire mort");
  dire("aucune exception JS non rattrapée", erreurs.length, 0, erreurs.slice(0, 2).join(" | "));
  dire("l'échec réseau, lui, a bien été vu",
    reseau.length > 0, true,
    "si le navigateur n'a rien signalé, c'est le bouchon qui n'a pas coupé, et le cas ne prouve rien");
  await ctx.close();
}

/* ============================================================
   3 · LE TEXTE TRÈS LONG ET LES SIGNES SPÉCIAUX
   ============================================================ */
titre("3 · CE QU'ON COLLE DEPUIS UN COURRIEL");
{
  const { ctx, page, erreurs, envois } = await neuve();
  await bouchon(page);
  await page.goto(BASE + "/index.html", { waitUntil: "load" });
  await page.waitForTimeout(2600);

  const LONG = "Bonjour. ".repeat(900);            /* ~8 100 signes */
  const TORDU = "=1+1 <script>alert(1)</script> «guillemets» — tiret — éèêç 😀 \"double\" 'simple' \\backslash\\ ;;;";

  await page.evaluate(([lg, td]) => {
    const p = (i, v) => { const e = document.getElementById(i); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
    p("ctName", td); p("ctEmail", "zz@exemple.ca"); p("ctMsg", lg);
    document.querySelector('form[data-form="contact"]').requestSubmit();
  }, [LONG, TORDU]);
  await page.waitForTimeout(1600);

  dire("l'envoi est parti malgré tout", envois.length >= 1, true);
  let c = null;
  try { c = JSON.parse(envois[0] || "{}"); } catch (e) {}
  dire("le texte long part ENTIER", c && String(c.message).length, LONG.length,
    "tronquer côté site ferait perdre la fin sans que personne le sache");
  dire("les signes spéciaux traversent intacts", c && c.nom, TORDU);
  dire("rien n'a été interprété comme du HTML",
    await page.evaluate(() => !!document.querySelector("#modal-project script")), false);

  /* AUCUN DÉBORDEMENT HORIZONTAL, quoi qu'on colle. */
  const deborde = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  dire("la page ne déborde pas en largeur", deborde, false,
    "un mot de 8 000 signes pousse la mise en page si rien ne le coupe");
  dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 2).join(" | "));
  await ctx.close();
}

/* ============================================================
   4 · LE PIÈGE À ROBOTS
   ============================================================ */
titre("4 · LE HONEYPOT");
{
  const { ctx, page, envois } = await neuve();
  await bouchon(page);
  await page.goto(BASE + "/index.html", { waitUntil: "load" });
  await page.waitForTimeout(2600);
  const cache = await page.evaluate(() => {
    const h = document.getElementById("hpContact");
    if (!h) return null;
    const c = h.closest(".piege") || h;
    const r = c.getBoundingClientRect();
    return { visible: r.width > 1 && r.height > 1, aria: h.getAttribute("tabindex"),
             auto: h.getAttribute("autocomplete") };
  });
  dire("le champ piège existe", cache !== null, true);
  dire("il est invisible à l'œil", cache && cache.visible, false);
  dire("et hors du parcours au clavier", cache && cache.aria, "-1",
    "un champ piège qui reçoit le focus piège le visiteur, pas le robot");
  await ctx.close();
}

/* ============================================================
   5 · DEUX ONGLETS SUR LE MÊME FORMULAIRE
   ============================================================ */
titre("5 · DEUX ONGLETS, UNE SEULE LIGNE");
{
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("aped-sans-popup", "1");
      sessionStorage.setItem("aped-entree-saut", "1");
    } catch (e) {}
  });
  const a = await ctx.newPage(), b = await ctx.newPage();
  for (const p of [a, b]) {
    await p.route("**script.google.com/**", (r) =>
      r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fauxJson) }));
    await p.goto(BASE + "/index.html", { waitUntil: "load" });
    await p.waitForTimeout(2600);
  }
  const sidsA = [], sidsB = [];
  a.on("request", (r) => { if (r.method() === "POST" && r.url().indexOf("script.google") !== -1) { try { sidsA.push(JSON.parse(r.postData())._sid); } catch (e) {} } });
  b.on("request", (r) => { if (r.method() === "POST" && r.url().indexOf("script.google") !== -1) { try { sidsB.push(JSON.parse(r.postData())._sid); } catch (e) {} } });

  for (const p of [a, b]) {
    await ouvrirProjet(p);
    await p.evaluate(() => {
      const q = (i, v) => { const e = document.getElementById(i); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
      q("prName", "ZZ Onglets"); q("prCompany", "ZZ inc");
    });
    await p.click("#projectNext");
    await p.waitForTimeout(700);
  }
  dire("les deux onglets ont écrit", sidsA.length && sidsB.length ? true : false, true);
  dire("ILS PARTAGENT LA MÊME SESSION", sidsA[0] === sidsB[0], true,
    "deux sessions = deux lignes pour un seul visiteur · A=" + sidsA[0] + " B=" + sidsB[0]);
  await ctx.close();
}

/* ============================================================
   6 · LE RETOUR ARRIÈRE DU NAVIGATEUR
   ============================================================ */
titre("6 · LE BOUTON « PAGE PRÉCÉDENTE »");
{
  const { ctx, page, erreurs } = await neuve();
  await bouchon(page);
  await page.goto(BASE + "/index.html", { waitUntil: "load" });
  await page.waitForTimeout(2600);
  await ouvrirProjet(page);
  await page.evaluate(() => {
    const q = (i, v) => { const e = document.getElementById(i); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
    q("prName", "ZZ Retour"); q("prCompany", "ZZ inc");
  });
  await page.click("#projectNext");
  await page.waitForTimeout(600);

  /* IL FAUT UN VRAI HISTORIQUE. Premiere version : `goBack` depuis
     la seule page ouverte retombait sur `about:blank`, ou lire le
     `localStorage` leve une SecurityError — l'outil mourait sur sa
     propre mise en scene. Le geste reel est : il ouvre la politique
     de confidentialite depuis le formulaire, puis revient. */
  await page.goto(BASE + "/confidentialite.html", { waitUntil: "load" });
  await page.waitForTimeout(600);
  await page.goBack({ waitUntil: "load" });
  await page.waitForTimeout(1600);
  const apres = await page.evaluate(() => ({
    url: location.pathname,
    vivant: !!document.getElementById("projectWizard"),
    brouillon: !!localStorage.getItem("aped-brouillon-project")
  }));
  dire("la page reste vivante", apres.vivant, true);
  dire("et le brouillon a survécu", apres.brouillon, true,
    "c'est lui qui permet au lien de relance de tout remettre");
  dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 2).join(" | "));
  await ctx.close();
}

/* ============================================================
   7 · LES MESURES
   ============================================================ */
titre("7 · LES SEUILS DE CLAUDE.md");
{
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const erreurs = [], tierces = [];
  page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
  page.on("pageerror", (e) => erreurs.push(String(e)));
  page.on("request", (r) => {
    const u = r.url();
    if (u.startsWith(BASE) || u.startsWith("data:") || u.startsWith("blob:")) return;
    tierces.push(u);
  });
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("aped-sans-popup", "1");
      sessionStorage.setItem("aped-entree-saut", "1");
    } catch (e) {}
    window.__cls = 0;
    new PerformanceObserver((l) => {
      l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; });
    }).observe({ type: "layout-shift", buffered: true });
    /* LE LCP SE RECOLTE PAR OBSERVATEUR, PAS PAR `getEntriesByType`.
       Premiere version : elle rendait -1, donc « 0 ms », donc un
       seuil tenu — sur une mesure qui n'avait jamais eu lieu. Un
       chiffre absent qui passe pour un bon chiffre est exactement
       le piege 4. */
    window.__lcp = 0; window.__lcpQuoi = "";
    new PerformanceObserver((l) => {
      const e = l.getEntries();
      const d = e[e.length - 1];
      window.__lcp = Math.round(d.startTime);
      window.__lcpQuoi = (d.element && (d.element.className || d.element.tagName)) || "?";
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  await page.goto(BASE + "/index.html", { waitUntil: "load" });
  await page.waitForTimeout(3200);

  const m = await page.evaluate(() => ({
    lcp: window.__lcp || 0,
    cible: window.__lcpQuoi || "?",
    cls: Math.round((window.__cls || 0) * 1000) / 1000,
    palier: document.documentElement.getAttribute("data-palier")
  }));
  console.log("         data-palier : " + m.palier + "   ·   cible LCP : " + m.cible);
  /* UN LCP A ZERO N'EST PAS UN LCP EXCELLENT, c'est un LCP jamais
     mesure : on arrete plutot que de rendre un seuil tenu. */
  if (!m.lcp) {
    console.error("ARRET · aucun LCP releve. Le seuil ne peut pas etre juge,");
    console.error("        et « 0 ms » se lirait comme une reussite.");
    process.exit(2);
  }
  mesure("LCP", m.lcp, 300, " ms");
  mesure("CLS", m.cls, 0, "");
  dire("aucune requête tierce", tierces.length, 0, tierces.slice(0, 3).join(" | "));
  dire("aucune erreur console", erreurs.length, 0, erreurs.slice(0, 3).join(" | "));

  await ctx.close();
}

/* ============================================================
   7bis · LE DEBORDEMENT, MESURE A CHARGEMENT NEUF
   ============================================================ */
titre("7bis · AUCUN DÉBORDEMENT, DE 320 À 1920 px");
{
  /* CHAQUE LARGEUR SE MESURE SUR UNE PAGE CHARGEE A CETTE LARGEUR.

     Premiere version : elle redimensionnait la fenetre apres un
     chargement en 1440, et rendait 170 px de debordement a 320. Un
     chargement neuf rend ZERO aux memes largeurs — ce que la
     premiere mesurait, c'etait une mise en page calculee pour un
     ecran large et jamais recalculee, c'est-a-dire son propre
     protocole. Redimensionner n'est pas visiter. */
  for (const w of [320, 390, 768, 1280, 1920]) {
    const c2 = await nav.newContext({ viewport: { width: w, height: 900 } });
    const p2 = await c2.newPage();
    await p2.addInitScript(() => {
      try {
        sessionStorage.setItem("aped-sans-popup", "1");
        sessionStorage.setItem("aped-entree-saut", "1");
      } catch (e) {}
    });
    await p2.goto(BASE + "/index.html", { waitUntil: "load" });
    await p2.waitForTimeout(2800);
    const d = await p2.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    dire("aucun débordement horizontal à " + w + " px", d <= 1, true, "écart : " + d + " px");
    await c2.close();
  }
}

/* ============================================================
   8 · LES CIBLES AU POUCE
   ============================================================ */
titre("8 · TOUT CE QUI SE TOUCHE FAIT 44 px");
{
  const { ctx, page } = await neuve(390);
  await bouchon(page);
  await page.goto(BASE + "/index.html", { waitUntil: "load" });
  await page.waitForTimeout(2600);
  await ouvrirProjet(page);

  const petits = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("#modal-project button, #modal-project select, "
      + "#modal-project input:not([type=hidden]):not([type=file]), #modal-project a").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;      /* masqué : hors sujet */
      /* LE CHAMP PIEGE EST INVISIBLE PAR CONSTRUCTION, et il n'a
         pas a etre touchable — l'exiger a 44 px reviendrait a
         demander qu'un piege a robots soit confortable au pouce. */
      if (el.classList.contains("piege") || (el.closest && el.closest(".piege"))) return;
      /* LA LARGEUR COMPTE AUTANT QUE LA HAUTEUR, ET ELLE MANQUAIT.
         D-773
         Ce controle ne regardait que `r.height`. Le bouton « Fermer »
         d'une modale mesurait 44 px de haut et 20 px de large a
         390 px — comprime par le titre, faute de consigne de retrait
         sur son item flex — et il passait depuis toujours. Un test
         qui verrouille le defaut qu'il est cense garder est la faute
         la plus chere du depot (piege 17). */
      if (r.height < 44 || r.width < 44) {
        out.push((el.id || el.className || el.tagName)
          + " " + Math.round(r.width) + "x" + Math.round(r.height) + "px");
      }
    });
    return out;
  });
  dire("aucune cible sous 44 px dans le formulaire projet",
    petits.length, 0, petits.slice(0, 6).join(" · "));

  /* CHAQUE ARRÊT AU CLAVIER A UN ANNEAU. */
  const sansAnneau = await page.evaluate(() => {
    const out = [];
    const cibles = [...document.querySelectorAll(
      "#modal-project button, #modal-project select, #modal-project input:not([type=hidden]), #modal-project a")]
      .filter((el) => el.offsetParent !== null && el.tabIndex >= 0);
    cibles.forEach((el) => {
      el.focus();
      const s = getComputedStyle(el);
      const large = parseFloat(s.outlineWidth) > 0 && s.outlineStyle !== "none";
      const ombre = s.boxShadow && s.boxShadow !== "none";
      if (!large && !ombre) out.push(el.id || el.className || el.tagName);
    });
    return out;
  });
  dire("chaque arrêt au clavier a un anneau visible",
    sansAnneau.length, 0, sansAnneau.slice(0, 6).join(" · "));
  await ctx.close();
}

await nav.close();
serveur.close();
console.log("");
console.log("============================================================");
console.log(ko ? ("DES CAS NE TIENNENT PAS : " + ko + " échec(s) sur " + n)
              : ("LES CAS TORDUS TIENNENT : " + n + " / " + n));
console.log("RÉSERVE : Chromium/Playwright sur bureau Windows, jamais un appareil réel.");
console.log("============================================================");
process.exit(ko ? 1 : 0);
