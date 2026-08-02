# COIFFURE — BRUME

Atelier de coupe, de couleur et de soin du cheveu. **Entreprise
fictive**, Québec. Un seul écran, 1440 × 900, arrêté.

Le nom prolonge l'entité fictive déjà posée par `demos-secteurs/DIRECTIONS.md § 05`.
Tout le reste — la grille, l'échelle, le rouge, le folio, le geste —
est neuf et se mesure ci-dessous.

---

## Les trois références

### 1 · ALICE Hair & Art — https://www.alicehairart.se/

Concept Studio, Stockholm. **Awwwards Honorable Mention, 11 février
2025, 7,69/10.** Framer.

**Ce qu'elle prouve.** Un salon peut être primé sans une seule
photographie plein cadre, sans un seul aplat de couleur, sur un blanc
cassé, avec du texte à 14 px et environ 80 % de la page vide. Le vide
n'est pas un manque de contenu : c'est le dispositif. Et il n'y a pas
d'autre affichage que ce 14 px — la page n'a **aucun** titre.

**Les chiffres du relevé** (`tools/_refs/coiffure-alice/`, 1440 px) :

| | |
|---|---|
| Fond | `rgb(245, 245, 245)` — jamais blanc pur |
| `h1` | **aucun** |
| Corps | 14 px / 15,4 px → interlignage **1,10**. `Px Grotesk Regular`, chasse **+1,4 px**, capitales, `rgb(18,18,18)` et `rgb(92,92,92)` |
| Familles | 2 seulement |
| Hauteur de page | 5992 px · 16 images, dont 10 de plus de 380 px |
| Bibliothèques | aucune (Framer seul) |
| Grille du premier écran | origines de colonne mesurées à **x = 8 · 415 · 822 · 1225** — 4 colonnes de 407 px, gouttière de 4 px, collées au bord de la fenêtre |
| Images posées dessus | 407 × 295 à (8, 8) · 203 × 295 à (822, 8) · vidéo 264 × 470 à (1025, 303) · 407 × 295 à (415, 597) |
| Barres fixes | tête à y = 442 et pied à y = 876, items ancrés à x = 8 / 542 / 720 / 1076 — les **mêmes origines** que les images |

**Ce qu'on lui prend.** Le fond presque blanc. Les images posées sur des
origines de colonne strictes, jamais « à peu près ». Le noir et blanc
pour tout ce qui montre le métier. Les libellés minuscules en capitales
espacées comme seule voix secondaire. Et la barre de tête + la barre de
pied qui tiennent la page comme le cadre d'une page imprimée.

**Ce qu'on écarte.** L'absence totale d'affichage — rien ne s'imprime
dans la tête, on ressort sans avoir lu une phrase. La grille collée aux
bords (8 px), qui interdit toute marge de page et donc tout folio. Les
images d'art en couleur saturée qui font exploser la palette dès le
deuxième écran. Et le fond `#f5f5f5`, qui est un gris : nous prenons le
blanc pur.

---

### 2 · Blue Tit London — https://bluetitlondon.com/

Collectif de salons, Londres et Copenhague. Site d'un salon **réel et
primé** (son propre titre : « Award-Winning Salons »).

**Ce qu'elle prouve.** Un salon peut ouvrir **sans titre d'affichage du
tout** : l'énoncé de 28,8 px EST le titre. Et une composition à deux
poids — une grande image carrée à gauche, une colonne de texte à
droite — suffit à porter un premier écran sans aucun effet.

**Les chiffres du relevé** (`tools/_refs/coiffure-bluetit/`, 1440 px) :

