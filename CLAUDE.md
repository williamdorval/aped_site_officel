# APED Agency — site officiel

Site vitrine **statique** d'une agence web québécoise : HTML + CSS + JS
vanilla + GSAP. Pas de React, pas de build (sauf `tools/css-critique.mjs`
qui découpe le CSS). Onze sections, une seule page, deux PDF.
**Zéro requête tierce** — aucun CDN, traceur, témoin ni police distante.

Ce fichier est un **aiguilleur**, et il est chargé à chaque tour : chaque
ligne s'y paie des milliers de fois. Il dit ce qu'il ne faut jamais
faire, et où aller chercher le reste. Il n'explique rien.

## PROTOCOLE DE LECTURE — AVANT D'OUVRIR QUOI QUE CE SOIT

> **NE LIS JAMAIS UN DOCUMENT DE RÉFÉRENCE EN ENTIER.** Les sept
> pèsent 115 000 jetons ; leurs **index générés** de tête en coûtent
> 7 900 et suffisent à savoir quoi demander.

1. Lis la **tête** du document, jusqu'à `<!-- INDEX:FIN -->`.
2. Repère le titre de la seule partie qui répond.
3. `grep -n "^### <titre>" <fichier>` puis lis cette plage-là.

**La clé d'une entrée est son TITRE, jamais un numéro de ligne** — les
420 références `fichier:ligne` d'`ANIMATIONS.md` ont été retirées le
2026-07-30 : elles étaient toutes fausses.

Les index sont **générés** : `node tools/index-doc.mjs verifier` et
`node tools/plages.mjs verifier` doivent rendre « à jour ». Un index
périmé envoie lire le mauvais endroit et coûte plus cher que pas
d'index — la table de `PIEGES.md`, tenue à la main, s'était arrêtée à
32 pièges sur 86 sans que personne le voie.

## OÙ ALLER

| Si tu travailles sur… | Lis |
|---|---|
| **une section nommée** (Services, FAQ…) | `SECTIONS.md` — le tableau des plages est **généré**, il est en tête |
| **un fichier, sans savoir lequel** | `ARCHITECTURE.md § 1 · OÙ VAIS-JE ?` — table de routage, 14 types de tâche |
| **un mouvement** | `ANIMATIONS.md` — une ligne par animation : fichier, déclencheur, durée, verrou, verbe, niveau |
| **pourquoi le code est comme ça** | `DECISIONS.md` + `decisions/`. Le code porte l'identifiant : `grep D-042` trouve les deux bouts |
| **un chiffre, un seuil, un outil de mesure** | `MESURES.md` |
| **une mesure qui rend un verdict surprenant** | `PIEGES.md` — 86 faux verdicts déjà payés |
| **ce qui n'est pas prouvé, pas fini** | `RESERVES.md` |
| **quels skills charger** | `DESIGN-STACK.md` |
| **les sas, l'arc de luminance, la chambre noire** | `REFONTE-IMMERSIVE.md` |
| **un écran de secteur** (les douze métiers) | `demos-secteurs/STANDARD.md` — la loi · `demos-secteurs/plans/<clé>.md` — la DA du métier · `ARCHITECTURE.md § 10` |
| **les preuves d'un chantier** | `preuves/LISEZ-MOI.md` |
| **l'historique** | `archives/rapports/` |

**Ces documents se mettent à jour à chaque changement de structure.**

## LES DEUX RÈGLES QUI GOUVERNENT TOUT LE RESTE

### A · VRAI, SINON ÇA NE S'ÉCRIT PAS

Aucune phrase ne s'affiche si elle ne survit pas à un client qui la
conteste au téléphone. Quatre questions ; la première qui échoue arrête.

| | Question | Ce qu'elle élimine |
|---|---|---|
| **Q1** | **Est-ce vrai ?** Défendable, pièce en main. | « 4,9 · 128 avis » inventés |
| **Q2** | **Le visiteur peut-il le vérifier ?** Sinon, qu'est-ce qui le soutient **ailleurs dans le document** ? | « cinq projets livrés » sans un lien |
| **Q3** | **Est-ce que je le contrôle ?** | « c'est vous qui sortez » sur Google |
| **Q4** | **Un patron de garage le comprend-il en trois secondes ?** | « CRM » · « grille 12 colonnes » |

