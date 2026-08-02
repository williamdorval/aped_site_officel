# CONSTRUCTION — CORDEAU

Entrepreneur général fictif. **CORDEAU** — le cordeau est le premier
trait de tout chantier : la ligne à la craie qu'on claque au sol avant
la première coupe. Le nom porte la composition entière : cette page est
tracée au cordeau.

Un seul écran, 1440 × 900, arrêté. Rien en dessous.

---

## Les trois références

Trouvées par `node tools/refs-galerie.mjs` sur
`siiimple.com/category/architecture/`,
`land-book.com/?search=architecture` et
`awwwards.com/inspiration_search/architecture/` — soixante-deux
domaines sortants, pas des pages de galerie. Onze relevés lancés, huit
réussis, trois retenus : **un constructeur, un architecte, un ingénieur
en structure.** Écartés en route : `slantis.com` et `abvtek.com`
(préchargeur photographié, capture plate), `acor-moe.fr` (écran noir),
`cobloc.archi` (transition en vol), `aktii.com` (domaine parqué —
le vrai AKT II est `akt-uk.com`).

---

### 1 · Haven Constructions — `https://www.havenconstructions.com.au`

Constructeur résidentiel haut de gamme à Melbourne, nommé aux Awwwards.
Le seul vrai **entrepreneur** des trois.

**Ce qu'elle prouve.** Qu'un constructeur n'a pas besoin d'une
photographie pour ouvrir. Le premier écran est **blanc, vide sur ses
deux tiers hauts**, et le nom occupe le tiers bas d'un bord à l'autre.
La photographie n'arrive qu'à `y = 852` — sous la ligne de flottaison,
en amorce. L'œil tombe sur le nom, puis remonte à droite vers la
phrase. Message en trois secondes : *un nom, une ville, une date de
fondation* — rien d'autre, et ça suffit.

**Ce qu'on lui prend.**
- **Le débord jusqu'aux marges.** Le mot est dessiné à la largeur de la
  feuille, pas à la largeur d'une colonne. On applique ce geste à notre
  **phrase**, pas à notre nom.
- **Les libellés de coin.** `EST. 1990` en bas à gauche, `MELBOURNE` en
  bas à droite, tous deux à `y = 808`, 14,7 px, même couleur que le
  texte courant. Deux ancres qui tiennent la page par le bas sans
  meubler. C'est l'embryon d'un cartouche.
- **Le corps de texte poussé dans le coin haut-droit** (`x = 1061`,
  `y = 328`) au lieu d'être sous le titre. Le vide au centre est un
  choix, pas un oubli.
- **Le bleu comme masse, pas comme accent** : `rgb(12, 56, 141)` est le
  fond le plus fréquent du document (5 occurrences relevées).

**Ce qu'on écarte.** Le nom en géant — on le range dans le cartouche,
là où un dessin range le nom du bureau. Le blanc — on inverse la
luminance. Et la photographie en amorce sous le pli : on n'a pas de
pli.

**Les chiffres du relevé.** Familles : `fontSuisse` (Suisse Intl) +
Times New Roman. Corps 16 px. `h1` relevé plus bas dans la page :
47 px / interlignage 56,97 px (1,21) / chasse −1,899 px / graisse 400 /
`rgb(37, 35, 32)`. Fonds fréquents : `rgb(12, 56, 141)` ×5,
`rgb(216, 216, 224)` ×2, `rgb(37, 35, 32)` ×2. Hauteur de page
12 454 px, 14 images dont 9 grandes. Lenis, ni GSAP ni ScrollTrigger.
**Mesuré à l'écran (1440 × 900) :** le mot n'est pas du texte, c'est un
SVG de **1336 × 396 px** posé à `x = 44, y = 396` — marge gauche 44 px,
marge droite 60 px, hauteur de capitale égale à 44 % de la fenêtre.
Rapport titre / texte courant : **396 / 14,7 = 27:1**. Il n'y a aucun
palier entre les deux.

