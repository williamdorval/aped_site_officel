# CLINIQUE — CLINIQUE DU RIVERAIN

*Clinique multidisciplinaire fictive : physiothérapie, ostéopathie,
nutrition. Un seul écran, 1440 × 900, arrêté. Rien en dessous.*

Le nom vient de `demos-secteurs/DIRECTIONS.md § 08` et ne change pas.

> **CE FICHIER REMPLACE LA VERSION DU 2026-08-01, ET IL LA CONTREDIT.**
> L'ancien plan décrivait une carte de tableau de bord posée sur une
> plaque translucide : anneau « 2/3 », rail de trois étapes, sept
> capsules de jour, six capsules d'heure, vignette photo de **3,6 %**
> de l'écran, titre à **68 px**, texte à **13 px** partout. Dix blocs,
> aucun dominant. Le verdict à l'image a été « ça ressemble à la page
> d'accueil d'un SaaS générique, 5 sur 10, le plus faible des douze ».
> Il était juste : le rayon 24 px, l'ombre douce et la carte flottante
> sont exactement le **piège de convergence n° 3** de `MATRICE-DOUZE`.
> Le contenu — trois métiers, une prise de rendez-vous — était bon ;
> sa mise en page était un composant de bibliothèque.
> L'ancien plan est conservé dans l'historique git de ce fichier.

---

## Les trois références — changées le 2026-08-02

Les anciennes (`sword`, `headway`, `jane`) sont trois **interfaces
claires à carte arrondie**. Les regarder produisait forcément une
interface claire à carte arrondie : c'est ce qui est arrivé. Elles
restent relevées dans `tools/_refs/` et servent maintenant de **liste
de ce qu'on ne refait pas**.

Les trois nouvelles ont en commun ce que la cellule 09 réclame : **un
corps humain cadré serré, une typographie d'affichage qui LUI PASSE
DESSUS, un seul accent saturé.** La table `CHOIX` de
`tools/planche-refs.mjs` est à jour.

### 1 · Medwest.plus — `medwest.plus`

`tools/_refs/clinique-medwest/`

**Ce qu'elle prouve.** Qu'**un seul accent saturé posé en TYPOGRAPHIE
sur une photographie suffit à faire une identité**. La page entière est
en noir et blanc ; la seule couleur est le mot-symbole en sarcelle
`rgb(0,160,154)`, écrit par-dessus le dos d'une personne en traitement.

**Ce qu'on lui prend.** Deux choses. Le **principe de la couleur
unique portée par le texte sur l'image**, et le **cadrage sur un corps
plutôt que sur un lieu** — c'est ce qui manquait totalement à l'ancienne
version, dont la seule photo était un corridor vide en vignette.

**Ce qu'on écarte.** La photographie **plein cadre** (elle appartient
à 01, 05, 06, 08 et 12 dans la matrice), le noir et blanc pur (il
appartient à 03), la grotesque **condensée** en capitales (elle
appartient à 04), et le motif d'astérisque, qui est un tic.

**Les chiffres, relevés.** Mot-symbole visible ≈ **130 px** (le `h1`
que l'outil attrape, 38 px, n'est pas visible — piège du titre masqué,
comme Headway) · libellés **13–14 px** · **une** couleur saturée,
`rgb(0,160,154)`, plus du gris · photo **100 %** de l'écran · **4**
blocs dans la première fenêtre · aucune bibliothèque d'animation.

### 2 · Function Health — `functionhealth.com`

`tools/_refs/clinique-function/`

**Ce qu'elle prouve.** Qu'**un visage cadré très serré tient tout un
premier écran de santé**, et qu'un titre peut lui passer devant sans
que ni l'un ni l'autre n'y perde. Le profil occupe le tiers central,
le regard sort du cadre, et « …alth. » traverse au niveau du cou.

**Ce qu'on lui prend.** Le **cadrage** : un profil, pas un plein
visage ; la tête coupée par le bord ; le regard qui porte hors champ.
Et le principe du titre qui **passe devant le corps, jamais devant les
yeux**.

