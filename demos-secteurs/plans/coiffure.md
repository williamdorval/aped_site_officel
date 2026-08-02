# COIFFURE — BRUME

Atelier de coupe, de couleur et de soin du cheveu. **Entreprise
fictive**, Québec. Un seul écran, 1440 × 900, arrêté.

**Cellule exclusive dans `MATRICE-DOUZE.md` :** palette **noir et
blanc PUR, zéro chroma** · serif de journal + filets capillaires ·
**colonnes de journal** · photo N/B, geste serré. Le noir et blanc pur
et les colonnes de journal sont interdits aux onze autres.

---

## Ce qui a changé le 2026-08-01, seconde passe

La version précédente était notée 8,5. Trois reproches, tous chiffrés,
tous corrigés :

| Reproche | Ce qui a été fait |
|---|---|
| **« Il y a du rouge. »** La lettrine, la barre, le bouton et le folio étaient cramoisis `#a5122b` — et le bordeaux est l'exclusivité du 11 juridique. Deux écrans qui partagent une couleur sont deux écrans qui se ressemblent | **Chroma ramené à zéro.** `--cramoisi` n'existe plus. La page n'a que `#ffffff` et `#0e0e0e`. Ce qui remplace l'accent n'est pas une autre teinte : c'est la **RÉSERVE** — deux blocs pleins d'encre au texte blanc, le bouton et l'encart de l'atelier, tous deux larges d'exactement une colonne et dans la même colonne. Sur une page à deux valeurs, un accent ne peut être qu'un renversement |
| **« Le titre est à 64 px. »** Il était déclaré à 140 px, mais il est en BAS DE CASSE : sa hauteur d'x, mesurée, valait 0,469 × 140 = **65,7 px**. C'est cette mesure-là qu'on voit, et le reproche était juste au pixel près | **240 px.** Hauteur d'x **112,6 px**, hauteur de capitale **180 px** — la fourchette demandée était 110 à 180. La manchette occupe 402 px des 900, soit 45 % de la fenêtre ; la référence brzozowski en occupe 44 % |
| **« La photo est bonne mais bornée. »** Elle était un rectangle net de 512 × 640 posé à (56, 104), encadré par la composition | Elle **sort par deux bords de page** : x 0 → 584, y 0 → 464. Le cadre ne montre que les 795 premiers pixels de la source ; le bas de l'image — l'ongle en macro — est **coupé par la composition**. Et le bandeau de titre est imprimé DEDANS |

---

## Les trois références — relevées, ouvertes, mesurées

### 1 · Atelier Brzozowski — https://atelierbrzozowski.com/

hiday studio, Pologne. **Awwwards Honorable Mention, 12 septembre
2024**, moyenne 7,2 sur 15 votes, meilleure note individuelle 9,00.

**Ce qu'elle prouve.** Un salon peut ouvrir sur DEUX MOTS et rien
d'autre, si les deux mots sont assez grands. La page entière est un
nom, une photographie et un paragraphe.

**Les chiffres** (`tools/_refs/coiffure-brzozowski/`, relevé à 1440) :

| | |
|---|---|
| `h1` du relevé | 60 px — **c'est un titre de référencement masqué, pas le titre visible.** Le relevé seul aurait fait écrire n'importe quoi |
| Titre visible, **mesuré à l'encre sur le PNG** | « ATELIER » y 430 → 595 = **165 px de hauteur de capitale** · « BRZOZOWSKI » y 656 → 823 = **167 px** |
| Lignes de base | 595 et 823 → **228 px d'interlignage**, soit ≈ 0,97 du corps (≈ 236 px) |
| Part de la fenêtre | le titre occupe y 430 → 823 = **44 % des 900 px** |
| Familles | **2** — TAN-PEARL, PPNeueMontreal |
| Corps | 12 px relevé, ≈ 16 px à l'écran, une seule colonne de 465 px à droite |
| Photo | plein cadre, la seconde ligne du titre **sort par le bord droit** |

