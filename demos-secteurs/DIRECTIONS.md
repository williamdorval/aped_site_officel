# Les douze directions artistiques — PREMIÈRE FOURNÉE, DÉPASSÉE

> **CE FICHIER N'EST PLUS LA RÉFÉRENCE.** Depuis le 2026-08-01, la DA
> de chaque métier vit dans `demos-secteurs/plans/<clé>.md`, et elle
> est écrite **à partir de trois références mondiales relevées et
> regardées** — ce qui manquait ici. Quand les deux se contredisent,
> **c'est le plan qui gagne**, et il dit pourquoi.
>
> Ce qu'on lui doit encore : la **carte des douze**, ci-dessous, qui
> reste le seul endroit où la distance entre les métiers se voit d'un
> coup d'œil. Les noms d'entreprise fictifs viennent d'ici aussi, et
> les plans les gardent quand ils tiennent.
>
> Les écarts déjà actés par les plans : **04** s'appelle *Grès
> Saulnier* et non *Grès du Nord* (une douzaine d'ateliers réels
> portent le second) · **05** passe du rouge de signalisation
> `#d81e2e` (5,07 : 1) au cramoisi `#a5122b` (7,7 : 1) · **09** quitte
> nuit + or — le cliché du métier — pour l'ivoire · **10** assombrit
> son gris de légende, qui échouait à 4,34 : 1 sur du mono de 10 px.

Une par métier. **Écrites avant de coder, et écrites ensemble** — parce
qu'une DA ne se juge pas seule : elle se juge à côté des onze autres.
C'est la seule façon d'éviter que douze sites bien faits soient douze
fois le même site.

**Trois sont des projets réels** et ne se refont pas. Ils fixent une
contrainte aux neuf autres : **les trois portent de l'orange, donc
aucun des neuf n'a droit à l'orange.**

---

## La carte des douze — pour voir la distance d'un coup d'œil

| # | Métier | Fond | Accent | Affichage | Clair / sombre | Formes |
|---|---|---|---|---|---|---|
| 01 | Restauration *(réel)* | encre `#14100e` | braise `#e07a3f` | didone | **sombre** | vif |
| 02 | Garage *(réel)* | noir `#0d0d0d` | orange `#ff5b23` | condensée caps | **sombre** | vif |
| 03 | Paysagement *(réel)* | blanc | ambre dégradé | géométrique | **clair** | arrondi 12 px |
| 04 | Boutique | argile `#e9e1d5` | émaux (céladon, oxyde, sable) | `fraunces` | **clair chaud** | vif, gros aplats |
| 05 | Coiffure | blanc pur `#fff` | rouge `#d81e2e` | `bodoni-moda` | **clair froid** | vif, colonnes de magazine |
| 06 | Hébergement | sapin `#0f2019` | os `#e8e0cd` | `cormorant` | **sombre froid** | vif, filets de laiton |
| 07 | Gym | acide `#d6f227` | noir | `anton` | **clair saturé** | vif, plein cadre |
| 08 | Clinique | glacier `#eef4f8` | bleu `#1b4f7a` | `outfit` | **clair froid** | **arrondi 20–999 px** |
| 09 | Immobilier | nuit `#0d1725` | or `#b8964f` | `dm-serif` | **sombre froid** | vif, filets fins |
| 10 | Juridique | papier rose `#fff1e5` | bordeaux `#6d1a2c` | `libre-baskerville` | **clair chaud** | vif, réglures de journal |
| 11 | Photographe | noir `#000` | **aucun** | `instrument-serif` | **sombre neutre** | vif, marges énormes |
| 12 | Construction | bleu de plan `#0a2540` | cyan `#3fc8e8` | `space-grotesk` | **sombre froid** | vif, quadrillage |

**Les collisions surveillées, et comment elles sont tenues :**

- **06 / 09 / 12** sont trois sombres froids. Ils tiennent par le
  registre : 06 est une **antique fine et de la nature**, 09 une
  **serif d'affichage et de la photographie de propriété**, 12 une
  **grotesque technique et du trait de dessin**. Vert / marine+or / bleu
  de plan+cyan.
- **04 / 10** sont deux clairs chauds. 04 est une **galerie d'objets**
  très aérée, 10 un **journal** dense et réglé. Beige d'argile contre
  rose de presse.
- **05 / 08** sont deux clairs froids. 05 est **anguleux, noir et
  rouge, en colonnes** ; 08 est **arrondi partout, bleu pâle, très
  aéré**.
