# IMMOBILIER — ARPENT

Un seul écran, 1440 × 900, arrêté. Courtage de propriétés.
Split vertical strict, fond ivoire, `dm-serif`.

> **Cette DA remplace la ligne 09 de `DIRECTIONS.md` (nuit `#0d1725` +
> or `#b8964f`) et l'inverse volontairement.** L'immobilier de prestige
> est sombre et doré partout, tout le temps ; c'est précisément pour ça
> qu'on ne le fait pas. Ce qui est conservé de la ligne 09 : `dm-serif`
> à l'affichage, `jetbrains-mono` pour les surfaces et les numéros de
> lot, les angles vifs, les filets de 1 px, et l'interdiction de tout
> prix. `DIRECTIONS.md` n'a pas été modifié par cette passe.

---

## Les trois références

Six sites ont été relevés à 1440 px. Trois sont écartés d'emblée et il
faut dire pourquoi, parce que l'échec est instructif :
**`marshallwhite.com.au`** (héros couvert par une modale « Market
Results » — relevé inexploitable, et navy + serif capitale = le cliché
exact qu'on fuit) ; **`fortvega.com`** (mur de témoins, héros vide) ;
**`505statestreet.com`** et **`storeyarchitecture.co.uk`** et
**`basehabitation.com`** (les trois écrivent leur titre **sur** la
photo plein cadre — l'interdit numéro un de cette voie).

**Constat qui traverse les trois retenues, et qui n'était pas
attendu : aucune n'est sombre.** Le noir-et-or de l'immobilier vit
dans le courtage de franchise, pas dans le travail primé. Les deux
sites `siteinspire` sont sur blanc ou ivoire pur, et la lauréate CSSDA
est ivoire à 57 % de ses fonds relevés. **Retourner la luminance n'est
pas un pari contre la référence : c'est la référence.**

### 1 · Eleos — `https://eleos.la`

*CSS Design Awards — Website of the Day. Promoteur de logement
abordable, Los Angeles.*

**Ce qu'elle prouve.** Qu'un champ ivoire peut être le sujet, et la
photographie l'intrus. La capture du premier écran l'a saisie **en
pleine transition** : un masque à **arête franche, en marches
d'escalier**, découvre une photographie sombre depuis le coin
inférieur droit, pendant qu'une lettre géante en contre-forme ivoire
mord dans l'image. Le fond porte des **filets verticaux réguliers
(≈ 180 px, soit huit colonnes)** qui restent visibles sous tout le
reste. Aucune police d'affichage : le plus gros objet de l'écran
n'est pas du texte, c'est une **lettre employée comme forme**.

**Ce qu'on lui prend.** Trois choses. (a) L'ivoire comme **matière de
page**, pas comme absence de couleur. (b) Le **masque à arête franche**
— jamais un fondu — comme seul mécanisme de révélation. (c) La preuve
qu'un écran **saisi à mi-course** est plus fort qu'un écran au repos :
c'est directement de là que vient notre volet.

**Ce qu'on écarte.** La grille de colonnes visible (huit filets
verticaux sur notre écran écraseraient la ligne de partage, qui doit
rester la seule verticale forte). Les marches d'escalier du masque —
notre arête est **droite**. Et l'alternance ivoire / `#16151e` de
section en section : nous n'avons qu'un écran, il reste ivoire.

**Les chiffres du relevé.** Fond dominant `rgb(244,244,237)` = **#f4f4ed**,
57 occurrences, contre `rgb(22,21,30)` 33 fois. **Une seule famille sur
tout le site : « JB Mono »** — h1 à **13 px / 19,57 px** (interlignage
1,51), graisse 600, capitales, approche **−0,40 px** ; corps **15 px**.
Sept sections, padding vertical **113,5 px**. Page 6 979 px.
30 images, 7 grandes. GSAP + ScrollTrigger + Lenis.

### 2 · Edificio O'Higgins 1625 — `https://ohiggins1625.com/`

*`siteinspire`. Immeuble résidentiel, Belgrano, Buenos Aires — Chamber
× Adamo-Faiden.*

**Ce qu'elle prouve.** Que l'échelle typographique **est** la
composition. Trois mots à trois graisses et trois chasses différentes
— une grotesque très large pour « EDIFICIO », une didone pour
« O'HIGGINS », un chiffre « 1625 » aussi grand que le nom — remplissent
les 1440 px sans une marge et **sans un centrage** : chaque ligne est
calée à un bord différent. La photographie n'arrive qu'**en dessous**,
en bande bord à bord, coupée par le bas de l'écran. **Zéro mot posé
sur l'image.** Une ligne de nav de 11 px en haut à droite, une ligne de
lieu en haut à gauche, et rien d'autre.

**Ce qu'on lui prend.** (a) Le rapport d'échelle **brutal** entre
l'affichage et tout le reste : **115 px contre 14 px**, soit **× 8,2**,
sans aucun palier intermédiaire. (b) L'interlignage **inférieur à 1** :
115 px de corps pour **70,27 px** de ligne — **ratio 0,611**, les lignes
s'emboîtent. (c) La photographie **bornée** : une bande qui commence à
une ligne nette et qu'on ne franchit pas.

**Ce qu'on écarte.** Le mélange de trois familles d'affichage (nous
n'en avons qu'une, imposée). Les capitales intégrales — notre titre est
une **adresse**, en bas de casse, parce qu'une adresse se lit, elle ne
se crie pas. Et la bande photo horizontale : la nôtre est **verticale**,
c'est toute la différence de la voie.

**Les chiffres du relevé.** Fond `rgb(255,255,255)` 56 fois, noir
4 fois, **et rien d'autre** — deux couleurs. h1 **115 px / 70,27 px**,
graisse 400, casse normale, couleur `rgb(0,0,0)`. Corps **14 px**.
Quatre sections : 2 675 / 3 215 / 2 556 / 1 069 px. Page 21 768 px,
42 images dont 17 grandes. Lenis seul, aucun GSAP.

### 3 · 13 Crestwood Drive — `https://13crestwood.com/`

*`siteinspire`. Site d'une **seule** propriété, Ontario.*

**Ce qu'elle prouve.** **Qu'un écran unique suffit.** Le relevé donne
une hauteur de page de **900 px** : ce site *est* un premier écran, il
n'y a rien en dessous. Et ce qu'il met dedans, c'est **un seul objet**
— pas une photographie, un **dessin au crayon** de la maison — sur un
champ ivoire, avec trois libellés de 21 px aux trois coins hauts.
Aucune bibliothèque, aucun script, **une seule image**, **une seule
famille de police**. C'est le site le plus vide des six relevés et
c'est le plus cher à l'œil.

**Ce qu'on lui prend.** (a) La permission d'un écran unique tenu par
**un objet et des chiffres**, sans section de rattrapage. (b) L'ivoire
**légèrement rosé plutôt que blanc** — `#f8f6f7` chez lui, `#f2efe9`
chez nous : dans les deux cas, un blanc qui a une température, jamais
`#ffffff`. (c) **Zéro couleur d'accent** dans le champ : sa seule autre
teinte relevée est un sable `#e6d6c8`, employé **une fois**.

**Ce qu'on écarte.** Le centrage — son objet est au milieu de l'écran,
et c'est l'interdit explicite de notre voie. Le dessin au crayon : on
n'a pas d'illustration, et une propriété qui se vend se montre. Et le
corps à 21 px, trop grand pour une fiche de chiffres.

**Les chiffres du relevé.** Fond `rgb(248,246,247)` = **#f8f6f7**.
Une famille : « neue-haas-unica ». Corps **21 px**. h1 (menu de
contact) **64 px / 61 px** — interlignage **0,953**. Deux sections,
h = 374 (padding-top 90) et h = 830 (padding 40 / 40). **Hauteur de
page 900 px. 1 image. Aucune bibliothèque.**

---

## La direction artistique

| Poste | Décision |
|---|---|
| **Référence culturelle** | **Un extrait de plan cadastral, et la fiche du notaire agrafée à côté.** Pas un catalogue de vente aux enchères, pas une brochure de prestige : un **document d'arpentage**. La propriété n'est pas un rêve, c'est un **lot** — un numéro, une surface, une année. La photographie est la pièce jointe ; les chiffres sont l'acte. Le nom de l'agence, `ARPENT`, est l'ancienne mesure de terre québécoise : la marque **est** le concept |
| **Palette** | **ivoire `#f2efe9`** (le champ, la page, le volet) · **encre `#14120f`** (titre, filets structurants, chiffres — 16,3 : 1 sur l'ivoire) · **bleu de Prusse `#123a52`** (le seul accent : surtitre, pavé du bouton — 10,4 : 1 sur l'ivoire, et l'ivoire rend 10,4 : 1 sur lui) · **gris pierre `#6e6a63`** (tout libellé secondaire — **4,69 : 1** sur l'ivoire, calculé, au-dessus du seuil) · **filet pierre `#cfc9bf`** (traits de 1 px **uniquement** — y compris le contour du filigrane, qui est fait de traits et non d'un caractère peint). **Cinq valeurs, pas six.** Rien de posé n'est or, orange ni vert. Le bleu n'apparaît **que** là où le visiteur peut agir ou situer — surtitre et bouton — plus le **pignon en bardeaux et les volets** de la photographie, qui sont le seul bleu naturel de l'écran et le seul endroit où la palette existe sans être posée. **Ce que la photographie apporte et que la palette n'admettrait pas** : une bande de plantation au pied de la façade — arbustes verts, paillis, herbe dormante — soit **2,58 % de vert et 6,92 % de chaud** de la tranche après filtre. C'est mesuré, c'est le prix de la correction du 2026‑08‑01, et c'est écrit ici plutôt que caché — voir « Le fichier photo » |
| **Typographie** | **Deux familles, et rien d'autre.** **`dm-serif`** (400, seule graisse au dépôt, pas d'italique) — titre **80 px / interlignage 74 px (0,925)** sur deux lignes, **et les chiffres de la fiche à 32 px**, plus le mot-symbole à 21 px. **`jetbrains-mono`** (500, seule graisse au dépôt) — surtitre, localité et libellés de fiche à **11 px** capitales, approche **0,14 em** ; sous-titre à **13 px / 20 px**, bas de casse, approche 0,01 em ; libellé de bouton **12 px** capitales 0,12 em ; descripteur de nav **10 px**. **Le saut d'échelle est 80 → 13, soit × 6,2, sans palier** — la leçon d'O'Higgins, tenue. **`dm-serif` porte les CHIFFRES, pas seulement le titre** : c'est le geste typographique de signature, et aucun des onze autres ne le fait |
| **Composition du premier écran** | **1440 × 900. Split vertical strict, ligne de partage à x = 720.**<br>· **Photographie** : x **0 → 719** (720 px), y **0 → 899**, bord à bord, pleine hauteur.<br>· **Ligne de partage** : filet **1 px encre `#14120f`** en x = **720**, de y 0 à y 899. Nette, continue, jamais interrompue.<br>· **Champ ivoire** : x **721 → 1439** (719 px). **Colonne de contenu x 784 → 1376 (592 px), gouttières de 63 px des deux côtés.**<br>· **Bandeau de nav** y 0 → 72, fermé par un **filet 1 px encre en y = 72**, x 721 → 1439. Mot-symbole `ARPENT` `dm-serif` 21 px encre, x = 784, ligne de base **y = 44**. Descripteur `COURTAGE IMMOBILIER` mono 10 px caps, gris pierre, x = **866**, même ligne de base. Trois liens de nav mono 11 px caps 0,14 em gris pierre, **alignés à droite sur x = 1376**, écarts de 28 px, ligne de base y = 44.<br>· **Surtitre** mono 11 px caps 0,14 em **bleu de Prusse**, x = 784, ligne de base **y = 120**.<br>· **Titre** `dm-serif` 80 px / 74 px, encre, x = 784, haut de bloc **y = 156**, **deux lignes** (bases ≈ y 216 et y 290), bas de bloc y = 304.<br>· **Localité** mono 11 px caps 0,14 em gris pierre, x = 784, base **y = 340**.<br>· **Sous-titre** mono 13 px / 20 px encre, x = 784, une seule ligne, base **y = 380**.<br>· **LE REGISTRE — un chiffre qui domine, puis quatre. y 424 → 752.** Cinq rangs de même corps ne composent pas, ils **tabulent** : la première passe alignait cinq nombres de 32 px et l'écran se lisait comme un formulaire. Le registre est donc coupé en deux.<br>&nbsp;&nbsp;· **Le bloc maître**, y **424 → 592** (168 px), ouvert par un **filet 1 px ENCRE en y = 424**. *Libellé* `SUPERFICIE HABITABLE` mono 11 px caps 0,14 em gris pierre, x = 784, base **y = 456** ; *chiffre* `178` `dm-serif` **84 px** encre, aligné à droite sur x = 1308, base **y = 552** ; *unité* `M²` mono 11 px, à gauche de x = 1320, **même ligne de base que le chiffre**. **C'est la superficie et non le terrain** parce que la photographie montre le **bâtiment** : le chiffre qui domine doit décrire ce qu'on voit.<br>&nbsp;&nbsp;· **Les quatre rangs secondaires**, **40 px** chacun, filets **1 px `#cfc9bf`** en **y = 592, 632, 672, 712**, **filet de fermeture 1 px ENCRE en y = 752**. Dans chaque rang, *libellé*, *chiffre* `dm-serif` **24 px** et *unité* partagent **une seule ligne de base, haut + 26** — c'est ce partage qui en fait une **liste** et non quatre compositions. Rapport d'échelle **84 / 24 = × 3,5**, sans palier.<br>&nbsp;&nbsp;· **L'encre ouvre et ferme, le filet sépare.** Trois épaisseurs, pas quatre : la hiérarchie est portée par le **corps**, jamais par un trait plus lourd. La colonne à **1308** ne bouge pas d'un rang à l'autre, bloc maître compris — c'est la seule verticale qui tienne le registre debout, et l'unité reste **sortie** du nombre, sinon « 178 m² » et « 2021 » ne peuvent pas se caler.<br>· **LE FILIGRANE — la seconde lecture, et la seule qu'il y ait.** Le numéro de lot une deuxième fois, `dm-serif` **94 px**, x **784 → 1160**, y **470 → 592** : dans le quart vide du bloc maître, sous le libellé, à gauche du 178. **En contre-forme** — intérieur ivoire, contour `-webkit-text-stroke: 1px #cfc9bf`. Aucune valeur n'est ajoutée à la palette et **aucun caractère n'est peint en filet** : ce sont des **traits de 1 px**, comme les séparations des rangs, pliés en chiffres. **Deux interdits qui l'ont borné** : il ne passe **jamais** derrière un libellé gris pierre — pierre sur ivoire ne rend que 4,69 : 1 et le moindre trait plus sombre derrière ferait tomber sous 4,5 — et il ne recouvre **pas** le 178, essayé à 122 px sur x 784 → 1308 : un filigrane qui traverse le chiffre dominant n'est plus une seconde lecture, c'est un troisième objet, et les deux masses s'annulent. Il vit **hors** de la `<dl>` et passe dessous par l'**ordre du document**, pas par un `z-index`.<br>· **Bouton** x **784 → 1064** (280 × 48), y **800 → 848**, pavé plein bleu de Prusse `#123a52`, libellé ivoire centré.<br>· **Coordonnées** mono 11 px gris pierre, **alignées à droite sur x = 1376**, bases y = **816** et y = **838**.<br>· Marge basse 848 → 900 = **52 px**. |
| **Le fichier photo** | **`images/secteurs-sites/immobilier-16.webp`** (1920 × 1080). **Cadrage : `object-fit: cover` dans une boîte de 720 × 900, `object-position: 78% center`.** Le calcul : la boîte est plus haute que large (ratio 0,80) alors que la source est en 16/9 — la couverture impose un facteur **0,8333** (900 / 1080), l'image affichée fait **1600 × 900**, elle déborde **880 px** en largeur, et 78 % de 880 = **686 px de décalage**. On voit la tranche **x 824 → 1688 de la source**, soit **45 % de sa largeur, prise entre 42,9 % et 87,9 %**. Ce que cette tranche rend : **le pignon entier**, sa **diagonale de toit** qui traverse le cadre, l'**arête verticale du bâtiment sur toute la hauteur**, la **baie de fenêtres à volets** dont le vitrage est franchement bleu, le **porche à colonnes en fuite**, le **soubassement de pierre**, et une bande de plantation au pied. **Le sommet du pignon tombe à x = 293** — relevé, pas estimé — soit **18 px à droite de la lisière du volet** : à l'arrêt, la maison sort du volet par sa pointe. À 82 % il tomberait à 257, sous le volet, et l'écran arrêté ne montrerait plus qu'une pente de toit.<br>**Pourquoi celle-là, après en avoir essayé une autre.** La première passe avait pris `immobilier-2` (1280 × 720, plain-pied photographié de face) parce qu'elle était la plus **froide**. Elle l'était ; elle ne tenait pas la moitié de l'écran pour autant. Une façade **large** découpée en **portrait** ne rend qu'un morceau de mur : la tranche était du bardage plat sur ses deux tiers hauts et une porte de garage sur son tiers bas. **Le défaut est géométrique, pas photographique** — et la leçon est qu'une source se juge **sur la tranche de 720 × 900 qu'elle rendra**, jamais sur l'image entière.<br>**Les seize, rejugées sur leur tranche.** `immobilier-1` (1920 × 1080, la plus nette) reste rejetée : ses coussins jaune-vert sont présents à **tous** les cadrages, 2,48 % de vert mesuré dans la bande visible même à 100 %. `immobilier-10` a de la profondeur mais un manteau de cheminée franchement orange et un téléviseur noir au centre du cadre — la définition même de la fiche MLS. `immobilier-12` est un intérieur vide et terne, et son cadre de miroir doré n'est hors champ qu'aux cadrages les plus faibles. `immobilier-3` est propre de couleur (0,13 % de vert) mais sa tranche est une moitié de mur blanc et une cuisine **jaune**. `immobilier-13` un plancher **orange**, `immobilier-7` un toit de tuile **rouge**, `immobilier-4` un bardage **vert**, `immobilier-15` un bois chaud dans une forêt verte.<br>**Ce que le plan disait de `-16` et pourquoi c'était faux.** « Montre une **rangée** de maisons : on vend **un** lot. » C'est vrai de l'**image entière** — trois logements, dont un à bardage vert, et une voiture rouge. Ce n'est **pas** vrai de la tranche : entre 42,9 % et 87,9 % il n'y a **qu'une** maison, avec son garage attenant. Et elle est en **1920 × 1080** : 864 px de source pour 720 px affichés, donc **réduite** de 0,83, quand `immobilier-2` était **agrandie** de 1,25. C'est la plus définie des deux, de loin |
| **Formes** | **Rayon 0 partout.** Aucune ombre, aucun dégradé, aucun flou, aucune transparence. **Trois épaisseurs de filet et pas quatre** : 1 px encre pour ce qui **structure** (partage, nav, fermeture du registre), 1 px `#cfc9bf` pour ce qui **sépare** (les rangs de la fiche), et rien d'autre. Le pavé du bouton est un **rectangle plein**, pas un contour. **Dispositif de signature : la verticale.** L'écran ne contient qu'une seule ligne verticale au repos — le partage à x = 720 — et le geste en fabrique une **deuxième**, temporaire. Toutes les autres lignes sont horizontales. Un écran qui n'a que deux directions |
| **Traitement photo** | **Aucun duotone, aucun virage chaud, aucun noir et blanc.** `filter: saturate(.74) contrast(1.05) brightness(1.02)`. **0,74 et non 0,86** : le seul poste de couleur qui contredise la palette est la bande de plantation au pied de la façade, et 0,74 est la valeur la plus basse qui l'éteigne **sans griser les volets**. Mesuré sur la tranche : vert **2,86 → 2,58 %**, chaud **9,20 → 6,92 %**, bleu **17,0 → 14,65 %**. À 0,62 le bleu tombe avec le vert et la façade devient un gris uniforme — essayé, écarté. **Le bleu du pignon et des volets reste bleu et c'est délibéré** : le ciel est couvert, donc c'est désormais le bâtiment lui-même qui porte le seul endroit de l'écran où la couleur d'accent existe sans avoir été posée par nous. Aucun masque, aucune vignette, aucun grain |
| **Le geste et l'instant de capture** | **LE VOLET DE CADASTRE — un seul geste, et il n'y en a pas d'autre.** Au premier rendu, un **volet ivoire `#f2efe9` plein** couvre toute la moitié gauche : l'écran s'ouvre sur une **page blanche et une fiche**. Le volet **se retire vers la gauche**, arête verticale franche, de x = 720 à x = 0, en **900 ms**, `cubic-bezier(.16, 1, .3, 1)`. Sa **lisière porte un filet de 1 px encre** — la même matière que la ligne de partage : c'est la ligne de partage qui se dédouble et s'en va. Direction justifiée : la page s'ouvre **depuis le registre vers la propriété**, la fiche est le dos du cahier ; et le volet **s'éloigne** des chiffres, donc rien ne recouvre jamais un nombre. Au repos, la photographie est bord à bord sur ses 720 px.<br>**L'INSTANT DE CAPTURE : la lisière du volet à x = 275 (± 8 px).** La photographie est alors visible sur **445 px** (275 → 720) et l'ivoire tient les 275 px de gauche. **445 / 720 = 0,618 et 275 / 445 = 0,618** — le partage secondaire tombe exactement sur la section d'or, ce qui est la raison du chiffre. L'écran arrêté montre **trois bandes verticales — ivoire 275, photographie 445, ivoire 719 — et deux filets encre à x = 275 et x = 720.** Le sommet du pignon tombe à **x = 293**, soit **18 px à droite de la lisière** : la maison est en train de sortir du volet, par sa pointe. *(Cette cote était fausse dans la première rédaction : elle donnait x ≈ 334 pour `immobilier-2`, alors que le relevé rend **x = 403** — « la maison sort du volet » n'a jamais été vrai de cette image-là. Les deux valeurs sont maintenant relevées par sonde, pas estimées.)*<br>**Comment figer exactement cette image** : `animation-delay: -340ms` puis `animation-play-state: paused !important`. **Le `!important` n'est pas décoratif** — `animation` est un raccourci qui réarme `animation-play-state: running` (piège 16). Ne pas tenter de saisir l'image « au vol » : on photographierait une autre course à chaque passe.<br>**`prefers-reduced-motion`** : pas de volet du tout, photographie à 720 px dès le premier rendu. Aucune information n'est portée par le mouvement |
| **Ce qu'on ne fait pas** | **Aucun montant, nulle part** — ni prix, ni « à partir de », ni évaluation municipale, ni fourchette, ni « valeur estimée ». La fiche porte **une surface, un terrain, des pièces, une année, un numéro de lot**, et c'est tout ; `node tools/prix-check.mjs` doit rester à zéro. Aucun « VENDU », aucun « NOUVEAU », aucun « coup de cœur ». **Aucun mot sur la photographie**, jamais, même pas un crédit. **Aucun centrage** : tout est calé sur x = 784 ou sur x = 1376. Aucune photographie plein cadre. Aucun mur typographique — l'écran porte **une** phrase de texte courant. Pas de barre de recherche, pas de carte, pas de calculateur d'hypothèque, pas de filtres, pas de portrait de courtier, pas de logo de bannière, pas de note, pas de témoignage, pas de pastille de carrousel. Aucun coin arrondi, aucune ombre, aucun dégradé, aucun flou. Et **aucun élément d'APED** : ni minium `#e2401f`, ni ciment, ni sa grotesque, ni ses quatre verbes |

