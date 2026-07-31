# Décisions — `js/motion.js`

> Le pourquoi du code de `js/motion.js`. Chaque entrée porte un identifiant
> qui figure aussi dans le fichier source : `grep D-042` trouve les deux.
> Ne se lit jamais en entier — on y arrive par l'identifiant.

## Table

- **D-495** — APED AGENCE - Mouvement
- **D-496** — 1. Entree du hero.
- **D-497** — LE HERO NE S'ANIME PLUS DU TOUT.
- **D-498** — 2. Compression du titre.
- **D-499** — La plaque de limaille repond au defilement : quand le hero sort,
- **D-500** — 3. Filets de section — N1 (orientation) + N2 (signature).
- **D-501** — LES CINQ FILETS DE LA FICHE TECHNIQUE SONT EXCLUS, et c'est la
- **D-502** — L'etat de depart n'est plus dans le CSS : il est pose ICI, et
- **D-503** — G1 · ANNONCER. Un filet de seuil part des qu'il ENTRE dans
- **D-504** — 4. Montee des blocs.
- **D-505** — 5. Compteurs de la bande de specification.
- **D-506** — 8. Ligne du processus.
- **D-507** — LE FIL SE REMPLIT, station par station, et sa portion pleine
- **D-508** — 8bis. LES QUATRE COMPOSANTS DU PARCOURS — N2.
- **D-509** — 9. Piste du comparatif — N2.
- **D-510** — Les LONGUEURS ne sont plus posees ici : elles sont dans le
- **D-511** — 9bis. LE SCHEMA DE L'ECART — N2.
- **D-512** — 10. Titres de section — N2.
- **D-513** — L'espace est un noeud de texte ENTRE les boites, jamais
- **D-514** — Les mots sont regroupes par LIGNE reelle, mesuree apres mise en
- **D-515** — Une espace entre les boites de ligne. Elle ne se voit pas —
- **D-516** — Le decoupage est PARESSEUX, un titre a la fois, au moment ou il
- **D-517** — 11. Blocs qui se reprennent — N2.
- **D-518** — 12. Frise du processus — N2, defilement lateral.
- **D-519** — La frise horizontale a ete remplacee par le parcours vertical
- **D-520** — 12bis. LES QUATRE PREUVES DE L'AGENCE — N2.
- **D-521** — 13. Programme de reference — N2.
- **D-522** — Les trois PREUVES. Le bareme en regle graduee a ete retire —
- **D-523** — `immediateRender: false` SUR ONZE TWEENS — CORRECTIF DU
- **D-524** — 13bis. « Ce qui arrive apres » — N2.
- **D-525** — 14. Recalcul apres chargement des images.

---

## D-495 — APED AGENCE - Mouvement

============================================================
  APED AGENCE - Mouvement
  Chaque animation ci-dessous a une raison, ecrite au-dessus d'elle.
  Aucune n'est la pour faire joli.

  Regles tenues partout : transform et opacity uniquement, aucun
  ecouteur scroll, tout se coupe sous prefers-reduced-motion.
  ============================================================

## D-496 — 1. Entree du hero.

------------------------------------------------------------
    1. Entree du hero.
    Raison : hierarchie. La plaque, la phrase d'accroche et le
    sous-titre sont deja la au premier rendu ; seuls les boutons
    montent.

    MESURE DU 2026-07-25, ET C'EST LA RAISON DE CE CHANGEMENT :
    `.hero-claim` portait la classe `.rise`, donc `opacity: 0`
    jusqu'a ce que GSAP la releve. Un element a opacite nulle N'EST
    PAS candidat au LCP : le plus grand element de la page n'etait
    donc compte qu'a la fin de son animation, et le LCP tombait a
    620 ms au lieu du premier rendu. Une animation d'entree qui
    retarde la mesure du premier contenu utile ne retarde pas que la
    mesure : elle retarde la LECTURE. Le titre ne s'anime plus.
    ------------------------------------------------------------

## D-497 — LE HERO NE S'ANIME PLUS DU TOUT.

LE HERO NE S'ANIME PLUS DU TOUT.
    Le titre avait deja ete retire de l'animation en phase 6 : un
    element a opacite nulle n'est pas candidat au LCP. Les boutons
    suivent aujourd'hui, pour la meme raison poussee d'un cran —
    leur etat de depart obligeait a charger GSAP avant le premier
    ecran, donc a garder ses 51 ms de tache sur le chemin du
    chargement. Rien de ce qui est visible au premier ecran ne
    depend plus de la bibliotheque d'animation.
    Ce qu'on perd : une montee de 620 ms sur deux boutons.
    Ce qu'on gagne : la choregraphie entiere sort du chargement.

## D-498 — 2. Compression du titre.

