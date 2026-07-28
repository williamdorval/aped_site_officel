/* LES DEUX COUVERTURES, EN IMAGE.
   `node tools/couvertures.mjs`

   Le popup montre les documents. Un visiteur qui VOIT deux
   couvertures soignees comprend ce qu'on lui donne en une seconde ;
   dix lignes de description ne font pas ca.

   L'image n'est pas dessinee a la main : c'est la VRAIE premiere
   page du PDF, rendue depuis sa source (`documents/src/*.html`) par
   le meme moteur qui fabrique le PDF. Elle ne peut donc pas se
   desynchroniser du document livre — si la couverture change, on
   relance ce script et l'image suit.

   Sortie : `images/doc-automatisation.webp` et
   `images/doc-ia.webp`, 560 px de large, qualite 82. Playwright
   ecrit le webp directement, aucune dependance de plus.
*/
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");

/* La page d'un PDF fait 8,5 x 11 po. A 560 px de large, la hauteur
   est 560 x 11 / 8,5 = 724,7 — on rend a l'echelle 2 puis on laisse
   le webp compresser. */
const L = 560;
const H = Math.round((L * 11) / 8.5);

const DOCS = [
  { src: "aped-automatisation.html", out: "doc-automatisation.webp" },
  { src: "aped-ia-croissance.html", out: "doc-ia.webp" }
];

const nav = await chromium.launch();
for (const d of DOCS) {
  const ctx = await nav.newContext({
    viewport: { width: L, height: H },
    deviceScaleFactor: 2
  });
  const page = await ctx.newPage();
  const url = "file:///" + path.join(RACINE, "documents", "src", d.src).replace(/\\/g, "/");
  await page.goto(url, { waitUntil: "networkidle" });
  const cible = page.locator(".page.cover").first();
  await cible.waitFor({ state: "visible", timeout: 10000 });
  const chemin = path.join(RACINE, "images", d.out);
  await cible.screenshot({ path: chemin, type: "png" });
  /* Playwright n'ecrit pas le webp : on repasse par le navigateur,
     qui sait encoder. Aucune dependance ajoutee au projet. */
  const png = fs.readFileSync(chemin);
  const webp = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext("2d").drawImage(img, 0, 0);
    const url = c.toDataURL("image/webp", 0.82);
    return url.slice(url.indexOf(",") + 1);
  }, png.toString("base64"));
  fs.writeFileSync(chemin, Buffer.from(webp, "base64"));
  const ko = Math.round(fs.statSync(chemin).size / 1024);
  console.log(d.out.padEnd(28) + ko + " Ko");
  await ctx.close();
}
await nav.close();
