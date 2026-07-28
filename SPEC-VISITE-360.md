# Visite 360 — spécification de dépôt

Vous fournissez les panoramas. Ce document dit exactement quoi fournir,
sous quel nom, et ce qui se passe ensuite.

**Rien n'a été touché dans la visite actuelle.** Les trois pièces de
Lythwood Lodge restent en place et fonctionnelles jusqu'au jour où vos
panoramas arrivent. Le pipeline de traitement est déjà construit et
testé : il n'y a rien à installer.

---

## 1. Ce qu'il faut fournir, par pièce

| | |
|---|---|
| **Projection** | Équirectangulaire, **ratio exactement 2:1**. C'est la seule projection que le moteur sait afficher. Une photo grand-angle ou un « panorama » assemblé par un téléphone ne fonctionnera pas. |
| **Résolution source** | **6144 × 3072 minimum**, 8192 × 4096 idéalement. On descend ensuite, jamais on ne monte. |
| **Format source** | **JPEG** de qualité maximale, ou PNG. Pas de HEIC, pas de RAW, pas de WebP. |
| **Espace couleur** | sRGB. Un profil Adobe RGB ressortira désaturé. |
| **Exposition** | Fusionnée si nécessaire. Les baies vitrées brûlées ou les intérieurs bouchés ne se rattrapent pas au traitement. |
| **Couture** | Vérifiée à gauche **et** à droite : la colonne de gauche doit se raccorder à celle de droite. Une couture visible se verra en boucle à chaque rotation. |
| **Nadir** | Le trépied masqué ou retouché. C'est le défaut le plus visible d'une visite amateur. |
| **Horizon** | De niveau. Un horizon penché donne le mal de mer en rotation. |
| **Contenu** | Aucune personne identifiable, aucune plaque d'immatriculation, aucun document lisible. |

### Où déposer

```
images/tour/source/
```

Un fichier par pièce. **Le nom du fichier EST l'identifiant de la
pièce**, en minuscules, sans accent, sans espace :

```
images/tour/source/entree.jpg
images/tour/source/salon.jpg
images/tour/source/cuisine.jpg
…
```

### Ce que la moulinette en fait

```bash
node tools/tour-images.mjs
```

Pour chaque `<id>.jpg` déposé, elle produit deux fichiers :

| Fichier | Taille | Rôle |
|---|---|---|
| `images/tour/<id>-2k.webp` | 2048 × 1024 | ouverture immédiate de la scène, ~150 Ko |
| `images/tour/<id>-4k.webp` | 4096 × 2048 | remplace la scène en arrière-plan une fois prête |

Plus un `images/tour/poster.webp` en 1200 × 675, recadré depuis la
pièce d'entrée : c'est la seule image que la section pèse **avant** le
clic du visiteur.

**Deux règles de sûreté déjà dans l'outil, ne les contournez pas :**

1. **Il n'écrase jamais.** Si un fichier de sortie existe, il passe son
   tour et le dit. Pour remplacer, déplacez d'abord l'ancien à la main.
2. **La réduction est cyclique.** Un équirectangulaire boucle, mais le
   filtre de réduction ne le sait pas : il fabriquerait une couture à
   la réduction sur une image dont la projection était parfaite.
   L'outil élargit donc l'image avec ses propres pixels d'en face,
   réduit, puis recadre.

---

## 2. Les douze pièces, et comment elles se relient

L'identifiant est **imposé** : la moulinette et le viewer s'en servent
tels quels. Le libellé et la formule « vers » s'affichent au visiteur.

| # | Identifiant | Libellé | « Aller… » | Relié à |
|---|---|---|---|---|
| 01 | `entree` | Entrée | à l'entrée | `salon`, `bureau`, `cave`, `chambre` |
| 02 | `salon` | Salon | au salon | `entree`, `salle-a-manger`, `terrasse` |
| 03 | `salle-a-manger` | Salle à manger | à la salle à manger | `salon`, `cuisine` |
| 04 | `cuisine` | Cuisine | à la cuisine | `salle-a-manger`, `terrasse` |
| 05 | `bureau` | Bureau | au bureau | `entree` |
| 06 | `chambre` | Chambre principale | à la chambre | `entree`, `suite` |
| 07 | `suite` | Suite parentale | à la suite | `chambre`, `salledebain` |
| 08 | `salledebain` | Salle de bain | à la salle de bain | `suite` |
| 09 | `terrasse` | Terrasse | à la terrasse | `salon`, `cuisine`, `jacuzzi`, `toit` |
| 10 | `jacuzzi` | Spa | au spa | `terrasse` |
| 11 | `cave` | Cave à vin | à la cave | `entree` |
| 12 | `toit` | Toit-terrasse | au toit | `terrasse` |

