/* ============================================================
   LE REGISTRE DES SITES PHOTOGRAPHIES — une seule source

   Extrait de `demos-capture.mjs` le 2026-08-01. Deux outils le
   lisent maintenant : la capture par tuiles (`demos-capture.mjs`) et
   la capture du PREMIER ECRAN (`ecrans-secteurs.mjs`).

   POURQUOI L'EXTRAIRE PLUTOT QUE LE RECOPIER.
   Les `masques` ne sont pas du confort : ce sont les marques
   reelles, les numeros et les adresses qu'on refuse de publier. Un
   registre recopie se corrige d'un cote et pas de l'autre, et la
   marque ressort dans la capture de l'autre outil. Une regle de
   veracite se corrige PARTOUT, en une fois — CLAUDE.md regle A.
   ============================================================ */

export const PROJETS = {
  garage: {
    dossier: "C:/Users/tiwil/APED-AGENCY/demo-carroserie",
    cmd: ["run", "dev", "--", "--port", "5211", "--strictPort"],
    port: 5211,
    /* Le titre du heros est a 650-780 px : un depart a 300 le pose
       au milieu de la premiere fenetre. */
    depart: 300,
    masques: [
      [/I-CAR Gold Class/gi, "Certification carrosserie"],
      [/CAA[-\s]?Qu[ée]bec/gi, "Association automobile"],
      [/\bPPG\b/g, "Peinture homologuée"],
      [/514\s?555[-\s]?0192/g, "000 000-0000"],
      [/1855,\s*rue du Méridien[^.]*/gi, "Adresse sur demande"]
    ],
    retirer: ["4,9", "327 avis", "★"]
  },
  design: {
    dossier: "C:/Users/tiwil/APED-AGENCY/demo-design-int-rieur",
    cmd: ["run", "dev", "--", "-p", "3101"],
    port: 3101,
    /* La carte du heros vit tout en bas de la premiere fenetre,
       940-1300 px. */
    depart: 820,
    masques: [
      [/bonjour@studionorden\.ca/gi, "courriel@exemple.ca"],
      [/418\s?555[-\s]?0192/g, "000 000-0000"],
      [/400,\s*rue Saint-Paul Est[^.]*/gi, "Adresse sur demande"],
      [/Marie-Ève L\./g, "Cliente"],
      [/Jean-Philippe D\./g, "Client"],
      [/Catherine & Marc B\./g, "Clients"]
    ],
    retirer: []
  },
  restau: {
    dossier: "C:/Users/tiwil/APED-AGENCY/restau",
    cmd: ["run", "dev", "--", "-p", "3102"],
    port: 3102,
    /* LE « HEROS QUI NOIRCIT AU DEFILEMENT » N'EXISTE PAS.  D-635
       D-620 disait : ce site rend son heros au chargement et NOIR
       PLEIN des qu'on l'a fait defiler d'un pixel, « reproduit a
       chaque essai ». Il a donc ete photographie sans bouger
       (`fixe: true`), et la cause n'a jamais ete cherchee.
       Remesure du 2026-07-31 : 26 paliers de 600 px, ecart-type de
       luminance releve a chaque palier, plus une pleine page. AUCUNE
       image plate — le minimum est 22,8, le seuil de platitude est 3.
       La vraie cause etait D-618 / piege 40 : le selecteur de
       masquage `[class*="cursor"]` attrapait `cursor-none`, que ce
       site pose sur son enveloppe, et masquait LA PAGE ENTIERE. Elle
       a ete corrigee ; `fixe` est un contournement qui lui a survecu
       et qui, lui, empechait de photographier autre chose que la
       premiere fenetre. Il tombe.
       Lecon, et c'est la troisieme fois : quand on contourne au lieu
       de chercher, le contournement reste apres le correctif. */
    depart: 0,
    masques: [
      [/Le Devoir/g, "Quotidien national"],
      [/Tastet/g, "Guide gourmand"],
      [/En Route/g, "Magazine de bord"],
      [/OpenTable/g, "Réservation"],
      [/\bResy\b/g, "Réservation"],
      [/Gaspor/g, "Ferme partenaire"],
      [/Miels d'Anicet/g, "Miellerie"],
      [/march[ée]\s+Jean-Talon/gi, "marché public"],
      [/514\s?555[-\s]?0173/g, "000 000-0000"],
      [/5612,\s*boulevard Saint-Laurent/gi, "Adresse sur demande"]
    ],
    retirer: []
  },
  /* ---------- LES SITES DE SECTEUR ----------  D-653
     Des fichiers STATIQUES du depot, servis par `tools/serve.mjs`.
     Rien a demarrer, rien a masquer : ils sont ecrits ici, donc les
     coordonnees y sont deja neutres et aucune marque reelle n'y
     figure. Ce qui vaut pour eux, c'est le reste de la chaine — la
     couture par tuiles, la detection des scenes epinglees, le refus
     d'une capture plate. */
  "secteur-construction": {
    statique: true, port: 8099, chemin: "/demos-secteurs/construction/index.html",
    depart: 0, masques: [], retirer: []
  },
  "secteur-immobilier": {
    statique: true, port: 8099, chemin: "/demos-secteurs/immobilier/index.html",
    depart: 0, masques: [], retirer: []
  },
  "secteur-boutique": {
    statique: true, port: 8099, chemin: "/demos-secteurs/boutique/index.html",
    depart: 0, masques: [], retirer: []
  },
  "secteur-coiffure": {
    statique: true, port: 8099, chemin: "/demos-secteurs/coiffure/index.html",
    depart: 0, masques: [], retirer: []
  },
  "secteur-gym": {
    statique: true, port: 8099, chemin: "/demos-secteurs/gym/index.html",
    depart: 0, masques: [], retirer: []
  },
  "secteur-hotel": {
    statique: true, port: 8099, chemin: "/demos-secteurs/hotel/index.html",
    depart: 0, masques: [], retirer: []
  },
  "secteur-clinique": {
    statique: true, port: 8099, chemin: "/demos-secteurs/clinique/index.html",
    depart: 0, masques: [], retirer: []
  },
  "secteur-juridique": {
    statique: true, port: 8099, chemin: "/demos-secteurs/juridique/index.html",
    depart: 0, masques: [], retirer: []
  },
  "secteur-photo": {
    statique: true, port: 8099, chemin: "/demos-secteurs/photo/index.html",
    depart: 0, masques: [], retirer: []
  },

  deneigement: {
    dossier: "C:/Users/tiwil/APED-AGENCY/MV-deneigement",
    cmd: ["run", "dev", "--", "-p", "3103"],
    port: 3103,
    /* Le titre « Votre entrée déneigée » est a 1020-1080 px. */
    depart: 680,
    masques: [
      [/\b\d{3}\s?\d{3}[-\s]\d{4}\b/g, "000 000-0000"],
      [/RBQ\s*:?\s*[\d-]+/gi, "RBQ 0000-0000-00"],
      [/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, "courriel@exemple.ca"]
    ],
    retirer: []
  }
};
