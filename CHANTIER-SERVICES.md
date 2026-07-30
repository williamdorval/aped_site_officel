# Chantier — section 02 · Services

Ouvert le 2026-07-30. Ce document tient les quatre choses qu'une
session vide doit pouvoir relire : **la cause réelle du défaut
d'affichage**, **ce que la recherche a rendu**, **la provenance et la
licence de chaque image**, et **ce qui a été décidé sans le
propriétaire**.

---

## 1 · LE DÉFAUT D'AFFICHAGE — la cause réelle

### 1.1 Ce qui a été mesuré, et avec quoi

Trois sondes écrites pour ce chantier, toutes reproductibles :

| Outil | Ce qu'il rend |
|---|---|
| `tools/svc-bug.mjs [adresse] [largeur] [clair\|sombre]` | six relevés : contenant de bloc · traversée pas à pas avec occultation réelle · dix rechargements · arrivée par ancre · les quatre boutons · la course |
| `tools/svc-recharge.mjs [adresse] [largeur]` | une seule question : après rechargement sur `#services`, la page défile-t-elle, et par quel mécanisme les quatre chantiers sont-ils atteignables ? |
| `tools/svc-cause.mjs [adresse] [largeur] [n]` | **la preuve** : recharge sur `#services`, traverse la position où le pin s'arme, et oppose les deux chemins d'arrivée |

### 1.2 LA CAUSE — le pin s'arme 284 px trop tôt

> **`ScrollTrigger` calcule la position de départ du pin à partir
> d'une mesure prise pendant que la page est DÉJÀ défilée jusqu'à
> l'ancre, et le décalage d'arrivée n'est jamais rajouté.**

Relevé du 2026-07-30, `node tools/svc-cause.mjs http://127.0.0.1:8099 1440 10`,
**dix passes sur dix, valeur identique** :

| Chemin d'arrivée | `ScrollTrigger.start` | Valeur juste |
|---|---|---|
| page chargée par le haut | **1944** | 1944 (= 2000 − 56 de barre) |
| rechargement sur `#services` | **1660** | 1944 |

L'arithmétique ferme le dossier : à l'instant où GSAP mesure, la page
est à `scrollY = 284` (le saut d'ancre brut) et le haut de la scène est
donc à **1716** dans l'écran. `1716 − 56 = 1660`. **Un nombre relatif à
l'écran est employé comme un nombre absolu dans le document.**

**La conséquence, mesurée :** à `scrollY ≈ 1665`, la scène **se
téléporte de 275 à 280 px vers le haut en une seule image**. Elle se
pose sur la bande que le contenu précédent occupe encore. C'est
exactement « la mise en page est cassée, le texte se superpose ».

C'est aussi pourquoi le défaut se voit **au rechargement et à l'arrivée
par ancre, jamais en descendant depuis le haut** : par le haut,
`scrollY = 0` au moment de la mesure, l'erreur vaut zéro, et tout est
juste. Le défaut n'est pas dans le rendu, il est dans **le chemin
d'arrivée**.

### 1.3 Trois autres défauts, mesurés au passage

**a) Le bouton « suivant » éjecte le visiteur hors de la section.**

`js/motion.js:285` vise
`st.start + (st.end − st.start) × (decalages[i] / course)`.

Or `course = rail.scrollWidth − piste.clientWidth` est la **distance
défilable**, tandis que `decalages[i] = offsetLeft` est **la position
de la carte dans le rail**. Deux dénominateurs différents employés
comme un seul. Une carte faisant 84 % de la piste, le décalage de la
dernière dépasse toujours la course :

| Largeur | `course` | `decalages[3]` | ratio |
|---|---|---|---|
| 1280 | 2281 | 2431 | **1,066** |
| 1440 | 2656 | 2831 | **1,066** |
| 1920 | 3104 | 3528 | **1,137** |

Mesuré à 1440 : le troisième clic vise **4775** alors que `st.end` vaut
**4600**. Le pin se relâche (`position` repasse à `static`) pendant que
le compteur affiche « 04 ». **Le quatrième chantier n'est jamais
présenté.** `indexPour()` mélange les deux mêmes grandeurs, donc
l'index est biaisé de la même façon.

**b) `is-pinned` est posée sans condition et n'est jamais retirée.**

