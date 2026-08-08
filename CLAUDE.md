# ADEXWEB — site officiel

Site vitrine **statique** d'une agence web québécoise, trois associés
(William, Allen, Eli) : HTML + CSS + JS vanilla + GSAP auto-hébergé,
plusieurs pages, dorsale Google Apps Script, deux PDF. Pas de React, pas
de build (sauf `tools/css-critique.mjs`). **Zéro requête tierce.**

**Le public** : patrons de PME québécoises, 45-60 ans, non techniques,
sans temps — garage, construction, déneigement, restaurant, clinique,
courtier. **Ils ne lisent pas, ils regardent. La seule mesure : est-ce
que ça amène plus de gens à nous appeler ?** Jamais l'esthétique seule.
On veut leur faire penser « c'est clean, je comprends, ces gens-là sont
sérieux ». Premium et signature, mais LIMPIDE. **Une chose à la fois.**

Ce fichier est un **aiguilleur** chargé à chaque tour : il dit ce qu'il ne
faut jamais faire, et où aller chercher le reste. Il n'explique rien.

## L'ANCIENNE IDENTITÉ EST MORTE. ELLE NE REVIENT PAS.

Le site s'appelait **APED**. Verdict des associés : *beau mais trop
compliqué · on dirait un jeu vidéo · trop d'informations, on se perd · pas
clair*. Refait le 2026-08-08. Retour : `git reset --hard avant-adexweb`.

**Faire revenir une seule de ces choses est une régression, même si le
résultat est beau :** le nom **APED** et le préfixe `aped-` · **le rayon
0** (les coins arrondis sont maintenant permis et souhaités) ·
**l'interdiction d'ombre, de dégradé et de flou** (les trois sont permis) ·
la palette **ciment / encre / minium** (`#dcdedb`, `#101211`, `#c8371b`) ·
les polices **Archivo**, **Chivo**, **Martian Mono** · **les quatre
verbes** DÉGAGER · S'ALIGNER · SOUDER · CRAN et leur règle d'admission ·
la **limaille**, la **trame**, les **sas**, les **paliers**, la **plaque**
du hero, la **chambre noire**, le **rideau d'entrée** · `js/limaille.js`,
`js/trame.js`, `js/langue.js`, `js/hero.js`, `js/pointe.js`,
`window.APED_TRAME`, `window.APED_ROULER`, `data-verbe`, `sas-ok`,
`data-palier` · **le mode sombre et son bouton** : le site est clair, point.

Les lignes exactes : `refonte-adexweb/INVENTAIRE-ANCIENNE-IDENTITE.md`.
Les documents de l'ancienne direction sont dans
`archives/2026-08-08-identite-aped/`. **On ne les rouvre pas pour
s'inspirer.**

## LA NOUVELLE IDENTITÉ

### Couleurs — `css/tokens.css` en est la seule source

| Jeton | Valeur | Emploi |
|---|---|---|
| `--pearl` | `#FDFFFF` | **le fond principal, en majorité** |
| `--silk` · `--marble` | `#EEE5D9` · `#E8E4E0` | sections secondaires, cartes · bordures, fonds légers |
| `--navy` | `#222D52` | titres, boutons principaux, en-tête — 13,37:1 sur pearl |
| `--navy-dark` · `--navy-light` | `#18213D` · `#35446F` | appuis — 15,81 · 9,48 |
| `--champagne` | `#D2B68A` | **accents, traits, détails — JAMAIS du texte** |
| `--champagne-dark` · `-light` | `#B99B6B` · `#E7D7BC` | appuis |
| `--text` | `#161A24` | tout le texte qui compte — 17,33:1 sur pearl |
| `--text-soft` | `#4F5261` | texte secondaire courant — 7,72:1 sur pearl |
| `--text-muted` | `#6E7180` | **pearl seulement**, étiquettes et légendes — 4,82:1 |

> **`--text-muted` tombe à 3,88:1 sur silk et 3,83:1 sur marble : il y est
> INTERDIT.** Sur ces deux fonds, le secondaire est `--text-soft`.
> **Le champagne ne porte ni texte ni information** : le plus foncé
> plafonne à 2,63:1 sur pearl, il échoue même au 3:1 d'une icône porteuse
> de sens. Une icône ou une bordure qui **dit quelque chose** est en
> `--navy` ou en `--text`. `node tools/palette-check.mjs` relit
> `css/tokens.css` et arrête si un de ces chiffres ment.

### Polices — auto-hébergées, `fonts/`, licence OFL

**Titres : Newsreader** (serif variable, `wght` 380-560, `opsz` 24-72).
Une serif dit *établi, sérieux, on existe depuis longtemps* à un patron de
55 ans ; une grotesque dit *jeune pousse techno*, et c'est le reproche
qu'on vient de se faire faire. **Corps et interface : Instrument Sans**
(`wdth` figé à 100). Rien de monospace nulle part.
**L'italique de Newsreader est le SEUL appui d'emphase** : un mot par
titre, jamais deux, jamais du gras ni de la couleur à la place. Les
fichiers sont réduits par `python refonte-adexweb/sous-ensemble.py` —
**ne jamais servir un woff2 non réduit.**

