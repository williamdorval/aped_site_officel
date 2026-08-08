# APED Agency — site officiel

Site vitrine **statique** d'une agence web québécoise : HTML + CSS + JS
vanilla + GSAP. Onze sections, une seule page, deux PDF. Pas de React,
pas de build (sauf `tools/css-critique.mjs`, qui découpe le CSS).
**Zéro requête tierce** — aucun CDN, traceur, témoin ni police distante.

Ce fichier est un **aiguilleur**, chargé à chaque tour : chaque ligne
s'y paie des milliers de fois. Il dit ce qu'il ne faut jamais faire, et
où aller chercher le reste. Il n'explique rien.

## LIRE — AVANT D'OUVRIR QUOI QUE CE SOIT

> **NE LIS JAMAIS UN DOCUMENT DE RÉFÉRENCE EN ENTIER.** Son **index
> généré** de tête coûte cent fois moins et suffit à savoir quoi demander.

Lis la tête jusqu'à `<!-- INDEX:FIN -->`, repère le titre de la seule
partie qui répond, puis `grep -n "^### <titre>" <fichier>` et lis cette
plage-là. (`##` pour les seize journaux de `decisions/` ; l'index le dit
lui-même.) **La clé d'une entrée est son TITRE, jamais un numéro de
ligne** — les 420 références `fichier:ligne` d'`ANIMATIONS.md` étaient
toutes fausses.

Les index sont **générés** : `node tools/index-doc.mjs verifier` et
`node tools/plages.mjs verifier` doivent rendre « à jour ». Une table
tenue à la main décroche toujours sans que personne le voie : celle de
`PIEGES.md` s'était arrêtée à 32 pièges sur 86, et dix des seize
journaux de `decisions/` avaient perdu 121 décisions.

## OÙ ALLER

| Si tu travailles sur… | Lis |
|---|---|
| **une section nommée** (Services, FAQ…) | `SECTIONS.md` — plages **générées**, en tête |
| **un fichier, sans savoir lequel** | `ARCHITECTURE.md § 1 · OÙ VAIS-JE ?` — 14 types de tâche |
| **un mouvement** | `ANIMATIONS.md` — déclencheur, durée, verrou, verbe, niveau |
| **pourquoi le code est comme ça** | `DECISIONS.md` + `decisions/`. `grep D-042` trouve les deux bouts |
| **un chiffre, un seuil, un outil** | `MESURES.md` |
| **un verdict surprenant** | `PIEGES.md` — 96 faux verdicts déjà payés |
| **ce qui n'est pas prouvé, pas fini** | `RESERVES.md` |
| **quels skills charger** | `DESIGN-STACK.md` · **les sas** `REFONTE-IMMERSIVE.md` |
| **un écran de secteur** (douze métiers) | `demos-secteurs/STANDARD.md` — la loi · `plans/<clé>.md` · `ARCHITECTURE.md § 10` |
| **le programme de référence** | `decisions/index.md § D-773` et **§ D-779**. Texte **généré** : source `conditions/reference-<version>.md`, `node tools/conditions.mjs ecrire` puis `verifier`. **Une version archivée ne se modifie jamais** — on en crée une à côté, lettre de fin si c'est le même jour |
| **l'estimateur ou un prix** | `decisions/index.md § D-774`. **La grille vit dans `google/Code.gs` et nulle part ailleurs** — le site envoie des réponses, reçoit une fourchette. `node tools/retro-estim.mjs` |
| **le classeur, le déploiement** | `docs/CONFIGURATION-GOOGLE-APED.md § Étape 7` — quand redéployer, quoi lancer, lire le journal |
| **les preuves, l'historique** | `preuves/LISEZ-MOI.md` · `archives/rapports/` |

**Ces documents se mettent à jour à chaque changement de structure.**

## LES DEUX RÈGLES QUI GOUVERNENT TOUT LE RESTE

### A · VRAI, SINON ÇA NE S'ÉCRIT PAS

Aucune phrase ne s'affiche si elle ne survit pas à un client qui la
conteste au téléphone. Quatre questions ; la première qui échoue arrête.

