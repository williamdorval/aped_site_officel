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
    /* LE HEROS PASSE EN `xl`.  D-660
       Le standard demande une photographie PLEIN CADRE. Une image de
       1280 px etiree sur une fenetre de 1280 en densite 1,5 est
       demandee a 1920 px reels : elle arrive floue, et c'est la
       premiere chose qu'on voit du site. Cette charpente-la est une
       maison ENTIERE, montee, sous un ciel franc — pas un detail de
       colombage : au heros, il faut le sujet, pas un morceau. */
    /* DEUX HEROS ESSAYES ET REJETES, POUR DEUX RAISONS DIFFERENTES :
       · `37627540` porte « TALLWALL » imprime en clair sur les
         panneaux de revetement, a trois endroits. C'est une marque
         reelle, et sur un heros de 1920 px elle se lit ;
       · `33043393` est une rangee de logements neufs identiques. Le
         site ecrit « pas de multilogement neuf ». La photo aurait
         contredit la page a la premiere ligne.
       Celle qui reste raconte l'entreprise en une image : une vieille
       maison a clin blanc, et une ossature neuve greffee dessus. C'est
       exactement « agrandissements et renovations majeures ». */
    { n: 1, emploi: "heros — agrandissement greffe sur une maison existante", xl: true,
      src: "url:" + PX + "/33954649/pexels-photo-33954649.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/33954649/", fen: { x: 0, y: 0.05, w: 1 } },
    { n: 2, emploi: "ossature de bois", large: true,
      src: "url:" + PX + "/8817834/pexels-photo-8817834.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/construction-of-framework-of-house-with-softwood-materials-8817834/", fen: { x: 0.04, y: 0.08, w: 0.92 } },
    { n: 3, emploi: "bois d'oeuvre en reserve",
      src: "url:" + PX + "/12278581/pexels-photo-12278581.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/stacks-of-lumbers-in-close-up-photography-12278581/", fen: { x: 0.08, y: 0.10, w: 0.84 } },
    /* TROIS SOURCES ECARTEES, ET C'EST MOI QUI LES AVAIS CHOISIES.  D-656
       · `ph:interior_construction` portait « Onduline » imprime en
         boucle sur la sous-toiture, lisible sur toute la moitie haute
         du panorama — donc sur les vues 4 ET 5. Une marque reelle
         dans une demonstration d'entreprise fictive, c'est
         exactement l'interdit du projet.
       · `ph:carpentry_shop_02` a 90 degres n'est pas un atelier :
         c'est une reserve d'etageres de boites de lait en poudre,
         avec deux marques parfaitement lisibles.
       Les trois sont parties. Je ne les avais pas REGARDEES — je les
       avais choisies sur le nom du panorama et sur une
       planche-contact ou le texte imprime est trop petit pour se
       voir. Une planche-contact ne remplace pas l'image en taille
       reelle quand ce qu'on cherche est un mot. */
    /* LES PANORAMAS REPROJETES CEDENT LA PLACE A DE VRAIES PHOTOS.  D-660
       Un panorama Poly Haven est fait pour ECLAIRER un rendu 3D : il
       est pris a hauteur de trepied, sans sujet, sans lumiere
       choisie. Reprojete, il rend une piece correcte et morte. Le
       standard demande une image ou l'on voit un geste, une matiere
       ou une texture — et ca, seule une photographie le donne. Les
       trois interieurs LIVRES restent en panorama : la piece finie
       est justement le seul cas ou l'absence de sujet est juste. */
    { n: 4, emploi: "chantier interieur — cloisons montees, portes percees",
      src: "url:" + PX + "/7937304/pexels-photo-7937304.jpeg" + GRAND, licence: LIC_PX,
      /* Source en PORTRAIT : le cadre calcule ne fait que 41 % de la
         hauteur. Pose a 0, il photographie le plafond. Piege 58 */
      page: "https://www.pexels.com/photo/7937304/", fen: { x: 0.09, y: 0.35, w: 0.82 } },
    { n: 5, emploi: "demolition — gypse retire, ossature et isolant a nu",
      src: "url:" + PX + "/8488031/pexels-photo-8488031.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/8488031/", fen: { x: 0.09, y: 0.08, w: 0.82 } },
    /* LE VISAGE EST UN CRITERE DE REJET, PAS UN DETAIL.
       Quatre photographies d'atelier ecartees pour ca : `32357250`,
       `11127339`, `8830256` montrent un visage net et identifiable, et
       `17410515` porte un texte imprime illisible sur le dos de deux
       chandails. Une entreprise fictive ne peut pas montrer des gens
       reels au travail. Celle-ci ne montre que des MAINS. */
    { n: 6, emploi: "atelier — le rabot a la main, personne d'identifiable", large: true,
      src: "url:" + PX + "/5691541/pexels-photo-5691541.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/5691541/", fen: { x: 0, y: 0.08, w: 1 } },
    /* La fenetre s'arrete a 62 % de la largeur : au-dela, un immeuble
       jaune vif et rose occupe le fond, et un aplat fluorescent dans
       une photo de chantier quebecois se voit avant la charpente. */
    { n: 7, emploi: "charpente de toit — fermes et entraits, vue de dessous",
      src: "url:" + PX + "/8491085/pexels-photo-8491085.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/8491085/", fen: { x: 0.02, y: 0.05, w: 0.60 } },
    /* LES TROIS INTERIEURS LIVRES PASSENT EUX AUSSI EN PHOTOGRAPHIE.  D-660
       Ils etaient les derniers panoramas reprojetes de la page, et le
       test du cote-a-cote les a designes tout seuls : sur la meme
       page que la charpente et la demolition, la cuisine reprojetee
       rendait une image floue avec un sac a main et un extincteur
       dans le cadre. Un cadrage CSS peut sortir un objet du champ ; il
       ne rend pas une image nette. Une piece LIVREE est justement
       celle qu'un client regarde le plus longtemps — c'est la
       derniere ou l'on peut se permettre une image d'amateur. */
    /* `10187179` etait la premiere : une source en PORTRAIT ou les
       puits de lumiere sont en haut et le lit en bas. Une fenetre 4/3
       n'en garde que 41 % — soit les puits sans la piece, soit la
       piece sans les puits. Deux essais, deux moities. Sur un sujet
       qui a besoin des DEUX, il faut une source en paysage.
       Celle-ci les a tous les deux, plus le plafond fini en bois que
       la fiche du chantier decrit.
       ATTENTION AU RAPPORT : la source est en 16/9. Une fenetre 4/3
       de 82 % de large demande 1 181 px de haut sur une image qui
       n'en a que 1 080 — le bas serait vide. `w` descend a 0,72. */
    { n: 8, emploi: "combles amenages — plafond de bois, deux puits de lumiere",
      src: "url:" + PX + "/271743/pexels-photo-271743.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/271743/", fen: { x: 0.14, y: 0, w: 0.72 } },
    { n: 9, emploi: "salle de bain livree — douche vitree, ceramique pleine hauteur",
      src: "url:" + PX + "/11208975/pexels-photo-11208975.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/11208975/", fen: { x: 0.09, y: 0.10, w: 0.82 } },
    { n: 10, emploi: "cuisine livree — ilot central, armoires de bois et de laque",
      src: "url:" + PX + "/36777538/pexels-photo-36777538.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/36777538/", fen: { x: 0.09, y: 0.03, w: 0.82 } },
    { n: 11, emploi: "fond pleine largeur — maison enveloppee, toiture sous-couche posee", xl: true,
      src: "url:" + PX + "/209266/pexels-photo-209266.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/209266/", fen: { x: 0, y: 0.05, w: 1 } },
    { n: 12, emploi: "finition en cours — enduits, echelle, planchers proteges", large: true,
      src: "url:" + PX + "/36035072/pexels-photo-36035072.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/36035072/", fen: { x: 0, y: 0.08, w: 1 } }
  ],

  /* DEUX TIRAGES SUPPRIMES, PAS ARCHIVES.  D-657 puis D-660
     `ph:small_empty_house` — un mur ocre nu, sans un outil ni une
     trace de travail — et `ph:empty_warehouse_01` — un hall industriel
     a colonnes et cloisons de tole — avaient ete produits pour le site
     de construction, puis ecartes : la section Services ecrit « on ne
     fait pas de commercial », et une photo qui contredit le texte du
     site ne se pose pas. Ils etaient restes sur le disque « au cas ou
     un autre secteur en aurait l'emploi ».
     Aucun n'en a eu l'emploi, et un fichier garde « au cas ou » est un
     fichier que personne ne relit : il finit par etre repris SANS
     etre regarde, ce qui est exactement l'erreur que ce projet a payee
     trois fois. Ils sortent. La ligne de commande qui les refait est
     dans l'historique.

     IMMOBILIER — DIX PROPRIETES, DONC DIX PROPRIETES.  D-658
     La page annonce dix inscriptions a dix adresses differentes et
     n'avait QUATRE photos, reprises seize fois. Le meme salon portait
     « 412, chemin du Vieux-Moulin » et « 77, rue du Coteau-Vert » ; la
     meme cour etait legendee « terrasse DEVANT la maison » a un
     endroit et « cour ARRIERE » a un autre. Deux legendes qui se
     contredisent sur un seul fichier, c'est la question Q1 qui tombe :
     ce n'est pas vrai, et ca se voit a l'oeil nu en descendant la
     page.
     Une adresse = une photo qui n'appartient qu'a elle. Seule
     exception, assumee : la propriete vedette (n. 2, 12, 16) est
     photographiee TROIS fois, parce que c'est la meme maison et que
     les legendes le disent — c'est le contraire d'un doublon. */
  /* POURQUOI PEXELS ET PAS POLY HAVEN, ICI.
     Premier tirage fait en panoramas Poly Haven reprojetes : NEUF sur
     seize etaient a jeter, et je ne l'ai su qu'en les regardant. Une
     chambre d'hotel avec sa consigne d'evacuation encadree sur la
     porte, un cloitre a colonnes vendu comme une copropriete, un
     chateau a lustre vendu comme un cottage de 1989, un patio sous
     acacias au bord d'un lac africain vendu comme une cour arriere
     quebecoise, et trois salons si sombres qu'on y voit surtout un
     televiseur cathodique. La collection Poly Haven est faite pour
     eclairer des rendus 3D, pas pour montrer des maisons : les scenes
     residentielles y sont rares, datees et sombres. L'immobilier se
     photographie, il ne se reprojette pas. */
  immobilier: [
    { n: 1, emploi: "heros — sejour d'une inscription", large: true,
      src: "url:" + PX + "/3935315/pexels-photo-3935315.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/3935315/", fen: { x: 0, y: 0.10, w: 1 } },
    /* LE TYPE DE LA MAISON DOIT SUIVRE LA FICHE.
       Premiere passe : une maison a etages posee sur une inscription
       ecrite « plain-pied 2004 », et une autre a etages sur un
       « plain-pied 2012 ». C'est le meme defaut que les legendes qui
       se contredisaient, en plus discret : la photo dit une chose, la
       fiche en dit une autre, et c'est la photo qu'on croit. Chaque
       facade est maintenant du type que la fiche annonce ; les
       inscriptions dont je n'avais pas la bonne facade recoivent un
       INTERIEUR, qui n'affirme rien sur le nombre d'etages. */
    { n: 2, emploi: "bien 1 · 412 ch. du Vieux-Moulin — facade (plain-pied)", large: true,
      src: "url:" + PX + "/10628468/pexels-photo-10628468.jpeg" + GRAND, licence: LIC_PX,
      /* La fenetre s'arrete a 66 % : au-dela, le NUMERO CIVIQUE de la
         vraie maison est peint sur le mur, et il ne dit pas 412. Un
         chiffre lisible qui contredit la fiche est une fausseté comme
         une autre — on le sort du cadre, on ne compte pas sur la
         petitesse du rendu. */
      page: "https://www.pexels.com/photo/10628468/", fen: { x: 0.15, y: 0.10, w: 0.51 } },
    { n: 3, emploi: "bien 2 · 15 crois. des Aubepines — sejour",
      src: "url:" + PX + "/28586197/pexels-photo-28586197.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/28586197/", fen: { x: 0.09, y: 0.04, w: 0.82 } },
    { n: 4, emploi: "bien 3 · 87 r. des Bouleaux-Blancs — facade (cottage)",
      src: "url:" + PX + "/8583638/pexels-photo-8583638.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/8583638/", fen: { x: 0.09, y: 0.06, w: 0.82 } },
    { n: 5, emploi: "bien 4 · 230 montee du Cormier — chambre",
      src: "url:" + PX + "/8135505/pexels-photo-8135505.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/8135505/", fen: { x: 0.09, y: 0.04, w: 0.82 } },
    { n: 6, emploi: "bien 5 · 6-B r. de la Draveuse — sejour", large: true,
      src: "url:" + PX + "/7005270/pexels-photo-7005270.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/7005270/", fen: { x: 0, y: 0.12, w: 1 } },
    /* `9811331` etait une fermette ABANDONNEE : peinture partie,
       galerie effondree, fenetres crevees. La fiche annonce « renovee
       2019 » a 875 000 $. Une ruine sous ce prix-la, c'est la photo
       qui traite la fiche de menteuse. */
    { n: 7, emploi: "bien 6 · 1104 rang du Grand-Brule — facade (fermette)",
      src: "url:" + PX + "/32150698/pexels-photo-32150698.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/32150698/", fen: { x: 0.09, y: 0.04, w: 0.82 } },
    { n: 8, emploi: "bien 7 · 48 imp. des Perdrix — sejour",
      src: "url:" + PX + "/7027771/pexels-photo-7027771.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/7027771/", fen: { x: 0.09, y: 0.04, w: 0.82 } },
    { n: 9, emploi: "bien 8 · 320 av. Ferland Ouest — chambre",
      src: "url:" + PX + "/6782479/pexels-photo-6782479.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/6782479/", fen: { x: 0.09, y: 0.04, w: 0.82 } },
    { n: 10, emploi: "bien 9 · 77 r. du Coteau-Vert — sejour au foyer", large: true,
      src: "url:" + PX + "/5353880/pexels-photo-5353880.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/5353880/", fen: { x: 0, y: 0.10, w: 1 } },
    { n: 11, emploi: "bien 10 · 9 ch. des Quatre-Vents — cuisine",
      src: "url:" + PX + "/13009887/pexels-photo-13009887.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/13009887/", fen: { x: 0.09, y: 0.04, w: 0.82 } },
    /* Le n. 12 sert DEUX fois : fiche vedette et visionneuse 360. Ce
       n'est pas le doublon qu'on corrige — c'est la meme piece de la
       meme maison, et les deux legendes le disent. La visionneuse
       porte trois reperes (« poele a bois », « sortie sur la
       terrasse », « aller a la cuisine ») : ils doivent pointer sur ce
       qu'on voit, donc sur CETTE image-la. */
    { n: 12, emploi: "vedette + visite 360 · salon au foyer, sortie sur la terrasse", large: true,
      src: "url:" + PX + "/3990600/pexels-photo-3990600.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/3990600/", fen: { x: 0, y: 0.08, w: 1 } },
    { n: 13, emploi: "vedette · sejour, exposition sud",
      src: "url:" + PX + "/35430055/pexels-photo-35430055.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/35430055/", fen: { x: 0.09, y: 0.04, w: 0.82 } },
    { n: 14, emploi: "vedette · chambre 2",
      src: "url:" + PX + "/7019020/pexels-photo-7019020.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/7019020/", fen: { x: 0.09, y: 0.04, w: 0.82 } },
    /* `12700434` montrait une terrasse qui donne sur QUATRE rangees de
       maisons a vingt metres. La fiche de la vedette ecrit « terrain
       de 8 200 pi2 SANS VOISIN ARRIERE ». On garde la phrase, on
       change la photo. */
    { n: 15, emploi: "vedette · terrasse et cour arriere",
      /* Une terrasse d'architecte en beton noir a la galerie, une
         facade de plain-pied en clin gris sur la fiche : ce n'est pas
         la meme maison, et les deux photos se regardent a trois
         ecrans d'ecart. La vue retenue cadre la terrasse et la
         verdure SANS montrer l'architecture — elle ne contredit rien.
         `fen.w` porte sur la LARGEUR : sur une source en PORTRAIT, la
         hauteur calculee est bien plus courte que l'image et le cadre
         se pose EN HAUT. Deux essais m'ont rendu la cime des arbres et
         une porte vitree — pas la terrasse. Verifier l'orientation de
         la source avant de choisir `fen`.  Piege 57 */
      src: "url:" + PX + "/8180361/pexels-photo-8180361.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/8180361/", fen: { x: 0.09, y: 0.04, w: 0.82 } }
  ]
};

/* TROIS TAILLES, ET LA PLUS GRANDE EST NOUVELLE.
   Le standard demande une photographie PLEIN CADRE au heros et des
   cases de 400 a 700 px. Une image de 1280 px etiree sur une fenetre
   de 1280 en densite 1,5 est demandee a 1920 px reels : elle arrive
   floue, et c'est la premiere chose qu'on voit d'un site. `xl` sert
   aux heros et aux fonds pleine largeur, `large` aux bandeaux, et
   `normal` aux cartes. */
const XL = { w: 1920, h: 1080 };
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
    const dim = t.xl ? XL : t.large ? LARGE : NORMAL;
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
