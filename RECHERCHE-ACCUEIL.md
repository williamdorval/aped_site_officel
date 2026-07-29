# RECHERCHE ACCUEIL — deux références mesurées, l'état de l'art croisé

Relevé du 2026-07-29. Chromium via Playwright local, 1440×900 pour la
référence 1, 1280×800 pour la référence 2. Toute valeur ci-dessous est
soit **lue dans la source** du site (vars GSAP, code d'origine), soit
**relevée à 60 Hz dans la page en mouvement**. Quand les deux existent,
les deux sont données : la source dit l'intention, le rendu dit ce que
le visiteur voit.

Outils écrits pour ce relevé — `tools/refs-moteur.mjs`,
`tools/refs-fs-mesure.mjs`, `tools/refs-fs-reveal.mjs`,
`tools/refs-boutons.mjs`, `tools/refs-toggle2.mjs`,
`tools/refs-toggle3.mjs`, `tools/refs-toggle4.mjs`.
Sorties dans `tools/_refs/fullstack/` et `tools/_refs/toggle/`.

---

## 0. Quatre pièges d'instrument, tous ayant produit un faux verdict

Les sondes précédentes (`refs-reveal*.mjs`, `refs-toggle.mjs`) rendaient
« 0 mouvement de texte » et attrapaient un suiveur de curseur au lieu du
bouton. Voici pourquoi, parce que ces quatre-là se reproduiront.

1. **Un ScrollTrigger `once` se TUE après avoir joué.** `ScrollTrigger.getAll()`
   rend 34 déclencheurs au chargement et **26** après une traversée complète
   de la page : les 8 manquants sont exactement les titres. Toute sonde qui
   parcourt la page avant de mesurer photographie la fin du mouvement.
   *Correctif : une page neuve par cible, et on n'approche que celle-là.*

2. **Sur une composition à parallaxe de curseur, la cible fuit sous la
   souris.** La référence 2 déplace toute sa composition de 44,4 px en x et
   49,7 px en y selon la position du curseur. En relevant la boîte au repos
   puis en jetant la souris dessus, on rate la cible : le survol ne prend
   pas. C'est ce qui a fait rendre « 1 nuance » à l'aller et 14 au retour.
   *Correctif : approcher depuis un point proche, laisser la parallaxe se
   poser, relire la boîte, puis entrer.*

3. **Un diff avant/après ne sert à rien quand tout bouge tout le temps.**
   Le filtre « ce qui réagit partout est du bruit » a mangé la totalité des
   réactions, y compris la vraie. *Correctif : un `MutationObserver` sur les
   attributs. Une parallaxe réécrit un `transform` en ligne ; une bascule
   d'état change une **classe**. Les deux se distinguent, un diff de styles
   calculés non.*

4. **Instrumenter GSAP donne la source, pas une interprétation.** En posant
   un accesseur sur `window.gsap` avant le chargement de la page, on
   enveloppe `to / from / fromTo / timeline` et on enregistre les `vars`
   déclarées. C'est comme ça qu'on obtient « duration: 0.7, ease:
   power2.inOut » au lieu de « ~650 ms, courbe en S ».

---

# RÉFÉRENCE 1 — fullstack-studio.webflow.io

**Moteur :** GSAP 3.15.0 + ScrollTrigger + SplitText + ScrambleTextPlugin.
Aucun Lenis, aucun smooth-scroll, **aucune interaction Webflow IX2**
(`[data-w-id]` = 0). Défilement natif. 26 à 34 ScrollTriggers.

## 1.1 La révélation de titre — la structure

Découpe **par LIGNE** (`SplitText type:"lines"`). Ni mot, ni caractère.
Le masque n'est pas un masque : c'est une **plaque opaque posée dessus**.

```
h2[data-text-highlight]                  aria-label = la phrase entière
└ div.text-highlight_line                aria-hidden, display:block
  └ span.text-highlight_text             inline-block, relative
                                         ← se dimensionne au TEXTE, pas à la ligne
    ├ span.text-highlight_inner          relative, z-index 1, opacity 0   ← le texte
    └ span.text-highlight_rect           absolute, 100%×100%, z-index 2,
                                         background-color: currentColor,
                                         clip-path: inset(0% 100% 0% 0%),
                                         pointer-events: none              ← la plaque
```

Timeline, par ligne, **verbatim de la source** :

```js
lineTl
  .to(rect,  { clipPath: "inset(0% 0% 0% 0%)",   duration: 0.7, ease: "power2.inOut" })
  .set(texts[i], { opacity: 1 })
  .to(rect,  { clipPath: "inset(0% 0% 0% 100%)", duration: 0.7, ease: "power2.inOut" });
tl.add(lineTl, i * 0.35);
ScrollTrigger.create({ trigger: el, start: "top bottom", once: true, onEnter: () => tl.play() });
```

Trois temps : **la plaque se déploie de gauche à droite → le texte
s'allume d'un coup dessous → la plaque se retire vers la droite.**
La plaque est en `currentColor`, donc **exactement la couleur du texte
qu'elle va découvrir** — relevé `rgb(235, 235, 235)` des deux côtés.
Le visiteur voit un bloc de matière pleine qui traverse, et le texte
reste là où le bloc est passé.

## 1.2 La révélation de titre — les chiffres

| Grandeur | Déclaré (source) | **Relevé (60 Hz)** |
|---|---|---|
| Découpe | `type: "lines"` | 4 lignes (brands) · 3 (team) · 2 (hero) |
| Aller — la plaque se déploie | 700 ms | **607,8 → 675,3 ms** · 17-19 images |
| Retour — la plaque se retire | 700 ms | **562,0 → 652,9 ms** · 17-24 images |
| Courbe | `power2.inOut` | conforme aux deux étages |
| **Décalage entre lignes** | **350 ms** | **339,5 · 351,1 · 379,8 ms** (moy. **357**) · team : 348,5 · 353,9 (moy. **351**) |
| Opacité du texte | `.set()` = instantané | **0 → 1, 0 image intermédiaire** |
| **Translation verticale** | — | **0,0 px** — rien ne monte, rien ne descend |
| Amplitude du balayage | 100 % de la largeur | brands **188,2 / 711,7 / 751,8 / 814,8 px** · team **230 / 807,5 / 874,6 px** |
| Hauteur de la plaque | 100 % | **57,2 px** (brands) · **62,4 px** (team) |
| Vitesse du balayage | — | **310 → 1 384 px/s**, soit un **rapport 4,0×** entre la ligne courte et la longue |
| Durée totale d'un titre | 3×0,35 + 1,4 = 2,45 s | **2 387 ms** (4 lignes) · **2 030 ms** (3 lignes) |
| Déclenchement | `top bottom`, `once: true` | ne rejoue **jamais** |
| Accessibilité | `aria-label` parent + `aria-hidden` lignes | intact |

**Le chiffre qui compte : l'amplitude n'est pas un déplacement, c'est une
largeur.** Il n'y a aucun `translateY`. L'amplitude, c'est 100 % de la
largeur de la ligne — de 188 à 875 px selon la ligne.

**La conséquence gênante : la durée est constante, donc la vitesse ne
l'est pas.** Une ligne de 188 px et une ligne de 875 px prennent le même
temps, donc la plaque va **4 fois plus vite** sur la longue. À l'œil, la
dernière ligne d'un paragraphe — toujours la plus courte — traîne.

## 1.3 Les autres mouvements de la même référence

| Motif | Déclaré | Relevé |
|---|---|---|
| `data-reveal` (blocs) | `opacity 0→1`, `y: 24px→0`, `duration 0.8`, `power2.out`, start `top 85%` | — |
| `data-reveal-stagger` | décalage **0,1 s** par défaut | — |
| `data-fade-stagger` | décalage **0,06 s**, durée 0,7 s | — |
| **`.button` au survol** | SplitText `chars`, `y: -1.3em`, `duration 0.4`, `power2.out`, `stagger {amount: 0.2}` ; `.button_bg` `scale 0.98` | **déplacement 20,8 px** (= la `line-height` exacte, 16 px × 1,3) · étalement **182,4 ms** à l'aller, **160,8 ms** au retour · **≈16,7 ms par caractère, soit une image à 60 Hz** · fond 1 → 0,98 en 296,5 ms |
| Aller ≠ retour du bouton ? | même config | **non — strictement symétriques**, 0,4 s / `power2.out` dans les deux sens |
| Dérive des fiches `works_card` | `y: 9em→0`, `scale 0.95→1`, `rotationX 14°→0`, `power1.inOut`, `scrub: 1`, `clamp(top bottom)` → `clamp(80% center)` | **144,0 px** de dérive verticale · **0,95 → 1,000** · **14,0° → 0,0°** · course de défilement **1 004 px** |
| Parallaxe du hero | `y: 0→10vh`, `scale 1→0.98`, `scrub: 0.8` | **90 px** à 900 px de hauteur d'écran · course 900 px |
| Arc de vignettes | statique | angles **−48,69° à +47,29°** · `border-radius: 10px` · `box-shadow: none` |

## 1.4 L'anti-modèle, mesuré chez le professionnel

`p.statement_text` : 40 mots (`SplitText type:"words"`), `opacity:
0.15 → 1`, `ease: "none"`, `stagger: 0.5`, **`scrub: 1.5`**, start
`top 80%` → end `bottom 60%`, course 690 px.

Relevé, position de défilement par position de défilement :

| `scrollY` | Haut du paragraphe à l'écran | Mots à opacité intermédiaire | Opacité min |
|---|---|---|---|
| 7 066 | 900 px | **40 / 40** | **0,15** |
| 7 226 | 740 px | **40 / 40** | **0,15** |
| 7 306 | 660 px | **40 / 40** | **0,15** |
| 7 546 | 420 px | 29 / 40 | 0,15 |
| 7 906 | 60 px | 9 / 40 | 0,15 |
| 8 226 | −260 px | 1 / 40 | 0,62 |

**Le paragraphe est entièrement visible à l'écran, et ses quarante mots
sont à 0,15 d'opacité.** Ce n'est pas un instant de transition : c'est un
état de repos possible, celui où le visiteur s'arrête. C'est exactement
la faute que la règle du projet interdit — et elle est ici commise par
une référence primée, dans un fichier qui documente son propre motif en
commentaire.

## 1.5 Séquence d'images

`tools/_refs/fullstack/sequence-revelation/` — **16 vues**, `rev-00` à
`rev-15`. La vue `rev-11` montre les quatre états du motif sur une seule
image : ligne 1 découverte avec la plaque qui sort par la droite, ligne 2
à moitié couverte, ligne 3 entièrement couverte par la plaque pleine,
ligne 4 où la plaque vient d'entrer.
Aussi : `sequence-bouton/` — 10 vues du survol du `.button`.

## CE QU'ON PREND — référence 1

1. **La plaque opaque plutôt que le masque.** Le texte n'est jamais
   déplacé ni fondu : il est **caché sous une plaque de sa propre
   couleur**, puis allumé d'un coup. C'est littéralement `V1 · DÉGAGER`,
   et le fait que la plaque soit en `currentColor` — la matière et la
   forme sont la même chose — est exactement le motif de la limaille.
   C'est aussi le même argument que le chantier 01 du hero : une plaque
   posée dessus n'enlève pas le texte de la mesure du LCP, un `clip-path`
   sur le texte si.

2. **L'allumage du texte en `.set()` : 0 image intermédiaire.** Mesuré,
   pas supposé. C'est `V4 · CRAN` à l'intérieur de `V1 · DÉGAGER`.

3. **Aucune translation verticale. 0,0 px.** La référence la plus aboutie
   des deux n'utilise pas le `translateY` que tout le monde utilise.

4. **La découpe par LIGNE**, avec `aria-label` sur le parent et
   `aria-hidden` sur les fragments. Le moins cher des trois découpages,
   et le seul qui ne fait pas lire un titre lettre par lettre à un
   lecteur d'écran.

5. **16,7 ms par caractère sur le survol du bouton.** Une image à 60 Hz.
   C'est le **plancher physique** d'un décalage par lettre : en dessous,
   deux lettres partent sur la même image et le décalage n'existe pas.
   Cela explique après coup le relevé du chantier 01 : à `--cran: 230ms`,
   « Estimation en 60 secondes » donnait 10,5 ms par lettre — plus court
   qu'une image, donc rigoureusement invisible. `520 ms` donne 22,6 ms,
   soit 1,35 image : au-dessus du plancher. Le choix était juste, on sait
   maintenant pourquoi.

## CE QU'ON JETTE — référence 1

1. **2 387 ms pour un titre de quatre lignes.** C'est 4,8× le seuil où
   NN/g dit qu'une animation « feels like a real drag » (500 ms), et
   presque 5× le plafond total que Carbon impose à un décalage (500 ms).
   Un titre de quatre lignes ne peut pas immobiliser deux secondes et
   demie.

2. **350 ms de décalage entre lignes.** C'est 8,75× le seuil de jugement
   d'ordre temporel conscient (~40 ms). À ce point, ce n'est plus une
   cascade, ce sont quatre animations séparées qui se suivent.

3. **La durée constante à largeur variable** — le rapport 4,0× de vitesse
   entre la première et la dernière ligne. La ligne courte traîne.

4. **`rotationX: 14°`.** C'est de la profondeur en perspective 3D. Le
   projet fait la profondeur au filet de 1 px décalé, jamais par une
   ombre ni par une bascule 3D. Et 14° est 7× l'inclinaison des sept
   plaques de l'accueil (`< 2°`).

5. **Le `scrub` sur l'opacité de 40 mots de texte.** 0,15 d'opacité en
   état de repos. Non.

6. **`border-radius: 10px` partout.** Le projet est à 0.

---

# RÉFÉRENCE 2 — fancy-toggle-753251.framer.app

**Ce que la page est réellement.** Une composition Framer de trois
cartes sur une photo, avec une parallaxe de curseur. Elle contient **un
seul contrôle interactif** : la pastille « View insight ». Il a fallu un
`MutationObserver` pour l'établir — un balayage de survol sur 23 zones
avec diff de styles calculés rendait « 0 réaction propre », parce que la
parallaxe fait bouger toute la page à chaque mouvement de souris.

## 2.1 La structure — trois couches, une seule change

| Prof. | Élément | Boîte | Fond | Texte | Rayon | Ombre | Transition CSS |
|---|---|---|---|---|---|---|---|
| 0 | `div.framer-1hk06nd` | 141 × 33 px | `rgb(0,0,0)` | — | 10 px | `none` | `translate 0.3s ease-out` |
| 1 | `div.framer-15n11bm` | 73 × 17 px | transparent | — | 0 px | `none` | `all 0s` |
| 2 | `p.framer-text` « View insight » | 73 × 17 px | transparent | `rgb(255,255,255)` 14 px | 0 px | `none` | `translate 0.3s ease-out` |

**La couche qui bouge est la racine, et elle ne bouge pas : elle change
de couleur.** Au survol, la racine prend la classe `hover` et Framer
Motion **réécrit `background-color` dans le style en ligne à chaque
image**. La transition CSS déclarée sur `background-color` est de `0 s` —
le navigateur n'interpole rien, c'est du JavaScript qui pose 13 valeurs
successives.

## 2.2 La bascule — les chiffres

| Grandeur | **ALLER (survol)** | **RETOUR (sortie)** |
|---|---|---|
| Fond | `rgb(0,0,0)` → `rgb(255,255,255)` | `rgb(255,255,255)` → `rgb(0,0,0)` |
| Texte | `rgb(255,255,255)` → `rgb(0,0,0)` | `rgb(0,0,0)` → `rgb(255,255,255)` |
| **Durée** | **199,3 ms** | **199,5 ms** |
| Images à 60 Hz | 13 | 12 |
| Nuances distinctes | 13 | 14 |
| Bascule de la classe | 46,7 ms | 23,3 ms |
| Courbe la plus proche | **`ease`** (erreur 0,048) · puis M3 standard | **M3 standard** (0,076) · puis `ease` |
| 50 % du trajet atteint à | 79,6 ms = **40 %** de la durée → décélère | 121,9 ms = **61 %** de la durée → quasi linéaire |
| **Images intermédiaires du TEXTE** | **0** | **0** |
| Déplacement (`transform`/`translate`/`scale`) | **`none` — aucun** | **`none` — aucun** |
| Variation de largeur / hauteur | 0,35 / 0,18 px (bruit de parallaxe) | 0,27 / 0,24 px |
| Rayon | `10px` constant | `10px` constant |
| Bordure / ombre / filtre | `0px` / `none` / `none` | idem |
| Opacité | `1` fixe | `1` fixe |
| **État pressé (`:active`)** | **aucun — 0 objet ne change au `mousedown`/`mouseup`** | — |

**Réponse à la question posée : la matière ne se déplace pas. C'est une
couleur qui se fond.** Déplacement mesuré : `transform: none`,
`translate: none`, `scale: none` sur les trois couches, pendant toute la
bascule, dans les deux sens. Le seul mouvement, ce sont **13 valeurs de
gris successives** sur le fond.

**Sauf pour le texte, qui lui ne se fond pas.** Le libellé passe de blanc
à noir en **une seule image**, à la deuxième image de la séquence, alors
que le fond en met treize. Deux nuances traversées, pas trois. **C'est un
cran, et c'est la seule chose vraiment bonne de cette bascule.**

**Aller et retour ont la même durée** — 199,3 contre 199,5 ms, soit 0,1 %
d'écart. C'est très en dessous de la fraction de Weber pour la
discrimination de vitesse (~6 %) : personne ne peut voir la différence.
Ils diffèrent en revanche par la **courbe** : l'aller décélère (50 % du
trajet en 40 % du temps), le retour est presque linéaire (50 % en 61 %).

