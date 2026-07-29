# APED Agency — site officiel

## Stack projet

Site statique : HTML + CSS + JS vanilla. Pas de React, pas de Next, pas de build step.
Arborescence : `index.html`, `css/`, `js/`, `images/`, `logo/`.

Conséquence directe : tout skill orienté React/Next/JSX est **hors périmètre** sur ce projet.

---

## LA SIGNATURE — à lire avant toute animation

**Le motif, en une phrase :**

> **APED est fait de limaille : une matière dure qui tient une forme nette sous
> tension, qui s'écarte sous la pointe, et qui se reprend d'elle-même.**

Ce n'est pas de la fumée, c'est de la limaille. Les grains sont durs,
l'amortissement est critique (ζ = 1, donc aucun dépassement possible), et la
forme au repos est **nette au pixel**.

Moteur : `js/limaille.js`. Une seule implémentation, réutilisée partout.

**La règle qui gouverne tout ajout de mouvement :**
avant d'ajouter une animation, il faut pouvoir répondre à
« en quoi est-ce la même idée que le reste ? ». Si la réponse n'existe pas,
l'animation ne se fait pas, même si l'effet est beau. Quarante animations sans
lien entre elles s'annulent ; une seule idée déclinée quarante fois devient une
signature.

### LES QUATRE VERBES — la grammaire, depuis la phase 8

Le motif ci-dessus est une matière. Les quatre verbes en sont la
grammaire, et **il n'y en a pas d'autres**. Ils vivent dans
`js/langue.js`, dont l'en-tête les définit en détail.

| | Verbe | Ce que ça fait |
|---|---|---|
| **V1** | **DÉGAGER** | Une forme déjà là se découvre sous une arête **franche** qui balaye. `clip-path`, jamais un fondu. |
| **V2** | **S'ALIGNER** | Les blocs arrivent décalés latéralement, en alternance, et se reprennent à leur place. Aucun dépassement, ζ = 1. |
| **V3** | **SOUDER** | Un filet apparaît en trame de grains, puis se ressoude en trait plein. |
| **V4** | **CRAN** | Un état ne fond pas dans un autre : il roule d'un cran. |

**Règle d'admission, non négociable :** avant d'ajouter un mouvement,
dire lequel des quatre il est. Si la réponse n'existe pas, le mouvement
ne se fait pas, même si l'effet est beau.

**Corollaire :** la direction du balayage n'est jamais décorative. Elle
suit le sens de lecture de ce qu'elle découvre — gauche→droite pour un
titre, un libellé, un filet ; haut→bas pour une page, une capture, un
panneau. Aucune exception dans le site.

Détail complet, sources et arbitrages : `PHASE-8.md`.

### LES DOUZE FRONTIÈRES — depuis la phase 9

Les quatre verbes valent **entre** les sections comme dedans.

> Une frontière n'est pas un objet posé entre deux sections. C'est le
> moment où toute la page **roule d'un cran**.

Chaque section porte un **seuil** (`[data-seuil]`) : un filet, un numéro
qui roule, un nom. Douze seuils, plus celui du pied.

| | Geste | Verbe | Où | Palier |
|---|---|---|---|---|
| **G1** | le filet se soude dès qu'il entre dans l'écran (`top 97%`) — il **annonce** la section avant qu'elle arrive | V3 | `motion.js` | tombe au 2 |
| **G2** | le numéro roule d'un cran | V4 | **`main.js`** | **jamais** |
| **G3** | le nom se dégage, arête franche gauche→droite | V1 | `langue.js` | tombe au 2 |
| **G4** | UN geste propre à la frontière, nommé dans `data-verbe` | variable | `langue.js` | tombe au 2 |

**Ne jamais poser douze séparateurs.** Un trait posé douze fois fabrique
exactement les blocs qu'on veut supprimer. La continuité vient de ce
qu'un **même** objet traverse et se transforme.

**Le fond ciment ↔ encre change par découpe nette, et il change à la
frontière** — `data-dress="encre"`, quatre bandes seulement (02, 05, 06,
12). La 06 est la réciproque de la 05 : on entre dans l'instrument à la
Visite, on en ressort au Calculateur. Repeindre des sections entières
remettrait en jeu tous les contrastes mesurés pour dire la même chose.

