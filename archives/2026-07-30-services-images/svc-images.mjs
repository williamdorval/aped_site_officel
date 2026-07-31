/* ============================================================
   LES QUATRE PHOTOGRAPHIES DE LA SECTION 02 · SERVICES
   `node tools/svc-images.mjs [rendre]`

   Produit `images/services/*.webp` a partir de sources dont la
   licence est ecrite ici meme. Sans argument, ne fait qu'une
   PLANCHE a regarder : `tools/_planche-services.png`.

   POURQUOI CE FICHIER EXISTE. Cinq images du depot
   (`images/real-*.webp`) sont inutilisables parce que personne ne
   peut dire d'ou elles viennent — les metadonnees ont ete effacees
   au re-encodage WebP. La provenance ne survit pas dans un fichier
   binaire : elle ne survit que dans un fichier TEXTE du depot. Ce
   fichier est celui-la.

   AUCUNE DEPENDANCE. Le decodage, la reprojection, l'etalonnage et
   l'encodage WebP passent tous par le canvas de Chromium, comme
   `tools/tour-images.mjs` et `tools/secteurs-photos.mjs`.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const RENDRE = process.argv[2] === "rendre";
const SORTIE = path.join("images", "services");
const L = 1280, H = 854, Q = 0.80;          /* 3:2, deux fois la taille CSS max */

/* ------------------------------------------------------------
   LE REGISTRE. Une ligne par image affichee sur le site.

   Trois viennent de Pexels : licence gratuite, usage commercial,
   modification autorisee, attribution NON exigee.
   `https://www.pexels.com/license/`
   L'auteur est tout de meme nomme : c'est exactement ce qui
   manquait aux cinq `real-*.webp` et qui les rend inemployables.

   La quatrieme n'est pas une photographie de banque : c'est une
   REPROJECTION de la premiere image de notre propre visite 360.
   Le bouton « Lancer la visite 360 » doit montrer ce qu'il ouvre.
   ------------------------------------------------------------ */
const REGISTRE = [
  {
    sortie: "svc-01-sites.webp",
    source: "tools/_candidats/01b-pexels-11388016.jpg",
    quoi: "Salle de bistro au repos, chaises noires, sol de beton, contre-jour",
    alt: "Salle d’un café au repos avant l’ouverture : des chaises noires alignées autour de tables rondes, un sol de béton, et la lumière du jour qui entre par les vitrines.",
    provenance: "Pexels #11388016 — https://www.pexels.com/photo/a-table-and-black-chairs-in-a-coffee-shop-11388016/",
    auteur: "Abdullah",
    licence: "Pexels License — commercial, modification permise, attribution non exigee",
    cadre: { zoom: 1.0, dx: 0, dy: 0 }
  },
  {
    sortie: "svc-02-automatisation.webp",
    source: "tools/_candidats/02b-pexels-12234106.jpg",
    quoi: "Formulaire papier rempli a la main sur un presse-papiers, a contre-jour",
    alt: "Une personne debout remplit à la main un formulaire posé sur un presse-papiers, devant la fenêtre d’un entrepôt.",
    provenance: "Pexels #12234106 — https://www.pexels.com/photo/close-up-shot-of-a-person-doing-a-checklist-12234106/",
    auteur: "Daniel Andraski",
    licence: "Pexels License — commercial, modification permise, attribution non exigee",
    cadre: { zoom: 1.0, dx: 0, dy: 0 }
  },
  {
    sortie: "svc-03-immobilier.webp",
    pano: "images/tour/terrasse-4k.webp",
    /* CES TROIS VALEURS SONT LE CADRAGE DE L'IMAGE. Elles ne
       decrivent PAS le cadrage d'ouverture du visionneur
       (`js/tour360.js` : yaw 45 / pitch -5 / hfov 104, convention
       de signe inverse) : c'est la MEME piece, vue un peu plus
       serree et composee. Le batiment, le bassin et la table sont
       ceux que le bouton ouvre. */
    vue: { yaw: -54, pitch: -4, hfov: 76 },
    quoi: "Terrasse de la propriete — premiere piece de la visite 360",
    alt: "Terrasse pavée d’une propriété : un bassin à jet d’eau devant une maison blanche à grandes baies, une haie taillée, et une table de jardin en fer forgé.",
    provenance: "Poly Haven, Lythwood Lodge, Lidgetton, KwaZulu-Natal — https://polyhaven.com/license",
    auteur: "Greg Zaal",
    licence: "CC0 — domaine public"
  },
  {
    sortie: "svc-04-logiciels.webp",
    source: "tools/_candidats/04a-pexels-12706241.jpg",
    quoi: "Rayonnages a palettes rouges et noirs sur une dalle de beton nue",
    alt: "Alignement de rayonnages à palettes rouges et noirs, vides, dans un entrepôt à dalle de béton.",
    provenance: "Pexels #12706241 — https://www.pexels.com/photo/interior-of-a-warehouse-12706241/",
    auteur: "iam luisao",
    licence: "Pexels License — commercial, modification permise, attribution non exigee",
    cadre: { zoom: 1.0, dx: 0, dy: 0 }
  }
];