---

## Le contenu exact

**Nom fictif de l'entreprise :** `ARPENT` — *arpent*, l'ancienne mesure
de terre québécoise. Vérifié : aucun courtier ni agence de ce nom ne
ressort d'une recherche sur le courtage immobilier au Québec.

### Bandeau de nav

| Rôle | Texte exact |
|---|---|
| Mot-symbole | `ARPENT` |
| Descripteur | `COURTAGE IMMOBILIER` |
| Nav 1 | `PROPRIÉTÉS` |
| Nav 2 | `ÉVALUATION` |
| Nav 3 | `CONTACT` |

### Bloc de titre

| Rôle | Texte exact |
|---|---|
| Surtitre | `FICHE DE LOT — INSCRIPTION 2026` |
| Titre, ligne 1 | `412, chemin du` |
| Titre, ligne 2 | `Vieux-Moulin` |
| Localité | `SAINTE-ANNE-DE-SABREVOIS · MONTÉRÉGIE` |
| Sous-titre | `Chaque propriété est décrite par ses chiffres avant de l'être par ses adjectifs.` |

*La coupe du titre est **manuelle** et ne se laisse pas au navigateur :
`412, chemin du` puis `Vieux-Moulin`. **L'adresse appartient à
l'écran, pas au fichier photo** : `tools/_inventaire.mjs` n'associe
aucune adresse à `immobilier-16.webp`, qui y figure comme « bande
pleine largeur ». La première rédaction s'appuyait sur l'adresse que
l'inventaire donne à `immobilier-2.webp` ; ce n'est plus le cas, et
cette ligne le dit plutôt que de laisser croire à une cohérence qui
n'existe plus.*

