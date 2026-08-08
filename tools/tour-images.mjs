/* ============================================================
   PANORAMAS DE LA VISITE — TELECHARGEMENT ET MISE AU FORMAT
   `node tools/tour-images.mjs`

   Outil de FABRICATION. Il ne tourne jamais chez le visiteur, et
   le site ne depend d'aucune de ses dependances : il n'utilise que
   Playwright, deja present pour la mesure.

   CE QU'IL FAIT
   Prend des equirectangulaires JPEG, en sort les trois tailles que
   `js/tour360.js` attend, en webp. Rien d'autre.

   DEUX REGLES DE SURETE
   1. IL N'ECRASE JAMAIS. Si le fichier de sortie existe deja, il
      passe son tour et le dit. Pour remplacer, il faut d'abord
      deplacer l'ancien a la main. Cette regle existe parce que la
      version precedente de ce chantier a ecrase cinq panoramas
      sans retour possible.
   2. LA REDUCTION EST CYCLIQUE. Un equirectangulaire boucle, mais
      `drawImage` non : en reduisant, le filtre de bord travaille
      sur un voisinage tronque et fabrique une colonne de gauche et
      une colonne de droite qui ne viennent plus de la meme
      information. La couture apparait alors A LA REDUCTION, sur
      une image dont la projection etait parfaite. On elargit donc
      l'image avec ses propres pixels d'en face, on reduit, on
      recadre.
   ============================================================ */
import { chromium } from "playwright";
import https from "node:https";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const SORTIE = path.join(RACINE, "images/tour");
/* Le cache des sources telechargees vit hors du projet : il ne doit
   jamais partir en production ni gonfler une sauvegarde. */
const CACHE = path.join(os.tmpdir(), "adexweb-panos");
/* LE DEPOT. C'est ici qu'on pose ses propres panoramas, en 2:1,
   un fichier par piece, nomme comme l'identifiant de la piece.
   Le dossier est lu tel quel : rien d'autre a configurer. */
const DEPOT = path.join(SORTIE, "source");
fs.mkdirSync(SORTIE, { recursive: true });
fs.mkdirSync(CACHE, { recursive: true });
fs.mkdirSync(DEPOT, { recursive: true });

/* Les douze pieces attendues, dans l'ordre de la visite. Le nom de
   fichier depose DOIT etre l'identifiant : `salon.jpg` donne
   `salon-4k.webp` et `salon-2k.webp`. */
export const PIECES_ATTENDUES = [
  /* les huit demandees */
  "entree", "salon", "cuisine", "salle-a-manger",
  "chambre", "salledebain", "terrasse", "jacuzzi",
  /* les quatre en plus, si elles viennent */
  "suite", "bureau", "cave", "toit"
];

/* Poly Haven, CC0. `tonemapped` est l'equirectangulaire JPEG deja
   ramene en dynamique standard : c'est la source honnete pour un
   viewer web, le .hdr n'y apporterait rien qu'un tone mapping
   maison ferait moins bien.

   UNE SEULE PROPRIETE — Lythwood Lodge, Lidgetton, KwaZulu-Natal.
   Les trois panoramas sont de Greg Zaal et portent le meme prefixe.
   Verification faite sur les coordonnees rendues par
   `api.polyhaven.com/info/<slug>` : lounge -29.4381,30.0529 et
   terrace -29.4374,30.0524, soit 90 m d'ecart. `lythwood_room` n'a
   pas de coordonnees publiees, mais partage le nom, l'auteur et la
   meme menuiserie a losanges plombes que le salon.

   `en_suite` a ete RETIRE ici : c'etait une autre maison, avec un
   toit de chaume visible par la porte. C'est le defaut que le
   client avait repere. Les anciens webp sont dans
   `images/tour/_ancien/`, ils ne sont pas supprimes.

   `q` : qualite webp propre a une piece, quand la qualite commune
   ne convient pas. La terrasse est du feuillage et de la brique en
   chevrons, ce qu'un encodeur compresse le plus mal : a 0.82 elle
   sortait a 1726 Ko en 4k et 495 Ko en 2k, contre 710 et 194 pour
   le salon. A elle seule elle doublait le poids de la visite. */
