# SECTIONS — index des douze sections de `index.html`

Relevé le 2026-07-29 sur `index.html` (3392 lignes), `css/app.css`
(5479 lignes) et les sept fichiers de `js/`. Tous les numéros de ligne
ci-dessous ont été lus dans les fichiers, aucun n'est estimé.

## Comment lire cet index

**L'ancre et le numéro de seuil ne se lisent pas au même endroit.**
Le numéro d'une section est celui que porte le rail (`index.html`
283-294, `#railList`). Le seuil placé **en tête** de chaque section
porte deux numéros : `data-de` = la section qu'on quitte,
`data-vers` = la section où l'on entre. Le seuil qui ouvre `#services`
porte donc `data-de="01" data-vers="02"` — c'est la frontière **vers**
la 02, pas la frontière de la 01.

**Il y a douze `[data-seuil]` pour douze sections + un pied.**
L'accueil (`#top`) n'en porte aucun : c'est la première section, rien
ne la précède. Les onze autres sections en portent un chacune, plus
celui du pied de page (`data-de="12" data-vers="00"`). Total : 12
éléments `[data-seuil]` dans le document.

**`data-dress="encre"` habille la bande de seuil, pas la section.**
Quatre bandes seulement : celles qui entrent dans la 02, la 05, la 06
et dans le pied (`css/app.css` 158-180).

**`css/app.css` est la seule source de style.** `critique.css` et
`differe.css` sont fabriqués par `node tools/css-critique.mjs` et ne
doivent jamais être édités. Deux sections ont en plus leur propre
feuille, chargée après la première peinture : `css/secteurs.css` (04)
et `css/tour360.css` (05).

---

## 01 · Accueil

| | |
|---|---|
| **Ancre** | `#top` |
| **Seuil** | aucun — première section, rien ne la précède |
| **Fond encre** | non |
| **HTML** | `index.html` **310 → 389** (`<section class="hero wrap" id="top">`) — plus la bande des sept plaques, **438 → 519**, qui vit dans `<main>` entre la 01 et la 02, hors de tout `<section>` |
| **CSS** | `css/app.css` **1920-2084** (12. HERO — plaque typographique) · **2085-2223** (LA COMPOSITION DU HERO — V1 · DÉGAGER et V3 · SOUDER) · **2224-2354** (13. LES PLAQUES D'ATELIER) · **4911-4973** (LES DEUX BOUTONS DU HERO — V4 · CRAN) · **1220-1611** (11b. SÉQUENCE D'ENTRÉE) |
| **JS** | `js/hero.js` (fichier entier — `build()` 234, `computeLayout()` 144, `layoutQuiRentre()` 211, `maybeEnter()` 324, `recolor()` 381, `ready()` 388) · `js/limaille.js` (moteur de grains) · `js/motion.js` bloc **1. Entrée du hero** 34-59 et bloc **2. Compression du titre** 60-85 · `js/langue.js` bloc **10. LES SEPT PLAQUES D'ATELIER — V2 · S'ALIGNER** 1438-1538 · `js/main.js` bloc **SÉQUENCE D'ENTRÉE** 156-351 (`lever()` 246, `pret()` 270, `sauter()` 318, `finir()` 333) |

**Composants**

| # | Bloc | Lignes |
|---|---|---|
| 1 | Sur-titre `p.label.hero-eyebrow` — « Agence numérique · Québec » | 320 |
| 2 | Plaque de limaille `#heroPlate` + `h1.plate-text` + `#heroCanvas` | 326-329 |
| 3 | Titre sur deux lignes écrites `p.hero-claim` (2 × `span.ligne`) | 339 |
| 4 | Sous-titre `p.hero-sub` | 340 |
| 5 | Deux CTA `div.hero-cta` — primaire `modal-start`, secondaire `modal-estimate` | 341-350 |
| 6 | Fiche technique `aside.hero-fiche` : libellé, `ol.fiche-rows` 4 rangées, `p.fiche-foot` | 366-388 |
| 7 | Bande des sept plaques `div.plaques[data-plaques]` — 7 × `article.plaque > .plaque-corps` | 461-518 |

Les onze pas de la composition portent leur retard en millisecondes
dans `--e` (560 → 1470), écrit dans le document.

---

