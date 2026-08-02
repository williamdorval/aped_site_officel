# BOUTIQUE — GRÈS SAULNIER

*Un seul écran, 1440 × 900, arrêté. Atelier-boutique de céramique
utilitaire : grès, vaisselle, pièces d'atelier. **Un seul objet, énorme,
au centre, posé sur un aplat de couleur pleine.** Aucune grille de
vignettes, aucune photographie plein cadre, aucun split gauche/droite.*

> **Le nom change par rapport à `DIRECTIONS.md`.** La ligne 04 y écrivait
> « GRÈS DU NORD ». « Nord » se lit *département du Nord*, pas Québec, et
> une recherche rend une douzaine d'ateliers français de ce registre.
> **GRÈS SAULNIER** — patronyme québécois courant, aucun résultat en
> recherche pour l'entreprise. `DIRECTIONS.md § 04` est à reprendre sur
> ce seul mot ; tout le reste de la ligne 04 tient.

---

## Les trois références

Neuf sites relevés à `node tools/refs-releve.mjs … 1440`, trois retenus.
Les six écartés le sont pour une raison mécanique ou pour une raison
nommée, jamais « je n'aime pas » :

| Écarté | Pourquoi |
|---|---|
| `kevalaceramics.com` *(Awwwards HM)* | le premier écran relevé est un **préchargeur bloqué à `0 %`** — `0-heros.png` pèse 14,8 ko et ne montre rien. Aucun premier écran à mesurer |
| `objectandtotem.com` | c'est **exactement l'interdit de ma voie** : huit vignettes de vase alignées 4 × 2 dès le premier écran. Utile comme contre-modèle, pas comme référence |
| `stonessa.com` | `h1` **Montserrat 32 px, capitales, interlettrage 3,84 px, blanc sur photo sombre** — le gabarit du métier, celui qu'on reconnaît sur trois cents boutiques |
| `notaryceramics.com` | carrousel à puces, `h1` = *« Notary Ceramics LLC »*, police unique **Abel** partout, fond `#ffffff` × 88 |
| `sculpd.co.uk` | deux bandeaux promotionnels, un **compte à rebours** et une pastille « 30 % OFF » avant même le titre. Interdit ici (aucun prix, aucune promesse) |
| `heathceramics.com` | belle référence, mais **sombre** (`#26211b`) et son dispositif est **une carte posée sur une photo** — la voie 09 (immobilier) est déjà là-dessus. Retenue en appui : son `h1` fait **30 px / 33 px**, ce qui confirme la leçon de Mud ci-dessous |

---

### 1 · Ōmbia Studio — `https://ombiastudio.com/`

*Awwwards **Site of the Day**, catégories E-Commerce / Gallery /
Interaction Design. Céramique sculpturale construite à la main,
Los Angeles.*

**Ce qu'elle prouve.** Qu'**un objet de céramique se présente comme un
spécimen, pas comme un produit.** Son premier écran n'est pas une
boutique : c'est une **planche de figures** — huit vignettes de tournage
en noir et blanc, éparpillées, chacune sous-titrée `Fig. 1` à `Fig. 8`,
sur du noir absolu. Aucun prix, aucun bouton, aucune promesse. Le geste
de fabrication EST l'argument de vente. C'est la seule des neuf qui
comprend que dans ce métier on ne vend pas un bol, on vend la main qui
l'a fait — et c'est un SOTD, donc ça se défend devant un jury.

**Les chiffres du relevé.** `h1` = « ŌMBIA STUDIO », **90 px /
interlignage 85,5 px → 0,95**, famille **Univers**, graisse 400,
capitales, `rgb(255,255,255)` sur fond de corps `rgb(0,0,0)` · corps
déclaré 1 px *(le corps est un conteneur vide : le vrai texte est dans
les figures)* · quatre sections de **900 · 1055 · 1229 · 754 px**,
paddings **135 px / 135 px** · fonds fréquents : blanc × 9, noir × 6 ·
14 images, 6 au-dessus de 380 px · **aucune bibliothèque détectée**
(GSAP, ScrollTrigger, Lenis, Locomotive, Three, Framer, Swiper, Barba,
CSS piloté au défilement : tous faux) · hauteur de page relevée
**900 px** — l'écran d'entrée verrouille la fenêtre, il n'y a rien à
défiler tant qu'il joue.

