/* ============================================================
   APERCU DE PANORAMAS — planche de decision
   `node tools/apercu-panos.mjs`

   Juger un equirectangulaire sur sa vignette, c'est juger une
   carte du monde sur la Mercator : tout est deforme aux poles et
   rien ne ressemble a ce que le visiteur verra. On produit donc
   des vues RECTILIGNES, la meme projection gnomonique que le
   viewer, a deux cadrages par piece. C'est la seule facon
   honnete de comparer deux maisons.

   Outil de decision. N'ecrit rien dans images/.
   ============================================================ */
import { chromium } from "playwright";
import https from "node:https";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const CACHE = path.join(os.tmpdir(), "adexweb-panos");
const OUT = path.join(RACINE, "refonte-captures/candidats");
fs.mkdirSync(CACHE, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

/* DECISION PRISE — ne pas re-adopter le lot ci-dessous.

   `brown_photostudio_01..07` revient a chaque recherche parce que
   c'est le plus gros groupe d'interieurs partageant une adresse dans
   tout Poly Haven : six assets a moins de 11 m les uns des autres
   (49.2372, 28.4063), et la recherche par coordonnees le designe
   comme « une meme propriete ». Il l'est. Mais REGARDER les images
   tranche autrement : c'est un studio de photo de mariage. Il y a
   des lettres lumineuses « MARRY » en pied de mur dans `marry_hall`,
   une arche de fleurs sechees dans le 05, une baignoire posee en
   accessoire dans le 06, des boites a lumiere et un fond noir dans
   le 07, et partout des pieces vides a faux plafond. Sur un site
   d'agence, ca se lit comme une salle des fetes, pas comme une
   maison — exactement le genre de detail qu'un client repere.

   Le lot est garde ici pour que la planche puisse etre refaite et le
   verdict reverifie, pas parce qu'il est candidat. */
const LOT = [
  "brown_photostudio_01", "brown_photostudio_02", "brown_photostudio_03",
  "brown_photostudio_04", "brown_photostudio_05", "brown_photostudio_06",
  "brown_photostudio_07"
];
/* Ce qui est en place : les trois pieces de Lythwood Lodge.
   `en_suite`, qui venait d'une autre maison, a ete retire. */
const ACTUELLE = ["lythwood_terrace", "lythwood_lounge", "lythwood_room"];

const VUES = [{ yaw: 0, pitch: -4 }, { yaw: 180, pitch: -4 }];
const HFOV = 95, LARG = 720;

function get(u) {
  return new Promise((ok, non) => {
    https.get(u, { headers: { "user-agent": "adexweb-apercu" } }, r => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) { r.resume(); return get(r.headers.location).then(ok, non); }
      let d = ""; r.on("data", c => d += c); r.on("end", () => ok(d));
    }).on("error", non);
  });
}

function dl(url, dest) {
  return new Promise((ok, non) => {
    if (fs.existsSync(dest)) return ok(false);
    const f = fs.createWriteStream(dest + ".part");
    const go = u => https.get(u, { headers: { "user-agent": "adexweb-apercu" } }, r => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) { r.resume(); return go(r.headers.location); }
      if (r.statusCode !== 200) { r.resume(); return non(new Error(r.statusCode)); }
      r.pipe(f); f.on("finish", () => f.close(() => { fs.renameSync(dest + ".part", dest); ok(true); }));
    }).on("error", non);
    go(url);
  });
}

