# Décisions — `css/base.css`

> Le pourquoi du code de `css/base.css`. Chaque entrée porte un identifiant
> qui figure aussi dans le fichier source : `grep D-042` trouve les deux.
> Ne se lit jamais en entier — on y arrive par l'identifiant.

<!-- INDEX:DEBUT -->

> **NE LIS PAS CE FICHIER EN ENTIER.** Cette table donne le titre exact
> de chaque partie et ce qu'elle coûte. Va chercher la seule qui répond :
> `grep -n "^## <titre>" <fichier>` puis lis la plage. Le titre est la clé —
> il ne périme pas, un numéro de ligne oui.

| Partie | Lignes | Jetons ~ |
|---|---:|---:|
| **D-348 — APED AGENCE - Socle** | 7 | 66 |
| **D-349 — Champs desactives. Aucun champ du site ne l'est aujourd'hui,** | 8 | 97 |
| **D-350 — Contrastes forces (contraste eleve Windows). Le site n'a que** | 8 | 105 |
| **D-351 — Primitives de revelation.** | 26 | 325 |
| **D-635 · LE FONDU UNIVERSEL DE BASCULE EST SUPPRIME.** | 26 | 336 |

<!-- INDEX:FIN -->

## D-348 — APED AGENCE - Socle

============================================================
  APED AGENCE - Socle
  Remise a zero, typographie, etats de focus, utilitaires.
  ============================================================

## D-349 — Champs desactives. Aucun champ du site ne l'est aujourd'hui,

------------------------------------------------------------
  Champs desactives. Aucun champ du site ne l'est aujourd'hui,
  mais l'etat existe pour que le jour ou il apparait il soit
  lisible plutot que muet.
  ------------------------------------------------------------

## D-350 — Contrastes forces (contraste eleve Windows). Le site n'a que

------------------------------------------------------------
  Contrastes forces (contraste eleve Windows). Le site n'a que
  des filets et des aplats : sans ce bloc, le filet d'accent des
  boutons et la barre de progression disparaissent.
  ------------------------------------------------------------

## D-351 — Primitives de revelation.

------------------------------------------------------------
  Primitives de revelation.

  L'ETAT DE DEPART A ETE RETIRE DU CSS, et c'est une correction de
  fond. Il etait pose des que `html.js` existait — c'est-a-dire
  avant le premier rendu — et il n'etait leve que par GSAP. Trois
  consequences, toutes mauvaises :

  1. du CONTENU restait invisible pendant tout le temps que les
     112 Ko de GSAP mettaient a arriver ;
  2. un element a `opacity: 0` n'est pas candidat au LCP, ce que ce
     projet a deja paye une fois avec le titre du hero ;
  3. impossible de DIFFERER la bibliotheque d'animation sans laisser
     un trou a l'ecran — donc impossible de sortir ses 51 ms de
     tache du chargement.

  Desormais l'etat de repos EST la forme finale, partout. C'est
  `js/motion.js` qui pose l'etat de depart, au moment ou il anime,
  avec `immediateRender: false` pour qu'il ne soit jamais applique
  d'avance. Sans script, ou avant lui, tout est simplement en place.
  `transform-origin` reste ici : c'est une propriete de forme, pas
  un etat de depart.
  ------------------------------------------------------------

## D-635 · LE FONDU UNIVERSEL DE BASCULE EST SUPPRIME.

*Extrait de `css/base.css` le 2026-08-03.*

LE FONDU UNIVERSEL DE BASCULE EST SUPPRIME.  D-635
Il posait une transition sur `*:not(svg):not(svg *)` — mesure a
1440x900 : 3 549 elements sur 3 969 transitionnaient quatre
proprietes de couleur a chaque clic, soit plus de quatorze mille
animations simultanees, chacune forcant la repeinture de sa boite.
Releve : pire image 549,9 ms, p95 entre 183 et 400 ms sur les cinq
endroits mesures, 200 images sur 790 au-dessus de 20 ms. Le seul
geste du site cense montrer notre maitrise etait le plus lourd.

Et il etait redondant : la bascule passe DEJA par une trame qui
couvre l'ecran (D-410). Le changement de couleur se fait sous le
couvert — il n'a rien a fondre. Un fondu par-dessus ne cachait
rien, il ajoutait une queue de 300 ms apres le retrait de la
trame.

Ce que dit la grammaire du projet, verbe V4 : « un etat ne fond
pas dans un autre, il roule d'un cran ». Un fondu de page entiere
etait le contraire de ce qu'on ecrit partout ailleurs. Sans
trame — script absent, mouvement reduit — la bascule est
instantanee, ce que fait tout systeme d'exploitation et ce que
personne ne lit comme une panne.
