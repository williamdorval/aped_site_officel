# Décisions — `js/pointe.js`

> Le pourquoi du code de `js/pointe.js`. Chaque entrée porte un identifiant
> qui figure aussi dans le fichier source : `grep D-042` trouve les deux.
> Ne se lit jamais en entier — on y arrive par l'identifiant.

## Table

- **D-565** — LA POINTE — declinaison du motif signature au curseur
- **D-566** — Les cibles AIMANTEES sont les objets qu'on peut saisir : ils se

---

## D-565 — LA POINTE — declinaison du motif signature au curseur

============================================================
  LA POINTE — declinaison du motif signature au curseur
  ------------------------------------------------------------
  Meme idee que le hero, autre echelle : la pointe est
  l'instrument qui ecarte la matiere. Au hero elle creuse un
  sillon dans les grains ; ailleurs elle attire la matiere a
  elle (les CTA se rapprochent) et elle s'encliquette sur les
  cibles au lieu de glisser.

  LES QUATRE CONTRAINTES OBLIGATOIRES, toutes tenues :
  1. `(pointer: fine)` uniquement — verifie a l'init ET suivi en
     direct, parce qu'un portable convertible change de pointeur
     en cours de session.
  2. Desactive au tactile — consequence directe de 1, plus un
     abandon definitif au premier evenement `touchstart`.
  3. Desactive sous `prefers-reduced-motion`, suivi en direct.
  4. Elle AUGMENTE le curseur systeme, elle ne le remplace pas.
     Aucun `cursor: none` nulle part. Le curseur natif reste
     visible et c'est lui qui reste la source de verite : ce que
     dessine ce module est un reticule qui l'accompagne. Un
     curseur remplace est un probleme d'accessibilite, pas un
     effet.
  ============================================================

## D-566 — Les cibles AIMANTEES sont les objets qu'on peut saisir : ils se

Les cibles AIMANTEES sont les objets qu'on peut saisir : ils se
      rapprochent de la pointe. Les cibles LARGES sont les images et
      les cadres : ils ne bougent pas — deplacer une capture de
      900 px parce que la souris passe dessus serait absurde — mais
      le reticule s'y ouvre, ce qui dit « il y a quelque chose la ».
      Deux comportements, une seule idee : la matiere reagit a la
      pointe, chacune a son echelle.

