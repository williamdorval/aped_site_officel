# Chantier — accueil, services, réalisations

Ouvert et clos le **2026-07-30**, dans la même journée que
`CHANTIER-SERVICES.md`, qu'il **remplace en partie** : la section 02
est refaite une seconde fois, sur demande du propriétaire, avec une
mécanique que le chantier du matin avait justement retirée. Le § 2.1
explique pourquoi ce n'est pas un retour en arrière.

Ce document tient les cinq choses qu'une session vide doit pouvoir
relire : **ce qui a été retiré et où c'est archivé**, **la cause
mesurée de chaque défaut trouvé**, **ce que la recherche a rendu**,
**ce qui a été décidé sans le propriétaire**, et **les réserves
honnêtes**.

---

## 0 · CE QUI A CHANGÉ, EN UNE PAGE

| Section | Avant | Après |
|---|---|---|
| **01 · Accueil** | huit plaques d'atelier inclinées, avec dérive au défilement et boucle de vie permanente | plus de plaques. Une **ligne de socle** sous un filet, trois engagements |
| **02 · Services** | grille de quatre cartes à photographies, chacune avec son `<details>` | **piste collante** : les quatre chantiers défilent latéralement pendant qu'on descend, un par un, sous une typographie d'affiche. Aucune image |
| **03 · Réalisations** | cinq cadres montrant des captures de sites clients (`images/real-*.webp`) | **trois comparaisons avant / après**, entièrement en markup, zéro image, zéro octet |

**Tout est archivé, rien n'est supprimé** — `archives/` :

| Dossier | Contenu |
|---|---|
| `2026-07-30-plaques-accueil/` | markup, CSS (§ 13 + § 13bis + les deux replis), `langue.js` bloc 10, et le **registre des huit affirmations** avec ce qui soutenait chacune |
| `2026-07-30-services-images/` | les 4 `.webp`, **`svc-images.mjs` qui porte leur provenance et leur licence**, et le déclencheur 360 de `main.js` |
| `2026-07-30-projets-images/` | les 5 `real-*.webp`, l'ancienne section 03, `main.js` bloc « cadres de projet », `motion.js` bloc 7, `langue.js` bloc 6 |

---

## 1 · ACCUEIL — le retrait des huit plaques

### 1.1 Ce que le retrait coûte, et c'est réel

Les huit plaques étaient **le seul endroit du site qui projetait
l'image d'une maison établie**. Pas par des chiffres de volume —
personne ne croit « 200 clients » sur un site qu'il ne connaît pas —
mais par le **standard** : une maison qui affiche des engagements
précis donne l'impression d'avoir des processus, et une maison qui a
des processus est grosse dans la tête du visiteur.

### 1.2 La compensation, et le choix des trois

Une ligne, sous un filet, en pied de hero. Douzième pas de la
composition (`--e:1320`), donc V1 · DÉGAGER pour le libellé et
V3 · SOUDER pour le filet, comme les onze autres.

> **Réponse en 12 h** jours ouvrables · **Un seul interlocuteur** du
> premier appel à la mise en ligne · **Tout vous appartient** le code,
> l'hébergement, l'adresse

| Gardée | Pourquoi celle-là |
|---|---|
| **12 h** | le seul engagement **chiffré** du lot, et il est affiché à cinq autres endroits du site. Un client qui le conteste au téléphone perd |
| **Un seul interlocuteur** | dit le **standard**, pas la taille. C'est ce que les grosses maisons facturent cher, et c'est soutenu mot pour mot par la section Agence |
| **Tout vous appartient** | le différenciateur **premium** : il oppose notre offre à celles qui gardent le client en otage. Agence 03, FAQ et Parcours le disent déjà |

| Écartée | Pourquoi |
|---|---|
| « Jour 5 », « = » | demandent la **figure** qui les accompagne dans la section Agence pour se comprendre. Seuls, sur une ligne, ce sont des devinettes |
| « 0 mouchard » | vrai et vérifiable en dix secondes, mais c'est un argument **technique** — et cette ligne parle la langue du client |
| « Québec » | déjà dit par le sur-titre, six lignes plus haut |
| « 7 produits » | compte la **vidéo**, que rien ne soutient ailleurs dans le site. Réserve toujours ouverte |

