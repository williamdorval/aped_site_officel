# SECTIONS — où vit chaque section du site

**Quand lire ce fichier :** dès qu'une demande nomme une section.
Il donne l'ancre, les plages de lignes et les sélecteurs. Il ne dit ni
pourquoi (`DECISIONS.md`) ni comment ça bouge (`ANIMATIONS.md`).

> **LE TABLEAU DES PLAGES EST GÉNÉRÉ.** `node tools/plages.mjs ecrire`
> le réécrit à partir du code ; `node tools/plages.mjs verifier` sort 1
> s'il a dérivé. **Aucun autre numéro de ligne ne figure dans ce
> document** — un numéro écrit à la main dérive à la première édition,
> et un index périmé coûte plus cher que pas d'index du tout. Le reste
> est désigné par **sélecteur**, qui ne périme pas.

- [Les plages](#plages)
- [Comment lire cet index](#lire)
- [Les douze entrées](#entrees) — [01](#s01) [02](#s02) [03](#s03) [04](#s04) [05](#s05) [06](#s06) [07](#s07) [08](#s08) [09](#s09) [10](#s10) [11](#s11) [pied](#pied)
- [Ce qui est commun aux onze](#commun)
- [Anomalies relevées](#anomalies)


<!-- INDEX:DEBUT -->

> **NE LIS PAS CE FICHIER EN ENTIER.** Cette table donne le titre exact
> de chaque partie et ce qu'elle coûte. Va chercher la seule qui répond :
> `grep -n "^## <titre>" <fichier>` puis lis la plage. Le titre est la clé —
> il ne périme pas, un numéro de ligne oui.

| Partie | Lignes | Jetons ~ |
|---|---:|---:|
| **Les plages** | 26 | 436 |
| **Comment lire cet index** | 58 | 787 |
| **01 · Accueil** | 27 | 289 |
| **02 · Services** | 54 | 771 |
| **03 · Réalisations** | 41 | 629 |
| **04 · Secteurs** | 20 | 317 |
| **05 · Visite 360** | 50 | 771 |
| **06 · Calculateur** | 21 | 304 |
| **07 · Comparatif** | 17 | 180 |
| **08 · Processus** | 27 | 352 |
| **09 · Référence** | 31 | 417 |
| **10 · Questions** | 24 | 310 |
| **11 · Contact** | 20 | 251 |
| **Pied de page** | 108 | 1 682 |

<!-- INDEX:FIN -->

---

<a id="plages"></a>
## Les plages

<!-- PLAGES:DEBUT -->

| № | Section | Ancre | `index.html` | l. | `css/app.css` | JS | autres |
|---|---|---|---|---:|---|---|---|
| 01 | **Accueil** | `#top` | 223-281 | 59 | 2124-2387 · 1608-1883 | `main.js` 370-475 | — |
| 02 | **Services** | `#services` | 282-900 | 619 | 2388-3036 | `main.js` 476-875 | — |
| 03 | **Réalisations** | `#realisations` | 901-1789 | 889 | 3037-4858 | `main.js` 876-1122 | — |
| 04 | **Secteurs** | `#demos` | 1790-2002 | 213 | 4859-5012 | `main.js` 4890-5084 · `langue.js` 524-612 | `css/secteurs.css` (entier, injecte par JS) |
| 05 | **Visite 360** | `#visite` | 2003-2082 | 80 | — | — | `css/tour360.css` · `js/tour360.js` (entiers) |
| 06 | **Calculateur** | `#calculateur` | 2083-2224 | 142 | 5013-5179 | `main.js` 4723-4889 | — |
| 07 | **Comparatif** | `#comparatif` | 2225-2347 | 123 | 5180-5306 | — | — |
| 08 | **Processus** | `#processus` | 2348-2576 | 229 | 5307-5649 | `main.js` 1123-1163 | — |
| 09 | **Référence** | `#reference` | 2577-2746 | 170 | 5650-5799 · 5800-6003 | — | — |
| 10 | **Questions** | `#faq` | 2747-2861 | 115 | 6171-6220 | `langue.js` 613-641 | — |
| 11 | **Contact** | `#contact` | 2862-3080 | 219 | 6221-6438 | `main.js` 1771-1804 · `main.js` 2149-2313 · `main.js` 2680-2781 | — |
| — | **Pied de page** | `#footer` | 3081-3140 | 60 | 6439-6510 | `main.js` 5536-5556 | — |

<!-- PLAGES:FIN -->

Les fichiers non listés ci-dessus se lisent en entier : `js/hero.js`,
`js/limaille.js`, `js/trame.js`, `js/pointe.js`, `js/motion.js`,
`css/tokens.css`, `css/base.css`.

<a id="lire"></a>
## Comment lire cet index

**L'ancre et le numéro de seuil ne se lisent pas au même endroit.**
Le numéro d'une section est celui que porte le rail (`#railList`). Le
seuil placé **en tête** de chaque section porte deux numéros :
`data-de` = la section qu'on quitte, `data-vers` = la section où l'on
entre. Le seuil qui ouvre `#services` porte donc
`data-de="01" data-vers="02"` — c'est la frontière **vers** la 02, pas
la frontière de la 01.

**Onze `[data-seuil]` pour onze sections plus un pied.** L'accueil
(`#top`) n'en porte aucun : c'est la première section, rien ne la
précède. Les dix autres en portent un chacune, plus celui du pied
(`data-de="11" data-vers="00"`). La section 09 · Agence a été retirée
le 2026-08-03 — `archives/2026-08-03-agence/` — et les trois qui la
suivaient ont reculé d'un cran : Référence 10→09, Questions 11→10,
Contact 12→11.

> **Les bannières de commentaire d'`index.html` n'ont PAS suivi.**
> `FRONTIERE 10 · 09 vers 10`, `FRONTIERE 11 · 10 vers 11` et
> `FRONTIERE 12 · 11 vers 12` ouvrent en réalité les seuils
> `08→09`, `09→10` et `10→11`. Les attributs sont justes ; c'est le
> commentaire qui est en retard d'un cran, et une recherche textuelle
> par numéro de frontière tombe donc à côté. Voir « anomalies ».

**`data-dress="encre"` habille la bande de seuil, pas la section.**
Trois bandes seulement depuis le 2026-07-31 : celles qui entrent dans
la 05, la 06 et dans le pied — et **toutes trois vivent dans un SAS**
(`div.sas[data-sas]`), HORS de leur section, pour qu'une arrivée par
ancre atterrisse après la piste. La bande du seuil 02 est redevenue
claire (D-570, l'arc de luminance). Le repérage d'un seuil se fait par
`data-vers`, jamais par la parenté DOM (D-578).

**La chambre noire.** `#visite` est la seule section sombre du site,
dans les deux thèmes : elle adopte le jeu de jetons du thème OPPOSÉ
(D-572). Les trois sas : descente (04→05, moment impossible — forge du
mot « Essayez. », piste **150vh** depuis D-630), remontée (05→06,
calque qui se dégage vers le haut, et son volet vit désormais DANS un
`div.sas-cache` qui le rogne — D-629), clôture (11→00, le fil se soude
dans la bande). Détail : `REFONTE-IMMERSIVE.md`, moteur `js/sas.js`.

**`css/app.css` est la seule source de style.** `critique.css` et
`differe.css` sont fabriqués par `node tools/css-critique.mjs` et ne
doivent jamais être édités. Deux sections ont en plus leur propre
feuille, chargée après la première peinture : `css/secteurs.css` (04)
et `css/tour360.css` (05).

**Les blocs de `app.css`, `main.js` et `langue.js` s'ouvrent par une
bannière `/* == TITRE == */`.** Un titre qui commence par un numéro
(`14.`, `11b.`) est un bloc de section ; les autres sont des
sous-blocs. C'est ce que `plages.mjs` lit pour calculer les bornes.

---

<a id="entrees"></a>
# LES DOUZE ENTRÉES

<a id="s01"></a>
## 01 · Accueil

| | |
|---|---|
| **Ancre** | `#top` |
| **Seuil** | aucun — première section |
| **Fond encre** | non |
| **Blocs CSS** | `12. HERO` · `11b. SEQUENCE D'ENTREE` |
| **JS** | `js/hero.js` (entier) · `js/limaille.js` (moteur de grains) · `js/motion.js` blocs 1 et 2 · `js/main.js` bloc `SEQUENCE D'ENTREE` |

**Composants**, dans l'ordre du document :

`p.label.hero-eyebrow` → `#heroPlate` + `h1.plate-text` + `#heroCanvas`
→ `p.hero-claim` (2 × `span.ligne`) → `p.hero-sub` →
`div.hero-cta` (primaire `modal-start`, secondaire `modal-estimate`) →
`aside.hero-fiche` (`ol.fiche-rows`, 4 rangées, `p.fiche-foot`) →
**`p.hero-socle.he`** (filet `.fiche-rule` + 3 × `span > b`).

La composition compte **douze** pas ; chacun porte son retard en
millisecondes dans `--e` (0 → 1320), écrit dans le document. Le socle
est le douzième.

> Les huit plaques d'atelier sont parties le 2026-07-30. Tout est
> archivé dans `archives/2026-07-30-plaques-accueil/`.
> Argument : `DECISIONS.md § 2026-07-30 · après-midi`.

<a id="s02"></a>
## 02 · Services

| | |
|---|---|
| **Ancre** | `#services` |
| **Seuil** | `01 → 02` · nom **« Services »** |
| **Verbe / sens** | `data-verbe="volet"` `data-sens="bas"` — porte la trame |
| **Fond encre** | non — la bande est redevenue claire le 2026-07-31 (D-570, l'arc de luminance) |
| **Blocs CSS** | `14. SERVICES` (le rail lui-même vit dans un seul `@media (min-width: 48em) and (prefers-reduced-motion: no-preference)`) |
| **JS** | `js/main.js` bloc `SECTION 02` — `svcRail()`, `relire()`, `marquer()`, `image()`, `allerA()`, `viser()`, `surAncre()`. **Rien dans `motion.js`, rien dans `langue.js`** |

**Les trois boîtes de la piste — et il en faut exactement trois**

| Boîte | Rôle |
|---|---|
| `.svc-piste[data-svc-piste]` | porte la **course**. Un écran plus (n − 1) × `--svc-pas`. Ne contient rien d'autre |
| `.svc-scene[data-svc-scene]` | ce qu'on **voit**. `position: sticky`, un écran de haut |
| `.svc-vitre` | **rogne** le rail — et c'est pour ça que les fiches vivent DEHORS : un `position: fixed` posé sous un ancêtre transformé et rogné s'affiche coupé |

**Composants** : seuil → `div.head` (h2 « Ce qu'on livre. ») →
`div.svc#svc` (porte `--svc-marge`, `--svc-gap`, `--svc-larg`,
`--svc-fin`, `--svc-pas`, `--svc-n`) → `.svc-piste > .svc-scene`, qui
tient **trois rangées** :

1. `.svc-tete > .wrap.svc-tete-in` — `.head` (h2 + une ligne) et
   l'odomètre `p.svc-compte > b.svc-roul[data-svc-compte]`. **La tête
   est DANS la scène collante** : c'est ce qui supprime l'écran vide à
   l'entrée.
2. `.svc-vitre > ol.svc-planche[data-svc-rail]` — **six** `li.svc-plan` :
   cinq services (`#svc-01` … `#svc-05`) et le panneau de clôture
   `li.svc-plan--fin#svc-fin[role=none]`.
3. `.svc-pied > .wrap` — `p.svc-reserve`, la réserve sur les délais,
   visible à **toutes** les largeurs.

Par service : `p.svc-plan-num` · `div.svc-plan-bas` (`h3.svc-plan-nom`
· `p.svc-plan-dit` · `p.svc-plan-delai` · `div.svc-porte >
a.svc-plus[data-svc-ouvre]`).

Les **cinq fiches** sont hors de la piste, dans
`div.svc-fiches[data-svc-fiches]` : `article.svc-fiche[id][tabindex=-1]`
→ `.svc-fiche-barre` (numéro + `button[data-svc-ferme]`) ·
`.svc-fiche-in` (`.svc-fiche-tete` · `.svc-fiche-corps` =
`.svc-fiche-dit` + `.svc-fiche-cote` avec `ol.svc-recu` et
`ul.svc-specs` · `.svc-fiche-pied` avec `.svc-fiche-actes`).
La fiche 05 porte en plus `.svc-plan2d-duo` — deux SVG **redessinés**,
jamais capturés.

**Ce que la section ne contient PAS** : aucun `ScrollTrigger`, aucun
pin, aucune image, aucun détournement de molette, aucun état de
défilement indépendant à tenir en accord avec la position de page —
**la position horizontale EST une fonction de la position de page**, et
c'est ce qui rend le bug d'ancre structurellement impossible.

<a id="s03"></a>
## 03 · Réalisations

| | |
|---|---|
| **Ancre** | `#realisations` |
| **Seuil** | `02 → 03` · nom **« Démonstrations »** |
| **Verbe / sens** | `data-verbe="degager"` `data-sens="bas"` `data-cible=".ba:first-of-type .ba-scene"` — porte la trame |
| **Fond encre** | non |
| **Blocs CSS** | `15. AVANT / APRES`. **L'unité y est le `cqw`** : `1cqw = 10 px de maquette`, sur une page de référence de 1 000 px. Seuls les filets restent en `1px`. Quatre sous-blocs d'« avant », chacun sous son propre préfixe : `.v11` (2011), `.ann` (annuaire), `.tou` (office de tourisme), `.gab` (gabarit 2019) |
| **JS** | `js/main.js` bloc `SECTION 03` — `avantApres()`. **Rien dans `motion.js`, rien dans `langue.js`** |

**Composants** : seuil → en-tête (h2 « Ce qu'on voit encore. Ce que ça
Après. » + une ligne) → `p.ba-sans[hidden]` (repli sans script) →
`div.wrap > div.ba-grille[data-souder]` → **4** `article.ba[id]` :
`#ba-garage`, `#ba-design`, `#ba-restaurant`, `#ba-renovation`.
Grille **deux par deux** à partir de 56em.

Par comparaison : `.ba-cadre[data-ba] > .ba-scene` (porte
`container-type: inline-size` et `--ba-p`) > `.ba-vue--apres` et
`.ba-vue--avant[role=img][aria-label]`, chacune contenant un
`div.ba-page` ; puis `.ba-etq--a` / `.ba-etq--b`, `i.ba-trait` et
`input.ba-poignee[type=range][data-ba-curseur]`. Sous le cadre :
`p.ba-tete` (numéro + métier + nature de l'avant) et `p.ba-dit`
(**une** phrase). La section se ferme sur `p.ba-fin`.

Le vocabulaire de l'« après » est commun aux quatre : `.ap-nav`,
`.ap-hero` (deux colonnes — l'objet lourd part à DROITE, sinon la
moitié visible au repos est vide), `.ap-fiche`, `.ap-tel`,
`.ap-bande > .ap-fait`, `.ap-bloc` (+ `.ap-cartes`, `.ap-liste`,
`.ap-rail`, `.ap-grille`, `.ap-champ`, `.ap-menu`), `.ap-pied`.
La maquette de 2011 : `div.v11 > table.v11-page[role=presentation]`.
La maquette APED : `div.ap > .ap-nav + .ap-corps`, composition
**différente** pour chacun des trois.

**Le cran est du CSS pur.** Deux `<input type="radio">` natifs et deux
règles `:has(:checked)`. Il fonctionne sans une ligne de JavaScript —
un bloc `<noscript><style>` de quatre règles dans le `<head>` supplée
`differe.css`, qui est lui-même injecté par script. C'est **le seul
`<noscript>` du site**.

<a id="s04"></a>
## 04 · Secteurs

| | |
|---|---|
| **Ancre** | `#demos` — la plus longue section du document |
| **Seuil** | `03 → 04` · nom **« Secteurs »** |
| **Verbe / sens** | `data-verbe="aligner"` `data-sens="droite"` `data-cible=".sector-group"` — pas de trame |
| **Fond encre** | non |
| **Blocs CSS** | `16. SECTEURS` · `V4 · LES PASTILLES DE SECTEUR` · **`css/secteurs.css` entier** — 290 lignes depuis D-681 : le cadre, la vitre, le calque vivant, et le **treizième** aperçu, seul encore dessiné |
| **JS** | `js/main.js` blocs `Apercu des secteurs` et `AU TACTILE IL N'Y A PAS DE SURVOL` · `js/langue.js` bloc `5. LES SECTEURS` (`blocsDe()`, `filetDe()`, `recomposer()`) |

**Composants** : seuil → `div.head` (h2 « Le style change selon le
métier. ») → `div.sectors-list` (3 × `div.sector-group` — Commerce et
service au public, Métiers et chantier, Santé et professions — et 13
boutons `.sector-pills button[data-sector]`) → `div.sectors-grid >
figure.sector-preview#sectorPreview > #mockStage` →
`template#tplSecteurs` (13 maquettes `.mock[data-mock]`) →
`figcaption#sectorCaption` (`role="status"`, `aria-live="polite"`).

<a id="s05"></a>
## 05 · Visite 360

| | |
|---|---|
| **Ancre** | `#visite` — **seule section ouverte en colonne 0** |
| **Seuil** | `04 → 05` · nom **« Visite 360 »** |
| **Verbe / sens** | `data-verbe="volet"` `data-sens="bas"` — porte la trame |
| **Fond encre** | **oui** |
| **Blocs CSS** | **`css/tour360.css` entier**. **Aucune règle `.tour` dans `css/app.css`** |
| **JS** | `js/tour360.js` (entier) · `js/main.js` pose le déclencheur `[data-tour-start]` · `js/trame.js` pour le passage d'une pièce à l'autre · `js/motion.js` bloc `6. LE CADRE DE LA VISITE` |

**Composants** : seuil → en-tête (`p.head-index` « Démo · Immobilier »,
h2, chapô de **sept mots**) → `div.tour[data-tour]` contenant **le
cadre à trois étages** `div.tour-cadre` : `p.tour-manifeste` (nom + les
trois pièces) → `div.tour-stage[data-tour-stage]` avec `<img>` d'affiche
et `p.tour-lieu` (« 01 · Terrasse ») → `div.tour-pupitre`
(`div.tour-enter` = `p.tour-enter-note` + bouton `[data-tour-start]` /
`[data-tour-label]`, **et** `p.tour-encours` qui prend sa place une fois
la visite ouverte). Puis, **hors du cadre**, `p.fine.tour-source` —
provenance des panoramas et licence du moteur.

> **Le pied de trois gestes n'existe plus** (D-632, 2026-08-03).
> `div.tour-pied` et `ul.tour-gestes[data-settle]` sont partis : ils
> nommaient avant le clic des gestes qu'on ne peut pas encore faire,
> et répétaient le pupitre une fois dedans. Le mode d'emploi vit
> maintenant dans `p.tour-encours` seul, qui nomme aussi le clavier.
> `p.tour-source` est devenue une **légende de cadre** d'une ligne,
> sans filet — un second trait à 24 px du premier fait une rayure,
> pas une structure. Conséquence à connaître : `[data-settle]` n'a
> de nouveau **aucune cible** dans le document.

> **LE CONTRAT AVEC LE LECTEUR EST FAIT DE SÉLECTEURS.** `tour360.js`
> ne connaît que `[data-tour]`, `[data-tour-stage]`, `[data-tour-start]`,
> `[data-tour-label]`, `[data-tour-poster]` et les classes `.is-loading`
> / `.is-live`. Tout le reste du cadre est libre — mais renommer un de
> ces six-là casse la visite **en silence**.
> Preuve que le lecteur fonctionne : `node tools/visite-sequence.mjs`,
> 19 constats et 7 images. Lire son en-tête avant de s'en servir : il
> photographie en **mouvement réduit**, et la raison est mesurée.

> **ET C'EST EXACTEMENT CE QUI A CACHÉ D-629 PENDANT DEUX JOURS.**
> `html.sas-ok` se décide dans le `<head>` avec
> `!prefers-reduced-motion` : en mouvement réduit, **la géométrie des
> sas n'existe pas**. Une planche prise dans ce mode ne peut
> structurellement pas voir un défaut de sas — et le volet du calque
> de la remontée recouvrait 88 % de cette section-ci. Pour juger la
> 05, `node tools/plaques.mjs visite <nom>` : mouvement **plein** par
> défaut. Piège 84.

<a id="s06"></a>
## 06 · Calculateur

| | |
|---|---|
| **Ancre** | `#calculateur` |
| **Seuil** | `05 → 06` · nom **« Calculateur »** |
| **Verbe / sens** | `data-verbe="volet"` `data-sens="haut"` — porte la trame. **Réciproque du seuil 05** : on entre dans l'instrument à la Visite, on en ressort ici |
| **Fond encre** | **oui** |
| **Blocs CSS** | `17. CALCULATEUR` · `9. CURSEURS` · `V4 · L'ODOMETRE` |
| **JS** | `js/main.js` bloc `Calculateur.` — `repartir()`, `roiUpdate()`, ressort `Spring()`, odomètre `rouler()` / `finirRoulement()` / `caseCran()` / `rouleUn()`, panneau « Ajuster en détail » |

**Composants** : seuil → en-tête (`p.head-index` « On ne vous demande
rien ») → `#roiPresets` (7 boutons de profil) → `div.roi-verdict`
(`#roiWeekly`, `#roiImpact`, `#roiAnnounce` en `sr-only`) →
`div.roi-grid > div.roi-inputs` (3 curseurs maîtres `#inEmp`,
`#inRate`, `#inAdmin`) → `details.roi-details#roiDetails` (`#inRev` + 8
curseurs `#task1`…`#task8`) → `div.roi-panel` (2 barres `#barManual` /
`#barAuto`, `ol.roi-top3`, formulaire `#roiMailForm`,
`details.roi-details--panel`).

<a id="s07"></a>
## 07 · Comparatif

| | |
|---|---|
| **Ancre** | `#comparatif` |
| **Seuil** | `06 → 07` · nom **« Comparatif »** |
| **Verbe / sens** | `data-verbe="aligner"` `data-sens="droite"` `data-cible=".vs-row"` — pas de trame |
| **Fond encre** | non |
| **Blocs CSS** | `18. COMPARATIF` |
| **JS** | `js/motion.js` blocs `9. Piste du comparatif` et `9bis. LE SCHEMA DE L'ECART` |

**Composants** : seuil → `div.head` (h2 « À la main contre
automatisé. ») → `div.ecart[data-ecart]` (libellé, `.ecart-corps`,
résumé `p.sr-only`) → `p.label.ecart-sous` → `div.vs#vsTable` (6 ×
`div.vs-row[data-manual][data-auto]`, 12 barres `[data-bar]`).

<a id="s08"></a>
## 08 · Processus

| | |
|---|---|
| **Ancre** | `#processus` |
| **Seuil** | `07 → 08` · nom **« Processus »** |
| **Verbe / sens** | `data-verbe="aligner"` `data-sens="droite"` `data-cible=".parc-etape"` — pas de trame |
| **Fond encre** | non |
| **Blocs CSS** | `19. PROCESSUS` |
| **JS** | `js/main.js` bloc `PARCOURS` (`poser(i)`) · `js/motion.js` blocs `8. Ligne du processus`, `8bis. LES QUATRE COMPOSANTS`, `12. Frise du processus` |

**Composants** : seuil → `div.head` (h2 « Comment ça se passe. ») →
`.parc-bar` (`#parcNum` / 04, `#parcNom`, `#parcReste`) → `ol.parc#parc`
(4 × `li.parc-etape[data-parc]`, chacune avec son `.parc-vis` : On se
parle, On dessine, On code, On met en ligne).

> **LA SECTION 09 · AGENCE A ÉTÉ RETIRÉE le 2026-08-03.** Ancre
> `#apropos`, bloc CSS `20. A PROPOS`, blocs `12ter` et `12bis` de
> `js/motion.js`, `.agc-txt h3` dans la liste des sous-titres de
> `js/langue.js`, et le seuil `08 → 09` en `souder` qui était **le
> seul sans `data-cible`**. Tout est dans
> `archives/2026-08-03-agence/`. Les blocs `21.` à `24.` d'`app.css`
> ont **gardé leurs numéros** : il n'y a plus de `20.`, et c'est
> voulu — renuméroter quatre bannières pour combler un trou fait
> mentir tous les `grep` du dépôt d'un coup.

<a id="s09"></a>
## 09 · Référence

| | |
|---|---|
| **Ancre** | `#reference` |
| **Seuil** | `08 → 09` · nom **« Référence »** |
| **Verbe / sens** | `data-verbe="cran"` `data-sens="droite"` `data-cible=".referral-max .num"` — **seule frontière en V4 · CRAN** ; pas de trame |
| **Fond encre** | non pour la bande de seuil — mais la section porte le seul aplat sombre de la page dans **les deux thèmes** |
| **Blocs CSS** | `21. REFERENCE` · `21b. LES CONDITIONS` |
| **JS** | `js/motion.js` bloc `13. Programme de reference` · `js/main.js` « LES TIROIRS » |

**Composants** : seuil → `div.plate.referral > div.referral-head`
(libellé + h2 « Vous présentez. On encaisse ensemble. ») →
`p.referral-max` (« Jusqu'à » + `b.num`, cible du cran de frontière) →
`ol.referral-steps[data-ref]` (4 temps) → `i.referral-line` →
`div.referral-foot` (`div.referral-portes` : bouton `modal-refer` +
`#refVoir[data-tiroir="refPanneau"]` — puis mention fine) →
`div#refPanneau[hidden]` (la grille et les conditions).

**Le texte des conditions est GÉNÉRÉ.**  D-773 · Il vit entre
`<!-- CONDITIONS:DEBUT -->` et `<!-- CONDITIONS:FIN -->`, à **deux**
endroits — ici et dans l'écran 7 de `#modal-refer`. Source :
`conditions/reference-<version>.md`. `node tools/conditions.mjs
ecrire` les réécrit, `verifier` sort 1 s'ils ont dérivé. **On ne les
modifie jamais à la main.**

**Aucune animation sur le panneau**, et c'est la règle d'admission :
un dépliement n'est aucun des quatre verbes. Voir `ANIMATIONS.md`
A136b.

<a id="s10"></a>
## 10 · Questions

| | |
|---|---|
| **Ancre** | `#faq` |
| **Seuil** | `09 → 10` · nom **« Questions »** |
| **Verbe / sens** | `data-verbe="degager"` `data-sens="droite"` `data-cible=".faq-item"` — porte la trame |
| **Fond encre** | non |
| **Blocs CSS** | `22. FAQ` · `.faq-item::before` dans le bloc des micro-états |
| **JS** | `js/langue.js` bloc `7. LA FAQ`, qui s'appuie sur le FLIP maison `flip()` du bloc `0. FLIP MAISON` |

**Composants** : seuil → `div.faq-head.head` (`p.head-index` «  9
questions », h2, chapô, plus `div.faq-aside` : libellé, lien `mailto`,
bouton `modal-booking`, mention fine) → `div.faq-grid > div.faq-list`
→ **9** `details.faq-item` : prix, automatisation, délai, modification,
maintenance, propriété, technologies, résultat, région.

> **Une fausseté dans la FAQ est plus grave que dans le hero.** Celui
> qui ouvre la FAQ est un prospect sérieux, et c'est celui-là qui la
> reproche au téléphone. `accueil-check contenu` lit `textContent` et
> non `innerText` pour cette raison : les réponses vivent dans des
> `<details>` repliés, qu'`innerText` ne voit pas.

<a id="s11"></a>
## 11 · Contact

| | |
|---|---|
| **Ancre** | `#contact` |
| **Seuil** | `10 → 11` · nom **« Contact »** |
| **Verbe / sens** | `data-verbe="degager"` `data-sens="bas"` `data-cible=".cell"` — porte la trame |
| **Fond encre** | non |
| **Blocs CSS** | `23. CONTACT` |
| **JS** | `js/main.js` blocs `Validation.`, `Envoi`, `LE REPLI QUI LIVRE` · `js/motion.js` bloc `13bis. « Ce qui arrive après »` · `js/langue.js` blocs `3. DEGAGER` (les `.cell h3`) et `9. LES MODALES` |

**Composants** : seuil → `div.head` (h2 « Cinq façons de nous
joindre. ») → `div.bento` (5 × `button.cell` : Démarrer votre projet
`cell--lead`, Estimation rapide `cell--moyen`, Réserver un appel
`cell--moyen`, Urgence, Référer une entreprise) →
`div.suite[data-suite]` (frise « Ce qui arrive après votre message », 3
temps) → `ul.contact-sur` (4 réassurances) → `p.contact-direct`
(adresse courriel en clair).

<a id="pied"></a>
## Pied de page

| | |
|---|---|
| **Ancre** | aucune — le pied n'est pas dans le rail ; `#contenu` sur `<main>` sert au lien d'évitement |
| **Seuil** | `11 → 00` · nom **« Fin de la traversée »** · `div.seuil.seuil--pied` |
| **Verbe / sens** | `data-verbe="volet"` `data-sens="bas"` `data-cible=".footer-mark"` — porte la trame |
| **Fond encre** | **oui** |
| **Blocs CSS** | `24. PIED DE PAGE` · `.footer-mark` · `.footer-docs-mot` |
| **JS** | `js/main.js` bloc `LA DOUZIEME FRONTIERE` · `js/langue.js` bloc `0bis. LES DOUZE FRONTIERES` · `js/trame.js` |

**Composants** : seuil du pied → `div.footer-left` (h2 « On commence
quand vous voulez. », `ul.footer-points`, bouton `modal-start`) →
`p.footer-docs-mot` + `ul.footer-docs` (les deux PDF) →
`div.footer-right` (`span.footer-mark` SVG cible du cran,
`a.footer-mail`, `nav.footer-nav`) →
`p.footer-mega[data-degage="haut"]` (**seul `data-degage` du
document**) → `div.footer-legal`.

---

<a id="commun"></a>
# CE QUI EST COMMUN AUX ONZE

> **Les bannières de bloc disent toujours « DOUZE », et on ne les
> renomme pas.** `1bis. LES DOUZE SEUILS` (`app.css`),
> `0bis. LES DOUZE FRONTIERES` (`langue.js`),
> `LA DOUZIEME FRONTIERE` (`main.js`) sont les poignées de `grep`
> du dépôt : les renommer casserait toutes les adresses de ce
> document et de `ANIMATIONS.md` pour corriger un chiffre. Elles
> désignent le mécanisme, pas le compte — qui est **onze** depuis le
> 2026-08-03.

| Objet | HTML | Bloc CSS | JS |
|---|---|---|---|
| Les onze seuils | `[data-seuil]` ×11 | `1bis. LES DOUZE SEUILS` | `langue.js` `0bis. LES DOUZE FRONTIERES` · `main.js` `G2 · LE CRAN DE LA FRONTIERE` |
| En-tête de section | `.head` ×9 (dont `.faq-head.head`) | `2. EN-TETE DE SECTION` | `motion.js` `10. Titres de section` (`couperEnLignes()`) · `langue.js` `2. LES MOTS` (`decouperMots()`) |
| Navigation, en-tête collant | `nav` | `3. NAVIGATION` | `main.js` |
| Rail / index collant | `#railList` | `5. INDEX COLLANT` · `N1 · LE CURSEUR DU RAIL` | `main.js` `Index collant`, barre de lecture |
| Menu plein écran | `.menu` | `6. MENU PLEIN ECRAN` | `main.js` `Menu plein ecran` |
| Boutons (V4 · CRAN par lettre) | partout | `4. BOUTONS` · `V4 · LES LETTRES` · `LES DEUX BOUTONS DU HERO` | `langue.js` `1. LES LETTRES` (`decouper()`, `positionner()`, `amorcerLettres()`) |
| Séquence d'entrée / rideau | `.entree` | `11b. SEQUENCE D'ENTREE` | `main.js` `SEQUENCE D'ENTREE` · `hero.js` |
| Popup cadeau | `<dialog>` | `11c. LE CADEAU` | `main.js` `LE CADEAU` |
| 6 modales | `modal-start`, `modal-booking`, `modal-project`, `modal-urgent`, `modal-refer`, `modal-estimate` | `10. MODALES` · `8. CHAMPS` · `11. CALENDRIER` | `main.js` · `langue.js` `9. LES MODALES` |
| La pointe (curseur) | — | `4b. LA POINTE` · `V4 · L'ETIQUETTE DE LA POINTE` | `pointe.js` (entier) · `langue.js` `8. L'ETIQUETTE DE LA POINTE` |
| Le passage (trame) | voiles `[data-passage]` créés à la volée | — | `trame.js` : `APED_TRAME.degager()` · `.couvrir()` · `.inverse()` · `.tout_arreter()` |
| Points de rupture | — | `26. POINTS DE RUPTURE` | — |
| Budget de dégradation | — | `LE BUDGET DE DEGRADATION — la moitie CSS` | `langue.js` `LE BUDGET DE DEGRADATION` (`monterAuPalier()`) |

---

<a id="anomalies"></a>
# ANOMALIES RELEVÉES

1. **`[data-settle]` n'a plus aucune cible.** `js/motion.js` bloc 11
   anime `$$("[data-settle]")`. Le bloc tourne à vide. Il en avait
   deux jusqu'au 2026-08-03 — `ol.agc-liste` et `ul.tour-gestes` —
   parties avec la section 09 et avec le pied de la visite.

2. **`[data-count]` n'a plus aucune cible.** `js/motion.js` bloc 5 et
   le repli de mouvement réduit itèrent sur `[data-count]`. Les
   compteurs de la bande de spécification ont été remplacés, puis
   retirés.

3. **Trois bannières de frontière sont en retard d'un cran.**
   `FRONTIERE 10 · 09 vers 10`, `FRONTIERE 11 · 10 vers 11` et
   `FRONTIERE 12 · 11 vers 12` ouvrent les seuils `08→09`, `09→10` et
   `10→11` ; le commentaire du troisième sas dit encore
   « 12 vers le pied » pour `11→00`. **Les attributs sont justes** —
   c'est sur eux que travaillent `main.js` et `langue.js`, jamais sur
   le commentaire. Ce qui casse est la recherche textuelle par numéro
   de frontière, et rien d'autre.

4. **`#visite` est la seule section ouverte en colonne 0.** Les dix
   autres sont indentées de deux espaces dans `<main>`. Cosmétique,
   mais elle casse la lecture par indentation du document.

5. **Trois seuils n'ont pas de `data-cible` : `01→02`, `04→05` et
   `05→06`.** Tous trois en `volet` — le volet balaye la section
   entière, il n'a rien d'extérieur à viser. Le seul cas irrégulier de
   la table, le `souder` de l'Agence, est parti avec elle.

6. **Aucune ancre morte.** Revérifié le 2026-08-03 après le retrait de
   la 09 : **31** `href="#…"` distincts contre **190** `id` du
   document, zéro référence non résolue (symboles SVG `#i-*` compris).
   Plus **aucun lien** vers `#apropos`, `404.html` compris — il en
   reste une règle CSS orpheline, voir l'anomalie 8.

7. **`content-visibility: auto` s'applique à 7 sections sur 11, plus le
   pied** : `#visite`, `#calculateur`, `#comparatif`, `#processus`,
   `#reference`, `#faq`, `#contact`, `.footer`, chacune
   avec son `contain-intrinsic-size` relevé à 1440×900. Sont
   volontairement exclues `#top`, `#services`, `#realisations` et
   `#demos`. **À savoir avant toute mesure** : hors écran,
   `getBoundingClientRect()` rend sur ces huit blocs la hauteur
   *réservée*, pas la réelle. Voir `PIEGES.md § 4`.

8. **Une règle orpheline survit à la section 09** :
   `#apropos { contain-intrinsic-size: auto 1108px; }` est restée dans
   `css/app.css`, juste sous celle de `#processus`. Elle n'a plus de
   cible et ne coûte rien — mais c'est un sélecteur mort dans la
   feuille source, et le prochain qui cherchera « où est passée
   l'Agence » le trouvera là. Le reste du bloc `20. A PROPOS` est
   bien parti.

8. **`<footer class="footer">` est imbriqué dans `<main class="shell">`**
   et perd donc son rôle `contentinfo`. Voir `RESERVES.md`.