> **UNE CORRECTION DE VÉRACITÉ SE FAIT PARTOUT, EN UNE FOIS.** `grep`
> l'énoncé dans **tout** `index.html`, les modales, les `<template>`,
> `documents/src/*.html`, `404.html`, **et le texte rendu**. Le
> périmètre d'un chantier ne justifie jamais de laisser une fausseté
> ailleurs. Une fausseté dans la FAQ est plus grave que dans le hero.

### B · VISIBLE, SINON ÇA NE COMPTE PAS

Une animation qu'on ne remarque pas n'existe pas.

- **Preuve exigée pour tout mouvement : cinq captures minimum entre le
  début et la fin, et l'écart de PIXELS entre deux consécutives.** Dix
  images ne font pas un mouvement — c'est l'écart qui le prouve.
- **Ne jamais conclure sur la pire image, ni sur une seule passe, ni
  sur une planche dont le plancher de bruit n'a pas été mesuré.**
- **Une planche en mouvement réduit ne peut pas voir un défaut de sas**
  — `sas-ok` n'est jamais posée sous `prefers-reduced-motion`.
  `tools/plaques.mjs` photographie en mouvement PLEIN.

## INTERDITS ABSOLUS

- **rayon 0** — aucun coin arrondi, nulle part ;
- **aucune ombre portée** — la profondeur est un filet de 1 px décalé ;
- **aucun dégradé** — sauf les trames `repeating-linear-gradient`, qui
  sont des grains, pas un fondu ;
- **aucun flou** — ni `blur`, ni `backdrop-filter` ;
- **aucun prix, nulle part** — `node tools/prix-check.mjs`, `A RETIRER
  dans le source` doit rester à **0**. Le chiffre du calculateur est un
  montant d'**économies estimées** ;
- **aucune requête tierce** ;
- **rien qui ne se réclame pas d'un des quatre verbes** ;
- **`prefers-reduced-motion` respecté sans jamais faire perdre ni
  inverser une information** ;
- **jamais scrubber l'opacité d'un élément qui porte du texte** — un
  `scrub` n'a pas d'état de repos, il a l'état où le visiteur s'est
  arrêté ;
- **aucun état de départ d'animation dans le CSS** — le repos est
  toujours la forme FINALE ; le script pose le départ avec
  `immediateRender: false` ;
- trois matières et rien d'autre : **ciment, encre, minium**
  (`css/tokens.css`). Le minium apparaît une fois en pleine masse au
  hero, puis seulement là où le visiteur peut **agir** : CTA primaire,
  index actif, chiffre du calculateur, filet de la section active.

> **CES INTERDITS S'ARRÊTENT À LA PORTE DE `demos-secteurs/`** — les
> douze écrans de métier ont droit aux rayons, ombres, dégradés et
> flous. Y tiennent quand même : aucun prix, aucune requête tierce,
> aucun nom réel, et **aucune identité d'APED**. `STANDARD.md`.

## LES QUATRE VERBES — la grammaire, il n'y en a pas d'autres

Définis dans `js/langue.js`, moteur `js/limaille.js`. Le motif :
**APED est fait de limaille** — ζ = 1, aucun dépassement, forme au
repos nette au pixel.

| | Verbe | Ce que ça fait |
|---|---|---|
| **V1** | **DÉGAGER** | Une forme **déjà là** se découvre sous une arête **franche** qui balaye. Jamais un fondu |
| **V2** | **S'ALIGNER** | Les blocs arrivent décalés latéralement et se reprennent. Aucun dépassement, ζ = 1 |
| **V3** | **SOUDER** | Un filet apparaît en trame de grains, puis se ressoude en trait plein |
| **V4** | **CRAN** | Un état ne fond pas dans un autre : il roule d'un cran |

> **RÈGLE D'ADMISSION : avant d'ajouter un mouvement, dire lequel des
> quatre il est.** Sinon il ne se fait pas, même si l'effet est beau.

**La direction du balayage n'est jamais décorative** : elle suit le sens
de lecture — gauche→droite pour un titre, un libellé, un filet ;
haut→bas pour une page, une capture, un panneau. Aucune exception.

**La trame** (`js/trame.js`) n'est pas un cinquième verbe : c'est V1
dont l'arête est faite de la matière de V3. **Ne jamais poser douze
séparateurs.**

