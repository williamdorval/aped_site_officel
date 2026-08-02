# LES PREUVES — chantier de mise en production, 2026-07-31

La règle de ce chantier : **une capture ou une séquence qui montre la
chose fonctionner. Pas une mesure. Une image où ça se voit.**

Chaque dossier porte son `rapport.json` — le relevé chiffré qui
accompagne les images — et se refait par une seule commande.

---

## Chantier 1 · La forge du sas — `chantier1-forge/`

`node tools/forge-check.mjs 8099`

| Ce qu'il faut voir | Fichiers |
|---|---|
| Le fond suit la chambre, thème CLAIR | `light-*.png` |
| Le fond suit la chambre, thème SOMBRE | `dark-*.png` |
| La descente entière, treize images, dont sept dans la seule fenêtre de forge | `*-00-p000` → `*-12-p100` |
| L'arête de grains, enfin visible | `*-01-p020.png` |
| Le banc de limaille | `*-05-p061.png` |
| Le mot en cours d'alignement | `*-08-p085.png` |
| Le CRAN — le canevas se vide, le mot est là | `*-09-p090.png` |
| Le fil minium, tendu vers la pièce | `*-11-p097.png` |

Le nom du fichier porte la progression : `p061` = 61 % de la piste.

---

## Chantier 2 · Services — `chantier2-services/`

`node tools/services-check.mjs 8099`

| Ce qu'il faut voir | Fichiers |
|---|---|
| Les six positions de repos, une par carte, même largeur | `repos-0-svc-01.png` → `repos-5-svc-fin.png` |
| Le défilement complet, treize images à pas réguliers | `seq-00.png` → `seq-12.png` |

Le relevé donne, pour les six cartes : le haut, le filet de tête, le
bas du corps, la largeur et la position de repos. **Une seule valeur
par colonne** — c'est ce qui prouve la ligne d'horizon.

---

## Chantier 3 · Les cinq panneaux — `chantier3-panneaux/`

`node tools/panneaux-check.mjs 8099`

| Ce qu'il faut voir | Fichiers |
|---|---|
| Les cinq panneaux ouverts, côte à côte | `panneau-01.png` → `panneau-05.png` |
| La visite lancée depuis le panneau 03 | `visite-lancee.png` |

Les deux renvois sont exercés **dix fois chacun** : `#realisations`
10/10, `#visite` avec lancement du lecteur 10/10.

---

## Chantier 4 · Réalisations — `chantier4-realisations/`

`node tools/realisations-check.mjs 8099`

| Ce qu'il faut voir | Fichiers |
|---|---|
| Les quatre comparaisons, poignée à gauche / au milieu / à droite | `ba-*-p000.png` · `-p050` · `-p100` |
| Les quatre « avant », pleine page, hors de leur fenêtre de 313 px | `ba-*-avant-pleine.png` |
| Les quatre « après », cadrés sur une fenêtre | `ba-*-apres-pleine.png` |
| Les quatre projets SOURCES, tels que leur propre serveur les rend | `sources/source-*.png` |

Mettre `ba-garage-apres-pleine.png` à côté de `sources/source-garage.png` :
c'est le même site, à la même échelle.

Le glissement est exercé **pour de vrai** — `mouse.down` puis six
`mouse.move` — et le relevé donne, pour chaque pas, la position visée
et la position lue. L'écart doit valoir zéro ou un.

---

## La passe de production — `production/`

`node tools/production-check.mjs 8099`

Le rapport liste **tous** les liens et **tous** les boutons du
document, panneaux et modales ouverts. Ce qui n'a pas d'écouteur
détectable est **cliqué**, et on regarde si le document a bougé : la
question posée est « est-ce que ce bouton mène quelque part », donc
c'est par le clic qu'on y répond.

---

## Ce qui n'est pas ici

Les mesures de performance ne produisent pas d'image et vivent dans
`MESURES.md` : LCP, CLS, images par seconde, contraste, débordement,
paliers de dégradation, formulaires.

---

## Chantier 5 · Le cadre navigable — `chantier5-realisations/`

`node tools/serve.mjs 8123` puis
`node tools/realisations-preuves.mjs 8123`
Le verdict chiffré vient de `node tools/ba-check.mjs 8123`.