## 2.3 Le défaut, mesuré image par image

La couleur du texte bascule **à la première image**, celle où le fond n'a
encore presque pas bougé. Résultat, le libellé traverse un trou de
contraste :

**ALLER** — le texte passe au noir alors que le fond est encore à `rgb(38,38,38)`

| t (ms) | Fond | Texte | Contraste |
|---|---|---|---|
| 29,5 | `rgb(0,0,0)` | blanc | 21,00:1 |
| **46,7** | **`rgb(38,38,38)`** | **noir** | **1,39:1** |
| **63,2** | **`rgb(88,88,88)`** | **noir** | **2,95:1** |
| 79,6 | `rgb(126,126,126)` | noir | 5,17:1 |
| 228,8 | `rgb(255,255,255)` | noir | 21,00:1 |

**RETOUR** — pire : sept images sous 4,5:1

| t (ms) | Fond | Texte | Contraste |
|---|---|---|---|
| 6,2 | `rgb(255,255,255)` | noir | 21,00:1 |
| **23,3** | **`rgb(252,252,252)`** | **blanc** | **1,03:1** |
| 55,9 | `rgb(220,220,220)` | blanc | 1,37:1 |
| 106,0 | `rgb(147,147,147)` | blanc | 3,07:1 |
| 121,9 | `rgb(123,123,123)` | blanc | 4,23:1 |
| 139,1 | `rgb(98,98,98)` | blanc | 6,10:1 |
| 205,7 | `rgb(0,0,0)` | blanc | 21,00:1 |

