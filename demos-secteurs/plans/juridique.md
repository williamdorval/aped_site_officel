# JURIDIQUE — Cabinet Vallières

*Un seul écran, 1440 × 900, arrêté. Rien en dessous, rien à défiler.
C'est une **une de quotidien**, imprimée sur papier rosé de presse.*

> **Le nom est repris de `DIRECTIONS.md § 10`, à dessein.** Le dépôt a
> déjà un cabinet fictif québécois pour ce métier ; en inventer un
> second pour le même secteur fragmenterait la fiction. Cabinet
> Vallières est inventé, québécois, crédible — et il reste fictif.

---

## Les trois références

### 1 · Harvard Law Review — `https://harvardlawreview.org/`

**Ce qu'elle prouve.** Un site juridique de premier rang peut ne porter
**aucune photographie** et tenir uniquement sur trois choses : du papier
chaud, une antique de texte, et un rouge sombre réservé aux rubriques.
Le relevé le dit sans ambiguïté : **0 image de plus de 380 px sur
10 353 px de page**, et **aucune bibliothèque d'animation** — ni GSAP,
ni Lenis, ni `animation-timeline`. Le sérieux est fait de mise en page,
pas d'effets. C'est exactement la thèse de notre voie.

**Ce qu'on lui prend.**
- Le **surtitre de rubrique en petites capitales rouge sombre** posé
  au-dessus de chaque titre (« CONSTITUTIONAL LAW ✦ SYMPOSIUM »). Chez
  nous il devient le surtitre mono bordeaux au-dessus de la manchette et
  en tête de chaque colonne.
- Le **bandeau de tomaison** en tête de page — « Volume 139 · Issue 8 ·
  June 2026 ». C'est la preuve qu'un bandeau de date en haut d'un site
  d'avocats ne fait pas costume : il fait publication. Chez nous c'est le
  bandeau de date plein bordeaux.
- Le couple **papier chaud + crimson** : `#FCFBF9` et `#781313`.

**Ce qu'on écarte.**
- **Tout est centré** sur une colonne unique d'environ 840 px posée sur
  un fond ornementé. C'est une revue reliée, pas une une. On refuse le
  centrage en bloc.
- Le liseré à motif imprimé derrière la colonne — un ornement figuratif
  qui n'appartient pas à la presse quotidienne.
- L'interlignage du `h1` : **1,20**. Mou pour une manchette. On descend
  à **0,94**.

**Les chiffres du relevé** (`tools/_refs/juridique-hlr/releve.json`) :
`h1` 60 px / **72 px (1,20)**, `bennet-text-three` graisse 600, couleur
`rgb(30,30,30)` · corps 20 px, même famille · fonds dominants
`rgb(252,251,249)` = `#FCFBF9` (15 occ.), `rgb(246,243,239)` = `#F6F3EF`
(8), blanc (8), **`rgb(120,19,19)` = `#781313` (3)** · trois familles
(`bennet-text-three`, `capitana`, `playfair-display`) · hauteur de page
10 353 px · **1 image, 0 grande** · **aucune** bibliothèque d'animation.

---

### 2 · Air Mail — `https://airmail.news/`

**Ce qu'elle prouve.** Que la une de quotidien **fonctionne encore, à
1440 px, en 2026** — et qu'elle n'a pas besoin d'être un pastiche. Le
premier écran est littéralement notre composition imposée : une
manchette qui court sur la largeur de trois colonnes, deux colonnes de
brèves dessous séparées par une **réglure verticale de 1 px**, une
**oreille datée** dans le coin haut-droit (« LATEST ISSUE • AUGUST 1,
2026 »), un chapeau sous le titre, des surtitres de rubrique en
capitales colorées, et une seule photographie cantonnée à la colonne de
droite. Fond `#FAF6F0` : papier chaud, jamais blanc.

**Ce qu'on lui prend.**
- La **réglure verticale de 1 px entre deux colonnes de brèves** — le
  filet fait le travail que ferait une carte, sans carte.
- L'**oreille datée dans le coin haut-droit**, isolée par un filet et
  rien d'autre.
- Le **surtitre de rubrique** au-dessus de chaque titre secondaire
  (« THE ROYAL FAMILY », « THE PLANET ») — chez nous, les titres de
  colonne en mono bordeaux.
- La photographie **unique et cantonnée** : une seule image sur tout le
  premier écran, dans une colonne, jamais en fond.

**Ce qu'on écarte.**
- La **manchette centrée dans son bloc**, et le chapeau centré avec
  elle. C'est précisément ce qui fait basculer une une moderne dans le
  pastiche de 1955. Chez nous : tout est ferré à gauche sur la colonne.
- Le bandeau tricolore d'enveloppe par avion et le tampon rond
  « No 368 » — deux ornements figuratifs. Un filet n'est pas un dessin.
- Le nameplate en médaillon rouge **au milieu de la page**. Le nôtre est
  ferré à gauche, sans fond.
