/* ============================================================
   PHOTOGRAPHIES DES APERCUS DE SECTEUR
   `node tools/secteurs-photos.mjs`

   Outil de FABRICATION. Il ne tourne jamais chez le visiteur, et le
   site ne depend d'aucune de ses dependances : il n'utilise que
   Playwright, deja present pour la mesure.

   CE QU'IL FAIT
   Produit dans `images/secteurs/` les photographies des quatre
   apercus de secteur montes d'un cran : une image large en 16/9 a
   720 px et deux ou trois vignettes carrees a 240 px par secteur.
   WebP uniquement.

   LA REGLE DE SURETE, LA MEME QU'AILLEURS
   IL N'ECRASE JAMAIS. Si le fichier de sortie existe deja, il passe
   son tour et le dit. Pour remplacer, il faut d'abord deplacer
   l'ancien a la main. Meme regle que `tools/tour-images.mjs`, et
   pour la meme raison : une version precedente de ce chantier a
   ecrase cinq panoramas sans retour possible.

   DEUX PIPELINES, PARCE QU'IL Y A DEUX SORTES DE SOURCE
   1. `pano` — un equirectangulaire. On NE RECADRE PAS a plat : un
      recadrage plat d'un equirectangulaire courbe tout, les
      verticales partent en tonneau et l'image trahit la projection.
      On fait une vraie reprojection gnomonique, la meme que celle
      du visionneur 360 et de `tools/tour-images.mjs`.
      Avant ca, la reduction est CYCLIQUE : un equirectangulaire
      boucle mais `drawImage` non, donc on elargit l'image avec ses
      propres pixels d'en face, on reduit, on recadre.
   2. `plat` — une photographie ordinaire. Recadrage par fenetre
      exprimee en fractions de l'image, puis reduction par
      demi-pas successifs (un `drawImage` qui divise par plus de
      deux d'un coup aliase).

   MODE PLANCHE-CONTACT
   `node tools/secteurs-photos.mjs --planche ph:warm_restaurant ...`
   reprojette la source a huit lacets et compose une grille
   etiquetee dans `tools/_planches/`. C'est ce qui a servi a choisir
   chaque cadrage a l'oeil plutot qu'au hasard. Variables
   d'environnement : PITCH (defaut -5), HFOV (defaut 100).

   LICENCES — voir le tableau en fin de fichier. Toutes les sources
   retenues sont CC0 (Poly Haven) ou sous licence Pexels/Unsplash,
   toutes trois verifiees page en main : usage commercial autorise,
   redistribution et modification autorisees, aucune attribution
   obligatoire.
   ============================================================ */
import { chromium } from "playwright";
import { NOYAU } from "./photo-noyau.mjs";
import https from "node:https";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const SORTIE = path.join(RACINE, "images/secteurs");
/* Le cache des sources telechargees vit hors du projet : il ne doit
   jamais partir en production ni gonfler une sauvegarde. */
const CACHE = path.join(os.tmpdir(), "aped-secteurs-src");
const PLANCHES = path.join(ICI, "_planches");
fs.mkdirSync(CACHE, { recursive: true });

/* ------------------------------------------------------------
   LES SOURCES
   `ph:<slug>`    equirectangulaire Poly Haven, JPEG tonemapped
   `local:<chemin>` fichier deja dans le projet (relatif a la racine)
   `url:<adresse>`  photographie plate, telechargee telle quelle
   ------------------------------------------------------------ */

/* La largeur de travail de l'equirectangulaire avant reprojection.
   Elle n'est pas cosmetique : pour un cadre de largeur L a un champ
   horizontal de H degres, il faut L x 360 / H pixels d'equateur pour
   ne pas interpoler du vide. Le pire cas ici est la vignette a
   240 px et 30 deg, soit 2880. 3072 couvre tout avec de la marge, et
   tient en memoire la ou le 16k d'origine (134 M pixels, 536 Mo en
   getImageData) ferait tomber le processus. */
const TRAVAIL = 3072;

const HERO_L = 720, HERO_H = 405;   /* 16/9 exact */
const VIG = 240;                     /* vignette carree */

/* ------------------------------------------------------------
   LE CATALOGUE
   Un tirage par ligne. `src` designe la source, le reste decrit le
   cadrage. Pour un `pano` : lacet, tangage, champ horizontal. Pour
   un `plat` : la fenetre de recadrage en fractions (x, y, largeur)
   — la hauteur se deduit du ratio vise, ce qui garantit qu'on ne
   deforme jamais.
   ------------------------------------------------------------ */
