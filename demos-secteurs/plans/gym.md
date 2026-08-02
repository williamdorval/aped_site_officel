# GYM — FONTE NORD

*Un seul écran, 1440 × 900, arrêté. Salle d'entraînement de force.
Aucune photographie, aucune image de fond, aucun visage. Le texte EST
l'image.*

---

## Les trois références

**Mise à jour du 2026-08-01, seconde passe.** Gymbox sort, **PHIVE
entre**, et il faut dire pourquoi les deux.

*PHIVE entre* parce que son relevé était inutilisable et ne l'est plus.
Le premier jet notait « premier écran couvert à 60 % par une fenêtre
Cookiebot que l'outil n'a pas su fermer » et le citait de mémoire, en
appui, sans l'avoir vu. La fenêtre a été fermée
(`#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll`), l'absence
du dialogue vérifiée DEUX fois dans le DOM avant le déclencheur
(piège 72), et `tools/_refs/gym-phive/0-heros.png` refait. C'est
**Awwwards Site of the Day + Developer Award, 5 août 2025**, et c'est
la référence la plus proche de nous du monde entier : il fallait la
regarder pour de vrai.

*Gymbox sort* parce qu'elle n'est pas primée, que son écran porte cinq
appels à l'action concurrents et un prix, et surtout parce que sa
leçon — « un chiffre en train de bouger est le seul mouvement qui se
voit sur une image arrêtée » — est **déjà absorbée** : elle est
devenue le cran et sa trace. Une référence dont on a fini d'apprendre
n'a plus rien à prouver dans un côte-à-côte ; PHIVE, elle, nous
attaque encore.

Les quatre autres écartés le sont pour une raison mécanique, pas pour
un jugement de goût : `blok.london` est un domaine **parqué chez
GoDaddy** (plus de site) · `1rebel.com` sert un **sélecteur de
succursale** de 900 px de haut, il n'y a pas de premier écran à
relever · `coachedby.com` est devenu un **SaaS pour créateurs**, ce
n'est plus une salle · `gymbox.com`, voir ci-dessus.

### Ce que la recherche du 2026-08-01 a rendu, et qu'il faut savoir

Recherche neuve, anglaise et française, sur Awwwards (fitness, sports,
typography), plus une revue des tendances 2026. Le verdict est
inconfortable et il doit rester écrit :

> **Le couple jaune acide + noir dans une salle de sport est un
> cliché de 2026.** HYROX en a fait la couleur de catégorie du fitness
> mondial ; PHIVE l'a montée en Site of the Day ; La Huella la porte
> aussi. Trois références, une seule paire chromatique. Et « la typo
> EST l'image » est le motif de héros dominant de l'année.

Ce n'est pas une raison de changer de couleur — la palette est la
cellule exclusive de ce métier dans la matrice des douze, et la
changer casserait la seule chose qui empêche cet écran de ressembler
aux onze autres. **Mais ce n'est plus la couleur qui nous distingue,
et il ne faut pas se raconter le contraire.** Ce qui nous distingue,
et que la recherche a trouvé INOCCUPÉ dans ce métier, tient en deux
points :

1. **Aucune image, nulle part.** PHIVE, La Huella et HYROX gardent
   tous une photographie ou une vidéo plein cadre sous leur type.
   Aucun des trois ne fait l'affiche jusqu'au bout.
2. **La chasse ultra-condensée.** PHIVE et La Huella emploient des
   grasses larges et blocs ; HYROX une grotesque de chasse normale.
   Personne n'est allé chercher la condensée extrême.

Réserve honnête, non résolue : notre acide `#d6f227` est un
chartreuse, donc du côté HYROX plutôt que du côté PHIVE (`#ffd904`,
un jaune d'autobus scolaire). Un lecteur qui suit Awwwards peut y
lire une parenté. Un jaune décalé — soufre, ou citron froid — la
romprait. **Ça n'a pas été tenté** : la teinte porte trois rapports
de contraste mesurés et une décision de composition, et on ne
déplace pas ça sur la foi d'une comparaison de codes hexadécimaux
qu'on n'a pas posés côte à côte. `RESERVES.md`.

---

### 1 · La Huella Hybrid Club — `https://lahuella.club/en`

**Ce qu'elle prouve.** Qu'un mur de capitales jaunes suffit à porter un
premier écran, et que la photographie qui est derrière ne sert plus à
rien. Sur la capture, la vidéo est si sombre et si floue qu'elle est
devenue une texture : **on peut la retirer sans que l'écran perde une
seule information.** C'est exactement la démonstration dont j'ai besoin
— la référence la plus proche du métier valide ma contrainte au lieu de
la contredire.

**Les chiffres du relevé.** `h1` mesuré 96 px / interlignage 96 px,
capitales, couleur `rgb(253, 202, 56)`, fond de corps
`rgb(15, 15, 15)` · corps 16 px · hauteur de page 9 586 px · 5 images
> 380 px · aucune bibliothèque d'animation détectée (GSAP, Lenis,
Locomotive, Three, Framer : tous faux).
Mesuré à la règle sur `0-heros.png` (1440 × 900) : titre en **trois
lignes**, hauteur de capitale ≈ **85 px** → corps ≈ **118 px** ;
avance de ligne **110 px** → interlignage **0,93** ; bandeau de nav
**noir, 1440 × 68 px, collé au bord haut** ; bandeau **jaune, 1440 ×
100 px, collé au bord bas**, avec le bouton dedans (420 × 50 px, filet
noir de 2 px, libellé ≈ 26 px).