**Le numéro du seuil est juste au repos** (`translateY(-1em)`, seconde
cellule) : sans script, sans GSAP, sous mouvement réduit, à tous les
paliers. Le cran n'ajoute que le mouvement, jamais l'information.

Table des douze, argument de chacune, mesures : `PHASE-9.md` § 2.

### LA TRAME — le passage, depuis la phase 10

`js/trame.js`, vague 1, aucune dépendance. **Un seul mécanisme de
passage, décliné partout.**

> Une grille de tuiles en aplat recouvre une cible **déjà peinte**, puis
> chaque tuile **rétrécit sur son centre**. Le retard d'une tuile est sa
> projection le long de l'axe de **lecture**, plus un désordre borné tiré
> d'une **graine** — jamais `Math.random()`, sinon deux passages
> successifs scintillent.

**Ce n'est pas un cinquième verbe.** C'est **V1 · DÉGAGER** dont l'arête
est faite de la matière de **V3 · SOUDER**. La règle d'admission tient.

Sept frontières sur treize la portent (02, 03, 05, 06, 11, 12, pied) ;
les cinq autres gardent aligner / souder / cran. **Douze passages
identiques feraient le tic que la phase 9 refusait.**

Aussi : bascule clair↔sombre (elle a remplacé `startViewTransition`, qui
était un **fondu**), menu plein écran et sa réciproque, panneau « Ajuster
en détail », modales, passage d'une pièce à l'autre de la visite 360 — où
la texture se charge **derrière** le voile.

API : `APED_TRAME.degager(el, opts)` · `.couvrir(el, opts)` ·
`.inverse(sens)` · `.tout_arreter()`. Chaque voile porte `data-passage` :
un test qui **compte** les voiles ne peut pas dire lequel manque, et
c'est exactement comme ça que la frontière du pied est restée invisible.

Détail, chiffres des six références, six pièges d'instrument :
`PHASE-10.md`.

### L'ACCUEIL — depuis le chantier 01

Trois choses vivent dans la section 01 et n'existent nulle part
ailleurs. Les trois se réclament d'un verbe.

**La composition du hero — V1 · DÉGAGER et V3 · SOUDER.** Onze pas,
en CSS pur, sous `html.compo-hero` : eyebrow, les deux lignes du
titre, le sous-titre, les deux CTA, puis la fiche technique rangée
par rangée. Chaque pas porte son retard en millisecondes dans
`--e`, écrit dans le document.

> **La plaque se retire, elle ne se fond pas — et ce n'est pas
> qu'une question de style.** Un `clip-path` qui masque le titre
> pendant les 700 premières millisecondes le retire de la mesure du
> LCP, exactement comme `opacity: 0` avant la phase 6. Une plaque
> **opaque posée dessus** ne change rien au texte : il est peint,
> entier, dès la première image. C'est aussi ce que fait la
> référence — mesuré, 0 valeur d'opacité intermédiaire sur 120
> échantillons à 60 Hz.

`compo-hero` est une classe **distincte** de `entree-on`, qui tombe
avec le rideau vers 1,3 s : accrochée à `entree-on`, la fiche
technique voyait son animation annulée en vol.