### La fiche de lot — un chiffre puis quatre

| # | Libellé (mono 11 px caps) | Chiffre (`dm-serif`, aligné à droite sur x = 1308) | Unité (mono 11 px, alignée à gauche sur x = 1320) |
|---|---|---|---|
| **maître** | `SUPERFICIE HABITABLE` | `178` — **84 px** | `M²` |
| 2 | `TERRAIN` | `608` — 24 px | `M²` |
| 3 | `PIÈCES · CHAMBRES` | `9 · 4` — 24 px | *(aucune)* |
| 4 | `ANNÉE DE CONSTRUCTION` | `2021` — 24 px | *(aucune)* |
| 5 | `NUMÉRO DE LOT` | `4 782 106` — 24 px | *(aucune)* |

*Le séparateur de milliers est une **espace fine insécable** (`&#8239;`),
pas une virgule : c'est la convention québécoise, et un client la
reconnaît. Le numéro à sept chiffres est le format réel du cadastre du
Québec — une **forme** vraie, sur un lot inventé. Le point médian du
rang 3 se répond d'une colonne à l'autre : `PIÈCES · CHAMBRES` /
`9 · 4`. Le numéro de lot est passé en **dernier rang** : son écho
géant est juste au-dessus, et les deux se lisent l'un par l'autre.*

