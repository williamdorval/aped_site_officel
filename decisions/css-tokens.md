# Décisions — `css/tokens.css`

> Le pourquoi du code de `css/tokens.css`. Chaque entrée porte un identifiant
> qui figure aussi dans le fichier source : `grep D-042` trouve les deux.
> Ne se lit jamais en entier — on y arrive par l'identifiant.

<!-- INDEX:DEBUT -->

> **NE LIS PAS CE FICHIER EN ENTIER.** Cette table donne le titre exact
> de chaque partie et ce qu'elle coûte. Va chercher la seule qui répond :
> `grep -n "^## <titre>" <fichier>` puis lis la plage. Le titre est la clé —
> il ne périme pas, un numéro de ligne oui.

| Partie | Lignes | Jetons ~ |
|---|---:|---:|
| **D-342 — ADEXWEB - Direction ATELIER** | 15 | 188 |
| **D-343 — Couleur. Deux themes a parite complete de hierarchie.** | 8 | 107 |
| **D-344 — Accent LISIBLE SUR LA SURFACE INVERSE. Il manquait, et** | 7 | 88 |
| **D-345 — Espace. Base 8. Les respirations de bande sont volontairement** | 7 | 86 |
| **D-346 — Respirations resserrees. Mesure a 1440 : la bande normale** | 8 | 102 |
| **D-347 — La barre passe AU-DESSUS du menu plein ecran. Elle etait dessous, donc** | 7 | 99 |
| **D-586 · == LA CHAMBRE NOIRE — hors des deux themes, et c'est le point.** | 16 | 223 |

<!-- INDEX:FIN -->

## D-342 — ADEXWEB - Direction ATELIER

============================================================
  ADEXWEB - Direction ATELIER
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

## D-586 · == LA CHAMBRE NOIRE — hors des deux themes, et c'est le point.

*Extrait de `css/tokens.css` le 2026-08-03.*

== LA CHAMBRE NOIRE — hors des deux themes, et c'est le point. ==  D-586
Une piece sombre qui devient blanche quand on eteint la lumiere
n'est pas une piece sombre. L'arc de luminance raconte une
DESCENTE : on entre dans l'encre, on en ressort. Un recit qui
s'inverse avec le theme n'a plus de direction — et en sombre, le
sas jouait sa forge sur un fond ciment clair.
L'encre y est a pleine concentration, un cran sous l'encre de
page (#101211) : meme matiere, plus dense. Les paires de contraste
qui s'y rendent sont celles du theme sombre, TOUTES rehaussees par
un fond plus profond — 14,84:1 pour le texte, 7,54:1 pour le
attenue, 7,80:1 pour l'accent lisible. Aucune ne baisse.