**Ce qu'on lui prend.** Deux choses, précisément. (1) **La structure en
sandwich** : une masse pleine largeur collée au bord haut, une masse
pleine largeur collée au bord bas, et le type qui remplit tout ce qu'il
y a entre les deux — zéro marge de page. (2) **L'inversion comme seul
dispositif de hiérarchie** : le jaune est le texte sur le fond sombre,
le noir est le texte sur le bandeau jaune. Une seule paire de couleurs,
retournée. Je retourne le sien : **acide en fond, noir en texte**, et
c'est le bandeau du bas qui s'inverse.

**Ce qu'on écarte.** Le centrage. Ses trois lignes sont centrées et se
rétrécissent en pointe (760 → 515 → 360 px) — ça fait un sapin, une
forme molle qui ne touche aucun bord. Je vais **au fer à gauche sur les
cinq lignes**, à x = 0, et je laisse le drapeau de droite faire le
dessin. On écarte aussi la vidéo, évidemment, et le bouton cerné d'un
filet : un contour de 2 px est une hésitation, on fait un aplat plein.

---

### 2 · PHIVE Clubs — `https://phive.pt/en` — *Awwwards SOTD + Developer, 05-08-2025*

**Ce qu'elle prouve.** Deux choses, et la seconde fait mal.
(1) Qu'un **jaune saturé et des capitales noires géantes coupées par
les deux bords** gagnent un Site of the Day — la voie n'est pas une
lubie. (2) Que **le mouvement se photographie sur une image arrêtée
sans aucun compteur** : sa bande défilante est prise en pleine
bascule, chaque lettre écrasée un peu plus que la précédente
(`scaleY` 0,9991 · 0,9973 · 0,9922 · 0,9805 · 0,9557 · 0,9069 sur
« e P o r t o »), et deux lettres de remplacement pointent déjà sous
l'arête basse à 0,044 et 0,093. On voit que ça roule, et **aucune
lettre n'est tronquée** — c'est exactement la ligne de crête du
piège 70, tenue par un maître.

**Les chiffres du relevé** *(refait le 2026-08-01, sans le Cookiebot)*.
La page **n'a aucun `h1`** — l'outil serait tombé sur le `<h2>`
conteneur du bandeau, qui rend 16 px : le chiffre aurait été faux et
le plan écrit dessus. Le titre réellement peint est fait de `<span>`
par lettre : **295,125 px**, interlignage **295,125** (ratio 1,00),
chasse **−0,02 em**, graisse 400, capitales, encre `rgb(22, 16, 3)`,
boîte **y 302 → 597**. Une seule famille sur toute la page,
**PPFormula**, corps compris (16 px). Fond de corps déclaré
`rgb(255, 217, 4)`, mais **entièrement masqué** dans le premier écran :
le jaune qu'on VOIT est celui de la bande, `#ffe000`, **22,9 %** des
pixels. **Trois** couleurs dominantes (gris-bleu photographique 57,1 %,
jaune 22,9 %, encre 11,0 %). Photo **et** vidéo, toutes deux en
1440 × 900 `object-fit: cover` : **100 % de la surface**, dont ≈ 67 %
restent visibles autour de la bande.

**Ce qu'on lui prend.** Le **295 px**. C'est le chiffre qui recadre
tout le reste : notre plus grosse ligne fait 181 px. On ne peut pas
la porter à 295 — cinq lignes à 295 feraient 1 475 px dans une
fenêtre de 900 — mais ça confirme qu'on doit tenir le haut de la
fourchette et ne jamais redescendre. Et on lui prend la **coupe par
le bord** : une ligne qui sort du cadre est plus forte qu'une ligne
qui s'y arrête. Chez nous c'est L4 qui touche 1440, et c'est
maintenant L5 qui traverse le socle.

**Ce qu'on écarte.** La photographie, et c'est le point entier : elle
occupe 100 % de sa surface, et c'est précisément la case que la
recherche a trouvée libre. On écarte aussi la **bande** — un ruban
jaune de 33 % sur une photo n'est pas un fond, c'est un bandeau ; nous
prenons les 100 %. On écarte la chasse **large** de PPFormula, la
**pastille arrondie** de la nav flottante en bas, et le **nom de ville
réel** dans le texte.