**Les sept plaques — V2 · S'ALIGNER.** Une **coque** (`.plaque`, la
case de grille, que GSAP fait dériver) et un **corps**
(`.plaque-corps`, qui porte l'inclinaison écrite dans le document).
Deux boîtes, parce que GSAP écrit `rotate: none` sur tout élément
dont il prend les transformations en main. Angles sous 2°,
coefficients `--incl` / `--ecart` sur le conteneur pour les
retailler par largeur, profondeur par **filet 1 px décalé** et
jamais par une ombre.

**Les deux CTA — V4 · CRAN.** `--cran: 520ms` sur les deux : à
230 ms, « Estimation en 60 secondes » faisait 10,5 ms par lettre,
donc un effet invisible. La hiérarchie est portée par la matière —
le primaire garde l'inversion complète vers l'encre, le secondaire
reçoit **l'arête minium**.

### LA SÉQUENCE D'ENTRÉE — ce qui la déclenche

Elle **rejoue à chaque rechargement**. On lit
`performance.getEntriesByType("navigation")[0].type` : `navigate` et
`reload` la jouent, `back_forward` non. Le drapeau de session ne sert
qu'à retenir un **saut** — sauter, c'est dire non.

Elle **s'allonge** au lieu de sauter quand le chargement traîne :
`html.entree-attend` met en pause la dernière tranche de jauge, la remise
de la plaque et l'ouverture du rideau, jusqu'à `document.fonts.ready` et
`#heroPlate.is-live`, plafonné à 2,5 s **depuis la navigation**.
`animation-play-state` est une **liste** : `running, paused` retient la
seconde animation sans retenir la première.

Sous mouvement réduit : monogramme net 520 ms, puis disparition d'un
cran, en `step-end` — donc sans script. Détail : `PHASE-9.md` § 1.

### LE BUDGET DE DÉGRADATION — trois paliers

Le site est développé et mesuré sur une machine de bureau. Un téléphone
d'entrée de gamme a un budget de peinture sans commune mesure. L'ordre
dans lequel les animations tombent est donc **écrit avant d'en avoir
besoin**, pas improvisé le jour où quelqu'un se plaint.

**Principe unique :** ce qui tombe en premier est ce qui coûte le plus
pour ce qu'il apporte le moins. L'ordre de chute est l'inverse exact de
la hiérarchie N1/N2/N3.

`js/langue.js` pose `data-palier` sur `<html>`. Le JS décide de ne pas
créer ; le CSS (`:root[data-palier="…"]`) désactive ce qui n'a jamais eu
besoin de JS.

| Palier | Déclencheur | Ce qui tombe |
|---|---|---|
| **0 · plein** | rien | — |
| **1 · allégé** | **statique**, connu à l'init : largeur < 64em **OU** `pointer: coarse` **OU** `hardwareConcurrency` ≤ 4 **OU** `deviceMemory` ≤ 4 | 1. parallaxe souris de la vitrine · 2. vitesses différenciées des fiches · **2bis. la dérive des sept plaques de l'accueil — même famille que 2 : elles restent inclinées, décalées et lisibles, elles ne dérivent plus** · 3. étiquette de la pointe · 4. flèche qui sort du cadre · **5. découpage par mot des chapôs — le poste le plus cher** · 6. balayage des 25 sous-titres · **6bis. la trame des frontières → l'arête de règle d'avant, même verbe, même sens, même durée : on garde le geste, on lâche la texture** |
| **2 · minimal** | **mesuré** : fréquence d'images médiane **< 50 i/s** sur 90 images d'un défilement réel | 7. cascade par lettre → `--cran: 0ms`, bascule d'un bloc · 8. recomposition des secteurs → changement net · 9. soudure des filets · 10. FLIP de la FAQ → saut natif · 11. dégagement des modales · **12. le geste propre à chaque frontière (G4) et le dégagement du nom de seuil (G3) — la frontière reste lisible : filet, numéro, nom** |
| **3 · aucun** | `prefers-reduced-motion` | `langue.js` et `motion.js` ne s'exécutent pas |

**JAMAIS SACRIFIÉ, À AUCUN PALIER** — parce que tout ça vit dans
`main.js`, qui s'exécute toujours : curseur du rail, odomètres, filet de
section active, barre de lecture, compteur des chantiers, étape du
parcours, jauge des cadres de projet, filet de la question dépliée,
filet de validation de champ, **et le cran des douze frontières**.
**L'orientation n'est pas un budget, c'est un plancher.**

**L'escalade est à sens unique.** Un palier ne redescend jamais : une
page qui réactive ses animations dès que la machine respire produit un
scintillement pire que le problème qu'elle corrige. Vérifié par
`node tools/palier-check.mjs`, qui teste les trois paliers par leur
déclencheur réel — dont le palier 2 **en bridant vraiment le processeur**
via le protocole DevTools.

### Hiérarchie de mouvement — N1 / N2 / N3

| Niveau | Rôle | Budget |
|---|---|---|
| **N1 · ORIENTATION** | Dit où on est et où on va : progression, index actif, transitions, ancrage | **Jamais sacrifié** |
| **N2 · SIGNATURE** | Déclinaisons de la limaille, moments de preuve | 1 à 2 par section |
| **N3 · DÉCORATION** | Le reste | N'existe que s'il ne nuit pas à N1 |

Si un effet N2 ou N3 rend N1 moins lisible, il saute. Un seul foyer d'attention
par écran. Test à passer : un patron de PME de 55 ans qui défile doit toujours
savoir dans quelle section il est et combien il en reste.

Chaque animation de `js/motion.js` porte son niveau en commentaire.

### Politique d'accent — RÉÉCRITE

L'ancienne règle (« le minium ne sert que le chiffre ROI, l'index actif, le CTA
primaire et le filet de section active ») était incompatible avec un hero en
minium plein. Nouvelle règle, plus forte :