**La circulation est un graphe connexe** : depuis n'importe quelle
pièce, on atteint les onze autres. Deux plaques tournantes, l'entrée à
l'intérieur et la terrasse à l'extérieur ; huit pièces en périphérie
avec une ou deux sorties, ce qui évite le mur de boutons.

**L'ordre du tableau compte** : le viewer ouvre sur la **première**
entrée. `entree` est en tête, parce qu'une visite commence par la
porte. Si une de vos images est nettement plus belle que les autres,
c'est elle qu'il faut mettre en tête — elle sert aussi d'affiche.

**Vous pouvez en fournir moins de douze.** Le tableau se réduit, il
suffit de retirer les liens qui pointent vers une pièce absente. Le
minimum utile est de quatre ou cinq pièces : en dessous, ça ne se lit
plus comme une visite.

### Contrainte de cadrage, à connaître avant la prise de vue

Le cadrage d'ouverture de chaque pièce est choisi pour que **tous ses
passages tombent dans le champ**. Un visiteur qui arrive dos à la seule
sortie visible est perdu.

Le champ d'ouverture va jusqu'à 118° (±59° autour du centre). Donc :

- une pièce à **1 ou 2 sorties** ne pose jamais de problème ;
- une pièce à **3 sorties** demande que les trois ouvertures tiennent
  dans un secteur d'environ 110° vu du point de prise de vue ;
- une pièce à **4 sorties** — `entree` et `terrasse` dans le tableau —
  n'y arrivera que si le point de vue est placé de façon à les voir
  toutes. **Placez le trépied en conséquence**, ou dites-le-moi et je
  redistribue les liens sur une pièce voisine.

---

## 3. Le tableau à remplir, prêt à recevoir vos douze pièces

Il vit dans `js/tour360.js`, variable `PIECES`. Voici la forme exacte,
avec les liens déjà posés. **Les angles sont à `null` : ils se relèvent
sur vos images, pas avant.**

```js
var PIECES = [
  { id: "entree",         nom: "Entrée",             vers: "à l’entrée",
    yaw: null, pitch: null, hfov: null, boite: null,
    liens: [ { id: "salon",          yaw: null, pitch: null, arrivee: null },
             { id: "bureau",         yaw: null, pitch: null, arrivee: null },
             { id: "cave",           yaw: null, pitch: null, arrivee: null },
             { id: "chambre",        yaw: null, pitch: null, arrivee: null } ] },

  { id: "salon",          nom: "Salon",              vers: "au salon",
    yaw: null, pitch: null, hfov: null, boite: null,
    liens: [ { id: "entree",         yaw: null, pitch: null, arrivee: null },
             { id: "salle-a-manger", yaw: null, pitch: null, arrivee: null },
             { id: "terrasse",       yaw: null, pitch: null, arrivee: null } ] },

  { id: "salle-a-manger", nom: "Salle à manger",     vers: "à la salle à manger",
    yaw: null, pitch: null, hfov: null, boite: null,
    liens: [ { id: "salon",          yaw: null, pitch: null, arrivee: null },
             { id: "cuisine",        yaw: null, pitch: null, arrivee: null } ] },

  { id: "cuisine",        nom: "Cuisine",            vers: "à la cuisine",
    yaw: null, pitch: null, hfov: null, boite: null,
    liens: [ { id: "salle-a-manger", yaw: null, pitch: null, arrivee: null },
             { id: "terrasse",       yaw: null, pitch: null, arrivee: null } ] },

  { id: "bureau",         nom: "Bureau",             vers: "au bureau",
    yaw: null, pitch: null, hfov: null, boite: null,
    liens: [ { id: "entree",         yaw: null, pitch: null, arrivee: null } ] },

  { id: "chambre",        nom: "Chambre principale", vers: "à la chambre",
    yaw: null, pitch: null, hfov: null, boite: null,
    liens: [ { id: "entree",         yaw: null, pitch: null, arrivee: null },
             { id: "suite",          yaw: null, pitch: null, arrivee: null } ] },

  { id: "suite",          nom: "Suite parentale",    vers: "à la suite",
    yaw: null, pitch: null, hfov: null, boite: null,
    liens: [ { id: "chambre",        yaw: null, pitch: null, arrivee: null },
             { id: "salledebain",    yaw: null, pitch: null, arrivee: null } ] },

  { id: "salledebain",    nom: "Salle de bain",      vers: "à la salle de bain",
    yaw: null, pitch: null, hfov: null, boite: null,
    liens: [ { id: "suite",          yaw: null, pitch: null, arrivee: null } ] },

  { id: "terrasse",       nom: "Terrasse",           vers: "à la terrasse",
    yaw: null, pitch: null, hfov: null, boite: null,
    liens: [ { id: "salon",          yaw: null, pitch: null, arrivee: null },
             { id: "cuisine",        yaw: null, pitch: null, arrivee: null },
             { id: "jacuzzi",        yaw: null, pitch: null, arrivee: null },
             { id: "toit",           yaw: null, pitch: null, arrivee: null } ] },

  { id: "jacuzzi",        nom: "Spa",                vers: "au spa",
    yaw: null, pitch: null, hfov: null, boite: null,
    liens: [ { id: "terrasse",       yaw: null, pitch: null, arrivee: null } ] },

  { id: "cave",           nom: "Cave à vin",         vers: "à la cave",
    yaw: null, pitch: null, hfov: null, boite: null,
    liens: [ { id: "entree",         yaw: null, pitch: null, arrivee: null } ] },

  { id: "toit",           nom: "Toit-terrasse",      vers: "au toit",
    yaw: null, pitch: null, hfov: null, boite: null,
    liens: [ { id: "terrasse",       yaw: null, pitch: null, arrivee: null } ] }
];
```