`js/motion.js:233` pose la classe à l'initialisation ; `css/app.css:2728`
en tire `.svc.is-pinned .svc-piste { overflow: hidden; scroll-snap-type: none }`,
et `js/main.js:483` s'en sert pour **abandonner** l'écoute du
défilement natif. Conséquence relevée sur les trois largeurs, 10 fois
sur 10 : entre l'initialisation et l'armement du pin, **le défilement
horizontal natif est déjà mort et GSAP ne pilote pas encore**. Le
visiteur est garé sur la carte 01 sans aucun mécanisme pour atteindre
les trois autres. Après la fin du pin, la classe reste : la piste ne
redevient jamais parcourable.

**c) La huitième plaque du hero déborde sous le hero.**

Relevé aux trois largeurs, à `scrollY` 0 / 60 / 120 : la plaque
**« Québec »** dépasse le bas du hero et mord sur le seuil de la
section 02 de **21 à 25 px**. L'ordre de peinture met Services
au-dessus, donc ça ne masque pas de texte — mais c'est bien le hero qui
sort de sa boîte, et c'est la moitié visible du symptôme rapporté.

### 1.4 Le test qui verrouillait le défaut

`tools/services-check.mjs` passait, et il ne pouvait pas faire
autrement. Trois raisons, toutes des pièges déjà écrits dans
`CLAUDE.md § 8` :

1. **Il défile en sauts** (`page.evaluate(v => window.scrollTo(0, v))`,
   ligne 68) — piège 5, « un `scrollTo` qui saute casse un pin ». Un pin
   cassé par l'instrument ne peut pas montrer qu'il se casse tout seul.
2. **Il ne charge jamais la page par `#services`.** Or c'est le seul
   chemin d'arrivée où le défaut existe.
3. **Il ne demande jamais si quelque chose est peint par-dessus.** Il
   vérifie que le compteur, le nom et la jauge disent la vérité —
   c'est-à-dire que le tableau de bord est honnête pendant que la mise
   en page est cassée derrière lui.

Il pose aussi `sessionStorage["aped-entree-saut"]` (ligne 33), un
drapeau **supprimé du site** : la ligne ne fait plus rien.

### 1.5 Ce que ma propre première sonde a raté, et pourquoi

Notée ici parce que c'est le même genre d'erreur, commise le même jour.

- **Première version de `svc-bug.mjs`** : traversée démarrée à
  `svcTop − navH − 900` ≈ 1044 px, alors que le hero quitte l'écran à
  900 px. Elle commençait à mesurer **après** la seule fenêtre où un
  recouvrement est possible, et rendait « 0 fautif » sur un défaut bien
  présent. Piège 2 : *un cadrage de capture se relève, il ne se devine
  pas.*
- **Lecture hâtive d'un `scrollY` figé** : dix relevés à 1669 m'ont fait
  écrire « la page ne défile plus ». `svc-recharge.mjs` rend
  `pageBouge: true` — c'était le lissage du défilement, pas la page.
  **Une valeur qui ne bouge pas peut venir de l'instrument.**

### 1.6 Le correctif

Le mécanisme entier est retiré : **plus de pin, plus de piste
horizontale, plus de compteur « 01 / 04 », plus de `course`, plus de
`is-pinned`.** Les quatre défauts ci-dessus n'ont plus de support. Ce
n'est pas un contournement de `z-index` — il n'y en a jamais eu un seul
dans cette section, la sonde le confirme : le seul ancêtre transformé
de `#svc` était `#svc` lui-même, avec une matrice identité.

Le débordement de la plaque « Québec » (1.3 c) est corrigé séparément :
il appartient au hero, pas à cette section.

---

## 2 · CE QUE LA RECHERCHE A RENDU

Mesures prises dans un vrai navigateur sur les pages rendues, plus les
sources primaires. **Les chiffres non vérifiés à la source sont
marqués comme tels et ne servent pas de fondement.**

### 2.1 Le carrousel, en chiffres