**Bilan : 2 images sous 4,5:1 à l'aller (33 ms, plancher 1,39:1), 7 au
retour (117 ms, plancher 1,03:1).** Un état posé mesuré à 21:1 des deux
côtés, et un libellé littéralement invisible pendant un dixième de
seconde entre les deux. C'est précisément ce que `contraste-survol.mjs`
existe pour attraper, et ce qu'un `theme-check` qui ne mesure que les
états posés ne verra jamais.

## 2.4 La parallaxe de curseur — le seul chiffre à garder de la page

| Grandeur | Relevé |
|---|---|
| Amplitude, coin haut-gauche → coin bas-droit | **44,38 px en x · 49,73 px en y** |
| 90 % du trajet atteint à | **558 ms** |
| **Dépassement** | **0,00 px** |

Trajectoire relevée : `4,6 · 18 · 30 · 37,1 · 41,7 · 46 · 49,9 · 53,2 ·
56 · 58,2 · 60 · 61,5 · 62,6 · 63,5 · 64,2 · 64,8 · 65,2 · 65,6 · 65,8 ·
66,1 · 66,2 · 66,3 · 66,4 · 66,5 · 66,5 · 66,5`.

Incréments strictement décroissants, aucun retour en arrière,
**dépassement nul**. C'est un amortissement critique, ζ = 1, mesuré. La
référence fait exactement ce que `V2 · S'ALIGNER` demande.