***Trois chiffres ont suivi l'image.** La fiche doit décrire ce que le
visiteur **voit**. La maison retenue est à **étage** et **neuve** —
jeune arbre tuteuré, plantations récentes, paillis frais — donc
l'année passe de **2004 à 2021**. Les lots de ce lotissement sont
**étroits**, une façade de ~13 m ; **1 042 m²** exigerait 80 m de
profondeur et un client le contesterait au téléphone, donc le terrain
passe à **608 m²**. `178 m²` et `9 · 4` tiennent tels quels pour une
maison à étage de cette emprise.*

### Bouton et coordonnées

| Rôle | Texte exact |
|---|---|
| Bouton (pavé bleu de Prusse) | `DEMANDER LA FICHE COMPLÈTE` |
| Coordonnée, ligne 1 | `000 000-0000` |
| Coordonnée, ligne 2 | `courriel@exemple.ca` |

*Si une adresse postale devait apparaître dans une passe ultérieure, ce
serait « Adresse sur demande » — mais cet écran n'en porte pas : il n'y
a pas la place, et un pied de page n'existe pas sur un écran unique.*

### Le texte alternatif de la photographie

`Façade d'une maison à étage, vue de trois quarts : pignon en
bardeaux ardoise, fenêtres à volets, porche à colonnes sur
soubassement de pierre, ciel couvert.`

