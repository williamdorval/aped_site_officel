# CONSTRUCTION — CORDEAU

Entrepreneur général fictif. **CORDEAU** — le cordeau est le premier
trait de tout chantier : la ligne à la craie qu'on claque au sol avant
la première coupe. Le nom porte la composition entière : cette page est
tracée au cordeau.

Un seul écran, 1440 × 900, arrêté. Rien en dessous.

---

## LA PASSE FINALE — 2026-08-01, révision C

Verdict entrant : **8,5 / 10**. « Le parti est le meilleur des neuf
démos après le gym : la page est un plan. » Quatre défauts nommés,
quatre réponses.

| Défaut | Ce qui a été fait |
|---|---|
| **1 · « La photographie ne fait pas partie du plan. Une photo posée dans un cadre est à 6. »** | Elle n'a plus de cadre du tout : duotone aux deux encres de la feuille, **contour découpé sur le module de 12 px**, quadrillage qui la traverse, deux lignes de construction qui en sortent. Voir « Traitement photo ». |
| **2 · « Le titre est à ~72 px, vise 110 à 170. »** | **Le relevé contredit le verdict : il était déjà à 152,68 px** (`cd7-verif.mjs`), soit dans la fourchette. C'est la taille maximale possible pour ce texte en deux lignes pleine feuille : elle est fixée par la contrainte « la ligne 2 mesure 1320 px », et elle rend 1319,98. Rien n'a été changé, et la mesure est écrite ici pour que personne ne la refasse. |
| **3 · « Vérifie que le cartouche lit comme une trame homogène à 0,29, pas comme un pâté. »** | Vérifié sur le rendu à 421 px : quatre rangées de 28 px, filets `--trait 30 %`, mono 10 / 11 px — il lit comme un bloc de réglures régulier. Inchangé. |
| **4 · « La trame de grille est trop régulière et trop présente partout. »** | **Trois densités**, chacune justifiée : rien dans la marge, lignes fortes seules au-dessus de `y = 420`, module fin en dessous. *On ne quadrille que ce qu'on mesure.* |

**Trois pistes essayées et ÉCARTÉES, pour qu'on ne les rejoue pas :**

1. **La bande photographique pleine largeur** (1320 px, cartouche
   poinçonné dedans). Arithmétiquement impossible : à 1320 de large
   l'échelle est forcée à 0,6875, la fenêtre ne montre plus que 454
   des 1080 lignes de la source, et le bâti en occupe 675. **Il
   faudrait couper le toit ou l'assise.** À 840 de large, il entre en
   entier.
2. **La détection de contour** (`feConvolveMatrix`, laplacien 3×3 et
   5×5, seuils discrets, dilatation — huit variantes photographiées).
   Le trait blanc sur bleu était juste de registre, mais : le
   feuillage d'eucalyptus produit un mouchetis illisible, le gain qui
   rend les arêtes fortes rend aussi la texture du parement, et à 0,29
   il ne reste **plus rien du tout**. Un dessin au trait de 1 px ne
   survit pas à une réduction de 71 %.