- **01 / 02** se ressemblent déjà — sombres et orange. Ce sont les deux
  projets réels. On ne les touche pas ; c'est noté aux réserves.

---

## 04 · BOUTIQUE EN LIGNE — **GRÈS DU NORD**

*Céramique utilitaire, atelier et boutique.*

| Poste | Décision |
|---|---|
| **Référence culturelle** | Une galerie d'objets et un catalogue de vente par correspondance japonais. Un objet, un fond de couleur, beaucoup d'air |
| **Palette** | argile `#e9e1d5` (fond) · papier `#f7f3ec` · encre `#221f1a` · trois **émaux** qui servent de fond aux produits : céladon `#93a78c`, oxyde `#7d4a3a`, sable `#cdb894` |
| **Typographie** | `fraunces` 900 pour l'affichage (serif douce, un peu gauche, chaleureuse) · `karla` pour le texte · `jetbrains-mono` pour les codes de pièce |
| **Formes** | Angles vifs. **Des aplats de couleur pleine largeur** derrière chaque produit — c'est le dispositif de signature. Aucune ombre, aucun dégradé |
| **Mouvement** | La **couleur de fond de la page change** au passage d'un produit à l'autre (`animation-timeline: view()` sur `background-color`) · le produit **grandit de 94 % à 100 %** en entrant · la collection défile **latéralement** en `scroll-snap` |
| **Traitement photo** | Aucun filtre. Lumière naturelle, fond neutre. Cadrage **carré** pour les produits, panoramique pour l'atelier |
| **Ce qu'on ne fait pas** | Pas de grille de vignettes. Un produit = un écran |

## 05 · COIFFURE ET ESTHÉTIQUE — **SALON BRUME**

| Poste | Décision |
|---|---|
| **Référence culturelle** | Un magazine de mode. Colonnes étroites, légendes en italique, une seule couleur qui claque |
| **Palette** | blanc pur `#ffffff` · noir `#0a0a0a` · rouge `#d81e2e` · gris de légende `#6e6e6e`. **Trois couleurs, pas quatre** |
| **Typographie** | `bodoni-moda` 700 en très grand et en **bas de casse** pour l'affichage · `archivo` pour le texte et les capitales de nav |
| **Formes** | Angles vifs. Filets noirs de 1 px et **une réglure verticale** entre les colonnes. Le dispositif de signature : un **numéro de page** en rouge dans la marge, comme un magazine |
| **Mouvement** | Le titre se dévoile **sous un masque qui monte** (`clip-path: inset()`) · les images arrivent **de côté** en alternance · un **bandeau de mots défile** horizontalement en continu · la grille de services est un **accordéon `:has()` / `<details>`** |
| **Traitement photo** | **Noir et blanc à fort contraste, PARTOUT, sans exception.** La première version gardait deux images de salle en couleur — un salon beige dont les fauteuils sont encore sous film de protection, et un salon de barbier vert et brun. Deux teintes de plus dans un système qui en compte trois, et deux pièces VIDES dans un métier qui se juge au geste. Les deux sont sorties de la page. Le cadrage se fait sur une main, un ciseau, une mèche — jamais sur un fauteuil |
| **Ce qu'on ne fait pas** | Aucun rose, aucun doré, aucune courbe. On ne fait pas « salon de beauté », on fait « éditorial » |

## 06 · HÉBERGEMENT ET TOURISME — **AUBERGE DES CAPS**

| Poste | Décision |
|---|---|
| **Référence culturelle** | Un carnet de séjour nordique. Le paysage occupe tout, le texte se glisse dedans |
| **Palette** | sapin `#0f2019` · os `#e8e0cd` · laiton `#a98b4f` · brume `#7d8f85` |
| **Typographie** | `cormorant` 600 (antique lapidaire, très fine, capitales espacées) · `spectral` pour le texte · `jetbrains-mono` pour les dates |
| **Formes** | Angles vifs. **Filets de laiton d'un demi-pixel** en cadre autour des blocs. Signature : un **trait vertical qui se remplit** le long du parcours des chambres |
| **Mouvement** | **Parallaxe du paysage** (`animation-timeline: scroll()`) sur les deux bandeaux · les chambres se **dévoilent depuis le bas sous un masque** · le trait vertical se remplit au défilement · le calendrier de disponibilité est une grille `:hover` |
| **Traitement photo** | Virage **froid et désaturé**, hautes lumières écrasées. La neige est bleue, pas blanche |
| **Ce qu'on ne fait pas** | Pas de carte de réservation flottante, pas de « à partir de » |

