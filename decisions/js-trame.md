# Décisions — `js/trame.js`

> Le pourquoi du code de `js/trame.js`. Chaque entrée porte un identifiant
> qui figure aussi dans le fichier source : `grep D-042` trouve les deux.
> Ne se lit jamais en entier — on y arrive par l'identifiant.

## Table

- **D-557** — TRAME — L'ARETE QUANTIFIEE
- **D-558** — Amortissement critique. Aucun depassement, jamais : la
- **D-559** — Un bruit DETERMINISTE. Deux passages sur la meme frontiere
- **D-560** — La projection le long de l'axe de LECTURE. Elle n'est pas
- **D-561** — UN PASSAGE. `sens` decide de l'axe, `graine` decide de la
- **D-562** — L'ECRAN N'EST PAS UN ELEMENT. `documentElement` mesure
- **D-563** — CHAQUE VOILE DIT DE QUEL PASSAGE IL EST. Sans ce nom, un
- **D-564** — La cible peut bouger pendant le passage : une frontiere

---

## D-557 — TRAME — L'ARETE QUANTIFIEE

============================================================
  TRAME — L'ARETE QUANTIFIEE
  ------------------------------------------------------------
  PHASE 10. Ce fichier ne contient pas un effet : il contient LE
  PASSAGE, et il n'y en a qu'un.

  D'OU IL VIENT, ET CE QU'ON EN A GARDE.
  Reference etudiee : le « pixel reveal » de la demo Framer
  `swisspixelreveal`, relevee par `tools/refs-mesure.mjs`, pas
  decrite de memoire. Les chiffres, tels que la page les rend :

    · une grille `repeat(25, 1fr)` de 400 tuiles, 25 x 16 ;
    · chaque tuile fait 57,6 x 56,2 px, en APLAT gris 230,230,230,
      rayon 0, aucune ombre, aucun degrade ;
    · le retrait est RADIAL depuis le centre — releve tuile par
      tuile, rendu en planche dans `tools/_refs/4-pixel-reveal/` ;
    · 74 paliers discrets, ecart median 20,2 ms entre deux etats ;
    · duree totale 1 480 ms ;
    · filme au protocole DevTools : la tuile ne s'EFFACE pas, elle
      RETRECIT sur son centre. A chaque image le bord reste un
      carre net. Ce n'est jamais un fondu.

  CE QU'ON PREND : la tuile en aplat, le retrecissement sur le
  centre, la quantification du front, la possibilite de varier le
  motif d'un passage a l'autre.

  CE QU'ON JETTE, ET POURQUOI :
  · 1 480 ms. Une frontiere ne retient pas un visiteur presse.
    Ici 420 ms au plus, et le passage se termine tout seul.
  · le motif RADIAL par defaut. Un front qui part du centre n'a
    pas de sens de lecture, et sur ce site la direction du
    balayage n'est jamais decorative : elle suit ce qu'elle
    decouvre. Le radial est donc reserve au seul passage qui n'a
    pas de sens de lecture — l'arrivee sur la page entiere.
  · 400 noeuds du DOM. Douze frontieres en feraient 4 800. On
    dessine dans UN canvas, comme `limaille.js` : une couche de
    composition, un `fillRect` par tuile, zero noeud.

  QUEL VERBE C'EST — la regle d'admission s'applique ici comme
  partout. Ce n'est pas un cinquieme verbe :
    · l'arete franche qui balaye et decouvre une forme deja la,
      c'est V1 · DEGAGER ;
    · l'arete n'est pas un trait de regle, c'est une TRAME de
      grains qui se resorbe, c'est la matiere de V3 · SOUDER.
  La trame est donc V1 dont l'arete est faite de V3. Les deux
  verbes existaient ; c'est leur composition qui est neuve.

  CE QU'IL NE FAIT JAMAIS :
  · il ne cache pas du texte plus longtemps que le passage — le
    voile est CREE au moment du passage et retire a la fin ;
  · il n'existe pas dans le CSS : aucun contenu ne depend de lui
    pour etre lisible, et rien ne demarre a opacite nulle ;
  · il n'est jamais scrubbe. Une animation scrubbee n'a pas
    d'etat de repos, et un voile arrete a mi-course est un
    defaut permanent.
  ============================================================

