# Le standard des sites de secteur

Ce fichier n'est pas un gabarit. C'est la **barre**, relevée sur les
trois sites qui font référence dans ce dépôt :

| Référence | Ce qu'elle prouve |
|---|---|
| `restau` — CENDRE | Un didone énorme sur une photographie sombre. L'italique comme seconde voix dans la phrase |
| `demo-carroserie` — MÉRIDIEN | Une grotesque condensée capitale, très lourde, interlignage serré. Un seul orange |
| `demo-design-int-rieur` — NORDEN | Une transitionnelle posée sur un fond crème. Le calme comme argument |

> **LE TEST, ET IL EST LE SEUL QUI COMPTE.** Mets ta capture pleine
> page à côté de ces trois-là. **Si on voit laquelle est la tienne,
> elle n'est pas finie.** « Acceptable » n'est pas « au niveau ».

---

## 1 · CE QUI REND CES TROIS SITES FORTS

Relevé à l'image, pas déduit.

### 1.1 Une échelle typographique brutale

Le titre du héros fait **90 à 160 px** et occupe une ligne entière de
la fenêtre. Il n'y a **aucun** intermédiaire entre lui et le texte
courant de 14–15 px : pas de 24 px, pas de 32 px. Le saut EST le
dispositif.

| | Héros | Titres de section | Texte | Micro-libellé |
|---|---|---|---|---|
| restau | 140 px | 46 px | 14 px | 10 px |
| carrosserie | 104 px | 44 px | 15 px | 10 px |
| design | 62 px (dans une carte) | 40 px | 15 px | 10,5 px |

Interlignage du héros : **0,88 à 0,96**. Jamais 1,2.
Chasse : **−0,02 à −0,04 em** sur les capitales lourdes, **0** sur les
serifs.

### 1.2 Une seule couleur d'accent, et elle ne sert qu'à trois choses

Le bouton principal · les micro-libellés · les chiffres.
Rien d'autre. Pas de deuxième accent. Pas de dégradé.

restau `#e07a3f` · carrosserie `#ff5b23` · design `#c9a227`.

### 1.3 La photographie porte la page

Le héros est une photographie **plein cadre**, sombre, avec un voile.
Les grilles d'images ont des cases de **400 à 700 px de haut**, pas des
vignettes de 200. Une image sur laquelle on ne peut pas voir un visage,
une texture ou un geste n'a rien à faire là.

### 1.4 Un dispositif de signature qui revient

- restau : un **bandeau défilant** de mots, en didone, entre les sections ;
- carrosserie : un **filet plein largeur** au-dessus de chaque étape numérotée ;
- design : une **ligne verticale à pastilles** qui relie les cinq étapes.

Un seul par site. Il revient trois à cinq fois. C'est lui qu'on
reconnaît.

### 1.5 Le rythme vertical

Padding de section : **110 à 170 px** en haut et en bas. Le héros fait
une fenêtre pleine. **Jamais deux sections de même fond à la suite** —
sombre, clair, sombre, ou l'inverse.

### 1.6 Le texte courant est petit et étroit

14–15 px, **46 à 62 caractères** de large, gris à 70 % du contraste du
titre. Il ne se bat jamais avec l'affichage.

### 1.7 Les micro-libellés

Mono, capitales, **10 à 11 px**, chasse **0,15 à 0,25 em**, dans
l'accent ou en gris. Ils numérotent (`01`, `SRV-03`), ils nomment
(`MANIFESTE`, `LE PARCOURS`), ils datent. Ils ne décrivent pas.

---

## 2 · CE QUI FAISAIT ÉCHOUER LES DEUX PREMIERS SITES DE SECTEUR

Écrit ici pour que personne ne le refasse.

1. **Aucune échelle.** Le plus gros titre faisait 34 px. Une page dont
   tout est entre 12 et 34 px est un document, pas un site.
2. **Aucune photographie plein cadre.** Des vignettes de 196 px dans
   des cartes. Le sujet ne se voyait pas.
3. **Trop de tableaux.** Sept tableaux sur une page : c'est une fiche
   technique, et une fiche technique n'a pas de personnalité.
4. **Aucun dispositif de signature.** Rien ne revenait.
5. **Deux, trois, quatre sections du même fond à la suite.**
6. **Aucune police d'affichage.** La même sans partout, à des tailles
   voisines.

---

## 3 · LES POLICES — LOCALES, UNE PAR PERSONNALITÉ

`node tools/polices-demos.mjs` les télécharge une fois dans
`fonts/demos/`. **Aucune page ne parle à `fonts.googleapis.com`.**
Toutes sont sous SIL OFL 1.1 ; le relevé est dans
`fonts/demos/_licences.json`.