**Ce qu'on lui prend.** Deux choses. **(1) La légende de spécimen.**
`Fig. n` en monospace sous l'objet, avec sa description technique et
rien d'autre — pas d'adjectif, pas de « magnifique », pas de « notre
best-seller ». Chez moi ce sera `FIG. 01` en `jetbrains-mono`, calé au
fer à droite dans la gouttière droite, sous un filet de 240 px. **(2)
L'interlignage de 0,95 à 90 px** : la preuve qu'à cette échelle on
serre. Je serre plus fort encore, mais je pars de sa mesure.

**Ce qu'on écarte.** Le noir, évidemment — je suis en clair chaud. Et
surtout **l'éparpillement** : ses huit figures forment une grille
déguisée (deux rangs de quatre, décalés). Huit objets, c'est zéro objet.
J'en prends **un**, et je lui donne les 600 px du milieu. On écarte
aussi le verrouillage de la fenêtre : un écran qui retient le visiteur
avant de lui montrer quoi que ce soit est un péage, pas une entrée.

---

### 2 · East Fork — `https://www.eastfork.com/`

*Poterie de grès, Asheville. La boutique DTC de céramique la plus citée
dans les galeries de design e-commerce.*

**Ce qu'elle prouve.** Qu'une boutique de grès **tient son écran sur un
blanc chaud et une seule couleur d'appui**, et que le CSS piloté au
défilement suffit — pas de GSAP, pas de Lenis, pas de Locomotive. C'est
la démonstration que ma contrainte technique n'est pas un handicap : le
site le plus abouti du métier n'embarque aucune bibliothèque
d'animation.

**Les chiffres du relevé.** Fond de corps `rgb(255,255,255)`, mais le
fond réellement dominant du document est **`rgb(244,243,237)` compté
54 fois** — un blanc cassé chaud, pas du blanc · blanc pur × 21 · noir
× 9 · **`rgb(108,145,131)` × 4 → `#6C9183`, un vert sauge**, et c'est le
seul accent chromatique de la page hors une occurrence unique de
`rgb(255,69,0)` · corps 16 px « Galano Classic », affichage « Toma » ·
**`scrollDrivenCSS: true`**, toutes les autres bibliothèques fausses ·
hauteur 5 617 px · 74 images, 6 au-dessus de 380 px · **module vertical
strict** : les hauteurs de section relevées sont 721 · 721 · 401 · 401 ·
721 · 721 · 488 · 488 · 721 · 721 · 720 · 720 · 1096 · 1096 — trois
valeurs seulement, chacune doublée.

**Ce qu'on lui prend.** Le **couple fond chaud + un seul vert sauge**,
mesuré chez elle et non inventé : `#F4F3ED` / `#6C9183`. Je décale les
deux vers l'argile (`#E7DFD2`) et vers un sauge un peu plus terreux
(`#7E8F6E`), pour que le beige tienne le fond d'un écran entier sans
virer au gris. Et je lui prends la **discipline du module** : trois
valeurs verticales et pas trente.

**Ce qu'on écarte.** Son premier écran, entièrement. C'est un **split
gauche/droite** : photographie plein hauteur à gauche (x 0 → 720),
titre + paragraphe + bouton centrés à droite. Interdit dans ma voie, et
de toute façon c'est la mise en page de deux mille boutiques Shopify.
On écarte aussi son **empilement de barres** — bandeau d'annonce, barre
de recherche, ligne de catégories en italique, bandeau de nav brun :
**quatre bandes horizontales avant la première image**. Chez moi, un
seul bandeau de 76 px et un filet.

---

### 3 · Mud Australia — `https://mudaustralia.com/`

*Porcelaine coulée à la main depuis 1994. La marque de vaisselle dont
la couleur EST le catalogue — la collection se lit par teintes, pas par
formes.*

