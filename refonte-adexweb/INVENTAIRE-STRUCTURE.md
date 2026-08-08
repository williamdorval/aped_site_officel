# INVENTAIRE — structure et contenu du site avant la refonte ADEXWEB

Relevé le 2026-08-08, sur le commit `6f0784c`, étiquette `avant-adexweb`.
Site statique HTML/CSS/JS vanilla + GSAP auto-hébergé. Aucune dépendance
runtime tierce. Dorsale = Google Apps Script (`google/Code.gs`).

Ce document est la **liste de transposition** : rien de ce qui y figure ne
doit disparaître de la refonte sans une ligne qui dit pourquoi.

---

## 1. PAGES HTML SERVIES

### 1.1 Production (racine)

| Chemin | Lignes | Octets | Rôle |
|---|---:|---:|---|
| `index.html` | 5 122 | 337 378 | Page unique : 11 sections + pied + 6 modales + 1 dialog + 2 datalists. |
| `404.html` | 186 | 9 508 | Erreur : index « déraillé » de 12 entrées vers `index.html#ancre`, pied complet avec téléphone. Charge `tokens.css` + `base.css` + `app.css` (pas la découpe critique/différé). |
| `confidentialite.html` | 357 | 16 790 | Politique de confidentialité (Loi 25), 9 sections H2. Page et non modale, pour être citable par URL (D-739). |

### 1.2 Démos sectorielles (`demos-secteurs/`) — 9 sites autonomes

| Chemin | Lignes | Octets | Entreprise fictive |
|---|---:|---:|---|
| `boutique/index.html` | 413 | 22 271 | Grès Saulnier — céramique |
| `clinique/index.html` | 426 | 20 632 | Clinique du Riverain |
| `coiffure/index.html` | 720 | 33 734 | Brume |
| `construction/index.html` | 604 | 35 393 | CORDEAU |
| `gym/index.html` | 558 | 31 987 | FONTE NORD |
| `hotel/index.html` | 570 | 30 066 | Auberge de l'Anse-à-Givre |
| `immobilier/index.html` | 513 | 24 050 | ARPENT |
| `juridique/index.html` | 458 | 24 660 | Cabinet Vallières |
| `photo/index.html` | 441 | 24 022 | Atelier Lumen |

### 1.3 Sources de documents (compilées en PDF, non servies)

| Chemin | Lignes | Octets | Rôle |
|---|---:|---:|---|
| `documents/src/aped-automatisation.html` | 3 896 | 276 278 | Guide « Ce que votre entreprise pourrait automatiser » → 42 p. |
| `documents/src/aped-ia-croissance.html` | 3 882 | 278 472 | Guide « Comment utiliser l'IA pour faire grossir votre entreprise » → 49 p. |

### 1.4 Archives (non servies)
`archives/2026-08-01-sites-longs/*.html` (9), `archives/2026-08-01-proto-secteurs/`,
`archives/2026-07-30-plaques-accueil/`, `archives/2026-07-30-projets-images/`,
`archives/2026-08-03-agence/section-09-agence.html` (section retirée le 2026-08-03).

---

## 2. `index.html` — LES ONZE SECTIONS, DANS L'ORDRE

Avant `<main>` (l. 1–246) : `<head>` (métas SEO/OG/Twitter, `theme-color`,
favicon SVG + apple-touch-icon, 3 `preload` de polices, 3 feuilles critiques,
le seul `<noscript><style>` du site, script bloquant qui pose le thème avant
le premier rendu depuis `localStorage["aped-theme"]`) · `a.skip-link` ·
`div.entree#entree` (rideau de chargement : 15 filets, jauge, compteur à
rouleau, cadre 4 équerres, plaque monogramme) · sprite SVG de **17 symboles** ·
`div.read-progress` · `<header class="nav">` (wordmark, `#navImpactValue`,
5 liens, `#themeToggle`, `.nav-refer`, `.nav-tel`, `.nav-cta`, `#burger`) ·
`div.menu#menu` (11 liens numérotés + 2 boutons blocs) ·
`aside.rail#rail` (index collant : 11 ancres, `#railLeft`, `#railImpactValue`).