---

### 2 · Marte.Marte Architekten — `https://www.marte-marte.com`

Bureau autrichien (Feldkirch). Le premier écran est **une grille pleine
de dessins**, pas de photographies.

**Ce qu'elle prouve.** Que **le dessin peut être l'image**. Sur les
quinze cases visibles du premier écran, une bonne moitié sont des
**élévations et des coupes** réduites à des aplats noirs et blancs —
un pignon, une charpente, un porte-à-faux. Aucune légende, aucun titre,
aucun survol nécessaire pour comprendre qu'on est chez des gens qui
dessinent. L'œil part en haut à gauche et balaye en Z sans jamais
rencontrer de texte avant la barre du bas.

**Ce qu'on lui prend.**
- **Le zéro gouttière.** Les cases font 290 px pour un pas de 288 —
  elles se **chevauchent de 2 px**. Aucun blanc entre elles. La page est
  une surface continue, pas une composition d'objets posés.
- **Le dessin technique traité en image de premier écran**, sans qu'il
  ait besoin d'être joli.
- **La barre d'information collée au bas** (`y = 842 → 900`) : nom du
  bureau à gauche à `x = 25`, quatre colonnes de menu à pas régulier de
  144 px à partir de `x = 720`, actif en blanc, inactif en
  `rgb(76, 76, 76)`. Une réglette, pas une navigation.

**Ce qu'on écarte.** La mosaïque de quinze cases — elle raconte un
catalogue, et nous n'avons qu'un écran à raconter. Le noir pur
`rgb(22, 22, 22)`, qui n'est pas une couleur de plan. Et l'absence
totale de titre : un entrepreneur général doit dire ce qu'il fait, un
architecte connu peut se contenter de montrer.

**Les chiffres du relevé.** Familles : `Gedau-Book` + Arial. Corps
16 px sur `rgb(0, 0, 0)`. **Aucun `h1`.** Fond dominant
`rgb(22, 22, 22)` ×59. Hauteur 4 074 px, **70 images, zéro grande
image** — tout est tuile. Swiper ; ni GSAP, ni Lenis, ni ScrollTrigger.
**Mesuré à l'écran :** tuiles de **290 × 290 px** aux abscisses
−1 / 287 / 575 / 863 / 1151 (pas 288 = 1440 ÷ 5) et aux ordonnées
−3 / 283 / 569 / 855 (pas 286). Cinq colonnes exactement. Menu 16 px /
interlignage 24 px. Le nom du bureau : 16 px, interlignage 66 px.

---

### 3 · AKT II — `https://www.akt-uk.com`

Ingénieurs en structure, Londres. Le registre technique le mieux tenu
des trois, et le seul qui ose deux panneaux.

**Ce qu'elle prouve.** Qu'on peut ouvrir sur **le mot du métier, écrit
petit, en haut à gauche** — `Structural engineering.` à `x = 16,
y = 16`, 16 px — et mettre les 100 px sur la **navigation**, pas sur un
slogan. Le visiteur sait en un mot où il est tombé, puis choisit sa
porte. Aucun centrage : les deux mots géants sont posés en **contrepoint
diagonal**, l'un en haut à gauche du panneau gauche, l'autre en bas à
gauche du panneau droit.

**Ce qu'on lui prend.**
- **La déclaration de discipline en 16 px dans le coin supérieur
  gauche**, avant tout le reste. Chez nous : `CORDEAU · ENTREPRENEUR
  GÉNÉRAL`.
- **Le refus du centre.** Rien n'est centré sur cet écran, et rien ne
  manque.
- **La graisse 900 sur une grotesque à formes carrées** (`neo-sans`) :
  la seule des trois références dont les lettres ont l'air *usinées*.
  C'est l'argument qui décide notre affichage (voir plus bas).