- L'interlignage du `h1` : **1,06**. On descend à 0,94.
- Six familles chargées (`adobe-caslon-pro`, `big-caslon-fb`,
  `aviano-sans`, `lato`, Times). On en charge trois.

**Les chiffres du relevé** (`tools/_refs/juridique-airmail/releve.json`) :
`h1` 48 px / **51 px (1,06)**, `big-caslon-fb` graisse 400, couleur
`rgb(38,38,53)` · corps 16 px `adobe-caslon-pro` · fond de page
`rgb(250,246,240)` = `#FAF6F0` · accent le plus fréquent
`rgb(224,32,40)` = `#E02028` (10 occ.), puis `rgb(23,38,96)` = `#172660`
· cinq familles · hauteur 8 424 px · **42 images dont 6 grandes** ·
GSAP + ScrollTrigger.

---

### 3 · Schillings — `https://www.schillingspartners.com/`

**Ce qu'elle prouve.** Qu'un cabinet d'avocats haut de gamme en 2026 se
pose sur **papier chaud plus un seul vin sombre** — pas sur marine et
or, pas sur noir et gris. Et que le rapport d'échelle est brutal :
**121 px de titre contre 20 px de texte, sans aucun palier
intermédiaire**, pour six mots. Deux familles chargées, c'est tout.

Le relevé apporte une confirmation que je n'attendais pas : parmi les
fonds relevés, `rgb(124,35,67)` = **`#7C2343`**. Notre bordeaux verrouillé
est `#6d1a2c`. Deux teintes voisines, trouvées indépendamment, sur le
même métier. **La voie est confirmée par la mesure, pas par le goût.**

**Ce qu'on lui prend.**
- Le **romain et l'italique dans la même phrase** — « High stakes,
  *handled.* ». Chez nous : la manchette en romain, le chapeau en
  italique, jamais l'inverse.
- Le rapport d'échelle **titre / texte sans intermédiaire**.
- Le **vin sombre à la place du noir** pour tout ce qui doit être
  remarqué.
- Le fond `#F5F2EF` : chaud, jamais blanc. Nous allons plus loin, plus
  rose.

**Ce qu'on écarte.**
- Le **centrage absolu sur une page vide** : 900 px de hauteur pour six
  mots et rien d'autre. Une une est **dense**. Notre écran porte cinq
  colonnes, quatorze filets et neuf blocs de texte, dans les mêmes
  900 px.
- La **graisse 200** : illisible en petit, et notre `libre-baskerville`
  n'existe qu'en 400 et 700.
- La **barre à quatre segments dégradés** sous le logo — un dégradé, et
  notre voie n'en admet aucun.
- Le bandeau noir plein qui rogne 90 px en haut de la fenêtre sans rien
  dire d'utile.

**Les chiffres du relevé** (`tools/_refs/juridique-schillings/releve.json`) :
`h1` **121 px / 133,06 px (1,10)**, famille `Esface`, **graisse 200**,
couleur `rgb(45,1,43)` = `#2D012B` · corps 20 px, même famille · fond
`rgb(245,242,239)` = `#F5F2EF` · accents `#2D012B` (5 occ.) et
**`rgb(124,35,67)` = `#7C2343`** · **deux familles seulement** (`Esface`,
Arial) · hauteur 4 073 px · 12 images dont 1 grande · GSAP +
ScrollTrigger + Swiper.

---

> **Contre-épreuve mesurée, hors des trois.** `pallasllp.com` (relevé
> dans `tools/_refs/juridique-pallas/`) est le cabinet de litige le
> mieux tenu du lot : `h1` 44 px / 44,25 px (**1,00**), `TWK-Lausanne`
> 400, une **grotesque**, sur une photographie sombre plein cadre, avec
> des cartes d'actualités qui glissent. Il fait excellemment tout ce que
> notre voie interdit — et c'est utile : il chiffre la distance. Une
> seule chose lui est prise, indirectement : sa **barre de navigation
> découpée en six cellules par des filets verticaux pleine largeur**.
> C'est un pied de nez au métier — c'est un tableau, et un tableau est
> une réglure de journal.
>
> `ft.com` a été tenté en premier : bloqué par un mur de témoins en
> iframe, relevé inexploitable (hauteur 900 px, défilement verrouillé).
> Sa couleur de papier reste néanmoins la nôtre, et ce n'est pas un
> hasard : **`#fff1e5` est le saumon du Financial Times**. On prend la
> couleur, on ne prend pas la mesure — elle n'a pas pu être faite.
> `dottirlaw.com` a été relevé et écarté : le premier écran est vide à
> 2,6 s (une entrée très lente), il n'y avait rien à mesurer.

---

## La direction artistique