**Ce qu'on lui prend.** L'échelle, et rien qu'elle : 165 px de hauteur
de capitale est la barre, la nôtre en fait 180. Les deux lignes qui
occupent 44 % de la fenêtre. L'interlignage sous 1,00. Deux familles,
pas trois. Et le principe du **titre imprimé sur la photographie** —
sauf que chez nous c'est le bandeau, pas le titre.

**Ce qu'on écarte.** Le virage sépia doré, qui est une couleur et nous
n'en avons aucune. Les CAPITALES — nous restons en bas de casse, c'est
ce qui sépare une page de journal d'une affiche. La photographie plein
cadre, qui efface la grille. Et le visage qui regarde l'objectif : la
matrice réserve le portrait humain au 09 clinique.

### 2 · ALICE Hair & Art — https://www.alicehairart.se/

Concept Studio, Stockholm. **Awwwards Honorable Mention, 11 février
2025, 7,69/10.** Framer.

**Ce qu'elle prouve.** Un salon peut être primé sans une seule
photographie plein cadre, sans un aplat de couleur, avec du texte à
14 px et 80 % de la page vide. Le vide n'est pas un manque de contenu :
c'est le dispositif.

**Les chiffres** (`tools/_refs/coiffure-alice/`) :

| | |
|---|---|
| Fond | `rgb(245,245,245)` — jamais blanc pur |
| `h1` | **aucun** |
| Corps | 14 px / 15,4 → interlignage **1,10**, chasse **+1,4 px**, capitales |
| Familles | 2 |
| Origines de colonne mesurées | x = **8 · 415 · 822 · 1225** — quatre colonnes de 407, gouttière 4, collées au bord |
| Barres fixes | tête y=442, pied y=876, items sur **les mêmes origines** que les images |

**Ce qu'on lui prend.** Le fond presque blanc. Les images et les textes
posés sur des origines de colonne strictes, jamais « à peu près ». Le
noir et blanc pour tout ce qui montre le métier. Les libellés
minuscules en capitales espacées comme seule voix secondaire. Et le
courage du vide : nos 784 × 260 px de blanc entre le chapeau et le
filet de fermeture viennent de là.

**Ce qu'on écarte.** L'absence totale d'affichage — on ressort sans
avoir lu une phrase. La grille collée aux bords à 8 px, qui interdit
toute marge et donc tout folio. Les images d'art en couleur saturée.
Et le `#f5f5f5`, qui est un gris : notre cellule dit chroma NUL, nous
prenons le blanc pur.

### 3 · Marco Ambrosi Salon — https://www.marcoambrosi.salon/

Coiffeur, Vérone. **Awwwards Honorable Mention, 2 juin 2021, 7,68/10.**
GSAP, Highway.js.

**Ce qu'elle prouve.** Le rythme vient du **décalage vertical**, pas de
la couleur. Et le sujet photographié est le **geste** — des mains dans
une chevelure —, pas la salle.

**Les chiffres** (`tools/_refs/coiffure-ambrosi/`) :

| | |
|---|---|
| Fond | `rgb(34,34,32)` (×10 blocs) |
| `h1` | **70 px / 70 px → interlignage 1,00**, chasse −2 px, graisse 400, blanc, centré, deux lignes |
| Corps | 25 px |
| Autres fonds | blanc ×3 · **cuivre `rgb(186,128,94)` ×2** |
| Escalier du premier écran | 437 px à (0, 555) · 371 à (473, 509) · 559 à (881, 461) — chaque image part **plus haut** que la précédente |

**Ce qu'on lui prend.** L'interlignage à 1,00 ou moins sur un grand
titre — le nôtre est à 214/240 = **0,89**. Le cadrage serré sur les
mains. Et l'escalier : des objets alignés sur une grille mais **jamais
sur la même ligne de départ** — chez nous le chapeau démarre à y=140 et
l'encart de l'atelier à y=732, dans la même page texte.