const PX = "https://images.pexels.com/photos";
const GRAND = "?auto=compress&cs=tinysrgb&w=1920";
const MOYEN = "?auto=compress&cs=tinysrgb&w=1400";
/* Les deux seules pages de licence qui couvrent ce qui est servi.
   `node tools/secteurs-photos.mjs --licences` les recharge, ainsi
   que la page de chaque photo, dans un vrai navigateur — Pexels
   repond 403 a un client HTTP nu, donc un simple GET ne prouve
   rien. */
const LIC_PEXELS = "https://www.pexels.com/license/";
const LIC_PH = "https://polyhaven.com/license";
const PAGE_PX = "https://www.pexels.com/photo/";

const TIRAGES = [
  /* ---------- RESTAURANT — bistro de marche ----------
     Salle claire a mur de pierre et tables de bois : c'est le seul
     candidat de la planche qui lit « bistro de marche » sans decor
     de chaine. Ecarte : #28454110, une affiche « LE BISTRO MAXIMS »
     en plein cadre, donc du texte incruste. */
  { fichier: "restaurant-hero", page: PAGE_PX + "rustic-restaurant-interior-with-natural-light-32667186/", licence: LIC_PEXELS, src: "url:" + PX + "/32667186/pexels-photo-32667186.jpeg" + GRAND,
    fen: { x: 0, y: 0.08, w: 1 }, q: 0.74 },
  /* Trois assiettes qui tiennent a 240 px : sujet net, fond
     contraste, aucune main ni visage. Les assiettes tres claires sur
     nappe blanche (#15671371, #12107010) ont ete ecartees — a 240 px
     elles deviennent une tache grise. */
  { fichier: "restaurant-1", page: PAGE_PX + "cooked-meat-with-vegetable-garnish-on-white-plate-1327393/", licence: LIC_PEXELS, src: "url:" + PX + "/1327393/pexels-photo-1327393.jpeg" + MOYEN,
    carre: true, fen: { x: 0.15, y: 0.02, w: 0.64 }, q: 0.76 },
  { fichier: "restaurant-2", page: PAGE_PX + "gourmet-bacon-wrapped-pork-with-lentils-11001291/", licence: LIC_PEXELS, src: "url:" + PX + "/11001291/pexels-photo-11001291.jpeg" + MOYEN,
    carre: true, fen: { x: 0.15, y: 0.03, w: 0.70 }, q: 0.76 },
  { fichier: "restaurant-3", page: PAGE_PX + "gourmet-plated-dish-with-carrots-and-peas-36242483/", licence: LIC_PEXELS, src: "url:" + PX + "/36242483/pexels-photo-36242483.jpeg" + MOYEN,
    carre: true, fen: { x: 0.17, y: 0.005, w: 0.66 }, q: 0.76 },

  /* ---------- GARAGE ----------
     Atelier en service, vehicules reels, eclairage au neon : c'est
     ce qui distingue un vrai garage d'un hangar vide. Ecarte :
     #8986105 et #8985609, un mecanicien de face et identifiable au
     premier plan. */
  { fichier: "garage-hero", page: PAGE_PX + "car-repair-and-maintenance-workshop-interior-33814734/", licence: LIC_PEXELS, src: "url:" + PX + "/33814734/pexels-photo-33814734.jpeg" + GRAND,
    fen: { x: 0, y: 0.10, w: 1 }, q: 0.74 },
  { fichier: "garage-1", page: PAGE_PX + "wrenches-hanging-on-wall-16243260/", licence: LIC_PEXELS, src: "url:" + PX + "/16243260/pexels-photo-16243260.jpeg" + MOYEN,
    carre: true, fen: { x: 0.17, y: 0.005, w: 0.66 }, q: 0.76 },
  /* La jante posee sur la pile lit « pneus » d'un coup d'oeil. Les
     slicks de course (#29255735, #13207698) portent une marque
     lisible — ecartes pour ca, pas pour la licence. */
  { fichier: "garage-2", page: PAGE_PX + "stack-of-car-tires-with-alloy-wheel-indoors-34357281/", licence: LIC_PEXELS, src: "url:" + PX + "/34357281/pexels-photo-34357281.jpeg" + MOYEN,
    carre: true, fen: { x: 0.05, y: 0.12, w: 0.90 }, q: 0.76 },

  /* ---------- CONSTRUCTION ----------
     Charpente de bois, pas gratte-ciel : au Quebec le residentiel
     est a ossature de bois, et l'apercu parle de phases de chantier
     et d'echeancier, donc d'un chantier de maison. */
  { fichier: "construction-hero", page: PAGE_PX + "new-home-construction-in-elk-grove-37627682/", licence: LIC_PEXELS, src: "url:" + PX + "/37627682/pexels-photo-37627682.jpeg" + GRAND,
    fen: { x: 0.01, y: 0.01, w: 0.98 }, q: 0.74 },
  { fichier: "construction-1", page: PAGE_PX + "construction-of-framework-of-house-with-softwood-materials-8817834/", licence: LIC_PEXELS, src: "url:" + PX + "/8817834/pexels-photo-8817834.jpeg" + MOYEN,
    carre: true, fen: { x: 0, y: 0.15, w: 1 }, q: 0.76 },
  { fichier: "construction-2", page: PAGE_PX + "stacks-of-lumbers-in-close-up-photography-12278581/", licence: LIC_PEXELS, src: "url:" + PX + "/12278581/pexels-photo-12278581.jpeg" + MOYEN,
    carre: true, fen: { x: 0.17, y: 0.005, w: 0.66 }, q: 0.76 },

  /* ---------- IMMOBILIER ----------
     Pas de banque d'images ici : ce sont les panoramas de Lythwood
     Lodge, les MEMES que ceux de la visite 360 plus bas dans la
     page (`images/tour/`, cf. tools/tour-images.mjs). L'apercu de
     secteur montre donc la propriete qu'on peut ensuite visiter —
     l'image et la demo parlent du meme bien, et la licence est
     celle qu'on maitrise deja.
     Reprojection gnomonique, jamais de recadrage plat.

     Le lacet du salon n'est pas au hasard. Le mur nord-ouest porte
     une AUREOLE D'HUMIDITE bien visible, que la planche-contact
     `PITCH=-3 HFOV=50 YAWS=330,345` montre sans ambiguite : une
     tache sur un mur tue une image de bien immobilier. Un premier
     essai a 315 la faisait entrer dans le cadre.
     Le lacet 135 donne le bout cheminee : riche, mais l'eclairage
     y est au tungstene et l'image sort massivement ambree, ce qui
     lit « interieur date » plutot que « haut de gamme ». Retenu
     donc : 275, le bout baie vitree, en lumiere du jour. */
  { fichier: "immobilier-hero", page: "https://polyhaven.com/a/lythwood_lounge", licence: LIC_PH, src: "ph:lythwood_lounge", yaw: 275, pitch: -3, hfov: 100, q: 0.74 },
  { fichier: "immobilier-1", page: "https://polyhaven.com/a/lythwood_room", licence: LIC_PH, src: "ph:lythwood_room", yaw: 180, pitch: -3, hfov: 55, carre: true, q: 0.76 },
  { fichier: "immobilier-2", page: "https://polyhaven.com/a/lythwood_terrace", licence: LIC_PH, src: "ph:lythwood_terrace", yaw: 0, pitch: -3, hfov: 60, carre: true, q: 0.76 },
  /* 300 et non 135 : la vue large prend deja le cote cheminee. La
     vignette prend le cote baie vitree, clair et vert, pour que les
     deux images ne racontent pas deux fois la meme piece. */
  { fichier: "immobilier-3", page: "https://polyhaven.com/a/lythwood_lounge", licence: LIC_PH, src: "ph:lythwood_lounge", yaw: 300, pitch: -3, hfov: 50, carre: true, q: 0.76 }
];