| Secteur | Affichage | Texte | Détail |
|---|---|---|---|
| Construction | `oswald` | `inter` | `jetbrains-mono` |
| Immobilier | `dm-serif` | `spectral` | `jetbrains-mono` |
| Boutique | `syne` | `inter` | `jetbrains-mono` |
| Coiffure | `bodoni-moda` | `inter` | `jetbrains-mono` |
| Gym | `anton` | `inter` | `jetbrains-mono` |
| Hébergement | `playfair` | `spectral` | `jetbrains-mono` |
| Clinique | `manrope` | `inter` | `jetbrains-mono` |
| Juridique | `libre-baskerville` | `spectral` | `jetbrains-mono` |
| Photographe | `instrument-serif` | `inter` | `jetbrains-mono` |

Les déclarations `@font-face` prêtes à coller sont dans
`fonts/demos/_declarations.css`. Le chemin depuis un site de secteur
est `../../fonts/demos/<fichier>.woff2`.

**Ne charger que les faces utilisées.** Une page qui déclare douze
familles en télécharge douze.

---

## 4 · LES PHOTOS — LA RÈGLE QUI A COÛTÉ DEUX FOIS

1. **Ouvrir chaque image en pleine résolution avant de l'utiliser.**
   Jamais juger sur une planche-contact ni sur le nom du fichier. Un
   `object-position` de la page ne recadre pas le fichier : il ne sauve
   rien. *(Trois marques imprimées trouvées comme ça : « Onduline » sur
   une sous-toiture, « Ricoré » et « NAN » sur des boîtes de lait.)*
2. **Chercher :** marques imprimées, enseignes, plaques
   d'immatriculation, visages reconnaissables, numéros civiques.
3. **Une photo par emplacement. Aucune réutilisation.** Dix
   propriétés = dix jeux de photos. *(Le même salon portait deux
   adresses différentes.)*
4. **Chaque légende décrit ce que l'image montre vraiment.** Une cour
   arrière n'est pas une terrasse avant.
5. **Une photo ne contredit jamais le texte de la page** — ni le type
   de bâtiment, ni l'état, ni le prix, ni le voisinage. *Si les deux se
   contredisent : on change la photo, jamais le texte.*
6. **Licence documentée** dans le tableau `TIRAGES` de
   `tools/secteurs-sites-photos.mjs`, recopiée dans
   `images/secteurs-sites/_licences.json`.

Sur une source en **portrait**, `fen.w` porte sur la largeur : le cadre
calculé est plus court que l'image et se pose **en haut**. Télécharger
la source en 900 px et la regarder avant d'écrire `fen`.

---

## 5 · CE QUI NE S'ÉCRIT JAMAIS

- Aucun nom d'entreprise réelle, aucun logo, aucune marque ;
- aucun avis, aucune note, aucun témoignage, aucun prix ;
- entreprises fictives, coordonnées neutres (`000 000-0000`,
  `courriel@exemple.ca`, « Adresse sur demande ») ;
- **on n'invente jamais du contenu pour occuper de l'espace.** Une
  section absente vaut mieux qu'une section remplie de faux ;
- `<meta name="robots" content="noindex,nofollow">` et une mention
  visible « site de démonstration » sur chaque page.

---

## 6 · LA TECHNIQUE

- **Un seul fichier** `demos-secteurs/<secteur>/index.html`, style
  inclus dans un `<style>`.
- **Zéro requête tierce.** Images en `../../images/secteurs-sites/`,
  polices en `../../fonts/demos/`.
- **Zéro `<script>`.** Tout ce qui bouge se fait en CSS. Le survol,
  le `:target`, les transitions suffisent. *(Une page sans script ne
  peut pas avoir d'erreur console, et elle défile sur le compositeur.)*
- **CLS à 0** : `width` et `height` sur **chaque** `<img>`, aux
  dimensions réelles du fichier.
- **LCP sous 300 ms** : l'image du héros en `fetchpriority="high"`,
  toutes les autres en `loading="lazy" decoding="async"`.
- Pas de coin arrondi supérieur à 2 px, pas d'ombre portée molle, pas
  de flou : ce sont les interdits du site APED, et les démonstrations
  se regardent à côté de lui.

---

## 7 · LA CHAÎNE, DANS L'ORDRE

1. Regarder de vraies références du métier ;
2. `node tools/secteurs-sites-photos.mjs <secteur>` ;
3. **ouvrir chaque photo, une par une, en taille réelle** ;
4. écrire le site ;
5. **l'ouvrir à l'écran et le regarder** — pas une sonde ;
6. **test du côte-à-côte** contre les trois références ;
7. `node tools/demos-capture.mjs --ecran --port <port> secteur-<clé>` ;
8. `node tools/demos-webp.mjs` ;
9. `node tools/secteurs-markup.mjs <clé>` ;
10. `node tools/css-critique.mjs` puis `node tools/cascade-check.mjs <port>` ;
11. commit.
