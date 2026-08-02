# HÉBERGEMENT — Auberge de l'Anse-à-Givre

Un seul écran, **1440 × 900**, arrêté. Une photographie de paysage plein
cadre, et le plus gros caractère de l'écran mesure **21 px**. C'est tout
le parti : le visiteur regarde un lieu, pas une page.

---

## Les trois références

Sept relevés ont été pris ou relus. Trois sont retenus. Les autres —
`hotel-tengile` (titre de 120 px en travers de la photo : exactement
l'inverse de la voie), `hotel-svart` (le bleu arctique juste, mais un
site Wix sans métier), `hotel-arcticbath`, `hotel-juvet` (deux
grotesques lourdes, mauvais registre) — sont dans `tools/_refs/` et ne
servent qu'à borner ce qu'on écarte.

### 1 · Nimmo Bay Resort — https://www.nimmobay.com

*Relevé relancé le 2026-08-01 → `tools/_refs/hotel-nimmo/`*

**Les chiffres.** `h1` : **48 px**, interlignage 57,6 px, **chasse
+4 px**, graisse 300, capitales, blanc. Une seule famille sur toute la
page : `Roboto`. Premier écran : une section de **900 px** de haut, fond
`rgba(0,0,0,0)` — la photographie *est* le fond, il n'y a aucun aplat
dessous. Page de 10 785 px, 30 images dont 14 au-delà de 380 px. Aucune
bibliothèque d'animation détectée. Relevé à l'image : le mot-marque
visible a une hauteur de capitale de 50 px (y 434 → 484), soit ≈ 70 px
de fonte ; les deux micro-libellés « WILDNESS » / « WITHIN » font ≈ 15 px
avec ≈ 6 px de chasse.

**Ce qu'elle prouve.** Qu'un nom et deux mots suffisent à tenir un écran
entier, à condition que la photographie porte tout. Le premier écran ne
dit pas ce que l'entreprise fait — il montre où elle est. Message en
trois secondes : *une maison de bois, seule, dans une forêt mouillée.*
L'œil va au pignon, puis descend au nom.

**Ce qu'on lui prend.** La discipline des capitales espacées comme seule
voix d'affichage. Et le décalage des deux micro-libellés l'un par
rapport à l'autre, qui empêche le bloc de texte de devenir un logo.

**Ce qu'on écarte.** La photographie chaude — cèdre blond, toit rouge —
qui est la couleur même que la voie interdit. Les deux boutons encadrés
à angles vifs en haut à droite. Le bandeau promotionnel vert qui mange
46 px du haut de la fenêtre. Et surtout : le nom est posé **par-dessus
le bâtiment**, donc illisible sur sa moitié gauche. Notre texte se pose
sur du vide, jamais sur le sujet.

### 2 · NILS am See — https://www.nilsamsee.at/en

*Relevé neuf, 2026-08-01 → `tools/_refs/hotel-nils/`*

**Les chiffres.** **Attention au relevé : le `h1` mesuré fait 9 px.**
C'est un `h1` de référencement, masqué (`Italiana`, capitales, chasse
2 px, `#153149` sur `#f7f6f0`) — le mot-marque visible n'est pas un
`h1`. Le « corps 9 px » a la même cause. Aucune conclusion ne se tire de
ces deux chiffres. Ce qui se tient : **deux familles seulement**, `Jost`
et `Italiana` ; page de 24 239 px, 69 images dont 28 au-delà de 380 px ;
aucune bibliothèque d'animation. À l'image : la barre de réservation
blanche flottante mesure ≈ 550 × 62 px, centrée, bas de fenêtre, rayon
en stade.

**Ce qu'elle prouve.** Qu'un **objet à coins ronds qui flotte** sur la
photographie ne la détruit pas — il la cadre. Et que « AM SEE », un
sous-titre en capitales minuscules très espacées glissé sous le
mot-marque, tient mieux qu'une baseline écrite en phrase.

**Ce qu'on lui prend.** Le cartouche qui **flotte**, avec de l'air entre
lui et les bords, au lieu d'être soudé au bas de la fenêtre. La seconde
voix en capitales espacées. Et le numéro de téléphone en micro-libellé
en haut à gauche — c'est là qu'on logera nos coordonnées neutres.