## 07 · GYM ET ENTRAÎNEMENT — **FONTE NORD**

| Poste | Décision |
|---|---|
| **Référence culturelle** | Une affiche de compétition. Tout est trop gros, et c'est voulu |
| **Palette** | **acide `#d6f227` en fond de page** · noir `#0b0b0b` · blanc. Deux couleurs et un noir |
| **Typographie** | `anton` en capitales, **jusqu'à 180 px**, interlignage 0,82 · `archivo` pour le texte · `jetbrains-mono` pour l'horaire |
| **Formes** | Angles vifs, aucune marge intérieure inutile. Signature : un **bandeau noir en diagonale**… non — **une barre de progression horizontale** sous chaque titre, qui se remplit au défilement |
| **Mouvement** | Les titres **arrivent d'en dessous par lettres-blocs** · l'horaire de la semaine **défile latéralement** en `scroll-snap` · les chiffres ont un **compteur qui roule** (bande verticale translatée au défilement) · survol : le bloc s'**inverse** (noir↔acide) en 120 ms |
| **Traitement photo** | **Duotone noir / acide** sur toutes les photos, contraste dur |
| **Ce qu'on ne fait pas** | Pas de fond sombre. C'est un site **jaune-vert**, et c'est ce qui le rend impossible à confondre |

## 08 · CLINIQUE ET SANTÉ — **CLINIQUE DU RIVERAIN**

| Poste | Décision |
|---|---|
| **Référence culturelle** | Une application de santé bien faite. Rond, calme, aéré, jamais froid |
| **Palette** | glacier `#eef4f8` · blanc · bleu `#1b4f7a` · menthe `#7fbfa8` · encre douce `#20303a` |
| **Typographie** | `outfit` 800 (géométrique, bols ronds) · `manrope` pour le texte |
| **Formes** | **Le seul site à coins arrondis** : 24 px sur les cartes, **999 px sur les boutons et les pastilles**. **Ombres douces autorisées et voulues** — c'est la différence qui se voit à trois mètres |
| **Mouvement** | Les cartes **montent et se posent** avec un léger dépassement · le parcours de rendez-vous est un **`:checked` en trois étapes** qui fait glisser un panneau · les pastilles d'équipe **grandissent au survol** · un **anneau de progression** se dessine (`stroke-dashoffset` animé au défilement) |
| **Traitement photo** | Clair, lumière du jour, **hautes lumières relevées**. Aucun gros plan clinique |
| **Ce qu'on ne fait pas** | Pas de bleu marine, pas de croix, pas de blouse blanche |

## 09 · IMMOBILIER — **RIVE & PIERRE**

| Poste | Décision |
|---|---|
| **Référence culturelle** | Un catalogue de vente aux enchères. La propriété est un objet qu'on présente |
| **Palette** | nuit `#0d1725` · os `#efe9dd` · or `#b8964f` · ardoise `#5d6b7a` |
| **Typographie** | `dm-serif` pour l'affichage · `spectral` pour le texte · `jetbrains-mono` pour les surfaces et les numéros de lot |
| **Formes** | Angles vifs. **Filets d'or de 1 px** qui encadrent chaque fiche. Signature : un **numéro de lot** géant en filigrane derrière chaque propriété |
| **Mouvement** | Les fiches **s'ouvrent en volet** depuis le centre · la photo **se décadre lentement** au défilement (`object-position` animé) · un **plan d'étage se dessine** au survol · les surfaces **comptent** en roulant |
| **Traitement photo** | Chaud, contrasté, ombres profondes. Les intérieurs sont éclairés à la lampe, pas au plafonnier |
| **Ce qu'on ne fait pas** | Aucun prix, aucune mention « vendu ». Pas de carte interactive |

## 10 · SERVICES JURIDIQUES — **CABINET VALLIÈRES**