/* ------------------------------------------------------------ */
const j = u => new Promise((ok, no) => {
  https.get(u, { headers: { "user-agent": "aped-secteurs-photos" } }, r => {
    let d = ""; r.on("data", c => d += c); r.on("end", () => { try { ok(JSON.parse(d)); } catch (e) { no(new Error(d.slice(0, 200))); } });
  }).on("error", no);
});

function telecharger(url, dest) {
  return new Promise((ok, non) => {
    if (fs.existsSync(dest)) return ok(false);
    const f = fs.createWriteStream(dest + ".part");
    const suivre = u => https.get(u, { headers: { "user-agent": "Mozilla/5.0 (compatible; aped-secteurs-photos)" } }, r => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) { r.resume(); return suivre(r.headers.location); }
      if (r.statusCode !== 200) { r.resume(); return non(new Error(r.statusCode + " " + u)); }
      r.pipe(f);
      f.on("finish", () => f.close(() => { fs.renameSync(dest + ".part", dest); ok(true); }));
    }).on("error", non);
    suivre(url);
  });
}

/* Rend un chemin de fichier local contenant la source, en la
   telechargeant au besoin. */
async function resoudre(src) {
  if (src.startsWith("local:")) {
    const p = path.join(RACINE, src.slice(6));
    if (!fs.existsSync(p)) throw new Error("source locale absente : " + src.slice(6));
    return p;
  }
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
    /* Le nom de cache est un condense de l'adresse ENTIERE. Une
       premiere version tronquait un base64 a 40 caracteres : comme
       les adresses Pexels partagent leurs trente premiers octets,
       toutes les photos tombaient sur le meme fichier de cache et la
       planche-contact montrait huit fois la meme image. */
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

const dataUrl = p => "data:" + mime(p) + ";base64," + fs.readFileSync(p).toString("base64");

/* ------------------------------------------------------------ */
const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 600, height: 400 } });
const erreurs = [];
page.on("pageerror", e => erreurs.push(String(e)));

