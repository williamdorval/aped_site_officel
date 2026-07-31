# Refonte APED — phase 7 : les douze chantiers

État au 2026-07-26. Tout ce qui suit est **mesuré**, jamais estimé.

Sauvegarde de l'état d'avant : `../\_backup-phase7-avant/` (72 fichiers,
`node_modules` et captures exclus). Elle a servi à la mesure A/B de la
section 10.

Instruments, tous relançables depuis la racine après
`node tools/serve.mjs 8099` :

| Outil | Ce qu'il rend |
|---|---|
| `theme-check.mjs` | parité clair / sombre, contrastes, débordement, captures des 12 sections × 2 thèmes × 5 largeurs |
| `deborde.mjs` | contenu **coupé** par un `overflow`, à 9 largeurs |
| `prix-check.mjs` | tout montant en dollars, dans le source **et** dans le texte rendu, modales ouvertes |
| `entree-check.mjs` | séquence d'entrée image par image, LCP avec et sans rideau |
| `services-check.mjs` | rail horizontal : jauge, compteur, clavier, fps |
| `projets-check.mjs` | les cadres de projet ne défilent que sur intention |
| `cadeau-check.mjs` | popup : déclenchement, unicité, focus, Échap, PDF |
| `pdf.mjs` | fabrique les deux documents et détecte les pages qui débordent |
| `verif.mjs` | clavier de bout en bout, orientation, mobile, 404, mouvement réduit |
| `perf-probe.mjs` | LCP et tâche la plus longue, médianes sur N chargements |

---

## 1. LES DOUZE CHANTIERS

| # | Chantier | État | Preuve |
|---|---|---|---|
| 00 | Animation d'entrée | **fait** | 3 temps, 1,42 s, `refonte-captures/entree/` · LCP identique avec (188 ms) et sans (184 ms) rideau |
| 01 | Mode clair, hero noir | **fait** | fond du canvas transparent dans les deux thèmes, mesuré au pixel : `[0,0,0,0]` |
| 02 | Services, refonte | **fait** | rail horizontal, 4 écrans construits, 0 image · jauge exacte à 0 / 0,25 / 0,5 / 0,75 / 1 |
| 03 | Projets interactifs | **fait** | `aucunDefilementImpose: true`, 7 comportements vérifiés |
| 04 | 13 secteurs | **fait** | 13 maquettes distinctes, vrais mots et vrais nombres, 13/13 vérifiées |
| 05 | Visite 360 | **partiel, et dit** | même propriété rétablie, 3 pièces cohérentes — mais **pas** une maison moderne de luxe : voir §11.1 |
| 06 | Comparatif responsive | **fait** | 0 contenu coupé à 9 largeurs, échelle réduite |
| 07 | Schéma de l'écart | **fait** | deux journées sur une même règle de 8 h, pont d'écart |
| 08 | Processus et Agence | **fait** | parcours à fil vertical + 4 composants ; 4 engagements + 4 preuves |
| 09 | Référence | **fait** | sombre dans les **deux** thèmes, barème retiré, mécanisme en 3 preuves |
| 10 | Contact | **fait** | 3 poids dont un minium plein, frise « ce qui arrive après », 4ᵉ réassurance |
| 11 | Lead magnets | **fait** | popup `<dialog>` natif 9/9 critères · PDF 42 et 49 pages · 3 points de capture |

---

## 2. AUCUN PRIX PUBLIC — le relevé

`node tools/prix-check.mjs` : **0 montant à retirer** dans le source.

**Retirés :**

| Où | Ce qui y était | Ce qui le remplace |
|---|---|---|
| Fiche technique du hero | 4 prix de départ | les 4 **délais** typiques |
| Services, chapeau | « quatre prix de départ » | « Si votre besoin tombe entre deux, on vous le dit au premier appel, avec le prix » |
| Services, 4 feuilles | « À partir de … » | le délai et ce qui est inclus |
| FAQ « Combien coûte un site web ? » | 2 500 $ / 6 000 $ | « on ne publie pas de grille » + renvoi à l'estimation |
| Programme de référence | barème complet en 6 tranches | le **plafond** seul, en très grand |
| Formulaire projet | 4 fourchettes de budget chiffrées | 4 réponses qualitatives |

