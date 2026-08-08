# INVENTAIRE — tout ce qui porte l'ancienne identité

Relevé le 2026-08-08 sur `6f0784c`. Hors `node_modules/`, `.git/`.
`archives/` = 54 occurrences dans 21 fichiers · `preuves/` = 12 dans 5 fichiers
(non détaillées : ce sont des archives, elles restent telles quelles).

**Aucun faux positif** : les seules sous-chaînes `aped` non-marque du dépôt sont
`window.__apedStable`, `window.__apedTheme` et le regex `/\baped\b/i` — tous des
dérivés volontaires de la marque.

---

# VOLET A — LE NOM

## A1. Texte visible par le visiteur

| fichier:ligne | extrait |
|---|---|
| `index.html:112` | `<p class="entree-mot">APED<span>Agence</span></p>` (rideau) |
| `index.html:129` | wordmark de l'en-tête |
| `index.html:165` | `aria-label="Appeler APED au 819 523-0871"` |
| `index.html:259` | `<h1 class="plate-text"><span class="plate-big">APED</span> <span class="plate-small">Agence</span></h1>` |
| `index.html:2770` · `4277` | `…employés d'APED ne participent pas au programme.` (conditions, ×2) |
| `index.html:3184` | `<p class="footer-mega">APED</p>` (mot géant) |
| `index.html:3186` · `3188` | `© 2026 APED Agence.` · `Conçu et codé à la main par APED Agence.` |
| `404.html:49, 124, 129` | wordmark + mentions |
| `confidentialite.html:48, 262, 316, 321` | wordmark + `APED Agence est William Dorval.` + mentions |
| **`js/hero.js:43`** | **`var BIG = "APED";`** — le mot dessiné en limaille sur le canvas |
| `images/logo-mark.svg:1` | `<title id="aped-mark-title">APED</title>` |
| `images/logo-lockup.svg:1` | `<title id="aped-lockup-title">APED — Agence</title>` |
| `conditions/reference-2026-08-07.md:1, 80` · `-b.md:1, 110` | titre + article |

**Les deux PDF** (`documents/src/*.html`, 93 occurrences) — visible sur **chaque page** :
`aped-automatisation.html:13` couverture · **40 pieds de page** (`APED · Automatisation`) ·
`:3267`, `:3852` corps · `:3892` colophon.
`aped-ia-croissance.html:187` couverture · **47 pieds de page** · `:3878` colophon.

## A2. Métadonnées

`index.html:6` `<title>APED Agence | Sites web…</title>` · `:7` description ·
`:11` `og:title` · `:13` `og:image` (`images/og.png`, générée par `tools/og.mjs`
en minium `#c8371b`) · `:21`/`404:14`/`confid:13` `rel="icon" → images/logo-mark.svg` ·
`:22` apple-touch-icon.
`404.html:6, 7` · `confidentialite.html:6, 7`.
`documents/rapport-pdf.json:3, 10` : `"id": "aped-automatisation"`, `"aped-ia-croissance"`.

> **Aucun JSON-LD, aucun `manifest.json`** dans le dépôt. Actifs de marque :
> `images/logo-mark.svg`, `logo-lockup.svg`, `favicon.svg` (couleurs
> `#101211`/`#c8371b`/`#dcdedb`), `apple-touch-icon.png`, `og.png`.

## A3. Noms de fichiers et de dossiers

`docs/CONFIGURATION-GOOGLE-APED.md` · `documents/src/aped-automatisation.html` ·
`documents/src/aped-ia-croissance.html` · `google/guides/aped-automatisation.pdf` ·
`google/guides/aped-ia-croissance.pdf` ·
`tools/_refs/aped-contact/`, `aped-faq-390/`, `aped-faq-ouvre/`, `aped-preset/`,
`aped-roi-chiffre/`, `aped-suite/`, `zz-aped-actuel/`, `zz-aped-demos/`.
**Le dossier racine lui-même** (`APED-AGENCY\site web aped officiel`) est codé en
dur dans `tools/demos-sites.mjs:18,34,51,130`, `tools/_demos/_verif.mjs:13,18,23,28`,
`tools/_demos/_chasse.mjs:40`, `tools/_demos/_restau-diag.mjs:10`, et 3 rapports `.txt`.
`logo/` est **déjà renommé** (`logo_adexweb.png`, `logo_adexweb_nom.png`) mais
`RESERVES.md:370` et `ARCHITECTURE.md:733` référencent encore `logo/LOGO_APED*.png`
— liens morts.

## A4. Identifiants de code

