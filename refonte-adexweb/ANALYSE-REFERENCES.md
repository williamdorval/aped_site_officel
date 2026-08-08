# ADEXWEB — Analyse de références de design web

**Date du relevé :** 2026-08-08
**Poste de mesure :** Chromium sous Playwright, Windows 11, fenêtre **1440 × 900**, `devicePixelRatio` 1.
**Captures :** `refonte-adexweb/references/` (11 fichiers PNG, 1440 px de large).

---

## 0 · CE QUI EST MESURÉ, CE QUI NE L'EST PAS

> **Règle de ce document : aucun chiffre n'est écrit s'il n'a pas été lu par
> `getComputedStyle` ou `getBoundingClientRect` dans le navigateur, ou calculé
> localement à partir de valeurs mesurées.** Là où je n'ai pas pu mesurer, c'est
> écrit en toutes lettres.

| | Statut |
|---|---|
| **MESURÉ par moi, au navigateur** | Cuberto (5 pages), Locomotive, Basecamp, Made by Shape, RénoAssistance, GOV.UK, Wealthsimple |
| **CALCULÉ par moi** | Les 25 ratios de contraste de la palette ADEXWEB (§ 6.1), formule WCAG 2.x |
| **CONSTATÉ par lecture de texte** (pas de CSS) | Les sites du § 4 marqués « lecture seule » |
| **NON MESURÉ, jamais** | Toute performance réelle, tout comportement tactile, tout appareil physique. Rien de ce document n'a été vu sur un vrai téléphone |

**Trois sites m'ont refusé l'accès ou n'ont rien rendu d'exploitable :**
`activetheory.net` et `resn.co.nz` (tout en WebGL, aucun texte lisible),
`buzzworthy.studio` (le domaine n'existe plus, `ENOTFOUND`).
`godly.website` redirige vers `recent.design` et renvoie HTTP 403.

---

# 1 · CUBERTO — RELEVÉ COMPLET

Pages visitées et mesurées : `/` · `/about/` · `/projects/` · `/projects/sca/` ·
`/projects/riyadh/` · `/contacts/`.

## 1.1 Le tableau des mesures

| Ce qui est mesuré | Valeur relevée | Détail |
|---|---|---|
| **Famille typo** | `Suisse Intl`, une seule, tout le site | Aucune seconde famille. Pas de serif. |
| **`font-size` de `<html>`** | **`0.625vw`** ≥ 768 px · **`2.66667vw`** < 768 px · **`10px` fixe** ≥ 1600 px | À 1440 px cela fait **9,00 px**. Tout le site est en `rem` sur cette base : l'échelle entière est fluide et se fige à 1600 px. |
| **h1 accueil** | **81 px** / interligne **81 px** (**1,000**) / graisse **500** / `letter-spacing` **−0,81 px** (−0,01 em) | = 9 rem. Largeur du bloc : 998 px, centré. |
| **h2 « Selected work »** | **81 px** / **81 px** / **500** / **−1,62 px** (−0,02 em) | Même corps que le h1, `letter-spacing` deux fois plus serré. |
| **h2 sur-titre (« WHAT WE DO »)** | **14,4 px** / **15,84 px** (1,10) / **400** / `text-transform: uppercase` | Le même `<h2>` sert de titre géant et d'étiquette minuscule selon le contexte. |
| **h3 (titre de service)** | **37,8 px** / **41,58 px** (**1,100**) / **400** / `normal` | = 4,2 rem. |
| **Corps de texte** | **18 px** / **25,2 px** (**1,400**) / **400** / **+0,36 px** (+0,02 em) | C'est le paragraphe de service. |
| **Chapô (« Since 2010… »)** | **23,04 px** / **29,952 px** (**1,300**) / **400** / **+0,2304 px** | |
| **Chapô du hero** | **21,6 px** / **25,92 px** (**1,200**) / **400** / **+0,432 px** (+0,02 em) | |
| **`<body>` (défaut)** | **12,6 px** / **14,49 px** (1,15) | Valeur héritée, quasi jamais visible. |
| **Bas de casse (mentions)** | **14,4 px** / **18,72 px** (1,30) | |
| **Échelle typographique** | **12,6 · 14,4 · 18 · 21,6 · 23,04 · 28,8 · 37,8 · 72 · 81** px | Voir § 1.2. |
| **Largeur max du conteneur** | **1600 px** | À 1440 px de fenêtre : 1430 px utiles (barre de défilement 10 px). |
| **Gouttières** | **108 px** (conteneur `-sm`) · **216 px** (conteneur `-lg`) | = 12 rem et 24 rem. Colonne de contenu `-lg` : **998 px**. |
| **Colonne de texte** | **504 px** (paragraphe de service) · **618 px** (chapô) · **756 px** (chapô de hero) | Soit ~56, ~62 et ~68 caractères. |
| **Marges verticales entre sections** | **126 px** · **198 px** (`margin-top`) | = 14 rem et 22 rem. Aucune section n'utilise `padding` vertical, sauf le hero et le pied de page. |
| **Hero** | `padding: 180px 216px 108px` | = 20 / 24 / 12 rem. |
| **Pied de page** | `padding: 108px 216px` | Hauteur totale 473 px. |
| **Hauteur du premier écran** | Section hero : **531 px**. La vidéo d'aperçu commence à **y = 531**, donc **dans** le premier écran de 900 px. | Le hero seul n'occupe pas l'écran ; la première réalisation entre par le bas. |
| **CONTENU du premier écran (1440 × 900)** | **27 mots** · **1 vidéo** (1274 × 679, `short.mp4`) · **1 SVG** (logo, 104 × 22) · **4 liens de nav** + **1 bouton** · **0 bouton dans le hero** | 5 mots au h1, 17 mots au chapô, 5 mots de nav. Voir § 1.3. |
| **Couleurs de fond distinctes** | **6** | `#000000` (16 usages) · `#FFFFFF` (7) · `#EEEEEE` (5) · `#E3F5F3` (3) · `#F1F3FA` (2) · `rgba(255,255,255,.95)` (1). Les deux teintes pâles sont des fonds de vignette de projet. |
| **Couleurs de texte distinctes** | **3** | `#000000` (468 éléments) · `#FFFFFF` (312) · `rgba(255,255,255,.7)` (29). **Rien d'autre. Aucun gris.** |
| **Couleurs de bordure distinctes** | **1** | `#FFFFFF`, sur 9 éléments. |
| **Rayon des boutons** | **99999 px** (pilule) — CTA principal · **50 %** — pastilles sociales (54 × 54) · **1000 px** — le liseré interne | Aucun rayon intermédiaire. C'est pilule ou cercle. |
| **Bouton CTA de nav** | **127 × 52 px**, `padding: 0 25,2px`, fond `#000`, texte `#FFF` **18 px** | Hauteur 52 px : au-dessus du seuil tactile de 44 px. |
| **Bouton d'envoi du formulaire** | **235 × 79 px**, rayon 99999, **fond transparent**, texte noir, 21,6 px | Contour seul, pas d'aplat. |
| **Survol du CTA (mesuré, souris réelle)** | 1. Le bouton s'étire : **`scaleX(1,02)`**, aucun changement vertical<br>2. Un bloc blanc interne (`.ripple`, 125 × 50) grandit : `transform .5s cubic-bezier(.4,0,0,1)` + `border-radius .9s`<br>3. Le libellé **roule vers le haut de −19,8 px** (= exactement 18 px × 1,1, une interligne) : `transform .8s cubic-bezier(.16,1,.3,1)` — un duplicata monte par le bas | Trois animations simultanées de durées différentes pour **un seul survol**. |
| **Navigation — entrées** | **4 liens** (Services, Projects, About, Blog) **+ 1 CTA** (Contacts). **5 au total.** | Chaque lien : 18 px, `padding: 5,4px 18px`, hauteur de cible **32 px**. |
| **Navigation — au défilement** (mesuré) | Bandeau `position: fixed`, **72 px** de haut, fond transparent en haut de page.<br>**Défilement vers le bas** → le bandeau part en `translateY(−72px)`, `transition: transform .3s`.<br>**Défilement vers le haut** → il revient, **et un fond `rgba(255,255,255,.95)` apparaît** (`.cb-navbar-fill`, même `transform .3s`).<br>**Retour en haut** → le fond redisparaît. | Classique « hide-on-scroll-down, show-on-scroll-up ». Testé à y = 0 / 1500 / 3000 / 2400 / 0. |
| **Transition de page** (mesurée image par image, échantillon toutes les 25 ms, clic → révélation complète) | **t = 0** : clic. `html.loader` posée à **t = 6 ms**.<br>**t = 0 → 640 ms** : un voile (`.cb-loader-fill`) monte en **`scaleY: 0 → 1`**, `transform-origin: 100% 100%`. Un fond noir (`.cb-loader-backdrop`) passe de **0 à 1 d'opacité en ~500 ms**.<br>**t = 640 → 1139 ms** : écran couvert, **le DOM est remplacé** (le `<h1>` change à **t = 1139 ms**).<br>**t = 1266 ms** : `html.loader` retirée.<br>**t = 1281 → 1679 ms** : le voile s'efface, **opacité 1 → 0 en ~400 ms**.<br>**TOTAL : ≈ 1 680 ms d'écran couvert par transition.** | **Ce n'est pas un rechargement de page** : mon instrumentation a survécu à la navigation, donc le remplacement du document est piloté en JavaScript, URL comprise. |
| **Défilement** | `lenis` (défilement lissé JS) — `html.lenis` posée en permanence. **GSAP présent** (`_gsap`, `gsapVersions`) mais non exposé en global. | |
| **Animation d'entrée — texte** (mesurée, échantillon 16 ms) | Chaque mot part de **`translateY(+136 px)`** et remonte à 0.<br>Départs relevés : mot 1 à **t ≈ 0**, mot 2 à **t ≈ 140 ms**, mot 3 à **t ≈ 215 ms**, mot 4 à **t ≈ 295 ms** → **décalage ≈ 75 ms par mot**.<br>Position du mot 1 : 123 px @23 ms · 66 px @181 ms · 43 px @285 ms · 17 px @511 ms · 5,8 px @744 ms · 1,2 px @1016 ms. | La courbe colle à une **exponentielle sortante** : à t = 285 ms le modèle `expo.out` prédit 42,7 px, j'ai mesuré 43,2 px ; à t = 181 ms il prédit 65,2 px, j'ai mesuré 66,3 px. Durée totale du modèle ≈ **1,7 s**, mais **90 % du trajet est fait en 500 ms**. |
| **Transitions CSS — la signature** | **`transform 1,2s cubic-bezier(0.16, 1, 0.3, 1)`** sur **30 éléments** ; `0,8s` même courbe sur **20 éléments** ; `opacity/transform .4s/.6s ease` sur 20. | `cubic-bezier(.16,1,.3,1)` **est** l'approximation CSS de `easeOutExpo`. C'est cohérent avec la mesure ci-dessus. |
| **Défilement des images** | Les médias portent `scale(1,05)` et un `translateY` piloté par le défilement (relevés : **−64,7 px** et **−45 px** à un instant donné). | Parallaxe : l'image est agrandie de 5 % pour avoir de la matière à déplacer. |
| **Découpe du texte pour l'animation** | `<h2 aria-label="Project Summary">` puis, **par mot**, deux `<span aria-hidden="true">` imbriqués :<br>— extérieur : `overflow: clip; margin: -0.2em; display: inline-block; vertical-align: top`<br>— intérieur : `padding: 0.2em; display: inline-block; transform: translate(0, 0%)` | Le couple **`−0,2em` / `+0,2em`** est ce qui empêche le masque de rogner les jambages et les accents. Le texte réel vit dans `aria-label`. |
| **FAQ** | **`<details>` / `<summary>` natifs.** `padding: 36px 0` par question, titre 26 px de haut. Le séparateur est un `<svg>` avec `path M0,100 Q499,100 998,100` et `transform-origin: 0% 50%`, mis à l'échelle horizontalement au défilement. | Zéro JavaScript pour ouvrir/fermer. |
| **Hauteur des documents** | Accueil **13 528 px** · À propos **11 108 px** · Projets **8 518 px** · Étude de cas **11 995 px** · **Contact 2 505 px** | Voir § 1.5 — c'est le chiffre le plus parlant du relevé. |

## 1.2 L'échelle typographique de Cuberto, décortiquée

Les corps relevés, en px à 1440, et en `rem` sur la base de 9 px :

| px | rem | Emploi | Rapport au précédent |
|---|---|---|---|
| 12,6 | 1,4 | défaut du `<body>` | — |
| 14,4 | 1,6 | mentions, sur-titres capitales | **× 1,143** |
| 18 | 2,0 | corps de texte, liens de nav | **× 1,250** |
| 21,6 | 2,4 | chapô de hero, liens de pied de page | **× 1,200** |
| 23,04 | 2,56 | chapô de section | **× 1,067** |
| 28,8 | 3,2 | titre secondaire, champs de formulaire | **× 1,250** |
| 37,8 | 4,2 | titre de service | **× 1,313** |
| 72 | 8,0 | titre de clôture | **× 1,905** |
| 81 | 9,0 | h1 et h2 majeurs | **× 1,125** |

**Ce n'est pas une échelle géométrique.** Aucun rapport constant : les pas vont de
1,067 à 1,905. C'est une **liste de valeurs `rem` rondes** (1,4 / 1,6 / 2 / 2,4 / 2,56
/ 3,2 / 4,2 / 8 / 9) choisies une par une. Le seul rapport qui compte vraiment est
celui du **corps au titre : 18 → 81, soit × 4,5**.

