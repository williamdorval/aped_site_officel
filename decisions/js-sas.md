# Décisions — `js/sas.js`

> Le pourquoi du code de `js/sas.js`. Chaque entrée porte un identifiant
> qui figure aussi dans le fichier source : `grep D-573` trouve les deux.

## Table

- **D-573** — SAS — les trois pistes de l'arc de luminance
- **D-574** — Les portes : toutes fermées = le fichier ne fait rien
- **D-575** — LA FORGE — pilotée par la progression, jamais par le temps
- **D-576** — Le G4 du seuil est absorbé par le sas
- **D-577** — L'escalade de palier fige les sas sans les replier

## D-573 — SAS — LES TROIS PISTES DE L'ARC DE LUMINANCE

Le fichier orchestre ce que le CSS ne peut pas : les scrubs des
volets, la forge, le cran du mot. Il vit en vague 2, APRÈS
ScrollTrigger et AVANT motion.js et langue.js — l'ordre est
l'argument : langue.js lit les attributs de seuil après que sas.js
les a ajustés.

## D-574 — LES PORTES

La décision d'activer vit dans le HEAD (`html.sas-ok`, D-581) ; ici on
la LIT. `data-palier` absent vaut « pas encore rétrogradé » parce que
langue.js se charge après nous. Toutes portes fermées, le fichier ne
touche à rien et la page est celle d'avant le chantier.

## D-575 — LA FORGE

Les grains pleuvent (départ au-dessus de leur place, sens de lecture
d'une page) et deviennent le mot. Pilotée par la progression de
défilement, jamais par le temps : chaque position rend exactement la
même image — l'arrêt en plein vol est un état légitime, pas un état
cassé (règle du scrub, MESURES § 2 ; aucun texte n'est scrubbé, le
canvas est décoratif et le mot DOM bascule d'un cran). Rasterisation
du mot par le même procédé que la limaille du hero (échantillonnage
alpha > 170, pas 3), easing cubique sans dépassement (ζ = 1 en
esprit), bruit déterministe — jamais Math.random. Couleurs lues dans
la page, aucune valeur en dur. dpr plafonné à 1,5 : le grain est une
matière, pas une photo. Mesuré : 60 i/s pile, 0 image > 20 ms sur la
traversée complète.

## D-576 — LE G4 ABSORBÉ

Deux voleurs sur la même frontière seraient le piège 27 : quand le sas
joue le volet à l'échelle de l'écran, le `data-verbe` du seuil est
retiré et langue.js ne pose pas le sien. La clôture garde le sien —
son sas n'a pas de volet.

## D-577 — L'ESCALADE FIGE, ELLE NE REPLIE PAS

Une piste qui perd 1 800 px de hauteur en pleine lecture fait sauter
la page sous les pieds du visiteur. Au passage du palier 1 ou 2 : les
tweens meurent, les volets se posent à leur forme finale, la forge
disparaît — mais les hauteurs restent. Le mot forgé reste visible :
l'information ne dépend jamais de l'animation.

## D-589 · == LE LISSAGE — le correctif de la saccade.

*Extrait de `js/sas.js` le 2026-08-03.*

== LE LISSAGE — le correctif de la saccade.  D-589
`scrub: true` recopie la position de defilement TELLE QUELLE.
Or une molette n'avance pas de facon continue : elle envoie des
paliers de 100 px. Les grains se teleportaient donc d'un paquet
au suivant, et le seul moment du site cense prouver notre
maitrise etait le seul a saccader. Mesure : 60 i/s des le
depart — le probleme n'a JAMAIS ete le nombre de grains, il
etait dans la marche d'escalier de l'entree.
`scrub: <nombre>` interpose un rattrapage joue sur le rythme
d'affichage : la progression devient continue entre deux crans.
Ce que le sas garantissait reste vrai — a l'ARRET la
progression converge vers la valeur exacte de la position, donc
une meme position de defilement rend toujours la meme image, et
s'arreter en plein vol reste un etat legitime. ==

## D-588 · LES TROIS TEMPS, ET AUCUN NE MORD SUR LE SUIVANT.

*Extrait de `js/sas.js` le 2026-08-03.*

LES TROIS TEMPS, ET AUCUN NE MORD SUR LE SUIVANT.  D-588
Deux defauts corriges d'un coup.
1. Le volet AVAIT une descente en `yPercent`, de 0 a 0,42
de la course. Elle ne s'est jamais vue : la scene est
COLLANTE, donc elle n'est epinglee qu'a partir du
moment ou le haut de la piste touche le haut de la
fenetre — c'est-a-dire a 100vh de course, soit p = 0,42
sur 240vh. Toute la descente du volet se jouait dans
une scene encore en train d'entrer par le bas. Releve :
a p = 0,20, le bord bas du volet etait a 964 px, soit
64 px SOUS la fenetre. Le balayage est supprime ; la
plaque est deja la et c'est le visiteur qui descend
dedans, ce qui est la definition exacte de V1.  D-592
2. La limaille etait peinte jusqu'a 0,94 alors que le vrai
mot etait pose des 0,86 : pendant 8 % de la course elle
GRIFFONNAIT par-dessus un texte deja peint. Ce n'etait
pas une forge, c'etait une panne d'affichage.
0,00 → 0,42  la plaque d'encre entre, arete de grains
en tete (le defilement EST le balayage)
0,45 → 0,88  la limaille tombe puis s'aligne (V2)
0,90         CRAN : le canevas se vide, le mot est la (V4)
0,91 → 1,00  le fil minium tire vers la piece (V3)
A 0,88 tous les grains sont a leur place. Les deux pour
cent qui suivent sont la marge : le CRAN tombe sur une
image ou plus rien ne bouge.

## D-630 · LE POINT D'EPINGLAGE SE MESURE, IL NE S'ECRIT PAS.

*Extrait de `js/sas.js` le 2026-08-03.*

LE POINT D'EPINGLAGE SE MESURE, IL NE S'ECRIT PAS.  D-630
La scene est COLLANTE : elle n'est epinglee qu'a partir de
100vh de course (piege 35). Ce point vaut donc
100vh / hauteur-de-piste — 0,42 quand la course faisait
240vh, 0,67 depuis qu'elle en fait 150. Les bornes de la
choregraphie etaient ecrites en dur pour la premiere
valeur ; a 150vh elles auraient joue toute la forge avant
l'epinglage, c'est-a-dire hors de l'ecran, et le sas
raccourci n'aurait plus rien montre du tout.
`epingle` est releve a chaque rafraichissement de
ScrollTrigger — donc aussi apres un changement de largeur,
qui change innerHeight sur mobile. On raisonne ensuite en
progression EPINGLEE `q`, ou 0 = la plaque vient de se
caler et 1 = elle repart.