## 02 · Services

| | |
|---|---|
| **Ancre** | `#services` |
| **Seuil** | `data-de="01" data-vers="02"` · nom **« Services »** · ligne 564-569 |
| **Verbe / sens** | `data-verbe="volet"` `data-sens="bas"` — porte la trame |
| **Fond encre** | **oui** (`data-dress="encre"`) |
| **HTML** | `index.html` **560 → 807** |
| **CSS** | `css/app.css` **2355-2824** (14. SERVICES — rail horizontal) · `.svc-appat` 1899 (dans le bloc 11c) |
| **JS** | `js/main.js` bloc **RAIL DES SERVICES — orientation** 352-443 (`poser(i)` 380) · `js/motion.js` bloc **6. LE RAIL DES SERVICES** 187-290 · `js/langue.js` frontière (blocs 288-339 et 394-608) |

**Composants**

| Bloc | Lignes |
|---|---|
| Seuil : filet `.seuil-filet`, carte `.seuil-carte` (numéro roulant + nom) | 564-569 |
| En-tête `div.head` — h2 « Ce qu'on livre. » + chapô | 571-574 |
| Barre d'orientation `.svc-bar` : compteur `#svcNum` / 04, `#svcNow`, jauge `#svcJauge`, 2 boutons `[data-svc]` | 578-590 |
| Scène `div.svc#svc` (578 → 789), piste `#svcPiste` (`tabindex="0"`, `role="group"`) 592-788 > rail `#svcRail` 594-787 | 577-789 |
| 4 cartes `article.svc-carte[data-svc-carte]` : Sites web et boutiques (597), Automatisation et IA (646), Immobilier et visibilité locale (697), Logiciels et applications (742) | 597-785 |
| Appât PDF `div.appat.svc-appat` — 1 lien de téléchargement | 800-806 |

---

## 03 · Projets

| | |
|---|---|
| **Ancre** | `#realisations` |
| **Seuil** | `data-de="02" data-vers="03"` · nom **« Projets »** · ligne 838-843 |
| **Verbe / sens** | `data-verbe="degager"` `data-sens="bas"` `data-cible=".project:first-of-type .shot"` — porte la trame |
| **Fond encre** | non (`data-dress="clair"`) |
| **HTML** | `index.html` **834 → 964** |
| **CSS** | `css/app.css` **2825-2975** (15. PROJETS LIVRÉS — séquence pleine largeur) |
| **JS** | `js/main.js` bloc **CADRES DE PROJET** 444-582 (`course()` 481, `majJauge()` 483, `dire()` 488, `boucle()` 490, `activer()` 508, `desactiver()` 521) · `js/motion.js` bloc **7. Défilement interne des captures de projet** 291-348 et bloc **14. Recalcul après chargement des images** 676-688 · `js/langue.js` bloc **6. VITESSES DIFFÉRENCIÉES** 1277-1303, bloc **3. DÉGAGER** 926-977 (les `h3`), bloc **4. SOUDER** 1014-1055 (les `dl[data-souder]`) |

**Composants**

| Bloc | Lignes |
|---|---|
| Seuil | 838-843 |
| En-tête `div.head` — h2 « Des sites en ligne, pas des maquettes. » | 845-848 |
| `div.wrap` 851-963 — 5 `article.project`, chacun = `figure.shot` > `.shot-vue[data-shot]` + `.shot-etat[data-shot-mot]` + `i.shot-jauge`, puis `.project-meta` > `h3` + `dl.project-facts[data-souder]` | 853-961 |
| — Cendre | 853-874 |
| — Pneus Mécanique | 875-896 |
| — Atelier Méridien | 897-918 |
| — MV Déneigement | 919-940 |
| — Studio Norden | 941-962 |

---

## 04 · Secteurs