### 1.3 Le coût en pixels, mesuré

`node tools/socle-captures.mjs` — les deux états pris **dans la même
passe, sur la même page**, parce que deux chargements successifs
n'ont ni la même hauteur de nav ni le même état de police.

| Largeur | Hero avec | Hero sans | Coût | Hauteur du socle |
|---|---|---|---|---|
| 390 | 900 | 900 | **0** | 125 |
| 768 | 900 | 900 | **0** | 90 |
| 1280 | 942 | 900 | 42 | 64 |
| 1440 | 922 | 900 | 22 | 64 |
| 1920 | 932 | 900 | 32 | 39 |

Captures dans `tools/_socle/` : `avec-*.png` et `sans-*.png`, dix
paires (2 thèmes × 5 largeurs). **Le propriétaire tranche sur
pièces.** Pour retirer la ligne : supprimer le `<p class="hero-socle">`
d'`index.html` et le bloc `12bis` d'`app.css`, puis régénérer.

### 1.4 Deux défauts trouvés en regardant les captures

| Défaut | Cause | Correctif |
|---|---|---|
| trois engagements empilés sur **une colonne de 84 px**, en douze lignes, à côté des boutons | pas de `grid-column` : l'auto-placement l'a posé dans la seule case libre de la rangée des boutons — la colonne 8, coincée entre `.hero-cta` (1/span 7) et `.hero-fiche` (9/span 4). Relevé : **283 px** de haut pour une ligne qui doit en faire 40 | `grid-column: 1 / -1` et `align-self: end` — le hero a une hauteur minimale d'un écran, et la dernière rangée d'une grille étirée absorbe tout le reste |
| le point médian tombait **en tête de ligne** dès que la ligne se repliait, donc trois engagements séparés se lisaient comme une liste à puces | écrit en `::before` sur l'item **suivant** | `::after` sur l'item qu'il **ferme** — un séparateur suit ce qu'il termine, il n'ouvre pas ce qui vient |

---

## 2 · SERVICES — la piste collante

### 2.1 Pourquoi ce n'est pas un retour en arrière

Le chantier du matin a retiré un **rail horizontal épinglé par
ScrollTrigger**. Le propriétaire redemande le défilement latéral
piloté par le défilement vertical. Trois choses ont changé, et
chacune répond à un des motifs du retrait :

| Motif du retrait, le matin | Ce qui a changé |
|---|---|
| **Le pin s'armait 284 px trop tôt** à l'arrivée par ancre, et la scène se téléportait de 275 à 280 px en une image | **il n'y a plus de pin.** L'épinglage est un `position: sticky` — c'est le navigateur qui le recalcule à chaque image depuis la mise en page vivante. Il n'y a plus de nombre absolu stocké, donc plus rien qui puisse être faux |
| Erik Runyon : **84 % des clics** d'un carrousel tombent sur la position 1 ; Baymard : « avoid having carousel slides as the **only** route to content » | **ce n'est pas un carrousel.** Un carrousel demande un geste **appris** : trouver une flèche, la reconnaître comme cliquable, cliquer. Cette piste ne demande que le geste que le visiteur fait déjà — descendre. Les quatre chantiers arrivent donc à celui qui ne fait rien de particulier, ce qui est l'exact contraire d'un carrousel |
| Le compteur « 01 / 04 » disait **combien**, jamais **quoi** | **l'index nomme les quatre**, en permanence, sous la scène. Chaque entrée est une vraie ancre : clavier, lecteur d'écran, et sans JavaScript |

### 2.2 Les cinq défauts trouvés en mesurant, et leur cause

**a) La planche faisait 2 540 px dans une scène de 1 144.**
`.svc-planche` est un élément de grille **et** un conteneur flex : sa
taille minimale automatique (`min-width: auto`) vaut le min-content
d'une rangée flex sans repli, c'est-à-dire la **somme** des quatre
chantiers. Conséquence en chaîne : le `padding-inline: max(pad,
(100% − maxw) / 2)` résolvait son `100 %` contre 2 540 et rendait
**490 px** au lieu de 48. Le premier chantier commençait à 786 px au
lieu de 344, et la moitié gauche de la scène était vide.
→ `width: max-content` (voir **b**), et la largeur d'un chantier
passe du pourcentage au `vw`.

