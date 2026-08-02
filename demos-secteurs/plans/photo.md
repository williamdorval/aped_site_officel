# PHOTOGRAPHE — ATELIER LUMEN · LA PLANCHE

Un seul écran, **1440 × 900**, arrêté. Rien en dessous, aucun
défilement. Atelier **fictif**, coordonnées neutres.

> **SECONDE PASSE DU 2026-08-01.** Le renversement de la première
> passe est GARDÉ intégralement — bord à bord, marge de page 0,
> aucun titre, un monument contre un mur, la typographie sous
> 11 px. C'est lui qui a fait passer l'écran de 6 à 8, et il n'est
> pas remis en cause.
>
> **Trois choses en sont sorties, et une y est entrée.**
>
> | | |
> |---|---|
> | **sort** | la **case filée** — un flou directionnel au milieu d'un portfolio de photographe |
> | **sort** | les **trois objets** — deux roses, une céramique, des branches de saule, sur un écran qui déclare « photographie d'architecture » |
> | **sort** | **`photo-12`**, la huitième épreuve d'architecture : elle ne tient aucune case |
> | **entre** | **un seul étalonnage** pour toutes les épreuves, et une **lumière rasante** à la place du filé |
>
> Le compte passe de **11 à 7**, et il est maintenant vérifiable
> sur l'écran : sept numéros, de `01` à `07`.

---

## La thèse, en une ligne

**L'image n'illustre pas l'écran : elle EST l'écran.** Sept
épreuves bord à bord, zéro gouttière, zéro marge, pas un titre.
Toute la typographie tient dans **1,96 %** de la surface, à 11 px
au plus. Ce qu'un visiteur regarde pendant trois secondes, c'est
du travail — pas une phrase sur du travail.

---

## LE MOMENT FORT — l'échelle, et rien d'autre

> **Un monument de 620 × 900 contre un mur de six vignettes.
> Rapport d'aires : 6,93 : 1.**

Il se nomme en une phrase, il se voit en moins d'une seconde, il
ne repose sur aucun défaut, et **c'est le seul endroit d'un écran
qui s'interdit les gros caractères où l'échelle brutale du
standard peut encore vivre** : elle est transposée de la
typographie à l'image.

**La case filée n'était pas le moment fort, elle était un pari
perdu.** Deux raisons, chacune suffisante.

1. **Dans le portfolio d'un photographe, une image floue est la
   seule chose qui tue la crédibilité.** Le mur dit « voici mes
   épreuves » ; une épreuve molle au milieu dit « je n'ai pas su
   faire la mise au point ». Le joint net et la direction du flou
   demandaient deux secondes d'analyse ; le brief en donne trois,
   et il les veut en « wow », pas en excuse.
2. **Piège 71.** À 0,29, une case de 440 × 300 devient 128 × 87 px.
   Le filé n'y était plus une direction, c'était une salissure.

Les cinq preuves du filé — `preuves/chantier7-ecrans/filante-*.png`
— ont été **supprimées** : elles prouvaient un geste qui n'existe
plus, et un fichier de sortie abandonné se fait relire par l'outil
suivant (piège 55).

---

## Les trois références

`tools/planche-refs.mjs` — `photo: ["spaeth", "klok", "keller"]`.
Inchangées, et elles restent bien choisies. Relevés dans
`tools/_refs/photo-spaeth`, `-klok`, `-keller`.

### 1 · DAVID SPAETH — `https://davidspaeth.com`

**Les chiffres.** Corps 12 px · deux familles · h1 **absent** (le
mot-symbole est un tracé). Mesuré sur `0-heros.png` à 1440 × 900 :
deux photographies de 700 × 782, marge de page 16 px, imagerie
≈ 85 %, plus gros texte ≈ 26 px, **12 mots**, aucune bibliothèque
d'animation.

**Ce qu'on lui prend.** Le système d'étiquetage : un libellé
minuscule posé au bord de chaque image, avec un compte entre
parenthèses. Une typographie qui n'orne pas, qui **indexe**. Et le
refus du titre : rien au-dessus de 26 px chez un photographe
professionnel.