/* L'ETALONNAGE UNIFIE — LEGER, ET C'EST VOULU.
   Quatre photographies de quatre auteurs ne forment un jeu que si
   elles partagent un point noir, un point blanc et une saturation.
   Au-dela, on ne les unifie plus, on les abime : une courbe forte
   creuse les noirs du bistro et brule deja le ciel de la terrasse.
   `k` est le contraste en S, `sat` la saturation, `gain` la
   derive par canal (un cheveu de chaud, pour tenir avec le
   ciment et le minium). */
const GRADE = { sat: 0.90, k: 0.20, noir: 0.030, blanc: 0.980, gain: [1.010, 1.000, 0.984] };
/* LA TERRASSE EST LA SEULE SOUS CIEL COUVERT, et c'est un vrai
   probleme de jeu : les trois autres sont sombres, elle est claire
   et grise. Quatre etalonnages ont ete rendus et REGARDES
   (`tools/_360-etal.png`) ; celui-ci est le seul qui la fasse
   rentrer. `gamma` rentre les hautes lumieres — sans lui, le ciel
   couvert reste un aplat blanc qui perce la planche —, `blanc`
   0.885 empeche le blanc pur, et le gain chaud rend a la brique la
   matiere que le contraste lui prenait.
   ATTENTION : c'est la limite de ce qu'on peut tirer de ce
   panorama. Au-dela, ca ne s'unifie plus, ca se filtre. */
const GRADE_PANO = { sat: 0.88, k: 0.66, gamma: 1.35, noir: 0.038, blanc: 0.885, gain: [1.035, 1.000, 0.955] };

const RENDU = async ({ jobs, W, H, q }) => {
  const charger = (s) => new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = s; });

  const etalonner = (od, G) => {
    for (let k = 0; k < od.data.length; k += 4) {
      const r = od.data[k], g = od.data[k + 1], b = od.data[k + 2];
      const Lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      for (let c = 0; c < 3; c++) {
        let t = (Lum + (od.data[k + c] - Lum) * G.sat) / 255;
        t = t + G.k * (t - 0.5) * (1 - Math.abs(2 * t - 1));
        if (G.gamma) t = Math.pow(Math.max(0, t), G.gamma);
        t = G.noir + t * (G.blanc - G.noir);
        od.data[k + c] = Math.max(0, Math.min(255, t * G.gain[c] * 255));
      }
    }
  };

  const out = [];
  for (const j of jobs) {
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const oc = c.getContext("2d");

    if (j.pano) {
      /* REPROJECTION GNOMONIQUE — la meme que le visionneur.
         Un recadrage plat d'un equirectangulaire courbe tout : les
         verticales partent en tonneau et l'image trahit sa
         projection. */
      const im = await charger(j.pano);
      const s = document.createElement("canvas");
      s.width = im.width; s.height = im.height;
      s.getContext("2d").drawImage(im, 0, 0);
      const sd = s.getContext("2d").getImageData(0, 0, im.width, im.height).data;
      const od = oc.createImageData(W, H);
      const R = Math.PI / 180, f = (W / 2) / Math.tan(j.vue.hfov / 2 * R);
      const cy = Math.cos(j.vue.yaw * R), sy = Math.sin(j.vue.yaw * R);
      const cp = Math.cos(j.vue.pitch * R), sp = Math.sin(j.vue.pitch * R);
      for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
        let x = px - W / 2, y = -(py - H / 2), z = -f;
        let y2 = y * cp - z * sp, z2 = y * sp + z * cp;
        const dx = x * cy + z2 * sy, dz = -x * sy + z2 * cy, n = Math.hypot(dx, y2, dz);
        const lon = Math.atan2(dx / n, -dz / n), lat = Math.asin(y2 / n);
        const u = (0.5 + lon / (2 * Math.PI)) * im.width, vv = (0.5 - lat / Math.PI) * im.height;
        const u0 = Math.floor(u), v0 = Math.min(im.height - 1, Math.max(0, Math.floor(vv)));
        const fu = u - u0, fv = vv - v0;
        const u1 = ((u0 + 1) % im.width + im.width) % im.width, uu = ((u0 % im.width) + im.width) % im.width;
        const v1 = Math.min(im.height - 1, v0 + 1), k = (py * W + px) * 4;
        for (let cc = 0; cc < 3; cc++) {
          const a = sd[(v0 * im.width + uu) * 4 + cc], b = sd[(v0 * im.width + u1) * 4 + cc];
          const d2 = sd[(v1 * im.width + uu) * 4 + cc], e = sd[(v1 * im.width + u1) * 4 + cc];
          od.data[k + cc] = (a + (b - a) * fu) * (1 - fv) + (d2 + (e - d2) * fu) * fv;
        }
        od.data[k + 3] = 255;
      }
      etalonner(od, j.gradePano);
      oc.putImageData(od, 0, 0);
    } else {
      /* Recadrage en « couvrir », puis etalonnage. */
      const im = await charger(j.src);
      const rs = im.width / im.height, rd = W / H;
      let sw, sh;
      if (rs > rd) { sh = im.height; sw = sh * rd; } else { sw = im.width; sh = sw / rd; }
      sw /= j.cadre.zoom; sh /= j.cadre.zoom;
      const sx = (im.width - sw) / 2 + j.cadre.dx * sw;
      const sy2 = (im.height - sh) / 2 + j.cadre.dy * sh;
      oc.imageSmoothingQuality = "high";
      oc.drawImage(im, sx, sy2, sw, sh, 0, 0, W, H);
      const od = oc.getImageData(0, 0, W, H);
      etalonner(od, j.grade);
      oc.putImageData(od, 0, 0);
    }
    out.push(c.toDataURL("image/webp", q));
  }
  return out;
};

