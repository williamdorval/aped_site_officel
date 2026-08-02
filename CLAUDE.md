# APED Agency — site officiel

Site vitrine **statique** d'une agence web québécoise : HTML + CSS + JS
vanilla + GSAP. Pas de React, pas de build (sauf `tools/css-critique.mjs`
qui découpe le CSS). Treize sections, une seule page, deux PDF.
**Zéro requête tierce** — aucun CDN, traceur, témoin ni police distante.

Ce fichier est un **aiguilleur** : ce qu'il ne faut jamais faire, et où
aller chercher le reste. Il n'explique rien — chaque explication vit
dans le document qui la porte.

## OÙ ALLER

| Si tu travailles sur… | Lis |
|---|---|
| **une section nommée** (Services, FAQ…) | `SECTIONS.md` — ancre, plages de lignes **générées**, sélecteurs |
| **un fichier, sans savoir lequel** | `ARCHITECTURE.md` — rôle de chaque fichier, et ce qu'il ne contient **pas** |
| **un mouvement** | `ANIMATIONS.md` — une ligne par animation : fichier, déclencheur, durée, verrou, verbe, niveau |
| **pourquoi le code est comme ça** | `DECISIONS.md` + `decisions/`. Le code porte l'identifiant : `grep D-042` trouve les deux bouts |
| **un chiffre, un seuil, un outil de mesure** | `MESURES.md` |
| **une mesure qui rend un verdict surprenant** | `PIEGES.md` — 74 faux verdicts déjà payés |
| **ce qui n'est pas prouvé, pas fini** | `RESERVES.md` |
| **quels skills charger** | `DESIGN-STACK.md` |
| **les sas, l'arc de luminance, la chambre noire** | `REFONTE-IMMERSIVE.md` — le chantier du 2026-07-31 |
| **un écran de secteur** (les douze métiers) | `demos-secteurs/STANDARD.md` — la loi · `demos-secteurs/plans/<clé>.md` — les références relevées et la DA du métier · `ARCHITECTURE.md § 10` — les fichiers |
| **les preuves d'un chantier** | `preuves/LISEZ-MOI.md` — un dossier par chantier, l'outil qui le refait, et ce qu'il faut voir dans chaque image |
| **l'historique** | `archives/rapports/` |

**Ces documents se mettent à jour à chaque changement de structure** —
un index périmé envoie lire le mauvais endroit et on ne s'en aperçoit
qu'après. `node tools/plages.mjs verifier` doit rendre « à jour ».

## LES DEUX RÈGLES QUI GOUVERNENT TOUT LE RESTE

### A · VRAI, SINON ÇA NE S'ÉCRIT PAS

Aucune phrase ne s'affiche si elle ne survit pas à un client qui la
conteste au téléphone. Quatre questions, dans cet ordre ; la première
qui échoue arrête.

| | Question | Ce qu'elle élimine |
|---|---|---|
| **Q1** | **Est-ce vrai ?** Défendable, pièce en main. | « 4,9 · 128 avis » inventés · « tests passés 24 / 24 » |
| **Q2** | **Le visiteur peut-il le vérifier ?** Sinon, qu'est-ce qui le soutient **ailleurs dans le document** ? | « cinq projets livrés » sans un lien |
| **Q3** | **Est-ce que je le contrôle ?** | « c'est vous qui sortez » sur Google |
| **Q4** | **Un patron de garage le comprend-il en trois secondes ?** | « CRM » · « grille 12 colonnes » |

> **UNE CORRECTION DE VÉRACITÉ SE FAIT PARTOUT, EN UNE FOIS.** Une
> affirmation vit rarement à un seul endroit. Avant de fermer une
> correction : `grep` l'énoncé dans **tout** `index.html`, les modales,
> les `<template>`, `documents/src/*.html`, `404.html`, **et le texte
> rendu**. Le périmètre d'un chantier ne justifie jamais de laisser une
> fausseté ailleurs.