**b) LE PLUS COÛTEUX : la scène se vidait, et aucune mesure du DOM ne
le voyait.**

> À partir du deuxième chantier, la scène se vidait progressivement ;
> au troisième, elle était **entièrement blanche**. Et pourtant
> `getBoundingClientRect()` rendait la bonne boîte
> (343, 218, 704 × 385), `opacity: 1`, `visibility: visible`, la
> plaque de dégagement à `scaleX(0)`, l'index actif juste, la jauge
> juste. **Le document disait « tout va bien » pendant que l'écran
> était vide.**

La cause s'est trouvée en comparant les chiffres : la largeur
réellement peinte valait exactement `1440 − |x|` — 788 px à
x = −652, zéro à x = −1524. Le calque avait été rastérisé **une
fois**, sur la largeur de la fenêtre, et la translation faisait
glisser cette bande peinte vers la gauche en découvrant du vide.

Un `transform` promeut l'élément en calque composé, et changer un
`transform` ne redemande **pas** de peinture — c'est tout l'intérêt.
Le navigateur rastérise donc la zone qu'il juge intéressante, et il
la calcule sur la **boîte** du calque. Avec `width: auto`, la planche
prenait la largeur de la vitre : quatre chantiers de 704 px vivaient
dans une boîte de 1 144. Le reste n'a jamais été peint.
→ `width: max-content` sur la planche.

**C'est le piège d'instrument dans sa forme la plus pure : une sonde
qui interroge le DOM ne peut pas voir un défaut de PEINTURE.** Seule
la capture l'a vu. Il entre dans `CLAUDE.md § 8` sous le n° 25.

**c) L'arrivée par `#svc-03` visait juste et atterrissait à 123 px.**
Trace `window.scrollTo` instrumenté : « t = 111 ms, scrollTo(0, 2134) »
— et 2 134 était la bonne valeur. Au moment où la scène devient
collante, `differe.css` vient d'arriver : les sections d'en dessous
n'ont pas encore leur hauteur, le document n'est pas assez haut, et le
navigateur **écrête** le défilement demandé à son maximum du moment.
→ on **vérifie l'atterrissage** au lieu de le supposer : 30 images de
relance maximum, libérées au premier `wheel` / `touchstart` /
`keydown` / `pointerdown`.

**d) Deux rechargements sur dix laissaient les quatre noms sous leur
plaque.** `[data-degage]` était posé dès que la scène devenait
collante ; si `IntersectionObserver` ne déclenchait pas dans la
foulée, `marquer()` n'était jamais appelé et la plaque opaque restait.
→ l'attribut naît **dans** `marquer()` : le voile ne peut plus exister
sans son retrait. Plus une lecture directe du rectangle dans
`relire()`, pour que la première image ne dépende de personne.

**e) `.svc-recu` et `.ba-ecart` : le texte cassé en colonnes d'un mot.**
`display: grid; grid-template-columns: 1.5rem 1fr` avec un `<b>` suivi
d'un nœud de texte : une grille transforme chaque nœud de texte en
**élément de grille anonyme**. Le `<b>` prenait la colonne 2, le texte
repartait en colonne 1 de la rangée suivante, sur 24 px.
→ flux normal + `::before` absolu.

### 2.3 Les chiffres

`node tools/svc-defile.mjs http://127.0.0.1:8099 [largeur] [thème]`

