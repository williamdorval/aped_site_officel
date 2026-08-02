# Le standard des écrans de secteur

Ce fichier n'est pas un gabarit. **Un gabarit est exactement ce qu'il
interdit.**

---

## 0 bis · UN ÉCRAN, PAS UN SITE — la commande du 2026-08-01

> **Un métier = UN premier écran, arrêté, 1440 × 900.**
> Pas de page longue. Pas de défilement dans l'aperçu. Rien sous les
> 900 px. Cent pour cent de l'effort d'un site entier va là.

Neuf sites complets avaient été construits — jusqu'à 17 000 px de haut,
dix sections chacun. C'était la réponse à la mauvaise question :
l'aperçu du panneau montre **un écran**, et pendant que l'effort se
dispersait sur des sections que personne ne verrait, le premier écran —
le seul qui compte — restait à 5 sur 10. Les neuf pages sont dans
`archives/2026-08-01-sites-longs/`. D-681.

**Ce que ça change, poste par poste :**

| | |
|---|---|
| **La géométrie** | à 1440 × 900, le document tient **exactement** dans la fenêtre. Aucune barre de défilement verticale. `scrollHeight <= 900` |
| **Le mouvement** | un geste, un seul, et **il doit se voir sur l'image arrêtée** — sinon il n'existe pas. § 2 |
| **L'instant** | l'écran déclare le sien : `<meta name="aped-instant" content="NNN">`. L'outil de capture met toutes les animations en pause et pose leur temps local à cette valeur. Deux passes rendent **la même image** |
| **La prise de vue** | `node tools/ecrans-secteurs.mjs <clé>` — 1440 × 900, densité 2, refus d'une capture plate mesurée par tranches |
| **L'échelle du panneau** | la capture est réduite à **0,29** dans un cadre de 421 px. Le texte courant tombe sous 5 px, et **c'est voulu** : c'est à ça que ressemble un moniteur posé à trois mètres. D-683 |

**Ce qui ne change pas :** tout le reste de ce fichier. La règle du
côte-à-côte (§ 0), la barre relevée à l'image (§ 1), les polices
(§ 3), les photos (§ 4), ce qui ne s'écrit jamais (§ 5).

---

## 0 · LA RÈGLE QUI GOUVERNE TOUTES LES AUTRES

> **AUCUN SITE DE SECTEUR NE PORTE L'IDENTITÉ D'APED.**
> Ni sa palette, ni sa typographie, ni ses formes, ni son langage de
> mouvement.

Cette section du site vend une seule chose : **on sait faire n'importe
quel style, pour n'importe quel métier.** Douze aperçus qui se
ressemblent prouvent l'inverse — qu'on sait faire un seul style et
qu'on le recolle partout. C'est l'accusation qu'on veut éviter, et on
se l'était infligée tout seuls : le 2026-08-01, les neuf sites écrits
ici étaient le même document en neuf couleurs — encre, minium,
grotesque condensée, micro-libellés mono, sections numérotées `01`
à `10`, filets de 1 px, angles vifs. L'identité d'APED avec d'autres
mots.

**Ce qui en découle, et qui n'est pas négociable :**

| | |
|---|---|
| **Le minium et le ciment sont interdits** | sauf si le métier les appelle vraiment. Trois des douze sont des projets réels et portent déjà de l'orange — **aucun des neuf autres n'a droit à une couleur orange** |
| **Palette propre à chaque métier** | choisie pour lui, pas héritée |
| **Pairing typographique propre** | l'affichage d'un site ne se retrouve dans aucun autre |
| **Langage de formes propre** | certains ont des coins arrondis, des ombres, des dégradés, du flou. **Les interdits d'APED ne s'appliquent PAS à l'intérieur d'un site de secteur** — ils sont là pour montrer notre étendue. Le site APED, lui, les garde |
| **Langage de mouvement propre** | ce qui bouge, comment, et dans quel sens |

### Le test du côte-à-côte, et il est le seul qui compte

**Deux passes, les deux obligatoires.**

1. **Contre les quatre références.** Mets ta capture pleine page à côté
   d'elles. Si on voit laquelle est la tienne, elle n'est pas finie.
2. **Contre les autres secteurs déjà faits.** Mets les captures côte à
   côte. **On ne doit pas pouvoir deviner qu'elles viennent du même
   studio.** Si deux se ressemblent, on en refait une.

« Acceptable » n'est pas « au niveau ».

---

## 1 · LES QUATRE RÉFÉRENCES — LA BARRE, RELEVÉE À L'IMAGE

