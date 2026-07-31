# Décisions — `css/secteurs.css`

> Le pourquoi du code de `css/secteurs.css`. Chaque entrée porte un identifiant
> qui figure aussi dans le fichier source : `grep D-042` trouve les deux.
> Ne se lit jamais en entier — on y arrive par l'identifiant.

## Table

- **D-299** — APED AGENCE — LES TREIZE APERCUS DE SECTEUR
- **D-300** — LES TREIZE APERCUS — construits dans `tools/proto-secteurs.*`
- **D-301** — LES TREIZE APERCUS DE SECTEUR — maquettes de vrais sites.
- **D-302** — Le cadre devient CONTENEUR : toute l'echelle interne se lit en
- **D-303** — LES PLAQUES. Une image absente doit se lire comme une DECISION,
- **D-304** — Les porte-plaques sont des GRILLES : un enfant en `height: 100 %`
- **D-305** — 01 · RESTAURATION — la carte imprimee et l'heure qu'on choisit
- **D-306** — 02 · BOUTIQUE — la grille de produits et le tiroir de panier
- **D-307** — 10,8 em et non 9,6 : mesure du prototype, « Passer a la caisse »
- **D-308** — Le bandeau d'ajout monte sur la vignette. Il se deplace de 100 %
- **D-309** — 03 · COIFFURE — la journee en creneaux
- **D-310** — Les six rangees sont EXPLICITES et egales. C'est ce qui permet au
- **D-311** — 04 · GYM — l'horaire de la semaine et les places qui restent
- **D-312** — La grille d'horaire prend sa hauteur NATURELLE et les jauges
- **D-313** — Trois lignes par cellule — heure, cours, entraineur — et elles se
- **D-314** — 05 · HEBERGEMENT — le calendrier et le total de sejour
- **D-315** — L'en-tete des jours est SORTI de la grille des dates. Les six
- **D-316** — 06 · GARAGE — le bon de travail chiffre
- **D-317** — 07 · CONSTRUCTION — l'echeancier de chantier
- **D-318** — L'echelle de mois partage EXACTEMENT la geometrie des rangees de
- **D-319** — Le trait du jour balaye l'echeancier : le temps avance, et les
- **D-320** — 08 · PAYSAGEMENT — le territoire et la tournee
- **D-321** — Le fond n'est plus un aplat gris : c'est un parcellaire. Un
- **D-322** — 09 · CLINIQUE — la prise de rendez-vous en trois etapes
- **D-323** — 10 · IMMOBILIER — la fiche de propriete
- **D-324** — Le fond du puits est la valeur de base des plaques, pas un jeton :
- **D-325** — LES PHOTOGRAPHIES.
- **D-326** — Le cadrage vertical est REGLE, pas laisse au hasard. Un
- **D-327** — LA PHOTO EST POSITIONNEE EN ABSOLU, et c'est ce qui fait marcher
- **D-328** — La bande : une photo large, et a cote une colonne de vignettes.
- **D-329** — 11 · JURIDIQUE — la convention et son echeancier
- **D-330** — 12 · PHOTOGRAPHE — l'index et la planche
- **D-331** — 13 · VOTRE INDUSTRIE ICI — la matiere
- **D-332** — LE CHAMP COUPE LES GRAINS. Sans lui, un grain disperse a 340 %
- **D-333** — MOUVEMENT REDUIT.

---

## D-299 — APED AGENCE — LES TREIZE APERCUS DE SECTEUR

============================================================
  APED AGENCE — LES TREIZE APERCUS DE SECTEUR

  Feuille HORS DU CHEMIN CRITIQUE, injectee par le bloc en ligne de
  `index.html` en meme temps que les scripts.
  Raison : les treize maquettes vivent dans un `<template>` et ne
  sont posees dans le document que par `js/main.js`. Sans script il
  n'y a pas d'apercu, donc ce CSS n'a rien a styler — le lire avant
  le premier rendu retardait le rendu pour du contenu absent.
  La legende, elle, reste dans le document et reste stylee par
  `app.css` : c'est elle qui porte la description de chaque metier.
  ============================================================

## D-300 — LES TREIZE APERCUS — construits dans `tools/proto-secteurs.*`