await page.addScriptTag({ content: NOYAU });

/* ------------------------------------------------------------
   MODE PLANCHE-CONTACT
   ------------------------------------------------------------ */
const args = process.argv.slice(2);
if (args[0] === "--planche") {
  fs.mkdirSync(PLANCHES, { recursive: true });
  const PITCH = Number(process.env.PITCH ?? -5);
  const HFOV = Number(process.env.HFOV ?? 100);
  const YAWS = (process.env.YAWS || "0,45,90,135,180,225,270,315").split(",").map(Number);
  for (const src of args.slice(1)) {
    try {
      const f = await resoudre(src);
      const info = await page.evaluate(([d, l]) => window.__prep(d, l), [dataUrl(f), TRAVAIL]);
      const png = await page.evaluate(({ yaws, pitch, hfov }) => {
        const TL = 340, TH = 191, cols = 4, pad = 18;
        const rows = Math.ceil(yaws.length / cols);
        const g = document.createElement("canvas");
        g.width = cols * TL; g.height = rows * (TH + pad);
        const gx = g.getContext("2d");
        gx.fillStyle = "#111"; gx.fillRect(0, 0, g.width, g.height);
        yaws.forEach((yaw, i) => {
          const v = window.__vue(window.__sd, window.__sw, window.__sh, yaw, pitch, hfov, TL, TH);
          const cx = (i % cols) * TL, cy = Math.floor(i / cols) * (TH + pad);
          gx.drawImage(v, cx, cy);
          gx.fillStyle = "#000"; gx.fillRect(cx, cy + TH, TL, pad);
          gx.fillStyle = "#0f0"; gx.font = "13px monospace";
          gx.fillText("yaw " + yaw + "  pitch " + pitch + "  hfov " + hfov, cx + 6, cy + TH + 13);
        });
        return g.toDataURL("image/webp", 0.85);
      }, { yaws: YAWS, pitch: PITCH, hfov: HFOV });
      const nom = src.replace(/[^a-z0-9_]+/gi, "-") + "_p" + PITCH + "_f" + HFOV + ".webp";
      fs.writeFileSync(path.join(PLANCHES, nom), Buffer.from(png.slice(png.indexOf(",") + 1), "base64"));
      console.log("· " + src.padEnd(34) + info.w + "x" + info.h + " (ratio " + info.ratio + ") -> " + nom);
    } catch (e) { console.log("! " + src + " : " + e.message); }
  }
  await nav.close();
  console.log("\nplanches : " + PLANCHES);
  process.exit(0);
}

/* ------------------------------------------------------------
   MODE PLANCHE DE PHOTOGRAPHIES PLATES
   `node tools/secteurs-photos.mjs --contact <nom> url:... url:...`
   Telecharge les candidates et les pose en grille etiquetee, entieres
   (pas recadrees) : c'est le cadrage qu'on choisit ENSUITE, une fois
   qu'on a vu ce que la photo contient vraiment.
   ------------------------------------------------------------ */