------------------------------------------------------------
    2. Compression du titre.
    Raison : storytelling. L'axe de largeur d'Archivo passe de 125
    a 78 pendant que le hero sort. Le titre se comprime
    physiquement, comme une plaque qu'on met sous presse. C'est le
    moment signature de la page.
    ------------------------------------------------------------

## D-499 — La plaque de limaille repond au defilement : quand le hero sort,

La plaque de limaille repond au defilement : quand le hero sort,
    le champ se relache et les grains montent legerement, comme une
    plaque qu'on souleve du banc. Un seul foyer d'attention : le
    mouvement est faible et s'arrete des que la plaque est sortie.
    C'est la meme matiere que le sillon du pointeur, pilotee par une
    autre force.

## D-500 — 3. Filets de section — N1 (orientation) + N2 (signature).

------------------------------------------------------------
    3. Filets de section — N1 (orientation) + N2 (signature).
    Raison : hierarchie ET signature. Le filet annonce qu'une bande
    commence, donc il oriente. Et il ne se contente pas de se
    tracer : il s'assemble en grains de la gauche vers la droite,
    puis se RESSOUDE en trait plein. C'est la limaille du hero a
    l'echelle d'un filet, et c'est reconnaissable comme la meme
    idee sans etre une copie.
    ------------------------------------------------------------

## D-501 — LES CINQ FILETS DE LA FICHE TECHNIQUE SONT EXCLUS, et c'est la

LES CINQ FILETS DE LA FICHE TECHNIQUE SONT EXCLUS, et c'est la
    consequence directe de la composition d'entree.
    Ils se soudent maintenant DANS la sequence, en CSS, au rythme
    de `--e`. Les laisser ici les faisait retracer une seconde fois
    a l'arrivee de GSAP — soit 1,2 s apres, hors tempo, sur un
    objet deja pose. Ils gardent `data-section-rule` : l'attribut
    sert aussi au filet de section active, qui vit dans `main.js`.

## D-502 — L'etat de depart n'est plus dans le CSS : il est pose ICI, et

L'etat de depart n'est plus dans le CSS : il est pose ICI, et
        `immediateRender: false` garantit qu'il ne l'est qu'au
        moment ou le filet entre en scene. Sinon la bibliotheque,
        chargee tard, effacerait d'un coup douze filets deja
        visibles pour les retracer.

## D-503 — G1 · ANNONCER. Un filet de seuil part des qu'il ENTRE dans

G1 · ANNONCER. Un filet de seuil part des qu'il ENTRE dans
          l'ecran — 97 % — et pas a 88 % comme les autres. La
          difference fait tout le geste demande : le filet de la
          section suivante se trace AVANT qu'elle arrive, donc il
          l'annonce au lieu de la souligner. Les filets qui ne sont
          pas des seuils gardent 88 % : eux soulignent, c'est leur
          role.

## D-504 — 4. Montee des blocs.

------------------------------------------------------------
    4. Montee des blocs.
    Raison : storytelling. Les elements arrivent dans l'ordre de
    lecture plutot que tous ensemble. Decalage court : c'est une
    fiche technique, pas un generique de film.
    ------------------------------------------------------------

## D-505 — 5. Compteurs de la bande de specification.

------------------------------------------------------------
    5. Compteurs de la bande de specification.
    Raison : feedback. Un chiffre qui se pose vaut mieux qu'un
    chiffre deja pose : il signale qu'il a ete mesure.
    ------------------------------------------------------------

## D-506 — 8. Ligne du processus.

------------------------------------------------------------
    8. Ligne du processus.
    Raison : storytelling. La ligne se trace d'etape en etape :
    elle represente le projet qui avance.
    ------------------------------------------------------------

## D-507 — LE FIL SE REMPLIT, station par station, et sa portion pleine

LE FIL SE REMPLIT, station par station, et sa portion pleine
    EST la progression : l'orientation ne peut pas mentir parce
    qu'elle n'est pas un indicateur pose a cote du mouvement, elle
    est le mouvement lui-meme.
    Etat au repos = fil plein. Sans script, le parcours se lit
    entier : c'est un chemin, pas une animation.

## D-508 — 8bis. LES QUATRE COMPOSANTS DU PARCOURS — N2.

------------------------------------------------------------
    8bis. LES QUATRE COMPOSANTS DU PARCOURS — N2.
    Chacun se CONSTRUIT a l'ecran, et chacun montre ce que son
    etape produit : la fiche d'appel s'ecrit ligne par ligne, la
    maquette s'assemble en limaille — les blocs arrivent decales et
    se reprennent, exactement le motif du hero a l'echelle d'une
    mise en page —, le code se pose, le site passe en ligne.
    Une seule fois, jamais en boucle : ce sont des preuves, pas des
    animations d'attente.
    ------------------------------------------------------------

## D-509 — 9. Piste du comparatif — N2.

