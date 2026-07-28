/* LA TRAVERSEE COMPLETE.
   `node tools/_traversee.mjs [tag] [--sombre] [--reduit]`

   Deux choses a la fois :
   · une PLANCHE : 24 vues regulierement espacees, du haut au pied,
     pour juger si la traversee se lit comme un seul mouvement ;
   · les IMAGES PAR SECONDE pendant ce meme defilement, mesurees
     dans la page, sur les intervalles reels de `requestAnimationFrame`.

   REGLE DE MESURE DU PROJET : on ne conclut jamais sur un maximum.
   On rend la mediane, le 5e centile — l'image la plus lente qui
   compte — et le nombre d'images au-dessus de 20 ms. Un maximum est
   la statistique la plus instable qui soit.
*/
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const TAG = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "apres";
const SOMBRE = process.argv.includes("--sombre");
const REDUIT = process.argv.includes("--reduit");
const SORTIE = path.join(RACINE, "refonte-captures", "traversee-" + TAG + (SOMBRE ? "-sombre" : "") + (REDUIT ? "-reduit" : ""));
fs.mkdirSync(SORTIE, { recursive: true });

const nav = await chromium.launch();
const ctx = await nav.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: REDUIT ? "reduce" : "no-preference"
});
const page = await ctx.newPage();
const erreurs = [];
page.on("pageerror", (e) => erreurs.push("pageerror: " + String(e)));
page.on("console", (m) => { if (m.type() === "error") erreurs.push("console: " + m.text()); });

await page.addInitScript((sombre) => {
  try { sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {}
  if (sombre) { try { localStorage.setItem("aped-theme", "dark"); } catch (e) {} }
}, SOMBRE);

await page.goto("http://127.0.0.1:8099/", { waitUntil: "load" });
await page.mouse.click(6, 6);
await page.waitForTimeout(700);

/* Premiere traversee : mise en page. Les hauteurs sont fausses tant
   qu'elle n'a pas eu lieu, et une mesure d'images par seconde sur
   une page qui se met en page pour la premiere fois mesure la mise
   en page, pas la choregraphie. */
await page.evaluate(async () => {
  const pas = 320;
  for (let y = 0; y < document.documentElement.scrollHeight; y += pas) {
    window.scrollTo(0, y); await new Promise((r) => requestAnimationFrame(r));
  }
  window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 800));
});

/* Seconde traversee : celle qu'on mesure. */
const ips = await page.evaluate(async () => {
  const ecarts = [];
  let last = 0;
  let fini = false;
  function image(t) {
    if (fini) return;
    if (last) { const dt = t - last; if (dt > 2 && dt < 400) ecarts.push(dt); }
    last = t;
    requestAnimationFrame(image);
  }
  requestAnimationFrame(image);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pas = 26; /* ~1560 px/s : un defilement continu franc */
  for (let y = 0; y <= max; y += pas) {
    window.scrollTo(0, y);
    await new Promise((r) => requestAnimationFrame(r));
  }
  fini = true;
  const tri = ecarts.slice().sort((a, b) => a - b);
  const q = (p) => tri[Math.min(tri.length - 1, Math.floor(tri.length * p))];
  return {
    images: ecarts.length,
    medianeMs: Math.round(q(0.5) * 100) / 100,
    ipsMedian: Math.round(1000 / q(0.5)),
    p95Ms: Math.round(q(0.95) * 100) / 100,
    ipsAu5eCentileBas: Math.round(1000 / q(0.95)),
    imagesAu_dessus_de_20ms: ecarts.filter((d) => d > 20).length,
    partAu_dessus_de_20ms: Math.round((ecarts.filter((d) => d > 20).length / ecarts.length) * 1000) / 10,
    palier: document.documentElement.getAttribute("data-palier")
  };
});

/* LA PLANCHE. */
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
const N = 24;
for (let i = 0; i < N; i++) {
  const y = Math.round((max * i) / (N - 1));
  await page.evaluate(async (c) => {
    const pas = 260;
    let g = 0;
    while (Math.abs(window.scrollY - c) > pas && g++ < 400) {
      window.scrollBy(0, window.scrollY < c ? pas : -pas);
      await new Promise((r) => requestAnimationFrame(r));
    }
    window.scrollTo(0, c);
  }, y);
  await page.waitForTimeout(650);
  await page.screenshot({ path: path.join(SORTIE, "v" + String(i).padStart(2, "0") + "-y" + y + ".png") });
}

const R = { theme: SOMBRE ? "sombre" : "clair", mouvement: REDUIT ? "reduit" : "plein", ips, erreurs, planche: N };
console.log(JSON.stringify(R, null, 1));
fs.writeFileSync(path.join(SORTIE, "rapport.json"), JSON.stringify(R, null, 2));
await nav.close();
