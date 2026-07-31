# Décisions — `js/limaille.js`

> Le pourquoi du code de `js/limaille.js`. Chaque entrée porte un identifiant
> qui figure aussi dans le fichier source : `grep D-042` trouve les deux.
> Ne se lit jamais en entier — on y arrive par l'identifiant.

## Table

- **D-526** — LIMAILLE — moteur de champ de grains
- **D-527** — LE CONTEXTE EST ALPHA, ET C'EST UNE CORRECTION DE BOGUE.
- **D-528** — Ressort critiquement amorti. omega est la pulsation propre
- **D-529** — Dissipation supplementaire appliquee a la vitesse. Forte au
- **D-530** — Repulsion. ATTENTION A L'ECHELLE : a l'equilibre le
- **D-531** — Fond TRANSPARENT : c'est la surface de la page qui se voit, donc
- **D-532** — compose(draw, bands)
- **D-533** — La COUVERTURE, c'est (grain / pas) au carre. A pas 2 et grain
- **D-534** — La composition est echantillonnee DROITE, ce qui garde des
- **D-535** — Position de depart AVANT le deploiement.
- **D-536** — Calibre sur la hauteur de capitale du PETIT mot. A 0,55 le
- **D-537** — Integration semi-implicite, ressort critiquement amorti.

---

## D-526 — LIMAILLE — moteur de champ de grains

============================================================
  LIMAILLE — moteur de champ de grains
  ------------------------------------------------------------
  LE MOTIF SIGNATURE D'APED, en une phrase :
  une matiere dure qui tient une forme nette sous tension,
  qui s'ecarte sous la pointe, et qui se reprend d'elle-meme.

  Ce n'est pas de la fumee, c'est de la limaille. Les grains sont
  durs, l'amortissement est critique, la forme au repos est NETTE.

  QUATRE ECARTS ASSUMES AVEC LA TECHNIQUE DE REFERENCE :

  1. AUCUN WEBGL, AUCUNE DEPENDANCE. La reference dessine ses
     particules une par une en WebGL. Ici on ecrit directement
     dans un buffer ImageData, puis un seul putImageData par
     image. Le cout devient lineaire en ecritures memoire, donc
     on peut se payer beaucoup PLUS de grains beaucoup PLUS
     petits — exactement ce qu'il faut pour rendre des MOTS
     lisibles la ou la reference n'affichait qu'une lettre.
     On perd la profondeur en z, remplacee par une modulation de
     ton, plus juste pour un langage imprime.

  2. SEUIL ALPHA A 170, PAS A 128. A 128 on ramasse les pixels de
     bord semi-transparents de l'anticrenelage, ce qui entoure
     chaque lettre d'un halo de grains fantomes. C'est
     litteralement le « ca fond » que la direction interdit.
     A 170 l'arete est franche et les contreformes restent
     ouvertes.

  3. ECHANTILLONNAGE EN PIXELS CSS, RENDU EN PIXELS ECRAN. Si on
     echantillonne dans l'espace du peripherique, le nombre de
     grains varie d'un facteur 4 entre un ecran DPR 1 et un DPR 2
     et tout le reglage physique s'ecroule. Toute la simulation
     vit en pixels CSS ; la conversion n'a lieu qu'au trace.

  4. VERROU AU REPOS + ARRET COMPLET. Quand un grain arrive a
     moins d'un tiers de pixel de sa cible, il y est colle et sa
     vitesse est mise a zero : l'etat de repos du champ est le
     rendu EXACT de la typographie. Le mot au repos ne
     « ressemble » pas a du texte, c'en est. Et quand tous les
     grains sont verrouilles sans pointeur, la boucle s'arrete :
     zero image par seconde, zero batterie.
  ============================================================

## D-527 — LE CONTEXTE EST ALPHA, ET C'EST UNE CORRECTION DE BOGUE.

LE CONTEXTE EST ALPHA, ET C'EST UNE CORRECTION DE BOGUE.
        Il etait en `alpha: false`, donc le champ peignait un fond
        OPAQUE pris dans `--surface-0` au moment de la composition.
        Consequence mesuree : la bascule de theme ne recomposait
        rien, et un visiteur arrive en sombre puis passe en clair
        gardait un bloc noir pose sur le ciment. C'etait le defaut
        « le hero reste noir en mode clair ».
        Avec un contexte alpha et un fond transparent, la surface
        derriere la plaque est celle de la PAGE : elle suit le theme
        toute seule et elle profite meme de la transition de 520 ms
        de la bascule. Il ne reste plus qu'a recolorer les grains,
        ce que fait `recolor()` dans `hero.js`.