const SOURCES = [
  { id: "salon", slug: "lythwood_lounge" },
  { id: "chambre", slug: "lythwood_room" },
  { id: "terrasse", slug: "lythwood_terrace", q: 0.7 }
];

const TAILLES = [
  { larg: 4096, suffixe: "-4k" },
  { larg: 2048, suffixe: "-2k" }
];
const QUALITE = 0.82;

/* L'AFFICHE. Ces trois valeurs sont contraintes par une mesure, pas
   par un gout : la section doit rester SOUS 80 Ko avant le clic, et
   l'affiche est le seul fichier qui parte a ce moment-la.
   `index.html` declare les memes 1040 x 585 en `width`/`height` — le
   rapport reste 16/9, donc rien ne bouge a la mise en page.

   La terrasse est une image de brique en chevrons et de feuillage :
   c'est ce qu'un encodeur compresse le plus mal. Grille mesuree, en
   Ko, cadrage yaw -45 / pitch -5 :
        q 0.74  q 0.68  q 0.62
     1200x675   100      94      87
     1120x630    92      86      81
     1040x585    85      78 <-   74
      960x540    77      71      67
   1040 x 585 a q 0.68 est le plus grand cadre qui passe sous 80 Ko.
   Baisser encore la qualite ne rapporte que 4 Ko et se voit sur le
   pavage. Le tangage ne change quasi rien (4 Ko entre -5 et +3), ce
   n'est donc pas un levier. Toute retouche ici se reverifie avec
   `node tools/tour-verif.mjs`. */
const AFFICHE_L = 1040;
const AFFICHE_H = 585;
const AFFICHE_Q = 0.68;

function telecharger(url, dest) {
  return new Promise((ok, non) => {
    if (fs.existsSync(dest)) return ok(false);
    const f = fs.createWriteStream(dest + ".part");
    const suivre = u => https.get(u, { headers: { "user-agent": "adexweb-tour-images" } }, r => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) { r.resume(); return suivre(r.headers.location); }
      if (r.statusCode !== 200) { r.resume(); return non(new Error(r.statusCode + " " + u)); }
      r.pipe(f);
      f.on("finish", () => { f.close(() => { fs.renameSync(dest + ".part", dest); ok(true); }); });
    }).on("error", non);
    suivre(url);
  });
}

async function urlTonemap(slug) {
  const j = await new Promise((ok, non) => {
    https.get("https://api.polyhaven.com/files/" + slug, { headers: { "user-agent": "adexweb" } }, r => {
      let d = ""; r.on("data", c => d += c); r.on("end", () => ok(JSON.parse(d)));
    }).on("error", non);
  });
  if (!j.tonemapped || !j.tonemapped.url) throw new Error("pas de tonemapped pour " + slug);
  return j.tonemapped.url;
}

/* --------------------------------------------------------- */
const aFaire = [];
for (const s of SOURCES) {
  const manquants = TAILLES.filter(t => !fs.existsSync(path.join(SORTIE, s.id + t.suffixe + ".webp")));
  if (!manquants.length) { console.log("· " + s.id.padEnd(14) + "deja present, intact — on n'y touche pas"); continue; }
  aFaire.push({ ...s, manquants });
}

if (!aFaire.length) console.log("  les six panoramas sont en place.");

for (const s of aFaire) {
  const jpg = path.join(CACHE, s.slug + ".jpg");
  const neuf = await telecharger(await urlTonemap(s.slug), jpg);
  console.log("· " + s.id.padEnd(14) + s.slug + "  " +
    (neuf ? "telecharge" : "depuis le cache") + "  " +
    (fs.statSync(jpg).size / 1048576).toFixed(1) + " Mo");
}

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 800, height: 400 } });
const erreurs = [];
page.on("pageerror", e => erreurs.push(String(e)));