| Mesure | 1440 clair | 1440 sombre | 768 clair |
|---|---|---|---|
| section entière | 2 478 px = **2,75 écrans** | 2 478 | 2 413 = 2,68 |
| course verticale | 1 242 px | 1 242 | 1 242 |
| pas horizontal · largeur d'un chantier | 806 · 749 | 806 · 749 | 584 · 553 |
| **écart de pixels entre deux captures** (10 étapes) | **2,89 à 8,34 %** | 2,95 à 8,71 % | 4,02 à 7,26 % |
| **rechargement sur `#services`, saut de scène** | **0 px, 10 / 10** | 0 px, 10 / 10 | 0 px, 10 / 10 |
| **arrivée par `#svc-03`** | **0 px · chantier visé atteint 10 / 10** | 0 · 10 / 10 | 0 · 10 / 10 |
| `scrollLeft` de la vitre, à chaque relevé | **0** | 0 | 0 |
| clavier : flèche droite depuis l'index | page 1306 → 1720, actif `svc-02` | idem | 1203 → 1617 |
| focus sur « Voir en détail » du 04 | page amenée, vitre à 0, bouton **dans** la vitre | idem | idem |
| **sans JavaScript** : chantiers visibles · scènes collantes | **4 · 0** | 4 · 0 | 4 · 0 |
| i/s médiane pendant la traversée | **59,9** | 59,9 | 59,9 |
| images > 20 ms | 1 / 629 | 1 / 654 | **0 / 479** |
| débordement horizontal du document | **aucun** | aucun | aucun |
| erreurs console | **aucune** | aucune | aucune |

### 2.4 L'échelle typographique

Relevé sur `basement.studio/services` — la page de quatre services
sans image la plus proche de ce besoin — dans ses feuilles rendues :
plus grand titre `6.125rem` = **98 px**, étiquette `.75rem` = **12 px**.
**Rapport 8,2 : 1.**

Première version d'ici : `--fs-1` (60 px) contre `--fs-8` (11 px), soit
**5,5 : 1**. Le nom d'un chantier avait le corps d'un titre de section
ordinaire alors qu'il occupe un écran à lui seul.
→ `clamp(2.5rem, 6.4vw, 5.25rem)` = 84 px au plafond, soit **7,6 : 1**,
plus `letter-spacing: -0.035em` (relevé : −.02em à −.04em sur tous les
grands corps de la référence).

---

## 3 · RÉALISATIONS — l'avant / après

### 3.1 Pourquoi les cinq projets sont partis

Deux raisons, et chacune suffisait :

1. **Le propriétaire** : « Pneus Mécanique et MV Déneigement ne sont
   pas encore en ligne : on ne les montre pas. » Une affirmation de
   livraison sans lien vers le livrable est la plus facile à démolir
   de toutes — il suffit de demander l'adresse.
2. **Les cinq `images/real-*.webp` n'ont aucune licence documentée**,
   nulle part. `real-pneus` contient en plus neuf marques de
   pneumatiques. Ce trou était ouvert dans `CLAUDE.md § 13` depuis le
   matin ; il se **ferme** ici.

### 3.2 La mécanique : un cran, pas une poignée

Le patron attendu est le curseur qui glisse entre deux images. Il est
écarté, et voici les trois raisons, dans l'ordre de force :

