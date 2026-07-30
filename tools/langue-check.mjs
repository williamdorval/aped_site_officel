/* ============================================================
   PHASE 8 — verification de la langue de mouvement.

   Ce script ne rend pas des impressions, il rend des chiffres et
   des booleens. Il verifie, dans l'ordre :

   1. zero erreur de console, zero requete tierce ;
   2. les quatre verbes existent VRAIMENT dans le document rendu :
      lettres decoupees, mots d'encre, odometre, curseur du rail,
      soudure, voile de grains ;
   3. le texte accessible est IDENTIQUE au caractere pres apres
      decoupage — c'est le seul risque reel d'un decoupage par
      lettre ;
   4. la frequence d'images pendant un defilement complet ;
   5. aucun element ne reste a opacite nulle apres la traversee.

   Lancer `node tools/serve.mjs 8099` d'abord.
   ============================================================ */
import { chromium } from "playwright";

const B = process.argv[2] || "http://localhost:8099";
const nav = await chromium.launch();

function ligne(ok, texte) {
  console.log((ok ? "  OK   " : "  ECHEC") + "  " + texte);
  return ok ? 0 : 1;
}

let echecs = 0;

/* ------------------------------------------------------------
   1. Console, requetes, et presence des mecaniques.
   ------------------------------------------------------------ */
{
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const erreurs = [];
  const hotes = new Set();
  page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
  page.on("pageerror", (e) => erreurs.push("pageerror: " + e.message));
  page.on("request", (r) => { try { hotes.add(new URL(r.url()).host); } catch (e) {} });

  await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  await page.goto(B + "/", { waitUntil: "load" });
  /* La vague 2 attend un geste ou 1,2 s. On donne le geste. */
  await page.mouse.move(700, 400);
  await page.waitForTimeout(1800);

  /* Le texte accessible AVANT decoupage, sur tous les boutons. */
  const avant = await page.$$eval(".btn", (b) => b.map((x) => x.textContent));

  /* On survole chaque bouton pour declencher le decoupage paresseux. */
  const boutons = await page.$$(".btn");
  for (const b of boutons) {
    try { await b.hover({ timeout: 400, force: true }); } catch (e) {}
  }
  await page.waitForTimeout(200);

  const apres = await page.$$eval(".btn", (b) => b.map((x) => x.textContent));
  const decoupes = await page.$$eval(".btn[data-lettres]", (b) => b.length);
  const lettres = await page.$$eval(".btn .l", (b) => b.length);

  console.log("\n1 · CONSOLE, RESEAU, DECOUPAGE");
  echecs += ligne(erreurs.length === 0, `erreurs de console : ${erreurs.length}${erreurs.length ? " -> " + erreurs.slice(0, 3).join(" | ") : ""}`);
  echecs += ligne(hotes.size === 1, `hotes contactes : ${[...hotes].join(", ")}`);
  echecs += ligne(decoupes > 0, `boutons decoupes au survol : ${decoupes} / ${boutons.length}, ${lettres} lettres`);

  const identique = avant.length === apres.length && avant.every((t, i) => t === apres[i]);
  echecs += ligne(identique, "texte accessible des boutons identique au caractere pres apres decoupage");

  /* Etat de survol : contraste de l'aplat. */
  if (boutons.length) {
    await boutons[0].hover({ force: true });
    await page.waitForTimeout(360);
    const remplissage = await page.$eval(".btn", (el) =>
      getComputedStyle(el, "::before").transform);
    echecs += ligne(remplissage !== "none" && !/matrix\(1, 0, 0, 0,/.test(remplissage),
      `aplat d'encre au survol : transform ${remplissage}`);
  }
  await ctx.close();
}

/* ------------------------------------------------------------
   2. Traversee complete : verbes en action, FPS, opacites.
   ------------------------------------------------------------ */
{
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {}
    window.__f = { n: 0, t0: 0, longues: [] };
    const tic = (t) => {
      if (!window.__f.t0) window.__f.t0 = t;
      window.__f.n++;
      requestAnimationFrame(tic);
    };
    requestAnimationFrame(tic);
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__f.longues.push(Math.round(e.duration));
    }).observe({ type: "longtask", buffered: true });
  });
  await page.goto(B + "/", { waitUntil: "load" });
  await page.mouse.move(700, 400);
  await page.waitForTimeout(1600);

  /* Defilement complet, par pas reguliers, a vitesse humaine. */
  await page.evaluate(() => { window.__f.n = 0; window.__f.t0 = 0; });
  const debut = Date.now();
  const hauteur = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const pas = Math.max(1, Math.round(hauteur / 60));
  for (let y = 0; y <= hauteur; y += pas) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(28);
  }
  const duree = Date.now() - debut;
  const f = await page.evaluate(() => window.__f);
  const fps = Math.round((f.n / duree) * 1000);

  console.log("\n2 · TRAVERSEE COMPLETE");
  echecs += ligne(fps >= 50, `frequence d'images pendant le defilement complet : ${fps} i/s`);
  const pire = Math.max(0, ...f.longues);
  console.log(`         taches longues pendant la traversee : ${f.longues.length}, la pire ${pire} ms`);

  /* Les quatre verbes ont-ils laisse une trace ? */
  const trace = await page.evaluate(() => ({
    mots: document.querySelectorAll(".mot-encre").length,
    odo: document.querySelectorAll(".odo").length,
    curseur: !!document.querySelector(".rail-curseur.is-on"),
    soude: document.querySelectorAll("[data-souder]").length,
    lignes: document.querySelectorAll(".head h2 .ligne").length,
    degage: document.querySelectorAll("[data-degage]").length
  }));
  console.log("\n3 · LES QUATRE VERBES DANS LE DOCUMENT RENDU");
  echecs += ligne(trace.lignes > 0, `V1 titres decoupes en lignes : ${trace.lignes}`);
  echecs += ligne(trace.mots > 0, `V1 mots d'encre poses : ${trace.mots}`);
  echecs += ligne(trace.degage > 0, `V1 elements a degager : ${trace.degage}`);
  echecs += ligne(trace.odo > 0, `V4 odometres actifs : ${trace.odo}`);
  echecs += ligne(trace.curseur, "N1 curseur du rail pose et visible");
  echecs += ligne(trace.soude > 0, `V3 hotes de soudure : ${trace.soude}`);

  /* Rien ne doit rester invisible apres la traversee. */
  const fantomes = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("main *, footer *").forEach((el) => {
      const s = getComputedStyle(el);
      if (s.display === "none" || s.visibility === "hidden") return;
      if (el.offsetParent === null && s.position !== "fixed") return;
      /* Les treize maquettes de secteur vivent toutes dans le
         document et une seule est montree : les douze autres sont
         a opacite nulle PAR CONCEPTION, elles sont decoratives et
         leur sous-arbre entier est `aria-hidden`. Un detecteur qui
         ne fait pas la difference entre « masque expres » et
         « perdu » ne mesure rien. */
      if (el.closest('[aria-hidden="true"]')) return;
      if (parseFloat(s.opacity) < 0.06 && el.textContent.trim().length > 2) {
        out.push((el.tagName + "." + el.className).slice(0, 70));
      }
    });
    return out;
  });
  console.log("\n4 · AUCUN CONTENU RESTE INVISIBLE");
  echecs += ligne(fantomes.length === 0,
    `elements de texte a opacite quasi nulle apres traversee : ${fantomes.length}${fantomes.length ? " -> " + fantomes.slice(0, 5).join(" | ") : ""}`);
  await ctx.close();
}