await page.addScriptTag({
  content: `
window.__reduire = function (img, largeur) {
  const MARGE = 64;
  const k = largeur / img.width;
  const Ms = Math.max(2, Math.round(MARGE / k));
  let cur = document.createElement("canvas");
  cur.width = img.width + 2 * Ms; cur.height = img.height;
  let x = cur.getContext("2d");
  x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high";
  x.drawImage(img, img.width - Ms, 0, Ms, img.height, 0, 0, Ms, img.height);
  x.drawImage(img, Ms, 0, img.width, img.height);
  x.drawImage(img, 0, 0, Ms, img.height, Ms + img.width, 0, Ms, img.height);
  const cible = largeur + 2 * MARGE;
  while (cur.width / 2 >= cible) {
    const c = document.createElement("canvas");
    c.width = Math.round(cur.width / 2); c.height = Math.round(cur.height / 2);
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
    g.drawImage(cur, 0, 0, c.width, c.height);
    cur = c;
  }
  const out = document.createElement("canvas");
  out.width = largeur; out.height = Math.round(largeur / 2);
  const o = out.getContext("2d");
  o.imageSmoothingEnabled = true; o.imageSmoothingQuality = "high";
  const ech = (largeur + 2 * MARGE) / cur.width;
  o.drawImage(cur, -MARGE, 0, cur.width * ech, cur.height * ech);
  return out;
};
window.__couture = function (c) {
  const x = c.getContext("2d");
  const g = x.getImageData(0, 0, 1, c.height).data;
  const d = x.getImageData(c.width - 1, 0, 1, c.height).data;
  let max = 0;
  for (let i = 0; i < g.length; i += 4)
    max = Math.max(max, Math.abs(g[i]-d[i]), Math.abs(g[i+1]-d[i+1]), Math.abs(g[i+2]-d[i+2]));
  return max;
};
window.__charger = function (dataUrl) {
  return new Promise((ok, non) => {
    const im = new Image();
    im.onload = () => ok(im); im.onerror = non; im.src = dataUrl;
  });
};`
});

const bilan = [];
for (const s of aFaire) {
  const jpg = path.join(CACHE, s.slug + ".jpg");
  const dataUrl = "data:image/jpeg;base64," + fs.readFileSync(jpg).toString("base64");
  const res = await page.evaluate(async ({ dataUrl, tailles, q }) => {
    const im = await window.__charger(dataUrl);
    const out = { source: im.width + "x" + im.height, images: {}, coutures: {} };
    for (const t of tailles) {
      const c = window.__reduire(im, t.larg);
      out.images[t.suffixe] = c.toDataURL("image/webp", q);
      out.coutures[t.suffixe] = window.__couture(c);
    }
    return out;
  }, { dataUrl, tailles: s.manquants, q: s.q || QUALITE });

  const poids = {};
  for (const t of s.manquants) {
    const cible = path.join(SORTIE, s.id + t.suffixe + ".webp");
    if (fs.existsSync(cible)) { console.log("  ! " + path.basename(cible) + " est apparu entre-temps — NON ecrase"); continue; }
    const b64 = res.images[t.suffixe];
    const buf = Buffer.from(b64.slice(b64.indexOf(",") + 1), "base64");
    fs.writeFileSync(cible, buf);
    poids[t.suffixe] = Math.round(buf.length / 1024);
  }
  bilan.push({ id: s.id, slug: s.slug, source: res.source, poids, coutures: res.coutures });
  console.log("  " + s.id.padEnd(14) + res.source + " -> " +
    Object.entries(poids).map(([k, v]) => k + " " + v + " Ko").join("  ") +
    "   q " + (s.q || QUALITE) +
    "   couture " + Object.entries(res.coutures).map(([k, v]) => k + ":" + v).join(" "));
}

/* ------------------------------------------------------------
   LES PANORAMAS DEPOSES A LA MAIN
   Tout fichier pose dans `images/tour/source/` est mis au format,
   quelle que soit sa taille d'origine, du moment qu'il est en 2:1.
   Meme regle qu'ailleurs : rien n'est jamais ecrase.
   ------------------------------------------------------------ */
