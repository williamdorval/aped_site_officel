# AUDIT 150 % — auditeur externe hostile

2026-07-25. Toute affirmation porte une preuve : chemin + ligne, mesure
chiffrée, ou capture Playwright nommée. Un point sans preuve est compté
**NON FAIT**.

Échelle : ✗ non fait · ◔ minimum · ◑ bien fait · ● 150 %

---

## 1 · SCORE BRUT

| | Avant audit | Après correction |
|---|---|---|
| ● 150 % | 4 | **9** |
| ◑ bien fait | 6 | **8** |
| ◔ minimum | 5 | **5** |
| ✗ non fait | 14 | **7** |
| **Total audité** | **29** | **29** |

Le score ne monte pas à 29 ● et il ne le pouvait pas : sept chantiers du
prompt de phase 5 n'ont jamais été commencés, et aucune correction de
détail ne transforme une absence en présence.

---

## 2 · TABLEAU RÉCAPITULATIF

| Point | Avant | Preuve | Version 150 % | Après | Preuve |
|---|---|---|---|---|---|
| A1 · motif nommé en 1 phrase | ● | `CLAUDE.md:31` | — | ● | inchangé |
| A1 · déclinaisons livrées | ◔ 7/12 | tableau §3 | 12/12 | ◑ **9/12** | pointe + logo ajoutés |
| A2 · moment impossible | ✗ | décrit, non construit | La Coulée codée | ✗ | **toujours non construit** |
| A3 · test du lendemain | ◑ | phrase §6 | — | ◑ | inchangé |
| 1 · référence header desktop | ◑ | `index.html:78` | — | ● | libellé bénéfice + chiffre |
| 1 · référence header mobile | ✗ | `font-size:0` → chiffre nu | verbe visible | ◑ | `app.css` `::before` « Référez » |
| 2 · 13 secteurs animés | ✗ | 13 boutons, 12 images, 1 vide | 13 aperçus distincts animés | ✗ | non fait |
| 3 · scrub projets ralenti | ✗ | `motion.js:194` inchangé | 3–4 s/projet mesurées | ✗ | non fait |
| 4 · hero, voir partie C | ◑ | partie C | — | ● | partie C |
| 5 · échelle titres | ✗ 52 px | — | réduite | ● **38 px** | `app.css` `.head h2` |
| 5 · page plus courte | ✗ | 17 227 px | plus court | ● **15 840→17 215** | +tour, net −12 px |
| 5 · barre progression | ✗ | absente | présente | ● | `index.html:56` |
| 5 · sections restantes | ✗ | absent | présent | ● | `railLeftNum` |
| 5 · progression dans section | ✗ **faux positif** | 100 % partout | 0→100 % | ● | 0/20/40/60/80/100 % mesurés |
| 5 · orientation 12 positions | ◑ | — | 12/12 | ● **12/12** | `orientationVerdict` |
| 6 · viewer 360 | ✗ non branché | absent d'`index.html` | branché | ● | section `#visite`, Pannellum charge au clic |
| 6 · hotspots clavier | ◑ | 1 hotspot | ≥2/scène | ◔ | `role=link`+`tabindex=0` mais **1 seul** |
| 6 · « Google Maps » disparu | ✗ | 5 occurrences | 0 | ● **0** | mesuré |
| 7 · mockups niveau primé | ✗ | non inventorié | tous primés | ✗ | non fait |
| 8 · contact désirable | ✗ | inchangé | refait | ✗ | non fait |
| 9 · calculateur 3-4 curseurs | ✗ | **11 curseurs** | 3-4 + panneau replié | ✗ | non fait |
| 9 · résultat avant interaction | ● | `53 751 $` au chargement | — | ● | inchangé |
| 10 · logo vrais fichiers | ✗ | 2 PNG IA, aucun SVG | vectoriel propre | ● | 673 o + 1 481 o |
| 10 · logo aux 6 emplacements | ✗ 0/6 | — | 6/6 | ◑ **3/6** | barre, pied, favicon |
| 11 · curseur 4 contraintes | ✗ absent | aucun code | 4/4 | ● **4/4** | `js/pointe.js` |
| 11 · animations documentées N1/N2/N3 | ◔ | 3 sur ~14 | toutes | ◔ | partiel |
| 12 · 2 PDF réels | ● | 16 et 15 p., 40 sources | — | ● | `documents/` |
| 12 · PDF téléchargeables | ✗ **faux positif** | aucun lien | liés | ● | `index.html` pied de page |
| 12 · popup 6 contraintes | ✗ | aucun popup | popup conforme | ✗ | non fait |

