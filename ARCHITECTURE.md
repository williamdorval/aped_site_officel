# ARCHITECTURE — la carte des fichiers

Carte de repérage du dépôt. Pour chaque fichier : **son rôle**, **ce qu'il
contient**, et **ce qu'il ne contient pas** — cette dernière colonne est la
plus utile, parce que la moitié des erreurs sur ce projet consistent à
modifier le bon comportement dans le mauvais fichier.

Les numéros de ligne sont ceux de l'état du dépôt au 2026-07-29 (commit
`cd5c758`). Ils dérivent dès qu'on édite : traitez-les comme des repères,
pas comme des adresses.

Ce fichier ne remplace pas `CLAUDE.md` (les règles) ni les `PHASE-*.md`
(les arbitrages et les mesures). Il dit **où**, pas **pourquoi**.

---

## 1 · OÙ VAIS-JE ?

| Je veux modifier… | J'ouvre | Attention |
|---|---|---|
| **Le contenu d'une section** (texte, chiffres, libellés) | `index.html`, à la plage de la section (§ 3) | Les 13 aperçus de secteur sont dans un `<template>` (l. 1053–1452) posé par `main.js`. Les 7 plaques de l'accueil sont l. 391–520. |
| **Un style** | `css/app.css` **et rien d'autre** | Puis `node tools/css-critique.mjs` pour régénérer `critique.css` + `differe.css`, puis `node tools/cascade-check.mjs` (doit rendre 0 écart). Éditer `critique.css` ou `differe.css` = travail perdu au prochain build. |
| **Le style d'un aperçu de secteur** | `css/secteurs.css` | Feuille séparée, injectée par JS. Ne pas la fusionner dans `app.css` : elle style du contenu qui n'existe pas sans script. |
| **Le style de la visite 360** | `css/tour360.css` | Charge après `css/vendor/pannellum.css`, qu'elle corrige. |
| **Une animation de chargement** (séquence d'entrée, composition du hero) | `index.html` l. 121–210 (markup) + `css/app.css` §11b l. 1221–1612 (rideau) et l. 2086–2224 (composition du hero) + `js/main.js` l. 156–351 (allongement / saut) | Le rideau se retire par animation CSS `forwards` : il part même si aucun script ne s'exécute. Le JS ne fait qu'**allonger** et permettre de **sauter**. |
| **Une animation de scroll** | `js/motion.js` (les 14 chorégraphies numérotées) ou `js/langue.js` (les 4 verbes, les 12 frontières) | Les deux s'arrêtent net sous `prefers-reduced-motion` et exigent GSAP. Ils partent en **vague 2**. Ne jamais y mettre d'orientation. |
| **Le passage entre deux états** (frontière, thème, menu, modale, pièce de visite) | `js/trame.js` — API `APED_TRAME.degager / .couvrir / .inverse / .tout_arreter` | Un seul mécanisme, décliné. Les appelants sont dans `main.js`, `langue.js`, `tour360.js`. |
| **Un état de survol** | `css/app.css` §4 (l. 511–673) pour les boutons, l. 4700–5410 pour les micro-états V1–V4 | Mesurer avec `node tools/contraste-survol.mjs` : `theme-check` ne voit que les états posés, pas les images intermédiaires. |
| **L'orientation** (compteurs, odomètres, filet de section active, curseur du rail, cran des frontières) | **`js/main.js` uniquement** | Jamais dans `motion.js` ni `langue.js` — ils ne s'exécutent pas sous mouvement réduit. `main.js` s'exécute toujours et part en vague 1. Blocs concernés : rail l. 352–443, parcours l. 583–628, cran l. 2298–2457, index collant l. 2458–2623. |
| **Le thème clair / sombre** | `css/tokens.css` (les jetons), `js/main.js` l. 971–1100 (la bascule), `index.html` l. 62–115 (pose du thème avant le 1ᵉʳ rendu) | La bascule passe par `APED_TRAME`, plus par `startViewTransition` (qui était un fondu). Vérifier avec `node tools/theme-check.mjs`. |
| **Une modale** | `index.html` l. 2655–3272 (les 6 modales) + `js/main.js` l. 1216–1349 (focus, Échap, retour au déclencheur) + `css/app.css` §10 l. 1076–1166 | Le popup cadeau est à part : `<dialog>` natif, markup l. 2517–2654, logique `main.js` l. 629–970, style §11c l. 1613–1920. |
| **Une mesure / une preuve** | `tools/*.mjs` (§ 6) | `node tools/serve.mjs 8099` d'abord. Poser `sessionStorage aped-sans-popup=1` dans tout outil qui clique. |
| **La logique métier** (prix, formulaires, calendrier, calculateur) | `js/main.js` l. 1350–2202 | Zéro dépendance. Si GSAP ne charge jamais, tout ça fonctionne quand même. |

---

## 2 · LES DEUX VAGUES DE SCRIPTS

Le bloc en ligne de `index.html` (l. 3273–3390) injecte tout après **deux
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

## 3 · `index.html` — 3 392 lignes, 198 Ko

Page unique. Contient **tout** le contenu du site : douze sections, six
modales, le popup cadeau, le pied, et le `<template>` des treize aperçus.

### Table des matières

| Lignes | Zone |
|---|---|
| **1–116** | `<head>` — meta, OG, `theme-color` (une seule balise, sans `media`), favicon, préchargement des 3 woff2, puis **trois** feuilles sur le chemin critique : `tokens.css`, `base.css`, `critique.css`. |
| 62–115 | Script en ligne, **avant le premier rendu** : pose `html.js`, lit `localStorage aped-theme`, pose `data-theme` + la couleur de barre, pose `reduced-motion`, et **décide de la séquence d'entrée** en lisant `performance.getEntriesByType("navigation")[0].type`. |
| 117–120 | Ouverture `<body>`, lien d'évitement. |
| **121–207** | **Séquence d'entrée** `#entree` : 15 filets (`--k` = distance au filet du milieu), jauge en deux temps, compteur à crans (`.entree-cran` = fenêtre, `.entree-rouleau` = bande), cadre à 4 équerres, plaque monogramme SVG, mot de sortie. `aria-hidden`, `pointer-events: none`. |
| 208–210 | Sprite SVG des icônes, en ligne, `display: none`. Aucune requête tierce. |
| 215 | Barre de lecture `.read-progress` / `#readBar`. |
| **217–251** | `<header class="nav">` — wordmark, `.nav-links` (l. 222), bouton thème, CTA. |
| **254–278** | Menu plein écran `#menu`, `hidden` au repos. |
| **281–305** | Index collant `<aside class="rail" id="rail">` + `#railList`. |
| **307–2515** | `<main class="shell" id="contenu">`. |
| 310–389 | **01 · Hero** — `#top`. `#heroPlate` / `#heroCanvas` (l. 326–328), fiche technique `.hero-fiche` (l. 366–388). |
| 391–520 | **Les sept plaques d'atelier** — `.plaques[data-plaques]` l. 461. Coque `.plaque` + corps `.plaque-corps`. |
| 560–807 | **02 · Services** — rail horizontal épinglé. Seuil l. 564. |
| 834–964 | **03 · Projets livrés** — séquence pleine largeur. Seuil l. 838. |
| 967–1457 | **04 · Secteurs** — `#demos`. Seuil l. 971 · panier `.sec-panier` l. 1107 · **`<template id="tplSecteurs">` l. 1053–1452** (les 13 maquettes, jamais dans le DOM sans `main.js`). |
| 1461–1516 | **05 · Visite 360** — `#visite`. Seuil l. 1465. Affiche plate en `loading="lazy"` ; rien d'autre ne part avant le clic. |
| 1519–1701 | **06 · Calculateur** — `#calculateur`. Seuil l. 1523. |
| 1704–1844 | **07 · Comparatif** — `#comparatif`. Seuil l. 1708. |
| 1885–2016 | **08 · Processus** — `#processus`. Seuil l. 1889. |
| 2040–2129 | **09 · Agence** — `#apropos`. Seuil l. 2044. |
| 2155–2230 | **10 · Référence** — `#reference`. Seuil l. 2159. |
| 2233–2304 | **11 · Questions** — `#faq`. Seuil l. 2237. |
| 2335–2444 | **12 · Contact** — `#contact`. Seuil l. 2339. |
| 2451–2457 | **Seuil du pied** — `.seuil--pied`, la treizième frontière. |
| **2458–2513** | `<footer class="footer">`. ⚠️ **Il est à l'intérieur de `<main>`** (voir § 8, points à surveiller). |
| 2515 | `</main>`. |
| **2517–2654** | **Le cadeau** — `<dialog class="cadeau" id="cadeau">` l. 2570. `<dialog>` natif : piège de focus, inertie, Échap et couche supérieure gratuits. |
| **2655–3272** | **Les six modales** : `#modal-start` (2658), `#modal-booking` (2691), `#modal-project` (2777), `#modal-urgent` (2992), `#modal-refer` (3037), `#modal-estimate` (3142). Toutes en `role="dialog" aria-modal="true" hidden`. |
| **3273–3390** | **Bloc d'injection des scripts** — les deux vagues (§ 2). |

### Les treize seuils, tels qu'ils sont écrits dans le document

Chaque seuil porte `data-seuil`, `data-de`, `data-vers`, `data-dress`,
`data-verbe`, `data-sens`, et parfois `data-cible`.

| Ligne | de → vers | `dress` | `verbe` (G4) | `sens` | `cible` |
|---|---|---|---|---|---|
| 564 | 01 → 02 | **encre** | volet | bas | — |
| 838 | 02 → 03 | clair | degager | bas | `.project:first-of-type .shot` |
| 971 | 03 → 04 | clair | aligner | droite | `.sector-group` |
| 1465 | 04 → 05 | **encre** | volet | bas | — |
| 1523 | 05 → 06 | **encre** | volet | **haut** | — |
| 1708 | 06 → 07 | clair | aligner | droite | `.vs-row` |
| 1889 | 07 → 08 | clair | aligner | droite | `.parc-etape` |
| 2044 | 08 → 09 | clair | souder | droite | — |
| 2159 | 09 → 10 | clair | cran | droite | `.referral-max .num` |
| 2237 | 10 → 11 | clair | degager | droite | `.faq-item` |
| 2339 | 11 → 12 | clair | degager | bas | `.cell` |
| 2451 | 12 → 00 | **encre** | volet | bas | `.footer-mark` |

Les quatre bandes d'encre sont donc celles qui **entrent** en 02, en 05,
en 06 et dans le **pied** (`data-de="12"`). `CLAUDE.md` les désigne par
« 02, 05, 06, 12 » : le « 12 » y est le seuil qui part de 12, c'est-à-dire
celui du pied.

### Ce que `index.html` ne contient PAS

- **Aucun `<script defer>` ni `<script src>` statique.** Tout est injecté
  (l. 3273). Remettre un `defer` ramène le défaut mesuré : tâche de 222 ms
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

### `css/app.css` — 5 479 lignes, 227 Ko — **LA SOURCE UNIQUE**

Mise en page, composants, sections, micro-états, budget de dégradation.

| Lignes | Bloc |
|---|---|
| 7–41 | 1. Grille (les filets verticaux bordent toujours une colonne pleine) |
| 42–287 | 1bis. **Les douze seuils** — seuil clair (144), seuil d'encre (151), G4 soudure longue (185), palier 2 (210), `content-visibility: auto` sur les sections hors écran (219–287) |
| 288–332 | 2. En-tête de section |
| 333–510 | 3. Navigation |
| 511–673 | 4. Boutons |
| 674–717 | 4b. La pointe |
| 718–821 | 5. Index collant |
| 822–872 | 6. Menu plein écran |
| 873–891 | 7. Plaque |
| 892–1034 | 8. Champs |
| 1035–1075 | 9. Curseurs |
| 1076–1166 | 10. Modales |
| 1167–1220 | 11. Calendrier |
| **1221–1612** | **11b. Séquence d'entrée** — compteur V4 (1461), le saut (1564), mouvement réduit (1584) |
| 1613–1920 | 11c. Le cadeau — entrée V1 haut→bas (1645), les deux couvertures (1686), les 7 objets (1753), points de capture (1881) |
| 1921–2224 | **12. Hero** — plaque de limaille (1941), fiche technique (2027), **composition du hero, 11 pas sous `html.compo-hero` (2086–2224)** |
| 2225–2355 | 13. **Les plaques d'atelier** |
| 2356–2825 | 14. Services — rail horizontal, les 4 écrans (2494), leur mouvement (2745) |
| 2826–2976 | 15. Projets livrés |
| 2977–3125 | 16. Secteurs — les 13 maquettes (3031), surchargées ensuite par `secteurs.css` |
| 3126–3269 | 17. Calculateur — le verdict (3131) |
| 3270–3442 | 18. Comparatif — schéma de l'écart (3273) |
| 3443–3644 | 19. Processus — les 4 composants (3566) |
| 3645–3740 | 20. À propos — les 4 preuves (3695) |
| 3741–3873 | 21. Référence — bloc sombre dans **les deux** thèmes |
| 3874–3913 | 22. FAQ |
| 3914–4122 | 23. Contact — « ce qui arrive après » (4034) |
| 4123–4199 | 24. Pied de page |
| **4200–4368** | **25. Page 404** — le style du fichier `404.html` vit ici |
| 4369–4669 | 26. Points de rupture — dont la grille 12 colonnes des 7 plaques (4531), transparence réduite (4648), mouvement réduit (4660) |
| **4670–5410** | **Phase 8 — les micro-états** : lettres V4 (4700), durée du balayage (4773), les 2 CTA du hero (4912), odomètre (4975), curseur du rail N1 (5016), séparateurs V3 (5058), liens V3 (5107), étiquette de la pointe (5162), pastilles de secteur (5194), validation de champ (5226), bascule de thème (5251), mouvement réduit (5261), bourgeon (5292), popup cadeau (5316), les 3 issues d'un envoi (5333), question fréquente (5366), cadre de projet (5388) |
| **5411–5479** | **Le budget de dégradation, moitié CSS** : `:root[data-palier="1"]` (5427), `:root[data-palier="2"]` (5448) |

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

### `css/secteurs.css` — 1 720 lignes, 60 Ko

Les treize aperçus de secteur, construits dans `tools/proto-secteurs.*`
puis versés ici. Surchargent `.mock` du bloc 16 d'`app.css` :
`container-type`, grille, fond, encre, police.
**Hors chemin critique**, injectée par le bloc en ligne : sans script il
n'y a pas d'aperçu, donc rien à styler.
Ne contient pas la légende des secteurs — elle reste dans le document et
reste stylée par `app.css`.

### `css/tour360.css` — 411 lignes

Feuille autonome de la visite. Ne dépend que des jetons. Charge **après**
`css/vendor/pannellum.css`, dont elle ferme deux dettes : l'anneau de focus
du conteneur (`outline: 0` chez Pannellum alors qu'il pose `tabIndex = 0`)
et l'état de focus des points de passage.

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

| Lignes | Zone |
|---|---|
| 1–43 | En-tête : le motif, et les 4 écarts assumés avec la référence |
| 45–82 | Utilitaires couleur (`pack` ABGR little-endian, `mix`), bruit déterministe `pseudo()` — jamais `Math.random()` |
| 83–203 | Constructeur `Limaille(canvas, opt)` |
| 204–406 | `compose(draw, bands)` — échantillonnage du texte, seuil alpha **170** (pas 128 : à 128 on ramasse l'anticrénelage et chaque lettre reçoit un halo), `seedPositions()` et ses **quinze filets** |
| 407–521 | Intégration semi-implicite, ressort **critiquement amorti** (ζ = 1, aucun dépassement possible), verrou au repos à 1/3 de pixel |
| 522–569 | Rendu — un seul `putImageData` par image ; arrêt complet quand tous les grains sont verrouillés |

Expose `window.Limaille`.
**Ne contient pas** : le contenu du hero (c'est `hero.js`), ni aucune
logique de page.

### `js/trame.js` — 280 lignes, 12 Ko — **vague 1**

Le **passage**, et il n'y en a qu'un. Aucune dépendance, < 6 Ko servi.
Une grille de tuiles en aplat recouvre une cible **déjà peinte**, puis
chaque tuile rétrécit sur son centre. Un canvas, un `fillRect` par tuile,
zéro nœud du DOM.

| Lignes | Zone |
|---|---|
| 1–56 | En-tête : la référence mesurée (`swisspixelreveal`), ce qu'on garde, ce qu'on jette, **quel verbe c'est** (V1 dont l'arête est faite de V3) |
| 63–110 | Amortissement `sortie(u)` et bruit **déterministe** `grain(graine, x, y)` — une graine, jamais `Math.random()`, sinon deux passages successifs scintillent |
| 111–252 | Un passage : `sens` décide de l'axe, `graine` décide du motif |
| 253–280 | L'API — `APED_TRAME.degager(el, opts)` · `.couvrir(el, opts)` · `.inverse(sens)` · `.tout_arreter()`. Chaque voile porte `data-passage`. |

**Ne contient pas** : la décision de *quand* passer. Ses appelants sont
`main.js` (thème l. 1073–1100, menu l. 1116–1145, panneau l. 1182–1194),
`langue.js` (frontières l. 482 et 514, panneau l. 1413) et `tour360.js`
(l. 435). Il n'existe **pas dans le CSS** : aucun contenu ne dépend de lui
pour être lisible.

### `js/main.js` — 2 652 lignes, 114 Ko — **vague 1** — *s'exécute toujours*

La logique. **Aucune dépendance.** Si GSAP ne charge jamais, tout ce qui est
ici fonctionne. C'est aussi le seul fichier où vit **l'orientation**.

| Lignes | Zone |
|---|---|
| 1–34 | Constantes métier : `CONTACT_EMAIL`, `FORM_ENDPOINT` (FormSubmit), `BOOKING` (jours, créneaux, préavis 24 h, horizon 42 j), `SUBJECTS` |
| 35–110 | **Le barème publié** — et l'explication de ce qui en a été retiré (la vraie grille de prix, qui était lisible dans les outils de développement) |
| 111–155 | Ressort — sert à l'odomètre du calculateur |
| **156–351** | **Séquence d'entrée** — ce que le script ajoute : l'**allongement** (`html.entree-attend`, l. 266) jusqu'à `document.fonts.ready` + `#heroPlate.is-live`, plafond 2,5 s ; le **saut** ; la pose de `html.compo-hero` (l. 267) et son retrait (l. 263) |
| **352–443** | **Rail des services — orientation N1.** Expose `window.APED_SVC` (l. 405) |
| 444–582 | Cadres de projet — le site client ne défile pas tout seul |
| **583–628** | Parcours — compteur d'étape |
| 629–970 | **Le cadeau** — quand il paraît, la fréquence, et l'interrupteur `sessionStorage aped-sans-popup` réservé aux instruments (l. 702) |
| 971–1100 | **Thème** — jamais animé au chargement. La bascule passe par la **trame** (l. 1027–1100), plus par `startViewTransition` |
| 1101–1162 | Menu plein écran + sa réciproque par trame |
| 1163–1194 | Panneau « Ajuster en détail » et les autres replis du même type |
| 1195–1215 | Verrou de défilement, largeur de barre compensée |
| 1216–1349 | Modales — piège de focus, retour au déclencheur, Échap |
| 1350–1404 | Validation — focus sur le premier champ en erreur |
| 1405–1513 | Envoi |
| 1514–1679 | Calendrier |
| 1680–1843 | Formulaire projet, 7 étapes |
| 1844–1957 | Estimateur, 8 étapes |
| 1958–2202 | Calculateur — le montant alimente aussi l'index de gauche |
| 2203–2297 | Aperçu des secteurs — **c'est ici que le `<template>` est posé dans le DOM** |
| **2298–2457** | **LE CRAN — V4 du langage de mouvement, et il vit ICI.** Expose `window.APED_ROULER` (l. 2456). C'est le G2 des douze frontières, celui qui ne tombe à aucun palier. |
| **2458–2623** | **Index collant** — `IntersectionObserver`, jamais d'écouteur `scroll` |
| **2624–fin** | **La douzième frontière — la clôture** |

**Ne contient pas** : aucune animation qui dépend de GSAP, aucune
chorégraphie de défilement. Inversement, **rien de ce qui est ici ne doit
migrer vers `motion.js` ou `langue.js`** : ces deux-là s'arrêtent net sous
mouvement réduit.

### `js/hero.js` — 455 lignes, 19 Ko — **vague 1**, après `limaille.js`

La plaque du hero. Deux mots, en permanence : « APED » très gros, « Agence »
dessous. Aucun carrousel, aucun morph.

| Lignes | Zone |
|---|---|
| 32–81 | **Politique d'accent** — le minium est la matière, pas un souligneur. `RATIOS.masse = { grand: 0.12, petit: 0.96 }` |
| 82–123 | Composition, mesurée |
| 124–306 | Hauteur réellement occupée, rotation comprise |
| 307–365 | Cycle de vie — pose `#heroPlate.is-live`, que la séquence d'entrée attend |
| 366–455 | Recoloration à la bascule de thème |

Sort immédiatement si `window.Limaille` est absent.

### `js/motion.js` — 687 lignes, 32 Ko — **vague 2**, après GSAP

Les chorégraphies liées au défilement. Chaque animation porte son **niveau
N1 / N2 / N3** en commentaire. `transform` et `opacity` uniquement, aucun
écouteur `scroll`.

| Lignes | Animation |
|---|---|
| 20–28 | **Sortie anticipée** : sans GSAP ou sous mouvement réduit → `html.reduced-motion`, tous les `[data-count]` prennent leur valeur finale, et le fichier s'arrête. |
| 35 | 1. Entrée du hero |
| 61 | 2. Compression du titre |
| **87** | **3. Filets de section — N1 + N2.** C'est le **G1** des frontières : le filet se soude dès `top 97%`, il annonce la section avant qu'elle arrive |
| 134 | 4. Montée des blocs |
| 164 | 5. Compteurs de la bande de spécification |
| 188 | 6. Le rail des services — N1 + N2 (consomme `window.APED_SVC`, l. 216) |
| 292 | 7. Défilement interne des captures de projet |
| 350 · 381 | 8. Ligne du processus · 8bis. Les 4 composants du parcours |
| 415 · 438 | 9. Piste du comparatif · 9bis. Le schéma de l'écart |
| 464 | 10. Titres de section |
| 553 | 11. Blocs qui se reprennent |
| 577 | 12. Frise du processus, défilement latéral |
| 591 | 12bis. Les 4 preuves de l'agence |
| 622 · 662 | 13. Programme de référence · 13bis. « Ce qui arrive après » |
| 677 | 14. Recalcul après chargement des images |

**Ne contient pas** : l'orientation (elle est dans `main.js`), les quatre
verbes (ils sont dans `langue.js`), et **aucun scrub d'opacité sur un
élément qui porte du texte** — interdit, une animation scrubbée n'a pas
d'état de repos.

### `js/langue.js` — 1 546 lignes, 71 Ko — **vague 2**, après `motion.js`

**Les quatre verbes**, et le **budget de dégradation**. S'arrête net
(l. 61) sans GSAP ou sous mouvement réduit.

| Lignes | Zone |
|---|---|
| 1–48 | En-tête : V1 DÉGAGER · V2 S'ALIGNER · V3 SOUDER · V4 CRAN, et la règle d'admission |
| **66–150** | **Le budget de dégradation** — pose `root.setAttribute("data-palier", …)` l. 129 et 140 ; palier 1 statique (largeur < 64em · `pointer: coarse` · `hardwareConcurrency` ≤ 4 · `deviceMemory` ≤ 4), palier 2 mesuré |
| 152–200 | La mesure : on n'échantillonne **que** pendant un défilement réel — médiane sur 90 images, seuil 50 i/s |
| 201–250 | Le travail préparatoire (découpage de texte) se fait pendant les **temps morts** |
| 251–288 | 0. FLIP maison |
| **289–609** | **0bis. Les douze frontières** — franchissement lu à l'intersection (341), la **trame** (395–438), le nom comme libellé toujours gauche→droite (439), palier 2 (457) |
| 610–808 | 1. Les lettres — V4 · CRAN, sur tous les boutons. Décalage suivant la **position**, pas l'indice (731) |
| 809–926 | 2. Les mots — V1 · DÉGAGER, sur les chapôs (le poste le plus cher, il tombe au palier 1) |
| 927–1014 | 3. DÉGAGER — révélation par masque net. Le voile de grains a été **coupé** (979) |
| 1015–1056 | 4. SOUDER — les filets de liaison |
| 1057–1277 | 5. Les secteurs — 5a recomposition, un seul chemin de code (1140) · 5b la pile (1166) · 5c parallaxe à la pointe, bornée, pointeur fin seul (1260) |
| 1278–1304 | 6. Vitesses différenciées — N3, bureau seulement |
| 1305–1342 | 7. La FAQ — V2, et c'est du FLIP |
| 1343–1382 | 8. L'étiquette de la pointe — V4 |
| 1383–1438 | 9. Les modales — V1 |
| 1439–1539 | 10. Les sept plaques d'atelier — V2 · S'ALIGNER (la dérive ; le palier 1 la retire, l'inclinaison reste) |
| 1540–fin | 11. Recalcul |

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

| Lignes | Zone |
|---|---|
| 1–34 | En-tête : règle de charge (rien ne part avant le clic), progressif 2K → 4K, accessibilité |
| 35–104 | Le plan — repère 240 × 140, `PLAN_SVG` (l. 62) ; les rectangles et les murs sortent des **mêmes** coordonnées |
| 105–139 | `PIECES` (salon, chambre, terrasse — Lythwood Lodge), `HFOV_MIN` 55 / `HFOV_MAX` 118 |
| 140–177 | Utilitaires + `charger(url, css)` : chargement d'une ressource une seule fois pour toute la page |
| 178–534 | `demarrer(bloc, index)` — la scène, les points de passage rééquipés un par un (`tabindex`, `role`, nom accessible, clavier — Pannellum les fabrique en `div` nus), et le passage d'une pièce à l'autre **par la trame** (l. 435) |
| 535–fin | `init()` |

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
| `cine.mjs` | **Bibliothèque, pas un test.** `filmer / planche / cadence / plancheFenetre` via `Page.startScreencast` du protocole DevTools : une image à chaque peinture, horodatée. Existe parce que `page.screenshot()` coûte 120 à 950 ms et **rate** une transition. |
| `vue.mjs` | Une capture ciblée d'une section : `node tools/vue.mjs #contact [largeur] [thème] [décalage]`. |

### Preuves de comportement

| Outil | Ce qu'il rend comme preuve |
|---|---|
| `accueil-check.mjs` | Sept relevés du chantier 01 : contenu mot pour mot des 7 plaques + chasse aux énoncés retirés · composition du hero image par image · survol des 2 CTA avec le contraste à chaque image · lisibilité à l'arrêt (contraste, angle réel, boîte réelle) · dérive bornée · i/s + LCP + CLS · débordement. |
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
| `proto-secteurs.html` · `proto-secteurs.css` | Le prototype des treize aperçus, hors du site. C'est ici qu'ils ont été construits avant d'être versés dans `css/secteurs.css`. |
| `_captures-*` · `_planches` · `_refs` · `_nous` | Sorties de mesure. **Toutes ignorées par git.** |

---

## 7 · Documentation

| Fichier | Rôle | Ce qu'on y trouve |
|---|---|---|
| **`CLAUDE.md`** (32 Ko) | **Les règles.** À lire avant toute modification. | La signature, les 4 verbes, les 12 frontières, la trame, l'accueil, la séquence d'entrée, le budget de dégradation (3 paliers), la hiérarchie N1/N2/N3, la politique d'accent, les 5 règles de structure, le design stack et sa table de routage de skills, la config MCP. |
| `PHASE-6.md` (27 Ko) | Les 8 points du client + 17 défauts trouvés en propre. | Hero coupé, colonne droite, projets, 13 secteurs, calculateur, contact/référence, 7 animations, mesures, 15 techniques de recherche, réserves. |
| `PHASE-7.md` (27 Ko) | Les douze chantiers. | Retrait de tous les prix publics, séquence d'entrée, hero en mode clair, arbitrage rail/roue des services, cadres de projet, schéma de l'écart, mesures, phase 7B. |
| `PHASE-8.md` (58 Ko) | **Le langage de mouvement complet.** | La décision qui gouverne tout (§ 0), 41 techniques et leur traduction (§ 1), les 4 moments qui comptent (§ 2), l'inventaire complet (§ 3), les chiffres (§ 4), ce qui a été écarté (§ 5), **les 5 pièges d'instrument (§ 6)**, réserves, budget mobile (§ 7bis). |
| `PHASE-9.md` (20 Ko) | Séquence d'entrée, douze frontières, cadeau. | § 0 la découverte : **aucun formulaire de ce site n'a jamais livré**. § 1 pourquoi personne ne voyait la séquence. **§ 2 la table des douze frontières et l'argument de chacune.** § 3 le cadeau. **§ 4 les 6 pièges d'instrument.** |
| `PHASE-10.md` (21 Ko) | Les passages. | § 0 les 3 défauts trouvés en mesurant (dont la 13ᵉ frontière invisible depuis toujours), § 1 les six références, § 2 la trame et son verbe, § 3 l'inventaire des passages, § 4 l'échelon de palier ajouté, § 5 les pièges d'instrument, § 6 les chiffres avant/après. |
| `REFONTE-CHECKLIST.md` (41 Ko) | **Journal des phases 4 et 5.** Reste la référence pour tout ce que 6–10 n'ont pas touché. | Phase 5 (la signature), phase 4 (bilan de clôture) : décompte, comptage des sections, copie, pages, blocs, sections, modales, composants, tokens, animations, logique métier, violations. ⚠️ Deux lignes y sont périmées depuis la phase 7, signalées dans le fichier. |
| `DESIGN-STACK.md` (9 Ko) | L'état du stack de skills design. | Ce qui est gardé (niveau 1, 5 skills), ce qui a été retiré et pourquoi, ce qui est hors périmètre ici, le poids en contexte mesuré, les problèmes MCP. |
| `AUDIT-150.md` (13 Ko) | Audit par « auditeur externe hostile ». | Score brut, récapitulatif, les déclinaisons de la signature (9/12), **ce que l'auditeur a trouvé que moi non**, les 10 failles, les faux positifs débusqués, ce qui est impossible à mettre à ● et pourquoi. |
| `SPEC-VISITE-360.md` (13 Ko) | Spécification de dépôt, à destination du client. | Quoi fournir par pièce, les douze pièces et leurs liaisons, le tableau à remplir, le plan, ce qui sera fait à réception. Le pipeline est construit et testé ; rien n'a été touché dans la visite actuelle. |
| **`ARCHITECTURE.md`** | Ce fichier. La carte. | Il dit **où**. Les autres disent **pourquoi**. |

---

## 8 · Le reste

| Fichier / dossier | Rôle |
|---|---|
| **`404.html`** (159 lignes) | Page introuvable, `noindex`. **Elle charge `css/app.css` en entier**, pas le couple critique/différé : trois `<link>` en tête (`tokens`, `base`, `app`). Même script en ligne de thème que `index.html`, mais **sans** la décision de séquence d'entrée. Contient l'index complet des 12 sections en liens `index.html#…` (l. 80–92), avec une ligne « déraillée ». Son style vit dans `css/app.css` § 25 (l. 4200–4368). |
| **`package.json`** | `devDependencies` uniquement : `playwright`, `gsap`, `puppeteer-core`, `shadcn`, `@tabler/icons`. **Aucune dépendance de production, aucun script de build déclaré.** GSAP est copié dans `js/vendor/`, il n'est pas résolu depuis `node_modules` à l'exécution. Les icônes Tabler sont la source du sprite inline. |
| **`components.json`** | Config shadcn. Cible un projet **React + Tailwind** (`css/styles.css`, alias `components/ui`) qui **n'existe pas ici**. Sert uniquement à donner au MCP `shadcn` la liste des registries : `@magic-ui`, `@aceternity`, `@kokonutui`, `@kibo-ui`. `shadcn add` n'écrit pas de code utilisable sur ce site vanilla — le MCP sert à **chercher et lire**, puis à porter à la main. |
| **`.mcp.json`** | Un seul serveur, au niveau projet : `shadcn` via `npx shadcn@latest mcp`. Le serveur `playwright` est configuré au niveau utilisateur, pas ici. |
| `.gitignore` | Ignore `node_modules/`, **toutes** les sorties de mesure (`refonte-captures/`, `tools/_captures-*`, `tools/_planches`, `tools/_refs`, `tools/_nous`, `8099/`, `*.trace.json`), les fichiers système et les dossiers d'éditeur. |
| `package-lock.json` | Verrou npm des devDependencies. |
| `documents/` | Les deux PDF livrés (`aped-automatisation.pdf` 42 p., `aped-ia-croissance.pdf` 49 p.), leur **source HTML** dans `documents/src/` + `print.css`, et `rapport-pdf.json` — le relevé rendu par `tools/pdf.mjs` (pages, Ko, pages qui débordent, erreurs). |
| `fonts/` | Six `.woff2` auto-hébergés : Archivo, Chivo, Martian Mono, chacun en `latin` et `latin-ext`. Déclarés dans `css/tokens.css`, préchargés dans `<head>`. Aucune requête tierce. |
| `images/` | Favicon SVG, `apple-touch-icon`, `og.png`, sprite `icons.svg`, logos, 5 photos de réalisations, les couvertures de PDF, `images/secteurs/` (les 4 aperçus × hero + vignettes) et `images/tour/` (les panoramas 2K/4K + affiche). Les sous-dossiers `_retire/` et `_ancien/` sont des archives non référencées. |
| `logo/` | Deux PNG de logo (`LOGO_APED.png`, `LOGO_APED_NOM.png`). Non référencés par le site rendu — le monogramme est un tracé SVG inline dans `index.html`. *À vérifier si on veut les supprimer.* |

---

## 9 · Points à surveiller, relevés en dressant cette carte

1. **`<footer class="footer">` (l. 2458–2513) est à l'intérieur de
   `<main class="shell">` (l. 307–2515).** Un `<footer>` descendant de
   `<main>` perd son rôle de repère `contentinfo` dans l'arbre
   d'accessibilité. À confirmer avec l'arbre a11y de Playwright avant de
   déplacer quoi que ce soit — le seuil du pied (l. 2451) est juste
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
