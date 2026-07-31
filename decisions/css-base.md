# Décisions — `css/base.css`

> Le pourquoi du code de `css/base.css`. Chaque entrée porte un identifiant
> qui figure aussi dans le fichier source : `grep D-042` trouve les deux.
> Ne se lit jamais en entier — on y arrive par l'identifiant.

## Table

- **D-348** — APED AGENCE - Socle
- **D-349** — Champs desactives. Aucun champ du site ne l'est aujourd'hui,
- **D-350** — Contrastes forces (contraste eleve Windows). Le site n'a que
- **D-351** — Primitives de revelation.

---

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