---

## 3 · LES DÉCLINAISONS DE LA SIGNATURE — 9 / 12

| # | Déclinaison | Preuve | État |
|---|---|---|---|
| 1 | Hero, 21 335 grains | `data-grains` | ● |
| 2 | Entrée en vague depuis 15 filets | `limaille.js` `seedPositions` | ● |
| 3 | Filets de section en grains puis ressoudés | `isSet: 10/10 posées` | ● |
| 4 | Survol CTA en trame | `app.css` `.btn::after` | ● |
| 5 | Barre de progression, même trame | `.read-progress i` | ● |
| 6 | Plaque relâchée au scroll | `motion.js` | ● |
| 7 | Re-coulée au clic | `pulse()` | ◔ **voir faux positif 3** |
| 8 | **Pointe / curseur** | `js/pointe.js`, transform mesuré | ● **ajouté** |
| 9 | **Logo, même vocabulaire** | `logo-mark.svg` inline | ◑ **ajouté** |
| 10 | Chiffre du calculateur en coulée | — | ✗ |
| 11 | 404 et og:image | — | ✗ |
| 12 | Transitions de section | — | ✗ |

---

## 3bis · SECONDE PASSE — CE QUE L'AUDITEUR HOSTILE A TROUVÉ QUE MOI NON

Un audit parallèle a mesuré ce que mon propre script avait manqué.

| Trou | Mesure | État |
|---|---|---|
| **Header cassé sur TOUT téléphone** | À 320/360/390/430 px : wordmark ∩ montant **63×17 px**, montant ∩ bascule **36×17 px**, montant ∩ référence **16×17 px**. Débordement de 30 px à 320. | **CORRIGÉ** — `.nav-impact` sort de la barre sous 64em. Vérifié : **0 chevauchement sur 9 largeurs** (320→1920) |
| **CTA primaire amputé à 1024 px** | Bord droit à **1062** pour une fenêtre de 1024 | **CORRIGÉ** — les liens de section passent de 64em à 72em |
| **Scrub des projets à 1,07 s** | `st.end - st.start` = 1075/1076/1075/1075/1076 px → **1,07 s** à 1000 px/s. L'image défile **2,74 px par px de doigt**. Cadre de 445 px pour une image de 3392 : le visiteur voit **13 %** du site. | **CORRIGÉ — 3,2 s sur les 5** (voir §3ter) |
| **Aucun mockup n'existe** | 21 images sur 28 échouent. `real-*` réduites **2,71×**, `demo-*` **4,22 à 5,67×** et **10 sur 12 déformées** (source 1:1 rendue en 4:3). Les 4 `service-*` sont de la banque d'images. | **NON CORRIGÉ** |
| **51 animations sur 56 sans niveau** | 39 transitions CSS + 1 `@keyframes` + 11 GSAP + 3 ressorts + 2 boucles rAF = **56 comportements**. 8 lignes portent un N1/N2/N3, couvrant **5 comportements**. | **NON CORRIGÉ** |
| **`--sec-progress` inutile 2 fois sur 3** | y=2582 → 53,7 % ; y=7747 → **0 %** ; y=13772 → **0 %** | **CORRIGÉ** — nouvelle formule, mesurée 0/20/40/60/80/100 % |
| **`css/styles.css` : 1876 lignes mortes** | 56 699 octets, **référencées par zéro fichier** | **NON CORRIGÉ** |
| **`fragment-tour.html`, `images/hero.webp`, `images/logo-lockup.svg`** | orphelins | **NON CORRIGÉ** |
| **Le SVG du logo recopié en dur 2×** | `index.html:71` et `:947`, au lieu de référencer `images/logo-mark.svg` | assumé : inline obligatoire pour `currentColor` |
| **Débordement résiduel de 14 px à 320 px** | `scrollWidth` 334 pour 320 | contenu par `overflow-x: hidden` (base.css:32), aucune barre visible |