| | |
|---|---|
| **Ancre** | `#demos` |
| **Seuil** | `data-de="03" data-vers="04"` · nom **« Secteurs »** · ligne 971-976 |
| **Verbe / sens** | `data-verbe="aligner"` `data-sens="droite"` `data-cible=".sector-group"` — pas de trame |
| **Fond encre** | non |
| **HTML** | `index.html` **967 → 1457** (la plus longue du document) |
| **CSS** | `css/app.css` **2976-3124** (16. SECTEURS — trois groupes) · **5193-5224** (V4 · LES PASTILLES DE SECTEUR) · **`css/secteurs.css` entier** (1720 lignes, 13 blocs numérotés — un par aperçu) |
| **JS** | `js/main.js` bloc **Aperçu des secteurs** 2203-2251 et **AU TACTILE IL N'Y A PAS DE SURVOL** 2252-2297 · `js/langue.js` bloc **5. LES SECTEURS — LE MOMENT DE PREUVE** 1056-1138, **5a. LA RECOMPOSITION** 1139-1164 (`blocsDe()` 1124, `filetDe()` 1134, `recomposer()` 1200), **5b. LA PILE** 1165-1258, **5c. LA PARALLAXE À LA POINTE** 1259-1276 |

**Composants**

| Bloc | Lignes |
|---|---|
| Seuil | 971-976 |
| En-tête `div.head` — h2 « Le style change selon le métier. » | 978-981 |
| `div.sectors-list` — 3 `div.sector-group` (Commerce et service au public 986, Métiers et chantier 997, Santé et professions 1006), 13 boutons `.sector-pills button[data-sector]` | 984-1036 |
| `div.sectors-grid` 983-1456 > `figure.sector-preview#sectorPreview` > `#mockStage` (1039) | 1038-1454 |
| `template#tplSecteurs` — 13 maquettes `.mock[data-mock]` : restaurant 1056, boutique 1093, coiffure 1120, gym 1150, hotel 1187, garage 1217, construction 1249, paysagement 1280, clinique 1307, immobilier 1335, juridique 1366, photo 1396, atelier 1422 | 1053-1452 |
| `figcaption#sectorCaption` (`role="status"`, `aria-live="polite"`) | 1453 |

---

## 05 · Visite 360

| | |
|---|---|
| **Ancre** | `#visite` |
| **Seuil** | `data-de="04" data-vers="05"` · nom **« Visite 360 »** · ligne 1465-1470 |
| **Verbe / sens** | `data-verbe="volet"` `data-sens="bas"` — porte la trame |
| **Fond encre** | **oui** (`data-dress="encre"`) |
| **HTML** | `index.html` **1461 → 1516** — seule section ouverte en colonne 0, les autres sont indentées de deux espaces |
| **CSS** | **`css/tour360.css` entier** (411 lignes). **Aucune règle `.tour` dans `css/app.css`** |
| **JS** | `js/tour360.js` (fichier entier — `init()` 535, `demarrer()` 178, `charger()` 158, `monter()` 233, `fabriquer()` 316, `equiper()` 345, `batirHud()` 366, `commande()` 467, `changee()` 477, `chargee()` 481, `marquer()` 502, `monterEnQualite()` 509, `echec()` 218) · `js/main.js` 834-970 pose le déclencheur `[data-tour-start]` · `js/trame.js` pour le passage d'une pièce à l'autre |

**Composants**

| Bloc | Lignes |
|---|---|
| Seuil | 1465-1470 |
| En-tête : `p.head-index` « Démo · Immobilier », h2, chapô | 1472-1476 |
| `div.tour.rise[data-tour]` (1478) > `div.tour-stage.plate[data-tour-stage]` avec `<img>` d'affiche (1480) | 1478-1514 |
| `div.tour-enter` — libellé, note, bouton `[data-tour-start]` + `[data-tour-label]` | 1492-1499 |
| 2 `p.fine` — mode d'emploi clavier, puis provenance des panoramas et du moteur | 1502-1513 |

---

## 06 · Calculateur