| Référence | Ce qu'elle prouve | Palette |
|---|---|---|
| `restau` — CENDRE | Un didone énorme sur une photographie sombre. L'italique comme seconde voix dans la phrase | encre + braise `#e07a3f` |
| `demo-carroserie` — MÉRIDIEN | Une grotesque condensée capitale, très lourde, interlignage serré. Un seul orange | noir + `#ff5b23` |
| `demo-design-int-rieur` — NORDEN | Une transitionnelle posée sur un fond crème. Le calme comme argument. **Coins arrondis, ombres douces, une carte en verre dépoli** — et c'est très bien | crème + or `#c9a227` |
| `MV-deneigement` | Le clair, les coins arrondis, une bande d'ambre en dégradé. Un site de service qui rassure | blanc + ambre |

**Ce que les quatre partagent, et c'est tout ce qu'elles partagent :**

### 1.1 Une échelle typographique brutale

Le titre du héros fait **90 à 160 px** et occupe une ligne entière de la
fenêtre. Il n'y a **aucun** intermédiaire entre lui et le texte courant
de 14–16 px. Le saut EST le dispositif.

Interlignage du héros : **0,88 à 0,96**. Jamais 1,2.

### 1.2 La photographie porte la page

Le héros est une photographie **plein cadre**. Les grilles d'images ont
des cases de **400 à 700 px de haut**, pas des vignettes de 200. Une
image sur laquelle on ne peut pas voir un visage, une texture ou un
geste n'a rien à faire là.

### 1.3 Un dispositif de signature qui revient

Un seul par site, trois à cinq fois. C'est lui qu'on reconnaît.

### 1.4 Le rythme n'est plus vertical, il est DANS l'écran

La règle des paddings de section ne s'applique plus : il n'y a qu'une
section, et elle fait 900 px. Ce qui la remplace, et qui est plus dur :
**une seule idée par écran.** Un premier écran qui essaie de dire trois
choses n'en dit aucune. Les marges extérieures sont grandes — 60 à
140 px — et il reste du vide, beaucoup, parce que le vide est ce qui
fait lire le reste.

### 1.5 Le texte courant est petit, étroit, et il y en a peu

14–16 px, **46 à 62 caractères** de large. **Une page de secteur n'est
pas un dossier.** Le défaut qui a coulé la première fournée : sept
tableaux, dix sections numérotées, trois cents lignes de texte. Une
fiche technique n'a pas de personnalité.

---

## 2 · LE MOUVEMENT — CE QUI MANQUAIT LE PLUS

Les neuf premiers sites n'avaient **pas une seule** `@keyframes`. Un
site statique en 2026 se lit comme un gabarit de 2017, et l'aperçu du
panneau ne montre rien bouger. **Si le visiteur ne voit rien bouger, on
n'a rien prouvé.**

### 2.0 · LE JAVASCRIPT EST AUTORISÉ — la contrainte a été levée le 2026-08-01

La première fournée s'était imposé « zéro `<script>` ». Le raisonnement
tenait — une page sans script ne peut pas avoir d'erreur console — mais
**c'était un plafond de qualité, et il s'est vu** : le surlignage cyan
du chantier a été déclaré « impossible en CSS pur », `timeline-scope`
demande Chrome 116 quand `animation-timeline` demande 115, et le
`@supports` ne couvre pas ce trou d'une version.

| | |
|---|---|
| **Le JavaScript est autorisé** | dans les sites de secteur uniquement |
| **GSAP et ScrollTrigger sont autorisés** | **auto-hébergés**, jamais un CDN : `../../js/vendor/gsap.min.js` et `../../js/vendor/ScrollTrigger.min.js` sont déjà dans le dépôt |
| **Ce qui ne bouge pas** | **zéro requête tierce**, **zéro erreur console**. Un script qui plante est pire que pas de script |
| **Ce qui ne bouge pas non plus** | rien de nécessaire à la LECTURE ni à l'USAGE ne dépend du script. Le texte, les images, les liens et les formulaires marchent sans lui |
| **Le site APED, lui, ne change pas** | ses interdits tiennent tous |

**Le CSS pur reste le bon outil quand il suffit** — une révélation, un
survol, une bascule `:target`. On ne charge pas 113 ko de GSAP pour
faire monter un bloc de 30 px. Le script sert ce que le CSS ne sait pas
faire : un tracé qui suit un contour, un texte découpé en lettres, un
pinceau qui suit le curseur, une scène épinglée, un chiffre qui
s'interpole.

### 2.1 Le CSS pur, pour tout ce qu'il sait faire

**Les animations pilotées par le défilement se font en CSS pur** depuis
Chrome 115.

```css
@keyframes monte { from { opacity:0; transform: translateY(34px) } to { opacity:1; transform:none } }

.reveal{
  animation: monte forwards;   /* `forwards`, JAMAIS `both` — voir ci-dessous */
  animation-timeline: view();
  animation-range: entry 0% cover 26%;
}
```

