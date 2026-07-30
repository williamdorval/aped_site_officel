# APED Agency — site officiel

> **Ce fichier est le contexte complet du projet.** Une session vide doit
> pouvoir le lire seul et reprendre le travail sans rien casser. Les
> documents ci-dessous en sont les annexes : ce fichier dit **quoi** et
> **pourquoi**, elles disent **où**.

| Document | Ce qu'il rend | Quand l'ouvrir |
|---|---|---|
| **`ARCHITECTURE.md`** | carte de tous les fichiers : rôle, contenu, **et ce qu'il ne contient pas** ; table « je veux modifier X → j'ouvre ces fichiers » | avant de chercher quoi que ce soit |
| **`SECTIONS.md`** | les 13 sections : ancre, plages de lignes HTML, blocs CSS, fonctions JS, composants | « modifie la section Y » |
| **`ANIMATIONS.md`** | les 196 animations : fichier, ligne, déclencheur, durée, **verrou**, verbe, niveau | avant de toucher à un mouvement |
| **`RECHERCHE-ACCUEIL.md`** | les deux références mesurées dans un vrai navigateur + l'état de l'art, en chiffres | avant de décider d'une amplitude ou d'une durée |
| **`AUDIT-VERACITE.md`** | les 36 affirmations fausses, invérifiables ou en jargon relevées le 2026-07-29, **et le traitement de chacune** | avant d'écrire une phrase que le site affiche |
| **`DECISIONS-NUIT.md`** | les 31 arbitrages pris sans le propriétaire dans la nuit du 29 au 30, avec ce qui a été écarté et pourquoi | avant de renverser un choix de contenu |
| **`CHANTIER-SERVICES.md`** | la section 02 refaite le 2026-07-30 : **la cause mesurée des quatre défauts du rail épinglé**, la recherche sur les carrousels en chiffres, **la provenance et la licence de chaque image**, et les 12 décisions prises sans le propriétaire | avant de toucher aux Services, et **avant d'employer une image du dépôt** |

Historique : `PHASE-6.md` à `PHASE-10.md`, `REFONTE-CHECKLIST.md`.

---

## 0 · LES DEUX RÈGLES QUI GOUVERNENT TOUT LE RESTE

### 0.A · VRAI, SINON ÇA NE S'ÉCRIT PAS

> **Aucune phrase de ce site ne s'affiche si elle ne survit pas à un
> client qui la conteste au téléphone.**
>
> Ce n'est pas une règle de ton, c'est une règle de recevabilité. Une
> affirmation qui ne passe pas les quatre questions ci-dessous ne se
> reformule pas : elle ne s'écrit pas.

**Les quatre questions, dans cet ordre. La première qui échoue arrête.**

| | Question | Ce qu'elle élimine |
|---|---|---|
| **Q1** | **Est-ce vrai ?** Défendable, pièce en main, si un client appelle. | « 4,9 · 128 avis » inventés · « Tests passés 24 / 24 » · « la bonne dans neuf cas sur dix » |
| **Q2** | **Le visiteur peut-il le vérifier ?** Sinon, qu'est-ce qui le soutient **ailleurs dans le document** ? | « Cinq projets livrés » sans un seul lien · « les neuf qu'on nous pose le plus » |
| **Q3** | **Est-ce que je le contrôle ?** Une promesse de résultat que personne ne maîtrise se retourne contre nous après l'achat. | « c'est vous qui sortez » sur Google · « il se trouve sur Google » |
| **Q4** | **Un patron de garage le comprend-il en trois secondes ?** | « CRM » · « 2048 px puis 4096 px » · « grille 12 colonnes » · « modèle générique » |

**Et la règle de propagation, qui est celle qui a coûté le plus cher :**

> **UNE CORRECTION DE VÉRACITÉ SE FAIT PARTOUT, EN UNE FOIS.**
>
> Une affirmation vit rarement à un seul endroit. Le 2026-07-29,
> « abonnement obligatoire » a été corrigé dans la FAQ et laissé intact
> dans Services : deux sections du même document se contredisaient, et
> c'est la contradiction la plus facile à opposer parce qu'elle tient
> sur un écran. Le lendemain, « sans courriel » disait la vérité à
> trois endroits et son contraire dans le popup.
>
> Avant de fermer une correction : `grep` l'énoncé dans **tout**
> `index.html`, les modales, le `<template>` des maquettes, les
> `documents/src/*.html`, `404.html`, et le texte **rendu**. Le
> périmètre d'un chantier ne justifie jamais de laisser une fausseté
> ailleurs.

**Une fausseté dans la FAQ est plus grave que dans le hero.** Celui qui
ouvre la FAQ est un prospect sérieux, et c'est celui-là qui la reproche
au téléphone. `node tools/accueil-check.mjs contenu` lit `textContent`
et non `innerText` pour cette raison précise : les réponses de la FAQ
vivent dans des `<details>` repliés, qu'`innerText` ne voit pas.

**Ce que cette règle a coûté avant d'être écrite :** 36 constats dans
`AUDIT-VERACITE.md`, dont neuf faussetés démontrables et six
engagements que personne ne pouvait tenir tels qu'écrits — sur un site
par ailleurs soigné, dont les deux PDF s'imposent déjà ce standard mot
pour mot (« écrit au plus bas, jamais au plus flatteur »). La page
d'accueil ne l'atteignait pas. Le trou n'était pas dans le code.

### 0.B · VISIBLE, SINON ÇA NE COMPTE PAS

> Une animation qu'on ne remarque pas n'existe pas. Une mesure qui dit
> « 520 ms » alors qu'on ne voit rien est une mesure inutile.

Preuve exigée pour tout mouvement : **au moins cinq captures entre le début
et la fin, et l'écart de pixels entre deux captures consécutives.** Si les
cinq images se ressemblent, le mouvement est repris — pas expliqué.

`node tools/accueil-check.mjs sequences` produit ces suites et leurs écarts.
`tools/_png.mjs` est le décodeur PNG + comparateur de pixels maison (aucune
dépendance, `zlib` suffit) sur lequel repose ce critère.

**Ce que cette règle a coûté avant d'être écrite** : deux heures de travail
sur la section 01, un rapport affirmant que tout était fait, et trois
animations dont **zéro** était visible. Les durées étaient justes. Les
mesures étaient justes. Personne n'avait mesuré si on **voyait** quelque
chose.

**Corollaire ajouté le 2026-07-30 : ne jamais conclure sur la pire
image.** `contraste-survol.mjs` déclarait un échec sur un seul relevé à
1,00:1. Mesure de contrôle, horloge étirée ×20 sur 160 échantillons :
**zéro** image sous le seuil. Une image à l'instant où l'arête coupe une
lettre en deux n'est pas une fenêtre illisible, c'est le plancher de
perception. On mesure donc le **nombre** d'images fautives et leur
**durée cumulée** — qui s'additionnent au lieu de se remplacer — et le
seuil de verdict est une image à 60 Hz, soit 16,7 ms. La référence
primée qu'on compare tombe, elle, à 1,03:1 pendant **117 ms**. La
différence n'est pas de degré.

---

## 1 · Stack

Site statique : **HTML + CSS + JS vanilla + GSAP**. Pas de React, pas de
Next, pas de Tailwind, pas de build step — sauf `tools/css-critique.mjs`,
qui découpe le CSS.

Arborescence : `index.html`, `css/`, `js/`, `images/`, `fonts/`, `logo/`,
`documents/`, `tools/`.

Conséquence directe : **tout skill orienté React/Next/JSX est hors
périmètre.**

**Zéro requête tierce.** Aucun CDN, aucun traceur, aucun témoin, aucune
police distante. Vérifiable en dix secondes dans la console.

---

## 2 · LA SIGNATURE

**Le motif, en une phrase :**

> **APED est fait de limaille : une matière dure qui tient une forme nette
> sous tension, qui s'écarte sous la pointe, et qui se reprend d'elle-même.**

Ce n'est pas de la fumée, c'est de la limaille. Les grains sont durs,
l'amortissement est critique (ζ = 1, donc **aucun dépassement possible**),
et la forme au repos est **nette au pixel**.

Moteur : `js/limaille.js`. Une seule implémentation, réutilisée partout.

**La règle d'admission :** avant d'ajouter un mouvement, il faut pouvoir
répondre à « en quoi est-ce la même idée que le reste ? ». Si la réponse
n'existe pas, le mouvement ne se fait pas, même si l'effet est beau.
Quarante animations sans lien s'annulent ; une seule idée déclinée quarante
fois devient une signature.

### Les quatre verbes — la grammaire, et il n'y en a pas d'autres

Ils vivent dans `js/langue.js`, dont l'en-tête les définit en détail.