> **Le minium est la matière dont APED est fait.** Il apparaît une fois en
> pleine masse, au hero, comme le bloc de matière brute. Ensuite il ne revient
> que là où le visiteur peut agir sur cette matière : le CTA primaire, l'index
> actif, le chiffre du calculateur, le filet de la section active.

Le petit mot du hero est déjà en encre dominante : la descente vers l'encre
commence dans le hero même. Ce n'est pas qu'esthétique — l'encre sur ciment
donne 13,89:1 contre 5,74:1 pour le minium, et c'est le petit mot qui a le plus
besoin de contraste.

---

## Cinq règles de structure à ne pas casser

**0. `css/app.css` est la SEULE source. `critique.css` et `differe.css`
sont fabriqués.**
`node tools/css-critique.mjs` les régénère à partir d'`app.css`. Éditer
l'un des deux directement, c'est écrire du CSS qui disparaîtra au
prochain build. Après toute modification : régénérer, puis
`node tools/cascade-check.mjs` — il compare 44 propriétés calculées sur
tous les éléments, feuille découpée contre feuille entière, et il doit
rendre **0 écart**. Un découpage inverse l'ordre de cascade entre deux
règles de même spécificité : c'est arrivé une fois, sur la tuile
principale du contact.

**0bis. Aucun état de départ d'animation dans le CSS.**
`html.js .rise { opacity: 0 }` a été retiré. L'état de repos est
toujours la forme FINALE ; c'est `js/motion.js` qui pose l'état de
départ, avec `immediateRender: false`. Trois raisons : du contenu ne
doit jamais rester invisible en attendant un script, un élément à
opacité nulle n'est pas candidat au LCP, et c'est ce qui permet de
différer les 112 Ko de GSAP à la première interaction.

**0ter. L'orientation ne vit jamais dans `motion.js` ni dans
`langue.js`.**
Ces deux fichiers s'arrêtent net sous `prefers-reduced-motion`. Tout ce
qui répond à « où je suis, combien il en reste » — compteur du rail des
services, étape du parcours, jauge des cadres de projet, **odomètres**,
**curseur du rail**, **filet de section active** — vit dans `main.js`.
Sous mouvement réduit le chiffre reste, seul le roulement disparaît.

**1. Les scripts sont injectés APRÈS le premier rendu, en DEUX vagues.**
Vague 1 : `limaille`, `main`, `hero` — la matière et l'usage. Vague 2,
à la première interaction ou à 1,2 s : GSAP, ScrollTrigger, `motion`,
`langue`, `pointe`, `tour360` — la choréographie. Le site est utilisable avant
que la bibliothèque d'animation soit demandée.
`index.html` ne contient plus de `<script defer>` en bas de page : un bloc en
ligne injecte les huit fichiers après deux `requestAnimationFrame`, avec
`async = false` pour garantir l'ordre. Raison mesurée : en `defer`, l'analyse
du document plus l'évaluation des 112 Ko de GSAP et ScrollTrigger formaient une
tâche de 222 ms **avant** que le navigateur ait l'occasion de peindre, et le
LCP tombait à 588 ms. Remettre un `<script defer>` ramène le défaut.
Corollaire : rien de ce qui est nécessaire à la LECTURE ne doit dépendre du
JavaScript, et **aucun élément de contenu ne doit démarrer à `opacity: 0`** —
un élément à opacité nulle n'est pas candidat au LCP.

**2. La mesure vit dans `tools/`.**
Des scripts Playwright autonomes, lancés avec `node`. Ils rendent des chiffres,
pas des impressions. `node tools/serve.mjs 8099` d'abord, puis :