const jobs = REGISTRE.map((e) => ({
  src: e.source ? "data:image/jpeg;base64," + fs.readFileSync(e.source).toString("base64") : null,
  pano: e.pano ? "data:image/webp;base64," + fs.readFileSync(e.pano).toString("base64") : null,
  vue: e.vue, cadre: e.cadre, grade: GRADE, gradePano: GRADE_PANO
}));

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 1400, height: 1000 } });
await page.goto("about:blank");
const urls = await page.evaluate(RENDU, { jobs, W: L, H: H, q: Q });

if (RENDRE) {
  fs.mkdirSync(SORTIE, { recursive: true });
  console.log("\nIMAGES DE LA SECTION 02 · SERVICES\n");
  REGISTRE.forEach((e, i) => {
    const buf = Buffer.from(urls[i].slice(urls[i].indexOf(",") + 1), "base64");
    fs.writeFileSync(path.join(SORTIE, e.sortie), buf);
    console.log("· " + e.sortie.padEnd(28) + L + "x" + H + "  " + String(Math.round(buf.length / 1024)).padStart(4) + " Ko");
    console.log("  " + e.quoi);
    console.log("  " + e.provenance);
    console.log("  auteur " + e.auteur + " · " + e.licence + "\n");
  });
  const total = urls.reduce((s, u) => s + Buffer.from(u.slice(u.indexOf(",") + 1), "base64").length, 0);
  console.log("total " + Math.round(total / 1024) + " Ko pour quatre images.");
} else {
  let html = "<style>body{margin:0;background:#0d0d0d;color:#ddd;font:11px ui-monospace,monospace;padding:14px}"
    + ".g{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}figure{margin:0}"
    + "img{width:100%;aspect-ratio:3/2;object-fit:cover;display:block;border:1px solid #333}"
    + "h3{color:#e2451f;font-size:11px;letter-spacing:.16em;margin:8px 0 3px}p{margin:0;color:#999}</style><div class=g>";
  REGISTRE.forEach((e, i) => {
    html += '<figure><img src="' + urls[i] + '"><h3>' + e.sortie + "</h3><p>" + e.quoi + "</p><p>" + e.auteur + " · " + e.licence.split(" — ")[0] + "</p></figure>";
  });
  html += "</div>";
  await page.setContent(html);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "tools/_planche-services.png", fullPage: true });
  console.log("· tools/_planche-services.png — relance avec `rendre` pour ecrire les fichiers");
}
await nav.close();