**Gardés, et pourquoi :**

- **« 5 000 $ »**, 8 occurrences : c'est le plafond, il attire. Le barème
  décourageait parce qu'il apprenait à calculer vers le bas.
- **Le calculateur et l'estimateur** : ils donnent un chiffre au prospect
  sans publier de grille. C'est le mécanisme de qualification.
- **« 0 $ »** : dit qu'une chose ne coûte rien.
- **Le taux horaire et le chiffre d'affaires du calculateur** : ce sont les
  chiffres **du visiteur**, saisis par lui.
- **Les prix dans les 13 maquettes de secteur et les 4 écrans de Services** :
  menu de restaurant, bon de travail de garage, fiche de propriété. Ce sont
  les prix d'entreprises **fictives**. Un menu sans prix ne ressemble pas à
  un menu, et c'est précisément ce qui séparait ces aperçus du wireframe
  gris qu'on vient de remplacer.
- **Le barème de commission dans `modal-refer`** : à votre demande, il ne se
  révèle que dans le formulaire, après manifestation d'intérêt.

**Deux expositions structurelles, à décider par vous — §11.2 et §11.3.**

---

## 3. LA SÉQUENCE D'ENTRÉE

Trois temps, 1,42 s, une fois par session.

| t | Ce qui se passe |
|---|---|
| 40 – 430 ms | quatre équerres s'encliquettent et réservent le format |
| 60 – 620 ms | le monogramme se pose ; la jauge pleine largeur se remplit de la trame de grains |
| 540 – 880 ms | la plaque se rend au cadre du hero, rétrécit, s'efface |
| 620 – 1088 ms | le rideau s'ouvre en **quinze filets, depuis le centre** |
| 620 – 1420 ms | les grains composent APED |

Quinze filets parce que `seedPositions()` fait partir les grains du hero de
quinze filets : le rideau part **en la matière même** dont le hero se compose.
Le départ des grains est déclenché par l'`animationstart` de la bande du
milieu, donc calé sur le rideau réel et pas sur une horloge parallèle.

Les bandes se déplacent en `translate3d` : le motif de lamelles ne coûte
aucun repaint, contrairement à un masque SVG dont on animerait `width`.

| | Mesure |
|---|---|
| LCP avec rideau | **188 ms**, élément `span.plate-big` |
| LCP sans rideau | **184 ms** |
| Session déjà vue | rideau **absent du document** |
| Mouvement réduit | rideau absent, plaque nette d'un coup, 25 175 grains |
| Erreurs console | **0** |

---

## 4. LE HERO EN MODE CLAIR — la cause exacte

Le champ de limaille peignait un fond **opaque**, pris dans `--surface-0`
au moment de la composition, et la bascule de thème ne recomposait rien.
Un visiteur arrivé en sombre puis passé en clair gardait donc un bloc noir
posé sur le ciment.

Deux corrections :

1. le contexte du canvas passe en **alpha** et le fond devient transparent :
   la surface derrière la plaque est celle de la page, donc elle suit le
   thème toute seule et profite même de la transition de 520 ms ;
2. un évènement `aped:theme` recolore les grains. Recomposer coûterait un
   `getImageData` et 25 175 cibles reconstruites ; ici la table des tons est
   mise à jour et une image est retracée.

Mesure du pixel du coin du canvas : `[0,0,0,0]` en clair **et** en sombre.

Ajouté au passage : le thème système suivi en cours de visite, **seulement**
si le visiteur n'a jamais tranché lui-même.

---

## 5. SERVICES — l'arbitrage rail contre roue

La roue a été écartée sur deux points qui ne se rattrapent pas :

- sur un cercle il n'y a **ni début ni fin**, donc plus aucune réponse
  honnête à « combien il en reste » — du N1 sacrifié pour du N3 ;
- une carte posée sur un cercle doit être redressée pour rester lisible :
  elle glisse le long d'une courbe sans jamais s'y aligner. Ça flotte.

Les six garde-fous du rail, chacun issu d'une mesure :