| | |
|---|---|
| **Ancre** | `#calculateur` |
| **Seuil** | `data-de="05" data-vers="06"` · nom **« Calculateur »** · ligne 1523-1528 |
| **Verbe / sens** | `data-verbe="volet"` `data-sens="haut"` — porte la trame. C'est la réciproque du seuil 05 : on entre dans l'instrument à la Visite, on en ressort ici |
| **Fond encre** | **oui** (`data-dress="encre"`) |
| **HTML** | `index.html` **1519 → 1701** |
| **CSS** | `css/app.css` **3125-3268** (17. CALCULATEUR — deux moitiés) · **1034-1074** (9. CURSEURS) · **4974-5014** (V4 · L'ODOMÈTRE) |
| **JS** | `js/main.js` bloc **Calculateur** 1958-1974, bloc **LE CURSEUR MAÎTRE** 1975-2202 (`repartir()` 1991, `roiUpdate()` 2043), ressort `Spring()` 115, odomètre `rouler()` 2328 / `finirRoulement()` 2388 / `caseCran()` 2397 / `rouleUn()` 2406, panneau « Ajuster en détail » 1163-1194 |

**Composants**

| Bloc | Lignes |
|---|---|
| Seuil | 1523-1528 |
| En-tête : `p.head-index` « On ne vous demande rien », h2, chapô | 1530-1534 |
| `#roiPresets` — 7 boutons de profil d'industrie | 1536-1544 |
| Verdict `div.roi-verdict` — `#roiWeekly` (heures/semaine) et `#roiImpact` (accent), plus `#roiAnnounce` en `sr-only` (1564) | 1552-1565 |
| `div.roi-grid` 1567-1700 > `div.roi-inputs` — 3 curseurs maîtres `#inEmp` `#inRate` `#inAdmin` (1570-1589) | 1568-1634 |
| `details.roi-details#roiDetails` — `#inRev` + 8 curseurs de tâche `#task1`…`#task8` | 1591-1633 |
| `div.roi-panel` — 2 barres (`#barManual` / `#barAuto`), `ol.roi-top3`, formulaire `#roiMailForm`, `details.roi-details--panel` avec 5 lignes de détail | 1636-1699 |

---

## 07 · Comparatif

| | |
|---|---|
| **Ancre** | `#comparatif` |
| **Seuil** | `data-de="06" data-vers="07"` · nom **« Comparatif »** · ligne 1708-1713 |
| **Verbe / sens** | `data-verbe="aligner"` `data-sens="droite"` `data-cible=".vs-row"` — pas de trame |
| **Fond encre** | non |
| **HTML** | `index.html` **1704 → 1844** |
| **CSS** | `css/app.css` **3269-3441** (18. COMPARATIF — deux barres nues par tâche) |
| **JS** | `js/motion.js` bloc **9. Piste du comparatif** 414-436 et bloc **9bis. LE SCHÉMA DE L'ÉCART** 437-462 |

**Composants**

| Bloc | Lignes |
|---|---|
| Seuil | 1708-1713 |
| En-tête `div.head` — h2 « À la main contre automatisé. » | 1715-1718 |
| Schéma `div.ecart[data-ecart]` — libellé, `.ecart-corps` (barres + pont), résumé `p.sr-only` | 1736-1785 |
| Libellé de transition `p.label.ecart-sous` | 1786 |
| `div.vs#vsTable` — 6 `div.vs-row[data-manual][data-auto]`, 12 barres `[data-bar]` | 1787-1842 |

---

## 08 · Processus

| | |
|---|---|
| **Ancre** | `#processus` |
| **Seuil** | `data-de="07" data-vers="08"` · nom **« Processus »** · ligne 1889-1894 |
| **Verbe / sens** | `data-verbe="aligner"` `data-sens="droite"` `data-cible=".parc-etape"` — pas de trame |
| **Fond encre** | non |
| **HTML** | `index.html` **1885 → 2016** |
| **CSS** | `css/app.css` **3442-3643** (19. PROCESSUS — le parcours d'atelier) |
| **JS** | `js/main.js` bloc **PARCOURS — compteur d'étape** 583-628 (`poser(i)` 601) · `js/motion.js` bloc **8. Ligne du processus** 349-379, **8bis. LES QUATRE COMPOSANTS DU PARCOURS** 380-413, **12. Frise du processus** 576-589 |

**Composants**

| Bloc | Lignes |
|---|---|
| Seuil | 1889-1894 |
| En-tête `div.head` — h2 « Comment ça se passe. » | 1896-1899 |
| Barre d'orientation `.parc-bar` — `#parcNum` / 04, `#parcNom`, `#parcReste` | 1904-1908 |
| `ol.parc#parc` — 4 `li.parc-etape[data-parc]`, chacune avec son composant `.parc-vis` : On se parle (1912), On dessine (1937), On code (1963), On met en ligne (1989) | 1910-2014 |

---

## 09 · Agence

| | |
|---|---|
| **Ancre** | `#apropos` |
| **Seuil** | `data-de="08" data-vers="09"` · nom **« Agence »** · ligne 2044-2049 |
| **Verbe / sens** | `data-verbe="souder"` `data-sens="droite"` — **pas de `data-cible`**, seul seuil dans ce cas ; pas de trame |
| **Fond encre** | non |
| **HTML** | `index.html` **2040 → 2129** |
| **CSS** | `css/app.css` **3644-3739** (20. À PROPOS — trio asymétrique) |
| **JS** | `js/motion.js` bloc **12bis. LES QUATRE PREUVES DE L'AGENCE** 590-620 · `js/langue.js` bloc **3. DÉGAGER** 926-977 (les `.agc-txt h3`) |

**Composants**

| Bloc | Lignes |
|---|---|
| Seuil | 2044-2049 |
| `div.agc-tete` — `div.head` (h2 « Vous parlez à la personne qui code. »), `div.agc-plaque`, `ul.agc-faits` 3 chiffres | 2054-2070 |
| `ol.agc-liste[data-agc]` — 4 `li.agc-eng` (2074, 2087, 2099, 2112), chacun `h3` + preuve `figure.agc-preuve` : Le prix est dit au départ (h3 2077), Rien ne se code sans votre accord (2090), Le code vous appartient (2102), Ça va vite (2115) | 2072-2127 |

---

## 10 · Référence

| | |
|---|---|
| **Ancre** | `#reference` |
| **Seuil** | `data-de="09" data-vers="10"` · nom **« Référence »** · ligne 2159-2164 |
| **Verbe / sens** | `data-verbe="cran"` `data-sens="droite"` `data-cible=".referral-max .num"` — seule frontière en V4 · CRAN ; pas de trame |
| **Fond encre** | non pour la bande de seuil — mais la section porte le seul aplat sombre de la page dans **les deux thèmes** (`css/app.css` 3740 et suivantes) |
| **HTML** | `index.html` **2155 → 2230** |
| **CSS** | `css/app.css` **3740-3872** (21. RÉFÉRENCE — le bloc sombre, dans LES DEUX thèmes) |
| **JS** | `js/motion.js` bloc **13. Programme de référence** 621-660 |

**Composants**

| Bloc | Lignes |
|---|---|
| Seuil | 2159-2164 |
| `div.plate.referral` > `div.referral-head` — libellé + h2 « Vous présentez. On encaisse ensemble. » | 2166-2176 |
| `p.referral-max` — « Jusqu'à » + `b.num` 5 000 $ (cible du cran de frontière) | 2177-2181 |
| `ol.referral-steps[data-ref]` — 3 temps numérotés (2188, 2197, 2209), chacun avec sa preuve `figure.ref-preuve` : texto envoyé `pr--texto` (2191), signature tracée `pr--signe` (2200), virement encaissé `pr--vire` (2212) | 2186-2219 |
| `i.referral-line` — le fil qui relie les trois temps | 2218 |
| `div.referral-foot` — bouton `modal-refer` + mention fine | 2221-2227 |

---

## 11 · Questions

| | |
|---|---|
| **Ancre** | `#faq` |
| **Seuil** | `data-de="10" data-vers="11"` · nom **« Questions »** · ligne 2237-2242 |
| **Verbe / sens** | `data-verbe="degager"` `data-sens="droite"` `data-cible=".faq-item"` — porte la trame |
| **Fond encre** | non |
| **HTML** | `index.html` **2233 → 2304** |
| **CSS** | `css/app.css` **3873-3912** (22. FAQ — deux colonnes, accordéon) · `.faq-item::before` **5374** (bloc micro-états) |
| **JS** | `js/langue.js` bloc **7. LA FAQ — V2, et c'est du FLIP** 1304-1341, qui s'appuie sur le FLIP maison `flip()` 262 (bloc **0. FLIP MAISON** 250-287) |

**Composants**

| Bloc | Lignes |
|---|---|
| Seuil | 2237-2242 |
| `div.faq-head.head` — `p.head-index` « 9 questions » (2250), h2 « Questions fréquentes. » (2251), chapô (2252) | 2249-2262 |
| `div.faq-aside` (dans `.faq-head`) — libellé, lien `mailto`, bouton `modal-booking`, mention fine | 2253-2261 |
| `div.faq-grid` 2244-2302 > `div.faq-list` — **9** `details.faq-item` : prix (2265), automatisation (2269), délai (2273), modification (2277), maintenance (2281), propriété (2285), technologies (2289), résultat (2293), région (2297) | 2264-2301 |

---

## 12 · Contact

| | |
|---|---|
| **Ancre** | `#contact` |
| **Seuil** | `data-de="11" data-vers="12"` · nom **« Contact »** · ligne 2339-2344 |
| **Verbe / sens** | `data-verbe="degager"` `data-sens="bas"` `data-cible=".cell"` — porte la trame |
| **Fond encre** | non |
| **HTML** | `index.html` **2335 → 2444** |
| **CSS** | `css/app.css` **3913-4121** (23. CONTACT — cinq cellules pour cinq entrées) |
| **JS** | `js/motion.js` bloc **13bis. « Ce qui arrive après »** 661-675 · `js/langue.js` bloc **3. DÉGAGER** 926-977 (les `.cell h3`) et bloc **9. LES MODALES — V1** 1382-1437 · `js/main.js` blocs Modales 1216-1349, Validation 1350-1404, Envoi 1405-1513 |

**Composants**

| Bloc | Lignes |
|---|---|
| Seuil | 2339-2344 |
| En-tête `div.head` — h2 « Cinq façons de nous joindre. » | 2346-2349 |
| `div.bento` — 5 `button.cell` : Démarrer votre projet (`cell--lead`, 2352), Estimation rapide (`cell--moyen`, 2365), Réserver un appel (`cell--moyen`, 2374), Urgence (2383), Référer une entreprise (2392) | 2351-2400 |
| `div.suite[data-suite]` — frise « Ce qui arrive après votre message », 3 temps | 2405-2428 |
| `ul.contact-sur` — 4 réassurances (12 h, 0 $, Écrit, Jamais) | 2430-2435 |
| `p.contact-direct` — adresse courriel en clair | 2439-2442 |

---

## Pied de page

| | |
|---|---|
| **Ancre** | aucune (le pied n'est pas dans le rail ; `#contenu` sur `<main>` sert au lien d'évitement) |
| **Seuil** | `data-de="12" data-vers="00"` · nom **« Fin de la traversée »** · `div.seuil.seuil--pied` ligne 2451-2457 |
| **Verbe / sens** | `data-verbe="volet"` `data-sens="bas"` `data-cible=".footer-mark"` — porte la trame |
| **Fond encre** | **oui** (`data-dress="encre"`) |
| **HTML** | seuil **2451 → 2457**, `<footer class="footer">` **2458 → 2513**, `</main>` en 2515 |
| **CSS** | `css/app.css` **4122-4198** (24. PIED DE PAGE) · `.footer-mark` 378 · `.footer-docs-mot` 1910 |
| **JS** | `js/main.js` bloc **LA DOUZIÈME FRONTIÈRE — LA CLÔTURE** 2624-2653 · `js/langue.js` bloc frontières 394-608 · `js/trame.js` |

**Composants**

| Bloc | Lignes |
|---|---|
| Seuil du pied — filet + carte « 12 / 00 · Fin de la traversée » | 2451-2457 |
| `div.footer-left` — h2 « On commence quand vous voulez. », `ul.footer-points`, bouton `modal-start` | 2460-2472 |
| `p.footer-docs-mot` + `ul.footer-docs` — les deux PDF | 2474-2489 |
| `div.footer-right` — `span.footer-mark` (SVG, cible du cran), `a.footer-mail`, `nav.footer-nav` | 2490-2507 |
| `p.footer-mega[data-degage="haut"]` — « APED », **seul `data-degage` du document** | 2508 |
| `div.footer-legal` | 2509-2512 |

---

## Ce qui est commun aux douze

| Objet | HTML | CSS | JS |
|---|---|---|---|
| Les douze seuils (structure, dress, filet, numéro roulant) | `[data-seuil]` ×12 | `app.css` **41-286** (1bis) | `langue.js` 288-339 + 394-608 · `main.js` **G2 · LE CRAN DE LA FRONTIÈRE** 2515-2570 |
| En-tête de section `.head` | ×11 | `app.css` **287-331** | `motion.js` **10. Titres de section** 463-551 (`couperEnLignes()` 472) · `langue.js` **2. LES MOTS** 808-925 (`decouperMots()` 846) |
| Navigation, en-tête collant | 209-253 | `app.css` **332-509** | `main.js` 971-1162 |
| Rail / index collant | 281-305 | `app.css` **717-820**, **5015-5056** | `main.js` **Index collant** 2458-2469, **N1 · LE CURSEUR DU RAIL** 2470-2514, barre de lecture 2571-2623 |
| Menu plein écran | 254-277 | `app.css` **821-871** | `main.js` 1101-1162 |
| Boutons (V4 · CRAN par lettre) | partout | `app.css` **510-672**, **4699-4771**, **4772-4910** | `langue.js` **1. LES LETTRES** 609-729 (`decouper()` 641, `positionner()` 759, `amorcerLettres()` 788) |
| Séquence d'entrée / rideau | 134-207 | `app.css` **1220-1611** | `main.js` 156-351 · `hero.js` 306-364 |
| Popup cadeau | 2570-2655 | `app.css` **1612-1919** | `main.js` 629-833 |
| 6 modales (`modal-start`, `modal-booking`, `modal-project`, `modal-urgent`, `modal-refer`, `modal-estimate`) | 2658-3260 | `app.css` **1075-1165**, **891-1033**, **1166-1219** | `main.js` 1216-1957 · `langue.js` **9. LES MODALES** 1382-1437 |
| La pointe (curseur) | — | `app.css` **673-716**, **5161-5192** | `pointe.js` (entier) · `langue.js` **8. L'ÉTIQUETTE DE LA POINTE** 1342-1381 |
| Le passage (trame) | voiles `[data-passage]` créés à la volée | — | `trame.js` : `APED_TRAME.degager()` · `.couvrir()` · `.inverse()` · `.tout_arreter()` — internes `passage()` 117, `grain()` 74, `couleurDe()` 104, `sortie()` 67 |
| Points de rupture | — | `app.css` **4368-4668** | — |
| Budget de dégradation (3 paliers) | — | `app.css` **5410-5479** | `langue.js` 65-150 (`monterAuPalier()` 137), mesure 151-199 |

---

## Tableau de synthèse

| # | Ancre | Seuil (nom) | Lignes HTML | Bloc CSS (`css/app.css` sauf mention) | Fonctions / blocs JS |
|---|---|---|---|---|---|
| 01 | `#top` | — (aucun) | 310-389 (+ plaques 438-519) | 1920-2084 · 2085-2223 · 2224-2354 · 4911-4973 | `hero.js` entier (`build`, `computeLayout`, `maybeEnter`, `recolor`, `ready`) · `motion.js` 34-59, 60-85 · `langue.js` 1438-1538 · `main.js` 156-351 |
| 02 | `#services` | 01→02 « Services » · **encre** | 560-807 | 2355-2824 | `main.js` 352-443 (`poser`) · `motion.js` 187-290 |
| 03 | `#realisations` | 02→03 « Projets » | 834-964 | 2825-2975 | `main.js` 444-582 (`course`, `majJauge`, `boucle`, `activer`, `desactiver`) · `motion.js` 291-348, 676-688 · `langue.js` 1277-1303 |
| 04 | `#demos` | 03→04 « Secteurs » | 967-1457 | 2976-3124 · 5193-5224 · **`css/secteurs.css` entier** | `main.js` 2203-2297 · `langue.js` 1056-1276 (`blocsDe`, `filetDe`, `recomposer`) |
| 05 | `#visite` | 04→05 « Visite 360 » · **encre** | 1461-1516 | **`css/tour360.css` entier** | `tour360.js` entier (`init`, `demarrer`, `charger`, `monter`, `fabriquer`, `equiper`, `batirHud`, `monterEnQualite`) |
| 06 | `#calculateur` | 05→06 « Calculateur » · **encre** | 1519-1701 | 3125-3268 · 1034-1074 · 4974-5014 | `main.js` 1958-2202 (`repartir`, `roiUpdate`, `Spring`), 2298-2457 (`rouler`, `finirRoulement`, `caseCran`, `rouleUn`), 1163-1194 |
| 07 | `#comparatif` | 06→07 « Comparatif » | 1704-1844 | 3269-3441 | `motion.js` 414-436, 437-462 |
| 08 | `#processus` | 07→08 « Processus » | 1885-2016 | 3442-3643 | `main.js` 583-628 (`poser`) · `motion.js` 349-379, 380-413, 576-589 |
| 09 | `#apropos` | 08→09 « Agence » | 2040-2129 | 3644-3739 | `motion.js` 590-620 · `langue.js` 926-977 |
| 10 | `#reference` | 09→10 « Référence » | 2155-2230 | 3740-3872 | `motion.js` 621-660 |
| 11 | `#faq` | 10→11 « Questions » | 2233-2304 | 3873-3912 · 5374 | `langue.js` 1304-1341, `flip()` 262 |
| 12 | `#contact` | 11→12 « Contact » | 2335-2444 | 3913-4121 | `motion.js` 661-675 · `langue.js` 926-977, 1382-1437 · `main.js` 1216-1513 |
| — | pied (pas d'ancre) | 12→00 « Fin de la traversée » · **encre** | 2451-2513 | 4122-4198 | `main.js` 2624-2653 · `langue.js` 394-608 · `trame.js` |

---

## Anomalies relevées

1. **`[data-settle]` n'a plus aucune cible.** `js/motion.js` bloc 11
   (552-575) anime `$$("[data-settle]")`. Les trois occurrences de la
   chaîne dans `index.html` (439, 443, 452) sont **dans un
   commentaire** qui explique le retrait. Le bloc tourne à vide.

2. **`[data-count]` n'a plus aucune cible.** `js/motion.js` bloc 5
   (163-186) et le repli de mouvement réduit (24-26) itèrent sur
   `[data-count]`. L'unique occurrence dans `index.html` (473) est
   dans un commentaire. Les compteurs de la bande de spécification ont
   été remplacés par les sept plaques, qui ne portent pas l'attribut.

3. **Deux frontières portent le même numéro dans les commentaires.**
   Ligne 2336 : `FRONTIERE 12 · 11 vers 12`. Ligne 2447 :
   `FRONTIERE 12 · 12 vers le pied`. Les attributs, eux, sont
   distincts (`11→12` et `12→00`) — la collision est dans la bannière
   de commentaire seule, mais elle rend la recherche textuelle
   ambiguë.

4. **La bande des sept plaques (438-519) n'appartient à aucune
   `<section>`.** Elle vit directement dans `<main>`, entre
   `</section>` de `#top` (389) et `<section id="services">` (560).
   Elle n'a donc ni ancre, ni seuil, ni entrée de rail, alors que
   `CLAUDE.md` la rattache au chantier 01. Conséquence pratique : le
   curseur du rail (`main.js` 2470-2514, qui itère sur
   `"section, .hero"`) ne la voit pas.

5. **`#visite` est la seule section ouverte en colonne 0.** Les onze
   autres sont indentées de deux espaces dans `<main>`. Cosmétique,
   mais elle casse la lecture par indentation du document.

6. **`#apropos` est le seul seuil sans `data-cible`.** Son G4 est
   `souder`, qui n'a pas besoin d'une cible externe — mais c'est la
   seule irrégularité de la table des douze.

7. **Aucune ancre morte.** Vérifié : 27 `href="#…"` distincts contre
   176 `id` du document, zéro référence non résolue (symboles SVG
   `#i-*` compris).

8. **`content-visibility: auto` s'applique à 8 sections sur 12, plus
   le pied** (`css/app.css` 242-254 : `#visite`, `#calculateur`,
   `#comparatif`, `#processus`, `#apropos`, `#reference`, `#faq`,
   `#contact`, `.footer`, chacune avec son `contain-intrinsic-size`
   relevé à 1440×900). Sont volontairement exclues `#top`, `#services`
   (scène épinglée — ScrollTrigger mesure sa hauteur au chargement),
   `#realisations` (course calculée sur la hauteur réelle des
   captures) et `#demos` (aperçu collant). À savoir avant toute
   mesure : hors écran, `getBoundingClientRect()` rend sur ces
   neuf blocs la hauteur *réservée*, pas la réelle.
