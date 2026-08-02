# GYM — FONTE NORD

*Un seul écran, 1440 × 900, arrêté. Salle d'entraînement de force.
Aucune photographie, aucune image de fond, aucun visage. Le texte EST
l'image.*

---

## Les trois références

Sept sites relevés, trois retenus. Les quatre écartés le sont pour une
raison mécanique, pas pour un jugement de goût :
`blok.london` est un domaine **parqué chez GoDaddy** (plus de site) ·
`1rebel.com` sert un **sélecteur de succursale** de 900 px de haut, il
n'y a pas de premier écran à relever · `coachedby.com` est devenu un
**SaaS pour créateurs**, ce n'est plus une salle · `phive.pt` (Site of
the Day, août 2025) a rendu un premier écran **couvert à 60 % par une
fenêtre Cookiebot** que l'outil n'a pas su fermer — son relevé reste
néanmoins la mesure la plus proche de notre voie et je la cite en
appui : `background-color` du corps = **`rgb(255, 217, 4)`**, un
jaune saturé en fond de page, sur un site primé, avec des capitales
noires géantes **coupées par les deux bords latéraux**. C'est la preuve
que la voie « fond criard + mur de type coupé » n'est pas une lubie.

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

### 2 · Gymbox — `https://www.gymbox.com/`

**Ce qu'elle prouve.** Qu'une salle peut être drôle et dure en même
temps, et surtout : **qu'un chiffre en train de bouger est le seul
mouvement qui se voit sur une image arrêtée.** Sa bande de compte à
rebours, en bas de l'écran, a été photographiée à `01 : 04 : 07 : 40`.
La capture est figée et pourtant on sait que ça descend. C'est
littéralement la réponse à la question « comment prouver le mouvement
sur une image fixe », et je la lui vole en la transposant.

**Les chiffres du relevé.** `h1` déclaré 20 px / 18 px — **le vrai
titre n'est pas un `h1`**, l'outil a attrapé une baseline de carrousel ;
famille propriétaire « GymBox Std », jaune `rgb(255, 205, 51)`, fond de
corps `rgb(0, 0, 0)` · corps 20 px · **Lenis** et **Swiper** détectés,
pas de GSAP · hauteur 7 600 px · 9 images > 380 px.
Mesuré sur `0-heros.png` : titre en **deux lignes**, hauteur de
capitale ≈ **63 px** → corps ≈ **88 px** ; avance **81 px** →
interlignage **0,92** ; deux boutons de **300 × 36 px** côte à côte ;
bande de compte à rebours **entre deux filets jaunes de 1 px, à
y = 740 et y = 838**, chiffres blancs ≈ 34 px, libellés jaunes ≈ 9 px ;
bouton « JOIN NOW » **188 × 37 px** en haut à droite.