------------------------------------------------------------
  LES TREIZE APERCUS — construits dans `tools/proto-secteurs.*`
  puis verses ici. Ils surchargent `.mock` du bloc 16 :
  `container-type`, grille, fond, encre et police.
  Meme systeme d'echelle que les ecrans de Services : le cadre est
  conteneur, tout le reste est en `em` — c'est ce qui permet a la
  maquette de se REDUIRE au lieu d'etre coupee.
  ------------------------------------------------------------

## D-301 — LES TREIZE APERCUS DE SECTEUR — maquettes de vrais sites.

============================================================
  LES TREIZE APERCUS DE SECTEUR — maquettes de vrais sites.

  Ce fichier remplace le systeme `.mock-top` / `.mock-body` /
  `.mk-*` du bloc « 16. SECTEURS » de `css/app.css`, qui produisait
  treize wireframes gris. Il reprend, trait pour trait, le modele
  valide des QUATRE ECRANS (`.ecr-*`) :

  1. de VRAIS mots et de VRAIS nombres, en francais du Quebec ;
  2. une base typographique unique en `cqw`, tout le reste en `em`,
     pour que la maquette se REDUISE au lieu d'etre coupee ;
  3. `grid-template-columns: minmax(0, 1fr)` sur le cadre et
     `min-width: 0` sur les enfants, sinon la colonne implicite se
     dimensionne au contenu et deborde ;
  4. une hierarchie typographique reelle : un titre fort, des
     sous-titres, des donnees en mono ;
  5. les « photos » sont des plaques de trame a arrets FRANCS,
     jamais des rectangles gris.

  Treize archetypes de composition franchement differents : c'est
  le sujet meme de la section, qui affirme que le style change
  selon le metier. Une seule animation par maquette, en `transform`
  ou `opacity`, et seulement sur la maquette active.

  Regle de contraste appliquee sans exception :
  - `--ink-muted` ne se pose JAMAIS sur `--surface-1` (4,27:1 en
    clair, mesure — echec AA). Uniquement sur `--surface-0` et
    `--surface-2`.
  - aucun texte d'encre sur un aplat d'accent (3,66:1 en clair,
    2,94:1 en sombre). Sur l'accent, il n'y a que `--accent-ink`.
  - sur `--surface-inverse`, l'accent est `--accent-on-inverse`.
  ============================================================

## D-302 — Le cadre devient CONTENEUR : toute l'echelle interne se lit en

Le cadre devient CONTENEUR : toute l'echelle interne se lit en
    `cqw`, donc elle suit le cadre reel et pas la fenetre. La
    colonne est declaree parce que la colonne implicite d'une
    grille vaut `auto` : elle se dimensionnerait au contenu.

## D-303 — LES PLAQUES. Une image absente doit se lire comme une DECISION,

LES PLAQUES. Une image absente doit se lire comme une DECISION,
  pas comme un fichier manquant. Trame a arrets francs, aucune
  interpolation, donc aucun degrade : c'est la limaille de la
  marque a l'echelle d'une vignette. Six trames differentes, parce
  que treize maquettes qui partagent la meme texture se
  ressemblent. Ce sont les seules couleurs en dur du fichier, et
  elles sont volontairement identiques dans les deux themes : une
  photographie ne change pas de sujet quand on eteint la lampe.

## D-304 — Les porte-plaques sont des GRILLES : un enfant en `height: 100 %`

Les porte-plaques sont des GRILLES : un enfant en `height: 100 %`
  depend d'une hauteur definie du parent, une grille etire son
  enfant quoi qu'il arrive. C'est la difference entre une plaque
  qui remplit son cadre et une plaque haute de zero pixel.

## D-305 — 01 · RESTAURATION — la carte imprimee et l'heure qu'on choisit

============================================================
  01 · RESTAURATION — la carte imprimee et l'heure qu'on choisit
  Archetype : liste a filets de conduite (dot leaders) et prix
  alignes a droite, enseigne au-dessus, bandeau d'heures en pied
  inverse. C'est la composition de la carte papier, portee au web.
  Fonction montree : choisir son heure de table.
  ============================================================

## D-306 — 02 · BOUTIQUE — la grille de produits et le tiroir de panier