const deposes = fs.readdirSync(DEPOT)
  .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
  .map(f => ({ fichier: f, id: f.replace(/\.[^.]+$/, "").toLowerCase() }));

if (deposes.length) {
  console.log("\n--- panoramas deposes dans images/tour/source/ ---");
  for (const d of deposes) {
    const manquants = TAILLES.filter(t => !fs.existsSync(path.join(SORTIE, d.id + t.suffixe + ".webp")));
    if (!manquants.length) {
      console.log("· " + d.id.padEnd(16) + "NON TRAITE : " + d.id + "-4k.webp et " + d.id +
        "-2k.webp existent deja.\n" + " ".repeat(18) +
        "Pour les remplacer, deplacez d'abord les deux anciens, puis relancez.");
      continue;
    }

    const buf = fs.readFileSync(path.join(DEPOT, d.fichier));
    const mime = /\.png$/i.test(d.fichier) ? "image/png" : /\.webp$/i.test(d.fichier) ? "image/webp" : "image/jpeg";
    const res = await page.evaluate(async ({ data, tailles, q }) => {
      const im = await window.__charger(data);
      const out = { w: im.width, h: im.height, images: {}, coutures: {} };
      for (const t of tailles) {
        const c = window.__reduire(im, t.larg);
        out.images[t.suffixe] = c.toDataURL("image/webp", q);
        out.coutures[t.suffixe] = window.__couture(c);
      }
      return out;
    }, { data: "data:" + mime + ";base64," + buf.toString("base64"), tailles: manquants, q: QUALITE });

    const ratio = res.w / res.h;
    const alerte = Math.abs(ratio - 2) > 0.005
      ? "  !! RATIO " + ratio.toFixed(3) + " AU LIEU DE 2.000 — ce n'est pas un equirectangulaire"
      : "";
    const poids = {};
    for (const t of manquants) {
      const cible = path.join(SORTIE, d.id + t.suffixe + ".webp");
      if (fs.existsSync(cible)) continue;
      const b64 = res.images[t.suffixe];
      const b = Buffer.from(b64.slice(b64.indexOf(",") + 1), "base64");
      fs.writeFileSync(cible, b);
      poids[t.suffixe] = Math.round(b.length / 1024);
    }
    console.log("· " + d.id.padEnd(16) + res.w + "x" + res.h + " -> " +
      Object.entries(poids).map(([k, v]) => k + " " + v + " Ko").join("  ") +
      "   couture " + Object.entries(res.coutures).map(([k, v]) => k + ":" + v).join(" ") + alerte);
  }
  const vus = new Set(deposes.map(d => d.id));
  const absents = PIECES_ATTENDUES.filter(p => !vus.has(p));
  if (absents.length) console.log("  encore attendues : " + absents.join(", "));
}

/* ------------------------------------------------------------
   L'AFFICHE DE LA SECTION
   Un recadrage plat d'un equirectangulaire courbe tout : les
   verticales partent en tonneau et l'image trahit la projection.
   On fait donc une vraie reprojection gnomonique — la meme que
   celle du viewer — au cadrage d'ouverture de la PIECE D'ENTREE.
   L'affiche EST alors la premiere image de la visite, pas une
   illustration a cote.

   La piece d'entree est la terrasse : `js/tour360.js` la place en
   tete de `PIECES`, et Pannellum ouvre sur `PIECES[0].id`. Les trois
   valeurs ci-dessous doivent donc rester egales au cadrage de la
   terrasse dans ce fichier-la (yaw -45 / pitch -5). Si l'une bouge,
   l'autre bouge.
   ------------------------------------------------------------ */
