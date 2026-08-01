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
  /* BOUTIQUE EN LIGNE — GRES DU NORD, CERAMIQUE UTILITAIRE.
     Une boutique se juge sur ses PHOTOS DE PRODUIT : un objet, un fond
     propre, une lumiere. Le reste — l'atelier, les mains, la matiere —
     sert a dire pourquoi l'objet coute ce qu'il coute.
     Ecartes en regardant les fichiers : `9304545` porte le nom d'un
     vrai atelier ecrit a la craie sur le mur, `34301756` une tasse
     avec un mot imprime dessus, `34173322` un poincon de potier
     lisible dans le fond d'un plat, et `9736330` un visage de trois
     quarts identifiable. */
  boutique: [
    { n: 1, emploi: "heros — claies de sechage, tasses crues en rangs", xl: true,
      src: "url:" + PX + "/29286722/pexels-photo-29286722.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/29286722/", fen: { x: 0, y: 0.20, w: 1 } },
    { n: 2, emploi: "bande pleine largeur — champ de bols crus", xl: true,
      src: "url:" + PX + "/34004100/pexels-photo-34004100.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/34004100/", fen: { x: 0, y: 0.08, w: 1 } },
    { n: 3, emploi: "produit — assiette, tasse et deux bols sur fond clair",
      src: "url:" + PX + "/11065504/pexels-photo-11065504.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/11065504/", fen: { x: 0.09, y: 0.22, w: 0.82 } },
    /* Source en PAYSAGE 3:2 : une fenetre 4/3 de 82 % de large
       demanderait 1 181 px sur une image qui n'en a que 1 280 apres
       reduction — ca passe de justesse et le bas serait vide au moindre
       arrondi. `w` descend a 0,72. Piege 58 */
    { n: 4, emploi: "produit — bol et assiette, service en gres",
      src: "url:" + PX + "/6208156/pexels-photo-6208156.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/6208156/", fen: { x: 0.14, y: 0.02, w: 0.72 } },
    { n: 5, emploi: "produit — gobelets et bols emboites",
      src: "url:" + PX + "/6692600/pexels-photo-6692600.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/6692600/", fen: { x: 0.14, y: 0.02, w: 0.72 } },
    { n: 6, emploi: "produit — pile de tasses et d'assiettes au biscuit",
      src: "url:" + PX + "/8063881/pexels-photo-8063881.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/8063881/", fen: { x: 0.09, y: 0.22, w: 0.82 } },
    { n: 7, emploi: "produit — la tasse tenue en main, aucun visage",
      src: "url:" + PX + "/15440835/pexels-photo-15440835.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/15440835/", fen: { x: 0.09, y: 0.28, w: 0.82 } },
    { n: 8, emploi: "atelier — les mains et l'argile, vue de dessus", large: true,
      src: "url:" + PX + "/6693557/pexels-photo-6693557.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/6693557/", fen: { x: 0, y: 0.08, w: 1 } },
    { n: 9, emploi: "atelier — la plaque roulee, outils de tournage", large: true,
      src: "url:" + PX + "/5642023/pexels-photo-5642023.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/5642023/", fen: { x: 0, y: 0.08, w: 1 } },
    { n: 10, emploi: "detail — la barbotine sur les doigts",
      src: "url:" + PX + "/26792250/pexels-photo-26792250.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/26792250/", fen: { x: 0.14, y: 0.02, w: 0.72 } },
    /* `11808240` — une etagere sombre sous un plateau de bois — est
       sortie apres coup : la fenetre 4/3 tombait sur son tiers le plus
       noir et rendait une image ou l'on ne distingue plus l'objet. Une
       photo de PRODUIT qui ne montre pas le produit ne sert a rien,
       et un cadrage ne rattrape pas une exposition. */
    { n: 11, emploi: "produit — bols emboites, service marbre sur fond uni",
      src: "url:" + PX + "/6739690/pexels-photo-6739690.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/6739690/", fen: { x: 0.09, y: 0.45, w: 0.82 } },
    { n: 12, emploi: "atelier — pieces crues qui sechent sur le radiateur",
      src: "url:" + PX + "/6611472/pexels-photo-6611472.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/6611472/", fen: { x: 0.14, y: 0.02, w: 0.72 } }
  ],

  /* COIFFURE ET ESTHETIQUE — SALON BRUME.
     Le secteur ou le rejet a ete le plus lourd : SIX candidats sur
     quinze portaient une marque reelle. Un salon EST un mur de
     produits de marque, et les photographes de banque les cadrent
     sans y penser. Ecartes en ouvrant les fichiers :
     · `9146943` — une enseigne de cire a cheveux au mur, en clair ;
     · `7518717` — deux boitiers de produit avec leur slogan lisible ;
     · `30547693` — « Barber 1 » peint sur le miroir, plus deux
       marques d'appareils sur le comptoir ;
     · `3993316` — un autocollant d'un personnage de cinema ;
     · `853427` — quatre portraits de mannequins encadres au mur :
       des visages reels, identifiables, dans un site fictif ;
     · `7750124` — une enseigne au neon reflechie dans le miroir.
     Ce qui reste ne montre aucun mot et aucun visage. */
  coiffure: [
    { n: 1, emploi: "heros — salon clair, lustre de cristal, miroirs pleine hauteur", xl: true,
      src: "url:" + PX + "/7823407/pexels-photo-7823407.jpeg" + GRAND, licence: LIC_PX,
      /* A 0,28 la fenetre ne gardait que le lustre et deux metres de
         mur nu : le SALON etait dessous. Sur une source en portrait,
         une bande 16/9 ne prend que 37 % de la hauteur — il faut la
         poser sur le sujet, pas au milieu. */
      page: "https://www.pexels.com/photo/7823407/", fen: { x: 0, y: 0.55, w: 1 } },
    /* La fenetre s'arrete a 78 % : au-dela, une tablette de flacons
       dont les etiquettes commencent a se lire. */
    { n: 2, emploi: "bande pleine largeur — salon d'epoque, fauteuils verts, damier", xl: true,
      src: "url:" + PX + "/37764947/pexels-photo-37764947.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/37764947/", fen: { x: 0, y: 0.06, w: 0.78 } },
    { n: 3, emploi: "salle — bacs de lavage, brique et fenetre sur la ville", large: true,
      src: "url:" + PX + "/7195796/pexels-photo-7195796.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/7195796/", fen: { x: 0, y: 0.08, w: 1 } },
    /* La fenetre commence a 10 % : un fragment d'enseigne — quatre
       lettres, « …LISH » — est peint sur le mur du fond, a gauche.
       Il avait ete « regle » par un `object-position` dans la page.
       Un `object-position` deplace la fenetre de la mise en page ; le
       mot reste dans le FICHIER et revient au premier changement de
       gabarit. On le sort a la source.  D-656 · piege 57 */
    { n: 4, emploi: "salle — bacs de lavage cote clair, mur de couleurs", large: true,
      src: "url:" + PX + "/7195805/pexels-photo-7195805.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/7195805/", fen: { x: 0.10, y: 0.08, w: 0.90 } },
    { n: 5, emploi: "coupe — nuque degradee vue de dos, noir et blanc",
      src: "url:" + PX + "/7956486/pexels-photo-7956486.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/7956486/", fen: { x: 0.09, y: 0.18, w: 0.82 } },
    { n: 6, emploi: "texture — boucles tenues a la main, de dos",
      src: "url:" + PX + "/8377218/pexels-photo-8377218.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/8377218/", fen: { x: 0.09, y: 0.14, w: 0.82 } },
    { n: 7, emploi: "outils — pinceaux et peignes dans un pot d'acier",
      src: "url:" + PX + "/3993134/pexels-photo-3993134.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/3993134/", fen: { x: 0.09, y: 0.16, w: 0.82 } },
    /* Fenetre decalee a droite : une etiquette de produit trainait
       dans le coin superieur gauche de la source. */
    { n: 8, emploi: "couleur — bol, pinceaux, peigne et meche temoin",
      src: "url:" + PX + "/8468141/pexels-photo-8468141.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/8468141/", fen: { x: 0.08, y: 0.50, w: 0.90 } },
    /* Fenetre resserree au centre : deux boitiers de coloration a
       marque reelle occupent le tiers gauche du comptoir. */
    { n: 9, emploi: "poste — miroir circulaire lumineux sur mur ajoure",
      src: "url:" + PX + "/7750144/pexels-photo-7750144.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/7750144/", fen: { x: 0.30, y: 0.12, w: 0.60 } },

    /* AJOUTES LE 2026-08-01 — LA REFONTE « MAGAZINE ».
       Les neuf premieres etaient des photos de PIECE : deux salons
       vides, deux salles de bacs, trois natures mortes. Aucune ne
       montre le GESTE, et un magazine de mode se tient sur le geste.
       Les cinq suivantes sont toutes cadrees sur des mains, des
       ciseaux, une meche : ni visage, ni marque, ni enseigne, ni
       numero civique — verifiees une par une en pleine resolution.
       La 10 remplace la 1 au heros : la 1 montrait des fauteuils
       ENCORE SOUS FILM, c'est-a-dire un salon qui n'a jamais ouvert. */
    /* CETTE LIGNE A ETE SORTIE DEUX FOIS. La premiere en `xl` :
       une bande 16/9 sur une source 2:3 ne prend que 37 % de sa
       hauteur, et 37 % d'un gros plan de main, c'est un POUCE. Le
       recadrage du noyau verrouille la hauteur sur le rapport de
       SORTIE : on ne peut pas s'eloigner, seulement trancher. Un
       format debout prend 93 % de la source et rend la scene entiere.
       C'est la raison d'etre du format `portrait`. */
    { n: 10, emploi: "heros — la main, le peigne et le ciseau a contre-jour", portrait: true,
      src: "url:" + PX + "/6487878/pexels-photo-6487878.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/6487878/", fen: { x: 0, y: 0.04, w: 1 } },
    { n: 11, emploi: "geste — le ciseau ferme sur une meche, tablier noir", portrait: true,
      src: "url:" + PX + "/8467965/pexels-photo-8467965.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/8467965/", fen: { x: 0, y: 0.10, w: 1 } },
    { n: 12, emploi: "geste — les deux mains separent une meche mouillee au ciseau", portrait: true,
      src: "url:" + PX + "/19239103/pexels-photo-19239103.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/19239103/", fen: { x: 0, y: 0.04, w: 1 } },
    { n: 13, emploi: "bac — la main ouvre une meche mouillee au-dessus du bac", portrait: true,
      src: "url:" + PX + "/23349887/pexels-photo-23349887.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/23349887/", fen: { x: 0, y: 0.06, w: 1 } },
    { n: 14, emploi: "nature morte — la tresse et le ruban noir sur toile ecrue", portrait: true,
      src: "url:" + PX + "/8467968/pexels-photo-8467968.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/8467968/", fen: { x: 0, y: 0.08, w: 1 } }
  ],

  /* GYM ET ENTRAINEMENT — FONTE NORD.
     La fonte est un secteur ou la MARQUE EST MOULEE DANS L'OBJET :
     trois candidats sur onze portaient un nom de fabricant en relief
     sur le disque — `11058382` (« SPORT FASSI »), `4451119`
     (« BodyMax »), `949131` (« ROGUE »). Un logo grave dans le metal
     ne se recadre pas : il occupe le centre de la piece. Ecartes.
     Les disques retenus ne portent qu'une MASSE (« 20KG »), qui est
     une specification, pas une marque. */
  gym: [
    { n: 1, emploi: "heros — plateau de force au petit matin, cages et cordes", xl: true,
      src: "url:" + PX + "/6388373/pexels-photo-6388373.jpeg" + GRAND, licence: LIC_PX,
      /* La fenetre commence a 6 % : une banderole murale porte le mot
         « RUN » dans le coin gauche de la source. Ce n'est ni une
         marque ni un nom d'entreprise — c'est un mot anglais peint sur
         un mur de gym — mais il avait ete mis hors champ par un
         `object-position` dans la page, et un `object-position` ne
         recadre pas le fichier : le mot revient au premier changement
         de gabarit. On tranche a la source, comme pour la coiffure. */
      page: "https://www.pexels.com/photo/6388373/", fen: { x: 0.06, y: 0.06, w: 0.94 } },
    { n: 2, emploi: "bande pleine largeur — barre chargee au sol, salle dans la brume", xl: true,
      src: "url:" + PX + "/6389516/pexels-photo-6389516.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/6389516/", fen: { x: 0, y: 0.06, w: 1 } },
    { n: 3, emploi: "salle — barre posee sur le plancher de bois, cordes au fond", large: true,
      src: "url:" + PX + "/1552252/pexels-photo-1552252.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/1552252/", fen: { x: 0, y: 0.08, w: 1 } },
    { n: 4, emploi: "salle — anneaux, sacs et bar fixe sur mur peint", large: true,
      src: "url:" + PX + "/6390225/pexels-photo-6390225.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/6390225/", fen: { x: 0, y: 0.08, w: 1 } },
    { n: 5, emploi: "materiel — les barres rangees debout contre la cage",
      src: "url:" + PX + "/6389856/pexels-photo-6389856.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/6389856/", fen: { x: 0.09, y: 0.22, w: 0.82 } },
    { n: 6, emploi: "materiel — disque de 20 kg en fonte, mur de brique",
      src: "url:" + PX + "/4793231/pexels-photo-4793231.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/4793231/", fen: { x: 0.09, y: 0.20, w: 0.82 } },
    { n: 7, emploi: "materiel — haltere hexagonal et son ombre sur le plancher",
      src: "url:" + PX + "/4753987/pexels-photo-4753987.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/4753987/", fen: { x: 0.09, y: 0.05, w: 0.82 } },
    { n: 8, emploi: "materiel — disque olympique et collier sur tapis de caoutchouc",
      src: "url:" + PX + "/2261481/pexels-photo-2261481.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/2261481/", fen: { x: 0.14, y: 0.02, w: 0.72 } },
    /* 9 et 10, ajoutes le 2026-08-01. Il manquait deux choses aux huit
       premieres : un GESTE — huit natures mortes, pas une seule main —
       et le ratelier dont la premiere regle de la salle parle. */
    { n: 9, emploi: "le geste — une main posee sur la barre dans le ratelier", large: true,
      src: "url:" + PX + "/6389504/pexels-photo-6389504.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/6389504/", fen: { x: 0, y: 0.06, w: 1 } },
    { n: 10, emploi: "materiel — le ratelier de disques contre le mur de blocs", large: true,
      /* La fenetre coupe a 11 % a gauche et s'arrete a 81 % : un sac
         leste porte un NOM DE FABRIQUANT imprime en blanc dans le coin
         gauche, et le montant de droite porte une plaque de firme
         vissee. Ni l'un ni l'autre ne se recadre dans la page — on
         tranche a la source, comme pour le mot « RUN » du heros. */
      src: "url:" + PX + "/27810162/pexels-photo-27810162.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/27810162/", fen: { x: 0.11, y: 0.04, w: 0.70 } }
  ],

  /* HEBERGEMENT ET TOURISME — AUBERGE DES CAPS.
     Le piege ici n'est pas la marque, c'est le CLIMAT. Une chambre
     d'hotel de banque d'images est presque toujours mediterraneenne ou
     tropicale : mur de pierre blanche et volets bleus, ou palmiers
     derriere la porte-fenetre. Posee sous « auberge de bord de
     fleuve », elle ment sur ce que le client va trouver en arrivant.
     Ecartes pour ca : `15717924` (mur de pierre du sud, applique en
     fer forge), `14025022` (ventilateur de plafond et palmiers),
     `13722872` (une image de synthese, pas une photographie). */
  hotel: [
    { n: 1, emploi: "heros — l'auberge au bord du lac gele, fumee a la cheminee", xl: true,
      src: "url:" + PX + "/37321970/pexels-photo-37321970.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/37321970/", fen: { x: 0, y: 0.06, w: 1 } },
    { n: 2, emploi: "bande pleine largeur — les chalets eclaires dans la boulaie, a la brunante", xl: true,
      src: "url:" + PX + "/30490316/pexels-photo-30490316.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/30490316/", fen: { x: 0, y: 0.10, w: 1 } },
    { n: 3, emploi: "chalet — pignon vitre sous la neige, pins derriere", large: true,
      src: "url:" + PX + "/6530842/pexels-photo-6530842.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/6530842/", fen: { x: 0, y: 0.18, w: 1 } },
    { n: 4, emploi: "salle a manger — murs de billots, lustre, tables dressees", large: true,
      src: "url:" + PX + "/29109683/pexels-photo-29109683.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/29109683/", fen: { x: 0, y: 0.08, w: 1 } },
    { n: 5, emploi: "chambre — deux lits, murs de bois rond, edredons blancs",
      src: "url:" + PX + "/14465275/pexels-photo-14465275.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/14465275/", fen: { x: 0.14, y: 0.02, w: 0.72 } },
    { n: 6, emploi: "mezzanine — pignon vitre sur la sapiniere givree",
      src: "url:" + PX + "/6087207/pexels-photo-6087207.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/6087207/", fen: { x: 0.14, y: 0.02, w: 0.72 } },
    { n: 7, emploi: "dependance — remise de bois grise sous les epinettes",
      src: "url:" + PX + "/10772256/pexels-photo-10772256.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/10772256/", fen: { x: 0.09, y: 0.08, w: 0.82 } },
    { n: 8, emploi: "chalet — la porte vitree sur la neige, vue de l'interieur",
      src: "url:" + PX + "/8162940/pexels-photo-8162940.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/8162940/", fen: { x: 0.09, y: 0.12, w: 0.82 } },
    /* NEUF DE PLUS, 2026-08-01. Huit images sur une page de 13 000 px
       faisaient 0,6 grande image par millier de pixels ; les trois
       references relevees en font 3,9 a 6,2. Un site dont le sujet est
       un PAYSAGE montrait le paysage en vignette. Six des neuf sont en
       `portrait` : une piste horizontale d'images DEBOUT est ce qui
       remplace les listes a deux colonnes.
       Ecartes en les ouvrant en pleine resolution :
       · `8112294` — un poele qui porte le nom du fabriquant en relief
         sur la porte et un medaillon rouge lisible ;
       · `11327757` — une chambre avec une tenture a motif imprime
         repete, un cadre au mur et deux plantes : elle CONTREDIT le
         texte, qui promet « un lit, une lampe, une fenetre » ;
       · `27641249` — un visage de trois quarts, identifiable ;
       · `7789861` — un chassis turquoise, hors palette ;
       · `29846585` — un lac a l'heure bleue, superbe, mais l'horizon
         porte une bande orange et les lumieres d'une ville : le
         cadrage qui les retire ne laisse plus assez de pixels pour
         une bande pleine largeur nette. */
    { n: 9, emploi: "bande pleine largeur — brume sur le lac gele, rangee d'arbres nus", xl: true,
      /* `w` a 0,92 : un panneau routier rond se tient au bord droit. */
      src: "url:" + PX + "/30352745/pexels-photo-30352745.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/30352745/", fen: { x: 0, y: 0.10, w: 0.92 } },
    { n: 10, emploi: "debout — les pins au bord du lac gele, reflets sur la glace", portrait: true,
      src: "url:" + PX + "/20100203/pexels-photo-20100203.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/20100203/", fen: { x: 0, y: 0.10, w: 1 } },
    /* Source en 6:7, presque carree : a `w = 1` la coupe 5:7 demanderait
       2 688 px de haut sur une image qui n'en a que 2 240. `w` descend
       a 0,82 et le cadre tient. Piege 58 */
    { n: 11, emploi: "debout — le chemin qui monte entre les conifères, mont derriere", portrait: true,
      src: "url:" + PX + "/15871965/pexels-photo-15871965.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/15871965/", fen: { x: 0.09, y: 0, w: 0.82 } },
    { n: 12, emploi: "debout — la corde de bois de face, bouts de buches sous la neige", portrait: true,
      src: "url:" + PX + "/11183216/pexels-photo-11183216.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/11183216/", fen: { x: 0, y: 0.03, w: 1 } },
    { n: 13, emploi: "debout — le poele a bois allume, mur de planches", portrait: true,
      src: "url:" + PX + "/12730495/pexels-photo-12730495.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/12730495/", fen: { x: 0, y: 0.02, w: 1 } },
    { n: 14, emploi: "debout — la table dressee, chandelles et branches de sapin", portrait: true,
      src: "url:" + PX + "/6232597/pexels-photo-6232597.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/6232597/", fen: { x: 0, y: 0, w: 1 } },
    { n: 15, emploi: "detail — la fenetre givree, cristaux de glace sur le carreau", large: true,
      src: "url:" + PX + "/10262197/pexels-photo-10262197.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/10262197/", fen: { x: 0, y: 0.08, w: 1 } },
    { n: 16, emploi: "debout — le sentier dans la boulaie enneigee, troncs nus", portrait: true,
      src: "url:" + PX + "/30124961/pexels-photo-30124961.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/30124961/", fen: { x: 0, y: 0, w: 1 } },
    { n: 17, emploi: "detail — mur de billots gris, petite fenetre et glacons au debord", large: true,
      src: "url:" + PX + "/20558770/pexels-photo-20558770.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/20558770/", fen: { x: 0, y: 0.05, w: 1 } }
  ],

  /* CLINIQUE ET SANTE — CLINIQUE DU RIVERAIN.
     Ecartes : `33812025` porte le nom et le logo d'un vrai centre
     medical grave sur le mur, `7108284` une enseigne en cyrillique,
     `12454146` est une piece verdatre et bruitee qui ne rassurerait
     personne. Aucun patient, aucun soignant : un visage dans une
     salle d'attente est une donnee de sante. */
  clinique: [
    { n: 1, emploi: "heros — salle d'attente claire, accueil et sieges", xl: true,
      src: "url:" + PX + "/8459996/pexels-photo-8459996.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/8459996/", fen: { x: 0, y: 0.06, w: 1 } },
    { n: 2, emploi: "bande pleine largeur — corridor vitre et rangee de sieges", xl: true,
      src: "url:" + PX + "/19921278/pexels-photo-19921278.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/19921278/", fen: { x: 0, y: 0.06, w: 1 } },
    { n: 3, emploi: "salle d'examen — table, bureau et fauteuil", large: true,
      src: "url:" + PX + "/7789602/pexels-photo-7789602.jpeg" + GRAND, licence: LIC_PX,
      /* Source en PORTRAIT : a 0,20 la fenetre 16/9 ne gardait que du
         mur nu, la table d'examen etait dessous. Piege 58 */
      page: "https://www.pexels.com/photo/7789602/", fen: { x: 0, y: 0.42, w: 1 } },
    { n: 4, emploi: "corridor — portes vitrees, sol clair", large: true,
      src: "url:" + PX + "/16571738/pexels-photo-16571738.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/16571738/", fen: { x: 0, y: 0.22, w: 1 } },
    /* Fenetre decalee a droite : une boite de produit avec un mot
       lisible occupe le bord gauche de la source. */
    { n: 5, emploi: "detail — bequilles appuyees au mur, sieges de la salle",
      src: "url:" + PX + "/13185365/pexels-photo-13185365.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/13185365/", fen: { x: 0.26, y: 0.02, w: 0.72 } },
    { n: 6, emploi: "bureau — poste de consultation, chaises visiteurs",
      src: "url:" + PX + "/7789610/pexels-photo-7789610.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/7789610/", fen: { x: 0.09, y: 0.18, w: 0.82 } },
    { n: 7, emploi: "corridor — lumiere douce, portes fermees",
      src: "url:" + PX + "/6234630/pexels-photo-6234630.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/6234630/", fen: { x: 0.14, y: 0.42, w: 0.72 } }
  ],

  /* SERVICES JURIDIQUES — CABINET VALLIERES.
     Ecarte : `3927126` — les seuls livres de droit nets de la banque
     portent « DHAKA REPORTS » et le nom d'un vrai cabinet dore sur le
     dos. Toutes les vues de « bureau d'avocat » de la banque montrent
     en plus une personne posant en costume ; on n'en prend aucune.
     Ce qui reste est de l'ARCHITECTURE et de l'ARCHIVE : ce que le
     droit a de plus impersonnel, et c'est juste. */
  juridique: [
    { n: 1, emploi: "heros — colonnade en enfilade, noir et blanc", xl: true,
      src: "url:" + PX + "/2935910/pexels-photo-2935910.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/2935910/", fen: { x: 0, y: 0.06, w: 1 } },
    { n: 2, emploi: "bande pleine largeur — rayonnages mobiles d'archives", xl: true,
      src: "url:" + PX + "/31139000/pexels-photo-31139000.jpeg" + GRAND, licence: LIC_PX,
      /* La fenetre s'arrete a 74 % : au-dela, une travee de reliures
         porte « AMERICAN LAW REPORTS ANNOTATED » en clair sur les dos.
         C'est une collection editoriale reelle, donc une marque. Elle
         etait noyee sous un voile a 88 % dans la page — mais un voile
         est un reglage de mise en page, pas un recadrage : qui le
         baissera fera revenir le titre. On coupe a la source. */
      page: "https://www.pexels.com/photo/31139000/", fen: { x: 0, y: 0.10, w: 0.74 } },
    { n: 3, emploi: "entree — porte de bronze entre deux colonnes de marbre",
      src: "url:" + PX + "/15498156/pexels-photo-15498156.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/15498156/", fen: { x: 0.09, y: 0.24, w: 0.82 } },
    { n: 4, emploi: "entree — portail classique et emmarchement",
      src: "url:" + PX + "/8652755/pexels-photo-8652755.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/8652755/", fen: { x: 0.09, y: 0.20, w: 0.82 } },
    { n: 5, emploi: "detail — chapiteaux et lanterne de rue",
      src: "url:" + PX + "/1000740/pexels-photo-1000740.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/1000740/", fen: { x: 0.14, y: 0.02, w: 0.72 } }
  ],

  /* PHOTOGRAPHE ET CREATIF — ATELIER LUMEN.
     Ecartes, et pour une raison propre au metier : LE FILM PORTE LE
     NOM DE SON FABRICANT SUR LA BORDURE. `7206568` et `10276039` sont
     de belles images de negatifs, et chaque perforation est legendee
     « KODAK ». Ce n'est pas un cadrage malheureux, c'est la nature du
     support. On montre donc le STUDIO et l'ECLAIRAGE, pas la
     pellicule. */
  photo: [
    { n: 1, emploi: "heros — fond de papier deroule et parapluie", xl: true,
      src: "url:" + PX + "/6989087/pexels-photo-6989087.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/6989087/", fen: { x: 0, y: 0.06, w: 1 } },
    { n: 2, emploi: "bande pleine largeur — le studio monte, noir et blanc", xl: true,
      src: "url:" + PX + "/2388569/pexels-photo-2388569.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/2388569/", fen: { x: 0, y: 0.06, w: 1 } },
    { n: 3, emploi: "studio — boites a lumiere et fond blanc", large: true,
      src: "url:" + PX + "/134469/pexels-photo-134469.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/134469/", fen: { x: 0, y: 0.08, w: 1 } },
    /* LA FENETRE NE GARDE QUE 40 % DE LA LARGEUR, ET C'EST UN REJET
       DEGUISE EN RECADRAGE. Les deux boites a lumiere de cette source
       portent le nom de leur fabricant imprime en clair sur la toile,
       et le mur de droite porte un lettrage peint. Le site l'avait
       « regle » en posant l'image dans une bande verticale de 250 px
       avec un `object-position` a 5 % : la marque disparaissait du
       rendu et restait dans le fichier. Cinquieme fois que ce cas se
       presente sur les douze secteurs, et cinquieme fois qu'on tranche
       au meme endroit — a la source. Ce qui reste : un flash nu sur
       son pied, mur blanc, plafond noir. */
    { n: 4, emploi: "studio — un flash nu sur son pied, mur blanc",
      src: "url:" + PX + "/7383644/pexels-photo-7383644.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/7383644/", fen: { x: 0.02, y: 0.50, w: 0.40 } },
    { n: 5, emploi: "studio — projecteurs sur pied, fond neutre",
      src: "url:" + PX + "/53265/pexels-photo-53265.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/53265/", fen: { x: 0.14, y: 0.02, w: 0.72 } },
    /* TOUT LE RAYON « APPAREIL PHOTO » EST ECARTE EN BLOC, et c'est la
       meme cause que les negatifs : un boitier PORTE LE NOM DE SON
       FABRICANT grave sur le prisme, en gros, au centre de l'image.
       Vingt-trois candidats regardes, vingt-trois marques. Un secteur
       ou l'objet du metier est un support de logo se montre par ce
       qu'il PRODUIT et par le lieu ou il travaille — le tirage
       encadre et le studio — jamais par l'outil. */
    { n: 6, emploi: "tirages — dix epreuves encadrees, accrochage de galerie", large: true,
      src: "url:" + PX + "/310435/pexels-photo-310435.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/310435/", fen: { x: 0, y: 0.06, w: 1 } },
    { n: 7, emploi: "studio — deux boites a lumiere de part et d'autre du fond", large: true,
      src: "url:" + PX + "/30332804/pexels-photo-30332804.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/30332804/", fen: { x: 0, y: 0.06, w: 1 } },

    /* LES HUIT ŒUVRES — 2026-08-01.
       Le site montrait SEPT images, toutes du materiel de studio :
       des boites a lumiere, un flash nu, des projecteurs. Un portfolio
       de photographe SANS PHOTOGRAPHIE est un site vide, et c'est le
       defaut le plus grave des douze secteurs.

       CE QU'ON A CHANGE, ET POURQUOI ON A CHANGE LE METIER PLUTOT QUE
       LA VERITE. L'atelier annoncait « portrait d'entreprise,
       architecture, produit ». Aucune source libre ne donne un
       portrait d'entreprise sans visage identifiable ; montrer une
       prestation de portrait sans une seule image de portrait serait
       une faussete par omission. L'atelier fait donc de
       l'ARCHITECTURE, de l'INTERIEUR et de l'OBJET — trois pratiques
       qui se photographient sans personne dedans.

       UN REJET QUI JUSTIFIE A LUI SEUL LA REGLE DE LA PLEINE
       RESOLUTION : `26316117`, deux cruches de terre dans une lumiere
       rasante, tres belle image. La cruche porte « CACHACA » et
       « NHEGO » MOULES EN RELIEF sur la panse, parfaitement lisibles.
       Invisible sur une planche-contact, evident en taille reelle.

       LES SOURCES EN PORTRAIT. Six des huit sont en 2:3 ou 4:5. Une
       sortie 16/9 n'y prend que 37 a 45 % de la hauteur : le cadre se
       pose EN HAUT si `fen.y` vaut zero. Chaque `y` ci-dessous est
       calcule pour tomber sur le sujet, pas sur le ciel.  Piege 57 */
    { n: 8, emploi: "oeuvre · architecture — sous-face de dalle et rampe, noir et blanc", xl: true,
      src: "url:" + PX + "/2747599/pexels-photo-2747599.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/2747599/", fen: { x: 0, y: 0.30, w: 1 } },
    { n: 9, emploi: "oeuvre · architecture — facade de beton, fenetres vertes en quinconce", large: true,
      src: "url:" + PX + "/9473066/pexels-photo-9473066.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/9473066/", fen: { x: 0, y: 0.08, w: 1 } },
    /* La fenetre se resserre a 76 % : a pleine largeur, le sujet ne
       faisait qu'un tiers du cadre et les deux autres tiers etaient du
       ciel vide. On serre, et l'air reste voulu. */
    { n: 10, emploi: "oeuvre · architecture — volume clair et couronne d'acier sur le ciel", large: true,
      src: "url:" + PX + "/3467152/pexels-photo-3467152.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/3467152/", fen: { x: 0.16, y: 0.22, w: 0.76 } },
    /* La tour en contre-plongee perd toute sa fuite dans un 16/9 pris
       en haut : ce qui tient, c'est le V de reflets a la BASE. */
    { n: 11, emploi: "oeuvre · architecture — le V de reflets a la base d'une tour de verre", large: true,
      src: "url:" + PX + "/1662159/pexels-photo-1662159.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/1662159/", fen: { x: 0, y: 0.45, w: 1 } },
    { n: 12, emploi: "oeuvre · architecture — une fenetre unique dans un mur clair", large: true,
      src: "url:" + PX + "/1870768/pexels-photo-1870768.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/1870768/", fen: { x: 0, y: 0.30, w: 1 } },
    { n: 13, emploi: "oeuvre · architecture — bandeau de fenetres etroites sur un angle de beton", large: true,
      src: "url:" + PX + "/16271998/pexels-photo-16271998.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/16271998/", fen: { x: 0, y: 0.10, w: 1 } },
    { n: 14, emploi: "oeuvre · objet — ceramique blanche et son ombre portee, en studio", xl: true,
      src: "url:" + PX + "/10726947/pexels-photo-10726947.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/10726947/", fen: { x: 0, y: 0.10, w: 1 } },
    /* LA LEGENDE A ETE REECRITE APRES AVOIR REGARDE LA COUPE. La
       source montre deux roses dans un vase peint ; un 16/9 sur une
       source 2:3 ne prend que 30 % de la hauteur, et le vase est
       DEHORS. La premiere ligne disait « deux roses dans un vase
       peint » — la coupe ne montre aucun vase. On decrit ce que
       l'image montre, jamais ce que la source contenait. */
    { n: 15, emploi: "oeuvre · objet — deux roses dans la lumiere rasante, fond d'ombre", large: true,
      src: "url:" + PX + "/11900137/pexels-photo-11900137.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/11900137/", fen: { x: 0.10, y: 0.27, w: 0.80 } },

    /* TROIS ŒUVRES DE PLUS, ET DEUX SONT EN PORTRAIT — 2026-08-01.
       L'accrochage n'avait que du 16/9 : dix rectangles de meme forme
       a la suite se lisent comme une planche-contact, pas comme un
       mur de salle. Le format PORTRAIT est ce qui casse la file, et
       c'est aussi le format d'un tirage encadre.

       CE QUI A ETE ECARTE, EN PLEINE RESOLUTION : `7119222`, deux
       vases pointilles sur un mur terracotta — aucune marque, mais
       la meme nature morte claire que `10726947`, et le mur rose
       apporte une couleur d'accent que ce site n'a pas. `20874963`
       et `5480815`, des tours a balcons : des fenetres d'habitation
       ou l'on distingue des interieurs. `3806603`, un portrait.

       `11831530` porte des graffitis au pied du mur : la fenetre
       part de `y = 0` et la coupe portrait s'arrete bien au-dessus.
       Verifie a l'ouverture du fichier, pas sur la planche. */
    { n: 16, emploi: "oeuvre · architecture — l'arete en chevron d'un volume de beton, contre-plongee", portrait: true,
      src: "url:" + PX + "/11831530/pexels-photo-11831530.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/11831530/", fen: { x: 0, y: 0, w: 1 } },
    { n: 17, emploi: "oeuvre · architecture — une dalle en porte-a-faux sur une facade de beton, noir et blanc", portrait: true,
      src: "url:" + PX + "/32466579/pexels-photo-32466579.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/32466579/", fen: { x: 0, y: 0.02, w: 1 } },
    { n: 18, emploi: "oeuvre · objet — branches de saule et leur ombre sur un mur de marbre sombre", large: true,
      src: "url:" + PX + "/7814445/pexels-photo-7814445.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/7814445/", fen: { x: 0, y: 0.04, w: 1 } }
  ],

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
    /* Le heros et la bande pleine largeur passent en `xl` : sur une
       fenetre de 1280 en densite 1,5, une image de 1280 est demandee a
       1920 px reels et arrive floue. D-660 */
    /* `3935315` etait un dos de canape en cuir beige qui remplit la
       moitie basse du cadre : correct dans une carte de 218 px, mort
       en plein ecran. Un heros se choisit A LA TAILLE OU IL SERA VU. */
    { n: 1, emploi: "heros — aire ouverte sur la cour, plein cadre", xl: true,
      src: "url:" + PX + "/280239/pexels-photo-280239.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/280239/", fen: { x: 0, y: 0.06, w: 1 } },
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
      page: "https://www.pexels.com/photo/8180361/", fen: { x: 0.09, y: 0.04, w: 0.82 } },
    /* DEUX BANDES REJETEES POUR UN DETAIL QU'ON NE VOIT QU'EN OUVRANT :
       `12579242` porte une antenne parabolique avec sa MARQUE
       imprimee dessus, en gros, au premier plan ; `19309671` montre
       une plaque d'immatriculation lisible et un numero civique. La
       retenue ne montre ni l'un ni l'autre. */
    { n: 16, emploi: "bande pleine largeur — rangee de maisons de quartier", xl: true,
      src: "url:" + PX + "/3958954/pexels-photo-3958954.jpeg" + GRAND, licence: LIC_PX,
      page: "https://www.pexels.com/photo/3958954/", fen: { x: 0, y: 0.08, w: 1 } }
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
/* `portrait` — ajoute pour la refonte « magazine » de la coiffure.
   Les trois formats ci-dessus sont tous en PAYSAGE : une double page
   de magazine se tient sur des images DEBOUT, et recadrer une source
   2:3 en 4:3 jette la moitie du geste. 1000 x 1400, soit 5:7, la
   proportion d'une pleine page de revue. */
