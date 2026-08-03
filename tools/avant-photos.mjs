/* ============================================================
   LES PHOTOGRAPHIES DES RECONSTITUTIONS « AVANT »
   `node tools/avant-photos.mjs [--forcer]`
   Pour choisir un cadrage a l'oeil avant de l'ecrire ici :
   `node tools/secteurs-photos.mjs --planche ph:<slug>` — les deux
   outils partagent le meme noyau, donc la planche vaut pour l'un
   comme pour l'autre.

   Outil de FABRICATION. Il ne tourne jamais chez le visiteur.

   POURQUOI IL EXISTE
   Les quatre reconstitutions « avant » portaient 24 rectangles gris
   a la place de leurs photographies. C'etait defendu comme du
   contenu d'epoque : un site de 2011 et un gabarit achete ont des
   blocs photo generiques. Le proprietaire a tranche le 2026-07-31 :
   il les lit comme des PLACEHOLDERS, pas comme de l'epoque. Et il a
   raison — un « avant » incomplet ne prouve pas que le vieux site
   etait mauvais, il donne l'impression que le travail n'est pas
   fini. Dans une section dont le sujet est la preuve, c'est le pire
   endroit possible pour un carre vide.

   CE QU'IL PRODUIT
   Huit fichiers dans `images/realisations/`, un par famille de
   blocs. Chacun est une COLONNE de tuiles de taille egale : le CSS
   n'a besoin que de `background-size: 100% <N>00%` et d'un
   `background-position` par rang. Une colonne plutot que huit
   fichiers separes, parce que 24 photographies feraient 24 requetes
   pour 24 vignettes de 64 px.

   LES SOURCES ET LEUR LICENCE
   Tout vient de Poly Haven (CC0, domaine public) ou de Pexels
   (licence gratuite, usage commercial, modification permise,
   attribution non exigee), et le tableau en fin de fichier porte
   l'adresse de chaque piece. Aucune marque, aucun visage
   identifiable, aucun logo. Meme regle que `secteurs-photos.mjs`,
   dont ce fichier partage le noyau de traitement.

   LA REGLE DE SURETE, LA MEME QU'AILLEURS
   IL N'ECRASE JAMAIS sans `--forcer`. Une version precedente d'un
   outil voisin a ecrase cinq panoramas sans retour possible.
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
const SORTIE = path.join(RACINE, "images/realisations");
const CACHE = path.join(os.tmpdir(), "aped-secteurs-src");
const PLANCHES = path.join(ICI, "_planches");
fs.mkdirSync(CACHE, { recursive: true });
fs.mkdirSync(SORTIE, { recursive: true });

const FORCER = process.argv.includes("--forcer");
const TRAVAIL = 3072;

const LIC_PH = "https://polyhaven.com/license";
const LIC_PEXELS = "https://www.pexels.com/license/";
const PX = "https://images.pexels.com/photos";
const GRAND = "?auto=compress&cs=tinysrgb&w=1920";

/* ------------------------------------------------------------
   LES HUIT COLONNES
   `larg` x `haut` est la taille d'UNE tuile, en pixels de sortie —
   environ le double de sa taille d'affichage la plus grande, le
   cadre d'une comparaison ne depassant pas 480 px de large.
   Pour un `ph:` on donne lacet, tangage et champ ; pour un `url:`
   une fenetre de recadrage en fractions de l'image.
   ------------------------------------------------------------ */
/* CHAQUE CADRAGE A ETE CHOISI SUR PLANCHE-CONTACT, PAS AU HASARD.
   `node tools/secteurs-photos.mjs --planche ph:<slug>` sort les huit
   lacets d'un panorama cote a cote et etiquetes. Ce qui suit porte,
   quand il y a eu un ecarte, la raison de l'ecart.
   `bande` : hauteur de RENDU avant recadrage central. Une tuile tres
   large (un bandeau de 6,3:1) rendue directement en gnomonique donne
   une fente : le champ HORIZONTAL fixe le champ vertical, et a 760 x
   120 il ne reste que quelques degres de haut. On rend donc une vue
   de camera normale, puis on prend sa bande centrale. */
