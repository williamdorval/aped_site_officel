/* ============================================================
   DIAGNOSTIC DE L'ACCUEIL, SECONDE PASSE.

   La premiere passe a rendu zero echantillon : l'enregistreur
   lisait `document.documentElement.className` au tout premier
   `document_start`, ou l'element n'est pas encore la, et l'appel
   levait avant la premiere `requestAnimationFrame`. Corrige ici :
   chaque tour est protege et le tour suivant est TOUJOURS
   programme, quoi qu'il arrive.

   CE QU'ON MESURE EN PLUS, et c'est le coeur du diagnostic :
   LE RIDEAU ET LA COMPOSITION SUR LA MEME LIGNE DE TEMPS.
   Les quinze bandes du rideau sont opaques (`--surface-0`) et
   couvrent tout l'ecran ; elles ne partent qu'a 700 ms et la
   derniere finit a 1 168 ms. Les cinq premiers pas de la
   composition sont programmes de 560 a 1 280 ms. Si les deux se
   recouvrent, la revelation du titre se joue DERRIERE un rideau
   ferme — ce qui n'est pas « une animation trop discrete », c'est
   une animation qu'on ne peut pas voir du tout.

   On capture aussi une sequence AU RALENTI (`Animation.
   setPlaybackRate` par le protocole DevTools) : c'est la seule
   facon honnete de photographier une animation de 300 ms, une
   capture d'ecran etant plus lente qu'elle.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { decodePNG, diffStats } from "./_png.mjs";

const BASE = process.env.BASE || "http://localhost:8099/";
const SORTIE = path.resolve("refonte-captures/diag");
fs.mkdirSync(SORTIE, { recursive: true });
const L = console.log;

const PAS = [
  ["sur-titre", ".hero-eyebrow", 0],
  ["titre L1", ".hero-claim .ligne:nth-of-type(1)", 80],
  ["titre L2", ".hero-claim .ligne:nth-of-type(2)", 360],
  ["sous-titre", ".hero-sub", 580],
  ["les 2 CTA", ".hero-cta", 740],
  ["fiche titre", ".hero-fiche > .label", 820],
  ["fiche r1", ".fiche-rows li:nth-child(1) a", 900],
  ["fiche r2", ".fiche-rows li:nth-child(2) a", 980],
  ["fiche r3", ".fiche-rows li:nth-child(3) a", 1060],
  ["fiche r4", ".fiche-rows li:nth-child(4) a", 1140],
  ["fiche pied", ".fiche-foot", 1240],
];
const RIDEAU = [
  ["bande centre", ".entree-bandes i:nth-child(8)"],
  ["bande bord", ".entree-bandes i:nth-child(1)"],
];

function tx(t) {
  if (!t || t === "none") return null;
  const m = t.match(/matrix\(([^)]+)\)/);
  if (m) { const p = m[1].split(",").map(Number); return { a: p[0], e: p[4] }; }
  const m3 = t.match(/matrix3d\(([^)]+)\)/);
  if (m3) { const p = m3[1].split(",").map(Number); return { a: p[0], e: p[12] }; }
  return null;
}

const nav = await chromium.launch();
const rapport = { date: new Date().toISOString() };

/* ========== A · LA LIGNE DE TEMPS COMPLETE ========== */
{
  const ctx = await nav.newContext({
    viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
    colorScheme: "light", reducedMotion: "no-preference",
  });
  await ctx.addInitScript(() => { try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  await ctx.addInitScript(([pas, rideau]) => {
    window.__d = { ech: [], err: null };
    const cibles = pas.map((p) => ({ n: p[0], s: p[1], pseudo: "::after" }))
      .concat(rideau.map((r) => ({ n: r[0], s: r[1], pseudo: null })));
    const cache = {};
    function tour() {
      try {
        const t = performance.now();
        const de = document.documentElement;
        const ligne = { t: +t.toFixed(1), cls: de ? de.className : "", v: {} };
        for (const c of cibles) {
          let el = cache[c.n];
          if (!el || !el.isConnected) { el = cache[c.n] = document.querySelector(c.s); }
          if (!el) { ligne.v[c.n] = null; continue; }
          const st = getComputedStyle(el, c.pseudo);
          ligne.v[c.n] = { tr: st.transform, bg: st.backgroundColor, ct: c.pseudo ? st.content : "-" };
        }
        window.__d.ech.push(ligne);
        if (t > 4000) return;
      } catch (e) { window.__d.err = String(e); }
      requestAnimationFrame(tour);
    }
    requestAnimationFrame(tour);
  }, [PAS, RIDEAU]);

  const page = await ctx.newPage();
  await page.goto(BASE + "#top", { waitUntil: "load" });
  await page.waitForTimeout(4300);
  const d = await page.evaluate(() => window.__d);
  L("echantillons :", d.ech.length, "| erreur :", d.err);

  const serie = (nom) => d.ech.map((l) => ({ t: l.t, m: l.v[nom] ? tx(l.v[nom].tr) : null, ct: l.v[nom] ? l.v[nom].ct : null }))
    .filter((s) => s.m);

  /* Le rideau : la bande est PARTIE quand |translateX| depasse 99 %
     de la largeur ; on rend le premier instant ou elle bouge et le
     premier ou elle est sortie. */
  const etatRideau = {};
  for (const [nom] of RIDEAU) {
    const s = serie(nom);
    if (!s.length) { etatRideau[nom] = "absente"; continue; }
    const bouge = s.find((x) => Math.abs(x.m.e) > 2);
    const sortie = s.find((x) => Math.abs(x.m.e) > 1400);
    etatRideau[nom] = { premierMouvementMs: bouge ? bouge.t : null, sortieMs: sortie ? sortie.t : null, derniereVueMs: s[s.length - 1].t };
  }
  /* L'instant ou le rideau n'existe plus du tout. */
  const dernierRideau = d.ech.filter((l) => l.v["bande centre"]).slice(-1)[0];
  const rideauDisparuMs = dernierRideau ? dernierRideau.t : null;

  const pas = {};
  for (const [nom, sel, e] of PAS) {
    const s = serie(nom);
    if (!s.length) { pas[nom] = { etat: "AUCUNE PLAQUE" }; continue; }
    const xs = s.map((x) => x.m.a);
    const min = Math.min(...xs), max = Math.max(...xs);
    const debut = s.find((x) => x.m.a < 0.99);
    const fin = s.find((x) => x.m.a < 0.01);
    /* Fraction de l'animation qui se joue APRES la disparition du
       rideau : c'est la seule partie que le visiteur peut voir. */
    let vu = null;
    if (debut && fin && rideauDisparuMs !== null) {
      const total = fin.t - debut.t;
      const visible = Math.max(0, fin.t - Math.max(debut.t, rideauDisparuMs));
      vu = total > 0 ? +(visible / total * 100).toFixed(0) : null;
    }
    pas[nom] = {
      etat: max - min > 0.02 ? "JOUE" : "IMMOBILE",
      declare: e, scaleX: max.toFixed(2) + " -> " + min.toFixed(2),
      debutMs: debut ? +debut.t.toFixed(0) : null,
      finMs: fin ? +fin.t.toFixed(0) : null,
      pourcentVisiblePar1Visiteur: vu,
    };
  }
  rapport.rideau = { ...etatRideau, rideauDisparuMs };
  rapport.pas = pas;

  L("\n--- LE RIDEAU ---");
  L(JSON.stringify(rapport.rideau, null, 2));
  L("\n--- LES ONZE PAS ---");
  L("pas".padEnd(13), "etat".padEnd(9), "--e".padEnd(6), "scaleX".padEnd(15), "debut".padEnd(7), "fin".padEnd(7), "% VU");
  for (const [nom, v] of Object.entries(pas)) {
    L(nom.padEnd(13), String(v.etat).padEnd(9), String(v.declare ?? "-").padEnd(6),
      String(v.scaleX ?? "-").padEnd(15), String(v.debutMs ?? "-").padEnd(7),
      String(v.finMs ?? "-").padEnd(7), v.pourcentVisiblePar1Visiteur === null || v.pourcentVisiblePar1Visiteur === undefined ? "-" : v.pourcentVisiblePar1Visiteur + " %");
  }
  await ctx.close();
}

/* ========== B · LA SEQUENCE AU RALENTI, EN IMAGES ========== */
{
  const ctx = await nav.newContext({
    viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
    colorScheme: "light", reducedMotion: "no-preference",
  });
  await ctx.addInitScript(() => { try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Animation.enable");
  await cdp.send("Animation.setPlaybackRate", { playbackRate: 0.1 });

  const dossier = path.join(SORTIE, "ralenti-x10");
  fs.rmSync(dossier, { recursive: true, force: true });
  fs.mkdirSync(dossier, { recursive: true });

  const t0 = Date.now();
  await page.goto(BASE + "#top", { waitUntil: "commit" });
  const clip = { x: 0, y: 40, width: 1440, height: 760 };
  const suite = [];
  for (let i = 0; i < 40; i++) {
    let buf;
    try { buf = await page.screenshot({ clip }); } catch (e) { await page.waitForTimeout(120); continue; }
    const treel = Date.now() - t0;
    const tanim = Math.round(treel * 0.1);
    fs.writeFileSync(path.join(dossier, String(i).padStart(2, "0") + "-anim" + tanim + "ms.png"), buf);
    suite.push({ i, tanim, buf });
    if (tanim > 2600) break;
    await page.waitForTimeout(180);
  }
  const dif = [];
  for (let i = 1; i < suite.length; i++) {
    dif.push({ a: suite[i].tanim, ...diffStats(decodePNG(suite[i - 1].buf), decodePNG(suite[i].buf)) });
    delete suite[i - 1].buf;
  }
  rapport.ralenti = { dossier, images: suite.length, ecarts: dif };
  L("\n--- SEQUENCE AU RALENTI x10 ---", dossier);
  L(dif.map((d) => "t" + d.a + "ms:" + d.pct + "%").join("  "));
  await ctx.close();
}

/* ========== C · LES BOUTONS SOUS LES QUATRE PALIERS ========== */
{
  const cas = [
    { nom: "palier 0 (bureau)", vw: 1440, reduced: "no-preference" },
    { nom: "palier 1 (etroit)", vw: 900, reduced: "no-preference" },
    { nom: "palier 3 (mvt reduit)", vw: 1440, reduced: "reduce" },
  ];
  rapport.paliers = {};
  for (const c of cas) {
    const ctx = await nav.newContext({
      viewport: { width: c.vw, height: 900 }, deviceScaleFactor: 1,
      colorScheme: "light", reducedMotion: c.reduced,
    });
    await ctx.addInitScript(() => { try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
    const page = await ctx.newPage();
    await page.goto(BASE + "#top", { waitUntil: "load" });
    await page.mouse.move(20, 20);
    await page.waitForTimeout(3000);
    const info = await page.evaluate(() => {
      const r = {};
      r.palier = document.documentElement.getAttribute("data-palier");
      r.cls = document.documentElement.className;
      for (const [n, s] of [["primaire", ".hero-cta .btn--primary"], ["secondaire", ".hero-cta .btn--ghost"]]) {
        const b = document.querySelector(s);
        if (!b) { r[n] = "absent"; continue; }
        const av = getComputedStyle(b, "::before");
        r[n] = {
          dataLettres: b.hasAttribute("data-lettres"),
          lettres: b.querySelectorAll(".l").length,
          cran: getComputedStyle(b).getPropertyValue("--cran").trim(),
          avantContenu: av.content, avantTr: av.transform, avantBg: av.backgroundColor,
        };
      }
      r.compoHero = document.documentElement.className.includes("compo-hero");
      return r;
    });
    /* Le balayage se voit-il ? */
    for (const [n, s] of [["primaire", ".hero-cta .btn--primary"], ["secondaire", ".hero-cta .btn--ghost"]]) {
      const el = page.locator(s);
      if (!(await el.count())) continue;
      const bo = await el.boundingBox();
      if (!bo) continue;
      await page.evaluate((sel) => {
        window.__h = [];
        const n2 = document.querySelector(sel);
        const t0 = performance.now();
        (function tour() {
          const t = performance.now() - t0;
          const sb = getComputedStyle(n2, "::before");
          const l = n2.querySelector(".l");
          window.__h.push({ t: +t.toFixed(0), tr: sb.transform, coul: l ? getComputedStyle(l).color : getComputedStyle(n2).color, fond: getComputedStyle(n2).backgroundColor });
          if (t < 900) requestAnimationFrame(tour);
        })();
      }, s);
      await page.mouse.move(bo.x + bo.width / 2, bo.y + bo.height / 2);
      await page.waitForTimeout(1000);
      const h = await page.evaluate(() => window.__h);
      const xs = h.map((e) => tx(e.tr)).filter(Boolean).map((m) => m.a);
      const coul = [...new Set(h.map((e) => e.coul))];
      const fond = [...new Set(h.map((e) => e.fond))];
      info[n] = {
        ...info[n],
        balayage: xs.length ? Math.min(...xs).toFixed(2) + " -> " + Math.max(...xs).toFixed(2) : "aucun ::before",
        imagesIntermediaires: xs.filter((v) => v > 0.02 && v < 0.98).length,
        couleursLettre: coul, fondsBouton: fond,
      };
      await page.mouse.move(20, 20);
      await page.waitForTimeout(900);
    }
    rapport.paliers[c.nom] = info;
    await ctx.close();
  }
  L("\n--- LES BOUTONS PAR PALIER ---");
  for (const [nom, v] of Object.entries(rapport.paliers)) {
    L("\n[" + nom + "] data-palier=" + v.palier + " | compo-hero=" + v.compoHero + " | " + v.cls);
    for (const b of ["primaire", "secondaire"]) {
      if (typeof v[b] === "string") { L("   ", b, v[b]); continue; }
      L("   ", b.padEnd(11), "lettres=" + String(v[b].lettres).padEnd(3),
        "cran=" + String(v[b].cran).padEnd(7), "::before=" + String(v[b].avantContenu).padEnd(6),
        "balayage=" + String(v[b].balayage).padEnd(16), "imgInterm=" + v[b].imagesIntermediaires);
      L("      couleurs de lettre :", JSON.stringify(v[b].couleursLettre));
    }
  }
}

await nav.close();
fs.writeFileSync(path.join(SORTIE, "diag2.json"), JSON.stringify(rapport, null, 2));
L("\nJSON :", path.join(SORTIE, "diag2.json"));
