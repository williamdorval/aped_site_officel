# JURIDIQUE — Cabinet Vallières

*Un seul écran, 1440 × 900, arrêté. Rien en dessous, rien à défiler.*

> **CE PLAN REMPLACE CELUI DE LA « UNE DE QUOTIDIEN », ET IL LE
> CONTREDIT.** L'écran du 2026-08-01 était une une de broadsheet :
> cinq colonnes de 248 px, quatorze filets, un bandeau de date, une
> oreille, un pied de une, une photographie en duotone. Il a été jugé
> **7,5 / 10**, et le grief était juste : *« sept blocs d'information
> dans la première fenêtre et aucun ne respire. À 0,29 tout ce petit
> texte devient un gris uniforme — sauf qu'il a été composé comme de
> l'information, pas comme de la texture. L'écran a l'air chargé, pas
> dense. Il n'y a pas de vide, donc il n'y a pas de masse. »*
>
> Ce qui a été brûlé : le bandeau de date, le bandeau de cinq
> rubriques, l'oreille, le pied de une, la ligne de refus, la
> photographie et sa légende, le nameplate de 76 px. **Sept zones
> retirées.** Ce qui reste tient en trois.

---

## Les trois références

Deux ont changé. `hlr` et `airmail` portaient précisément la voie qui
a échoué — la une de quotidien —, et les garder aurait été comparer
l'écran à ce qu'on a décidé de ne plus faire. `schillings` reste.

### 1 · Commercial Type — `https://commercialtype.com/`

**Ce qu'elle prouve.** Qu'une couleur n'est une couleur que si elle est
une **MASSE**. Le premier écran est fait de trois bandes pleine largeur
— cyan, rose, noir — de **518 000 px² chacune, soit 360 px de haut et
40 % de la fenêtre**. Et qu'un serif monumental n'a pas besoin d'un
fond neutre : il vit **dedans**.

**Les chiffres relevés** (`tools/_refs/juridique-ctype/`) : affichage
**116 px** mesuré à l'écran (« Action Grotesque », interlignage 162 px)
— le spécimen suivant, « Orlando », approche 240 px ; **tout le reste
de la page est à 20,9 px**, sans un seul palier intermédiaire ;
**14 blocs de texte visibles** dans les 900 px ; **0 photographie** ;
trois aplats + blanc + noir.
*Le `h1` du relevé dit 21 px : c'est un titre de référencement masqué.
Ce qui décide est le glyphe qu'on voit — mesuré séparément.*

**Ce qu'on lui prend.** La couleur en masse pleine largeur, bord à
bord. Le rapport d'échelle **sans palier** : 142 contre 16, rien entre
les deux. La barre de navigation **découpée en cellules par des
filets** — un tableau, et un tableau est une réglure.

**Ce qu'on écarte.** Le titre centré dans sa bande. Les trois bandes
empilées — une seule masse, sinon c'est un nuancier. La grotesque.

---

### 2 · The Drift — `https://www.thedriftmag.com/`

**Ce qu'elle prouve.** Que **le texte peut être une matière**. La
moitié droite du premier écran est un pavé de **28 px sur 33,6 px
d'interlignage**, gris `rgb(48,48,48)`, **74 blocs de texte** dans les
900 px — et il ne se lit pas comme un article rétréci, il se lit comme
un champ. L'accent (`rgb(223,26,39)`, un rouge franc) ne touche que
des **mots isolés à l'intérieur du gris**, jamais un bloc entier. Et
l'italique est la **troisième voix** du même pavé, au même corps.

**Ce qu'on lui prend.** Le texte assumé comme texture : blocs
réguliers, gris homogène, mesure courte. L'italique comme voix dans le
texte courant et non comme ornement.