const COLONNES = [
  {
    fichier: "avant-garage", larg: 400, haut: 157, q: 0.74,
    /* Le seul bloc photo du site de 2011 : un atelier en service.
       ECARTE : `ph:auto_service`, le seul atelier de Poly Haven —
       c'est une remise rurale a l'abandon, murs de beton nus et
       etabli couvert de bric-a-brac. Un garage de 2011 au Quebec
       n'a pas cette tete, et l'image aurait dit « garage douteux »
       la ou le texte dit « depuis 1989 ». */
    tuiles: [
      { src: "url:" + PX + "/33814734/pexels-photo-33814734.jpeg" + GRAND, page: "https://www.pexels.com/photo/car-repair-and-maintenance-workshop-interior-33814734/", licence: LIC_PEXELS, fen: { x: 0.05, y: 0.16, w: 0.90 } }
    ]
  },
  {
    fichier: "avant-design", larg: 140, haut: 140, q: 0.76,
    /* Les six vignettes de la fiche d'annuaire. Six interieurs
       DIFFERENTS : c'est un repertoire, chaque entreprise y met sa
       propre photo. Toutes habitees — un interieur vide se lit
       comme un chantier, pas comme du design.
       ECARTE : `ph:fireplace` (piece sombre a dominante jaune, elle
       lit « logement fatigue »), `ph:solitude_interior` (un cloitre
       vide), `ph:studio_kominka_01` (un studio photo, donc du
       materiel et pas une piece), `ph:kiara_interior` (un meuble de
       location — il sert au gabarit de renovation, pas ici). */
    tuiles: [
      { src: "ph:relax_inn_seaview_suite", page: "https://polyhaven.com/a/relax_inn_seaview_suite", licence: LIC_PH, yaw: 225, pitch: -8, hfov: 80, bande: 105 },
      { src: "ph:wooden_lounge", page: "https://polyhaven.com/a/wooden_lounge", licence: LIC_PH, yaw: 0, pitch: -8, hfov: 80, bande: 105 },
      { src: "ph:lythwood_room", page: "https://polyhaven.com/a/lythwood_room", licence: LIC_PH, yaw: 150, pitch: -8, hfov: 80, bande: 105 },
      { src: "ph:hotel_room", page: "https://polyhaven.com/a/hotel_room", licence: LIC_PH, yaw: 225, pitch: -8, hfov: 80, bande: 105 },
      { src: "ph:relax_inn_seaview_suite", page: "https://polyhaven.com/a/relax_inn_seaview_suite", licence: LIC_PH, yaw: 135, pitch: -8, hfov: 80, bande: 105 },
      { src: "ph:modern_bathroom", page: "https://polyhaven.com/a/modern_bathroom", licence: LIC_PH, yaw: 180, pitch: -8, hfov: 80, bande: 105 }
    ]
  },
  {
    fichier: "avant-resto-ban", larg: 760, haut: 120, q: 0.74,
    /* La banniere heritee de la CATEGORIE, pas de l'etablissement :
       la legende sous l'image le dit elle-meme. Une salle a manger
       d'auberge, donc — et pas l'assiette du restaurant en fiche. */
    tuiles: [
      { src: "ph:bush_restaurant", page: "https://polyhaven.com/a/bush_restaurant", licence: LIC_PH, yaw: 270, pitch: -4, hfov: 78, bande: 420 }
    ]
  },
  {
    fichier: "avant-resto-vig", larg: 200, haut: 88, q: 0.75,
    /* Les quatre « autres etablissements de la categorie ». Quatre
       SALLES, pas quatre assiettes : un annuaire montre le lieu.
       ECARTE : `ph:newman_cafeteria` — a 300 degres le cadre tombe
       sur un mur de CASIERS. Vu a l'image, pas devine. */
    tuiles: [
      { src: "ph:comfy_cafe", page: "https://polyhaven.com/a/comfy_cafe", licence: LIC_PH, yaw: 40, pitch: -4, hfov: 82, bande: 140 },
      { src: "ph:warm_bar", page: "https://polyhaven.com/a/warm_bar", licence: LIC_PH, yaw: 160, pitch: -4, hfov: 82, bande: 140 },
      { src: "ph:warm_restaurant", page: "https://polyhaven.com/a/warm_restaurant", licence: LIC_PH, yaw: 180, pitch: -5, hfov: 82, bande: 140 },
      { src: "ph:warm_restaurant_night", page: "https://polyhaven.com/a/warm_restaurant_night", licence: LIC_PH, yaw: 90, pitch: -4, hfov: 82, bande: 140 }
    ]
  },
  {
    fichier: "avant-renov-ban", larg: 760, haut: 289, q: 0.74,
    /* Le carrousel du gabarit achete, sous « Deneigement residentiel
       et commercial a Shawinigan ». Une lame orange qui pousse un
       andain devant un tracteur : c'est la seule image du bloc qui
       dise « deneigement » sans sa legende, et c'est une photographie
       EXTERIEURE — aucun panorama d'interieur ne peut la rendre.
       ECARTE : un camion de deneigement porte presque toujours un
       nom, lu a la loupe et pas devine. `#35030432` (sceau « NORTH
       STRABANE TOWNSHIP » sur la portiere), `#20088977` (« William
       A. Gerhardt » et un numero de telephone peints sur la caisse),
       `#10664763` (« TOWMASTER » sur la benne), `#14531981` et
       `#15454405` (« epoke · VIRTUS MINI AST » en clair). */
    tuiles: [
      { src: "url:" + PX + "/27306437/pexels-photo-27306437.jpeg" + GRAND, page: "https://www.pexels.com/photo/snow-clearing-27306437/", licence: LIC_PEXELS, fen: { x: 0, y: 0.02, w: 1 } }
    ]
  },
  {
    fichier: "avant-renov-apropos", larg: 340, haut: 198, q: 0.75,
    /* Le bloc « Qui sommes-nous ? ». Le tracteur chargeur sous la
       neige, porte de garage au fond : le gabarit y met toujours
       « l'equipe au travail », et une photo sans visage est la seule
       qu'on puisse publier.
       ECARTE : `#35826504` (une flotte de camions de nuit — plaques
       d'immatriculation lisibles et « HENKE » sur une lame, deux
       motifs pour un), `#10948893` (un ecusson colle sur la cabine),
       `#30836355` (le nom du constructeur en clair sur le chargeur). */
    tuiles: [
      { src: "url:" + PX + "/11680712/pexels-photo-11680712.jpeg" + GRAND, page: "https://www.pexels.com/photo/green-and-orange-snow-tractor-on-snow-covered-ground-11680712/", licence: LIC_PEXELS, fen: { x: 0.40, y: 0.28, w: 0.60 } }
    ]
  },
  {
    fichier: "avant-renov-svc", larg: 280, haut: 92, q: 0.75,
    /* Les six cartes de « Nos services », dans l'ordre des legendes :
       deneigement residentiel, deneigement commercial, deneigement de
       toiture, epandage d'abrasifs, tonte de pelouse, ouverture et
       fermeture de terrain. Les deux dernieres sont ESTIVALES — c'est
       voulu, l'entreprise fait les deux saisons, et le vert contre le
       blanc coupe le bloc en deux moities lisibles d'un coup d'oeil.
       A 92 px de haut il faut un sujet qui tienne en une forme et
       deux couleurs : pelle rouge, lame orange, silhouette sur un
       faite, veste orange, tondeuse rouge, rateau orange.
       ECARTE : `#30731980` (« BRIGGS & STRATTON » en clair sur le
       moteur de la souffleuse), `#35826495` et `#30090823` (le
       recadrage sortait « GENGRAS » du champ mais laissait entrer
       « FISHER », et « Winterdienst · epoke » sur l'autre),
       `#11108148` (un bidon « MORTON ICE MELT » ET le numero civique
       215 sur la maison, deux motifs pour un). */
    tuiles: [
      { src: "url:" + PX + "/6952498/pexels-photo-6952498.jpeg" + GRAND, page: "https://www.pexels.com/photo/photo-of-a-person-in-a-blue-jacket-shoveling-white-snow-6952498/", licence: LIC_PEXELS, fen: { x: 0, y: 0.32, w: 1 } },
      { src: "url:" + PX + "/27306405/pexels-photo-27306405.jpeg" + GRAND, page: "https://www.pexels.com/photo/snow-clearing-27306405/", licence: LIC_PEXELS, fen: { x: 0, y: 0.20, w: 1 } },
      { src: "url:" + PX + "/10739887/pexels-photo-10739887.jpeg" + GRAND, page: "https://www.pexels.com/photo/man-clearing-snow-from-a-house-roof-10739887/", licence: LIC_PEXELS, fen: { x: 0.02, y: 0.25, w: 0.62 } },
      { src: "url:" + PX + "/27306417/pexels-photo-27306417.jpeg" + GRAND, page: "https://www.pexels.com/photo/snow-clearing-27306417/", licence: LIC_PEXELS, fen: { x: 0, y: 0.06, w: 1 } },
      { src: "url:" + PX + "/4162016/pexels-photo-4162016.jpeg" + GRAND, page: "https://www.pexels.com/photo/red-and-black-push-lawn-mower-on-green-grass-4162016/", licence: LIC_PEXELS, fen: { x: 0, y: 0.22, w: 1 } },
      { src: "url:" + PX + "/8116107/pexels-photo-8116107.jpeg" + GRAND, page: "https://www.pexels.com/photo/orange-leaf-rake-on-green-grass-8116107/", licence: LIC_PEXELS, fen: { x: 0, y: 0.48, w: 1 } }
    ]
  },
  {
    fichier: "avant-renov-real", larg: 280, haut: 105, q: 0.75,
    /* Les six vignettes de « Nos realisations » — entree
       residentielle, stationnement commercial, entree double, aire de
       chargement, toiture, entree en pente. Elles suivent les six
       legendes, dans l'ordre. Le bloc montre le RESULTAT quand les
       cartes de services montrent le geste : ici des surfaces
       degagees, pas des machines.
       ECARTE : `#36201561` (une enseigne « KLATT · CUDAHY, WI » et un
       « NO PARKING » avec un numero de telephone sur le quai),
       `#30180552` (« SPEEDMart » sur la facade), `#34283402` (un
       panneau d'affichage de village a l'entree de l'allee),
       `#11034690` (l'ecusson et la plaque d'une voiture au premier
       plan), `#3375371` (le nom d'un armateur sur un conteneur). */
    tuiles: [
      { src: "url:" + PX + "/24038128/pexels-photo-24038128.jpeg" + GRAND, page: "https://www.pexels.com/photo/snow-covered-street-at-dusk-24038128/", licence: LIC_PEXELS, fen: { x: 0, y: 0.30, w: 1 } },
      { src: "url:" + PX + "/30180555/pexels-photo-30180555.jpeg" + GRAND, page: "https://www.pexels.com/photo/snowy-parking-lot-with-tire-tracks-from-above-30180555/", licence: LIC_PEXELS, fen: { x: 0, y: 0.18, w: 1 } },
      { src: "url:" + PX + "/4061591/pexels-photo-4061591.jpeg" + GRAND, page: "https://www.pexels.com/photo/empty-road-leading-to-suburb-house-4061591/", licence: LIC_PEXELS, fen: { x: 0, y: 0.30, w: 1 } },
      { src: "url:" + PX + "/6936558/pexels-photo-6936558.jpeg" + GRAND, page: "https://www.pexels.com/photo/aerial-shot-of-parked-container-trucks-6936558/", licence: LIC_PEXELS, fen: { x: 0, y: 0.20, w: 1 } },
      { src: "url:" + PX + "/30282409/pexels-photo-30282409.jpeg" + GRAND, page: "https://www.pexels.com/photo/snow-covered-roof-with-icicles-in-winter-30282409/", licence: LIC_PEXELS, fen: { x: 0, y: 0.22, w: 1 } },
      { src: "url:" + PX + "/6397442/pexels-photo-6397442.jpeg" + GRAND, page: "https://www.pexels.com/photo/snowy-pathway-among-tall-trees-6397442/", licence: LIC_PEXELS, fen: { x: 0, y: 0.42, w: 1 } }
    ]
  }
];