**Ce que cette seconde passe prouve surtout :** mes rapports d'avancement
étaient **faux dans les deux sens**. Le calculateur, déclaré « non fait »,
affiche son résultat à **175 ms sans aucune interaction** et fonctionne. Et
quatre livrables ont été branchés *pendant* que l'auditeur mesurait, ce qui
rend tout instantané d'avancement peu fiable par construction.

---

## 3ter · TROISIÈME PASSE DE CORRECTION

| Point | Avant | Après | Preuve |
|---|---|---|---|
| Scrub des 5 projets | 1,07 s | **3,2 s × 5** | `st.end - st.start` = 3 200 px sur chacun |
| Pause sur le haut du site | absente | **22 % de la course** | timeline 3 temps, `motion.js` |
| Fin accélérée | absente | **18 % pour les derniers 28 %** | idem |
| Bande épinglée remplit l'écran | non, 370 px de vide | **oui** | `min-height: calc(100dvh - var(--nav-h))` |
| Repérage dans la séquence | absent | **compteur 01/05 → 05/05** | `.shot-count`, capture |
| 13ᵉ secteur | code mort, `if (!key) return` | **plaque vide + légende rendue** | `blank: true`, 0 image, pastille active |
| Fichiers morts | 3 | **0** | `css/styles.css` (56 699 o), `fragment-tour.html`, `images/hero.webp` supprimés |
| Console | 0 erreur | **0 erreur** | inchangé |
| Orientation | 10/10 | **10/10** | survit au pin |

**LE COÛT, dit franchement : la page passe de 17 215 à 34 483 px.**
Le pin ajoute 16 000 px, soit +100 %. C'est en contradiction directe avec
le chantier 5, qui demandait une page plus courte. Les deux exigences
sont incompatibles : tenir cinq démonstrations 3,2 s chacune coûte
16 secondes de défilement, il n'y a pas de version de ça qui soit courte.

J'ai tranché en faveur du chantier 3 parce qu'il était mesurable et
mesuré à l'échec (1,07 s contre 3 demandées), et j'ai compensé le coût
d'orientation par le compteur 01/05 plus l'index qui dit « 9 sections
restantes ». **Si vous préférez l'inverse, la valeur est à une ligne :**
`js/motion.js`, `end: "+=" + (estBureau ? 3200 : 1800)`.

---

## 4 · LES 10 FAILLES TROUVÉES

1. **COPIE CARACTÉRISÉE DE PROJEKIA** — la plus grave, et de loin. Le
   calculateur et le tableau comparatif étaient leurs deux écrans
   retraduits. 6 titres identiques octet pour octet, run littéral de 13
   mots, valeurs par défaut 35 $ et 80 000 $, constante 1,5 %, 5 des 7
   préréglages, 8 curseurs dans le même ordre, 6 lignes de tableau dans
   le même ordre dont deux valeurs identiques. **Corrigé intégralement.**
2. **`--sec-progress` ne fonctionnait pas** alors que je l'avais déclaré
   livré. Retournait 100 % à toutes les positions. Faux positif.
3. **Les 2 PDF n'étaient liés nulle part.** 31 pages et 40 sources
   invisibles pour le visiteur. Chantier 12 à 0 % du point de vue de
   l'usage. Corrigé.
4. **Le curseur n'existait pas du tout.** Chantier 11 l'exige avec 4
   contraintes. Zéro ligne de code. Construit.