| | Question | Ce qu'elle élimine |
|---|---|---|
| **Q1** | **Est-ce vrai ?** Défendable, pièce en main | « 4,9 · 128 avis » inventés |
| **Q2** | **Le visiteur peut-il le vérifier ?** Sinon, qu'est-ce qui le soutient **ailleurs dans le document** ? | « cinq projets livrés » sans un lien |
| **Q3** | **Est-ce que je le contrôle ?** | « c'est vous qui sortez » sur Google |
| **Q4** | **Un patron de garage comprend-il en trois secondes ?** | « CRM » · « grille 12 colonnes » |

> **UNE CORRECTION DE VÉRACITÉ SE FAIT PARTOUT, EN UNE FOIS.** `grep`
> l'énoncé dans **tout** `index.html`, les modales, les `<template>`,
> `documents/src/*.html`, `404.html`, `confidentialite.html`, **et le
> texte rendu**. Le périmètre d'un chantier ne justifie jamais de
> laisser une fausseté ailleurs. Une fausseté dans la FAQ est plus
> grave que dans le hero.

> **UNE RÈGLE RANGÉE OÙ PERSONNE NE LA CHERCHE EST UN PETIT CARACTÈRE**,
> même sans petits caractères : elle se met sous son propre titre, avec
> le cas qu'elle vise nommé. *(D-779)*

### B · VISIBLE, SINON ÇA NE COMPTE PAS

Une animation qu'on ne remarque pas n'existe pas.

- **Cinq captures minimum entre le début et la fin, et l'écart de
  PIXELS entre deux consécutives.** Dix images ne font pas un mouvement.
- **Jamais conclure sur la pire image, ni sur une seule passe, ni sur
  une planche dont le plancher de bruit n'a pas été mesuré.**
- **Une planche en mouvement réduit ne peut pas voir un défaut de sas**
  — `sas-ok` n'est jamais posée sous `prefers-reduced-motion`.
  `tools/plaques.mjs` photographie en mouvement PLEIN.

## INTERDITS ABSOLUS

- **rayon 0** — aucun coin arrondi, nulle part ;
- **aucune ombre portée** — la profondeur est un filet de 1 px décalé ;
- **aucun dégradé** — sauf les trames `repeating-linear-gradient`, qui
  sont des grains, pas un fondu ;
- **aucun flou** — ni `blur`, ni `backdrop-filter` ;
- **aucun prix sur la page publique.** `node tools/prix-check.mjs` :
  `A RETIRER dans le source` et `Montants du bareme visibles au
  chargement` restent à **0**. Le chiffre du calculateur est un montant
  d'**économies estimées**. Trois exceptions publiques et trois seules :
  **75 $/heure**, **40 % au démarrage**, **jusqu'à 5 000 $** du
  programme de référence. Une **fourchette** peut paraître **après** un
  formulaire complété, dans la modale, étiquetée « ordre de grandeur,
  pas un devis » (D-748). Depuis D-774 la grille vit dans
  `google/Code.gs` et NULLE PART ailleurs : `prix-check` échoue si une
  grille se **reforme** dans un fichier servi ;
- **aucune requête tierce** ;
- **l'adresse courriel de l'agence n'apparaît JAMAIS sur le site** ;
- **rien qui ne se réclame pas d'un des quatre verbes** ;
- **`prefers-reduced-motion` respecté sans jamais faire perdre ni
  inverser une information** ;
- **jamais scrubber l'opacité d'un élément qui porte du texte** — un
  `scrub` n'a pas d'état de repos, il a celui où le visiteur s'est arrêté ;
- **aucun état de départ d'animation dans le CSS** — le repos est
  toujours la forme FINALE ; le script pose le départ avec
  `immediateRender: false` ;
- trois matières et rien d'autre : **ciment, encre, minium**
  (`css/tokens.css`). Le minium paraît une fois en pleine masse au hero,
  puis seulement là où le visiteur peut **agir** : CTA primaire, index
  actif, chiffre du calculateur, filet de la section active.

> **CES INTERDITS S'ARRÊTENT À LA PORTE DE `demos-secteurs/`** — les
> douze écrans de métier ont droit aux rayons, ombres, dégradés et
> flous. Y tiennent quand même : aucun prix, aucune requête tierce,
> aucun nom réel, **aucune identité d'APED**. `STANDARD.md`.