## 2.5 Séquences d'images

`tools/_refs/toggle/sequence-aller/` — 10 vues · `sequence-retour/` —
10 vues, cadrées sur la pastille + 24 px de marge.

## CE QU'ON PREND — référence 2

1. **L'inversion complète comme état de survol.** `rgb(0,0,0)`/blanc →
   blanc/`rgb(0,0,0)`. Pas d'ombre, pas de dégradé, pas de flou, pas
   d'agrandissement — la référence n'a rien de tout ça et l'état se lit
   quand même. C'est déjà ce que fait le CTA primaire du projet.

2. **Le texte qui bascule en une image pendant que le fond met treize.**
   C'est `V4 · CRAN` à l'état pur, et c'est ce qui donne le côté
   mécanique plutôt que cosmétique.

3. **≈200 ms, dans les deux sens.** Le seul chiffre de durée à retenir de
   la page. Il tombe pile dans la fenêtre où tout l'état de l'art
   s'accorde.

4. **0,00 px de dépassement sur le suivi.** La preuve qu'un suivi
   critique amorti se mesure, et qu'on peut le vérifier.

5. **Rayon constant, aucune ombre, aucune bordure, opacité fixe.** Rien
   ne « souffle », rien ne « lève ». Cohérent avec les contraintes du
   projet.

