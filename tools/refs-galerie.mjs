/* TROUVER LES SITES PRIMÉS D'UN MÉTIER.
   node tools/_galerie.mjs <url de galerie> [n=25]

   Ouvre une page de galerie (Awwwards, SiteInspire, Godly, FWA,
   Land-book…) dans un vrai navigateur — elles rendent toutes en
   JavaScript — défile pour charger la suite, et sort les liens
   SORTANTS : les vrais sites, pas les pages de la galerie. */
import { chromium } from "playwright";

const [url, nStr = "25"] = process.argv.slice(2);
if (!url) throw new Error("node tools/_galerie.mjs <url> [n]");
const N = Number(nStr);
if (!Number.isInteger(N) || N < 1 || N > 120) throw new Error(`nombre illisible : ${nStr}`);

const nav = await chromium.launch();
const p = await nav.newPage({
  viewport: { width: 1440, height: 1000 },
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
});
await p.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await p.waitForTimeout(2500);
for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 1600); await p.waitForTimeout(900); }

const hote = new URL(url).hostname.replace(/^www\./, "");
const liens = await p.evaluate((h) => {
  const out = new Map();
  for (const a of document.querySelectorAll("a[href^='http']")) {
    let u;
    try { u = new URL(a.href); } catch (e) { continue; }
    const dom = u.hostname.replace(/^www\./, "");
    if (dom === h || dom.endsWith("." + h)) continue;
    if (/facebook|twitter|x\.com|instagram|linkedin|youtube|pinterest|behance|dribbble|github|vimeo|tiktok|google|apple|adobe|figma|webflow\.com\/?$/.test(dom)) continue;
    const t = (a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60);
    if (!out.has(dom)) out.set(dom, { dom, url: u.origin, texte: t });
  }
  return [...out.values()];
}, hote);

await nav.close();
console.log(`${liens.length} domaine(s) sortants sur ${url}\n`);
for (const l of liens.slice(0, N)) console.log(`${l.url.padEnd(46)} ${l.texte}`);