**Ce qu'on écarte.** Le fond sombre — nous allons au blanc pur. Le
centrage symétrique, interdit chez nous. Le cuivre, qui est une
troisième teinte. Et 70 px : trop petit d'un facteur **3,4**.

### Relevées, mesurées, NON retenues

| | |
|---|---|
| **Rendezvous Barbers** — myrendezvous.ca. Awwwards HM 31 juillet 2024. `h1` **124 px / 117,8 → 0,95**, chasse −6,4 px, bas de casse, romain ET italique **dans le fil de la phrase**, quatre lignes centrées, noir sur orange `rgb(255,98,43)`. Chiffre utile, direction inutilisable : orange saturé et centrage | écartée |
| **Blue Tit London** — bluetitlondon.com. Aucun titre d'affichage ; l'énoncé de 28,8 px EST le titre. Photo de tête **667 × 667 d'une salle vide**, quatre pastels sur le premier écran, rayons de 4 px | écartée — c'était l'une des trois de la passe précédente |
| **Salon Heleen Hulsmann** — grotesque ultra-condensée capitale blanche à ≈ 180 px sur photo. Superbe, mais c'est la cellule du **04 gym** et du **06 garage** | écartée |
| hershesons · sassoon · larryking · arsova · achilles · lps · colorista · ricciardi · hoftendamme · bahnsen · archivio | relevées, aucune au niveau ou hors métier |

`tools/planche-refs.mjs` a été corrigé : la table `CHOIX` nommait
« marco », qui ne désignait **aucun dossier** — le relevé s'appelle
`coiffure-ambrosi` et la recherche par sous-chaîne le manquait en
silence. Les trois sont maintenant `brzozowski, alice, ambrosi`.

---

## La direction artistique