## CE QU'ON JETTE — référence 2

1. **La bascule du texte à la première image.** C'est le bug. Il fait
   descendre le libellé à **1,03:1** pendant 117 ms. Le cran est bon, son
   **instant** est faux.

2. **Aucun état pressé.** 0 objet change au `mousedown`. Sur tactile —
   où le survol n'existe pas — la pastille ne répond à rien.

3. **La courbe asymétrique sans raison.** Aller décéléré, retour
   linéaire, même durée. L'asymétrie utile est celle des durées (voir
   Comeau, § état de l'art), pas celle des courbes à durée égale.

4. **La parallaxe de curseur elle-même.** 45-50 px d'amplitude sur toute
   une composition, c'est du `N3 · DÉCORATION` qui coûte une réécriture
   de `transform` à chaque image, et qui rend la page **intestable** : ça
   a cassé trois sondes avant d'être identifié. Le projet la fait déjà
   tomber au palier 1 ; le relevé confirme que c'est le bon ordre.

5. **`border-radius: 10px`.** Le projet est à 0.

---

# ÉTAT DE L'ART 2024-2026 — ce qui est chiffré et sourcé

## 3.1 Révélation de titre

| Chiffre | Ce que ça gouverne | Source |
|---|---|---|
| **Lignes : 800 ms / décalage 80 ms** | durée et décalage d'une révélation par ligne | https://tympanus.net/codrops/2025/05/14/from-splittext-to-morphsvg-5-creative-demos-using-free-gsap-plugins/ |
| **Mots : 600 ms / décalage 60 ms** | idem par mot | *idem* |
| **Caractères : 400 ms / décalage 8 ms** | idem par caractère | *idem* |
| `yPercent: 110 → 0` | amplitude d'une révélation **masquée** : la ligne doit être entièrement hors du cadre, +10 % pour les jambages (g, j, p, q) | *idem* |
| `y: 100` px · `yPercent: 20` | amplitudes des exemples canoniques, révélation **non masquée** | https://gsap.com/docs/v3/Plugins/SplitText/ |
| `stagger: 0.05` (50 ms) | valeur par défaut des exemples SplitText | *idem* |
| **≤ 20 ms** | plafond de décalage pour l'entrée d'une liste ou d'une grille | https://material.io/archive/guidelines/motion/choreography.html |
| **20 ms, total ≤ 500 ms** | décalage d'un tableau ; **le décalage doit être réduit si le total dépasse 500 ms** | https://v10.carbondesignsystem.com/guidelines/motion/choreography/ |
| `aria-label` parent + `aria-hidden` fragments | rétablissement de l'accessibilité, par défaut depuis GSAP v3.13.0 ; **limite documentée** : écrase les éléments imbriqués (liens, `<em>`) | https://gsap.com/resources/a11y/ |
| « ne découper que ce dont on a besoin », `revert()`, attendre `document.fonts.ready` | coût de rendu et décalage de mise en page | https://gsap.com/docs/v3/Plugins/SplitText/ |

**La loi implicite du tableau Osmo est nette : plus la découpe est fine,
plus la durée par élément raccourcit et plus le décalage s'effondre.** Le
rapport décalage/durée passe de 1/10 (lignes, mots) à 1/50 (caractères).

**Et il y a un conflit franc, qu'il faut nommer :** les grands design
systems plafonnent le décalage à **20 ms**, la pratique du text reveal
l'installe à **60-80 ms**. Ce n'est pas la même chose : Material et
Carbon décrivent l'**arrivée de contenu utile**, où le décalage sert à
alléger la charge sans faire attendre — d'où un calage juste au seuil de
simultanéité. Osmo décrit une **révélation expressive**, où le décalage
est le sujet — d'où un calage au-dessus du seuil de jugement d'ordre
conscient. Aucune des deux familles ne formule cette distinction :
c'est une reconstruction, pas un fait sourcé.

## 3.2 Perceptible plutôt que subliminal

| Chiffre | Ce que ça gouverne | Source |
|---|---|---|
| **200 ms** | « Any shorter than that, and you risk it not being visually perceived at all » | https://valhead.com/2016/05/05/how-fast-should-your-ui-animations-be/ |
| **100 ms** | borne basse du mouvement perceptible ; « presque un saut instantané » | https://www.nngroup.com/articles/animation-duration/ |
| **100 ms** (plage 50-200) | cycle du processeur perceptif, Card, Moran & Newell 1983 | https://en.wikipedia.org/wiki/Human_processor_model |
| 150 ms | durée minimale pour *traiter* un stimulus, pas seulement le détecter | https://medium.com/@domyen/guidelines-for-animation-timing-88b0b1ad3602 |
| 350 ms | durée d'une fixation oculaire ; au-delà le regard part ailleurs | *idem* |

Réserve : Val Head attribue « 230 ms de temps moyen de perception
visuelle » au Model Human Processor, qui donne en réalité τp = 100 ms.
Le 230 ms ressemble à un temps de **réaction** (perceptif 100 + cognitif
70 + moteur 70), pas de perception. Sa recommandation reste raisonnable,
son chiffre est douteux.