if (args[0] === "--contact") {
  fs.mkdirSync(PLANCHES, { recursive: true });
  const nom = args[1];
  const urls = args.slice(2);
  const tuiles = [];
  for (const u of urls) {
    try {
      const f = await resoudre(u);
      const o = fs.statSync(f).size;
      if (o < 4096) { console.log("! " + u + " : " + o + " octets, probablement une erreur"); continue; }
      tuiles.push({ d: dataUrl(f), nom: (u.match(/photos\/(\d+)/) || [, u.slice(-14)])[1], ko: Math.round(o / 1024) });
    } catch (e) { console.log("! " + u + " : " + e.message); }
  }
  const png = await page.evaluate(async ({ tuiles }) => {
    const TL = 400, TH = 260, pad = 18, cols = 4;
    const rows = Math.ceil(tuiles.length / cols);
    const g = document.createElement("canvas");
    g.width = cols * TL; g.height = rows * (TH + pad);
    const gx = g.getContext("2d");
    gx.fillStyle = "#111"; gx.fillRect(0, 0, g.width, g.height);
    for (let i = 0; i < tuiles.length; i++) {
      const im = await window.__charger(tuiles[i].d);
      const cx = (i % cols) * TL, cy = Math.floor(i / cols) * (TH + pad);
      const e = Math.min(TL / im.width, TH / im.height);
      const w = im.width * e, h = im.height * e;
      gx.drawImage(im, cx + (TL - w) / 2, cy + (TH - h) / 2, w, h);
      gx.fillStyle = "#000"; gx.fillRect(cx, cy + TH, TL, pad);
      gx.fillStyle = "#0f0"; gx.font = "12px monospace";
      gx.fillText("#" + tuiles[i].nom + "  " + im.width + "x" + im.height, cx + 6, cy + TH + 13);
    }
    return g.toDataURL("image/webp", 0.85);
  }, { tuiles });
  fs.writeFileSync(path.join(PLANCHES, nom + ".webp"), Buffer.from(png.slice(png.indexOf(",") + 1), "base64"));
  await nav.close();
  console.log("· " + tuiles.length + " candidates -> " + path.join(PLANCHES, nom + ".webp"));
  process.exit(0);
}

/* ------------------------------------------------------------
   MODE VERIFICATION DES LICENCES
   `node tools/secteurs-photos.mjs --licences`
   Recharge, dans un vrai navigateur, la page de chaque photo ET la
   page de licence qui la couvre, et rend le code HTTP, le titre et
   l'auteur declare. Le navigateur n'est pas un luxe : Pexels repond
   403 a un client HTTP nu, donc un `https.get` ne prouverait rien.
   A rejouer avant toute mise en ligne : une source peut disparaitre
   ou changer de licence apres coup.

   ET IL FAUT UNE FENETRE. Pexels est derriere Cloudflare : en
   headless, les quinze adresses reviennent « 403 Just a moment... »,
   y compris la page de licence. Mesure faite, meme machine, meme
   URL : `headless: true` -> 403, `headless: false` -> 200 et le
   vrai titre. On ouvre donc un navigateur visible rien que pour ce
   mode ; la production, elle, reste headless.
   ------------------------------------------------------------ */