**Ce qu'on écarte.** Le virage chaud et sombre (05, 06 et 08 sont déjà
là), la sérif d'affichage en graisse 300, la photo plein cadre, et les
trois chiffres de service en bas — dont un **prix**, interdit ici.

**Les chiffres, relevés.** h1 **80 px** / interligne 72 (**0,90**),
graisse 300, Financier Display · corps **16 px** · fonds crème
`rgb(254,249,239)`, terre `rgb(176,90,54)`, encre `rgb(42,43,47)` —
**3** couleurs · photo **100 %** · **6** blocs dans la première
fenêtre · aucune bibliothèque d'animation.

### 3 · Heva Health — `hevahealth.com`

`tools/_refs/clinique-heva/`

**Ce qu'elle prouve.** L'**échelle**. 104 px d'affichage sur un
interligne de 1,02, deux familles pour toute la page, et un corps de
texte à 16 px : le saut est le dispositif. C'est le chiffre qui
condamne l'ancien titre à 68 px.

**Ce qu'on lui prend.** Le **registre typographique** — un affichage
qui pèse six fois le texte courant — et la barre de navigation réduite
à une ligne d'objets, sans fond ni filet.

**Ce qu'on écarte.** Tout le reste, et il y en a. La sérif italique
(quatre métiers en ont déjà), la photographie plein cadre en pleine
jungle, **les cinq étoiles et « 4,9/5 sur 12 000+ consultations »** —
une note et un chiffre de satisfaction, tous deux interdits — et la
palette olive, qui est celle de 05.

**Les chiffres, relevés.** h1 **104 px** / interligne 106,08
(**1,02**), chasse −2,08, graisse 300, PP Editorial New · corps
**16 px** Inter · crème `rgb(253,253,241)`, olive `rgb(57,68,43)`, or
des étoiles — **3** couleurs · **2** familles · photo **100 %** ·
**6** blocs dans la première fenêtre · aucune bibliothèque d'animation.

### Ce que les trois disent ensemble, et qu'on applique