const PORTRAIT = { w: 1000, h: 1400 };

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
    const dim = t.xl ? XL : t.large ? LARGE : t.portrait ? PORTRAIT : NORMAL;
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
/* UNE PASSE PARTIELLE NE DOIT PAS EFFACER LES LICENCES DES AUTRES.
   D-662
   L'outil reecrivait le registre ENTIER avec les seuls secteurs
   demandes. Douze secteurs sourcés un par un, et à la fin le fichier
   ne contenait plus que le dernier — sept lignes sur quatre-vingt-dix.
   Rien ne le disait : le fichier existait, il était bien formé, il
   était juste vide de tout le reste.
   Une licence effacée ne se remarque qu'au moment où quelqu'un la
   demande, c'est-à-dire trop tard. Le registre est donc FUSIONNÉ
   quand on ne demande qu'une partie des secteurs, et réécrit en
   entier seulement sur une passe complète. Même correctif que dans
   `polices-demos.mjs`, où le piège avait été vu à l'écriture. */
const cheminReg = path.join(SORTIE, "_licences.json");
let registre = REGISTRE;
if (demandes.length && fs.existsSync(cheminReg)) {
  const ancien = JSON.parse(fs.readFileSync(cheminReg, "utf8"));
  const neufs = new Set(REGISTRE.map((x) => x.fichier));
  registre = ancien.filter((x) => !neufs.has(x.fichier)).concat(REGISTRE);
}
registre.sort((a, b) => {
  const s = (x) => x.fichier.replace(/-\d+\.webp$/, "");
  const n = (x) => Number(/-(\d+)\.webp$/.exec(x.fichier)[1]);
  return s(a) === s(b) ? n(a) - n(b) : s(a).localeCompare(s(b));
});
fs.writeFileSync(cheminReg, JSON.stringify(registre, null, 1));
console.log("registre des licences :", path.relative(RACINE, path.join(SORTIE, "_licences.json")).replace(/\\/g, "/"));