## 3.3 États de bouton

| Chiffre | Ce que ça gouverne | Source |
|---|---|---|
| **70 ms** (`duration-fast-01`) | micro-interaction **bouton et bascule** — le chiffre le plus précis publié | https://v10.carbondesignsystem.com/guidelines/motion/overview/ |
| 110 / 150 / 240 / 400 / 700 ms | fondu · petite expansion · expansion · grande expansion · assombrissement de fond | *idem* |
| **≤ 200 ms** | « for interactions to feel immediate » | https://interfaces.rauno.me/ · https://github.com/raunofreiberg/interfaces |
| **< 300 ms** | « UI animations should generally stay under 300ms » | https://emilkowal.ski/ui/7-practical-animation-tips |
| **100 ms** | retour simple (case, interrupteur) : « illusion de manipuler physiquement l'objet » | https://www.nngroup.com/articles/animation-duration/ |
| **100-150 ms** | fenêtre où l'état **pressé** doit apparaître pour être perçu comme instantané | https://www.nngroup.com/articles/button-states-communicate-interaction/ |
| 150-200 ms | délai avant d'appliquer le survol, pour éviter les changements involontaires au passage du curseur | *idem* |
| **500 ms** | seuil d'agacement : « animations start to feel like a real drag » | https://www.nngroup.com/articles/animation-duration/ |
| **`scale: 0.97`** · `~0.96` à `~0.9` | échelle du bouton à `:active` ; « don't scale from 1 → 0.8 » | https://emilkowal.ski/ui/7-practical-animation-tips · https://github.com/raunofreiberg/interfaces |
| `translateY(10px)` | déplacement du survol de bouton | https://www.joshwcomeau.com/animation/css-transitions/ |
| M3 : 50 · 100 · 150 · 200 · 250 · 300 · 350 · 400 ms… | jetons de durée `short1` → `medium4` | https://github.com/material-foundation/material-tokens/blob/json/json/motion.json |
| M3 : `standard` [0.2, 0, 0, 1] · `decelerate` [0, 0, 0, 1] | courbes | *idem* |
| Carbon : entrée productive `cubic-bezier(0, 0, 0.38, 0.9)` | courbe d'entrée | https://v10.carbondesignsystem.com/guidelines/motion/overview/ |

**Asymétrie entrée/sortie — les sources se contredisent franchement :**

| Chiffres | Direction | Source |
|---|---|---|
| **125 ms entrée / 450 ms sortie** | sortie **3,6× plus lente** | https://www.joshwcomeau.com/animation/css-transitions/ |
| 300 ms entrée / 200-250 ms sortie | sortie **plus rapide** | https://www.nngroup.com/articles/animation-duration/ |
| 225 ms entrée / 195 ms sortie | sortie **plus rapide** (−13 %) | https://m1.material.io/motion/duration-easing.html |

Lecture possible : Comeau parle du **survol**, où une sortie lente évite
le clignotement quand le curseur frôle ; NN/g et Material parlent
d'**entrée/sortie d'écran**. Aucune source ne pose cette distinction.
Prendre l'une pour universelle produit l'inverse de l'effet voulu sur
l'autre cas.

**Aucun chiffre trouvé** pour « combien de px pour qu'un bouton réponde
visiblement » : aucun design system consulté (Material, Carbon, Spectrum,
Rauno) n'en publie. Rauno pose explicitement la règle inverse — les
valeurs doivent être **proportionnelles à la taille du déclencheur**. Et
l'état de l'art préfère l'échelle au déplacement pour le pressé.

## 3.4 Seuils de perception

| Chiffre | Ce que ça gouverne | Source |
|---|---|---|
| **~20 ms** | intervalle minimal pour rapporter **correctement** lequel de deux stimuli a précédé l'autre | https://www.sciencedirect.com/science/article/abs/pii/S0010027720303474 |
| **~40 ms** | asynchronie requise pour un **jugement d'ordre temporel conscient** | *idem* |
| **< 20 ms** | l'ordre est traité implicitement mais **perçu comme simultané** | *idem* |
| **0,1 s** | limite de la réaction perçue comme **instantanée** | https://www.nngroup.com/articles/response-times-3-important-limits/ |
| **1 s** | limite du **fil de pensée** ininterrompu | *idem* |
| **10 s** | limite de l'**attention** | *idem* |
| **400 ms** | seuil de Doherty — productivité maximale quand ni l'humain ni la machine n'attend l'autre (Doherty & Thadani, IBM, 1982) | https://lawsofux.com/doherty-threshold/ |
| **~0,15 px** (10-14 arcsec) | seuil de **détection** d'un déplacement en vision fovéale | https://www.sciencedirect.com/science/article/abs/pii/0042698981901140 · https://jov.arvojournals.org/article.aspx?articleid=2122525 |
| **~6 %** | fraction de Weber pour la discrimination de **vitesse** | https://www.sciencedirect.com/science/article/abs/pii/004269897690095X |
| **16,7 ms** | budget par image à 60 i/s, dont **~10 ms** réellement disponibles | https://web.dev/articles/speed-rendering |

**Les trois résultats qui tranchent :**

- **La frontière « ça bouge ensemble » / « ça roule » est à ~40 ms.** En
  dessous de 20 ms, simultané. Entre 20 et 40, ambigu. Au-dessus de 40,
  l'ordre est lisible. Les 60-80 ms de la pratique sont à 1,5-2× la
  marge nécessaire ; les 350 ms de la référence 1 sont à 8,75×.
