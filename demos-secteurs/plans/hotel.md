# HÉBERGEMENT — Auberge de l'Anse-à-Givre

Un seul écran, **1440 × 900**, arrêté. Une photographie de nuit plein
cadre, **un nom à 148 px** posé sur son bord bas, et **une plaque de
métal encastrée dans les 168 derniers pixels** qui donne la
température du matin à 104 px. Deux masses, une diagonale, et rien
d'autre.

> ## LA REPRISE DU 2026-08-01 — LE PLAFOND DE 21 px EST TOMBÉ
>
> La version précédente de ce plan verrouillait un parti explicite :
> « le plus gros caractère de l'écran mesure 21 px », « pas de titre
> géant — plafond dur à 21 px ». Le raisonnement était bon à l'écrit :
> *on regarde un lieu, pas une page ; le texte est la plaque vissée à
> côté du sujet.* **Il ne survit pas à la mesure.**
>
> Relevé sur la capture livrée, avec la réduction du panneau simulée
> en deux demi-pas comme le moteur :
>
> | | hotel (avant) | restaurant | garage | paysagement |
> |---|---|---|---|---|
> | L moyen | **15,7** | 18,6 | 18,8 | 18,3 |
> | σ | **13,0** | 17,5 | 27,9 | 27,6 |
> | 95ᵉ centile | **45,7** | 49,5 | **94,7** | **100** |
>
> Deuxième plus sombre des douze, **et la plus PLATE du groupe
> sombre**. Le 95ᵉ centile est le chiffre qui tranche : chez le garage
> et le paysagement, 5 % de l'écran atteint L 95 — un titre blanc, un
> phare. Chez nous, **rien n'atteignait 46**. Le défaut n'était pas
> « la photo est sombre » : c'était **aucun objet de l'écran n'est
> lumineux**, donc aucune hiérarchie, donc rien à voir à 421 px.
>
> Après reprise : **L 21,3 · σ 19,5 · p95 63,5**. La photographie a
> gagné 24 % de luminosité et le nom apporte 27 406 px d'encre à
> L 89 qui n'existaient pas.
>
> **Ce que la reprise NE touche pas** — la cellule exclusive du métier
> tient toute entière : vert-noir profond + os, serif fine en
> capitales interlettrées, photographie plein cadre + plaque
> encastrée, paysage de nuit froide.

---

## Les trois références — CHANGÉES, et les chiffres disent pourquoi

`tools/planche-refs.mjs` est à jour : `hotel: ["tengile",
"arcticbath", "svart"]`.