**Globales `window.APED_*`** : `APED_TRAME` (défini `js/trame.js:195`, lu 8× dans
`main.js`, 6× dans `langue.js`, 1× `tour360.js:366`) · `APED_ROULER` (défini
`main.js:5247`, lu `langue.js:305,310,312`) · `APED_ENVOI` (`js/config.local.js:6`,
lu `main.js:37`) · `APED_SVC` (cité `ARCHITECTURE.md:427`).

**Clés de stockage `aped-*`** — présentes dans le site **et dans ~97 des 175 outils** :

| clé | où |
|---|---|
| `aped-theme` | `index.html:53`, `404.html:30,177`, `confidentialite.html:29,348`, `main.js:1475,1484,1488` |
| `aped-sans-popup` | `main.js:1182` (lecture) — **posée par ~85 outils** |
| `aped-entree-saut` | `main.js:338` — posée par ~45 outils |
| `aped-guides-donnes` | `main.js:1176` |
| `aped-sid-<kind>` | `main.js:2351`, `:5496` |
| `aped-jeton-<kind>` | `main.js:2391` |
| `aped-brouillon-<kind>` | `main.js:2458` |
| `aped-retenue-vue` · `aped-retenue-apres-vue` | `main.js:2851` · `:2864` |
| `aped-cadeau`, `aped-cadeau-donne` | clés mortes, effacées activement |
| `aped-cadeau-vu` | `tools/passages-cine.mjs:48,214` |

**Événements `aped:*`** : `aped:theme` (`main.js:1477,1494`, écouté `hero.js:256`) ·
`aped:modal` (1672) · `aped:modal-ferme` (1711) · `aped:secteur` (4971, écouté 5140
et `langue.js:585,676,697`).

**Autres** : `history.pushState({aped:"svc-fiche"})` (`main.js:786,817`) ·
`scene.aped_poser`, `scene.aped_curseur` (1084-1115) ·
`var(--aped-accent, #c8371b)` dans les deux SVG de logo ·
`<meta name="aped-instant">` dans les **9** démos secteurs (protocole de capture,
lu par `tools/ecrans-secteurs.mjs:353,357,428`) ·
`window.__apedStable` (`tools/formulaires-prod.mjs:190`) ·
`window.__apedTheme` (`tools/socle-captures.mjs:50`).

**Variables d'environnement** : `APED_WEB_APP_URL` (11 outils + `config-envoi.mjs`) ·
`APED_COURRIEL` · `APED_DIAG_CLE` (`Code.gs:1768` + 2 outils) ·
`APED_PORT` / `APED_BASE` (**`tools/_adresse.mjs:27,32,55` — le module d'adresse
importé par 27 outils**) · `APED_BRIDE` (`tools/palier-check.mjs:62,301`).

## A5. `google/Code.gs` — 24 occurrences, dont **7 qui touchent des services vivants**

| ligne | extrait | nature |
|---|---|---|
| `2` | `APED AGENCE — LE SERVICE DES FORMULAIRES` | en-tête |
| `127` | `apedagence@gmail.com` | commentaire |
| **`326`** | `DOSSIER_PIECES: "APED — pièces jointes des formulaires"` | **dossier Drive** |
| **`344`** | `DOSSIER_GUIDES: "APED — guides du lead magnet"` | **dossier Drive** |
| **`346`, `347`** | `aped-automatisation.pdf`, `aped-ia-croissance.pdf` | **noms de PDF sur Drive** |
| **`351`** | `NOM_CLASSEUR: "APED — demandes du site"` | **nom du classeur Sheets** |
| `462` | `Quatre vrais projets d'APED` | commentaire |
| `1768` | message d'erreur `APED_DIAG_CLE` | texte |
| **`1783`** | `service: "APED formulaires"` | **témoin de vie, vérifié par `tools/creneaux-check.mjs:470`** |
| **`4123, 4131, 4139, 4147`** | `"— William, APED\n819 523-0871"` | **signature des 4 relances** |
| `4428, 4430` | commentaires titre d'agenda | — |
| **`4460`** | `"Demande reçue par le site APED · 30 minutes."` | **corps de courriel** |
| **`4591`** | `name: "APED Agence"` | **nom d'expéditeur `MailApp`** |
| **`4787`** | `return "[APED] " + …` | **préfixe d'objet de TOUS les avis internes** |
| **`4812`** | `["", "— APED Agence", "Trois personnes, à Québec."]` | **signature client** |
| `5184` | commentaire | — |
| **`5199`** | `\|\| t.indexOf("Appel APED") === 0;` | **filtre de titres d'agenda, compatibilité** |
| `5274` | texte d'un rapport | — |