- **Les panneaux jointifs à 4 px** — deux surfaces de 718 px qui se
  touchent presque. Pas de carte, pas d'ombre, pas de marge molle.

**Ce qu'on écarte.** **Le vert acide `rgb(205, 211, 21)`** — interdit
par notre voie, et de toute façon c'est lui qui date la page. La
photographie plein cadre sur les deux panneaux. Le bandeau de témoins
qui mange 90 px du premier écran. Et l'interlignage de 160 px sur un
corps de 100 px (1,60) — beaucoup trop lâche pour un registre
technique ; nous serrons à 0,92.

**Les chiffres du relevé.** Famille : `neo-sans`. Corps 16 px.
**Aucun `h1`.** Fonds : `rgb(51, 51, 51)` ×12, `rgb(46, 43, 41)` ×5.
Hauteur 4 014 px, 10 images, zéro grande. Aucune bibliothèque
d'animation détectée. **Mesuré à l'écran :** deux panneaux de
**718 × 900** à `x = 0` et `x = 722`. `Projects.` — 100 px /
interlignage 160 px / graisse 900 / `rgb(205, 211, 21)` à
`x = 50, y = 90`. `Practice.` — mêmes valeurs à `x = 772, y = 663`.
Libellé de discipline : 16 px / graisse 900 / chasse 0,5 px à
`x = 16, y = 16`. Navigation : 14 px / graisse 500, fin de ligne à
`x = 1371`. Rapport titre / navigation : **100 / 14 = 7:1**.

---

## La direction artistique