| Poste | Décision |
|---|---|
| **Référence culturelle** | **La une d'un quotidien économique imprimé sur papier rosé.** Pas « inspiré de » : la page **est** une une. Cinq colonnes, un bandeau de date, un bloc-titre, un filet double, un bandeau de rubriques, une manchette sur trois colonnes, deux colonnes de brèves, une oreille, un pied de une. Le sérieux vient de la **grille**, jamais du gris. |
| **Palette (hex nommés)** | **papier** `#fff1e5` (fond de page, plein cadre, aucun second fond) · **encre** `#1a1a1a` (manchette, nameplate, filets forts) · **bordeaux** `#6d1a2c` (bandeau de date, surtitres, titres de colonne, bouton, arête d'encre) · **gris de légende** `#6b5a52` (gloses, légendes, pied) · **réglure** `#e3cfc0` (filets de séparation à l'intérieur d'une colonne) · **réglure forte** `#d9c3b4` (filets verticaux de gouttière). **Six valeurs, pas sept.** Contrastes mesurés sur `#fff1e5` : encre **15,7:1** · bordeaux **10,3:1** · gris **5,9:1** · papier sur bordeaux **10,3:1**. Aucun échec, y compris sur le mono de 10 px. **Aucun orange, aucun or, aucun bleu.** |
| **Typographie (familles + tailles + interlignage)** | **Affichage — `libre-baskerville` 700** : nameplate **76 px / 76 px**, interlettrage 0 ; **manchette 88 px / 83 px (0,94)**, interlettrage **−0,02em** ; titres de domaine **17 px / 22 px** ; téléphone de l'oreille **26 px / 32 px**. **Texte — `source-serif` 400, romain ET italique** : chapeau **italique 19 px / 30 px** ; listes **15 px / 22 px** ; gloses **13 px / 18 px** ; lien secondaire italique 16 px. **Détail — `jetbrains-mono` 500, capitales** : bandeau de date **11 px**, interlettrage 0,16em ; rubriques de nav **11 px**, 0,14em ; surtitres et titres de colonne **11 px**, 0,16em ; légendes, pied et ligne de refus **10 px / 16 px**, 0,12em. **Trois familles, huit fichiers.** `libre-baskerville-1.woff2` est **préchargé** — il porte la manchette, donc le LCP. |
| **Composition du premier écran** | **Voir le tableau au pixel ci-dessous.** |
| **Formes** | **Angles vifs partout, rayon 0.** Aucune ombre, aucun dégradé de fondu, aucun flou. **La profondeur n'existe pas** : il n'y a qu'une feuille. Quatre épaisseurs de filet, et pas une de plus : **3 px + 1 px** (le filet double sous le bloc-titre, avec 3 px de papier entre les deux) · **2 px encre** (sous chaque titre de colonne et sous le surtitre de la manchette) · **1 px encre** (fermeture du bandeau de rubriques, fermeture du pied, filet de l'oreille) · **1 px `#e3cfc0` ou `#d9c3b4`** (séparations internes et gouttières). Le seul aplat de couleur de la page est le bandeau de date, plein bordeaux, 36 px, et le bouton, plein bordeaux, 248 × 44. |
| **Traitement photo** | **Une seule image sur tout l'écran**, 248 × 186, dans la colonne 5. Fichier `../../images/secteurs-sites/juridique-3.webp` (960 × 720, porte de bronze entre deux colonnes de marbre). **Duotone bordeaux / papier, tramé à 45°** : `filter: grayscale(1) contrast(1.35) brightness(1.05)`, une couche `#6d1a2c` en `mix-blend-mode: multiply`, et par-dessus une **trame** `repeating-linear-gradient(45deg, #fff1e5 0 1px, transparent 1px 3px)` en `mix-blend-mode: screen`, opacité 0,45. **Arrêts durs uniquement — c'est un grain de similigravure, pas un fondu ; il n'y a aucun dégradé sur cette page.** L'image porte ses dimensions réelles `width="960" height="720"` (CLS 0, le rapport 4:3 est exact), `decoding="async"`, `fetchpriority="low"`, **pas de `loading="lazy"`** : il n'y a pas de ligne de flottaison. |
| **Le geste et l'instant de capture** | **Voir la section « Le geste » ci-dessous.** Deux passages, dans l'ordre d'une presse — le noir, puis la couleur d'appoint. **1 · la manchette s'imprime**, ligne par ligne, sous une arête d'encre bordeaux qui traverse de gauche à droite (0 → 1220 ms). **2 · la plaque du bandeau de date se tire**, de gauche à droite (1250 → 2250 ms). **Ce qu'on photographie est la plaque, à `t = 1900 ms`** — 65,0 % de sa course : une barre bordeaux **pleine de 936 × 36 px**, arête franche à `x = 936`, et **la manchette entière**. La manchette n'est plus l'instant de capture : saisie à mi-course elle rendait « d'être e| », et un mot coupé en deux se lit comme du texte tronqué, pas comme une révélation (**piège 56**, écrit à partir de cet écran). Une barre n'a pas de mot à couper, et ses 36 px de haut valent encore **10,4 px** une fois l'écran réduit à 421 px, là où l'ancienne arête de 2 px n'en valait plus que 0,58 (**piège 57**). |
| **Ce qu'on ne fait pas** | Aucune photographie plein cadre, aucun héros photo, aucun fond d'image · **aucun centrage, nulle part** — pas un titre, pas un bouton, pas une légende · aucune carte, aucun bloc flottant, aucun panneau posé sur la page · aucun rayon, aucune ombre, aucun dégradé de fondu, aucun flou · aucun orange, aucun or, aucun bleu · aucune balance, aucun marteau de juge, aucune poignée de main, aucune colonnade en grand · **aucun nom d'avocat, aucun barreau, aucune cause, aucun jugement, aucun taux de réussite** · aucun prix, aucune note, aucun avis, aucun témoignage · **aucune manchette qui invente une affaire** — elle parle du cabinet et de sa méthode, jamais d'un dossier · aucune identité APED : pas de minium `#e2401f`, pas de ciment, pas d'`archivo`. |

