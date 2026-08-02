/* ============================================================
   L'ÉCHELLE DU PANNEAU — la même pour les treize, à toute largeur
   `node tools/panneau-echelle.mjs [port=8099]`

   Le défaut que cet outil garde : « dans le panneau, les sites
   paraissent énormes, comme si on regardait à la loupe ». La cause
   n'était pas l'affichage mais la prise de vue — 760 px de large,
   la mise en page d'une tablette (D-683). Ce qui se vérifie ici :

   · la scène porte EXACTEMENT le rapport 1440/900, à toute largeur ;
   · l'image la remplit sans rognage ni bande ;
   · les treize aperçus rendent la MÊME échelle — un seul qui diffère
     et le panneau se lit comme un montage ;
   · aucune image manquante, aucune erreur console, aucun débordement.
   ============================================================ */
import { chromium } from "playwright";

const PORT = Number(process.argv[2] || 8099);
if (!Number.isInteger(PORT)) throw new Error(`port illisible : ${process.argv[2]}`);

const LARGEURS = [1920, 1600, 1440, 1280, 1024, 768, 390];
const nav = await chromium.launch();
let echecs = 0;

for (const L of LARGEURS) {
  const p = await nav.newPage({ viewport: { width: L, height: 900 } });
  const err = [];
  p.on("console", (m) => { if (m.type() === "error") err.push(m.text()); });
  p.on("pageerror", (e) => err.push("pageerror: " + e.message));
  await p.addInitScript(() => { try { sessionStorage["aped-sans-popup"] = "1"; } catch {} });
  await p.goto(`http://localhost:${PORT}/index.html`, { waitUntil: "load" });
  await p.waitForTimeout(1200);
  /* On défile PAR PAS : un `scrollTo` qui saute tue une scène
     épinglée, et la page en porte plusieurs. Piège 5. */
  const cible = await p.evaluate(() => document.querySelector("#demos").getBoundingClientRect().top + scrollY - 120);
  for (let y = 0; y < cible; y += 700) { await p.mouse.wheel(0, 700); await p.waitForTimeout(70); }
  await p.waitForTimeout(1500);

  const cles = await p.evaluate(() => [...document.querySelectorAll(".sector-pills button")].map((b) => b.dataset.sector));
  const lignes = [];
  for (const c of cles) {
    await p.evaluate((s) => document.querySelector(`[data-sector="${s}"]`)?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true })), c);
    await p.waitForTimeout(150);
    /* Une image DÉCLARÉE n'est pas une image CHARGÉE, et l'attente
       porte sa propre limite. Pièges 52 et 39. */
    const m = await p.evaluate(async () => {
      const img = document.querySelector(".mock.is-on img");
      if (img && !(img.complete && img.naturalWidth > 0)) {
        await Promise.race([
          new Promise((r) => { img.addEventListener("load", r, { once: true }); img.addEventListener("error", r, { once: true }); }),
          new Promise((r) => setTimeout(r, 4000)),
        ]);
      }
      const st = document.querySelector("#mockStage").getBoundingClientRect();
      const mock = document.querySelector(".mock.is-on");
      return {
        stage: [+st.width.toFixed(1), +st.height.toFixed(1)],
        rapport: +(st.width / st.height).toFixed(4),
        img: img ? { w: +img.getBoundingClientRect().width.toFixed(1), charge: img.complete && img.naturalWidth > 0, nat: img.naturalWidth } : null,
        hote: document.querySelector("#sectorChrome span")?.textContent || "",
        dessin: !img && !!mock,
      };
    });
    lignes.push({ c, ...m });
  }
  const deb = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const st = lignes[0].stage;
  const rapports = [...new Set(lignes.map((l) => l.rapport))];
  const echelles = [...new Set(lignes.filter((l) => l.img).map((l) => +(l.img.w / 1440).toFixed(4)))];
  const pasCharge = lignes.filter((l) => l.img && !l.img.charge).map((l) => l.c);
  const petites = lignes.filter((l) => l.img && l.img.nat < 1440).map((l) => `${l.c}:${l.img.nat}`);

  const mal = [];
  if (rapports.length !== 1 || Math.abs(rapports[0] - 1.6) > 0.01) mal.push(`rapport de scène ${rapports.join("/")} ≠ 1,6`);
  if (echelles.length !== 1) mal.push(`échelles différentes : ${echelles.join(" ")}`);
  if (pasCharge.length) mal.push(`images jamais chargées : ${pasCharge.join(" ")}`);
  if (petites.length) mal.push(`captures sous 1440 px : ${petites.join(" ")}`);
  if (deb > 1) mal.push(`débordement horizontal +${deb}`);
  if (err.length) mal.push(`${err.length} erreur(s) console : ${err[0].slice(0, 80)}`);
  if (mal.length) echecs++;

  console.log(`${mal.length ? "✗" : "✓"} ${String(L).padStart(5)} px  scène ${st[0]}×${st[1]}  rapport ${rapports.join("/")}  échelle ${echelles.join("/")}  ${lignes.length} aperçus (${lignes.filter((l) => l.dessin).length} dessiné)  ${mal.join(" · ") || ""}`);
  await p.close();
}
await nav.close();
console.log(`\n${LARGEURS.length} largeurs · ${echecs} en échec`);
process.exit(echecs ? 1 : 0);
