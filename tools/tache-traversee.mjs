/* ============================================================
   LA TACHE LONGUE PENDANT LA TRAVERSEE — A/B focalise.

   POURQUOI UN OUTIL SEPARE. `ab-phase8.mjs` rend la PIRE tache,
   c'est-a-dire un maximum. Un maximum sur une machine partagee est
   la statistique la plus instable qui soit : une seule interruption
   du systeme le fait tripler, et il ne bouge pas si dix taches
   moyennes apparaissent. Les relevés le montrent — la meme version
   d'avant, code inchange, a rendu 0 ms puis 226 ms selon l'heure.

   On mesure donc le TOTAL de temps passe en taches longues pendant
   la traversee, et leur NOMBRE. Ces deux-la s'additionnent au lieu
   de se remplacer, donc ils sont stables, et ils repondent
   directement a la question posee : la page passe-t-elle plus de
   temps bloquee qu'avant ?

   ET ON COMPARE PAR DIFFERENCES APPARIEES, pas par medianes
   separees. Releve du 2026-07-26 sur neuf passes, version d'avant,
   CODE INCHANGE : 167, 0, 0, 0, 108, 942, 962, 981, 658 ms. La
   machine derive d'un facteur six entre la premiere passe et la
   derniere. Une mediane calculee sur une serie qui derive ne
   compare pas deux versions, elle compare le debut de la serie a
   sa fin.

   Les deux versions sont donc mesurees DANS LA MEME PASSE, l'ordre
   alterne, et on prend la mediane des DIFFERENCES. La derive
   s'annule parce qu'elle frappe les deux termes de chaque
   difference.

   Un troisieme sujet optionnel — `--palier1` — force le palier 1
   sur la version d'apres, ce qui permet d'isoler la contribution
   exacte des animations que ce palier retire.
   ============================================================ */
import { chromium } from "playwright";

const PASSES = Number(process.argv[2] || 9);
const AVEC_PALIER1 = process.argv.includes("--palier1");
const VERSIONS = [
  ["avant", "http://localhost:8097", false],
  ["apres", "http://localhost:8099", false]
];
if (AVEC_PALIER1) VERSIONS.push(["apres-p1", "http://localhost:8099", true]);

const nav = await chromium.launch();
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const moy = (a) => Math.round(a.reduce((x, y) => x + y, 0) / a.length);

const res = {};
for (const [n] of VERSIONS) res[n] = { total: [], nb: [], max: [], fps: [] };

for (let p = 0; p < PASSES; p++) {
  const ordre = p % 2 ? [...VERSIONS].reverse() : VERSIONS;
  for (const [nom, base, forcerP1] of ordre) {
    const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    if (forcerP1) {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 4 });
      });
    }
    await page.addInitScript(() => {
      try { sessionStorage.setItem("adexweb-entree-saut", "1"); sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {}
      window.__t = { longues: [], f: 0 };
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) window.__t.longues.push(Math.round(e.duration));
      }).observe({ type: "longtask", buffered: true });
      const tic = () => { window.__t.f++; requestAnimationFrame(tic); };
      requestAnimationFrame(tic);
    });
    await page.goto(base + "/", { waitUntil: "load" });
    await page.mouse.move(700, 400);
    /* On laisse la vague 2 s'installer ET la file des temps morts se
       vider : ce qu'on mesure est le DEFILEMENT, pas le demarrage. */
    await page.waitForTimeout(3000);

    await page.evaluate(() => { window.__t.longues.length = 0; window.__t.f = 0; });
    const t0 = Date.now();
    const h = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const pas = Math.max(1, Math.round(h / 60));
    for (let y = 0; y <= h; y += pas) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(28);
    }
    const duree = Date.now() - t0;
    const r = await page.evaluate(() => window.__t);

    res[nom].total.push(r.longues.reduce((a, b) => a + b, 0));
    res[nom].nb.push(r.longues.length);
    res[nom].max.push(Math.max(0, ...r.longues));
    res[nom].fps.push(Math.round((r.f / duree) * 1000));
    await ctx.close();
  }
}
await nav.close();

const col = (v) => String(v).padEnd(12);
console.log(`\n${PASSES} passes alternees, traversee complete a cadence identique\n`);
console.log("                          " + VERSIONS.map(([n]) => col(n)).join(""));
for (const [label, cle, f] of [
  ["total en tache longue", "total", med],
  ["  (moyenne)", "total", moy],
  ["nombre de taches longues", "nb", med],
  ["pire tache (instable)", "max", med],
  ["images/s", "fps", med]
]) {
  console.log(label.padEnd(26) + VERSIONS.map(([n]) => col(f(res[n][cle]) + (cle === "fps" ? "" : cle === "nb" ? "" : " ms"))).join(""));
}

console.log("");
for (const [n] of VERSIONS) console.log(`${n.padEnd(9)} totaux : ${res[n].total.join(", ")} ms`);

/* LES DIFFERENCES APPARIEES. C'est la seule lecture honnete d'une
   serie qui derive : chaque difference est prise entre deux mesures
   voisines dans le temps. */
console.log("");
const deltas = res.apres.total.map((v, i) => v - res.avant.total[i]);
console.log(`differences apres - avant : ${deltas.join(", ")} ms`);
const d = med(deltas);
const positifs = deltas.filter((x) => x > 0).length;
console.log(`mediane des differences   : ${d > 0 ? "+" : ""}${d} ms   (${positifs} passes sur ${deltas.length} au-dessus)`);

if (AVEC_PALIER1) {
  const d1 = med(res["apres-p1"].total.map((v, i) => v - res.avant.total[i]));
  console.log(`mediane apres-p1 - avant  : ${d1 > 0 ? "+" : ""}${d1} ms   (contribution du palier 1 : ${d - d1} ms)`);
}

console.log("");
console.log(d <= 0
  ? `VERDICT : mediane des differences ${d} ms — la traversee n'est pas plus couteuse qu'avant.`
  : `VERDICT : mediane des differences +${d} ms — RECUL.`);
console.log("");
process.exit(d <= 0 ? 0 : 1);