| | Verbe | Ce que ça fait |
|---|---|---|
| **V1** | **DÉGAGER** | Une forme **déjà là** se découvre sous une arête **franche** qui balaye. Jamais un fondu. |
| **V2** | **S'ALIGNER** | Les blocs arrivent décalés latéralement et se reprennent à leur place. Aucun dépassement, ζ = 1. |
| **V3** | **SOUDER** | Un filet apparaît en trame de grains, puis se ressoude en trait plein. |
| **V4** | **CRAN** | Un état ne fond pas dans un autre : il roule d'un cran. |

**Règle d'admission, non négociable :** avant d'ajouter un mouvement, dire
lequel des quatre il est.

**Corollaire :** la direction du balayage n'est jamais décorative. Elle suit
le sens de lecture de ce qu'elle découvre — gauche→droite pour un titre, un
libellé, un filet ; haut→bas pour une page, une capture, un panneau. Aucune
exception dans le site.

Détail, sources, arbitrages : `PHASE-8.md`.

### Les douze frontières

Les quatre verbes valent **entre** les sections comme dedans.

> Une frontière n'est pas un objet posé entre deux sections. C'est le moment
> où toute la page **roule d'un cran**.

Chaque section porte un **seuil** (`[data-seuil]`) : un filet, un numéro qui
roule, un nom. Douze seuils, plus celui du pied. **L'accueil n'en a pas** —
le seuil est posé en tête de la section vers laquelle il mène.

| | Geste | Verbe | Où | Palier |
|---|---|---|---|---|
| **G1** | le filet se soude dès qu'il entre dans l'écran (`top 97%`) — il **annonce** la section | V3 | `motion.js` | tombe au 2 |
| **G2** | le numéro roule d'un cran | V4 | **`main.js`** | **jamais** |
| **G3** | le nom se dégage, arête franche gauche→droite | V1 | `langue.js` | tombe au 2 |
| **G4** | UN geste propre à la frontière, nommé dans `data-verbe` | variable | `langue.js` | tombe au 2 |

**Ne jamais poser douze séparateurs.** Un trait posé douze fois fabrique
exactement les blocs qu'on veut supprimer. La continuité vient de ce qu'un
**même** objet traverse et se transforme.

**Le fond ciment ↔ encre change par découpe nette, à la frontière** —
`data-dress="encre"`, quatre bandes seulement : les seuils vers 02, 05, 06
et le pied. La 06 est la réciproque de la 05 : on entre dans l'instrument à
la Visite, on en ressort au Calculateur.

**Le numéro du seuil est juste au repos** (`translateY(-1em)`, seconde
cellule) : sans script, sans GSAP, sous mouvement réduit, à tous les
paliers. Le cran n'ajoute que le mouvement, jamais l'information.

Table des douze : `PHASE-9.md` § 2 et `SECTIONS.md`.

### La trame — le passage

`js/trame.js`, vague 1, aucune dépendance. **Un seul mécanisme de passage,
décliné partout.**

> Une grille de tuiles en aplat recouvre une cible **déjà peinte**, puis
> chaque tuile **rétrécit sur son centre**. Le retard d'une tuile est sa
> projection le long de l'axe de **lecture**, plus un désordre borné tiré
> d'une **graine** — jamais `Math.random()`, sinon deux passages successifs
> scintillent.

**Ce n'est pas un cinquième verbe.** C'est **V1 · DÉGAGER** dont l'arête est
faite de la matière de **V3 · SOUDER**.

Sept frontières sur treize la portent (02, 03, 05, 06, 11, 12, pied) ; les
cinq autres gardent aligner / souder / cran. **Douze passages identiques
feraient le tic que la phase 9 refusait.**

Aussi : bascule clair↔sombre (elle a remplacé `startViewTransition`, qui
était un **fondu**), menu plein écran, panneau « Ajuster en détail »,
modales, passage d'une pièce à l'autre de la visite 360.

API : `APED_TRAME.degager(el, opts)` · `.couvrir(el, opts)` ·
`.inverse(sens)` · `.tout_arreter()`. Chaque voile porte `data-passage` : un
test qui **compte** les voiles ne peut pas dire lequel manque, et c'est
exactement comme ça que la frontière du pied est restée invisible.

Détail : `PHASE-10.md`.

---

## 3 · L'ACCUEIL — section `#top`

### 3.1 La séquence d'entrée et la composition du hero

**Deux gestes qui s'enchaînent, et l'enchaînement est le point délicat.**

1. **Le rideau** (`.entree`, quinze bandes **opaques**, `critique.css`).
   Bandes `700 ms + --k × 24 ms`, 300 ms chacune, ouverture **depuis le
   centre**. Le nœud est retiré à la fin d'animation de la bande marquée
   `data-entree-fin`.
2. **La composition du hero** : onze pas, en CSS pur, sous
   `html.compo-hero`. Chaque pas porte son retard en millisecondes dans
   `--e`, écrit dans le document.

> **`--e` compte depuis la disparition du rideau, PAS depuis la
> navigation.** `main.js` pose `compo-hero` **et** `compo-attend` dès qu'il
> s'exécute — les plaques sont donc déjà sur le texte quand les bandes
> s'écartent — puis retire `compo-attend` dans `finir()`. Une animation en
> pause n'avance pas son horloge : `--e:0` veut dire « dès que le rideau a
> disparu ».

**Les trois façons de rater cet enchaînement, toutes rencontrées :**

| Défaut | Symptôme | Correction |
|---|---|---|
| `--e` compté depuis la navigation (560→1470 ms) | les 3 premiers pas jouent **sous** le rideau opaque : **0 % visible** | `--e` relatif à l'ouverture |
| `compo-hero` posée **à** la fin du rideau | les bandes qui couvrent le titre partent 96 ms avant la dernière → le titre apparaît **nu**, puis se fait recouvrir : un **clignotement** | poser tôt, mettre en **pause** |
| pause posée par `animation-play-state` **avant** la déclaration `animation:` | le raccourci `animation` **remet `running`** → la pause n'agit jamais | `animation-play-state: … !important` |

Le mouvement de chaque pas :

- **V1 · DÉGAGER** — une plaque **opaque** (`--surface-0`) posée sur
  l'élément se retire vers la droite, `scaleX(1) → 0`, **420 ms**. L'arête
  découvre le texte de gauche à droite, dans le sens de lecture.
- **V2 · S'ALIGNER** — l'élément arrive décalé de **24 à 40 px sur la
  gauche** (`--he-x`) et se reprend en **560 ms**, courbe `--e-snap`,
  **aucun dépassement** (mesuré : min −40, max −0,02).
- **V3 · SOUDER** — le filet de chaque rangée de fiche se trace puis se
  ressoude, 340 ms + 600 ms.

Tempo : sur-titre 0 · titre L1 80 · **titre L2 360** (280 ms de décalage,
« net » au sens du brief) · sous-titre 580 · les 2 CTA 740 · fiche 820 à
1 240.

> **La plaque se retire, elle ne se fond pas — et ce n'est pas qu'une
> question de style.** Un `clip-path` ou une `opacity: 0` sur le titre le
> retire de la mesure du LCP. Une plaque **opaque posée dessus** ne change
> rien au texte : il est peint, entier, dès la première image. Mesuré :
> **LCP 124 ms**, élément `SPAN.plate-big`, **CLS 0**.

**Ce qui déclenche la séquence.** Elle **rejoue à chaque rechargement**. On
lit `performance.getEntriesByType("navigation")[0].type` : `navigate` et
`reload` la jouent, `back_forward` non.

> **Il n'y a plus AUCUN drapeau de session.**
> `sessionStorage["aped-entree-saut"]` a été supprimé. Il était posé par
> **n'importe quel** `pointerdown` ou `keydown` — donc par un clic sur un
> bouton du site, et par la touche F5 elle-même. Un seul geste pendant la
> première seconde, et la composition du hero n'existait plus **pour tout le
> reste de l'onglet**. Pire : `catch (e) { saute = true; }` faisait qu'en
> navigation privée stricte le site n'avait **jamais** de séquence. Sauter
> reste immédiat ; sauter ne se mémorise plus.

**L'allongement.** `html.entree-attend` met en pause la dernière tranche de
jauge, la remise de la plaque, l'ouverture du rideau **et** la composition,
jusqu'à `document.fonts.ready` et `#heroPlate.is-live`, plafonné à 2,5 s
depuis la navigation. `animation-play-state` est une **liste** : `running,
paused` retient la seconde animation sans retenir la première.

Sous mouvement réduit : monogramme net 520 ms, puis disparition d'un cran,
en `step-end` — donc sans script, et **`compo-hero` n'est jamais posée**.
Détail : `PHASE-9.md` § 1.