## LES QUATRE VERBES — la grammaire, il n'y en a pas d'autres

Définis dans `js/langue.js`, moteur `js/limaille.js`. Le motif : **APED
est fait de limaille** — ζ = 1, aucun dépassement, forme au repos nette
au pixel.

| | Verbe | Ce que ça fait |
|---|---|---|
| **V1** | **DÉGAGER** | Une forme **déjà là** se découvre sous une arête **franche** qui balaye. Jamais un fondu |
| **V2** | **S'ALIGNER** | Les blocs arrivent décalés latéralement et se reprennent. Aucun dépassement |
| **V3** | **SOUDER** | Un filet apparaît en trame de grains, puis se ressoude en trait plein |
| **V4** | **CRAN** | Un état ne fond pas dans un autre : il roule d'un cran |

> **RÈGLE D'ADMISSION : avant d'ajouter un mouvement, dire lequel des
> quatre il est.** Sinon il ne se fait pas, même si l'effet est beau.

**La direction du balayage n'est jamais décorative** : gauche→droite
pour un titre, un libellé, un filet ; haut→bas pour une page, une
capture, un panneau. Aucune exception. **La trame** (`js/trame.js`)
n'est pas un cinquième verbe : c'est V1 dont l'arête est faite de la
matière de V3. **Ne jamais poser douze séparateurs.**

## SEUILS À NE JAMAIS FAIRE RÉGRESSER

> **LE SEUIL LCP A ÉTÉ RELEVÉ DE 300 À 400 ms LE 2026-08-07**, et
> ce n’est pas un renoncement : **rien n’a mesuré moins de 336 ms ce
> jour-là, à AUCUN commit**, machine au repos, y compris avant tout
> changement. Un seuil que personne n’atteint est un test vert sur du
> vide — il ne garde plus rien, il crie tous les jours. Le LCP **est**
> le FCP (un seul candidat, horodatage identique), et couper le
> document juste après le hero le fait tomber à 170 ms : le coût est
> **les onze sections**, pas le CSS ni les polices. Le vrai correctif
> est une refonte de la structure du document ; tant qu’elle n’est pas
> faite, le seuil dit la vérité au lieu de la maquiller. `RESERVES.md`.

Détail, méthode et outils : `MESURES.md`.

| Mesure | Seuil | | Mesure | Seuil |
|---|---|---|---|---|
| LCP (`SPAN.plate-big`, 1440×900) | **< 400 ms** — voir la note | | erreurs console | **0** |
| CLS | **0** | | requêtes tierces | **0** |
| i/s médiane, traversée · images > 20 ms | **60** · **0** | | écart de cascade | **0** |
| contraste, 5 largeurs × 2 thèmes | **0 échec** | | arrêts au clavier sans anneau | **0** |
| débordement horizontal, 320 → 1920 px | **aucun** | | | |

## STRUCTURE — cinq règles à ne pas casser

1. **`css/app.css` est la SEULE source.** `critique.css` et `differe.css`
   sont fabriqués. Après toute modification : `node tools/css-critique.mjs`
   puis `node tools/cascade-check.mjs`, qui doit rendre **0 écart**.
2. **`differe.css` est injecté par JavaScript** : une animation de
   **chargement** ne peut pas y vivre (mesuré : +223 ms constant).
3. **L'orientation ne vit jamais dans `motion.js` ni `langue.js`** : ils
   s'arrêtent net sous `prefers-reduced-motion`. Tout ce qui répond à
   « où je suis, combien il en reste » vit dans `main.js`.
4. **Les scripts sont injectés APRÈS le premier rendu, en deux vagues.**
   V1 : `limaille`, `main`, `hero`. V2 (premier geste ou 1,2 s) : GSAP,
   ScrollTrigger, `motion`, `langue`, `pointe`, `tour360`. **Rien de
   nécessaire à la LECTURE ni à l'USAGE ne dépend du JavaScript.**
5. **Trois paliers de dégradation**, `data-palier` sur `<html>` : **0**
   plein · **1** allégé · **2** minimal · **3** aucun. **L'escalade est à
   sens unique.** `html.sas-ok` se décide dans le `<head>` AVANT la
   première mise en page ; un sas déjà ouvert **se fige** et ne rend
   **jamais** sa hauteur.