| Poste | Décision |
|---|---|
| **Référence culturelle** | **La UNE d'un quotidien**, plus la double page de magazine. Bandeau de titre, filet de tête, MANCHETTE en travers de toutes les colonnes, chapeau en colonnes réglées, légende « FIG. 1 », folio dans la marge. C'est la seule composition des douze qui ait des colonnes de journal, et la manchette est ce qu'elles permettent |
| **Palette** | **DEUX valeurs, et rien entre les deux.** `--papier: #ffffff` · `--encre: #0e0e0e`. **Chroma nul partout** : aucun gris déclaré, aucune teinte. Les seuls gris de la page sont photographiques. Contraste encre/papier **19,3 : 1** dans les deux sens |
| **Typographie — affichage** | `bodoni-moda` **700** (`bodoni-moda-1.woff2`). Manchette **240 px / 214 px** → interlignage **0,89**, chasse **−0,031 em**, bas de casse. Masthead **44 px**, bas de casse, chasse −1,5 px. Lettrine **72 px**, encre |
| **Typographie — texte** | `archivo` 400 et 600. Chapeau **14 px / 21 px**. Coordonnées **13 px / 20 px**. Rubriques, mention, légende, folio : **10 et 11 px**, capitales, chasse +1,4 à +3 px. **Aucun corps entre 21 px et 240 px** — le saut EST le dispositif, et il vaut **1 à 24** |
| **Typographie — le piège à ne pas repayer** | Les faces découpées ne couvrent que U+0000–00FF et U+2000–206F. `№` (U+2116) et `→` (U+2192) n'y sont pas : le folio s'écrit `N° 01` (`°` = U+00B0 ✓) et la flèche du bouton est **dessinée en filets de 1 px**. Les deux faces qui portent la mise en page sont préchargées : un `swap` sur un didone de 240 px déplace la fin de ligne de plusieurs dizaines de pixels |
| **Composition — la grille** | Marges 56 px. Justification **56 → 1384** (1328 px). **Cinq colonnes de 240, gouttières de 32.** C1 `56–296` · C2 `328–568` · C3 `600–840` · C4 `872–1112` · C5 `1144–1384`. Gouttières : 312 · 584 · 856 · 1128 |
| **Composition — la photographie** | `coiffure-11.webp`, source **1000 × 1400**. Cadre **x 0 → 584, y 0 → 464**, `object-position: 50% 0%`. Elle **sort par le haut et par la gauche**. Échelle 0,584 : le cadre montre les **795 premiers pixels** de la source — le tablier, la main droite, la mèche, la lame qui se ferme — et coupe le bas, où la source est une macro d'ongle. La main droite y fait 313 px sur 464 : un gros plan de presse, pas une macro |
| **Composition — le bandeau de titre, DANS l'image** | `brume` bodoni 700 **44 px**, **BLANC**, x=40, base **y=60** · `SALON DE COIFFURE — QUÉBEC` archivo 600 10 px, blanc, x=40, base **y=82**. Les deux sont posés sur les 200 premiers pixels de la source, où la luminance **maximale mesurée est 2 sur 255**. Pire pixel réel : **14,88 : 1** et **17,83 : 1** |
| **Composition — la page texte** | Rubriques archivo 600 11 px réparties de x=600 à x=1112, base y=50 · mention `SITE DE DÉMONSTRATION — ENTREPRISE FICTIVE` archivo 400 10 px à x=600, base y=72 — c'est la **ligne d'édition** d'un quotidien · bouton **plein d'encre 240 × 44** à (1144, 18) |
| **Composition — le chapeau** | **TROIS colonnes de 240, gouttières 32**, x 600 → 1384 : 240×3 + 32×2 = **784**, la mesure exacte de la page texte. y 140 → 203. Lettrine `B` bodoni 700 72 px, boîte de 63 px = trois interlignes de 21 px exactement, donc la base de la capitale tombe sur la troisième ligne de base |
| **Composition — l'encart de l'atelier** | **Bloc PLEIN d'encre, texte en réserve**, C5, **x 1144 → 1384, y 732 → 872**, 240 × 140. Il se pose dans l'encoche que laisse « une lame » (qui s'arrête à x=1055) ; son bas est celui de la manchette, **au pixel** ; son haut passe 14 px sous la virgule de la première ligne, qui descend à 718. Il rime avec le bouton : même colonne, même largeur |
| **Composition — la manchette** | bodoni 700 240 px, x=**56**, deux lignes. Cotes **calculées sur les métriques mesurées dans la page**, jamais estimées : « deux doigts, » = 5,904 em / montante 0,766 / descendante 0,266 ; « une lame » = 4,409 em / 0,750 / 0,016 ; capitale 0,750 em ; hauteur d'x 0,469 em. À 240 px et −0,031 em : ligne 1 = **1328 px → x 56 → 1384, pile** ; ligne 2 = 999 px → x 56 → 1055. Encre **y 470 → 872**. Bases **654** et **868**. La jambe du `g` descend à 718, la hampe du `l` de « lame » monte à 688 : elles s'entrelacent sur 30 px **sans se toucher**, leurs x sont disjoints (vérifié en capture pleine résolution) |
| **Composition — le filet de fermeture** | 1 px encre, **x 584 → 1384**, y=**464**. Il PART du bord droit de la photographie, pas de l'origine de C3 : le bord bas de l'image se prolonge en filet. **La même ligne, deux matières.** Parti de 600, il restait 16 px de blanc et l'idée tombait |
| **Composition — les réglures** | Deux verticales de 1 px, x=**856** et x=**1128**, **y 128 → 215** : les deux gouttières du chapeau, 12 px au-dessus du texte et 12 px en dessous. Elles **s'arrêtent avec le texte**. Un essai les faisait courir jusqu'à 464 : elles encadraient 240 px de rien, et trois colonnes vides se lisent comme un tableau à moitié rempli. La moitié gauche n'a aucune réglure — il n'y a pas de colonnes à séparer, il y a une photographie et une manchette |
| **Composition — le folio** | `N° 01 — BRUME` archivo 600 11 px, chasse 3 px, **encre**, dans la MARGE à x=**20**, `writing-mode: vertical-rl` + rotation, lecture de bas en haut, y 500 → 622 |
| **Composition — la légende** | `FIG. 1 — LA LAME SE FERME SUR LA MÈCHE. ATELIER, QUÉBEC.` archivo 400 10 px, **BLANCHE, dans la photographie**, alignée à DROITE sur x=568, base y=**444**. Le coin bas-droit du cadre est le seul endroit du bas de l'image dont la luminance maximale mesurée soit **0 sur 255** ; à gauche il y a un doigt clair à 229 |
| **Formes** | **Angles vifs partout, rayon 0.** Aucune ombre, aucun dégradé, aucun flou. **Quatre pleins sur tout l'écran** : la photographie, le bouton, la barre, l'encart de l'atelier. Tout le reste est du texte et des filets de 1 px |
| **Traitement photo** | `filter: grayscale(1) contrast(1.34) brightness(0.9)`. Le tablier s'écrase vers le noir, la mèche part vers le blanc : deux valeurs, comme la palette. Aucun visage, aucune enseigne, aucune marque — vérifié en pleine résolution. *Écartées : `coiffure-10` (contre-jour brûlé qui avale la lame) · `coiffure-12` (pince orange et oreille reconnaissable) · toute image de salle, de fauteuil ou de bac* |
| **Ce qu'on ne fait pas** | Aucune couleur, d'aucune sorte — un seul relevé non neutre serait l'échec de la cellule. Aucun gris déclaré. Aucune courbe, aucun rayon, aucune ombre. Aucune photographie plein cadre, aucun centrage symétrique. Aucune salle, aucun fauteuil, aucun miroir, aucun visage. Aucun prix, aucune note, aucun avis, aucun nom réel, **aucune adresse web**. Aucun `№`, aucun `→`. Aucune requête tierce |

---

## Le geste, et l'instant

**Instant de capture : `<meta name="aped-instant" content="1500">`.**

**Ce qu'on photographie en mouvement : le filet de tête de la page
texte.** Sous le bandeau d'une une court un filet lourd. Ici il fait
**784 × 16 px**, de x=600 à x=1384, et il **se tire** de gauche à
droite. Un filet d'encre de 1 px posé sur son axe, à y=103, montre le
chemin entier ; la barre pleine est ce même filet en train d'être
ruliné. Le même objet à deux poids.

`transform: scaleX(0 → 1)`, origine `0 50%`, **2000 ms**, retard
**500 ms**, `cubic-bezier(.65, 0, .35, 1)`. **La courbe est symétrique
— elle passe par (0,5 ; 0,5) — donc à la moitié de sa durée la barre
est tirée à la moitié exacte : 500 + 1000 = 1500 ms, l'instant
déclaré. Rien à régler, rien à mesurer.**

Sur l'image arrêtée : **392 px de barre pleine sur 784**, bord
d'attaque à x=992, et le filet de 1 px qui continue seul jusqu'à
x=1384. Réduit à 0,29 : **114 × 4,6 px**, déplacement 392 px — piège 71
demande 12 px dans la plus petite dimension et 40 px de déplacement.

**Ce qu'on ne photographie PAS : la manchette.** Elle se découvre sous
un `clip-path: inset(0 100% 0 0) → inset(0 0 0 0)`, **1100 ms**,
`cubic-bezier(.19, 1, .22, 1)`, seconde ligne retardée de 180 ms. Elle
est finie à **1280 ms**, donc entière à 1500. **Piège 70 :** cet écran
a DÉJÀ été photographié à 280 ms et rendait « deux doigt » et « une » —
deux mots coupés net. Un masque figé à mi-course sur du TEXTE ne se lit
pas comme un mouvement mais comme une page cassée. Le mécanisme reste ;
c'est l'instant qui a bougé, et il ne doit plus bouger.

Le masque est un `clip-path`, jamais une opacité. `@supports not
(clip-path: inset(...))` → forme finale. `prefers-reduced-motion:
reduce` → aucune animation, les deux lignes entières, la barre tirée
jusqu'au bout : **vérifié**, `clip-path: inset(0px)` sur les deux
lignes et barre à 784 px sur 784.

Micro-interaction, une seule et c'est la seule possible sur une page à
deux valeurs : le bouton **s'inverse** au survol et au focus — la
réserve devient l'encre, avec un filet intérieur de 1 px. 180 ms.

---

## Le moment fort, en une ligne

> **Le bandeau de titre du journal est imprimé DANS la photographie, en
> réserve blanche** — le nom du salon n'est pas au-dessus de l'image,
> il est dedans, sur 200 px de tablier noir mesurés à 2 sur 255.

Et sous lui, une manchette en bodoni bas de casse de 240 px qui court
d'une marge à l'autre, au pixel.

---

## Ce qui me distingue des onze autres

**Couleur.** Je suis le **seul écran des douze sans une seule couleur**.
Deux valeurs, `#ffffff` et `#0e0e0e`, et les seuls gris sont
photographiques. Le 11 juridique garde le bordeaux pour lui seul ; nous
ne le partageons plus.

**Composition.** Le seul à poser **cinq colonnes de 240 px avec des
réglures capillaires dans les gouttières**, un chapeau coulé en **trois
colonnes** sur la mesure exacte de la page texte, une **manchette** en
travers de toutes les colonnes, une légende `FIG. 1` et un folio dans la
marge. Aucun autre n'a de colonnes de journal — c'est le verrou de la
matrice.

**Typographie.** Un didone en **bas de casse à 240 px** contre un
grotesque à 10 px : un rapport de **1 à 24**, sans aucun corps entre
21 et 240. Bas de casse, jamais capitales — c'est ce qui sépare une une
d'une affiche, et c'est l'inverse de ce que fait un didone de luxe.

**Photographie.** La seule qui **sorte par deux bords de page** et qui
porte le nom de l'entreprise en réserve. Le 12 photographe est bord à
bord, mais son image EST l'écran ; ici elle est un quart de l'écran et
elle est coupée par la composition.

---

## Le contenu exact

**Nom (fictif)** — `Brume` · atelier de coupe, de couleur et de soin du
cheveu, Québec.

| Bloc | Texte |
|---|---|
| Masthead | `brume` |
| Ligne d'identité | `SALON DE COIFFURE — QUÉBEC` |
| Rubriques | `COUPE` · `COULEUR` · `SOIN DU CHEVEU` |
| Ligne d'édition | `SITE DE DÉMONSTRATION — ENTREPRISE FICTIVE` |
| Bouton | `PRENDRE RENDEZ-VOUS` |
| Manchette | `deux doigts,` / `une lame` |
| Chapeau | `Brume est un atelier de coupe, de couleur et de soin du cheveu, à Québec. On y travaille à la lame et au peigne, sur rendez-vous, jamais deux têtes en même temps. Chaque coupe part de la matière : sa densité, son épi, la façon dont elle retombe une fois sèche.` |
| Légende | `FIG. 1 — LA LAME SE FERME SUR LA MÈCHE. ATELIER, QUÉBEC.` |
| Encart | `L’ATELIER` · `Adresse sur demande` · `000 000-0000` · `courriel@exemple.ca` · `SUR RENDEZ-VOUS` |
| Folio | `N° 01 — BRUME` |
| Balises | `<title>Brume · coupe, couleur et soin du cheveu, Québec</title>` · `<meta name="robots" content="noindex,nofollow">` |
| Alt de la photo | `Deux mains tiennent une mèche claire ; la lame d’un ciseau se ferme dessus, devant un tablier noir. Noir et blanc.` |

---

## Ce qui est mesuré, et avec quoi

| Mesure | Résultat | Outil |
|---|---|---|
| Véracité, marques, prix, adresse web | **ok**, rien à signaler | `demos-controle.mjs` |
| Contraste calculable, 390 · 768 · 1440 | **0 échec**, min 19,3 | `demos-contraste.mjs` |
| Contraste des 7 blocs en réserve, aux pixels peints | **0 échec**, pire **13,94 : 1** | `pire-pixel.mjs` |
| Erreurs console | **0** | sonde |
| Requêtes tierces | **0** | sonde |
| Débordement horizontal, 320 → 1920 px | **aucun** | sonde |
| Hauteur du document à 1440 | **900 px exactement** | sonde |
| `prefers-reduced-motion` | manchette entière, barre tirée à 784/784 | sonde |
| Familles de polices chargées | **2** (bodoni-moda, archivo) | `demos-controle.mjs` |
| Poids de la page | **27 ko** de document, capture 52 ko | `demos-controle.mjs` |

---

## Réserves honnêtes

1. **La photographie n'a pas de plage sombre assez grande pour que la
   manchette la traverse.** L'idée la plus forte envisagée — le titre
   qui se renverse en blanc là où il croise l'image — a été abandonnée
   après mesure : à l'échelle qu'il faut, les lettres tomberaient sur
   des pixels à 229 sur 255. Ce n'est pas un renoncement de goût, c'est
   une mesure ; elle est dans la carte de luminance en tête du § 3 du
   fichier. Avec une autre source, l'idée tient.
2. **Le blanc de 784 × 260 px entre le chapeau et le filet de fermeture
   est assumé, pas prouvé.** Il se compose contre la masse de la
   photographie, mais un directeur artistique hostile peut le lire
   comme un trou. Le remplir demanderait d'inventer du contenu, ce que
   le standard interdit.
3. **`demos-contraste.mjs` a été corrigé pendant ce chantier** — il
   rendait `1:1` sur trois blocs blancs posés sur un `<img>` frère,
   parce qu'il ne remontait que les fonds CSS des ancêtres. Le
   correctif ne peut que retirer des faux échecs. Mais il révèle que
   **128 blocs de texte sur les neuf écrans** étaient mesurés contre un
   fond qui n'est pas peint là, et que **`hotel`, `photo` et
   `construction` à 390 px n'ont plus AUCUNE mesure calculable** : leur
   lisibilité repose entièrement sur `pire-pixel.mjs`, qui n'a
   peut-être jamais été passé dessus. Ce n'est pas mon métier, c'est
   signalé.
4. **Le panneau de l'aperçu affiche `salon-brume.ca`** dans sa fausse
   barre d'adresse — comme les onze autres. L'écran lui-même ne porte
   aucune adresse web ; la convention du panneau est une décision du
   site, pas de cet écran.
5. **Aucune mesure n'a été prise sur un appareil réel.** Chromium sous
   Playwright, machine de bureau Windows. Les relevés à 390 px ne sont
   pas un téléphone.

---

## UN PIÈGE NEUF, PAYÉ ICI — candidat pour `PIEGES.md`

> **`order` ne réordonne pas seulement la disposition : il réordonne
> l'ORDRE DE PEINTURE.**

Le flux étroit range ses blocs avec `order` sur un `.page` en `flex` —
la photographie vient en premier dans le DOM parce qu'elle est
l'élément LCP, et il faut la renvoyer après le bandeau quand tout se
remet en colonne. À 1440, `.page` était resté `flex` : la photographie
(`order:8`) se peignait **par-dessus** le masthead (`order:1`), et
« brume » avait purement disparu de la capture.

**Rien ne l'a signalé.** La boîte existait, à la bonne place, de la
bonne couleur, au bon corps — `getBoundingClientRect` était juste,
`getComputedStyle` était juste, la sonde de géométrie disait tout va
bien, `demos-controle` disait `ok`, il n'y avait aucune erreur console.
Une sonde du DOM ne peut pas voir un défaut de peinture (piège 25, dans
une variante neuve : ici ce n'est pas un `transform`, c'est `order`).

Ça ne s'est vu qu'en **rouvrant l'image** et en constatant qu'un mot
qui devait y être n'y était plus. Correctif : `display:block` sur
`.page` dans la requête ≥ 1440 — `order` ne s'applique qu'aux éléments
de flex, et l'ordre du document reprend la main.