Une fausseté dans la FAQ est plus grave que dans le hero : celui qui
l'ouvre est un prospect sérieux. Coût de cette règle avant qu'elle soit
écrite : 36 constats — `DECISIONS.md § 2026-07-29`.

### B · VISIBLE, SINON ÇA NE COMPTE PAS

Une animation qu'on ne remarque pas n'existe pas. **Preuve exigée pour
tout mouvement : au moins cinq captures entre le début et la fin, et
l'écart de pixels entre deux consécutives** — `node
tools/accueil-check.mjs sequences`. Si les cinq images se ressemblent,
le mouvement est repris, pas expliqué.

**Ne jamais conclure sur la pire image, ni sur une seule passe, ni sur
une planche dont le plancher de bruit n'a pas été mesuré.**
`MESURES.md § 1`, `PIEGES.md § 29`.

## INTERDITS ABSOLUS

- **rayon 0** — aucun coin arrondi, nulle part ;
- **aucune ombre portée** — la profondeur est un filet de 1 px décalé ;
- **aucun dégradé** — sauf les trames `repeating-linear-gradient` de la
  signature, qui sont des grains, pas un fondu ;
- **aucun flou** — ni `blur`, ni `backdrop-filter` ;
- **aucun prix, nulle part** — `node tools/prix-check.mjs`, `A RETIRER
  dans le source` doit rester à **0**. Le chiffre du calculateur est un
  montant d'**économies estimées**, pas un prix ;
- **aucune requête tierce** ;
- **rien qui ne se réclame pas d'un des quatre verbes** ;
- **`prefers-reduced-motion` respecté sans jamais faire perdre ni
  inverser une information** ;
- **jamais scrubber l'opacité d'un élément qui porte du texte** — une
  animation `scrub` n'a pas d'état de repos, elle a l'état où le
  visiteur s'est arrêté ;
- trois matières et rien d'autre : **ciment, encre, minium**
  (`css/tokens.css`). Le minium apparaît une fois en pleine masse au
  hero, puis seulement là où le visiteur peut **agir** : CTA primaire,
  index actif, chiffre du calculateur, filet de la section active.

> **CES INTERDITS S'ARRÊTENT À LA PORTE DE `demos-secteurs/`.** Les
> douze écrans de métier ont **le droit** aux coins arrondis, aux
> ombres, aux dégradés et au flou — c'est précisément ce qui prouve
> notre étendue. Ce qui tient là-bas aussi : aucun prix, aucune requête
> tierce, aucun nom réel, `prefers-reduced-motion` respecté. Et une
> règle de plus, non négociable : **aucun écran de secteur ne porte
> l'identité d'APED** — ni sa palette, ni sa typographie, ni ses
> formes, ni ses quatre verbes. `demos-secteurs/STANDARD.md`.

## LES DOUZE ÉCRANS DE SECTEUR — un écran, pas un site

Chaque métier de la section 04 est **un seul premier écran**, arrêté,
photographié à **1440 × 900** puis réduit dans le cadre du panneau —
c'est la réduction qui lui donne l'échelle d'un vrai moniteur. **Aucune
page longue, aucun défilement dans l'aperçu.** Neuf pages longues ont
été retirées le 2026-08-01 : `archives/2026-08-01-sites-longs/`.

Un mouvement ne compte que s'il **se voit sur l'image arrêtée** — une
bande à mi-course, un trait à moitié tracé, un chiffre entre deux
crans. Sinon il n'existe pas.

## LES QUATRE VERBES — la grammaire, il n'y en a pas d'autres

Définis dans `js/langue.js`. Le motif : **APED est fait de limaille —
une matière dure qui tient une forme nette sous tension, s'écarte sous
la pointe, et se reprend d'elle-même.** ζ = 1, donc aucun dépassement
possible ; forme au repos nette au pixel. Moteur : `js/limaille.js`.

| | Verbe | Ce que ça fait |
|---|---|---|
| **V1** | **DÉGAGER** | Une forme **déjà là** se découvre sous une arête **franche** qui balaye. Jamais un fondu |
| **V2** | **S'ALIGNER** | Les blocs arrivent décalés latéralement et se reprennent. Aucun dépassement, ζ = 1 |
| **V3** | **SOUDER** | Un filet apparaît en trame de grains, puis se ressoude en trait plein |
| **V4** | **CRAN** | Un état ne fond pas dans un autre : il roule d'un cran |

> **RÈGLE D'ADMISSION, NON NÉGOCIABLE : avant d'ajouter un mouvement,
> dire lequel des quatre il est.** Sinon il ne se fait pas, même si
> l'effet est beau. Quarante animations sans lien s'annulent ; une
> seule idée déclinée quarante fois devient une signature.

**La direction du balayage n'est jamais décorative** : elle suit le sens
de lecture — gauche→droite pour un titre, un libellé, un filet ;
haut→bas pour une page, une capture, un panneau. Aucune exception.

**La trame** (`js/trame.js`) n'est pas un cinquième verbe : c'est V1
dont l'arête est faite de la matière de V3. **Ne jamais poser douze
séparateurs** — la continuité vient de ce qu'un même objet traverse et
se transforme.

## SEUILS À NE JAMAIS FAIRE RÉGRESSER

| Mesure | Seuil |
|---|---|
| LCP (`SPAN.plate-big`, 1440×900) | **< 300 ms** — mesuré 84 · 92 · 112 · 208 |
| CLS | **0** |
| i/s médiane, traversée complète · images > 20 ms | **60** · **0** |
| échecs de contraste, 5 largeurs × 2 thèmes | **0** |
| débordement horizontal, 320 → 1920 px | **aucun** |
| erreurs console | **0** |
| écart de cascade, découpée vs entière | **0** |
| requêtes tierces | **0** |
| arrêts au clavier sans anneau de focus | **0** |

Détail, méthode et outils : `MESURES.md`.

## STRUCTURE — cinq règles à ne pas casser

1. **`css/app.css` est la SEULE source.** `critique.css` et
   `differe.css` sont fabriqués. Après toute modification :
   `node tools/css-critique.mjs` puis `node tools/cascade-check.mjs`,
   qui doit rendre **0 écart**.
2. **`differe.css` est injecté par JavaScript** : une animation de
   **chargement** ne peut pas y vivre (mesuré : +223 ms constant). Ces
   classes-là sont déclarées dans `CRITIQUES` de `css-critique.mjs`.
3. **Aucun état de départ d'animation dans le CSS.** L'état de repos
   est toujours la forme FINALE ; `motion.js` pose le départ avec
   `immediateRender: false`. Exception bornée : les douze pas de
   `compo-hero`, qui posent une plaque **par-dessus** un texte déjà
   peint — jamais une opacité, jamais un `clip-path`.
4. **L'orientation ne vit jamais dans `motion.js` ni `langue.js`** :
   ils s'arrêtent net sous `prefers-reduced-motion`. Tout ce qui répond
   à « où je suis, combien il en reste » vit dans `main.js`.
5. **Les scripts sont injectés APRÈS le premier rendu, en deux vagues.**
   V1 : `limaille`, `main`, `hero`. V2 (premier geste ou 1,2 s) : GSAP,
   ScrollTrigger, `motion`, `langue`, `pointe`, `tour360`. **Rien de
   nécessaire à la LECTURE ni à l'USAGE ne dépend du JavaScript.**

**Trois paliers de dégradation**, `data-palier` sur `<html>` : **0**
plein · **1** allégé (< 64em, `pointer: coarse`, ≤ 4 cœurs ou ≤ 4 Go) ·
**2** minimal (i/s médiane < 50) · **3** aucun
(`prefers-reduced-motion`). **L'escalade est à sens unique.** Ordre de
chute et ce qui n'est **jamais** sacrifié : `ANIMATIONS.md`.

**Le budget des SAS** : `html.sas-ok` se décide dans le `<head>` AVANT
la première mise en page. Sans la classe, un sas EST sa bande de seuil
— zéro coût. Un sas déjà ouvert **se fige** à sa forme finale et ne
rend **jamais** sa hauteur : une piste qui se replie en pleine lecture
fait sauter la page. `REFONTE-IMMERSIVE.md`.

## LES ERREURS DÉJÀ COMMISES — une ligne chacune

Cause et correctif : `PIEGES.md`.

1. Une capture d'écran est plus lente qu'une transition — lire les valeurs dans la page, pas dans l'image.
2. Un cadrage de capture se relève, il ne se devine pas.
3. Deux images de tailles différentes rendent 100 % d'écart.
4. `content-visibility: auto` fait mentir `getBoundingClientRect()` : il rend la taille *réservée*.
5. Un `scrollTo` qui saute casse un pin de ScrollTrigger — défiler par pas.
6. `color-mix()` calcule en `color(srgb …)`, pas en `rgb()` : 14 faux échecs de contraste.
7. Une fenêtre d'odomètre rogne exprès : rien à y mesurer en contraste.
8. Une analyse de pixels confond l'anticrénelage avec du texte illisible.
9. Un détecteur qui n'attend pas assez confond « animation en vol » et « texte échoué ».
10. Un piège de tabulation s'identifie par l'identité des éléments, pas par `sélecteur + texte`.
11. Une page d'impression peut écraser son corps sans grandir.
12. Un `ScrollTrigger` en `once` se tue après avoir joué : une sonde qui traverse photographie la fin.
13. Une sonde au `document_start` n'a pas encore `documentElement` — protéger chaque tour ET programmer le suivant.
14. Une sonde peut être plus rapide que la page et photographier l'image zéro.
15. Un détecteur de débordement doit distinguer ce qui rogne exprès.
16. `animation` est un raccourci : il remet `animation-play-state: running`. La pause exige `!important`.
17. **Un test peut verrouiller le défaut** — quand tu corriges, lis le test qui couvrait la zone ; s'il passe encore sans modification, c'est lui le problème.
18. Le popup cadeau bloque les outils : poser `sessionStorage["aped-sans-popup"] = "1"` dans tout outil qui clique.
19. Un A/B se fait en worktree, pas en `stash` — **et vérifier que le port est libre : un serveur déjà debout fait échouer le tien en silence et sert une version périmée.**
20. `getComputedStyle(el).transform` ne contient ni `translate`, ni `rotate`, ni `scale`.
21. Une amplitude absolue mélange trois mouvements — mesurer enfant moins parent.
22. Le rectangle englobant d'un élément tourné est plus grand que l'élément : ce qui décide est l'occultation.
23. Un nombre fixe de tabulations ne mesure pas un piège de focus — mesurer la propriété.
24. Une fenêtre d'observation trop courte cache le mouvement le plus lent.
25. **Une sonde du DOM ne peut pas voir un défaut de peinture** — toute section qui traduit un rail par `transform` se vérifie en CAPTURE.
26. Une grille transforme chaque nœud de texte en élément de grille anonyme.
27. Deux mécanismes sur le même pseudo-élément : le plus spécifique tue l'autre, en silence.
28. Un bridage trop fort rend le palier 2 inatteignable, et l'outil appelle ça un échec.
29. **Une planche de captures d'une page qui bouge n'est pas une preuve de non-régression** — utiliser `tools/captures-fixe.mjs`, et soustraire son plancher de bruit avec **trois** passes de chaque côté : `captures-comparer.mjs --avant A1,A2,A3 --apres B1,B2,B3`.
30. Un paramètre qui vaut `NaN` rend « aucune différence » sur n'importe quoi — un paramètre illisible doit ARRÊTER l'outil, jamais retomber en silence sur un défaut.
31. Un `lastIndexOf` sur une balise fermante commune coupe tout le document — borner par deux marqueurs uniques, compter les `<section>` avant et après.
32. Une marge `auto` peut se lire autrement et se poser au même pixel — comparer la géométrie, pas la valeur calculée.
33. **GSAP lit un `transform` CSS de repos comme une base en PIXELS et anime `yPercent` par-dessus** — purger avec un `y: 0` explicite dans le `fromTo`.
34. Une section `content-visibility` rend sa hauteur RÉSERVÉE même après une traverse — la mesurer pendant qu'elle est à l'écran, en s'arrêtant dessus.
35. Une scène collante n'est épinglée qu'à partir de 100vh de course — ce qu'on y joue avant se joue hors champ.
36. **Un test qui synthétise l'événement ne teste pas le geste** — `mouse.down` + `mouse.move`, et exiger que la valeur SUIVE le curseur.
37. Une image est glissable par défaut : le navigateur émet `pointercancel` et retire le geste.
38. Une sonde de port en IPv4 ment sur un serveur qui écoute en IPv6 — interroger `localhost`.
39. `decode()` ne rejette jamais sur une image jamais demandée : toute attente porte sa propre limite.
40. **Un sélecteur de masquage par sous-chaîne de classe peut effacer la page** — `[class*="cursor"]` attrape `cursor-none`. Une capture plate doit ARRÊTER l'outil.
41. Un calendrier qui ouvre sur le mois courant peut n'offrir aucune date — ouvrir sur le mois du premier jour réservable, **et le poser aussi dans la remise à zéro**.
42. Une dégradation par palier ne s'hérite pas toute seule : `[data-palier="1"]` ne mord plus à « 2 ». Écrire les trois valeurs.
43. Un cadre qui défile peut n'avoir rien à faire défiler — vérifier `scrollHeight > clientHeight` avant de conclure d'un geste sans effet.
44. **`fullPage` ne photographie pas une scène épinglée** — une scène collante se capture écran par écran, en défilant.
45. Un fond en dégradé n'est pas un fond absent : `backgroundColor` rend `rgba(0,0,0,0)` alors que la page est peinte.
46. **Un contournement survit toujours au correctif** — quand la cause est réparée, chercher et retirer la rustine, sinon elle masque la prochaine panne.
47. Rendre un conteneur défilant peut tuer un glissement qui marchait — `overflow` crée un contexte qui vole le `pointermove`.
48. L'injection tactile ne se remet pas entre deux gestes — réinitialiser explicitement, sinon le second geste part de l'état du premier.
49. Un élément fixe au sommet et un élément épinglé plus bas ne sont pas la même chose — ne pas mesurer l'un pour conclure de l'autre.
50. **Deux pages de hauteurs différentes ne peuvent pas partager une course en pixels** — verrouiller en pourcentage, ou piloter.
51. `:focus-visible` ne s'arme pas sur un `focus()` de script — pour mesurer l'anneau, tabuler.
52. Une image déclarée n'est pas une image chargée — `complete && naturalWidth > 0`, pas la présence de l'attribut.
53. Une hauteur lue sur la première tuile d'une pile n'est pas la hauteur de la pile.
54. **Dix images ne font pas un mouvement** — c'est l'écart de pixels entre deux consécutives qui le prouve, pas leur nombre.
55. Un fichier de sortie abandonné ne disparaît pas tout seul : une passe qui n'écrit plus laisse l'ancien, et l'outil suivant le lit.
56. `requestAnimationFrame` sur un écouteur de défilement met le contenu en retard d'une image.
57. Une planche-contact ne répond pas à « une marque est-elle lisible ? » — ouvrir le fichier en pleine résolution.
58. **Une fenêtre de recadrage porte sur la LARGEUR** : sur une source en portrait, elle photographie le ciel.
59. `position: sticky` n'est pas `position: fixed`, et une sonde qui ne lit que `fixed` la laisse passer.
60. Un `object-position`, un voile ou une bande étroite ne recadrent PAS le fichier — ce qu'il porte y est toujours.
61. Chaque métier porte sa marque autrement : la chercher au même endroit ne suffit pas.
62. **Un outil qui écrit un registre l'écrase sur une passe partielle** — fusionner, ou refuser d'écrire.
63. Le pli n'est pas une mesure de page, et une capture pleine page ne le montre pas.
64. **`animation-fill-mode: both` rend la moitié du site VIDE en capture pleine page** — `forwards`, jamais `both`.
65. `view()` mesure la boîte de l'élément QU'ELLE ANIME, pas celle qu'on regarde.
66. `overflow-x: clip` cache un vrai défaut à une sonde `scrollWidth`.
67. **Une seule bande plate n'est pas une capture plate** — tout écran bien composé a une bande calme (un capot, un ciel, un bandeau). Juger sur la MÉDIANE, ou sur trois bandes plates de suite. Un seuil posé sur le minimum mesure le cas particulier.
68. **Geler les animations gèle aussi le préchargeur** — un compteur arrêté à « 89 % » n'est pas un premier écran. Vérifier que l'état qu'on fige est celui de la chose, pas de ce qui la précède.
69. **Un dépôt voisin peut être en chantier pendant qu'on le photographie** — lire son `git status` et l'horodatage de ses fichiers avant de conclure d'une erreur de build.
70. **Un masque figé à mi-course sur du TEXTE se lit comme un mot tronqué**, pas comme un mouvement — même raison que l'interdit du scrub d'opacité. Un geste photographié à mi-course doit avoir un état intermédiaire lisible : une bande, un filet, un chiffre entre deux crans. Jamais une lettre coupée.
71. **Un geste d'un pixel n'existe plus à 0,29** — l'aperçu réduit 1440 à 421 px. À 1440, un geste photographié pèse au moins **12 px** dans sa plus petite dimension, et se déplace d'au moins 40 px. Sinon l'écran est fixe là où on le regarde le plus.
72. **Un masque posé avant une attente est effacé par ce qui se reconstruit pendant** — l'hydratation React a rendu le numéro du client en clair après « 9 nœuds masqués ». Masquer DEUX fois, dont une juste avant le déclenchement, et **vérifier dans le texte rendu** : un masque non vérifié peut être défait en silence. Et un vérificateur qui attrape son propre remplacement ne vérifie rien.
73. **Un outil de contraste écrit à la hâte ment quatre fois de suite** — la boîte au lieu du glyphe · l'anticrénelage au lieu du corps · la couleur déclarée au lieu de la couverture réelle · le déplacement d'UN canal alors que Windows fait de l'anticrénelage de sous-pixels. `tools/pire-pixel.mjs`.
74. **Quand un outil de pixels contredit une arithmétique triviale, c'est l'outil qui a tort** — prune sur argile rend 8,29:1 en trois lignes de calcul. J'ai « corrigé » deux fois un écran qui n'avait rien, et écrasé une décision de composition. Mesurer la valeur DÉCLARÉE avant de croire un instrument neuf. *(Vrai quand même : assombrir le fond sous une encre semi-transparente ne change pas le rapport — les deux termes descendent ensemble.)*
75. **Une clôture de commentaire CSS cassée avale la règle suivante, et l'outil de contrôle rend « ok »** — 56 % de la surface d'un écran avait disparu, `demos-controle` disait « 0 mal ». Compter les `/*` et les `*/`.
76. **Un outil de contraste qui ne remonte que les ANCÊTRES ne voit pas une masse posée en FRÈRE** — quatre échecs à « 1:1 » sur du texte à 9,4:1. Sous une masse en frère comme sous une photo, l'arbitre est `tools/pire-pixel.mjs`.

## RÉSERVES — à ne jamais oublier

> **AUCUNE mesure de ce projet n'a été prise sur un appareil réel.**
> Tout vient de Chromium sous Playwright sur une machine de bureau
> Windows, relevés « téléphone » compris. 390 px de large avec
> `pointer: coarse` émulé n'est pas un téléphone. **Aucune session ne
> doit écrire « vérifié sur mobile »**, ni le laisser entendre, tant
> que cette ligne est là.

Les autres réserves ouvertes — FormSubmit jamais activé, la cause
`content-visibility` des déclencheurs ScrollTrigger, deux outils
périmés qui passent en ne mesurant rien, `images/og.png` qui contredit
le site, la piste des Services jamais touchée du doigt — sont dans
`RESERVES.md`.
