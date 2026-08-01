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
- [Les treize entrées](#entrees) — [01](#s01) [02](#s02) [03](#s03) [04](#s04) [05](#s05) [06](#s06) [07](#s07) [08](#s08) [09](#s09) [10](#s10) [11](#s11) [12](#s12) [pied](#pied)
- [Ce qui est commun aux douze](#commun)
- [Anomalies relevées](#anomalies)

---

<a id="plages"></a>
## Les plages

<!-- PLAGES:DEBUT -->

| № | Section | Ancre | `index.html` | l. | `css/app.css` | JS | autres |
|---|---|---|---|---:|---|---|---|
| 01 | **Accueil** | `#top` | 224-280 | 57 | 1764-2027 · 1260-1542 | `main.js` 114-219 | — |
| 02 | **Services** | `#services` | 281-917 | 637 | 2028-2722 | `main.js` 220-664 | — |
| 03 | **Réalisations** | `#realisations` | 918-1756 | 839 | 2723-4772 | `main.js` 665-1001 | — |
| 04 | **Secteurs** | `#demos` | 1757-2146 | 390 | 4773-4890 | `main.js` 2466-2544 · `langue.js` 524-612 | `css/secteurs.css` (entier, injecte par JS) |
| 05 | **Visite 360** | `#visite` | 2147-2216 | 70 | — | — | `css/tour360.css` · `js/tour360.js` (entiers) |
| 06 | **Calculateur** | `#calculateur` | 2217-2377 | 161 | 4891-5027 | `main.js` 2246-2465 | — |
| 07 | **Comparatif** | `#comparatif` | 2378-2502 | 125 | 5028-5185 | — | — |
| 08 | **Processus** | `#processus` | 2503-2638 | 136 | 5186-5371 | `main.js` 1002-1038 | — |
| 09 | **Agence** | `#apropos` | 2639-2731 | 93 | 5372-5454 | — | — |
| 10 | **Référence** | `#reference` | 2732-2806 | 75 | 5455-5569 | — | — |
| 11 | **Questions** | `#faq` | 2807-2882 | 76 | 5570-5603 | `langue.js` 613-641 | — |
| 12 | **Contact** | `#contact` | 2883-3015 | 133 | 5604-5802 | `main.js` 1566-1611 · `main.js` 1612-1677 · `main.js` 1678-1769 | — |
| — | **Pied de page** | `#footer` | 3016-3068 | 53 | 5803-5863 | `main.js` 2832-2852 | — |

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

**Douze `[data-seuil]` pour douze sections plus un pied.** L'accueil
(`#top`) n'en porte aucun : c'est la première section, rien ne la
précède. Les onze autres en portent un chacune, plus celui du pied
(`data-de="12" data-vers="00"`).

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
mot « Essayez. »), remontée (05→06, calque qui se dégage vers le
haut), clôture (12→00, le fil se soude dans la bande). Détail :
`REFONTE-IMMERSIVE.md`, moteur `js/sas.js`.

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
# LES TREIZE ENTRÉES

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
| **Blocs CSS** | `16. SECTEURS` · `V4 · LES PASTILLES DE SECTEUR` · **`css/secteurs.css` entier** (13 blocs numérotés, un par aperçu) |
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
| **JS** | `js/tour360.js` (entier) · `js/main.js` pose le déclencheur `[data-tour-start]` · `js/trame.js` pour le passage d'une pièce à l'autre |

**Composants** : seuil → en-tête (`p.head-index` « Démo · Immobilier »,
h2, chapô) → `div.tour.rise[data-tour] >
div.tour-stage.plate[data-tour-stage]` avec `<img>` d'affiche →
`div.tour-enter` (libellé, note, bouton `[data-tour-start]` +
`[data-tour-label]`) → 2 × `p.fine` (mode d'emploi clavier, puis
provenance des panoramas et du moteur).

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

<a id="s09"></a>
## 09 · Agence

| | |
|---|---|
| **Ancre** | `#apropos` |
| **Seuil** | `08 → 09` · nom **« Agence »** |
| **Verbe / sens** | `data-verbe="souder"` `data-sens="droite"` — **seul seuil sans `data-cible`** ; pas de trame |
| **Fond encre** | non |
| **Blocs CSS** | `20. A PROPOS` |
| **JS** | `js/motion.js` bloc `12bis. LES QUATRE PREUVES DE L'AGENCE` · `js/langue.js` bloc `3. DEGAGER` (les `.agc-txt h3`) |

**Composants** : seuil → `div.agc-tete` (`div.head` avec h2 « Vous
parlez à la personne qui code. », `div.agc-plaque`, `ul.agc-faits`) →
`ol.agc-liste[data-agc]` (4 × `li.agc-eng`, chacun `h3` + preuve
`figure.agc-preuve`) : Le prix est dit au départ · Rien ne se code sans
votre accord · Le code vous appartient · Ça va vite.

<a id="s10"></a>
## 10 · Référence

| | |
|---|---|
| **Ancre** | `#reference` |
| **Seuil** | `09 → 10` · nom **« Référence »** |
| **Verbe / sens** | `data-verbe="cran"` `data-sens="droite"` `data-cible=".referral-max .num"` — **seule frontière en V4 · CRAN** ; pas de trame |
| **Fond encre** | non pour la bande de seuil — mais la section porte le seul aplat sombre de la page dans **les deux thèmes** |
| **Blocs CSS** | `21. REFERENCE` |
| **JS** | `js/motion.js` bloc `13. Programme de reference` |

**Composants** : seuil → `div.plate.referral > div.referral-head`
(libellé + h2 « Vous présentez. On encaisse ensemble. ») →
`p.referral-max` (« Jusqu'à » + `b.num`, cible du cran de frontière) →
`ol.referral-steps[data-ref]` (3 temps, chacun avec sa preuve
`figure.ref-preuve` : `pr--texto`, `pr--signe`, `pr--vire`) →
`i.referral-line` → `div.referral-foot` (bouton `modal-refer` +
mention fine).

<a id="s11"></a>
## 11 · Questions

| | |
|---|---|
| **Ancre** | `#faq` |
| **Seuil** | `10 → 11` · nom **« Questions »** |
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

<a id="s12"></a>
## 12 · Contact

| | |
|---|---|
| **Ancre** | `#contact` |
| **Seuil** | `11 → 12` · nom **« Contact »** |
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
| **Seuil** | `12 → 00` · nom **« Fin de la traversée »** · `div.seuil.seuil--pied` |
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
# CE QUI EST COMMUN AUX DOUZE

| Objet | HTML | Bloc CSS | JS |
|---|---|---|---|
| Les douze seuils | `[data-seuil]` ×12 | `1bis. LES DOUZE SEUILS` | `langue.js` `0bis. LES DOUZE FRONTIERES` · `main.js` `G2 · LE CRAN DE LA FRONTIERE` |
| En-tête de section | `.head` ×11 | `2. EN-TETE DE SECTION` | `motion.js` `10. Titres de section` (`couperEnLignes()`) · `langue.js` `2. LES MOTS` (`decouperMots()`) |
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
   anime `$$("[data-settle]")`. Le bloc tourne à vide.

2. **`[data-count]` n'a plus aucune cible.** `js/motion.js` bloc 5 et
   le repli de mouvement réduit itèrent sur `[data-count]`. Les
   compteurs de la bande de spécification ont été remplacés, puis
   retirés.

3. **Deux frontières portent le même numéro dans les bannières de
   commentaire** : `FRONTIERE 12 · 11 vers 12` et
   `FRONTIERE 12 · 12 vers le pied`. Les attributs, eux, sont distincts
   (`11→12` et `12→00`) — la collision est dans le commentaire seul,
   mais elle rend la recherche textuelle ambiguë.

4. **`#visite` est la seule section ouverte en colonne 0.** Les onze
   autres sont indentées de deux espaces dans `<main>`. Cosmétique,
   mais elle casse la lecture par indentation du document.

5. **`#apropos` est le seul seuil sans `data-cible`.** Son G4 est
   `souder`, qui n'a pas besoin d'une cible externe — seule
   irrégularité de la table des douze.

6. **Aucune ancre morte.** Vérifié : 27 `href="#…"` distincts contre
   176 `id` du document, zéro référence non résolue (symboles SVG
   `#i-*` compris).

7. **`content-visibility: auto` s'applique à 8 sections sur 12, plus le
   pied** : `#visite`, `#calculateur`, `#comparatif`, `#processus`,
   `#apropos`, `#reference`, `#faq`, `#contact`, `.footer`, chacune
   avec son `contain-intrinsic-size` relevé à 1440×900. Sont
   volontairement exclues `#top`, `#services`, `#realisations` et
   `#demos`. **À savoir avant toute mesure** : hors écran,
   `getBoundingClientRect()` rend sur ces neuf blocs la hauteur
   *réservée*, pas la réelle. Voir `PIEGES.md § 4`.

8. **`<footer class="footer">` est imbriqué dans `<main class="shell">`**
   et perd donc son rôle `contentinfo`. Voir `RESERVES.md`.