| # | Garde-fou | Mesure qui l'impose |
|---|---|---|
| 1 | **une seule** timeline pour le rail et la jauge | deux `ScrollTrigger` séparés font atteindre 100 % à la barre avant la dernière carte |
| 2 | compteur **gros** | l'eye-tracking NN/g montre que les flèches de carrousel ne sont jamais regardées |
| 3 | carte suivante **coupée** par le bord | 6 utilisateurs sur 8 rataient le contenu hors cadre quand tout tombait pile |
| 4 | piste focalisable + 2 boutons visibles | sans ça, échec WCAG 2.1.1 et 2.1.3, niveau A |
| 5 | aucune rotation automatique | 46 % des carrousels des grands sites ont un défaut d'utilisabilité |
| 6 | **aucun** épinglage sous 1024 px | le détournement de défilement au téléphone est proscrit |

| | Mesure à 1440 |
|---|---|
| Scène épinglée | **844 px**, tient exactement dans l'écran |
| Tranche visible de la carte suivante | **175 px** |
| Jauge à p = 0 / 0,25 / 0,5 / 0,75 / 1 | **0 / 0,25 / 0,5 / 0,75 / 1** |
| Images par seconde pendant la traversée | **60** |
| Clavier | piste focalisable, → = 02, Fin = 04 |

**Les quatre écrans sont construits, pas photographiés.** Zéro image, zéro
requête, et ils suivent le thème. Les quatre `service-*.webp` sont dans
`images/_retire/`.

Leur échelle est en `cqw` sur un cadre déclaré conteneur : une maquette doit
se **réduire** en gardant ses proportions, jamais se faire couper. Deux
pièges rencontrés et documentés dans la feuille : `container-type` retire la
contrainte de largeur par le contenu (il a fallu rendre les enfants
compressibles), et la colonne **implicite** d'une grille vaut `auto`, donc
elle se dimensionne au contenu maximal — mesure à 390 px : cadre de 245 px,
colonne de 506.

---

## 6. PROJETS — le cadre ne défile plus tout seul

Le mouvement est porté par `scrollTop`, pas par un `transform` : une seule
source de vérité où écrivent la molette, le doigt, les touches, la barre et
la lecture automatique. Le défilement natif s'enchaîne vers la page quand la
capture est au bout, donc le cadre ne peut pas retenir le visiteur.

| Ce qui est vérifié | Résultat |
|---|---|
| La page défile, le cadre bouge-t-il ? | **non**, `scrollTop` reste à 0 |
| Survol bref (220 ms) | rien |
| Survol prolongé (520 ms) | la lecture démarre |
| Molette dans le cadre | reprend la main, le libellé change |
| Sortie du cadre | retour en haut, état réinitialisé |
| Focus clavier puis flèches | le cadre se parcourt |
| Capture au bout, on continue à la molette | **la page reprend** (5 040 → 5 440) |

Ce bloc vit dans `main.js` et non dans `motion.js` : sous
`prefers-reduced-motion` la lecture automatique se coupe, mais le cadre doit
rester parcourable à la main. Perdre le mouvement ne doit jamais faire perdre
le contenu.

---

## 7. LE SCHÉMA DE L'ÉCART

Les six pistes par tâche disaient **combien**. Elles ne disaient pas ce que
ça fait à une journée, et c'est la seule question qu'un patron se pose.

Les deux journées sont posées sur **la même règle de huit heures**, l'une
sous l'autre, et un pont enjambe la différence. Ce qui se lit d'abord n'est
pas un nombre, c'est la longueur de deux traits sur une même graduation.

La journée à la main est une **trame** — matière brute ; la journée
automatisée est un **aplat** d'accent — ce qui est déjà réglé.

Les longueurs sont dans le markup, en variables CSS : sans JavaScript les six
pistes étaient **vides**, alors que la règle du site est que rien de ce qui
sert à lire n'en dépend. Le script ne fait plus que tracer.

---

## 8. CE QUI A ÉTÉ TROUVÉ EN PLUS DES DOUZE