---

### 3 · Tim Grover / ATTACK Athletics — `https://timgrover.com/`

**Ce qu'elle prouve.** Qu'**une seule famille condensée capitale,
déclinée à quatre tailles seulement, suffit à construire toute une
hiérarchie** — nav, logotype, revendications, bouton : tout est la même
police. Rien n'est différencié par le poids, la couleur ou la casse.
Uniquement par la taille et par un filet. C'est la leçon la plus utile
des trois pour un mur typographique, parce qu'un mur qui mélange les
familles n'est plus un mur, c'est une affiche de vide-grenier.

**Les chiffres du relevé.** `h1` 30 px / 30 px, **Oswald**, graisse
400, capitales, `rgb(255, 255, 255)` sur fond `rgb(0, 0, 0)` · corps
16 px Open Sans · **Swiper** seul détecté, aucune bibliothèque de
défilement · hauteur 6 028 px · 5 images > 380 px.
Mesuré sur `0-heros.png` : **quatre tailles et pas une de plus** —
nav **13 px**, bouton **20 px**, revendications **28 px**, logotype
hauteur de capitale ≈ **78 px** ; les trois lignes de revendication
sont séparées par **deux filets de 1 px, à y = 432 et y = 484**, et
rien d'autre ; bouton **280 × 54 px**.

**Ce qu'on lui prend.** Deux choses. (1) **Une seule famille
d'affichage pour tous les niveaux** — chez moi, `anton` fait le titre,
le logotype et le bouton, et il n'y a rien d'autre en capitales
d'affichage. (2) **Le filet de 1–2 px comme unique séparateur** : pas
de carte, pas d'encadré, pas de fond de bloc. Un trait sous une ligne
et c'est réglé. Ce filet va devenir la trace de mon geste.

**Ce qu'on écarte.** Le doré en dégradé, le fond de verre brisé,
l'éclat lumineux derrière le sujet, l'ombre sous le logotype, le
portrait détouré — cinq effets pour dire une chose. Et le contenu :
« #1 New York Times Bestseller » est un avis de tiers, interdit ici.
On écarte enfin le **fond sombre**, qui est le réflexe de dix sites de
salle sur douze — c'est précisément là que je pars dans l'autre sens.

---

## La direction artistique

*Sept postes. En colonnes, un tableau à sept colonnes tiendrait sur
2 400 px et serait illisible ; il est donc posé en lignes, comme dans
`DIRECTIONS.md`. Les intitulés sont ceux demandés, aucun n'est absent.*