1. **Il ne compare pas mieux.** Xizi Wang et coll., **CHI 2026**
   ([arXiv 2602.19048](https://arxiv.org/abs/2602.19048)), N = 20,
   cinq techniques, quatre types de tâche :
   *« we did not observe significant differences in task accuracy »*.
   Le curseur est **préféré**, il n'est pas plus **exact**. Sur une
   règle qui dit « visible, sinon ça ne compte pas », une préférence
   qui coûte de l'accessibilité ne se paie pas.
2. **Il ne compare rien ici.** Un curseur a du sens quand les deux
   images sont alignées au pixel — la même voiture, avant et après
   peinture. Deux **sites** n'ont pas un pixel en commun : glisser
   entre eux ne rend pas une comparaison, ça rend une chimère.
3. **Il exige un geste appris.** Le NN/g demande explicitement de
   doubler tout glisser-déposer d'un autre chemin, et note que les
   icônes de poignée *« are not nearly as universal as designers may
   think »*
   ([nngroup.com/articles/drag-drop](https://www.nngroup.com/articles/drag-drop/)).
   Et la bibliothèque la plus citée,
   [`img-comparison-slider`](https://github.com/sneas/img-comparison-slider),
   contient **zéro attribut ARIA** — relevé à la source : pas de
   `role`, pas de `aria-valuenow`, pas de nom accessible, et **deux
   touches sur les six** du patron
   [APG](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) (Home et
   End manquent — précisément les deux qui donnent accès aux deux
   états qui comptent). Son README affiche pourtant « Accessible ».

**Ce qu'on fait à la place : deux `<input type="radio">` natifs.**
V4 · CRAN. Le changement d'état est du CSS pur
(`.ba-cadre:has([data-ba-vue="apres"]:checked)`), donc il fonctionne
sans une ligne de JavaScript, sous mouvement réduit, à tous les
paliers. Les flèches du clavier marchent parce que ce sont de vrais
boutons radio — on n'a rien à réimplémenter, donc rien à casser. Aucun
geste horizontal, donc **aucun conflit avec le défilement au doigt**,
donc aucun `touch-action` à négocier
([MDN avertit](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)
que `touch-action: none` casse le pincer-zoomer, ce qui touche
WCAG 1.4.4).

Et la différence se lit **sans toucher à rien** : trois lignes sous
chaque cadre disent ce qui change, en toutes lettres, et **chacune se
vérifie sur place** en basculant le cran, sur le même écran. C'est la
forme la plus forte qu'une affirmation puisse prendre au sens du
§ 0.A : le visiteur n'a pas à nous croire, il a à regarder.

### 3.3 Le registre des marqueurs de 2008-2012

Dix captures Wayback de vrais sites de PME, lues en HTML brut. Chaque
marqueur employé vient de l'une d'elles.

| Marqueur employé | Preuve | Capture |
|---|---|---|
| **960 px fixes centrés** | `#content { margin: 10px auto; width: 960px }` | [Auto Précision (garage, Vidéotron), 8 févr. 2011](https://web.archive.org/web/20110208161705/http://pages.videotron.com/garageap/) |
| idem | `header { margin: 0 auto; width: 960px }` | [Chez Ashton, 12 févr. 2012](https://web.archive.org/web/20120114013154/http://www.chezashton.ca/) |
| **corps à 0,7 em Tahoma** = 11,2 px | `body { font: 0.7em Tahoma, Arial, sans-serif; line-height: 1.6em }` | Auto Précision, 2011 |
| **titre Arial gras, `letter-spacing: -1px`** | `h1 { font: bold 2.5em "Arial"; letter-spacing: -1px }` | Auto Précision, 2011 |
| **Verdana 12 px + titres Times New Roman** | `body { font-family: Verdana…; font-size: 12px }` · `h1,h2,h3 { font-family: "Times New Roman" }` | [Renée de Léry, 26 oct. 2010](https://web.archive.org/web/20101026042647/http://pages.videotron.com/a0455/services.htm) |
| **fond en mosaïque** | `<body background="Image20.jpg">` | [Aux Anciens Canadiens, 22 janv. 2008](https://web.archive.org/web/20080122031221/http://www.auxancienscanadiens.qc.ca/) |
| **onglets 82 px dans une barre de 64 px** | `#tabs li a { width: 82px }` · `#tabs { height: 64px }` | Auto Précision, 2011 |
| **badges W3C 88 × 31 px** | `<img … width="88" height="31" alt="Valid XHTML 1.0!">` | Renée de Léry, 2010 |
| **compteur de visiteurs** | `<img src="http://www.clic.net/cgi-bin/count?df=aacan">` | Aux Anciens Canadiens, 2008 |
| **adresses hotmail / sympatico / vidéotron** | `mailto:renee.delery@sympatico.ca` + `mailto:adelery@videotron.ca` dans le **même pied de page** | Renée de Léry, 2010 |
| **encodage cassé** — « m?canique g?n?rale » | `charset=iso-8859-2` (jeu d'Europe centrale) déclaré pour du français | Auto Précision, 2011 |
| **deux affirmations contradictoires à trois lignes d'écart** | « Depuis **1989** » et « Dans le domaine depuis déjà **30 ans** » | Auto Précision, 2011 |
| **la même offre dans deux encadrés de titres différents** | « PROMOTION HIVERNALE » et « PROMOTION MÉCANIQUE », contenu identique | Auto Précision, 2011 |
| **texte défilant** | valeurs par défaut de `<marquee>` : 6 px / 85 ms / boucle infinie | [spéc. WHATWG, *Obsolete features*](https://html.spec.whatwg.org/multipage/obsolete.html) |
| **liens `#0000EE`, visités `#551A8B`, soulignés** | feuille de style utilisateur | [spéc. WHATWG, *Rendering*](https://html.spec.whatwg.org/multipage/rendering.html) |
| **« Meilleure vue en 1024 × 768 »** | relevé sur trois des dix captures | — |

**Deux choses qu'on n'a PAS faites, et c'est la recherche qui le dit :**

1. **Pas de Comic Sans.** Zéro occurrence dans les dix captures. La
   police décorative réelle de l'époque au Québec est la cursive
   Microsoft — `Monotype Corsiva`, relevée chez
   [Nadya coiffure, 29 oct. 2008](https://web.archive.org/web/20081029045648/http://pages.videotron.com/nadya/coiffure).
   **Comic Sans aurait fait une caricature, pas une reconstitution, et
   la différence se voit.** Le brief le demandait ; la preuve dit non.
2. **Les coins arrondis et les dégradés sont écrits en CSS ici**,
   alors qu'en 2011 c'étaient des **images découpées** :
   `border-radius` n'arrive dans Internet Explorer qu'à la **version 9**
   ([mdn/browser-compat-data](https://github.com/mdn/browser-compat-data/blob/main/css/properties/border-radius.json)).
   C'est le seul anachronisme assumé du lot, et il est invisible à
   l'œil : ce qu'on reconstitue est le **rendu**, pas la technique.

### 3.4 L'honnêteté, et elle est structurelle

| Garde-fou | Comment il est tenu |
|---|---|
| **Aucun nom d'entreprise** | les trois s'appellent par leur **métier** — « Garage et mécanique générale », « Restaurant de quartier », « Déneigement résidentiel ». Ce ne sont pas des marques, ce sont des catégories : personne ne les possède, et le relevé Wayback montre qu'une bonne part des vrais sites de PME de l'époque se nommaient exactement comme ça |
| **Étiquette permanente** | « Démonstration · entreprise fictive », dans le **titre** de chaque comparaison, au même poids visuel que le numéro. Jamais au survol, jamais dans un repli |
| **Aucune fausse preuve** | `ba-check § 1` chasse « /5 », « étoiles », « avis client », « note de », « livré en », « client depuis », « témoignage » dans le texte rendu de la section. Relevé : **aucun** |
| **Aucun numéro de téléphone réel** | `000 000-0000` partout |
| **Le chapô le dit avant tout le reste** | « Ce ne sont pas des mandats livrés, et aucune de ces entreprises n'existe » — en gras, dans le chapô, pas en note de bas de page |

### 3.5 Les chiffres

`node tools/ba-check.mjs http://127.0.0.1:8099 [largeur] [thème]`

| Relevé | Valeur |
|---|---|
| comparaisons · vues · boutons de cran · lignes d'écart | 3 · 6 · 6 · **9** |
| **images dans la section** | **0** — tout est en markup |
| mots de fausse preuve | **aucun** |
| **le cran bascule sans JavaScript** | **oui** (voir le défaut ci-dessous) |
| la vue non choisie : éléments focusables dedans | **0** |
| coins arrondis / ombres / dégradés / filtres **hors** de la maquette | **0 / 0 / 0 / 0** |
| les mêmes **dans** la maquette | 17 / 2 / 30 / 2 |
| texte défilant, vue « après » choisie | `paused` |
| texte défilant, mouvement réduit | `none` |
| débordement horizontal du document, 320 → 1920 px | **0 px** à huit largeurs |
| erreurs console | **aucune** |

**Le défaut trouvé par ce relevé, et son correctif.**
`ba-check § 2` a rendu **ÉCHEC** : sans JavaScript, les deux vues
restaient visibles, superposées. Cause : les deux règles `:has()` qui
portent le cran vivent dans `differe.css`, et **`differe.css` est
injecté par JavaScript**. La promesse « ça marche sans script » était
fausse, et seule une sonde qui coupe vraiment le script pouvait le
dire.
→ un bloc `<noscript><style>` de quatre règles dans le `<head>`. C'est
le seul `<noscript>` du site. Déclarer `ba-` critique aurait fait
basculer 330 lignes — dont toute la reconstitution de 2011 — sur le
chemin du premier rendu, pour un contenu qui vit à trois écrans du
haut.

---

## 4 · DÉCISIONS PRISES SANS LE PROPRIÉTAIRE

| # | Décision | Pourquoi celle-là, et ce qui a été écarté |
|---|---|---|
| **E1** | **« Démarrer ce chantier » devient « Démarrer votre projet », PAS « Commencer votre projet en 60 sec »** | Le brief demande le second et pose la question « les deux mènent-ils au même endroit ? ». **Réponse : oui** — les quatre boutons de Services et le CTA primaire du hero ouvrent tous `modal-start`. Donc on harmonise, et on harmonise sur les mots qui existent déjà. **« en 60 sec » ne peut pas s'écrire** : `modal-start` est un choix entre trois portes, dont un formulaire que le site chiffre lui-même « 7 étapes · 4 minutes ». Ce serait un chiffre **contredit par un autre chiffre de la même page**. Et « Estimation en 60 secondes » a été retirée du hero la veille pour exactement ce motif (`CLAUDE.md § 3.3`) : la remettre ici rouvrirait la faussété qu'on venait de fermer. **Si le propriétaire tient au « 60 sec », il faut d'abord qu'un parcours de 60 secondes existe** |
| **E2** | **La piste ne s'active qu'au-delà de 48em et hors mouvement réduit** | `100dvh` change de valeur quand la barre d'adresse d'un téléphone se rétracte : une scène collante d'un écran de haut saute à ce moment-là, et le saut arrive pendant qu'on lit. La référence `PNEU` prend la même décision, à 1024 px. Écarté : faire tourner la piste partout et corriger le saut au script |
| **E3** | **Le rail ne tombe à AUCUN palier** | Il porte l'orientation — « lequel des quatre » — et il coûte **une** transformation composée par image sur **un** élément. Le retirer coûterait plus cher en information qu'il ne rapporte en peinture. Écarté : le faire tomber au palier 1 avec le reste des mouvements |
| **E4** | **Les quatre photographies sortent, et le bouton « Lancer la visite 360 » avec** | Le brief demande le retrait des images ; le bouton, lui, est une décision en propre. La visite se démontre **en entier** en section 05 : deux boutons pour un seul lecteur, c'est une duplication que le visiteur paie en hésitation. La **phrase** qui dit où aller reste |
| **E5** | **Le bloc appât PDF sort de Services** | Demandé par le brief. Les deux guides restent dans le pied de page, qui a déjà ses deux liens |
| **E6** | **Le panneau de détail passe en deux colonnes à 64em** | Il faisait 1 100 px de haut à 1440 : un panneau qui défile à l'intérieur de lui-même dès l'ouverture. Ce qui se **lit** à gauche, ce qui se **compte** à droite. La hauteur tombe sous un écran |
| **E7** | **« Ce que vous recevez » est ajouté aux quatre panneaux** | Demandé par le brief (« des exemples concrets »). Les puces « Compris » disent des **qualités** — « un design à vous », « branché sur ce que vous utilisez déjà ». Celles-ci disent des **objets** qu'on remet le jour de la livraison. Un patron de PME n'achète pas une qualité |
| **E8** | **Trois comparaisons, pas quatre** | Trois secteurs que la clientèle reconnaît immédiatement, et **trois défauts différents du vieux web** : le garage (on ne peut pas appeler), le restaurant (le menu est un PDF), le déneigement (on ne sait pas si on est couvert). Une quatrième répéterait un des trois. Écarté : ajouter l'immobilier, déjà porté par la visite 360 |
| **E9** | **Les trois « après » ne partagent que leur barre et leur échelle** | Chacune met en premier ce que **son** métier a de décisif : le téléphone, le menu de la semaine, la vérification d'adresse. Une quatrième maquette qui reprendrait la même composition en changeant les mots trahirait tout le propos de la section — « il ne doit surtout pas avoir l'air d'une page générée » |
| **E10** | **Le prix « 59.95 $ » de la maquette de 2011 est retiré** | Il est **authentique** (Auto Précision l'affichait deux fois, à l'identique, dans deux encadrés différents). Mais `CLAUDE.md § 5` dit « aucun prix, **nulle part** » — pas « aucun prix à nous » — et `prix-check.mjs` lit le texte **rendu**, sans savoir qu'une maquette est une maquette. Un rabais en pourcent dit la même chose de l'époque sans publier un chiffre en dollars. Le marqueur qui compte — la **contradiction** entre deux encadrés — est conservé |
| **E11** | **La maquette de 2011 est COUPÉE sous 1 440 px, et c'est le propos** | À 1280 elle déborde de 65 px, à 1024 de 8. `deborde.mjs` le signale comme « contenu coupé » : c'est un faux positif au sens du piège 15 — un site de 960 px fixes qui ne rentre pas est exactement le premier des trois écarts annoncés sous le cadre. Le **document**, lui, ne déborde à aucune largeur |
| **E12** | **La démonstration d'ouverture ne joue que sur la première carte, une fois, et jamais sous mouvement réduit** | « La différence se comprend sans lire une explication » est une exigence du brief ; trois cadres à l'arrêt sur leur version de 2011 ne montrent pas un écart, ils montrent trois vieux sites. Mais une démonstration qui se répète n'est plus une démonstration, c'est un tic — et changer l'état d'un contrôle chez quelqu'un qui a demandé **moins** de mouvement ne se défend pas. Rien n'est perdu : les trois lignes disent l'écart en toutes lettres |
| **E13** | **Le code mort des cinq projets est supprimé, pas laissé en place** | `main.js` « cadres de projet » (139 lignes), `motion.js` bloc 7 (57), `langue.js` bloc 6 (26), plus sept règles CSS. Tout sortait proprement sur un sélecteur vide — donc invisible, donc un piège pour la prochaine session. Archivé dans `archives/2026-07-30-projets-images/` |

---

## 5 · CE QUI RESTE OUVERT, ET LES RÉSERVES

1. **Rien n'a été vérifié sur un appareil réel.** Tous les chiffres de
   ce document viennent de Chromium piloté par Playwright sur une
   machine de bureau Windows. La décision **E2** — pas de piste sous
   48em — repose sur un raisonnement (`100dvh` et la barre d'adresse),
   **pas** sur une mesure. C'est la réserve la plus importante du
   chantier.
2. **Le cran avant / après n'a jamais été touché du doigt.** MDN
   avertit explicitement, à propos des widgets de plage, qu'il faut
   *« fully test … using assistive technologies on devices where touch
   is a primary input mechanism »*. On a choisi le patron qui **évite**
   le problème (aucun geste horizontal), mais l'éviter n'est pas
   l'avoir mesuré.
3. **La section 02 fait 2,75 écrans.** C'est plus que la grille qu'elle
   remplace (2,62 le matin) pour montrer autant de chantiers. Le brief
   dit « le défilement ne doit jamais retenir un visiteur pressé » :
   il ne le retient pas — aucune molette n'est détournée, la page
   défile normalement — mais il lui demande **plus de course**. Le
   nombre à tourner si c'est trop long est `--svc-pas`
   (`min(46vh, 430px)`), une seule ligne.
4. **La « photographie » de la maquette de 2011 est dessinée en CSS.**
   Trois aplats et une trame, sursaturés. C'est un pis-aller assumé :
   aucune image du dépôt n'a de licence utilisable ici, et en ajouter
   une casserait la promesse « zéro requête tierce » du chantier.
   Elle lit comme une photo de mauvaise qualité, ce qui est
   période-juste, mais ce n'est pas une photo.
5. **La plaque « 7 · Produits » comptait la vidéo** — réserve héritée
   de `CHANTIER-SERVICES.md § 4.1`. Elle **disparaît avec les
   plaques**, donc le site ne l'affirme plus nulle part. Si le bloc
   revient un jour, la réserve revient avec.
6. **`images/og.png` contredit toujours le site** — « 24 h · Délai de
   réponse » là où le site dit 12 h partout, et le socle du hero le
   redit maintenant en toutes lettres. Aucun outil ne lit le texte
   dans un PNG. Hors périmètre, toujours ouvert.