**Ce qu'on écarte.** Les 16 px de marge — nous sommes à 0. Le
diptyque : deux images de même taille n'ont aucune hiérarchie, et
c'est justement l'échelle qui nous manquait.

### 2 · CHRISTIE HEMM KLOK — `https://christiehemmklok.com`

**Les chiffres.** Hauteur de page 900 px, l'accueil ne défile pas.
Une photographie **plein cadre 1440 × 900**, marge 0, imagerie
100 %, fond `rgb(0,0,0)` jamais visible. Lettrage jaune ≈ 150 px,
**3 mots**. Lenis seul.

**Ce qu'elle prouve.** Qu'un premier écran de photographe peut
être cent pour cent d'image, sans une seule marge, et que c'est
plus fort, pas plus pauvre.

**Ce qu'on écarte.** Le lettrage de 150 px — notre cellule
interdit le gros caractère — et son jaune acide, qui appartient au
04.

### 3 · KELLERSTÖCKL — `https://www.kellerstoecklarchitektur.at`

**Les chiffres.** Une seule famille, corps 15 px, h1 déclaré 30 px
mais **titre affiché à 15 px** (piège 57 : le relevé seul aurait
fait écrire n'importe quoi). 221 images · hauteur de page 900 px ·
aucune bibliothèque. Grille pleine page de ≈ 10 × 8 vignettes de
34 × 30 px, marge 0, vignettes coupées par les quatre bords.

**Ce qu'on lui prend.** La grille qui touche les quatre bords.

**Ce qu'on écarte.** L'uniformité — 80 vignettes identiques font
un tapis, pas une hiérarchie. Et **son usage du flou comme
hiérarchie, qui était repris dans le plan précédent et qui est
maintenant écarté** : ce qui tient sur une planche de 80 imagettes
de 34 px ne tient pas sur une case de 440 × 300 qu'on regarde.

> **Réserve sur ce relevé.** `tools/_refs/photo-keller/0-heros.png`
> rend aujourd'hui une grille d'**icônes d'image cassée** : les 221
> images de la page n'ont pas chargé au moment de la prise. La
> case « keller » de `refs-photo.png` ne montre donc plus le site,
> elle montre son squelette. Les chiffres ci-dessus viennent du
> relevé d'origine et restent valides ; l'image, non. Le relevé est
> à refaire — ce n'est pas fait ici pour ne pas changer une
> référence en fin de chantier.

---

## La direction artistique

| Poste | Décision |
|---|---|
| **Référence culturelle** | **La planche de tirage punaisée au mur d'un atelier.** Pas une galerie : le mur où les épreuves se touchent parce qu'il n'y a pas de place, et où l'une est grande parce qu'elle vaut plus que les autres |
| **Palette** | **Aucune couleur d'interface, et c'est le parti.** Une seule valeur non photographique existe : l'encre `#101314` des pastilles, avec `#F4F1EA` et `#B9B3A8` pour le texte. Toute la couleur vient des sept fichiers et de leur étalonnage, § suivant |
| **Typographie** | **`inter` seule, deux faces (400 et 600), rien au-dessus de 11 px.** Mot-symbole 11 px / 600 / 0,20 em ; compte et sous-titre 10 px ; numéros de cadre 9 px / 500 ; coordonnées 10 px ; mention 9 px. **Aucun titre, aucune police d'affichage chargée.** Le monospace était le choix naturel d'une planche-contact : il est **interdit**, c'est l'exclusivité du 07. Un `inter` de chasse normale n'est ni la condensée du 04 ni l'étendue du 10. **L'échelle typographique de cet écran est nulle par construction** — elle est remplacée par l'échelle des images |
| **Composition au pixel** | **Trois colonnes, zéro gouttière, zéro marge, `1440 = 620 + 470 + 350`.** Relevé DANS la page : `01 0,0,620,900` · `02 620,0,470,350` · `03 620,350,470,330` · `04 620,680,470,220` · `05 1090,0,350,230` · `06 1090,230,350,360` · `07 1090,590,350,310`. **Les joints de B et de C ne s'alignent jamais** — B coupe à 350 et 680, C à 230 et 590 : une grille dont les lignes se répondent se lit comme un tableau |
| **Les registres d'échelle** | **558 000** px² (01) · **164 500 · 155 100** (02 · 03) · **126 000 · 108 500 · 103 400** (06 · 07 · 04) · **80 500** (05). Rapport du plus grand au plus petit : **6,93 : 1**. Le plan précédent affichait 8,2 : 1 sur onze cases ; le rapport baisse parce que les cases sont plus GRANDES — la plus petite passe de 68 397 à 80 500 px², soit 101 × 67 px dans le panneau réduit au lieu de 93 × 62 |
| **L'épreuve pleine hauteur** | `photo-16.webp`, **620 × 900**, colonne A, **43 % de la planche**. Elle touche trois bords et n'a de voisine ni au-dessus ni en dessous : la seule des sept dans ce cas. Fichier natif portrait 1000 × 1400 ; à 620 × 900 le recadrage vaut **4 %** — le cadre du photographe n'est pas retaillé. Sujet : une arête en chevron de béton en contre-plongée, la seule perspective forte de la banque |
| **Formes** | Aucune. Zéro rayon, zéro ombre, zéro dégradé de fond, **et plus aucun flou nulle part**. Les pastilles sont des rectangles pleins posés à fleur des coins de case : elles marquent les joints de la grille au lieu de flotter dedans |
| **Traitement photo** | § « L'étalonnage », ci-dessous — c'est le poste le plus travaillé de cette passe |
| **Le geste** | § « La lumière rasante », ci-dessous |
| **Ce qu'on ne fait pas** | Aucun titre, aucun caractère au-dessus de 11 px, aucune police d'affichage. Aucune marge, aucune gouttière, aucun fond visible. Aucun monospace (07). Aucun sarcelle d'interface (09), aucune terre cuite d'interface (10), aucun orange, aucun minium, jamais la typographie d'APED. Aucun écran sombre. **Aucune photographie qui ne soit pas de l'architecture** — `photo-14` (céramique), `photo-15` (roses) et `photo-18` (saule) sont sorties ; `photo-1` à `photo-7` (matériel de studio) restent écartées : une planche montre le travail, jamais l'équipement, et quatre portent du lettrage sur des boîtiers. Aucun nom de client, aucune publication, aucun prix, aucun avis, aucune adresse web. Aucune donnée de prise de vue inventée |

---

## L'ÉTALONNAGE — le poste refait, avec les chiffres avant et après

**Le défaut.** L'écran portait **deux étalonnages posés côte à
côte** : un monument franchement doré et trois voisines franchement
sarcelle. Ce n'est pas un désaccord de goût, ça se mesure.

### L'instrument

`photo-teintes.mjs` (jetable, dans le bac à sable de la session)
photographie la page à 1440 × 900, découpe les rectangles de case
**relevés dans le DOM**, convertit chaque pixel en Lab et moyenne
les **vecteurs (a\*, b\*)** — pas les angles : la teinte HSL d'un
gris clair saute d'un bout à l'autre du cercle pour trois niveaux
d'écart. Sont exclus `L* < 12` (les pastilles d'encre opaques) et
`L* > 96` (les ciels brûlés). La bande de lumière est masquée
pendant la mesure : on mesure l'étalonnage, pas le geste.

