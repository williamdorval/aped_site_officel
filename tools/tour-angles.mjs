/* Balayage gnomonique d'un panorama local : une planche de vues
   rectilignes, une par lacet, pour choisir les points de passage
   et verifier la couture (qui tombe a lacet 180).

   `node tools/tour-angles.mjs <pano> <sortie.png> "<lacets>" [pitch] [hfov]`

   CONVENTION DE LACET — le piege de ce chantier.
   Les lacets affiches ici sont ceux de PANNELLUM : le signe est
   celui qu'on recopie tel quel dans `js/tour360.js`. La formule de
   reprojection ci-dessous, elle, tourne dans l'autre sens — c'est
   celle heritee de `tools/tour-images.mjs`, ou l'affiche est
   produite. On negocie donc le lacet a l'entree (`-y`), une seule
   fois, pour que l'outil parle la meme langue que le viewer.

   Consequence a retenir : l'affiche de `tour-images.mjs` se demande
   au lacet OPPOSE de celui de la scene. Terrasse a +45 dans
   `tour360.js` -> affiche a -45 dans `tour-images.mjs`.

   Le defaut avait echappe a tout le monde parce que l'ancienne
   scene d'ouverture etait le salon a lacet 5 : a cinq degres de
   zero, les deux conventions donnent la meme image. Il n'est apparu
   qu'en placant une piece a 45 degres. */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const FICHIER = process.argv[2];
const SORTIE = process.argv[3];
const YAWS = (process.argv[4] || "0,45,90,135,180,-135,-90,-45").split(",").map(Number);
const PITCH = Number(process.argv[5] || -5);
const HFOV = Number(process.argv[6] || 90);

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 1000, height: 700 } });
await page.addScriptTag({ content: `
window.__c = d => new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=d});
window.__vue = function (im, yaw, pitch, hfov, W) {
  const H = Math.round(W * 9 / 16);
  const s = document.createElement("canvas"); s.width = im.width; s.height = im.height;
  s.getContext("2d").drawImage(im, 0, 0);
  const sd = s.getContext("2d").getImageData(0, 0, im.width, im.height).data;
  const out = document.createElement("canvas"); out.width = W; out.height = H;
  const oc = out.getContext("2d"); const od = oc.createImageData(W, H);
  const R = Math.PI/180, f = (W/2)/Math.tan(hfov/2*R);
  const cy = Math.cos(yaw*R), sy = Math.sin(yaw*R);
  const cp = Math.cos(pitch*R), sp = Math.sin(pitch*R);
  for (let py=0; py<H; py++) for (let px=0; px<W; px++) {
    const x = px - W/2, y = -(py - H/2), z = -f;
    const y2 = y*cp - z*sp, z2 = y*sp + z*cp;
    const dx = x*cy + z2*sy, dz = -x*sy + z2*cy;
    const n = Math.hypot(dx,y2,dz);
    const lon = Math.atan2(dx/n, -dz/n), lat = Math.asin(y2/n);
    const u = (0.5 + lon/(2*Math.PI))*im.width, v = (0.5 - lat/Math.PI)*im.height;
    const u0 = Math.floor(u), v0 = Math.min(im.height-1, Math.max(0, Math.floor(v)));
    const fu = u-u0, fv = v-v0;
    const uu = ((u0 % im.width)+im.width)%im.width, u1 = ((u0+1)%im.width+im.width)%im.width;
    const v1 = Math.min(im.height-1, v0+1);
    const k = (py*W+px)*4;
    for (let c=0;c<3;c++) {
      const a=sd[(v0*im.width+uu)*4+c], b=sd[(v0*im.width+u1)*4+c];
      const d2=sd[(v1*im.width+uu)*4+c], e=sd[(v1*im.width+u1)*4+c];
      od.data[k+c] = (a+(b-a)*fu)*(1-fv) + (d2+(e-d2)*fu)*fv;
    }
    od.data[k+3]=255;
  }
  oc.putImageData(od,0,0);
  return out.toDataURL("image/jpeg", 0.85);
};`});

const mime = FICHIER.endsWith(".webp") ? "image/webp" : "image/jpeg";
const data = "data:" + mime + ";base64," + fs.readFileSync(FICHIER).toString("base64");
const vues = await page.evaluate(async ({ data, yaws, pitch, hfov }) => {
  const im = await window.__c(data);
  /* `-y` : voir l'en-tete. L'etiquette affiche le lacet PANNELLUM,
     l'image est calculee avec le lacet de la reprojection. */
  return yaws.map(y => ({ y, img: window.__vue(im, -y, pitch, hfov, 620) }));
}, { data, yaws: YAWS, pitch: PITCH, hfov: HFOV });

/* La croix marque le CENTRE EXACT de la vue. C'est elle qui rend la
   lecture non ambigue : le lacet cherche est celui ou la cible est
   sous la croix. Juger « a l'oeil » sur une planche sans repere
   donne des ecarts de 40 degres. */
const html = '<!doctype html><meta charset=utf-8><style>body{margin:0;background:#111;font:12px monospace;color:#eee}' +
  'figure{margin:0;display:inline-block;position:relative}img{display:block;width:620px}' +
  'figcaption{padding:3px 6px;color:#ff7a52}' +
  '.x{position:absolute;left:310px;top:calc(50% + 10px);transform:translate(-50%,-50%);pointer-events:none}' +
  '.x b{position:absolute;background:#ff2d00;display:block}' +
  '.x b:first-child{width:41px;height:1px;left:-20px;top:0}' +
  '.x b:last-child{width:1px;height:41px;left:0;top:-20px}</style>' +
  vues.map(v => '<figure><figcaption>lacet ' + v.y + '  (pitch ' + PITCH + ', hfov ' + HFOV + ')</figcaption><img src="' + v.img + '"><span class=x><b></b><b></b></span></figure>').join("");
const p2 = await nav.newPage({ viewport: { width: 1260, height: 900 } });
await p2.setContent(html, { waitUntil: "load" });
await p2.waitForTimeout(600);
fs.mkdirSync(path.dirname(SORTIE), { recursive: true });
await p2.screenshot({ path: SORTIE, fullPage: true });
console.log("-> " + SORTIE);
await nav.close();