### 3.2 Les sept plaques — V2 · S'ALIGNER

Une **coque** (`.plaque`, la case de grille, que GSAP fait dériver) et un
**corps** (`.plaque-corps`, qui porte l'inclinaison écrite dans le
document). Deux boîtes, parce que GSAP écrit `rotate: none` sur tout élément
dont il prend les transformations en main.

- Angles de repos **2,1° à 4,2°** (× `--incl`). **Sous 2°, une inclinaison
  ne se perçoit pas** — constat mesuré, pas une opinion.
- Dérive au défilement : **121 à 220 px** d'amplitude selon `--v`
  (`course = 110 × v`, `js/langue.js`). 34 px sur 1 100 px de course, la
  valeur d'avant, faisait 3 % : invisible.
- Redressement **complet** au centre de l'écran : la coque tourne de
  `-reel` exactement, donc l'angle vu passe par **≈ 0,2°**. `-reel × 0.55`
  laissait 45 % de la pente en place.
- Profondeur par **filet 1 px décalé**, jamais par une ombre.
- **Les deux coefficients ne se valent pas.** `--incl` porte l'inclinaison,
  qui est la signature et ne coûte presque rien en largeur ; `--ecart` porte
  la translation, qui coûte sa valeur pleine et sort dans la gouttière. Sur
  téléphone : `--incl: 0.55`, `--ecart: 0.22`. À 64em :
  `padding-inline: 60px` sur la bande absorbe le débordement voulu.

**Ce qu'elles disent — et les deux règles d'admission du contenu.**

> **Ce qui ne fait pas grosse agence, malgré l'intuition : les chiffres de
> volume.** Nombre de clients, années d'existence, projets livrés. Sur un
> site qu'on ne connaît pas, personne ne les croit et personne ne peut les
> vérifier. **Ce qui fait grosse agence, c'est le STANDARD** : une maison
> qui affiche des engagements précis et chiffrés donne l'impression d'avoir
> des processus, et une maison qui a des processus est grosse dans la tête
> du visiteur.

Deux règles, **les deux éliminatoires** :

1. **Vraie et défendable si un client la conteste au téléphone.** Aucun
   chiffre inventé, aucun volume gonflé, aucune certification qu'on n'a pas.
   Chaque plaque est soutenue ailleurs dans le document, ou vérifiable par
   le visiteur en dix secondes. Dans le doute, on ne l'écrit pas.
2. **Comprise en trois secondes par un patron de garage.** Une affirmation
   vraie et techniquement impressionnante qui demande un décodage ne sert à
   rien. **Ce bloc parle la langue du client, pas celle du code.** Interdits
   ici : « décalage de mise en page », « requête tierce », « LCP », « WCAG »,
   « Core Web Vitals », « responsive ». C'est la raison pour laquelle une
   neuvième plaque « 0 · décalage de mise en page » a été refusée alors
   qu'elle était vraie et mesurée.

| # | Mot fort | Phrase | Ce qui la soutient |
|---|---|---|---|
| 1 | **12 h** | Le délai de réponse, jours ouvrables. Souvent moins. | affiché à cinq endroits du site |
| 2 | **Jour 5** | Les premières maquettes. Vous voyez avant qu'on code. | Agence, engagement 04, avec sa figure |
| 3 | **=** | Le chiffre du premier appel est celui de la facture. | Agence, engagement 01 (`Estimation = Facture`) |
| 4 | **1** | Interlocuteur, du premier appel à la mise en ligne. | Agence, `agc-faits` |
| 5 | **Tout** | Le code, l'hébergement, l'adresse web. Un autre peut reprendre demain. | Agence 03, FAQ, Parcours |
| 6 | **0** | Mouchard, traceur, service extérieur. Votre site ne dépend de personne. | aucune adresse externe dans le document |
| 7 | **7** | **Produits** : site, boutique, automatisation, logiciel, application, visite 360, vidéo. | Services, Secteurs, Visite 360, Calculateur |
| 8 | **Québec** | Conçu, codé et livré ici, du premier trait à la mise en ligne. | — |

**Quatre affirmations retirées le 2026-07-29 parce qu'elles étaient fausses
ou faibles — et corrigées PARTOUT, pas seulement dans le hero :**

| Retirée | Pourquoi | Où elle vivait aussi |
|---|---|---|
| « 60 s · Sans donner votre courriel » | FAUX : le courriel est requis pour recevoir l'estimation | — |
| « 1 h · De formation incluse au lancement » | pas offert | Services (liste 01), Parcours (étape 04), FAQ |
| « 0 · Abonnement obligatoire » | FAUX : l'hébergement a un coût récurrent | FAQ « Le site nous appartient à 100 % ? » |
| « 100 % · Du code vous appartient » | vrai mais plat | revient en plaque **Tout** |

Et « 0 · Sous-traitance. Vous parlez à la personne qui code » est devenue
« 1 · Interlocuteur » : **l'absence d'intermédiaire est un argument premium,
la mention du codeur unique dit la taille et pas le standard.**

> **Une fausseté dans la FAQ est plus grave que dans le hero.** Celui qui
> ouvre la FAQ est un prospect sérieux, et c'est celui-là qui la reproche au
> téléphone. Le périmètre d'un chantier ne justifie jamais de laisser une
> affirmation fausse en place ailleurs.
>
> La FAQ dit maintenant la vérité sur l'hébergement, **formulée comme une
> force** : le coût technique est réel, modeste, annoncé avant la signature
> et payable directement au fournisseur ; ce qui n'existe pas, c'est
> l'abonnement à l'agence qu'il faut payer pour garder l'accès à son propre
> site. L'ancienne version promettait l'impossible ; celle-ci nomme la seule
> chose qui compte pour le client.
>
> `node tools/accueil-check.mjs contenu` chasse les six énoncés retirés dans
> **tout** le texte rendu et doit rendre « aucun ». Il lit `textContent` et
> non `innerText` : les onze réponses de la FAQ vivent dans des `<details>`
> repliés, qu'`innerText` ne voit pas — c'est-à-dire exactement l'endroit où
> une fausseté fait le plus de dégâts.

> **« Métiers » est devenu « Produits » le 2026-07-30, et ce n'est pas
> un détail de vocabulaire.** Trois découpages de la même offre
> coexistaient sur un seul écran : quatre lignes de fiche technique,
> quatre chantiers de Services, sept « métiers » sur cette plaque. Le
> visiteur ne pouvait rapprocher aucune des trois listes. La fiche est
> maintenant **la même liste que Services** — mêmes noms, même ordre,
> mêmes délais — et cette plaque dit ce qu'elle compte : des produits,
> pas des chantiers. Deux listes de granularités différentes ne se
> contredisent pas ; deux listes qui prétendent compter la même chose,
> si. Détail : `AUDIT-VERACITE.md` E1, `DECISIONS-NUIT.md` D3.

### 3.2bis La boucle de vie des plaques — V2 · S'ALIGNER, arrêtée d'un V4 · CRAN

> **Un `scrub` n'a pas d'état de repos, mais il n'a pas non plus de
> mouvement propre : il n'avance que pendant qu'on défile.** Dès qu'on
> s'arrête pour lire, les huit plaques se figent. Personne ne l'avait
> vu, parce que toutes les mesures de dérive se prennent **en
> défilant** — l'instrument ne pouvait pas rendre le défaut qu'il
> fallait trouver.

Ajoutée le 2026-07-30. `css/app.css § 13bis` porte tout le mouvement ;
`js/langue.js` ne pose qu'une classe et un attribut.

- **Où elle vit.** Sur `.plaque-corps`, via les propriétés
  **individuelles** `translate` et `rotate` — jamais via `transform`,
  qui porte déjà la pose de repos sur cette même boîte. La chaîne CSS
  applique `translate`, puis `rotate`, puis `scale`, puis `transform` :
  la boucle se **compose** par-dessus la pose au lieu de l'écraser. Et
  GSAP ne touche jamais cette boîte — il anime la coque `.plaque` —
  donc son habitude d'écrire `rotate: none` ne peut pas l'atteindre.
  **Deux boîtes suffisent** ; une troisième aurait été la solution
  naïve.
- **Les verbes.** La dérive est **V2 · S'ALIGNER** : chaque cycle
  revient exactement à la pose écrite dans le document, chaque segment
  porte une courbe sinusoïdale sans dépassement. L'arrêt et la reprise
  sont **V4 · CRAN** : `animation-play-state: paused` gèle la valeur
  courante sans **aucune** interpolation. Il n'existe aucun état entre
  « ça bouge » et « c'est arrêté ».
