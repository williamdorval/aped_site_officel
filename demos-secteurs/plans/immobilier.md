# IMMOBILIER — ARPENT

Un seul écran, 1440 × 900, arrêté. Courtage immobilier.
**Quatre bandes horizontales pleine largeur, terre cuite sur sable
saturé, grotesque ÉTENDUE en capitales, photographie en boîte aux
lettres.**

> **Cette DA remplace intégralement celle du 2026-08-01 (« split
> vertical strict, fond ivoire, `dm-serif` »).** Rien n'en est
> conservé : ni la palette, ni la famille, ni la composition, ni la
> photographie. Ce qui reste : le nom `ARPENT`, l'idée que la
> propriété est un **lot** décrit par des chiffres, et l'interdiction
> de tout montant. La version précédente est dans l'historique de
> `git` ; on ne la recopie pas ici pour qu'on ne la relise pas par
> erreur.

## Pourquoi elle a été jetée — deux défauts, le premier fatal

1. **La photographie était mauvaise et n'était pas cadrée.** Un
   pavillon de banlieue à revêtement de vinyle, photographié de trois
   quarts depuis le trottoir. Ce n'était pas une image d'immobilier
   primé, c'était une fiche Centris. Une photographie posée dans un
   cadre plafonne à 6.
2. **C'était le quatrième serif-sur-crème de la planche des douze.**
   Boutique, coiffure et juridique y étaient déjà. À côté d'eux,
   l'écran disparaissait.

## La cellule exclusive — verrouillée

| Poste | Ce qui n'appartient qu'à cet écran |
|---|---|
| Palette | **terre cuite / sable saturé + brun profond** — seul écran chaud-saturé des douze |
| Typographie | **grotesque ÉTENDUE en capitales** — l'inverse exact de l'ultra-condensée du 04 |
| Composition | **bandes horizontales pleine largeur** — aucune colonne, aucun split |
| Photo | **boîte aux lettres très large** — le seul letterbox des douze |

---

## Les trois références

Vingt-trois relevés existaient sous `tools/_refs/immobilier-*`. Quatre
ont été ajoutés le 2026-08-01 (`village`, `pakau`, `huts`, `ray`,
`yards`) ; deux sont retenus. **Les trois références de la passe
précédente — `eleos`, `ohiggins`, `crestwood` — ne pouvaient pas rester
telles quelles** : `eleos` et `crestwood` prouvent une voie **claire et
vide**, c'est-à-dire exactement ce que la nouvelle cellule interdit.
Les garder aurait été se comparer à ce qu'on a décidé de ne plus faire.
La table `CHOIX` de `tools/planche-refs.mjs` est à jour.

**Écartées après relevé et après avoir OUVERT l'image :**
`villagesite.com` (Awwwards, mais son premier écran est une vidéo
aérienne — aucune typographie, aucune bande) · `huts.com` (vert forêt,
serif centrée : la voie qu'on fuit) · `rayphilly.com` (relevé
inexploitable, modale plein cadre) · `theyardskempscreek.com`
(bandes, oui, mais brun-noir et deux logos réels dans le premier
écran).

### 1 · House of Honey — `https://www.houseofhoney.com`

*Studio de design d'intérieur, Pasadena.*

**Ce qu'elle prouve.** Qu'un **sable saturé et un brun profond** sont
une palette d'écran entier, pas un accent. Et que le rapport gagnant
est **une bande de couleur pleine largeur portant un affichage géant,
puis une bande de photographie bord à bord**, sans marge entre les
deux.

**Ce qu'on lui prend.** (a) La paire exacte : son sable `#edccbe` et
son brun `#331917` sont à trois points de nos `#e9c9a8` / `#2e1a10`.
(b) Le **titre qui traverse les 1440 px d'un bord à l'autre** — chez
elle une seule ligne, chez nous deux. (c) Les deux libellés de la
bande, l'un calé à gauche, l'autre à droite, sur la même ligne de
base.

**Ce qu'on écarte.** Sa didone et son *of* en italique cursive — nous
n'avons pas une seule serif. Ses fleurs et son rose : notre saturation
est minérale, pas florale.

