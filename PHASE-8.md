# PHASE 8 — LE LANGAGE DE MOUVEMENT COMPLET

Date : 2026-07-26 · révisé le même jour (trois corrections + budget mobile)
Fichiers touchés : `js/langue.js` (nouveau), `js/main.js`,
`css/app.css` (+26 Ko), `index.html`, plus sept outils de mesure et une
correction dans `tools/cascade-check.mjs`.
Aucune dépendance ajoutée. Zéro requête tierce, toujours.

---

## 0. LA DÉCISION QUI GOUVERNE TOUT LE RESTE

Le brief demande deux choses qui se contredisent : **le maximum
d'animations**, et **ne pas se perdre**. La façon dont on résout cette
contradiction décide de tout le reste, alors elle est écrite ici, en
premier.

Je n'ai pas ajouté quarante animations. J'ai défini **quatre verbes** et
je les ai déclinés cinquante et une fois. C'est la réponse littérale à la
règle du brief : « avant d'ajouter une animation, réponds à *en quoi
c'est la même idée que le reste ?* ».

Les quatre verbes sortent tous du moteur `js/limaille.js`, c'est-à-dire
du hero, c'est-à-dire de la seule chose que ce site fait déjà et que
personne d'autre ne fait :

| | Verbe | Ce que ça fait | D'où ça vient |
|---|---|---|---|
| **V1** | **DÉGAGER** | Une forme déjà là se découvre sous une arête **franche** qui balaye. `clip-path`, jamais un fondu. | « la matière qu'on dégage » |
| **V2** | **S'ALIGNER** | Les blocs arrivent décalés latéralement, en alternance, et se reprennent à leur place. Aucun dépassement, ζ = 1. | « les grains que la pointe relâche » |
| **V3** | **SOUDER** | Un filet apparaît en trame de grains, puis se ressoude en trait plein. | « la limaille à l'échelle d'un filet » |
| **V4** | **CRAN** | Un état ne fond pas dans un autre : il roule d'un cran. | « tout s'encliquette » |

**La règle d'admission** est écrite en tête de `js/langue.js` : avant
d'ajouter un mouvement, il faut pouvoir dire lequel des quatre il est.
Si la réponse n'existe pas, le mouvement ne se fait pas, même si l'effet
est beau. Sept effets trouvés en recherche ont été écartés par cette
règle seule — ils sont listés en section 5.

Une conséquence secondaire, et je la trouve plus importante que le
mouvement lui-même : **la direction du balayage n'est jamais
décorative**. Elle suit le sens de lecture de ce qu'elle découvre. Un
titre, un libellé, un filet, une ligne de fiche : de gauche à droite.
Une page, une capture, un panneau de modale : de haut en bas. Il n'y a
pas une seule exception dans le site.

---

## 1. LA RECHERCHE — 41 TECHNIQUES, LEUR SOURCE, LEUR TRADUCTION

Colonnes : la mécanique volée · la source · où elle est appliquée ici ·
comment elle est rhabillée en langage Atelier.

### 1.1 · Texte et titres