**Ce qu'on écarte.** Toute la palette : claire, chaude, `#f7f6f0` sur
`#153149` et `#81a1bc`. Le rayon en stade (999 px) de la barre et les
deux boutons circulaires. La photographie d'intérieur — c'est une
chambre, pas un paysage. Et le mot-marque centré en haut, qui est
exactement le geste que tout le monde fait.

### 3 · Eleven Experience — https://www.elevenexperience.com

*Relevé relancé le 2026-08-01 → `tools/_refs/hotel-eleven/`*

**Les chiffres.** `h1` : **56 px**, **interlignage 56 px (soit 1,0)**,
chasse normale, graisse 300, famille `Larken`, blanc, posé sur la
photographie. Corps 16 px. Premier écran : section de **900 px**, fond
transparent. Fonds fréquents : `#232323` (52 nœuds),
`rgba(255,255,255,.08)` (25), puis **`#0e1b16` (vert-noir)** et
**`#16242e` (bleu-noir)**. Page de 7 737 px, **113 images dont 49
au-delà de 380 px** — 6,3 grandes images par millier de pixels.
`Lenis` détecté : le défilement est piloté.

**Ce qu'elle prouve.** Que le registre du métier — pavillon d'aventure
en pays froid — se joue en **noirs colorés**, jamais en gris neutre. Et
qu'un interlignage de 1,0 transforme une phrase de 56 px en objet
plutôt qu'en paragraphe.

**Ce qu'on lui prend.** Les deux noirs `#0e1b16` et `#16242e` : c'est la
preuve chiffrée que notre sapin `#0b1712` et notre voile froid `#122c3a`
sont le bon voisinage, pas une invention. Et la nav en capitales de
12–13 px très espacées, alignée en haut.

**Ce qu'on écarte.** La phrase centrée en serif lyrique : encore trop
grosse, et elle a le ton d'une citation. Les trois boutons ronds de
lecture vidéo en bas à droite. Le bouton `BOOK NOW` en aplat crème à
angles vifs — c'est le point le plus clair de l'écran, il attrape l'œil
**avant** le paysage, ce qui annule le dispositif.

---

## La direction artistique