/* ------------------------------------------------------------ */
const j = (u) => new Promise((ok, no) => {
  https.get(u, { headers: { "user-agent": "aped-avant-photos" } }, (r) => {
    let d = ""; r.on("data", (c) => (d += c)); r.on("end", () => { try { ok(JSON.parse(d)); } catch (e) { no(new Error(d.slice(0, 200))); } });
  }).on("error", no);
});

function telecharger(url, dest) {
  return new Promise((ok, non) => {
    if (fs.existsSync(dest)) return ok(false);
    const f = fs.createWriteStream(dest + ".part");
    const suivre = (u) => https.get(u, { headers: { "user-agent": "Mozilla/5.0 (compatible; aped-avant-photos)" } }, (r) => {
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
  if (/\.webp$/i.test(p)) return "image/webp";
  if (/\.img$/i.test(p)) {
    const b = fs.readFileSync(p, { start: 0, end: 12 });
    if (b[0] === 0x89 && b[1] === 0x50) return "image/png";
    if (b.slice(8, 12).toString() === "WEBP") return "image/webp";
    return "image/jpeg";
  }
  return "image/jpeg";
}
const dataUrl = (p) => "data:" + mime(p) + ";base64," + fs.readFileSync(p).toString("base64");

/* ------------------------------------------------------------ */
const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 600, height: 400 } });
const erreurs = [];
page.on("pageerror", (e) => erreurs.push(String(e)));
await page.addScriptTag({ content: NOYAU });

/* Compose une colonne de tuiles dans un seul canevas, puis encode. */
await page.evaluate(() => {
  window.__colonne = function (larg, haut, n) {
    const c = document.createElement("canvas");
    c.width = larg; c.height = haut * n;
    window.__c = c; window.__x = c.getContext("2d");
    window.__x.fillStyle = "#8a8f94";
    window.__x.fillRect(0, 0, c.width, c.height);
  };
  /* La vue est rendue a `larg x hRendu` puis on prend sa BANDE
     CENTRALE de `haut` pixels. Sans ca, une tuile tres large rend
     une fente de quelques degres de haut : le champ horizontal
     commande le champ vertical dans une projection gnomonique. */
  window.__poser = function (cv, rang, larg, haut) {
    const y0 = Math.max(0, Math.round((cv.height - haut) / 2));
    window.__x.drawImage(cv, 0, y0, larg, Math.min(haut, cv.height), 0, rang * haut, larg, haut);
  };
  /* UNE TUILE UNIFORME N'EST PAS UNE PHOTOGRAPHIE.  D-614
     Meme regle que partout : un aplat qui part en silence est pire
     qu'un outil qui s'arrete. On mesure chaque tuile a part. */
  window.__mesurer = function (larg, haut, n) {
    const out = [];
    for (let r = 0; r < n; r++) {
      const d = window.__x.getImageData(0, r * haut, larg, haut).data;
      let s = 0, s2 = 0, m = 0;
      for (let i = 0; i < d.length; i += 4 * 7) {
        const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        s += l; s2 += l * l; m++;
      }
      const moy = s / m;
      out.push({ rang: r, moy: +moy.toFixed(1), ec: +Math.sqrt(Math.max(0, s2 / m - moy * moy)).toFixed(1) });
    }
    return out;
  };
});

const R = [];
const REGISTRE = [];
for (const col of COLONNES) {
  const dest = path.join(SORTIE, col.fichier + ".webp");
  if (fs.existsSync(dest) && !FORCER) {
    console.log("·", col.fichier.padEnd(22), "deja present, intact — on n'y touche pas (`--forcer` pour refaire)");
    continue;
  }
  await page.evaluate(({ l, h, n }) => window.__colonne(l, h, n), { l: col.larg, h: col.haut, n: col.tuiles.length });

  let panoCourant = null;
  for (let r = 0; r < col.tuiles.length; r++) {
    const t = col.tuiles[r];
    const fichierSrc = await resoudre(t.src);
    if (t.src.startsWith("ph:")) {
      if (panoCourant !== t.src) {
        await page.evaluate(async ({ d, L }) => window.__prep(d, L), { d: dataUrl(fichierSrc), L: TRAVAIL });
        panoCourant = t.src;
      }
      await page.evaluate(({ yaw, pitch, hfov, W, H, HR, rang }) => {
        const cv = window.__vue(window.__sd, window.__sw, window.__sh, yaw, pitch, hfov, W, HR);
        window.__poser(cv, rang, W, H);
      }, { yaw: t.yaw, pitch: t.pitch, hfov: t.hfov, W: col.larg, H: col.haut, HR: Math.max(col.haut, t.bande || col.haut), rang: r });
    } else {
      await page.evaluate(async ({ d, fen, W, H, rang }) => {
        const res = await window.__plat(d, fen, W, H, 1);
        const im = await window.__charger(res.data);
        window.__x.drawImage(im, 0, rang * H, W, H);
      }, { d: dataUrl(fichierSrc), fen: t.fen, W: col.larg, H: col.haut, rang: r });
      panoCourant = null;
    }
    REGISTRE.push({ colonne: col.fichier, rang: r, source: t.src, page: t.page, licence: t.licence });
  }

  const mesures = await page.evaluate(({ l, h, n }) => window.__mesurer(l, h, n), { l: col.larg, h: col.haut, n: col.tuiles.length });
  const plate = mesures.find((m) => m.ec < 8);
  if (plate) {
    throw new Error(`${col.fichier} : la tuile ${plate.rang} est PLATE (ecart-type ${plate.ec}, moyenne ${plate.moy}). ` +
      "C'est un aplat, pas une photographie. Corriger le cadrage avant de livrer.");
  }
  const url = await page.evaluate((q) => window.__c.toDataURL("image/webp", q), col.q);
  if (url.indexOf("data:image/webp") !== 0) throw new Error("le moteur n'a pas encode en WebP");
  const bin = Buffer.from(url.split(",")[1], "base64");
  fs.writeFileSync(dest, bin);
  R.push({
    fichier: col.fichier, tuiles: col.tuiles.length, tuile: `${col.larg}x${col.haut}`,
    rendu: `${col.larg}x${col.haut * col.tuiles.length}`, ko: Math.round(bin.length / 1024),
    ecMin: Math.min(...mesures.map((m) => m.ec))
  });
}

await nav.close();
if (R.length) console.table(R);
console.log("TOTAL :", R.reduce((a, b) => a + b.ko, 0), "Ko pour", R.length, "colonnes");
if (erreurs.length) console.log("ERREURS PAGE :", erreurs);
fs.writeFileSync(path.join(ICI, "_demos", "_avant-photos-registre.json"), JSON.stringify(REGISTRE, null, 1));

/* ============================================================
   LICENCES DES SOURCES RETENUES

   POLY HAVEN — CC0, domaine public. Aucune attribution exigee,
   usage commercial et modification autorises. `https://polyhaven.com/license`
     lythwood_room · relax_inn_seaview_suite · wooden_lounge ·
     hotel_room · modern_bathroom · bush_restaurant · comfy_cafe ·
     warm_bar · warm_restaurant · warm_restaurant_night

   PEXELS — licence gratuite : usage commercial, modification
   permise, attribution non exigee. `https://www.pexels.com/license/`
     #33814734 — atelier de reparation automobile
     #27306437 — lame orange poussant un andain, rue degagee
     #11680712 — tracteur chargeur sous la neige, devant un garage
     #6952498  — pelletage d'une allee pavee, pelle rouge
     #27306405 — lame de chargeur et banc de neige devant un commerce
     #10739887 — deneigement du faite d'une maison de brique
     #27306417 — neige chargee d'abrasifs pelletee, veste orange
     #4162016  — tondeuse rouge sur une pelouse verte
     #8116107  — rateau a feuilles orange sur une pelouse verte
     #24038128 — rue residentielle enneigee au crepuscule, garages
     #30180555 — stationnement deneige vu du ciel, traces de pneus
     #4061591  — garage double et entree d'asphalte degagee
     #6936558  — cour a semi-remorques deneigee, vue du ciel
     #30282409 — neige et glacons au bord d'une toiture
     #6397442  — chemin degage montant entre deux bancs de neige

   AUCUNE des vingt-cinq pieces ne porte de marque lisible, de logo,
   de plaque d'immatriculation, de numero civique ni de visage
   identifiable. Chaque tuile a ete OUVERTE en pleine resolution et
   regardee avant d'etre retenue : c'est ce critere, et lui seul, qui
   a ecarte la douzaine de camions de deneigement listes plus haut —
   un vehicule de chantier porte presque toujours un nom.
   ============================================================ */