Chaque section s'ouvre par un `div.seuil[data-seuil][data-de][data-vers]
[data-dress][data-verbe][data-sens]` avec filet et carte à rouleau.

| № | id | Lignes | Titre visible | Ce qu'elle contient |
|---|---|---|---|---|
| 01 | `#top` | 250–304 | « APED Agence » | Hero en 12 pas retardés (`--e` 0→1320 ms) : `p.hero-eyebrow`, `#heroPlate` + `canvas#heroCanvas` (limaille), `p.hero-claim` 2 lignes, `p.hero-sub`, 2 CTA (`modal-project`, `modal-estimate`), `aside.hero-fiche` (4 rangées de services + délais), `p.hero-socle` (3 promesses). |
| 02 | `#services` | 309–924 | « Nos services. » | **Course horizontale au défilement.** `div.svc-piste` → `div.svc-scene` → `ol.svc-planche` : 5 plaques (`#svc-01`…`#svc-05`) + panneau de clôture `#svc-fin`. Compteur `01/05`. Puis `div.svc-fiches` (l. 454–922) : 5 fiches détaillées hors rail, avec schéma d'automatisation animé, bouton « Lancer la visite 360 », schéma d'estimateur. |
| 03 | `#realisations` | 928–1826 | « Avant. Après. » | **La plus grosse (898 l.).** 4 comparateurs à poignée glissante : `#ba-garage`, `#ba-design`, `#ba-restaurant`, `#ba-renovation`. « Après » = images WebP en tranches ; « Avant » = **maquette HTML reconstituée** (site de 2011, page de résultats, télécopieur…). Aveu global « Tout ce qui suit est une démonstration » (D-789). Repli `p.ba-sans` sans JavaScript. |
| 04 | `#demos` | 1829–2038 | « Le style change selon le métier. » | 13 pastilles de secteur en 3 groupes ; `figure#sectorPreview` avec `#mockStage` et `figcaption#sectorCaption[aria-live]` ; **`<template id="tplSecteurs">`** (l. 1912–2033) portant les 13 maquettes. 3 liens vers les comparateurs. |
| 05 | `#visite` | 2042–2119 | « L'acheteur fait le tour avant de prendre rendez-vous. » | Visite 360. `img.tour-poster` + `div.tour-stage`, pupitre d'entrée, manifeste 3 pièces. Moteur `js/tour360.js` + `js/vendor/pannellum.js` + `css/tour360.css`, chargés à la demande. |
| 06 | `#calculateur` | 2122–2277 | « Combien vous coûte le travail fait à la main. » | 7 préréglages `data-preset`, 2 curseurs maîtres (`#inRate` taux horaire, `#inAdmin`), `details#roiDetails` avec 8 tâches, `div.roi-panel` (`#roiWeekly`, `#roiImpact`), 2 barres d'état, `p.sr-only#roiAnnounce[role=status]`. Écrit dans `#navImpactValue` et `#railImpactValue`. |
| 07 | `#comparatif` | 2280–2399 | « À la main contre automatisé. » | `div.ecart` : barre géante, bornes **1 h 44 / 7 h 20**, gain **− 5 h 36 par semaine**, équivalent textuel `sr-only`. `div.vs#vsTable` : 6 lignes `data-manual`/`data-auto`. Bouton `[data-cadeau-ouvrir]`. |
| 08 | `#processus` | 2403–2628 | « Comment ça se passe. » | Barre `#parcNum`/`#parcNom`/`#parcReste`. `ol.parc` : 6 stations (On se parle · On signe · On code · Vous suivez · On met en ligne · On s'occupe de la suite), chacune avec fil, nodule, branche, livrable et figure. |
| 09 | `#reference` | 2632–2799 | « Vous présentez. On encaisse ensemble. » | Bloc sombre. **jusqu'à 5 000 $** par entreprise référée. `ol.referral-steps` 4 étapes. `#refPanneau[hidden]` avec le **bloc généré** `CONDITIONS:DEBUT`(2739)…`CONDITIONS:FIN`(2794). Versement 30 j après le paiement final. |
| 10 | `#faq` | 2802–2913 | « Questions fréquentes. » | 8 `details.faq-item` (coût, automatisation, délais, maintenance, technologies, insatisfaction, région, paiement), 3 avec CTA. |
| 11 | `#contact` | 2917–3107 | « Comment nous joindre. » | `a.appel-num[tel:+18195230871]`. `div.bento` 5 tuiles en 3 niveaux → `modal-project`, `modal-booking`, `modal-estimate`, `modal-urgent`, `modal-refer`. `ul.contact-sur` 4 garanties (12 h · 0 $ · Écrit · Jamais). **`form[data-form="contact"]`** (l. 3061). |
| 00 | `#footer` | 3136–3195 | « On commence quand vous voulez. » | `ul.footer-points`, CTA `modal-project`, `[data-cadeau-ouvrir]` « Les deux guides · 91 pages » (aucun lien direct vers les PDF, D-788), monogramme, téléphone, `nav.footer-nav` 5 liens, `p.footer-mega` « APED » géant, mentions légales. |

---

## 3. TEMPLATES, MODALES, POPUPS

### 3.1 `<template>` — un seul
`tplSecteurs` (l. 1912–2033) : les **13 maquettes** `div.mock[data-mock][data-metier]`,
clonées dans `#mockStage` par `main.js`. Ordre : restauration, boutique, coiffure,
gym, hébergement, garage, construction, paysagement, clinique, immobilier,
juridique, photographe, **« Votre industrie ici »** (`mock--matiere`, 63 grains).

### 3.2 `<dialog>` natif — un seul
**`cadeau`** (l. 3199–3334) — popup d'échange des deux guides. 2 couvertures,
fiche 24 tâches / 2 guides / 91 pages, **`form#cadeauForm`** (piège `#hpCadeau`,
`#cadeauEmail`, `#cadeauTel`), volets `#cadeau-suite` / `#cadeau-deja`,
bouton de refus. Ouvert par `[data-cadeau-ouvrir]` (comparatif l. 2296, pied l. 3163).

### 3.3 Modales — six, plus un panneau

| Id | Lignes | Titre | Contenu |
|---|---|---|---|
| `modal-start` | 3339–3370 | « Par où on commence ? » | Aiguillage à 3 boutons `data-modal-switch`. Déclenché par les 13 pastilles. |
| `modal-booking` | 3372–3502 | « Réserver un appel » | 3 étapes `data-bstep`. Calendrier (`#calPrev`/`#calMonth`/`#calNext`/`#calDays`/`#slotsList`), puis `form[data-form="booking"]` (mode téléphone ou Google Meet, `#bkName`, `#bkCompany`, `#bkEmail`, `#bkPhone`, `#bkTopic`, `#bkLegal`), puis succès. |
| `modal-project` | 3504–3880 | « Démarrer votre projet » | **Assistant 7 étapes + succès.** `data-pstep` 1 identité · 2 entreprise · 3 besoin · 4 ampleur · 5 contenu et fonctions · 6 budget et échéancier · 7 coordonnées avec **dépôt de fichiers** (`#prFiles`) · 8 succès avec fourchette (`#prFourchette`) et question de devis. |
| `modal-urgent` | 3882–4015 | « Urgence » | `form[data-form="urgent"]` : `#urName`, `#urPhone`, `#urEmail`, `#urCompany`, `#urSystem`, `#urGravite`, `#urDepuis`, `#urMsg`, `#urImpact`. |
| `modal-refer` | 4017–4340 | « Référer une entreprise » | **Assistant 7 étapes + succès.** 1 entreprise référée · 2 son métier et son besoin · 3 comment la joindre · 4 qui vous êtes · 5 où envoyer la prime · 6 note libre · 7 **les conditions** avec bloc généré `CONDITIONS:DEBUT`(4246)…`FIN`(4301) et case `#rfAccept`. |
| `retenue` | 4349–4382 | (panneau) | **Rétention sur abandon** (D-753). `#retenueQuoi`, `#retenueTexte`, `#retenueEmail`, `#retenueEnvoi`, `#retenueRdvBtn`, `#retenueStatut`. |
| `modal-estimate` | 4384–4885 | « L'estimation, en six écrans au plus » | **Assistant conditionnel de 14 écrans** dont 6 vus au plus. `data-step`/`data-pour`. Écran 14 = le chiffre : `#esFourchette`, `#esDevisQuestion`, `#esPetit`, `#esPrixRaison`, `#esSansPrix`. |

### 3.4 Après les modales
- l. 4886–4958 — **chargeur de scripts en deux vagues.** V1 (2 rAF) : `config.local`, `limaille`, `trame`, `main`, `hero`. V2 (1er geste ou 1 200 ms) : `gsap`, `ScrollTrigger`, `motion`, `langue`, `pointe`, `tour360`. Injecte aussi `differe.css`, `secteurs.css`, `tour360.css`.
- l. 4984–5053 — `<datalist id="l-villes">` ~120 municipalités du Québec.
- l. 5059–5121 — `<datalist id="l-domaines">` 60 domaines.

### 3.5 Les sept formulaires
`data-form="contact"` (3061) · `#cadeauForm` (3254) · `data-form="booking"` (3409) ·
`#projectWizard` (3515) · `data-form="urgent"` (3923) · `data-form="refer"` (4029) ·
`data-form="estimate"` (4684). Tous `novalidate`, tous avec piège `_gotcha`,
tous routés vers `window.APED_ENVOI` via `main.js` (bloc « Envoi », l. 2147+).

---

## 4. LES DOSSIERS

### 4.1 `css/` — 8 fichiers, 15 700 lignes

| Chemin | Octets | L. | Rôle |
|---|---:|---:|---|
| `tokens.css` | 7 697 | 228 | `@font-face`, couleurs, espacement, typographie, deux thèmes. Bloquant. |
| `base.css` | 5 784 | 234 | Reset, `box-sizing`, mouvement réduit global. Bloquant. |
| `app.css` | 276 819 | 7 733 | **Seule source.** ~80 blocs numérotés. |
| `critique.css` | 55 554 | 1 481 | **FABRIQUÉ** par `tools/css-critique.mjs`. |
| `differe.css` | 217 261 | 5 872 | **FABRIQUÉ**, injecté après première peinture. |
| `secteurs.css` | 9 583 | 249 | Les 13 aperçus. Injecté par JS. |
| `tour360.css` | 11 233 | 420 | Visite 360. Injecté par JS. |
| `vendor/pannellum.css` | 9 677 | — | Moteur panoramique, auto-hébergé. |

### 4.2 `js/` — 12 fichiers, 24 500 lignes

| Chemin | Octets | L. | Rôle |
|---|---:|---:|---|
| `config.local.js` | 460 | 6 | **FABRIQUÉ** par `tools/config-envoi.mjs` depuis `.env.local`, hors git. `window.APED_ENVOI` = URL du web app. |
| `main.js` | 237 310 | 5 640 | **Toute la logique.** Thème (1456) · Menu (1534) · Modales et piège de focus (1622) · Envoi (2147) · Calendrier (3349) · Assistant projet (3902) · Aperçu des secteurs (4935) · Index collant (5249). Plus calculateur, estimateur, référence, rétention, cadeau, compteurs. |
| `langue.js` | 26 720 | 715 | Les quatre verbes. Nécessite GSAP. |
| `tour360.js` | 16 490 | 474 | Visite 360, 3 panoramas, plan, passages, clavier. |
| `limaille.js` | 16 597 | 469 | Moteur de grains (canvas, `Uint32Array` ABGR). |
| `motion.js` | 11 821 | 320 | GSAP/ScrollTrigger : dégagements, scènes épinglées. |
| `hero.js` | 11 709 | 325 | Plaque de limaille de l'accueil. |
| `trame.js` | 7 665 | 196 | Arête quantifiée, passage des frontières. |
| `pointe.js` | 4 072 | 129 | Curseur signature (pointeur fin). |
| `vendor/gsap.min.js` | 72 214 | — | GSAP. |
| `vendor/ScrollTrigger.min.js` | 43 380 | — | ScrollTrigger. |
| `vendor/pannellum.js` | 56 407 | — | Moteur 360. |

### 4.3 `tools/` — 144 scripts `.mjs` + 22 dossiers d'artefacts
Détail et verdicts de survie : voir `INVENTAIRE-OUTILLAGE.md`.
Fabricants à ne jamais perdre : **`css-critique.mjs`**, **`config-envoi.mjs`**,
**`conditions.mjs`**, **`plages.mjs`**, **`index-doc.mjs`**, **`serve.mjs`**,
**`pdf.mjs`**, **`og.mjs`**.

### 4.4 `google/` — 5 fichiers

| Chemin | Octets | Rôle |
|---|---:|---|
| `Code.gs` | 230 629 | **Toute la dorsale.** ~60 fonctions : `doGet`/`doPost`, `traiter`, `valider`, déduplication (`signature`/`chercherJumelle`/`fusionnerLigne`), moteur d'estimation (10 fonctions `estim*`), classeur (`initialiser`, `preparerOnglet`, `migrerColonnes`, `reparerValeursListes`, `poserLigne`…), calendrier (`occupations`, `listeCalendriers`, `dejaReserve`…), pièces jointes Drive (`rangerPieces`, `dossierPieces`), sessions signées (`cleSessions`, `signerSid`, `refusDeJeton`), `diagnostic`. |
| `appsscript.json` | 780 | Fuseau `America/Toronto`, Calendar v3, V8, 7 scopes, web app `ANYONE_ANONYMOUS` / `USER_DEPLOYING`. |
| `guides/aped-automatisation.pdf` | 2 089 020 | Guide 1, 42 p. **À renommer.** |
| `guides/aped-ia-croissance.pdf` | 2 125 722 | Guide 2, 49 p. **À renommer.** |
| `guides/LISEZ-MOI.md` | 1 228 | Mode d'emploi. |

### 4.5 `documents/`
`src/aped-automatisation.html` (276 278) · `src/aped-ia-croissance.html` (278 472) ·
`src/print.css` (33 055) · `rapport-pdf.json` (229 : 42 p./2 040 ko, 49 p./2 076 ko,
aucun débordement).

### 4.6 `images/` — 258 fichiers
Racine (8) : `apple-touch-icon.png`, `favicon.svg`, `logo-mark.svg`,
`logo-lockup.svg`, `icons.svg`, `og.png`, `doc-automatisation.webp`, `doc-ia.webp`.
`realisations/` (116) : tranches `apres-<cas>-tN.webp` des 4 comparateurs, tranches
`apres-secteur-<metier>-tN.webp` pour 9 métiers, 8 `avant-*.webp`, 12 `ecran-<metier>.webp`.
`secteurs/` (14 + 3 archivés). `secteurs-sites/` (106 + **`_licences.json`** 40 375 o).
`tour/` (7 + 9 archivés) : terrasse/salon/chambre en 2k et 4k, `poster.webp`.
`_retire/` (4).

### 4.7 `fonts/` — 96 fichiers
Production (6) : archivo, chivo, martian — chacun `-latin` et `-latin-ext`.
Les 3 `-latin` sont préchargés.
`fonts/demos/` (88 + `_declarations.css` + `_licences.json`) : 21 familles pour les
9 sites de démonstration.

### 4.8 `demos-secteurs/`
9 `<metier>/index.html` · `STANDARD.md` (17 543) · `DIRECTIONS.md` (16 010) ·
`plans/*.md` (9 fichiers, 17 711 à 34 854 o).

### 4.9 `conditions/`
`reference-2026-08-07.md` (6 350) · `reference-2026-08-07-b.md` (8 063, **courante**).
Source injectée par `tools/conditions.mjs` aux deux emplacements `CONDITIONS:*` d'`index.html`.

### 4.10 `docs/`
`CONFIGURATION-GOOGLE-APED.md` (44 238) — configuration complète de la dorsale.

### 4.11 `decisions/` — 16 journaux
`index.md` (152 865) · `css-app.md` (183 070) · `js-main.md` (105 833) ·
`js-langue.md` (50 383) · `css-secteurs.md` (21 668) · `js-motion.md` (20 525) ·
`js-tour360.md` · `js-limaille.md` · `js-trame.md` · `js-hero.md` · `js-pointe.md` ·
`js-sas.md` (fichier JS supprimé) · `css-tokens.md` · `css-tour360.md` ·
`css-base.md` · `404.md`.

### 4.12 `logo/`
`logo_adexweb.png` (1 359 998) · `logo_adexweb_nom.png` (837 062).
**Pas encore référencés** : le site utilise le monogramme SVG inline et `images/logo-mark.svg`.

### 4.13 `preuves/` — 2 127 fichiers, 29 dossiers
Captures et rapports. 9 rapports Markdown, 7 `rapport.json`.

---

## 5. CONSTANTES TRANSVERSES À NE PAS PERDRE

- **Téléphone unique** `+1 819 523-0871`, affiché à 6 endroits, chacun avec
  `data-appel="<contexte>"` : `entete`, `section-contact`, `contact`, `pied`,
  `estimate`, plus `404.html`.
- **Aucune adresse courriel affichée nulle part.** Décision explicite.
- **Numérotation 01–11** partagée par le rail, le menu et la 404. Le pied est `00`.
- **56 familles d'attributs-crochets `data-*`** : `data-modal-open/close/switch`,
  `data-cadeau-*`, `data-tiroir`, `data-seuil/de/vers/dress/verbe/sens/cible`,
  `data-svc-*` (7), `data-ba-*` (4), `data-sector/caption/mock/metier`,
  `data-preset/task/manual/auto/bar`, `data-pstep/rstep/bstep/step/pour`,
  `data-form/submit/label/checks/choice/key/value`, `data-tour*` (5), `data-parc`,
  `data-ref`, `data-ecart`, `data-souder`, `data-degage`, `data-rail`,
  `data-appel`, `data-theme`, `data-accent`, `data-lance-visite`.
- **Blocs générés, jamais édités à la main** : `css/critique.css`, `css/differe.css`
  (← `css-critique.mjs`) ; `js/config.local.js` (← `config-envoi.mjs`) ; les deux
  blocs `CONDITIONS:*` d'`index.html` (← `conditions.mjs`) ; la table de plages de
  `SECTIONS.md` (← `plages.mjs`).
- **Zéro requête tierce** : polices, GSAP, ScrollTrigger, Pannellum, icônes, et
  les deux datalists sont tous locaux.