**Ce qu'elle prouve.** Deux choses opposées, et c'est ce qui la rend
utile. **(1)** Qu'une maison de céramique peut construire toute son
identité sur **une famille de neutres chauds très resserrée** — les
fonds relevés sont `#F8F6F1`, `#E4E0D9`, `#EFECE3`, `#FBF9EE`, quatre
valeurs qui tiennent dans un mouchoir. C'est la palette exacte de ma
voie, mesurée sur le site qui l'exploite le mieux. **(2)** Qu'un titre
de héros **peut être trop petit**, et qu'on le paie : son `h1` fait
**28 px sur un interlignage de 35 px — un rapport de 1,25**. Sur un
premier écran de 1440 × 900, ça disparaît. On lit la photographie
d'intérieur, puis les mots. C'est le contre-exemple dont j'avais besoin
pour justifier de monter à 124 px.

**Les chiffres du relevé.** `h1` = « The Pop Lamp, now in Yellow »,
**28 px / 35 px**, NeueHaasUnicaPro-Light, graisse 400, `rgb(46,51,51)`
· corps 16 px, même famille · **deux familles en tout** (Light et
Medium) · fonds : blanc × 5, `rgb(248,246,241)` × 3, `rgb(228,224,217)`
× 3, `rgb(231,231,231)` × 2, `rgb(242,248,244)`, `rgb(251,249,238)`,
`rgb(239,236,227)` · deux sections de **6 708 px** et **1 841 px** ·
hauteur 8 122 px · 29 images, 12 au-dessus de 380 px · aucune
bibliothèque détectée.

**Ce qu'on lui prend.** La **famille de neutres chauds**, et la
discipline des **deux familles typographiques**. Je monte à trois, mais
la troisième est un monospace qui ne sert qu'aux données.

**Ce qu'on écarte.** Le `h1` à 28 px, frontalement — c'est la mesure
qui fixe la mienne par opposition. Et sa **photographie d'intérieur
plein cadre** : un salon en béton avec un poêle, une chaise rouge, un
tabouret bleu, un canapé orange et sept lampes. Sept objets, cinq
couleurs, aucun sujet. Ma voie interdit l'orange et le bleu, et
interdit la photographie de fond : **un objet, un fond, rien d'autre.**

---

## La direction artistique

*Sept postes. Un tableau à sept colonnes ferait 2 400 px de large et
serait illisible : il est posé en lignes, comme dans `DIRECTIONS.md`.
Aucun intitulé demandé n'est absent.*