| Source | Chiffre | Ce qu'il dit |
|---|---|---|
| Erik Runyon, Notre Dame, 2012-2013 — <https://erikrunyon.com/2013/01/carousel-interaction-stats/> | **~1 %** des visiteurs cliquent une diapositive ; **84 % de ces clics sont sur la position 1** | les positions 2 à 5 sont, en pratique, non publiées |
| idem, carrousels non rotatifs | 1,7 à 2,3 % de clics, position 1 à 48-62 % | le défaut ne vient pas de la rotation |
| Baymard — <https://baymard.com/blog/homepage-carousel> | 33 % des grands sites en ont un ; **46 % de ces implémentations ont des défauts d'usage** | exigence n° 2, mot pour mot : *« Avoid having carousel slides as the only or primary route to features or content »* |
| NN/g — <https://www.nngroup.com/articles/horizontal-scrolling/> | oculométrie : un utilisateur *« never glanced at the arrows, and thus never saw the other products »* | les flèches ne sont pas regardées |
| NN/g — <https://www.nngroup.com/articles/how-little-do-users-read/> | les gens lisent au plus **28 %** des mots, **20 % plus probable** ; sous **111 mots**, ~50 % | plafond de texte pour une vue d'ensemble |

> **Le chiffre qui décide n'est pas le 1 %. C'est le 84 %.** La section
> affichait « 01 / 04 » : par cette donnée, les chantiers 02, 03 et 04
> n'existaient pas.

### 2.2 Ce que font les meilleurs, relevé dans le DOM rendu

Sur toutes les pages de services qui ont pu être rendues — Linear
`/features`, Basement, Hello Monday `/services`, Locomotive
`/en/agency` — le relevé donne : `<details>` **0**, `<summary>` **0**,
`[role="tab"]` **0**, `[role="tabpanel"]` **0**, classes de carrousel
**0**.

> **Aucun ne cache sa liste de services derrière une interaction. Le
> clic est dépensé pour la PROFONDEUR, jamais pour la LISTE.**

Trois sites n'ont pas pu être rendus (Obys, Active Theory, Immersive
Garden : coquille WebGL derrière un chargeur). **Rien n'en est conclu.**

Patrons observés, du plus au moins sûr :

1. **Tout déjà déplié** — Locomotive imprime ses 18 compétences en
   texte statique ; Basement, 4 groupes + 13 sous-items. Rien ne peut
   être manqué, rien à construire.
2. **Index d'ancres + sections empilées** — Hello Monday ouvre par un
   littéral `Jump ahead:` qui **nomme les quatre** avant tout
   défilement. Quatre `<a href="#…">` : survit au no-JS, au mouvement
   réduit, à tous les paliers, et conserve la position par
   construction.
3. **Vue d'ensemble de 4 + phrase de bénéfice + sous-items** —
   Basement : titre de 2-3 mots, phrase de 19-23 mots, 2-4 sous-items.
   **Les quatre phrases partagent un seul squelette** (« From X to Y,
   we <verbe>… »), et c'est ce qui fait lire quatre affirmations comme
   un seul standard.

### 2.3 Longueurs mesurées

| Palier | Titre | Ligne de bénéfice |
|---|---|---|
| Carte de vue d'ensemble (Linear, 8 cartes) | 1-2 mots (moy. 1,4) | **5-9 mots**, 34-67 car. (moy. 7,1 / 49,5) |
| Section (Basement, 4 capacités) | 2-3 mots | **19-23 mots**, 132-157 car. |
| Prose de détail (Hello Monday) | — | 55-74 mots, et **seulement après** que l'index ait nommé les quatre |
| Sous-item (Locomotive, 18 items) | — | 1-2 mots, 6-16 car. |

### 2.4 Les trois choses reprises, et pourquoi

1. **Imprimer les quatre noms en texte statique ; ne dépenser le clic
   que sur la profondeur.** Le 84 % de Runyon dit que tout ce qui
   s'atteint par une flèche est, en pratique, non publié.
2. **Ne rien cacher d'essentiel derrière l'ouverture.** Nom, bénéfice,
   délai et points inclus restent lisibles sans un seul clic ; le
   détail ajoute la prose, les exemples, la démonstration et le CTA.
3. **Un seul squelette de phrase pour les quatre**, au même palier de
   longueur. Quatre affirmations séparées deviennent alors un standard.

### 2.5 Ce qui est refusé