============================================================
  02 · BOUTIQUE — la grille de produits et le tiroir de panier
  Archetype : grille de trois colonnes a gauche, panier colle a
  droite en surface inverse, fil d'Ariane au-dessus. C'est la
  composition de commerce que les sites primes ont en commun :
  le prix sous l'image, le panier toujours visible.
  Fonction montree : ajouter au panier.
  ============================================================

## D-307 — 10,8 em et non 9,6 : mesure du prototype, « Passer a la caisse »

10,8 em et non 9,6 : mesure du prototype, « Passer a la caisse »
    en `nowrap` faisait 26 px de plus que sa colonne. Le bouton se
    casse maintenant sur deux lignes ET la colonne a de quoi le
    tenir — les deux, parce qu'un seul des deux ne suffisait pas.

## D-308 — Le bandeau d'ajout monte sur la vignette. Il se deplace de 100 %

Le bandeau d'ajout monte sur la vignette. Il se deplace de 100 %
  de SA PROPRE hauteur : la course reste juste a toutes les
  largeurs, alors qu'un trajet exprime en `em` se decalerait des
  que la base typographique change de palier. Aplat d'accent, donc
  texte en `--accent-ink` et jamais en encre : 4,70:1 au lieu de
  3,66:1.

## D-309 — 03 · COIFFURE — la journee en creneaux

============================================================
  03 · COIFFURE — la journee en creneaux
  Archetype : rail d'heures a gauche, colonne de prestations a
  droite, statut a l'extremite. C'est l'agenda du salon, la seule
  page que la cliente ouvre vraiment.
  Fonction montree : trouver le creneau encore libre.
  ============================================================

## D-310 — Les six rangees sont EXPLICITES et egales. C'est ce qui permet au

Les six rangees sont EXPLICITES et egales. C'est ce qui permet au
  curseur de se deplacer en pourcentage de sa propre hauteur : sa
  course reste exacte a 640 comme a 300 px, alors qu'un pas exprime
  en `em` se serait desaligne des que la base a change de palier.

## D-311 — 04 · GYM — l'horaire de la semaine et les places qui restent

============================================================
  04 · GYM — l'horaire de la semaine et les places qui restent
  Archetype : tableau de sept colonnes, une par jour, cellules
  pleines ou hachurees, puis les jauges de remplissage. C'est la
  grille d'horaire, la page la plus consultee d'un centre.
  Fonction montree : combien de places il reste.
  ============================================================

## D-312 — La grille d'horaire prend sa hauteur NATURELLE et les jauges

La grille d'horaire prend sa hauteur NATURELLE et les jauges
    occupent le reste. Les deux autres reglages ont ete essayes et
    mesures : jauges en `auto` avec trois barres laissait 55 % du
    cadre vide ; grille en `1fr` etirait les cellules a plus du
    double de leur contenu, et une cellule deux fois trop haute
    pour trois lignes redevient un gabarit.

## D-313 — Trois lignes par cellule — heure, cours, entraineur — et elles se

Trois lignes par cellule — heure, cours, entraineur — et elles se
  REPARTISSENT sur la hauteur. Avec une seule ligne calee en haut,
  la cellule agrandie devenait un rectangle vide surmonte d'un mot :
  exactement l'effet de gabarit que ce chantier corrige.

## D-314 — 05 · HEBERGEMENT — le calendrier et le total de sejour

============================================================
  05 · HEBERGEMENT — le calendrier et le total de sejour
  Archetype : chambre a gauche (plaque + specifications), mois
  complet a droite avec la plage de dates et le total. C'est le
  moteur de reservation directe, la seule chose qui separe un
  hotel d'une commission a 18 %.
  Fonction montree : la plage de dates qui se pose et son total.
  ============================================================

## D-315 — L'en-tete des jours est SORTI de la grille des dates. Les six

L'en-tete des jours est SORTI de la grille des dates. Les six
  rangees d'une grille unique n'auraient pas eu la meme hauteur —
  l'en-tete est plus petit — et le reperage de la plage en
  `100 % / 6` aurait ete faux d'une demi-cellule. Cinq rangees
  egales, la plage se pose au pixel.

## D-316 — 06 · GARAGE — le bon de travail chiffre

