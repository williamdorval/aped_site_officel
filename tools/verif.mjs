/* VÉRIFICATION FINALE. `node tools/verif.mjs`
   Clavier, perf, orientation, contrastes, console, débordement. */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.APED_BASE || "http://localhost:8099";
const OUT = path.resolve("refonte-captures/verif");
fs.mkdirSync(OUT, { recursive: true });
const R = {};

const browser = await chromium.launch();

/* ---------- 1. PERFORMANCE ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  /* Le popup parait tout seul a la 11e seconde, a CHAQUE
     chargement. Cet outil mesure autre chose : on le neutralise,
     sinon il mesure une surcouche par-dessus sa cible. */
  await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  await page.addInitScript(() => {
    window.__perf = { lcp: 0, cls: 0, longues: [] };
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__perf.lcp = e.startTime; })
      .observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver(l => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__perf.longues.push(Math.round(e.duration)); })
      .observe({ type: "longtask", buffered: true });
  });
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(3000);

  /* FPS pendant un défilement réel, mesurées image par image. */
  const fps = await page.evaluate(() => new Promise(res => {
    const t = [];
    let dernier = performance.now(), n = 0;
    const h = document.documentElement.scrollHeight - innerHeight;
    const boucle = now => {
      t.push(now - dernier); dernier = now;
      window.scrollTo(0, (h * n) / 150);
      if (++n <= 150) requestAnimationFrame(boucle);
      else {
        const tri = t.slice(5).sort((a, b) => a - b);
        res({
          moy: Math.round(1000 / (tri.reduce((a, b) => a + b, 0) / tri.length)),
          p95: Math.round(1000 / tri[Math.floor(tri.length * 0.95)]),
          pire: Math.round(1000 / tri[tri.length - 1])
        });
      }
    };
    requestAnimationFrame(boucle);
  }));

  /* INP approché : latence réelle d'un clic sur le CTA primaire. */
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  const t0 = Date.now();
  await page.click(".hero-cta .btn--primary");
  /* Le CTA primaire du hero ouvre `modal-project`, pas `modal-start`.  D-712 */
  await page.waitForSelector("#modal-project.is-open", { timeout: 4000 });
  const inp = Date.now() - t0;
  await page.keyboard.press("Escape");

  const perf = await page.evaluate(() => window.__perf);
  const poids = await page.evaluate(() =>
    performance.getEntriesByType("resource").reduce((a, r) => a + (r.transferSize || 0), 0));
  R.perf = {
    lcp: Math.round(perf.lcp), cls: Math.round(perf.cls * 1000) / 1000,
    tachesLongues: perf.longues, inpClic: inp, fps, poidsKo: Math.round(poids / 1024),
    requetesTierces: await page.evaluate(() =>
      performance.getEntriesByType("resource").filter(r => !r.name.startsWith(location.origin)).length)
  };
  await ctx.close();
}

/* ---------- 2. CLAVIER, DE BOUT EN BOUT ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  /* Le popup parait tout seul a la 11e seconde, a CHAQUE
     chargement. Cet outil mesure autre chose : on le neutralise,
     sinon il mesure une surcouche par-dessus sa cible. */
  await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(1600);
  await page.evaluate(() => document.body.focus());

  const parcours = [];
  let piege = null, sansAnneau = [];
  for (let i = 0; i < 220; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const a = document.activeElement;
      if (!a || a === document.body) return null;
      const cs = getComputedStyle(a);
      const r = a.getBoundingClientRect();
      /* IDENTITE REELLE, pas une chaine descriptive. Voir le
         commentaire du detecteur plus bas : deux elements distincts
         peuvent partager selecteur ET texte. On leur pose une
         etiquette unique la premiere fois qu'on les voit. */
      if (!a.dataset.__id) {
        window.__n = (window.__n || 0) + 1;
        a.dataset.__id = "e" + window.__n;
      }
      return {
        id: a.dataset.__id,
        sel: a.tagName.toLowerCase() + (a.id ? "#" + a.id : "") +
             (typeof a.className === "string" && a.className ? "." + a.className.trim().split(/\s+/)[0] : ""),
        txt: (a.textContent || a.value || "").trim().slice(0, 28),
        anneau: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0,
        cache: r.width === 0 || r.height === 0,
        y: Math.round(r.top + window.scrollY)
      };
    });
    if (!info) break;
    parcours.push(info);
    if (!info.anneau && !info.cache) sansAnneau.push(info.sel + " « " + info.txt + " »");
  }
  /* Piège : la MÊME cible qui revient en boucle courte. On identifie
     par le texte, pas par le sélecteur — douze liens d'index portent
     le même sélecteur générique `a` sans se répéter pour autant, et
     un détecteur qui les confond crie au piège sur une navigation
     parfaitement saine. */
  /* On identifie par l'ELEMENT, pas par sa description. La version
     precedente comparait `selecteur + texte`, et elle criait au
     piege sur les cinq cadres de projet : cinq elements DIFFERENTS
     qui portent tous `div.shot-vue` et un texte vide. Un detecteur
     qui confond cinq voisins avec un seul element qui boucle rend
     une alerte fausse, et une alerte fausse coute plus cher qu'une
     alerte absente : on cesse de lire l'instrument. */
  const cle = p => p.id;
  for (let i = 4; i < parcours.length; i++) {
    if (cle(parcours[i]) === cle(parcours[i - 2]) && cle(parcours[i]) === cle(parcours[i - 4])) {
      piege = parcours[i].sel + " « " + parcours[i].txt + " »"; break;
    }
  }
  R.clavier = {
    arrets: parcours.length,
    sansAnneau: sansAnneau.length,
    detail: sansAnneau.slice(0, 10),
    piege,
    premier: parcours[0] && parcours[0].sel,
    dernier: parcours[parcours.length - 1] && parcours[parcours.length - 1].sel
  };

  /* Piège de focus des modales : on entre, on tourne, on ressort. */
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click(".hero-cta .btn--primary");
  await page.waitForTimeout(500);
  const dedans = [];
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press("Tab");
    dedans.push(await page.evaluate(() => !!document.activeElement.closest("#modal-project")));
  }
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  R.clavier.modaleTientLeFocus = dedans.every(Boolean);
  R.clavier.retourAuDeclencheur = await page.evaluate(() =>
    document.activeElement.closest(".hero-cta") !== null);
  await ctx.close();
}