| Outil | Ce qu'il rend |
|---|---|
| `theme-check.mjs` | parité clair/sombre, contrastes, débordement, captures 12 sections × 2 thèmes × 5 largeurs |
| `deborde.mjs` | contenu **coupé** par un `overflow`, à 9 largeurs |
| `prix-check.mjs` | tout montant en dollars, source **et** texte rendu |
| `entree-check.mjs` · `services-check.mjs` · `projets-check.mjs` · `cadeau-check.mjs` | une section, un comportement, une preuve |
| `verif.mjs` · `perf-probe.mjs` · `audit.mjs` | clavier, orientation, LCP, contrastes |
| `pdf.mjs` | fabrique les deux documents et détecte les pages qui débordent |
| `langue-check.mjs` | les quatre verbes existent dans le document rendu, texte accessible intact après découpage, i/s sur la traversée |
| `etats-check.mjs` | les onze micro-états, un par un : survol, focus, appui, désactivé, chargement, erreur, succès, modale, bourgeon, thème, question dépliée |
| `contraste-survol.mjs` | contraste **pendant** une transition, image par image, aller ET retour. `theme-check` ne mesure que des états posés |
| `contraste-arret.mjs` | contraste **à l'arrêt**, à N positions de défilement, une fois tout stabilisé. C'est lui qui attrape une animation `scrub` qui laisse du texte à mi-opacité |
| `secteur-morph-check.mjs` | la recomposition se produit **et se termine nette au pixel** |
| `cls-source.mjs` | attribue chaque décalage de mise en page à l'élément qui l'a causé |
| `ab-phase8.mjs` | A/B contre une copie de la version d'avant servie sur un second port, passes alternées |
| `palier-check.mjs` | les trois paliers de dégradation, chacun par son déclencheur réel — le palier 2 en **bridant le processeur** via CDP. Vérifie aussi que le numéro de seuil reste **juste** aux trois paliers |
| `tache-traversee.mjs` | temps total passé en tâche longue pendant une traversée, en **différences appariées** |
| `entree-check.mjs` | les huit garanties de la séquence d'entrée — dont l'allongement, prouvé en **coupant la promesse des polices** |
| `frontieres-check.mjs` | les douze frontières, avant / pendant / après, avec l'état relevé de chacune |
| `traversee-check.mjs` | planche de 24 vues + i/s pendant un défilement réel (médiane, 5ᵉ centile, nombre d'images > 20 ms) |
| `cadeau-check.mjs` · `cadeau-scene.mjs` · `cadeau-e2e.mjs` | déclenchement et contenu · l'entrée est une arête et pas un fondu · le parcours complet, `--envoi-reel` compris |
| `couvertures.mjs` | les deux couvertures de PDF en webp, rendues depuis la source des documents |
| `accueil-check.mjs` | l'accueil en sept relevés : contenu des sept plaques et chasse aux énoncés retirés · composition du hero image par image · survol des deux CTA avec le contraste à chaque image · lisibilité de chaque plaque à l'arrêt · dérive bornée · i/s, LCP, CLS · débordement à onze largeurs |
| `ab-accueil.mjs` | A/B de l'accueil contre une copie de la version d'avant servie sur un second port, **passes alternées** et médiane des différences |
| `refs-accueil.mjs` · `refs-reveal*.mjs` · `refs-toggle.mjs` | mesurent les deux références du chantier 01 dans un vrai navigateur : structure, durées, décalages, courbes |

**Deux règles de mesure, apprises à la dure :**

**Ne jamais comparer deux médianes calculées sur une série qui dérive.**
Relevé du 2026-07-26, version d'avant, **code inchangé**, neuf passes :
`167, 0, 0, 0, 108, 942, 962, 981, 658 ms`. La machine dérive d'un
facteur six entre la première passe et la dernière. Il faut mesurer les
deux versions **dans la même passe** et prendre la médiane des
**différences** ; la dérive s'annule alors d'elle-même.

**Ne jamais conclure sur un maximum.** « La pire tâche » est la
statistique la plus instable qui soit : une interruption du système la
triple, et elle ne bouge pas si dix tâches moyennes apparaissent. On
mesure le **total** et le **nombre**, qui s'additionnent au lieu de se
remplacer.

**Cinq pièges d'instrument ajoutés par la phase 8**, tous détaillés dans
`PHASE-8.md` § 6 : un comparateur de cascade doit relever la page en
**mouvement réduit**, sinon il mesure la chorégraphie ; une capture
d'écran est **plus lente** qu'une transition de survol, donc on lit les
valeurs dans la page plutôt que de photographier ; une analyse de pixels
confond l'anticrénelage et l'arête d'un aplat avec du texte illisible ;
un objet rogné **exprès** n'a pas de contraste ; et un détecteur qui
n'attend pas assez confond « animation en vol » et « texte échoué ».

**LA RÈGLE QUI EN SORT, ET ELLE EST PLUS IMPORTANTE QUE LES OUTILS.**
Une animation `scrub` **n'a pas d'état de repos** : elle a l'état où le
visiteur s'est arrêté. Chaque position de défilement est donc un état
**permanent** possible. Il est par conséquent interdit de scrubber
l'opacité — ou toute autre propriété qui touche à la lisibilité — d'un
élément qui porte du texte. Mesure du 2026-07-26 : les mots des chapôs,
scrubbés, restaient à 0,39 d'opacité (~1,5:1) avec le paragraphe à 64 %
de la hauteur d'écran. Le scrub reste permis sur ce qui ne peut rendre
aucun texte illisible — un `translateY` borné, une `scaleX` de filet.

Toute mesure de performance doit être reprise **machine au repos**, et une
mesure de « régression » n'a de sens qu'en **A/B sur la même machine** :
servir la sauvegarde d'avant sur un second port et comparer. Les chiffres
d'une phase antérieure ne sont pas une référence — la phase 6 annonçait
112 ms de LCP, le même code mesuré en phase 7 sur cette machine en donne 196.

**Trois pièges d'instrument déjà rencontrés, ne pas les réintroduire :**
un détecteur de débordement doit distinguer ce qui rogne **exprès** ;
un détecteur de piège de tabulation doit identifier les éléments par leur
identité, pas par `sélecteur + texte` ; et une page d'impression peut
**écraser** son corps sans grandir, donc mesurer la `.page` seule ne prouve
rien.

**Six pièges ajoutés par la phase 9**, tous détaillés dans `PHASE-9.md`
§ 4, tous ayant produit un faux verdict avant d'être trouvés :

1. **`content-visibility: auto` fait mentir `getBoundingClientRect()`** —
   hors écran il rend la taille *réservée*. Traverser la page entièrement
   avant de mesurer, **remesurer chaque cible juste avant de la capturer**,
   et lever la propriété pour relever une hauteur réelle.
2. **Un `scrollTo` qui saute casse un pin de ScrollTrigger.** Défiler par
   pas, comme un visiteur.
3. **`color-mix()` calcule en `color(srgb 0.67 …)`, pas en `rgb()`.** Lu
   comme du 0-255, tout texte en `color-mix` ressort à 1,11:1. Quatorze
   faux échecs de contraste, dont onze sur du code intact.
4. **Une fenêtre d'odomètre rogne exprès** — `.seuil-num`, `.entree-cran`.
5. **Une capture d'écran est plus lente qu'une animation d'entrée** : le
   popup photographié sans attente apparaît coupé au milieu de son arête.
6. **UN TEST PEUT VERROUILLER LE DÉFAUT.** `entree-check` affirmait
   « session déjà vue → pas de rideau », `cadeau-check` affirmait « il ne
   s'ouvre qu'une fois par personne » : la formulation exacte des deux
   bugs. Quand on corrige un défaut, **lire le test qui le couvrait** —
   s'il passe encore sans modification, c'est lui le problème.

---

## Design stack

### Règle globale

**Jamais plus de 2 à 3 skills chargés sur une même tâche.** Un skill de direction
artistique + un skill d'implémentation + au maximum un skill d'audit. Si un
quatrième semble pertinent, c'est que la tâche doit être découpée.

### Niveau 1 — CŒUR (se déclenchent automatiquement)

| # | Skill | Rôle | Quand |
|---|-------|------|-------|
| 1 | `design-taste-frontend` | Direction artistique, anti-slop | Toute création ou refonte d'UI |
| 2 | `redesign-existing-projects` | Audit du code existant avant modification | Toute modification de pages déjà écrites |
| 3 | `gsap-scrolltrigger` | Animation scroll, timelines, pinning, parallax | Toute animation sur ce projet |
| 4 | `web-design-guidelines` | Audit a11y / perf / UX du code produit | Après implémentation |
| 5 | `playwright` (MCP) | Vérification live, arbre d'accessibilité, navigation clavier, captures | Après implémentation, avant de dire "c'est fait" |

### Ordre d'application obligatoire

```
1. AUDIT      → redesign-existing-projects   (uniquement si le code existe déjà)
2. DIRECTION  → design-taste-frontend        (décider AVANT d'écrire du CSS)
3. IMPLÉM.    → code + gsap-scrolltrigger si mouvement
4. AUDIT SORTIE → web-design-guidelines
5. VÉRIF LIVE → playwright MCP
```

La direction artistique se décide **avant** l'implémentation. L'audit vient
**après**. Ne jamais inverser : auditer un design pas encore choisi ne produit rien.

### Niveau 2 — SUR DEMANDE (invocation explicite)

| Skill | Phrase d'invocation exacte |
|-------|---------------------------|
| `ui-ux-pro-max` | « consulte ui-ux-pro-max pour la palette / le font pairing » |
| `locomotive-scroll` | « utilise locomotive-scroll pour le smooth scroll » |
| `full-output-enforcement` | « applique full-output-enforcement » (génération de fichiers longs, interdit la troncature) |

Ces trois-là ne doivent **pas** se déclencher tout seuls. `ui-ux-pro-max` en
particulier a une description qui matche tous les verbes UI (plan, build, create,
design, implement, review, fix, improve, optimize, enhance, refactor, check) —
il est traité ici comme une **base de données de référence**, pas comme un skill
de direction. Il ne décide rien.

### Blocage préalable (à appliquer AVANT toute table de routage)

Sur une tâche d'implémentation frontend (design, CSS, animation, composant,
accessibilité, perf), les skills suivants ne se chargent **jamais**, même si leur
description matche les mots de la demande :