Objets de courriel côté site — `js/main.js:73-79` (`SUBJECTS`), répétés en secours
`:2314, :2526, :2667` : `"Nouveau projet - site APED"`, `"URGENCE - site APED"`,
`"Nouvelle reference - site APED"`, `"Demande d'estimation - site APED"`,
`"Demande de rendez-vous - site APED"`, `"Message - site APED"`,
`"Documents demandes - site APED"`.

## A6. Outils et tests
`tools/idempotence-check.mjs:273,274,683,700,706,720` — **assertions `/^\[APED\]/`
sur le préfixe d'objet**. `tools/creneaux-check.mjs:470` — `service === "APED formulaires"`.
`tools/agenda-multi-check.mjs:49` — `/^(☎ Appeler |▸ Meet · |Appel APED)/`.
`tools/confidentialite-check.mjs:128` — **assertion inverse** : `apedagence` ne doit
PAS paraître dans le HTML.
`tools/css-critique.mjs:213` — **réinjecte `APED AGENCE — ${nom}` à chaque
génération de `critique.css` / `differe.css`**.
`tools/cadeau-check.mjs:248` — `/documents\/aped-[a-z-]+\.pdf/`.
`tools/couvertures.mjs:33,34` · `tools/pdf.mjs:28,37,38` — les noms de source PDF.
`tools/prix-check.mjs:117,249` — `pas un tarif APED`.
Adresse de test fabriquée `test-parcours@aped-verification.ca` :
`tools/_sondes/cro-assistant.mjs:50`, `cro-envoi-reel.mjs:41`, `cro-formulaire.mjs:15,20`.
Queue : ~98 outils à 1 occurrence, presque tous `sessionStorage.setItem("aped-sans-popup","1")`.

## A7. Documentation
`CLAUDE.md:1, 45, 122, 126, 210` · `ARCHITECTURE.md` 14 · `RESERVES.md` 22 ·
`ANIMATIONS.md` 20 · `docs/CONFIGURATION-GOOGLE-APED.md` **28** ·
`DECISIONS.md:622,627,648,688,983` · `decisions/index.md` 7 · les 16 journaux de
`decisions/` portent tous l'en-tête `APED AGENCE - …` recopiée de la source ·
`demos-secteurs/STANDARD.md:27,39,50,60,147` · `demos-secteurs/plans/*.md` (8 fichiers) ·
`DESIGN-STACK.md`, `SECTIONS.md`, `REFONTE-CHECKLIST.md`, `REFONTE-IMMERSIVE.md`,
`PIEGES.md:234`, `MESURES.md:168`, `google/guides/LISEZ-MOI.md:6,17`.

## A8. Commentaires de code
En-tête `APED AGENCE - …` en ligne 1 de : `css/app.css`, `css/base.css`,
`css/tokens.css`, `css/tour360.css`, `css/secteurs.css`, `css/critique.css`,
`css/differe.css`, `js/main.js`, `js/langue.js`, `js/motion.js`, `js/tour360.js`,
`documents/src/print.css`, `.env.local`, `.env.local.example`.

## A9. Compte total par fichier (tête du classement)

```
49  documents/src/aped-ia-croissance.html    8  tools/palier-check.mjs
48  js/main.js                                8  tools/classeur-check.mjs
44  documents/src/aped-automatisation.html    8  confidentialite.html
28  docs/CONFIGURATION-GOOGLE-APED.md         7  tools/verif.mjs
25  tools/_m-prix.txt                         7  decisions/index.md
24  google/Code.gs                            7  404.html
22  RESERVES.md                               7  .env.local
20  ANIMATIONS.md                             6  tools/trame-check.mjs
16  refonte-captures/formulaires-e2e.json     6  tools/idempotence-check.mjs
14  index.html                                6  tools/formulaires-prod.mjs
14  ARCHITECTURE.md                           5  CLAUDE.md · DECISIONS.md
13  js/langue.js                              5  demos-secteurs/STANDARD.md
12  tools/retenue-check.mjs                   5  tools/{estimateur-vue,estimateur-check,
11  tools/reference-attaque.mjs                   config-envoi,appel-check,accueil-check}
 9  tools/{estimateur-attaque,cas-tordus-check}   … puis ~98 fichiers à 1 occurrence
 9  decisions/{js-main,js-hero}.md
```

---

# VOLET B — LES RÈGLES DE DESIGN DE L'ANCIENNE IDENTITÉ

## B1. La palette ciment / encre / minium
Source unique **`css/tokens.css:62-121`**, deux blocs `:root[data-theme=…]`.

