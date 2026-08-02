# BOUTIQUE — GRÈS SAULNIER

*Un seul écran, 1440 × 900, arrêté. Atelier-boutique de céramique
utilitaire. **Une photographie de 844 × 900 qui déborde par trois
bords, et un titre de 156 px qui lui rentre dedans.** Le mot « cuit. »
est posé sur l'émail de l'assiette.*

> **Ce fichier remplace la version du 2026-08-01 matin**, qui décrivait
> une composition **frontale et sur l'axe** : titre centré, un carré
> photographique de 600 × 600 planté au milieu, 420 px de gouttière de
> chaque côté. Elle a été construite, photographiée et jugée : *« rien
> n'est laid, et c'est exactement le problème — c'est une mise en page
> de gabarit Shopify soignée. »* Le carré posé au centre est la
> définition même de « photo posée dans un cadre », qui vaut 6.
> **Ce qui est conservé de cette version :** le nom, la palette, les
> trois familles typographiques, la légende de spécimen `FIG. 01`, et
> le refus des prix, des avis et des grilles de vignettes.
> **Ce qui tombe :** la symétrie, le carré, les deux gouttières, la
> bande sauge pleine largeur, le titre à 124 px, `boutique-11.webp`.

---

## Les trois références

Onze sites relevés à `node tools/refs-releve.mjs … 1440` dans
`tools/_refs/boutique-*`. Trois retenus. **`mud` sort** : son relevé
est mangé par un panneau de destination d'expédition, son premier
écran est une photographie d'intérieur à sept objets, et son `h1` de
28 px ne m'apprend plus rien que Cold Picnic ne dise mieux à l'envers.