- **Trois verrous.** Le survol d'**une** plaque arrête les **huit** —
  on survole pour lire, et une plaque immobile à côté de sept qui
  bougent est plus dure à lire qu'une bande entière arrêtée.
  `[data-repos]` quand la bande sort de l'écran
  (`IntersectionObserver`, marge de 200 px) et quand l'onglet est caché
  (`visibilitychange`). Les deux dernières causes partagent **un masque
  de bits**, pas deux drapeaux : le retour d'un onglet ne doit pas
  relancer une bande hors écran.
- **`!important` sur les règles de pause, et ce n'est pas une
  paresse.** `animation` est un raccourci : il remet
  `animation-play-state` à `running`. Ce piège a déjà rendu
  inopérantes la pause du rideau **et** celle de la composition du
  hero sans que rien ne le signale.
- **Elle tombe au palier 1**, avec la dérive. Une animation permanente
  est par définition le poste le plus cher du site : elle ne s'arrête
  jamais. Sur téléphone, les plaques restent inclinées, décalées et
  lisibles.

**Amplitudes mesurées** (`node tools/plaques-vie.mjs`, dix relevés) :
dérive verticale **8 à 24,5 px**, horizontale **4 à 13,4 px**,
battement **1,07° à 2,25°**, périodes **7 à 10,6 s** dérivées de `--v`,
huit retards négatifs distincts pour désynchroniser les phases — deux
plaques partagent `--v: 1` et bougeraient sinon comme une seule pièce.
Écarts de pixels entre deux captures consécutives : **11 à 14,7 %**.
Le rembourrage de la bande à 64em est passé de 60 à **76 px** pour
absorber la nouvelle course latérale.

> **La mesure qui décide est LOCALE, pas absolue.** Une position
> absolue mélange trois choses : la boucle, la dérive au défilement, et
> la recomposition du document par `content-visibility`. Le relevé
> « hors écran » rendait 2 078 px d'amplitude sur une bande à l'arrêt.
> `corps − coque` ne contient que ce que la boucle a écrit.
>
> **Et `getComputedStyle(el).transform` NE CONTIENT PAS la boucle** :
> la pose de repos vit dans `transform`, la boucle dans `translate` et
> `rotate`. Une sonde qui ne lit que la première rend `dangle 0°` sur
> les huit plaques et fait chercher un défaut qui n'existe pas.

### 3.3 Les deux CTA — V4 · CRAN

`--cran: 520ms` sur les deux : à 230 ms, le libellé du secondaire faisait
10,5 ms par lettre, **plus court qu'une image à 60 Hz**, donc un effet
invisible. Mesuré au 2026-07-30 : 21,7 ms par lettre, contraste minimal
**4,70:1** pendant la transition, aller et retour.

> **Le libellé est « Estimation en six questions », plus « en 60
> secondes ».** Le parcours compte six questions **plus** une étape où
> le nom et le courriel sont obligatoires ; soixante secondes se
> mesurent au chronomètre, et le site chiffre déjà son autre formulaire
> « 7 étapes · 4 minutes ». « Six questions » est vrai, se vérifie en
> comptant, et c'est ce que dit déjà la carte Contact. Corrigé aux
> **cinq** endroits, y compris la balise `<meta name="description">` —
> voir la règle de propagation en § 0.A.

La hiérarchie est portée par la **matière** : le primaire (minium) garde
l'inversion complète vers l'encre, le secondaire reçoit **l'arête minium**.

> **L'aplat qui balaye ne dépend plus de JavaScript.** Il vivait sur
> `.btn[data-lettres]::before`, et `data-lettres` est posé par `langue.js`,
> c'est-à-dire par la **vague 2** — qui n'arrive qu'au premier geste ou à
> 1,2 s et **ne s'exécute pas du tout sous mouvement réduit**. Un visiteur
> en mouvement réduit voyait deux boutons qui ne répondent pas.
> `.hero-cta .btn::before` est donc inconditionnel ; seule la **cascade par
> lettre** reste conditionnelle, parce que sans `--p` toutes les lettres
> basculeraient ensemble et rouvriraient la fenêtre de contraste que la
> phase 8 avait fermée. Sans découpage, le libellé bascule **en une image, à
> mi-course** — l'arête est alors passée sous le milieu du mot et les deux
> états tiennent leur contraste. Sous mouvement réduit, `--cran: 0ms` : ce
> n'est plus un balayage, c'est un cran.

---

## 4 · Le budget de dégradation — trois paliers

Le site est développé sur une machine de bureau. Un téléphone d'entrée de
gamme a un budget de peinture sans commune mesure. L'ordre dans lequel les
animations tombent est **écrit avant d'en avoir besoin**.

**Principe unique :** ce qui tombe en premier est ce qui coûte le plus pour
ce qu'il apporte le moins. L'ordre de chute est l'inverse exact de la
hiérarchie N1/N2/N3.

`js/langue.js` pose `data-palier` sur `<html>`. Le JS décide de ne pas
créer ; le CSS (`:root[data-palier="…"]`) désactive ce qui n'a jamais eu
besoin de JS.

| Palier | Déclencheur | Ce qui tombe |
|---|---|---|
| **0 · plein** | rien | — |
| **1 · allégé** | **statique**, connu à l'init : largeur < 64em **OU** `pointer: coarse` **OU** `hardwareConcurrency` ≤ 4 **OU** `deviceMemory` ≤ 4 | 1. parallaxe souris de la vitrine · 2. vitesses différenciées des fiches · **2bis. la dérive des huit plaques — elles restent inclinées, décalées et lisibles** · **2ter. la BOUCLE DE VIE des huit plaques : une animation permanente est le poste le plus cher du site, elle ne s'arrête jamais** · 3. étiquette de la pointe · 4. flèche qui sort du cadre · **5. découpage par mot des chapôs — le poste le plus cher à l'image** · 6. balayage des 25 sous-titres · **6bis. la trame des frontières → l'arête de règle d'avant** |
| **2 · minimal** | **mesuré** : fréquence d'images médiane **< 50 i/s** sur 90 images d'un défilement réel | 7. cascade par lettre → `--cran: 0ms` · 8. recomposition des secteurs → changement net · 9. soudure des filets · 10. FLIP de la FAQ → saut natif · 11. dégagement des modales · **12. G4 et G3 — la frontière reste lisible : filet, numéro, nom** |
| **3 · aucun** | `prefers-reduced-motion` | `langue.js` et `motion.js` ne s'exécutent pas |

**JAMAIS SACRIFIÉ, À AUCUN PALIER** — parce que tout ça vit dans `main.js`,
qui s'exécute toujours, ou en CSS inconditionnel : curseur du rail,
odomètres, filet de section active, barre de lecture, compteur des
chantiers, étape du parcours, jauge des cadres de projet, filet de la
question dépliée, filet de validation de champ, **le cran des douze
frontières**, **et l'inversion des deux CTA du hero**.
**L'orientation n'est pas un budget, c'est un plancher.**

**L'escalade est à sens unique.** Un palier ne redescend jamais : une page
qui réactive ses animations dès que la machine respire produit un
scintillement pire que le problème qu'elle corrige. Vérifié par
`node tools/palier-check.mjs`, qui teste les trois paliers par leur
déclencheur réel — dont le palier 2 **en bridant vraiment le processeur** via
le protocole DevTools.

### Hiérarchie de mouvement — N1 / N2 / N3

| Niveau | Rôle | Budget |
|---|---|---|
| **N1 · ORIENTATION** | Dit où on est et où on va | **Jamais sacrifié** |
| **N2 · SIGNATURE** | Déclinaisons de la limaille, moments de preuve | 1 à 2 par section |
| **N3 · DÉCORATION** | Le reste | N'existe que s'il ne nuit pas à N1 |

Un seul foyer d'attention par écran. Test à passer : un patron de PME de
55 ans qui défile doit toujours savoir dans quelle section il est et combien
il en reste.

---

## 5 · Identité visuelle et interdits

**Trois matières, et rien d'autre : ciment, encre, minium.**
Jetons dans `css/tokens.css`.

**Interdits absolus, sans exception :**

- **rayon 0** — aucun coin arrondi, nulle part ;
- **aucune ombre portée** — la profondeur est un **filet de 1 px décalé** ;
- **aucun dégradé** — sauf les trames `repeating-linear-gradient` de la
  signature, qui sont des grains, pas un fondu ;
- **aucun flou** — ni `blur`, ni `backdrop-filter` ;
- **aucun prix, nulle part** — vérifié par `node tools/prix-check.mjs`, qui
  relève tout montant en dollars **dans la source et dans le texte rendu**.
  Le chiffre du calculateur est un montant d'**économies estimées**, pas un
  prix ;