| Chiffre trouvé | Verdict |
|---|---|
| « la divulgation progressive accélère la première tâche de 30 à 50 % » | **NON VÉRIFIÉ** — aucune étude primaire localisable. Écarté |
| « réduit le temps de tâche de 20 à 40 % » | **NON VÉRIFIÉ**. Écarté |
| Baymard, 27 % vs 8 % (onglets horizontaux contre sections repliées) | **SECONDAIRE** — l'article courant ne réénonce pas les deux nombres. Le *sens* est retenu, **les nombres ne sont pas écrits sur le site** |
| Conversionista 40 %/2 %, Adobe +23 %, ServerTastic +16,48 %… | **SECONDAIRE**, agrégés par un billet tiers, non vérifiés à la source. Écartés |

---

## 3 · IMAGES — provenance et licence

### 3.1 Le registre des trois images employées

Chaque image de la section est **déjà dans le dépôt**, self-hébergée,
et sa licence est écrite dans un fichier du dépôt. Aucun
téléchargement, aucun octet ajouté, **zéro requête tierce**.

| Carte | Fichier | Octets | Ce que c'est | Source, où c'est écrit | Licence | Étiquette affichée |
|---|---|---|---|---|---|---|
| 01 · Sites web | `images/secteurs/restaurant-hero.webp` | 18 954 | photographie d'une salle de bistro rustique, **posée à l'intérieur de la maquette**, à la place où un vrai site met sa photo | Pexels #32667186, catalogué dans `tools/secteurs-photos.mjs:111` avec `page:` et `licence:` | **Pexels** — usage commercial, modification autorisée, aucune attribution exigée. Texte cité verbatim dans `tools/secteurs-photos.mjs:602-608` ; table dans `PHASE-7.md:411-414` | « Exemple · pas un vrai client » |
| 02 · Automatisation | `images/secteurs/garage-hero.webp` | 33 802 | photographie d'un atelier de mécanique en activité | Pexels #33814734, `tools/secteurs-photos.mjs:129` | **Pexels**, idem | « Exemple · pas un vrai client » |
| 03 · Immobilier | `images/tour/poster.webp` | 78 908 | photographie de la terrasse d'une propriété — **c'est l'image d'ouverture de la visite 360 elle-même** | Poly Haven, *Lythwood Lodge*, KwaZulu-Natal, auteur **Greg Zaal** ; `tools/tour-images.mjs:60-76` et `:386` | **CC0** (domaine public), `polyhaven.com/license` | « Démo · ce ne sont pas nos photos » |
| 04 · Logiciels | — | — | aucune photographie : la vue est l'interface, construite en markup | — | — | « Exemple · pas un vrai client » |

`tools/secteurs-photos.mjs --licences` recharge chaque page source
**et** sa page de licence dans un navigateur avec tête, et rend le
statut HTTP plus l'auteur déclaré. C'est cet outil qui a servi de
preuve, pas une supposition.

### 3.2 Ce qui a été REFUSÉ, et c'est le point le plus important

> **Les cinq `images/real-*.webp` ne peuvent pas être employées.** Le
> brief demandait « un vrai site magnifique » sur la carte 01 ; ces
> cinq captures sont les seules images de site du dépôt, et **aucune
> n'a de licence documentée nulle part** — ni dans `ARCHITECTURE.md`,
> ni dans un générateur, ni dans un commentaire, ni dans les
> métadonnées, qui ont été effacées au ré-encodage WebP.

| Fichier | Pourquoi il est bloqué |
|---|---|
| `images/real-pneus.webp` | aucune licence, **et il contient les marques MICHELIN, FALKEN, KUMHO, VREDESTEIN, METHOD, VISION, DAI, FUEL, BRAELIN** — une exposition de marque indépendante du droit d'auteur |
| `images/real-restaurant.webp` | aucune licence, et il incorpore une douzaine de photographies culinaires dont la licence est elle-même inconnue |
| `images/real-carrosserie.webp` | aucune licence, une dizaine de photos de véhicules et des marques identifiables |
| `images/real-neige.webp` | aucune licence |
| `images/real-interieur.webp` | aucune licence, et deux blocs de texte s'y rendent **espaces supprimés** (« Ondessinedesespacesquivousressemblent ») — une signature de modèle génératif, pas de navigateur |
| `images/_retire/service-*.webp` (4) | aucune licence, artefacts d'IA visibles (« Exoansions », « Bistry's Carle », code illisible), **et les quatre violent les quatre interdits absolus** du § 5 : coins arrondis, ombres portées, dégradés, flou. C'est presque certainement pourquoi ils sont dans `_retire/` |