| Poste | Décision |
|---|---|
| **Référence culturelle** | **L'affiche de compétition de force athlétique agrafée sur un mur de bloc de béton**, et le tableau blanc de la salle sur lequel on écrit la séance en capitales. Pas un « site de gym » : une affiche. Tout est trop gros, et c'est le sujet. Le contre-modèle explicite, c'est le club de mieux-être : Kinective (Awwwards HM) ouvre sur un logotype **fin, très interlettré, sur une piscine turquoise** — l'exact opposé, et c'est utile de savoir contre quoi on se dessine. |
| **Palette (hex nommés)** | **acide `#d6f227`** — fond de page, plein cadre, 100 % de la surface non couverte · **noir `#0b0b0b`** — tout le texte du mur, le bandeau du bas, l'aplat du geste, les filets · **blanc `#ffffff`** — **une seule occurrence sur tout l'écran** : le rectangle du bouton. Deux couleurs et un noir, pas une de plus. Le blanc n'est pas une couleur de texte : c'est le repère de l'endroit où on peut agir, et comme c'est le seul blanc, il est impossible à rater sur un écran déjà à 70 % acide. Contrastes : noir/acide **16,8 : 1**, acide/noir **16,8 : 1**, noir/blanc **18,4 : 1**. Les trois passent AAA. |
| **Typographie (familles + tailles px + interlignage)** | **`anton` 400, capitales** — affichage unique : mur **152,25 px** (ligne 4 à **181,15 px**, voir composition), interlignage **0,912** → avance **138,84 px** ; logotype **64 px** ; libellé du bouton **32 px**. *(**Corps corrigés à la construction, et il faut dire pourquoi.** Le premier jet écrivait « 180 px » et « interlignage 0,82 » en supposant une capitale d'Anton à 0,727 em. La métrique du fichier réellement servi donne **0,8604 em** pour une capitale plate, **0,867** pour une ronde, **1,10** pour l'accent du « À » et **−0,0925** pour le jambage du Q. Ce sont les COTES qui font la composition — capitale de 131 px, mur de 712 px, L4 sur 1440 — jamais les corps nominaux, qui n'en étaient que la conséquence calculée. Et 0,82 ferait CHEVAUCHER les lignes de 7 px, sans laisser un pixel au filet de la trace : **0,912 est l'interlignage le plus serré encore possible**, capitale + 8 px de blanc. Il reste plus serré que les 0,88 à 0,96 des autres écrans, donc l'argument tient — mais il tient à 0,912, pas à 0,82.)* Interlettrage **0**, jamais négatif : Anton est déjà condensée, la resserrer la salit. · **`archivo` 600** — nav et ligne d'identité, **14 px** et **13 px**, interlettrage **0,14 em**, capitales. *(600 est la graisse la plus lourde disponible dans `fonts/demos/` ; il n'y a pas de 700.)* · **`jetbrains-mono` 500** — coordonnées **12 px** et mention de démonstration **10 px**. **Trois familles, quatre fichiers, et un seul est gros.** Fichiers réellement téléchargés : `anton-1.woff2`, `archivo-3.woff2`, `jetbrains-mono-1.woff2` — tous les caractères employés (`À É È`) tombent dans `U+0000-00FF`, donc **aucun sous-ensemble latin-ext n'est chargé**. `<link rel="preload">` sur `anton-1.woff2` seulement. |
| **Composition du premier écran (au pixel)** | **Fond acide plein cadre. Aucune marge de page, nulle part : le mur commence à x = 0 et à y = 0.** *(Anton porte une approche gauche ; on la purge par un `margin-left` négatif, mesuré glyphe par glyphe et non « en gros » : **−0,01563 em** pour le U et le À, **−0,03125** pour le D et le E, **−0,0186** pour le Q — pour que le fût de la première lettre tombe sur x = 0 et pas son blanc.)*<br><br>**LE MUR — cinq lignes, `anton`, noir `#0b0b0b`, fer à gauche à x = 0, SAUF L5 qui rentre de 200 px.** Métrique RELEVÉE dans `fonts/demos/anton-1.woff2` : capitale plate **0,8604 × corps**, capitale ronde **0,867**, accent du « À » **1,10**, jambage du Q **−0,0925**. Avance = 0,912 × corps = **138,84 px**.<br>**L1 · « UNE BARRE. »** — 152,25 px · **haut d'encre y = 0,000**, relevé au sous-pixel et non déduit — le mur décalé de +100 px, la barre haute du E lue en luminance : rangée −1 acide pure, rangée 0 noir plein *(les capitales d'Anton sont à sommet plat : la ligne EMBRASSE le bord haut, elle n'est pas rognée. Il a fallu descendre TOUT le mur de 1 px pour que ce soit vrai : le premier montage perdait une rangée entière de capitale.)* · pied **131** · encre **2 → 628** → **touche le bord HAUT et le bord GAUCHE**.<br>**L2 · « DE LA FONTE. »** — 152,25 px · cap-top **138** · pied **270** · encre **1 → 702**. *(Le mot a changé. « DES PLAQUES. » posait le jambage de son Q à x 473 → 516, exactement sur le O de « MONDE » : le mot se LISAIT « MÓNDE ». Aucun décalage ne le sauvait — les deux seuls creux de L3 mesurent 43 et 45 px pour un jambage de 44, il aurait fallu viser à 1,6 px près. Le mur nomme maintenant la matière dont la salle porte le nom : le titre contient le logotype.)*<br>**L3 · « ET DU MONDE »** — 152,25 px · cap-top **277** · pied **409** · encre **1 → 734**.<br>**L4 · « QUI COMPTE TES REPS »** — **181,15 px** · cap-top **416** · pied **573** *(le jambage du Q descend jusqu'à 588)* · encre **2 → 1437** → **touche le bord DROIT**. C'est la seule ligne dont la taille est calculée et non choisie : la chasse d'encre mesurée vaut 7,949 em, il faut donc 181,15 px pour remplir 1440. **Elle se règle par la TAILLE, jamais par l'interlettrage.** Elle est donc plus GROSSE que ses voisines (×1,19), et non plus petite comme l'estimait le premier calcul : elle explose en largeur ET en corps.<br>**L5 · « À VOIX HAUTE. »** — 152,25 px · **retrait de 200 px** · cap-top **580**, accent à **545** · pied **711** · encre **200 → 971**.<br>*Pourquoi L5 rentre, et pourquoi de 200 px exactement.* Le Q de « QUI » AVALAIT l'accent du « À » — 689 pixels communs, l'accent entièrement noyé dans la panse, et « À VOIX HAUTE. » se lisait « A VOIX HAUTE. » : encore un autre mot. Les colonnes vides de L4 ont été relevées au pixel — **[208, 261] · [793, 840] · [1065, 1117]**. L'accent mesure 35 px de large et se tient à 17 px du bord d'encre de L5 : un retrait de 200 px le pose à **x 217 → 251**, centré dans le creux entre « QUI » et « COMPTE », 9 px à gauche et 10 px à droite. **Il n'y a plus un seul pixel commun entre deux lignes du mur** — les quatre jonctions sont mesurées à zéro. L'accent monte dans un blanc, juste au-dessus de sa propre lettre : les deux lignes s'emboîtent au lieu de se cogner. Le jambage du Q de L4 retombe dans l'acide nu et pend sous son filet — c'est une signature, plus un défaut.<br>*Le drapeau de droite dessine 628 · 702 · 734 · **1437** · 971 : trois lignes courtes qui montent en escalier, une qui explose jusqu'au bord, une qui retombe **sans revenir au départ**. C'est le rythme d'une série : trois répétitions faciles, une qui force, une de décharge. La marge de droite fait **469 px** — le premier montage en laissait 669, et un escalier cassé par-dessus.*<br><br>**LA TRAVERSÉE — l'arête du socle coupe L5 à y = 645, et la lettre continue dans l'autre couleur.** *Le défaut qu'elle corrige.* Le socle montait à **712**, soit le pied de L5 à un pixel près. Du noir posé au pied d'une ligne NOIRE ne fait pas une arête, il fait une **soudure** : les pieds de « À VOIX HAUTE. » disparaissaient dans la masse, et à 0,29 la ligne se lisait comme un mot mangé par le bas. Un débordement SUBI, pas un parti — même famille que le piège 70. *Le parti.* Sous 645, la lettre ne s'arrête plus : elle **change de couleur et continue**, acide sur noir, par la même plaque `difference` qui sert au cran. Un débordement qui se poursuit est lu comme voulu ; un débordement qui s'arrête est lu comme une panne. *Pourquoi 645.* Le fût de L5 va de 580 à 711 : **645 en est la moitié** (65 px dessus, 66 dessous). Cinq hauteurs montées et REGARDÉES à 1440 puis à 0,29 — 638 · 645 · 656 · 662 · 668. Les traverses des H, A et E de la ligne occupent **598-603 · 628-652 · 670-693** : à 656 et à 668 le cut tombe à deux ou trois pixels d'une traverse, les deux horizontales se confondent et le mot devient mou. À 645 la seule plage d'encre large est la **taille du X** (x 603-665), un croisement de diagonales qui n'a aucune horizontale à détruire. La part inversée pèse **66 px**, soit **19 px** dans le panneau — bien au-dessus des 12 px du piège 71. *(Une sonde qui comptait « les rangées sans plage d'encre large » déclarait 645 mauvais et 656 bon : elle prenait la taille du X pour une traverse et ne mesurait pas la DISTANCE à la traverse voisine, seule chose qui compte. L'œil avait raison contre l'instrument — piège 74.)* *Ce que la plaque ne fait pas.* Elle s'arrête à **712**, pas à 900 : sous 712 le socle reprend un `background` noir déclaré. Les pixels sont identiques au bit près — |acide − inv| = rgb(11,11,11) = `--noir`, mesuré, aucune couture — mais `demos-contraste.mjs` remonte l'arbre jusqu'à la première surface OPAQUE, et une plaque de mélange n'en est pas une : avec la plaque jusqu'en bas, il rendait **7 faux échecs à 1440**, dont « 1:1 · FONTE NORD ». On ne corrige pas l'outil pour un écran, on lui rend sa prise. <br><br>**LE SOCLE — noir `#0b0b0b`, x 0 → 1440, y 645 → 900 (255 px).** **Touche les bords BAS, GAUCHE et DROIT — et son arête haute COUPE L5 EN DEUX** (voir « la traversée », juste au-dessus). Il porte tout le mobilier de l'interface — il n'y a **aucune nav en haut de l'écran**, et c'est une décision : le bord haut appartient au titre, sinon la voie ne tient pas. Deux rangs, **sans aucun filet de séparation** — voir « ce qu'on ne fait pas ».<br>· *Rang 1* — **logotype `FONTE NORD`**, `anton` **64 px** acide *(même correction de corps que le mur : 64 px donnent la capitale de 55 px que le plan dessinait sous l'étiquette « 76 px »)*, cap-top **730**, pied **785**, x **28 → 404**. **Nav** à droite, `archivo` 600 **14 px** acide capitales, interlettrage 0,14 em, ligne de base **762**, calée sur x = 1412 : `LE PLATEAU` (x 932) · `L'HORAIRE` (x 1046) · `LES COACHS` (x 1150) · `PREMIÈRE VISITE` (x 1264).<br>· *Rang 2, à gauche — **DEUX lignes, plus trois**.* `archivo` 600 **13 px** acide, ls 0,16 em, base **846** : `ATELIER DE FORCE · VILLERAY, MONTRÉAL`. `jetbrains-mono` **12 px** acide, ls 0,06 em, base **872** : `000 000-0000 · COURRIEL@EXEMPLE.CA · SITE DE DÉMONSTRATION`. *(Il y en avait trois — 13 px archivo, 12 px mono, 10 px mono — trois rangs, trois corps, deux familles, en escalier décroissant : la silhouette exacte d'un pied de page légal. À 0,29 elles tombent à 3,8 · 3,5 · 2,9 px, c'est-à-dire de la TEXTURE, et une texture se compose en blocs réguliers, jamais en trois rangs qui miment de l'information qu'on ne peut plus lire. `ADRESSE SUR DEMANDE` disparaît : la ville est nommée à la ligne du dessus. La mention de démonstration reste au même corps que le numéro — ni cachée, ni rapetissée. La base à 872 pose **28 px** sous la dernière ligne : la marge de gauche, enfin tenue en bas aussi.)*<br>· *Rang 2, à droite* — **LE BOUTON, seul objet blanc de l'écran** : rectangle **`#ffffff`**, x **1080 → 1412**, y **785 → 872** (**332 × 87 px**), aucun rayon, aucun filet, aucune ombre. Libellé `RÉSERVER UN ESSAI`, `anton` **32 px**, noir `#0b0b0b`, centré. *Ses quatre côtés ont une raison, et c'est la correction.* Il était posé à x 1080 → 1412, y 812 → 878 : le seul objet de l'écran dont aucune arête ne se déduisait d'autre chose, quatre nombres qui n'étaient que le reste d'une soustraction. C'est **ça** que « zéro élément par défaut » désigne — pas le bouton, qui est mérité, mais son **assiette**. Désormais : bord droit **1412**, la marge de 28 que tiennent la nav et le logotype · bord haut **785**, le pied du logotype · bord bas **872**, la base des coordonnées. Il fait exactement la hauteur du bloc d'information qu'il conclut. *Et il ne touche PAS le cadre, ce qui a été essayé et refusé.* Une première correction l'encastrait dans l'angle bas-droit, pour la même raison que L1 touche le bord haut. À 1440 c'était juste ; à 0,29, dans le panneau, l'écran est posé sur une carte CLAIRE et le blanc s'y fondait — **le coin de l'écran paraissait arraché**. Le seul blanc de la page ne peut pas toucher un bord : il lui faut du noir sur ses quatre côtés pour rester un objet. Encore un verdict qui ne se voit qu'à l'échelle de l'aperçu. |
| **Formes** | Angles vifs partout, **rayon 0**. **Aucune ombre, aucun dégradé, aucun flou** — rien à quoi se raccrocher, tout est un aplat plein ou un filet. Trois primitives et pas une quatrième : **l'aplat pleine largeur** (le bandeau, l'aplat du geste), **le filet** (1 px acide dans le bandeau ; 2 px noir sous les lignes du mur), **le rectangle plein** (le bouton). Le bouton n'a pas de flèche, pas d'icône, pas de chevron : un rectangle et un mot. |
| **Le geste et l'instant de capture** | **UN SEUL GESTE — « LE CRAN ».** Un **aplat noir pleine largeur (x 0 → 1440)** se pose derrière **une** ligne du mur à la fois ; la ligne qu'il couvre passe de noir-sur-acide à **acide-sur-noir**. Il descend d'**une ligne tous les 220 ms**, en **un seul cran** — `steps(1)`, **aucun fondu, aucun glissement, aucune interpolation de position**. Cinq crans, **1 100 ms** en tout, puis l'aplat disparaît. Hauteurs de l'aplat, ligne par ligne : y 0→139 · 139→278 · 278→417 · **417→580** · 580→712 *(le cinquième vient mourir exactement sur le bord haut du bandeau : à la dernière image, l'aplat et le bandeau ne font plus qu'une seule masse noire, et c'est la fin du geste).*<br>**Sa trace.** Quand l'aplat quitte une ligne, il **y laisse un filet noir de 2 px**, de x = 0 à la largeur d'encre de cette ligne, posé **2 px sous le pied** — et non 7, il n'y a pas 7 px à prendre sans desserrer le mur : y **134** (629 px) · **273** (703) · **412** (737) · **575** (1440). Le cinquième serait absorbé par le bandeau : il n'y en a donc que quatre, et c'est voulu. **C'est ce qui rend la DIRECTION lisible sur une image arrêtée** : au-dessus de l'aplat, des lignes soulignées ; en dessous, des lignes nues. On voit que ça descend.<br>**INSTANT DE CAPTURE : `t = 690 ms`.** On est dans le 4ᵉ cran (660 → 880 ms). Sur l'image figée on voit : **L1, L2, L3 en noir sur acide, chacune soulignée d'un filet** · **L4 inversée — une bande noire pleine largeur de y 417 à y 580, avec `QUI COMPTE TES REPS` en acide dedans, d'un bord à l'autre** · **L5 nue, sans filet** · le bandeau noir en bas. *(L'accent du « À » de L5 monte à y 545 : il est donc DANS la bande à cet instant, et l'aplat l'inverse avec le reste — un tiret acide à x 217 → 251, à 5 px au-dessus de sa propre lettre. C'est le seul caractère du mur que le geste coupe en deux couleurs. Au repos il est noir, collé à son À, et il se lit sans hésitation.)* **Deux masses noires pleine largeur, une au milieu et une au pied, et la masse du milieu n'est alignée sur aucune structure** — elle ne peut être qu'en transit. C'est le 4ᵉ cran qui est choisi, et pas un autre, parce que L4 est la seule ligne qui touche le bord droit : l'aplat la couvre exactement d'un bord à l'autre, sans dépasser ni manquer.<br>**Repos et mouvement réduit.** État de repos = état FINAL = les cinq lignes en noir sur acide **avec leurs quatre filets**, aucun aplat. `prefers-reduced-motion: reduce` rend directement cet état. **Aucune information ne se perd** : les filets ne portent rien, ce sont une trace ; le texte, la nav, le bouton et les coordonnées sont lisibles et cliquables sans une seule image de l'animation. |
| **Ce qu'on ne fait pas** | **Pas de fond sombre** — c'est le réflexe de dix salles sur douze et c'est exactement ce qui rend cet écran impossible à confondre. · **Pas de photographie, pas de vidéo, pas de texture, pas de grain, pas de bruit** : le fond est un aplat de `#d6f227`, un seul ton, zéro variation. · **Aucun visage.** · **Aucun orange**, aucun minium `#e2401f`, aucun ciment : rien de l'identité d'APED. · **Pas de nav en haut** — le bord haut est au titre. · **Pas de filet de séparation dans le socle** : il y en avait un, acide, de 1 px, sur toute la largeur, à 796. C'était la marque la plus « pied de page » de l'écran — deux rangs séparés par une réglure, comme partout. Le logotype fait 64 px et les coordonnées 12 : le saut de taille sépare déjà les deux rangs, et la réglure par-dessus n'ajoutait qu'un aveu. Le filet reste dans le vocabulaire, où il sert quatre fois comme trace du geste. · **Pas de deuxième bouton**, pas de « ou », pas de lien secondaire à côté du bouton. · **Pas de chiffre** : pas de nombre de membres, pas d'année de fondation, pas de tonnage soulevé, pas de compteur — un chiffre inventé est une fausseté, et un compteur qui roule serait le mouvement facile. · **Aucun prix.** · **Pas d'avis, pas de note, pas de témoignage.** · **Pas d'italique, pas de bas de casse dans le mur, pas d'interlettrage négatif, pas de contour, pas de texte détouré.** · **Pas de défilement** : il n'y a rien sous les 900 px, et l'écran ne fait pas semblant qu'il y a une suite (aucune flèche vers le bas, aucun « défiler »). |