| | |
|---|---|
| Fond | `#ffffff` |
| `h1` | **aucun** |
| Énoncé d'accueil | 28,8 px / 37,44 px → interlignage **1,30**. `Ekstra`, colonne de **628 px** à (748, 227). Mots en graisse 700 **dans le fil de la phrase** : « collective of hair stylists », « beautiful hair », « all hair types » |
| Photo de tête | **667 × 667** à (48, 149), rayon **4 px** |
| Cartes | 321 × 321 à (732, 511) et (1074, 511), rayon 4 px |
| Nav | 20,8 px / 31,2 px · « Book appointment » à (1181, 40), 211 px de large |
| Fonds fréquents | `rgb(240,240,240)` ×8 · blanc ×5 · **vert `rgb(140,249,173)` ×3** · noir ×3 · `rgb(79,133,133)` ×3 · `rgb(167,213,255)` · `rgb(205,167,161)` |
| Hauteur de page | 2203 px · 16 images, dont 3 de plus de 380 px |

**Ce qu'on lui prend.** Le blanc pur en fond. L'asymétrie franche
image / texte, sans aucune tentative d'équilibrer les deux masses. Le
bouton de rendez-vous en haut à droite, **seul objet plein et coloré du
premier écran** — c'est ce qui le rend trouvable en un dixième de
seconde. Et la graisse posée sélectivement à l'intérieur d'une phrase
plutôt que sur une ligne entière.

**Ce qu'on écarte.** Les rayons de 4 px. Les surligneurs pastel : quatre
teintes sur le premier écran, on en tient une. Et surtout la photo de
tête — **667 × 667 d'une salle vide**, des fauteuils sans personne, sans
un geste, sans une main. C'est exactement ce que notre direction
interdit, et c'est le plus grand objet de leur page.

---

### 3 · Marco Ambrosi Salon — https://www.marcoambrosi.salon/

Coiffeur, Vérone. **Awwwards Honorable Mention, 2 juin 2021, 7,68/10.**
GSAP, Highway.js.

**Ce qu'elle prouve.** Trois images décalées valent mieux qu'une bande.
Le rythme vient du **décalage vertical**, pas de la couleur. Et le sujet
photographié est le **geste** — des mains dans une chevelure —, pas la
salle.

**Les chiffres du relevé** (`tools/_refs/coiffure-ambrosi/`, 1440 px) :

| | |
|---|---|
| Fond | `rgb(34, 34, 32)` (×10 blocs) |
| `h1` | **70 px / 70 px → interlignage 1,00**. Chasse **−2 px**, graisse 400, `GT Zirkon`, blanc, casse normale, **centré**, deux lignes |
| Corps | 25 px |
| Autres fonds | blanc ×3 · **cuivre `rgb(186,128,94)` ×2** · `rgb(132,132,129)` |
| Images | 20 au total, 4 de plus de 380 px |
| Escalier du premier écran | 437 px de large à (0, 555) · 371 à (473, 509) · 559 à (881, 461) — chaque image commence **plus haut** que la précédente, en marche montante vers la droite |

**Ce qu'on lui prend.** L'interlignage à **1,00 ou moins** sur un grand
titre — c'est ce qui fait une masse et pas des lignes. Le cadrage serré
sur les mains. Et le principe de l'escalier : des objets alignés sur une
grille horizontale mais **jamais sur la même ligne de départ**.

**Ce qu'on écarte.** Le fond sombre — nous allons au blanc pur. Le
centrage symétrique du titre, interdit chez nous. Le cuivre, qui est une
quatrième teinte. Et 70 px : c'est trop petit pour ce qu'on veut faire.
Nous montons à **156 px**, soit 2,2 fois cette échelle.

---

## La direction artistique