| # | Défaut | Où | État |
|---|---|---|---|
| 1 | **Le dernier dégradé du site**, sur la plaque d'entrée de la visite 360, et il mesurait **1,43:1** | `tour360.css` | corrigé, aplat franc |
| 2 | **Le fond du canvas du hero** ne suivait pas le thème | `limaille.js`, `hero.js`, `main.js` | corrigé |
| 3 | **La case à cocher de l'Agence était vide au repos** : sans script ou en mouvement réduit, « Maquettes approuvées » se lisait « pas approuvées ». Une animation absente inversait un sens | `app.css` | corrigé |
| 4 | **La fiche d'appel et le graphe** étaient vides au repos | `app.css` | corrigé |
| 5 | **Les six pistes du comparatif** étaient vides sans JavaScript | `index.html`, `app.css`, `motion.js` | corrigé |
| 6 | **L'appât de fin de rail s'était logé DANS la scène épinglée** : troisième rangée d'une grille à hauteur imposée, il coupait les quatre cartes de 17 à 85 px | `index.html` | corrigé |
| 7 | **La barre de chrome des écrans à 4,27:1** — échec AA. Trouvé par le sous-agent des secteurs dans mon propre code | `app.css` | corrigé, 5,18:1 |
| 8 | **`tools/pdf.mjs` était aveugle** au débordement le plus fréquent : `.page__body` est un élément flex à `min-height: 0`, donc il s'écrase et le contenu passe sous le pied de page sans que `.page` grandisse. Quinze pages sortaient fausses en annonçant « zéro débordement » | `tools/pdf.mjs` | corrigé, deux mesures |
| 9 | **`tools/verif.mjs` criait au piège de tabulation** sur les cinq cadres de projet : cinq éléments différents partageant sélecteur et texte vide | `tools/verif.mjs` | corrigé, identité réelle |
| 10 | Le nom du chantier était **tronqué** par points de suspension à 390 px — du N1 amputé | `app.css` | corrigé, il se replie |
| 11 | Trois bogues de la visite 360 : **signe du lacet inversé**, un point de passage visant une cheminée au lieu d'une porte, et un lien de licence indiscernable de son paragraphe (WCAG 1.4.1) | `tour-angles.mjs`, `tour360.js`, `tour360.css` | corrigés |

---

## 9. LA RECHERCHE

50 URL réellement chargées. Trois sources mortes, **dites** plutôt que
remplacées par des URL plausibles : `awwwards.com/inspiration/horizontal-scroll`
(502), `godly.website` (403), et Reddit et X inaccessibles.

Ce que la recherche a **changé** dans les décisions, concrètement :

1. **Le popup ne se déclenche plus à l'intention de sortie en premier.**
   Trois bases indépendantes — 1 milliard, 1,24 milliard et 105 millions
   d'affichages — la classent **dernière** de tous les déclencheurs :
   3,94 % contre 6,45 % pour une attente de 11 à 15 s chez le premier
   éditeur ; 1,8 % contre 2,9 % chez le deuxième. Le brief disait
   « intention de sortie **ou** engagement réel » : l'engagement passe
   devant, l'intention de sortie devient le dernier recours après 25 s.
2. **Un seul champ.** Au-delà de trois champs, la même base mesure une chute
   de 2,2 % à 1,5 %.
3. **Modale centrée, pas encart flottant.** 3,6 % contre 0,8 %.
4. **Le compteur du rail est gros** à cause de l'eye-tracking NN/g.
5. **La carte suivante est coupée** à cause de l'étude Maple.com, 6 sur 8.
6. **Le fil du parcours est en `scaleY` sur des rectangles**, pas en
   `stroke-dashoffset` : seuls `opacity` et `transform` restent sur le
   compositeur, et le plugin de tracé SVG traîne deux défauts documentés
   — longueur mal calculée sous Firefox, contours de `<rect>` épais sous
   iOS — qui touchent exactement l'exigence « net au pixel ».
7. **`<dialog>` + `showModal()`** plutôt qu'un piège de focus écrit à la
   main : le natif donne le piège, l'inertie de l'arrière-plan, Échap et la
   couche supérieure.
8. **Le masque SVG à lamelles de Codrops a été écarté au profit de quinze
   `<div>` en `translate3d`** : le motif est le même, mais animer `width` sur
   des `<rect>` repasse par le paint à chaque image.

---

## 10. MESURES

### Performance — mesure A/B sur la même machine

C'est la seule façon honnête de répondre à « est-ce que ça a coûté ». La
sauvegarde d'avant a été servie sur le port 8097, le site actuel sur 8099,
sept chargements chacun, machine au repos.