### La grille, au pixel — 1440 × 900

**Cinq colonnes.** Marge extérieure **52 px** de chaque côté · largeur
utile **1336 px** · colonne **248 px** · gouttière **24 px**
(`5 × 248 + 4 × 24 = 1336`).

| Colonne | Bord gauche | Bord droit |
|---|---|---|
| C1 | 52 | 300 |
| C2 | 324 | 572 |
| C3 | 596 | 844 |
| C4 | 868 | 1116 |
| C5 | 1140 | 1388 |

Centres de gouttière — c'est là que tombent **tous** les filets
verticaux de la page : **312 · 584 · 856 · 1128**.

#### Le rythme vertical

| y | Ce qui s'y trouve |
|---|---|
| **0 → 36** | **Le bandeau de date.** Pleine largeur de fenêtre (bord à bord, 0 → 1440), aplat **bordeaux** plein, texte **papier**, mono 11 px capitales, interlettrage 0,16em. Trois items, **ferrés sur la grille, jamais centrés** : à `x = 52` la date · à `x = 596` (bord de C3) « ÉDITION DU CABINET · CAHIER A » · **ferré à droite, fin à `x = 1388`** « SITE DE DÉMONSTRATION ». **Il est fait de deux couches** — la **forme** (le même texte composé en **bordeaux sur le papier**) et la **plaque** (texte papier sur l'aplat bordeaux) qui se tire par-dessus. **Au repos, la plaque couvre tout** : le bandeau est exactement celui décrit ici. Les deux couches existent pour une seule raison, dite dans « Le geste ». |
| **44 → 158** | **Le bloc-titre.** Sur C1–C3 (52 → 844) : à `y 44–56` une ligne mono 10 px gris ; le **nameplate** « Cabinet Vallières », `libre-baskerville` 700 **76 px**, boîte de ligne 76 px, `y 60 → 136`, ferré à gauche à `x = 52` (largeur mesurée ≈ 711 px, il reste 81 px de blanc dans C3 — **ce blanc est voulu, il n'est pas comblé**) ; à `y 146–158` une seconde ligne mono 10 px gris, interlettrage 0,20em. |
| **44 → 158** | **L'oreille**, dans C5. Elle n'est pas une boîte : elle est **isolée par deux filets seulement** — un filet vertical **1 px encre** à `x = 1128` de `y 44` à `y 158`, et un filet horizontal **1 px encre** à `y = 158` de `x 1140` à `x 1388`. Contenu ferré à gauche à `x = 1140` : `y 50–64` « PREMIER APPEL » mono 10 px bordeaux, 0,18em · `y 74–106` le téléphone en `libre-baskerville` 700 **26 px / 32 px** encre · `y 112–148` deux lignes `source-serif` 13/18 gris. |
| **170 → 177** | **Le filet double**, pleine largeur utile (52 → 1388) : **3 px encre**, 3 px de papier, **1 px encre**. C'est la séparation canonique sous un bloc-titre de broadsheet, et elle n'apparaît **qu'ici**. |
| **177 → 216** | **Le bandeau de rubriques.** Hauteur 39 px, fermé en bas par un filet **1 px encre** à `y = 215`. **Cinq libellés, un par colonne** — la nav est la légende de la grille : chaque libellé commence exactement au bord gauche de sa colonne (52, 324, 596, 868, 1140), ligne de base à `y ≈ 201`, mono 11 px capitales, 0,14em, encre. **Quatre filets verticaux 1 px encre** aux centres de gouttière (312, 584, 856, 1128), de `y 177` à `y 215`. |
| **248 → 836** | **Le corps de la une.** Deux **filets verticaux 1 px `#d9c3b4`** à `x = 856` et `x = 1128`, de `y 248` à `y 836` — ils séparent la manchette des brèves, et les deux colonnes de brèves entre elles. Rien d'autre ne sépare. |
| **836 → 884** | **Le pied de une.** Filet **1 px encre** à `y = 836`, pleine largeur utile. Trois items mono 10 px gris, capitales, 0,12em, ligne de base `y ≈ 868` : `x = 52` · `x = 596` · **ferré à droite à `x = 1388`**. |
| **884 → 900** | Papier nu. La page est coupée par le bas, comme une feuille pliée. |

#### La manchette et son bloc — C1 à C3 (52 → 844, largeur 792)

| y | Élément |
|---|---|
| 248 → 264 | **Surtitre** mono 11 px capitales bordeaux, 0,16em, ferré à `x = 52`. |
| **274** | Filet **2 px encre**, de 52 à 844. |
| **302 → 551** | **LA MANCHETTE.** `libre-baskerville` **700**, **88 px**, boîtes de ligne de **83 px** (0,94), interlettrage **−0,02em**, encre `#1a1a1a`, ferrée à gauche, **trois lignes forcées** (`<span>` par ligne, pas de retour automatique). L1 `302–385` · L2 `385–468` · L3 `468–551`. **La plus longue ligne mesure ≈ 746 px pour 792 disponibles.** Contrôle obligatoire à la construction : si une ligne dépasse **780 px**, on descend la manchette à **84 px** — **on ne recoupe jamais le texte**. |
| **577** | Filet **1 px `#d9c3b4`**, de 52 à 844. |
| **597 → 687** | **Le chapeau, en italique.** `source-serif` **italique** 400, **19 px / 30 px**, encre, **largeur bornée à C1–C2 (52 → 572, soit 520 px)** — pas C1–C3. Le décrochement entre la manchette qui court sur 792 et le chapeau qui s'arrête à 572 est le second dispositif de la page. Trois lignes, ≈ 58 signes chacune. |
| **715 → 759** | **Le bouton.** Rectangle plein **bordeaux**, **248 × 44**, calé exactement sur C1 (`x 52 → 300`). Texte papier, mono 500 **12 px** capitales, 0,14em. Angles vifs, aucune ombre. **Survol / focus : inversion encre en 120 ms**, jamais un fondu. Anneau de focus visible : filet 2 px encre décalé de 3 px. |
| **≈ 743** (ligne de base) | **Lien secondaire**, ferré à `x = 324` (bord de C2) : `source-serif` **italique** 16 px encre, soulignement 1 px à 4 px du texte. Au survol, le soulignement **se trace** de gauche à droite en 160 ms. |
| **787** | Filet **1 px `#e3cfc0`**, de 52 à 844. |
| **799 → 815** | **La ligne de refus** — une seule ligne, mono 10 px capitales gris, 0,12em, sur 792 px. C'est la phrase la plus honnête de la page et elle est en bas de la une, à sa place. |

#### Colonne 4 (868 → 1116) — LES DOMAINES

| y | Élément |
|---|---|
| 248 → 264 | Titre de colonne, mono 11 px capitales **bordeaux**, 0,16em. |
| **274** | Filet **2 px encre**, 248 px. |
| **294 → 618** | **Quatre domaines**, pas de puces. Chaque entrée fait **81 px** : titre `libre-baskerville` 700 **17 px / 22 px** encre, puis une glose `source-serif` 400 **13 px / 18 px** gris sur deux lignes, puis un filet **1 px `#e3cfc0`**. |
| **650 → 666** | Second titre de colonne, mono 11 px bordeaux. |
| **676** | Filet **2 px encre**, 248 px. |
| **692 → 780** | Quatre lignes `source-serif` 400 **15 px / 22 px** encre (≈ 35 signes par ligne). |

#### Colonne 5 (1140 → 1388) — CE QUI NE SE FACTURE PAS

| y | Élément |
|---|---|
| 248 → 264 | Titre de colonne, mono 11 px capitales **bordeaux**, 0,16em. |
| **274** | Filet **2 px encre**, 248 px. |
| **290 → 526** | **Quatre entrées réglées**, `source-serif` 400 **15 px / 21 px** encre, une ou deux lignes chacune, hauteur d'entrée **59 px** filet compris (**1 px `#e3cfc0`**). |
| **550** | Filet **1 px `#e3cfc0`**, 248 px. |
| **562 → 748** | **La photographie** — la seule de l'écran. **248 × 186**, duotone bordeaux tramé 45°. |
| **756 → 788** | Légende, mono 10 px / 16 px gris, 0,12em, deux lignes. |

---

## Le geste

**La page s'imprime en deux passages, comme une presse : le noir
d'abord, la couleur d'appoint ensuite.** Le sens est toujours le sens
de lecture, gauche → droite, sans exception. Tout le reste de la page
est déjà imprimé à la première image.

| | Passage | Course | Ce qu'il fait |
|---|---|---|---|
| **1** | **La manchette s'imprime** | 0 → 1220 ms | Une arête d'encre bordeaux traverse chaque ligne ; derrière elle la ligne est imprimée, devant elle il n'y a que du papier. |
| **2** | **La plaque de couleur se tire** | 1250 → 2250 ms | L'aplat bordeaux du bandeau de date se pose de gauche à droite sur un texte déjà composé. **C'est celui-là qu'on photographie.** |

---

### Passage 1 · La manchette s'imprime

**Comment il est fait — et pourquoi dans ce sens-là.**

Le masque **n'est pas** un `clip-path` sur le texte. C'est un rectangle
de **papier `#fff1e5`** posé **par-dessus** la ligne, `position:absolute;
inset:0`, avec `border-left: 2px solid #6d1a2c`, animé en
`transform: translateX(0 → 100%)`. Trois raisons :

1. **Le texte est peint à la première image.** La manchette est le plus
   grand élément de la page, donc le candidat LCP. Un texte parti
   entièrement masqué le repousserait après 600 ms. Ici il est peint à
   `t = 0` et **couvert** — le LCP tient sous 300 ms.
2. **L'arête et le bord d'encre sont le même objet.** Le filet bordeaux
   est le `border-left` du masque : ils ne peuvent pas se décoller.
3. **Si l'animation ne joue pas** — script absent, navigateur ancien,
   `prefers-reduced-motion` — le masque est en `display: none` et la
   manchette est simplement imprimée. **Aucune information n'est perdue,
   jamais.**

Chaque ligne est un `<span>` en `display:block; position:relative;
width:fit-content; overflow:hidden; padding-block:14px;
margin-block:-14px` — le `fit-content` fait que `translateX(100%)` vaut
exactement la chasse du texte et pas la largeur de la colonne ; le
`padding` de 14 px empêche l'`overflow:hidden` de rogner les hampes et
les jambages (boîte de ligne 83 px pour une police de 88 px : il
déborde de 9,75 px en haut et en bas, 14 px couvre).

**Le minutage — `linear`, parce qu'un rouleau avance à vitesse
constante.**

| Ligne | Durée | Retard | Fin |
|---|---|---|---|
| L1 | 620 ms | 0 | 620 ms |
| L2 | 620 ms | 300 ms | 920 ms |
| L3 | 620 ms | 600 ms | 1220 ms |

`animation-timing-function: linear` · `animation-fill-mode: forwards` ·
**état de repos = imprimé.**

> **CE PASSAGE NE SE PHOTOGRAPHIE PLUS, ET C'EST LA CORRECTION DU
> 2026-08-01.** L'instant était `t = 940 ms` : L1 et L2 imprimées, L3
> encrée à 54,8 %, l'arête debout à `x = 411`. Conforme au plan, et
> faux quand même — la manchette rendait **« Aucun dossier ne s'ouvre
> avant d'être e| »**. Un mot coupé en deux ne se lit pas comme une
> révélation en cours : il se lit comme du texte tronqué, un
> `overflow` mal réglé, une police qui n'a pas chargé. Sur la planche
> des douze, à côté de onze écrans entiers, c'était le seul qui avait
> l'air cassé. **`PIEGES.md § 56` a été écrit à partir de cet
> écran.** Second grief, `§ 57` : l'arête de 2 px devenait **0,58 px**
> dans le panneau à 421 px — mesurée, prouvée, invisible.
>
> **Le mécanisme reste dans la page** : il joue pour un visiteur qui
> arrive, et c'est lui qui fait tenir le LCP (le texte est peint à
> `t = 0` et couvert). Il n'est simplement plus **ce qu'on
> photographie**. Un geste qui porte sur du texte se photographie
> **fini**, et le mouvement se met ailleurs.

---

### Passage 2 · La plaque de couleur se tire — c'est lui qu'on photographie

**Le bandeau de date est fait de deux couches, et le texte est le même
dans les deux.**

| | Couche | Ce qu'elle porte |
|---|---|---|
| dessous | **la forme** | le texte composé en **bordeaux sur le papier**, peint à la première image |
| dessus | **la plaque** | le même texte en **papier sur l'aplat bordeaux**, `position:absolute; inset:0`, tirée par un `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)` |

**Pourquoi deux couches et pas une.** Une plaque tirée sur une couche
unique cacherait « SITE DE DÉMONSTRATION » pendant toute la première
seconde : ce serait le piège 56 déplacé, pas corrigé — un mot absent
au lieu d'un mot coupé. Ici **la ligne se lit d'un bout à l'autre à
toute image** : bordeaux sur papier devant l'arête, papier sur
bordeaux derrière. Les deux sens tiennent le contraste, **10,3:1**
dans un cas comme dans l'autre.

**`clip-path` et non `transform`** : le texte de la plaque doit rester
au pixel sur celui de la forme. Un décalage d'un demi-pixel entre les
deux couches se verrait comme un tremblement à l'endroit exact où
l'œil regarde. Mesuré aux six largeurs de repli : **0,0 px d'écart de
hauteur** entre les deux couches, 360 → 1440.

**`both` et non `forwards`** : la plaque a un retard de 1250 ms, et
sans le volet `backwards` elle se poserait **pleine** pendant ce
retard puis **sauterait à zéro**. L'état de repos, lui, reste la forme
finale : sans animation du tout — `prefers-reduced-motion`, script
absent, moteur ancien — `clip-path: inset(0)` couvre tout le bandeau
et la page est celle du plan. **Aucune information n'est perdue,
jamais.**

**Le minutage — `linear`, une plaque avance à vitesse constante.**

| Élément | Retard | Durée | Fin |
|---|---|---|---|
| la plaque | 1250 ms | 1000 ms | 2250 ms |

**L'INSTANT DE CAPTURE : `t = 1900 ms` après le premier rendu.**

À cet instant, et c'est ce qu'on doit voir sur l'image arrêtée :

- **la manchette est ENTIÈRE** — « Aucun dossier / ne s'ouvre avant /
  d'être estimé. », les trois arêtes sorties du cadre (mesuré : les
  trois masques à droite de leur ligne) ;