**Sortent, et ce n'est pas un désaveu — c'est une question d'échelle.**
`nimmo` (mot-marque à 70 px posé **par-dessus** le bâtiment, cèdre
blond, bandeau promotionnel vert), `nils` (palette claire `#f7f6f0`,
rayon en stade, photographie d'intérieur ; son `h1` mesuré à 9 px est
un titre de référencement masqué — aucune conclusion ne s'en tire),
`eleven` (citation centrée à 56 px : les deux noirs colorés `#0e1b16`
et `#16242e` restent la preuve chiffrée que notre sapin est le bon
voisinage, mais 56 px centrés ne sont pas un premier écran de 2026).
Les trois relevés restent dans `tools/_refs/` et bornent ce qu'on
écarte.

### 1 · Tengile MalaMala — https://tengilemalamala.com

*`tools/_refs/hotel-tengile/`*

**Les chiffres, relevés.** `h1` **120 px**, interlignage **108 px
(0,90)**, chasse **−2,4 px (−0,02 em)**, graisse 220, famille
`PP Fragment` — une serif à très haut contraste —, couleur
`rgb(245,238,233)`, **capitales**. Corps 16 px. Photographie plein
cadre, sombre. Page 11 586 px, 27 grandes images. Aucune bibliothèque
d'animation.

**Ce qu'elle prouve.** Que le haut du métier se joue à **120 px en
capitales de serif fine sur une photographie sombre**, et que trois
lignes décalées peuvent occuper 45 % de la hauteur de la fenêtre sans
étouffer l'image.

**Ce qu'on lui prend.** L'échelle, et rien d'autre : 120 px devient
148 px chez nous parce que notre nom tient sur **une** ligne. Et la
leçon de la chasse — à cette taille elle est **nulle ou négative**,
jamais large.

**Ce qu'on écarte.** Toute la chaleur : bois blond, lumière rasante
d'or, whisky au premier plan. Le titre en trois lignes décalées qui
traverse le sujet. Le sous-titre + bouton posés en bas à droite sur
l'image, sans structure pour les tenir.

### 2 · Arctic Bath — https://arcticbath.se

*`tools/_refs/hotel-arcticbath/`*

**Les chiffres.** `h1` **80 px**, interlignage 104 px, chasse −2,4 px,
graisse 700, famille `Pluto` (grotesque), blanc. Corps **20 px**.
Nom **ancré en bas à gauche** sur la photographie, un **filet court**
dessous, puis un sous-titre.

**Ce qu'elle prouve.** Que l'ancrage bas-gauche + filet + sous-titre
est le patron canonique du métier, et qu'il tient à 80 px.

**Ce qu'on lui prend.** L'ancrage bas-gauche, et le principe du filet
sous le nom — chez nous il descend de 20 px et devient la lèvre du
socle.

**Ce qu'on écarte.** La barre de navigation blanche pleine, qui coupe
la photographie et fait le point le plus clair de l'écran **avant**
le paysage. Le bouton `Book your stay` en aplat bleu clair. La
grotesque grasse. Et la photographie aérienne d'été.

### 3 · Svart — https://www.svart.no

*`tools/_refs/hotel-svart/`*

**Attention au relevé** : le `h1` mesuré (56 px, `rgb(0,0,0)`) est un
titre de section sous la ligne de flottaison, pas le mot-marque. Le
mot-marque visible est relevé **à l'image** : hauteur de capitale
64 px de y 88 à y 152, soit ≈ **90 px de corps** pour une didone.
Corps « 10 px / Arial » : bruit de Wix, sans valeur.

**Ce qu'elle prouve.** Que la matière du métier en pays froid est un
**paysage de nuit bleue** sous des **capitales de serif à haut
contraste en blanc** — exactement notre cellule, confirmée par un
projet réel.

**Ce qu'on lui prend.** La confirmation de la voie, et rien de plus.

**Ce qu'on écarte.** Le mot-marque **centré** dans un bandeau noir
au-dessus de la photographie, qui la coupe au lieu de s'y poser. La
nav de deux items en haut à droite. Le rendu d'architecte, qui n'est
pas une photographie. Et la bulle de clavardage.

---

## La direction artistique

| Poste | Décision |
|---|---|
| **Référence culturelle** | **Le tablier d'instruments d'un belvédère.** Une photographie de nuit occupe tout le cadre ; dans son bord bas est encastrée une plaque de métal, à fleur, bordée d'un jonc de laiton, qui donne la température de l'heure. On lit le lieu, puis le froid |
| **Palette** | **sapin `#0b1712`** — la couleur de `<html>` et l'aplat du socle · **os `#e8e0cd`** — tout le texte, sans exception · **laiton `#a98b4f`** — la lèvre du socle, les trois joncs, le cadre de la clé, le libellé du relevé · **voile froid `#122c3a`** posé à 22 % sur la photographie · noir des deux voiles `rgb(9,18,15)`, aplat du socle `rgb(9,17,14)`. **Aucun orange, aucun rouge dans la palette dessinée.** Quatre couleurs, et le laiton est la seule saturée |
| **Typographie** | **`cormorant` 600, capitales uniquement** — **148 px / interlignage 0,84 / chasse 0,02 em** (le nom) · 104 px / 0,01 em, `lining-nums` (le chiffre) · 18 px / 0,22 em (l'état du relevé) · 15 px / **0,44 em** (« AUBERGE DE ») · 14 px / 0,26 em (la nav) · 13 px / 0,28 em (la clé). **`spectral` 400 italique** — 16 px / interlignage 1,48 (la promesse). **`jetbrains-mono` 500** — 11 px / 0,16 em et 10 px / 0,22 em et 0,14 em (les micro-libellés). Trois fichiers seulement : `cormorant-3`, `spectral-1`, `jetbrains-mono-1` — les faces « -0 » / « -2 » couvrent U+0100-02BA et ne seraient jamais téléchargées. SIL OFL 1.1 |
| **L'interlettrage, et où il est passé** | La signature du métier est « petites capitales interlettrées ». À 148 px, 0,44 em vaudrait **65 px entre deux lettres** : ce ne serait plus une capitale espacée, ce serait une ligne éclatée — et Tengile, à 120 px, est à **−0,02 em**. L'interlettrage n'est donc pas perdu, **il a changé de ligne** : il vit sur les cinq lignes qui entourent le nom, et « AUBERGE DE » reprend le **0,44 em exact** de l'ancienne marque |
| **Formes** | **Rayon 0 partout, et c'est une décision, pas un défaut.** La version précédente posait 24 px sur un cartouche et 20 px sur un bouton : deux objets qui **flottaient**, et un objet qui flotte a le droit d'avoir des coins. Un objet **encastré** n'en a pas — une pièce ajustée dans un bâti est d'équerre, sinon elle ne rentre pas. Le rayon reste permis dans les douze écrans ; ici il ferait un tableau de bord de plastique. **Aucune ombre portée** — la profondeur vient de la photographie, qui a trois plans. **Aucun flou, aucun `backdrop-filter`** : le socle est un aplat franc à `.965`. **Joncs d'1 px** en laiton à 58 % : trois verticaux de 88 px dans le socle, un vertical de 10 px dans la barre du haut |
| **Traitement photo** | Sur le `<img>` : **`filter: saturate(.36) contrast(1.10) brightness(1.06)`**. *La luminosité valait `.82` et avant cela `.60`. Au-dessus de 1, le filtre ne surexpose pas : la source est une photographie d'heure bleue sous-exposée d'origine, et 1,06 rend ce que le capteur avait.* Par-dessus, une nappe plate **`rgba(18,44,58,.22)`** — un virage, pas un assombrissement ; l'assombrissement est le travail du socle |
| **Le geste et l'instant** | Voir « LA LAISSE » ci-dessous |
| **Ce qu'on ne fait pas** | Pas de partage gauche/droite, pas de colonne de magazine, pas de carte flottante. **Aucun prix, aucun « à partir de »**, aucune note, aucun avis, aucun témoignage, aucun logo, **aucune adresse web**. Pas de champ de réservation avec dates saisissables — le socle dit la météo, pas la disponibilité. **Pas de parallaxe, pas de Ken Burns, pas de vidéo, pas de second geste** : quarante mouvements s'annulent, la lèvre est le seul objet animé. Aucune requête tierce. Et **jamais de laiton sur du texte posé à même la photographie** — il y tombe à 3,88:1 ; le laiton n'y porte du texte qu'à l'intérieur du socle, sur l'aplat, où il rend 4,65:1 |

### La composition, au pixel — fenêtre 1440 × 900

**La photographie : `images/secteurs-sites/hotel-2.webp`, 1920 × 1080.**
Recouvrement piloté par la hauteur : 0,833 de réduction, largeur
affichée 1600 px, **80 px rognés de chaque côté. Aucun
agrandissement.** Légende vraie : les pavillons de bois éclairés,
montés sur pilotis dans la forêt de feuillus nus sous la neige, à la
tombée du jour ; quelques promeneurs sur la passerelle.

*Ouverte en pleine résolution avant usage* (piège 57) : boulaie de
feuillus nus chargés de neige, sol enneigé profond, trois pavillons à
pignon sur pilotis, une passerelle, des lanternes, la brunante bleue.
C'est Charlevoix ou la Côte-Nord sans discussion. Cherché au même
grossissement : **aucune marque, aucune enseigne, aucune plaque,
aucun numéro civique** ; quatre ou cinq promeneurs à contre-jour,
**aucun visage résolu** — `STANDARD.md § 4.2` vise les visages
reconnaissables, pas les gens.

*Les trois autres 1920 × 1080 du lot, réexaminées.* `hotel-1` reste
écartée : massif européen — pierrier alpin dans le coin haut-droit,
pins mugo en amorce, toiture à quinze lucarnes — et l'écran se dit
sur la **Haute-Côte-Nord**. Elle porte pourtant l'anse gelée qui nous
manque, et la tentation était réelle ; `STANDARD.md § 4.5` tranche :
« une photo ne contredit jamais le texte ; quand les deux se
contredisent, c'est la photo qui change ». `hotel-9` reste écartée :
brume claire sans sujet, aucun endroit où poser une ligne. Les quatre
portraits 1000 × 1400 demandent **1,44 d'agrandissement**.

Toutes les cotes ci-dessous sont **relevées dans la page rendue**
(`getBoundingClientRect` après `document.fonts.ready`) ; les deux
encres sont **relevées dans une capture**, l'élément isolé sur fond
noir et balayé pixel à pixel — **une boîte n'est pas de l'encre.**

| # | Objet | x | y | largeur × hauteur | Détail |
|---|---|---|---|---|---|
| 1 | Photographie `hotel-2.webp` | −80 | 0 | 1600 × 900 | `object-fit: cover`, `object-position: 50% 50%`, `width="1920" height="1080"` dans le balisage (CLS 0), `fetchpriority="high"`, `decoding="sync"`, **jamais `lazy`** |
| 2 | Nappe froide `rgba(18,44,58,.22)` | 0 | 0 | 1440 × 900 | plate, sans mode de fusion |
| 3 | Voile du haut | 0 | 0 | 1440 × **170** | `.92 → .56 @46 % → 0`. **Il est réglé sur la luminosité de la photo** : il valait `.90/.58/0` sur 210 px à `brightness(.82)` ; la photo passant à 1,06, il se raccourcit et se durcit en tête pour tenir la cote sans reprendre la lumière gagnée plus bas. **Toute reprise de `brightness` se rejoue ici** |
| 4 | Dégradé | 0 | **400** | 1440 × **332** | six arrêts : `0 → .22@22 % → .48@42 % → .70@62 % → .84@82 % → .90`. Il s'arrête au bord haut du socle, pas à 900 |
| 5 | Barre du haut | 112 | 48 | 1256 × 17 | coordonnées à gauche (519 px), nav à droite (585 px, x 783 → 1368) |
| 5a | ↳ `000 000-0000` | 112 | 48 | 100 × 14 | mono 11 px / 0,16 em, os 100 % — **11,21:1** au pire pixel |
| 5b | ↳ `HAUTE-CÔTE-NORD, QUÉBEC` | 240 | 48 | 190 × 13 | mono 10 px / 0,22 em, os 86 % — **8,16:1**. *Il était posé au-dessus du nom, à y = 532, dans la bande la plus encombrée de la photographie : il ne s'y perdait pas faute de contraste (7,03:1 mesuré) mais faute de **calme**. Ici il rejoint sa vraie famille* |
| 5c | ↳ `SITE DE DÉMONSTRATION` | 459 | 48 | 172 × 13 | mono 10 px / 0,22 em, os 74 % — **6,46:1** |
| 5d | ↳ Nav, 4 items, écart 36 px | 783 | 48 | 585 × 17 | cormorant 600, 14 px / 0,26 em, os 100 % — **10,44 à 11,14:1**. Le dernier item porte `margin-right:-0.26em` pour que l'**encre** s'aligne sur 1368, pas la chasse morte |
| 6 | `AUBERGE DE` | 112 | 554 | 269 × 16 | cormorant 600, **15 px / 0,44 em**, os 88 % — **8,47:1**. *Il faisait 28 px au premier tirage, et 28 px est exactement l'**intermédiaire** que `STANDARD.md § 1.1` interdit* |
| 7 | **LE NOM** | 112 | 594 | boîte 1256 × 124 | cormorant 600, **148 px**, interlignage 0,84, chasse 0,02 em, os 100 % — **10,30:1** au pire pixel, seuil des grands caractères 3:1. **ENCRE RELEVÉE DANS L'IMAGE : y 586 → 705 (120 px), x 116 → 1242 (1127 px), 27 406 px d'encre.** À 0,29 la hauteur de capitale vaut **34,8 px** |
| 8 | **LE SOCLE ENCASTRÉ** | 0 | **732** | **1440 × 168** | à fleur des bords gauche, droit et bas. `rgba(9,17,14,.965)` — pas 1 : le grain de la neige se devine encore à travers, ce qui dit que la plaque est **posée sur** la photographie et non qu'elle la remplace |
| 9 | **La lèvre — LE GESTE** | 0 | 732 | **1440 × 26** | laiton plein, arête sombre d'1 px sur sa lèvre basse. Saignée en creux derrière, `rgba(0,0,0,.45)`, même boîte. À t = 1500 ms : **880 px de laiton relevés dans l'image** |
| 10 | Clé `LES DATES LIBRES` | 112 | 822 | **236 × 52** | cadre 1 px laiton, **aucun aplat**, texte os cormorant 600 13 px / 0,28 em — **11,03:1**. Se remplit de laiton au survol |
| 11 | Promesse, 2 lignes | 409 | 827 | 350 × 47 | spectral italique 16 px / 1,48, os 74 % — **6,24:1** |
| 12 | Relevé, 3 lignes | 820 | 809 | 222 × 65 | `CE MATIN À L'ANSE` mono 10 / 0,22 em **laiton — 4,65:1** (seul endroit où le laiton porte du texte : il est sur un aplat) · `ANSE PRISE` cormorant 600 18 px / 0,22 em os — 10,24:1 · `LEVER 7 H 12 — COUCHER 16 H 04` mono 10 / 0,14 em **os 66 % — 5,20:1** |
| 13 | **LE CHIFFRE** | 1104 | 803 | boîte 264 × 83 | cormorant 600, **104 px**, interlignage 0,80, chasse 0,01 em, `lining-nums`, os 100 % — **10,67:1**. **ENCRE RELEVÉE DANS L'IMAGE : y 810 → 878 (69 px), x 1106 → 1362 (257 px).** À 0,29 la hauteur de chiffre vaut **20 px** — il se lit dans la vignette, ce qui était tout le problème. `margin-bottom:-12px` : un « −21 °C » n'a aucun jambage, sa boîte descend 12 px sous son encre et l'alignement par le bas mentirait d'autant |
| 14 | Joncs, 3 × | ~381 / ~790 / ~1073 | 786 | 1 × 88 | `rgba(169,139,79,.58)` |

**Les marges, volontairement inégales :** 72 px à droite, 48 px en
haut. **L'axe du texte est 112**, pas 72 : le nom et le contenu du
socle partagent la même verticale, et c'est elle qui tient la
composition. L'axe droit est **1368** pour la nav comme pour le
chiffre.

**Le rectangle x 0→1440 · y 170→400 est de la photographie pure** —
230 px, 26 % de l'écran, sans voile, sans dégradé, rien de posé
dessus.

### LA LAISSE — le geste, et il est seul

**Une lèvre de laiton de 26 px encastrée dans le bord haut du socle,
qui court de gauche à droite sur les 1440 px**, comme la laisse de
haute mer le long d'une grève. La direction suit le sens de lecture.

```
@keyframes laisse { from{transform:scaleX(0)} to{transform:scaleX(1)} }
.socle::after { animation: laisse 1800ms linear 400ms forwards }
```

**Capture à t = 1500 ms** : (1500 − 400) / 1800 = **61,1 %**.

**Preuve du geste, relevée DANS L'IMAGE** par balayage d'une ligne au
milieu de la lèvre — jamais lue dans le CSS (piège 54) :

| t | 400 ms | 675 ms | 950 ms | 1225 ms | 1500 ms |
|---|---|---|---|---|---|
| laiton | 0 px | 220 px | 440 px | 660 px | **880 px** |
| écart | — | 220 | 220 | 220 | 220 |

**220 px entre deux images consécutives**, soit **64 px après
réduction à 0,29**. Le seuil est 40.

*Comment le refaire, en trois lignes* : ouvrir la page, mettre chaque
`document.getAnimations()` en pause et poser son `currentTime` à
l'instant voulu, photographier une bande de 5 px prise au milieu de
la lèvre (`y = socle.y + 13`), puis balayer cette ligne et retenir le
dernier pixel où `rouge > 110 && rouge − bleu > 30`. **La longueur se
relève dans l'image, jamais dans le CSS.**

**Trois choses qui ont été payées.**

1. **26 px, et pas 1.** À 0,29 un filet d'1 px vaut 0,29 px et le
   moteur l'étale en un gris que personne ne voit (piège 57).
2. **La course est une SAIGNÉE, pas une piste — corrigé à la
   deuxième passe.** Au premier tirage la course était **claire**
   (`rgba(232,224,205,.10)`), plus claire que le socle. Une barre
   pleine qui avance dans une piste plus claire, en haut d'un
   panneau, se lit comme une **barre de chargement**, et c'était le
   seul objet raté de l'écran. Une saignée plus **sombre** que la
   plaque renverse la lecture : ce n'est plus un niveau qui monte,
   c'est une pièce de métal qu'on glisse dans une rainure creusée
   pour elle.
3. **Linéaire, et c'est délibéré.** Une sortie en ease-out ferait
   bouger la fraction capturée de 20 points pour 40 ms d'écart ; un
   remplissage linéaire ne la bouge que de 2,2 points. Deux passes
   rendent la même image.

Sous `prefers-reduced-motion: reduce` : **0 animation, lèvre à
`matrix(1,0,0,1,0,0)`** — pleine dès le premier rendu. Elle ne porte
aucune information, c'est le seul objet qu'on ait le droit
d'éteindre.

### Pourquoi la lèvre a quitté le nom

La version précédente animait une plaque de 506 × 16 **sous** un nom
de 21 px. Le nom fait maintenant 148 px et son encre couvre 1127 px ;
une plaque à sa mesure aurait doublé le laiton de l'écran et l'aurait
posée à **27 px** du bord du socle — deux longues horizontales
voisines, qui se lisent comme des rayures. En la descendant **dans**
le socle, elle devient ce qu'elle prétendait être : une pièce de
métal encastrée, pas un soulignement.

---

## Le contenu exact

**Nom fictif :** Auberge de l'Anse-à-Givre
*(toponyme inventé sur le patron québécois — Anse-à-Beaufils,
Anse-au-Griffon. « Givre » n'existe pas comme anse au Québec.)*

**`<title>`** → `Auberge de l'Anse-à-Givre — Haute-Côte-Nord`
**`<meta name="description">`** → `Auberge devant une anse gelée de la Haute-Côte-Nord. Site de démonstration.`
**`<meta name="robots">`** → `noindex,nofollow` · **`theme-color`** → `#0b1712`

**Barre du haut, à gauche** *(mono 11 px, jonc, mono 10 px ×2)*
```
000 000-0000  |  HAUTE-CÔTE-NORD, QUÉBEC  |  SITE DE DÉMONSTRATION
```

**Nav, à droite** *(cormorant 600 caps, 14 px, 0,26 em, écart 36 px ;
`NOUS JOINDRE` est un `mailto:courriel@exemple.ca`, les trois autres
pointent `#`)*
```
L'AUBERGE   LES CHAMBRES   LA TABLE   NOUS JOINDRE
```

**Le titre, mot pour mot** — un seul `<h1>`, deux `<span>`, donc le
nom accessible reste entier : « Auberge de l'Anse-à-Givre ».
*(apostrophe typographique U+2019)*
```
AUBERGE DE            (cormorant 600, 15 px, 0,44 em)
L'ANSE-À-GIVRE        (cormorant 600, 148 px, 0,02 em)
```

**La promesse, deux lignes** *(spectral 400 italique, 16 px, 1,48)*
```
Vingt-deux chambres devant l'anse qui prend en glace.
Une seule tablée le soir, à dix-huit heures trente.
```
*Vingt-deux ne contredit rien : la photographie montre trois pavillons
éclairés et une passerelle qui continue hors champ.*

**La clé** *(cormorant 600, 13 px, 0,28 em)*
```
LES DATES LIBRES
```
*Ni « Réserver », ni « À partir de ». On promet une liste de dates —
c'est tenable, et ça ne parle pas d'argent.*

**Le relevé, trois lignes, et le chiffre**
```
CE MATIN À L'ANSE
ANSE PRISE
LEVER 7 H 12 — COUCHER 16 H 04
                                          −21 °C
```
*« Anse prise » : l'anse a gelé d'un bord à l'autre. Le signe moins
est U+2212, pas un trait d'union.*

**Texte de remplacement de la photographie** *(il décrit ce que
l'image montre vraiment, promeneurs compris — `STANDARD.md § 4.4`)*
```
Les pavillons de bois de l'auberge, éclairés et montés sur pilotis
dans la forêt d'arbres nus sous la neige, à la tombée du jour ;
quelques promeneurs sur la passerelle.
```

**Les coordonnées, et il n'y en a pas d'autres.** Téléphone
`000 000-0000`, visible en haut à gauche. Courriel
`courriel@exemple.ca`, derrière `NOUS JOINDRE`. Aucune adresse
postale, **aucune adresse web**.

---

## Ce qui me distingue des onze autres

**Composition.** Je suis le seul écran dont le bord bas porte une
**plaque pleine largeur encastrée à fleur du cadre** — 1440 × 168,
18,7 % de la surface, bordée d'un jonc de laiton, contenant quatre
cellules séparées par des joncs d'1 px. Personne d'autre n'a de
tablier d'instruments. Et je suis le seul à poser **deux masses
typographiques en diagonale** : le nom à 148 px en bas à gauche, le
chiffre à 104 px à l'extrémité droite du socle.

**Le voisin le plus proche est le 01 Restauration**, et il faut le
dire : lui aussi est une photographie sombre avec une serif claire
ancrée en bas à gauche. Ce qui nous sépare, à 421 px : sa palette est
**chaude** (braise, cèdre, deux boutons orange en pilule posés sur la
photographie), la mienne est **froide** ; son nom flotte à mi-hauteur
sans structure sous lui, le mien repose sur une plaque ; il n'a pas
de second point de lecture. C'est suffisant, ce n'est pas confortable.

**Couleur.** Je suis le seul écran **vert-noir + os**. La photographie
est virée au froid — la neige du sol mesure `#607888`, un bleu-gris,
pas du blanc. Le laiton `#a98b4f` est la seule couleur saturée. Les
deux autres sombres froids du lot s'en écartent par la matière :
l'Immobilier est nuit + or sur de la photographie de propriété, la
Construction est bleu de plan + cyan sur du quadrillage.

**Typographie.** `cormorant` 600 n'apparaît nulle part ailleurs, et
ici il ne s'écrit **jamais** autrement qu'en capitales — jamais en bas
de casse, jamais sous 13 px. La seule minuscule de l'écran est une
italique `spectral` de 16 px sur deux lignes. Le saut entre
l'affichage et le texte courant vaut **9,25** (148 px contre 16 px) —
le standard demande 6 à 11.

---

## Les mesures, et comment les refaire

| Quoi | Commande | Résultat |
|---|---|---|
| véracité, marques, tierces | `node tools/demos-controle.mjs --port 8099 hotel` | **ok**, 0 mal |
| prix | `node tools/prix-check.mjs` | **0** à retirer, **0** à vérifier |
| contraste sous la photo | `node tools/pire-pixel.mjs hotel .nom .sous .ou .tel .demo ".nav a" .promesse .temp .r-titre .r-etat .r-heures .cta --seuil 4.5` | **15 blocs, 0 échec**. Pire : `.r-titre` 4,65 · `.r-heures` 5,20 · `.promesse` 6,24 |
| console · tierces · hauteur | sonde | **0 erreur · 0 tierce · `scrollHeight` = 900** |
| débordement 320 → 1920 | sonde, 16 largeurs | **aucun** |
| focus au clavier | **tabulation**, jamais `focus()` (piège 51) | **tous les arrêts portent un anneau** |
| mouvement réduit | contexte `reducedMotion:"reduce"` | **0 animation, lèvre pleine** |
| luminance des douze | comparaison, réduction à 421 px simulée | **L 21,3 · σ 19,5 · p95 63,5** (avant : 15,7 · 13,0 · 45,7) |
| le geste | balayage d'une ligne dans l'image, 5 instants | **220 px d'écart, constant** |

---

## Ce qui reste ouvert

1. **L'anse n'est jamais montrée.** Le nom, la promesse et le relevé
   parlent tous d'une anse qui prend en glace ; la photographie montre
   le bois. Aucun des dix-sept tirages du lot ne réunit *une étendue
   gelée* et *une matière québécoise crédible* : `hotel-1` a l'étendue
   et pas la matière, `hotel-2` a la matière et pas l'étendue. Rien à
   l'écran ne contredit le texte — c'est une **absence**, pas une
   fausseté — mais l'écran serait plus fort avec une dix-huitième
   photo. **Tant qu'elle n'existe pas, cette ligne reste.**
2. **Des gens sont dans l'image.** Quatre ou cinq promeneurs à
   contre-jour, aucun visage résolu à ×3 sur le fichier source.
   Conforme à `STANDARD.md § 4.2`. Aucun des onze autres n'en montre :
   c'est un écart assumé, pas un oubli.
3. **La capture pèse 244 ko**, la plus lourde des douze (les autres
   vont de 34 à 153). Un lacis de branches enneigées compresse mal en
   webp. Aucun seuil n'est écrit là-dessus, mais le chiffre est le
   double du suivant et personne ne l'a arbitré.
4. **Le panneau des réalisations affiche `anse-a-givre.ca`** dans sa
   barre d'adresse simulée. Les douze en ont une (`bistro-nordet.ca`,
   `fonte-nord.ca`, …) : c'est une convention de la **chrome de
   présentation**, hors de ma cellule, et je ne l'ai pas touchée. Mais
   la règle « aucune adresse web » du chantier ne dit pas si elle
   s'arrête à la porte du panneau. **À arbitrer par le fil principal,
   pour les douze en une fois** — jamais pour un seul.
5. **La proximité avec le 01 Restauration** (photographie sombre +
   serif claire ancrée en bas à gauche) est réelle. Elle est tenue par
   la température de couleur et par le socle. Si un jour le
   restaurant refroidit sa palette, c'est cet écran-ci qu'il faudra
   refaire — le 01 est un projet réel et ne bouge pas.
6. **`.r-titre` rend 4,65:1 au pire pixel**, à 0,15 du seuil. C'est du
   laiton sur l'aplat du socle, la seule ligne de l'écran où le laiton
   porte du texte. L'arithmétique à la main donne 5,85 ; l'écart est
   l'anticrénelage d'une mono de 10 px, il est réel et il compte.
   Monter le laiton l'éclaircirait vers l'or et le sortirait de la
   palette.
7. **Rien de tout cela n'a été vu sur un appareil réel.** Chromium
   sous Playwright, machine de bureau Windows. La réduction à 421 px
   est simulée par deux `drawImage` en demi-pas, pas par le panneau
   lui-même.
