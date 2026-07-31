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
| Le CRAN, et le fil minium | `*-09-p090.png` |

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
| Les quatre « après », pleine page | `ba-*-apres-pleine.png` |
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