| | Avant (sauvegarde) | Après | Verdict |
|---|---|---|---|
| LCP, médiane sur 7 | **196 ms** | **200 ms** | identique, dans le bruit |
| Tâche la plus longue | **119 ms** | **118 ms** | identique |

**Il n'y a donc aucune régression**, alors que la page a nettement grossi.
Les chiffres de la phase 6 (112–124 ms de LCP, aucune tâche au-dessus de
50 ms) venaient de conditions machine différentes, pas d'un site plus rapide :
la sauvegarde de cette phase-ci, qui **est** le site de la phase 6, mesure
196 ms ici.

La tâche longue de ~118 ms démarre à t = 24 ms, donc **avant** l'injection
des scripts : c'est l'analyse du document et la première mise en page, pas la
choréographie.

### Le reste

| | Mesure | Cible |
|---|---|---|
| CLS | **0** | 0 ✓ |
| Images par seconde au défilement (moy / p95 / pire) | **60 / 60 / 60** | 60 ✓ |
| Latence d'ouverture d'une modale | **84 ms** | < 200 ✓ |
| Requêtes tierces | **0** | 0 ✓ |
| Arrêts de tabulation | **100** | — |
| Sans anneau de focus | **0** | 0 ✓ |
| Piège de tabulation | **aucun** | aucun ✓ |
| Modale : focus piégé et rendu au déclencheur | **oui** | oui ✓ |
| Débordement horizontal, 9 largeurs de 320 à 1920 | **aucun** | aucun ✓ |
| Contenu coupé, 9 largeurs | **aucun** | aucun ✓ |
| Échecs de contraste AA, 5 largeurs × 2 thèmes | **0** | 0 ✓ |
| Erreurs console, dont mobile | **0** | 0 ✓ |
| Hauteur de page à 1440 | 24 310 px | — |

### Les deux documents

| | Avant | Après |
|---|---|---|
| Ce qu'on peut automatiser | 16 p., 13 sources | **42 p., 19 sources, 47 appels de note** |
| L'IA pour faire grossir | 15 p., 27 sources | **49 p., 42 sources, 104 appels de note** |
| Pages qui débordent | non mesuré correctement | **0**, deux mesures d'accord |

---

## 10bis. PHASE 7B — les cinq points repris

### Le popup, de bout en bout — et ce qu'il a révélé

`node tools/cadeau-e2e.mjs 8099 [--envoi-reel]`

Le parcours complet passe : le popup s'ouvre sur engagement, les deux
documents se téléchargent, s'ouvrent, et comptent **42 et 49 pages**.

Mais l'envoi réel a rendu ceci, et c'est un défaut de production :

```
HTTP 200
{"success":"false","message":"This form needs Activation. We've sent
 you an email containing an 'Activate Form' link."}
```

**Le service répond 200 en disant non.** Les deux fonctions d'envoi ne
regardaient que `res.ok` : les **six** formulaires du site affichaient
donc « Demande reçue » à un visiteur dont le message n'était jamais
parti. C'est le pire mode d'échec possible — ni le visiteur, qui attend
un rappel, ni nous, qui ne voyons pas de courriel et croyons que
personne n'écrit. Corrigé : on lit le corps de la réponse et on porte
le message du service jusqu'à l'affichage.

**Action requise de votre côté :** cliquer le lien d'activation
FormSubmit reçu à `dorvalwilliam11@gmail.com`. Tant que ce n'est pas
fait, aucun formulaire ne délivre.

### La grille de l'estimateur

Ni fonction serveur, ni coefficients maquillés — les deux protègent
moins qu'elles n'en ont l'air, et le fichier `js/main.js` explique
pourquoi à l'endroit exact où la grille se trouvait. Ce qui est fait :
la grille multiplicative est remplacée par un **barème publié** de cinq
fourchettes larges atteintes par un score grossier.

`node tools/estimateur-check.mjs` : **108 combinaisons → 5 fourchettes
distinctes**, partagées par 9 à 36 profils chacune. Un concurrent qui
épuise les 108 apprend cinq fourchettes, c'est-à-dire ce que
cent-huit prospects apprendraient. Aucun prix de base, aucun
multiplicateur ne subsiste dans le navigateur.

### La tâche longue