- **la plaque est à 65,0 % de sa course** : un aplat bordeaux plein de
  **936 × 36 px**, du bord gauche de la fenêtre à `x = 936` ;
- **l'arête est franche et verticale à `x = 936`**, sur les 36 px de
  hauteur du bandeau ;
- **aucun glyphe n'est à cheval sur l'arête** : « ÉDITION DU CABINET ·
  CAHIER A » finit à `x = 838,5` (97,5 px de dégagement) et « SITE DE
  DÉMONSTRATION » commence à `x = 1212,4` (276,4 px). Le pourcentage
  n'est pas rond par hasard — il tombe dans la gouttière la plus large
  du bandeau.

**Ce que le geste pèse, et à quelle échelle.** À 1440 : **936 × 36 px**
de couleur pleine, une arête qui s'est déplacée de **936 px**. Réduit à
421 px (le facteur 0,29 du panneau) : **271 × 10,4 px**, déplacement
**271 px**. Les deux seuils du piège 57 — 12 px de masse, 40 px de
course — sont passés d'un ordre de grandeur, là où l'ancienne arête de
2 px en rendait 0,58.

---

**Comment on fige la capture, sans le piège 16.** On ne touche pas à
`animation-play-state` — c'est un raccourci, il se fait remettre à
`running` et il faut un `!important` pour le tenir. On passe par
l'API des animations, qui est déterministe et reproductible d'une passe
à l'autre :