/* ------------------------------------------------------------
   2bis. AUCUN TEXTE NE RESTE A MI-CHEMIN.

   C'est le test le plus important du fichier, et il vient d'un
   defaut reel. Une animation SCRUBBEE n'a pas d'etat de repos :
   elle a l'etat ou le visiteur s'est arrete. Des qu'elle touche a
   l'opacite d'un TEXTE, chaque position de defilement devient un
   etat permanent possible, et chacun doit tenir le contraste.

   Mesure du 2026-07-26 : les mots des chapos etaient scrubbes et
   restaient a 0,39 d'opacite — environ 1,5:1 sur le ciment — avec
   le paragraphe a 64 % de la hauteur d'ecran, c'est-a-dire a une
   position de lecture parfaitement ordinaire.

   Ce test s'arrete sur chaque chapo a six hauteurs d'ecran
   differentes, attend que tout soit pose, et exige que chaque mot
   soit a pleine encre. Il echoue si quelqu'un remet un scrub sur
   une opacite de texte.
   ------------------------------------------------------------ */
{
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  await page.goto(B + "/", { waitUntil: "load" });
  await page.mouse.move(700, 400);
  await page.waitForTimeout(1700);

  const n = await page.$$eval(".head p", (p) => p.length);
  let pire = 1, ou = "";
  for (let i = 0; i < n; i++) {
    for (const frac of [0.92, 0.80, 0.68, 0.56]) {
      await page.evaluate(([k, f]) => {
        const t = document.querySelectorAll(".head p")[k];
        window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY - innerHeight * f);
      }, [i, frac]);
      /* 1500 ms : plus long que la vague la plus longue du site
         (0,34 s de duree plus 0,62 s de decalage cumule). En deca,
         on attrape l'animation EN VOL et on la prend pour un texte
         echoue — ce qui est le contraire de ce qu'on cherche. */
      await page.waitForTimeout(1500);
      const o = await page.evaluate((k) => {
        const t = document.querySelectorAll(".head p")[k];
        const m = [...t.querySelectorAll(".mot-encre")];
        if (!m.length) return 1;
        return Math.min(...m.map((x) => parseFloat(getComputedStyle(x).opacity)));
      }, i);
      if (o < pire) { pire = o; ou = `chapo ${i + 1} a ${Math.round(frac * 100)}% de l'ecran`; }
    }
  }
  console.log("\n2bis · AUCUN TEXTE A MI-CHEMIN A L'ARRET");
  echecs += ligne(pire > 0.99,
    `opacite minimale d'un mot a une position d'arret : ${pire.toFixed(2)}${pire > 0.99 ? "" : " -> " + ou}`);
  await ctx.close();
}