## D-558 — Amortissement critique. Aucun depassement, jamais : la

Amortissement critique. Aucun depassement, jamais : la
    reference se paye un ressort a 7,1 % de depassement (mesure
    sur la pile de cartes), et c'est exactement ce que la
    matiere du site refuse.

## D-559 — Un bruit DETERMINISTE. Deux passages sur la meme frontiere

Un bruit DETERMINISTE. Deux passages sur la meme frontiere
    doivent donner exactement la meme trame : une graine, pas un
    `Math.random()`. C'est la meme discipline que les quinze
    filets de `seedPositions()` dans `limaille.js` — sans elle,
    deux franchissements successifs scintillent.

## D-560 — La projection le long de l'axe de LECTURE. Elle n'est pas

La projection le long de l'axe de LECTURE. Elle n'est pas
    decorative : `bas` pour une page, un panneau, une capture ;
    `droite` pour un titre, un libelle, un filet. Le `radial` ne
    sert qu'a ce qui n'a pas de sens de lecture.

## D-561 — UN PASSAGE. `sens` decide de l'axe, `graine` decide de la

------------------------------------------------------------
    UN PASSAGE. `sens` decide de l'axe, `graine` decide de la
    texture du front, `duree` est le total AFFICHE, pas la duree
    d'une tuile : une tuile vit `vie` millisecondes et son depart
    est etale sur le reste. C'est ce qui fait qu'un front avance
    au lieu que tout parte ensemble.
    ------------------------------------------------------------

## D-562 — L'ECRAN N'EST PAS UN ELEMENT. `documentElement` mesure

L'ECRAN N'EST PAS UN ELEMENT. `documentElement` mesure
      TOUTE la page — trente mille pixels de haut sur ce site — et
      en faire un canvas demanderait 400 Mo de memoire graphique
      pour peindre une bande de 900 px. Quand la cible est la
      racine, la boite est la fenetre, et elle ne bouge pas.

## D-563 — CHAQUE VOILE DIT DE QUEL PASSAGE IL EST. Sans ce nom, un

CHAQUE VOILE DIT DE QUEL PASSAGE IL EST. Sans ce nom, un
      verificateur compte des voiles et doit DEVINER lequel
      manque — c'est arrive : six voiles pour sept passages
      attendus, et rien pour dire lequel etait absent. Un attribut
      de plus vaut mieux qu'une deduction.

## D-564 — La cible peut bouger pendant le passage : une frontiere

La cible peut bouger pendant le passage : une frontiere
        est declenchee EN DEFILANT. On relit sa boite et on ne
        touche qu'au `transform` — aucune ecriture qui invalide
        la mise en page. Un voile plein ecran, lui, est deja fixe :
        relire la racine chaque image ne dirait rien de neuf.

## D-634 · LA MUTATION PART AVANT LE DEMONTAGE.

*Extrait de `js/trame.js` le 2026-08-03.*

LA MUTATION PART AVANT LE DEMONTAGE.  D-634
`onFin` ne sert qu'a une chose chez ses deux appelants : MUTER
la page sous le couvert de la trame — changer de theme, charger
une autre piece. Il etait appele APRES le retrait du canevas :
la mutation se voyait donc a nu pendant au moins une image, et
c'est ce trou qu'un fondu de page entiere servait a cacher. Un
couvercle qu'on retire avant de peindre ne couvre rien.
L'ordre inverse ne coute rien : le `degager` que l'appelant
lance dans `onFin` cree son propre canevas, qui part COUVRANT
et se pose par-dessus celui-ci avant qu'il ne parte. Les deux
se chevauchent d'une image, ce qui est exactement ce qu'on
veut.