| | |
|---|---|
| **Référence culturelle** | **Le dessin d'exécution d'un entrepreneur général québécois**, format ANSI D, tracé au traceur sur bleu. Pas la maquette d'architecte, pas le rendu 3D : la feuille sale qu'on déplie sur le capot d'un pick-up. Trois emprunts mesurés : le débord jusqu'aux marges et les libellés de coin de **Haven**, le dessin-comme-image et le zéro gouttière de **Marte.Marte**, la discipline déclarée en 16 px et le refus du centre d'**AKT II**. |
| **Palette (hex nommés)** | **Trois valeurs, et rien d'autre.**<br>`--plan` **`#0a2540`** — le bleu de plan. Toute la surface, bord à bord. Aucune seconde valeur de fond.<br>`--cyan` **`#3fc8e8`** — l'encre du traceur. Cotes, lignes d'attache, flèches, bulles de repère, et **un seul aplat** : le bouton.<br>`--trait` **`#e8eef5`** — le blanc de trait, légèrement froid.<br>**Les seules opacités admises sur `--trait`, et leur rendu exact sur `#0a2540` :**<br>`100 %` = `#e8eef5` → 13,3:1<br>`78 %` = `#b7c2cd` → 8,3:1<br>`62 %` = `#94a2b0` → 5,95:1 — **plancher absolu pour du texte**<br>`16 %` = `#2e455d` → **lignes fortes du quadrillage, jamais de texte**<br>`08 %` = `#1c354f` → **lignes fines du quadrillage, jamais de texte**<br>`--cyan` sur `--plan` = **7,87:1** ✔ · `--plan` sur `--cyan` (le bouton) = **7,87:1** ✔<br>**Aucun orange, aucun jaune, aucun vert, aucun rouge. Aucun gris neutre** — tout gris apparent est du `--trait` dilué dans le bleu, donc bleuté. |
| **Typographie (familles + tailles px + interlignage)** | **`space-grotesk` 700** pour l'affichage — **on la garde, et voici pourquoi plutôt que par défaut.** Le relevé d'AKT II montre que le seul des trois qui *sonne ingénieur* emploie une grotesque à formes carrées en graisse 900 ; Haven et Marte.Marte emploient des néo-grotesques humanistes et sonnent *architecte*. Space Grotesk est la dérivée **proportionnelle de Space Mono** : ses contrepoinçons carrés, ses terminaisons coupées à l'équerre et son `a` à toit plat sont le résidu d'un dessin monochasse. Notre couche technique entière étant en monochasse, l'affichage et les cotes viennent alors **du même genre de lettre** — exactement ce que fait une feuille de dessin, qui n'a qu'une écriture, à deux tailles. C'est l'argument, et il ne tient que si on refuse les réglages par défaut : **jamais de chasse nulle, jamais d'interlignage 1,2.**<br>**Si le client refuse cette famille**, la seule substitution défendable dans `fonts/demos/` est **`archivo` 600** (SIL OFL, Omnibus-Type) : plus plate, plus neutre, hauteur d'x plus haute — elle perdrait le lien de genre avec la monochasse mais gagnerait en sobriété. **`anton` 400** et **`oswald` 600** sont écartés : une seule graisse chacune, donc aucune hiérarchie possible, et le gothique condensé est le cliché n°1 du site de construction.<br>**Technique : `jetbrains-mono` 500** — cotes, repères de marge, légende, cartouche, navigation, coordonnées. **ATTENTION, contrainte dure vérifiée dans `fonts/demos/_declarations.css` : `jetbrains-mono` n'existe qu'en graisse 500.** Toute règle `font-weight: 600/700` sur la monochasse produira une **fausse graisse synthétique** — sur du 10 px au-dessus d'un quadrillage, c'est une bouillie. Idem : `space-grotesk` n'existe qu'en **500 et 700**.<br>**L'échelle, au pixel :**<br>`h1` — `space-grotesk` **700 · 130 px · interlignage 0,92 (= 120 px) · chasse −0,02em · --trait 100 %` · deux lignes, bloc de 240 px<br>sous-titre — `space-grotesk` **500 · 19 px / 27 px · --trait 78 %** · largeur maximale 560 px<br>bouton — `space-grotesk` **700 · 15 px · chasse 0,06em · capitales**<br>nom dans le cartouche — `space-grotesk` **700 · 28 px**<br>navigation — `jetbrains-mono` **500 · 13 px · chasse 0,10em · capitales · --trait 78 %**<br>valeurs de cote — `jetbrains-mono` **500 · 11 px · chasse 0,04em · --cyan**<br>légende, champs du cartouche — `jetbrains-mono` **500 · 11 px / 16 px · --trait 78 %** ; les intitulés à **10 px · chasse 0,16em · --trait 62 %**<br>repères de marge et bande de coordonnées — `jetbrains-mono` **500 · 10 px · chasse 0,14em · --trait 62 %**<br>**Rapport d'échelle : 130 / 11 = 11,8:1. Un seul palier intermédiaire (19 px), et il ne sert qu'à une phrase.** |
| **Composition du premier écran (au pixel)** | **Tout ce qui suit tombe sur un multiple de 12.**<br>**Le quadrillage.** Pas fin **12 px**, ligne forte **tous les 60 px** (soit un module sur cinq). Sur 1440 × 900 : **120 × 75 cases fines, 24 × 15 cases fortes** — les deux dimensions sont entières, aucune case tronquée nulle part. Fines en `--trait 08 %` (`#1c354f`), fortes en `--trait 16 %` (`#2e455d`), toutes de 1 px. **Le quadrillage couvre la totalité de la surface, y compris par-dessus la photographie** — c'est ce détail-là, et lui seul, qui fait que la photo appartient au dessin au lieu d'être collée dessus.<br>**Le cadre.** Filet de 1 px `--trait 78 %` en retrait de 60 px : rectangle **(60, 60) → (1380, 840)**, soit 1320 × 780. C'est la feuille.<br>**Les repères de marge.** En haut, **onze zones de 120 px** numérotées `1` à `11`, chiffres centrés à `x = 120, 240, … 1320`, ligne de base `y = 44`. À gauche, **six zones de 130 px** lettrées `A` à `F`, centrées à `y = 125, 255, 385, 515, 645, 775`, à `x = 18`. Un tiret de 8 px traverse le cadre à chaque limite de zone. Marges droite et basse laissées libres (une feuille réelle ne lettre souvent que deux bords) : la marge basse porte les coordonnées.<br>**Bandeau de tête**, `y = 60 → 96`. À gauche, `x = 60` : `CORDEAU` en 22 px 700, puis à `x = 172` : `· ENTREPRENEUR GÉNÉRAL` en mono 11 px chasse 0,16em `--trait 62 %`. À droite : la navigation, quatre entrées, fin de ligne calée sur `x = 1380`. Filet de 1 px `--trait 30 %` à `y = 96`, de `x = 60` à `x = 1380`.<br>**Le titre**, `y = 132 → 372`, calé à `x = 60`. Deux lignes de 120 px. **La ligne 2 doit mesurer 1320 px ± 8 px** — elle touche le cadre à gauche et à droite comme le mot de Haven touche ses marges. **Si elle ne les touche pas, on ajuste la taille (130 px est la valeur de départ), jamais le texte.**<br>**Les trois cotes. Elles mesurent des éléments réels de cette page, en pixels, et le visiteur peut vérifier chaque chiffre avec une capture d'écran et une règle.**<br>**C1 — horizontale**, `y = 396`, de `x = 60` à l'extrémité droite de la **ligne 1** du titre (≈ `x = 879`). Lignes d'attache verticales de 1 px cyan à chaque extrémité, de `y = 380` à `y = 412`. Flèches **triangulaires pleines** de 8 × 5 px pointant vers l'extérieur. Valeur dans une coupure de 56 px au milieu du filet. **Valeur attendue ≈ `819` — à relever après rendu. Si l'écart avec la mesure réelle dépasse 1 px, on corrige le chiffre, jamais la cote. Si on ne peut pas la mesurer, on la supprime.**<br>**C2 — verticale**, `x = 36`, dans la marge gauche, de `y = 132` à `y = 372`. Mesure la hauteur du bloc de titre. Valeur **`240`**, tournée à −90°, lue de bas en haut. Lignes d'attache horizontales de `x = 60` à `x = 30`.<br>**C3 — verticale**, `x = 912`, de `y = 528` à `y = 840`. Mesure la hauteur de la plaque photographique. Valeur **`312`**, tournée à −90°.<br>**Sous-titre**, `x = 60`, `y = 420 → 474`, deux lignes, largeur maximale 560 px.<br>**Bouton**, rectangle plein **300 × 48**, `x = 1080 → 1380`, `y = 420 → 468`. Aplat `--cyan`, texte `--plan`. Aucun rayon, aucune ombre, aucun contour. C'est le seul aplat de cyan de l'écran.<br>Filet de 1 px `--trait 16 %` à `y = 504`.<br>**La plaque photographique**, `x = 60 → 900`, `y = 528 → 840` — **840 × 312**, rapport 2,69:1. Elle partage l'arête basse du cadre.<br>**La colonne de droite**, `x = 936 → 1380`. Légende : intitulé `LÉGENDE` à `y = 528` ; entrée `01` à `y = 552` ; entrée `02` à `y = 600`.<br>**Le cartouche**, `x = 936 → 1380`, `y = 672 → 840` — **444 × 168**. Il **partage l'angle inférieur droit du cadre** : ses arêtes droite et basse *sont* les filets du cadre, il n'a pas de contour propre de ce côté. Bandeau de 56 px puis **quatre rangées de 28 px**, séparées par des filets de 1 px `--trait 30 %` à `y = 728, 756, 784, 812`. Filet vertical à `x = 1080`, de `y = 728` à `y = 840` : intitulés à gauche (144 px), valeurs à droite (300 px).<br>**Bande de coordonnées**, hors cadre, `y = 864`. À gauche depuis `x = 60`, à droite calée sur `x = 1380`.<br>**Rien n'est centré sur cette page.** Les seules valeurs centrées sont les chiffres de cote sur leur propre ligne de cote — c'est la règle du dessin coté, pas un centrage de mise en page. |
| **Formes** | Angles vifs partout, **rayon 0**. Trois épaisseurs de trait et pas une de plus : **1 px** (quadrillage, cadre, cotes, filets du cartouche), **1 px cyan** (cotes et repères), **aplat** (le bouton seul). Les flèches de cote sont des **triangles pleins** de 8 × 5 px, pas des chevrons. Les bulles de repère sont des **carrés** de 20 × 20 px, contour 1 px cyan, chiffre mono 10 px cyan centré — jamais des cercles, un cercle est un rayon. Les lignes de renvoi sont des segments de 1 px à 45° de 48 px, terminés par un **carré plein de 3 px**. Aucune ombre, aucun dégradé, aucun flou, aucun `backdrop-filter`. La profondeur n'existe pas : une feuille est plate. |
| **Traitement photo** | **Une seule photographie, et elle est annotée.** `../../images/secteurs-sites/construction-1.webp` (1920 × 1080 réels — *agrandissement greffé sur une maison existante*), `object-fit: cover`, `object-position: 50% 42%`, rendue en **840 × 312**. Traitement : `filter: grayscale(1) contrast(1.15) brightness(0.66)` et `mix-blend-mode: luminosity` sur un lit `#0a2540` — la photo devient une **plaque bleue monochrome**, jamais un rectangle de couleur posé sur un fond froid. Contour de 1 px `--cyan`. **Le quadrillage de 12 px la traverse à `--trait 08 %`.** Annotations : deux bulles carrées `01` à `(144, 600)` et `02` à `(708, 756)`, chacune avec sa ligne de renvoi de 48 px à 45° vers ce qu'elle désigne. Les légendes correspondantes vivent dans la colonne de droite. **Les bulles décrivent ce qui est visible ; elles ne cotent rien.** Une cote sur une photographie serait une mesure qu'on ne peut pas défendre — les cotes restent sur les éléments de la page, où elles sont vraies par construction. C'est la ligne à ne pas franchir. |
| **Le geste et l'instant de capture** | **Un seul geste : LE TRAIT DE CORDEAU.** Au chargement, la feuille est déjà entièrement dessinée — quadrillage, cadre, repères, titre, photo, cartouche, tout. **Seules les trois cotes se tracent.** Chaque ligne de cote croît depuis sa ligne d'attache d'origine vers l'autre, flèche en tête : C1 de gauche à droite (sens de lecture), C2 et C3 de haut en bas. **Détente linéaire** — un traceur avance à vitesse constante, et ça rend l'instant de capture calculable au pixel. Durée **760 ms** chacune, départs échelonnés : C1 à `0`, C2 à `140 ms`, C3 à `280 ms`. **Une valeur de cote ne s'affiche qu'à 100 %, d'un coup, sans fondu** — le traceur pose la plume et lettre le chiffre.<br>**On capture à `t = 640 ms`.** À cet instant : C1 est à **84 %** (sa flèche droite est à 131 px de sa cible), C2 à **66 %** (82 px), C3 à **47 %** (165 px). **Trois cotes inachevées, à trois longueurs différentes, trois chiffres encore éteints, sur une feuille par ailleurs finie.** Une cote qui ne touche pas sa ligne d'attache est une incomplétude *lisible* : l'œil sait qu'elle doit joindre les deux bouts. C'est ce qui rend le mouvement visible sur une image arrêtée.<br>Mise en œuvre : `transform: scaleX()` / `scaleY()` avec `transform-origin` du côté du départ, la flèche en enfant translaté au bout. Pas de `width` animée, pas d'opacité sur du texte.<br>**Sous `prefers-reduced-motion` : les trois cotes sont tracées entières, les trois chiffres allumés, aucune animation. Aucune information perdue, aucune information inversée.** |
| **Comment je tiens la distance avec l'identité d'APED** | Le risque est réel et il est nommé : quadrillage, cotes, micro-libellés en monochasse, filets de 1 px — c'est mot pour mot le registre d'APED. **Six séparations, dont quatre sont vérifiables par une commande.**<br>**1 · La luminance est inversée et la teinte est froide en masse.** APED pose de l'encre sur du ciment, avec un accent chaud. Ici le champ entier est `#0a2540` saturé, et rien n'est chaud : **zéro pixel orange, jaune, vert ou rouge.** Vérifiable par `grep -iE '#e2401f|orange|#f5|amber'` sur le fichier construit → doit rendre 0.<br>**2 · Le cyan ne veut pas dire « cliquable », il veut dire « mesuré ».** La règle d'APED est que le minium n'apparaît que là où le visiteur peut agir. Je romps cette grammaire volontairement : **toute cote, toute ligne d'attache, toute flèche, toute bulle est cyan**, et le bouton n'est que le seul *aplat*. Même retenue, sens opposé.<br>**3 · Mes cotes mesurent vraiment quelque chose, et le visiteur peut le vérifier.** C1 = la largeur relevée de la ligne 1 du titre. C2 = 240, la hauteur construite du bloc de titre. C3 = 312, la hauteur construite de la plaque. **Une capture d'écran et une règle suffisent à contrôler les trois.** La règle qui en découle est la seule qui compte dans ce plan : **un chiffre de cote se relève après rendu ; s'il ne peut pas se relever, la cote se supprime.** Les micro-libellés d'APED sont une texture ; les miens sont un instrument. C'est la différence entre citer un registre et l'employer.<br>**4 · Aucune trame, aucun `repeating-linear-gradient`, aucune arête qui balaye.** Le geste signature d'APED est un bord fait de grains qui traverse ; le mien est une ligne qui pousse d'un bout à l'autre à vitesse constante. **Interdire `repeating-linear-gradient` sur cet écran retire à lui seul la texture la plus reconnaissable d'APED.** Vérifiable par `grep`.<br>**5 · Le quadrillage est continu, pas gestuel.** APED ne règle jamais tout son champ ; il pose des trames comme arêtes. Ici le quadrillage est un **papier** : 12 px, partout, y compris sous la photo, immobile du début à la fin.<br>**6 · Aucune famille d'APED.** `space-grotesk` 700 et `jetbrains-mono` 500, servies depuis `fonts/demos/`. **Zéro requête tierce** : polices locales, image locale, aucun CDN, aucun script externe. |
| **Ce qu'on ne fait pas** | Pas de photographie plein cadre (on écarte Yazdani, RPBW et Storey, mesurés puis rejetés). Pas de centrage (on écarte Barozzi Veiga et Septiembre, mesurés puis rejetés). Pas de carte flottante, pas de rayon, pas d'ombre, pas de dégradé, pas de flou. Pas d'orange, pas de jaune, pas de vert — donc pas le vert acide d'AKT II ni le jaune de Slantis, même si on leur prend la composition. **Aucun prix.** Aucune licence RBQ, aucun NEQ, aucun numéro de permis, aucun chantier nommé, aucun nom de personne, aucun logo, aucun avis, aucune note, aucun témoignage. Pas de compteur qui monte, pas de « X années d'expérience » qu'on ne peut pas soutenir. Pas de bandeau de témoins. **Pas d'indice de défilement — il n'y a rien en dessous, et le prétendre serait un mensonge de plus.** Pas de deuxième photo : une plaque annotée vaut mieux que trois vignettes. |