- **Il n'existe pas de seuil de déplacement en pixels.** L'œil détecte un
  mouvement **cinq à huit fois plus petit qu'un pixel**. La contrainte
  n'est pas spatiale, elle est **temporelle** : 40 px en 60 ms se voient
  moins que 4 px en 400 ms. La question « combien de px pour qu'on le
  remarque » n'a pas de réponse perceptive. *(Conversion arcsec → px
  faite ici, pas par la source : 1 px CSS ≈ 1,28 arcmin.)*
- **Deux durées qui diffèrent de moins de ~6 % sont indiscernables.**
  Inutile d'accorder des durées à 300 contre 318 ms. *(Transposition de
  la psychophysique à l'interface : elle est de moi, pas d'une source.)*

## 3.5 Ce qui fait consensus

1. **Rien n'est du mouvement en dessous de 100 ms** — NN/g, Val Head, MHP.
2. **Au-delà de 400-500 ms, l'animation devient un coût** — NN/g, Material, Carbon.
3. **Les micro-interactions de bouton se jouent entre 70 et 150 ms** — c'est le point le plus resserré du corpus.
4. **La durée croît avec la distance et la taille** — Carbon, Material, Val Head, Rauno. Unanime.
5. **Le pressé se joue en échelle, pas en déplacement, et faiblement** (0,97 · 0,96).
6. **Un décalage a un budget total** — Carbon : réduire le décalage individuel plutôt que dépasser 500 ms au total.
7. **`transform` et `opacity` seulement**, 16,7 ms par image dont ~10 utilisables.
8. **`ease-out` pour les entrées** — Kowalski, M3 `decelerate`, Carbon `entrance`.

---

# CONCLUSION — cinq recommandations chiffrées, directement applicables

## R1 · LE TITRE QUI SE DÉGAGE — `V1 · DÉGAGER` + `V4 · CRAN`

Reprendre le mécanisme exact de la référence 1 — plaque opaque en
`currentColor`, texte allumé en `.set()` — et **diviser sa durée par
trois**.

| | Référence | **À poser** | Pourquoi |
|---|---|---|---|
| Découpe | lignes | **lignes** | le moins cher, le seul lisible au lecteur d'écran |
| Amplitude | 100 % largeur de ligne | **100 % largeur de ligne** | ce n'est pas un déplacement, c'est un recouvrement |
| Translation verticale | 0,0 px | **0 px** | mesuré chez la référence, et c'est ce qui la distingue |
| Aller | 700 ms | **260 ms** | fenêtre 100-400 ms (NN/g) |
| Retour | 700 ms | **260 ms** | idem |
| Opacité du texte | `.set()`, 0 image inter. | **`.set()`, 0 image inter.** | c'est le cran |
| Courbe | `power2.inOut` | **`power2.inOut`** | conforme, aller et retour |
| Décalage entre lignes | 350 ms | **90 ms** | 2,25× le seuil de 40 ms : franchement lu comme une cascade, sans être quatre animations séparées |
| **Total, 3 lignes** | **2 030 ms** | **700 ms** | sous la seconde de Nielsen, sous le « drag » de 500 ms par ligne |

**Correctif que la référence n'a pas : durée constante → vitesse
constante.** La référence varie de 4,0×. Poser
`durée = clamp(largeur_ligne / 2 900 px·s⁻¹, 180 ms, 320 ms)`.
Sur les largeurs relevées (188 → 875 px) cela donne 180 → 302 ms, soit un
rapport de vitesse ramené de **4,0× à 1,7×**.

**Plafond, règle de Carbon transposée :**
`décalage = min(90 ms, (700 − 2×durée_étage) / (n_lignes − 1))`.
À 4 lignes → 60 ms. À 5 lignes → 45 ms. **45 ms reste au-dessus du seuil
de 40 ms** : la cascade tient jusqu'à cinq lignes sans dépasser le budget.

## R2 · L'INVERSION DU CTA — `V4 · CRAN`, avec le défaut corrigé