Clair : `--surface-0 #dcdedb` *(ciment froid)* · `--surface-1 #cbcec9` ·
`--surface-2 #f2f3f1` · `--surface-inverse #101211` · `--ink #101211` ·
`--ink-muted #565a57` · **`--accent #c8371b` *(minium, aplat uniquement)*** ·
`--accent-text #9b2810` · `--accent-ink #f2f3f1` · `--accent-wash rgb(200 55 27/.10)` ·
`--accent-on-inverse #ff7a52` · `--rule rgb(16 18 17/.16)` · `--rule-strong …/.38` ·
`--rule-accent #c8371b` · `--danger #a11a10` · `--ok #1d5c34` · `--scrim …/.72`.

Sombre : `--surface-0 #101211` · `#191c1a` · `#232724` · `--ink #dcdedb` ·
`--ink-muted #9aa09c` · `--accent #e8562f` · `--accent-text #ff7a52` ·
`--accent-on-inverse #9b2810` · `--danger #ff8b7a` · `--ok #6fcf8f`.

Typographie de marque (`tokens.css:133-135`) : `--font-display "Archivo"` ·
`--font-text "Chivo"` · `--font-data "Martian Mono"`. Six `.woff2` dans `fonts/`,
les trois `-latin` préchargés (`index.html:24-26`). `@font-face` `tokens.css:4-60`.

