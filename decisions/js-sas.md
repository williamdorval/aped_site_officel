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