| | Référence | **À poser** |
|---|---|---|
| Fond | noir → blanc | **encre → minium** (ou l'inverse), inversion complète |
| Durée aller | 199,3 ms | **200 ms** |
| Durée retour | 199,5 ms | **200 ms** — l'égalité est indiscernable de toute façon (Weber ~6 %) |
| Courbe | `ease` / linéaire | **`ease-out`** dans les deux sens — cohérent avec M3 `decelerate` et Carbon `entrance` |
| Texte | 1 image, 0 intermédiaire | **1 image, 0 intermédiaire** |
| Déplacement | aucun | **aucun** |
| Rayon / ombre / bordure | 10 px / none / 0 | **0 / none / 0** |
| État pressé | **absent** | **présent, ≤ 100 ms** — NN/g : 100-150 ms pour être perçu instantané. Pas d'échelle : le projet n'a pas de rayon, donc **l'arête minium** qui roule d'un cran |

**LE CHIFFRE QUI CORRIGE LE DÉFAUT.** La référence bascule le texte à la
première image et tombe à **1,03:1**. Il faut basculer le texte **à
l'image où le fond franchit la luminance de croisement** — celle où le
contraste avec l'ancienne et la nouvelle couleur de texte sont égaux.

Pour une inversion noir ↔ blanc, ce point est à **L = 0,179**, soit
**`rgb(117,117,117)`**, et le contraste y vaut **4,58:1 des deux côtés**.
Basculer là, c'est garantir que **le libellé ne descend jamais sous
4,58:1** au lieu de 1,03:1. Sur la séquence relevée de la référence, cela
revient à basculer à l'image 3 (t = 79,6 ms, `rgb(126,126,126)`, 5,17:1)
au lieu de l'image 1.

Règle générale : **basculer à `progression ≈ 0,50`**, jamais à 0.
À vérifier avec `contraste-survol.mjs`, qui mesure déjà image par image,
aller **et** retour.

## R3 · LES PLAQUES QUI S'ALIGNENT — `V2 · S'ALIGNER`

| | Référence 1 (fiches) | Référence 2 (suivi) | **À poser** |
|---|---|---|---|
| Amplitude | 144 px (vertical) | 44-50 px | **24 à 32 px, latéral** — l'alignement du projet est latéral, et 24 px est l'amplitude de `data-reveal` de la référence, la seule qu'elle applique à des blocs de contenu |
| Durée | scrub, 1 004 px de course | 558 ms à 90 % | **520 ms** — aligné sur `--cran` déjà en place |
| Courbe | `power1.inOut` | — | **`power2.out`** — entrée décélérée |
| **Dépassement** | — | **0,00 px** | **0,00 px** — ζ = 1, à mesurer, pas à supposer |
| Décalage entre blocs | 100 ms (`data-reveal-stagger`) | — | **90 ms**, même valeur qu'en R1 : une seule idée déclinée |
| Inclinaison | `rotationX: 14°` | — | **≤ 2°, dans le plan** — pas de 3D, pas de perspective |
| Échelle | 0,95 → 1 | — | **aucune** — le projet fait la profondeur au filet de 1 px |

**Ce qui est repris de la référence 2 et de rien d'autre : la preuve que
le dépassement nul se mesure.** Incréments strictement décroissants,
`max(trajet) − trajet_final = 0,00 px`. À ajouter comme assertion dans
`accueil-check.mjs`.

## R4 · LE DÉCALAGE — 90 ms partout, et un plancher de 16,7 ms

| Grandeur | Valeur | Justification |
|---|---|---|
| **Décalage entre blocs, lignes, plaques** | **90 ms** | 2,25× le seuil de jugement d'ordre conscient (40 ms) ; bien en dessous des 350 ms de la référence |
| **Plancher absolu d'un décalage** | **16,7 ms** | une image à 60 Hz. En dessous, deux éléments partent sur la même image : le décalage **n'existe pas**. C'est le pas exact de la référence 1 sur son survol de bouton |
| **Décalage par lettre (cran de CTA)** | **≥ 16,7 ms**, viser **20-25 ms** | `--cran: 520ms` sur « Estimation en 60 secondes » (24 caractères) donne 22,6 ms/lettre. `230 ms` donnait 10,5 ms — plus court qu'une image, donc invisible. Le relevé explique après coup l'arbitrage du chantier 01 |
| **Budget total d'un décalage** | **≤ 500 ms** | Carbon : réduire le décalage individuel plutôt que dépasser le total |
| **Budget total d'un titre entier** | **≤ 700 ms** | sous la seconde de Nielsen, avec de la marge |

## R5 · CE QUI EST INTERDIT, CHIFFRÉ

| Interdit | Chiffre | Preuve |
|---|---|---|
| **Scrubber l'opacité d'un porteur de texte** | 40 mots à **0,15** d'opacité pendant que le paragraphe est **entièrement visible** (haut à 900 → 660 px de l'écran) | relevé sur `p.statement_text` de la référence 1 — une référence primée commet la faute |
| **Un titre qui dure plus de 700 ms** | la référence est à **2 387 ms** = 4,8× le seuil « real drag » de NN/g | relevé, 4 lignes |
| **Un décalage sous 40 ms** | seuil de jugement d'ordre conscient ; sous 20 ms, **perçu simultané** | psychophysique, Cognition 2020 |
| **Un décalage par lettre sous 16,7 ms** | plus court qu'une image | mesuré, 60 Hz |
| **Basculer une couleur de texte au début d'une inversion** | plancher à **1,03:1** pendant **117 ms** | relevé image par image, référence 2 |
| **Une durée d'accord fine sous ~6 % d'écart** | fraction de Weber pour la vitesse : 300 vs 318 ms est indiscernable | psychophysique |
| **`rotationX` en perspective, `border-radius`, ombre, dégradé, flou** | les deux références en ont ; le projet est à 0 partout | — |

---

## Les cinq chiffres, en une ligne chacun

1. **Amplitude d'une révélation de titre : 100 % de la largeur de la
   ligne, 0 px de translation verticale.**
2. **Durée d'un étage de plaque : 260 ms** (`clamp(largeur / 2 900, 180,
   320)` si on veut la vitesse constante), **courbe `power2.inOut`**.
3. **Décalage : 90 ms**, plancher absolu **16,7 ms**, budget total
   **≤ 700 ms** pour un titre entier.
4. **Inversion de CTA : 200 ms aller, 200 ms retour, `ease-out`,
   texte en 1 image** — et la bascule du texte à **`rgb(117,117,117)`
   (progression 0,50)** pour ne jamais descendre sous **4,58:1**.
5. **Alignement : 24 à 32 px latéraux, 520 ms, `power2.out`,
   dépassement 0,00 px, inclinaison ≤ 2°.**