---

## Le contenu exact

*Tout le texte de l'écran, prêt à coller. Rien d'autre ne s'affiche.*

**Nom de l'entreprise (fictive)**

```
FONTE NORD
```

**Titre du héros — cinq lignes, dans cet ordre, `anton` capitales**

```
UNE BARRE.
DE LA FONTE.
ET DU MONDE
QUI COMPTE TES REPS
À VOIX HAUTE.
```

> *Pourquoi cette phrase et pas une autre.* C'est **une seule phrase**,
> faite de noms concrets et d'un seul verbe, sans un adjectif. Elle
> **décrit la pièce** au lieu de promettre un résultat : une barre, de
> la fonte, et quelqu'un qui compte tes répétitions à voix haute. Il
> n'y a donc **rien à vérifier et rien à contester** — pas de « meilleur »,
> pas de « transformez », pas de chiffre. Un patron de garage la
> comprend en une seconde et sait immédiatement que ce n'est pas un
> gym d'appareils : c'est une salle de force où on t'assiste. Et
> « compter à voix haute » est le seul détail que les onze autres plans
> ne peuvent pas avoir, parce qu'il n'appartient qu'à ce métier.
>
> *Et pourquoi « DE LA FONTE. » et non « DES PLAQUES. ».* Le premier
> montage disait « DES PLAQUES. », et le jambage de son Q tombait sur
> le O de « MONDE » : à pleine taille, le mot se **lisait « MÓNDE »**.
> Un chevauchement de jambages dans une affiche serrée est un idiome ;
> faire lire un autre mot n'en est pas un, et **aucun mot de cet écran
> ne doit se lire autrement qu'il s'écrit**. Aucun corps ni aucun
> décalage ne dégageait le jambage dans les 712 px disponibles : la
> correction est donc éditoriale. « De la fonte » est le mot du métier
> en français — c'est ce qu'on soulève — et il reste un nom concret,
> sans un adjectif et sans un chiffre. Bonus assumé : le mur nomme la
> matière dont la salle porte le nom, et le titre contient le logotype.