## SEUILS À NE JAMAIS FAIRE RÉGRESSER

| Mesure | Seuil |
|---|---|
| LCP (`SPAN.plate-big`, 1440×900) | **< 300 ms** |
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
   **chargement** ne peut pas y vivre (mesuré : +223 ms constant).
3. **L'orientation ne vit jamais dans `motion.js` ni `langue.js`** :
   ils s'arrêtent net sous `prefers-reduced-motion`. Tout ce qui répond
   à « où je suis, combien il en reste » vit dans `main.js`.
4. **Les scripts sont injectés APRÈS le premier rendu, en deux vagues.**
   V1 : `limaille`, `main`, `hero`. V2 (premier geste ou 1,2 s) : GSAP,
   ScrollTrigger, `motion`, `langue`, `pointe`, `tour360`. **Rien de
   nécessaire à la LECTURE ni à l'USAGE ne dépend du JavaScript.**
5. **Trois paliers de dégradation**, `data-palier` sur `<html>` : **0**
   plein · **1** allégé · **2** minimal · **3** aucun. **L'escalade est
   à sens unique.** `html.sas-ok` se décide dans le `<head>` AVANT la
   première mise en page ; un sas déjà ouvert **se fige** et ne rend
   **jamais** sa hauteur.

**Un commentaire de code dit CE QUE FAIT le code, en une ligne, et porte
l'identifiant `D-xxx`. Le POURQUOI vit dans `decisions/`.**

## LES PIÈGES QUI MORDENT LE PLUS SOUVENT

Les 86 sont dans `PIEGES.md` avec cause et correctif — **lis son index
de tête, puis `grep "^### <n>"`**. Ceux-ci reviennent tous les mois :

1. **Une sonde du DOM ne peut pas voir un défaut de peinture.** Ni un
   recouvrement (`pointer-events: none` est invisible à
   `elementFromPoint`), ni un rognage (`getBoundingClientRect` ignore
   l'`overflow` d'un ancêtre). L'arbitre est l'image. *(25 · 77 · 83)*
2. **Un test peut verrouiller le défaut** — quand tu corriges, lis le
   `*-check.mjs` de la zone ; s'il passe encore sans modification,
   c'est lui le problème. *(17)*
3. **Un `scrollTo` vers une section n'y arrive jamais** quand des sas
   grandissent la page — traverser toute la page, piloter au pas, puis
   VÉRIFIER où est l'objet dans l'image. *(80)*
4. **Un outil qui rend « 0 » sans erreur ment.** Zéro résultat doit
   ARRÊTER l'outil, jamais retomber en silence sur un défaut.
   *(30 · 40 · 62)*
5. **`content-visibility: auto` rend la taille RÉSERVÉE**, pas la vraie
   — mesurer pendant que la section est à l'écran. *(4 · 34)*
6. **Une clôture de commentaire CSS cassée avale la règle suivante**, et
   l'outil de contrôle rend « ok ». Compter les `/*` et les `*/`. *(75)*
7. **`order` réordonne aussi l'ORDRE DE PEINTURE.** *(77)*
8. **GSAP lit un `transform` CSS de repos comme une base en PIXELS** —
   purger avec un `y: 0` explicite dans le `fromTo`. *(33)*
9. **Un contournement survit toujours au correctif** — quand la cause
   est réparée, chercher et retirer la rustine. *(46)*
10. **Un A/B se fait en worktree, pas en `stash`** — et vérifier que le
    port est libre. *(19)*
11. **Le popup cadeau bloque les outils** : poser
    `sessionStorage["aped-sans-popup"] = "1"` dans tout outil qui clique.
    *(18)*
12. **`.` ne matche pas `\r` en JavaScript** — sur un fichier CRLF,
    `/^…$/` échoue en silence et l'outil rend « 0 » sans erreur. *(86)*

## RÉSERVE — à ne jamais oublier

> **AUCUNE mesure de ce projet n'a été prise sur un appareil réel.**
> Tout vient de Chromium sous Playwright sur une machine de bureau
> Windows, relevés « téléphone » compris. **Aucune session ne doit
> écrire « vérifié sur mobile »**, ni le laisser entendre, tant que
> cette ligne est là.

Les autres réserves ouvertes sont dans `RESERVES.md`.