**Deux niveaux seulement font tout le travail** : 18 px et 81 px. Les sept autres
sont des ajustements. C'est la leçon, pas les neuf valeurs.

## 1.3 Le premier écran, compté

À 1440 × 900, dans les 900 premiers pixels, il y a exactement :

- **27 mots**, répartis ainsi :
  - nav : « Services / Projects / About / Blog / Contacts » = **5 mots**
  - h1 : « Digital design & development agency » = **5 mots**
  - chapô : « We design and build digital products, brands and websites for companies ready to move beyond the ordinary. » = **17 mots**
- **1 bouton** : le CTA « Contacts », 127 × 52, dans la barre de nav
- **0 bouton dans le hero lui-même**
- **2 images** : le logo SVG (104 × 22) et une vidéo de 1274 × 679 qui entre par le bas
- **56 éléments DOM visibles** au total dans le premier écran

**Le hero de Cuberto n'a pas d'appel à l'action.** Le seul bouton de la page est
dans la barre du haut. Le visiteur qui veut agir doit soit viser un bouton de
127 px en haut à droite, soit faire défiler 13 000 px.

## 1.4 Les cinq services : la seule chose à copier tel quel

`/` → section `.cb-feature`, **exactement 5 items**, mesurés :

- Un service = **une ligne pleine largeur** (998 px), pas une carte dans une grille.
- Au repos : hauteur **150 px**, `padding: 54px 0`, **espacement de 159 px de haut en haut**.
- Titre **37,8 px / 41,58 px**, corps **18 px / 25,2 px** dans une colonne de **504 px**.
- Chaque paragraphe fait **28 à 31 mots**. Pas un de plus.
- Un numéro « 01 » … « 05 » est aligné à droite de chaque titre.
- Au défilement, la ligne atteinte **s'ouvre** (mesuré : 337 px et 290 px pour les deux premières, encore 150 px pour les trois suivantes) et découvre son paragraphe et une illustration. Les lignes déjà passées **restent ouvertes**.

Capture : `references/cuberto-02-cinq-services-1440.png`.

**Ce qui est bon :** une ligne par service, un numéro, un titre court, un
paragraphe de 30 mots. Ça se lit en diagonale et ça se compte du regard.
**Ce qui ne l'est pas :** le déploiement piloté par le défilement. Il faut deviner
qu'il faut faire défiler pour lire ; et sur `prefers-reduced-motion` ou sans JS,
la promesse tombe.

## 1.5 Le chiffre qui devrait faire réfléchir les trois associés

| Page | Hauteur du document | Ce qu'elle fait |
|---|---|---|
| Accueil | **13 528 px** | impressionne |
| Étude de cas | **11 995 px** | impressionne |
| À propos | **11 108 px** | impressionne |
| Projets | **8 518 px** | impressionne |
| **Contact** | **2 505 px** | **convertit** |

**La page qui rapporte de l'argent est 5,4 fois plus courte que celle qui
impressionne.** Et il faut traverser 13 528 px, ou viser un bouton de 127 px, pour
y arriver.

## 1.6 Le formulaire de contact de Cuberto

`/contacts/` — **une seule page, pas d'étapes**, 2 505 px de haut, **17 contrôles**.

| Élément | Mesure |
|---|---|
| Titre | « Hey! Tell us all the things », **81 px / 81 px / 500** |
| Sélection de service | **7 pastilles** à contour, hauteur **59 px**, rayon pilule, bordure 1 px noir. Sous l'étiquette « I'm interested in… ». Rangées espacées de **86 px**. |
| Nom | `<input>` **855 × 74 px**, **texte 28,8 px**, soulignement seul, **aucune étiquette visible — seulement un `placeholder`** |
| Courriel | idem, **146 px plus bas** |
| Message | `<textarea>`, **23,04 px**, même style |
| Budget | **5 pastilles radio** (10-20k, 30-40k, 40-50k, 50-100k, > 100k), hauteur **59 px** |
| Pièce jointe | bouton texte 247 × 51 |
| Envoi | **235 × 79 px**, rayon pilule, **contour seul** (fond transparent) |
| Requête tierce | **`g-recaptcha-response` présent** → Google reCAPTCHA |

Capture : `references/cuberto-05-formulaire-contact-1440.png`.

**Excellent :** les pastilles au lieu des listes déroulantes ; les champs à 28,8 px
(énormes, faciles à viser) ; l'espacement de 146 px qui isole chaque question ;
la question de budget posée en fourchettes, jamais en champ libre.

**Mauvais pour notre cible, et c'est mesurable :** l'étiquette **est** le
`placeholder`. Dès que le visiteur tape, « Your name » disparaît. Un patron de
55 ans qui revient à son écran après un appel ne sait plus quel champ est lequel.
C'est le défaut d'accessibilité le plus documenté du web, et Cuberto le commet.

---

# 2 · CE QU'IL NE FAUT **PAS** REPRENDRE DE CUBERTO

Cuberto vend à des directeurs produit de scale-ups qui savent déjà ce qu'est un
design system. Son site est un **échantillon de savoir-faire**, pas un outil de
conversion. Voici, point par point, ce qui se retourne contre nous.

### 2.1 La transition de page de 1,7 seconde
**Mesuré : 1 680 ms d'écran couvert entre deux pages.** Sur une visite de 5 pages,
soit 4 transitions, ça fait **6,7 secondes passées à regarder un rectangle noir**.
Un patron de PME qui a 90 secondes entre deux clients interprète un écran figé
comme un site cassé, pas comme du raffinement. Et il ne peut rien lire pendant ce
temps.
**Ce qu'on fait à la place :** § 6.5.

### 2.2 Le hero sans bouton
Mesuré : **0 bouton dans le hero**, un seul CTA de 127 px dans la nav. Le but
d'ADEXWEB est qu'on **appelle**. Un site dont l'action principale n'existe pas
au-dessus de la ligne de flottaison ne peut pas la produire.

### 2.3 Le curseur personnalisé
`.cb-cursor` en `position: fixed`, `mix-blend-mode: exclusion`, `z-index: 500`.
Le pointeur du système est remplacé par une pastille inversée. Pour un
utilisateur de 55 ans, dont le repérage du curseur est justement ce qui se
dégrade en premier, **on lui enlève son point de repère**. Et sur écran tactile,
ça ne sert à rien du tout. C'est du signalement entre designers.

### 2.4 Le défilement lissé (`lenis`)
Le défilement ne suit plus la molette : il glisse avec inertie. Deux
conséquences chez notre public : la position ne correspond plus au geste, et la
recherche de page du navigateur (`Ctrl+F`) devient imprévisible. C'est aussi une
dépendance JS de plus pour une fonction que le navigateur fait déjà.

