# Décisions — `css/tokens.css`

> Le pourquoi du code de `css/tokens.css`. Chaque entrée porte un identifiant
> qui figure aussi dans le fichier source : `grep D-042` trouve les deux.
> Ne se lit jamais en entier — on y arrive par l'identifiant.

## Table

- **D-342** — APED AGENCE - Direction ATELIER
- **D-343** — Couleur. Deux themes a parite complete de hierarchie.
- **D-344** — Accent LISIBLE SUR LA SURFACE INVERSE. Il manquait, et
- **D-345** — Espace. Base 8. Les respirations de bande sont volontairement
- **D-346** — Respirations resserrees. Mesure a 1440 : la bande normale
- **D-347** — La barre passe AU-DESSUS du menu plein ecran. Elle etait dessous, donc

---

## D-342 — APED AGENCE - Direction ATELIER

============================================================
  APED AGENCE - Direction ATELIER
  Systeme de design. Aucune valeur en dur ailleurs que dans ce fichier.

  Principes verrouilles :
  - Rayon 0 sur absolument tout. Aucune ombre. La separation est un filet.
  - Un seul accent, le minium. Il n'apparait que sur quatre choses :
    le chiffre ROI vivant, l'etat actif de l'index, le CTA primaire,
    le filet de la section active. Nulle part ailleurs.
  - Trois familles : Archivo (display, axes wdth + wght), Chivo (texte),
    Martian Mono (donnees et etiquettes).
  ============================================================

## D-343 — Couleur. Deux themes a parite complete de hierarchie.

------------------------------------------------------------
  Couleur. Deux themes a parite complete de hierarchie.
  Ratios remesures le 2026-07-25 par script dans Chrome 150, formule
  WCAG 2.x. Toute valeur ci-dessous est un releve, pas une estimation.
  ------------------------------------------------------------

## D-344 — Accent LISIBLE SUR LA SURFACE INVERSE. Il manquait, et

Accent LISIBLE SUR LA SURFACE INVERSE. Il manquait, et
    `--accent-text` etait employe a sa place : mesure du 2026-07-25,
    #9b2810 sur #101211 donne 2,42:1 dans le compteur des projets,
    donc un echec AA franc. Cette valeur-ci donne 7,31:1.

## D-345 — Espace. Base 8. Les respirations de bande sont volontairement

------------------------------------------------------------
  Espace. Base 8. Les respirations de bande sont volontairement
  inegales : chaque section choisit la sienne.
  ------------------------------------------------------------

## D-346 — Respirations resserrees. Mesure a 1440 : la bande normale

Respirations resserrees. Mesure a 1440 : la bande normale
    passait de 112 a 80 px et la large de 187 a 118. Le rythme reste
    INEGAL — c'est ce qui distingue les sections — mais il ne mange
    plus l'ecran. La variete de composition est un acquis, la
    longueur de parcours ne l'etait pas.

## D-347 — La barre passe AU-DESSUS du menu plein ecran. Elle etait dessous, donc

La barre passe AU-DESSUS du menu plein ecran. Elle etait dessous, donc
    le menu opaque recouvrait le bourgeon : sur telephone, plus aucun
    moyen visible de refermer le menu, et pas de touche Echap. Le
    `padding-top` du menu reservait deja la hauteur de la barre.