| Poste | Décision |
|---|---|
| **Référence culturelle** | Une **plaque de laiton gravée, vissée sur la rambarde d'un belvédère**. On lit le paysage d'abord ; la plaque ensuite, en s'approchant. Rien sur cet écran ne cherche à être vu de loin sauf la photographie |
| **Palette** | **sapin profond `#0b1712`** — le seul aplat de l'écran (cartouche, et couleur de `<html>` sous la photo) · **os `#e8e0cd`** — tout le texte, sans exception · **laiton `#a98b4f`** — le filet, la bordure du cartouche, l'aplat du bouton · **voile froid `#122c3a`** posé à 26 % sur la photographie · **givre `#5a6064`** — ce que la neige *devient* après traitement (mesuré, pas choisi) · noir du dégradé `rgb(9,18,15)`. **Aucun orange, aucun rouge, nulle part** |
| **Typographie** | **`cormorant` 600, capitales uniquement, toujours espacé** — 21 px / interlignage 1,0 / chasse **0,44 em** (la marque) · 17 px / 0,20 em (le fait du cartouche) · 14 px / 0,26 em (la nav) · 13 px / 0,28 em (le bouton). **`spectral` 400 italique** — 16 px / interlignage 1,55 (les deux lignes de promesse). **`jetbrains-mono` 500** — 11 px / 0,22 em et 0,16 em, 10 px / 0,22 em et 0,14 em (les micro-libellés). **Le plus gros caractère de l'écran fait 21 px.** Aucune fonte en bas de casse sauf `spectral`. Quatre fichiers : `cormorant-2/3`, `spectral-0/1`, `jetbrains-mono-0/1` — servis depuis `../../fonts/demos/`, SIL OFL 1.1 |
| **Composition du premier écran** | Voir le tableau au pixel ci-dessous |
| **Formes** | **Deux rayons, et rien d'autre : 24 px** sur le cartouche (288 × 116), **20 px** sur le bouton (236 × 52) — le petit objet prend le plus petit rayon, c'est la règle. Le bouton fait 52 px de haut pour un rayon de 20 : il reste **12 px de segment droit** de chaque côté, donc ce n'est pas un stade. **Filets de laiton de 1 px** : le filet vertical, et la bordure du cartouche à `rgba(169,139,79,.55)`. **Aucune ombre portée** — la profondeur vient de la photographie, qui en a trois plans. **Aucun flou, aucun `backdrop-filter`** : le cartouche se remplit à `rgba(11,23,18,.88)`, un aplat franc, et c'est ce qui lui donne ses 13,95:1 |
| **Traitement photo** | Sur le `<img>` : **`filter: saturate(.34) contrast(1.12) brightness(.60)`**. Par-dessus, une nappe plate **`rgba(18,44,58,.26)`** sur toute la surface. Mesuré après traitement : la neige passe de `#d0d3d7` (Y = 0,649) à **`#5a6064`** (Y = 0,115) — bleu > vert > rouge, donc **la neige est bleue** ; la façade de bois passe de chaude à **`#212528`, froide elle aussi** (b > r), il ne reste aucun ambre ; le mur d'épinettes tombe à `#161c20`. Deux autres réglages ont été mesurés et écartés : `brightness(.66)` laisse le sapin flou du coin bas-gauche **repasser au chaud**, et `brightness(.56) + voile .30` monte la saturation des noirs à 41 % — un virage chimique. **Le dégradé du bas** : `linear-gradient(180deg, rgba(9,18,15,0) 0, rgba(9,18,15,.22) 20%, rgba(9,18,15,.55) 42%, rgba(9,18,15,.82) 62%, rgba(9,18,15,.94) 84%, rgba(9,18,15,.97) 100%)`, posé de **y = 400 à y = 900**. **Aucun voile en haut** : le tiers supérieur est du mur d'épinettes traité à Y = 0,011, la nav y mesure déjà 13,22:1 sans rien ajouter. La photographie est intacte de y = 0 à y = 400 |
| **Le geste et l'instant de capture** | **« LE RELEVÉ »** — un seul geste, et c'est le filet vertical de laiton qui **se remplit du bas vers le haut**, comme une jauge de marée. `@keyframes releve { from{transform:scaleY(0)} to{transform:scaleY(1)} }` sur le `::after` du filet, `transform-origin: 50% 100%`, **`animation: releve 1800ms linear 400ms forwards`**. **Linéaire, et c'est délibéré** : une sortie en ease-out ferait bouger la fraction capturée de 20 points pour 40 ms d'écart, un remplissage linéaire ne la bouge que de 2,2 points. **Capture à t = 1500 ms après `load`** : le filet est rempli à **61 %** — **252 px de laiton** de y = 848 jusqu'à **y = 596**, et 160 px de ligne fantôme (os à 16 %) au-dessus. Un trait à moitié rempli ne se lit pas comme un bogue, il se lit comme un mouvement pris en vol. **Preuve du geste** : cinq captures à 400 / 675 / 950 / 1225 / 1500 ms ; la longueur du laiton doit croître de **63 px exactement** entre deux consécutives (0 → 63 → 126 → 189 → 252). Si deux images se ressemblent, l'outil ment. Sous `prefers-reduced-motion: reduce`, le filet est à 100 % dès le premier rendu — il ne porte aucune information, c'est le seul objet de l'écran qu'on ait le droit d'animer |
| **Ce qu'on ne fait pas** | Pas de titre géant — plafond dur à **21 px**. Pas de partage gauche/droite, pas de colonne de magazine, pas d'aplat de couleur pleine (le cartouche fait 288 × 116, soit 2,6 % de la surface). Pas de flou, pas d'ombre, pas de rayon en stade. **Aucun prix, aucun « à partir de »**, aucune note, aucun avis, aucun témoignage, aucun logo. Pas de champ de réservation avec dates saisissables — la DA du secteur l'interdit et le cartouche dit la météo, pas la disponibilité. **Pas de parallaxe, pas de Ken Burns, pas de vidéo, pas de second geste** : quarante mouvements s'annulent. Aucune requête tierce. Et jamais de laiton sur du texte posé à même la photographie — il tombe à **3,88:1** à hauteur du surtitre ; le laiton n'y est qu'un trait |