### Ce que chaque champ veut dire

| Champ | Ce que c'est |
|---|---|
| `yaw` | Cap d'ouverture de la pièce, en degrés. 0 = le centre de l'image source. |
| `pitch` | Inclinaison d'ouverture. Négatif = vers le bas. En intérieur, −3 à −5. |
| `hfov` | Champ horizontal d'ouverture, 55 à 118. Plus il est large, plus on voit de sorties d'un coup. |
| `boite` | Position de la pièce sur le plan, en pourcentages : `[x, y, largeur, hauteur]`. |
| `liens[].yaw` | Où se pose le bouton de passage **dans la pièce de départ**. C'est l'ouverture réelle : porte, baie, escalier. |
| `liens[].arrivee` | Cap d'arrivée **dans la pièce de destination**. On arrive en regardant vers l'intérieur, jamais dos à la porte. |

### Comment relever les angles — ne les jugez pas à l'œil

```bash
node tools/tour-angles.mjs images/tour/salon-4k.webp sortie.png "0,45,90,135,180,-45,-90,-135"
```

L'outil rend une planche de vues avec **une croix au centre exact** de
chacune. Le bon lacet est celui où l'ouverture tombe **sous la croix**.

Cette étape n'est pas optionnelle : juger à l'œil sur une planche sans
repère donne des écarts de 40°. C'est comme ça que l'ancien passage
« salon » de la chambre avait fini posé sur le manteau d'une cheminée
plutôt que sur une porte.

**Attention au signe :** les lacets du tableau sont ceux de Pannellum,
et `tour-angles.mjs` les rend déjà dans ce sens. L'affiche produite par
`tour-images.mjs`, elle, se demande au lacet **opposé**.

---

## 4. Le plan

Le plan est un SVG de `240 × 140` dans `js/tour360.js`, variable
`PLAN_SVG`. Les rectangles du plan et les `boite` des pièces sortent
des **mêmes coordonnées** : c'est ce qui garantit que les pastilles
tombent dans les bonnes pièces.

Il faudra le redessiner pour votre maison. Fournissez-moi, avec les
panoramas, **un croquis même grossier de l'implantation** : quelle
pièce donne sur quelle pièce, et où sont les ouvertures. Sans ça, le
plan sera une invention, et un plan faux est pire qu'aucun plan.

Conventions déjà en place, à conserver :

- les murs au trait fort, les jambages d'ouverture au trait clair ;
- ce qui est **dehors** — terrasse, spa, toit — au trait clair, sinon
  ça se lit comme une pièce de plus dans la maison ;
- chaque pastille fait au moins **34 px** de haut, cible tactile.

---

## 5. Ce que je ferai à réception

1. `node tools/tour-images.mjs` — les 24 fichiers webp et l'affiche.
2. Relevé des angles pièce par pièce avec `tour-angles.mjs`, et
   remplissage du tableau.
3. Redessin du plan sur votre croquis.
4. `node tools/tour-verif.mjs` — poids avant clic, erreurs console,
   anneaux de focus, cibles tactiles, passage au clavier.
5. Captures de chaque pièce, dans les deux thèmes.

**Le seul budget à surveiller :** la section doit rester sous **80 Ko
avant le clic**. Seule l'affiche pèse à ce moment-là, donc c'est elle
qu'on ajuste, jamais les panoramas.

Douze pièces en 4K, c'est environ **7 à 9 Mo au total**, téléchargés
uniquement au fur et à mesure des déplacements du visiteur. C'est
normal pour une visite virtuelle et ça ne coûte rien tant que personne
n'entre.