| Poste | Décision |
|---|---|
| **Référence culturelle** | **Le catalogue de vente par correspondance japonais, et la vitrine unique d'une galerie d'objets.** Un objet, un fond de couleur, beaucoup d'air, une légende technique en petit. Le modèle mental : on ne feuillette pas, on **regarde une chose**. La composition est **frontale et sur l'axe** — le titre au centre, l'objet au centre, un satellite de chaque côté — parce que c'est ainsi qu'on présente une pièce sur une étagère, pas comme on range un rayon. Le contre-modèle explicite est `objectandtotem.com` : huit vases en grille, et plus aucun d'eux n'existe. |
| **Palette (hex nommés)** | **argile `#E7DFD2`** — le fond, plein cadre, 1440 × 900, un seul ton, zéro texture · **sauge `#7E8F6E`** — la bande au sol, **seule masse de couleur d'appui**, ≈ 10 % de la surface · **aubergine `#3B2431`** — le titre, les filets, l'aplat plein du bouton · **prune `#4A3742`** — le texte courant et la légende, uniquement *(une valeur de la famille aubergine, pas une quatrième teinte)* · **encre pâle `#6B5661`** — la mention de démonstration, uniquement · **grès `#AFA699`** — **on ne la pose pas, la photographie l'apporte** : c'est le fond propre de `boutique-11.webp`, mesuré par deux chemins concordants (canvas sur le `.webp` et relecture d'une capture PNG de la page qui l'affiche : `#afa699` des deux côtés). Elle est nommée ici pour que personne ne la « corrige ».<br><br>**Contrastes calculés (WCAG 2.1, sRGB linéarisé, pas `color-mix` — piège 6) :** aubergine/argile **10,7 : 1** · prune/argile **8,3 : 1** · argile/aubergine (le bouton) **10,7 : 1** · encre pâle/argile **5,1 : 1**. Les quatre passent AA en petit corps, trois passent AAA. **La bande sauge ne porte aucun texte, et c'est délibéré** : argile sur sauge tombe à **2,6 : 1** et aubergine sur sauge à **4,1 : 1** — deux échecs. La bande est une masse, pas un support. |
| **Typographie (familles + tailles px + interlignage)** | **`fraunces` 900** — affichage, une seule occurrence sur l'écran : le titre à **124 px**, interlignage **1,0** *(une seule ligne ; c'est la position de la ligne de base qui est fixée, pas l'avance)*, interlettrage **−0,02 em**. Et le nom de la maison à **21 px**, interlettrage −0,005 em. · **`karla` 400** — sous-titre **17 px / interlignage 28 px** (0,607 rapport ligne/corps → 1,65 en avance relative) · **`karla` 700** — nav **12 px**, interlettrage 0,18 em, capitales ; libellé du bouton **13 px**, interlettrage 0,16 em, capitales. *(**700, pas 600** : `fonts/demos/` ne contient que 400 et 700 pour Karla.)* · **`jetbrains-mono` 500** — légende **11 px / 20 px**, interlettrage 0,12 em ; coordonnées et mention **10 px**, interlettrage 0,14 em. *(**500, pas 400** : c'est la seule graisse présente.)*<br><br>**Trois familles, quatre faces, huit fichiers** : `fraunces-2/-3` (900), `karla-0/-1` (400), `karla-2/-3` (700), `jetbrains-mono-0/-1` (500). **On ne déclare PAS `fraunces-0/-1` (graisse 600) : elle n'est pas utilisée.** `<link rel="preload">` sur `fraunces-3.woff2` seulement — c'est la face du titre, et le titre est le seul texte visible avant l'image. Chemins `../../fonts/demos/…`, aucune requête vers `fonts.googleapis.com`.<br><br>**Métriques relevées de `fraunces` 900 à 124 px** *(rendu réel, encre scannée sur capture, pas une table)* : largeur de « Une pièce à la fois. » = **899,8 px** · hauteur de capitale du `U` = **88 px → 0,710 × corps** · **ligne de base à 106 px sous le haut de la boîte de ligne** · sommet de l'accent du `è` à **12 px** sous le haut de boîte · jambage du `p` à **134 px**, soit **10 px SOUS** le bas de la boîte · approche gauche **6 px** : l'encre est décentrée de **+2,1 px** dans sa boîte, donc **on décale le bloc de −2 px** pour le centrer optiquement. |
| **Composition du premier écran (au pixel)** | **Canevas 1440 × 900. Fond argile `#E7DFD2` plein cadre. Marge de page 80 px à gauche et à droite ; l'objet, lui, n'a pas de marge — il descend jusqu'au bord bas.**<br><br>**① LE BANDEAU — y 0 → 76.** Filet de **1 px aubergine `#3B2431`, de x 0 à x 1440, à y = 76**. Aucun fond : le bandeau est de l'argile. Les trois blocs sont centrés optiquement sur **y = 38**.<br>· *Nom*, `fraunces` 900 **21 px** aubergine, x **80 → 224,8** (largeur mesurée **144,8 px**), boîte y 25 → 51 : `Grès Saulnier`.<br>· *Mention de démonstration*, `jetbrains-mono` 500 **10 px** encre pâle `#6B5661`, ls 0,16 em, capitales, x **268 → 587,2** (mesuré **319,2 px**), boîte y 31,5 → 44,5.<br>· *Nav*, `karla` 700 **12 px** aubergine, ls 0,18 em, capitales, **fer à droite sur x = 1360**, bloc de **346,8 px** mesuré → x **1013,2 → 1360**, boîte y 31 → 45. Quatre libellés séparés de **28 px** : `BOUTIQUE` · `ATELIER` · `JOURNAL` · `PANIER (0)`.<br><br>**② LE TITRE — `<h1>`, une seule ligne, `fraunces` 900 124 px aubergine, ls −0,02 em, centré.** Boîte de ligne **y 98 → 222**, **ligne de base y = 204**. Sommet des capitales **y = 117**, sommet de l'accent **y = 110**, jambage du `p` **y = 232**. Boîte x **268 → 1168** *(centrage sur 720 = 270,1 → 1169,9, moins le décalage optique de 2 px)* ; encre de **274 à 1166**. Écart au filet du bandeau : **34 px**. Écart au sommet de l'objet : **68 px**.<br><br>**③ L'OBJET — la seule photographie, `images/secteurs-sites/boutique-11.webp`.** Carré de **600 × 600**, x **420 → 1020**, y **300 → 900** : **il est centré sur x = 720 et il est collé au bord bas.** 420 px d'air argile à sa gauche, 420 px à sa droite. `object-fit: cover`, **`object-position: 44% 40%`** — cadrage **relevé, pas deviné** : trois valeurs rendues côte à côte à 700 px et regardées ; `50% 50%` pousse la pile de bols vers le haut-gauche, `44% 30%` coupe la lèvre du bol extérieur, **`44% 40%` pose la pile au centre du carré, l'assiette sortant à gauche, à droite et en bas**. Échelle : source 960 × 720 → rendu 800 × 600 avant recadrage = **facteur 0,833, une réduction** ; jamais d'agrandissement. Attributs `width="960" height="720"` *(dimensions RÉELLES du fichier — CLS 0)*, `fetchpriority="high"`, **pas de `loading="lazy"`** : c'est le LCP.<br>· **Le filet du spécimen** : 1 px aubergine `#3B2431` **posé PAR-DESSUS** l'image via un `::after` en `inset: 0` (pas un `border`, qui rognerait la boîte de 2 px ; pas un `outline`, réservé au focus). Le côté bas tombe hors écran, on ne voit que trois côtés.<br><br>**④ L'APLAT — bande sauge `#7E8F6E`, x 0 → 1440, y 740 → 900 (1440 × 160), z-index SOUS la photographie.** Elle n'est donc visible que dans les deux gouttières, **x 0 → 420** et **x 1020 → 1440**, sur 160 px de haut. C'est le sol sur lequel la pièce est posée, et l'unique masse de couleur de l'écran.<br><br>**⑤ GOUTTIÈRE GAUCHE — colonne de 300 px, x 80 → 380** *(40 px d'écart avec le bord de la photographie)*.<br>· *Sous-titre*, `karla` 400 **17 px / 28 px** prune `#4A3742`, **3 lignes mesurées** dans 300 px, bloc **y 408 → 492**, lignes de base **428 · 456 · 484**.<br>· *Bouton*, rectangle **plein aubergine `#3B2431`, 236 × 56**, x **80 → 316**, y **532 → 588**. **Rayon 0, aucune ombre, aucun dégradé, aucun filet.** Libellé `karla` 700 **13 px** argile `#E7DFD2`, ls 0,16 em, capitales, largeur mesurée **132,2 px** → marges intérieures de **51,9 px** de chaque côté, ligne de base y ≈ **565**.<br>· *Coordonnées*, `jetbrains-mono` 500 **10 px** encre pâle, ls 0,14 em, capitales, deux lignes, lignes de base **640** et **658** ; largeurs mesurées **251,6 px** et **140,6 px**. Elles s'arrêtent **82 px au-dessus de la bande sauge** — aucun texte ne la touche.<br><br>**⑥ GOUTTIÈRE DROITE — colonne de 240 px au fer à droite, fin sur x = 1360, x 1120 → 1360** *(100 px d'écart avec la photographie ; la colonne droite est plus courte et plus légère que la gauche, pour que l'écran ne se lise pas comme deux moitiés)*.<br>· *Filet* 1 px aubergine, **240 px de long, x 1120 → 1360, à y = 408** — il commence exactement à la hauteur du sous-titre de gauche.<br>· *Légende*, `jetbrains-mono` 500 **11 px / 20 px** prune, ls 0,12 em, capitales, **au fer à droite**, trois lignes, lignes de base **436 · 456 · 476**. Largeurs mesurées **55,5** · **205,9** · **190,1 px** — les trois tiennent dans 240.<br><br>**Rien d'autre. Aucun sixième bloc.** L'écran contient **une** photographie, **un** titre, **un** bouton, **une** légende, **une** masse de couleur. |
| **Formes** | **Angles vifs partout, rayon 0. Aucune ombre portée, aucun dégradé, aucun flou, aucun `backdrop-filter`, aucun grain, aucune texture.** Trois primitives et pas une quatrième : **l'aplat plein** (le fond, la bande sauge, le rectangle du bouton), **le filet de 1 px** (sous le bandeau, autour de la photographie, au-dessus de la légende), **le carré photographique** (600 × 600, un seul). Le bouton n'a ni flèche, ni icône, ni chevron, ni contour : un rectangle plein et deux mots. La photographie n'est pas détourée, pas masquée, pas arrondie : c'est **une plaque rectangulaire posée sur la couleur**, et c'est le dispositif de signature — la légende `FIG. 01` en fait une planche de catalogue. |
| **Traitement photo** | **Aucun filtre. Zéro.** Ni duotone, ni désaturation, ni virage, ni relèvement des hautes lumières, ni `mix-blend-mode`. La pièce est montrée telle qu'elle est sortie du four, en lumière du jour, sur son propre fond neutre — c'est le sujet du métier : la matière est le produit. Le seul traitement est **le cadrage**, et il est relevé (`44% 40%`, § composition). Le fond propre de l'image, **`#AFA699`**, est un neutre chaud plus sombre que l'argile `#E7DFD2` : **l'écart est voulu**, c'est lui qui fait exister la plaque sur le fond sans une seule ombre. **Une seule photographie sur l'écran** — les onze autres fichiers de `boutique-*.webp` ne sont pas utilisés. *Contrôle fait : image ouverte en taille réelle, aucune marque imprimée, aucune enseigne, aucun visage, aucun numéro civique. Elle montre trois bols emboîtés sur une assiette marbrée, et la légende dit exactement ça.* |
| **Le geste et l'instant de capture** | **UN SEUL GESTE — « L'HORIZON MONTE ».**<br>La bande sauge est ancrée au bord bas et **pousse depuis le sol** : `transform: scaleY(0) → scaleY(1)`, `transform-origin: 50% 100%`, sur les 160 px de sa boîte. **Durée 760 ms, courbe `cubic-bezier(.4, 0, .2, 1)`, départ à +200 ms après la peinture. Rien d'autre ne bouge sur l'écran** — pas le titre, pas la photographie, pas le bouton. Un `scaleY` sur un aplat de couleur unie ne déforme rien et tourne sur le compositeur ; aucune mise en page n'est recalculée, donc **CLS reste à 0**.<br><br>**INSTANT DE CAPTURE — défini par la GÉOMÉTRIE, pas par une horloge** *(piège 1 : lire la valeur dans la page, jamais dans l'image)*. On déclenche la capture quand `document.querySelector('.sol').getBoundingClientRect().height` vaut **80 ± 2 px**, soit **exactement la moitié**. Pour information seulement : avec cette courbe, la moitié est franchie à **x = 0,35 de la durée → t ≈ 266 ms dans le geste → ≈ 466 ms après la peinture** ; l'outil ne doit **pas** se caler sur ce nombre.<br><br>**Ce qu'on voit sur l'image arrêtée.** Dans les deux gouttières, la bande sauge fait **80 px** et son arête supérieure est à **y = 820**, alors qu'au repos elle est à **y = 740**. **Un écart de 80 px sur 840 px de largeur cumulée** : le sol n'est pas encore arrivé sous la pièce, et ça se voit sans rien avoir à comparer. C'est « une bande à mi-course », au sens littéral.<br><br>**La preuve exigée** *(CLAUDE.md règle B)* : cinq captures à `scaleY` = 0 · 0,25 · 0,50 · 0,75 · 1, dont les hauteurs de bande attendues sont **0 · 40 · 80 · 120 · 160 px**. Cinq états distincts, mesurables au pixel, et l'écart entre deux consécutifs est de 40 px — largement au-dessus de tout plancher de bruit. Si les cinq images se ressemblent, le geste est refait, pas expliqué.<br><br>**Repos et mouvement réduit.** L'état de repos **est** l'état final : bande à 160 px. `@media (prefers-reduced-motion: reduce)` rend `scaleY(1)` d'emblée, `animation: none`, `transition: none`. **Aucune information ne se perd** : la bande ne porte ni texte, ni lien, ni donnée — c'est une masse de couleur. Le titre, la photographie, la légende, le bouton, la nav et les coordonnées sont lisibles et utilisables sans une seule image de l'animation.<br><br>**Les micro-interactions** *(elles ne sont pas le geste, mais `STANDARD.md § 2.2` les exige sur chaque cible)* : **le bouton s'inverse** au `:hover` et au `:focus-visible` — fond argile, filet 1 px aubergine, texte aubergine, **140 ms** *(l'inversion garde 10,7 : 1 ; passer le fond en sauge tomberait à 2,6 : 1, donc c'est interdit)*. **Les libellés de nav** reçoivent un filet de 1 px aubergine qui **se trace de gauche à droite** (`transform: scaleX(0 → 1)`, `transform-origin: left`, 160 ms) — la direction suit le sens de lecture. **La photographie**, si elle est cliquable, passe son filet de 1 px à 2 px, sans rien d'autre. Anneau de focus partout : `outline: 2px solid #3B2431; outline-offset: 3px`.<br><br>**Ce que je ne fais PAS, et pourquoi c'est un argument.** `STANDARD.md § 2.2` demande aussi « un dispositif interactif sans script » et « un mouvement continu ». **Les deux sont écartés ici, volontairement.** Un dispositif interactif — sélecteur d'émail, accordéon, `:target` — exige du contenu à révéler, et il n'y en a pas : l'écran s'arrête à 900 px et **on n'invente jamais du contenu pour occuper de l'espace** (§ 5). Un mouvement continu sur un écran qui ne défile pas est une boucle décorative qui tourne dans le vide. Le § 2.2 décrit un site de dix sections ; le mandat ici est **un écran**, et un écran n'a droit qu'à **un** geste. |
| **Ce qu'on ne fait pas** | **Pas de grille de vignettes, pas de rangée de produits, pas de carrousel, pas de puces de diapositive** — c'est l'erreur d'`objectandtotem.com` (huit vases en 4 × 2) et de `notaryceramics.com`. · **Pas de photographie plein cadre, pas de photo en fond, pas de vidéo** : le fond est un aplat de `#E7DFD2`, un seul ton. · **Pas de split gauche/droite** — c'est le premier écran d'East Fork, et de deux mille boutiques Shopify. · **Aucune ombre, aucun dégradé, aucun flou, aucun coin arrondi, nulle part.** · **Aucun orange, aucun rouge vif, aucun bleu** — donc aucun minium `#e2401f`, aucun ciment, rien de l'identité d'APED. · **Aucun prix, aucun « à partir de », aucun rabais, aucun compte à rebours, aucun bandeau promotionnel** — c'est ce qui sort `sculpd.co.uk` du niveau visé. · **Aucune note, aucun avis, aucun témoignage, aucun logo de tiers, aucun « vu dans ».** · **Aucun chiffre inventé** : pas de nombre de pièces, pas d'année de fondation, pas de température de cuisson chiffrée, pas de diamètre — le seul chiffre de l'écran est le `(0)` du panier et le numéro de téléphone neutre. · **Pas de capitales espacées sur photo sombre** (`stonessa.com`), pas de `h1` à 28 px (`mudaustralia.com`), pas de quatre bandeaux empilés (`eastfork.com`). · **Pas de flèche « défiler »** : il n'y a rien sous les 900 px, et l'écran ne fait pas semblant qu'il y a une suite. |