---

## Le contenu exact

**Nom de l'entreprise (fictif)** : `CORDEAU`
**Descripteur** : `ENTREPRENEUR GÉNÉRAL`

### Bandeau de tête

```
CORDEAU
· ENTREPRENEUR GÉNÉRAL
```

Navigation, de gauche à droite, fin de ligne sur `x = 1380` :

```
SERVICES      RÉALISATIONS      L'ÉQUIPE      NOUS JOINDRE
```

### Titre du héros — mot pour mot, deux lignes

```
ON DESSINE
AVANT DE DÉMOLIR
```

### Sous-titre — mot pour mot

```
Rénovation et agrandissement résidentiels. On relève l'existant,
on dessine, on chiffre, puis on démolit.
```

### Bouton

```
DEMANDER UN RELEVÉ
```

### Valeurs de cote

```
C1   819      (à relever après rendu — largeur mesurée de « ON DESSINE »)
C2   240      (hauteur du bloc de titre)
C3   312      (hauteur de la plaque)
```

### Légende, colonne de droite

```
LÉGENDE

01 · AGRANDISSEMENT GREFFÉ SUR LE BÂTI EXISTANT
02 · MUR EXISTANT CONSERVÉ, PAREMENT DÉPOSÉ
```

### Cartouche — chaque ligne, prête à coller