**Une moyenne vectorielle peut s'annuler** — `photo-13` rendait une
chroma de 0,62, « neutre », alors que l'œil voyait un ciel sarcelle
saturé se battre contre un béton chaud. L'outil compte donc aussi
la **part de pixels franchement froids** (`b* < −4`) et
franchement chauds (`b* > +4`). C'est ce compte-là qui dit « deux
familles », pas la moyenne.

### AVANT

| case | fichier | L\* | chroma | teinte | % froid |
|---|---|---|---|---|---|
| f01 | photo-16 | 58,1 | 21,31 | **77,1°** | 0,1 |
| f02 | photo-13 | 70,6 | 0,62 | 262,4° | **20,5** |
| f03 | photo-8 | 51,2 | 9,20 | 68,8° | 0,1 |
| f07 | photo-9 | 53,2 | 11,30 | 117,2° | 0 |
| f08 | photo-10 | 72,6 | 21,69 | **260,5°** | **99,5** |
| f09 | photo-12 | 72,1 | 12,12 | 152,2° | **16,8** |
| f10 | photo-17 | 66,2 | 13,71 | 71,8° | 0 |
| f11 | photo-15 | 38,4 | 22,85 | 57,3° | 1,2 |

> **Écart de teinte maximal : 176,6°** — `photo-16` (77,1°) contre
> `photo-10` (260,5°). C'est l'opposé du cercle.
> **Planche entière : 14,0 % de pixels froids.**
> **Trois cases au-dessus de 15 % de froid.**

