# Refonte APED — phase 6

État au 2026-07-25. Tout ce qui suit est **mesuré**, jamais estimé. Les
instruments sont dans `tools/` et se relancent : `node tools/audit.mjs`,
`node tools/verif.mjs`, `node tools/debord.mjs`, `node tools/hero-check.mjs`,
`node tools/secteurs-check.mjs`, `node tools/titres.mjs`, `node tools/perf-probe.mjs`,
`node tools/debord404.mjs`.

Serveur de test : `node tools/serve.mjs 8099`.

Captures **avant** : `refonte-captures/audit2/` — prises au début de cette
phase, avant toute modification.
Captures **après** : `refonte-captures/audit6/`, même script, mêmes viewports,
mêmes positions de défilement. Les deux jeux se comparent index par index.

---

## 1. LES HUIT POINTS DU CLIENT

| # | Demande | État | Preuve chiffrée |
|---|---------|------|-----------------|
| 1 | Hero : AGENCE coupé, densité trop faible, colonne droite vide | **fait** | 0 grain hors cadre sur 5 largeurs · densité d'encre 0,72 → 0,96 · corps relatif 0,215 → 0,26 · fiche technique de 4 prix réels dans la colonne droite |
| 2 | Séquence d'entrée absente | **fait** | rideau CSS pur, 980 ms bout en bout, une fois par session, `pointer-events: none`, absent sous `prefers-reduced-motion`, LCP identique avec et sans (médianes 124 et 112 ms) |
| 3 | Scroll des projets mal calibré | **fait** | section 20 588 → **4 048 px** (−80 %) · coût par projet 4 044 → **810 px** (−80 %) · pin supprimé |
| 4 | Secteurs : aperçus vides, « douze » au lieu de treize | **fait** | 13 maquettes construites en HTML/CSS, 13 archétypes distincts, 13/13 vérifiées une par une · cadre 250 → 423 px · visibles aussi sur téléphone |
| 5 | Calculateur et comparatif trop gros | **fait** | 11 → **3 curseurs** visibles · 2 chiffres géants avant toute interaction · comparatif : 24 objets à comparer → 1 piste par tâche + un total |
| 6 | Référence : ne donne pas envie | **fait** | mécanisme en 3 temps + barème en règle graduée · plus aucune colonne vide |
| 7 | Contact : contraste, dégradé, hiérarchie | **fait** | 1:1 → **13,89:1** sur la grande tuile · dégradé supprimé · 5 tuiles → 3 poids · réassurance ajoutée |
| 8 | Manque d'animations | **fait** | 7 déclinaisons ajoutées, toutes N1/N2 documentées dans `js/motion.js` |

---

## 2. LE HERO — POURQUOI AGENCE ÉTAIT COUPÉ

Ce n'était ni la densité ni la taille du canvas. C'était la **rotation**.

La plaque est inclinée de 2,2°. Un bloc large qui bascule descend de
`largeur / 2 × |sin(angle)|` à chaque extrémité. Mesure à 1440 :

| | |
|---|---|
| largeur du bloc | 968 px |
| `\|sin 2,2°\|` | 0,0384 |
| descente de chaque côté | **18,6 px** |
| hauteur du bloc à plat | 296,6 px |
| **emprise réelle une fois tourné** | **333,8 px** |
| hauteur du canvas | **305 px** |
| **débordement** | **28,8 px, soit 14,4 de chaque côté** |

`drawFrame()` supprime les grains hors cadre. Le bas d'AGENCE était donc
littéralement amputé, et rien dans le code ne pouvait le rattraper.

**Deux verrous posés, pas un.** Le cadre réserve la place que la rotation
réclame (`aspect-ratio` 1000/292 → 1000/310), et `layoutQuiRentre()` recalcule
la composition à l'échelle qui rentre si elle déborde encore. Mesure après
correction, `data-grains` et comptage des cibles hors cadre :

| Largeur | Cadre | Emprise | Échelle | Grains hors cadre |
|---|---|---|---|---|
| 1920 | 1528 × 432 | 422 | 0,941 | **0** |
| 1440 | 1048 × 325 | 308 | 1,000 | **0** |
| 1024 | 954 × 296 | 282 | 1,000 | **0** |
| 390 | 350 × 126 | 112 | 1,000 | **0** |