| Ce qu'il faut voir | Fichiers |
|---|---|
| Le cadre au repos : un petit écran, la page dedans à l'échelle d'un écran de bureau, l'adresse et les deux étiquettes sur la barre | `repos-ba-*.png` |
| La poignée à gauche, au milieu, à droite — **glissée à la souris**, pas simulée | `poignee-ba-*-p002/050/098.png` |
| La descente **dans** le cadre : six images, l'écart de pixels entre deux consécutives dans `rapport.json` | `defile-ba-*-0..5.png` |
| Deux comparaisons complètes d'un seul regard, avec l'air autour, à trois largeurs | `rangee-1280/1440/1920.png` |
| Les quatre reconstitutions **entières**, hors cadre — c'est là qu'on vérifie qu'il ne reste aucun rectangle gris | `avant-ba-*.png` |

`rapport.json` donne, pour chacune des quatre : la taille du cadre, la
hauteur de la pile, **la course à défiler**, la hauteur de l'avant et
celle de l'après (elles doivent être égales), le rapport lu contre le
rapport écrit dans `demos-rapports.mjs`, les trois positions atteintes
par la poignée, les cinq écarts de la descente, et **la position de la
page derrière avant et après** — elle ne doit pas avoir bougé.

### Deuxième passe — les cadres navigables

| Ce qu'il faut voir | Fichiers |
|---|---|
| La descente **jusqu'au pied du site neuf** : huit images plus la fin forcée | `defile-ba-*-0..7.png` et `defile-ba-*-fin.png` |
| Le mouvement latéral **continu** des scènes épinglées — douze pas rapprochés, à distance régulière | `bande-ba-design-0-00..11.png` · `bande-ba-restaurant-0-00..11.png` |

`rapport.json` donne aussi `imagesParSeconde` — mesurées **pendant** un
défilement à la molette dans le cadre, pas au repos — et, pour chaque
scène épinglée, `pasEntreEtats` et `irregularite` : le rapport du plus
grand pas au plus petit. Un diaporama le fait partir à l'infini, une
piste continue le garde sous 1,5.

`rapport.json` ajoute, pour chacune : `auBoutDuApres` — les deux côtés
arrivent-ils à leur pied ensemble —, `scenesEpinglees` avec les états
atteints et les écarts de pixels entre deux images.

**Ce qu'aucune de ces images ne prouve :** le geste au doigt. La
propriété `overscroll-behavior` est mesurée, le pouce ne l'est pas.
`RESERVES.md` le dit en entier.

---

## Chantier 7 · Les douze premiers écrans — `chantier7-ecrans/` · 2026-08-01

`node tools/ecrans-secteurs.mjs` puis `node tools/planche-secteurs-12.mjs 460`

| Ce qu'il faut voir | Fichiers |
|---|---|
| **Les douze côte à côte, même échelle** — le seul test qui décide | `planche-douze-460.png` |
| La même, assez grande pour lire les titres | `planche-douze-720.png` |

Trois questions à se poser devant la planche, et elles sont écrites
dans `chantier7-ecrans/LISEZ-MOI.md` : *devine-t-on que ça vient du
même studio ? · un écran a-t-il l'air cassé ? · voit-on quelque chose
bouger à cette taille-là ?*

C'est le seul dossier de preuves dont le verdict est **un jugement
d'œil et pas une mesure**. Il l'assume : une planche où deux écrans se
ressemblent est un échec que nul outil ne signalera.

---

## Chantier 8 · La Visite 360 marche toujours — `2026-08-02-visite-360/`

`node tools/visite-sequence.mjs 2026-08-02-visite-360`

Refait après le chantier qui a refait **tout ce qui entoure** le
lecteur. Le lecteur lui-même n'a pas été touché : ce dossier le prouve.

| Ce qu'il faut voir | Fichiers |
|---|---|
| L'affiche, l'étiquette de lieu, le pupitre avec le bouton | `0-affiche.png` |
| Le chargement, le bouton passé à « Chargement… » | `1-chargement.png` |
| La visite vivante : commandes, plan, passages, pupitre passé en mode d'emploi | `2-vivante-terrasse.png` |
| La flèche du clavier a tourné la pièce | `3-clavier-droite.png` |
| Le glissement a tourné la pièce | `4-glissement-souris.png` |
| Le SALON, ses **deux** passages, le plan qui suit | `5-piece-salon.png` |
| Un passage cliqué dans l'image change encore de pièce | `6-piece-par-passage.png` |
| Les 19 constats, les écarts, les réserves | `RAPPORT.md` |

**Ce que la planche ne prouve pas, et le dit :** l'entrée du cadre en
V1 · DÉGAGER. Elle est prise en **mouvement réduit**, où l'animation ne
joue pas — et la raison est mesurée, pas supposée : sous mouvement
plein et défilement programmatique, la scène rend un aplat noir, sur le
code d'avant le chantier **comme** sur celui d'après (pièges 78 à 82).