- Les 41 skills marketing (`page-cro`, `pricing-strategy`, `paywall-upgrade-cro`,
  `signup-flow-cro`, `form-cro`, `popup-cro`, `onboarding-cro`, `seo-audit`,
  `copywriting`, `content-strategy`, …). Ils traitent de conversion, de contenu et
  de stratégie, pas de code. Ils ne se chargent que si la demande porte
  explicitement sur du **contenu, de la conversion ou de l'acquisition**, jamais
  sur du markup ou du style.
- `ui-ux-pro-max`, sauf invocation explicite (voir Niveau 2).
- `motion-dev-animations` et `vercel-react-best-practices` : projet sans React.

Mots-pièges connus : « tarification » / « pricing » n'appelle pas
`pricing-strategy` s'il s'agit d'intégrer un composant ; « audit » n'appelle pas
`seo-audit` s'il s'agit d'accessibilité ; « landing page » n'appelle pas
`page-cro` s'il s'agit de design.

### Table de routage

| Si la tâche est… | Alors utilise | Et rien d'autre |
|------------------|---------------|-----------------|
| « refais / redesign / améliore le design de X » | `redesign-existing-projects` puis `design-taste-frontend` | ✗ ui-ux-pro-max, ✗ page-cro, ✗ web-design-guidelines (garder pour la fin) |
| « nouvelle page / nouvelle section from scratch » | `design-taste-frontend` | ✗ redesign-existing-projects, ✗ ui-ux-pro-max |
| « anime au scroll / parallax / pin / reveal » | `gsap-scrolltrigger` seul | ✗ motion-dev-animations (React only), ✗ locomotive-scroll (sauf demande explicite) |
| « smooth scroll / scroll inertiel » | `locomotive-scroll` (sur demande) + `gsap-scrolltrigger` | ✗ motion-dev-animations |
| « installe / ajoute un composant » | MCP `shadcn` (registries `@magic-ui`, `@aceternity`, `@kokonutui`, `@kibo-ui`) | ✗ tout skill de design, ✗ tout skill marketing |
| « vérifie l'accessibilité / audite l'UI » | `web-design-guidelines` puis skill `a11y-debugging` de `chrome-devtools` | ✗ ui-ux-pro-max, ✗ seo-audit, ✗ design-taste-frontend |
| « quelle palette / quelle typo » | `ui-ux-pro-max` (sur demande) | ✗ design-taste-frontend |
| « pourquoi c'est lent / LCP / mémoire » | `playwright` MCP + un script Playwright local avec `PerformanceObserver` | ✗ vercel-react-best-practices, ✗ chrome-devtools |