- **aucune requête tierce** ;
- **rien qui ne se réclame pas d'un des quatre verbes** ;
- **`prefers-reduced-motion` respecté sans jamais faire perdre ni inverser
  une information.**

### Politique d'accent

> **Le minium est la matière dont APED est fait.** Il apparaît une fois en
> pleine masse, au hero, comme le bloc de matière brute. Ensuite il ne
> revient que là où le visiteur peut **agir** sur cette matière : le CTA
> primaire, l'index actif, le chiffre du calculateur, le filet de la section
> active.

Le petit mot du hero est déjà en encre dominante : la descente vers l'encre
commence dans le hero même. Ce n'est pas qu'esthétique — l'encre sur ciment
donne **13,89:1** contre **5,74:1** pour le minium, et c'est le petit mot qui
a le plus besoin de contraste.

---

## 6 · Cinq règles de structure à ne pas casser

**0. `css/app.css` est la SEULE source. `critique.css` et `differe.css` sont
fabriqués.**
`node tools/css-critique.mjs` les régénère. Éditer l'un des deux
directement, c'est écrire du CSS qui disparaîtra au prochain build. Après
toute modification : régénérer, puis `node tools/cascade-check.mjs` — il
compare 44 propriétés calculées sur tous les éléments, feuille découpée
contre feuille entière, et il doit rendre **0 écart**. Un découpage inverse
l'ordre de cascade entre deux règles de même spécificité : c'est arrivé une
fois, sur la tuile principale du contact.

> **`differe.css` est injecté par JavaScript.** Toute règle qui y atterrit
> ne s'applique qu'après deux `requestAnimationFrame` **plus** le
> chargement de la feuille, et une `animation-delay` ne court qu'à partir de
> là. Mesuré : un décalage **constant de +223 ms** sur les onze pas de la
> composition du hero, assez pour les faire passer sous le rideau.
> **Une animation de CHARGEMENT ne peut pas vivre dans une feuille
> différée.** Les classes concernées sont déclarées critiques dans la liste
> `CRITIQUES` de `tools/css-critique.mjs` — `he`, `compo-hero`,
> `compo-attend`, `ligne` en font partie.

**0bis. Aucun état de départ d'animation dans le CSS.**
`html.js .rise { opacity: 0 }` a été retiré. L'état de repos est toujours la
forme FINALE ; c'est `js/motion.js` qui pose l'état de départ, avec
`immediateRender: false`. Trois raisons : du contenu ne doit jamais rester
invisible en attendant un script, un élément à opacité nulle n'est pas
candidat au LCP, et c'est ce qui permet de différer les 112 Ko de GSAP.
*Exception assumée et bornée :* les onze pas de `compo-hero`, qui ne sont
**rendus que si la séquence joue** et qui posent une plaque **par-dessus** un
texte déjà peint — jamais une opacité, jamais un `clip-path`.

**0ter. L'orientation ne vit jamais dans `motion.js` ni dans `langue.js`.**
Ces deux fichiers s'arrêtent net sous `prefers-reduced-motion`. Tout ce qui
répond à « où je suis, combien il en reste » vit dans `main.js`. Sous
mouvement réduit le chiffre reste, seul le roulement disparaît.

**1. Les scripts sont injectés APRÈS le premier rendu, en DEUX vagues.**
Vague 1 : `limaille`, `main`, `hero` — la matière et l'usage. Vague 2, à la
première interaction ou à 1,2 s : GSAP, ScrollTrigger, `motion`, `langue`,
`pointe`, `tour360` — la chorégraphie.
`index.html` ne contient plus de `<script defer>` : un bloc en ligne injecte
les huit fichiers après deux `requestAnimationFrame`, avec `async = false`
pour garantir l'ordre. Raison mesurée : en `defer`, l'analyse du document
plus l'évaluation des 112 Ko de GSAP formaient une tâche de 222 ms **avant**
que le navigateur ait l'occasion de peindre, et le LCP tombait à 588 ms.
**Corollaire : rien de ce qui est nécessaire à la LECTURE ne doit dépendre
du JavaScript** — et un état de survol est nécessaire à l'usage.

**2. La mesure vit dans `tools/`.** Voir § 7.

---

## 7 · Les outils de mesure

`node tools/serve.mjs 8099` d'abord, puis :

| Outil | Ce qu'il rend |
|---|---|
| `accueil-check.mjs [mode]` | l'accueil en huit relevés : `contenu` · `entree` (les onze pas, **avec le % réellement visible**) · `boutons` · `plaques` · `derive` · `tenue` (i/s, LCP, CLS) · `cadre` (débordement à 11 largeurs, console) · **`sequences`** (les six suites de captures + écarts de pixels + cinq rechargements) |
| **`plaques-vie.mjs`** | la boucle de vie en **dix relevés**, un par promesse du brief : existe · **visible** (six captures d'un cadre fixe + écarts + déplacement réel) · survol · **franc** (image par image après l'entrée du curseur) · reprise · hors-écran · **onglet caché, en deux verdicts séparés** · lisible (texte réellement recouvert par `elementFromPoint`, contraste à 12 phases tirées au hasard) · tenue (i/s boucle **et** défilement) · mouvement réduit |
| **`formulaires-e2e.mjs`** | la chaîne des six formulaires **de bout en bout** : l'état réel du service d'envoi, relevé et non supposé ; le repli `mailto:` par formulaire, avec **les réponses tapées retrouvées dans le corps du message** ; et les deux guides obtenus **sans donner de courriel** |
| `diag-accueil.mjs` · `diag-accueil2.mjs` | le diagnostic : rideau et composition sur la même ligne de temps, verrou de session, boutons par palier |
| `_png.mjs` | décodeur PNG + `diffStats` — le socle du critère « visible » |
| `cascade-check.mjs` | **0 écart** obligatoire après toute régénération du CSS |
| `theme-check.mjs` | parité clair/sombre, contrastes, débordement, captures 12 sections × 2 thèmes × 5 largeurs |
| `deborde.mjs` | contenu **coupé** par un `overflow`, à 9 largeurs |
| `prix-check.mjs` | tout montant en dollars, source **et** texte rendu |
| `palier-check.mjs` | les trois paliers par leur déclencheur réel, palier 2 en **bridant le processeur** |
| `contraste-survol.mjs` | contraste **pendant** une transition, image par image, aller ET retour |
| `contraste-arret.mjs` | contraste **à l'arrêt**, à N positions de défilement |
| `entree-check.mjs` | les huit garanties de la séquence d'entrée, dont l'allongement, prouvé en **coupant la promesse des polices** |
| `frontieres-check.mjs` · `trame-check.mjs` | les douze frontières · les voiles de passage |
| `traversee-check.mjs` · `tache-traversee.mjs` | planche de 24 vues + i/s · temps en tâche longue, en **différences appariées** |
| `langue-check.mjs` · `etats-check.mjs` | les quatre verbes dans le document rendu · les onze micro-états |
| `verif.mjs` · `audit.mjs` · `perf-probe.mjs` | clavier, orientation, LCP, contrastes |
| `secteur-morph-check.mjs` · `cls-source.mjs` | recomposition nette au pixel · attribution de chaque décalage |
| `ab-accueil.mjs` · `ab-phase8.mjs` | A/B contre une copie de la version d'avant sur un second port, **passes alternées** |
| `refs-*.mjs` | mesurent les références dans un vrai navigateur (voir `RECHERCHE-ACCUEIL.md`) |
| `pdf.mjs` · `couvertures.mjs` | les deux documents et leurs couvertures |
| `cadeau-check.mjs` · `cadeau-scene.mjs` · `cadeau-e2e.mjs` | déclenchement et contenu · l'entrée est une arête · le parcours complet |

### Deux règles de mesure, apprises à la dure

**Ne jamais comparer deux médianes calculées sur une série qui dérive.**
Relevé du 2026-07-26, **code inchangé**, neuf passes :
`167, 0, 0, 0, 108, 942, 962, 981, 658 ms`. La machine dérive d'un facteur
six entre la première passe et la dernière. Il faut mesurer les deux
versions **dans la même passe** et prendre la médiane des **différences** ;
la dérive s'annule alors d'elle-même.

**Ne jamais conclure sur un maximum.** « La pire tâche » est la statistique
la plus instable qui soit : une interruption du système la triple, et elle
ne bouge pas si dix tâches moyennes apparaissent. On mesure le **total** et
le **nombre**, qui s'additionnent au lieu de se remplacer.

Toute mesure de performance doit être reprise **machine au repos**, et une
mesure de « régression » n'a de sens qu'en **A/B sur la même machine**. Les
chiffres d'une phase antérieure ne sont pas une référence : la phase 6
annonçait 112 ms de LCP, le même code mesuré en phase 7 en donnait 196.

