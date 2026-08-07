# Décisions — `css/tour360.css`

> Le pourquoi du code de `css/tour360.css`. Chaque entrée porte un identifiant
> qui figure aussi dans le fichier source : `grep D-042` trouve les deux.
> Ne se lit jamais en entier — on y arrive par l'identifiant.

<!-- INDEX:DEBUT -->

> **NE LIS PAS CE FICHIER EN ENTIER.** Cette table donne le titre exact
> de chaque partie et ce qu'elle coûte. Va chercher la seule qui répond :
> `grep -n "^## <titre>" <fichier>` puis lis la plage. Le titre est la clé —
> il ne périme pas, un numéro de ligne oui.

| Partie | Lignes | Jetons ~ |
|---|---:|---:|
| **D-334 — APED AGENCE - Visite virtuelle 360** | 17 | 225 |
| **D-335 — Affiche plate. C'est la seule chose que la section pese avant** | 8 | 107 |
| **D-336 — LA PLAQUE D'ENTREE — aplat franc, jamais un degrade.** | 14 | 197 |
| **D-337 — Pannellum impose box-sizing: content-box a tous ses descendants, et** | 8 | 113 |
| **D-338 — Points de passage** | 9 | 103 |
| **D-339 — Plan** | 9 | 91 |
| **D-340 — Le lien de licence, sous la visite.** | 14 | 197 |
| **D-341 — Mouvement reduit. La derive automatique ne demarre jamais (c'est** | 8 | 108 |
| **D-620 · LE CADRE A TROIS ETAGES.** | 11 | 118 |
| **D-624 · L'etiquette de lieu, posee sur l'affiche.** | 10 | 111 |
| **D-632 · LA PROVENANCE EST UNE LEGENDE DE CADRE.** | 15 | 186 |

<!-- INDEX:FIN -->

## D-334 — APED AGENCE - Visite virtuelle 360

============================================================
  APED AGENCE - Visite virtuelle 360
  Feuille autonome. Ne redefinit rien du site, ne depend que des
  jetons de tokens.css. A charger APRES css/vendor/pannellum.css
  (elle en corrige plusieurs defauts).

  Deux dettes connues de Pannellum 2.5.7 sont fermees ici :
  1. `.pnlm-container { outline: 0 }` supprime l'anneau de focus du
     conteneur, alors que Pannellum lui pose pourtant `tabIndex = 0`
     et ecoute les fleches dessus. Sans anneau, la navigation au
     clavier existe mais est invisible.
  2. Les points de passage sont des `div` sans etat de focus. On
     leur rend un anneau, et une forme qui se lit sur une photo.
  ============================================================

## D-335 — Affiche plate. C'est la seule chose que la section pese avant

------------------------------------------------------------
  Affiche plate. C'est la seule chose que la section pese avant
  le clic. `loading="lazy"` est pose dans le markup : cette image
  ne peut donc jamais devenir l'element LCP de la page.
  ------------------------------------------------------------

## D-336 — LA PLAQUE D'ENTREE — aplat franc, jamais un degrade.

LA PLAQUE D'ENTREE — aplat franc, jamais un degrade.
  Elle portait un `linear-gradient` sur trois arrets. C'etait le
  dernier degrade du site, en contradiction frontale avec la
  direction, et il ne tenait rien : mesure du 2026-07-26, le texte
  de l'incrustation donnait 1,43:1 sur la photo claire, soit un
  echec AA franc.
  Un degrade ne se mesure pas : le contraste depend du pixel de
  photo qui passe dessous, donc il change d'un panorama a l'autre.
  Un aplat, lui, est nomme, donc il se mesure une fois pour toutes.
  La plaque n'occupe plus tout le cadre : elle s'ancre en bas, sur
  la largeur, et la photo reste entiere au-dessus.

## D-337 — Pannellum impose `box-sizing: content-box` a tous ses descendants, et

Pannellum impose `box-sizing: content-box` a tous ses descendants, et
  sa feuille est injectee au clic donc APRES celle-ci : a specificite
  egale c'est elle qui gagne. Il faut donc monter d'un cran, sinon les
  pastilles du plan mesurent leur largeur + leur padding et debordent
  du plan. Mesure : 130 px au lieu de 104.

## D-338 — Points de passage

------------------------------------------------------------
  Points de passage
  Pannellum leur donne `pnlm-hotspot pnlm-sprite pnlm-scene` :
  26 x 26, un rond blanc en sprite, aucun texte. On garde la classe
  (le module a besoin de `.pnlm-hotspot`) et on remplace la forme.
  ------------------------------------------------------------

## D-339 — Plan

------------------------------------------------------------
  Plan
  Trois pieces, murs mitoyens, deux ouvertures. Le SVG ne porte que
  les murs : les etiquettes sont de vrais boutons, donc leur nom
  accessible est exactement le texte visible.
  ------------------------------------------------------------

## D-340 — Le lien de licence, sous la visite.

------------------------------------------------------------
  Le lien de licence, sous la visite.
  Dans `.fine`, un lien herite exactement de la couleur, de la
  graisse et de la fonte du texte qui l'entoure, et le site ne
  souligne pas les liens par defaut : mesure faite, le lien vers
  polyhaven.com/license etait rigoureusement indistinguable de la
  phrase autour (meme rgb(16,18,17), aucun soulignement, meme
  graisse). C'est le cas d'ecole du critere WCAG 1.4.1 — la seule
  facon de le reperer aurait ete de promener la souris dessus.
  Un soulignement suffit et ne coute rien au reste.
  ------------------------------------------------------------

## D-341 — Mouvement reduit. La derive automatique ne demarre jamais (c'est

------------------------------------------------------------
  Mouvement reduit. La derive automatique ne demarre jamais (c'est
  le module qui le decide), on coupe ici ce qui reste : le fondu
  d'echange de scene de Pannellum et nos transitions.
  ------------------------------------------------------------

## D-620 · LE CADRE A TROIS ETAGES.

*Extrait de `css/tour360.css` le 2026-08-03.*

LE CADRE A TROIS ETAGES.  D-620
Un seul trait fait le tour des trois etages : le manifeste des
pieces, la piece, le pupitre. C'est le meme objet que le panneau de
la section 04 — un cadre plat, un bandeau mono, aucun rayon, aucune
ombre — mais a l'echelle de la section entiere au lieu d'une
colonne, pour que les deux ne se confondent pas.

## D-624 · L'etiquette de lieu, posee sur l'affiche.

*Extrait de `css/tour360.css` le 2026-08-03.*

L'etiquette de lieu, posee sur l'affiche.  D-624
Elle est sur photo, donc elle ne suit pas le theme : elle suit son
fond, comme l'ancienne plaque d'entree. Aplat franc, rayon 0.
Elle disparait des que la visite est vivante — le plan du lecteur
occupe alors ce coin, et c'est lui qui dit ou on est.

## D-632 · LA PROVENANCE EST UNE LEGENDE DE CADRE.

*Extrait de `css/tour360.css` le 2026-08-03.*

LA PROVENANCE EST UNE LEGENDE DE CADRE.  D-632
Elle etait le second etage d'un pied qui portait aussi trois
gestes en toutes lettres. Les gestes sont partis — ils
expliquaient avant le clic des gestes qu'on ne peut pas encore
faire, et repetaient le pupitre une fois dedans. Il ne reste
qu'elle, et une mention obligatoire se pose comme une legende :
sous l'objet, alignee sur son bord gauche, bornee a une mesure
qu'on lit d'un coup d'oeil. Aucun filet — le cadre a deja le sien
juste au-dessus, et deux traits a 24 px l'un de l'autre font une
rayure, pas une structure.