```js
document.getAnimations().forEach(a => { a.pause(); a.currentTime = 1900 })
```

`currentTime` compte **le retard compris** : à 1900 ms la plaque, qui
part à 1250 pour 1000 ms, est à `(1900 − 1250) / 1000` = **65,0 %**, et
les quatre animations de la page se posent du même coup. Deux passes
rendent la même image.

**Micro-interactions.** Le survol et le focus du bouton, des cinq
rubriques de nav, du lien secondaire et des quatre domaines existent
(120–160 ms, inversion ou soulignement qui se trace) parce que le
standard les exige sur chaque cible cliquable. **Ce ne sont pas le
geste** : sur une image arrêtée, aucune n'est en cours.

**La date du bandeau.** Elle est écrite par cinq lignes de script en
ligne — `toLocaleDateString('fr-CA', { weekday:'long', day:'numeric',
month:'long', year:'numeric' })`, mise en capitales par le CSS. **Zéro
requête tierce, zéro erreur console, zéro décalage** : le bandeau a une
hauteur fixe de 36 px et le texte tient sur une ligne. Le repli écrit
dans le HTML est « ÉDITION COURANTE » — une date en dur serait fausse
dès le lendemain, et une fausseté dans le bandeau de date d'un journal
est une fausseté sur toute la page. **Le script écrit dans les DEUX
couches** (`querySelectorAll('.jour')`, pas `getElementById`) : une
date posée dans une seule d'entre elles se lirait comme un tremblement
à l'endroit exact où la plaque passe.

