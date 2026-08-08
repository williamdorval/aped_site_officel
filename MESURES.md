# MESURES — les chiffres, et les outils qui les produisent

**Quand lire ce fichier :** avant d'annoncer un chiffre, avant de
choisir un outil, et après toute modification qui touche à la
performance ou au contraste.

Tout ce qui est ici a été **mesuré**, jamais estimé. Un chiffre sans
outil en regard n'a pas sa place dans ce fichier.

- [1 · Les deux règles de mesure](#regles)
- [2 · La règle du scrub](#scrub)
- [3 · Les outils](#outils)
- [4 · Chiffres de référence](#chiffres)
- [5 · Seuils de perception](#perception)


<!-- INDEX:DEBUT -->

> **NE LIS PAS CE FICHIER EN ENTIER.** Cette table donne le titre exact
> de chaque partie et ce qu'elle coûte. Va chercher la seule qui répond :
> `grep -n "^### <titre>" <fichier>` puis lis la plage. Le titre est la clé —
> il ne périme pas, un numéro de ligne oui.

| Partie | Lignes | Jetons ~ |
|---|---:|---:|
| **1 · LES DEUX RÈGLES DE MESURE, APPRISES À LA DURE** | 35 | 485 |
| **2 · LA RÈGLE DU SCRUB** | 18 | 216 |
| **3 · LES OUTILS** | 5 | 35 |
| &nbsp;&nbsp;↳ Non-régression de structure | 12 | 573 |
| &nbsp;&nbsp;↳ L'accueil et les sections | 12 | 426 |
| &nbsp;&nbsp;↳ Identité, contraste, débordement | 19 | 1 234 |
| &nbsp;&nbsp;↳ Le mouvement | 10 | 161 |
| &nbsp;&nbsp;↳ Le reste | 12 | 244 |
| &nbsp;&nbsp;↳ Le service des formulaires et la réservation | 38 | 667 |
| **4 · CHIFFRES DE RÉFÉRENCE** | 2 | 8 |
| &nbsp;&nbsp;↳ Accueil #top, 1440 × 900, thème clair — 2026-07-29 | 18 | 262 |
| &nbsp;&nbsp;↳ Section 02 · Services, seconde refonte du 2026-07-30 | 14 | 199 |
| &nbsp;&nbsp;↳ Section 03 · Avant / après — node tools/ba-check.mjs | 12 | 165 |
| &nbsp;&nbsp;↳ Toute la page, après les trois chantiers du 2026-07-30 | 10 | 118 |
| &nbsp;&nbsp;↳ Section 02, PREMIÈRE refonte du 2026-07-30 | 13 | 208 |
| &nbsp;&nbsp;↳ Chantier de structure du 2026-07-30 | 37 | 489 |
| **5 · SEUILS DE PERCEPTION** | 15 | 187 |
| &nbsp;&nbsp;↳ Les outils du chantier Services et Réalisations (2026-07-31) | 10 | 180 |
| &nbsp;&nbsp;↳ Le chantier des sas (2026-07-31) | 14 | 241 |
| &nbsp;&nbsp;↳ Chiffres de référence — refonte immersive, 2026-07-31, 1440×900 clair | 30 | 396 |
| **RELEVÉS DU 2026-07-31 · MISE EN PRODUCTION** | 7 | 82 |
| &nbsp;&nbsp;↳ Les quatre outils de preuve, un par chantier | 10 | 268 |
| &nbsp;&nbsp;↳ La saccade, et comment elle se mesure | 15 | 162 |
| &nbsp;&nbsp;↳ Le socle de performance, après les quatre chantiers | 22 | 267 |
| &nbsp;&nbsp;↳ Ce qui a été trouvé par la mesure, et n'aurait pas été trouvé autrement | 8 | 116 |
| **LES DOUZE PREMIERS ÉCRANS — 2026-08-01** | 2 | 12 |
| &nbsp;&nbsp;↳ Les outils de cette chaîne | 11 | 394 |
| &nbsp;&nbsp;↳ La géométrie du panneau, relevée | 27 | 269 |
| &nbsp;&nbsp;↳ Les trois faux verdicts de ce chantier | 13 | 152 |
| **RELEVÉS DU 2026-08-06 · VALIDATION AVANT PRODUCTION** | 5 | 59 |
| &nbsp;&nbsp;↳ La grille livrée | 13 | 105 |
| &nbsp;&nbsp;↳ Le temps de réaction de l'agenda | 13 | 136 |
| &nbsp;&nbsp;↳ Double réservation, contre le vrai Google | 13 | 113 |
| &nbsp;&nbsp;↳ Le fuseau | 8 | 80 |
| &nbsp;&nbsp;↳ Latence et taux d'échec | 11 | 114 |
| &nbsp;&nbsp;↳ Les cibles tactiles | 16 | 149 |
| &nbsp;&nbsp;↳ RELEVÉS DU 2026-08-07 · LE PROGRAMME DE RÉFÉRENCE (D-773) | 62 | 700 |

<!-- INDEX:FIN -->

---

<a id="regles"></a>
## 1 · LES DEUX RÈGLES DE MESURE, APPRISES À LA DURE

**Ne jamais comparer deux médianes calculées sur une série qui dérive.**
Relevé du 2026-07-26, **code inchangé**, neuf passes :
`167, 0, 0, 0, 108, 942, 962, 981, 658 ms`. La machine dérive d'un
facteur six entre la première passe et la dernière. Il faut mesurer les
deux versions **dans la même passe** et prendre la médiane des
**différences** ; la dérive s'annule alors d'elle-même.

**Ne jamais conclure sur un maximum.** « La pire tâche » est la
statistique la plus instable qui soit : une interruption du système la
triple, et elle ne bouge pas si dix tâches moyennes apparaissent. On
mesure le **total** et le **nombre**, qui s'additionnent au lieu de se
remplacer.

**Ne jamais conclure sur la pire image non plus.**
`contraste-survol.mjs` déclarait un échec sur un seul relevé à 1,00:1.
Mesure de contrôle, horloge étirée ×20 sur 160 échantillons : **zéro**
image sous le seuil. Une image à l'instant où l'arête coupe une lettre
en deux n'est pas une fenêtre illisible, c'est le plancher de
perception. On mesure donc le **nombre** d'images fautives et leur
**durée cumulée**, et le seuil de verdict est une image à 60 Hz, soit
16,7 ms. La référence primée qu'on compare tombe, elle, à 1,03:1
pendant **117 ms**. La différence n'est pas de degré.

**Ne jamais conclure sur une planche de captures dont le plancher de
bruit n'a pas été mesuré.** Voir `PIEGES.md` § 29.

Toute mesure de performance doit être reprise **machine au repos**, et
une mesure de « régression » n'a de sens qu'en **A/B sur la même
machine**. Les chiffres d'une phase antérieure ne sont pas une
référence : la phase 6 annonçait 112 ms de LCP, le même code mesuré en
phase 7 en donnait 196.

<a id="scrub"></a>
## 2 · LA RÈGLE DU SCRUB

Une animation `scrub` **n'a pas d'état de repos** : elle a l'état où le
visiteur s'est arrêté. Chaque position de défilement est donc un état
**permanent** possible.

> **Il est interdit de scrubber l'opacité — ou toute propriété qui
> touche à la lisibilité — d'un élément qui porte du texte.**

Mesure du 2026-07-26 : les mots des chapôs, scrubbés, restaient à 0,39
d'opacité (~1,5:1) avec le paragraphe à 64 % de la hauteur d'écran. La
référence primée `fullstack-studio` commet exactement cette faute,
mesurée à 0,15 d'opacité sur un paragraphe entièrement lisible
(`archives/rapports/RECHERCHE-ACCUEIL.md`). Le scrub reste permis sur ce
qui ne peut rendre aucun texte illisible — un `translateY` borné, une
`scaleX` de filet.

<a id="outils"></a>
## 3 · LES OUTILS

`node tools/serve.mjs 8099` d'abord. Les outils prennent une **adresse
complète**, pas un numéro de port.

### Non-régression de structure

| Outil | Ce qu'il rend |
|---|---|
| `code-nu.mjs --comparer a b` | le code **privé de tous ses commentaires**, espaces normalisés. Deux fichiers identiques après cette réduction ont exactement le même comportement. C'est l'invariant du chantier de structure |
| `cascade-check.mjs` | **0 écart** obligatoire après toute régénération du CSS. Compare 44 propriétés calculées sur tous les éléments, feuille découpée contre feuille entière |
| `captures-fixe.mjs <nom> [adresse]` | planche **déterministe** : 5 largeurs × 2 thèmes × **11** vues + page entière, en mouvement réduit et `content-visibility` levé. **Plancher de bruit : 4 images sur 130**, toutes à 768 px — les 126 autres rendent 0,0000 %. ⚠ **En mouvement réduit, `html.sas-ok` n'est jamais posée : cet outil ne peut structurellement pas voir un défaut de sas** (piège 84). Pour ça, `plaques.mjs` |
| `plaques.mjs <ancre[,ancre…]> <nom> [--reduit] [--base=URL]` | **2026-08-03.** Planches d'une ou plusieurs sections, 5 largeurs × 2 thèmes, **en mouvement PLEIN par défaut**, et le **RELIEF** (écart-type de luminance) de chaque image. Un aplat noir rend ~0 : c'est le relief qui dit si quelque chose est peint, pas l'existence du fichier. Écrit parce que 110 planches en mouvement réduit avaient déclaré saine une section entièrement noire |
| `sas-sequence.mjs [nom] [--n=N] [--zone=a,b] [--base=URL]` | **2026-08-03.** La séquence du sas de descente : relief de chaque image **et écart de pixels entre deux consécutives** — ce qu'exige la règle B, et ce que dix images ne prouvent pas à elles seules (piège 54) |
| `captures-comparer.mjs --avant A1,A2,A3 --apres B1,B2,B3` | **la seule forme qui rende un verdict.** Déclare BRUIT toute image qui bouge *à l'intérieur* d'un groupe, puis ne conclut que sur le reste. **Trois passes de chaque côté** : avec deux, le calculateur n'avait pas flanché et ressortait en faux positif |
| `commentaires.mjs` | outil de fabrication, exécuté une fois : déplace les blocs de commentaire de 4 lignes ou plus vers `decisions/` |

### L'accueil et les sections

| Outil | Ce qu'il rend |
|---|---|
| `accueil-check.mjs [mode]` | huit relevés : `contenu` · `entree` (les onze pas, **avec le % réellement visible**) · `boutons` · `plaques` · `derive` · `tenue` (i/s, LCP, CLS) · `cadre` (débordement à 11 largeurs, console) · **`sequences`** (six suites de captures + écarts de pixels + cinq rechargements) |
| `svc-defile.mjs [adresse] [largeur] [thème]` | la section 02 en sept relevés : géométrie · dix captures d'un cadre fixe + écarts + index actif + `aria-current` + jauge + `scrollLeft` · dix rechargements sur `#services` et dix arrivées par `#svc-03` · clavier · sans script · i/s |
| `ba-check.mjs [adresse] [largeur] [thème]` | les trois avant / après en huit relevés : existe · **le cran sans JavaScript** · le passage filmé · clavier · la vue non choisie hors d'atteinte · **les 5 interdits relevés sur tout le document** · le texte défilant · débordement à 8 largeurs |
| `socle-captures.mjs` | l'accueil **avec et sans** la ligne de compensation, les deux états dans la **même passe** |
| `formulaires-e2e.mjs` | la chaîne des six formulaires de bout en bout : l'état réel du service d'envoi, le repli `mailto:` par formulaire, les deux guides obtenus **sans donner de courriel** |
| `entree-check.mjs` | les huit garanties de la séquence d'entrée, dont l'allongement, prouvé en **coupant la promesse des polices** |
| `diag-accueil.mjs` · `diag-accueil2.mjs` | rideau et composition sur la même ligne de temps, verrou de session, boutons par palier |

### Identité, contraste, débordement

| Outil | Ce qu'il rend |
|---|---|
| `theme-check.mjs` | parité clair/sombre, contrastes, débordement, **11** sections × 2 thèmes × 5 largeurs. **Ses captures ne sont pas déterministes** — voir `PIEGES.md` § 29 |
| `deborde.mjs` | contenu **coupé** par un `overflow`, à 9 largeurs |
| `prix-check.mjs` | tout montant en dollars, source **et** texte rendu. Depuis D-773 il **décode les entités** (`5&nbsp;000&nbsp;$` lui était invisible), **marche dans les nœuds de texte** au lieu de lire `innerText` (qui rend vide sous `content-visibility` hors écran — il comptait **2** montants sur toute la page), **ouvre les tiroirs**, et cherche les **phrases** du barème, pas les nombres nus |
| `prime-check.mjs` | la grille des primes de référence : la page dit exactement la grille déclarée · aucun taux effectif au-dessus de **7 %** au plancher de son type · aucune marche au-dessus de **2,5×** entre deux lignes · aucune prime qui puisse se lire comme le prix de son propre projet · rien de tout ça lisible **sans ouvrir le panneau**. Les fourchettes de prix vivent dans l'outil, jamais dans la page |
| `conditions.mjs` | `ecrire` \| `verifier` — les deux copies du texte des conditions sont **générées** depuis `conditions/reference-<version>.md` et identiques au signe près ; la version affichée, celle du champ caché, celle du libellé de la case et celle de `CONDITIONS_VERSIONS` s'accordent ; aucune archive n'a disparu de la liste acceptée |
| `acceptation-check.mjs` | la preuve d'acceptation côté serveur, sur le banc : refus sans case · « non » ≠ « oui » · version inventée refusée · **heure du serveur**, jamais celle qu'on lui donne · les trois colonnes **figées** une fois écrites · l'étape intermédiaire passe quand même · le honeypot |
| `retro-estim.mjs` | la grille de prix : calibration contre **quatre vrais projets** (la valeur réelle doit tomber dans la fourchette ET dans sa moitié basse) · les sept ancrages du brief · **monotonie** — ajouter une fonction ne fait jamais baisser le total · **compression** — combien de projets rendent le même écran · **une option à la fois** — la bascule est-elle lisible · **le solveur** par moindres carrés à 10, 30, 100, 400 et 2 000 sondages · les deux portes ne se contredisent pas de plus d’un cran · les libellés d’`index.html` et ceux de la grille concordent **dans les deux sens** · aucun montant de la grille dans un fichier servi |
| `estimateur-check.mjs` | l’estimateur parcouru au navigateur contre le vrai `Code.gs` : les cinq chemins arrivent au bout · le compte « X sur N » dit vrai à chaque écran · les questions sans objet ne se posent jamais · changer de type n’emporte pas une réponse morte · le « non » ouvre une porte, et une seule fois · les trois sans prix ne montrent AUCUN chiffre · une seule ligne au classeur par personne · la réouverture n’affiche rien du visiteur précédent · 44 px sur téléphone · 0 erreur console |
| `estimateur-attaque.mjs` | ce que l’estimateur doit refuser : seize familles de **requêtes forgées** — montant fabriqué, libellé d’un autre type, clé de la chaîne de prototypes, fonction répétée, injection de formule Sheets vérifiée par `getFormulas()`, honeypot, `_sid` malformé, débit, envois simultanés — dix passes au **navigateur** — double-clic, `required` retiré, 44 px en largeur ET hauteur sur 14 écrans, débordement 320/390, traversée clavier, mouvement réduit — et cinq passes de **désarmement** qui prouvent que chaque garde retire des cas quand on l’enlève |
| `estimateur-vue.mjs` | ne juge RIEN. 134 captures des cinq chemins, deux largeurs, deux thèmes. C’est la planche qu’on OUVRE — une sonde du DOM ne voit pas un bouton qui est LOIN |
| `reference-vue.mjs` | la planche du programme : section fermée, panneau ouvert, les sept écrans du formulaire, le tiroir des conditions, le refus sans case — en 1440×900 et 390×844. **Captures de fenêtre, pas d'élément** : une capture d'élément peint une barre `sticky` à sa position collée et invente un recouvrement qui n'existe pas |
| `contraste-arret.mjs` | contraste **à l'arrêt**, à N positions de défilement |
| `contraste-survol.mjs` | contraste **pendant** une transition, image par image, aller ET retour |
| `palier-check.mjs` | les trois paliers par leur déclencheur réel, palier 2 en **bridant le processeur** (×6 par défaut, `ADEXWEB_BRIDE` pour changer). Rend **NON MESURÉ**, jamais « échec », quand la machine est trop chargée |

### Le mouvement

| Outil | Ce qu'il rend |
|---|---|
| `langue-check.mjs` · `etats-check.mjs` | les quatre verbes dans le document rendu · les onze micro-états |
| `frontieres-check.mjs` · `trame-check.mjs` | les douze frontières · les voiles de passage |
| `traversee-check.mjs` · `tache-traversee.mjs` | planche de 24 vues + i/s · temps en tâche longue, en **différences appariées** |
| `secteur-morph-check.mjs` · `cls-source.mjs` | recomposition nette au pixel · attribution de chaque décalage |
| `_png.mjs` | décodeur PNG + `diffStats` — le socle du critère « visible » |

### Le reste

| Outil | Ce qu'il rend |
|---|---|
| `ab-accueil.mjs` · `ab-phase8.mjs` | A/B contre une copie de la version d'avant sur un second port, **passes alternées** |
| `verif.mjs` · `audit.mjs` · `perf-probe.mjs` | clavier, orientation, LCP, contrastes |
| `refs-*.mjs` | mesurent les références dans un vrai navigateur |
| `pdf.mjs` · `couvertures.mjs` | les deux documents et leurs couvertures |
| `cadeau-check.mjs` · `cadeau-scene.mjs` · `cadeau-e2e.mjs` | déclenchement et contenu · l'entrée est une arête · le parcours complet |
| `ab-structure.mjs <avant> <apres> [n]` | A/B **apparié** de LCP, CLS et poids du chemin critique : n passes alternées, médiane des **différences** |
| `plages.mjs [verifier\|ecrire]` | les plages de lignes des **12** entrées — onze sections plus le pied —, **générées** depuis le code. `verifier` sort 1 si `SECTIONS.md` a dérivé |

### Le service des formulaires et la réservation

Ces cinq-là ne mesurent pas une peinture : ils mesurent ce que
`google/Code.gs` fait d'une soumission. `faux-google.mjs` **exécute**
le vrai fichier sous Node avec des services Google en mémoire — ce
n'est pas une réimplémentation, c'est la même fonction, ligne pour
ligne, que celle qui répondra en production.

**Ce qu'aucun des cinq ne prouve :** qu'un vrai Sheet accepte les
appels, qu'un lien Meet se crée, qu'un courriel arrive, que les
autorisations OAuth passent. `RESERVES.md § chantier de la
réservation`.

| Outil | Ce qu'il rend | Attendu |
|---|---|---|
| `faux-google.mjs [8098]` | le vrai `Code.gs` servi en HTTP, plus `/_etat`, `/_evenement` et `/_vider-calendrier` pour poser des cas | — |
| `formulaires-prod.mjs 8099 8098` | les huit flux d'envoi, dans un vrai navigateur, jusqu'au classeur et aux courriels | `8 / 8`, `erreurs console : 0` |
| `creneaux-check.mjs` | le **calcul** des créneaux : journée entière, événement partiel, réservation fraîche, double réservation, plage forgée, « Disponible », invitation refusée, fuseau et ses deux bascules, pauses, les deux portes | `41 / 41` |
| `creneaux-vue.mjs 8099 8098` | ce que l'**écran** en montre, plus quatre captures dans `tools/_creneaux/` | `17 / 17` |
| `verrou-env.mjs` | les sept points avant mise en production : `.env.local`, adresse `/exec`, rien de suivi par git, fichier fabriqué à jour, ordre de chargement, service qui répond | `les sept tiennent` |

> **`creneaux-check` a été éprouvé par mutation le 2026-08-06** —
> trois défauts posés à la main dans `Code.gs`, trois échecs
> distincts : retirer le traitement des journées entières fait tomber
> 4 cas, retirer le contrôle de grille en fait tomber 2, écrire le
> décalage horaire en dur (`-300`) en fait tomber 6. L'outil mord.
> C'est la seule façon de savoir qu'un `41 / 41` veut dire quelque
> chose (piège 17).

Quatre outils sont partis dans `archives/outils-perimes/` le 2026-07-30 :
`services-check.mjs`, `projets-check.mjs`, `plaques-vie.mjs`,
`plaques-debord.mjs`. **Aucune de leurs cibles n'existait plus** — ils
passaient au vert sur du vide, c'est-à-dire le piège 17.
Les modes `plaques` et `derive` d'`accueil-check.mjs` ont été traités
autrement : ils **disent** qu'ils n'ont plus de cible au lieu de rendre
un rapport vide, et redeviennent la preuve si le bloc revient.

<a id="chiffres"></a>
## 4 · CHIFFRES DE RÉFÉRENCE

### Accueil `#top`, 1440 × 900, thème clair — 2026-07-29

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
| texte sous 4,5:1 à l'arrêt, 61 positions | **0** (était 8) | 0 |
| fenêtre illisible au survol, aller et retour | **aucune** | aucune |
| formulaires qui livrent | **6 / 6**, par le repli `mailto:` | 6 / 6 |
| échecs de contraste, 12 sections × 2 thèmes × 5 largeurs *(relevé du 2026-07-29 ; le site en compte 11 depuis le 2026-08-03)* | **0** | 0 |
| arrêts au clavier sans anneau de focus | **0 sur 100** | 0 |

### Section 02 · Services, seconde refonte du 2026-07-30
`node tools/svc-defile.mjs http://127.0.0.1:8099 1440 clair`

| Mesure | Valeur | Seuil |
|---|---|---|
| section entière | 2 478 px = **2,75 écrans** à 1440×900 | — |
| écart de pixels entre deux captures, 10 étapes | **2,89 à 8,34 %** | > 1 % |
| rechargement sur `#services`, saut de scène, 10 fois | **0 px, 10 / 10** | 0 |
| arrivée par `#svc-03`, chantier visé atteint | **10 / 10**, saut **0 px** | 10 / 10 |
| `scrollLeft` de la vitre, à chaque relevé | **0** | 0 |
| **sans JavaScript** : chantiers visibles · scènes collantes | **4 · 0** | 4 · 0 |
| i/s médiane · images > 20 ms | **59,9** · 1 / 629 | 60 · 0 |
| erreurs console | **aucune** | 0 |

### Section 03 · Avant / après — `node tools/ba-check.mjs`

| Mesure | Valeur | Seuil |
|---|---|---|
| images dans la section | **0** — tout est en markup | 0 |
| mots de fausse preuve dans le texte rendu | **aucun** | aucun |
| le cran bascule sans JavaScript | **oui** (bloc `<noscript>` du `<head>`) | oui |
| éléments focusables dans la vue non choisie | **0** | 0 |
| coins arrondis · ombres · dégradés · filtres **hors** maquette | **0 · 0 · 0 · 0** | 0 |
| les mêmes **dans** la maquette | 17 · 2 · 30 · 2 | > 0 |
| débordement du document, 320 → 1920 px | **0 px** à 8 largeurs | 0 |

### Toute la page, après les trois chantiers du 2026-07-30

| Mesure | Valeur | Seuil |
|---|---|---|
| échecs de contraste, 5 largeurs × 2 thèmes | **0** | 0 |
| débordement horizontal, 5 largeurs × 2 thèmes | **aucun** | aucun |
| écart de cascade, découpée vs entière | **0** sur 259 600 propriétés | 0 |
| i/s médiane, traversée complète · images > 20 ms | **60** · **0 / 755** | 60 · 0 |
| erreurs console | **0** | 0 |

### Section 02, PREMIÈRE refonte du 2026-07-30
Conservé : c'est la ligne de base contre laquelle la seconde se juge.

| Mesure | Avant | Après |
|---|---|---|
| chantiers lisibles **sans un clic** | **1 / 4** | **4 / 4** |
| saut de la scène à l'arrivée par ancre | **275 à 280 px** | **0 px** |
| écart du `start` du pin selon le chemin d'arrivée | **284 px**, 10 / 10 | plus de pin |
| contenu de maquette coupé, 9 largeurs × 2 états | 84 à 93 px | **0** |
| débordement horizontal, 11 largeurs, toutes fiches ouvertes | — | **aucun** |
| LCP · CLS | — | **104 · 104 · 116 ms** · **0** |
| animations prouvées visibles (≥ 5 captures + écarts) | — | **4 / 4** — entrée 4,1-8,4 % · survol 0,9-3,5 % · ouverture 10,2-25,4 % · fermeture 9,5-18,7 % |

### Chantier de structure du 2026-07-30

**Non-régression — les trois preuves, de la plus forte à la plus faible.**

| Preuve | Résultat |
|---|---|
| **code nu** — les 15 fichiers privés de tous leurs commentaires, espaces normalisés | **IDENTIQUE 15 / 15**. C'est une équivalence, pas un échantillon |
| **cascade** — 44 propriétés calculées sur 2 950 éléments × 2 thèmes | **0 écart sur 259 600** |
| **pixels** — planche déterministe, 5 largeurs × 2 thèmes × 13 vues | **0 différence sur les 126 images stables**. Les 4 autres bougent aussi entre deux passes du **même** code — plancher de bruit mesuré sur **6 paires**, trois passes de chaque côté |

**Performance, en A/B apparié** (`node tools/ab-structure.mjs`,
7 passes alternées, avant sur un second port) :

| Mesure | Avant | Après |
|---|---|---|
| LCP, médiane | 128 ms | 128 ms |
| **LCP, médiane des différences** | — | **−8 ms** (étendue −100 à +28 : le bruit domine, donc **aucun écart mesurable**) |
| élément LCP | `SPAN.plate-big` | `SPAN.plate-big` |
| CLS | 0 | 0 |
| **chemin critique transféré** | 344,1 Ko | **230,9 Ko** (**−32,9 %**) |
| i/s médiane · images > 20 ms | — | **59,9** · **0** |
| erreurs console | 0 | 0 |

Le seul chiffre de performance sans variance est le poids du chemin
critique : `critique.css` passe de 89,5 à 46,4 Ko parce que 424 Ko de
prose ont quitté `app.css`, et `css-critique.mjs` ne les recopie plus.

**Volume.**

| | Avant | Après |
|---|---:|---:|
| commentaires dans la source | 423 961 o (**45,4 %**) | 88 389 o (**14,8 %**) |
| lignes vivant dans un bloc de plus de 3 lignes | 6 318 | **0** |
| source totale | 934 544 o | 598 972 o (**−35,9 %**) |
| `CLAUDE.md` | 66 141 o · 1 114 l. | **12 320 o · 209 l.** (**−81 %**) |

<a id="perception"></a>
## 5 · SEUILS DE PERCEPTION

Issus de `archives/rapports/RECHERCHE-ACCUEIL.md`.

- décalage entre deux éléments : **40 ms** pour que l'ordre devienne
  conscient ; plancher absolu **16,7 ms** = une image à 60 Hz ;
- une révélation de titre ne se mesure pas en pixels de déplacement
  mais en **recouvrement** : la référence balaye **100 % de la largeur
  de la ligne** avec **0 px** de translation verticale ;
- inversion de CTA : **≈ 200 ms** aller et retour, texte basculé **en
  une image** — mais la référence bascule **trop tôt** et tombe à
  1,03:1 pendant 117 ms ; on bascule à mi-course ;
- alignement : **24-32 px** latéraux, **520 ms**, dépassement
  **0,00 px**.

### Les outils du chantier Services et Réalisations (2026-07-31)

| Outil | Ce qu'il refuse de laisser passer |
|---|---|
| `svc-course.mjs` | un écran vide à l'entrée du rail, une course qui s'arrête avant la fin, un mouvement invisible entre deux pas |
| `svc-fiches.mjs` | un panneau qui déborde du viewport, un contenu plus haut que sa boîte sans défilement, la page qui défile derrière, Échap qui ne ferme pas, le focus qui ne revient pas |
| `ba-check.mjs` | un curseur qui ne bouge rien, un clavier muet, une boucle qui ne se voit pas ou qui ne s'arrête pas, une poignée inerte sans script |

Les trois prennent un **port**, pas une adresse.

### Le chantier des sas (2026-07-31)

| Outil | Ce qu'il rend |
|---|---|
| `sas-check.mjs [adresse]` | activation et géométrie des trois pistes · le verbe absorbé · séquence de 11 captures par sas avec écart de pixels consécutifs · hauteurs réelles des sections c-v **mesurées à l'écran** (piège 34) · arrivée par ancre après la re-visée (attendre 2,2 s — mesurer avant, c'est mesurer le navigateur) · erreurs console |

> **Ces chiffres-là ont été relevés en mouvement réduit**, le mode où
> `html.sas-ok` n'est jamais posée — donc le mode où les sas n'ont pas
> de géométrie (**piège 84**). Ils restent vrais pour ce qu'ils
> mesurent ; ils ne disent **rien** de ce qui est peint. Le défaut du
> volet de la remontée (D-629) leur a survécu trois jours. Pour juger
> une peinture derrière un sas : `plaques.mjs` et `sas-sequence.mjs`,
> tous deux en mouvement plein.

### Chiffres de référence — refonte immersive, 2026-07-31, 1440×900 clair

| Mesure | Valeur | Seuil |
|---|---|---|
| LCP (`SPAN.plate-big`) | **192 ms** (avant : 184 — même passe non appariée, le bruit domine) | < 300 ms |
| CLS | **0** | 0 |
| i/s médiane, traversée complète avec les trois sas · images > 20 ms | **60** · **0 / 763** | 60 · 0 |
| écart de cascade | **0** sur 354 112 propriétés | 0 |
| séquence du sas descente, 10 pas | **0,13 à 45,5 %** d'écart entre captures | > 1 % |
| séquence de la remontée | **1,9 à 47,7 %** | > 1 % |
| séquence de la clôture | **1,7 à 22 %** | > 1 % |
| ancres `#visite` · `#calculateur` · `#contact`, chargement à froid | **88 px pile** (= scroll-padding), stables dès 600 ms | 88 px |
| erreurs console | **0** | 0 |

Témoin d'avant chantier (copie datée, port 8098) : `#visite` atterrissait
à **2 474 px** de sa cible — le défaut d'ancre était antérieur.

**A/B apparié contre le témoin d'avant chantier** (`ab-structure.mjs`,
7 passes alternées, témoin = copie datée sur le port 8098) :

| Mesure | Avant | Après |
|---|---|---|
| LCP, médiane | 144 ms | 152 ms |
| **LCP, médiane des différences** | — | **+8 ms** (étendue −24 à +20 : le bruit domine, aucun écart concluant) |
| élément LCP | `SPAN.plate-big` | `SPAN.plate-big` |
| CLS max | 0 | 0 |
| chemin critique transféré | 292,3 Ko | 300,8 Ko (**+2,9 %** — les règles critiques des sas et le script du HEAD) |

---

## RELEVÉS DU 2026-07-31 · MISE EN PRODUCTION

`node tools/serve.mjs 8099` d'abord. **Tous les outils cités ici
acceptent un port OU une adresse complète** — `tools/_adresse.mjs`
normalise les deux. Trois outils mouraient auparavant sur
`Cannot navigate to invalid URL` selon la forme employée.

### Les quatre outils de preuve, un par chantier

| Outil | Ce qu'il rend | Verdict au 2026-07-31 |
|---|---|---|
| `forge-check.mjs` | fond du volet dans les deux thèmes · 13 images sur la piste dont 7 dans la fenêtre de forge, avec l'écart entre consécutives · i/s pendant le sas SEUL · **saccade mesurée à la molette** | 8 / 8 |
| `services-check.mjs` | les six positions de repos avec haut, filet, bas, largeur et repos · séquence de 13 images · molette | 9 / 9 |
| `panneaux-check.mjs` | les cinq panneaux ouverts · les deux renvois exercés **dix fois chacun** | 7 / 7 |
| `realisations-check.mjs` | **un vrai glissement** de souris et de doigt · trois positions par comparaison · les huit pages en hauteur réelle · placeholders comptés séparément avant / après | 10 / 10 |
| `production-check.mjs` | tous les liens · tous les boutons (**cliqués** quand aucun écouteur n'est détecté) · mots de remplissage · images · PDF · requêtes tierces · console | 8 / 8 |

### La saccade, et comment elle se mesure

**Un défilement lisse de synthèse ne peut PAS la voir** : il fabrique
lui-même la continuité qu'on cherche à vérifier. On envoie une rafale
de molette — 22 crans de 100 px toutes les 50 ms — et on relève
l'avancée IMAGE PAR IMAGE.

| Mesure, thème clair | `scrub: true` | `scrub: 0.45` |
|---|---|---|
| images figées pendant la rafale | **26 / 71** | **0 / 68** |
| plus grand bond entre deux images | **44,5 px** | **23,6 px** |

Le nombre de grains n'a jamais été en cause : **60 i/s dès le premier
relevé**, 0 image au-dessus de 20 ms.

### Le socle de performance, après les quatre chantiers

| Mesure | Seuil | Relevé |
|---|---|---|
| LCP (`SPAN.plate-big`, 1440×900) | < 300 ms | **208 ms** |
| CLS | 0 | **0** |
| i/s médiane, traversée complète | 60 | **60** · 0 / 774 images > 20 ms |
| i/s pendant le sas seul | 60 | **59,9** · 0 / 155 > 20 ms |
| échecs de contraste, 5 largeurs × 2 thèmes | 0 | **0** |
| contraste à l'arrêt, 41 positions | 0 | **0** |
| débordement horizontal, 320 → 1920 | aucun | **aucun** |
| contenu coupé par un `overflow` | aucun | **aucun** |
| erreurs console | 0 | **0** |
| écart de cascade | 0 | **0** sur 323 576 propriétés |
| requêtes tierces | 0 | **0** |
| liens morts / boutons muets | 0 | **0 / 66** · **0 / 97** |
| formulaires qui livrent par le repli | 6 | **6 / 6** |
| montants « À RETIRER » dans le source | 0 | **0** |

Poids ajouté par les quatre captures des « après » : **309 Ko**,
différées, hors du chemin critique. `critique.css` : 53 Ko.

### Ce qui a été trouvé par la mesure, et n'aurait pas été trouvé autrement

- le balayage du volet jouait **hors écran** — vu à l'image, pas au code ;
- la poignée avant/après ne glissait pas, et le test la déclarait bonne ;
- le calendrier de réservation n'offrait **aucune date** un 31 du mois ;
- l'animation permanente **repartait** au palier 2 ;
- un dessin rendait en noir plein faute de règle CSS applicable.

## LES DOUZE PREMIERS ÉCRANS — 2026-08-01

### Les outils de cette chaîne

| Outil | Ce qu'il rend | Ce qu'il REFUSE de rendre |
|---|---|---|
| `refs-releve.mjs <url> <clé> 1440` | le premier écran d'une référence + `releve.json` : polices, `h1` px et interlignage, fonds, bibliothèques | rien — mais **un `h1` mesuré à 9 px est un titre de référencement masqué**, pas le titre visible. Le chiffre seul fait écrire n'importe quoi ; ouvrir le PNG |
| `ecrans-secteurs.mjs [clé…]` | `images/realisations/ecran-<clé>.webp`, 1440 × 900, densité 2 | une capture plate (médiane des 8 bandes < 6, **ou** 3 bandes plates de suite) · un port illisible · une image jamais chargée |
| `demos-controle.mjs <clé>` | prix, notes, débordement à 6 largeurs, requêtes tierces, erreurs console, % de texte sans JS | — |
| `pire-pixel.mjs <clé> <sél…>` | **le contraste sous l'encre PEINTE**, deux captures avec et sans texte, densité 2, on ne garde que les pixels à 85 % de couverture | un texte que `demos-contraste.mjs` déclare « ok » parce qu'il s'arrête à la première surface opaque : l'auberge passait à 5,67 avec trois blocs réellement sous 4,5 |
| `planche-secteurs-12.mjs [480]` | la planche des douze, même échelle, une seule passe | une planche dont une image n'a pas chargé · **et elle DIT ce qui manque** au lieu de rendre neuf cases pour douze |
| `secteurs-markup.mjs [clé…]` | l'aperçu du panneau | une découpe qui change le nombre de `<section>` ou de `.mock` |

### La géométrie du panneau, relevée

Le cadre d'aperçu, à chaque largeur de fenêtre (`#mockStage`) :

| Fenêtre | Scène | Échelle de la capture 1440 |
|---:|---:|---:|
| 1920 | 621 px | **0,431** |
| 1600 | 487 px | 0,338 |
| **1440** | **421 px** | **0,292** |
| 1280 | 360 px | 0,250 |
| 1024 | 386 px | 0,268 |
| 900 | 837 px | 0,581 |
| 600 | 557 px | 0,387 |
| 390 | 348 px | 0,242 |

**Ce que ça veut dire pour la lisibilité.** À 1440, un texte courant de
15 px rend **4,4 px** dans le cadre. C'est illisible, et c'est la
commande : on ne lit pas un moniteur posé à trois mètres, on en
reconnaît la forme. Le titre du héros, lui, passe de 90–160 px à
26–47 px — assez pour se lire.

**Ce qui rendait l'effet de loupe.** Les tuiles étaient photographiées
à **760 px** de large, donc dans la mise en page tablette, puis
affichées à 421 px : facteur 0,55 sur une composition déjà tassée. Le
correctif n'est pas de réduire l'image, c'est de **photographier
large**.

### Les trois faux verdicts de ce chantier

Détail : `PIEGES.md § 53, 54, 55`.

1. **Une seule bande plate n'est pas une capture plate** — le capot
   noir d'une voiture a fait refuser un premier écran excellent. Un
   seuil posé sur le **minimum** d'un échantillon mesure le cas
   particulier ; on juge sur la médiane.
2. **Geler les animations gèle aussi le préchargeur** — « 89 % » n'est
   pas un premier écran.
3. **Un dépôt voisin peut être en chantier pendant qu'on le
   photographie** — un `Module not found` sur un fichier qui existe.

## RELEVÉS DU 2026-08-06 · VALIDATION AVANT PRODUCTION

Tout ce qui suit vient du **vrai déploiement Apps Script**, pas du
banc. Reproduire : `node tools/prod-sonde.mjs [etat|injection|double|delai|fuseau|tout]`.

### La grille livrée

| | Avant | Après |
|---|---|---|
| jours ouverts | lundi → vendredi | **sept jours sur sept** |
| plage | 9 h → 17 h | **9 h → 20 h** |
| pause du midi | 12 h → 13 h | **aucune** |
| créneaux par jour plein | 9 | **15** |
| par semaine | 45 | **105** |

Un départ toutes les 45 min (30 d'appel + 15 de tampon), le dernier
à 19 h 30 pour finir pile à 20 h.

### Le temps de réaction de l'agenda

| Mesure | Valeur |
|---|---|
| écriture d'une réservation | **5 877 ms** |
| avant que la plage quitte la porte des créneaux | **dès le 1er appel, 1 797 ms** |

Les 1 797 ms **sont le temps de la requête**, pas un délai d'attente :
le premier appel post-écriture voyait déjà la plage partie.
`creneauxLibres()` relit l'agenda à chaque appel — aucun cache côté
serveur. Côté site, une réponse vaut 45 s et est jetée dès qu'une
réservation est refusée.

### Double réservation, contre le vrai Google

Deux `POST` lancés par le même `Promise.all` sur la **même plage**,
deux demandeurs différents :

| | Réponse | Temps |
|---|---|---|
| A | `success: false` · « Cette plage vient d'être prise. » | 6 011 ms |
| B | `success: true` · ligne 2 | 5 184 ms |

Une seule passe. La plage a disparu de l'affichage (9 → 8).
`LockService` tient contre le vrai service.

### Le fuseau

**48 plages relues, 0 écart** entre l'instant ISO et l'heure
affichée, recalculés indépendamment à `America/Toronto`. Le
changement d'heure du 1er novembre est **hors** de l'horizon de
42 jours : il n'est pas contrôlé ici. `creneaux-check` le couvre sur
six dates nommées.

### Latence et taux d'échec

| Porte | Appels | médiane | p90 | max | HTTP 404 |
|---|---:|---:|---:|---:|---:|
| témoin de vie | 60 | 773 ms | 1 132 ms | 1 666 ms | **0** |
| créneaux | ~15 | ~1 800 ms | ~2 100 ms | 2 086 ms | 0 |

À comparer au 2026-08-05 : 2 HTTP 404 sur 36, et un pic à 29 893 ms
sur la porte des créneaux. **Le défaut est intermittent** — une
journée propre ne prouve pas qu'il a disparu.

### Les cibles tactiles

`node tools/pouce-check.mjs 8099` — 18 / 18.

| largeur | panneau | case de jour | plage | forme |
|---|---|---|---|---|
| 320 px | 288 px | **254 × 48** | 123 × 44 | liste |
| 360 px | 328 px | **294 × 48** | 143 × 44 | liste |
| 390 px | 358 px | 45 × 44 | 158 × 44 | grille |

**Le seuil de bascule est mesuré, pas calculé.** L'arithmétique
donnait 348 px ; elle oubliait le remplissage propre du panneau. La
grille ne tient les 44 px qu'à partir de **378 px** de fenêtre — d'où
la bascule à 24 rem (384 px).


### RELEVÉS DU 2026-08-07 · LE PROGRAMME DE RÉFÉRENCE (D-773)

**Les seuils, après le chantier** — `node tools/verif.mjs 8099`, deux
passes, machine de bureau Windows :

| Mesure | Seuil | Relevé |
|---|---|---|
| LCP | < 300 ms | **132** puis **176 ms** |
| CLS | 0 | **0** |
| i/s, moyenne · p95 · pire | 60 · — · — | **60 · 60 · 60** |
| INP au clic | — | 86 puis **97 ms** |
| Requêtes tierces | 0 | **0** |
| Arrêts au clavier sans anneau | 0 | **0 sur 104** |
| Contraste, 5 largeurs × 2 thèmes | 0 échec | **0 sur 812 éléments** (light 1920) |
| Débordement horizontal, 320 → 1920 | aucun | **aucun** |
| Écart de cascade, découpée vs entière | 0 | **0 sur 332 464** |

> **UN RELEVÉ DE 304 ms A ÉTÉ ÉCARTÉ**, et il faut le dire. Il vient
> de `cas-tordus-check` lancé pendant que deux serveurs et deux agents
> tournaient. La règle 1 de ce fichier s'applique : une mesure de
> performance se reprend **machine au repos**, et les deux reprises
> donnent 132 et 176 ms.

**Les cibles tactiles, mesurées et pas déduites du CSS** —
`getBoundingClientRect` à 360, 390 et 1440 px, sur les cinq modales :

| Bouton | Avant | Après |
|---|---|---|
| `.btn-icon` de `modal-refer` | **20,2 × 44** à 390 px | 44 × 44 |
| `.btn-icon` de `modal-urgent` | 25,7 × 44 | 44 × 44 |
| `.btn-icon` de `modal-estimate` | 33 × 44 | 44 × 44 |
| `.btn-icon` de `modal-project` | 42,5 × 44 | 44 × 44 |
| `.btn-icon` de `modal-booking` | 44 × 44 | 44 × 44 |

Le contrôle de `cas-tordus-check` ne regardait **que la hauteur**, qui
valait 44 partout : il passait depuis toujours sur un bouton de 20 px.

**Le taux effectif de la grille des primes** — `node
tools/prime-check.mjs`, au **plancher** de chaque type, qui est le
point le plus cher :

| Prime | % plancher | % typique | % sommet |
|---:|---:|---:|---:|
| 150 $ | 6,0 | 3,8 | 2,5 |
| 250 $ | 6,3 | 4,2 | 2,5 |
| 400 $ | 6,7 | 4,4 | 2,7 |
| 600 $ | 6,7 | 5,0 | 3,0 |
| 1 200 $ | 6,7 | 4,0 | 2,7 |
| 2 500 $ | 6,3 | 4,5 | 3,1 |
| 5 000 $ | 6,3 | 4,2 | — |

**Maximum de toute la grille : 6,7 %.** Rapports entre lignes
voisines : ×1,7 · ×1,6 · ×1,5 · ×2,0 · ×2,1 · ×2,0.

**Les bancs** : `prime-check` 34/34 · `acceptation-check` 42/42 ·
`reference-attaque` 158/158 (dont trois désarmements qui font bien
tomber ce qu'ils doivent) · `relance-check` 47/47 ·
`retenue-check` 39/39 · `cas-tordus-check` 34/34 ·
`conditionnelles-check` 27/27 · `suggestions-check` 59/59 ·
`formulaires-prod` **7/8** — le huitième, l'estimation, échouait déjà
sur le commit d'avant, vérifié en worktree.