### LE SENS CHOISI — le sable de béton

Trois raisons, dans cet ordre.

1. **`photo-16` tient 43 % de l'écran et elle est nativement
   chaude.** La tirer au gris froid, c'était dénaturer la seule
   image que le visiteur regarde vraiment.
2. **Le gris froid neutre nous poussait vers le noir et blanc pur
   de la coiffure (03)**, qui est son exclusivité. Deux de nos sept
   fichiers sont déjà des noir et blanc : le pas était court.
3. **Le sarcelle appartient à la clinique (09)**, et trois de nos
   fichiers en portaient.

**Ce n'est PAS la terre cuite de l'immobilier (10).** La terre
cuite y est sombre, saturée, et c'est une couleur **d'interface** —
aplats, texte, filets. Chez nous le sable est clair, peu
chromatique (chroma moyenne 14,4), et **aucun élément
non-photographique ne le porte** : il n'existe que dans les sept
fichiers.

### La méthode, et le premier jet qui était faux

`sepia()` d'abord, qui rabat toutes les teintes sur une seule ;
`saturate()` ensuite ; `hue-rotate()` pour poser l'angle.

**Premier jet : `sepia(.80…94) saturate(1.45…1.75)`.** L'écart de
teinte tombait à 22,6° — le chiffre disait « réussi » — mais la
chroma moyenne montait de 14,1 à **23,1** et la planche virait au
beurre : le ciel sarcelle de `photo-13` devenait olive, la tour de
verre devenait du laiton. Ça ne se lit pas comme un tirage, ça se
lit comme un filtre. **`saturate()` descend sous 1** : c'est le
sépia lui-même qui porte la teinte, il faut lui en retirer, pas lui
en ajouter.

### APRÈS

```
.g-16  sepia(.30) saturate(1.02) hue-rotate(-4deg) contrast(1.15) brightness(1.06)
.g-13  sepia(1)   saturate(.66)  hue-rotate(-2deg) contrast(1.20) brightness(1.03)
.g-8   sepia(.88) saturate(.82)  hue-rotate(-6deg) contrast(1.10) brightness(1.06)
.g-9   sepia(.74) saturate(.84)  hue-rotate(-4deg) contrast(1.12) brightness(1.04)
.g-10  sepia(1)   saturate(.52)  hue-rotate(-2deg) contrast(1.26) brightness(.99)
.g-17  sepia(.88) saturate(.80)  hue-rotate(-6deg) contrast(1.12) brightness(1.04)
.g-11  sepia(1)   saturate(.60)  hue-rotate(-2deg) contrast(1.22) brightness(1.02)
```

| case | fichier | L\* | chroma | teinte | % froid |
|---|---|---|---|---|---|
| 01 | photo-16 | 58,1 | 14,45 | 80,7° | 0,1 |
| 02 | photo-13 | 76,6 | 17,65 | 84,6° | 0 |
| 03 | photo-8 | 51,2 | 13,24 | **78,8°** | 0 |
| 04 | photo-9 | 70,1 | 16,99 | 83,9° | 0 |
| 05 | photo-10 | 70,3 | 13,19 | **85,0°** | 0,9 |
| 06 | photo-17 | 56,5 | 13,83 | 81,4° | 0 |
| 07 | photo-11 | 45,6 | 11,16 | 83,4° | 1,0 |