---

## Le contenu exact

*Tout le texte de l'écran, mot pour mot, prêt à coller. Il n'y a rien
d'autre sur la page.*

### Le nom

**Cabinet Vallières** — cabinet **fictif**. Aucun nom d'avocat n'apparaît
nulle part sur l'écran.

### Le bandeau de date — `y 0 → 36`

| Position | Texte |
|---|---|
| `x = 52` | *(écrit par le script)* `SAMEDI 1 AOÛT 2026` — repli HTML : `ÉDITION COURANTE` |
| `x = 596` | `ÉDITION DU CABINET · CAHIER A` |
| ferré à droite, `x = 1388` | `SITE DE DÉMONSTRATION` |

### Le bloc-titre — `y 44 → 158`

- Ligne du dessus (mono 10 px gris) :
  `AVOCATS · QUÉBEC · SEPT PERSONNES, UN SEUL BUREAU`
- **Nameplate** (`libre-baskerville` 700, 76 px) :
  **Cabinet Vallières**
- Ligne du dessous (mono 10 px gris, 0,20em) :
  `TRAVAIL · FAMILLE · IMMOBILIER · LITIGE CIVIL`

### L'oreille — C5, `y 44 → 158`

- Surtitre : `PREMIER APPEL`
- Téléphone (`libre-baskerville` 700, 26 px) : **000 000-0000**
- Glose (italique exclue, `source-serif` romain 13 px, gris, deux
  lignes) : *Une technicienne juridique répond le jour ouvrable même.*