------------------------------------------------------------
    9. Piste du comparatif — N2.
    Raison : feedback, et surtout LECTURE. Le trait du temps actuel
    se trace en premier, puis le trait d'accent le recouvre sur la
    part qui reste une fois automatise. Ce qui depasse est l'ecart :
    le visiteur n'a aucune soustraction a faire, il la VOIT se
    faire. Une piste au lieu de deux, un geste au lieu d'un tableau.
    ------------------------------------------------------------

## D-510 — Les LONGUEURS ne sont plus posees ici : elles sont dans le

Les LONGUEURS ne sont plus posees ici : elles sont dans le
    markup, en variables CSS. Ce script ne fait plus que TRACER, et
    c'est la difference entre un tableau qui a besoin de JavaScript
    pour exister et un tableau qui a besoin de JavaScript pour
    s'animer. Sans script, les six pistes sont deja a leur
    longueur.

## D-511 — 9bis. LE SCHEMA DE L'ECART — N2.

------------------------------------------------------------
    9bis. LE SCHEMA DE L'ECART — N2.
    Les deux journees se tracent l'une apres l'autre sur la meme
    regle, puis le pont enjambe la difference. L'ordre porte
    l'argument : d'abord ce que ca coute, ensuite ce que ca
    deviendrait, et seulement apres, ce qu'on recupere.
    Etat au repos = forme finale : le schema est lisible a l'arret,
    sans script et sous mouvement reduit.
    ------------------------------------------------------------

## D-512 — 10. Titres de section — N2.

------------------------------------------------------------
    10. Titres de section — N2.
    Raison : signature. Le titre ne se tape pas lettre par lettre et
    ne se devoile pas mot par mot : il se DECOUVRE d'un balayage
    ligne par ligne, comme la matiere qu'on degage. 60 ms d'ecart,
    300 ms au total : le texte est lisible avant que l'oeil ait fini
    d'arriver dessus. C'est la limite que ce site s'impose — un
    titre qu'il faut attendre pour lire est un titre casse.
    ------------------------------------------------------------

## D-513 — L'espace est un noeud de texte ENTRE les boites, jamais

L'espace est un noeud de texte ENTRE les boites, jamais
        dedans : dans une boite `inline-block` il ne se replie pas
        en fin de ligne et decale le premier mot de la ligne
        suivante. Le texte accessible reste identique au caractere.

## D-514 — Les mots sont regroupes par LIGNE reelle, mesuree apres mise en

Les mots sont regroupes par LIGNE reelle, mesuree apres mise en
      page, puis CHAQUE LIGNE EST ENVELOPPEE dans une boite.

      Ce dernier point n'est pas cosmetique. Sans enveloppe, le
      balayage s'appliquait a chaque mot separement : a mi-course, on
      lisait « selo  le métie » — des mots coupes en plein milieu
      d'une lettre. Capture du 2026-07-25 sur telephone. Une lettre
      tronquee ne se lit pas comme un balayage, elle se lit comme un
      bug d'affichage, et c'est exactement le reproche fait au reste
      du site. Avec l'enveloppe, c'est la LIGNE qui se decouvre.

## D-515 — Une espace entre les boites de ligne. Elle ne se voit pas —

Une espace entre les boites de ligne. Elle ne se voit pas —
        les boites sont en bloc — mais sans elle le texte accessible
        devient « Le style changeselon le metier ». Le titre lu par
        une synthese vocale doit etre le meme, au caractere pres,
        que celui qui est affiche.

## D-516 — Le decoupage est PARESSEUX, un titre a la fois, au moment ou il

Le decoupage est PARESSEUX, un titre a la fois, au moment ou il
    entre par le bas. Fait a l'initialisation pour les dix titres
    d'un coup, il coutait dix mises en page forcees dans la tache de
    demarrage — mesure : la premiere tache longue passait de 216 a
    plus de 300 ms. Ici chaque titre paie sa propre mesure, hors du
    chemin critique, et jamais deux dans la meme image.

## D-517 — 11. Blocs qui se reprennent — N2.

------------------------------------------------------------
    11. Blocs qui se reprennent — N2.
    Raison : signature. Les blocs n'arrivent pas tous du bas : ils
    arrivent DECALES lateralement, en alternance, et se reprennent
    a leur place. C'est le meme geste que les grains du hero quand
    la pointe les relache, a l'echelle d'un bloc de mise en page.
    ------------------------------------------------------------

## D-518 — 12. Frise du processus — N2, defilement lateral.

------------------------------------------------------------
    12. Frise du processus — N2, defilement lateral.
    Raison : storytelling. La ligne ne se trace pas a cote des
    etapes : elle les POUSSE en place. Chaque etape entre par la
    gauche au moment ou la ligne l'atteint, donc le mouvement
    lateral porte l'information « le projet avance », il ne decore
    pas. Aucun pin, aucun detournement du defilement.
    ------------------------------------------------------------