| | Avant 7B | Après 7B | Cible |
|---|---|---|---|
| LCP médian | 196–200 ms | **100–132 ms** | < 300 ✓ |
| Tâche la plus longue | 118 ms, **deux** tâches | **72–85 ms**, **une** seule | < 50 ✗ |

Quatre changements, chacun mesuré :

1. **Attribution avant de toucher à quoi que ce soit**
   (`tools/tache-longue.mjs`, qui retire un poste à la fois en vol) :
   **74 ms sur 126 venaient de `app.css`**. Le HTML n'y était pour
   rien — vider le `<template>` des secteurs ou les six modales ne
   rendait rien de mesurable.
2. **11 Ko de CSS mort retirés** : les règles des anciennes maquettes
   de secteur, vérifiées à zéro occurrence.
3. **`app.css` découpé** en `critique.css` (37 Ko, les composants
   peints au premier écran) et `differe.css` (108 Ko, injecté après la
   première peinture), par `tools/css-critique.mjs`.
4. **Les états de départ ont quitté le CSS.** `html.js .rise` posait
   `opacity: 0` sur du contenu avant le premier rendu et n'était levé
   que par GSAP. C'est ce qui obligeait à charger les 112 Ko de la
   bibliothèque d'animation **avant** le premier écran. Ils sont
   maintenant posés par `motion.js` avec `immediateRender: false`, et
   la choréographie part à la première interaction ou à 1,2 s.

Le découpage du CSS inverse l'ordre de cascade entre deux règles de
même spécificité qui étaient interleavées. C'est le vrai risque, et il
est **prouvé absent** : `tools/cascade-check.mjs` compare 44 propriétés
calculées sur les 2 758 éléments de la page, feuille découpée contre
feuille entière, dans les deux thèmes — **0 écart sur 242 704
propriétés comparées**. La première version de cet outil, elle, avait
trouvé une vraie inversion : le paragraphe de la tuile principale du
contact passait de l'encre d'accent à l'encre atténuée.

**Le seuil de 50 ms n'est pas atteint.** Voir la réserve 11.

### Les quatre secteurs photographiques

Restauration, garage, construction, immobilier passent de la maquette
construite à la **vraie photographie**. Le choix n'est pas arbitraire :
ce sont ceux que le site démontre déjà ailleurs.

14 fichiers, **196 Ko au total**, dans un `<template>` — donc demandés
au clonage de la maquette, jamais au chargement.

| Source | Licence chargée | Ce qu'elle dit | Attribution |
|---|---|---|---|
| Pexels (10 images) | `pexels.com/license` | « All photos and videos on Pexels are free to use », « Attribution is not required », modification autorisée | non |
| Poly Haven (4 images) | `polyhaven.com/license` | CC0, usage commercial, redistribution, aucune attribution requise | non |

L'immobilier vient des **mêmes panoramas que la visite 360**,
reprojetés en gnomonique : l'aperçu montre la propriété que le visiteur
peut ensuite parcourir.

Un défaut trouvé et corrigé au passage : dans une grille à rangée
automatique, `height: 100 %` se résout sur le contenu. L'image faisait
380 px dans un cadre de 127, elle débordait, et `object-fit` ne
s'engageait jamais — l'aperçu d'une propriété montrait donc **le
plafond et son lustre**.

## 11. RÉSERVES HONNÊTES

0. **LE SEUIL DE 50 ms N'EST PAS ATTEINT.** La tâche est passée de
   118 ms à 72–85 ms, et de deux tâches à une seule. Ce qui reste
   n'est plus attribuable à un poste : mesuré en retirant chaque
   élément un par un, retirer le `<template>` des secteurs rend 7 ms,
   les six modales 7 ms, le jeu d'icônes 0. Même une page vidée du
   `<template>`, des modales **et** de tout le CSS critique mesure
   encore ~60 ms sur cette machine. C'est le coût de base d'un
   document de 166 Ko et de 2 758 éléments, dans ce navigateur, sur ce
   poste.
   Pour descendre plus bas il faudrait sortir les modales et le
   `<template>` du document et les charger en fragments — environ
   14 ms espérés, pour un risque réel : un visiteur qui clique un
   appel à l'action avant l'arrivée du fragment ne verrait rien
   s'ouvrir. Je ne l'ai pas fait sans votre accord, parce que c'est
   troquer une milliseconde contre une porte qui ne s'ouvre pas.
   À noter aussi : la mesure varie de ±15 ms d'une série à l'autre sur
   ce poste. Un seuil à 50 ms se joue dans cette marge.