Bandeau (56 px) :

```
CORDEAU                              ENTREPRENEUR GÉNÉRAL
```

Quatre rangées de 28 px, intitulé à gauche de `x = 1080`, valeur à droite :

```
PROJET      RÉNOVATION ET AGRANDISSEMENT
ÉCHELLE     1:1 — UNITÉ : PIXEL
FEUILLE     1 / 1
RÉVISION    B — 2026-08-01
```

> **Pourquoi ces quatre-là et pas les champs habituels d'un cartouche.**
> `ÉCHELLE 1:1 — UNITÉ : PIXEL` et `FEUILLE 1 / 1` sont **littéralement
> vraies** : la page est à l'échelle 1 sur l'écran, ses cotes sont en
> pixels, et il n'y a qu'un écran. `RÉVISION B` et sa date sont des
> faits qu'on contrôle. Il n'y a **ni numéro de permis, ni licence, ni
> numéro d'entreprise, ni client, ni adresse de chantier** — un
> cartouche qui porte un faux numéro de RBQ est une fausseté qui se
> vérifie en trente secondes, et ce serait la seule chose que le
> visiteur retiendrait.

### Repères de marge

```
Haut, onze zones :   1  2  3  4  5  6  7  8  9  10  11
Gauche, six zones :  A  B  C  D  E  F
```