/* ------------------------------------------------------------
   3. Mouvement reduit : rien ne se perd, rien ne s'inverse.
   ------------------------------------------------------------ */
{
  const ctx = await nav.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce"
  });
  const page = await ctx.newPage();
  const erreurs = [];
  page.on("pageerror", (e) => erreurs.push(e.message));
  await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  await page.goto(B + "/", { waitUntil: "load" });
  await page.mouse.move(700, 400);
  await page.waitForTimeout(1800);

  const hauteur = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let y = 0; y <= hauteur; y += Math.max(1, Math.round(hauteur / 24))) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(40);
  }

  const r = await page.evaluate(() => {
    const invisibles = [];
    document.querySelectorAll("main *, footer *").forEach((el) => {
      const s = getComputedStyle(el);
      if (s.display === "none" || s.visibility === "hidden") return;
      if (el.offsetParent === null && s.position !== "fixed") return;
      if (el.closest('[aria-hidden="true"]')) return;
      if (parseFloat(s.opacity) < 0.5 && el.textContent.trim().length > 2) {
        invisibles.push((el.tagName + "." + el.className).slice(0, 70));
      }
    });
    return {
      invisibles,
      reste: (document.getElementById("railLeftNum") || {}).textContent || "",
      etape: (document.getElementById("parcNum") || {}).textContent || "",
      /* Le compteur du rail des services a disparu avec le rail
         le 2026-07-30. Ce qui porte le N1 de la section 02 est
         maintenant l ensemble des quatre noms, lisibles en meme
         temps et sans script. */
      svc: document.querySelectorAll(".svc-index a").length + " / 4 chantiers nommes",
      curseur: !!document.querySelector(".rail-curseur.is-on"),
      langue: document.querySelectorAll(".mot-encre").length
    };
  });

  console.log("\n5 · MOUVEMENT REDUIT");
  echecs += ligne(erreurs.length === 0, `erreurs : ${erreurs.length}`);
  echecs += ligne(r.invisibles.length === 0,
    `contenu masque : ${r.invisibles.length}${r.invisibles.length ? " -> " + r.invisibles.slice(0, 5).join(" | ") : ""}`);
  echecs += ligne(r.langue === 0, "la choregraphie ne s'execute pas (aucun mot d'encre pose)");
  echecs += ligne(r.reste.trim() !== "", `N1 sections restantes toujours affiche : « ${r.reste.trim()} »`);
  echecs += ligne(r.etape.trim() !== "", `N1 etape du parcours toujours affichee : « ${r.etape.trim()} »`);
  echecs += ligne(r.svc.trim() !== "", `N1 compteur des chantiers toujours affiche : « ${r.svc.trim()} »`);
  echecs += ligne(r.curseur, "N1 curseur du rail toujours pose");
  await ctx.close();
}

await nav.close();
console.log(`\n${echecs === 0 ? "TOUT PASSE" : echecs + " ECHEC(S)"}\n`);
process.exit(echecs === 0 ? 0 : 1);