**Valeurs en dur ailleurs** : `documents/src/print.css` 16 · `aped-ia-croissance.html`
15 · `css/differe.css` 12 (généré) · `css/app.css` 12 · `tools/og.mjs` 6
(dont `repeating-linear-gradient(90deg, #c8371b 0 2px, …)` l. 54) · `js/main.js` 6 ·
`js/hero.js` 6 · `images/favicon.svg` 5 · `confidentialite.html` 5 · `404.html` 5 ·
`index.html` 3 (dont `theme-color` l. 19, 57) · `tools/apercu-panos.mjs` 4 ·
`logo-lockup.svg` 3 · `logo-mark.svg` 1 · `css/tour360.css` 3 · `js/trame.js` 1 ·
`tools/forge-check.mjs` 1 (`--chambre` = `#060807`, **token qui n'existe plus**).

## B2. Les interdits — rayon 0, aucune ombre, aucun dégradé, aucun flou

**Écrits** : `CLAUDE.md:87-118` (§ INTERDITS ABSOLUS) et `:119-122` (l'exception
`demos-secteurs/`) · `ARCHITECTURE.md:322-323, 678` · `DECISIONS.md:627` (D-663),
`:648` (D-674) · `demos-secteurs/STANDARD.md:39,50,60,147` ·
`decisions/css-tokens.md:33` · `decisions/js-trame.md:43` ·
`decisions/css-app.md:1775, 1912` (« ⚠ TOUT CE QUI SUIT VIOLE VOLONTAIREMENT LES
CINQ INTERDITS »).

**Appliqués** : **`css/tokens.css:186` `--radius: 0;`** — le token verrou ·
`css/tokens.css:184` « Une seule valeur. Aucune ombre nulle part. » ·
`css/app.css:466,814,855,933,944,1268,1276` `border-radius: var(--radius)` ·
`:1938`, `:3383` `border-radius: 0` explicite · bannières `:914, 2006, 6075, 6570,
6690, 6723, 6801, 5453`.
**Zone d'exception** : `css/app.css:3439` « LES INTERDITS DU SITE NE S'APPLIQUENT
PAS ICI, ET C'EST LE SUJET. D-518 » — les maquettes `.gab*` / `.ba-*` utilisent
`border-radius` sur ~31 lignes (3551 → 4546).
Densité de propriétés interdites : `app.css` **92** occurrences de
`box-shadow|text-shadow|gradient|blur(|backdrop-filter`, `differe.css` **84**,
`critique.css` 10, `tour360.css` 2, `base.css` 1, `secteurs.css` 0, `tokens.css` 0.
La plupart sont des `repeating-linear-gradient` — les « trames », tolérées.

**Vérifiés par du code** : `tools/confidentialite-check.mjs:139` (ombres),
`:140-142` (dégradés non-`repeating-`), `:146` (`backdrop-filter`) ·
`tools/cas-tordus-check.mjs:482` · `tools/reference-attaque.mjs:1038` ·
`tools/suggestions-check.mjs:219-220,269` · `tools/etats-check.mjs:79` (le filet
d'un champ refusé **doit** être une trame) · `tools/svc-bug.mjs:198`.

## B3. Les quatre verbes

**Écrits** : `CLAUDE.md:124-138` (dont la règle d'admission l. 137-138) ·
`ARCHITECTURE.md:502` · `ANIMATIONS.md:32, 389` (§ 1.13) ·
`decisions/js-langue.md:78,84,104` · `decisions/js-motion.md:402` ·
`decisions/css-app.md:2417,2839` · `decisions/js-limaille.md:36`.

**Dans le code** : `js/langue.js:195` `var verbe = seuil.getAttribute("data-verbe")`
— **le dispatch**. V1 `degager` (200,216,220,243,244,249) · V2 `aligner` (273,274) ·
V3 `souder` (288,289,498,499) · V4 `cran` (301,302,319) · cinquième cas `volet`
(~215, variante de V1). Paliers : `js/langue.js:19-29` `PALIER` + `calibrer()`,
`:35-47` `monterAuPalier(n)`.
`js/limaille.js` — moteur de grains, 22 occurrences du mot « limaille ».
`js/trame.js` — `sortie(u)` amortissement critique ζ = 1 (l. 8-9), `grain()` l. 12,
`AXES` l. 20-34, **`root.APED_TRAME = API;` l. 195**.
`js/main.js:569` (V2), `:577` (V4 odomètre), `:1111` (V1), `:1140`, `:1470`,
`:1823-1824`, `:5247` (`APED_ROULER`). `js/hero.js:43` (`BIG = "APED"` + limaille).
**HTML** : `index.html` porte `data-verbe="degager"` ×3, `"aligner"` ×4, `"cran"` ×1,
`"volet"` ×2 · `data-souder` l. 963 · `data-degage="haut"` l. 3184.
`404.html` et `confidentialite.html` : **aucun**.

## B4. Vocabulaire à retirer de la doc

| mot | fichiers les plus chargés |
|---|---|
| **limaille** | `js/limaille.js` 22 · `ANIMATIONS.md` 20 · `decisions/index.md` 15 · `ARCHITECTURE.md` 10 |
| **sas** | `REFONTE-IMMERSIVE.md` 30 · `DECISIONS.md` 23 · `tools/sas-check.mjs` 20 · `ANIMATIONS.md` 18 · `RESERVES.md` 17 · `PIEGES.md` 17 |
| **minium** | `css/app.css` 33 · `css/differe.css` 28 · `decisions/css-app.md` 24 · `ANIMATIONS.md` 9 |
| **ciment** | `decisions/css-app.md` 13 · `decisions/js-langue.md` 7 · **`css/tokens.css` 2 (la source)** |
| **encre** | `css/app.css` 44 · `css/differe.css` 39 · `decisions/css-app.md` 35 · `tools/pire-pixel.mjs` 16 |
| **trame** | `ANIMATIONS.md` 33 · `tools/trame-check.mjs` 24 · `decisions/js-langue.md` 21 |
| **palier** | `ANIMATIONS.md` 94 · `tools/palier-check.mjs` 46 · `css/app.css` 45 · `js/langue.js` 28 |
| **chambre noire** | `index.html` 3 (314, 2124, 3119) · `css/app.css` 2 · `css/critique.css` 2 · **`css/tokens.css:124`** |
| **cran** | comptes élevés partiellement faussés : « écran » contient « cran » |

## B5. Les outils qui VERROUILLENT l'ancien design

`trame-check.mjs` (verrouille `APED_TRAME`, `sas-ok`, les 3 sas) ·
`langue-check.mjs` (verrouille les 4 verbes) · `palier-check.mjs` (paliers 0-3,
`APED_BRIDE`) · `sas-check.mjs` · `forge-check.mjs` (exige `--chambre #060807`,
token disparu) · `hero-check.mjs` (la plaque de limaille) ·
`entree-check.mjs` (rideau de 15 filets) · `frontieres-check.mjs` (les 12 seuils) ·
`traversee-check.mjs` · `passages-cine.mjs` · `secteur-morph-check.mjs` ·
`etats-check.mjs` (`.btn ::before` pris par l'aplat de V4) ·
`svc-defile.mjs`, `svc-course.mjs`, `svc-sequences.mjs` (la piste collante) ·
`accueil-check.mjs` (cadrage codé sur la plaque, l. 770) ·
`og.mjs` (carte OG peinte à la main en `#c8371b` + Martian Mono) ·
`plaques.mjs` (photographie en mouvement PLEIN — **mécanisme à sauver**) ·
`estimateur-vue.mjs`, `reference-vue.mjs` (cadrages photo).
`css-critique.mjs:213` réinjecte le nom à chaque build.
`theme-check.mjs`, `contraste-*.mjs`, `pire-pixel.mjs` : agnostiques, ils survivent.