### LA RÈGLE DU SCRUB

Une animation `scrub` **n'a pas d'état de repos** : elle a l'état où le
visiteur s'est arrêté. Chaque position de défilement est donc un état
**permanent** possible. **Il est interdit de scrubber l'opacité — ou toute
propriété qui touche à la lisibilité — d'un élément qui porte du texte.**
Mesure du 2026-07-26 : les mots des chapôs, scrubbés, restaient à 0,39
d'opacité (~1,5:1) avec le paragraphe à 64 % de la hauteur d'écran. La
référence primée `fullstack-studio` commet exactement cette faute, mesurée à
0,15 d'opacité sur un paragraphe entièrement lisible
(`RECHERCHE-ACCUEIL.md`). Le scrub reste permis sur ce qui ne peut rendre
aucun texte illisible — un `translateY` borné, une `scaleX` de filet.

---

## 8 · Les pièges d'instrument — ne pas les réintroduire

Chacun a produit un faux verdict avant d'être trouvé.

**Mesure et capture**

1. **Une capture d'écran est plus lente qu'une transition** (30-50 ms contre
   16,7 ms). On lit les valeurs **dans la page** pour les chiffres ; les
   images ne servent qu'à montrer.
2. **Un cadrage de capture se RELÈVE, il ne se devine pas.** Un cadre posé à
   `y = 300` photographiait la plaque de limaille au lieu du titre, 180 px
   plus haut, et rendait une suite d'images qui bougent — mais pas celles
   qu'on croit.
3. **Deux images de tailles différentes rendent 100 % d'écart**, un chiffre
   qui ne veut rien dire. Le cadre d'une suite doit être **fixe**.
4. **`content-visibility: auto` fait mentir `getBoundingClientRect()`** :
   hors écran il rend la taille *réservée*. Traverser la page entièrement
   avant de mesurer, **remesurer chaque cible juste avant de la capturer**,
   et lever la propriété pour relever une hauteur réelle.
5. **Un `scrollTo` qui saute casse un pin de ScrollTrigger.** Défiler par
   pas, comme un visiteur.
6. **`color-mix()` calcule en `color(srgb 0.67 …)`, pas en `rgb()`.** Lu
   comme du 0-255, tout texte en `color-mix` ressort à 1,11:1 — quatorze
   faux échecs de contraste, dont onze sur du code intact.
7. **Une fenêtre d'odomètre rogne exprès** (`.seuil-num`, `.entree-cran`), et
   un objet rogné exprès n'a pas de contraste.
8. **Une analyse de pixels confond l'anticrénelage** et l'arête d'un aplat
   avec du texte illisible.
9. **Un détecteur qui n'attend pas assez confond « animation en vol » et
   « texte échoué ».** Une capture d'écran est aussi plus lente qu'une
   animation d'entrée : le popup photographié sans attente apparaît coupé au
   milieu de son arête.
10. **Un détecteur de piège de tabulation doit identifier les éléments par
    leur identité**, pas par `sélecteur + texte`.
11. **Une page d'impression peut écraser son corps sans grandir**, donc
    mesurer la `.page` seule ne prouve rien.
12. **Un `ScrollTrigger` en `once` se TUE après avoir joué** : toute sonde
    qui traverse la page avant de mesurer photographie la fin.
13. **Une sonde posée au `document_start` n'a pas encore
    `document.documentElement`** : elle lève, et la boucle `rAF` n'est jamais
    programmée. Protéger chaque tour ET programmer le suivant quoi qu'il
    arrive.
14. **Une sonde peut être plus RAPIDE que la page** : chercher naïvement la
    première image où un filet est plein renvoie l'image zéro, où
    l'animation n'est pas encore attachée.
15. **Un détecteur de débordement doit distinguer ce qui rogne exprès.**

**CSS et JS**

16. **`animation` est un RACCOURCI : il remet `animation-play-state` à
    `running`.** Une règle de pause placée **avant** la déclaration, à
    spécificité égale, ne fait rien. Elle doit porter `!important` ou venir
    après. Ce défaut a rendu la pause du rideau **et** celle de la
    composition inopérantes sans que rien ne le signale.
17. **Un test peut VERROUILLER le défaut.** `entree-check` affirmait
    « session déjà vue → pas de rideau » ; `cadeau-check` affirmait « il ne
    s'ouvre qu'une fois par personne » ; `accueil-check entree` mesurait
    onze durées justes sans jamais regarder si un rideau opaque était
    devant. **Quand on corrige un défaut, lire le test qui le couvrait — s'il
    passe encore sans modification, c'est lui le problème.**
18. **Le popup cadeau bloque les outils.** Poser
    `sessionStorage["aped-sans-popup"] = "1"` dans tout outil qui clique : un
    `<dialog>` ouvert par `showModal()` capture **tous** les événements de
    pointeur et fait expirer n'importe quel survol en accusant le mauvais
    coupable.
19. **Un A/B se fait en worktree, pas en `stash`** : le CSS fabriqué fait
    échouer le `stash pop`. Tuer le serveur avant de retirer le worktree.
    Les outils prennent une **adresse complète**, pas un numéro de port :
    `node tools/contraste-arret.mjs http://localhost:8098`.

**Ajoutés le 2026-07-30 — cinq faux verdicts, tous payés en une nuit**

20. **`getComputedStyle(el).transform` ne contient pas les propriétés
    individuelles.** `translate`, `rotate` et `scale` sont trois
    propriétés distinctes qui se **composent** avec `transform`. Une
    sonde qui ne lit que `transform` a rendu `dangle 0°` sur les huit
    plaques alors que la rotation tournait : elle lisait la pose de
    repos et ignorait la boucle.
21. **Une amplitude ABSOLUE mélange trois mouvements.** La boucle, la
    dérive au défilement, et la recomposition du document par
    `content-visibility`. Relevé « hors écran » : 2 078 px d'amplitude
    sur une bande dont l'animation était `paused`. Deux affirmations
    contradictoires dans le même relevé, donc au moins une fausse. Il
    faut mesurer **enfant moins parent**.
22. **Le rectangle englobant d'un élément TOURNÉ est plus grand que
    l'élément.** Compter les intersections d'englobants sur des plaques
    inclinées de 4°, c'est compter des chevauchements qui n'existent pas
    à l'écran. Ce qui décide est l'**occultation** :
    `elementFromPoint` au centre du texte doit rendre un nœud de cette
    plaque-là. Et il faut une **base de comparaison au repos** : la
    composition décale déjà certaines plaques de 48 px dans la colonne
    voisine.
23. **Un nombre FIXE de tabulations ne mesure pas un piège de focus.**
    `cadeau-check` pressait six fois Tab puis demandait « le focus est-il
    dans le dialogue ? ». Deux liens ajoutés, et la sixième tabulation
    est tombée pile sur l'étape où Chromium fait transiter le focus par
    sa propre barre. Verdict rendu : « le focus s'échappe » — faux. Ce
    qui se mesure est la **propriété** : aucun élément de la page
    derrière la modale ne reçoit le focus, et le cycle revient dedans.
24. **Une fenêtre d'observation trop courte cache le mouvement le plus
    lent.** Quatre poses sur 750 ms rendaient « 7 plaques sur 8
    bougent » : la huitième, la plus lente et la plus plate près de ses
    extrémums, rendait moins de 2 px. La fenêtre doit couvrir au moins
    une demi-période de l'élément le plus lent — ici 10,6 s.

---

## 9 · Chiffres de référence — mesurés, pas estimés

État du **2026-07-29**, section `#top`, 1440 × 900, thème clair :

| Mesure | Valeur | Seuil |
|---|---|---|
| LCP | **84 · 92 · 112 ms** sur trois passes (`SPAN.plate-big`) | < 300 ms |
| CLS | **0** | 0 |
| i/s médiane, traversée de l'accueil | **59,9** | 60 |
| images > 20 ms | **0** | 0 |
| débordement horizontal, 9 largeurs | **aucun** | aucun |
| erreurs console, 11 largeurs | **0** | 0 |
| écart de cascade, découpée vs entière | **0** sur 254 496 propriétés | 0 |
| pas de composition visibles | **11 / 11 à 100 %** | 100 % |
| dérive des plaques au défilement | **121 à 220 px**, redressement à ≈ 0,2° | perceptible |
| **boucle de vie, dérive** | **8 à 24,5 px** vertical · **4 à 13,4 px** horizontal | perceptible |
| **boucle de vie, battement** | **1,07° à 2,25°** | > 2° au plus fort |
| **boucle de vie, écarts de pixels** | **11 à 14,7 %** entre deux captures | > 1 % |
| **i/s, boucle ET défilement en même temps** | **59,9** · 0 image > 20 ms | 60 |
| **texte sous 4,5:1 à l'arrêt, 61 positions** | **0** (était 8) | 0 |
| **fenêtre illisible au survol, aller et retour** | **aucune** | aucune |
| **formulaires qui livrent** | **6 / 6**, par le repli `mailto:` | 6 / 6 |
| échecs de contraste, 12 sections × 2 thèmes × 5 largeurs | **0** | 0 |
| arrêts au clavier, sans anneau de focus | **0 sur 100** | 0 |