> **`forwards`, jamais `both`, et ça a coûté une demi-page blanche.**
> Avec `both`, un élément qui n'a pas encore atteint sa plage garde son
> état de DÉPART — donc `opacity: 0`. Une capture pleine page ne
> déplace pas le défilement : tout ce qui est sous la ligne de
> flottaison est avant sa plage, et **la moitié du site sort vide**.
> C'est ce qu'a rendu la première capture de la boutique : dix blocs
> entièrement blancs. `forwards` supprime le remplissage d'avant-plage ;
> l'élément montre alors sa forme finale tant que l'animation n'est pas
> en vigueur, et bascule à `opacity: 0` au moment exact où sa plage
> commence — c'est-à-dire quand il est encore **sous** la fenêtre.
> Le visiteur ne voit aucune différence ; l'aperçu du panneau, lui, voit
> toute la page.

Une page sans script ne peut pas avoir d'erreur console, et son
mouvement tourne sur le compositeur.

### 2.2 Les quatre choses qu'il faut, au minimum

1. **Une révélation au défilement** — jamais la même d'un site à
   l'autre : monter, glisser de côté, se dévoiler sous un masque,
   grandir depuis 96 %, se décadrer, s'ouvrir en volet.
2. **Un mouvement continu** — une bande qui défile, une barre qui se
   remplit, un fond qui se déplace en parallaxe (`animation-timeline:
   scroll()`), un compteur qui roule.
3. **Des micro-interactions** — sur **chaque** cible cliquable : le
   bouton, la carte, le lien de nav, la vignette. `:hover`, `:focus-
   visible`, `:active`. Une transition de 120 à 260 ms.
4. **Un dispositif interactif sans script** — `:target`, `:checked` +
   `~`, `:has()`, `scroll-snap` en défilement latéral, `<details>`.
   Un par site, et il sert le métier.

### 2.3 Trois garde-fous

- **`animation-range` se termine tôt.** `entry 0% cover 25%` : l'élément
  est entier dès qu'il est à un quart dans la fenêtre. Une capture fixe
  ne doit jamais l'attraper à moitié transparent.
- **`prefers-reduced-motion: reduce` coupe tout**, et l'état de repos
  est l'état FINAL. Aucune information ne se perd.
- **`@supports not (animation-timeline: view())`** — les navigateurs
  sans défilement animé voient la forme finale, jamais une page vide.

```css
@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{ animation:none !important; transition:none !important }
}
@supports not (animation-timeline: view()){
  .reveal{ animation:none; opacity:1; transform:none }
}
```

---

## 3 · LES POLICES — LOCALES, UNE PERSONNALITÉ PAR MÉTIER

`node tools/polices-demos.mjs` les télécharge une fois dans
`fonts/demos/`. **Aucune page ne parle à `fonts.googleapis.com`.**
Toutes sous SIL OFL 1.1 ; relevé dans `fonts/demos/_licences.json`,
déclarations prêtes à coller dans `fonts/demos/_declarations.css`.
Chemin depuis un site de secteur : `../../fonts/demos/<fichier>.woff2`.

| Secteur | Affichage | Texte | Détail |
|---|---|---|---|
| Boutique | `fraunces` | `karla` | `jetbrains-mono` |
| Coiffure | `bodoni-moda` | `archivo` | — |
| Hébergement | `cormorant` | `spectral` | `jetbrains-mono` |
| Gym | `anton` | `archivo` | `jetbrains-mono` |
| Clinique | `outfit` | `manrope` | — |
| Immobilier | `dm-serif` | `spectral` | `jetbrains-mono` |
| Juridique | `libre-baskerville` | `source-serif` | `jetbrains-mono` |
| Photographe | `instrument-serif` | `inter` | `jetbrains-mono` |
| Construction | `space-grotesk` | `plex-sans` | `jetbrains-mono` |

**Ne charger que les faces utilisées.** Une page qui déclare douze
familles en télécharge douze. Deux à trois par site, pas plus.

---

## 4 · LES PHOTOS — LA RÈGLE QUI A COÛTÉ DEUX FOIS

1. **Ouvrir chaque image en pleine résolution avant de l'utiliser.**
   Jamais juger sur une planche-contact ni sur le nom du fichier. Un
   `object-position` de la page ne recadre pas le fichier.
   *(Trois marques imprimées trouvées comme ça.)*
2. **Chercher :** marques imprimées, enseignes, plaques
   d'immatriculation, visages reconnaissables, numéros civiques.
3. **Une photo par emplacement. Aucune réutilisation.**
4. **Chaque légende décrit ce que l'image montre vraiment.**
5. **Une photo ne contredit jamais le texte de la page.** Si les deux se
   contredisent : on change la photo, jamais le texte.
6. **Licence documentée** dans `TIRAGES` de
   `tools/secteurs-sites-photos.mjs`, recopiée dans
   `images/secteurs-sites/_licences.json`.