---

## Le contenu exact

*Tout le texte de l'écran, prêt à coller. Rien d'autre ne s'affiche.*

**Nom de l'entreprise (fictive)**

```
Grès Saulnier
```

**Titre du héros — une seule ligne, `fraunces` 900, 124 px, bas de casse**

```
Une pièce à la fois.
```

> *Pourquoi cette phrase et pas une autre.* Elle **justifie la
> composition** : un écran qui ne montre qu'un seul objet doit dire
> pourquoi il n'en montre qu'un. Elle est **vraie et incontestable** —
> c'est une manière de travailler, pas un résultat mesurable ; il n'y a
> ni « meilleur », ni « unique », ni chiffre, donc rien qu'un client
> puisse contester au téléphone. Elle est **soutenue ailleurs dans
> l'écran** : le sous-titre dit « petites séries », la légende dit
> « FIG. 01 ». Elle est **sous notre contrôle**. Et un patron de garage
> la comprend en une seconde : ce n'est pas une usine. Le point final
> est délibéré — c'est une affirmation, pas un slogan.

**Sous-titre** *(gouttière gauche, `karla` 400, 17 px / 28 px, 3 lignes dans 300 px)*

```
Grès tourné au tour, émaillé et cuit à haute température. Petites séries, faites au Bas-Saint-Laurent.
```