**Le flou d'AGENCE n'était pas un manque de densité.** La couverture était
déjà pleine (pas 1, grain 2 = 200 %). Le mot recevait 28 % de grains minium
mélangés à 72 % d'encre : à cette taille, un tramage à deux tons sur un fût de
12 px ne se lit pas comme de la matière, il se lit comme du **bruit**. Ratio
porté à 0,96, corps relatif de 0,215 à 0,26.

---

## 3. LA COLONNE DROITE DU HERO

Elle était vide. Ce qui manque à un patron de PME au premier écran, ce n'est
pas une image : c'est le **prix**. C'est aussi le deuxième facteur de
crédibilité relevé par le Nielsen Norman Group
(<https://www.nngroup.com/articles/trustworthy-design/>) : *upfront disclosure*,
avec un cas documenté de site rejeté par les testeurs parce qu'il fallait
écrire pour obtenir un tarif.

Quatre chantiers, quatre prix de départ réels, le délai de réponse. Chaque
filet de rangée s'assemble en grains puis se ressoude — la limaille à
l'échelle d'une ligne de fiche. Masquée sous 64em : la même grille arrive
400 px plus bas dans Services.

---

## 4. LES PROJETS — LES DEUX ERREURS, MESURÉES TOUTES LES DEUX

| | Phase 3 | Phase 5 | **Phase 6** |
|---|---|---|---|
| Course de défilement par projet | 1 075 px | 4 044 px (pin 3 200 + bande) | **810 px** |
| Vitesse de l'image | 2,74 px / px de doigt | 0,85 | **0,68** |
| Hauteur de la section | — | 20 588 px | **4 048 px** |
| Part de la page totale | — | 60 % | **22 %** |
| Largeur du cadre | 330 px (2,71× de réduction) | 330 px | **440 px (2,05×)** |
| Pin | non | oui | **non** |

Corriger la vitesse en allongeant la course avait produit le défaut inverse.
L'arbitrage était ailleurs : **on n'a pas besoin de voir la page cliente en
entier**. La course de l'image est plafonnée à 0,9 hauteur de cadre — le
premier écran du site livré plus un peu de la suite — et la plage de
défilement est la traversée naturelle de la bande, donc elle n'ajoute pas un
seul pixel à la page.

**Réserve honnête, section 8.**

---

## 5. LES TREIZE SECTEURS

Les douze images précédentes étaient des visuels de banque réduits 4 à 5 fois
et recadrés par `object-fit: cover`. Le treizième bouton n'avait rien.

Remplacées par **treize maquettes construites en HTML et CSS**, un archétype
de mise en page par métier, un mouvement par métier :

| # | Secteur | Archétype | Ce qui bouge |
|---|---|---|---|
| 01 | Restauration | menu à prix | un marqueur d'accent parcourt les plats |
| 02 | Boutique | grille 2×2 | le panier s'incrémente, les tuiles se posent |
| 03 | Coiffure | colonne de plages | les plages se prennent une à une |
| 04 | Gym | barres de semaine | le jour actif balaie la semaine |
| 05 | Hébergement | calendrier | la plage de dates s'étend |
| 06 | Garage | soumission | trois champs se remplissent, le prix tombe |
| 07 | Construction | phases | la barre d'avancement franchit les 4 phases |
| 08 | Paysagement | territoire | les cellules couvertes se remplissent |
| 09 | Clinique | rendez-vous | la coche se trace en deux traits |
| 10 | Immobilier | panorama | le panorama tourne, le point d'intérêt bat |
| 11 | Juridique | document | la signature se trace |
| 12 | Photographe | galerie | les cadres avancent |
| 13 | **Votre industrie** | **la matière** | les blocs arrivent dispersés et s'assemblent |

Vérifié un par un : `refonte-captures/secteurs/01..13`, 13/13 actifs, légende
correcte, console propre. Cadre porté de **250 à 423 px**.

**Sur téléphone**, l'aperçu était `display: none` : la vitrine du site
n'existait pas du tout. Il est maintenant rendu partout, et comme il n'y a pas
de survol au tactile, il défile tout seul quand la section est à l'écran —
et **s'arrête définitivement** dès que le visiteur touche une pastille.

Texte corrigé : « Douze secteurs » → « Treize secteurs, treize aperçus ».

---

## 6. LE CALCULATEUR

| | Avant | Après |
|---|---|---|
| Curseurs visibles | **11** | **3** |
| Chiffres au premier plan | 1 noyé dans 18 lignes | **2, en pleine largeur** |
| Résultat avant interaction | oui | oui, **inchangé** |
| Hauteur de la section (1440) | 1 716 px | **1 211 px** |
| Modèle métier | 8 tâches pondérées | **identique** |

Le curseur maître demande **un** total d'heures d'administration et le
répartit sur les huit tâches en gardant leur mélange. Répartition à la plus
forte moyenne : la somme des entiers vaut exactement le total demandé, sinon
la poignée et le chiffre affiché à côté se contrediraient. Le reste — chiffre
d'affaires, huit tâches, détail du calcul, méthode — est replié dans deux
panneaux.

**Comparatif :** six lignes de deux barres, deux étiquettes et deux valeurs
chacune, soit 24 objets à comparer deux à deux. Remplacé par le **total
d'abord** (à la main / automatisé / écart) puis **une seule piste par tâche**,
où la portion d'accent est ce qui reste une fois automatisé. L'écart n'est
plus une soustraction à faire, c'est la portion qui dépasse.

---

## 7. CONTACT ET RÉFÉRENCE

**Contact.** La grande tuile était une photo voilée par un **dégradé** — le
seul de la page, en contradiction frontale avec la direction — et son titre
mesurait **1:1** sur la surface de base. Remplacée par un aplat inverse plein
plus la trame de grains de la signature : le contraste se **mesure** parce que
la surface est nommée. Cinq tuiles de poids égal → **trois poids**. Filet
d'accent en grains au survol de chaque tuile, comme partout ailleurs.
Réassurance ajoutée sous les cinq entrées, là où l'hésitation a lieu.

**Référence.** Un titre énorme à gauche, deux paragraphes à droite séparés de
60 px de rien, une colonne basse vide. L'offre était bonne, sa présentation ne
**montrait** rien. Refaite : trois temps reliés par un filet qui se trace au
défilement, puis le barème en **règle graduée** — le montant n'est plus une
phrase à lire, c'est une échelle qu'on parcourt, et la dernière barre va au
bord du cadre.

---

## 8. LES SEPT ANIMATIONS AJOUTÉES

Toutes sont des déclinaisons de la limaille, toutes portent leur niveau dans
`js/motion.js`, toutes en `transform` / `opacity` / `clip-path` uniquement,
toutes coupées sous `prefers-reduced-motion`.

| # | Où | Idée | Niveau |
|---|---|---|---|
| 13 | Séquence d'entrée | le monogramme se pose, le rideau se retire, les grains composent APED dans la foulée | N2 |
| 14 | Filets de la fiche technique | s'assemblent en grains, se ressoudent | N2 |
| 15 | Cadres de projet | la capture se découvre du haut vers le bas, 380 ms | N2 |
| 16 | Titres de section | balayage **ligne par ligne**, 300 ms, jamais un mot isolé | N2 |
| 17 | Blocs qui se reprennent | arrivent décalés latéralement en alternance et se reprennent | N2 |
| 18 | Frise du processus | la ligne **pousse** les étapes en place — défilement latéral porteur d'information | N2 |
| 19 | Programme de référence | le filet relie les trois temps, les six barres du barème se posent | N2 |

Plus : la pointe s'ouvre en grand sur les images et les cadres (`is-large`)
sans les déplacer, et sa liste de cibles aimantées passe de 6 à 11 sélecteurs.

---

## 9. LES DÉFAUTS TROUVÉS EN PLUS DES HUIT

| # | Défaut | Preuve | État |
|---|---|---|---|
| 1 | **`</div>` orphelin** dans la section Comparatif | `index.html` ligne 709 | corrigé |
| 2 | **Filigrane APED coupé** : boîte de 247 px pour une encre de 296 | `scrollHeight` 296 / `clientHeight` 247 | corrigé, et passé en contour d'un filet |
| 3 | **Compteur de projet à 2,42:1** en clair, 1,9:1 en sombre | `--accent-text` sur `--surface-inverse` | corrigé, token `--accent-on-inverse` créé, **7,31:1** |
| 4 | **Débordement horizontal à 320 px**, jamais fermé depuis la phase 3 | `scrollWidth` 330 pour 320 | **corrigé**, cause : colonne de grille en `auto` et bouton en `nowrap` |
| 5 | **Aperçu des secteurs absent sur téléphone** | `display: none` sous 64em | corrigé |
| 6 | **Colonne gauche de la FAQ vide** sur ~700 px | mesure à 1440 | corrigé, elle porte la sortie de secours |
| 7 | **Quatuor de l'Agence trop creux** : décalages jusqu'à 96 px | section de 702 px pour 4 blocs courts | corrigé, 702 → 535 px |
| 8 | **Opacité employée comme couleur** dans `.shot-count` et deux blocs inversés | `opacity: 0.72` → 4,3:1 | corrigé, couleurs nommées |
| 9 | **`color-mix` vers `transparent`** : mélange vers le canevas, pas vers le fond réel | `.cell--inverse p`, `.plate--inverse p` | corrigé |
| 10 | **LCP à 588 ms** : `.hero-claim` en `opacity: 0` n'était pas candidat au LCP | mesure `PerformanceObserver` | corrigé, le titre ne s'anime plus |
| 11 | **222 ms de scripts avant le premier rendu** | tâche longue mesurée à `t = 65 ms` | corrigé, scripts injectés après deux images |
| 12 | **Titres coupés en plein mot** pendant le balayage | capture mobile : « selo  le métie » | corrigé, balayage par ligne enveloppée |
| 13 | **Texte accessible altéré** par le découpage : « changeselon » | `textContent` du `<h2>` | corrigé, espaces rétablies |
| 14 | **404 : débordement de 8 px à 1440** | `scrollWidth` 1448 pour 1440 | corrigé |
| 15 | **Repli textuel du hero en casse minuscule** alors que le canvas trace des capitales | `.plate-small` | corrigé |
| 16 | **533 Ko d'images mortes** (12 `demo-*.webp` + `contact-bg.webp`) | plus aucune référence | supprimées |
| 17 | **Conflit `rise` / `settle`** sur les valeurs : deux animations pilotant la même opacité | — | corrigé |

---

## 10. MESURES

### Avant / après, même script, mêmes viewports

| | Avant (audit2) | **Après (audit6)** | Cible |
|---|---|---|---|
| Hauteur de page, 1440 | 34 483 px | **18 022 px** (−48 %) | plus court ✓ |
| Section Projets | 20 588 px | **4 048 px** (−80 %) | ✓ |
| Débordement horizontal, 320 px | 330 / 320 | **320 / 320** | aucun ✓ |
| Débordement, 360 / 390 / 430 / 768 | aucun | **aucun** | ✓ |
| Texte coupé | 1 | **0** | 0 ✓ |
| Échecs de contraste AA | 8 | **1** (décoration pure) | 0 ✓ |
| Éléments de texte mesurés | 339 | **373** | — |
| Erreurs console, 5 vues | 0 | **0** | 0 ✓ |
| Requêtes tierces | 0 | **0** | 0 ✓ |
| Grains au hero, 1440 | 21 335 | **25 175** | — |

### Performance

**Conditions, parce qu'elles changent tout.** Chromium headless, poste de
travail Windows, serveur local. Les chiffres ci-dessous sont des **médianes
sur 7 chargements**, mesurées trois fois de suite (`node tools/perf-probe.mjs 7`).

Deux mises en garde honnêtes :

- **Le tout premier chargement d'un navigateur qui vient de démarrer donne 600
  à 950 ms.** C'est le démarrage de Chromium, pas la page : le deuxième
  chargement retombe immédiatement à ~120 ms. Un rapport qui ne donnerait que
  le premier chiffre serait faux, un rapport qui ne donnerait que le second
  serait incomplet.
- **Une mesure prise pendant qu'un autre script Playwright tourne monte à
  280–310 ms.** Je l'ai constaté et refait au calme. Toute mesure de
  performance de cette phase a été reprise machine au repos.

| | Mesure | Cible |
|---|---|---|
| LCP, médiane sur 7 chargements | **112 – 124 ms** | < 300 ✓ |
| LCP, premier chargement d'un navigateur froid | 600 – 950 ms | — (démarrage du navigateur) |
| Élément LCP | `span.plate-big`, le mot APED | — |
| CLS | **0** | 0 ✓ |
| Tâches au-dessus de 50 ms | **aucune** en régime établi, une de 55 ms au démarrage à froid | < 50 ✓ |
| FPS pendant le défilement (moyenne / p95 / pire) | **60 / 60 / 60** | 60 ✓ |
| Latence d'ouverture d'une modale au clic | **85 ms** | < 200 ✓ |
| Requêtes tierces | **0** | 0 ✓ |
| Poids transféré, page entière parcourue | 759 Ko | — |

**Le LCP était à 588 ms au début de cette phase.** Deux causes, corrigées
toutes les deux :

1. `.hero-claim` portait `opacity: 0` en attendant son animation. Un élément à
   opacité nulle n'est pas candidat au LCP : le plus grand élément de la page
   n'était donc compté qu'à la fin de son animation. Le titre ne s'anime plus.
2. Les huit scripts en `defer` — dont 112 Ko de GSAP et ScrollTrigger —
   formaient une tâche de 222 ms qui s'exécutait **avant** que le navigateur ait
   l'occasion de peindre. Ils sont maintenant injectés après deux images, donc
   après le premier rendu. La page est conçue pour être complète sans eux.

Le comptage des tâches longues de la phase 5 (« 83 ms ») ne mesurait que
l'échantillonnage du hero. Mesuré isolément aujourd'hui, ce même
échantillonnage prend **10 ms**.

### Clavier

| | |
|---|---|
| Arrêts de tabulation | **84** |
| Sans anneau de focus | **0** |
| Piège de tabulation | **aucun** |
| Premier arrêt | lien d'évitement |
| Modale : focus piégé | **oui** |
| Modale : retour au déclencheur | **oui** |

### Orientation — les 10 positions

10 positions sur 10 affichent la section active **et** le nombre de sections
restantes. La barre de lecture progresse de 0 à 1 440 px linéairement.

### Mouvement réduit

Rideau absent du document, `reduced-motion` posée, aucune erreur, la plaque
est rendue nette d'un coup (25 175 grains posés directement sur leurs cibles).

---

## 10bis. LA RECHERCHE — 15 TECHNIQUES, ET CE QUI EN A ÉTÉ FAIT

Sources chargées et vérifiées. Deux pistes n'ont rien donné et sont marquées
comme telles plutôt que remplacées par des URL inventées : aucun fil Reddit
exploitable, aucune page de collection sur godly.website.

| # | Technique | Source | Verdict ATELIER | Appliqué ici |
|---|---|---|---|---|
| 1 | `animation-timeline: scroll()` | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations) | **GARDE** | pas encore : le support Firefox/Safari est inégal et la barre de lecture marche déjà en rAF. Candidat n°1 pour la suite |
| 2 | `animation-timeline: view()` | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations) | **GARDE** | idem, même raison |
| 3 | View Transitions API same-document | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using) | **ÉCARTE** pour les sections | déjà utilisée pour la seule chose qui le mérite : la bascule clair/sombre. Son fondu par défaut est un flou de transition, interdit ailleurs |
| 4 | Tracé courbe au scroll (MotionPath) | [Codrops](https://tympanus.net/codrops/2025/12/17/building-responsive-scroll-triggered-curved-path-animations-with-gsap/) | **ÉCARTE** | une courbe organique contredit une matière qui se reprend en ligne nette |
| 5 | Texte 3D sur cylindre | [Codrops](https://tympanus.net/codrops/2025/11/04/creating-3d-scroll-driven-text-animations-with-css-and-gsap/) | **ÉCARTE** | la profondeur 3D implique perspective et ombrage |
| 6 | Scène 3D cinématique WebGL | [Codrops](https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/) | **ÉCARTE** | dépendance tierce, shaders, LCP |
| 7 | Zoom par calques | [Codrops](https://tympanus.net/codrops/2025/10/29/building-a-layered-zoom-scroll-effect-with-gsap-scrollsmoother-and-scrolltrigger/) | **ÉCARTE** | simule une profondeur de champ, donc un flou |
| 8 | Transition par masque au scroll | [Codrops](https://tympanus.net/codrops/2026/03/11/svg-mask-transitions-on-scroll-with-gsap-and-scrolltrigger/) | **GARDE**, forme géométrique nette seulement | **appliqué** — découverte des cadres de projet et balayage des titres, en `clip-path: inset()` rectangulaire |
| 9 | Animations consécutives sur un élément épinglé | [Codrops](https://tympanus.net/codrops/2024/11/20/consecutive-scroll-animations-with-one-element/) | **GARDE** | **retiré volontairement** : c'était le pin des projets, et il coûtait 16 000 px de page. Le point 3 du client dit exactement le contraire de cette technique |
| 10 | Défilement latéral épinglé | [GSAP Vault](https://gsapvault.com/blog/gsap-animation-examples) | **GARDE sous condition d'un repère** | **appliqué sans pin** — la frise du processus : la ligne pousse les étapes en place. Le repère existe déjà (index + sections restantes) |
| 11 | Révélation de texte en cascade (SplitText) | [GSAPify](https://gsapify.com/gsap-animations/) | **ÉCARTE** tel quel | **appliqué en version contrainte** : balayage par LIGNE, 300 ms au total, jamais par lettre. La source dit que ça retarde la lecture et elle a raison : la première version, par mot, donnait « selo  le métie » à mi-course |
| 12 | Bouton magnétique | [Medium, synthèse de sites primés](https://medium.com/design-bootcamp/awwward-winning-animation-techniques-for-websites-cb7c6b5a86ff) | **GARDE** | **déjà là et étendu** — `js/pointe.js`, 6 → 11 sélecteurs de cible. C'est littéralement la limaille : la matière s'écarte sous la pointe et se reprend |
| 13 | Curseur qui remplace le curseur système | [Funka](https://stiftelsenfunka.org/about-us/columns/the-curse-of-the-custom-cursor/) · [It's Nice That](https://www.itsnicethat.com/articles/double-click-august-2021-cursors-110821) | **ÉCARTE catégorique** | **jamais fait, et vérifiable** : aucun `cursor: none` dans la feuille. La pointe augmente le curseur natif, elle ne le remplace pas |
| 14 | Indicateur de progression au scroll | [Awwwards](https://www.awwwards.com/inspiration/scroll-driven-animation-inovaya) | **GARDE** | **déjà là** — barre de lecture, index actif, sections restantes, compteur 01/05. C'est le N1 du projet |
| 15 | Parallaxe classique | [SVGator](https://www.svgator.com/blog/website-animation-examples-and-effects/) · [Vev](https://www.vev.design/blog/scroll-animation-examples/) | **ÉCARTE** | c'est l'animation la plus templatée du web, l'inverse d'une signature |

**Ce que la recherche a changé dans les décisions, concrètement :**

- **La fiche technique du hero existe à cause de la source n°2 de la section
  crédibilité** (NN/g, *upfront disclosure*). Sans elle, j'aurais mis un objet
  génératif décoratif dans la colonne vide.
- **Le balayage des titres est passé de « par mot » à « par ligne » et sa
  durée est plafonnée à 300 ms** à cause du verdict ÉCARTE de la technique 11.
- **Le pin des projets a été retiré** alors que la technique 9 le recommande :
  le client mesure le coût en défilement, la source ne le mesure pas.

**Ce qui rend un site d'agence crédible auprès d'un patron de 55 ans**, trois
sources :
[NN/g, *Trustworthiness in Web Design: 4 Credibility Factors*](https://www.nngroup.com/articles/trustworthy-design/) —
qualité de conception, **transparence tarifaire préalable**, contenu complet et
à jour, connexion au reste du web.
[NN/g, rapport B2B](https://www.nngroup.com/reports/topic/b2b-websites/) —
293 sites testés, la crédibilité vient de la clarté fonctionnelle, pas de
l'impressionnisme visuel.
[*Trust in the Internet as a Health Resource Among Older Adults*](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3221340/) —
chez les visiteurs plus âgés, un signal ambigu produit une méfiance générale
par défaut.

**Les pièges pour ce profil, tous évités et vérifiables :** défilement
détourné (aucun — le pin a même été retiré), curseur de remplacement (aucun
`cursor: none`), texte qui apparaît trop tard (le titre du hero ne s'anime
plus du tout, les titres de section sont lisibles en 300 ms), en-tête flottant
envahissant (56 px, inchangé), défilement infini (aucun).

---

## 11. RÉSERVES HONNÊTES

1. **Les captures de projet sont des PNG statiques.** La demande disait « les
   animations du site client doivent rester visibles ». Une image ne contient
   aucune animation : ce qui bouge, c'est le défilement interne de la capture
   et la découverte du cadre. Montrer de vraies animations clientes exigerait
   des `iframe` vers les sites livrés ou des captures vidéo. Ce n'est pas un
   arbitrage de design, c'est une limite du matériau fourni.

2. **Mes premières mesures de performance étaient fausses, dans le mauvais
   sens.** J'ai rapporté 284–308 ms de LCP et 125–135 ms de tâche longue alors
   qu'un autre script Playwright tournait sur la même machine. Reprises au
   calme, les mêmes mesures donnent 112–124 ms et aucune tâche au-dessus de
   50 ms. Je le note parce que le chiffre gonflé aurait pu passer pour une
   réserve honnête alors que c'était une erreur de protocole.

3. **Le premier chargement d'un navigateur froid reste à 600–950 ms.** Ce
   n'est pas la page — le deuxième chargement retombe à 120 ms — mais c'est ce
   que vit un visiteur qui vient d'ouvrir son navigateur. Aucun site ne
   contrôle ce coût, et je ne le maquille pas en le retirant de la médiane.

4. **Le filigrane `APED` du pied de page reste hors AA.** Il est passé en
   contour d'un filet plutôt qu'en aplat gris, ce qui le sort du registre du
   texte. Il est `aria-hidden`, non sélectionnable, et ne porte aucune
   information : WCAG 1.4.3 exclut explicitement la décoration pure. Le monter
   en contraste en ferait un titre concurrent du CTA juste au-dessus.

5. **Les treize maquettes de secteur sont des plans, pas des rendus.** Elles
   démontrent la composition et la fonction, pas la couleur ni la
   photographie du site final. C'est un choix : un visuel de banque réduit
   quatre fois ne démontrait ni l'un ni l'autre.

6. **Sans JavaScript, il n'y a pas d'aperçu de secteur** : les maquettes vivent
   dans un `<template>` pour ne rien coûter au premier rendu. La légende, qui
   porte la description de ce qu'on construit pour chaque métier, reste.

7. **La page de la 404 ne tient dans un écran qu'au bureau.** À 390 px, les
   treize entrées de l'index font 993 px pour 844. C'était déjà vrai avant.

8. **Le défaut du panorama `en_suite`** de la visite 360 — pas la même maison
   que les deux autres — n'a pas été corrigé : il faut remplacer l'actif, pas
   le code.
   *(Corrigé en phase 7 : les trois pièces viennent maintenant de la même
   propriété, Lythwood Lodge, vérifiée par coordonnées GPS. Voir
   `PHASE-7.md` §11.1 pour la réserve qui subsiste.)*

9. **Le logo porte toujours une signature C2PA `trainedAlgorithmicMedia`** et
   un filigrane invisible. Problème d'actif, pas de code. Inchangé.

10. **`ui-ux-pro-max` n'a pas été consulté** et aucun composant n'a été importé
    d'un registre : les treize maquettes, la fiche technique, le barème et la
    réassurance sont écrits à la main dans le vocabulaire du site. Un composant
    importé aurait apporté ses rayons, ses ombres et ses dégradés.

---

## 12. CE QUI RESTE OUVERT, DEPUIS LES PHASES PRÉCÉDENTES

- L'état des modales dans l'URL (mis de côté à votre demande).
- Le « moment impossible » — La Coulée — n'est toujours pas construit.
- Le logo n'est posé qu'à 3 emplacements sur 6.
- Un seul point d'intérêt par scène dans la visite 360.
- Le dispositif de capture par courriel des deux PDF (ils restent
  téléchargeables sans contrepartie, ce qui était le choix retenu).