const tous = [...LOT, ...ACTUELLE];
for (const s of tous) {
  const j = JSON.parse(await get("https://api.polyhaven.com/files/" + s));
  const neuf = await dl(j.tonemapped.url, path.join(CACHE, s + ".jpg"));
  process.stdout.write(neuf ? "." : "-");
}
console.log("  " + tous.length + " sources pretes");

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 1200, height: 800 } });
await page.addScriptTag({
  content: `
window.__charger = d => new Promise((ok, non) => { const i = new Image(); i.onload = () => ok(i); i.onerror = non; i.src = d; });
window.__vue = function (im, yaw, pitch, hfov, W) {
  const H = Math.round(W * 9 / 16);
  const s = document.createElement("canvas"); s.width = im.width; s.height = im.height;
  s.getContext("2d").drawImage(im, 0, 0);
  const sd = s.getContext("2d").getImageData(0, 0, im.width, im.height).data;
  const out = document.createElement("canvas"); out.width = W; out.height = H;
  const oc = out.getContext("2d"); const od = oc.createImageData(W, H);
  const R = Math.PI / 180, f = (W / 2) / Math.tan(hfov / 2 * R);
  const cy = Math.cos(yaw * R), sy = Math.sin(yaw * R);
  const cp = Math.cos(pitch * R), sp = Math.sin(pitch * R);
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    const x = px - W / 2, y = -(py - H / 2), z = -f;
    const y2 = y * cp - z * sp, z2 = y * sp + z * cp;
    const dx = x * cy + z2 * sy, dz = -x * sy + z2 * cy;
    const n = Math.hypot(dx, y2, dz);
    const lon = Math.atan2(dx / n, -dz / n), lat = Math.asin(y2 / n);
    const u = (0.5 + lon / (2 * Math.PI)) * im.width;
    const v = (0.5 - lat / Math.PI) * im.height;
    const u0 = Math.floor(u), v0 = Math.min(im.height - 1, Math.max(0, Math.floor(v)));
    const fu = u - u0, fv = v - v0;
    const uu = ((u0 % im.width) + im.width) % im.width;
    const u1 = ((u0 + 1) % im.width + im.width) % im.width;
    const v1 = Math.min(im.height - 1, v0 + 1);
    const k = (py * W + px) * 4;
    for (let c = 0; c < 3; c++) {
      const a = sd[(v0 * im.width + uu) * 4 + c], b = sd[(v0 * im.width + u1) * 4 + c];
      const d2 = sd[(v1 * im.width + uu) * 4 + c], e = sd[(v1 * im.width + u1) * 4 + c];
      od.data[k + c] = (a + (b - a) * fu) * (1 - fv) + (d2 + (e - d2) * fu) * fv;
    }
    od.data[k + 3] = 255;
  }
  oc.putImageData(od, 0, 0);
  return out.toDataURL("image/jpeg", 0.86);
};`
});

async function planche(slugs, titre, fichier) {
  const cartes = [];
  for (const s of slugs) {
    const b64 = "data:image/jpeg;base64," + fs.readFileSync(path.join(CACHE, s + ".jpg")).toString("base64");
    const vues = await page.evaluate(async ({ data, vues, hfov, W }) => {
      const im = await window.__charger(data);
      return vues.map(v => window.__vue(im, v.yaw, v.pitch, hfov, W));
    }, { data: b64, vues: VUES, hfov: HFOV, W: LARG });
    cartes.push({ s, vues });
    process.stdout.write("*");
  }
  const html =
    '<!doctype html><meta charset=utf-8><style>' +
    'body{margin:0;background:#101211;font:13px ui-monospace,monospace;color:#dcdedb}' +
    'h1{font:600 15px ui-monospace,monospace;color:#ff7a52;padding:14px 12px 4px;margin:0;letter-spacing:.06em}' +
    'section{padding:8px 12px 16px}figure{margin:0 0 12px;display:grid;grid-template-columns:1fr 1fr;gap:6px}' +
    'img{width:100%;display:block}figcaption{grid-column:1/-1;padding:4px 0;color:#9aa09c}' +
    '</style><h1>' + titre + '</h1><section>' +
    cartes.map(c => '<figure><figcaption>' + c.s + '</figcaption>' +
      c.vues.map(v => '<img src="' + v + '">').join('') + '</figure>').join('') +
    '</section>';
  const p2 = await nav.newPage({ viewport: { width: 1520, height: 1000 } });
  await p2.setContent(html, { waitUntil: "load" });
  await p2.waitForTimeout(900);
  await p2.screenshot({ path: path.join(OUT, fichier), fullPage: true });
  await p2.close();
  console.log("\n  -> refonte-captures/candidats/" + fichier);
}

await planche(LOT, "CANDIDAT — brown_photostudio 01..07 · Poly Haven · CC0 · 16384x8192 · Sergej Majboroda", "candidat-lot.png");
await planche(ACTUELLE, "EN PLACE — lythwood_terrace / lythwood_lounge / lythwood_room · Lythwood Lodge · Poly Haven · CC0 · Greg Zaal", "actuelle.png");

await nav.close();