### Forme

Coins arrondis, ombres douces, dégradés discrets : **permis, avec
parcimonie.** Ce n'est pas un interdit inversé, c'est un budget : une
ombre qui ne sépare rien est du bruit.

## LES DEUX RÈGLES QUI GOUVERNENT TOUT LE RESTE

### A · VRAI, SINON ÇA NE S'ÉCRIT PAS

Aucune phrase ne s'affiche si elle ne survit pas à un client qui la
conteste au téléphone. La première question qui échoue arrête.

| | Question | Ce qu'elle élimine |
|---|---|---|
| **Q1** | **Est-ce vrai ?** Défendable, pièce en main | « 4,9 · 128 avis » inventés |
| **Q2** | **Le visiteur peut-il le vérifier ?** Sinon, qu'est-ce qui le soutient **ailleurs dans le document** ? | « cinq projets livrés » sans un lien |
| **Q3** | **Est-ce que je le contrôle ?** | « c'est vous qui sortez » sur Google |
| **Q4** | **Un patron de garage comprend-il en trois secondes ?** | « CRM » · « grille 12 colonnes » |

> **UNE CORRECTION DE VÉRACITÉ SE FAIT PARTOUT, EN UNE FOIS.** `grep`
> l'énoncé dans **toutes** les pages, les modales, les `<template>`,
> `documents/src/*.html`, **et le texte rendu**. Le périmètre d'un
> chantier ne justifie jamais de laisser une fausseté ailleurs. Une
> fausseté dans la FAQ est plus grave que dans le hero.
> **UNE RÈGLE RANGÉE OÙ PERSONNE NE LA CHERCHE EST UN PETIT CARACTÈRE** :
> elle se met sous son propre titre, avec le cas qu'elle vise nommé (D-779).

### B · VISIBLE, SINON ÇA NE COMPTE PAS

Une animation qu'on ne remarque pas n'existe pas. **Cinq captures minimum
entre le début et la fin, et l'écart de PIXELS entre deux consécutives** —
dix images ne font pas un mouvement. **Jamais conclure sur la pire image,
ni sur une seule passe, ni sur une planche dont le plancher de bruit n'a pas
été mesuré.** `tools/plaques.mjs` photographie en mouvement PLEIN.

## INTERDITS QUI RESTENT

- **aucun prix sur la page publique** — `node tools/prix-check.mjs` doit
  rendre **0** partout. Trois exceptions et trois seules : **75 $/heure**,
  **40 % au démarrage**, **jusqu'à 5 000 $** du programme de référence. Une
  **fourchette** peut paraître **après** un formulaire complété, étiquetée
  « ordre de grandeur, pas un devis » (D-748). La grille vit dans
  `google/Code.gs` et **NULLE PART AILLEURS** (D-774) ;
- **aucune requête tierce** ; **l'adresse courriel de l'agence n'apparaît
  JAMAIS sur le site** ;
- **aucun faux avis, aucun faux témoignage, aucune note inventée** ; les
  démonstrations sont étiquetées comme telles ;
- **`prefers-reduced-motion` respecté sans faire perdre ni inverser une
  information** ; **jamais scrubber l'opacité d'un élément qui porte du texte** ;
- **aucun mouvement pour impressionner** — chaque animation sert la
  compréhension. Si un écran contient deux choses importantes, il en
  contient une de trop.

> **CES INTERDITS S'ARRÊTENT À LA PORTE DE `demos-secteurs/`** — les
> écrans de métier ont leur propre loi. Y tiennent quand même : aucun
> prix, aucune requête tierce, aucun nom réel, **aucune identité
> d'ADEXWEB**. `demos-secteurs/STANDARD.md`.

## CE QUI CASSE EN SILENCE SI ON LE RENOMME

Lire `refonte-adexweb/INVENTAIRE-PLOMBERIE.md § 11` **avant** de toucher à
un formulaire.

1. **Il n'y a pas d'`action=`** : le routage se fait par le champ **`_form`**
   du corps POST, dont la valeur est la clé du `SCHEMA` de `Code.gs`. Les
   **`name=`** des inputs sont un contrat avec `SCHEMA[kind].champs[]`.
2. **La VALEUR d'un bouton ou d'une `<option>` de l'estimateur EST la clé de
   `ESTIM_GRILLE`.** Une virgule ou une apostrophe typographique changée fait
   retomber `estimTotal()` sur `null` : **plus aucune fourchette, sans une
   erreur.**
3. Les blocs `<!-- CONDITIONS:DEBUT --> … <!-- CONDITIONS:FIN -->` sont
   **générés** — `node tools/conditions.mjs ecrire`, jamais à la main. **Une
   version archivée de `conditions/` ne se modifie jamais** : on en crée une
   à côté.
4. `config.local.js` reste **premier** de la vague 1, avant `main.js`.

## OÙ ALLER