**Ce qu'on écarte.** L'illustration. Le display en grotesque grasse
capitale (48 px seulement — trop petit, et c'est la cellule du 04). Le
rouge vif : le nôtre est sombre et il est un aplat, pas un surlignage.

---

### 3 · Schillings — `https://www.schillingspartners.com/`

**Ce qu'elle prouve.** Le seul cabinet d'avocats des trois, et le seul
site au monde relevé ici qui mette **le romain et l'italique dans la
même phrase, au même corps** : « High stakes, *handled.* » — les deux
à **121 px**, graisse 200.

**Les chiffres relevés** (`tools/_refs/juridique-schillings/`) : `h1`
**121 px / 133,06 px (1,10)**, `Esface` ; corps **16 px** ; **9 blocs
de texte visibles dans toute la première fenêtre** ; **deux familles** ;
masse `rgb(45,1,43)` = `#2D012B` ; fond `#F5F2EF`. Parmi les fonds
relevés, **`rgb(124,35,67)` = `#7C2343`** — notre bordeaux verrouillé
est `#6d1a2c`. **Deux teintes voisines trouvées indépendamment sur le
même métier : la voie est confirmée par la mesure, pas par le goût.**

**Ce qu'on lui prend.** Le romain et l'italique dans la même phrase.
Le rapport 7,6 × sans intermédiaire. **Neuf blocs, pas plus** — c'est
la mesure de la retenue, et c'est celle qu'on a visée.

**Ce qu'on écarte.** Le centrage absolu sur une page vide : 900 px
pour six mots. La graisse 200. La barre à quatre segments dégradés.

> **Contre-épreuves relevées et écartées.** `ario.law` (Awwwards, noir
> + grotesque : la cellule du 06). `forthetimes.law` (capture noire,
> rien à mesurer). `drpb.ch` (photographie plein cadre + bleu :
> générique). `fitzcarraldoeditions.com` (photographie de livres).
> `theparisreview.org` — écartée des trois mais **une leçon retenue** :
> ses **chicots en italique de 13 px** au-dessus de titres romains de
> 24 px, dans une pile de cellules réglées sur fond noir. L'italique
> comme **étiquette de structure**. `nplusonemag.com` et `lrb.co.uk` :
> relevés inexploitables (hauteur 900, défilement verrouillé).

---

## La direction artistique

| Poste | Décision |
|---|---|
| **Le parti, en une phrase** | **Une phrase de trois lignes à 142 px commence EN CREUX dans une masse bordeaux, franchit le bord de la masse, et finit IMPRIMÉE en bordeaux sur le parchemin — le dernier mot en italique.** Le contraste n'est pas entre deux couleurs : il est entre une échelle monumentale et un gris de texte. |
| **Palette — QUATRE valeurs** | **parchemin** `#f4e7d3` · **vin** `#6d1a2c` · **encre** `#23191a` · **sourd** `#5c4a44` (gloses seulement). Contrastes mesurés sur le parchemin : encre **14,1:1** · vin **9,4:1** · sourd **6,8:1** · parchemin sur vin **9,4:1**. `demos-contraste.mjs` : **aucun échec**, min 6,84 aux trois largeurs. Aucun orange, aucun or, aucun bleu, aucun blanc pur. |
| **La masse** | **1440 × 425 de sang-de-bœuf plein, bord à bord** — 47 % de l'écran, plus la cellule d'action (328 × 232) : **56 % de la fenêtre en bordeaux**. Ce n'est ni un bandeau ni un liseré. Peinte par un fond **absolu**, pas par un conteneur, parce que la phrase doit la **traverser**. |
| **Typographie — TROIS familles, six fichiers** | **`playfair`** l'affichage : romain **700** et **VRAIE italique 600**. **`source-serif`** la glose et la trame : romain et italique 400. **`libre-baskerville` 700** les libellés capitales interlettrées, et rien d'autre. |
| **Aucun monospace** | Sept des neuf écrans en portent un. Un mono n'est pas la voix d'un cabinet d'avocats, et le retirer enlève une famille partagée avec huit autres métiers. |
| **Aucune image** | La seule photographie de l'ancienne version portait une légende qui disait « ce n'est pas l'entrée du cabinet ». **Un ornement qui s'excuse n'est pas nécessaire.** Zéro `<img>` : le seul des douze. `hlr` prouve que ça tient (0 grande image sur 10 353 px de page). |
| **Formes** | Rayon **0**, aucune ombre, aucun dégradé, aucun flou. Trois épaisseurs de filet : **2 px encre** (le filet fort qui ouvre la trame) · **1 px encre** (les seize filets de la trame et du pied) · **1 px parchemin** (sous la ligne de tête, dans la masse). |
| **Le geste** | **La plaque de la cellule d'action, tirée de HAUT EN BAS.** Voir plus bas. |

### Pourquoi `playfair` et pas `libre-baskerville`

**`libre-baskerville` n'a aucun fichier italique dans `fonts/demos/`** —
seulement `normal/700`. La matrice donne à ce métier « serif ancienne à
**vraies italiques** » comme cellule exclusive : la famille d'affichage
devait pouvoir la porter. Familles à italique réelle disponibles :
`cormorant` (hôtel), `spectral` (hôtel, immobilier),
`instrument-serif` (photographe), `source-serif` (déjà à nous),
**`playfair`** — la seule libre, à italique réelle, **et employée par
aucun des onze autres métiers**.

`libre-baskerville` n'est pas perdu : il reste **exclusivement à nous**,
sur les capitales interlettrées.

**Et l'italique est posée là où elle PÈSE** : « *estimé.* » fait 41 px
de hauteur d'œil à 142 px. Une italique qui ne vit qu'à 17 px dans une
glose vaut 5 px une fois l'écran réduit à 0,29 — elle n'est alors la
matière de personne.

---

## La grille, au pixel — 1440 × 900

Marge **64 px** (`clamp(20px, 4.44vw, 64px)`) · largeur utile
**1312 px** · quatre colonnes de **328 px** · filets verticaux à
**392, 720, 1048**.

| y | Ce qui s'y trouve |
|---|---|
| **0 → 425** | **LA MASSE**, bord à bord. |
| **40 → 56** | Ligne de tête, `libre-baskerville` 700 **12 px**, interlettrage 0,24em, capitales, parchemin. Gauche `x = 64` : `AVOCATS · QUÉBEC · SEPT PERSONNES, UN SEUL BUREAU`. **Ferré à droite `x = 1376`** : `SITE DE DÉMONSTRATION`. |
| **70 → 71** | Filet **1 px parchemin**, **bord à bord (0 → 1440)** — il sort de la grille exprès : il appartient à la masse, pas à la colonne. |
| **117 → 247** | **L1** « Aucun dossier » — `playfair` 700, **142 px / 130 px (0,915)**, interlettrage −0,015em, **parchemin**. Chasse mesurée **903,6 px**. |
| **247 → 377** | **L2** « ne s'ouvre avant ». Chasse **1016,4 px**. Bas d'encre : **371**. |
| **425** | **Bord bas de la masse.** Ce n'est pas un demi-écran : c'est **le milieu du blanc que la phrase laisse** — (371 + 479) / 2. À 452 le bord tombait à exactement la moitié des 900 px, la division la moins intéressante qui soit, et une valeur qui n'avait pour raison qu'elle-même. |
| **461 → 591** | **L3** « d'être *estimé.* » — **bordeaux sur parchemin**, dernier mot en `playfair` **italique 600**. Chasse **817,3 px**, fin à `x = 881`. Haut d'encre : **479**, soit 54 px sous le bord de la masse. |
| **465 → 585** | **LA GLOSE**, `source-serif` **italique 400, 17 px / 24 px**, sourd, **largeur 332 px calée sur la colonne 4 (`x 1044 → 1376`)**, alignée sur le bas de L3. Même cellule de grille que la phrase, en surimpression : elle occupe le vide que la troisième ligne, courte, laisse à sa droite. Cinq lignes régulières de ≈ 42 signes. |
| **613** | **Filet 2 px encre**, 64 → 1376 — la ligne que le titre écrase. |
| **613 → 842** | **LA TRAME.** Quatre colonnes, trois filets verticaux 1 px, trois filets de tête, neuf filets de ligne — **seize filets**, vingt-quatre lignes de texte au même pas. Fermée en bas par un filet 1 px. |
| **842 → 900** | **LA SIGNATURE.** `Cabinet Vallières` en `playfair` 700 **30 px** bordeaux, `x = 64` · **ferré à droite** `ADRESSE SUR DEMANDE · COURRIEL@EXEMPLE.CA`, `libre-baskerville` 10 px, 0,18em, sourd. |

`document.documentElement.scrollHeight` = **900** exactement à 1440.
Aucun débordement horizontal de **320 à 1920 px** (mesuré à sept
largeurs).

### Les trois colonnes de la trame

Structure **identique** dans les trois — c'est ce qui en fait une
texture et non trois listes : libellé `libre-baskerville` 11 px 0,2em
bordeaux · filet 1 px · **quatre rangs** de `source-serif` **16/20
encre** + glose **13/17 sourd**, séparés par un filet 1 px.

| Colonne | Rangs |
|---|---|
| **LE MÉCANISME** | On regarde les pièces · On dit ce qui est possible · L'estimation est écrite · Rien ne s'ouvre sans accord |
| **CE QUI NE SE FACTURE PAS** | La première rencontre · Le courriel de trois lignes · L'appel de moins de dix minutes · La copie de votre dossier |
| **LES QUATRE DOMAINES** | Droit du travail · Droit de la famille · Droit immobilier · Litige civil |

**« LE MÉCANISME » n'est pas décoratif : c'est la PREUVE de la
manchette.** La phrase promet qu'aucun dossier ne s'ouvre avant d'être
estimé ; la colonne 1 dit comment, en quatre pas. C'est la réponse à
Q2 — *le visiteur peut-il le vérifier ? sinon, qu'est-ce qui le
soutient ailleurs dans le document ?*

---

## Le geste — la plaque de la cellule d'action

**Deux couches, et le texte est le même dans les deux.**

| | Couche | Ce qu'elle porte |
|---|---|---|
| dessous | **la forme** | le libellé et le numéro en **bordeaux sur parchemin**, peints à la première image |
| dessus | **la plaque** | les mêmes en **parchemin sur l'aplat bordeaux**, tirée par un `clip-path: inset(0 0 100% 0)` → `inset(0)` |

**`display:grid` et `grid-area:1/1` sur les deux couches**, jamais
`position:absolute`. Deux couches dans la même cellule de grille ne
peuvent pas se décoller. **`appearance:none` sur le bouton** : sans
lui, Chromium garde le widget natif, donc un fond gris de système et
surtout un **contenu centré** — les deux couches se posaient au milieu
de la cellule et la plaque flottait à 130 px de la forme.

### L'arête est HORIZONTALE, et c'est la seule qui ne coupe rien

Une arête **verticale** traverse forcément le libellé ou le numéro :
**il n'existe aucune abscisse où les deux ont du blanc en même temps**
(libellé `x 1068 → 1235`, numéro `x 1069 → 1356`). Une arête
horizontale, elle, se pose dans le couloir vide qui sépare les deux.

**Le libellé est en haut de la cellule, le numéro au pied**, écartés
exprès : groupés en haut, l'arête n'avait **rien sous elle**, et un
rectangle bordeaux qui ne remplit pas sa case se lit comme une erreur
d'alignement, pas comme une plaque en cours. Écartés, ils encadrent
l'arête.

| | |
|---|---|
| **Course** | 900 → 1900 ms, `linear`, `forwards` |
| **INSTANT DE CAPTURE** | **`<meta name="adexweb-instant" content="1560">`** — 66,0 % |
| **Ce qu'on voit** | un aplat bordeaux de **328 × 153 px**, arête franche et horizontale à **y = 762** ; **au-dessus**, `PRENDRE RENDEZ-VOUS` en parchemin sur bordeaux ; **en dessous**, `000 000-0000` en bordeaux sur parchemin |
| **Dégagement** | 131 px sous le libellé, 28 px au-dessus des chiffres. **Aucun glyphe à cheval.** |
| **Piège 71** | 153 px de course et 328 px de large à 1440 : les deux seuils (12 px de masse, 40 px de course) sont passés d'un ordre de grandeur |

**DEUX RÉGIMES DE COULEUR SUR LE MÊME OBJET** : c'est ça, la preuve du
mouvement sur une image arrêtée, et ce n'est pas ambigu.

**LA PHRASE, ELLE, EST PHOTOGRAPHIÉE FINIE.** Un masque figé à
mi-course sur du texte se lit comme un mot tronqué — **piège 70, écrit
à partir de cet écran** (l'ancienne version rendait « d'être e| »). Un
geste qui porte sur du texte se photographie fini ; le mouvement se met
sur un aplat, qui n'a aucun mot à couper.

**Micro-interaction.** Au survol et au focus, la plaque se retire par
où elle est venue, en **quatre crans de 140 ms** (`steps(4,end)`) —
jamais un fondu. Anneau de focus : filet 2 px encre, décalé de 6 px.
**Un seul arrêt au clavier, avec anneau** (mesuré en tabulant, jamais
par `focus()` — piège 51).

**Repos = forme finale.** Sans animation — `prefers-reduced-motion`,
script absent, moteur ancien — `clip-path: inset(0)` couvre toute la
cellule. Mesuré : 0 animation, texte intact. **Aucune information
n'est perdue, jamais.**

---

## Le fond est déclaré sur ce qui porte le texte

La masse est un **frère**, pas un ancêtre. Tout outil qui remonte la
chaîne des parents pour trouver la première surface opaque tombe sur
le parchemin du `body` et rend **1:1 sur du texte parfaitement
lisible** — `demos-contraste.mjs` l'a rendu **quatre fois**. On
repeint donc l'aplat sur `.tete` et sur les deux premières lignes de
la phrase : exactement la couleur de la masse, aux mêmes coordonnées.
**Rien ne change à l'image, et le contraste devient calculable.**
C'est la famille du piège 45.

---

## Ce qui me distingue des onze autres

**Couleur.** Le seul **sang-de-bœuf** — et en **masse**, pas en accent :
56 % de la fenêtre. Le voisin le plus proche sur la planche est le 10
(terre cuite saturée), et il en est séparé par la teinte, par la
photographie qu'il porte et que je n'ai pas, et par le genre
typographique.

**Typographie.** Le seul dont l'affichage a une **vraie italique**, et
le seul à l'employer **à l'échelle monumentale** — un mot de 142 px, pas
un accent de 17 px. Le seul sans monospace.

**Photographie.** Le seul à **zéro image**.

**Composition.** Le seul dont **une phrase traverse la limite de deux
fonds et change de couleur en la franchissant**.

---

## Ce qu'on ne fait pas

Aucune photographie · aucun centrage, nulle part · aucun rayon, aucune
ombre, aucun dégradé, aucun flou · aucun orange, aucun or, aucun bleu ·
aucune balance, aucun marteau, aucune colonnade · **aucun nom
d'avocat, aucun barreau, aucune cause, aucun jugement, aucun taux de
réussite** · aucun prix, aucune note, aucun avis · **aucune manchette
qui invente une affaire** — elle parle de la méthode du cabinet ·
aucune adresse web · aucune identité ADEXWEB.

## Les mesures

| | |
|---|---|
| `scrollHeight` à 1440 | **900** |
| débordement horizontal 320 → 1920 | **aucun** (7 largeurs) |
| LCP | **108 ms** (`SPAN.l`, la première ligne de la phrase) |
| erreurs console | **0** |
| requêtes tierces | **0** |
| contraste, 390 / 768 / 1440 | **0 échec**, min **6,84** |
| arrêts au clavier sans anneau | **0** |
| `demos-controle.mjs` | **ok** |
| `prix-check.mjs` | **0** à retirer |
| poids | 22 ko de source, 85 ko de capture |