**Libellés de nav** *(bandeau, au fer à droite, dans cet ordre de gauche à droite)*

```
BOUTIQUE
ATELIER
JOURNAL
PANIER (0)
```

**Libellé du bouton** *(unique sur l'écran)*

```
VOIR LES PIÈCES
```

**Légende de la pièce** *(gouttière droite, `jetbrains-mono` 500, 11 px / 20 px, au fer à droite)*

```
FIG. 01
TROIS BOLS ET UNE ASSIETTE
GRÈS ÉMAILLÉ · FAIT AU TOUR
```

**Texte de remplacement de l'image** *(`alt`)*

```
Trois bols de grès emboîtés l'un dans l'autre, posés sur une assiette marbrée, sur fond neutre.
```

**Coordonnées** *(gouttière gauche, deux lignes, `jetbrains-mono` 500, 10 px)*

```
000 000-0000 · COURRIEL@EXEMPLE.CA
ADRESSE SUR DEMANDE
```

**Mention obligatoire** *(bandeau, à droite du nom, `jetbrains-mono` 500, 10 px)*

```
SITE DE DÉMONSTRATION — ENTREPRISE FICTIVE
```

**`<title>` de la page**

```
Grès Saulnier — céramique utilitaire de grès · site de démonstration
```

*Et dans le `<head>` :* `<meta name="robots" content="noindex,nofollow">`.

**Ce qui ne figure nulle part sur cet écran** : aucun prix, aucune
adresse civique, aucun nom de personne, aucun nom de four ni de marque
d'émail, aucune note, aucun avis, aucun témoignage, aucun logo de tiers,
aucune date, aucune quantité. **Le seul chiffre de l'écran est le `(0)`
du panier ; le seul autre nombre est le numéro de téléphone neutre.**

---

## Ce qui me distingue des onze autres

**Composition.** Je suis le seul dont le premier écran est **frontal et
sur l'axe** : un titre centré, **un seul objet de 600 × 600 planté au
milieu et collé au bord bas**, et 420 px de gouttière de chaque côté où
ne vivent qu'un sous-titre, un bouton et une légende. L'objet occupe
**27,8 % de la surface** (360 000 px² sur 1 296 000) et **plus de la
moitié de l'écran ne porte rien du tout**. Les autres directions
remplissent — `DIRECTIONS.md` annonce un mur de capitales pleine largeur
au gym, une photographie plein cadre partout au 07, une grille de fiches
au 09, des colonnes de journal au 10. Chez moi c'est **le vide qui
désigne l'objet**, et une composition symétrique n'est pas de la
timidité : c'est la mise en page d'une vitrine.

**Couleur.** Je suis le seul en **clair chaud construit sur un beige
d'argile en fond de page** — `#E7DFD2` sur 100 % de la surface, sans
texture ni variation. Six des onze partent d'un fond sombre, le gym part
d'un acide, la clinique d'un glacier froid, le juridique d'un rose de
presse dense et réglé. Et je n'ai **qu'une seule masse d'accent sur tout
l'écran** : 160 px de sauge `#7E8F6E` collés au bord bas, soit 10 % de
la surface. Aucun orange, aucun rouge, aucun bleu, aucun minium.

**Typographie.** Je suis le seul à monter une **serif douce et un peu
gauche — `fraunces` 900 — à 124 px en bas de casse, avec un point
final**. Les autres montent des capitales (anton, oswald, bodoni,
space-grotesk) ou une transitionnelle sage. Une phrase en bas de casse
ponctuée à 124 px, ce n'est pas un titre de site : c'est **une ligne
écrite à la main sur une étiquette**, et c'est exactement le registre
d'un atelier qui vend ses propres pièces.

---

*Relevés déposés dans `tools/_refs/boutique-ombia/`,
`tools/_refs/boutique-eastfork/`, `tools/_refs/boutique-mud/` —
et, pour les écartés, `boutique-kevala`, `boutique-stonessa`,
`boutique-notary`, `boutique-sculpd`, `boutique-totem`,
`boutique-heath`.*
