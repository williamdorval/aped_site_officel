# ARCHITECTURE — la carte des fichiers

Carte de repérage du dépôt. Pour chaque fichier : **son rôle**, **ce qu'il
contient**, et **ce qu'il ne contient pas** — cette dernière colonne est la
plus utile, parce que la moitié des erreurs sur ce projet consistent à
modifier le bon comportement dans le mauvais fichier.

**Quand lire ce fichier :** quand tu sais ce que tu veux changer mais
pas dans quel fichier. Il dit **où**, pas **pourquoi** (`DECISIONS.md`)
ni **quelle ligne** (`SECTIONS.md`).

## Table

- [1 · Où vais-je ?](#1--où-vais-je-)
- [2 · Les deux vagues de scripts](#2--les-deux-vagues-de-scripts)
- [3 · `index.html`](#3--indexhtml)
- [4 · Les feuilles de style](#4--les-feuilles-de-style)
- [5 · Le JavaScript](#5--le-javascript)
- [6 · `tools/` — la mesure](#6--tools--la-mesure)
- [7 · Documentation](#7--documentation)
- [8 · Le reste](#8--le-reste)
- [9 · Points à surveiller](#9--points-à-surveiller-relevés-en-dressant-cette-carte)
- [10 · `demos-secteurs/` — les douze premiers écrans](#10--demos-secteurs--les-douze-premiers-écrans)

> **AUCUN NUMÉRO DE LIGNE DANS CE FICHIER.** Il en portait 121 au
> 2026-07-29 ; au 2026-07-30 ils étaient **tous faux**, les fichiers
> ayant maigri d'un tiers. Ils ont été retirés, pas réparés : une
> adresse fausse coûte plus cher que pas d'adresse. Les seules plages de
> lignes du dépôt vivent dans `SECTIONS.md`, où **une machine les
> génère et les vérifie**. Partout ailleurs le repère est le
> **sélecteur**, le **nom de fonction** ou la **bannière de bloc**
> `/* == TITRE == */` — trois choses qui ne périment pas.

---

## 1 · OÙ VAIS-JE ?

| Je veux modifier… | J'ouvre | Attention |
|---|---|---|
| **Le contenu d'une section** (texte, chiffres, libellés) | `index.html`, à la plage donnée par `SECTIONS.md` | Les 13 aperçus de secteur sont dans un `<template>` posé par `main.js`. **Les plaques de l'accueil n'existent plus** — voir `archives/2026-07-30-plaques-accueil/`. Et lire la règle de propagation : une correction de véracité se fait **partout, en une fois**. |
| **Un style** | `css/app.css` **et rien d'autre** | Puis `node tools/css-critique.mjs`, puis `node tools/cascade-check.mjs` (doit rendre 0 écart). Éditer `critique.css` ou `differe.css` = travail perdu au prochain build. |
| **Le style d'un aperçu de secteur** | `css/secteurs.css` | Feuille séparée, injectée par JS. Ne pas la fusionner dans `app.css` : elle style du contenu qui n'existe pas sans script. |
| **Le style de la visite 360** | `css/tour360.css` | Charge après `css/vendor/pannellum.css`, qu'elle corrige. |
| **Une animation de chargement** (séquence d'entrée, composition du hero) | markup dans `index.html` sous `#entree` · CSS bloc `11b. SEQUENCE D'ENTREE` et `12. HERO` · JS bloc `SEQUENCE D'ENTREE` de `main.js` | Le rideau se retire par animation CSS `forwards` : il part même si aucun script ne s'exécute. Le JS ne fait qu'**allonger** et permettre de **sauter**. |
| **Une animation de scroll** | `js/motion.js` (les chorégraphies numérotées) ou `js/langue.js` (les 4 verbes, les 12 frontières) | Les deux s'arrêtent net sous `prefers-reduced-motion` et exigent GSAP. Ils partent en **vague 2**. Ne jamais y mettre d'orientation. |
| **Le passage entre deux états** (frontière, thème, menu, modale, pièce de visite) | `js/trame.js` — API `APED_TRAME.degager / .couvrir / .inverse / .tout_arreter` | Un seul mécanisme, décliné. Les appelants sont dans `main.js`, `langue.js`, `tour360.js`. |
| **Un état de survol** | `css/app.css` bloc `4. BOUTONS`, puis les blocs `V1`…`V4` des micro-états | Mesurer avec `node tools/contraste-survol.mjs` : `theme-check` ne voit que les états posés, pas les images intermédiaires. |
| **L'orientation** (compteurs, odomètres, filet de section active, curseur du rail, cran des frontières) | **`js/main.js` uniquement** — blocs `N1 · LE CURSEUR DU RAIL`, `PARCOURS`, `LE CRAN`, `Index collant` | Jamais dans `motion.js` ni `langue.js` : ils ne s'exécutent pas sous mouvement réduit. `main.js` s'exécute toujours et part en vague 1. |
| **Le thème clair / sombre** | `css/tokens.css` (les jetons) · `js/main.js` bloc `Theme.` · le script en ligne du `<head>` (pose du thème avant le 1ᵉʳ rendu) | La bascule passe par `APED_TRAME`, plus par `startViewTransition` (qui était un fondu). Vérifier avec `node tools/theme-check.mjs`. |
| **Une modale** | les six `#modal-*` de `index.html` · `js/main.js` bloc `Modales` · `css/app.css` bloc `10. MODALES` | Le popup cadeau est à part : `<dialog>` natif, logique dans le bloc `LE CADEAU` de `main.js`, style dans `11c. LE CADEAU`. |
| **Une mesure / une preuve** | `tools/*.mjs`, catalogués dans `MESURES.md` | `node tools/serve.mjs 8099` d'abord, **et vérifier que le port est libre**. Poser `sessionStorage aped-sans-popup=1` dans tout outil qui clique. |
| **La logique métier** (prix, formulaires, calendrier, calculateur) | `js/main.js` | Zéro dépendance. Si GSAP ne charge jamais, tout ça fonctionne quand même. |

---

## 2 · LES DEUX VAGUES DE SCRIPTS

Le bloc en ligne de `index.html`  injecte tout après **deux
`requestAnimationFrame`** — donc après la première peinture. Il n'y a plus
aucun `<script defer>` en bas de page.

| | Quand | Ce qui part | Pourquoi là |
|---|---|---|---|
| **Feuilles différées** | avec la vague 1 | `css/differe.css`, `css/secteurs.css`, `css/tour360.css` | Ordre de cascade : `differe` d'abord, il est la suite de `critique`. |
| **Vague 1 — la matière et l'usage** | 2 rAF après le premier rendu | `js/limaille.js` → `js/trame.js` → `js/main.js` → `js/hero.js` | Tout ce avec quoi le visiteur peut **agir** : formulaires, modales, calculateur, thème, orientation. `trame.js` est ici (< 6 Ko, aucune dépendance) parce que deux de ses usages — bascule de thème, menu — se déclenchent au premier clic, donc potentiellement avant que GSAP soit demandé. |
| **Vague 2 — la chorégraphie** | au premier `scroll` / `pointerdown` / `pointermove` / `keydown` / `touchstart`, ou à **1 200 ms** | `js/vendor/gsap.min.js` → `js/vendor/ScrollTrigger.min.js` → `js/motion.js` → `js/langue.js` → `js/pointe.js` → `js/tour360.js` | 112 Ko de bibliothèque + 51 ms d'évaluation sortis du chargement. |

`async = false` garantit l'ordre **à l'intérieur** de chaque vague ;
les dépendances restent dans la même vague que ce dont elles dépendent
(`hero.js` ← `limaille.js`, `motion.js` ← GSAP).

> ### La conséquence qu'on oublie
>
> **`css/differe.css` est injecté par JavaScript, comme les scripts.**
> Il n'existe donc pas pendant la première peinture ni pendant la
> séquence d'entrée.
>
> **Toute règle qui doit s'appliquer pendant la première seconde doit se
> retrouver dans `critique.css`.** On ne l'y met pas à la main :
> `tools/css-critique.mjs` interroge le navigateur, page chargée, pour
> savoir quelles règles ont une cible réellement visible sans défiler.
> Si une règle nouvelle doit passer côté critique et n'y va pas toute
> seule, c'est l'outil qu'il faut regarder — pas le fichier fabriqué.
>
> Corollaires du même mécanisme : rien de ce qui est nécessaire à la
> **lecture** ne peut dépendre du JS, et **aucun élément de contenu ne
> démarre à `opacity: 0`** (un élément à opacité nulle n'est pas candidat
> au LCP).

---

## 3 · `index.html`

Page unique. Contient **tout** le contenu du site : onze sections, six
modales, le popup cadeau, le pied, et le `<template>` des treize aperçus.
La section 09 · Agence (`#apropos`) est partie le 2026-08-03 —
`archives/2026-08-03-agence/`.

> **Les plages de lignes des onze sections vivent dans `SECTIONS.md`**,
> où elles sont **générées** par `node tools/plages.mjs` et vérifiables
> par `node tools/plages.mjs verifier`. Elles ne sont pas recopiées ici :
> une adresse écrite à deux endroits dérive à l'un des deux.

### L'ordre du document, par sélecteur

| Zone | Ce qu'elle porte |
|---|---|
| `<head>` | meta, OG, `theme-color` (une seule balise, sans `media`), favicon, préchargement des 3 woff2, puis **trois** feuilles sur le chemin critique : `tokens.css`, `base.css`, `critique.css`. Plus le **seul `<noscript>` du site**, qui supplée `differe.css` pour le cran avant / après |
| script en ligne du `<head>` | **avant le premier rendu** : pose `html.js`, lit `localStorage aped-theme`, pose `data-theme` + la couleur de barre, pose `reduced-motion`, et **décide de la séquence d'entrée** en lisant `performance.getEntriesByType("navigation")[0].type` |
| `#entree` | **séquence d'entrée** : 15 filets (`--k` = distance au filet du milieu), jauge en deux temps, compteur à crans (`.entree-cran` = fenêtre, `.entree-rouleau` = bande), cadre à 4 équerres, plaque monogramme SVG, mot de sortie. `aria-hidden`, `pointer-events: none` |
| sprite SVG | icônes en ligne, `display: none`. Aucune requête tierce |
| `.read-progress` / `#readBar` | barre de lecture |
| `<header class="nav">` | wordmark, `.nav-links`, bouton thème, CTA |
| `#menu` | menu plein écran, `hidden` au repos |
| `<aside class="rail" id="rail">` + `#railList` | index collant |
| `<main class="shell" id="contenu">` | les onze sections, dans l'ordre du rail — voir `SECTIONS.md` |
| `<footer class="footer">` | ⚠️ **à l'intérieur de `<main>`** : il perd son rôle `contentinfo`. Voir `RESERVES.md` |
| `<dialog class="cadeau" id="cadeau">` | le popup cadeau. `<dialog>` natif : piège de focus, inertie, Échap et couche supérieure gratuits |
| `#modal-start` · `#modal-booking` · `#modal-project` · `#modal-urgent` · `#modal-refer` · `#modal-estimate` | les six modales, toutes en `role="dialog" aria-modal="true" hidden` |
| bloc d'injection des scripts | les deux vagues — voir § 2 |

### Les onze seuils, tels qu'ils sont écrits dans le document

Chaque seuil porte `data-seuil`, `data-de`, `data-vers`, `data-dress`,
`data-verbe`, `data-sens`, et parfois `data-cible`.

| de → vers | `dress` | `verbe` (G4) | `sens` | `cible` |
|---|---|---|---|---|
| 01 → 02 | clair | volet | bas | — |
| 02 → 03 | clair | degager | bas | `.ba:first-of-type .ba-scene` |
| 03 → 04 | clair | aligner | droite | `.sector-group` |
| 04 → 05 | **encre** | volet | bas | — |
| 05 → 06 | **encre** | volet | **haut** | — |
| 06 → 07 | clair | aligner | droite | `.vs-row` |
| 07 → 08 | clair | aligner | droite | `.parc-etape` |
| 08 → 09 | clair | cran | droite | `.referral-max .num` |
| 09 → 10 | clair | degager | droite | `.faq-item` |
| 10 → 11 | clair | degager | bas | `.cell` |
| 11 → 00 | **encre** | volet | bas | `.footer-mark` |

Les **trois** bandes d'encre sont celles qui **entrent** en 05, en 06 et
dans le **pied** (`data-de="11"`). Celle du seuil 02 est redevenue
claire le 2026-07-31 (D-570, l'arc de luminance).

> **Le `souder` a disparu de la table.** C'était le seuil `08 → 09`,
> celui de la section Agence, et le seul sans `data-cible`. Il part
> avec elle le 2026-08-03 ; les trois seuils suivants reculent d'un
> cran. `A44` et `A146` (`ANIMATIONS.md`) n'ont plus de cible et
> tournent à vide des deux côtés — règle CSS et bloc `langue.js`.
>
> **Les bannières `<!-- FRONTIERE nn -->` d'`index.html` n'ont pas
> suivi** : les trois dernières annoncent 10, 11 et 12 pour des seuils
> `08→09`, `09→10` et `10→11`. Les attributs font foi.

### Ce que `index.html` ne contient PAS

- **Aucun `<script defer>` ni `<script src>` statique.** Tout est injecté
 . Remettre un `defer` ramène le défaut mesuré : tâche de 222 ms
 avant peinture, LCP à 588 ms.
- **Aucun état de départ d'animation.** L'état au repos du markup est la
 forme **finale**. C'est `motion.js` / `langue.js` qui posent le départ,
 avec `immediateRender: false`.
- **Aucune requête tierce** : icônes en sprite inline, polices auto-hébergées,
 GSAP auto-hébergé, Pannellum auto-hébergé.
- **Les treize aperçus ne sont pas dans le DOM** — ils sont dans un
 `<template>`, analysé mais non rendu, posé par `main.js`.

---

## 4 · Les feuilles de style

### `css/app.css` — **LA SOURCE UNIQUE**

Mise en page, composants, sections, micro-états, budget de dégradation.

> **Les plages de lignes ne sont pas recopiées ici.** Celles des blocs de
> section vivent dans `SECTIONS.md`, générées par `node tools/plages.mjs`.
> Le repère durable d'un bloc est sa **bannière** : chaque bloc s'ouvre
> par `/* == TITRE == */`, et un titre qui commence par un numéro est un
> bloc de section. `grep -n "^/\* == " css/app.css` rend la table des
> matières à jour, toujours.

| Bloc — la bannière est le repère, `grep "== 14. SERVICES"` |
|---|
| 1. GRILLE |
| 1bis. LES DOUZE SEUILS — LES FRONTIERES DE SECTION |
| 2. EN-TETE DE SECTION |
| 3. NAVIGATION |
| 4. BOUTONS |
| 4b. LA POINTE — declinaison de la signature au curseur |
| 5. INDEX COLLANT |
| 6. MENU PLEIN ECRAN |
| 7. PLAQUE |
| 8. CHAMPS |
| 9. CURSEURS |
| 10. MODALES |
| 11. CALENDRIER |
| 11b. SEQUENCE D'ENTREE |
| 11c. LE CADEAU — un seul popup, en `<dialog>` natif |
| 12. HERO - plaque typographique |
| 14. SERVICES — LA PISTE, LA SCENE ET LE RAIL |
| 15. AVANT / APRES — trois demonstrations, zero image |
| 16. SECTEURS - trois groupes, pas treize lignes filetees |
| 17. CALCULATEUR - deux moities, le resultat vit a droite |
| 18. COMPARATIF - deux barres nues par tache |
| 19. PROCESSUS - le parcours d'atelier |
| 21. REFERENCE - le bloc sombre, dans LES DEUX themes |
| 22. FAQ - deux colonnes, accordeon |
| 23. CONTACT - cinq cellules pour cinq entrees, aucune vide |
| 24. PIED DE PAGE |
| 25. PAGE 404 - index deraille |
| 26. POINTS DE RUPTURE |

**Il n'y a plus de bloc `20.`, et le trou reste.** `20. A PROPOS` est
parti le 2026-08-03 avec la section Agence ; les blocs `21.` à `24.`
gardent leurs numéros. Renuméroter quatre bannières pour combler un
trou ferait mentir d'un coup toutes les adresses de `SECTIONS.md` et
d'`ANIMATIONS.md` — un numéro manquant coûte moins cher qu'un index
faux.

Après les blocs numérotés viennent, dans l'ordre : la phase 8 (les
micro-états, un sous-bloc par état), puis le budget de dégradation
(`:root[data-palier="1"]` et `="2"`).

**Ne contient pas** : le socle (`base.css`), les jetons (`tokens.css`),
les 13 aperçus de secteur détaillés (`secteurs.css`), la visite
(`tour360.css`), ni **aucun état de départ d'animation**.

### `css/critique.css` — 1 674 lignes, 70 Ko — **FABRIQUÉ**
### `css/differe.css` — 3 643 lignes, 158 Ko — **FABRIQUÉ**

Produits par `node tools/css-critique.mjs` à partir d'`app.css`.
`critique.css` = les règles dont une cible est **réellement visible sans
défiler**, demandé au navigateur page chargée, pas trié à la main.
`differe.css` = tout le reste, injecté après la première peinture.

**Ne jamais les éditer.** Toute modification directe disparaît au prochain
build. Après chaque changement d'`app.css` : régénérer, puis
`node tools/cascade-check.mjs` — le découpage inverse l'ordre de cascade
entre deux règles de même spécificité, et c'est déjà arrivé une fois sur
la tuile principale du contact.

### `css/base.css` — 287 lignes

Socle : remise à zéro, typographie, états de focus, utilitaires,
`scroll-padding-top` calé sur la hauteur de nav, `html.lenis`.
Sur le **chemin critique**. Contient le bloc global `prefers-reduced-motion`.

### `css/tokens.css` — 261 lignes

Système de design. **Aucune valeur en dur ailleurs que dans ce fichier.**
Les `@font-face` des trois familles (Archivo variable wdth+wght, Chivo,
Martian Mono), auto-hébergées, avec `unicode-range`. Rayon 0 partout,
aucune ombre, un seul accent.
Sur le **chemin critique**. Ne contient aucune mise en page.

### `css/secteurs.css` — 290 lignes, 9,8 Ko

**Passée de 1 582 à 290 lignes le 2026-08-01** (D-681) : douze des
treize aperçus étaient encore stylés en maquette dessinée alors que
leur balisage avait disparu à la refonte des aperçus. 124 classes
qu'aucun sélecteur du document n'atteignait, 12 `@keyframes` qui ne
tournaient nulle part — et `ANIMATIONS.md` les documentait toujours.
Recollables : `archives/2026-08-01-css-secteurs-maquettes.css`.

Ce qui reste : le **cadre** (`.sec-chrome`), la **vitre** qui porte la
capture du premier écran, le calque **vivant** (`.sec-live`), et le
**treizième** aperçu — « Votre industrie ici » — le seul encore
dessiné, parce qu'il ne montre aucun site mais la matière. Surchargent
`.mock` du bloc 16 d'`app.css`.
**Hors chemin critique**, injectée par le bloc en ligne : sans script il
n'y a pas d'aperçu, donc rien à styler.
Ne contient pas la légende des secteurs — elle reste dans le document et
reste stylée par `app.css`.

### `css/tour360.css` — 453 lignes, 12,4 Ko

Feuille autonome de la visite. Ne dépend que des jetons. Charge **après**
`css/vendor/pannellum.css`, dont elle ferme deux dettes : l'anneau de focus
du conteneur (`outline: 0` chez Pannellum alors qu'il pose `tabIndex = 0`)
et l'état de focus des points de passage.

Depuis le 2026-08-02 elle porte aussi **le contenant** du lecteur, et pas
seulement le lecteur : `.tour-cadre` (les trois étages), `.tour-manifeste`,
`.tour-lieu`, `.tour-pupitre` / `.tour-encours`, `.tour-source`. C'est ce
qui garde l'invariant **« aucune règle `.tour` dans `app.css` »**.
Contrepartie à connaître : cette feuille arrive en **vague 2**, donc rien
de ce qu'elle porte ne doit être nécessaire à la lecture — la hauteur de
la scène est réservée par les attributs `width` / `height` de l'affiche,
pas par le CSS.

**Passée de 501 à 453 lignes le 2026-08-03** (D-632) : `.tour-pied` et
`.tour-gestes`, avec leur grille à trois pistes inégales, sont partis
avec le pied de trois gestes. `.tour-source` perd son filet et sa
colonne pour devenir une légende de cadre — deux traits à 24 px l'un de
l'autre font une rayure, pas une structure.

### `css/vendor/pannellum.css`

Feuille du moteur Pannellum 2.5.7 (MIT), auto-hébergée, non modifiée.
Chargée dynamiquement par `tour360.js` au premier clic sur « Entrer dans
la visite », jamais avant.

---

## 5 · Le JavaScript

### `js/limaille.js` — 569 lignes, 22 Ko — **vague 1**

Moteur de champ de grains. **Le motif signature.** Aucune dépendance,
aucun WebGL : écriture directe dans un `ImageData`, un seul `putImageData`
par image.

| Zone |
|---|
| En-tête : le motif, et les 4 écarts assumés avec la référence |
| Utilitaires couleur (`pack` ABGR little-endian, `mix`), bruit déterministe `pseudo` — jamais `Math.random` |
| Constructeur `Limaille(canvas, opt)` |
| `compose(draw, bands)` — échantillonnage du texte, seuil alpha **170** (pas 128 : à 128 on ramasse l'anticrénelage et chaque lettre reçoit un halo), `seedPositions` et ses **quinze filets** |
| Intégration semi-implicite, ressort **critiquement amorti** (ζ = 1, aucun dépassement possible), verrou au repos à 1/3 de pixel |
| Rendu — un seul `putImageData` par image ; arrêt complet quand tous les grains sont verrouillés |

Expose `window.Limaille`.
**Ne contient pas** : le contenu du hero (c'est `hero.js`), ni aucune
logique de page.

### `js/trame.js` — 280 lignes, 12 Ko — **vague 1**

Le **passage**, et il n'y en a qu'un. Aucune dépendance, < 6 Ko servi.
Une grille de tuiles en aplat recouvre une cible **déjà peinte**, puis
chaque tuile rétrécit sur son centre. Un canvas, un `fillRect` par tuile,
zéro nœud du DOM.

| Zone |
|---|
| En-tête : la référence mesurée (`swisspixelreveal`), ce qu'on garde, ce qu'on jette, **quel verbe c'est** (V1 dont l'arête est faite de V3) |
| Amortissement `sortie(u)` et bruit **déterministe** `grain(graine, x, y)` — une graine, jamais `Math.random`, sinon deux passages successifs scintillent |
| Un passage : `sens` décide de l'axe, `graine` décide du motif |
| L'API — `APED_TRAME.degager(el, opts)` · `.couvrir(el, opts)` · `.inverse(sens)` · `.tout_arreter`. Chaque voile porte `data-passage`. |

**Ne contient pas** : la décision de *quand* passer. Ses appelants sont
`main.js` (thème , menu , panneau ),
`langue.js` (frontières et 514, panneau ) et `tour360.js`
. Il n'existe **pas dans le CSS** : aucun contenu ne dépend de lui
pour être lisible.

### `js/main.js` — 2 652 lignes, 114 Ko — **vague 1** — *s'exécute toujours*

La logique. **Aucune dépendance.** Si GSAP ne charge jamais, tout ce qui est
ici fonctionne. C'est aussi le seul fichier où vit **l'orientation**.

| Zone |
|---|
| Constantes métier : `CONTACT_EMAIL`, `FORM_ENDPOINT` (FormSubmit), `BOOKING` (jours, créneaux, préavis 24 h, horizon 42 j), `SUBJECTS` |
| **Le barème publié** — et l'explication de ce qui en a été retiré (la vraie grille de prix, qui était lisible dans les outils de développement) |
| Ressort — sert à l'odomètre du calculateur |
| **Séquence d'entrée** — ce que le script ajoute : l'**allongement** (`html.entree-attend`, ) jusqu'à `document.fonts.ready` + `#heroPlate.is-live`, plafond 2,5 s ; le **saut** ; la pose de `html.compo-hero`  et son retrait |
| **Rail des services — orientation N1.** Expose `window.APED_SVC` |
| Cadres de projet — le site client ne défile pas tout seul |
| Parcours — compteur d'étape |
| **Le cadeau** — quand il paraît, la fréquence, et l'interrupteur `sessionStorage aped-sans-popup` réservé aux instruments |
| **Thème** — jamais animé au chargement. La bascule passe par la **trame** , plus par `startViewTransition` |
| Menu plein écran + sa réciproque par trame |
| Panneau « Ajuster en détail » et les autres replis du même type |
| Verrou de défilement, largeur de barre compensée |
| Modales — piège de focus, retour au déclencheur, Échap |
| Validation — focus sur le premier champ en erreur |
| Envoi |
| Calendrier |
| Formulaire projet, 7 étapes |
| Estimateur, 8 étapes |
| Calculateur — le montant alimente aussi l'index de gauche |
| Aperçu des secteurs — **c'est ici que le `<template>` est posé dans le DOM** |
| **LE CRAN — V4 du langage de mouvement, et il vit ICI.** Expose `window.APED_ROULER` . C'est le G2 des douze frontières, celui qui ne tombe à aucun palier. |
| **Index collant** — `IntersectionObserver`, jamais d'écouteur `scroll` |
| **La douzième frontière — la clôture** |

**Ne contient pas** : aucune animation qui dépend de GSAP, aucune
chorégraphie de défilement. Inversement, **rien de ce qui est ici ne doit
migrer vers `motion.js` ou `langue.js`** : ces deux-là s'arrêtent net sous
mouvement réduit.

### `js/hero.js` — 455 lignes, 19 Ko — **vague 1**, après `limaille.js`

La plaque du hero. Deux mots, en permanence : « APED » très gros, « Agence »
dessous. Aucun carrousel, aucun morph.

| Zone |
|---|
| **Politique d'accent** — le minium est la matière, pas un souligneur. `RATIOS.masse = { grand: 0.12, petit: 0.96 }` |
| Composition, mesurée |
| Hauteur réellement occupée, rotation comprise |
| Cycle de vie — pose `#heroPlate.is-live`, que la séquence d'entrée attend |
| Recoloration à la bascule de thème |

Sort immédiatement si `window.Limaille` est absent.

### `js/motion.js` — 348 lignes, 13 Ko — **vague 2**, après GSAP

Les chorégraphies liées au défilement. Chaque animation porte son **niveau
N1 / N2 / N3** en commentaire. `transform` et `opacity` uniquement, aucun
écouteur `scroll`.

| Animation |
|---|
| **Sortie anticipée** : sans GSAP ou sous mouvement réduit → `html.reduced-motion`, tous les `[data-count]` prennent leur valeur finale, et le fichier s'arrête. |
| 1. Entrée du hero |
| 2. Compression du titre |
| **3. Filets de section — N1 + N2.** C'est le **G1** des frontières : le filet se soude dès `top 97%`, il annonce la section avant qu'elle arrive |
| 4. Montée des blocs |
| 5. Compteurs de la bande de spécification |
| **6. Le cadre de la visite** — V1 · DÉGAGER, sens bas (le rail des services, qui portait ce numéro, est parti le 2026-07-30) |
| 8. Ligne du processus · 8bis. Les 4 composants du parcours |
| 9. Piste du comparatif · 9bis. Le schéma de l'écart |
| 10. Titres de section |
| 11. Blocs qui se reprennent |
| 12. Frise du processus, défilement latéral |
| 13. Programme de référence · 13bis. « Ce qui arrive après » |
| 14. Recalcul après chargement des images |

Les blocs **7** (défilement interne des captures de projet), **12bis**
(les 4 preuves de l'agence) et **12ter** (les 3 faits de l'agence)
n'existent plus ; leurs numéros ne sont pas réattribués, pour la même
raison que le trou du bloc `20.` d'`app.css`.

**Ne contient pas** : l'orientation (elle est dans `main.js`), les quatre
verbes (ils sont dans `langue.js`), et **aucun scrub d'opacité sur un
élément qui porte du texte** — interdit, une animation scrubbée n'a pas
d'état de repos.

### `js/langue.js` — 1 546 lignes, 71 Ko — **vague 2**, après `motion.js`

**Les quatre verbes**, et le **budget de dégradation**. S'arrête net
 sans GSAP ou sous mouvement réduit.

| Zone |
|---|
| En-tête : V1 DÉGAGER · V2 S'ALIGNER · V3 SOUDER · V4 CRAN, et la règle d'admission |
| **Le budget de dégradation** — pose `root.setAttribute("data-palier", …)` et 140 ; palier 1 statique (largeur < 64em · `pointer: coarse` · `hardwareConcurrency` ≤ 4 · `deviceMemory` ≤ 4), palier 2 mesuré |
| La mesure : on n'échantillonne **que** pendant un défilement réel — médiane sur 90 images, seuil 50 i/s |
| Le travail préparatoire (découpage de texte) se fait pendant les **temps morts** |
| 0. FLIP maison |
| **0bis. Les douze frontières** — franchissement lu à l'intersection, la **trame**, le nom comme libellé toujours gauche→droite, palier 2 |
| 1. Les lettres — V4 · CRAN, sur tous les boutons. Décalage suivant la **position**, pas l'indice |
| 2. Les mots — V1 · DÉGAGER, sur les chapôs (le poste le plus cher, il tombe au palier 1) |
| 3. DÉGAGER — révélation par masque net. Le voile de grains a été **coupé** |
| 4. SOUDER — les filets de liaison |
| 5. Les secteurs — 5a recomposition, un seul chemin de code · 5b la pile · 5c parallaxe à la pointe, bornée, pointeur fin seul |
| 6. Vitesses différenciées — N3, bureau seulement |
| 7. La FAQ — V2, et c'est du FLIP |
| 8. L'étiquette de la pointe — V4 |
| 9. Les modales — V1 |
| 10. Les sept plaques d'atelier — V2 · S'ALIGNER (la dérive ; le palier 1 la retire, l'inclinaison reste) |
| 11. Recalcul |

**Ne contient pas** : l'orientation, le cran des frontières (G2, dans
`main.js`), la matière (`limaille.js`), le mécanisme de passage
(`trame.js`).

### `js/pointe.js` — 157 lignes, 5,6 Ko — **vague 2**

La pointe : le réticule qui **augmente** le curseur système.
Quatre contraintes tenues : `(pointer: fine)` seulement, vérifié à l'init
**et suivi en direct** ; abandon définitif au premier `touchstart` ;
désactivée sous `prefers-reduced-motion`, suivi en direct ; **aucun
`cursor: none` nulle part** — le curseur natif reste la source de vérité.

### `js/tour360.js` — 543 lignes, 21 Ko — **vague 2**

Visite virtuelle 360, module autonome. Moteur Pannellum 2.5.7 (MIT)
auto-hébergé.

| Zone |
|---|
| En-tête : règle de charge (rien ne part avant le clic), progressif 2K → 4K, accessibilité |
| Le plan — repère 240 × 140, `PLAN_SVG`  ; les rectangles et les murs sortent des **mêmes** coordonnées |
| `PIECES` (salon, chambre, terrasse — Lythwood Lodge), `HFOV_MIN` 55 / `HFOV_MAX` 118 |
| Utilitaires + `charger(url, css)` : chargement d'une ressource une seule fois pour toute la page |
| `demarrer(bloc, index)` — la scène, les points de passage rééquipés un par un (`tabindex`, `role`, nom accessible, clavier — Pannellum les fabrique en `div` nus), et le passage d'une pièce à l'autre **par la trame** |
| `init` |

**Ne déclenche aucun téléchargement au chargement de la page** : ni le
moteur, ni les panoramas. Avant le clic, la section ne pèse que son affiche
plate en `loading="lazy"`, donc jamais candidate au LCP.

### `js/vendor/`

| Fichier | Rôle |
|---|---|
| `gsap.min.js` (72 Ko) | GSAP 3, auto-hébergé. Vague 2. |
| `ScrollTrigger.min.js` (43 Ko) | Plugin ScrollTrigger. Vague 2, après GSAP. |
| `pannellum.js` (56 Ko) | Pannellum 2.5.7 (MIT). **Pas dans les vagues** : chargé par `tour360.js` au premier clic sur « Entrer dans la visite ». |

Aucun CDN. Zéro requête tierce sur tout le site.

---

## 6 · `tools/` — la mesure

Scripts Playwright autonomes, lancés avec `node` depuis la racine.
`node tools/serve.mjs 8099` d'abord. Ils rendent des chiffres, pas des
impressions.

### Serveur et utilitaires

| Outil | Ce qu'il rend comme preuve |
|---|---|
| `serve.mjs` | Serveur statique minimal, zéro dépendance. `node tools/serve.mjs [port]`. |
| `cine.mjs` | **Bibliothèque, pas un test.** `filmer / planche / cadence / plancheFenetre` via `Page.startScreencast` du protocole DevTools : une image à chaque peinture, horodatée. Existe parce que `page.screenshot` coûte 120 à 950 ms et **rate** une transition. |
| `vue.mjs` | Une capture ciblée d'une section : `node tools/vue.mjs #contact [largeur] [thème] [décalage]`. |
| `plaques.mjs <ancre[,ancre…]> <nom> [--reduit] [--base=URL]` | **Ajouté le 2026-08-03.** Planches d'une ou plusieurs sections, 5 largeurs × 2 thèmes, et le **RELIEF** (écart-type de luminance) de chaque image — c'est lui qui dit si quelque chose est peint, pas le fait qu'un fichier existe. **Il photographie en mouvement PLEIN par défaut, et c'est sa raison d'être** : `html.sas-ok` se décide dans le `<head>` avec `!prefers-reduced-motion`, donc en mouvement réduit la géométrie des sas **n'existe pas**. 110 planches du dépôt ont déclaré saine une section entièrement noire pour cette seule raison. `--reduit` reste là pour comparer. Pare aussi les pièges 44, 67 et 80 : traverse toute la page une fois, puis pilote au pas en relisant la position. |
| `sas-sequence.mjs [nom] [--n=N] [--zone=a,b] [--base=URL]` | **Ajouté le 2026-08-03.** La séquence du sas de descente — relief de chaque image **et écart de pixels entre deux consécutives**, ce qu'exige la règle B. Écrit pour répondre à « la forge se voit-elle encore à 150vh », c'est-à-dire après que le point d'épinglage est passé de 0,42 à 0,67. `--zone` resserre sur une part de la course. |

### Preuves de comportement

| Outil | Ce qu'il rend comme preuve |
|---|---|
| `accueil-check.mjs` | Sept relevés du chantier 01 : contenu mot pour mot des 7 plaques + chasse aux énoncés retirés · composition du hero image par image · survol des 2 CTA avec le contraste à chaque image · lisibilité à l'arrêt (contraste, angle réel, boîte réelle) · dérive bornée · i/s + LCP + CLS · débordement. |
| `plaques-vie.mjs` | **La boucle de vie des huit plaques, en dix relevés — un par promesse du brief.** Existe (nom, durée, retard, état par plaque) · **visible** : six captures d'un cadre **relevé dans la page** + écarts de pixels + déplacement réel, mesuré **corps moins coque** pour isoler la boucle de la dérive au défilement et de la recomposition du document · survol : une plaque survolée, huit arrêtées · **franc** : échantillonné image par image après l'entrée du curseur · reprise · hors-écran · **onglet caché en DEUX verdicts séparés** — la plateforme (non prouvable sous Playwright, et le rapport le dit) et le branchement (prouvé au pixel) · lisible : texte réellement recouvert par `elementFromPoint`, jamais par des englobants d'éléments tournés, contraste à 12 phases irrégulières · i/s pendant que la boucle tourne **et** qu'on défile · mouvement réduit. |
| `formulaires-e2e.mjs` | **La chaîne des six formulaires, sans rien intercepter.** L'état réel du service d'envoi, relevé et affiché en tête — donc le jour où l'activation est faite, le rapport le dit sans qu'une ligne change. Puis, par formulaire : l'échec est-il **détecté** (un `200` porteur de `success:"false"` ne doit jamais afficher « demande reçue ») et a-t-il une **sortie qui livre** — le repli `mailto:` paraît, il est visible, il a le focus, et **les réponses tapées se retrouvent dans le corps du message décodé**. Plus le cadeau : les deux guides obtenus **sans donner de courriel**, les deux PDF répondent 200, et le champ devenu facultatif **juge encore** ce qu'on y met. |
| `entree-check.mjs` | Les **huit garanties** de la séquence d'entrée, chacune par son scénario réel — dont l'allongement, prouvé en coupant la promesse des polices. Réécrit parce que l'ancienne version verrouillait le défaut. |
| `frontieres-check.mjs` | Les douze frontières, avant / pendant / après, avec l'état relevé de chacune. Traverse la page **entièrement** avant de mesurer (`content-visibility: auto`). |
| `trame-check.mjs` | Six points : le voile existe pendant et **n'existe plus après** · zéro `.trame-voile` résiduel · le texte n'est pas rogné et le passage tient le budget · la bascule de thème marche avec ET sans moteur et sous mouvement réduit · la trame est absente au palier 2 · zéro erreur console. |
| `palier-check.mjs` | Les **trois paliers par leur déclencheur réel** — palier 1 en trois cas indépendants (écran étroit, pointeur grossier, `navigator` truqué) ; **palier 2 en bridant vraiment le processeur** via CDP. Vérifie aussi que le numéro de seuil reste **juste** aux trois paliers. |
| `langue-check.mjs` | Zéro erreur console et zéro requête tierce · les 4 verbes existent dans le document rendu · le texte accessible **identique au caractère près** après découpage · i/s pendant la traversée · aucun élément à opacité nulle après la traversée. |
| `etats-check.mjs` | Les onze micro-états un par un : survol, focus, appui, désactivé, chargement, vide, erreur, succès, modale, bascule de thème, bourgeon, question dépliée. |
| `services-check.mjs` | Traverse la section épinglée quart par quart · le compteur, le nom et la jauge **suivent** vraiment · la scène tient dans un écran · accès clavier (focus sur la piste, flèches) · i/s. |
| `projets-check.mjs` | Le site client **ne défile pas tout seul**, et défile quand on le demande. |
| `secteurs-check.mjs` | Les treize aperçus, un par un, en capture. |
| `secteur-morph-check.mjs` | La recomposition se produit **et se termine nette au pixel** — transforms échantillonnées image par image **dans la page** (440 ms, trop court pour une capture). |
| `proto-secteurs-check.mjs` | Sur le prototype : une capture par maquette × thème × largeur · le contraste effectif de **chaque nœud de texte**, fond composite calculé en remontant les ancêtres · tout débordement · toute erreur console. |
| `estimateur-check.mjs` | Le calcul rend une fourchette pour les 108 combinaisons **et** on joue le concurrent : combien de valeurs distinctes sortent des 108 ? Si le nombre approche 108, la grille est reconstituable. |
| `estimateur-ui.mjs` | Le parcours réel dans l'interface : six questions, un courriel, et ce qui s'affiche vraiment — y compris « sur devis », où un plafond inventé serait un chiffre faux affiché avec aplomb. |
| `cadeau-check.mjs` | **Sept scénarios** : il paraît seul à chaque chargement vers 11 s · plus tôt sur engagement fort · **jamais pendant une saisie** · etc. Réécrit : l'ancienne version prouvait le défaut. |
| `cadeau-scene.mjs` | L'entrée du popup est une **arête franche** haut→bas et pas un fondu, la sortie en est la réciproque exacte — `clip-path` relevé **dans la page** à chaque image. |
| `cadeau-e2e.mjs` | Le parcours complet : ouvre, télécharge les deux PDF, **compte leurs pages**, soumet un courriel et rapporte la réponse du service mot pour mot. `--envoi-reel` fait vraiment partir le courriel. |
| `tour-verif.mjs` | Le **poids avant clic** (seule l'affiche doit partir) · le poids après clic · une capture de chaque pièce en passant par les points de passage puis par le plan · les erreurs console sur toute la durée. |
| `hero-check.mjs` | La plaque du hero est-elle entière, à quatre combinaisons largeur × thème. |
| `titres.mjs` | Les titres de section : coupés ou pas, à mi-animation **et** à la fin. |

### Contraste, thème, débordement

| Outil | Ce qu'il rend comme preuve |
|---|---|
| `theme-check.mjs` | Chaque section dans les deux thèmes côte à côte · le pixel de fond du canvas du hero suit-il la surface · le contraste de chaque texte, avec la liste des échecs AA. La bascule se fait par le **vrai bouton**. |
| `contraste-min.mjs` | Où se trouve la **marge la plus mince**, section par section et par thème — le chiffre qui basculera en premier quand on retouche une couleur. |
| `contraste-survol.mjs` | Le contraste **pendant** la transition de survol, image par image, aller ET retour. `theme-check` ne mesure que des états posés. A trouvé trois défauts réels. |
| `contraste-arret.mjs` | Le contraste **à l'arrêt**, à N positions de défilement (40 par défaut), couleur effective opacité comprise contre le fond opaque le plus proche. C'est lui qui attrape un `scrub` laissant du texte à mi-opacité. |
| `deborde.mjs` | Le contenu **coupé** par un `overflow: hidden/auto`, à 9 largeurs. Un `overflow: visible` qui dépasse n'est pas un défaut. |
| `debord.mjs` | Qui déborde horizontalement, à 5 largeurs. Version courte et ancienne. |
| `debord404.mjs` | Le même contrôle sur `404.html`, à 4 viewports, erreurs de page comprises. |
| `prix-check.mjs` | **Deux passes** : tout montant en dollars dans le **code source** (fichier + ligne), puis dans le **texte rendu**, modales ouvertes comprises. Trois familles autorisées, déclarées dans l'outil plutôt que devinées. |

### Performance

| Outil | Ce qu'il rend comme preuve |
|---|---|
| `perf-probe.mjs` | LCP médian et pire tâche longue, avec et sans rideau. |
| `cls-source.mjs` | **Attribue** chaque `layout-shift` à l'élément qui l'a causé. Un CLS sans la source ne sert à rien. |
| `tache-longue.mjs` | D'où vient la tâche longue — un poste retiré à la fois **en vol** par interception de la réponse : `sans-template`, `sans-modales`, `sans-css`, `os-a-la-moelle`. Aucun fichier modifié. |
| `tache-traversee.mjs` | Le **total** de temps passé en tâches longues pendant une traversée, et leur **nombre**, en différences appariées. Existe parce qu'un maximum est la statistique la plus instable qui soit. |
| `traversee-check.mjs` | Une planche de 24 vues du haut au pied **et** les i/s pendant ce défilement : médiane, 5ᵉ centile, nombre d'images > 20 ms. Jamais de maximum. |
| `ab-phase8.mjs` | A/B contre une copie de la version d'avant sur un second port, passes alternées. Rend LCP médian, pire tâche au chargement, CLS, i/s en traversée. |
| `ab-accueil.mjs` | A/B de l'accueil (8098 = avant, 8099 = après), **passes alternées** et **médiane des différences** — la dérive machine s'annule d'elle-même. |
| `audit.mjs` | Audit visuel + mesures : PNG + rapport JSON. |
| `verif.mjs` | Vérification finale : clavier, perf, orientation, contrastes, console, débordement. |

### Fabrication (ne tournent jamais chez le visiteur)

| Outil | Ce qu'il produit |
|---|---|
| `css-critique.mjs` | **Régénère `critique.css` et `differe.css`** depuis `app.css`. Demande au navigateur, page chargée, quelles règles ont une cible visible. |
| `cascade-check.mjs` | La preuve que le découpage n'a rien cassé : **44 propriétés calculées sur chaque élément**, dans les deux thèmes, feuille découpée contre feuille entière. Le contrôle est fabriqué **en vol**. Doit rendre 0 écart. |
| `pdf.mjs` | Fabrique les deux PDF depuis `documents/src/*.html`, sans marge ni en-tête de navigateur, et rend le **nombre de pages réel** — le seul chiffre qu'on a le droit d'écrire dans le pied du site. |
| `couvertures.mjs` | `images/doc-automatisation.webp` et `images/doc-ia.webp`, 560 px, qualité 82 — la **vraie** première page du PDF, rendue depuis sa source. Ne peut pas se désynchroniser. |
| `tour-images.mjs` | Les trois tailles de panorama en webp attendues par `tour360.js`. **N'écrase jamais** un fichier existant. |
| `secteurs-photos.mjs` | Les photographies des aperçus de secteur dans `images/secteurs/`. **N'écrase jamais.** |
| `tour-angles.mjs` | Planche de vues rectilignes par lacet, pour choisir les points de passage et vérifier la couture (lacet 180). Convention de lacet : celle de Pannellum. |
| `apercu-panos.mjs` | Planche de **décision** : vues rectilignes (projection gnomonique, la même que le viewer), deux cadrages par pièce. N'écrit rien dans `images/`. |

### Captures et études de référence

| Outil | Ce qu'il produit |
|---|---|
| `phase8-captures.mjs` | Avant/après sur les moments changés + début/milieu/fin de chaque animation. Horloge **étirée d'un facteur 6** pour les survols. |
| `cascade-captures.mjs` | 230 ms contre 520 ms : horloge étirée d'un facteur 8, **les deux variantes du même facteur**, échantillonnées aux **mêmes instants absolus**. |
| `passages-cine.mjs` | Nos passages filmés au protocole DevTools. `[quoi]` = theme · frontieres · modale · secteur · menu · tout. |
| `refs-structure.mjs` | Passe A : **identifie ce qu'il faut mesurer** sur les six références externes. Ne mesure rien. |
| `refs-mesure.mjs` | Passe B : de chaque mouvement, quatre chiffres et pas un adjectif — durée réelle, décalage entre voisins, dépassement, courbe (comparée à un catalogue de cubic-bezier). |
| `refs-accueil.mjs` | Les deux références du chantier 01 (`fullstack-studio.webflow.io`, `fancy-toggle-753251.framer.app`) : structure, durées, décalages, courbes. |
| `refs-reveal.mjs` · `refs-reveal2.mjs` · `refs-reveal3.mjs` | Sondes successives sur fullstack-studio : blocs de texte et état avant arrivée → opacité = f(scrollY) → **la structure trouvée** (`.text-highlight_rect` en `position: absolute` : un rectangle qui découvre, pas un fondu), puis chiffrage. |
| `refs-toggle.mjs` | La mécanique du toggle de référence : `transition: translate 0.3s ease-out` sur un bloc 141 × 33, survol **et** clic. |

### Fichiers non-`.mjs` de `tools/`

| Fichier | Rôle |
|---|---|
| `proto-secteurs.html` · `proto-secteurs.css` | **Périmé depuis D-681.** Le prototype des treize maquettes dessinées, dont douze ont été retirées le 2026-08-01. Ne décrit plus rien de ce qui est servi. |
| `_captures-*` · `_planches` · `_refs` · `_nous` | Sorties de mesure. **Toutes ignorées par git.** |

---

## 7 · Documentation

### Vivants — à la racine

| Fichier | Quand le lire |
|---|---|
| **`CLAUDE.md`** | toujours : c'est l'aiguilleur. Les interdits, les seuils, les 4 verbes, les 85 erreurs déjà commises, et la table « si tu travailles sur X, lis Y » |
| **`SECTIONS.md`** | une demande nomme une section. **Seul document du dépôt qui porte des numéros de ligne**, et ils sont générés par `node tools/plages.mjs` |
| **`ARCHITECTURE.md`** | ce fichier. Tu sais quoi changer, pas où |
| **`ANIMATIONS.md`** | avant de toucher à un mouvement. Une ligne par animation, avec son verbe et son verrou |
| **`DECISIONS.md`** | avant de renverser un choix. Plus l'index de `decisions/`, un fichier par fichier source |
| **`MESURES.md`** | avant d'annoncer un chiffre, ou pour choisir un outil |
| **`PIEGES.md`** | une mesure rend un verdict surprenant. 85 faux verdicts déjà payés |
| **`RESERVES.md`** | avant d'écrire « vérifié » |
| **`DESIGN-STACK.md`** | quels skills charger, et lesquels sont hors périmètre |

### `decisions/` — le pourquoi du code

Un fichier par fichier source, 566 entrées. Chaque entrée porte un
identifiant `D-nnn` qui figure **aussi dans le code**, sur une ligne :
`grep D-042` trouve les deux bouts. Ne se lit jamais en entier.

### `archives/rapports/` — l'historique

| Fichier | Ce qu'il garde |
|---|---|
| `archives/rapports/CHANTIER-SERVICES-REALISATIONS.md` | 2026-07-30 après-midi : le retrait des huit plaques, la piste collante (dont **le défaut de peinture qu'aucune sonde du DOM ne voyait**), les trois avant/après en markup, le registre des marqueurs de 2008-2012 avec leurs captures Wayback, 13 décisions |
| `archives/rapports/CHANTIER-SERVICES.md` | 2026-07-30 matin. **Remplacé en partie par le précédent** |
| `archives/rapports/AUDIT-VERACITE.md` | les 36 affirmations fausses ou invérifiables du 2026-07-29, et le traitement de chacune |
| `archives/rapports/DECISIONS-NUIT.md` | les 31 arbitrages pris sans le propriétaire dans la nuit du 29 au 30 |
| `archives/rapports/RECHERCHE-ACCUEIL.md` | les deux références mesurées dans un vrai navigateur, et l'état de l'art, en chiffres |
| `archives/rapports/PHASE-8.md` | le langage de mouvement complet : 41 techniques, les 4 moments, l'inventaire |
| `archives/rapports/PHASE-9.md` | séquence d'entrée, table des douze frontières et l'argument de chacune, le cadeau |
| `archives/rapports/PHASE-10.md` | les passages : la trame, son verbe, l'inventaire, l'échelon de palier ajouté |
| `archives/rapports/PHASE-6.md` · `archives/rapports/PHASE-7.md` | les 8 points du client et 17 défauts · les douze chantiers |
| `archives/rapports/REFONTE-CHECKLIST.md` | journal des phases 4 et 5. Deux lignes y sont périmées, signalées dans le fichier |
| `archives/rapports/AUDIT-150.md` | audit par « auditeur externe hostile » : ce qu'il a trouvé que moi non |
| `archives/rapports/SPEC-VISITE-360.md` | spécification de dépôt à destination du client. Le pipeline est construit et testé |

### `archives/outils-perimes/`

`services-check.mjs`, `projets-check.mjs`, `plaques-vie.mjs`,
`plaques-debord.mjs` — quatre outils dont **aucune cible n'existe plus**.
Ils passaient au vert sur du vide : le piège 17.

---

## 8 · Le reste

| Fichier / dossier | Rôle |
|---|---|
| **`archives/`** | **Ajouté le 2026-07-30.** Ce qui a été retiré du site, avec l'argument et les mesures. **Rien n'y est supprimé : tout y est recollable.** Cinq entrées, chacune avec son `README.md` : `2026-07-30-plaques-accueil/` (markup, CSS, JS, et le registre des huit affirmations), `2026-07-30-services-images/` (les 4 `.webp` **et `svc-images.mjs`, qui porte leur licence** — une provenance ne survit pas dans un binaire), `2026-07-30-projets-images/` (les 5 `real-*.webp` sans licence, l'ancienne section 03, et les trois blocs de JS morts), **`2026-08-01-sites-longs/`** (les neuf pages longues de secteur retirées au chantier du premier écran, et la liste de ce qui reste en service), `rapports/` (les rapports de phases closes) et `outils-perimes/` (dont `refs-2026-07/`, les 14 sondes d'un seul usage). |
| **`404.html`** (159 lignes) | Page introuvable, `noindex`. **Elle charge `css/app.css` en entier**, pas le couple critique/différé : trois `<link>` en tête (`tokens`, `base`, `app`). Même script en ligne de thème que `index.html`, mais **sans** la décision de séquence d'entrée. Contient l'index complet des **11** sections en liens `index.html#…`, avec une ligne « déraillée ». La ligne `09 · Agence` en est partie le 2026-08-03 : une 404 qui renvoie vers une ancre morte est une 404 qui en fabrique une seconde. Son style vit dans `css/app.css` § 25 . |
| **`package.json`** | `devDependencies` uniquement : `playwright`, `gsap`, `puppeteer-core`, `shadcn`, `@tabler/icons`. **Aucune dépendance de production, aucun script de build déclaré.** GSAP est copié dans `js/vendor/`, il n'est pas résolu depuis `node_modules` à l'exécution. Les icônes Tabler sont la source du sprite inline. |
| **`components.json`** | Config shadcn. Cible un projet **React + Tailwind** (`css/styles.css`, alias `components/ui`) qui **n'existe pas ici**. Sert uniquement à donner au MCP `shadcn` la liste des registries : `@magic-ui`, `@aceternity`, `@kokonutui`, `@kibo-ui`. `shadcn add` n'écrit pas de code utilisable sur ce site vanilla — le MCP sert à **chercher et lire**, puis à porter à la main. |
| **`.mcp.json`** | Un seul serveur, au niveau projet : `shadcn` via `npx shadcn@latest mcp`. Le serveur `playwright` est configuré au niveau utilisateur, pas ici. |
| `.gitignore` | Ignore `node_modules/`, **toutes** les sorties de mesure (`refonte-captures/`, `tools/_captures-*`, `tools/_planches`, `tools/_refs`, `tools/_nous`, `8099/`, `*.trace.json`), les fichiers système et les dossiers d'éditeur. |
| `package-lock.json` | Verrou npm des devDependencies. |
| `documents/` | Les deux PDF livrés (`aped-automatisation.pdf` 42 p., `aped-ia-croissance.pdf` 49 p.), leur **source HTML** dans `documents/src/` + `print.css`, et `rapport-pdf.json` — le relevé rendu par `tools/pdf.mjs` (pages, Ko, pages qui débordent, erreurs). |
| `fonts/` | Six `.woff2` auto-hébergés pour **le site APED** : Archivo, Chivo, Martian Mono, chacun en `latin` et `latin-ext`. Déclarés dans `css/tokens.css`, préchargés dans `<head>`. Aucune requête tierce. **`fonts/demos/` est un monde à part** : 66 fichiers, 20 familles SIL OFL, réservés aux douze écrans de secteur — le site APED n'en charge aucun (§ 10). |
| `images/` | Favicon SVG, `apple-touch-icon`, `og.png`, sprite `icons.svg`, logos, 5 photos de réalisations, les couvertures de PDF, `images/secteurs/` (les 4 aperçus × hero + vignettes), `images/realisations/` (les captures qui alimentent les aperçus du panneau) et `images/tour/` (les panoramas 2K/4K + affiche). **`images/secteurs-sites/` (8,3 Mo) appartient aux douze écrans de secteur**, licences dans son `_licences.json` (§ 10). Les sous-dossiers `_retire/` et `_ancien/` sont des archives non référencées. |
| `logo/` | Deux PNG de logo (`LOGO_APED.png`, `LOGO_APED_NOM.png`). Non référencés par le site rendu — le monogramme est un tracé SVG inline dans `index.html`. *À vérifier si on veut les supprimer.* |

---

## 9 · Points à surveiller, relevés en dressant cette carte

1. **`<footer class="footer">`  est à l'intérieur de
 `<main class="shell">` .** Un `<footer>` descendant de
 `<main>` perd son rôle de repère `contentinfo` dans l'arbre
 d'accessibilité. À confirmer avec l'arbre a11y de Playwright avant de
 déplacer quoi que ce soit — le seuil du pied  est juste
 au-dessus et sortir le `<footer>` déplacerait aussi la treizième
 frontière.

2. **`404.html` charge `app.css` entier alors qu'`index.html` charge le
 couple découpé.** Ce n'est pas forcément un défaut (la 404 n'a pas de
 budget de LCP), mais ça veut dire que la 404 est le seul endroit du
 dépôt où `app.css` est servi tel quel — et donc le seul endroit qui ne
 régresserait pas si `css-critique.mjs` cassait quelque chose.

3. **`components.json` décrit un projet qui n'existe pas.** Les chemins
 (`css/styles.css`, `components/ui`, `js/utils`, `js/lib`, `js/hooks`)
 ne correspondent à aucun fichier du dépôt. C'est volontaire — le fichier
 ne sert qu'à alimenter le MCP en registries — mais un outil qui le lit
 au pied de la lettre se trompera.

---

## AJOUTÉ LE 2026-07-31 — `js/sas.js` ET LES TROIS SAS

**`js/sas.js`** (~250 l.) — l'orchestre des trois sas de l'arc de
luminance. Vague 2, chargé APRÈS ScrollTrigger et AVANT `motion.js`
et `langue.js` — l'ordre est l'argument : il retire le `data-verbe`
des seuils absorbés avant que `langue.js` ne les lise (D-576). Ce
qu'il ne contient PAS : la décision d'activer (elle vit dans le
`<head>`, `html.sas-ok`, D-581), les hauteurs de piste (CSS critique,
D-582), l'orientation (le cran G2 reste dans `main.js`).

**Le markup** : `div.sas[data-sas="descente|remontee|cloture"]`, hors
des sections, portant le seuil de sa frontière. Descente et clôture :
`.sas-piste > .sas-scene` collante ; remontée : calque sans piste
(D-568). Styles : `app.css § 1ter`, préfixe `sas-` dans la liste
CRITIQUES de `css-critique.mjs`.

**Ce que le 2026-08-03 y a changé** — `decisions/` D-629 à D-631 :

- **le volet de la remontée vit dans `div.sas-cache`**, qui porte
  `overflow: hidden` et le `z-index`. Le volet n'est plus qu'un aplat
  en `inset: 0` à l'intérieur. Nu, il peignait 1 193 px d'encre
  **par-dessus la section qui précède** dans trois états sur quatre —
  repos CSS, GSAP absent, escalade de palier. Un `top: 0` suivi d'un
  `translateY(-102%)` ne sort pas du document, il remonte dedans ;
- **la piste de la descente passe de 240vh à 150vh**, et les bornes de
  la chorégraphie ne sont plus écrites en dur : `sas.js` déduit le
  point d'épinglage de `innerHeight / hauteur de piste` dans
  `onRefresh`, puis raisonne en progression **épinglée** ;
- **`.sas-mot` n'a plus d'état de départ dans le CSS** : il est visible
  au repos, et c'est `.sas-actif` — posée par `armer()` — qui le
  retire jusqu'au CRAN.

**La chambre noire** : `#visite` porte les jetons du thème opposé
(D-572) — aucun nouveau couple de couleurs n'existe dans le projet.

**`main.js` a gagné deux blocs** : le repérage des seuils par
`data-vers` (D-578) et la re-visée des ancres (D-583) — le défaut
qu'elle corrige est antérieur au chantier et sa cause (`content-
visibility`) reste ouverte dans `RESERVES.md`.

---

## 10 · `demos-secteurs/` — LES DOUZE PREMIERS ÉCRANS

**Ajouté le 2026-08-01.** Ce dossier n'était mentionné **nulle part**
dans cette carte alors qu'il pesait 596 Ko et qu'il alimentait la
section 04. Corrigé ici.

### Ce que c'est, en une phrase

Douze métiers, **un seul écran chacun** — le premier écran, arrêté,
photographié à 1440 × 900 px et réduit dans le cadre du panneau de la
section Secteurs. **Ce ne sont pas des sites.** La refonte du
2026-08-01 a retiré neuf pages longues qui répondaient à la mauvaise
question ; elles sont dans `archives/2026-08-01-sites-longs/`.

### La carte du dossier

| Chemin | Rôle | Ce qu'il ne contient PAS |
|---|---|---|
| `demos-secteurs/<clé>/index.html` | **Un fichier par métier, autonome.** Tout le style dans un `<style>` en ligne, le script — s'il y en a — dans un `<script>` en ligne ou depuis `../../js/vendor/` | Aucune feuille partagée, aucun gabarit, **aucun morceau de l'identité d'APED** |
| `demos-secteurs/STANDARD.md` | **La loi.** La règle du côte-à-côte, les quatre références, l'échelle typographique, le mouvement autorisé, les photos, ce qui ne s'écrit jamais, et la chaîne dans l'ordre | Les décisions par métier |
| `demos-secteurs/plans/<clé>.md` | **Un plan par métier** : les trois références mondiales relevées, ce qu'on leur prend, ce qu'on écarte, puis la direction artistique et le contenu exact, prêt à coller | Du code |
| `demos-secteurs/DIRECTIONS.md` | Les douze directions artistiques de la **première** fournée. Matière première des plans, pas verdict | Les relevés de références — la première fournée n'en avait aucun, et ça se voyait |

### Les ressources partagées, et elles sont les seules

| | Où | Qui la fabrique |
|---|---|---|
| **Polices** | `fonts/demos/*.woff2` + `_licences.json` + `_declarations.css` | `tools/polices-demos.mjs` — 20 familles, toutes SIL OFL 1.1 |
| **Photographies** | `images/secteurs-sites/` + `_licences.json` | `tools/secteurs-sites-photos.mjs` — le registre `TIRAGES` porte la licence de chaque fichier |
| **GSAP** | `js/vendor/gsap.min.js`, `ScrollTrigger.min.js` | Copiés depuis `node_modules`. **Auto-hébergés, jamais un CDN** |

### Les outils de ce dossier

| Outil | Ce qu'il fait |
|---|---|
| `tools/refs-galerie.mjs <url galerie> <n>` | Relève les `n` premiers sites d'une galerie (Awwwards, SiteInspire) |
| `tools/refs-releve.mjs <url> <clé> [1440]` | **Le relevé d'une référence** : `0-heros.png` le premier écran, des captures en défilant à la molette, et `releve.json` — polices, taille et interlignage du `h1`, fonds dominants, bibliothèques d'animation, hauteur de page |
| `tools/_inventaire.mjs <clé>` | Les photos disponibles pour un métier, avec leurs **dimensions réelles** — c'est ce qui alimente `width`/`height` et tient le CLS à 0 |
| `tools/demos-capture.mjs [--ecran] <clé…>` | Photographie les sites. `--ecran` = **un seul écran**, à la fenêtre d'un vrai bureau |
| `tools/demos-controle.mjs` | **Refuse toute adresse absolue hors du dépôt** — y compris `cdnjs`, `unpkg`, `jsdelivr` |
| `tools/demos-contraste.mjs` | Le contraste des palettes, à trois largeurs |
| `tools/demos-webp.mjs` | Convertit les captures en `.webp` pour `images/realisations/` |
| `tools/secteurs-markup.mjs <clé>` | Réécrit le balisage de l'aperçu dans `index.html` |
| `tools/planche-secteurs-12.mjs` | **La planche des douze**, côte à côte, même échelle — le seul outil qui rend le test du § 0 de `STANDARD.md` |

### Ce que la section 04 d'`index.html` en fait

Les aperçus vivent dans un `<template id="tplSecteurs">`, un
`div.mock[data-mock="<clé>"]` chacun, injectés dans `#mockStage` par
`js/main.js`. Le style est dans **`css/secteurs.css`**, injecté par
JavaScript après la première peinture — donc rien de nécessaire à la
lecture n'en dépend. Un `<iframe class="sec-live">` se pose
**par-dessus** la planche quand le palier le permet (D-672) : la
planche reste le poster, elle porte le texte de remplacement et tient
la géométrie.