### La composition, au pixel — fenêtre 1440 × 900

**La photographie retenue : `images/secteurs-sites/hotel-1.webp`, 1920 × 1080.**
Légende vraie : l'auberge de bois devant l'anse gelée, un panache de
fumée à la cheminée, le mur d'épinettes derrière.

*Pourquoi elle tient à 1440 × 900.* Le recouvrement est piloté par la
hauteur : 1080 → 900 est une réduction de 0,833, la largeur affichée
devient 1600 px et **80 px sont rognés de chaque côté**. Donc
**aucun agrandissement** — chaque pixel affiché vient d'un pixel source
réduit, jamais étiré. On ne perd que les bords : la branche floue de
droite est coupée à partir de x = 1824 (source), la paroi rocheuse du
coin haut-droit perd 96 px. Le sujet — l'auberge, source x 620 → 1400 —
se retrouve entier à l'écran entre **x = 437 et x = 1087**, légèrement à
gauche du centre. Et surtout : **le bas de l'image est vide.** À partir
de la source y = 660, c'est le lac gelé, un champ sans détail sur 40 %
de la hauteur. C'est là que le texte se pose.

*Pourquoi pas `hotel-9.webp`* (brume sur le lac gelé, 1920 × 1080, l'autre
paysage large du lot) : elle est plate, sans sujet, et elle porte **un
feu arrière rouge** à x ≈ 1370 — la seule tache chaude du lot, interdite
par la voie. *Pourquoi pas `hotel-2.webp`* : magnifique et déjà bleue,
mais son tiers bas est traversé de troncs — il n'y a nulle part où
poser un texte de 21 px, et on y distingue des silhouettes de personnes.

| # | Objet | x | y | largeur × hauteur | Détail |
|---|---|---|---|---|---|
| 1 | Photographie `hotel-1.webp` | −80 | 0 | 1600 × 900 | `object-fit: cover`, `object-position: 50% 50%`, `width="1920" height="1080"` dans le balisage (CLS 0), `fetchpriority="high"`, `decoding="sync"`, **jamais `lazy`** |
| 2 | Nappe froide `rgba(18,44,58,.26)` | 0 | 0 | 1440 × 900 | plate, sans mélange de fusion |
| 3 | Dégradé du bas | 0 | 400 | 1440 × 500 | six arrêts, voir la DA |
| 4 | Téléphone `000 000-0000` | 72 | 48 | 100 × 14 | mono 11 px / 0,16 em, os 100 % — **13,35:1** |
| 5 | Filet séparateur vertical | 186 | 51 | 1 × 10 | laiton `rgba(169,139,79,.55)` |
| 6 | `SITE DE DÉMONSTRATION` | 200 | 48 | 172 × 13 | mono 10 px / 0,22 em, **os à 62 %** — 5,84:1. Mention obligatoire, lisible sans crier |
| 7 | Nav, 4 items, écart 36 px | 780 | 48 | 588 × 17 | cormorant 600, 14 px / 0,26 em, os 100 % — **13,22:1**. Largeurs mesurées : 103 / 144 / 91 / 142. Le dernier item porte `margin-right:-0.26em` pour que l'encre s'aligne sur 1368, pas la chasse morte |
| 8 | **Le filet de laiton — le geste** | 72 | 436 | 1 × 412 | au repos : `rgba(232,224,205,.16)`. Rempli : `#a98b4f`, depuis le bas. **4,94:1** contre son fond sur toute sa course (le seuil des non-textes est 3:1) |
| 9 | Surtitre `HAUTE-CÔTE-NORD, QUÉBEC` | 112 | 638 | 207 × 14 | mono 11 px / 0,22 em, **os à 76 %** — 6,25:1. *En os, pas en laiton : le laiton tombe à 3,88:1 ici* |
| 10 | **La marque** | 112 | 673 | **516 × 25** | cormorant 600, **21 px**, interlignage 1,0, **chasse 0,44 em**, os 100 % — **11,16:1**. Se termine à x = 628 |
| 11 | Promesse, ligne 1 | 112 | 714 | 350 × 24 | spectral italique 16 px, os à 76 % — **8,00:1** |
| 12 | Promesse, ligne 2 | 112 | 742 | 311 × 24 | idem |
| 13 | Bouton `LES DATES LIBRES` | 112 | 796 | **236 × 52** | **rayon 20 px**, aplat laiton `#a98b4f`, texte sapin `#0b1712` cormorant 600 13 px / 0,28 em (encre 166 px, marge intérieure 35 px). **5,67:1**. Le seul objet saturé de l'écran : 12 272 px sur 1 296 000, soit **0,95 %** |
| 14 | Cartouche « conditions » | 1080 | 732 | **288 × 116** | **rayon 24 px**, remplissage `rgba(11,23,18,.88)` — composite mesuré **`#0b1712`** — bordure 1 px `rgba(169,139,79,.55)`, marge intérieure **26 px sur les côtés, 22 px en haut, 23 px en bas** (22 + 13 + 12 + 21 + 12 + 13 + 23 = 116). os dessus : **13,95:1** |
| 14a | ↳ `CE MATIN À L'ANSE` | 1106 | 754 | 139 × 13 | mono 10 px / 0,22 em, **laiton `#a98b4f` — 5,67:1**, seul endroit où le laiton porte du texte : il est sur un aplat |
| 14b | ↳ `−21 °C · ANSE PRISE` | 1106 | 779 | 208 × 21 | cormorant 600 17 px / 0,20 em, os 100 % |
| 14c | ↳ `LEVER 7 H 12 — COUCHER 16 H 04` | 1106 | 812 | 222 × 13 | mono 10 px / 0,14 em, **os à 58 %** — 5,37:1 |

