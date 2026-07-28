/* Le moment de preuve des secteurs : la recomposition se produit-elle
   VRAIMENT, et se termine-t-elle nette ? On echantillonne les
   transforms des blocs image par image, dans la page — une capture
   d'ecran est trop lente pour photographier 440 ms. */
import { chromium } from "playwright";
const B = process.argv[2] || "http://localhost:8099";
const nav = await chromium.launch();
const page = await (await nav.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree","1"); } catch(e){} });
await page.goto(B + "/", { waitUntil: "load" });
await page.mouse.move(700, 400);
await page.waitForTimeout(1700);
await page.evaluate(() => document.querySelector("#demos").scrollIntoView());
await page.waitForTimeout(900);

const r = await page.evaluate(() => new Promise((res) => {
  const scene = document.querySelector("#mockStage");
  const images = [];
  const lire = () => {
    const m = scene.querySelector(".mock.is-on");
    const page_ = m && m.querySelector(".sec-page");
    if (!page_) return null;
    const bl = [...page_.children].slice(0, 10);
    let ecartMax = 0, opMin = 1;
    bl.forEach((b) => {
      const st = getComputedStyle(b);
      const mm = new DOMMatrixReadOnly(st.transform);
      ecartMax = Math.max(ecartMax, Math.abs(mm.e), Math.abs(mm.f));
      opMin = Math.min(opMin, parseFloat(st.opacity));
    });
    return { ecartMax: +ecartMax.toFixed(1), opMin: +opMin.toFixed(2), n: bl.length };
  };
  document.querySelectorAll('.sector-pills button')[6].dispatchEvent(new Event("mouseenter"));
  const t0 = performance.now();
  const tic = () => {
    const v = lire();
    if (v) images.push({ t: Math.round(performance.now() - t0), ...v });
    if (performance.now() - t0 < 900) requestAnimationFrame(tic);
    else res(images);
  };
  requestAnimationFrame(tic);
}));

const pic = r.reduce((a, x) => (x.ecartMax > a.ecartMax ? x : a), r[0]);
const fin = r[r.length - 1];
let ko = 0;
const dire = (ok, t) => { console.log((ok ? "  OK   " : "  ECHEC") + "  " + t); if (!ok) ko++; };
dire(r.length > 20, `${r.length} images echantillonnees sur 900 ms`);
dire(pic.ecartMax > 8, `dispersion maximale : ${pic.ecartMax} px a ${pic.t} ms sur ${pic.n} blocs`);
dire(pic.opMin < 0.5, `opacite minimale pendant la reprise : ${pic.opMin}`);
dire(fin.ecartMax === 0, `etat final NET au pixel : ecart ${fin.ecartMax} px a ${fin.t} ms`);
dire(fin.opMin === 1, `etat final a pleine encre : opacite ${fin.opMin}`);
await nav.close();
console.log(`\n${ko === 0 ? "LA RECOMPOSITION SE PRODUIT ET SE TERMINE NETTE" : ko + " ECHEC(S)"}\n`);
process.exit(ko ? 1 : 0);