## D-528 — Ressort critiquement amorti. omega est la pulsation propre

Ressort critiquement amorti. omega est la pulsation propre
        en rad/s : elle seule fixe la vitesse de rappel, et
        zeta = 1 garantit qu'il n'y a JAMAIS de depassement.
        Un ressort qui rebondit ferait flotter les lettres.

## D-529 — Dissipation supplementaire appliquee a la vitesse. Forte au

Dissipation supplementaire appliquee a la vitesse. Forte au
        repos : c'est elle qui fait que le mot lit comme de l'encre
        et pas comme une comete. Exprimee par seconde, donc
        independante de la frequence d'images.

## D-530 — Repulsion. ATTENTION A L'ECHELLE : a l'equilibre le

Repulsion. ATTENTION A L'ECHELLE : a l'equilibre le
        deplacement d'un grain vaut force / k, avec k = omega^2.
        A omega 21, k vaut 441, donc une force de 210 ne creuse
        que 0,48 px — invisible. Pour un sillon de 34 px il faut
        une force de l'ordre de 34 * 441, soit 15 000.

## D-531 — Fond TRANSPARENT : c'est la surface de la page qui se voit, donc

Fond TRANSPARENT : c'est la surface de la page qui se voit, donc
      le champ n'a aucune couleur de fond a tenir a jour. `bgHex` reste
      dans la signature parce qu'il sert de reference documentaire au
      calibrage des tons, et pour ne pas casser les appelants.

## D-532 — compose(draw, bands)

------------------------------------------------------------
    compose(draw, bands)

    `draw(ctx, w, h)` rend la composition ENTIERE — les deux mots
    avec leurs tailles et leur interlignage reels — sur un canvas
    hors-ecran en pixels CSS. UN SEUL rendu, UN SEUL
    echantillonnage : ce n'est pas quatre passes qu'on recolle.

    `bands` : [{ y0, y1, stride, inkRatio }] en fraction de
    hauteur. C'est ce qui permet de donner a la petite ligne une
    densite relative PLUS ELEVEE. Repartir un budget fixe a l'aire
    donnerait a AGENCY une poignee de grains, donc de la poussiere
    illisible.
    ------------------------------------------------------------

## D-533 — La COUVERTURE, c'est (grain / pas) au carre. A pas 2 et grain

La COUVERTURE, c'est (grain / pas) au carre. A pas 2 et grain
      1 elle vaut 25 % : ce qu'on lit dominant est alors le fond
      entre les grains, pas la matiere, et le mot parait delave.
      Chaque bande porte donc son propre couple pas/grain, ce qui
      permet au grand mot d'etre grene et au petit d'etre plein.

## D-534 — La composition est echantillonnee DROITE, ce qui garde des

La composition est echantillonnee DROITE, ce qui garde des
      bandes horizontales propres pour la densite par ligne. La
      rotation est ensuite appliquee aux coordonnees cibles, pas au
      canvas hors-ecran : on obtient la plaque posee de travers sans
      perdre le decoupage en bandes.

## D-535 — Position de depart AVANT le deploiement.

Position de depart AVANT le deploiement.
    Pas un nuage aleatoire : ce serait organique et flottant, donc
    contraire a la direction. Les grains partent alignes sur des
    FILETS HORIZONTAUX, le vocabulaire meme du site. La signature
    emerge du systeme de filets, elle ne tombe pas du ciel.

## D-536 — Calibre sur la hauteur de capitale du PETIT mot. A 0,55 le

Calibre sur la hauteur de capitale du PETIT mot. A 0,55 le
      sillon etait invisible sur une plaque de 1000 px ; a 1,6 il
      se voit franchement tout en restant tres inferieur a la
      largeur d'une lettre du grand mot, donc il creuse sans
      jamais effacer.

## D-537 — Integration semi-implicite, ressort critiquement amorti.

------------------------------------------------------------
    Integration semi-implicite, ressort critiquement amorti.
    k = w^2, c = 2w  =>  zeta = 1  =>  aucun depassement possible.
    ------------------------------------------------------------