> **Écart de teinte maximal : 6,2°** — `photo-8` (78,8°) contre
> `photo-10` (85,0°).
> **Planche entière : 0,1 % de pixels froids.**
> **Aucune case au-dessus de 15 % de froid.**

| | avant | après |
|---|---|---|
| écart de teinte max | **176,6°** | **6,2°** |
| pixels froids, planche entière | **14,0 %** | **0,1 %** |
| cases à plus de 15 % de froid | **3** | **0** |
| chroma, min → max | 0,62 → 22,85 | 11,16 → 17,65 |

**Ce qui varie encore d'une case à l'autre est la VALEUR, jamais la
teinte** : `L*` va de 45,6 à 76,6, soit un écart de 31 points. C'est
ainsi qu'on tire une planche — une seule teinte, sept densités — et
c'est ce qui la fait lire comme un corpus plutôt que comme un
dossier d'images trouvées.

---

## LA LUMIÈRE RASANTE — le geste, un seul

Une bande de **190 px** monte l'exposition de ce qui passe dessous
et traverse la planche de gauche à droite en **9 000 ms**, en
boucle, à vitesse constante.

```css
.rasant{ width:13.1944%; height:100%; z-index:2; pointer-events:none;
  backdrop-filter:brightness(1.22) saturate(1.06);
  mask-image:linear-gradient(90deg,transparent 0,#000 6%,#000 94%,transparent 100%);
  animation:rase 9000ms linear infinite; }
@keyframes rase{ from{transform:translateX(-100%)} to{transform:translateX(1440px)} }
```

**Pourquoi une lumière et pas une épreuve qui bouge.** Sur un mur
de photographies à joints nuls, **tout mouvement d'image se lit
comme un défaut d'image** : un filé se lit « mise au point ratée »,
un tirage à mi-course se lit « fichier tronqué », une case à moitié
révélée se lit « image qui n'a pas chargé ». Le seul mouvement
qu'on ne peut pas prendre pour un défaut est celui qui **traverse
plusieurs épreuves d'un coup** : une bande qui franchit la couture
verticale du mur et deux joints horizontaux n'appartient à aucune
des sept, donc ne peut être le défaut d'aucune.

**Pourquoi `backdrop-filter` et pas un voile blanc.** Un voile
abaisse le contraste de ce qu'il couvre — sur une photographie ça
se voit comme un lavage. Un filtre de fond **réexpose** : le détail
reste entier, la valeur monte. C'est ce que fait un rayon rasant
sur un mur d'épreuves.

**Pourquoi 6 % de fondu et 1,22, et pas autre chose.** Les deux
bouts ont été essayés et mesurés. À 0 % de fondu et `brightness
(1.17)`, la bande se lisait comme un rectangle collé sur le mur. À
12 % de fondu et 1,15, la pire tuile de 60 × 60 ne bougeait que de
**31,5** niveaux entre deux crans et la bande ne se voyait plus à
l'image. **6 % — 11 px de chaque côté — et 1,22.** Il reste 168 px
de plein, **49 px dans le panneau réduit** : quatre fois le
plancher du piège 71.

**Pourquoi la bande ne touche jamais le texte.** Elle est en
`z-index: 2`, les pastilles en `z-index: 3` : elles sont peintes
APRÈS, donc elles ne font pas partie du fond que le filtre
échantillonne. Le texte du mur ne se réexpose pas.

**L'instant : 4030 ms** sur 9000, déclaré dans
`<meta name="aped-instant">`. La bande est alors à `x 540 → 730`,
**à cheval sur la couture verticale du monument et sur la colonne
B** : elle traverse quatre épreuves et un joint d'encre. Critère de
recette : sur l'image arrêtée, la bande claire doit être visible
**des deux côtés de la couture**, sinon elle se lit comme un défaut
de la seule case qu'elle occupe.

### La preuve du mouvement — cinq crans, l'écart entre deux