7. **Le traitement fait partie de la direction artistique.** Un site de
   spa ne traite pas ses images comme un site de garage. Le filtre —
   duotone, désaturation, contraste, virage chaud, format carré ou
   panoramique — s'écrit dans la DA avant d'être codé.

Sur une source en **portrait**, `fen.w` porte sur la largeur : le cadre
calculé est plus court que l'image et se pose **en haut**.

---

## 5 · CE QUI NE S'ÉCRIT JAMAIS

- Aucun nom d'entreprise réelle, aucun logo, aucune marque ;
- aucun avis, aucune note, aucun témoignage, **aucun prix** ;
- entreprises fictives, coordonnées neutres (`000 000-0000`,
  `courriel@exemple.ca`, « Adresse sur demande ») ;
- **on n'invente jamais du contenu pour occuper de l'espace.** Une
  section absente vaut mieux qu'une section remplie de faux ;
- `<meta name="robots" content="noindex,nofollow">` et une mention
  visible « site de démonstration » sur chaque page.

---

## 6 · LA TECHNIQUE

- **Un seul fichier** `demos-secteurs/<secteur>/index.html`, style dans
  un `<style>`.
- **Zéro requête tierce.** Images `../../images/secteurs-sites/`,
  polices `../../fonts/demos/`, scripts `../../js/vendor/`.
- **Le script est autorisé, la requête tierce ne l'est pas.** Voir § 2.0.
  `node tools/demos-controle.mjs` refuse toute adresse absolue hors du
  dépôt, y compris `cdnjs`, `unpkg` et `jsdelivr`.
- **Zéro erreur console**, et c'est maintenant la contrainte qui compte.
- **CLS à 0** : `width` et `height` sur **chaque** `<img>`, aux
  dimensions réelles du fichier (`node tools/_inventaire.mjs <secteur>`).
- **LCP sous 300 ms** : l'image du héros en `fetchpriority="high"`,
  toutes les autres en `loading="lazy" decoding="async"`.
- **Zéro erreur console.**
- **Aucun débordement horizontal de 320 à 1920 px.**
- Les formes — rayon, ombre, dégradé, flou — sont **libres**, et elles
  sont un moyen de différencier. Elles se décident dans la DA.

---

## 7 · LA CHAÎNE, DANS L'ORDRE

1. **ALLER CHERCHER LES MEILLEURS SITES DU MONDE DE CE MÉTIER, ET LES
   MESURER.** Pas « s'inspirer vaguement » : ouvrir, relever, REGARDER.
   C'est l'étape qui manquait à la première fournée, et ça se voyait —
   douze directions artistiques inventées, bonnes, mais nourries de
   rien.

   ```
   node tools/refs-galerie.mjs "https://www.awwwards.com/websites/<catégorie>/" 20
   node tools/refs-releve.mjs "https://<le site>" <métier>-<nom> 1440
   ```

   `refs-releve.mjs` dépose `0-heros.png` — **le premier écran, le seul
   qui nous intéresse maintenant** — et un `releve.json` : familles de
   polices, taille et interlignage du `h1`, fonds dominants,
   bibliothèques d'animation détectées.

   **Trois références retenues par métier**, et on écrit pour chacune :
   ce qu'on lui prend, et ce qu'on écarte. Le relevé ne suffit pas :
   **ouvrir le PNG et le regarder** — un `h1` mesuré à 9 px est un
   titre de référencement masqué, pas le titre visible, et le chiffre
   seul aurait fait écrire n'importe quoi.

2. **Écrire la direction artistique** dans `demos-secteurs/plans/<clé>.md` :
   palette (hex), typographie (familles, px, interlignage), **composition
   du premier écran au pixel**, formes, traitement photo, le geste et
   **son instant**, et ce qu'on ne fait pas. Une ligne par poste.
   La DA se juge **à côté des onze autres**, jamais seule.

3. `node tools/_inventaire.mjs <clé>` — les photos et leurs dimensions
   réelles ;
4. `node tools/secteurs-sites-photos.mjs <clé>` s'il en manque ;
5. **ouvrir chaque photo, une par une, en taille réelle** ;
6. écrire `demos-secteurs/<clé>/index.html` — **un fichier, un écran** ;
7. `node tools/ecrans-secteurs.mjs <clé> --png`, puis **ouvrir le PNG
   et le REGARDER**. Pas la sonde : l'image. Comparer poste par poste
   au plan. Corriger. Recommencer — **trois tours au moins** ;
8. `node tools/demos-controle.mjs --port <port> <clé>` doit rendre
   **ok** ;
9. **test du côte-à-côte**, les deux passes du § 0, sur la planche :
   `node tools/planche-secteurs-12.mjs` ;
10. `node tools/secteurs-markup.mjs <clé>` — verse la capture dans
    l'aperçu du panneau ;
11. `node tools/css-critique.mjs` puis `node tools/cascade-check.mjs <port>` ;
12. commit.
