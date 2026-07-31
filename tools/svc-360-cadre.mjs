/* ============================================================
   CADRAGE DE LA VUE 360 — carte 03 · Immobilier
   `node tools/svc-360-cadre.mjs [mode]`

   Le bouton « Lancer la visite 360 » doit montrer EXACTEMENT ce
   qu'il ouvre : la piece d'entree de la visite, qui est la
   terrasse (`js/tour360.js`, `PIECES[0]`). Une belle photo d'une
   autre maison serait une faussete au sens du § 0.A.

   Un recadrage PLAT d'un equirectangulaire courbe tout : les
   verticales partent en tonneau. On refait donc la meme
   reprojection gnomonique que le viewer — le code vient de
   `tools/tour-images.mjs`, il n'est pas reinvente.

   ATTENTION AU SIGNE DU LACET. `tour-images.mjs` ecrit yaw -45 et
   son commentaire dit « egal au cadrage de la terrasse dans
   tour360.js », qui ecrit yaw +45. Les deux ne se contredisent
   pas : la convention de signe est inversee entre la reprojection
   et Pannellum. Verifie a l'image contre une capture du vrai
   visionneur (`tools/_360-reel.png`), pas au raisonnement.

   modes :
     planche  fan de cadrages, une planche a regarder (defaut)
     rendre   ecrit images/tour/svc-immobilier.webp au cadrage RETENU
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const MODE = process.argv[2] || "planche";
const SRC = "images/tour/terrasse-4k.webp";

/* LE CADRAGE RETENU. Une seule ligne a changer apres la planche. */
const RETENU = { yaw: -54, pitch: -4, hfov: 76 };
const SORTIE_L = 1600, SORTIE_H = 1000, SORTIE_Q = 0.80;

const PROJ = async ({ data, vues, W, H, q }) => {
  const charger = (src) => new Promise((ok, ko) => {
    const i = new Image();
    i.onload = () => ok(i);
    i.onerror = ko;
    i.src = src;
  });
  const im = await charger(data);
  const s = document.createElement("canvas");
  s.width = im.width; s.height = im.height;
  s.getContext("2d").drawImage(im, 0, 0);
  const sd = s.getContext("2d").getImageData(0, 0, im.width, im.height).data;

  const out = [];
  for (const v of vues) {
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const oc = c.getContext("2d");
    const od = oc.createImageData(W, H);
    const R = Math.PI / 180;
    const f = (W / 2) / Math.tan(v.hfov / 2 * R);
    const cy = Math.cos(v.yaw * R), sy = Math.sin(v.yaw * R);
    const cp = Math.cos(v.pitch * R), sp = Math.sin(v.pitch * R);

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        let x = px - W / 2, y = -(py - H / 2), z = -f;
        let y2 = y * cp - z * sp, z2 = y * sp + z * cp;
        const dx = x * cy + z2 * sy;
        const dz = -x * sy + z2 * cy;
        const n = Math.hypot(dx, y2, dz);
        const lon = Math.atan2(dx / n, -dz / n);
        const lat = Math.asin(y2 / n);
        const u = (0.5 + lon / (2 * Math.PI)) * im.width;
        const vv = (0.5 - lat / Math.PI) * im.height;
        const u0 = Math.floor(u), v0 = Math.min(im.height - 1, Math.max(0, Math.floor(vv)));
        const fu = u - u0, fv = vv - v0;
        const u1 = ((u0 + 1) % im.width + im.width) % im.width;
        const uu = ((u0 % im.width) + im.width) % im.width;
        const v1 = Math.min(im.height - 1, v0 + 1);
        const k = (py * W + px) * 4;
        for (let ch = 0; ch < 3; ch++) {
          const a = sd[(v0 * im.width + uu) * 4 + ch], b = sd[(v0 * im.width + u1) * 4 + ch];
          const d2 = sd[(v1 * im.width + uu) * 4 + ch], e = sd[(v1 * im.width + u1) * 4 + ch];
          od.data[k + ch] = (a + (b - a) * fu) * (1 - fv) + (d2 + (e - d2) * fu) * fv;
        }
        od.data[k + 3] = 255;
      }
    }
    oc.putImageData(od, 0, 0);
    out.push(c.toDataURL("image/webp", q));
  }
  return out;
};

const data = "data:image/webp;base64," + fs.readFileSync(SRC).toString("base64");
const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto("about:blank");

if (MODE === "rendre") {
  const [url] = await page.evaluate(PROJ, { data, vues: [RETENU], W: SORTIE_L, H: SORTIE_H, q: SORTIE_Q });
  const buf = Buffer.from(url.slice(url.indexOf(",") + 1), "base64");
  const dst = path.join("images", "tour", "svc-immobilier.webp");
  fs.writeFileSync(dst, buf);
  console.log("· " + dst + "  " + SORTIE_L + "x" + SORTIE_H + "  " + Math.round(buf.length / 1024) + " Ko"
    + "  (gnomonique, yaw " + RETENU.yaw + " / pitch " + RETENU.pitch + " / hfov " + RETENU.hfov + ", q " + SORTIE_Q + ")");
} else {
  /* Le fan. Deux axes seulement a la fois : un fan a trois axes
     rend 27 vignettes ou plus rien ne se compare. */
  const vues = [];
  for (const pitch of [-8, -4, 0]) {
    for (const yaw of [-58, -46, -34, -22]) {
      for (const hfov of [72, 90]) vues.push({ yaw, pitch, hfov });
    }
  }
  const urls = await page.evaluate(PROJ, { data, vues, W: 480, H: 300, q: 0.82 });
  const html = "<style>body{margin:0;background:#0d0d0d;color:#ddd;font:11px ui-monospace,monospace;padding:10px}"
    + ".g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}h2{font-size:11px;letter-spacing:.16em;color:#e2451f;margin:16px 0 6px}"
    + "figure{margin:0}img{width:100%;display:block;border:1px solid #333}figcaption{padding-top:4px;color:#999}</style>"
    + [-8, -4, 0].map((pitch, pi) => {
      return [72, 90].map((hfov, hi) => {
        const cells = [-58, -46, -34, -22].map((yaw, yi) => {
          const idx = pi * 8 + yi * 2 + hi;
          return '<figure><img src="' + urls[idx] + '"><figcaption>yaw ' + yaw + " · pitch " + pitch + " · hfov " + hfov + "</figcaption></figure>";
        }).join("");
        return "<h2>PITCH " + pitch + " — HFOV " + hfov + '</h2><div class="g">' + cells + "</div>";
      }).join("");
    }).join("");
  await page.setContent(html);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "tools/_360-fan.png", fullPage: true });
  console.log("· tools/_360-fan.png — " + vues.length + " cadrages");
}
await nav.close();