## D-519 — La frise horizontale a ete remplacee par le parcours vertical

La frise horizontale a ete remplacee par le parcours vertical
    de la section 8 : elle poussait les quatre etapes lateralement,
    ce qui portait bien l'information « le projet avance », mais
    elle ne pouvait pas repondre a « a quelle etape suis-je ». Le
    fil, lui, y repond par construction.

## D-520 — 12bis. LES QUATRE PREUVES DE L'AGENCE — N2.

------------------------------------------------------------
    12bis. LES QUATRE PREUVES DE L'AGENCE — N2.
    Chaque preuve se fabrique au moment ou on la lit. Les deux
    barres du prix partent ENSEMBLE et arrivent ENSEMBLE : c'est
    leur egalite qui est l'argument, donc elles ne peuvent pas se
    tracer l'une apres l'autre.
    Etat au repos = preuve finie : elles se lisent toutes sans
    script et sous mouvement reduit.
    ------------------------------------------------------------

## D-521 — 13. Programme de reference — N2.

------------------------------------------------------------
    13. Programme de reference — N2.
    Raison : preuve. Le filet qui relie les trois temps se trace en
    grains d'un temps a l'autre : c'est le dossier qui avance. Puis
    les six barres du bareme se posent, de la plus courte a la plus
    longue, et la derniere va jusqu'au bord.
    ------------------------------------------------------------

## D-522 — Les trois PREUVES. Le bareme en regle graduee a ete retire —

Les trois PREUVES. Le bareme en regle graduee a ete retire —
    il apprenait au visiteur a calculer vers le bas. Ce qui reste
    est le mecanisme : le texto part, la signature se trace, le
    virement tombe. Etat au repos = preuve finie.

## D-523 — `immediateRender: false` SUR ONZE TWEENS — CORRECTIF DU

============================================================
    `immediateRender: false` SUR ONZE TWEENS — CORRECTIF DU
    2026-07-30, ET C'EST LA REGLE 0bis QUI N'AVAIT PAS ETE APPLIQUEE
    JUSQU'AU BOUT.

    CE QUI A ETE MESURE. `tools/contraste-arret.mjs`, 61 positions
    d'arret : sept elements de TEXTE restaient a 0,10 ou 0,12
    d'opacite, definitivement, chez un visiteur qui defile
    normalement. Les trois etats du programme de reference
    — « Envoyé », « Signé », « Encaissé » —, la bulle de texto, les
    deux lignes d'avis, et la ligne de suite du parcours. Contrastes
    releves : 1,15:1 a 1,36:1. Illisible, et permanent.

    POURQUOI. Un `fromTo` dans une timeline rend son etat de DEPART
    immediatement, a la creation de la timeline — c'est le
    comportement par defaut de GSAP, et c'est ce qu'on veut pour une
    revelation. Mais la revelation n'arrivait jamais : la section 10
    est loin dans le document, et les sections traversees portent
    `content-visibility: auto`. A la creation, leur hauteur RESERVEE
    n'est pas leur hauteur reelle, donc la position de declenchement
    calculee par ScrollTrigger tombait a cote. Le declencheur ne
    partait pas, et le texte restait a son etat de depart pour
    toujours. Attendre plus longtemps n'y changeait rien : il n'y
    avait rien a attendre.

    CE QU'ON FAIT, ET CE QU'ON NE FAIT PAS. On applique la regle
    0bis : l'etat de repos est la forme FINALE, et l'etat de depart
    n'est pose qu'au moment ou l'animation part. Un declencheur qui
    ne part pas ne coute alors plus qu'une animation manquante, au
    lieu de coûter la lisibilite. Ce n'est PAS un correctif de la
    cause — les positions de declenchement restent perimees par
    `content-visibility`, et c'est note comme ouvert dans CLAUDE.md.
    C'est le correctif du DEGAT, et il est complet : le meme outil
    rend maintenant zero.

    A/B en worktree contre le commit precedent : 8 echecs avant, 0
    apres, meme densite d'echantillonnage.
    ============================================================

## D-524 — 13bis. « Ce qui arrive apres » — N2.

------------------------------------------------------------
    13bis. « Ce qui arrive apres » — N2.
    Le filet traverse les trois temps au defilement, exactement
    comme celui du programme de reference : c'est le meme geste
    pour la meme idee — un dossier qui avance d'un temps a l'autre.
    ------------------------------------------------------------

## D-525 — 14. Recalcul apres chargement des images.

------------------------------------------------------------
    14. Recalcul apres chargement des images.
    Les captures de projet mesurent plusieurs milliers de pixels :
    tant qu'elles ne sont pas chargees, leur hauteur est fausse.
    ------------------------------------------------------------

