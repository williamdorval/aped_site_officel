# ANIMATIONS — catalogue exhaustif

**Quand lire ce fichier :** avant de toucher à un mouvement, et avant
d'en ajouter un — la colonne « Verbe » dit lequel des quatre il est, et
un mouvement sans verbe ne se fait pas.

## Table

- [0 · Les jetons de temps et de courbe](#0--les-jetons-de-temps-et-de-courbe)
- [1 · Le catalogue](#1--le-catalogue) — A1 → A184, par fichier
- [2 · Les verrous](#2--les-verrous) — ce qui empêche chaque animation de jouer
- [3 · Accueil `#top`](#3--accueil--top) — la séquence détaillée
- [4 · Ce qui n'est pas animé](#4--ce-qui-nest-pas-animé)
- [5 · Anomalies relevées](#5--anomalies-relevées-pendant-le-dépouillement)

> **LA CLÉ D'UNE ENTRÉE EST SON NOM, PAS UN NUMÉRO DE LIGNE.** Les 420
> références `fichier:ligne` de ce document ont été retirées le
> 2026-07-30 : elles étaient **toutes fausses**, les fichiers ayant
> maigri d'un tiers. Une adresse fausse coûte plus cher que pas
> d'adresse. On retrouve une animation par son nom :
> `grep -n "@keyframes entree-bande" css/app.css`, ou par son sélecteur,
> donné dans la colonne « Élément ciblé ». Le nom et le sélecteur ne
> périment pas.

Relevé du code source, pas de la mémoire. Chaque durée est lue dans la
déclaration qui la porte. Quand une durée vient d'une variable, la
variable **et** sa valeur résolue sont données.

Périmètre dépouillé intégralement : `css/app.css`, `css/base.css`,
`css/secteurs.css`, `css/tour360.css`, `css/tokens.css`, `js/motion.js`,
`js/langue.js`, `js/main.js`, `js/trame.js`, `js/hero.js`,
`js/limaille.js`, `js/pointe.js`, `js/tour360.js`, `index.html`,
`404.html`.

`css/critique.css` et `css/differe.css` ne sont pas dépouillés : ils sont
**fabriqués** à partir d'`app.css` par `tools/css-critique.mjs`. Toute
règle citée ici existe dans l'un des deux, jamais ailleurs.

> **Huit entrées ont été retirées le 2026-07-30 : elles décrivaient la
> boucle de vie des huit plaques d'accueil et sa dérive au défilement.**
> Aucun de leurs sélecteurs n'existe plus dans le dépôt — `plaque-vie`,
> `--vie-x`, `--incl`, `--ecart`, `est-vivante` rendent tous 0
> occurrence. Le bloc entier est dans
> `archives/2026-07-30-plaques-accueil/`. Une entrée de catalogue qui
> décrit du code absent est pire qu'une entrée manquante : elle fait
> chercher.

---

## 0 · LES JETONS DE TEMPS ET DE COURBE

Source unique : `css/tokens.css`, .

| Variable | Valeur | Emploi déclaré |
|---|---|---|
| `--t-1` | **160 ms** | retour tactile |
| `--t-2` | **240 ms** | survol, état |
| `--t-3` | **380 ms** | entrée de bloc |
| `--t-4` | **520 ms** | modale, changement de thème |
| `--e-snap` | `cubic-bezier(0.2, 0, 0, 1)` | entrée sèche |
| `--e-drive` | `cubic-bezier(0.65, 0, 0.35, 1)` | échange |
| `--e-brake` | `cubic-bezier(0.33, 1, 0.68, 1)` | sortie |

Variables de temps déclarées ailleurs :

| Variable | Valeur | Où | Portée |
|---|---|---|---|
| `--cran` | **230 ms** | `app.css` | tous les `.btn` |
| `--cran` | **520 ms** | `app.css` | `[data-modal-open="modal-start"]`, `…="modal-refer"`, `…="modal-booking"`, `[data-modal-switch="modal-booking"]`, `.cadeau .btn` |
| `--cran` | **520 ms** | `app.css` | `.hero-cta .btn` (les deux CTA de l'accueil) |
| `--cran` | **0 ms** | `app.css` | `:root[data-palier="2"] .btn` |
| `--e` | 560 → 1470 | `index.html` | les onze pas de `compo-hero`, en ms, écrits en ligne |
| `--k` | 0 → 7 | `index.html` | distance au filet central, les quinze bandes du rideau |
| `--p` | 0 → 1 | posé par `langue.js` | position horizontale réelle d'une lettre dans son bouton |
| `--r` | 0 → 6 | posé par `main.js` | rang d'un caractère dans un odomètre |
| `--i` | 0 → n | posé par `langue.js` | index de lettre |
| `--n` | n | posé par `langue.js` | nombre de lettres du bouton |

---

## 1 · LE CATALOGUE

Numérotation continue `A1…A181`. Colonne « Verbe » : `—` quand
l'élément n'est pas soumis à la règle d'admission (état d'interface
neutre, retour tactile, jauge).

### 1.1 · Séquence d'entrée — CSS pur, `app.css` § 11b

Tout ce bloc exige `html.entree-on` : sans elle `.entree { display: none }` (`app.css`).

| # | Nom | Fichier:ligne | Fonction | Élément ciblé | Déclencheur | Durée | Condition / verrou | Verbe | Niveau |
|---|---|---|---|---|---|---|---|---|---|
| A1 | `entree-bande` | app.css | — | `.entree-bandes i` ×15 | chargement | 300 ms `--e-drive`, retard `700ms + var(--k) * 24ms` → 700 à 868 ms, `forwards` | `html.entree-on` ; mise en **pause** par `html.entree-attend` | V1 | N2 |
| A2 | `entree-bande` (saut) | app.css | — | `html.entree-saut .entree-bandes i` | clic / touche pendant la séquence | 160 ms, retard `var(--k)*6ms`, `!important` | `html.entree-saut` posée par `main.js` | V1 | N2 |
| A3 | `entree-filet-a` | app.css | — | `.entree-jauge` | chargement | 620 ms `linear` 0 ms `forwards` | jamais mise en pause — « ce qu'on s'est accordé joue toujours » | V3 | N1 |
| A4 | `entree-filet-b` | app.css | — | `.entree-jauge` | suite de A3 | 180 ms `linear` retard 620 ms | **mise en pause** par `entree-attend` (2ᵉ valeur de la liste `running, paused`, ) | V3 | N1 |
| A5 | `entree-filet-b` (saut) | app.css | — | `.entree-jauge` | saut | 120 ms `linear` 0 ms | `html.entree-saut` | V3 | N1 |
| A6 | `entree-repere` | app.css | — | `.entree-cadre i` ×4 | chargement | 240 ms `--e-snap`, retards **40 / 90 / 140 / 190 ms** | pause par `entree-attend` | V4 | N3 |
| A7 | `entree-efface` | app.css | — | `.entree-cadre` | chargement | 140 ms `linear` retard 640 ms | pause par `entree-attend` | — | N3 |
| A8 | `entree-remise` | app.css | — | `.entree-plaque` | chargement | 300 ms `--e-drive` retard 620 ms | pause par `entree-attend` ; cible réelle `--entree-dx/--entree-dy` posée par `main.js` **seulement si `performance.now < 600`** ; sinon repli `-60px` / `scale(0.78)` | V2 | N2 |
| A9 | `entree-efface` | app.css | — | `.entree-plaque` | chargement | 160 ms `linear` retard 800 ms | **tombe au palier 1** | — | N2 |
| A10 | `entree-pose` | app.css | — | `.entree-mark` (monogramme) | chargement | 320 ms `--e-snap` retard 60 ms, `clip-path` | jamais mise en pause | V1 | N2 |
| A11 | `entree-mot` | app.css | — | `.entree-mot` | chargement | 200 ms `--e-snap` retard 300 ms | — | — | N3 |
| A12 | `entree-mot` | app.css | — | `.entree-etat` | chargement | 200 ms `--e-snap` retard 260 ms | pause par `entree-attend` | — | N1 |
| A13 | `entree-efface` | app.css | — | `.entree-etat` | chargement | 140 ms `linear` retard **760 ms** | **tombe au palier 1** | — | N1 |
| A14 | `entree-cran-a` | app.css | — | `.entree-rouleau` | chargement | 620 ms **`steps(8)`** 0 ms → un cran toutes les 77,5 ms | — | V4 | N1 |
| A15 | `entree-cran-b` | app.css | — | `.entree-rouleau` | suite de A14 | 180 ms **`steps(2)`** retard 620 ms | **mise en pause** par `entree-attend` | V4 | N1 |
| A16 | `entree-mot` | app.css | — | `.entree-saut-mot` | chargement | 200 ms `linear` retard 760 ms | — | — | N3 |
| A17 | `entree-efface` (saut) | app.css | — | `.entree-etat`, `.entree-cadre`, `.entree-saut-mot` | saut | 100 ms `linear` `!important` | `html.entree-saut` | — | N3 |
| A18 | `entree-efface` (saut) | app.css | — | `.entree-plaque` | saut | 120 ms `linear` `!important` | `html.entree-saut` | — | N2 |
| A19 | `entree-part` | app.css | — | `html.entree-on .entree` | chargement, mouvement réduit | 1 ms **`step-end`** retard **520 ms** | `@media (prefers-reduced-motion: reduce)` — se joue **sans aucun script** | V4 | N1 |

### 1.2 · Composition du hero — CSS pur, `app.css` § 12b

Tout ce bloc exige `html.compo-hero` (posée par `main.js`, retirée
3 200 ms après la levée de l'attente, `main.js`) **et**
`@media (prefers-reduced-motion: no-preference)` (`app.css`).

| # | Nom | Fichier:ligne | Fonction | Élément ciblé | Déclencheur | Durée | Condition / verrou | Verbe | Niveau |
|---|---|---|---|---|---|---|---|---|---|
| A20 | `he-plaque` | app.css | — | `html.compo-hero .he::after` | chargement | 300 ms `--e-drive`, retard `var(--e) * 1ms` | `compo-hero` ; **pause** par `html.entree-attend .he::after` | V1 | N2 |
| A21 | `he-plaque` (libellés de fiche) | app.css | — | `html.compo-hero .hero-fiche a.he::after` | chargement | 300 ms, retard **`--e + 90 ms`** | **tombe au palier 1** | V1 | N2 |
| A22 | `he-filet` | app.css | — | `html.compo-hero .hero-fiche .fiche-rule` ×5 | chargement | 340 ms `--e-drive`, retard `--e`, `backwards` | `compo-hero` ; **pause** ; ces cinq filets sont **exclus** de `motion.js` | V3 | N2 |
| A23 | `he-souder` | app.css | — | **tombe au palier 1** | chargement | **820 ms** `linear`, retard `--e`, `backwards` — la trame tient jusqu'à 86 %, puis le trait ferme d'un coup | **tombe au palier 1** | V3 | N2 |
| A24 | `he-filet` + `he-souder` du pied | app.css | — | `html.compo-hero .fiche-foot .fiche-rule` | chargement | mêmes durées, retard **`--e + 300 ms` = 1 770 ms** → dernière soudure fermée à **2 590 ms** dans la page (2 701 ms depuis la navigation, relevé du 2026-07-29) | **tombe au palier 1** | V3 | N2 |
| A25 | `he-plaque` (saut) | app.css | — | `html.entree-saut .he::after` | saut | 140 ms, retard 0 | `entree-saut` | V1 | N2 |
| A26 | `he-filet`/`he-souder` (saut) | app.css | — | `html.entree-saut .hero-fiche .fiche-rule` | saut | 140 ms, 140 ms, retards 0, 0 | `entree-saut` | V3 | N2 |

### 1.3 · Boutons et micro-états — `app.css` § phase 8

| # | Nom | Fichier:ligne | Fonction | Élément ciblé | Déclencheur | Durée | Condition / verrou | Verbe | Niveau |
|---|---|---|---|---|---|---|---|---|---|
| A27 | `btn-load` | app.css | posée par `setLoading` `main.js` | `.btn.is-loading::after` | envoi de formulaire | 1,1 s `--e-drive` **`infinite`** | classe `.is-loading` ; `animation: none` sous mouvement réduit | — | N1 |
| A28 | `btn-load` | app.css | **tombe au palier 1** | `.btn-icon.is-loading::after` | envoi | 1,1 s `--e-drive` `infinite` | idem | — | N1 |
| A29 | `fleche-cran` | app.css | — | `.btn[data-lettres]:hover .icon`, `:focus-visible .icon` | survol / focus | **300 ms** `--e-snap`, retard **`var(--cran)`** (230 ou 520 ms) | exige `[data-lettres]`, donc exige que `langue.js` ait découpé le bouton ; `animation: none` aux paliers **1 et 2** (5436-5439) et sous mouvement réduit | V4 | N3 |
| A30 | aplat de balayage | app.css | — | `.btn[data-lettres]::before` | survol / focus | `transform var(--cran) linear` — 230 ou 520 ms | **exige `[data-lettres]`** ; `--cran: 0ms` au palier 2 → bascule d'un bloc | V1 | N2 |
| A31 | bascule de la lettre | app.css, 4857 | — | `.btn .l`, `.btn-icon .l` | survol / focus | **`color 0 s`** avec retard `calc(var(--p) * var(--cran))` — la couleur ne fond jamais | exige `--p`, posé par `langue.js` ; retard remis à 0 sous mouvement réduit | V4 | N2 |
| A32 | presse au clic | app.css | — | `.btn:active .l` | appui | `transform` **90 ms**, retard 0 — `scaleX(0.9)` | — | V4 | N3 |
| A33 | bascule de l'icône | app.css, 4846 | — | `.btn .icon` | survol / focus | `color 0 s`, retard `var(--p) * var(--cran)` | idem A31 | V4 | N3 |
| A34 | filet de trace | app.css | — | `.btn::after` | survol / focus | `background-size` **`--t-2` = 240 ms** `--e-snap` | aucun — pur CSS, marche sans script | V3 | N2 |
| A35 | états du bouton | app.css | — | `.btn` | survol / focus / appui | `background-color`, `border-color`, `color` en 240 ms ; `transform` en **160 ms** | — | — | N3 |
| A36 | états du bouton-icône | app.css | — | `.btn-icon` | survol / appui | 160 ms `--e-snap` ×3 | — | — | N3 |
| A37 | bourgeon en deux crans | app.css + 5299 | — | `.burger i` | clic | `transform` + `width` **160 ms** `--e-snap` | `aria-expanded` posé par `main.js/1110` | V4 | N1 |
| A38 | lien d'évitement | base.css | — | `.skip-link` | focus clavier | `transform` **240 ms** `--e-snap` | — | — | N1 |
| A39 | odomètre | app.css, 5011 | pilotée par `rouleUn` `main.js` | `.odo-c b`, `.odo-c.is-roule b` | changement de valeur | **300 ms** `--e-snap`, retard `var(--r) * 34ms` (r plafonné à 6) | **jamais sacrifié** — vit dans `main.js` ; sous mouvement réduit `rouler` écrit le texte d'un coup (`main.js`) | V4 | N1 |
| A40 | cran du seuil | app.css | pilotée par `setCurrent` `main.js` | `.seuil[data-cran="fait"] .seuil-roul` | section devenue courante | **320 ms** `--e-snap` | **jamais sacrifié, à aucun palier** ; au repos `translateY(-1em)` → le numéro est déjà juste sans script | V4 | N1 |
| A41 | curseur du rail | app.css | pilotée par `setCurrent` `main.js` | `.rail-curseur` | changement de section | `transform` **320 ms** `--e-drive`, `height` 320 ms, `opacity` 240 ms | `transition: none` sous mouvement réduit | V2 | N1 |
| A42 | entrée d'index | app.css | — | `.rail-list a` | survol / `aria-current` | 240 ms ×2 | — | — | N1 |

### 1.4 · Soudures, filets, validation

| # | Nom | Fichier:ligne | Fonction | Élément ciblé | Déclencheur | Durée | Condition / verrou | Verbe | Niveau |
|---|---|---|---|---|---|---|---|---|---|
| A43 | filet de section | app.css | classe posée par `motion.js` (`is-set`) et `main.js` (`is-current`) | `.section-rule` | scroll | `background-image` **`--t-3` = 380 ms** `--e-snap` | `is-set` exige GSAP (vague 2) ; `is-current` non | V3 | N1+N2 |
| A44 | soudure longue | app.css | classe posée par `langue.js`, retirée à **860 ms** | `.seuil-soudure-longue .seuil-filet` | franchissement du seuil 09, à 96 % | `background-image` **860 ms** `--e-snap` | GSAP + palier < 2 | V3 | N2 |
| A45 | soudure de liste | app.css | classes posées par `langue.js`, retirées à **+420 ms** | `[data-souder] > *::before` (5 `dl.project-facts`) | scroll, `top 86%` | `background-size` **380 ms** `--e-snap`, décalage `i * 55 ms` | tombe au **palier 2** (`langue.js` + `app.css`) | V3 | N2 |
| A46 | `soudure-etat` | app.css | déclenchée par `say` `main.js` | `.form-status.is-ok::after`, `.is-err::after` | réponse d'envoi | **`--t-3` = 380 ms** `--e-snap` `both` | `animation: none` sous mouvement réduit | V3 | N1 |
| A47 | validation de champ | app.css | `markField` `main.js` ; `is-valid` retirée à **2 400 ms** | `.field.is-valid input/select/textarea` | soumission | `border-color` **240 ms** | **jamais sacrifié** ; `is-valid` n'est posée que sur un champ qui **sort** de l'erreur | V3 | N1 |
| A48 | question dépliée | app.css | — | `.faq-item::before` | `<details open>` natif | `transform` **240 ms** `--e-snap` | CSS pur, survit à tout | V3 | N1 |

### 1.5 · Cadeau (`<dialog>` natif) — CSS pur, `app.css` § 11c

| # | Nom | Fichier:ligne | Fonction | Élément ciblé | Déclencheur | Durée | Condition / verrou | Verbe | Niveau |
|---|---|---|---|---|---|---|---|---|---|
| A49 | `cadeau-degage` | app.css | `showModal` `main.js` | `.cadeau[open]` | ouverture du popup | **300 ms** `--e-snap` `both` | ⚠ le nom est **redéfini** : c'est la seconde définition qui s'applique (voir § 5) | V1 | N2 |
| A50 | `cadeau-voile` | app.css | — | `.cadeau[open]::backdrop` | ouverture | **180 ms** `linear` `both` | `animation: none` sous mouvement réduit | — | N2 |
| A51 | `cadeau-recoupe` | app.css | `fermer` `main.js` | `.cadeau.se-retire` | fermeture | **220 ms** `--e-drive` `both` ; `close` appelé 220 ms après | classe non posée sous mouvement réduit (`main.js`) | V1 | N2 |
| A52 | `cadeau-voile` inverse | app.css | **tombe au palier 1** | `.cadeau.se-retire::backdrop` | fermeture | **200 ms** `linear` `reverse both` | **tombe au palier 1** | — | N2 |
| A53 | `cadeau-aligne-g` | app.css | — | `.cadeau-couv--1` | ouverture | **420 ms** `--e-drive` retard **120 ms**, `both` (−22 px → 0) | mouvement réduit : `none` | V2 | N2 |
| A54 | `cadeau-aligne-d` | app.css | — | `.cadeau-couv--2` | ouverture | **420 ms** `--e-drive` retard **200 ms** (+22 px → 0) | **tombe au palier 1** | V2 | N2 |
| A55 | `cadeau-soude` | app.css | — | `.cadeau-fiche` | ouverture | **460 ms** `--e-drive` retard **260 ms** `forwards` | mouvement réduit : `none` + filet plein | V3 | N2 |
| A56 | `cadeau-degage` (2ᵉ définition) | app.css | — | `.cadeau[open] .cadeau-in` | ouverture | **`--t-3` = 380 ms** `--e-snap` `both` — `clip-path` **+ `translateY(-8px)`** | tombe au **palier 2** ; `none` sous mouvement réduit | V1 | N2 |

### 1.6 · Menu, modales, formulaires

| # | Nom | Fichier:ligne | Fonction | Élément ciblé | Déclencheur | Durée | Condition / verrou | Verbe | Niveau |
|---|---|---|---|---|---|---|---|---|---|
| A57 | menu plein écran | app.css, 842 | `openMenu`/`closeMenu` `main.js/1107` | `.menu` | clic sur le bourgeon | `opacity` **380 ms** `--e-snap` ; `visibility 0 s linear 380 ms` ; `hidden` posé à **380 ms** (`main.js`, 0 ms sous mouvement réduit) | — | V1 | N1 |
| A58 | filet minium du menu | app.css | — | `.menu-list a::before` | survol / focus | `transform` **240 ms** `--e-snap` | — | V3 | N3 |
| A59 | voile de modale | app.css | `openModal` `main.js` | `.modal-scrim` | clic sur un déclencheur | `opacity` **380 ms** `--e-snap` | — | — | N1 |
| A60 | panneau de modale | app.css | **tombe au palier 1** | `.modal-panel` | **tombe au palier 1** | `opacity` + `transform` **380 ms** `--e-snap` (translateY 1,5 rem) | c'est le **repli** quand `langue.js` n'est pas là (A150) | V1 | N1 |
| A61 | jauge de questionnaire | app.css | `resetEstimate`/`resetProject` | `.progress i` | changement d'étape | `width` **380 ms** `--e-drive` | **jamais sacrifié** | — | N1 |
| A62 | option de questionnaire | app.css | — | `.options button` | survol | `color` 160 ms, `padding-left` 240 ms | — | — | N3 |
| A63 | champ de saisie | app.css | — | `.field input/select/textarea` | focus | `border-color` **160 ms** | — | — | N1 |
| A64 | poignée de curseur | app.css | — | `input[type="range"]::-webkit-slider-thumb` | survol / glissement | `background-color` + `transform` **160 ms** | — | — | N3 |
| A65 | jour et créneau | app.css, 1203 | — | `.cal-day`, `.slot` | survol | **160 ms** ×2 | — | — | N3 |
| A66 | dépôt de fichier | app.css, 1003 | — | `.field .opt`, zone de dépôt | survol / focus | **160 ms** ×2 | — | — | N3 |
| A67 | jauge de ROI | app.css | `roiUpdate` `main.js` | `.roi-bar i` | curseur du calculateur | `width` **380 ms** `--e-drive` | **jamais sacrifié** | — | N1 |
| A68 | chevron « ajuster » | app.css | — | `.roi-details > summary .icon` | `<details>` natif | `transform` **240 ms** (rotate 45°) | — | V4 | N3 |
| A69 | chevron de FAQ | app.css | — | `.faq-item summary .icon` | `<details>` natif | `transform` **240 ms** (rotate 45°) | — | V4 | N3 |

### 1.7 · Section 02 · la piste collante — RÉÉCRITE le 2026-07-30

Les sept animations infinies des écrans d'interface (`ecr-scan`,
`ecr-ligne`, `ecr-zone`, `ecr-broche`, `ecr-barre`, `ecr-trow`, et le
câblage `ecr-jeton` déjà retiré le matin) **n'existent plus** : les
quatre maquettes construites sont parties avec le rail d'images.

Ce qui les remplace tient en **trois mouvements**, et deux d'entre eux
sont pilotés par une seule écriture de `transform` par image.

| # | Nom | Fichier:ligne | Élément | Déclencheur | Durée / loi | Condition | Verbe | Niveau |
|---|---|---|---|---|---|---|---|---|
| **A70** | **la piste** | `main.js` `image` **686** | `.svc-planche[data-svc-rail]` | position de défilement de la page, lue en direct par `getBoundingClientRect` | **aucune durée** — c'est une fonction pure de la position. `s = i + smoothstep((f − 0,18) / 0,64)` sur `n − 1 = 3` segments | `html.js` + `≥ 48em` + `prefers-reduced-motion: no-preference`. **Ne tombe à aucun palier** | **V2** (le déplacement) arrêté d'un **V4** (le cran de 18 % à chaque bout de segment) | **N1** |
| **A71** | **la jauge** | `main.js` `image` **686** | `.svc-jauge > b[data-svc-jauge]` | idem | `scaleX(s / 3)`, jamais `width` | idem | — | **N1** |
| **A72** | `svc-degage-nom` | `app.css` kf **3010** | `.svc-plan[data-vu] .svc-plan-nom::after` | `marquer` pose `data-vu`, une seule fois par chantier | **420 ms** `--e-drive` `forwards` | **`.svc-planche[data-degage]`**, posé par `marquer` — le voile ne peut pas exister sans son retrait (règle 0bis) | **V1** | N2 |

> **`--svc-pas` = `min(46vh, 430px)`** — la distance de défilement qui
> fait passer d'un chantier au suivant. C'est le **seul** nombre à
> tourner si la section paraît trop longue : la course vaut
> `(n − 1) × --svc-pas`, et tout le reste en découle.

> **LE CRAN VAUT 0,18, ET C'EST MESURÉ.** À 0,30 le rail passe plus de
> temps arrêté qu'en mouvement et le mouvement devient un sursaut ; à
> 0,08 la part morte dure 34 ms sur un pas de 430 px, soit deux images
> — donc rien qu'on puisse percevoir comme un arrêt. 0,18 donne environ
> 155 px de défilement immobile de chaque côté d'un chantier.

**Le panneau de détail** garde ses deux animations : `svc-degage` (`app.css` kf, 420 ms + 90 ms de retard, V1 · DÉGAGER sens bas) et sa
réciproque exacte à la fermeture (260 ms, `reverse`). Les deux tombent
au **palier 2** avec les autres dégagements de modale.

### 1.8 · Projets, secteurs, contact, pied

| # | Nom | Fichier:ligne | Fonction | Élément ciblé | Déclencheur | Durée | Condition / verrou | Verbe | Niveau |
|---|---|---|---|---|---|---|---|---|---|
| ~~A77~~ | ~~`shot-bat`~~ | **SUPPRIMÉE le 2026-07-30** avec les cinq cadres de projet (`main.js` 139 lignes, `motion.js` bloc 7, `langue.js` bloc 6). Archivé dans `archives/2026-07-30-projets-images/`. | — | — | — | — | — | — |
| **A78** | **le cran avant / après** | `app.css` **3330** | — | `.ba-cran label` | clic ou flèche du clavier sur un `input[type=radio]` | `background-color` + `color` **260 ms `step-end`** | **aucune** — CSS pur, fonctionne sans JavaScript (bloc `<noscript>` du `<head>`) | **V4** | **N1** |
| **A79** | **le passage de trame** | `main.js` `avantApres` **1079** | `APED_TRAME.degager` | `.ba-vue--avant` ou `.ba-vue--apres` | `change` sur le cran | **520 ms**, `vie: 240`, `maille: 44`, sens **droite**, graine fixe par carte et par sens | tombe sous mouvement réduit **et** au palier 2 ; le cran reste | **V1** dont l'arête est faite de **V3** | N2 |
| **A79b** | **`v11-defile`** | `app.css` kf **3712** | — | `.ba-vue--avant .v11-defile span` | permanente | **21 s** `linear` `infinite`, retard **−7 s** | s'arrête **trois fois** : vue non choisie (`animation-play-state: paused !important`), mouvement réduit, paliers 1 **et** 2 | — | N3 |
| A80 | maquette de secteur | app.css | `showSector` `main.js` | `.mock` | survol / focus d'une pastille, ou minuteur tactile | `opacity` **240 ms** `--e-snap` | `content-visibility: hidden` + `opacity: 0` au repos → les 13 animations de `secteurs.css` **ne tournent pas** hors `.is-on` | V4 | N2 |
| A81 | pastille de secteur | app.css | — | `.sector-pills button` | survol / focus | **160 ms** ×3 | l'inversion a été **retirée** après mesure (5204-5217) | V4 | N1 |
| A82 | cellule de contact | app.css | — | `.cell` | survol | `background-color` **240 ms** | — | — | N3 |
| A83 | flèche de cellule | app.css | — | `.cell-go` | survol | `transform` + `color` **240 ms** | — | V4 | N3 |
| A84 | filet de cellule | app.css | — | `.cell::after` | survol / focus | `background-size` **240 ms** | — | V3 | N2 |
| A85 | soulignement de lien | app.css | — | `.footer-nav a::after`, `.menu-foot a::after` | survol / focus | `transform` **240 ms** ; `transform-origin` bascule droite → gauche | — | V3 | N3 |
| A86 | soulignement de nav | app.css | — | `.nav-links a::after` | survol / focus | hérite de `--t-2` via `app.css` | — | V3 | N3 |
| A87 | liens de texte | app.css, 4094, 4137, 4150, 3888 | — | `.footer-docs a`, `.contact-direct a`, `.footer-mail`, `.footer-nav a`, `.faq-mail` | survol | `color` (+ `border-color`) **240 ms** | — | — | N3 |
| A88 | rangée de fiche du hero | app.css | — | `.hero-fiche a` | survol | `padding-left` + `color` **240 ms** | — | V4 | N3 |
| A89 | préréglage de calculateur | app.css | — | `.roi-presets button` | survol / `aria-pressed` | **160 ms** ×3 | — | V4 | N1 |
| A90 | résumé de « ajuster » | app.css | — | `.roi-details > summary` | survol | `color` **160 ms** | — | — | N3 |
| A91 | bascule de thème (icône) | app.css | — | `.theme-toggle .icon` | survol | `transform` **240 ms** `--e-drive` — soleil −2 px, lune +2 px | — | V4 | N3 |
| A92 | réticule de la pointe | app.css | `pointe.js` | `.pointe i` | déplacement du pointeur | `width` / `height` / `opacity` **160 ms** | `display: none` sous `pointer: coarse` **et** sous mouvement réduit | V4 | N3 |
| A93 | étiquette de la pointe | app.css | `langue.js` | `.pointe-mot` | entrée dans une zone | `opacity` **160 ms** — le **`transform` n'a pas de transition**, il suit le pointeur image par image | `display: none` aux paliers **1 et 2** ; exige `pointer: fine` **et** palier 0 (`langue.js`) | V4 | N3 |
| A94 | attirance des cibles | app.css | `poserAimant` `pointe.js` | `.btn`, `.btn-icon`, `.cell`, `.sector-pills button`, `.rail-list a`, `.nav-links a` | pointeur proche | `transform` **240 ms** `--e-snap`, amplitude **16 %** de l'écart × (1−d) | `pointe.js` s'arrête au premier `touchstart` | V2 | N3 |
| A95 | bascule de thème (page) | base.css | `applyTheme` `main.js` ; classe retirée à **560 ms** | `html.theme-shifting *:not(svg)` | clic sur la bascule, ou changement système | `background-color`, `border-color`, `color`, `fill` **`--t-4` = 520 ms** `--e-drive` | classe `theme-shifting` ; s'applique à **tout le document** | V4 | N1 |

### 1.9 · `404.html` — la ligne déraillée

| # | Nom | Fichier:ligne | Élément ciblé | Déclencheur | Durée | Condition | Verbe | Niveau |
|---|---|---|---|---|---|---|---|---|
| A96 | éjection de la ligne | app.css | `html.js.derail-go .derail-row--lost` | classe `derail-go` | `transform` **`--t-4` = 520 ms** `--e-drive`, retard **220 ms** | exige `html.js` **et** `html.derail-go` | V2 | N2 |
| A97 | barre de rature | app.css | `html.js.derail-go .derail-strike` | **tombe au palier 1** | `transform` **380 ms** `--e-drive`, retard **420 ms** | idem ; `scaleX(1)` d'emblée sans JS | V3 | N2 |
| A98 | index qui apparaît | app.css | `html.js.derail-go .derail-row:not(--lost)` | **tombe au palier 1** | `opacity` **380 ms** `--e-snap`, retard **`var(--i) * 45ms`** | **tombe au palier 1** | — | N2 |
| A99 | ligne d'index | app.css, 4268 | `.derail-row a`, `.derail-row a::after` | survol | `padding-left` / `transform` **240 ms** | — | V3 | N3 |

### 1.10 · `css/secteurs.css` — les treize maquettes

Feuille **injectée par JavaScript** (`index.html`). Toutes ces
animations sont `infinite` et ne tournent que sur `.mock.is-on` ;
toutes sont coupées par `animation: none !important` sous mouvement
réduit (`secteurs.css`).

| # | Nom | Fichier:ligne | Élément ciblé | Durée | Verbe | Niveau |
|---|---|---|---|---|---|---|
| A100 | `sec-sel` | secteurs.css | `.sec-sel` | **4 s** **`steps(1)`** `infinite` | V4 | N3 |
| A101 | `sec-ajout` | secteurs.css | `.sec-ajout` | **3,6 s** `--e-brake` `infinite` | V4 | N3 |
| A102 | `sec-curseur` | secteurs.css | `.sec-curseur` | **4,4 s** `--e-brake` `infinite` | V4 | N3 |
| A103 | `sec-jauge` | secteurs.css | `.sec-caprow > i::after` | **3,6 s** `--e-brake` `infinite`, retards **0,14 / 0,28 s** | — | N3 |
| A104 | `sec-plage` | secteurs.css | `.sec-plage` | **3,8 s** `--e-brake` `infinite` | V2 | N3 |
| A105 | `sec-accolade` | secteurs.css | `.sec-accolade` | **3,6 s** `--e-brake` `infinite` | V3 | N3 |
| A106 | `sec-jourj` | secteurs.css | `.sec-jour-j` | **5,6 s** `linear` `infinite` | — | N3 |
| A107 | `sec-passe` | secteurs.css | `.sec-passe i` ×18 | **4,6 s** `--e-brake` `infinite`, retards **0 à 1,70 s** par pas de 0,10 | V2 | N3 |
| A108 | `sec-conf` | secteurs.css | `.sec-conf` | **4 s** `--e-brake` `infinite` | V1 | N3 |
| A109 | `sec-pano` | secteurs.css | `.sec-visu > i` | **9 s** `ease-in-out` `infinite alternate` | — | N3 |
| A110 | `sec-tampon` | secteurs.css | `.sec-tampon` | **3,8 s** `--e-brake` `infinite` | V4 | N3 |
| A111 | `sec-pile` | secteurs.css | `.sec-pile` | **6,6 s** `--e-drive` `infinite` | V4 | N3 |
| A112 | `sec-grain` | secteurs.css | `.sec-lim i` | **5,4 s** `--e-brake` `infinite`, retards **0,09 / 0,18 / 0,27 s** | V2 | N2 |

### 1.11 · `css/tour360.css`

Feuille **injectée par JavaScript**. Trois transitions, toutes coupées
sous mouvement réduit (`tour360.css`).

| # | Nom | Fichier:ligne | Élément ciblé | Déclencheur | Durée | Verbe | Niveau |
|---|---|---|---|---|---|---|---|
| A113 | point de passage | tour360.css | `.pnlm-hotspot.tour-hs` | survol | `background-color`, `border-color` **160 ms** | — | N3 |
| A114 | commande de visite | tour360.css | `.tour-ctl` | survol / appui | **160 ms** ×3 | — | N3 |
| A115 | pièce du plan | tour360.css | `.tour-map-room` | survol / `aria-current` | `background-color`, `color` **160 ms** | V4 | N1 |

### 1.12 · `js/motion.js` — la chorégraphie au défilement (vague 2)

Le fichier **entier** rend la main si GSAP est absent **ou**
sous `prefers-reduced-motion` (il pose alors `html.reduced-motion`).

| # | Nom | Fichier:ligne | Fonction | Élément ciblé | Déclencheur | Durée | Condition / verrou | Verbe | Niveau |
|---|---|---|---|---|---|---|---|---|---|
| A116 | plaque du hero au défilement | motion.js | IIFE | `#heroPlate` | scroll, `top top` → `bottom top` | **scrub 0,6**, `y: 0 → −34` | exige `(min-width: 48em)` | V2 | N3 |
| A117 | filets de section | motion.js | boucle `[data-section-rule]` (23 cibles, moins les 5 `.fiche-rule`) | `[data-section-rule]` | scroll, **`top 97%`** si dans un `[data-seuil]`, sinon **`top 88%`** | **0,72 s** `power2.inOut`, `scaleX 0 → 1`, `once` | `immediateRender: false` ; les `.fiche-rule` sont exclues | V3 | N1+N2 |
| A118 | ressoudure | motion.js | `onEnter` | `.section-rule` → `.is-set` | **760 ms** après A117 | pose la classe qui déclenche A43 (380 ms) | **tombe au palier 1** | V3 | N2 |
| A119 | montée des blocs | motion.js | boucle `.rise` | parents de `.rise` — **une seule cible réelle : `.tour.rise`** (`index.html`) ; `.hero-cta.rise` est exclue | scroll, `top 86%` | **0,58 s** `power3.out`, décalage **0,07 s**, `y 28 → 0`, `opacity 0.1 → 1` | `immediateRender: false` | V2 | N2 |
| A120 | compteurs | motion.js | boucle `[data-count]` | `[data-count]` | scroll, `top 90%` | **1,1 s** `power2.out` | **aucune cible dans `index.html`** — code sans emploi | V4 | N2 |
| ~~A121~~ | ~~rail des services~~ | **SUPPRIMÉE le 2026-07-30** avec `motion.js` bloc 6. Le pin s'armait 284 px trop tôt à chaque arrivée par ancre et la scène se téléportait de 280 px en une image ; le bouton « suivant » visait au-delà de `st.end` et éjectait le visiteur. `CHANTIER-SERVICES.md § 1`. | — | — | — | — | — | — |
| ~~A122~~ | ~~jauge du rail~~ | **SUPPRIMÉE le 2026-07-30** — plus de rail, donc plus de jauge à synchroniser. | — | — | — | — | — | — |
| **A121b** | entrée des quatre chantiers | `langue.js` | tween unique | `.svc-carte` ×4 | scroll, `top 84%`, **`once`** | **0,56 s** `power3.out`, `x −26 → 0` (pas de 4 px par carte), `opacity 0.08 → 1`, **stagger 0,09 s** | `immediateRender: false` (règle 0bis) ; **tombe au palier 2** | **V2** | N2 |
| **A121c** | recomposition à l'ouverture d'une fiche | `langue.js` | FLIP maison | les **quatre** `.svc-carte` | `click` sur un `<summary>`, mesure avant / 1 rAF / mesure après | **0,46 s** `power3.out`, `x` **et** `y`, `clearProps` à la fin | **tombe au palier 2** — la grille se recompose alors d'un coup, comme le ferait le navigateur seul | **V2** | N2 |
| **A121d** | dégagement du détail | `langue.js` | `APED_TRAME` | `.svc-detail-in` | ouverture d'une fiche | **320 ms** + vie 160, maille 36, sens **bas**, graine 421 | **palier 0 seulement** ; V1 dont l'arête est faite de la matière de V3 | **V1** | N2 |
| A123 | dégagement de capture | motion.js | boucle `.shot` (5) | `.shot` | scroll, `top 82%`, `once` | **0,38 s** `power2.out`, `clipPath inset(0 0 100% 0) → 0` | — | V1 | N2 |
| A124 | fil du parcours | motion.js | boucle `.parc-etape` (4) | `.parc-fil b` | scroll, `top 72%` → `bottom 62%` | **scrub 0,5**, `scaleY 0 → 1` | repos = fil plein | V3 | N1 |
| A125 | branche d'étape | motion.js | **tombe au palier 1** | `.parc-branche` | scroll, `top 74%`, `once` | **0,34 s** `power3.out`, `scaleX 0 → 1` | — | V3 | N2 |
| A126 | lignes de fiche d'appel | motion.js | boucle `.parc-vis` (4) | `.vis-l i` | scroll, `top 68%`, `once` | **0,34 s** `power2.out`, décalage **0,11 s** | — | V3 | N2 |
| A127 | maquette qui s'assemble | motion.js | **tombe au palier 1** | `.vis-grille i` | idem, dans la même timeline | **0,42 s** `power3.out`, décalage **0,05 s**, `x ±22`, `opacity 0.12 → 1` | — | V2 | N2 |
| A128 | code qui se pose | motion.js | **tombe au palier 1** | `.vis-code p` | **tombe au palier 1** | **0,26 s** `power2.out`, décalage **0,09 s** | — | V2 | N2 |
| A129 | sortie du chantier | motion.js | **tombe au palier 1** | `.vis-sortie` | idem, `−0,08 s` | **0,3 s** `power2.out` | — | — | N2 |
| A130 | mise en ligne | motion.js | **tombe au palier 1** | `.vis-live` | idem, `−0,12 s` | **0,28 s** `power4.out`, `scale 0.7 → 1` | — | V4 | N2 |
| A131 | piste du comparatif | motion.js | boucle `.vs-row` (6) | `[data-bar="manual"]` puis `[data-bar="auto"]` | scroll, `top 90%`, `once` | **0,52 s** `power2.out`, puis **0,42 s** `power3.out` à `−0,18 s` | — | V3 | N2 |
| A132 | schéma de l'écart | motion.js | `[data-ecart]` | `.ecart-barre` ×2, `.ecart-pont`, `.ecart-pont b` | scroll, `top 82%`, `once` | **0,62 s** décalage **0,16 s** ; pont **0,46 s** à `−0,12` ; libellé **0,28 s** à `−0,10` | — | V3 | N2 |
| A133 | titres de section | motion.js | `couperEnLignes` | `.head h2` (9) → boîtes `.ligne` | scroll, **`top bottom`**, `once` | **0,3 s** `power2.out`, retard **`i × 0,06 s`**, `clipPath inset(0 100% 0 0) → 0` | découpage **paresseux**, un titre à la fois ; balaie **de gauche à droite** | V1 | N2 |
| A134 | blocs qui se reprennent | motion.js | boucle `[data-settle]` | `[data-settle] > *` | scroll, `top 84%`, `once` | **0,54 s** `power3.out`, retard `i × 0,07 s`, `x ±26` | **aucune cible dans `index.html`** — code sans emploi | V2 | N2 |
| A135 | preuves de l'agence | motion.js | boucle `.agc-eng` (4) | `.pr-l i` · `.pr-egal` · `.pr-case s` · `.pr-ligne--suite` · `.pr-r b` · `.pr-sem i` | scroll, `top 78%`, `once` | **0,5 s** · **0,26 s** `power4.out` à `−0,08` · **0,2 s** décalage 0,12 · **0,26 s** · **0,24 s** décalage 0,1 · **0,28 s** décalage 0,07 | — | V3 + V2 | N2 |
| A136 | filet du programme de référence | motion.js | — | `.referral-line b` | scroll, `top 82%` → `bottom 62%` | **scrub 0,5**, `scaleX 0 → 1` | — | V3 | N2 |
| A137 | preuves de référence | motion.js | boucle `.ref-preuve` (3) | `.rp-bulle` · `.rp-signature path` · `.rp-avis` · `.rp-etat` | scroll, `top 84%`, `once` | **0,34 s** `power3.out` · **0,72 s** `power2.inOut` (`strokeDashoffset 220 → 0`) · **0,26 s** décalage 0,1 · **0,24 s** à `−0,06` | seul tracé SVG du site, assumé | V2 + V3 | N2 |
| A138 | filet « ce qui arrive après » | motion.js | — | `.suite-fil b` | scroll, `top 84%` → `bottom 66%` | **scrub 0,5**, `scaleX 0 → 1` | — | V3 | N2 |
| A139 | recalcul | motion.js | — | tous les ScrollTrigger | `window load` + `document.fonts.ready` | — | — | — | — |

### 1.13 · `js/langue.js` — les quatre verbes (vague 2)

Le fichier **entier** rend la main si GSAP est absent **ou** sous
`prefers-reduced-motion`. Il pose `data-palier` sur `<html>`.

| # | Nom | Fichier:ligne | Fonction | Élément ciblé | Déclencheur | Durée | Condition / verrou | Verbe | Niveau |
|---|---|---|---|---|---|---|---|---|---|
| A140 | G3 · nom du seuil | langue.js | `frontieres` | `.seuil-nom` (13) | `IntersectionObserver`, **94 %** | **0,3 s** `power2.out`, `clipPath` gauche→droite | G3 est écrit **avant** le `return` du palier 2, mais son observateur est poussé dans `jetables` par `auFranchissement` : l'escalade au palier 2 le **tue** pour toute frontière pas encore franchie (`monterAuPalier`, ) | V1 | N2 |
| A141 | G4 · volet, avec trame | langue.js | **tombe au palier 1** | `.seuil[data-verbe="volet"]` — **02, 05, 06, pied** | `IntersectionObserver`, **92 %** | **420 ms**, vie de tuile **190 ms**, maille `clamp(28, h/4.5, 64)` | exige **palier 0** et `window.APED_TRAME` | V1+V3 | N2 |
| A142 | G4 · volet, sans trame | langue.js | **tombe au palier 1** | idem | ScrollTrigger `top 92%`, `once` | **0,44 s** `power3.out`, `clipPath` selon `data-sens` | palier **1** (repli d'arête de règle) | V1 | N2 |
| A143 | G4 · dégager, avec trame | langue.js | **tombe au palier 1** | cible `data-cible` — **03** (`.shot`), **11** (`.faq-item`), **12** (`.cell`) | `IntersectionObserver`, **90 %** | **440 ms**, vie **200 ms** | palier 0 + `APED_TRAME` | V1+V3 | N2 |
| A144 | G4 · dégager, sans trame | langue.js | **tombe au palier 1** | idem | ScrollTrigger `top 90%`, `once` | **0,46 s** `power3.out` | palier 1 | V1 | N2 |
| A145 | G4 · aligner | langue.js | **tombe au palier 1** | `data-cible` — **04** (`.sector-group`), **07** (`.vs-row`), **08** (`.parc-etape`) | `IntersectionObserver`, **88 %** | **0,42 s** `power2.out`, décalage **0,05 s**, `x ±26 → 0`, `clearProps` | paliers 0 et 1 ; tombe au palier 2 | V2 | N2 |
| A146 | G4 · souder long | langue.js | **tombe au palier 1** | `.seuil-filet` du seuil **09** | `IntersectionObserver`, **96 %** | classe `en-soudure-longue` posée puis retirée à **860 ms** → déclenche A44 | paliers 0 et 1 | V3 | N2 |
| A147 | G4 · cran | langue.js | **tombe au palier 1** | `.referral-max .num` — seuil **10** | `IntersectionObserver`, **74 %** | `APED_ROULER(num, "500 $")` puis, **2 images** plus tard, la valeur lue dans le document | exige `window.APED_ROULER` (`main.js`) | V4 | N2 |
| A148 | découpage des lettres | langue.js `decouper` | file `requestIdleCallback` | tous les `.btn` | temps morts, ou `pointerenter` / `focusin` en secours | — | **pose `data-lettres`, `--i`, `--n`, `--p`** → sans ce découpage, A29, A30, A31, A33 n'existent pas | V4 | N2 |
| A149 | repositionnement | langue.js | `positionner` | `.btn[data-lettres]` | `resize`, anti-rebond **220 ms** | — | — | — | — |
| A150 | encrage des chapôs | langue.js | `decouperMots` | `.head p` → `.mot-encre` | scroll, **`top 92%`**, `once` | **0,34 s** `power1.out`, décalage `min(0.05, 0.62 / n)`, `opacity 0.34 → 1`, `clearProps` | **exige palier 0** ( et 886) ; départ posé **sur tous les mots à la fois**, jamais scrubbé | V1 | N3 |
| A151 | `[data-degage]` | langue.js | — | `.footer-mega` (**seule cible**, `index.html`, `data-degage="haut"`) | scroll, `top 86%`, `once` | **0,46 s** `power3.out` | `immediateRender: false` | V1 | N2 |
| A152 | sous-titres | langue.js | — | `.project-meta h3`, `.cell h3`, `.sector-group h3`, `.parc-txt h3`, `.agc-txt h3` | scroll, `top 90%`, `once` | **0,26 s** `power2.out`, `clipPath` gauche→droite | **exige palier 0** | V1 | N3 |
| A153 | soudure des listes | langue.js | — | `[data-souder] > *` (5 `dl`) | scroll, `top 86%`, `once` | classes posées à `i × 55 ms`, retirées **420 ms** plus tard → déclenche A45 | tombe au **palier 2** | V3 | N2 |
| A154 | recomposition des secteurs | langue.js | `recomposer` | 10 premiers enfants de `.sec-page` | `aped:secteur` (`main.js`) ou première entrée de `#sectorPreview` à `top 88%` | **0,44 s** `power3.out`, décalage **0,035 s**, `clearProps: transform,opacity` | tombe au **palier 2** ; départ « pile » (11 px / −7 px, borné à 5) sur changement de métier, départ « filets » (amplitude 0,5) à la première entrée | V2 | N2 |
| A155 | parallaxe de la vitrine | langue.js | `gsap.quickTo` | `#mockStage` | `pointermove` sur `#sectorPreview` | **0,5 s** `power3.out`, amplitude **±7 px** en x, **±4 px** en y | exige `pointer: fine` **et palier 0** | V2 | N3 |
| A156 | vitesses différenciées | langue.js | — | `.project-meta` (5) | scroll, `top bottom` → `bottom top` | **scrub 0,8**, `y 22 → −22` | **exige palier 0** ; `will-change` posé à ≥64em (`app.css`) | V2 | N3 |
| A157 | FLIP de la FAQ | langue.js | `faq` | `.faq-item` suivants | clic sur un `summary` | **0,38 s** `power3.out`, `y dy → 0`, `overwrite: auto` | tombe au **palier 2** ; aucun `preventDefault`, le natif reste intact | V2 | N1 |
| A158 | étiquette de la pointe | langue.js | — | `.pointe-mot` | `pointerover` sur `.shot-vue`, `.sector-preview`, `.tour-stage` | déplacement **immédiat** (pas de transition sur `transform`) ; l'opacité suit A93 | exige `pointer: fine` **et palier 0** | V4 | N3 |
| A159 | ouverture de modale | langue.js | écouteur `aped:modal` | `.modal-panel` | `openModal` `main.js` | **0,26 s** `power3.out`, `clipPath inset(0 0 100% 0) → 0`, `y −10 → 0`, `clearProps` | tombe au **palier 2** → repli sur A60 | V1 | N1 |
| A160 | trame de modale | langue.js | **tombe au palier 1** | voile dans le `<dialog>` | **tombe au palier 1** | **300 ms**, vie **150 ms**, maille **40**, graine **907**, `z: 9` | **palier 0 seulement** ; le voile est posé **dans** la modale, jamais dans `<body>` (couche supérieure) | V1+V3 | N1 |
| A161 | fermeture de modale | langue.js | écouteur `aped:modal-ferme` | `.modal-panel` | `closeModal` `main.js` | **0,22 s** `power2.in`, réciproque exacte | tombe au palier 2 ; jamais émis sous mouvement réduit (`main.js`) | V1 | N1 |
| A163 | escalade au palier 2 | langue.js `monterAuPalier` | mesure d'images, | `<html>` | **médiane > 20 ms** sur 90 images d'un défilement réel | — | tue tous les `jetables` et appelle `APED_TRAME.tout_arreter` ; **sens unique**, ne redescend jamais | — | — |

### 1.14 · `js/main.js` — l'orientation (vague 1, jamais sacrifiée)

| # | Nom | Fichier:ligne | Fonction | Élément ciblé | Déclencheur | Durée | Condition / verrou | Verbe | Niveau |
|---|---|---|---|---|---|---|---|---|---|
| A164 | visée de la plaque d'entrée | main.js | `viser` | `.entree-plaque` | chargement | — | **abandonne si `performance.now > 600`** | V2 | N2 |
| A165 | levée de l'attente | main.js | `lever` | `<html>` | `document.fonts.ready` **et** `#heroPlate.is-live`/`.is-fallback` | garde-fou : **`2500 − performance.now`** ms | retire `entree-attend`, puis `compo-hero` **3 200 ms** plus tard | — | — |
| A166 | saut de la séquence | main.js | `sauter` | `<html>` | `pointerdown` / `keydown` en capture | pose `entree-saut`, appelle `finir` **200 ms** après | écrit `sessionStorage["aped-entree-saut"] = "1"` | — | — |
| A167 | fin du rideau | main.js | `finir` | `#entree` | `animationend` sur `[data-entree-fin]` | filet de sécurité : `max(1800, 2500 − performance.now + 700)` ms | retire le nœud du document | — | — |
| A168 | ressort du calculateur | main.js | `Spring` | `#roiImpact`, `#railImpactValue`, `#navImpactValue` | curseurs du calculateur | ressort **k = 90, d = 22**, pas d'odomètre (valeur continue) | `set(target, immediate)` écrit d'un coup sous mouvement réduit | — | N1 |
| A169 | odomètre | main.js `rouler` / 2406 `rouleUn` | — | `#parcNum`, `#railLeftNum`, `.referral-max .num` | changement de valeur | classe `is-roule` posée **1 rAF** après ; retirée à **`320 + min(rang,6) × 34` ms** | **jamais sacrifié** ; le glyphe sortant passe en pseudo-élément `attr(data-c)` pour ne pas polluer `textContent` | V4 | N1 |
| A170 | G2 · cran des douze frontières | main.js | `setCurrent` | `[data-seuil]` de la section courante | `IntersectionObserver` `-45% 0px -45%` | `data-cran="pose"` → **2 rAF** → `data-cran="fait"` → déclenche A40 (320 ms) | **jamais sacrifié, à aucun palier** ; verrou `seuil._cran`, une seule fois | V4 | N1 |
| A171 | douzième frontière (pied) | main.js | `cloture` | `.seuil--pied` | `IntersectionObserver` `0px 0px -30%` | **tombe au palier 1** | son propre observateur : elle n'est pas dans une `<section>` | V4 | N1 |
| A172 | barre de lecture | main.js | `measure` | `#readBar` (`--read`) | `scroll`, une mesure par rAF | **aucune transition** — la largeur suit le défilement | **jamais sacrifié** | — | N1 |
| A173 | progression dans la section | main.js | **tombe au palier 1** | `.rail-curseur` et `.rail-list a` (`--sec-progress`) | **tombe au palier 1** | aucune transition | **jamais sacrifié** | — | N1 |
| A174 | jauge de cadre de projet | main.js | `majJauge` | `.shot-jauge b` | `scroll` dans le cadre | `scaleX` écrit directement, **aucune transition** | **jamais sacrifié** | — | N1 |
| A175 | lecture automatique de capture | main.js | `boucle` | `[data-shot]` (`scrollTop`) | survol **520 ms**, clic, Entrée/Espace | **+0,7 px par image**, soit ≈ 42 px/s | ne démarre pas sous mouvement réduit | — | N1 |
| A176 | retour du cadre | main.js | `desactiver` | `[data-shot]` | sortie du pointeur / blur | `scrollTo behavior: "smooth"` ; jauge remise à jour **420 ms** après | `behavior: "auto"` sous mouvement réduit | — | N1 |
| A177 | bascule de thème par trame | main.js | `basculerTheme` | `document.documentElement` (boîte = **la fenêtre**) | clic sur `#themeToggle` | **couvrir 220 ms** (vie 120) → `applyTheme` → **dégager 260 ms** (vie 140) ; maille **56**, graine **613**, `z: 2147483000` | exige `window.APED_TRAME` **et** pas de mouvement réduit ; sinon bascule nette | V1+V3+V4 | N1 |
| A178 | trame d'ouverture du menu | main.js | `openMenu` | `#menu` | clic sur le bourgeon | **340 ms**, vie **170**, maille **52**, graine **331**, sens `bas` | exige `APED_TRAME`, pas de mouvement réduit ; **supplément**, `is-open` fait le travail utile | V1+V3 | N1 |
| A179 | trame de fermeture du menu | main.js | `closeMenu` | `#menu` | clic / Échap | **300 ms**, vie **150**, maille **52**, graine **331**, sens `inverse("bas")` = **`haut`** | **tombe au palier 1** | V1+V3 | N1 |
| A180 | trame du panneau « ajuster » | main.js | écouteur `toggle` | contenu de `details.roi-details` | ouverture du `<details>` | **320 ms**, vie **160**, maille **36**, graine **449**, sens `bas`, `z: 3` | exige `APED_TRAME`, pas de mouvement réduit ; **aucune réciproque à la fermeture**, assumé | V1+V3 | N1 |
| A181 | défilement automatique des secteurs | main.js | `demarrer` | `.mock` | `IntersectionObserver` seuil 0,25 | `setInterval` **3 600 ms** | exige `pointer: coarse` **et** pas de mouvement réduit ; **s'arrête définitivement** au premier `pointerdown` sur une pastille | V4 | N2 |

### 1.15 · `js/hero.js` + `js/limaille.js` — la plaque de limaille (vague 1)

| # | Nom | Fichier:ligne | Fonction | Élément ciblé | Déclencheur | Durée | Condition / verrou | Verbe | Niveau |
|---|---|---|---|---|---|---|---|---|---|
| A182 | composition des grains | hero.js → limaille.js `enter` | `lancerGrains` | `#heroCanvas` (≈ 25 000 grains) | **`animationstart` de `[data-entree-debut]`** (la bande du **milieu** du rideau, `hero.js`) | **800 ms** de phase ; ressort **critiquement amorti**, ω 7 → 21 rad/s, ζ = 1, décalage par graine **0,42** | exige `html.entree-on` ; filet de sécurité à `max(600, 2700 − performance.now)` ; rien sous mouvement réduit | V2 | N2 |
| A183 | départ depuis quinze filets | limaille.js `seedPositions` | — | **tombe au palier 1** | avant A182 | — | **15 filets horizontaux**, le même nombre que les bandes du rideau | V2 | N2 |
| A184 | sillon du pointeur | hero.js → limaille.js | `pointer` | **tombe au palier 1** | `pointermove` sur `#heroPlate` | rayon **`max(28, smallCap × 1.6)`**, force **15 000** | exige `pointer: fine` ; coupé sous mouvement réduit (limaille.js) | V2 | N2 |
| A185 | re-coulée | hero.js → limaille.js | `pulse` | **tombe au palier 1** | clic (pointeur fin) ou `pointerdown` (tactile, ) | **0,55 s**, force **52 000**, rayon `max(120, smallCap × 4.2)` | coupé sous mouvement réduit | V2 | N2 |
| A186 | recoloration | hero.js | `recolor` | **tombe au palier 1** | événement `aped:theme` | une passe de tracé, sous la milliseconde | sans elle, le hero reste noir en thème clair | — | N1 |
| A187 | recomposition au redimensionnement | hero.js | — | **tombe au palier 1** | `resize`, anti-rebond **160 ms** | — | matière déterministe → aucun scintillement | — | — |
| A188 | mise en pause hors écran | hero.js, 433 | `setVisible` | **tombe au palier 1** | `IntersectionObserver` `80px` + `visibilitychange` | — | la boucle s'arrête quand `settled` (limaille.js) | — | — |

### 1.16 · `js/trame.js` — le moteur de passage (vague 1)

| # | Nom | Fichier:ligne | Fonction | Élément ciblé | Déclencheur | Durée | Condition / verrou | Verbe | Niveau |
|---|---|---|---|---|---|---|---|---|---|
| A189 | passage par tuiles | trame.js `passage` | `degager` / `couvrir` | `<canvas.trame-voile>` posé sur la cible | appel d'API | défaut **420 ms**, vie de tuile **190 ms**, maille **44**, désordre **0,22** ; sortie cubique **ζ = 1** | bruit **déterministe** par graine, jamais `Math.random` ; garde-fou **1 400 tuiles** max ; `dpr` plafonné à 2 ; chaque voile porte **`data-passage`** | V1 dont l'arête est V3 | N2 |
| A190 | arrêt général | trame.js | `tout_arreter` | tous les voiles actifs | escalade au palier 2 | immédiat | appelé par `langue.js` | — | — |

### 1.17 · `js/pointe.js` (vague 2)

| # | Nom | Fichier:ligne | Fonction | Élément ciblé | Déclencheur | Durée | Condition / verrou | Verbe | Niveau |
|---|---|---|---|---|---|---|---|---|---|
| A191 | encliquetage du réticule | pointe.js | `boucle` | `.pointe` | `pointermove` | interpolation **0,42 par image** ; s'arrête sous 0,2 px d'écart | exige `pointer: fine` **et** pas de mouvement réduit ; abandon définitif au premier `touchstart` | V4 | N3 |
| A192 | aimantation | pointe.js | `poserAimant` | 13 familles de cibles | pointeur proche | déplacement **16 % × (1 − d)**, rendu par A94 (240 ms) | **tombe au palier 1** | V2 | N3 |

### 1.18 · `js/tour360.js` (vague 2)

| # | Nom | Fichier:ligne | Fonction | Élément ciblé | Déclencheur | Durée | Condition / verrou | Verbe | Niveau |
|---|---|---|---|---|---|---|---|---|---|
| A193 | dérive automatique | tour360.js | `monter` | visionneur Pannellum | ouverture de la visite | **−1,6 °/s** | `if (!reduit)` — jamais sous mouvement réduit ; s'arrête à la première main | — | N3 |
| A194 | fondu d'échange de scène | tour360.js | **tombe au palier 1** | textures Pannellum | changement de scène | **380 ms**, `0` sous mouvement réduit | c'est un **fondu** de la bibliothèque tierce, masqué par A195 quand la trame est là ; `.pnlm-fade-img { display: none }` sous mouvement réduit (tour360.css) | — | N3 |
| A195 | passage d'une pièce à l'autre | tour360.js | clic sur une pastille du plan | `.tour-stage` | clic sur `.tour-map-room` | **couvrir 240 ms** (vie 130) → `loadScene` → **dégager 300 ms** (vie 150) ; maille **48**, graine **727**, `z: 6` | exige `APED_TRAME` **et** pas de mouvement réduit ; sinon `loadScene` immédiat | V1+V3 | N1 |
| A196 | chargement de la visite | tour360.js | clic sur `[data-tour-start]` | `.tour`, le bouton | clic | classe `is-loading` → A28 (`btn-load`, 1,1 s infinie) | — | — | N1 |

**Total catalogué : 196 entrées** — 99 en CSS pur (dont **45 blocs
`@keyframes`**, 44 noms distincts), 97 pilotées ou déclenchées par
JavaScript.

---

## 2 · LES VERROUS

Tout ce qui peut empêcher une animation de jouer, avec l'endroit exact.
C'est la partie du document à lire en premier quand quelque chose « ne
marche pas ».

### 2.1 · Stockage

| Clé | Type | Lue | Écrite | Effacée | Ce qu'elle bloque |
|---|---|---|---|---|---|
| `aped-entree-saut` | `sessionStorage` | `index.html` (script du `<head>`, **avant le premier rendu**) | `main.js` dans `sauter` | jamais | **`html.entree-on` n'est pas posée.** Conséquence en chaîne : `.entree { display: none }` donc A1→A19 n'existent pas ; `main.js` retire le nœud ; `hero.js` **refuse de lancer les grains** (`maybeEnter` rend la main sans `entree-on`) ; et **`compo-hero` n'est jamais posée non plus**, parce que `main.js` vit dans la branche `else` du test `entree-on` — donc **A20→A26 tombent aussi**. ⚠ Un `catch` sur `sessionStorage` met `saute = true` : **navigation privée stricte = aucune séquence, aucune composition du hero.** |
| `aped-sans-popup` | `sessionStorage` | `main.js` | jamais par le site — **posée par les outils Playwright** | jamais | `vu = true` → `ouvrir` rend la main , et `main.js` fait un `return` avant d'armer les trois déclencheurs. **A49→A56 (tout le cadeau) invisibles.** C'est l'interrupteur des outils de mesure, pas une règle produit. |
| `aped-cadeau` | `localStorage` | plus jamais | plus jamais | **`main.js`, à chaque chargement** | rien — clé morte, effacée exprès pour ne pas rejouer l'ancien défaut |
| `aped-cadeau-donne` | `localStorage` | plus jamais | plus jamais | **`main.js`** | rien — idem |
| `aped-theme` | `localStorage` | `index.html` (avant le premier rendu), `main.js`, `main.js` | `main.js` dans `applyTheme` | jamais | si elle existe, `suivreSysteme` rend la main : **le thème ne suit plus le système**, donc A95 et A177 ne se déclenchent plus tout seuls au coucher du soleil |

### 2.2 · Type de navigation

`index.html` lit
`performance.getEntriesByType("navigation")[0].type`, avec repli sur
`performance.navigation.type === 2`.

| Type | `html.entree-on` | Effet |
|---|---|---|
| `navigate` | **posée** | la séquence joue |
| `reload` | **posée** | la séquence **rejoue** — c'est une arrivée, pas une navigation interne |
| `back_forward` | **non posée** | pas de séquence : A1→A26 absentes, A182 (les grains) ne part pas |

### 2.3 · Les classes de `<html>`

| Classe | Posée par | Retirée par | Quand | Ce qui en dépend |
|---|---|---|---|---|
| `js` | `index.html` — **synchrone, avant le premier rendu** | jamais | toujours si JS actif | `html.js .draw { transform-origin }` (base.css) ; **toutes les animations de `404.html`** (A96→A98) |
| `reduced-motion` | `index.html` si `prefers-reduced-motion` ; **aussi** `motion.js` quand GSAP est absent | jamais | init | les trois règles `html.js.reduced-motion .derail-*` de `404.html` |
| `entree-on` | `index.html` — **avant le premier rendu** | `main.js` (mouvement réduit, à 640 ms) · `main.js` dans `finir` | fin du rideau, vers **1,3 s** | A1→A19 ; `hero.js` refuse de composer les grains sans elle |
| `entree-attend` | `main.js` — **immédiatement**, sans se demander si c'est utile | `main.js` dans `lever` · `main.js` dans `finir` | dès que `document.fonts.ready` **et** `#heroPlate.is-live`/`.is-fallback` ; plafond **`2500 − performance.now`** ms | met en **pause** A1, A4, A6, A7, A8, A9, A12, A13, A15, **A20→A24**. `animation-play-state` est une **liste** (`running, paused`) sur la jauge, l'état et le rouleau : la première animation continue, la seconde attend |
| `compo-hero` | `main.js` | `main.js`, **3 200 ms après `lever`** | — | **A20→A26**, c'est-à-dire toute la composition du hero. Classe **distincte** de `entree-on` : accrochée à `entree-on`, les cinq derniers pas (retards 1 140 → 1 470 ms) voyaient leur animation annulée en vol |
| `entree-saut` | `main.js` | `main.js` dans `finir` | premier `pointerdown` ou `keydown` en capture | remplace A1/A4/A7/A9/A13 par A2/A5/A17/A18 (`!important`), et A20/A22 par A25/A26 |
| `theme-shifting` | `main.js` et `main.js` | à **560 ms** (`main.js`, `1020`) | bascule de thème | A95, la transition globale de 520 ms sur tout le document |
| `has-pointe` | `pointe.js` | `pointe.js` | premier `pointermove` avec pointeur fin | rien de listé ici — marqueur d'état |

### 2.4 · `data-palier` sur `<html>`

Posé par `langue.js` à l'initialisation, **jamais avant que la
vague 2 soit arrivée**. Escalade à sens unique (`monterAuPalier`,
).

| Palier | Déclencheur exact | Ce qui tombe |
|---|---|---|
| **0** | rien | — |
| **1** | `langue.js` : `!matchMedia("(min-width: 64em)").matches` **OU** `pointer: coarse` **OU** `hardwareConcurrency <= 4` **OU** `deviceMemory <= 4` (absent ⇒ 8) | A155 (parallaxe vitrine) · A156 (vitesses des fiches) · A162 (**dérive des sept plaques**) · A93 + A158 (étiquette de la pointe, `display: none` app.css) · A29 (**flèche hors cadre**, app.css) · A150 (**encrage des chapôs**, le poste le plus cher) · A152 (balayage des sous-titres) · **A141/A143 → A142/A144** : la trame des frontières retombe sur l'arête de règle |
| **2** | `langue.js` : médiane des intervalles **> 20 ms** sur **90 images** d'un défilement **réel** | A30/A31/A33 deviennent instantanés (`--cran: 0ms`, app.css) · A154 (recomposition des secteurs) · A153 + A45 (soudure des filets, app.css) · A157 (FLIP de la FAQ) · A159/A160/A161 (dégagement des modales) · A56 (dégagement du popup, app.css) · **G4 entier** : `langue.js` fait un `return` avant A141→A147 ; `app.css` pose `--seuil-g4: none` |
| **3** | `prefers-reduced-motion: reduce` | `motion.js` **et** `langue.js` ne s'exécutent pas du tout ( / ) ; `base.css` ramène toute durée à **0,01 ms** |

**Ce qui ne tombe à aucun palier** — parce que tout ça vit dans
`main.js`, qui s'exécute toujours : A39, A40, A41, A46, A47, A48, A61,
A67, A169, A170, A171, A172, A173, A174.

### 2.5 · Les attributs posés paresseusement par JavaScript — **le point le plus important**

Chacune de ces règles CSS a une cible qui **n'existe pas** tant qu'un
script ne l'a pas créée. C'est la source la plus fréquente d'un « ça ne
s'anime pas » sans erreur en console.

| Attribut / classe | Posé par | Quand | Règle CSS qui en dépend | Sans lui |
|---|---|---|---|---|
| **`data-lettres="1"`** | `langue.js` dans `decouper` | file `requestIdleCallback`, **ou** au premier `pointerenter`/`focusin` en secours | `.btn[data-lettres]::before` (4821, A30) · `.btn[data-lettres]:hover .icon` (4902, A29) · `.btn[data-lettres]:hover` bordure · `.hero-cta .btn--ghost[data-lettres]::before` | **aucun aplat, aucune flèche, aucune inversion de bordure.** Le bouton garde exactement le survol d'avant la phase 8. C'est délibéré : le sélecteur d'attribut fait de la dégradation une garantie |
| **`--p`** (sur chaque `.l` et `.icon`) | `langue.js` dans `positionner` | juste après le découpage, et à chaque `resize` (anti-rebond 220 ms) | `.btn .l { transition-delay: calc((1 - var(--p, 0)) * var(--cran)) }` · `.btn:hover .l` · `.btn .icon` (4841, 4846) | la valeur de repli s'applique (`0` pour `.l`, `1` pour `.icon`) : **toutes les lettres basculent en même temps**, ce qui rouvre la fenêtre de contraste que la phase 8 a fermée |
| **`--n`** | `langue.js` | **tombe au palier 1** | documenté comme pilote de la cascade (`app.css`) — **plus lu par aucune déclaration active** | rien |
| **`--i`** | `langue.js` | **tombe au palier 1** | idem — **plus lu par aucune déclaration active** ; c'est `--p` qui a pris le relais | rien |
| **`.l` / `.lettres`** | `langue.js` et `693` | **tombe au palier 1** | `.btn .lettres { display: inline-block }` · `.btn .l` · `.btn:active .l` | pas de cascade du tout |
| **`.mot`, `.ligne`** dans `.head h2` | `motion.js` et `509` (`couperEnLignes`) | scroll, `top bottom`, un titre à la fois | `.head h2 .mot { display: inline }` · `.head h2 .ligne { display: block; text-wrap: nowrap }` | pas de balayage de titre (A133) |
| **`.mot-encre`** | `langue.js` (`decouperMots`) | file `requestIdleCallback`, ou à la volée dans le `onEnter` | aucune règle CSS — l'opacité est écrite par GSAP puis rendue par `clearProps` | pas d'encrage (A150). ⚠ `decouperMots` **rend `null`** si le paragraphe contient autre chose qu'un seul nœud de texte : un chapô avec un lien ne s'anime jamais |
| **`.is-set`** sur `.section-rule` | `motion.js`, **760 ms** après l'entrée | scroll | `.section-rule.is-set` et sa variante encre | le filet reste en **trame de grains** pour toujours — visible, mais jamais ressoudé |
| **`.is-current`** sur `.section-rule` | `main.js` | `IntersectionObserver` | `.section-rule.is-current` et sa variante encre | pas de filet minium sur la section active |
| **`.en-soudure`** | `langue.js`, retirée **420 ms** après | scroll `top 86%` | `[data-souder] > .en-soudure::before` | A45 ne joue pas ; le filet reste plein, ce qui est déjà l'état de repos |
| **`.en-soudure-longue`** | `langue.js`, retirée **860 ms** après | franchissement à 96 % | `.seuil-filet.en-soudure-longue` | A44 ne joue pas |
| **`.seuil-soudure-longue`** | `langue.js` | init de `frontieres` | `.seuil-soudure-longue .seuil-filet { width: 100vw; transition… }` | le filet du seuil 09 **ne prend jamais la pleine largeur** — c'est du style, pas seulement de l'animation |
| **`data-cran="pose"` / `"fait"`** | `main.js` et `2642-2644` | section devenue courante | `.seuil[data-cran="pose"] .seuil-roul` · `[data-cran="fait"]` | pas de cran (A40) ; le numéro reste juste, `translateY(-1em)` est l'état de repos |
| **`.odo` + `.odo-c` + `<b>`** | `main.js` (`rouler`, premier passage) | premier appel | tout le § `V4 · L'ODOMÈTRE` (4982-5013) | le compteur est du texte nu |
| **`.is-roule`** | `main.js`, **1 rAF** après l'ajout du glyphe entrant | changement de valeur | `.odo-c.is-roule b` | pas de roulement |
| **`data-c`** sur le glyphe sortant | `main.js` | **tombe au palier 1** | `.odo-c b[data-c]::before { content: attr(data-c) }` | le glyphe sortant reste du **texte** → `textContent` rend « 87 » au lieu de « 7 » |
| **`.rail-curseur`** (l'élément lui-même) | `main.js` — **créé en JS** | init | tout le § `.rail-curseur` (5026-5047) | pas de curseur du tout |
| **`--y` / `--h` / `--sec-progress`** | `main.js`, `2604-2612` | changement de section, puis chaque rAF de défilement | `.rail-curseur { height: var(--h, 0px); transform: translateY(var(--y, 0px)) }` | curseur à hauteur **0 px**, donc invisible |
| **`--read`** | `main.js` | rAF de défilement | `.read-progress i { width: var(--read, 0%) }` | barre de lecture à **0 %** |
| **`[open]`** sur `.svc-detail` | natif — `<details>` | clic ou Entrée sur le `<summary>` | l'état ouvert de la carte (via `:has`) **et** les six animations d'écran A70→A76 | rien : la fiche s'ouvre quand même. C'est tout l'intérêt d'avoir choisi le natif |
| **`.is-on`** sur `.mock` | `main.js` (`showSector`) | survol/focus d'une pastille, ou minuteur tactile | **les treize animations de `secteurs.css` A100→A112** + `.mock.is-on { content-visibility: visible; opacity: 1 }` | rien ne bouge, rien n'est même mis en page |
| **les treize `.mock` eux-mêmes** | `main.js` — clonés depuis `<template id="tplSecteurs">` | init | tout `css/secteurs.css` | **sans JavaScript il n'y a aucune maquette**, donc 55 Ko de CSS sans cible |
| **`.is-parcours`** sur `.shot` | `main.js` (`activer`) | survol 520 ms / clic / Entrée | `.shot.is-parcours .shot-etat i { animation: shot-bat… }` | pas de battement |
| **`.is-live`** sur `#heroPlate` | `hero.js`, après composition des ≈ 25 000 cibles | `document.fonts.ready` | `.hero-plate.is-live canvas { display: block }` · `.hero-plate.is-live .plate-text { visibility: hidden }` | **le canvas reste caché et c'est le `<h1>` texte qui s'affiche** — le repli correct |
| **`.is-fallback`** sur `#heroPlate` | `hero.js, 241, 298` | canvas indisponible ou composition impossible | — | idem ; `main.js` l'accepte comme condition de levée de l'attente |
| **`.is-loading`** | `main.js` (`setLoading`), `tour360.js` | envoi de formulaire, ouverture de la visite | `.btn.is-loading::after` · `.btn-icon.is-loading::after` | pas de barre indéterminée |
| **`.is-valid` / `.is-invalid`** | `main.js` (`markField`) ; `.is-valid` **retirée à 2 400 ms** | soumission | `.field.is-valid …` · `.field.is-invalid …` | pas de signal de validation |
| **`.is-ok` / `.is-err`** | `main.js` (`say`) | réponse d'envoi | `.form-status.is-ok::after` → A46 | pas de soudure d'état |
| **`.se-retire`** sur `#cadeau` | `main.js`, retirée 220 ms après | fermeture du popup | `.cadeau.se-retire` · `::backdrop` | `close` immédiat, aucune réciproque |
| **`.is-open`** sur `.modal` / `.menu` | `main.js`, dans un `requestAnimationFrame` | ouverture | `.modal.is-open .modal-scrim` · `.modal-panel` · `.menu.is-open` | le panneau reste à `opacity: 0` — **c'est le seul endroit du site où un état de départ vit dans le CSS**, et il est justifié : le conteneur porte `hidden` |
| **`data-palier`** | `langue.js` | init de la vague 2 | `:root[data-palier="1"] …` et `="2"` (5436-5471) · `app.css` | aucune règle de palier ne s'applique — **le site est au palier 0 de fait** tant que la vague 2 n'est pas arrivée |
| **`data-images`** | `langue.js` | après 90 images mesurées | aucune règle CSS — **sonde de diagnostic seulement** | rien |
| **`data-passage`** sur les voiles | `trame.js` | à chaque passage | aucune règle CSS — sert aux **outils de mesure** | un test qui compte les voiles ne peut pas dire lequel manque |
| **`.pointe`, `.pointe-h`, `.pointe-v`** | `pointe.js` — créés en JS | premier `pointermove` fin | tout le § `.pointe` (679-704) | pas de réticule |
| **`.pointe-mot`** | `langue.js` — créé en JS | premier `pointerover` sur une des trois zones | `.pointe-mot` | pas d'étiquette |
| **`.tour-hs`, `tabindex`, `role`** | `tour360.js` (`equiper`) | création des points de passage par Pannellum | `.pnlm-hotspot.tour-hs` (tour360.css) | les pastilles gardent le sprite rond de Pannellum |
| **`.derail-go`** sur `<html>` | `404.html` | init | A96, A97, A98 | la ligne est déjà dehors et déjà barrée — repli correct |

### 2.6 · Les deux vagues de scripts

`index.html`. Injection après **deux `requestAnimationFrame`**,
`async = false` pour garantir l'ordre.

| Vague | Fichiers | Quand | Ce qui n'existe pas avant |
|---|---|---|---|
| **1** | `limaille.js`, **`trame.js`**, `main.js`, `hero.js` | après le premier rendu | A164→A190 |
| **2** | `gsap.min.js`, `ScrollTrigger.min.js`, `motion.js`, `langue.js`, `pointe.js`, `tour360.js` | **premier `scroll`, `pointerdown`, `pointermove`, `keydown` ou `touchstart`** — sinon échéance de **1 200 ms** | A116→A163, A191→A196, **et `data-palier`** |

`trame.js` est en vague **1** et non 2, exprès : deux de ses usages
(A177 bascule de thème, A178/A179 menu) se déclenchent au premier clic,
donc potentiellement **avant** que GSAP soit même demandé.

### 2.7 · Les feuilles injectées après le premier rendu

`index.html` injecte **`css/differe.css`**, **`css/secteurs.css`**
et **`css/tour360.css`** dans le même `requestAnimationFrame` que la
vague 1.

Conséquence directe : **toute règle qui atterrit dans `differe.css` ne
s'applique pas pendant les premières centaines de millisecondes.**
`tools/css-critique.mjs` décide de la répartition en demandant au
navigateur ce qui est réellement visible sans défiler ; le découpage
n'est donc pas stable dans le temps. Aujourd'hui :

- `critique.css` contient la séquence d'entrée (A1→A19), la composition
 du hero (A20→A26) et **les deux définitions** de `cadeau-degage` ;
- `differe.css` contient tout le reste, dont les sept animations
 d'écran (A70→A76) et le § phase 8 des boutons.

`secteurs.css` et `tour360.css` suivent le même chemin **et c'est sans
conséquence** : leurs cibles n'existent qu'après que `main.js` a cloné
le `<template>` et que `tour360.js` a monté le visionneur.

### 2.8 · Les requêtes de média

| Requête | Où | Ce qu'elle verrouille |
|---|---|---|
| `(prefers-reduced-motion: reduce)` | `base.css` (global, **0,01 ms partout**) · `index.html` · `motion.js` · `langue.js` · `pointe.js` · `main.js` · `hero.js` · `tour360.js` | palier 3 : `motion.js` et `langue.js` ne s'exécutent pas ; `limaille` fige (`snapToTargets`) ; A19 remplace toute la séquence d'entrée |
| `(prefers-reduced-motion: no-preference)` | `app.css` | **A20→A26** ne sont même pas déclarées sans elle |
| `(min-width: 48em)` | `motion.js` | A116 (parallaxe de la plaque du hero) |
| `(min-width: 64em)` | `langue.js` | déclencheur du palier 1. **La grille des services passe à deux colonnes et l'état ouvert prend la largeur entière en CSS pur — plus aucune animation n'en dépend** |
| `(min-width: 64em)` | `app.css` | la fiche technique du hero n'est **affichée** qu'à partir de là — donc A22→A24 n'ont pas de cible visible en dessous |
| `(pointer: fine)` | `langue.js` · `pointe.js` · `hero.js` | A155, A158, A184, A185, A191, A192 |
| `(pointer: coarse)` | `app.css` · `langue.js` · `main.js` | masque le réticule ; déclenche le palier 1 ; **active** A181 |
| `(max-width: 26em)` · `(max-width: 30em)` · `(max-width: 40em)` | `app.css, 2739` · `tour360.css` | mises en page, pas d'animation |
| `(prefers-reduced-transparency: reduce)` | `app.css` | retire la trame de `.cell--lead::before` |
| `(forced-colors: active)` | `base.css` | force les filets et jauges en `Highlight` |
| `(prefers-color-scheme: dark)` | `index.html` · `main.js` | thème de départ, et A95/A177 au changement système |

---

## 3 · ACCUEIL · `#top`

Trois choses vivent ici et nulle part ailleurs.

### 3.1 · Les onze pas de `compo-hero`

`--e` porte le **retard en millisecondes**, écrit en ligne dans
`index.html`. Ce n'est pas un indice : la cadence n'est pas régulière.
Chaque pas est une **plaque opaque posée dessus** (`he-plaque`,
`transform-origin: right center`, `scaleX(1) → 0`) — jamais un
`clip-path` sur le texte, jamais une opacité : le titre reste peint et
candidat au LCP dès la première image.

| Pas | Élément | `index.html` | `--e` | Plaque `he-plaque` (300 ms) | Filet `he-filet` / `he-souder` | Fin |
|---|---|---|---|---|---|---|
| 1 | `.label.hero-eyebrow.he` | | **560** | 560 → 860 | — | 860 |
| 2 | `.hero-claim .ligne.he` (1ʳᵉ ligne) | | **640** | 640 → 940 | — | 940 |
| 3 | `.hero-claim .ligne.he` (2ᵉ ligne) | | **760** | 760 → 1060 | — | 1060 |
| 4 | `.hero-sub.he` | | **880** | 880 → 1180 | — | 1180 |
| 5 | `.hero-cta.rise.he` (les deux CTA) | | **980** | 980 → 1280 | — | 1280 |
| 6 | `.hero-fiche > .label.he` | | **1060** | 1060 → 1360 | — | 1360 |
| 7 | rangée **01** | | **1140** | libellé `a.he` : **1230** → 1530 | filet : 1140 → 1480 (340 ms) · soudure 1140 → **1960** (820 ms) | 1960 |
| 8 | rangée **02** | | **1210** | libellé : **1300** → 1600 | filet 1210 → 1550 · soudure 1210 → **2030** | 2030 |
| 9 | rangée **03** | | **1280** | libellé : **1370** → 1670 | filet 1280 → 1620 · soudure 1280 → **2100** | 2100 |
| 10 | rangée **04** | | **1350** | libellé : **1440** → 1740 | filet 1350 → 1690 · soudure 1350 → **2170** | 2170 |
| 11 | `.fiche-foot.he` | | **1470** | 1470 → 1770 | filet **1770** → 2110 (`--e + 300`) · soudure **1770** → **2590** | **2590** |

Total de la composition : **2 590 ms** depuis le premier rendu de la
page, soit **2 701 ms depuis la navigation** (relevé du 2026-07-29).
C'est pour ça que `compo-hero` n'est retirée qu'à **3 200 ms après la
levée de l'attente** (`main.js`) : 610 ms de marge.

**Verrous propres à ce tableau :**
- `@media (prefers-reduced-motion: no-preference)` (app.css) — sans
 elle rien n'est déclaré ;
- `html.compo-hero` (`main.js`) — n'est posée que si la séquence
 joue vraiment ;
- `html.entree-attend` met **tout ce tableau en pause** (app.css),
 sinon les onze pas se joueraient derrière un rideau encore fermé ;
- `html.entree-saut` ramène chaque durée à **140 ms** et chaque retard à
 **0** (app.css).

### 3.2 · La limaille du hero

| Objet | Où | Chiffres |
|---|---|---|
| Grains | `hero.js` | pas 2, seuil alpha 170, désordre 0,32, ≈ 25 000 cibles |
| Ressort | `limaille.js` | ω au repos **21 rad/s**, ω au départ **7 rad/s**, ζ = 1 → **aucun dépassement possible** ; dissipation 0,55 au repos / 0,86 en mouvement ; décalage par graine 0,42 |
| Départ | `limaille.js` | **15 filets horizontaux** — le même nombre que les bandes du rideau, et ce n'est pas une coïncidence |
| Déclencheur | `hero.js` | **`animationstart` de `#entree [data-entree-debut]`**, la bande du **milieu** — pas un `setTimeout`, parce que les deux horloges (navigation vs premier rendu de l'élément) diffèrent de tout le temps d'analyse du document |
| Durée | `hero.js` | `field.enter(**800** ms)` |
| Filet de sécurité | `hero.js` | `setTimeout(…, max(600, 2700 − performance.now))` — calé sur le garde-fou de `main.js`, pas sur une horloge à part |
| Sillon | `limaille.js` | rayon `max(28, smallCap × 1.6)`, force **15 000** (à ω 21, k = 441, il faut ≈ 34 × 441 pour creuser 34 px) |
| Re-coulée | `limaille.js, 370` | **0,55 s**, force **52 000**, rayon `max(120, smallCap × 4.2)` |
| Angle de la plaque | `hero.js` | **−2,2°** |
| Densité | `hero.js, 267-280` | grand mot : 12 % d'encre / 88 % de minium, pas 3, grain 2 → couverture 44 % ; petit mot : **96 % d'encre**, pas 2, grain 2 → 100 % |

### 3.3 · Le socle du hero — ce qui reste des huit plaques

> **LES HUIT PLAQUES SONT PARTIES LE 2026-07-30.** La dérive au
> défilement (`langue.js` bloc 10, 194 lignes), la boucle de vie
> permanente (`app.css` § 13bis avec ses huit retards négatifs et ses
> trois verrous), les deux coques `.plaque` / `.plaque-corps` et les
> deux replis de largeur n'existent plus. **Tout est archivé** dans
> `archives/2026-07-30-plaques-accueil/`, y compris les amplitudes
> mesurées (dérive 8 à 24,5 px, battement 1,07° à 2,25°) — elles
> redeviendront la référence le jour où le bloc reviendra.
>
> `tools/plaques-vie.mjs` et `tools/plaques-debord.mjs` restent dans
> `tools/` : ils sortent proprement tant que la bande n'est pas là.

Ce qui les remplace est **un seul pas de plus dans la composition du
hero**, le douzième :

| # | Nom | Fichier:ligne | Élément | Déclencheur | Durée | Verbe | Niveau |
|---|---|---|---|---|---|---|---|
| **A162** | `he-plaque` | `app.css` **2340** | `.hero-socle.he::after` | `html.compo-hero`, `--e: 1320` | **420 ms** `--e-drive` `forwards` | **V1** | N2 |
| **A163** | `he-filet` + `he-souder` | `app.css` **2352** | `.hero-socle .fiche-rule` | idem, retard **+300 ms** — le filet est **sous** la plaque de son propre paragraphe, il attend qu'elle soit partie | **340 ms** + **600 ms** | **V3** | N2 |

Aucune animation permanente ne subsiste dans l'accueil. C'était le
poste le plus cher du site : une boucle ne s'arrête jamais.

### 3.4 · Les deux CTA — `--cran: 520ms`

`app.css`. Les deux boutons partagent la durée ; la
**hiérarchie est portée par la matière**, pas par la taille.

| | Primaire — « Démarrer votre projet » | Secondaire — « Estimation en six questions » |
|---|---|---|
| Sélecteur | `.btn.btn--primary.btn--lg[data-modal-open="modal-start"]` | `.btn.btn--ghost.btn--lg[data-modal-open="modal-estimate"]` |
| `--cran` | **520 ms** (`app.css`, et aussi 4805 par `data-modal-open`) | **520 ms** (`app.css` seulement) |
| Aplat `::before` | `var(--ink)` — **inversion complète vers l'encre** | `var(--accent)` — **l'arête minium** |
| Lettres au survol | `var(--ink-inverse)` | `var(--accent-ink)` (4952-4955) |
| Bordure au survol | `var(--ink)` | `var(--accent)` |
| Filet `::after` | trame minium → 100 % en 240 ms | passe à `var(--ink)` au survol, sinon il disparaîtrait dans son propre aplat |
| Flèche | `fleche-cran` **300 ms** `--e-snap`, retard **520 ms** → fin à 820 ms | **tombe au palier 1** |
| Contraste garanti | 13,89:1 avant l'arête, 13,89:1 après, **0 image intermédiaire** (`color 0 s`) | `--accent-ink` sur `--accent` = **4,70:1** en clair, **5,20:1** en sombre |

Avant correction, le secondaire héritait de `--cran: 230ms` : 22 lettres
en 230 ms font **10,5 ms par lettre**, donc un effet littéralement
invisible sur le second CTA le plus important du site.

**Verrous des deux CTA :** `data-lettres` (donc `langue.js`, donc la
vague 2) ; `--p` sur chaque lettre ; palier 1 tue la flèche ; palier 2
met `--cran: 0ms` et l'aplat couvre d'un bloc.

---

## 4 · CE QUI N'EST PAS ANIMÉ

Liste de ce qu'on pourrait croire animé et qui ne l'est pas.

| Ce qu'on croit | Réalité | Où |
|---|---|---|
| **Le titre du hero monte / apparaît** | Non. `motion.js` : « le hero ne s'anime plus du tout ». Le titre a été retiré en phase 6 (un élément à opacité nulle n'est pas candidat au LCP), les boutons ont suivi. Ce qu'on voit est la **plaque opaque qui se retire** (A20), pas le texte qui arrive | motion.js |
| **La barre de lecture glisse** | Non. `.read-progress i { width: var(--read) }` — **aucune transition déclarée**. La largeur suit le défilement image par image | app.css |
| **La jauge d'un cadre de projet glisse** | Non. `main.js` écrit `scaleX` directement, sans transition | app.css |
| **La progression dans la section glisse** | Non. `--sec-progress` est écrite à chaque rAF, `background-size` n'a pas de transition sur `.rail-list a[aria-current]` | app.css |
| **L'étiquette de la pointe suit le curseur en inertie** | Non. `langue.js` écrit `style.transform` à chaque `pointermove` ; seule l'**opacité** transitionne (160 ms) | app.css |
| **La pointe poursuit le curseur** | Elle ne poursuit pas, elle **s'y pose** : interpolation 0,42 par image, arrêt sous 0,2 px. Et elle ne remplace **jamais** le curseur système — aucun `cursor: none` dans tout le CSS | pointe.js, 78 |
| **Les pastilles de secteur s'inversent au survol** | Non, **retiré après mesure**. Survoler une pastille appelle `showSector` dans la même image, donc `.is-on` arrive avant que l'inversion ait une image pour s'afficher. Il ne reste que le passage au minium | app.css |
| **Les captures de projet défilent au scroll de la page** | Non, **retiré en phase 6**. Le défilement interne est piloté par `scrollTop` et ne démarre **que sur intention** : survol prolongé de 520 ms, clic, Entrée, ou molette dans le cadre | motion.js · main.js |
| **Un voile de grains passe sur les captures** | Non, **coupé exprès**. Trois raisons, dont : ces captures sont **la preuve**, et poser une trame dessus affaiblit exactement ce qu'on demande de juger | langue.js |
| **Les secteurs se recomposent au défilement (scrub)** | Non. Il y avait deux chemins de code, ils ont été fusionnés en **une seule animation de 440 ms** jouée une fois. Un scrub laissait les blocs à 4,1 px de leur place et à 0,84 d'opacité à l'arrêt | langue.js |
| **L'opacité d'un texte est scrubbée quelque part** | **Nulle part.** C'est interdit : une animation scrubbée n'a pas d'état de repos. Les seules propriétés scrubbées du site sont `y`, `rotation`, `scaleX`, `scaleY` — jamais l'opacité d'un porteur de texte | A116, A124, A136, A138, A156, A162 |
| **Le thème bascule en fondu** | Plus depuis la phase 10. `document.startViewTransition` — qui **était un fondu** — a été remplacé par deux passages de trame (220 + 260 ms) | main.js |
| **Le compteur du calculateur roule d'un cran** | Non, et c'est un arbitrage explicite : il suit un curseur qu'on bouge en continu, donc il est tiré par un **ressort** (k = 90, d = 22). Un odomètre sur une valeur qui change 60 fois par seconde ne donne pas 60 crans, il donne du bruit | main.js, 2315-2321 |
| **Les douze frontières portent toutes la trame** | Non : **sept sur treize** (02, 03, 05, 06, 11, 12, pied). Les cinq autres gardent aligner / souder / cran. Douze passages identiques feraient le tic que la phase 9 refusait | langue.js |
| **Il y a douze séparateurs entre les sections** | Non. Un trait posé douze fois fabrique exactement les blocs qu'on veut supprimer. C'est le **même objet** — le seuil — qui traverse et se transforme | app.css |
| **Le fond bascule ciment ↔ encre par section** | Non : **quatre bandes seulement** portent `data-dress="encre"` — les seuils 02, 05, 06 et 12 (pied) | index.html, 1465, 1523, 2451 |
| **`[data-count]` anime des compteurs** | **Aucune cible dans le document.** Le code de `motion.js` est sans emploi ; il subsiste comme repli documenté | motion.js |
| **`[data-settle]` fait arriver des blocs décalés** | **Aucune cible dans le document.** `index.html` documente explicitement pourquoi les plaques ne le portent pas | motion.js |
| **Les cinq filets de la fiche technique passent par `motion.js`** | Non, **exclus** par `motion.js`. Ils se soudent dans la séquence, en CSS, au rythme de `--e`. Ils gardent `data-section-rule` uniquement pour le filet de section active | motion.js |
| **La bordure d'un `.btn` bascule au survol** | Non : c'est **chaque lettre** qui bascule, une par une. Un basculement d'ensemble par-dessus rouvrirait la fenêtre illisible (mesurée à 1,00:1) | app.css |
| **Le `.btn--primary` change de fond au survol** | Plus : `.btn--primary:hover { background: var(--accent) }` **annule** la règle 570. C'est l'aplat qui fait le travail | app.css |
| **La fermeture du panneau « ajuster » a une réciproque** | Non, assumé : le navigateur retire le contenu dans la même image ; mentir demanderait de retarder la fermeture | main.js |
| **Il y a une ombre portée quelque part** | Nulle part. La profondeur est un **filet 1 px décalé** (`.plaque-corps::after`, `inset: 9px -10px -10px 9px`) | app.css |
| **Un dégradé sert de transition** | Aucun. Les seuls `linear-gradient` sont des **aplats** ou des `repeating-linear-gradient` durs — la trame de grains. Le dernier vrai dégradé (plaque d'entrée de la visite 360) a été retiré | tour360.css |
| **Un `backdrop-filter` floute l'arrière-plan du popup** | Non, interdit : « exactement le "ça fond" que la direction interdit », et une passe de composition plein écran par image | app.css |
| **Quelque chose rebondit** | Rien. ζ = 1 partout : `power2.out` / `power3.out` / `power4.out` et le ressort de `limaille.js`. Aucun `back`, aucun `elastic` dans tout le projet | langue.js, limaille.js |

---

## 5 · ANOMALIES RELEVÉES PENDANT LE DÉPOUILLEMENT

Elles sont notées ici parce qu'elles sont vérifiables, pas parce qu'elles
demandent une correction.

1. **`@keyframes cadeau-degage` est défini deux fois** — `app.css`
 et `app.css`, avec deux contenus différents (le second ajoute
 `translateY(-8px)`). En CSS, **la dernière définition gagne pour
 toutes les utilisations du nom**. Donc `.cadeau[open]` (A49,
 `app.css`) joue en réalité le keyframe de la , pas
 celui écrit juste en dessous de lui. Le doublon existe aussi dans
 `critique.css` ( et 1626) et dans `differe.css` ( et
 3562), donc le build le reproduit fidèlement. Effet concret : le
 `<dialog>` **et** son `.cadeau-in` jouent tous deux un `clip-path`
 + `translateY(-8px)`, soit deux fois le même geste imbriqué.

2. **Deux boucles de `motion.js` n'ont aucune cible** — `[data-count]` (A120) et `[data-settle]` (A134). Zéro occurrence dans `index.html`.

3. **`--i` et `--n`, posés par `langue.js`, ne sont plus lus par aucune
 déclaration active.** Les commentaires d'`app.css` les
 décrivent encore comme le pilote de la cascade, mais c'est `--p` qui
 a pris le relais (correction du 2026-07-26).

 état de départ dans le CSS, ce que la règle 0bis interdit. Il est
 défendable — c'est une jauge, pas du contenu, et zéro est son état
 de repos honnête — mais c'est bien une exception.

5. **`.modal-panel { opacity: 0 }`** (`app.css`) en est une
 seconde, sur la même règle. Elle est couverte par le fait que
 `.modal` porte `hidden` et `display: none` tant qu'elle n'est pas
 ouverte : l'élément n'est jamais candidat au LCP.

6. **`if (PALIER >= 2) return;` (`langue.js`) est inatteignable au
 moment où il s'exécute.** `calibrer` ne peut poser que
 **0 ou 1** ; le palier 2 n'est atteint qu'après 90 images de
 défilement mesuré, donc bien après que `frontieres` a fini sa
 boucle. La suppression de G4 au palier 2 se fait en réalité par deux
 autres chemins : `monterAuPalier` tue tous les `jetables` et `APED_TRAME.tout_arreter`, plus la règle
 CSS `--seuil-g4: none` (`app.css`). Le résultat est celui
 annoncé, mais pas par la ligne qui semble le produire — et comme les
 observateurs de **G3** sont dans le même `jetables`, G3 tombe avec
 G4 pour toute frontière pas encore franchie, ce que la table des
 paliers de `CLAUDE.md` décrit correctement.

7. **`langue.js` pousse deux fois le même objet dans `jetables`** —
 `auFranchissement` s'y ajoute déjà tout seul, et l'appel
 est enveloppé dans un `jetables.push(...)`. Sans conséquence : le
 second `kill` sur un `IntersectionObserver` déjà déconnecté ne
 fait rien.