**Sous-titre / ligne d'identité** *(rang 2 du bandeau, à gauche)*

```
ATELIER DE FORCE · VILLERAY, MONTRÉAL
```

**Libellés de nav** *(rang 1 du bandeau, à droite, dans cet ordre de gauche à droite)*

```
LE PLATEAU
L'HORAIRE
LES COACHS
PREMIÈRE VISITE
```

**Libellé du bouton** *(unique)*

```
RÉSERVER UN ESSAI
```

**Coordonnées ET mention, sur UNE seule ligne** *(rang 2 du socle, sous la ligne d'identité, `jetbrains-mono` 12 px)*

```
000 000-0000 · COURRIEL@EXEMPLE.CA · SITE DE DÉMONSTRATION
```

> *Pourquoi une ligne et non trois.* Le premier montage empilait
> l'identité (13 px archivo), les coordonnées (12 px mono) et la
> mention (10 px mono) : trois rangs, trois corps, deux familles, en
> escalier décroissant — le dessin exact d'un pied de page légal, et
> l'objet le plus « site web » d'un écran qui prétend être une
> affiche. À l'échelle du panneau ces trois lignes valent 3,8 · 3,5 ·
> 2,9 px : ce n'est plus de l'information, c'est de la **texture**,
> et une texture se compose en blocs réguliers. Un seul corps, une
> seule ligne, et le bloc devient la réglure de gris homogène qu'il
> aurait toujours dû être. `ADRESSE SUR DEMANDE` tombe — la ville est
> déjà nommée à la ligne du dessus, et rien ne se perd. La mention de
> démonstration garde le corps du numéro : elle n'est ni cachée, ni
> rapetissée, et `demos-controle.mjs` la trouve.

**`<title>` de la page**

```
FONTE NORD — atelier de force · site de démonstration
```

*Et dans le `<head>` :* `<meta name="robots" content="noindex,nofollow">`.

**Ce qui ne figure nulle part sur cet écran** : aucun prix, aucune
adresse civique, aucun nom de personne, aucun horaire chiffré, aucun
nombre de membres, aucune date de fondation, aucun logo tiers, aucune
note, aucun avis. **L'écran ne contient pas un seul chiffre en dehors
du numéro de téléphone neutre.**

---

## Ce qui me distingue des onze autres

**Composition.** Je suis le seul dont le premier écran **n'a pas de nav
en haut** et **pas une seule image** — et, depuis la seconde passe, le
seul dont **une ligne du titre traverse le socle** : sous y = 645 les
lettres de « À VOIX HAUTE. » ne s'arrêtent pas, elles changent de
couleur et continuent. C'est ce qui empêche le bas de l'écran d'être
un pied de page : le socle n'est plus posé SOUS l'affiche, il en fait
partie. Et c'est la réponse au seul reproche que la recherche adresse
à cette voie — La Huella porte un bandeau pleine largeur en bas,
PHIVE une barre en bas, dans exactement cette palette : deux primés
occupent déjà cette zone. Aucun des deux ne la fait percer par son
titre.

Pour le reste, rien n'a bougé : cinq lignes de capitales, quatre
qui partent à x = 0 et la première à y = 0 au pixel, dont une traverse
les 1440 px d'un bord à l'autre — la cinquième rentre de 200 px pour
que l'accent de son « À » se loge dans un creux de la ligne du dessus,
et ce décrochement est ce qui fait tenir l'escalier. Tout le mobilier
— logotype, nav, bouton, coordonnées — est rangé dans un unique
socle noir de 255 px collé au bord bas. Les onze autres ouvrent sur
une photographie ou sur une mise en page ; moi j'ouvre sur une affiche.

**Couleur.** Je suis le seul dont le fond de page est une couleur
criarde : `#d6f227` sur 100 % de la surface, sans une texture ni une
variation de ton — pendant que six des onze partent sur un fond sombre
et que les cinq clairs restants sont des blancs, des crèmes, des roses
de presse et des glaciers. Et je n'utilise que **trois valeurs**, dont
le blanc **une seule fois**, sur les 332 × 87 px du bouton.

**Typographie.** Je suis le seul à ne monter qu'**une seule famille
d'affichage jusqu'à 181 px avec un interlignage de 0,912** — 8 px de
blanc entre la capitale d'une ligne et celle de la suivante, tout juste
de quoi loger le filet de 2 px de la trace, ce qui fait que les lignes
se touchent presque et que le bloc devient un mur plein plutôt qu'un
empilement de phrases. Les autres tiennent leur héros entre 90 et
160 px avec un interlignage de 0,88 à 0,96 : chez eux le titre est un
élément de la page, chez moi **le titre EST la page**. *(Le premier jet
annonçait 180 px et 0,82. C'était une arithmétique faite sur une
capitale supposée à 0,727 em ; la vraie mesure d'Anton est 0,8604, et
0,82 ferait chevaucher les lignes de 7 px. Les cotes dessinées sont
tenues, les corps nominaux ont bougé pour les tenir.)*