### Bande de coordonnées, hors cadre, `y = 864`

À gauche depuis `x = 60` :

```
000 000-0000   ·   COURRIEL@EXEMPLE.CA   ·   ADRESSE SUR DEMANDE
```

Calé à droite sur `x = 1380` :

```
DESSIN DE PRÉSENTATION — NON CONTRACTUEL
```

---

## Ce qui me distingue des onze autres

**Composition.** Aucun autre écran de la série n'est une **feuille de
dessin cotée** : un quadrillage de 12 px sur toute la surface, un cadre
en retrait de 60 px, onze zones numérotées en haut et six lettrées à
gauche, trois cotes fléchées qui mesurent des éléments réels de la page
en pixels, et un cartouche qui partage l'angle inférieur droit du cadre.
Rien n'y est centré et rien n'y flotte.

**Couleur.** Une seule masse froide et saturée, `#0a2540`, bord à bord,
tenue par un unique cyan de traceur `#3fc8e8` qui signifie *mesuré* et
non *cliquable* — l'inverse de la convention. Zéro pixel chaud, zéro
gris neutre : tout gris apparent est du blanc de trait dilué dans le
bleu.

**Typographie.** `space-grotesk` 700 choisie pour une raison qui
n'appartient qu'à cet écran — c'est la dérivée proportionnelle d'une
monochasse, donc elle et `jetbrains-mono` 500 sont **la même écriture à
deux tailles**, ce qu'est une feuille de dessin. Rapport 130 / 11, un
seul palier intermédiaire, et aucune graisse qui n'existe pas dans
`fonts/demos/`.
