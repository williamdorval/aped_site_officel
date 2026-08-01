/* ============================================================
   LES PHOTOGRAPHIES DES SITES DE SECTEUR
   `node tools/secteurs-sites-photos.mjs [secteur...] [--forcer]`

   Outil de FABRICATION, il ne tourne jamais chez le visiteur.

   POURQUOI IL EXISTE
   Chaque site de secteur est un site de client fictif, et un site de
   client sans photographie se reconnait a dix metres : ce sont les
   rectangles gris qu'un chantier entier vient d'eliminer ailleurs.
   Le premier site de construction livre n'avait que TROIS images du
   depot, reutilisees six fois. Ca se voit, et c'est le proprietaire
   qui l'a dit.

   CE QU'IL PRODUIT
   `images/secteurs-sites/<secteur>-<n>.webp`, une image par emploi,
   aucune repetition.

   LES LICENCES
   Poly Haven (CC0, domaine public) ou Pexels (licence gratuite,
   usage commercial, modification permise, attribution non exigee).
   Le tableau ci-dessous porte l'adresse de chaque piece. Aucune
   marque lisible, aucun visage identifiable, aucun logo.

   LA REGLE DE SURETE : il n'ecrase jamais sans `--forcer`.
   ============================================================ */
import { chromium } from "playwright";
import https from "node:https";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NOYAU } from "./photo-noyau.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const SORTIE = path.join(RACINE, "images/secteurs-sites");
const CACHE = path.join(os.tmpdir(), "aped-secteurs-src");
fs.mkdirSync(CACHE, { recursive: true });
fs.mkdirSync(SORTIE, { recursive: true });
const FORCER = process.argv.includes("--forcer");
const TRAVAIL = 3072;

const LIC_PH = "https://polyhaven.com/license";
const LIC_PX = "https://www.pexels.com/license/";
const PX = "https://images.pexels.com/photos";
const GRAND = "?auto=compress&cs=tinysrgb&w=1920";

/* Chaque ligne = une image, un emploi, une source. `large` sort en
   16/9 pour les bandeaux, sinon en 4/3. */
const TIRAGES = {
  construction: [
    /* Le heros : une charpente en cours, c'est ce qu'un entrepreneur
       general montre en premier. */
    { n: 1, emploi: "heros — charpente en cours", large: true,
      src: "url:" + PX + "/37627682/pexels-photo-37627682.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/new-home-construction-in-elk-grove-37627682/", fen: { x: 0, y: 0.10, w: 1 } },
    { n: 2, emploi: "ossature de bois", large: true,
      src: "url:" + PX + "/8817834/pexels-photo-8817834.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/construction-of-framework-of-house-with-softwood-materials-8817834/", fen: { x: 0.04, y: 0.08, w: 0.92 } },
    { n: 3, emploi: "bois d'oeuvre en reserve",
      src: "url:" + PX + "/12278581/pexels-photo-12278581.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/stacks-of-lumbers-in-close-up-photography-12278581/", fen: { x: 0.08, y: 0.10, w: 0.84 } },
    /* Les chantiers interieurs, en reprojection gnomonique. */
    { n: 4, emploi: "gros oeuvre, murs de blocs", src: "ph:interior_construction", licence: LIC_PH,
      page: "https://polyhaven.com/a/interior_construction", yaw: 135, pitch: -6, hfov: 80 },
    { n: 5, emploi: "sous-sol a finir", src: "ph:interior_construction", licence: LIC_PH,
      page: "https://polyhaven.com/a/interior_construction", yaw: 270, pitch: -6, hfov: 80 },
    { n: 6, emploi: "atelier de menuiserie", src: "ph:carpentry_shop_01", licence: LIC_PH,
      page: "https://polyhaven.com/a/carpentry_shop_01", yaw: 270, pitch: -4, hfov: 78 },
    { n: 7, emploi: "atelier, second poste", src: "ph:carpentry_shop_02", licence: LIC_PH,
      page: "https://polyhaven.com/a/carpentry_shop_02", yaw: 90, pitch: -4, hfov: 78 },
    { n: 8, emploi: "combles amenages", src: "ph:pine_attic", licence: LIC_PH,
      page: "https://polyhaven.com/a/pine_attic", yaw: 180, pitch: -6, hfov: 80 },
    { n: 9, emploi: "salle de bain livree", src: "ph:modern_bathroom", licence: LIC_PH,
      page: "https://polyhaven.com/a/modern_bathroom", yaw: 180, pitch: -8, hfov: 80 },
    { n: 10, emploi: "cuisine livree", src: "ph:kiara_interior", licence: LIC_PH,
      page: "https://polyhaven.com/a/kiara_interior", yaw: 180, pitch: -6, hfov: 80 },
    { n: 11, emploi: "piece finie, plancher neuf", src: "ph:small_empty_house", licence: LIC_PH,
      page: "https://polyhaven.com/a/small_empty_house", yaw: 70, pitch: -6, hfov: 80 },
    { n: 12, emploi: "bureau en chantier", src: "ph:unfinished_office", licence: LIC_PH,
      page: "https://polyhaven.com/a/unfinished_office", yaw: 150, pitch: -6, hfov: 80 }
  ]
};

const LARGE = { w: 1280, h: 720 };
const NORMAL = { w: 960, h: 720 };