**Les chiffres du relevé.** Fonds `rgb(237,204,190)` **21 fois** et
`rgb(51,25,23)` **6 fois** — deux valeurs pour 27 des 34 fonds
relevés. Trois familles. Corps **18 px**. Affichage : **hauteur de
capitale 115 px relevée à l'image**, soit ≈ 160 px de corps. Hauteur du
premier écran 900 px. Lenis, pas de GSAP. *(Le `h1` que le relevé
donne à 45 px est un titre de référencement masqué, pas le titre
visible — piège 57 : on ouvre l'image.)*

### 2 · Te Pākau Maru — `https://tepakaumaru.nz/`

*`siteinspire`. Projet résidentiel, Christchurch — Home Capital
Partners.*

**Ce qu'elle prouve.** **Que la composition en bandes est une
composition**, et pas un défaut d'idée : un bandeau de nav, un aplat de
couleur qui porte le titre, un champ clair qui porte la photographie.
Trois registres empilés, aucune colonne, et l'écran tient.

**Ce qu'on lui prend.** (a) L'**empilement de registres pleine largeur**
— c'est le squelette de notre écran. (b) Le **titre à 144 px** posé
bas dans son aplat, calé à gauche, avec beaucoup de couleur vide
au-dessus et à droite. (c) **Une seule famille sur tout le site.**

**Ce qu'on écarte.** L'olive `rgb(87,95,70)` — c'est la couleur qui
nous est interdite, et elle est froide. Le bas de casse : notre titre
est en capitales, parce que la chasse étendue ne se voit qu'en
capitales. Et sa photographie **encadrée avec une marge** : la nôtre
est bord à bord.

**Les chiffres du relevé.** `h1` **144 px / interlignage 144 px**
(ratio 1,0), graisse 400. Corps **16 px** — rapport **× 9**. **Une
seule famille**, « Neue Montreal ». Fonds : olive `rgb(87,95,70)`
8 fois, os `rgb(234,234,230)` 7 fois, blanc 5 fois. Page 8 759 px,
11 grandes images.

### 3 · Edificio O'Higgins 1625 — `https://ohiggins1625.com/`

*`siteinspire`. Immeuble résidentiel, Belgrano, Buenos Aires — Chamber
× Adamo-Faiden.* **La seule référence conservée de la passe
précédente.**

**Ce qu'elle prouve.** Que le rapport d'échelle **est** la composition :
115 px contre 14 px, soit **× 8,2**, sans un seul palier au milieu. Et
que la photographie peut être **bornée** — une bande qui commence à une
ligne nette, coupée par le bord, **sans un mot posé dessus**.

**Ce qu'on lui prend.** (a) Le rapport brutal, tenu ici à **150 px
contre 10 px, soit × 15**. (b) **Chaque ligne calée à un bord
différent** — la première sur x = 56, la seconde sur x = 1384. (c) La
photographie bornée, et **zéro caractère dessus**.

**Ce qu'on écarte.** Le blanc et le noir : deux couleurs, aucune
chaleur. Le mélange de trois familles d'affichage — nous n'en avons
qu'une.

**Les chiffres du relevé.** `h1` **115 px / 70,27 px** — interlignage
**0,611**. Corps **14 px**. Fonds : blanc 56 fois, noir 4 fois, **et
rien d'autre**. Page 21 768 px, 42 images.

---

## La direction artistique

| Poste | Décision |
|---|---|
| **Référence culturelle** | **Une fiche de lot imprimée sur du papier de couleur, et la façade agrafée dedans.** La propriété n'est pas un rêve, c'est un **lot** : un numéro, une surface, une année. Le nom `ARPENT` est l'ancienne mesure de terre québécoise — la marque **est** le concept, et elle survit à la refonte |
| **Palette** | **Cinq valeurs, toutes chaudes. Il n'y a ni gris, ni blanc, ni noir sur cet écran.** · **terre cuite `#a9431a`** — la masse : bande de titre, volet, pavé d'action · **brun profond `#2e1a10`** — bandeau de tête, encre du registre, filets de séparation · **sable saturé `#e9c9a8`** (60 % de saturation) — le champ du registre et le fond du document · **sable clair `#f6e4ce`** — tout texte posé sur un fond sombre · **brun moyen `#6b452e`** — les libellés du registre, et rien d'autre.<br>**`#a9431a` et pas `#c0521f`** : sous le titre en sable clair, la terre cuite plus vive rendait **2,96 : 1**, sous le seuil des grands corps. On assombrit le **fond**, jamais on n'éclaircit un texte déjà presque blanc — une masse doit rester une masse. Contrastes calculés : sable/brun **10,49 : 1**, sable clair/terre cuite **4,75 : 1** (AA tenu même pour les libellés de 10 px), brun moyen/sable **5,29 : 1**. `demos-contraste` rend **min 4,82** aux trois largeurs |
| **Typographie** | **UNE famille, deux graisses, zéro serif.** **`archivo-exp`** = Archivo demandée sur son axe de chasse `wdth` à **125**, téléchargée le 2026-08-01 par `node tools/polices-demos.mjs archivo-exp`, SIL OFL 1.1, relevée dans `fonts/demos/_licences.json`. **La chasse est mesurée, pas promise** : « RUE DE L'ARDOISIERE » à 100 px rend **1 386 px en `archivo-exp` contre 1 128 px en `archivo`**, soit **+ 22,9 %**. C'est la seule étendue du dépôt et elle est réservée à cet écran.<br>Échelle : titre **150 px / interlignage 144 px (0,96)**, graisse 700, capitales ; valeurs du registre **34 px** graisse 700 ; mot-symbole **20 px** ; libellés et surtitres **10 à 11 px** graisse 500, interlettrage **0,22 à 0,26 em**. **Saut 150 → 34 → 10, soit × 4,4 puis × 3,4, et × 15 du titre au libellé sans un palier.**<br>Seul le sous-ensemble **latin de base** est déclaré : tout le texte y tient, tiret cadratin, point médian, espace fine insécable, exposant deux et apostrophe courbe compris. Deux fichiers, 67 ko |
| **Composition du premier écran** | **1440 × 900. Quatre bandes horizontales pleine largeur. Aucune colonne, aucune verticale structurante hormis les filets du registre.**<br>· **y 0 → 64 · BANDEAU**, brun. `ARPENT` 20 px caps 0,22 em à x = 56, base y = 40 ; `COURTAGE IMMOBILIER` 10 px caps 0,26 em à x = 232, même base ; trois liens 11 px caps 0,22 em alignés à droite sur x = 1384, écarts 26 px.<br>· **y 64 → 404 · MASSE DE TITRE**, terre cuite, 340 px. Surtitre `FICHE DE LOT — INSCRIPTION 2026` 11 px caps à x = 56 et `SITE DE DÉMONSTRATION` aligné à droite sur x = 1384, **même ligne de base y = 95**. Titre 150 px / 144, deux lignes, **calées à deux bords différents** : ligne 1 sur x = 56, ligne 2 sur x = 1384. Ligne 1 mesure **1 161 px**, ligne 2 **1 318 px** pour une colonne de **1 328** — la seconde remplit l'écran à 10 px près, et c'est la raison du corps. Capitales visibles de y = 122 à y = 371 ; 33 px de terre cuite sous le bloc.<br>· **y 404 → 744 · BOÎTE AUX LETTRES**, 1440 × 340, bord à bord, aucune marge. **Aucun caractère n'y est posé, jamais.**<br>· **y 744 → 900 · REGISTRE**, sable, 156 px. **Quatre cellules de 270 px et un pavé d'action de 360 px** — 4 × 270 + 360 = 1440 — séparés par des filets de **1 px brun**. Dans chaque cellule : libellé 10 px caps brun moyen à x = cellule + 24, **base y = 780** ; valeur 34 px graisse 700 brun, même retrait, **base y = 855**. Une seule ligne de base pour les quatre libellés, une seule pour les quatre valeurs : c'est ce partage qui en fait un **rang** et non quatre compositions.<br>· **Somme exacte : 64 + 340 + 340 + 156 = 900.** `scrollHeight` relevé : **900** |
| **Le fichier photo** | **`images/secteurs-sites/immobilier-17.webp`, 2400 × 567 — un fichier fabriqué pour cette bande, pas un recadrage CSS.** Source Pexels `20753324` (2501 × 3880), licence Pexels, relevée dans `images/secteurs-sites/_licences.json` ; fenêtre `{ x: 0, y: 0.50, w: 1 }` par `node tools/secteurs-sites-photos.mjs immobilier`, format `PANO = 2400 × 567` ajouté pour l'occasion.<br>**Ce qu'elle montre** : le registre des **trois fenêtres cintrées** d'une façade frontale sous un enduit ocre lavé — trois arcs, leurs corniches, les trumeaux entre eux. Ouverte en pleine résolution : **aucune enseigne, aucune marque, aucun numéro civique, aucune plaque, aucun visage.** Les trois ouvertures sont fermées par des persiennes ou des rideaux.<br>**Pourquoi elle, et pourquoi aucune des seize.** L'écran est passé en boîte aux lettres de **4,235 : 1**. Les seize sources existantes sont des vues MLS — façades de trois quarts depuis le trottoir, salons meublés, chambres. Découpées à cette proportion elles rendent une tranche de bardage, un dossier de canapé ou une plinthe : **il n'y a pas de sujet à cette proportion-là.** Le défaut est **géométrique**, pas photographique, et c'est la même leçon qu'au cadrage 720 × 900 de la passe précédente : une source se juge **sur la tranche qu'elle rendra**, jamais sur l'image entière. Trois bandes d'essai ont été sorties à y = 0,42 / 0,50 / 0,58 et regardées : 0,42 coupe les arcs au-dessus de leur naissance, 0,58 les manque par le bas.<br>**2400 px et pas 2880.** L'original Pexels mesure **2501 px** de large. Sortir 2880 aurait été un agrandissement, ce que D-660 interdit ; 2400 est le plus grand format utile en deçà, soit 0,83 × la densité 2 du panneau |
| **Formes** | **Rayon 0, aucune ombre, aucun dégradé, aucun flou, aucune transparence** — non par obéissance à l'interdit d'APED, qui ne s'applique pas ici, mais parce que la matière de cet écran est **l'aplat**. Une bande est un rectangle plein ; un rayon en ferait une étiquette. Deux épaisseurs de trait et pas trois : **1 px brun** pour les séparations du registre, **10 px sable clair** pour la lisière du volet — la seule ligne qui bouge |
| **Traitement photo** | `filter: saturate(1.06) contrast(1.04)`. **Aucun duotone, aucun virage, aucun voile, aucun grain.** La couleur de la photographie **est** la palette : c'est pour ça qu'elle a été choisie. Le seul réglage relève le noir des embrasures d'un cheveu pour que les trois arcs se détachent du champ à 0,29 |
| **Le geste et l'instant de capture** | **LE VOLET DE TERRE CUITE — un seul geste, et il n'y en a pas d'autre.** Au premier rendu, un pan de la **même terre cuite que la bande de titre** couvre la boîte aux lettres ; il se retire **vers la droite**, arête franche, en **900 ms**, `cubic-bezier(.16, 1, .3, 1)`. Sa lisière porte un filet de **10 px sable clair**. Direction justifiée : une bande se lit de gauche à droite, et la lisière découvre les arcs dans l'ordre où l'œil les prend.<br>**Pourquoi terre cuite et pas brun.** La première passe le peignait en brun : sur l'image arrêtée, le rectangle sombre se lisait comme **une image qui n'a pas chargé**, pas comme un mouvement. En terre cuite, il est **la masse de titre qui descend** — la couleur peinte se retire et découvre exactement la même couleur, en pierre. C'est le sujet de l'écran, rendu littéral par son unique geste.<br>**L'INSTANT : 216 ms, lisière à x = 1170.** La sortie de la courbe vaut 3u − 3u² + u³ ; 0,8125 est atteint à u = 0,4276, soit x(u) = 0,2396 du temps, soit 216 ms. **Pourquoi 1 170 et pas 893** : à 62 % de course la lisière tombait dans le **trumeau** entre le deuxième et le troisième arc — une coupure propre, qui se lit comme une fin de bande. À 1 170 elle coupe le troisième arc **en pleine ouverture**, et un arc à moitié découvert ne peut se lire que comme un mouvement en cours. Le pan garde **270 × 340 px**, soit **78 × 99 px à 0,29** — très au-dessus des 12 px du piège 71. Le pavé d'action commence à x = 1080, **90 px à gauche de la lisière** : l'écart dit que ce sont deux objets et que celui du haut bouge.<br>**Le figeage passe par `<meta name="aped-instant">` et rien d'autre.** Pas d'`animation-delay` négatif — l'outil pose `currentTime` et les deux s'ajouteraient ; pas d'`animation-play-state` (piège 16).<br>**`prefers-reduced-motion`** : `display: none` sur le volet, boîte aux lettres entière dès le premier rendu. Vérifié par sonde. Aucune information n'est portée par le geste |
| **Ce qu'on ne fait pas** | **Aucun montant, nulle part** — ni prix, ni « à partir de », ni évaluation municipale, ni fourchette. `node tools/prix-check.mjs` rend **0 / 0**. Aucun « VENDU », aucun « NOUVEAU ». **Aucune adresse web.** **Aucun mot sur la photographie**, jamais, même pas un crédit. Aucun centrage : tout est calé sur x = 56 ou sur x = 1384. Aucune colonne, aucun split vertical, aucune carte, aucun calculateur d'hypothèque, aucun portrait de courtier, aucune note, aucun témoignage. Et **aucun élément d'APED** : ni minium, ni ciment, ni sa grotesque, ni ses quatre verbes |

---

## Le contenu exact

**Nom fictif :** `ARPENT` — l'ancienne mesure de terre québécoise.

**Le bien est un IMMEUBLE, pas une maison de banlieue**, et ce n'est
pas un détail de rédaction : c'est ce que la photographie montre. La
fiche décrit six logements sur trois étages dans une construction de
1929 ; la façade photographiée est une façade d'immeuble ancien à
trois travées. **Aucune localité n'est nommée**, et c'est délibéré :
l'enduit lavé et les persiennes de cette façade ne sont pas
québécois, et écrire « Montérégie » au-dessus aurait été la faute que
le § 4.5 du standard interdit — *une photo ne contredit jamais le
texte ; si les deux se contredisent, on change la photo, jamais le
texte.* Ici on a changé le texte **parce que la photographie est
meilleure**, et on n'écrit que ce qu'elle soutient : une adresse, des
chiffres.

### Bandeau

| Rôle | Texte exact |
|---|---|
| Mot-symbole | `ARPENT` |
| Descripteur | `COURTAGE IMMOBILIER` |
| Nav | `PROPRIÉTÉS` · `ÉVALUATION` · `CONTACT` |

### Masse de titre

| Rôle | Texte exact |
|---|---|
| Surtitre | `FICHE DE LOT — INSCRIPTION 2026` |
| Mention obligatoire | `SITE DE DÉMONSTRATION` |
| Titre, ligne 1 (calée à gauche) | `104, RUE DE` |
| Titre, ligne 2 (calée à droite) | `L’ARDOISIÈRE` |

*La coupe est **manuelle** : une adresse ne se laisse pas couper par le
navigateur.*

### Le registre — quatre cellules

| # | Libellé (10 px caps) | Valeur (34 px, graisse 700) |
|---|---|---|
| 1 | `SUPERFICIE · M²` | `412` |
| 2 | `LOGEMENTS · ÉTAGES` | `6 · 3` |
| 3 | `ANNÉE DE CONSTRUCTION` | `1929` |
| 4 | `NUMÉRO DE LOT` | `4 782 106` |

*Le séparateur de milliers est une **espace fine insécable**
(`&#8239;`), convention québécoise, épaulée de 0,10 em : à 34 px elle
n'avance que de 1,7 px contre une chasse de chiffre de 22,4 px, et
« 4 782 106 » se lirait « 4782106 ». Le numéro à sept chiffres est le
**format réel** du cadastre du Québec — une forme vraie, sur un lot
inventé.*

***Les chiffres suivent l'image.** La façade photographiée est un
immeuble ancien à trois travées : 412 m² sur six logements et trois
étages, 1929. La fiche de la passe précédente — 178 m², 9 · 4 pièces,
2021 — décrivait un pavillon neuf, et ce pavillon n'est plus là.*

### Pavé d'action

| Rôle | Texte exact |
|---|---|
| Libellé | `DEMANDER LA FICHE` |
| Coordonnée | `000 000-0000` |

### Le texte alternatif

`Façade d’un immeuble ancien, vue de face : trois fenêtres cintrées à
corniche sous un enduit ocre lavé, persiennes baissées et rideaux
clairs.`

---

## Le moment fort, en une phrase

**La terre cuite peinte de la bande de titre et l'ocre photographié de
l'enduit sont la même matière — et l'unique geste de l'écran est cette
couleur peinte qui se retire pour découvrir exactement la même
couleur, en pierre.**

## Ce qui me distingue des onze autres

**Couleur.** Seul écran **chaud-saturé** des douze. Le 04 est jaune
acide sur noir, le 11 bordeaux sur parchemin, le 02 crème et argile :
aucun n'est une **masse orange**. Il n'y a ni gris, ni blanc, ni noir
sur cet écran.

**Typographie.** Seul écran en **grotesque étendue**, mesurée à
+ 22,9 % de chasse sur l'Archivo normale — l'inverse exact de
l'ultra-condensée du 04. Et **une seule famille**, zéro serif : les
quatre serif-sur-crème de la planche (02, 03, 10, 11) ne sont plus que
trois.

**Composition.** Seul écran en **bandes horizontales pleine largeur**.
Aucune colonne, aucun split, aucune grille : quatre registres empilés
qui traversent les 1440 px.

**Photo.** Seul **letterbox** — 1440 × 340, un vrai fichier en
4,235 : 1, pas un `object-position` sur un 16/9.

---

## Les mesures

| Mesure | Relevé |
|---|---|
| hauteur du document à 1440 × 900 | **900** (aucune barre de défilement) |
| débordement horizontal, 320 → 1920 (9 largeurs) | **aucun** |
| erreurs console | **0** |
| `demos-controle` | **ok** |
| `prix-check` — « A RETIRER dans le source » | **0** |
| `demos-contraste` (390 / 768 / 1440) | **ok, min 4,82** |
| arrêts au clavier sans anneau | **0** (4 cibles, cycle refermé) |
| poids du document | **22 ko** · photo 121 ko · polices 67 ko |
| requêtes tierces | **0** |

## Réserves

1. **Aucune mesure n'a été prise sur un appareil réel** — Chromium
   sous Playwright, machine de bureau Windows. La réserve générale du
   dépôt s'applique telle quelle.
2. **Le geste se lit comme un mouvement, mais il faut le savoir.** Un
   pan de couleur arrêté à 81 % de sa course, avec un arc coupé en
   deux et un filet de lumière sur sa lisière : je le vois comme un
   bord en mouvement, et à 0,29 il tient. Je ne peux pas prouver qu'un
   visiteur qui n'a pas lu ce plan le lira pareil — il peut aussi le
   lire comme un aplat de composition. Aucune séquence de cinq
   captures n'a été produite : la vitrine est une image fixe, et c'est
   elle qui a été jugée.
3. **La façade n'est pas québécoise.** Enduit lavé, persiennes
   roulantes, fenêtres cintrées : c'est une façade méditerranéenne.
   L'écran n'affirme aucune localité, donc il ne ment pas — mais un
   client qui voudrait un écran ancré au Québec demanderait une autre
   photographie, et le dépôt n'en a pas qui tienne la boîte aux
   lettres.
4. **`display: contents` sur la `<dl>`** du registre : le comportement
   des lecteurs d'écran sur cette propriété a été bogué longtemps. Ce
   n'est pas mesuré ici — aucun lecteur d'écran réel n'a été passé sur
   cet écran, comme sur aucun des douze.
5. **La photographie est réduite de 0,83** par rapport à la densité 2
   du panneau (2400 px pour 2880 demandés). L'original Pexels ne va
   pas plus haut. Rien ne s'est vu à l'œil sur la capture, mais ce
   n'est pas une netteté de 1 : 1.