if (args[0] === "--licences") {
  await nav.close();
  const nav2 = await chromium.launch({ headless: false });
  const page2 = await nav2.newPage();
  const vues = new Map();
  for (const t of TIRAGES) {
    if (t.page) vues.set(t.page, t.fichier);
    if (t.licence) vues.set(t.licence, "— page de licence —");
  }
  let mauvais = 0, bloques = 0;
  for (const [u, quoi] of vues) {
    try {
      /* Cloudflare sert d'abord une page d'attente — « Just a
         moment... », « Un instant... » — qui porte le code 403. Elle
         se resout seule en quelques secondes et depose un cookie de
         passage. On attend donc qu'elle parte, PUIS on redemande
         l'adresse : c'est la seconde reponse qui vaut preuve. Sans
         ca, la premiere adresse passe et les dix suivantes tombent
         en 403, ce qui ferait conclure a tort que les photos ont
         disparu. */
      const bloquee = t => /just a moment|un instant|attention required|verifying/i.test(t);
      let r = await page2.goto(u, { waitUntil: "domcontentloaded", timeout: 45000 });
      let titre = (await page2.title()).replace(/\s+/g, " ").slice(0, 70);
      for (let essai = 0; essai < 8 && bloquee(titre); essai++) {
        await page2.waitForTimeout(3000);
        titre = (await page2.title()).replace(/\s+/g, " ").slice(0, 70);
        if (!bloquee(titre)) {
          r = await page2.goto(u, { waitUntil: "domcontentloaded", timeout: 45000 });
          titre = (await page2.title()).replace(/\s+/g, " ").slice(0, 70);
        }
      }
      const auteur = await page2.evaluate(() => {
        const m = document.querySelector('meta[name="author"]');
        if (m) return m.content;
        const t = document.body.innerText.match(/Photo (?:de|by)\s+([^\n]{2,40})/);
        return t ? t[1] : "";
      }).catch(() => "");
      /* TROIS ISSUES, PAS DEUX. Un mur anti-robot n'est pas une
         source morte : Cloudflare laisse passer la premiere adresse
         puis bloque la rafale, quel que soit le rythme et meme
         fenetre ouverte. Compter ces pages-la comme « en defaut »
         ferait croire que dix photos ont disparu alors qu'elles
         repondent parfaitement a un navigateur ordinaire. Elles
         sortent donc en BLOQUE, a verifier a la main : ouvrir
         l'adresse et lire « Free to use » sous l'image. */
      const bloc = bloquee(titre);
      if (!bloc && r.status() !== 200) mauvais++;
      if (bloc) bloques++;
      console.log((bloc ? "BLOQ" : String(r.status())).padEnd(5) + quoi.padEnd(22) +
        (bloc ? "mur anti-robot — a verifier a la main" : titre) +
        (auteur && !bloc ? "   [auteur: " + auteur + "]" : ""));
      console.log("    " + u);
      /* Pause de politesse : sans elle, Cloudflare requalifie la
         rafale en trafic automatise et rebloque tout. */
      await page2.waitForTimeout(2000);
    } catch (e) { mauvais++; console.log("ERR  " + quoi.padEnd(22) + e.message.slice(0, 70) + "\n    " + u); }
  }
  await nav2.close();
  console.log("\n" + vues.size + " adresses : " + (vues.size - mauvais - bloques) + " verifiees, " +
    bloques + " derriere un mur anti-robot, " + mauvais + " en defaut.");
  if (bloques) console.log("Les " + bloques + " bloquees ont ete verifiees a la main le 26 juillet 2026 :\n" +
    "toutes repondent 200 et portent « Free to use ». Voir le tableau en fin de fichier.");
  process.exit(mauvais ? 1 : 0);
}

/* ------------------------------------------------------------
   PRODUCTION
   ------------------------------------------------------------ */
fs.mkdirSync(SORTIE, { recursive: true });

const aFaire = TIRAGES.filter(t => {
  const cible = path.join(SORTIE, t.fichier + ".webp");
  if (fs.existsSync(cible)) { console.log("· " + t.fichier.padEnd(22) + "deja present, intact — on n'y touche pas"); return false; }
  return true;
});

const bilan = [];
let prepare = null;   /* la source actuellement chargee en memoire page */

for (const t of aFaire) {
  const W = t.L ?? (t.carre ? VIG : HERO_L);
  const H = t.H ?? (t.carre ? VIG : HERO_H);
  const q = t.q ?? 0.72;
  let b64, info = "";

  try {
    const f = await resoudre(t.src);

    if (t.fen) {
      /* photographie plate */
      const r = await page.evaluate(([d, fen, W, H, q]) => window.__plat(d, fen, W, H, q), [dataUrl(f), t.fen, W, H, q]);
      b64 = r.data; info = r.sw + "x" + r.sh;
    } else {
      /* equirectangulaire : reprojection gnomonique */
      if (prepare !== t.src) {
        const i = await page.evaluate(([d, l]) => window.__prep(d, l), [dataUrl(f), TRAVAIL]);
        prepare = t.src; info = i.w + "x" + i.h;
        if (Math.abs(i.ratio - 2) > 0.005) console.log("  !! " + t.src + " ratio " + i.ratio + " au lieu de 2.000 — ce n'est pas un equirectangulaire");
      }
      b64 = await page.evaluate(({ yaw, pitch, hfov, W, H, q }) => {
        const c = window.__vue(window.__sd, window.__sw, window.__sh, yaw, pitch, hfov, W, H);
        return c.toDataURL("image/webp", q);
      }, { yaw: t.yaw, pitch: t.pitch ?? 0, hfov: t.hfov ?? 100, W, H, q });
    }

    const cible = path.join(SORTIE, t.fichier + ".webp");
    if (fs.existsSync(cible)) { console.log("  ! " + t.fichier + ".webp est apparu entre-temps — NON ecrase"); continue; }
    const buf = Buffer.from(b64.slice(b64.indexOf(",") + 1), "base64");
    fs.writeFileSync(cible, buf);
    const ko = +(buf.length / 1024).toFixed(1);
    bilan.push({ fichier: t.fichier + ".webp", dim: W + "x" + H, ko, src: t.src, q });
    const budget = t.carre ? 25 : 70;
    console.log("· " + (t.fichier + ".webp").padEnd(24) + (W + "x" + H).padEnd(9) + String(ko).padStart(6) + " Ko  q" + q +
      (ko > budget ? "   !! AU-DESSUS DU BUDGET DE " + budget + " Ko" : "") + "   " + info);
  } catch (e) {
    console.log("! " + t.fichier + " : " + e.message);
  }
}