const j = (u) => new Promise((ok, no) => {
  https.get(u, { headers: { "user-agent": "aped-secteurs-sites" } }, (r) => {
    let d = ""; r.on("data", (c) => (d += c)); r.on("end", () => { try { ok(JSON.parse(d)); } catch (e) { no(new Error(d.slice(0, 200))); } });
  }).on("error", no);
});
function telecharger(url, dest) {
  return new Promise((ok, non) => {
    if (fs.existsSync(dest)) return ok(false);
    const f = fs.createWriteStream(dest + ".part");
    const suivre = (u) => https.get(u, { headers: { "user-agent": "Mozilla/5.0 (compatible; aped-secteurs-sites)" } }, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) { r.resume(); return suivre(r.headers.location); }
      if (r.statusCode !== 200) { r.resume(); return non(new Error(r.statusCode + " " + u)); }
      r.pipe(f);
      f.on("finish", () => f.close(() => { fs.renameSync(dest + ".part", dest); ok(true); }));
    }).on("error", non);
    suivre(url);
  });
}
async function resoudre(src) {
  if (src.startsWith("ph:")) {
    const slug = src.slice(3);
    const dest = path.join(CACHE, slug + ".jpg");
    if (!fs.existsSync(dest)) {
      const f = await j("https://api.polyhaven.com/files/" + slug);
      if (!f.tonemapped?.url) throw new Error("pas de tonemapped pour " + slug);
      await telecharger(f.tonemapped.url, dest);
    }
    return dest;
  }
  if (src.startsWith("url:")) {
    const u = src.slice(4);
    const cle = crypto.createHash("sha1").update(u).digest("hex").slice(0, 16);
    const dest = path.join(CACHE, "url-" + cle + ".img");
    if (!fs.existsSync(dest)) await telecharger(u, dest);
    return dest;
  }
  throw new Error("source incomprise : " + src);
}
function mime(p) {
  if (/\.png$/i.test(p)) return "image/png";
  if (/\.img$/i.test(p)) {
    const b = fs.readFileSync(p, { start: 0, end: 12 });
    if (b[0] === 0x89 && b[1] === 0x50) return "image/png";
    if (b.slice(8, 12).toString() === "WEBP") return "image/webp";
    return "image/jpeg";
  }
  return "image/jpeg";
}
const dataUrl = (p) => "data:" + mime(p) + ";base64," + fs.readFileSync(p).toString("base64");

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 600, height: 400 } });
await page.addScriptTag({ content: NOYAU });
await page.evaluate(() => {
  window.__poserVue = function (cv, W, H, q) {
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const x = c.getContext("2d");
    x.imageSmoothingQuality = "high";
    const y0 = Math.max(0, Math.round((cv.height - H) / 2));
    x.drawImage(cv, 0, y0, W, Math.min(H, cv.height), 0, 0, W, H);
    return { data: c.toDataURL("image/webp", q), ec: (() => {
      const d = x.getImageData(0, 0, W, H).data;
      let s = 0, s2 = 0, n = 0;
      for (let i = 0; i < d.length; i += 4 * 13) {
        const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        s += l; s2 += l * l; n++;
      }
      const m = s / n;
      return +Math.sqrt(Math.max(0, s2 / n - m * m)).toFixed(1);
    })() };
  };
});

const demandes = process.argv.slice(2).filter((a) => TIRAGES[a]);
const aFaire = demandes.length ? demandes : Object.keys(TIRAGES);
const R = [];
const REGISTRE = [];

for (const secteur of aFaire) {
  let panoCourant = null;
  for (const t of TIRAGES[secteur]) {
    const dest = path.join(SORTIE, `${secteur}-${t.n}.webp`);
    REGISTRE.push({ fichier: path.relative(RACINE, dest).replace(/\\/g, "/"), emploi: t.emploi, source: t.src, page: t.page, licence: t.licence });
    if (fs.existsSync(dest) && !FORCER) { console.log("·", path.basename(dest).padEnd(22), "deja present — on n'y touche pas"); continue; }
    const dim = t.large ? LARGE : NORMAL;
    const f = await resoudre(t.src);
    let res;
    if (t.src.startsWith("ph:")) {
      if (panoCourant !== t.src) { await page.evaluate(async ({ d, L }) => window.__prep(d, L), { d: dataUrl(f), L: TRAVAIL }); panoCourant = t.src; }
      res = await page.evaluate(({ yaw, pitch, hfov, W, H, q }) => {
        const cv = window.__vue(window.__sd, window.__sw, window.__sh, yaw, pitch, hfov, W, Math.round(W * 0.72));
        return window.__poserVue(cv, W, H, q);
      }, { yaw: t.yaw, pitch: t.pitch, hfov: t.hfov, W: dim.w, H: dim.h, q: 0.72 });
    } else {
      res = await page.evaluate(async ({ d, fen, W, H, q }) => {
        const r = await window.__plat(d, fen, W, H, 1);
        const im = await window.__charger(r.data);
        const c = document.createElement("canvas");
        c.width = W; c.height = H;
        c.getContext("2d").drawImage(im, 0, 0, W, H);
        return window.__poserVue(c, W, H, q);
      }, { d: dataUrl(f), fen: t.fen, W: dim.w, H: dim.h, q: 0.72 });
      panoCourant = null;
    }
    if (res.ec < 8) throw new Error(`${secteur}-${t.n} : image PLATE (ecart-type ${res.ec}) — corriger le cadrage`);
    const bin = Buffer.from(res.data.split(",")[1], "base64");
    fs.writeFileSync(dest, bin);
    R.push({ fichier: path.basename(dest), emploi: t.emploi, taille: `${dim.w}x${dim.h}`, ko: Math.round(bin.length / 1024), ec: res.ec });
  }
}

await nav.close();
if (R.length) console.table(R);
console.log("TOTAL :", R.reduce((a, b) => a + b.ko, 0), "Ko pour", R.length, "images");
fs.writeFileSync(path.join(SORTIE, "_licences.json"), JSON.stringify(REGISTRE, null, 1));
console.log("registre des licences :", path.relative(RACINE, path.join(SORTIE, "_licences.json")).replace(/\\/g, "/"));