### Résolution de conflits

1. **Direction artistique vs base de données de styles** →
   `design-taste-frontend` gagne sur `ui-ux-pro-max`.
   Raison : `design-taste-frontend` raisonne à partir du brief et impose une
   direction cohérente ; `ui-ux-pro-max` propose 50+ styles sans arbitrer, ce qui
   produit du templating. `ui-ux-pro-max` sert de source de valeurs (palettes,
   font pairings), jamais de source de décision.

2. **Direction artistique vs audit** →
   En phase de conception, `design-taste-frontend` gagne.
   En phase de relecture, `web-design-guidelines` gagne, y compris s'il faut
   casser un choix esthétique (contraste insuffisant, cible tactile < 44px,
   `prefers-reduced-motion` absent). L'accessibilité n'est pas négociable.

3. **Animation : GSAP vs Motion.dev** →
   `gsap-scrolltrigger` gagne sur ce projet, toujours.
   Raison : le site est en JS vanilla. `motion-dev-animations` cible React /
   Next / Svelte / Astro et sa propre description dit de ne pas l'utiliser sur
   des sites statiques.

4. **Deux skills d'animation scroll** →
   `gsap-scrolltrigger` pilote les animations liées au scroll.
   `locomotive-scroll` ne gère que l'inertie du scroll lui-même et ne s'active
   que sur demande explicite. Ne jamais faire piloter les mêmes éléments par les
   deux.