### 2.5 Les mots qui montent de 136 px
Mesuré : chaque mot part **136 px plus bas** que sa place, avec **75 ms de
décalage** entre eux. Sur un titre de 6 mots, le dernier mot commence son voyage
375 ms après le premier et met encore 500 ms à arriver : **le titre n'est
entièrement lisible qu'après ~0,9 s**. Multiplié par les onze titres d'une page,
c'est l'impression exacte que les associés ont formulée : « on dirait un jeu
vidéo ». Le texte doit être **déjà là**, et se découvrir vite.

### 2.6 Le déploiement des services au défilement
Trois des cinq services sont réduits à leur titre tant qu'on n'a pas défilé
jusqu'à eux. L'information est **cachée derrière un geste**. Notre public ne
fait pas ce geste — il regarde, il décide, il appelle ou il part.

### 2.7 Le `placeholder` comme étiquette
Voir § 1.6. Sur un formulaire qui vise l'appel, c'est la première chose à ne pas
copier.

### 2.8 Le noir pur `#000000` sur blanc pur `#FFFFFF`
Mesuré : `#000` sur 468 éléments, `#FFF` sur 312, **aucune valeur intermédiaire**.
Le rapport est **21:1**. C'est au-delà de tout seuil et ça produit un éblouissement
(halation) chez les yeux vieillissants et les lecteurs dyslexiques. La palette
ADEXWEB fait mieux : `#161A24` sur `#FDFFFF` mesure **17,33:1** (§ 6.1) — largement
AAA, sans le noir absolu.

### 2.9 Le titre à 81 px
Ce n'est pas mauvais en soi, mais **regardez ce que font les sites qui parlent à
notre public** (tous mesurés) : RénoAssistance **48 px / graisse 800**, GOV.UK
**32 px / graisse 700**, Basecamp **41,9 px / graisse 600**, Wealthsimple 64 px.
Cuberto est à **81 px / graisse 500**. La corrélation est nette : **plus le public
est non technique, plus le titre est petit et plus il est gras.** La graisse dit
« important » ; la taille ne dit que « regardez-moi ».

### 2.10 Le reCAPTCHA
Requête tierce Google sur la page de contact. Interdit chez nous, et de toute
façon c'est un obstacle supplémentaire entre un patron pressé et son appel.

### 2.11 Ce qu'il FAUT reprendre, malgré tout

| | Pourquoi c'est bon même pour notre cible |
|---|---|
| **3 couleurs de texte, 1 couleur de bordure** | La discipline chromatique est ce qui rend Cuberto lisible. On peut copier la contrainte sans copier les couleurs. |
| **Une ligne par service, numérotée, 30 mots** | § 1.4. Le format est juste ; c'est le déploiement animé qui ne l'est pas. |
| **FAQ en `<details>`/`<summary>` natifs** | Zéro JS, accessible par défaut, fonctionne sans script. |
| **Le masque de mot `−0,2em / +0,2em`** | Le seul détail technique qui vaut de l'or : c'est ce qui empêche de rogner les **accents français** (é, À, ç) quand on masque une ligne. |
| **`aria-label` sur le parent, `aria-hidden` sur les fragments** | La bonne façon de découper du texte pour l'animer sans le casser pour un lecteur d'écran. |
| **Pastilles au lieu de listes déroulantes** | § 1.6. Un `<select>` de 7 options demande 3 gestes ; 7 pastilles en demandent 1. |
| **Champs de formulaire à 28,8 px** | Énorme, facile à viser, facile à relire. |
| **Le bouton qui s'étire en `scaleX(1,02)`** | Un retour de survol qui **ne déplace rien** autour — le bouton grossit de 2 % en largeur seulement. Discret, franc, aucun risque de décalage. |

---

# 3 · LES AUTRES RÉFÉRENCES QUE J'AI **MESURÉES**

Six sites, ouverts au navigateur, CSS calculé lu, capture prise.

## 3.1 RénoAssistance — https://renoassistance.ca — **la référence la plus proche de nous**

Québec, propriété Desjardins, cible : propriétaires et gestionnaires qui cherchent
un entrepreneur. **C'est exactement le public d'ADEXWEB, vu de l'autre côté.**
Capture : `references/ref-renoassistance-1440.png`.

| Mesure | Valeur |
|---|---|
| Police | `desjardins`, une seule famille |
| h1 | **48 px / 56 px (1,167) / graisse 800** |
| Chapô | **18 px / 28 px (1,556)** |
| Corps | **16 px / 24 px (1,500)** |
| h2 | **24 px / 32 px / graisse 700** |
| Couleur de texte dominante | **`rgb(8,34,73)` = `#082249`**, sur **763 éléments** |
| Couleurs de texte distinctes | **7** (une écrasante, six résiduelles) |
| Couleurs de fond distinctes | **7**, dont un accent chaud `rgb(251,136,81)` = `#FB8851` sur **7 éléments** |
| CTA | « **Trouver un entrepreneur** », **221 × 47 px**, rayon **30 px**, fond orange `#FB8851`, **texte en navy `#082249`**, graisse **700**, 16 px |
| CTA — répétition | **le même bouton deux fois** dans le premier écran |
| Téléphone | **`1 877 736-6360` en clair dans l'en-tête, à y = 17**, 16 px, graisse 600. Répété à y = 5586 en graisse 700. |
| Cartes de service | **298 × 88 px**, rayon **8 px** |
| Entrées de nav (DOM) | 38 (méga-menus dépliés dans le DOM ; 6 entrées visibles) |
| Mots dans le premier écran | **158** (bandeau de témoins et méga-menus inclus) |

**Ce qu'on prend, précisément :** **la structure chromatique.** Un navy quasi
identique au nôtre (`#082249` contre notre `#222D52`), un accent chaud, et
**le texte du bouton écrit dans le navy sur l'accent, jamais en blanc**. C'est
exactement la relation navy/champagne qui nous est imposée — et ce site prouve
qu'elle fonctionne sur cette clientèle. Deuxième chose : le **téléphone en clair,
en haut, au premier pixel**, pas dans le pied de page.

**Ce qu'on ne prend pas :** 158 mots au premier écran, 38 liens dans le DOM de la
nav, un bandeau de témoins. C'est un site d'entreprise, pas un site d'agence.

## 3.2 GOV.UK — https://www.gov.uk/check-uk-visa/y — **la référence du formulaire**

Une page de question réelle d'un service public conçu pour toute la population.
Capture : `references/ref-govuk-une-question-1440.png`.

| Mesure | Valeur |
|---|---|
| Police | `GDS Transport` |
| **Corps de texte** | **19 px / 25 px (1,316)** |
| La question (h1) | **32 px / graisse 700** |
| Conteneur | **`max-width: 960px`**, `padding-left: 0` |
| Le champ | **un seul `<select>`**, **221 options**, hauteur 40 px, **texte 19 px**, **rayon 0**, bordure **1,71 px solide `#0B0C0C`** |
| Le bouton | « **Continue** », **99 × 37 px**, 19 px, **rayon 0**, fond `#FFDD00`, texte `#0B0C0C`, **aligné à gauche** |
| L'ombre du bouton | **`box-shadow: 0 2px 0 #0B0C0C`** — un filet plein de 2 px sous le bouton, **aucun flou** |
| Indicateur de progression | **0 élément** dont la classe contient `progress` ou `step`. **Il n'y en a pas.** |
| Hauteur du document | **1 796 px** |
| Mots dans le premier écran | **101** (bandeau de témoins inclus ; **17 mots** sans lui) |

**Ce qu'on prend :**
1. **Le corps de texte à 19 px, pas 16.** C'est mesuré, pas recommandé : c'est ce
   que sert un État à toute sa population, personnes âgées comprises.
2. **`box-shadow: 0 2px 0` — un filet plein, pas un flou.** Ça donne du relief à un
   bouton sans dégradé, sans ombre portée et avec un `border-radius: 0`. Directement
   compatible avec les contraintes de la maison.