============================================================
  06 · GARAGE — le bon de travail chiffre
  Archetype : document tabulaire. Code de piece, description,
  heures, montant ; accolade de somme ; sous-total, taxes, total.
  C'est la soumission ecrite, le seul document que le client lit
  avant de dire oui.
  Fonction montree : l'estimation qui se totalise.
  ============================================================

## D-317 — 07 · CONSTRUCTION — l'echeancier de chantier

============================================================
  07 · CONSTRUCTION — l'echeancier de chantier
  Archetype : diagramme a barres horizontales sur une echelle de
  mois, avec le trait « aujourd'hui ». C'est ce que le client d'un
  entrepreneur veut savoir : ou en est mon chantier.
  Fonction montree : l'avancement, phase par phase.
  ============================================================

## D-318 — L'echelle de mois partage EXACTEMENT la geometrie des rangees de

L'echelle de mois partage EXACTEMENT la geometrie des rangees de
  phases : meme premiere colonne de 6,4 em, meme derniere de
  2,6 em. Sans ca, « OCT » ne tombe pas au-dessus d'octobre, et un
  echeancier dont l'echelle ment ne vaut rien.

## D-319 — Le trait du jour balaye l'echeancier : le temps avance, et les

Le trait du jour balaye l'echeancier : le temps avance, et les
  phases se lisent par rapport a lui.
  Le trait est un bloc AUSSI LARGE que la zone des barres, avec une
  seule bordure a gauche. Sa course s'exprime donc en pourcentage
  de sa propre largeur, c'est-a-dire de la zone : elle reste juste
  a toutes les largeurs, sans une valeur en dur. Ce que le bloc
  deborde a droite est invisible — il n'a pas de fond.

## D-320 — 08 · PAYSAGEMENT — le territoire et la tournee

============================================================
  08 · PAYSAGEMENT — le territoire et la tournee
  Archetype : plan quadrille a gauche avec la zone desservie et le
  trace du passage, feuille de route a droite. C'est le metier :
  un territoire, des adresses, une heure de reprise.
  Fonction montree : le passage qui progresse sur le territoire.
  ============================================================

## D-321 — Le fond n'est plus un aplat gris : c'est un parcellaire. Un

Le fond n'est plus un aplat gris : c'est un parcellaire. Un
    plan vide ne se lit pas comme un territoire, il se lit comme
    une zone de chargement. Les filets sont des jetons, donc le
    parcellaire suit le theme tout seul.

## D-322 — 09 · CLINIQUE — la prise de rendez-vous en trois etapes

============================================================
  09 · CLINIQUE — la prise de rendez-vous en trois etapes
  Archetype : indicateur d'etapes numerotees, grille de plages
  horaires, bandeau de confirmation. C'est le parcours de
  reservation medical, celui qui doit se finir en trois clics.
  Fonction montree : la confirmation qui arrive.
  ============================================================

## D-323 — 10 · IMMOBILIER — la fiche de propriete

============================================================
  10 · IMMOBILIER — la fiche de propriete
  Archetype : grande image panoramique en tete avec le point
  chaud 360, barre de prix, tableau de specifications en quatre
  colonnes, ligne de courtier. C'est la fiche MLS, en mieux.
  Fonction montree : la visite 360 qui panoramique.
  ============================================================

## D-324 — Le fond du puits est la valeur de base des plaques, pas un jeton :

Le fond du puits est la valeur de base des plaques, pas un jeton :
  c'est ce qui se voit sous le panoramique. Il ne doit pas suivre le
  theme — une photographie ne change pas de sujet quand on eteint la
  lampe — et il couvre le pixel de bord que l'arrondi du
  `translateX` peut laisser en fin de course.

## D-325 — LES PHOTOGRAPHIES.

------------------------------------------------------------
  LES PHOTOGRAPHIES.

  Quatre secteurs sur treize montrent de vraies photos plutot que
  des plaques tonales : restauration, garage, construction,
  immobilier. Ce sont ceux que le site demontre deja ailleurs — les
  cinq projets livres et les prereglages du calculateur les nomment.
  Les neuf autres gardent leur plaque construite : elles tiennent
  par leur densite de texte et de nombres.

  Licences verifiees et documentees dans `archives/rapports/PHASE-7.md` : Pexels pour
  trois secteurs, Poly Haven CC0 pour l'immobilier — ce sont les
  MEMES panoramas que la visite 360, reprojetes, donc l'apercu
  montre la propriete que le visiteur peut ensuite parcourir.

  Les images vivent dans un `<template>` : elles ne sont demandees
  qu'au clonage de la maquette, jamais au chargement de la page.
  ------------------------------------------------------------