1. **La visite 360 n'est pas une maison moderne de luxe, et elle ne peut pas
   l'être proprement.** Les 980 HDRI de Poly Haven ont été passés et
   regroupés par coordonnées GPS : le catalogue résidentiel intérieur compte
   **24 pièces** et **aucune paire à moins de 5 km**. Les seuls ensembles
   multi-pièces à une même adresse sont un studio de photo de mariage, un
   complexe des années 1980 et une église. Le seul intérieur vraiment moderne
   et vitré, `glasshouse_interior`, est **une seule pièce ouverte** : il ne
   fait pas une visite. Les autres sources ont été lues et écartées pour
   licence : HDRMAPS interdit de servir l'image en téléchargement — ce que
   fait un visionneur 360 —, NoEmotionHDRs est CC BY-**ND**, sIBL est
   CC BY-**NC**. Ce qui a été livré corrige le vrai défaut — les trois pièces
   viennent enfin de la **même** propriété, Lythwood Lodge — et entre
   maintenant par la terrasse, la vue la plus haut de gamme disponible. Pour
   avoir la maison que vous décrivez, il faut **acheter ou faire produire**
   des panoramas.
2. **La grille de l'estimateur est lisible par n'importe qui.** `PRICING`
   vit dans `js/main.js` : `vitrine 2600, ecommerce 6500, app 12000,
   automatisation 3800`, avec ses multiplicateurs. Un concurrent l'a en dix
   secondes. Ce n'est pas un oubli : sur un site **statique**, tout
   estimateur qui calcule chez le visiteur publie nécessairement sa grille.
   Trois issues, aucune gratuite — accepter, déplacer le calcul sur un
   serveur, ou retirer l'estimateur. Vous vouliez le garder ; je le signale
   parce que c'est la seule exposition qui reste après le nettoyage.
3. **Le barème de commission reste visible** dans `modal-refer`, replié dans
   un accordéon. C'est votre décision explicite. Il donne en creux les
   tranches de valeur de nos contrats, de 1 000 à 100 000 $ et plus.
4. **La séparation de `css/secteurs.css` n'a rien gagné en mesure locale** :
   192 → 188 ms, dans le bruit. Je la garde parce que 55 Ko de moins sur la
   requête initiale comptent sur un vrai réseau, ce que `localhost` ne peut
   pas montrer. Mais je ne peux pas le prouver ici.
5. **La tâche longue de 118 ms n'a pas été réduite.** Elle précède les
   scripts : c'est l'analyse d'un document de 161 Ko et sa première mise en
   page. La descendre demanderait de découper le CSS critique ou d'alléger le
   document, ce qui est un chantier à soi seul.
6. **Les treize maquettes de secteur restent des plans**, pas des rendus
   photographiques. Elles ont maintenant de vrais mots, de vrais nombres et
   une vraie hiérarchie typographique — c'est ce qui les sépare du wireframe
   gris — mais elles ne montrent ni photographie ni palette de client.
7. **La maquette Immobilier est la plus faible des treize.** Son panoramique
   occupe 40 % du cadre et reste une composition tonale abstraite.
8. **Les minutes par tâche des documents sont nos ordres de grandeur**, pas
   des données publiées. Aucune source publique québécoise ou canadienne ne
   mesure le temps administratif par tâche et par secteur. C'est écrit trois
   fois dans le document 1, mais ça reste sa faiblesse structurelle.
9. **La page a grossi de 35 %** (18 022 → 24 310 px à 1440). L'épinglage des
   services en prend 2 656 à lui seul. C'est le prix du rail horizontal ; le
   compteur et la jauge sont là pour que ça ne se sente pas comme une perte
   de repère, mais c'est plus long à traverser qu'avant.
10. **Je n'ai pas testé sur un vrai appareil tactile.** Tout le tactile est
    vérifié en émulation Chromium. Le survol prolongé des cadres de projet et
    l'accrochage du rail méritent un essai sur téléphone réel.