3. **Une question par écran, aucun indicateur de progression.** Le *GOV.UK Design
   System* documente qu'un indicateur de progression a été **retiré d'un parcours à
   12 étapes sans aucun effet sur le taux ni le temps de complétion** (équipe
   *Carer's Allowance*), et que ces indicateurs « passent souvent inaperçus »,
   « prennent beaucoup de place » et « s'adaptent mal aux petits écrans ».
   *(Recommandation lue dans la documentation publiée, pas mesurée par moi.)*
4. **Le bouton s'appelle « Continuer », pas « Suivant », et il est aligné à gauche.**

## 3.3 Made by Shape — https://madebyshape.co.uk — **la référence des cinq services**

Agence de Manchester, cinq services, clientèle PME.
Capture : `references/ref-madebyshape-1440.png`.

| Mesure | Valeur |
|---|---|
| Police | `Oldschool Grotesk` |
| h1 | **72 px / 72 px (1,000) / graisse 400 / `letter-spacing` −1,8 px (−0,025 em)** |
| h2 de section | **48 px / 48 px** · sous-titre **43,2 px** · titre de projet **32 px / 36,8 px** |
| Corps | **16 px / 24 px (1,500) / `letter-spacing` −0,4 px** |
| Couleur de texte dominante | `rgb(1,2,2)` sur **1 073 éléments** — un noir légèrement adouci, pas `#000` |
| Couleurs de texte distinctes | **5** |
| Accent | **`rgb(208,255,113)`** (vert lime) sur **30 éléments** — la couleur de l'action |
| Rayons | **16 px** (cartes) · **9999 px** (bouton rond 112 × 112) |
| Hauteur du document | **7 983 px** |

**Les cinq services, tels que je les ai lus dans le DOM :**

| Service | La phrase qui l'accompagne |
|---|---|
| Web Design | *Deliver your business to a wider audience* |
| Craft CMS | *The most reliable way to build a website* |
| Branding | *Creating brands you're proud of* |
| SEO | *Get your brand seen online* |
| Shopify | *Custom Shopify store in 4 weeks* |

**Ce qu'on prend, et c'est la meilleure chose du dossier pour la question
« cinq services » :** **un nom de service + une phrase de bénéfice de 5 à 7 mots,
en langage parlé, sans jargon.** Pas « Optimisation pour les moteurs de
recherche » mais « **Faites-vous trouver sur Google** ». Le nom sert à ranger, la
phrase sert à comprendre.

**Le hero à deux étages** est la deuxième chose à prendre : « **Hiya, we're
Shape** » puis « A web design and branding agency in Manchester » — une salutation
de 3 mots, puis **quoi + où**. Ça répond en une seconde aux deux seules questions
d'un patron de PME : qui êtes-vous, êtes-vous d'ici.

## 3.4 Wealthsimple — https://www.wealthsimple.com/en-ca — **grand public canadien**

Capture : `references/ref-wealthsimple-1440.png`.

| Mesure | Valeur |
|---|---|
| **Deux familles** | `tiempos` (serif) **pour les seuls titres d'affichage** · `the-future` (sans) pour tout le reste |
| h1 | **64 px / 74,24 px (1,160) / graisse 400 / −0,64 px** — en **serif** |
| Titres de section | **48 px / 55,68 px / graisse 500** — en **sans** |
| Chiffre géant | **128 px / 148,48 px** — en serif |
| **Corps** | **18 px / 25,2 px (1,400)** |
| Couleurs de texte distinctes | **4** : `#1C1B1B` (303 éléments), `#FCFCFC` (100), `#686664` (6) |
| Conteneur | **1264 px** (contenu) · 1440 px (en-tête) |
| Boutons | rayon **1600 px** (pilule). En-tête : **44 px de haut**, texte 14 px. Hero : **64 px de haut**, texte 16 px. |
| Mots dans le premier écran | **48** (bandeau de témoins inclus ; **~17** sans lui) |
| Hauteur du document | **10 398 px** |

**Ce qu'on prend :** le **corps à 18 px** et surtout la **règle des deux familles :
une serif réservée aux seuls titres d'affichage et aux chiffres, une sans pour
tout le reste**. C'est ce qui donne le côté « premium » sans une seule ombre, un
seul dégradé ou une seule illustration. **Boutons à 44 px minimum** dans la nav —
exactement le seuil tactile recommandé.

**Ce qu'on ne prend pas :** le bouton « Get started » du hero a un fond
`rgba(28,27,27,0.1)` — quasi transparent sur photo. Le CTA principal ne doit
jamais être translucide.

## 3.5 Basecamp — https://basecamp.com — **le parler-vrai**

Capture : `references/ref-basecamp-1440.png`.

| Mesure | Valeur |
|---|---|
| Police | `Graphik` |
| h1 | **41,9 px / 48,19 px (1,150) / graisse 600 / −0,94 px** — largeur de bloc **528 px** |
| h2 | **38,1 px / 43,8 px / graisse 600** — largeur **343 px** |
| Corps | **15,24 px / 22,86 px (1,500) / −0,29 px** |
| Couleurs de texte distinctes | **5**, dont `oklch(0.3209 0.0204 233.83)` sur **382 éléments** — un **bleu-gris très sombre, pas du noir** |
| Couleurs de fond distinctes | **6**, dont un jaune, un rouge, un bleu et un vert saturés |
| Boutons | « Sign up free » **112 × 34**, rayon **5,71 px** · CTA principal **428 × 80**, rayon **11,4 px** |
| Mots dans le premier écran | **82** |
| Hauteur du document | **4 735 px** |

**Ce qu'on prend :** **les titres de section écrits comme on parle.** Relevés tels
quels : « *Tell me if this sounds about right.* » · « *Remember when companies
cared about service? We still do.* » · « *All these questions have the same
answer: Yes!* ». Aucun n'est un nom de rubrique ; tous sont des phrases adressées
à quelqu'un. C'est ce qui manque le plus aux sites d'agence.

Et un contre-point utile à Cuberto : **h1 à 41,9 px pour 82 mots au premier écran**.
Basecamp assume la densité et compense par un titre modeste et gras. Cuberto fait
l'inverse. Les deux marchent — pour deux publics différents. Le nôtre est celui de
Basecamp.

## 3.6 Locomotive — https://locomotive.ca/en — **l'agence québécoise de référence**

Montréal, 7 fois agence de l'année Awwwards.
Capture : `references/ref-locomotive-1440.png`.

| Mesure | Valeur |
|---|---|
| h1 | **70 px / 77 px (1,100) / graisse 400** — police maison `LocomotiveNew` |
| Corps / h2 | **15 px / 19,5 px (1,300)** · h2 **26 px / 31,2 px** — police `HelveticaNowDisplay` |
| **Couleurs de fond distinctes** | **2** : `#FFFFFF` et `#000000` |
| **Couleurs de texte distinctes** | **2** : `#000000` (229) et `#FFFFFF` (39) |
| Entrées de nav | 6 visibles (Work, Agency, Careers, Store, Let's talk, Français) |
| Hauteur du document | **6 608 px** |

**Ce qu'on prend :** deux choses.
1. **Le CTA de contact est une entrée de navigation, et il est conjugué : « Let's
   talk ».** Pas « Contact ». Coût : zéro. Effet : le bouton de conversion est
   présent à 100 % du défilement sans coder une barre collante de plus.
2. **La bascule de langue est une entrée de nav** (« Français »). Modèle direct
   pour un site québécois bilingue.

**Ce qu'on ne prend pas :** le bandeau de témoins de suivi qui couvre le premier
écran (mesuré : il occupe le hero à l'arrivée). Zéro requête tierce, donc zéro
bandeau — c'est un avantage concurrentiel gratuit, à assumer.

---

# 4 · RÉFÉRENCES COMPLÉMENTAIRES (lecture de texte, **aucune mesure de CSS**)

Ces sites ont été lus en texte. **Les nombres ci-dessous sont des comptages de
mots, d'entrées et de services — jamais des tailles, des couleurs ni des marges.**

| Site | Ce qu'il fait, constaté | La chose transposable |
|---|---|---|
| **HUTS** — huts.com | Hero de **13 mots**. **Sept `<h2>` qui, lus à la suite, forment une phrase** : « Whatever type of place you have in mind » → « We do it across the country » → « Using a process built around you » → … → « Let's find that place you've been dreaming about ». Un seul CTA, « Get Started », répété 2 fois. | **Le chaînage grammatical des titres.** Un patron qui défile vite lit sept titres et a compris tout le déroulé du service sans lire un paragraphe. Zéro octet de JS : c'est du contenu. |
| **Basic / BASIC-DEPT** — basicagency.com | **7 entrées de nav.** Hero = une phrase-définition de **24 mots**. **Aucune liste de services** : cinq engagements clients nommés (Google, KFC, Wilson, AT&T, Patagonia) tiennent lieu de catalogue. | **Remplacer la liste de services par des cas nommés.** Équivalent pour nous : « Garage X, Trois-Rivières — 3 appels/semaine → 11 ». Un nom, un chiffre, une phrase. |
| **Deux Huit Huit** — deuxhuithuit.com | Montréal. Hero de **3 mots** — le plus court du corpus. Services regroupés en **4 familles numérotées 01 / 02 / 03 / 04**. | **La numérotation en CSS pur** (`counter-reset` / `counter-increment` / `::before`). Ça transforme une liste en **parcours** : le lecteur sait combien il en reste. Cinq numéros valent mieux que cinq puces. |
| **Stink Studios** — stinkstudios.com | **4 entrées de nav.** **3 catégories** (Advertising, Digital, Branding) qui **servent de filtres au portfolio**. | **Les catégories de service SONT les filtres des réalisations.** Une seule liste, deux fonctions — ça supprime une section entière. En vanilla : `data-cat="deneigement"` sur chaque carte + N boutons qui basculent une classe. |
| **Instrument** — instrument.com | **3 services seulement**, accompagnés d'**une phrase qui justifie qu'il n'y en ait que trois** : « We design across brand, product, and marketing, so every touchpoint works together and tells the same story. » | **Justifier le nombre de services par une phrase.** Si on en a cinq, écrire pourquoi ces cinq-là. Ça neutralise d'avance la question « et vous ne faites pas X ? ». |
| **Sunrun** — sunrun.com | Le formulaire commence par **la question la plus facile du monde : le code postal**. Écran suivant : « Do you own your home? » — Oui / Non. **Ensuite seulement**, les coordonnées. Aucun indicateur de progression. | **L'ordre des questions : la plus facile d'abord, la plus engageante en dernier.** Le visiteur a déjà répondu deux fois quand on lui demande son numéro. |
| **Thumbtack** — thumbtack.com | Hero de **5 mots**. **Un seul champ** au-dessus de la ligne de flottaison, avec un libellé qui autorise la paresse : « Describe your project or problem — **be as detailed as you'd like!** » | **Le libellé qui dédramatise.** « Dites-nous ce dont vous avez besoin — quelques mots suffisent. » Un `<textarea>` + un bouton, c'est le formulaire le moins effrayant qui existe. |
| **Koto** — koto.com | Hero de **2 mots** (« We're Koto »). Aucune liste de services : quatre études de cas, chacune sous **une étiquette de 3-4 mots** (« Global brand transformation »). | **L'étiquette de 3-4 mots sous chaque réalisation.** Pas un paragraphe : trois mots qui disent le résultat. |
| **Agence MOREZ** — morez.co | Lyon, français, PME. **Exactement 5 services.** Titres de section en question directe : « **Vous avez besoin d'un site internet ?** », « Ce qu'on sait faire à la perfection ». | **Le titre de section formulé en question fermée.** En français, à un patron de PME, ça appelle un « oui » mental avant le CTA. |
| **Antinomy Studio** — antinomy.studio | **3 entrées de nav** (Work, About, Contact) — le minimum du corpus, et le studio est primé. | Preuve qu'on peut descendre **sous cinq** entrées de navigation. |

## Les contre-exemples, à garder sous la main pour les réunions

| Site | Le problème, constaté | Ce que ça prouve |
|---|---|---|
| **Huge** — hugeinc.com | Hero : « **We are AI-native. HATs.** » — 5 mots, dont deux sont du jargon interne jamais expliqué. | **Court + opaque est pire que long + clair.** À montrer à qui pense que « faire court » suffit. |
| **Darkroom** — darkroom.engineering | **4 entrées de nav** (exemplaire) mais **9 services**, dont « Web3 Integration », « Headless E-Commerce », « WebGL ». | Un vocabulaire parfait pour des directeurs techniques, **létal** pour un patron de garage. |
| **DEPT** — deptagency.com | **19 liens de navigation.** Hero : « THE GROWTH INVENTION COMPANY ». Services : « Growth Invention Flywheel », « Agentic Engineering ». | 19 entrées + jargon = zéro chance sur notre cible. |
| **Lama Lama** — lamalama.com | **Site of the Month** Awwwards, juillet 2026 — et **21 services**, **25 titres de section**, 3 à 5 blocs de contenu par écran. | **Un site primé peut être saturé.** À utiliser pour argumenter contre « mettons tout ». |
| **Immersive Garden** — immersive-g.com | **Aucune navigation traditionnelle détectée.** | Sans nav, un patron de 55 ans est perdu. Ne pas transposer. |
| **Hydro-Québec** — hydroquebec.com/residentiel | 12 entrées de nav, **4 CTA concurrents** au-dessus de la ligne de flottaison, et le titre principal parle de diversité en entreprise — pas de la facture. | Français simple, structure diluée. Le contre-exemple québécois. |

---

# 5 · CE QU'ON PREND / CE QU'ON NE PREND PAS

Argumenté du seul point de vue qui compte : **est-ce que ça fait décrocher le
téléphone à un patron de PME de 45 à 60 ans ?**

## 5.1 CE QU'ON PREND

| # | La décision | Sa source mesurée | Pourquoi ça fait appeler |
|---|---|---|---|
| **P1** | **Le téléphone en clair, en haut, dès le premier pixel** | RénoAssistance : `1 877 736-6360` à **y = 17**, graisse 600 | Le but est l'appel. Un numéro relégué au pied de page oblige à traverser tout le site pour faire l'action qu'on demande. Chez Made by Shape il est à **y = 7 403** ; chez Cuberto il est dans un pied de page **qui commence à y = 13 056**. |
| **P2** | **Un seul CTA, répété deux fois : en haut et en bas** | RénoAssistance (deux « Trouver un entrepreneur » identiques dans le premier écran) ; HUTS, Vero | Deux boutons différents forcent un arbitrage. Un patron pressé qui doit choisir ne choisit rien. |
| **P3** | **Corps de texte à 19 px minimum, jamais 16** | GOV.UK **mesuré à 19 px / 25 px** | C'est la taille qu'un État sert à toute sa population. Notre cible est exactement celle qui en bénéficie. |
| **P4** | **La graisse, pas la taille, pour hiérarchiser** | RénoAssistance h1 **48 px / 800** · GOV.UK **32 px / 700** · Basecamp **41,9 px / 600** · Cuberto **81 px / 500** | La corrélation est nette sur les sept sites mesurés : plus le public est non technique, plus le titre est **petit et gras**. |
| **P5** | **Trois couleurs de texte, pas plus** | Cuberto **3** · Wealthsimple **4** · Locomotive **2** · Made by Shape **5** | Aucun des sept sites mesurés ne dépasse 7, et les meilleurs sont à 2-4. La discipline chromatique **est** ce qui fait « propre ». |
| **P6** | **Une couleur d'action et une seule, chaude, réservée aux boutons** | RénoAssistance `#FB8851` sur **7 éléments** · Made by Shape lime sur **30** | Chez nous ce sera le champagne. Si le champagne sert aussi de décoration, il cesse de dire « cliquez ici ». |
| **P7** | **Le texte du bouton dans le navy, sur l'accent — jamais en blanc** | RénoAssistance : texte `#082249` sur fond `#FB8851` | Calculé : champagne `#D2B68A` + texte `#161A24` = **8,94:1**. Champagne + blanc `#FDFFFF` = **1,94:1**, illisible. La palette ne laisse pas le choix (§ 6.1). |
| **P8** | **Un service = une ligne, numérotée 01→05, titre court + phrase de bénéfice** | Cuberto (structure) + Made by Shape (les phrases) + Deux Huit Huit (les numéros) | « **SEO** — *Faites-vous trouver sur Google* ». Le nom range, la phrase fait comprendre. Le numéro dit combien il en reste. |
| **P9** | **Les cinq services sont aussi les filtres du portfolio** | Stink Studios | Une seule liste, deux fonctions. Ça supprime une section entière — c'est-à-dire du « trop d'informations » en moins. |
| **P10** | **Titres de section écrits comme on parle, en question fermée** | Basecamp (« Tell me if this sounds about right. ») · MOREZ (« Vous avez besoin d'un site internet ? ») | Une question appelle un « oui » mental. Un nom de rubrique n'appelle rien. |
| **P11** | **Les titres de section, lus à la suite, forment une phrase** | HUTS (7 `<h2>` enchaînés) | C'est le mode de lecture réel de notre cible : elle défile et ne lit que les titres. |
| **P12** | **Formulaire : une question par écran, la plus facile d'abord** | Sunrun (code postal → oui/non → coordonnées) · GOV.UK (1 question, 1 champ) | Le visiteur s'est déjà engagé deux fois quand on lui demande son numéro. |
| **P13** | **Aucun indicateur de progression dans le formulaire** | GOV.UK : **0 élément** de classe `progress`/`step` sur la page mesurée | Documenté par le GOV.UK Design System : retiré d'un parcours à 12 étapes **sans effet mesurable**, et « passe souvent inaperçu ». |
| **P14** | **Pastilles cliquables au lieu de listes déroulantes** | Cuberto (7 + 5 pastilles de **59 px** de haut) | Un `<select>` demande 3 gestes ; une pastille en demande 1. Et sur téléphone, un `<select>` ouvre un tiroir système que notre cible referme par erreur. |
| **P15** | **Étiquette **au-dessus** du champ, jamais dans le champ** | Cuberto fait l'inverse ; GOV.UK fait bien | Le `placeholder` disparaît dès la première frappe. C'est le défaut qui coûte le plus de formulaires abandonnés. |
| **P16** | **Bouton : `border-radius: 0` + `box-shadow: 0 2px 0`** | GOV.UK **mesuré** : `0 2px 0 #0B0C0C`, rayon 0 | Un relief net sans flou, sans dégradé, sans ombre portée. Compatible avec toutes les contraintes de la maison. |
| **P17** | **Cible tactile ≥ 44 px de haut pour tout ce qui se clique** | Wealthsimple **44 px** (nav) et **64 px** (hero) · Cuberto CTA **52 px** · Cuberto pastilles **59 px** | WCAG 2.5.5 (niveau AAA) fixe 44 × 44 px. Le minimum AA (2.5.8) est 24 px — insuffisant pour un pouce de 55 ans. |
| **P18** | **FAQ en `<details>`/`<summary>` natifs** | Cuberto | Zéro JS, accessible d'office, fonctionne script coupé. |
| **P19** | **Le masque de mot `−0,2em / +0,2em`** | Cuberto, relevé dans le DOM | La seule façon de masquer une ligne **sans rogner les accents français**. Indispensable pour « À », « É », « ç ». |
| **P20** | **`aria-label` sur le parent, `aria-hidden` sur les fragments animés** | Cuberto | La bonne façon de découper du texte pour l'animer. |
| **P21** | **Le CTA est une entrée de nav, et il est conjugué** | Locomotive (« Let's talk ») | « **Appelez-nous** », pas « Contact ». Un verbe demande une action ; un nom ne demande rien. |
| **P22** | **Une serif pour les seuls titres d'affichage et les chiffres, une sans pour tout le reste** | Wealthsimple (`tiempos` + `the-future`) | C'est ce qui fait « premium » sans une seule ombre ni un seul dégradé. Deux familles, pas trois. |
| **P23** | **Chaque chiffre affiché est suivi de sa méthode entre parenthèses** | RénoAssistance : « 94 % de clients satisfaits (sondage 2024, 1 249 clients) » | Un chiffre nu se conteste au téléphone. Un chiffre sourcé ne se conteste pas. |

## 5.2 CE QU'ON NE PREND PAS

| # | Ce qu'on refuse | Sa source mesurée | Pourquoi ça coûte des appels |
|---|---|---|---|
| **R1** | **La transition de page longue** | Cuberto : **1 680 ms** mesurés, soit **6,7 s** sur une visite de 5 pages | Un écran figé se lit « site cassé », pas « raffinement ». |
| **R2** | **Le hero sans bouton** | Cuberto : **0 bouton** dans le hero | On demande un appel ; l'action doit exister là où le regard se pose. |
| **R3** | **Le curseur personnalisé** | Cuberto `.cb-cursor`, `mix-blend-mode: exclusion` | On enlève à un utilisateur de 55 ans le repère qu'il perd déjà. Et ça ne fait rien sur tactile. |
| **R4** | **Le défilement lissé (Lenis, Locomotive Scroll)** | Cuberto : `html.lenis` en permanence | Le défilement ne suit plus le geste ; `Ctrl+F` devient imprévisible ; une dépendance JS pour une fonction native. |
| **R5** | **Le texte qui monte de 136 px** | Cuberto : **136 px**, décalage **75 ms/mot**, titre lisible après **~0,9 s** | Multiplié par onze titres, c'est très exactement « on dirait un jeu vidéo ». |
| **R6** | **Le contenu déployé au défilement** | Cuberto : 3 services sur 5 réduits à leur titre | L'information est cachée derrière un geste que notre cible ne fait pas. |
| **R7** | **`placeholder` comme étiquette** | Cuberto : « Your name », « Email », aucune `<label>` visible | Voir P15. |
| **R8** | **Le noir pur sur blanc pur** | Cuberto : `#000` × 468, `#FFF` × 312, ratio **21:1** | Halation chez les yeux vieillissants. Notre `#161A24` sur `#FDFFFF` fait **17,33:1** — largement AAA, sans l'éblouissement. |
| **R9** | **Le titre à 81 px** | Cuberto | Voir P4 : la graisse, pas la taille. |
| **R10** | **Toute requête tierce** (reCAPTCHA, témoins de suivi, polices distantes) | Cuberto : `g-recaptcha-response` · Locomotive et RénoAssistance : bandeau de témoins couvrant le premier écran | Zéro requête tierce = **zéro bandeau de témoins**. C'est un premier écran entièrement libre, là où deux de nos références perdent le leur. Argument commercial gratuit. |
| **R11** | **Plus de 6 entrées de navigation** | DEPT **19** · Jane **20** · Cuberto **5** · Locomotive **6** · Antinomy **3** | Sur les sites relevés, la médiane est 5. Les deux qui échouent le plus nettement sur un public non technique sont à 19 et 20. |
| **R12** | **Le jargon, même court** | Huge (« We are AI-native. HATs. ») · Darkroom (« Headless E-Commerce », « WebGL ») | Court + opaque est pire que long + clair. |
| **R13** | **L'accordéon pour les services** | **Aucune** des agences relevées n'en utilise un pour ses services | Un accordéon cache le contenu derrière un clic — précisément le geste que cette cible ne fait pas. |
| **R14** | **Le CTA translucide sur photo** | Wealthsimple : hero `rgba(28,27,27,0.1)` | Le bouton qui compte ne se met jamais en `rgba`. |
| **R15** | **Deux CTA concurrents** | Hydro-Québec : **4** au-dessus de la ligne de flottaison | Un arbitrage à faire = aucune action prise. |

---

# 6 · DIRECTION PROPOSÉE POUR ADEXWEB

Tout ce qui suit est chiffré. Chaque valeur est soit **calculée par moi**, soit
**dérivée d'une mesure du § 1 ou du § 3**, et sa source est indiquée.

## 6.1 La palette imposée, vérifiée au contraste — **calculé, formule WCAG 2.x**

C'est le résultat le plus contraignant de tout le document. **Trois choses sont
interdites par les chiffres eux-mêmes.**

| Avant-plan | Fond | Ratio | Verdict |
|---|---|---|---|
| texte `#161A24` | pearl `#FDFFFF` | **17,33:1** | ✅ AAA |
| texte `#161A24` | silk `#EEE5D9` | **13,95:1** | ✅ AAA |
| texte `#161A24` | marble `#E8E4E0` | **13,75:1** | ✅ AAA |
| texte `#161A24` | champagne `#D2B68A` | **8,94:1** | ✅ AAA |
| texte `#161A24` | champagne clair `#E7D7BC` | **12,29:1** | ✅ AAA |
| navy `#222D52` | pearl `#FDFFFF` | **13,37:1** | ✅ AAA |
| navy `#222D52` | silk `#EEE5D9` | **10,76:1** | ✅ AAA |
| navy `#222D52` | marble `#E8E4E0` | **10,61:1** | ✅ AAA |
| navy `#222D52` | champagne clair `#E7D7BC` | **9,48:1** | ✅ AAA |
| navy `#222D52` | champagne `#D2B68A` | **6,90:1** | ✅ AA (échoue AAA de peu) |
| navy `#222D52` | champagne foncé `#B99B6B` | **5,09:1** | ✅ AA |
| pearl `#FDFFFF` | navy foncé `#18213D` | **15,81:1** | ✅ AAA |
| pearl `#FDFFFF` | navy `#222D52` | **13,37:1** | ✅ AAA |
| pearl `#FDFFFF` | navy clair `#35446F` | **9,48:1** | ✅ AAA |
| champagne `#D2B68A` | navy foncé `#18213D` | **8,16:1** | ✅ AAA |
| champagne `#D2B68A` | navy `#222D52` | **6,90:1** | ✅ AA |
| **discret `#6E7180`** | **pearl `#FDFFFF`** | **4,82:1** | ⚠️ **AA seulement — échoue AAA** |
| **discret `#6E7180`** | **silk `#EEE5D9`** | **3,88:1** | ❌ **ÉCHEC en corps de texte** |
| **discret `#6E7180`** | **marble `#E8E4E0`** | **3,83:1** | ❌ **ÉCHEC en corps de texte** |
| **champagne `#D2B68A`** | **pearl `#FDFFFF`** | **1,94:1** | ❌ **ÉCHEC TOTAL** |
| **champagne foncé `#B99B6B`** | **pearl `#FDFFFF`** | **2,63:1** | ❌ **ÉCHEC TOTAL** |

### Les trois règles que ces chiffres imposent

> **RÈGLE C1 — Le champagne ne porte JAMAIS de texte sur le fond blanc.**
> `#D2B68A` sur `#FDFFFF` = **1,94:1**. Même la variante foncée `#B99B6B` n'atteint
> que **2,63:1**. Le champagne est une **matière de remplissage**, jamais une encre
> sur clair. Il ne peut pas non plus servir de trait fin de 1 px sur le blanc : on
> ne le verrait pas. Il devient une encre **uniquement sur le navy** (6,90:1 sur
> `#222D52`, 8,16:1 sur `#18213D`).

> **RÈGLE C2 — Le gris discret `#6E7180` ne se pose JAMAIS sur silk ni sur marble.**
> 3,88:1 et 3,83:1 : sous le seuil AA de 4,5:1 pour du corps de texte. Il n'est
> admissible que sur **pearl**, et encore : à **4,82:1** il passe AA mais échoue le
> AAA (7:1) qui est le bon objectif pour un lecteur de 45-60 ans. **Conséquence :
> le gris discret est réservé aux mentions légales et aux métadonnées, jamais à une
> phrase qu'on veut faire lire.**

> **RÈGLE C3 — Le bouton d'action est un aplat champagne avec du texte `#161A24`.**
> **8,94:1**, AAA, et c'est exactement ce que fait RénoAssistance avec son orange
> (texte navy sur accent chaud). Un bouton champagne à texte blanc est illisible ;
> un bouton navy à texte pearl (13,37:1) reste possible pour l'action secondaire.

### Rôle de chaque couleur

| Couleur | Rôle unique |
|---|---|
| **pearl `#FDFFFF`** | Le fond. Partout, par défaut. |
| **texte `#161A24`** | Toute l'encre courante. |
| **navy `#222D52`** | Les titres, les filets, et le fond des sections inversées. |
| **navy foncé `#18213D`** | Le pied de page, et lui seul. |
| **navy clair `#35446F`** | Les états de survol du navy. Rien d'autre. |
| **champagne `#D2B68A`** | **L'action, et rien d'autre.** Le fond des boutons primaires ; le filet de section active ; le soulignement du lien survolé. Si le champagne apparaît ailleurs, il cesse de vouloir dire « cliquez ». |
| **champagne clair `#E7D7BC`** | Le fond d'une zone de mise en avant (une citation client, un encadré). |
| **champagne foncé `#B99B6B`** | Le survol du bouton primaire uniquement. |
| **silk `#EEE5D9`** | Fond de section alternée. |
| **marble `#E8E4E0`** | Fond de vignette de réalisation. |
| **discret `#6E7180`** | Mentions légales, dates, méta. Sur pearl uniquement. |

**Cible : 3 couleurs de texte visibles au maximum** (`#161A24`, `#FDFFFF`,
`#222D52`), le `#6E7180` en quatrième pour les seules mentions. C'est le régime de
Cuberto (3) et de Wealthsimple (4), tous deux mesurés.

## 6.2 Échelle typographique — **chiffrée**

**Base : 19 px** (mesuré chez GOV.UK, § 3.2). **Rapport : 1,25** exactement (tierce
majeure) — le rapport le plus fréquent dans les pas de Cuberto (3 pas sur 8) et de
GOV.UK.

| Niveau | Taille | Interligne | Rapport | Graisse | `letter-spacing` | Emploi |
|---|---|---|---|---|---|---|
| **T-00** | **15 px** | 22 px | 1,467 | 500 | +0,02 em | Mentions, dates, méta |
| **T-0** | **19 px** | **30 px** | **1,579** | 400 | 0 | **Corps de texte. Le niveau par défaut.** |
| **T-1** | **24 px** | 34 px | 1,417 | 400 | −0,005 em | Chapô, phrase de bénéfice d'un service |
| **T-2** | **30 px** | 38 px | 1,267 | 700 | −0,01 em | Titre de service, question de FAQ |
| **T-3** | **38 px** | 46 px | 1,211 | 700 | −0,015 em | Titre de section |
| **T-4** | **48 px** | 54 px | 1,125 | 800 | −0,02 em | h1 des pages intérieures |
| **T-5** | **60 px** | 64 px | 1,067 | 800 | −0,025 em | h1 de l'accueil |

**Contrôle de cohérence : 15 × 1,25 = 18,75 → 19 · 19 × 1,25 = 23,75 → 24 ·
24 × 1,25 = 30 · 30 × 1,25 = 37,5 → 38 · 38 × 1,25 = 47,5 → 48 · 48 × 1,25 = 60.**
Sept niveaux, un seul rapport, aucune valeur inventée.

**Le rapport corps → titre principal est de 60/19 = × 3,16.** Cuberto est à × 4,5,
Wealthsimple à × 3,56, RénoAssistance à × 3,00, GOV.UK à × 1,68. On se place entre
RénoAssistance et Wealthsimple — délibérément du côté du public non technique.

**Deux justifications à défendre :**

1. **Interligne du corps à 1,579 (19/30), pas 1,32 comme GOV.UK.** Le français
   produit des lignes 15 à 20 % plus longues que l'anglais à contenu égal, et notre
   lecteur a 45 à 60 ans. Une ligne plus aérée est ce qui l'empêche de sauter une
   ligne en revenant à gauche.
2. **Les titres sont en graisse 700-800, pas 400-500.** C'est le résultat le plus
   net des sept relevés (§ 5.1 P4). Cuberto est à 500 pour un public de designers ;
   RénoAssistance, qui parle à nos clients, est à **800**.

**Familles :** deux, jamais trois (modèle Wealthsimple mesuré).
- **Une serif** pour T-4, T-5 et les chiffres de preuve **uniquement**.
- **Une grotesque** pour T-00 à T-3, tous les boutons, tous les champs.
- Auto-hébergées en `.woff2`, `font-display: swap`, sous-ensemble latin + français.
  **Aucune police distante.**

**Adaptation en petite largeur (< 768 px) :** T-5 → 38 px, T-4 → 32 px, T-3 → 27 px,
T-2 → 24 px. **T-0 reste à 19 px.** Le corps de texte ne rétrécit jamais — c'est la
règle explicite du GOV.UK Design System, et c'est la seule qui protège notre
lecteur.

## 6.3 Rythme vertical — **chiffré**

**Unité de base : 8 px.** Toutes les valeurs sont des multiples.

| Ce qui est mesuré | ≥ 1024 px | < 768 px | Multiple |
|---|---|---|---|
| Espace entre deux sections | **128 px** | **72 px** | 16 × 8 · 9 × 8 |
| Espace entre deux sections, coupure majeure | **192 px** | **96 px** | 24 × 8 · 12 × 8 |
| Titre de section → premier bloc | **40 px** | **32 px** | 5 × 8 · 4 × 8 |
| Titre → son paragraphe | **16 px** | **16 px** | 2 × 8 |
| Entre deux lignes de service | **96 px** | **64 px** | 12 × 8 · 8 × 8 |
| Entre deux champs de formulaire | **48 px** | **40 px** | 6 × 8 · 5 × 8 |
| Étiquette → son champ | **8 px** | **8 px** | 1 × 8 |
| Padding interne d'un bouton | **16 px / 32 px** | idem | 2 × 8 / 4 × 8 |
| Hauteur d'un bouton primaire | **56 px** | **56 px** | 7 × 8 |
| Hauteur d'un champ de formulaire | **56 px** | **56 px** | 7 × 8 |
| Hauteur de la barre de navigation | **72 px** | **64 px** | 9 × 8 · 8 × 8 |
| Padding du pied de page | **96 px** | **64 px** | 12 × 8 · 8 × 8 |

**Ancrage sur les mesures :** Cuberto sépare ses sections de **126 px** et **198 px**
à 1440 (§ 1.1). Nos 128 et 192 sont les multiples de 8 les plus proches. **On peut
se le permettre d'autant mieux que nos pages contiendront moins de contenu que les
siennes** — moins de matière, plus d'air, c'est précisément la réponse à « trop
d'informations, on se perd ».

**Hauteurs de cible :** bouton **56 px**, champ **56 px**, lien de nav **48 px**
minimum. Tous au-dessus du seuil WCAG 2.5.5 de 44 px. Références mesurées :
Wealthsimple 44 et 64, Cuberto 52 et 59.

## 6.4 Composition — **chiffrée**

| Ce qui est mesuré | Valeur | Source |
|---|---|---|
| Largeur max de la page | **1280 px** | Entre GOV.UK (960) et Wealthsimple (1264). Cuberto est à 1600 — trop pour notre densité. |
| Gouttière ≥ 1024 px | **80 px** | Colonne de contenu utile : **1120 px** |
| Gouttière 768–1023 px | **48 px** | |
| Gouttière < 768 px | **24 px** | |
| **Largeur max d'une colonne de texte** | **680 px** | À 19 px, cela fait **~68 caractères par ligne**. Références : GOV.UK 630 px @ 19 px (~70 car.), Cuberto 618 px @ 23 px (~62 car.), Cuberto 504 px @ 18 px (~56 car.). |
| Grille | **12 colonnes**, gouttière **24 px** | |

### Les cinq principes de composition

1. **Une idée par écran.** Aucune section ne contient deux propositions. Si une
   section a besoin de deux titres, c'est deux sections. *(HUTS, Vero, 2xA — § 4.)*
2. **Le texte est toujours à gauche, jamais centré**, sauf le h1 de l'accueil et le
   titre de clôture. Un bloc de 68 caractères centré oblige l'œil à retrouver un
   nouveau point de départ à chaque ligne — c'est le premier réflexe qui se dégrade
   après 45 ans.
3. **Deux colonnes au maximum.** Jamais trois. Notre lecteur ne balaie pas une
   grille, il descend une colonne.
4. **Le premier écran contient au plus 25 mots** — et un bouton.
   Mesurés : Cuberto 27 (mais sans bouton), Wealthsimple ~17 hors bandeau,
   GOV.UK 17 hors bandeau, Basecamp 82, RénoAssistance 158.
   Le premier écran d'ADEXWEB tient en : **le logo (1) + 5 entrées de nav (5) + un
   numéro de téléphone + un h1 de 6 à 8 mots + une phrase de 12 à 15 mots + UN
   bouton.** Rien d'autre.
5. **La profondeur se fait avec un filet, jamais avec une ombre.** Modèle mesuré :
   GOV.UK `box-shadow: 0 2px 0 #0B0C0C`, `border-radius: 0`. Chez nous :
   `box-shadow: 0 3px 0 #18213D` sur les boutons primaires, `border-bottom: 2px
   solid` sur les champs.

### Rayons

Les mesures divergent : Cuberto **0 ou pilule** ; GOV.UK **0** ; RénoAssistance
**8 px** (cartes) et **30 px** (boutons) ; Made by Shape **16 px** ; Wealthsimple
**pilule**. Il n'y a pas de vérité mesurée ici — c'est un choix.

**Proposition : un seul rayon, `4 px`, partout — boutons, champs, vignettes.**
Argument : un rayon unique et faible se lit comme une décision, pas comme un
défaut ; et il ne concurrence jamais le contenu. **Ne pas mélanger 8 px, 16 px et
la pilule sur une même page** — c'est exactement ce qui produit l'impression de
« pas clair ».

## 6.5 Rôle du mouvement — **chiffré, et volontairement pauvre**

> **La règle-cadre : ce site n'a le droit qu'à UN SEUL type de mouvement d'entrée.**
> Cuberto en a une demi-douzaine simultanés. C'est de là que vient « on dirait un
> jeu vidéo ».

### Le mouvement unique

| Paramètre | Valeur | D'où elle vient |
|---|---|---|
| Propriétés animées | **`opacity` et `translateY` seulement** | Les deux seules qui ne déclenchent pas de recalcul de mise en page |
| Distance | **`translateY(16px) → 0`** | Cuberto mesure **136 px**. On divise par **8,5**. À 16 px, le mouvement se **remarque** sans qu'on ait à l'**attendre**. |
| Durée | **500 ms** | Cuberto mesure une signature CSS à **1,2 s** et une révélation de mot dont 90 % se fait en **500 ms**. On garde les 500 ms utiles et on jette la queue. |
| Courbe | **`cubic-bezier(0.16, 1, 0.3, 1)`** | Exactement celle de Cuberto, mesurée sur **30 éléments**. Elle est bonne ; c'est sa durée qui ne l'est pas. |
| Décalage entre éléments | **60 ms** | Cuberto mesure **75 ms par MOT**. Nous : 60 ms **par BLOC**, jamais par mot. |
| Nombre d'éléments décalés | **3 au maximum** par groupe | Au-delà, le dernier arrive 240 ms après le premier — c'est le seuil au-delà duquel on attend. |
| Déclencheur | L'élément entre à **80 % de la hauteur de l'écran** | |
| Répétition | **Jamais.** Une fois joué, l'élément reste en place. | |

### Ce qui est interdit, et pourquoi

| Interdit | Mesure qui le condamne |
|---|---|
| Animer le texte **mot par mot** | Cuberto : 6 mots × 75 ms + 500 ms = **~0,9 s** avant qu'un titre soit lisible |
| Le défilement lissé (Lenis, Locomotive Scroll) | Le geste ne correspond plus au résultat ; `Ctrl+F` devient imprévisible |
| Le curseur personnalisé | On enlève un repère à qui le perd déjà |
| Une animation qui **cache** du contenu jusqu'au défilement | Cuberto : 3 services sur 5 illisibles à l'arrivée |
| La parallaxe | Cuberto : `scale(1,05)` + translation continue. Un fond qui bouge indépendamment du texte donne le mal de mer à une part réelle de la population |
| Toute animation de plus de **600 ms** | |
| Toute animation **en boucle** | Un mouvement qui ne s'arrête jamais attire l'œil en permanence, donc l'éloigne du bouton |

### Transition de page

**Cross-document View Transitions, en CSS pur** — c'est la seule réponse compatible
avec « plusieurs pages statiques, vanilla, zéro dépendance ». À poser dans **les
deux** pages :

```css
@media (prefers-reduced-motion: no-preference) {
  @view-transition { navigation: auto; }
}
::view-transition-old(root),
::view-transition-new(root) { animation-duration: 180ms; }
```

**180 ms, pas 1 680.** Justification directe : Cuberto mesure **1 680 ms** par
transition, soit **6,7 secondes d'écran couvert sur une visite de 5 pages**. À
180 ms, la même visite coûte **0,72 s**. Le fondu est perçu comme une continuité,
pas comme une attente.

*Note de fiabilité : la syntaxe et le support (Chrome/Edge 126+, Safari 18.2+,
Firefox non supporté) viennent de MDN et de la documentation Chrome, pas d'une
mesure faite par moi. La dégradation est gratuite : sans support, la navigation
est instantanée.*

**Deux pièges documentés à retenir :** la balise
`<meta name="view-transition">` **ne fait plus rien** (seule la règle CSS compte) ;
et la transition est **tuée silencieusement au bout de 4 s**, TTFB compris — sans
importance pour un site statique.

### `prefers-reduced-motion`

**Sous `prefers-reduced-motion: reduce`, il n'y a AUCUN mouvement.** Pas de version
atténuée, pas de fondu de remplacement : les éléments sont **à leur place finale
dès le premier rendu**. Ce qui implique la règle d'implémentation :

> **L'état de repos en CSS est TOUJOURS la forme finale.** Le point de départ
> (`translateY(16px)`, `opacity: 0`) est posé **par le script**, jamais par la
> feuille de style. Sans JavaScript, ou sous mouvement réduit, la page est
> complète et lisible — et rien n'a jamais eu à être « restauré ».

## 6.6 Ton d'écriture

**La règle de trois secondes :** un patron de garage de 55 ans lit la phrase et
sait quoi faire. Sinon, elle se réécrit.

| Faire | Ne pas faire | Source mesurée |
|---|---|---|
| **Vouvoyer.** « Vous » est le sujet de la phrase, pas « nous ». | « Nous concevons des expériences digitales » | Jane : « **Your** patients will be happy too » |
| **Des verbes concrets à la place des noms de métier.** « Faites-vous trouver sur Google » | « Référencement naturel (SEO) » | Made by Shape : « SEO — *Get your brand seen online*» |
| **Des titres de section en question fermée.** « Vous perdez des appels le soir ? » | « Nos services » | MOREZ : « Vous avez besoin d'un site internet ? » |
| **Des titres qui, lus à la suite, forment une phrase.** | Sept titres sans rapport entre eux | HUTS (7 `<h2>` enchaînés) |
| **Parler comme au téléphone.** « Dites-nous ce qu'il vous faut. Quelques mots suffisent. » | « Veuillez remplir le formulaire ci-dessous » | Basecamp : « Tell me if this sounds about right. » · Thumbtack : « be as detailed as you'd like! » |
| **Un chiffre suivi de sa méthode.** « 94 % de clients satisfaits (sondage 2024, 1 249 clients) » | « 4,9 ★ · 128 avis » | RénoAssistance |
| **Un CTA conjugué.** « Appelez-nous », « Parlons-en » | « Contact », « En savoir plus » | Locomotive : « Let's talk » |
| **Dire où on est.** « Une agence web à [ville], au Québec. » | Ne jamais nommer la ville | Made by Shape : « …in Manchester » |
| **Zéro sigle non expliqué.** Jamais « CMS », « CRM », « SEO » seul. | | Huge (« HATs »), Darkroom (« WebGL »), DEPT (« Agentic Engineering ») |

**Longueurs plafonnées :**
- h1 : **6 à 8 mots**
- Phrase de bénéfice d'un service : **5 à 7 mots** *(mesuré chez Made by Shape : de 5 à 8)*
- Paragraphe : **30 mots maximum** *(mesuré chez Cuberto : 28 à 31 par service)*
- Premier écran : **25 mots au total**, bouton compris

## 6.7 La page d'accueil, écran par écran

Une proposition concrète, avec les hauteurs.

| # | L'écran | Contenu, compté | Hauteur visée |
|---|---|---|---|
| **1** | **Le hero** | Logo · 5 entrées de nav · **téléphone en clair** · h1 T-5 de 6-8 mots · une phrase T-1 de 12-15 mots · **UN bouton champagne de 56 px** · une image | ≤ **640 px** de contenu, pour que la section 2 entre par le bas |
| **2** | **La preuve** | 3 chiffres, chacun **avec sa méthode entre parenthèses** | 320 px |
| **3** | **Les cinq services** | 5 lignes, numérotées 01→05, titre T-2 + phrase de bénéfice T-1 de 5-7 mots. **Toutes visibles, aucune repliée.** | 5 × 96 px + titre |
| **4** | **Trois réalisations** | Une image, un nom, **une étiquette de 3-4 mots** (« Garage Dupuis — 3× plus d'appels ») | 560 px |
| **5** | **Comment ça marche** | 3 étapes numérotées, une phrase chacune | 400 px |
| **6** | **FAQ** | 5 questions en `<details>` natifs | 480 px |
| **7** | **Le rappel** | Le **même** bouton que le hero, en grand + le numéro | 320 px |
| — | **Pied de page** | Navy foncé `#18213D`. Téléphone, adresse, 5 liens, bascule FR/EN | 320 px |

**Hauteur totale visée : ≤ 4 000 px.** Cuberto est à **13 528 px**. Basecamp, qui
parle à des patrons de PME, est à **4 735 px**. C'est la fourchette qu'on vise —
et c'est, chiffrée, la réponse à « trop d'informations, on se perd ».

## 6.8 Le formulaire, en une page — chiffré

| Ce qui est fixé | Valeur | Source |
|---|---|---|
| Structure | **N `<fieldset>` dans UN SEUL `<form>`**. Tous visibles par défaut ; `hidden` posé par le script **au chargement, seulement si le script tourne**. | Dégradation naturelle : script coupé, le formulaire long s'affiche entier et fonctionne. |
| Questions par écran | **1** | GOV.UK, mesuré |
| Ordre | **La plus facile d'abord** (code postal / ville), **la plus engageante en dernier** (le numéro de téléphone) | Sunrun |
| Indicateur de progression | **Aucun** | GOV.UK, mesuré : 0 élément |
| Étiquette | **Au-dessus du champ**, T-0 19 px, graisse 700, **8 px** au-dessus | GOV.UK ; l'inverse de Cuberto |
| Champ | **56 px** de haut, texte **19 px**, `border-bottom: 2px solid #222D52`, rayon 4 px | Seuil tactile 44 px dépassé |
| Choix multiples | **Pastilles de 56 px**, jamais un `<select>` | Cuberto : 7 + 5 pastilles de 59 px |
| Bouton | « **Continuer** » (jamais « Suivant »), **aligné à gauche**, champagne à texte `#161A24` (**8,94:1**), `box-shadow: 0 3px 0 #18213D`, rayon 4 px | GOV.UK, mesuré |
| Espace entre deux questions | **48 px** | |
| Anti-robot | **Un champ appât (`honeypot`) masqué.** Aucun CAPTCHA, aucune requête tierce. | Cuberto utilise reCAPTCHA — interdit chez nous |
| Le libellé qui dédramatise | « Dites-nous ce dont vous avez besoin. **Quelques mots suffisent.** » | Thumbtack |

---

# 7 · LES CINQ QUESTIONS, EN UNE LIGNE CHACUNE

| Question | La réponse, et sa source mesurée |
|---|---|
| **Faire respirer une page** | **128 px entre deux sections, une idée par section, 25 mots au premier écran, une colonne de texte de 680 px.** Sources : Cuberto (126/198 px mesurés), HUTS (chaînage des titres), Basecamp (4 735 px de page contre 13 528 chez Cuberto). |
| **Un formulaire long sans faire fuir** | **Une question par écran, la plus facile d'abord, aucun indicateur de progression, l'étiquette au-dessus du champ, un bouton « Continuer » aligné à gauche.** Sources : GOV.UK (mesuré : 1 champ, 19 px, 0 indicateur), Sunrun (l'ordre), Thumbtack (le libellé qui rassure). |
| **Passer d'une page à l'autre** | **`@view-transition { navigation: auto }` en CSS pur, sous `prefers-reduced-motion: no-preference`, durée 180 ms.** Contre les **1 680 ms mesurés** chez Cuberto, soit 6,7 s par visite de 5 pages. |
| **Présenter cinq services** | **Cinq lignes pleine largeur, numérotées 01→05, titre court + phrase de bénéfice de 5-7 mots en langage parlé, toutes visibles, aucune repliée.** Sources : Cuberto (la forme, mesurée : 1 ligne, 159 px, 30 mots), Made by Shape (les phrases), Deux Huit Huit (les numéros). **Aucune agence relevée n'utilise d'accordéon pour ses services.** |
| **Parler à un public non technique et âgé** | **Corps à 19 px, contraste ≥ 7:1 sur le corps, cibles ≥ 44 px, un seul CTA, le téléphone en clair au premier pixel, la graisse plutôt que la taille, chaque chiffre avec sa méthode.** Sources : GOV.UK (19 px mesuré), RénoAssistance (téléphone à y=17, h1 48 px/800, chiffres sourcés), Wealthsimple (44 px, 18 px de corps), et le calcul de contraste du § 6.1. |

---

# 8 · CE QUI RESTE À VÉRIFIER

À écrire dans le journal des réserves du projet.

1. **Aucune de ces mesures n'a été prise sur un appareil réel.** Tout vient de
   Chromium sous Playwright sur une machine de bureau Windows. **Aucune session ne
   doit écrire « vérifié sur mobile ».**
2. **Le support de `@view-transition` n'a pas été testé par moi.** Il vient de la
   documentation MDN/Chrome. Firefox ne le supporte pas ; le comportement de
   repli (navigation instantanée) est à constater dans un vrai Firefox.
3. **Les tailles de police ci-dessus n'ont pas été vues à l'écran en français.**
   Une grotesque à 19 px avec des accents et des cédilles se comporte autrement
   qu'en anglais. À vérifier sur une planche imprimée à l'échelle 1.
4. **Le rayon de 4 px est un choix, pas un résultat.** Les mesures divergent
   (0, 8, 16, pilule). À trancher avec les associés, sur une planche.
5. **Les gains de conversion attribués aux formulaires multi-étapes** (Formstack
   13,9 % contre 4,5 %, HubSpot +86 %) sont **de seconde main, sans méthodologie
   vérifiée**. Ne pas les citer à un client. Ce qui est solide, c'est la
   documentation GOV.UK sur l'inutilité de l'indicateur de progression.
6. **Les sept sites mesurés le sont à un instant donné.** Un relevé de site vivant
   se périme ; refaire les mesures avant de s'en servir comme argument face à un
   client.

---

## Index des captures — `refonte-adexweb/references/`

| Fichier | Ce qu'il montre |
|---|---|
| `cuberto-01-accueil-1440.png` | Le premier écran : 27 mots, 0 bouton dans le hero |
| `cuberto-02-cinq-services-1440.png` | Les cinq services : 01 et 02 ouverts, 03 réduit à son titre |
| `cuberto-03-pied-de-page-1440.png` | « Have an idea? Tell us about it » + le pied de page |
| `cuberto-04-page-about-1440.png` | Page intérieure `/about/` |
| `cuberto-05-formulaire-contact-1440.png` | Les 7 pastilles et les champs à `placeholder` seul |
| `ref-renoassistance-1440.png` | Navy + accent chaud, téléphone en haut, CTA doublé |
| `ref-govuk-une-question-1440.png` | Une question, un champ, un bouton, aucun indicateur |
| `ref-madebyshape-1440.png` | Le hero à deux étages, les 5 services à phrase de bénéfice |
| `ref-wealthsimple-1440.png` | Serif d'affichage + sans de texte, corps à 18 px |
| `ref-basecamp-1440.png` | Titres écrits comme on parle, h1 modeste et gras |
| `ref-locomotive-1440.png` | Deux couleurs en tout ; le bandeau de témoins qui mange le hero |