| # | Mécanique | Source | Chez nous | Traduction Atelier |
|---|---|---|---|---|
| 1 | Masked text reveal par ligne (SplitText + overflow) | [Osmo — Masked Text Reveal](https://codepen.io/osmosupply/pen/pvvKezw) | `h2` de section — **existait déjà** (phase 7) | Le masque est un `clip-path` à arête franche, pas un `overflow` + `translateY` : rien ne glisse, la matière se dégage |
| 2 | Découpage par caractère avec cascade | [Codrops — Dual-Wave Text](https://tympanus.net/codrops/2026/01/15/building-a-scroll-driven-dual-wave-text-animation-with-gsap/) | **Tous les boutons**, 28 | La cascade porte une **inversion de contraste**, pas un allumage. Voir § 2.1 |
| 3 | Highlight text on scroll (opacité mot à mot) | [Osmo — Highlight Text on Scroll](https://www.osmo.supply/collection) | Les 10 chapôs `.head p`, **227 mots** | L'opacité ne descend jamais sous 0,34 : un mot invisible qu'on attend n'est pas une révélation, c'est une attente |
| 4 | Variable-font width axis animé au scroll | [Codrops / petebarr CodePen](https://codepen.io/petebarr/pen/MWKgmYW) | **Écarté.** § 5.2 | — |
| 5 | Text scramble / decode | [soulwire CodePen](https://codepen.io/soulwire/pen/mEMPrK), [GSAP ScrambleText](https://gsap.com/docs/v3/Plugins/ScrambleTextPlugin/) | **Écarté.** § 5.1 | — |
| 6 | Sticky title scroll effect | [Osmo](https://www.osmo.supply/collection) | `h3` — 25 sous-titres | Balayage unique gauche→droite, 260 ms. Pas de découpe par ligne : une mesure forcée par titre pour un gain invisible |
| 7 | Soulignement qui se trace en `scaleX` | Pratique courante (Osmo « Underline Link Animation ») | `.nav-links a`, `.footer-nav a`, `.menu-foot a` | Il **ne rebrousse pas chemin** à la sortie : il continue vers la droite et sort. Un trait qui recule dit « annulé » |
| 8 | Compteur de caractères qui défile | [Odometer.js](https://github.com/HubSpot/odometer) | Voir #12 | — |

### 1.2 · Boutons et micro-interactions

| # | Mécanique | Source | Chez nous | Traduction Atelier |
|---|---|---|---|---|
| 9 | Balayage lumineux au survol | **Composant fourni #1** | Les 28 boutons | Aplat d'encre à **arête franche** balayant de gauche à droite. Pas de dégradé, pas de halo |
| 10 | Lettres qui s'illuminent une à une | **Composant fourni #1** | Les 28 boutons | Chaque lettre **bascule en 0 s** au moment exact où l'arête passe sur elle. Un cran, pas un fondu |
| 11 | Déformation des lettres au focus (`blur(10px)`) | **Composant fourni #1** | `:active` de tous les boutons | Devient une **compression sur l'axe de largeur** — `scaleX(0.9)`, 90 ms. La plaque passe sous la presse |
| 12 | Odomètre : chaque chiffre roule | [master.dev — The Odometer Effect in CSS](https://master.dev/blog/the-odometer-effect-in-css/), [Osmo — Number Odometer](https://www.osmo.supply/collection) | Compteur du rail, compteur des chantiers, étape du parcours | Deux couches dans une boîte rognée, `translateY`, décalage par rang. Martian Mono partout : zéro décalage de mise en page |
| 13 | Bouton magnétique | [Olivier Larose](https://blog.olivierlarose.com/tutorials/magnetic-button), [Osmo — Magnetic Hover](https://www.osmo.supply/collection) | **Existait déjà** — `js/pointe.js` | C'est la CIBLE qui se rapproche de la pointe, pas le curseur qui bouge |
| 14 | Flèche qui sort du cadre et revient | [Osmo — Button with Rotating Icon](https://www.osmo.supply/collection) | Les boutons à icône | Sortie franche à droite, rentrée par la gauche, cadre `overflow: hidden`. **Différée de 230 ms** : un cran après l'autre |
| 15 | États loading / succès / erreur | [Emil Kowalski — animations.dev](https://github.com/emilkowalski/skills), [Mantlr sur Stripe/Linear/Vercel](https://mantlr.com/blog/stripe-linear-vercel-premium-ui) | `.form-status`, `.field` | Le succès **soude** un filet plein ; l'erreur laisse une **trame ouverte** — la trame EST l'état « pas encore fermé » |
| 16 | Six micro-états obligatoires | [Mantlr](https://mantlr.com/blog/stripe-linear-vercel-premium-ui) | Audit complet, `tools/etats-check.mjs` | Chacun vérifié par script, pas par impression |
| 17 | Durée UI < 300 ms | [Emil Kowalski](https://github.com/emilkowalski/skills/blob/main/skills/emil-design-eng/SKILL.md) | Toutes les micro-interactions | Cascade plafonnée à 230 ms. Un bouton ne se fait jamais attendre |

### 1.3 · Scroll, sections, mise en page

| # | Mécanique | Source | Chez nous | Traduction Atelier |
|---|---|---|---|---|
| 18 | Pinned section + scrub | [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) | Rail des services — **existait déjà** | Une seule timeline pour le rail ET la jauge |
| 19 | Morphe entre deux mises en page calculées | **Composant fourni #2** | Vitrine des secteurs — § 2.2 | Dispersion sur les **15 filets** de `seedPositions()`, pas un nuage aléatoire. Aucun cercle : § 5.3 |
| 20 | Parallaxe à la souris | **Composant fourni #2** | Vitrine des secteurs | ±100 px chez eux, **±7 px ici**. Au-delà, la maquette flotte |
| 21 | GSAP Flip pour réordonner une grille | [Codrops — GSAP Flip](https://tympanus.net/codrops/2026/01/20/animating-responsive-grid-layout-transitions-with-gsap-flip/), [doc Flip](https://gsap.com/docs/v3/Plugins/Flip/) | Ouverture d'une question de la FAQ | **FLIP réécrit à la main, 15 lignes.** Le plugin n'est pas dans `js/vendor/` et vaut ~20 Ko pour deux usages : on prend la mécanique, on jette le code |
| 22 | Vitesses différenciées entre colonnes | [Osmo — Parallax Image Layers](https://www.osmo.supply/collection) | `.project-meta` contre `.shot` | Course **bornée à ±22 px**, bureau seulement. Sur une colonne unique, deux vitesses ne veulent plus rien dire |
| 23 | Scroll progress bar / number | [Osmo](https://www.osmo.supply/collection) | Barre de lecture — **existait déjà** | Trame de grains, comme les filets |
| 24 | One-page progress navigation | [Osmo](https://www.osmo.supply/collection) | **Curseur du rail** — § 2.3 | Un seul objet qui glisse et qui porte les deux informations |
| 25 | Scroll-driven CSS natif `view()` / `scroll()` | [Josh Comeau](https://www.joshwcomeau.com/animation/scroll-driven-animations/), [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) | **Écarté.** § 5.5 | — |
| 26 | Horizontal scroll section | [Codrops / GSAP](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) | Services — **existait déjà** | Barre = mouvement, pas indicateur du mouvement |
| 27 | Sticky grid scroll / staggered grid | [Codrops GSAP Highlights](https://tympanus.net/codrops/hub/gsap-highlights/) | `[data-settle]` — **existait déjà**, étendu | Décalage latéral alterné, arrêt sec |
| 28 | Shutter / column wipe transition | [Osmo — Shutter Page Transition](https://www.osmo.supply/collection) | Séquence d'entrée — **existait déjà** | 15 filets, exactement ceux de `seedPositions()` |

### 1.4 · Images, cadres, curseur

| # | Mécanique | Source | Chez nous | Traduction Atelier |
|---|---|---|---|---|
| 29 | Pixelated / grain image reveal | [Osmo — Pixelated Image Reveal](https://webflow.com/made-in-webflow/website/osmo-pixelated-image-reveal), [Codrops](https://tympanus.net/codrops/hub/gsap-highlights/) | Les 5 captures de projet | **Voile de trame de grains** en deux dégradés répétitifs croisés à 3 px, retiré du document à la fin. Zéro WebGL, zéro shader |
| 30 | Pinned image mask reveal | [Codrops GSAP Highlights](https://tympanus.net/codrops/hub/gsap-highlights/) | `.shot`, `[data-degage]` | `clip-path: inset()` haut→bas : une page se lit de haut en bas |
| 31 | On-scroll SVG mask transitions | [Codrops](https://tympanus.net/codrops/hub/gsap-highlights/) | **Écarté** au profit de `clip-path` | Un masque SVG anime un filtre ; `inset()` anime une arête. L'arête est notre vocabulaire |
| 32 | Curseur augmenté / réticule | [Osmo — Custom Cursor](https://www.osmo.supply/collection), [michaelgudzevskyi](https://github.com/michaelgudzevskyi/cursor-hover-effect-gsap) | `js/pointe.js` — **existait déjà** | Le curseur système reste **visible** ; on l'augmente, on ne le remplace jamais |
| 33 | Étiquette contextuelle suivant le curseur | [Osmo — Dynamic Text Cursor](https://www.osmo.supply/collection) | Cadres de projet, vitrine, visite 360 | Étiquette d'atelier : angle vif, inversion de contraste, Martian Mono en capitales. Aucune ombre, aucun arrondi |
| 34 | Image trail / grain trail derrière le curseur | [Osmo — Image Trail](https://www.osmo.supply/collection) | **Écarté.** § 5.4 | — |

### 1.5 · Transitions, modales, page

| # | Mécanique | Source | Chez nous | Traduction Atelier |
|---|---|---|---|---|
| 35 | View Transitions API | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using) | **Écarté.** § 5.6 | — |
| 36 | Masked window page transition | [Osmo](https://www.osmo.supply/collection) | Les 6 modales + le popup cadeau | `clip-path` haut→bas, 260 ms. La **fermeture est la réciproque exacte** de l'ouverture |
| 37 | Accordion CSS animation | [Osmo](https://www.osmo.supply/collection) | FAQ | Le filet supérieur de la question dépliée passe au minium et se trace |
| 38 | Two-step navigation toggle | [Osmo — Two-step Scaling Navigation](https://www.osmo.supply/collection) | Bourgeon → croix | Deux crans lisibles au lieu d'une bouillie de 240 ms |
| 39 | Theme toggle animé | [Osmo — Dark/Light Mode](https://www.osmo.supply/collection) | Bascule de thème | Le soleil sort par le haut, la lune entre par le bas. Deux crans opposés, pas un fondu croisé |
| 40 | Draw path on scroll (`strokeDashoffset`) | [Osmo — Draw Path on Scroll](https://www.osmo.supply/collection) | Signature du programme de référence — **existait déjà** | Une seule courte courbe, une seule fois. Pas quarante rectangles repeints par image |
| 41 | Sélection de texte, barre de défilement, 404 | [Emil Kowalski](https://github.com/emilkowalski/skills) | **Existait déjà** dans `css/base.css` | Minium en aplat sur la sélection, barre en ciment/encre, rayon 0 |

**Galeries et communautés parcourues sans en tirer de technique
retenue** : Awwwards (catégories *Scroll animation*, *Scroll-driven
storytelling*, *Parallax*), les tendances scrollytelling 2026 de
[Svilenković](https://svilenkovic.com/3d/scrollytelling-trends-2026),
[21st.dev](https://21st.dev/community/components/s/text-animation)
(431 composants de texte, 205 de scroll, 1152 de hero). La raison est
la même partout : ces catalogues sont massivement **React + Tailwind +
framer-motion**, et le tiers utile — les mécaniques — se retrouve en
plus propre chez Codrops et Osmo, qui documentent le HTML/CSS/JS.
21st.dev a servi à confirmer que les deux composants fournis sont
représentatifs de ce que le catalogue produit : arrondis, dégradés,
ombres internes, ressorts mous. Le travail utile était la traduction,
pas la découverte.

---

## 2. LES QUATRE MOMENTS QUI COMPTENT

### 2.1 · Le bouton — traduction du composant fourni #1

**Ce que j'ai volé** : la cascade par caractère, le balayage, le
changement d'état entre repos et action, la déformation des lettres à
l'appui.

**Ce que j'ai jeté** : le rayon 24 px, les dix ombres internes, les
quatre dégradés, le `blur(10px)`, les `drop-shadow`, le halo coloré, et
— c'est le point important — **le repos gris**.

L'original part de lettres à `#ffffff88`, soit 53 % de blanc, et les
allume au survol. Un libellé de bouton délavé au repos, c'est un échec
de contraste **permanent** échangé contre un effet de survol. Le repos
est donc l'encre pleine ici, et ce qui cascade n'est pas l'allumage,
c'est **la bascule** : un aplat d'encre balaye le bouton de gauche à
droite et chaque lettre s'inverse — encre sur ciment devient ciment sur
encre — au moment exact où l'arête passe sur elle.

Trois corrections mesurées ont été nécessaires avant que ça tienne, et
je les documente parce qu'elles sont plus instructives que le résultat.

**Correction 1 — les lettres étaient des éléments flexibles.**
`.btn` est un `inline-flex` avec `gap: 1.5rem`. Poser les lettres
directement dans le bouton en faisait autant d'éléments flexibles :
« Démarrer votre projet » passait de **216,97 px à 643,58 px** au
premier survol, la rangée de boutons du hero passait à la ligne, et le
**CLS de la page montait à 0,1155**. Les lettres vivent maintenant dans
une enveloppe unique : le bouton garde exactement deux éléments
flexibles, le libellé et l'icône.

**Correction 2 — le décalage suivait l'indice, pas la position.**
Première version : la lettre *i* basculait à `i / n × 230 ms` pendant
que l'arête traversait le bouton en 230 ms. Les deux ne se rencontrent
jamais, pour deux raisons qui s'additionnent : l'indice ne compte pas
les espaces, et le libellé n'occupe pas toute la largeur du bouton — il
y a 18 px de rembourrage de chaque côté, 24 px d'écart et une icône à
droite. Mesure par `tools/contraste-survol.mjs` : les lettres de droite
basculaient jusqu'à 40 % de la course **après** avoir été recouvertes,
soit **3,63:1 sur le bouton fantôme et 1,86:1 sur le primaire**. Chaque
lettre porte désormais `--p`, sa position horizontale réelle dans le
bouton, mesurée une fois au découpage.

**Correction 3 — les morceaux de libellé imbriqués ne basculaient pas.**
`<b class="nav-refer-num">5 000 $</b>` gardait sa couleur pendant que
l'encre passait dessous : **2,13:1**. Un montant de 5 000 $ qui
disparaît au survol du bouton qui sert à le gagner. Un élément imbriqué
compte maintenant comme une lettre.

**Et une correction de conception** : la lettre bascule en **0 seconde**,
pas en 240 ms. Une lettre qui *fond* vers sa nouvelle valeur est hors
langue — « rien ne fond, tout s'encliquette » — et c'est aussi ce qui
garantit le contraste : 13,89:1 avant l'arête, 13,89:1 après, aucun
entre-deux possible.

Le découpage est **paresseux** : chaque bouton paie le sien au premier
survol ou au premier focus. 28 boutons découpés au chargement font
~560 éléments de plus dans la première mise en page.

### 2.2 · Les secteurs — traduction du composant fourni #2

**Pourquoi Secteurs et pas Projets**, puisque le brief demande
d'arbitrer et d'argumenter. Trois raisons, dans l'ordre d'importance :

1. **Le sens.** La section Secteurs affirme « le style change selon le
   métier ». Une matière unique qui se recompose en une forme
   différente par métier **n'illustre pas** l'affirmation, elle **l'est**.
   Dans Projets, l'affirmation est « ces sites sont en ligne pour de
   vrai » : faire voler les captures affaiblit la preuve au lieu de la
   porter.
2. **L'historique mesuré.** L'épinglage de Projets a été retiré en
   phase 6 sur une mesure : 3 200 px par projet, section à 20 588 px,
   soit 60 % de la hauteur du site. Le remettre serait réintroduire un
   défaut déjà payé.
3. **La lisibilité.** Les captures de Projets sont des pages complètes
   avec du vrai texte. C'est le moment où elles doivent être nettes ;
   un morphe les rend illisibles exactement quand on les juge.

**Ce que j'ai volé** : l'interpolation progressive entre deux mises en
page calculées, la séquence dispersion → filets → forme, la parallaxe
bornée à la souris, le changement d'état au survol.

**Ce que j'ai jeté, et pourquoi** :

- **Le détournement du défilement.** L'original pose un `wheel` avec
  `preventDefault` : le visiteur ne peut plus sortir de la section.
  C'est interdit et c'était la contrainte critique du brief. Ici il n'y
  a **aucun `pin`, aucun `wheel`, aucun pixel ajouté à la page** : le
  morphe est une animation de 440 ms déclenchée à l'entrée de la scène
  et à chaque changement de métier. La molette fait toujours exactement
  ce qu'elle fait ailleurs.
- **Le cercle.** Ce site a déjà arbitré contre une mécanique rotative,
  en phase 6, sur deux arguments qui tiennent encore : sur un cercle il
  n'y a ni début ni fin, donc plus aucune réponse honnête à « combien
  il en reste » ; et une carte posée sur un cercle doit être redressée
  pour rester lisible, donc elle glisse le long d'une courbe sans
  jamais s'y aligner — ça flotte, et rien ne flotte ici. La forme
  dispersée est donc **les quinze filets horizontaux de
  `seedPositions()`** dans `js/limaille.js`. La même matière, au même
  endroit, à une autre échelle. La forme d'arrivée est la grille
  orthogonale de la maquette, nette au pixel.
- **Le retournement 3D des cartes.** Une rotation en Y suppose une
  perspective, donc une profondeur, donc quelque chose qui flotte.

**Une correction de conception, mesurée.** J'avais d'abord deux
mécanismes : un morphe *scrubbé* sur la traversée de la scène, et une
recomposition déclenchée par le changement de métier. Les deux visaient
les mêmes blocs. `tools/secteur-morph-check.mjs` a montré qu'à l'arrêt
au milieu de la plage de scrub, les blocs restaient à **4,1 px de leur
place et à 0,84 d'opacité** : l'état au repos n'était plus la forme
finale, ce qui casse la règle 0bis du projet. Un seul chemin de code
maintenant, avec un début et une fin, et `clearProps` à la dernière
image. Vérifié : **écart 0 px, opacité 1**.

Ce qu'on perd : le lien direct entre la molette et le morphe.
Ce qu'on gagne : un état de repos qui ne ment jamais.

### 2.5 · Le défaut le plus grave que j'ai trouvé — et il venait de moi

Les chapôs de section devaient recevoir la technique la plus répandue de
la catégorie : l'encre qui se pose **mot par mot au fil du scroll**, en
`scrub`. Je l'ai écrite, elle marchait, elle était jolie.

Elle est **fausse**, et pas un peu.

Une animation scrubbée n'a pas d'état de repos : elle a l'état où le
visiteur s'est arrêté. Dès qu'elle touche à l'**opacité d'un texte**,
chaque position de défilement devient un état **permanent** possible, et
chacun doit tenir le contraste. Mesure du 2026-07-26, avec le paragraphe
à **64 % de la hauteur d'écran** — une position de lecture parfaitement
ordinaire, pas un cas limite — les mots restaient bloqués à **0,39
d'opacité**, soit environ **1,5:1** sur le ciment. Un échec AA franc,
tenu aussi longtemps que le visiteur ne bouge pas.

Aucun des outils existants ne pouvait le voir : `theme-check.mjs` mesure
des états posés, et il capture après avoir fait défiler l'élément à une
position où l'animation est terminée. Il fallait un outil qui
**s'arrête** à des hauteurs d'écran variées, **attend que tout soit
posé**, et regarde ce qui reste bas. C'est
`tools/contraste-arret.mjs`, et le test est maintenant permanent dans
`langue-check.mjs` § 2bis.

La correction est la même que pour les secteurs, et cette convergence
est le vrai enseignement de la phase : **une animation qui touche à la
lisibilité doit avoir un début et une fin.** Elle ne peut pas être
suspendue à la position d'une molette.

Ce qu'on perd : « au fil du scroll ». Ce qu'on garde : la vague mot par
mot, jouée une fois, en moins d'une seconde, avec `clearProps` à la
dernière image — donc un état de repos qui n'est écrit nulle part et
qu'on ne peut pas laisser à mi-chemin.

**Deux animations scrubbées sur opacité ou position de texte ont donc
été converties en animations à durée finie** : les chapôs et le morphe
des secteurs. Le seul scrub que j'ai gardé est la vitesse différenciée
de `.project-meta`, qui ne touche qu'au `translateY` et ne peut donc
rendre aucun texte illisible.

### 2.6 · La vague qui allait dans les deux sens

Corollaire du précédent, trouvé en relisant une capture et confirmé
image par image. Avec un `fromTo` décalé, un mot dont le tour n'est pas
encore venu reste à son opacité CSS — **l'encre pleine** — puis il
**tombe à 0,34** au moment où son tour arrive, avant de remonter.
Relevé, image par image :

```
1     1     1     1     1     1
0.62  0.51  0.39  1     1     1
0.79  0.71  0.61  0.5   0.38  1
```

La vague se lisait donc « foncé, clair, foncé », et **un mot déjà
lisible devenait moins lisible sous les yeux du visiteur**. C'est pire
que pas d'animation du tout : une animation d'entrée n'a le droit
d'aller que dans un sens, celui de la lecture.

L'état de départ est maintenant posé sur tous les mots **en même
temps**, à l'entrée par le bas de l'écran, et seule la remontée est
décalée. Vérifié :

```
0.34  0.34  0.34  0.34  0.34  0.34
0.62  0.52  0.39  0.34  0.34  0.34
0.80  0.71  0.62  0.51  0.39  0.34
```

C'est le genre de défaut qu'on ne voit pas sur une capture — il dure
moins d'une seconde et il ressemble à un scintillement — et qu'on ne
trouve qu'en lisant les valeurs image par image.

### 2.3 · Le curseur du rail — N1

L'entrée active se contentait de changer de couleur : d'une section à
l'autre, la marque **disparaissait ici et réapparaissait là**. Le
visiteur ne voyait donc pas qu'il avait avancé d'un cran, il voyait
deux états sans lien.

Un seul objet glisse maintenant le long de l'index, et il porte les
**deux** informations que l'index doit donner : sa **position** dit dans
quelle section on est, son **remplissage minium** dit où on en est
dedans. Deux marques auraient dit la même chose deux fois et se
seraient contredites au moindre désaccord d'une image.

### 2.4 · L'odomètre — N1, et il vit dans `main.js`

Tous les nombres qui roulent sont de l'**orientation** : quel chantier
je regarde, à quelle étape j'en suis, combien de sections il reste.
`langue.js` et `motion.js` s'arrêtent net sous `prefers-reduced-motion` ;
y mettre ces compteurs reviendrait à supprimer l'information pour les
gens qui ont justement demandé moins de mouvement. Sous mouvement
réduit, le chiffre reste, seul le roulement disparaît.

**L'arbitrage odomètre / interpolation.** Les valeurs **discrètes**
roulent : 01 → 02 est un cran, il se voit comme un cran. La valeur du
calculateur, elle, **ne roule pas** : elle est tirée par un ressort,
parce qu'elle suit un curseur qu'on bouge en continu. Un odomètre sur
une valeur qui change soixante fois par seconde ne donne pas soixante
crans, il donne du bruit.

**Deux bogues d'accessibilité corrigés, tous deux trouvés par script** :

- Pendant les 320 ms du roulement, la boîte contient deux glyphes. Tant
  que les deux sont du texte, `textContent` les concatène : le compteur
  du rail rendait **« 87 » au lieu de « 7 »**. L'affichage était juste ;
  c'est la synthèse vocale, la recherche dans la page et tout script de
  mesure qui lisaient un nombre n'ayant jamais existé. Le glyphe
  sortant passe maintenant dans un pseudo-élément via `attr()` — ni
  dans `textContent`, ni dans l'arbre d'accessibilité.
- Un défilement rapide traverse cinq sections en moins de 320 ms : les
  cinq glyphes s'accumulaient et le compteur rendait **« 543210 »** au
  lieu de « 0 ». Un roulement interrompu se termine désormais
  immédiatement à sa valeur d'arrivée.

Les deux ont été trouvés par `tools/verif.mjs`, sur les dix positions de
défilement du « test du patron de 55 ans ». Vérifié après correction :
`11, 10, 9, 9, 7, 5, 3, 0, 0, 0`.

---

## 3. L'INVENTAIRE COMPLET

Aucune catégorie du brief ne reste inerte. **51 traitements**, dont
**31 nouveaux** en phase 8 (marqués **N8**) ; les 20 autres existaient
et sont listés parce qu'un inventaire qui ne montre que les nouveautés
ne dit pas si une catégorie est couverte.

### Titres

| Élément | Traitement | Niveau |
|---|---|---|
| `h2` de section (10) | Balayage `clip-path` ligne par ligne, 60 ms d'écart, découpage paresseux | N2 |
| `h3` (25) | **N8** — Balayage gauche→droite, 260 ms, une fois | N3 |
| `h1` du hero | Plaque de limaille, composition en grains puis durcissement | N2 |
| Monogramme du pied | **N8** — Dégagement par le bas. La page s'ouvre sur une plaque qui se compose, elle se ferme sur la même qu'on dégage | N3 |

### Texte courant

| Élément | Traitement | Niveau |
|---|---|---|
| Chapôs `.head p` (245 mots) | **N8** — L'encre se pose mot après mot, une fois, en moins d'une seconde. Plancher à 0,34, repos = encre pleine. **Pas de scrub** (§ 2.5), découpage **au temps mort** (§ 7bis C), **tombe au palier 1** (§ 7bis D) | N3 |
| Blocs `.rise` | Montée décalée dans l'ordre de lecture | N3 |
| `[data-settle]` | Arrivée latérale alternée, reprise à leur place | N2 |

### Boutons et CTA — 28 boutons

| État | Traitement | Niveau |
|---|---|---|
| repos | Filet minium de 2 px, largeur nulle — la trace du remplissage | — |
| survol / focus | **N8** — Aplat d'encre balayant, lettres basculant en cran, cadre au noir. **230 ms** en secondaire, **520 ms** sur les quatre CTA qui comptent (§ 7bis A) | N2 |
| survol, icône | **N8** — Flèche sortant du cadre à droite, rentrant par la gauche, différée de 230 ms | N3 |
| appui | **N8** — Compression `scaleX(0.9)` de toutes les lettres, 90 ms | N3 |
| magnétique | La cible se rapproche de la pointe (`js/pointe.js`) | N3 |
| désactivé | **N8** — Aucun aplat : il n'y a rien à faire | N1 |
| chargement | Filet en trame qui balaye en boucle | N1 |
| succès | **N8** — Filet plein qui se soude, en vert | N1 |
| erreur | **N8** — Trame ouverte qui se trace, en rouge. La trame EST l'état « pas encore fermé » | N1 |

### Liens et navigation

| Élément | Traitement | Niveau |
|---|---|---|
| `.nav-links a` | **N8** — Soulignement qui se trace à l'entrée et **se retrace vers la droite** à la sortie | N3 |
| `.footer-nav a`, `.menu-foot a` | **N8** — Même geste | N3 |
| `.menu-list a` | **N8** — Filet minium de 2 px qui se trace sur le filet de séparation | N3 |
| Curseur du rail | **N8** — Un objet glisse, sa position dit où, son remplissage dit combien | **N1** |
| Compteur « sections restantes » | **N8** — Odomètre | **N1** |
| Barre de lecture | Trame de grains, progression continue | N1 |
| Bourgeon | **N8** — Bascule en croix, deux crans lisibles | N1 |
| Bascule de thème | **N8** — Soleil par le haut, lune par le bas | N3 |

### Images et médias

| Élément | Traitement | Niveau |
|---|---|---|
| Captures de projet (5) | Dégagement haut→bas sous arête franche. Le voile de grains a été **coupé** — § 7bis B | N2 |
| `[data-degage]` | **N8** — Révélation par masque, quatre directions | N3 |
| Maquettes de secteur | **N8** — Recomposition depuis les 15 filets | **N2** |
| Parallaxe de la vitrine | **N8** — ±7 px à la souris, pointeur fin, bureau seulement | N3 |
| Fiche de projet | **N8** — Vitesse différenciée ±22 px, bureau seulement | N3 |

### Chiffres et données

| Élément | Traitement | Niveau |
|---|---|---|
| Compteur des chantiers | **N8** — Odomètre | **N1** |
| Étape du parcours | **N8** — Odomètre | **N1** |
| Sections restantes | **N8** — Odomètre | **N1** |
| Impact annuel | Interpolation par ressort — suit un curseur, donc continu | N1 |
| `[data-count]` (2) | Compteur qui se pose | N2 |
| Barres du comparatif (6), de l'écart, des preuves | Tracé `scaleX`, ordre porteur d'argument | N2 |

### Cartes et listes

| Élément | Traitement | Niveau |
|---|---|---|
| Rail des services | Défilement latéral épinglé, une seule timeline pour le rail et la jauge | N1+N2 |
| FAQ | **N8** — FLIP maison : les questions suivantes **glissent** au lieu de sauter | N2 |
| Question dépliée | **N8** — Filet minium qui se trace | **N1** |
| `.project-facts` (15 rangées) | **N8** — Chaque filet s'assemble en grains puis se ressoude | N2 |
| `.cell` de contact | Filet minium en grains + flèche | N3 |

### Transitions entre sections

| Élément | Traitement | Niveau |
|---|---|---|
| Filets de section (19) | Assemblage en grains puis ressoudure | N1+N2 |
| Filet de la section active | Passage au minium | **N1** |
| Élément qui persiste | Le curseur du rail traverse toute la page | **N1** |

### Curseur — pointeur fin seulement

| Élément | Traitement | Niveau |
|---|---|---|
| Réticule | S'ouvre sur les cibles, plus large sur les cadres | N3 |
| Aimantation | La cible se rapproche | N3 |
| Étiquette contextuelle | **N8** — « Parcourir », « Choisir un métier », « Regarder autour » | N3 |

### Micro-états

| Élément | Traitement | Niveau |
|---|---|---|
| Modales (6), ouverture | **N8** — Dégagement par le haut, 260 ms | N2 |
| Modales, fermeture | **N8** — Réciproque exacte de l'ouverture | N2 |
| Popup cadeau | **N8** — Dégagement par le haut, animation CSS pure `forwards` | N2 |
| Validation de champ | **N8** — Trame ouverte en erreur, soudure verte à la réparation | N1 |
| Sélection, barre de défilement, 404 | Minium en aplat, ciment/encre, rayon 0 | N3 |

---

## 4. LES CHIFFRES

**A/B sur la même machine, passes alternées** — `node tools/ab-phase8.mjs`.
La version d'avant est servie depuis une copie sur le port 8097, celle
d'après sur 8099. L'ordre est inversé à chaque passe pour que la dérive
thermique frappe les deux versions de la même façon. Les chiffres d'une
phase antérieure ne sont pas une référence ; ceux-ci le sont.

**Quatre séries, 26 tirs par version au total** :

| | avant | après | verdict |
|---|---|---|---|
| LCP médian (4 séries) | 128 · 124 · 128 · 112 ms | 116 · 116 · 120 · 128 ms | **égal** |
| Pire tâche au chargement | 102 · 88 · 81 · 90 ms | 84 · 85 · 105 · 87 ms | **égal** |
| CLS total | 0,0013 — **les 4 séries** | 0,0013 — **les 4 séries** | **identique** |
| Images/s, traversée complète | 60 — les 4 séries | 60 — les 4 séries | **identique** |
| Pire tâche pendant la traversée | 56 · 55 · 0 · 0 ms | 63 · 50 · 63 · 63 ms | **léger recul** |
| Requêtes tierces | 0 | 0 | **identique** |

**Lecture honnête de ces chiffres.** La dispersion du LCP à l'intérieur
d'une même version va de 80 à 160 ms ; l'écart entre les deux versions
est très largement à l'intérieur de ce bruit. La conclusion défendable
n'est pas « le LCP s'est amélioré », c'est **« le LCP est le même »** —
et c'était l'objectif : ajouter trente et une animations sans toucher au
chemin critique.

Le seul recul mesurable est la dernière ligne. Deux séries sur quatre,
la version d'avant ne produit **aucune** tâche longue pendant la
traversée complète, là où la version d'après en produit une de ~60 ms.
C'est le découpage paresseux des mots et des titres qui la produit : il
force une mise en page au moment où un chapô entre. Elle est unique, non
bloquante, et n'a pas d'effet visible sur la fréquence d'images — 60 i/s
dans les quatre séries des deux côtés — mais elle existe et je préfère
l'écrire que la passer sous silence.

Le CLS mérite une phrase. Il vaut 0,0013 dans les deux versions, et les
huit décalages qui le composent sont exactement les mêmes des deux
côtés : le libellé de `.shot-etat` et la légende des secteurs qui
changent de longueur au survol. Ils préexistent à la phase 8. Ce qui a
été ajouté puis corrigé — le CLS à 0,1155 des lettres devenues éléments
flexibles — ne laisse aucune trace.

**Autres relevés** :

- `tools/cascade-check.mjs` — **0 écart sur 244 640 propriétés**
  comparées, feuille découpée contre feuille entière, clair et sombre.
- `tools/deborde.mjs` — **aucun contenu coupé à 9 largeurs**, de 320 à
  1920 px.
- `tools/theme-check.mjs` — **0 échec de contraste** sur 5 largeurs × 2
  thèmes, **0 débordement**, **0 erreur de console**.
- `tools/verif.mjs` — **100 arrêts de tabulation, 0 sans anneau de
  focus**, aucun piège, la modale tient le focus et le rend au
  déclencheur.
- `tools/contraste-survol.mjs` — **aucune fenêtre illisible**, aller et
  retour, sur six cibles. Le pire ratio pendant une transition est
  4,70:1, qui est le ratio **au repos** du bouton primaire : l'animation
  ne descend jamais sous l'état statique.
- `tools/langue-check.mjs` — 59 i/s pendant la traversée complète, texte
  accessible des boutons identique au caractère près après découpage,
  aucun contenu à opacité nulle, un seul hôte contacté.

**Captures** : `refonte-captures/phase8/` — 26 fichiers, avant/après sur
le bouton, le rail et les chapôs ; début/milieu/fin sur le bouton, la
recomposition des secteurs, le voile de grains et la modale ; plus le
thème sombre et le mouvement réduit. `refonte-captures/vue-*` contient
les 12 sections × 2 thèmes × 5 largeurs produites par `theme-check.mjs`.

**Sept outils ajoutés**, tous autonomes, tous rendant des chiffres :

| Outil | Ce qu'il rend | Ce qu'il a trouvé |
|---|---|---|
| `ab-phase8.mjs` | A/B contre la version d'avant, passes alternées | — |
| `langue-check.mjs` | Les quatre verbes dans le document rendu, texte accessible intact, i/s, **texte à mi-chemin à l'arrêt** | le découpage normalisait les blancs de 15 boutons |
| `etats-check.mjs` | Les onze micro-états, un par un | — |
| `contraste-survol.mjs` | Contraste **pendant** une transition, image par image, aller ET retour | **trois défauts** : 1,00:1 sur l'aplat montant, 3,63:1 sur le décalage par indice, 2,13:1 sur les libellés imbriqués |
| `secteur-morph-check.mjs` | La recomposition se produit **et se termine nette au pixel** | le scrub laissait les blocs à 4,1 px et 0,84 d'opacité |
| `contraste-arret.mjs` | Contraste à N positions d'arrêt, une fois tout posé | **le défaut § 2.5** : chapôs à 0,39 d'opacité, ~1,5:1 |
| `cls-source.mjs` | Attribue chaque décalage à l'élément qui l'a causé | CLS à 0,1155, lettres devenues éléments flexibles |

Plus `phase8-captures.mjs` pour les images.

**Huit défauts trouvés par script**, dont sept que je n'aurais pas vus à
l'œil : trois fenêtres de contraste de moins de 250 ms, un texte laissé
à 1,5:1 à une position de défilement que je n'avais pas essayée, une
vague d'entrée qui **assombrissait puis éclaircissait** au lieu de
seulement éclaircir, un compteur qui rendait « 543210 » à une synthèse
vocale sans rien montrer de faux à l'écran, un morphe qui s'arrêtait à
4,1 px de sa place, et un CLS de 0,1155 déclenché par un simple survol.

C'est, à mon avis, le vrai résultat de cette phase. Les animations sont
la partie facile.

---

## 5. CE QUE J'AI ÉCARTÉ, ET POURQUOI

### 5.1 · Le texte qui se décode (scramble)
Sources : [soulwire](https://codepen.io/soulwire/pen/mEMPrK),
[GSAP ScrambleText](https://gsap.com/docs/v3/Plugins/ScrambleTextPlugin/),
[Osmo](https://www.osmo.supply/collection).
**Écarté par la règle d'admission.** Ce n'est aucun des quatre verbes.
Du texte qui se brouille avant de se résoudre, c'est du **désordre**, et
la limaille n'est jamais désordonnée : elle est *écartée* puis *reprise*,
ce qui n'est pas la même idée. En plus, un titre qu'il faut attendre
pour lire est un titre cassé — la limite que ce site s'impose depuis la
phase 6.

### 5.2 · L'axe de largeur variable animé au scroll
Source : [petebarr](https://codepen.io/petebarr/pen/MWKgmYW),
[Codrops](https://tympanus.net/codrops/2026/01/15/building-a-scroll-driven-dual-wave-text-animation-with-gsap/).
Archivo a bien l'axe (`font-stretch: 62% 125%`) et l'effet est
spectaculaire. **Écarté pour une raison mécanique** : `font-variation-settings`
change la **largeur réelle** du texte, donc la mise en page, donc le
CLS — sur des `h2` en flux, à chaque image de scroll. C'est exactement
ce que la règle 0bis interdit. La compression physique reste, mais là
où elle ne coûte rien : sur les lettres d'un bouton à l'appui, en
`scaleX`, qui est une transformation.

### 5.3 · Le cercle et l'arc du composant #2
**Écarté sur un arbitrage déjà rendu en phase 6**, et je n'avais aucune
raison de le rouvrir : sur un cercle il n'y a ni début ni fin, donc plus
de réponse honnête à « combien il en reste » — c'est du N1 sacrifié pour
du N3 ; et une carte posée sur un cercle doit être redressée pour rester
lisible, donc elle glisse le long d'une courbe sans jamais s'y aligner.
Ça flotte. Rien ne flotte ici.

### 5.4 · La traînée de grains derrière le curseur
Source : [Osmo — Image Trail](https://www.osmo.supply/collection).
**Écarté pour ne pas diluer la signature.** Le hero fait déjà ça, avec
de la vraie limaille et de la vraie physique : la pointe creuse un
sillon dans un champ de 25 175 grains amortis. Poser une fausse traînée
ailleurs, en DOM, ce serait mettre une imitation à côté de l'original.
Une signature se dilue par la répétition approximative, pas par la
rareté.

### 5.5 · Les animations scroll natives CSS (`view()`, `scroll()`)
Sources : [Josh Comeau](https://www.joshwcomeau.com/animation/scroll-driven-animations/),
[MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations).
Support à ~84 % en 2026, Firefox derrière un drapeau. **Écarté** parce
que le gain serait nul : GSAP est déjà chargé pour le reste de la
chorégraphie, donc la remplacer par du CSS natif n'enlève pas un octet.
Ça n'ajouterait qu'un second système à tenir à jour, avec un repli à
écrire. Le jour où GSAP sortira entièrement, la question redeviendra
intéressante.

### 5.6 · La View Transitions API
Source : [MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using).
**Écarté parce que le site est une page unique.** Il n'y a pas de
transition de page à faire. Et pour les transitions dans le document,
la doc est explicite : pendant l'animation les éléments deviennent des
captures, et **les changements de `clip-path` ne prennent pas effet** —
or `clip-path` est notre verbe principal. L'API se battrait contre le
langage.

### 5.7 · Le pin sur Projets
**Écarté sur une mesure existante** : 3 200 px par projet, section à
20 588 px, 60 % de la hauteur du site. Retiré en phase 6, il n'y a
aucune raison de le remettre.

### 5.8 · Le fond de section qui bascule ciment → encre
Demandé dans l'inventaire du brief. **Écarté** : ce n'est pas une
décision de mouvement, c'est une décision de composition. Faire basculer
le sol d'une section pendant qu'on la lit rend le repère instable, et le
site n'a qu'un seul fond inversé aujourd'hui — le compteur des projets —
qui tire justement sa force d'être seul.

### 5.9 · L'inversion au survol des pastilles de secteur
**Écrite, mesurée, puis retirée.** Survoler une pastille **sélectionne**
le métier — `showSector()` est appelé sur `mouseenter` — donc la
pastille passe à `.is-on` dans la même image. L'inversion n'a jamais eu
une seule image pour s'afficher : c'était du code mort qui rendait le
survol ambigu, deux traitements pour un seul geste. Le bon signal est
celui qui existait déjà : la pastille choisie passe au minium.

### 5.10 · Le plugin GSAP Flip
**Écarté au profit d'une réécriture de 15 lignes.** Il n'est pas dans
`js/vendor/` et vaut ~20 Ko pour deux usages. La mécanique — mesurer
avant, laisser la mise en page changer, mesurer après, poser la
transformation inverse, l'annuler — est courte et lisible. C'est la
règle de la phase appliquée à nous-mêmes : on prend la mécanique, on
jette le code.

---

## 6. CINQ PIÈGES D'INSTRUMENT, ET LEUR CORRECTION

Le projet en avait déjà trois documentés. La phase 8 en ajoute cinq,
tous rencontrés pour de vrai, tous corrigés dans l'outil et pas
contournés dans le code.

1. **`cascade-check.mjs` mesurait la chorégraphie.** Depuis la phase 8,
   la page **fabrique** des éléments au défilement — les mots des chapôs
   — et anime leur opacité. Deux chargements successifs n'ont plus ni le
   même nombre de nœuds ni les mêmes valeurs calculées, et le script
   rendait de 1 à 19 « écarts de cascade » qui n'en étaient pas. Le
   relevé se fait maintenant en **mouvement réduit** : rien n'est
   fabriqué, rien n'est en cours d'interpolation, et il ne reste que ce
   que le script prétend mesurer. Deux passes consécutives : 0 et 0.

2. **La capture d'écran est plus lente que la transition.** Un
   aller-retour Playwright coûte plus de 200 ms ; une transition de
   survol en dure 230. La première image arrive **après la fin**, et
   l'outil mesure l'état final en croyant mesurer le milieu. Deux
   parades sont dans le dépôt : étirer l'horloge d'un facteur constant
   en gardant les proportions (`phase8-captures.mjs`), ou ne pas
   photographier du tout et lire les valeurs **dans la page** à chaque
   image (`contraste-survol.mjs`, `secteur-morph-check.mjs`). La seconde
   est meilleure quand elle est possible.

3. **L'analyse de pixels confond trois choses avec du texte illisible :**
   l'anticrénelage d'un glyphe effleuré, l'arête d'un aplat où deux
   **fonds** se côtoient, et une bande sans glyphe du tout. Trois
   versions par capture ont été écrites et jetées avant d'abandonner les
   pixels pour la mesure exacte.

4. **Un objet rogné exprès n'a pas de contraste.** La flèche sort du
   cadre et le bouton est `overflow: hidden` : pendant sa sortie, ses
   pixels n'existent pas. Un détecteur qui les compte quand même trouve
   du ciment sur ciment sur un objet invisible. C'est le même piège que
   le premier de la liste historique du projet — il faut toujours
   distinguer ce qui est rogné **exprès**.

5. **Un détecteur qui n'attend pas assez confond « en vol » et
   « échoué ».** Le scan des positions d'arrêt rendait 38 échecs quand
   il relevait 160 ms après avoir arrêté le défilement : il attrapait
   les animations d'entrée en cours, qui partent à 0,1 d'opacité et
   montent en 300 à 600 ms. Avec 1 400 ms d'attente — plus long que la
   plus longue animation d'entrée du site — il ne reste que ce qui est
   vraiment stable, et le diff avant/après est **exactement vide** : les
   14 échecs qui subsistent existaient déjà et n'ont rien à voir avec la
   phase 8. Un seuil d'attente est un paramètre de mesure, pas un
   détail.

Un détecteur qui ne se trompe jamais est un détecteur qui ne cherche
rien. Les quatre corrections ci-dessus valent, à mon avis, plus que
n'importe quelle animation de ce document.

---

## 7. MES RÉSERVES HONNÊTES

**1. Je n'ai toujours pas mesuré sur un vrai téléphone**, et c'est la
seule réserve qui reste entière. Ce qui a changé : le poste le plus cher
— les 245 spans de mots dont l'opacité est peinte — **ne s'exécute plus
du tout** sous 64em, sur pointeur grossier, à 4 cœurs ou à 4 Go
(§ 7bis D). Le voile de grains a disparu. Et si les seuils statiques
ratent un appareil, la page **le mesure** et se dégrade seule. Ce qui
n'est toujours pas vérifié, c'est que les seuils choisis — 50 i/s,
90 images — soient les bons.

**2. ~~La cascade des lettres est invisible.~~ TRAITÉ** — § 7bis A.
520 ms sur les quatre CTA qui comptent, 230 ms ailleurs. Ce qui subsiste
comme réserve : je n'ai aucune mesure d'usage prouvant que 520 ms est le
bon chiffre plutôt que 400 ou 650. C'est un jugement, pas un relèvement.

**3. J'ai supprimé un lien direct entre la molette et le morphe des
secteurs.** La première version scrubbait la recomposition sur le
défilement, ce qui est plus « vivant ». Je l'ai remplacée par une
animation de 440 ms parce que le scrub laissait les blocs à 4,1 px de
leur place quand on s'arrêtait au milieu. C'est le bon arbitrage selon
les règles du projet, mais c'est une perte réelle et quelqu'un pourrait
raisonnablement trancher autrement — par exemple en bornant le scrub à
une plage si courte qu'il ne peut pas s'arrêter dedans.

**4. Le nombre de ScrollTrigger a augmenté** de ~26 à 38, et le nombre
de tweens vivants à 61. C'est loin des limites de la bibliothèque, mais
chaque rafraîchissement — redimensionnement, chargement d'image —
recalcule les positions de tous. Sur cette machine c'est invisible ; sur
une machine lente pendant un redimensionnement continu, je ne sais pas.

**5. ~~Le voile de grains.~~ COUPÉ** — § 7bis B. La réserve disait
qu'il fallait trancher ; trancher, c'était le retirer.

**6. Ce document ne remplace pas un œil.** Tous les chiffres passent.
Ça ne prouve pas que l'ensemble est beau, ni que le rythme est juste
d'une section à l'autre. Les captures sont dans
`refonte-captures/phase8/` et c'est à vous de les regarder.

---

## 7bis. LES TROIS CORRECTIONS ET LE BUDGET MOBILE

### A · La cascade était invisible là où elle comptait

230 ms pour tous les boutons. Sur « Démarrer votre projet », vingt et
une lettres, ça fait **11 ms par lettre** — sous le seuil où l'œil lit
une cascade plutôt qu'un changement d'un bloc. L'effet était donc
invisible précisément sur les quatre boutons qui portent le chiffre
d'affaires.

`--cran` porte maintenant la durée du balayage et **tout en dérive** :
la course de l'aplat, le décalage de chaque lettre, le départ de la
flèche. Un seul nombre, aucun risque de désynchronisation — et c'est
cette synchronisation qui garantit le contraste.

| | `--cran` | ms/lettre sur 21 lettres |
|---|---|---|
| Liens, boutons secondaires, boutons de formulaire | 230 ms | 11 ms |
| « Démarrer votre projet », « Référez, gagnez », « Réserver un appel », les deux téléchargements du popup | **520 ms** | **25 ms** |

**Captures séquencées** : `refonte-captures/cascade/`, seize images. Les
deux variantes sont photographiées **aux mêmes instants absolus**,
horloge étirée ×8 puis remise à l'échelle dans les noms de fichiers.
C'est ce qui rend la comparaison juste : échantillonner « au quart, à la
moitié » de chaque variante donnerait deux séries identiques, puisque la
géométrie est la même et que c'est le temps qui change.

| Instant réel | 230 ms | 520 ms |
|---|---|---|
| 86 ms | arête à ~40 %, milieu de « votre » | arête à ~20 %, fin de « Démarrer » |
| 230 ms | **terminé** — tout s'est passé d'un bloc | arête à ~45 %, la cascade se lit |

Contraste revérifié à 520 ms : **aucune fenêtre illisible**, aller et
retour. Le pire ratio reste 4,70:1, qui est le ratio **au repos** du
bouton primaire.

**Pourquoi pas plus long.** 520 ms dépasse déjà les 300 ms qu'Emil
Kowalski donne comme limite d'une micro-interaction. La différence est
qu'ici rien n'est retardé : le bouton est cliquable et son libellé
lisible de la première à la dernière image. Ce qui dure n'est pas une
attente, c'est une lecture.

### B · Le voile de grains — coupé

J'avais écrit qu'il pouvait ne jamais être vu. Trancher, c'est le
retirer. Trois raisons, la troisième suffit seule :

1. **Il pouvait ne jamais être vu.** Déclenché à 82 % de la hauteur
   d'écran et long de 520 ms, un visiteur qui défile normalement
   traversait la moitié de la bande avant qu'il ait fini. Et le corriger
   en le déclenchant sur **intention** revenait à poser 520 ms de grain
   devant la chose que le visiteur vient justement de demander à voir.
2. **Il doublait un verbe déjà présent.** Le même cadre reçoit déjà un
   dégagement par masque haut→bas. Deux V1 sur le même objet, ce n'est
   pas une signature plus forte, c'est une signature bavarde.
3. **Il visait la mauvaise cible.** Ces captures sont **la preuve** :
   de vraies pages d'accueil de vrais clients en ligne. C'est le seul
   endroit du site où la netteté n'est pas une préférence esthétique
   mais l'argument lui-même. Poser une trame dessus, même une
   demi-seconde, affaiblit exactement ce qu'on demande de juger.

Rendu au passage : deux dégradés répétitifs peints sur une surface de
900 px de large, cinq fois par page.

### C · Les 60 ms de tâche pendant la traversée — effacés

**D'abord la méthode, parce que la première était fausse.**
`ab-phase8.mjs` rendait « la pire tâche », un **maximum**. Relevé sur
neuf passes, version d'avant, **code inchangé** :
`167, 0, 0, 0, 108, 942, 962, 981, 658 ms`. La machine dérive d'un
facteur six entre la première passe et la dernière. Une médiane calculée
sur une série qui dérive ne compare pas deux versions, elle compare le
début de la série à sa fin.

`tools/tache-traversee.mjs` mesure donc le **total** de temps passé en
tâche longue — qui s'additionne au lieu de se remplacer — et compare par
**différences appariées**, les deux versions dans la même passe. La
dérive s'annule.

**Ce que la mesure corrigée a trouvé** : +91 ms de recul, dont seulement
**30 ms** imputables au découpage paresseux. Les 61 ms restants venaient
d'ailleurs, et je ne l'aurais pas deviné.

**Deux corrections, dans l'ordre de leur poids :**

**1. `--soudure` était une propriété personnalisée héritée, animée par
GSAP.** Deux coûts se cumulaient à chaque image, pour quinze filets à la
fois : un `setProperty` depuis JavaScript, et surtout — une propriété
personnalisée **héritée** qui change **invalide le style de tout le
sous-arbre**. Sur une rangée de fiche de projet, ça veut dire recalculer
`dt`, `dd` et leurs enfants soixante fois par seconde pour dessiner un
trait de 1 px. Le navigateur sait faire exactement ça tout seul, avec
une transition. JavaScript ne pose plus qu'une classe, une fois, et la
retire à la fin. `@property --soudure` a disparu.

**2. Le découpage paresseux se faisait au pire moment.** Il était
déclenché par l'entrée à l'écran, ce qui évitait bien de payer au
**chargement** — mais faisait payer une mise en page pendant le
**défilement**, et pendant le survol pour les boutons. Le paresseux
était la bonne idée au mauvais moment. Tout passe maintenant par
`requestIdleCallback` : un objet par réveil tant qu'il reste plus de
6 ms, puis on rend la main. L'écouteur reste en secours pour un bouton
atteint avant que la file soit vidée. Repli `setTimeout` espacé là où
`requestIdleCallback` n'existe pas.

**Résultat, séries de passes appariées :**

| | médiane des différences | passes au-dessus |
|---|---|---|
| avant correction | **+91 ms** | 6 / 9 |
| après, série 1 | **0 ms** | 5 / 11 |
| après, série 2 | **−104 ms** | 4 / 11 |

Le recul est effacé. Bénéfice secondaire : le premier survol d'un bouton
ne force plus de mise en page, puisque le découpage est déjà fait.

### D · Le budget de dégradation mobile

Écrit **avant** d'en avoir besoin, et testé.

**Principe unique :** ce qui tombe en premier est ce qui coûte le plus
pour ce qu'il apporte le moins. L'ordre de chute est l'inverse exact de
la hiérarchie N1/N2/N3.

| Palier | Déclencheur | Ce qui tombe |
|---|---|---|
| **0 · plein** | — | — |
| **1 · allégé** | **statique** : largeur < 64em **OU** `pointer: coarse` **OU** `hardwareConcurrency` ≤ 4 **OU** `deviceMemory` ≤ 4 | 1. parallaxe souris · 2. vitesses différenciées · 3. étiquette de pointe · 4. flèche hors cadre · **5. découpage par mot des chapôs** · 6. balayage des 25 sous-titres |
| **2 · minimal** | **mesuré** : images/s médiane **< 50** sur 90 images d'un défilement réel | 7. cascade par lettre → `--cran: 0ms` · 8. recomposition des secteurs · 9. soudure des filets · 10. FLIP de la FAQ · 11. dégagement des modales |
| **3 · aucun** | `prefers-reduced-motion` | `langue.js` et `motion.js` ne s'exécutent pas |

**Jamais sacrifié, à aucun palier** : curseur du rail, odomètres, filet
de section active, barre de lecture, compteur des chantiers, étape du
parcours, filet de la question dépliée, filet de validation. Tout ça vit
dans `main.js`. **L'orientation n'est pas un budget, c'est un plancher.**

**L'escalade est à sens unique.** Un palier ne redescend jamais : une
page qui réactive ses animations dès que la machine respire produit un
scintillement pire que le problème qu'elle corrige.

**Une récompense de conception :** le palier 2 supprime toute la cascade
par lettre avec **un seul nombre** — `--cran: 0ms`. C'est le bénéfice
d'avoir fait dériver toutes les durées d'une variable unique. Et ce
n'est pas une cascade dégradée : c'est une inversion franche, soit
exactement ce que la direction demande par ailleurs. Le contraste reste
garanti — les deux états sont à 13,89:1 et il n'y a plus d'entre-deux
du tout.

**Vérification** — `node tools/palier-check.mjs`, tout passe :

```
PALIER 0    data-palier = 0 · 245 mots posés · --cran 230ms / 520ms
PALIER 1    écran 390 px      -> palier 1, 0 span, pas d'étiquette
            pointeur grossier -> palier 1, 0 span, pas d'étiquette
            4 cœurs / 4 Go    -> palier 1, 0 span, pas d'étiquette
PALIER 2    processeur bridé ×6 -> palier 2 (mesure : 30 i/s), --cran 0ms
ORIENTATION intacte aux paliers 0, 1 et 2
ESCALADE    bridé -> palier 2, débridé -> reste palier 2
```

Le palier 2 n'est pas simulé : le processeur est **réellement bridé**
par le protocole DevTools, la page défile, et elle s'en aperçoit toute
seule.

**Ce que ça ne remplace pas.** Un vrai téléphone. Le budget garantit que
la page **réagit** à un appareil lent ; il ne garantit pas que les
seuils sont les bons. Le seuil de 50 i/s et la fenêtre de 90 images sont
des choix, pas des mesures. Le premier essai sur appareil réel dira s'il
faut les bouger — et c'est maintenant un réglage de deux nombres, pas
une refonte.

---

## 8. CE QU'IL FAUT SAVOIR POUR LA SUITE

- `css/app.css` reste la **seule source**. Après toute modification :
  `node tools/css-critique.mjs` puis `node tools/cascade-check.mjs`,
  qui doit rendre 0.
- **Aucun état de départ d'animation dans le CSS.** L'état au repos est
  toujours la forme finale.
- **L'orientation ne vit jamais dans `motion.js` ni dans `langue.js`.**
  Les deux s'arrêtent sous `prefers-reduced-motion`. Odomètres, curseur
  du rail, filet de section active : tout ça est dans `main.js`.
- Avant d'ajouter un mouvement, **dire lequel des quatre verbes il est**.
  Si la réponse n'existe pas, ne pas l'ajouter.
- **Ne jamais scrubber l'opacité d'un élément qui porte du texte** : un
  scrub n'a pas d'état de repos, il a l'état où le visiteur s'est
  arrêté. § 2.5.
- **Ne jamais animer une propriété personnalisée héritée** depuis
  JavaScript : elle invalide le style de tout le sous-arbre à chaque
  image. Une transition CSS fait le même rendu pour rien. § 7bis C.
- **Tout travail de découpage passe par `requestIdleCallback`**, jamais
  par un déclencheur de défilement ni de survol. § 7bis C.
- **Toute animation ajoutée doit déclarer son palier de chute.** Un
  effet sans place dans le budget de dégradation n'a pas de place dans
  le site. § 7bis D.
- La suite de vérification, dans l'ordre où je la lancerais :
  ```
  node tools/serve.mjs 8099
  node tools/cascade-check.mjs        # 0 ecart
  node tools/langue-check.mjs         # TOUT PASSE
  node tools/etats-check.mjs          # TOUT PASSE
  node tools/contraste-survol.mjs     # aucune fenetre illisible
  node tools/contraste-arret.mjs      # rien de bloque a mi-opacite
  node tools/secteur-morph-check.mjs  # se termine nette
  node tools/palier-check.mjs         # les trois paliers tiennent
  node tools/deborde.mjs              # aucun contenu coupe
  node tools/theme-check.mjs          # 0 echec de contraste
  node tools/verif.mjs                # clavier, orientation, perf
  node tools/tache-traversee.mjs 11   # differences appariees, doit etre <= 0
  node tools/ab-phase8.mjs 7          # A/B general contre la version d'avant
  ```