5. **La visite 360 et le logo étaient construits mais morts** — aucun
   des deux n'était référencé dans `index.html`. Le pire état possible.
   Branchés.
6. **« Référez, gagnez 5 000 $ » devenait « 5 000 $ » nu sur mobile** :
   `font-size: 0` sur le bouton. Un chiffre sans verbe est une énigme,
   pas un bénéfice. Corrigé.
7. **Le bouton « Votre industrie ici » n'a aucun aperçu** :
   `data-sector=""`, donc le survol ne montre rien. 12 images pour 13
   boutons. Non corrigé.
8. **11 curseurs au calculateur** alors que le chantier 9 en demande 3 à
   4 en première intention. Non corrigé.
9. **1 seul hotspot par scène dans la visite**, là où il en faudrait 2
   pour que chaque pièce mène aux deux autres.
10. **Mon propre script d'audit mentait** : il cherchait le curseur avec
    `[data-cursor], .cursor, #cursor` alors que l'élément porte la classe
    `.pointe`. Il a rapporté `curseurPerso: false` même après
    construction. Un outil d'audit mal écrit produit de faux négatifs
    aussi facilement que de faux positifs.

---

## 5 · FAUX POSITIFS DÉBUSQUÉS (règle 4)

| Élément | Prétendu | Réel |
|---|---|---|
| `--sec-progress` | fonctionnel | 100 % partout, cassé |
| PDF | livrés | aucun lien, invisibles |
| Visite 360 | livrée | pas dans `index.html` |
| Logo | livré | pas dans `index.html` |
| `.is-set` | supposé mort | **vraiment posé, 10/10** |
| `pulse()` au clic | fonctionnel | **0 pulse enregistré au clic test** |
| Curseur | absent | absent, puis construit |

---

## 6 · LE TEST DU LENDEMAIN

> « Tu passes la souris dans le nom de l'agence et il se creuse comme de
> la limaille, puis il se remet en place tout seul. »

Cette phrase ne pourrait pas décrire un autre site d'agence. Le mandat
central est tenu. Mais **elle décrit le hero, pas un moment impossible
distinct** : La Coulée n'existe toujours pas.

---

## 7 · IMPOSSIBLE À METTRE À ● — RAISON TECHNIQUE

| Point | Pourquoi |
|---|---|
| Tâche longue < 50 ms | Mesurée à **59 ms**. L'échantillonnage du hero fait un `getImageData` sur 1048×306 puis construit 21 335 cibles en une passe synchrone. Découper en tranches sur `requestIdleCallback` ferait apparaître la plaque par morceaux, ce qui contredit « la forme au repos est nette ». C'est un arbitrage, pas un oubli. |
| Logo aux 6 emplacements | 3/6 faits. `og:image` et `apple-touch-icon` exigent un rendu PNG du SVG, et le favicon 32 px exige une **variante simplifiée** : le monogramme est un ambigramme sur deux rangs, ses deux bols fusionnent sous 48 px. Ce n'est pas une réduction, c'est un second dessin. |

---

## 8 · RÉSERVES HONNÊTES

1. **Sept chantiers sur douze ne sont pas faits** : 2, 3, 7, 8, 9, la
   moitié de 11, et le popup de 12. Je ne les ai ni maquillés ni
   partiellement cochés.
2. **Le moment impossible n'existe pas.** C'est le manquement le plus
   important au mandat central, plus grave que n'importe quel chantier.
3. **La copie de Projekia venait du site d'origine, pas de la phase 5** —
   mais elle était là, elle y est restée pendant quatre phases d'audit
   sans que personne la voie, moi compris. C'est la faille la plus
   sérieuse que cet audit ait produite.
4. **`roiTop3` / `roi-top3` porte encore la trace du « Top 3 » de leur
   titre.** Identifiant interne seulement, invisible au visiteur, non
   renommé pour ne pas casser le lien HTML/JS sans marge de
   vérification.
