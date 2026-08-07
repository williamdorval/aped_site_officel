/* Audit visuel + mesures. `node tools/audit.mjs <dossier-de-sortie>`
   Sort des PNG et un rapport JSON. Aucune supposition : tout est mesuré. */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.APED_BASE || "http://localhost:8099";

/* IL EST LE SEUL OUTIL DONT LE PREMIER ARGUMENT N'EST PAS UN PORT.  D-779

   Tous les autres passent par `_adresse.mjs` et lisent `argv[2]` comme
   un numero de port. Ici c'est un dossier de SORTIE — et le 2026-07-26,
   `node tools/audit.mjs 8099` a donc cree `8099/` a la racine du depot,
   12 Mo de captures, sans que rien ne le signale. Un chiffre nu n'est
   jamais un nom de dossier voulu : on ARRETE. */
if (/^\d{2,5}$/.test(process.argv[2] || "")) {
  console.error("ARRET  « " + process.argv[2] + " » ressemble a un port, pas a un dossier.\n"
    + "       Cet outil-ci prend un DOSSIER DE SORTIE en premier argument.\n"
    + "       L'adresse se change par APED_BASE=http://127.0.0.1:" + process.argv[2] + " .");
  process.exit(2);
}
const OUT = path.resolve(process.argv[2] || "refonte-captures/audit2");
fs.mkdirSync(OUT, { recursive: true });

const rapport = { base: BASE, quand: new Date().toISOString(), vues: {} };

/* ---------- contraste WCAG ---------- */
const CONTRAST_FN = `
(() => {
  const lin = c => { c /= 255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); };
  const L = ([r,g,b]) => 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b);
  const parse = s => {
    const m = String(s).match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(/[,\\s/]+/).filter(Boolean).map(Number);
    return { rgb: [p[0],p[1],p[2]], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (fg, bg) => fg.a >= 1 ? fg.rgb : fg.rgb.map((c,i)=> c*fg.a + bg[i]*(1-fg.a));
  const bgOf = el => {
    let n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0.92) return c.rgb;
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null; // photo/dégradé : non calculable
      n = n.parentElement;
    }
    const c = parse(getComputedStyle(document.documentElement).backgroundColor);
    return c ? c.rgb : [255,255,255];
  };
  const ratio = (a,b) => { const l1 = L(a), l2 = L(b); const hi = Math.max(l1,l2), lo = Math.min(l1,l2); return (hi+0.05)/(lo+0.05); };
  const out = [];
  const nodes = document.querySelectorAll('body *');
  for (const el of nodes) {
    if (!el.childNodes.length) continue;
    let txt = '';
    for (const n of el.childNodes) if (n.nodeType === 3) txt += n.textContent.trim();
    if (!txt) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.1) continue;
    if (el.closest('[hidden]')) continue;
    const bg = bgOf(el);
    if (!bg) { out.push({ sel: sel(el), txt: txt.slice(0,40), ratio: null, note: 'fond image ou dégradé' }); continue; }
    const fg = parse(cs.color);
    if (!fg) continue;
    const size = parseFloat(cs.fontSize);
    const weight = Number(cs.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const rr = ratio(over(fg,bg), bg);
    out.push({ sel: sel(el), txt: txt.slice(0,40), ratio: Math.round(rr*100)/100, large, seuil: large ? 3 : 4.5, ok: rr >= (large?3:4.5), size, weight });
  }
  function sel(el){
    let s = el.tagName.toLowerCase();
    if (el.id) return s + '#' + el.id;
    if (el.className && typeof el.className === 'string') s += '.' + el.className.trim().split(/\\s+/).slice(0,2).join('.');
    return s;
  }
  return out;
})()`;

/* ---------- texte coupé / débordement ---------- */
const CLIP_FN = `
(() => {
  const bad = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (el.closest('[hidden]')) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!hasText) continue;
    const ovY = cs.overflowY, ovX = cs.overflowX;
    if ((ovY === 'hidden' || ovX === 'hidden' || ovY === 'clip') &&
        (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2)) {
      bad.push({ sel: el.tagName.toLowerCase() + (el.id ? '#'+el.id : '.'+String(el.className).trim().split(/\\s+/)[0]),
                 txt: el.textContent.trim().slice(0,50),
                 sh: el.scrollHeight, ch: el.clientHeight, sw: el.scrollWidth, cw: el.clientWidth });
    }
  }
  return bad;
})()`;