const AFFICHE = path.join(SORTIE, "poster.webp");
if (fs.existsSync(AFFICHE)) {
  console.log("\n· poster.webp deja present — on n'y touche pas");
} else {
  const src = path.join(SORTIE, "terrasse-4k.webp");
  if (!fs.existsSync(src)) {
    console.log("\n! terrasse-4k.webp absent : affiche non produite");
  } else {
    const data = "data:image/webp;base64," + fs.readFileSync(src).toString("base64");
    const png = await page.evaluate(async ({ data, yaw, pitch, hfov, W, H, q }) => {
      const im = await window.__charger(data);
      const s = document.createElement("canvas");
      s.width = im.width; s.height = im.height;
      s.getContext("2d").drawImage(im, 0, 0);
      const sd = s.getContext("2d").getImageData(0, 0, im.width, im.height).data;

      const out = document.createElement("canvas");
      out.width = W; out.height = H;
      const oc = out.getContext("2d");
      const od = oc.createImageData(W, H);

      const R = Math.PI / 180;
      const f = (W / 2) / Math.tan(hfov / 2 * R);
      const cy = Math.cos(yaw * R), sy = Math.sin(yaw * R);
      const cp = Math.cos(pitch * R), sp = Math.sin(pitch * R);

      for (let py = 0; py < H; py++) {
        for (let px = 0; px < W; px++) {
          /* rayon camera : elle vise -Z, comme dans le viewer */
          let x = px - W / 2, y = -(py - H / 2), z = -f;
          /* tangage autour de X, puis lacet autour de Y */
          let y2 = y * cp - z * sp, z2 = y * sp + z * cp;
          const dx = x * cy + z2 * sy;
          const dz = -x * sy + z2 * cy;
          const n = Math.hypot(dx, y2, dz);
          const lon = Math.atan2(dx / n, -dz / n);
          const lat = Math.asin(y2 / n);

          const u = (0.5 + lon / (2 * Math.PI)) * im.width;
          const v = (0.5 - lat / Math.PI) * im.height;
          /* bilineaire, avec bouclage en u : l'image est cyclique */
          const u0 = Math.floor(u), v0 = Math.min(im.height - 1, Math.max(0, Math.floor(v)));
          const fu = u - u0, fv = v - v0;
          const u1 = ((u0 + 1) % im.width + im.width) % im.width;
          const uu = ((u0 % im.width) + im.width) % im.width;
          const v1 = Math.min(im.height - 1, v0 + 1);
          const k = (py * W + px) * 4;
          for (let c = 0; c < 3; c++) {
            const a = sd[(v0 * im.width + uu) * 4 + c], b = sd[(v0 * im.width + u1) * 4 + c];
            const d2 = sd[(v1 * im.width + uu) * 4 + c], e = sd[(v1 * im.width + u1) * 4 + c];
            od.data[k + c] = (a + (b - a) * fu) * (1 - fv) + (d2 + (e - d2) * fu) * fv;
          }
          od.data[k + 3] = 255;
        }
      }
      oc.putImageData(od, 0, 0);
      return out.toDataURL("image/webp", q);
      /* q 0.78 et non 0.8 : a 0.8 l'affiche pesait 81 Ko et faisait
         passer la section a 81 Ko AVANT le clic, juste au-dessus du
         budget de 80 Ko. Mesure refaite a chaque changement par
         `node tools/tour-verif.mjs`. */
    }, { data, yaw: -45, pitch: -5, hfov: 100, W: AFFICHE_L, H: AFFICHE_H, q: AFFICHE_Q });

    const buf = Buffer.from(png.slice(png.indexOf(",") + 1), "base64");
    fs.writeFileSync(AFFICHE, buf);
    console.log("\n· poster.webp  " + AFFICHE_L + "x" + AFFICHE_H + "  " + Math.round(buf.length / 1024) + " Ko" +
      "  (reprojection gnomonique de la terrasse, yaw -45 / pitch -5 / hfov 100, q " + AFFICHE_Q + ")");
  }
}

await nav.close();
console.log("\nconsole : " + (erreurs.length ? erreurs.join("\n") : "0 erreur"));
console.log("Panoramas Poly Haven, CC0 (domaine public), https://polyhaven.com/license");
console.log("Lythwood Lodge, Lidgetton, KwaZulu-Natal. Auteur : Greg Zaal.");
void bilan;