| | Les trois | Ancienne version | Maintenant |
|---|---|---|---|
| affichage | 80 · 104 · ≈130 px | **68 px** | **144 px** |
| texte courant | 13 · 16 · 16 px | 13 px partout | **12 px** (texture) + **36 px** (l'énoncé) |
| photo | 100 % | **3,6 %** | **41,7 %** |
| couleurs | 1 · 3 · 3 | onze teintes de deux familles | **4 valeurs, 2 teintes** |
| blocs | 4 · 6 · 6 | **10** | **4** + la colonne |

---

## La direction artistique

| Poste | Décision |
|---|---|
| **Référence culturelle** | **Une affiche de santé publique, pas une application.** Un champ d'os presque vide, une colonne de couleur pleine hauteur, un visage dedans, et un titre qui traverse de l'un à l'autre. On ne montre plus « la minute où le rendez-vous se prend » sous forme d'écran de logiciel — on montre **la personne**, et l'heure se choisit en une ligne au bas de la page |
| **Palette — 4 valeurs, 2 teintes** | **`os #F2F1EC`** le champ (deux tiers de l'écran ; chaud, jamais blanc — le blanc pur appartient à 03) · **`os-clair #FAF9F5`** le titre là où il passe sur la colonne · **`encre #10201E`** (14,9:1 sur l'os) · **`encre-doux #3B4A47`** le chapeau (8,3:1) · **`sarcelle #046A5E`** l'accent, teinte 172° — vert-bleu franc, **pas un bleu SaaS** (5,75:1 sur l'os ; 6,5:1 en blanc dessus) · **`sarcelle-fonce #063A34`** la masse de la colonne (l'os y rend 11,2:1). Aucun orange, aucun minium, aucun ciment, aucun bleu marine |
| **Typographie** | Deux familles, trois faces, six fichiers. **`outfit` 800 et 500**, **`manrope` 400** — et ce sont les seules graisses que `tools/polices-demos.mjs` télécharge. **Pourquoi Outfit** : de la liste disponible c'est la seule dont les bols (`o`, `e`, `c`, `a`) sont tracés au compas. À 144 px c'est cette rondeur qui donne les « formes douces » que la cellule 09 exige, et **aucun des onze autres n'a de sans-serif rond** — 04 et 06 sont condensés, 07 est technique, 08 est une grotesque courante, les autres sont des sérifs. **Titre** outfit 800 **144 px / 130 (0,903)**, chasse −0,05em. **Chapeau** manrope 400 **36 / 46**. **Heures** outfit 500 **34 px**. **Tout le reste — barre, sur-titre, jours, légende, signature — 12 à 16 px**, et c'est de la TEXTURE : à 0,29 ça tombe sous 5 px, c'est voulu, et c'est composé comme un gris homogène |
| **Composition** | **Au pixel, dans le tableau qui suit.** En un mot : un champ d'os à gauche, une colonne de 600 px à droite qui saigne des trois côtés, et **un titre de 144 px qui traverse la couture et change de couleur en la traversant** |
| **Formes — le parti, et il n'a que deux valeurs** | **Rayon 220 px** : le coin haut-gauche de la colonne, et lui seul. **Rayon 999** : la capsule d'appel et le curseur d'heure — ce qui s'actionne. **Rien entre les deux, rien d'autre nulle part.** Un 8 px par défaut est exactement ce qui a coulé la version précédente ; 24 px l'aurait à peine sauvée. **Aucune ombre portée, aucun flou, aucune carte.** Les seuls dégradés sont les deux voiles de la colonne, qui sont un traitement photographique |
| **Traitement photo** | **Une seule photographie, `images/secteurs-sites/clinique-8.webp`** (1080 × 1800, 81 ko, `pexels.com/photo/7552687/`). Découpée **à la source** en 3:5 — la colonne fait 600 × 900 et un `object-position` ne recadre pas le fichier (piège 60). Trois couches : `grayscale(1) contrast(1.22) brightness(.83)` ; un aplat `#046A5E` en `mix-blend-mode: color` à **58 %** — il prend la teinte de l'accent et garde la luminance de la photographie, donc un monochrome sarcelle et non un voile ; puis **un voile en L**, plein sur les 172 px de gauche et plein sur le bas |
| **Le geste et l'instant** | **Un seul : le curseur d'heure ARRIVE.** Une capsule 176 × 18, rayon 999, `#046A5E`, qui parcourt un pas de **200 px** en **900 ms**, `cubic-bezier(.4,0,.2,1)`, délai 300 ms, `forwards`. `<meta name="aped-instant" content="620">` : à 620 ms le progrès temporel vaut 0,356, la courbe rend 0,514, le curseur est **arrêté à 97 px de sa cible**, au milieu de l'intervalle entre « 8 h 15 » et « 10 h 30 », pendant que « 10 h 30 » est **déjà en sarcelle et en graisse 800**. On voit vers quoi il va |
| **Ce qu'on ne fait pas** | Pas de croix, pas de blouse blanche, pas de stéthoscope, pas de main sur une épaule. **Pas de carte, pas d'anneau de progression, pas de rail d'étapes, pas de calendrier** — c'est de là qu'on vient. Pas de photographie plein cadre. Pas de prix, pas d'avis, pas de note, pas de témoignage, pas de nom de professionnel, pas d'ordre professionnel, pas d'année de fondation, pas de nombre de patients. Aucune adresse web. Aucune requête tierce, aucun script |

### La composition, au pixel — 1440 × 900, **relevée à la capture**

Toutes les valeurs ci-dessous sont **lues dans la page rendue**, pas
calculées : `document.documentElement.scrollHeight` vaut **900**, il
n'y a **aucune barre de défilement verticale**.

| Élément | x | y | l × h | ce qu'il porte |
|---|---|---|---|---|
| **La colonne** | 840 → 1440 | 0 → 900 | **600 × 900 = 41,7 %** | rayon haut-gauche **220**, `overflow:hidden`, `isolation:isolate`, fond `#063A34` |
| ↳ la photographie | — | — | 1080 × 1800, `cover`, ancrée en haut | le visage tient de **y 30 à y 501** — **471 px de haut** *(calculé du découpage : `object-fit: cover` réduit le fichier de 0,5556)* |
| ↳ le voile en L | — | — | — | horizontal : plein 0 → 172, `.86` à 208, `.30` à 268, nul à 340 · vertical : nul jusqu'à 56 %, `.34` à 68 %, `.86` à 79 %, plein à 86 % |
| ↳ la signature | droite 40 | bas 34 | — | « **000 000-0000** » puis « SITE DE DÉMONSTRATION », outfit 500 12 px, os à 78 et 94 % *(pire pixel mesuré **8,26**)* |
| **La barre** | 96 → 840 | 44 → 96 | 744 × 52 | une LIGNE, aucun fond, aucun filet, aucune capsule flottante |
| ↳ mot-symbole | 96 | — | — | « Clinique du Riverain », outfit 800 20 px, chasse −0,02em |
| ↳ trois liens | ≈ 318 → 573 | — | — | outfit 500 15 px `#3B4A47`, écart 24, soulignement au survol et au focus |
| ↳ capsule d'appel | **636 → 840** | 44 → 96 | 204 × 52 | rayon 999, `#046A5E`, blanc 16 px. `margin-left:auto` — sans elle, la capsule recouvrait le dernier lien |
| **Sur-titre** | 96 | 168 → 183 | — | « CLINIQUE MULTIDISCIPLINAIRE · DÉMONSTRATION », outfit 500 12 px, chasse 0,22em, `#046A5E` |
| **Chapeau** | 96 | 203 → 295 | 656 de texte | manrope 400 **36 / 46**, `#3B4A47`, deux lignes forcées |
| **— le vide —** | 96 → 840 | 295 → 443 | 148 px | il se compose contre le visage, qui occupe la même bande à droite |
| **LE TITRE** | 96 | **443 → 703** | — | outfit 800 **144 / 130**. Ligne 1 finit à **x 908** — elle déborde de **68 px** sur la colonne ; ligne 2 finit à **x 1024** — elle déborde de **184 px** |
| **Les créneaux** | 96 | 737 → 855 | 600 de large | légende 12 px ; trois libellés de 12 px et trois heures de **34 px**, pas de **200** (x 96 · 296 · 496) ; le curseur, 176 × 18, y 837 → 855 |

### La couture — le seul dispositif de l'écran

Le titre change de couleur à **x 840**, l'encre sur l'os et l'os sur la
colonne. **Deux calques du même texte**, découpés par `clip-path` de
part et d'autre de la couture, et **pas** un dégradé sur
`background-clip: text` : un calque garde une vraie propriété `color`,
qu'un outil de contraste peut lire — `pire-pixel.mjs` rend **9,74 au
pire pixel** sur les 351 981 px d'encre du calque de droite.

**Aucune lettre n'est tronquée** — seule la couleur change. C'est ce
qui sépare ce dispositif du piège 70 : un masque figé à mi-course sur
du texte se lit comme un mot coupé ; ici les glyphes sont entiers, et
la coupure tombe d'elle-même entre le « n » et le « d » de
« agenda », et après le « r » de « métiers ».

### Les cinq points sur lesquels on peut me prendre en défaut

1. **Le visage est une personne réelle.** La licence Pexels couvre
   l'usage commercial et la modification sans attribution, et
   l'entrée est dans `images/secteurs-sites/_licences.json`. Le
   fichier a été **ouvert en pleine résolution** avant usage : aucun
   logo, aucune plaque nominative, aucun badge, aucun vêtement de
   soin, aucun texte. Le profil et le monochrome réduisent
   l'identification. **Ce qui reste ouvert** : une photo de banque
   posée sur un site de clinique laisse entendre que la personne y est
   soignée ou y travaille. C'est un écran de démonstration, il le dit
   deux fois — mais c'est le seul des douze où la question se pose.
2. **La colonne fait 41,7 %, pas 33 %.** La consigne dit « au moins un
   tiers ». Le dépassement est délibéré : sous 600 px de large, la
   ligne 1 du titre ne débordait plus que de 68 px… à 540 px elle ne
   débordait **pas du tout**, et le chevauchement — l'exclusivité de
   la cellule 09 — n'existait plus.
3. **Sur la planche des références, on reconnaît la nôtre.** Elle est
   la seule à ne pas être une photographie plein cadre. Ce n'est pas
   un défaut qu'on peut corriger : la photo plein cadre appartient à
   01, 05, 06, 08 et 12 dans `MATRICE-DOUZE`, et la planche des DOUZE
   est le test qui prime. Voir le rapport.
4. **Le voile en L est un artifice, et il se voit si on le cherche.**
   Un portrait en haute lumière ne peut pas produire une colonne de
   masse : toute mise en bichromie place le mur — l'objet le plus
   clair — du côté clair. La masse vient donc d'un aplat posé
   par-dessus, pas de la photographie. Le premier essai posait ce
   voile à l'horizontale : il coupait la poitrine d'un trait net en
   travers de toute la colonne, et repoussait le titre sous y 512, ce
   qui faisait déborder le bas de l'écran.
5. **Aucune de ces mesures ne vient d'un appareil réel.** Chromium
   sous Playwright, machine de bureau Windows. Les positions, elles,
   sont **relevées à la capture**, pas calculées.

---

## Le contenu exact

**Nom fictif :** Clinique du Riverain
**Coordonnées :** `000 000-0000` — aucune adresse, aucune adresse web

| Emplacement | Texte, mot pour mot |
|---|---|
| Mot-symbole | `Clinique du Riverain` |
| Liens *(inertes, `href="#"`)* | `Services` · `Approche` · `Nous joindre` |
| Capsule d'appel | `Prendre rendez-vous` |
| Sur-titre | `Clinique multidisciplinaire · démonstration` |
| Chapeau *(2 lignes forcées)* | `Physiothérapie, ostéopathie et nutrition,` / `sous le même toit.` |
| **Titre** *(2 lignes forcées)* | `Trois métiers,` / `un seul agenda.` |
| Légende des créneaux | `Mercredi — places libres` |
| Les trois créneaux | `matin` / `8 h 15` — `avant-midi` / `10 h 30` *(retenu)* — `après-midi` / `13 h 45` |
| Signature de la colonne | `000 000-0000` / `Site de démonstration` |
| Texte de remplacement de la photo | `Une personne de profil devant un mur clair, éclairée par la lumière d'une fenêtre.` |

Les heures portent une espace insécable de part et d'autre du `h`.
La mention de démonstration paraît **deux fois**, à deux niveaux de
lecture : dans le sur-titre et dans la colonne.

### Le dispositif interactif, sans une ligne de script

Trois boutons radio invisibles, `:has()` + `~`, transition de 300 ms.
Cliquer une heure déplace le curseur ; la flèche du clavier aussi.
**Vérifié par un vrai clic, pas par un événement synthétisé**
(piège 36) : repos x 296 → « 13 h 45 » x 496 → « 8 h 15 » x 96 →
« 10 h 30 » x 296. Zéro erreur console.
`@supports not (selector(:has(*)))` pose le curseur à sa place finale.

---

## Ce qui me distingue des onze autres

**Le visage.** Je suis le seul des douze à en porter un, et il fait
471 px de haut. Onze écrans montrent un lieu, un objet, un dessin ou
rien. Le mien montre quelqu'un.

**La couleur.** Seul écran **clair à accent saturé**. 03 est le seul
autre clair et froid — mais en noir et blanc PUR, en colonnes de
journal ; 02 est crème et olive ; 10 est terre cuite ; 11 est bordeaux.
Personne d'autre ne pose de sarcelle, et personne d'autre ne pose une
masse de couleur pleine hauteur sur un champ pâle.

**La typographie.** Seul sans-serif **rond** des douze, et la plus
grande taille d'affichage de la planche après 04 — mais 04 est une
condensée en capitales acides, c'est-à-dire l'exact opposé.

**Le dispositif.** Seul écran où **un même mot est écrit en deux
couleurs** parce qu'il traverse une frontière. C'est ce qu'on voit en
trois secondes, et c'est ce qui reste lisible à 0,29.

---

*Réécrit le 2026-08-02. Relevés retenus : `tools/_refs/clinique-medwest`,
`clinique-function`, `clinique-heva`. Capture :
`images/realisations/ecran-clinique.webp` — deux passes rendent le
MÊME fichier (md5 `1d56a900…`).*