| Poste | Décision |
|---|---|
| **Référence culturelle** | Un quotidien économique sur papier rose. Le sérieux par la mise en page, pas par le gris |
| **Palette** | papier rose `#fff1e5` · encre `#1a1614` · bordeaux `#6d1a2c` · réglure `#e3cfc0` |
| **Typographie** | `libre-baskerville` 700 pour l'affichage · `source-serif` pour le texte · `jetbrains-mono` pour les références d'article |
| **Formes** | Angles vifs. **Colonnes de journal** (2 à 4), **réglures horizontales** entre chaque bloc, filets doubles au-dessus des titres. Signature : un **bandeau de manchette** en tête de chaque section |
| **Mouvement** | Le texte se révèle **colonne par colonne, de gauche à droite** · une **règle horizontale se trace** avant chaque titre · les domaines de pratique sont un **`:target` qui change l'article affiché**, sans script · survol : le lien prend un **soulignement qui se trace** |
| **Traitement photo** | **Cinq photos, très grandes** — et c'est une décision, pas un manque. Trente-quatre candidats regardés pour en ajouter, aucun retenu : un rayon de bibliothèque est un mur de MARQUES, les salles de réunion libres sont meublées en orange, les stores d'ordinateur n'ont pas de sujet. Une page de quotidien porte peu d'images et beaucoup de texte. Traitement **duotone bordeaux/papier, tramé à 45°** |
| **Ce qu'on ne fait pas** | Pas de poignée de main, pas de balance, pas de marteau de juge |

> **LA COLONNADE — LA LIGNE A ÉTÉ LEVÉE, ET VOICI POURQUOI.** La
> première version de cette DA écrivait « pas de colonnade », parce
> qu'un avocat photographié devant des colonnes est le cliché du
> métier. Quatre des cinq photos disponibles SONT de l'architecture
> classique, et le triage a montré qu'il n'y avait rien à mettre à la
> place. Ce qui a été retenu : **une colonnade en duotone bordeaux
> tramé n'est plus un cliché de cabinet, c'est un ornement de une** —
> à condition que la légende dise que ce n'est pas le bureau. La
> ligne interdit donc l'homme devant les colonnes, pas la colonne.

## 11 · PHOTOGRAPHE ET CRÉATIF — **ATELIER LUMEN**

| Poste | Décision |
|---|---|
| **Référence culturelle** | Une salle d'exposition la lumière éteinte. Le noir n'est pas un fond, c'est le mur |
| **Palette** | noir `#000000` · blanc `#ffffff` · gris `#8a8a8a`. **Aucune couleur d'accent, et c'est le parti pris** |
| **Typographie** | `instrument-serif` (romain et italique) très grand · `inter` 400 minuscule pour les légendes · `jetbrains-mono` pour les données de prise de vue |
| **Formes** | Angles vifs. **Marges énormes** — 18 % de la fenêtre de chaque côté. Signature : chaque image porte sa **fiche technique en mono** sur trois lignes, alignée à droite |
| **Mouvement** | Les images **apparaissent par un fondu long** (700 ms) et **rien d'autre ne bouge** — c'est le seul site où le mouvement est lent · un **défilement latéral plein écran** pour la série · au survol, la légende **se déplie** vers le bas |
| **Traitement photo** | **Aucun.** Les images sont montrées telles quelles, en très grand, sur du noir |
| **Ce qu'on ne fait pas** | Pas de grille de portfolio, pas de mosaïque, pas de lightbox simulée |

## 12 · CONSTRUCTION ET RÉNOVATION — **CHANTIER BOREAL**

| Poste | Décision |
|---|---|
| **Référence culturelle** | Un plan d'architecte au trait. Le bleu de plan, le quadrillage, les cotes |
| **Palette** | bleu de plan `#0a2540` · cyan `#3fc8e8` · blanc de trait `#dfe9ef` · gris de cote `#7f95a5` |
| **Typographie** | `space-grotesk` 700 pour l'affichage · `plex-sans` pour le texte · `jetbrains-mono` très présent, pour les cotes et les numéros de lot |
| **Formes** | Angles vifs. **Un quadrillage de plan visible sur tout le fond** (`repeating-linear-gradient`, 24 px). Signature : des **cotes** — un trait avec deux embouts et un nombre au milieu — posées sur les images |
| **Mouvement** | Le quadrillage **glisse lentement** au défilement (`scroll()`) · les traits de cote **se tracent** de gauche à droite · les étapes de chantier arrivent **une par une, décalées de 60 ms** · un **avant / après** au curseur, en `:hover` sur un `clip-path` |
| **Traitement photo** | **Bleuté et désaturé**, avec un léger surlignage cyan sur les arêtes. Les photos ressemblent à des relevés |
| **Ce qu'on ne fait pas** | Pas de jaune de chantier, pas de casque, pas de photo de poignée de main |

---

## Ce qui reste à écrire

Les trois projets réels — 01, 02, 03 — sont décrits ici pour la
comparaison seulement. Ils ne se refont pas dans ce dépôt.