3. **La trame de demi-teinte à 12 px** (masque rayé 9 / 3 sur
   l'image). Bon à 1440, mais elle ajoute une **seconde fréquence** à
   côté du quadrillage de la feuille, et à 0,29 les deux battent. Le
   quadrillage de la page redessiné par-dessus le tirage fait le même
   travail avec **le module de la feuille** : une seule fréquence.

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
| **Composition du premier écran (au pixel)** | **Tout ce qui suit tombe sur un multiple de 12. Toutes les valeurs ci-dessous sont RELEVÉES sur le rendu, pas décrétées** — `scratchpad/cd7-verif.mjs`.<br>**Le quadrillage — TROIS DENSITÉS, et chacune a sa raison.** *(Correction de la passe finale : il était uniforme sur 1440 × 900, et ça aplatissait tout.)* Règle : **on ne quadrille que ce qu'on mesure.**<br>· la **marge** (les 60 px hors cadre) n'a **aucun** quadrillage — elle porte les repères de zone, et rien d'autre ;<br>· **au-dessus de `y = 420`**, seules les lignes fortes de **60 px** en `--trait 16 %` — le titre est posé sur du papier, pas sur une moustiquaire ;<br>· **sous `y = 420`**, le module fin de **12 px** en `--trait 08 %` s'ajoute : c'est le champ du relevé.<br>Le cadre contient alors **exactement 110 × 65 cases fines et 22 × 13 cases fortes** — aucune case tronquée nulle part (1320 et 780 sont tous deux multiples de 12 **et** de 60).<br>**Le cadre.** Filet de 1 px `--trait 78 %` en retrait de 60 px : rectangle **(60, 60) → (1380, 840)**, soit 1320 × 780. C'est la feuille.<br>**Les repères de marge.** En haut, **onze zones de 120 px** numérotées `1` à `11`, ligne de base `y = 44`. À gauche, **six zones de 130 px** lettrées `A` à `F`, à `x = 18`. Un tiret de 8 px traverse le cadre à chaque limite. Marges droite et basse laissées libres : la marge basse porte les coordonnées.<br>**Bandeau de tête**, `y = 60 → 96`. `CORDEAU` 22 px 700 à `x = 60`, `· ENTREPRENEUR GÉNÉRAL` en mono 11 px à `x = 172`. Navigation à droite, fin de ligne sur `x = 1380`. Filet de 1 px `--trait 30 %` à `y = 96`.<br>**Le titre**, `y = 108 → 384`, calé à `x = 60`, interlignage **138 px**. Relevé : **152,68 px**, ligne 1 = **812,2 px**, ligne 2 = **1319,98 px** — elle touche le cadre à gauche ET à droite, à 0,02 px près, comme le mot de Haven touche ses marges. *(138 et non 120 : à 120 l'accent aigu du `É` de DÉMOLIR remonte au-dessus de la ligne de base de `ON DESSINE` et se lit comme une virgule ; il culmine à 0,99 em.)*<br>**Sous-titre**, `x = 60`, `y = 420 → 474`, deux lignes de 19 / 27. **Bouton**, **300 × 48**, `x = 1080 → 1380`, `y = 420 → 468`. Aplat `--cyan`, texte `--plan`, aucun rayon, aucun contour : le seul aplat de cyan de l'écran.<br>**LE RELEVÉ**, `x = 60 → 900`, `y = 480 → 828` — boîte de **840 × 348**, mais **son contour supérieur n'est pas droit** (voir « Traitement photo »). Son arête gauche tombe **sur le filet du cadre**, son arête basse **sur la ligne de niveau**. Deux calages, aucun flottement.<br>**Les deux lignes de construction, en cyan de 2 px, et elles SORTENT du relevé pour aller mourir dans la marge** — c'est ce qui coud l'image à la feuille.<br>· **FAÎTE**, `y = 480`, de `x = 30` à `x = 660` : passe au sommet du bâti.<br>· **NIVEAU**, `y = 828`, de `x = 30` à `x = 936` : passe à son assise, et s'arrête net sur l'arête gauche du cartouche.<br>**Les trois cotes. Elles mesurent des éléments réels de cette page, en pixels, et le visiteur peut vérifier chaque chiffre avec une capture d'écran et une règle.** Toutes trois en 1 px cyan, flèches **triangulaires pleines** de 8 × 5 px, valeur dans une coupure de 56 px.<br>**C1 — horizontale**, `y = 396`, de `x = 60` à l'extrémité de la ligne 1 du titre. Relevé **812** *(mesuré 812,2 — écart 0,2 px)*.<br>**C2 — verticale**, `x = 36`, `y = 108 → 384` : hauteur du bloc de titre. Relevé **276**.<br>**C3 — verticale**, `x = 36`, `y = 480 → 828` : **hauteur du bâti relevé, du faîte au niveau**. Relevé **348**. Ses deux lignes d'attache ne sont pas des traits de service : ce sont les deux lignes de construction, visibles à l'écran. C2 et C3 partagent la même verticale de marge, comme sur une vraie feuille.<br>**La colonne de droite**, `x = 936 → 1380`. `LÉGENDE` à `y = 528`, entrée `01` à `y = 552`, entrée `02` à `y = 600`.<br>**Le cartouche**, `x = 936 → 1380`, `y = 672 → 840` — **444 × 168**. Il **partage l'angle inférieur droit du cadre**. Bandeau de 56 px puis **quatre rangées de 28 px**, filets `--trait 30 %`. Filet vertical à `x = 1080`.<br>**Bande de coordonnées**, hors cadre, `y = 864`.<br>**Rien n'est centré.** Les seules valeurs centrées sont les chiffres de cote sur leur ligne de cote — règle du dessin coté, pas centrage de mise en page. |
| **Formes** | Angles vifs partout, **rayon 0**. Trois épaisseurs de trait et pas une de plus : **1 px** (quadrillage, cadre, cotes, filets du cartouche), **1 px cyan** (cotes et repères), **aplat** (le bouton seul). Les flèches de cote sont des **triangles pleins** de 8 × 5 px, pas des chevrons. Les bulles de repère sont des **carrés** de 20 × 20 px, contour 1 px cyan, chiffre mono 10 px cyan centré — jamais des cercles, un cercle est un rayon. Les lignes de renvoi sont des segments de 1 px à 45° de 48 px, terminés par un **carré plein de 3 px**. Aucune ombre, aucun dégradé, aucun flou, aucun `backdrop-filter`. La profondeur n'existe pas : une feuille est plate. |
| **Traitement photo — LE POINT QUI A FAIT TOMBER LA NOTE À 8,5** | **CE N'EST PLUS UNE PHOTOGRAPHIE DANS UN CADRE.** Le verdict était juste : « une photo couleur ordinaire posée dans un rectangle au milieu d'un dessin. Elle appartient à un autre monde que le reste de l'écran. » Trois gestes, dans cet ordre.<br>**1 · TIRÉE AUX DEUX ENCRES DE LA FEUILLE.** Un duotone SVG (`<filter id="duo">`, `feColorMatrix saturate 0` puis `feComponentTransfer` en table à deux valeurs) renvoie le noir sur **`#0a2540`** et le blanc sur **`#e8eef5`** : l'image n'est plus faite que des deux encres du dessin, il n'y reste **pas un pixel chaud**. `color-interpolation-filters="sRGB"` est **obligatoire** — en linéaire la table s'applique à des valeurs qui ne sont pas celles qu'on a calculées. Chaîne complète : `grayscale(1) contrast(1.7) brightness(0.64) url(#duo)`, et **la luminosité est calée sur le titre, pas sur l'image** : le duotone envoie le blanc sur la couleur EXACTE de `ON DESSINE`, donc à pleine luminosité le parement pèse autant que le titre et les deux se disputent l'écran. Le relevé est une **demi-teinte** ; le titre reste la seule masse pleine. Une seconde déclaration `filter` sans `url()` la précède : si le filtre SVG ne se résout pas, il reste du gris — jamais un pixel chaud.<br>**2 · DÉCOUPÉE SUR LE MODULE — c'est le geste qui règle tout.** Le contour supérieur de l'image est **le relevé du bâtiment, quantifié à 12 px** (`clip-path: polygon()`, 30 sommets, tous multiples de 12). **Au-dessus, il n'y a plus de ciel : il y a la feuille.** L'image n'a donc **aucun cadre** — ni bordure, ni rectangle : son contour EST le dessin. Le même polygone est retracé par-dessus en `polyline` cyan de 1 px, `shape-rendering="crispEdges"`.<br>**LE CONTOUR SE RELÈVE, IL NE SE DESSINE PAS.** Première passe : posé d'après une planche de repères au pas de 120 px sur la source — il **coupait le toit** de la maison existante et laissait **55 px d'arbres** au-dessus de l'égout droit. Seconde passe : la plaque rendue **à sa taille finale, non découpée, sous une réglette de 24 px**, et le sommet du bâti relevé tous les 25 px. Les sommets sont ces relevés **arrondis vers le haut** au module : le contour enveloppe le bâti, il ne l'entame jamais.<br>**3 · LE MODULE LA TRAVERSE.** Le quadrillage de 12 px est redessiné par-dessus le tirage à **34 %** — la plaque est posée à `y = 420` de la feuille, un multiple de 60 : **aucune phase à rattraper.** Voile transparent et non opaque : posé opaque sur une demi-teinte, le trait deviendrait **plus sombre** que l'image, la polarité s'inverserait et on lirait l'image derrière une clôture (mesuré au tour 1 de la passe précédente).<br>**LE CADRAGE EST CALCULÉ, PAS CHOISI.** `object-fit: cover` cadre au plus serré, pas au bâti. Le bâti occupe, dans la source, le rectangle **(265, 215) → (1720, 890)**. Pour que sa hauteur remplisse **exactement** les 348 px, l'échelle vaut `348 / 675 = 0,5156` : l'image est posée à **990 × 557**, décalée de **(−140, −111)**. Le faîte tombe alors sur `y = 0` et l'assise sur `y = 348`, au pixel — **c'est ce qui rend la cote C3 vraie par construction**, et le décalage horizontal fait tomber le mur de l'ossature neuve **sur le filet du cadre**.<br>**Annotations** : deux bulles carrées, `01` à `(24, 156)` dans l'ossature neuve, `02` à `(564, 168)` sur le parement conservé, chacune avec sa ligne de renvoi de 48 px à 45° dont la pointe touche ce que sa légende décrit. **Posées SUR le relevé, jamais sur le papier vide** : une bulle qui flotte à côté du dessin ne désigne rien. **Elles décrivent ; elles ne cotent rien.** Une cote sur une photographie serait une mesure qu'on ne peut pas défendre — les cotes restent sur les éléments de la page, où elles sont vraies par construction. C'est la ligne à ne pas franchir.<br>**Contraste réel des quatre encres posées sur le tirage**, mesuré aux pixels par `tools/pire-pixel.mjs` : `NIVEAU` **6,40** · `FAÎTE` **6,39** · bulle `01` **5,17** · bulle `02` **5,17**. Zéro échec. |
| **Le geste et l'instant de capture** | **Un seul geste : LE TRAIT DE CORDEAU** — la ligne à la craie qu'on claque au sol avant la première coupe. Au chargement, la feuille est déjà entièrement dessinée — quadrillage, cadre, repères, titre, relevé, cartouche, tout. **Seuls les CINQ TRAITS D'INSTRUMENT se tracent**, à détente **linéaire** : un traceur avance à vitesse constante, et ça rend l'instant de capture calculable au pixel. **Une valeur de cote ne s'affiche qu'à 100 %, d'un coup, sans fondu** — le traceur pose la plume et lettre le chiffre.<br>**On capture à `t = 1100 ms`** (`<meta name="adexweb-instant" content="1100">`) :<br>`C1` 700 ms · départ 0 → **FINI**, `812` lettré<br>`C2` 700 ms · départ 150 → **FINI**, `276` lettré<br>`NIVEAU` 900 ms · départ 300 → **88,9 %** — 805 px sur 906<br>`FAÎTE` 800 ms · départ 480 → **77,5 %** — 488 px sur 630<br>`C3` 700 ms · départ 700 → **57,1 %** — 199 px sur 348, chiffre encore éteint<br>**Deux cotes finies et lettrées, trois traits en vol à trois longueurs différentes**, sur une feuille par ailleurs achevée. Un trait qui n'a pas rejoint son attache est une incomplétude *lisible* : l'œil sait qu'il doit joindre les deux bouts. Et **aucun de ces cinq traits ne porte de texte** — donc aucun mot n'est photographié tronqué (piège 70).<br>**LES DEUX LIGNES DE CONSTRUCTION FONT 2 px, ET C'EST LA SEULE ÉPAISSEUR QUI DÉROGE.** Correction de la passe finale : à 1 px, elles pèsent **0,29 px** dans le panneau et le geste n'existe plus (piège 71). Ce sont les seuls traits qu'on voie bouger — et le cordeau, sur un vrai chantier, claque un trait plus large que celui du tire-ligne. À 2 px, la ligne de niveau court sur 805 px : **233 px visibles à 0,29.**<br>Mise en œuvre : `transform: scaleX()` / `scaleY()` avec `transform-origin` du côté du départ, la flèche en enfant translaté au bout. Pas de `width` animée, pas d'opacité sur du texte.<br>**Sous `prefers-reduced-motion` : les cinq traits sont tracés entiers, les trois chiffres allumés, aucune animation. Aucune information perdue, aucune information inversée.** |
| **Comment je tiens la distance avec l'identité d'ADEXWEB** | Le risque est réel et il est nommé : quadrillage, cotes, micro-libellés en monochasse, filets de 1 px — c'est mot pour mot le registre d'ADEXWEB. **Six séparations, dont quatre sont vérifiables par une commande.**<br>**1 · La luminance est inversée et la teinte est froide en masse.** ADEXWEB pose de l'encre sur du ciment, avec un accent chaud. Ici le champ entier est `#0a2540` saturé, et rien n'est chaud : **zéro pixel orange, jaune, vert ou rouge.** Vérifiable par `grep -iE '#e2401f|orange|#f5|amber'` sur le fichier construit → doit rendre 0.<br>**2 · Le cyan ne veut pas dire « cliquable », il veut dire « mesuré ».** La règle d'ADEXWEB est que le minium n'apparaît que là où le visiteur peut agir. Je romps cette grammaire volontairement : **toute cote, toute ligne d'attache, toute flèche, toute bulle est cyan**, et le bouton n'est que le seul *aplat*. Même retenue, sens opposé.<br>**3 · Mes cotes mesurent vraiment quelque chose, et le visiteur peut le vérifier.** C1 = la largeur relevée de la ligne 1 du titre. C2 = 240, la hauteur construite du bloc de titre. C3 = 312, la hauteur construite de la plaque. **Une capture d'écran et une règle suffisent à contrôler les trois.** La règle qui en découle est la seule qui compte dans ce plan : **un chiffre de cote se relève après rendu ; s'il ne peut pas se relever, la cote se supprime.** Les micro-libellés d'ADEXWEB sont une texture ; les miens sont un instrument. C'est la différence entre citer un registre et l'employer.<br>**4 · Aucune trame, aucun `repeating-linear-gradient`, aucune arête qui balaye.** Le geste signature d'ADEXWEB est un bord fait de grains qui traverse ; le mien est une ligne qui pousse d'un bout à l'autre à vitesse constante. **Interdire `repeating-linear-gradient` sur cet écran retire à lui seul la texture la plus reconnaissable d'ADEXWEB.** Vérifiable par `grep`.<br>**5 · Le quadrillage est continu, pas gestuel.** ADEXWEB ne règle jamais tout son champ ; il pose des trames comme arêtes. Ici le quadrillage est un **papier** : 12 px, partout, y compris sous la photo, immobile du début à la fin.<br>**6 · Aucune famille d'ADEXWEB.** `space-grotesk` 700 et `jetbrains-mono` 500, servies depuis `fonts/demos/`. **Zéro requête tierce** : polices locales, image locale, aucun CDN, aucun script externe. |
| **Ce qu'on ne fait pas** | Pas de photographie plein cadre (on écarte Yazdani, RPBW et Storey, mesurés puis rejetés). Pas de centrage (on écarte Barozzi Veiga et Septiembre, mesurés puis rejetés). Pas de carte flottante, pas de rayon, pas d'ombre, pas de dégradé, pas de flou. Pas d'orange, pas de jaune, pas de vert — donc pas le vert acide d'AKT II ni le jaune de Slantis, même si on leur prend la composition. **Aucun prix.** Aucune licence RBQ, aucun NEQ, aucun numéro de permis, aucun chantier nommé, aucun nom de personne, aucun logo, aucun avis, aucune note, aucun témoignage. Pas de compteur qui monte, pas de « X années d'expérience » qu'on ne peut pas soutenir. Pas de bandeau de témoins. **Pas d'indice de défilement — il n'y a rien en dessous, et le prétendre serait un mensonge de plus.** Pas de deuxième photo : un relevé annoté vaut mieux que trois vignettes. **Pas de bande photographique pleine largeur, pas de détection de contour, pas de trame de demi-teinte** — les trois ont été essayées et photographiées, voir « La passe finale ». |

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

### Valeurs de cote — RELEVÉES, pas décrétées

```
C1   812      largeur de « ON DESSINE »          mesuré 812,2 — écart 0,2 px
C2   276      hauteur du bloc de titre           mesuré 276
C3   348      du FAÎTE au NIVEAU, hauteur        mesuré 348,00
              du bâti relevé
```

Relevé par `scratchpad/cd7-verif.mjs`, animations terminées, à
1440 × 900. **Un chiffre de cote se relève après rendu ; s'il ne peut
pas se relever, la cote se supprime.**

### Étiquettes des deux lignes de construction

```
FAÎTE       posée SOUS sa ligne, à l'origine de celle-ci (x = 66, y = 484)
NIVEAU      posée AU-DESSUS de sa ligne, à son origine  (x = 66, y = 812)
```

Les deux sont calées sur l'**origine** de leur trait et non sur son
extrémité : le trait se trace, et une étiquette posée sur un bout qui
n'est pas encore arrivé flotterait toute seule sur l'image arrêtée.
`FAÎTE` passe **sous** sa ligne — au-dessus, elle buterait sur la
deuxième ligne du sous-titre, qui finit à `y = 474`.

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
RÉVISION    C — 2026-08-01
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
dessin cotée** : un quadrillage à trois densités, un cadre en retrait
de 60 px, onze zones numérotées en haut et six lettrées à gauche, deux
lignes de construction qui traversent le dessin et vont mourir dans la
marge, trois cotes fléchées qui mesurent des éléments réels de la page
en pixels, et un cartouche qui partage l'angle inférieur droit du
cadre. Rien n'y est centré et rien n'y flotte.

**Photo.** Et surtout : aucun autre écran n'a de photographie **sans
cadre**. Les onze autres posent leur image dans un rectangle — plein
cadre, en bande, en vignette, en portrait débordant. Ici le rectangle
n'existe pas : le contour de l'image **est le relevé du bâtiment**,
quantifié au module de 12 px, et l'image est tirée aux deux seules
encres de la feuille. C'est la case « dessin au trait / relevé » de la
matrice, prise au mot.

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