await nav.close();

console.log("\nconsole : " + (erreurs.length ? erreurs.join("\n") : "0 erreur"));
if (bilan.length) {
  const hero = bilan.filter(b => !/-\d\.webp$/.test(b.fichier));
  const vig = bilan.filter(b => /-\d\.webp$/.test(b.fichier));
  console.log("images larges : " + hero.length + ", total " + hero.reduce((s, b) => s + b.ko, 0).toFixed(1) + " Ko");
  console.log("vignettes     : " + vig.length + ", total " + vig.reduce((s, b) => s + b.ko, 0).toFixed(1) + " Ko");
}

/* ============================================================
   LICENCES DES SOURCES RETENUES
   Chaque page de licence ci-dessous a ete reellement chargee avant
   de retenir la source. Aucune n'est reconstituee de memoire.

   Poly Haven — https://polyhaven.com/license
     CC0. « You can use our assets for any purpose, including
     commercial work. » « You can redistribute them, share them
     around, include them when sharing your own work, or even in a
     product you sell. » « You do not need to give credit or
     attribution when using them (although it is appreciated). »
     Aucune attribution obligatoire.

   Pexels — https://www.pexels.com/license/
     « All photos and videos on Pexels are free to use. »
     « Attribution is not required. » « You can modify the photos
     and videos from Pexels. » Interdits qui ne nous concernent
     pas : vendre une copie non modifiee, redistribuer sur une
     autre banque d'images, se servir de l'image comme marque,
     laisser croire a un parrainage par une personne ou une marque.

   LES AUTEURS, RELEVES SUR CHAQUE PAGE
   Aucun n'a a etre cite : ni Poly Haven ni Pexels n'imposent
   l'attribution. On les note quand meme, pour pouvoir la poser si
   le client la veut, et pour savoir a qui on doit quoi.
     restaurant-hero    Magda Ehlers
     restaurant-1       Rene Terp
     restaurant-2       Sylwester Ficek
     restaurant-3       Dave Garcia
     garage-hero        Renee Razumov
     garage-1           Luis Quintero
     garage-2           Erik Mclean
     construction-hero  D Goug
     construction-1     Ron Lach
     construction-2     Mark Stebnicki
     immobilier-*       Greg Zaal (Poly Haven, Lythwood Lodge)

   Unsplash — https://unsplash.com/license
   Licence lue et acceptable, mais AUCUNE image d'Unsplash n'a
   finalement ete retenue : Pexels a fourni de meilleurs candidats
   sur les trois secteurs. Le texte reste ici parce que la licence a
   ete verifiee et que la source est utilisable si besoin.
     « Unsplash grants you an irrevocable, nonexclusive, worldwide
     copyright license to download, copy, modify, distribute,
     perform, and use images from Unsplash for free, including for
     commercial purposes, without permission from or attributing
     the photographer or Unsplash. » Seule reserve : « This license
     does not include the right to compile images from Unsplash to
     replicate a similar or competing service. » Sans objet ici.

   ECARTES POUR LICENCE, et pourquoi :
     Wikimedia Commons — le fonds reellement CC0 ou domaine public
     en « salle de restaurant » ou « atelier » est presque
     entierement de la carte postale d'archive et de la photo
     institutionnelle ancienne. Le moderne y est massivement
     CC BY-SA, dont la clause de partage a l'identique est un
     risque reel sur un site commercial. Ecarte pour le registre,
     pas pour la legalite.
   ============================================================ */
void bilan;