**Ce qu'on lui prend.** Le principe du **témoin de mouvement rangé dans
une bande, en bas, entre deux filets** — un objet qui n'appartient pas
au titre, qui a sa propre géométrie, et qui prouve que la page est
vivante. Chez moi ce ne sera pas un décompte (un décompte est une
promesse commerciale, et je n'en fais aucune) mais **la position d'un
aplat noir dans une descente**.

**Ce qu'on écarte.** Tout le reste, et il y a beaucoup à écarter. Le
titre porte une **ombre portée sombre** décalée — mou et daté. Le fond
est une vidéo si sous-exposée qu'on ne distingue rien : une photo qu'on
ne voit pas est une photo qui coûte 2 Mo pour rien. Et l'écran contient
**cinq appels à l'action concurrents** (JOIN NOW, UNLOCK THE DEAL, FREE
TRIAL, la nav, le décompte) : personne ne sait où cliquer. **Un seul
bouton chez moi.** On écarte enfin le prix affiché — interdit ici.

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
| **Typographie (familles + tailles px + interlignage)** | **`anton` 400, capitales** — affichage unique : mur **180 px** (ligne 4 à **166 px**, voir composition), interlignage **0,82** → avance **148 px** ; logotype **76 px** ; libellé du bouton **32 px**. Interlettrage **0**, jamais négatif : Anton est déjà condensée, la resserrer la salit. · **`archivo` 600** — nav et ligne d'identité, **14 px** et **13 px**, interlettrage **0,14 em**, capitales. *(600 est la graisse la plus lourde disponible dans `fonts/demos/` ; il n'y a pas de 700.)* · **`jetbrains-mono` 500** — coordonnées **12 px** et mention de démonstration **10 px**. **Trois familles, quatre fichiers, et un seul est gros.** Fichiers réellement téléchargés : `anton-1.woff2`, `archivo-3.woff2`, `jetbrains-mono-1.woff2` — tous les caractères employés (`À É È`) tombent dans `U+0000-00FF`, donc **aucun sous-ensemble latin-ext n'est chargé**. `<link rel="preload">` sur `anton-1.woff2` seulement. |
| **Composition du premier écran (au pixel)** | **Fond acide plein cadre. Aucune marge de page, nulle part : le mur commence à x = 0 et à y = 0.** *(Anton porte un approche gauche ; on la purge par un `margin-left` négatif d'environ **−0,055 em**, soit −10 px à 180 px, pour que le fût de la première lettre tombe sur x = 0 et pas son blanc.)*<br><br>**LE MUR — cinq lignes, `anton`, noir `#0b0b0b`, fer à gauche à x = 0.** Hauteur de capitale d'Anton = **0,727 × corps**. Avance = 0,82 × corps.<br>**L1 · « UNE BARRE. »** — 180 px · cap-top **y = 0** *(les capitales d'Anton sont à sommet plat : la ligne EMBRASSE le bord haut, elle n'est pas rognée)* · pied **131** · largeur **≈ 835 px** → **touche le bord HAUT et le bord GAUCHE**.<br>**L2 · « DES PLAQUES. »** — 180 px · cap-top **148** · pied **279** · ≈ **916 px**.<br>**L3 · « ET DU MONDE »** — 180 px · cap-top **296** · pied **427** · ≈ **963 px**.<br>**L4 · « QUI COMPTE TES REPS »** — **166 px** · cap-top **444** · pied **565** · largeur **1440 px exactement** → **touche le bord DROIT**. C'est la seule ligne dont la taille est calculée et non choisie : 8,69 em de chasse à remplir sur 1440 px donne 165,7 px. **Elle se règle par la TAILLE, jamais par l'interlettrage** — si Anton mesure autrement à la construction, on bouge le corps de L4 entre 160 et 172 px jusqu'à ce que la ligne tombe sur 1440, et on ne touche à rien d'autre.<br>**L5 · « À VOIX HAUTE. »** — 180 px · cap-top **580** · pied **711** · ≈ **841 px**.<br>*Le drapeau de droite dessine 835 · 916 · 963 · **1440** · 841 : quatre lignes courtes qui montent en escalier, une qui explose jusqu'au bord, une qui retombe. C'est le rythme d'une série : trois répétitions faciles, une qui force, une de décharge.*<br><br>**LE BANDEAU — noir `#0b0b0b`, x 0 → 1440, y 712 → 900 (188 px).** Collé au pied du mur sans un pixel d'écart. **Touche les bords BAS, GAUCHE et DROIT.** Il porte tout le mobilier de l'interface — il n'y a **aucune nav en haut de l'écran**, et c'est une décision : le bord haut appartient au titre, sinon la voie ne tient pas. Deux rangs, séparés par **un filet acide de 1 px sur toute la largeur, à y = 796**.<br>· *Rang 1* — **logotype `FONTE NORD`**, `anton` **76 px** acide, cap-top **730**, pied **785**, x **28 → 404**. **Nav** à droite, `archivo` 600 **14 px** acide capitales, interlettrage 0,14 em, ligne de base **762**, calée sur x = 1412 : `LE PLATEAU` (x 932) · `L'HORAIRE` (x 1046) · `LES COACHS` (x 1150) · `PREMIÈRE VISITE` (x 1264).<br>· *Rang 2, à gauche* — `archivo` 600 **13 px** acide, ls 0,16 em, base **832** : `ATELIER DE FORCE · VILLERAY, MONTRÉAL`. `jetbrains-mono` **12 px** acide, base **858** : `000 000-0000 · courriel@exemple.ca · ADRESSE SUR DEMANDE`. `jetbrains-mono` **10 px** acide, ls 0,14 em, base **884** : `SITE DE DÉMONSTRATION`.<br>· *Rang 2, à droite* — **LE BOUTON, seul objet blanc de l'écran** : rectangle **`#ffffff`**, x **1080 → 1412**, y **812 → 878** (**332 × 66 px**), aucun rayon, aucun filet, aucune ombre. Libellé `RÉSERVER UN ESSAI`, `anton` **32 px**, noir `#0b0b0b`, cap-top **828**, centré → x ≈ 1121 → 1370. |
| **Formes** | Angles vifs partout, **rayon 0**. **Aucune ombre, aucun dégradé, aucun flou** — rien à quoi se raccrocher, tout est un aplat plein ou un filet. Trois primitives et pas une quatrième : **l'aplat pleine largeur** (le bandeau, l'aplat du geste), **le filet** (1 px acide dans le bandeau ; 2 px noir sous les lignes du mur), **le rectangle plein** (le bouton). Le bouton n'a pas de flèche, pas d'icône, pas de chevron : un rectangle et un mot. |
| **Le geste et l'instant de capture** | **UN SEUL GESTE — « LE CRAN ».** Un **aplat noir pleine largeur (x 0 → 1440)** se pose derrière **une** ligne du mur à la fois ; la ligne qu'il couvre passe de noir-sur-acide à **acide-sur-noir**. Il descend d'**une ligne tous les 220 ms**, en **un seul cran** — `steps(1)`, **aucun fondu, aucun glissement, aucune interpolation de position**. Cinq crans, **1 100 ms** en tout, puis l'aplat disparaît. Hauteurs de l'aplat, ligne par ligne : y 0→148 · 148→296 · 296→444 · **444→580** · 574→712 *(le cinquième vient mourir exactement sur le bord haut du bandeau : à la dernière image, l'aplat et le bandeau ne font plus qu'une seule masse noire, et c'est la fin du geste).*<br>**Sa trace.** Quand l'aplat quitte une ligne, il **y laisse un filet noir de 2 px**, de x = 0 à la largeur de cette ligne, posé **7 px sous le pied** : y **138** (835 px) · **286** (916) · **434** (963) · **572** (1440) · **718** — le cinquième est absorbé par le bandeau, donc il n'y en a que quatre de visibles. **C'est ce qui rend la DIRECTION lisible sur une image arrêtée** : au-dessus de l'aplat, des lignes soulignées ; en dessous, des lignes nues. On voit que ça descend.<br>**INSTANT DE CAPTURE : `t = 690 ms`.** On est dans le 4ᵉ cran (660 → 880 ms). Sur l'image figée on voit : **L1, L2, L3 en noir sur acide, chacune soulignée d'un filet** · **L4 inversée — une bande noire pleine largeur de y 444 à y 580, avec `QUI COMPTE TES REPS` en acide dedans, d'un bord à l'autre** · **L5 nue, sans filet** · le bandeau noir en bas. **Deux masses noires pleine largeur, une au milieu et une au pied, et la masse du milieu n'est alignée sur aucune structure** — elle ne peut être qu'en transit. C'est le 4ᵉ cran qui est choisi, et pas un autre, parce que L4 est la seule ligne qui touche le bord droit : l'aplat la couvre exactement d'un bord à l'autre, sans dépasser ni manquer.<br>**Repos et mouvement réduit.** État de repos = état FINAL = les cinq lignes en noir sur acide **avec leurs quatre filets**, aucun aplat. `prefers-reduced-motion: reduce` rend directement cet état. **Aucune information ne se perd** : les filets ne portent rien, ce sont une trace ; le texte, la nav, le bouton et les coordonnées sont lisibles et cliquables sans une seule image de l'animation. |
| **Ce qu'on ne fait pas** | **Pas de fond sombre** — c'est le réflexe de dix salles sur douze et c'est exactement ce qui rend cet écran impossible à confondre. · **Pas de photographie, pas de vidéo, pas de texture, pas de grain, pas de bruit** : le fond est un aplat de `#d6f227`, un seul ton, zéro variation. · **Aucun visage.** · **Aucun orange**, aucun minium `#e2401f`, aucun ciment : rien de l'identité d'APED. · **Pas de nav en haut** — le bord haut est au titre. · **Pas de deuxième bouton**, pas de « ou », pas de lien secondaire à côté du bouton. · **Pas de chiffre** : pas de nombre de membres, pas d'année de fondation, pas de tonnage soulevé, pas de compteur — un chiffre inventé est une fausseté, et un compteur qui roule serait le mouvement facile. · **Aucun prix.** · **Pas d'avis, pas de note, pas de témoignage.** · **Pas d'italique, pas de bas de casse dans le mur, pas d'interlettrage négatif, pas de contour, pas de texte détouré.** · **Pas de défilement** : il n'y a rien sous les 900 px, et l'écran ne fait pas semblant qu'il y a une suite (aucune flèche vers le bas, aucun « défiler »). |

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
DES PLAQUES.
ET DU MONDE
QUI COMPTE TES REPS
À VOIX HAUTE.
```

> *Pourquoi cette phrase et pas une autre.* C'est **une seule phrase**,
> faite de noms concrets et d'un seul verbe, sans un adjectif. Elle
> **décrit la pièce** au lieu de promettre un résultat : une barre, des
> plaques, et quelqu'un qui compte tes répétitions à voix haute. Il n'y
> a donc **rien à vérifier et rien à contester** — pas de « meilleur »,
> pas de « transformez », pas de chiffre. Un patron de garage la
> comprend en une seconde et sait immédiatement que ce n'est pas un
> gym d'appareils : c'est une salle de force où on t'assiste. Et
> « compter à voix haute » est le seul détail que les onze autres plans
> ne peuvent pas avoir, parce qu'il n'appartient qu'à ce métier.

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

**Coordonnées** *(rang 2 du bandeau, sous la ligne d'identité)*

```
000 000-0000 · courriel@exemple.ca · ADRESSE SUR DEMANDE
```

**Mention obligatoire** *(rang 2 du bandeau, dernière ligne, `jetbrains-mono` 10 px)*

```
SITE DE DÉMONSTRATION
```

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
en haut** et **pas une seule image** : cinq lignes de capitales qui
partent à x = 0 et à y = 0, dont une traverse les 1440 px d'un bord à
l'autre, et tout le mobilier — logotype, nav, bouton, coordonnées —
rangé dans un unique bandeau noir de 188 px collé au bord bas. Les onze
autres ouvrent sur une photographie ou sur une mise en page ; moi
j'ouvre sur une affiche.

**Couleur.** Je suis le seul dont le fond de page est une couleur
criarde : `#d6f227` sur 100 % de la surface, sans une texture ni une
variation de ton — pendant que six des onze partent sur un fond sombre
et que les cinq clairs restants sont des blancs, des crèmes, des roses
de presse et des glaciers. Et je n'utilise que **trois valeurs**, dont
le blanc **une seule fois**, sur les 332 × 66 px du bouton.

**Typographie.** Je suis le seul à ne monter qu'**une seule famille
d'affichage jusqu'à 180 px avec un interlignage de 0,82** — un
interlignage plus serré que la hauteur des capitales, qui fait que les
lignes se touchent presque et que le bloc devient un mur plein plutôt
qu'un empilement de phrases. Les autres tiennent leur héros entre 90 et
160 px avec un interlignage de 0,88 à 0,96 : chez eux le titre est un
élément de la page, chez moi **le titre EST la page**.