## D-326 — Le cadrage vertical est REGLE, pas laisse au hasard. Un

Le cadrage vertical est REGLE, pas laisse au hasard. Un
  `object-fit: cover` sans consigne centre l'image : sur une piece
  photographiee au grand angle, le centre est le PLAFOND, et
  l'apercu d'une propriete montrait un lustre. On vise le tiers
  bas, la ou se trouvent le mobilier et la baie.

## D-327 — LA PHOTO EST POSITIONNEE EN ABSOLU, et c'est ce qui fait marcher

LA PHOTO EST POSITIONNEE EN ABSOLU, et c'est ce qui fait marcher
  le reste. En `height: 100 %` dans une grille dont la rangee est
  automatique, la hauteur se resout sur le CONTENU : mesure du
  2026-07-26, l'image faisait 380 px dans un cadre de 127, elle
  debordait, et `object-fit` ne s'engageait jamais. On voyait donc
  le haut brut de l'image — le plafond et son lustre — sur un
  apercu cense vendre une propriete.
  En absolu sur les quatre cotes, la boite est celle du cadre, et
  le cadrage reprend la main.

## D-328 — La bande : une photo large, et a cote une colonne de vignettes.

La bande : une photo large, et a cote une colonne de vignettes.
  PAS de `min-height: 0` ni d'`overflow: hidden` ici : dans une
  grille de maquette, les deux laissaient la bande se faire ecraser
  a une trentaine de pixels — une photo illisible vaut moins qu'une
  plaque construite. Elle prend la hauteur qu'elle demande, et
  c'est la page qui s'ajuste.

## D-329 — 11 · JURIDIQUE — la convention et son echeancier

============================================================
  11 · JURIDIQUE — la convention et son echeancier
  Archetype : deux colonnes de document. Articles numerotes a
  gauche sous un filet vertical, dates de procedure a droite,
  compte a rebours en gros. Serif absent du systeme : c'est la
  NUMEROTATION et le blanc qui portent l'autorite, pas l'empattement.
  Fonction montree : le tampon de depot qui tombe.
  ============================================================

## D-330 — 12 · PHOTOGRAPHE — l'index et la planche

============================================================
  12 · PHOTOGRAPHE — l'index et la planche
  Archetype : rail d'index numerote a gauche, planche pleine
  hauteur a droite, donnees de prise de vue en pied. Fond inverse :
  un portfolio se regarde sur du noir, c'est le seul metier des
  treize ou l'interface doit disparaitre.
  Fonction montree : la galerie qui defile.
  ============================================================

## D-331 — 13 · VOTRE INDUSTRIE ICI — la matiere

============================================================
  13 · VOTRE INDUSTRIE ICI — la matiere
  Le treizieme n'a pas de metier : il a la MATIERE. Des grains
  durs arrivent disperses et s'assemblent en une plaque nette,
  sans jamais rebondir. C'est la seule reponse honnete a « votre
  industrie » : on part de la matiere, pas d'un gabarit.
  ============================================================

## D-332 — LE CHAMP COUPE LES GRAINS. Sans lui, un grain disperse a 340 %

LE CHAMP COUPE LES GRAINS. Sans lui, un grain disperse a 340 %
  de sa taille passe par-dessus le titre pendant tout le vol : la
  maquette se lit alors comme un defaut de rendu, pas comme une
  matiere qui s'assemble. Coupes au bord de leur colonne, les
  grains ARRIVENT de hors-champ, ce qui est exactement l'idee.

## D-333 — MOUVEMENT REDUIT.

============================================================
  MOUVEMENT REDUIT.
  L'etat de repos est la forme FINALE, nette. Une maquette figee a
  mi-construction se lirait comme un bogue — exactement le reproche
  que ce chantier corrige.
  ============================================================