**Section 02 · Services, après refonte du 2026-07-30** (`node tools/services-check.mjs`) :

| Mesure | Avant | Après |
|---|---|---|
| chantiers lisibles **sans un clic** | **1 / 4** | **4 / 4** |
| saut de la scène à l'arrivée par ancre | **275 à 280 px** | **0 px** |
| écart du `start` du pin selon le chemin d'arrivée | **284 px**, 10 fois sur 10 | plus de pin |
| rechargement sur `#services`, dix fois | saut à chaque fois | **0 px, 10 / 10** |
| déplacement de la carte cliquée à l'ouverture | — | **0 px** (la position de lecture ne bouge pas) |
| contenu de maquette coupé, 9 largeurs × 2 états | 84 à 93 px | **0** |
| débordement horizontal, 11 largeurs (320→1920), toutes fiches ouvertes | — | **aucun** |
| clavier : arrêts sans anneau de focus | — | **0** |
| **sans JavaScript** : chantiers visibles · titres · points dans le document | — | **4 · 4 · 18** |
| LCP · CLS | — | **104 · 104 · 116 ms** · **0** |
| i/s traversée · images > 20 ms | — | **59,5** · **0** |
| animations prouvées visibles (≥ 5 captures + écarts de pixels) | — | **4 / 4** — entrée 4,1-8,4 % · survol 0,9-3,5 % · ouverture 10,2-25,4 % · fermeture 9,5-18,7 % |
| débordement de la plaque « Québec » sur le seuil de la 02 | **28 à 38 px** | **marge de 10 à 20 px** |

**Seuils de perception, issus de `RECHERCHE-ACCUEIL.md` :**

- décalage entre deux éléments : **40 ms** pour que l'ordre devienne
  conscient ; plancher absolu **16,7 ms** = une image à 60 Hz ;
- une révélation de titre ne se mesure pas en pixels de déplacement mais en
  **recouvrement** : la référence balaye **100 % de la largeur de la ligne**
  avec **0 px** de translation verticale ;
- inversion de CTA : **≈ 200 ms** aller et retour, texte basculé **en une
  image** — mais la référence bascule **trop tôt** et tombe à 1,03:1 pendant
  117 ms ; on bascule à mi-course ;
- alignement : **24-32 px** latéraux, **520 ms**, dépassement **0,00 px**.

### ⚠ CE QUI N'A JAMAIS ÉTÉ VÉRIFIÉ — À NE PAS OUBLIER

> **AUCUNE de ces mesures n'a été prise sur un appareil réel.**
>
> Tout ce qui est écrit dans ce fichier — LCP, i/s, contrastes, paliers,
> débordement, séquences — vient de **Chromium piloté par Playwright sur
> une machine de bureau Windows**. Y compris les relevés « téléphone » :
> 390 px de large avec `pointer: coarse` émulé n'est **pas** un téléphone.

Ce que l'émulation **ne peut pas** dire, et que personne ne sait donc encore
sur ce site :

- le **budget de peinture réel** d'un téléphone d'entrée de gamme — c'est
  toute la raison d'être des trois paliers, et le palier 2 n'a jamais été
  déclenché autrement qu'en bridant artificiellement le processeur ;
- le comportement de **Safari iOS**, qui n'est pas Chromium : `content-visibility`,
  `animation-play-state`, `clip-path`, `@property`, la barre d'adresse qui
  se rétracte et fait bouger `100vh` ;
- le **toucher réel** : cibles de 44 px, défilement à inertie, `:hover`
  fantôme qui reste collé après un tap ;
- la **lisibilité en plein soleil**, et le rendu des trois matières sur une
  dalle OLED calibrée autrement ;
- le **réseau mobile** : tout est mesuré en local, sur `localhost` ;
- **la pause de la boucle des plaques quand l'onglet est caché.**
  Ajouté le 2026-07-30. Le code réagit correctement — prouvé au pixel en
  forçant `document.hidden` et en émettant `visibilitychange` — mais
  **Chromium sous Playwright ne modélise pas la visibilité d'un
  onglet** : `document.hidden` reste `false` avec un second onglet au
  premier plan, sans tête comme avec tête, et
  `Page.setWebLifecycleState` rejette `hidden`. `plaques-vie.mjs § 7`
  rend donc **deux verdicts séparés** et refuse de les fondre en un
  seul. Ce verrou-là se vérifie à la main : ouvrir le site, aller aux
  plaques, changer d'onglet dix secondes, revenir.

**Ce n'est pas une réserve de style, c'est un trou dans la preuve.** La
règle « visible, sinon ça ne compte pas » n'a été appliquée que sur un
écran de bureau. Le propriétaire s'en charge de son côté ; en attendant,
**aucune session ne doit écrire « vérifié sur mobile »** — ni le laisser
entendre — tant que cette ligne est encore ici. Quand un vrai appareil aura
été passé, remplacer ce bloc par ce qui a été mesuré, sur quel modèle, quelle
version d'OS et quelle date.

---

## 10 · Design stack

### Règle globale

**Jamais plus de 2 à 3 skills chargés sur une même tâche.** Un skill de
direction artistique + un skill d'implémentation + au maximum un skill
d'audit. Si un quatrième semble pertinent, la tâche doit être découpée.

### Niveau 1 — cœur (se déclenchent automatiquement)

| # | Skill | Rôle |
|---|-------|------|
| 1 | `design-taste-frontend` | direction artistique, anti-slop |
| 2 | `redesign-existing-projects` | audit du code existant avant modification |
| 3 | `gsap-scrolltrigger` | animation scroll, timelines, pinning, parallax |
| 4 | `web-design-guidelines` | audit a11y / perf / UX du code produit |
| 5 | `playwright` (MCP) | vérification live, arbre d'accessibilité, clavier, captures |

### Ordre d'application obligatoire

```
1. AUDIT        → redesign-existing-projects   (si le code existe déjà)
2. DIRECTION    → design-taste-frontend        (décider AVANT d'écrire du CSS)
3. IMPLÉM.      → code + gsap-scrolltrigger si mouvement
4. AUDIT SORTIE → web-design-guidelines
5. VÉRIF LIVE   → playwright
```

La direction artistique se décide **avant** l'implémentation. L'audit vient
**après**. Ne jamais inverser : auditer un design pas encore choisi ne
produit rien.

### Niveau 2 — sur demande explicite

`ui-ux-pro-max` (« consulte ui-ux-pro-max pour la palette / le font
pairing ») · `locomotive-scroll` · `full-output-enforcement`.

`ui-ux-pro-max` est traité comme une **base de données de référence**, pas
comme un skill de direction. Il ne décide rien.

### Blocage préalable (AVANT toute table de routage)

Sur une tâche d'implémentation frontend, ne se chargent **jamais** :

- les 41 skills marketing (`page-cro`, `pricing-strategy`, `seo-audit`,
  `copywriting`, …) — sauf si la demande porte explicitement sur du
  **contenu, de la conversion ou de l'acquisition** ;
- `ui-ux-pro-max`, sauf invocation explicite ;
- `motion-dev-animations` et `vercel-react-best-practices` : projet sans
  React ;
- `lottie-animations`, sauf JSON After Effects réellement fourni.

Mots-pièges : « tarification » n'appelle pas `pricing-strategy` s'il s'agit
d'intégrer un composant ; « audit » n'appelle pas `seo-audit` s'il s'agit
d'accessibilité ; « landing page » n'appelle pas `page-cro` s'il s'agit de
design.

### Résolution de conflits

1. **Direction vs base de styles** → `design-taste-frontend` gagne sur
   `ui-ux-pro-max`. Le premier raisonne à partir du brief et impose une
   direction ; le second propose 50+ styles sans arbitrer, ce qui produit du
   templating.
2. **Direction vs audit** → en conception, `design-taste-frontend` ; en
   relecture, `web-design-guidelines`, **y compris s'il faut casser un choix
   esthétique** (contraste insuffisant, cible tactile < 44 px,
   `prefers-reduced-motion` absent). L'accessibilité n'est pas négociable.