### Les libellés de nav — `y 177 → 216`, un par colonne

| Colonne | Libellé |
|---|---|
| C1 · `x = 52` | `LES DOMAINES` |
| C2 · `x = 324` | `LA PREMIÈRE RENCONTRE` |
| C3 · `x = 596` | `LE MÉCANISME` |
| C4 · `x = 868` | `LE CABINET` |
| C5 · `x = 1140` | `NOUS JOINDRE` |

### Le surtitre de la manchette — `y 248 → 264`

`LA UNE · LES HONORAIRES`

### LA MANCHETTE — trois lignes forcées, mot pour mot

```
Aucun dossier
ne s’ouvre avant
d’être estimé.
```

> Elle parle de **la méthode du cabinet**, pas d'un dossier, pas d'une
> cause, pas d'un jugement. Elle est vraie parce que c'est la règle que
> le cabinet se donne ; elle est soutenue trois centimètres plus bas par
> le chapeau qui dit comment ; elle est entièrement sous le contrôle du
> cabinet ; et un patron de garage la comprend en trois secondes.

### Le chapeau — italique, `y 597 → 687`

> *La rencontre où l'on regarde le dossier ne se facture pas. Ce qui suit
> tient sur une page : ce que le dossier va coûter, combien de temps il
> va prendre, et ce qui déclenche une révision.*

### Le bouton — `y 715 → 759`

`DEMANDER L’ESTIMATION`

### Le lien secondaire — `x = 324`, ligne de base `≈ 743`

*Comment se fait l'estimation →*

### La ligne de refus — `y 799 → 815`

`CE QUI SE REFUSE : CRIMINEL · IMMIGRATION · BREVETS · FAILLITE · RECOURS COLLECTIFS`

### Colonne 4 — titre : `LES DOMAINES`

| Titre | Glose |
|---|---|
| **Droit du travail** | Congédiement, contrat de travail, plainte, fin d'emploi négociée. |
| **Droit de la famille** | Séparation, garde, pension alimentaire, convention. |
| **Droit immobilier** | Vice caché, servitude, promesse d'achat, trouble de voisinage. |
| **Litige civil** | Contrat rompu, dommages, recouvrement, mise en demeure. |

### Colonne 4, second bloc — titre : `LA PREMIÈRE RENCONTRE`

> Quarante minutes, au bureau ou au téléphone. On regarde les pièces, on
> dit ce qui est possible et ce qui ne l'est pas, et vous repartez avec
> l'estimation écrite.

### Colonne 5 — titre : `CE QUI NE SE FACTURE PAS`

1. La première rencontre, quelle qu'en soit l'issue.
2. Le courriel qui tient en trois lignes.
3. L'appel qui dure moins de dix minutes.
4. La copie de votre propre dossier, sur demande.

### Colonne 5 — la légende de la photographie

`PORTE DE BRONZE ENTRE DEUX COLONNES DE MARBRE, TIRÉE EN TRAME DE JOURNAL. ORNEMENT DE UNE — CE N’EST PAS L’ENTRÉE DU CABINET.`

### Le pied de une — `y 852 → 884`

| Position | Texte |
|---|---|
| `x = 52` | `CABINET VALLIÈRES · AVOCATS · QUÉBEC` |
| `x = 596` | `COURRIEL@EXEMPLE.CA · ADRESSE SUR DEMANDE` |
| ferré à droite, `x = 1388` | `CAHIER A · PAGE 1` |

### Le `<title>` et la `<meta>`

- `<title>` : `Cabinet Vallières — l’estimation avant le mandat`
- `<meta name="description">` : `Cabinet d’avocats à Québec. Travail,
  famille, immobilier, litige civil. L’estimation écrite avant
  l’ouverture du dossier. Site de démonstration.`
- `<meta name="robots" content="noindex,nofollow">` — obligatoire.

---

## Ce qui me distingue des onze autres

**Composition.** Je suis le seul écran **imprimé** : cinq colonnes de
248 px, quatorze filets, une manchette ferrée à gauche sur trois
colonnes, une oreille et un pied de une — là où les onze autres ouvrent
sur une photographie, un aplat ou un bloc centré, je n'ai **aucune image
de plus de 248 px de large** et **aucun élément centré, nulle part**.

**Couleur.** Je suis le seul papier **rosé** : `#fff1e5`, le saumon de la
presse économique, avec un unique vin sombre `#6d1a2c` et deux réglures
sable — pas d'orange, pas d'or, pas de bleu, pas de blanc pur, et pas
un second fond sur toute la page.

**Typographie.** Je suis le seul à faire porter l'affichage par une
**transitionnelle de labeur** — `libre-baskerville` 700, une police de
corps de texte poussée à 88 px avec un interlignage de 0,94 — au lieu
d'un didone, d'une grotesque ou d'une géométrique ; et le seul dont
l'italique est un **rôle structurel** (le chapeau et le lien secondaire,
jamais un accent décoratif).