`photo-geste.mjs` fige l'animation à 900 · 2700 · 4500 · 6300 ·
8100 ms, photographie, et compare deux à deux. Dix images ne font
pas un mouvement : c'est l'écart de pixels entre deux consécutives
qui le prouve (piège 54).

| cran → cran | écart moyen de luminance | pixels > 4 niveaux | **pire tuile 60 × 60** |
|---|---|---|---|
| 900 → 2700 | 4,89 | 20,8 % | **39,80** |
| 2700 → 4500 | 5,73 | 22,4 % | **38,60** |
| 4500 → 6300 | 5,31 | 20,9 % | **38,78** |
| 6300 → 8100 | 3,39 | 17,1 % | **38,78** |

La pire tuile est le chiffre qui compte : elle dit que le geste se
voit **quelque part**, et non qu'il se dilue partout. Environ 39
niveaux de luminance entre deux crans, sur une tuile de 60 px, est
un mouvement qu'on ne peut pas rater.

**`prefers-reduced-motion: reduce` : la bande est retirée
(`display:none`), pas arrêtée.** Elle ne porte aucune information ;
figée quelque part, elle deviendrait une colonne plus claire posée
au hasard sur le mur — c'est-à-dire une information **fausse**.
`animation: none` seul ne suffit pas : il la fige. Mesuré :
`display:none`, **0 animation en cours**, aucune information perdue.

**Repli.** `@supports not (backdrop-filter: …)` retire la bande.
Sans le filtre, rien de faux ne s'affiche : la planche est
simplement immobile. Jamais un rectangle blanc à la place.

---

## Le contenu exact

**Nom fictif :** Atelier Lumen — Québec. **Seize mots visibles au
repos**, sept numéros de cadre.

| Emplacement | Texte |
|---|---|
| `<title>` | `Atelier Lumen — photographie d'architecture` |
| Pastille (0, 0), 11 px | `ATELIER LUMEN` |
| Pastille (0, 23), 10 px | `PHOTOGRAPHIE D'ARCHITECTURE, QUÉBEC` |
| Pastille (1440, 0) à droite, 10 px | `SÉLECTION — 7 ÉPREUVES` |
| Numéros de cadre, 9 px, à fleur du coin bas-gauche | `01` … `07` |
| Pastille (1440, 900) à droite, 10 px | `000 000-0000 · COURRIEL@EXEMPLE.CA` |
| Sous elle, 9 px | `SITE DE DÉMONSTRATION` |
| Cartels (survol, `:focus-visible`, `:target`) | un par case — `ARÊTE EN CHEVRON, CONTRE-PLONGÉE`, `DALLE EN PORTE-À-FAUX`… |

**Les deux énoncés qui devaient être corrigés, et pourquoi ils
passent maintenant les quatre questions.**

**« PHOTOGRAPHIE D'ARCHITECTURE, QUÉBEC ».** *Vrai* : les sept
épreuves sont de l'architecture. Avant, trois ne l'étaient pas —
deux roses en lumière rasante, une céramique de studio, des
branches de saule sur du marbre. **L'écran contredisait son propre
énoncé**, et les roses étaient en plus la seule tache magenta de
tout l'écran, posée sous la pastille de contact. Règle A.

**« SÉLECTION — 7 ÉPREUVES ».** *Vrai* : sept photographies dans le
document, sept numéros de cadre. *Vérifiable* : le visiteur compte
les numéros, ils vont jusqu'à `07`, **et les sept sont visibles en
même temps** — c'est la différence avec le « 11 épreuves » de la
passe précédente, dont quatre vivaient dans la filante et deux
seulement se voyaient à l'instant photographié. Un visiteur pressé
en comptait neuf. *Contrôlé* : c'est notre accrochage. *Compris en
trois secondes* : « ce gars-là montre sept photos ».