5. **Automatisation navigateur : `playwright` uniquement** →
   `playwright` (MCP) pour tout : captures, traces de performance, LCP, réseau,
   **arbre d'accessibilité** et navigation clavier. C'est le seul des trois qui
   donne l'arbre a11y et pas seulement des pixels, donc il sert aussi à valider
   les états ARIA et l'ordre de tabulation.
   `chrome-devtools` est **abandonné** : ses captures d'écran expirent
   systématiquement après 120 s sur ce poste. Ne pas le réinstaller.
   `claude-in-chrome` reste disponible pour piloter le navigateur réel de
   l'utilisateur, mais n'est pas l'outil de vérification par défaut.

   Playwright est aussi installé en dépendance locale (`node_modules`), donc on
   peut écrire un script `.mjs` et le lancer avec `node` sans passer par le MCP.
   C'est la voie à privilégier pour tout ce qui doit MESURER, parce qu'on
   récupère un JSON de mesures en plus des PNG.

### Hors périmètre sur ce projet

Installés globalement mais **à ne pas charger ici** :
`motion-dev-animations`, `vercel-react-best-practices` (React/Next uniquement),
`lottie-animations` (uniquement si un JSON After Effects est réellement fourni),
et les 41 skills marketing (`page-cro`, `copywriting`, `seo-audit`, …) qui ne
concernent pas l'implémentation frontend.

---

## MCP

| Serveur | Usage | État |
|---------|-------|------|
| `shadcn` (projet, `.mcp.json`) | Recherche et installation de composants depuis les registries configurés dans `components.json` | à approuver au prochain lancement de `claude` |
| `playwright` | Vérification live, arbre d'accessibilité, navigation clavier, captures, mesures | connecté (`claude mcp add playwright npx @playwright/mcp@latest`) |

Chromium pour Playwright est installé (`npx playwright install chromium`).
`playwright` est aussi en `devDependencies` : un script `.mjs` lancé avec `node`
depuis la racine du projet fait le même travail et rend un JSON de mesures.

Registries actifs dans `components.json` : `@magic-ui`, `@aceternity`,
`@kokonutui`, `@kibo-ui`. Tous vérifiés fonctionnels.

`@unlumen-ui` n'est **pas** activé : les composants Pro exigent une licence et la
variable `UNLUMEN_LICENSE_KEY` est absente. Bloc à coller dans `registries` le
jour où la clé existe :

```json
"@unlumen-ui": {
  "url": "https://ui.unlumen.com/r/{name}.json",
  "headers": { "Authorization": "Bearer ${UNLUMEN_LICENSE_KEY}" }
}
```

Note : `components.json` cible un projet React + Tailwind. Sur ce site vanilla,
le MCP `shadcn` sert à **chercher, lire et adapter** des composants (Magic UI,
Aceternity…) — `shadcn add` n'écrira pas du code directement utilisable sans
portage manuel en HTML/CSS.