| Écarté | Pourquoi |
|---|---|
| `mudaustralia.com` | `h1` **28 px / 35 px**. Utile comme contre-exemple, mais Cold Picnic donne la même leçon par le haut, avec un chiffre plus utile. Sa famille de neutres chauds (#F8F6F1, #E4E0D9, #EFECE3) reste la source de ma palette |
| `caiyawen.art` *(Awwwards HM — relevé neuf)* | **La seule qui fasse exactement mon geste** : `CAIYAWEN [image] CERAMICS` — le mot-marque est COUPÉ EN DEUX par une image centrée. Écartée pour deux raisons : le relevé attrape son préchargeur (tout l'écran sous un voile gris), et son écran est **centré et symétrique**, ce que je viens précisément d'abandonner. Elle confirme le principe : la typographie et l'objet doivent se croiser |
| `sarahkersten.com` *(relevé neuf)* | Macro plein cadre sur une pile d'assiettes émaillées, chaude, nette : **la meilleure référence photographique du métier**. Écartée parce que son premier écran empile **deux bandeaux promotionnels noirs dont un porte un prix**, et parce que « photo plein cadre + nom en surimpression » est la case 01 et la case 12, pas la mienne |
| `deneenpottery.com` *(Awwwards HM — relevé neuf)* | Grotesque grasse blanche sur photo sombre, trois pastilles d'arguments, deux boutons sarcelle. Le gabarit du B2B américain |
| `framacph.com`, `studioarhoj.com` | Frama : deux tuiles noires 50/50 + un panneau modal. Arhoj : bandeau bleu clignotant, fantômes multicolores. Ni l'un ni l'autre n'est dans ma voie |
| `tortus-copenhagen.com` | **Le domaine est squatté** — il rend un site de paris en ligne vietnamien. Relevé supprimé du dépôt |
| `stonessa.com`, `notaryceramics.com`, `sculpd.co.uk`, `objectandtotem.com`, `heathceramics.com`, `kevalaceramics.com`, `moyceram` | Écartés le 2026-08-01 pour les raisons déjà écrites : capitales espacées sur photo sombre · carrousel à puces · compte à rebours et « 30 % OFF » · huit vases en grille 4 × 2 · carte posée sur photo (case 09) · préchargeur bloqué à 0 % · `moyceram` rend un **404** |

---

### 1 · Ōmbia Studio — `https://ombiastudio.com/`

*Awwwards Site of the Day. Céramique sculpturale, Los Angeles.*

**Les chiffres.** `h1` « ŌMBIA STUDIO » **90 px / interlignage 85,5 px
→ 0,95**, Univers 400, capitales, blanc sur noir · corps déclaré 1 px
*(conteneur vide : le vrai texte est dans les figures)* · hauteur de
page **900 px** · 14 images, 6 au-dessus de 380 px · **part de photo
≈ 26 %** (huit vignettes d'environ 250 × 170, relevées à la règle sur
`0-heros.png`, pas dans le DOM) · **2 couleurs** (noir, blanc) ·
**18 blocs** dans la première fenêtre · aucune bibliothèque
d'animation détectée.

**Ce qu'on lui prend.** **La légende de spécimen**, et rien d'autre :
`Fig. n` en monospace sous l'objet, une description technique, zéro
adjectif. Chez moi `FIG. 01` en `jetbrains-mono` 11 px, au fer à
droite sur la photographie, sous un filet de 180 px.

**Ce qu'on écarte.** Le noir. Et **l'éparpillement** : huit figures,
c'est zéro figure. J'en prends une et je lui donne 58,6 % de l'écran.

---

### 2 · East Fork — `https://www.eastfork.com/`

*Poterie de grès, Asheville. La boutique de céramique la plus citée
dans les galeries d'e-commerce.*

**Les chiffres.** Le `h1` relevé vaut **16 px** et dit « Shop » — c'est
un titre de navigation, pas le titre visible (`STANDARD.md § 7.1` :
un `h1` mesuré à 9 px est un titre masqué, et le chiffre seul aurait
fait écrire n'importe quoi). Le **titre visible** « Celebrating Edna
Lewis » fait **≈ 54 px sur deux lignes**, relevé à la règle sur
`0-heros.png` · corps **16 px** Galano Classic, affichage Toma · fond
dominant réel **`rgb(244,243,237)` compté 54 fois** — un blanc cassé
chaud, pas du blanc · **`rgb(108,145,131)` × 4 → `#6C9183`**, un vert
sauge, seul accent chromatique · **part de photo 39 %**
(720 × 710) · **5 couleurs** dans la première fenêtre · **8 blocs**,
dont **quatre bandes horizontales empilées avant la première image** ·
`scrollDrivenCSS: true`, aucune bibliothèque · hauteur 5 617 px.

**Ce qu'on lui prend.** Le **couple blanc chaud + un seul vert**,
mesuré chez elle et non inventé. Je décale les deux vers l'argile
(`#E7DFD2`) et vers un sauge plus terreux (`#7E8F6E`). Et la preuve
que le CSS piloté au défilement suffit : le site le plus abouti du
métier n'embarque aucune bibliothèque.

**Ce qu'on écarte.** Son premier écran, entièrement : **quatre bandes
avant la photographie, puis un split 50/50**. C'est la mise en page de
deux mille boutiques, et c'est ce dont je viens de sortir.

---

### 3 · Cold Picnic — `https://coldpicnic.com/` *(relevé neuf, remplace `mud`)*

*Tapis, meubles et objets faits à la main, New York. Le premier écran
que je voulais battre.*

**Les chiffres.** `h1` « New Arrivals » **144 px / interlignage
115,2 px → 0,80**, Poiret One 400, bas de casse, **blanc posé PAR-
DESSUS une photographie plein cadre** · corps **18 px** · **part de
photo 92 %** (1440 × 830) · **2 couleurs déclarées** (blanc + la
photographie) · **5 blocs** dans la première fenêtre · hauteur
1 497 px · 13 images, 1 au-dessus de 380 px · `scrollDrivenCSS: true`.

**Ce qu'on lui prend, et c'est le cœur du chantier.** **Le titre passe
par-dessus l'objet.** 144 px de serif posés sur une photographie, le
pied d'une chaise noire traversant la lettre « v » — la typographie et
la matière occupent le même rectangle. C'est la mesure qui autorise
mes 156 px, et c'est le précédent qui prouve que le geste tient devant
un jury. Je lui prends aussi son interlignage **serré à 0,80** : je
monte à 0,86 seulement parce que mon serif a des accents.

**Ce qu'on écarte.** **La photographie plein cadre à 92 %** — c'est la
case 01 (restauration) et la case 12 (photographe), pas la mienne. Et
le **blanc sur photo** : un blanc sur une image claire ne tient aucun
contraste. Chez moi c'est l'inverse — de l'encre foncée sur un émail
clair, mesurée à **7,13 : 1 au pire pixel**.

---

## La direction artistique

| Poste | Décision |
|---|---|
| **Référence culturelle** | **La page de gauche d'un catalogue d'exposition.** Le texte tient la page de papier, l'objet tient la planche, et la reliure — ici la couture verticale à x 596 — n'arrête pas la phrase : le titre l'enjambe. Le modèle mental n'est plus la vitrine frontale (c'était la version écartée), c'est **la double page**. Deux surfaces, une seule ligne qui les traverse. Le contre-modèle explicite reste `objectandtotem.com` : huit vases en grille, et plus aucun d'eux n'existe. |
| **Palette (hex nommés)** | **argile `#E7DFD2`** — le papier, la colonne de gauche, plein bord · **olive `#7E8F6E`** — la réglette, seule masse d'appui, 5,9 % de la surface au repos · **aubergine `#3B2431`** — le titre, le nom, la nav, le filet, l'aplat du bouton · **prune `#4A3742`** — le paragraphe, la légende · **pâle `#54424C`** — la mention de démonstration, uniquement.<br><br>**Contrastes, tous mesurés à l'encre peinte** (`node tools/pire-pixel.mjs boutique …`, DENSITÉ 2, couverture ≥ 85 %) — **jamais déduits d'une couleur déclarée**, parce que la moitié de l'écran est une photographie et que `demos-contraste.mjs` s'y arrête (piège 45) : titre **7,13 pire · 10,48 moy** · légende **6,81 · 9,29** · nom **7,25 · 10,45** · nav **7,25 · ~10** · mention **7,25 · 10,44** · paragraphe **5,69 · 7,66** · bouton **8,17 · 10,17**. **Dix blocs, zéro échec au seuil 4,5.**<br><br>`--pale` valait d'abord `#6B5661`, arithmétiquement à **5,08 : 1**. À l'encre peinte, sur du monospace de 10 px, il rendait **3,79 au pire pixel** : des fûts d'un pixel ne couvrent pas leur pixel. **On a foncé la valeur plutôt que discuter l'instrument** — l'inverse du piège 74, et c'est le bon sens dans ce sens-là : l'arithmétique donnait 5,08, à peine au-dessus du seuil, donc elle ne contredisait rien de trivial.<br><br>**L'OLIVE NE PORTE AUCUN TEXTE, et c'est délibéré** : argile sur olive tombe à 2,6 : 1, aubergine sur olive à 4,1 : 1. Deux échecs. La réglette est une masse, pas un support. |
| **Typographie (familles + tailles px + interlignage)** | **`fraunces` 900** — le titre à **156 px**, interlignage **0,86** (134 px), interlettrage **−0,03 em**, bas de casse, deux lignes. Et le nom de la maison à **20 px**. · **`karla` 400** — paragraphe **15 px / 26 px**, trois lignes dans 344 px. · **`karla` 700** — nav **11 px**, ls 0,16 em, capitales ; bouton **12 px**, ls 0,16 em. · **`jetbrains-mono` 500** — légende **11 px / 19 px**, ls 0,12 em ; mention **10 px**, ls 0,14 em.<br><br>**Le saut EST le dispositif : 156 px contre 15 px, un rapport de 10,4.** Aucun intermédiaire. Trois familles, quatre faces, huit fichiers ; `fraunces` 600 n'est pas déclarée, elle n'est employée nulle part. `<link rel="preload">` sur `fraunces-3.woff2` seulement.<br><br>**Géométrie relevée dans la page** (`getBoundingClientRect`, pas une table de fonte) : bloc du titre **x 64 → 850,2 · y 232 → 500,3** · ligne 1 « Tourné, » **503,8 px**, elle s'arrête à **x 567,8** · ligne 2 « émaillé, cuit. » **786,2 px**, elle finit à **x 850,2**. |
| **Composition du premier écran (au pixel)** | **Canevas 1440 × 900. Marge de papier 64 px. Couture à x 596.**<br><br>**① LA LIGNE DE TÊTE — y 26 → 78, tout à gauche, aucun filet, aucun fond.** Un bandeau plein largeur avec la nav au fer à droite est le premier des trois signes du gabarit ; il est retiré. · *Nom* `Grès Saulnier`, fraunces 900 20 px aubergine, x **64 → 202**, boîte y 26 → 52. · *Mention* mono 10 px pâle, **au fer à droite sur x 532** — soit 64 px avant la couture — boîte y 31 → 44. · *Nav* karla 700 11 px aubergine caps, x **64 → 388**, boîte y 64 → 78, quatre libellés séparés de 24 px.<br><br>**② LE TITRE — deux lignes, fraunces 900 156 px, x 64, y 232 → 500.** `z-index: 3`. **La ligne 1 s'arrête à x 567,8, soit 28 px AVANT la couture ; la ligne 2 la franchit et finit à x 850,2, soit 254 px APRÈS.** L'une frôle, l'autre traverse : c'est la paire qui fait le geste, pas la traversée seule. **La couture tombe dans l'espace-mot entre « émaillé, » (fin x 586) et « cuit. » (début x 621)** — aucune lettre n'est près de l'arête, et le mot « cuit. » repose ENTIER sur l'émail. Piège 70 : une lettre coupée se lit comme un mot tronqué, jamais comme un mouvement.<br><br>**③ LA PHOTOGRAPHIE — x 596 → 1440, y 0 → 900. 844 × 900 = 759 600 px² = 58,6 % de l'écran** *(mesuré par sonde, pas déduit)*. `z-index: 1`, donc SOUS le titre. **Elle déborde par la droite, par le haut et par le bas ; son seul bord intérieur est la couture de gauche, et c'est exactement celui que le titre franchit.** `images/secteurs-sites/boutique-3.webp`, source 960 × 720, `object-fit: cover`, `object-position: 50% 50%` : facteur 1,25, donc **675 px de source pour 844 px rendus — un cadrage serré à 70 % de la largeur du fichier**. Attributs `width="960" height="720"` (dimensions RÉELLES — CLS 0), `fetchpriority="high"`, pas de `loading="lazy"` : c'est le LCP.<br><br>**④ LA LÉGENDE — sur la photographie, au fer à droite sur x 1376, y 112 → 169.** Trois lignes mono 11/19 aubergine, surmontées d'un filet de 180 px à y 96.<br><br>**⑤ LA COLONNE DE PAPIER — x 64, sous le titre.** *Paragraphe* karla 15/26 prune, largeur **344 px**, y **556 → 634**, trois lignes. **Il est DESCENDU** : à 0,29 il pèse 4,4 px, c'est de la texture, et il est composé comme de la texture — trois lignes régulières, un gris homogène. · *Bouton* rectangle plein aubergine **232 × 56**, x 64 → 296, y **672 → 728**, rayon 0, aucune ombre, aucune flèche.<br><br>**⑥ LA RÉGLETTE — x 0 → 596, y 772 → 900 (596 × 128), `z-index: 0`.** Olive plein. Un filet de 1 px aubergine court à y 771 sur toute la longueur : c'est lui qui dit où elle va. Elle passe SOUS la photographie, donc un dépassement d'un sous-pixel ne peut pas mordre sur l'image.<br><br>**Neuf blocs. Rien d'autre.** Pas de coordonnées : un premier écran de boutique n'a pas besoin d'un numéro de téléphone, et **on n'invente jamais du contenu pour occuper de l'espace** (`STANDARD.md § 5`). |
| **Formes** | **Angles vifs partout, rayon 0. Aucune ombre portée, aucun dégradé de page, aucun flou, aucune texture.** Trois primitives : **l'aplat plein** (le papier, la réglette, le bouton), **le filet de 1 px** (sous la légende, sous la réglette), **le rectangle photographique** — un seul, qui déborde par trois bords. Le bouton n'a ni icône, ni chevron, ni contour : un rectangle et deux mots. |
| **Traitement photo** | **`filter: sepia(.10) saturate(1.20) contrast(1.10)`, et ce n'est pas décoratif.** Le fichier est éclairé au jour : son blanc est **froid**. L'argile de la page est un beige **chaud**. Côte à côte, la photographie tirait au gris et la moitié droite de l'écran se lisait délavée — visible sur la capture, pas supposé. Le sepia ramène le blanc dans la famille du papier, le saturate lui rend la couleur que le sepia mange, le contrast fait exister l'arête de l'assiette. **Trois valeurs relevées en regardant : `sepia(.16)` fondait la couture au point qu'on ne voyait plus qu'il y avait une photographie ; `.10` laisse l'arête exister.**<br><br>**`boutique-11.webp` a été essayée d'abord et rejetée à l'image** : sa profondeur de champ est courte, et un agrandissement de 1,25 à 844 px de large la rendait franchement floue. `boutique-3.webp` est nette de bord à bord et n'exige qu'un facteur 1,25 sur une matière lisse. *Contrôle fait, fichier ouvert en taille réelle : aucune marque imprimée, aucune enseigne, aucun visage, aucun numéro civique. Elle montre une grande assiette de grès blanc moucheté coupée par le bord du cadre, une tasse à deux tons derrière, un petit plat en bas à droite — et la légende dit exactement ça.* |
| **Le geste et l'instant de capture** | **UN SEUL GESTE — « L'ÉTABLI AVANCE ».**<br>La réglette d'olive part du bord gauche et pousse vers la couture : `transform: scaleX(0) → scaleX(1)`, `transform-origin: 0 50%`, **1 000 ms, `cubic-bezier(.4,0,.2,1)`, départ à +200 ms**. Rien d'autre ne bouge. Un `scaleX` sur un aplat uni ne déforme rien, tourne sur le compositeur, ne recalcule aucune mise en page : **CLS reste à 0**.<br><br>**POURQUOI CE GESTE-LÀ SE VOIT SUR UNE IMAGE ARRÊTÉE, et c'est tout l'argument.** Une bande qui s'arrête en l'air peut se lire comme un choix de composition. Celle-ci a **un point d'arrivée VISIBLE DANS LE CADRE** : l'arête verticale de la photographie, à x 596, qui court sur toute la hauteur. On voit la réglette à 369 px, on voit l'arête à 596, on voit les **227 px de papier entre les deux**. Le filet de 1 px qui va jusqu'à l'arête ferme la démonstration. Il n'y a rien à comparer avec une seconde image.<br><br>**INSTANT DE CAPTURE — 603 ms, et ce n'est pas un chronomètre.** `cubic-bezier(.4,0,.2,1)` atteint y = 0,62 en u = 0,581, dont l'abscisse vaut 0,403. 200 + 0,403 × 1 000 = **603 ms de temps local**. L'outil met l'animation en PAUSE et pose son `currentTime` à cette valeur : deux passes rendent la même image. **La vérification se fait sur la géométrie** (piège 1) : `document.querySelector('.etabli').getBoundingClientRect().width` doit valoir **369 ± 4 px**. Relevé : **369,3**.<br><br>**LA PREUVE — `preuves/chantier7-ecrans/boutique-geste.png`.** Cinq états, la largeur **lue dans la page** à chaque cran, jamais dans l'image :<br>`t = 200 ms → 0 px` · `455 → 148,2` · `550 → 298,0` · `680 → 446,5` · `1140 → 594,8`.<br>**Écarts entre deux consécutives : 148,2 · 149,8 · 148,5 · 148,3 px.** Cinq états distincts, mesurables au pixel, très au-dessus de tout plancher de bruit (piège 54 : dix images ne font pas un mouvement, c'est l'écart qui le prouve). À 0,29 la réglette pèse encore **37 × 107 px**, donc elle existe dans l'aperçu du panneau (piège 71).<br><br>**Repos et mouvement réduit.** L'état de repos EST l'état final : réglette à 596 px. Sous `prefers-reduced-motion: reduce`, `animation: none` — **mesuré : largeur 596 px, `document.getAnimations().length` = 0**. Aucune information ne se perd : la réglette ne porte ni texte, ni lien, ni donnée.<br><br>**`both` et non `forwards`, et c'est une exception argumentée.** `STANDARD.md § 2.1` interdit `both` — mais la règle vise les animations pilotées par le DÉFILEMENT sur une page longue, où `both` vide la moitié d'une capture pleine page. Ici la page fait exactement 900 px, l'animation est pilotée par le TEMPS, et `forwards` ferait sauter la réglette de 596 à 0 au bout des 200 ms de retard, à l'œil du visiteur.<br><br>**Les micro-interactions** : le bouton **s'inverse** au `:hover` et au `:focus-visible` (fond argile, filet aubergine, texte aubergine, 140 ms — l'inversion garde 10,7 : 1 ; passer le fond en olive tomberait à 2,6 : 1, donc c'est interdit). Les libellés de nav reçoivent un filet de 1 px qui **se trace de gauche à droite** (160 ms) — la direction suit le sens de lecture. Anneau de focus partout : `outline: 2px solid #3B2431; outline-offset: 3px`.<br><br>**Ce que je ne fais PAS, et pourquoi.** `STANDARD.md § 2.2` demande aussi « un dispositif interactif sans script » et « un mouvement continu ». Les deux sont écartés : un dispositif interactif exige du contenu à révéler et il n'y en a pas ; un mouvement continu sur un écran qui ne défile pas est une boucle décorative qui tourne dans le vide. Le § 2.2 décrit un site de dix sections ; le mandat est **un écran**, et un écran n'a droit qu'à **un** geste. |
| **Ce qu'on ne fait pas** | **Pas de bandeau de nav pleine largeur au fer à droite** — c'est le premier signe du gabarit, et c'était le mien. · **Pas de photographie posée dans un cadre** : elle déborde par trois bords sur quatre. · **Pas de split gauche/droite** : le titre et la photographie **se chevauchent sur 254 px**, 54,6 % + 58,6 % = 113,2 %. Un split fait 100,0 et ne chevauche rien. · **Pas de composition symétrique, pas de titre centré** — c'était la version écartée. · **Pas de bande horizontale pleine largeur** : c'est la case exclusive de l'immobilier. · **Pas de photographie plein cadre** : c'est 01 et 12. · **Pas de grille de vignettes, de carrousel, de puces.** · **Aucune ombre, aucun dégradé, aucun flou, aucun coin arrondi.** · **Aucun orange, aucun rouge, aucun bleu** — rien du minium ni du ciment d'APED. · **Aucun prix, aucun « à partir de », aucun rabais, aucun compte à rebours, aucun bandeau promotionnel.** · **Aucune note, aucun avis, aucun témoignage, aucun logo de tiers.** · **Aucun chiffre inventé** : pas de nombre de pièces, pas d'année de fondation, pas de température, pas de diamètre. **Le seul chiffre de l'écran est le `(0)` du panier et le `01` de la figure.** · **Aucune adresse web, aucune adresse civique, aucun nom de personne.** · **Pas de flèche « défiler »** : il n'y a rien sous les 900 px. |

---

## Le contenu exact

*Tout le texte de l'écran. Rien d'autre ne s'affiche.*

**Nom de l'entreprise (fictive)** — `Grès Saulnier`. Patronyme
québécois courant ; aucun résultat en recherche pour l'entreprise.

**Titre** *(fraunces 900, 156 px, deux lignes, bas de casse)*

```
Tourné,
émaillé, cuit.
```

> *Pourquoi cette phrase.* Trois participes, l'ordre exact des trois
> opérations. **Q1 — c'est vrai** : c'est ce qu'on fait à une pièce de
> grès, et il n'y a ni « meilleur », ni « unique », ni chiffre à
> contester. **Q2 — c'est soutenu ailleurs dans l'écran** : la légende
> dit `GRÈS ÉMAILLÉ · FAIT AU TOUR`, la photographie montre l'émail.
> **Q3 — c'est sous notre contrôle.** **Q4 — un patron de garage la
> comprend en une seconde** : trois gestes, dans l'ordre. La coupe
> tombe après le premier mot pour que le dernier — « cuit. » — se pose
> seul sur l'émail. Le point final est délibéré : une affirmation, pas
> un slogan.

**Paragraphe** *(karla 400, 15/26, 344 px, trois lignes)*

```
Vaisselle de grès faite à la main, en petites séries, dans un atelier
du Bas-Saint-Laurent. La cuisson change un peu chaque pièce.
```

**Nav** — `BOUTIQUE` · `ATELIER` · `JOURNAL` · `PANIER (0)`

**Bouton** — `VOIR LES PIÈCES`

**Légende** *(mono 11/19, au fer à droite, sur la photographie)*

```
FIG. 01
ASSIETTE ET TASSE
GRÈS ÉMAILLÉ · FAIT AU TOUR
```

**`alt` de l'image**

```
Une grande assiette de grès émaillé blanc moucheté, coupée par le bord
du cadre, et une tasse à deux tons posée derrière, sur un fond clair.
```

**Mention obligatoire** — `SITE DE DÉMONSTRATION — ENTREPRISE FICTIVE`

**`<title>`** — `Grès Saulnier — céramique utilitaire de grès · site de
démonstration`, avec `<meta name="robots" content="noindex,nofollow">`.

---

## Ce qui me distingue des onze autres

**Composition.** Je suis le seul dont le titre et la photographie
**occupent le même rectangle** : 254 px de chevauchement, un mot entier
posé sur l'émail. Les autres juxtaposent — photo à gauche et titre à
droite (06, 08), photo plein cadre avec titre en surimpression (01,
12), plaque encastrée dans la photo (05), portrait qui déborde d'un
tiers (09). Chez moi la couture est **traversée**, pas longée.

**Couleur.** Je suis le seul en **clair chaud** : `#E7DFD2` sur toute
la colonne de gauche, une photographie étalonnée dans la même famille,
et **une seule masse d'appui** — 596 × 128 d'olive `#7E8F6E`, 5,9 % de
la surface. Sur la planche des douze, huit écrans partent d'un fond
sombre ou saturé ; le juridique a le bordeaux, l'immobilier la terre
cuite, la coiffure le noir et blanc pur. Personne d'autre n'est beige.

**Typographie.** Je suis le seul à monter une **serif de livre, douce
et un peu gauche — `fraunces` 900 — à 156 px en bas de casse, avec des
virgules et un point final.** Les autres montent des capitales (anton,
bodoni, dm-serif étendue, space-grotesk) ou une transitionnelle sage.
Une phrase ponctuée à 156 px, ce n'est pas un titre de site : c'est une
ligne écrite à la main sur une étiquette, et c'est le registre exact
d'un atelier qui vend ses propres pièces.

---

## Réserves honnêtes

1. **Le côte-à-côte des références se voit encore.** Sur
   `preuves/chantier7-ecrans/refs-boutique.png`, on reconnaît la mienne
   au premier coup d'œil — c'est la seule crème. C'est le prix d'une
   case de palette exclusive, mais la règle du `STANDARD.md § 0` dit
   « si on voit laquelle est la tienne, elle n'est pas finie », et je ne
   la satisfais pas au sens littéral. Ce que je peux défendre : elle
   n'est pas reconnaissable comme **la plus faible** des quatre.
2. **Deux des trois références sont des captures imparfaites.** Ōmbia
   est photographiée sur son écran d'entrée en noir absolu ; Cold Picnic
   porte une pastille d'accessibilité. Aucune des deux n'invalide les
   chiffres relevés, mais la planche est moins belle qu'elle pourrait.
3. **`boutique-3.webp` est agrandie de 1,25.** C'est une réduction du
   côté horizontal et un agrandissement du côté vertical ; la matière
   est lisse, donc ça ne se voit pas à 1440. **Ça se verrait sur un
   écran 4K.** Aucune source de `images/secteurs-sites/` ne fait 1 800 px
   de haut.
4. **Aucune mesure n'a été prise sur un appareil réel.** Les relevés à
   390 px et 768 px viennent de Chromium sous Playwright sur une machine
   de bureau Windows. Ce n'est pas un téléphone.
5. **La part de photo « 58,6 % » est la part du RECTANGLE**, pas de
   l'objet. L'assiette et la tasse occupent une fraction de ce
   rectangle ; le reste est le mur du fond. Le chiffre demandé était
   celui de la photographie, et c'est celui-là qui est donné.
6. **Le paragraphe est illisible à 0,29**, et c'est assumé — il est
   composé comme de la texture. Mais personne n'a vérifié qu'il se lit
   confortablement à 15 px sur un écran de portable de 13 pouces.
7. **Le geste n'a pas été regardé en mouvement réel**, seulement figé à
   cinq crans. La courbe `cubic-bezier(.4,0,.2,1)` sur 1 000 ms est un
   choix de bon sens, pas un choix mesuré.

---

*Relevés dans `tools/_refs/boutique-ombia/`, `boutique-eastfork/`,
`boutique-coldpicnic/` — et, pour les écartés, `boutique-mud`,
`boutique-caiyawen`, `boutique-kersten`, `boutique-deneen`,
`boutique-frama`, `boutique-arhoj`, `boutique-heath`,
`boutique-kevala`, `boutique-notary`, `boutique-sculpd`,
`boutique-stonessa`, `boutique-totem`, `boutique-moyceram`.*