/* ---------- 3. ORIENTATION : 10 POSITIONS ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  /* Le popup parait tout seul a la 11e seconde, a CHAQUE
     chargement. Cet outil mesure autre chose : on le neutralise,
     sinon il mesure une surcouche par-dessus sa cible. */
  await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(1600);
  const h = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const pos = [];
  for (let i = 0; i < 10; i++) {
    const y = Math.round((h * i) / 9);
    await page.evaluate(yy => window.scrollTo(0, yy), y);
    await page.waitForTimeout(420);
    pos.push(await page.evaluate(() => {
      const a = document.querySelector('.rail-list a[aria-current="true"]');
      const n = document.getElementById("railLeftNum");
      const bar = getComputedStyle(document.getElementById("readBar")).width;
      return { section: a ? a.textContent.replace(/\s+/g, " ").trim() : null, reste: n ? n.textContent : null, barre: bar };
    }));
    await page.screenshot({ path: path.join(OUT, "orientation-" + i + ".png") });
  }
  R.orientation = { positions: pos, toutesRepondent: pos.every(p => p.section && p.reste !== null) };
  await ctx.close();
}

/* ---------- 4. MOBILE, SECTION PAR SECTION ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();

  /* Le popup parait tout seul a la 11e seconde, a CHAQUE
     chargement. Cet outil mesure autre chose : on le neutralise,
     sinon il mesure une surcouche par-dessus sa cible. */
  await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  const errs = [];
  page.on("pageerror", e => errs.push(String(e)));
  page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(2000);
  const secs = await page.evaluate(() =>
    [...document.querySelectorAll("main.shell > section, main.shell > footer")].map(s => ({
      id: s.id || "footer", h: Math.round(s.getBoundingClientRect().height)
    })));
  for (const s of secs) {
    await page.evaluate(id => {
      const el = id === "footer" ? document.querySelector("footer") : document.getElementById(id);
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 10);
    }, s.id);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT, "mobile-" + s.id + ".png") });
  }
  R.mobile = { sections: secs, erreurs: errs, hauteur: await page.evaluate(() => document.documentElement.scrollHeight) };
  await ctx.close();
}

/* ---------- 5. LA 404 ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  /* Le popup parait tout seul a la 11e seconde, a CHAQUE
     chargement. Cet outil mesure autre chose : on le neutralise,
     sinon il mesure une surcouche par-dessus sa cible. */
  await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  const errs = [];
  page.on("pageerror", e => errs.push(String(e)));
  page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await page.goto(BASE + "/page-qui-nexiste-pas", { waitUntil: "load" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, "404-1440.png") });
  R.p404 = {
    erreurs: errs,
    hauteur: await page.evaluate(() => document.documentElement.scrollHeight),
    debord: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  };
  await ctx.close();
}

/* ---------- 6. MOUVEMENT RÉDUIT ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();

  /* Le popup parait tout seul a la 11e seconde, a CHAQUE
     chargement. Cet outil mesure autre chose : on le neutralise,
     sinon il mesure une surcouche par-dessus sa cible. */
  await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  const errs = [];
  page.on("pageerror", e => errs.push(String(e)));
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(1800);
  R.mouvementReduit = await page.evaluate(() => {
    const invisibles = [...document.querySelectorAll("main.shell *")].filter(el => {
      const cs = getComputedStyle(el);
      return Number(cs.opacity) < 0.05 && el.getBoundingClientRect().width > 0;
    }).length;
    return {
      rideau: !!document.getElementById("entree"),
      classeReduite: document.documentElement.classList.contains("reduced-motion"),
      elementsInvisibles: invisibles,
      grains: document.getElementById("heroPlate").getAttribute("data-grains")
    };
  });
  R.mouvementReduit.erreurs = errs;
  await page.screenshot({ path: path.join(OUT, "mouvement-reduit-1440.png") });
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(OUT, "verif.json"), JSON.stringify(R, null, 2));
console.log(JSON.stringify(R, null, 2));