| Si tu travailles sur… | Lis |
|---|---|
| **l'avancement du chantier** | `refonte-adexweb/AVANCEMENT.md` — **le seul état qui survit à une session qui meurt** |
| **ce qui existait, à transposer** | `refonte-adexweb/INVENTAIRE-STRUCTURE.md` |
| **un formulaire, l'estimateur, l'agenda, la sécurité** | `refonte-adexweb/INVENTAIRE-PLOMBERIE.md` |
| **un outil : le garder, le réécrire ?** | `refonte-adexweb/INVENTAIRE-OUTILLAGE.md` |
| **la direction, les références** | `refonte-adexweb/ANALYSE-REFERENCES.md` · `refonte-adexweb/IDENTITE.md` |
| **un verdict surprenant** | `PIEGES.md` — 96 faux verdicts déjà payés |
| **ce qui n'est pas prouvé** | `RESERVES.md` · **un chiffre, un seuil** : `MESURES.md` |
| **pourquoi le code est comme ça** | `DECISIONS.md` + `decisions/`. `grep D-042` trouve les deux bouts |
| **le classeur, le déploiement** | `docs/CONFIGURATION-GOOGLE.md § Étape 7` |
| **un écran de secteur** | `demos-secteurs/STANDARD.md` — la loi · `plans/<clé>.md` |

> **NE LIS JAMAIS UN DOCUMENT DE RÉFÉRENCE EN ENTIER.** Lis la tête
> jusqu'à `<!-- INDEX:FIN -->`, repère le titre de la seule partie qui
> répond, puis `grep -n "^### <titre>" <fichier>`. **La clé d'une entrée est
> son TITRE, jamais un numéro de ligne.** Les index sont **générés** :
> `node tools/index-doc.mjs verifier` et `node tools/plages.mjs verifier`
> doivent rendre « à jour ».

## SEUILS À NE JAMAIS FAIRE RÉGRESSER

| Mesure | Seuil | | Mesure | Seuil |
|---|---|---|---|---|
| LCP, 1440×900 | **< 400 ms** | | erreurs console | **0** |
| CLS | **0** | | requêtes tierces | **0** |
| i/s médiane · images > 20 ms | **60** · **0** | | écart de cascade | **0** |
| contraste, 5 largeurs | **0 échec** | | arrêts au clavier sans anneau | **0** |
| débordement horizontal, 320 → 1920 | **aucun** | | | |

Le seuil LCP datait des onze sections dans un seul document : couper juste
après le hero le faisait tomber à 170 ms. **Le multi-pages règle la
cause** — mesurer, prouver, puis redescendre le seuil.
**`css/app.css` est la SEULE source de style** ; `critique.css` et
`differe.css` sont fabriqués. Après toute modification :
`node tools/css-critique.mjs` puis `node tools/cascade-check.mjs`, qui doit
rendre **0 écart**. Un commentaire de code dit CE QUE FAIT le code, en une
ligne, et porte un `D-xxx` ; le POURQUOI vit dans `decisions/`.

## LES PIÈGES QUI MORDENT LE PLUS SOUVENT

| Le piège | № |
|---|---|
| **Une sonde du DOM ne peut pas voir un défaut de peinture** — ni un recouvrement (`pointer-events: none` est invisible à `elementFromPoint`), ni un rognage (`getBoundingClientRect` ignore l'`overflow` d'un ancêtre). L'arbitre est l'image | 25 · 77 · 83 |
| **Un test peut verrouiller le défaut** — avant de corriger, lis le `*-check.mjs` de la zone ; s'il passe encore sans modification, c'est lui le problème | 17 |
| **Un outil ARRÊTÉ est un outil MORT**, et **un outil qui rend « 0 » sans erreur ment** — zéro résultat doit ARRÊTER l'outil | 96 · 30 · 40 · 62 |
| **`content-visibility: auto` rend la taille RÉSERVÉE**, pas la vraie ; **`order` réordonne aussi l'ORDRE DE PEINTURE** ; **une clôture de commentaire CSS cassée avale la règle suivante** et l'outil rend « ok » | 4 · 34 · 77 · 75 |
| **GSAP lit un `transform` CSS de repos comme une base en PIXELS** — purger avec un `y: 0` explicite dans le `fromTo` | 33 |
| **Un contournement survit toujours au correctif** ; **un A/B se fait en worktree, pas en `stash`** | 46 · 19 |
| **Le popup cadeau bloque les outils** — poser `sessionStorage["adexweb-sans-popup"] = "1"` dans tout outil qui clique | 18 |
| **`.` ne matche pas `\r` en JavaScript** — sur un fichier CRLF, `/^…$/` échoue en silence | 86 |
| **`=`, `+`, `-` ou `@` en tête font une FORMULE dans Sheets** ; **`setValues` n'est PAS tout ou rien** ; **changer une valeur de liste ne réécrit aucune cellule déjà remplie** | 93 · 94 · 95 |

## RÉSERVE — à ne jamais oublier

> **AUCUNE mesure de ce projet n'a été prise sur un appareil réel.** Tout
> vient de Chromium sous Playwright sur une machine de bureau Windows,
> relevés « téléphone » compris. **Aucune session ne doit écrire
> « vérifié sur mobile »**, ni le laisser entendre, tant que cette ligne
> est là.

Les autres réserves ouvertes sont dans `RESERVES.md`.