**Pourquoi sept et pas huit, alors que le fonds en contient huit.**
`photo-12` — un refend clair et une fente vitrée — a été essayée à
350 × 160, à 350 × 200, puis agrandie 1,22× puis 2× dans sa case.
À **chaque** taille compatible avec ce mur elle rend un rectangle
crème avec une encoche : deux aplats et un trait. Un mur qui dit
« voici mon travail » et qui pose une case vide dit surtout qu'il
n'en avait pas assez. **Sept épreuves qui tiennent valent mieux que
huit dont une meuble** — et le compte affiché suit, ce qui est tout
ce que la règle A demande.

---

## Le dispositif sans script

`:hover`, `:focus-visible` et `:target` sur chaque case : le cartel
s'ouvre à droite du numéro, l'image monte d'un cran. Chaque case
est un `<a>` pointant sur son propre `id` — un vrai arrêt clavier,
un vrai anneau de focus, une sélection qui persiste dans l'URL.
**Zéro ligne de JavaScript sur la page.**

> **Un défaut trouvé par la sonde, pas par l'œil, et il annulait
> tout le travail d'étalonnage.** `filter` est une propriété
> unique : la règle de survol `filter: saturate(1.55) …`
> **remplaçait** l'étalonnage de la case au lieu de s'y ajouter.
> Une case survolée retombait donc sur la couleur de son fichier —
> le ciel de `photo-10` redevenait bleu, en plein milieu d'une
> planche sable. L'étalonnage est maintenant une **variable
> personnalisée** par case (`--etal`), et le survol la recompose :
> `filter: var(--etal) saturate(1.32) brightness(1.08)
> contrast(1.04)`. **La couleur d'origine ne réapparaît à aucun
> état.** Relevé au repos et au survol sur `#f05` :
> `sepia(1) saturate(0.52) hue-rotate(-2deg) contrast(1.26)
> brightness(0.99)` puis la même chaîne **suivie** du cran.

---

## Ce qui a été relevé, et par quoi

| Mesure | Relevé |
|---|---|
| `node tools/demos-controle.mjs --port 8099 photo` | **ok** · 20 ko · 7 images · une famille (`inter`) · rien à signaler |
| `node tools/pire-pixel.mjs photo .marque .sous .compte ".pied b" ".pied span" .num` | **12 blocs, 0 échec**, pire pixel **6,68 : 1** (`.sous` et `.pied span`, la seconde voix), les autres à 12,1 : 1. Les pastilles sont **opaques** : la mesure porte sur une couleur connue, pas sur une photographie (piège 73) |
| `node tools/ecrans-secteurs.mjs photo` | 1440 × 900 · **193 ko** · images **7/7** · 1 animation gelée à 4030 ms · bandes `[65,1 · 66,5 · 84,7 · 73,7 · 71,2 · 63,9 · 72,9 · 67,2]` — **médiane ≈ 69,9** pour un seuil de 6, aucune bande morte · **0 erreur console** |
| Débordement horizontal, 320 → 1920 px (9 largeurs) | **0 partout**, `scrollHeight` **900 partout** |
| Requêtes hors du dépôt | **0** |
| Part de la surface | typographie **25 393 px² = 1,96 %** → **imagerie 98,04 %** |
| Plus gros caractère | **11 px** · **16 mots** visibles au repos |
| Premier arrêt au clavier | `A#f01`, anneau `3px solid rgb(244,241,234)` — mesuré en **tabulant**, pas par `focus()` (piège 51). **0 arrêt sans anneau** |
| `prefers-reduced-motion: reduce` | bande `display:none`, **0 animation en cours** |
| Preuve du mouvement (règle B) | 5 crans, § « la lumière rasante » — pire tuile 60 × 60 : **38,6 à 39,8 niveaux** entre deux consécutifs |
| Seuils du piège 71, à 0,29 | la bande fait **190 → 55 px** (168 px de plein → **49 px**) et parcourt **1 630 → 473 px**. Plancher : 12 px et 40 px. La plus petite case fait **350 × 230 → 101 × 67 px** |

---

## Ce qui me distingue des onze autres