**Les marges, et elles sont volontairement inégales :** 72 px à gauche
et à droite, 48 px en haut, 52 px en bas. Le texte est renfoncé à
x = 112 — 40 px de plus que le filet — pour que le filet lise comme un
objet posé dans la marge et non comme un soulignement.

**Tout le rectangle x 0→1440 · y 0→400 est de la photographie pure.**
Rien n'y est posé. C'est 44 % de l'écran, et c'est le dispositif.

### Ce qui a été mesuré, et comment le refaire

Toutes les valeurs de contraste ci-dessus sont **des composites réels**,
pas des estimations : la photographie a été chargée dans un `canvas` à
1440 × 900 avec le recouvrement exact, le filtre appliqué par
`ctx.filter`, la nappe et le dégradé peints par-dessus, puis la moyenne
RVB relevée sur le rectangle exact de chaque bloc de texte. Les largeurs
de texte sont mesurées avec **les vraies fontes chargées**
(`document.fonts.ready`, puis `getBoundingClientRect`), pas estimées à
la chasse moyenne. Deux écueils ont été payés en route et sont réglés
dans le tableau : le surtitre en laiton (3,88:1, refusé) et le premier
échantillon de « bois » qui tombait sur la toiture et non sur la façade.

À vérifier après la construction, dans cet ordre : contraste réel sur la
page rendue aux 14 blocs · aucun débordement de 320 à 1920 px · zéro
erreur console · zéro requête tierce · la planche des cinq instants du
geste (63 px d'écart entre deux images) · et **l'écran ouvert et
regardé**, pas seulement sondé.

---

## Le contenu exact

**Nom fictif :** Auberge de l'Anse-à-Givre
*(toponyme inventé sur le patron québécois — Anse-à-Beaufils,
Anse-au-Griffon. « Givre » n'existe pas comme anse au Québec.)*

**`<title>`**
```
Auberge de l'Anse-à-Givre — Haute-Côte-Nord
```

**`<meta name="description">`**
```
Auberge devant une anse gelée de la Haute-Côte-Nord. Site de démonstration.
```

**`<meta name="robots">`** → `noindex,nofollow`
**`<meta name="theme-color">`** → `#0b1712`

**Haut à gauche** *(mono 11 px, puis filet, puis mono 10 px à 62 %)*
```
000 000-0000
SITE DE DÉMONSTRATION
```

**Nav, haut à droite** *(cormorant 600 caps, 14 px, chasse 0,26 em ;
écart de 36 px ; `NOUS JOINDRE` est un `mailto:courriel@exemple.ca`, les
trois autres pointent `#`)*
```
L'AUBERGE
LES CHAMBRES
LA TABLE
NOUS JOINDRE
```

**Surtitre** *(mono 11 px, chasse 0,22 em, os 76 %)*
```
HAUTE-CÔTE-NORD, QUÉBEC
```

**Le titre du héros, mot pour mot** *(cormorant 600, 21 px, chasse
0,44 em, capitales — apostrophe typographique U+2019)*
```
AUBERGE DE L'ANSE-À-GIVRE
```

**Le sous-titre, deux lignes** *(spectral 400 italique, 16 px,
interlignage 1,55, os 76 %)*
```
Vingt-deux chambres devant l'anse qui prend en glace.
Une seule tablée le soir, à dix-huit heures trente.
```
*Vingt-deux, et pas sept : la toiture de la photographie porte une
quinzaine de lucarnes. Un chiffre qui contredit l'image est une
fausseté, même dans une fiction.*

**Le libellé du bouton** *(cormorant 600, 13 px, chasse 0,28 em)*
```
LES DATES LIBRES
```
*Ni « Réserver », ni « À partir de ». On promet une liste de dates —
c'est tenable, et ça ne parle pas d'argent.*

**Le cartouche, trois lignes**
```
CE MATIN À L'ANSE
−21 °C · ANSE PRISE
LEVER 7 H 12 — COUCHER 16 H 04
```
*« Anse prise » : l'anse a gelé d'un bord à l'autre. C'est exactement ce
que la photographie montre. Le signe moins est U+2212, pas un trait
d'union.*

**Texte de remplacement de la photographie**
```
L'auberge de bois devant l'anse gelée, un panache de fumée à la
cheminée, le mur d'épinettes derrière.
```

**Les coordonnées, et il n'y en a pas d'autres.** Téléphone
`000 000-0000`, visible en haut à gauche. Courriel
`courriel@exemple.ca`, derrière `NOUS JOINDRE`. Adresse : « Adresse sur
demande » — elle n'apparaît **nulle part** sur cet écran, et si une
construction en réclame une, c'est cette chaîne-là et aucune autre.

---

## Ce qui me distingue des onze autres

**Composition.** Je suis le seul écran où la photographie occupe 100 %
de la surface et où **le plus gros caractère mesure 21 px** — 44 % de
l'écran ne porte strictement rien. Le Gym est un mur de lettres de
180 px sans image ; la Coiffure est en colonnes de magazine ;
l'Immobilier présente une propriété comme un lot de catalogue. Chez moi
le texte n'est pas le sujet, il est la plaque vissée à côté du sujet.

**Couleur.** Je suis le seul écran **sans aucun fond** : il n'y a pas
d'aplat de page, il y a une photographie virée au froid dont la neige
mesure `#5a6064`, un bleu-gris — pas du blanc. Le laiton `#a98b4f` est
la seule couleur saturée et il occupe **0,95 %** des pixels. Les deux
autres sombres froids du lot s'en écartent par la matière : l'Immobilier
est nuit + or sur de la photographie de propriété, la Construction est
bleu de plan + cyan sur du quadrillage.

**Typographie.** `cormorant` 600 n'apparaît nulle part ailleurs, et
ici il ne s'écrit **jamais** autrement qu'en capitales espacées de 0,20
à 0,44 em, jamais en bas de casse, jamais sous 13 px ni au-dessus de
21 px. La seule minuscule de l'écran est une italique `spectral` de
16 px sur deux lignes. Le saut entre l'affichage et le texte courant
vaut ici **1,3** (21 px contre 16 px) ; le standard des sites de secteur
demande 90 à 160 px d'affichage contre 14 à 16 px de texte, soit un
saut de **6 à 11**. C'est le même métier, la même grammaire, et le
rapport inverse.