3. **GSAP vs Motion.dev** → `gsap-scrolltrigger`, toujours : site vanilla.
4. **Deux skills de scroll** → `gsap-scrolltrigger` pilote ;
   `locomotive-scroll` ne gère que l'inertie, sur demande. Jamais les deux
   sur les mêmes éléments.
5. **Navigateur** → `playwright` pour tout : c'est le seul qui donne l'arbre
   a11y et pas seulement des pixels. `chrome-devtools` est **abandonné** :
   ses captures expirent systématiquement après 120 s sur ce poste. Ne pas
   le réinstaller. `claude-in-chrome` reste disponible pour piloter le
   navigateur réel, mais n'est pas l'outil de vérification par défaut.
   **Playwright est aussi en dépendance locale** : un script `.mjs` lancé
   avec `node` depuis la racine rend un JSON de mesures **en plus** des PNG.
   C'est la voie à privilégier pour tout ce qui doit MESURER.

---

## 11 · MCP

| Serveur | Usage | État |
|---------|-------|------|
| `shadcn` (`.mcp.json`) | chercher, lire et **adapter** des composants | à approuver au lancement |
| `playwright` | vérification live, arbre a11y, clavier, captures, mesures | connecté |

Chromium pour Playwright est installé (`npx playwright install chromium`).

Registries actifs dans `components.json` : `@magic-ui`, `@aceternity`,
`@kokonutui`, `@kibo-ui`.

`@unlumen-ui` n'est **pas** activé : licence requise, `UNLUMEN_LICENSE_KEY`
absente. Bloc à coller dans `registries` le jour où la clé existe :

```json
"@unlumen-ui": {
  "url": "https://ui.unlumen.com/r/{name}.json",
  "headers": { "Authorization": "Bearer ${UNLUMEN_LICENSE_KEY}" }
}
```

`components.json` cible un projet React + Tailwind : sur ce site vanilla,
`shadcn add` n'écrira **pas** du code utilisable sans portage manuel en
HTML/CSS.

---

## 12 · Décisions prises, et pourquoi

| Décision | Raison |
|---|---|
| Pas de grille de prix publiée | aucun projet ne ressemble au précédent ; une grille publiée finit toujours par mentir. Le chiffre ferme est dit au premier appel, et c'est celui de la facture |
| Préavis de réservation à **24 h** | ce n'est pas un délai de réponse (12 h), c'est un préavis minimum de réservation. Les deux ne sont pas la même chose |
| Rail horizontal aux Services, pas une roue | sur un cercle il n'y a ni début ni fin, donc plus aucune réponse honnête à « combien il en reste » — du N1 sacrifié pour du N3 |
| Section Référence sombre dans les deux thèmes | en `--surface-inverse`, elle donnait un aplat **clair** au milieu d'un site sombre |
| Grille de commissions retirée | le montant qui attire est le **plafond**, pas le barème — et un barème par tranche publie notre structure de prix en creux |
| Pas de compteur `data-count` sur les plaques | l'état de repos était alors le texte « 0 », donc « 0 · Du code vous appartient ». Écrire le contraire de ce qu'on affirme est un mensonge |
| `startViewTransition` abandonné | c'est un **fondu**, donc hors langue. Remplacé par la trame |
| Les délais de la fiche technique sont des délais de **production** | la date de démarrage dépend de la liste d'attente. Confondre les deux, c'est soit mentir, soit s'excuser ; les séparer donne une raison d'appeler tout de suite |

---

## 13 · Ce qui reste ouvert

- **`<footer class="footer">` est imbriqué dans `<main class="shell">`** —
  un `<footer>` descendant de `<main>` perd son rôle `contentinfo` dans
  l'arbre d'accessibilité. Le déplacer n'est pas trivial : le seuil du pied
  est collé juste au-dessus. Voir `ARCHITECTURE.md`.
- **`[data-settle]` et `[data-count]` n'ont plus aucune cible** —
  `motion.js` blocs 5 et 11 tournent à vide. Voir `SECTIONS.md`.
- **`@keyframes cadeau-degage` est défini deux fois** (`app.css` 1652 et
  5324, contenus différents). Voir `ANIMATIONS.md`.
- **`404.html` charge `css/app.css` en entier**, seul endroit du dépôt à
  servir la feuille source.
- **FormSubmit n'est toujours pas activé** — vérifié le 2026-07-30 :
  HTTP 200 avec `{"success":"false","message":"This form needs
  Activation."}`. Le lien d'activation est dans la boîte du
  propriétaire, et c'est **un clic**. Depuis le 2026-07-30 les six
  formulaires **livrent quand même** : sur échec, un repli `mailto:`
  paraît avec le message déjà rempli à partir des réponses tapées.
  `node tools/formulaires-e2e.mjs` relève l'état réel du service en
  tête de rapport ; le jour où il dit `ACTIVE`, le repli cesse de
  paraître sans qu'une ligne change.
- **Les positions de déclenchement de ScrollTrigger sont périmées par
  `content-visibility: auto`** — trouvé le 2026-07-30 en mesurant, pas
  en lisant. Sept textes du site restaient à **10-12 % d'opacité en
  permanence** pour un visiteur normal (1,15:1 à 1,36:1) : leur
  déclencheur ne partait jamais, parce que la hauteur *réservée* des
  sections traversées n'est pas leur hauteur réelle. Le **dégât** est
  corrigé — onze tweens portent `immediateRender: false`, donc l'état de
  repos est la forme finale et un déclencheur muet ne coûte plus qu'une
  animation manquante. **La cause ne l'est pas.** Elle touche à la
  stratégie `content-visibility` de toutes les sections, et c'est un
  chantier en soi. `node tools/contraste-arret.mjs http://localhost:8099 60`
  doit rester à **0**.
- **RIEN N'A JAMAIS ÉTÉ VÉRIFIÉ SUR UN APPAREIL RÉEL.** Voir l'encadré en
  fin de § 9. C'est le plus gros trou de preuve du projet.
- **`prix-check.mjs` compte les lignes de COMMENTAIRE.** Un montant cité
  dans un commentaire pour documenter un correctif ressort « A RETIRER ».
  Les commentaires du dépôt écrivent donc les montants **sans le glyphe
  `$`**. Ce n'est pas la bonne façon : le jour où quelqu'un a le temps,
  le premier passage doit distinguer code et commentaire, et rendre une
  troisième catégorie au lieu d'un faux positif. En attendant, `A
  RETIRER dans le source` doit rester à **0**.
- **CINQ IMAGES DU DÉPÔT N'ONT AUCUNE LICENCE DOCUMENTÉE** — trouvé le
  2026-07-30. `images/real-*.webp`, les cinq captures de site de la
  section Projets : aucune trace de provenance nulle part — ni dans
  `ARCHITECTURE.md`, ni dans un générateur, ni dans un commentaire,
  ni dans les métadonnées, effacées au ré-encodage WebP. `real-pneus`
  contient en plus **neuf marques de pneumatiques** (MICHELIN,
  FALKEN, KUMHO, VREDESTEIN…). Les quatre `images/_retire/service-*`
  sont des rendus d'IA visibles qui violent les quatre interdits du
  § 5. **Elles sont toujours affichées en section 03.** Détail et
  registre complet : `CHANTIER-SERVICES.md § 3`.
- **`logo/LOGO_APED*.png` portent un manifeste C2PA signé** —
  `gpt-image` 2.0, OpenAI, `trainedAlgorithmicMedia`, plus un
  filigrane invisible non borné. `PHASE-6.md` réserve 9 le
  soupçonnait ; c'est maintenant prouvé. Les deux fichiers ne sont
  référencés nulle part (la marque affichée est `logo-mark.svg`),
  mais on ne peut pas en revendiquer l'exclusivité.
- **`images/og.png` contredit le site** — il affiche « 24 h · Délai de
  réponse » là où le site dit **12 h** partout, et le § 12 sépare
  explicitement les deux. C'est la carte qui part quand quelqu'un
  partage le site, et **aucun outil ne lit le texte dans un PNG**.
- **La plaque « 7 · Produits » compte la vidéo, que rien ne soutient**
  — `grep vidéo index.html` ne rend qu'une ligne : celle de la plaque.
  Six des sept produits sont démontrés par la section Services ; le
  septième n'existe nulle part. Voir `CHANTIER-SERVICES.md § 4.1`.
- **`AUDIT-VERACITE.md` : les 36 constats sont traités**, plus les deux
  contrastes à l'arrêt et le défaut d'opacité ci-dessus. Deux points
  restent suspendus à une information que seul le propriétaire a — les
  cinq adresses en ligne des projets, et la pile réelle des projets
  clients. Voir `DECISIONS-NUIT.md § 2`.