**Composition.** Je suis le seul dont l'imagerie occupe **98,04 %**
de l'écran et le seul dont la marge de page vaut **0** : les onze
autres ont tous un fond, une marge, ou les deux. Je suis aussi le
seul **mur** — une mosaïque à joints nuls, quand les onze autres
sont une photographie plein cadre plus un bloc de texte, ou un
aplat plus un bloc de texte. Sur la planche des douze, je suis la
seule case où l'œil ne trouve **aucune phrase** à lire.

**Typographie.** Je suis le seul **sans titre**. Mon plus gros
caractère fait **11 px** quand la barre commune est de 90 à 160 px.
Chez les autres le texte domine l'image ; chez moi le texte
**indexe** l'image.

**Couleur.** Je suis le seul dont la palette ne comporte **aucune
couleur d'interface** : un sable de béton à chroma 14,4 qui
n'existe que dans sept fichiers photographiques. Ce n'est ni la
terre cuite saturée du 10 (sombre, saturée, portée par des aplats),
ni le noir et blanc pur du 03 (chroma nulle), ni le sarcelle du 09.

**Le geste.** Je suis le seul dont le mouvement ne déplace aucun
objet : il déplace de la **lumière**. Aucun autre écran ne peut me
le prendre — les onze autres animent du texte, des blocs ou des
chiffres.

---

## Réserves

1. **« Saturée et lumineuse » n'est tenu qu'à moitié.** La matrice
   demande au 12 une palette « selon la photo, mais saturée et
   lumineuse ». Après l'unification, la planche est **lumineuse**
   (`L*` moyen 61,2) mais elle n'est plus **saturée** : chroma
   moyenne 14,4, contre 14,1 avant — mais cette moyenne-là ment,
   `photo-13` y comptait pour 0,62 parce que son ciel sarcelle et
   son béton chaud s'annulaient — et 23,1 au premier jet. C'est le
   prix payé pour tenir « un seul étalonnage », et c'est un
   arbitrage que j'assume — mais c'est un arbitrage, pas une
   réussite sur les deux tableaux.
2. **La bande de lumière est un pari, moins gros que le filé mais
   un pari quand même.** Elle est mesurée (39 niveaux entre deux
   crans, 49 px de plein dans le panneau) et elle traverse quatre
   épreuves, ce qui l'empêche d'être prise pour le défaut d'une
   seule. Mais **aucun œil humain ne l'a vue**, et un directeur
   artistique pressé peut encore la lire comme un artefact de
   rendu. Si elle tombe, l'écran n'a plus de geste — et
   `demos-controle.mjs` refuse un écran sans `@keyframes`.
3. **Sept épreuves d'architecture, c'est tout le fonds moins une.**
   Le corpus est très homogène de sujet : sept bétons et verres, en
   contre-plongée ou en façade. Un client qui cherche du portrait,
   de l'événementiel ou du produit ne se verra pas dedans. C'est
   assumé et **dit par le sous-titre** — mais ce n'est pas défendu,
   c'est déclaré.
4. **Le relevé de la référence `keller` est périmé** : son
   `0-heros.png` ne montre plus que des icônes d'image cassée. La
   troisième case de `refs-photo.png` ne prouve donc plus rien.
5. **`photo-16` reste étalonnée loin de son fichier**, mais moins
   qu'avant : `saturate(1.62)` est passé à `1.02`, et la chroma de
   la case de 21,31 à 14,45. Sur un écran non étalonné elle ne
   devrait plus virer au doré.
6. **Rien n'a été vu sur un appareil réel.** Le rendu sous 720 px
   (trois colonnes qui se replient en un haut pleine largeur et deux
   demi-colonnes) n'a été vérifié qu'en émulation, et n'a jamais été
   regardé à l'image.
7. **Les deux outils de mesure de cette passe sont jetables.**
   `photo-teintes.mjs` (écart de teinte case par case) et
   `photo-geste.mjs` (cinq crans, écart de pixels) vivent dans le
   bac à sable de la session, pas dans `tools/`. Les chiffres
   ci-dessus ne sont donc **pas rejouables** en l'état : il faudrait
   verser les deux outils dans le dépôt pour qu'une session
   suivante puisse vérifier une régression d'étalonnage.