**L'absence de métadonnée n'est pas une preuve de propreté** : le
ré-encodage les a effacées, donc on ne peut plus savoir. Sur une règle
qui dit « licence claire et **vérifiée** », ne pas savoir vaut non.

### 3.3 Deux constats trouvés en chemin, hors périmètre

1. **`logo/LOGO_APED.png` et `logo/LOGO_APED_NOM.png` portent un
   manifeste C2PA signé** : `gpt-image` 2.0, OpenAI Media Service API,
   `digitalSourceType = trainedAlgorithmicMedia`, plus une action
   `c2pa.watermarked.unbound`. `PHASE-6.md` réserve 9 le soupçonnait ;
   c'est maintenant **prouvé cryptographiquement**. Les deux fichiers
   ne sont référencés nulle part dans le site — la marque affichée est
   `images/logo-mark.svg`, vectorielle. Rien à corriger dans le code,
   mais on ne peut pas revendiquer l'exclusivité sur ces deux PNG.
2. **`images/og.png` affiche « 24 h · Délai de réponse » et
   « 12+ · Industries couvertes ».** Le site dit **12 h** partout, et
   `CLAUDE.md § 12` sépare explicitement le délai de réponse (12 h) du
   préavis de réservation (24 h) — « les deux ne sont pas la même
   chose ». C'est la carte qui s'affiche quand quelqu'un partage le
   site, et **aucun `*-check.mjs` ne lit le texte dans un PNG**. C'est
   une fausseté au sens du § 0.A, dans le seul endroit du site qu'un
   outil ne regarde pas.

---

## 4 · DÉCISIONS PRISES SANS LE PROPRIÉTAIRE