| Poste | Décision |
|---|---|
| **Référence culturelle** | La **page de magazine imprimé**, pas la couverture : la double page intérieure d'un mensuel de mode. Image à gauche sur toute la hauteur, texte à droite en colonnes, réglures entre les colonnes, folio dans la marge. Le titre est une **cover line** posée en bas de casse, et il déborde de sa colonne comme un titre d'article qui refuse la justification |
| **Palette** | **Trois valeurs, pas quatre.** `--papier: #ffffff` (blanc pur, fond de page) · `--encre: #0e0e0e` (tout le texte, tous les filets, le noir des photos) · `--cramoisi: #a5122b` (un seul rouge, profond, tirant vers le bleu). **Aucun gris** : la hiérarchie se fait au corps, à la graisse et à la chasse, jamais à la teinte. Contrastes : encre sur papier **19,3 : 1** · cramoisi sur papier **7,7 : 1** · papier sur cramoisi **7,7 : 1** — tout passe AA à 11 px. *(Écart assumé avec `DIRECTIONS.md § 05`, qui posait `#d81e2e` : ce rouge-là ne rend que 5,07 : 1 et n'est pas un cramoisi, c'est un rouge de signalisation.)* |
| **Typographie — affichage** | `bodoni-moda` **700** — la seule graisse disponible dans `fonts/demos/` (`bodoni-moda-0.woff2`, `bodoni-moda-1.woff2`, aucune italique). Titre : **156 px / 131 px** → interlignage **0,84**, chasse **−0,03 em**, **bas de casse**, encre. Masthead : **44 px**, bas de casse, chasse −1,5 px. Lettrine du chapeau : **88 px**, cramoisi |
| **Typographie — texte** | `archivo` 400 et 600 (`archivo-1.woff2`, `archivo-3.woff2`). Chapeau **14 px / 21 px** (1,50). Colonne pratique **13 px / 20 px**. Libellés, nav, légende, folio, pied : **10 et 11 px**, capitales, chasse **+1,4 à +3 px**. **Aucun corps entre 21 px et 156 px** — le saut EST le dispositif |
| **Typographie — piège à ne pas payer** | Les faces découpées ne couvrent que **U+0000–00FF** et **U+2000–206F**. `№` (U+2116) et `→` (U+2192) **ne sont dans aucune plage** : ils retomberaient sur une police système, en pleine page, à côté d'un didone. Le folio s'écrit donc `N° 01` (`°` = U+00B0 ✓) et la flèche du bouton est **dessinée en filets de 1 px**, pas en glyphe. Précharger `bodoni-moda-1.woff2` et `archivo-1.woff2` en `rel="preload" as="font" crossorigin` : un `swap` sur un didone de 156 px change la largeur de la ligne d'une image à l'autre |
| **Composition — la grille** | Marges de page **56 px** à gauche et à droite. Zone de texte **56 → 1384** (1328 px). **Cinq colonnes de 240 px, gouttières de 32 px.** C1 `56–296` · C2 `328–568` · C3 `600–840` · C4 `872–1112` · C5 `1144–1384`. La moitié gauche (C1+C2) est la **page image**, la moitié droite (C3+C4+C5) est la **page texte** |
| **Composition — les réglures** | **Trois** verticales de 1 px encre, chacune avec une raison. **x = 584** : la reliure — court sans interruption de `y=88` à `y=846`, elle sépare l'image du texte. **x = 856** et **x = 1128** : les gouttières de la page texte — courent de `y=88` à `y=846` mais sont **interrompues de `y=548` à `y=824`**, exactement là où le titre les traverse. *Aucune réglure dans la moitié gauche : il n'y a pas de colonnes de texte à séparer.* Deux filets horizontaux de 1 px encre, `x 56 → 1384` : **y=88** et **y=846**. Un **troisième horizontal, cramoisi**, dans la page texte seule : `x 600 → 1384` à **y=423** — c'est lui que la barre du geste épaissit (voir « Le geste et l'instant de capture ») |
| **Composition — bandeau de tête (y 0 → 88)** | `brume` bodoni 700 **44 px**, bas de casse, x=**56**, ligne de base **y=54** · sous lui `SALON DE COIFFURE — QUÉBEC` archivo 600 **10 px**, chasse 2,2 px, x=**56**, base **y=74** · nav archivo 600 **11 px**, chasse 2 px, base **y=52**, un item par origine de colonne : `COUPE` x=**328**, `COULEUR` x=**600**, `SOIN DU CHEVEU` x=**872** · **bouton** : rectangle plein cramoisi **x=1144, y=24, 240 × 44**, angles vifs, libellé blanc archivo 600 11 px à x=**1160** base **y=51**, et une flèche dessinée : filet blanc 1 px de x=1330 à x=1368 à y=46, plus deux traits blancs de 1 px × 7 px en pointe à 45° à x=1362 |
| **Composition — la photographie (C1+C2)** | `images/secteurs-sites/coiffure-11.webp`, source **1000 × 1400**. Cadre **x=56, y=104, 512 × 640** (`object-fit: cover`, `object-position: 50% 45%` — la coupe retire 150 px sur 1400, la lame et les deux mains restent entières). Attributs `width="1000" height="1400"` (dimensions réelles du fichier), taille imposée en CSS, `fetchpriority="high"` : **c'est l'élément LCP**, 327 680 px² contre 212 000 pour le titre. Légende dessous : `FIG. 1 — LA LAME SE FERME SUR LA MÈCHE. ATELIER, QUÉBEC.` archivo 400 **10 px**, chasse 1,4 px, capitales, x=**56**, base **y=770** |
| **Composition — le chapeau (C3+C4)** | Paragraphe coulé **en deux colonnes** de 240 px, gouttière 32 px, de x=**600** à x=**1112** — la réglure x=856 tombe exactement dans la gouttière, ce qui est sa raison d'être. archivo 400 **14 px / 21 px**, quatre lignes par colonne. Bloc **y=124 → 292**. **Lettrine** `B` bodoni 700 **88 px** cramoisi, `initial-letter: 3`, à x=**600** |
| **Composition — la colonne pratique (C5)** | `L'ATELIER` archivo 600 10 px chasse 2,2 px, x=**1144**, base **y=138** · filet 1 px x 1144→1384 à **y=148** · trois lignes archivo 400 **13 px / 20 px**, bases **y=170 · 190 · 210** · `SUR RENDEZ-VOUS` archivo 600 10 px chasse 2 px, base **y=240** |
| **Composition — le titre (y 548 → 824)** | bodoni 700 **156 px / 131 px**, bas de casse, encre, ancré à x=**600** — l'origine de C3, qui fait **240 px**. Ligne 1 `deux doigts,` doit se terminer **entre x=1360 et x=1384** ; ligne 2 `une lame` vers x=**1190**. Le titre déborde donc de sa colonne sur **3,3 colonnes** et traverse **deux réglures**. Bases à **y≈652** et **y≈783**, jambages jusqu'à **y≈820**. *Régler `font-size` autour de 156 px et `letter-spacing` autour de −0,03 em jusqu'à ce que la ligne 1 tombe dans la fenêtre : les métriques réelles de `bodoni-moda` décident, pas l'estimation.* |
| **Composition — le folio** | **Dans la marge gauche**, hors de la zone de texte. `N° 01 — BRUME` archivo 600 **11 px**, chasse **3 px**, capitales, **cramoisi**, `writing-mode: vertical-rl` + `rotate(180deg)` → lecture de bas en haut. Ancré à **x=20**, extrémité basse à **y=744** (le bas exact de la photographie), montant sur environ 124 px jusqu'à y≈620 |
| **Composition — le pied (y 846 → 900)** | `SITE DE DÉMONSTRATION — ENTREPRISE FICTIVE` archivo 400 **10 px** chasse 1,6 px, x=**56**, base **y=872** · `VOL. I — COUPE, COULEUR, SOIN` même style, aligné à droite sur x=**1384**, base **y=872** |
| **Formes** | **Angles vifs partout, rayon 0.** Aucune ombre, aucun dégradé, aucun flou. **Trois** objets pleins sur tout l'écran : la photographie, le rectangle cramoisi du bouton, et la barre cramoisie de 784 × 16 px à y=416. Tout le reste est **du texte et des filets de 1 px**. Le cramoisi apparaît **quatre fois** : le bouton (masse), la barre (le geste — et le troisième objet plein est le prix à payer pour qu'un mouvement survive à la réduction du panneau, piège 57), la lettrine (signature imprimée), le folio (marge) — plus l'arête du masque du titre pendant la course |
| **Traitement photo** | **Noir et blanc à fort contraste, sans exception.** `filter: grayscale(1) contrast(1.28) brightness(0.94)`. La source est déjà un tablier noir mat, des mains claires et une mèche blonde : le traitement écrase le tablier vers le noir et pousse la mèche vers le blanc, on obtient trois valeurs comme la palette. **Aucun visage, aucune enseigne, aucune marque** — vérifié en pleine résolution. *Écartées : `coiffure-10` (un contre-jour brûlé qui part en blanc pur et avale la lame dès qu'on monte le contraste) · `coiffure-12` (une pince orange qui devient une tache grise sans raison, et une oreille reconnaissable) · toute image de salle, de fauteuil ou de bac* |
| **Le geste et l'instant de capture** | **Instant de capture : t = 1500 ms**, et le titre s'y photographie **FINI**. *Corrigé le 2026-08-01 : la capture était prise à 280 ms, masque de titre à mi-course, et rendait « deux doigt » et « une » — deux mots coupés net. Un masque figé à mi-course sur du TEXTE ne se lit pas comme un mouvement mais comme une page cassée (piège 56). Le mécanisme reste dans la page, il n'est simplement plus ce qu'on photographie.* **CE QU'ON PHOTOGRAPHIE EN MOUVEMENT : LA BARRE.** Un filet cramoisi de 1 px traverse la page texte de **x=600 à x=1384** à **y=424** — la médiane horizontale de la photographie (104 → 744), portée par-dessus la reliure. Ce filet s'épaissit en une **barre pleine de 784 × 16 px** qui se tire de gauche à droite : le même objet à deux poids, *la réglure de la page en train d'être tirée*. `transform: scaleX(0 → 1)`, origine `0 50%`, **2000 ms**, **retard 500 ms**, `cubic-bezier(.65, 0, .35, 1)`. **La courbe est symétrique — elle passe par (0,5 ; 0,5) — donc à la moitié de sa durée la barre est tirée à la moitié exacte : 500 + 1000 = 1500 ms, l'instant déclaré. Rien à régler, rien à mesurer.** Sur l'image arrêtée : **392 × 16 px de cramoisi plein**, bord d'attaque à **x=992**, entre les deux réglures verticales — il en a avalé une, n'a pas atteint l'autre, et le filet de 1 px montre le chemin qui reste. **Réduit à 0,29 : 114 × 4,7 px** (piège 57 : au moins 12 px dans la plus petite dimension, au moins 40 px de déplacement — ici 16 px et 392 px). La barre occupe le champ blanc de C3–C5 sans le remplir, à la hauteur du milieu de la photographie. **LE TITRE GARDE SON MASQUE**, inchangé : `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)`, **1100 ms**, `cubic-bezier(.19, 1, .22, 1)`, ligne 2 retardée de **180 ms**, arête cramoisie de 1 px sur le bord du découpage. Il est fini à 1280 ms, donc entier à 1500. Le masque est un `clip-path`, jamais une opacité : ce qui est découvert est noir plein. `prefers-reduced-motion: reduce` → aucune animation, les deux lignes entières, aucune arête, **la barre tirée jusqu'au bout**, aucune information perdue |
| **Ce qu'on ne fait pas** | Aucun rose, aucun doré, aucun orange, aucun gris. Aucune courbe, aucun rayon, aucune ombre. **Aucune photographie plein cadre, aucun fond de couleur, aucun centrage symétrique** — pas même le libellé à l'intérieur du bouton. Aucune salle, aucun fauteuil, aucun miroir, aucun visage. Aucun prix, aucune note, aucun avis, aucun nom réel. Aucun `№`, aucun `→`. Aucune requête tierce : polices `../../fonts/demos/`, image `../../images/secteurs-sites/`. Et **rien en dessous de l'écran** : la page fait 900 px et s'arrête |

---

## Le contenu exact

**Nom de l'entreprise (fictive)** — `Brume`
**Métier** — atelier de coupe, de couleur et de soin du cheveu, Québec

**Masthead** (bodoni 700, 44 px, bas de casse, x=56)
```
brume
```

**Ligne d'identité** (archivo 600, 10 px, capitales, x=56)
```
SALON DE COIFFURE — QUÉBEC
```

**Navigation** (archivo 600, 11 px, capitales — un item par origine de colonne)
```
COUPE
COULEUR
SOIN DU CHEVEU
```

**Bouton** (blanc sur cramoisi, x=1144)
```
PRENDRE RENDEZ-VOUS
```

**Titre du héros** (bodoni 700, 156 px, bas de casse, deux lignes, x=600)
```
deux doigts,
une lame
```

**Chapeau** (archivo 400, 14 px / 21 px, coulé en deux colonnes, lettrine `B` cramoisie)
```
Brume est un atelier de coupe, de couleur et de soin du cheveu, à
Québec. On y travaille à la lame et au peigne, sur rendez-vous, un
client à la fois. Chaque coupe part de la matière : sa densité, son
épi, la façon dont elle retombe une fois sèche.
```

**Légende de la photographie** (archivo 400, 10 px, capitales, x=56)
```
FIG. 1 — LA LAME SE FERME SUR LA MÈCHE. ATELIER, QUÉBEC.
```

**Colonne pratique** (C5, x=1144)
```
L'ATELIER

Adresse sur demande
000 000-0000
courriel@exemple.ca

SUR RENDEZ-VOUS
```

**Folio** (cramoisi, vertical, marge gauche, lecture de bas en haut)
```
N° 01 — BRUME
```

**Pied de page** (archivo 400, 10 px, capitales)
```
SITE DE DÉMONSTRATION — ENTREPRISE FICTIVE
VOL. I — COUPE, COULEUR, SOIN
```

**Balise de titre et robots**
```
<title>Brume · coupe, couleur et soin du cheveu, Québec</title>
<meta name="robots" content="noindex,nofollow">
```

**Texte alternatif de la photographie**
```
Deux mains tiennent une mèche claire ; la lame d'un ciseau se ferme
dessus, devant un tablier noir. Noir et blanc.
```

---

## Ce qui me distingue des onze autres

**Composition.** Je suis le seul à poser une **grille de cinq colonnes
de 240 px avec des réglures verticales de 1 px** et une moitié de page
entièrement muette : l'image occupe C1+C2 du haut en bas, le texte
n'existe que dans C3, C4 et C5. Le titre est ancré sur une colonne de
240 px et en occupe 784 — il **déborde de trois colonnes et traverse
deux réglures**, ce qu'aucune composition centrée ni aucun héros plein
cadre ne peut faire.

**Couleur.** Trois valeurs et pas une de plus : blanc pur `#ffffff`,
encre `#0e0e0e`, cramoisi `#a5122b`. **Pas de gris**, donc aucune teinte
molle nulle part, et un seul rouge qui n'apparaît qu'à quatre endroits —
le bouton, la barre du geste, la lettrine, le folio. Les photographies sont en noir et
blanc à fort contraste, ce qui garde la page à trois valeurs même là où
il y a une image.

**Typographie.** Un didone en **bas de casse à 156 px** contre un
grotesque à 10 px : un rapport de **1 à 15,6**, sans aucun corps
intermédiaire entre 21 px et 156 px. Bas de casse, jamais capitales —
c'est ce qui sépare une page de mode d'une affiche, et c'est l'inverse
de ce que fait un didone de luxe habituel.