async function vue(browser, nom, opts) {
  const ctx = await browser.newContext({
    viewport: opts.viewport,
    deviceScaleFactor: 1,
    colorScheme: opts.theme === "dark" ? "dark" : "light",
    reducedMotion: "no-preference"
  });
  const page = await ctx.newPage();

  /* Le popup parait tout seul a la 11e seconde, a CHAQUE
     chargement. Cet outil mesure autre chose : on le neutralise,
     sinon il mesure une surcouche par-dessus sa cible. */
  await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  const erreurs = [];
  page.on("console", m => { if (m.type() === "error") erreurs.push(m.text()); });
  page.on("pageerror", e => erreurs.push(String(e)));

  await page.addInitScript(t => {
    try { localStorage.setItem("aped-theme", t); } catch (e) {}
  }, opts.theme);

  await page.goto(BASE + (opts.path || "/"), { waitUntil: "load" });
  await page.waitForTimeout(1800);

  const info = await page.evaluate(() => {
    const secs = [...document.querySelectorAll("main.shell > section, main.shell > footer, main.shell > div")].map(s => ({
      id: s.id || s.className.split(" ")[0],
      top: Math.round(s.getBoundingClientRect().top + window.scrollY),
      h: Math.round(s.getBoundingClientRect().height)
    }));
    return {
      hauteur: document.documentElement.scrollHeight,
      largeurScroll: document.documentElement.scrollWidth,
      largeurVue: window.innerWidth,
      grains: document.getElementById("heroPlate")?.getAttribute("data-grains") || null,
      sections: secs
    };
  });

  const contrastes = await page.evaluate(CONTRAST_FN);
  const clips = await page.evaluate(CLIP_FN);

  const dossier = path.join(OUT, nom);
  fs.mkdirSync(dossier, { recursive: true });

  // captures par position de scroll
  const vh = opts.viewport.height;
  const nbPos = Math.min(opts.max || 24, Math.ceil(info.hauteur / vh));
  const positions = [];
  for (let i = 0; i < nbPos; i++) {
    const y = Math.round((info.hauteur - vh) * (i / Math.max(1, nbPos - 1)));
    await page.evaluate(yy => window.scrollTo(0, yy), y);
    await page.waitForTimeout(420);
    const p = path.join(dossier, String(i).padStart(2, "0") + ".png");
    await page.screenshot({ path: p });
    const rail = await page.evaluate(() => {
      const a = document.querySelector('.rail-list a[aria-current="true"]');
      return { actif: a ? a.textContent.trim() : null, reste: document.getElementById("railLeftNum")?.textContent || null };
    });
    positions.push({ i, y, rail });
  }

  rapport.vues[nom] = {
    ...info,
    erreurs,
    positions,
    contrastesEchecs: contrastes.filter(c => c.ok === false),
    contrastesNonCalculables: contrastes.filter(c => c.ratio === null),
    contrastesTotal: contrastes.length,
    texteCoupe: clips
  };

  await ctx.close();
  return rapport.vues[nom];
}

const browser = await chromium.launch();

await vue(browser, "desktop-1440-clair", { viewport: { width: 1440, height: 900 }, theme: "light", max: 26 });
await vue(browser, "desktop-1920-clair", { viewport: { width: 1920, height: 1080 }, theme: "light", max: 14 });
await vue(browser, "desktop-1440-sombre", { viewport: { width: 1440, height: 900 }, theme: "dark", max: 14 });
await vue(browser, "mobile-390-clair", { viewport: { width: 390, height: 844 }, theme: "light", max: 20 });
await vue(browser, "mobile-390-sombre", { viewport: { width: 390, height: 844 }, theme: "dark", max: 10 });

await browser.close();
fs.writeFileSync(path.join(OUT, "rapport.json"), JSON.stringify(rapport, null, 2));

for (const [k, v] of Object.entries(rapport.vues)) {
  console.log(`\n== ${k}`);
  console.log(`   hauteur ${v.hauteur} px · scrollW ${v.largeurScroll}/${v.largeurVue} · grains ${v.grains}`);
  console.log(`   erreurs console : ${v.erreurs.length}`);
  console.log(`   contrastes : ${v.contrastesTotal} mesurés, ${v.contrastesEchecs.length} sous AA, ${v.contrastesNonCalculables.length} non calculables`);
  v.contrastesEchecs.slice(0, 20).forEach(c => console.log(`      ✗ ${c.ratio}:1 (seuil ${c.seuil}) ${c.sel} « ${c.txt} »`));
  console.log(`   texte coupé : ${v.texteCoupe.length}`);
  v.texteCoupe.slice(0, 10).forEach(c => console.log(`      ✂ ${c.sel} ${c.sw}x${c.sh} dans ${c.cw}x${c.ch} « ${c.txt} »`));
}
console.log("\nsections (1440) :");
rapport.vues["desktop-1440-clair"].sections.forEach(s => console.log(`   ${String(s.top).padStart(6)}  h=${String(s.h).padStart(6)}  ${s.id}`));