| # | Décision | Pourquoi celle-là, et ce qui a été écarté |
|---|---|---|
| **D1** | **La carte Immobilier ne crée PAS un second lecteur 360.** Elle défile vers `#visite` et déclenche le bouton existant | Le brief dit « réutilise-le, ne le reconstruis pas ». Une seconde instance de Pannellum, ce sont 8,5 Mo de panoramas chargés deux fois et un deuxième moteur pour montrer la même pièce. Mesuré après correctif : `nbLecteurs: 1`. Écarté : instancier un lecteur dans la carte |
| **D2** | **Les vues restent CONSTRUITES ; ce sont les photographies qui entrent DEDANS.** Une seule carte porte une photo seule (03) | C'est le point où je m'écarte le plus du brief, donc voici l'argument en entier. Le brief demande « de vrais visuels » à la place des « maquettes filaires ». Trois raisons de ne pas remplacer les quatre écrans par des photos : **(a)** on n'a **aucune** image de site, d'automatisation ou de logiciel dont on puisse énoncer la licence — § 3.2 ; **(b)** `PHASE-7.md:163` a déjà arbitré « les quatre écrans sont construits, pas photographiés », et le relevé de recherche montre que Linear, Stripe et Vercel montrent tous de l'**interface**, jamais de la photo de banque, précisément sur ces catégories ; **(c)** une photo de portable posé sur un bureau ne montre pas notre travail. **Le vrai reproche était juste** : une case grise ne vend rien. Le correctif est donc d'y mettre la photographie qui manquait — c'est la photographie qui fait qu'un site a l'air d'un site. Écarté : télécharger quatre photos de banque et les poser à la place des maquettes |
| **D3** | **Le cablage de la carte 02 est supprimé** (5 nœuds, 8 fils, 1 jeton animé) | Le brief : « pas un diagramme de développeur ». Un patron de PME ne lit pas un graphe de nœuds, il lit une **journée**. Restent le journal — ce qui s'est fait, et « 3 h 40 non travaillées » — et la photo de l'atelier à qui ça arrive. Écarté : simplifier le graphe |
| **D4** | **Plusieurs fiches peuvent être ouvertes en même temps** (comportement natif de `<details>`, non contraint) | Le NN/g le demande explicitement pour les accordéons, et fermer la 01 parce qu'on ouvre la 03 empêche la seule chose qu'un visiteur veut faire ici : comparer deux chantiers. Écarté : un seul ouvert à la fois |
| **D5** | **Les points inclus vivent dans le détail, pas dans la vue d'ensemble** | Vue d'ensemble = nom + bénéfice + délai, soit ≈ 104 mots pour les quatre, sous le seuil de 111 mots où le NN/g mesure encore ~50 % de lecture. Rien d'essentiel n'est caché : ce qu'on vend, ce que ça donne et combien de temps ça prend sont lisibles sans un clic. Écarté : tout déplier |
| **D6** | **« Testé sur téléphone avant l'écran d'ordinateur » → « Pensé sur téléphone d'abord, l'ordinateur ensuite »** | `CLAUDE.md § 9` : rien n'a jamais été vérifié sur un appareil réel, et il est interdit de le laisser entendre. L'ordre de conception, lui, se prouve dans le CSS. **Si le propriétaire ouvre vraiment chaque livraison sur un téléphone, l'ancienne ligne est meilleure : qu'il la remette** |
| **D7** | **« Fiche Google Business montée et tenue à jour » → « Votre fiche Google montée et remplie au complet »** | « tenue à jour » sans borne a la forme exacte de « hébergement inclus » (constat A4) : un entretien perpétuel non facturé promis dans un chantier d'une semaine, alors que la FAQ le place dans un plan mensuel **facultatif**. Ça coûte un argument de vente. **Si l'entretien est réellement compris pendant N mois, écrire la durée est plus fort que les deux versions** |
| **D8** | **L'appât ne vend plus « deux documents, 91 pages »** mais le guide que son bouton remet : 42 pages, 24 tâches, 13 domaines | Le bouton télécharge **un** document. La structure annoncée — « treize domaines, tâche par tâche, avec le temps et l'argent » — est celle du guide 1 seul ; le guide 2 s'annonce « 12 usages · 8 protocoles · 42 sources ». **Si le propriétaire tient aux 91 pages, il faut deux liens**, comme le pied de page en a déjà deux |
| **D9** | **La réserve sur les délais est ajoutée, avec les mots exacts du hero** | `.fiche-foot` du hero est en `display: none` sous 64em : **sur téléphone, les quatre délais de cette section étaient les seuls délais affichés du site, et rien ne les qualifiait.** Une même réserve dite deux fois différemment redevient deux affirmations à comparer, d'où le copier-coller |
| **D10** | **« Un site qui travaille pendant que vous dormez » est retiré** | Seule phrase de la section qui aurait pu vivre sur le site de n'importe quelle agence, et sa vérité est **conditionnelle** : « travaille » sous-entend « rapporte », et le point 4 de la même carte reconnaît que la réservation en ligne n'existe que « quand ça s'applique » |
| **D11** | **Deux lignes proposées par l'audit ont été REFUSÉES faute d'appui** : « Livré par étapes : ce qui sert le plus, en premier » et « Chaque automatisation approuvée avant d'être branchée » | Aucune des deux n'est écrite ailleurs dans le site. Je n'invente pas un engagement de méthode. « Maquettes approuvées avant la première ligne de code » a été gardée, elle, parce qu'elle est appuyée mot pour mot par le Parcours (`index.html:2301`) |
| **D12** | **Les quatre noms de chantier ne sont PAS raccourcis** à 1-3 mots | « Sites web et boutiques » et « Immobilier et visibilité locale » font 4 mots. Les renommer touche 4 à 6 endroits chacun et défait l'alignement hero↔Services obtenu par la décision D3 de la nuit du 29. Un mot gagné ne paie pas six occasions de contradiction entre deux listes |

### 4.1 Ce qui reste suspendu au propriétaire

1. **La plaque « 7 · Produits » compte la vidéo.** `grep vidéo index.html`
   ne rend **qu'une ligne : celle de la plaque**. Six produits sur sept
   sont soutenus par la section Services ; le septième n'existe nulle
   part. Deux sorties honnêtes : la vidéo entre dans le chantier 03 en
   cinquième point, ou la plaque passe à **6**. Rien n'a été touché.
2. **Les cinq adresses en ligne des projets** — déjà ouvert dans
   `AUDIT-VERACITE.md` V1, et le § 3.2 ci-dessus lui ajoute un
   deuxième motif : sans licence, ces cinq images ne peuvent servir
   nulle part ailleurs sur le site.
3. **Qui tourne les panoramas d'une visite virtuelle**, et si la
   séance de photo est comprise dans le chantier d'une semaine.
4. **`images/og.png`** — voir § 3.3.