**Un commentaire de code dit CE QUE FAIT le code, en une ligne, et porte
l'identifiant `D-xxx`. Le POURQUOI vit dans `decisions/`.**

## LES PIÈGES QUI MORDENT LE PLUS SOUVENT

Les 96 sont dans `PIEGES.md` — **lis son index de tête, puis
`grep "^### <n>"`**. Ceux-ci reviennent tous les mois :

| Le piège | № |
|---|---|
| **Une sonde du DOM ne peut pas voir un défaut de peinture** — ni un recouvrement (`pointer-events: none` est invisible à `elementFromPoint`), ni un rognage (`getBoundingClientRect` ignore l'`overflow` d'un ancêtre). L'arbitre est l'image | 25 · 77 · 83 |
| **Un test peut verrouiller le défaut** — avant de corriger, lis le `*-check.mjs` de la zone ; s'il passe encore sans modification, c'est lui le problème | 17 |
| **Un outil ARRÊTÉ est un outil MORT** — absence de test, jamais test qui passe, et il éteint tous ses autres contrôles avec lui | 96 |
| **Un outil qui rend « 0 » sans erreur ment** — zéro résultat doit ARRÊTER l'outil, jamais retomber en silence sur un défaut | 30 · 40 · 62 |
| **Un `scrollTo` vers une section n'y arrive jamais** quand des sas grandissent la page — traverser au pas, puis VÉRIFIER où est l'objet dans l'image | 80 |
| **`content-visibility: auto` rend la taille RÉSERVÉE**, pas la vraie — mesurer pendant que la section est à l'écran | 4 · 34 |
| **Une clôture de commentaire CSS cassée avale la règle suivante**, et l'outil rend « ok ». Compter les `/*` et les `*/` | 75 |
| **`order` réordonne aussi l'ORDRE DE PEINTURE** | 77 |
| **GSAP lit un `transform` CSS de repos comme une base en PIXELS** — purger avec un `y: 0` explicite dans le `fromTo` | 33 |
| **Un contournement survit toujours au correctif** — cause réparée, chercher et retirer la rustine | 46 |
| **Un A/B se fait en worktree, pas en `stash`** — et vérifier que le port est libre | 19 |
| **Le popup cadeau bloque les outils** — poser `sessionStorage["aped-sans-popup"] = "1"` dans tout outil qui clique | 18 |
| **`.` ne matche pas `\r` en JavaScript** — sur un fichier CRLF, `/^…$/` échoue en silence et l'outil rend « 0 » | 86 |
| **Une sonde lue avant 3 s ne voit pas la vraie page** — `data-palier` et `data-lettres` arrivent après. Toute sonde imprime `data-palier` à côté de son verdict | 87 |
| **Sur un `.btn`, `::before` est pris par l'aplat de V4**, et `.btn .l` bat toute règle à une classe | 88 |
| **Un outil calibré sur le banc ment contre le vrai Google** — attente fixe contre un service qui met 2 à 8 s | 90 · 91 |
| **Dans Sheets, `=`, `+`, `-` ou `@` en tête font une FORMULE** — seul `getFormulas()` le dit, seule l'apostrophe de tête range du texte | 93 |
| **`setValues` n'est PAS tout ou rien** — une validation périmée refuse une cellule, les colonnes de GAUCHE sont déjà écrites. Purger les validations AVANT `migrerColonnes` | 94 |
| **Changer une valeur de liste ne réécrit AUCUNE cellule déjà remplie** — la ligne d'avant reste minée et ne casse qu'à la FUSION, des semaines plus tard | 95 |

## RÉSERVE — à ne jamais oublier

> **AUCUNE mesure de ce projet n'a été prise sur un appareil réel.** Tout
> vient de Chromium sous Playwright sur une machine de bureau Windows,
> relevés « téléphone » compris. **Aucune session ne doit écrire
> « vérifié sur mobile »**, ni le laisser entendre, tant que cette ligne
> est là.

Les autres réserves ouvertes sont dans `RESERVES.md`.