*L'ancien texte — « plain-pied », « ciel dégagé » — décrivait
`immobilier-2` et serait devenu faux mot pour mot.*

---

## Ce qui me distingue des onze autres

**Composition.** Je suis le seul des douze dont le premier écran est
**coupé en deux par une ligne visible** : une photographie pleine
hauteur bord à bord sur 720 px, un registre de chiffres sur les 719
autres, et **pas un caractère posé sur l'image** — là où les onze
autres noient la photographie sur tout l'écran, la posent en grille, ou
écrivent dessus.

**Couleur.** Je suis le seul en **ivoire `#f2efe9` et bleu de Prusse
`#123a52`**, et le seul immobilier à **refuser l'or** : là où la
direction 09 disait nuit + or, je retourne la luminance, ce qui me
sépare aussi du seul autre bleu foncé du lot — Construction, qui est
bleu **sur fond sombre** quand je suis bleu **sur fond clair**.

**Typographie.** Je suis le seul où l'affichage sert à écrire des
**nombres** : `dm-serif` porte les chiffres de la fiche à 32 px autant
que le titre à 80 px, contre un `jetbrains-mono` qui ne dépasse jamais
13 px — **deux familles, zéro sans-serif**, et un saut d'échelle de
× 6,2 sans un seul palier au milieu.
